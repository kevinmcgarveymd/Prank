# CLAUDE.md — project context for Claude Code

## What this is

**Signal** is a zero-cost pipeline that turns a single seed term into MVP
concepts. Flow:

```
seed term → discover niches (Google Trends) → score each → generate
business model + MVP wireframe for top N → export HTML report
```

It runs free on the pytrends free tier. If `ANTHROPIC_API_KEY` is set, idea
generation upgrades from templates to Claude-generated output automatically.

## How to work in this repo (behavioral principles)

1. **Don't assume. Don't hide confusion. Surface tradeoffs.** If a requirement
   is ambiguous or two approaches compete, say so and lay out the options
   rather than silently picking one.
2. **Minimum code that solves the problem. Nothing speculative.** Don't add
   abstraction, config, or features for hypothetical future needs.
3. **Touch only what you must. Clean up only your own mess.** Scope changes to
   the task; don't refactor unrelated code or leave the tree half-changed.
4. **Define success criteria. Loop until verified.** State what "done" means
   before starting, then test against it and iterate until it actually passes.

## Architecture

```
backend/
  main.py        FastAPI app. Endpoints: /pipeline, /export, /analyze,
                 /searches (+ save/refresh). Serves frontend from static/ in prod.
  discover.py    seed term → candidate niche keywords (Trends related queries)
  scoring.py     niche → opportunity score (momentum / latent demand / saturation)
  generate.py    scored niche → business model + wireframe. AI path if
                 ANTHROPIC_API_KEY present, deterministic template path otherwise.
  trends.py      pytrends wrapper: 36h SQLite cache + retry/backoff for 429s.
  export.py      full run → standalone HTML report (print-to-PDF capable)
  requirements.txt
frontend/
  index.html     single-file React (CDN, no build step). Pipeline UI + export.
render.yaml      free-tier deploy config
```

## The scoring model (core domain logic)

```
opportunity_score = w1·momentum + w2·latent_demand − w3·saturation
  momentum       = normalized slope of 12-month interest series
  latent_demand  = count of "rising"/breakout related queries
  saturation     = average interest level (high = crowded → penalty)
```
Badges: `rising_low_comp` (green, the sweet spot), `mixed` (amber),
`saturated_or_flat` (red).

## Run it

```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
export ANTHROPIC_API_KEY=sk-ant-...   # optional; omit for free template mode
uvicorn main:app --reload --port 8000
```
Open `frontend/index.html` in a browser.

## Conventions

- All generation paths (AI and template) return the SAME dict shape so the
  frontend is path-agnostic. Preserve this contract if you edit generate.py.
- Trends calls are expensive and rate-limited: always go through
  `trends.fetch_keyword` (it caches). Never call pytrends directly elsewhere.
- Frontend has no build step on purpose. Keep it single-file unless asked.

## Known limitations / honest caveats

- pytrends gives RELATIVE interest (0–100), not absolute search volume.
- "Competition" is a PROXY (related-search density), not a real measurement.
- pytrends rate-limits hard; cloud IPs worse than local.

## Good next tasks (the user may ask for these)

1. **Paid competition API** — swap the saturation proxy in scoring.py for real
   data (DataForSEO or Google Ads Keyword Planner). Structure already isolates
   this; add a competition.py module and a key check like generate.py uses.
2. **Visual wireframes** — render generate.py's wireframe `screens` as actual
   boxed mockups (SVG or HTML) instead of element lists, in the frontend and export.
3. **Saved searches UI** — backend endpoints (/searches) already exist; surface
   them in the frontend (save a run, list, re-run).
4. **Real search-volume** — if a paid Trends source is added, replace the
   relative-interest series with absolute volume and update scoring normalization.

When picking up task 1 or 4, keep the free path working as a fallback (mirror
the AI-or-template pattern in generate.py).
