import React from "react";
import { InvitationBlock, UserProfile } from "../../types";
import { InvitationData } from "../invitations/types";
import { GABBY_THEMES } from "../invitations/castleDefaults";
import GabbysDollhouseTemplate from "./gabbys-dollhouse-simple-full";
import { SimplePalette, SimpleTemplateRenderProps } from "./types";

export const GABBYS_DOLLHOUSE_SIMPLE_PALETTES: SimplePalette[] = GABBY_THEMES.map(
  (theme) => ({
    id: theme.id,
    name: `${theme.emoji} ${theme.name}`.trim(),
    primary: theme.PINK_DARK,
    secondary: theme.PINK_L,
    accent: theme.GOLD,
    surface: theme.CREAM,
    text: theme.TEXT,
  }),
);

const GabbysDollhouseSimpleTemplate: React.FC<SimpleTemplateRenderProps> = ({
  data,
  onOpenRSVP,
  editMode = false,
  introOnly = false,
  suppressAudioModal = false,
  scrollContainer,
  onProfileUpdate,
}) => {
  return (
    <GabbysDollhouseTemplate
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

export default GabbysDollhouseSimpleTemplate;
