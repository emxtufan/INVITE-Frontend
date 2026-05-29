import React from "react";
import { InvitationBlock, UserProfile } from "../../types";
import { InvitationData } from "../invitations/types";
import MirageFloralSimpleFull, {
  CASTLE_DEFAULT_BLOCKS as MIRAGE_FLORAL_DEFAULT_BLOCKS,
  CASTLE_DEFAULTS as MIRAGE_FLORAL_DEFAULTS,
  MIRAGE_FLORAL_PALETTES,
} from "./mirage-floral-simple-full";
import { SimplePalette, SimpleTemplateRenderProps } from "./types";

export const MIRAGE_FLORAL_SIMPLE_PALETTES: SimplePalette[] = Object.values(
  MIRAGE_FLORAL_PALETTES,
).map((palette) => ({
  id: palette.id,
  name: palette.name,
  primary: palette.primary,
  secondary: palette.secondary,
  accent: palette.accent,
  surface: palette.cardBg,
  text: palette.textColor,
}));

export { MIRAGE_FLORAL_DEFAULTS, MIRAGE_FLORAL_DEFAULT_BLOCKS };

const MirageFloralSimpleWrapper: React.FC<SimpleTemplateRenderProps> = ({
  data,
  onOpenRSVP,
  editMode = false,
  introOnly = false,
  suppressAudioModal = false,
  onProfileUpdate,
}) => {
  return (
    <MirageFloralSimpleFull
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

export default MirageFloralSimpleWrapper;
