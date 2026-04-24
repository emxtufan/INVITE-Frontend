import { SimpleTemplateDefinition } from "./types";
import GirlCastleSimpleTemplate, {
  GIRL_CASTLE_SIMPLE_PALETTES,
} from "./girl-castle-simple";
import GabbysDollhouseSimpleTemplate, {
  GABBYS_DOLLHOUSE_SIMPLE_PALETTES,
} from "./gabbys-dollhouse-simple";
import SpidermanSimpleTemplate, {
  SPIDERMAN_SIMPLE_PALETTES,
} from "./spiderman-simple";
import AdventureRoadSimpleTemplate, {
  ADVENTURE_ROAD_SIMPLE_PALETTES,
} from "./adventure-road-simple";
import FrozenSimpleTemplate, { FROZEN_SIMPLE_PALETTES } from "./frozen-simple";
import JurassicSimpleTemplate, {
  JURASSIC_SIMPLE_PALETTES,
} from "./jurassic-simple";
import LittleMermaidSimpleTemplate, {
  LITTLE_MERMAID_SIMPLE_PALETTES,
} from "./little-mermaid-simple";
import UnicornAcademySimpleTemplate, {
  UNICORN_ACADEMY_SIMPLE_PALETTES,
} from "./unicorn-academy-simple";
import ZootropolisSimpleTemplate, {
  ZOOTROPOLIS_SIMPLE_PALETTES,
} from "./zootropolis-simple";
import ClassicSimpleTemplate, {
  CLASSIC_SIMPLE_PALETTES,
} from "./classic-simple";
import RoyalRoseSimpleTemplate, {
  ROYAL_ROSE_SIMPLE_PALETTES,
} from "./royal-rose-simple";
import BlushBloomSimpleTemplate, {
  BLUSH_BLOOM_SIMPLE_PALETTES,
} from "./blush-bloom-simple";
import GardenRomanticSimpleTemplate, {
  GARDEN_ROMANTIC_SIMPLE_PALETTES,
} from "./garden-romantic-simple";
import EternBotanicaSimpleTemplate, {
  ETERN_BOTANICA_SIMPLE_PALETTES,
} from "./etern-botanica-simple";
import RegalSimpleTemplate, {
  REGAL_SIMPLE_PALETTES,
} from "./regal-simple";
import LordEffectsSimpleTemplate, {
  LORD_EFFECTS_SIMPLE_PALETTES,
} from "./lord-effects-simple";
import LuxuryStyleSimpleTemplate, {
  LUXURY_STYLE_SIMPLE_PALETTES,
} from "./luxury-style-simple";
import MaisonWeddingSimpleTemplate, {
  MAISON_WEDDING_SIMPLE_PALETTES,
} from "./maison-wedding-simple";
import OfficeSimpleTemplate, {
  OFFICE_SIMPLE_PALETTES,
} from "./office-simple";
import MickeyMouseSimpleTemplate, {
  MICKEY_MOUSE_SIMPLE_PALETTES,
} from "./mickey-mouse-simple";
import LiloAndStitchSimpleTemplate, {
  LILO_AND_STITCH_SIMPLE_PALETTES,
} from "./lilo-and-stitch-simple";

