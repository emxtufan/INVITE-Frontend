import React, { useState, useEffect, useRef, useCallback } from "react";
import { InvitationTemplateProps, TemplateMeta } from "../invitations/types";
import { InvitationBlock, InvitationBlockType } from "../../types";
import { InlineEdit, InlineTime, InlineWaze } from "../invitations/InlineEdit";
import FlipClock from "../invitations/FlipClock";
import { BlockStyleProvider, BlockStyle } from "../BlockStyleContext";
import { WeddingIcon } from "../TimelineIcons";
import { TimelineInsertButton } from "../invitations/TimelineInsertButton";
import {
  ChevronUp, ChevronDown, Eye, EyeOff, Trash2, Upload,
  Play, Pause, SkipForward, SkipBack, Gift, Music, MessageCircle, Sparkles
} from "lucide-react";
import { API_URL } from "../../config/api";
import { getSharedDefaultBlocks } from "./shared-default-blocks";

type MickeyColors = {
  red: string;
  darkRed: string;
  yellow: string;
  darkYellow: string;
  white: string;
  cream: string;
  black: string;
  softBlack: string;
  minniePink: string;
};

const MICKEY_THEME_BY_ID: Record<string, MickeyColors> = {
  default: {
    red: "#cc0000",
    darkRed: "#7f0000",
    yellow: "#ffe000",
    darkYellow: "#f4b400",
    white: "#ffffff",
    cream: "#fff9f0",
    black: "#1a1a1a",
    softBlack: "#2a2a2a",
    minniePink: "#ff7ab8",
  },
  "mickey-classic": {
    red: "#cc0000",
    darkRed: "#7f0000",
    yellow: "#ffe000",
    darkYellow: "#f4b400",
    white: "#ffffff",
    cream: "#fff9f0",
    black: "#1a1a1a",
    softBlack: "#2a2a2a",
    minniePink: "#ff7ab8",
  },
  "mickey-minnie-pink": {
    red: "#e11d48",
    darkRed: "#9f1239",
    yellow: "#ff8cc8",
    darkYellow: "#fb7185",
    white: "#fffafc",
    cream: "#fff1f7",
    black: "#1f1720",
    softBlack: "#2b1f2d",
    minniePink: "#ff6db3",
  },
  "mickey-midnight": {
    red: "#e11d48",
    darkRed: "#9f1239",
    yellow: "#facc15",
    darkYellow: "#eab308",
    white: "#f9fafb",
    cream: "#334155",
    black: "#020617",
    softBlack: "#1e293b",
    minniePink: "#f472b6",
  },
  "mickey-clubhouse-blue": {
    red: "#2563eb",
    darkRed: "#1d4ed8",
    yellow: "#fbbf24",
    darkYellow: "#f59e0b",
    white: "#f8fafc",
    cream: "#eff6ff",
    black: "#0f172a",
    softBlack: "#1e293b",
    minniePink: "#ec4899",
  },
  "mickey-hero-boys": {
    red: "#0ea5e9",
    darkRed: "#0369a1",
    yellow: "#22d3ee",
    darkYellow: "#06b6d4",
    white: "#f0f9ff",
    cream: "#e0f2fe",
    black: "#082f49",
    softBlack: "#0c4a6e",
    minniePink: "#60a5fa",
  },
  "mickey-princess-girl": {
    red: "#db2777",
    darkRed: "#9d174d",
    yellow: "#f9a8d4",
    darkYellow: "#f472b6",
    white: "#fff7fb",
    cream: "#fff1f7",
    black: "#3b0a1e",
    softBlack: "#581c3c",
    minniePink: "#ff5ca8",
  },
  "mickey-lavender-girl": {
    red: "#a855f7",
    darkRed: "#7e22ce",
    yellow: "#f0abfc",
    darkYellow: "#d946ef",
    white: "#fcf8ff",
    cream: "#faf5ff",
    black: "#3b175a",
    softBlack: "#581c87",
    minniePink: "#e879f9",
  },
};

const getMickeyTheme = (themeId?: string): MickeyColors =>
  MICKEY_THEME_BY_ID[themeId || "default"] || MICKEY_THEME_BY_ID.default;

const F = {
  display: "'Baloo 2','Fredoka','Comic Sans MS',cursive",
  body: "'Nunito','Poppins',system-ui,sans-serif",
  label: "'Montserrat',system-ui,sans-serif",
} as const;

const SANS = F.body;

let C: MickeyColors = { ...MICKEY_THEME_BY_ID.default };
let PINK_DARK = C.darkRed;
let PINK_D = C.red;
let PINK_L = C.yellow;
let PINK_XL = C.cream;
let CREAM = C.cream;
let TEXT = C.black;
let MUTED = "rgba(26,26,26,0.55)";
const MUTED_ON_LIGHT = "rgba(26,26,26,0.55)";
let GOLD = C.yellow;

const IMG_HERO_BG = "/mickey-mouse/mickey-hero-bg.png";
const IMG_MICKEY_WAVE = "/mickey-mouse/mickey-waving.png";
const IMG_MICKEY_JUMP = "/mickey-mouse/mickey-jumping.png";
const IMG_MICKEY_LAUGH = "/mickey-mouse/mickey-laughing.png";
const IMG_MICKEY_MAIN = "/mickey-mouse/mickey-main.png";
const IMG_MICKEY_BIRTHDAY = "/mickey-mouse/mickey-birthday.png";
const IMG_MICKEY_LOGO = "/mickey-mouse/mickey-logo.png";
const IMG_MINNIE_WAVE = "/mickey-mouse/minnie-waving.png";
const IMG_MINNIE_MAIN = "/mickey-mouse/minnie-main.png";
const IMG_DONALD = "/mickey-mouse/donald-duck.png";
const IMG_DAISY = "/mickey-mouse/daisy-duck.png";
const IMG_GOOFY = "/mickey-mouse/goofy.png";
const IMG_PLUTO = "/mickey-mouse/pluto.png";
const IMG_STICKER_1 = "/mickey-mouse/mickey-sticker-1.png";
const IMG_STICKER_2 = "/mickey-mouse/mickey-sticker-2.png";
const IMG_STICKER_3 = "/mickey-mouse/mickey-sticker-3.png";
const IMG_STICKER_4 = "/mickey-mouse/mickey-sticker-4.png";

const MM_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700;800&family=Fredoka:wght@400;500;700&family=Montserrat:wght@500;700;800&family=Nunito:wght@400;600;700;800&display=swap');
  @keyframes mm-bgShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
  @keyframes mm-sparkle { 0%,100%{opacity:.2;transform:scale(.8)} 50%{opacity:1;transform:scale(1.18)} }
  @keyframes mm-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  @keyframes mm-floatR { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes mm-heartBeat { 0%,100%{transform:scale(1)} 25%{transform:scale(1.08)} 50%{transform:scale(1)} 75%{transform:scale(1.04)} }
  @keyframes mm-bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
  @keyframes mm-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }
  @keyframes mm-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
  @keyframes mm-shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  @keyframes mm-logoIn { 0%{transform:scale(0) rotate(-15deg);opacity:0} 70%{transform:scale(1.08) rotate(2deg);opacity:1} 100%{transform:scale(1) rotate(0);opacity:1} }
  @keyframes mm-twinkle { 0%,100%{opacity:.2;transform:scale(.8)} 50%{opacity:1;transform:scale(1.25)} }
  @keyframes mm-confetti { 0%{transform:translateY(-24px) rotate(0deg);opacity:1} 100%{transform:translateY(110vh) rotate(720deg);opacity:0} }
  .mm-hover:hover { transform: scale(1.05) rotate(-1deg) !important; transition: transform .18s ease; }
`;

const uploadAsset = async (file: File): Promise<string | null> => {
  try {
    const session = JSON.parse(localStorage.getItem("weddingPro_session") || "{}");
    const form = new FormData();
    form.append("file", file);
    const response = await fetch(`${API_URL}/upload`, {
      method: "POST",
      headers: session?.token ? { Authorization: `Bearer ${session.token}` } : undefined,
      body: form,
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data?.url || data?.path || data?.fileUrl || null;
  } catch {
    return null;
  }
};

function useReveal<T extends HTMLElement>(threshold = 0.1): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        io.disconnect();
      }
    }, { threshold });
    io.observe(node);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, visible];
}

const Reveal: React.FC<{
  children: React.ReactNode;
  delay?: number;
  from?: "bottom" | "left" | "right" | "fade";
  style?: React.CSSProperties;
}> = ({ children, delay = 0, from = "bottom", style }) => {
  const [ref, visible] = useReveal<HTMLDivElement>();
  const hiddenTransform =
    from === "left" ? "translateX(-20px)" :
    from === "right" ? "translateX(20px)" :
    from === "fade" ? "none" : "translateY(20px)";
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translate(0,0)" : hiddenTransform,
        transition: `opacity .65s ${delay}s cubic-bezier(.22,1,.36,1), transform .65s ${delay}s cubic-bezier(.22,1,.36,1)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const Confetto: React.FC<{ x: number; color: string; delay: number; size: number; shape: string }> = ({ x, color, delay, size, shape }) => (
  <span
    style={{
      position: "fixed",
      top: -18,
      left: `${x}%`,
      width: size,
      height: size,
      borderRadius: shape === "circle" ? "50%" : 3,
      background: color,
      animation: `mm-confetti ${2.8 + Math.random() * 1.6}s ${delay}s linear forwards`,
      zIndex: 10001,
      pointerEvents: "none",
      boxShadow: "0 0 6px rgba(0,0,0,.2)",
    }}
  />
);

