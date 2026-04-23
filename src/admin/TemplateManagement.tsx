import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Save, Upload, Check, Loader2, Trash2, ChevronDown, ChevronUp, RefreshCw, Plus, X, Pencil } from 'lucide-react';
import { CASTLE_THEMES, GIRL_THEMES, BOY_THEMES, getCastleTheme, getLordTheme, getLuxuryTheme, CastleColorTheme, ROMANTIC_THEMES, LORD_MONO_THEMES, LUXURY_NEUTRAL_THEMES, JURASSIC_BOY_THEMES, JURASSIC_GIRL_THEMES, getJurassicTheme, ZOOTROPOLIS_BOY_THEMES, ZOOTROPOLIS_GIRL_THEMES, getZootropolisTheme, MERMAID_BOY_THEMES, MERMAID_GIRL_THEMES, getMermaidTheme } from '../components/invitations/castleDefaults';
import { templates as hardcodedTemplates } from '../components/invitations/registry';
import { TemplateVisibilityStatus } from '../components/invitations/types';
import { TEMPLATEURI_SAMPLE } from '../components/templateuri_sample';
import { API_URL } from '../config/api';
import {
  getSimpleTemplateConfigLookupIds,
  getSimpleTemplateDefaultBlocks,
} from '../components/simple-templates/defaults-registry';

const tok = () =>
  JSON.parse(localStorage.getItem('weddingPro_session') || '{}')?.token || '';

// ── Tipuri ────────────────────────────────────────────────────────────────────
interface ThemeImages { desktop?: string; mobile?: string; }
interface IntroVariant { label: string; desktop?: string; mobile?: string; }
interface VariantConfig {
  colorTheme: string;
  themeImages: Record<string, ThemeImages>;
  heroBgImage?: string;
  heroBgImageMobile?: string;
  videoUrl?: string;
  introVariants: Record<string, IntroVariant>;
  defaultIntroVariant?: string;
}
type AllConfigs = Record<string, VariantConfig>;
type TemplateStatusMap = Record<string, TemplateVisibilityStatus>;
interface MarketplaceTemplateItem {
  id: string;
  name: string;
  category?: string;
  source: 'built-in' | 'dynamic' | 'simple-wizard' | 'config-only';
  inSimpleWizard?: boolean;
  inMarketplace?: boolean;
}

interface TemplateDefaultsConfigPayload {
  colorTheme?: string;
  themeImages?: Record<string, ThemeImages>;
  heroBgImage?: string | null;
  heroBgImageMobile?: string | null;
  videoUrl?: string | null;
  introVariants?: Record<string, IntroVariant>;
  defaultIntroVariant?: string | null;
  templateCardCover?: string | null;
  demoProfile?: Record<string, any> | null;
  demoCustomSections?: any;
  demoGuest?: Record<string, any> | string | null;
}

type DemoEditorEventType = 'wedding' | 'baptism' | 'anniversary' | 'office';

interface DemoEditorState {
  templateId: string;
  templateName: string;
  eventType: DemoEditorEventType;
  demoProfile: Record<string, any>;
  demoGuest: Record<string, any>;
  demoCustomSections: any[];
}

const DEMO_BLOCK_LIBRARY: Array<{
  type: string;
  label: string;
  defaults: Record<string, any>;
}> = [
  { type: 'text', label: 'Text', defaults: { content: 'Text demo' } },
  {
    type: 'photo',
    label: 'Foto',
    defaults: {
      imageData: '',
      altText: 'Poza demo',
      aspectRatio: '3:4',
      photoClip: 'rounded',
      photoMasks: [],
    },
  },
  {
    type: 'location',
    label: 'Locatie',
    defaults: {
      label: 'Locatie',
      time: '18:00',
      locationName: 'Locatie Demo',
      locationAddress: 'Strada Exemplu nr. 1',
      wazeLink: '',
      mapsLink: '',
    },
  },
  { type: 'calendar', label: 'Calendar', defaults: {} },
  {
    type: 'countdown',
    label: 'Countdown',
    defaults: { countdownTitle: 'Timp ramas pana la eveniment' },
  },
  { type: 'rsvp', label: 'RSVP', defaults: { label: 'Confirma prezenta' } },
  { type: 'divider', label: 'Divider', defaults: {} },
  { type: 'spacer', label: 'Spacer', defaults: {} },
  { type: 'music', label: 'Muzica', defaults: { musicTitle: '', musicArtist: '', musicUrl: '', musicType: 'none' } },
];

type TemplateSourceFilter = 'all' | 'wizard' | 'marketplace';
type TemplateEventFilter = 'all' | 'wedding' | 'baptism' | 'anniversary' | 'office';

const TEMPLATE_SOURCE_FILTER_OPTIONS: Array<{ id: TemplateSourceFilter; label: string }> = [
  { id: 'all', label: 'Toate sursele' },
  { id: 'wizard', label: 'Wizard' },
  { id: 'marketplace', label: 'Marketplace' },
];

const TEMPLATE_EVENT_FILTER_OPTIONS: Array<{ id: TemplateEventFilter; label: string }> = [
  { id: 'all', label: 'Toate tipurile' },
  { id: 'wedding', label: 'Wedding' },
  { id: 'baptism', label: 'Botez' },
  { id: 'anniversary', label: 'Aniversare' },
  { id: 'office', label: 'Office' },
];

const inferEventFiltersFromCategory = (category?: string): TemplateEventFilter[] => {
  const raw = String(category || '').toLowerCase();
  if (!raw) return [];

  const out = new Set<TemplateEventFilter>();
  if (raw.includes('wedding') || raw.includes('nunta')) out.add('wedding');
  if (raw.includes('bapt') || raw.includes('botez') || raw.includes('christening')) out.add('baptism');
  if (raw.includes('anniversary') || raw.includes('anivers')) out.add('anniversary');
  if (raw.includes('office') || raw.includes('corporate') || raw.includes('meeting')) out.add('office');
  return Array.from(out);
};

const normalizeDemoEventType = (value: unknown): DemoEditorEventType => {
  const raw = String(value || '').toLowerCase();
  if (raw === 'wedding') return 'wedding';
  if (raw === 'office') return 'office';
  if (raw === 'anniversary') return 'anniversary';
  return 'baptism';
};

const safeParseMaybeJson = (value: unknown): any => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
};

const normalizeDemoSections = (raw: unknown): any[] => {
  const parsed = safeParseMaybeJson(raw);
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(raw)) return raw;
  return [];
};

// ── Template-uri ──────────────────────────────────────────────────────────────
const VARIANTS = [
  { id: 'castle-magic',      label: 'Castle Magic',   emoji: '🏰', color: '#be185d', bg: '#fdf2f8', desc: 'Versiunea clasica roz pentru botez' },
  { id: 'castle-magic-girl', label: 'Castel Regal',   emoji: '🏰', color: '#7c3aed', bg: '#faf5ff', desc: 'Varianta unificata (fete + baieti) pentru wizard simplu' },
  { id: 'lord-effects',      label: 'Lord Effects',   emoji: '👑', color: '#1d4ed8', bg: '#eff6ff', desc: 'Varianta Lord Effects cu imagini per tema' },
  { id: 'luxury-style-simple', label: 'Luxury Style', emoji: '✨', color: '#14532d', bg: '#ecfdf5', desc: 'Varianta Luxury Style cu imagini per tema' },
  { id: 'romantic', label: 'Romantic',    emoji: '🌸', color: '#7f0000', bg: '#faf5ff', desc: 'Versiunea pentru fete' },
  { id: 'jurassic-park', label: 'Jurassic Park', emoji: '🦕', color: '#c87820', bg: '#fdf8ec', desc: 'Aventura jurasica — teme baieti & fete' },
  { id: 'zootropolis',   label: 'Zootropolis',   emoji: '🦊', color: '#E85D04', bg: '#fff7ed', desc: 'Metropola animala — teme baieti & fete' },
  { id: 'little-mermaid', label: 'Little Mermaid', emoji: '🧜‍♀', color: '#92400e', bg: '#fffbeb', desc: 'Template Mica Sirena cu video intro' },
];

const VARIANT_CONFIG_ALIASES: Record<string, string[]> = {
  'castle-magic-girl': ['castle-magic-girl-simple', 'castle-magic-boy', 'castle-magic-boy-simple', 'castle-magic-boys', 'castle-magic-boys-simple'],
  'castle-magic-boys': ['castle-magic-boy', 'castle-magic-boy-simple', 'castle-magic-boys-simple', 'castle-magic-girl', 'castle-magic-girl-simple'],
  'luxury-style-simple': ['regal', 'jungle-magic-effect'],
  'jurassic-park': ['jurassic-park-simple'],
  'zootropolis': ['zootropolis-simple'],
  'little-mermaid': ['little-mermaid-simple'],
};

const CASTEL_REGAL_THEMES: CastleColorTheme[] = Array.from(
  new Map(
    [...GIRL_THEMES, ...BOY_THEMES].map((theme) => [theme.id, theme]),
  ).values(),
);

const emptyConfig = (): VariantConfig => ({ colorTheme: 'default', themeImages: {}, introVariants: {} });

