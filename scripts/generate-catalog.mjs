#!/usr/bin/env node
/**
 * Generates data/pranks.json by combining:
 *   - The existing hand-crafted entries (preserved verbatim)
 *   - Template-driven generated entries to bring totals to 300 + 300
 *
 * Re-run with: node scripts/generate-catalog.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, "..", "data", "pranks.json");

const TARGET_PRANK_TOTAL = 300;
const TARGET_CALL_TOTAL = 300;

const existing = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));

const handPranks = existing.pranks;
const handCalls = existing.prank_calls;

let nextPrankId =
  Math.max(0, ...handPranks.map((p) => p.id)) + 1;
let nextCallId = Math.max(0, ...handCalls.map((c) => c.id)) + 1;

// ─────────────────────────────────────────────────────────────────
// Prank generation
// ─────────────────────────────────────────────────────────────────

const HIDE_OBJECTS = [
  "rubber duck",
  "tiny plastic dinosaur",
  "small toy car",
  "googly-eyed potato",
  "sock puppet",
  "stuffed frog",
  "wooden spoon",
  "single grape (washed)",
  "tiny umbrella",
  "small lego figure",
  "pair of toy sunglasses",
  "miniature stuffed bear",
  "rubber chicken",
  "tiny flag",
  "kazoo",
  "wind-up toy",
  "tiny pinwheel",
];

const HIDE_PLACES = [
  "in the fridge behind the milk",
  "inside a cereal box",
  "in the silverware drawer",
  "on top of the bathroom mirror",
  "inside a slipper",
  "in a coat pocket",
  "on the top shelf of the pantry",
  "tucked into a houseplant",
  "in the laundry basket",
  "behind a picture frame",
  "inside the toaster (when unplugged and cool)",
  "in the dryer (with permission)",
  "next to the toothbrushes",
  "in the cookie jar",
  "behind the soap pump",
];

const ROOMS = ["kitchen", "living room", "bathroom", "hallway", "playroom"];

const SILLY_HOLIDAYS = [
  "National Talk Like a Pirate Day",
  "International Mismatched Sock Day",
  "Annual Speak in Whispers Hour",
  "Universal Compliment Festival",
  "Backwards Hat Wednesday",
  "Loud Sound Effect Tuesday",
  "Banana-As-A-Phone Day",
  "Made-Up Word Morning",
  "Slow-Motion Saturday",
  "Tiny Voice Hour",
  "Polite Bow Hour",
  "Wear a Cape Day",
  "Cartwheel Lunch",
  "Robot Voice Breakfast",
];

const SILLY_INVENTIONS = [
  "a spoon taped to a stuffed animal",
  "a paper hat with three antennae",
  "an empty tissue box on a string",
  "a fork taped to a banana",
  "a sock wrapped around a flashlight",
  "two rubber bands tied to a paper plate",
  "a button glued to the back of a card",
  "an empty cup with a smiley face",
  "a rubber band stretched between two pencils",
  "a wooden spoon with googly eyes",
];

const FANCY_BITS = [
  "a snobby waiter from Paris",
  "an opera singer",
  "a tour guide for ancient artifacts",
  "a sports broadcaster",
  "an old-timey town crier",
  "a documentary narrator",
  "a fortune teller",
  "a museum docent",
  "a wildlife observer",
  "a courtroom judge",
];

const NICE_AMBUSHES = [
  "Hide three encouragement notes in their lunchbox.",
  "Leave a sticky note on their bathroom mirror that says 'You crushed it yesterday.'",
  "Make a paper trophy and award it to them for any random thing.",
  "Wrap a single piece of fruit like a fancy present.",
  "Sneak a small drawing into their backpack.",
  "Leave a paper crown by their pillow.",
  "Slip a knock-knock joke under their door.",
  "Make a 'thank you' coupon book for chores already done.",
  "Compose a tiny one-page comic about them being a hero.",
  "Tape a tiny 'You are awesome' flag to a snack.",
  "Build a paper trophy stand with a Lego inside.",
  "Write a haiku about how cool they are.",
];

const SILLY_PHRASES = [
  "say 'oogity boogity' before every sentence",
  "address everyone as 'Captain'",
  "end every sentence with '...allegedly'",
  "narrate your every action like a sports commentator",
  "speak in rhymes",
  "answer every question with a question",
  "begin every reply with 'According to my sources...'",
  "speak only in superlatives ('the BEST cereal IN THE WORLD!')",
  "use only one-syllable words",
  "talk like a very tiny mouse",
  "talk like a very tall robot",
];

const SOUND_EFFECTS = [
  "boing for sitting down",
  "whoosh for picking up a cup",
  "ding for opening any door",
  "zoink for finding any object",
  "fanfare for entering any room",
  "drumroll for any reveal",
  "popcorn pop for taking off a hat",
  "creak for slow movements",
];

const FOIL_OBJECTS = [
  "the TV remote",
  "a stuffed animal",
  "a hairbrush",
  "a single shoe",
  "their water bottle",
  "a book",
  "an empty cereal box",
  "a pencil case",
  "their pillow (gently)",
];

const NOTE_LABELS = [
  { label: "Out of Order", target: "any normal household object" },
  { label: "Voice Activated", target: "a regular cabinet" },
  { label: "Now in 4D", target: "a picture frame" },
  { label: "Free Hugs", target: "a stuffed animal" },
  { label: "World's Best Spoon", target: "any spoon" },
  { label: "Magic — Do Not Touch", target: "a houseplant" },
  { label: "Tiny Concert Tonight", target: "a bookshelf" },
  { label: "Closed for Renovation", target: "the cereal cabinet" },
];

const BACKWARDS_THEMES = [
  "walking",
  "eating breakfast",
  "saying hello",
  "tying shoes (slow motion)",
  "putting on a jacket",
  "reading aloud",
];

// Helpers

function pick(arr, i) {
  return arr[i % arr.length];
}

function makePrank({
  title,
  category,
  target,
  setting = ["home"],
  age_range = "7+",
  time_of_day = "any",
  duration_minutes = 5,
  materials = [],
  ethics_score = 9,
  description,
  steps,
}) {
  return {
    id: nextPrankId++,
    title,
    category,
    target,
    setting,
    age_range,
    time_of_day,
    duration_minutes,
    materials,
    ethics_score,
    description,
    steps,
  };
}

const generated = [];

// 1. Hidden object pranks — 17 × 15 = 255 combos, take ~30
for (let i = 0; i < 30; i++) {
  const obj = pick(HIDE_OBJECTS, i);
  const place = pick(HIDE_PLACES, i * 3);
  generated.push(
    makePrank({
      title: `Surprise ${capitalize(obj)}`,
      category: "visual",
      target: ["family"],
      duration_minutes: 5,
      materials: [obj],
      description: `Tuck a ${obj} ${place}. See how long it takes someone to spot it.`,
      steps: [
        `Find a clean ${obj} you don't mind being moved.`,
        `Place it ${place} when nobody is looking.`,
        `Pretend not to know anything when it's discovered.`,
      ],
    })
  );
}

// 2. Tiny-army pranks — fill a small space with the same object
for (let i = 0; i < 12; i++) {
  const obj = pick(HIDE_OBJECTS, i + 5);
  generated.push(
    makePrank({
      title: `Tiny ${capitalize(obj)} Army`,
      category: "visual",
      target: ["sibling", "parent"],
      duration_minutes: 10,
      materials: [`a few ${obj}s (your own)`],
      description: `Line up several ${obj}s in a row across a desk, shelf, or windowsill so they look like a marching parade.`,
      steps: [
        `Gather a handful of ${obj}s from your own toys.`,
        `Arrange them in a tidy line across a flat surface.`,
        `Leave a tiny paper flag at the front if you have one.`,
        `Help put them back where they belong after the reveal.`,
      ],
    })
  );
}

// 3. Sign / note pranks
for (let i = 0; i < NOTE_LABELS.length * 2; i++) {
  const note = pick(NOTE_LABELS, i);
  generated.push(
    makePrank({
      title: `'${note.label}' Sign`,
      category: "written",
      target: ["family"],
      duration_minutes: 5,
      materials: ["paper", "tape (removable)"],
      description: `Write a serious-looking '${note.label}' sign and tape it to ${note.target}.`,
      steps: [
        `Use a marker on a small piece of paper.`,
        `Write '${note.label.toUpperCase()}' clearly.`,
        `Tape it to ${note.target} with painter's tape so it peels off cleanly.`,
        `Wait for someone to notice and laugh.`,
      ],
    })
  );
}

// 4. Silly holiday observances
for (let i = 0; i < SILLY_HOLIDAYS.length; i++) {
  const h = SILLY_HOLIDAYS[i];
  generated.push(
    makePrank({
      title: `Announce ${h}`,
      category: "verbal",
      target: ["family"],
      duration_minutes: 30,
      materials: [],
      description: `Insist that today is ${h} and observe the tradition.`,
      steps: [
        `At breakfast, announce solemnly that today is ${h}.`,
        `Demonstrate the appropriate behavior all morning.`,
        `Gently invite the family to join in.`,
        `Reveal it was a made-up holiday by lunch.`,
      ],
    })
  );
}

// 5. Silly invention reveals
for (let i = 0; i < SILLY_INVENTIONS.length; i++) {
  const inv = SILLY_INVENTIONS[i];
  generated.push(
    makePrank({
      title: `Patent Pending: My New Invention`,
      category: "physical",
      target: ["family"],
      duration_minutes: 15,
      materials: ["random craft items"],
      description: `Build ${inv} and present it as your latest serious invention.`,
      steps: [
        `Assemble ${inv}.`,
        `Call a family meeting.`,
        `Explain at length the problem it solves (the problem should be absurd).`,
        `Ask for early-investor compliments.`,
      ],
    })
  );
}

// 6. Fancy character bits
for (let i = 0; i < FANCY_BITS.length; i++) {
  const bit = FANCY_BITS[i];
  generated.push(
    makePrank({
      title: `Be ${capitalize(bit)} For An Hour`,
      category: "verbal",
      target: ["family"],
      duration_minutes: 30,
      materials: [],
      description: `Spend an hour acting as ${bit}. Stay in character no matter what.`,
      steps: [
        `Pick the hour ahead of time.`,
        `Adopt the voice and mannerisms of ${bit}.`,
        `Apply it to mundane household events.`,
        `Drop character only when the hour is up.`,
      ],
    })
  );
}

// 7. Kindness ambushes (reverse pranks)
for (let i = 0; i < NICE_AMBUSHES.length; i++) {
  const a = NICE_AMBUSHES[i];
  generated.push(
    makePrank({
      title: `Reverse Prank: Kindness Strike`,
      category: "kindness",
      target: ["family", "anyone"],
      duration_minutes: 10,
      materials: ["paper", "pen"],
      description: a,
      steps: [
        `Plan it out so they discover it on their own.`,
        a,
        `Don't take credit unless they ask.`,
      ],
      ethics_score: 10,
    })
  );
}

// 8. Silly phrase challenges
for (let i = 0; i < SILLY_PHRASES.length; i++) {
  const p = SILLY_PHRASES[i];
  generated.push(
    makePrank({
      title: `For Ten Minutes, ${capitalize(p)}`,
      category: "verbal",
      target: ["family"],
      duration_minutes: 10,
      materials: [],
      description: `Set a timer for ten minutes and ${p} the entire time.`,
      steps: [
        `Set a 10-minute timer.`,
        `${capitalize(p)}.`,
        `When the timer goes off, drop the act.`,
        `Then ask what they thought.`,
      ],
    })
  );
}

// 9. Sound effect day
for (let i = 0; i < SOUND_EFFECTS.length; i++) {
  const e = SOUND_EFFECTS[i];
  generated.push(
    makePrank({
      title: `Foley Day: ${capitalize(e.split(" for ")[0])}`,
      category: "sound",
      target: ["family"],
      duration_minutes: 15,
      materials: [],
      description: `Add a ${e} for the whole morning.`,
      steps: [
        `Pick the morning to add sound effects.`,
        `Use your voice to make a ${e}.`,
        `Stay committed — every single time, no exceptions.`,
        `Quietly drop it after lunch.`,
      ],
    })
  );
}

// 10. Foil-wrap an object
for (let i = 0; i < FOIL_OBJECTS.length; i++) {
  const obj = FOIL_OBJECTS[i];
  generated.push(
    makePrank({
      title: `Tinfoil Surprise`,
      category: "visual",
      target: ["sibling", "parent"],
      duration_minutes: 8,
      materials: ["aluminum foil"],
      description: `Carefully wrap ${obj} in aluminum foil. Help unwrap it after the reveal.`,
      steps: [
        `Pick ${obj} (skip anything electronic).`,
        `Wrap neatly in foil.`,
        `Set it back exactly where it was.`,
        `Help unwrap and recycle the foil after the reveal.`,
      ],
    })
  );
}

// 11. Backwards day variations
for (let i = 0; i < BACKWARDS_THEMES.length; i++) {
  const t = BACKWARDS_THEMES[i];
  generated.push(
    makePrank({
      title: `Backwards ${capitalize(t)}`,
      category: "physical",
      target: ["family"],
      duration_minutes: 5,
      materials: [],
      description: `Do ${t} backwards for as long as you can keep a straight face.`,
      steps: [
        `Pick a moment to start.`,
        `Do ${t} in reverse.`,
        `Refuse to acknowledge anything unusual.`,
        `Resume normalcy when discovered.`,
      ],
    })
  );
}

// 12. Imaginary friend visits
const IMAGINARY_FRIENDS = [
  "Bartholomew the Pickle",
  "Sir Reginald the Sock",
  "Queen Snorflewax",
  "Mr. Toast McGee",
  "Captain Whisker-Tickle",
  "Dr. Beebop",
  "Granny Hopscotch",
];
for (let i = 0; i < IMAGINARY_FRIENDS.length; i++) {
  const f = IMAGINARY_FRIENDS[i];
  generated.push(
    makePrank({
      title: `Introducing ${f}`,
      category: "verbal",
      target: ["family"],
      duration_minutes: 20,
      materials: [],
      description: `Walk around with an empty arm crooked as if you're holding hands with ${f}.`,
      steps: [
        `Set the scene at breakfast: "${f} is visiting today."`,
        `Hold their imaginary hand all morning.`,
        `Translate everything they "say" in dramatic fashion.`,
        `Wave goodbye when the prank ends.`,
      ],
    })
  );
}

// 13. Reverse greetings
const REVERSE_GREETINGS = [
  "say 'good night' every time you say hello",
  "say 'goodbye' every time you walk INTO a room",
  "answer 'thank you' before someone has thanked you",
  "respond 'you're welcome' to every greeting",
  "introduce yourself like you're new every five minutes",
];
for (let i = 0; i < REVERSE_GREETINGS.length; i++) {
  const g = REVERSE_GREETINGS[i];
  generated.push(
    makePrank({
      title: `Greeting Glitch`,
      category: "verbal",
      target: ["family"],
      duration_minutes: 10,
      materials: [],
      description: `For ten minutes, ${g}.`,
      steps: [
        `Set a quiet 10-minute timer.`,
        `${capitalize(g)} every single time.`,
        `Smile when corrected, then do it again.`,
        `Drop the act when the timer rings.`,
      ],
    })
  );
}

// 14. Decoy gift wraps
const DECOY_GIFTS = [
  "a single grape",
  "an unsharpened pencil",
  "a small rock you painted",
  "a packet of dental floss",
  "a sticker",
  "a paperclip sculpture",
  "a leaf you decorated",
  "a tiny drawing on folded paper",
];
for (let i = 0; i < DECOY_GIFTS.length; i++) {
  const g = DECOY_GIFTS[i];
  generated.push(
    makePrank({
      title: `Mystery Present`,
      category: "gift",
      target: ["family"],
      duration_minutes: 10,
      materials: ["wrapping paper", g],
      description: `Wrap ${g} in real wrapping paper. Build up huge excitement before the reveal.`,
      steps: [
        `Wrap ${g} like a real present.`,
        `Talk it up at breakfast: a big surprise is coming.`,
        `Hand it over after lunch with extreme drama.`,
        `Reveal!`,
      ],
    })
  );
}

// 15. Pretend Discoveries
const DISCOVERIES = [
  "a hair from a unicorn (just a strand from your own hairbrush)",
  "an ancient artifact (a paperclip)",
  "evidence of time travel (an oddly-bent fork)",
  "a secret tunnel (the laundry chute)",
  "alien proof (a rubber band)",
  "a hidden treasure map (your old doodle)",
];
for (let i = 0; i < DISCOVERIES.length; i++) {
  const d = DISCOVERIES[i];
  generated.push(
    makePrank({
      title: `Major Discovery!`,
      category: "verbal",
      target: ["family"],
      duration_minutes: 5,
      materials: [],
      description: `Run in breathlessly to announce you've discovered ${d}.`,
      steps: [
        `Approach a family member with wide eyes.`,
        `Whisper that you've discovered ${d}.`,
        `Show your "evidence" with great care.`,
        `Ask them not to tell anyone.`,
      ],
    })
  );
}

// 16. Tiny menus
const MENU_THEMES = [
  "Restaurant of Three Spoons",
  "Le Café Sleepy",
  "Pasta Palace Mini",
  "The Cereal Lounge",
  "Mom Bistro",
  "Snack-A-Teria",
];
for (let i = 0; i < MENU_THEMES.length; i++) {
  const m = MENU_THEMES[i];
  generated.push(
    makePrank({
      title: `Tiny Menu: ${m}`,
      category: "food",
      target: ["family"],
      duration_minutes: 20,
      materials: ["paper", "pen"],
      description: `Make a fancy mini-menu for the dinner that's already planned. Hand it out before everyone sits down.`,
      steps: [
        `Find out what's actually for dinner.`,
        `Write a fancy menu calling it "${m}".`,
        `Use silly descriptions ("hand-carved noodles, mountain-aged sauce").`,
        `Distribute at the table with extreme formality.`,
      ],
      ethics_score: 10,
    })
  );
}

// 17. Reading the back of things dramatically
const DRAMATIC_READS = [
  "the back of the cereal box",
  "the shampoo ingredients",
  "the warranty card for a small appliance",
  "the nutrition label on a juice carton",
  "the assembly instructions for an old toy",
];
for (let i = 0; i < DRAMATIC_READS.length; i++) {
  const r = DRAMATIC_READS[i];
  generated.push(
    makePrank({
      title: `Dramatic Reading`,
      category: "verbal",
      target: ["family"],
      duration_minutes: 5,
      materials: [],
      description: `Read ${r} out loud as if it's the most moving novel ever written.`,
      steps: [
        `Pick up ${r}.`,
        `Stand near the family.`,
        `Read every word as if it's a tear-jerker.`,
        `Pause for effect on small numbers.`,
      ],
    })
  );
}

// 18. Mystery in the room - tiny rearrangements
const TINY_REARRANGEMENTS = [
  "turn three picture frames slightly crooked",
  "swap two stuffed animals between rooms",
  "rotate the rug by 5 degrees",
  "put a single book backwards on a shelf",
  "switch two couch pillows",
  "move the salt and pepper to opposite sides",
  "leave one slipper inside a different slipper",
];
for (let i = 0; i < TINY_REARRANGEMENTS.length; i++) {
  const r = TINY_REARRANGEMENTS[i];
  generated.push(
    makePrank({
      title: `Tiny Glitch in the House`,
      category: "visual",
      target: ["family"],
      duration_minutes: 5,
      materials: [],
      description: `Make one almost-invisible change: ${r}. See if anyone notices.`,
      steps: [
        `${capitalize(r)} when nobody is watching.`,
        `Go about your day.`,
        `Wait to see how long it takes anyone to notice.`,
        `Reveal at dinner so you can put it back.`,
      ],
    })
  );
}

// 19. Hat-stacking and over-accessorizing
const ACCESSORY_THEMES = [
  "wear three hats stacked",
  "wear all your watches at once",
  "wear two pairs of sunglasses",
  "tie a scarf as a cape",
  "wear five mismatched socks (yes, five)",
  "wear oven mitts during breakfast (your own)",
  "wear winter gloves at dinner",
  "wear a backpack on the front",
];
for (let i = 0; i < ACCESSORY_THEMES.length; i++) {
  const a = ACCESSORY_THEMES[i];
  generated.push(
    makePrank({
      title: `Over-Accessorize Day`,
      category: "outfit",
      target: ["self"],
      duration_minutes: 30,
      materials: ["your own clothes/accessories"],
      description: `${capitalize(a)} and behave totally normally.`,
      steps: [
        `${capitalize(a)}.`,
        `Make breakfast as if nothing is unusual.`,
        `Refuse to acknowledge anything when asked.`,
        `Drop the act after about half an hour.`,
      ],
      ethics_score: 10,
    })
  );
}

// 20. Pretend new house rules
const FAKE_RULES = [
  "the floor is suddenly mildly sticky",
  "every spoon must be held with both hands",
  "we now bow when entering a room",
  "all questions must be asked in song",
  "every door requires a tiny knock and a giggle",
  "we whisper the answer to every yes/no question",
  "applaud politely after every sentence anyone says",
];
for (let i = 0; i < FAKE_RULES.length; i++) {
  const r = FAKE_RULES[i];
  generated.push(
    makePrank({
      title: `New House Rule`,
      category: "verbal",
      target: ["family"],
      duration_minutes: 15,
      materials: [],
      description: `Inform the family that, effective immediately, ${r}.`,
      steps: [
        `Stand on a chair (safely) and announce the new rule.`,
        `Demonstrate the rule yourself first.`,
        `Enforce it gently for 15 minutes.`,
        `Reveal it was a prank and the rule is repealed.`,
      ],
    })
  );
}

// 21. Mystery in the mail
for (let i = 0; i < 10; i++) {
  const f = pick(IMAGINARY_FRIENDS, i);
  generated.push(
    makePrank({
      title: `A Letter From ${f}`,
      category: "written",
      target: ["family"],
      duration_minutes: 15,
      materials: ["paper", "envelope"],
      description: `Write a very serious letter from ${f} and leave it where the family will find it.`,
      steps: [
        `Compose a one-page letter in ${f}'s voice.`,
        `Mention specific household details for "proof".`,
        `Tuck into an envelope, address to the family.`,
        `Leave on the kitchen counter.`,
      ],
    })
  );
}

// 22. Self-portrait swap
generated.push(
  makePrank({
    title: `Doodle Photo Bomb`,
    category: "visual",
    target: ["family"],
    duration_minutes: 10,
    materials: ["paper", "tape (removable)"],
    description: `Draw a tiny self-portrait on paper and tape it just visible behind every family photo on the shelf.`,
    steps: [
      `Draw a small cartoon version of your face.`,
      `Cut it out.`,
      `Stick it (with painter's tape) just peeking out behind framed photos.`,
      `Help take them down after the reveal.`,
    ],
  })
);

// 23. Compliment volleyball
generated.push(
  makePrank({
    title: `Compliment Volleyball`,
    category: "kindness",
    target: ["family"],
    duration_minutes: 10,
    materials: [],
    description: `Start a compliment volley with a family member: each of you has to say something nice back, faster and faster, until someone laughs.`,
    steps: [
      `Walk up and say one specific compliment.`,
      `Demand they return one immediately.`,
      `Keep volleying until laughter wins.`,
    ],
    ethics_score: 10,
  })
);

// 24. Riddle ambush
const RIDDLES = [
  { q: "What has hands but cannot clap?", a: "a clock" },
  { q: "What runs but never walks?", a: "water" },
  { q: "What gets wetter the more it dries?", a: "a towel" },
  { q: "What has a face but no eyes?", a: "a clock" },
  { q: "What has many keys but can't open a single door?", a: "a piano" },
  { q: "What kind of room has no doors or windows?", a: "a mushroom" },
  { q: "What goes up but never comes down?", a: "your age" },
  { q: "What can travel around the world while staying in a corner?", a: "a stamp" },
];
for (let i = 0; i < RIDDLES.length; i++) {
  const r = RIDDLES[i];
  generated.push(
    makePrank({
      title: `Riddle Ambush`,
      category: "verbal",
      target: ["family"],
      duration_minutes: 2,
      materials: [],
      description: `Run up to someone and demand they answer a riddle before they can move.`,
      steps: [
        `Block a hallway dramatically.`,
        `Announce: "You shall not pass without answering a riddle!"`,
        `Ask: '${r.q}'`,
        `Reveal the answer ('${r.a}') and let them through.`,
      ],
      ethics_score: 10,
    })
  );
}

// 25. Tiny museum
generated.push(
  makePrank({
    title: `The Museum of Boring Things`,
    category: "visual",
    target: ["family"],
    duration_minutes: 25,
    materials: ["paper", "tape", "household objects"],
    description: `Set up a "museum" on the kitchen table with tiny labels for the dullest household items (a spoon, a paperclip, a button).`,
    steps: [
      `Pick 5 ordinary household items.`,
      `Write a tiny museum label for each ("circa 2003, donated by Dad").`,
      `Arrange them on the table.`,
      `Give the family a guided tour with a fancy voice.`,
    ],
  })
);

// 26. Pretend it's a different season for the day
const SEASONS = [
  "Snow Day inside (wear winter gear)",
  "Beach Day inside (sunglasses and flip-flops)",
  "Autumn Festival (collect colorful socks like leaves)",
  "Spring Break (announce vacation, stay home)",
];
for (let i = 0; i < SEASONS.length; i++) {
  generated.push(
    makePrank({
      title: SEASONS[i],
      category: "outfit",
      target: ["family"],
      duration_minutes: 60,
      materials: ["seasonal accessories you already own"],
      description: `Commit fully to a seasonal vibe in the wrong season.`,
      steps: [
        `Pick your gear early in the morning.`,
        `Walk through the house as if the season has changed.`,
        `Comment on the "weather" matter-of-factly.`,
        `Wrap up by lunch.`,
      ],
      ethics_score: 10,
    })
  );
}

// 27. Pet translator (with stuffed pet)
const PET_QUOTES = [
  "She says she demands more treats and respect.",
  "He's tired of you putting your shoes on the rug.",
  "She thinks the couch belongs to her now.",
  "He'd like a different brand of food, please.",
  "She has feedback about today's outfit choices.",
];
for (let i = 0; i < PET_QUOTES.length; i++) {
  generated.push(
    makePrank({
      title: `Pet Translator Service`,
      category: "verbal",
      target: ["family"],
      duration_minutes: 5,
      materials: ["a pet or plushie"],
      description: `Sit beside the family pet (or a plushie) and translate what they're thinking.`,
      steps: [
        `Settle solemnly beside the pet.`,
        `Lean in, listen carefully.`,
        `Announce: "${PET_QUOTES[i]}"`,
        `Refuse to translate again until paid in compliments.`,
      ],
    })
  );
}

// 28. Tiny obstacle course
generated.push(
  makePrank({
    title: `Tiny Hallway Obstacle Course`,
    category: "visual",
    target: ["family"],
    duration_minutes: 15,
    materials: ["paper cups (empty)", "string"],
    description: `Lay out a goofy obstacle course in a hallway with empty cups and a long string. Help dismantle it after.`,
    steps: [
      `Use only safe, soft items.`,
      `Arrange a winding path in a non-essential hallway.`,
      `Time anyone who walks through it.`,
      `Help clean up immediately after.`,
    ],
  })
);

// 29. The wrong-name day
generated.push(
  makePrank({
    title: `Wrong Names Day`,
    category: "verbal",
    target: ["family"],
    duration_minutes: 30,
    materials: [],
    description: `Call every family member by a slightly wrong but friendly version of their name for 30 minutes.`,
    steps: [
      `Pick affectionate wrong names ahead of time.`,
      `Use them earnestly all morning.`,
      `Pretend not to notice anything different.`,
      `Switch back at lunch.`,
    ],
    ethics_score: 9,
  })
);

// 30. Calendar nonsense
const FAKE_DATES = [
  "today is Septober 47th",
  "Tuesday was canceled, this is Wensday",
  "it is officially the year 3023",
  "we are now in Bonus Week",
];
for (let i = 0; i < FAKE_DATES.length; i++) {
  generated.push(
    makePrank({
      title: `Calendar Confusion`,
      category: "verbal",
      target: ["family"],
      duration_minutes: 5,
      materials: [],
      description: `Insist with full confidence that ${FAKE_DATES[i]}.`,
      steps: [
        `At breakfast, announce the new date.`,
        `Mention follow-up consequences: "since it's ${FAKE_DATES[i]}, normal cereal is now magic."`,
        `Drop the act if anyone seems concerned.`,
      ],
    })
  );
}

// 31. Voice characters
const VOICE_CHARACTERS = [
  "a tiny mouse who is also a lawyer",
  "an extremely tired cowboy",
  "a Shakespearean actor on tour",
  "a sportscaster covering breakfast",
  "a librarian who is also a wizard",
];
for (let i = 0; i < VOICE_CHARACTERS.length; i++) {
  const v = VOICE_CHARACTERS[i];
  generated.push(
    makePrank({
      title: `Character Hour`,
      category: "verbal",
      target: ["family"],
      duration_minutes: 30,
      materials: [],
      description: `For 30 minutes, speak only as ${v}.`,
      steps: [
        `Set the timer.`,
        `Adopt the voice of ${v}.`,
        `Apply to ordinary family activities.`,
        `Drop the voice when the timer rings.`,
      ],
    })
  );
}

// 32. Forgotten skills
const FORGOTTEN_SKILLS = [
  "how to sit in a chair",
  "how to use a spoon",
  "how doors open",
  "how stairs work",
  "how to wave hello",
];
for (let i = 0; i < FORGOTTEN_SKILLS.length; i++) {
  const s = FORGOTTEN_SKILLS[i];
  generated.push(
    makePrank({
      title: `I've Forgotten How To...`,
      category: "physical",
      target: ["family"],
      duration_minutes: 3,
      materials: [],
      description: `Pretend you've completely forgotten ${s}. Look genuinely puzzled.`,
      steps: [
        `Approach the relevant object.`,
        `Look confused.`,
        `Try increasingly silly approaches.`,
        `Eventually "figure it out" triumphantly.`,
      ],
      ethics_score: 10,
    })
  );
}

// 33. Tiny notes pile up
generated.push(
  makePrank({
    title: `One-Word Notes Everywhere`,
    category: "written",
    target: ["family"],
    duration_minutes: 10,
    materials: ["sticky notes", "pen"],
    description: `Hide ten sticky notes with one absurd word each ("BANANA", "WIZARD", "POTATO") around the house.`,
    steps: [
      `Pick ten silly words.`,
      `Write each on a sticky note.`,
      `Hide them in odd places.`,
      `Tell the family at dinner so they can hunt for them.`,
    ],
  })
);

// 34. Whisper conferences with plants
for (let i = 0; i < 5; i++) {
  generated.push(
    makePrank({
      title: `Plant Whisper Conference`,
      category: "physical",
      target: ["family"],
      duration_minutes: 5,
      materials: [],
      description: `Whisper into a houseplant for one full minute. When asked, say "They needed an update."`,
      steps: [
        `Approach a plant with great seriousness.`,
        `Whisper for a full minute.`,
        `Walk away saying it was urgent.`,
      ],
      ethics_score: 10,
    })
  );
}

// 35. Pretend the WiFi has feelings
generated.push(
  makePrank({
    title: `Negotiate with the WiFi`,
    category: "verbal",
    target: ["family"],
    duration_minutes: 10,
    materials: [],
    description: `Talk to the router like a grumpy coworker named Greg. Apologize when the internet is slow.`,
    steps: [
      `Greet the router every time you pass: "Morning, Greg."`,
      `Have one-sided conversations about its mood.`,
      `Thank it sincerely whenever internet works.`,
    ],
  })
);

// 36. Mock news bulletins
const FAKE_NEWS = [
  "BREAKING: Dad has located the remote",
  "JUST IN: Mom's mug has been filled",
  "ALERT: Sibling has done one chore",
  "STORY: The dog is, again, snoring",
  "UPDATE: Bread, somehow, is gone",
];
for (let i = 0; i < FAKE_NEWS.length; i++) {
  generated.push(
    makePrank({
      title: `Anchor Desk Report`,
      category: "verbal",
      target: ["family"],
      duration_minutes: 5,
      materials: [],
      description: `Become a news anchor reporting on household events.`,
      steps: [
        `Sit somewhere visible.`,
        `Adopt a serious anchor voice.`,
        `Read: "${FAKE_NEWS[i]}."`,
        `Cut to "weather" (look out the window, comment on it).`,
      ],
    })
  );
}

// 37. Stand still in unusual places
for (let i = 0; i < 5; i++) {
  generated.push(
    makePrank({
      title: `Frozen Statue Day`,
      category: "physical",
      target: ["family"],
      duration_minutes: 5,
      materials: [],
      description: `Freeze in a strange but harmless pose somewhere people pass. Hold completely still.`,
      steps: [
        `Pick a hallway corner.`,
        `Strike a dramatic, slightly silly pose.`,
        `Hold still, don't blink if you can help it.`,
        `Break character when someone laughs.`,
      ],
      ethics_score: 10,
    })
  );
}

// 38. Mock cooking show
generated.push(
  makePrank({
    title: `Cooking Show: But It's Already Made`,
    category: "verbal",
    target: ["family"],
    duration_minutes: 10,
    materials: [],
    description: `Host a cooking show segment about a meal someone already made.`,
    steps: [
      `Wait until dinner is served.`,
      `Walk in with a fake camera (your phone face down).`,
      `Narrate the dish like a TV chef.`,
      `Ask the cook for "an exclusive interview".`,
    ],
  })
);

// 39. Fortune cookie surprise
const FORTUNES = [
  "You will discover something small under the couch.",
  "Tomorrow, someone will say your name correctly.",
  "A surprise pickle is in your future.",
  "You will laugh at least twice today.",
  "The next door you open will reveal nothing unusual. (Still cool.)",
];
for (let i = 0; i < FORTUNES.length; i++) {
  generated.push(
    makePrank({
      title: `Homemade Fortune Cookie`,
      category: "written",
      target: ["family"],
      duration_minutes: 10,
      materials: ["paper", "scissors"],
      description: `Make a paper fortune and slip it next to someone's plate.`,
      steps: [
        `Cut a small paper strip.`,
        `Write: "${FORTUNES[i]}"`,
        `Slip it under their dinner plate.`,
        `Pretend not to know how it got there.`,
      ],
      ethics_score: 10,
    })
  );
}

// 40. Trail of paper cutouts
generated.push(
  makePrank({
    title: `Tiny Footprint Trail`,
    category: "visual",
    target: ["family"],
    duration_minutes: 20,
    materials: ["paper", "scissors", "removable tape"],
    description: `Cut out tiny paper footprints and tape a trail across the floor leading to something silly (like a stuffed animal sitting at the table).`,
    steps: [
      `Cut 10–20 small footprint shapes.`,
      `Tape them in a winding trail with painter's tape.`,
      `End the trail at a silly destination.`,
      `Help peel them up after the reveal.`,
    ],
  })
);

// 41. Repeat & echo
generated.push(
  makePrank({
    title: `Echo Hour`,
    category: "verbal",
    target: ["sibling"],
    duration_minutes: 5,
    materials: [],
    description: `Quietly echo your sibling's last word back to them. Stop instantly if asked.`,
    steps: [
      `Stand near your sibling.`,
      `Echo their last word at half volume.`,
      `STOP IMMEDIATELY when asked.`,
    ],
    ethics_score: 7,
  })
);

// 42. Wrong answer day
generated.push(
  makePrank({
    title: `Confidently Wrong Hour`,
    category: "verbal",
    target: ["family"],
    duration_minutes: 30,
    materials: [],
    description: `For thirty minutes, confidently answer every question with a clearly wrong but cheerful response.`,
    steps: [
      `Pick the thirty-minute window.`,
      `Whenever asked anything, beam and say something cheerfully incorrect.`,
      `Refuse to break character.`,
      `Reveal at the end.`,
    ],
  })
);

// 43. Magic mirror
generated.push(
  makePrank({
    title: `Magic Mirror`,
    category: "written",
    target: ["family"],
    duration_minutes: 5,
    materials: ["dry-erase marker (or removable sticky)", "bathroom mirror"],
    description: `Leave a "magic mirror" message that compliments the next person to look at it.`,
    steps: [
      `Use a dry-erase marker (or a sticky note) carefully.`,
      `Write "You look amazing today. — The Mirror"`,
      `Leave the room.`,
    ],
    ethics_score: 10,
  })
);

// 44. Pretend to time travel
generated.push(
  makePrank({
    title: `Just Returned From The Future`,
    category: "verbal",
    target: ["family"],
    duration_minutes: 5,
    materials: [],
    description: `Run in panting and announce headlines from the year 3001.`,
    steps: [
      `Burst into the room out of breath.`,
      `Announce: "Big news from 3001."`,
      `Share absurd predictions: dogs run the post office, cereal is now a vegetable.`,
      `Refuse to explain the time machine.`,
    ],
  })
);

// 45. Mini stuffed-animal protest
generated.push(
  makePrank({
    title: `Stuffed Animal Protest`,
    category: "visual",
    target: ["family"],
    duration_minutes: 15,
    materials: ["plushies", "paper", "tape"],
    description: `Stage a peaceful protest with stuffed animals, each holding a tiny paper sign.`,
    steps: [
      `Write friendly signs ("MORE STORYTIME", "NAPS FOR ALL").`,
      `Tape them to little sticks (or directly to plushies).`,
      `Arrange the plushies in a circle in the living room.`,
      `Take a "press photo".`,
    ],
  })
);

// 46. Magic show
generated.push(
  makePrank({
    title: `Surprise Magic Show`,
    category: "trick",
    target: ["family"],
    duration_minutes: 15,
    materials: ["a coin or small object"],
    description: `Learn one beginner magic trick from a video and perform it three times in a row before lunch.`,
    steps: [
      `Watch a beginner coin trick tutorial.`,
      `Practice 10 minutes.`,
      `Perform whenever someone walks by.`,
      `Refuse to reveal the secret.`,
    ],
    ethics_score: 10,
  })
);

// 47. Drawing-on-the-fridge contest
generated.push(
  makePrank({
    title: `Surprise Family Art Contest`,
    category: "kindness",
    target: ["family"],
    duration_minutes: 20,
    materials: ["paper", "markers"],
    description: `Pre-judge a family art contest no one signed up for, then hand each person a tiny trophy.`,
    steps: [
      `Make tiny paper "trophies" with categories ("BEST SCRIBBLE", "MOST SQUARES").`,
      `Decide winners in advance.`,
      `Announce the contest, then immediately announce winners.`,
      `Hand out trophies with great solemnity.`,
    ],
    ethics_score: 10,
  })
);

// 48. Tour guide of the house
generated.push(
  makePrank({
    title: `Official House Tour`,
    category: "verbal",
    target: ["family"],
    duration_minutes: 10,
    materials: ["paper rolled into a megaphone"],
    description: `Lead the family on a guided tour of the house they already live in.`,
    steps: [
      `Make a paper megaphone.`,
      `Gather the family in the entryway.`,
      `Walk them through the house with invented history ("the famous toaster").`,
      `Charge zero admission.`,
    ],
  })
);

// 49. Tape goggly eyes everywhere
generated.push(
  makePrank({
    title: `Eyes Everywhere`,
    category: "visual",
    target: ["family"],
    duration_minutes: 10,
    materials: ["googly eyes (stickers)"],
    description: `Stick googly-eye stickers on a dozen ordinary objects.`,
    steps: [
      `Buy stick-on googly eyes.`,
      `Put pairs on fruit, soap, the milk carton, your toothbrush case.`,
      `Pretend not to know how they got there.`,
    ],
  })
);

// 50. Tiny camera filming nothing
generated.push(
  makePrank({
    title: `Definitely Filming a Movie`,
    category: "verbal",
    target: ["family"],
    duration_minutes: 10,
    materials: ["any non-phone object as 'camera'"],
    description: `Carry a "camera" (a small box, a plushie, anything) around and pretend you're filming a documentary about breakfast.`,
    steps: [
      `Pick your prop "camera".`,
      `Approach each family member.`,
      `Narrate them like a nature documentary.`,
      `Thank them for their performances.`,
    ],
  })
);

// Make sure we have enough — top up with simple variations until we reach 300
function topUp() {
  const TOP_UP_BASE = [
    {
      title: "Encouragement Bomb",
      category: "kindness",
      description:
        "Walk into a room, deliver three rapid-fire genuine compliments, and run off before anyone can respond.",
      steps: [
        "Pick a target who needs a lift.",
        "Approach them.",
        "Hit them with three specific compliments.",
        "Run away dramatically.",
      ],
    },
    {
      title: "Walk in Slow-Mo",
      category: "physical",
      description:
        "Move in slow motion across a single room. Take 30 seconds to cross it.",
      steps: [
        "Pick a room.",
        "Start at one wall.",
        "Move so slowly it looks like a video buffering.",
        "Reach the other side, bow.",
      ],
    },
    {
      title: "Robot Voice Lunch",
      category: "verbal",
      description: "For lunch, speak only in robot voice. Robot OUT.",
      steps: [
        "Sit down to lunch.",
        "Announce in robot voice that lunch has begun.",
        "Carry every conversation in robot voice.",
        "Robot signs off when plates are cleared.",
      ],
    },
  ];
  let n = 0;
  while (handPranks.length + generated.length < TARGET_PRANK_TOTAL) {
    const base = TOP_UP_BASE[n % TOP_UP_BASE.length];
    generated.push(
      makePrank({
        title: `${base.title} #${n + 1}`,
        category: base.category,
        target: ["family"],
        duration_minutes: 5,
        materials: [],
        description: base.description,
        steps: base.steps,
        ethics_score: 10,
      })
    );
    n++;
  }
}
topUp();

// ─────────────────────────────────────────────────────────────────
// Prank call generation
// ─────────────────────────────────────────────────────────────────

const generatedCalls = [];

function makeCall({
  title,
  script,
  reveal_after_seconds = 20,
  target = "family member who agreed to be pranked",
  ethics_score = 10,
}) {
  return { id: nextCallId++, title, script, reveal_after_seconds, target, ethics_score };
}

const WRONG_NUMBER_BITS = [
  ["Penguin Rescue Services", "We've spotted a penguin in your backyard."],
  ["The Department of Lost Socks", "We've found two of yours. Will you press charges?"],
  ["Refrigerator Inspection Bureau", "Sir/Madam, we must ask: is your refrigerator running?"],
  ["National Pillow Standards Office", "We're conducting a routine fluffiness audit."],
  ["The Toast Hotline", "We've received reports that your toast was overcooked."],
  ["Spaghetti Quality Control", "Is your spaghetti compliant with regulation 4B?"],
  ["The Bureau of Important Buttons", "We need to confirm: are all your buttons buttoned?"],
  ["Crayon Recycling Center", "We're coming to pick up your broken crayons."],
  ["The Cereal Authority", "Did you, or did you not, eat cereal this morning?"],
  ["The Lamp Inspection Office", "We received complaints. Are your lamps lampy?"],
  ["The Department of Squeaky Doors", "Our records show your door has been squeaking. Comment?"],
  ["The Sock Witness Protection Program", "We have one of your socks in safe custody."],
  ["Pajama Compliance Team", "Are your pajamas regulation cozy?"],
  ["The Pillow Witness Bureau", "We have testimony that your pillow was fluffed."],
  ["The Slippers Audit Society", "We're calling about your slipper situation."],
];

const SURVEY_QUESTIONS = [
  "On a scale of 1 to banana, how cozy is your couch?",
  "What is your favorite sound the dishwasher makes?",
  "How loud do you laugh at your own jokes?",
  "Have you ever, in writing, complimented a houseplant?",
  "Do you prefer your spoons facing up or down?",
  "How many seconds does it take you to find the remote?",
  "Have you, in the last week, sniffed clean laundry?",
];

const QUIZ_QUESTIONS = [
  ["Geography Pop Quiz", "Which of these is NOT a country: France, Brazil, Cabbagia?"],
  ["History Quiz", "True or false: in 1492, Columbus actually just went to the kitchen."],
  ["Math Quiz", "Quick: what's 7 plus a banana?"],
  ["Science Hotline", "Is water wet, or does it just feel that way?"],
  ["Spelling Bee Hotline", "Please spell 'antidisestablishmentarianism'. We'll wait."],
];

const PRIZE_BITS = [
  ["Lottery Bureau", "Congratulations! You've won one (1) carrot. Where should we ship it?"],
  ["Sweepstakes Office", "You've won a lifetime supply of compliments. Standing by."],
  ["Pancake Prize Patrol", "You've been entered to win a free Sunday pancake. Will you accept?"],
  ["The Hug Foundation", "You've qualified for a complimentary surprise hug."],
  ["The Compliment Lottery", "Congratulations: you're great. That's the prize."],
];

const PIZZA_BITS = [
  ["Pizza Order", "I'd like one pizza, topped with: nothing. Just air. Thanks."],
  ["Pizza Joke", "Can I order a pizza with all the toppings on the bottom?"],
  ["Pickle Pizza Hotline", "Do you do single-pickle pizzas? Just one pickle?"],
];

const TIME_WEATHER_BITS = [
  ["Local Time Service", "Hello. The time is... let me check... yes, it is time."],
  ["Indoor Weather Report", "Inside your living room: 71°F and lightly snoring."],
  ["Sky Surveys", "Quick question: how is the sky doing today?"],
];

const SINGING_BITS = [
  ["Singing Telegram", "🎵 Heeeelloooo... thiiiis is a sooong... goooodbyeee 🎵"],
  ["Opera Telegram", "🎶 We are calling toooo say hellooo, hellooo, helloooooooo 🎶"],
  ["Polka Telegram", "🪗 Pol-ka-ing this delivery to-you, to-you, to-you! 🪗"],
];

const ROBOT_BITS = [
  ["Robot Survey", "BEEP. BOOP. PLEASE STATE YOUR FAVORITE SOUP."],
  ["Robot Customer Service", "I AM ROBOT. HOW MAY I ASSIST YOUR BREAKFAST."],
  ["Robot Wake-Up Call", "WAKE UP, HUMAN. THE TOAST IS READY."],
];

const PET_RECOVERY_BITS = [
  ["The Lost Goldfish Bureau", "We believe we found your goldfish. Did you misplace one?"],
  ["The Hamster Lookout", "Is anyone in your home missing a single very small hamster?"],
];

const RIDDLE_CALLS = [
  ["Riddle Hotline", "Press 1 for a riddle, 2 for another riddle, 3 for the same riddle louder."],
  ["The Joke Bureau", "We're conducting a knock-knock joke audit. Please proceed."],
];

const FAKE_DELIVERY_BITS = [
  ["Mystery Delivery", "We're delivering a package today. It's invisible. Please sign here, here, and here."],
  ["Echo Delivery", "We have a package for you. (Package). Sorry, that was an echo."],
  ["Pancake Delivery", "Were you expecting a stack of three pancakes? No? Hmm."],
];

const COMPLIMENT_CALLS = [
  ["Compliment Hotline", "Calling to inform you: you're doing great. That is all."],
  ["Random Cheer Service", "You're amazing. Goodbye!"],
  ["Encouragement Line", "Just wanted to remind you: you tried, and that counts."],
];

const HOROSCOPE_BITS = [
  ["Daily Horoscope", "Today's horoscope: you will hear a noise. It is fine."],
  ["Cosmic Update", "The stars say to wear two socks today (any combination)."],
  ["Astrology Bureau", "Your sign indicates a strong chance of cereal in your near future."],
];

const FAN_CLUB_BITS = [
  ["Fan Club of You", "I am president of your fan club. Membership is now you and me."],
  ["The Mae Appreciation Society", "Calling regarding the Mae Appreciation Society's annual dues. Pay in giggles."],
  ["The Rowan Booster Club", "We've nominated you to our Hall of Pretty Good People."],
];

const RECIPE_CALLS = [
  ["Recipe Hotline", "I'd like to read you my grandma's recipe for moonlight soup. Got a pen?"],
  ["The Cooking Show Booker", "We'd love to feature your sandwich on our show 'Sandwiches I Have Met.'"],
];

const LIBRARY_BITS = [
  ["Library Overdue", "We have records showing you returned a book 4 minutes too soon. Suspicious."],
  ["Bookworm Office", "Have you, or have you not, daydreamed about books in the last hour?"],
];

const TALENT_AGENT_BITS = [
  ["Talent Agent", "I represent jugglers. I think you have potential. Are you sitting down?"],
  ["Talent Show Hotline", "We're recruiting for the World Sock Folding Championship."],
];

const NUMBER_BITS = [
  ["Math Department", "Quick: what is the square root of a Tuesday?"],
  ["Counting Authority", "We've heard you can count to ten. Care to prove it?"],
];

const ANIMAL_BITS = [
  ["Animal Sanctuary", "We have a llama who wants to meet you. He's free Tuesday."],
  ["Bird Watchers Hotline", "A pigeon left you a polite note. Should we read it?"],
  ["The Ant Council", "The ants in your kitchen filed a formal complaint."],
];

const HOLIDAY_BITS = [
  ["Made-Up Holiday Office", "Today is National Tiny Smile Day. Please participate."],
  ["Holiday Confirmation Bureau", "Verifying: is today, in fact, your favorite Wednesday?"],
];

const allCallSeeds = [
  ...WRONG_NUMBER_BITS,
  ...QUIZ_QUESTIONS,
  ...PRIZE_BITS,
  ...PIZZA_BITS,
  ...TIME_WEATHER_BITS,
  ...SINGING_BITS,
  ...ROBOT_BITS,
  ...PET_RECOVERY_BITS,
  ...RIDDLE_CALLS,
  ...FAKE_DELIVERY_BITS,
  ...COMPLIMENT_CALLS,
  ...HOROSCOPE_BITS,
  ...FAN_CLUB_BITS,
  ...RECIPE_CALLS,
  ...LIBRARY_BITS,
  ...TALENT_AGENT_BITS,
  ...NUMBER_BITS,
  ...ANIMAL_BITS,
  ...HOLIDAY_BITS,
];

for (const [title, script] of allCallSeeds) {
  generatedCalls.push(
    makeCall({
      title,
      script,
      reveal_after_seconds: 15 + Math.floor(Math.random() * 25),
    })
  );
}

// Survey variants
for (const q of SURVEY_QUESTIONS) {
  generatedCalls.push(
    makeCall({
      title: `Customer Satisfaction Survey`,
      script: `Hi, calling for a quick one-question survey. ${q}`,
      reveal_after_seconds: 20,
    })
  );
}

// Top up calls with rotating variants until target reached
function topUpCalls() {
  const filler = [
    (n) => ({
      title: `Mystery Bulletin #${n}`,
      script: `Calling on behalf of the Mystery Bulletin Department. We have an update about... something. Stand by.`,
    }),
    (n) => ({
      title: `Cheerful Reminder #${n}`,
      script: `Just a friendly reminder: you are appreciated. Thank you, goodbye.`,
    }),
    (n) => ({
      title: `Imaginary Survey #${n}`,
      script: `If you could be any kitchen utensil, which would you be and why?`,
    }),
    (n) => ({
      title: `Cosmic Tip Line #${n}`,
      script: `The cosmos has a tip for you today: drink water and laugh once.`,
    }),
    (n) => ({
      title: `Tiny News Bulletin #${n}`,
      script: `Local news: a really good idea was had nearby. No further details.`,
    }),
    (n) => ({
      title: `Compliment Drop #${n}`,
      script: `This is a one-way compliment delivery. Your hair, today, looks acceptable. Goodbye!`,
    }),
    (n) => ({
      title: `Cheese Authority #${n}`,
      script: `The Cheese Authority is calling. Do you have cheese in your refrigerator right now? Be honest.`,
    }),
    (n) => ({
      title: `Bedtime Bureau #${n}`,
      script: `Per our records, you'll be sleepy tonight at approximately bedtime. Plan accordingly.`,
    }),
    (n) => ({
      title: `Hat Inspector #${n}`,
      script: `Calling to confirm: do you, or do you not, own a hat?`,
    }),
  ];
  let n = 1;
  while (handCalls.length + generatedCalls.length < TARGET_CALL_TOTAL) {
    const tmpl = filler[(n - 1) % filler.length];
    const { title, script } = tmpl(n);
    generatedCalls.push(makeCall({ title, script, reveal_after_seconds: 15 + (n % 25) }));
    n++;
  }
}
topUpCalls();

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Assemble
const finalCatalog = {
  ...existing,
  pranks: [...handPranks, ...generated].slice(0, TARGET_PRANK_TOTAL),
  prank_calls: [...handCalls, ...generatedCalls].slice(0, TARGET_CALL_TOTAL),
};

fs.writeFileSync(DATA_PATH, JSON.stringify(finalCatalog, null, 2) + "\n");
console.log(
  `Wrote ${finalCatalog.pranks.length} pranks, ${finalCatalog.prank_calls.length} prank calls.`
);
