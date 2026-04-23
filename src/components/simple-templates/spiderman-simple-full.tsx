import { getSharedDefaultBlocks } from "./shared-default-blocks";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { InvitationTemplateProps, TemplateMeta } from "../invitations/types";
import { InvitationBlock, InvitationBlockType } from "../../types";
import { InlineEdit, InlineTime } from "../invitations/InlineEdit";
import FlipClock from "../invitations/FlipClock";
import { BlockStyleProvider, BlockStyle } from "../BlockStyleContext";
import { WeddingIcon } from "../TimelineIcons";
import { TimelineInsertButton } from "../invitations/TimelineInsertButton";
import {
  ChevronUp, ChevronDown, Eye, EyeOff, Trash2, Upload, Camera,
  Play, Pause, SkipForward, SkipBack, Gift, Music, MessageCircle, Sparkles
} from "lucide-react";
import { API_URL } from "../../config/api";

export const meta: TemplateMeta = {
  id: 'spiderman-invitation',
  name: "Spider-Man",
  category: 'kids',
  description: 'Cu mare putere vine mare responsabilitate - o invitatie de supererou, plina de actiune, plasa de paianjen si adrenalina!',
  colors: ['#CC0000', '#0A1A5C', '#FFD700', '#1a1a2e'],
  previewClass: "bg-red-700 border-blue-900",
  elementsClass: "bg-red-600",
};

