import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Crown,
  Eye,
  ImagePlus,
  Loader2,
  Navigation,
  RotateCcw,
  Save,
  Type,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Button from "./ui/button";
import Input from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { useToast } from "./ui/use-toast";
import { cn } from "../lib/utils";
import {
  GLOBAL_TUTORIAL_VIDEO_CONFIG_ID,
  getTutorialVideoUrlsFromConfig,
  resolveTutorialVideoMedia,
} from "../lib/tutorial-video";
import { UserProfile, UserSession } from "../types";
import { API_URL } from "../config/api";
import {
  SIMPLE_EVENT_TYPES,
  TEMPLATEURI_SAMPLE,
  type SimpleEventType,
} from "./templateuri_sample";
import {
  getSimpleTemplateComponent,
  getSimpleTemplateDefinition,
} from "./simple-templates/registry";
import { TemplateVisibilityStatus } from "./invitations/types";
import {
  applyTemplateBlockImageDefaults,
  buildSimpleTemplateDefaultPatch,
  getSimpleTemplateConfigLookupIds,
  getSimpleTemplateDefaultBlocks,
  getSimpleTemplateDefaultProfile,
} from "./simple-templates/defaults-registry";

interface SimpleInvitationWizardProps {
  session: UserSession;
  selectedTemplate: string;
  onSelectTemplate: (templateId: string) => void;
  onUpdateProfile: (profile: UserProfile) => void | Promise<void>;
  onCheckActive?: () => boolean;
  onNavigateToGuests?: () => void;
}

const STEP_TITLES = [
  "Step 1 - Tip Eveniment",
  "Step 2 - Template + Paleta",
  "Step 3 - Intro",
  "Step 4 - Invitatie",
  "Step 5 - Review + Share",
];

const normalizeSlug = (value: string): string =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

type IntroImageOption = {
  id: string;
  label: string;
  desktop?: string;
  mobile?: string;
  source: "intro-variant" | "theme-image" | "hero-fallback";
};

type SimpleTemplatePreviewPayload = {
  templateId: string;
  templateName: string;
  data: any;
  canUseTemplate: boolean;
  isComingSoon: boolean;
  isLockedByPlan: boolean;
};

const SIMPLE_TEMPLATE_PREVIEW_STORAGE_PREFIX = "simple_template_preview:";
const EDIT_HELP_VIDEO_BY_TEMPLATE: Record<string, string> = {
  __default: "",
};

const WAZE_HELP_STEPS = [
  "Deschide Waze Live Map sau aplicatia Waze.",
  "Cauta locatia dorita in bara de search sau selecteaza direct punctul de pe harta.",
  "Apasa iconita Share din partea de jos dreapta.",
  "Copiaza linkul complet generat de Waze.",
  "Revino in invitatie si lipeste linkul in campul Waze al locatiei.",
];

const WAZE_HELP_SCREENSHOTS = [
  {
    src: "/tutorials/waze/step-1-open-map.png",
    title: "Pasul 1",
    caption: "Deschide Waze Live Map sau aplicatia Waze.",
  },
  {
    src: "/tutorials/waze/step-2-share.png",
    title: "Pasul 2",
    caption: "Apasa butonul Share din coltul din dreapta jos.",
  },
  {
    src: "/tutorials/waze/step-3-copy-link.png",
    title: "Pasul 3",
    caption: "Copiaza linkul si lipeste-l in campul Waze din invitatie.",
  },
];

const humanizeIdLabel = (value: string): string => {
  const raw = String(value || "").trim();
  if (!raw) return "Default";
  return raw
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
};

const HelpScreenshotCard: React.FC<{
  src: string;
  title: string;
  caption: string;
}> = ({ src, title, caption }) => {
  const [failed, setFailed] = useState(false);

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {!failed ? (
        <img
          src={src}
          alt={title}
          className="w-full h-auto max-h-44 object-contain bg-muted sm:h-36 sm:max-h-none sm:object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="min-h-[140px] sm:h-36 bg-muted/40 border-b border-dashed flex items-center justify-center px-4 text-center">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-foreground">{title}</div>
            <div className="text-[11px] text-muted-foreground">
              Adauga imaginea in <code className="font-mono">{src}</code>
            </div>
          </div>
        </div>
      )}
      <div className="p-3 space-y-1">
        <div className="text-xs font-semibold text-foreground">{title}</div>
        <div className="text-[11px] leading-relaxed text-muted-foreground">
          {caption}
        </div>
      </div>
    </div>
  );
};

const normalizeProfile = (profile?: UserProfile): UserProfile => {
  const eventType = ((profile?.eventType as any) || "baptism") as SimpleEventType;
  const partner2Name = eventType === "wedding" ? profile?.partner2Name || "" : "";

  return {
    ...(profile || {}),
    guestEstimate: profile?.guestEstimate ?? 100,
    firstName: profile?.firstName || "",
    lastName: profile?.lastName || "",
    phone: profile?.phone || "",
    email: profile?.email || "",
    inviteSlug: profile?.inviteSlug || "",
    partner1Name: profile?.partner1Name || profile?.eventName || "",
    partner2Name,
    godparents: profile?.godparents || "[]",
    parents: profile?.parents || "{}",
    address: profile?.address || "",
    weddingDate: profile?.weddingDate ? String(profile.weddingDate).slice(0, 10) : "",
    eventType,
    eventTime: profile?.eventTime || "",
    locationName: profile?.locationName || "",
    locationAddress: profile?.locationAddress || "",
    castleIntroWelcome: profile?.castleIntroWelcome || "WELCOME",
    castleIntroSubtitle: profile?.castleIntroSubtitle || "into my little kingdom",
    castleInviteTop: profile?.castleInviteTop || "Cu multa bucurie va anuntam",
    castleInviteMiddle: profile?.castleInviteMiddle || "",
    castleInviteBottom:
      profile?.castleInviteBottom || "va asteptam cu drag la petrecere",
    castleInviteTag: profile?.castleInviteTag || "* deschide portile *",
    colorTheme: profile?.colorTheme || "default",
    introVariant: profile?.introVariant || "",
    showWelcomeText: true,
    showCelebrationText: true,
    showRsvpButton: true,
  };
};

const sanitizeWizardProfilePayload = (
  profile: UserProfile,
): Partial<UserProfile> => {
  const next: Record<string, any> = { ...profile };
  [
    "address",
    "city",
    "county",
    "country",
    "shippingCounty",
    "shippingCity",
    "shippingStreet",
    "shippingNumber",
    "shippingBlock",
    "shippingStaircase",
    "shippingFloor",
    "shippingApartment",
    "shippingPostalCode",
    "shippingLandmark",
    "shippingCountry",
    "billingType",
    "billingName",
    "billingCompany",
    "billingVatCode",
    "billingRegNo",
    "billingEmail",
    "billingPhone",
    "billingAddress",
    "billingCity",
    "billingSector",
    "billingCounty",
    "billingCountry",
    "billingAddressData",
  ].forEach((key) => {
    delete next[key];
  });
  return next as Partial<UserProfile>;
};