export const SIMPLE_TEMPLATE_DEFINITIONS: SimpleTemplateDefinition[] = [
  {
    id: "classic",
    name: "Classic Elegant",
    description: "Template Classic original, folosit implicit pentru conturile fara upgrade.",
    supportsIntroEditor: false,
    showPaletteImagePreview: false,
    palettes: CLASSIC_SIMPLE_PALETTES,
    component: ClassicSimpleTemplate,
  },
  {
    id: "castle-magic-girl-simple",
    name: "Castel Regal",
    description: "Template Castel Regal (fost Girl Castel), cu intro in pas separat si palete extinse.",
    supportsIntroEditor: true,
    palettes: GIRL_CASTLE_SIMPLE_PALETTES,
    component: GirlCastleSimpleTemplate,
  },
  {
    id: "royal-rose-simple",
    name: "Royal Rose",
    description: "Template Royal Rose in varianta simpla, dedicat nuntilor.",
    supportsIntroEditor: false,
    showPaletteImagePreview: false,
    palettes: ROYAL_ROSE_SIMPLE_PALETTES,
    component: RoyalRoseSimpleTemplate,
  },
  {
    id: "blush-bloom-simple",
    name: "Blush Bloom",
    description: "Template Blush Bloom in varianta simpla, dedicat nuntilor.",
    supportsIntroEditor: false,
    showPaletteImagePreview: false,
    palettes: BLUSH_BLOOM_SIMPLE_PALETTES,
    component: BlushBloomSimpleTemplate,
  },
  {
    id: "garden-romantic-simple",
    name: "Garden Romantic",
    description: "Template Garden Romantic in varianta simpla, dedicat nuntilor.",
    supportsIntroEditor: false,
    showPaletteImagePreview: false,
    palettes: GARDEN_ROMANTIC_SIMPLE_PALETTES,
    component: GardenRomanticSimpleTemplate,
  },
  {
    id: "etern-botanica-simple",
    name: "Etern Botanica",
    description: "Template Etern Botanica in varianta simpla, dedicat nuntilor.",
    supportsIntroEditor: false,
    showPaletteImagePreview: false,
    palettes: ETERN_BOTANICA_SIMPLE_PALETTES,
    component: EternBotanicaSimpleTemplate,
  },
  {
    id: "regal-simple",
    name: "Dark Royal",
    description: "Template Dark Royal in varianta simpla, dedicat nuntilor.",
    supportsIntroEditor: false,
    showPaletteImagePreview: false,
    palettes: REGAL_SIMPLE_PALETTES,
    component: RegalSimpleTemplate,
  },
  {
    id: "lord-effects-simple",
    name: "Lord Effects",
    description: "Template Lord Effects in varianta simpla, dedicat nuntilor.",
    supportsIntroEditor: true,
    showPaletteImagePreview: true,
    palettes: LORD_EFFECTS_SIMPLE_PALETTES,
    component: LordEffectsSimpleTemplate,
  },
  {
    id: "luxury-style-simple",
    name: "Luxury Style",
    description: "Template elegant premium, cu intro cinematic si palete neutre pentru evenimente wedding.",
    supportsIntroEditor: true,
    showPaletteImagePreview: true,
    palettes: LUXURY_STYLE_SIMPLE_PALETTES,
    component: LuxuryStyleSimpleTemplate,
  },
  {
    id: "maison-wedding-simple",
    name: "Eiffel Romance",
    description: "Template inspirat de Paris si Turnul Eiffel, cu stil editorial elegant pentru nunti.",
    supportsIntroEditor: false,
    showPaletteImagePreview: false,
    palettes: MAISON_WEDDING_SIMPLE_PALETTES,
    component: MaisonWeddingSimpleTemplate,
  },
  {
    id: "gabbys-dollhouse-simple",
    name: "Gabby's Dollhouse",
    description: "Template Gabby's Dollhouse in varianta simpla, separat de registry-ul principal.",
    supportsIntroEditor: false,
    showPaletteImagePreview: false,
    palettes: GABBYS_DOLLHOUSE_SIMPLE_PALETTES,
    component: GabbysDollhouseSimpleTemplate,
  },
  {
    id: "spiderman-simple",
    name: "Spider Verse",
    description: "Template Spider modern, inspirat din structura Gabby, cu look urban si accente web.",
    supportsIntroEditor: false,
    showPaletteImagePreview: false,
    palettes: SPIDERMAN_SIMPLE_PALETTES,
    component: SpidermanSimpleTemplate,
  },
  {
    id: "mickey-mouse-simple",
    name: "Mickey Mouse",
    description: "Template Mickey Mouse in varianta simpla, cu stil cartoon clasic si accente rosu-galben.",
    supportsIntroEditor: false,
    showPaletteImagePreview: false,
    palettes: MICKEY_MOUSE_SIMPLE_PALETTES,
    component: MickeyMouseSimpleTemplate,
  },
  {
    id: "lilo-and-stitch-simple",
    name: "Lilo & Stitch",
    description: "Template tropical inspirat din Lilo & Stitch, cu look oceanic si accente hawaiiene.",
    supportsIntroEditor: false,
    showPaletteImagePreview: false,
    palettes: LILO_AND_STITCH_SIMPLE_PALETTES,
    component: LiloAndStitchSimpleTemplate,
  },
  {
    id: "adventure-road-simple",
    name: "Adventure Road",
    description: "Template Adventure Road in varianta simpla, separat de registry-ul principal.",
    supportsIntroEditor: false,
    palettes: ADVENTURE_ROAD_SIMPLE_PALETTES,
    component: AdventureRoadSimpleTemplate,
  },
  {
    id: "frozen-simple",
    name: "Frozen",
    description: "Template Frozen in varianta simpla, separat de registry-ul principal.",
    supportsIntroEditor: false,
    palettes: FROZEN_SIMPLE_PALETTES,
    component: FrozenSimpleTemplate,
  },
  {
    id: "jurassic-park-simple",
    name: "Jurassic Park",
    description: "Template Jurassic Park in varianta simpla, separat de registry-ul principal.",
    supportsIntroEditor: true,
    palettes: JURASSIC_SIMPLE_PALETTES,
    component: JurassicSimpleTemplate,
  },
  {
    id: "little-mermaid-simple",
    name: "Little Mermaid",
    description: "Template Little Mermaid in varianta simpla, separat de registry-ul principal.",
    supportsIntroEditor: true,
    palettes: LITTLE_MERMAID_SIMPLE_PALETTES,
    component: LittleMermaidSimpleTemplate,
  },
  {
    id: "unicorn-academy-simple",
    name: "Unicorn Academy",
    description: "Template Unicorn Academy in varianta simpla, separat de registry-ul principal.",
    supportsIntroEditor: false,
    palettes: UNICORN_ACADEMY_SIMPLE_PALETTES,
    component: UnicornAcademySimpleTemplate,
  },
  {
    id: "zootropolis-simple",
    name: "Zootropolis",
    description: "Template Zootropolis in varianta simpla, separat de registry-ul principal.",
    supportsIntroEditor: true,
    palettes: ZOOTROPOLIS_SIMPLE_PALETTES,
    component: ZootropolisSimpleTemplate,
  },
  {
    id: "office-simple",
    name: "Office Meeting",
    description: "Template profesional pentru invitatii la intalniri de lucru, conferinte si evenimente corporate.",
    supportsIntroEditor: false,
    showPaletteImagePreview: false,
    palettes: OFFICE_SIMPLE_PALETTES,
    component: OfficeSimpleTemplate,
  },
];

export const getSimpleTemplateDefinition = (id: string) =>
  SIMPLE_TEMPLATE_DEFINITIONS.find((tpl) => tpl.id === id);

export const getSimpleTemplateComponent = (id: string) =>
  getSimpleTemplateDefinition(id)?.component || null;
