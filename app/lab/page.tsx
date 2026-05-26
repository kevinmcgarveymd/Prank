"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type FormFactor = "game" | "story" | "helper" | "toy";
type WinCondition = "high_score" | "finish_levels" | "story_ends" | "forever";
type Band = "little" | "middle" | "big";

type Answers = {
  formFactor: FormFactor | null;
  subject: string;
  coreVerb: string;
  winCondition: WinCondition | null;
  oneCoolThing: string;
};

type Phase = "questions" | "cooking" | "preview" | "blocked" | "error";
type Step = "inventor" | "q1" | "freeform" | "q2" | "q3" | "q4" | "q5";

function bandFor(age: number): Band {
  if (age <= 6) return "little";
  if (age <= 10) return "middle";
  return "big";
}

const FORM_FACTORS: { value: FormFactor; emoji: string; label: string }[] = [
  { value: "game", emoji: "🎮", label: "Game" },
  { value: "story", emoji: "📖", label: "Story" },
  { value: "helper", emoji: "🛠️", label: "Helper" },
  { value: "toy", emoji: "🎨", label: "Toy" },
];

const SUBJECTS: { emoji: string; label: string }[] = [
  { emoji: "🐶", label: "Animals" },
  { emoji: "🚀", label: "Space" },
  { emoji: "⚽", label: "Sports" },
  { emoji: "🎵", label: "Music" },
  { emoji: "🍕", label: "Food" },
  { emoji: "✨", label: "Magic" },
  { emoji: "👫", label: "Friends" },
  { emoji: "🌍", label: "Earth" },
];

const VERBS: Record<FormFactor, string[]> = {
  game: ["Tap things", "Drag things", "Race", "Match", "Dodge", "Collect"],
  story: ["Choose what happens", "Read along", "Find hidden things"],
  helper: ["Pick from a list", "Spin / randomize", "Count / track", "Remember"],
  toy: ["Build", "Decorate", "Mix", "Make sounds"],
};

const WIN_CONDITIONS: { value: WinCondition; emoji: string; label: string }[] = [
  { value: "high_score", emoji: "🏆", label: "When I get a high score" },
  { value: "finish_levels", emoji: "🎯", label: "When I finish all the levels" },
  { value: "story_ends", emoji: "🎬", label: "When the story ends" },
  { value: "forever", emoji: "♾️", label: "Never — I want to play forever" },
];

const COOL_PLACEHOLDERS = [
  "the cat wears a hat",
  "everything is upside down",
  "you play as a sandwich",
  "it talks like a pirate",
];

const COOKING_MESSAGES = [
  "🍳 Cooking up your app…",
  "🎨 Picking the colors…",
  "🧠 Teaching it to be fun…",
  "✨ Adding a surprise or two…",
  "🔌 Wiring up the buttons…",
  "🎁 Almost ready…",
];

// ---- Voice input hook -------------------------------------------------------
function useVoice(onText: (t: string) => void) {
  const recRef = useRef<any>(null);
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    setSupported(!!SR);
  }, []);

  const start = () => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      onText(t);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  };

  const stop = () => {
    recRef.current?.stop();
    setListening(false);
  };

  return { listening, supported, start, stop };
}

function VoiceTextInput({
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  maxLength: number;
}) {
  const { listening, supported, start, stop } = useVoice((t) =>
    onChange(t.slice(0, maxLength)),
  );
  return (
    <div className="lab-voice">
      <input
        className="lab-text-input"
        type="text"
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {supported && (
        <button
          type="button"
          className={`lab-mic${listening ? " on" : ""}`}
          onClick={listening ? stop : start}
          aria-label="Speak your answer"
        >
          {listening ? "● Listening…" : "🎤 Say it"}
        </button>
      )}
    </div>
  );
}

