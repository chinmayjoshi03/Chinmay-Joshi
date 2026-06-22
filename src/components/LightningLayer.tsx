"use client";
/** Full-screen canvas for bolts (incl. arcs around the hero name), a white flash overlay, cursor glow and screen shake. */
import { useEffect, useRef } from "react";
import { fx, prefersReducedMotion, type BoltRequest } from "@/lib/fx";

type Bolt = { pts: [number, number][]; branches: [number, number][][]; life: number; width: number };

function jag(from: { x: number; y: number }, to: { x: number; y: number }, rough: number, segs = 16) {
  const pts: [number, number][] = [[from.x, from.y]];
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  for (let i = 1; i < segs; i++) {
    const t = i / segs;
    const off = (Math.random() - 0.5) * rough * Math.sin(Math.PI * t) * 2;
    pts.push([from.x + dx * t + nx * off, from.y + dy * t + ny * off]);
  }
  pts.push([to.x, to.y]);
  return pts;
}

export function LightningLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cv = canvasRef.current!;
    const ctx = cv.getContext("2d")!;
    const reduce = prefersReducedMotion();
    let W = 0;
    let H = 0;
    let bolts: Bolt[] = [];
    let raf = 0;

    const size = () => {
      const d = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = W * d;
      cv.height = H * d;
      ctx.setTransform(d, 0, 0, d, 0, 0);
    };
    size();
    window.addEventListener("resize", size);

    const addBolt = ({ from, to, width = 4, rough = 40, fork = 120 }: BoltRequest) => {
      const pts = jag(from, to, rough);
      const branches: [number, number][][] = [];
      for (let i = 3; i < pts.length - 3; i += 4) {
        if (Math.random() < 0.5) continue;
        const [bx, by] = pts[i];
        branches.push(jag({ x: bx, y: by }, { x: bx + (Math.random() - 0.5) * fork, y: by + fork * (0.33 + Math.random() * 0.5) }, rough * 0.5, 6));
      }
      bolts.push({ pts, branches, life: 1, width });
    };

    const stroke = (pts: [number, number][], w: number, alpha: number) => {
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.shadowColor = "#ffd21f";
      ctx.shadowBlur = 22;
