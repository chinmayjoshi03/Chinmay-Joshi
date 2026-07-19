/**
 * Raikō (original character, design sheet rev 04) as a procedural 3D chibi rig.
 * Built from primitives with cel shading + ink outlines, so there is no model file to load.
 * Model space: feet at the origin, facing +z, about MODEL_HEIGHT units tall.
 * "P"/"N" = the side on +x / −x (his left / right). The scabbard hangs on P, the sword hand is N.
 */
import * as THREE from "three";
import { COLORS, GLOW, faceTexture, gripTexture, haoriTexture, outlineMaterial, toon, type FaceKind } from "@/three/toon";
import type { MoveName } from "./types";

export const MODEL_HEIGHT = 2.5;
const HIP_Y = 0.62;

export type Pose = {
  hipsY: number; lean: number; twist: number; roll: number;
  headX: number; headY: number; headZ: number;
  armPX: number; armPZ: number; armNX: number; armNZ: number;
  legPX: number; legPZ: number; legNX: number; legNZ: number;
  swordX: number; flare: number; yaw: number;
  /** 0 = scabbard hangs at the hip; 1 = pushed forward and level for a sheathed iai draw. */
  saya: number;
};

const ZERO: Pose = {
  hipsY: 0, lean: 0, twist: 0, roll: 0, headX: 0, headY: 0, headZ: 0,
  armPX: 0, armPZ: 0.12, armNX: 0, armNZ: -0.12,
  legPX: 0, legPZ: 0.06, legNX: 0, legNZ: -0.06, swordX: 0, flare: 0, yaw: 0, saya: 0,
};

/** Joint angles (radians) per move. yaw is multiplied by the facing direction. */
export const POSES: Record<MoveName, Pose> = {
  sleep: { ...ZERO, hipsY: -0.42, lean: 0.18, roll: 0.06, headX: 0.5, headZ: 0.28, armPX: -0.6, armPZ: -0.25, armNX: -0.6, armNZ: 0.25, legPX: -1.6, legPZ: 0.4, legNX: -1.6, legNZ: -0.4, yaw: -0.35 },
  // calm: relaxed and a little shy, head tipped down, hands loose; the katana stays sheathed at his hip under the haori
  ready: { ...ZERO, lean: 0.03, headX: 0.18, headZ: 0.05, armPX: -0.12, armPZ: 0.16, armNX: -0.2, armNZ: -0.14, legPZ: 0.07, legNZ: -0.07, flare: 0.05, yaw: 0.18 },
  strike: { ...ZERO, hipsY: -0.12, lean: 0.95, headX: -0.8, armNX: -2.52, armNZ: -0.08, armPX: 0.7, armPZ: 0.35, legPX: 0.1, legPZ: 0.1, legNX: -1.4, legNZ: -0.1, flare: 1, yaw: 1.35 },
  land: { ...ZERO, hipsY: -0.07, lean: 0.2, twist: 0.25, headX: -0.1, armNX: -2.6, armNZ: -0.6, armPX: -0.3, armPZ: 0.6, legPX: -0.2, legPZ: 0.5, legNX: -0.2, legNZ: -0.5, flare: 0.45, yaw: 0.9 },
  look: { ...ZERO, headX: -0.1, armPZ: 2.5, armNZ: -0.25, armNX: -0.2, flare: 0.1, yaw: 0.3 },
  bow: { ...ZERO, lean: 0.72, headX: 0.05, armPX: -0.72, armNX: -0.72, legPX: -0.72, legNX: -0.72, yaw: 0.5 },
};

/** Hovered: bashful — head tilted down, hands clasped in front, toes turned in. */
export const SHY_POSE: Pose = {
  ...ZERO, lean: -0.04, headX: 0.22, headZ: 0.2,
  armPX: -0.55, armPZ: -0.42, armNX: -0.55, armNZ: 0.42,
  legPZ: -0.04, legNZ: 0.04, yaw: 0.3,
};

