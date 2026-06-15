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
