"use client";
/** Lenis smooth scroll wired into GSAP's ticker + ScrollTrigger. Locked until the opening sequence ends. */
import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/fx";

gsap.registerPlugin(ScrollTrigger);

export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: !prefersReducedMotion() });
    lenis.stop();
    document.documentElement.classList.add("is-locked");

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const unlock = () => {
      document.documentElement.classList.remove("is-locked");
      lenis.start();
      ScrollTrigger.refresh();
    };
    window.addEventListener("kaminari:ready", unlock);

    // in-page anchor links scroll smoothly
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a) return;
