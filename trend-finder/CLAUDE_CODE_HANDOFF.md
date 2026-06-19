# First message to paste into Claude Code

Open this project folder in Claude Code, then paste the prompt below as your
first message. Claude Code will already have read CLAUDE.md for context, so this
just tells it what you want done.

---

## Paste this:

I've opened the Signal project. Read CLAUDE.md for full context — it's a
zero-cost pipeline that turns a seed term into MVP concepts using Google Trends.

Before changing anything:
1. Get it running locally and confirm the pipeline works end to end with a test
   seed term (use template mode, no API key needed).
2. Tell me what you see — does discovery → scoring → generation → export all work?

Then I want to extend it. My priority is: [PICK ONE AND DELETE THE REST]
  - Swap the competition proxy for real data from a paid API (DataForSEO or
    Google Ads Keyword Planner), keeping the free path as fallback.
  - Render the MVP wireframes as actual visual mockups (boxes/SVG) instead of
    bulleted element lists, in both the app and the exported report.
  - Surface the saved-searches feature in the frontend (the backend endpoints
    already exist — wire up save / list / re-run).

Work in small steps and show me each change before moving on. Keep the free
template path working as a fallback throughout.

---

## Tips
- If a pytrends call hangs or returns a 429, that's the rate limit — it's
  expected. The cache helps; just wait and retry, or test with fewer niches.
- The `/init` command in Claude Code can regenerate CLAUDE.md, but this project
  already ships a hand-written one with more context — don't overwrite it
  unless you've changed the architecture.
