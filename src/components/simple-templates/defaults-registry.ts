import { InvitationBlock, UserProfile } from "../../types";
import {
  CASTLE_DEFAULTS as OFFICE_DEFAULTS,
  CASTLE_DEFAULT_BLOCKS as OFFICE_DEFAULT_BLOCKS,
} from "./office-simple-full";
import {
  CASTLE_DEFAULTS as GIRL_DEFAULTS,
} from "./girl-castle-simple-full";
import {
  CASTLE_DEFAULTS as ADVENTURE_DEFAULTS,
} from "./adventure-road-simple-full";
import {
  CASTLE_DEFAULTS as FROZEN_DEFAULTS,
} from "./frozen-simple-full";
import {
  CASTLE_DEFAULTS as JURASSIC_DEFAULTS,
} from "./jurassic-simple-full";
import {
  CASTLE_DEFAULTS as LITTLE_MERMAID_DEFAULTS,
} from "./little-mermaid-simple-full";
import {
  CASTLE_DEFAULTS as UNICORN_DEFAULTS,
} from "./unicorn-academy-simple-full";
import {
  CASTLE_DEFAULTS as ZOOTROPOLIS_DEFAULTS,
} from "./zootropolis-simple-full";
import {
  CASTLE_DEFAULTS as ROYAL_ROSE_DEFAULTS,
} from "./royal-rose-simple-full";
import {
  CASTLE_DEFAULTS as BLUSH_BLOOM_DEFAULTS,
} from "./blush-bloom-simple-full";
import {
  CASTLE_DEFAULTS as LORD_EFFECTS_DEFAULTS,
} from "./lord-effects-simple-full";
import {
  CASTLE_DEFAULTS as LUXURY_STYLE_DEFAULTS,
} from "./luxury-style-simple-full";
import {
  CASTLE_DEFAULTS as LILO_AND_STITCH_DEFAULTS,
} from "./LiloAndStitchTemplate";
import { getSharedDefaultBlocks } from "./shared-default-blocks";

type DefaultsEntry = {
  profileDefaults?: Partial<UserProfile>;
  blocks: InvitationBlock[];
  configTemplateIds?: string[];
};

type BlockImageConfigInput = {
  blockImages?:
    | Record<string, string>
    | Record<string, Record<string, string> | { byId?: Record<string, string> }>;
  defaultBlockImages?: Record<string, string>;
};

const cloneBlocks = (blocks: InvitationBlock[]): InvitationBlock[] =>
  JSON.parse(JSON.stringify(blocks));

type ClassicEventType = "wedding" | "baptism" | "anniversary" | "office";

const CLASSIC_WEDDING_BLOCKS: InvitationBlock[] = [
  {
    id: "cl-w-text-1",
    type: "text",
    show: true,
    content:
      "Cu emotie si bucurie va invitam sa fiti alaturi de noi in una dintre cele mai frumoase zile din viata noastra.",
  },
  {
    id: "cl-w-location-1",
    type: "location",
    show: true,
    label: "Cununia civila",
    time: "14:00",
    locationName: "Primaria",
    locationAddress: "Strada Exemplu nr. 1",
    wazeLink: "",
  },
  {
    id: "cl-w-location-2",
    type: "location",
    show: true,
    label: "Ceremonia religioasa",
    time: "16:00",
    locationName: "Biserica",
    locationAddress: "Strada Exemplu nr. 2",
    wazeLink: "",
  },
  {
    id: "cl-w-location-3",
    type: "location",
    show: true,
    label: "Petrecerea",
    time: "19:00",
    locationName: "Restaurant",
    locationAddress: "Strada Exemplu nr. 3",
    wazeLink: "",
  },
  {
    id: "cl-w-text-2",
    type: "text",
    show: true,
    content: "Va rugam sa ne confirmati prezenta pentru o organizare cat mai buna.",
  },
];

