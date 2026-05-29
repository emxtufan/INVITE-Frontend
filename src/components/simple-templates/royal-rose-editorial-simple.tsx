import React from "react";
import { InvitationBlock, UserProfile } from "../../types";
import { InvitationData } from "../invitations/types";
import { ROYAL_ROSE_THEMES } from "../invitations/castleDefaults";
import RoyalRoseEditorialSimpleFull from "./royal-rose-editorial-simple-full";
import { SimplePalette, SimpleTemplateRenderProps } from "./types";

export const ROYAL_ROSE_EDITORIAL_SIMPLE_PALETTES: SimplePalette[] =
  ROYAL_ROSE_THEMES.map((theme) => ({
    id: theme.id,
    name: `${theme.emoji} ${theme.name}`.trim(),
    primary: theme.PINK_DARK,
    secondary: theme.PINK_L,
    accent: theme.GOLD,
    surface: theme.CREAM,
    text: theme.TEXT,
  }));

export {
  CASTLE_DEFAULTS as ROYAL_ROSE_EDITORIAL_DEFAULTS,
} from "./royal-rose-editorial-simple-full";

const RoyalRoseEditorialSimpleTemplate: React.FC<SimpleTemplateRenderProps> = ({
  data,
  onOpenRSVP,
  editMode = false,
  introOnly = false,
  suppressAudioModal = false,
  onProfileUpdate,
}) => {
  return (
    <RoyalRoseEditorialSimpleFull
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

export default RoyalRoseEditorialSimpleTemplate;
