import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import {
  ArrowRight,
  Calendar,
  Camera,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  EyeOff,
  Gift,
  MapPin,
  MessageCircle,
  Music,
  Navigation,
  Pause,
  Play,
  Plus,
  SkipBack,
  SkipForward,
  Sparkles,
  Trash2,
  Upload,
  Volume2,
  VolumeX,
} from "lucide-react";
import { TemplateMeta, InvitationTemplateProps } from "../invitations/types";
import { cn } from "../../lib/utils";
import { InvitationBlock, InvitationBlockType, TextStyle, UserProfile } from "../../types";
import { InlineEdit, InlineTime, InlineWaze } from "../invitations/InlineEdit";
import { BlockStyle, BlockStyleProvider } from "../BlockStyleContext";
import { API_URL } from "../../config/api";

gsap.registerPlugin(ScrollTrigger);

type Palette = {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  background: string;
  cardBg: string;
  border: string;
  textColor: string;
  headingColor: string;
  textOnPrimary: string;
  accent: string;
};

export const MIRAGE_FLORAL_PALETTES: Record<string, Palette> = {
  mirage_floral: {
    id: "mirage_floral",
    name: "Classic Warm Sand & Oak",
    primary: "#1c1917",
    secondary: "#fdf8f5",
    background: "#f7f4ee",
    cardBg: "#ffffff",
    border: "rgba(28, 25, 23, 0.08)",
    textColor: "#44403c",
    headingColor: "#1c1917",
    textOnPrimary: "#ffffff",
    accent: "#b45309",
  },
  avant_garde_noir: {
    id: "avant_garde_noir",
    name: "Minimalist Museum Void",
    primary: "#0a0a0a",
    secondary: "#f4f4f5",
    background: "#fcfbf9",
    cardBg: "#ffffff",
    border: "rgba(10, 10, 10, 0.06)",
    textColor: "#27272a",
    headingColor: "#09090b",
    textOnPrimary: "#ffffff",
    accent: "#c5a880",
  },
  jardin_vert: {
    id: "jardin_vert",
    name: "Sage & Frosted Glass",
    primary: "#2d372e",
    secondary: "#f0f4f1",
    background: "#fafaf8",
    cardBg: "#ffffff",
    border: "rgba(45, 55, 46, 0.07)",
    textColor: "#3f4e40",
    headingColor: "#1e251f",
    textOnPrimary: "#ffffff",
    accent: "#8b9e8c",
  },
};

export function getMirageFloralTheme(colorTheme?: string): Palette {
  const normalized = colorTheme?.toLowerCase() || "mirage_floral";
  return MIRAGE_FLORAL_PALETTES[normalized] || MIRAGE_FLORAL_PALETTES.mirage_floral;
}

function deleteUploadedFile(url: string | undefined) {
  if (!url || !url.startsWith("/uploads/")) return;
  const session = JSON.parse(localStorage.getItem("weddingPro_session") || "{}");
  fetch(`${API_URL}/upload`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.token || ""}`,
    },
    body: JSON.stringify({ url }),
  }).catch(() => {});
}

export const meta: TemplateMeta = {
  id: "mirage-floral-simple",
  name: "Mirage Floral",
  category: "wedding",
  description:
    "Design editorial cu compozitie de galerie, dar cu functionalitate completa de editor mobil.",
  colors: ["#f7f4ee", "#1c1917", "#b45309"],
  previewClass: "bg-stone-100 border-stone-200",
  elementsClass: "bg-stone-300",
};

const MIRAGE_CONFIG_CANDIDATES = [meta.id, "mirage-floral"];

const APPLE_DISPLAY_FONT =
  'ui-sans-serif, -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif';
const EDITORIAL_SERIF =
  'Iowan Old Style, "Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif';

function safeJSON<T>(value: string | undefined, fallback: T): T {
  try {
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function useCountdown(target: string) {
  const calc = () => {
    const diff = new Date(target).getTime() - Date.now();
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      expired: false,
    };
  };

  const [time, setTime] = useState(calc);

  useEffect(() => {
    if (!target) return;
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [target]);

  return time;
}

const HairlineRule = ({
  label,
  theme,
  className,
}: {
  label?: string;
  theme: Palette;
  className?: string;
}) => (
  <div className={cn("flex items-center gap-4 w-full", className)}>
    <div className="flex-1 h-px" style={{ background: theme.border }} />
    {label && (
      <span
        style={{
          fontFamily: APPLE_DISPLAY_FONT,
          fontSize: "0.58rem",
          fontWeight: 700,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: `${theme.textColor}99`,
        }}
      >
        {label}
      </span>
    )}
    {label && <div className="flex-1 h-px" style={{ background: theme.border }} />}
  </div>
);

const EditorialDot = ({ theme }: { theme: Palette }) => (
  <div className="flex items-center justify-center gap-3 my-2">
    <div className="h-px w-12" style={{ background: theme.border }} />
    <span
      className="w-2.5 h-2.5 rounded-full block"
      style={{ background: theme.accent }}
    />
    <div className="h-px w-12" style={{ background: theme.border }} />
  </div>
);

const BlockToolbar = ({
  onUp,
  onDown,
  onToggle,
  onDelete,
  visible,
  isFirst,
  isLast,
}: {
  onUp: () => void;
  onDown: () => void;
  onToggle: () => void;
  onDelete: () => void;
  visible: boolean;
  isFirst: boolean;
  isLast: boolean;
}) => (
  <div className="absolute -top-3.5 right-3 z-30 flex items-center gap-0.5 rounded-full border border-stone-200 bg-white/95 px-1.5 py-1 opacity-0 shadow-lg transition-all pointer-events-none group-hover/block:pointer-events-auto group-hover/block:opacity-100">
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onUp();
      }}
      disabled={isFirst}
      className="rounded-full p-0.5 transition-colors hover:bg-stone-100 disabled:opacity-25"
    >
      <ChevronUp className="w-3 h-3 text-stone-500" />
    </button>
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onDown();
      }}
      disabled={isLast}
      className="rounded-full p-0.5 transition-colors hover:bg-stone-100 disabled:opacity-25"
    >
      <ChevronDown className="w-3 h-3 text-stone-500" />
    </button>
    <div className="mx-0.5 h-3 w-px bg-stone-200" />
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className="rounded-full p-0.5 transition-colors hover:bg-stone-100"
    >
      {visible ? (
        <Eye className="w-3 h-3 text-stone-500" />
      ) : (
        <EyeOff className="w-3 h-3 text-stone-300" />
      )}
    </button>
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onDelete();
      }}
      className="rounded-full p-0.5 transition-colors hover:bg-red-50"
    >
      <Trash2 className="w-3 h-3 text-red-400" />
    </button>
  </div>
);

const BLOCK_TYPE_ICONS: Record<string, string> = {
  photo: "🖼",
  text: "📝",
  location: "📍",
  calendar: "📅",
  countdown: "⏱",
  timeline: "⏰",
  music: "🎵",
  gift: "🎁",
  whatsapp: "💬",
  rsvp: "✅",
  divider: "━",
  family: "👪",
  date: "📆",
  description: "📄",
  title: "🏷",
  godparents: "🙏",
  parents: "👫",
  spacer: "⬜",
};

const InsertBlockButton: React.FC<{
  insertIdx: number;
  openInsertAt: number | null;
  setOpenInsertAt: (v: number | null) => void;
  blockTypes: { type: string; label: string; def: any }[];
  onInsert: (type: string, def: any) => void;
  theme: Palette;
}> = ({
  insertIdx,
  openInsertAt,
  setOpenInsertAt,
  blockTypes,
  onInsert,
  theme,
}) => {
  const isOpen = openInsertAt === insertIdx;
  const [hovered, setHovered] = useState(false);
  const visible = hovered || isOpen;

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: 30,
        zIndex: 40,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: 1,
          background: `repeating-linear-gradient(to right, ${theme.border} 0, ${theme.border} 8px, transparent 8px, transparent 16px)`,
        }}
      />
      <button
        type="button"
        onClick={() => setOpenInsertAt(isOpen ? null : insertIdx)}
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          border: `1px solid ${theme.border}`,
          background: theme.cardBg,
          color: theme.headingColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          lineHeight: 1,
          cursor: "pointer",
          boxShadow: "0 8px 24px rgba(28,25,23,0.08)",
          transform: visible ? "scale(1)" : "scale(0.78)",
          transition: "all .15s",
          zIndex: 2,
        }}
      >
        {isOpen ? "x" : "+"}
      </button>
      {isOpen && (
        <div
          style={{
            position: "absolute",
            bottom: 36,
            left: "50%",
            transform: "translateX(-50%)",
            width: 304,
            background: theme.cardBg,
            border: `1px solid ${theme.border}`,
            borderRadius: 20,
            boxShadow: "0 18px 50px rgba(28,25,23,0.12)",
            padding: 14,
            zIndex: 200,
          }}
        >
          <p
            style={{
              fontSize: "0.58rem",
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: theme.headingColor,
              margin: "0 0 10px",
              textAlign: "center",
              fontFamily: APPLE_DISPLAY_FONT,
            }}
          >
            Adauga bloc
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 6,
            }}
          >
            {blockTypes.map((bt) => (
              <button
                key={bt.type}
                type="button"
                onClick={() => onInsert(bt.type, bt.def)}
                style={{
                  border: `1px solid ${theme.border}`,
                  borderRadius: 14,
                  background: theme.secondary,
                  color: theme.headingColor,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  padding: "10px 4px",
                }}
              >
                <span
                  style={{
                    fontSize: 16,
                    lineHeight: 1,
                  }}
                >
                  {BLOCK_TYPE_ICONS[bt.type] || "+"}
                </span>
                <span
                  style={{
                    fontSize: "0.56rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    lineHeight: 1.15,
                    textAlign: "center",
                    opacity: 0.75,
                    fontFamily: APPLE_DISPLAY_FONT,
                  }}
                >
                  {bt.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

type ClipShape =
  | "rect"
  | "rounded"
  | "rounded-lg"
  | "squircle"
  | "circle"
  | "arch"
  | "arch-b"
  | "hexagon"
  | "diamond"
  | "triangle"
  | "star"
  | "heart"
  | "diagonal"
  | "diagonal-r"
  | "wave-b"
  | "wave-t"
  | "wave-both"
  | "blob"
  | "blob2"
  | "blob3"
  | "blob4";

type MaskEffect = "fade-b" | "fade-t" | "fade-l" | "fade-r" | "vignette";

function getClipStyle(clip: ClipShape): React.CSSProperties {
  const map: Record<ClipShape, React.CSSProperties> = {
    rect: { borderRadius: 0 },
    rounded: { borderRadius: 18 },
    "rounded-lg": { borderRadius: 32 },
    squircle: { borderRadius: "30% 30% 30% 30% / 30% 30% 30% 30%" },
    circle: { borderRadius: "50%" },
    arch: { borderRadius: "50% 50% 0 0 / 40% 40% 0 0" },
    "arch-b": { borderRadius: "0 0 50% 50% / 0 0 40% 40%" },
    hexagon: {
      clipPath: "polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%)",
    },
    diamond: { clipPath: "polygon(50% 0%,100% 50%,50% 100%,0% 50%)" },
    triangle: { clipPath: "polygon(50% 0%,100% 100%,0% 100%)" },
    star: {
      clipPath:
        "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)",
    },
    heart: { clipPath: "url(#mirage-clip-heart)" },
    diagonal: { clipPath: "polygon(0 0,100% 0,100% 80%,0 100%)" },
    "diagonal-r": { clipPath: "polygon(0 0,100% 0,100% 100%,0 80%)" },
    "wave-b": { clipPath: "url(#mirage-clip-wave-b)" },
    "wave-t": { clipPath: "url(#mirage-clip-wave-t)" },
    "wave-both": { clipPath: "url(#mirage-clip-wave-both)" },
    blob: { clipPath: "url(#mirage-clip-blob)" },
    blob2: { clipPath: "url(#mirage-clip-blob2)" },
    blob3: { clipPath: "url(#mirage-clip-blob3)" },
    blob4: { clipPath: "url(#mirage-clip-blob4)" },
  };

  return map[clip] || {};
}

function getMaskStyle(effects: MaskEffect[]): React.CSSProperties {
  if (!effects.length) return {};
  const layers = effects.map((effect) => {
    switch (effect) {
      case "fade-b":
        return "linear-gradient(to bottom, black 42%, transparent 100%)";
      case "fade-t":
        return "linear-gradient(to top, black 42%, transparent 100%)";
      case "fade-l":
        return "linear-gradient(to left, black 42%, transparent 100%)";
      case "fade-r":
        return "linear-gradient(to right, black 42%, transparent 100%)";
      case "vignette":
        return "radial-gradient(ellipse 78% 78% at center, black 45%, transparent 100%)";
      default:
        return "none";
    }
  });
  const mask = layers.join(", ");
  return {
    WebkitMaskImage: mask,
    maskImage: mask,
    WebkitMaskComposite: effects.length > 1 ? "source-in" : "unset",
    maskComposite: effects.length > 1 ? "intersect" : "unset",
  };
}

const PhotoClipDefs: React.FC = () => (
  <svg
    width="0"
    height="0"
    style={{ position: "absolute", overflow: "hidden", pointerEvents: "none" }}
  >
    <defs>
      <clipPath id="mirage-clip-wave-b" clipPathUnits="objectBoundingBox">
        <path d="M0,0 L1,0 L1,0.78 Q0.875,0.65 0.75,0.78 Q0.625,0.91 0.5,0.78 Q0.375,0.65 0.25,0.78 Q0.125,0.91 0,0.78 Z" />
      </clipPath>
      <clipPath id="mirage-clip-wave-t" clipPathUnits="objectBoundingBox">
        <path d="M0,0.22 Q0.125,0.09 0.25,0.22 Q0.375,0.35 0.5,0.22 Q0.625,0.09 0.75,0.22 Q0.875,0.35 1,0.22 L1,1 L0,1 Z" />
      </clipPath>
      <clipPath id="mirage-clip-wave-both" clipPathUnits="objectBoundingBox">
        <path d="M0,0.22 Q0.125,0.09 0.25,0.22 Q0.375,0.35 0.5,0.22 Q0.625,0.09 0.75,0.22 Q0.875,0.35 1,0.22 L1,0.78 Q0.875,0.65 0.75,0.78 Q0.625,0.91 0.5,0.78 Q0.375,0.65 0.25,0.78 Q0.125,0.91 0,0.78 Z" />
      </clipPath>
      <clipPath id="mirage-clip-heart" clipPathUnits="objectBoundingBox">
        <path d="M0.5,0.85 C0.5,0.85 0.05,0.55 0.05,0.3 C0.05,0.12 0.18,0.05 0.3,0.1 C0.4,0.14 0.5,0.25 0.5,0.25 C0.5,0.25 0.6,0.14 0.7,0.1 C0.82,0.05 0.95,0.12 0.95,0.3 C0.95,0.55 0.5,0.85 0.5,0.85Z" />
      </clipPath>
      <clipPath id="mirage-clip-blob" clipPathUnits="objectBoundingBox">
        <path d="M0.5,0.03 C0.72,0.01 0.95,0.14 0.97,0.38 C0.99,0.58 0.88,0.78 0.72,0.88 C0.56,0.98 0.35,0.99 0.2,0.88 C0.05,0.77 -0.02,0.55 0.04,0.36 C0.1,0.17 0.28,0.05 0.5,0.03Z" />
      </clipPath>
      <clipPath id="mirage-clip-blob2" clipPathUnits="objectBoundingBox">
        <path d="M0.75,0.224 C0.831,0.271 0.911,0.342 0.921,0.422 C0.93,0.502 0.869,0.59 0.808,0.661 C0.747,0.732 0.685,0.785 0.611,0.816 C0.538,0.847 0.453,0.856 0.389,0.824 C0.326,0.792 0.285,0.72 0.233,0.647 C0.181,0.573 0.119,0.497 0.113,0.414 C0.107,0.331 0.157,0.241 0.231,0.193 C0.305,0.145 0.402,0.138 0.493,0.147 C0.584,0.155 0.668,0.178 0.75,0.224Z" />
      </clipPath>
      <clipPath id="mirage-clip-blob3" clipPathUnits="objectBoundingBox">
        <path d="M0.5,0.05 C0.65,0.02 0.85,0.1 0.92,0.28 C0.99,0.46 0.93,0.68 0.8,0.82 C0.67,0.96 0.46,1.0 0.3,0.93 C0.14,0.86 0.02,0.68 0.01,0.5 C0.0,0.32 0.1,0.14 0.25,0.07 C0.33,0.03 0.42,0.07 0.5,0.05Z" />
      </clipPath>
      <clipPath id="mirage-clip-blob4" clipPathUnits="objectBoundingBox">
        <path d="M0.18,0.08 C0.32,0.01 0.54,0.0 0.68,0.08 C0.82,0.16 0.96,0.32 0.97,0.5 C0.98,0.68 0.86,0.86 0.7,0.93 C0.54,1.0 0.32,0.97 0.18,0.88 C0.04,0.79 -0.04,0.62 0.02,0.45 C0.07,0.28 0.04,0.15 0.18,0.08Z" />
      </clipPath>
    </defs>
  </svg>
);

const CalendarMonth: React.FC<{ date: string | undefined; theme: Palette }> = ({
  date,
  theme,
}) => {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth();
  const day = d.getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNames = [
    "IANUARIE",
    "FEBRUARIE",
    "MARTIE",
    "APRILIE",
    "MAI",
    "IUNIE",
    "IULIE",
    "AUGUST",
    "SEPTEMBRIE",
    "OCTOMBRIE",
    "NOIEMBRIE",
    "DECEMBRIE",
  ];
  const dayLabels = ["L", "M", "M", "J", "V", "S", "D"];
  const startOffset = (firstDay + 6) % 7;
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div
      style={{
        border: `1px solid ${theme.border}`,
        background: theme.secondary,
        padding: 20,
        textAlign: "center",
        borderRadius: 22,
      }}
    >
      <p
        style={{
          fontFamily: APPLE_DISPLAY_FONT,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.25em",
          color: theme.headingColor,
          marginBottom: 12,
        }}
      >
        {monthNames[month]} {year}
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 6,
          marginBottom: 6,
        }}
      >
        {dayLabels.map((label, index) => (
          <div
            key={`${label}-${index}`}
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: `${theme.textColor}88`,
              fontFamily: APPLE_DISPLAY_FONT,
            }}
          >
            {label}
          </div>
        ))}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 6,
        }}
      >
        {cells.map((cell, index) => {
          const isCurrentDay = cell === day;
          return (
            <div
              key={index}
              style={{
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: isCurrentDay ? 700 : 400,
                color: isCurrentDay ? theme.textOnPrimary : cell ? theme.headingColor : "transparent",
                background: isCurrentDay ? theme.accent : "transparent",
                borderRadius: 10,
              }}
            >
              {cell || ""}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MusicBlock: React.FC<{
  block: InvitationBlock;
  editMode: boolean;
  onUpdate: (patch: Partial<InvitationBlock>) => void;
  theme: Palette;
}> = ({ block, editMode, onUpdate, theme }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setProgress(audio.currentTime);
    const onDur = () => setDuration(audio.duration);
    const onEnd = () => {
      setPlaying(false);
      setProgress(0);
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onDur);
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onDur);
      audio.removeEventListener("ended", onEnd);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [block.musicUrl]);

  const fmt = (seconds: number) =>
    `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

  const pct = duration ? `${(progress / duration) * 100}%` : "0%";

  const handleMp3 = async (file: File) => {
    if (!file.type.startsWith("audio/")) return;
    setUploading(true);
    deleteUploadedFile(block.musicUrl);
    try {
      const form = new FormData();
      form.append("file", file);
      const session = JSON.parse(localStorage.getItem("weddingPro_session") || "{}");
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.token || ""}` },
        body: form,
      });
      if (!res.ok) throw new Error("upload failed");
      const { url } = await res.json();
      onUpdate({ musicUrl: url, musicType: "mp3" });
    } finally {
      setUploading(false);
    }
  };

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audioRef.current.currentTime =
      Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * duration;
  };

  const isActive = !!block.musicUrl;

  return (
    <div
      style={{
        border: `1px solid ${theme.border}`,
        background: theme.secondary,
        borderRadius: 24,
        padding: "20px 22px",
      }}
    >
      {block.musicType === "mp3" && block.musicUrl && (
        <audio ref={audioRef} src={block.musicUrl} preload="metadata" />
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <Music className="w-4 h-4" style={{ color: theme.accent }} />
        <span
          style={{
            fontFamily: APPLE_DISPLAY_FONT,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: theme.headingColor,
          }}
        >
          Muzica invitatiei
        </span>
      </div>

      {!isActive && editMode && (
        <div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{
              width: "100%",
              background: theme.cardBg,
              border: `1px dashed ${theme.border}`,
              borderRadius: 18,
              padding: "16px 0",
              cursor: uploading ? "not-allowed" : "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            {uploading ? (
              <div className="w-5 h-5 rounded-full border-2 border-stone-200 border-t-stone-600 animate-spin" />
            ) : (
              <Upload className="w-5 h-5" style={{ color: theme.accent }} />
            )}
            <span
              style={{
                fontFamily: APPLE_DISPLAY_FONT,
                fontSize: 9,
                color: `${theme.textColor}cc`,
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              Upload MP3
            </span>
          </button>
        </div>
      )}

      {!isActive && !editMode && (
        <div style={{ textAlign: "center", padding: "12px 0", opacity: 0.5 }}>
          <Music className="w-8 h-8 mx-auto mb-2" style={{ color: theme.accent }} />
          <p
            style={{
              fontFamily: EDITORIAL_SERIF,
              fontSize: 12,
              fontStyle: "italic",
              color: theme.textColor,
            }}
          >
            Melodia va aparea aici
          </p>
        </div>
      )}

      {isActive && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: "50%",
                background: theme.cardBg,
                border: `1px solid ${theme.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Music className="w-4 h-4" style={{ color: theme.accent }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <InlineEdit
                tag="p"
                editMode={editMode}
                value={block.musicTitle || ""}
                onChange={(v) => onUpdate({ musicTitle: v })}
                placeholder="Titlul melodiei..."
                style={{
                  fontFamily: EDITORIAL_SERIF,
                  fontSize: 14,
                  fontStyle: "italic",
                  color: theme.headingColor,
                  margin: 0,
                }}
              />
              <InlineEdit
                tag="p"
                editMode={editMode}
                value={block.musicArtist || ""}
                onChange={(v) => onUpdate({ musicArtist: v })}
                placeholder="Artist..."
                style={{
                  fontFamily: APPLE_DISPLAY_FONT,
                  fontSize: 10,
                  color: `${theme.textColor}aa`,
                  margin: "2px 0 0",
                }}
              />
            </div>
          </div>
          <div
            onClick={seek}
            style={{
              height: 4,
              background: `${theme.border}`,
              marginBottom: 6,
              cursor: "pointer",
              position: "relative",
              borderRadius: 4,
            }}
          >
            <div
              style={{
                height: "100%",
                background: theme.accent,
                width: pct,
                borderRadius: 4,
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span
              style={{
                fontFamily: APPLE_DISPLAY_FONT,
                fontSize: 9,
                color: `${theme.textColor}99`,
              }}
            >
              {fmt(progress)}
            </span>
            <span
              style={{
                fontFamily: APPLE_DISPLAY_FONT,
                fontSize: 9,
                color: `${theme.textColor}99`,
              }}
            >
              {duration ? fmt(duration) : "--:--"}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}>
            <button
              type="button"
              onClick={() => {
                const audio = audioRef.current;
                if (audio) audio.currentTime = Math.max(0, audio.currentTime - 10);
              }}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
            >
              <SkipBack className="w-4 h-4" style={{ color: theme.headingColor }} />
            </button>
            <button
              type="button"
              onClick={toggle}
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: theme.primary,
                color: theme.textOnPrimary,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {playing ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" style={{ marginLeft: 2 }} />
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                const audio = audioRef.current;
                if (audio) audio.currentTime = Math.min(duration || audio.currentTime + 10, audio.currentTime + 10);
              }}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
            >
              <SkipForward className="w-4 h-4" style={{ color: theme.headingColor }} />
            </button>
          </div>
          {editMode && (
            <div style={{ marginTop: 10, display: "flex", justifyContent: "center", gap: 8 }}>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                style={{
                  background: theme.cardBg,
                  border: `1px solid ${theme.border}`,
                  padding: "4px 12px",
                  cursor: "pointer",
                  fontFamily: APPLE_DISPLAY_FONT,
                  fontSize: 9,
                  color: theme.headingColor,
                  fontWeight: 700,
                  borderRadius: 999,
                }}
              >
                Schimba sursa
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteUploadedFile(block.musicUrl);
                  onUpdate({ musicUrl: "", musicType: "none" as any });
                  setPlaying(false);
                  setProgress(0);
                  setDuration(0);
                }}
                style={{
                  background: "transparent",
                  border: `1px dashed ${theme.border}`,
                  padding: "4px 12px",
                  cursor: "pointer",
                  fontFamily: APPLE_DISPLAY_FONT,
                  fontSize: 9,
                  color: theme.headingColor,
                  fontWeight: 700,
                  borderRadius: 999,
                }}
              >
                Sterge
              </button>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="audio/*,.mp3"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleMp3(file);
        }}
        style={{ display: "none" }}
      />
    </div>
  );
};

