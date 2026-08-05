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
