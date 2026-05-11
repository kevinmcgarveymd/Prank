"use client";

import { useState, useMemo } from "react";
import type { PrankCall } from "@/lib/types";
import { useRatings, RATING_OPTIONS, type Rating } from "@/lib/useRatings";

function pickRandom<T extends { id: number }>(arr: T[], not?: number): T {
  if (arr.length <= 1) return arr[0];
  let i = Math.floor(Math.random() * arr.length);
  if (not !== undefined && arr[i].id === not) {
    i = (i + 1) % arr.length;
  }
  return arr[i];
}

export function PrankCallIdea({ calls }: { calls: PrankCall[] }) {
  const [current, setCurrent] = useState<PrankCall>(() => pickRandom(calls));
  const [justRated, setJustRated] = useState<Rating | null>(null);
  const { ratings, rate } = useRatings();
  const key = `call:${current.id}`;
  const previousRating = ratings[key];

  const handleRate = (value: Rating) => {
    rate(key, value);
    setJustRated(value);
  };

  const handleNext = () => {
    setCurrent(pickRandom(calls, current.id));
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
        📞 Reveal after ~{current.reveal_after_seconds} seconds — only call
        someone who agreed to be pranked!
      </p>
      <h2 className="idea-title">{current.title}</h2>
      <blockquote className="call-script">&ldquo;{current.script}&rdquo;</blockquote>

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
