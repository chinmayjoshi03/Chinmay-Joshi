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

  return (
    <header className="hud-nav">
      <a href="#hero" className="hud-nav__logo" aria-label="Back to top">
        雷 <span>KAMINARI</span>
      </a>
      <nav className="hud-nav__links mono" aria-label="Sections">
        {sections.map((sec, i) => (
          <a key={sec.id} href={`#${sec.id}`} aria-current={i === active ? "true" : undefined}>
            {sec.kanji}
          </a>
        ))}
      </nav>
      <div className="hud-nav__right">
        <span className="hud-nav__count mono">
          {s.kanji} · {String(active + 1).padStart(2, "0")} / {String(sections.length).padStart(2, "0")} · {s.label}
        </span>
        <button type="button" className="sound-toggle mono" aria-pressed={sound} onClick={() => audio.setEnabled(!sound)}>
          <span className="sound-toggle__bars" aria-hidden="true">
            <i /><i /><i /><i />
          </span>
          {sound ? "Sound on" : "Sound off"}
        </button>
      </div>
    </header>
  );
}
