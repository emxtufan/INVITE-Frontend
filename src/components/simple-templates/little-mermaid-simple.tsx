import React from "react";
import { InvitationBlock, UserProfile } from "../../types";
import { InvitationData } from "../invitations/types";
import {
  MERMAID_BOY_THEMES,
  MERMAID_GIRL_THEMES,
} from "../invitations/castleDefaults";
import LittleMermaidTemplate from "./little-mermaid-simple-full";
import { SimplePalette, SimpleTemplateRenderProps } from "./types";

export const LITTLE_MERMAID_SIMPLE_PALETTES: SimplePalette[] = [
  ...MERMAID_BOY_THEMES,
  ...MERMAID_GIRL_THEMES,
].map((theme) => ({
  id: theme.id,
  name: `${theme.emoji} ${theme.name}`.trim(),
  primary: theme.teal,
  secondary: theme.tealPale,
  accent: theme.gold,
  surface: theme.pearl,
  text: theme.deep,
}));

const LittleMermaidSimpleTemplate: React.FC<SimpleTemplateRenderProps> = ({
  data,
  onOpenRSVP,
  editMode = false,
  introOnly = false,
  suppressAudioModal = false,
  scrollContainer,
  onProfileUpdate,
}) => {
  return (
    <LittleMermaidTemplate
      data={data as InvitationData}
      onOpenRSVP={onOpenRSVP}
      editMode={editMode}
      introOnly={introOnly}
      introPreview={introOnly || suppressAudioModal}
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

export default LittleMermaidSimpleTemplate;