const CLASSIC_BAPTISM_BLOCKS: InvitationBlock[] = [
  {
    id: "cl-b-text-1",
    type: "text",
    show: true,
    content:
      "Cu bucurie va invitam sa fiti alaturi de noi la acest moment special.",
  },
  {
    id: "cl-b-location-1",
    type: "location",
    show: true,
    label: "Biserica",
    time: "12:00",
    locationName: "Biserica",
    locationAddress: "Strada Exemplu nr. 1",
    wazeLink: "",
  },
  {
    id: "cl-b-location-2",
    type: "location",
    show: true,
    label: "Local",
    time: "15:00",
    locationName: "Restaurant",
    locationAddress: "Strada Exemplu nr. 2",
    wazeLink: "",
  },
  {
    id: "cl-b-text-2",
    type: "text",
    show: true,
    content: "Va asteptam cu drag si va rugam sa confirmati prezenta.",
  },
];

const CLASSIC_ANNIVERSARY_BLOCKS: InvitationBlock[] = [
  {
    id: "cl-a-text-1",
    type: "text",
    show: true,
    content:
      "Te invitam cu drag sa sarbatorim impreuna acest moment special.",
  },
  {
    id: "cl-a-location-1",
    type: "location",
    show: true,
    label: "Locatia evenimentului",
    time: "17:00",
    locationName: "Locatie petrecere",
    locationAddress: "Strada Exemplu nr. 1",
    wazeLink: "",
  },
  {
    id: "cl-a-text-2",
    type: "text",
    show: true,
    content: "Ne-ar bucura sa ne confirmi prezenta.",
  },
];

const CLASSIC_OFFICE_BLOCKS: InvitationBlock[] = [
  {
    id: "cl-o-text-1",
    type: "text",
    show: true,
    content:
      "Va invitam la o intalnire dedicata discutiilor si obiectivelor urmatoarei perioade.",
  },
  {
    id: "cl-o-location-1",
    type: "location",
    show: true,
    label: "Locatie",
    time: "10:00",
    locationName: "Sala de sedinte",
    locationAddress: "Strada Exemplu nr. 1",
    wazeLink: "",
  },
  {
    id: "cl-o-text-2",
    type: "text",
    show: true,
    content: "Va rugam sa confirmati participarea.",
  },
];

const CLASSIC_EVENT_DEFAULTS: Record<ClassicEventType, Partial<UserProfile>> = {
  wedding: {
    welcomeText: "Impreuna cu familiile noastre",
    celebrationText: "nunta noastra",
    showWelcomeText: true,
    showCelebrationText: true,
    showCountdown: false,
    showRsvpButton: true,
    rsvpButtonText: "Confirma prezenta",
    godparents: "[]",
    parents: '{"others":[]}',
  },
  baptism: {
    welcomeText: "Cu multa bucurie",
    celebrationText: "botezul",
    showWelcomeText: true,
    showCelebrationText: true,
    showCountdown: false,
    showRsvpButton: true,
    rsvpButtonText: "Confirma prezenta",
    godparents: "[]",
    parents: '{"others":[]}',
  },
  anniversary: {
    welcomeText: "Cu multa bucurie",
    celebrationText: "aniversarea",
    showWelcomeText: true,
    showCelebrationText: true,
    showCountdown: false,
    showRsvpButton: true,
    rsvpButtonText: "Confirma prezenta",
    godparents: "[]",
    parents: '{"others":[]}',
  },
  office: {
    welcomeText: "Va invitam la",
    celebrationText: "office meeting",
    showWelcomeText: true,
    showCelebrationText: true,
    showCountdown: false,
    showRsvpButton: true,
    rsvpButtonText: "Confirma participarea",
    godparents: "[]",
    parents: '{"others":[]}',
  },
};

const normalizeClassicEventType = (eventType?: string): ClassicEventType => {
  const normalized = String(eventType || "").toLowerCase();
  if (normalized === "wedding") return "wedding";
  if (normalized === "office") return "office";
  if (normalized === "anniversary") return "anniversary";
  return "baptism";
};

const getClassicDefaultBlocksForEvent = (eventType?: string): InvitationBlock[] => {
  const normalized = normalizeClassicEventType(eventType);
  if (normalized === "wedding") return cloneBlocks(CLASSIC_WEDDING_BLOCKS);
  if (normalized === "office") return cloneBlocks(CLASSIC_OFFICE_BLOCKS);
  if (normalized === "anniversary") return cloneBlocks(CLASSIC_ANNIVERSARY_BLOCKS);
  return cloneBlocks(CLASSIC_BAPTISM_BLOCKS);
};

