import { NextResponse } from "next/server";

export const runtime = "edge";

const GEN_MODEL = "claude-sonnet-4-6";
const MOD_MODEL = "claude-haiku-4-5-20251001";

type Answers = {
  formFactor: "game" | "story" | "helper" | "toy";
  subject: string;
  coreVerb: string;
  winCondition: "high_score" | "finish_levels" | "story_ends" | "forever";
  oneCoolThing?: string;
};

type Body = {
  answers?: Answers;
  age?: number;
  variantSeed?: number;
};

const WIN_PHRASE: Record<Answers["winCondition"], string> = {
  high_score: "the player has built up a high score they want to beat",
  finish_levels: "the player has completed 3 levels of increasing difficulty",
  story_ends: "the story reaches its ending",
  forever: "there is no end — endless variation keeps it fresh",
};

const KNOWN_SUBJECTS = new Set([
  "Animals",
  "Space",
  "Sports",
  "Music",
  "Food",
  "Magic",
  "Friends",
  "Earth",
]);

function clampAge(a: unknown): number {
  const n = typeof a === "number" ? a : 8;
  return Math.max(4, Math.min(17, Math.round(n)));
}

async function callClaude(
  apiKey: string,
  model: string,
  prompt: string,
  maxTokens: number,
): Promise<string> {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`upstream ${r.status}: ${text.slice(0, 300)}`);
  }
  const data = (await r.json()) as { content?: Array<{ text?: string }> };
  return (data.content || [])
    .map((b) => b.text || "")
    .join("")
    .trim();
}

// ---- Input moderation -------------------------------------------------------
async function moderateInput(
  apiKey: string,
  texts: string[],
  age: number,
): Promise<boolean> {
  const joined = texts.filter(Boolean).join("\n---\n");
  if (!joined.trim()) return true;
  const prompt = `You are a strict child-safety filter for an app used by children. A ${age}-year-old typed the following text snippet(s) as ideas for an app they want to make. Decide if ALL of it is appropriate for a child of this age to have generated into an app.

Block anything involving violence, weapons, gore, sexual or romantic content, drugs/alcohol, slurs, hate, self-harm, personal contact info, or anything a reasonable parent would not want a child of ${age} to see.

Text:
"""
${joined}
"""

Reply with ONLY one word: SAFE or BLOCK.`;
  try {
    const out = await callClaude(apiKey, MOD_MODEL, prompt, 10);
    return /SAFE/i.test(out) && !/BLOCK/i.test(out);
  } catch {
    // Fail closed on moderation errors
    return false;
  }
}

