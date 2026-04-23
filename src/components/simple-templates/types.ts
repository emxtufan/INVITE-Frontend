import { UserProfile } from "../../types";

export type SimplePalette = {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  surface: string;
  text: string;
};

export interface SimpleInvitationData {
  guest: {
    name: string;
    status: string;
    type: string;
  };
  project: {
    selectedTemplate: string;
  };
  profile: UserProfile;
}

export interface SimpleTemplateRenderProps {
  data: SimpleInvitationData;
  onOpenRSVP: () => void;
  editMode?: boolean;
  introOnly?: boolean;
  suppressAudioModal?: boolean;
  enableGsapPreview?: boolean;
  scrollContainer?: HTMLElement | null;
  onProfileUpdate?: (patch: Partial<UserProfile>) => void;
}

export interface SimpleTemplateDefinition {
  id: string;
  name: string;
  description: string;
  supportsIntroEditor: boolean;
  showPaletteImagePreview?: boolean;
  palettes: SimplePalette[];
  component: React.FC<SimpleTemplateRenderProps>;
}
