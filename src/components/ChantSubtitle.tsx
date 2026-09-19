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
