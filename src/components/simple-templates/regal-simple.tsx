import React from "react";
import { InvitationBlock, UserProfile } from "../../types";
import { InvitationData } from "../invitations/types";
import RegalSimpleFull from "./regal-simple-full";
import { SimplePalette, SimpleTemplateRenderProps } from "./types";

export const REGAL_SIMPLE_PALETTES: SimplePalette[] = [
  {
    id: "regal-gold",
    name: "Regal Gold",
    primary: "#0d1117",
    secondary: "#1a2035",
    accent: "#c9a84c",
    surface: "#f8f9fc",
    text: "#111827",
  },
  {
    id: "regal-obsidian",
    name: "Obsidian Black",
    primary: "#0b0b0d",
    secondary: "#1a1a1f",
    accent: "#f2f2f2",
    surface: "#f5f5f5",
    text: "#111111",
  },
  {
    id: "regal-graphite",
    name: "Graphite Gray",
    primary: "#121417",
    secondary: "#23272f",
    accent: "#b9c0cc",
    surface: "#eef0f3",
    text: "#1f2937",
  },
  {
    id: "regal-silver",
    name: "Silver Steel",
    primary: "#10131a",
    secondary: "#1f2836",
    accent: "#c8d0dc",
    surface: "#f2f4f8",
    text: "#0f172a",
  },
  {
    id: "regal-platinum",
    name: "Platinum Ivory",
    primary: "#111318",
    secondary: "#252a33",
    accent: "#e5e7eb",
    surface: "#ffffff",
    text: "#111827",
  },
  {
    id: "regal-argent-gold",
    name: "Argent Gold",
    primary: "#0f1116",
    secondary: "#202734",
    accent: "#d7bf79",
    surface: "#f7f7f4",
    text: "#111827",
  },
];

const RegalSimpleTemplate: React.FC<SimpleTemplateRenderProps> = ({
  data,
  onOpenRSVP,
  editMode = false,
  introOnly = false,
  suppressAudioModal = false,
  onProfileUpdate,
}) => {
  return (
    <RegalSimpleFull
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

export default RegalSimpleTemplate;

