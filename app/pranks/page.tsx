"use client";

import { useState, useRef } from "react";
import { PrankIdea } from "@/components/PrankIdea";
import { PrankCallIdea } from "@/components/PrankCallIdea";
import { PrankProfiler } from "@/components/PrankProfiler";
import { CodeOfHonor } from "@/components/CodeOfHonor";
import { Mascot } from "@/components/Mascot";
import { IdeaBox } from "@/components/IdeaBox";
import { LanguageBar } from "@/components/LanguageBar";
import { LangProvider } from "@/lib/LangContext";
import { useTranslate } from "@/lib/useTranslate";
import { getPublishablePranks, PRANK_CATALOG } from "@/lib/catalog";
import { bigConfetti } from "@/lib/confetti";

type Mode = "menu" | "prank" | "call" | "profiler";

const STATIC_STRINGS = [
  "🎉 Prank Lab",
  "Kind pranks that make everyone laugh.",
  "Prank Generator",
  "Tap refresh for a new kind prank",
  "Surprise me with a prank call!",
  "A silly script to read out loud",
  "Find my perfect prank!",
  "Answer 5 quick questions",
  "← Back to menu",
  "Got a kind prank or prank-call script we should add? Tell us!",
];

function PranksInner() {
  const [mode, setMode] = useState<Mode>("menu");
  const pranks = getPublishablePranks();
  const tapCount = useRef(0);
  const tapTimer = useRef<number | null>(null);
  const { translated: t } = useTranslate(STATIC_STRINGS);

  const handleLogoTap = () => {
    tapCount.current += 1;
    if (tapTimer.current) window.clearTimeout(tapTimer.current);
    tapTimer.current = window.setTimeout(() => {
      tapCount.current = 0;
    }, 1500);
    if (tapCount.current >= 5) {
      bigConfetti();
      tapCount.current = 0;
    }
  };

  return (
    <main className="container">
      <a href="/" className="back-link">
        ← buildapps.fun
      </a>

      <LanguageBar />

      <header className="hero">
        <div className="hero-mascot">
          <Mascot size={120} />
        </div>
        <h1 onClick={handleLogoTap} style={{ cursor: "pointer" }}>
          {t[0]}
        </h1>
        <p>{t[1]}</p>
      </header>

      {mode === "menu" && (
        <section className="menu-grid menu-grid-3">
          <button
            className="menu-btn menu-btn-pranks"
            onClick={() => setMode("prank")}
          >
            <span className="menu-emoji">🎲</span>
            <span className="menu-title">{t[2]}</span>
            <span className="menu-sub">{t[3]}</span>
          </button>
          <button
            className="menu-btn menu-btn-calls"
            onClick={() => setMode("call")}
          >
            <span className="menu-emoji">📞</span>
            <span className="menu-title">{t[4]}</span>
            <span className="menu-sub">{t[5]}</span>
          </button>
          <button
            className="menu-btn menu-btn-profiler"
            onClick={() => setMode("profiler")}
          >
            <span className="menu-emoji">🎯</span>
            <span className="menu-title">{t[6]}</span>
            <span className="menu-sub">{t[7]}</span>
          </button>
        </section>
      )}

      {mode !== "menu" && (
        <>
          <button className="menu-back" onClick={() => setMode("menu")}>
            {t[8]}
          </button>
          {mode === "prank" && <PrankIdea pranks={pranks} />}
          {mode === "call" && (
            <PrankCallIdea calls={PRANK_CATALOG.prank_calls} />
          )}
          {mode === "profiler" && <PrankProfiler pranks={pranks} />}
        </>
      )}

      <IdeaBox topic="prank" prompt={t[9]} emoji="🎉" />

      <CodeOfHonor />
    </main>
  );
}

export default function PranksPage() {
  return (
    <LangProvider>
      <PranksInner />
    </LangProvider>
  );
}
