"use client";
/**
 * 2D chibi implementation of the CharacterSlot.
 * Renders one fixed-position sprite plus three afterimage ghosts.
 * Position = feet centre in viewport pixels.
 */
import { forwardRef, useImperativeHandle, useRef } from "react";
import gsap from "gsap";
import type { CharacterSlot, MoveName, Point } from "./types";
import { MOVE_MS } from "./types";
import { fx, prefersReducedMotion } from "@/lib/fx";

const POSE_ID: Record<MoveName, string> = {
  sleep: "#raiko-sleep",
  ready: "#raiko-ready",
  strike: "#raiko-strike",
  land: "#raiko-land",
  look: "#raiko-look",
  bow: "#raiko-bow",
};

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

type Props = { onPoseChange?: (pose: MoveName) => void };

export const Raiko2D = forwardRef<CharacterSlot, Props>(function Raiko2D({ onPoseChange }, ref) {
  const rootRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<HTMLDivElement>(null);
  const useRefEl = useRef<SVGUseElement>(null);
  const ghostRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pos = useRef<Point>({ x: -999, y: -999 });
  const state = useRef<MoveName>("sleep");
  const facing = useRef<1 | -1>(1);

  const size = () => {
    const el = rootRef.current;
    return el ? { w: el.offsetWidth, h: el.offsetHeight } : { w: 200, h: 140 };
  };

  const apply = () => {
    const el = rootRef.current;
    if (!el) return;
    const { w, h } = size();
    el.style.transform = `translate3d(${pos.current.x - w / 2}px, ${pos.current.y - h}px, 0)`;
  };

  const setPose = (p: MoveName) => {
    state.current = p;
    useRefEl.current?.setAttribute("href", POSE_ID[p]);
    rootRef.current?.setAttribute("data-pose", p);
    onPoseChange?.(p);
  };

  const face = (dir: 1 | -1) => {
    facing.current = dir;
    if (flipRef.current) flipRef.current.style.transform = `scaleX(${dir})`;
  };

  useImperativeHandle(
    ref,
    (): CharacterSlot => ({
      get state() {
        return state.current;
      },
      get position() {
        return { ...pos.current };
      },

      place(at: Point) {
        gsap.killTweensOf(pos.current);
        pos.current = { ...at };
        apply();
      },

      sleep() {
        setPose("sleep");
      },

      async ready() {
        setPose("ready");
        if (!prefersReducedMotion() && flipRef.current) {
          gsap.fromTo(flipRef.current, { y: -10 }, { y: 0, duration: MOVE_MS.ready / 1000, ease: "back.out(3)" });
        }
        await wait(MOVE_MS.ready);
      },

      async strike(to: Point) {
        const reduce = prefersReducedMotion();
        const from = { ...pos.current };
        face(to.x >= from.x ? 1 : -1);
        setPose("strike");
        const { h } = size();
        const chest = h * 0.35;
        fx.flash.emit(0.75);
        fx.bolt.emit({ from: { x: from.x, y: from.y - chest }, to: { x: to.x, y: to.y - chest }, width: 6, rough: 46 });
        fx.thunder.emit(1);
        fx.shake.emit(6);

        // afterimages along the path
        ghostRefs.current.forEach((g, i) => {
          if (!g || reduce) return;
          const t = 0.25 + i * 0.22;
          const gx = from.x + (to.x - from.x) * t;
          const gy = from.y + (to.y - from.y) * t;
          const { w } = size();
          g.style.transform = `translate3d(${gx - w / 2}px, ${gy - h}px, 0) scaleX(${facing.current})`;
          gsap.fromTo(g, { opacity: 0.6 - i * 0.15 }, { opacity: 0, duration: 0.7, delay: 0.04 + i * 0.04, ease: "power2.out" });
        });

        await new Promise<void>((resolve) => {
          gsap.to(pos.current, {
            x: to.x,
            y: to.y,
            duration: reduce ? 0.001 : MOVE_MS.strike / 1000,
            ease: "expo.inOut",
            onUpdate: apply,
            onComplete: resolve,
          });
        });
      },

      async land() {
        setPose("land");
        await wait(MOVE_MS.land);
      },

      look(at: Point) {
        if (state.current === "strike" || state.current === "bow") return;
        face(at.x >= pos.current.x ? 1 : -1);
        setPose("look");
      },

      async bow() {
        setPose("bow");
        if (!prefersReducedMotion() && flipRef.current) {
          gsap.fromTo(flipRef.current, { rotate: -6 }, { rotate: 0, duration: MOVE_MS.bow / 1000, ease: "power2.out" });
        }
        await wait(MOVE_MS.bow);
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <>
      {[0, 1, 2].map((i) => (
        <div key={i} ref={(el) => { ghostRefs.current[i] = el; }} className="raiko raiko--ghost" aria-hidden="true">
          <svg viewBox="0 0 200 140"><use href="#raiko-strike" /></svg>
        </div>
      ))}
      <div ref={rootRef} className="raiko" data-pose="sleep" role="img" aria-label="Raikō, the site's thunder swordsman mascot">
        <span className="raiko__zz" aria-hidden="true">Z z</span>
        <div ref={flipRef} className="raiko__flip">
          <svg viewBox="0 0 200 140">
            <use ref={useRefEl} href="#raiko-sleep" />
          </svg>
        </div>
      </div>
    </>
  );
});