const SIMPLE_DEFAULTS_REGISTRY: Record<string, DefaultsEntry> = {
  classic: {
    profileDefaults: {},
    blocks: getClassicDefaultBlocksForEvent("baptism"),
    configTemplateIds: ["classic"],
  },
  "castle-magic-girl-simple": {
    profileDefaults: GIRL_DEFAULTS as Partial<UserProfile>,
    blocks: getSharedDefaultBlocks("castle-magic-girl-simple"),
    configTemplateIds: [
      "castle-magic-girl-simple",
      "castle-magic-girl",
      "castle-magic-boy-simple",
      "castle-magic-boy",
      "castle-magic-boys",
    ],
  },
  "castle-magic-boy-simple": {
    // Backward-compat alias: boy template now points to Castel Regal defaults.
    profileDefaults: GIRL_DEFAULTS as Partial<UserProfile>,
    blocks: getSharedDefaultBlocks("castle-magic-girl-simple"),
    configTemplateIds: [
      "castle-magic-boy-simple",
      "castle-magic-boys",
      "castle-magic-girl-simple",
      "castle-magic-girl",
    ],
  },
  "royal-rose-simple": {
    profileDefaults: ROYAL_ROSE_DEFAULTS as Partial<UserProfile>,
    blocks: getSharedDefaultBlocks("royal-rose-simple"),
    configTemplateIds: ["royal-rose-simple", "royal-rose"],
  },
  "blush-bloom-simple": {
    profileDefaults: BLUSH_BLOOM_DEFAULTS as Partial<UserProfile>,
    blocks: getSharedDefaultBlocks("blush-bloom-simple"),
    configTemplateIds: ["blush-bloom-simple", "blush-bloom"],
  },
  "garden-romantic-simple": {
    profileDefaults: {},
    blocks: getSharedDefaultBlocks("garden-romantic-simple"),
    configTemplateIds: ["garden-romantic-simple", "garden-romantic"],
  },
  "etern-botanica-simple": {
    profileDefaults: {},
    blocks: getSharedDefaultBlocks("etern-botanica-simple"),
    configTemplateIds: ["etern-botanica-simple", "etern-botanica"],
  },
  "regal-simple": {
    profileDefaults: {},
    blocks: getSharedDefaultBlocks("regal-simple"),
    configTemplateIds: ["regal-simple", "dark-royal"],
  },
  "lord-effects-simple": {
    profileDefaults: LORD_EFFECTS_DEFAULTS as Partial<UserProfile>,
    blocks: getSharedDefaultBlocks("lord-effects-simple"),
    configTemplateIds: ["lord-effects-simple", "lord-effects"],
  },
  "luxury-style-simple": {
    profileDefaults: LUXURY_STYLE_DEFAULTS as Partial<UserProfile>,
    blocks: getSharedDefaultBlocks("luxury-style-simple"),
    configTemplateIds: ["luxury-style-simple", "regal", "jungle-magic-effect"],
  },
  "gabbys-dollhouse-simple": {
    profileDefaults: {},
    blocks: getSharedDefaultBlocks("gabbys-dollhouse-simple"),
    configTemplateIds: ["gabbys-dollhouse-simple", "gabbys-dollhouse"],
  },
  "spiderman-simple": {
    profileDefaults: {},
    blocks: getSharedDefaultBlocks("spiderman-simple"),
    configTemplateIds: ["spiderman-simple", "spiderman-invitation"],
  },
  "mickey-mouse-simple": {
    profileDefaults: {},
    blocks: getSharedDefaultBlocks("mickey-mouse-simple"),
    configTemplateIds: [
      "mickey-mouse-simple",
      "mickey-mouse-invitation",
      "mickey-mouse",
    ],
  },
  "lilo-and-stitch-simple": {
    profileDefaults: LILO_AND_STITCH_DEFAULTS as Partial<UserProfile>,
    blocks: getSharedDefaultBlocks("lilo-and-stitch-simple"),
    configTemplateIds: ["lilo-and-stitch-simple", "lilo-and-stitch"],
  },
  "adventure-road-simple": {
    profileDefaults: ADVENTURE_DEFAULTS as Partial<UserProfile>,
    blocks: getSharedDefaultBlocks("adventure-road-simple"),
    configTemplateIds: ["adventure-road-simple", "adventure-road"],
  },
  "frozen-simple": {
    profileDefaults: FROZEN_DEFAULTS as Partial<UserProfile>,
    blocks: getSharedDefaultBlocks("frozen-simple"),
    configTemplateIds: ["frozen-simple", "frozen"],
  },
  "jurassic-park-simple": {
    profileDefaults: JURASSIC_DEFAULTS as Partial<UserProfile>,
    blocks: getSharedDefaultBlocks("jurassic-park-simple"),
    configTemplateIds: ["jurassic-park-simple", "jurassic-park"],
  },
  "little-mermaid-simple": {
    profileDefaults: LITTLE_MERMAID_DEFAULTS as Partial<UserProfile>,
    blocks: getSharedDefaultBlocks("little-mermaid-simple"),
    configTemplateIds: ["little-mermaid-simple", "little-mermaid"],
  },
  "unicorn-academy-simple": {
    profileDefaults: UNICORN_DEFAULTS as Partial<UserProfile>,
    blocks: getSharedDefaultBlocks("unicorn-academy-simple"),
    configTemplateIds: ["unicorn-academy-simple", "unicorn-academy"],
  },
  "zootropolis-simple": {
    profileDefaults: ZOOTROPOLIS_DEFAULTS as Partial<UserProfile>,
    blocks: getSharedDefaultBlocks("zootropolis-simple"),
    configTemplateIds: ["zootropolis-simple", "zootropolis"],
  },
  "office-simple": {
    profileDefaults: OFFICE_DEFAULTS as Partial<UserProfile>,
    blocks: OFFICE_DEFAULT_BLOCKS as unknown as InvitationBlock[],
    configTemplateIds: ["office-simple"],
  },
};

