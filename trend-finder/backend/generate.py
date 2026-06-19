"""
generate.py — turn a scored opportunity into a business model + MVP wireframe.

Two paths, chosen automatically:
  - If ANTHROPIC_API_KEY is set -> call Claude for tailored output.
  - Otherwise -> deterministic templates derived from the score signals.

Both paths return the SAME shape, so the frontend doesn't care which ran.
"""
from __future__ import annotations
import json
import os
import urllib.request

MODEL = "claude-sonnet-4-6"


# --------------------------------------------------------------------------
# Shared output shape
# --------------------------------------------------------------------------
# {
#   "keyword": str,
#   "source": "ai" | "template",
#   "business_model": {
#       "problem": str, "segment": str, "value_prop": str,
#       "solution": str, "revenue": str, "channels": str, "moat": str
#   },
#   "wireframe": { "title": str, "screens": [ {name, elements:[...]} ] }
# }


def _signal_summary(opp: dict) -> str:
    m, r, v = opp.get("momentum", 0), opp.get("rising", 0), opp.get("volume", 0)
    parts = []
    parts.append("rising fast" if m >= 55 else "rising modestly" if m >= 40 else "flat/declining")
    parts.append("strong latent demand" if r >= 50 else "some latent demand" if r >= 25 else "thin demand")
    parts.append("crowded" if v >= 55 else "moderately contested" if v >= 35 else "uncrowded")
    return ", ".join(parts)


# --------------------------------------------------------------------------
# AI path
# --------------------------------------------------------------------------
def _ai_generate(opp: dict) -> dict | None:
    key = os.environ.get("ANTHROPIC_API_KEY")
    if not key:
        return None

    kw = opp["keyword"]
    prompt = f"""You are a pragmatic startup strategist. A market-signal tool flagged this niche:

Niche: "{kw}"
Signal read: {_signal_summary(opp)}
(momentum {opp.get('momentum')}, latent demand {opp.get('rising')}, saturation {opp.get('volume')} — all 0-100)

Produce a concise, realistic MVP concept. Respond with ONLY valid JSON, no prose, no markdown fences, in exactly this schema:
{{
  "business_model": {{
    "problem": "one sentence, the specific pain",
    "segment": "who exactly, narrow",
    "value_prop": "one sentence",
    "solution": "what the MVP actually does, 1-2 sentences",
    "revenue": "pricing model + rough price point",
    "channels": "how first 100 users are reached",
    "moat": "why this is defensible or honestly, why it may not be"
  }},
  "wireframe": {{
    "title": "product working name",
    "screens": [
      {{"name": "screen name", "elements": ["element", "element", "element"]}}
    ]
  }}
}}
Make 2-3 screens. Be specific to this niche, not generic. If the signal looks weak, let the model reflect that honestly."""

    body = json.dumps({
        "model": MODEL,
        "max_tokens": 1024,
        "messages": [{"role": "user", "content": prompt}],
    }).encode()

    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=body,
        headers={
            "content-type": "application/json",
            "x-api-key": key,
            "anthropic-version": "2023-06-01",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read())
        text = "".join(b.get("text", "") for b in data.get("content", []) if b.get("type") == "text")
        text = text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        parsed = json.loads(text)
        return {
            "keyword": kw,
            "source": "ai",
            "business_model": parsed["business_model"],
            "wireframe": parsed["wireframe"],
        }
    except Exception:
        return None  # any failure -> caller falls back to template


# --------------------------------------------------------------------------
# Template path (zero cost, always works)
# --------------------------------------------------------------------------
def _template_generate(opp: dict) -> dict:
    kw = opp["keyword"]
    title = " ".join(w.capitalize() for w in kw.split()[:3]) or "Untitled"
    crowded = opp.get("volume", 0) >= 55
    rising = opp.get("momentum", 0) >= 40

    moat = (
        "Likely thin — this space is contested; differentiation must come from a sharp niche focus."
        if crowded else
        "Early-mover timing in an uncrowded, rising niche is the main advantage; defend with depth."
    )
    revenue = "Flat SaaS subscription, ~$29–79/mo per seat; annual discount." if rising else \
              "Usage-based or low entry price to test willingness to pay before committing."

    return {
        "keyword": kw,
        "source": "template",
        "business_model": {
            "problem": f"People searching \"{kw}\" lack a focused tool and patch the gap with spreadsheets or manual work.",
            "segment": f"Small teams and solo operators dealing with {kw} who can't justify enterprise software.",
            "value_prop": f"The simplest dedicated way to handle {kw}, without the bloat.",
            "solution": f"A focused web app that automates the core {kw} workflow end to end.",
            "revenue": revenue,
            "channels": "SEO around the exact search terms that surfaced this niche; targeted communities; founder-led outreach.",
            "moat": moat,
        },
        "wireframe": {
            "title": title,
            "screens": [
                {"name": "Dashboard", "elements": [
                    "Header: product name + primary CTA",
                    f"Summary cards: current {kw} status",
                    "Recent activity list", "Empty-state: 'Add your first item'"]},
                {"name": "Core workflow", "elements": [
                    "Input form for the main task", "Live preview / result panel",
                    "Save + share actions", "Inline help hint"]},
                {"name": "Settings / billing", "elements": [
                    "Plan selector", "Team members", "Integrations toggle"]},
            ],
        },
    }


# --------------------------------------------------------------------------
# Public entry
# --------------------------------------------------------------------------
def generate_for(opp: dict) -> dict:
    """AI if a key is present and the call succeeds; otherwise template."""
    return _ai_generate(opp) or _template_generate(opp)