function deleteUploadedFile(url: string | undefined) {
  if (!url || !url.startsWith('/uploads/')) return;
  const _session = JSON.parse(localStorage.getItem('weddingPro_session') || '{}');
  fetch(`${API_URL}/upload`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${_session?.token || ''}` },
    body: JSON.stringify({ url }),
  }).catch(() => {});
}

// --- IMAGES -------------------------------------------------------------------
// ?? MODIFICA aceste URL-uri cu pozele tale
const IMG_HERO_POSTER    = "/spiderman/spiderman-poster-2002.png";       // Poza 1 uploadata (poster crawling)
const IMG_HERO_SWING     = "/spiderman/spiderman-swing-city.png";        // Poza 2 uploadata (swing between buildings)
const IMG_LOGO           = "/spiderman/spiderman-logo.png";              // Logo Spider-Man text
const IMG_SPIDER_LOGO    = "/spiderman/spider-symbol.png";               // Simbolul paianjen pe piept
const IMG_WEB_CORNER_TL  = "/spiderman/web-corner-tl.png";              // Plasa colt stanga-sus
const IMG_WEB_CORNER_TR  = "/spiderman/web-corner-tr.png";              // Plasa colt dreapta-sus
const IMG_WEB_CORNER_BL  = "/spiderman/web-corner-bl.png";              // Plasa colt stanga-jos
const IMG_WEB_CORNER_BR  = "/spiderman/web-corner-br.png";              // Plasa colt dreapta-jos
const IMG_SPIDER_HANGING = "/spiderman/spiderman-hanging.png";           // Spidey agatat
const IMG_SPIDER_CRAWL   = "/spiderman/spiderman-crawling-wall.png";     // Spidey pe perete
const IMG_SPIDER_CLASSIC = "/spiderman/spiderman-classic-pose.png";      // Poza clasica
const IMG_SPIDER_JUMP    = "/spiderman/spiderman-jumping.png";           // Saritura
const IMG_SPIDER_SMALL_1 = "/spiderman/spider-small-1.png";             // Paianjen mic decorativ
const IMG_SPIDER_SMALL_2 = "/spiderman/spider-small-2.png";             // Paianjen mic decorativ
const IMG_WEB_LINE       = "/spiderman/web-line.png";                    // Linie plasa
const IMG_CITY_BG        = "/spiderman/nyc-skyline.png";                // Orizont New York
const IMG_SPIDER_STICKER_1 = "/spiderman/spidey-sticker-1.png";        // Sticker Spidey
const IMG_SPIDER_STICKER_2 = "/spiderman/spidey-sticker-2.png";        // Sticker Spidey
const IMG_SPIDER_STICKER_3 = "/spiderman/spidey-sticker-3.png";        // Sticker Spidey
const IMG_SPIDER_STICKER_4 = "/spiderman/spidey-sticker-4.png";        // Sticker Spidey

// --- DESIGN TOKENS ------------------------------------------------------------
const F = {
  display : "'Bangers','Anton',sans-serif",
  body    : "'Rajdhani','Barlow',sans-serif",
  label   : "'Oswald','Bebas Neue',sans-serif",
} as const;

type SpideyColors = {
  red: string;
  darkRed: string;
  blue: string;
  darkBlue: string;
  gold: string;
  silver: string;
  white: string;
  black: string;
  darkBg: string;
  webColor: string;
};

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const SPIDERMAN_THEME_BY_ID: Record<string, SpideyColors> = {
  default: {
    red: "#ff183f",
    darkRed: "#8f001b",
    blue: "#1d4eff",
    darkBlue: "#0a1749",
    gold: "#ffd447",
    silver: "#d5e2ff",
    white: "#f8fbff",
    black: "#0a0d15",
    darkBg: "#070b18",
    webColor: "rgba(213,226,255,0.26)",
  },
  "night-web": {
    red: "#ff3b5d",
    darkRed: "#7a1430",
    blue: "#3a63ff",
    darkBlue: "#070f33",
    gold: "#48d8ff",
    silver: "#b9cbff",
    white: "#f4f8ff",
    black: "#060910",
    darkBg: "#030714",
    webColor: "rgba(151,220,255,0.28)",
  },
  "neon-city": {
    red: "#ff2fa1",
    darkRed: "#7c0f60",
    blue: "#15c2ff",
    darkBlue: "#071025",
    gold: "#f7ff4f",
    silver: "#d9e3ff",
    white: "#f9fbff",
    black: "#09090f",
    darkBg: "#060912",
    webColor: "rgba(224,232,255,0.25)",
  },
  "sunset-hero": {
    red: "#ff6a00",
    darkRed: "#a62a00",
    blue: "#7f35ff",
    darkBlue: "#2a0c4c",
    gold: "#ffd166",
    silver: "#f3d9ff",
    white: "#fffaf4",
    black: "#140d15",
    darkBg: "#1b0b1f",
    webColor: "rgba(255,240,222,0.25)",
  },
};

const getSpidermanTheme = (themeId?: string): SpideyColors =>
  SPIDERMAN_THEME_BY_ID[themeId || "default"] || SPIDERMAN_THEME_BY_ID.default;

let C: SpideyColors = { ...SPIDERMAN_THEME_BY_ID.default };

// Runtime overrides (same pattern as Gabby)
let PINK_DARK = C.darkRed;
let PINK_D    = C.red;
let PINK_L    = C.blue;
let PINK_XL   = C.darkBg;
let CREAM     = "#1c2340";
let TEXT      = C.white;
let MUTED     = "rgba(200,210,230,0.65)";
let GOLD      = C.gold;

const SERIF  = F.body;
const SCRIPT = F.display;
const SANS   = F.body;

// --- GLOBAL CSS ---------------------------------------------------------------
const getSpCss = () => `
  @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Rajdhani:wght@400;600;700&family=Oswald:wght@400;600;700&display=swap');

  @keyframes sp-swing     { 0%{transform:rotate(-18deg) translateY(0)}50%{transform:rotate(18deg) translateY(8px)}100%{transform:rotate(-18deg) translateY(0)} }
  @keyframes sp-crawl     { 0%{transform:translateY(0) scaleX(1)}25%{transform:translateY(-12px) scaleX(1.04)}75%{transform:translateY(-8px) scaleX(.97)}100%{transform:translateY(0) scaleX(1)} }
  @keyframes sp-pulse     { 0%,100%{transform:scale(1);box-shadow:0 0 0 0 ${hexToRgba(C.red, 0.55)}}50%{transform:scale(1.04);box-shadow:0 0 0 18px ${hexToRgba(C.red, 0)} } }
  @keyframes sp-webShoot  { 0%{opacity:0;transform:scaleX(0) translateX(-20px)}60%{opacity:.7;transform:scaleX(1.1) translateX(4px)}100%{opacity:.5;transform:scaleX(1) translateX(0)} }
  @keyframes sp-senseRing { 0%{transform:scale(.6);opacity:.9}100%{transform:scale(2.2);opacity:0} }
  @keyframes sp-float     { 0%,100%{transform:translateY(0) rotate(-.4deg)}50%{transform:translateY(-10px) rotate(.4deg)} }
  @keyframes sp-floatR    { 0%,100%{transform:translateY(0) rotate(.5deg)}50%{transform:translateY(-9px) rotate(-.5deg)} }
  @keyframes sp-shimmer   { 0%{background-position:-200% 0}100%{background-position:200% 0} }
  @keyframes sp-twinkle   { 0%,100%{opacity:.15;transform:scale(.6) rotate(0)}50%{opacity:1;transform:scale(1.3) rotate(25deg)} }
  @keyframes sp-popIn     { 0%{transform:scale(0) rotate(-8deg);opacity:0}65%{transform:scale(1.08) rotate(2deg);opacity:1}100%{transform:scale(1) rotate(0);opacity:1} }
  @keyframes sp-slideUp   { 0%{transform:translateY(40px);opacity:0}100%{transform:translateY(0);opacity:1} }
  @keyframes sp-confetti  { 0%{transform:translateY(-20px) rotate(0);opacity:1}100%{transform:translateY(110vh) rotate(720deg);opacity:0} }
  @keyframes sp-heartBeat { 0%,100%{transform:scale(1)}14%{transform:scale(1.14)}28%{transform:scale(1)}42%{transform:scale(1.07)}70%{transform:scale(1)} }
  @keyframes sp-bgShift   { 0%,100%{background-position:0% 50%}50%{background-position:100% 50%} }
  @keyframes sp-logoIn    { 0%{transform:scale(0) rotate(-15deg);opacity:0}60%{transform:scale(1.1) rotate(3deg);opacity:1}80%{transform:scale(.97) rotate(-1deg)}100%{transform:scale(1) rotate(0);opacity:1} }
  @keyframes sp-webDraw   { 0%{stroke-dashoffset:800}100%{stroke-dashoffset:0} }
  @keyframes sp-scanLine  { 0%{transform:translateY(-100%)}100%{transform:translateY(100vh)} }
  .sp-hover:hover { transform:scale(1.08) rotate(-2deg) !important; cursor:pointer; transition:transform .2s ease; }
`;

// --- SVG WEB PATTERNS ---------------------------------------------------------
const WebPattern: React.FC<{ opacity?: number; color?: string }> = ({ opacity = 0.08, color = "#ffffff" }) => (
  <svg
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    viewBox="0 0 400 400"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <pattern id="sp-web-grid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
        {/* Radial web lines */}
        <line x1="40" y1="40" x2="0"  y2="0"  stroke={color} strokeWidth=".6" opacity={opacity}/>
        <line x1="40" y1="40" x2="40" y2="0"  stroke={color} strokeWidth=".6" opacity={opacity}/>
        <line x1="40" y1="40" x2="80" y2="0"  stroke={color} strokeWidth=".6" opacity={opacity}/>
        <line x1="40" y1="40" x2="80" y2="40" stroke={color} strokeWidth=".6" opacity={opacity}/>
        <line x1="40" y1="40" x2="80" y2="80" stroke={color} strokeWidth=".6" opacity={opacity}/>
        <line x1="40" y1="40" x2="40" y2="80" stroke={color} strokeWidth=".6" opacity={opacity}/>
        <line x1="40" y1="40" x2="0"  y2="80" stroke={color} strokeWidth=".6" opacity={opacity}/>
        <line x1="40" y1="40" x2="0"  y2="40" stroke={color} strokeWidth=".6" opacity={opacity}/>
        {/* Concentric arcs */}
        <ellipse cx="40" cy="40" rx="12" ry="12" fill="none" stroke={color} strokeWidth=".5" opacity={opacity}/>
        <ellipse cx="40" cy="40" rx="24" ry="24" fill="none" stroke={color} strokeWidth=".5" opacity={opacity}/>
        <ellipse cx="40" cy="40" rx="38" ry="38" fill="none" stroke={color} strokeWidth=".5" opacity={opacity}/>
      </pattern>
    </defs>
    <rect width="400" height="400" fill="url(#sp-web-grid)"/>
  </svg>
);

const CORNER_CENTER: Record<"tl" | "tr" | "bl" | "br", { x: number; y: number }> = {
  tl: { x: 0, y: 0 },
  tr: { x: 140, y: 0 },
  bl: { x: 0, y: 140 },
  br: { x: 140, y: 140 },
};

const CORNER_ANGLE_RANGE: Record<"tl" | "tr" | "bl" | "br", [number, number]> = {
  tl: [0, 90],
  tr: [90, 180],
  bl: [-90, 0],
  br: [180, 270],
};

const polarPoint = (cx: number, cy: number, radius: number, angleDeg: number) => {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
};

const arcPath = (cx: number, cy: number, radius: number, startDeg: number, endDeg: number) => {
  const s = polarPoint(cx, cy, radius, startDeg);
  const e = polarPoint(cx, cy, radius, endDeg);
  return `M ${s.x} ${s.y} A ${radius} ${radius} 0 0 1 ${e.x} ${e.y}`;
};

// Corner web SVG - round quarter-web, more visible
const CornerWeb: React.FC<{ corner: "tl" | "tr" | "bl" | "br"; size?: number; opacity?: number }> = ({
  corner,
  size = 140,
  opacity = 0.58,
}) => {
  const positions: Record<string, React.CSSProperties> = {
    tl: { top: 0, left: 0 },
    tr: { top: 0, right: 0 },
    bl: { bottom: 0, left: 0 },
    br: { bottom: 0, right: 0 },
  };
  const center = CORNER_CENTER[corner];
  const [a0, a1] = CORNER_ANGLE_RANGE[corner];
  const maxR = 132;
  const ringRadii = [14, 24, 36, 50, 66, 84, 104, 126];
  const spokeAngles = Array.from({ length: 11 }, (_, i) => a0 + ((a1 - a0) * i) / 10);
  const webStroke = hexToRgba(C.white, 0.82);

  return (
    <svg
      style={{
        position: "absolute",
        pointerEvents: "none",
        opacity,
        filter: `drop-shadow(0 0 8px ${hexToRgba(C.silver, 0.28)})`,
        ...positions[corner],
      }}
      width={size}
      height={size}
      viewBox="0 0 140 140"
    >
      {/* Spokes */}
      {spokeAngles.map((angle, i) => {
        const p = polarPoint(center.x, center.y, maxR, angle);
        return (
          <line
            key={`spoke-${corner}-${i}`}
            x1={center.x}
            y1={center.y}
            x2={p.x}
            y2={p.y}
            stroke={webStroke}
            strokeWidth={i % 2 === 0 ? 1 : 0.8}
            strokeLinecap="round"
            opacity={0.72}
          />
        );
      })}

      {/* Concentric quarter rings */}
      {ringRadii.map((r, i) => (
        <path
          key={`ring-${corner}-${r}`}
          d={arcPath(center.x, center.y, r, a0, a1)}
          fill="none"
          stroke={webStroke}
          strokeWidth={i < 2 ? 1 : 0.9}
          strokeLinecap="round"
          opacity={0.78 - i * 0.06}
        />
      ))}

      {/* Tiny anchor highlight in corner */}
      <circle cx={center.x} cy={center.y} r={2.2} fill={hexToRgba(C.white, 0.9)} />
    </svg>
  );
};

// Spidey sense rings
const SpideySense: React.FC<{ x: number; y: number; delay?: number }> = ({ x, y, delay = 0 }) => (
  <div style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, pointerEvents: 'none', zIndex: 1 }}>
    {[0, 0.4, 0.8].map((d, i) => (
      <div key={i} style={{
        position: 'absolute', width: 24, height: 24,
        borderRadius: '50%', border: `1.5px solid ${C.gold}`,
        transform: 'translate(-50%,-50%)',
        animation: `sp-senseRing 2.4s ${delay + d}s ease-out infinite`,
        opacity: 0,
      }}/>
    ))}
  </div>
);

// --- SCROLL REVEAL ------------------------------------------------------------
function useReveal<T extends HTMLElement>(threshold = 0.1): [React.RefObject<T>, boolean] {
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

const Reveal: React.FC<{ children: React.ReactNode; delay?: number; from?: 'bottom' | 'left' | 'right' | 'fade'; style?: React.CSSProperties }> =
  ({ children, delay = 0, from = 'bottom', style }) => {
    const [ref, vis] = useReveal<HTMLDivElement>();
    const t: Record<string, string> = { bottom: 'translateY(30px)', left: 'translateX(-30px)', right: 'translateX(30px)', fade: 'translateY(0)' };
    return (
      <div ref={ref} style={{
        opacity: vis ? 1 : 0, transform: vis ? 'translate(0,0)' : t[from],
        transition: `opacity .7s ${delay}s cubic-bezier(.22,1,.36,1),transform .7s ${delay}s cubic-bezier(.22,1,.36,1)`, ...style
      }}>
        {children}
      </div>
    );
  };

// --- CONFETTI -----------------------------------------------------------------
const Confetto: React.FC<{ x: number; color: string; delay: number; size: number; shape: string }> =
  ({ x, color, delay, size, shape }) => (
    <div style={{
      position: 'fixed', left: `${x}%`, top: '-10px',
      width: size, height: size, background: color,
      borderRadius: shape === 'circle' ? '50%' : '3px',
      animation: `sp-confetti ${2.5 + Math.random() * 2}s ${delay}s linear forwards`,
      pointerEvents: 'none', zIndex: 999,
    }} />
  );

// --- WEB DIVIDER -------------------------------------------------------------
const WebDivider: React.FC<{ thin?: boolean }> = ({ thin = false }) => {
  const railHeight = thin ? 12 : 20;
  const lineY = thin ? 6 : 10;
  const lineStroke = thin ? 1.2 : 1.7;
  const dotRadius = thin ? 1.6 : 2.4;
  const dotOpacity = thin ? 0.72 : 0.86;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        position: "relative",
        height: railHeight,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          flex: 1,
          height: thin ? 2 : 3,
          background: `linear-gradient(90deg, transparent, ${C.red}, ${C.gold}, ${C.red}, transparent)`,
        }}
      />
      <div style={{ position: "absolute", inset: 0 }}>
        <svg width="100%" height="100%" viewBox={`0 0 400 ${railHeight}`} preserveAspectRatio="none">
          <path
            d={`M 0 ${lineY} Q 50 ${lineY - 7} 100 ${lineY} Q 150 ${lineY + 7} 200 ${lineY} Q 250 ${lineY - 7} 300 ${lineY} Q 350 ${lineY + 7} 400 ${lineY}`}
            fill="none"
            stroke={C.red}
            strokeWidth={lineStroke}
            opacity="0.72"
            strokeLinecap="round"
          />
          {[50, 100, 150, 200, 250, 300, 350].map((x, i) => (
            <circle key={i} cx={x} cy={lineY} r={dotRadius} fill={C.gold} opacity={dotOpacity} />
          ))}
        </svg>
      </div>
    </div>
  );
};

// --- LOCATION CARD ------------------------------------------------------------
const LocCard: React.FC<{ block: InvitationBlock; editMode: boolean; onUpdate: (p: Partial<InvitationBlock>) => void; stickerSrc?: string }> =
  ({ block, editMode, onUpdate, stickerSrc }) => {
    const [editWaze, setEditWaze] = useState(false);
    const name = block.locationName || "";
    const time = block.time || "";
    const address = block.locationAddress || "";
    const label = block.label || "Locatie";
    const wazeLink = block.wazeLink || "";
    if (!editMode && !name && !time && !address && !wazeLink) return null;
    const enc = address ? encodeURIComponent(address) : "";
    return (
      <div style={{
        background: `linear-gradient(135deg, ${hexToRgba(C.darkBlue, 0.9)}, ${hexToRgba(C.darkBg, 0.95)})`,
        border: `2px solid ${C.red}66`,
        borderRadius: 16, padding: '18px 22px',
        backdropFilter: 'blur(10px)',
        boxShadow: `0 6px 28px ${hexToRgba(C.red, 0.25)}, inset 0 1px 0 rgba(255,255,255,.07)`,
        position: 'relative', overflow: 'hidden',
      }}>
        <WebPattern opacity={0.06} />
        <CornerWeb corner="tr" size={80} />
        {stickerSrc && (
          <img src={stickerSrc} alt="" style={{
            position: "absolute", top: -20, right: -4, width: 74, height: 74,
            objectFit: "contain", filter: "drop-shadow(0 4px 12px rgba(0,0,0,.4))", pointerEvents: "none",
          }}/>
        )}
        <WebDivider thin />
        <div style={{ paddingTop: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 14, animation: 'sp-twinkle 2.5s ease-in-out infinite' }}>{"\u{1F577}"}</span>
            <InlineEdit tag="p" editMode={editMode} value={label} onChange={v => onUpdate({ label: v })}
              placeholder="Tip locatie..." textLabel="Locatie - label"
              style={{ fontFamily: F.label, fontSize: 9, letterSpacing: '.45em', textTransform: 'uppercase', color: C.gold, margin: 0 }}
            />
          </div>
          {(editMode || time) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <span style={{ fontSize: 14 }}>{"\u{1F552}"}</span>
              <InlineTime value={time} onChange={v => onUpdate({ time: v })} editMode={editMode} textLabel="Locatie - ora"
                style={{ fontFamily: F.display, fontSize: 22, color: C.red, margin: 0, letterSpacing: 2 }}
              />
            </div>
          )}
          <InlineEdit tag="p" editMode={editMode} value={name} onChange={v => onUpdate({ locationName: v })}
            placeholder="Numele locatiei..." textLabel="Locatie - nume"
            style={{ fontFamily: F.body, fontSize: 15, fontWeight: 700, color: C.white, margin: '0 0 4px' }}
          />
          {(editMode || address) && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 4 }}>
              <span style={{ fontSize: 12, flexShrink: 0, marginTop: 2 }}>{"\u{1F4CD}"}</span>
              <InlineEdit tag="p" editMode={editMode} value={address} onChange={v => onUpdate({ locationAddress: v })}
                placeholder="Adresa completa..." multiline textLabel="Locatie - adresa"
                style={{ fontFamily: F.body, fontSize: 11, fontWeight: 600, color: MUTED, margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}
              />
            </div>
          )}
          {(editMode || wazeLink || address) && (
            <div style={{ marginTop: 14 }}>
              {editMode && editWaze && (
                <input autoFocus value={wazeLink} onChange={e => onUpdate({ wazeLink: e.target.value })}
                  onBlur={() => setEditWaze(false)} onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditWaze(false); }}
                  placeholder="https://waze.com/ul?..."
                  style={{ width: '100%', fontFamily: F.body, fontSize: 12, padding: '10px 12px', borderRadius: 10,
                    border: `2px solid ${C.red}`, outline: 'none', background: hexToRgba(C.darkBlue, 0.8), color: C.white, marginBottom: 10 }}
                />
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                {(editMode || wazeLink) && (
                  editMode ? (
                    <button type="button" onClick={() => setEditWaze(true)} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%',
                      padding: '11px 16px', borderRadius: 12, border: `1.5px solid ${C.red}66`,
                      background: hexToRgba(C.red, 0.15), color: C.white, fontFamily: F.label,
                      fontSize: 10, letterSpacing: '.25em', textTransform: 'uppercase', cursor: 'pointer',
                    }}>
                      <span style={{ fontSize: 14 }}>{"\u{1F697}"}</span>
                      {wazeLink ? 'Waze' : 'Adauga Waze'}
                    </button>
                  ) : (
                    <a href={wazeLink} target="_blank" rel="noopener noreferrer" style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%',
                      padding: '11px 16px', borderRadius: 12, border: `1.5px solid ${C.red}66`,
                      background: hexToRgba(C.red, 0.15), color: C.white, fontFamily: F.label,
                      fontSize: 10, letterSpacing: '.25em', textTransform: 'uppercase', textDecoration: 'none',
                    }}>
                      <span style={{ fontSize: 14 }}>{"\u{1F697}"}</span> Waze
                    </a>
                  )
                )}
                {address && (
                  <a href={`https://maps.google.com/?q=${enc}`} target="_blank" rel="noopener noreferrer" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%',
                    padding: '11px 16px', borderRadius: 12, border: `1.5px solid ${C.blue}88`,
                    background: hexToRgba(C.blue, 0.2), color: C.silver, fontFamily: F.label,
                    fontSize: 10, letterSpacing: '.25em', textTransform: 'uppercase', textDecoration: 'none',
                  }}>
                    <span style={{ fontSize: 14 }}>{"\u{1F5FA}"}</span> Google Maps
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

// --- PHOTO BLOCK (same clip system) ------------------------------------------
type ClipShape = 'rect' | 'rounded' | 'rounded-lg' | 'squircle' | 'circle' | 'arch' | 'arch-b' | 'hexagon' | 'diamond' | 'triangle' | 'star' | 'heart' | 'diagonal' | 'diagonal-r' | 'wave-b' | 'wave-t' | 'wave-both' | 'blob' | 'blob2' | 'blob3' | 'blob4';
type MaskEffect = 'fade-b' | 'fade-t' | 'fade-l' | 'fade-r' | 'vignette';