const MickeyEars: React.FC<{ size?: number; color?: string; style?: React.CSSProperties }> = ({ size = 80, color = "#111", style }) => (
  <div style={{ position: "relative", width: size, height: size * 0.72, ...style }}>
    <span style={{ position: "absolute", width: size * 0.45, height: size * 0.45, borderRadius: "50%", background: color, top: 0, left: size * 0.03 }} />
    <span style={{ position: "absolute", width: size * 0.45, height: size * 0.45, borderRadius: "50%", background: color, top: 0, right: size * 0.03 }} />
    <span style={{ position: "absolute", width: size * 0.62, height: size * 0.62, borderRadius: "50%", background: color, left: "50%", bottom: 0, transform: "translateX(-50%)" }} />
  </div>
);

const PolkaDivider: React.FC<{ thin?: boolean }> = ({ thin = false }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, margin: thin ? "8px 0" : "12px 0" }}>
    {Array.from({ length: thin ? 14 : 18 }).map((_, i) => (
      <span key={i} style={{ width: thin ? 4 : 5, height: thin ? 4 : 5, borderRadius: "50%", background: i % 2 ? C.red : C.yellow, opacity: 0.9 }} />
    ))}
  </div>
);

const Countdown: React.FC<{ targetDate: string | undefined }> = ({ targetDate }) => {
  const calc = () => {
    if (!targetDate) return { d: 0, h: 0, m: 0 };
    const diff = new Date(targetDate).getTime() - Date.now();
    if (diff <= 0) return { d: 0, h: 0, m: 0 };
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    return { d, h, m };
  };
  const [left, setLeft] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setLeft(calc()), 30000);
    return () => clearInterval(t);
  }, [targetDate]);
  const unit = (value: number, label: string) => (
    <div style={{ minWidth: 72, borderRadius: 14, border: `2px solid ${C.yellow}`, background: "white", padding: "10px 8px", boxShadow: `2px 2px 0 ${C.black}` }}>
      <div style={{ fontFamily: F.display, fontSize: 24, color: C.red, lineHeight: 1 }}>{String(value).padStart(2, "0")}</div>
      <div style={{ fontFamily: F.label, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.2em", color: MUTED_ON_LIGHT }}>{label}</div>
    </div>
  );
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 6 }}>
      {unit(left.d, "zile")}
      {unit(left.h, "ore")}
      {unit(left.m, "min")}
    </div>
  );
};

const CalendarMonth: React.FC<{ date: string | undefined }> = ({ date }) => {
  const current = date ? new Date(date) : new Date();
  const year = current.getFullYear();
  const month = current.getMonth();
  const day = current.getDate();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const start = (new Date(year, month, 1).getDay() + 6) % 7;
  const grid = Array.from({ length: start + daysInMonth }, (_, i) => (i < start ? 0 : i - start + 1));
  return (
    <div style={{ borderRadius: 18, border: `3px solid ${C.yellow}`, background: "white", padding: 16, boxShadow: `3px 3px 0 ${C.black}` }}>
      <div style={{ textAlign: "center", fontFamily: F.label, fontSize: 11, fontWeight: 800, letterSpacing: "0.2em", color: C.red, marginBottom: 10 }}>
        {current.toLocaleDateString("ro-RO", { month: "long", year: "numeric" }).toUpperCase()}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: 6, fontFamily: F.body, fontSize: 11 }}>
        {["L", "M", "M", "J", "V", "S", "D"].map((d) => <div key={d} style={{ textAlign: "center", fontWeight: 800, color: MUTED_ON_LIGHT }}>{d}</div>)}
        {grid.map((d, i) => (
          <div key={`${d}-${i}`} style={{
            textAlign: "center",
            height: 26,
            lineHeight: "26px",
            borderRadius: 9,
            background: d === day ? C.red : "transparent",
            color: d === day ? "white" : C.black,
            fontWeight: d === day ? 800 : 600,
            border: d === day ? `2px solid ${C.black}` : "1px solid transparent",
          }}>
            {d || ""}
          </div>
        ))}
      </div>
    </div>
  );
};

type PhotoBlockProps = {
  imageData?: string;
  altText?: string;
  aspectRatio?: string;
  photoClip?: string;
  photoMasks?: string[];
  placeholderInitial1?: string;
};

const PhotoBlock: React.FC<PhotoBlockProps> = ({
  imageData, altText,
  aspectRatio = "1:1", photoClip = "rect", photoMasks = [], placeholderInitial1 = "M",
}) => {
  const ratioMap: Record<string, string> = { "1:1": "1 / 1", "3:4": "3 / 4", "4:3": "4 / 3", "16:9": "16 / 9", free: "auto" };
  const radius =
    photoClip === "circle" ? "50%" :
    photoClip === "rounded" ? "20px" :
    photoClip === "arch" ? "120px 120px 18px 18px" :
    photoClip === "blob" ? "44% 56% 60% 40% / 40% 36% 64% 60%" :
    "12px";
  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "relative", borderRadius: radius, overflow: "hidden", border: `3px solid ${C.yellow}`, boxShadow: `3px 3px 0 ${C.black}`, aspectRatio: ratioMap[aspectRatio] || "1 / 1", background: `${C.cream}` }}>
        {imageData ? (
          <img src={imageData} alt={altText || "photo"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", fontFamily: F.display, fontSize: 42, color: `${C.red}88` }}>
            {placeholderInitial1?.[0] || "M"}
          </div>
        )}
        {photoMasks.includes("fade-b") && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 55%, rgba(0,0,0,.36) 100%)", pointerEvents: "none" }} />}
        {photoMasks.includes("vignette") && <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle, transparent 50%, rgba(0,0,0,.32) 100%)", pointerEvents: "none" }} />}
      </div>
    </div>
  );
};

