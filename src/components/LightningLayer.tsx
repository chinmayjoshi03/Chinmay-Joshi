"use client";
/** Full-screen canvas for bolts (incl. arcs around the hero name), a white flash overlay, cursor glow and screen shake. */
import { useEffect, useRef } from "react";
import { fx, prefersReducedMotion, type BoltRequest } from "@/lib/fx";

type Bolt = { pts: [number, number][]; branches: [number, number][][]; life: number; width: number };

function jag(from: { x: number; y: number }, to: { x: number; y: number }, rough: number, segs = 16) {
  const pts: [number, number][] = [[from.x, from.y]];
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  for (let i = 1; i < segs; i++) {
    const t = i / segs;
    const off = (Math.random() - 0.5) * rough * Math.sin(Math.PI * t) * 2;
    pts.push([from.x + dx * t + nx * off, from.y + dy * t + ny * off]);
  }
  pts.push([to.x, to.y]);
  return pts;
}

export function LightningLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cv = canvasRef.current!;
    const ctx = cv.getContext("2d")!;
    const reduce = prefersReducedMotion();
    let W = 0;
    let H = 0;
    let bolts: Bolt[] = [];
    let raf = 0;

    const size = () => {
      const d = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = W * d;
      cv.height = H * d;
      ctx.setTransform(d, 0, 0, d, 0, 0);
    };
    size();
    window.addEventListener("resize", size);

    const addBolt = ({ from, to, width = 4, rough = 40, fork = 120 }: BoltRequest) => {
      const pts = jag(from, to, rough);
      const branches: [number, number][][] = [];
      for (let i = 3; i < pts.length - 3; i += 4) {
        if (Math.random() < 0.5) continue;
        const [bx, by] = pts[i];
        branches.push(jag({ x: bx, y: by }, { x: bx + (Math.random() - 0.5) * fork, y: by + fork * (0.33 + Math.random() * 0.5) }, rough * 0.5, 6));
      }
      bolts.push({ pts, branches, life: 1, width });
    };

    const stroke = (pts: [number, number][], w: number, alpha: number) => {
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.shadowColor = "#ffd21f";
      ctx.shadowBlur = 22;
      ctx.strokeStyle = "#ffd21f";
      ctx.lineWidth = w;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#eaf6ff";
      ctx.lineWidth = w / 2.6;
      ctx.stroke();
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.lineJoin = "miter";
      for (const b of bolts) {
        stroke(b.pts, b.width, b.life);
        b.branches.forEach((br) => stroke(br, b.width * 0.45, b.life * 0.8));
        b.life -= 0.045;
      }
      ctx.globalAlpha = 1;
      bolts = bolts.filter((b) => b.life > 0);
      // ambient sky bolts near the top of the screen
      if (!reduce && !document.hidden && Math.random() < 0.0025) {
        const x = W * (0.3 + Math.random() * 0.65);
        addBolt({ from: { x, y: -10 }, to: { x: x + (Math.random() - 0.5) * 160, y: H * (0.18 + Math.random() * 0.25) }, width: 2.5, rough: 60 });
      }
      if (!reduce && !document.hidden && !document.documentElement.classList.contains("is-intro")) chargeName();
      raf = requestAnimationFrame(draw);
    };

    // short arcs hop along the edges of each line of the hero name, now and then one runs through it
    let nameAt = 0;
    let nameEl: HTMLElement | null = null;
    const chargeName = () => {
      const now = performance.now();
      if (now < nameAt) return;
      nameAt = now + 140 + Math.random() * 450;
      nameEl ??= document.querySelector<HTMLElement>(".hero__name");
      if (!nameEl) return;
      const range = document.createRange();
      range.selectNodeContents(nameEl);
      const lines = Array.from(range.getClientRects()).filter((r) => r.width > 40 && r.top > 60 && r.bottom < H);
      if (!lines.length) return;
      const r = lines[Math.floor(Math.random() * lines.length)];
      const trim = r.height * 0.11; // display type has tall line boxes
      const x0 = r.left - 2;
      const y0 = r.top + trim - 2;
      const w = r.width + 4;
      const h = r.height - trim * 2 + 4;
      if (Math.random() < 0.12) {
        const y = y0 + h * (0.2 + Math.random() * 0.6);
        addBolt({ from: { x: x0, y }, to: { x: x0 + w, y: y + (Math.random() - 0.5) * 30 }, width: 2.2, rough: 22 });
        return;
      }
      const per = 2 * (w + h);
      const at = (d: number) => {
        d = ((d % per) + per) % per;
        if (d < w) return { x: x0 + d, y: y0 };
        if (d < w + h) return { x: x0 + w, y: y0 + d - w };
        if (d < 2 * w + h) return { x: x0 + w - (d - w - h), y: y0 + h };
        return { x: x0, y: y0 + h - (d - 2 * w - h) };
      };
      const d = Math.random() * per;
      addBolt({ from: at(d), to: at(d + 70 + Math.random() * 190), width: 2.2, rough: 13, fork: 22 });
    };
    raf = requestAnimationFrame(draw);

    const offBolt = fx.bolt.on(addBolt);
    const offFlash = fx.flash.on((v) => {
      if (reduce) return;
      flashRef.current?.animate([{ opacity: v }, { opacity: 0 }], { duration: 280, easing: "ease-out" });
    });
    const offShake = fx.shake.on((px) => {
      if (reduce) return;
      const root = document.getElementById("shake-root");
      root?.animate(
        [
          { transform: "translate(0,0)" },
          { transform: `translate(${px}px,${-px / 2}px)` },
          { transform: `translate(${-px}px,${px / 2}px)` },
          { transform: "translate(0,0)" },
        ],
        { duration: 220 },
      );
    });

    const onMove = (e: PointerEvent) => {
      glowRef.current?.style.setProperty("--gx", `${e.clientX}px`);
      glowRef.current?.style.setProperty("--gy", `${e.clientY}px`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
      window.removeEventListener("pointermove", onMove);
      offBolt();
      offFlash();
      offShake();
    };
  }, []);

  return (
    <>
      <div ref={glowRef} className="cursor-glow" aria-hidden="true" />
      <canvas ref={canvasRef} className="lightning" aria-hidden="true" />
      <div ref={flashRef} className="flash" aria-hidden="true" />
    </>
  );
}
