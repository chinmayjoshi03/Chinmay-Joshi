/** Tiny event bus so any component can ask the lightning layer / audio for effects. */
import type { Point } from "@/character/types";

/** fork = how far side branches reach, in px (default 120). */
export type BoltRequest = { from: Point; to: Point; width?: number; rough?: number; fork?: number };

type Listener<T> = (payload: T) => void;

function channel<T>() {
  const subs = new Set<Listener<T>>();
  return {
    on(fn: Listener<T>) {
      subs.add(fn);
      return () => {
        subs.delete(fn);
      };
    },
    emit(payload: T) {
      subs.forEach((fn) => fn(payload));
    },
  };
}

/** Every sound effect the site plays. Each one is a file in public/audio/ with this exact name. */
export const SFX_NAMES = [
  "thunder", "intro-ambience", "intro-chant", "dash", "land", "finisher", "rage-charge", "flurry-cut", "curtain-break",
  "name-reveal", "wake", "sleep", "shy", "wave-hi", "grab", "drop-thud", "bow",
] as const;
export type SfxName = (typeof SFX_NAMES)[number];

export const fx = {
  /** Play a sound effect from public/audio/ (silent while sound is off). */
  sfx: channel<{ name: SfxName; volume?: number }>(),
  bolt: channel<BoltRequest>(),
  flash: channel<number>(), // intensity 0..1
  shake: channel<number>(), // px
  thunder: channel<number>(), // volume 0..1
  /** Opening sequence: a slash seam across the intro curtain (line through from→to, extended to the screen edges). */
  introCut: channel<{ from: Point; to: Point; kind?: "slash" | "flurry" | "finisher" }>(),
  /** Opening: Raikō starts chanting; the line lasts `ms` (drives the subtitles). */
  chant: channel<{ ms: number }>(),
  /** Opening sequence: the curtain falls apart along every seam cut so far. */
  introSplit: channel<undefined>(),
};

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