const PhotoBlock: React.FC<{
  block: InvitationBlock;
  editMode: boolean;
  onUpdate: (patch: Partial<InvitationBlock>) => void;
  placeholderInitial1?: string;
  theme: Palette;
  coverHeight?: string;
}> = ({ block, editMode, onUpdate, placeholderInitial1, theme, coverHeight }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const ratios: Record<string, string> = {
    "1:1": "100%",
    "4:3": "75%",
    "3:4": "133%",
    "16:9": "56.25%",
    free: "66.6%",
  };
  const aspectRatio = (block.aspectRatio || "free") as string;
  const photoClip = (block.photoClip || "rounded") as ClipShape;
  const photoMasks = (block.photoMasks || []) as MaskEffect[];
  const combined = { ...getClipStyle(photoClip), ...getMaskStyle(photoMasks) };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    deleteUploadedFile(block.imageData);
    try {
      const form = new FormData();
      form.append("file", file);
      const session = JSON.parse(localStorage.getItem("weddingPro_session") || "{}");
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.token || ""}` },
        body: form,
      });
      const { url } = await res.json();
      onUpdate({ imageData: url });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <PhotoClipDefs />
      <div
        style={{
          position: "relative",
          paddingTop: coverHeight ? undefined : ratios[aspectRatio] || ratios.free,
          height: coverHeight,
          overflow: "hidden",
          borderRadius: 28,
          boxShadow: "0 20px 50px rgba(28,25,23,0.12)",
          border: `1px solid ${theme.border}`,
          cursor: editMode ? "pointer" : "default",
          background: block.imageData ? undefined : theme.secondary,
          ...combined,
        }}
        onClick={editMode ? () => fileRef.current?.click() : undefined}
      >
        {block.imageData ? (
          <img
            src={block.imageData}
            alt={block.altText || ""}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `linear-gradient(135deg, ${theme.secondary}, ${theme.background})`,
            }}
          >
            {uploading ? (
              <div className="w-9 h-9 rounded-full border-4 border-stone-200 border-t-stone-700 animate-spin" />
            ) : (
              <div style={{ textAlign: "center", color: theme.headingColor }}>
                <Sparkles className="w-10 h-10 mx-auto mb-2" style={{ color: theme.accent }} />
                <span
                  style={{
                    fontFamily: EDITORIAL_SERIF,
                    fontSize: 52,
                    opacity: 0.28,
                  }}
                >
                  {(placeholderInitial1 || "M")[0].toUpperCase()}
                </span>
                {editMode && (
                  <p
                    style={{
                      marginTop: 8,
                      fontFamily: APPLE_DISPLAY_FONT,
                      fontSize: 10,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      opacity: 0.6,
                    }}
                  >
                    Click pentru upload imagine
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.25) 38%, rgba(0,0,0,0.04) 72%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: "auto 0 0 0",
            padding: "20px 20px 18px",
            color: "#fff",
            zIndex: 2,
          }}
        >
          {(block.label || editMode) && (
            <InlineEdit
              tag="p"
              editMode={editMode}
              value={block.label || ""}
              onChange={(v) => onUpdate({ label: v })}
              placeholder="Capitol..."
              style={{
                fontFamily: APPLE_DISPLAY_FONT,
                fontSize: "0.56rem",
                fontWeight: 700,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.72)",
                marginBottom: 6,
              }}
            />
          )}
          {(block.content || editMode) && (
            <InlineEdit
              tag="h3"
              editMode={editMode}
              value={block.content || ""}
              onChange={(v) => onUpdate({ content: v })}
              placeholder="Text peste imagine..."
              style={{
                fontFamily: EDITORIAL_SERIF,
                fontSize: "1.2rem",
                fontStyle: "italic",
                lineHeight: 1.3,
                color: "#fff",
                maxWidth: 300,
              }}
              multiline
            />
          )}
        </div>

        {editMode && (
          <div className="absolute right-3 top-3 z-20 flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileRef.current?.click();
              }}
              className="rounded-full bg-white/88 p-2 text-stone-700 shadow-sm transition-colors hover:bg-white"
            >
              <Camera className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                deleteUploadedFile(block.imageData);
                onUpdate({ imageData: undefined });
              }}
              className="rounded-full bg-white/88 p-2 text-red-500 shadow-sm transition-colors hover:bg-white"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        style={{ display: "none" }}
      />
    </div>
  );
};

export const CASTLE_DEFAULTS = {
  partner1Name: "Maria-Andrada",
  partner2Name: "Alexandru-Mihai",
  welcomeText:
    "Impreuna cu familiile noastre, va invitam sa celebram unirea noastra intr-un eveniment cu aer editorial, caldura si amintiri curate.",
  heroLabel: "The Marriage Of",
  heroDateLabel: "Save the date",
  heroCountdownText: "Numaratoare inversa",
  showCountdown: true,
  showTimeline: true,
  showRsvpButton: true,
  rsvpButtonText: "Confirma acum",
  weddingDate: "2026-08-22",
  locationName: "Palatul Snagov",
  locationAddress: "Soseaua Snagov nr. 1, Snagov",
  eventTime: "17:00",
  colorTheme: "mirage_floral",
  audioUrl: "",
  heroBgImage:
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1400",
  heroBgImageMobile:
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=900",
  customSections: "",
  godparents: JSON.stringify([{ godfather: "Andreea", godmother: "Radu Dumitrescu" }]),
  parents: JSON.stringify({
    p1_father: "Elena Ionescu",
    p1_mother: "Dumitru Ionescu",
    p2_father: "Constanta Popescu",
    p2_mother: "Vasile Popescu",
  }),
  timeline: "",
} as Partial<UserProfile> & Record<string, any>;

const DEFAULT_TIMELINE_ITEMS = [
  {
    id: "timeline-1",
    time: "16:00",
    title: "Primirea invitatilor",
    description: "Ne revedem cu drag si deschidem povestea serii.",
  },
  {
    id: "timeline-2",
    time: "17:00",
    title: "Ceremonia",
    description: "Momentul principal al zilei, alaturi de familie si prieteni.",
  },
  {
    id: "timeline-3",
    time: "19:00",
    title: "Petrecerea",
    description: "Cina, muzica buna si dans pana tarziu.",
  },
];

CASTLE_DEFAULTS.timeline = JSON.stringify(DEFAULT_TIMELINE_ITEMS);

export const CASTLE_DEFAULT_BLOCKS: InvitationBlock[] = [
  {
    id: "mirage-photo-1",
    type: "photo",
    show: true,
    label: "Capitolul I",
    content: "Promisiunea unei dimineti noi in doi.",
    imageData:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200",
    aspectRatio: "4:3",
    photoClip: "rounded-lg",
    photoMasks: [],
  } as InvitationBlock,
  {
    id: "mirage-photo-2",
    type: "photo",
    show: true,
    label: "Detalii",
    content: "Cercuri de aur si legaminte sfinte.",
    imageData:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1200",
    aspectRatio: "16:9",
    photoClip: "rounded",
    photoMasks: [],
  } as InvitationBlock,
  {
    id: "mirage-parents",
    type: "parents",
    show: true,
    sectionTitle: "Buna invoire a familiilor",
    content:
      "Alaturi de parintii si nasii nostri, avem bucuria de a va invita sa ne fiti alaturi in noul nostru drum.",
  },
  {
    id: "mirage-countdown",
    type: "countdown",
    show: true,
    countdownTitle: "Numaratoare inversa",
  },
  {
    id: "mirage-timeline",
    type: "timeline",
    show: true,
    sectionTitle: "Programul zilei",
  } as InvitationBlock,
  {
    id: "mirage-location-1",
    type: "location",
    show: true,
    label: "Cununia religioasa",
    time: "16:00",
    locationName: "Biserica Sf. Gheorghe",
    locationAddress: "Strada Principala nr. 24, Snagov",
    wazeLink: "",
    } as InvitationBlock,
  {
    id: "mirage-location-2",
    type: "location",
    show: true,
    label: "Sarbatorirea si petrecerea",
    time: "18:00",
    locationName: "Palatul Snagov",
    locationAddress: "Soseaua Snagov nr. 1, Snagov",
    wazeLink: "",
  } as InvitationBlock,
  {
    id: "mirage-rsvp",
    type: "rsvp",
    show: true,
    label: "Confirma acum",
  },
  {
    id: "mirage-thankyou",
    type: "text",
    show: true,
    content:
      "Abia asteptam sa petrecem timp frumos si sa construim amintiri memorabile impreuna.",
  },
];

CASTLE_DEFAULTS.customSections = JSON.stringify(CASTLE_DEFAULT_BLOCKS);

export const CASTLE_PREVIEW_DATA = {
  guest: { name: "Invitat Exemplu", status: "pending", type: "adult" },
  project: { selectedTemplate: "mirage-floral-simple" },
  profile: CASTLE_DEFAULTS,
};

export type MirageFloralProps = InvitationTemplateProps & {
  editMode?: boolean;
  introPreview?: boolean;
  introOnly?: boolean;
  onProfileUpdate?: (patch: Record<string, any>) => void;
  onBlocksUpdate?: (blocks: InvitationBlock[]) => void;
  onBlockSelect?: (
    block: InvitationBlock | null,
    idx: number,
    textKey?: string,
    textLabel?: string,
  ) => void;
  selectedBlockId?: string;
};

const hexToRgb = (hex: string) => {
  const raw = hex.replace("#", "").trim();
  const full = raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw;
  const int = Number.parseInt(full, 16);
  if (Number.isNaN(int)) return { r: 255, g: 255, b: 255 };
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
};

const isLightHex = (hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000 >= 155;
};

const DISSOLVE_VERTEX = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const DISSOLVE_FRAGMENT = `
  uniform float uProgress;
  uniform vec2  uResolution;
  uniform vec3  uColor;
  uniform float uSpread;
  varying vec2  vUv;

  float Hash(vec2 p) {
    vec3 p2 = vec3(p.xy, 1.0);
    return fract(sin(dot(p2, vec3(37.1, 61.7, 12.4))) * 3758.5453123);
  }
  float noise(in vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    f *= f * (3.0 - 2.0 * f);
    return mix(
      mix(Hash(i + vec2(0.0, 0.0)), Hash(i + vec2(1.0, 0.0)), f.x),
      mix(Hash(i + vec2(0.0, 1.0)), Hash(i + vec2(1.0, 1.0)), f.x), f.y
    );
  }
  float fbm(vec2 p) {
    float v = 0.0;
    v += noise(p * 1.0) * 0.5;
    v += noise(p * 2.0) * 0.25;
    v += noise(p * 4.0) * 0.125;
    return v;
  }
  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    vec2 centeredUv = (uv - 0.5) * vec2(aspect, 1.0);
    float dissolveEdge = uv.y - uProgress * 1.2;
    float noiseValue = fbm(centeredUv * 15.0);
    float d = dissolveEdge + noiseValue * uSpread;
    float px = 1.0 / uResolution.y;
    float alpha = 1.0 - smoothstep(-px, px, d);
    gl_FragColor = vec4(uColor, alpha);
  }