export default function LabPage() {
  const [phase, setPhase] = useState<Phase>("questions");
  const [step, setStep] = useState<Step>("inventor");
  const [name, setName] = useState("");
  const [age, setAge] = useState(8);
  const [freeform, setFreeform] = useState(false);
  const [freeText, setFreeText] = useState("");
  const [answers, setAnswers] = useState<Answers>({
    formFactor: null,
    subject: "",
    coreVerb: "",
    winCondition: null,
    oneCoolThing: "",
  });
  const [customSubject, setCustomSubject] = useState("");
  const [result, setResult] = useState<{
    title: string;
    html: string;
    variantSeed: number;
  } | null>(null);
  const [cookMsg, setCookMsg] = useState(0);
  const [blockedStage, setBlockedStage] = useState<string>("");

  const band = bandFor(age);

  const steps: Step[] = useMemo(() => {
    if (freeform) return ["inventor", "q1", "freeform"];
    const s: Step[] = ["inventor", "q1", "q2", "q3"];
    if (answers.formFactor !== "story" && answers.formFactor !== "toy")
      s.push("q4");
    if (band !== "little") s.push("q5");
    return s;
  }, [freeform, answers.formFactor, band]);

  const stepIndex = steps.indexOf(step);

  function goNext() {
    const i = steps.indexOf(step);
    if (i < 0) return;
    if (i + 1 >= steps.length) {
      submit();
      return;
    }
    setStep(steps[i + 1]);
  }
  function goBack() {
    const i = steps.indexOf(step);
    if (i > 0) setStep(steps[i - 1]);
  }

  // Rotating cooking messages
  useEffect(() => {
    if (phase !== "cooking") return;
    const id = setInterval(
      () => setCookMsg((m) => (m + 1) % COOKING_MESSAGES.length),
      2200,
    );
    return () => clearInterval(id);
  }, [phase]);

  async function submit(seedOverride?: number) {
    setPhase("cooking");
    setCookMsg(0);
    try {
      let payloadAnswers = answers;

      if (freeform) {
        const pr = await fetch("/api/freeform/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: freeText, age }),
        });
        if (!pr.ok) throw new Error("parse failed");
        const parsed = await pr.json();
        payloadAnswers = {
          formFactor: parsed.formFactor,
          subject: parsed.subject,
          coreVerb: parsed.coreVerb,
          winCondition: parsed.winCondition,
          oneCoolThing: parsed.oneCoolThing || "",
        };
        setAnswers(payloadAnswers);
      }

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: {
            formFactor: payloadAnswers.formFactor,
            subject: payloadAnswers.subject,
            coreVerb: payloadAnswers.coreVerb,
            winCondition: payloadAnswers.winCondition,
            oneCoolThing: payloadAnswers.oneCoolThing,
          },
          age,
          variantSeed: seedOverride,
        }),
      });
      const data = await res.json();
      if (data.status === "ready") {
        setResult({ title: data.title, html: data.html, variantSeed: data.variantSeed });
        setPhase("preview");
      } else if (data.status === "safety_blocked") {
        setBlockedStage(data.stage || "");
        setPhase("blocked");
      } else {
        setPhase("error");
      }
    } catch {
      setPhase("error");
    }
  }

  function tryAgain() {
    submit(Math.floor(Math.random() * 1_000_000));
  }

  function startOver() {
    setPhase("questions");
    setStep("inventor");
    setFreeform(false);
    setFreeText("");
    setAnswers({
      formFactor: null,
      subject: "",
      coreVerb: "",
      winCondition: null,
      oneCoolThing: "",
    });
    setCustomSubject("");
    setResult(null);
  }

  // ---- Renders --------------------------------------------------------------
  function renderInventor() {
    return (
      <div className="lab-screen">
        <h2 className="lab-q">Who&apos;s the inventor? 🧑‍🚀</h2>
        <label className="lab-field-label">First name (optional)</label>
        <input
          className="lab-text-input"
          type="text"
          maxLength={20}
          value={name}
          placeholder="Your first name"
          onChange={(e) => setName(e.target.value)}
        />
        <label className="lab-field-label" style={{ marginTop: 16 }}>
          How old are you?
        </label>
        <div className="lab-age-row">
          <button
            className="lab-age-btn"
            onClick={() => setAge((a) => Math.max(4, a - 1))}
            aria-label="Younger"
          >
            −
          </button>
          <span className="lab-age-num">{age}</span>
          <button
            className="lab-age-btn"
            onClick={() => setAge((a) => Math.min(17, a + 1))}
            aria-label="Older"
          >
            +
          </button>
        </div>
        <button className="lab-next" onClick={goNext}>
          Let&apos;s go! →
        </button>
      </div>
    );
  }

  function renderQ1() {
    return (
      <div className="lab-screen">
        <h2 className="lab-q">What are you making?</h2>
        <div className="lab-card-grid">
          {FORM_FACTORS.map((f) => (
            <button
              key={f.value}
              className={`lab-card${answers.formFactor === f.value ? " selected" : ""}`}
              onClick={() => {
                const next: Answers = { ...answers, formFactor: f.value };
                if (f.value === "story") next.winCondition = "story_ends";
                if (f.value === "toy") next.winCondition = "forever";
                setAnswers(next);
                // advance after state settles
                setTimeout(() => {
                  setStep("q2");
                }, 120);
              }}
            >
              <span className="lab-card-emoji">{f.emoji}</span>
              <span className="lab-card-label">{f.label}</span>
            </button>
          ))}
        </div>
        {band === "big" && (
          <button
            className="lab-escape"
            onClick={() => {
              setFreeform(true);
              setStep("freeform");
            }}
          >
            I&apos;d rather just describe it →
          </button>
        )}
      </div>
    );
  }

  function renderFreeform() {
    return (
      <div className="lab-screen">
        <h2 className="lab-q">Describe your app idea ✍️</h2>
        <p className="lab-hint">
          Tell me what it is, what you do in it, and the coolest part.
        </p>
        <VoiceTextInput
          value={freeText}
          onChange={setFreeText}
          placeholder="e.g. A game where you fly a taco through space dodging asteroids…"
          maxLength={300}
        />
        <p className="lab-counter">{freeText.length}/300</p>
        <button
          className="lab-next"
          disabled={freeText.trim().length < 5}
          onClick={() => submit()}
        >
          Make it! ✨
        </button>
      </div>
    );
  }

  function renderQ2() {
    return (
      <div className="lab-screen">
        <h2 className="lab-q">What&apos;s it about?</h2>
        <div className="lab-card-grid">
          {SUBJECTS.map((s) => (
            <button
              key={s.label}
              className={`lab-card${answers.subject === s.label ? " selected" : ""}`}
              onClick={() => {
                setAnswers({ ...answers, subject: s.label });
                setTimeout(() => setStep("q3"), 120);
              }}
            >
              <span className="lab-card-emoji">{s.emoji}</span>
              <span className="lab-card-label">{s.label}</span>
            </button>
          ))}
        </div>
        {band !== "little" && (
          <div className="lab-custom">
            <label className="lab-field-label">✏️ Or type your own:</label>
            <div className="lab-voice">
              <input
                className="lab-text-input"
                type="text"
                maxLength={30}
                value={customSubject}
                placeholder="anything you like"
                onChange={(e) => setCustomSubject(e.target.value)}
              />
              <button
                className="lab-mic"
                disabled={customSubject.trim().length < 2}
                onClick={() => {
                  setAnswers({ ...answers, subject: customSubject.trim() });
                  setStep("q3");
                }}
              >
                Use it →
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderQ3() {
    const verbs = answers.formFactor ? VERBS[answers.formFactor] : VERBS.game;
    return (
      <div className="lab-screen">
        <h2 className="lab-q">What do you DO in it?</h2>
        <div className="lab-card-grid">
          {verbs.map((v) => (
            <button
              key={v}
              className={`lab-card lab-card-verb${answers.coreVerb === v ? " selected" : ""}`}
              onClick={() => {
                setAnswers({ ...answers, coreVerb: v });
                setTimeout(goNext, 120);
              }}
            >
              <span className="lab-card-label">{v}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  function renderQ4() {
    return (
      <div className="lab-screen">
        <h2 className="lab-q">When are you done?</h2>
        <div className="lab-card-grid">
          {WIN_CONDITIONS.map((w) => (
            <button
              key={w.value}
              className={`lab-card${answers.winCondition === w.value ? " selected" : ""}`}
              onClick={() => {
                setAnswers({ ...answers, winCondition: w.value });
                setTimeout(goNext, 120);
              }}
            >
              <span className="lab-card-emoji">{w.emoji}</span>
              <span className="lab-card-label">{w.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  function renderQ5() {
    const ph = COOL_PLACEHOLDERS[age % COOL_PLACEHOLDERS.length];
    return (
      <div className="lab-screen">
        <h2 className="lab-q">Tell me ONE cool thing 🌟</h2>
        <p className="lab-hint">This makes your app extra cool.</p>
        <VoiceTextInput
          value={answers.oneCoolThing}
          onChange={(v) => setAnswers({ ...answers, oneCoolThing: v })}
          placeholder={`e.g. "${ph}"`}
          maxLength={60}
        />
        <p className="lab-counter">{answers.oneCoolThing.length}/60</p>
        <div className="lab-btn-row">
          <button className="lab-skip" onClick={() => submit()}>
            Skip
          </button>
          <button className="lab-next" onClick={() => submit()}>
            Make my app! ✨
          </button>
        </div>
      </div>
    );
  }

  function renderQuestions() {
    return (
      <>
        <div className="lab-progress">
          {steps.map((s, i) => (
            <span
              key={s}
              className={`lab-dot${i === stepIndex ? " active" : ""}${i < stepIndex ? " done" : ""}`}
            />
          ))}
        </div>
        {step !== "inventor" && (
          <button className="lab-back" onClick={goBack}>
            ← Back
          </button>
        )}
        {step === "inventor" && renderInventor()}
        {step === "q1" && renderQ1()}
        {step === "freeform" && renderFreeform()}
        {step === "q2" && renderQ2()}
        {step === "q3" && renderQ3()}
        {step === "q4" && renderQ4()}
        {step === "q5" && renderQ5()}
      </>
    );
  }

  function renderCooking() {
    return (
      <div className="lab-cooking">
        <div className="lab-cooking-emoji">🍳</div>
        <p className="lab-cooking-msg">{COOKING_MESSAGES[cookMsg]}</p>
        <div className="lab-cooking-bar">
          <div className="lab-cooking-fill" />
        </div>
        <p className="lab-hint">This can take up to 30 seconds.</p>
      </div>
    );
  }

  function renderPreview() {
    if (!result) return null;
    return (
      <div className="lab-preview">
        <h2 className="lab-title">{result.title}</h2>
        {name && <p className="lab-byline">by {name}, age {age}</p>}
        <div className="lab-frame-wrap">
          <iframe
            className="lab-frame"
            sandbox="allow-scripts"
            srcDoc={result.html}
            referrerPolicy="no-referrer"
            title={result.title}
          />
        </div>
        <div className="lab-btn-row">
          <button className="lab-next" onClick={tryAgain}>
            🎲 Try again
          </button>
          <button
            className="lab-skip"
            onClick={() => {
              setPhase("questions");
              setStep(freeform ? "freeform" : "q1");
            }}
          >
            ✏️ Change answers
          </button>
          <button className="lab-skip" onClick={startOver}>
            ↺ Start over
          </button>
        </div>
      </div>
    );
  }

  function renderBlocked() {
    return (
      <div className="lab-cooking">
        <div className="lab-cooking-emoji">🌈</div>
        <h2 className="lab-q">Let&apos;s try a different idea!</h2>
        <p className="lab-hint">
          That one didn&apos;t quite work. How about we make something else fun?
        </p>
        <button className="lab-next" onClick={startOver}>
          Try a new idea →
        </button>
      </div>
    );
  }

  function renderError() {
    return (
      <div className="lab-cooking">
        <div className="lab-cooking-emoji">😅</div>
        <h2 className="lab-q">Oops, something hiccuped</h2>
        <p className="lab-hint">The app maker got tangled up. Want to try again?</p>
        <button className="lab-next" onClick={() => submit(result?.variantSeed)}>
          Try again →
        </button>
        <button className="lab-skip" onClick={startOver} style={{ marginTop: 10 }}>
          Start over
        </button>
      </div>
    );
  }

  return (
    <main className="container lab">
      <a href="/" className="back-link">
        ← buildapps.fun
      </a>
      <header className="lab-header">
        <h1>🧪 App Maker</h1>
        <p>Answer a few questions and I&apos;ll build your app!</p>
      </header>

      <div className="lab-panel">
        {phase === "questions" && renderQuestions()}
        {phase === "cooking" && renderCooking()}
        {phase === "preview" && renderPreview()}
        {phase === "blocked" && renderBlocked()}
        {phase === "error" && renderError()}
      </div>
    </main>
  );
}