function getClipStyle(clip: ClipShape): React.CSSProperties {
  const m: Record<ClipShape, React.CSSProperties> = {
    rect: { borderRadius: 0 }, rounded: { borderRadius: 16 }, 'rounded-lg': { borderRadius: 32 },
    squircle: { borderRadius: '30% 30% 30% 30% / 30% 30% 30% 30%' }, circle: { borderRadius: '50%' },
    arch: { borderRadius: '50% 50% 0 0 / 40% 40% 0 0' }, 'arch-b': { borderRadius: '0 0 50% 50% / 0 0 40% 40%' },
    hexagon: { clipPath: 'polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%)' },
    diamond: { clipPath: 'polygon(50% 0%,100% 50%,50% 100%,0% 50%)' },
    triangle: { clipPath: 'polygon(50% 0%,100% 100%,0% 100%)' },
    star: { clipPath: 'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)' },
    heart: { clipPath: 'url(#sp-clip-heart)' }, diagonal: { clipPath: 'polygon(0 0,100% 0,100% 80%,0 100%)' },
    'diagonal-r': { clipPath: 'polygon(0 0,100% 0,100% 100%,0 80%)' },
    'wave-b': { clipPath: 'url(#sp-clip-wave-b)' }, 'wave-t': { clipPath: 'url(#sp-clip-wave-t)' },
    'wave-both': { clipPath: 'url(#sp-clip-wave-both)' },
    blob: { clipPath: 'url(#sp-clip-blob)' }, blob2: { clipPath: 'url(#sp-clip-blob2)' },
    blob3: { clipPath: 'url(#sp-clip-blob3)' }, blob4: { clipPath: 'url(#sp-clip-blob4)' },
  };
  return m[clip] || {};
}
function getMaskStyle(effects: MaskEffect[]): React.CSSProperties {
  if (!effects.length) return {};
  const layers = effects.map(e => {
    switch (e) {
      case 'fade-b': return 'linear-gradient(to bottom, black 40%, transparent 100%)';
      case 'fade-t': return 'linear-gradient(to top, black 40%, transparent 100%)';
      case 'fade-l': return 'linear-gradient(to left, black 40%, transparent 100%)';
      case 'fade-r': return 'linear-gradient(to right, black 40%, transparent 100%)';
      case 'vignette': return 'radial-gradient(ellipse 80% 80% at center, black 40%, transparent 100%)';
      default: return 'none';
    }
  });
  const mask = layers.join(', ');
  return { WebkitMaskImage: mask, maskImage: mask, WebkitMaskComposite: effects.length > 1 ? 'source-in' : 'unset', maskComposite: effects.length > 1 ? 'intersect' : 'unset' };
}

const PhotoClipDefs: React.FC = () => (
  <svg width="0" height="0" style={{ position: 'absolute', overflow: 'hidden', pointerEvents: 'none' }}>
    <defs>
      <clipPath id="sp-clip-wave-b" clipPathUnits="objectBoundingBox"><path d="M0,0 L1,0 L1,0.78 Q0.875,0.65 0.75,0.78 Q0.625,0.91 0.5,0.78 Q0.375,0.65 0.25,0.78 Q0.125,0.91 0,0.78 Z"/></clipPath>
      <clipPath id="sp-clip-wave-t" clipPathUnits="objectBoundingBox"><path d="M0,0.22 Q0.125,0.09 0.25,0.22 Q0.375,0.35 0.5,0.22 Q0.625,0.09 0.75,0.22 Q0.875,0.35 1,0.22 L1,1 L0,1 Z"/></clipPath>
      <clipPath id="sp-clip-wave-both" clipPathUnits="objectBoundingBox"><path d="M0,0.22 Q0.125,0.09 0.25,0.22 Q0.375,0.35 0.5,0.22 Q0.625,0.09 0.75,0.22 Q0.875,0.35 1,0.22 L1,0.78 Q0.875,0.65 0.75,0.78 Q0.625,0.91 0.5,0.78 Q0.375,0.65 0.25,0.78 Q0.125,0.91 0,0.78 Z"/></clipPath>
      <clipPath id="sp-clip-heart" clipPathUnits="objectBoundingBox"><path d="M0.5,0.85 C0.5,0.85 0.05,0.55 0.05,0.3 C0.05,0.12 0.18,0.05 0.3,0.1 C0.4,0.14 0.5,0.25 0.5,0.25 C0.5,0.25 0.6,0.14 0.7,0.1 C0.82,0.05 0.95,0.12 0.95,0.3 C0.95,0.55 0.5,0.85 0.5,0.85Z"/></clipPath>
      <clipPath id="sp-clip-blob"  clipPathUnits="objectBoundingBox"><path d="M0.5,0.03 C0.72,0.01 0.95,0.14 0.97,0.38 C0.99,0.58 0.88,0.78 0.72,0.88 C0.56,0.98 0.35,0.99 0.2,0.88 C0.05,0.77 -0.02,0.55 0.04,0.36 C0.1,0.17 0.28,0.05 0.5,0.03Z"/></clipPath>
      <clipPath id="sp-clip-blob2" clipPathUnits="objectBoundingBox"><path d="M0.75,0.224 C0.831,0.271 0.911,0.342 0.921,0.422 C0.93,0.502 0.869,0.59 0.808,0.661 C0.747,0.732 0.685,0.785 0.611,0.816 C0.538,0.847 0.453,0.856 0.389,0.824 C0.326,0.792 0.285,0.72 0.233,0.647 C0.181,0.573 0.119,0.497 0.113,0.414 C0.107,0.331 0.157,0.241 0.231,0.193 C0.305,0.145 0.402,0.138 0.493,0.147 C0.584,0.155 0.668,0.178 0.75,0.224Z"/></clipPath>
      <clipPath id="sp-clip-blob3" clipPathUnits="objectBoundingBox"><path d="M0.5,0.05 C0.65,0.02 0.85,0.1 0.92,0.28 C0.99,0.46 0.93,0.68 0.8,0.82 C0.67,0.96 0.46,1.0 0.3,0.93 C0.14,0.86 0.02,0.68 0.01,0.5 C0.0,0.32 0.1,0.14 0.25,0.07 C0.33,0.03 0.42,0.07 0.5,0.05Z"/></clipPath>
      <clipPath id="sp-clip-blob4" clipPathUnits="objectBoundingBox"><path d="M0.18,0.08 C0.32,0.01 0.54,0.0 0.68,0.08 C0.82,0.16 0.96,0.32 0.97,0.5 C0.98,0.68 0.86,0.86 0.7,0.93 C0.54,1.0 0.32,0.97 0.18,0.88 C0.04,0.79 -0.04,0.62 0.02,0.45 C0.07,0.28 0.04,0.15 0.18,0.08Z"/></clipPath>
    </defs>
  </svg>
);

const PhotoBlock: React.FC<{
  imageData?: string; altText?: string; editMode: boolean;
  onUpload: (url: string) => void; onRemove: () => void;
  onClipChange: (c: ClipShape) => void; onMasksChange: (m: MaskEffect[]) => void;
  onRatioChange: (r: '1:1' | '4:3' | '3:4' | '16:9' | 'free') => void;
  aspectRatio?: '1:1' | '4:3' | '3:4' | '16:9' | 'free';
  photoClip?: ClipShape; photoMasks?: MaskEffect[];
  placeholderInitial1?: string;
}> = ({ imageData, altText, editMode, onUpload, onRemove, aspectRatio = 'free', photoClip = 'rect', photoMasks = [], placeholderInitial1 }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const pt: Record<string, string> = { '1:1': '100%', '4:3': '75%', '3:4': '133%', '16:9': '56.25%', free: '66.6%' };
  const combined = { ...getClipStyle(photoClip), ...getMaskStyle(photoMasks) };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setUploading(true);
    deleteUploadedFile(imageData);
    try {
      const form = new FormData(); form.append('file', file);
      const _s = JSON.parse(localStorage.getItem('weddingPro_session') || '{}');
      const res = await fetch(`${API_URL}/upload`, { method: 'POST', headers: { Authorization: `Bearer ${_s?.token || ''}` }, body: form });
      const { url } = await res.json(); onUpload(url);
    } catch {} finally { setUploading(false); }
  };

  if (imageData) return (
    <div style={{ position: 'relative' }}>
      <PhotoClipDefs />
      <div style={{ position: 'relative', paddingTop: pt[aspectRatio], overflow: 'hidden', ...combined }}>
        <img src={imageData} alt={altText || ''} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        {editMode && (
          <div className="absolute inset-0 bg-transparent opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button onClick={() => fileRef.current?.click()} className="p-2 bg-white/90 rounded-full text-red-700 shadow"><Camera className="w-5 h-5"/></button>
            <button onClick={() => { deleteUploadedFile(imageData); onRemove(); }} className="p-2 bg-white/90 rounded-full text-red-600 shadow"><Trash2 className="w-5 h-5"/></button>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} style={{ display: 'none' }} />
    </div>
  );

  return (
    <div style={{ position: 'relative' }}>
      <PhotoClipDefs />
      <div style={{ position: 'relative', paddingTop: pt[aspectRatio], ...combined, overflow: 'hidden', cursor: editMode ? 'pointer' : 'default' }}
        onClick={editMode ? () => fileRef.current?.click() : undefined}>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${C.darkBlue} 0%, ${C.darkRed} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <WebPattern opacity={0.12} />
          {uploading
            ? <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
            : <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <span style={{ fontFamily: SCRIPT, fontSize: 64, color: 'rgba(255,255,255,0.3)' }}>{"\u{1F577}"}</span>
                <p style={{ fontFamily: F.label, fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.3em', textTransform: 'uppercase', margin: 0 }}>
                  {(placeholderInitial1 || 'S')[0].toUpperCase()}
                </p>
              </div>
          }
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} style={{ display: 'none' }} />
    </div>
  );
};

// --- CALENDAR -----------------------------------------------------------------
const CalendarMonth: React.FC<{ date: string | undefined }> = ({ date }) => {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear(), month = d.getMonth(), day = d.getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNames = ['IANUARIE','FEBRUARIE','MARTIE','APRILIE','MAI','IUNIE','IULIE','AUGUST','SEPTEMBRIE','OCTOMBRIE','NOIEMBRIE','DECEMBRIE'];
  const dayLabels = ['L','M','M','J','V','S','D'];
  const startOffset = (firstDay + 6) % 7;
  const cells: (number | null)[] = [...Array(startOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  return (
    <div style={{ background: hexToRgba(C.darkBlue, 0.8), borderRadius: 16, padding: 22, textAlign: 'center', border: `2px solid ${C.red}44`, position: 'relative', overflow: 'hidden' }}>
      <WebPattern opacity={0.06} />
      <CornerWeb corner="tl" size={70} />
      <CornerWeb corner="br" size={70} />
      <p style={{ fontFamily: F.label, fontSize: 10, fontWeight: 700, letterSpacing: '0.3em', color: C.gold, marginBottom: 14, position: 'relative', zIndex: 1 }}>{monthNames[month]} {year}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 6, position: 'relative', zIndex: 1 }}>
        {dayLabels.map((l, i) => <div key={`${l}-${i}`} style={{ fontSize: 9, fontWeight: 700, color: MUTED }}>{l}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, position: 'relative', zIndex: 1 }}>
        {cells.map((cell, i) => {
          const isToday = cell === day;
          return <div key={i} style={{ height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: isToday ? 700 : 500, color: isToday ? C.white : cell ? C.silver : 'transparent', background: isToday ? C.red : 'transparent', borderRadius: '50%' }}>{cell || ''}</div>;
        })}
      </div>
    </div>
  );
};

// --- MUSIC BLOCK -------------------------------------------------------------
const MusicBlock: React.FC<{
  block: InvitationBlock;
  editMode: boolean;
  onUpdate: (p: Partial<InvitationBlock>) => void;
  imperativeRef?: React.MutableRefObject<{ unlock: () => void; play: () => void; pause: () => void } | null>;
}> = ({ block, editMode, onUpdate, imperativeRef }) => {
  const audioRef  = useRef<HTMLAudioElement>(null);
  const mp3Ref    = useRef<HTMLInputElement>(null);
  const [playing,  setPlaying]  = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showYt,   setShowYt]   = useState(false);
  const [ytUrl,    setYtUrl]    = useState('');

  useEffect(() => {
    const a = audioRef.current; if (!a) return;
    const onTime  = () => setProgress(a.currentTime);
    const onDur   = () => setDuration(a.duration);
    const onEnd   = () => { setPlaying(false); setProgress(0); };
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('loadedmetadata', onDur);
    a.addEventListener('ended', onEnd);
    a.addEventListener('play', () => setPlaying(true));
    a.addEventListener('pause', () => setPlaying(false));
    return () => { a.removeEventListener('timeupdate', onTime); a.removeEventListener('loadedmetadata', onDur); a.removeEventListener('ended', onEnd); };
  }, [block.musicUrl]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const pct = duration ? `${(progress / duration) * 100}%` : '0%';
  const toggle = () => {
    const a = audioRef.current; if (!a) return;
    if (playing) { a.pause(); } else { a.play().catch(() => {}); }
  };
  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    audioRef.current.currentTime = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * duration;
  };
  const handleMp3 = async (file: File) => {
    if (!file.type.startsWith('audio/')) return;
    const _s = JSON.parse(localStorage.getItem('weddingPro_session') || '{}');
    const form = new FormData(); form.append('file', file);
    const res = await fetch(`${API_URL}/upload`, { method: 'POST', headers: { Authorization: `Bearer ${_s?.token || ''}` }, body: form });
    const { url } = await res.json();
    onUpdate({ musicUrl: url, musicType: 'mp3' });
  };
  const [ytDownloading, setYtDownloading] = useState(false);
  const [ytError, setYtError] = useState('');
  const submitYt = async () => {
    const trimmed = ytUrl.trim(); if (!trimmed) return;
    const _s = JSON.parse(localStorage.getItem('weddingPro_session') || '{}');
    setYtDownloading(true); setYtError('');
    try {
      const res = await fetch(`${API_URL}/download-yt-audio`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${_s?.token || ''}` }, body: JSON.stringify({ url: trimmed }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Eroare download');
      onUpdate({ musicUrl: data.url, musicType: 'mp3', musicTitle: data.title || '', musicArtist: data.author || '' });
      setShowYt(false); setYtUrl('');
    } catch (e: any) { setYtError(e.message || 'Nu s-a putut descarca melodia.'); }
    finally { setYtDownloading(false); }
  };
  useEffect(() => {
    if (!imperativeRef) return;
    imperativeRef.current = {
      unlock: () => { if (audioRef.current && block.musicUrl) { audioRef.current.play().then(() => { audioRef.current!.pause(); audioRef.current!.currentTime = 0; }).catch(() => {}); } },
      play:   () => { if (audioRef.current && block.musicUrl) audioRef.current.play().catch(() => {}); },
      pause:  () => { if (audioRef.current) audioRef.current.pause(); },
    };
  });

  const isActive = !!block.musicUrl;
  return (
    <div style={{ background: hexToRgba(C.darkBlue, 0.85), border: `1.5px solid ${playing ? C.red : C.blue}`, borderRadius: 16, padding: '20px 24px', transition: 'border-color .4s,box-shadow .4s', boxShadow: playing ? `0 0 0 3px ${C.red}33` : 'none', position: 'relative', overflow: 'hidden' }}>
      <style>{`@keyframes sp-bar{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}`}</style>
      <WebPattern opacity={0.05} />
      {block.musicType === 'mp3' && block.musicUrl && <audio ref={audioRef} src={block.musicUrl} preload="metadata" />}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, position: 'relative', zIndex: 1 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: playing ? C.red : hexToRgba(C.red, 0.15), border: `1.5px solid ${C.red}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .3s' }}>
          <Music className="w-4 h-4" style={{ color: playing ? 'white' : C.red }} />
        </div>
        <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: playing ? C.red : MUTED }}>
          {playing ? 'Se reda acum' : 'Melodia Eroului'}
        </span>
        {playing && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 14, marginLeft: 'auto' }}>
            {[0, 0.2, 0.1, 0.3].map((delay, i) => (
              <div key={i} style={{ width: 3, height: 14, background: C.red, borderRadius: 2, transformOrigin: 'bottom', animation: `sp-bar .7s ease-in-out ${delay}s infinite` }} />
            ))}
          </div>
        )}
      </div>
      {!isActive && editMode && (
        <div style={{ position: 'relative', zIndex: 1 }}>
          {showYt ? (
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: ytError ? 6 : 0 }}>
                <input value={ytUrl} onChange={e => { setYtUrl(e.target.value); setYtError(''); }}
                  onKeyDown={e => e.key === 'Enter' && !ytDownloading && submitYt()}
                  placeholder="https://youtu.be/..." autoFocus disabled={ytDownloading}
                  style={{ flex: 1, background: hexToRgba(C.darkBlue, 0.8), border: `1px solid ${ytError ? '#ef4444' : C.blue}`, borderRadius: 8, padding: '9px 12px', fontFamily: SANS, fontSize: 11, color: C.white, outline: 'none' }}
                />
                <button type="button" onClick={submitYt} disabled={ytDownloading}
                  style={{ background: C.red, border: 'none', borderRadius: 8, padding: '0 14px', cursor: 'pointer', color: 'white', fontFamily: SANS, fontSize: 11, fontWeight: 700, minWidth: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {ytDownloading ? <div style={{ width: 14, height: 14, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite' }} /> : '\u2713'}
                </button>
                <button type="button" onClick={() => { setShowYt(false); setYtUrl(''); setYtError(''); }}
                  style={{ background: 'rgba(255,255,255,.1)', border: 'none', borderRadius: 8, padding: '0 10px', cursor: 'pointer', color: MUTED, fontSize: 14 }}>{"\u2715"}</button>
              </div>
              {ytError && <p style={{ fontFamily: SANS, fontSize: 9, color: '#ef4444', margin: 0 }}>{"\u26A0"} {ytError}</p>}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => mp3Ref.current?.click()}
                style={{ flex: 1, background: hexToRgba(C.red, 0.1), border: `1px dashed ${C.red}66`, borderRadius: 10, padding: '14px 0', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <Upload className="w-5 h-5" style={{ color: C.red, opacity: 0.7 }} />
                <span style={{ fontFamily: SANS, fontSize: 9, color: MUTED, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>MP3</span>
              </button>
              <button type="button" onClick={() => setShowYt(true)}
                style={{ flex: 1, background: hexToRgba(C.darkBlue, 0.4), border: `1px dashed ${C.blue}88`, borderRadius: 10, padding: '14px 0', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 18 }}>{"\u{25B6}"}</span>
                <span style={{ fontFamily: SANS, fontSize: 9, color: MUTED, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>YouTube</span>
              </button>
              <input ref={mp3Ref} type="file" accept="audio/*,.mp3" onChange={e => { const f = e.target.files?.[0]; if (f) handleMp3(f); }} style={{ display: 'none' }} />
            </div>
          )}
        </div>
      )}
      {isActive && (
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 10, background: `linear-gradient(135deg,${C.darkBlue},${C.darkRed})`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${C.red}66` }}>
              <Music className="w-5 h-5" style={{ color: C.red, opacity: 0.8 }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <InlineEdit tag="p" editMode={editMode} value={block.musicTitle || ''} onChange={v => onUpdate({ musicTitle: v })} placeholder="Titlul melodiei..."
                style={{ fontFamily: SERIF, fontSize: 14, fontStyle: 'italic', color: C.white, margin: 0, lineHeight: 1.3 }} />
              <InlineEdit tag="p" editMode={editMode} value={block.musicArtist || ''} onChange={v => onUpdate({ musicArtist: v })} placeholder="Artist..."
                style={{ fontFamily: SANS, fontSize: 10, color: MUTED, margin: '2px 0 0' }} />
            </div>
          </div>
          <div onClick={seek} style={{ height: 4, background: hexToRgba(C.red, 0.2), borderRadius: 99, marginBottom: 6, cursor: 'pointer', position: 'relative' }}>
            <div style={{ height: '100%', borderRadius: 99, background: C.red, width: pct, transition: 'width .3s linear' }} />
            <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: pct, marginLeft: -5, width: 10, height: 10, borderRadius: '50%', background: C.red, transition: 'left .3s linear' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontFamily: SANS, fontSize: 9, color: MUTED }}>{fmt(progress)}</span>
            <span style={{ fontFamily: SANS, fontSize: 9, color: MUTED }}>{duration ? fmt(duration) : '--:--'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
            <button type="button" onClick={() => { const a = audioRef.current; if (a) a.currentTime = Math.max(0, a.currentTime - 10); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, opacity: .5 }}>
              <SkipBack className="w-4 h-4" style={{ color: C.red }} />
            </button>
            <button type="button" onClick={toggle}
              style={{ width: 44, height: 44, borderRadius: '50%', background: C.red, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 18px ${C.red}66` }}>
              {playing ? <Pause className="w-4 h-4" style={{ color: 'white' }} /> : <Play className="w-4 h-4" style={{ color: 'white', marginLeft: 2 }} />}
            </button>
            <button type="button" onClick={() => { const a = audioRef.current; if (a) a.currentTime = Math.min(duration, a.currentTime + 10); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, opacity: .5 }}>
              <SkipForward className="w-4 h-4" style={{ color: C.red }} />
            </button>
          </div>
          {editMode && (
            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <button type="button" onClick={() => { onUpdate({ musicUrl: '', musicType: 'none' as any }); setShowYt(true); }}
                style={{ background: 'rgba(255,255,255,.08)', border: `1px solid ${C.blue}88`, borderRadius: 99, padding: '4px 14px', cursor: 'pointer', fontFamily: SANS, fontSize: 9, color: MUTED, fontWeight: 700 }}>
                Schimba sursa
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- COUNTDOWN ----------------------------------------------------------------
interface TimeLeft { days: number; hours: number; minutes: number; seconds: number; total: number }
function calcTimeLeft(date: string): TimeLeft {
  const diff = new Date(date).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  return { days: Math.floor(diff / 86400000), hours: Math.floor((diff / 3600000) % 24), minutes: Math.floor((diff / 60000) % 60), seconds: Math.floor((diff / 1000) % 60), total: diff };
}

const FlipDigit: React.FC<{ value: number; label: string; color: string }> = ({ value, label, color }) => {
  const prev = useRef(value);
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    if (prev.current !== value) { setFlash(true); const t = setTimeout(() => setFlash(false), 300); prev.current = value; return () => clearTimeout(t); }
  }, [value]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 56, height: 62, background: `linear-gradient(135deg,${color},${color}cc)`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', boxShadow: `0 4px 16px ${color}66, inset 0 1px 0 rgba(255,255,255,.2)`, transform: flash ? 'scale(1.1)' : 'scale(1)', transition: 'transform .14s' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(255,255,255,.2),transparent)', pointerEvents: 'none' }}/>
        <span style={{ fontFamily: F.display, fontSize: 24, color: 'white', lineHeight: 1, textShadow: '0 2px 4px rgba(0,0,0,.3)' }}>{String(value).padStart(2, '0')}</span>
      </div>
      <span style={{ fontFamily: F.label, fontSize: 8, letterSpacing: '.3em', textTransform: 'uppercase', color, fontWeight: 700 }}>{label}</span>
    </div>
  );
};

const Countdown: React.FC<{ targetDate: string | undefined }> = ({ targetDate }) => {
  const [tl, setTl] = useState<TimeLeft | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
    if (!targetDate) return;
    setTl(calcTimeLeft(targetDate));
    const id = setInterval(() => setTl(calcTimeLeft(targetDate!)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  if (!ready || !targetDate) return null;
  const isOver = tl?.total === 0;
  if (isOver) return (
    <div style={{ textAlign: 'center', padding: '12px 20px', background: `${C.red}22`, border: `3px solid ${C.red}`, borderRadius: 18 }}>
      <p style={{ fontFamily: F.display, fontSize: 14, color: C.red, margin: 0 }}>{"\u{1F389} Misiunea a inceput! \u{1F389}"}</p>
    </div>
  );
  const vals = [tl?.days ?? 0, tl?.hours ?? 0, tl?.minutes ?? 0, tl?.seconds ?? 0];
  const lbls = ['Zile', 'Ore', 'Min', 'Sec'];
  const cols = [C.red, C.darkRed, C.blue, C.gold];
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
        <span style={{ fontFamily: F.label, fontSize: 9, letterSpacing: '.4em', textTransform: 'uppercase', color: C.gold, padding: '4px 16px', borderRadius: 50, background: `rgba(255,215,0,.1)`, border: `2px solid ${C.gold}44` }}>
          {"\u{23F3} Timp ramas"}
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 8 }}>
        {vals.map((v, i) => (
          <React.Fragment key={i}>
            <FlipDigit value={v} label={lbls[i]} color={cols[i]} />
            {i < 3 && <span style={{ fontFamily: F.display, fontSize: 22, color: C.red, paddingTop: 14, flexShrink: 0, opacity: .5 }}>:</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// --- DEFAULT BLOCKS ------------------------------------------------------------
export const SPIDERMAN_DEFAULT_BLOCKS: InvitationBlock[] = getSharedDefaultBlocks("spiderman-simple");

// Compat export for existing wizard imports.
export const CASTLE_DEFAULT_BLOCKS = SPIDERMAN_DEFAULT_BLOCKS;

// --- INTRO --------------------------------------------------------------------
const SpideyIntro: React.FC<{ l1: string; l2: string; onDone: () => void }> = ({ l1, l2, onDone }) => {
  const showSecond = Boolean(l2 && l2 !== l1);
  const [phase, setPhase] = useState(0);
  const [fade, setFade] = useState(false);
  const [btnClicked, setBtnClicked] = useState(false);
  const [confetti, setConfetti] = useState<any[]>([]);

  const handleOpen = useCallback(() => {
    if (btnClicked) return;
    setBtnClicked(true);
    const cols = [C.red, C.darkRed, C.gold, C.blue, C.silver, '#ffffff'];
    setConfetti(Array.from({ length: 50 }, (_, i) => ({
      id: i, x: 10 + Math.random() * 80, color: cols[i % cols.length],
      shape: i % 3 === 0 ? 'circle' : 'rect', delay: Math.random() * .8, size: 5 + Math.random() * 8,
    })));
    setPhase(1);
    setTimeout(() => setPhase(2), 400);
    setTimeout(() => setPhase(3), 900);
    setTimeout(() => setPhase(4), 1500);
    setTimeout(() => setPhase(5), 2100);
    setTimeout(() => { setFade(true); setTimeout(onDone, 700); }, 3100);
  }, [btnClicked, onDone]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, overflow: 'hidden',
      background: `linear-gradient(135deg, ${hexToRgba(C.darkBg, 1)} 0%, ${hexToRgba(C.darkRed, 0.94)} 40%, ${hexToRgba(C.darkBlue, 0.98)} 70%, ${hexToRgba(C.black, 1)} 100%)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: fade ? 0 : 1, transition: fade ? 'opacity .75s ease' : 'none',
      pointerEvents: fade ? 'none' : 'auto',
    }}>
      <style>{getSpCss()}</style>
      {confetti.map(c => <Confetto key={c.id} {...c} />)}

      {/* Global web pattern */}
      <WebPattern opacity={0.09} color="#ffffff" />

      {/* Corner webs */}
      <CornerWeb corner="tl" size={200} />
      <CornerWeb corner="tr" size={200} />
      <CornerWeb corner="bl" size={180} />
      <CornerWeb corner="br" size={180} />

      {/* Spidey sense pulses */}
      <SpideySense x={10} y={15} delay={0} />
      <SpideySense x={88} y={12} delay={.8} />
      <SpideySense x={5}  y={75} delay={1.6} />
      <SpideySense x={92} y={72} delay={.4} />

      {/* -- SEALED STATE -- */}
      {phase === 0 && (
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          {/* Spider logo */}
          <div style={{ fontSize: 80, animation: 'sp-float 3.5s ease-in-out infinite', filter: `drop-shadow(0 0 30px ${C.red})` }}>
            {"\u{1F577}"}
          </div>
          {/* Hero name */}
          <div>
            <h1 style={{
              fontFamily: F.display, fontSize: 'clamp(38px,9vw,60px)',
              background: `linear-gradient(135deg, ${C.red}, ${C.gold})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              margin: '0 0 4px', lineHeight: 1.1, letterSpacing: 2,
              filter: `drop-shadow(2px 3px 0 ${hexToRgba(C.red, 0.3)})`,
            }}>
              {showSecond ? `${l1} & ${l2}` : l1}
            </h1>
            <p style={{ fontFamily: F.label, fontSize: 13, color: C.silver, margin: 0, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              te invita intr-o aventura de supererou
            </p>
          </div>
          {/* Spidey image */}
          <div style={{ position: 'relative', animation: 'sp-float 4s ease-in-out infinite', borderRadius: 16 }}>
            <img src={IMG_HERO_POSTER} alt="Spider-Man"
              style={{ width: 'min(260px,68vw)', objectFit: 'contain', filter: `drop-shadow(0 0 20px ${C.red}88)` , borderRadius: 16 }}
            />
            {/* Glow ring */}
            <div style={{ position: 'absolute', inset: -20, borderRadius: '50%', background: `radial-gradient(circle, ${C.red}22, transparent 70%)`, pointerEvents: 'none' }}/>
          </div>
          {/* Open button */}
          <button onClick={handleOpen} style={{
            fontFamily: F.display, fontSize: 16, letterSpacing: '.35em', textTransform: 'uppercase',
            color: C.white, background: `linear-gradient(135deg, ${C.darkRed}, ${C.red})`,
            border: `2px solid ${C.gold}66`, borderRadius: 50, padding: '16px 38px', cursor: 'pointer',
            boxShadow: `0 6px 28px ${C.red}66, 0 0 0 4px ${hexToRgba(C.red, 0.15)}`,
            animation: 'sp-pulse 2.2s ease-in-out infinite',
            transition: 'all .2s', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent)', backgroundSize: '200% 100%', animation: 'sp-shimmer 2s linear infinite', borderRadius: 50 }}/>
            <span style={{ position: 'relative' }}>Deschide Invitatia</span>
          </button>
        </div>
      )}

      {/* -- OPENING SEQUENCE -- */}
      {phase >= 1 && (
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ opacity: phase >= 2 ? 1 : 0, transform: phase >= 2 ? 'translateY(0) scale(1)' : 'translateY(30px) scale(.9)', transition: 'opacity .55s .05s,transform .6s .05s cubic-bezier(.22,1,.36,1)' }}>
            <img src={IMG_HERO_SWING} alt="Spider-Man"
              style={{ width: 'min(340px,88vw)', borderRadius: 16, objectFit: 'cover', filter: 'brightness(1.1) saturate(1.2)', boxShadow: `0 8px 36px ${C.red}44`, border: `2px solid ${hexToRgba(C.red, 0.3)}` }}
            />
          </div>
          {/* Spider symbol */}
          <div style={{ fontSize: 72, opacity: phase >= 2 ? 1 : 0, animation: phase >= 2 ? 'sp-logoIn .65s cubic-bezier(.34,1.4,.64,1) both' : 'none', filter: `drop-shadow(0 0 20px ${C.red})` }}>{"\u{1F577}\uFE0F"}</div>
          <div style={{ opacity: phase >= 3 ? 1 : 0, transform: phase >= 3 ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity .5s,transform .5s' }}>
            <p style={{ fontFamily: F.label, fontSize: 10, letterSpacing: '.5em', textTransform: 'uppercase', color: C.gold, margin: '0 0 4px' }}>{"\u{2728} SPIDER-MAN INVITATION \u{2728}"}</p>
            <h1 style={{ fontFamily: F.display, fontSize: 'clamp(32px,8vw,52px)', background: `linear-gradient(135deg,${C.red},${C.gold})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 4px', lineHeight: 1.05, letterSpacing: 2 }}>
              {showSecond ? `${l1} & ${l2}` : l1}
            </h1>
            <p style={{ fontFamily: F.label, fontSize: 13, color: C.silver, margin: 0, letterSpacing: '0.15em' }}>{"te invita intr-o aventura! \u{1F577}"}</p>
          </div>
          <p style={{ fontFamily: F.label, fontSize: 8, letterSpacing: '.4em', textTransform: 'uppercase', color: `rgba(200,210,230,.5)`, margin: '6px 0 0', opacity: phase >= 5 ? 1 : 0, transition: 'opacity .5s' }}>
            {"\u{2728} Cu mare putere... \u{2728}"}
          </p>
        </div>
      )}
    </div>
  );
};

// --- AUDIO MODAL --------------------------------------------------------------
const AudioPermissionModal: React.FC<{ childName: string; onAllow: () => void; onDeny: () => void }> = ({ childName, onAllow, onDeny }) => (
  <div style={{ position: "fixed", inset: 0, zIndex: 10020, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ position: "absolute", inset: 0, background: "rgba(10,10,20,0.75)", backdropFilter: "blur(8px)" }} />
    <div style={{ position: "relative", background: `linear-gradient(135deg,${hexToRgba(C.darkBg, 0.98)},${hexToRgba(C.darkRed, 0.9)})`, borderRadius: 24, padding: "36px 32px 28px", maxWidth: 340, width: "90%", textAlign: "center", boxShadow: `0 24px 80px ${C.red}44`, border: `1px solid ${C.red}44` }}>
      <WebPattern opacity={0.06} />
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: `linear-gradient(135deg,${C.darkRed},${C.red})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", animation: "sp-pulse 2s ease-in-out infinite", boxShadow: `0 8px 24px ${C.red}55` }}>
        <Music className="w-8 h-8" style={{ color: "white" }} />
      </div>
      <p style={{ fontFamily: F.display, fontSize: 30, color: C.red, margin: "0 0 6px", lineHeight: 1.1 }}>{childName}</p>
      <p style={{ fontFamily: F.body, fontSize: 13, fontWeight: 700, color: C.silver, margin: "0 0 8px" }}>te invita la o aventura de supererou</p>
      <p style={{ fontFamily: F.body, fontSize: 11, color: MUTED, margin: "0 0 28px", lineHeight: 1.6 }}>Invitatia are o melodie speciala.<br />Vrei sa activezi muzica?</p>
      <button type="button" onClick={onAllow} style={{ width: "100%", padding: "14px 0", background: `linear-gradient(135deg,${C.darkRed},${C.red})`, border: "none", borderRadius: 50, cursor: "pointer", fontFamily: F.label, fontSize: 11, fontWeight: 700, color: "white", letterSpacing: "0.1em", marginBottom: 10, boxShadow: `0 6px 20px ${C.red}55` }}>
        Da, activeaza muzica
      </button>
      <button type="button" onClick={onDeny} style={{ width: "100%", padding: "10px 0", background: "transparent", border: "none", cursor: "pointer", fontFamily: F.body, fontSize: 11, color: MUTED }}>
        Nu, continua fara muzica
      </button>
    </div>
  </div>
);

// --- BLOCK TYPES ICONS --------------------------------------------------------
const BLOCK_TYPE_ICONS: Record<string, string> = {
  photo: "\u{1F5BC}",
  text: "\u{1F4DD}",
  location: "\u{1F4CD}",
  calendar: "\u{1F4C5}",
  countdown: "\u23F1",
  timeline: "\u23F0",
  music: "\u{1F3B5}",
  gift: "\u{1F381}",
  whatsapp: "\u{1F4AC}",
  rsvp: "\u2705",
  divider: "\u2501",
  family: "\u{1F46A}",
  date: "\u{1F4C6}",
  description: "\u{1F4C4}",
  title: "\u{1F3F7}",
  godparents: "\u{1F64F}",
  parents: "\u{1F46B}",
  spacer: "\u2B1C",
};

const BlockToolbar = ({ onUp, onDown, onToggle, onDelete, visible, isFirst, isLast }: any) => (
  <div className="absolute -top-4 right-2 flex items-center gap-1 rounded-full border bg-white shadow-lg px-2 py-1 opacity-100 transition-all z-[9999999999999999999999] pointer-events-auto">
    <button onClick={onUp} disabled={isFirst} className="p-1 rounded-full hover:bg-red-50 disabled:opacity-20"><ChevronUp className="w-3 h-3 text-red-700"/></button>
    <button onClick={onDown} disabled={isLast} className="p-1 rounded-full hover:bg-red-50 disabled:opacity-20"><ChevronDown className="w-3 h-3 text-red-700"/></button>
    <div className="w-px h-3 bg-red-100 mx-1" />
    <button onClick={onToggle} className="p-1 rounded-full hover:bg-red-50">
      {visible ? <Eye className="w-3 h-3 text-red-700"/> : <EyeOff className="w-3 h-3 text-gray-400"/>}
    </button>
    <button onClick={onDelete} className="p-1 rounded-full hover:bg-red-50"><Trash2 className="w-3 h-3 text-red-600"/></button>
  </div>
);

const InsertBlockButton: React.FC<{
  insertIdx: number; openInsertAt: number | null; setOpenInsertAt: (v: number | null) => void;
  BLOCK_TYPES: { type: string; label: string; def: any }[]; onInsert: (type: string, def: any) => void;
}> = ({ insertIdx, openInsertAt, setOpenInsertAt, BLOCK_TYPES, onInsert }) => {
  const isOpen = openInsertAt === insertIdx;
  const [hovered, setHovered] = React.useState(false);
  const visible = hovered || isOpen;
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 32, zIndex: 20 }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div style={{ position: 'absolute', left: 0, right: 0, height: 1, background: `repeating-linear-gradient(to right, ${C.red}44 0, ${C.red}44 6px, transparent 6px, transparent 12px)`, opacity: 1, zIndex: 1 }} />
      <button type="button" onClick={() => setOpenInsertAt(isOpen ? null : insertIdx)} style={{ width: 26, height: 26, borderRadius: '50%', background: isOpen ? C.red : 'rgba(10,10,20,.8)', border: `1.5px solid ${C.red}66`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: isOpen ? 'white' : C.red, boxShadow: `0 2px 10px ${C.red}22`, opacity: 1, transition: 'opacity .15s,transform .15s,background .15s', transform: visible ? 'scale(1)' : 'scale(0.7)', zIndex: 2, position: 'relative', lineHeight: 1, fontWeight: 700 }}>
        {isOpen ? '-' : '+'}
      </button>
      {isOpen && (
        <div style={{ position: 'absolute', bottom: 34, left: '50%', transform: 'translateX(-50%)', background: hexToRgba(C.darkBg, 0.96), borderRadius: 16, border: `1px solid ${C.red}44`, boxShadow: `0 16px 48px rgba(0,0,0,.5)`, padding: '16px', zIndex: 100, width: 260 }}
          onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
          <p style={{ fontFamily: SANS, fontSize: '.5rem', fontWeight: 700, letterSpacing: '.3em', textTransform: 'uppercase', color: MUTED, margin: '0 0 10px', textAlign: 'center' }}>Adauga bloc</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {BLOCK_TYPES.map(bt => (
              <button key={bt.type} type="button" onClick={() => onInsert(bt.type, bt.def)} style={{ background: hexToRgba(C.red, 0.08), border: `1px solid ${C.red}33`, borderRadius: 10, padding: '8px 4px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = hexToRgba(C.red, 0.2); }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = hexToRgba(C.red, 0.08); }}>
                <span style={{ fontSize: 18, lineHeight: 1 }}>{BLOCK_TYPE_ICONS[bt.type] || '+'}</span>
                <span style={{ fontFamily: SANS, fontSize: '.5rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: C.red, lineHeight: 1.2, textAlign: 'center' }}>{bt.label.replace(/^[^\s]+\s/, '')}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- MAIN TEMPLATE ------------------------------------------------------------
const SpidermanTemplate: React.FC<InvitationTemplateProps & {
  editMode?: boolean;
  onProfileUpdate?: (patch: Record<string, any>) => void;
  onBlocksUpdate?: (blocks: InvitationBlock[]) => void;
  onBlockSelect?: (block: InvitationBlock | null, idx: number, textKey?: string, textLabel?: string) => void;
  selectedBlockId?: string;
  introPreview?: boolean;
  suppressAudioModal?: boolean;
  scrollContainer?: HTMLElement | null;
}> = ({
  data, onOpenRSVP, editMode = false, suppressAudioModal = false,
  onProfileUpdate, onBlocksUpdate, onBlockSelect, selectedBlockId,
}) => {
  const { profile, guest } = data;
  const activeThemeId = ((profile as any).colorTheme || "default").toString();
  const _t = getSpidermanTheme(activeThemeId);
  C = { ..._t };
  PINK_DARK = C.darkRed;
  PINK_D = C.red;
  PINK_L = C.blue;
  PINK_XL = C.darkBg;
  CREAM = hexToRgba(C.darkBlue, 0.8);
  TEXT = C.white;
  MUTED = hexToRgba(C.silver, 0.7);
  GOLD = C.gold;

  const isWedding = String(profile.eventType || "").toLowerCase() === "wedding";
  const safeJSON = (s: string | undefined, fb: any) => { try { return s ? JSON.parse(s) : fb; } catch { return fb; } };

  const blocksFromDB: InvitationBlock[] | null = safeJSON(profile.customSections, null);
  const hasDBBlocks = Array.isArray(blocksFromDB) && blocksFromDB.length > 0;
  const [blocks, setBlocks] = useState<InvitationBlock[]>(() => hasDBBlocks ? blocksFromDB! : SPIDERMAN_DEFAULT_BLOCKS as unknown as InvitationBlock[]);
  useEffect(() => {
    const fresh: InvitationBlock[] | null = safeJSON(profile.customSections, null);
    if (Array.isArray(fresh) && fresh.length > 0) setBlocks(fresh);
    else if (fresh !== null && Array.isArray(fresh) && fresh.length === 0) setBlocks(SPIDERMAN_DEFAULT_BLOCKS as unknown as InvitationBlock[]);
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
    const current = getTimelineItems();
    updateTimeline([...current, { id: Date.now().toString(), title: preset?.title || "", time: "", location: "", icon: preset?.icon || "party", notice: "" }]);
  };
  const updateTimelineItem = (id: string, patch: any) => { updateTimeline(getTimelineItems().map((t: any) => t.id === id ? { ...t, ...patch } : t)); };
  const removeTimelineItem = (id: string) => { updateTimeline(getTimelineItems().filter((t: any) => t.id !== id)); };

  const handleInsertAt = (afterIdx: number, type: string, def: any) => {
    if (type === "timeline") { const items = getTimelineItems(); if (items.length === 0) addTimelineItem(null); }
    addBlockAt(afterIdx, type, def); setOpenInsertAt(null);
  };

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
    if (isEmbeddedPreview) { document.body.style.overflow = ''; return; }
    if (showIntro) { document.body.style.overflow = 'hidden'; document.body.style.position = 'fixed'; document.body.style.top = '0'; document.body.style.left = '0'; document.body.style.right = '0'; }
    else { document.body.style.overflow = ''; document.body.style.position = ''; document.body.style.top = ''; document.body.style.left = ''; document.body.style.right = ''; }
    return () => { document.body.style.overflow = ''; document.body.style.position = ''; document.body.style.top = ''; document.body.style.left = ''; document.body.style.right = ''; };
  }, [showIntro, isEmbeddedPreview]);

  const handleIntroDone = () => {
    window.scrollTo(0, 0); setShowIntro(false);
    setTimeout(() => { window.scrollTo(0, 0); setContentVisible(true); if (audioAllowedRef.current) musicPlayRef.current?.play(); }, 60);
  };

  const l1 = (profile.partner1Name || 'Prenume').trim() || 'Prenume';
  const l2 = !isWedding ? '' : (profile.partner2Name || '').trim();
  const wd = profile.weddingDate ? new Date(profile.weddingDate) : null;
  const displayDay     = wd ? wd.getDate() : '';
  const displayMonth   = wd ? wd.toLocaleDateString('ro-RO', { month: 'long' }).toUpperCase() : '';
  const displayYear    = wd ? wd.getFullYear() : '';
  const displayWeekday = wd ? wd.toLocaleDateString('ro-RO', { weekday: 'long' }) : '';

  const getEventText = () => {
    const map: Record<string, any> = {
      wedding:     { welcome: 'Cu onoare va invitam', celebration: 'casatoriei' },
      baptism:     { welcome: 'Cu bucurie va invitam', celebration: 'botezului' },
      anniversary: { welcome: 'Cu drag va invitam',   celebration: 'aniversarii' },
      kids:        { welcome: 'Te invitam la',         celebration: 'ziua de nastere' },
    };
    const d = map[profile.eventType || 'baptism'] || map.baptism;
    return { welcome: profile.welcomeText?.trim() || d.welcome, celebration: profile.celebrationText?.trim() || d.celebration };
  };
  const texts = getEventText();

  const card: React.CSSProperties = {
    background: hexToRgba(C.darkBlue, 0.75), backdropFilter: 'blur(12px)',
    borderRadius: 24, border: `2px solid ${hexToRgba(C.red, 0.24)}`,
    boxShadow: `0 6px 32px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.05)`,
    padding: '22px 20px', marginTop: 8, position: 'relative', overflow: 'hidden',
  };

  const BLOCK_TYPES = [
    { type: 'photo',     label: 'Foto',      def: { imageData: undefined, aspectRatio: '1:1', photoClip: 'rect', photoMasks: [] } },
    { type: 'text',      label: 'Text',         def: { content: 'Te asteptam cu drag...' } },
    { type: 'location',  label: 'Locatie',      def: { label: 'Locatie', time: '11:00', locationName: 'Locatie eveniment', locationAddress: 'Strada Exemplu, Nr. 1' } },
    { type: 'calendar',  label: 'Calendar',  def: {} },
    { type: 'countdown', label: 'Countdown',  def: {} },
    { type: 'timeline',  label: 'Cronologie', def: {} },
    { type: 'music',     label: 'Muzica',    def: { musicTitle: '', musicArtist: '', musicType: 'none' } },
    { type: 'gift',      label: 'Cadouri',   def: { sectionTitle: 'Sugestie cadou', content: '', iban: '', ibanName: '' } },
    { type: 'whatsapp',  label: 'WhatsApp',     def: { label: 'WhatsApp', content: '0700000000' } },
    { type: 'rsvp',      label: 'RSVP',         def: { label: 'Confirma Prezenta' } },
    { type: 'divider',   label: 'Linie',        def: {} },
    { type: 'family',    label: 'Familie', def: { label: 'Parintii copilului', content: 'Cu drag si recunostinta', members: JSON.stringify([{ name1: 'Mama', name2: 'Tata' }]) } },
    { type: 'date',      label: 'Data',      def: {} },
    { type: 'description', label: 'Descriere', def: { content: 'O scurta descriere...' } },
  ];

  const locationStickers = [IMG_SPIDER_STICKER_1, IMG_SPIDER_STICKER_2, IMG_SPIDER_STICKER_3, IMG_SPIDER_STICKER_4];

  return (
    <>
      <style>{getSpCss()}</style>
      {showAudioModal && (
        <AudioPermissionModal childName={profile.partner1Name || "Invitatia"}
          onAllow={() => { audioAllowedRef.current = true; musicPlayRef.current?.unlock(); setShowAudioModal(false); }}
          onDeny={() => { audioAllowedRef.current = false; setShowAudioModal(false); }}
        />
      )}
      {showIntro && <SpideyIntro l1={l1} l2={l2} onDone={handleIntroDone} />}

      <div style={{ minHeight: '100vh', position: 'relative', fontFamily: F.body,
        opacity: contentVisible ? 1 : 0, transform: contentVisible ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity .7s cubic-bezier(.4,0,.2,1),transform .7s cubic-bezier(.4,0,.2,1)', paddingBottom: 60 }}>

        {/* -- BACKGROUND -- */}
        <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: [
              `radial-gradient(circle at 10% 10%, ${hexToRgba(C.red, 0.15)} 0%, transparent 45%)`,
              `radial-gradient(circle at 90% 10%, ${hexToRgba(C.darkBlue, 0.45)} 0%, transparent 45%)`,
              `radial-gradient(circle at 10% 90%, ${hexToRgba(C.blue, 0.22)} 0%, transparent 45%)`,
              `radial-gradient(circle at 90% 90%, ${hexToRgba(C.red, 0.12)} 0%, transparent 45%)`,
              `linear-gradient(135deg, ${hexToRgba(C.darkBg, 1)} 0%, ${hexToRgba(C.darkRed, 0.96)} 35%, ${hexToRgba(C.darkBlue, 0.98)} 65%, ${hexToRgba(C.black, 1)} 100%)`,
            ].join(', '),
          }} />
          {/* Global web pattern */}
          <WebPattern opacity={0.055} color="#ffffff" />
          {/* Scan line effect */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,.012) 2px, rgba(255,255,255,.012) 4px)', pointerEvents: 'none' }} />
        </div>

        {/* Fixed corner webs */}
        <div style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
          <CornerWeb corner="tl" size={180} />
          <CornerWeb corner="tr" size={180} />
          <CornerWeb corner="bl" size={160} />
          <CornerWeb corner="br" size={160} />
        </div>

        {/* Fixed spidey sense pulses */}
        <div style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
          <SpideySense x={6}  y={8}  delay={0} />
          <SpideySense x={92} y={6}  delay={1.2} />
          <SpideySense x={4}  y={85} delay={2.1} />
          <SpideySense x={94} y={82} delay={.7} />
        </div>

        {/* Floating spider icons */}
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ position: 'fixed', left: `${(i * 22 + 5) % 90}%`, top: `${(i * 25 + 10) % 80}%`, fontSize: 14 + i * 4, opacity: .04 + i * .015, animation: `sp-float ${5 + i}s ${i * .7}s ease-in-out infinite`, pointerEvents: 'none', zIndex: 0 }}>{"\u{1F577}"}</div>
        ))}

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 440, margin: '0 auto', padding: '28px 16px 0' }}>

          {/* -- HERO CARD -- */}
          <Reveal from="fade">
            <BlockStyleProvider value={{ blockId: "__hero__", textStyles: undefined, onTextSelect: () => {} }}>
              <div style={{ ...card, textAlign: 'center', padding: '0 0 28px' }}>
                {/* Hero image strip */}
                <div style={{ position: 'relative', height: 220, overflow: 'hidden', borderRadius: '22px 22px 0 0' }}>
                  <img src={IMG_HERO_SWING} alt="Spider-Man"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 25%', filter: 'brightness(1.1) saturate(1.15)' }}
                  />
                  {/* Red overlay gradient */}
                  <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, ${hexToRgba(C.red, 0.14)} 0%, ${hexToRgba(C.darkBg, 0.95)} 100%)` }} />
                  {/* Web corners on hero */}
                  <div style={{ position: 'absolute', inset: 0 }}>
                    <CornerWeb corner="tl" size={90} />
                    <CornerWeb corner="tr" size={90} />
                  </div>
                  {/* Spider logo centered */}
                  <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', fontSize: 56, filter: `drop-shadow(0 0 20px ${C.red})`, animation: 'sp-heartBeat 3s ease-in-out infinite' }}>
                    {"\u{1F577}\uFE0F"}
                  </div>
                </div>

                <div style={{ padding: '20px 24px 0' }}>
                  {/* Badge */}
                  <Reveal from="fade" delay={0.15}>
                    <div style={{ display: 'inline-block', background: `linear-gradient(135deg,${C.darkRed},${C.red})`, color: C.white, fontFamily: F.label, fontSize: 9, padding: '4px 20px', borderRadius: 20, letterSpacing: 2, marginBottom: 14, boxShadow: `0 4px 16px ${C.red}55` }}>
                      {"\u{2728} ESTI INVITAT \u{2728}"}
                    </div>
                  </Reveal>

                  {/* Welcome text */}
                  <Reveal from="bottom" delay={0.2}>
                    <InlineEdit tag="p" editMode={editMode} value={texts.welcome} onChange={v => upProfile("welcomeText", v)} textLabel="Hero - welcome"
                      style={{ fontFamily: F.body, fontSize: 13, fontWeight: 600, fontStyle: 'italic', color: MUTED, margin: '0 0 12px', lineHeight: 1.7 }}
                    />
                  </Reveal>

                  {/* NAME */}
                  <Reveal from="bottom" delay={0.25}>
                    {!isWedding ? (
                      <InlineEdit tag="h1" editMode={editMode} value={profile.partner1Name || 'Prenume'} onChange={v => upProfile('partner1Name', v)} textLabel="Hero - nume"
                        style={{ fontFamily: F.display, fontSize: 'clamp(36px,9vw,56px)', background: `linear-gradient(135deg,${C.red},${C.gold})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 4px', lineHeight: 1.1, letterSpacing: 3, filter: `drop-shadow(2px 3px 0 ${hexToRgba(C.red, 0.2)})` }}
                      />
                    ) : (
                      <div style={{ margin: '0 0 4px' }}>
                        <InlineEdit tag="h1" editMode={editMode} value={profile.partner1Name || 'Prenume'} onChange={v => upProfile('partner1Name', v)} textLabel="Hero - nume 1"
                          style={{ fontFamily: F.display, fontSize: 'clamp(28px,7vw,44px)', background: `linear-gradient(135deg,${C.red},${C.gold})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0, lineHeight: 1.1, letterSpacing: 2 }}
                        />
                        <div style={{ margin: '8px 0', display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
                          <div style={{ flex: 1, height: '2px', background: `linear-gradient(to right, transparent, ${C.red})` }} />
                          <span style={{ fontFamily: F.display, fontSize: 20, color: C.red }}>{"\u{2764}"}</span>
                          <div style={{ flex: 1, height: '2px', background: `linear-gradient(to left, transparent, ${C.red})` }} />
                        </div>
                        <InlineEdit tag="h1" editMode={editMode} value={profile.partner2Name || 'Prenume'} onChange={v => upProfile('partner2Name', v)} textLabel="Hero - nume 2"
                          style={{ fontFamily: F.display, fontSize: 'clamp(28px,7vw,44px)', background: `linear-gradient(135deg,${C.blue},${C.silver})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0, lineHeight: 1.1, letterSpacing: 2 }}
                        />
                      </div>
                    )}
                  </Reveal>

                  {/* Celebration text */}
                  <Reveal from="bottom" delay={0.3}>
                    <InlineEdit tag="p" editMode={editMode} value={texts.celebration} onChange={v => upProfile("celebrationText", v)} textLabel="Hero - celebrare"
                      style={{ fontFamily: F.label, fontSize: 15, color: C.red, margin: '8px 0 0', letterSpacing: '0.1em' }}
                    />
                  </Reveal>

                  {/* DATE */}
                  <Reveal from="bottom" delay={0.35}>
                    <div style={{ margin: '18px 0' }}>
                      <WebDivider thin />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', margin: '16px 0' }}>
                        <div style={{ flex: 1, height: '1.5px', background: `linear-gradient(to right, transparent, ${C.red}66)` }} />
                        <div style={{ width: 68, height: 68, borderRadius: '50%', background: `linear-gradient(135deg,${C.darkRed},${C.red})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: `0 6px 24px ${C.red}66, 0 0 0 4px ${hexToRgba(C.red, 0.15)}`, animation: 'sp-pulse 3s ease-in-out infinite' }}>
                          <span style={{ fontFamily: F.display, fontSize: 26, color: C.white, lineHeight: 1 }}>{displayDay}</span>
                          <span style={{ fontFamily: F.label, fontSize: 8, color: 'rgba(255,255,255,.8)', letterSpacing: 1 }}>{displayMonth?.slice(0, 3)}</span>
                        </div>
                        <div style={{ flex: 1, height: '1.5px', background: `linear-gradient(to left, transparent, ${C.red}66)` }} />
                      </div>
                      <div style={{ fontFamily: F.body, fontWeight: 700, fontSize: 12, color: C.silver, textTransform: 'capitalize', marginBottom: 4, opacity: .7 }}>
                        {displayWeekday} - {displayMonth} - {displayYear}
                      </div>
                      <WebDivider thin />
                    </div>
                  </Reveal>

                  {/* COUNTDOWN */}
                  <Reveal from="bottom" delay={0.4}>
                    <Countdown targetDate={profile.weddingDate} />
                  </Reveal>

                  {/* GUEST box */}
                  <Reveal from="bottom" delay={0.45}>
                    <div style={{ padding: '14px 20px', background: hexToRgba(C.darkBlue, 0.6), border: `2px solid ${C.red}33`, borderRadius: 16, position: 'relative', overflow: 'hidden', marginTop: 16 }}>
                      <WebPattern opacity={0.08} />
                      {/* Spider crawling in corner */}
                      <img src={IMG_SPIDER_CRAWL} alt="" style={{ position: 'absolute', bottom: -10, right: -6, width: 66, height: 66, objectFit: 'contain', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,.4))', pointerEvents: 'none' }}/>
                      <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', fontSize: 18 }}>{"\u{1F451}"}</div>
                      <p style={{ fontFamily: F.label, fontSize: 8, letterSpacing: '.5em', textTransform: 'uppercase', color: C.gold, margin: '0 0 6px', opacity: .8 }}>invitatie pentru</p>
                      <p style={{ fontFamily: F.display, fontSize: 22, color: C.white, margin: 0, letterSpacing: 2, position: 'relative', zIndex: 1 }}>
                        {guest?.name || 'Invitatul Special'}
                      </p>
                    </div>
                  </Reveal>
                </div>

                <div style={{ margin: '18px 20px 0' }}><WebDivider /></div>
              </div>
            </BlockStyleProvider>
          </Reveal>

          {/* -- BLOCKS -- */}
          <div className="space-y-0">
            {editMode && (
              <InsertBlockButton insertIdx={-1} openInsertAt={openInsertAt} setOpenInsertAt={setOpenInsertAt}
                BLOCK_TYPES={BLOCK_TYPES} onInsert={(type, def) => handleInsertAt(-1, type, def)} />
            )}
            {blocks.filter(b => editMode || b.show !== false).map((block, idx) => (
              <div key={block.id} className="group/insert">
                <div className={`relative group/block ${block.type === "divider" ? "" : "py-5"}`}
                  onClick={editMode ? () => onBlockSelect?.(block, idx) : undefined}
                  style={{ marginTop: block.blockMarginTop != null ? `${block.blockMarginTop}px` : undefined, marginBottom: block.blockMarginBottom != null ? `${block.blockMarginBottom}px` : undefined, opacity: block.opacity != null ? block.opacity / 100 : 1, backgroundColor: block.bgColor || undefined, borderRadius: block.blockRadius != null ? `${block.blockRadius}px` : undefined }}>
                  <BlockStyleProvider value={{ blockId: block.id, textStyles: block.textStyles, onTextSelect: (tk, tl) => onBlockSelect?.(block, idx, tk, tl), fontFamily: block.blockFontFamily, fontSize: block.blockFontSize, fontWeight: block.blockFontWeight, fontStyle: block.blockFontStyle, letterSpacing: block.blockLetterSpacing, lineHeight: block.blockLineHeight, textColor: block.textColor && block.textColor !== "transparent" ? block.textColor : undefined, textAlign: block.blockAlign } as BlockStyle}>
                    {editMode && <BlockToolbar onUp={() => movBlock(idx, -1)} onDown={() => movBlock(idx, 1)} onToggle={() => updBlock(idx, { show: block.show === false })} onDelete={() => delBlock(idx)} visible={block.show !== false} isFirst={idx === 0} isLast={idx === blocks.length - 1} />}
                    {editMode && block.show === false && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center p-4" style={{ pointerEvents: "auto" }}>
                        <div className="absolute inset-0 rounded-lg" style={{ background: "rgba(0,0,0,0.15)", backdropFilter: "blur(3px)" }} />
                        <div className="relative z-10 flex flex-col items-center gap-3" style={{ borderRadius: 14, textAlign: "center" }}>
                          <EyeOff size={22} color={C.silver} />
                        </div>
                      </div>
                    )}

                    {/* -- BLOCK RENDERERS -- */}
                    {block.type === "photo" && (
                      <Reveal>
                        <div onClick={editMode ? () => onBlockSelect?.(block, idx) : undefined}
                          style={editMode ? { cursor: "pointer", outline: selectedBlockId === block.id ? `2px solid ${C.red}` : "none", outlineOffset: 4, borderRadius: 16 } : undefined}>
                          <PhotoBlock imageData={block.imageData} altText={block.altText} editMode={editMode} onUpload={url => updBlock(idx, { imageData: url })} onRemove={() => updBlock(idx, { imageData: undefined })} onRatioChange={r => updBlock(idx, { aspectRatio: r })} onClipChange={c => updBlock(idx, { photoClip: c })} onMasksChange={m => updBlock(idx, { photoMasks: m } as any)} aspectRatio={block.aspectRatio as any} photoClip={block.photoClip as any} photoMasks={block.photoMasks as any} placeholderInitial1={l1} />
                        </div>
                      </Reveal>
                    )}

                    {block.type === "text" && (
                      <Reveal>
                        <div style={{ textAlign: "center", padding: "0 12px" }}>
                          <InlineEdit tag="p" editMode={editMode} value={block.content || ""} onChange={v => updBlock(idx, { content: v })} textLabel="Text"
                            style={{ fontFamily: F.body, fontSize: 14, color: C.silver, lineHeight: 1.7 }} />
                        </div>
                      </Reveal>
                    )}

                    {block.type === "location" && (
                      <Reveal>
                        <LocCard block={block} editMode={editMode} onUpdate={p => updBlock(idx, p)} stickerSrc={locationStickers[idx % locationStickers.length]} />
                      </Reveal>
                    )}

                    {block.type === "calendar" && (
                      <Reveal>
                        <div style={{ position: "relative" }}>
                          <img src={IMG_SPIDER_HANGING} alt="" style={{ position: "absolute", top: -18, left: -8, width: 70, height: 70, objectFit: "contain", filter: "drop-shadow(0 6px 12px rgba(0,0,0,.3))", pointerEvents: "none", zIndex: 2 }} />
                          <CalendarMonth date={profile.weddingDate} />
                        </div>
                      </Reveal>
                    )}

                    {block.type === "countdown" && (
                      <div style={{ position: "relative" }}>
                        <img src={IMG_SPIDER_CLASSIC} alt="" style={{ position: "absolute", top: -18, right: -8, width: 70, height: 70, objectFit: "contain", filter: "drop-shadow(0 6px 12px rgba(0,0,0,.3))", pointerEvents: "none", zIndex: 2 }} />
                        <FlipClock targetDate={profile.weddingDate} bgColor={C.darkRed} textColor="white" accentColor={C.gold} labelColor="rgba(255,255,255,0.7)" editMode={editMode}
                          titleText={block.countdownTitle || "Timp ramas pana la Marele Eveniment"} onTitleChange={text => updBlock(idx, { countdownTitle: text })} />
                      </div>
                    )}

                    {block.type === "timeline" && (() => {
                      const timelineItems = getTimelineItems();
                      if (!editMode && timelineItems.length === 0) return null;
                      return (
                        <Reveal style={editMode ? { position: "relative", zIndex: 200 } : undefined}>
                          <div style={{ background: hexToRgba(C.darkBlue, 0.7), border: `1px solid ${C.red}33`, borderRadius: 16, padding: "20px 24px", position: "relative", overflow: 'hidden' }}>
                            <WebPattern opacity={0.06} />
                            <img src={IMG_SPIDER_JUMP} alt="" style={{ position: "absolute", top: -18, right: -8, width: 68, height: 68, objectFit: "contain", filter: "drop-shadow(0 6px 12px rgba(0,0,0,.3))", pointerEvents: "none" }} />
                            <p style={{ fontFamily: F.label, fontSize: 8, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase", color: C.gold, textAlign: "center", margin: "0 0 16px", position: 'relative', zIndex: 1 }}>Programul Zilei</p>
                            {timelineItems.length === 0 && editMode && (
                              <p style={{ fontFamily: F.body, fontSize: 12, fontStyle: "italic", color: MUTED, textAlign: "center", margin: "0 0 8px" }}>Adauga primul moment al zilei.</p>
                            )}
                            {timelineItems.map((item: any, i: number) => (
                              <div key={item.id} style={{ display: "grid", gridTemplateColumns: "58px 44px 1fr", alignItems: "stretch", minHeight: 64, position: 'relative', zIndex: 1 }}>
                                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 10 }}>
                                  <InlineTime editMode={editMode} value={item.time || ""} onChange={v => updateTimelineItem(item.id, { time: v })} textKey={`timeline:${item.id}:time`} textLabel={`Ora ${i + 1}`}
                                    style={{ fontFamily: F.body, fontSize: 15, fontWeight: 700, color: C.red, lineHeight: 1.2, textAlign: "center", width: "100%" }} />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: hexToRgba(C.red, 0.15), border: `1.5px solid ${C.red}55`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <WeddingIcon iconKey={item.icon || "party"} size={20} color={C.red} />
                                  </div>
                                  {i < timelineItems.length - 1 && <div style={{ flex: 1, width: 1, background: `linear-gradient(to bottom, ${C.red}44, transparent)`, marginTop: 4 }} />}
                                </div>
                                <div style={{ paddingLeft: 12, paddingTop: 10, paddingBottom: i < timelineItems.length - 1 ? 20 : 0 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <InlineEdit tag="span" editMode={editMode} value={item.title || ""} onChange={v => updateTimelineItem(item.id, { title: v })} placeholder="Moment..." textKey={`timeline:${item.id}:title`} textLabel={`Titlu ${i + 1}`}
                                      style={{ fontFamily: F.body, fontSize: 15, fontWeight: 700, color: C.white, display: "block", lineHeight: 1.3 }} />
                                    {editMode && <button type="button" onClick={() => removeTimelineItem(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: MUTED, fontSize: 14, padding: "0 4px", opacity: .5 }}>{"\u2715"}</button>}
                                  </div>
                                  {(editMode || item.notice) && (
                                    <InlineEdit tag="span" editMode={editMode} value={item.notice || ""} onChange={v => updateTimelineItem(item.id, { notice: v })} placeholder="Nota..." textKey={`timeline:${item.id}:notice`} textLabel={`Nota ${i + 1}`}
                                      style={{ fontFamily: F.body, fontSize: 13, fontStyle: "italic", color: MUTED, display: "block", marginTop: 4, lineHeight: 1.5 }} />
                                  )}
                                </div>
                              </div>
                            ))}
                            <TimelineInsertButton editMode={editMode} colors={{ dark: C.red, light: `${C.red}44`, xl: hexToRgba(C.red, 0.08), muted: MUTED }} onAdd={preset => addTimelineItem(preset)} />
                          </div>
                        </Reveal>
                      );
                    })()}

                    {block.type === "music" && (
                      <Reveal><MusicBlock block={block} editMode={editMode} onUpdate={p => updBlock(idx, p)} imperativeRef={musicPlayRef} /></Reveal>
                    )}

                    {block.type === "gift" && (
                      <Reveal>
                        <div style={{ background: `linear-gradient(135deg,${C.darkRed},${C.darkBlue})`, borderRadius: 18, padding: 24, textAlign: 'center', color: 'white', position: 'relative', boxShadow: `0 10px 32px ${C.red}44`, overflow: 'hidden' }}>
                          <WebPattern opacity={0.08} />
                          <img src={IMG_SPIDER_SMALL_1} alt="" style={{ position: "absolute", top: -16, right: -4, width: 72, height: 72, objectFit: "contain", filter: "drop-shadow(0 4px 12px rgba(0,0,0,.3))", pointerEvents: "none" }} />
                          <Gift className="w-8 h-8 mx-auto mb-4 opacity-80" style={{ position: 'relative', zIndex: 1 }} />
                          <InlineEdit tag="h3" editMode={editMode} value={block.sectionTitle || "Sugestie de cadou"} onChange={v => updBlock(idx, { sectionTitle: v })} textLabel="Cadou - titlu" style={{ fontFamily: F.display, fontSize: 20, marginBottom: 8, letterSpacing: 2, position: 'relative', zIndex: 1 }} />
                          <InlineEdit tag="p" editMode={editMode} value={block.content || ""} onChange={v => updBlock(idx, { content: v })} multiline textLabel="Cadou - text" style={{ fontFamily: F.body, fontSize: 12, opacity: .85, lineHeight: 1.6, position: 'relative', zIndex: 1 }} />
                          {(block.iban || editMode) && (
                            <div style={{ marginTop: 12, padding: '8px 10px', background: 'rgba(255,255,255,.1)', borderRadius: 10, position: 'relative', zIndex: 1 }}>
                              <InlineEdit tag="p" editMode={editMode} value={block.iban || ""} onChange={v => updBlock(idx, { iban: v })} placeholder="IBAN..." textLabel="Cadou - IBAN" style={{ fontFamily: F.body, fontSize: 10, fontWeight: 700 }} />
                            </div>
                          )}
                        </div>
                      </Reveal>
                    )}

                    {block.type === "whatsapp" && (
                      <Reveal>
                        <div className="flex flex-col items-center gap-4">
                          <img src={IMG_SPIDER_SMALL_2} alt="" style={{ width: 80, height: 80, objectFit: "contain", filter: "drop-shadow(0 4px 14px rgba(0,0,0,.3))" }} />
                          <a href={`https://wa.me/${(block.content || "").replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                            className="group/wa flex items-center gap-4 px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all"
                            style={{ background: hexToRgba(C.darkBlue, 0.8), border: `1.5px solid ${C.red}44` }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group-hover/wa:scale-110 transition-transform"
                              style={{ background: `linear-gradient(135deg,#128c7e,#25d366)`, boxShadow: `0 8px 20px rgba(37,211,102,.4)` }}>
                              <MessageCircle className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-left">
                              <InlineEdit tag="p" editMode={editMode} value={block.label || "Contact WhatsApp"} onChange={v => updBlock(idx, { label: v })} textLabel="WhatsApp - label" style={{ fontWeight: 800, fontSize: 13, color: C.white, margin: 0 }} />
                              <p style={{ fontFamily: F.body, fontSize: 10, color: MUTED, margin: 0 }}>Raspundem rapid</p>
                            </div>
                          </a>
                          {editMode && (
                            <div style={{ display: "flex", alignItems: "center", gap: 8, background: hexToRgba(C.darkBlue, 0.6), border: `1px solid ${C.red}33`, borderRadius: 12, padding: "8px 16px" }}>
                              <span style={{ fontFamily: F.label, fontSize: ".6rem", fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: MUTED }}>Numar:</span>
                              <InlineEdit tag="span" editMode={editMode} value={block.content || "0700000000"} onChange={v => updBlock(idx, { content: v })} textLabel="WhatsApp - numar" style={{ fontFamily: F.body, fontSize: ".9rem", color: C.white, fontWeight: 700 }} />
                            </div>
                          )}
                        </div>
                      </Reveal>
                    )}

                    {block.type === "rsvp" && (
                      <Reveal>
                        <div style={{ marginTop: 6 }}>
                          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                            <img src={IMG_SPIDER_CLASSIC} alt="" style={{ width: 82, height: 82, objectFit: "contain", filter: `drop-shadow(0 0 20px ${C.red}88)`, animation: 'sp-float 3s ease-in-out infinite' }} />
                          </div>
                          <button onClick={() => { if (!editMode) onOpenRSVP?.(); }} style={{ width: '100%', padding: '20px', background: `linear-gradient(135deg,${C.darkRed},${C.red})`, border: `2px solid ${C.gold}44`, borderRadius: 50, cursor: 'pointer', fontFamily: F.display, fontSize: 17, color: C.white, letterSpacing: 2, boxShadow: `0 8px 32px ${C.red}77, 0 0 0 4px ${hexToRgba(C.red, 0.12)}`, animation: 'sp-pulse 2.5s ease-in-out infinite', transition: 'all .25s', position: 'relative', overflow: 'hidden' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.04)'; }} onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}>
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent)', backgroundSize: '200% 100%', animation: 'sp-shimmer 2s linear infinite', borderRadius: 50 }} />
                            <span style={{ position: 'relative' }}>
                              <InlineEdit tag="span" editMode={editMode} value={block.label || "Confirma Prezenta"} onChange={v => updBlock(idx, { label: v })} textLabel="RSVP - text" />
                            </span>
                          </button>
                        </div>
                      </Reveal>
                    )}

                    {block.type === "divider" && (
                      <Reveal><WebDivider /></Reveal>
                    )}

                    {block.type === "date" && (
                      <Reveal>
                        <div style={{ textAlign: "center", padding: "4px 0" }}>
                          <p style={{ fontFamily: F.label, fontWeight: 700, letterSpacing: "0.3em", fontSize: "0.85rem", color: C.gold, margin: 0 }}>
                            {profile.weddingDate ? new Date(profile.weddingDate).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Data Evenimentului'}
                          </p>
                        </div>
                      </Reveal>
                    )}

                    {block.type === "description" && (
                      <Reveal>
                        <div style={{ textAlign: "center", padding: "0 16px" }}>
                          <InlineEdit tag="p" editMode={editMode} value={block.content || ""} onChange={v => updBlock(idx, { content: v })} textLabel="Descriere"
                            style={{ fontFamily: F.body, fontSize: "0.9rem", color: MUTED, lineHeight: 1.7, margin: 0 }} />
                        </div>
                      </Reveal>
                    )}

                    {block.type === "family" && (
                      <Reveal>
                        {(() => {
                          const members: { name1: string; name2: string }[] = (() => { try { return JSON.parse(block.members || "[]"); } catch { return []; } })();
                          const updateMembers = (nm: { name1: string; name2: string }[]) => updBlock(idx, { members: JSON.stringify(nm) } as any);
                          return (
                            <div style={{ ...card, textAlign: 'center' }}>
                              <WebDivider />
                              <div style={{ marginTop: 14 }}>
                                <InlineEdit tag="p" editMode={editMode} value={block.label || "Parintii copilului"} onChange={v => updBlock(idx, { label: v })} textLabel="Familie - titlu"
                                  style={{ fontFamily: F.label, fontSize: ".55rem", fontWeight: 700, letterSpacing: ".35em", textTransform: "uppercase", color: C.gold, margin: "0 0 8px" }} />
                                <InlineEdit tag="p" editMode={editMode} value={block.content || "Cu drag si recunostinta"} onChange={v => updBlock(idx, { content: v })} textLabel="Familie - text"
                                  style={{ fontFamily: F.body, fontStyle: "italic", fontSize: ".9rem", color: MUTED, margin: 0, lineHeight: 1.6 }} />
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
                                {members.map((m, mi) => (
                                  <div key={mi} style={{ position: "relative" }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
                                      <InlineEdit tag="span" editMode={editMode} value={m.name1} onChange={v => { const nm = [...members]; nm[mi] = { ...nm[mi], name1: v }; updateMembers(nm); }} textLabel={`Familie - nume ${mi + 1}A`} style={{ fontFamily: F.display, fontSize: "1.4rem", color: C.white, letterSpacing: 1 }} />
                                      <span style={{ fontFamily: F.display, color: C.red, fontSize: "1.3rem" }}>{"\u{2764}"}</span>
                                      <InlineEdit tag="span" editMode={editMode} value={m.name2} onChange={v => { const nm = [...members]; nm[mi] = { ...nm[mi], name2: v }; updateMembers(nm); }} textLabel={`Familie - nume ${mi + 1}B`} style={{ fontFamily: F.display, fontSize: "1.4rem", color: C.white, letterSpacing: 1 }} />
                                      {editMode && members.length > 1 && <button type="button" onClick={() => updateMembers(members.filter((_, i) => i !== mi))} style={{ background: "none", border: "none", cursor: "pointer", color: MUTED, fontSize: 14, padding: "0 4px", opacity: .7 }}>{"\u2715"}</button>}
                                    </div>
                                    {mi < members.length - 1 && <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${C.red}44, transparent)`, margin: "8px 32px 0" }} />}
                                  </div>
                                ))}
                              </div>
                              {editMode && (
                                <button type="button" onClick={() => updateMembers([...members, { name1: "Nume 1", name2: "Nume 2" }])}
                                  style={{ marginTop: 16, background: hexToRgba(C.red, 0.1), border: `1px dashed ${C.red}66`, borderRadius: 99, padding: "5px 16px", cursor: "pointer", fontFamily: F.label, fontSize: ".6rem", fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", color: C.red }}>
                                  + Adauga
                                </button>
                              )}
                            </div>
                          );
                        })()}
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

          {/* -- FOOTER -- */}
          <Reveal from="fade" delay={0.1}>
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <WebDivider />
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 20, margin: '18px 0 14px' }}>
                <div style={{ animation: 'sp-float 3.5s ease-in-out infinite', fontSize: 48, filter: `drop-shadow(0 0 16px ${C.red})` }}>{"\u{1F577}"}</div>
                <div style={{ animation: 'sp-heartBeat 2.5s ease-in-out infinite' }}>
                  <img src={IMG_HERO_POSTER} alt="Spider-Man" style={{ width: 80, objectFit: 'contain', filter: `drop-shadow(0 0 16px ${C.red}88)` }} />
                </div>
                <div style={{ animation: 'sp-floatR 4s ease-in-out infinite', fontSize: 42, filter: `drop-shadow(0 0 12px ${C.gold})` }}>{"\u{1F578}"}</div>
              </div>
              {/* Web motto */}
              <p style={{ fontFamily: F.display, fontSize: 13, color: C.red, opacity: .7, margin: '0 0 4px', letterSpacing: 2 }}>
                "Cu mare putere vine mare responsabilitate"
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
                {['\u{1F577}','\u{1F578}','\u{2728}','\u{1F981}','\u{1F308}','\u{1F5F8}','\u{1F525}','\u{1F48E}','\u{2B50}'].map((e, i) => (
                  <span key={i} style={{ fontSize: 13, animation: `sp-twinkle ${1.5 + i * .18}s ${i * .12}s ease-in-out infinite`, display: 'inline-block' }}>{e}</span>
                ))}
              </div>
              <p style={{ fontFamily: F.label, fontSize: 10, color: C.silver, opacity: .4, margin: 0, letterSpacing: '0.2em' }}>
                Spider-Man Invitation - {displayYear}
              </p>
            </div>
          </Reveal>

        </div>
      </div>
    </>
  );
};

export default SpidermanTemplate;