export const getSimpleTemplateDefaultsEntry = (
  templateId: string,
): DefaultsEntry | undefined => SIMPLE_DEFAULTS_REGISTRY[templateId];

export const getSimpleTemplateDefaultProfile = (
  templateId: string,
): Partial<UserProfile> =>
  (SIMPLE_DEFAULTS_REGISTRY[templateId]?.profileDefaults as Partial<UserProfile>) || {};

export const getSimpleTemplateDefaultBlocks = (
  templateId: string,
  eventType?: string,
): InvitationBlock[] => {
  if (templateId === "classic") return getClassicDefaultBlocksForEvent(eventType);
  return cloneBlocks(SIMPLE_DEFAULTS_REGISTRY[templateId]?.blocks || []);
};

export const getSimpleTemplateConfigLookupIds = (templateId: string): string[] =>
  SIMPLE_DEFAULTS_REGISTRY[templateId]?.configTemplateIds?.length
    ? [...(SIMPLE_DEFAULTS_REGISTRY[templateId]?.configTemplateIds as string[])]
    : [templateId];

const normalizeThemeBlockImageMap = (
  raw: unknown,
): Record<string, string> => {
  if (!raw || typeof raw !== "object") return {};

  const source = raw as Record<string, any>;
  const output: Record<string, string> = {};

  if (source.byId && typeof source.byId === "object") {
    Object.entries(source.byId).forEach(([key, value]) => {
      if (typeof value === "string" && value.trim()) output[key] = value;
    });
  }

  Object.entries(source).forEach(([key, value]) => {
    if (key === "byId") return;
    if (typeof value === "string" && value.trim()) output[key] = value;
  });

  return output;
};

export const resolveTemplateBlockImageMap = (
  config: BlockImageConfigInput | null | undefined,
  colorTheme: string,
): Record<string, string> => {
  if (!config) return {};

  const blockImages = config.blockImages;
  if (blockImages && typeof blockImages === "object") {
    const themed = (blockImages as Record<string, any>)[colorTheme];
    if (themed && typeof themed === "object") {
      return normalizeThemeBlockImageMap(themed);
    }
    const fallbackTheme = (blockImages as Record<string, any>).default;
    if (fallbackTheme && typeof fallbackTheme === "object") {
      return normalizeThemeBlockImageMap(fallbackTheme);
    }
    const flat = normalizeThemeBlockImageMap(blockImages);
    if (Object.keys(flat).length) return flat;
  }

  if (config.defaultBlockImages && typeof config.defaultBlockImages === "object") {
    return normalizeThemeBlockImageMap(config.defaultBlockImages);
  }

  return {};
};

