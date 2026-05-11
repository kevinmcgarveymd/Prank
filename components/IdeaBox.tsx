"use client";

import { useState } from "react";
import { SITE } from "@/lib/site";

type Props = {
  topic: string;
  prompt: string;
  emoji?: string;
};

export function IdeaBox({ topic, prompt, emoji = "💡" }: Props) {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [idea, setIdea] = useState("");

  const canSend = idea.trim().length > 0;

  const handleSend = () => {
    const subject = `${topic} idea`;
    const lines = [
      idea.trim(),
      "",
      firstName.trim() ? `— from ${firstName.trim()}` : "— from a buildapps.fun fan",
    ];
    const body = lines.join("\n");
    const url = `mailto:${SITE.ideasEmail}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
    setOpen(false);
    setIdea("");
    setFirstName("");
  };

  return (
    <section className="idea-box">
      {!open ? (
        <button className="idea-box-cta" onClick={() => setOpen(true)}>
          <span className="idea-box-cta-emoji" aria-hidden>
            {emoji}
          </span>
          <span>
            <strong>Got an idea?</strong>
            <span className="idea-box-cta-sub">{prompt}</span>
          </span>
        </button>
      ) : (
        <div className="idea-box-form">
          <h3>
            {emoji} Share your {topic} idea
          </h3>
          <p className="idea-box-safety">
            Don&apos;t include your last name, address, school, or phone number
            — just your first name (if you want) and your idea.
          </p>
          <label className="idea-box-field">
            <span>First name (optional)</span>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value.slice(0, 30))}
              placeholder="(leave blank if you want to be a mystery)"
              maxLength={30}
            />
          </label>
          <label className="idea-box-field">
            <span>Your idea</span>
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value.slice(0, 1000))}
              rows={5}
              placeholder="Describe your idea in a few sentences..."
              maxLength={1000}
            />
          </label>
          <div className="idea-box-actions">
            <button
              type="button"
              className="idea-box-cancel"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="idea-box-send"
              onClick={handleSend}
              disabled={!canSend}
            >
              Send my idea ✉️
            </button>
          </div>
          <p className="idea-box-note">
            Tapping Send opens your email app with your idea inside — your
            parent or guardian can review it before it&apos;s sent.
          </p>
        </div>
      )}
    </section>
  );
}