// ── Component ─────────────────────────────────────────────────────────────────
const TemplateManagement: React.FC = () => {
  const [configs,  setConfigs]  = useState<AllConfigs>({});
  const [loading,  setLoading]  = useState<Record<string, boolean>>({});
  const [saving,   setSaving]   = useState<Record<string, boolean>>({});
  const [saved,    setSaved]    = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [marketplaceTemplates, setMarketplaceTemplates] = useState<MarketplaceTemplateItem[]>([]);
  const [templateVisibility, setTemplateVisibility] = useState<TemplateStatusMap>({});
  const [visibilityLoading, setVisibilityLoading] = useState(true);
  const [visibilitySaving, setVisibilitySaving] = useState<Record<string, boolean>>({});
  const [templateCovers, setTemplateCovers] = useState<Record<string, string>>({});
  const [coverSaving, setCoverSaving] = useState<Record<string, boolean>>({});
  const [demoSaving, setDemoSaving] = useState<Record<string, boolean>>({});
  const [templateHasDemoConfig, setTemplateHasDemoConfig] = useState<Record<string, boolean>>({});
  const [sourceFilter, setSourceFilter] = useState<TemplateSourceFilter>('all');
  const [eventFilter, setEventFilter] = useState<TemplateEventFilter>('all');
  const coverInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const demoInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const demoPhotoInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const demoHeroInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [demoEditorOpen, setDemoEditorOpen] = useState(false);
  const [demoEditorLoading, setDemoEditorLoading] = useState(false);
  const [demoEditorSaving, setDemoEditorSaving] = useState(false);
  const [demoEditorData, setDemoEditorData] = useState<DemoEditorState | null>(null);

  const sampleEventTypesByTemplateId = useMemo(
    () =>
      new Map(
        TEMPLATEURI_SAMPLE.map((tpl) => [
          tpl.id,
          tpl.eventTypes as Array<Exclude<TemplateEventFilter, 'all'>>,
        ]),
      ),
    [],
  );

  const templateEventFiltersById = useMemo(() => {
    const result: Record<string, Array<Exclude<TemplateEventFilter, 'all'>>> = {};
    marketplaceTemplates.forEach((tpl) => {
      const fromSample = sampleEventTypesByTemplateId.get(tpl.id);
      if (fromSample?.length) {
        result[tpl.id] = fromSample;
        return;
      }
      result[tpl.id] = inferEventFiltersFromCategory(tpl.category) as Array<
        Exclude<TemplateEventFilter, 'all'>
      >;
    });
    return result;
  }, [marketplaceTemplates, sampleEventTypesByTemplateId]);

  const filteredMarketplaceTemplates = useMemo(
    () =>
      marketplaceTemplates.filter((tpl) => {
        const matchesSource =
          sourceFilter === 'all'
            ? true
            : sourceFilter === 'wizard'
              ? !!tpl.inSimpleWizard
              : !!tpl.inMarketplace;

        const matchesEvent =
          eventFilter === 'all'
            ? true
            : (templateEventFiltersById[tpl.id] || []).includes(eventFilter as Exclude<TemplateEventFilter, 'all'>);

        return matchesSource && matchesEvent;
      }),
    [eventFilter, marketplaceTemplates, sourceFilter, templateEventFiltersById],
  );

  // ── Load all variants on mount ─────────────────────────────────────────────
  useEffect(() => {
    VARIANTS.forEach(v => loadVariant(v.id));
    loadTemplateVisibility();
  }, []);

  const normalizeTemplateStatus = (value: any): TemplateVisibilityStatus =>
    value === 'coming_soon' ? 'coming_soon' : 'live';

  const getVariantConfigIds = (id: string): string[] =>
    Array.from(new Set([id, ...(VARIANT_CONFIG_ALIASES[id] || [])]));

  const getTemplateCoverFromConfig = (cfg: any): string => {
    const direct =
      cfg?.templateCardCover ||
      cfg?.templateCoverImage ||
      cfg?.cardCoverImage ||
      "";
    return typeof direct === "string" ? direct : "";
  };

  const getTemplateHasDemoFromConfig = (cfg: any): boolean => {
    if (!cfg || typeof cfg !== "object") return false;
    const hasProfile =
      cfg.demoProfile && typeof cfg.demoProfile === "object" && Object.keys(cfg.demoProfile).length > 0;
    const hasGuest =
      (typeof cfg.demoGuest === "string" && cfg.demoGuest.trim().length > 0) ||
      (cfg.demoGuest && typeof cfg.demoGuest === "object" && Object.keys(cfg.demoGuest).length > 0);
    const hasCustomSections =
      Array.isArray(cfg.demoCustomSections)
        ? cfg.demoCustomSections.length > 0
        : typeof cfg.demoCustomSections === "string"
          ? cfg.demoCustomSections.trim().length > 0
          : !!cfg.demoCustomSections;
    return Boolean(hasProfile || hasGuest || hasCustomSections);
  };

  const hasAnyDemoKeys = (cfg: any): boolean => {
    if (!cfg || typeof cfg !== 'object') return false;
    return (
      Object.prototype.hasOwnProperty.call(cfg, 'demoProfile') ||
      Object.prototype.hasOwnProperty.call(cfg, 'demoCustomSections') ||
      Object.prototype.hasOwnProperty.call(cfg, 'demoGuest')
    );
  };

  const getTemplateDefaultsLookupIds = (templateId: string): string[] => {
    const ids = new Set<string>();
    const add = (value?: string) => {
      const normalized = String(value || '').trim();
      if (!normalized) return;
      ids.add(normalized);
    };

    add(templateId);
    getVariantConfigIds(templateId).forEach(add);

    getSimpleTemplateConfigLookupIds(templateId).forEach(add);

    if (templateId.endsWith('-simple')) {
      add(templateId.replace(/-simple$/, ''));
    } else {
      add(`${templateId}-simple`);
    }

    Object.entries(VARIANT_CONFIG_ALIASES).forEach(([baseId, aliases]) => {
      if (baseId === templateId || aliases.includes(templateId)) {
        add(baseId);
        aliases.forEach(add);
      }
    });

    // Reverse-link simple template aliases:
    // if current id belongs to any simple template config lookup list,
    // include that simple template id and all its config ids.
    TEMPLATEURI_SAMPLE.forEach((tpl) => {
      const simpleId = String(tpl.id || '').trim();
      if (!simpleId) return;
      const lookup = getSimpleTemplateConfigLookupIds(simpleId);
      const candidates = new Set<string>([
        simpleId,
        ...lookup,
        simpleId.endsWith('-simple') ? simpleId.replace(/-simple$/, '') : `${simpleId}-simple`,
      ]);
      if (!candidates.has(templateId)) return;
      candidates.forEach(add);
    });

    return Array.from(ids);
  };

  const fetchTemplateDefaultsConfig = async (
    templateId: string,
    options?: { preferDemo?: boolean },
  ): Promise<any> => {
    const preferDemo = !!options?.preferDemo;
    const lookupIds = getTemplateDefaultsLookupIds(templateId);

    let firstConfig: any = null;
    let firstWithDemoKeys: any = null;
    let firstWithDemoPayload: any = null;

    for (const configId of lookupIds) {
      const res = await fetch(`${API_URL}/admin/config/template-defaults/${encodeURIComponent(configId)}`, {
        headers: { Authorization: `Bearer ${tok()}` },
        cache: preferDemo ? 'no-store' : 'default',
      });
      if (!res.ok) continue;
      const cfg = await res.json().catch(() => null);
      if (!cfg || typeof cfg !== 'object') continue;

      if (!firstConfig) firstConfig = cfg;

      if (preferDemo) {
        if (!firstWithDemoKeys && hasAnyDemoKeys(cfg)) {
          firstWithDemoKeys = cfg;
        }
        if (!firstWithDemoPayload && getTemplateHasDemoFromConfig(cfg)) {
          firstWithDemoPayload = cfg;
        }
        continue;
      }

      return cfg;
    }

    if (preferDemo) {
      return firstWithDemoPayload || firstWithDemoKeys || firstConfig || null;
    }

    return firstConfig || null;
  };

const buildConfigPayload = (
  raw: any,
  coverUrl: string | null,
): TemplateDefaultsConfigPayload => {
  const base = raw && typeof raw === "object" ? { ...raw } : {};
  return {
    ...base,
    colorTheme: typeof raw?.colorTheme === "string" ? raw.colorTheme : "default",
    themeImages: raw?.themeImages && typeof raw.themeImages === "object" ? raw.themeImages : {},
    heroBgImage: raw?.heroBgImage || null,
    heroBgImageMobile: raw?.heroBgImageMobile || null,
    videoUrl: raw?.videoUrl || null,
    introVariants: raw?.introVariants && typeof raw.introVariants === "object" ? raw.introVariants : {},
    defaultIntroVariant: raw?.defaultIntroVariant || null,
    templateCardCover: coverUrl,
  };
};

  const persistTemplateDefaultsPayload = async (
    templateId: string,
    nextPayload: Record<string, any>,
  ) => {
    const lookupIds = getTemplateDefaultsLookupIds(templateId);
    for (const configId of lookupIds) {
      const res = await fetch(`${API_URL}/admin/config/template-defaults/${encodeURIComponent(configId)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tok()}`,
        },
        body: JSON.stringify(nextPayload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          err?.error ||
            `Nu am putut salva configurarea template-ului pentru ${configId}.`,
        );
      }
    }
  };

  const persistTemplateCover = async (templateId: string, coverUrl: string | null) => {
    setCoverSaving((prev) => ({ ...prev, [templateId]: true }));
    try {
      const current = await fetchTemplateDefaultsConfig(templateId);
      const payload = buildConfigPayload(current, coverUrl);
      await persistTemplateDefaultsPayload(templateId, payload);
      setTemplateCovers((prev) => {
        const next = { ...prev };
        if (coverUrl) next[templateId] = coverUrl;
        else delete next[templateId];
        return next;
      });
    } catch (e: any) {
      alert(e?.message || "Eroare la salvarea copertii.");
    } finally {
      setCoverSaving((prev) => ({ ...prev, [templateId]: false }));
    }
  };

  const persistTemplateDemoConfig = async (
    templateId: string,
    demoPatch: { demoProfile?: any; demoCustomSections?: any; demoGuest?: any } | null,
  ) => {
    setDemoSaving((prev) => ({ ...prev, [templateId]: true }));
    try {
      const current = await fetchTemplateDefaultsConfig(templateId);
      const currentCover = getTemplateCoverFromConfig(current) || null;
      const basePayload = buildConfigPayload(current, currentCover);
      const payload = demoPatch
        ? {
            ...basePayload,
            demoProfile: demoPatch.demoProfile ?? null,
            demoCustomSections: demoPatch.demoCustomSections ?? null,
            demoGuest: demoPatch.demoGuest ?? null,
          }
        : {
            ...basePayload,
            demoProfile: null,
            demoCustomSections: null,
            demoGuest: null,
          };
      await persistTemplateDefaultsPayload(templateId, payload);
      setTemplateHasDemoConfig((prev) => ({ ...prev, [templateId]: !!demoPatch }));
    } catch (e: any) {
      alert(e?.message || "Eroare la salvarea demo-ului.");
    } finally {
      setDemoSaving((prev) => ({ ...prev, [templateId]: false }));
    }
  };

  const handleTemplateDemoUpload = async (templateId: string, file: File) => {
    setDemoSaving((prev) => ({ ...prev, [templateId]: true }));
    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw);
      const demoPatch = {
        demoProfile: parsed?.demoProfile ?? parsed?.profile ?? null,
        demoCustomSections: parsed?.demoCustomSections ?? parsed?.customSections ?? null,
        demoGuest: parsed?.demoGuest ?? parsed?.guest ?? null,
      };
      const hasAny =
        (demoPatch.demoProfile && typeof demoPatch.demoProfile === "object" && Object.keys(demoPatch.demoProfile).length > 0) ||
        (Array.isArray(demoPatch.demoCustomSections)
          ? demoPatch.demoCustomSections.length > 0
          : !!demoPatch.demoCustomSections) ||
        (typeof demoPatch.demoGuest === "string"
          ? demoPatch.demoGuest.trim().length > 0
          : !!demoPatch.demoGuest);
      if (!hasAny) {
        throw new Error("Fisierul demo JSON nu contine date valide.");
      }
      await persistTemplateDemoConfig(templateId, demoPatch);
    } catch (e: any) {
      alert(e?.message || "Demo JSON invalid.");
      setDemoSaving((prev) => ({ ...prev, [templateId]: false }));
    }
  };

  const buildQuickDemoPatch = (tpl: MarketplaceTemplateItem) => {
    const eventTypes =
      sampleEventTypesByTemplateId.get(tpl.id) ||
      (inferEventFiltersFromCategory(tpl.category) as Array<
        Exclude<TemplateEventFilter, "all">
      >);
    const eventType = (eventTypes?.[0] || "baptism") as
      | "wedding"
      | "baptism"
      | "anniversary"
      | "office";
    const isWedding = eventType === "wedding";
    const isOffice = eventType === "office";

    const demoProfile: Record<string, any> = {
      eventType,
      inviteSlug: `demo-${tpl.id}`.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      colorTheme: "default",
      weddingDate: "2027-06-20",
      eventTime: isOffice ? "10:00" : "18:00",
      locationName: isOffice ? "Business Center Hall" : "Locatie Demo",
      locationAddress: "Strada Exemplu nr. 1",
      showRsvpButton: true,
      isSetupComplete: true,
      castleIntroWelcome: "WELCOME",
      castleIntroSubtitle: "into my little kingdom",
      castleInviteTop: "Cu multa bucurie va anuntam",
      castleInviteBottom: "va asteptam cu drag",
      castleInviteTag: "* deschide portile *",
      jungleHeaderText: "Save The Date",
      jungleOverlayText: "Cu bucurie va invitam sa fiti parte din povestea noastra.",
      jungleFooterText: "Data Evenimentului",
    };

    if (isWedding) {
      demoProfile.partner1Name = "Alexandru";
      demoProfile.partner2Name = "Andreea";
    } else if (isOffice) {
      demoProfile.partner1Name = "Tech Summit 2027";
      demoProfile.partner2Name = "";
      demoProfile.eventName = "Tech Summit 2027";
    } else {
      demoProfile.partner1Name = "Ema Sofia";
      demoProfile.partner2Name = "";
    }

    return {
      demoProfile,
      demoCustomSections: null,
      demoGuest: {
        name: "Drag invitat",
        status: "pending",
        type: "adult",
      },
    };
  };

  const uploadMediaFile = async (file: File): Promise<string> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_URL}/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tok()}` },
      body: form,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.url) {
      throw new Error(data?.error || "Upload esuat.");
    }
    return String(data.url);
  };

  const openDemoEditor = async (tpl: MarketplaceTemplateItem) => {
    setDemoEditorOpen(true);
    setDemoEditorLoading(true);
    try {
      const current = await fetchTemplateDefaultsConfig(tpl.id, { preferDemo: true });
      const quick = buildQuickDemoPatch(tpl);
      const profileFromConfig =
        current?.demoProfile && typeof current.demoProfile === "object"
          ? current.demoProfile
          : {};
      const eventType = normalizeDemoEventType(
        profileFromConfig?.eventType || quick.demoProfile.eventType,
      );
      const defaultBlocks = getSimpleTemplateDefaultBlocks(tpl.id, eventType);
      const sectionsFromConfig = normalizeDemoSections(
        current?.demoCustomSections ?? profileFromConfig?.customSections,
      );
      const resolvedSections = sectionsFromConfig.length
        ? sectionsFromConfig
        : defaultBlocks;
      const demoGuestRaw = current?.demoGuest;
      const demoGuest =
        demoGuestRaw && typeof demoGuestRaw === "object"
          ? { ...quick.demoGuest, ...demoGuestRaw }
          : typeof demoGuestRaw === "string" && demoGuestRaw.trim()
            ? { ...quick.demoGuest, name: demoGuestRaw.trim() }
            : { ...quick.demoGuest };

      setDemoEditorData({
        templateId: tpl.id,
        templateName: tpl.name,
        eventType,
        demoProfile: {
          ...quick.demoProfile,
          ...(profileFromConfig || {}),
          eventType,
        },
        demoGuest,
        demoCustomSections: JSON.parse(JSON.stringify(resolvedSections)),
      });
    } catch (e: any) {
      alert(e?.message || "Nu am putut incarca editorul demo.");
      setDemoEditorOpen(false);
      setDemoEditorData(null);
    } finally {
      setDemoEditorLoading(false);
    }
  };

  const closeDemoEditor = () => {
    if (demoEditorSaving) return;
    setDemoEditorOpen(false);
    setDemoEditorData(null);
  };

  const updateDemoProfileField = (field: string, value: any) => {
    setDemoEditorData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        demoProfile: { ...prev.demoProfile, [field]: value },
      };
    });
  };

  const updateDemoGuestField = (field: string, value: any) => {
    setDemoEditorData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        demoGuest: { ...prev.demoGuest, [field]: value },
      };
    });
  };

  const setDemoBlocks = (nextBlocks: any[]) => {
    setDemoEditorData((prev) => {
      if (!prev) return prev;
      return { ...prev, demoCustomSections: nextBlocks };
    });
  };

  const updateDemoBlock = (index: number, patch: Record<string, any>) => {
    setDemoEditorData((prev) => {
      if (!prev) return prev;
      const next = [...prev.demoCustomSections];
      next[index] = { ...(next[index] || {}), ...patch };
      return { ...prev, demoCustomSections: next };
    });
  };

  const removeDemoBlock = (index: number) => {
    setDemoEditorData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        demoCustomSections: prev.demoCustomSections.filter((_, i) => i !== index),
      };
    });
  };

  const moveDemoBlock = (index: number, direction: -1 | 1) => {
    setDemoEditorData((prev) => {
      if (!prev) return prev;
      const target = index + direction;
      if (target < 0 || target >= prev.demoCustomSections.length) return prev;
      const next = [...prev.demoCustomSections];
      [next[index], next[target]] = [next[target], next[index]];
      return { ...prev, demoCustomSections: next };
    });
  };

  const addDemoBlock = (type: string) => {
    const libraryEntry = DEMO_BLOCK_LIBRARY.find((item) => item.type === type);
    if (!libraryEntry) return;
    setDemoEditorData((prev) => {
      if (!prev) return prev;
      const newBlock = {
        id: `demo-${type}-${Date.now()}`,
        type,
        show: true,
        ...libraryEntry.defaults,
      };
      return {
        ...prev,
        demoCustomSections: [...prev.demoCustomSections, newBlock],
      };
    });
  };

  const resetDemoSectionsToDefault = () => {
    setDemoEditorData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        demoCustomSections: getSimpleTemplateDefaultBlocks(prev.templateId, prev.eventType),
      };
    });
  };

  const uploadDemoPhotoForBlock = async (index: number, file: File) => {
    try {
      const url = await uploadMediaFile(file);
      updateDemoBlock(index, { imageData: url });
    } catch (e: any) {
      alert(e?.message || "Nu am putut urca imaginea.");
    }
  };

  const uploadDemoProfileImage = async (
    field: "heroBgImage" | "heroBgImageMobile",
    file: File,
  ) => {
    try {
      const url = await uploadMediaFile(file);
      updateDemoProfileField(field, url);
    } catch (e: any) {
      alert(e?.message || "Nu am putut urca imaginea de intro.");
    }
  };

  const saveDemoEditor = async () => {
    if (!demoEditorData) return;
    setDemoEditorSaving(true);
    try {
      await persistTemplateDemoConfig(demoEditorData.templateId, {
        demoProfile: demoEditorData.demoProfile,
        demoCustomSections: demoEditorData.demoCustomSections,
        demoGuest: demoEditorData.demoGuest,
      });
      setDemoEditorOpen(false);
      setDemoEditorData(null);
    } finally {
      setDemoEditorSaving(false);
    }
  };

  const handleTemplateCoverUpload = async (templateId: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Selecteaza un fisier imagine valid.");
      return;
    }
    setCoverSaving((prev) => ({ ...prev, [templateId]: true }));
    try {
      const form = new FormData();
      form.append("file", file);
      const uploadRes = await fetch(`${API_URL}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${tok()}` },
        body: form,
      });
      const uploadData = await uploadRes.json().catch(() => ({}));
      if (!uploadRes.ok || !uploadData?.url) {
        throw new Error(uploadData?.error || "Upload coperta esuat.");
      }
      await persistTemplateCover(templateId, uploadData.url as string);
    } catch (e: any) {
      alert(e?.message || "Eroare la upload coperta.");
      setCoverSaving((prev) => ({ ...prev, [templateId]: false }));
    }
  };

  const loadTemplateVisibility = async () => {
    setVisibilityLoading(true);
    try {
      const [visibilityRes, dynamicRes] = await Promise.all([
        fetch(`${API_URL}/config/template-visibility`),
        fetch(`${API_URL}/admin/templates`, {
          headers: { Authorization: `Bearer ${tok()}` },
        }),
      ]);

      const rawVisibility = visibilityRes.ok
        ? ((await visibilityRes.json())?.templates || {})
        : {};

      const normalizedVisibility = Object.fromEntries(
        Object.entries(rawVisibility).map(([templateId, status]) => [
          templateId,
          normalizeTemplateStatus(status),
        ])
      ) as TemplateStatusMap;
      setTemplateVisibility(normalizedVisibility);

      const dynamicTemplates = dynamicRes.ok ? await dynamicRes.json() : [];
      const merged = new Map<string, MarketplaceTemplateItem>();

      hardcodedTemplates.forEach((tpl) => {
        if (!tpl?.id) return;
        merged.set(tpl.id, {
          id: tpl.id,
          name: tpl.name || tpl.id,
          category: tpl.category,
          source: 'built-in',
          inMarketplace: true,
          inSimpleWizard: false,
        });
      });

      TEMPLATEURI_SAMPLE.forEach((tpl) => {
        if (!tpl?.id) return;
        const existing = merged.get(tpl.id);
        if (existing) {
          merged.set(tpl.id, {
            ...existing,
            inSimpleWizard: true,
            name: existing.name === existing.id ? tpl.name || existing.name : existing.name,
          });
          return;
        }
        merged.set(tpl.id, {
          id: tpl.id,
          name: tpl.name || tpl.id,
          category: tpl.eventTypes?.join(', '),
          source: 'simple-wizard',
          inSimpleWizard: true,
          inMarketplace: false,
        });
      });

      dynamicTemplates.forEach((tpl: any) => {
        if (!tpl?.id) return;
        const existing = merged.get(tpl.id);
        if (existing) {
          merged.set(tpl.id, {
            ...existing,
            name: existing.name === existing.id ? (tpl.name || existing.name) : existing.name,
            category: existing.category || tpl.category,
            source: existing.source === 'built-in' ? 'built-in' : 'dynamic',
            inMarketplace: true,
          });
          return;
        }
        merged.set(tpl.id, {
          id: tpl.id,
          name: tpl.name || tpl.id,
          category: tpl.category,
          source: 'dynamic',
          inMarketplace: true,
          inSimpleWizard: false,
        });
      });

      Object.keys(normalizedVisibility).forEach((templateId) => {
        if (merged.has(templateId)) return;
        merged.set(templateId, {
          id: templateId,
          name: templateId,
          source: 'config-only',
          inMarketplace: false,
          inSimpleWizard: false,
        });
      });

      setMarketplaceTemplates(
        Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name, 'ro'))
      );

      const templateIds = Array.from(merged.keys());
      const configPairs = await Promise.all(
        templateIds.map(async (templateId) => {
          try {
            const cfg = await fetchTemplateDefaultsConfig(templateId, { preferDemo: true });
            return {
              templateId,
              cover: getTemplateCoverFromConfig(cfg),
              hasDemo: getTemplateHasDemoFromConfig(cfg),
            } as const;
          } catch {
            return {
              templateId,
              cover: "",
              hasDemo: false,
            } as const;
          }
        }),
      );
      setTemplateCovers(
        Object.fromEntries(
          configPairs
            .filter((entry) => Boolean(entry.cover))
            .map((entry) => [entry.templateId, entry.cover]),
        ) as Record<string, string>,
      );
      setTemplateHasDemoConfig(
        Object.fromEntries(configPairs.map((entry) => [entry.templateId, entry.hasDemo])) as Record<string, boolean>,
      );
    } catch (e) {
      console.error('Failed to load template visibility', e);
    } finally {
      setVisibilityLoading(false);
    }
  };

  const saveTemplateVisibilityStatus = async (templateId: string, status: TemplateVisibilityStatus) => {
    setVisibilitySaving(prev => ({ ...prev, [templateId]: true }));
    try {
      const res = await fetch(`${API_URL}/admin/config/template-visibility/${encodeURIComponent(templateId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tok()}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Nu am putut salva statusul template-ului.');
      }

      setTemplateVisibility(prev => ({ ...prev, [templateId]: status }));
    } catch (e: any) {
      alert(e?.message || 'Eroare la salvare status template.');
    } finally {
      setVisibilitySaving(prev => ({ ...prev, [templateId]: false }));
    }
  };

  const loadVariant = async (id: string) => {
    setLoading(prev => ({ ...prev, [id]: true }));
    try {
      const candidateIds = getVariantConfigIds(id);
      let d: any = {};

      for (const cfgId of candidateIds) {
        const r = await fetch(`${API_URL}/admin/config/template-defaults/${cfgId}`, {
          headers: { Authorization: `Bearer ${tok()}` },
        });
        if (!r.ok) continue;
        const next = await r.json();
        const hasThemeImages = Object.values(next?.themeImages || {}).some(
          (entry: any) => !!entry?.desktop || !!entry?.mobile,
        );
        const hasAnyConfig =
          !!next?.heroBgImage ||
          !!next?.heroBgImageMobile ||
          !!next?.videoUrl ||
          hasThemeImages ||
          (next?.introVariants && Object.keys(next.introVariants || {}).length > 0) ||
          (typeof next?.colorTheme === 'string' && next.colorTheme.trim().length > 0);
        if (hasAnyConfig) {
          d = next;
          break;
        }
      }

      const themeImages: Record<string, ThemeImages> = d.themeImages || {};
      // Migrare format vechi
      if ((d.heroBgImage || d.heroBgImageMobile) && !themeImages['default']) {
        themeImages['default'] = { desktop: d.heroBgImage, mobile: d.heroBgImageMobile };
      }
      setConfigs(prev => ({
        ...prev,
        [id]: { colorTheme: d.colorTheme || 'default', themeImages, heroBgImage: d.heroBgImage, heroBgImageMobile: d.heroBgImageMobile, videoUrl: d.videoUrl || undefined, introVariants: d.introVariants || {}, defaultIntroVariant: d.defaultIntroVariant || undefined },
      }));
    } catch {}
    finally { setLoading(prev => ({ ...prev, [id]: false })); }
  };

  const saveVariant = async (id: string) => {
    const cfg = configs[id] || emptyConfig();
    setSaving(prev => ({ ...prev, [id]: true }));
    try {
      // Folosim imaginile temei active (colorTheme) ca fallback pentru heroBgImage
      const activeThemeImgs = cfg.themeImages[cfg.colorTheme] || {};
      const defaultImgs = activeThemeImgs.desktop ? activeThemeImgs : (cfg.themeImages['default'] || {});
      const payload = {
        colorTheme:          cfg.colorTheme,
        themeImages:         cfg.themeImages,
        heroBgImage:         defaultImgs.desktop || null,
        heroBgImageMobile:   defaultImgs.mobile  || null,
        videoUrl:            cfg.videoUrl || null,
        introVariants:       cfg.introVariants || {},
        defaultIntroVariant: cfg.defaultIntroVariant || null,
      };

      const configIds = getVariantConfigIds(id);
      for (const cfgId of configIds) {
        const res = await fetch(`${API_URL}/admin/config/template-defaults/${cfgId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok()}` },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error || `Nu am putut salva config-ul pentru "${cfgId}".`);
        }
      }

      setSaved(prev => ({ ...prev, [id]: true }));
      setTimeout(() => setSaved(prev => ({ ...prev, [id]: false })), 2500);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || 'Eroare la salvare config template.');
    }
    finally { setSaving(prev => ({ ...prev, [id]: false })); }
  };

  const resetVariant = async (id: string) => {
    const variant = VARIANTS.find(v => v.id === id);
    if (!window.confirm(`Resetezi toate imaginile si config-ul pentru "${variant?.label}"?

Fisierele vor fi sterse permanent.`)) return;
    setLoading(prev => ({ ...prev, [id]: true }));
    try {
      const configIds = getVariantConfigIds(id);
      let totalDeleted = 0;

      for (const cfgId of configIds) {
        const r = await fetch(`${API_URL}/admin/config/template-defaults/${cfgId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${tok()}` },
        });
        if (!r.ok) continue;
        const d = await r.json().catch(() => ({}));
        totalDeleted += Number(d?.deleted || 0);
      }

      setConfigs(prev => ({ ...prev, [id]: emptyConfig() }));
      alert(`✅ Reset complet. ${totalDeleted} fisiere sterse.`);
    } catch (e) {
      alert('Eroare la reset.');
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const patchConfig = (variantId: string, patch: Partial<VariantConfig>) => {
    setConfigs(prev => ({
      ...prev,
      [variantId]: { ...(prev[variantId] || emptyConfig()), ...patch },
    }));
  };

  const setThemeImage = (variantId: string, themeId: string, side: 'desktop' | 'mobile', url?: string) => {
    setConfigs(prev => {
      const cfg = prev[variantId] || emptyConfig();
      return {
        ...prev,
        [variantId]: {
          ...cfg,
          themeImages: {
            ...cfg.themeImages,
            [themeId]: { ...cfg.themeImages[themeId], [side]: url },
          },
        },
      };
    });
  };

  const removeThemeImages = (variantId: string, themeId: string) => {
    setConfigs(prev => {
      const cfg = { ...(prev[variantId] || emptyConfig()) };
      const imgs = { ...cfg.themeImages };
      delete imgs[themeId];
      return { ...prev, [variantId]: { ...cfg, themeImages: imgs } };
    });
  };

  // ── Intro Variants helpers (regal) ────────────────────────────────────────
  const addIntroVariant = (variantId: string) => {
    const id = `v_${Date.now()}`;
    setConfigs(prev => {
      const cfg = prev[variantId] || emptyConfig();
      return { ...prev, [variantId]: { ...cfg, introVariants: { ...cfg.introVariants, [id]: { label: 'Varianta noua' } } } };
    });
  };

  const updateIntroVariant = (variantId: string, ivId: string, patch: Partial<IntroVariant>) => {
    setConfigs(prev => {
      const cfg = prev[variantId] || emptyConfig();
      return { ...prev, [variantId]: { ...cfg, introVariants: { ...cfg.introVariants, [ivId]: { ...cfg.introVariants[ivId], ...patch } } } };
    });
  };

  const removeIntroVariant = (variantId: string, ivId: string) => {
    setConfigs(prev => {
      const cfg = { ...(prev[variantId] || emptyConfig()) };
      const ivs = { ...cfg.introVariants };
      delete ivs[ivId];
      const defaultIv = cfg.defaultIntroVariant === ivId ? undefined : cfg.defaultIntroVariant;
      return { ...prev, [variantId]: { ...cfg, introVariants: ivs, defaultIntroVariant: defaultIv } };
    });
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }
        .img-field-hover:hover .img-overlay { opacity: 1 !important; background: rgba(0,0,0,0.5) !important; }
        .img-field-hover:hover .img-overlay button { opacity: 1 !important; }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111' }}>🏰 Castle Templates</h2>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>
          Configurare globala pentru toate variantele — imagini usi per tema, paleta implicita.
        </p>
      </div>

      {/* ── Un card per varianta ────────────────────────────────────────────── */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: '16px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div style={{ marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#111' }}>Disponibilitate template-uri in dashboard</h3>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>
            'Coming Soon' afiseaza template-ul in lista, dar blocheaza selectarea lui pentru utilizatori.
          </p>
          {!visibilityLoading && marketplaceTemplates.length > 0 && (
            <>
              <div
                style={{
                  marginTop: 10,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 8,
                }}
              >
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, color: '#6b7280', fontWeight: 700 }}>
                  Sursa
                  <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value as TemplateSourceFilter)}
                    style={{
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      background: '#fff',
                      color: '#111',
                      fontSize: 12,
                      fontWeight: 600,
                      padding: '7px 8px',
                    }}
                  >
                    {TEMPLATE_SOURCE_FILTER_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, color: '#6b7280', fontWeight: 700 }}>
                  Tip eveniment
                  <select
                    value={eventFilter}
                    onChange={(e) => setEventFilter(e.target.value as TemplateEventFilter)}
                    style={{
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      background: '#fff',
                      color: '#111',
                      fontSize: 12,
                      fontWeight: 600,
                      padding: '7px 8px',
                    }}
                  >
                    {TEMPLATE_EVENT_FILTER_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <p style={{ margin: '8px 0 0', fontSize: 11, color: '#9ca3af' }}>
                Afisate {filteredMarketplaceTemplates.length} din {marketplaceTemplates.length} template-uri.
              </p>
            </>
          )}
        </div>

        {visibilityLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6b7280', fontSize: 12 }}>
            <Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} />
            Se incarca lista de template-uri...
          </div>
        ) : marketplaceTemplates.length === 0 ? (
          <div style={{ fontSize: 12, color: '#6b7280' }}>Nu am gasit template-uri pentru gestionare status.</div>
        ) : filteredMarketplaceTemplates.length === 0 ? (
          <div style={{ fontSize: 12, color: '#6b7280' }}>
            Nu exista template-uri pentru filtrele selectate.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
            {filteredMarketplaceTemplates.map((tpl) => {
              const status = templateVisibility[tpl.id] === 'coming_soon' ? 'coming_soon' : 'live';
              const isSavingStatus = !!visibilitySaving[tpl.id];
              const isSavingCover = !!coverSaving[tpl.id];
              const isSavingDemo = !!demoSaving[tpl.id];
              const coverUrl = templateCovers[tpl.id];
              const hasDemo = !!templateHasDemoConfig[tpl.id];
              return (
                <div key={tpl.id} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', background: '#fff' }}>
	                  <div style={{ marginBottom: 8 }}>
	                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#111', lineHeight: 1.2 }}>{tpl.name}</p>
	                    <p style={{ margin: '3px 0 0', fontSize: 10, color: '#9ca3af', fontFamily: 'monospace' }}>
	                      {tpl.id} {tpl.source === 'dynamic' ? '- custom' : tpl.source === 'simple-wizard' ? '- simple' : tpl.source === 'config-only' ? '- config' : '- built-in'}
	                    </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                        {tpl.inSimpleWizard ? (
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#1d4ed8', background: '#dbeafe', border: '1px solid #bfdbfe', padding: '2px 6px', borderRadius: 999 }}>
                            Wizard
                          </span>
                        ) : null}
                        {tpl.inMarketplace ? (
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#166534', background: '#dcfce7', border: '1px solid #bbf7d0', padding: '2px 6px', borderRadius: 999 }}>
                            Marketplace
                          </span>
                        ) : null}
                        {hasDemo ? (
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#7c3aed', background: '#f3e8ff', border: '1px solid #e9d5ff', padding: '2px 6px', borderRadius: 999 }}>
                            Demo setat
                          </span>
                        ) : null}
                      </div>
	                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <div
                      style={{
                        width: "100%",
                        height: 64,
                        borderRadius: 8,
                        border: "1px dashed #d1d5db",
                        background: coverUrl ? "#111827" : "#f9fafb",
                        overflow: "hidden",
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={`Coperta ${tpl.name}`}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <span style={{ fontSize: 10, color: "#9ca3af", fontWeight: 700 }}>
                          Fara coperta
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                      <button
                        type="button"
                        disabled={isSavingCover}
                        onClick={() => coverInputRefs.current[tpl.id]?.click()}
                        style={{
                          flex: 1,
                          borderRadius: 8,
                          border: "1px solid #e5e7eb",
                          background: "#fff",
                          color: "#374151",
                          fontWeight: 700,
                          fontSize: 10,
                          padding: "6px 8px",
                          cursor: isSavingCover ? "not-allowed" : "pointer",
                          opacity: isSavingCover ? 0.65 : 1,
                        }}
                      >
                        {isSavingCover ? "Se salveaza..." : "Upload coperta"}
                      </button>
                      <button
                        type="button"
                        disabled={isSavingCover || !coverUrl}
                        onClick={() => persistTemplateCover(tpl.id, null)}
                        style={{
                          borderRadius: 8,
                          border: "1px solid #fee2e2",
                          background: "#fff",
                          color: "#dc2626",
                          fontWeight: 700,
                          fontSize: 10,
                          padding: "6px 8px",
                          cursor: isSavingCover || !coverUrl ? "not-allowed" : "pointer",
                          opacity: isSavingCover || !coverUrl ? 0.5 : 1,
                        }}
                      >
                        Sterge
                      </button>
                      <input
                        ref={(el) => {
                          coverInputRefs.current[tpl.id] = el;
                        }}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void handleTemplateCoverUpload(tpl.id, file);
                          e.target.value = "";
                        }}
                      />
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                      <button
                        type="button"
                        disabled={isSavingDemo}
                        onClick={() => {
                          void persistTemplateDemoConfig(tpl.id, buildQuickDemoPatch(tpl));
                        }}
                        style={{
                          borderRadius: 8,
                          border: "1px solid #c7d2fe",
                          background: "#eef2ff",
                          color: "#3730a3",
                          fontWeight: 700,
                          fontSize: 10,
                          padding: "6px 8px",
                          cursor: isSavingDemo ? "not-allowed" : "pointer",
                          opacity: isSavingDemo ? 0.65 : 1,
                          whiteSpace: "nowrap",
                        }}
                      >
                        Demo rapid
                      </button>
                      <button
                        type="button"
                        disabled={isSavingDemo}
                        onClick={() => {
                          void openDemoEditor(tpl);
                        }}
                        style={{
                          borderRadius: 8,
                          border: "1px solid #bfdbfe",
                          background: "#eff6ff",
                          color: "#1d4ed8",
                          fontWeight: 700,
                          fontSize: 10,
                          padding: "6px 8px",
                          cursor: isSavingDemo ? "not-allowed" : "pointer",
                          opacity: isSavingDemo ? 0.65 : 1,
                          whiteSpace: "nowrap",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Pencil size={11} />
                        Editeaza demo
                      </button>
                      <button
                        type="button"
                        disabled={isSavingDemo}
                        onClick={() => demoInputRefs.current[tpl.id]?.click()}
                        style={{
                          flex: 1,
                          borderRadius: 8,
                          border: "1px solid #ddd6fe",
                          background: "#faf5ff",
                          color: "#6d28d9",
                          fontWeight: 700,
                          fontSize: 10,
                          padding: "6px 8px",
                          cursor: isSavingDemo ? "not-allowed" : "pointer",
                          opacity: isSavingDemo ? 0.65 : 1,
                        }}
                      >
                        {isSavingDemo ? "Se salveaza..." : "Upload demo JSON"}
                      </button>
                      <button
                        type="button"
                        disabled={isSavingDemo || !hasDemo}
                        onClick={() => {
                          void persistTemplateDemoConfig(tpl.id, null);
                        }}
                        style={{
                          borderRadius: 8,
                          border: "1px solid #fee2e2",
                          background: "#fff",
                          color: "#dc2626",
                          fontWeight: 700,
                          fontSize: 10,
                          padding: "6px 8px",
                          cursor: isSavingDemo || !hasDemo ? "not-allowed" : "pointer",
                          opacity: isSavingDemo || !hasDemo ? 0.5 : 1,
                        }}
                      >
                        Sterge demo
                      </button>
                      <input
                        ref={(el) => {
                          demoInputRefs.current[tpl.id] = el;
                        }}
                        type="file"
                        accept="application/json,.json"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void handleTemplateDemoUpload(tpl.id, file);
                          e.target.value = "";
                        }}
                      />
                    </div>
                    <p style={{ margin: "6px 0 0", fontSize: 10, color: "#9ca3af" }}>
                      Demo rapid = genereaza local date demo. Optional: Demo JSON {"{ profile, customSections, guest }"}.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      disabled={isSavingStatus || status === 'live'}
                      onClick={() => saveTemplateVisibilityStatus(tpl.id, 'live')}
                      style={{
                        flex: 1,
                        borderRadius: 8,
                        border: status === 'live' ? '1px solid #16a34a' : '1px solid #e5e7eb',
                        background: status === 'live' ? '#dcfce7' : '#fff',
                        color: status === 'live' ? '#166534' : '#6b7280',
                        fontWeight: 700,
                        fontSize: 11,
                        padding: '7px 8px',
                        cursor: isSavingStatus ? 'not-allowed' : 'pointer',
                        opacity: isSavingStatus ? 0.65 : 1,
                      }}
                    >
                      Live
                    </button>
                    <button
                      type="button"
                      disabled={isSavingStatus || status === 'coming_soon'}
                      onClick={() => saveTemplateVisibilityStatus(tpl.id, 'coming_soon')}
                      style={{
                        flex: 1,
                        borderRadius: 8,
                        border: status === 'coming_soon' ? '1px solid #d97706' : '1px solid #e5e7eb',
                        background: status === 'coming_soon' ? '#fef3c7' : '#fff',
                        color: status === 'coming_soon' ? '#92400e' : '#6b7280',
                        fontWeight: 700,
                        fontSize: 11,
                        padding: '7px 8px',
                        cursor: isSavingStatus ? 'not-allowed' : 'pointer',
                        opacity: isSavingStatus ? 0.65 : 1,
                      }}
                    >
                      Coming Soon
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {VARIANTS.map(variant => {
        const cfg     = configs[variant.id] || emptyConfig();
        const isLoading = loading[variant.id];
        const isSaving  = saving[variant.id];
        const isSaved   = saved[variant.id];
        const isExpanded = !!expanded[variant.id];
        const themesWithImgs = Object.entries(cfg.themeImages).filter(([, v]) => v.desktop || v.mobile).length;

        return (
          <div key={variant.id} style={{ background: 'white', borderRadius: 20, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>

            {/* Card header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 24px', borderBottom: isExpanded ? '1px solid #f3f4f6' : 'none', background: variant.bg, cursor: 'pointer' }}
              onClick={() => setExpanded(p => ({ ...p, [variant.id]: !isExpanded }))}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: variant.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, boxShadow: `0 4px 12px ${variant.color}44` }}>
                {variant.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#111' }}>{variant.label}</h3>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', fontFamily: 'monospace', background: '#f3f4f6', padding: '2px 8px', borderRadius: 6 }}>{variant.id}</span>
                </div>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6b7280' }}>
                  {variant.desc} · Tema implicita: <strong style={{ color: variant.color }}>{variant.id === 'lord-effects' ? getLordTheme(cfg.colorTheme).emoji : variant.id === 'luxury-style-simple' ? getLuxuryTheme(cfg.colorTheme).emoji : variant.id === 'jurassic-park' ? getJurassicTheme(cfg.colorTheme).emoji : variant.id === 'zootropolis' ? getZootropolisTheme(cfg.colorTheme).emoji : variant.id === 'little-mermaid' ? getMermaidTheme(cfg.colorTheme).emoji : getCastleTheme(cfg.colorTheme).emoji} {variant.id === 'lord-effects' ? getLordTheme(cfg.colorTheme).name : variant.id === 'luxury-style-simple' ? getLuxuryTheme(cfg.colorTheme).name : variant.id === 'jurassic-park' ? getJurassicTheme(cfg.colorTheme).name : variant.id === 'zootropolis' ? getZootropolisTheme(cfg.colorTheme).name : variant.id === 'little-mermaid' ? getMermaidTheme(cfg.colorTheme).name : getCastleTheme(cfg.colorTheme).name}</strong>
                  {themesWithImgs > 0 && <> · <span style={{ color: '#4f46e5' }}>🚪 {themesWithImgs} teme cu imagini</span></>}
                </p>
              </div>
              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                <button type="button" onClick={() => loadVariant(variant.id)} disabled={isLoading}
                  style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Reincarca">
                  <RefreshCw size={13} style={{ color: '#6b7280', animation: isLoading ? 'spin 0.7s linear infinite' : 'none' }} />
                </button>
                <button type="button" onClick={() => saveVariant(variant.id)} disabled={isSaving}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 9, border: 'none', cursor: 'pointer', background: isSaved ? '#10b981' : variant.color, color: 'white', fontSize: 12, fontWeight: 700, transition: 'background 0.2s', opacity: isSaving ? 0.7 : 1 }}>
                  {isSaving ? <Loader2 size={12} style={{ animation: 'spin 0.7s linear infinite' }} /> : isSaved ? <Check size={12} /> : <Save size={12} />}
                  {isSaved ? 'Salvat!' : isSaving ? '...' : 'Salveaza'}
                </button>
                <button type="button" onClick={() => resetVariant(variant.id)} disabled={isLoading || isSaving}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 9, border: '1.5px solid #fee2e2', cursor: 'pointer', background: 'white', color: '#ef4444', fontSize: 11, fontWeight: 700 }}
                  title="Sterge toate imaginile si reseteaza config-ul">
                  <Trash2 size={11} /> Reset
                </button>
              </div>
              <div style={{ color: '#9ca3af', marginLeft: 4 }}>
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </div>

            {/* Card body */}
           {isExpanded && (
  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 28, animation: 'fadeIn 0.15s ease' }}>
    {isLoading ? (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, padding: 32, color: '#9ca3af' }}>
        <Loader2 size={20} style={{ animation: 'spin 0.7s linear infinite', color: variant.color }} />
        <span style={{ fontSize: 13 }}>Se incarca configurarea...</span>
      </div>
    ) : variant.id === 'regal' ? (
      // ── Regal: intro variants grid ────────────────────────────────────────
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Header + Add button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>🖼 Variante Intro</span>
            <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 8 }}>— folosit de template-urile Regal/Luxury; varianta default se aplica automat</span>
          </div>
          <button type="button" onClick={() => addIntroVariant(variant.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 9, border: '1.5px dashed #92400e44', background: '#fffbeb', color: '#92400e', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            <Plus size={13} /> Adauga varianta
          </button>
        </div>

        {Object.keys(cfg.introVariants).length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af', fontSize: 13, border: '1.5px dashed #e5e7eb', borderRadius: 14 }}>
            Nicio varianta. Apasa <strong>Adauga varianta</strong> pentru a incepe.
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {Object.entries(cfg.introVariants).map(([ivId, iv]: [string, IntroVariant]) => {
            const isDefault = cfg.defaultIntroVariant === ivId;
            return (
              <div key={ivId} style={{ borderRadius: 14, border: `1.5px solid ${isDefault ? '#92400e66' : '#e5e7eb'}`, overflow: 'hidden', background: isDefault ? '#fffbeb' : 'white' }}>
                {/* Header varianta */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  <input
                    value={iv.label}
                    onChange={e => updateIntroVariant(variant.id, ivId, { label: e.target.value })}
                    style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, fontWeight: 700, color: '#111', outline: 'none', minWidth: 0 }}
                    placeholder="Nume varianta..."
                  />
                  {isDefault ? (
                    <span style={{ fontSize: 9, fontWeight: 700, background: '#92400e', color: 'white', borderRadius: 99, padding: '2px 7px', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                      DEFAULT
                    </span>
                  ) : (
                    <button type="button"
                      onClick={() => patchConfig(variant.id, { defaultIntroVariant: ivId })}
                      style={{ fontSize: 9, fontWeight: 700, background: 'transparent', color: '#9ca3af', border: '1px solid #e5e7eb', borderRadius: 99, padding: '2px 8px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      SET DEFAULT
                    </button>
                  )}
                  <button type="button" onClick={() => removeIntroVariant(variant.id, ivId)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 2 }} title="Sterge varianta">
                    <Trash2 size={12} />
                  </button>
                </div>

                {/* Upload slots desktop + mobile */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, padding: '12px 14px' }}>
                  <MiniImageField
                    label="Desktop 16:9"
                    url={iv.desktop}
                    aspect="56.25%"
                    accentColor="#92400e"
                    onUpload={url => updateIntroVariant(variant.id, ivId, { desktop: url })}
                    onRemove={() => updateIntroVariant(variant.id, ivId, { desktop: undefined })}
                  />
                  <MiniImageField
                    label="Mobile 9:16"
                    url={iv.mobile}
                    aspect="177.78%"
                    accentColor="#92400e"
                    width={52}
                    onUpload={url => updateIntroVariant(variant.id, ivId, { mobile: url })}
                    onRemove={() => updateIntroVariant(variant.id, ivId, { mobile: undefined })}
                  />
                </div>

                {/* Warning daca nu are imagini */}
                {!iv.desktop && !iv.mobile && (
                  <div style={{ padding: '0 14px 10px', fontSize: 9, color: '#b45309' }}>
                    ⚠ Nicio imagine — varianta nu va fi afisata utilizatorilor
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Info box */}
        {Object.keys(cfg.introVariants).length > 0 && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 14px', fontSize: 11, color: '#166534' }}>
            💡 Varianta marcata <strong>DEFAULT</strong> apare automat daca utilizatorul nu a ales nimic. Apasa <strong>Salveaza</strong> dupa orice modificare.
          </div>
        )}
      </div>
    ) : (
      // Sectiunea imagini usi per tema
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>🚪 Imagini usi per tema</span>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>— fiecare tema poate avea imagini diferite</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {(variant.id === 'lord-effects'
            ? LORD_MONO_THEMES
            : variant.id === 'luxury-style-simple'
            ? LUXURY_NEUTRAL_THEMES
            : variant.id === 'castle-magic-girl'
                ? CASTEL_REGAL_THEMES
                : variant.id === 'romantic'
                ? ROMANTIC_THEMES
                : variant.id === 'jurassic-park'
                ? [...JURASSIC_BOY_THEMES, ...JURASSIC_GIRL_THEMES] as unknown as CastleColorTheme[]
                : variant.id === 'zootropolis'
                ? [...ZOOTROPOLIS_BOY_THEMES, ...ZOOTROPOLIS_GIRL_THEMES] as unknown as CastleColorTheme[]
                : variant.id === 'little-mermaid'
                ? [...MERMAID_BOY_THEMES, ...MERMAID_GIRL_THEMES] as unknown as CastleColorTheme[]
                : CASTLE_THEMES
          ).map(theme => {
            const imgs = cfg.themeImages[theme.id] || {};
            const hasImgs = !!(imgs.desktop || imgs.mobile);
            const isDefault = cfg.colorTheme === theme.id;

            return (
              <div key={theme.id} style={{
                borderRadius: 14,
                border: `1.5px solid ${hasImgs ? theme.PINK_DARK + '66' : '#e5e7eb'}`,
                overflow: 'hidden',
                background: hasImgs ? theme.PINK_XL : 'white',
                transition: 'all 0.15s'
              }}>
                {/* Tema header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {[theme.PINK_DARK, theme.PINK_L, theme.PINK_XL].map((c, i) => (
                      <div key={i} style={{ width: 14, height: 14, borderRadius: 4, background: c, border: '1px solid rgba(0,0,0,0.08)' }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: theme.PINK_DARK, flex: 1 }}>
                    {theme.emoji} {theme.name}
                  </span>
                  {isDefault ? (
                    <span style={{ fontSize: 9, fontWeight: 700, background: theme.PINK_DARK, color: 'white', borderRadius: 99, padding: '2px 7px', letterSpacing: '0.05em' }}>
                      DEFAULT
                    </span>
                  ) : (
                    <button type="button"
                      onClick={() => patchConfig(variant.id, { colorTheme: theme.id })}
                      style={{ fontSize: 9, fontWeight: 700, background: 'transparent', color: '#9ca3af', border: '1px solid #e5e7eb', borderRadius: 99, padding: '2px 8px', cursor: 'pointer', letterSpacing: '0.05em' }}>
                      SET DEFAULT
                    </button>
                  )}
                  {hasImgs && (
                    <button type="button" onClick={() => removeThemeImages(variant.id, theme.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 2 }} title="Sterge imaginile">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>

                {/* Upload slots */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, padding: '12px 14px' }}>
                  <MiniImageField
                    label="Desktop 16:9"
                    url={imgs.desktop}
                    aspect="56.25%"
                    accentColor={theme.PINK_DARK}
                    onUpload={url => setThemeImage(variant.id, theme.id, 'desktop', url)}
                    onRemove={() => setThemeImage(variant.id, theme.id, 'desktop', undefined)}
                  />
                  <MiniImageField
                    label="Mobile 9:16"
                    url={imgs.mobile}
                    aspect="177.78%"
                    accentColor={theme.PINK_DARK}
                    width={52}
                    onUpload={url => setThemeImage(variant.id, theme.id, 'mobile', url)}
                    onRemove={() => setThemeImage(variant.id, theme.id, 'mobile', undefined)}
                  />
                </div>

                {/* Fallback warnings */}
                {!hasImgs && theme.id !== 'default' && !cfg.themeImages['default']?.desktop && (
                  <div style={{ padding: '4px 14px 10px', fontSize: 9, color: '#b45309' }}>
                    ⚠ Fara imagini — se va folosi SVG placeholder
                  </div>
                )}
                {!hasImgs && theme.id !== 'default' && cfg.themeImages['default']?.desktop && (
                  <div style={{ padding: '4px 14px 10px', fontSize: 9, color: '#6b7280' }}>
                    → Foloseste imaginile temei Default
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    )}
  </div>
)}
          </div>
        );
      })}

      {/* ── Info ───────────────────────────────────────────────────────────── */}
      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 14, padding: '14px 20px', display: 'flex', gap: 12 }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>💡</span>
        <div>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#92400e' }}>Cum functioneaza?</p>
          <p style={{ margin: '4px 0 0', fontSize: 11, color: '#78350f', lineHeight: 1.7 }}>
            Fiecare varianta Castle (Magic / Boys / Girl) are propriile setari salvate in MongoDB.<br />
            Imaginile de la usi se servesc per tema activa — daca tema utilizatorului nu are imagini proprii, se folosesc cele de la <strong>Default</strong>.<br />
            Modificarile devin active <em>imediat</em> la urmatoarea deschidere a invitatiei.
          </p>
        </div>
      </div>

      {demoEditorOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(2px)',
            padding: 16,
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              maxWidth: 1100,
              margin: '0 auto',
              background: 'white',
              borderRadius: 16,
              border: '1px solid #e5e7eb',
              boxShadow: '0 20px 80px rgba(0,0,0,0.22)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #eef2f7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#111' }}>
                  Editeaza Demo Rapid
                </p>
                <p style={{ margin: '3px 0 0', fontSize: 11, color: '#6b7280' }}>
                  {demoEditorData?.templateName || '-'} · profile + guest + blocuri demo
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={closeDemoEditor}
                  disabled={demoEditorSaving}
                  style={{
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    background: 'white',
                    color: '#374151',
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '7px 10px',
                    cursor: demoEditorSaving ? 'not-allowed' : 'pointer',
                    opacity: demoEditorSaving ? 0.65 : 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <X size={12} />
                  Inchide
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void saveDemoEditor();
                  }}
                  disabled={demoEditorSaving || demoEditorLoading || !demoEditorData}
                  style={{
                    borderRadius: 8,
                    border: 'none',
                    background: '#2563eb',
                    color: 'white',
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '7px 12px',
                    cursor: demoEditorSaving || demoEditorLoading ? 'not-allowed' : 'pointer',
                    opacity: demoEditorSaving || demoEditorLoading ? 0.65 : 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {demoEditorSaving ? <Loader2 size={12} style={{ animation: 'spin 0.7s linear infinite' }} /> : <Save size={12} />}
                  Salveaza demo
                </button>
              </div>
            </div>

            {demoEditorLoading || !demoEditorData ? (
              <div style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 8, color: '#6b7280', fontSize: 12 }}>
                <Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} />
                Se incarca editorul demo...
              </div>
            ) : (
              <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
                  <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: '#111' }}>Date generale demo</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 8, marginTop: 10 }}>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 10, color: '#6b7280', fontWeight: 700 }}>
                        Tip eveniment
                        <select
                          value={demoEditorData.eventType}
                          onChange={(e) => {
                            const nextType = normalizeDemoEventType(e.target.value);
                            setDemoEditorData((prev) => {
                              if (!prev) return prev;
                              return {
                                ...prev,
                                eventType: nextType,
                                demoProfile: {
                                  ...prev.demoProfile,
                                  eventType: nextType,
                                  ...(nextType === 'wedding' ? {} : { partner2Name: '' }),
                                },
                              };
                            });
                          }}
                          style={{ borderRadius: 8, border: '1px solid #e5e7eb', padding: '6px 8px', fontSize: 12, color: '#111' }}
                        >
                          <option value="wedding">Wedding</option>
                          <option value="baptism">Botez</option>
                          <option value="anniversary">Aniversare</option>
                          <option value="office">Office</option>
                        </select>
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 10, color: '#6b7280', fontWeight: 700 }}>
                        Nume principal
                        <input
                          value={String(demoEditorData.demoProfile.partner1Name || '')}
                          onChange={(e) => updateDemoProfileField('partner1Name', e.target.value)}
                          style={{ borderRadius: 8, border: '1px solid #e5e7eb', padding: '6px 8px', fontSize: 12, color: '#111' }}
                        />
                      </label>
                      {demoEditorData.eventType === 'wedding' && (
                        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 10, color: '#6b7280', fontWeight: 700 }}>
                          Al doilea nume
                          <input
                            value={String(demoEditorData.demoProfile.partner2Name || '')}
                            onChange={(e) => updateDemoProfileField('partner2Name', e.target.value)}
                            style={{ borderRadius: 8, border: '1px solid #e5e7eb', padding: '6px 8px', fontSize: 12, color: '#111' }}
                          />
                        </label>
                      )}
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 10, color: '#6b7280', fontWeight: 700 }}>
                        Data
                        <input
                          type="date"
                          value={String(demoEditorData.demoProfile.weddingDate || '').slice(0, 10)}
                          onChange={(e) => updateDemoProfileField('weddingDate', e.target.value)}
                          style={{ borderRadius: 8, border: '1px solid #e5e7eb', padding: '6px 8px', fontSize: 12, color: '#111' }}
                        />
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 10, color: '#6b7280', fontWeight: 700 }}>
                        Ora
                        <input
                          type="time"
                          value={String(demoEditorData.demoProfile.eventTime || '')}
                          onChange={(e) => updateDemoProfileField('eventTime', e.target.value)}
                          style={{ borderRadius: 8, border: '1px solid #e5e7eb', padding: '6px 8px', fontSize: 12, color: '#111' }}
                        />
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 10, color: '#6b7280', fontWeight: 700 }}>
                        Locatie
                        <input
                          value={String(demoEditorData.demoProfile.locationName || '')}
                          onChange={(e) => updateDemoProfileField('locationName', e.target.value)}
                          style={{ borderRadius: 8, border: '1px solid #e5e7eb', padding: '6px 8px', fontSize: 12, color: '#111' }}
                        />
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 10, color: '#6b7280', fontWeight: 700 }}>
                        Adresa
                        <input
                          value={String(demoEditorData.demoProfile.locationAddress || '')}
                          onChange={(e) => updateDemoProfileField('locationAddress', e.target.value)}
                          style={{ borderRadius: 8, border: '1px solid #e5e7eb', padding: '6px 8px', fontSize: 12, color: '#111' }}
                        />
                      </label>
                    </div>
                  </div>

                  <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: '#111' }}>Texte intro demo</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8, marginTop: 10 }}>
                      {[
                        ['castleIntroWelcome', 'Intro welcome'],
                        ['castleIntroSubtitle', 'Intro subtitle'],
                        ['castleInviteTop', 'Text intro sus'],
                        ['castleInviteBottom', 'Text intro jos'],
                        ['jungleOverlayText', 'Overlay luxury/jungle'],
                      ].map(([field, label]) => (
                        <label key={field} style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 10, color: '#6b7280', fontWeight: 700 }}>
                          {label}
                          <input
                            value={String(demoEditorData.demoProfile[field] || '')}
                            onChange={(e) => updateDemoProfileField(field, e.target.value)}
                            style={{ borderRadius: 8, border: '1px solid #e5e7eb', padding: '6px 8px', fontSize: 12, color: '#111' }}
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: '#111' }}>Sectiuni demo ({demoEditorData.demoCustomSections.length})</p>
                      <button
                        type="button"
                        onClick={resetDemoSectionsToDefault}
                        style={{ borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', color: '#374151', fontSize: 10, fontWeight: 700, padding: '6px 8px', cursor: 'pointer' }}
                      >
                        Reset default blocks
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                      {DEMO_BLOCK_LIBRARY.map((item) => (
                        <button
                          key={item.type}
                          type="button"
                          onClick={() => addDemoBlock(item.type)}
                          style={{ borderRadius: 999, border: '1px solid #dbeafe', background: '#eff6ff', color: '#1d4ed8', fontSize: 10, fontWeight: 700, padding: '5px 10px', cursor: 'pointer' }}
                        >
                          + {item.label}
                        </button>
                      ))}
                    </div>
                    <div style={{ marginTop: 10, maxHeight: 420, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 4 }}>
                      {demoEditorData.demoCustomSections.map((block, index) => (
                        <div key={`${String(block?.id || `idx-${index}`)}-${index}`} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 10, background: '#fff' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                            <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: '#111' }}>
                              #{index + 1} · {String(block?.type || 'block')}
                            </p>
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button type="button" onClick={() => moveDemoBlock(index, -1)} style={{ borderRadius: 6, border: '1px solid #e5e7eb', background: 'white', fontSize: 10, fontWeight: 700, padding: '3px 6px', cursor: 'pointer' }}>↑</button>
                              <button type="button" onClick={() => moveDemoBlock(index, 1)} style={{ borderRadius: 6, border: '1px solid #e5e7eb', background: 'white', fontSize: 10, fontWeight: 700, padding: '3px 6px', cursor: 'pointer' }}>↓</button>
                              <button type="button" onClick={() => removeDemoBlock(index)} style={{ borderRadius: 6, border: '1px solid #fee2e2', background: '#fff', color: '#dc2626', fontSize: 10, fontWeight: 700, padding: '3px 6px', cursor: 'pointer' }}>Sterge</button>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 6, marginTop: 8 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#374151', fontWeight: 700 }}>
                              <input
                                type="checkbox"
                                checked={block?.show !== false}
                                onChange={(e) => updateDemoBlock(index, { show: e.target.checked })}
                              />
                              Vizibil
                            </label>
                            <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 10, color: '#6b7280', fontWeight: 700 }}>
                              ID block
                              <input
                                value={String(block?.id || '')}
                                onChange={(e) => updateDemoBlock(index, { id: e.target.value })}
                                style={{ borderRadius: 6, border: '1px solid #e5e7eb', padding: '5px 7px', fontSize: 11, color: '#111' }}
                              />
                            </label>
                          </div>

                          {String(block?.type) === 'text' && (
                            <label style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 6, fontSize: 10, color: '#6b7280', fontWeight: 700 }}>
                              Continut
                              <textarea
                                value={String(block?.content || '')}
                                onChange={(e) => updateDemoBlock(index, { content: e.target.value })}
                                rows={3}
                                style={{ borderRadius: 6, border: '1px solid #e5e7eb', padding: '6px 8px', fontSize: 11, color: '#111', resize: 'vertical' }}
                              />
                            </label>
                          )}

                          {String(block?.type) === 'photo' && (
                            <div style={{ marginTop: 6, display: 'grid', gridTemplateColumns: '120px minmax(0,1fr)', gap: 8 }}>
                              <div style={{ borderRadius: 8, border: '1px dashed #d1d5db', height: 120, overflow: 'hidden', background: '#f9fafb', position: 'relative' }}>
                                {block?.imageData ? (
                                  <img src={String(block.imageData)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#9ca3af', fontWeight: 700 }}>
                                    Fara imagine
                                  </div>
                                )}
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <input
                                  value={String(block?.imageData || '')}
                                  onChange={(e) => updateDemoBlock(index, { imageData: e.target.value })}
                                  placeholder="/uploads/...jpg"
                                  style={{ borderRadius: 6, border: '1px solid #e5e7eb', padding: '6px 8px', fontSize: 11, color: '#111' }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const key = `${demoEditorData.templateId}:${index}`;
                                    demoPhotoInputRefs.current[key]?.click();
                                  }}
                                  style={{ borderRadius: 6, border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', fontSize: 10, fontWeight: 700, padding: '6px 8px', cursor: 'pointer', alignSelf: 'flex-start' }}
                                >
                                  Upload imagine
                                </button>
                                <input
                                  ref={(el) => {
                                    const key = `${demoEditorData.templateId}:${index}`;
                                    demoPhotoInputRefs.current[key] = el;
                                  }}
                                  type="file"
                                  accept="image/*"
                                  style={{ display: 'none' }}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) void uploadDemoPhotoForBlock(index, file);
                                    e.target.value = '';
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {String(block?.type) === 'location' && (
                            <div style={{ marginTop: 6, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 6 }}>
                              {[
                                ['label', 'Label'],
                                ['time', 'Ora'],
                                ['locationName', 'Nume locatie'],
                                ['locationAddress', 'Adresa'],
                                ['wazeLink', 'Waze link'],
                                ['mapsLink', 'Maps link'],
                              ].map(([field, label]) => (
                                <label key={field} style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 10, color: '#6b7280', fontWeight: 700 }}>
                                  {label}
                                  <input
                                    value={String(block?.[field] || '')}
                                    onChange={(e) => updateDemoBlock(index, { [field]: e.target.value })}
                                    style={{ borderRadius: 6, border: '1px solid #e5e7eb', padding: '5px 7px', fontSize: 11, color: '#111' }}
                                  />
                                </label>
                              ))}
                            </div>
                          )}

                          {String(block?.type) === 'countdown' && (
                            <label style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 6, fontSize: 10, color: '#6b7280', fontWeight: 700 }}>
                              Titlu countdown
                              <input
                                value={String(block?.countdownTitle || '')}
                                onChange={(e) => updateDemoBlock(index, { countdownTitle: e.target.value })}
                                style={{ borderRadius: 6, border: '1px solid #e5e7eb', padding: '5px 7px', fontSize: 11, color: '#111' }}
                              />
                            </label>
                          )}

                          {String(block?.type) === 'rsvp' && (
                            <label style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 6, fontSize: 10, color: '#6b7280', fontWeight: 700 }}>
                              Text buton RSVP
                              <input
                                value={String(block?.label || '')}
                                onChange={(e) => updateDemoBlock(index, { label: e.target.value })}
                                style={{ borderRadius: 6, border: '1px solid #e5e7eb', padding: '5px 7px', fontSize: 11, color: '#111' }}
                              />
                            </label>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
                  <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: '#111' }}>Invitat demo</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8, marginTop: 10 }}>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 10, color: '#6b7280', fontWeight: 700 }}>
                        Nume invitat
                        <input
                          value={String(demoEditorData.demoGuest.name || '')}
                          onChange={(e) => updateDemoGuestField('name', e.target.value)}
                          style={{ borderRadius: 8, border: '1px solid #e5e7eb', padding: '6px 8px', fontSize: 12, color: '#111' }}
                        />
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 10, color: '#6b7280', fontWeight: 700 }}>
                        Tip invitat
                        <select
                          value={String(demoEditorData.demoGuest.type || 'adult')}
                          onChange={(e) => updateDemoGuestField('type', e.target.value)}
                          style={{ borderRadius: 8, border: '1px solid #e5e7eb', padding: '6px 8px', fontSize: 12, color: '#111' }}
                        >
                          <option value="adult">Adult</option>
                          <option value="couple">Cuplu</option>
                          <option value="family">Familie</option>
                          <option value="child">Copil</option>
                        </select>
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 10, color: '#6b7280', fontWeight: 700 }}>
                        Status invitat
                        <select
                          value={String(demoEditorData.demoGuest.status || 'pending')}
                          onChange={(e) => updateDemoGuestField('status', e.target.value)}
                          style={{ borderRadius: 8, border: '1px solid #e5e7eb', padding: '6px 8px', fontSize: 12, color: '#111' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="declined">Declined</option>
                        </select>
                      </label>
                    </div>
                  </div>

                  <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: '#111' }}>Imagini hero demo</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginTop: 10 }}>
                      {[
                        ['heroBgImage', 'Hero Desktop'],
                        ['heroBgImageMobile', 'Hero Mobile'],
                      ].map(([field, label]) => (
                        <div key={field} style={{ border: '1px solid #eef2f7', borderRadius: 10, padding: 8 }}>
                          <p style={{ margin: 0, fontSize: 10, color: '#6b7280', fontWeight: 700 }}>{label}</p>
                          <div style={{ marginTop: 6, borderRadius: 8, border: '1px dashed #d1d5db', height: 96, overflow: 'hidden', position: 'relative', background: '#f9fafb' }}>
                            {demoEditorData.demoProfile[field] ? (
                              <img src={String(demoEditorData.demoProfile[field])} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#9ca3af', fontWeight: 700 }}>
                                Fara imagine
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                            <button
                              type="button"
                              onClick={() => {
                                const key = `${demoEditorData.templateId}:${field}`;
                                demoHeroInputRefs.current[key]?.click();
                              }}
                              style={{ borderRadius: 6, border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', fontSize: 10, fontWeight: 700, padding: '6px 8px', cursor: 'pointer' }}
                            >
                              Upload
                            </button>
                            <button
                              type="button"
                              onClick={() => updateDemoProfileField(field, '')}
                              style={{ borderRadius: 6, border: '1px solid #fee2e2', background: '#fff', color: '#dc2626', fontSize: 10, fontWeight: 700, padding: '6px 8px', cursor: 'pointer' }}
                            >
                              Sterge
                            </button>
                            <input
                              ref={(el) => {
                                const key = `${demoEditorData.templateId}:${field}`;
                                demoHeroInputRefs.current[key] = el;
                              }}
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file && (field === 'heroBgImage' || field === 'heroBgImageMobile')) {
                                  void uploadDemoProfileImage(field, file);
                                }
                                e.target.value = '';
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Mini Image Field ──────────────────────────────────────────────────────────
const MiniImageField: React.FC<{
  label: string;
  url?: string;
  aspect: string;
  accentColor: string;
  width?: number;
  onUpload: (url: string) => void;
  onRemove: () => void;
}> = ({ label, url, aspect, accentColor, width, onUpload, onRemove }) => {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tok()}` },
        body: form,
      });
      const { url: newUrl } = await res.json();
      onUpload(newUrl);
    } catch (e) { console.error(e); }
    finally { setUploading(false); }
  };

  return (
    <div style={{ width: width ? `${width}px` : '100%' }}>
      <p style={{ margin: '0 0 4px', fontSize: 9, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
      <div
        className="img-field-hover"
        style={{ position: 'relative', paddingTop: aspect, borderRadius: 8, overflow: 'hidden', border: `1.5px dashed ${url ? accentColor + '66' : '#e5e7eb'}`, background: url ? 'transparent' : '#f9fafb', cursor: 'pointer', transition: 'border-color 0.15s' }}
        onClick={() => !url && ref.current?.click()}
        onDragOver={e => { e.preventDefault(); (e.currentTarget as HTMLDivElement).style.borderColor = accentColor; }}
        onDragLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = url ? accentColor + '66' : '#e5e7eb'; }}
        onDrop={e => { e.preventDefault(); (e.currentTarget as HTMLDivElement).style.borderColor = url ? accentColor + '66' : '#e5e7eb'; const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}>
        {url ? (
          <>
            <img src={url} alt={label} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            <div className="img-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, transition: 'all 0.15s' }}>
              <button type="button" onClick={e => { e.stopPropagation(); ref.current?.click(); }}
                style={{ opacity: 0, background: 'white', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 10, fontWeight: 700, transition: 'opacity 0.15s' }}>
                ✎
              </button>
              <button type="button" onClick={e => { e.stopPropagation(); onRemove(); }}
                style={{ opacity: 0, background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 10, fontWeight: 700, transition: 'opacity 0.15s', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Trash2 size={9} />
              </button>
            </div>
          </>
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            {uploading
              ? <Loader2 size={14} style={{ color: accentColor, animation: 'spin 0.7s linear infinite' }} />
              : <><Upload size={14} style={{ color: '#d1d5db' }} />{!width && <span style={{ fontSize: 9, color: '#d1d5db', fontWeight: 600 }}>Upload</span>}</>
            }
          </div>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
    </div>
  );
};

// ── Mini Video Field ──────────────────────────────────────────────────────────
const MiniVideoField: React.FC<{
  url?: string;
  accentColor: string;
  onUpload: (url: string) => void;
  onRemove: () => void;
}> = ({ url, accentColor, onUpload, onRemove }) => {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('video/')) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tok()}` },
        body: form,
      });
      const { url: newUrl } = await res.json();
      onUpload(newUrl);
    } catch (e) { console.error(e); }
    finally { setUploading(false); }
  };

  return (
    <div>
      <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: '#6b7280' }}>
        🎬 Video Intro — apare in locul imaginii de fundal
      </p>
      <div
        className="img-field-hover"
        style={{ position: 'relative', paddingTop: '56.25%', borderRadius: 12, overflow: 'hidden', border: `2px dashed ${url ? accentColor + '88' : '#e5e7eb'}`, background: url ? 'black' : '#f9fafb', cursor: url ? 'default' : 'pointer', transition: 'border-color 0.15s' }}
        onClick={() => !url && ref.current?.click()}
      >
        {url ? (
          <>
            <video
              src={url} autoPlay muted loop playsInline
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div className="img-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.15s' }}>
              <button type="button" onClick={e => { e.stopPropagation(); ref.current?.click(); }}
                style={{ opacity: 0, background: 'white', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 11, fontWeight: 700, transition: 'opacity 0.15s' }}>
                ✎ Inlocuieste
              </button>
              <button type="button" onClick={e => { e.stopPropagation(); onRemove(); }}
                style={{ opacity: 0, background: '#ef4444', color: 'white', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 11, fontWeight: 700, transition: 'opacity 0.15s', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Trash2 size={11} /> Sterge
              </button>
            </div>
          </>
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {uploading
              ? <Loader2 size={20} style={{ color: accentColor, animation: 'spin 0.7s linear infinite' }} />
              : <>
                  <Upload size={20} style={{ color: '#d1d5db' }} />
                  <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>Click sau drag & drop — .mp4</span>
                </>
            }
          </div>
        )}
      </div>
      <input ref={ref} type="file" accept="video/mp4,video/*" style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
    </div>
  );
};

export default TemplateManagement;



