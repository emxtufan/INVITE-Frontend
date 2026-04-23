import React from "react";
import { InvitationBlock, UserProfile } from "../../types";
import { InvitationData } from "../invitations/types";
import MickeyMouseTemplate from "./mickey-mouse-simple-full";
import { SimplePalette, SimpleTemplateRenderProps } from "./types";

export const MICKEY_MOUSE_SIMPLE_PALETTES: SimplePalette[] = [
  {
    id: "default",
    name: "Classic Mickey",
    primary: "#cc0000",
    secondary: "#ffe000",
    accent: "#1a1a1a",
    surface: "#fff9f0",
    text: "#1a1a1a",
  },
  {
    id: "mickey-classic",
    name: "Classic Mickey",
    primary: "#cc0000",
    secondary: "#ffe000",
    accent: "#1a1a1a",
    surface: "#fff9f0",
    text: "#1a1a1a",
  },
  {
    id: "mickey-minnie-pink",
    name: "Minnie Pink",
    primary: "#e11d48",
    secondary: "#ff8cc8",
    accent: "#1a1a1a",
    surface: "#fff1f7",
    text: "#1a1a1a",
  },
  {
    id: "mickey-midnight",
    name: "Midnight Clubhouse",
    primary: "#b91c1c",
    secondary: "#0f172a",
    accent: "#facc15",
    surface: "#111827",
    text: "#f9fafb",
  },
  {
    id: "mickey-clubhouse-blue",
    name: "Clubhouse Blue",
    primary: "#2563eb",
    secondary: "#fbbf24",
    accent: "#1e293b",
    surface: "#eff6ff",
    text: "#0f172a",
  },
  {
    id: "mickey-hero-boys",
    name: "Hero Boys",
    primary: "#0ea5e9",
    secondary: "#22d3ee",
    accent: "#082f49",
    surface: "#e0f2fe",
    text: "#082f49",
  },
  {
    id: "mickey-princess-girl",
    name: "Princess Girl",
    primary: "#db2777",
    secondary: "#f9a8d4",
    accent: "#3b0a1e",
    surface: "#fff1f7",
    text: "#3b0a1e",
  },
  {
    id: "mickey-lavender-girl",
    name: "Lavender Girl",
    primary: "#a855f7",
    secondary: "#f0abfc",
    accent: "#581c87",
    surface: "#faf5ff",
    text: "#3b175a",
  },
];

const MickeyMouseSimpleTemplate: React.FC<SimpleTemplateRenderProps> = ({
  data,
  onOpenRSVP,
  editMode = false,
  introOnly = false,
  suppressAudioModal = false,
  scrollContainer,
  onProfileUpdate,
}) => {
  return (
    <MickeyMouseTemplate
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

export default MickeyMouseSimpleTemplate;
