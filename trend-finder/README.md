# Signal — Pain Point → MVP Pipeline

Enter one broad seed term. Signal:

1. **Discovers** rising sub-niches from Google Trends related queries
2. **Scores** each for momentum + a competition proxy
3. **Generates** a business model + MVP wireframe for the top N
4. **Exports** the whole run as a standalone HTML report (print to PDF if you want)

Runs at **$0** on the free tier. If you add an Anthropic API key, idea
generation upgrades from templates to tailored AI output automatically.

```
opportunity_score = w1·momentum + w2·latent_demand − w3·saturation
```

---

## Run locally (zero cost)

**1. Backend**
```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**2. Frontend** — just open `frontend/index.html` in your browser.
It auto-points at `http://localhost:8000` when opened as a file.

That's it. No build step, no keys, no database setup (SQLite file is created
automatically).

### Optional: upgrade idea generation to AI

By default, business models and wireframes come from deterministic templates
(free). To get tailored output from Claude instead, set a key before starting
the backend:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
uvicorn main:app --reload --port 8000
```

The app detects the key and switches automatically. Cost is roughly a cent or
two per idea generated. No key = templates, no errors. The status bar in the UI
shows which path ran.

### How the pipeline maps to files

- `discover.py` — seed term → candidate niches (Trends related queries)
- `scoring.py` — niche → opportunity score (momentum / demand / saturation)
- `generate.py` — scored niche → business model + wireframe (AI or template)
- `export.py` — full run → standalone HTML report
- `main.py` — ties them together behind `/pipeline` and `/export`

---

## Notes on the free data path

- Uses **pytrends**, which scrapes Google's public endpoint. It rate-limits
  hard (HTTP 429). The app caches every result ~36h and retries with backoff,
  but if you analyze many new keywords fast you'll hit limits — space them out.
- pytrends gives **relative interest (0–100)**, not absolute search volume.
  Scores are comparative within your keyword set, not universal.
- "Competition" is approximated, not measured. For real competition/CPC data
  you'd add a paid source (DataForSEO, Google Ads Keyword Planner) — the
  scoring module is structured so you can drop that in later.

---

## Deploy to a free tier later

The backend already serves a built frontend from `backend/static/` if present,
and reads `$PORT`. To deploy on **Render free tier**:

1. Copy `frontend/index.html` → `backend/static/index.html`
   (and adjust the API constant to `''` so it uses same-origin).
2. Push to GitHub.
3. New Render Web Service → build `pip install -r requirements.txt`,
   start `uvicorn main:app --host 0.0.0.0 --port $PORT`.

`render.yaml` is included for one-click setup.

> Heads-up: free hosts use shared IPs that Google rate-limits more aggressively,
> so pytrends is flakier in the cloud than on your machine. Caching helps. For
> reliable cloud use, switch to a paid Trends source.
