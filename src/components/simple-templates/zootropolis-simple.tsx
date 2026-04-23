import React from "react";
import { InvitationBlock, UserProfile } from "../../types";
import { InvitationData } from "../invitations/types";
import {
  ZOOTROPOLIS_BOY_THEMES,
  ZOOTROPOLIS_GIRL_THEMES,
} from "../invitations/castleDefaults";
import ZootropolisTemplate from "./zootropolis-simple-full";
import { SimplePalette, SimpleTemplateRenderProps } from "./types";

export const ZOOTROPOLIS_SIMPLE_PALETTES: SimplePalette[] = [
  ...ZOOTROPOLIS_BOY_THEMES,
  ...ZOOTROPOLIS_GIRL_THEMES,
].map((theme) => ({
  id: theme.id,
  name: `${theme.emoji} ${theme.name}`.trim(),
  primary: theme.city,
  secondary: theme.orange,
  accent: theme.steelLight,
  surface: theme.sky,
  text: theme.cityMid,
}));

const ZootropolisSimpleTemplate: React.FC<SimpleTemplateRenderProps> = ({
  data,
  onOpenRSVP,
  editMode = false,
  introOnly = false,
  suppressAudioModal = false,
  scrollContainer,
  onProfileUpdate,
}) => {
  return (
    <ZootropolisTemplate
      data={data as InvitationData}
      onOpenRSVP={onOpenRSVP}
      editMode={editMode}
      introOnly={introOnly}
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

export default ZootropolisSimpleTemplate;
