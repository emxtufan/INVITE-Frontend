import React from "react";
import { InvitationBlock, UserProfile } from "../../types";
import { InvitationData } from "../invitations/types";
import { UNICORN_THEMES } from "../invitations/castleDefaults";
import UnicornAcademyTemplate from "./unicorn-academy-simple-full";
import { SimplePalette, SimpleTemplateRenderProps } from "./types";

export const UNICORN_ACADEMY_SIMPLE_PALETTES: SimplePalette[] = UNICORN_THEMES.map(
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

const UnicornAcademySimpleTemplate: React.FC<SimpleTemplateRenderProps> = ({
  data,
  onOpenRSVP,
  editMode = false,
  introOnly = false,
  suppressAudioModal = false,
  scrollContainer,
  onProfileUpdate,
}) => {
  return (
    <UnicornAcademyTemplate
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

export default UnicornAcademySimpleTemplate;
