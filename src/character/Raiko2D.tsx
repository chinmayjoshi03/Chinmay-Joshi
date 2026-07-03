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
    const el = rootRef.current;
    return el ? { w: el.offsetWidth, h: el.offsetHeight } : { w: 200, h: 140 };
  };

  const apply = () => {
    const el = rootRef.current;
    if (!el) return;
    const { w, h } = size();
    el.style.transform = `translate3d(${pos.current.x - w / 2}px, ${pos.current.y - h}px, 0)`;
  };

  const setPose = (p: MoveName) => {
    state.current = p;
    useRefEl.current?.setAttribute("href", POSE_ID[p]);
    rootRef.current?.setAttribute("data-pose", p);
    onPoseChange?.(p);
  };

  const face = (dir: 1 | -1) => {
    facing.current = dir;
    if (flipRef.current) flipRef.current.style.transform = `scaleX(${dir})`;
  };
