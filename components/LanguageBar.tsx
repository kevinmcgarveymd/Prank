"use client";

import { LANGUAGES, useLang } from "@/lib/LangContext";

export function LanguageBar() {
  const { lang, setLang } = useLang();
  return (
    <div className="lang-bar" role="group" aria-label="Choose language">
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          type="button"
          className={`lang-btn${lang === l.code ? " active" : ""}`}
          onClick={() => setLang(l.code)}
          aria-pressed={lang === l.code}
        >
          <span aria-hidden>{l.flag}</span> {l.label}
        </button>
      ))}
    </div>
  );
}
