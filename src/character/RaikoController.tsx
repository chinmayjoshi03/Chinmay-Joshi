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
