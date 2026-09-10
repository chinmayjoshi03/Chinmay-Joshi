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
            const res = await fetch(`/audio/${name}.${ext}`);
            if (!res.ok) continue;
            this.buffers.set(name, await ctx.decodeAudioData(await res.arrayBuffer()));
            return;
          } catch {
            /* missing or undecodable: try the next format */
          }
        }
      })();
      this.loads.set(name, p);
    }
    return p;
  }

  /** Fetch and decode every sound effect once. */
  private loadSfx() {
    this.loading ??= Promise.all(SFX_NAMES.map((n) => this.loadOne(n))).then(() => undefined);
    return this.loading;
  }

  /** Length of a loaded effect in seconds (0 if not loaded). */
  duration(name: SfxName) {
    return this.buffers.get(name)?.duration ?? 0;
  }

  play(name: SfxName, volume = 1) {
    if (!this.enabled || !this.ctx || !this.master) return;
    const buf = this.buffers.get(name);
    if (!buf) {
      if (name === "thunder") this.synthThunder(volume);
      return;
    }
    this.source(buf, volume);
  }

  private source(buf: AudioBuffer, volume: number) {
    const src = this.ctx!.createBufferSource();
    src.buffer = buf;
    const g = this.ctx!.createGain();
    g.gain.value = volume;
    src.connect(g).connect(this.master!);
    src.start();
    return { src, gain: g };
  }

  // ── opening: a storm bed under the action, then the theme comes in with the name ──
  /** True from "Enter with sound" until the hero name is revealed: the music waits. */
  private inIntro = false;
  private bed: { src: AudioBufferSourceNode; gain: GainNode } | null = null;

  private async startIntro() {
    this.inIntro = true;
    await this.loadOne("intro-ambience");
    const buf = this.buffers.get("intro-ambience");
    if (!this.enabled || !this.inIntro || !buf || this.bed) return;
    this.bed = this.source(buf, 0.75);
    this.bed.src.onended = () => (this.bed = null);
  }

  /** The name is revealed: fade the storm out and bring the theme in. */
  endIntro() {
    if (!this.inIntro) return;
    this.inIntro = false;
    this.fadeBed(1.2);
    if (this.enabled) this.startMusic();
  }

  private fadeBed(seconds: number) {
    if (!this.bed || !this.ctx) return;
    const { src, gain } = this.bed;
    const t = this.ctx.currentTime;
    gain.gain.setValueAtTime(gain.gain.value, t);
    gain.gain.linearRampToValueAtTime(0, t + seconds);
    src.stop(t + seconds + 0.05);
    this.bed = null;
  }

  /** First existing theme file, looked up in the same order as the effects. */
  private async findTheme() {
    for (const ext of SFX_EXTS) {
      try {
        const res = await fetch(`/audio/theme.${ext}`, { method: "HEAD" });
        if (res.ok) return `/audio/theme.${ext}`;
      } catch {
        /* try the next one */
      }
    }
    return null;
  }

  private start(intro = false) {
    const ctx = this.ensureCtx();
    void ctx.resume();
    void this.loadSfx();
    if (intro) void this.startIntro();
    else if (!this.inIntro) this.startMusic();
  }

  private musicStarting = false;
  private startMusic() {
    if (this.howl) {
      if (!this.howl.playing()) this.howl.play();
      return;
    }
    if (this.musicStarting) return;
    this.musicStarting = true;
    void this.findTheme().then((src) => {
      this.musicStarting = false;
      if (!this.enabled || this.inIntro) return;
      if (!src) return this.startDrums();
      this.howl = new Howl({
        src: [src],
        loop: true,
        volume: 0.45,
        html5: true,
        onloaderror: () => {
          this.howl = null;
          if (this.enabled) this.startDrums();
        },
      });
      this.howl.play();
    });
  }

  private stop() {
    this.fadeBed(0.3);
    this.howl?.pause();
    this.stopDrums();
  }

  /** Lower the music while Raikō sleeps. */
  duck(sleeping: boolean) {
    const level = sleeping ? 0.18 : 0.5;
    if (this.howl) this.howl.fade(this.howl.volume(), sleeping ? 0.15 : 0.45, 800);
    if (this.musicGain && this.ctx) this.musicGain.gain.setTargetAtTime(level, this.ctx.currentTime, 0.4);
  }

  // ── synthesized placeholder music: a slow taiko pattern ──
  private startDrums() {
    if (this.drumTimer !== null || !this.ctx) return;
    const bpm = 84;
    const step = 60 / bpm / 2; // eighth notes
    const pattern = [1, 0, 0, 0.5, 0.8, 0, 0.4, 0, 1, 0, 0.5, 0, 0.8, 0.4, 0.6, 0.3];
    this.nextBeat = this.ctx.currentTime + 0.1;
    this.drumTimer = window.setInterval(() => {
      const ctx = this.ctx!;
      while (this.nextBeat < ctx.currentTime + 0.2) {
        const v = pattern[this.beat % pattern.length];
        if (v > 0) this.drum(this.nextBeat, v, this.beat % 8 === 0);
        this.nextBeat += step;
        this.beat++;
      }
    }, 50);
  }
