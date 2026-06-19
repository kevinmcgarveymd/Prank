"""
main.py — FastAPI app.

Run locally:
    uvicorn main:app --reload --port 8000

Deploy to free tier later: set PORT via env, point start command at
    uvicorn main:app --host 0.0.0.0 --port $PORT
No code changes needed.
"""
from __future__ import annotations
import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

import trends
from scoring import opportunity_score
from discover import discover_pain_points
from generate import generate_for
from export import build_report
from fastapi.responses import HTMLResponse

app = FastAPI(title="Trend Opportunity Finder")

# CORS so the React dev server (localhost:5173) can call the API locally.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    keywords: list[str]
    weights: dict[str, float] | None = None


class SaveRequest(BaseModel):
    name: str
    keywords: list[str]
    weights: dict[str, float] | None = None


class PipelineRequest(BaseModel):
    seed: str
    weights: dict[str, float] | None = None
    max_points: int = 10
    generate_top: int = 4  # only generate models/wireframes for the top N (cost control)


# in-memory store of the last run, so /export can reuse it without recomputing
_last_run: dict = {}


@app.post("/pipeline")
def pipeline(req: PipelineRequest):
    """Full flow: discover pain points -> score -> generate for top N."""
    keywords = discover_pain_points(req.seed, max_points=req.max_points)

    scored = []
    for kw in keywords:
        data = trends.fetch_keyword(kw)
        s = opportunity_score(data.get("series", []), data.get("rising_count", 0), req.weights)
        scored.append({"keyword": kw, "series": data.get("series", []),
                       "cached": data.get("cached", False), **s})
    scored.sort(key=lambda r: r["score"], reverse=True)

    ideas = []
    for opp in scored[: req.generate_top]:
        gen = generate_for(opp)
        ideas.append({"opportunity": opp, "generation": gen})

    result = {"seed": req.seed, "all_scored": scored, "ideas": ideas,
              "ai_used": any(i["generation"]["source"] == "ai" for i in ideas)}
    _last_run.clear()
    _last_run.update(result)
    return result


@app.get("/export")
def export():
    """Return the last pipeline run as a standalone HTML report."""
    if not _last_run.get("ideas"):
        return HTMLResponse("<p>No run yet. Run a pipeline first.</p>", status_code=400)
    html_doc = build_report(_last_run["seed"], _last_run["ideas"])
    return HTMLResponse(html_doc)


@app.post("/analyze")
def analyze(req: AnalyzeRequest):
    results = []
    for kw in [k.strip() for k in req.keywords if k.strip()]:
        data = trends.fetch_keyword(kw)
        scored = opportunity_score(
            data.get("series", []),
            data.get("rising_count", 0),
            req.weights,
        )
        results.append(
            {
                "keyword": kw,
                "series": data.get("series", []),
                "cached": data.get("cached", False),
                "error": data.get("error"),
                **scored,
            }
        )
    results.sort(key=lambda r: r["score"], reverse=True)
    return {"results": results}


@app.get("/searches")
def get_searches():
    return {"searches": trends.list_searches()}


@app.post("/searches")
def post_search(req: SaveRequest):
    sid = trends.save_search(req.name, req.keywords, req.weights)
    return {"id": sid}


@app.get("/searches/{sid}/refresh")
def refresh_search(sid: int):
    s = trends.get_search(sid)
    if not s:
        return {"error": "not found"}
    results = []
    for kw in s["keywords"]:
        data = trends.fetch_keyword(kw)
        scored = opportunity_score(
            data.get("series", []), data.get("rising_count", 0), s["weights"]
        )
        results.append({"keyword": kw, "series": data.get("series", []), **scored})
    results.sort(key=lambda r: r["score"], reverse=True)
    return {"search": s, "results": results}


# ---- serve built frontend in production (free-tier deploy) ----
_dist = Path(__file__).parent / "static"
if _dist.exists():
    app.mount("/assets", StaticFiles(directory=_dist / "assets"), name="assets")

    @app.get("/")
    def index():
        return FileResponse(_dist / "index.html")
