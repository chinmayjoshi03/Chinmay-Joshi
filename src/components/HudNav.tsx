"use client";
/** Fixed top HUD: logo, current section counter, sound toggle. */
import { useEffect, useState } from "react";
import { sections } from "@/content/site";
import { audio } from "@/lib/audio";

export function HudNav() {
  const [active, setActive] = useState(0);
  const [sound, setSound] = useState(false);

  useEffect(() => {
    const off = audio.subscribe(setSound);
    const obs = new MutationObserver(() => {
      const id = document.documentElement.dataset.section;
      const i = sections.findIndex((s) => s.id === id);
      if (i >= 0) setActive(i);
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-section"] });
    return () => {
      off();
      obs.disconnect();
    };
  }, []);

  const s = sections[active];

