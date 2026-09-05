"use client";
/**
 * Sound engine.
 * - Music: plays /audio/theme.mp3 through Howler if you add one (licensed or commissioned —
 *   never the anime OST). Until then a synthesized taiko-style drum loop stands in.
 * - SFX: every effect is a file in public/audio/ named after its SfxName (see public/audio/README.md).
 *   Each name is looked up as .wav, then .mp3, .ogg, .m4a, so a file of the same name replaces it.
 *   If the thunder file is missing a synthesized crack plays instead.
 * Sound only ever starts after a user gesture (the loader buttons or the toggle).
 */
import { Howl } from "howler";
import { SFX_NAMES, fx, type SfxName } from "./fx";

const SFX_EXTS = ["wav", "mp3", "ogg", "m4a"];

const STORE_KEY = "kaminari-sound";
type Listener = (on: boolean) => void;

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private howl: Howl | null = null;
  private drumTimer: number | null = null;
  private nextBeat = 0;
  private beat = 0;
  private listeners = new Set<Listener>();
  private buffers = new Map<SfxName, AudioBuffer>();
  private loading: Promise<void> | null = null;
  enabled = false;

  /** Remembered choice from last visit (null = never chose). */
  savedChoice(): boolean | null {
    try {
      const v = localStorage.getItem(STORE_KEY);
      return v === null ? null : v === "on";
    } catch {
      return null;
    }
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn);