/** Still hovered: waving hello beside his cheek with the free (P) hand, the other hand at the chest. */
export const WAVE_POSE: Pose = {
  ...ZERO, headX: 0.05, headZ: -0.14, armPX: -2.2, armPZ: 0.75, armNX: -0.75, armNZ: 0.55, yaw: 0.25,
};

/** Picked up by the scruff: arms and legs flail (animated on top of this in the stage). */
export const HANG_POSE: Pose = {
  ...ZERO, headX: -0.15, armPX: -0.3, armPZ: 2.3, armNX: -0.3, armNZ: -2.3, flare: 0.3, yaw: 0,
};

/**
 * Iai stance for the opening's charge-up: bent almost double in a wide, low crouch, head down,
 * katana still sheathed and pushed forward — sword hand on the hilt, the other at the scabbard mouth.
 */
export const RAGE_POSE: Pose = {
  ...ZERO, hipsY: -0.2, lean: 0.62, twist: -0.12, roll: 0.04, headX: 0.26, headY: 0.12,
  armNX: -0.98, armNZ: 0.59, armPX: -0.72, armPZ: -0.58,
  legPX: 0.12, legPZ: 0.3, legNX: -1.62, legNZ: -0.3, flare: 0.2, yaw: 0.95, saya: 1,
};

export type Rig = {
  root: THREE.Group;
  /** Live joint values. Tween these, then call update(). */
  pose: Pose;
  /** Extra head rotation for cursor tracking. */
  look: { yaw: number; pitch: number };
  facing: 1 | -1;
  setFace(kind: FaceKind): void;
  setSword(inHand: boolean): void;
  /** Applies the pose plus breathing, blinking and cloth sway. */
  update(t: number, sleeping?: boolean): void;
  /** Only on ghost rigs: the single additive material, for fading. */
  ghost?: THREE.MeshBasicMaterial;
};