`;

type JungleIntroProps = {
  castleUrl?: string;
  castleUrlMobile?: string;
  childName: string;
  partner2Name?: string;
  subtitle: string;
  welcomeText: string;
  inviteTop?: string;
  inviteMiddle?: string;
  inviteBottom?: string;
  inviteTag?: string;
  dateStr?: string;
  inviteText?: string;
  headerText?: string;
  footerText?: string;
  introTextStyles?: Record<string, TextStyle>;
  themeColors?: { pinkDark: string; pinkL: string; pinkXL: string; gold: string; text?: string; cream?: string };
  onRevealed?: () => void;
};

const MirageStaticIntroPreview: React.FC<{
  imageDesktop?: string;
  imageMobile?: string;
  headerText?: string;
  footerText?: string;
  introTextStyles?: Record<string, TextStyle>;
}> = ({ imageDesktop, imageMobile, headerText, footerText, introTextStyles }) => {
  const isMob = typeof window !== "undefined" && window.innerWidth < 768;
  const img = isMob ? imageMobile || imageDesktop : imageDesktop || imageMobile;
  const defImg =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'%3E%3Crect width='1200' height='800' fill='%231a0a2e'/%3E%3C/svg%3E";
  const introStyleOf = (
    key: "intro:header" | "intro:footer",
  ): React.CSSProperties => {
    const style = introTextStyles?.[key];
    if (!style) return {};
    const out: React.CSSProperties = {};
    if (style.fontFamily != null) out.fontFamily = style.fontFamily;
    if (style.fontSize != null) out.fontSize = `${style.fontSize}px`;
    if (style.fontWeight != null) out.fontWeight = style.fontWeight;
    if (style.fontStyle != null) out.fontStyle = style.fontStyle;
    if (style.letterSpacing != null) out.letterSpacing = `${style.letterSpacing * 0.01}em`;
    if (style.lineHeight != null) out.lineHeight = `${style.lineHeight * 0.01}`;
    if (style.color != null) out.color = style.color;
    if (style.textAlign != null) out.textAlign = style.textAlign;
    return out;
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: isMob ? 520 : 620,
        height: isMob ? "72vh" : "74vh",
        overflow: "hidden",
        background: "#f7f4ee",
      }}
    >
      <img
        src={img || defImg}
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center top",
          display: "block",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(9,7,6,0.12) 0%, rgba(9,7,6,0.18) 34%, rgba(9,7,6,0.14) 62%, rgba(9,7,6,0.34) 100%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: isMob ? 24 : 30,
          left: 0,
          width: "100%",
          padding: isMob ? "0 20px" : "0 32px",
          textAlign: "center",
          color: "#ffffff",
          fontFamily: '"Tangerine", cursive',
          fontSize: isMob ? 50 : 60,
          fontWeight: 700,
          textShadow: "0 6px 18px rgba(0,0,0,0.28)",
          whiteSpace: "normal",
          overflowWrap: "anywhere",
          ...introStyleOf("intro:header"),
        }}
      >
        {headerText || "Save The Date"}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: isMob ? 28 : 30,
          left: 0,
          width: "100%",
          padding: isMob ? "0 20px" : "0 32px",
          textAlign: "center",
          color: "#ffffff",
          fontSize: isMob ? 14 : 13,
          fontWeight: 600,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          textShadow: "0 6px 18px rgba(0,0,0,0.28)",
          whiteSpace: "normal",
          overflowWrap: "anywhere",
          ...introStyleOf("intro:footer"),
        }}
      >
        {footerText || "Data Evenimentului"}
      </div>
    </div>
  );
};

const RevealOnView: React.FC<{
  children: React.ReactNode;
  delay?: number;
  enabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, enabled = true, className, style }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(!enabled);

  useEffect(() => {
    if (!enabled) {
      setVisible(true);
      return;
    }
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      {
        threshold: 0.24,
        rootMargin: "0px 0px -18% 0px",
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(22px) scale(0.985)",
        filter: visible ? "blur(0)" : "blur(12px)",
        transition:
          "opacity 920ms cubic-bezier(0.22, 1, 0.36, 1), transform 920ms cubic-bezier(0.22, 1, 0.36, 1), filter 920ms cubic-bezier(0.22, 1, 0.36, 1)",
        transitionDelay: `${delay}ms`,
        willChange: "opacity, transform, filter",
      }}
    >
      {children}
    </div>
  );
};

const DissolveIntro: React.FC<JungleIntroProps> = ({
  castleUrl,
  castleUrlMobile,
  childName,
  partner2Name,
  subtitle,
  welcomeText,
  inviteTop,
  inviteMiddle,
  inviteBottom,
  inviteTag,
  dateStr,
  inviteText,
  headerText,
  footerText,
  introTextStyles,
  themeColors,
  onRevealed,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<HTMLSpanElement[]>([]);
  const headerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const musicFired = useRef(false);
  const matRef = useRef<THREE.ShaderMaterial | null>(null);

  const tc = themeColors ?? {
    pinkDark: "#be185d",
    pinkL: "#fbcfe8",
    pinkXL: "#fdf2f8",
    gold: "#d4af37",
    text: "#111111",
    cream: "#ffffff",
  };
  const isMob = typeof window !== "undefined" && window.innerWidth < 768;
  const img = isMob ? castleUrlMobile || castleUrl : castleUrl || castleUrlMobile;

  const defImg =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'%3E%3Crect width='1200' height='800' fill='%231a0a2e'/%3E%3C/svg%3E";
  const legacyOverlayText = [inviteTop, inviteMiddle, inviteBottom].filter(Boolean).join(" ").trim();
  const overlayText =
    inviteText === undefined
      ? legacyOverlayText || "Cu bucurie va invitam sa fiti parte din povestea noastra."
      : inviteText.trim();
  const overlayWords = overlayText.split(/\s+/).filter(Boolean);
  const monoDate = dateStr || "Data Evenimentului";
  const resolvedHeaderText = headerText === undefined ? "Save The Date" : headerText;
  const resolvedFooterText = footerText === undefined ? monoDate : footerText;
  const showHeader = resolvedHeaderText.trim().length > 0;
  const showFooter = resolvedFooterText.trim().length > 0;
  const showOverlay = overlayWords.length > 0;
  const introBodyColor =
    typeof tc.text === "string" && tc.text.trim().length > 0 ? tc.text : "#111111";
  const introBodyIsLight = introBodyColor.startsWith("#") ? isLightHex(introBodyColor) : false;
  const introBodyShadow = introBodyIsLight
    ? "0 10px 30px rgba(0,0,0,0.62), 0 2px 10px rgba(0,0,0,0.42)"
    : "0 10px 28px rgba(255,255,255,0.34), 0 2px 10px rgba(0,0,0,0.3)";
  const introStyleOf = (
    key: "intro:header" | "intro:text" | "intro:footer",
  ): React.CSSProperties => {
    const style = introTextStyles?.[key];
    if (!style) return {};
    const out: React.CSSProperties = {};
    if (style.fontFamily != null) out.fontFamily = style.fontFamily;
    if (style.fontSize != null) out.fontSize = `${style.fontSize}px`;
    if (style.fontWeight != null) out.fontWeight = style.fontWeight;
    if (style.fontStyle != null) out.fontStyle = style.fontStyle;
    if (style.letterSpacing != null) out.letterSpacing = `${style.letterSpacing * 0.01}em`;
    if (style.lineHeight != null) out.lineHeight = `${style.lineHeight * 0.01}`;
    if (style.color != null) out.color = style.color;
    if (style.textAlign != null) out.textAlign = style.textAlign;
    return out;
  };
  const headerTextStyle = introStyleOf("intro:header");
  const bodyTextStyle = introStyleOf("intro:text");
  const footerTextStyle = introStyleOf("intro:footer");

  const hexToVec3 = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return new THREE.Vector3(r, g, b);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    ScrollTrigger.config({ ignoreMobileResize: true });
    const applyVH = () => {
      const stableHeight = window.visualViewport?.height || window.innerHeight;
      const vh = stableHeight * 0.01;
      document.documentElement.style.setProperty("--jungle-vh", `${vh}px`);
    };
    const handleOrientation = () => {
      window.setTimeout(() => {
        applyVH();
        ScrollTrigger.refresh();
      }, 120);
    };

    applyVH();
    window.addEventListener("orientationchange", handleOrientation);

    return () => {
      window.removeEventListener("orientationchange", handleOrientation);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = heroRef.current;
    const mediaEl = mediaRef.current;
    if (!canvas || !hero || !mediaEl) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });

    const resize = () => {
      const w = hero.offsetWidth;
      const h = hero.offsetHeight;
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      if (matRef.current) matRef.current.uniforms.uResolution.value.set(w, h);
    };
    resize();
    const handleOrientation = () => {
      window.setTimeout(resize, 120);
    };
    window.addEventListener("orientationchange", handleOrientation);

    const material = new THREE.ShaderMaterial({
      vertexShader: DISSOLVE_VERTEX,
      fragmentShader: DISSOLVE_FRAGMENT,
      uniforms: {
        uProgress: { value: 0.22 },
        uResolution: { value: new THREE.Vector2(hero.offsetWidth, hero.offsetHeight) },
        uColor: { value: hexToVec3(tc.pinkXL) },
        uSpread: { value: 0.62 },
      },
      transparent: true,
    });
    matRef.current = material;
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

    let progress = 0.22;
    let rafId: number;
    const tick = () => {
      material.uniforms.uProgress.value = progress;
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(tick);
    };
    tick();

    const heroTrigger = ScrollTrigger.create({
      trigger: hero,
      start: "top top",
      end: () => `+=${Math.max(hero.offsetHeight - window.innerHeight, 1)}`,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const baseProgress = Math.max(0, Math.min(1, self.progress));
        const boostedProgress = Math.min(1, 0.04 + baseProgress * 1.12);
        progress = Math.min(0.30 + boostedProgress * 0.98, 1.02);
        const textOpacity = baseProgress < 0.58 ? 1 : Math.max(0, 1 - (baseProgress - 0.58) / 0.2);
        if (headerRef.current) headerRef.current.style.opacity = String(textOpacity);
        if (footerRef.current) footerRef.current.style.opacity = String(textOpacity);

        if (!musicFired.current && baseProgress > 0.08) {
          musicFired.current = true;
          onRevealed?.();
        }
      },
    });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("orientationchange", handleOrientation);
      heroTrigger.kill();
      renderer.dispose();
    };
  }, [tc.pinkXL, onRevealed]);

  useEffect(() => {
    const contentEl = contentRef.current;
    const words = wordRefs.current.filter(Boolean);
    if (!showOverlay || !contentEl || words.length === 0) return;

    gsap.set(words, { opacity: 0 });

    const st = ScrollTrigger.create({
      trigger: contentEl,
      start: "top 20%",
      end: "bottom 100%",
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const progress = self.progress;
        const totalWords = words.length;

        words.forEach((word, index) => {
          const wordProgress = index / totalWords;
          const nextWordProgress = (index + 1) / totalWords;

          let opacity = 0;
          if (progress >= nextWordProgress) {
            opacity = 1;
          } else if (progress >= wordProgress) {
            const fadeProgress = (progress - wordProgress) / (nextWordProgress - wordProgress);
            opacity = fadeProgress;
          }

          gsap.to(word, {
            opacity,
            duration: 0.1,
            overwrite: true,
          });
        });
      },
    });

    return () => {
      st.kill();
    };
  }, [overlayText, showOverlay]);

  return (
    <div
      ref={heroRef}
      style={{
        position: "relative",
        width: "100%",
        height: "calc(var(--jungle-vh, 1vh) * 175)",
        overflow: "hidden",
        color: tc.pinkL,
        background: tc.pinkXL,
      }}
    >
      <style>{`@keyframes cm-scroll-hint-bob{0%,100%{transform:translateY(0);opacity:.95}50%{transform:translateY(5px);opacity:1}}`}</style>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "calc(var(--jungle-vh, 1vh) * 100 + 100px)",
          overflow: "hidden",
          zIndex: 0,
        }}
      >
        <div
          ref={mediaRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
          }}
        >
          <img
            src={img || defImg}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
          />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          display: "none",
          top: 0,
          left: 0,
          width: "100%",
          height: "calc((var(--jungle-vh, 1vh) * 100) + 0px)",
          zIndex: 1,
          pointerEvents: "none",
          background: "linear-gradient(180deg, rgba(9,7,6,0.14) 0%, rgba(9,7,6,0.28) 42%, rgba(255,255,255,0.2) 78%, rgba(255,255,255,0.98) 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "calc(var(--jungle-vh, 1vh) * 100 + 100px)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      >
        {showHeader && (
          <div
            ref={headerRef}
            style={{
              position: "fixed",
              top: isMob ? 30 : 34,
              left: 0,
              width: "100%",
              padding: isMob ? "0 20px" : "0 32px",
              fontSize: isMob ? 50 : 60,
              fontWeight: 700,
              color: "#ffffff",
              textAlign: "center",
              whiteSpace: "normal",
              overflowWrap: "anywhere",
              textShadow: "0 6px 18px rgba(0,0,0,0.28)",
              fontFamily: '"Tangerine", cursive',
              opacity: 1,
              transition: "opacity 180ms linear",
              ...headerTextStyle,
            }}
          >
            {resolvedHeaderText}
          </div>
        )}

        {showFooter && (
          <div
            ref={footerRef}
            style={{
              position: "fixed",
              bottom: isMob ? 30 : 30,
              left: 0,
              width: "100%",
              padding: isMob ? "0 20px" : "0 32px",
              fontSize: isMob ? 14 : 13,
              fontWeight: 600,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#ffffff",
              textAlign: "center",
              whiteSpace: "normal",
              overflowWrap: "anywhere",
              textShadow: "0 6px 18px rgba(0,0,0,0.28)",
              opacity: 1,
              transition: "opacity 180ms linear",
              ...footerTextStyle,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "center",
                gap: isMob ? 8 : 10,
              }}
            >
              <span>{resolvedFooterText}</span>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: isMob ? "5px 11px" : "6px 12px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.14)",
                  border: "1px solid rgba(255,255,255,0.45)",
                  boxShadow: "0 8px 22px rgba(0,0,0,0.18)",
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                  fontSize: isMob ? 9 : 10,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#ffffff",
                  lineHeight: 1,
                }}
              >
                <span
                  style={{
                    width: 17,
                    height: 17,
                    borderRadius: 999,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(255,255,255,0.24)",
                    animation: "cm-scroll-hint-bob 1.35s ease-in-out infinite",
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M6 9L12 15L18 9"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span style={{ opacity: 0.98 }}>Scroll Down</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {showOverlay && (
        <div
          ref={contentRef}
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            height: "calc(var(--jungle-vh, 1vh) * 125)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            pointerEvents: "none",
            textAlign: "center",
            zIndex: 4,
          }}
        >
          <h2
            style={{
              width: isMob ? "calc(100% - 4rem)" : "75%",
              margin: 0,
              color: introBodyColor,
              fontFamily: '"Tangerine", cursive',
              fontWeight: 600,
              fontSize: isMob ? "clamp(3.3rem, 11vw, 5.2rem)" : "clamp(4.1rem, 7vw, 7.2rem)",
              lineHeight: 1.08,
              letterSpacing: "0.012em",
              textTransform: "none",
              textShadow: introBodyShadow,
              ...bodyTextStyle,
            }}
          >
            {overlayWords.map((word, index) => (
              <span
                key={`${word}-${index}`}
                ref={(el) => {
                  if (el) wordRefs.current[index] = el;
                }}
                style={{ opacity: 0, display: "inline-block" }}
              >
                {word}
                {index < overlayWords.length - 1 ? "\u00A0" : ""}
              </span>
            ))}
          </h2>
        </div>
      )}

      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 3,
          display: "block",
        }}
      />
    </div>
  );
};

const formatLongDate = (dateStr: string) => {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) {
    return {
      dayName: "SAMBATA",
      dayNum: 22,
      monthName: "AUGUST",
      yearNum: 2026,
    };
  }

  const weekdays = [
    "DUMINICA",
    "LUNI",
    "MARTI",
    "MIERCURI",
    "JOI",
    "VINERI",
    "SAMBATA",
  ];
  const months = [
    "IANUARIE",
    "FEBRUARIE",
    "MARTIE",
    "APRILIE",
    "MAI",
    "IUNIE",
    "IULIE",
    "AUGUST",
    "SEPTEMBRIE",
    "OCTOMBRIE",
    "NOIEMBRIE",
    "DECEMBRIE",
  ];

  return {
    dayName: weekdays[date.getDay()],
    dayNum: date.getDate(),
    monthName: months[date.getMonth()],
    yearNum: date.getFullYear(),
  };
};

const mirageCardStyle = (theme: Palette): React.CSSProperties => ({
  border: `1px solid ${theme.border}`,
  background: `linear-gradient(180deg, ${theme.cardBg} 0%, ${theme.cardBg} 62%, ${theme.secondary} 180%)`,
  borderRadius: 28,
  boxShadow:
    "0 24px 70px rgba(28,25,23,0.08), inset 0 1px 0 rgba(255,255,255,0.72)",
});

const BUTTON_STYLE = (theme: Palette): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  minWidth: 170,
  padding: "14px 22px",
  background: theme.secondary,
  color: theme.headingColor,
  border: `1px solid ${theme.border}`,
  borderRadius: 16,
  fontFamily: APPLE_DISPLAY_FONT,
  fontSize: "0.64rem",
  fontWeight: 700,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  textDecoration: "none",
  boxShadow: "0 10px 24px rgba(28,25,23,0.05)",
});

const BLOCK_TYPES: { type: string; label: string; def: Partial<InvitationBlock> }[] = [
  {
    type: "photo",
    label: "Foto",
    def: {
      imageData: undefined,
      label: "Capitol nou",
      content: "Text peste imagine",
      aspectRatio: "4:3",
      photoClip: "rounded-lg",
      photoMasks: [],
    },
  },
  { type: "text", label: "Text", def: { content: "Scrie un mesaj..." } },
  { type: "title", label: "Titlu", def: { content: "Titlu sectiune" } },
  {
    type: "description",
    label: "Descriere",
    def: { content: "Descriere scurta..." },
  },
  {
    type: "location",
    label: "Locatie",
    def: {
      label: "Locatie reper",
      time: "17:00",
      locationName: "Nume locatie",
      locationAddress: "Adresa",
      wazeLink: "",
    } as any,
  },
  { type: "calendar", label: "Calendar", def: {} },
  {
    type: "countdown",
    label: "Countdown",
    def: { countdownTitle: "Numaratoare inversa" },
  },
  { type: "timeline", label: "Cronologie", def: { sectionTitle: "Programul zilei" } },
  {
    type: "music",
    label: "Muzica",
    def: { musicTitle: "", musicArtist: "", musicType: "none" },
  },
  {
    type: "gift",
    label: "Cadou",
    def: { sectionTitle: "Despre cadouri", content: "", iban: "", ibanName: "" },
  },
  {
    type: "whatsapp",
    label: "WhatsApp",
    def: { label: "Contact WhatsApp", content: "0700000000" },
  },
  { type: "rsvp", label: "RSVP", def: { label: "Confirma acum" } },
  {
    type: "godparents",
    label: "Nasi",
    def: { sectionTitle: "Nasii nostri", content: "" },
  },
  {
    type: "parents",
    label: "Parinti",
    def: { sectionTitle: "Parintii nostri", content: "" },
  },
  {
    type: "family",
    label: "Familie",
    def: {
      label: "Familie",
      content: "Cu drag si recunostinta",
      members: JSON.stringify([{ name1: "Nume 1", name2: "Nume 2" }]),
    },
  },
  { type: "date", label: "Data", def: {} },
  { type: "divider", label: "Divider", def: {} },
  { type: "spacer", label: "Spatiu", def: {} },
];

export default function MirageFloralSimpleFull({
  data,
  onOpenRSVP,
  editMode = false,
  introPreview = false,
  introOnly = false,
  onProfileUpdate,
  onBlocksUpdate,
  onBlockSelect,
  selectedBlockId,
}: MirageFloralProps) {
  const profile = {
    ...CASTLE_DEFAULTS,
    ...data.profile,
  } as UserProfile & Record<string, any>;
  const [globalConfig, setGlobalConfig] = useState<Record<string, any>>({});

  useEffect(() => {
    let cancelled = false;

    const loadGlobalConfig = async () => {
      for (const configId of MIRAGE_CONFIG_CANDIDATES) {
        try {
          const response = await fetch(`${API_URL}/config/template-defaults/${configId}`);
          if (!response.ok) continue;
          const cfg = await response.json();
          if (!cancelled && cfg && typeof cfg === "object") {
            setGlobalConfig(cfg);
            return;
          }
        } catch {}
      }

      if (!cancelled) setGlobalConfig({});
    };

    loadGlobalConfig();

    return () => {
      cancelled = true;
    };
  }, []);

  const cleanAssetUrl = (value: unknown): string | undefined => {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    if (!trimmed || trimmed === "undefined" || trimmed === "null") return undefined;
    return trimmed;
  };

  const profileTheme = typeof profile.colorTheme === "string" ? profile.colorTheme.trim() : "";
  const hasExplicitTheme =
    profileTheme.length > 0 && profileTheme !== "default" && profileTheme !== "undefined";
  const activeColorTheme = hasExplicitTheme
    ? profileTheme
    : cleanAssetUrl(globalConfig.colorTheme) || profileTheme || CASTLE_DEFAULTS.colorTheme;
  const theme = getMirageFloralTheme(activeColorTheme);
  const themeImgs = globalConfig.themeImages?.[activeColorTheme] || {};
  const defaultImgs = globalConfig.themeImages?.default || {};
  const introHeroBgImage =
    cleanAssetUrl(themeImgs.desktop) ||
    cleanAssetUrl(defaultImgs.desktop) ||
    cleanAssetUrl(globalConfig.heroBgImage) ||
    cleanAssetUrl(profile.heroBgImage) ||
    cleanAssetUrl(CASTLE_DEFAULTS.heroBgImage);
  const introHeroBgImageMobile =
    cleanAssetUrl(themeImgs.mobile) ||
    cleanAssetUrl(defaultImgs.mobile) ||
    cleanAssetUrl(globalConfig.heroBgImageMobile) ||
    cleanAssetUrl(profile.heroBgImageMobile) ||
    cleanAssetUrl(CASTLE_DEFAULTS.heroBgImageMobile);

  const [blocks, setBlocks] = useState<InvitationBlock[]>(() => {
    const fromDb = safeJSON<InvitationBlock[] | null>(profile.customSections, null);
    return Array.isArray(fromDb) && fromDb.length ? fromDb : CASTLE_DEFAULT_BLOCKS;
  });
  const [openInsertAt, setOpenInsertAt] = useState<number | null>(null);
  const [godparents, setGodparents] = useState<{ godfather: string; godmother: string }[]>(
    () =>
      safeJSON(profile.godparents, [
        { godfather: "Andreea", godmother: "Radu Dumitrescu" },
      ]),
  );
  const [parentsData, setParentsData] = useState<Record<string, string>>(() =>
    safeJSON(profile.parents, {
      p1_father: "Elena Ionescu",
      p1_mother: "Dumitru Ionescu",
      p2_father: "Constanta Popescu",
      p2_mother: "Vasile Popescu",
    }),
  );
  const [isPlayingHero, setIsPlayingHero] = useState(false);
  const [showIntro, setShowIntro] = useState(
    !editMode && !introPreview && !introOnly && !(data.project as any)?.previewMode,
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fromDb = safeJSON<InvitationBlock[] | null>(profile.customSections, null);
    setBlocks(Array.isArray(fromDb) && fromDb.length ? fromDb : CASTLE_DEFAULT_BLOCKS);
  }, [profile.customSections]);

  useEffect(() => {
    setGodparents(
      safeJSON(profile.godparents, [
        { godfather: "Andreea", godmother: "Radu Dumitrescu" },
      ]),
    );
  }, [profile.godparents]);

  useEffect(() => {
    setParentsData(
      safeJSON(profile.parents, {
        p1_father: "Elena Ionescu",
        p1_mother: "Dumitru Ionescu",
        p2_father: "Constanta Popescu",
        p2_mother: "Vasile Popescu",
      }),
    );
  }, [profile.parents]);

  useEffect(() => {
    setShowIntro(!editMode && !introPreview && !introOnly && !(data.project as any)?.previewMode);
  }, [editMode, introPreview, introOnly, data.project]);

  const countdown = useCountdown(profile.weddingDate || "");

  const profileQueue = useRef<Record<string, any>>({});
  const profileTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blocksTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const upProfile = useCallback(
    (field: string, value: any) => {
      profileQueue.current = { ...profileQueue.current, [field]: value };
      if (profileTimer.current) clearTimeout(profileTimer.current);
      profileTimer.current = setTimeout(() => {
        onProfileUpdate?.(profileQueue.current);
        profileQueue.current = {};
      }, 350);
    },
    [onProfileUpdate],
  );

  const debouncedBlocksSave = useCallback(
    (nextBlocks: InvitationBlock[]) => {
      if (blocksTimer.current) clearTimeout(blocksTimer.current);
      blocksTimer.current = setTimeout(() => onBlocksUpdate?.(nextBlocks), 350);
    },
    [onBlocksUpdate],
  );

  const updBlock = useCallback(
    (idx: number, patch: Partial<InvitationBlock>) => {
      setBlocks((prev) => {
        const next = prev.map((block, index) => (index === idx ? { ...block, ...patch } : block));
        debouncedBlocksSave(next);
        return next;
      });
    },
    [debouncedBlocksSave],
  );

  const movBlock = useCallback(
    (idx: number, dir: -1 | 1) => {
      setBlocks((prev) => {
        const next = [...prev];
        const to = idx + dir;
        if (to < 0 || to >= next.length) return prev;
        [next[idx], next[to]] = [next[to], next[idx]];
        onBlocksUpdate?.(next);
        return next;
      });
    },
    [onBlocksUpdate],
  );

  const delBlock = useCallback(
    (idx: number) => {
      setBlocks((prev) => {
        const next = prev.filter((_, index) => index !== idx);
        onBlocksUpdate?.(next);
        return next;
      });
    },
    [onBlocksUpdate],
  );

  const addBlockAt = useCallback(
    (afterIdx: number, type: string, def: any) => {
      setBlocks((prev) => {
        const next = [...prev];
        next.splice(afterIdx + 1, 0, {
          id: `${type}-${Date.now()}`,
          type: type as InvitationBlockType,
          show: true,
          ...def,
        });
        onBlocksUpdate?.(next);
        return next;
      });
    },
    [onBlocksUpdate],
  );

  const updGodparent = (index: number, field: "godfather" | "godmother", value: string) => {
    setGodparents((prev) => {
      const next = prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      );
      upProfile("godparents", JSON.stringify(next));
      return next;
    });
  };

  const addGodparent = () =>
    setGodparents((prev) => {
      const next = [...prev, { godfather: "", godmother: "" }];
      upProfile("godparents", JSON.stringify(next));
      return next;
    });

  const delGodparent = (index: number) =>
    setGodparents((prev) => {
      const next = prev.filter((_, itemIndex) => itemIndex !== index);
      upProfile("godparents", JSON.stringify(next));
      return next;
    });

  const updParent = (field: string, value: string) =>
    setParentsData((prev) => {
      const next = { ...prev, [field]: value };
      upProfile("parents", JSON.stringify(next));
      return next;
    });

  const timeline = safeJSON<any[]>(profile.timeline, []);

  const updateTimelineItem = (id: string, patch: Record<string, any>) => {
    const next = timeline.map((item) => (item.id === id ? { ...item, ...patch } : item));
    upProfile("timeline", JSON.stringify(next));
  };

  const addTimelineItem = () => {
    const next = [
      ...timeline,
      {
        id: `timeline-${Date.now()}`,
        time: "20:00",
        title: "Moment nou",
        description: "Descriere moment",
      },
    ];
    upProfile("timeline", JSON.stringify(next));
  };

  const delTimelineItem = (id: string) => {
    upProfile(
      "timeline",
      JSON.stringify(timeline.filter((item) => item.id !== id)),
    );
  };

  const handleInsertAt = (afterIdx: number, type: string, def: any) => {
    if (type === "timeline" && (!timeline.length || timeline.every((item) => !item?.title))) {
      upProfile("timeline", JSON.stringify(DEFAULT_TIMELINE_ITEMS));
    }
    addBlockAt(afterIdx, type, def);
    setOpenInsertAt(null);
  };

  const dateObject = formatLongDate(profile.weddingDate || "2026-08-22");
  const guestName = data.isPublic ? "Drag invitat" : data.guest?.name || "Invitat Exemplu";
  const displayBlocks = editMode ? blocks : blocks.filter((block) => block.show !== false);
  const hasRsvpBlock = blocks.some((block) => block.type === "rsvp" && (editMode || block.show !== false));
  const railName = `${profile.partner1Name || "Maria"} & ${profile.partner2Name || "Alexandru"}`;
  const introDateText = `${dateObject.dayNum} ${dateObject.monthName} ${dateObject.yearNum}`;
  const introHeaderText = profile.jungleHeaderText?.trim() || "Save The Date";
  const introFooterText = profile.jungleFooterText?.trim() || introDateText;
  const heroInitial1 = (profile.partner1Name || "M").trim().charAt(0).toUpperCase() || "M";
  const heroInitial2 = (profile.partner2Name || "A").trim().charAt(0).toUpperCase() || "A";
  const leadingPhotoBlocks = (() => {
    const result: InvitationBlock[] = [];
    for (const block of displayBlocks) {
      if (block.type !== "photo") break;
      result.push(block);
    }
    return result;
  })();
  const remainingBlocks = displayBlocks.slice(leadingPhotoBlocks.length);

  const toggleHeroAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlayingHero) {
      audio.pause();
      setIsPlayingHero(false);
      return;
    }
    audio.play().then(() => setIsPlayingHero(true)).catch(() => {});
  };

  const renderLocationButtons = (block: InvitationBlock, realIdx: number) => {
    const mapsQuery = `${block.locationName || ""} ${block.locationAddress || ""}`.trim();
    const mapsHref = mapsQuery
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`
      : "";
    const wazeHref = (block.wazeLink || "").trim();

    return (
      <>
        {(wazeHref || mapsHref) && (
          <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
            {wazeHref && (
              <a href={wazeHref} target="_blank" rel="noopener noreferrer" style={BUTTON_STYLE(theme)}>
                <Navigation className="w-4 h-4" />
                Waze
              </a>
            )}
            {mapsHref && (
              <a href={mapsHref} target="_blank" rel="noopener noreferrer" style={BUTTON_STYLE(theme)}>
                <MapPin className="w-4 h-4" />
                Maps
              </a>
            )}
          </div>
        )}
        {editMode && (
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
            <InlineWaze
              value={block.wazeLink || ""}
              onChange={(v) => updBlock(realIdx, { wazeLink: v })}
              editMode={editMode}
            />
          </div>
        )}
      </>
    );
  };

  const renderPhotoGalleryCard = (
    block: InvitationBlock,
    coverHeight: string,
    insertBelow = true,
  ) => {
    const isVisible = block.show !== false;
    const realIdx = blocks.indexOf(block);
    const isSelected = selectedBlockId === block.id;

    return (
      <div key={block.id} className="group/insert">
        <div
          className={cn("relative group/block", !isVisible && editMode && "opacity-35")}
          onClick={editMode ? () => onBlockSelect?.(block, realIdx) : undefined}
        >
          {editMode && (
            <BlockToolbar
              onUp={() => movBlock(realIdx, -1)}
              onDown={() => movBlock(realIdx, 1)}
              onToggle={() => updBlock(realIdx, { show: !isVisible })}
              onDelete={() => delBlock(realIdx)}
              visible={isVisible}
              isFirst={realIdx === 0}
              isLast={realIdx === blocks.length - 1}
            />
          )}
          {editMode && isSelected && (
            <div
              className="pointer-events-none absolute inset-0 z-20 rounded-[30px]"
              style={{ boxShadow: `inset 0 0 0 1px ${theme.accent}` }}
            />
          )}
          <BlockStyleProvider
            value={
              {
                blockId: block.id,
                textStyles: block.textStyles,
                onTextSelect: (textKey, textLabel) =>
                  onBlockSelect?.(block, realIdx, textKey, textLabel),
                fontFamily: block.blockFontFamily,
                fontSize: block.blockFontSize,
                fontWeight: block.blockFontWeight,
                fontStyle: block.blockFontStyle,
                letterSpacing: block.blockLetterSpacing,
                lineHeight: block.blockLineHeight,
                textColor:
                  block.textColor && block.textColor !== "transparent"
                    ? block.textColor
                    : undefined,
                textAlign: block.blockAlign,
              } as BlockStyle
            }
          >
            <PhotoBlock
              block={block}
              editMode={editMode}
              onUpdate={(patch) => updBlock(realIdx, patch)}
              placeholderInitial1={profile.partner1Name?.[0] || "M"}
              theme={theme}
              coverHeight={coverHeight}
            />
          </BlockStyleProvider>
        </div>
        {editMode && insertBelow && (
          <InsertBlockButton
            insertIdx={realIdx}
            openInsertAt={openInsertAt}
            setOpenInsertAt={setOpenInsertAt}
            blockTypes={BLOCK_TYPES}
            onInsert={(type, def) => handleInsertAt(realIdx, type, def)}
            theme={theme}
          />
        )}
      </div>
    );
  };

  if (introOnly) {
    return (
      <MirageStaticIntroPreview
        imageDesktop={introHeroBgImage}
        imageMobile={introHeroBgImageMobile}
        headerText={introHeaderText}
        footerText={introFooterText}
        introTextStyles={(profile as any).introTextStyles}
      />
    );
  }

  return (
    <>
      {showIntro && (
        <DissolveIntro
          castleUrl={introHeroBgImage}
          castleUrlMobile={introHeroBgImageMobile}
          childName={profile.partner1Name || "Maria"}
          partner2Name={profile.partner2Name || "Alexandru"}
          subtitle=""
          welcomeText=""
          inviteTop={undefined}
          inviteMiddle={undefined}
          inviteBottom={undefined}
          inviteTag={undefined}
          dateStr={introDateText}
          inviteText=""
          headerText={introHeaderText}
          footerText={introFooterText}
          introTextStyles={(profile as any).introTextStyles}
          themeColors={{
            pinkDark: theme.primary,
            pinkL: theme.secondary,
            pinkXL: theme.background,
            gold: theme.accent,
            text: theme.headingColor,
            cream: theme.cardBg,
          }}
          onRevealed={() => {}}
        />
      )}
      <div
        className="min-h-screen w-full overflow-x-hidden px-4 pb-24 pt-12 md:px-10"
        style={{
          background: theme.background,
          color: theme.textColor,
          fontFamily: APPLE_DISPLAY_FONT,
          marginTop: showIntro ? "calc(var(--jungle-vh, 1vh) * -64 - 30px)" : undefined,
          paddingTop: showIntro ? "calc(var(--jungle-vh, 1vh) * 4)" : undefined,
          position: "relative",
          zIndex: 5,
        }}
      >
      {profile.audioUrl ? <audio ref={audioRef} src={profile.audioUrl} loop /> : null}

      {editMode && (
        <div className="fixed left-1/2 top-3 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/95 px-4 py-1.5 text-[10px] font-bold shadow-lg pointer-events-none">
          <span
            className="block h-1.5 w-1.5 rounded-full animate-pulse"
            style={{ background: theme.accent }}
          />
          <span className="uppercase tracking-[0.24em]" style={{ color: theme.headingColor }}>
            Editare directa
          </span>
          <span style={{ color: `${theme.textColor}aa`, fontWeight: 500 }}>
            click pe text sau bloc
          </span>
        </div>
      )}

      <RevealOnView
        enabled={!editMode}
        delay={60}
        className="mx-auto mb-10 flex w-full max-w-4xl items-center justify-between border-b px-2 pb-6"
        style={{ borderColor: theme.border }}
      >
        <span
          className="block text-[10px] font-bold tracking-[0.4em]"
          style={{ color: theme.headingColor }}
        >
          {railName.toUpperCase()}
        </span>
        {profile.audioUrl ? (
          <button
            type="button"
            onClick={toggleHeroAudio}
            className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest transition-opacity hover:opacity-75"
            style={{ color: theme.accent }}
          >
            {isPlayingHero ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
            {isPlayingHero ? "Audio pornit" : "Reda sunet"}
          </button>
        ) : null}
      </RevealOnView>

      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <RevealOnView enabled={!editMode} delay={140}>
        <div style={{ ...mirageCardStyle(theme), padding: "28px 24px" }}>
          <div className="relative">
            <InlineEdit
              tag="span"
              editMode={editMode}
              value={profile.heroLabel?.trim() || "The Marriage Of"}
              onChange={(value) => upProfile("heroLabel", value)}
              placeholder="Eticheta hero"
              style={{
                display: "block",
                marginBottom: 10,
                fontFamily: APPLE_DISPLAY_FONT,
                fontSize: "0.62rem",
                fontWeight: 700,
                letterSpacing: "0.45em",
                textTransform: "uppercase",
                color: `${theme.textColor}88`,
              }}
            />

            <div className="relative mb-6 min-h-[170px] select-text">
              <span
                className="absolute -left-3 -top-7 z-0 font-serif text-[6.5rem] font-light italic leading-none tracking-tighter opacity-10"
                style={{ color: theme.primary, fontFamily: EDITORIAL_SERIF }}
              >
                {heroInitial1}
              </span>
              <span
                className="absolute left-6 top-14 z-0 font-serif text-[5.6rem] font-light italic leading-none tracking-tighter opacity-[0.08]"
                style={{ color: theme.accent, fontFamily: EDITORIAL_SERIF }}
              >
                {heroInitial2}
              </span>

              <div className="relative z-10 flex flex-col leading-none">
                <InlineEdit
                  tag="span"
                  editMode={editMode}
                  value={profile.partner1Name || ""}
                  onChange={(value) => upProfile("partner1Name", value)}
                  placeholder="Partener 1"
                  textKey="mirage:hero:partner1"
                  textLabel="Hero - Partener 1"
                  style={{
                    display: "block",
                    fontFamily: EDITORIAL_SERIF,
                    fontSize: "clamp(3rem, 12vw, 4.6rem)",
                    fontWeight: 300,
                    letterSpacing: "-0.05em",
                    color: theme.headingColor,
                  }}
                />
                <span
                  className="my-2 pl-12 text-4xl italic"
                  style={{ color: `${theme.textColor}88`, fontFamily: EDITORIAL_SERIF }}
                >
                  &
                </span>
                <InlineEdit
                  tag="span"
                  editMode={editMode}
                  value={profile.partner2Name || ""}
                  onChange={(value) => upProfile("partner2Name", value)}
                  placeholder="Partener 2"
                  textKey="mirage:hero:partner2"
                  textLabel="Hero - Partener 2"
                  style={{
                    display: "block",
                    paddingLeft: 28,
                    fontFamily: EDITORIAL_SERIF,
                    fontSize: "clamp(3rem, 12vw, 4.6rem)",
                    fontWeight: 300,
                    letterSpacing: "-0.05em",
                    color: theme.headingColor,
                  }}
                />
              </div>
            </div>

            <div className="h-px w-24" style={{ background: theme.accent }} />
          </div>

          <div className="mt-8 flex flex-col gap-4">
            <InlineEdit
              tag="p"
              editMode={editMode}
              value={profile.welcomeText?.trim() || ""}
              onChange={(value) => upProfile("welcomeText", value)}
              placeholder="Text introductiv"
              textKey="mirage:hero:intro"
              textLabel="Hero - Intro"
              style={{
                fontSize: "0.95rem",
                fontWeight: 300,
                lineHeight: 1.7,
                color: theme.textColor,
              }}
              multiline
            />

            <div
              style={{
                borderLeft: `1px solid ${theme.border}`,
                paddingLeft: 14,
                paddingTop: 6,
                paddingBottom: 6,
              }}
            >
              <InlineEdit
                tag="span"
                editMode={editMode}
                value={profile.heroDateLabel?.trim() || "Save the date"}
                onChange={(value) => upProfile("heroDateLabel", value)}
                placeholder="Eticheta data"
                style={{
                  display: "block",
                  marginBottom: 6,
                  fontFamily: APPLE_DISPLAY_FONT,
                  fontSize: "0.56rem",
                  fontWeight: 700,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: `${theme.textColor}88`,
                }}
              />
              <span
                style={{
                  display: "block",
                  fontFamily: EDITORIAL_SERIF,
                  fontSize: "1rem",
                  color: theme.headingColor,
                }}
              >
                {dateObject.dayNum} {dateObject.monthName} {dateObject.yearNum}
              </span>
              <InlineEdit
                tag="span"
                editMode={editMode}
                value={`${profile.locationName || ""}, ${profile.locationAddress || ""}`}
                onChange={(value) => {
                  const [name, ...rest] = value.split(",");
                  upProfile("locationName", (name || "").trim());
                  upProfile("locationAddress", rest.join(",").trim());
                }}
                placeholder="Locatia principala"
                style={{
                  display: "block",
                  marginTop: 4,
                  fontSize: "0.82rem",
                  fontWeight: 300,
                  color: theme.textColor,
                }}
              />
            </div>

            <div
              style={{
                ...mirageCardStyle(theme),
                background: theme.secondary,
                padding: "14px 18px",
              }}
            >
              <p
                style={{
                  fontFamily: APPLE_DISPLAY_FONT,
                  fontSize: "0.52rem",
                  fontWeight: 700,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: `${theme.textColor}88`,
                  marginBottom: 6,
                }}
              >
                Invitat
              </p>
              <p
                style={{
                  fontFamily: EDITORIAL_SERIF,
                  fontSize: "1.25rem",
                  color: theme.headingColor,
                }}
              >
                {guestName}
              </p>
            </div>
          </div>
        </div>
        </RevealOnView>

        {editMode && (
          <InsertBlockButton
            insertIdx={-1}
            openInsertAt={openInsertAt}
            setOpenInsertAt={setOpenInsertAt}
            blockTypes={BLOCK_TYPES}
            onInsert={(type, def) => handleInsertAt(-1, type, def)}
            theme={theme}
          />
        )}

        {leadingPhotoBlocks.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="px-1">
              <span
                className="block text-[9px] font-bold uppercase tracking-[0.3em] text-[#8e8e93]"
                style={{ color: `${theme.textColor}88` }}
              >
                Galerie foto • secvente de dragoste
              </span>
            </div>

            {leadingPhotoBlocks.length === 1 ? (
              <div className="max-w-3xl">
                {renderPhotoGalleryCard(
                  leadingPhotoBlocks[0],
                  "clamp(300px, 56vw, 430px)",
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.45fr_0.95fr]">
                <div>
                  {renderPhotoGalleryCard(
                    leadingPhotoBlocks[0],
                    "clamp(320px, 60vw, 430px)",
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {leadingPhotoBlocks[1] &&
                    renderPhotoGalleryCard(
                      leadingPhotoBlocks[1],
                      "clamp(180px, 28vw, 205px)",
                    )}
                  {leadingPhotoBlocks[2] &&
                    renderPhotoGalleryCard(
                      leadingPhotoBlocks[2],
                      "clamp(180px, 28vw, 205px)",
                    )}
                </div>
              </div>
            )}

            {leadingPhotoBlocks.length > 3 && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {leadingPhotoBlocks.slice(3).map((block) =>
                  renderPhotoGalleryCard(
                    block,
                    "clamp(220px, 34vw, 280px)",
                  ),
                )}
              </div>
            )}
          </div>
        )}

        <div className="mx-auto flex w-full max-w-xl flex-col gap-8">
          {remainingBlocks.map((block) => {
            const isVisible = block.show !== false;
            const realIdx = blocks.indexOf(block);
            const isSelected = selectedBlockId === block.id;

            return (
              <RevealOnView
                key={block.id}
                enabled={!editMode}
                delay={120 + Math.min(realIdx, 8) * 55}
                className="group/insert"
              >
                <div
                  className={cn(
                    "relative group/block",
                    !isVisible && editMode && "opacity-35",
                  )}
                  onClick={editMode ? () => onBlockSelect?.(block, realIdx) : undefined}
                >
                  {editMode && (
                    <BlockToolbar
                      onUp={() => movBlock(realIdx, -1)}
                      onDown={() => movBlock(realIdx, 1)}
                      onToggle={() => updBlock(realIdx, { show: !isVisible })}
                      onDelete={() => delBlock(realIdx)}
                      visible={isVisible}
                      isFirst={realIdx === 0}
                      isLast={realIdx === blocks.length - 1}
                    />
                  )}

                  {editMode && isSelected && (
                    <div
                      className="pointer-events-none absolute inset-0 z-20 rounded-[30px]"
                      style={{ boxShadow: `inset 0 0 0 1px ${theme.accent}` }}
                    />
                  )}

                  <BlockStyleProvider
                    value={
                      {
                        blockId: block.id,
                        textStyles: block.textStyles,
                        onTextSelect: (textKey, textLabel) =>
                          onBlockSelect?.(block, realIdx, textKey, textLabel),
                        fontFamily: block.blockFontFamily,
                        fontSize: block.blockFontSize,
                        fontWeight: block.blockFontWeight,
                        fontStyle: block.blockFontStyle,
                        letterSpacing: block.blockLetterSpacing,
                        lineHeight: block.blockLineHeight,
                        textColor:
                          block.textColor && block.textColor !== "transparent"
                            ? block.textColor
                            : undefined,
                        textAlign: block.blockAlign,
                      } as BlockStyle
                    }
                  >
                    {block.type === "photo" && (
                      <PhotoBlock
                        block={block}
                        editMode={editMode}
                        onUpdate={(patch) => updBlock(realIdx, patch)}
                        placeholderInitial1={profile.partner1Name?.[0] || "M"}
                        theme={theme}
                        coverHeight="clamp(260px, 54vw, 380px)"
                      />
                    )}

                    {block.type === "title" && (
                      <div style={{ ...mirageCardStyle(theme), padding: "22px 24px", textAlign: "center" }}>
                        <InlineEdit
                          tag="p"
                          editMode={editMode}
                          value={block.content || ""}
                          onChange={(v) => updBlock(realIdx, { content: v })}
                          placeholder="Titlu sectiune..."
                          textKey={`${block.id}:title-content`}
                          textLabel="Titlu bloc"
                          style={{
                            fontFamily: APPLE_DISPLAY_FONT,
                            fontSize: "0.62rem",
                            fontWeight: 700,
                            letterSpacing: "0.34em",
                            textTransform: "uppercase",
                            color: theme.headingColor,
                          }}
                        />
                      </div>
                    )}

                    {block.type === "text" && (
                      <div style={{ ...mirageCardStyle(theme), padding: "22px 24px", textAlign: "center" }}>
                        <InlineEdit
                          tag="p"
                          editMode={editMode}
                          value={block.content || ""}
                          onChange={(v) => updBlock(realIdx, { content: v })}
                          placeholder="Scrie un mesaj..."
                          textKey={`${block.id}:text-content`}
                          textLabel="Text - Continut"
                          style={{
                            fontFamily: EDITORIAL_SERIF,
                            fontSize: "1.02rem",
                            fontStyle: "italic",
                            color: theme.textColor,
                            lineHeight: 1.8,
                          }}
                          multiline
                        />
                      </div>
                    )}

                    {block.type === "description" && (
                      <div style={{ ...mirageCardStyle(theme), padding: "18px 22px" }}>
                        <InlineEdit
                          tag="p"
                          editMode={editMode}
                          value={block.content || ""}
                          onChange={(v) => updBlock(realIdx, { content: v })}
                          placeholder="Descriere..."
                          textKey={`${block.id}:description-content`}
                          textLabel="Descriere bloc"
                          style={{
                            fontFamily: APPLE_DISPLAY_FONT,
                            fontSize: "0.86rem",
                            color: theme.textColor,
                            lineHeight: 1.7,
                          }}
                          multiline
                        />
                      </div>
                    )}

                    {block.type === "date" && (
                      <div style={{ ...mirageCardStyle(theme), padding: "18px 24px", textAlign: "center" }}>
                        <p
                          style={{
                            fontFamily: APPLE_DISPLAY_FONT,
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            letterSpacing: "0.22em",
                            textTransform: "uppercase",
                            color: theme.headingColor,
                          }}
                        >
                          {dateObject.dayName}, {dateObject.dayNum} {dateObject.monthName} {dateObject.yearNum}
                        </p>
                      </div>
                    )}

                    {block.type === "calendar" && (
                      <div style={{ ...mirageCardStyle(theme), padding: 16 }}>
                        <CalendarMonth date={profile.weddingDate} theme={theme} />
                      </div>
                    )}

                    {block.type === "countdown" && (
                      <div style={{ ...mirageCardStyle(theme), padding: "24px 22px" }}>
                        <InlineEdit
                          tag="p"
                          editMode={editMode}
                          value={block.countdownTitle || profile.heroCountdownText || "Numaratoare inversa"}
                          onChange={(v) => updBlock(realIdx, { countdownTitle: v })}
                          textKey={`${block.id}:countdown-title`}
                          textLabel="Countdown - Titlu"
                          style={{
                            marginBottom: 18,
                            textAlign: "center",
                            fontFamily: APPLE_DISPLAY_FONT,
                            fontSize: "0.56rem",
                            fontWeight: 700,
                            letterSpacing: "0.26em",
                            textTransform: "uppercase",
                            color: `${theme.textColor}99`,
                          }}
                        />
                        <div className="grid grid-cols-4 gap-2 text-center">
                          {[
                            { label: "zile", value: countdown.days },
                            { label: "ore", value: countdown.hours },
                            { label: "min", value: countdown.minutes },
                            { label: "sec", value: countdown.seconds },
                          ].map((item) => (
                            <div
                              key={item.label}
                              style={{
                                border: `1px solid ${theme.border}`,
                                background: theme.secondary,
                                borderRadius: 18,
                                padding: "14px 8px",
                              }}
                            >
                              <span
                                style={{
                                  display: "block",
                                  fontFamily: EDITORIAL_SERIF,
                                  fontSize: "1.7rem",
                                  fontWeight: 300,
                                  color: theme.headingColor,
                                }}
                              >
                                {String(item.value).padStart(2, "0")}
                              </span>
                              <span
                                style={{
                                  fontFamily: APPLE_DISPLAY_FONT,
                                  fontSize: "0.5rem",
                                  fontWeight: 700,
                                  letterSpacing: "0.18em",
                                  textTransform: "uppercase",
                                  color: `${theme.textColor}88`,
                                }}
                              >
                                {item.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {block.type === "timeline" && (
                      <div style={{ ...mirageCardStyle(theme), padding: "24px 24px" }}>
                        <InlineEdit
                          tag="p"
                          editMode={editMode}
                          value={block.sectionTitle || "Programul zilei"}
                          onChange={(v) => updBlock(realIdx, { sectionTitle: v })}
                          textKey={`${block.id}:timeline-title`}
                          textLabel="Cronologie - Titlu"
                          style={{
                            marginBottom: 14,
                            textAlign: "center",
                            fontFamily: APPLE_DISPLAY_FONT,
                            fontSize: "0.58rem",
                            fontWeight: 700,
                            letterSpacing: "0.28em",
                            textTransform: "uppercase",
                            color: `${theme.textColor}99`,
                          }}
                        />
                        <div className="space-y-6">
                          {timeline.map((item) => (
                            <div
                              key={item.id}
                              className="relative ml-2 flex items-start gap-4 border-l pl-4"
                              style={{ borderColor: theme.border }}
                            >
                              <span
                                className="absolute -left-[4px] top-1.5 h-1.5 w-1.5 rounded-full"
                                style={{ backgroundColor: theme.accent }}
                              />
                              <InlineTime
                                value={item.time || ""}
                                onChange={(v) => updateTimelineItem(item.id, { time: v })}
                                editMode={editMode}
                                textKey={`timeline:${item.id}:time`}
                                textLabel="Cronologie - Ora"
                                style={{
                                  fontFamily: APPLE_DISPLAY_FONT,
                                  fontSize: "0.72rem",
                                  fontWeight: 700,
                                  color: theme.accent,
                                }}
                              />
                              <div style={{ flex: 1 }}>
                                <InlineEdit
                                  tag="p"
                                  editMode={editMode}
                                  value={item.title || ""}
                                  onChange={(v) => updateTimelineItem(item.id, { title: v })}
                                  textKey={`timeline:${item.id}:title`}
                                  textLabel="Cronologie - Titlu"
                                  style={{
                                    fontFamily: APPLE_DISPLAY_FONT,
                                    fontSize: "0.84rem",
                                    fontWeight: 700,
                                    color: theme.headingColor,
                                  }}
                                />
                                <InlineEdit
                                  tag="p"
                                  editMode={editMode}
                                  value={item.description || ""}
                                  onChange={(v) =>
                                    updateTimelineItem(item.id, { description: v })
                                  }
                                  textKey={`timeline:${item.id}:description`}
                                  textLabel="Cronologie - Descriere"
                                  style={{
                                    marginTop: 4,
                                    fontFamily: APPLE_DISPLAY_FONT,
                                    fontSize: "0.76rem",
                                    color: `${theme.textColor}bb`,
                                    lineHeight: 1.6,
                                  }}
                                  multiline
                                />
                              </div>
                              {editMode && (
                                <button
                                  type="button"
                                  onClick={() => delTimelineItem(item.id)}
                                  className="rounded-full p-1 transition-colors hover:bg-red-50"
                                >
                                  <Trash2 className="w-3 h-3 text-red-400" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        {editMode && (
                          <button
                            type="button"
                            onClick={addTimelineItem}
                            style={{
                              marginTop: 18,
                              border: `1px dashed ${theme.border}`,
                              color: theme.headingColor,
                              background: "transparent",
                              padding: "6px 14px",
                              borderRadius: 999,
                              cursor: "pointer",
                              fontFamily: APPLE_DISPLAY_FONT,
                              fontSize: "0.58rem",
                              fontWeight: 700,
                              letterSpacing: "0.18em",
                              textTransform: "uppercase",
                            }}
                          >
                            + Adauga moment
                          </button>
                        )}
                      </div>
                    )}

                    {block.type === "location" && (
                      <div style={{ ...mirageCardStyle(theme), padding: "24px 22px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 10,
                            marginBottom: 12,
                          }}
                        >
                          <InlineEdit
                            tag="p"
                            editMode={editMode}
                            value={block.label || ""}
                            onChange={(v) => updBlock(realIdx, { label: v })}
                            placeholder="Titlu locatie..."
                            textKey={`${block.id}:location-label`}
                            textLabel="Locatie - Label"
                            style={{
                              fontFamily: APPLE_DISPLAY_FONT,
                              fontSize: "0.58rem",
                              fontWeight: 700,
                              letterSpacing: "0.28em",
                              textTransform: "uppercase",
                              color: `${theme.textColor}99`,
                            }}
                          />
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              border: `1px solid ${theme.border}`,
                              padding: "6px 10px",
                              borderRadius: 999,
                              background: theme.secondary,
                            }}
                          >
                            <Clock className="w-3 h-3" style={{ color: theme.accent }} />
                            <InlineTime
                              value={block.time || ""}
                              onChange={(v) => updBlock(realIdx, { time: v })}
                              editMode={editMode}
                              textKey={`${block.id}:location-time`}
                              textLabel="Locatie - Ora"
                              style={{
                                fontFamily: APPLE_DISPLAY_FONT,
                                fontSize: "0.72rem",
                                fontWeight: 700,
                                color: theme.headingColor,
                              }}
                            />
                          </div>
                        </div>
                        <InlineEdit
                          tag="p"
                          editMode={editMode}
                          value={block.locationName || ""}
                          onChange={(v) => updBlock(realIdx, { locationName: v })}
                          placeholder="Numele locatiei..."
                          textKey={`${block.id}:location-name`}
                          textLabel="Locatie - Nume"
                          style={{
                            fontFamily: EDITORIAL_SERIF,
                            fontSize: "1.2rem",
                            color: theme.headingColor,
                            marginBottom: 4,
                          }}
                        />
                        <InlineEdit
                          tag="p"
                          editMode={editMode}
                          value={block.locationAddress || ""}
                          onChange={(v) => updBlock(realIdx, { locationAddress: v })}
                          placeholder="Adresa..."
                          textKey={`${block.id}:location-address`}
                          textLabel="Locatie - Adresa"
                          style={{
                            fontFamily: APPLE_DISPLAY_FONT,
                            fontSize: "0.78rem",
                            color: `${theme.textColor}bb`,
                            lineHeight: 1.6,
                          }}
                          multiline
                        />
                        {renderLocationButtons(block, realIdx)}
                      </div>
                    )}

                    {block.type === "gift" && (
                      <div style={{ ...mirageCardStyle(theme), padding: "24px 22px", textAlign: "center" }}>
                        <Gift className="w-6 h-6 mx-auto mb-3" style={{ color: theme.accent }} />
                        <InlineEdit
                          tag="h3"
                          editMode={editMode}
                          value={block.sectionTitle || "Despre cadouri"}
                          onChange={(v) => updBlock(realIdx, { sectionTitle: v })}
                          textKey={`${block.id}:gift-title`}
                          textLabel="Cadou - Titlu"
                          style={{
                            fontFamily: APPLE_DISPLAY_FONT,
                            fontSize: "0.95rem",
                            fontWeight: 700,
                            color: theme.headingColor,
                            marginBottom: 8,
                          }}
                        />
                        <InlineEdit
                          tag="p"
                          editMode={editMode}
                          value={block.content || ""}
                          onChange={(v) => updBlock(realIdx, { content: v })}
                          textKey={`${block.id}:gift-content`}
                          textLabel="Cadou - Text"
                          style={{
                            fontFamily: EDITORIAL_SERIF,
                            fontSize: "0.95rem",
                            fontStyle: "italic",
                            color: theme.textColor,
                            marginBottom: 12,
                            lineHeight: 1.8,
                          }}
                          multiline
                        />
                        {(block.iban || editMode) && (
                          <InlineEdit
                            tag="p"
                            editMode={editMode}
                            value={block.iban || ""}
                            onChange={(v) => updBlock(realIdx, { iban: v })}
                            placeholder="IBAN..."
                            textKey={`${block.id}:gift-iban`}
                            textLabel="Cadou - IBAN"
                            style={{
                              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                              fontSize: "0.74rem",
                              fontWeight: 700,
                              color: theme.headingColor,
                              marginBottom: 6,
                            }}
                          />
                        )}
                        {(block.ibanName || editMode) && (
                          <InlineEdit
                            tag="p"
                            editMode={editMode}
                            value={block.ibanName || ""}
                            onChange={(v) => updBlock(realIdx, { ibanName: v })}
                            placeholder="Banca / beneficiar..."
                            textKey={`${block.id}:gift-iban-name`}
                            textLabel="Cadou - Beneficiar"
                            style={{
                              fontFamily: APPLE_DISPLAY_FONT,
                              fontSize: "0.72rem",
                              color: `${theme.textColor}aa`,
                            }}
                          />
                        )}
                      </div>
                    )}

                    {block.type === "whatsapp" && (
                      <div style={{ textAlign: "center" }}>
                        <a
                          href={`https://wa.me/${(block.content || "").replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={BUTTON_STYLE(theme)}
                        >
                          <MessageCircle className="w-4 h-4" />
                          <InlineEdit
                            tag="span"
                            editMode={editMode}
                            value={block.label || "Contact WhatsApp"}
                            onChange={(v) => updBlock(realIdx, { label: v })}
                            textKey={`${block.id}:whatsapp-label`}
                            textLabel="WhatsApp - Label"
                          />
                        </a>
                        {editMode && (
                          <div style={{ marginTop: 8 }}>
                            <InlineEdit
                              tag="p"
                              editMode={editMode}
                              value={block.content || ""}
                              onChange={(v) => updBlock(realIdx, { content: v })}
                              placeholder="Numar..."
                              textKey={`${block.id}:whatsapp-number`}
                              textLabel="WhatsApp - Numar"
                              style={{
                                fontFamily: APPLE_DISPLAY_FONT,
                                fontSize: "0.72rem",
                                color: `${theme.textColor}aa`,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {block.type === "rsvp" && (
                      <div style={{ display: "flex", justifyContent: "center" }}>
                        <button
                          type="button"
                          onClick={() => {
                            if (!editMode) onOpenRSVP?.();
                          }}
                          style={{
                            ...BUTTON_STYLE(theme),
                            minWidth: 210,
                            padding: "16px 26px",
                          }}
                        >
                          <InlineEdit
                            tag="span"
                            editMode={editMode}
                            value={block.label || "Confirma acum"}
                            onChange={(v) => updBlock(realIdx, { label: v })}
                            textKey={`${block.id}:rsvp-label`}
                            textLabel="RSVP - Label"
                          />
                        </button>
                      </div>
                    )}

                    {block.type === "music" && (
                      <MusicBlock
                        block={block}
                        editMode={editMode}
                        onUpdate={(patch) => updBlock(realIdx, patch)}
                        theme={theme}
                      />
                    )}

                    {block.type === "godparents" && (
                      <div style={{ ...mirageCardStyle(theme), padding: "24px 22px", textAlign: "center" }}>
                        <InlineEdit
                          tag="p"
                          editMode={editMode}
                          value={block.sectionTitle || "Nasii nostri"}
                          onChange={(v) => updBlock(realIdx, { sectionTitle: v })}
                          textKey={`${block.id}:godparents-title`}
                          textLabel="Nasi - Titlu"
                          style={{
                            marginBottom: 8,
                            fontFamily: APPLE_DISPLAY_FONT,
                            fontSize: "0.58rem",
                            fontWeight: 700,
                            letterSpacing: "0.3em",
                            textTransform: "uppercase",
                            color: `${theme.textColor}99`,
                          }}
                        />
                        <InlineEdit
                          tag="p"
                          editMode={editMode}
                          value={block.content || ""}
                          onChange={(v) => updBlock(realIdx, { content: v })}
                          placeholder="Text introductiv..."
                          textKey={`${block.id}:godparents-content`}
                          textLabel="Nasi - Text"
                          style={{
                            marginBottom: 12,
                            fontFamily: EDITORIAL_SERIF,
                            fontSize: "0.95rem",
                            fontStyle: "italic",
                            color: theme.textColor,
                          }}
                          multiline
                        />
                        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
                          {godparents.map((item, index) => (
                            <div key={index} className="group/gp flex items-center gap-1.5">
                              <InlineEdit
                                tag="span"
                                editMode={editMode}
                                value={item.godfather || ""}
                                onChange={(v) => updGodparent(index, "godfather", v)}
                                placeholder="Nas"
                                textKey={`${block.id}:godparent-${index}-1`}
                                textLabel={`Nasi - ${index + 1}.1`}
                                style={{
                                  fontFamily: EDITORIAL_SERIF,
                                  fontSize: "1rem",
                                  color: theme.headingColor,
                                }}
                              />
                              <span style={{ color: theme.accent }}>&amp;</span>
                              <InlineEdit
                                tag="span"
                                editMode={editMode}
                                value={item.godmother || ""}
                                onChange={(v) => updGodparent(index, "godmother", v)}
                                placeholder="Nasa"
                                textKey={`${block.id}:godparent-${index}-2`}
                                textLabel={`Nasi - ${index + 1}.2`}
                                style={{
                                  fontFamily: EDITORIAL_SERIF,
                                  fontSize: "1rem",
                                  color: theme.headingColor,
                                }}
                              />
                              {editMode && (
                                <button
                                  type="button"
                                  onClick={() => delGodparent(index)}
                                  className="rounded-full p-1 opacity-0 transition-opacity group-hover/gp:opacity-100 hover:bg-red-50"
                                >
                                  <Trash2 className="w-3 h-3 text-red-400" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        {editMode && (
                          <button
                            type="button"
                            onClick={addGodparent}
                            style={{
                              marginTop: 14,
                              border: `1px dashed ${theme.border}`,
                              color: theme.headingColor,
                              background: "transparent",
                              padding: "5px 14px",
                              borderRadius: 999,
                              cursor: "pointer",
                              fontFamily: APPLE_DISPLAY_FONT,
                              fontSize: "0.58rem",
                              fontWeight: 700,
                              letterSpacing: "0.18em",
                              textTransform: "uppercase",
                            }}
                          >
                            + Adauga
                          </button>
                        )}
                      </div>
                    )}

                    {block.type === "parents" && (
                      <div style={{ ...mirageCardStyle(theme), padding: "32px 28px" }}>
                        <p
                          style={{
                            marginBottom: 16,
                            fontFamily: APPLE_DISPLAY_FONT,
                            fontSize: "0.56rem",
                            fontWeight: 700,
                            letterSpacing: "0.3em",
                            textTransform: "uppercase",
                            color: `${theme.textColor}88`,
                          }}
                        >
                          CAPITOLUL I • ORIGINI
                        </p>
                        <InlineEdit
                          tag="h3"
                          editMode={editMode}
                          value={block.sectionTitle || "Buna invoire a familiilor"}
                          onChange={(v) => updBlock(realIdx, { sectionTitle: v })}
                          textKey={`${block.id}:parents-title`}
                          textLabel="Parinti - Titlu"
                          style={{
                            marginBottom: 16,
                            fontFamily: APPLE_DISPLAY_FONT,
                            fontSize: "1.25rem",
                            fontWeight: 300,
                            letterSpacing: "-0.02em",
                            color: theme.headingColor,
                          }}
                        />
                        <InlineEdit
                          tag="p"
                          editMode={editMode}
                          value={block.content || ""}
                          onChange={(v) => updBlock(realIdx, { content: v })}
                          placeholder="Text introductiv..."
                          textKey={`${block.id}:parents-content`}
                          textLabel="Parinti - Text"
                          style={{
                            marginBottom: 24,
                            fontFamily: EDITORIAL_SERIF,
                            fontSize: "0.92rem",
                            lineHeight: 1.7,
                            fontStyle: "italic",
                            color: theme.textColor,
                            borderLeft: `2px solid ${theme.border}`,
                            paddingLeft: 16,
                          }}
                          multiline
                        />
                        <div
                          className="grid grid-cols-1 gap-6 pt-4 md:grid-cols-2"
                          style={{ borderTop: `1px solid ${theme.border}` }}
                        >
                          {[
                            {
                              label: "BIOGRAFIA MIRESEI",
                              key1: "p1_father",
                              key2: "p1_mother",
                            },
                            {
                              label: "BIOGRAFIA MIRELUI",
                              key1: "p2_father",
                              key2: "p2_mother",
                            },
                          ].map(({ label, key1, key2 }) => (
                            <div key={label} className="flex flex-col gap-1">
                              <p
                                style={{
                                  fontFamily: APPLE_DISPLAY_FONT,
                                  fontSize: "0.5rem",
                                  fontWeight: 700,
                                  letterSpacing: "0.18em",
                                  textTransform: "uppercase",
                                  color: `${theme.textColor}88`,
                                }}
                              >
                                {label}
                              </p>
                              <div
                                style={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  alignItems: "center",
                                  gap: 6,
                                  color: theme.headingColor,
                                }}
                              >
                                <InlineEdit
                                  tag="span"
                                  editMode={editMode}
                                  value={parentsData?.[key1] || ""}
                                  onChange={(v) => updParent(key1, v)}
                                  placeholder="Nume parinte"
                                  textKey={`${block.id}:parent-${key1}`}
                                  textLabel={`Parinte - ${key1}`}
                                  style={{
                                    fontFamily: APPLE_DISPLAY_FONT,
                                    fontSize: "0.9rem",
                                    fontWeight: 600,
                                    color: theme.headingColor,
                                  }}
                                />
                                <span
                                  style={{
                                    fontFamily: APPLE_DISPLAY_FONT,
                                    fontSize: "0.9rem",
                                    fontWeight: 600,
                                    color: theme.headingColor,
                                  }}
                                >
                                  &
                                </span>
                                <InlineEdit
                                  tag="span"
                                  editMode={editMode}
                                  value={parentsData?.[key2] || ""}
                                  onChange={(v) => updParent(key2, v)}
                                  placeholder="Nume parinte"
                                  textKey={`${block.id}:parent-${key2}`}
                                  textLabel={`Parinte - ${key2}`}
                                  style={{
                                    fontFamily: APPLE_DISPLAY_FONT,
                                    fontSize: "0.9rem",
                                    fontWeight: 600,
                                    color: theme.headingColor,
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        <div
                          className="mt-8 flex flex-col gap-1 pt-6"
                          style={{ borderTop: `1px solid ${theme.border}` }}
                        >
                          <div
                            className="flex flex-wrap items-center gap-1.5"
                            style={{ color: theme.headingColor }}
                          >
                            {godparents.map((item, index) => (
                              <React.Fragment key={index}>
                                <InlineEdit
                                  tag="span"
                                  editMode={editMode}
                                  value={item.godfather || ""}
                                  onChange={(v) => updGodparent(index, "godfather", v)}
                                  placeholder="Nas"
                                  textKey={`${block.id}:godparent-inline-${index}-1`}
                                  textLabel={`Nasi inline - ${index + 1}.1`}
                                  style={{
                                    fontFamily: APPLE_DISPLAY_FONT,
                                    fontSize: "0.9rem",
                                    fontWeight: 700,
                                    color: theme.headingColor,
                                  }}
                                />
                                <span
                                  style={{
                                    fontFamily: APPLE_DISPLAY_FONT,
                                    fontSize: "0.9rem",
                                    fontWeight: 700,
                                    color: theme.headingColor,
                                  }}
                                >
                                  &
                                </span>
                                <InlineEdit
                                  tag="span"
                                  editMode={editMode}
                                  value={item.godmother || ""}
                                  onChange={(v) => updGodparent(index, "godmother", v)}
                                  placeholder="Nasa"
                                  textKey={`${block.id}:godparent-inline-${index}-2`}
                                  textLabel={`Nasi inline - ${index + 1}.2`}
                                  style={{
                                    fontFamily: APPLE_DISPLAY_FONT,
                                    fontSize: "0.9rem",
                                    fontWeight: 700,
                                    color: theme.headingColor,
                                  }}
                                />
                                {index < godparents.length - 1 && (
                                  <span
                                    style={{
                                      marginRight: 6,
                                      color: `${theme.textColor}66`,
                                      fontWeight: 700,
                                    }}
                                  >
                                    ·
                                  </span>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {block.type === "family" &&
                      (() => {
                        const members: { name1: string; name2: string }[] = safeJSON(
                          block.members,
                          [],
                        );
                        const updateMembers = (next: { name1: string; name2: string }[]) => {
                          updBlock(realIdx, { members: JSON.stringify(next) } as any);
                        };

                        return (
                          <div style={{ ...mirageCardStyle(theme), padding: "24px 22px", textAlign: "center" }}>
                            <InlineEdit
                              tag="p"
                              editMode={editMode}
                              value={block.label || "Familie"}
                              onChange={(v) => updBlock(realIdx, { label: v })}
                              textKey={`${block.id}:family-label`}
                              textLabel="Familie - Titlu"
                              style={{
                                marginBottom: 8,
                                fontFamily: APPLE_DISPLAY_FONT,
                                fontSize: "0.58rem",
                                fontWeight: 700,
                                letterSpacing: "0.3em",
                                textTransform: "uppercase",
                                color: `${theme.textColor}99`,
                              }}
                            />
                            <InlineEdit
                              tag="p"
                              editMode={editMode}
                              value={block.content || ""}
                              onChange={(v) => updBlock(realIdx, { content: v })}
                              textKey={`${block.id}:family-content`}
                              textLabel="Familie - Text"
                              style={{
                                marginBottom: 10,
                                fontFamily: EDITORIAL_SERIF,
                                fontSize: "0.95rem",
                                fontStyle: "italic",
                                color: theme.textColor,
                              }}
                              multiline
                            />
                            <div className="flex flex-col items-center gap-6">
                              {members.map((member, memberIndex) => (
                                <div
                                  key={memberIndex}
                                  className="flex flex-wrap items-center justify-center gap-2"
                                >
                                  <InlineEdit
                                    tag="span"
                                    editMode={editMode}
                                    value={member.name1}
                                    onChange={(v) => {
                                      const next = [...members];
                                      next[memberIndex] = { ...next[memberIndex], name1: v };
                                      updateMembers(next);
                                    }}
                                    textKey={`${block.id}:family-member-${memberIndex}-1`}
                                    textLabel={`Familie - ${memberIndex + 1}.1`}
                                    style={{
                                      fontFamily: EDITORIAL_SERIF,
                                      fontSize: "1.1rem",
                                      color: theme.headingColor,
                                    }}
                                  />
                                  <span style={{ color: theme.accent }}>&amp;</span>
                                  <InlineEdit
                                    tag="span"
                                    editMode={editMode}
                                    value={member.name2}
                                    onChange={(v) => {
                                      const next = [...members];
                                      next[memberIndex] = { ...next[memberIndex], name2: v };
                                      updateMembers(next);
                                    }}
                                    textKey={`${block.id}:family-member-${memberIndex}-2`}
                                    textLabel={`Familie - ${memberIndex + 1}.2`}
                                    style={{
                                      fontFamily: EDITORIAL_SERIF,
                                      fontSize: "1.1rem",
                                      color: theme.headingColor,
                                    }}
                                  />
                                  {editMode && members.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        updateMembers(members.filter((_, idx) => idx !== memberIndex))
                                      }
                                      className="text-red-400"
                                      style={{ background: "none", border: "none", cursor: "pointer" }}
                                    >
                                      x
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                            {editMode && (
                              <button
                                type="button"
                                onClick={() =>
                                  updateMembers([...members, { name1: "Nume 1", name2: "Nume 2" }])
                                }
                                style={{
                                  marginTop: 14,
                                  border: `1px dashed ${theme.border}`,
                                  color: theme.headingColor,
                                  background: "transparent",
                                  padding: "5px 14px",
                                  borderRadius: 999,
                                  cursor: "pointer",
                                  fontFamily: APPLE_DISPLAY_FONT,
                                  fontSize: "0.58rem",
                                  fontWeight: 700,
                                  letterSpacing: "0.18em",
                                  textTransform: "uppercase",
                                }}
                              >
                                + Adauga
                              </button>
                            )}
                          </div>
                        );
                      })()}

                    {block.type === "divider" && <EditorialDot theme={theme} />}
                    {block.type === "spacer" && <div className="h-4" />}
                  </BlockStyleProvider>
                </div>

                {editMode && (
                  <InsertBlockButton
                    insertIdx={realIdx}
                    openInsertAt={openInsertAt}
                    setOpenInsertAt={setOpenInsertAt}
                    blockTypes={BLOCK_TYPES}
                    onInsert={(type, def) => handleInsertAt(realIdx, type, def)}
                    theme={theme}
                  />
                )}
              </RevealOnView>
            );
          })}

          {!hasRsvpBlock && profile.showRsvpButton !== false && (
            <div style={{ display: "flex", justifyContent: "center" }}>
              {editMode ? (
                <div
                  style={{
                    ...BUTTON_STYLE(theme),
                    minWidth: 210,
                    padding: "16px 26px",
                  }}
                >
                  <InlineEdit
                    tag="span"
                    editMode={editMode}
                    value={profile.rsvpButtonText?.trim() || "Confirma acum"}
                    onChange={(v) => upProfile("rsvpButtonText", v)}
                    style={{ color: theme.headingColor }}
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenRSVP?.()}
                  style={{
                    ...BUTTON_STYLE(theme),
                    minWidth: 210,
                    padding: "16px 26px",
                  }}
                >
                  {profile.rsvpButtonText?.trim() || "Confirma acum"}
                </button>
              )}
            </div>
          )}
        </div>

        <HairlineRule label="Mirage Floral" theme={theme} className="mt-4" />

        <div className="pb-4 text-center">
          <p
            style={{
              fontFamily: APPLE_DISPLAY_FONT,
              fontSize: "0.5rem",
              fontWeight: 700,
              letterSpacing: "0.34em",
              textTransform: "uppercase",
              color: `${theme.textColor}88`,
            }}
          >
            {railName} · {profile.weddingDate ? new Date(profile.weddingDate).getFullYear() : ""}
          </p>
        </div>
      </div>
      </div>
    </>
  );
}
