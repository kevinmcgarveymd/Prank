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
  lang?: string;
  items?: unknown;
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

  const lang = body.lang && LANG_NAMES[body.lang] ? body.lang : "en";
  if (!Array.isArray(body.items)) {
    return NextResponse.json({ error: "items must be array" }, { status: 400 });
  }
  const items = body.items
    .map((x) => (typeof x === "string" ? x.slice(0, 2000) : ""))
    .slice(0, 60);

  if (lang === "en") {
    return NextResponse.json({ items });
  }

  const langName = LANG_NAMES[lang];
  const prompt = `Translate each of the following ${items.length} short strings into ${langName}. The strings come from a kids' prank app (kid-friendly, playful, written in plain English). Keep emojis intact. Keep the tone warm and silly. Do not add commentary.

Return ONLY a valid JSON array of exactly ${items.length} translated strings, in the same order. No preamble, no code fences, no explanation.

Strings to translate:
${JSON.stringify(items, null, 2)}`;

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4000,
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

  const data = (await r.json()) as { content?: Array<{ text?: string }> };
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

  if (!Array.isArray(parsed) || parsed.length !== items.length) {
    return NextResponse.json(
      { error: "Model returned wrong-length array" },
      { status: 502 },
    );
  }

  const translated = parsed.map((v, i) =>
    typeof v === "string" && v.length > 0 ? v : items[i],
  );

  return NextResponse.json({ items: translated });
}
