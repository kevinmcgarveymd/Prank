"""
discover.py — turn a seed term into candidate pain points.

Instead of the user hand-typing keywords, we expand a seed term using Trends'
related queries (especially "rising"/breakout ones) and a small set of
pain-signal modifiers. The result is a list of candidate niches to score.

Free-tier only: everything here comes from pytrends.
"""
from __future__ import annotations

from pytrends.request import TrendReq

# Phrases that, combined with a seed, tend to surface real problems people
# are actively searching to solve. Kept short to limit API calls.
PAIN_MODIFIERS = [
    "software", "tool", "automation", "alternative",
    "how to", "problem", "for small business",
]


def discover_pain_points(seed: str, max_points: int = 12) -> list[str]:
    """Return candidate pain-point keywords expanded from a seed term.

    Strategy:
      1. Pull related queries for the seed (rising first — those are emerging).
      2. Add a few seed+modifier combinations as fallback candidates.
      3. Dedupe, cap at max_points.
    """
    candidates: list[str] = []

    try:
        pt = TrendReq(hl="en-US", tz=0, timeout=(10, 25))
        pt.build_payload([seed], timeframe="today 12-m")
        related = pt.related_queries()
        rq = related.get(seed, {}) if related else {}

        # rising queries are the emerging pain points — prioritize them
        rising = rq.get("rising")
        if rising is not None and not rising.empty:
            candidates += rising["query"].head(max_points).tolist()

        # top queries fill in established-but-relevant terms
        top = rq.get("top")
        if top is not None and not top.empty:
            candidates += top["query"].head(max_points // 2).tolist()
    except Exception:
        pass  # fall through to modifier-based candidates

    # always include a few seed+modifier combos so we never return empty
    for m in PAIN_MODIFIERS:
        candidates.append(f"{seed} {m}")

    # dedupe preserving order, drop the bare seed, cap
    seen, out = set(), []
    for c in candidates:
        c = c.strip().lower()
        if c and c != seed.lower() and c not in seen:
            seen.add(c)
            out.append(c)
        if len(out) >= max_points:
            break
    return out
