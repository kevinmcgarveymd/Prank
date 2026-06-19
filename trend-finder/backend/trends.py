"""
trends.py — wraps pytrends with aggressive caching and retry/backoff.

pytrends scrapes Google's public endpoint, so it rate-limits hard (HTTP 429).
We cache every result to a local SQLite table and back off on failure.
"""
from __future__ import annotations
import json
import sqlite3
import time
from datetime import datetime, timedelta
from pathlib import Path

from pytrends.request import TrendReq

DB_PATH = Path(__file__).parent / "cache.db"
CACHE_TTL_HOURS = 36


def _conn() -> sqlite3.Connection:
    c = sqlite3.connect(DB_PATH)
    c.execute(
        """CREATE TABLE IF NOT EXISTS cache (
            keyword TEXT PRIMARY KEY,
            payload TEXT NOT NULL,
            fetched_at TEXT NOT NULL
        )"""
    )
    c.execute(
        """CREATE TABLE IF NOT EXISTS searches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            keywords TEXT NOT NULL,
            weights TEXT,
            created_at TEXT NOT NULL
        )"""
    )
    return c


def _cache_get(keyword: str) -> dict | None:
    c = _conn()
    row = c.execute(
        "SELECT payload, fetched_at FROM cache WHERE keyword = ?", (keyword,)
    ).fetchone()
    c.close()
    if not row:
        return None
    payload, fetched_at = row
    age = datetime.utcnow() - datetime.fromisoformat(fetched_at)
    if age > timedelta(hours=CACHE_TTL_HOURS):
        return None
    return json.loads(payload)


def _cache_set(keyword: str, payload: dict) -> None:
    c = _conn()
    c.execute(
        "INSERT OR REPLACE INTO cache (keyword, payload, fetched_at) VALUES (?, ?, ?)",
        (keyword, json.dumps(payload), datetime.utcnow().isoformat()),
    )
    c.commit()
    c.close()


def fetch_keyword(keyword: str, max_retries: int = 3) -> dict:
    """Return {series: [...], rising_count: int, cached: bool} for one keyword."""
    cached = _cache_get(keyword)
    if cached:
        cached["cached"] = True
        return cached

    last_err = None
    for attempt in range(max_retries):
        try:
            pt = TrendReq(hl="en-US", tz=0, timeout=(10, 25))
            pt.build_payload([keyword], timeframe="today 12-m")

            iot = pt.interest_over_time()
            series = (
                [int(v) for v in iot[keyword].tolist()]
                if not iot.empty and keyword in iot
                else []
            )

            rising_count = 0
            try:
                related = pt.related_queries()
                rq = related.get(keyword, {}) if related else {}
                rising_df = rq.get("rising") if rq else None
                if rising_df is not None and not rising_df.empty:
                    rising_count = len(rising_df)
            except Exception:
                rising_count = 0  # related queries can be flaky; degrade gracefully

            payload = {"series": series, "rising_count": rising_count, "cached": False}
            _cache_set(keyword, payload)
            return payload

        except Exception as e:  # noqa: BLE001
            last_err = e
            # exponential backoff: 2s, 4s, 8s
            time.sleep(2 ** (attempt + 1))

    return {"series": [], "rising_count": 0, "cached": False, "error": str(last_err)}


# ---- saved searches ----

def save_search(name: str, keywords: list[str], weights: dict | None) -> int:
    c = _conn()
    cur = c.execute(
        "INSERT INTO searches (name, keywords, weights, created_at) VALUES (?, ?, ?, ?)",
        (name, json.dumps(keywords), json.dumps(weights or {}), datetime.utcnow().isoformat()),
    )
    c.commit()
    sid = cur.lastrowid
    c.close()
    return sid


def list_searches() -> list[dict]:
    c = _conn()
    rows = c.execute(
        "SELECT id, name, keywords, weights, created_at FROM searches ORDER BY id DESC"
    ).fetchall()
    c.close()
    return [
        {
            "id": r[0],
            "name": r[1],
            "keywords": json.loads(r[2]),
            "weights": json.loads(r[3] or "{}"),
            "created_at": r[4],
        }
        for r in rows
    ]


def get_search(sid: int) -> dict | None:
    c = _conn()
    r = c.execute(
        "SELECT id, name, keywords, weights, created_at FROM searches WHERE id = ?", (sid,)
    ).fetchone()
    c.close()
    if not r:
        return None
    return {
        "id": r[0],
        "name": r[1],
        "keywords": json.loads(r[2]),
        "weights": json.loads(r[3] or "{}"),
        "created_at": r[4],
    }
