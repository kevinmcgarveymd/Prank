"""
scoring.py — derives an opportunity score from a single pytrends payload.

The whole product is this file. Everything else is plumbing.

We approximate "competition" from Trends' own data instead of paying for a
second API:
  - trend_momentum       : slope of the 12-month interest series (is it rising?)
  - rising_query_density : how many related queries are "rising"/breakout (latent demand)
  - established_volume   : average interest level (high = already saturated)

opportunity_score = w1*momentum + w2*rising_density - w3*established_volume
"""
from __future__ import annotations
import numpy as np


def _normalize(value: float, lo: float, hi: float) -> float:
    if hi == lo:
        return 0.0
    return max(0.0, min(100.0, (value - lo) / (hi - lo) * 100.0))


def trend_momentum(series: list[int]) -> float:
    """Linear-regression slope over the series, normalized to 0-100.

    A flat or declining series scores low; a steadily rising one scores high.
    """
    if not series or len(series) < 2:
        return 0.0
    x = np.arange(len(series), dtype=float)
    y = np.array(series, dtype=float)
    # slope from least squares
    slope = np.polyfit(x, y, 1)[0]
    # Map slope to 0-100 with flat (slope 0) near the low end, not the middle.
    # A strong rising trend is ~+2/wk. We map [0, 2] -> [0, 100] and clamp
    # negatives to 0, so flat and declining both score low.
    return _normalize(slope, 0.0, 2.0)


def rising_query_density(rising_count: int) -> float:
    """More rising/breakout related queries => more emerging demand.

    Cap at 25 rising queries (pytrends typically returns up to 25).
    """
    return _normalize(float(rising_count), 0.0, 25.0)


def established_volume(series: list[int]) -> float:
    """Average interest level. High average => crowded/established => penalize."""
    if not series:
        return 0.0
    return float(np.mean(series))  # already 0-100 from pytrends


def _f(x) -> float:
    """Coerce numpy scalars to plain python float for clean JSON."""
    return float(x)


def opportunity_score(
    series: list[int],
    rising_count: int,
    weights: dict[str, float] | None = None,
) -> dict:
    w = {"momentum": 0.5, "rising": 0.3, "volume": 0.2}
    if weights:
        w.update(weights)

    momentum = trend_momentum(series)
    rising = rising_query_density(rising_count)
    volume = established_volume(series)

    raw = w["momentum"] * momentum + w["rising"] * rising - w["volume"] * volume
    score = max(0.0, min(100.0, raw))

    # classification badge
    if momentum >= 55 and volume <= 45:
        badge = "rising_low_comp"   # 🟢 the sweet spot
    elif momentum >= 40:
        badge = "mixed"             # 🟡
    else:
        badge = "saturated_or_flat" # 🔴

    return {
        "score": round(_f(score), 1),
        "momentum": round(_f(momentum), 1),
        "rising": round(_f(rising), 1),
        "volume": round(_f(volume), 1),
        "badge": badge,
    }
