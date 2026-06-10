"use client";
/** 壱 · The Sleeper — giant outlined 雷, name crackling with lightning, role, HUD corners. */
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { profile } from "@/content/site";
import { fx, prefersReducedMotion } from "@/lib/fx";

export function Hero() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ready = () => void window.dispatchEvent(new Event("kaminari:ready"));
    if (prefersReducedMotion()) {
      window.addEventListener("kaminari:reveal", ready, { once: true });
      return () => window.removeEventListener("kaminari:reveal", ready);
    }
    const el = ref.current!;
    const name = el.querySelector<HTMLElement>(".hero__name")!;
    const rest = [
      ...el.querySelectorAll<HTMLElement>("[data-in]:not(.hero__name)"),
      ...el.querySelectorAll<HTMLElement>(".hud, .hero__kanji"),
      ...document.querySelectorAll<HTMLElement>(".hud-nav"),
    ];
    gsap.set([name, ...rest], { autoAlpha: 0 });

