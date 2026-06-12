"use client";
/** 弐 · Character Sheet — bio as an RPG unit card with stat bars that scan in. */
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { profile } from "@/content/site";
import { prefersReducedMotion } from "@/lib/fx";

export function About() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current!;
    const bars = el.querySelectorAll<HTMLElement>(".stat__fill");
    const nums = el.querySelectorAll<HTMLElement>(".stat__num");
    if (prefersReducedMotion()) return;
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 65%" } });
    tl.from(el.querySelectorAll(".panel"), { clipPath: "inset(0 100% 0 0)", duration: 0.7, stagger: 0.1, ease: "expo.out" })
      .from(bars, { scaleX: 0, transformOrigin: "left", duration: 0.9, stagger: 0.08, ease: "power3.out" }, "-=0.4")
      .from(nums, { textContent: 0, snap: { textContent: 1 }, duration: 0.9, stagger: 0.08 }, "<");
    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
