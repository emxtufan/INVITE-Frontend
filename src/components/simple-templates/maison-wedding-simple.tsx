import React from "react";
import { InvitationBlock, UserProfile } from "../../types";
import { InvitationData } from "../invitations/types";
import MaisonWeddingTemplate, {
  MAISON_WEDDING_THEMES,
} from "./MaisonWeddingTemplate";
import { SimplePalette, SimpleTemplateRenderProps } from "./types";

export const MAISON_WEDDING_SIMPLE_PALETTES: SimplePalette[] =
  MAISON_WEDDING_THEMES.map((theme) => ({
    id: theme.id,
    name: `${theme.emoji} ${theme.name}`.trim(),
    primary: theme.gold,
    secondary: theme.creamD,
    accent: theme.goldLight,
    surface: theme.ivory,
    text: theme.ink,
  }));

const MaisonWeddingSimpleTemplate: React.FC<SimpleTemplateRenderProps> = ({
  data,
  onOpenRSVP,
  editMode = false,
  suppressAudioModal = false,
  scrollContainer,
  onProfileUpdate,
}) => {
  return (
    <MaisonWeddingTemplate
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

export default MaisonWeddingSimpleTemplate;
