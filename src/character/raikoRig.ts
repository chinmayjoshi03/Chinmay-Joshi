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
