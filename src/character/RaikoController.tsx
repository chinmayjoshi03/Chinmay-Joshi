"use client";
/**
 * Drives the character slot from page events:
 * - opening        → asleep alone on a blank screen → wakes → two slashes → an accelerating flurry of cuts
 *                    → angry charge-up → one huge slash → the screen falls apart → lands in the hero
 * - section enter  → (wake) → strike to that section's anchor → land → ready
 * - 6s idle        → sleep (music ducks)
 * - press + drag  → picked up by the scruff, swings and struggles; let go → falls, lands,
 *                    then skips happily back to his place (the hero spot) and dozes off
 * - cursor on him  → shy smile; still there after a moment → waves hi; cursor leaves → back to ready
 * - 3 quick clicks → secret move
 * - "raiko:bow"    → bow (contact links)
 * - page bottom    → (in the last section, at bottom centre) bows with "Thank you!" over his head
 * Works with any CharacterSlot implementation: the 3D rig when WebGL is available,
 * the 2D sprites otherwise (no WebGL, reduced motion, or ?2d in the URL).
 */
import { useEffect, useRef, useState } from "react";
import { Raiko2D } from "./Raiko2D";
import { Raiko3D } from "./Raiko3D";
import { RaikoSprites } from "./RaikoSprites";
import type { CharacterSlot, Point } from "./types";
import { MOVE_MS } from "./types";
import { sections } from "@/content/site";
import { audio } from "@/lib/audio";
import { fx, prefersReducedMotion, type SfxName } from "@/lib/fx";
import { canUse3D } from "@/lib/gl";

const sfx = (name: SfxName, volume?: number) => fx.sfx.emit({ name, volume });

/** Wraps a character so each move plays its sound effect (works for both the 3D and 2D Raikō). */
function withSfx(slot: CharacterSlot): CharacterSlot {
  const sounds: Partial<Record<keyof CharacterSlot, [SfxName, number]>> = {
    strike: ["dash", 0.8],
    land: ["land", 0.7],
    bigStrike: ["finisher", 1],
    rage: ["rage-charge", 0.8],
    sleep: ["sleep", 0.5],
    look: ["shy", 0.6],
    wave: ["wave-hi", 0.7],
    grab: ["grab", 0.8],
    bow: ["bow", 0.8],
  };
  return new Proxy(slot, {
    get(target, key: keyof CharacterSlot) {
      const value = Reflect.get(target, key);
      if (typeof value !== "function") return value;
      return (...args: unknown[]) => {
        const sound = sounds[key];
        if (sound) sfx(...sound);
        // waking from sleep gets its own little startle
        if (key === "ready" && target.state === "sleep") sfx("wake", 0.7);
        return (value as (...a: unknown[]) => unknown).apply(target, args);
      };
    },
  });
}

export function RaikoController() {
  const slot = useRef<CharacterSlot>(null);
  const [mode, setMode] = useState<"2d" | "3d" | null>(null);

  useEffect(() => setMode(canUse3D() ? "3d" : "2d"), []);

  useEffect(() => {
    if (!mode || !slot.current) return;
    const raiko = withSfx(slot.current);

    let current = 0;
    let busy = false;
    let queued: number | null = null;
    let idleTimer = 0;
    let hovering = false;
    // dragging: press on him, move past a few px to pick him up
    let press: { x: number; y: number; id: number } | null = null;
    let dragging = false;
    let suppressClick = false;
    const onHim = (x: number, y: number) => {
      const p = raiko.position;
      return Math.abs(x - p.x) < 80 && y < p.y + 10 && y > p.y - 190;
    };
    const setCursor = (c: string) => {
      document.documentElement.style.cursor = c;
    };
    let waveTimer = 0;
    let entered = false;
    let clicks: number[] = [];

    const anchorPoint = (index: number): Point => {
      const a = sections[index].anchor;
      const mobile = window.innerWidth < 720;
      // on phones keep him small in the bottom corners
