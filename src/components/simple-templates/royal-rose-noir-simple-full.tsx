import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Calendar,
  Clock,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  Camera,
  Sparkles,
  Upload,
  Music,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Gift,
  MessageCircle,
  Navigation,
  MapPin,
} from "lucide-react";
import { InvitationTemplateProps, TemplateMeta } from "../invitations/types";
import { cn } from "../../lib/utils";
import { InvitationBlock, InvitationBlockType } from "../../types";
import { InlineEdit, InlineTime, InlineWaze } from "../invitations/InlineEdit";
import { BlockStyleProvider, BlockStyle } from "../BlockStyleContext";
import {
  getRoyalRoseTheme,
  ROYAL_ROSE_THEMES,
} from "../invitations/castleDefaults";
import FlipClock from "../invitations/FlipClock";
import { API_URL } from "../../config/api";
import { getSharedDefaultBlocks } from "./shared-default-blocks";

function deleteUploadedFile(url: string | undefined) {
  if (!url || !url.startsWith("/uploads/")) return;
  const _session = JSON.parse(
    localStorage.getItem("weddingPro_session") || "{}",
  );
  fetch(`${API_URL}/upload`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${_session?.token || ""}`,
    },
    body: JSON.stringify({ url }),
  }).catch(() => {});
}

let T = getRoyalRoseTheme();
const APPLE_DISPLAY_FONT =
  'ui-sans-serif, -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif';

export const meta: TemplateMeta = {
  id: "royal-rose-noir-simple",
  name: "Cupertino Noir",
  category: "wedding",
  description:
    "Design modern, dark, elegant cu accent pe contrast si tipografie rafinata.",
  colors: ["#09090b", "#d4af37", "#fafafa"],
  previewClass: "bg-zinc-950 border-zinc-800",
  elementsClass: "bg-zinc-900",
};

function useCountdown(target: string) {
  const calc = () => {
    const diff = new Date(target).getTime() - Date.now();
    if (diff <= 0)
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
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
  className,
}: {
  label?: string;
  className?: string;
}) => (
  <div className={cn("flex items-center gap-4 w-full", className)}>
    <div className="flex-1 h-px" style={{ background: T.PINK_L }} />
    {label && (
      <span
        style={{
          fontFamily: APPLE_DISPLAY_FONT,
          fontSize: "0.55rem",
          fontWeight: 600,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: T.MUTED,
        }}
      >
        {label}
      </span>
    )}
    {label && <div className="flex-1 h-px" style={{ background: T.PINK_L }} />}
  </div>
);

const EditorialDiamond = () => (
  <div className="flex items-center justify-center gap-3 my-2">
    <div className="h-px w-14" style={{ background: `${T.PINK_L}aa` }} />
    <svg viewBox="0 0 16 16" className="w-2.5 h-2.5 shrink-0" fill={T.PINK_DARK}>
      <circle cx="8" cy="8" r="4" />
    </svg>
    <div className="h-px w-14" style={{ background: `${T.PINK_L}aa` }} />
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
  <div className="absolute -top-3.5 right-3 flex items-center gap-0.5 rounded-full border border-white/10 bg-zinc-900/95 px-1.5 py-1 opacity-0 shadow-lg transition-all z-30 pointer-events-none group-hover/block:pointer-events-auto group-hover/block:opacity-100">
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onUp();
      }}
      disabled={isFirst}
      className="rounded-full p-0.5 transition-colors hover:bg-white/8 disabled:opacity-25"
    >
      <ChevronUp className="w-3 h-3 text-zinc-400" />
    </button>
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onDown();
      }}
      disabled={isLast}
      className="rounded-full p-0.5 transition-colors hover:bg-white/8 disabled:opacity-25"
    >
      <ChevronDown className="w-3 h-3 text-zinc-400" />
    </button>
    <div className="mx-0.5 h-3 w-px bg-white/10" />
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className="rounded-full p-0.5 transition-colors hover:bg-white/8"
    >
      {visible ? (
        <Eye className="w-3 h-3 text-zinc-400" />
      ) : (
        <EyeOff className="w-3 h-3 text-zinc-600" />
      )}
    </button>
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onDelete();
      }}
      className="rounded-full p-0.5 transition-colors hover:bg-red-900/30"
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
}> = ({ insertIdx, openInsertAt, setOpenInsertAt, blockTypes, onInsert }) => {
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
          background:
            "repeating-linear-gradient(to right, rgba(255,255,255,0.1) 0, rgba(255,255,255,0.1) 6px, transparent 6px, transparent 12px)",
        }}
      />
      <button
        type="button"
        onClick={() => setOpenInsertAt(isOpen ? null : insertIdx)}
        style={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          border: `1.5px solid ${T.PINK_L}`,
          background: isOpen ? T.PINK_D : "#18181b",
          color: isOpen ? "#09090b" : "#fafafa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          lineHeight: 1,
          cursor: "pointer",
          boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
          transform: visible ? "scale(1)" : "scale(0.7)",
          transition: "all .15s",
          zIndex: 2,
        }}
      >
        {isOpen ? "×" : "+"}
      </button>
      {isOpen && (
        <div
          style={{
            position: "absolute",
            bottom: 34,
            left: "50%",
            transform: "translateX(-50%)",
            width: 280,
            background: "#18181b",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 16,
            boxShadow:
              "0 16px 48px rgba(0,0,0,0.8), 0 4px 16px rgba(0,0,0,0.4)",
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
              color: "#fafafa",
              margin: "0 0 10px",
              textAlign: "center",
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
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.03)",
                  color: "#fafafa",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  padding: "8px 4px",
                }}
              >
                <span style={{ fontSize: 16, lineHeight: 1 }}>
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
                    opacity: 0.72,
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

const CUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center gap-1">
    <div className="relative">
      <div
        className="w-14 h-14 flex items-center justify-center"
        style={{
          border: `1px solid ${T.PINK_L}`,
          background: "rgba(255,255,255,0.03)",
          borderRadius: 18,
          boxShadow: "0 12px 30px rgba(0,0,0,0.28)",
          backdropFilter: "blur(12px)",
        }}
      >
        <span
          className="text-2xl font-bold tabular-nums"
          style={{
            color: T.PINK_DARK,
            fontFamily: APPLE_DISPLAY_FONT,
            letterSpacing: "-0.04em",
          }}
        >
          {String(value).padStart(2, "0")}
        </span>
      </div>
    </div>
    <span
      className="text-[9px] uppercase tracking-widest font-bold"
      style={{
        color: T.MUTED,
        fontFamily: APPLE_DISPLAY_FONT,
      }}
    >
      {label}
    </span>
  </div>
);

export const CASTLE_DEFAULTS = {
  partner1Name: "Maria",
  partner2Name: "Andrei",
  welcomeText: "Impreuna cu familiile noastre",
  invitationText: "va invita cu drag la nunta noastra",
  invitationLeadText: "va invita cu drag la",
  celebrationText: "nunta noastra",
  heroCountdownText: "Pana la marele eveniment",
  showWelcomeText: true,
  showCelebrationText: true,
  showTimeline: true,
  showCountdown: true,
  showRsvpButton: true,
  rsvpButtonText: "Confirma Prezenta",
  colorTheme: "ivory",
};

export const CASTLE_DEFAULT_BLOCKS: InvitationBlock[] = getSharedDefaultBlocks(
  "royal-rose-noir-simple",
);

export const CASTLE_PREVIEW_DATA = {
  guest: { name: "Familia Popescu", status: "pending", type: "family" },
  project: { selectedTemplate: "royal-rose-noir-simple" },
  profile: {
    ...CASTLE_DEFAULTS,
    weddingDate: "",
    customSections: JSON.stringify(CASTLE_DEFAULT_BLOCKS),
    godparents: JSON.stringify([
      { godfather: "Nume Nas", godmother: "Nume Nasa" },
    ]),
    parents: JSON.stringify({
      p1_father: "Tatal Miresei",
      p1_mother: "Mama Miresei",
      p2_father: "Tatal Mirelui",
      p2_mother: "Mama Mirelui",
    }),
    timeline: JSON.stringify([]),
  },
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
  const m: Record<ClipShape, React.CSSProperties> = {
    rect: { borderRadius: 0 },
    rounded: { borderRadius: 16 },
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
    heart: { clipPath: "url(#re-clip-heart)" },
    diagonal: { clipPath: "polygon(0 0,100% 0,100% 80%,0 100%)" },
    "diagonal-r": { clipPath: "polygon(0 0,100% 0,100% 100%,0 80%)" },
    "wave-b": { clipPath: "url(#re-clip-wave-b)" },
    "wave-t": { clipPath: "url(#re-clip-wave-t)" },
    "wave-both": { clipPath: "url(#re-clip-wave-both)" },
    blob: { clipPath: "url(#re-clip-blob)" },
    blob2: { clipPath: "url(#re-clip-blob2)" },
    blob3: { clipPath: "url(#re-clip-blob3)" },
    blob4: { clipPath: "url(#re-clip-blob4)" },
  };
  return m[clip] || {};
}

function getMaskStyle(effects: MaskEffect[]): React.CSSProperties {
  if (!effects.length) return {};
  const layers = effects.map((e) => {
    switch (e) {
      case "fade-b":
        return "linear-gradient(to bottom, black 40%, transparent 100%)";
      case "fade-t":
        return "linear-gradient(to top, black 40%, transparent 100%)";
      case "fade-l":
        return "linear-gradient(to left, black 40%, transparent 100%)";
      case "fade-r":
        return "linear-gradient(to right, black 40%, transparent 100%)";
      case "vignette":
        return "radial-gradient(ellipse 80% 80% at center, black 40%, transparent 100%)";
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
      <clipPath id="re-clip-wave-b" clipPathUnits="objectBoundingBox">
        <path d="M0,0 L1,0 L1,0.78 Q0.875,0.65 0.75,0.78 Q0.625,0.91 0.5,0.78 Q0.375,0.65 0.25,0.78 Q0.125,0.91 0,0.78 Z" />
      </clipPath>
      <clipPath id="re-clip-wave-t" clipPathUnits="objectBoundingBox">
        <path d="M0,0.22 Q0.125,0.09 0.25,0.22 Q0.375,0.35 0.5,0.22 Q0.625,0.09 0.75,0.22 Q0.875,0.35 1,0.22 L1,1 L0,1 Z" />
      </clipPath>
      <clipPath id="re-clip-wave-both" clipPathUnits="objectBoundingBox">
        <path d="M0,0.22 Q0.125,0.09 0.25,0.22 Q0.375,0.35 0.5,0.22 Q0.625,0.09 0.75,0.22 Q0.875,0.35 1,0.22 L1,0.78 Q0.875,0.65 0.75,0.78 Q0.625,0.91 0.5,0.78 Q0.375,0.65 0.25,0.78 Q0.125,0.91 0,0.78 Z" />
      </clipPath>
      <clipPath id="re-clip-heart" clipPathUnits="objectBoundingBox">
        <path d="M0.5,0.85 C0.5,0.85 0.05,0.55 0.05,0.3 C0.05,0.12 0.18,0.05 0.3,0.1 C0.4,0.14 0.5,0.25 0.5,0.25 C0.5,0.25 0.6,0.14 0.7,0.1 C0.82,0.05 0.95,0.12 0.95,0.3 C0.95,0.55 0.5,0.85 0.5,0.85Z" />
      </clipPath>
      <clipPath id="re-clip-blob" clipPathUnits="objectBoundingBox">
        <path d="M0.5,0.03 C0.72,0.01 0.95,0.14 0.97,0.38 C0.99,0.58 0.88,0.78 0.72,0.88 C0.56,0.98 0.35,0.99 0.2,0.88 C0.05,0.77 -0.02,0.55 0.04,0.36 C0.1,0.17 0.28,0.05 0.5,0.03Z" />
      </clipPath>
      <clipPath id="re-clip-blob2" clipPathUnits="objectBoundingBox">
        <path d="M0.75,0.224 C0.831,0.271 0.911,0.342 0.921,0.422 C0.93,0.502 0.869,0.59 0.808,0.661 C0.747,0.732 0.685,0.785 0.611,0.816 C0.538,0.847 0.453,0.856 0.389,0.824 C0.326,0.792 0.285,0.72 0.233,0.647 C0.181,0.573 0.119,0.497 0.113,0.414 C0.107,0.331 0.157,0.241 0.231,0.193 C0.305,0.145 0.402,0.138 0.493,0.147 C0.584,0.155 0.668,0.178 0.75,0.224Z" />
      </clipPath>
      <clipPath id="re-clip-blob3" clipPathUnits="objectBoundingBox">
        <path d="M0.5,0.05 C0.65,0.02 0.85,0.1 0.92,0.28 C0.99,0.46 0.93,0.68 0.8,0.82 C0.67,0.96 0.46,1.0 0.3,0.93 C0.14,0.86 0.02,0.68 0.01,0.5 C0.0,0.32 0.1,0.14 0.25,0.07 C0.33,0.03 0.42,0.07 0.5,0.05Z" />
      </clipPath>
      <clipPath id="re-clip-blob4" clipPathUnits="objectBoundingBox">
        <path d="M0.18,0.08 C0.32,0.01 0.54,0.0 0.68,0.08 C0.82,0.16 0.96,0.32 0.97,0.5 C0.98,0.68 0.86,0.86 0.7,0.93 C0.54,1.0 0.32,0.97 0.18,0.88 C0.04,0.79 -0.04,0.62 0.02,0.45 C0.07,0.28 0.04,0.15 0.18,0.08Z" />
      </clipPath>
    </defs>
  </svg>
);

const PhotoBlock: React.FC<{
  block: InvitationBlock;
  editMode: boolean;
  onUpdate: (patch: Partial<InvitationBlock>) => void;
  placeholderInitial1?: string;
}> = ({ block, editMode, onUpdate, placeholderInitial1 }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const pt: Record<string, string> = {
    "1:1": "100%",
    "4:3": "75%",
    "3:4": "133%",
    "16:9": "56.25%",
    free: "66.6%",
  };
  const aspectRatio = (block.aspectRatio || "free") as any;
  const photoClip = (block.photoClip || "rect") as ClipShape;
  const photoMasks = (block.photoMasks || []) as MaskEffect[];
  const combined = { ...getClipStyle(photoClip), ...getMaskStyle(photoMasks) };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    deleteUploadedFile(block.imageData);
    try {
      const form = new FormData();
      form.append("file", file);
      const _s = JSON.parse(localStorage.getItem("weddingPro_session") || "{}");
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${_s?.token || ""}` },
        body: form,
      });
      const { url } = await res.json();
      onUpdate({ imageData: url });
    } finally {
      setUploading(false);
    }
  };

  if (block.imageData)
    return (
      <div style={{ position: "relative" }}>
        <PhotoClipDefs />
        <div
          style={{
            position: "relative",
            paddingTop: pt[aspectRatio],
            overflow: "hidden",
            ...combined,
          }}
        >
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
          {editMode && (
            <>
              <div className="absolute top-2 left-2 z-20 pointer-events-none">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 text-white text-[10px] font-semibold px-2.5 py-1 tracking-wide">
                  <Upload className="w-3.5 h-3.5" />
                  Click pentru schimbare imagine
                </span>
              </div>
              <div className="absolute inset-0 bg-black/20 hover:bg-black/35 transition-colors flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="rounded-full bg-zinc-900 p-2 text-white shadow-sm"
                  style={{ color: "#fafafa" }}
                >
                  <Camera className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteUploadedFile(block.imageData);
                    onUpdate({ imageData: undefined });
                  }}
                  className="rounded-full bg-zinc-900 p-2 text-red-500 shadow-sm"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={(e) =>
            e.target.files?.[0] && handleFile(e.target.files[0])
          }
          style={{ display: "none" }}
        />
      </div>
    );

  return (
    <div style={{ position: "relative" }}>
      <PhotoClipDefs />
      <div
        style={{
          position: "relative",
          paddingTop: pt[aspectRatio],
          ...combined,
          overflow: "hidden",
          cursor: editMode ? "pointer" : "default",
        }}
        onClick={editMode ? () => fileRef.current?.click() : undefined}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(160deg, ${T.PINK_XL} 0%, ${T.PINK_L} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {uploading ? (
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <div style={{ textAlign: "center" }}>
              <Sparkles
                className="w-10 h-10 mx-auto mb-2"
                style={{ color: `${T.PINK_DARK}55` }}
              />
              <span
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: 48,
                  color: T.PINK_DARK,
                  opacity: 0.4,
                }}
              >
                {(placeholderInitial1 || "M")[0].toUpperCase()}
              </span>
              {editMode && (
                <p
                  className="mt-2 text-[10px] uppercase tracking-[0.18em] font-semibold"
                  style={{ color: T.PINK_DARK, opacity: 0.6 }}
                >
                  Click pentru upload imagine
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={(e) =>
          e.target.files?.[0] && handleFile(e.target.files[0])
        }
        style={{ display: "none" }}
      />
    </div>
  );
};

const MusicBlock: React.FC<{
  block: InvitationBlock;
  editMode: boolean;
  onUpdate: (p: Partial<InvitationBlock>) => void;
}> = ({ block, editMode, onUpdate }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const mp3Ref = useRef<HTMLInputElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setProgress(a.currentTime);
    const onDur = () => setDuration(a.duration);
    const onEnd = () => {
      setPlaying(false);
      setProgress(0);
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onDur);
    a.addEventListener("ended", onEnd);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onDur);
      a.removeEventListener("ended", onEnd);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
    };
  }, [block.musicUrl]);

  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const pct = duration ? `${(progress / duration) * 100}%` : "0%";

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    playing ? a.pause() : a.play().catch(() => {});
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    audioRef.current.currentTime =
      Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * duration;
  };

  const handleMp3 = async (file: File) => {
    if (!file.type.startsWith("audio/")) return;
    setUploading(true);
    deleteUploadedFile(block.musicUrl);
    try {
      const form = new FormData();
      form.append("file", file);
      const _s = JSON.parse(localStorage.getItem("weddingPro_session") || "{}");
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${_s?.token || ""}` },
        body: form,
      });
      if (!res.ok) throw new Error("upload failed");
      const { url } = await res.json();
      onUpdate({ musicUrl: url, musicType: "mp3" });
    } finally {
      setUploading(false);
    }
  };

  const isActive = !!block.musicUrl;

  return (
    <div
      className="re-apple-card"
      style={{
        padding: "18px 20px",
      }}
    >
      {block.musicType === "mp3" && block.musicUrl && (
        <audio ref={audioRef} src={block.musicUrl} preload="metadata" />
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 14,
        }}
      >
        <Music
          className="w-4 h-4"
          style={{ color: playing ? T.PINK_DARK : T.MUTED }}
        />
        <span
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: playing ? T.PINK_DARK : T.MUTED,
          }}
        >
          {playing ? "Se reda acum" : "Muzica"}
        </span>
      </div>

      {!isActive && editMode && (
        <div>
          <button
            type="button"
            onClick={() => mp3Ref.current?.click()}
            disabled={uploading}
            style={{
              width: "100%",
              background: T.PINK_XL,
              border: `1px dashed ${T.PINK_L}`,
              padding: "14px 0",
              cursor: uploading ? "not-allowed" : "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            {uploading ? (
              <div
                className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: T.PINK_DARK }}
              />
            ) : (
              <Upload className="w-5 h-5" style={{ color: T.MUTED }} />
            )}
            <span
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: 9,
                color: T.MUTED,
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              MP3
            </span>
          </button>
          <input
            ref={mp3Ref}
            type="file"
            accept="audio/*,.mp3"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleMp3(f);
            }}
            style={{ display: "none" }}
          />
        </div>
      )}

      {!isActive && !editMode && (
        <div style={{ textAlign: "center", padding: "12px 0", opacity: 0.4 }}>
          <Music className="w-8 h-8 mx-auto mb-2" style={{ color: T.PINK_DARK }} />
          <p
            style={{
              fontFamily: "Georgia, serif",
              fontSize: 12,
              fontStyle: "italic",
              color: T.MUTED,
            }}
          >
            Melodia va aparea aici
          </p>
        </div>
      )}

      {isActive && (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                background: T.PINK_XL,
                border: `1px solid ${T.PINK_L}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Music
                className="w-5 h-5"
                style={{ color: T.PINK_DARK, opacity: 0.7 }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <InlineEdit
                tag="p"
                editMode={editMode}
                value={block.musicTitle || ""}
                onChange={(v) => onUpdate({ musicTitle: v })}
                placeholder="Titlul melodiei..."
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: 14,
                  fontStyle: "italic",
                  color: T.PINK_DARK,
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
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: 10,
                  color: T.MUTED,
                  margin: "2px 0 0",
                }}
              />
            </div>
          </div>
          <div
            onClick={seek}
            style={{
              height: 3,
              background: T.PINK_L,
              marginBottom: 6,
              cursor: "pointer",
              position: "relative",
            }}
          >
            <div
              style={{ height: "100%", background: T.PINK_DARK, width: pct }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <span
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: 9,
                color: T.MUTED,
              }}
            >
              {fmt(progress)}
            </span>
            <span
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: 9,
                color: T.MUTED,
              }}
            >
              {duration ? fmt(duration) : "--:--"}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 18,
            }}
          >
            <button
              type="button"
              onClick={() => {
                const a = audioRef.current;
                if (a) a.currentTime = Math.max(0, a.currentTime - 10);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                opacity: 0.55,
              }}
            >
              <SkipBack className="w-4 h-4" style={{ color: T.PINK_DARK }} />
            </button>
            <button
              type="button"
              onClick={toggle}
              style={{
                width: 40,
                height: 40,
                background: T.PINK_DARK,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {playing ? (
                <Pause className="w-4 h-4" style={{ color: "white" }} />
              ) : (
                <Play
                  className="w-4 h-4"
                  style={{ color: "white", marginLeft: 2 }}
                />
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                const a = audioRef.current;
                if (a)
                  a.currentTime = Math.min(duration || a.currentTime + 10, a.currentTime + 10);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                opacity: 0.55,
              }}
            >
              <SkipForward className="w-4 h-4" style={{ color: T.PINK_DARK }} />
            </button>
          </div>
          {editMode && (
            <div
              style={{
                marginTop: 10,
                display: "flex",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <button
                type="button"
                onClick={() => mp3Ref.current?.click()}
                style={{
                  background: T.PINK_XL,
                  border: `1px solid ${T.PINK_L}`,
                  padding: "4px 12px",
                  cursor: "pointer",
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: 9,
                  color: T.MUTED,
                  fontWeight: 700,
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
                  border: `1px dashed ${T.PINK_L}`,
                  padding: "4px 12px",
                  cursor: "pointer",
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: 9,
                  color: T.MUTED,
                  fontWeight: 700,
                }}
              >
                Sterge
              </button>
              <input
                ref={mp3Ref}
                type="file"
                accept="audio/*,.mp3"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleMp3(f);
                }}
                style={{ display: "none" }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CalendarMonth: React.FC<{ date: string | undefined }> = ({ date }) => {
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
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${T.PINK_L}`,
        padding: 20,
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontFamily: "Montserrat, sans-serif",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.25em",
          color: T.PINK_DARK,
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
        {dayLabels.map((l, i) => (
          <div
            key={`${l}-${i}`}
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: T.MUTED,
              fontFamily: "Montserrat, sans-serif",
            }}
          >
            {l}
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
        {cells.map((cell, i) => {
          const isToday = cell === day;
          return (
            <div
              key={i}
              style={{
                height: 26,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: isToday ? 700 : 400,
                color: isToday ? "#09090b" : cell ? T.PINK_DARK : "transparent",
                background: isToday ? T.PINK_D : "transparent",
                borderRadius: 6,
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

export type RoyalRoseNoirProps = InvitationTemplateProps & {
  editMode?: boolean;
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

const RoyalRoseNoirTemplate: React.FC<RoyalRoseNoirProps> = ({
  data,
  onOpenRSVP,
  editMode = false,
  introPreview = false,
  onProfileUpdate,
  onBlocksUpdate,
  onBlockSelect,
  selectedBlockId,
}) => {
  const { profile, guest } = data;
  const paletteTheme = getRoyalRoseTheme(
    (profile as any).colorTheme || CASTLE_DEFAULTS.colorTheme,
  );
  T = {
    ...paletteTheme,
    PINK_DARK: "#fafafa",
    PINK_D: paletteTheme.PINK_D,
    PINK_L: paletteTheme.PINK_L,
    PINK_XL: "rgba(255,255,255,0.03)",
    CREAM: "#09090b",
    TEXT: "#fafafa",
    MUTED: "rgba(255,255,255,0.55)",
    GOLD: paletteTheme.GOLD || paletteTheme.PINK_D,
  } as typeof T;

  const safeJSON = (s: string | undefined, fb: any) => {
    try {
      return s ? JSON.parse(s) : fb;
    } catch {
      return fb;
    }
  };
  const legacyInvitationText = `${String((profile as any).invitationLeadText || "").trim()} ${String(profile.celebrationText || "").trim()}`.trim();

  const [blocks, setBlocks] = useState<InvitationBlock[]>(() => {
    const fromDb = safeJSON(profile.customSections, null);
    return Array.isArray(fromDb) && fromDb.length ? fromDb : CASTLE_DEFAULT_BLOCKS;
  });
  const [openInsertAt, setOpenInsertAt] = useState<number | null>(null);
  const [godparents, setGodparents] = useState<any[]>(() =>
    safeJSON(profile.godparents, [
      { godfather: "Nume Nas", godmother: "Nume Nasa" },
    ]),
  );
  const [parentsData, setParentsData] = useState<any>(() =>
    safeJSON(profile.parents, {
      p1_father: "Tatal Miresei",
      p1_mother: "Mama Miresei",
      p2_father: "Tatal Mirelui",
      p2_mother: "Mama Mirelui",
    }),
  );

  useEffect(() => {
    const fromDb = safeJSON(profile.customSections, null);
    setBlocks(Array.isArray(fromDb) && fromDb.length ? fromDb : CASTLE_DEFAULT_BLOCKS);
  }, [profile.customSections]);
  useEffect(() => {
    setGodparents(
      safeJSON(profile.godparents, [
        { godfather: "Nume Nas", godmother: "Nume Nasa" },
      ]),
    );
  }, [profile.godparents]);
  useEffect(() => {
    setParentsData(
      safeJSON(profile.parents, {
        p1_father: "Tatal Miresei",
        p1_mother: "Mama Miresei",
        p2_father: "Tatal Mirelui",
        p2_mother: "Mama Mirelui",
      }),
    );
  }, [profile.parents]);

  const p = {
    partner1Name: profile.partner1Name ?? CASTLE_DEFAULTS.partner1Name,
    partner2Name: profile.partner2Name ?? CASTLE_DEFAULTS.partner2Name,
    welcomeText: profile.welcomeText ?? CASTLE_DEFAULTS.welcomeText,
    invitationText:
      typeof (profile as any).invitationText === "string"
        ? (profile as any).invitationText
        : legacyInvitationText || CASTLE_DEFAULTS.invitationText,
    heroCountdownText:
      (profile as any).heroCountdownText ?? CASTLE_DEFAULTS.heroCountdownText,
    showWelcomeText: profile.showWelcomeText ?? CASTLE_DEFAULTS.showWelcomeText,
    showCelebrationText:
      profile.showCelebrationText ?? CASTLE_DEFAULTS.showCelebrationText,
    showCountdown: profile.showCountdown ?? CASTLE_DEFAULTS.showCountdown,
    showTimeline: profile.showTimeline ?? CASTLE_DEFAULTS.showTimeline,
    showRsvpButton: profile.showRsvpButton ?? CASTLE_DEFAULTS.showRsvpButton,
    rsvpButtonText: profile.rsvpButtonText ?? CASTLE_DEFAULTS.rsvpButtonText,
    weddingDate: profile.weddingDate ?? "",
  };

  const countdown = useCountdown(p.weddingDate || "");

  const _profileQueue = useRef<Record<string, any>>({});
  const _profileTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const _blocksTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const upProfile = useCallback(
    (field: string, value: any) => {
      _profileQueue.current = { ..._profileQueue.current, [field]: value };
      if (_profileTimer.current) clearTimeout(_profileTimer.current);
      _profileTimer.current = setTimeout(() => {
        onProfileUpdate?.(_profileQueue.current);
        _profileQueue.current = {};
      }, 500);
    },
    [onProfileUpdate],
  );

  const _debouncedBlocksSave = useCallback(
    (nb: InvitationBlock[]) => {
      if (_blocksTimer.current) clearTimeout(_blocksTimer.current);
      _blocksTimer.current = setTimeout(() => onBlocksUpdate?.(nb), 500);
    },
    [onBlocksUpdate],
  );

  const updBlock = useCallback(
    (idx: number, patch: Partial<InvitationBlock>) => {
      setBlocks((prev) => {
        const nb = prev.map((b, i) => (i === idx ? { ...b, ...patch } : b));
        _debouncedBlocksSave(nb);
        return nb;
      });
    },
    [_debouncedBlocksSave],
  );

  const movBlock = useCallback(
    (idx: number, dir: -1 | 1) => {
      setBlocks((prev) => {
        const nb = [...prev];
        const to = idx + dir;
        if (to < 0 || to >= nb.length) return prev;
        [nb[idx], nb[to]] = [nb[to], nb[idx]];
        onBlocksUpdate?.(nb);
        return nb;
      });
    },
    [onBlocksUpdate],
  );

  const delBlock = useCallback(
    (idx: number) => {
      setBlocks((prev) => {
        const nb = prev.filter((_, i) => i !== idx);
        onBlocksUpdate?.(nb);
        return nb;
      });
    },
    [onBlocksUpdate],
  );

  const addBlockAt = useCallback(
    (afterIdx: number, type: string, def: any) => {
      setBlocks((prev) => {
        const nb = [...prev];
        nb.splice(afterIdx + 1, 0, {
          id: Date.now().toString(),
          type: type as InvitationBlockType,
          show: true,
          ...def,
        });
        onBlocksUpdate?.(nb);
        return nb;
      });
    },
    [onBlocksUpdate],
  );

  const updGodparent = (i: number, field: "godfather" | "godmother", val: string) => {
    setGodparents((prev) => {
      const ng = prev.map((g, j) => (j === i ? { ...g, [field]: val } : g));
      upProfile("godparents", JSON.stringify(ng));
      return ng;
    });
  };
  const addGodparent = () =>
    setGodparents((prev) => {
      const ng = [...prev, { godfather: "", godmother: "" }];
      upProfile("godparents", JSON.stringify(ng));
      return ng;
    });
  const delGodparent = (i: number) =>
    setGodparents((prev) => {
      const ng = prev.filter((_, j) => j !== i);
      upProfile("godparents", JSON.stringify(ng));
      return ng;
    });
  const updParent = (field: string, val: string) =>
    setParentsData((prev: any) => {
      const np = { ...prev, [field]: val };
      upProfile("parents", JSON.stringify(np));
      return np;
    });

  const isBaptism = profile.eventType === "baptism" || profile.eventType === "kids";
  const isPublicInvite = !!data.isPublic;
  const guestDisplayName = isPublicInvite
    ? "Drag invitat"
    : guest?.name || "Invitat Exemplu";
  const displayBlocks = editMode ? blocks : blocks.filter((b) => b.show !== false);
  const hasRsvpBlock = blocks.some(
    (b) => b.type === "rsvp" && (editMode || b.show !== false),
  );
  const dateStr = p.weddingDate
    ? new Date(p.weddingDate).toLocaleDateString("ro-RO", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Data Evenimentului";

  const BLOCK_TYPES: { type: string; label: string; def: any }[] = [
    {
      type: "photo",
      label: "Foto",
      def: {
        imageData: undefined,
        altText: "",
        aspectRatio: "3:4",
        photoClip: "rect",
        photoMasks: ["fade-b"],
      },
    },
    { type: "text", label: "Text", def: { content: "O poveste frumoasa incepe..." } },
    {
      type: "location",
      label: "Locatie",
      def: {
        label: "Locatie",
        time: "17:00",
        locationName: "Nume locatie",
        locationAddress: "Adresa",
        wazeLink: "",
      },
    },
    { type: "calendar", label: "Calendar", def: {} },
    {
      type: "countdown",
      label: "Countdown",
      def: { countdownTitle: "Timp ramas pana la marele eveniment" },
    },
    {
      type: "music",
      label: "Muzica",
      def: { musicTitle: "", musicArtist: "", musicType: "none" },
    },
    {
      type: "gift",
      label: "Cadouri",
      def: {
        sectionTitle: "Sugestie cadou",
        content: "",
        iban: "",
        ibanName: "",
      },
    },
    { type: "whatsapp", label: "WhatsApp", def: { label: "WhatsApp", content: "0700000000" } },
    { type: "rsvp", label: "RSVP", def: { label: "Confirma Prezenta" } },
    { type: "divider", label: "Linie", def: {} },
    {
      type: "family",
      label: "Familie",
      def: {
        label: "Familie",
        content: "Cu drag si recunostinta",
        members: JSON.stringify([{ name1: "Mama", name2: "Tata" }]),
      },
    },
    { type: "date", label: "Data", def: { content: "" } },
    { type: "description", label: "Descriere", def: { content: "O scurta descriere..." } },
    { type: "title", label: "Titlu", def: { content: "Titlu sectiune" } },
    {
      type: "godparents",
      label: "Nasi",
      def: { sectionTitle: "Nasii Nostri", content: "" },
    },
    {
      type: "parents",
      label: "Parinti",
      def: { sectionTitle: "Parintii Nostri", content: "" },
    },
    { type: "spacer", label: "Spatiu", def: {} },
  ];

  const handleInsertAt = (afterIdx: number, type: string, def: any) => {
    addBlockAt(afterIdx, type, def);
    setOpenInsertAt(null);
  };

  const timeline: any[] = (() => {
    try {
      return profile.timeline ? JSON.parse(profile.timeline) : [];
    } catch {
      return [];
    }
  })();
  const updateTimelineItem = (id: string, patch: Record<string, any>) => {
    const next = timeline.map((it: any) => (it.id === id ? { ...it, ...patch } : it));
    upProfile("timeline", JSON.stringify(next));
  };

  const themeCSS = `
    .re-wrap .re-accent { color: ${T.PINK_D} !important; }
    .re-wrap .re-text-main { color: ${T.PINK_DARK} !important; }
    .re-wrap .re-text-muted { color: ${T.MUTED} !important; }
    .re-wrap .text-pink-300 { color: ${T.PINK_L} !important; }
    .re-wrap .text-pink-400 { color: ${T.PINK_D} !important; }
    .re-wrap .text-pink-500 { color: ${T.PINK_D} !important; }
    .re-wrap .text-rose-400 { color: ${T.MUTED} !important; }
    .re-wrap .text-rose-500 { color: ${T.PINK_D} !important; }
    .re-wrap .text-rose-600 { color: ${T.PINK_DARK} !important; }
    .re-wrap .text-rose-700 { color: ${T.PINK_DARK} !important; }
    .re-wrap .text-rose-800 { color: ${T.PINK_DARK} !important; }
    .re-wrap .border-pink-100 { border-color: ${T.PINK_L}55 !important; }
    .re-wrap .border-pink-200 { border-color: ${T.PINK_L} !important; }
    .re-wrap .hover\\:bg-pink-50:hover { background-color: ${T.PINK_XL} !important; }
    .re-wrap .bg-pink-50 { background-color: ${T.PINK_XL} !important; }
    .re-wrap .bg-pink-100 { background-color: ${T.PINK_XL} !important; }
    .re-wrap .re-apple-shell {
      background: linear-gradient(180deg, rgba(24,24,27,0.94) 0%, rgba(9,9,11,0.98) 100%);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 36px;
      box-shadow: 0 24px 80px rgba(0,0,0,0.45), 0 6px 24px rgba(0,0,0,0.24);
      backdrop-filter: blur(18px);
    }
    .re-wrap .re-apple-card {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 28px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.22);
      backdrop-filter: blur(18px);
    }
    .re-wrap .re-apple-pill {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 999px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.18);
      backdrop-filter: blur(16px);
    }
  `;

  return (
    <div
      className="re-wrap relative min-h-screen"
      style={{
        background: "#09090b",
        fontFamily: "Georgia, 'Times New Roman', serif",
        color: "#fafafa",
      }}
    >
      <style>{themeCSS}</style>

      {editMode && (
        <div className="fixed top-3 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-zinc-900/90 px-4 py-1.5 text-[10px] font-bold text-white shadow-2xl backdrop-blur pointer-events-none select-none">
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: T.PINK_L }}
          />
          <span className="uppercase tracking-widest">Editare Directa</span>
          <span className="font-normal" style={{ color: T.PINK_L }}>
            {" "}
            click pe orice text
          </span>
        </div>
      )}

      <div
        className={cn(
          "flex items-start justify-center p-4 min-h-screen transition-all duration-700",
          editMode ? "py-12 pt-16 opacity-100" : "py-12 opacity-100",
        )}
      >
        <div className="max-w-3xl w-full">
          <div className="text-center mb-7">
            <div className="inline-flex items-center gap-3 px-5 py-2 re-apple-pill">
              <span
                style={{
                  fontFamily: APPLE_DISPLAY_FONT,
                  fontSize: "0.56rem",
                  fontWeight: 600,
                  letterSpacing: "0.26em",
                  textTransform: "uppercase",
                  color: T.MUTED,
                }}
              >
                Invitatie
              </span>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: T.PINK_L }} />
              <span
                style={{
                  fontFamily: APPLE_DISPLAY_FONT,
                  fontSize: "0.56rem",
                  fontWeight: 600,
                  letterSpacing: "0.26em",
                  textTransform: "uppercase",
                  color: T.MUTED,
                }}
              >
                Nunta
              </span>
            </div>
          </div>

          <div className="re-apple-shell" style={{ padding: "0 0 2px" }}>
            <div className="px-3 md:px-10 pt-10 pb-10 text-center space-y-9">
              <BlockStyleProvider
                value={{
                  blockId: "__hero__",
                  textStyles: (profile as any).heroTextStyles,
                  onTextSelect: (textKey, textLabel) =>
                    onBlockSelect?.(
                      {
                        id: "__hero__",
                        type: "title",
                        show: true,
                        textStyles: (profile as any).heroTextStyles,
                      } as any,
                      -1,
                      textKey,
                      textLabel,
                    ),
                }}
              >
                <div className="space-y-6">
                  {p.showWelcomeText && (
                    <InlineEdit
                      tag="p"
                      editMode={editMode}
                      value={p.welcomeText?.trim() ?? "Impreuna cu familiile noastre"}
                      onChange={(v) => upProfile("welcomeText", v)}
                      textKey="hero:intro-welcome"
                      textLabel="Intro welcome"
                      placeholder="Cine invita..."
                      style={{
                        fontFamily: APPLE_DISPLAY_FONT,
                        fontSize: "0.65rem",
                        fontWeight: 600,
                        letterSpacing: "0.26em",
                        textTransform: "uppercase",
                        color: T.MUTED,
                      }}
                    />
                  )}

                  <div>
                    <HairlineRule />
                  </div>

                  {isBaptism ? (
                    <div>
                      <InlineEdit
                        tag="h1"
                        editMode={editMode}
                        value={p.partner1Name || ""}
                        onChange={(v) => upProfile("partner1Name", v)}
                        placeholder="Prenume"
                        textKey="hero:partner1"
                        textLabel="Partener 1"
                        style={{
                          display: "block",
                          fontFamily: APPLE_DISPLAY_FONT,
                          fontSize: "clamp(3.4rem, 12vw, 6rem)",
                          lineHeight: 0.95,
                          letterSpacing: "-0.06em",
                          color: T.PINK_DARK,
                          fontWeight: 700,
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 0,
                      }}
                    >
                      <InlineEdit
                        tag="span"
                        editMode={editMode}
                        value={p.partner1Name || ""}
                        onChange={(v) => upProfile("partner1Name", v)}
                        placeholder="Ea"
                        textKey="hero:partner1"
                        textLabel="Partener 1"
                        style={{
                          display: "block",
                          fontFamily: APPLE_DISPLAY_FONT,
                          fontSize: "clamp(3rem, 10vw, 5.4rem)",
                          lineHeight: 0.95,
                          letterSpacing: "-0.07em",
                          color: T.PINK_DARK,
                          fontWeight: 700,
                          textAlign: "center",
                          wordBreak: "break-word",
                          width: "100%",
                        }}
                      />
                      <span
                        style={{
                          fontFamily: APPLE_DISPLAY_FONT,
                          fontSize: "clamp(1.05rem, 3vw, 1.35rem)",
                          color: T.MUTED,
                          lineHeight: 1,
                          marginTop: 10,
                          marginBottom: 10,
                          fontWeight: 500,
                        }}
                      >
                        &amp;
                      </span>
                      <InlineEdit
                        tag="span"
                        editMode={editMode}
                        value={p.partner2Name || ""}
                        onChange={(v) => upProfile("partner2Name", v)}
                        placeholder="El"
                        textKey="hero:partner2"
                        textLabel="Partener 2"
                        style={{
                          display: "block",
                          fontFamily: APPLE_DISPLAY_FONT,
                          fontSize: "clamp(3rem, 10vw, 5.4rem)",
                          lineHeight: 0.95,
                          letterSpacing: "-0.07em",
                          color: T.PINK_DARK,
                          fontWeight: 700,
                          textAlign: "center",
                          wordBreak: "break-word",
                          width: "100%",
                        }}
                      />
                    </div>
                  )}

                  <HairlineRule />

                  {p.showCelebrationText && (
                    <InlineEdit
                      tag="p"
                      editMode={editMode}
                      value={String(
                        (p as any).invitationText ?? CASTLE_DEFAULTS.invitationText,
                      ).trim()}
                      onChange={(v) => upProfile("invitationText", v)}
                      placeholder="Text invitatie..."
                      textKey="hero:intro-invite-text"
                      textLabel="Intro text invitatie"
                      style={{
                        fontFamily: APPLE_DISPLAY_FONT,
                        fontSize: "1rem",
                        fontWeight: 400,
                        color: T.MUTED,
                        lineHeight: 1.7,
                        maxWidth: 560,
                        margin: "0 auto",
                      }}
                    />
                  )}
                </div>
              </BlockStyleProvider>

              <div
                className="re-apple-card"
                style={{
                  padding: "14px 24px",
                }}
              >
                <p
                  style={{
                    fontFamily: APPLE_DISPLAY_FONT,
                    fontSize: "0.54rem",
                    fontWeight: 600,
                    letterSpacing: "0.24em",
                    textTransform: "uppercase",
                    color: T.MUTED,
                    marginBottom: 6,
                  }}
                >
                  Invitat de onoare
                </p>
                <p
                  style={{
                    fontFamily: APPLE_DISPLAY_FONT,
                    fontSize: "1.35rem",
                    fontWeight: 600,
                    letterSpacing: "-0.03em",
                    color: T.PINK_DARK,
                  }}
                >
                  {guestDisplayName}
                </p>
              </div>

              <div className="re-apple-card" style={{ padding: "18px 22px" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="h-px w-10" style={{ background: T.PINK_L }} />
                    <Calendar className="w-4 h-4" style={{ color: T.MUTED }} />
                    <div className="h-px w-10" style={{ background: T.PINK_L }} />
                  </div>
                  <p
                    style={{
                      fontFamily: APPLE_DISPLAY_FONT,
                      fontWeight: 600,
                      fontSize: "0.72rem",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: T.PINK_DARK,
                    }}
                  >
                    {dateStr}
                  </p>
                </div>
              </div>

              {p.showCountdown && p.weddingDate && !countdown.expired && (
                <div className="re-apple-card" style={{ padding: "24px 18px" }}>
                  <InlineEdit
                    tag="p"
                    editMode={editMode}
                    value={((p as any).heroCountdownText || CASTLE_DEFAULTS.heroCountdownText).trim()}
                    onChange={(v) => upProfile("heroCountdownText", v)}
                    placeholder="Titlu countdown..."
                    textKey="hero:countdown-title"
                    textLabel="Hero countdown title"
                    style={{
                      fontFamily: APPLE_DISPLAY_FONT,
                      fontSize: "0.56rem",
                      fontWeight: 600,
                      letterSpacing: "0.24em",
                      textTransform: "uppercase",
                      color: T.PINK_D,
                      marginBottom: 16,
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 14,
                      flexWrap: "wrap",
                    }}
                  >
                    <CUnit value={countdown.days} label="Zile" />
                    <CUnit value={countdown.hours} label="Ore" />
                    <CUnit value={countdown.minutes} label="Min" />
                    <CUnit value={countdown.seconds} label="Sec" />
                  </div>
                </div>
              )}

              {editMode && (
                <InsertBlockButton
                  insertIdx={-1}
                  openInsertAt={openInsertAt}
                  setOpenInsertAt={setOpenInsertAt}
                  blockTypes={BLOCK_TYPES}
                  onInsert={(type, def) => handleInsertAt(-1, type, def)}
                />
              )}

              {displayBlocks.map((block) => {
                const isVisible = block.show !== false;
                const realIdx = blocks.indexOf(block);
                const isSelected = selectedBlockId === block.id;

                return (
                  <div key={block.id} className="group/insert">
                    <div
                      className={cn(
                        "relative group/block",
                        !isVisible && editMode && "opacity-35",
                        isSelected && "z-10",
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
                      {editMode && (
                        <div
                          className="absolute inset-0 transition-all pointer-events-none"
                          style={{
                            boxShadow: isSelected
                              ? `inset 0 0 0 1px ${T.PINK_DARK}`
                              : undefined,
                          }}
                        />
                      )}

                      <BlockStyleProvider
                        value={{
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
                        } as BlockStyle}
                      >
                        {block.type === "location" && (
                          <div
                            className="re-apple-card"
                            style={{
                              overflow: "hidden",
                            }}
                          >
                            <div
                              className="h-0.5"
                              style={{
                                background: `linear-gradient(90deg, ${T.PINK_L}, ${T.PINK_D}, ${T.PINK_L})`,
                              }}
                            />
                            <div style={{ padding: "16px 20px" }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: 8,
                                  marginBottom: 10,
                                }}
                              >
                                <InlineEdit
                                  tag="p"
                                  editMode={editMode}
                                  value={block.label || ""}
                                  onChange={(v) => updBlock(realIdx, { label: v })}
                                  placeholder="Titlu locatie..."
                                  textKey={`${block.id}:location-label`}
                                  textLabel="Locatie — Label"
                                  style={{
                                    fontFamily: "Montserrat, sans-serif",
                                    fontSize: "0.58rem",
                                    fontWeight: 700,
                                    letterSpacing: "0.3em",
                                    textTransform: "uppercase",
                                    color: T.MUTED,
                                  }}
                                />
                                <div
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                    border: `1px solid ${T.PINK_L}`,
                                    padding: "4px 10px",
                                    background: "rgba(255,255,255,0.05)",
                                    borderRadius: 999,
                                  }}
                                >
                                  <Clock className="w-3 h-3" style={{ color: T.MUTED }} />
                                  <InlineTime
                                    value={block.time || ""}
                                    onChange={(v) => updBlock(realIdx, { time: v })}
                                    editMode={editMode}
                                    textKey={`${block.id}:location-time`}
                                    textLabel="Locatie — Ora"
                                    style={{
                                      fontFamily: "Montserrat, sans-serif",
                                      fontWeight: 700,
                                      fontSize: "0.72rem",
                                      color: T.PINK_DARK,
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
                                textLabel="Locatie — Nume"
                                style={{
                                  fontFamily: "Georgia, serif",
                                  fontSize: "1.15rem",
                                  color: T.PINK_DARK,
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
                                textLabel="Locatie — Adresa"
                                style={{
                                  fontFamily: "Montserrat, sans-serif",
                                  fontSize: "0.7rem",
                                  color: T.MUTED,
                                  fontStyle: "italic",
                                  lineHeight: 1.4,
                                }}
                              />
                              {(() => {
                                const wazeHref = (block.wazeLink || "").trim();
                                const mapsQuery =
                                  `${block.locationName || ""} ${block.locationAddress || ""}`.trim();
                                const mapsHref = String(
                                  (block as any).mapsLink ||
                                    (mapsQuery
                                      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`
                                      : ""),
                                ).trim();
                                return (
                                  <>
                                    {(wazeHref || mapsHref) && (
                                      <div
                                        style={{
                                          display: "flex",
                                          flexWrap: "wrap",
                                          justifyContent: "center",
                                          alignItems: "center",
                                          gap: 12,
                                          marginTop: 14,
                                        }}
                                      >
                                        {wazeHref && (
                                          <a
                                            href={wazeHref}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                              display: "inline-flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              gap: 8,
                                              minWidth: 132,
                                              border: `1px solid ${T.PINK_L}`,
                                              background: "rgba(255,255,255,0.03)",
                                              color: T.PINK_DARK,
                                              padding: "10px 18px",
                                              borderRadius: 14,
                                              boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
                                              backdropFilter: "blur(14px)",
                                              fontFamily: "Montserrat, sans-serif",
                                              fontSize: "0.68rem",
                                              fontWeight: 700,
                                              letterSpacing: "0.15em",
                                              textTransform: "uppercase",
                                              textDecoration: "none",
                                            }}
                                          >
                                            <Navigation className="h-4 w-4" />
                                            Waze
                                          </a>
                                        )}
                                        {mapsHref && (
                                          <a
                                            href={mapsHref}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                              display: "inline-flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              gap: 8,
                                              minWidth: 132,
                                              border: `1px solid ${T.PINK_L}`,
                                              background: "rgba(255,255,255,0.03)",
                                              color: T.PINK_DARK,
                                              padding: "10px 18px",
                                              borderRadius: 14,
                                              boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
                                              backdropFilter: "blur(14px)",
                                              fontFamily: "Montserrat, sans-serif",
                                              fontSize: "0.68rem",
                                              fontWeight: 700,
                                              letterSpacing: "0.15em",
                                              textTransform: "uppercase",
                                              textDecoration: "none",
                                            }}
                                          >
                                            <MapPin className="h-4 w-4" />
                                            Maps
                                          </a>
                                        )}
                                      </div>
                                    )}
                                    {editMode && (
                                      <InlineWaze
                                        value={block.wazeLink || ""}
                                        onChange={(v) => updBlock(realIdx, { wazeLink: v })}
                                        editMode={editMode}
                                      />
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        )}

                        {block.type === "godparents" && (
                          <div
                            className="re-apple-card"
                            style={{
                              overflow: "hidden",
                            }}
                          >
                            <div
                              className="h-0.5"
                              style={{
                                background: `linear-gradient(90deg, ${T.PINK_L}, ${T.PINK_D}, ${T.PINK_L})`,
                              }}
                            />
                            <div style={{ padding: "16px 20px" }}>
                              <InlineEdit
                                tag="p"
                                editMode={editMode}
                                value={block.sectionTitle || "Nasii Nostri"}
                                onChange={(v) => updBlock(realIdx, { sectionTitle: v })}
                                placeholder="Titlu..."
                                textKey={`${block.id}:godparents-title`}
                                textLabel="Nasi — Titlu"
                                style={{
                                  fontFamily: "Montserrat, sans-serif",
                                  fontSize: "0.58rem",
                                  fontWeight: 700,
                                  letterSpacing: "0.3em",
                                  textTransform: "uppercase",
                                  color: T.MUTED,
                                  marginBottom: 8,
                                }}
                              />
                              <InlineEdit
                                tag="p"
                                editMode={editMode}
                                value={block.content || ""}
                                onChange={(v) => updBlock(realIdx, { content: v })}
                                placeholder="Text introductiv..."
                                textKey={`${block.id}:godparents-content`}
                                textLabel="Nasi — Text"
                                style={{
                                  fontFamily: "Georgia, serif",
                                  fontSize: "0.9rem",
                                  fontStyle: "italic",
                                  color: T.MUTED,
                                  marginBottom: 10,
                                }}
                                multiline
                              />
                              <div
                                style={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  justifyContent: "center",
                                  gap: "8px 24px",
                                }}
                              >
                                {godparents.map((g: any, i: number) => (
                                  <div
                                    key={i}
                                    className={cn(
                                      "flex items-center gap-1.5",
                                      editMode && "group/gp relative",
                                    )}
                                    style={{
                                      fontFamily: "Georgia, serif",
                                      fontSize: "0.95rem",
                                      color: T.PINK_DARK,
                                      fontStyle: "italic",
                                    }}
                                  >
                                    <InlineEdit
                                      tag="span"
                                      editMode={editMode}
                                      value={g.godfather || ""}
                                      onChange={(v) => updGodparent(i, "godfather", v)}
                                      placeholder="Nas"
                                      textKey={`${block.id}:godparent-${i}-godfather`}
                                      textLabel={`Nasi — Nas ${i + 1}`}
                                    />
                                    <span style={{ color: T.PINK_D }}>&amp;</span>
                                    <InlineEdit
                                      tag="span"
                                      editMode={editMode}
                                      value={g.godmother || ""}
                                      onChange={(v) => updGodparent(i, "godmother", v)}
                                      placeholder="Nasa"
                                      textKey={`${block.id}:godparent-${i}-godmother`}
                                      textLabel={`Nasi — Nasa ${i + 1}`}
                                    />
                                    {editMode && (
                                      <button
                                        type="button"
                                        onClick={() => delGodparent(i)}
                                        className="opacity-0 group-hover/gp:opacity-100 transition-opacity p-0.5 hover:bg-red-50"
                                      >
                                        <Trash2 className="w-3 h-3 text-red-400" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                                {editMode && (
                                  <button
                                    type="button"
                                    onClick={addGodparent}
                                    style={{
                                      fontFamily: "Montserrat, sans-serif",
                                      fontSize: "0.58rem",
                                      color: T.MUTED,
                                      border: `1px dashed ${T.PINK_L}`,
                                      padding: "2px 10px",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 4,
                                    }}
                                  >
                                    <Plus className="w-2.5 h-2.5" /> adauga
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {block.type === "parents" && (
                          <div
                            className="re-apple-card"
                            style={{
                              overflow: "hidden",
                            }}
                          >
                            <div
                              className="h-0.5"
                              style={{
                                background: `linear-gradient(90deg, ${T.PINK_L}, ${T.PINK_D}, ${T.PINK_L})`,
                              }}
                            />
                            <div style={{ padding: "16px 20px" }}>
                              <InlineEdit
                                tag="p"
                                editMode={editMode}
                                value={block.sectionTitle || "Parintii Nostri"}
                                onChange={(v) => updBlock(realIdx, { sectionTitle: v })}
                                placeholder="Titlu..."
                                textKey={`${block.id}:parents-title`}
                                textLabel="Parinti — Titlu"
                                style={{
                                  fontFamily: "Montserrat, sans-serif",
                                  fontSize: "0.58rem",
                                  fontWeight: 700,
                                  letterSpacing: "0.3em",
                                  textTransform: "uppercase",
                                  color: T.MUTED,
                                  marginBottom: 8,
                                }}
                              />
                              <InlineEdit
                                tag="p"
                                editMode={editMode}
                                value={block.content || ""}
                                onChange={(v) => updBlock(realIdx, { content: v })}
                                placeholder="Text introductiv..."
                                textKey={`${block.id}:parents-content`}
                                textLabel="Parinti — Text"
                                style={{
                                  fontFamily: "Georgia, serif",
                                  fontSize: "0.9rem",
                                  fontStyle: "italic",
                                  color: T.MUTED,
                                  marginBottom: 10,
                                }}
                                multiline
                              />
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                {([
                                  { key: "p1_father", ph: "Tatal Miresei" },
                                  { key: "p1_mother", ph: "Mama Miresei" },
                                  { key: "p2_father", ph: "Tatal Mirelui" },
                                  { key: "p2_mother", ph: "Mama Mirelui" },
                                ] as const).map(({ key, ph }) => {
                                  const val = parentsData?.[key];
                                  if (!val && !editMode) return null;
                                  return (
                                    <InlineEdit
                                      key={key}
                                      tag="p"
                                      editMode={editMode}
                                      value={val || ""}
                                      onChange={(v) => updParent(key, v)}
                                      placeholder={ph}
                                      textKey={`${block.id}:parent-${key}`}
                                      textLabel={`Parinti — ${ph}`}
                                      style={{
                                        fontFamily: "Georgia, serif",
                                        fontSize: "0.95rem",
                                        fontStyle: "italic",
                                        color: T.PINK_DARK,
                                      }}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}

                        {block.type === "photo" && (
                          <PhotoBlock
                            block={block}
                            editMode={editMode}
                            onUpdate={(patch) => updBlock(realIdx, patch)}
                            placeholderInitial1={p.partner1Name?.[0] || "M"}
                          />
                        )}

                        {block.type === "text" && (
                          <div
                            className={cn(editMode && "px-3 py-2")}
                            style={{ background: editMode ? T.PINK_XL : "transparent" }}
                          >
                            <InlineEdit
                              tag="p"
                              editMode={editMode}
                              value={block.content || ""}
                              onChange={(v) => updBlock(realIdx, { content: v })}
                              placeholder="Scrieti un mesaj..."
                              textKey={`${block.id}:text-content`}
                              textLabel="Text — Continut"
                              style={{
                                fontFamily: "Georgia, serif",
                                fontSize: "0.95rem",
                                fontStyle: "italic",
                                color: T.MUTED,
                                lineHeight: 1.7,
                              }}
                              multiline
                            />
                          </div>
                        )}

                        {block.type === "title" && (
                          <InlineEdit
                            tag="p"
                            editMode={editMode}
                            value={block.content || ""}
                            onChange={(v) => updBlock(realIdx, { content: v })}
                            placeholder="Titlu sectiune..."
                            textKey={`${block.id}:title-content`}
                            textLabel="Titlu bloc"
                            style={{
                              fontFamily: "Montserrat, sans-serif",
                              fontSize: "0.58rem",
                              fontWeight: 700,
                              letterSpacing: "0.32em",
                              textTransform: "uppercase",
                              color: T.MUTED,
                            }}
                          />
                        )}

                        {block.type === "description" && (
                          <div
                            className={cn(editMode && "px-3 py-2")}
                            style={{ background: editMode ? T.PINK_XL : "transparent" }}
                          >
                            <InlineEdit
                              tag="p"
                              editMode={editMode}
                              value={block.content || ""}
                              onChange={(v) => updBlock(realIdx, { content: v })}
                              placeholder="Descriere..."
                              textKey={`${block.id}:description-content`}
                              textLabel="Descriere bloc"
                              style={{
                                fontFamily: "Georgia, serif",
                                fontSize: "0.95rem",
                                fontStyle: "italic",
                                color: T.MUTED,
                                lineHeight: 1.7,
                              }}
                              multiline
                            />
                          </div>
                        )}

                        {block.type === "date" && (
                          <p
                            style={{
                              fontFamily: "Montserrat, sans-serif",
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              letterSpacing: "0.22em",
                              textTransform: "uppercase",
                              color: T.PINK_DARK,
                              textAlign: "center",
                            }}
                          >
                            {dateStr}
                          </p>
                        )}

                        {block.type === "calendar" && (
                          <div className="re-apple-card" style={{ padding: 16 }}>
                            <CalendarMonth date={p.weddingDate} />
                          </div>
                        )}

                        {block.type === "countdown" && (
                          <div className="re-apple-card" style={{ padding: 16 }}>
                            <FlipClock
                              targetDate={p.weddingDate}
                              bgColor={T.PINK_DARK}
                              textColor="white"
                              accentColor={T.PINK_L}
                              labelColor="rgba(255,255,255,0.75)"
                              editMode={editMode}
                              titleText={
                                block.countdownTitle ||
                                "Timp ramas pana la marele eveniment"
                              }
                              onTitleChange={(text) =>
                                updBlock(realIdx, { countdownTitle: text })
                              }
                              titleTextKey={`${block.id}:countdown-title`}
                              titleTextLabel="Countdown — Titlu"
                            />
                          </div>
                        )}

                        {block.type === "music" && (
                          <MusicBlock
                            block={block}
                            editMode={editMode}
                            onUpdate={(patch) => updBlock(realIdx, patch)}
                          />
                        )}

                        {block.type === "gift" && (
                          <div
                            className="re-apple-card"
                            style={{
                              padding: "20px 20px",
                              textAlign: "center",
                            }}
                          >
                            <Gift
                              className="w-6 h-6 mx-auto mb-3"
                              style={{ color: T.PINK_DARK, opacity: 0.6 }}
                            />
                            <InlineEdit
                              tag="h3"
                              editMode={editMode}
                              value={block.sectionTitle || "Sugestie cadou"}
                              onChange={(v) => updBlock(realIdx, { sectionTitle: v })}
                              textKey={`${block.id}:gift-title`}
                              textLabel="Cadou — Titlu"
                              style={{
                                fontFamily: "Georgia, serif",
                                fontSize: "1.25rem",
                                color: T.PINK_DARK,
                                marginBottom: 8,
                              }}
                            />
                            <InlineEdit
                              tag="p"
                              editMode={editMode}
                              value={block.content || ""}
                              onChange={(v) => updBlock(realIdx, { content: v })}
                              textKey={`${block.id}:gift-content`}
                              textLabel="Cadou — Text"
                              style={{
                                fontFamily: "Georgia, serif",
                                fontSize: "0.9rem",
                                fontStyle: "italic",
                                color: T.MUTED,
                                marginBottom: 8,
                              }}
                              multiline
                            />
                            {(block.iban || editMode) && (
                              <InlineEdit
                                tag="p"
                                editMode={editMode}
                                value={block.iban || ""}
                                onChange={(v) => updBlock(realIdx, { iban: v })}
                                textKey={`${block.id}:gift-iban`}
                                textLabel="Cadou — IBAN"
                                placeholder="IBAN..."
                                style={{
                                  fontFamily: "Montserrat, sans-serif",
                                  fontSize: "0.72rem",
                                  fontWeight: 700,
                                  color: T.PINK_DARK,
                                  marginBottom: 4,
                                }}
                              />
                            )}
                            {(block.ibanName || editMode) && (
                              <InlineEdit
                                tag="p"
                                editMode={editMode}
                                value={block.ibanName || ""}
                                onChange={(v) => updBlock(realIdx, { ibanName: v })}
                                textKey={`${block.id}:gift-iban-name`}
                                textLabel="Cadou — Beneficiar"
                                placeholder="Beneficiar..."
                                style={{
                                  fontFamily: "Montserrat, sans-serif",
                                  fontSize: "0.68rem",
                                  color: T.MUTED,
                                }}
                              />
                            )}
                          </div>
                        )}

                        {block.type === "whatsapp" && (
                          <div style={{ textAlign: "center", padding: "8px 0" }}>
                            <a
                              href={`https://wa.me/${(block.content || "").replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "12px 28px",
                                background: `linear-gradient(135deg, ${T.PINK_D}, ${T.PINK_DARK})`,
                                color: "white",
                                fontFamily: "Montserrat, sans-serif",
                                fontSize: "0.62rem",
                                fontWeight: 700,
                                letterSpacing: "0.22em",
                                textTransform: "uppercase",
                                textDecoration: "none",
                              }}
                            >
                              <MessageCircle className="w-4 h-4" />
                              <InlineEdit
                                tag="span"
                                editMode={editMode}
                                value={block.label || "Contact WhatsApp"}
                                onChange={(v) => updBlock(realIdx, { label: v })}
                                textKey={`${block.id}:whatsapp-label`}
                                textLabel="WhatsApp — Label"
                              />
                            </a>
                            {editMode && (
                              <div style={{ marginTop: 6 }}>
                                <InlineEdit
                                  tag="p"
                                  editMode={editMode}
                                  value={block.content || ""}
                                  onChange={(v) => updBlock(realIdx, { content: v })}
                                  textKey={`${block.id}:whatsapp-number`}
                                  textLabel="WhatsApp — Numar"
                                  placeholder="Numar..."
                                  style={{
                                    fontFamily: "Montserrat, sans-serif",
                                    fontSize: "0.7rem",
                                    color: T.MUTED,
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {block.type === "rsvp" && (
                          <div style={{ display: "flex", justifyContent: "center" }}>
                            <button
                              onClick={() => {
                                if (!editMode) onOpenRSVP?.();
                              }}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                minWidth: 180,
                                padding: "14px 24px",
                                background: "rgba(255,255,255,0.03)",
                                color: T.PINK_DARK,
                                border: `1px solid ${T.PINK_L}`,
                                borderRadius: 16,
                                boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
                                backdropFilter: "blur(14px)",
                                cursor: "pointer",
                                fontFamily: "Montserrat, sans-serif",
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                letterSpacing: "0.2em",
                                textTransform: "uppercase",
                              }}
                            >
                              <InlineEdit
                                tag="span"
                                editMode={editMode}
                                value={block.label || "Confirma Prezenta"}
                                onChange={(v) => updBlock(realIdx, { label: v })}
                                textKey={`${block.id}:rsvp-label`}
                                textLabel="RSVP — Label"
                              />
                            </button>
                          </div>
                        )}

                        {block.type === "family" &&
                          (() => {
                            const members: { name1: string; name2: string }[] = (() => {
                              try {
                                return JSON.parse(block.members || "[]");
                              } catch {
                                return [];
                              }
                            })();
                            const updateMembers = (nm: { name1: string; name2: string }[]) => {
                              updBlock(realIdx, { members: JSON.stringify(nm) } as any);
                            };
                            return (
                              <div
                                style={{
                                  border: `1px solid ${T.PINK_L}`,
                                  background: "rgba(255,255,255,0.02)",
                                  padding: "16px 20px",
                                  textAlign: "center",
                                }}
                              >
                                <InlineEdit
                                  tag="p"
                                  editMode={editMode}
                                  value={block.label || "Familie"}
                                  onChange={(v) => updBlock(realIdx, { label: v })}
                                  textKey={`${block.id}:family-label`}
                                  textLabel="Familie — Titlu"
                                  style={{
                                    fontFamily: "Montserrat, sans-serif",
                                    fontSize: "0.58rem",
                                    fontWeight: 700,
                                    letterSpacing: "0.3em",
                                    textTransform: "uppercase",
                                    color: T.MUTED,
                                    marginBottom: 8,
                                  }}
                                />
                                <InlineEdit
                                  tag="p"
                                  editMode={editMode}
                                  value={block.content || ""}
                                  onChange={(v) => updBlock(realIdx, { content: v })}
                                  textKey={`${block.id}:family-content`}
                                  textLabel="Familie — Text"
                                  style={{
                                    fontFamily: "Georgia, serif",
                                    fontSize: "0.9rem",
                                    fontStyle: "italic",
                                    color: T.MUTED,
                                    marginBottom: 10,
                                  }}
                                  multiline
                                />
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 6,
                                  }}
                                >
                                  {members.map((m, mi) => (
                                    <div
                                      key={mi}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        flexWrap: "wrap",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <InlineEdit
                                        tag="span"
                                        editMode={editMode}
                                        value={m.name1}
                                        onChange={(v) => {
                                          const nm = [...members];
                                          nm[mi] = { ...nm[mi], name1: v };
                                          updateMembers(nm);
                                        }}
                                        textKey={`${block.id}:family-member-${mi}-1`}
                                        textLabel={`Familie — Nume ${mi + 1}.1`}
                                        style={{
                                          fontFamily: "Georgia, serif",
                                          fontSize: "1.1rem",
                                          color: T.PINK_DARK,
                                        }}
                                      />
                                      <span style={{ color: T.PINK_D }}>&amp;</span>
                                      <InlineEdit
                                        tag="span"
                                        editMode={editMode}
                                        value={m.name2}
                                        onChange={(v) => {
                                          const nm = [...members];
                                          nm[mi] = { ...nm[mi], name2: v };
                                          updateMembers(nm);
                                        }}
                                        textKey={`${block.id}:family-member-${mi}-2`}
                                        textLabel={`Familie — Nume ${mi + 1}.2`}
                                        style={{
                                          fontFamily: "Georgia, serif",
                                          fontSize: "1.1rem",
                                          color: T.PINK_DARK,
                                        }}
                                      />
                                      {editMode && members.length > 1 && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            updateMembers(
                                              members.filter((_, i) => i !== mi),
                                            )
                                          }
                                          style={{
                                            color: "#ef4444",
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            fontSize: "0.75rem",
                                          }}
                                        >
                                          ×
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                                {editMode && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateMembers([
                                        ...members,
                                        { name1: "Nume 1", name2: "Nume 2" },
                                      ])
                                    }
                                    style={{
                                      marginTop: 12,
                                      fontFamily: "Montserrat, sans-serif",
                                      fontSize: "0.58rem",
                                      fontWeight: 700,
                                      letterSpacing: "0.18em",
                                      textTransform: "uppercase",
                                      border: `1px dashed ${T.PINK_L}`,
                                      color: T.MUTED,
                                      background: "transparent",
                                      padding: "4px 14px",
                                      cursor: "pointer",
                                    }}
                                  >
                                    + Adauga
                                  </button>
                                )}
                              </div>
                            );
                          })()}

                        {block.type === "divider" && <EditorialDiamond />}
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
                      />
                    )}
                  </div>
                );
              })}

              {p.showTimeline && timeline.length > 0 && (
                <BlockStyleProvider
                  value={{
                    blockId: "__timeline__",
                    textStyles: (profile as any).timelineTextStyles,
                    onTextSelect: (textKey, textLabel) =>
                      onBlockSelect?.(
                        {
                          id: "__timeline__",
                          type: "timeline" as any,
                          show: true,
                          textStyles: (profile as any).timelineTextStyles,
                        } as any,
                        -1,
                        textKey,
                        textLabel,
                      ),
                  }}
                >
                  <div>
                    <HairlineRule label="Programul Zilei" className="mb-4" />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        maxWidth: 320,
                        margin: "0 auto",
                      }}
                    >
                      {timeline.map((item: any) => (
                        <div
                          key={item.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <InlineEdit
                            tag="span"
                            editMode={editMode}
                            value={item.time || ""}
                            onChange={(v) => updateTimelineItem(item.id, { time: v })}
                            textKey={`timeline:${item.id}:time`}
                            textLabel="Timeline — Ora"
                            style={
                              {
                                fontFamily: "Montserrat, sans-serif",
                                fontWeight: 700,
                                fontSize: "0.72rem",
                                color: T.PINK_D,
                                flexShrink: 0,
                                tabularNums: true,
                              } as any
                            }
                          />
                          <div style={{ flex: 1, height: 1, background: T.PINK_L }} />
                          <InlineEdit
                            tag="span"
                            editMode={editMode}
                            value={item.title || ""}
                            onChange={(v) => updateTimelineItem(item.id, { title: v })}
                            textKey={`timeline:${item.id}:title`}
                            textLabel="Timeline — Titlu"
                            style={{
                              fontFamily: "Montserrat, sans-serif",
                              fontWeight: 600,
                              fontSize: "0.7rem",
                              color: T.PINK_DARK,
                              textAlign: "right",
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </BlockStyleProvider>
              )}

              <EditorialDiamond />

              {p.showRsvpButton !== false && !hasRsvpBlock && (
                <div>
                  {editMode ? (
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: 180,
                        background: "rgba(255,255,255,0.03)",
                        border: `1px solid ${T.PINK_L}`,
                        borderRadius: 16,
                        boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
                        backdropFilter: "blur(14px)",
                        padding: "14px 24px",
                      }}
                    >
                      <InlineEdit
                        tag="span"
                        editMode={editMode}
                        value={p.rsvpButtonText?.trim() || "Confirma Prezenta"}
                        onChange={(v) => upProfile("rsvpButtonText", v)}
                        style={{
                          color: T.PINK_DARK,
                          fontFamily: "Montserrat, sans-serif",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                          cursor: "text",
                        }}
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => onOpenRSVP && onOpenRSVP()}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: 180,
                        padding: "14px 24px",
                        background: "rgba(255,255,255,0.03)",
                        color: T.PINK_DARK,
                        border: `1px solid ${T.PINK_L}`,
                        borderRadius: 16,
                        boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
                        backdropFilter: "blur(14px)",
                        cursor: "pointer",
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                      }}
                    >
                      {p.rsvpButtonText?.trim() || "Confirma Prezenta"}
                    </button>
                  )}
                </div>
              )}
            </div>

            
          </div>

          <div className="text-center mt-5">
            <p
              style={{
                fontFamily: APPLE_DISPLAY_FONT,
                fontSize: "0.5rem",
                fontWeight: 600,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: T.MUTED,
              }}
            >
              {p.partner1Name} &amp; {p.partner2Name} ·{" "}
              {p.weddingDate ? new Date(p.weddingDate).getFullYear() : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoyalRoseNoirTemplate;
