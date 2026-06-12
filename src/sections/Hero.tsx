"use client";
/** 壱 · The Sleeper — giant outlined 雷, name crackling with lightning, role, HUD corners. */
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { profile } from "@/content/site";
import { fx, prefersReducedMotion } from "@/lib/fx";

export function Hero() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ready = () => void window.dispatchEvent(new Event("kaminari:ready"));
    if (prefersReducedMotion()) {
      window.addEventListener("kaminari:reveal", ready, { once: true });
      return () => window.removeEventListener("kaminari:reveal", ready);
    }
    const el = ref.current!;
    const name = el.querySelector<HTMLElement>(".hero__name")!;
    const rest = [
      ...el.querySelectorAll<HTMLElement>("[data-in]:not(.hero__name)"),
      ...el.querySelectorAll<HTMLElement>(".hud, .hero__kanji"),
      ...document.querySelectorAll<HTMLElement>(".hud-nav"),
    ];
    gsap.set([name, ...rest], { autoAlpha: 0 });

    const intro = () => {
      const r = name.getBoundingClientRect();
      name.style.animation = "none"; // the idle flicker would override the reveal's filter
      const tl = gsap.timeline();
      tl.call(() => {
        // three bolts rake across the name as it is cut in
        [0.2, 0.5, 0.8].forEach((k, i) =>
          window.setTimeout(() => {
            const y = r.top + r.height * k;
            fx.bolt.emit({ from: { x: r.left - 60, y }, to: { x: r.right + 60, y: y + (Math.random() - 0.5) * 40 }, width: 4, rough: 26, fork: 60 });
          }, i * 90),
        );
        fx.flash.emit(0.55);
        fx.sfx.emit({ name: "name-reveal", volume: 0.8 });
      })
        .fromTo(
          name,
          { autoAlpha: 1, clipPath: "inset(0 100% 0 0)", filter: "brightness(2.6) blur(6px)", x: -24 },
          { clipPath: "inset(0 0% 0 0)", x: 0, duration: 0.6, ease: "expo.inOut" },
        )
        .to(name, { filter: "brightness(1) blur(0px)", duration: 0.9, ease: "power2.out" }, "-=0.2")
        .call(ready, [], "-=0.5")
        // everything else drifts in, slowly, one after another
        .fromTo(rest, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 1.3, stagger: 0.24, ease: "power2.out" }, "-=0.3")
        .add(() => {
          gsap.set(name, { clearProps: "clipPath,filter,transform" });
          name.style.animation = "";
          gsap.set(rest, { clearProps: "transform" });
        });
    };
    window.addEventListener("kaminari:reveal", intro, { once: true });
    const st = gsap.to(el.querySelector(".hero__kanji"), {
      yPercent: 25,
      ease: "none",
      scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
    });
    return () => {
      window.removeEventListener("kaminari:reveal", intro);
      st.scrollTrigger?.kill();
      st.kill();
    };
  }, []);

  return (
    <section id="hero" ref={ref} className="hero">
      <div className="hero__kanji" aria-hidden="true">雷</div>
      <div className="wrap hero__content">
        <p className="mono hero__eyebrow" data-in>
          Unit // C-01 · Breath: thunder
        </p>
        <h1 className="hero__name" data-in>
          {profile.name}
        </h1>
        <p className="mono hero__role" data-in>
          {"{ "}
          {profile.role} · {profile.tagline}
          {" }"}
        </p>
        <div className="hero__cta" data-in>
          <a href="#work" className="btn btn--volt">See missions</a>
          <a href="#contact" className="btn btn--ghost">Summon me</a>
        </div>
      </div>
      <div className="hud hud--tl mono" aria-hidden="true">
        System // <b>online</b>
        <br />
        Location // <b>{profile.location}</b>
      </div>
      <div className="hud hud--br mono" aria-hidden="true">
        Scroll to awaken ↓
      </div>
    </section>
  );
}
