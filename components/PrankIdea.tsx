"use client";

import { useState, useMemo } from "react";
import type { Prank } from "@/lib/types";
import { useRatings, RATING_OPTIONS, type Rating } from "@/lib/useRatings";
import { pickRandomTiming } from "@/lib/timings";
import { burstConfetti } from "@/lib/confetti";
import { useTranslate } from "@/lib/useTranslate";

function pickRandom<T extends { id: number }>(arr: T[], not?: number): T {
  if (arr.length <= 1) return arr[0];
  let i = Math.floor(Math.random() * arr.length);
  if (not !== undefined && arr[i].id === not) {
    i = (i + 1) % arr.length;
  }
  return arr[i];
}

function buildPlanText(p: Prank, timing: string) {
  return [
    `🎯 PRANK PLAN`,
    ``,
    `Prank: ${p.title}`,
    `Who: ${p.target.join(", ")}`,
    `Where: ${p.setting.join(", ")}`,
    `When: ${timing}`,
    `You'll need: ${p.materials.join(", ") || "nothing"}`,
    ``,
    `${p.description}`,
    ``,
    `How to do it:`,
    ...p.steps.map((s, i) => `${i + 1}. ${s}`),
    ``,
    `— from buildapps.fun`,
  ].join("\n");
}

export function PrankIdea({
  pranks,
  initial,
}: {
  pranks: Prank[];
  initial?: Prank;
}) {
  const [current, setCurrent] = useState<Prank>(
    () => initial ?? pickRandom(pranks)
  );
  const [timing, setTiming] = useState<string>(() => pickRandomTiming());
  const [justRated, setJustRated] = useState<Rating | null>(null);
  const [copied, setCopied] = useState(false);
  const { ratings, rate } = useRatings();
  const key = `prank:${current.id}`;
  const previousRating = ratings[key];

  const handleRate = (value: Rating) => {
    rate(key, value);
    setJustRated(value);
    if (value === "love" || value === "good") burstConfetti();
  };

  const handleNext = () => {
    setCurrent(pickRandom(pranks, current.id));
    setTiming(pickRandomTiming(timing));
    setJustRated(null);
    setCopied(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildPlanText(current, timing));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const ratedDisplay = useMemo(() => {
    const r = justRated ?? previousRating;
    if (!r) return null;
    return RATING_OPTIONS.find((o) => o.value === r);
  }, [justRated, previousRating]);

  // Translatable content + UI labels (must be a stable-ordered array)
  const noMaterials = "nothing!";
  const dynamic = [
    current.title,
    current.description,
    current.category,
    timing,
    ...current.target,
    ...current.materials,
    ...current.steps,
  ];
  const labels = [
    "Who",
    "When",
    "You'll need",
    "How to do it",
    "What did you think?",
    "Your rating:",
    "Copy plan 📋",
    "Copied! ✅",
    "Show me another! 🎲",
    "↻ New prank",
    "Get a new prank",
    "Ages",
    "min",
    "or",
    noMaterials,
  ];
  const { translated, loading } = useTranslate([...dynamic, ...labels]);
  const dyn = translated.slice(0, dynamic.length);
  const lbl = translated.slice(dynamic.length);

  let cursor = 0;
  const tTitle = dyn[cursor++];
  const tDescription = dyn[cursor++];
  const tCategory = dyn[cursor++];
  const tTiming = dyn[cursor++];
  const tTarget = dyn.slice(cursor, cursor + current.target.length);
  cursor += current.target.length;
  const tMaterials = dyn.slice(cursor, cursor + current.materials.length);
  cursor += current.materials.length;
  const tSteps = dyn.slice(cursor, cursor + current.steps.length);

  const [
    lWho,
    lWhen,
    lNeed,
    lHow,
    lWhat,
    lYour,
    lCopy,
    lCopied,
    lAnother,
    lNewPrank,
    lAriaNew,
    lAges,
    lMin,
    lOr,
    lNothing,
  ] = lbl;

  return (
    <div className="idea-card">
      <div className="idea-top-row">
        <span className="idea-meta">
          {lAges} {current.age_range} · {current.duration_minutes} {lMin} ·{" "}
          {tCategory}
        </span>
        <button
          className="refresh-btn"
          onClick={handleNext}
          aria-label={lAriaNew}
          title={lAriaNew}
        >
          {lNewPrank}
        </button>
      </div>
      <h2 className="idea-title">
        {tTitle}
        {loading && <span className="translating-pill">…</span>}
      </h2>
      <p className="idea-desc">{tDescription}</p>

      <div className="plan-grid">
        <div className="plan-cell plan-who">
          <span className="plan-label">{lWho}</span>
          <span className="plan-value">{tTarget.join(` ${lOr} `)}</span>
        </div>
        <div className="plan-cell plan-when">
          <span className="plan-label">{lWhen}</span>
          <span className="plan-value">{tTiming}</span>
        </div>
        <div className="plan-cell plan-need">
          <span className="plan-label">{lNeed}</span>
          <span className="plan-value">
            {tMaterials.length ? tMaterials.join(", ") : lNothing}
          </span>
        </div>
      </div>

      <details className="idea-steps" open>
        <summary>{lHow}</summary>
        <ol>
          {tSteps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </details>

      <div className="rating-section">
        <p className="rating-prompt">{ratedDisplay ? lYour : lWhat}</p>
        {ratedDisplay ? (
          <div className="rating-confirm">
            <span className="rating-confirm-emoji">{ratedDisplay.emoji}</span>
            <span className="rating-confirm-label">{ratedDisplay.label}</span>
          </div>
        ) : (
          <div className="rating-row">
            {RATING_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className="rating-btn"
                onClick={() => handleRate(opt.value)}
                aria-label={opt.label}
              >
                <span className="rating-emoji">{opt.emoji}</span>
                <span className="rating-label">{opt.label}</span>
              </button>
            ))}
          </div>
        )}

        <div className="action-row">
          <button className="copy-btn" onClick={handleCopy}>
            {copied ? lCopied : lCopy}
          </button>
          {ratedDisplay && (
            <button className="next-btn" onClick={handleNext}>
              {lAnother}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
