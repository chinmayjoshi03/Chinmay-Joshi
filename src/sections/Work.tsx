"use client";
/** 肆 · Missions — project cards with rank, stack, outcome; hover tilts and charges the border. */
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { missions } from "@/content/site";
import { prefersReducedMotion } from "@/lib/fx";

export function Work() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current!;
    const cards = Array.from(el.querySelectorAll<HTMLElement>(".mission"));
    const reduce = prefersReducedMotion();
    let tween: gsap.core.Tween | null = null;
    if (!reduce) {
      tween = gsap.from(cards, {
        clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)",
        duration: 0.8,
        stagger: 0.12,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 60%" },
      });
    }
    const handlers = cards.map((card) => {
      const move = (e: PointerEvent) => {
        if (reduce) return;
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty("--rx", `${-py * 8}deg`);
        card.style.setProperty("--ry", `${px * 10}deg`);
        card.style.setProperty("--mx", `${(px + 0.5) * 100}%`);
      };
      const leave = () => {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      };
      card.addEventListener("pointermove", move);
      card.addEventListener("pointerleave", leave);
      return () => {
        card.removeEventListener("pointermove", move);
        card.removeEventListener("pointerleave", leave);
      };
    });
    return () => {
      handlers.forEach((off) => off());
      tween?.scrollTrigger?.kill();
      tween?.kill();
    };
  }, []);

  return (
    <section id="work" ref={ref} className="section work">
      <div className="wrap">
        <header className="section__head">
          <p className="eyebrow mono">肆 · 04 · Missions</p>
          <h2 className="section__title">Missions cleared</h2>
        </header>
        <div className="work__grid">
          {missions.map((m, i) => (
            <article className="mission" key={m.title} data-rank={m.rank}>
              <div className="mission__top mono">
                <span>Mission {String(i + 1).padStart(2, "0")}</span>
                <span className="mission__rank">Rank {m.rank}</span>
              </div>
              <h3 className="mission__title">{m.title}</h3>
              <p className="mission__summary">{m.summary}</p>
              <p className="mission__outcome mono">{m.outcome}</p>
              <ul className="mission__stack">
                {m.stack.map((s) => (
                  <li key={s} className="mono">{s}</li>
                ))}
              </ul>
              <div className="mission__links">
                {m.links.map((l) => (
                  <a key={l.label} href={l.href} className="mono" target={l.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                    {l.label} ↗
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
