import React, { useState, useEffect, useRef, useCallback } from "react";
import { InvitationTemplateProps, TemplateMeta } from "../invitations/types";
import { InvitationBlock, InvitationBlockType } from "../../types";
import { InlineEdit, InlineTime } from "../invitations/InlineEdit";
import { BlockStyleProvider, BlockStyle } from "../BlockStyleContext";
import { WeddingIcon } from "../TimelineIcons";
import { TimelineInsertButton } from "../invitations/TimelineInsertButton";
import {
  ChevronUp, ChevronDown, Eye, EyeOff, Trash2, Upload, Camera,
  Play, Pause, SkipForward, SkipBack, Gift, Music, MessageCircle, MapPin,
} from "lucide-react";
import { API_URL } from "../../config/api";

// ─────────────────────────────────────────────────────────────────────────────
// META
// ─────────────────────────────────────────────────────────────────────────────
export const meta: TemplateMeta = {
  id: "maison-wedding",
  name: "Eiffel Romance",
  category: "wedding",
  description: "Eleganță modernă — tipografie rafinată, paletă de crem și aur, design curat pentru cupluri cu gust impecabil.",
  colors: ["#1a1a1a", "#c9a96e", "#f5f0e8", "#ffffff"],
  previewClass: "bg-stone-100 border-amber-600",
  elementsClass: "bg-amber-700",
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function deleteUploadedFile(url: string | undefined) {
  if (!url || !url.startsWith("/uploads/")) return;
  const _s = JSON.parse(localStorage.getItem("weddingPro_session") || "{}");
  fetch(`${API_URL}/upload`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${_s?.token || ""}` },
    body: JSON.stringify({ url }),
  }).catch(() => {});
}

// ─────────────────────────────────────────────────────────────────────────────
// PALETTE
// ─────────────────────────────────────────────────────────────────────────────
type MaisonTheme = {
  id: string;
  name: string;
  emoji: string;
  ink: string;
  inkLight: string;
  gold: string;
  goldLight: string;
  goldDark: string;
  cream: string;
  creamD: string;
  ivory: string;
  blush: string;
  rose: string;
  sage: string;
  white: string;
  muted: string;
  mutedL: string;
};

export const MAISON_WEDDING_THEMES: MaisonTheme[] = [
  {
    id: "default",
    name: "Ivory Gold",
    emoji: "🥂",
    ink: "#1c1c1c",
    inkLight: "#3d3d3d",
    gold: "#c9a96e",
    goldLight: "#dfc28f",
    goldDark: "#a07c45",
    cream: "#f8f4ed",
    creamD: "#f0ead8",
    ivory: "#fdfaf5",
    blush: "#e8d5cb",
    rose: "#b07070",
    sage: "#8a9e8a",
    white: "#ffffff",
    muted: "rgba(28,28,28,0.42)",
    mutedL: "rgba(28,28,28,0.22)",
  },
  {
    id: "powder-rose",
    name: "Powder Rose",
    emoji: "🌷",
    ink: "#241c22",
    inkLight: "#4a3f47",
    gold: "#bb7c8c",
    goldLight: "#d7a9b4",
    goldDark: "#935c69",
    cream: "#fcf4f6",
    creamD: "#f2dfe5",
    ivory: "#fff9fb",
    blush: "#efd0d8",
    rose: "#a35c73",
    sage: "#a7b7ab",
    white: "#ffffff",
    muted: "rgba(36,28,34,0.44)",
    mutedL: "rgba(36,28,34,0.22)",
  },
  {
    id: "sage-pearl",
    name: "Sage Pearl",
    emoji: "🌿",
    ink: "#1d2620",
    inkLight: "#425248",
    gold: "#7f9c88",
    goldLight: "#aac4b1",
    goldDark: "#5c7564",
    cream: "#f3f6f1",
    creamD: "#dfe9df",
    ivory: "#fbfdf9",
    blush: "#dde6dc",
    rose: "#7a8f7d",
    sage: "#6c8a73",
    white: "#ffffff",
    muted: "rgba(29,38,32,0.43)",
    mutedL: "rgba(29,38,32,0.2)",
  },
  {
    id: "noir-champagne",
    name: "Noir Champagne",
    emoji: "🖤",
    ink: "#121013",
    inkLight: "#342d36",
    gold: "#d5b16c",
    goldLight: "#ead5a4",
    goldDark: "#ac8341",
    cream: "#f5eee3",
    creamD: "#e5d4bd",
    ivory: "#fffaf1",
    blush: "#dfcfbf",
    rose: "#8d7564",
    sage: "#8a8f84",
    white: "#ffffff",
    muted: "rgba(18,16,19,0.48)",
    mutedL: "rgba(18,16,19,0.24)",
  },
  {
    id: "velvet-plum",
    name: "Velvet Plum",
    emoji: "🍷",
    ink: "#21151d",
    inkLight: "#4c3240",
    gold: "#b25a77",
    goldLight: "#da8da8",
    goldDark: "#8a3f59",
    cream: "#fbf3f7",
    creamD: "#efdce6",
    ivory: "#fffafe",
    blush: "#edd0dd",
    rose: "#8f516b",
    sage: "#8e9d97",
    white: "#ffffff",
    muted: "rgba(33,21,29,0.45)",
    mutedL: "rgba(33,21,29,0.2)",
  },
  {
    id: "terracotta-sunset",
    name: "Terracotta Sunset",
    emoji: "🌅",
    ink: "#2a1c18",
    inkLight: "#5b4138",
    gold: "#c76f4f",
    goldLight: "#e6a486",
    goldDark: "#9f5034",
    cream: "#fbf1ea",
    creamD: "#efd8cb",
    ivory: "#fff8f3",
    blush: "#f0d6c9",
    rose: "#b56a56",
    sage: "#a59783",
    white: "#ffffff",
    muted: "rgba(42,28,24,0.44)",
    mutedL: "rgba(42,28,24,0.2)",
  },
];

export const getMaisonWeddingTheme = (id?: string): MaisonTheme =>
  MAISON_WEDDING_THEMES.find((theme) => theme.id === String(id || "").trim()) ||
  MAISON_WEDDING_THEMES[0];

let C = { ...MAISON_WEDDING_THEMES[0] };

const rgba = (hex: string, a: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
};

// ─────────────────────────────────────────────────────────────────────────────
// FONTS
// ─────────────────────────────────────────────────────────────────────────────
const F = {
  serif   : "'Cormorant Garamond','Garamond',serif",
  display : "'Playfair Display','Georgia',serif",
  sans    : "'Jost','Inter',sans-serif",
  script  : "'Cormorant Garamond','Garamond',serif",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// IMAGE PATHS
// ─────────────────────────────────────────────────────────────────────────────
const IMG = {
  // Backgrounds
  heroBg      : "/maison/hero-bg.jpg",         // Imagine subtila florar / texture
  heroBgAlt   : "/maison/hero-bg-alt.jpg",     // Alternativa
  // Florals / ornaments
  floral1     : "/maison/floral-tl.png",       // Floral colt stanga-sus
  floral2     : "/maison/floral-tr.png",       // Floral colt dreapta-sus (mirror)
  floral3     : "/maison/floral-b.png",        // Floral jos centru
  floralDivider : "/maison/floral-divider.png", // Divider floral orizontal
  floralSm1   : "/maison/floral-sm-1.png",    // Floral mic stanga
  floralSm2   : "/maison/floral-sm-2.png",    // Floral mic dreapta
  // Deco
  rings       : "/maison/wedding-rings.png",   // Verighete
  dove        : "/maison/dove.png",            // Porumbel
  leaf1       : "/maison/leaf-1.png",          // Frunza stanga
  leaf2       : "/maison/leaf-2.png",          // Frunza dreapta
  monogram    : "/maison/monogram-frame.png",  // Rama monogram
  // Location stickers
  church      : "/maison/church-icon.png",     // Iconita biserica
  venue       : "/maison/venue-icon.png",      // Iconita restaurant
};

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL CSS
// ─────────────────────────────────────────────────────────────────────────────
const W_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500&family=Jost:wght@300;400;500;600&display=swap');

  @keyframes w-float    { 0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)} }
  @keyframes w-pulse    { 0%,100%{opacity:.85;transform:scale(1)}50%{opacity:1;transform:scale(1.03)} }
  @keyframes w-shimmer  { 0%{background-position:-200% 0}100%{background-position:200% 0} }
  @keyframes w-fadeUp   { from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)} }
  @keyframes w-twinkle  { 0%,100%{opacity:.25;transform:scale(.7)}50%{opacity:.85;transform:scale(1.1)} }
  @keyframes w-reveal   { from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0% 0 0)} }
  @keyframes w-bar      { 0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)} }
  @keyframes w-rings    { 0%,100%{transform:rotate(-2deg) scale(1)}50%{transform:rotate(2deg) scale(1.04)} }
  @keyframes w-fadeIn   { from{opacity:0}to{opacity:1} }
  @keyframes w-confetti { 0%{transform:translateY(-20px) rotate(0);opacity:1}100%{transform:translateY(110vh) rotate(540deg);opacity:0} }
`;

// ─────────────────────────────────────────────────────────────────────────────
// SCROLL REVEAL
// ─────────────────────────────────────────────────────────────────────────────
function useReveal<T extends HTMLElement>(threshold = 0.08): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, vis];
}

const Reveal: React.FC<{ children: React.ReactNode; delay?: number; from?: "bottom" | "fade"; style?: React.CSSProperties }> = ({ children, delay = 0, from = "bottom", style }) => {
  const [ref, vis] = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : from === "bottom" ? "translateY(22px)" : "translateY(0)",
      transition: `opacity .8s ${delay}s cubic-bezier(.22,1,.36,1), transform .8s ${delay}s cubic-bezier(.22,1,.36,1)`,
      ...style,
    }}>{children}</div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ORNAMENTAL DIVIDER  — thin gold line with central ornament
// ─────────────────────────────────────────────────────────────────────────────
const GoldDivider: React.FC<{ ornament?: string; thin?: boolean; style?: React.CSSProperties }> = ({ ornament = "◆", thin = false, style }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14, ...style }}>
    <div style={{ flex: 1, height: thin ? .5 : 1, background: `linear-gradient(to right, transparent, ${rgba(C.gold, .45)})` }} />
    {!thin && (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth: 52 }}>
        <img src={IMG.floralDivider} alt="" style={{ width: 100, height: 50, objectFit: "contain", opacity: .72, pointerEvents: "none" }} />
      </div>
    )}
    {thin && <span style={{ fontSize: 9, color: rgba(C.gold, .65), letterSpacing: 4, userSelect: "none" }}>{ornament}</span>}
    <div style={{ flex: 1, height: thin ? .5 : 1, background: `linear-gradient(to left, transparent, ${rgba(C.gold, .45)})` }} />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// ELEGANT CARD  — white card with thin gold border
