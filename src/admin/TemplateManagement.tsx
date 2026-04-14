import React, { useState, useEffect, useRef } from 'react';
import { Save, Upload, Check, Loader2, Trash2, ChevronDown, ChevronUp, RefreshCw, Plus } from 'lucide-react';
import { CASTLE_THEMES, GIRL_THEMES, BOY_THEMES, getCastleTheme, getLordTheme, CastleColorTheme, ROMANTIC_THEMES, LORD_MONO_THEMES, JURASSIC_BOY_THEMES, JURASSIC_GIRL_THEMES, getJurassicTheme, ZOOTROPOLIS_BOY_THEMES, ZOOTROPOLIS_GIRL_THEMES, getZootropolisTheme, MERMAID_BOY_THEMES, MERMAID_GIRL_THEMES, getMermaidTheme } from '../components/invitations/castleDefaults';
import { templates as hardcodedTemplates } from '../components/invitations/registry';
import { TemplateVisibilityStatus } from '../components/invitations/types';
import { API_URL } from '../config/api';

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
  source: 'built-in' | 'dynamic';
}

// ── Template-uri ──────────────────────────────────────────────────────────────
const VARIANTS = [
  { id: 'castle-magic',      label: 'Castle Magic',   emoji: '🏰', color: '#be185d', bg: '#fdf2f8', desc: 'Versiunea clasica roz pentru botez' },
  { id: 'castle-magic-boys', label: 'Boy Castle',     emoji: '🏯', color: '#1d4ed8', bg: '#eff6ff', desc: 'Versiunea pentru baieti' },
  { id: 'castle-magic-girl', label: 'Girl Castle',    emoji: '🌸', color: '#7c3aed', bg: '#faf5ff', desc: 'Versiunea pentru fete' },
  { id: 'lord-effects',      label: 'Lord Effects',   emoji: '👑', color: '#1d4ed8', bg: '#eff6ff', desc: 'Varianta Lord Effects cu imagini per tema' },
  { id: 'romantic', label: 'Romantic',    emoji: '🌸', color: '#7f0000', bg: '#faf5ff', desc: 'Versiunea pentru fete' },
  { id: 'regal',         label: 'Regal',        emoji: '👑', color: '#92400e', bg: '#fffbeb', desc: 'Template royal cu video intro' },
  { id: 'jurassic-park', label: 'Jurassic Park', emoji: '🦕', color: '#c87820', bg: '#fdf8ec', desc: 'Aventura jurasica — teme baieti & fete' },
  { id: 'zootropolis',   label: 'Zootropolis',   emoji: '🦊', color: '#E85D04', bg: '#fff7ed', desc: 'Metropola animala — teme baieti & fete' },
  { id: 'little-mermaid', label: 'Little Mermaid', emoji: '🧜‍♀', color: '#92400e', bg: '#fffbeb', desc: 'Template Mica Sirena cu video intro' },
];

const emptyConfig = (): VariantConfig => ({ colorTheme: 'default', themeImages: {}, introVariants: {} });

