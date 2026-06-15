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
