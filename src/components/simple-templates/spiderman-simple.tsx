import React from "react";
import { InvitationBlock, UserProfile } from "../../types";
import { InvitationData } from "../invitations/types";
import SpidermanTemplate from "./spiderman-simple-full";
import { SimplePalette, SimpleTemplateRenderProps } from "./types";

export const SPIDERMAN_SIMPLE_PALETTES: SimplePalette[] = [
  {
    id: "default",
    name: " Classic Red Blue",
    primary: "#dc2626",
    secondary: "#1d4ed8",
    accent: "#f59e0b",
    surface: "#f8fafc",
    text: "#0f172a",
  },
  {
    id: "night-web",
    name: " Night Web",
    primary: "#ef4444",
    secondary: "#1e3a8a",
    accent: "#38bdf8",
    surface: "#0f172a",
    text: "#e2e8f0",
  },
  {
    id: "neon-city",
    name: " Neon City",
    primary: "#f43f5e",
    secondary: "#2563eb",
    accent: "#22d3ee",
    surface: "#0b1020",
    text: "#e5e7eb",
  },
  {
    id: "sunset-hero",
    name: " Sunset Hero",
    primary: "#f97316",
    secondary: "#9333ea",
    accent: "#facc15",
    surface: "#fff7ed",
    text: "#1f2937",
  },
];

const SpidermanSimpleTemplate: React.FC<SimpleTemplateRenderProps> = ({
  data,
  onOpenRSVP,
  editMode = false,
  introOnly = false,
  suppressAudioModal = false,
  scrollContainer,
  onProfileUpdate,
}) => {
  return (
    <SpidermanTemplate
      data={data as InvitationData}
      onOpenRSVP={onOpenRSVP}
      editMode={editMode}
      introPreview={introOnly || suppressAudioModal}
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

export default SpidermanSimpleTemplate;

