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
