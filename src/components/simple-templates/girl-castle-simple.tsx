import React from "react";
import { UserProfile } from "../../types";
import { InvitationData } from "../invitations/types";
import CastleMagicTemplateGirl, {
  GIRL_CASTLE_SIMPLE_THEMES,
} from "./girl-castle-simple-full";
import { SimplePalette, SimpleTemplateRenderProps } from "./types";

export const GIRL_CASTLE_SIMPLE_PALETTES: SimplePalette[] = GIRL_CASTLE_SIMPLE_THEMES.map(
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

const GirlCastleSimpleTemplate: React.FC<SimpleTemplateRenderProps> = ({
  data,
  onOpenRSVP,
  editMode = false,
  introOnly = false,
  suppressAudioModal = false,
  enableGsapPreview = false,
  scrollContainer,
  onProfileUpdate,
}) => {
  return (
    <CastleMagicTemplateGirl
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

export default GirlCastleSimpleTemplate;
