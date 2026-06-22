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