// ── Component ─────────────────────────────────────────────────────────────────
const TemplateManagement: React.FC = () => {
  const [configs,  setConfigs]  = useState<AllConfigs>({});
  const [loading,  setLoading]  = useState<Record<string, boolean>>({});
  const [saving,   setSaving]   = useState<Record<string, boolean>>({});
  const [saved,    setSaved]    = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    'castle-magic': true, 'castle-magic-boys': true, 'castle-magic-girl': true, 'lord-effects': true, 'jurassic-park': true, 'zootropolis': true,'little-mermaid': true,
  });
  const [marketplaceTemplates, setMarketplaceTemplates] = useState<MarketplaceTemplateItem[]>([]);
  const [templateVisibility, setTemplateVisibility] = useState<TemplateStatusMap>({});
  const [visibilityLoading, setVisibilityLoading] = useState(true);
  const [visibilitySaving, setVisibilitySaving] = useState<Record<string, boolean>>({});

  // ── Load all variants on mount ─────────────────────────────────────────────
  useEffect(() => {
    VARIANTS.forEach(v => loadVariant(v.id));
    loadTemplateVisibility();
  }, []);

  const normalizeTemplateStatus = (value: any): TemplateVisibilityStatus =>
    value === 'coming_soon' ? 'coming_soon' : 'live';

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
        });
      });

      dynamicTemplates.forEach((tpl: any) => {
        if (!tpl?.id || merged.has(tpl.id)) return;
        merged.set(tpl.id, {
          id: tpl.id,
          name: tpl.name || tpl.id,
          category: tpl.category,
          source: 'dynamic',
        });
      });

      setMarketplaceTemplates(
        Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name, 'ro'))
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
      const r = await fetch(`${API_URL}/admin/config/template-defaults/${id}`, {
        headers: { Authorization: `Bearer ${tok()}` },
      });
      const d = r.ok ? await r.json() : {};
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
      await fetch(`${API_URL}/admin/config/template-defaults/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok()}` },
        body: JSON.stringify({
          colorTheme:          cfg.colorTheme,
          themeImages:         cfg.themeImages,
          heroBgImage:         defaultImgs.desktop || null,
          heroBgImageMobile:   defaultImgs.mobile  || null,
          videoUrl:            cfg.videoUrl || null,
          introVariants:       cfg.introVariants || {},
          defaultIntroVariant: cfg.defaultIntroVariant || null,
        }),
      });
      setSaved(prev => ({ ...prev, [id]: true }));
      setTimeout(() => setSaved(prev => ({ ...prev, [id]: false })), 2500);
    } catch (e) { console.error(e); }
    finally { setSaving(prev => ({ ...prev, [id]: false })); }
  };

  const resetVariant = async (id: string) => {
    const variant = VARIANTS.find(v => v.id === id);
    if (!window.confirm(`Resetezi toate imaginile si config-ul pentru "${variant?.label}"?

Fisierele vor fi sterse permanent.`)) return;
    setLoading(prev => ({ ...prev, [id]: true }));
    try {
      const r = await fetch(`${API_URL}/admin/config/template-defaults/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${tok()}` },
      });
      const d = await r.json();
      setConfigs(prev => ({ ...prev, [id]: emptyConfig() }));
      alert(`✅ Reset complet. ${d.deleted || 0} fisiere sterse.`);
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
        </div>

        {visibilityLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6b7280', fontSize: 12 }}>
            <Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} />
            Se incarca lista de template-uri...
          </div>
        ) : marketplaceTemplates.length === 0 ? (
          <div style={{ fontSize: 12, color: '#6b7280' }}>Nu am gasit template-uri pentru gestionare status.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
            {marketplaceTemplates.map((tpl) => {
              const status = templateVisibility[tpl.id] === 'coming_soon' ? 'coming_soon' : 'live';
              const isSavingStatus = !!visibilitySaving[tpl.id];
              return (
                <div key={tpl.id} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', background: '#fff' }}>
                  <div style={{ marginBottom: 8 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#111', lineHeight: 1.2 }}>{tpl.name}</p>
                    <p style={{ margin: '3px 0 0', fontSize: 10, color: '#9ca3af', fontFamily: 'monospace' }}>
                      {tpl.id} {tpl.source === 'dynamic' ? '- custom' : '- built-in'}
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
        const isExpanded = expanded[variant.id] !== false;
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
                  {variant.desc} · Tema implicita: <strong style={{ color: variant.color }}>{variant.id === 'lord-effects' ? getLordTheme(cfg.colorTheme).emoji : variant.id === 'jurassic-park' ? getJurassicTheme(cfg.colorTheme).emoji : variant.id === 'zootropolis' ? getZootropolisTheme(cfg.colorTheme).emoji : variant.id === 'little-mermaid' ? getMermaidTheme(cfg.colorTheme).emoji : getCastleTheme(cfg.colorTheme).emoji} {variant.id === 'lord-effects' ? getLordTheme(cfg.colorTheme).name : variant.id === 'jurassic-park' ? getJurassicTheme(cfg.colorTheme).name : variant.id === 'zootropolis' ? getZootropolisTheme(cfg.colorTheme).name : variant.id === 'little-mermaid' ? getMermaidTheme(cfg.colorTheme).name : getCastleTheme(cfg.colorTheme).name}</strong>
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
            <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 8 }}>— utilizatorul alege varianta preferata din Settings</span>
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
            : variant.id === 'castle-magic-boys'
            ? BOY_THEMES
            : variant.id === 'castle-magic-girl'
                ? GIRL_THEMES
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



