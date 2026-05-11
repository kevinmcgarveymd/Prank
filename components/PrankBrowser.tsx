"use client";

import { useMemo, useState } from "react";
import type { Prank, PrankSetting, PrankTarget } from "@/lib/types";
import { PrankCard } from "./PrankCard";

const TARGETS: PrankTarget[] = ["self", "sibling", "parent", "family", "anyone"];
const SETTINGS: PrankSetting[] = ["home", "school"];
const DURATIONS = [
  { label: "Quick (≤5 min)", max: 5 },
  { label: "Medium (≤15 min)", max: 15 },
  { label: "Long (any)", max: Infinity },
];

export function PrankBrowser({ pranks }: { pranks: Prank[] }) {
  const [target, setTarget] = useState<PrankTarget | null>(null);
  const [setting, setSetting] = useState<PrankSetting | null>(null);
  const [maxMinutes, setMaxMinutes] = useState<number>(Infinity);

  const filtered = useMemo(() => {
    return pranks.filter((p) => {
      if (target && !p.target.includes(target)) return false;
      if (setting && !p.setting.includes(setting)) return false;
      if (p.duration_minutes > maxMinutes) return false;
      return true;
    });
  }, [pranks, target, setting, maxMinutes]);

  return (
    <>
      <section className="filters" aria-label="Prank filters">
        <div className="filter-row">
          <span className="filter-label">Who?</span>
          {TARGETS.map((t) => (
            <button
              key={t}
              className={`chip ${target === t ? "active" : ""}`}
              onClick={() => setTarget(target === t ? null : t)}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="filter-row">
          <span className="filter-label">Where?</span>
          {SETTINGS.map((s) => (
            <button
              key={s}
              className={`chip ${setting === s ? "active" : ""}`}
              onClick={() => setSetting(setting === s ? null : s)}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="filter-row">
          <span className="filter-label">How long?</span>
          {DURATIONS.map((d) => (
            <button
              key={d.label}
              className={`chip ${maxMinutes === d.max ? "active" : ""}`}
              onClick={() => setMaxMinutes(d.max)}
            >
              {d.label}
            </button>
          ))}
        </div>
      </section>

      <p className="results-meta">
        {filtered.length} prank{filtered.length === 1 ? "" : "s"} ready to go
      </p>

      {filtered.length === 0 ? (
        <div className="empty">
          No pranks match those filters. Try clearing one.
        </div>
      ) : (
        <div className="prank-grid">
          {filtered.map((p) => (
            <PrankCard key={p.id} prank={p} />
          ))}
        </div>
      )}
    </>
  );
}
