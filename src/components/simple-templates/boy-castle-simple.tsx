import React from "react";
import { UserProfile } from "../../types";
import { InvitationData } from "../invitations/types";
import BoyCastleTemplate from "../invitations/BoyCastelMagicTemplates";
import { BOY_THEMES } from "../invitations/castleDefaults";
import { SimplePalette, SimpleTemplateRenderProps } from "./types";

export const BOY_CASTLE_SIMPLE_PALETTES: SimplePalette[] = BOY_THEMES.map(
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

const BoyCastleSimpleTemplate: React.FC<SimpleTemplateRenderProps> = ({
  data,
  onOpenRSVP,
  editMode = false,
  introOnly = false,
  suppressAudioModal = false,
  enableGsapPreview = false,
  onProfileUpdate,
  scrollContainer,
}) => {
  return (
    <BoyCastleTemplate
      data={data as InvitationData}
      onOpenRSVP={onOpenRSVP}
      editMode={editMode}
      introPreview={introOnly || suppressAudioModal}
      introOnly={introOnly}
      suppressAudioModal={suppressAudioModal}
      enableGsapPreview={enableGsapPreview}
      scrollContainer={scrollContainer}
      onProfileUpdate={(patch: Record<string, any>) =>
        onProfileUpdate?.(patch as Partial<UserProfile>)
      }
    />
  );
};

export default BoyCastleSimpleTemplate;
