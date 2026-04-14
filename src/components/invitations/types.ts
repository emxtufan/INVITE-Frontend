import { Guest, UserProfile } from "../../types";

export interface InvitationData {
  guest: {
    name: string;
    status: string;
    type: string;
  };
  project: {
    selectedTemplate: string;
  };
  profile: UserProfile;
  isPublic?: boolean;
  ownerId?: string;
}

export interface InvitationTemplateProps {
  data: InvitationData;
  onOpenRSVP: () => void;
  introPreview?: boolean;
  scrollContainer?: HTMLElement | null;
}

export type TemplateTag =
  | 'wedding'
  | 'baptism'
  | 'birthday'
  | 'anniversary'
  | 'kids'
  | 'all';

export type TemplateVisibilityStatus = 'live' | 'coming_soon';

export interface TemplateMeta {
  id: string;
  name: string;
  description: string;
  category: 'all' | 'wedding' | 'baptism' | 'anniversary' | 'kids';
  tags?: TemplateTag[];   // a† NOU: poate fi pe mai multe categorii
  visibilityStatus?: TemplateVisibilityStatus;
  colors: string[];
  previewClass: string;
  elementsClass?: string;
  thumbnailUrl?: string;
}

export interface TemplateModule {
  default: React.FC<InvitationTemplateProps>;
  meta: TemplateMeta;
}