const LocCard: React.FC<{
  block: InvitationBlock;
  editMode: boolean;
  onUpdate: (patch: Partial<InvitationBlock>) => void;
  stickerSrc?: string;
}> = ({ block, editMode, onUpdate, stickerSrc }) => {
  const mapsHref = (block as any).mapsLink || (block.locationAddress ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(block.locationAddress)}` : "");
  const wazeHref = block.wazeLink || "";
  return (
    <div style={{ borderRadius: 18, border: `3px solid ${C.yellow}`, background: "white", padding: 18, boxShadow: `3px 3px 0 ${C.black}`, position: "relative" }}>
      {stickerSrc && <img src={stickerSrc} alt="" style={{ position: "absolute", top: -16, right: -10, width: 56, height: 56, objectFit: "contain", pointerEvents: "none", filter: "drop-shadow(0 4px 8px rgba(0,0,0,.2))" }} />}
      <InlineEdit tag="p" editMode={editMode} value={block.label || "Locatie"} onChange={(v) => onUpdate({ label: v })} style={{ margin: "0 0 4px", fontFamily: F.label, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: C.red, fontWeight: 800 }} />
      <InlineTime editMode={editMode} value={block.time || ""} onChange={(v) => onUpdate({ time: v })} style={{ margin: "0 0 8px", fontFamily: F.display, fontSize: 22, color: C.black }} />
      <InlineEdit tag="p" editMode={editMode} value={block.locationName || ""} placeholder="Nume locatie" onChange={(v) => onUpdate({ locationName: v })} style={{ margin: "0 0 6px", fontFamily: F.body, fontSize: 16, color: C.black, fontWeight: 700 }} />
      <InlineEdit tag="p" editMode={editMode} value={block.locationAddress || ""} placeholder="Adresa locatiei" onChange={(v) => onUpdate({ locationAddress: v })} multiline style={{ margin: 0, fontFamily: F.body, fontSize: 13, color: MUTED_ON_LIGHT, lineHeight: 1.6 }} />
      {(wazeHref || mapsHref || editMode) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
          {editMode && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <InlineWaze value={block.wazeLink || ""} onChange={(v) => onUpdate({ wazeLink: v })} editMode={editMode} />
            </div>
          )}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {wazeHref && <a href={wazeHref} target="_blank" rel="noreferrer" style={{ padding: "8px 12px", borderRadius: 12, textDecoration: "none", border: `2px solid ${C.black}`, background: C.yellow, color: C.black, fontFamily: F.label, fontSize: 10, letterSpacing: "0.12em", fontWeight: 800 }}>Waze</a>}
            {mapsHref && <a href={mapsHref} target="_blank" rel="noreferrer" style={{ padding: "8px 12px", borderRadius: 12, textDecoration: "none", border: `2px solid ${C.black}`, background: C.red, color: "white", fontFamily: F.label, fontSize: 10, letterSpacing: "0.12em", fontWeight: 800 }}>Maps</a>}
          </div>
        </div>
      )}
    </div>
  );
};

const MusicBlock: React.FC<{
  block: InvitationBlock;
  editMode: boolean;
  onUpdate: (patch: Partial<InvitationBlock>) => void;
  imperativeRef?: React.MutableRefObject<{ unlock: () => void; play: () => void; pause: () => void } | null>;
}> = ({ block, editMode, onUpdate, imperativeRef }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!imperativeRef) return;
    imperativeRef.current = {
      unlock: () => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.muted = true;
        audio.play().then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.muted = false;
        }).catch(() => {});
      },
      play: () => audioRef.current?.play().catch(() => {}),
      pause: () => audioRef.current?.pause(),
    };
    return () => { imperativeRef.current = null; };
  }, [imperativeRef]);

  return (
    <div style={{ borderRadius: 18, border: `3px solid ${C.yellow}`, background: "white", padding: 16, boxShadow: `3px 3px 0 ${C.black}` }}>
      <InlineEdit tag="p" editMode={editMode} value={block.musicTitle || "Melodia zilei"} onChange={(v) => onUpdate({ musicTitle: v })} style={{ margin: "0 0 2px", fontFamily: F.display, fontSize: 18, color: C.red }} />
      <InlineEdit tag="p" editMode={editMode} value={block.musicArtist || "Artist"} onChange={(v) => onUpdate({ musicArtist: v })} style={{ margin: "0 0 10px", fontFamily: F.body, fontSize: 12, color: MUTED_ON_LIGHT }} />
      <audio
        ref={audioRef}
        src={block.musicUrl || undefined}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onTimeUpdate={() => setCurrent(audioRef.current?.currentTime || 0)}
      />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <button type="button" onClick={() => { const a = audioRef.current; if (!a) return; a.currentTime = Math.max(0, a.currentTime - 10); }} style={{ width: 34, height: 34, borderRadius: "50%", border: `2px solid ${C.black}`, background: "white", display: "grid", placeItems: "center" }}><SkipBack className="w-4 h-4" /></button>
        <button type="button" onClick={() => { const a = audioRef.current; if (!a) return; if (playing) a.pause(); else a.play().catch(() => {}); }} style={{ width: 46, height: 46, borderRadius: "50%", border: `3px solid ${C.black}`, background: C.red, color: "white", display: "grid", placeItems: "center", boxShadow: `2px 2px 0 ${C.black}` }}>{playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}</button>
        <button type="button" onClick={() => { const a = audioRef.current; if (!a) return; a.currentTime = Math.min(a.duration || 0, a.currentTime + 10); }} style={{ width: 34, height: 34, borderRadius: "50%", border: `2px solid ${C.black}`, background: "white", display: "grid", placeItems: "center" }}><SkipForward className="w-4 h-4" /></button>
      </div>
      <div style={{ marginTop: 10, height: 6, borderRadius: 999, background: "#eee", overflow: "hidden" }}>
        <div style={{ width: `${duration ? (current / duration) * 100 : 0}%`, height: "100%", background: C.yellow, transition: "width .2s linear" }} />
      </div>
      {editMode && (
        <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 6, border: `2px solid ${C.yellow}`, borderRadius: 10, padding: "7px 10px", cursor: "pointer", fontSize: 12, fontFamily: F.body }}>
            <Upload className="w-3.5 h-3.5" />
            Upload audio
            <input
              type="file"
              accept="audio/*"
              style={{ display: "none" }}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const url = await uploadAsset(file);
                if (url) onUpdate({ musicUrl: url, musicType: "mp3" as any });
                e.currentTarget.value = "";
              }}
            />
          </label>
          {block.musicUrl && (
            <button type="button" onClick={() => { deleteUploadedFile(block.musicUrl); onUpdate({ musicUrl: "", musicType: "none" as any }); }} style={{ border: "1px solid #ef4444", color: "#b91c1c", borderRadius: 10, padding: "7px 10px", fontSize: 12, background: "#fff" }}>
              Sterge audio
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export const meta: TemplateMeta = {
  id: 'mickey-mouse-invitation',
  name: "Mickey Mouse",
  category: 'kids',
  description: 'Oh boy! O invitatie magica in lumea lui Mickey Mouse — urechi rotunde, manusi albe si voie buna fara sfarsit!',
  colors: ['#FFE000', '#CC0000', '#1a1a1a', '#FFFFFF'],
  previewClass: "bg-red-600 border-yellow-400",
  elementsClass: "bg-red-700",
};

function hexToRgba(hex: string, alpha: number): string {
  const h = String(hex || "").replace("#", "");
  const n = h.length === 3
    ? h.split("").map((c) => c + c).join("")
    : h;
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${Number.isFinite(r) ? r : 0},${Number.isFinite(g) ? g : 0},${Number.isFinite(b) ? b : 0},${alpha})`;
}

