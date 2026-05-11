"use client";

import { useState } from "react";
import { EthicsPledge } from "@/components/EthicsPledge";
import { PrankIdea } from "@/components/PrankIdea";
import { PrankCallIdea } from "@/components/PrankCallIdea";
import { Mascot } from "@/components/Mascot";
import { getPublishablePranks, PRANK_CATALOG } from "@/lib/catalog";

type Mode = "menu" | "prank" | "call";

export default function PranksPage() {
  const [mode, setMode] = useState<Mode>("menu");
  const pranks = getPublishablePranks();

  return (
    <main className="container">
      <EthicsPledge />
      <a href="/" className="back-link">
        ← buildapps.fun
      </a>

      <header className="hero">
        <div className="hero-mascot">
          <Mascot size={120} />
        </div>
        <h1>🎉 Prank Lab</h1>
        <p>Kind pranks that make everyone laugh.</p>
      </header>

      {mode === "menu" && (
        <section className="menu-grid">
          <button
            className="menu-btn menu-btn-pranks"
            onClick={() => setMode("prank")}
          >
            <span className="menu-emoji">🎲</span>
            <span className="menu-title">Surprise me with a prank!</span>
            <span className="menu-sub">{pranks.length} kind pranks ready</span>
          </button>
          <button
            className="menu-btn menu-btn-calls"
            onClick={() => setMode("call")}
          >
            <span className="menu-emoji">📞</span>
            <span className="menu-title">Surprise me with a prank call!</span>
            <span className="menu-sub">
              {PRANK_CATALOG.prank_calls.length} silly scripts to read
            </span>
          </button>
        </section>
      )}

      {mode !== "menu" && (
        <>
          <button className="menu-back" onClick={() => setMode("menu")}>
            ← Back to menu
          </button>
          {mode === "prank" ? (
            <PrankIdea pranks={pranks} />
          ) : (
            <PrankCallIdea calls={PRANK_CATALOG.prank_calls} />
          )}
        </>
      )}
    </main>
  );
}
