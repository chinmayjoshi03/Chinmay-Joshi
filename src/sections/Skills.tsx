"use client";
/** 参 · Breathing Forms — pinned horizontal scroll, one form per panel (stacks on phones). */
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { forms } from "@/content/site";
import { fx, prefersReducedMotion } from "@/lib/fx";

export function Skills() {
  const ref = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 900px)", () => {
      const track = trackRef.current!;
      const distance = () => track.scrollWidth - window.innerWidth;
      let lastIndex = 0;
      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: ref.current,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const i = Math.round(self.progress * (forms.length - 1));
            if (i !== lastIndex) {
              lastIndex = i;
              // a slash of lightning each time a new form takes the stage
              const y = window.innerHeight * (0.3 + Math.random() * 0.3);
              fx.bolt.emit({ from: { x: window.innerWidth * 0.1, y }, to: { x: window.innerWidth * 0.9, y: y + 30 }, width: 3, rough: 30 });
            }
          },
        },
      });
      return () => tween.kill();
    });
    return () => mm.revert();
  }, []);

  return (
    <section id="skills" ref={ref} className="section skills">
      <div className="skills__track" ref={trackRef}>
        <div className="skills__intro">
          <p className="eyebrow mono">参 · 03 · Breathing forms</p>
          <h2 className="section__title">
            Every skill
            <br />
            is a form.
          </h2>
          <p className="muted">Scroll to cycle through them.</p>
        </div>
        {forms.map((f) => (
          <article className="form" key={f.name}>
            <div className="form__kanji" aria-hidden="true">{f.kanji}</div>
            <p className="mono form__ordinal">{f.ordinal}</p>
            <h3 className="form__name">{f.name}</h3>
            <p className="form__summary">{f.summary}</p>
            <ul className="form__skills">
              {f.skills.map((s) => (
                <li key={s} className="mono">{s}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
