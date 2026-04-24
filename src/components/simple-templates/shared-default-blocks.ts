import { InvitationBlock } from "../../types";
import SIMPLE_UNIFIED_DEFAULT_BLOCKS_JSON from "./default-blocks.json";
import SIMPLE_WEDDING_DEFAULT_BLOCKS_JSON from "./default-blocks-wedding.json";
import SIMPLE_MICKEY_DEFAULT_BLOCKS_JSON from "./default-blocks-mickey.json";
import { LILO_DEFAULT_BLOCKS } from "./LiloAndStitchTemplate";

const BASE_DEFAULT_BLOCKS =
  SIMPLE_UNIFIED_DEFAULT_BLOCKS_JSON as unknown as InvitationBlock[];
const WEDDING_DEFAULT_BLOCKS =
  SIMPLE_WEDDING_DEFAULT_BLOCKS_JSON as unknown as InvitationBlock[];
const MICKEY_SHARED_BLOCKS =
  SIMPLE_MICKEY_DEFAULT_BLOCKS_JSON as unknown as InvitationBlock[];

const TEMPLATE_SPECIFIC_DEFAULT_BLOCKS: Record<string, InvitationBlock[]> = {
  "mickey-mouse-simple": MICKEY_SHARED_BLOCKS,
  "lilo-and-stitch-simple":
    LILO_DEFAULT_BLOCKS as unknown as InvitationBlock[],
};

const WEDDING_TEMPLATE_IDS = new Set([
  "royal-rose",
  "royal-rose-simple",
  "blush-bloom",
  "blush-bloom-simple",
  "garden-romantic",
  "garden-romantic-simple",
  "etern-botanica",
  "etern-botanica-simple",
  "dark-royal",
  "regal",
  "regal-simple",
  "lord-effects",
  "lord-effects-simple",
  "jungle-magic-effect",
  "luxury-style-simple",
]);

const TEMPLATE_BLOCK_IMAGE_PRESETS: Record<string, Record<string, string>> = {
  "spiderman-simple": {
    "sp-photo-1": "/spiderman/marvels-spider-man-3840x2160-11990.jpeg",
    "sp-photo-2":
      "/spiderman/spider-man-into-the-spider-verse-miles-morales-spider-man-5000x2250-2948.jpg",
  },
};

const cloneBlocks = (blocks: InvitationBlock[]): InvitationBlock[] =>
  JSON.parse(JSON.stringify(blocks));

const resolveBaseBlocksByTemplate = (templateId: string): InvitationBlock[] => {
  const normalizedTemplateId = String(templateId || "").trim().toLowerCase();
  if (TEMPLATE_SPECIFIC_DEFAULT_BLOCKS[normalizedTemplateId]) {
    return TEMPLATE_SPECIFIC_DEFAULT_BLOCKS[normalizedTemplateId];
  }
  return WEDDING_TEMPLATE_IDS.has(normalizedTemplateId)
    ? WEDDING_DEFAULT_BLOCKS
    : BASE_DEFAULT_BLOCKS;
};

const applyBlockImageMap = (
  blocks: InvitationBlock[],
  imageMap: Record<string, string>,
): InvitationBlock[] => {
  if (!Object.keys(imageMap).length) return cloneBlocks(blocks);

  let photoIndex = 0;
  return cloneBlocks(blocks).map((block, blockIndex) => {
    if (block.type !== "photo") return block;

    const id = String(block.id || "");
    const keyCandidates = [
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

    const nextImage = keyCandidates
      .map((key) => imageMap[key])
      .find((value) => typeof value === "string" && value.trim());

    if (!nextImage) return block;
    return { ...block, imageData: nextImage };
  });
};

export const getSharedDefaultBlocks = (templateId: string): InvitationBlock[] =>
  applyBlockImageMap(
    resolveBaseBlocksByTemplate(templateId),
    TEMPLATE_BLOCK_IMAGE_PRESETS[templateId] || {},
  );

export const getTemplatePresetBlockImageMap = (
  templateId: string,
): Record<string, string> => ({ ...(TEMPLATE_BLOCK_IMAGE_PRESETS[templateId] || {}) });
