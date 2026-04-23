import React from "react";
import { InvitationBlock, UserProfile } from "../../types";
import { InvitationData } from "../invitations/types";
import GardenRomanticSimpleFull from "./garden-romantic-simple-full";
import { SimplePalette, SimpleTemplateRenderProps } from "./types";

export const GARDEN_ROMANTIC_SIMPLE_PALETTES: SimplePalette[] = [
  {
    id: "garden-default",
    name: "Garden",
    primary: "#d4a0b0",
    secondary: "#6b8f5e",
    accent: "#f4d06f",
    surface: "#f8f2fb",
    text: "#2b1b35",
  },
  {
    id: "mono-elegance",
    name: "Black & White",
    primary: "#1f1f1f",
    secondary: "#f3f3f3",
    accent: "#9ca3af",
    surface: "#ffffff",
    text: "#111111",
  },
  {
    id: "ivory-gold",
    name: "Ivory Gold",
    primary: "#d4b16a",
    secondary: "#efe3cf",
    accent: "#b8892f",
    surface: "#fffaf0",
    text: "#2f2618",
  },
  {
    id: "champagne-taupe",
    name: "Champagne",
    primary: "#8c7a6b",
    secondary: "#d8cec3",
    accent: "#b79f8b",
    surface: "#f5f2ee",
    text: "#2c2722",
  },
  {
    id: "charcoal-gold",
    name: "Charcoal Gold",
    primary: "#2b2b2b",
    secondary: "#bfa46a",
    accent: "#e2cf9a",
    surface: "#f7f4ef",
    text: "#131313",
  },
  {
    id: "slate-ivory",
    name: "Slate Ivory",
    primary: "#5f6772",
    secondary: "#d9ddd8",
    accent: "#9ca38f",
    surface: "#f6f7f5",
    text: "#23262b",
  },
];

const GardenRomanticSimpleTemplate: React.FC<SimpleTemplateRenderProps> = ({
  data,
  onOpenRSVP,
  editMode = false,
  introOnly = false,
  suppressAudioModal = false,
  onProfileUpdate,
}) => {
  return (
    <GardenRomanticSimpleFull
      data={data as InvitationData}
      onOpenRSVP={onOpenRSVP}
      editMode={editMode}
      introPreview={introOnly || suppressAudioModal}
      onProfileUpdate={(patch: Record<string, any>) =>
        onProfileUpdate?.(patch as Partial<UserProfile>)
      }
      onBlocksUpdate={(blocks: InvitationBlock[]) =>
        onProfileUpdate?.({ customSections: JSON.stringify(blocks) })
      }
    />
  );
};

export default GardenRomanticSimpleTemplate;
