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
