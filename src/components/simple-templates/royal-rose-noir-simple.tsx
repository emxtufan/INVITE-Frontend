import React from "react";
import { InvitationBlock, UserProfile } from "../../types";
import { InvitationData } from "../invitations/types";
import { ROYAL_ROSE_THEMES } from "../invitations/castleDefaults";
import RoyalRoseNoirSimpleFull from "./royal-rose-noir-simple-full";
import { SimplePalette, SimpleTemplateRenderProps } from "./types";

export const ROYAL_ROSE_NOIR_SIMPLE_PALETTES: SimplePalette[] =
  ROYAL_ROSE_THEMES.map((theme) => ({
    id: theme.id,
    name: `${theme.emoji} ${theme.name}`.trim(),
    primary: "#09090b",
    secondary: theme.PINK_L,
    accent: "#fafafa",
    surface: "#121212",
    text: "#fafafa",
  }));

export {
  CASTLE_DEFAULTS as ROYAL_ROSE_NOIR_DEFAULTS,
} from "./royal-rose-noir-simple-full";

const RoyalRoseNoirSimpleWrapper: React.FC<SimpleTemplateRenderProps> = ({
  data,
  onOpenRSVP,
  editMode = false,
  introOnly = false,
  suppressAudioModal = false,
  onProfileUpdate,
}) => {
  return (
    <RoyalRoseNoirSimpleFull
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

export default RoyalRoseNoirSimpleWrapper;