// ─────────────────────────────────────────────────────────────────────────────
const ElegantCard: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
  accentTop?: boolean;
  floralDeco?: { src: string; side?: "left" | "right"; top?: number; size?: number };
  noPad?: boolean;
}> = ({ children, style, accentTop = true, floralDeco, noPad = false }) => (
  <div style={{ position: "relative" }}>
    {floralDeco && (
      <img src={floralDeco.src} alt="" style={{
        position: "absolute",
        top: floralDeco.top !== undefined ? floralDeco.top : -24,
        [floralDeco.side === "left" ? "left" : "right"]: -6,
        width: floralDeco.size || 80,
        objectFit: "contain",
        pointerEvents: "none",
        zIndex: 10,
        opacity: .85,
      }} />
    )}
    <div style={{
      background: `linear-gradient(180deg, ${C.ivory} 0%, ${C.cream} 100%)`,
      borderRadius: 4,
      border: `.5px solid ${rgba(C.gold, .34)}`,
      boxShadow: `0 18px 44px ${rgba(C.ink, .12)}, 0 4px 14px ${rgba(C.ink, .08)}`,
      position: "relative",
      overflow: "hidden",
      ...style,
    }}>
      {accentTop && (
        <div style={{ height: 2, background: `linear-gradient(90deg, transparent 0%, ${rgba(C.gold, .36)} 15%, ${C.gold} 40%, ${rgba(C.gold, .78)} 60%, ${rgba(C.gold, .36)} 85%, transparent 100%)` }} />
      )}
      {/* Subtle texture */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle at 1px 1px, ${rgba(C.gold, .035)} 1px, transparent 0)`, backgroundSize: "28px 28px", pointerEvents: "none" }} />
      <div style={{ position: "relative", padding: noPad ? 0 : "22px 26px 24px" }}>
        {children}
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// CONFETTI (champagne colored)
// ─────────────────────────────────────────────────────────────────────────────
const Confetto: React.FC<{ x: number; color: string; delay: number; size: number }> = ({ x, color, delay, size }) => (
  <div style={{ position: "fixed", left: `${x}%`, top: "-10px", width: size, height: size * 2.5, background: color, borderRadius: 1, animation: `w-confetti ${2.5 + Math.random() * 2}s ${delay}s linear forwards`, pointerEvents: "none", zIndex: 999, opacity: .8 }} />
);

// ─────────────────────────────────────────────────────────────────────────────
// CLIP SYSTEM
// ─────────────────────────────────────────────────────────────────────────────
type ClipShape = "rect" | "rounded" | "rounded-lg" | "squircle" | "circle" | "arch" | "arch-b" | "hexagon" | "diamond" | "triangle" | "star" | "heart" | "diagonal" | "diagonal-r" | "wave-b" | "wave-t" | "wave-both" | "blob" | "blob2" | "blob3" | "blob4";
type MaskEffect = "fade-b" | "fade-t" | "fade-l" | "fade-r" | "vignette";

function getClipStyle(clip: ClipShape): React.CSSProperties {
  const m: Record<ClipShape, React.CSSProperties> = {
    rect: { borderRadius: 0 }, rounded: { borderRadius: 8 }, "rounded-lg": { borderRadius: 16 },
    squircle: { borderRadius: "30% 30% 30% 30% / 30% 30% 30% 30%" }, circle: { borderRadius: "50%" },
    arch: { borderRadius: "50% 50% 0 0 / 40% 40% 0 0" }, "arch-b": { borderRadius: "0 0 50% 50% / 0 0 40% 40%" },
    hexagon: { clipPath: "polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%)" },
    diamond: { clipPath: "polygon(50% 0%,100% 50%,50% 100%,0% 50%)" },
    triangle: { clipPath: "polygon(50% 0%,100% 100%,0% 100%)" },
    star: { clipPath: "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)" },
    heart: { clipPath: "url(#w-clip-heart)" }, diagonal: { clipPath: "polygon(0 0,100% 0,100% 80%,0 100%)" },
    "diagonal-r": { clipPath: "polygon(0 0,100% 0,100% 100%,0 80%)" },
    "wave-b": { clipPath: "url(#w-clip-wave-b)" }, "wave-t": { clipPath: "url(#w-clip-wave-t)" },
    "wave-both": { clipPath: "url(#w-clip-wave-both)" },
    blob: { clipPath: "url(#w-clip-blob)" }, blob2: { clipPath: "url(#w-clip-blob2)" },
    blob3: { clipPath: "url(#w-clip-blob3)" }, blob4: { clipPath: "url(#w-clip-blob4)" },
  };
  return m[clip] || {};
}

function getMaskStyle(effects: MaskEffect[]): React.CSSProperties {
  if (!effects.length) return {};
  const layers = effects.map(e => {
    switch (e) {
      case "fade-b": return "linear-gradient(to bottom, black 40%, transparent 100%)";
      case "fade-t": return "linear-gradient(to top, black 40%, transparent 100%)";
      case "fade-l": return "linear-gradient(to left, black 40%, transparent 100%)";
      case "fade-r": return "linear-gradient(to right, black 40%, transparent 100%)";
      case "vignette": return "radial-gradient(ellipse 80% 80% at center, black 40%, transparent 100%)";
      default: return "none";
    }
  });
  const mask = layers.join(", ");
  return { WebkitMaskImage: mask, maskImage: mask, WebkitMaskComposite: effects.length > 1 ? "source-in" : "unset", maskComposite: effects.length > 1 ? "intersect" : "unset" };
}

const PhotoClipDefs: React.FC = () => (
  <svg width="0" height="0" style={{ position: "absolute", overflow: "hidden", pointerEvents: "none" }}>
    <defs>
      <clipPath id="w-clip-wave-b"   clipPathUnits="objectBoundingBox"><path d="M0,0 L1,0 L1,0.78 Q0.875,0.65 0.75,0.78 Q0.625,0.91 0.5,0.78 Q0.375,0.65 0.25,0.78 Q0.125,0.91 0,0.78 Z"/></clipPath>
      <clipPath id="w-clip-wave-t"   clipPathUnits="objectBoundingBox"><path d="M0,0.22 Q0.125,0.09 0.25,0.22 Q0.375,0.35 0.5,0.22 Q0.625,0.09 0.75,0.22 Q0.875,0.35 1,0.22 L1,1 L0,1 Z"/></clipPath>
      <clipPath id="w-clip-wave-both" clipPathUnits="objectBoundingBox"><path d="M0,0.22 Q0.125,0.09 0.25,0.22 Q0.375,0.35 0.5,0.22 Q0.625,0.09 0.75,0.22 Q0.875,0.35 1,0.22 L1,0.78 Q0.875,0.65 0.75,0.78 Q0.625,0.91 0.5,0.78 Q0.375,0.65 0.25,0.78 Q0.125,0.91 0,0.78 Z"/></clipPath>
      <clipPath id="w-clip-heart"    clipPathUnits="objectBoundingBox"><path d="M0.5,0.85 C0.5,0.85 0.05,0.55 0.05,0.3 C0.05,0.12 0.18,0.05 0.3,0.1 C0.4,0.14 0.5,0.25 0.5,0.25 C0.5,0.25 0.6,0.14 0.7,0.1 C0.82,0.05 0.95,0.12 0.95,0.3 C0.95,0.55 0.5,0.85 0.5,0.85Z"/></clipPath>
      <clipPath id="w-clip-blob"     clipPathUnits="objectBoundingBox"><path d="M0.5,0.03 C0.72,0.01 0.95,0.14 0.97,0.38 C0.99,0.58 0.88,0.78 0.72,0.88 C0.56,0.98 0.35,0.99 0.2,0.88 C0.05,0.77 -0.02,0.55 0.04,0.36 C0.1,0.17 0.28,0.05 0.5,0.03Z"/></clipPath>
      <clipPath id="w-clip-blob2"    clipPathUnits="objectBoundingBox"><path d="M0.75,0.224 C0.831,0.271 0.911,0.342 0.921,0.422 C0.93,0.502 0.869,0.59 0.808,0.661 C0.747,0.732 0.685,0.785 0.611,0.816 C0.538,0.847 0.453,0.856 0.389,0.824 C0.326,0.792 0.285,0.72 0.233,0.647 C0.181,0.573 0.119,0.497 0.113,0.414 C0.107,0.331 0.157,0.241 0.231,0.193 C0.305,0.145 0.402,0.138 0.493,0.147 C0.584,0.155 0.668,0.178 0.75,0.224Z"/></clipPath>
      <clipPath id="w-clip-blob3"    clipPathUnits="objectBoundingBox"><path d="M0.5,0.05 C0.65,0.02 0.85,0.1 0.92,0.28 C0.99,0.46 0.93,0.68 0.8,0.82 C0.67,0.96 0.46,1.0 0.3,0.93 C0.14,0.86 0.02,0.68 0.01,0.5 C0.0,0.32 0.1,0.14 0.25,0.07 C0.33,0.03 0.42,0.07 0.5,0.05Z"/></clipPath>
      <clipPath id="w-clip-blob4"    clipPathUnits="objectBoundingBox"><path d="M0.18,0.08 C0.32,0.01 0.54,0.0 0.68,0.08 C0.82,0.16 0.96,0.32 0.97,0.5 C0.98,0.68 0.86,0.86 0.7,0.93 C0.54,1.0 0.32,0.97 0.18,0.88 C0.04,0.79 -0.04,0.62 0.02,0.45 C0.07,0.28 0.04,0.15 0.18,0.08Z"/></clipPath>
    </defs>
  </svg>
);

const PhotoBlock: React.FC<{
  imageData?: string; altText?: string; editMode: boolean;
  onUpload: (url: string) => void; onRemove: () => void;
  onClipChange: (c: ClipShape) => void; onMasksChange: (m: MaskEffect[]) => void;
  onRatioChange: (r: "1:1" | "4:3" | "3:4" | "16:9" | "free") => void;
  aspectRatio?: "1:1" | "4:3" | "3:4" | "16:9" | "free";
  photoClip?: ClipShape; photoMasks?: MaskEffect[];
  placeholderText?: string;
}> = ({ imageData, altText, editMode, onUpload, onRemove, aspectRatio = "free", photoClip = "rect", photoMasks = [], placeholderText = "Fotografia Voastra" }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const pt: Record<string, string> = { "1:1": "100%", "4:3": "75%", "3:4": "133%", "16:9": "56.25%", free: "75%" };
  const combined = { ...getClipStyle(photoClip), ...getMaskStyle(photoMasks) };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setUploading(true); deleteUploadedFile(imageData);
    try {
      const form = new FormData(); form.append("file", file);
      const _s = JSON.parse(localStorage.getItem("weddingPro_session") || "{}");
      const res = await fetch(`${API_URL}/upload`, { method: "POST", headers: { Authorization: `Bearer ${_s?.token || ""}` }, body: form });
      const { url } = await res.json(); onUpload(url);
    } catch {} finally { setUploading(false); }
  };

  if (imageData) return (
    <div style={{ position: "relative" }}>
      <PhotoClipDefs />
      <div style={{ position: "relative", paddingTop: pt[aspectRatio], overflow: "hidden", ...combined }}>
        <img src={imageData} alt={altText || ""} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        {editMode && (
          <div className="absolute inset-0 bg-transparent opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2" style={{ background: "rgba(0,0,0,0)" }}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.35)" }} className="opacity-0 hover:opacity-100 transition-opacity" />
            <button onClick={() => fileRef.current?.click()} style={{ position: "relative", zIndex: 1, padding: 8, background: "white", borderRadius: "50%", border: "none", cursor: "pointer" }}><Camera className="w-5 h-5" style={{ color: C.gold }} /></button>
            <button onClick={() => { deleteUploadedFile(imageData); onRemove(); }} style={{ position: "relative", zIndex: 1, padding: 8, background: "white", borderRadius: "50%", border: "none", cursor: "pointer" }}><Trash2 className="w-5 h-5 text-red-500" /></button>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} style={{ display: "none" }} />
    </div>
  );

  return (
    <div style={{ position: "relative" }}>
      <PhotoClipDefs />
      <div style={{ position: "relative", paddingTop: pt[aspectRatio], ...combined, overflow: "hidden", cursor: editMode ? "pointer" : "default" }}
        onClick={editMode ? () => fileRef.current?.click() : undefined}>
        <div style={{ position: "absolute", inset: 0, background: C.creamD, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
          {uploading
            ? <div className="w-8 h-8 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
            : <>
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><rect x="4" y="8" width="32" height="24" rx="2" stroke={rgba(C.gold, .5)} strokeWidth="1"/><circle cx="14" cy="18" r="4" stroke={rgba(C.gold, .5)} strokeWidth="1"/><path d="M4 28 L12 20 L20 26 L28 18 L36 28" stroke={rgba(C.gold, .5)} strokeWidth="1" fill="none"/></svg>
                <p style={{ fontFamily: F.sans, fontSize: 11, color: rgba(C.ink, .35), margin: 0, letterSpacing: ".15em", textTransform: "uppercase" }}>{placeholderText}</p>
              </>
          }
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} style={{ display: "none" }} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CALENDAR
// ─────────────────────────────────────────────────────────────────────────────
const CalendarMonth: React.FC<{ date: string | undefined }> = ({ date }) => {
  if (!date) return null;
  const d = new Date(date), year = d.getFullYear(), month = d.getMonth(), day = d.getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNames = ["Ianuarie","Februarie","Martie","Aprilie","Mai","Iunie","Iulie","August","Septembrie","Octombrie","Noiembrie","Decembrie"];
  const dayLabels = ["L","M","M","J","V","S","D"];
  const startOffset = (firstDay + 6) % 7;
  const cells: (number | null)[] = [...Array(startOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ fontFamily: F.serif, fontSize: 14, fontWeight: 500, letterSpacing: ".12em", textTransform: "uppercase", color: C.gold, marginBottom: 16 }}>{monthNames[month]} {year}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
        {dayLabels.map((l, i) => <div key={`${l}-${i}`} style={{ fontSize: 9, fontWeight: 600, color: C.muted, fontFamily: F.sans, letterSpacing: ".06em" }}>{l}</div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {cells.map((cell, i) => {
          const isDay = cell === day;
          return (
            <div key={i} style={{ height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: isDay ? 600 : 400, fontFamily: isDay ? F.serif : F.sans, color: isDay ? C.ivory : cell ? C.inkLight : "transparent", background: isDay ? C.gold : "transparent", borderRadius: isDay ? "50%" : 0 }}>
              {cell || ""}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// LOCATION CARD
// ─────────────────────────────────────────────────────────────────────────────
const LocCard: React.FC<{ block: InvitationBlock; editMode: boolean; onUpdate: (p: Partial<InvitationBlock>) => void; icon?: string }> = ({ block, editMode, onUpdate, icon }) => {
  const [editWaze, setEditWaze] = useState(false);
  const name = block.locationName || "";
  const time = block.time || "";
  const address = block.locationAddress || "";
  const label = block.label || "Locatie";
  const wazeLink = block.wazeLink || "";
  const resolvedIcon =
    icon ||
    (/(biser|ceremon|religio|church)/i.test(label) ? IMG.church : IMG.venue);
  if (!editMode && !name && !time && !address && !wazeLink) return null;
  const enc = address ? encodeURIComponent(address) : "";

  return (
    <ElegantCard>
      <img src={IMG.floralSm1} alt="" style={{ position: "absolute", top: 8, left: 6, width: 38, objectFit: "contain", opacity: .48, pointerEvents: "none" }} />
      <img src={IMG.floralSm2} alt="" style={{ position: "absolute", top: 8, right: 6, width: 38, objectFit: "contain", opacity: .48, pointerEvents: "none" }} />

      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: `radial-gradient(circle, ${rgba(C.goldLight, .34)} 0%, ${rgba(C.gold, .08)} 72%, transparent 100%)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src={resolvedIcon} alt="" style={{ width: 26, height: 26, objectFit: "contain", opacity: .92 }} />
          </div>
        </div>
        <InlineEdit tag="p" editMode={editMode} value={label} onChange={v => onUpdate({ label: v })}
          style={{ fontFamily: F.sans, fontSize: 9, fontWeight: 600, letterSpacing: ".45em", textTransform: "uppercase", color: C.gold, margin: "0 0 8px" }} />
        <GoldDivider thin />
        {(editMode || time) && (
          <InlineTime value={time} onChange={v => onUpdate({ time: v })} editMode={editMode} textLabel="Locatie · ora"
            style={{ fontFamily: F.display, fontSize: 32, fontStyle: "italic", color: C.ink, margin: "10px 0 4px", display: "block", letterSpacing: "-.02em" }} />
        )}
        <InlineEdit tag="h3" editMode={editMode} value={name} onChange={v => onUpdate({ locationName: v })}
          style={{ fontFamily: F.display, fontSize: 18, fontWeight: 500, color: C.ink, margin: "0 0 6px" }} />
        {(editMode || address) && (
          <InlineEdit tag="p" editMode={editMode} value={address} onChange={v => onUpdate({ locationAddress: v })} multiline
            style={{ fontFamily: F.serif, fontSize: 13, fontStyle: "italic", color: C.muted, margin: 0, lineHeight: 1.7 }} />
        )}
      </div>

      {(editMode || wazeLink || address) && (
        <div style={{ marginTop: 16 }}>
          {editMode && editWaze && (
            <input autoFocus value={wazeLink} onChange={e => onUpdate({ wazeLink: e.target.value })}
              onBlur={() => setEditWaze(false)} onKeyDown={e => { if (e.key === "Enter" || e.key === "Escape") setEditWaze(false); }}
              placeholder="https://waze.com/ul?..."
              style={{ width: "100%", fontFamily: F.sans, fontSize: 12, padding: "8px 12px", borderRadius: 2, border: `1px solid ${rgba(C.gold, .35)}`, outline: "none", background: C.cream, marginBottom: 8 , color: 'black'}}
            />
          )}
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            {(editMode || wazeLink) && (
              editMode ? (
                <button type="button" onClick={() => setEditWaze(true)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 20px", border: `1px solid ${rgba(C.gold, .45)}`, borderRadius: 2, background: "transparent", color: C.gold, fontFamily: F.sans, fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", cursor: "pointer" }}>
                  {wazeLink ? "Waze" : "Adauga Waze"}
                </button>
              ) : (
                <a href={wazeLink} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 20px", border: `1px solid ${rgba(C.gold, .45)}`, borderRadius: 2, background: "transparent", color: C.gold, fontFamily: F.sans, fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", textDecoration: "none" }}>
                  Waze
                </a>
              )
            )}
            {address && (
              <a href={`https://maps.google.com/?q=${enc}`} target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 20px", border: `1px solid ${rgba(C.ink, .2)}`, borderRadius: 2, background: "transparent", color: C.inkLight, fontFamily: F.sans, fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", textDecoration: "none" }}>
                Google Maps
              </a>
            )}
          </div>
        </div>
      )}
    </ElegantCard>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MUSIC BLOCK
// ─────────────────────────────────────────────────────────────────────────────
const MusicBlock: React.FC<{
  block: InvitationBlock; editMode: boolean;
  onUpdate: (p: Partial<InvitationBlock>) => void;
  imperativeRef?: React.MutableRefObject<{ unlock: () => void; play: () => void; pause: () => void } | null>;
}> = ({ block, editMode, onUpdate, imperativeRef }) => {
  const audioRef  = useRef<HTMLAudioElement>(null);
  const mp3Ref    = useRef<HTMLInputElement>(null);
  const [playing,  setPlaying]  = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showYt,   setShowYt]   = useState(false);
  const [ytUrl,    setYtUrl]    = useState("");
  const [ytDownloading, setYtDownloading] = useState(false);
  const [ytError, setYtError] = useState("");

  useEffect(() => {
    const a = audioRef.current; if (!a) return;
    const onTime  = () => setProgress(a.currentTime);
    const onDur   = () => setDuration(a.duration);
    const onEnd   = () => { setPlaying(false); setProgress(0); };
    a.addEventListener("timeupdate", onTime); a.addEventListener("loadedmetadata", onDur); a.addEventListener("ended", onEnd);
    a.addEventListener("play", () => setPlaying(true)); a.addEventListener("pause", () => setPlaying(false));
    return () => { a.removeEventListener("timeupdate", onTime); a.removeEventListener("loadedmetadata", onDur); a.removeEventListener("ended", onEnd); };
  }, [block.musicUrl]);

  useEffect(() => {
    if (!imperativeRef) return;
    imperativeRef.current = {
      unlock: () => { if (audioRef.current && block.musicUrl) { audioRef.current.play().then(() => { audioRef.current!.pause(); audioRef.current!.currentTime = 0; }).catch(() => {}); } },
      play:   () => { if (audioRef.current && block.musicUrl) audioRef.current.play().catch(() => {}); },
      pause:  () => { if (audioRef.current) audioRef.current.pause(); },
    };
  });

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const pct = duration ? `${(progress / duration) * 100}%` : "0%";
  const toggle = () => { const a = audioRef.current; if (!a) return; if (playing) a.pause(); else a.play().catch(() => {}); };
  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    audioRef.current.currentTime = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * duration;
  };
  const handleMp3 = async (file: File) => {
    if (!file.type.startsWith("audio/")) return;
    const _s = JSON.parse(localStorage.getItem("weddingPro_session") || "{}");
    const form = new FormData(); form.append("file", file);
    const res = await fetch(`${API_URL}/upload`, { method: "POST", headers: { Authorization: `Bearer ${_s?.token || ""}` }, body: form });
    const { url } = await res.json(); onUpdate({ musicUrl: url, musicType: "mp3" });
  };
  const submitYt = async () => {
    const trimmed = ytUrl.trim(); if (!trimmed) return;
    const _s = JSON.parse(localStorage.getItem("weddingPro_session") || "{}");
    setYtDownloading(true); setYtError("");
    try {
      const res = await fetch(`${API_URL}/download-yt-audio`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${_s?.token || ""}` }, body: JSON.stringify({ url: trimmed }) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error || "Eroare");
      onUpdate({ musicUrl: data.url, musicType: "mp3", musicTitle: data.title || "", musicArtist: data.author || "" });
      setShowYt(false); setYtUrl("");
    } catch (e: any) { setYtError(e.message || "Eroare."); } finally { setYtDownloading(false); }
  };

  const isActive = !!block.musicUrl;

  return (
    <ElegantCard>
      <style>{`@keyframes w-bar{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}`}</style>
      {block.musicType === "mp3" && block.musicUrl && <audio ref={audioRef} src={block.musicUrl} preload="metadata" />}

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", border: `1px solid ${rgba(C.gold, playing ? .7 : .3)}`, display: "flex", alignItems: "center", justifyContent: "center", background: playing ? rgba(C.gold, .08) : "transparent", transition: "all .3s" }}>
          <Music style={{ width: 14, height: 14, color: playing ? C.gold : C.muted }} />
        </div>
        <div>
          <p style={{ fontFamily: F.sans, fontSize: 9, fontWeight: 600, letterSpacing: ".4em", textTransform: "uppercase", color: playing ? C.gold : C.muted, margin: 0, transition: "color .3s" }}>
            {playing ? "În redare" : "Melodia Noastră"}
          </p>
        </div>
        {playing && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 12, marginLeft: "auto" }}>
            {[0, .18, .08, .26].map((d, i) => <div key={i} style={{ width: 2.5, height: 12, background: C.gold, borderRadius: 2, transformOrigin: "bottom", animation: `w-bar .7s ease-in-out ${d}s infinite` }} />)}
          </div>
        )}
      </div>

      {!isActive && editMode && (
        !showYt ? (
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={() => mp3Ref.current?.click()}
              style={{ flex: 1, background: "transparent", border: `1px dashed ${rgba(C.gold, .4)}`, borderRadius: 2, padding: "16px 0", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <Upload style={{ width: 16, height: 16, color: rgba(C.gold, .6) }} />
              <span style={{ fontFamily: F.sans, fontSize: 9, color: C.muted, fontWeight: 600, letterSpacing: ".2em", textTransform: "uppercase" }}>Incarca MP3</span>
            </button>
            <button type="button" onClick={() => setShowYt(true)}
              style={{ flex: 1, background: "transparent", border: `1px dashed ${rgba(C.gold, .4)}`, borderRadius: 2, padding: "16px 0", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>▶</span>
              <span style={{ fontFamily: F.sans, fontSize: 9, color: C.muted, fontWeight: 600, letterSpacing: ".2em", textTransform: "uppercase" }}>YouTube</span>
            </button>
            <input ref={mp3Ref} type="file" accept="audio/*,.mp3" onChange={e => { const f = e.target.files?.[0]; if (f) handleMp3(f); }} style={{ display: "none" }} />
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", gap: 6, marginBottom: ytError ? 6 : 0 }}>
              <input value={ytUrl} onChange={e => { setYtUrl(e.target.value); setYtError(""); }} onKeyDown={e => e.key === "Enter" && !ytDownloading && submitYt()} placeholder="https://youtu.be/..." autoFocus disabled={ytDownloading}
                style={{ flex: 1, background: C.cream, border: `1px solid ${rgba(C.gold, .35)}`, borderRadius: 2, padding: "8px 12px", fontFamily: F.sans, fontSize: 11, color: C.ink, outline: "none" }} />
              <button type="button" onClick={submitYt} disabled={ytDownloading} style={{ background: C.gold, border: "none", borderRadius: 2, padding: "0 14px", cursor: "pointer", color: "white", fontFamily: F.sans, fontWeight: 600, minWidth: 40 }}>
                {ytDownloading ? <div style={{ width: 12, height: 12, border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .7s linear infinite" }} /> : "✓"}
              </button>
              <button type="button" onClick={() => { setShowYt(false); setYtUrl(""); setYtError(""); }} style={{ background: "transparent", border: `1px solid ${rgba(C.ink, .15)}`, borderRadius: 2, padding: "0 10px", cursor: "pointer", color: C.muted, fontSize: 13 }}>✕</button>
            </div>
            {ytError && <p style={{ fontFamily: F.sans, fontSize: 10, color: "#dc2626", margin: 0 }}>{ytError}</p>}
          </div>
        )
      )}

      {isActive && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 2, background: C.creamD, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${rgba(C.gold, .25)}` }}>
              <Music style={{ width: 18, height: 18, color: rgba(C.gold, .7) }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <InlineEdit tag="p" editMode={editMode} value={block.musicTitle || ""} onChange={v => onUpdate({ musicTitle: v })} placeholder="Titlul melodiei..."
                style={{ fontFamily: F.serif, fontSize: 15, fontStyle: "italic", color: C.ink, margin: 0, lineHeight: 1.3 }} />
              <InlineEdit tag="p" editMode={editMode} value={block.musicArtist || ""} onChange={v => onUpdate({ musicArtist: v })} placeholder="Artist..."
                style={{ fontFamily: F.sans, fontSize: 10, color: C.muted, margin: "2px 0 0", letterSpacing: ".08em" }} />
            </div>
          </div>
          <div onClick={seek} style={{ height: 1.5, background: rgba(C.gold, .2), borderRadius: 99, marginBottom: 8, cursor: "pointer", position: "relative" }}>
            <div style={{ height: "100%", borderRadius: 99, background: C.gold, width: pct, transition: "width .3s linear" }} />
            <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", left: pct, marginLeft: -5, width: 10, height: 10, borderRadius: "50%", background: C.gold, transition: "left .3s linear" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontFamily: F.sans, fontSize: 9, color: C.muted }}>{fmt(progress)}</span>
            <span style={{ fontFamily: F.sans, fontSize: 9, color: C.muted }}>{duration ? fmt(duration) : "--:--"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24 }}>
            <button type="button" onClick={() => { const a = audioRef.current; if (a) a.currentTime = Math.max(0, a.currentTime - 10); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, opacity: .4 }}>
              <SkipBack style={{ width: 14, height: 14, color: C.ink }} />
            </button>
            <button type="button" onClick={toggle} style={{ width: 44, height: 44, borderRadius: "50%", background: C.gold, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 16px ${rgba(C.gold, .4)}` }}>
              {playing ? <Pause style={{ width: 14, height: 14, color: "white" }} /> : <Play style={{ width: 14, height: 14, color: "white", marginLeft: 2 }} />}
            </button>
            <button type="button" onClick={() => { const a = audioRef.current; if (a) a.currentTime = Math.min(duration, a.currentTime + 10); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, opacity: .4 }}>
              <SkipForward style={{ width: 14, height: 14, color: C.ink }} />
            </button>
          </div>
          {editMode && (
            <div style={{ marginTop: 14, textAlign: "center" }}>
              <button type="button" onClick={() => { onUpdate({ musicUrl: "", musicType: "none" as any }); setShowYt(true); }}
                style={{ background: "transparent", border: `1px solid ${rgba(C.gold, .3)}`, borderRadius: 2, padding: "4px 14px", cursor: "pointer", fontFamily: F.sans, fontSize: 9, color: C.muted, letterSpacing: ".15em", textTransform: "uppercase" }}>
                Schimba sursa
              </button>
            </div>
          )}
        </div>
      )}
    </ElegantCard>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COUNTDOWN
// ─────────────────────────────────────────────────────────────────────────────
interface TimeLeft { days: number; hours: number; minutes: number; seconds: number; total: number }
function calcTimeLeft(date: string): TimeLeft {
  const diff = new Date(date).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  return { days: Math.floor(diff / 86400000), hours: Math.floor((diff / 3600000) % 24), minutes: Math.floor((diff / 60000) % 60), seconds: Math.floor((diff / 1000) % 60), total: diff };
}

const CleanCell: React.FC<{ value: number; label: string }> = ({ value, label }) => {
  const prev = useRef(value);
  const [flash, setFlash] = useState(false);
  useEffect(() => { if (prev.current !== value) { setFlash(true); setTimeout(() => setFlash(false), 250); prev.current = value; } }, [value]);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1 }}>
      <div style={{ width: "100%", maxWidth: 64, aspectRatio: "1", border: `1px solid ${rgba(C.gold, .3)}`, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", background: C.ivory, transition: "transform .15s", transform: flash ? "scale(1.08)" : "scale(1)", boxShadow: `0 1px 8px ${rgba(C.gold, .1)}` }}>
        <span style={{ fontFamily: F.display, fontSize: 22, fontWeight: 400, color: C.ink, lineHeight: 1 }}>{String(value).padStart(2, "0")}</span>
      </div>
      <span style={{ fontFamily: F.sans, fontSize: 8, letterSpacing: ".3em", textTransform: "uppercase", color: C.gold, fontWeight: 500 }}>{label}</span>
    </div>
  );
};

const Countdown: React.FC<{ targetDate: string | undefined }> = ({ targetDate }) => {
  const [tl, setTl] = useState<TimeLeft | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true); if (!targetDate) return;
    setTl(calcTimeLeft(targetDate));
    const id = setInterval(() => setTl(calcTimeLeft(targetDate!)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  if (!ready || !targetDate) return null;
  const isOver = tl?.total === 0;
  if (isOver) return <p style={{ fontFamily: F.serif, fontSize: 16, fontStyle: "italic", color: C.gold, textAlign: "center", margin: 0 }}>Ziua cea mare a sosit</p>;
  const vals = [tl?.days ?? 0, tl?.hours ?? 0, tl?.minutes ?? 0, tl?.seconds ?? 0];
  const lbls = ["Zile", "Ore", "Min", "Sec"];
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
      {vals.map((v, i) => (
        <React.Fragment key={i}>
          <CleanCell value={v} label={lbls[i]} />
          {i < 3 && <span style={{ fontFamily: F.serif, fontSize: 20, color: rgba(C.gold, .35), paddingTop: 14, flexShrink: 0 }}>·</span>}
        </React.Fragment>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT BLOCKS
// ─────────────────────────────────────────────────────────────────────────────
export const MAISON_DEFAULT_BLOCKS: InvitationBlock[] = [
  { id: "w-photo-1", type: "photo" as const, show: true, imageData: "/maison/175140437c82741b2167bfb8c40c098e.jpg", altText: "Fotografia cuplului", aspectRatio: "4:3" as const, photoClip: "rect" as const, photoMasks: ["fade-b"] as any },
  { id: "w-text-1", type: "text", show: true, content: "Cu inimile pline de bucurie și recunoștință, vă invităm să fiți alături de noi în ziua în care doi oameni devin una." },
  { id: "w-calendar", type: "calendar", show: true },
  { id: "w-divider-1", type: "divider", show: true },
  { id: "w-text-2", type: "text", show: true, content: "Această zi nu ar fi la fel de specială fără cei care ne-au ghidat pașii și ne-au înconjurat cu dragoste." },
  { id: "w-family-1", type: "family", show: true, label: "Părinții Miresei", content: "Cu drag și recunoștință", members: JSON.stringify([{ name1: "Mama Miresei", name2: "Tata Miresei" }]) },
  { id: "w-family-2", type: "family", show: true, label: "Părinții Mirelui", content: "Cu drag și recunoștință", members: JSON.stringify([{ name1: "Mama Mirelui", name2: "Tata Mirelui" }]) },
  { id: "w-family-3", type: "family", show: true, label: "Nașii", content: "Cu drag și binecuvântare", members: JSON.stringify([{ name1: "Nașa", name2: "Nașul" }]) },
  { id: "w-divider-2", type: "divider", show: true },
  { id: "w-text-3", type: "text", show: true, content: "Momentele de neuitat ale acestei zile vor avea loc în următoarele locații:" },
  { id: "w-location-1", type: "location", show: true, label: "Cununia Religioasă", time: "13:00", locationName: "Catedrala Sf. Maria", locationAddress: "Str. Catedralei nr. 1, București", wazeLink: "https://waze.com" },
  { id: "w-divider-3", type: "divider", show: true },
  { id: "w-location-2", type: "location", show: true, label: "Recepția & Petrecerea", time: "19:00", locationName: "Grand Palace Ballroom", locationAddress: "Bd. Unirii nr. 42, București", wazeLink: "https://waze.com" },
  { id: "w-divider-4", type: "divider", show: true },
  { id: "w-photo-2", type: "photo" as const, show: true, imageData: "/maison/a5d51dd50cc3f51657a8ca13ad8c9b8e.jpg", altText: "Portretul cuplului", aspectRatio: "3:4" as const, photoClip: "arch" as const, photoMasks: ["fade-b"] as any },
  // { id: "w-text-4", type: "text", show: true, content: "O melodie aleasă cu sufletul, care va acompania fiecare moment al acestei zile de neuitat." },
  // { id: "w-music-1", type: "music", show: true, musicTitle: "", musicArtist: "", musicUrl: "", musicType: "none" },
  { id: "w-divider-5", type: "divider", show: true },
  { id: "w-text-5", type: "text", show: true, content: "Prezența voastră este cel mai de preț cadou. Vă rugăm să ne confirmați participarea până la data de —." },
  { id: "w-rsvp-1", type: "rsvp", show: true, label: "Confirmați Prezența" },
];

// ─────────────────────────────────────────────────────────────────────────────
// WEDDING INTRO
// ─────────────────────────────────────────────────────────────────────────────
const WeddingIntro: React.FC<{ name1: string; name2: string; date: string; onDone: () => void }> = ({ name1, name2, date, onDone }) => {
  const [phase, setPhase] = useState(0);
  const [fade,  setFade]  = useState(false);
  const [confetti, setConfetti] = useState<any[]>([]);

  const handleOpen = useCallback(() => {
    if (phase > 0) return;
    const cols = [C.gold, C.goldLight, rgba(C.gold, .5), C.blush, rgba(C.gold, .3)];
    setConfetti(Array.from({ length: 40 }, (_, i) => ({ id: i, x: 5 + Math.random() * 90, color: cols[i % cols.length], delay: Math.random() * .6, size: 3 + Math.random() * 5 })));
    setPhase(1);
    setTimeout(() => { setFade(true); setTimeout(onDone, 800); }, 2800);
  }, [phase, onDone]);

  const wd = date ? new Date(date) : null;
  const dateStr = wd ? wd.toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" }) : "";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999, overflow: "hidden",
      background: C.cream,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      opacity: fade ? 0 : 1, transition: fade ? "opacity .8s ease" : "none",
      pointerEvents: fade ? "none" : "auto",
    }}>
      <style>{W_CSS}</style>
      {confetti.map(c => <Confetto key={c.id} {...c} />)}

      {/* Minimal corner ornaments */}
      {[
        { top: 20, left: 20 }, { top: 20, right: 20 },
        { bottom: 20, left: 20 }, { bottom: 20, right: 20 },
      ].map((pos, i) => (
        <div key={i} style={{ position: "fixed", ...pos, opacity: .2, pointerEvents: "none" }}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d={i === 0 ? "M0 40 L0 0 L40 0" : i === 1 ? "M40 40 L40 0 L0 0" : i === 2 ? "M0 0 L0 40 L40 40" : "M40 0 L40 40 L0 40"} stroke={C.gold} strokeWidth=".8" />
          </svg>
        </div>
      ))}

      {/* Central gold line ornaments */}
      <div style={{ position: "fixed", left: 0, right: 0, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", zIndex: 0 }}>
        <div style={{ height: .5, background: `linear-gradient(to right, transparent, ${rgba(C.gold, .08)}, transparent)` }} />
      </div>

      {phase === 0 && (
        <div style={{ position: "relative", zIndex: 2, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 0, padding: "0 40px", maxWidth: 440 }}>
          {/* Top ornament */}
          <div style={{ marginBottom: 32, opacity: .4 }}>
            <svg width="120" height="16" viewBox="0 0 120 16"><line x1="0" y1="8" x2="48" y2="8" stroke={C.gold} strokeWidth=".8"/><circle cx="60" cy="8" r="3" fill="none" stroke={C.gold} strokeWidth=".8"/><line x1="72" y1="8" x2="120" y2="8" stroke={C.gold} strokeWidth=".8"/></svg>
          </div>

          {/* Small label */}
          <p style={{ fontFamily: F.sans, fontSize: 9, fontWeight: 500, letterSpacing: ".55em", textTransform: "uppercase", color: C.gold, margin: "0 0 24px" }}>
            Invitație de nuntă
          </p>

          {/* Names */}
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontFamily: F.display, fontSize: "clamp(38px,10vw,60px)", fontStyle: "italic", fontWeight: 400, color: C.ink, margin: 0, lineHeight: 1.1, letterSpacing: "-.01em" }}>{name1}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "center", margin: "12px 0" }}>
              <div style={{ flex: 1, height: .5, background: `linear-gradient(to right, transparent, ${rgba(C.gold, .5)})` }} />
              <span style={{ fontFamily: F.serif, fontSize: 18, color: rgba(C.gold, .7), fontStyle: "italic", fontWeight: 300 }}>&amp;</span>
              <div style={{ flex: 1, height: .5, background: `linear-gradient(to left, transparent, ${rgba(C.gold, .5)})` }} />
            </div>
            <h1 style={{ fontFamily: F.display, fontSize: "clamp(38px,10vw,60px)", fontStyle: "italic", fontWeight: 400, color: C.ink, margin: 0, lineHeight: 1.1, letterSpacing: "-.01em" }}>{name2}</h1>
          </div>

          {/* Date */}
          {dateStr && (
            <p style={{ fontFamily: F.serif, fontSize: 14, fontStyle: "italic", color: C.muted, margin: "0 0 32px", letterSpacing: ".04em" }}>
              {dateStr}
            </p>
          )}

          {/* Bottom ornament */}
          <div style={{ marginBottom: 40, opacity: .4 }}>
            <svg width="80" height="12" viewBox="0 0 80 12"><line x1="0" y1="6" x2="30" y2="6" stroke={C.gold} strokeWidth=".6"/><polygon points="40,1 43,6 40,11 37,6" fill="none" stroke={C.gold} strokeWidth=".6"/><line x1="50" y1="6" x2="80" y2="6" stroke={C.gold} strokeWidth=".6"/></svg>
          </div>

          {/* Open button — minimal */}
          <button onClick={handleOpen} style={{
            fontFamily: F.sans, fontSize: 10, fontWeight: 500, letterSpacing: ".42em", textTransform: "uppercase",
            color: C.ivory, background: C.ink, border: "none",
            padding: "14px 40px", cursor: "pointer",
            transition: "all .2s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = C.gold; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = C.ink; }}>
            Deschide Invitația
          </button>
        </div>
      )}

      {phase === 1 && (
        <div style={{ position: "relative", zIndex: 2, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "0 40px", maxWidth: 440, animation: "w-fadeUp .6s ease both" }}>
          <div style={{ opacity: .35, marginBottom: 8 }}>
            <svg width="100" height="100" viewBox="0 0 100 100" fill="none" style={{ animation: "w-rings 3s ease-in-out infinite" }}>
              <circle cx="36" cy="50" r="20" stroke={C.gold} strokeWidth="3" fill="none"/>
              <circle cx="64" cy="50" r="20" stroke={C.gold} strokeWidth="3" fill="none"/>
            </svg>
          </div>
          <p style={{ fontFamily: F.sans, fontSize: 9, letterSpacing: ".55em", textTransform: "uppercase", color: C.gold, margin: 0 }}>
            Vă așteptăm cu drag
          </p>
          <h1 style={{ fontFamily: F.display, fontSize: "clamp(32px,8vw,48px)", fontStyle: "italic", fontWeight: 400, color: C.ink, margin: 0, lineHeight: 1.2 }}>
            {name1} &amp; {name2}
          </h1>
          {dateStr && <p style={{ fontFamily: F.serif, fontSize: 14, fontStyle: "italic", color: C.muted, margin: 0 }}>{dateStr}</p>}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// AUDIO MODAL
// ─────────────────────────────────────────────────────────────────────────────
const AudioPermissionModal: React.FC<{ name1: string; name2: string; onAllow: () => void; onDeny: () => void }> = ({ name1, name2, onAllow, onDeny }) => (
  <div style={{ position: "fixed", inset: 0, zIndex: 10020, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ position: "absolute", inset: 0, background: rgba(C.cream, .92), backdropFilter: "blur(12px)" }} />
    <div style={{ position: "relative", background: C.ivory, borderRadius: 2, padding: "36px 32px 28px", maxWidth: 320, width: "90%", textAlign: "center", border: `.5px solid ${rgba(C.gold, .3)}`, boxShadow: `0 4px 40px ${rgba(C.ink, .1)}` }}>
      <div style={{ marginBottom: 20 }}>
        <svg width="60" height="40" viewBox="0 0 60 40" fill="none" style={{ animation: "w-rings 3s ease-in-out infinite", opacity: .35 }}>
          <circle cx="21" cy="20" r="14" stroke={C.gold} strokeWidth="2" fill="none"/>
          <circle cx="39" cy="20" r="14" stroke={C.gold} strokeWidth="2" fill="none"/>
        </svg>
      </div>
      <p style={{ fontFamily: F.display, fontSize: 22, fontStyle: "italic", fontWeight: 400, color: C.ink, margin: "0 0 4px" }}>{name1} &amp; {name2}</p>
      <p style={{ fontFamily: F.sans, fontSize: 10, fontWeight: 500, letterSpacing: ".25em", textTransform: "uppercase", color: C.gold, margin: "0 0 16px" }}>Invitație de Nuntă</p>
      <GoldDivider style={{ marginBottom: 16 }} />
      <p style={{ fontFamily: F.serif, fontSize: 13, fontStyle: "italic", color: C.muted, margin: "0 0 24px", lineHeight: 1.7 }}>Această invitație este însoțită de o melodie aleasă cu drag. Doriți să activați muzica?</p>
      <button type="button" onClick={onAllow}
        style={{ width: "100%", padding: "12px 0", background: C.ink, border: "none", cursor: "pointer", fontFamily: F.sans, fontSize: 9, fontWeight: 600, color: "white", letterSpacing: ".4em", textTransform: "uppercase", marginBottom: 10, transition: "background .2s" }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = C.gold; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = C.ink; }}>
        Activați Muzica
      </button>
      <button type="button" onClick={onDeny}
        style={{ width: "100%", padding: "10px 0", background: "transparent", border: "none", cursor: "pointer", fontFamily: F.sans, fontSize: 10, color: C.muted, letterSpacing: ".2em" }}>
        Continuați fără muzică
      </button>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// BLOCK TOOLBAR & INSERT
// ─────────────────────────────────────────────────────────────────────────────
const BLOCK_TYPE_ICONS: Record<string, string> = {
  photo: "🖼", text: "✏️", location: "📍", calendar: "📅", countdown: "⏱", music: "🎵", gift: "🎁", whatsapp: "💬", rsvp: "✉️", divider: "—", family: "👨‍👩‍👧", date: "📆", description: "📝", timeline: "🗓",
};

const BlockToolbar = ({ onUp, onDown, onToggle, onDelete, visible, isFirst, isLast }: any) => (
  <div style={{ position: "absolute", top: -18, right: 6, zIndex: 9999, display: "flex", alignItems: "center", gap: 2, border: `.5px solid ${rgba(C.gold, .35)}`, background: "rgba(253,250,245,.96)", backdropFilter: "blur(8px)", padding: "3px 6px", pointerEvents: "auto", boxShadow: `0 2px 12px ${rgba(C.ink, .08)}` }}>
  {([
    [() => onUp(), isFirst, <ChevronUp style={{ width: 13, height: 13, color: C.ink }} />],
    [() => onDown(), isLast, <ChevronDown style={{ width: 13, height: 13, color: C.ink }} />],
  ] as [() => void, boolean, React.ReactNode][]).map(([fn, dis, icon], i) => (
    <button key={i} type="button" onClick={e => { e.stopPropagation(); fn(); }} disabled={dis}
      style={{ background: "none", border: "none", padding: 4, cursor: "pointer", display: "flex", alignItems: "center", opacity: dis ? .2 : .7 }}>{icon}</button>
  ))}
  <div style={{ width: .5, height: 12, background: rgba(C.gold, .4), margin: "0 2px" }} />
  <button type="button" onClick={e => { e.stopPropagation(); onToggle(); }} style={{ background: "none", border: "none", padding: 4, cursor: "pointer", display: "flex", alignItems: "center", opacity: .7 }}>
    {visible ? <Eye style={{ width: 13, height: 13, color: C.ink }} /> : <EyeOff style={{ width: 13, height: 13, color: C.muted }} />}
  </button>
  <button type="button" onClick={e => { e.stopPropagation(); onDelete(); }} style={{ background: "none", border: "none", padding: 4, cursor: "pointer", display: "flex", alignItems: "center", opacity: .7 }}>
    <Trash2 style={{ width: 13, height: 13, color: "#dc2626" }} />
  </button>
</div>
);

const InsertBlockButton: React.FC<{
  insertIdx: number; openInsertAt: number | null; setOpenInsertAt: (v: number | null) => void;
  BLOCK_TYPES: { type: string; label: string; def: any }[]; onInsert: (type: string, def: any) => void;
}> = ({ insertIdx, openInsertAt, setOpenInsertAt, BLOCK_TYPES, onInsert }) => {
  const isOpen = openInsertAt === insertIdx;
  const [hov, setHov] = React.useState(false);
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", height: 28, zIndex: 20 }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div style={{ position: "absolute", left: 0, right: 0, height: .5, background: `repeating-linear-gradient(to right, ${rgba(C.gold, .35)} 0, ${rgba(C.gold, .35)} 6px, transparent 6px, transparent 12px)`, zIndex: 1 }} />
      <button type="button" onClick={() => setOpenInsertAt(isOpen ? null : insertIdx)}
        style={{ width: 22, height: 22, borderRadius: "50%", background: isOpen ? C.gold : C.ivory, border: `.5px solid ${rgba(C.gold, .5)}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: isOpen ? "white" : C.gold, opacity: 1, transition: "opacity .15s, transform .15s, background .15s", transform: (hov || isOpen) ? "scale(1)" : "scale(.6)", zIndex: 2, position: "relative", fontWeight: 500, boxShadow: `0 1px 6px ${rgba(C.ink, .08)}` }}>
        {isOpen ? "×" : "+"}
      </button>
      {isOpen && (
        <div style={{ position: "absolute", bottom: 30, left: "50%", transform: "translateX(-50%)", background: C.ivory, border: `.5px solid ${rgba(C.gold, .3)}`, boxShadow: `0 8px 32px ${rgba(C.ink, .1)}`, padding: 16, zIndex: 100, width: 260 }}
          onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
          <p style={{ fontFamily: F.sans, fontSize: ".5rem", fontWeight: 600, letterSpacing: ".35em", textTransform: "uppercase", color: C.muted, margin: "0 0 10px", textAlign: "center" }}>Adaugă Bloc</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
            {BLOCK_TYPES.map(bt => (
              <button key={bt.type} type="button" onClick={() => onInsert(bt.type, bt.def)}
                style={{ background: C.cream, border: `.5px solid ${rgba(C.gold, .25)}`, padding: "8px 4px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, transition: "background .15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = C.creamD; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = C.cream; }}>
                <span style={{ fontSize: 16, lineHeight: 1 }}>{BLOCK_TYPE_ICONS[bt.type] || "+"}</span>
                <span style={{ fontFamily: F.sans, fontSize: ".5rem", fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: C.inkLight, lineHeight: 1.2, textAlign: "center" }}>{bt.label.replace(/^[^\s]+\s/, "")}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN TEMPLATE
// ─────────────────────────────────────────────────────────────────────────────
const MaisonWeddingTemplate: React.FC<InvitationTemplateProps & {
  editMode?: boolean;
  onProfileUpdate?: (patch: Record<string, any>) => void;
  onBlocksUpdate?: (blocks: InvitationBlock[]) => void;
  onBlockSelect?: (block: InvitationBlock | null, idx: number, textKey?: string, textLabel?: string) => void;
  selectedBlockId?: string;
  suppressAudioModal?: boolean;
  scrollContainer?: HTMLElement | null;
}> = ({ data, onOpenRSVP, editMode = false, suppressAudioModal = false, onProfileUpdate, onBlocksUpdate, onBlockSelect, selectedBlockId }) => {
  const { profile, guest } = data;
  const activeTheme = getMaisonWeddingTheme((profile as any).colorTheme);
  C = { ...activeTheme };
  const safeJSON = (s: string | undefined, fb: any) => { try { return s ? JSON.parse(s) : fb; } catch { return fb; } };

  const blocksFromDB: InvitationBlock[] | null = safeJSON(profile.customSections, null);
  const hasDB = Array.isArray(blocksFromDB) && blocksFromDB.length > 0;
  const [blocks, setBlocks] = useState<InvitationBlock[]>(() => hasDB ? blocksFromDB! : MAISON_DEFAULT_BLOCKS as unknown as InvitationBlock[]);
  useEffect(() => {
    const fresh: InvitationBlock[] | null = safeJSON(profile.customSections, null);
    if (Array.isArray(fresh) && fresh.length > 0) setBlocks(fresh);
    else if (fresh !== null && Array.isArray(fresh) && fresh.length === 0) setBlocks(MAISON_DEFAULT_BLOCKS as unknown as InvitationBlock[]);
  }, [profile.customSections]);

  const [openInsertAt, setOpenInsertAt] = useState<number | null>(null);
  const musicPlayRef = useRef<{ unlock: () => void; play: () => void; pause: () => void } | null>(null);
  const audioAllowedRef = useRef(false);
  const [showAudioModal, setShowAudioModal] = useState(false);

  const updBlock = useCallback((idx: number, patch: Partial<InvitationBlock>) => {
    setBlocks(prev => { const nb = prev.map((b, i) => i === idx ? { ...b, ...patch } : b); onBlocksUpdate?.(nb); return nb; });
  }, [onBlocksUpdate]);
  const movBlock = useCallback((idx: number, dir: -1 | 1) => {
    setBlocks(prev => { const nb = [...prev]; const to = idx + dir; if (to < 0 || to >= nb.length) return prev; [nb[idx], nb[to]] = [nb[to], nb[idx]]; onBlocksUpdate?.(nb); return nb; });
  }, [onBlocksUpdate]);
  const delBlock = useCallback((idx: number) => {
    setBlocks(prev => { const nb = prev.filter((_, i) => i !== idx); onBlocksUpdate?.(nb); return nb; });
  }, [onBlocksUpdate]);
  const addBlockAt = useCallback((afterIdx: number, type: string, def: any) => {
    setBlocks(prev => { const nb = [...prev]; nb.splice(afterIdx + 1, 0, { id: Date.now().toString(), type: type as InvitationBlockType, show: true, ...def }); onBlocksUpdate?.(nb); return nb; });
  }, [onBlocksUpdate]);

  const getTimelineItems = () => safeJSON(profile.timeline, []);
  const updateTimeline = (next: any[]) => { onProfileUpdate?.({ timeline: JSON.stringify(next), showTimeline: true } as any); };
  const addTimelineItem = (preset: { icon?: string; title?: string } | null) => {
    updateTimeline([...getTimelineItems(), { id: Date.now().toString(), title: preset?.title || "", time: "", icon: preset?.icon || "party", notice: "" }]);
  };
  const updateTimelineItem = (id: string, patch: any) => updateTimeline(getTimelineItems().map((t: any) => t.id === id ? { ...t, ...patch } : t));
  const removeTimelineItem = (id: string) => updateTimeline(getTimelineItems().filter((t: any) => t.id !== id));
  const handleInsertAt = (afterIdx: number, type: string, def: any) => { addBlockAt(afterIdx, type, def); setOpenInsertAt(null); };

  const _pq = useRef<Record<string, any>>({});
  const _pt = useRef<ReturnType<typeof setTimeout> | null>(null);
  const upProfile = useCallback((field: string, value: any) => {
    _pq.current = { ..._pq.current, [field]: value };
    if (_pt.current) clearTimeout(_pt.current);
    _pt.current = setTimeout(() => { onProfileUpdate?.(_pq.current); _pq.current = {}; }, 400);
  }, [onProfileUpdate]);

  const isEmbeddedPreview = !!suppressAudioModal;
  const [showIntro, setShowIntro] = useState(!editMode && !isEmbeddedPreview);
  const [contentVisible, setContentVisible] = useState(editMode || isEmbeddedPreview);
  const hasPlayableMusic = blocks.some((b: any) => b.type === "music" && b.show !== false && !!b.musicUrl);

  useEffect(() => { if (editMode || isEmbeddedPreview) { setShowIntro(false); setContentVisible(true); } }, [editMode, isEmbeddedPreview]);
  useEffect(() => {
    if (isEmbeddedPreview) { setShowAudioModal(false); return; }
    if (!editMode && showIntro && hasPlayableMusic && !audioAllowedRef.current) setShowAudioModal(true);
    else setShowAudioModal(false);
  }, [editMode, showIntro, hasPlayableMusic, isEmbeddedPreview]);
  useEffect(() => {
    if (isEmbeddedPreview) { document.body.style.overflow = ""; return; }
    if (showIntro) { document.body.style.overflow = "hidden"; document.body.style.position = "fixed"; document.body.style.top = "0"; document.body.style.left = "0"; document.body.style.right = "0"; }
    else { document.body.style.overflow = ""; document.body.style.position = ""; document.body.style.top = ""; document.body.style.left = ""; document.body.style.right = ""; }
    return () => { document.body.style.overflow = ""; document.body.style.position = ""; };
  }, [showIntro, isEmbeddedPreview]);

  const handleIntroDone = () => {
    window.scrollTo(0, 0); setShowIntro(false);
    setTimeout(() => { window.scrollTo(0, 0); setContentVisible(true); if (audioAllowedRef.current) musicPlayRef.current?.play(); }, 60);
  };

  const name1 = (profile.partner1Name || "Prenume").trim();
  const name2 = (profile.partner2Name || "Prenume").trim();
  const wd = profile.weddingDate ? new Date(profile.weddingDate) : null;
  const displayDay     = wd ? wd.getDate() : "";
  const displayMonth   = wd ? wd.toLocaleDateString("ro-RO", { month: "long" }) : "";
  const displayYear    = wd ? wd.getFullYear() : "";
  const displayWeekday = wd ? wd.toLocaleDateString("ro-RO", { weekday: "long" }) : "";
  const dateStrFull    = wd ? wd.toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" }) : "";

  const BLOCK_TYPES = [
    { type: "photo",     label: "📷 Foto",       def: { imageData: undefined, aspectRatio: "4:3", photoClip: "rect", photoMasks: [] } },
    { type: "text",      label: "Text",           def: { content: "Cu drag vă invităm..." } },
    { type: "location",  label: "Locație",        def: { label: "Locație", time: "13:00", locationName: "Locația evenimentului", locationAddress: "Adresa completă" } },
    { type: "calendar",  label: "📅 Calendar",    def: {} },
    { type: "countdown", label: "⏱ Countdown",    def: {} },
    { type: "timeline",  label: "🗓 Cronologie",  def: {} },
    { type: "music",     label: "🎵 Muzică",      def: { musicTitle: "", musicArtist: "", musicType: "none" } },
    { type: "gift",      label: "🎁 Cadouri",     def: { sectionTitle: "Sugestie cadou", content: "", iban: "" } },
    { type: "whatsapp",  label: "WhatsApp",       def: { label: "Contact WhatsApp", content: "0700000000" } },
    { type: "rsvp",      label: "RSVP",           def: { label: "Confirmați Prezența" } },
    { type: "divider",   label: "Linie",          def: {} },
    { type: "family",    label: "👨‍👩‍👧 Familie",   def: { label: "Părinții", content: "Cu drag și recunoștință", members: JSON.stringify([{ name1: "Mama", name2: "Tata" }]) } },
    { type: "date",      label: "📆 Data",        def: {} },
    { type: "description", label: "Descriere",    def: { content: "O scurtă descriere..." } },
  ];

  return (
    <>
      <style>{W_CSS}</style>
      {showAudioModal && (
        <AudioPermissionModal name1={name1} name2={name2}
          onAllow={() => { audioAllowedRef.current = true; musicPlayRef.current?.unlock(); setShowAudioModal(false); }}
          onDeny={() => { audioAllowedRef.current = false; setShowAudioModal(false); }}
        />
      )}
      {showIntro && <WeddingIntro name1={name1} name2={name2} date={profile.weddingDate || ""} onDone={handleIntroDone} />}

      <div style={{
        minHeight: "100vh", position: "relative", fontFamily: F.sans,
        opacity: contentVisible ? 1 : 0, transform: contentVisible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity .9s cubic-bezier(.22,1,.36,1), transform .9s cubic-bezier(.22,1,.36,1)",
        paddingBottom: 80,
      }}>

        {/* ── BACKGROUND ── */}
        <div style={{ position: "fixed", inset: 0, zIndex: 0, background: `linear-gradient(180deg, ${C.cream} 0%, ${C.ivory} 52%, ${C.creamD} 100%)` }}>
          {/* Stronger cinematic gradients */}
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${rgba(C.gold, .12)}, transparent 62%)` }} />
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 100%, ${rgba(C.gold, .08)}, transparent 48%)` }} />
          {/* Fine texture */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle at 1px 1px, ${rgba(C.gold, .07)} .5px, transparent 0)`, backgroundSize: "32px 32px" }} />
        </div>

        {/* Fixed corner ornaments */}
        {[
          { top: 12, left: 8, src: IMG.leaf1, rotate: "0deg" },
          { top: 12, right: 8, src: IMG.leaf2, rotate: "0deg" },
          { bottom: 12, left: 8, src: IMG.leaf2, rotate: "180deg" },
          { bottom: 12, right: 8, src: IMG.leaf1, rotate: "180deg" },
        ].map((pos, i) => (
          <img
            key={i}
            src={pos.src}
            alt=""
            style={{ position: "fixed", ...pos, width: 72, objectFit: "contain", opacity: .12, pointerEvents: "none", zIndex: 1, transform: `rotate(${pos.rotate})` }}
          />
        ))}

        <div style={{ position: "relative", zIndex: 2, maxWidth: 440, margin: "0 auto", padding: "32px 20px 0" }}>

          {/* ── HERO SECTION ── */}
          <Reveal from="fade">
            <BlockStyleProvider value={{ blockId: "__hero__", textStyles: undefined, onTextSelect: () => {} }}>
              <div style={{ textAlign: "center", marginBottom: 16 }}>

                {/* Hero photo — full bleed optional */}
                <div style={{ position: "relative", marginBottom: 40, overflow: "hidden" }}>
                  <img src={IMG.heroBg} alt="" style={{ width: "100%", height: 280, objectFit: "cover", objectPosition: "center", display: "block", filter: "brightness(.9) saturate(1.04) contrast(1.08)" }} />
                  {/* <img src={IMG.heroBgAlt} alt="" style={{ position: "absolute", top: 16, right: 16, width: 112, height: 142, objectFit: "cover", border: `.5px solid ${rgba(C.gold, .36)}`, boxShadow: `0 14px 28px ${rgba(C.ink, .16)}`, transform: "rotate(7deg)", opacity: .96 }} /> */}
                  <img src={IMG.dove} alt="" style={{ position: "absolute", top: 18, left: 18, width: 52, objectFit: "contain", opacity: .72, filter: `drop-shadow(0 6px 16px ${rgba(C.ink, .14)})` }} />
                  {/* Cream overlay at bottom */}
                  <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${rgba(C.ink, .14)} 0%, transparent 26%, transparent 58%, ${rgba(C.cream, .12)} 68%, ${C.cream} 100%)` }} />
                  {/* Names overlaid */}
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, textAlign: "center", padding: "0 24px 24px", textShadow: `0 3px 18px ${rgba(C.white, .45)}` }}>
                    <p style={{ fontFamily: F.sans, fontSize: 15, fontWeight: 700, letterSpacing: ".42em", textTransform: "uppercase", color: C.gold, margin: "0 0 10px", textShadow: `0 2px 12px ${rgba(C.ivory, .9)}, 0 0 1px ${rgba(C.ink, .2)}` }}>Invitatie la nunta</p>
                    <h1 style={{ fontFamily: F.display, fontSize: "clamp(34px,8vw,52px)", fontStyle: "italic", fontWeight: 500, color: C.ink, margin: 0, lineHeight: 1.08, letterSpacing: "-.02em", textShadow: `0 4px 22px ${rgba(C.ivory, .92)}, 0 1px 0 ${rgba(C.white, .6)}` }}>
                      <InlineEdit tag="span" editMode={editMode} value={name1} onChange={v => upProfile("partner1Name", v)} textLabel="Hero · Mireasă"
                        style={{ fontFamily: F.display, fontSize: "inherit", fontStyle: "italic", color: "inherit" }} />
                      <span style={{ fontFamily: F.serif, fontSize: "clamp(22px,4.8vw,32px)", color: rgba(C.gold, .92), margin: "0 14px", fontStyle: "italic", fontWeight: 400, textShadow: `0 2px 14px ${rgba(C.ivory, .85)}` }}>&amp;</span>
                      <InlineEdit tag="span" editMode={editMode} value={name2} onChange={v => upProfile("partner2Name", v)} textLabel="Hero · Mire"
                        style={{ fontFamily: F.display, fontSize: "inherit", fontStyle: "italic", color: "inherit" }} />
                    </h1>
                  </div>
                </div>

                {/* Top label */}
                <Reveal delay={0.1}>
                  <p style={{ fontFamily: F.sans, fontSize: 8, fontWeight: 500, letterSpacing: ".55em", textTransform: "uppercase", color: C.gold, margin: "0 0 20px" }}>
                    Vă invită cu drag
                  </p>
                </Reveal>

                {/* Welcome text */}
                <Reveal delay={0.15}>
                  <InlineEdit tag="p" editMode={editMode} value={profile.welcomeText || "la celebrarea căsătoriei lor"} onChange={v => upProfile("welcomeText", v)} textLabel="Hero · welcome"
                    style={{ fontFamily: F.serif, fontSize: 16, fontStyle: "italic", fontWeight: 400, color: C.muted, margin: "0 0 32px", lineHeight: 1.8, padding: "0 16px" }} />
                </Reveal>

                {/* Rings ornament */}
                <Reveal delay={0.2}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
                    <svg width="70" height="46" viewBox="0 0 70 46" fill="none" style={{ animation: "w-rings 4s ease-in-out infinite", opacity: .4 }}>
                      <circle cx="25" cy="23" r="16" stroke={C.gold} strokeWidth="1.5" fill="none"/>
                      <circle cx="45" cy="23" r="16" stroke={C.gold} strokeWidth="1.5" fill="none"/>
                    </svg>
                  </div>
                </Reveal>

                {/* DATE block — the hero date */}
                <Reveal delay={0.22}>
                  <div style={{ marginBottom: 28 }}>
                    <GoldDivider style={{ marginBottom: 24 }} />
                    {wd ? (
                      <div>
                        <p style={{ fontFamily: F.sans, fontSize: 8, fontWeight: 500, letterSpacing: ".55em", textTransform: "uppercase", color: C.muted, margin: "0 0 8px" }}>Data Evenimentului</p>
                        <p style={{ fontFamily: F.display, fontSize: "clamp(40px,10vw,64px)", fontStyle: "italic", fontWeight: 400, color: C.ink, margin: 0, lineHeight: 1 }}>{displayDay}</p>
                        <p style={{ fontFamily: F.serif, fontSize: 16, fontStyle: "italic", color: C.gold, margin: "4px 0 2px", letterSpacing: ".04em" }}>{displayMonth} {displayYear}</p>
                        <p style={{ fontFamily: F.sans, fontSize: 9, color: C.muted, letterSpacing: ".2em", textTransform: "capitalize", margin: 0 }}>{displayWeekday}</p>
                      </div>
                    ) : (
                      <p style={{ fontFamily: F.serif, fontSize: 16, fontStyle: "italic", color: C.muted }}>Data evenimentului</p>
                    )}
                    <GoldDivider style={{ marginTop: 24 }} />
                  </div>
                </Reveal>

                {/* Countdown */}
                <Reveal delay={0.28}>
                  <div style={{ marginBottom: 32 }}>
                    <Countdown targetDate={profile.weddingDate} />
                  </div>
                </Reveal>

                {/* Guest card */}
                <Reveal delay={0.32}>
                  <div style={{ border: `.5px solid ${rgba(C.gold, .3)}`, padding: "18px 24px", position: "relative", background: C.ivory, marginBottom: 8, overflow: "hidden" }}>
                    <img src={IMG.monogram} alt="" style={{ position: "absolute", inset: "50% auto auto 50%", width: 148, transform: "translate(-50%, -50%)", objectFit: "contain", opacity: .08, pointerEvents: "none" }} />
                    <img src={IMG.floralSm1} alt="" style={{ position: "absolute", top: 6, left: 6, width: 34, objectFit: "contain", opacity: .4, pointerEvents: "none" }} />
                    <img src={IMG.floralSm2} alt="" style={{ position: "absolute", top: 6, right: 6, width: 34, objectFit: "contain", opacity: .4, pointerEvents: "none" }} />
                    <img src={IMG.floralSm2} alt="" style={{ position: "absolute", bottom: 6, left: 6, width: 34, objectFit: "contain", opacity: .24, pointerEvents: "none", transform: "rotate(180deg)" }} />
                    <img src={IMG.floralSm1} alt="" style={{ position: "absolute", bottom: 6, right: 6, width: 34, objectFit: "contain", opacity: .24, pointerEvents: "none", transform: "rotate(180deg)" }} />
                    <p style={{ fontFamily: F.sans, fontSize: 8, fontWeight: 500, letterSpacing: ".42em", textTransform: "uppercase", color: C.gold, margin: "0 0 6px", position: "relative", zIndex: 1 }}>Invitat</p>
                    <p style={{ fontFamily: F.display, fontSize: 20, fontStyle: "italic", fontWeight: 400, color: C.ink, margin: 0, position: "relative", zIndex: 1 }}>
                      {guest?.name || "Numele Invitatului"}
                    </p>
                  </div>
                </Reveal>
              </div>
            </BlockStyleProvider>
          </Reveal>

          {/* ── BLOCKS ── */}
          <div>
            {editMode && (
              <InsertBlockButton insertIdx={-1} openInsertAt={openInsertAt} setOpenInsertAt={setOpenInsertAt}
                BLOCK_TYPES={BLOCK_TYPES} onInsert={(type, def) => handleInsertAt(-1, type, def)} />
            )}
            {blocks.filter(b => editMode || b.show !== false).map((block, idx) => (
              <div key={block.id} style={{ position: "relative" }}>
                <div style={{ position: "relative", padding: "8px 0", opacity: block.show === false ? .4 : 1 }}
                  onClick={editMode ? () => onBlockSelect?.(block, idx) : undefined}>
                  <BlockStyleProvider value={{ blockId: block.id, textStyles: (block as any).textStyles, onTextSelect: (k, l) => onBlockSelect?.(block, idx, k, l) } as BlockStyle}>
                    {editMode && <BlockToolbar onUp={() => movBlock(idx, -1)} onDown={() => movBlock(idx, 1)} onToggle={() => updBlock(idx, { show: block.show === false })} onDelete={() => delBlock(idx)} visible={block.show !== false} isFirst={idx === 0} isLast={idx === blocks.length - 1} />}
                    {editMode && block.show === false && (
                      <div style={{ position: "absolute", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                        <div style={{ position: "absolute", inset: 0, background: "rgba(248,244,237,.6)", backdropFilter: "blur(3px)" }} />
                        <EyeOff size={20} color={rgba(C.gold, .6)} style={{ position: "relative", zIndex: 10 }} />
                      </div>
                    )}

                    {/* ── DIVIDER ── */}
                    {block.type === "divider" && <GoldDivider style={{ padding: "4px 0" }} />}

                    {/* ── RSVP ── */}
                    {block.type === "rsvp" && (
                      <Reveal>
                        <div style={{ textAlign: "center", padding: "8px 0" }}>
                          {/* Rings */}
                          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20, opacity: .3 }}>
                            <svg width="60" height="38" viewBox="0 0 60 38" fill="none" style={{ animation: "w-rings 3.5s ease-in-out infinite" }}>
                              <circle cx="21" cy="19" r="13" stroke={C.gold} strokeWidth="1.2" fill="none"/>
                              <circle cx="39" cy="19" r="13" stroke={C.gold} strokeWidth="1.2" fill="none"/>
                            </svg>
                          </div>
                          <button type="button" onClick={() => !editMode && onOpenRSVP?.()}
                            style={{ padding: "14px 48px", background: C.ink, border: "none", cursor: "pointer", fontFamily: F.sans, fontSize: 9, fontWeight: 600, letterSpacing: ".42em", textTransform: "uppercase", color: C.ivory, transition: "background .25s" }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = C.gold; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = C.ink; }}>
                            <InlineEdit tag="span" editMode={editMode} value={block.label || "Confirmați Prezența"} onChange={v => updBlock(idx, { label: v })} textLabel="RSVP · text" />
                          </button>
                        </div>
                      </Reveal>
                    )}

                    {/* ── PHOTO ── */}
                    {block.type === "photo" && (
                      <Reveal>
                        <div onClick={editMode ? () => onBlockSelect?.(block, idx) : undefined}
                          style={editMode ? { cursor: "pointer", outline: selectedBlockId === block.id ? `1px solid ${C.gold}` : "none", outlineOffset: 4 } : undefined}>
                          <PhotoBlock imageData={block.imageData} altText={block.altText} editMode={editMode} onUpload={url => updBlock(idx, { imageData: url })} onRemove={() => updBlock(idx, { imageData: undefined })} onRatioChange={r => updBlock(idx, { aspectRatio: r })} onClipChange={c => updBlock(idx, { photoClip: c })} onMasksChange={m => updBlock(idx, { photoMasks: m } as any)} aspectRatio={block.aspectRatio as any} photoClip={block.photoClip as any} photoMasks={block.photoMasks as any} />
                        </div>
                      </Reveal>
                    )}

                    {/* ── TEXT ── */}
                    {block.type === "text" && (
                      <Reveal>
                        <div style={{ textAlign: "center", padding: "4px 8px" }}>
                          <InlineEdit tag="p" editMode={editMode} value={block.content || ""} onChange={v => updBlock(idx, { content: v })} multiline textLabel="Text"
                            style={{ fontFamily: F.serif, fontSize: 15, fontStyle: "italic", fontWeight: 400, color: rgba(C.ink, .65), lineHeight: 1.85, margin: 0 }} />
                        </div>
                      </Reveal>
                    )}

                    {/* ── LOCATION ── */}
                    {block.type === "location" && (
                      <Reveal>
                        <LocCard block={block} editMode={editMode} onUpdate={p => updBlock(idx, p)} />
                      </Reveal>
                    )}

                    {/* ── CALENDAR ── */}
                    {block.type === "calendar" && (
                      <Reveal>
                        <ElegantCard floralDeco={{ src: IMG.floral1, side: "left", top: -22, size: 72 }}>
                          <CalendarMonth date={profile.weddingDate} />
                        </ElegantCard>
                      </Reveal>
                    )}

                    {/* ── COUNTDOWN ── */}
                    {block.type === "countdown" && (
                      <Reveal>
                        <ElegantCard floralDeco={{ src: IMG.floral2, side: "right", top: -22, size: 72 }}>
                          <p style={{ fontFamily: F.sans, fontSize: 8, fontWeight: 500, letterSpacing: ".45em", textTransform: "uppercase", color: C.gold, textAlign: "center", margin: "0 0 18px" }}>Timp rămas</p>
                          <Countdown targetDate={profile.weddingDate} />
                        </ElegantCard>
                      </Reveal>
                    )}

                    {/* ── TIMELINE ── */}
                    {block.type === "timeline" && (() => {
                      const timelineItems = getTimelineItems();
                      if (!editMode && timelineItems.length === 0) return null;
                      return (
                        <Reveal>
                          <ElegantCard>
                            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                              <div style={{ flex: 1, height: .5, background: `linear-gradient(to right, transparent, ${rgba(C.gold, .4)})` }} />
                              <p style={{ fontFamily: F.sans, fontSize: 8, fontWeight: 600, letterSpacing: ".45em", textTransform: "uppercase", color: C.gold, margin: 0 }}>Programul Zilei</p>
                              <div style={{ flex: 1, height: .5, background: `linear-gradient(to left, transparent, ${rgba(C.gold, .4)})` }} />
                            </div>
                            {timelineItems.map((item: any, i: number) => (
                              <div key={item.id} style={{ display: "grid", gridTemplateColumns: "64px 1px 1fr auto", alignItems: "stretch", minHeight: 50, gap: "0 16px" }}>
                                <div style={{ textAlign: "right", paddingTop: 2 }}>
                                  <InlineTime editMode={editMode} value={item.time || ""} onChange={v => updateTimelineItem(item.id, { time: v })} textKey={`tl:${item.id}:time`} textLabel={`Ora ${i + 1}`}
                                    style={{ fontFamily: F.display, fontSize: 16, fontStyle: "italic", color: C.gold, lineHeight: 1.2, textAlign: "right", width: "100%" }} />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.gold, flexShrink: 0, marginTop: 5, border: `2px solid ${C.gold}` }} />
                                  {i < timelineItems.length - 1 && <div style={{ flex: 1, width: .5, background: `linear-gradient(to bottom, ${rgba(C.gold, .4)}, transparent)`, marginTop: 4 }} />}
                                </div>
                                <div style={{ paddingTop: 2, paddingBottom: i < timelineItems.length - 1 ? 22 : 0 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <InlineEdit tag="span" editMode={editMode} value={item.title || ""} onChange={v => updateTimelineItem(item.id, { title: v })} placeholder="Moment..." textKey={`tl:${item.id}:title`} textLabel={`Titlu ${i + 1}`}
                                      style={{ fontFamily: F.sans, fontSize: 14, fontWeight: 400, color: C.ink, display: "block", lineHeight: 1.4 }} />
                                    {editMode && <button type="button" onClick={() => removeTimelineItem(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 12, padding: "0 2px", opacity: .5 }}>✕</button>}
                                  </div>
                                  {(editMode || item.notice) && (
                                    <InlineEdit tag="span" editMode={editMode} value={item.notice || ""} onChange={v => updateTimelineItem(item.id, { notice: v })} placeholder="Notă..." textKey={`tl:${item.id}:notice`} textLabel={`Notă ${i + 1}`}
                                      style={{ fontFamily: F.serif, fontSize: 12, fontStyle: "italic", color: C.muted, display: "block", marginTop: 2, lineHeight: 1.55 }} />
                                  )}
                                </div>
                              </div>
                            ))}
                            <TimelineInsertButton editMode={editMode} colors={{ dark: C.gold, light: rgba(C.gold, .4), xl: rgba(C.gold, .06), muted: C.muted }} onAdd={preset => addTimelineItem(preset)} />
                          </ElegantCard>
                        </Reveal>
                      );
                    })()}

                    {/* ── MUSIC ── */}
                    {block.type === "music" && (
                      <Reveal><MusicBlock block={block} editMode={editMode} onUpdate={p => updBlock(idx, p)} imperativeRef={musicPlayRef} /></Reveal>
                    )}

                    {/* ── GIFT ── */}
                    {block.type === "gift" && (
                      <Reveal>
                        <ElegantCard>
                          <div style={{ textAlign: "center" }}>
                            <p style={{ fontFamily: F.sans, fontSize: 8, fontWeight: 500, letterSpacing: ".45em", textTransform: "uppercase", color: C.gold, margin: "0 0 6px" }}>◆</p>
                            <InlineEdit tag="h3" editMode={editMode} value={block.sectionTitle || "Sugestie de Cadou"} onChange={v => updBlock(idx, { sectionTitle: v })} textLabel="Cadou · titlu"
                              style={{ fontFamily: F.display, fontSize: 20, fontStyle: "italic", fontWeight: 400, color: C.ink, marginBottom: 10 }} />
                            <InlineEdit tag="p" editMode={editMode} value={block.content || ""} onChange={v => updBlock(idx, { content: v })} multiline textLabel="Cadou · text"
                              style={{ fontFamily: F.serif, fontSize: 13, fontStyle: "italic", color: C.muted, lineHeight: 1.7 }} />
                            {(block.iban || editMode) && (
                              <div style={{ marginTop: 14, padding: "10px 16px", border: `.5px solid ${rgba(C.gold, .35)}`, background: C.cream }}>
                                <InlineEdit tag="p" editMode={editMode} value={block.iban || ""} onChange={v => updBlock(idx, { iban: v })} placeholder="IBAN..."
                                  style={{ fontFamily: F.sans, fontSize: 11, fontWeight: 500, color: C.inkLight, letterSpacing: ".06em" }} />
                              </div>
                            )}
                          </div>
                        </ElegantCard>
                      </Reveal>
                    )}

                    {/* ── WHATSAPP ── */}
                    {block.type === "whatsapp" && (
                      <Reveal>
                        <div style={{ textAlign: "center" }}>
                          <a href={`https://wa.me/${(block.content || "").replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                            style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "14px 28px", border: `.5px solid ${rgba(C.gold, .35)}`, background: C.ivory, textDecoration: "none" }}>
                            <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, #25D366, #128C7E)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <MessageCircle style={{ width: 18, height: 18, color: "white" }} />
                            </div>
                            <div style={{ textAlign: "left" }}>
                              <InlineEdit tag="p" editMode={editMode} value={block.label || "Contact WhatsApp"} onChange={v => updBlock(idx, { label: v })} textLabel="WhatsApp · label"
                                style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 13, color: C.ink, margin: 0, letterSpacing: ".04em" }} />
                              <p style={{ fontFamily: F.sans, fontSize: 10, color: C.muted, margin: 0 }}>Răspundem cu promptitudine</p>
                            </div>
                          </a>
                          {editMode && (
                            <div style={{ display: "flex", alignItems: "center", gap: 8, border: `.5px solid ${rgba(C.gold, .25)}`, padding: "8px 16px", marginTop: 8, justifyContent: "center", background: C.cream }}>
                              <span style={{ fontFamily: F.sans, fontSize: 9, fontWeight: 600, letterSpacing: ".15em", textTransform: "uppercase", color: C.muted }}>Număr:</span>
                              <InlineEdit tag="span" editMode={editMode} value={block.content || "0700000000"} onChange={v => updBlock(idx, { content: v })} textLabel="WhatsApp · număr"
                                style={{ fontFamily: F.sans, fontSize: 13, color: C.ink, fontWeight: 500 }} />
                            </div>
                          )}
                        </div>
                      </Reveal>
                    )}

                    {/* ── FAMILY ── */}
                    {block.type === "family" && (() => {
                      const members: { name1: string; name2: string }[] = (() => { try { return JSON.parse(block.members || "[]"); } catch { return []; } })();
                      const updateMembers = (nm: { name1: string; name2: string }[]) => updBlock(idx, { members: JSON.stringify(nm) } as any);
                      return (
                        <Reveal>
                          <ElegantCard>
                            <div style={{ textAlign: "center", marginBottom: 14 }}>
                              <InlineEdit tag="p" editMode={editMode} value={block.label || "Părinții"} onChange={v => updBlock(idx, { label: v })} textLabel="Familie · titlu"
                                style={{ fontFamily: F.sans, fontSize: 8, fontWeight: 600, letterSpacing: ".42em", textTransform: "uppercase", color: C.gold, margin: "0 0 6px" }} />
                              <InlineEdit tag="p" editMode={editMode} value={block.content || "Cu drag și recunoștință"} onChange={v => updBlock(idx, { content: v })} textLabel="Familie · text"
                                style={{ fontFamily: F.serif, fontSize: 13, fontStyle: "italic", color: C.muted, margin: 0, lineHeight: 1.7 }} />
                            </div>
                            <GoldDivider thin style={{ marginBottom: 16 }} />
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                              {members.map((m, mi) => (
                                <div key={mi}>
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                                    <InlineEdit tag="span" editMode={editMode} value={m.name1} onChange={v => { const nm = [...members]; nm[mi] = { ...nm[mi], name1: v }; updateMembers(nm); }} textLabel={`Familie · ${mi + 1}A`}
                                      style={{ fontFamily: F.display, fontSize: 18, fontStyle: "italic", fontWeight: 400, color: C.ink, letterSpacing: "-.01em" }} />
                                    <span style={{ fontFamily: F.serif, color: rgba(C.gold, .6), fontSize: 14, fontStyle: "italic" }}>&amp;</span>
                                    <InlineEdit tag="span" editMode={editMode} value={m.name2} onChange={v => { const nm = [...members]; nm[mi] = { ...nm[mi], name2: v }; updateMembers(nm); }} textLabel={`Familie · ${mi + 1}B`}
                                      style={{ fontFamily: F.display, fontSize: 18, fontStyle: "italic", fontWeight: 400, color: C.ink, letterSpacing: "-.01em" }} />
                                    {editMode && members.length > 1 && <button type="button" onClick={() => updateMembers(members.filter((_, i) => i !== mi))} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 12, padding: "0 2px" }}>✕</button>}
                                  </div>
                                  {mi < members.length - 1 && <div style={{ height: .5, background: `linear-gradient(to right, transparent, ${rgba(C.gold, .2)}, transparent)`, margin: "8px 32px 0" }} />}
                                </div>
                              ))}
                            </div>
                            {editMode && (
                              <button type="button" onClick={() => updateMembers([...members, { name1: "Nume 1", name2: "Nume 2" }])}
                                style={{ marginTop: 14, background: "transparent", border: `.5px dashed ${rgba(C.gold, .4)}`, padding: "5px 20px", cursor: "pointer", fontFamily: F.sans, fontSize: 9, fontWeight: 600, letterSpacing: ".25em", textTransform: "uppercase", color: C.gold, display: "block", margin: "14px auto 0" }}>
                                + Adaugă
                              </button>
                            )}
                          </ElegantCard>
                        </Reveal>
                      );
                    })()}

                    {/* ── DATE ── */}
                    {block.type === "date" && (
                      <Reveal>
                        <div style={{ textAlign: "center", padding: "4px 0" }}>
                          <p style={{ fontFamily: F.serif, fontStyle: "italic", fontSize: 15, color: C.gold, margin: 0, letterSpacing: ".06em" }}>
                            {profile.weddingDate ? new Date(profile.weddingDate).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" }) : "Data Evenimentului"}
                          </p>
                        </div>
                      </Reveal>
                    )}

                    {/* ── DESCRIPTION ── */}
                    {block.type === "description" && (
                      <Reveal>
                        <div style={{ textAlign: "center", padding: "0 16px" }}>
                          <InlineEdit tag="p" editMode={editMode} value={block.content || ""} onChange={v => updBlock(idx, { content: v })} textLabel="Descriere"
                            style={{ fontFamily: F.serif, fontSize: 13, fontStyle: "italic", color: C.muted, lineHeight: 1.8, margin: 0 }} />
                        </div>
                      </Reveal>
                    )}

                  </BlockStyleProvider>
                </div>
                {editMode && (
                  <InsertBlockButton insertIdx={idx} openInsertAt={openInsertAt} setOpenInsertAt={setOpenInsertAt}
                    BLOCK_TYPES={BLOCK_TYPES} onInsert={(type, def) => handleInsertAt(idx, type, def)} />
                )}
              </div>
            ))}
          </div>

          {/* ── FOOTER ── */}
          <Reveal from="fade" delay={0.1}>
            <div style={{ marginTop: 40, textAlign: "center" }}>
              <GoldDivider ornament="◆" />
              <div style={{ padding: "28px 0 16px", position: "relative" }}>
                <img src={IMG.floral3} alt="" style={{ position: "absolute", left: "50%", top: -4, transform: "translateX(-50%)", width: 180, objectFit: "contain", opacity: .26, pointerEvents: "none" }} />
                {/* Rings */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 18, opacity: .42 }}>
                  <img src={IMG.rings} alt="" style={{ width: 74, height: 48, objectFit: "contain", animation: "w-rings 4s ease-in-out infinite", filter: `drop-shadow(0 8px 18px ${rgba(C.ink, .12)})` }} />
                </div>
                <p style={{ fontFamily: F.display, fontSize: 22, fontStyle: "italic", fontWeight: 400, color: rgba(C.ink, .5), margin: "0 0 6px" }}>
                  {name1} &amp; {name2}
                </p>
                {dateStrFull && (
                  <p style={{ fontFamily: F.sans, fontSize: 9, fontWeight: 400, letterSpacing: ".3em", textTransform: "uppercase", color: rgba(C.gold, .45), margin: "0 0 24px" }}>
                    {dateStrFull}
                  </p>
                )}
                {/* Bottom ornament */}
                <div style={{ display: "flex", justifyContent: "center", opacity: .2 }}>
                  <svg width="100" height="8" viewBox="0 0 100 8"><line x1="0" y1="4" x2="40" y2="4" stroke={C.gold} strokeWidth=".6"/><circle cx="50" cy="4" r="2.5" fill="none" stroke={C.gold} strokeWidth=".6"/><line x1="60" y1="4" x2="100" y2="4" stroke={C.gold} strokeWidth=".6"/></svg>
                </div>
              </div>
            </div>
          </Reveal>

        </div>
      </div>
    </>
  );
};

export default MaisonWeddingTemplate;

export const CASTLE_DEFAULT_BLOCKS = MAISON_DEFAULT_BLOCKS;
export const CASTLE_DEFAULTS = {
  partner1Name:        "Elena",
  partner2Name:        "Alexandru",
  eventType:           "wedding",
  welcomeText:         "la celebrarea căsătoriei lor",
  celebrationText:     "căsătoriei",
  showWelcomeText:     true,
  showCelebrationText: true,
  weddingDate:         "",
  rsvpButtonText:      "Confirmați Prezența",
  colorTheme:          "default",
};