export const applyTemplateBlockImageDefaults = (
  blocks: InvitationBlock[],
  config: BlockImageConfigInput | null | undefined,
  colorTheme: string,
  _templateId?: string,
): InvitationBlock[] => {
  const imageMap = resolveTemplateBlockImageMap(config, colorTheme);
  if (!Object.keys(imageMap).length) return cloneBlocks(blocks);

  let photoIndex = 0;
  return cloneBlocks(blocks).map((block, blockIndex) => {
    if (block.type !== "photo") return block;

    const id = String(block.id || "");
    const directKeyCandidates = [
      id,
      `id:${id}`,
      `block:${id}`,
      `index:${blockIndex}`,
      `idx:${blockIndex}`,
      `photo:${photoIndex}`,
      `photo#${photoIndex}`,
      `photo[${photoIndex}]`,
      "photo",
    ];
    photoIndex += 1;

    const nextImage = directKeyCandidates
      .map((key) => imageMap[key])
      .find((value) => typeof value === "string" && value.trim());

    if (!nextImage) return block;
    return { ...block, imageData: nextImage };
  });
};

export const buildSimpleTemplateDefaultPatch = (
  templateId: string,
  options?: { blocksOverride?: InvitationBlock[]; eventType?: string },
): Partial<UserProfile> => {
  const eventType = String(options?.eventType || "").toLowerCase();

  if (templateId === "classic") {
    const normalizedEventType = normalizeClassicEventType(eventType);
    const blocks =
      options?.blocksOverride || getSimpleTemplateDefaultBlocks(templateId, normalizedEventType);
    const defaults = CLASSIC_EVENT_DEFAULTS[normalizedEventType];
    return {
      customSections: JSON.stringify(cloneBlocks(blocks)),
      timeline: "[]",
      showTimeline: false,
      colorTheme: "default",
      welcomeText: defaults.welcomeText || "",
      celebrationText: defaults.celebrationText || "",
      showWelcomeText: defaults.showWelcomeText ?? true,
      showCelebrationText: defaults.showCelebrationText ?? true,
      showCountdown: defaults.showCountdown ?? false,
      showRsvpButton: defaults.showRsvpButton ?? true,
      rsvpButtonText: defaults.rsvpButtonText || "Confirma Prezenta",
      godparents: defaults.godparents || "[]",
      parents: defaults.parents || '{"others":[]}',
      ...(normalizedEventType === "wedding" ? {} : { partner2Name: "" }),
    } as Partial<UserProfile>;
  }

  const entry = SIMPLE_DEFAULTS_REGISTRY[templateId];
  if (!entry) return {};

  const defaults = (entry.profileDefaults || {}) as Record<string, any>;
  const blocks =
    options?.blocksOverride || getSimpleTemplateDefaultBlocks(templateId, eventType);

  return {
    customSections: JSON.stringify(cloneBlocks(blocks)),
    timeline: "[]",
    showTimeline: false,
    colorTheme: defaults.colorTheme || "default",
    welcomeText: defaults.welcomeText || "",
    celebrationText: defaults.celebrationText || "",
    castleIntroSubtitle: defaults.castleIntroSubtitle || "",
    castleIntroWelcome: defaults.castleIntroWelcome || "",
    castleInviteTop: defaults.castleInviteTop || "",
    castleInviteMiddle: defaults.castleInviteMiddle || "",
    castleInviteBottom: defaults.castleInviteBottom || "",
    castleInviteTag: defaults.castleInviteTag || "",
    jungleHeaderText: defaults.jungleHeaderText || "",
    jungleOverlayText: defaults.jungleOverlayText || "",
    jungleFooterText: defaults.jungleFooterText || "",
    showRsvpButton: defaults.showRsvpButton ?? true,
    rsvpButtonText: defaults.rsvpButtonText || "Confirma Prezenta",
    showWelcomeText: defaults.showWelcomeText ?? true,
    showCelebrationText: defaults.showCelebrationText ?? true,
    showCountdown: defaults.showCountdown ?? false,
    heroBgImage: undefined,
    heroBgImageMobile: undefined,
    churchLabel: "",
    venueLabel: "",
    civilLabel: "",
  };
};
