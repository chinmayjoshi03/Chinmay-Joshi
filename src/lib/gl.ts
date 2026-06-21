/** Decides once per page whether the 3D (WebGL) presentation is used. */
import { prefersReducedMotion } from "./fx";

let cached: boolean | null = null;

export function canUse3D(): boolean {
  if (typeof window === "undefined") return false;
  if (cached !== null) return cached;
  if (prefersReducedMotion() || new URLSearchParams(location.search).has("2d")) return (cached = false);
  try {
    const c = document.createElement("canvas");
    cached = !!c.getContext("webgl2");
  } catch {
    cached = false;
  }
  return cached;
}
