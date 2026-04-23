import React from "react";
import { InvitationBlock, UserProfile } from "../../types";
import { InvitationData } from "../invitations/types";
import { ROYAL_ROSE_THEMES } from "../invitations/castleDefaults";
import RoyalRoseSimpleFull from "./royal-rose-simple-full";
import { SimplePalette, SimpleTemplateRenderProps } from "./types";

export const ROYAL_ROSE_SIMPLE_PALETTES: SimplePalette[] = ROYAL_ROSE_THEMES.map(
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

const RoyalRoseSimpleTemplate: React.FC<SimpleTemplateRenderProps> = ({
  data,
  onOpenRSVP,
  editMode = false,
  introOnly = false,
  suppressAudioModal = false,
  onProfileUpdate,
}) => {
  return (
    <RoyalRoseSimpleFull
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

export default RoyalRoseSimpleTemplate;
