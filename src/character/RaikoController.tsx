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
      const x = mobile && a.x !== 0.5 ? (a.x < 0.5 ? 0.18 : 0.82) : a.x;
      return { x: window.innerWidth * x, y: window.innerHeight * (mobile ? 0.97 : a.y) };
    };

    // he walks back home after being dragged away; no idle napping mid-walk
    let homing = false;
    let homeRun = 0;
    const resetIdle = () => {
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        if (!busy && !hovering && !homing) {
          raiko.sleep();
          audio.duck(true);
        }
      }, MOVE_MS.idleBeforeSleep);
    };

    /** His place is where he first lands after the opening slashes (the hero anchor). Skip back there and nap. */
    const walkHome = async () => {
      if (!raiko.walk) return;
      const run = ++homeRun;
      const home = anchorPoint(0);
      homing = true;
      await raiko.walk(home);
      if (run !== homeRun) return;
      homing = false;
      const p = raiko.position;
      const arrived = Math.hypot(p.x - home.x, p.y - home.y) < 4;
      // interrupted (scroll, hover, grabbed again)? the normal handlers take over from here
      if (!arrived || busy || hovering || dragging || raiko.state !== "ready") return resetIdle();
      raiko.sleep();
      audio.duck(true);
    };

    const wake = async () => {
      if (raiko.state === "sleep") {
        audio.duck(false);
        await raiko.ready();
      }
    };

    const goTo = async (index: number) => {
      if (busy) {
        queued = index;
        return;
      }
      busy = true;
      hovering = false;
      homing = false;
      window.clearTimeout(waveTimer);
      current = index;
      await wake();
      await raiko.strike(anchorPoint(index));
      await raiko.land();
      await raiko.ready();
      busy = false;
      resetIdle();
      if (queued !== null && queued !== current) {
        const next = queued;
        queued = null;
        void goTo(next);
      } else {
        queued = null;
        // already scrolled all the way down while he was on his way? thank them now
        if (index === sections.length - 1 && atBottom()) void thankYou();
      }
    };

    // The very end of the page: at bottom centre he bows, with "Thank you!" over his head.
    const atBottom = () => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8;
    let wasAtBottom = false;
    const thankYou = async () => {
      if (busy || dragging || current !== sections.length - 1) return;
      busy = true;
      hovering = false;
      homing = false;
      window.clearTimeout(waveTimer);
      await wake();
      await raiko.bow();
      await new Promise<void>((r) => setTimeout(r, 1200)); // hold the bow while the thanks shows
      await raiko.ready();
      busy = false;
      resetIdle();
      if (queued !== null && queued !== current) {
        const next = queued;
        queued = null;
        void goTo(next);
      } else queued = null;
    };

    const reduce = prefersReducedMotion();
    const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
    const vp = (x: number, y: number): Point => ({ x: window.innerWidth * x, y: window.innerHeight * y });

    // initial placement: asleep, centre stage for the opening (or straight in the hero)
    raiko.place(reduce ? anchorPoint(0) : vp(0.5, 0.66));
    raiko.sleep();

    // active section = last one whose top has passed 55% of the viewport.
    // Reads live rects, so it stays correct around the pinned Skills section.
    let shown = -1;
    const checkSection = () => {
      const line = window.innerHeight * 0.55;
      let idx = 0;
      sections.forEach((s, i) => {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= line) idx = i;
      });
      if (idx !== shown) {
        shown = idx;
        document.documentElement.dataset.section = sections[idx].id;
      }
      if (entered && idx !== current) void goTo(idx);
    };
    checkSection();

    // Opening: alone and asleep on a blank screen, he wakes and cuts the screen apart,
    // then the hero (Hero.tsx) reveals the name and fires "kaminari:ready".
    const opening = async () => {
      if (reduce) {
        window.dispatchEvent(new Event("kaminari:reveal"));
        return;
      }
      busy = true;
      await wait(1500);
      await raiko.ready();
      await wait(280);
      const lift = Math.min(70, window.innerWidth * 0.05); // cut through the chest, not the feet
      const cut = (from: Point, to: Point, kind?: "slash" | "flurry" | "finisher") =>
        fx.introCut.emit({ from: { x: from.x, y: from.y - lift }, to: { x: to.x, y: to.y - lift }, kind });

      // two slashes you can follow…
      for (const to of [vp(0.16, 0.36), vp(0.84, 0.56)]) {
        cut(raiko.position, to);
        await raiko.strike(to);
        await wait(110);
      }

      // …then he is too fast to see: cuts land faster and faster, with only afterimages left behind
      if (raiko.vanish && raiko.afterimage) {
        raiko.vanish(true);
        let gap = 240;
        for (let i = 0; i < 20; i++) {
          const c = vp(0.15 + Math.random() * 0.7, 0.22 + Math.random() * 0.6);
          const ang = Math.random() * Math.PI;
          const d = { x: Math.cos(ang) * 100, y: Math.sin(ang) * 100 };
          fx.introCut.emit({ from: c, to: { x: c.x + d.x, y: c.y + d.y }, kind: "flurry" });
          sfx("flurry-cut", 0.5 + Math.random() * 0.3);
          raiko.afterimage({ x: c.x, y: c.y + lift }, d.x >= 0 ? 1 : -1);
          if (i % 3 === 0) fx.thunder.emit(0.35);
          if (i % 4 === 0) fx.shake.emit(3);
          await wait(gap);
          gap = Math.max(40, gap * 0.85);
        }
      } else {
        for (const to of [vp(0.18, 0.8), vp(0.5, 0.3)]) {
          cut(raiko.position, to);
          await raiko.strike(to);
        }
      }

      // silence — the screen is crazed with cuts — then he reappears, furious, and charges one last slash
      await wait(480);
      const start = vp(0.8, 0.44);
      const end = vp(0.18, 0.8);
      raiko.place(start);
      raiko.vanish?.(false);
      // he chants his technique while charging; the slash lands as the line ends
      // (the chant file ends in ~1s of echo, which rings on over the slash)
      sfx("intro-chant", 1);
      const chantMs = audio.enabled ? Math.max(1500, (audio.duration("intro-chant") - 1) * 1000) : 1500;
      fx.chant.emit({ ms: chantMs });
      if (raiko.rage) await raiko.rage(end, chantMs);
      else await raiko.ready();
      cut(start, end, "finisher");
      await (raiko.bigStrike ? raiko.bigStrike(end) : raiko.strike(end));
      await raiko.land();
      // the beat before it falls
      await wait(260);
      fx.flash.emit(1);
      fx.thunder.emit(1);
      fx.shake.emit(14);
      fx.introSplit.emit(undefined);
      sfx("curtain-break", 0.9);
      await wait(1050); // let the pieces clear before the name comes in
      await raiko.strike(anchorPoint(0));
      await raiko.land();
      window.dispatchEvent(new Event("kaminari:reveal"));
      await raiko.ready();
    };
    window.addEventListener("kaminari:entered", opening, { once: true });

    const onEnter = () => {
      entered = true;
      busy = false;
      resetIdle();
      checkSection();
    };
    window.addEventListener("kaminari:ready", onEnter);

    const onScroll = () => {
      checkSection();
      if (!entered) return;
      const bottom = atBottom();
      const arrived = bottom && !wasAtBottom;
      wasAtBottom = bottom;
      if (arrived && current === sections.length - 1 && !busy) {
        void thankYou();
        return;
      }
      if (raiko.state === "sleep" && !busy) {
        busy = true;
        void wake().then(() => {
          busy = false;
          resetIdle();
        });
      } else resetIdle();
    };

    const onDown = (e: PointerEvent) => {
      if (!entered || busy || dragging || !raiko.grab || e.button !== 0) return;
      if (!onHim(e.clientX, e.clientY)) return;
      press = { x: e.clientX, y: e.clientY, id: e.pointerId };
      e.preventDefault(); // no text selection while grabbing
    };

    const startDrag = (e: PointerEvent) => {
      dragging = true;
      busy = true;
      hovering = false;
      homing = false;
      window.clearTimeout(waveTimer);
      window.clearTimeout(idleTimer);
      audio.duck(false);
      try {
        document.documentElement.setPointerCapture(e.pointerId);
      } catch {
        /* capture is a nicety */
      }
      document.documentElement.classList.add("is-dragging");
      setCursor("grabbing");
      raiko.grab!({ x: e.clientX, y: e.clientY });
    };

    const onUp = () => {
      press = null;
      if (!dragging) return;
      dragging = false;
      suppressClick = true;
      document.documentElement.classList.remove("is-dragging");
      setCursor("");
      void (async () => {
        const p = raiko.position;
        const floor = { x: Math.min(window.innerWidth - 50, Math.max(50, p.x)), y: anchorPoint(current).y };
        await raiko.drop!(floor);
        await raiko.ready();
        busy = false;
        if (queued !== null && queued !== current) {
          const next = queued;
          queued = null;
          void goTo(next);
        } else {
          queued = null;
          void walkHome();
        }
      })();
    };

    // keep a finger-drag from scrolling the page
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (entered && !busy && raiko.grab && t && onHim(t.clientX, t.clientY)) e.preventDefault();
    };
    const onTouchMove = (e: TouchEvent) => {
      if (press || dragging) e.preventDefault();
    };

    const onMove = (e: PointerEvent) => {
      if (press && !dragging && e.pointerId === press.id && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 6) startDrag(e);
      if (dragging) {
        raiko.drag?.({ x: e.clientX, y: e.clientY });
        return;
      }
      if (!entered || busy) return;
      resetIdle();
      if (raiko.state === "sleep") return;
      const over = onHim(e.clientX, e.clientY);
      if (raiko.grab) setCursor(over ? "grab" : "");
      if (over && !hovering) {
        hovering = true;
        raiko.look({ x: e.clientX, y: e.clientY });
        window.clearTimeout(waveTimer);
        waveTimer = window.setTimeout(() => {
          if (hovering && !busy && raiko.state === "look") raiko.wave?.();
        }, 1300);
      } else if (!over && hovering) unhover();
    };
    const unhover = () => {
      if (!hovering) return;
      hovering = false;
      if (!dragging) setCursor("");
      window.clearTimeout(waveTimer);
      if (raiko.state === "look" && !busy) void raiko.ready();
    };
