import React from "react";
import { InvitationBlock, UserProfile } from "../../types";
import { InvitationData } from "../invitations/types";
import {
  JURASSIC_BOY_THEMES,
  JURASSIC_GIRL_THEMES,
} from "../invitations/castleDefaults";
import JurassicTemplate from "./jurassic-simple-full";
import { SimplePalette, SimpleTemplateRenderProps } from "./types";

export const JURASSIC_SIMPLE_PALETTES: SimplePalette[] = [
  ...JURASSIC_BOY_THEMES,
  ...JURASSIC_GIRL_THEMES,
].map((theme) => ({
  id: theme.id,
  name: `${theme.emoji} ${theme.name}`.trim(),
  primary: theme.amber,
  secondary: theme.moss,
  accent: theme.amberLight,
  surface: theme.cream,
  text: theme.text,
}));

const JurassicSimpleTemplate: React.FC<SimpleTemplateRenderProps> = ({
  data,
  onOpenRSVP,
  editMode = false,
  introOnly = false,
  suppressAudioModal = false,
  scrollContainer,
  onProfileUpdate,
}) => {
  return (
    <JurassicTemplate
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

export default JurassicSimpleTemplate;
