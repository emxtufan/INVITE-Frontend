import React from "react";
import { InvitationBlock, UserProfile } from "../../types";
import { InvitationData } from "../invitations/types";
import LiloAndStitchTemplate from "./LiloAndStitchTemplate";
import { SimplePalette, SimpleTemplateRenderProps } from "./types";

export const LILO_AND_STITCH_SIMPLE_PALETTES: SimplePalette[] = [
  {
    id: "default",
    name: "Aloha Ocean",
    primary: "#0a3d5c",
    secondary: "#00b4d8",
    accent: "#e63946",
    surface: "#f5e6c8",
    text: "#0f172a",
  },
  {
    id: "lilo-volcano-night",
    name: "Volcano Night",
    primary: "#111827",
    secondary: "#dc2626",
    accent: "#f59e0b",
    surface: "#1f2937",
    text: "#fff7ed",
  },
  {
    id: "lilo-neon-lagoon",
    name: "Neon Lagoon",
    primary: "#082f49",
    secondary: "#06b6d4",
    accent: "#ec4899",
    surface: "#0f172a",
    text: "#ecfeff",
  },
  {
    id: "lilo-sunset-punch",
    name: "Sunset Punch",
    primary: "#7c2d12",
    secondary: "#f97316",
    accent: "#fb7185",
    surface: "#431407",
    text: "#fff7ed",
  },
  {
    id: "lilo-jungle-pop",
    name: "Jungle Pop",
    primary: "#14532d",
    secondary: "#22c55e",
    accent: "#38bdf8",
    surface: "#052e16",
    text: "#f0fdf4",
  },
  {
    id: "lilo-pink-ohana",
    name: "Pink Ohana",
    primary: "#831843",
    secondary: "#ec4899",
    accent: "#38bdf8",
    surface: "#500724",
    text: "#fff1f2",
  },
];

const LiloAndStitchSimpleTemplate: React.FC<SimpleTemplateRenderProps> = ({
  data,
  onOpenRSVP,
  editMode = false,
  suppressAudioModal = false,
  scrollContainer,
  onProfileUpdate,
}) => {
  return (
    <LiloAndStitchTemplate
      data={data as InvitationData}
      onOpenRSVP={onOpenRSVP}
      editMode={editMode}
      suppressAudioModal={suppressAudioModal}
      scrollContainer={scrollContainer}
      onProfileUpdate={(patch: Record<string, any>) =>
        onProfileUpdate?.(patch as Partial<UserProfile>)
      }
      onBlocksUpdate={(blocks: InvitationBlock[]) =>
        onProfileUpdate?.({ customSections: JSON.stringify(blocks) })
      }
    />
  );
};

export default LiloAndStitchSimpleTemplate;
