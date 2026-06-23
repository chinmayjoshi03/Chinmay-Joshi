"use client";
/** 零 · Charging — yellow boot screen, then the sound choice (needed so audio starts on a click). */
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { audio } from "@/lib/audio";
import { fx, prefersReducedMotion } from "@/lib/fx";

const LINE = "Gathering thunder";

export function Loader() {
  const [pct, setPct] = useState(0);
  const [typed, setTyped] = useState("");
  const [ready, setReady] = useState(false);
  const [gone, setGone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = prefersReducedMotion();
    const total = reduce ? 200 : 1900;
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / total);
      const eased = 1 - Math.pow(1 - p, 3);
      setPct(Math.round(eased * 100));
      setTyped(LINE.slice(0, Math.ceil(Math.min(1, p * 1.6) * LINE.length)));
      if (p < 1) raf = requestAnimationFrame(step);
      else setReady(true);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const enter = (withSound: boolean) => {
    audio.setEnabled(withSound, true); // opening: storm ambience first, the theme comes in with the name
    const el = rootRef.current;
    const done = () => {
      setGone(true);
      window.dispatchEvent(new Event("kaminari:entered"));
    };
    fx.thunder.emit(1);
    fx.flash.emit(0.9);
    fx.bolt.emit({ from: { x: window.innerWidth * 0.5, y: 0 }, to: { x: window.innerWidth * 0.45, y: window.innerHeight }, width: 8, rough: 80 });
    if (!el || prefersReducedMotion()) return done();
