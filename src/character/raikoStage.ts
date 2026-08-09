/**
 * The WebGL stage for the 3D Raikō and the effects attached to his moves
 * (sparks, shockwaves, slash arcs, afterimages, static crackle, "Z z" and "!?" glyphs).
 * Page-wide lightning (the strike bolt, sky bolts, name arcs) stays on the 2D canvas in LightningLayer.
 *
 * World space = CSS pixels on the z=0 plane, origin at the viewport centre, y up.
 * The camera is a real perspective camera, so anything that leaves z=0 (the dash arcs
 * toward the viewer, bolts wander in depth) gets true parallax and foreshortening.
 */
import * as THREE from "three";
import gsap from "gsap";
import { buildRaiko, HANG_POSE, MODEL_HEIGHT, POSES, RAGE_POSE, SHY_POSE, WAVE_POSE, type Pose, type Rig } from "./raikoRig";
import type { CharacterSlot, MoveName, Point } from "./types";
import { MOVE_MS } from "./types";
import { Bolts, Pulses, Sparks } from "@/three/fx3d";
import { COLORS, GLOW, dotTexture, shadowTexture, textTexture } from "@/three/toon";
import { fx } from "@/lib/fx";

const FOV = 35;
const THANKS_W = 320; // "Thank you!" caption canvas width (128 tall)
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export class RaikoStage implements CharacterSlot {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(FOV, 1, 10, 10000);
  private rig: Rig;
  private ghosts: Rig[];
  private bolts = new Bolts();
