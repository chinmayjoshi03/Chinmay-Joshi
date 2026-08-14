/**
 * The WebGL stage for the 3D Raikō and the effects attached to his moves
 * (sparks, shockwaves, slash arcs, afterimages, static crackle, "Z z" and "!?" glyphs).
 * Page-wide lightning (the strike bolt, sky bolts, name arcs) stays on the 2D canvas in LightningLayer.
 *
 * World space = CSS pixels on the z=0 plane, origin at the viewport centre, y up.
 * The camera is a real perspective camera, so anything that leaves z=0 (the dash arcs
 * toward the viewer, bolts wander in depth) gets true parallax and foreshortening.
 */
import * as THREE from "three";
import gsap from "gsap";
import { buildRaiko, HANG_POSE, MODEL_HEIGHT, POSES, RAGE_POSE, SHY_POSE, WAVE_POSE, type Pose, type Rig } from "./raikoRig";
import type { CharacterSlot, MoveName, Point } from "./types";
import { MOVE_MS } from "./types";
import { Bolts, Pulses, Sparks } from "@/three/fx3d";
import { COLORS, GLOW, dotTexture, shadowTexture, textTexture } from "@/three/toon";
import { fx } from "@/lib/fx";

const FOV = 35;
const THANKS_W = 320; // "Thank you!" caption canvas width (128 tall)
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export class RaikoStage implements CharacterSlot {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(FOV, 1, 10, 10000);
  private rig: Rig;
  private ghosts: Rig[];
  private bolts = new Bolts();
  private sparks = new Sparks();
  private pulses = new Pulses();
  private flashLight = new THREE.PointLight(COLORS.volt, 0, 0, 0);
  private shadow: THREE.Mesh;
  private zs: THREE.Sprite[];
  private hi: THREE.Sprite;
  /** "Thank you!" over his head when he bows; shown until clock passes thanksUntil */
  private thanks: THREE.Sprite;
  private thanksUntil = 0;
  private yelp: THREE.Sprite;
  /** dragging: pendulum hanging from the grab point (world px). theta = swing angle, omega = its rate */
  private hang = { on: false, pivot: new THREE.Vector3(), theta: 0, omega: 0, lastX: 0, lastV: 0, acc: 0, since: 0, nextWriggle: 0 };
  private clock = 0;
  private waving = false;
  /** skipping back home after being dropped */
  private walking: { to: Point; resolve: () => void } | null = null;

  private W = 1;
  private H = 1;
  private scale = 60;
  private pos: Point = { x: -999, y: -999 };
  /** depth (toward camera) and hop (up) offsets in px, tweened during moves */
  private off = { z: 0, hop: 0, squash: 1 };
  private move: MoveName = "sleep";
  private pointer = { x: 0, y: 0, at: -1e9 };
  /** opening sequence: hidden while "too fast to see"; fury 0..1 drives the charge-up aura */
  private hidden = false;
  private fury = { k: 0 };
  private furyAt = 0;
  private aura: THREE.Sprite;
  private disposers: (() => void)[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x554466, 1.5));
    const sun = new THREE.DirectionalLight(0xffffff, 1.9);
    sun.position.set(-0.6, 1, 0.9);
    this.scene.add(sun, this.flashLight);

    this.shadow = new THREE.Mesh(
      new THREE.CircleGeometry(1, 32),
      new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false }),
    );
    this.shadow.rotation.x = -Math.PI / 2 + 0.38;
    this.scene.add(this.shadow);

    this.ghosts = [0, 1, 2].map(() => {
      const g = buildRaiko({ ghost: true });
      Object.assign(g.pose, POSES.strike);
      g.setSword(true);
      g.root.visible = false;
      this.scene.add(g.root);
      return g;
    });

    this.aura = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTexture(), color: 0xff9a1c, ...GLOW, opacity: 0 }));
    this.scene.add(this.aura);

    this.rig = buildRaiko();
    this.scene.add(this.rig.root);

    const zTex = textTexture("Z");
    this.zs = [0, 1, 2].map(() => {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: zTex, transparent: true, opacity: 0, depthTest: false }));
      this.scene.add(s);
      return s;
    });
    this.hi = new THREE.Sprite(new THREE.SpriteMaterial({ map: textTexture("Hii!", 46), transparent: true, opacity: 0, depthTest: false }));
    this.scene.add(this.hi);
    this.thanks = new THREE.Sprite(new THREE.SpriteMaterial({ map: textTexture("Thank you!", 46, THANKS_W), transparent: true, opacity: 0, depthTest: false }));
    this.scene.add(this.thanks);
    this.yelp = new THREE.Sprite(new THREE.SpriteMaterial({ map: textTexture("!!", 70), transparent: true, opacity: 0, depthTest: false }));
    this.scene.add(this.yelp);

    this.scene.add(this.pulses.group, this.bolts.group, this.sparks.points);

    this.resize();
    const onResize = () => this.resize();
    const onMove = (e: PointerEvent) => {
      this.pointer = { x: e.clientX, y: e.clientY, at: performance.now() };
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onMove, { passive: true });
    gsap.ticker.add(this.frame);
    this.disposers.push(
      () => window.removeEventListener("resize", onResize),
      () => window.removeEventListener("pointermove", onMove),
      () => gsap.ticker.remove(this.frame),
    );
  }

  dispose() {
    this.disposers.forEach((d) => d());
    gsap.killTweensOf([this.rig.pose, this.pos, this.off, this.flashLight, this.fury]);
    this.renderer.dispose();
  }

  // ── CharacterSlot ──
  get state() {
    return this.move;
  }
  get position() {
    return { ...this.pos };
  }

  place(at: Point) {
    this.stopWalk();
    gsap.killTweensOf(this.pos);
    this.pos = { ...at };
  }

  sleep() {
    this.stopWalk();
    this.move = "sleep";
    this.rig.setFace("sleep");
    this.rig.setSword(false);
    this.to(POSES.sleep, 0.7, "power2.inOut");
  }

  async ready() {
    const waking = this.move === "sleep";
    this.stopWalk();
    this.move = "ready";
    this.rig.setFace("calm");
    this.rig.setSword(false); // calm: the katana stays sheathed at his hip
    this.to(POSES.ready, MOVE_MS.ready / 1000, "back.out(2.2)");
    if (waking) {
      // startled hop with a crackle of static
      gsap.fromTo(this.off, { hop: 0 }, { hop: this.scale * 0.5, duration: 0.15, ease: "power2.out", yoyo: true, repeat: 1 });
      this.sparks.burst(this.chest(), 14, 320);
    }
    await wait(MOVE_MS.ready);
  }

  strike(to: Point) {
    return this.dash(to, false);
  }

  vanish(hidden: boolean) {
    this.hidden = hidden;
    if (!hidden) {
      this.pulses.ring(this.world(this.pos), this.scale * 2.6);
      this.sparks.burst(this.chest(), 30, 520);
    }
  }

  afterimage(at: Point, dir: 1 | -1) {
    const g = this.ghosts.find((x) => !x.root.visible) ?? this.ghosts[0];
    gsap.killTweensOf(g.ghost!);
    g.facing = dir;
    g.root.visible = true;
    g.root.scale.setScalar(this.scale);
    g.root.position.copy(this.world(at));
    g.update(0);
    gsap.fromTo(g.ghost!, { opacity: 0.75 }, { opacity: 0, duration: 0.32, ease: "power2.out", onComplete: () => void (g.root.visible = false) });
    this.sparks.burst(this.world({ x: at.x, y: at.y - this.scale * 0.9 }), 8, 420);
  }

  async rage(toward: Point, ms = 1400) {
    this.move = "strike"; // no cursor tracking, no "!?" while charging
    this.rig.facing = toward.x >= this.pos.x ? 1 : -1;
    this.rig.setFace("angry");
    this.rig.setSword(false); // sheathed: the draw happens in bigStrike()
    this.to(RAGE_POSE, 0.25, "power3.out");
    this.flashLight.color.set(0xff8a1c);
    gsap.fromTo(this.off, { squash: 1 }, { squash: 0.9, duration: 0.25, ease: "power2.out" });
    gsap.to(this.fury, { k: 1, duration: (ms / 1000) * 0.75, ease: "power2.in" });
    fx.thunder.emit(0.5);
    await wait(ms);
  }

  async bigStrike(to: Point) {
    gsap.to(this.off, { squash: 1, duration: 0.2 });
    await this.dash(to, true);
    gsap.to(this.fury, { k: 0, duration: 0.6, ease: "power2.out", onComplete: () => void this.flashLight.color.set(COLORS.volt) });
  }

  private async dash(to: Point, big: boolean) {
    const from = { ...this.pos };
    const dir = to.x >= from.x ? 1 : -1;
    const k = big ? 2 : 1;
    this.stopWalk();
    this.rig.facing = dir;
    this.move = "strike";
    this.rig.setFace(big ? "angry" : "focus");
