"use client";

import { useEffect, useState } from "react";

export type Rating = "love" | "good" | "meh" | "mean";

const KEY = "prank-ratings-v1";

type RatingMap = Record<string, Rating>;

export function useRatings() {
  const [ratings, setRatings] = useState<RatingMap>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setRatings(JSON.parse(raw));
    } catch {}
  }, []);

  const rate = (idKey: string, value: Rating) => {
    setRatings((prev) => {
      const next = { ...prev, [idKey]: value };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  return { ratings, rate };
}

export const RATING_OPTIONS: { value: Rating; emoji: string; label: string }[] = [
  { value: "love", emoji: "🤣", label: "Hilarious" },
  { value: "good", emoji: "🙂", label: "Pretty good" },
  { value: "meh", emoji: "😐", label: "Meh" },
  { value: "mean", emoji: "🚫", label: "Too mean" },
];