function deleteUploadedFile(url: string | undefined) {
  if (!url || !url.startsWith('/uploads/')) return;
  const _session = JSON.parse(localStorage.getItem('weddingPro_session') || '{}');
  fetch(`${API_URL}/upload`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${_session?.token || ''}` },
    body: JSON.stringify({ url }),
  }).catch(() => {});
}

// ─── DEFAULT BLOCKS ────────────────────────────────────────────────────────────
export const CASTLE_DEFAULT_BLOCKS: InvitationBlock[] =
  getSharedDefaultBlocks("mickey-mouse-simple");

// ─── INTRO ────────────────────────────────────────────────────────────────────
const MickeyIntro: React.FC<{ l1: string; l2: string; onDone: () => void }> = ({ l1, l2, onDone }) => {
  const showSecond = Boolean(l2 && l2 !== l1);
  const [phase, setPhase] = useState(0);
  const [fade,  setFade]  = useState(false);
  const [btnClicked, setBtnClicked] = useState(false);
  const [confetti, setConfetti] = useState<any[]>([]);

  const handleOpen = useCallback(() => {
    if (btnClicked) return;
    setBtnClicked(true);
    const cols = [C.red, C.yellow, C.black, C.darkYellow, C.minniePink, C.white];
    setConfetti(Array.from({ length: 55 }, (_, i) => ({ id: i, x: 10 + Math.random() * 80, color: cols[i % cols.length], shape: i % 3 === 0 ? 'circle' : 'rect', delay: Math.random() * .9, size: 5 + Math.random() * 9 })));
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
      background: `linear-gradient(135deg, ${C.black} 0%, ${C.softBlack} 38%, ${C.cream} 72%, ${C.darkRed} 100%)`,
      backgroundSize: '400% 400%', animation: 'mm-bgShift 6s ease infinite',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: fade ? 0 : 1, transition: fade ? 'opacity .75s ease' : 'none',
      pointerEvents: fade ? 'none' : 'auto',
    }}>
      <style>{MM_CSS}</style>
      {confetti.map(c => <Confetto key={c.id} {...c} />)}

      {/* Polka dots background */}
      {[...Array(20)].map((_, i) => (
        <div key={i} style={{
          position: 'fixed',
          width: 16 + (i % 4) * 8, height: 16 + (i % 4) * 8,
          borderRadius: '50%', background: `${C.white}18`,
          left: `${(i * 13 + 3) % 94}%`, top: `${(i * 17 + 5) % 90}%`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Stars */}
      {[{ x: 5, y: 8, d: 0 }, { x: 91, y: 6, d: .5 }, { x: 8, y: 32, d: .9 }, { x: 90, y: 30, d: .3 }, { x: 4, y: 62, d: 1.2 }, { x: 93, y: 58, d: .7 }, { x: 48, y: 3, d: .2 }].map((s, i) => (
        <div key={i} style={{ position: 'fixed', left: `${s.x}%`, top: `${s.y}%`, fontSize: 16, color: C.yellow, animation: `mm-sparkle ${2 + Math.random()}s ${s.d}s ease-in-out infinite`, pointerEvents: 'none', filter: `drop-shadow(0 0 4px ${C.yellow})` }}>✦</div>
      ))}

      {/* ── SEALED STATE ── */}
      {phase === 0 && (
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          {/* Mickey Ears big */}
          <div style={{ animation: 'mm-float 3.5s ease-in-out infinite', filter: `drop-shadow(0 8px 24px rgba(0,0,0,.4))` }}>
            <MickeyEars size={140} color={C.black} />
          </div>

          {/* Mickey image */}
          <div style={{ animation: 'mm-heartBeat 2.5s ease-in-out infinite', marginTop: -30 }}>
            <img src={IMG_MICKEY_WAVE} alt="Mickey Mouse"
              style={{ width: 'min(200px,55vw)', objectFit: 'contain', filter: `drop-shadow(0 6px 20px rgba(0,0,0,.5))` }}
            />
          </div>

          {/* Name */}
          <div>
            <h1 style={{ fontFamily: F.display, fontSize: 'clamp(32px,8vw,50px)', color: C.yellow, margin: '0 0 4px', lineHeight: 1.1, letterSpacing: 1, textShadow: `3px 3px 0 ${C.black}` }}>
              {showSecond ? `${l1} & ${l2}` : l1}
            </h1>
            <p style={{ fontFamily: F.label, fontSize: 13, color: 'rgba(255,255,255,.85)', margin: 0, letterSpacing: '0.1em' }}>
              te invita la petrecere! 🎈
            </p>
          </div>

          {/* Friends row */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
            {[{ src: IMG_MINNIE_WAVE, d: 0 }, { src: IMG_DONALD, d: .3 }, { src: IMG_PLUTO, d: .6 }].map((ch, i) => (
              <div key={i} className="mm-hover" style={{ animation: `mm-bob ${3 + i * .4}s ${ch.d}s ease-in-out infinite` }}>
                <img src={ch.src} alt="" style={{ height: 72, objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,.4))' }} />
              </div>
            ))}
          </div>

          {/* Open button */}
          <button onClick={handleOpen} style={{
            fontFamily: F.label, fontSize: 13, letterSpacing: '.3em', textTransform: 'uppercase',
            color: C.red, background: C.yellow,
            border: `4px solid ${C.black}`, borderRadius: 50, padding: '16px 36px', cursor: 'pointer',
            boxShadow: `4px 4px 0 ${C.black}, 0 8px 24px rgba(0,0,0,.4)`,
            animation: 'mm-pulse 2.2s ease-in-out infinite',
            transition: 'all .2s', position: 'relative', overflow: 'hidden',
            fontWeight: 900,
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.3),transparent)', backgroundSize: '200% 100%', animation: 'mm-shimmer 2s linear infinite', borderRadius: 50 }} />
            <span style={{ position: 'relative' }}>Deschide Invitatia</span>
          </button>
        </div>
      )}

      {/* ── OPENING SEQUENCE ── */}
      {phase >= 1 && (
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ opacity: phase >= 2 ? 1 : 0, transform: phase >= 2 ? 'translateY(0) scale(1)' : 'translateY(30px) scale(.9)', transition: 'opacity .55s,transform .6s cubic-bezier(.22,1,.36,1)' }}>
            <img src={IMG_MICKEY_JUMP} alt="Mickey"
              style={{ width: 'min(320px,82vw)', objectFit: 'contain', filter: `drop-shadow(0 8px 28px rgba(0,0,0,.5))` }}
            />
          </div>
          <div style={{ opacity: phase >= 2 ? 1 : 0, animation: phase >= 2 ? 'mm-logoIn .65s cubic-bezier(.34,1.4,.64,1) both' : 'none' }}>
            <MickeyEars size={80} color={C.yellow} />
          </div>
          <div style={{ opacity: phase >= 3 ? 1 : 0, transform: phase >= 3 ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity .5s,transform .5s' }}>
            <p style={{ fontFamily: F.label, fontSize: 9, letterSpacing: '.5em', textTransform: 'uppercase', color: C.yellow, margin: '0 0 4px' }}>✦ MICKEY MOUSE CLUBHOUSE ✦</p>
            <h1 style={{ fontFamily: F.display, fontSize: 'clamp(32px,8vw,50px)', color: C.yellow, margin: '0 0 4px', lineHeight: 1.05, textShadow: `3px 3px 0 ${C.black}` }}>
              {showSecond ? `${l1} & ${l2}` : l1}
            </h1>
            <p style={{ fontFamily: F.label, fontSize: 14, color: 'rgba(255,255,255,.9)', margin: 0 }}>te invita la petrecere! 🎈</p>
          </div>
          <p style={{ fontFamily: F.label, fontSize: 8, letterSpacing: '.4em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)', margin: '6px 0 0', opacity: phase >= 5 ? 1 : 0, transition: 'opacity .5s' }}>
            🎉 Oh boy! 🎉
          </p>
        </div>
      )}
    </div>
  );
};

// ─── AUDIO MODAL ──────────────────────────────────────────────────────────────
const AudioPermissionModal: React.FC<{ childName: string; onAllow: () => void; onDeny: () => void }> = ({ childName, onAllow, onDeny }) => (
  <div style={{ position: "fixed", inset: 0, zIndex: 10020, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ position: "absolute", inset: 0, background: hexToRgba(C.red, 0.65), backdropFilter: "blur(8px)" }} />
    <div style={{ position: "relative", background: C.white, borderRadius: 24, padding: "36px 32px 28px", maxWidth: 340, width: "90%", textAlign: "center", boxShadow: `0 24px 80px ${hexToRgba(C.red, 0.35)}`, border: `4px solid ${C.yellow}` }}>
      {/* Stripe top */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8, borderRadius: '20px 20px 0 0', background: `repeating-linear-gradient(90deg,${C.red} 0,${C.red} 14px,${C.yellow} 14px,${C.yellow} 28px,${C.black} 28px,${C.black} 42px)` }} />
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: C.red, display: "flex", alignItems: "center", justifyContent: "center", margin: "10px auto 16px", animation: "mm-pulse 2s ease-in-out infinite", boxShadow: `0 8px 24px ${hexToRgba(C.red, 0.4)}` }}>
        <Music className="w-8 h-8" style={{ color: "white" }} />
      </div>
      <MickeyEars size={50} color={C.black} style={{ display: 'block', margin: '0 auto 8px' }} />
      <p style={{ fontFamily: F.display, fontSize: 28, color: C.red, margin: "0 0 6px", lineHeight: 1.1 }}>{childName}</p>
      <p style={{ fontFamily: F.body, fontSize: 13, fontWeight: 700, color: C.black, margin: "0 0 8px" }}>te invita la petrecerea magica</p>
      <p style={{ fontFamily: F.body, fontSize: 11, color: MUTED_ON_LIGHT, margin: "0 0 28px", lineHeight: 1.6 }}>Invitatia are o melodie speciala.<br />Vrei sa activezi muzica?</p>
      <button type="button" onClick={onAllow} style={{ width: "100%", padding: "14px 0", background: C.red, border: `3px solid ${C.black}`, borderRadius: 50, cursor: "pointer", fontFamily: F.label, fontSize: 11, fontWeight: 700, color: "white", letterSpacing: "0.1em", marginBottom: 10, boxShadow: `3px 3px 0 ${C.black}` }}>
        Da, activeaza muzica
      </button>
      <button type="button" onClick={onDeny} style={{ width: "100%", padding: "10px 0", background: "transparent", border: "none", cursor: "pointer", fontFamily: F.body, fontSize: 11, color: MUTED_ON_LIGHT }}>
        Nu, continua fara muzica
      </button>
    </div>
  </div>
);

// ─── BLOCK TOOLBAR & INSERT ────────────────────────────────────────────────────
const BLOCK_TYPE_ICONS: Record<string, string> = {
  photo: '🖼', text: '✏️', location: '📍', calendar: '📅', countdown: '⏱', music: '🎵', gift: '🎁', whatsapp: '💬', rsvp: '✉️', divider: '—', family: '👨‍👩‍👧', date: '📆', description: '📝', timeline: '🗓',
};

const BlockToolbar = ({ onUp, onDown, onToggle, onDelete, visible, isFirst, isLast }: any) => (
  <div className="absolute -top-4 right-2 flex items-center gap-1 rounded-full border bg-white shadow-lg px-2 py-1 opacity-100 transition-all z-[9999999999999999999999] pointer-events-auto">
    <button onClick={onUp} disabled={isFirst} className="p-1 rounded-full hover:bg-red-50 disabled:opacity-20"><ChevronUp className="w-3 h-3 text-red-700" /></button>
    <button onClick={onDown} disabled={isLast} className="p-1 rounded-full hover:bg-red-50 disabled:opacity-20"><ChevronDown className="w-3 h-3 text-red-700" /></button>
    <div className="w-px h-3 bg-yellow-200 mx-1" />
    <button onClick={onToggle} className="p-1 rounded-full hover:bg-red-50">{visible ? <Eye className="w-3 h-3 text-red-700" /> : <EyeOff className="w-3 h-3 text-gray-400" />}</button>
    <button onClick={onDelete} className="p-1 rounded-full hover:bg-red-50"><Trash2 className="w-3 h-3 text-red-600" /></button>
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
      <div style={{ position: 'absolute', left: 0, right: 0, height: 2, background: `repeating-linear-gradient(to right, ${C.red} 0, ${C.red} 8px, ${C.yellow} 8px, ${C.yellow} 16px, ${C.black} 16px, ${C.black} 24px)`, opacity: .5, zIndex: 1 }} />
      <button type="button" onClick={() => setOpenInsertAt(isOpen ? null : insertIdx)} style={{ width: 26, height: 26, borderRadius: '50%', background: isOpen ? C.red : 'white', border: `2px solid ${C.yellow}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: isOpen ? 'white' : C.red, boxShadow: `2px 2px 0 ${C.black}`, opacity: 1, transition: 'opacity .15s,transform .15s,background .15s', transform: visible ? 'scale(1)' : 'scale(0.7)', zIndex: 2, position: 'relative', lineHeight: 1, fontWeight: 700 }}>
        {isOpen ? '×' : '+'}
      </button>
      {isOpen && (
        <div style={{ position: 'absolute', bottom: 34, left: '50%', transform: 'translateX(-50%)', background: 'white', borderRadius: 16, border: `3px solid ${C.yellow}`, boxShadow: `4px 4px 0 ${C.black}`, padding: '16px', zIndex: 100, width: 260 }}
          onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
          <p style={{ fontFamily: SANS, fontSize: '.5rem', fontWeight: 700, letterSpacing: '.3em', textTransform: 'uppercase', color: MUTED_ON_LIGHT, margin: '0 0 10px', textAlign: 'center' }}>Adauga bloc</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {BLOCK_TYPES.map(bt => (
              <button key={bt.type} type="button" onClick={() => onInsert(bt.type, bt.def)} style={{ background: '#FFF9F0', border: `2px solid ${C.yellow}`, borderRadius: 10, padding: '8px 4px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = C.yellow; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FFF9F0'; }}>
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

// ─── MAIN TEMPLATE ────────────────────────────────────────────────────────────
const MickeyMouseTemplate: React.FC<InvitationTemplateProps & {
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
  const resolvedThemeId = String(profile.colorTheme || "default").trim() || "default";
  const activeTheme = getMickeyTheme(resolvedThemeId);
  C = { ...activeTheme };
  PINK_DARK = C.red;
  PINK_D = C.darkRed;
  PINK_L = C.yellow;
  PINK_XL = C.cream;
  CREAM = C.cream;
  GOLD = C.yellow;
  const darkThemes = new Set(["mickey-midnight"]);
  const isDarkTheme = darkThemes.has(resolvedThemeId);
  TEXT = isDarkTheme ? C.white : C.black;
  MUTED = isDarkTheme ? "rgba(248,250,252,0.7)" : "rgba(26,26,26,0.55)";
  const isWedding = String(profile.eventType || "").toLowerCase() === "wedding";
  const safeJSON = (s: string | undefined, fb: any) => { try { return s ? JSON.parse(s) : fb; } catch { return fb; } };

  const blocksFromDB: InvitationBlock[] | null = safeJSON(profile.customSections, null);
  const hasDBBlocks = Array.isArray(blocksFromDB) && blocksFromDB.length > 0;
  const [blocks, setBlocks] = useState<InvitationBlock[]>(() => hasDBBlocks ? blocksFromDB! : CASTLE_DEFAULT_BLOCKS as unknown as InvitationBlock[]);

  useEffect(() => {
    const fresh: InvitationBlock[] | null = safeJSON(profile.customSections, null);
    if (Array.isArray(fresh) && fresh.length > 0) setBlocks(fresh);
    else if (fresh !== null && Array.isArray(fresh) && fresh.length === 0) setBlocks(CASTLE_DEFAULT_BLOCKS as unknown as InvitationBlock[]);
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
      kids:        { welcome: 'Oh boy! Te invitam la', celebration: 'ziua de nastere' },
    };
    const d = map[profile.eventType || 'kids'] || map.kids;
    return { welcome: profile.welcomeText?.trim() || d.welcome, celebration: profile.celebrationText?.trim() || d.celebration };
  };
  const texts = getEventText();

  const card: React.CSSProperties = {
    background: `linear-gradient(160deg, ${isDarkTheme ? `${C.softBlack}EE` : `${C.white}F0`} 0%, ${C.cream}F0 100%)`, borderRadius: 24,
    border: `3px solid ${C.yellow}`,
    boxShadow: `4px 4px 0 ${C.black}, 0 8px 32px ${hexToRgba(C.red, 0.2)}`,
    padding: '22px 20px', marginTop: 8, position: 'relative', overflow: 'hidden',
  };

  const BLOCK_TYPES = [
    { type: 'photo',     label: '📷 Foto',      def: { imageData: undefined, aspectRatio: '1:1', photoClip: 'rect', photoMasks: [] } },
    { type: 'text',      label: 'Text',         def: { content: 'Te asteptam cu drag...' } },
    { type: 'location',  label: 'Locatie',      def: { label: 'Locatie', time: '11:00', locationName: 'Locatie eveniment', locationAddress: 'Strada Exemplu, Nr. 1' } },
    { type: 'calendar',  label: '📅 Calendar',  def: {} },
    { type: 'countdown', label: '⏱ Countdown',  def: {} },
    { type: 'timeline',  label: '🗓 Cronologie', def: {} },
    { type: 'music',     label: '🎵 Muzica',    def: { musicTitle: '', musicArtist: '', musicType: 'none' } },
    { type: 'gift',      label: '🎁 Cadouri',   def: { sectionTitle: 'Sugestie cadou', content: '', iban: '', ibanName: '' } },
    { type: 'whatsapp',  label: 'WhatsApp',     def: { label: 'Contact WhatsApp', content: '0700000000' } },
    { type: 'rsvp',      label: 'RSVP',         def: { label: 'Confirma Prezenta' } },
    { type: 'divider',   label: 'Linie',        def: {} },
    { type: 'family',    label: '👨‍👩‍👧 Familie', def: { label: 'Parintii copilului', content: 'Cu drag si recunostinta', members: JSON.stringify([{ name1: 'Mama', name2: 'Tata' }]) } },
    { type: 'date',      label: '📆 Data',      def: {} },
    { type: 'description', label: 'Descriere', def: { content: 'O scurta descriere...' } },
  ];

  const locationStickers = [IMG_STICKER_1, IMG_STICKER_2, IMG_STICKER_3, IMG_STICKER_4];

  return (
    <>
      <style>{MM_CSS}</style>
      {showAudioModal && (
        <AudioPermissionModal childName={profile.partner1Name || "Invitatia"}
          onAllow={() => { audioAllowedRef.current = true; musicPlayRef.current?.unlock(); setShowAudioModal(false); }}
          onDeny={() => { audioAllowedRef.current = false; setShowAudioModal(false); }}
        />
      )}
      {showIntro && <MickeyIntro l1={l1} l2={l2} onDone={handleIntroDone} />}

      <div style={{ minHeight: '100vh', position: 'relative', fontFamily: F.body, opacity: contentVisible ? 1 : 0, transform: contentVisible ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity .7s cubic-bezier(.4,0,.2,1),transform .7s cubic-bezier(.4,0,.2,1)', paddingBottom: 60 }}>

        {/* ── BACKGROUND ── */}
        <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: [
              `radial-gradient(circle at 10% 10%, ${C.yellow}40 0%, transparent 40%)`,
              `radial-gradient(circle at 90% 15%, ${C.red}33 0%, transparent 40%)`,
              `radial-gradient(circle at 10% 90%, ${C.red}22 0%, transparent 40%)`,
              `radial-gradient(circle at 90% 85%, ${C.darkYellow}33 0%, transparent 40%)`,
              isDarkTheme
                ? `linear-gradient(135deg, ${C.black} 0%, ${C.softBlack} 42%, ${C.cream} 72%, ${C.black} 100%)`
                : `linear-gradient(135deg, ${C.cream} 0%, ${C.white} 35%, ${C.cream} 65%, ${C.white} 100%)`,
            ].join(', '),
          }} />
          {/* Polka dots */}
          {[...Array(16)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: 12 + (i % 3) * 6, height: 12 + (i % 3) * 6, borderRadius: '50%',
              background: i % 3 === 0 ? `${C.red}12` : i % 3 === 1 ? `${C.yellow}22` : `${C.black}08`,
              left: `${(i * 11 + 4) % 93}%`, top: `${(i * 19 + 6) % 88}%`,
              pointerEvents: 'none',
            }} />
          ))}
        </div>

        {/* Fixed floating Mickey ears */}
        <div style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
          {[{ x: 2, y: 6 }, { x: 88, y: 4 }, { x: 1, y: 82 }, { x: 90, y: 80 }].map((pos, i) => (
            <div key={i} style={{ position: 'absolute', left: `${pos.x}%`, top: `${pos.y}%`, opacity: .08, animation: `mm-float ${4 + i}s ${i * .6}s ease-in-out infinite` }}>
              <MickeyEars size={60 + i * 10} color={C.black} />
            </div>
          ))}
        </div>

        {/* Stars */}
        {[{ x: 3, y: 12, d: 0 }, { x: 93, y: 8, d: .5 }, { x: 4, y: 45, d: .9 }, { x: 95, y: 40, d: .3 }, { x: 3, y: 75, d: 1.2 }, { x: 94, y: 70, d: .7 }].map((s, i) => (
          <div key={i} style={{ position: 'fixed', left: `${s.x}%`, top: `${s.y}%`, fontSize: 14, color: C.yellow, animation: `mm-twinkle ${1.5 + i * .2}s ${s.d}s ease-in-out infinite`, pointerEvents: 'none', zIndex: 1 }}>✦</div>
        ))}

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 440, margin: '0 auto', padding: '28px 16px 0' }}>

          {/* ── HERO CARD ── */}
          <Reveal from="fade">
            <BlockStyleProvider value={{ blockId: "__hero__", textStyles: undefined, onTextSelect: () => {} }}>
              <div style={{ ...card, textAlign: 'center', padding: '0 0 28px', border: `4px solid ${C.black}`, boxShadow: `5px 5px 0 ${C.black}` }}>
                {/* Stripe top */}
                <div style={{ height: 10, background: `repeating-linear-gradient(90deg,${C.red} 0,${C.red} 20px,${C.yellow} 20px,${C.yellow} 40px,${C.black} 40px,${C.black} 60px)`, borderRadius: '20px 20px 0 0' }} />

                {/* Hero image */}
                <div style={{ position: 'relative', height: 220, overflow: 'hidden' }}>
                  <img src={IMG_HERO_BG} alt="Mickey" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }} />
                  <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, transparent 40%, ${isDarkTheme ? `${C.black}E8` : `${C.cream}F2`} 100%)` }} />
                  {/* Mickey ears silhouette centered */}
                  <div style={{ position: 'absolute', bottom: -2, left: '50%', transform: 'translateX(-50%)' }}>
                    <MickeyEars size={100} color={C.black} />
                  </div>
                </div>

                <div style={{ padding: '16px 24px 0' }}>
                  {/* Badge */}
                  <Reveal from="fade" delay={0.15}>
                    <div style={{ display: 'inline-block', background: C.red, color: C.white, fontFamily: F.label, fontSize: 9, padding: '4px 20px', borderRadius: 20, letterSpacing: 2, marginBottom: 14, border: `2px solid ${C.black}`, boxShadow: `2px 2px 0 ${C.black}` }}>
                      ✦ ESTI INVITAT ✦
                    </div>
                  </Reveal>

                  {/* Welcome */}
                  <Reveal from="bottom" delay={0.2}>
                    <InlineEdit tag="p" editMode={editMode} value={texts.welcome} onChange={v => upProfile("welcomeText", v)} textLabel="Hero · welcome"
                      style={{ fontFamily: F.body, fontSize: 13, fontWeight: 700, fontStyle: 'italic', color: MUTED, margin: '0 0 12px', lineHeight: 1.7 }}
                    />
                  </Reveal>

                  {/* NAME */}
                  <Reveal from="bottom" delay={0.25}>
                    {!isWedding ? (
                      <InlineEdit tag="h1" editMode={editMode} value={profile.partner1Name || 'Prenume'} onChange={v => upProfile('partner1Name', v)} textLabel="Hero · nume"
                        style={{ fontFamily: F.display, fontSize: 'clamp(34px,9vw,54px)', color: C.red, margin: '0 0 4px', lineHeight: 1.1, textShadow: `3px 3px 0 ${C.yellow}` }}
                      />
                    ) : (
                      <div style={{ margin: '0 0 4px' }}>
                        <InlineEdit tag="h1" editMode={editMode} value={profile.partner1Name || 'Prenume'} onChange={v => upProfile('partner1Name', v)} textLabel="Hero · nume 1"
                          style={{ fontFamily: F.display, fontSize: 'clamp(28px,7vw,42px)', color: C.red, margin: 0, lineHeight: 1.1, textShadow: `2px 2px 0 ${C.yellow}` }}
                        />
                        <div style={{ margin: '8px 0', display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
                          <div style={{ flex: 1, height: 3, background: `repeating-linear-gradient(90deg,${C.red} 0,${C.red} 8px,${C.yellow} 8px,${C.yellow} 16px)`, borderRadius: 2 }} />
                          <span style={{ fontFamily: F.display, fontSize: 22, color: C.red }}>❤️</span>
                          <div style={{ flex: 1, height: 3, background: `repeating-linear-gradient(90deg,${C.yellow} 0,${C.yellow} 8px,${C.red} 8px,${C.red} 16px)`, borderRadius: 2 }} />
                        </div>
                        <InlineEdit tag="h1" editMode={editMode} value={profile.partner2Name || 'Prenume'} onChange={v => upProfile('partner2Name', v)} textLabel="Hero · nume 2"
                          style={{ fontFamily: F.display, fontSize: 'clamp(28px,7vw,42px)', color: C.darkRed, margin: 0, lineHeight: 1.1, textShadow: `2px 2px 0 ${C.yellow}` }}
                        />
                      </div>
                    )}
                  </Reveal>

                  {/* Celebration */}
                  <Reveal from="bottom" delay={0.3}>
                    <InlineEdit tag="p" editMode={editMode} value={texts.celebration} onChange={v => upProfile("celebrationText", v)} textLabel="Hero · celebrare"
                      style={{ fontFamily: F.display, fontSize: 16, color: TEXT, margin: '8px 0 0', letterSpacing: .5 }}
                    />
                  </Reveal>

                  {/* DATE */}
                  <Reveal from="bottom" delay={0.35}>
                    <div style={{ margin: '18px 0' }}>
                      <PolkaDivider thin />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', margin: '16px 0' }}>
                        <div style={{ flex: 1, height: 3, background: `repeating-linear-gradient(90deg,${C.red} 0,${C.red} 10px,${C.yellow} 10px,${C.yellow} 20px)`, borderRadius: 2 }} />
                        <div style={{ width: 68, height: 68, borderRadius: '50%', background: C.red, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `4px solid ${C.black}`, boxShadow: `3px 3px 0 ${C.black}`, animation: 'mm-pulse 3s ease-in-out infinite' }}>
                          <span style={{ fontFamily: F.display, fontSize: 26, color: C.yellow, lineHeight: 1 }}>{displayDay}</span>
                          <span style={{ fontFamily: F.label, fontSize: 8, color: 'rgba(255,255,255,.9)', letterSpacing: 1 }}>{displayMonth?.slice(0, 3)}</span>
                        </div>
                        <div style={{ flex: 1, height: 3, background: `repeating-linear-gradient(90deg,${C.yellow} 0,${C.yellow} 10px,${C.red} 10px,${C.red} 20px)`, borderRadius: 2 }} />
                      </div>
                      <div style={{ fontFamily: F.body, fontWeight: 800, fontSize: 12, color: TEXT, opacity: .75, textTransform: 'capitalize', marginBottom: 4 }}>
                        {displayWeekday} · {displayMonth} · {displayYear}
                      </div>
                      <PolkaDivider thin />
                    </div>
                  </Reveal>

                  {/* COUNTDOWN */}
                  <Reveal from="bottom" delay={0.4}>
                    <Countdown targetDate={profile.weddingDate} />
                  </Reveal>

                  {/* Characters row */}
                  <Reveal from="bottom" delay={0.44}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 16, marginTop: 8 }}>
                      {[{ src: IMG_MICKEY_LAUGH, d: 0 }, { src: IMG_MINNIE_WAVE, d: .2 }, { src: IMG_GOOFY, d: .4 }].map((ch, i) => (
                        <div key={i} className="mm-hover" style={{ animation: `mm-bounce ${1.4 + i * .3}s ${ch.d}s ease-in-out infinite` }}>
                          <img src={ch.src} alt="" style={{ height: 66, objectFit: 'contain', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,.25))' }} />
                        </div>
                      ))}
                    </div>
                  </Reveal>

                  {/* GUEST */}
                  <Reveal from="bottom" delay={0.45}>
                    <div style={{ padding: '14px 20px', background: `${C.yellow}22`, border: `3px solid ${C.yellow}`, borderRadius: 18, position: 'relative', boxShadow: `3px 3px 0 ${C.black}` }}>
                      <img src={IMG_PLUTO} alt="" style={{ position: "absolute", bottom: -14, right: -6, width: 68, height: 68, objectFit: "contain", filter: "drop-shadow(0 4px 10px rgba(0,0,0,.2))", pointerEvents: "none" }} />
                      <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)' }}>
                        <MickeyEars size={28} color={C.black} />
                      </div>
                      <p style={{ fontFamily: F.label, fontSize: 8, letterSpacing: '.5em', textTransform: 'uppercase', color: C.red, margin: '8px 0 6px', opacity: .8 }}>invitatie pentru</p>
                      <p style={{ fontFamily: F.display, fontSize: 20, color: TEXT, margin: 0, letterSpacing: 1 }}>
                        {guest?.name || 'Invitatul Special'}
                      </p>
                    </div>
                  </Reveal>
                </div>

                <div style={{ margin: '18px 20px 0' }}><PolkaDivider /></div>
              </div>
            </BlockStyleProvider>
          </Reveal>

          {/* ── BLOCKS ── */}
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
                        <div className="absolute inset-0 rounded-lg" style={{ background: "rgba(0,0,0,0.08)", backdropFilter: "blur(3px)" }} />
                        <div className="relative z-10"><EyeOff size={22} color={C.red} /></div>
                      </div>
                    )}

                    {block.type === "photo" && (
                      <Reveal>
                        <div onClick={editMode ? () => onBlockSelect?.(block, idx) : undefined} style={editMode ? { cursor: "pointer", outline: selectedBlockId === block.id ? `3px solid ${C.red}` : "none", outlineOffset: 4, borderRadius: 16 } : undefined}>
                          <PhotoBlock imageData={block.imageData} altText={block.altText} aspectRatio={block.aspectRatio as any} photoClip={block.photoClip as any} photoMasks={block.photoMasks as any} placeholderInitial1={l1} />
                        </div>
                      </Reveal>
                    )}

                    {block.type === "text" && (
                      <Reveal>
                        <div style={{ textAlign: "center", padding: "0 12px" }}>
                          <InlineEdit tag="p" editMode={editMode} value={block.content || ""} onChange={v => updBlock(idx, { content: v })} textLabel="Text"
                            style={{ fontFamily: F.body, fontSize: 14, color: TEXT, lineHeight: 1.7 }} />
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
                          <img src={IMG_MINNIE_MAIN} alt="" style={{ position: "absolute", top: -18, left: -8, width: 72, height: 72, objectFit: "contain", filter: "drop-shadow(0 6px 12px rgba(0,0,0,.2))", pointerEvents: "none", zIndex: 2 }} />
                          <CalendarMonth date={profile.weddingDate} />
                        </div>
                      </Reveal>
                    )}

                    {block.type === "countdown" && (
                      <div style={{ position: "relative" }}>
                        <img src={IMG_DONALD} alt="" style={{ position: "absolute", top: -18, right: -8, width: 70, height: 70, objectFit: "contain", filter: "drop-shadow(0 6px 12px rgba(0,0,0,.2))", pointerEvents: "none", zIndex: 2 }} />
                        <FlipClock targetDate={profile.weddingDate} bgColor={C.red} textColor="white" accentColor={C.yellow} labelColor="rgba(255,255,255,0.8)" editMode={editMode}
                          titleText={block.countdownTitle || "Timp ramas pana la Marele Eveniment"} onTitleChange={text => updBlock(idx, { countdownTitle: text })} />
                      </div>
                    )}

                    {block.type === "timeline" && (() => {
                      const timelineItems = getTimelineItems();
                      if (!editMode && timelineItems.length === 0) return null;
                      return (
                        <Reveal style={editMode ? { position: "relative", zIndex: 200 } : undefined}>
                          <div style={{ background: 'white', border: `3px solid ${C.yellow}`, borderRadius: 16, padding: "20px 24px", position: "relative", overflow: 'hidden', boxShadow: `3px 3px 0 ${C.black}` }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: `repeating-linear-gradient(90deg,${C.red} 0,${C.red} 12px,${C.yellow} 12px,${C.yellow} 24px,${C.black} 24px,${C.black} 36px)` }} />
                            <img src={IMG_GOOFY} alt="" style={{ position: "absolute", top: -16, right: -6, width: 66, height: 66, objectFit: "contain", filter: "drop-shadow(0 4px 10px rgba(0,0,0,.2))", pointerEvents: "none" }} />
                            <p style={{ fontFamily: F.label, fontSize: 8, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase", color: C.red, textAlign: "center", margin: "8px 0 16px" }}>Programul Zilei</p>
                            {timelineItems.map((item: any, i: number) => (
                              <div key={item.id} style={{ display: "grid", gridTemplateColumns: "58px 44px 1fr", alignItems: "stretch", minHeight: 64 }}>
                                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 10 }}>
                                  <InlineTime editMode={editMode} value={item.time || ""} onChange={v => updateTimelineItem(item.id, { time: v })} textKey={`timeline:${item.id}:time`} textLabel={`Ora ${i + 1}`}
                                    style={{ fontFamily: F.body, fontSize: 15, fontWeight: 700, color: C.red, lineHeight: 1.2, textAlign: "center", width: "100%" }} />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: `${C.yellow}44`, border: `2px solid ${C.yellow}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <WeddingIcon iconKey={item.icon || "party"} size={20} color={C.red} />
                                  </div>
                                  {i < timelineItems.length - 1 && <div style={{ flex: 1, width: 2, background: `repeating-linear-gradient(to bottom,${C.red} 0,${C.red} 4px,transparent 4px,transparent 8px)`, marginTop: 4 }} />}
                                </div>
                                <div style={{ paddingLeft: 12, paddingTop: 10, paddingBottom: i < timelineItems.length - 1 ? 20 : 0 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <InlineEdit tag="span" editMode={editMode} value={item.title || ""} onChange={v => updateTimelineItem(item.id, { title: v })} placeholder="Moment..." textKey={`timeline:${item.id}:title`} textLabel={`Titlu ${i + 1}`}
                                      style={{ fontFamily: F.body, fontSize: 15, fontWeight: 700, color: C.black, display: "block", lineHeight: 1.3 }} />
                                    {editMode && <button type="button" onClick={() => removeTimelineItem(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: MUTED_ON_LIGHT, fontSize: 14, padding: "0 4px", opacity: .5 }}>✕</button>}
                                  </div>
                                  {(editMode || item.notice) && (
                                    <InlineEdit tag="span" editMode={editMode} value={item.notice || ""} onChange={v => updateTimelineItem(item.id, { notice: v })} placeholder="Nota..." textKey={`timeline:${item.id}:notice`} textLabel={`Nota ${i + 1}`}
                                      style={{ fontFamily: F.body, fontSize: 13, fontStyle: "italic", color: MUTED_ON_LIGHT, display: "block", marginTop: 4, lineHeight: 1.5 }} />
                                  )}
                                </div>
                              </div>
                            ))}
                            <TimelineInsertButton editMode={editMode} colors={{ dark: C.red, light: `${C.yellow}88`, xl: `${C.yellow}22`, muted: MUTED_ON_LIGHT }} onAdd={preset => addTimelineItem(preset)} />
                          </div>
                        </Reveal>
                      );
                    })()}

                    {block.type === "music" && (
                      <Reveal><MusicBlock block={block} editMode={editMode} onUpdate={p => updBlock(idx, p)} imperativeRef={musicPlayRef} /></Reveal>
                    )}

                    {block.type === "gift" && (
                      <Reveal>
                        <div style={{ background: `linear-gradient(135deg,${C.red},${C.darkRed})`, borderRadius: 18, padding: 24, textAlign: 'center', color: 'white', position: 'relative', boxShadow: `4px 4px 0 ${C.black}`, border: `3px solid ${C.black}`, overflow: 'hidden' }}>
                          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: `repeating-linear-gradient(90deg,${C.yellow} 0,${C.yellow} 12px,rgba(255,255,255,.2) 12px,rgba(255,255,255,.2) 24px)` }} />
                          <img src={IMG_DAISY} alt="" style={{ position: "absolute", top: -16, right: -4, width: 76, height: 76, objectFit: "contain", filter: "drop-shadow(0 4px 12px rgba(0,0,0,.3))", pointerEvents: "none" }} />
                          <Gift className="w-8 h-8 mx-auto mb-4 opacity-80" style={{ position: 'relative', zIndex: 1, marginTop: 8 }} />
                          <InlineEdit tag="h3" editMode={editMode} value={block.sectionTitle || "Sugestie de cadou"} onChange={v => updBlock(idx, { sectionTitle: v })} textLabel="Cadou · titlu" style={{ fontFamily: F.display, fontSize: 20, marginBottom: 8, position: 'relative', zIndex: 1 }} />
                          <InlineEdit tag="p" editMode={editMode} value={block.content || ""} onChange={v => updBlock(idx, { content: v })} multiline textLabel="Cadou · text" style={{ fontFamily: F.body, fontSize: 12, opacity: .9, lineHeight: 1.6, position: 'relative', zIndex: 1 }} />
                          {(block.iban || editMode) && (
                            <div style={{ marginTop: 12, padding: '8px 10px', background: 'rgba(255,255,255,.15)', borderRadius: 10, position: 'relative', zIndex: 1 }}>
                              <InlineEdit tag="p" editMode={editMode} value={block.iban || ""} onChange={v => updBlock(idx, { iban: v })} placeholder="IBAN..." textLabel="Cadou · IBAN" style={{ fontFamily: F.body, fontSize: 10, fontWeight: 700 }} />
                            </div>
                          )}
                        </div>
                      </Reveal>
                    )}

                    {block.type === "whatsapp" && (
                      <Reveal>
                        <div className="flex flex-col items-center gap-4">
                          <img src={IMG_MICKEY_BIRTHDAY} alt="" style={{ width: 86, height: 86, objectFit: "contain", filter: "drop-shadow(0 6px 14px rgba(0,0,0,.2))" }} />
                          <a href={`https://wa.me/${(block.content || "").replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                            className="group/wa flex items-center gap-4 px-8 py-4 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all"
                            style={{ border: `3px solid ${C.yellow}`, boxShadow: `3px 3px 0 ${C.black}` }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg,#128c7e,#25d366)`, boxShadow: `0 8px 20px rgba(37,211,102,.4)` }}>
                              <MessageCircle className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-left">
                              <InlineEdit tag="p" editMode={editMode} value={block.label || "Contact WhatsApp"} onChange={v => updBlock(idx, { label: v })} textLabel="WhatsApp · label" style={{ fontWeight: 800, fontSize: 13, color: C.black, margin: 0 }} />
                              <p style={{ fontFamily: F.body, fontSize: 10, color: MUTED_ON_LIGHT, margin: 0 }}>Raspundem rapid</p>
                            </div>
                          </a>
                          {editMode && (
                            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "white", border: `2px solid ${C.yellow}`, borderRadius: 12, padding: "8px 16px", boxShadow: `2px 2px 0 ${C.black}` }}>
                              <span style={{ fontFamily: F.label, fontSize: ".6rem", fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: MUTED_ON_LIGHT }}>Numar:</span>
                              <InlineEdit tag="span" editMode={editMode} value={block.content || "0700000000"} onChange={v => updBlock(idx, { content: v })} textLabel="WhatsApp · numar" style={{ fontFamily: F.body, fontSize: ".9rem", color: C.black, fontWeight: 700 }} />
                            </div>
                          )}
                        </div>
                      </Reveal>
                    )}

                    {block.type === "rsvp" && (
                      <Reveal>
                        <div style={{ marginTop: 6 }}>
                          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                            <img src={IMG_MICKEY_WAVE} alt="" style={{ width: 80, height: 80, objectFit: "contain", filter: "drop-shadow(0 6px 14px rgba(0,0,0,.2))", animation: 'mm-float 3s ease-in-out infinite' }} />
                          </div>
                          <button onClick={() => { if (!editMode) onOpenRSVP?.(); }}
                            style={{ width: '100%', padding: '20px', background: C.red, border: `4px solid ${C.black}`, borderRadius: 50, cursor: 'pointer', fontFamily: F.display, fontSize: 17, color: C.yellow, letterSpacing: 1, boxShadow: `4px 4px 0 ${C.black}`, animation: 'mm-pulse 2.5s ease-in-out infinite', transition: 'all .25s', position: 'relative', overflow: 'hidden' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.03) translate(-2px,-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = `6px 6px 0 ${C.black}`; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = `4px 4px 0 ${C.black}`; }}>
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.15),transparent)', backgroundSize: '200% 100%', animation: 'mm-shimmer 2s linear infinite', borderRadius: 50 }} />
                            <span style={{ position: 'relative' }}>
                              <InlineEdit tag="span" editMode={editMode} value={block.label || "Confirma Prezenta"} onChange={v => updBlock(idx, { label: v })} textLabel="RSVP · text" />
                            </span>
                          </button>
                        </div>
                      </Reveal>
                    )}

                    {block.type === "divider" && (
                      <Reveal><PolkaDivider /></Reveal>
                    )}

                    {block.type === "date" && (
                      <Reveal>
                        <div style={{ textAlign: "center", padding: "4px 0" }}>
                          <p style={{ fontFamily: F.label, fontWeight: 700, letterSpacing: "0.3em", fontSize: "0.85rem", color: C.red, margin: 0 }}>
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
                              <PolkaDivider />
                              <div style={{ marginTop: 14 }}>
                                <InlineEdit tag="p" editMode={editMode} value={block.label || "Parintii copilului"} onChange={v => updBlock(idx, { label: v })} textLabel="Familie · titlu"
                                  style={{ fontFamily: F.label, fontSize: ".55rem", fontWeight: 700, letterSpacing: ".35em", textTransform: "uppercase", color: C.red, margin: "0 0 8px" }} />
                                <InlineEdit tag="p" editMode={editMode} value={block.content || "Cu drag si recunostinta"} onChange={v => updBlock(idx, { content: v })} textLabel="Familie · text"
                                  style={{ fontFamily: F.body, fontStyle: "italic", fontSize: ".9rem", color: MUTED, margin: 0, lineHeight: 1.6 }} />
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
                                {members.map((m, mi) => (
                                  <div key={mi} style={{ position: "relative" }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
                                      <InlineEdit tag="span" editMode={editMode} value={m.name1} onChange={v => { const nm = [...members]; nm[mi] = { ...nm[mi], name1: v }; updateMembers(nm); }} textLabel={`Familie · nume ${mi + 1}A`} style={{ fontFamily: F.display, fontSize: "1.4rem", color: C.red }} />
                                      <span style={{ fontFamily: F.display, color: C.yellow, fontSize: "1.4rem", textShadow: `1px 1px 0 ${C.black}` }}>❤</span>
                                      <InlineEdit tag="span" editMode={editMode} value={m.name2} onChange={v => { const nm = [...members]; nm[mi] = { ...nm[mi], name2: v }; updateMembers(nm); }} textLabel={`Familie · nume ${mi + 1}B`} style={{ fontFamily: F.display, fontSize: "1.4rem", color: C.red }} />
                                      {editMode && members.length > 1 && <button type="button" onClick={() => updateMembers(members.filter((_, i) => i !== mi))} style={{ background: "none", border: "none", cursor: "pointer", color: MUTED, fontSize: 14, padding: "0 4px", opacity: .7 }}>✕</button>}
                                    </div>
                                    {mi < members.length - 1 && <div style={{ height: 3, background: `repeating-linear-gradient(90deg,${C.red} 0,${C.red} 8px,${C.yellow} 8px,${C.yellow} 16px,${C.black} 16px,${C.black} 24px)`, margin: "10px 32px 0", borderRadius: 2 }} />}
                                  </div>
                                ))}
                              </div>
                              {editMode && (
                                <button type="button" onClick={() => updateMembers([...members, { name1: "Nume 1", name2: "Nume 2" }])}
                                  style={{ marginTop: 16, background: C.yellow, border: `2px solid ${C.black}`, borderRadius: 99, padding: "5px 16px", cursor: "pointer", fontFamily: F.label, fontSize: ".6rem", fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", color: C.black, boxShadow: `2px 2px 0 ${C.black}` }}>
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

          {/* ── FOOTER ── */}
          <Reveal from="fade" delay={0.1}>
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <PolkaDivider />
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 16, margin: '16px 0 14px' }}>
                <div style={{ animation: 'mm-float 3.5s ease-in-out infinite' }}>
                  <img src={IMG_DONALD} alt="" style={{ height: 58, objectFit: 'contain', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,.25))' }} />
                </div>
                <div style={{ animation: 'mm-heartBeat 2.5s ease-in-out infinite', marginBottom: 8 }}>
                  <MickeyEars size={70} color={C.black} />
                </div>
                <div style={{ animation: 'mm-floatR 4s ease-in-out infinite' }}>
                  <img src={IMG_MINNIE_WAVE} alt="" style={{ height: 58, objectFit: 'contain', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,.25))' }} />
                </div>
              </div>
              {/* Mickey logo */}
              <img src={IMG_MICKEY_LOGO} alt="Mickey Mouse" style={{ width: 120, objectFit: 'contain', filter: `drop-shadow(0 2px 8px rgba(204,0,0,.3))`, display: "block", margin: "0 auto 8px" }} />
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
                {['🎈','⭐','🎉','🎊','🎈','⭐','🎉','🎊','🎈'].map((e, i) => (
                  <span key={i} style={{ fontSize: 14, animation: `mm-twinkle ${1.5 + i * .18}s ${i * .12}s ease-in-out infinite`, display: 'inline-block' }}>{e}</span>
                ))}
              </div>
              <p style={{ fontFamily: F.display, fontSize: 11, color: C.red, opacity: .6, margin: 0, letterSpacing: 1 }}>
                Oh boy! · Mickey Mouse Clubhouse · {displayYear}
              </p>
            </div>
          </Reveal>

        </div>
      </div>
    </>
  );
};

export default MickeyMouseTemplate;

