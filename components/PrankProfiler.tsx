"use client";

import { useMemo, useState } from "react";
import type { Prank, PrankCategory, PrankSetting, PrankTarget } from "@/lib/types";
import { PrankIdea } from "./PrankIdea";
import { useTranslate } from "@/lib/useTranslate";

type Answers = {
  target: PrankTarget | null;
  setting: PrankSetting | null;
  duration: "short" | "medium" | "long" | null;
  vibe: PrankCategory[] | null;
  mess: "none" | "tiny" | "any" | null;
};

const VIBE_CHOICES: { label: string; categories: PrankCategory[] }[] = [
  { label: "Silly and visual", categories: ["visual", "outfit", "gift"] },
  { label: "Sneaky and quiet", categories: ["written", "physical", "trick"] },
  { label: "Loud and goofy", categories: ["verbal", "sound", "physical"] },
  { label: "Food fun", categories: ["food"] },
  { label: "Tech tricks", categories: ["tech"] },
  { label: "Be kind on purpose", categories: ["kindness"] },
];

function scorePrank(p: Prank, a: Answers): number {
  let score = 0;
  if (a.target && p.target.includes(a.target)) score += 4;
  if (a.setting && p.setting.includes(a.setting)) score += 3;
  if (a.duration) {
    if (a.duration === "short" && p.duration_minutes <= 5) score += 2;
    if (a.duration === "medium" && p.duration_minutes <= 15) score += 2;
    if (a.duration === "long") score += 1;
  }
  if (a.vibe && a.vibe.includes(p.category)) score += 3;
  if (a.mess) {
    if (a.mess === "none" && p.materials.length === 0) score += 2;
    if (a.mess === "tiny" && p.materials.length <= 2) score += 1;
  }
  return score;
}

export function PrankProfiler({ pranks }: { pranks: Prank[] }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    target: null,
    setting: null,
    duration: null,
    vibe: null,
    mess: null,
  });
  const [showResults, setShowResults] = useState(false);

  const ranked = useMemo(() => {
    if (!showResults) return [];
    return [...pranks]
      .map((p) => ({ p, score: scorePrank(p, answers) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((x) => x.p);
  }, [pranks, answers, showResults]);

  const QUESTION_TITLES = [
    "Who are you pranking?",
    "Where will this happen?",
    "How much time do you have?",
    "What kind of prank vibe?",
    "How much mess can you handle?",
  ];
  const OPTION_LABELS = [
    "My sibling 👯",
    "A parent 👨‍👩‍👧",
    "The whole family 🏠",
    "Just myself 🪞",
    "At home 🏡",
    "At school 🎒",
    "5 minutes ⚡",
    "About 15 minutes 🕒",
    "All afternoon 🎨",
    ...VIBE_CHOICES.map((v) => v.label),
    "No mess at all 🧼",
    "Tiny bit of stuff to clean 🧽",
    "I can clean anything! 🧹",
  ];
  const STATIC = [
    "🎯 Your top match — based on your answers!",
    "← Start over",
    "Question",
    "of",
    "← Back",
  ];

  const { translated } = useTranslate([
    ...QUESTION_TITLES,
    ...OPTION_LABELS,
    ...STATIC,
  ]);
  const tQuestions = translated.slice(0, QUESTION_TITLES.length);
  const tOptions = translated.slice(
    QUESTION_TITLES.length,
    QUESTION_TITLES.length + OPTION_LABELS.length,
  );
  const [tBanner, tStartOver, tQuestionWord, tOf, tBack] = translated.slice(
    QUESTION_TITLES.length + OPTION_LABELS.length,
  );

  if (showResults && ranked.length > 0) {
    return (
      <div>
        <p className="profiler-result-banner">{tBanner}</p>
        <PrankIdea pranks={ranked} initial={ranked[0]} />
        <button
          className="menu-back"
          style={{ marginTop: 16 }}
          onClick={() => {
            setStep(0);
            setShowResults(false);
            setAnswers({
              target: null,
              setting: null,
              duration: null,
              vibe: null,
              mess: null,
            });
          }}
        >
          {tStartOver}
        </button>
      </div>
    );
  }

  // Build options using translated labels but original onPick handlers
  const vibeStart = 9;
  const messStart = vibeStart + VIBE_CHOICES.length;

  const questions: {
    id: number;
    title: string;
    options: { label: string; onPick: () => void }[];
  }[] = [
    {
      id: 0,
      title: tQuestions[0],
      options: [
        { label: tOptions[0], onPick: () => set("target", "sibling") },
        { label: tOptions[1], onPick: () => set("target", "parent") },
        { label: tOptions[2], onPick: () => set("target", "family") },
        { label: tOptions[3], onPick: () => set("target", "self") },
      ],
    },
    {
      id: 1,
      title: tQuestions[1],
      options: [
        { label: tOptions[4], onPick: () => set("setting", "home") },
        { label: tOptions[5], onPick: () => set("setting", "school") },
      ],
    },
    {
      id: 2,
      title: tQuestions[2],
      options: [
        { label: tOptions[6], onPick: () => set("duration", "short") },
        { label: tOptions[7], onPick: () => set("duration", "medium") },
        { label: tOptions[8], onPick: () => set("duration", "long") },
      ],
    },
    {
      id: 3,
      title: tQuestions[3],
      options: VIBE_CHOICES.map((v, i) => ({
        label: tOptions[vibeStart + i],
        onPick: () => set("vibe", v.categories),
      })),
    },
    {
      id: 4,
      title: tQuestions[4],
      options: [
        { label: tOptions[messStart], onPick: () => set("mess", "none") },
        { label: tOptions[messStart + 1], onPick: () => set("mess", "tiny") },
        { label: tOptions[messStart + 2], onPick: () => set("mess", "any") },
      ],
    },
  ];

  function set<K extends keyof Answers>(key: K, value: Answers[K]) {
    setAnswers((prev) => {
      const next = { ...prev, [key]: value };
      if (step + 1 >= questions.length) {
        setShowResults(true);
      } else {
        setStep(step + 1);
      }
      return next;
    });
  }

  const q = questions[step];

  return (
    <div className="profiler">
      <p className="profiler-progress">
        {tQuestionWord} {step + 1} {tOf} {questions.length}
      </p>
      <h2 className="profiler-q">{q.title}</h2>
      <div className="profiler-options">
        {q.options.map((opt) => (
          <button key={opt.label} className="profiler-option" onClick={opt.onPick}>
            {opt.label}
          </button>
        ))}
      </div>
      {step > 0 && (
        <button
          className="menu-back"
          style={{ marginTop: 16 }}
          onClick={() => setStep(step - 1)}
        >
          {tBack}
        </button>
      )}
    </div>
  );
}