// ---- Output technical scan (deterministic) ----------------------------------
function technicalViolations(html: string): string[] {
  const v: string[] = [];
  if (/\bhttps?:\/\//i.test(html)) v.push("external http(s) URL");
  if (/(^|[^:])\/\/[a-z0-9.-]+\.[a-z]/i.test(html.replace(/https?:/gi, "")))
    v.push("protocol-relative URL");
  if (/\bfetch\s*\(/.test(html)) v.push("fetch()");
  if (/XMLHttpRequest/.test(html)) v.push("XMLHttpRequest");
  if (/\bWebSocket\b/.test(html)) v.push("WebSocket");
  if (/\bEventSource\b/.test(html)) v.push("EventSource");
  if (/sendBeacon/.test(html)) v.push("sendBeacon");
  if (/localStorage/.test(html)) v.push("localStorage");
  if (/sessionStorage/.test(html)) v.push("sessionStorage");
  if (/indexedDB/i.test(html)) v.push("indexedDB");
  if (/document\.cookie/.test(html)) v.push("cookies");
  if (/<img\b/i.test(html)) v.push("<img> tag");
  return v;
}

// ---- Output content moderation (AI) -----------------------------------------
async function moderateOutput(
  apiKey: string,
  html: string,
  age: number,
): Promise<"SAFE" | "SOFT_FAIL" | "HARD_FAIL"> {
  // Strip tags to focus on visible/textual content but keep it short
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 6000);
  const prompt = `You are a child-safety reviewer for an app used by children aged 4-17. The following is the text content of a small web app generated for a ${age}-year-old.

Check for: violence, weapons, gore, sexual/romantic content, drugs/alcohol, slurs, hate, scary/horror themes, self-harm, or anything a reasonable parent would not want a child of ${age} to see.

Content:
"""
${text}
"""

Reply with ONLY one of: SAFE, SOFT_FAIL, or HARD_FAIL.
- SAFE: fully appropriate.
- SOFT_FAIL: borderline / mildly off; could be fixed by regenerating more carefully.
- HARD_FAIL: clearly inappropriate for a child.`;
  try {
    const out = await callClaude(apiKey, MOD_MODEL, prompt, 10);
    if (/HARD_FAIL/i.test(out)) return "HARD_FAIL";
    if (/SOFT_FAIL/i.test(out)) return "SOFT_FAIL";
    return "SAFE";
  } catch {
    return "SOFT_FAIL";
  }
}

function buildPrompt(answers: Answers, age: number, variantSeed: number): string {
  const cool = answers.oneCoolThing?.trim()
    ? `\nThe child's special twist: "${answers.oneCoolThing.trim()}"`
    : "";
  return `You are generating a tiny, self-contained interactive web app for a child age ${age}. Variation #${variantSeed}.

The child is making: a ${answers.formFactor} about ${answers.subject}.
The main thing the user DOES in the app is: ${answers.coreVerb}.
The app is "done" when: ${WIN_PHRASE[answers.winCondition]}.${cool}

REQUIREMENTS — these are hard constraints:
1. Output a single complete HTML document. Inline CSS and JS only.
2. No external scripts, stylesheets, fonts, or images. No network requests of any kind.
3. No localStorage, sessionStorage, cookies, IndexedDB, or any persistence APIs.
4. Use only emoji and CSS for visuals. No <img> tags. No image URLs.
5. The app must be interactive within 10 seconds of loading.
6. Age-appropriate for a ${age}-year-old. No violence, no scary content, no romance, nothing a parent wouldn't want a child of this age to see.
7. Maximum 300 lines of code.
8. The "${answers.coreVerb}" action must be the central interaction.
9. The "done" condition must actually trigger and be visible to the player. If endless, provide endless variation instead.
10. Make it FUN — not just functional. Add small surprises, animations, and sounds using the Web Audio API only (no audio files), and personality.

Generate a creative title for the app. Respond in EXACTLY this format and nothing else:

<APP_TITLE>The app title</APP_TITLE>
<APP_HTML>
<!doctype html>
... the full document ...
</APP_HTML>`;
}

function parseGeneration(raw: string): { title: string; html: string } | null {
  const titleMatch = raw.match(/<APP_TITLE>([\s\S]*?)<\/APP_TITLE>/i);
  const htmlMatch = raw.match(/<APP_HTML>([\s\S]*?)<\/APP_HTML>/i);
  if (!htmlMatch) return null;
  let html = htmlMatch[1].trim();
  html = html.replace(/^```html\s*/i, "").replace(/```$/i, "").trim();
  const title = (titleMatch?.[1] || "My App").trim().slice(0, 80);
  return { title, html };
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { status: "error", error: "Server is missing ANTHROPIC_API_KEY." },
      { status: 500 },
    );
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ status: "error", error: "Bad JSON" }, { status: 400 });
  }

  const a = body.answers;
  if (
    !a ||
    !["game", "story", "helper", "toy"].includes(a.formFactor) ||
    !a.subject ||
    !a.coreVerb ||
    !["high_score", "finish_levels", "story_ends", "forever"].includes(a.winCondition)
  ) {
    return NextResponse.json(
      { status: "error", error: "Invalid answers" },
      { status: 400 },
    );
  }

  const age = clampAge(body.age);
  const variantSeed =
    typeof body.variantSeed === "number"
      ? body.variantSeed
      : Math.floor(Math.random() * 1_000_000);

  const answers: Answers = {
    formFactor: a.formFactor,
    subject: a.subject.toString().slice(0, 40),
    coreVerb: a.coreVerb.toString().slice(0, 40),
    winCondition: a.winCondition,
    oneCoolThing: a.oneCoolThing?.toString().slice(0, 80),
  };

  // 1. Input moderation on free-text fields
  const freeText: string[] = [];
  if (!KNOWN_SUBJECTS.has(answers.subject)) freeText.push(answers.subject);
  if (answers.oneCoolThing) freeText.push(answers.oneCoolThing);
  const inputOk = await moderateInput(apiKey, freeText, age);
  if (!inputOk) {
    return NextResponse.json({ status: "safety_blocked", stage: "input" });
  }

  // 2. Generate
  let parsed: { title: string; html: string } | null = null;
  try {
    const raw = await callClaude(
      apiKey,
      GEN_MODEL,
      buildPrompt(answers, age, variantSeed),
      8000,
    );
    parsed = parseGeneration(raw);
  } catch (e) {
    return NextResponse.json(
      { status: "error", error: String(e).slice(0, 300) },
      { status: 502 },
    );
  }
  if (!parsed) {
    return NextResponse.json(
      { status: "error", error: "Could not parse generated app." },
      { status: 502 },
    );
  }

  // 3. Technical scan; one stricter regeneration if it fails
  let violations = technicalViolations(parsed.html);
  if (violations.length > 0) {
    try {
      const stricter =
        buildPrompt(answers, age, variantSeed) +
        `\n\nYour previous attempt was REJECTED for using: ${violations.join(", ")}. Regenerate WITHOUT any of those. Absolutely no external URLs, no network calls, no storage APIs, no <img> tags.`;
      const raw2 = await callClaude(apiKey, GEN_MODEL, stricter, 8000);
      const p2 = parseGeneration(raw2);
      if (p2) {
        parsed = p2;
        violations = technicalViolations(parsed.html);
      }
    } catch {
      /* fall through to block below */
    }
    if (violations.length > 0) {
      return NextResponse.json({
        status: "safety_blocked",
        stage: "output_technical",
      });
    }
  }

  // 4. Content moderation; one stricter regeneration on SOFT_FAIL
  let verdict = await moderateOutput(apiKey, parsed.html, age);
  if (verdict === "SOFT_FAIL") {
    try {
      const stricter =
        buildPrompt(answers, age, variantSeed) +
        `\n\nKeep it EXTRA gentle and wholesome for a ${age}-year-old: no scary, sad, or edgy themes at all.`;
      const raw3 = await callClaude(apiKey, GEN_MODEL, stricter, 8000);
      const p3 = parseGeneration(raw3);
      if (p3 && technicalViolations(p3.html).length === 0) {
        parsed = p3;
        verdict = await moderateOutput(apiKey, parsed.html, age);
      }
    } catch {
      /* keep prior verdict */
    }
  }
  if (verdict !== "SAFE") {
    return NextResponse.json({
      status: "safety_blocked",
      stage: "output_content",
    });
  }

  return NextResponse.json({
    status: "ready",
    title: parsed.title,
    html: parsed.html,
    variantSeed,
  });
}
