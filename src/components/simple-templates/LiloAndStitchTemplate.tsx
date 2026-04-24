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
  Play, Pause, SkipForward, SkipBack, Gift, Music, MessageCircle, MapPin,
} from "lucide-react";
import { API_URL } from "../../config/api";

// ─────────────────────────────────────────────────────────────────────────────
// META
// ─────────────────────────────────────────────────────────────────────────────
export const meta: TemplateMeta = {
  id: "lilo-and-stitch",
  name: "Lilo & Stitch",
  category: "kids",
  description: "Ohana inseamna familie — o invitatie tropicala cu valuri, hibiscus, Stitch si magia insulelor hawaiiene!",
  colors: ["#0a3d5c", "#00b4d8", "#e63946", "#f5e6c8"],
  previewClass: "bg-cyan-700 border-pink-500",
  elementsClass: "bg-cyan-600",
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

function hex(h: string, a: number) {
  const r = parseInt(h.slice(1, 3), 16);
  const g = parseInt(h.slice(3, 5), 16);
  const b = parseInt(h.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function resolveAssetUrl(url?: string) {
  const raw = String(url || "").trim();
  if (!raw) return "";
  if (/^(https?:|data:|blob:|\/)/i.test(raw)) return raw;
  return `/${raw.replace(/^\/+/, "")}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// COLOR PALETTE  — Lilo & Stitch tropical ocean
// ─────────────────────────────────────────────────────────────────────────────
const BASE_THEME = {
  ocean      : "#0a3d5c",   // deep ocean bg
  oceanMid   : "#0d5f82",   // mid ocean
  teal       : "#00b4d8",   // bright teal / water
  tealLight  : "#48cae4",   // light teal
  stitch     : "#3b82f6",   // Stitch blue
  stitchDeep : "#1d4ed8",   // deep Stitch blue
  hibiscus   : "#e63946",   // hibiscus red
  hibiscusL  : "#ff6b6b",   // light hibiscus
  pink       : "#f472b6",   // Angel pink
  sunset     : "#f4a261",   // sunset orange
  sand       : "#f5e6c8",   // warm sand
  sandD      : "#e8d5a3",   // darker sand
  palm       : "#2d6a4f",   // palm green
  palmL      : "#52b788",   // light palm
  night      : "#0f172a",   // night sky
  star       : "#fde68a",   // star yellow
  white      : "#ffffff",
  cream      : "#fffbf0",
  muted      : "rgba(245,230,200,0.55)",
};

const LILO_THEME_MAP: Record<string, typeof BASE_THEME> = {
  default: BASE_THEME,
  "lilo-volcano-night": {
    ocean: "#0f172a",
    oceanMid: "#1f2937",
    teal: "#dc2626",
    tealLight: "#f87171",
    stitch: "#f59e0b",
    stitchDeep: "#b45309",
    hibiscus: "#ef4444",
    hibiscusL: "#fb7185",
    pink: "#fda4af",
    sunset: "#fb923c",
    sand: "#fff7ed",
    sandD: "#fdba74",
    palm: "#451a03",
    palmL: "#92400e",
    night: "#020617",
    star: "#fde68a",
    white: "#ffffff",
    cream: "#fff7ed",
    muted: "rgba(255,247,237,0.72)",
  },
  "lilo-neon-lagoon": {
    ocean: "#082f49",
    oceanMid: "#0f172a",
    teal: "#06b6d4",
    tealLight: "#67e8f9",
    stitch: "#ec4899",
    stitchDeep: "#9d174d",
    hibiscus: "#f43f5e",
    hibiscusL: "#fda4af",
    pink: "#f9a8d4",
    sunset: "#22d3ee",
    sand: "#ecfeff",
    sandD: "#a5f3fc",
    palm: "#164e63",
    palmL: "#0ea5e9",
    night: "#020617",
    star: "#fef08a",
    white: "#ffffff",
    cream: "#ecfeff",
    muted: "rgba(236,254,255,0.74)",
  },
  "lilo-sunset-punch": {
    ocean: "#431407",
    oceanMid: "#7c2d12",
    teal: "#f97316",
    tealLight: "#fdba74",
    stitch: "#fb7185",
    stitchDeep: "#be123c",
    hibiscus: "#ea580c",
    hibiscusL: "#fdba74",
    pink: "#fda4af",
    sunset: "#facc15",
    sand: "#fff7ed",
    sandD: "#fdba74",
    palm: "#7f1d1d",
    palmL: "#dc2626",
    night: "#1c1917",
    star: "#fde68a",
    white: "#ffffff",
    cream: "#fff7ed",
    muted: "rgba(255,247,237,0.72)",
  },
  "lilo-jungle-pop": {
    ocean: "#052e16",
    oceanMid: "#14532d",
    teal: "#22c55e",
    tealLight: "#86efac",
    stitch: "#38bdf8",
    stitchDeep: "#0369a1",
    hibiscus: "#84cc16",
    hibiscusL: "#bef264",
    pink: "#4ade80",
    sunset: "#facc15",
    sand: "#f0fdf4",
    sandD: "#86efac",
    palm: "#14532d",
    palmL: "#4ade80",
    night: "#022c22",
    star: "#fef08a",
    white: "#ffffff",
    cream: "#f0fdf4",
    muted: "rgba(240,253,244,0.72)",
  },
  "lilo-pink-ohana": {
    ocean: "#500724",
    oceanMid: "#831843",
    teal: "#ec4899",
    tealLight: "#f9a8d4",
    stitch: "#38bdf8",
    stitchDeep: "#1d4ed8",
    hibiscus: "#f472b6",
    hibiscusL: "#fbcfe8",
    pink: "#f9a8d4",
    sunset: "#fda4af",
    sand: "#fff1f2",
    sandD: "#fbcfe8",
    palm: "#9d174d",
    palmL: "#ec4899",
    night: "#1f172a",
    star: "#f9a8d4",
    white: "#ffffff",
    cream: "#fff1f2",
    muted: "rgba(255,241,242,0.72)",
  },
};

const C = { ...BASE_THEME };

const getLiloTheme = (themeId?: string) =>
  LILO_THEME_MAP[String(themeId || "default").trim()] || BASE_THEME;

// ─────────────────────────────────────────────────────────────────────────────
// FONTS
// ─────────────────────────────────────────────────────────────────────────────
const F = {
  display : "'Pacifico','Lobster',cursive",
  body    : "'Nunito','Quicksand',sans-serif",
  label   : "'Fredoka One','Nunito',sans-serif",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// IMAGE PATHS — replace with your actual assets
// ─────────────────────────────────────────────────────────────────────────────
const IMG = {
  // Main characters
  stitch        : "/lilo-stitch/stitch-main.png",          // Stitch principal
  stitchWave    : "/lilo-stitch/stitch-waving.png",        // Stitch facand cu mana
  stitchSurf    : "/lilo-stitch/stitch-surfing.png",       // Stitch pe surf
  stitchHug     : "/lilo-stitch/stitch-hug.png",           // Stitch imbratisand
  stitchRun     : "/lilo-stitch/stitch-running.png",       // Stitch alergand
  stitchSpace   : "/lilo-stitch/stitch-space.png",         // Stitch din spatiu
  lilo          : "/lilo-stitch/lilo-main.png",            // Lilo
  liloStitch    : "/lilo-stitch/lilo-and-stitch.png",      // Lilo + Stitch impreuna
  angel         : "/lilo-stitch/angel.png",                // Angel (pink Stitch)
  nani          : "/lilo-stitch/nani.png",                 // Nani
  // Decorative
  hibiscus      : "/lilo-stitch/hibiscus.png",             // Floare hibiscus
  hibiscusR     : "/lilo-stitch/hibiscus-red.png",         // Hibiscus rosu
  palmTree      : "/lilo-stitch/palm-tree.png",            // Palmier
  pineapple     : "/lilo-stitch/pineapple.png",            // Ananas
  surfboard     : "/lilo-stitch/surfboard.png",            // Plansa surf
  ukulele       : "/lilo-stitch/ukulele.png",              // Ukulele
  rainbow       : "/lilo-stitch/rainbow.png",              // Curcubeu
  wave          : "/lilo-stitch/wave.png",                 // Val
  starfish      : "/lilo-stitch/starfish.png",             // Stea de mare
  flower        : "/lilo-stitch/flower-lei.png",           // Cununa flori
  ohana         : "/lilo-stitch/ohana-text.png",           // Text "Ohana"
  rocket        : "/lilo-stitch/rocket.png",               // Racheta (Stitch)
  logo          : "/lilo-stitch/lilo-stitch-logo.png",     // Logo Lilo & Stitch
  heroBg        : "/lilo-stitch/hero-bg.png",              // Background hero (beach/ocean)
  // Stickers for location cards
  sticker1      : "/lilo-stitch/sticker-stitch.png",
  sticker2      : "/lilo-stitch/sticker-lilo.png",
  sticker3      : "/lilo-stitch/sticker-angel.png",
  sticker4      : "/lilo-stitch/sticker-hibiscus.png",
};

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL CSS
// ─────────────────────────────────────────────────────────────────────────────
const LS_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Pacifico&family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap');

  @keyframes ls-float    { 0%,100%{transform:translateY(0) rotate(-.8deg)}50%{transform:translateY(-12px) rotate(.8deg)} }
  @keyframes ls-floatR   { 0%,100%{transform:translateY(0) rotate(.6deg)} 50%{transform:translateY(-10px) rotate(-.6deg)} }
  @keyframes ls-bob      { 0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-8px) scale(1.04)} }
  @keyframes ls-bounce   { 0%,100%{transform:translateY(0) scaleY(1)}25%{transform:translateY(-14px) scaleY(1.05)}50%{transform:translateY(0) scaleY(.93)}75%{transform:translateY(-6px) scaleY(1.02)} }
  @keyframes ls-wiggle   { 0%,100%{transform:rotate(0)}20%{transform:rotate(-10deg)}40%{transform:rotate(10deg)}60%{transform:rotate(-5deg)}80%{transform:rotate(5deg)} }
  @keyframes ls-pulse    { 0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(0,180,216,.5)}50%{transform:scale(1.04);box-shadow:0 0 0 16px rgba(0,180,216,0)} }
  @keyframes ls-shimmer  { 0%{background-position:-200% 0}100%{background-position:200% 0} }
  @keyframes ls-twinkle  { 0%,100%{opacity:.2;transform:scale(.6) rotate(0)}50%{opacity:1;transform:scale(1.3) rotate(25deg)} }
  @keyframes ls-sparkle  { 0%,100%{opacity:0;transform:scale(0)}50%{opacity:1;transform:scale(1)} }
  @keyframes ls-wave     { 0%,100%{transform:translateX(0)}50%{transform:translateX(-6%)} }
  @keyframes ls-waveR    { 0%,100%{transform:translateX(0) scaleX(-1)}50%{transform:translateX(6%) scaleX(-1)} }
  @keyframes ls-confetti { 0%{transform:translateY(-20px) rotate(0);opacity:1}100%{transform:translateY(110vh) rotate(720deg);opacity:0} }
  @keyframes ls-heartBeat{ 0%,100%{transform:scale(1)}14%{transform:scale(1.15)}28%{transform:scale(1)}42%{transform:scale(1.08)} }
  @keyframes ls-popIn    { 0%{transform:scale(0) rotate(-8deg);opacity:0}65%{transform:scale(1.1) rotate(2deg);opacity:1}100%{transform:scale(1) rotate(0);opacity:1} }
  @keyframes ls-fall     { 0%{transform:translateY(-120vh) rotate(-20deg);opacity:0}60%{opacity:1}80%{transform:translateY(8px) rotate(3deg)}100%{transform:translateY(0) rotate(0)} }
  @keyframes ls-fadeInUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ls-bgShift  { 0%,100%{background-position:0% 50%}50%{background-position:100% 50%} }
  @keyframes ls-orbit    { 0%{transform:rotate(0deg) translateX(30px) rotate(0deg)}100%{transform:rotate(360deg) translateX(30px) rotate(-360deg)} }
  @keyframes ls-bar      { 0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)} }
  .ls-hover:hover { animation: ls-wiggle .5s ease-in-out !important; cursor: pointer; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// SCROLL REVEAL
// ─────────────────────────────────────────────────────────────────────────────
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

const Reveal: React.FC<{ children: React.ReactNode; delay?: number; from?: "bottom" | "left" | "right" | "fade"; style?: React.CSSProperties }> = ({ children, delay = 0, from = "bottom", style }) => {
  const [ref, vis] = useReveal<HTMLDivElement>();
  const t: Record<string, string> = { bottom: "translateY(28px)", left: "translateX(-28px)", right: "translateX(28px)", fade: "translateY(0)" };
  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? "translate(0,0)" : t[from], transition: `opacity .65s ${delay}s cubic-bezier(.22,1,.36,1), transform .65s ${delay}s cubic-bezier(.22,1,.36,1)`, ...style }}>
      {children}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// WAVE DIVIDER  — animated ocean wave
// ─────────────────────────────────────────────────────────────────────────────
const WaveDivider: React.FC<{ thin?: boolean; color?: string }> = ({ thin = false, color = C.teal }) => (
  <div style={{ position: "relative", height: thin ? 24 : 40, overflow: "hidden" }}>
    <svg viewBox="0 0 400 40" preserveAspectRatio="none"
      style={{ position: "absolute", bottom: 0, width: "200%", height: "100%", left: 0, animation: "ls-wave 4s ease-in-out infinite" }}>
      <path d="M0,20 C50,0 100,40 150,20 C200,0 250,40 300,20 C350,0 400,40 400,20 L400,40 L0,40 Z" fill={hex(color, thin ? 0.3 : 0.2)} />
    </svg>
    <svg viewBox="0 0 400 40" preserveAspectRatio="none"
      style={{ position: "absolute", bottom: 0, width: "200%", height: "100%", right: 0, animation: "ls-waveR 5s ease-in-out infinite" }}>
      <path d="M0,25 C60,5 120,40 180,25 C240,5 300,40 360,25 C400,10 400,35 400,25 L400,40 L0,40 Z" fill={hex(color, thin ? 0.2 : 0.15)} />
    </svg>
    {/* Hibiscus center */}
    {!thin && (
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 18, lineHeight: 1 }}>🌺</div>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// TROPICAL CARD  — base card with wave accent
// ─────────────────────────────────────────────────────────────────────────────
const TropicalCard: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
  accentColor?: string;
  imgDeco?: { src: string; side?: "left" | "right"; top?: number; size?: number };
  glass?: boolean;
}> = ({ children, style, accentColor = C.teal, imgDeco, glass = false }) => (
  <div style={{ position: "relative" }}>
    {imgDeco && (
      <img src={imgDeco.src} alt="" style={{
        position: "absolute",
        top: imgDeco.top !== undefined ? imgDeco.top : -22,
        [imgDeco.side === "left" ? "left" : "right"]: -8,
        width: imgDeco.size || 72,
        objectFit: "contain",
        filter: "drop-shadow(0 4px 12px rgba(0,0,0,.3))",
        pointerEvents: "none",
        zIndex: 10,
      }} />
    )}
    <div style={{
      background: glass
        ? `rgba(255,255,255,0.08)`
        : `linear-gradient(155deg, ${hex(C.oceanMid, .1)} 0%, ${hex(C.ocean, .97)} 100%)`,
      borderRadius: 22,
      border: `1.5px solid ${hex(accentColor, .28)}`,
      boxShadow: `0 8px 32px rgba(0,0,0,.35), inset 0 1px 0 ${hex(accentColor, .12)}`,
      backdropFilter: glass ? "blur(12px)" : undefined,
      overflow: "hidden",
      position: "relative",
      ...style,
    }}>
      {/* Top accent stripe with gradient */}
      <div style={{ height: 3, background: `linear-gradient(90deg, transparent, ${accentColor}, ${C.tealLight}, ${accentColor}, transparent)` }} />
      {/* Subtle bubble texture */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: `radial-gradient(circle at 3px 3px, ${hex(C.teal, .04)} 1px, transparent 0)`, backgroundSize: "22px 22px" }} />
      <div style={{ position: "relative", padding: "18px 22px 20px" }}>
        {children}
      </div>
      {/* Bottom wave */}
      <div style={{ height: 8, background: `linear-gradient(90deg, transparent, ${hex(accentColor, .12)}, transparent)`, position: "relative" }}>
        <svg viewBox="0 0 400 8" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <path d="M0,4 C50,0 100,8 150,4 C200,0 250,8 300,4 C350,0 400,8 400,4 L400,8 L0,8 Z" fill={hex(accentColor, .15)} />
        </svg>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// STARS SCATTER  — fixed background stars (Stitch is from space!)
// ─────────────────────────────────────────────────────────────────────────────
const StarScatter: React.FC<{ fixed?: boolean }> = ({ fixed = false }) => {
  const stars = [
    { x: 4, y: 8, s: 12, d: 0 }, { x: 92, y: 5, s: 14, d: .4 },
    { x: 8, y: 28, s: 10, d: .9 }, { x: 94, y: 25, s: 12, d: .3 },
    { x: 3, y: 55, s: 11, d: 1.1 }, { x: 95, y: 52, s: 13, d: .7 },
    { x: 6, y: 80, s: 10, d: 1.5 }, { x: 91, y: 78, s: 11, d: .2 },
    { x: 48, y: 2, s: 15, d: .6 },
  ];
  return (
    <>
      {stars.map((s, i) => (
        <div key={i} style={{
          position: fixed ? "fixed" : "absolute",
          left: `${s.x}%`, top: `${s.y}%`,
          fontSize: s.s, color: C.star,
          animation: `ls-twinkle ${1.8 + i * .2}s ${s.d}s ease-in-out infinite`,
          pointerEvents: "none", zIndex: 1, userSelect: "none",
          filter: `drop-shadow(0 0 4px ${C.star})`,
        }}>✦</div>
      ))}
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CONFETTI
// ─────────────────────────────────────────────────────────────────────────────
const Confetto: React.FC<{ x: number; color: string; delay: number; size: number; shape: string }> = ({ x, color, delay, size, shape }) => (
  <div style={{ position: "fixed", left: `${x}%`, top: "-10px", width: size, height: size, background: color, borderRadius: shape === "circle" ? "50%" : "3px", animation: `ls-confetti ${2.5 + Math.random() * 2}s ${delay}s linear forwards`, pointerEvents: "none", zIndex: 999 }} />
);

// ─────────────────────────────────────────────────────────────────────────────
// LOCATION CARD
// ─────────────────────────────────────────────────────────────────────────────
const LocCard: React.FC<{ block: InvitationBlock; editMode: boolean; onUpdate: (p: Partial<InvitationBlock>) => void; stickerSrc?: string }> = ({ block, editMode, onUpdate, stickerSrc }) => {
  const [editWaze, setEditWaze] = useState(false);
  const name = block.locationName || "";
  const time = block.time || "";
  const address = block.locationAddress || "";
  const label = block.label || "Locatie";
  const wazeLink = block.wazeLink || "";
  if (!editMode && !name && !time && !address && !wazeLink) return null;
  const enc = address ? encodeURIComponent(address) : "";

  return (
    <TropicalCard accentColor={C.hibiscus} imgDeco={stickerSrc ? { src: stickerSrc, side: "right" } : undefined}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: hex(C.hibiscus, .15), border: `1.5px solid ${hex(C.hibiscus, .4)}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <MapPin style={{ width: 15, height: 15, color: C.hibiscus }} />
        </div>
        <div>
          <InlineEdit editMode={editMode} value={label} onChange={v => onUpdate({ label: v })}
            style={{ fontFamily: F.label, fontSize: 8, fontWeight: 700, letterSpacing: ".42em", textTransform: "uppercase", color: hex(C.hibiscus, .9), margin: 0, display: "block" }} />
          {(editMode || time) && (
            <InlineTime value={time} onChange={v => onUpdate({ time: v })} editMode={editMode} textLabel="Locatie · ora"
              style={{ fontFamily: F.display, fontSize: 18, color: C.tealLight, margin: 0 }} />
          )}
        </div>
      </div>
      <div style={{ height: 1, background: `linear-gradient(to right,transparent,${hex(C.hibiscus, .2)},transparent)`, marginBottom: 12 }} />
      <InlineEdit tag="h3" editMode={editMode} value={name} onChange={v => onUpdate({ locationName: v })}
        style={{ fontFamily: F.body, fontSize: 16, fontWeight: 800, color: C.sand, margin: "0 0 4px" }} />
      <InlineEdit tag="p" editMode={editMode} value={address} onChange={v => onUpdate({ locationAddress: v })} multiline
        style={{ fontFamily: F.body, fontSize: 12, color: C.muted, margin: "0 0 14px", lineHeight: 1.6, fontStyle: "italic" }} />

      {(editMode || wazeLink || address) && (
        <div style={{ marginTop: 10 }}>
          {editMode && editWaze && (
            <input autoFocus value={wazeLink} onChange={e => onUpdate({ wazeLink: e.target.value })}
              onBlur={() => setEditWaze(false)} onKeyDown={e => { if (e.key === "Enter" || e.key === "Escape") setEditWaze(false); }}
              placeholder="https://waze.com/ul?..."
              style={{ width: "100%", fontFamily: F.body, fontSize: 12, padding: "8px 12px", borderRadius: 10, border: `2px solid ${C.teal}`, outline: "none", background: hex(C.ocean, .8), color: C.sand, marginBottom: 8 }}
            />
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
            {(editMode || wazeLink) && (
              editMode ? (
                <button type="button" onClick={() => setEditWaze(true)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 14px", borderRadius: 12, border: `1.5px solid ${hex(C.teal, .5)}`, background: hex(C.teal, .15), color: C.tealLight, fontFamily: F.label, fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", cursor: "pointer" }}>
                  🚗 {wazeLink ? "Waze" : "Adauga Waze"}
                </button>
              ) : (
                <a href={wazeLink} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 14px", borderRadius: 12, border: `1.5px solid ${hex(C.teal, .5)}`, background: hex(C.teal, .15), color: C.tealLight, fontFamily: F.label, fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", textDecoration: "none" }}>
                  🚗 Waze
                </a>
              )
            )}
            {address && (
              <a href={`https://maps.google.com/?q=${enc}`} target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 14px", borderRadius: 12, border: `1.5px solid ${hex(C.hibiscus, .4)}`, background: hex(C.hibiscus, .1), color: C.hibiscusL, fontFamily: F.label, fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", textDecoration: "none" }}>
                📍 Maps
              </a>
            )}
          </div>
        </div>
      )}
    </TropicalCard>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CLIP SYSTEM  (identical to others)
// ─────────────────────────────────────────────────────────────────────────────
type ClipShape = "rect" | "rounded" | "rounded-lg" | "squircle" | "circle" | "arch" | "arch-b" | "hexagon" | "diamond" | "triangle" | "star" | "heart" | "diagonal" | "diagonal-r" | "wave-b" | "wave-t" | "wave-both" | "blob" | "blob2" | "blob3" | "blob4";
type MaskEffect = "fade-b" | "fade-t" | "fade-l" | "fade-r" | "vignette";

function getClipStyle(clip: ClipShape): React.CSSProperties {
  const m: Record<ClipShape, React.CSSProperties> = {
    rect: { borderRadius: 0 }, rounded: { borderRadius: 16 }, "rounded-lg": { borderRadius: 32 },
    squircle: { borderRadius: "30% 30% 30% 30% / 30% 30% 30% 30%" }, circle: { borderRadius: "50%" },
    arch: { borderRadius: "50% 50% 0 0 / 40% 40% 0 0" }, "arch-b": { borderRadius: "0 0 50% 50% / 0 0 40% 40%" },
    hexagon: { clipPath: "polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%)" },
    diamond: { clipPath: "polygon(50% 0%,100% 50%,50% 100%,0% 50%)" },
    triangle: { clipPath: "polygon(50% 0%,100% 100%,0% 100%)" },
    star: { clipPath: "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)" },
    heart: { clipPath: "url(#ls-clip-heart)" }, diagonal: { clipPath: "polygon(0 0,100% 0,100% 80%,0 100%)" },
    "diagonal-r": { clipPath: "polygon(0 0,100% 0,100% 100%,0 80%)" },
    "wave-b": { clipPath: "url(#ls-clip-wave-b)" }, "wave-t": { clipPath: "url(#ls-clip-wave-t)" },
    "wave-both": { clipPath: "url(#ls-clip-wave-both)" },
    blob: { clipPath: "url(#ls-clip-blob)" }, blob2: { clipPath: "url(#ls-clip-blob2)" },
    blob3: { clipPath: "url(#ls-clip-blob3)" }, blob4: { clipPath: "url(#ls-clip-blob4)" },
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
      <clipPath id="ls-clip-wave-b"   clipPathUnits="objectBoundingBox"><path d="M0,0 L1,0 L1,0.78 Q0.875,0.65 0.75,0.78 Q0.625,0.91 0.5,0.78 Q0.375,0.65 0.25,0.78 Q0.125,0.91 0,0.78 Z"/></clipPath>
      <clipPath id="ls-clip-wave-t"   clipPathUnits="objectBoundingBox"><path d="M0,0.22 Q0.125,0.09 0.25,0.22 Q0.375,0.35 0.5,0.22 Q0.625,0.09 0.75,0.22 Q0.875,0.35 1,0.22 L1,1 L0,1 Z"/></clipPath>
      <clipPath id="ls-clip-wave-both" clipPathUnits="objectBoundingBox"><path d="M0,0.22 Q0.125,0.09 0.25,0.22 Q0.375,0.35 0.5,0.22 Q0.625,0.09 0.75,0.22 Q0.875,0.35 1,0.22 L1,0.78 Q0.875,0.65 0.75,0.78 Q0.625,0.91 0.5,0.78 Q0.375,0.65 0.25,0.78 Q0.125,0.91 0,0.78 Z"/></clipPath>
      <clipPath id="ls-clip-heart"    clipPathUnits="objectBoundingBox"><path d="M0.5,0.85 C0.5,0.85 0.05,0.55 0.05,0.3 C0.05,0.12 0.18,0.05 0.3,0.1 C0.4,0.14 0.5,0.25 0.5,0.25 C0.5,0.25 0.6,0.14 0.7,0.1 C0.82,0.05 0.95,0.12 0.95,0.3 C0.95,0.55 0.5,0.85 0.5,0.85Z"/></clipPath>
      <clipPath id="ls-clip-blob"     clipPathUnits="objectBoundingBox"><path d="M0.5,0.03 C0.72,0.01 0.95,0.14 0.97,0.38 C0.99,0.58 0.88,0.78 0.72,0.88 C0.56,0.98 0.35,0.99 0.2,0.88 C0.05,0.77 -0.02,0.55 0.04,0.36 C0.1,0.17 0.28,0.05 0.5,0.03Z"/></clipPath>
      <clipPath id="ls-clip-blob2"    clipPathUnits="objectBoundingBox"><path d="M0.75,0.224 C0.831,0.271 0.911,0.342 0.921,0.422 C0.93,0.502 0.869,0.59 0.808,0.661 C0.747,0.732 0.685,0.785 0.611,0.816 C0.538,0.847 0.453,0.856 0.389,0.824 C0.326,0.792 0.285,0.72 0.233,0.647 C0.181,0.573 0.119,0.497 0.113,0.414 C0.107,0.331 0.157,0.241 0.231,0.193 C0.305,0.145 0.402,0.138 0.493,0.147 C0.584,0.155 0.668,0.178 0.75,0.224Z"/></clipPath>
      <clipPath id="ls-clip-blob3"    clipPathUnits="objectBoundingBox"><path d="M0.5,0.05 C0.65,0.02 0.85,0.1 0.92,0.28 C0.99,0.46 0.93,0.68 0.8,0.82 C0.67,0.96 0.46,1.0 0.3,0.93 C0.14,0.86 0.02,0.68 0.01,0.5 C0.0,0.32 0.1,0.14 0.25,0.07 C0.33,0.03 0.42,0.07 0.5,0.05Z"/></clipPath>
      <clipPath id="ls-clip-blob4"    clipPathUnits="objectBoundingBox"><path d="M0.18,0.08 C0.32,0.01 0.54,0.0 0.68,0.08 C0.82,0.16 0.96,0.32 0.97,0.5 C0.98,0.68 0.86,0.86 0.7,0.93 C0.54,1.0 0.32,0.97 0.18,0.88 C0.04,0.79 -0.04,0.62 0.02,0.45 C0.07,0.28 0.04,0.15 0.18,0.08Z"/></clipPath>
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
  placeholderInitial1?: string;
}> = ({ imageData, altText, editMode, onUpload, onRemove, aspectRatio = "free", photoClip = "rect", photoMasks = [], placeholderInitial1 }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const pt: Record<string, string> = { "1:1": "100%", "4:3": "75%", "3:4": "133%", "16:9": "56.25%", free: "66.6%" };
  const combined = { ...getClipStyle(photoClip), ...getMaskStyle(photoMasks) };
  const resolvedImageData = resolveAssetUrl(imageData);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setUploading(true); deleteUploadedFile(resolvedImageData);
    try {
      const form = new FormData(); form.append("file", file);
      const _s = JSON.parse(localStorage.getItem("weddingPro_session") || "{}");
      const res = await fetch(`${API_URL}/upload`, { method: "POST", headers: { Authorization: `Bearer ${_s?.token || ""}` }, body: form });
      const { url } = await res.json(); onUpload(url);
    } catch {} finally { setUploading(false); }
  };

  if (resolvedImageData) return (
    <div style={{ position: "relative" }}>
      <PhotoClipDefs />
      <div style={{ position: "relative", paddingTop: pt[aspectRatio], overflow: "hidden", ...combined }}>
        <img src={resolvedImageData} alt={altText || ""} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        {editMode && (
          <div className="absolute inset-0 bg-transparent opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button onClick={() => fileRef.current?.click()} className="p-2 bg-white/90 rounded-full shadow"><Camera className="w-5 h-5" style={{ color: C.stitch }} /></button>
            <button onClick={() => { deleteUploadedFile(resolvedImageData); onRemove(); }} className="p-2 bg-white/90 rounded-full shadow"><Trash2 className="w-5 h-5 text-red-500" /></button>
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
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${C.ocean}, ${C.stitch})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {uploading
            ? <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
            : <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: 52, display: "block" }}>🌊</span>
                <span style={{ fontFamily: F.display, fontSize: 36, color: hex(C.teal, .35) }}>{(placeholderInitial1 || "L")[0].toUpperCase()}</span>
              </div>
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
  const monthNames = ["IANUARIE","FEBRUARIE","MARTIE","APRILIE","MAI","IUNIE","IULIE","AUGUST","SEPTEMBRIE","OCTOMBRIE","NOIEMBRIE","DECEMBRIE"];
  const dayLabels = ["L","M","M","J","V","S","D"];
  const startOffset = (firstDay + 6) % 7;
  const cells: (number | null)[] = [...Array(startOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ fontFamily: F.label, fontSize: 10, fontWeight: 700, letterSpacing: ".25em", color: C.tealLight, marginBottom: 14 }}>{monthNames[month]} {year}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5, marginBottom: 5 }}>
        {dayLabels.map((l, i) => <div key={`${l}-${i}`} style={{ fontSize: 9, fontWeight: 700, color: C.muted, fontFamily: F.label }}>{l}</div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5 }}>
        {cells.map((cell, i) => {
          const isDay = cell === day;
          return (
            <div key={i} style={{ height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: isDay ? 700 : 500, fontFamily: F.body, color: isDay ? C.ocean : cell ? C.sand : "transparent", background: isDay ? C.teal : "transparent", borderRadius: "50%", boxShadow: isDay ? `0 0 10px ${hex(C.teal, .5)}` : "none" }}>
              {cell || ""}
            </div>
          );
        })}
      </div>
    </div>
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
    <div style={{ background: hex(C.ocean, .9), border: `2px solid ${playing ? C.teal : hex(C.teal, .25)}`, borderRadius: 18, padding: "20px 22px", transition: "border-color .4s, box-shadow .4s", boxShadow: playing ? `0 0 0 4px ${hex(C.teal, .15)}, 0 0 24px ${hex(C.teal, .2)}` : "none", position: "relative", overflow: "hidden" }}>
      <style>{`@keyframes ls-bar{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}`}</style>
      {/* Subtle bubble bg */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle at 3px 3px, ${hex(C.teal, .04)} 1px, transparent 0)`, backgroundSize: "20px 20px", pointerEvents: "none" }} />
      {block.musicType === "mp3" && block.musicUrl && <audio ref={audioRef} src={block.musicUrl} preload="metadata" />}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, position: "relative" }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: playing ? C.teal : hex(C.teal, .12), border: `2px solid ${hex(C.teal, .4)}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .3s" }}>
          <Music style={{ width: 14, height: 14, color: playing ? C.ocean : C.teal }} />
        </div>
        <span style={{ fontFamily: F.label, fontSize: 10, fontWeight: 700, letterSpacing: ".3em", textTransform: "uppercase", color: playing ? C.teal : C.muted }}>
          {playing ? "🎵 Se reda acum" : "🎵 Melodia Insulei"}
        </span>
        {playing && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 14, marginLeft: "auto" }}>
            {[0, .2, .1, .3].map((d, i) => <div key={i} style={{ width: 3, height: 14, background: C.teal, borderRadius: 2, transformOrigin: "bottom", animation: `ls-bar .7s ease-in-out ${d}s infinite` }} />)}
          </div>
        )}
      </div>

      {!isActive && editMode && (
        !showYt ? (
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={() => mp3Ref.current?.click()}
              style={{ flex: 1, background: hex(C.teal, .08), border: `1.5px dashed ${hex(C.teal, .3)}`, borderRadius: 12, padding: "14px 0", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <Upload style={{ width: 20, height: 20, color: C.teal, opacity: .7 }} />
              <span style={{ fontFamily: F.label, fontSize: 9, color: C.muted, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase" }}>MP3</span>
            </button>
            <button type="button" onClick={() => setShowYt(true)}
              style={{ flex: 1, background: hex(C.hibiscus, .08), border: `1.5px dashed ${hex(C.hibiscus, .3)}`, borderRadius: 12, padding: "14px 0", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 20 }}>▶️</span>
              <span style={{ fontFamily: F.label, fontSize: 9, color: C.muted, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase" }}>YouTube</span>
            </button>
            <input ref={mp3Ref} type="file" accept="audio/*,.mp3" onChange={e => { const f = e.target.files?.[0]; if (f) handleMp3(f); }} style={{ display: "none" }} />
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", gap: 6, marginBottom: ytError ? 6 : 0 }}>
              <input value={ytUrl} onChange={e => { setYtUrl(e.target.value); setYtError(""); }} onKeyDown={e => e.key === "Enter" && !ytDownloading && submitYt()} placeholder="https://youtu.be/..." autoFocus disabled={ytDownloading}
                style={{ flex: 1, background: hex(C.oceanMid, .7), border: `1.5px solid ${ytError ? "#ef4444" : hex(C.teal, .4)}`, borderRadius: 10, padding: "9px 12px", fontFamily: F.body, fontSize: 11, color: C.sand, outline: "none" }} />
              <button type="button" onClick={submitYt} disabled={ytDownloading}
                style={{ background: C.teal, border: "none", borderRadius: 10, padding: "0 14px", cursor: "pointer", color: C.ocean, fontWeight: 700, minWidth: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {ytDownloading ? <div style={{ width: 14, height: 14, border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .7s linear infinite" }} /> : "✓"}
              </button>
              <button type="button" onClick={() => { setShowYt(false); setYtUrl(""); setYtError(""); }}
                style={{ background: hex(C.oceanMid, .5), border: "none", borderRadius: 10, padding: "0 10px", cursor: "pointer", color: C.muted, fontSize: 14 }}>✕</button>
            </div>
            {ytError && <p style={{ fontFamily: F.body, fontSize: 9, color: "#ef4444", margin: 0 }}>⚠ {ytError}</p>}
          </div>
        )
      )}

      {isActive && (
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: `linear-gradient(135deg, ${C.ocean}, ${C.stitch})`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", border: `1.5px solid ${hex(C.teal, .4)}` }}>
              <Music style={{ width: 20, height: 20, color: C.teal, opacity: .8 }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <InlineEdit tag="p" editMode={editMode} value={block.musicTitle || ""} onChange={v => onUpdate({ musicTitle: v })} placeholder="Titlul melodiei..."
                style={{ fontFamily: F.body, fontSize: 14, fontStyle: "italic", color: C.sand, margin: 0, lineHeight: 1.3 }} />
              <InlineEdit tag="p" editMode={editMode} value={block.musicArtist || ""} onChange={v => onUpdate({ musicArtist: v })} placeholder="Artist..."
                style={{ fontFamily: F.label, fontSize: 10, color: C.muted, margin: "2px 0 0" }} />
            </div>
          </div>
          <div onClick={seek} style={{ height: 4, background: hex(C.teal, .18), borderRadius: 99, marginBottom: 6, cursor: "pointer", position: "relative" }}>
            <div style={{ height: "100%", borderRadius: 99, background: `linear-gradient(90deg, ${C.stitch}, ${C.teal})`, width: pct, transition: "width .3s linear" }} />
            <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", left: pct, marginLeft: -5, width: 10, height: 10, borderRadius: "50%", background: C.teal, boxShadow: `0 0 6px ${C.teal}`, transition: "left .3s linear" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontFamily: F.label, fontSize: 9, color: C.muted }}>{fmt(progress)}</span>
            <span style={{ fontFamily: F.label, fontSize: 9, color: C.muted }}>{duration ? fmt(duration) : "--:--"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
            <button type="button" onClick={() => { const a = audioRef.current; if (a) a.currentTime = Math.max(0, a.currentTime - 10); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, opacity: .5 }}>
              <SkipBack style={{ width: 16, height: 16, color: C.teal }} />
            </button>
            <button type="button" onClick={toggle} style={{ width: 46, height: 46, borderRadius: "50%", background: `linear-gradient(135deg, ${C.stitch}, ${C.teal})`, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 18px ${hex(C.teal, .5)}` }}>
              {playing ? <Pause style={{ width: 16, height: 16, color: "white" }} /> : <Play style={{ width: 16, height: 16, color: "white", marginLeft: 2 }} />}
            </button>
            <button type="button" onClick={() => { const a = audioRef.current; if (a) a.currentTime = Math.min(duration, a.currentTime + 10); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, opacity: .5 }}>
              <SkipForward style={{ width: 16, height: 16, color: C.teal }} />
            </button>
          </div>
          {editMode && (
            <div style={{ marginTop: 12, textAlign: "center" }}>
              <button type="button" onClick={() => { onUpdate({ musicUrl: "", musicType: "none" as any }); setShowYt(true); }}
                style={{ background: hex(C.ocean, .6), border: `1px solid ${hex(C.teal, .25)}`, borderRadius: 99, padding: "4px 14px", cursor: "pointer", fontFamily: F.label, fontSize: 9, color: C.muted, fontWeight: 700 }}>
                Schimba sursa
              </button>
            </div>
          )}
        </div>
      )}
    </div>
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

const WaveCell: React.FC<{ value: number; label: string; color: string }> = ({ value, label, color }) => {
  const prev = useRef(value);
  const [flash, setFlash] = useState(false);
  useEffect(() => { if (prev.current !== value) { setFlash(true); setTimeout(() => setFlash(false), 300); prev.current = value; } }, [value]);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ width: 58, height: 64, background: `linear-gradient(160deg, ${C.oceanMid}, ${C.ocean})`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", border: `1.5px solid ${hex(color, .4)}`, boxShadow: `0 4px 16px ${hex(color, .3)}, inset 0 1px 0 ${hex(color, .15)}`, transform: flash ? "scale(1.1)" : "scale(1)", transition: "transform .14s" }}>
        {/* Wave inside cell */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "40%", background: hex(color, .15), borderRadius: "40% 40% 0 0" }} />
        <span style={{ fontFamily: F.display, fontSize: 22, color: C.sand, lineHeight: 1, position: "relative", zIndex: 1, textShadow: `0 0 10px ${hex(color, .5)}` }}>{String(value).padStart(2, "0")}</span>
      </div>
      <span style={{ fontFamily: F.label, fontSize: 8, letterSpacing: ".3em", textTransform: "uppercase", color, fontWeight: 700 }}>{label}</span>
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
  if (isOver) return (
    <div style={{ textAlign: "center", padding: "12px 20px", background: hex(C.teal, .12), border: `2px solid ${C.teal}`, borderRadius: 16 }}>
      <p style={{ fontFamily: F.display, fontSize: 16, color: C.teal, margin: 0 }}>🌊 Ohana! Petrecerea a inceput! 🌺</p>
    </div>
  );
  const vals = [tl?.days ?? 0, tl?.hours ?? 0, tl?.minutes ?? 0, tl?.seconds ?? 0];
  const lbls = ["Zile", "Ore", "Min", "Sec"];
  const cols = [C.teal, C.stitch, C.tealLight, C.hibiscus];
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
        <span style={{ fontFamily: F.label, fontSize: 9, letterSpacing: ".4em", textTransform: "uppercase", color: C.tealLight, padding: "4px 16px", borderRadius: 50, background: hex(C.teal, .1), border: `1.5px solid ${hex(C.teal, .3)}` }}>
          🌊 Timp ramas
        </span>
      </div>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: 8 }}>
        {vals.map((v, i) => (
          <React.Fragment key={i}>
            <WaveCell value={v} label={lbls[i]} color={cols[i]} />
            {i < 3 && <span style={{ fontFamily: F.display, fontSize: 20, color: hex(C.teal, .4), paddingTop: 14, flexShrink: 0 }}>:</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT BLOCKS
// ─────────────────────────────────────────────────────────────────────────────
export const LILO_DEFAULT_BLOCKS: InvitationBlock[] = [
  { id: "ls-photo-1", type: "photo" as const, show: true, imageData: "/lilo-stitch/78dea39a8697261c1920ce443475e692.jpg", altText: "Fotografia noastra", aspectRatio: "3:4" as const, photoClip: "arch" as const, photoMasks: ["fade-b"] as any },
  { id: "ls-text-1", type: "text", show: true, content: "Ohana inseamna familie. Si familia nu abandoneaza pe nimeni. Te invitam cu drag sa fii parte din aceasta zi de poveste tropicala!" },
  { id: "ls-calendar", type: "calendar", show: true },
  { id: "ls-divider-1", type: "divider", show: true },
  { id: "ls-text-2", type: "text", show: true, content: "Alaturi de cei dragi care ne sunt ancora si ghid la fiecare pas al acestei frumoase calatorii." },
  { id: "ls-family-1", type: "family", show: true, label: "Parintii", content: "Cu drag si recunostinta", members: JSON.stringify([{ name1: "Mama", name2: "Tata" }]) },
  { id: "ls-family-2", type: "family", show: true, label: "Nasii", content: "Cu drag si recunostinta", members: JSON.stringify([{ name1: "Nasa", name2: "Nasul" }]) },
  { id: "ls-text-3", type: "text", show: true, content: "Momentele speciale ale acestei zile vor avea loc in urmatoarele locatii:" },
  { id: "ls-location-1", type: "location", show: true, label: "Botezul", time: "15:00", locationName: "Biserica Sfantul Ilie", locationAddress: "Strada Tropicala nr. 1", wazeLink: "https://waze.com" },
  { id: "ls-divider-2", type: "divider", show: true },
  { id: "ls-location-2", type: "location", show: true, label: "Petrecerea", time: "19:00", locationName: "Restaurant Ohana", locationAddress: "Strada Insulei nr. 42", wazeLink: "https://waze.com" },
  { id: "ls-divider-3", type: "divider", show: true },
  { id: "ls-photo-2", type: "photo" as const, show: true, imageData: "/lilo-stitch/3fe54a9bd839dc01946db678e8095d22.jpg", altText: "Micutul nostru", aspectRatio: "1:1" as const, photoClip: "circle" as const, photoMasks: [] as any },
  // { id: "ls-text-4", type: "text", show: true, content: "O melodie tropicala aleasa cu drag, care sa insoteasca fiecare moment al acestei zile de neuitat." },
  // { id: "ls-music-1", type: "music", show: true, musicTitle: "", musicArtist: "", musicUrl: "", musicType: "none" },
  { id: "ls-divider-4", type: "divider", show: true },
  { id: "ls-text-5", type: "text", show: true, content: "Ne-ar bucura sa ne confirmati prezenta pentru o buna organizare a evenimentului." },
  { id: "ls-rsvp-1", type: "rsvp", show: true, label: "Confirma Prezenta 🌺" },
];

// ─────────────────────────────────────────────────────────────────────────────
// LILO & STITCH INTRO  — Stitch falls from space, click to open
// ─────────────────────────────────────────────────────────────────────────────
const LiloStitchIntro: React.FC<{ l1: string; l2: string; onDone: () => void }> = ({ l1, l2, onDone }) => {
  const showSecond = Boolean(l2 && l2 !== l1);
  const [phase, setPhase] = useState(0);  // 0=idle, 1=opening, 2=done
  const [fade,  setFade]  = useState(false);
  const [clicked, setClicked] = useState(false);
  const [confetti, setConfetti] = useState<any[]>([]);

  const handleOpen = useCallback(() => {
    if (clicked) return;
    setClicked(true);
    const cols = [C.teal, C.stitch, C.hibiscus, C.sunset, C.palmL, C.star, C.pink, C.white];
    setConfetti(Array.from({ length: 55 }, (_, i) => ({ id: i, x: 5 + Math.random() * 90, color: cols[i % cols.length], shape: i % 3 === 0 ? "circle" : "rect", delay: Math.random() * .8, size: 5 + Math.random() * 9 })));
    setPhase(1);
    setTimeout(() => setPhase(2), 500);
    setTimeout(() => { setFade(true); setTimeout(onDone, 700); }, 3200);
  }, [clicked, onDone]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999, overflow: "hidden",
      background: `linear-gradient(160deg, ${C.night} 0%, ${C.ocean} 30%, ${C.oceanMid} 60%, ${C.teal} 100%)`,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      opacity: fade ? 0 : 1, transition: fade ? "opacity .7s ease" : "none",
      pointerEvents: fade ? "none" : "auto",
    }}>
      <style>{LS_CSS}</style>
      {confetti.map(c => <Confetto key={c.id} {...c} />)}
      <StarScatter />

      {/* Ocean waves at bottom */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 0, pointerEvents: "none" }}>
        <svg viewBox="0 0 400 80" preserveAspectRatio="none" style={{ width: "100%", height: 80 }}>
          <path d="M0,40 C80,20 160,60 240,40 C320,20 360,55 400,40 L400,80 L0,80 Z" fill={hex(C.teal, .25)} />
          <path d="M0,55 C60,35 140,70 220,55 C300,35 360,65 400,55 L400,80 L0,80 Z" fill={hex(C.teal, .15)} />
        </svg>
      </div>

      {/* Floating hibiscus */}
      {[{ x: 5, y: 80, d: 0 }, { x: 90, y: 75, d: .7 }, { x: 2, y: 30, d: 1.4 }, { x: 93, y: 25, d: .3 }].map((p, i) => (
        <div key={i} style={{ position: "fixed", left: `${p.x}%`, top: `${p.y}%`, fontSize: 24, animation: `ls-float ${3 + i * .4}s ${p.d}s ease-in-out infinite`, pointerEvents: "none", opacity: .6 }}>🌺</div>
      ))}
      {/* Palm trees */}
      <div style={{ position: "fixed", bottom: 0, left: 0, fontSize: 64, opacity: .25, pointerEvents: "none" }}>🌴</div>
      <div style={{ position: "fixed", bottom: 0, right: 0, fontSize: 64, opacity: .25, pointerEvents: "none", transform: "scaleX(-1)" }}>🌴</div>

      {/* ── IDLE STATE ── */}
      {phase === 0 && (
        <div style={{ position: "relative", zIndex: 10, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          {/* Rocket + Stitch falling from space */}
          <div style={{ animation: "ls-float 3.5s ease-in-out infinite", filter: `drop-shadow(0 0 30px ${hex(C.stitch, .6)})` }}>
            <img src={IMG.stitchSpace} alt="Stitch from space"
              style={{ width: "min(220px,60vw)", objectFit: "contain", filter: `drop-shadow(0 8px 24px ${hex(C.stitch, .6)})` }}
            />
          </div>
          {/* Logo */}
          <img src={IMG.logo} alt="Lilo & Stitch"
            style={{ width: "min(240px,65vw)", objectFit: "contain", filter: `drop-shadow(0 4px 16px ${hex(C.teal, .5)})`, animation: "ls-heartBeat 3s ease-in-out infinite" }}
          />
          {/* Name */}
          <div>
            <h1 style={{ fontFamily: F.display, fontSize: "clamp(34px,9vw,54px)", color: C.sand, margin: "0 0 4px", textShadow: `2px 3px 0 ${C.ocean}, 0 0 20px ${hex(C.teal, .5)}` }}>
              {showSecond ? `${l1} & ${l2}` : l1}
            </h1>
            <p style={{ fontFamily: F.label, fontSize: 14, color: hex(C.tealLight, .9), margin: 0, letterSpacing: ".05em" }}>
              te invita pe insula! 🌊
            </p>
          </div>
          {/* Characters row */}
          <div style={{ display: "flex", gap: 18, alignItems: "flex-end" }}>
            {[{ src: IMG.lilo, d: 0 }, { src: IMG.stitch, d: .3 }, { src: IMG.angel, d: .6 }].map((ch, i) => (
              <div key={i} className="ls-hover" style={{ animation: `ls-bob ${2.8 + i * .3}s ${ch.d}s ease-in-out infinite` }}>
                <img src={ch.src} alt="" style={{ height: 72, objectFit: "contain", filter: "drop-shadow(0 4px 12px rgba(0,0,0,.4))" }} />
              </div>
            ))}
          </div>
          {/* Button */}
          <button onClick={handleOpen} style={{
            fontFamily: F.display, fontSize: 16, color: C.ocean,
            background: `linear-gradient(135deg, ${C.teal}, ${C.tealLight})`,
            border: `3px solid ${C.sand}`, borderRadius: 50, padding: "16px 40px",
            cursor: "pointer", boxShadow: `0 6px 28px ${hex(C.teal, .6)}, 0 0 0 6px ${hex(C.teal, .15)}`,
            animation: "ls-pulse 2.2s ease-in-out infinite", position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(255,255,255,.3),transparent)", backgroundSize: "200% 100%", animation: "ls-shimmer 2s linear infinite", borderRadius: 50 }} />
            <span style={{ position: "relative" }}>Deschide Invitatia 🌺</span>
          </button>
        </div>
      )}

      {/* ── OPENING ── */}
      {phase >= 1 && (
        <div style={{ position: "relative", zIndex: 10, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div style={{ opacity: phase >= 2 ? 1 : 0, transition: "opacity .5s", animation: phase >= 2 ? "ls-popIn .6s cubic-bezier(.34,1.4,.64,1) both" : "none" }}>
            <img src={IMG.liloStitch} alt="Lilo & Stitch"
              style={{ width: "min(300px,80vw)", objectFit: "contain", filter: `drop-shadow(0 8px 28px ${hex(C.teal, .5)})` }}
            />
          </div>
          <div style={{ opacity: phase >= 2 ? 1 : 0, transition: "opacity .5s .2s" }}>
            <p style={{ fontFamily: F.label, fontSize: 10, letterSpacing: ".5em", textTransform: "uppercase", color: C.tealLight, margin: "0 0 4px" }}>✦ OHANA MEANS FAMILY ✦</p>
            <h1 style={{ fontFamily: F.display, fontSize: "clamp(32px,8vw,50px)", color: C.sand, margin: "0 0 4px", textShadow: `2px 3px 0 ${C.ocean}` }}>
              {showSecond ? `${l1} & ${l2}` : l1}
            </h1>
            <p style={{ fontFamily: F.label, fontSize: 14, color: hex(C.tealLight, .85), margin: 0 }}>te invita pe insula! 🌊</p>
          </div>
          <p style={{ fontFamily: F.label, fontSize: 8, letterSpacing: ".4em", textTransform: "uppercase", color: hex(C.sand, .45), margin: "4px 0 0", opacity: phase >= 2 ? 1 : 0, transition: "opacity .5s .5s" }}>
            🌺 Ohana! 🌺
          </p>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// AUDIO MODAL
// ─────────────────────────────────────────────────────────────────────────────
const AudioPermissionModal: React.FC<{ childName: string; onAllow: () => void; onDeny: () => void }> = ({ childName, onAllow, onDeny }) => (
  <div style={{ position: "fixed", inset: 0, zIndex: 10020, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ position: "absolute", inset: 0, background: hex(C.ocean, .8), backdropFilter: "blur(10px)" }} />
    <div style={{ position: "relative", background: `linear-gradient(155deg, ${C.oceanMid}, ${C.ocean})`, borderRadius: 24, padding: "32px 28px 24px", maxWidth: 320, width: "90%", textAlign: "center", boxShadow: `0 24px 60px rgba(0,0,0,.5), 0 0 0 1.5px ${hex(C.teal, .3)}`, border: `1.5px solid ${hex(C.teal, .25)}` }}>
      {/* Top wave */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${C.hibiscus}, ${C.teal}, ${C.stitch}, ${C.teal}, ${C.hibiscus})`, borderRadius: "22px 22px 0 0" }} />
      <div style={{ fontSize: 52, marginBottom: 8, animation: "ls-heartBeat 2s ease-in-out infinite" }}>🎵</div>
      <img src={IMG.stitch} alt="" style={{ width: 80, objectFit: "contain", filter: `drop-shadow(0 0 12px ${hex(C.stitch, .4)})`, marginBottom: 12 }} />
      <p style={{ fontFamily: F.display, fontSize: 26, color: C.teal, margin: "0 0 6px" }}>{childName}</p>
      <p style={{ fontFamily: F.body, fontSize: 13, fontWeight: 700, color: C.sand, margin: "0 0 8px" }}>te invita pe insula Ohana</p>
      <p style={{ fontFamily: F.body, fontSize: 11, color: C.muted, margin: "0 0 24px", lineHeight: 1.6 }}>Invitatia are o melodie tropicala.<br />Vrei sa activezi muzica?</p>
      <button type="button" onClick={onAllow}
        style={{ width: "100%", padding: "14px 0", background: `linear-gradient(135deg, ${C.stitch}, ${C.teal})`, border: "none", borderRadius: 50, cursor: "pointer", fontFamily: F.label, fontSize: 11, fontWeight: 700, color: "white", letterSpacing: ".1em", marginBottom: 10, boxShadow: `0 6px 20px ${hex(C.teal, .45)}` }}>
        Da, activeaza muzica 🎵
      </button>
      <button type="button" onClick={onDeny}
        style={{ width: "100%", padding: "10px 0", background: "transparent", border: "none", cursor: "pointer", fontFamily: F.body, fontSize: 11, color: C.muted }}>
        Nu, continua fara muzica
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
  <div style={{ position: "absolute", top: -18, right: 6, zIndex: 9999, display: "flex", alignItems: "center", gap: 2, borderRadius: 99, border: `1.5px solid ${hex(C.teal, .4)}`, background: hex(C.ocean, .95), backdropFilter: "blur(8px)", padding: "3px 5px", pointerEvents: "auto", boxShadow: "0 4px 16px rgba(0,0,0,.5)" }}>
  {([
    [() => onUp(), isFirst, <ChevronUp style={{ width: 13, height: 13, color: C.teal }} />],
    [() => onDown(), isLast, <ChevronDown style={{ width: 13, height: 13, color: C.teal }} />],
  ] as [() => void, boolean, React.ReactNode][]).map(([fn, dis, icon], i) => (
    <button key={i} type="button" onClick={e => { e.stopPropagation(); fn(); }} disabled={dis}
      style={{ background: "none", border: "none", padding: 5, borderRadius: 99, cursor: "pointer", display: "flex", alignItems: "center", opacity: dis ? .2 : 1 }}>{icon}</button>
  ))}
  <div style={{ width: 1, height: 12, background: hex(C.teal, .3), margin: "0 1px" }} />
  <button type="button" onClick={e => { e.stopPropagation(); onToggle(); }} style={{ background: "none", border: "none", padding: 5, borderRadius: 99, cursor: "pointer", display: "flex", alignItems: "center" }}>
    {visible ? <Eye style={{ width: 13, height: 13, color: C.teal }} /> : <EyeOff style={{ width: 13, height: 13, color: C.muted }} />}
  </button>
  <button type="button" onClick={e => { e.stopPropagation(); onDelete(); }} style={{ background: "none", border: "none", padding: 5, borderRadius: 99, cursor: "pointer", display: "flex", alignItems: "center" }}>
    <Trash2 style={{ width: 13, height: 13, color: "#fca5a5" }} />
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
    <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", height: 32, zIndex: 20 }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div style={{ position: "absolute", left: 0, right: 0, height: 1, background: `repeating-linear-gradient(to right, ${hex(C.teal, .4)} 0, ${hex(C.teal, .4)} 6px, transparent 6px, transparent 12px)`, zIndex: 1 }} />
      <button type="button" onClick={() => setOpenInsertAt(isOpen ? null : insertIdx)}
        style={{ width: 26, height: 26, borderRadius: "50%", background: isOpen ? C.teal : hex(C.ocean, .9), border: `1.5px solid ${hex(C.teal, .5)}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: isOpen ? C.ocean : C.teal, boxShadow: `0 2px 10px ${hex(C.teal, .3)}`, opacity: 1, transition: "opacity .15s, transform .15s, background .15s", transform: (hov || isOpen) ? "scale(1)" : "scale(.7)", zIndex: 2, position: "relative", fontWeight: 700 }}>
        {isOpen ? "×" : "+"}
      </button>
      {isOpen && (
        <div style={{ position: "absolute", bottom: 34, left: "50%", transform: "translateX(-50%)", background: hex(C.ocean, .97), borderRadius: 16, border: `1.5px solid ${hex(C.teal, .3)}`, boxShadow: "0 16px 48px rgba(0,0,0,.5)", padding: 16, zIndex: 100, width: 260 }}
          onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
          <p style={{ fontFamily: F.label, fontSize: ".5rem", fontWeight: 700, letterSpacing: ".3em", textTransform: "uppercase", color: C.muted, margin: "0 0 10px", textAlign: "center" }}>Adauga bloc</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
            {BLOCK_TYPES.map(bt => (
              <button key={bt.type} type="button" onClick={() => onInsert(bt.type, bt.def)}
                style={{ background: hex(C.teal, .08), border: `1px solid ${hex(C.teal, .22)}`, borderRadius: 10, padding: "8px 4px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, transition: "background .15s, border-color .15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = hex(C.teal, .2); }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = hex(C.teal, .08); }}>
                <span style={{ fontSize: 18, lineHeight: 1 }}>{BLOCK_TYPE_ICONS[bt.type] || "+"}</span>
                <span style={{ fontFamily: F.label, fontSize: ".5rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: C.teal, lineHeight: 1.2, textAlign: "center" }}>{bt.label.replace(/^[^\s]+\s/, "")}</span>
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
const LiloAndStitchTemplate: React.FC<InvitationTemplateProps & {
  editMode?: boolean;
  onProfileUpdate?: (patch: Record<string, any>) => void;
  onBlocksUpdate?: (blocks: InvitationBlock[]) => void;
  onBlockSelect?: (block: InvitationBlock | null, idx: number, textKey?: string, textLabel?: string) => void;
  selectedBlockId?: string;
  suppressAudioModal?: boolean;
  scrollContainer?: HTMLElement | null;
}> = ({ data, onOpenRSVP, editMode = false, suppressAudioModal = false, onProfileUpdate, onBlocksUpdate, onBlockSelect, selectedBlockId }) => {
  const { profile, guest } = data;
  Object.assign(C, getLiloTheme((profile as any).colorTheme));
  const isWedding = String(profile.eventType || "").toLowerCase() === "wedding";
  const safeJSON = (s: string | undefined, fb: any) => { try { return s ? JSON.parse(s) : fb; } catch { return fb; } };

  const blocksFromDB: InvitationBlock[] | null = safeJSON(profile.customSections, null);
  const hasDB = Array.isArray(blocksFromDB) && blocksFromDB.length > 0;
  const [blocks, setBlocks] = useState<InvitationBlock[]>(() => hasDB ? blocksFromDB! : LILO_DEFAULT_BLOCKS as unknown as InvitationBlock[]);
  useEffect(() => {
    const fresh: InvitationBlock[] | null = safeJSON(profile.customSections, null);
    if (Array.isArray(fresh) && fresh.length > 0) setBlocks(fresh);
    else if (fresh !== null && Array.isArray(fresh) && fresh.length === 0) setBlocks(LILO_DEFAULT_BLOCKS as unknown as InvitationBlock[]);
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
    updateTimeline([...getTimelineItems(), { id: Date.now().toString(), title: preset?.title || "", time: "", location: "", icon: preset?.icon || "party", notice: "" }]);
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

  const l1 = (profile.partner1Name || "Prenume").trim() || "Prenume";
  const l2 = !isWedding ? "" : (profile.partner2Name || "").trim();
  const wd = profile.weddingDate ? new Date(profile.weddingDate) : null;
  const displayDay     = wd ? wd.getDate() : "";
  const displayMonth   = wd ? wd.toLocaleDateString("ro-RO", { month: "long" }).toUpperCase() : "";
  const displayYear    = wd ? wd.getFullYear() : "";
  const displayWeekday = wd ? wd.toLocaleDateString("ro-RO", { weekday: "long" }) : "";

  const getEventText = () => {
    const map: Record<string, any> = {
      wedding:     { welcome: "Cu bucurie va invitam", celebration: "casatoriei" },
      baptism:     { welcome: "Ohana! Va invitam la", celebration: "botezului" },
      anniversary: { welcome: "Cu drag va invitam", celebration: "aniversarii" },
      kids:        { welcome: "Ohana! Te invitam la", celebration: "ziua de nastere" },
    };
    const d = map[profile.eventType || "baptism"] || map.baptism;
    return { welcome: profile.welcomeText?.trim() || d.welcome, celebration: profile.celebrationText?.trim() || d.celebration };
  };
  const texts = getEventText();

  const BLOCK_TYPES = [
    { type: "photo",     label: "📷 Foto",      def: { imageData: undefined, aspectRatio: "1:1", photoClip: "rect", photoMasks: [] } },
    { type: "text",      label: "Text",          def: { content: "Ohana inseamna familie..." } },
    { type: "location",  label: "Locatie",       def: { label: "Locatie", time: "11:00", locationName: "Locatie eveniment", locationAddress: "Adresa" } },
    { type: "calendar",  label: "📅 Calendar",   def: {} },
    { type: "countdown", label: "⏱ Countdown",   def: {} },
    { type: "timeline",  label: "🗓 Cronologie",  def: {} },
    { type: "music",     label: "🎵 Muzica",     def: { musicTitle: "", musicArtist: "", musicType: "none" } },
    { type: "gift",      label: "🎁 Cadouri",    def: { sectionTitle: "Sugestie cadou", content: "", iban: "" } },
    { type: "whatsapp",  label: "WhatsApp",      def: { label: "Contact WhatsApp", content: "0700000000" } },
    { type: "rsvp",      label: "RSVP",          def: { label: "Confirma Prezenta" } },
    { type: "divider",   label: "Linie",         def: {} },
    { type: "family",    label: "👨‍👩‍👧 Familie",  def: { label: "Parintii", content: "Cu drag", members: JSON.stringify([{ name1: "Mama", name2: "Tata" }]) } },
    { type: "date",      label: "📆 Data",       def: {} },
    { type: "description", label: "Descriere",   def: { content: "O scurta descriere..." } },
  ];

  const locationStickers = [IMG.sticker1, IMG.sticker2, IMG.sticker3, IMG.sticker4];

  return (
    <>
      <style>{LS_CSS}</style>
      {showAudioModal && (
        <AudioPermissionModal childName={profile.partner1Name || "Invitatia"}
          onAllow={() => { audioAllowedRef.current = true; musicPlayRef.current?.unlock(); setShowAudioModal(false); }}
          onDeny={() => { audioAllowedRef.current = false; setShowAudioModal(false); }}
        />
      )}
      {showIntro && <LiloStitchIntro l1={l1} l2={l2} onDone={handleIntroDone} />}

      <div style={{ minHeight: "100vh", position: "relative", fontFamily: F.body, opacity: contentVisible ? 1 : 0, transform: contentVisible ? "translateY(0)" : "translateY(16px)", transition: "opacity .7s cubic-bezier(.4,0,.2,1), transform .7s cubic-bezier(.4,0,.2,1)", paddingBottom: 60 }}>

        {/* ── BACKGROUND ── */}
        <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
          <div style={{
            position: "absolute", inset: 0,
            background: [
              `radial-gradient(circle at 12% 8%, ${hex(C.stitch, .2)} 0%, transparent 40%)`,
              `radial-gradient(circle at 88% 12%, ${hex(C.teal, .15)} 0%, transparent 40%)`,
              `radial-gradient(circle at 8% 88%, ${hex(C.hibiscus, .1)} 0%, transparent 35%)`,
              `radial-gradient(circle at 90% 85%, ${hex(C.palm, .15)} 0%, transparent 35%)`,
              `linear-gradient(160deg, ${C.night} 0%, ${C.ocean} 25%, ${C.oceanMid} 60%, ${hex(C.ocean, .95)} 100%)`,
            ].join(", "),
          }} />
          {/* Subtle wave texture */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 4px, ${hex(C.teal, .015)} 4px, ${hex(C.teal, .015)} 5px)`, pointerEvents: "none" }} />
        </div>

        {/* Fixed palm trees */}
        <div style={{ position: "fixed", bottom: 0, left: 0, fontSize: 80, opacity: .06, pointerEvents: "none", zIndex: 1 }}>🌴</div>
        <div style={{ position: "fixed", bottom: 0, right: 0, fontSize: 80, opacity: .06, pointerEvents: "none", zIndex: 1, transform: "scaleX(-1)" }}>🌴</div>

        {/* Fixed stars */}
        <StarScatter fixed />

        {/* Fixed floating hibiscus */}
        {[{ x: 3, y: 10 }, { x: 93, y: 8 }, { x: 2, y: 72 }, { x: 95, y: 70 }].map((p, i) => (
          <div key={i} style={{ position: "fixed", left: `${p.x}%`, top: `${p.y}%`, fontSize: 18, opacity: .2, animation: `ls-float ${3.5 + i * .5}s ${i * .4}s ease-in-out infinite`, pointerEvents: "none", zIndex: 1 }}>🌺</div>
        ))}

        {/* Fixed wave at bottom */}
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1, pointerEvents: "none", height: 60 }}>
          <svg viewBox="0 0 400 60" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
            <path d="M0,30 C80,10 160,50 240,30 C320,10 360,45 400,30 L400,60 L0,60 Z" fill={hex(C.teal, .06)} />
          </svg>
        </div>

        <div style={{ position: "relative", zIndex: 2, maxWidth: 440, margin: "0 auto", padding: "28px 16px 0" }}>

          {/* ── HERO CARD ── */}
          <Reveal from="fade">
            <BlockStyleProvider value={{ blockId: "__hero__", textStyles: undefined, onTextSelect: () => {} }}>
              <div style={{
                background: `linear-gradient(155deg, ${hex(C.oceanMid, .9)} 0%, ${C.ocean} 100%)`,
                borderRadius: 26, overflow: "hidden", position: "relative",
                border: `2px solid ${hex(C.teal, .2)}`,
                boxShadow: `0 16px 60px rgba(0,0,0,.5), 0 0 0 1px ${hex(C.teal, .08)}`,
              }}>
                {/* Bubble texture */}
                <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle at 3px 3px, ${hex(C.teal, .04)} 1px, transparent 0)`, backgroundSize: "22px 22px", pointerEvents: "none" }} />
                {/* Top gradient stripe */}
                <div style={{ height: 4, background: `linear-gradient(90deg, ${C.hibiscus}, ${C.teal}, ${C.stitch}, ${C.tealLight}, ${C.hibiscus})` }} />

                {/* Hero image area */}
                <div style={{ position: "relative", height: 230, overflow: "hidden" }}>
                  <img src={IMG.heroBg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%", filter: "saturate(1.2) brightness(0.9)" }} />
                  {/* Overlay gradient */}
                  <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${hex(C.night, .3)} 0%, ${hex(C.ocean, .1)} 100%)` }} />
                  {/* Stitch surfing in corner */}
                  <img src={IMG.stitchSurf} alt="" style={{ position: "absolute", bottom: -8, right: 8, width: 110, objectFit: "contain", filter: `drop-shadow(0 0 18px ${hex(C.stitch, .5)})`, animation: "ls-bob 3.5s ease-in-out infinite" }} />
                  {/* Wave bottom of hero */}
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
                    <svg viewBox="0 0 400 24" preserveAspectRatio="none" style={{ width: "100%", height: 24 }}>
                      <path d="M0,12 C80,0 160,24 240,12 C320,0 360,20 400,12 L400,24 L0,24 Z" fill={C.ocean} />
                    </svg>
                  </div>
                </div>

                <div style={{ padding: "16px 24px 28px", position: "relative" }}>
                  {/* Ohana badge */}
                  <Reveal from="fade" delay={0.1}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
                      <div style={{ display: "inline-block", background: `linear-gradient(135deg, ${C.hibiscus}, ${hex(C.hibiscus, .7)})`, color: "white", fontFamily: F.label, fontSize: 9, padding: "4px 20px", borderRadius: 20, letterSpacing: 2, boxShadow: `0 4px 14px ${hex(C.hibiscus, .45)}` }}>
                        🌺 ESTI INVITAT 🌺
                      </div>
                    </div>
                  </Reveal>

                  {/* Welcome */}
                  <Reveal from="bottom" delay={0.15}>
                    <InlineEdit tag="p" editMode={editMode} value={texts.welcome} onChange={v => upProfile("welcomeText", v)} textLabel="Hero · welcome"
                      style={{ fontFamily: F.body, fontSize: 13, fontWeight: 600, fontStyle: "italic", color: C.muted, margin: "0 0 10px", lineHeight: 1.7, textAlign: "center" }} />
                  </Reveal>

                  {/* NAME */}
                  <Reveal from="bottom" delay={0.2}>
                    <div style={{ textAlign: "center" }}>
                      {!isWedding ? (
                        <InlineEdit tag="h1" editMode={editMode} value={profile.partner1Name || "Prenume"} onChange={v => upProfile("partner1Name", v)} textLabel="Hero · nume"
                          style={{ fontFamily: F.display, fontSize: "clamp(36px,9vw,56px)", color: C.sand, margin: "0 0 4px", textShadow: `2px 3px 0 ${C.ocean}, 0 0 20px ${hex(C.teal, .4)}` }} />
                      ) : (
                        <div>
                          <InlineEdit tag="h1" editMode={editMode} value={profile.partner1Name || "Prenume"} onChange={v => upProfile("partner1Name", v)} textLabel="Hero · nume 1"
                            style={{ fontFamily: F.display, fontSize: "clamp(28px,7vw,44px)", color: C.sand, margin: 0, textShadow: `2px 3px 0 ${C.ocean}` }} />
                          <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center", margin: "8px 0" }}>
                            <div style={{ flex: 1, height: 2, background: `linear-gradient(to right, transparent, ${C.teal})`, borderRadius: 2 }} />
                            <span style={{ fontFamily: F.display, fontSize: 20, color: C.teal }}>🌊</span>
                            <div style={{ flex: 1, height: 2, background: `linear-gradient(to left, transparent, ${C.teal})`, borderRadius: 2 }} />
                          </div>
                          <InlineEdit tag="h1" editMode={editMode} value={profile.partner2Name || "Prenume"} onChange={v => upProfile("partner2Name", v)} textLabel="Hero · nume 2"
                            style={{ fontFamily: F.display, fontSize: "clamp(28px,7vw,44px)", color: C.tealLight, margin: 0, textShadow: `2px 3px 0 ${C.ocean}` }} />
                        </div>
                      )}
                    </div>
                  </Reveal>

                  {/* Celebration */}
                  <Reveal from="bottom" delay={0.25}>
                    <InlineEdit tag="p" editMode={editMode} value={texts.celebration} onChange={v => upProfile("celebrationText", v)} textLabel="Hero · celebrare"
                      style={{ fontFamily: F.label, fontSize: 15, color: C.teal, margin: "8px 0 0", textAlign: "center", letterSpacing: ".05em" }} />
                  </Reveal>

                  {/* Wave divider */}
                  <div style={{ margin: "18px 0" }}><WaveDivider /></div>

                  {/* DATE */}
                  <Reveal from="bottom" delay={0.3}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center", marginBottom: 20 }}>
                      <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${hex(C.teal, .4)})` }} />
                      <div style={{
                        background: `linear-gradient(155deg, ${C.oceanMid}, ${C.ocean})`,
                        border: `2px solid ${hex(C.teal, .4)}`,
                        borderRadius: 16, padding: "12px 20px", textAlign: "center", minWidth: 110,
                        boxShadow: `0 4px 18px rgba(0,0,0,.3), 0 0 14px ${hex(C.teal, .15)}`,
                        animation: "ls-pulse 3s ease-in-out infinite",
                      }}>
                        {wd ? (
                          <>
                            <p style={{ fontFamily: F.display, fontSize: 34, color: C.teal, margin: 0, lineHeight: 1, textShadow: `0 0 14px ${hex(C.teal, .5)}` }}>{displayDay}</p>
                            <p style={{ fontFamily: F.label, fontSize: 11, color: C.sand, margin: "3px 0 0" }}>{displayMonth?.slice(0, 3)} · {displayYear}</p>
                            <p style={{ fontFamily: F.body, fontSize: 9, color: C.muted, textTransform: "capitalize", margin: "1px 0 0" }}>{displayWeekday}</p>
                          </>
                        ) : <p style={{ color: C.muted, fontFamily: F.label, fontSize: 11, margin: 0 }}>Data</p>}
                      </div>
                      <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${hex(C.teal, .4)})` }} />
                    </div>
                  </Reveal>

                  {/* Countdown */}
                  <Reveal from="bottom" delay={0.35}>
                    <div style={{ marginBottom: 22 }}>
                      <Countdown targetDate={profile.weddingDate} />
                    </div>
                  </Reveal>

                  {/* Characters */}
                  <Reveal from="bottom" delay={0.4}>
                    <div style={{ display: "flex", justifyContent: "center", gap: 14, marginBottom: 18 }}>
                      {[{ src: IMG.lilo, d: 0 }, { src: IMG.stitch, d: .2 }, { src: IMG.angel, d: .4 }].map((ch, i) => (
                        <div key={i} className="ls-hover" style={{ animation: `ls-bounce ${2.4 + i * .3}s ${ch.d}s ease-in-out infinite` }}>
                          <img src={ch.src} alt="" style={{ height: 66, objectFit: "contain", filter: "drop-shadow(0 4px 10px rgba(0,0,0,.4))" }} />
                        </div>
                      ))}
                    </div>
                  </Reveal>

                  {/* GUEST box */}
                  <Reveal from="bottom" delay={0.44}>
                    <div style={{ background: hex(C.teal, .08), border: `2px solid ${hex(C.teal, .25)}`, borderRadius: 18, padding: "14px 20px", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, boxShadow: `0 4px 18px rgba(0,0,0,.2), 0 0 14px ${hex(C.teal, .1)}` }}>
                      {/* Wave inside */}
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 8, opacity: .3 }}>
                        <svg viewBox="0 0 400 8" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
                          <path d="M0,4 C100,0 200,8 300,4 C350,2 380,6 400,4 L400,8 L0,8 Z" fill={C.teal} />
                        </svg>
                      </div>
                      <img src={IMG.stitchWave} alt="" style={{ position: "absolute", bottom: -8, right: -4, width: 64, objectFit: "contain", filter: `drop-shadow(0 2px 8px ${hex(C.stitch, .4)})`, pointerEvents: "none" }} />
                      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", fontSize: 18 }}>🌺</div>
                      <p style={{ fontFamily: F.label, fontSize: 8, letterSpacing: ".5em", textTransform: "uppercase", color: hex(C.tealLight, .8), margin: "6px 0 6px" }}>invitatie pentru</p>
                      <p style={{ fontFamily: F.display, fontSize: 20, color: C.sand, margin: 0, letterSpacing: .5 }}>
                        {guest?.name || "Invitatul Special"}
                      </p>
                    </div>
                  </Reveal>
                </div>
                <WaveDivider thin color={C.teal} />
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
                <div style={{ position: "relative", padding: "10px 0", opacity: block.show === false ? .45 : 1 }}
                  onClick={editMode ? () => onBlockSelect?.(block, idx) : undefined}>
                  <BlockStyleProvider value={{ blockId: block.id, textStyles: (block as any).textStyles, onTextSelect: (k, l) => onBlockSelect?.(block, idx, k, l), fontFamily: (block as any).blockFontFamily, fontSize: (block as any).blockFontSize, fontWeight: (block as any).blockFontWeight, fontStyle: (block as any).blockFontStyle, letterSpacing: (block as any).blockLetterSpacing, lineHeight: (block as any).blockLineHeight, textColor: (block as any).textColor && (block as any).textColor !== "transparent" ? (block as any).textColor : undefined, textAlign: (block as any).blockAlign } as BlockStyle}>
                    {editMode && <BlockToolbar onUp={() => movBlock(idx, -1)} onDown={() => movBlock(idx, 1)} onToggle={() => updBlock(idx, { show: block.show === false })} onDelete={() => delBlock(idx)} visible={block.show !== false} isFirst={idx === 0} isLast={idx === blocks.length - 1} />}
                    {editMode && block.show === false && (
                      <div style={{ position: "absolute", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 16, pointerEvents: "none" }}>
                        <div style={{ position: "absolute", inset: 0, borderRadius: 16, background: "rgba(0,0,0,.12)", backdropFilter: "blur(2px)" }} />
                        <EyeOff size={22} color={hex(C.teal, .6)} style={{ position: "relative", zIndex: 10 }} />
                      </div>
                    )}

                    {/* ── DIVIDER ── */}
                    {block.type === "divider" && <WaveDivider />}

                    {/* ── RSVP ── */}
                    {block.type === "rsvp" && (
                      <div style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                          <img src={IMG.stitchHug} alt="" style={{ width: 84, objectFit: "contain", filter: `drop-shadow(0 0 16px ${hex(C.stitch, .5)})`, animation: "ls-float 3s ease-in-out infinite" }} />
                        </div>
                        <button type="button" onClick={() => !editMode && onOpenRSVP?.()}
                          style={{ width: "100%", padding: "18px 24px", background: `linear-gradient(135deg, ${C.stitch}, ${C.teal})`, border: "none", borderRadius: 20, cursor: "pointer", fontFamily: F.display, fontSize: 15, color: "white", boxShadow: `0 8px 28px ${hex(C.teal, .5)}, 0 0 0 3px ${hex(C.teal, .12)}`, animation: "ls-pulse 2.5s ease-in-out infinite", position: "relative", overflow: "hidden" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.03)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}>
                          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent)", backgroundSize: "200% 100%", animation: "ls-shimmer 2s linear infinite", borderRadius: 20 }} />
                          <span style={{ position: "relative" }}>
                            <InlineEdit tag="span" editMode={editMode} value={block.label || "Confirma Prezenta"} onChange={v => updBlock(idx, { label: v })} textLabel="RSVP · text" />
                          </span>
                        </button>
                      </div>
                    )}

                    {/* ── PHOTO ── */}
                    {block.type === "photo" && (
                      <Reveal>
                        <div onClick={editMode ? () => onBlockSelect?.(block, idx) : undefined}
                          style={editMode ? { cursor: "pointer", outline: selectedBlockId === block.id ? `2px solid ${C.teal}` : "none", outlineOffset: 4, borderRadius: 16 } : undefined}>
                          <PhotoBlock imageData={block.imageData} altText={block.altText} editMode={editMode} onUpload={url => updBlock(idx, { imageData: url })} onRemove={() => updBlock(idx, { imageData: undefined })} onRatioChange={r => updBlock(idx, { aspectRatio: r })} onClipChange={c => updBlock(idx, { photoClip: c })} onMasksChange={m => updBlock(idx, { photoMasks: m } as any)} aspectRatio={block.aspectRatio as any} photoClip={block.photoClip as any} photoMasks={block.photoMasks as any} placeholderInitial1={l1} />
                        </div>
                      </Reveal>
                    )}

                    {/* ── TEXT ── */}
                    {block.type === "text" && (
                      <Reveal>
                        <TropicalCard accentColor={C.tealLight} glass>
                          <InlineEdit tag="p" editMode={editMode} value={block.content || ""} onChange={v => updBlock(idx, { content: v })} multiline textLabel="Text"
                            style={{ fontFamily: F.body, fontSize: 14, color: C.sand, lineHeight: 1.75, textAlign: "center", margin: 0, fontStyle: "italic" }} />
                        </TropicalCard>
                      </Reveal>
                    )}

                    {/* ── LOCATION ── */}
                    {block.type === "location" && (
                      <Reveal>
                        <LocCard block={block} editMode={editMode} onUpdate={p => updBlock(idx, p)} stickerSrc={locationStickers[idx % locationStickers.length]} />
                      </Reveal>
                    )}

                    {/* ── CALENDAR ── */}
                    {block.type === "calendar" && (
                      <Reveal>
                        <TropicalCard accentColor={C.teal} imgDeco={{ src: IMG.hibiscus, side: "left", top: -20, size: 68 }}>
                          <CalendarMonth date={profile.weddingDate} />
                        </TropicalCard>
                      </Reveal>
                    )}

                    {/* ── COUNTDOWN ── */}
                    {block.type === "countdown" && (
                      <Reveal>
                        <TropicalCard accentColor={C.stitch} imgDeco={{ src: IMG.stitchRun, side: "right", top: -18, size: 70 }}>
                          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
                            <span style={{ fontFamily: F.label, fontSize: 9, fontWeight: 700, letterSpacing: ".4em", textTransform: "uppercase", color: hex(C.teal, .8), padding: "4px 16px", borderRadius: 50, background: hex(C.teal, .1), border: `1.5px solid ${hex(C.teal, .3)}` }}>🌊 Timp ramas</span>
                          </div>
                          <Countdown targetDate={profile.weddingDate} />
                        </TropicalCard>
                      </Reveal>
                    )}

                    {/* ── TIMELINE ── */}
                    {block.type === "timeline" && (() => {
                      const timelineItems = getTimelineItems();
                      if (!editMode && timelineItems.length === 0) return null;
                      return (
                        <Reveal>
                          <TropicalCard accentColor={C.hibiscus} imgDeco={{ src: IMG.ukulele, side: "right", top: -20, size: 68 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 }}>
                              <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${hex(C.teal, .3)})` }} />
                              <p style={{ fontFamily: F.label, fontSize: 9, fontWeight: 700, letterSpacing: ".38em", textTransform: "uppercase", color: hex(C.tealLight, .8), margin: 0 }}>Programul Zilei</p>
                              <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${hex(C.teal, .3)})` }} />
                            </div>
                            {timelineItems.map((item: any, i: number) => (
                              <div key={item.id} style={{ display: "grid", gridTemplateColumns: "54px 20px 1fr auto", alignItems: "stretch", minHeight: 46 }}>
                                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "flex-end", paddingRight: 10, paddingTop: 4 }}>
                                  <InlineTime editMode={editMode} value={item.time || ""} onChange={v => updateTimelineItem(item.id, { time: v })} textKey={`tl:${item.id}:time`} textLabel={`Ora ${i + 1}`}
                                    style={{ fontFamily: F.body, fontSize: 13, fontWeight: 700, color: C.teal, textAlign: "right", lineHeight: 1.2, width: "100%" }} />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: C.teal, boxShadow: `0 0 8px ${hex(C.teal, .6)}`, flexShrink: 0, marginTop: 3 }} />
                                  {i < timelineItems.length - 1 && <div style={{ flex: 1, width: 2, background: `linear-gradient(to bottom, ${hex(C.teal, .4)}, transparent)`, marginTop: 3, borderRadius: 99 }} />}
                                </div>
                                <div style={{ paddingLeft: 10, paddingTop: 2, paddingBottom: i < timelineItems.length - 1 ? 20 : 0 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <InlineEdit tag="span" editMode={editMode} value={item.title || ""} onChange={v => updateTimelineItem(item.id, { title: v })} placeholder="Moment..." textKey={`tl:${item.id}:title`} textLabel={`Titlu ${i + 1}`}
                                      style={{ fontFamily: F.body, fontSize: 14, fontWeight: 700, color: C.sand, display: "block", lineHeight: 1.3 }} />
                                    {editMode && <button type="button" onClick={() => removeTimelineItem(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 13, padding: "0 3px", opacity: .5 }}>✕</button>}
                                  </div>
                                  {(editMode || item.notice) && (
                                    <InlineEdit tag="span" editMode={editMode} value={item.notice || ""} onChange={v => updateTimelineItem(item.id, { notice: v })} placeholder="Nota..." textKey={`tl:${item.id}:notice`} textLabel={`Nota ${i + 1}`}
                                      style={{ fontFamily: F.body, fontSize: 12, fontStyle: "italic", color: C.muted, display: "block", marginTop: 3, lineHeight: 1.5 }} />
                                  )}
                                </div>
                              </div>
                            ))}
                            <TimelineInsertButton editMode={editMode} colors={{ dark: C.teal, light: hex(C.teal, .4), xl: hex(C.teal, .08), muted: C.muted }} onAdd={preset => addTimelineItem(preset)} />
                          </TropicalCard>
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
                        <TropicalCard accentColor={C.sunset} imgDeco={{ src: IMG.pineapple, side: "right", top: -22, size: 70 }}>
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 36, marginBottom: 12 }}>🎁</div>
                            <InlineEdit tag="h3" editMode={editMode} value={block.sectionTitle || "Sugestie de cadou"} onChange={v => updBlock(idx, { sectionTitle: v })} textLabel="Cadou · titlu"
                              style={{ fontFamily: F.display, fontSize: 18, color: C.sand, marginBottom: 8 }} />
                            <InlineEdit tag="p" editMode={editMode} value={block.content || ""} onChange={v => updBlock(idx, { content: v })} multiline textLabel="Cadou · text"
                              style={{ fontFamily: F.body, fontSize: 13, color: C.muted, lineHeight: 1.65 }} />
                            {(block.iban || editMode) && (
                              <div style={{ marginTop: 12, padding: "8px 12px", background: hex(C.teal, .08), borderRadius: 10, border: `1px solid ${hex(C.teal, .2)}` }}>
                                <InlineEdit tag="p" editMode={editMode} value={block.iban || ""} onChange={v => updBlock(idx, { iban: v })} placeholder="IBAN..."
                                  style={{ fontFamily: F.label, fontSize: 11, fontWeight: 700, color: C.teal }} />
                              </div>
                            )}
                          </div>
                        </TropicalCard>
                      </Reveal>
                    )}

                    {/* ── WHATSAPP ── */}
                    {block.type === "whatsapp" && (
                      <Reveal>
                        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                          <img src={IMG.nani} alt="" style={{ width: 80, objectFit: "contain", filter: "drop-shadow(0 4px 12px rgba(0,0,0,.3))" }} />
                          <a href={`https://wa.me/${(block.content || "").replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                            style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "12px 28px", borderRadius: 18, background: `linear-gradient(155deg, ${hex(C.oceanMid, .9)}, ${hex(C.ocean, .95)})`, border: `1.5px solid ${hex(C.teal, .3)}`, textDecoration: "none", boxShadow: `0 6px 20px rgba(0,0,0,.35)` }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #25D366, #128C7E)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(37,211,102,.4)" }}>
                              <MessageCircle style={{ width: 20, height: 20, color: "white" }} />
                            </div>
                            <div style={{ textAlign: "left" }}>
                              <InlineEdit tag="p" editMode={editMode} value={block.label || "Contact WhatsApp"} onChange={v => updBlock(idx, { label: v })} textLabel="WhatsApp · label"
                                style={{ fontFamily: F.body, fontWeight: 800, fontSize: 13, color: C.sand, margin: 0 }} />
                              <p style={{ fontFamily: F.label, fontSize: 10, color: C.muted, margin: 0 }}>Raspundem rapid 🌺</p>
                            </div>
                          </a>
                          {editMode && (
                            <div style={{ display: "flex", alignItems: "center", gap: 8, background: hex(C.oceanMid, .6), border: `1.5px solid ${hex(C.teal, .25)}`, borderRadius: 12, padding: "8px 14px" }}>
                              <span style={{ fontFamily: F.label, fontSize: ".6rem", fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: C.muted }}>Numar:</span>
                              <InlineEdit tag="span" editMode={editMode} value={block.content || "0700000000"} onChange={v => updBlock(idx, { content: v })} textLabel="WhatsApp · numar"
                                style={{ fontFamily: F.body, fontSize: ".9rem", color: C.sand, fontWeight: 700 }} />
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
                          <TropicalCard accentColor={C.hibiscus}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}>
                              <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${hex(C.hibiscus, .3)})` }} />
                              <InlineEdit tag="p" editMode={editMode} value={block.label || "Parintii"} onChange={v => updBlock(idx, { label: v })} textLabel="Familie · titlu"
                                style={{ fontFamily: F.label, fontSize: 9, fontWeight: 700, letterSpacing: ".42em", textTransform: "uppercase", color: hex(C.hibiscusL, .9), margin: 0 }} />
                              <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${hex(C.hibiscus, .3)})` }} />
                            </div>
                            <InlineEdit tag="p" editMode={editMode} value={block.content || "Cu drag si recunostinta"} onChange={v => updBlock(idx, { content: v })} textLabel="Familie · text"
                              style={{ fontFamily: F.body, fontSize: 12, fontStyle: "italic", color: C.muted, margin: "0 0 14px", display: "block", textAlign: "center" }} />
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {members.map((m, mi) => (
                                <div key={mi}>
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap", background: hex(C.teal, .06), border: `1px solid ${hex(C.teal, .15)}`, borderRadius: 14, padding: "10px 14px" }}>
                                    <InlineEdit tag="span" editMode={editMode} value={m.name1} onChange={v => { const nm = [...members]; nm[mi] = { ...nm[mi], name1: v }; updateMembers(nm); }} textLabel={`Familie · ${mi + 1}A`}
                                      style={{ fontFamily: F.display, fontSize: "1.35rem", color: C.sand }} />
                                    <span style={{ fontSize: 16, filter: `drop-shadow(0 0 4px ${hex(C.teal, .5)})` }}>🌊</span>
                                    <InlineEdit tag="span" editMode={editMode} value={m.name2} onChange={v => { const nm = [...members]; nm[mi] = { ...nm[mi], name2: v }; updateMembers(nm); }} textLabel={`Familie · ${mi + 1}B`}
                                      style={{ fontFamily: F.display, fontSize: "1.35rem", color: C.sand }} />
                                    {editMode && members.length > 1 && <button type="button" onClick={() => updateMembers(members.filter((_, i) => i !== mi))} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 13, padding: "0 3px" }}>✕</button>}
                                  </div>
                                  {mi < members.length - 1 && <div style={{ height: 1, margin: "4px 28px", background: `linear-gradient(to right, transparent, ${hex(C.teal, .18)}, transparent)` }} />}
                                </div>
                              ))}
                            </div>
                            {editMode && (
                              <button type="button" onClick={() => updateMembers([...members, { name1: "Nume 1", name2: "Nume 2" }])}
                                style={{ marginTop: 14, background: hex(C.teal, .1), border: `1.5px dashed ${hex(C.teal, .35)}`, borderRadius: 99, padding: "5px 18px", cursor: "pointer", fontFamily: F.label, fontSize: ".6rem", fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", color: C.tealLight, display: "block", margin: "14px auto 0" }}>
                                + Adauga
                              </button>
                            )}
                          </TropicalCard>
                        </Reveal>
                      );
                    })()}

                    {/* ── DATE ── */}
                    {block.type === "date" && (
                      <Reveal>
                        <div style={{ textAlign: "center", padding: "4px 0" }}>
                          <p style={{ fontFamily: F.label, fontWeight: 700, letterSpacing: ".3em", fontSize: ".85rem", color: C.teal, margin: 0, textShadow: `0 0 8px ${hex(C.teal, .4)}` }}>
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
                            style={{ fontFamily: F.body, fontSize: ".9rem", fontStyle: "italic", color: C.muted, lineHeight: 1.7, margin: 0 }} />
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
            <div style={{ marginTop: 28, textAlign: "center" }}>
              <WaveDivider />
              <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 16, margin: "16px 0 14px" }}>
                <div style={{ animation: "ls-float 3.5s ease-in-out infinite" }}>
                  <img src={IMG.lilo} alt="" style={{ height: 58, objectFit: "contain", filter: "drop-shadow(0 4px 10px rgba(0,0,0,.4))" }} />
                </div>
                <div style={{ animation: "ls-heartBeat 2.5s ease-in-out infinite", marginBottom: 8 }}>
                  <img src={IMG.logo} alt="Lilo & Stitch" style={{ width: 100, objectFit: "contain", filter: `drop-shadow(0 0 10px ${hex(C.teal, .4)})` }} />
                </div>
                <div style={{ animation: "ls-floatR 4s ease-in-out infinite" }}>
                  <img src={IMG.stitch} alt="" style={{ height: 58, objectFit: "contain", filter: "drop-shadow(0 4px 10px rgba(0,0,0,.4))" }} />
                </div>
              </div>
              {/* Ohana motto */}
              <p style={{ fontFamily: F.display, fontSize: 15, color: hex(C.teal, .6), margin: "0 0 6px" }}>
                Ohana inseamna familie 🌊
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 10 }}>
                {["🌺", "🌊", "⭐", "🌴", "🌺", "🌊", "⭐", "🌴", "🌺"].map((e, i) => (
                  <span key={i} style={{ fontSize: 13, animation: `ls-twinkle ${1.5 + i * .18}s ${i * .12}s ease-in-out infinite`, display: "inline-block" }}>{e}</span>
                ))}
              </div>
              <p style={{ fontFamily: F.label, fontSize: 10, color: hex(C.sand, .3), margin: 0, letterSpacing: ".15em" }}>
                Lilo & Stitch · Ohana · {displayYear}
              </p>
            </div>
          </Reveal>

        </div>
      </div>
    </>
  );
};

export default LiloAndStitchTemplate;

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT EXPORTS for registry
// ─────────────────────────────────────────────────────────────────────────────
export const CASTLE_DEFAULT_BLOCKS = LILO_DEFAULT_BLOCKS;
export const CASTLE_DEFAULTS = {
  partner1Name:        "Prenume",
  partner2Name:        "",
  eventType:           "baptism",
  welcomeText:         "Ohana! Va invitam la",
  celebrationText:     "botezului",
  showWelcomeText:     true,
  showCelebrationText: true,
  weddingDate:         "",
  rsvpButtonText:      "Confirma Prezenta 🌺",
  colorTheme:          "default",
};
