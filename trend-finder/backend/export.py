"""
export.py — render a full pipeline run to a standalone HTML report.

HTML (not PDF) keeps it zero-dependency and the user can print-to-PDF from the
browser if they want a PDF. Returns an HTML string.
"""
from __future__ import annotations
import html
from datetime import datetime

BADGE_LABEL = {
    "rising_low_comp": ("●", "#16a34a", "Rising · low competition"),
    "mixed": ("●", "#ca8a04", "Mixed signal"),
    "saturated_or_flat": ("●", "#dc2626", "Saturated or flat"),
}


def _esc(s) -> str:
    return html.escape(str(s))


def build_report(seed: str, ideas: list[dict]) -> str:
    rows = ""
    for it in ideas:
        opp = it["opportunity"]
        gen = it["generation"]
        bm = gen["business_model"]
        wf = gen["wireframe"]
        sym, col, lbl = BADGE_LABEL.get(opp.get("badge", "mixed"), BADGE_LABEL["mixed"])

        screens = ""
        for sc in wf.get("screens", []):
            els = "".join(f"<li>{_esc(e)}</li>" for e in sc.get("elements", []))
            screens += f"<div class='screen'><h5>{_esc(sc.get('name'))}</h5><ul>{els}</ul></div>"

        rows += f"""
        <section class="idea">
          <div class="idea-head">
            <h3>{_esc(opp['keyword'])}</h3>
            <span class="score">{opp.get('score')}</span>
          </div>
          <p class="meta"><span style="color:{col}">{sym}</span> {lbl}
             &nbsp;·&nbsp; momentum {opp.get('momentum')} · demand {opp.get('rising')} · saturation {opp.get('volume')}
             &nbsp;·&nbsp; <em>{gen.get('source')} generated</em></p>
          <div class="grid">
            <div class="bm">
              <h4>Business model</h4>
              <dl>
                <dt>Problem</dt><dd>{_esc(bm['problem'])}</dd>
                <dt>Segment</dt><dd>{_esc(bm['segment'])}</dd>
                <dt>Value prop</dt><dd>{_esc(bm['value_prop'])}</dd>
                <dt>Solution</dt><dd>{_esc(bm['solution'])}</dd>
                <dt>Revenue</dt><dd>{_esc(bm['revenue'])}</dd>
                <dt>Channels</dt><dd>{_esc(bm['channels'])}</dd>
                <dt>Moat</dt><dd>{_esc(bm['moat'])}</dd>
              </dl>
            </div>
            <div class="wf">
              <h4>MVP wireframe — {_esc(wf.get('title'))}</h4>
              {screens}
            </div>
          </div>
        </section>"""

    return f"""<!doctype html><html><head><meta charset="utf-8">
<title>Opportunity report — {_esc(seed)}</title>
<style>
  body{{font-family:Georgia,serif;max-width:840px;margin:40px auto;padding:0 24px;color:#1a2421;line-height:1.5}}
  h1{{font-size:28px;margin:0 0 4px}}
  .lede{{color:#5a6b64;font-size:14px;margin:0 0 32px;font-family:system-ui}}
  .idea{{border-top:2px solid #1a2421;padding:24px 0;page-break-inside:avoid}}
  .idea-head{{display:flex;justify-content:space-between;align-items:baseline}}
  .idea-head h3{{margin:0;font-size:20px}}
  .score{{font-family:ui-monospace,monospace;font-size:22px;font-weight:700}}
  .meta{{font-family:system-ui;font-size:12px;color:#5a6b64;margin:4px 0 18px}}
  .grid{{display:grid;grid-template-columns:1fr 1fr;gap:28px}}
  h4{{font-family:system-ui;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#5a6b64;margin:0 0 10px}}
  dl{{margin:0}} dt{{font-family:system-ui;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#8a9b94;margin-top:10px}}
  dd{{margin:2px 0 0;font-size:14px}}
  .screen{{border:1px solid #d4ddd9;border-radius:8px;padding:12px 14px;margin-bottom:10px;background:#f7faf9}}
  .screen h5{{margin:0 0 6px;font-family:system-ui;font-size:13px}}
  .screen ul{{margin:0;padding-left:18px;font-family:system-ui;font-size:12.5px;color:#3a4a44}}
  @media print{{.idea{{break-inside:avoid}}}}
</style></head><body>
  <h1>Opportunity report</h1>
  <p class="lede">Seed: <strong>{_esc(seed)}</strong> · generated {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}
     · {len(ideas)} ideas · signal is directional, treat as leads not conclusions</p>
  {rows}
</body></html>"""
