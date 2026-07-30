"use client";
/** 3D implementation of the CharacterSlot: a full-viewport WebGL canvas driven by RaikoStage. */
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { RaikoStage } from "./raikoStage";
import type { CharacterSlot } from "./types";

export const Raiko3D = forwardRef<CharacterSlot>(function Raiko3D(_, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stage = useRef<RaikoStage | null>(null);

  // Created lazily so the handle works from the parent's very first effect.
  const get = () => (stage.current ??= new RaikoStage(canvasRef.current!));

  useImperativeHandle(
    ref,
    (): CharacterSlot => ({
      get state() {
        return get().state;
      },
      get position() {
        return get().position;
      },
      place: (at) => get().place(at),
      sleep: () => get().sleep(),
      ready: () => get().ready(),
      strike: (to) => get().strike(to),
      land: () => get().land(),
      look: (at) => get().look(at),
      wave: () => get().wave(),
      grab: (at) => get().grab(at),
      drag: (at) => get().drag(at),
      drop: (floor) => get().drop(floor),
      bow: () => get().bow(),
      vanish: (hidden) => get().vanish(hidden),
      afterimage: (at, dir) => get().afterimage(at, dir),
      rage: (toward, ms) => get().rage(toward, ms),
      bigStrike: (to) => get().bigStrike(to),
      walk: (to) => get().walk(to),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Disposal is deferred one tick so React's dev-mode remount keeps the same stage (and Raikō's position).
  const pendingDispose = useRef(0);
  useEffect(() => {
    window.clearTimeout(pendingDispose.current);
    get();
    return () => {
      pendingDispose.current = window.setTimeout(() => {
        stage.current?.dispose();
        stage.current = null;
      }, 0);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={canvasRef} className="stage3d" role="img" aria-label="Raikō, the site's thunder swordsman mascot" />;
});
