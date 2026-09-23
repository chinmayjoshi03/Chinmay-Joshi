"use client";
/**
 * Subtitles for Raikō's chant during the opening charge-up.
 * Edit CHANT below if you record your own line: `at` is when each phrase starts (seconds) in a line
 * that is CHANT_LENGTH seconds long. The timings stretch to fit whatever the real chant length is.
 */
import { useEffect, useState } from "react";
import { fx } from "@/lib/fx";

const CHANT = [
  { at: 0, text: "Thunder style…" },
  { at: 1.29, text: "First Form…" },
  { at: 2.49, text: "Lightning Flash!" },
];
/** Spoken length of the line in public/audio/intro-chant.wav, without its echo tail. */
const CHANT_LENGTH = 3.85;
/** How long the last line stays up after the chant ends (over the slash). */
const HOLD_MS = 500;

export function ChantSubtitle() {
  const [line, setLine] = useState(-1);

  useEffect(() => {
    let timers: number[] = [];
