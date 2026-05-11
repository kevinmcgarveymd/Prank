type Interest = { label: string; icon: string };

export const SITE = {
  name: "buildapps.fun",
  tagline: "Fun apps by two kids who want to make life better.",
  // Where idea-submission emails are sent. The form opens the
  // user's email client so nothing is collected on our side.
  ideasEmail: "ideas@buildapps.fun",
};

export const KIDS: {
  name: string;
  age: number;
  loves: Interest[];
  color: string;
  mascot: "rowan" | "mae";
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
];
