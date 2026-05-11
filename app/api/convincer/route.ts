import { NextResponse } from "next/server";

export const runtime = "edge";

const LANG_NAMES: Record<string, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  ja: "Japanese",
  zh: "Simplified Mandarin Chinese",
};

type Body = {
  parent?: string;
  lang?: string;
  mission?: string;
  cat?: string;
  styleHint?: string;
};

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is missing ANTHROPIC_API_KEY." },
      { status: 500 },
    );
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  const parent = body.parent === "mom" ? "mom" : "dad";
  const lang = body.lang && LANG_NAMES[body.lang] ? body.lang : "en";
  const mission = (body.mission || "").toString().slice(0, 200).trim();
  const styleHint = (body.styleHint || "").toString().slice(0, 500).trim();
  if (!mission || !styleHint) {
    return NextResponse.json(
      { error: "mission and styleHint required" },
      { status: 400 },
    );
  }

  const langName = LANG_NAMES[lang];
  const langClause =
    lang === "en"
      ? ""
      : `\n\nIMPORTANT: Write all 5 arguments in ${langName}. Make them feel natural for a kid speaking ${langName} — use age-appropriate slang, phrasing, and cultural references that fit the language.`;

  const parentCap = parent.charAt(0).toUpperCase() + parent.slice(1);
  const prompt = `You are writing for a fun, harmless kids app called "Parent Convincer 3000". Generate 5 short funny one-liner arguments a kid would use to try to convince their ${parent} about this mission: "${mission}".

Style: each argument ${styleHint}.

Rules:
- Address or reference "${parentCap}" naturally where it fits
- Keep each argument under 25 words
- Be silly, playful, charming — NEVER mean, rude, or actually disrespectful
- The kid loves their ${parent}; this is loving banter, not real conflict
- If the mission seems unsafe or harmful, generate gentle silly arguments that wouldn't actually achieve anything${langClause}

Return ONLY a valid JSON array of exactly 5 strings. No preamble, no code fences, no explanation. Just the JSON array.`;

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!r.ok) {
    const text = await r.text();
    return NextResponse.json(
      { error: "Upstream error", status: r.status, detail: text.slice(0, 500) },
      { status: 502 },
    );
  }

  const data = (await r.json()) as {
    content?: Array<{ text?: string }>;
  };
  const txt = (data.content || [])
    .map((b) => b.text || "")
    .join("")
    .replace(/```json|```/g, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(txt);
  } catch {
    return NextResponse.json(
      { error: "Model returned non-JSON", raw: txt.slice(0, 500) },
      { status: 502 },
    );
  }

  if (!Array.isArray(parsed)) {
    return NextResponse.json(
      { error: "Model did not return an array" },
      { status: 502 },
    );
  }

  const args = parsed.filter(
    (s): s is string => typeof s === "string" && s.length > 0,
  );

  return NextResponse.json({ args });
}
