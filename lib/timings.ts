export const TIMING_SUGGESTIONS = [
  "right after they wake up",
  "the second they walk in the door",
  "during a TV commercial break",
  "right before dinner",
  "after they finish their homework",
  "on a rainy afternoon",
  "during a long car ride",
  "first thing Saturday morning",
  "while they're brushing their teeth",
  "as they're heading to bed",
  "halfway through breakfast",
  "during a family game night",
  "when nobody is expecting it",
  "on April Fool's Day",
  "the morning of their birthday (kid-approved kind only!)",
];

export function pickRandomTiming(not?: string): string {
  if (TIMING_SUGGESTIONS.length <= 1) return TIMING_SUGGESTIONS[0];
  let pick = TIMING_SUGGESTIONS[
    Math.floor(Math.random() * TIMING_SUGGESTIONS.length)
  ];
  if (not && pick === not) {
    pick =
      TIMING_SUGGESTIONS[
        (TIMING_SUGGESTIONS.indexOf(pick) + 1) % TIMING_SUGGESTIONS.length
      ];
  }
  return pick;
}
