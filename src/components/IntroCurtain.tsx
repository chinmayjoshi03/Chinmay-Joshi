"use client";
/**
 * 序 · Opening — a blank curtain (just the background) over the whole page.
 * Raikō's slashes leave glowing seams across it, then it falls apart along them.
 * The sequence itself is driven by RaikoController; this only draws the curtain.
 */
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { fx, type BoltRequest } from "@/lib/fx";
import type { Point } from "@/character/types";

type Poly = [number, number][];
type Line = { p: Point; d: Point; kind: "slash" | "flurry" | "finisher" };

/** Cut a convex polygon by a line into its two sides. */
function split(poly: Poly, { p, d }: Line): [Poly, Poly] {
  const side = ([x, y]: [number, number]) => d.x * (y - p.y) - d.y * (x - p.x);
  const a: Poly = [];
  const b: Poly = [];
  poly.forEach((v, i) => {
    const w = poly[(i + 1) % poly.length];
    const sv = side(v);
    const sw = side(w);
    if (sv >= 0) a.push(v);
    if (sv <= 0) b.push(v);
    if ((sv > 0 && sw < 0) || (sv < 0 && sw > 0)) {
      const t = sv / (sv - sw);
      const x: [number, number] = [v[0] + (w[0] - v[0]) * t, v[1] + (w[1] - v[1]) * t];
      a.push(x);
      b.push(x);
    }
  });
  return [a, b];
}

const area = (poly: Poly) => Math.abs(poly.reduce((s, [x, y], i) => {
  const [nx, ny] = poly[(i + 1) % poly.length];
  return s + x * ny - nx * y;
}, 0)) / 2;

export function IntroCurtain() {
  const [done, setDone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // always open at the top: the reveal belongs to the hero
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const lines: Line[] = [];
    const finish = () => {
      document.documentElement.classList.remove("is-intro");
