"use client";
/** 伍 · Training Arc — vertical path lit by a lightning line that grows with scroll. */
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { path } from "@/content/site";
import { prefersReducedMotion } from "@/lib/fx";

export function Path() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current!;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".arc__line-fill",
        { scaleY: 0 },
        { scaleY: 1, ease: "none", scrollTrigger: { trigger: ".arc", start: "top 70%", end: "bottom 60%", scrub: true } },
      );
      gsap.utils.toArray<HTMLElement>(".milestone").forEach((m) => {
        gsap.from(m, {
          x: prefersReducedMotion() ? 0 : 40,
          opacity: 0,
          duration: 0.6,
          ease: "expo.out",
          scrollTrigger: {
            trigger: m,
            start: "top 75%",
            onEnter: () => m.classList.add("is-lit"),
            onLeaveBack: () => m.classList.remove("is-lit"),
          },
        });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section id="path" ref={ref} className="section path">
      <div className="wrap">
        <header className="section__head">
          <p className="eyebrow mono">伍 · 05 · Training arc</p>
          <h2 className="section__title">The training arc</h2>
        </header>
        <ol className="arc">
          <span className="arc__line" aria-hidden="true">
            <span className="arc__line-fill" />
          </span>
          {path.map((m) => (
            <li className="milestone" key={m.period + m.title}>
              <span className="milestone__node" aria-hidden="true" />
              <p className="mono milestone__period">{m.period}</p>
              <h3 className="milestone__title">
                {m.title} <span>· {m.place}</span>
              </h3>
              <p className="milestone__note">{m.note}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
