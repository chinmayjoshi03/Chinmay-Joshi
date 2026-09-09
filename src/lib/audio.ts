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
    return () => {
      this.listeners.delete(fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.enabled));
  }

  /** Must be called from a click/tap handler. */
  setEnabled(on: boolean, intro = false) {
    this.enabled = on;
    try {
      localStorage.setItem(STORE_KEY, on ? "on" : "off");
    } catch {
      /* storage blocked: fine */
    }
    if (on) this.start(intro);
    else this.stop();
    this.notify();
  }

  private ensureCtx() {
    if (this.ctx) return this.ctx;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.8;
    this.master.connect(this.ctx.destination);
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.5;
    this.musicGain.connect(this.master);
    return this.ctx;
  }

  private loads = new Map<SfxName, Promise<void>>();
  private loadOne(name: SfxName) {
    let p = this.loads.get(name);
    if (!p) {
      const ctx = this.ctx!;
      p = (async () => {
        for (const ext of SFX_EXTS) {
          try {
