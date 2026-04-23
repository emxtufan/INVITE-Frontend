import React from "react";
import { InvitationBlock, UserProfile } from "../../types";
import { InvitationData } from "../invitations/types";
import { LUXURY_NEUTRAL_THEMES } from "../invitations/castleDefaults";
import LuxuryStyleSimpleFull from "./luxury-style-simple-full";
import { SimplePalette, SimpleTemplateRenderProps } from "./types";

export const LUXURY_STYLE_SIMPLE_PALETTES: SimplePalette[] = LUXURY_NEUTRAL_THEMES.map(
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

const LuxuryStyleSimpleTemplate: React.FC<SimpleTemplateRenderProps> = ({
  data,
  onOpenRSVP,
  editMode = false,
  introOnly = false,
  suppressAudioModal = false,
  onProfileUpdate,
}) => {
  return (
    <LuxuryStyleSimpleFull
      data={data as InvitationData}
      onOpenRSVP={onOpenRSVP}
      editMode={editMode}
      introOnly={introOnly}
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

export default LuxuryStyleSimpleTemplate;
