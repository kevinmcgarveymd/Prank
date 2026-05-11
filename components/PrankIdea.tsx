"use client";

import { useState, useMemo } from "react";
import type { Prank } from "@/lib/types";
import { useRatings, RATING_OPTIONS, type Rating } from "@/lib/useRatings";

function pickRandom<T>(arr: T[], not?: number): T {
  if (arr.length <= 1) return arr[0];
  let i = Math.floor(Math.random() * arr.length);
  if (not !== undefined && (arr[i] as { id: number }).id === not) {
    i = (i + 1) % arr.length;
  }
  return arr[i];
}

export function PrankIdea({ pranks }: { pranks: Prank[] }) {
  const [current, setCurrent] = useState<Prank>(() => pickRandom(pranks));
  const [justRated, setJustRated] = useState<Rating | null>(null);
  const { ratings, rate } = useRatings();
  const key = `prank:${current.id}`;
  const previousRating = ratings[key];

  const handleRate = (value: Rating) => {
    rate(key, value);
    setJustRated(value);
  };

  const handleNext = () => {
    setCurrent(pickRandom(pranks, current.id));
    setJustRated(null);
  };

  const ratedDisplay = useMemo(() => {
    const r = justRated ?? previousRating;
    if (!r) return null;
    return RATING_OPTIONS.find((o) => o.value === r);
  }, [justRated, previousRating]);

  return (
    <div className="idea-card">
      <p className="idea-meta">
        Ages {current.age_range} · {current.duration_minutes} min ·{" "}
        {current.category}
      </p>
      <h2 className="idea-title">{current.title}</h2>
      <p className="idea-desc">{current.description}</p>

      <details className="idea-steps">
        <summary>How to do it</summary>
        <ol>
          {current.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
        {current.materials.length > 0 && (
          <p className="idea-meta" style={{ marginTop: 10 }}>
            <strong>You&apos;ll need:</strong> {current.materials.join(", ")}
          </p>
        )}
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

        {ratedDisplay && (
          <button className="next-btn" onClick={handleNext}>
            Show me another! 🎲
          </button>
        )}
      </div>
    </div>
  );
}
