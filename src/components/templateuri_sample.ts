export type SimpleThemeSet =
  | "girl"
  | "boy"
  | "gabby"
  | "spiderman"
  | "mickey"
  | "lilo"
  | "adventure"
  | "frozen"
  | "jurassic"
  | "mermaid"
  | "unicorn"
  | "zootropolis"
  | "office"
  | "royal_rose"
  | "blush_bloom"
  | "garden"
  | "botanica"
  | "regal"
  | "lord"
  | "luxury"
  | "maison"
  | "none";

export type SimpleEventType = "wedding" | "baptism" | "anniversary" | "office";

export interface SimpleTemplateSample {
  id: string;
  name: string;
  description: string;
  supportsIntroEditor: boolean;
  themeSet: SimpleThemeSet;
  eventTypes: SimpleEventType[];
  status?: "active" | "coming-soon";
}

export const SIMPLE_EVENT_TYPES: Array<{ id: SimpleEventType; label: string }> = [
  { id: "wedding", label: "Nunta" },
  { id: "baptism", label: "Botez" },
  { id: "anniversary", label: "Aniversare" },
  { id: "office", label: "Office" },
];

export const TEMPLATEURI_SAMPLE: SimpleTemplateSample[] = [
  {
    id: "classic",
    name: "Classic",
    description: "ClassicTemplate.tsx - template implicit pentru conturi fara upgrade.",
    supportsIntroEditor: false,
    themeSet: "none",
    eventTypes: ["wedding", "baptism", "anniversary", "office"],
    status: "active",
  },
  {
    id: "castle-magic-girl-simple",
    name: "Castel Regal",
    description: "Template Castel Regal (fost Girl Castel), cu palete extinse pentru fete si baieti.",
    supportsIntroEditor: true,
    themeSet: "girl",
    eventTypes: ["baptism", "anniversary"],
    status: "active",
  },
  {
    id: "royal-rose-simple",
    name: "Royal Rose",
    description: "Template Royal Rose in fluxul simplu.",
    supportsIntroEditor: false,
    themeSet: "royal_rose",
    eventTypes: ["wedding"],
    status: "active",
  },
  {
    id: "blush-bloom-simple",
    name: "Blush Bloom",
    description: "Template Blush Bloom in fluxul simplu.",
    supportsIntroEditor: false,
    themeSet: "blush_bloom",
    eventTypes: ["wedding"],
    status: "active",
  },
  {
    id: "garden-romantic-simple",
    name: "Garden Romantic",
    description: "Template Garden Romantic in fluxul simplu.",
    supportsIntroEditor: false,
    themeSet: "garden",
    eventTypes: ["wedding"],
    status: "active",
  },
  {
    id: "etern-botanica-simple",
    name: "Etern Botanica",
    description: "Template Etern Botanica in fluxul simplu.",
    supportsIntroEditor: false,
    themeSet: "botanica",
    eventTypes: ["wedding"],
    status: "active",
  },
  {
    id: "regal-simple",
    name: "Dark Royal",
    description: "Template Dark Royal in fluxul simplu.",
    supportsIntroEditor: false,
    themeSet: "regal",
    eventTypes: ["wedding"],
    status: "active",
  },
  {
    id: "lord-effects-simple",
    name: "Lord Effects",
    description: "Template Lord Effects in fluxul simplu.",
    supportsIntroEditor: true,
    themeSet: "lord",
    eventTypes: ["wedding"],
    status: "active",
  },
  {
    id: "luxury-style-simple",
    name: "Luxury Style",
    description: "Template premium cu intro cinematic si stil elegant in fluxul simplu.",
    supportsIntroEditor: true,
    themeSet: "luxury",
    eventTypes: ["wedding"],
    status: "active",
  },
  {
    id: "maison-wedding-simple",
    name: "Eiffel Romance",
    description: "Template inspirat de Paris si Turnul Eiffel, cu stil editorial elegant pentru nunti.",
    supportsIntroEditor: false,
    themeSet: "maison",
    eventTypes: ["wedding"],
    status: "active",
  },
  {
    id: "gabbys-dollhouse-simple",
    name: "Gabby's Dollhouse",
    description: "Template Gabby's Dollhouse in fluxul simplu.",
    supportsIntroEditor: false,
    themeSet: "gabby",
    eventTypes: ["baptism", "anniversary"],
    status: "active",
  },
  {
    id: "spiderman-simple",
    name: "Spider Verse",
    description: "Template Spider modern in fluxul simplu.",
    supportsIntroEditor: false,
    themeSet: "spiderman",
    eventTypes: ["baptism", "anniversary"],
    status: "active",
  },
  {
    id: "mickey-mouse-simple",
    name: "Mickey Mouse",
    description: "Template Mickey Mouse in fluxul simplu.",
    supportsIntroEditor: false,
    themeSet: "mickey",
    eventTypes: ["baptism", "anniversary"],
    status: "active",
  },
  {
    id: "lilo-and-stitch-simple",
    name: "Lilo & Stitch",
    description: "Template tropical cu vibe hawaiian, ocean, hibiscus si personaje Lilo & Stitch.",
    supportsIntroEditor: false,
    themeSet: "lilo",
    eventTypes: ["baptism", "anniversary"],
    status: "active",
  },
  {
    id: "adventure-road-simple",
    name: "Adventure Road",
    description: "Template Adventure Road in fluxul simplu.",
    supportsIntroEditor: false,
    themeSet: "adventure",
    eventTypes: ["baptism", "anniversary"],
    status: "active",
  },
  {
    id: "frozen-simple",
    name: "Frozen",
    description: "Template Frozen in fluxul simplu.",
    supportsIntroEditor: false,
    themeSet: "frozen",
    eventTypes: ["baptism", "anniversary"],
    status: "active",
  },
  {
    id: "jurassic-park-simple",
    name: "Jurassic Park",
    description: "Template Jurassic Park in fluxul simplu.",
    supportsIntroEditor: true,
    themeSet: "jurassic",
    eventTypes: ["baptism", "anniversary"],
    status: "active",
  },
  {
    id: "little-mermaid-simple",
    name: "Little Mermaid",
    description: "Template Little Mermaid in fluxul simplu.",
    supportsIntroEditor: true,
    themeSet: "mermaid",
    eventTypes: ["baptism", "anniversary"],
    status: "active",
  },
  {
    id: "unicorn-academy-simple",
    name: "Unicorn Academy",
    description: "Template Unicorn Academy in fluxul simplu.",
    supportsIntroEditor: false,
    themeSet: "unicorn",
    eventTypes: ["baptism", "anniversary"],
    status: "active",
  },
  {
    id: "zootropolis-simple",
    name: "Zootropolis",
    description: "Template Zootropolis in fluxul simplu.",
    supportsIntroEditor: true,
    themeSet: "zootropolis",
    eventTypes: ["baptism", "anniversary"],
    status: "active",
  },
  {
    id: "office-simple",
    name: "Office Meeting",
    description: "Template profesional pentru invitatii la intalniri de lucru si evenimente corporate.",
    supportsIntroEditor: false,
    themeSet: "office",
    eventTypes: ["office"],
    status: "active",
  },
];

export const getTemplateSample = (
  templateId: string,
): SimpleTemplateSample | undefined =>
  TEMPLATEURI_SAMPLE.find((tpl) => tpl.id === templateId);
