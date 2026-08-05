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
      layer(paths, width * 3.2 * k, COLORS.volt, 0.22);
      layer(paths, width * k, COLORS.volt, 0.95);
      layer(paths, Math.max(1, (width / 2.6) * k), COLORS.spark, 1);
    }
    this.bolts.push(bolt);
  }

  update(dt: number) {
    for (const b of this.bolts) {
      b.life -= dt * 2.8;
      const flicker = Math.random() < 0.25 ? 0.55 : 1;
      b.mats.forEach((m, i) => (m.opacity = Math.max(0, b.life) * b.base[i] * flicker));
      if (b.life <= 0) {
        b.lines.forEach((l) => {
          this.group.remove(l);
          l.geometry.dispose();
        });
        b.mats.forEach((m) => m.dispose());
      }
    }
    this.bolts = this.bolts.filter((b) => b.life > 0);
  }
}

/** Pooled additive spark particles with gravity. */
export class Sparks {
  readonly points: THREE.Points;
  private pos: Float32Array;
  private col: Float32Array;
  private vel: Float32Array;
  private life: Float32Array;
  private max: Float32Array;
  private next = 0;
  private tint = new THREE.Color();

  constructor(private count = 360, size = 22) {
    this.pos = new Float32Array(count * 3);
    this.col = new Float32Array(count * 3);
    this.vel = new Float32Array(count * 3);
    this.life = new Float32Array(count);
    this.max = new Float32Array(count).fill(1);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(this.pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(this.col, 3));
    this.points = new THREE.Points(
      geo,
      new THREE.PointsMaterial({ size, map: dotTexture(), vertexColors: true, ...GLOW, depthTest: false }),
    );
    this.points.frustumCulled = false;
  }

  /** dir biases the burst; spread 0..1 blends from a cone to a full sphere. */
  burst(at: V3, n: number, speed: number, dir?: V3, spread = 1) {
    for (let k = 0; k < n; k++) {
      const i = this.next;
      this.next = (this.next + 1) % this.count;
      const v = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
      if (dir) v.multiplyScalar(spread).add(dir).normalize();
      v.multiplyScalar(speed * (0.35 + Math.random() * 0.65));
      this.pos.set([at.x, at.y, at.z], i * 3);
      this.vel.set([v.x, v.y, v.z], i * 3);
      this.life[i] = this.max[i] = 0.35 + Math.random() * 0.55;
    }
  }

  update(dt: number, gravity = 900) {
    const drag = Math.pow(0.12, dt);
    for (let i = 0; i < this.count; i++) {
      if (this.life[i] <= 0) continue;
      this.life[i] -= dt;
      const j = i * 3;
      this.vel[j] *= drag;
      this.vel[j + 2] *= drag;
      this.vel[j + 1] = this.vel[j + 1] * drag - gravity * dt;
      this.pos[j] += this.vel[j] * dt;
      this.pos[j + 1] += this.vel[j + 1] * dt;
      this.pos[j + 2] += this.vel[j + 2] * dt;
      const f = Math.max(0, this.life[i] / this.max[i]);
      // white-hot → yellow → ember as it dies
      this.tint.setRGB(f, f * (0.55 + 0.45 * f), f * f * f);
      this.col.set([this.tint.r, this.tint.g, this.tint.b], j);
    }
    this.points.geometry.attributes.position.needsUpdate = true;
    this.points.geometry.attributes.color.needsUpdate = true;
  }
}

type Pulse = { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; t: number; dur: number; from: number; to: number; spin: number };

/** Expanding ground shockwaves and sword-swing arcs. */
export class Pulses {
  readonly group = new THREE.Group();
  private live: Pulse[] = [];
  private ringGeo = new THREE.RingGeometry(0.95, 1, 64);
  private arcGeo = new THREE.TorusGeometry(1, 0.022, 6, 48, Math.PI * 1.15);

  private spawn(geo: THREE.BufferGeometry, color: number, at: V3, from: number, to: number, dur: number, spin = 0) {
    const mat = new THREE.MeshBasicMaterial({ color, ...GLOW, depthTest: false, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(at);
    this.group.add(mesh);
    this.live.push({ mesh, mat, t: 0, dur, from, to, spin });
    return mesh;
  }

  /** Flat ring on the floor, tilted a little toward the camera. */
  ring(at: V3, to: number, color: number = COLORS.volt, dur = 0.55) {
    this.spawn(this.ringGeo, color, at, to * 0.15, to, dur).rotation.x = -Math.PI / 2 + 0.38;
  }

  /** Crescent swept by the blade. facing = ±1. */
  slash(at: V3, size: number, facing: number) {
    const m = this.spawn(this.arcGeo, COLORS.spark, at, size * 0.5, size, 0.32, -9 * facing);
    m.rotation.set(-0.5, facing > 0 ? 0.5 : Math.PI - 0.5, -0.6);
    const m2 = this.spawn(this.arcGeo, COLORS.volt, at, size * 0.45, size * 1.25, 0.42, -7 * facing);
    m2.rotation.copy(m.rotation);
  }

  update(dt: number) {
    for (const p of this.live) {
      p.t += dt;
      const k = Math.min(1, p.t / p.dur);
      const e = 1 - Math.pow(1 - k, 3);
      p.mesh.scale.setScalar(p.from + (p.to - p.from) * e);
      p.mesh.rotation.z += p.spin * dt;
      p.mat.opacity = (1 - k) * 0.8;
      if (k >= 1) {
        this.group.remove(p.mesh);
        p.mat.dispose();
      }
    }
    this.live = this.live.filter((p) => p.t < p.dur);
  }
}