const SimpleInvitationWizard: React.FC<SimpleInvitationWizardProps> = ({
  session,
  selectedTemplate,
  onSelectTemplate,
  onUpdateProfile,
  onCheckActive,
  onNavigateToGuests,
}) => {
  const { toast } = useToast();
  type ThemeImageEntry = { desktop?: string; mobile?: string };
  const stepStorageKey = useMemo(
    () => `weddingPro_simple_wizard_step_${session.userId || "anon"}`,
    [session.userId],
  );
  const templateStorageKey = useMemo(
    () => `weddingPro_simple_wizard_template_${session.userId || "anon"}`,
    [session.userId],
  );
  const finalizeStorageKey = useMemo(
    () => `weddingPro_simple_wizard_finalized_${session.userId || "anon"}`,
    [session.userId],
  );
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedStepKeyRef = useRef<string | null>(null);
  const loadedTemplateKeyRef = useRef<string | null>(null);
  const paletteCarouselRef = useRef<HTMLDivElement | null>(null);
  const inlinePreviewScrollRef = useRef<HTMLDivElement | null>(null);
  const isPaletteDraggingRef = useRef(false);
  const paletteDragStartXRef = useRef(0);
  const paletteDragStartScrollRef = useRef(0);
  const paletteDragMovedRef = useRef(false);
  const editChangeWarningShownRef = useRef(false);

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [workingProfile, setWorkingProfile] = useState<UserProfile>(() =>
    normalizeProfile(session.profile),
  );
  const [finalizeModalOpen, setFinalizeModalOpen] = useState(false);
  const [finalizeState, setFinalizeState] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [finalizeMode, setFinalizeMode] = useState<"initial" | "update">("initial");
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [paletteThemeImages, setPaletteThemeImages] = useState<
    Record<string, ThemeImageEntry>
  >({});
  const [paletteFallbackImage, setPaletteFallbackImage] = useState<
    ThemeImageEntry | undefined
  >(undefined);
  const [templateCardPreviewImages, setTemplateCardPreviewImages] = useState<
    Record<string, string>
  >({});
  const [templateDefaultThemeById, setTemplateDefaultThemeById] = useState<
    Record<string, string>
  >({});
  const [templateVisibility, setTemplateVisibility] = useState<
    Record<string, TemplateVisibilityStatus>
  >({});
  const [introImageOptions, setIntroImageOptions] = useState<IntroImageOption[]>(
    [],
  );
  const [introImageOptionsLoading, setIntroImageOptionsLoading] = useState(false);
  const [defaultIntroOptionId, setDefaultIntroOptionId] = useState("");
  const [demoLoadingTemplateId, setDemoLoadingTemplateId] = useState<string | null>(
    null,
  );
  const [inlinePreviewScrollEl, setInlinePreviewScrollEl] =
    useState<HTMLDivElement | null>(null);
  const [hasFinalizedInvite, setHasFinalizedInvite] = useState(false);
  const [hasPendingPublishChanges, setHasPendingPublishChanges] = useState(false);
  const [editHelpOpen, setEditHelpOpen] = useState(false);
  const [globalEditHelpVideoUrl, setGlobalEditHelpVideoUrl] = useState("");
  const editHelpVideo = useMemo(
    () =>
      resolveTutorialVideoMedia(
        EDIT_HELP_VIDEO_BY_TEMPLATE[selectedTemplate || ""] ||
          EDIT_HELP_VIDEO_BY_TEMPLATE.__default ||
          globalEditHelpVideoUrl,
      ),
    [globalEditHelpVideoUrl, selectedTemplate],
  );

  useEffect(() => {
    setWorkingProfile(normalizeProfile(session.profile));
  }, [session.userId]);

  useEffect(() => {
    const savedValue = localStorage.getItem(finalizeStorageKey);
    setHasFinalizedInvite(savedValue === "1");
    setHasPendingPublishChanges(false);
    editChangeWarningShownRef.current = false;
  }, [finalizeStorageKey, session.userId]);

  useEffect(() => {
    let cancelled = false;
    const loadTemplateVisibility = async () => {
      try {
        const res = await fetch(`${API_URL}/config/template-visibility`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setTemplateVisibility(
          (data?.templates || {}) as Record<string, TemplateVisibilityStatus>,
        );
      } catch (error) {
        console.error("Failed to load template visibility", error);
      }
    };
    loadTemplateVisibility();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadGlobalEditHelpVideo = async () => {
      try {
        const res = await fetch(
          `${API_URL}/config/template-defaults/${GLOBAL_TUTORIAL_VIDEO_CONFIG_ID}`,
          {
            headers: session?.token
              ? { Authorization: `Bearer ${session.token}` }
              : undefined,
          },
        );
        if (!res.ok) return;
        const cfg = await res.json().catch(() => null);
        if (cancelled) return;
        const tutorialVideos = getTutorialVideoUrlsFromConfig(cfg);
        setGlobalEditHelpVideoUrl(
          String(tutorialVideos.design || cfg?.videoUrl || "").trim(),
        );
      } catch {
        if (!cancelled) setGlobalEditHelpVideoUrl("");
      }
    };

    loadGlobalEditHelpVideo();
    return () => {
      cancelled = true;
    };
  }, [session?.token]);

  const staticTemplateStatusById = useMemo(
    () =>
      Object.fromEntries(
        TEMPLATEURI_SAMPLE.map((tpl) => [tpl.id, tpl.status || "active"]),
      ) as Record<string, "active" | "coming-soon">,
    [],
  );

  const getTemplateAvailabilityStatus = useCallback(
    (templateId: string): "active" | "coming-soon" => {
      if (templateVisibility[templateId] === "coming_soon") return "coming-soon";
      return staticTemplateStatusById[templateId] || "active";
    },
    [staticTemplateStatusById, templateVisibility],
  );

  useEffect(() => {
    if (loadedStepKeyRef.current === stepStorageKey) return;
    const raw = localStorage.getItem(stepStorageKey);
    const parsed = raw ? Number(raw) : 0;
    if (!Number.isNaN(parsed) && parsed >= 0 && parsed < STEP_TITLES.length) {
      setStep(parsed);
    }
    loadedStepKeyRef.current = stepStorageKey;
  }, [stepStorageKey]);

  useEffect(() => {
    localStorage.setItem(stepStorageKey, String(step));
  }, [step, stepStorageKey]);

  useEffect(() => {
    if (loadedTemplateKeyRef.current === templateStorageKey) return;
    const savedTemplate = localStorage.getItem(templateStorageKey);
    const normalizedPlan = String(session?.plan || "free").toLowerCase();
    const isPaidPlan =
      normalizedPlan === "basic" || normalizedPlan === "premium";
    const preferredTemplate = isPaidPlan ? savedTemplate : "classic";
    if (preferredTemplate && preferredTemplate !== selectedTemplate) {
      onSelectTemplate(preferredTemplate);
    }
    loadedTemplateKeyRef.current = templateStorageKey;
  }, [onSelectTemplate, selectedTemplate, session?.plan, templateStorageKey]);

  useEffect(() => {
    localStorage.setItem(templateStorageKey, selectedTemplate);
  }, [selectedTemplate, templateStorageKey]);

  useEffect(
    () => () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    },
    [],
  );

  const filteredTemplates = useMemo(() => {
    const currentEventType =
      (workingProfile.eventType as SimpleEventType) || "baptism";
    return TEMPLATEURI_SAMPLE.filter((tpl) =>
      tpl.eventTypes.includes(currentEventType) &&
      getTemplateAvailabilityStatus(tpl.id) !== "coming-soon",
    );
  }, [getTemplateAvailabilityStatus, workingProfile.eventType]);

  const templateCards = useMemo(() => {
    const currentEventType =
      (workingProfile.eventType as SimpleEventType) || "baptism";
    return TEMPLATEURI_SAMPLE.filter((tpl) =>
      tpl.eventTypes.includes(currentEventType),
    );
  }, [workingProfile.eventType]);

  const selectedSample = useMemo(
    () => filteredTemplates.find((tpl) => tpl.id === selectedTemplate) || filteredTemplates[0],
    [filteredTemplates, selectedTemplate],
  );

  useEffect(() => {
    if (!selectedSample) return;
    if (selectedTemplate === selectedSample.id) return;
    onSelectTemplate(selectedSample.id);
  }, [onSelectTemplate, selectedSample, selectedTemplate]);

  const selectedDefinition = useMemo(
    () =>
      selectedSample ? getSimpleTemplateDefinition(selectedSample.id) : undefined,
    [selectedSample],
  );
  const selectedPalettes = useMemo(
    () => {
      const palettes = selectedDefinition?.palettes || [];
      if (!selectedSample || palettes.length < 2) return palettes;

      const configuredDefaultTheme = String(
        templateDefaultThemeById[selectedSample.id] || "",
      ).trim();
      if (!configuredDefaultTheme) return palettes;

      const targetIndex = palettes.findIndex(
        (palette) => palette.id === configuredDefaultTheme,
      );
      if (targetIndex <= 0) return palettes;

      const target = palettes[targetIndex];
      return [
        target,
        ...palettes.slice(0, targetIndex),
        ...palettes.slice(targetIndex + 1),
      ];
    },
    [selectedDefinition, selectedSample, templateDefaultThemeById],
  );
  const paletteCarouselItems = useMemo(() => {
    if (selectedPalettes.length <= 1) return selectedPalettes;
    return [...selectedPalettes, ...selectedPalettes];
  }, [selectedPalettes]);
  const showPaletteImagePreview = selectedDefinition?.showPaletteImagePreview !== false;
  const hasIntroEditor = !!selectedDefinition?.supportsIntroEditor;
  const editHelpStep = hasIntroEditor ? 2 : 3;
  const editHelpIsIntroStep = hasIntroEditor && step === 2;
  const isGirlIntroTemplate = selectedTemplate === "castle-magic-girl-simple";
  const isLordIntroTemplate = selectedTemplate === "lord-effects-simple";
  const isJurassicIntroTemplate = selectedTemplate === "jurassic-park-simple";
  const isLuxuryIntroTemplate = selectedTemplate === "luxury-style-simple";
  const isCastleIntroTemplate =
    isGirlIntroTemplate || isLordIntroTemplate;
  const usesGuidedIntroInputs =
    isCastleIntroTemplate || isJurassicIntroTemplate || isLuxuryIntroTemplate;
  const normalizeBrokenIntroOverlay = (value: string | undefined) => {
    const raw = String(value || "").trim();
    if (!raw) return "";
    if (
      /cu bucurie/i.test(raw) &&
      /(vA|AÆ|fiE|noastrA|â€|Ã)/.test(raw)
    ) {
      return "Cu bucurie va invitam sa fiti parte din povestea noastra.";
    }
    return raw;
  };
  const normalizedLuxuryOverlayText = normalizeBrokenIntroOverlay(
    workingProfile.jungleOverlayText as string,
  );
  const jurassicIntroProfileDefaults = useMemo(
    () => getSimpleTemplateDefaultProfile("jurassic-park-simple"),
    [],
  );
  const luxuryIntroProfileDefaults = useMemo(
    () => getSimpleTemplateDefaultProfile("luxury-style-simple"),
    [],
  );
  const castleIntroProfileDefaults = useMemo(
    () =>
      getSimpleTemplateDefaultProfile(
        isLordIntroTemplate
          ? "lord-effects-simple"
          : "castle-magic-girl-simple",
      ),
    [isLordIntroTemplate],
  );
  const guidedIntroDefaults = useMemo(() => {
    const dateFallback = workingProfile.weddingDate
      ? new Date(workingProfile.weddingDate).toLocaleDateString("ro-RO", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "Data Evenimentului";
    if (isLuxuryIntroTemplate) {
      return {
        welcome: "",
        subtitle:
          (workingProfile.jungleHeaderText as string) ||
          (luxuryIntroProfileDefaults as any).jungleHeaderText ||
          "Save The Date",
        top:
          normalizedLuxuryOverlayText ||
          (luxuryIntroProfileDefaults as any).jungleOverlayText ||
          "Cu bucurie va invitam sa fiti parte din povestea noastra.",
        middle:
          (workingProfile.jungleFooterText as string) ||
          (luxuryIntroProfileDefaults as any).jungleFooterText ||
          dateFallback,
        bottom: "",
        tag: "",
      };
    }
    if (isJurassicIntroTemplate) {
      return {
        welcome: "",
        subtitle:
          jurassicIntroProfileDefaults.castleIntroSubtitle || "va invita in jungla",
        top:
          jurassicIntroProfileDefaults.castleInviteTop ||
          "Cu multa bucurie va anuntam",
        middle: dateFallback,
        bottom: jurassicIntroProfileDefaults.castleInviteBottom || "va fi botezat",
        tag: jurassicIntroProfileDefaults.castleInviteTag || "* deschide portile *",
      };
    }
    const sourceDefaults = castleIntroProfileDefaults as Record<string, any>;
    return {
      welcome: sourceDefaults.castleIntroWelcome || "WELCOME",
      subtitle: sourceDefaults.castleIntroSubtitle || "into my little kingdom",
      top: sourceDefaults.castleInviteTop || "Cu inimile pline de bucurie",
      middle: dateFallback,
      bottom:
        sourceDefaults.castleInviteBottom ||
        "va anuntam ca va primi Taina Botezului.",
      tag: sourceDefaults.castleInviteTag || "* deschide portile *",
    };
  }, [
    workingProfile.weddingDate,
    workingProfile.jungleHeaderText,
    normalizedLuxuryOverlayText,
    workingProfile.jungleFooterText,
    isLuxuryIntroTemplate,
    isJurassicIntroTemplate,
    jurassicIntroProfileDefaults,
    castleIntroProfileDefaults,
    luxuryIntroProfileDefaults,
  ]);
  const [castleIntroFields, setCastleIntroFields] = useState(() => ({
    welcome:
      (workingProfile.castleIntroWelcome as string) ||
      guidedIntroDefaults.welcome ||
      "WELCOME",
    subtitle:
      (workingProfile.castleIntroSubtitle as string) ||
      guidedIntroDefaults.subtitle ||
      "into my little kingdom",
    top:
      (workingProfile.castleInviteTop as string) ||
      guidedIntroDefaults.top ||
      "Cu inimile pline de bucurie",
    middle:
      (workingProfile.castleInviteMiddle as string) ||
      (workingProfile.weddingDate
        ? new Date(workingProfile.weddingDate).toLocaleDateString("ro-RO", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "Data Evenimentului"),
    bottom:
      (workingProfile.castleInviteBottom as string) ||
      guidedIntroDefaults.bottom ||
      "va anuntam ca va primi Taina Botezului.",
    tag:
      (workingProfile.castleInviteTag as string) ||
      guidedIntroDefaults.tag ||
      "* deschide portile *",
  }));
  useEffect(() => {
    if (!usesGuidedIntroInputs) return;
    setCastleIntroFields({
      welcome:
        (workingProfile.castleIntroWelcome as string) ||
        guidedIntroDefaults.welcome ||
        "WELCOME",
      subtitle:
        (workingProfile.castleIntroSubtitle as string) ||
        guidedIntroDefaults.subtitle ||
        "into my little kingdom",
      top:
        (workingProfile.castleInviteTop as string) ||
        guidedIntroDefaults.top ||
        "Cu inimile pline de bucurie",
      middle:
        (workingProfile.castleInviteMiddle as string) ||
        (workingProfile.weddingDate
          ? new Date(workingProfile.weddingDate).toLocaleDateString("ro-RO", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "Data Evenimentului"),
      bottom:
        (workingProfile.castleInviteBottom as string) ||
        guidedIntroDefaults.bottom ||
        "va anuntam ca va primi Taina Botezului.",
      tag:
        (workingProfile.castleInviteTag as string) ||
        guidedIntroDefaults.tag ||
        "* deschide portile *",
    });
  }, [usesGuidedIntroInputs, selectedTemplate, session.userId, guidedIntroDefaults, workingProfile.castleIntroWelcome, workingProfile.castleIntroSubtitle, workingProfile.castleInviteTop, workingProfile.castleInviteMiddle, workingProfile.castleInviteBottom, workingProfile.castleInviteTag, workingProfile.weddingDate]);
  const [luxuryIntroFields, setLuxuryIntroFields] = useState(() => ({
    header:
      (workingProfile.jungleHeaderText as string) ||
      guidedIntroDefaults.subtitle ||
      "Save The Date",
    text:
      normalizedLuxuryOverlayText ||
      guidedIntroDefaults.top ||
      "Cu bucurie va invitam sa fiti parte din povestea noastra.",
    footer:
      (workingProfile.jungleFooterText as string) ||
      guidedIntroDefaults.middle ||
      (workingProfile.weddingDate
        ? new Date(workingProfile.weddingDate).toLocaleDateString("ro-RO", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "Data Evenimentului"),
  }));
  useEffect(() => {
    if (!isLuxuryIntroTemplate) return;
    setLuxuryIntroFields({
      header:
        (workingProfile.jungleHeaderText as string) ||
        guidedIntroDefaults.subtitle ||
        "Save The Date",
      text:
        normalizedLuxuryOverlayText ||
        guidedIntroDefaults.top ||
        "Cu bucurie va invitam sa fiti parte din povestea noastra.",
      footer:
        (workingProfile.jungleFooterText as string) ||
        guidedIntroDefaults.middle ||
        (workingProfile.weddingDate
          ? new Date(workingProfile.weddingDate).toLocaleDateString("ro-RO", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "Data Evenimentului"),
    });
  }, [
    isLuxuryIntroTemplate,
    selectedTemplate,
    session.userId,
    guidedIntroDefaults.subtitle,
    guidedIntroDefaults.top,
    guidedIntroDefaults.middle,
    workingProfile.jungleHeaderText,
    normalizedLuxuryOverlayText,
    workingProfile.jungleFooterText,
    workingProfile.weddingDate,
  ]);
  const canShowPaletteThumbs = hasIntroEditor && showPaletteImagePreview;
  const templateComponent = useMemo(
    () =>
      selectedSample ? getSimpleTemplateComponent(selectedSample.id) : null,
    [selectedSample],
  ) as any;

  const getTemplateConfigCandidates = (templateId: string): string[] => {
    const normalized = String(templateId || "").trim();
    if (!normalized) return [];
    const lookupIds = getSimpleTemplateConfigLookupIds(normalized);
    return Array.from(
      new Set([normalized, ...lookupIds, normalized.replace(/-simple$/i, "")]),
    ).filter(Boolean);
  };

  const getPreviewImageFromConfig = (cfg: any): string | undefined => {
    if (!cfg || typeof cfg !== "object") return undefined;

    const coverDirect =
      cfg?.templateCardCover ||
      cfg?.templateCoverImage ||
      cfg?.cardCoverImage;
    if (typeof coverDirect === "string" && coverDirect.trim()) {
      return coverDirect;
    }

    const introVariants = cfg?.introVariants || {};
    for (const iv of Object.values(introVariants) as Array<any>) {
      if (iv?.desktop) return iv.desktop as string;
      if (iv?.mobile) return iv.mobile as string;
    }

    const themeImages = cfg?.themeImages || {};
    const preferredTheme = String(cfg?.colorTheme || "default");
    const preferred = themeImages?.[preferredTheme];
    if (preferred?.desktop) return preferred.desktop as string;
    if (preferred?.mobile) return preferred.mobile as string;

    const fallbackTheme = themeImages?.default;
    if (fallbackTheme?.desktop) return fallbackTheme.desktop as string;
    if (fallbackTheme?.mobile) return fallbackTheme.mobile as string;

    for (const entry of Object.values(themeImages) as Array<any>) {
      if (entry?.desktop) return entry.desktop as string;
      if (entry?.mobile) return entry.mobile as string;
    }

    if (cfg?.heroBgImage) return cfg.heroBgImage as string;
    if (cfg?.heroBgImageMobile) return cfg.heroBgImageMobile as string;
    return undefined;
  };

  const getIntroImageOptionsFromConfig = (
    cfg: any,
  ): { options: IntroImageOption[]; defaultOptionId: string } => {
    if (!cfg || typeof cfg !== "object") {
      return { options: [], defaultOptionId: "" };
    }

    const options: IntroImageOption[] = [];
    const introVariants = cfg?.introVariants || {};
    const defaultIntroVariantId = String(cfg?.defaultIntroVariant || "").trim();

    Object.entries(introVariants).forEach(([variantId, value]) => {
      const item = value as { label?: string; desktop?: string; mobile?: string };
      if (!item?.desktop && !item?.mobile) return;
      options.push({
        id: String(variantId),
        label: String(item?.label || humanizeIdLabel(variantId)),
        desktop: item?.desktop,
        mobile: item?.mobile,
        source: "intro-variant",
      });
    });

    if (options.length > 0) {
      const validDefault = options.some((opt) => opt.id === defaultIntroVariantId)
        ? defaultIntroVariantId
        : options[0].id;
      return { options, defaultOptionId: validDefault };
    }

    const themeImages = cfg?.themeImages || {};
    Object.entries(themeImages).forEach(([themeId, value]) => {
      const item = value as { desktop?: string; mobile?: string };
      if (!item?.desktop && !item?.mobile) return;
      options.push({
        id: `theme:${themeId}`,
        label:
          String(themeId).toLowerCase() === "default"
            ? "Tema Default"
            : `Tema ${humanizeIdLabel(themeId)}`,
        desktop: item?.desktop,
        mobile: item?.mobile,
        source: "theme-image",
      });
    });

    if (options.length > 0) {
      const defaultThemeId = String(cfg?.colorTheme || "default");
      const preferredId = `theme:${defaultThemeId}`;
      const validDefault = options.some((opt) => opt.id === preferredId)
        ? preferredId
        : options[0].id;
      return { options, defaultOptionId: validDefault };
    }

    if (cfg?.heroBgImage || cfg?.heroBgImageMobile) {
      return {
        options: [
          {
            id: "hero:fallback",
            label: "Imagine Intro",
            desktop: cfg?.heroBgImage,
            mobile: cfg?.heroBgImageMobile,
            source: "hero-fallback",
          },
        ],
        defaultOptionId: "hero:fallback",
      };
    }

    return { options: [], defaultOptionId: "" };
  };

  useEffect(() => {
    let cancelled = false;

    const loadIntroImageOptions = async () => {
      if (!selectedSample || !hasIntroEditor) {
        if (!cancelled) {
          setIntroImageOptions([]);
          setDefaultIntroOptionId("");
          setIntroImageOptionsLoading(false);
        }
        return;
      }

      setIntroImageOptionsLoading(true);
      const token = session?.token;
      const candidateIds = getTemplateConfigCandidates(selectedSample.id);
      let bestCfg: any = null;

      for (const templateId of candidateIds) {
        try {
          const res = await fetch(`${API_URL}/config/template-defaults/${templateId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          });
          if (!res.ok) continue;
          const cfg = await res.json();
          if (!bestCfg) bestCfg = cfg;
          const parsed = getIntroImageOptionsFromConfig(cfg);
          if (parsed.options.length > 0) {
            bestCfg = cfg;
            break;
          }
        } catch {
          // continue with other aliases
        }
      }

      if (cancelled) return;
      const parsed = getIntroImageOptionsFromConfig(bestCfg);
      setIntroImageOptions(parsed.options);
      setDefaultIntroOptionId(parsed.defaultOptionId);
      setIntroImageOptionsLoading(false);
    };

    loadIntroImageOptions();
    return () => {
      cancelled = true;
    };
  }, [selectedSample, hasIntroEditor, session?.token]);

  useEffect(() => {
    let cancelled = false;

    const loadTemplateCardPreviews = async () => {
      if (!templateCards.length) {
        if (!cancelled) setTemplateCardPreviewImages({});
        return;
      }

      const token = session?.token;
      const entries = await Promise.all(
        templateCards.map(async (tpl) => {
          const candidateIds = getTemplateConfigCandidates(tpl.id);
          for (const templateId of candidateIds) {
            try {
              const res = await fetch(`${API_URL}/config/template-defaults/${templateId}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
              });
              if (!res.ok) continue;
              const cfg = await res.json();
              const preview = getPreviewImageFromConfig(cfg);
              const defaultThemeId =
                typeof cfg?.colorTheme === "string" ? cfg.colorTheme : "";
              if (preview || defaultThemeId) {
                return {
                  templateId: tpl.id,
                  preview,
                  defaultThemeId,
                };
              }
            } catch {
              // continue with fallback id
            }
          }
          return {
            templateId: tpl.id,
            preview: "",
            defaultThemeId: "",
          };
        }),
      );

      if (cancelled) return;
      const previewMap = Object.fromEntries(
        entries
          .filter((entry) => Boolean(entry.preview))
          .map((entry) => [entry.templateId, entry.preview]),
      ) as Record<string, string>;
      const defaultThemeMap = Object.fromEntries(
        entries
          .filter((entry) => Boolean(entry.defaultThemeId))
          .map((entry) => [entry.templateId, entry.defaultThemeId]),
      ) as Record<string, string>;

      setTemplateCardPreviewImages(previewMap);
      setTemplateDefaultThemeById(defaultThemeMap);
    };

    loadTemplateCardPreviews();
    return () => {
      cancelled = true;
    };
  }, [templateCards, session?.token]);

  useEffect(() => {
    let cancelled = false;

    const loadPaletteImages = async () => {
      if (!selectedSample) {
        if (!cancelled) {
          setPaletteThemeImages({});
          setPaletteFallbackImage(undefined);
        }
        return;
      }
      if (!canShowPaletteThumbs) {
        if (!cancelled) {
          setPaletteThemeImages({});
          setPaletteFallbackImage(undefined);
        }
        return;
      }
      const token = session?.token;
      const candidateIds = getTemplateConfigCandidates(selectedSample.id);

      for (const templateId of candidateIds) {
        try {
          const res = await fetch(`${API_URL}/config/template-defaults/${templateId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          });
          if (!res.ok) continue;
          const cfg = await res.json();
          const themeImages = (cfg?.themeImages || {}) as Record<string, ThemeImageEntry>;
          const hasThemeThumbs = Object.values(themeImages).some(
            (img) => !!img?.desktop || !!img?.mobile,
          );
          const hasFallback = !!cfg?.heroBgImage || !!cfg?.heroBgImageMobile;

          if (hasThemeThumbs || hasFallback) {
            if (cancelled) return;
            setPaletteThemeImages(themeImages);
            setPaletteFallbackImage({
              desktop: cfg?.heroBgImage,
              mobile: cfg?.heroBgImageMobile,
            });
            return;
          }
        } catch {
          // continue with fallback template id
        }
      }

      if (!cancelled) {
        setPaletteThemeImages({});
        setPaletteFallbackImage(undefined);
      }
    };

    loadPaletteImages();
    return () => {
      cancelled = true;
    };
  }, [selectedSample, session?.token, canShowPaletteThumbs]);

  useEffect(() => {
    const container = paletteCarouselRef.current;
    if (!container || selectedPalettes.length < 2 || step !== 3) return;

    let rafId = 0;
    let last = performance.now();
    let paused = false;
    const speed = 34;

    const tick = (now: number) => {
      const delta = (now - last) / 1000;
      last = now;
      if (!paused) {
        container.scrollLeft += speed * delta;
        const loopPoint = container.scrollWidth / 2;
        if (container.scrollLeft >= loopPoint) {
          container.scrollLeft -= loopPoint;
        }
      }
      rafId = requestAnimationFrame(tick);
    };

    const pause = () => {
      paused = true;
    };
    const resume = () => {
      if (isPaletteDraggingRef.current) return;
      paused = false;
    };

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) return;
      isPaletteDraggingRef.current = true;
      paletteDragMovedRef.current = false;
      paletteDragStartXRef.current = event.clientX;
      paletteDragStartScrollRef.current = container.scrollLeft;
      paused = true;
      event.preventDefault();
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isPaletteDraggingRef.current) return;
      const deltaX = event.clientX - paletteDragStartXRef.current;
      if (Math.abs(deltaX) > 4) {
        paletteDragMovedRef.current = true;
      }
      container.scrollLeft = paletteDragStartScrollRef.current - deltaX;
      const loopPoint = container.scrollWidth / 2;
      if (loopPoint > 0) {
        while (container.scrollLeft >= loopPoint) {
          container.scrollLeft -= loopPoint;
          paletteDragStartScrollRef.current -= loopPoint;
        }
        while (container.scrollLeft < 0) {
          container.scrollLeft += loopPoint;
          paletteDragStartScrollRef.current += loopPoint;
        }
      }
      event.preventDefault();
    };

    const handleDragEnd = () => {
      if (!isPaletteDraggingRef.current) return;
      isPaletteDraggingRef.current = false;
    };

    const handleClickCapture = (event: MouseEvent) => {
      if (!paletteDragMovedRef.current) return;
      event.preventDefault();
      event.stopPropagation();
      paletteDragMovedRef.current = false;
    };

    container.scrollLeft = 0;
    container.addEventListener("mouseenter", pause);
    container.addEventListener("mouseleave", resume);
    container.addEventListener("touchstart", pause, { passive: true });
    container.addEventListener("touchend", resume);
    container.addEventListener("touchcancel", resume);
    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleDragEnd);
    container.addEventListener("click", handleClickCapture, true);

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      container.removeEventListener("mouseenter", pause);
      container.removeEventListener("mouseleave", resume);
      container.removeEventListener("touchstart", pause);
      container.removeEventListener("touchend", resume);
      container.removeEventListener("touchcancel", resume);
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleDragEnd);
      container.removeEventListener("click", handleClickCapture, true);
      isPaletteDraggingRef.current = false;
      paletteDragMovedRef.current = false;
    };
  }, [selectedPalettes.length, step]);

  const progress = Math.round(((step + 1) / STEP_TITLES.length) * 100);
  const stepsRemaining = Math.max(0, STEP_TITLES.length - (step + 1));
  const finalActionLabel = !hasFinalizedInvite
    ? "Finalizeaza"
    : hasPendingPublishChanges
      ? "Salveaza modificarile"
      : "Invitatia este salvata";
  const isWeddingEvent =
    String(workingProfile.eventType || "").toLowerCase() === "wedding";
  const normalizedPlan = String(session?.plan || "free").toLowerCase();
  const isUpgradedPlan =
    normalizedPlan === "basic" || normalizedPlan === "premium";
  const hasSelectedTemplate = !!selectedSample?.id;
  const publicInviteLink = useMemo(() => {
    const slug = normalizeSlug(workingProfile.inviteSlug || "");
    if (!slug) return "";
    if (typeof window === "undefined") return `/events/${slug}/public`;
    return `${window.location.origin}/events/${slug}/public`;
  }, [workingProfile.inviteSlug]);
  const markDraftChanged = useCallback(() => {
    if (!hasFinalizedInvite) return;
    setHasPendingPublishChanges(true);
    if (editChangeWarningShownRef.current) return;
    editChangeWarningShownRef.current = true;
    toast({
      title: "Editezi invitatia curenta",
      description:
        "Modificarile raman in draft pana apesi Salveaza modificarile, apoi vor afecta invitatia publica existenta.",
      variant: "warning",
    });
  }, [hasFinalizedInvite, toast]);
  const scheduleSync = (nextProfile: UserProfile) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      onUpdateProfile(nextProfile);
      saveTimerRef.current = null;
    }, 280);
  };

  const cancelPendingSync = () => {
    if (!saveTimerRef.current) return;
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = null;
  };

  const patchProfile = (
    patch: Partial<UserProfile>,
    immediate = false,
    options?: { markDirty?: boolean },
  ) => {
    if (options?.markDirty !== false) {
      markDraftChanged();
    }
    setWorkingProfile((prev) => {
      const next = { ...prev, ...patch };
      if (immediate) {
        cancelPendingSync();
        onUpdateProfile(next);
      }
      else scheduleSync(next);
      return next;
    });
  };

  useEffect(() => {
    if (step !== editHelpStep) return;
    setEditHelpOpen(true);
  }, [editHelpStep, step]);

  useEffect(() => {
    const raw = String(workingProfile.jungleOverlayText || "").trim();
    if (!raw) return;
    const normalized = normalizeBrokenIntroOverlay(raw);
    if (raw === normalized) return;
    patchProfile({ jungleOverlayText: normalized }, true, { markDirty: false });
  }, [workingProfile.jungleOverlayText]);

  useEffect(() => {
    const currentEventType = String(workingProfile.eventType || "").toLowerCase();
    if (currentEventType !== "wedding" && workingProfile.partner2Name) {
      patchProfile({ partner2Name: "" }, false, { markDirty: false });
    }
  }, [workingProfile.eventType, workingProfile.partner2Name]);

  const selectedIntroImageOptionId = useMemo(() => {
    if (!introImageOptions.length) return "";

    const profileIntroVariant = String(workingProfile.introVariant || "").trim();
    if (
      profileIntroVariant &&
      introImageOptions.some((opt) => opt.id === profileIntroVariant)
    ) {
      return profileIntroVariant;
    }

    const profileThemeId = `theme:${String(workingProfile.colorTheme || "default")}`;
    if (introImageOptions.some((opt) => opt.id === profileThemeId)) {
      return profileThemeId;
    }

    if (
      defaultIntroOptionId &&
      introImageOptions.some((opt) => opt.id === defaultIntroOptionId)
    ) {
      return defaultIntroOptionId;
    }

    return introImageOptions[0]?.id || "";
  }, [
    defaultIntroOptionId,
    introImageOptions,
    workingProfile.colorTheme,
    workingProfile.introVariant,
  ]);

  const handleSelectIntroImageOption = (option: IntroImageOption) => {
    if (option.source === "theme-image") {
      const themeId = option.id.replace(/^theme:/, "") || "default";
      patchProfile(
        {
          colorTheme: themeId,
          introVariant: "",
        },
        true,
      );
      return;
    }

    if (option.source === "intro-variant") {
      patchProfile({ introVariant: option.id }, true);
      return;
    }

    patchProfile({ introVariant: "" }, true);
  };

  const persistNow = async (
    showToast = false,
    options?: {
      commitToServer?: boolean;
      successTitle?: string;
      successDescription?: string;
      errorDescription?: string;
    },
  ) => {
    if (onCheckActive && !onCheckActive()) return false;
    try {
      setSaving(true);
      cancelPendingSync();
      const profileToSave = {
        ...workingProfile,
        inviteSlug: normalizeSlug(workingProfile.inviteSlug || ""),
      };
      await Promise.resolve(onUpdateProfile(profileToSave));
      if (options?.commitToServer && session?.token) {
        const profilePayload = sanitizeWizardProfilePayload(profileToSave);
        const res = await fetch(`${API_URL}/profile`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.token}`,
          },
          body: JSON.stringify({ profile: profilePayload }),
        });
        if (!res.ok) {
          let message = "Nu am putut salva profilul in baza de date.";
          try {
            const data = await res.json();
            message = data?.message || data?.error || message;
          } catch {}
          throw new Error(message);
        }
      }
      if (showToast) {
        toast({
          title: options?.successTitle || "Salvat",
          description:
            options?.successDescription ||
            (options?.commitToServer
              ? "Modificarile au fost salvate."
              : "Draftul a fost actualizat local."),
          variant: "success",
        });
      }
      return true;
    } catch (error) {
      console.error(error);
      toast({
        title: "Eroare",
        description:
          options?.errorDescription || "Nu am putut salva modificarile.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const copyPublicLink = async () => {
    if (!publicInviteLink) return;
    try {
      await navigator.clipboard.writeText(publicInviteLink);
      toast({
        title: "Link copiat",
        description: "Link-ul public a fost copiat in clipboard.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Copiere nereusita",
        description: "Copiaza manual link-ul din camp.",
        variant: "warning",
      });
    }
  };

  const hasNonEmptyDemoPayload = (cfg: any): boolean => {
    if (!cfg || typeof cfg !== "object") return false;

    const hasProfile =
      cfg.demoProfile &&
      typeof cfg.demoProfile === "object" &&
      Object.keys(cfg.demoProfile).length > 0;
    const hasGuest =
      (typeof cfg.demoGuest === "string" && cfg.demoGuest.trim().length > 0) ||
      (cfg.demoGuest &&
        typeof cfg.demoGuest === "object" &&
        Object.keys(cfg.demoGuest).length > 0);
    const hasCustomSections =
      cfg.demoCustomSections !== undefined && cfg.demoCustomSections !== null;

    return Boolean(hasProfile || hasGuest || hasCustomSections);
  };

  const hasAnyDemoKeys = (cfg: any): boolean => {
    if (!cfg || typeof cfg !== "object") return false;
    return (
      Object.prototype.hasOwnProperty.call(cfg, "demoProfile") ||
      Object.prototype.hasOwnProperty.call(cfg, "demoCustomSections") ||
      Object.prototype.hasOwnProperty.call(cfg, "demoGuest")
    );
  };

  const fetchTemplateDefaultsConfig = async (
    templateId: string,
    options?: { preferDemo?: boolean },
  ) => {
    const preferDemo = !!options?.preferDemo;
    const lookupIds = getSimpleTemplateConfigLookupIds(templateId);
    let firstConfig: any = null;
    let firstWithDemoKeys: any = null;
    let firstWithNonEmptyDemo: any = null;

    const fetchConfigForId = async (configId: string): Promise<any | null> => {
      const encodedId = encodeURIComponent(configId);
      const headers = session?.token
        ? { Authorization: `Bearer ${session.token}` }
        : undefined;

      // For demo payload we prefer admin endpoint first (it may expose extra demo fields).
      const endpoints = preferDemo
        ? [
            `${API_URL}/admin/config/template-defaults/${encodedId}`,
            `${API_URL}/config/template-defaults/${encodedId}`,
          ]
        : [`${API_URL}/config/template-defaults/${encodedId}`];

      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint, {
            headers,
            cache: preferDemo ? "no-store" : "default",
          });
          if (!res.ok) continue;
          const cfg = await res.json().catch(() => null);
          if (cfg && typeof cfg === "object") return cfg;
        } catch {
          // continue with next endpoint/alias
        }
      }
      return null;
    };

    for (const configId of lookupIds) {
      const cfg = await fetchConfigForId(configId);
      if (!cfg) continue;

      if (!firstConfig) firstConfig = cfg;

      if (preferDemo) {
        if (!firstWithDemoKeys && hasAnyDemoKeys(cfg)) {
          firstWithDemoKeys = cfg;
        }
        if (!firstWithNonEmptyDemo && hasNonEmptyDemoPayload(cfg)) {
          firstWithNonEmptyDemo = cfg;
        }
        continue;
      }

      return cfg;
    }

    if (preferDemo) {
      return firstWithNonEmptyDemo || firstWithDemoKeys || firstConfig || null;
    }

    return firstConfig || null;
  };

  const safeParseJson = (value: unknown): any => {
    if (typeof value !== "string") return value;
    const raw = value.trim();
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const normalizeDemoSections = (value: unknown): any[] | null => {
    const parsed = safeParseJson(value);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === "object") {
      const maybeBlocks = (parsed as any).blocks;
      if (Array.isArray(maybeBlocks)) return maybeBlocks;
      const maybeCustomSections = safeParseJson((parsed as any).customSections);
      if (Array.isArray(maybeCustomSections)) return maybeCustomSections;
    }
    return null;
  };

  const sanitizeDemoBlocks = (blocks: any[]): any[] =>
    blocks.map((block) => {
      if (!block || typeof block !== "object") return block;
      if (block.type === "music") {
        return {
          ...block,
          musicUrl: "",
          musicType: "none",
        };
      }
      return block;
    });

  const buildTemplateDemoData = async (templateId: string) => {
    const sample = TEMPLATEURI_SAMPLE.find((tpl) => tpl.id === templateId);
    const definition = getSimpleTemplateDefinition(templateId);
    const templateConfig = await fetchTemplateDefaultsConfig(templateId, {
      preferDemo: true,
    });
    const defaultProfile = getSimpleTemplateDefaultProfile(templateId) as Partial<UserProfile>;
    const demoProfileRaw = templateConfig?.demoProfile;
    const demoProfile =
      demoProfileRaw && typeof demoProfileRaw === "object"
        ? (demoProfileRaw as Partial<UserProfile>)
        : {};
    const defaultEventType = (sample?.eventTypes?.[0] ||
      workingProfile.eventType ||
      "baptism") as SimpleEventType;
    const demoEventType = (demoProfile.eventType ||
      defaultEventType) as SimpleEventType;
    const paletteIds = new Set((definition?.palettes || []).map((p) => p.id));
    const isAllowedTheme = (themeId: string) =>
      !!themeId && (paletteIds.size === 0 || paletteIds.has(themeId));
    const demoThemeRaw = String(demoProfile.colorTheme || "").trim();
    const configThemeRaw = String(templateConfig?.colorTheme || "").trim();
    const defaultProfileThemeRaw = String(defaultProfile.colorTheme || "").trim();
    const demoTheme = isAllowedTheme(demoThemeRaw) ? demoThemeRaw : "";
    const configTheme = isAllowedTheme(configThemeRaw) ? configThemeRaw : "";
    const defaultProfileTheme = isAllowedTheme(defaultProfileThemeRaw)
      ? defaultProfileThemeRaw
      : "";
    const resolvedTheme =
      // If demo keeps "default", allow admin-configured default theme to win.
      (demoTheme && demoTheme !== "default" ? demoTheme : "") ||
      configTheme ||
      demoTheme ||
      defaultProfileTheme ||
      "default";

    const defaultBlocks = getSimpleTemplateDefaultBlocks(templateId, demoEventType);
    const blocksWithConfigImages = applyTemplateBlockImageDefaults(
      defaultBlocks,
      templateConfig,
      resolvedTheme,
      templateId,
    );
    const demoCustomSectionsRaw =
      templateConfig?.demoCustomSections ?? demoProfile.customSections;
    const parsedDemoCustomSections = normalizeDemoSections(demoCustomSectionsRaw);
    const rawBlocks =
      parsedDemoCustomSections !== null
        ? parsedDemoCustomSections
        : blocksWithConfigImages;
    const sanitizedBlocks = sanitizeDemoBlocks(rawBlocks);

    const baseProfile = normalizeProfile({
      ...workingProfile,
      ...defaultProfile,
      ...demoProfile,
      eventType: demoEventType,
      colorTheme: resolvedTheme,
      introVariant:
        String(
          demoProfile.introVariant ||
            templateConfig?.defaultIntroVariant ||
            workingProfile.introVariant ||
            "",
        ) || "",
      inviteSlug:
        normalizeSlug(
          String(
            demoProfile.inviteSlug ||
              defaultProfile.inviteSlug ||
              `demo-${templateId}`,
          ),
        ) || `demo-${templateId}`,
      customSections: JSON.stringify(sanitizedBlocks),
      showRsvpButton: true,
      isSetupComplete: true,
    } as UserProfile);

    // Demo-only behavior:
    // keep intro door images from template config, but allow admin demo hero images
    // to drive the in-invitation hero media area.
    const demoHeroDesktop = String((demoProfile as any)?.heroBgImage || "").trim();
    const demoHeroMobile = String((demoProfile as any)?.heroBgImageMobile || "").trim();
    if (demoHeroDesktop) {
      (baseProfile as any).heroContentImage = demoHeroDesktop;
    }
    if (demoHeroMobile) {
      (baseProfile as any).heroContentImageMobile = demoHeroMobile;
    }

    const isWedding = String(baseProfile.eventType || "").toLowerCase() === "wedding";
    if (!String(baseProfile.partner1Name || "").trim()) {
      baseProfile.partner1Name = isWedding ? "Alex" : "Emma";
    }
    if (isWedding) {
      if (!String(baseProfile.partner2Name || "").trim()) {
        baseProfile.partner2Name = "Sofia";
      }
    } else {
      baseProfile.partner2Name = "";
    }
    if (!String(baseProfile.weddingDate || "").trim()) {
      baseProfile.weddingDate = "2027-06-20";
    }
    if (!String(baseProfile.eventTime || "").trim()) {
      baseProfile.eventTime = "18:00";
    }
    if (!String(baseProfile.locationName || "").trim()) {
      baseProfile.locationName = "Locatie Demo";
    }
    if (!String(baseProfile.locationAddress || "").trim()) {
      baseProfile.locationAddress = "Strada Exemplu nr. 1";
    }

    const demoGuestRaw = templateConfig?.demoGuest;
    const guestName =
      (typeof demoGuestRaw === "string" && demoGuestRaw.trim()) ||
      (demoGuestRaw &&
      typeof demoGuestRaw === "object" &&
      typeof demoGuestRaw.name === "string"
        ? demoGuestRaw.name
        : "") ||
      "Draga invitat";

    return {
      guest: {
        name: guestName,
        status:
          demoGuestRaw &&
          typeof demoGuestRaw === "object" &&
          typeof demoGuestRaw.status === "string"
            ? demoGuestRaw.status
            : "pending",
        type:
          demoGuestRaw &&
          typeof demoGuestRaw === "object" &&
          typeof demoGuestRaw.type === "string"
            ? demoGuestRaw.type
            : "adult",
      },
      project: {
        selectedTemplate: templateId,
        isTemplateDemo: true,
      },
      profile: baseProfile,
      isPublic: true,
    };
  };

  const openTemplateDemo = async (templateId: string) => {
    try {
      setDemoLoadingTemplateId(templateId);
      const data = await buildTemplateDemoData(templateId);
      const availability = getTemplateAvailabilityStatus(templateId);
      const isComingSoon = availability === "coming-soon";
      const isClassicTemplate = templateId === "classic";
      const isLockedByPlan = !isUpgradedPlan && !isClassicTemplate;
      const canUseTemplate = !isComingSoon && !isLockedByPlan;
      const templateName =
        getSimpleTemplateDefinition(templateId)?.name || templateId;
      const previewPayload: SimpleTemplatePreviewPayload = {
        templateId,
        templateName,
        data,
        canUseTemplate,
        isComingSoon,
        isLockedByPlan,
      };
      const previewKey = `${SIMPLE_TEMPLATE_PREVIEW_STORAGE_PREFIX}${session.userId || "anon"}:${Date.now()}:${templateId}`;
      localStorage.setItem(previewKey, JSON.stringify(previewPayload));
      const url = `/simple-template-preview?previewKey=${encodeURIComponent(previewKey)}`;
      const opened = window.open(url, "_blank");
      if (!opened) {
        toast({
          title: "Popup blocat",
          description:
            "Browser-ul a blocat tab-ul nou. Permite popup-ul si incearca din nou.",
          variant: "warning",
        });
      } else {
        opened.focus();
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Demo indisponibil",
        description: "Nu am putut incarca demo-ul acestui template.",
        variant: "destructive",
      });
    } finally {
      setDemoLoadingTemplateId(null);
    }
  };

  const handleFinalizeFlow = async () => {
    if (isFinalizing) return;
    if (onCheckActive && !onCheckActive()) return;

    setFinalizeMode(hasFinalizedInvite ? "update" : "initial");
    setFinalizeModalOpen(true);
    setFinalizeState("loading");
    setIsFinalizing(true);

    const startedAt = Date.now();
    const ok = await persistNow(false, {
      commitToServer: true,
      errorDescription: "Nu am putut salva invitatia finala.",
    });
    const elapsed = Date.now() - startedAt;
    const minLoaderMs = 1400;
    if (elapsed < minLoaderMs) {
      await new Promise((resolve) => setTimeout(resolve, minLoaderMs - elapsed));
    }

    if (ok) {
      localStorage.setItem(finalizeStorageKey, "1");
      setHasFinalizedInvite(true);
      setHasPendingPublishChanges(false);
      editChangeWarningShownRef.current = false;
    }

    setFinalizeState(ok ? "success" : "error");
    setIsFinalizing(false);
  };

  const applyTemplateDefaults = async (
    templateId: string,
    showSuccessToast = false,
  ) => {
    cancelPendingSync();
    const initialPatch = buildSimpleTemplateDefaultPatch(templateId, {
      eventType: workingProfile.eventType,
    });
    if (!Object.keys(initialPatch).length) return;

    const templateConfig = await fetchTemplateDefaultsConfig(templateId);
    const definition = getSimpleTemplateDefinition(templateId);
    const paletteIds = new Set((definition?.palettes || []).map((p) => p.id));
    const configuredThemeRaw = String(templateConfig?.colorTheme || "").trim();
    const configuredTheme =
      configuredThemeRaw && (paletteIds.size === 0 || paletteIds.has(configuredThemeRaw))
        ? configuredThemeRaw
        : "";

    const targetTheme = String(
      configuredTheme ||
        (initialPatch.colorTheme as string) ||
        workingProfile.colorTheme ||
        "default",
    );
    const defaultBlocks = getSimpleTemplateDefaultBlocks(templateId, workingProfile.eventType);
    const blocksWithConfigImages = applyTemplateBlockImageDefaults(
      defaultBlocks,
      templateConfig,
      targetTheme,
      templateId,
    );
    const defaultPatch = buildSimpleTemplateDefaultPatch(templateId, {
      blocksOverride: blocksWithConfigImages,
      eventType: workingProfile.eventType,
    });
    if (!Object.keys(defaultPatch).length) return;
    defaultPatch.colorTheme = targetTheme;

    const nextProfile: UserProfile = {
      ...workingProfile,
      ...defaultPatch,
    };

    markDraftChanged();
    setWorkingProfile(nextProfile);
    await Promise.resolve(onUpdateProfile(nextProfile));

    if (showSuccessToast) {
      toast({
        title: "Reset efectuat",
        description: hasFinalizedInvite
          ? "Resetul a fost aplicat in draft. Apasa Salveaza modificarile ca sa actualizezi invitatia publica."
          : "Invitatia a fost resetata la valorile default din cod.",
        variant: "success",
      });
    }
  };

  const handleTemplateSelect = async (templateId: string) => {
    if (templateId === selectedTemplate) return;
    if (onCheckActive && !onCheckActive()) return;

    try {
      setSaving(true);
      onSelectTemplate(templateId);
      await applyTemplateDefaults(templateId, false);
    } catch (error) {
      console.error(error);
      toast({
        title: "Eroare",
        description: "Nu am putut aplica default-urile template-ului selectat.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const onPreviewMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const payload = event.data as
        | { type?: string; templateId?: string }
        | undefined;
      if (!payload || payload.type !== "simple-template-use") return;
      const templateId = String(payload.templateId || "").trim();
      if (!templateId) return;
      const isComingSoon =
        getTemplateAvailabilityStatus(templateId) === "coming-soon";
      const isClassicTemplate = templateId === "classic";
      const isLockedByPlan = !isUpgradedPlan && !isClassicTemplate;
      if (isComingSoon || isLockedByPlan) {
        toast({
          title: "Template indisponibil",
          description:
            isComingSoon
              ? "Acest template este Coming Soon."
              : "Template-ul necesita upgrade.",
          variant: "warning",
        });
        return;
      }
      void handleTemplateSelect(templateId);
      toast({
        title: "Template selectat",
        description: "Template-ul demo a fost aplicat in wizard.",
        variant: "success",
      });
    };

    window.addEventListener("message", onPreviewMessage);
    return () => window.removeEventListener("message", onPreviewMessage);
  }, [getTemplateAvailabilityStatus, handleTemplateSelect, isUpgradedPlan, toast]);

  const handleResetCurrentTemplateToDefault = async () => {
    if (!selectedSample?.id) return;
    if (onCheckActive && !onCheckActive()) return;

    const accepted = window.confirm(
      "Esti sigur ca vrei reset la valorile default? Vor fi resetate blocurile, pozele si formatarea invitatiei.",
    );
    if (!accepted) return;

    try {
      setSaving(true);
      await applyTemplateDefaults(selectedSample.id, true);
    } catch (error) {
      console.error(error);
      toast({
        title: "Eroare la reset",
        description: "Nu am putut reseta invitatia acum. Incearca din nou.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    if (step === 0) {
      const missingFields: string[] = [];
      if (!String(workingProfile.eventType || "").trim()) {
        missingFields.push("Tip eveniment");
      }
      if (!String(workingProfile.partner1Name || "").trim()) {
        missingFields.push(isWeddingEvent ? "Numele lui" : "Nume principal");
      }
      if (isWeddingEvent && !String(workingProfile.partner2Name || "").trim()) {
        missingFields.push("Numele ei");
      }
      if (!normalizeSlug(workingProfile.inviteSlug || "")) {
        missingFields.push("Slug invitatie");
      }
      if (!String(workingProfile.weddingDate || "").trim()) {
        missingFields.push("Data eveniment");
      }
      if (missingFields.length > 0) {
        toast({
          title: "Completeaza campurile obligatorii",
          description: `Lipsesc: ${missingFields.join(", ")}.`,
          variant: "warning",
        });
        return;
      }
    }

    if (step === 1) {
      if (isUpgradedPlan && !selectedSample) {
        toast({
          title: "Alege un template",
          description: "Selecteaza template-ul pentru pasul urmator.",
          variant: "warning",
        });
        return;
      }
    }

    if (step === STEP_TITLES.length - 1) {
      await handleFinalizeFlow();
      return;
    }

    const ok = await persistNow(false, {
      commitToServer: false,
      errorDescription: "Nu am putut salva draftul local al pasului curent.",
    });
    if (!ok) return;

    const nextStep =
      step === 1 && !hasIntroEditor ? 3 : Math.min(step + 1, STEP_TITLES.length - 1);
    setStep(nextStep);
  };

  const handlePrev = () =>
    setStep((prev) => {
      if (prev === 3 && !hasIntroEditor) return 1;
      return Math.max(0, prev - 1);
    });

  useEffect(() => {
    if (step === 2 && !hasIntroEditor) {
      setStep(3);
    }
  }, [step, hasIntroEditor]);

  const getPaletteThumbInfo = (
    paletteId: string,
  ): { thumb?: string; usesAdminImage: boolean } => {
    if (!canShowPaletteThumbs) return { thumb: undefined, usesAdminImage: false };
    const explicit =
      paletteThemeImages[paletteId]?.desktop || paletteThemeImages[paletteId]?.mobile;
    if (explicit) return { thumb: explicit, usesAdminImage: true };
    const fallback =
      paletteThemeImages.default?.desktop ||
      paletteThemeImages.default?.mobile ||
      paletteFallbackImage?.desktop ||
      paletteFallbackImage?.mobile;
    return { thumb: fallback, usesAdminImage: false };
  };

  const getTemplateCardTone = (themeSet: string) => {
    if (themeSet === "girl") {
      return {
        previewBg: "bg-pink-50 border-pink-200",
        accent: "#be185d",
        soft: "#fdf2f8",
        mid: "#f9a8d4",
      };
    }
    if (themeSet === "boy") {
      return {
        previewBg: "bg-blue-50 border-blue-200",
        accent: "#1d4ed8",
        soft: "#eff6ff",
        mid: "#93c5fd",
      };
    }
    if (themeSet === "royal_rose") {
      return {
        previewBg: "bg-rose-50 border-rose-200",
        accent: "#be123c",
        soft: "#fff1f2",
        mid: "#fda4af",
      };
    }
    if (themeSet === "blush_bloom") {
      return {
        previewBg: "bg-pink-50 border-pink-200",
        accent: "#be185d",
        soft: "#fdf2f8",
        mid: "#f9a8d4",
      };
    }
    if (themeSet === "garden") {
      return {
        previewBg: "bg-fuchsia-50 border-fuchsia-200",
        accent: "#7e22ce",
        soft: "#fdf4ff",
        mid: "#d8b4fe",
      };
    }
    if (themeSet === "botanica") {
      return {
        previewBg: "bg-emerald-50 border-emerald-200",
        accent: "#047857",
        soft: "#ecfdf5",
        mid: "#86efac",
      };
    }
    if (themeSet === "regal") {
      return {
        previewBg: "bg-slate-100 border-slate-300",
        accent: "#1e293b",
        soft: "#f8fafc",
        mid: "#cbd5e1",
      };
    }
    if (themeSet === "lord") {
      return {
        previewBg: "bg-stone-50 border-stone-300",
        accent: "#292524",
        soft: "#fafaf9",
        mid: "#d6d3d1",
      };
    }
    if (themeSet === "luxury") {
      return {
        previewBg: "bg-stone-50 border-stone-300",
        accent: "#3b342b",
        soft: "#fafaf9",
        mid: "#d6d3d1",
      };
    }
    if (themeSet === "maison") {
      return {
        previewBg: "bg-amber-50 border-amber-200",
        accent: "#9a6b2f",
        soft: "#fffaf0",
        mid: "#e7c58a",
      };
    }
    if (themeSet === "adventure") {
      return {
        previewBg: "bg-sky-50 border-sky-200",
        accent: "#0369a1",
        soft: "#f0f9ff",
        mid: "#7dd3fc",
      };
    }
    if (themeSet === "frozen") {
      return {
        previewBg: "bg-cyan-50 border-cyan-200",
        accent: "#2563eb",
        soft: "#ecfeff",
        mid: "#a5f3fc",
      };
    }
    if (themeSet === "jurassic") {
      return {
        previewBg: "bg-amber-50 border-amber-200",
        accent: "#a16207",
        soft: "#fffbeb",
        mid: "#fcd34d",
      };
    }
    if (themeSet === "mermaid") {
      return {
        previewBg: "bg-teal-50 border-teal-200",
        accent: "#0f766e",
        soft: "#f0fdfa",
        mid: "#5eead4",
      };
    }
    if (themeSet === "gabby") {
      return {
        previewBg: "bg-fuchsia-50 border-fuchsia-200",
        accent: "#c026d3",
        soft: "#fdf4ff",
        mid: "#f0abfc",
      };
    }
    if (themeSet === "spiderman") {
      return {
        previewBg: "bg-red-50 border-red-200",
        accent: "#dc2626",
        soft: "#fef2f2",
        mid: "#60a5fa",
      };
    }
    if (themeSet === "mickey") {
      return {
        previewBg: "bg-amber-50 border-amber-200",
        accent: "#cc0000",
        soft: "#fff7ed",
        mid: "#facc15",
      };
    }
    if (themeSet === "lilo") {
      return {
        previewBg: "bg-cyan-50 border-cyan-200",
        accent: "#0891b2",
        soft: "#ecfeff",
        mid: "#fb7185",
      };
    }
    if (themeSet === "unicorn") {
      return {
        previewBg: "bg-violet-50 border-violet-200",
        accent: "#7c3aed",
        soft: "#f5f3ff",
        mid: "#c4b5fd",
      };
    }
    if (themeSet === "zootropolis") {
      return {
        previewBg: "bg-orange-50 border-orange-200",
        accent: "#ea580c",
        soft: "#fff7ed",
        mid: "#fdba74",
      };
    }
    return {
      previewBg: "bg-zinc-50 border-zinc-200",
      accent: "#52525b",
      soft: "#fafafa",
      mid: "#a1a1aa",
    };
  };

  const previewCustomSections = useMemo(() => {
    const raw = String(workingProfile.customSections || "");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return raw;
      } catch {}
    }

    const fallbackTemplateId = selectedSample?.id || selectedTemplate || "";
    const fallbackBlocks = getSimpleTemplateDefaultBlocks(
      fallbackTemplateId,
      workingProfile.eventType,
    );
    return fallbackBlocks.length ? JSON.stringify(fallbackBlocks) : raw;
  }, [workingProfile.customSections, workingProfile.eventType, selectedSample?.id, selectedTemplate]);

  const previewData = useMemo(
    () => ({
      guest: { name: "Invitat Exemplu", status: "pending", type: "adult" },
      project: { selectedTemplate: selectedSample?.id || selectedTemplate || "" },
      profile: {
        ...workingProfile,
        inviteSlug: normalizeSlug(workingProfile.inviteSlug || ""),
        customSections: previewCustomSections,
      },
    }),
    [selectedSample, selectedTemplate, workingProfile, previewCustomSections],
  );

  const renderEditablePreview = (
    introOnly: boolean,
    editable = true,
  ) => {
    if (!templateComponent) {
      return (
        <div className="p-5 rounded-lg border bg-background text-sm text-muted-foreground">
          Template-ul nu are preview disponibil.
        </div>
      );
    }
    const TemplateComponent = templateComponent;
    const isIntroPreview = introOnly;
    const previewViewportClass = isIntroPreview
      ? "max-h-[70vh] md:max-h-[74vh] overflow-y-auto overflow-x-hidden"
      : "max-h-[56vh] md:max-h-[64vh] overflow-y-auto overflow-x-hidden";

    const previewInnerClass = "w-full";
    const previewPaddingClass = isIntroPreview ? "p-0 md:p-1.5" : "p-1 md:p-1.5";

    return (
      <div className="border rounded-lg overflow-hidden bg-white">
        <div
          ref={(node) => {
            inlinePreviewScrollRef.current = node;
            if (inlinePreviewScrollEl !== node) setInlinePreviewScrollEl(node);
          }}
          className={`${previewViewportClass} ${previewPaddingClass}`}
        >
          <div className={previewInnerClass}>
            <TemplateComponent
              data={previewData}
              onOpenRSVP={() => {}}
              editMode={editable}
              introOnly={introOnly}
              suppressAudioModal={!editable}
              scrollContainer={inlinePreviewScrollEl}
              onProfileUpdate={
                editable
                  ? (patch: Partial<UserProfile>) => patchProfile(patch)
                  : undefined
              }
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950/50 px-4 md:px-8 pt-0 pb-6 md:pb-8">
      <div className="sticky top-0 z-20 -mx-4 md:-mx-8 px-4 md:px-8 py-2 border-b border-border bg-zinc-50/95 dark:bg-zinc-950/90 backdrop-blur">
        <div className="max-w-5xl mx-auto space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="font-medium text-foreground">Progres configurare</span>
            <span>
              Pas {step + 1}/{STEP_TITLES.length} · {progress}% ·{" "}
              {stepsRemaining === 0
                ? "Ultimul pas"
                : `${stepsRemaining} pasi ramasi`}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto pt-3 md:pt-4 space-y-3 md:space-y-4">
        {step === 0 && (
          <Card className="rounded-xl">
            <CardHeader className="px-4 py-3 md:px-5 md:py-4">
              <CardTitle className="text-sm md:text-base">Step 1 - Selecteaza tipul de eveniment</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0 md:px-5 md:pb-5 space-y-4">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Tip eveniment *</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {SIMPLE_EVENT_TYPES.map((evt) => {
                    const isSelected = workingProfile.eventType === evt.id;
                    return (
                      <button
                        key={evt.id}
                        type="button"
                        onClick={() =>
                          patchProfile(
                            {
                              eventType: evt.id,
                              ...(evt.id === "wedding" ? {} : { partner2Name: "" }),
                            },
                            true,
                          )
                        }
                        className={cn(
                          "text-left p-3 rounded-lg border transition-all",
                          isSelected
                            ? "border-primary ring-2 ring-primary/25 bg-primary/5"
                            : "border-input hover:border-primary/60 bg-background",
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-sm">{evt.label}</span>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {isWeddingEvent ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Numele lui *</label>
                      <Input
                        required
                        value={String(workingProfile.partner1Name || "")}
                        onChange={(e: any) =>
                          patchProfile({
                            partner1Name: e.target.value,
                            eventName: e.target.value,
                          })
                        }
                        placeholder="ex: Andrei"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Numele ei *</label>
                      <Input
                        required
                        value={String(workingProfile.partner2Name || "")}
                        onChange={(e: any) =>
                          patchProfile({
                            partner2Name: e.target.value,
                          })
                        }
                        placeholder="ex: Maria"
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs text-muted-foreground">Nume principal *</label>
                    <Input
                      required
                      value={String(workingProfile.partner1Name || "")}
                      onChange={(e: any) =>
                        patchProfile({
                          partner1Name: e.target.value,
                          eventName: e.target.value,
                        })
                      }
                      placeholder="ex: Emma Sofia"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Slug invitatie *</label>
                  <Input
                    required
                    value={String(workingProfile.inviteSlug || "")}
                    onChange={(e: any) =>
                      patchProfile({ inviteSlug: normalizeSlug(e.target.value) })
                    }
                    placeholder="ex: emma-2026"
                  />
                  <div className="space-y-1 pt-1">
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      Slug-ul este partea unica din linkul public al invitatiei.
                      Se foloseste pentru adresa finala pe care o trimiti invitatilor.
                    </p>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      Exemplu: daca scrii <span className="font-medium text-foreground">emma-2026</span>,
                      linkul va fi de forma <span className="font-medium text-foreground">/events/emma-2026/public</span>.
                    </p>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      Recomandare: foloseste doar litere mici, cifre si liniuta, ca
                      sa ramana usor de distribuit si memorat.
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Data eveniment *</label>
                  <Input
                    type="date"
                    required
                    value={String(workingProfile.weddingDate || "")}
                    onChange={(e: any) => patchProfile({ weddingDate: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 1 && (
          <Card className="rounded-xl">
            <CardHeader className="px-4 py-3 md:px-5 md:py-4">
              <CardTitle className="text-sm md:text-base">Step 2 - Selecteaza template + paleta</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0 md:px-5 md:pb-5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {templateCards.map((tpl) => {
                  const isComingSoon =
                    getTemplateAvailabilityStatus(tpl.id) === "coming-soon";
                  const isClassicTemplate = tpl.id === "classic";
                  const isLockedByPlan = !isUpgradedPlan && !isClassicTemplate;
                  const isSelected = tpl.id === selectedTemplate && !isComingSoon;
                  const tone = getTemplateCardTone(tpl.themeSet);
                  const configuredDefaultTheme = String(
                    templateDefaultThemeById[tpl.id] || "",
                  ).trim();
                  const previewPalette =
                    getSimpleTemplateDefinition(tpl.id)?.palettes?.find(
                      (palette) => palette.id === configuredDefaultTheme,
                    ) || getSimpleTemplateDefinition(tpl.id)?.palettes?.[0];
                  const previewImage = templateCardPreviewImages[tpl.id];

                  const colorA = previewPalette?.surface || tone.soft;
                  const colorB = previewPalette?.primary || tone.accent;
                  const colorC = previewPalette?.secondary || tone.mid;

                  return (
                    <div
                      key={tpl.id}
                      className={cn(
                        "rounded-xl bg-card text-card-foreground transition-all duration-300 group relative overflow-hidden border shadow-md",
                        isSelected
                          ? "border-primary ring-2 ring-primary/25 shadow-2xl"
                          : "border-border hover:shadow-2xl hover:border-primary/70",
                        isComingSoon ? "opacity-95" : "",
                        isLockedByPlan ? "opacity-90" : "",
                      )}
                    >
                      {isComingSoon ? (
                        <div className="absolute top-3 right-3 z-20 text-[10px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full border border-amber-300 bg-amber-100 text-amber-800">
                          Coming Soon
                        </div>
                      ) : isLockedByPlan ? (
                        <div className="absolute top-3 right-3 z-20 text-[10px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full border border-yellow-300 bg-yellow-100 text-yellow-800 inline-flex items-center gap-1 shadow-sm">
                          <Crown className="w-3 h-3" />
                          Premium
                        </div>
                      ) : null}

                      <div className={cn(isLockedByPlan && "blur-[1.2px] saturate-75")}>
                        <div
                          className={cn(
                            "h-36 relative flex flex-col items-center justify-center overflow-hidden border-b",
                            tone.previewBg,
                          )}
                        >
                          {previewImage ? (
                            <>
                              <img
                                src={previewImage}
                                alt={`Preview ${tpl.name}`}
                                className="absolute inset-0 w-full h-full object-cover"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center p-4 gap-2 w-full h-full">
                              <div
                                className="w-3/4 h-3 rounded-full opacity-30"
                                style={{ backgroundColor: colorB }}
                              />
                              <div
                                className="w-1/2 h-8 rounded-md opacity-40 my-2"
                                style={{ backgroundColor: colorB }}
                              />
                              <div
                                className="w-2/3 h-2 rounded-full opacity-20"
                                style={{ backgroundColor: colorB }}
                              />
                            </div>
                          )}
                          <div className="absolute bottom-3 left-3 flex gap-1">
                            {[colorA, colorB, colorC].map((c, idx) => (
                              <div
                                key={`${tpl.id}-chip-${idx}`}
                                className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="p-4 pt-4">
                          <h3 className="font-bold text-base">{tpl.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1 mb-3 line-clamp-2 min-h-[32px]">
                            {tpl.description}
                          </p>
                          <div className="flex flex-col gap-2">
                            <Button
                              type="button"
                              variant={isSelected ? "default" : "outline"}
                              disabled={isComingSoon || isLockedByPlan || saving}
                              onClick={() => {
                                if (isComingSoon || isLockedByPlan) return;
                                void handleTemplateSelect(tpl.id);
                              }}
                              className="text-xs w-full h-9 px-3 py-2"
                            >
                              {isComingSoon
                                ? "Coming Soon"
                                : isLockedByPlan
                                  ? "Upgrade necesar"
                                  : isSelected
                                    ? "Selectat"
                                    : "Alege"}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                void openTemplateDemo(tpl.id);
                              }}
                              disabled={saving || demoLoadingTemplateId === tpl.id}
                              className="w-full h-8 text-[10px] font-bold"
                            >
                              {demoLoadingTemplateId === tpl.id ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                                  Se incarca
                                </>
                              ) : (
                                <>
                                  <Eye className="w-3.5 h-3.5 mr-1" />
                                  See demo
                                </>
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              disabled={
                                isComingSoon ||
                                isLockedByPlan ||
                                step >= 3 ||
                                selectedTemplate !== tpl.id
                              }
                              onClick={() => setStep(hasIntroEditor ? 2 : 3)}
                              className="w-full h-8 text-[10px] font-bold"
                            >
                              EDIT TEMPLATE
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {filteredTemplates.length === 0 && (
                <div className="p-3 rounded-md border border-amber-200 bg-amber-50 text-amber-800 text-xs">
                  Pentru tipul de eveniment selectat nu exista inca template-uri simple disponibile.
                </div>
              )}

              {!isUpgradedPlan && (
                <div className="p-3 rounded-md border border-amber-200 bg-amber-50 text-amber-800 text-xs">
                  Contul fara upgrade poate folosi doar template-ul Classic. Restul sunt blocate cu lacat.
                </div>
              )}

              <div className="p-3 rounded-md border border-blue-200 bg-blue-50 text-blue-800 text-xs">
                Paleta de culori se configureaza in Step 4, sub butonul de reset.
              </div>

            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="rounded-xl">
            <CardHeader className="px-4 py-3 md:px-5 md:py-4">
              <CardTitle className="text-sm md:text-base">Step 3 - Intro separat</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0 md:px-5 md:pb-5 space-y-2.5">
              {hasIntroEditor ? (
                <>
                  <p className="text-xs text-muted-foreground">
                    {usesGuidedIntroInputs
                      ? "Intro este separat aici. Completeaza campurile de mai jos, preview-ul se actualizeaza automat."
                      : "Intro este separat aici. Editeaza direct pe preview."}
                  </p>
                  {introImageOptionsLoading ? (
                    <div className="rounded-lg border bg-background p-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Se incarca imaginile de intro...
                    </div>
                  ) : introImageOptions.length > 0 ? (
                    <div className="rounded-lg border bg-background p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-muted-foreground">
                          Alege imaginea de intro
                        </p>
                        <span className="text-[11px] text-muted-foreground">
                          Selectata:{" "}
                          <strong className="text-foreground">
                            {introImageOptions.find(
                              (opt) => opt.id === selectedIntroImageOptionId,
                            )?.label || "-"}
                          </strong>
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                        {introImageOptions.map((option) => {
                          const thumb = option.desktop || option.mobile;
                          const isSelected = selectedIntroImageOptionId === option.id;
                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => handleSelectIntroImageOption(option)}
                              className={cn(
                                "rounded-lg border text-left p-2.5 transition-all bg-card",
                                isSelected
                                  ? "border-primary ring-2 ring-primary/25"
                                  : "border-input hover:border-primary/60",
                              )}
                            >
                              <div className="relative h-24 md:h-32 rounded-md overflow-hidden border border-border/70 bg-zinc-100 dark:bg-zinc-800">
                                {thumb ? (
                                  <img
                                    src={thumb}
                                    alt={option.label}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-zinc-200 to-zinc-100 dark:from-zinc-700 dark:to-zinc-900" />
                                )}
                                <div className="absolute top-1 right-1 text-[9px] px-1.5 py-0.5 rounded bg-black/60 text-white">
                                  {option.source === "intro-variant"
                                    ? "Intro"
                                    : option.source === "theme-image"
                                      ? "Tema"
                                      : "Default"}
                                </div>
                              </div>
                              <div className="mt-1.5 flex items-center justify-between gap-2">
                                <span className="text-[11px] font-semibold leading-tight line-clamp-2">
                                  {option.label}
                                </span>
                                {isSelected && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                  {usesGuidedIntroInputs && (
                    <div className="rounded-lg border bg-background p-3 space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Completeaza textele de intro. Fallback la default se aplica doar cand iesi din camp si ramane gol.
                      </p>
                      {isLuxuryIntroTemplate ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <p className="text-[11px] text-muted-foreground">Titlu intro</p>
                            <Input
                              value={luxuryIntroFields.header}
                              onChange={(e) => {
                                const next = e.target.value;
                                setLuxuryIntroFields((prev) => ({ ...prev, header: next }));
                                patchProfile({ jungleHeaderText: next });
                              }}
                              onBlur={(e) => {
                                const raw = e.target.value;
                                if (raw.trim().length > 0) return;
                                const fallback = guidedIntroDefaults.subtitle;
                                setLuxuryIntroFields((prev) => ({ ...prev, header: fallback }));
                                patchProfile({ jungleHeaderText: fallback }, true);
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[11px] text-muted-foreground">Text intro</p>
                            <Input
                              value={luxuryIntroFields.text}
                              onChange={(e) => {
                                const next = e.target.value;
                                setLuxuryIntroFields((prev) => ({ ...prev, text: next }));
                                patchProfile({ jungleOverlayText: next });
                              }}
                              onBlur={(e) => {
                                const raw = e.target.value;
                                if (raw.trim().length > 0) return;
                                const fallback = guidedIntroDefaults.top;
                                setLuxuryIntroFields((prev) => ({ ...prev, text: fallback }));
                                patchProfile({ jungleOverlayText: fallback }, true);
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[11px] text-muted-foreground">Footer intro</p>
                            <Input
                              value={luxuryIntroFields.footer}
                              onChange={(e) => {
                                const next = e.target.value;
                                setLuxuryIntroFields((prev) => ({ ...prev, footer: next }));
                                patchProfile({ jungleFooterText: next });
                              }}
                              onBlur={(e) => {
                                const raw = e.target.value;
                                if (raw.trim().length > 0) return;
                                const fallback = guidedIntroDefaults.middle;
                                setLuxuryIntroFields((prev) => ({ ...prev, footer: fallback }));
                                patchProfile({ jungleFooterText: fallback }, true);
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {isCastleIntroTemplate && (
                              <div className="space-y-1">
                                <p className="text-[11px] text-muted-foreground">Welcome</p>
                                <Input
                                  value={castleIntroFields.welcome}
                                  onChange={(e) => {
                                    const next = e.target.value;
                                    setCastleIntroFields((prev) => ({ ...prev, welcome: next }));
                                    patchProfile({ castleIntroWelcome: next });
                                  }}
                                  onBlur={(e) => {
                                    const raw = e.target.value;
                                    if (raw.trim().length > 0) return;
                                    const fallback = guidedIntroDefaults.welcome;
                                    setCastleIntroFields((prev) => ({ ...prev, welcome: fallback }));
                                    patchProfile({ castleIntroWelcome: fallback }, true);
                                  }}
                                />
                              </div>
                            )}
                            <div className="space-y-1">
                              <p className="text-[11px] text-muted-foreground">
                                {isJurassicIntroTemplate ? "Subtitlu" : "Subtitle (sub nume)"}
                              </p>
                              <Input
                                value={castleIntroFields.subtitle}
                                onChange={(e) => {
                                  const next = e.target.value;
                                  setCastleIntroFields((prev) => ({ ...prev, subtitle: next }));
                                  patchProfile({ castleIntroSubtitle: next });
                                }}
                                onBlur={(e) => {
                                  const raw = e.target.value;
                                  if (raw.trim().length > 0) return;
                                  const fallback = guidedIntroDefaults.subtitle;
                                  setCastleIntroFields((prev) => ({ ...prev, subtitle: fallback }));
                                  patchProfile({ castleIntroSubtitle: fallback }, true);
                                }}
                              />
                            </div>
                            <div className="space-y-1">
                              <p className="text-[11px] text-muted-foreground">Text sus</p>
                              <Input
                                value={castleIntroFields.top}
                                onChange={(e) => {
                                  const next = e.target.value;
                                  setCastleIntroFields((prev) => ({ ...prev, top: next }));
                                  patchProfile({ castleInviteTop: next });
                                }}
                                onBlur={(e) => {
                                  const raw = e.target.value;
                                  if (raw.trim().length > 0) return;
                                  const fallback = guidedIntroDefaults.top;
                                  setCastleIntroFields((prev) => ({ ...prev, top: fallback }));
                                  patchProfile({ castleInviteTop: fallback }, true);
                                }}
                              />
                            </div>
                            <div className="space-y-1">
                              <p className="text-[11px] text-muted-foreground">Data (text mijloc)</p>
                              <Input
                                value={castleIntroFields.middle}
                                onChange={(e) => {
                                  const next = e.target.value;
                                  setCastleIntroFields((prev) => ({ ...prev, middle: next }));
                                  patchProfile({ castleInviteMiddle: next });
                                }}
                                onBlur={(e) => {
                                  const raw = e.target.value;
                                  if (raw.trim().length > 0) return;
                                  const fallback = guidedIntroDefaults.middle;
                                  setCastleIntroFields((prev) => ({ ...prev, middle: fallback }));
                                  patchProfile({ castleInviteMiddle: fallback }, true);
                                }}
                              />
                            </div>
                            <div className="space-y-1">
                              <p className="text-[11px] text-muted-foreground">Text jos</p>
                              <Input
                                value={castleIntroFields.bottom}
                                onChange={(e) => {
                                  const next = e.target.value;
                                  setCastleIntroFields((prev) => ({ ...prev, bottom: next }));
                                  patchProfile({ castleInviteBottom: next });
                                }}
                                onBlur={(e) => {
                                  const raw = e.target.value;
                                  if (raw.trim().length > 0) return;
                                  const fallback = guidedIntroDefaults.bottom;
                                  setCastleIntroFields((prev) => ({ ...prev, bottom: fallback }));
                                  patchProfile({ castleInviteBottom: fallback }, true);
                                }}
                              />
                            </div>
                            {isJurassicIntroTemplate && (
                              <div className="space-y-1">
                                <p className="text-[11px] text-muted-foreground">Tag jos (deschidere)</p>
                                <Input
                                  value={castleIntroFields.tag || ""}
                                  onChange={(e) => {
                                    const next = e.target.value;
                                    setCastleIntroFields((prev) => ({ ...prev, tag: next }));
                                    patchProfile({ castleInviteTag: next });
                                  }}
                                  onBlur={(e) => {
                                    const raw = e.target.value;
                                    if (raw.trim().length > 0) return;
                                    const fallback = guidedIntroDefaults.tag;
                                    setCastleIntroFields((prev) => ({ ...prev, tag: fallback }));
                                    patchProfile({ castleInviteTag: fallback }, true);
                                  }}
                                />
                              </div>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            Nume copil (din Step 1): <strong className="text-foreground">{workingProfile.partner1Name || "-"}</strong>
                          </p>
                        </>
                      )}
                    </div>
                  )}
                  {renderEditablePreview(true, !usesGuidedIntroInputs)}
                </>
              ) : (
                <div className="p-3 rounded-md border border-amber-200 bg-amber-50 text-amber-800 text-xs">
                  Template-ul selectat nu are intro separat. Poti continua la Step 4.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="rounded-xl">
            <CardHeader className="px-4 py-3 md:px-5 md:py-4">
              <CardTitle className="text-sm md:text-base">Step 4 - Editeaza invitatia</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0 md:px-5 md:pb-5 space-y-2.5">
              <div
                className={cn(
                  "rounded-lg border px-3 py-2 text-xs",
                  hasFinalizedInvite
                    ? "border-amber-200 bg-amber-50 text-amber-900"
                    : "border-sky-200 bg-sky-50 text-sky-900",
                )}
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold">
                      {hasFinalizedInvite
                        ? "Editezi invitatia curenta"
                        : "Editezi draftul invitatiei"}
                    </p>
                    <p className="text-[11px] leading-relaxed opacity-90">
                      {hasFinalizedInvite
                        ? "Modificarile se pastreaza local pana apesi Salveaza modificarile. Dupa salvare, ele vor afecta invitatia publica deja existenta."
                        : "Modificarile raman salvate local intre pasi si dupa refresh. Invitatia publica se actualizeaza doar cand apesi Finalizeaza."}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  Editeaza textele direct pe preview.
                </p>
                {hasSelectedTemplate && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      void handleResetCurrentTemplateToDefault();
                    }}
                    disabled={saving}
                    className="h-8 px-3 text-xs sm:self-auto self-start"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    Reset to default
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">
                    Paleta de culori (carusel infinit)
                  </p>
                  <span className="text-[11px] text-muted-foreground">
                    Selectata:{" "}
                    <strong className="text-foreground">
                      {selectedPalettes.find((p) => p.id === workingProfile.colorTheme)
                        ?.name || workingProfile.colorTheme || "default"}
                    </strong>
                  </span>
                </div>

                {selectedPalettes.length > 0 ? (
                  <div
                    ref={paletteCarouselRef}
                    className={cn(
                      "w-full rounded-xl border bg-muted/30 p-2.5 overflow-x-auto cursor-grab select-none",
                      "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                    )}
                  >
                    <div className="flex w-max gap-2.5 pr-2">
                      {paletteCarouselItems.map((palette, index) => {
                        const isSelected = workingProfile.colorTheme === palette.id;
                        const thumbInfo = getPaletteThumbInfo(palette.id);
                        const thumb = thumbInfo.thumb;
                        return (
                          <button
                            key={`${palette.id}-${index}`}
                            type="button"
                            onClick={() => patchProfile({ colorTheme: palette.id }, true)}
                            className={cn(
                              "min-w-[180px] md:min-w-[200px] rounded-lg border p-2.5 text-left transition-all",
                              "bg-background/95 hover:border-primary/70",
                              isSelected
                                ? "border-primary ring-2 ring-primary/25"
                                : "border-input",
                            )}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold leading-tight line-clamp-2">
                                {palette.name}
                              </span>
                              {isSelected && (
                                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                              )}
                            </div>

                            <div
                              className="mt-2 h-2 rounded-full"
                              style={{
                                background: `linear-gradient(90deg, ${palette.primary}, ${palette.secondary}, ${palette.accent})`,
                              }}
                            />
                            {canShowPaletteThumbs && (
                              <p className="mt-1 text-[10px] text-muted-foreground">
                                {thumbInfo.usesAdminImage
                                  ? "Se foloseste poza incarcata de admin."
                                  : "Se foloseste poza default."}
                              </p>
                            )}

                            <div className="mt-2 flex items-center justify-between gap-1.5">
                              <div className="flex gap-1.5">
                                {[
                                  palette.primary,
                                  palette.secondary,
                                  palette.accent,
                                  palette.surface,
                                ].map((c) => (
                                  <span
                                    key={`${palette.id}-${c}`}
                                    className="w-4 h-4 rounded-full border border-white/30"
                                    style={{ backgroundColor: c }}
                                  />
                                ))}
                              </div>
                              {canShowPaletteThumbs && (
                                <div className="w-12 h-9 rounded-md overflow-hidden border border-border/70 shrink-0 bg-zinc-100 dark:bg-zinc-800">
                                  {thumb ? (
                                    <img
                                      src={thumb}
                                      alt={`Preview ${palette.name}`}
                                      className="w-full h-full object-cover"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <div
                                      className="w-full h-full"
                                      style={{
                                        background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`,
                                      }}
                                    />
                                  )}
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-md border border-amber-200 bg-amber-50 text-amber-800 text-xs">
                    Template-ul selectat nu are palete dedicate.
                  </div>
                )}
              </div>
              {renderEditablePreview(false)}
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card className="rounded-xl">
            <CardHeader className="px-4 py-3 md:px-5 md:py-4">
              <CardTitle className="text-sm md:text-base">Step 5 - Review + Share</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0 md:px-5 md:pb-5 space-y-4">
              <div
                className={cn(
                  "rounded-lg border px-3 py-2 text-xs",
                  hasFinalizedInvite
                    ? "border-amber-200 bg-amber-50 text-amber-900"
                    : "border-emerald-200 bg-emerald-50 text-emerald-900",
                )}
              >
                <div className="flex items-start gap-2">
                  {hasFinalizedInvite ? (
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <Save className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-semibold">
                      {hasFinalizedInvite
                        ? hasPendingPublishChanges
                          ? "Ai modificari noi in draft"
                          : "Invitatia actuala este deja salvata"
                        : "Totul este pregatit pentru finalizare"}
                    </p>
                    <p className="text-[11px] leading-relaxed opacity-90">
                      {hasFinalizedInvite
                        ? hasPendingPublishChanges
                          ? "Apasa Salveaza modificarile ca sa actualizezi invitatia publica."
                          : "Poti reveni in Step 4 pentru editari. Dupa orice modificare, salveaza din nou pentru a actualiza linkul public."
                        : "Pana acum ai lucrat in draft local. Finalizeaza publica modificarile si genereaza varianta finala a invitatiei."}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-[minmax(280px,340px),minmax(0,1fr)] gap-3">
                <div className="space-y-3 rounded-lg border border-input bg-background p-3">
                  <div className="text-xs font-semibold text-foreground">
                    Rezumat configurare
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Tip eveniment:{" "}
                    <strong className="text-foreground">
                      {SIMPLE_EVENT_TYPES.find(
                        (evt) => evt.id === (workingProfile.eventType as SimpleEventType),
                      )?.label || workingProfile.eventType}
                    </strong>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Template:{" "}
                    <strong className="text-foreground">
                      {selectedSample?.name || "-"}
                    </strong>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Paleta:{" "}
                    <strong className="text-foreground">
                      {selectedDefinition?.palettes?.find(
                        (p) => p.id === workingProfile.colorTheme,
                      )?.name || workingProfile.colorTheme || "default"}
                    </strong>
                  </div>
                </div>

                <div className="space-y-2 xl:sticky xl:top-16 self-start">
                  <div className="text-xs text-muted-foreground">
                    Preview final invitatie
                  </div>
                  {renderEditablePreview(false, false)}
                </div>
              </div>

            </CardContent>
          </Card>
        )}

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrev}
            disabled={step === 0}
            className="flex-1 sm:flex-none h-9 px-3 text-sm"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Inapoi
          </Button>
          <div className="hidden md:block text-xs text-muted-foreground text-center flex-1">
            {stepsRemaining === 0
              ? !hasFinalizedInvite
                ? "Esti la ultimul pas. Apasa Finalizeaza."
                : hasPendingPublishChanges
                  ? "Ai modificari in draft. Apasa Salveaza modificarile."
                  : "Invitatia publica este deja sincronizata."
              : `Mai ai ${stepsRemaining} pasi pana la finalizare.`}
          </div>
          <Button
            type="button"
            onClick={handleNext}
            disabled={
              saving ||
              (step === STEP_TITLES.length - 1 &&
                hasFinalizedInvite &&
                !hasPendingPublishChanges)
            }
            className="flex-1 sm:flex-none h-9 px-3 text-sm"
          >
            {step === STEP_TITLES.length - 1 ? finalActionLabel : "Continua"}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      <Dialog open={editHelpOpen} onOpenChange={setEditHelpOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:w-full sm:max-w-3xl h-[85dvh] max-h-[85dvh] sm:h-auto sm:max-h-[500px] overflow-hidden p-0">
          <div className="space-y-4 h-full max-h-[85dvh] overflow-y-auto px-4 py-4 sm:max-h-[500px] sm:px-6 sm:py-5">
            <DialogHeader>
              <DialogTitle>
                {editHelpIsIntroStep ? "Cum editezi intro-ul" : "Cum editezi invitatia"}
              </DialogTitle>
              <DialogDescription>
                {editHelpIsIntroStep
                  ? "In acest pas configurezi intro-ul invitatiei si vezi modificarile direct in preview."
                  : "In acest pas configurezi direct varianta finala a invitatiei."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-2">
              <div className="rounded-lg border bg-background px-3 py-2 text-sm flex items-start gap-3">
                <ImagePlus className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <div>
                  <div className="font-medium text-foreground">Schimba imaginile</div>
                  <div className="text-xs text-muted-foreground">
                    {editHelpIsIntroStep
                      ? "Da click pe zonele editabile din preview-ul intro pentru a ajusta rapid continutul vizual."
                      : "Da click pe formele de imagine din preview pentru a incarca sau inlocui pozele."}
                  </div>
                </div>
              </div>
              <div className="rounded-lg border bg-background px-3 py-2 text-sm flex items-start gap-3">
                <Type className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <div>
                  <div className="font-medium text-foreground">Editeaza textele</div>
                  <div className="text-xs text-muted-foreground">
                    {editHelpIsIntroStep
                      ? "Poti completa textele intro si urmari imediat cum apar in preview."
                      : "Da click direct pe orice text din preview pentru a-l modifica."}
                  </div>
                </div>
              </div>
              <div className="rounded-lg border bg-background px-3 py-2 text-sm flex items-start gap-3">
                <RotateCcw className="w-4 h-4 mt-0.5 text-destructive shrink-0" />
                <div>
                  <div className="font-medium text-foreground">Reset to default</div>
                  <div className="text-xs text-muted-foreground">
                    Butonul de reset readuce invitatia la structura si stilul initial al template-ului.
                  </div>
                </div>
              </div>
              <div className="rounded-lg border bg-background px-3 py-2 text-sm flex items-start gap-3">
                <Save className="w-4 h-4 mt-0.5 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-medium text-foreground">Draft local + finalizare</div>
                  <div className="text-xs text-muted-foreground">
                    Fiecare pas ramane salvat local si dupa refresh. Modificarile ajung in invitatia publica doar cand apesi Finalizeaza.
                  </div>
                </div>
              </div>
            </div>

            {!editHelpIsIntroStep ? (
              <div className="rounded-xl border bg-background p-4 space-y-4">
                <div className="flex items-start gap-3">
                  <Navigation className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-foreground">
                      Cum copiezi linkul pentru Waze
                    </div>
                    <div className="text-xs leading-relaxed text-muted-foreground">
                      Google Maps se genereaza automat din adresa. Pentru Waze trebuie
                      sa copiezi manual linkul din Waze Live Map sau din aplicatia
                      Waze, apoi sa il lipesti in campul dedicat din locatie.
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  {WAZE_HELP_STEPS.map((stepText, index) => (
                    <div
                      key={`waze-help-${index}`}
                      className="rounded-lg border bg-card px-3 py-2 flex items-start gap-3"
                    >
                      <div className="h-5 w-5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <div className="text-xs leading-relaxed text-muted-foreground">
                        {stepText}
                      </div>
                    </div>
                  ))}
                </div>

                {/* <div className="rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2">
                  <div className="text-xs font-medium text-amber-900">
                    Pont util
                  </div>
                  <div className="mt-1 text-[11px] leading-relaxed text-amber-800">
                    Daca vrei sa afisezi si printscreen-uri in acest popup, pune
                    imaginile in <code className="font-mono">/public/tutorials/waze</code>
                    {" "}cu numele:
                    {" "}
                    <code className="font-mono">step-1-open-map.png</code>,
                    {" "}
                    <code className="font-mono">step-2-share.png</code>,
                    {" "}
                    <code className="font-mono">step-3-copy-link.png</code>.
                  </div>
                </div> */}

                <div className="space-y-2">
                  <div className="text-sm font-medium text-foreground">
                    Printscreen-uri ghid Waze
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    {WAZE_HELP_SCREENSHOTS.map((item) => (
                      <HelpScreenshotCard
                        key={item.src}
                        src={item.src}
                        title={item.title}
                        caption={item.caption}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {editHelpVideo ? (
              <div className="rounded-lg border bg-background p-3 space-y-2">
                <div className="text-sm font-medium text-foreground">
                  Video explicativ
                </div>
                <div className="text-xs text-muted-foreground">
                  Poti folosi acest tutorial pentru a vedea exact cum se editeaza invitatia.
                </div>
                <div className="overflow-hidden rounded-lg border bg-black aspect-video">
                  {editHelpVideo.type === "video" ? (
                    <video
                      src={editHelpVideo.src}
                      controls
                      preload="metadata"
                      className="w-full h-full"
                    />
                  ) : (
                    <iframe
                      src={editHelpVideo.src}
                      title="Tutorial editare invitatie"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </div>
              </div>
            ) : null}

            <Button
              type="button"
              className="w-full"
              onClick={() => setEditHelpOpen(false)}
            >
              Am inteles
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={finalizeModalOpen}
        onOpenChange={(open) => {
          if (isFinalizing) return;
          setFinalizeModalOpen(open);
        }}
      >
        <DialogContent className="max-w-md">
          {finalizeState === "loading" && (
            <div className="py-6">
              <DialogHeader>
                <DialogTitle>
                  {finalizeMode === "update" ? "Actualizam invitatia" : "Configuram invitatia"}
                </DialogTitle>
                <DialogDescription>
                  {finalizeMode === "update"
                    ? "Aplicam noile modificari si actualizam link-ul public existent."
                    : "Pregatim setarile finale si link-ul public."}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-6 flex flex-col items-center gap-3">
                <div className="h-14 w-14 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center">
                  <Loader2 className="w-7 h-7 text-primary animate-spin" />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Aplicam template, culori si configuratia finala...
                </p>
              </div>
            </div>
          )}

          {finalizeState === "success" && (
            <div className="py-1 space-y-4">
              <DialogHeader>
                <DialogTitle>
                  {finalizeMode === "update"
                    ? "Modificarile au fost aplicate"
                    : "Invitatia ta este gata de trimis"}
                </DialogTitle>
                <DialogDescription>
                  {finalizeMode === "update"
                    ? "Invitatia publica a fost actualizata cu noile modificari."
                    : "Acesta este link-ul public al invitatiei."}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2">
                <Input value={publicInviteLink} readOnly />
                <Button
                  type="button"
                  variant="outline"
                  onClick={copyPublicLink}
                  disabled={!publicInviteLink}
                  className="w-full"
                >
                  <Copy className="w-4 h-4 mr-1.5" />
                  Copiaza link public
                </Button>
              </div>

              <div className="space-y-2">
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => {
                    setFinalizeModalOpen(false);
                    onNavigateToGuests?.();
                  }}
                >
                  Mergi la Guest List pentru linkuri personalizate
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => setFinalizeModalOpen(false)}
                >
                  Inchide
                </Button>
              </div>
            </div>
          )}

          {finalizeState === "error" && (
            <div className="py-2 space-y-4">
              <DialogHeader>
                <DialogTitle>Nu am putut finaliza acum</DialogTitle>
                <DialogDescription>
                  Verifica datele si incearca din nou.
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-2">
                <Button
                  type="button"
                  className="flex-1"
                  onClick={handleFinalizeFlow}
                  disabled={isFinalizing}
                >
                  Reincearca
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setFinalizeModalOpen(false)}
                >
                  Inchide
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SimpleInvitationWizard;
