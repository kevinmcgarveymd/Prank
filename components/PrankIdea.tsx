"use client";

import { useState, useMemo } from "react";
import type { Prank } from "@/lib/types";
import { useRatings, RATING_OPTIONS, type Rating } from "@/lib/useRatings";
import { pickRandomTiming } from "@/lib/timings";
import { burstConfetti } from "@/lib/confetti";

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

  return (
    <div className="idea-card">
      <div className="idea-top-row">
        <span className="idea-meta">
          Ages {current.age_range} · {current.duration_minutes} min ·{" "}
          {current.category}
        </span>
        <button
          className="refresh-btn"
          onClick={handleNext}
          aria-label="Get a new prank"
          title="Get a new prank"
        >
          ↻ New prank
        </button>
      </div>
      <h2 className="idea-title">{current.title}</h2>
      <p className="idea-desc">{current.description}</p>

      <div className="plan-grid">
        <div className="plan-cell plan-who">
          <span className="plan-label">Who</span>
          <span className="plan-value">{current.target.join(" or ")}</span>
        </div>
        <div className="plan-cell plan-when">
          <span className="plan-label">When</span>
          <span className="plan-value">{timing}</span>
        </div>
        <div className="plan-cell plan-need">
          <span className="plan-label">You&apos;ll need</span>
          <span className="plan-value">
            {current.materials.length ? current.materials.join(", ") : "nothing!"}
          </span>
        </div>
      </div>

      <details className="idea-steps" open>
        <summary>How to do it</summary>
        <ol>
          {current.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </details>

      <div className="rating-section">
        <p className="rating-prompt">
          {ratedDisplay ? "Your rating:" : "What did you think?"}
        </p>
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
            {copied ? "Copied! ✅" : "Copy plan 📋"}
          </button>
          {ratedDisplay && (
            <button className="next-btn" onClick={handleNext}>
              Show me another! 🎲
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
