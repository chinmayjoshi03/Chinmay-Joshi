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
    gsap.to(el, {
      clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)",
      duration: 0.7,
      ease: "expo.inOut",
      onComplete: done,
    });
  };

  if (gone) return null;

  const saved = typeof window !== "undefined" ? audio.savedChoice() : null;

  return (
    <div ref={rootRef} className="loader" role="dialog" aria-modal="true" aria-label="Loading">
      <div className="loader__top mono">Preparing system // ({pct}%)</div>
      <div className="loader__center">
        <svg className="loader__logo" viewBox="0 0 120 120" aria-hidden="true">
          <polygon points="66,4 22,66 54,66 40,116 98,46 64,46 82,4" fill="#0c0b09" />
        </svg>
        <div className="loader__line mono">
          {typed}
          {typed.length >= LINE.length && "… "}
          <b>{pct}%</b>
          <span className="caret" />
        </div>
      </div>
      <div className={`loader__choose ${ready ? "is-ready" : ""}`}>
        <button type="button" className="btn btn--ink" onClick={() => enter(true)} disabled={!ready} autoFocus={ready && saved !== false}>
          ⚡ Enter with sound
        </button>
        <button type="button" className="btn btn--ghost-ink" onClick={() => enter(false)} disabled={!ready}>
          Enter silent
        </button>
      </div>
      <div className="loader__bar">
        <span style={{ transform: `scaleX(${pct / 100})` }} />
      </div>
      <div className="loader__foot mono">
        <span>かみなり</span>
        <span>ready_for_(thunder)</span>
      </div>
    </div>
  );
}
