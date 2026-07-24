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

export function toon(color: number, opts: Partial<THREE.MeshToonMaterialParameters> = {}) {
  return new THREE.MeshToonMaterial({ color, gradientMap: toonGradient(), ...opts });
}

/** Inverted-hull ink outline: back faces pushed out along the normal. */
export function outlineMaterial(thickness = 0.028) {
  return new THREE.ShaderMaterial({
    uniforms: { t: { value: thickness } },
    vertexShader: `uniform float t; void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position + normalize(normal) * t, 1.0); }`,
    fragmentShader: `void main(){ gl_FragColor = vec4(0.05, 0.045, 0.04, 1.0); }`,
    side: THREE.BackSide,
  });
}

function canvas(size: number) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  return [c, c.getContext("2d")!] as const;
}

/** Storm haori cloth: indigo with yellow bolts and white cloud swirls. */
export function haoriTexture() {
  const [c, g] = canvas(256);
  g.fillStyle = "#2c3a63";
  g.fillRect(0, 0, 256, 256);
  const bolt = (x: number, y: number, s: number) => {
    const pts = [[8, 2], [3, 12], [8, 11], [4, 20], [13, 8], [8, 9], [11, 2]];
    g.beginPath();
    pts.forEach(([px, py], i) => (i ? g.lineTo(x + px * s, y + py * s) : g.moveTo(x + px * s, y + py * s)));
    g.closePath();
    g.fillStyle = "#ffd21f";
    g.strokeStyle = "#111";
    g.lineWidth = 3;
    g.lineJoin = "round";
    g.stroke();
    g.fill();
  };
  const cloud = (x: number, y: number, s: number) => {
    g.strokeStyle = "#f3eedd";
    g.lineWidth = 5;
    g.lineCap = "round";
    g.beginPath();
    g.arc(x, y, 9 * s, Math.PI * 0.9, Math.PI * 2.2);
    g.arc(x + 15 * s, y + 3 * s, 7 * s, Math.PI * 1.1, Math.PI * 2.4);
    g.stroke();
  };
  bolt(14, 10, 4.4);
  bolt(142, 132, 4.4);
  cloud(160, 52, 2.1);
  cloud(40, 186, 2.1);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Katana grip: cream wrap crossing over dark diamonds. */
export function gripTexture() {
  const [c, g] = canvas(64);
  g.fillStyle = "#1c1a22";
  g.fillRect(0, 0, 64, 64);
  g.strokeStyle = "#efe6cf";
  g.lineWidth = 9;
  for (const d of [-64, 0, 64]) {
    g.beginPath();
    g.moveTo(d, 0);
    g.lineTo(d + 64, 64);
    g.moveTo(d + 64, 0);
    g.lineTo(d, 64);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1, 4);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export type FaceKind = "sleep" | "focus" | "calm" | "blink" | "surprise" | "happy" | "angry" | "shy" | "panic";

/** Face decal (eyes, brows, mouth, blush) drawn for a curved patch on the head. */
export function faceTexture(kind: FaceKind) {
  const [c, g] = canvas(256);
  const L = 80;
  const R = 176;
  const EY = 138;
  g.lineCap = "round";
  g.lineJoin = "round";

  const blush = () => {
    g.fillStyle = "rgba(255,120,110,.13)";
    for (const x of [L - 28, R + 28]) {
      g.beginPath();
      g.ellipse(x, EY + 42, 14, 6, 0, 0, Math.PI * 2);
      g.fill();
    }
  };
  const arc = (x: number, up: boolean) => {
    g.strokeStyle = "#111";
    g.lineWidth = 8;
    g.beginPath();
    if (up) g.arc(x, EY + 16, 22, Math.PI * 1.15, Math.PI * 1.85);
    else g.arc(x, EY - 12, 22, Math.PI * 0.15, Math.PI * 0.85);
    g.stroke();
  };
  const brow = (x: number, dir: number, tilt: number) => {
    g.strokeStyle = "#5e4705";
    g.lineWidth = 10;
    g.beginPath();
    g.moveTo(x - 22 * dir, EY - 50 - tilt * 0.7);
    g.lineTo(x + 20 * dir, EY - 50 + tilt * 0.7);
    g.stroke();
  };
  /** lookY moves the iris down (shy, looking at the ground); droop lowers the lid's outer corner. */