export function buildRaiko(opts: { ghost?: boolean } = {}): Rig {
  const isGhost = !!opts.ghost;
  const ghost = isGhost
    ? new THREE.MeshBasicMaterial({ color: COLORS.volt, ...GLOW, opacity: 0 })
    : undefined;
  const pick = <T extends THREE.Material>(m: T) => (ghost ?? m) as THREE.Material;

  const cloth = isGhost ? null : haoriTexture();
  if (cloth) cloth.repeat.set(3, 1.5);
  const sleeveCloth = cloth?.clone() ?? null;
  if (sleeveCloth) sleeveCloth.repeat.set(2, 1);

  const M = {
    skin: pick(toon(COLORS.skin)),
    hair: pick(toon(COLORS.hair)),
    belt: pick(toon(0x5d5870)),
    metal: pick(toon(0xc9ccd6)),
    sole: pick(toon(0x2a2420)),
    grip: pick(toon(0xffffff, { map: isGhost ? null : gripTexture() })),
    haori: pick(toon(0xffffff, { map: cloth, side: THREE.DoubleSide })),
    sleeve: pick(toon(0xffffff, { map: sleeveCloth })),
    uniform: pick(toon(COLORS.uniform)),
    sash: pick(toon(COLORS.sash)),
    dark: pick(toon(COLORS.dark)),
    volt: pick(new THREE.MeshBasicMaterial({ color: COLORS.volt })),
    blade: pick(new THREE.MeshBasicMaterial({ color: 0xf4fbff })),
    lock: pick(new THREE.MeshBasicMaterial({ color: COLORS.spark })),
    ink: pick(new THREE.MeshBasicMaterial({ color: COLORS.ink })),
  };

  const outlines = new Map<number, THREE.ShaderMaterial>();
  const part = (geo: THREE.BufferGeometry, mat: THREE.Material, outline: number | false = 0.028) => {
    const mesh = new THREE.Mesh(geo, mat);
    if (!isGhost && outline !== false) {
      if (!outlines.has(outline)) outlines.set(outline, outlineMaterial(outline));
      mesh.add(new THREE.Mesh(geo, outlines.get(outline)));
    }
    return mesh;
  };
  const group = (parent: THREE.Object3D, x = 0, y = 0, z = 0) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    parent.add(g);
    return g;
  };

  const root = new THREE.Group();
  const hips = group(root, 0, HIP_Y, 0);

  // ── torso, sash ──
  const torso = part(new THREE.CylinderGeometry(0.27, 0.29, 0.52, 18), M.uniform);
  torso.position.y = 0.26;
  hips.add(torso);
  const collar = part(new THREE.CylinderGeometry(0.15, 0.17, 0.12, 16), M.uniform, 0.018);
  collar.position.y = 0.56;
  hips.add(collar);
  const belt = part(new THREE.CylinderGeometry(0.315, 0.325, 0.13, 20), M.belt, 0.02);
  belt.position.y = 0.06;
  hips.add(belt);
  const buckle = part(new THREE.BoxGeometry(0.15, 0.1, 0.04), M.metal, 0.012);
  buckle.position.set(0, 0.06, 0.33);
  hips.add(buckle);

  // ── haori (open at the front, pivots at the shoulders so it can stream behind) ──
  const coat = group(hips, 0, 0.56, 0);
  const coatGeo = new THREE.CylinderGeometry(0.31, 0.56, 1.02, 40, 6, true, 0.5, Math.PI * 2 - 1.0);
  {
    // soft vertical folds that deepen toward the hem
    const p = coatGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const z = p.getZ(i);
      const down = (0.51 - p.getY(i)) / 1.02;
      const k = 1 + Math.sin(Math.atan2(x, z) * 9) * 0.06 * down;
      p.setX(i, x * k);
      p.setZ(i, z * k);
    }
    coatGeo.computeVertexNormals();
  }
  const coatMesh = part(coatGeo, M.haori, 0.024);
  coatMesh.position.y = -0.47;
  coat.add(coatMesh);

  // ── legs ──
  const makeLeg = (side: 1 | -1) => {
    const leg = group(hips, 0.15 * side, 0, 0);
    const hakamaGeo = new THREE.CylinderGeometry(0.19, 0.25, 0.42, 20, 3);
    {
      const p = hakamaGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i);
        const z = p.getZ(i);
        const k = 1 + Math.sin(Math.atan2(x, z) * 6) * 0.07;
        p.setX(i, x * k);
        p.setZ(i, z * k);
      }
      hakamaGeo.computeVertexNormals();
    }
    const thigh = part(hakamaGeo, M.uniform);
    thigh.position.y = -0.21;
    const wrap = part(new THREE.CylinderGeometry(0.13, 0.12, 0.12, 12), M.sleeve, 0.02);
    wrap.position.y = -0.46;
    const sock = part(new THREE.SphereGeometry(0.13, 14, 10), M.sash, 0.02);
    sock.scale.set(0.85, 0.6, 1.3);
    sock.position.set(0, -0.53, 0.06);
    const sole = part(new THREE.CylinderGeometry(0.13, 0.13, 0.05, 16), M.sole, 0.016);
    sole.scale.set(0.85, 1, 1.55);
    sole.position.set(0, -0.6, 0.06);
    const strap = part(new THREE.TorusGeometry(0.1, 0.018, 6, 14, Math.PI), M.sole, false);
    strap.position.set(0, -0.56, 0.12);
    leg.add(thigh, wrap, sock, sole, strap);
    return leg;
  };
  const legP = makeLeg(1);
  const legN = makeLeg(-1);

  // ── arms: wide sleeve + hand ──
  const makeArm = (side: 1 | -1) => {
    const arm = group(hips, 0.32 * side, 0.43, 0);
    const shoulder = part(new THREE.SphereGeometry(0.17, 14, 10), M.sleeve, 0.022);
    const sleeve = part(new THREE.CylinderGeometry(0.12, 0.25, 0.56, 16), M.sleeve, 0.024);
    sleeve.position.y = -0.28;
    const hand = part(new THREE.SphereGeometry(0.1, 12, 10), M.skin, 0.022);
    hand.position.y = -0.6;
    arm.add(shoulder, sleeve, hand);
    return arm;
  };
  const armP = makeArm(1);
  const armN = makeArm(-1);

  // ── scabbard on the P hip, with the sheathed hilt ──
  const scabbard = group(hips, 0.31, 0.08, 0.02);
  scabbard.rotation.set(1.15, 0, -0.12);
  const sheath = part(new THREE.CylinderGeometry(0.042, 0.036, 0.95, 10), M.dark, 0.018);
  sheath.position.y = -0.3;
  scabbard.add(sheath);
  const makeHilt = () => {
    const g = new THREE.Group();
    const grip = part(new THREE.CylinderGeometry(0.04, 0.04, 0.3, 10), M.grip, 0.018);
    const band = part(new THREE.CylinderGeometry(0.046, 0.046, 0.05, 10), M.volt, false);
    band.position.y = 0.13;
    const guard = part(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 14), M.volt, 0.018);
    guard.position.y = -0.165;
    g.add(grip, band, guard);
    return g;
  };
  const sheathedHilt = makeHilt();
  sheathedHilt.position.y = 0.36;
  scabbard.add(sheathedHilt);

  // ── drawn sword in the N hand (continues the arm when swordX = 0) ──
  const sword = group(armN, 0, -0.62, 0);
  const drawn = makeHilt();
  const blade = part(new THREE.CylinderGeometry(0.034, 0.008, 1.0, 6), M.blade, 0.014);
  blade.scale.z = 0.32;
  blade.position.y = -0.68;
  sword.add(drawn, blade);
  if (!isGhost) {
    const glow = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.03, 1.06, 8),
      new THREE.MeshBasicMaterial({ color: COLORS.volt, ...GLOW, opacity: 0.28 }),
    );
    glow.scale.z = 0.5;
    glow.position.y = -0.68;
    sword.add(glow);
  }
  sword.visible = false;

  // ── head ──
  const head = group(hips, 0, 0.56, 0);
  const skull = group(head, 0, 0.46, 0);
  skull.scale.set(1, 0.93, 0.96);
  skull.add(part(new THREE.SphereGeometry(0.6, 32, 24), M.skin));

  const faces = {} as Record<FaceKind, THREE.Texture>;
  let faceMat: THREE.MeshBasicMaterial | null = null;
  if (!isGhost) {
    (["sleep", "focus", "calm", "blink", "surprise", "happy", "angry", "shy", "panic"] as FaceKind[]).forEach((k) => (faces[k] = faceTexture(k)));
    faceMat = new THREE.MeshBasicMaterial({ map: faces.sleep, transparent: true, depthWrite: false });
    const patch = new THREE.Mesh(new THREE.SphereGeometry(0.606, 28, 18, Math.PI / 2 - 0.95, 1.9, Math.PI / 2 - 0.8, 1.6), faceMat);
    patch.renderOrder = 2;
    skull.add(patch);
  }

  // hair, anime-chibi style: one smooth rounded mass, then a few large clean clumps —
  // a fringe over the forehead, pointed tips around the hem, side locks, flicks at the crown, a cowlick,
  // and the white-blue lightning lock that makes it his
  const hair = group(head, 0, 0.46, 0);
  const cap = part(new THREE.SphereGeometry(0.65, 32, 20, 0, Math.PI * 2, 0, 1.8), M.hair);
  cap.rotation.x = -0.6;
  cap.scale.set(1.04, 1, 1.02);
  hair.add(cap);

  const dirOf = (a: number, b: number) => new THREE.Vector3(Math.sin(a) * Math.sin(b), Math.cos(a), Math.sin(a) * Math.cos(b));
  const up = new THREE.Vector3(0, 1, 0);
  const down = new THREE.Vector3(0, -1, 0);
  const back = new THREE.Vector3(0, 0, -1);
  /** Direction along the head surface toward `toward`, lifted off it by `lift`. */
  const along = (nrm: THREE.Vector3, toward: THREE.Vector3, lift: number) => {
    const t = toward.clone().addScaledVector(nrm, -toward.dot(nrm));
    if (t.lengthSq() < 1e-4) t.copy(back);
    return t.normalize().addScaledVector(nrm, lift).normalize();
  };
  /**
