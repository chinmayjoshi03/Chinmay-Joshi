/** Reusable 3D effects: forked lightning, spark bursts, shockwave rings, slash arcs. */
import * as THREE from "three";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { COLORS, GLOW, dotTexture } from "./toon";

type V3 = THREE.Vector3;

/** Jagged path between two points, displaced in all three axes. */
function jag(from: V3, to: V3, rough: number, segs: number) {
  const pts: V3[] = [from.clone()];
  const dir = to.clone().sub(from);
  const side = new THREE.Vector3(-dir.y, dir.x, 0).normalize();
  for (let i = 1; i < segs; i++) {
    const t = i / segs;
    const k = Math.sin(Math.PI * t) * 2 * rough;
    pts.push(
      from.clone().addScaledVector(dir, t).addScaledVector(side, (Math.random() - 0.5) * k).add(new THREE.Vector3(0, 0, (Math.random() - 0.5) * k)),
    );
  }
  pts.push(to.clone());
  return pts;
}

const toSegments = (paths: V3[][]) => {
  const out: number[] = [];
  for (const p of paths) for (let i = 0; i < p.length - 1; i++) out.push(p[i].x, p[i].y, p[i].z, p[i + 1].x, p[i + 1].y, p[i + 1].z);
  return out;
};

type Bolt = { lines: LineSegments2[]; mats: LineMaterial[]; base: number[]; life: number };

/** Forked lightning drawn as fat screen-space lines: wide glow, body, white core. */
export class Bolts {
  readonly group = new THREE.Group();
  private bolts: Bolt[] = [];
  private res = new THREE.Vector2(1, 1);

  setResolution(w: number, h: number) {
    this.res.set(w, h);
    this.bolts.forEach((b) => b.mats.forEach((m) => m.resolution.copy(this.res)));
  }

  /** width in CSS px; fork = how far branches reach, in world units. */
  add(from: V3, to: V3, width = 4, rough = 40, fork = 100) {
    const main = jag(from, to, rough, 16);
    const branches: V3[][] = [];
    for (let i = 3; i < main.length - 3; i += 4) {
      if (Math.random() < 0.5) continue;
      const end = main[i].clone().add(new THREE.Vector3((Math.random() - 0.5) * fork * 1.2, -(0.4 + Math.random() * 0.6) * fork, (Math.random() - 0.5) * fork));
      branches.push(jag(main[i], end, rough * 0.5, 6));
    }
    const bolt: Bolt = { lines: [], mats: [], base: [], life: 1 };
    const layer = (paths: V3[][], w: number, color: number, opacity: number) => {
      if (!paths.length) return;
      const geo = new LineSegmentsGeometry().setPositions(toSegments(paths));
      const mat = new LineMaterial({ color, linewidth: w, ...GLOW, opacity, depthTest: false });
      mat.resolution.copy(this.res);
      const line = new LineSegments2(geo, mat);
      line.frustumCulled = false;
      this.group.add(line);
      bolt.lines.push(line);
      bolt.mats.push(mat);
      bolt.base.push(opacity);
    };
    for (const [paths, k] of [[[main], 1], [branches, 0.45]] as [V3[][], number][]) {
