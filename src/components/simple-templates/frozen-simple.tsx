import React from "react";
import { InvitationBlock, UserProfile } from "../../types";
import { InvitationData } from "../invitations/types";
import { FROZEN_THEMES } from "../invitations/castleDefaults";
import FrozenTemplate from "./frozen-simple-full";
import { SimplePalette, SimpleTemplateRenderProps } from "./types";

export const FROZEN_SIMPLE_PALETTES: SimplePalette[] = FROZEN_THEMES.map((theme) => ({
  id: theme.id,
  name: `${theme.emoji} ${theme.name}`.trim(),
  primary: theme.PINK_DARK,
  secondary: theme.PINK_L,
  accent: theme.GOLD,
  surface: theme.CREAM,
  text: theme.TEXT,
}));

const FrozenSimpleTemplate: React.FC<SimpleTemplateRenderProps> = ({
  data,
  onOpenRSVP,
  editMode = false,
  introOnly = false,
  suppressAudioModal = false,
  scrollContainer,
  onProfileUpdate,
}) => {
  return (
    <FrozenTemplate
      data={data as InvitationData}
      onOpenRSVP={onOpenRSVP}
      editMode={editMode}
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

export default FrozenSimpleTemplate;
