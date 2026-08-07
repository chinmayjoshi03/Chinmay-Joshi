"use client";
/** /lab — 3D character sheet: all six Raikō poses on a turntable. Add ?rot=0.6 to freeze the angle, ?only=3 to show one pose up close. */
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { buildRaiko, POSES, RAGE_POSE, SHY_POSE, WAVE_POSE, type Pose } from "@/character/raikoRig";
import type { MoveName } from "@/character/types";
import type { FaceKind } from "@/three/toon";

const p = (m: MoveName) => POSES[m];
const MOVES: [Pose, FaceKind, boolean][] = [
  [p("sleep"), "sleep", false],
  [p("ready"), "calm", false],
  [p("strike"), "focus", true],
  [RAGE_POSE, "angry", false],
  [p("land"), "focus", true],
  [SHY_POSE, "shy", false],
  [WAVE_POSE, "happy", false],
  [p("bow"), "happy", false],
];

export default function Lab() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
