import React from "react";
import { InvitationBlock, UserProfile } from "../../types";
import { InvitationData } from "../invitations/types";
import OfficeTemplate from "./office-simple-full";
import { SimplePalette, SimpleTemplateRenderProps } from "./types";

export const OFFICE_SIMPLE_PALETTES: SimplePalette[] = [
  {
    id: "office-dark-amber",
    name: "Dark Amber",
    primary: "#c87820",
    secondary: "#1a2535",
    accent: "#e09830",
    surface: "#0e1825",
    text: "#f0e8d0",
  },
  {
    id: "office-dark-steel",
    name: "Dark Blue",
    primary: "#6a98c0",
    secondary: "#162235",
    accent: "#8ab8e0",
    surface: "#0e1a2a",
    text: "#e8f0f8",
  },
  {
    id: "office-dark-emerald",
    name: "Dark Green",
    primary: "#4a9060",
    secondary: "#122018",
    accent: "#6ab880",
    surface: "#0a180e",
    text: "#d8f0e0",
  },
  {
    id: "office-slate-gold",
    name: "Slate Gold",
    primary: "#d4a830",
    secondary: "#22253a",
    accent: "#f0c840",
    surface: "#181a22",
    text: "#f8f0d8",
  },
  {
    id: "office-charcoal-red",
    name: "Charcoal Red",
    primary: "#c04040",
    secondary: "#251515",
    accent: "#e05050",
    surface: "#1a1010",
    text: "#f8e8e8",
  },
  {
    id: "office-bw",
    name: "Negru & Alb",
    primary: "#d8d8d8",
    secondary: "#111111",
    accent: "#ffffff",
    surface: "#080808",
    text: "#f4f4f4",
  },
  {
    id: "office-charcoal",
    name: "Gri Inchis",
    primary: "#aaaaaa",
    secondary: "#242424",
    accent: "#cccccc",
    surface: "#1a1a1a",
    text: "#f0f0f0",
  },
  {
    id: "office-light-gray",
    name: "Alb & Gri",
    primary: "#2c2c2c",
    secondary: "#e8e8ec",
    accent: "#444444",
    surface: "#f2f2f4",
    text: "#0a0a0a",
  },
  {
    id: "office-light-navy",
    name: "Alb & Navy",
    primary: "#1a3a5c",
    secondary: "#e2eaf2",
    accent: "#2a5a8c",
    surface: "#f0f4f8",
    text: "#0a1828",
  },
  {
    id: "office-light-warm",
    name: "Alb Cald",
    primary: "#8b5e3c",
    secondary: "#f0ebe2",
    accent: "#a87050",
    surface: "#f8f4ee",
    text: "#1a0e06",
  },
];

const OfficeSimpleTemplate: React.FC<SimpleTemplateRenderProps> = ({
  data,
  onOpenRSVP,
  editMode = false,
  onProfileUpdate,
}) => {
  return (
    <OfficeTemplate
      data={data as InvitationData}
      onOpenRSVP={onOpenRSVP}
      editMode={editMode}
      onProfileUpdate={(patch: Record<string, any>) =>
        onProfileUpdate?.(patch as Partial<UserProfile>)
      }
      onBlocksUpdate={(blocks: InvitationBlock[]) =>
        onProfileUpdate?.({ customSections: JSON.stringify(blocks) })
      }
    />
  );
};

export default OfficeSimpleTemplate;
