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
