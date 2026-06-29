"use client";
/**
 * 2D chibi implementation of the CharacterSlot.
 * Renders one fixed-position sprite plus three afterimage ghosts.
 * Position = feet centre in viewport pixels.
 */
import { forwardRef, useImperativeHandle, useRef } from "react";
import gsap from "gsap";
import type { CharacterSlot, MoveName, Point } from "./types";
import { MOVE_MS } from "./types";
import { fx, prefersReducedMotion } from "@/lib/fx";

const POSE_ID: Record<MoveName, string> = {
  sleep: "#raiko-sleep",
  ready: "#raiko-ready",
  strike: "#raiko-strike",
  land: "#raiko-land",
  look: "#raiko-look",
  bow: "#raiko-bow",
};

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

type Props = { onPoseChange?: (pose: MoveName) => void };

export const Raiko2D = forwardRef<CharacterSlot, Props>(function Raiko2D({ onPoseChange }, ref) {
  const rootRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<HTMLDivElement>(null);
  const useRefEl = useRef<SVGUseElement>(null);
  const ghostRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pos = useRef<Point>({ x: -999, y: -999 });
  const state = useRef<MoveName>("sleep");
  const facing = useRef<1 | -1>(1);

  const size = () => {
