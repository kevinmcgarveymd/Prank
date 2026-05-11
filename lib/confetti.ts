"use client";

import confetti from "canvas-confetti";

export function burstConfetti() {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#f582ae", "#fbc24c", "#8bd3dd", "#c3f0ca", "#ffd803", "#ff6b6b"],
  });
}

export function bigConfetti() {
  const duration = 1200;
  const end = Date.now() + duration;
  const colors = ["#f582ae", "#fbc24c", "#8bd3dd", "#c3f0ca", "#ffd803"];

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
