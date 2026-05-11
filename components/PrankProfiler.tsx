"use client";

import { useMemo, useState } from "react";
import type { Prank, PrankCategory, PrankSetting, PrankTarget } from "@/lib/types";
import { PrankIdea } from "./PrankIdea";

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

  if (showResults && ranked.length > 0) {
    return (
      <div>
        <p className="profiler-result-banner">
          🎯 Your top match — based on your answers!
        </p>
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
          ← Start over
        </button>
      </div>
    );
  }

  const questions: {
    id: number;
    title: string;
    options: { label: string; onPick: () => void }[];
  }[] = [
    {
      id: 0,
      title: "Who are you pranking?",
      options: [
        { label: "My sibling 👯", onPick: () => set("target", "sibling") },
        { label: "A parent 👨‍👩‍👧", onPick: () => set("target", "parent") },
        { label: "The whole family 🏠", onPick: () => set("target", "family") },
        { label: "Just myself 🪞", onPick: () => set("target", "self") },
      ],
    },
    {
      id: 1,
      title: "Where will this happen?",
      options: [
        { label: "At home 🏡", onPick: () => set("setting", "home") },
        { label: "At school 🎒", onPick: () => set("setting", "school") },
      ],
    },
    {
      id: 2,
      title: "How much time do you have?",
      options: [
        { label: "5 minutes ⚡", onPick: () => set("duration", "short") },
        { label: "About 15 minutes 🕒", onPick: () => set("duration", "medium") },
        { label: "All afternoon 🎨", onPick: () => set("duration", "long") },
      ],
    },
    {
      id: 3,
      title: "What kind of prank vibe?",
      options: VIBE_CHOICES.map((v) => ({
        label: v.label,
        onPick: () => set("vibe", v.categories),
      })),
    },
    {
      id: 4,
      title: "How much mess can you handle?",
      options: [
        { label: "No mess at all 🧼", onPick: () => set("mess", "none") },
        { label: "Tiny bit of stuff to clean 🧽", onPick: () => set("mess", "tiny") },
        { label: "I can clean anything! 🧹", onPick: () => set("mess", "any") },
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
        Question {step + 1} of {questions.length}
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
          ← Back
        </button>
      )}
    </div>
  );
}
