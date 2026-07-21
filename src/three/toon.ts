/** Cel-shading helpers and hand-drawn canvas textures shared by the 3D mascot and effects. */
import * as THREE from "three";

export const COLORS = {
  ink: 0x111111,
  volt: 0xffd21f,
  spark: 0xeaf6ff,
  hair: 0xffd84a,
  skin: 0xfde3cc,
  storm: 0x2c3a63,
  uniform: 0x23232c,
  sash: 0xf3eedd,
  dark: 0x16161c,
};

/**
 * Additive blending that leaves the canvas alpha untouched. On a transparent canvas the stock
 * AdditiveBlending raises alpha, which shows up as dark smudges over the page behind it.
 */
export const GLOW = {
  transparent: true,
  depthWrite: false,
  blending: THREE.CustomBlending,
  blendSrc: THREE.SrcAlphaFactor,
  blendDst: THREE.OneFactor,
  blendSrcAlpha: THREE.ZeroFactor,
  blendDstAlpha: THREE.OneFactor,
} as const;

let gradient: THREE.DataTexture | null = null;
/** Three hard light bands. */
export function toonGradient() {
  if (gradient) return gradient;
  gradient = new THREE.DataTexture(new Uint8Array([120, 190, 255]), 3, 1, THREE.RedFormat);
  gradient.minFilter = gradient.magFilter = THREE.NearestFilter;
  gradient.needsUpdate = true;
  return gradient;
}

