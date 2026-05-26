import { NextResponse } from "next/server";

export const runtime = "edge";

const MODEL = "claude-haiku-4-5-20251001";

type Body = { text?: string; age?: number };

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

  const text = (body.text || "").toString().slice(0, 300).trim();
  if (!text) {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }
  const age = Math.max(4, Math.min(17, Math.round(body.age ?? 13)));

  const prompt = `A ${age}-year-old described an app they want to make:
"""
${text}
"""

Extract the following into a JSON object:
- formFactor: one of "game", "story", "helper", "toy" (best fit)
- subject: a short noun phrase, max 30 chars (what it's about)
- coreVerb: a short phrase for the main action the user does, max 30 chars
- winCondition: one of "high_score", "finish_levels", "story_ends", "forever"
- oneCoolThing: the single most distinctive twist, max 60 chars (or "" if none)

Return ONLY the JSON object. No code fences, no commentary.`;

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!r.ok) {
    const t = await r.text();
    return NextResponse.json(
      { error: "Upstream error", detail: t.slice(0, 300) },
      { status: 502 },
    );
  }

  const data = (await r.json()) as { content?: Array<{ text?: string }> };
  const txt = (data.content || [])
    .map((b) => b.text || "")
    .join("")
    .replace(/```json|```/g, "")
    .trim();

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(txt);
  } catch {
    return NextResponse.json(
      { error: "Model returned non-JSON" },
      { status: 502 },
    );
  }

  const ff = ["game", "story", "helper", "toy"];
  const wc = ["high_score", "finish_levels", "story_ends", "forever"];
  const result = {
    formFactor: ff.includes(parsed.formFactor as string)
      ? (parsed.formFactor as string)
      : "game",
    subject: (parsed.subject as string)?.toString().slice(0, 30) || "anything",
    coreVerb:
      (parsed.coreVerb as string)?.toString().slice(0, 30) || "Tap things",
    winCondition: wc.includes(parsed.winCondition as string)
      ? (parsed.winCondition as string)
      : "forever",
    oneCoolThing:
      (parsed.oneCoolThing as string)?.toString().slice(0, 60) || "",
  };

  return NextResponse.json(result);
}
