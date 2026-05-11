"use client";

import { useState, useRef } from "react";
import { PrankIdea } from "@/components/PrankIdea";
import { PrankCallIdea } from "@/components/PrankCallIdea";
import { PrankProfiler } from "@/components/PrankProfiler";
import { CodeOfHonor } from "@/components/CodeOfHonor";
import { Mascot } from "@/components/Mascot";
import { getPublishablePranks, PRANK_CATALOG } from "@/lib/catalog";
import { bigConfetti } from "@/lib/confetti";

type Mode = "menu" | "prank" | "call" | "profiler";

export default function PranksPage() {
  const [mode, setMode] = useState<Mode>("menu");
  const pranks = getPublishablePranks();
  const tapCount = useRef(0);
  const tapTimer = useRef<number | null>(null);

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

      <header className="hero">
        <div className="hero-mascot">
          <Mascot size={120} />
        </div>
        <h1 onClick={handleLogoTap} style={{ cursor: "pointer" }}>
          🎉 Prank Lab
        </h1>
        <p>Kind pranks that make everyone laugh.</p>
      </header>

      {mode === "menu" && (
        <section className="menu-grid menu-grid-3">
          <button
            className="menu-btn menu-btn-pranks"
            onClick={() => setMode("prank")}
          >
            <span className="menu-emoji">🎲</span>
            <span className="menu-title">Surprise me with a prank!</span>
            <span className="menu-sub">A random kind prank, just for you</span>
          </button>
          <button
            className="menu-btn menu-btn-calls"
            onClick={() => setMode("call")}
          >
            <span className="menu-emoji">📞</span>
            <span className="menu-title">Surprise me with a prank call!</span>
            <span className="menu-sub">A silly script to read out loud</span>
          </button>
          <button
            className="menu-btn menu-btn-profiler"
            onClick={() => setMode("profiler")}
          >
            <span className="menu-emoji">🎯</span>
            <span className="menu-title">Find my perfect prank!</span>
            <span className="menu-sub">Answer 5 quick questions</span>
          </button>
        </section>
      )}

      {mode !== "menu" && (
        <>
          <button className="menu-back" onClick={() => setMode("menu")}>
            ← Back to menu
          </button>
          {mode === "prank" && <PrankIdea pranks={pranks} />}
          {mode === "call" && (
            <PrankCallIdea calls={PRANK_CATALOG.prank_calls} />
          )}
          {mode === "profiler" && <PrankProfiler pranks={pranks} />}
        </>
      )}

      <CodeOfHonor />
    </main>
  );
}
