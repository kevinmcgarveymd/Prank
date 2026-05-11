export const SITE = {
  name: "buildapps.fun",
  tagline: "Fun apps by two kids who want to make life better.",
};

export const KIDS = [
  {
    name: "Rowan",
    age: 10,
    loves: ["football", "church", "reading", "math", "playing drums"],
    color: "var(--accent)",
    mascot: "rowan" as const,
  },
  {
    name: "Mae",
    age: 8,
    loves: ["Taylor Swift", "climbing", "pranks", "cartwheels", "lacrosse"],
    color: "var(--accent-3)",
    mascot: "mae" as const,
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
