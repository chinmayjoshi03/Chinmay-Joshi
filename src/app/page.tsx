import { Loader } from "@/components/Loader";
import { HudNav } from "@/components/HudNav";
import { LightningLayer } from "@/components/LightningLayer";
import { SmoothScroll } from "@/components/SmoothScroll";
import { ChantSubtitle } from "@/components/ChantSubtitle";
import { IntroCurtain } from "@/components/IntroCurtain";
import { RaikoController } from "@/character/RaikoController";
import { Hero } from "@/sections/Hero";
import { About } from "@/sections/About";
import { Skills } from "@/sections/Skills";
import { Work } from "@/sections/Work";
import { Path } from "@/sections/Path";
import { Contact } from "@/sections/Contact";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <HudNav />
      <main id="shake-root">
        <Hero />
        <About />
        <Skills />
        <Work />
        <Path />
        <Contact />
      </main>
      <IntroCurtain />
