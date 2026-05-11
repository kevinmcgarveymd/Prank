"use client";

import type { Prank } from "@/lib/types";
import { useFavorites } from "@/lib/useFavorites";

export function PrankCard({ prank }: { prank: Prank }) {
  const { favorites, toggle } = useFavorites();
  const isFav = favorites.has(prank.id);

  return (
    <article className="prank-card">
      <button
        className="fav-btn"
        onClick={() => toggle(prank.id)}
        aria-label={isFav ? "Remove from favorites" : "Save to favorites"}
        title={isFav ? "Saved" : "Save"}
      >
        {isFav ? "★" : "☆"}
      </button>
      <h3>{prank.title}</h3>
      <p className="meta">
        Ages {prank.age_range} · {prank.duration_minutes} min · {prank.category}
      </p>
      <div className="tag-row">
        {prank.target.map((t) => (
          <span className="tag" key={t}>
            👤 {t}
          </span>
        ))}
        {prank.setting.map((s) => (
          <span className="tag" key={s}>
            📍 {s}
          </span>
        ))}
      </div>
      <p className="desc">{prank.description}</p>
      <details>
        <summary>How to do it</summary>
        <ol>
          {prank.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
        {prank.materials.length > 0 && (
          <p className="meta" style={{ marginTop: 10 }}>
            <strong>You&apos;ll need:</strong> {prank.materials.join(", ")}
          </p>
        )}
      </details>
    </article>
  );
}
