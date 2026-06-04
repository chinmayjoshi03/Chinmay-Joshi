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

