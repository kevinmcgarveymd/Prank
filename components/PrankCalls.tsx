"use client";

import type { PrankCall } from "@/lib/types";

export function PrankCalls({ calls }: { calls: PrankCall[] }) {
  return (
    <div className="prank-grid">
      {calls.map((c) => (
        <article className="prank-card" key={c.id}>
          <h3>{c.title}</h3>
          <p className="meta">
            Reveal after about {c.reveal_after_seconds} seconds — only call
            someone who already agreed to be pranked!
          </p>
          <blockquote
            style={{
              margin: "8px 0 0",
              padding: "12px",
              background: "var(--bg)",
              borderRadius: 12,
              fontStyle: "italic",
            }}
          >
            &ldquo;{c.script}&rdquo;
          </blockquote>
        </article>
      ))}
    </div>
  );
}
