"use client";

import { useEffect, useState } from "react";

const KEY = "prank-favorites-v1";

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setFavorites(new Set(JSON.parse(raw)));
    } catch {}
  }, []);

  const toggle = (id: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(KEY, JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  return { favorites, toggle };
}
