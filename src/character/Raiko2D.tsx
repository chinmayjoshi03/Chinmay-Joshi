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

