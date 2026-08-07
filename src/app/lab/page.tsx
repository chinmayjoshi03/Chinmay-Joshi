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
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x15140f);
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xffffff, 0x554466, 1.5));
    const sun = new THREE.DirectionalLight(0xffffff, 1.9);
    sun.position.set(-0.6, 1, 0.9);
    scene.add(sun);
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    const params = new URLSearchParams(location.search);
    const fixed = params.get("rot");
    const only = params.get("only");

    const shown = only !== null ? MOVES.filter((_, i) => i === Number(only)) : MOVES;
    const rigs = shown.map(([pose, face, sword], i) => {
      const rig = buildRaiko();
      Object.assign(rig.pose, pose, { yaw: 0 });
      rig.setFace(face);
      rig.setSword(sword);
      if (only !== null) rig.root.position.set(0, -1.2, 9);
      else rig.root.position.set(((i % 4) - 1.5) * 3.2, i < 4 ? 0.4 : -3.2, 0);
      scene.add(rig.root);
      return rig;
    });

    const size = () => {
      renderer.setSize(innerWidth, innerHeight, false);
