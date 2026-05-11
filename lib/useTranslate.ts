"use client";

import { useEffect, useState } from "react";
import { useLang } from "./LangContext";

const memoryCache: Record<string, string> = {};
const inflight: Record<string, Promise<string[]>> = {};

function cacheKey(lang: string, item: string) {
  return `t:${lang}:${item}`;
}

function loadFromStorage(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function saveToStorage(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {}
}

async function translateBatch(
  lang: string,
  items: string[],
): Promise<string[]> {
  const r = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lang, items }),
  });
  if (!r.ok) throw new Error("translate failed");
  const data = (await r.json()) as { items?: string[] };
  if (!Array.isArray(data.items) || data.items.length !== items.length) {
    throw new Error("bad shape");
  }
  return data.items;
}

/**
 * Translate the given strings to the active language. Returns the
 * originals immediately when lang === "en" or while a translation is
 * loading, then re-renders with the translated values once they arrive.
 */
export function useTranslate(items: string[]): {
  translated: string[];
  loading: boolean;
} {
  const { lang } = useLang();
  const itemsKey = items.join("§");
  const [, force] = useState(0);

  useEffect(() => {
    if (lang === "en") return;
    const need = items.filter((s) => memoryCache[cacheKey(lang, s)] == null);

    // Try sessionStorage hydration first
    const stillNeed: string[] = [];
    for (const s of need) {
      const k = cacheKey(lang, s);
      const stored = loadFromStorage(k);
      if (stored !== null) {
        memoryCache[k] = stored;
      } else {
        stillNeed.push(s);
      }
    }
    if (stillNeed.length > 0) {
      const batchKey = `${lang}${stillNeed.join("§")}`;
      if (!inflight[batchKey]) {
        inflight[batchKey] = translateBatch(lang, stillNeed)
          .then((translated) => {
            translated.forEach((t, i) => {
              memoryCache[cacheKey(lang, stillNeed[i])] = t;
              saveToStorage(cacheKey(lang, stillNeed[i]), t);
            });
            return translated;
          })
          .catch(() => {
            stillNeed.forEach((s) => {
              memoryCache[cacheKey(lang, s)] = s;
            });
            return stillNeed;
          })
          .finally(() => {
            delete inflight[batchKey];
            force((n) => n + 1);
          });
      }
    } else {
      force((n) => n + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, itemsKey]);

  if (lang === "en") {
    return { translated: items, loading: false };
  }

  let loading = false;
  const translated = items.map((s) => {
    const v = memoryCache[cacheKey(lang, s)];
    if (v == null) {
      loading = true;
      return s;
    }
    return v;
  });
  return { translated, loading };
}
