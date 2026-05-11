"use client";

import { useState, useMemo } from "react";
import type { PrankCall } from "@/lib/types";
import { useRatings, RATING_OPTIONS, type Rating } from "@/lib/useRatings";
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

function buildCallText(c: PrankCall) {
  return [
    `📞 PRANK CALL PLAN`,
    ``,
    `Script: ${c.title}`,
    `Reveal after about ${c.reveal_after_seconds} seconds.`,
    ``,
    `What to say:`,
    `"${c.script}"`,
    ``,
    `— from buildapps.fun`,
  ].join("\n");
}

export function PrankCallIdea({ calls }: { calls: PrankCall[] }) {
  const [current, setCurrent] = useState<PrankCall>(() => pickRandom(calls));
  const [justRated, setJustRated] = useState<Rating | null>(null);
  const [copied, setCopied] = useState(false);
  const { ratings, rate } = useRatings();
  const key = `call:${current.id}`;
  const previousRating = ratings[key];

  const handleRate = (value: Rating) => {
    rate(key, value);
    setJustRated(value);
    if (value === "love" || value === "good") burstConfetti();
  };

  const handleNext = () => {
    setCurrent(pickRandom(calls, current.id));
    setJustRated(null);
    setCopied(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildCallText(current));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const ratedDisplay = useMemo(() => {
    const r = justRated ?? previousRating;
    if (!r) return null;
    return RATING_OPTIONS.find((o) => o.value === r);
  }, [justRated, previousRating]);

  const items = [
    current.title,
    current.script,
    "📞 Reveal after about",
    "seconds — only call someone who agreed to be pranked!",
    "What did you think?",
    "Your rating:",
    "Copy script 📋",
    "Copied! ✅",
    "Show me another! 🎲",
  ];
  const { translated } = useTranslate(items);
  const [
    tTitle,
    tScript,
    lRevealPre,
    lRevealPost,
    lWhat,
    lYour,
    lCopy,
    lCopied,
    lAnother,
  ] = translated;

  return (
    <div className="idea-card">
      <span className="idea-meta">
        {lRevealPre} {current.reveal_after_seconds} {lRevealPost}
      </span>
      <h2 className="idea-title">{tTitle}</h2>
      <blockquote className="call-script">&ldquo;{tScript}&rdquo;</blockquote>

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
