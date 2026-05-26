type Interest = { label: string; icon: string };

export const SITE = {
  name: "buildapps.fun",
  tagline: "Fun apps by two kids who want to make life better.",
  // Where idea-submission emails are sent. The form opens the
  // user's email client so nothing is collected on our side.
  ideasEmail: "kevinmcgarveymd@gmail.com",
};

export const KIDS: {
  name: string;
  age: number;
  loves: Interest[];
  color: string;
  mascot: "rowan" | "mae";
  quote: string;
}[] = [
  {
    name: "Rowan",
    age: 10,
    loves: [
      { label: "football", icon: "🏈" },
      { label: "church", icon: "⛪" },
      { label: "reading", icon: "📖" },
      { label: "math", icon: "➕" },
      { label: "drums", icon: "🥁" },
    ],
    color: "var(--accent)",
    mascot: "rowan",
    quote:
      "They may make us take vitamins, but they will never take our freedom!",
  },
  {
    name: "Mae",
    age: 8,
    loves: [
      { label: "Taylor Swift", icon: "🎤" },
      { label: "climbing", icon: "🧗" },
      { label: "pranks", icon: "🎉" },
      { label: "cartwheels", icon: "🤸" },
      { label: "lacrosse", icon: "🥍" },
    ],
    color: "var(--accent-3)",
    mascot: "mae",
    quote:
      "There is not enough laughter in the world. With the prank app, I want to make more people laugh around the world.",
  },
];

export const APPS = [
  {
    slug: "pranks",
    title: "Prank Lab",
    emoji: "🎉",
    blurb:
      "Kind, parent-approved pranks for kids. 100 silly ideas, an ethics pledge, and a few harmless prank-call scripts. (Mae's idea.)",
    href: "/pranks",
    status: "live",
  },
  {
    slug: "dad-convincer",
    title: "Dad Convincer 3000™",
    emoji: "🧠",
    blurb:
      "Tap big silly buttons to launch arguments at Dad (or Mom). 66+ styles — pirate, rap, robot, dragon, and more — in 8 languages. (Rowan's idea.)",
    href: "/dad-convincer/",
    status: "live",
  },
  {
    slug: "music-lab",
    title: "Music Lab",
    emoji: "🎹",
    blurb:
      "A pocket music studio — play piano, guitar or bass, pick chords with smart next-chord hints, build a beat on the 7-pad drum kit, hum into the mic, and record your voice over the top. (Rowan's idea.)",
    href: "/music-lab/",
    status: "live",
  },
  {
    slug: "lab",
    title: "App Maker",
    emoji: "🧪",
    blurb:
      "Answer a few quick questions — what you're making, what it's about, what you do in it — and the App Maker builds you a real, playable app on the spot. Big kids can just describe it in their own words.",
    href: "/lab",
    status: "live",
  },
];
