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
    this.rig.setSword(true);
    this.to(POSES.strike, 0.07, "power3.out");

    const lift = this.scale * 0.9;
    fx.flash.emit(big ? 1 : 0.75);
    fx.bolt.emit({ from: { x: from.x, y: from.y - lift }, to: { x: to.x, y: to.y - lift }, width: 6 * k, rough: 46 * k });
    fx.thunder.emit(1);
    fx.shake.emit(big ? 18 : 6);
    gsap.fromTo(this.flashLight, { intensity: 5 * k }, { intensity: 0, duration: 0.5 * k, ease: "power2.out" });
    this.sparks.burst(this.chest(), 26 * k, 520 * k, new THREE.Vector3(-dir, 0.3, 0), 0.8);
    this.pulses.ring(this.world(from), this.scale * 2.2 * k);

    // the dash arcs toward the viewer, so he swells and foreshortens mid-flight
    const arc = Math.min(260, Math.hypot(to.x - from.x, to.y - from.y) * 0.35);
    this.ghosts.forEach((g, i) => {
      const t = 0.22 + i * 0.24;
      g.facing = dir;
      g.root.visible = true;
      g.root.scale.setScalar(this.scale);
      g.root.position.copy(this.world({ x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t })).setZ(Math.sin(Math.PI * t) * arc);
      g.update(0);
      gsap.fromTo(g.ghost!, { opacity: (0.5 - i * 0.1) * (big ? 1.6 : 1) }, { opacity: 0, duration: 0.6, delay: 0.05 + i * 0.05, ease: "power2.out", onComplete: () => void (g.root.visible = false) });
    });

    const dur = MOVE_MS.strike / 1000;
    gsap.fromTo(this.off, { z: 0 }, { z: arc, duration: dur / 2, ease: "sine.out", yoyo: true, repeat: 1 });
    await new Promise<void>((resolve) => {
      gsap.to(this.pos, { x: to.x, y: to.y, duration: dur, ease: "expo.inOut", onComplete: resolve });
    });

    const chest = this.chest();
    this.pulses.slash(chest, this.scale * 2.4 * k * (big ? 1.4 : 1), dir);
    this.sparks.burst(chest, 40 * k * k, 700 * k, new THREE.Vector3(dir, 0.35, 0.2), 0.7);
    if (big) this.pulses.ring(this.world(to), this.scale * 6, COLORS.spark, 0.7);
  }

  async land() {
    this.move = "land";
    this.to(POSES.land, 0.14, "back.out(2.5)");
    gsap.fromTo(this.off, { squash: 0.8 }, { squash: 1, duration: 0.35, ease: "elastic.out(1, 0.45)" });
    const feet = this.world(this.pos);
    this.pulses.ring(feet, this.scale * 3.4);
    this.pulses.ring(feet, this.scale * 2.1, COLORS.spark, 0.4);
    this.sparks.burst(feet, 34, 620, new THREE.Vector3(0, 1, 0), 0.9);
    await wait(MOVE_MS.land);
  }

  look(at: Point) {
    if (this.move === "strike" || this.move === "bow") return;
    this.stopWalk();
    this.rig.facing = at.x >= this.pos.x ? 1 : -1;
    if (this.move === "look") return; // already bashful
    this.move = "look";
    this.waving = false;
    this.rig.setFace("shy");
    this.rig.setSword(false);
    this.to(SHY_POSE, 0.4, "power2.out");
    gsap.fromTo(this.off, { hop: 0 }, { hop: this.scale * 0.12, duration: 0.12, ease: "power2.out", yoyo: true, repeat: 1 });
  }

  wave() {
    if (this.move !== "look" || this.waving) return;
    this.waving = true;
    this.rig.setFace("happy");
    this.to(WAVE_POSE, 0.3, "back.out(2)");
    gsap.fromTo(this.hi.scale, { x: 0.01, y: 0.01 }, { x: this.scale * 1.1, y: this.scale * 1.1, duration: 0.35, ease: "back.out(3)" });
    this.sparks.burst(this.world({ x: this.pos.x + this.scale * 0.8 * this.rig.facing, y: this.pos.y - this.scale * 2.2 }), 10, 260);
  }

  grab(at: Point) {
    this.stopWalk();
    gsap.killTweensOf([this.pos, this.off, this.hang]);
    Object.assign(this.off, { z: 0, hop: 0, squash: 1 });
    this.hidden = false;
    this.waving = false;
    this.move = "strike"; // no cursor tracking / hover reactions while held
    this.rig.setFace("panic");
    this.rig.setSword(false);
    this.to(HANG_POSE, 0.15, "power2.out");
    const pivot = this.world(at);
    const feet = this.world(this.pos);
    const h = this.hang;
    h.on = true;
    h.pivot.copy(pivot);
    // start swinging from wherever his feet were relative to the hand
    h.theta = THREE.MathUtils.clamp(Math.atan2(feet.x - pivot.x, pivot.y - feet.y), -1.2, 1.2);
    h.omega = 0;
    h.lastX = pivot.x;
    h.lastV = 0;
    h.acc = 0;
    h.since = this.clock;
    h.nextWriggle = this.clock + 0.35;
    this.sparks.burst(pivot, 12, 300);
    fx.thunder.emit(0.25);
  }

  drag(at: Point) {
    if (this.hang.on) this.hang.pivot.copy(this.world(at));
  }

  async drop(floor: Point) {
    const h = this.hang;
    if (!h.on) return;
    h.on = false;
    const fallPx = floor.y - this.pos.y;
    const t = fallPx > 0 ? Math.max(0.14, Math.sqrt((2 * fallPx) / 2600)) : 0.14;
    gsap.to(h, { theta: 0, omega: 0, duration: t, ease: "power2.out" });
    gsap.to(this.rig.pose, { armPZ: 2.6, armNZ: -2.6, legPX: -0.3, legNX: -0.3, duration: t * 0.5 });
    await new Promise<void>((resolve) => {
      gsap.to(this.pos, { x: floor.x, y: floor.y, duration: t, ease: "power2.in", onComplete: resolve });
    });
    // thud
    const feet = this.world(this.pos);
    this.rig.setFace("surprise");
    this.to(POSES.land, 0.1, "back.out(2.5)");
    gsap.fromTo(this.off, { squash: 0.62 }, { squash: 1, duration: 0.55, ease: "elastic.out(1, 0.35)" });
    this.pulses.ring(feet, this.scale * (2 + Math.min(2, fallPx / 300)));
    this.sparks.burst(feet, 20 + Math.min(30, fallPx / 15), 520, new THREE.Vector3(0, 1, 0), 0.9);
    fx.shake.emit(Math.min(8, 2 + fallPx / 120));
    fx.sfx.emit({ name: "drop-thud", volume: Math.min(1, 0.45 + fallPx / 600) });
    await wait(320);
    // shakes it off
    this.rig.setFace("blink");
    gsap.fromTo(this.rig.pose, { headY: -0.5 }, { headY: 0, duration: 0.45, ease: "elastic.out(1.2, 0.3)" });
    await wait(260);
  }

  async bow() {
    this.stopWalk();
    this.move = "bow";
    this.rig.setFace("happy");
    this.rig.setSword(false);
    this.to(POSES.bow, 0.35, "power3.out");
    // "Thank you!" pops up over his head, like "Hii!"
    this.thanksUntil = this.clock + 2.6;
    const s = this.scale * 1.1;
    gsap.fromTo(this.thanks.scale, { x: 0.01, y: 0.01 }, { x: s * (THANKS_W / 128), y: s, duration: 0.4, ease: "back.out(3)" });
    this.sparks.burst(this.world({ x: this.pos.x, y: this.pos.y - this.scale * 2.4 }), 12, 280);
    await wait(MOVE_MS.bow);
  }

  /** Skip back to a point (feet). The hops/legs are animated in frame(). */
  walk(to: Point) {
    this.stopWalk();
    if (this.move === "sleep" || Math.hypot(to.x - this.pos.x, to.y - this.pos.y) < 4) return Promise.resolve();
    this.move = "ready";
    this.rig.setFace("happy");
    this.rig.setSword(false);
    if (Math.abs(to.x - this.pos.x) > 2) this.rig.facing = to.x >= this.pos.x ? 1 : -1;
    this.to({ ...POSES.ready, headX: 0.04, yaw: 0.55 }, 0.25, "power2.out");
    return new Promise<void>((resolve) => {
      this.walking = { to: { ...to }, resolve };
    });
  }

  private stopWalk() {
    const w = this.walking;
    if (!w) return;
    this.walking = null;
    this.off.hop = 0;
    this.off.squash = 1;
    w.resolve();
  }

  // ── internals ──
  private to(pose: Pose, duration: number, ease: string) {
    gsap.to(this.rig.pose, { ...pose, duration, ease, overwrite: true });
  }

  private world(p: Point) {
    return new THREE.Vector3(p.x - this.W / 2, this.H / 2 - p.y, 0);
  }

  private chest() {
    return this.rig.root.position.clone().add(new THREE.Vector3(0, this.scale * 0.9, 0));
  }

  /** Pendulum: he hangs from the grab point; moving the hand swings him, wriggling kicks the swing. */
  private swing(time: number, dt: number) {
    const h = this.hang;
    const L = this.scale * 1.2; // scruff of the neck → feet
    const v = (h.pivot.x - h.lastX) / Math.max(dt, 0.001);
    const a = (v - h.lastV) / Math.max(dt, 0.001);
    h.lastX = h.pivot.x;
    h.lastV = v;
    h.acc += (THREE.MathUtils.clamp(a, -60000, 60000) - h.acc) * 0.5;
    const g = 2600;
    const alpha = -(g / L) * Math.sin(h.theta) - (h.acc / L) * Math.cos(h.theta) - 2.6 * h.omega;
    // trying to escape: a hard wriggle every so often, more desperate the longer he is held
    if (time > h.nextWriggle) {
      const desperate = Math.min(1, (time - h.since) / 3);
      h.nextWriggle = time + 0.45 + Math.random() * (0.9 - desperate * 0.4);
      h.omega += (Math.random() < 0.5 ? -1 : 1) * (2.5 + desperate * 3.5);
      gsap.fromTo(this.off, { squash: 0.86 }, { squash: 1, duration: 0.3, ease: "elastic.out(1, 0.4)" });
      const c = this.chest();
      const r = () => (Math.random() - 0.5) * this.scale * 1.8;
      this.bolts.add(c.clone().add(new THREE.Vector3(r(), r(), 0)), c.clone().add(new THREE.Vector3(r(), r(), 0)), 2, 14, 20);
      this.sparks.burst(c, 6 + Math.round(desperate * 10), 380);
    }
    h.omega = THREE.MathUtils.clamp(h.omega + alpha * dt, -14, 14);
    h.theta = THREE.MathUtils.clamp(h.theta + h.omega * dt, -1.35, 1.35);
    // feet hang below the hand, along the swing
    this.pos = { x: h.pivot.x + L * Math.sin(h.theta) + this.W / 2, y: this.H / 2 - (h.pivot.y - L * Math.cos(h.theta)) };
  }

  /** Limbs while held: arms paddle, legs bicycle-kick, head shakes "no no no". */
  private flail(time: number, h: RaikoStage["hang"]) {
    const p = this.rig.pose;
    const k = 1 + Math.min(1, (time - h.since) / 3) * 0.5;
    p.armPZ = HANG_POSE.armPZ + Math.sin(time * 13) * 0.45 * k;
    p.armNZ = HANG_POSE.armNZ + Math.sin(time * 13 + 1.7) * 0.45 * k;
    p.armPX = HANG_POSE.armPX + Math.sin(time * 9) * 0.5;
    p.armNX = HANG_POSE.armNX + Math.sin(time * 9 + 2) * 0.5;
    p.legPX = Math.sin(time * 15) * 0.9 * k;
    p.legNX = Math.sin(time * 15 + Math.PI) * 0.9 * k;
    p.headY = Math.sin(time * 8) * 0.45;
    p.headZ = Math.sin(time * 5) * 0.12;
    p.flare = Math.min(1, 0.3 + Math.abs(h.omega) * 0.12);
  }

  private resize() {
    this.W = window.innerWidth;
    this.H = window.innerHeight;
    this.renderer.setSize(this.W, this.H, false);
    this.camera.aspect = this.W / this.H;
    // distance at which one world unit on z=0 is exactly one CSS pixel
    this.camera.position.set(0, 0, this.H / 2 / Math.tan(THREE.MathUtils.degToRad(FOV / 2)));
    this.camera.updateProjectionMatrix();
    const height = Math.min(210, Math.max(118, this.W * 0.13));
    this.scale = height / MODEL_HEIGHT;
    this.bolts.setResolution(this.W, this.H);
  }

  private frame = (time: number, deltaMs: number) => {
    if (document.hidden) return;
    const dt = Math.min(0.05, deltaMs / 1000);
    const { rig, scale } = this;
    const asleep = this.move === "sleep";

    this.clock = time;
    const h = this.hang;
    if (h.on) this.swing(time, dt);

    // happy skipping: a springy hop every step, legs kick, arms swing high, head bobs side to side
    const w = this.walking;
    if (w) {
      const step = scale * 2.6 * dt;
      const dx = w.to.x - this.pos.x;
      const dy = w.to.y - this.pos.y;
      const left = Math.hypot(dx, dy);
      const phase = time * 7.5; // ~2.4 hops a second
      const s = Math.sin(phase);
      const air = Math.abs(s);
      const p = rig.pose;
      p.legPX = s * 0.65;
      p.legNX = -s * 0.65;
      p.armPX = -0.25 - s * 0.95;
      p.armNX = -0.25 + s * 0.95;
      p.armPZ = 0.35 + air * 0.25;
      p.armNZ = -0.35 - air * 0.25;
      p.headZ = Math.sin(phase * 0.5) * 0.14;
      p.lean = -0.06;
      p.flare = 0.15 + air * 0.25;
      this.off.hop = air * scale * 0.34;
      this.off.squash = 0.88 + 0.12 * Math.min(1, air * 3); // a little squish each time he lands
      if (left <= step) {
        this.pos = { ...w.to };
        this.off.hop = 0;
        this.off.squash = 1;
        this.walking = null;
        this.rig.setFace("calm");
        this.to(POSES.ready, 0.3, "power2.out");
        w.resolve();
      } else {
        this.pos.x += (dx / left) * step;
        this.pos.y += (dy / left) * step;
      }
    }

    const feet = this.world(this.pos);
    rig.root.position.set(feet.x, feet.y + this.off.hop, this.off.z);
    rig.root.visible = this.shadow.visible = !this.hidden;
    if (h.on) this.shadow.visible = false;

    // charge-up: tremble, streaming coat, orange aura, constant crackle and rising embers
    const fury = this.hidden ? 0 : this.fury.k;
    if (fury > 0.01) {
      rig.root.position.x += (Math.random() - 0.5) * 7 * fury;
      rig.root.position.y += (Math.random() - 0.5) * 4 * fury;
      rig.pose.flare = Math.max(rig.pose.flare, 0.75 * fury + Math.sin(time * 40) * 0.08);
      this.flashLight.intensity = Math.max(this.flashLight.intensity, 3 * fury * (0.7 + 0.3 * Math.sin(time * 37)));
      if (time > this.furyAt) {
        this.furyAt = time + 0.05 + (1 - fury) * 0.15;
        const c = this.chest();
        const r = () => (Math.random() - 0.5) * scale * 2.6;
        const a = c.clone().add(new THREE.Vector3(r(), r(), r() * 0.4));
        this.bolts.add(a, a.clone().add(new THREE.Vector3(r() * 0.7, r() * 0.7, 0)), 2.4, 16, 26);
        this.sparks.burst(new THREE.Vector3(feet.x + r() * 0.6, feet.y + 4, 20), 5, 520, new THREE.Vector3(0, 1, 0), 0.35);
      }
    }
    this.aura.position.set(feet.x, feet.y + scale * 1.1, -90);
    this.aura.scale.setScalar(scale * (3.4 + Math.sin(time * 26) * 0.35) * Math.max(fury, 0.001));
    this.aura.material.opacity = 0.6 * fury;
