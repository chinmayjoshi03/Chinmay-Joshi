"use client";
/** 陸 · Summon — big strike-target links; clicking one makes Raikō bow with a thunderclap. */
import { useState } from "react";
import { contact } from "@/content/site";

export function Contact() {
  const [copied, setCopied] = useState(false);

  const bow = () => window.dispatchEvent(new Event("raiko:bow"));

  const copy = async () => {
    bow();
    try {
      await navigator.clipboard.writeText(contact.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section id="contact" className="section contact">
      <div className="wrap">
        <p className="eyebrow mono">陸 · 06 · Summon</p>
        <h2 className="contact__title">
          Need a developer
          <br />
          who moves <em>this fast?</em>
        </h2>
        <div className="contact__email">
          <span className="contact__address">{contact.email}</span>
          <button type="button" className="btn btn--volt" onClick={copy}>
            {copied ? "Copied ⚡" : "Copy email"}
          </button>
        </div>
        <ul className="contact__links">
          {contact.links.map((l) => (
            <li key={l.label}>
              <a href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" onClick={bow}>
                <span>{l.label}</span>
                <span aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <footer className="footer">
        <div className="marquee mono" aria-hidden="true">
          <div className="marquee__inner">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i}>かみなり · KAMINARI · 雷 ·&nbsp;</span>
            ))}
          </div>
        </div>
        <div className="wrap footer__row mono">
          <span>© {new Date().getFullYear()} · Built with thunder</span>
          <span>Mascot: Raikō (original character)</span>
        </div>
      </footer>
    </section>
  );
}
