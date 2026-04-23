import React from "react";
import { InvitationBlock, UserProfile } from "../../types";
import { InvitationData } from "../invitations/types";
import {
  ADVENTURE_BOY_THEMES,
  ADVENTURE_GIRL_THEMES,
} from "../invitations/castleDefaults";
import AdventureRoadTemplate from "./adventure-road-simple-full";
import { SimplePalette, SimpleTemplateRenderProps } from "./types";

export const ADVENTURE_ROAD_SIMPLE_PALETTES: SimplePalette[] = [
  ...ADVENTURE_BOY_THEMES,
  ...ADVENTURE_GIRL_THEMES,
].map((theme) => ({
  id: theme.id,
  name: `${theme.emoji} ${theme.name}`.trim(),
  primary: theme.sky,
  secondary: theme.skyLight,
  accent: theme.gold,
  surface: theme.skyPale,
  text: theme.text,
}));

const AdventureRoadSimpleTemplate: React.FC<SimpleTemplateRenderProps> = ({
  data,
  onOpenRSVP,
  editMode = false,
  introOnly = false,
  suppressAudioModal = false,
  scrollContainer,
  onProfileUpdate,
}) => {
  return (
    <AdventureRoadTemplate
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

export default AdventureRoadSimpleTemplate;
