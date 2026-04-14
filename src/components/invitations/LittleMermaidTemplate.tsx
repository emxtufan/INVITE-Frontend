import React, { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

import { BlockStyleProvider } from "../BlockStyleContext";
import { InvitationTemplateProps, TemplateMeta } from "./types";
import { InvitationBlock, InvitationBlockType } from "../../types";
import { InlineEdit, InlineTime, InlineWaze } from "./InlineEdit";
import { getMermaidTheme } from "./castleDefaults";
import { API_URL } from "../../config/api";
import {
  ChevronUp, ChevronDown, Eye, EyeOff, Trash2, Upload, Camera,
  Play, Pause, SkipForward, SkipBack, Gift, Music, MessageCircle, MapPin,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// META
// ─────────────────────────────────────────────────────────────────────────────
export const meta: TemplateMeta = {
  id: 'little-mermaid',
  name: 'Mica Sirena',
  category: 'kids',
  description: 'Lume subacvatica cu intro pe usi oceanice, optimizata pentru mobil.',
  colors: ['#041E42', '#00C8AA', '#0D4A8A', '#E8F7F9'],
  previewClass: "bg-blue-950 border-cyan-500",
  elementsClass: "bg-cyan-400",
};

// ─────────────────────────────────────────────────────────────────────────────
// API
// ─────────────────────────────────────────────────────────────────────────────
function deleteUploadedFile(url: string | undefined) {
  if (!url || !url.startsWith('/uploads/')) return;
  const _s = JSON.parse(localStorage.getItem('weddingPro_session') || '{}');
  fetch(`${API_URL}/upload`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${_s?.token || ''}` },
    body: JSON.stringify({ url }),
  }).catch(() => {});
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─────────────────────────────────────────────────────────────────────────────
// COLORS — module level, fixed palette
// ─────────────────────────────────────────────────────────────────────────────
let C = {
  darkJungle : "#041E42",
  midJungle  : "#0A2D5A",
  stone      : "#0D4A8A",
  amber      : "#00C8AA",
  amberLight : "#7FFFDA",
  cream      : "#E8F7F9",
  muted      : "rgba(127,255,218,0.6)",
  moss       : "#FF6B6B",
  text       : "#E8F7F9",
};

// ─────────────────────────────────────────────────────────────────────────────
// FONTS
// ─────────────────────────────────────────────────────────────────────────────
const display = "'Cinzel','Georgia',serif";
const serif   = "'Lora','Georgia',serif";
const sans    = "'Oswald','system-ui',sans-serif";

// ─────────────────────────────────────────────────────────────────────────────
// IMAGE PATHS
// ─────────────────────────────────────────────────────────────────────────────
const IMG_LOGO      = "https://event-smart-assistant.com/uploads/ariel/vibrant-rainbow-nautilus-shell-illustration-png-image_15516679.png";
const IMG_RAPTOR1   = "https://event-smart-assistant.com/uploads/ariel/vibrant-hermit-crab-with-rainbow-shell-png-image_18653922.webp";
const IMG_RAPTOR2   = "https://event-smart-assistant.com/uploads/ariel/colorful-rainbow-snail-cartoon-character-png-image_18184124.webp";
const IMG_GATE      = "https://event-smart-assistant.com/uploads/ariel/pngtree-vibrant-rainbow-fish-with-flowing-fins-png-image_14200161.png";
const IMG_TORCH     = "https://event-smart-assistant.com/uploads/ariel/pngtree-vibrant-rainbow-fish-with-flowing-fins-png-image_14200161.png";

const IMG_LEAF1     = "https://event-smart-assistant.com/uploads/ariel/pngtree-vibrant-rainbow-fish-with-flowing-fins-png-image_14200161.png";
const IMG_LEAF2     = "https://event-smart-assistant.com/uploads/ariel/colorful-rainbow-snail-cartoon-character-png-image_18184124.webp";

const IMG_FOOTPRINT = "https://event-smart-assistant.com/uploads/ariel/rainbow-colored-star-sticker-with-a-smiling-face-vector-png-image_6877755.png";
const IMG_EGG       = "https://event-smart-assistant.com/uploads/ariel/vibrant-rainbow-nautilus-shell-illustration-png-image_15516679.png";
const IMG_FERN      = "https://event-smart-assistant.com/uploads/ariel/colorful-rainbow-snail-cartoon-character-png-image_18184124.webp";
const IMG_TREX      = "https://event-smart-assistant.com/uploads/ariel/pngtree-iridescent-scallop-shell-with-soft-rainbow-hues-on-black-background-png-image_17614604.webp";
const IMG_DINO1     = "https://event-smart-assistant.com/uploads/ariel/pngtree-a-colorful-rainbow-star-shaped-candy-with-big-eyes-and-cute-png-image_15920607.png";
const IMG_DINO2     = "https://event-smart-assistant.com/uploads/ariel/pngtree-vibrant-rainbow-star-character-with-smiling-face-and-playful-gesture-in-png-image_18434733.webp";
const IMG_HERO      = "https://event-smart-assistant.com/uploads/ariel/9c59b582098768b3d94b5c5121507117.jpg";

// ─────────────────────────────────────────────────────────────────────────────
// CSS GLOBAL
// ─────────────────────────────────────────────────────────────────────────────
const JR_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Lora:ital,wght@0,400;0,600;1,400&family=Oswald:wght@400;500;600;700&display=swap');
  @keyframes jr-float   { 0%,100%{transform:translateY(0) rotate(-.5deg)} 50%{transform:translateY(-10px) rotate(.5deg)} }
  @keyframes jr-floatR  { 0%,100%{transform:translateY(0) rotate(.5deg)}  50%{transform:translateY(-8px) rotate(-.5deg)} }
  @keyframes jr-flicker { 0%,100%{opacity:.78;transform:scaleY(1) scaleX(1)} 25%{opacity:1;transform:scaleY(1.1) scaleX(.92)} 75%{opacity:.85;transform:scaleY(.9) scaleX(1.06)} }
  @keyframes jr-pulse   { 0%,100%{opacity:.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.04)} }
  @keyframes jr-shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  @keyframes jr-bar     { 0%,100%{transform:scaleY(.3)} 50%{transform:scaleY(1)} }
  @keyframes jr-rain    { from{transform:translateY(-20px) translateX(0);opacity:0} to{transform:translateY(100vh) translateX(-12px);opacity:.18} }
  @keyframes ar-twinkle { 0%,100%{opacity:.25;transform:scale(.8) rotate(0deg)} 50%{opacity:1;transform:scale(1.25) rotate(12deg)} }
  @keyframes ar-starSpin { 0%{transform:rotate(0deg) scale(1)} 50%{transform:rotate(180deg) scale(1.12)} 100%{transform:rotate(360deg) scale(1)} }
  @keyframes seam-pulse { 0%,100%{opacity:.88} 50%{opacity:1} }
  @keyframes seam-halo  { 0%,100%{opacity:.65} 50%{opacity:.95} }
  @keyframes dh-down    { 0%{opacity:0;transform:translateY(-2px)} 50%{opacity:1;transform:translateY(2px)} 100%{opacity:0;transform:translateY(6px)} }
  @keyframes apm-pulse  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
`;

// ─────────────────────────────────────────────────────────────────────────────
// SCROLL REVEAL
// ─────────────────────────────────────────────────────────────────────────────
function useReveal<T extends HTMLElement>(threshold = 0.1): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, vis];
}

const Reveal: React.FC<{ children: React.ReactNode; delay?: number; style?: React.CSSProperties }> = ({ children, delay = 0, style }) => {
  const [ref, vis] = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? 'translateY(0)' : 'translateY(22px)',
      transition: `opacity .65s ${delay}s cubic-bezier(.22,1,.36,1), transform .65s ${delay}s cubic-bezier(.22,1,.36,1)`,
      ...style,
    }}>{children}</div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DOOR SEAM — lumina ambra care emana din cusatura
// ─────────────────────────────────────────────────────────────────────────────
const DoorSeam: React.FC<{ side: 'left' | 'right' }> = ({ side }) => (
  <div style={{
    position: 'absolute', top: 0,
    right: side === 'left' ? '0px' : 'auto',
    left: side === 'right' ? '-2px' : 'auto',
    width: 2, height: '100%',
    pointerEvents: 'none', overflow: 'visible', zIndex: 20,
  }}>
    {/* Linia centrala — amber, 100% opacitate */}
    <div style={{
      position: 'absolute',
      top: 0,
      left: side === 'left' ? '100%' : 0,
      width: 3,
      height: '100%',
      background: `linear-gradient(to bottom, transparent 0%, ${C.amber} 6%, ${C.amber} 94%, transparent 100%)`,
      boxShadow: `
        0 0  6px  3px ${hexToRgba(C.amber, .95)},
        0 0 18px  8px ${hexToRgba(C.amber, .75)},
        0 0 45px 18px ${hexToRgba(C.amber, .5)},
        0 0 90px 35px ${hexToRgba(C.amber, .28)}`,
      animation: 'seam-pulse 2.8s ease-in-out infinite',
    }} />
    {/* Halo interior */}
    <div style={{
      position: 'absolute', top: 0, left: 0,
      width: 200, height: '100%',
      transform: side === 'left' ? 'translateX(-100%)' : 'translateX(0%)',
      background: side === 'left'
        ? `linear-gradient(to left,  ${C.amber} 0%, ${hexToRgba(C.amber,.7)} 3%, ${hexToRgba(C.amber,.35)} 10%, ${hexToRgba(C.amber,.1)} 30%, transparent 100%)`
        : `linear-gradient(to right, ${C.amber} 0%, ${hexToRgba(C.amber,.7)} 3%, ${hexToRgba(C.amber,.35)} 10%, ${hexToRgba(C.amber,.1)} 30%, transparent 100%)`,
      filter: 'blur(8px)',
      animation: 'seam-halo 2.8s ease-in-out infinite',
      pointerEvents: 'none',
    }} />
    {/* Halo exterior difuz */}
    <div style={{
      position: 'absolute', top: 0, left: 0,
      width: 380, height: '100%',
      transform: side === 'left' ? 'translateX(-100%)' : 'translateX(0%)',
      background: side === 'left'
        ? `linear-gradient(to left,  ${hexToRgba(C.amber,.35)} 0%, ${hexToRgba(C.amber,.12)} 20%, transparent 100%)`
        : `linear-gradient(to right, ${hexToRgba(C.amber,.35)} 0%, ${hexToRgba(C.amber,.12)} 20%, transparent 100%)`,
      filter: 'blur(28px)',
      animation: 'seam-halo 2.8s ease-in-out infinite',
      pointerEvents: 'none',
    }} />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// DOOR HINT — scroll down indicator
// ─────────────────────────────────────────────────────────────────────────────
const DoorHint: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
    <span style={{ fontFamily: sans, fontSize: 8, letterSpacing: '.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)' }}>Scroll down</span>
    <span style={{ fontSize: 12, color: 'rgba(255,255,255,.85)', animation: 'dh-down 1.6s ease-in-out infinite' }}>↓</span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// JURASSIC OVERLAY TEXT — pe usi (faza 1 + faza 2)
// ─────────────────────────────────────────────────────────────────────────────
const JurassicOverlayText: React.FC<{
  childName: string; subtitle: string; isWedding?: boolean;
  partner2Name?: string;
  editMode?: boolean;
  overlayRef?: React.RefObject<HTMLDivElement>;
  nameRef?: React.RefObject<HTMLDivElement>;
  inviteRef?: React.RefObject<HTMLDivElement>;
  onChildNameChange?: (v: string) => void;
  onSubtitleChange?: (v: string) => void;
  inviteTop?: string; inviteMiddle?: string; inviteBottom?: string; inviteTag?: string; dateStr?: string;
  onInviteTopChange?: (v: string) => void;
  onInviteMiddleChange?: (v: string) => void;
  onInviteBottomChange?: (v: string) => void;
  onInviteTagChange?: (v: string) => void;
  previewMode?: 'doors' | 'static';
  i: any;
}> = ({
  childName, subtitle, isWedding, partner2Name, editMode,
  overlayRef, nameRef, inviteRef,
  onChildNameChange, onSubtitleChange,
  inviteTop, inviteMiddle, inviteBottom, inviteTag, dateStr,
  onInviteTopChange, onInviteMiddleChange, onInviteBottomChange, onInviteTagChange,
  previewMode,
  i,
}) => {
  const S = '0 2px 8px rgba(0,0,0,.95), 0 4px 24px rgba(0,0,0,.8)';
  const isStatic = previewMode === 'static';

  const nameTop       = isStatic ? '36%' : (editMode ? '16%' : '50%');
  const nameTransform = isStatic ? 'translateY(-50%)' : (editMode ? 'none' : 'translateY(-50%)');
  const nameOpacity   = isStatic ? 1 : (editMode ? 0.45 : 1);
  const inviteTopPos  = isStatic ? '76%' : (editMode ? '52%' : '50%');
  const inviteTransform = isStatic ? 'translateY(-50%) scale(.95)' : (editMode ? 'translateY(-50%) scale(1)' : 'translateY(-50%) scale(.88)');
  const inviteOpacity = isStatic ? 1 : (editMode ? 1 : 0);

  return (
    <div ref={overlayRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 15, pointerEvents: editMode ? 'auto' : 'none' }}>
      {/* Radial vignette */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 75% 65% at 50% 50%, rgba(0,0,0,.1) 0%, transparent 100%)' }}/>

      {/* Logo deasupra */}
      {/* <div style={{ position: 'absolute', top: '6%', left: 0, right: 0, textAlign: 'center', zIndex: 1 }}>
        <img src={i.logo} alt="Mica Sirena" style={{
          width: 'min(200px,52vw)', objectFit: 'contain', display: 'block', margin: '0 auto',
          filter: `drop-shadow(0 0 18px ${hexToRgba(C.amber,.7)}) drop-shadow(0 4px 12px rgba(0,0,0,.9))`,
          animation: 'jr-float 4s ease-in-out infinite',
        }}/>
      </div> */}

      {/* FAZA 1 — Nume pe usi */}
      <div style={{ position: 'absolute', top: nameTop, left: 0, right: 0, transform: nameTransform, textAlign: 'center', zIndex: 1, padding: '0 28px', opacity: nameOpacity }}>
        <div ref={nameRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: '100%' }}>
          {isWedding ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2em' }}>
              <InlineEdit tag="span" editMode={!!editMode} value={childName} onChange={v => onChildNameChange?.(v)}
                style={{ fontFamily: display, fontSize: 'clamp(36px,9vw,64px)', fontWeight: 700, color: '#ffffff', textShadow: S, lineHeight: 1 }}/>
              <span style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 'clamp(20px,5vw,38px)', color: hexToRgba(C.amber,.9), textShadow: S }}>&amp;</span>
              <span style={{ fontFamily: display, fontSize: 'clamp(36px,9vw,64px)', fontWeight: 700, color: '#ffffff', textShadow: S, lineHeight: 1 }}>{partner2Name}</span>
            </div>
          ) : (
            <InlineEdit tag="h2" editMode={!!editMode} value={childName} onChange={v => onChildNameChange?.(v)}
              style={{ fontFamily: display, fontSize: 'clamp(38px,10vw,72px)', fontWeight: 700, lineHeight: 1.1, color: '#ffffff', textShadow: S, margin: '2px auto 0', maxWidth: '100%', overflowWrap: 'anywhere', wordBreak: 'break-word' }}/>
          )}
          <InlineEdit
            tag="p"
            editMode={!!editMode}
            value={subtitle}
            onChange={v => onSubtitleChange?.(v)}
            textKey="intro:subtitle"
            textLabel="Intro Subtitle"
            style={{
              fontFamily: display,
              fontSize: 'clamp(1.02rem, 3.4vw, 1.25rem)',
              letterSpacing: '.28em',
              textTransform: 'uppercase',
              color: '#ffffff',
              textShadow: '0 3px 10px rgba(0,0,0,.98), 0 10px 24px rgba(0,0,0,.9), 0 16px 36px rgba(0,0,0,.75)',
              marginTop: 8,
              opacity: .99,
            }}
          />
          {/* Raptori flanking */}
          {/* <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginTop: 8 }}>
            <div style={{ animation: 'jr-float 3.5s ease-in-out infinite' }}>
              <img src={i.raptor1} alt="" style={{ height: 58, objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,.8))' }}/>
            </div>
            <div style={{ animation: 'jr-floatR 4s .4s ease-in-out infinite' }}>
              <img src={i.raptor2} alt="" style={{ height: 58, objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,.8))', transform: 'scaleX(-1)' }}/>
            </div>
          </div> */}
        </div>
      </div>

      {/* FAZA 2 — Textul invitatiei */}
      <div style={{ position: 'absolute', top: inviteTopPos, left: 0, right: 0, transform: inviteTransform, textAlign: 'center', zIndex: 1, padding: '0 36px', pointerEvents: editMode ? 'auto' : 'none' }}>
        <div ref={inviteRef} style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', opacity: inviteOpacity }}>
          <InlineEdit tag="p" editMode={!!editMode} value={inviteTop || 'Cu bucurie va anuntam'} onChange={v => onInviteTopChange?.(v)}
            style={{ fontFamily: display, fontSize: '.65rem', fontWeight: 700, letterSpacing: '.5em', textTransform: 'uppercase', color: '#ffffff', textShadow: S, margin: 0 }}/>
          <InlineEdit tag="p" editMode={!!editMode} value={inviteMiddle || dateStr || 'Data Evenimentului'} onChange={v => onInviteMiddleChange?.(v)}
            style={{ fontFamily: display, fontSize: '1.8rem', fontWeight: 700, lineHeight: 1.2, color: hexToRgba(C.amber,.95), textShadow: S, margin: 0 }}/>
          <InlineEdit tag="p" editMode={!!editMode} value={inviteBottom || 'va fi botezat'} onChange={v => onInviteBottomChange?.(v)}
            style={{ fontFamily: display, fontSize: '.68rem', fontWeight: 400, letterSpacing: '.35em', textTransform: 'uppercase', color: '#ffffff', textShadow: S, margin: 0, lineHeight: 2 }}/>
          <InlineEdit tag="p" editMode={!!editMode} value={inviteTag || 'deschide valurile'} onChange={v => onInviteTagChange?.(v)}
            style={{ fontFamily: display, fontSize: '.55rem', fontWeight: 700, letterSpacing: '.6em', textTransform: 'uppercase', color: hexToRgba(C.amber,.75), textShadow: S, margin: '2px 0 0' }}/>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// JURASSIC DOOR INTRO — GSAP ScrollTrigger, identic cu LordEffects
// ─────────────────────────────────────────────────────────────────────────────
const JurassicDoorIntro: React.FC<{
  onDone?: () => void;
  editMode?: boolean;
  previewMode?: 'doors' | 'static';
  contentEl?: HTMLElement | null;
  scrollContainer?: HTMLElement | null;
  childName?: string;
  partner2Name?: string;
  isWedding?: boolean;
  subtitle?: string;
  inviteTop?: string; inviteMiddle?: string; inviteBottom?: string; inviteTag?: string; dateStr?: string;
  doorImg?: string; doorImgMobile?: string;
  onChildNameChange?: (v: string) => void;
  onSubtitleChange?: (v: string) => void;
  onInviteTopChange?: (v: string) => void;
  onInviteMiddleChange?: (v: string) => void;
  onInviteBottomChange?: (v: string) => void;
  onInviteTagChange?: (v: string) => void;
  onDoorsOpen?: () => void;
  i: any;
}> = ({
  onDone, editMode, previewMode = 'doors', contentEl, scrollContainer,
  childName = 'Rex', partner2Name = '', isWedding = false,
  subtitle = 'va invita in jungla',
  inviteTop, inviteMiddle, inviteBottom, inviteTag, dateStr,
  onChildNameChange, onSubtitleChange,
  onInviteTopChange, onInviteMiddleChange, onInviteBottomChange, onInviteTagChange,
  onDoorsOpen,
  doorImg, doorImgMobile,
  i,
}) => {
  const leftDoorRef  = useRef<HTMLDivElement>(null);
  const rightDoorRef = useRef<HTMLDivElement>(null);
  const hintRef      = useRef<HTMLDivElement>(null);
  const wrapRef      = useRef<HTMLDivElement>(null);
  const overlayRef   = useRef<HTMLDivElement>(null);
  const seamRef      = useRef<HTMLDivElement>(null);
  const seamRef2     = useRef<HTMLDivElement>(null);
  const nameRef      = useRef<HTMLDivElement>(null);
  const inviteRef    = useRef<HTMLDivElement>(null);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  useEffect(() => {
    if (editMode || !leftDoorRef.current || !rightDoorRef.current || !contentEl) return;

    gsap.set(contentEl, { opacity: 0 });
    gsap.set(seamRef.current,  { opacity: 0 });
    gsap.set(seamRef2.current, { opacity: 0 });

    const tl = gsap.timeline({ paused: true });
    tl.to(leftDoorRef.current,  { xPercent: -100, ease: 'none', duration: 1 }, 0);
    tl.to(rightDoorRef.current, { xPercent:  100, ease: 'none', duration: 1 }, 0);
    tl.to(contentEl,            { opacity: 1,     ease: 'none', duration: 1 }, 0);
    if (hintRef.current)    tl.to(hintRef.current,    { opacity: 0, ease: 'none', duration: 0.2 }, 0);
    if (overlayRef.current) tl.to(overlayRef.current, { opacity: 0, ease: 'none', duration: 0.3 }, 0);
    if (seamRef.current) {
      tl.to(seamRef.current,  { opacity: 1, ease: 'none', duration: 0.08 }, 0);
      tl.to(seamRef.current,  { opacity: 0, ease: 'power2.in', duration: 0.25 }, 0.75);
    }
    if (seamRef2.current) {
      tl.to(seamRef2.current, { opacity: 1, ease: 'none', duration: 0.08 }, 0);
      tl.to(seamRef2.current, { opacity: 0, ease: 'power2.in', duration: 0.25 }, 0.75);
    }

    const DEAD = 60 / 160;
    const textTl = gsap.timeline({ paused: true });
    if (nameRef.current) {
      textTl.to(nameRef.current, { opacity: 0, scale: 0.82, ease: 'power2.in', duration: 1 });
    }
    if (inviteRef.current) {
      textTl.fromTo(inviteRef.current,
        { opacity: 0, scale: 0.82 },
        { opacity: 1, scale: 1, ease: 'power2.out', duration: 1 }
      );
    }

    let _musicFired = false;
    const st = ScrollTrigger.create({
      trigger: contentEl,
      scroller: scrollContainer || undefined,
      start: 'top top',
      end: '+=500%',
      pin: true,
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (self.progress <= DEAD) {
          textTl.progress(self.progress / DEAD);
          tl.progress(0);
        } else {
          textTl.progress(1);
          const p = (self.progress - DEAD) / (1 - DEAD);
          tl.progress(p);
          if (!_musicFired && p > 0.05) { _musicFired = true; onDoorsOpen?.(); }
        }
      },
      onLeave: () => { if (wrapRef.current) wrapRef.current.style.display = 'none'; },
      onEnterBack: () => {
        _musicFired = false;
        if (wrapRef.current) wrapRef.current.style.display = 'block';
        textTl.progress(0);
        if (nameRef.current)   gsap.set(nameRef.current,   { opacity: 1, scale: 1 });
        if (inviteRef.current) gsap.set(inviteRef.current, { opacity: 0, scale: 0.88 });
      },
    });
    requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => { st.kill(); tl.kill(); gsap.set(contentEl, { clearProps: 'all' }); };
  }, [editMode, contentEl, scrollContainer]);

  // Rain overlay on doors
  const rainLines = Array.from({ length: 18 }, (_, i) => (
    <div key={i} style={{ position: 'absolute', left: `${(i * 5.5 + 3) % 100}%`, top: -30, width: 1, height: 50 + i * 4, background: 'rgba(160,200,120,.1)', animation: `jr-rain ${1.2 + (i * .15) % 1.4}s ${(i * .22) % 2.5}s linear infinite`, pointerEvents: 'none' }}/>
  ));

  // Torches on doors
  const TorchEl: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
    <div style={{ position: 'absolute', zIndex: 22, ...style }}>
      <img src={i.torch} alt="" style={{ width: 80, objectFit: 'contain', filter: `drop-shadow(0 0 16px ${hexToRgba(C.amber,.85)})`, animation: 'jr-flicker .45s ease-in-out infinite' }}/>
    </div>
  );

  // ── Static preview (editMode preview panel) ──────────────────────────────
  if (editMode && previewMode === 'static') {
    return (
      <div style={{ position: 'relative', height: 800, borderRadius: 12, marginBottom: 32, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${doorImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.12)' }} />
        <JurassicOverlayText
          i={i}
          childName={childName} subtitle={subtitle} isWedding={isWedding} partner2Name={partner2Name}
          editMode={true}
          onChildNameChange={onChildNameChange} onSubtitleChange={onSubtitleChange}
          inviteTop={inviteTop} inviteMiddle={inviteMiddle} inviteBottom={inviteBottom} inviteTag={inviteTag} dateStr={dateStr}
          onInviteTopChange={onInviteTopChange} onInviteMiddleChange={onInviteMiddleChange}
          onInviteBottomChange={onInviteBottomChange} onInviteTagChange={onInviteTagChange}
          previewMode={previewMode}/>
      </div>
    );
  }

  // ── Edit mode split doors preview ────────────────────────────────────────
  if (editMode) {
    return (
      <div style={{ position: 'relative', height: 800, borderRadius: 12, marginBottom: 32 }}>
        {/* Left half */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '100%', overflow: 'hidden', borderRadius: '12px 0 0 12px' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '200%', height: '100%', backgroundImage: `url(${doorImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.1)' }} />
          {rainLines}
          <TorchEl style={{ top: '8%', right: 28 }}/>
        </div>
        {/* Right half */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100%', overflow: 'hidden', borderRadius: '0 12px 12px 0' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '200%', height: '100%', backgroundImage: `url(${doorImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.1)' }} />
          {rainLines}
          <TorchEl style={{ top: '8%', left: 28 }}/>
        </div>
        <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', zIndex: 20 }}><DoorHint /></div>
        <JurassicOverlayText
          i={i}
          childName={childName} subtitle={subtitle} isWedding={isWedding} partner2Name={partner2Name}
          editMode={true}
          onChildNameChange={onChildNameChange} onSubtitleChange={onSubtitleChange}
          inviteTop={inviteTop} inviteMiddle={inviteMiddle} inviteBottom={inviteBottom} inviteTag={inviteTag} dateStr={dateStr}
          onInviteTopChange={onInviteTopChange} onInviteMiddleChange={onInviteMiddleChange}
          onInviteBottomChange={onInviteBottomChange} onInviteTagChange={onInviteTagChange}
          previewMode={previewMode}/>
      </div>
    );
  }

  // ── Live mode — fixed overlay cu GSAP ────────────────────────────────────
  return (
    <div ref={wrapRef} style={{ position: 'fixed', inset: 0, height: '100dvh', zIndex: 9999, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* Left door */}
      <div ref={leftDoorRef} style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '100dvh', overflow: 'visible', willChange: 'transform' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '200%', height: '100%', backgroundImage: `url(${isMobile ? doorImgMobile : doorImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.1)' }} />
          {rainLines}
          <TorchEl style={{ top: '8%', right: 24 }}/>
        </div>
        <div ref={seamRef} style={{ opacity: 0 }}><DoorSeam side="left"/></div>
      </div>
      {/* Right door */}
      <div ref={rightDoorRef} style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100dvh', overflow: 'visible', willChange: 'transform' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '200%', height: '100%', backgroundImage: `url(${isMobile ? doorImgMobile : doorImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.1)' }} />
          {rainLines}
          <TorchEl style={{ top: '8%', left: 24 }}/>
        </div>
        <div ref={seamRef2} style={{ opacity: 0 }}><DoorSeam side="right"/></div>
      </div>
      {/* Overlay text */}
      <JurassicOverlayText
        i={i}
        childName={childName} subtitle={subtitle} isWedding={isWedding} partner2Name={partner2Name}
        overlayRef={overlayRef as any} nameRef={nameRef as any} inviteRef={inviteRef as any}
        inviteTop={inviteTop} inviteMiddle={inviteMiddle} inviteBottom={inviteBottom} inviteTag={inviteTag} dateStr={dateStr}
        previewMode={previewMode}/>
      <div ref={hintRef} style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', zIndex: 20 }}><DoorHint /></div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// AUDIO PERMISSION MODAL — jungle themed
// ─────────────────────────────────────────────────────────────────────────────
const AudioPermissionModal: React.FC<{ childName: string; onAllow: () => void; onDeny: () => void; i: any; }> = ({ childName, onAllow, onDeny, i }) => (
  <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ position: 'absolute', inset: 0, background: `${hexToRgba(C.darkJungle,.85)}`, backdropFilter: 'blur(10px)' }} />
    <div style={{ position: 'relative', background: `linear-gradient(160deg,${C.midJungle},${C.darkJungle})`, borderRadius: 24, padding: '36px 32px 28px', maxWidth: 320, width: '90%', textAlign: 'center', boxShadow: `0 24px 80px rgba(0,0,0,.6), 0 0 0 1px ${hexToRgba(C.amber,.3)}`, border: `1.5px solid ${hexToRgba(C.amber,.35)}` }}>
      {/* Logo */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
        <img src={i.logo} alt="" style={{ width: 120, objectFit: 'contain', filter: `drop-shadow(0 0 12px ${hexToRgba(C.amber,.5)})`, animation: 'apm-pulse 2s ease-in-out infinite' }}/>
      </div>
      <p style={{ fontFamily: display, fontSize: 22, color: C.cream, margin: '0 0 6px', lineHeight: 1.2, fontWeight: 700, textShadow: `0 0 14px ${hexToRgba(C.amber,.4)}` }}>{childName}</p>
      <p style={{ fontFamily: sans, fontSize: 12, fontWeight: 700, color: C.text, margin: '0 0 8px' }}>Te invita in lumea subacvatica</p>
      <p style={{ fontFamily: serif, fontSize: 11, fontStyle: 'italic', color: C.muted, margin: '0 0 28px', lineHeight: 1.65 }}>Aceasta invitatie are o melodie speciala.<br/>Vrei sa activezi muzica?</p>
      <button type="button" onClick={onAllow}
        style={{ width: '100%', padding: '14px 0', background: `linear-gradient(135deg,${C.amber},${C.amberLight})`, border: 'none', borderRadius: 50, cursor: 'pointer', fontFamily: display, fontSize: 11, fontWeight: 700, color: C.darkJungle, letterSpacing: '.15em', marginBottom: 10, boxShadow: `0 6px 20px ${hexToRgba(C.amber,.5)}`, transition: 'transform .15s' }}
        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.03)'}
        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'}>
        🎵 Da, activeaza muzica
      </button>
      <button type="button" onClick={onDeny}
        style={{ width: '100%', padding: '10px 0', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: sans, fontSize: 11, color: C.muted }}>
        Nu, continua fara muzica
      </button>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// WILD DIVIDER — jungle version
// ─────────────────────────────────────────────────────────────────────────────
const JungleDivider: React.FC<{ i: any }> = ({ i }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${hexToRgba(C.amber,.4)})`, borderRadius: 99 }}/>
    <img src={i.footprint} alt="" style={{ width: 50, height: 50, objectFit: 'contain', opacity: .65, filter: `drop-shadow(0 0 4px ${hexToRgba(C.amber,.4)})` }}/>
    <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${hexToRgba(C.amber,.4)})`, borderRadius: 99 }}/>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// STONE STRIP — card header band
// ─────────────────────────────────────────────────────────────────────────────
const StoneStrip: React.FC<{ icon?: string }> = ({ icon = '🦖' }) => (
  <div style={{
    height: 3,
    background: `linear-gradient(to right, ${hexToRgba(C.amber,.15)}, ${C.amber}, ${hexToRgba(C.amber,.15)})`,
    position: 'relative',
  }}>
    {icon && (
      <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', fontSize: 30, lineHeight: 1, zIndex: 2, filter: 'drop-shadow(0 0 4px rgba(0,0,0,.8))' }}>{icon}</span>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// BLOCK CARD — base card wrapper (like LordEffects white card)
// ─────────────────────────────────────────────────────────────────────────────
const BlockCard: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; accentIcon?: string; imgDeco?: { src: string; side?: 'left'|'right'; top?: number; size?: number } }> = ({ children, style, accentIcon, imgDeco }) => (
  <div style={{ position: 'relative' }}>
    {/* imgDeco OUTSIDE card so it's never clipped by overflow */}
    {imgDeco && (
      <img src={imgDeco.src} alt="" style={{
        position: 'absolute',
        top: imgDeco.top !== undefined ? imgDeco.top : -20,
        [imgDeco.side === 'left' ? 'left' : 'right']: -8,
        width: imgDeco.size || 70,
        objectFit: 'contain',
        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,.6))',
        pointerEvents: 'none',
        zIndex: 10,
      }}/>
    )}
    <div style={{
      background: `linear-gradient(160deg,${hexToRgba(C.midJungle,.94)} 0%,${hexToRgba(C.darkJungle,.97)} 100%)`,
      borderRadius: 20,
      border: `1px solid ${hexToRgba(C.amber,.2)}`,
      boxShadow: `0 4px 20px rgba(0,0,0,.5), inset 0 1px 0 ${hexToRgba(C.amber,.08)}`,
      position: 'relative', padding: 0,
      ...style,
    }}>
      <StoneStrip icon={accentIcon}/>
      {/* Moss dot texture */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 20, backgroundImage: `radial-gradient(circle at 2px 2px,${hexToRgba(C.moss,.035)} 1px,transparent 0)`, backgroundSize: '18px 18px' }}/>
      <div style={{ position: 'relative', padding: '20px 24px 22px' }}>
        {children}
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// COUNTDOWN
// ─────────────────────────────────────────────────────────────────────────────
interface TimeLeft { days:number; hours:number; minutes:number; seconds:number; total:number }
function calcTimeLeft(date: string): TimeLeft {
  const diff = new Date(date).getTime() - Date.now();
  if (diff <= 0) return { days:0,hours:0,minutes:0,seconds:0,total:0 };
  return { days:Math.floor(diff/86400000), hours:Math.floor((diff/3600000)%24), minutes:Math.floor((diff/60000)%60), seconds:Math.floor((diff/1000)%60), total:diff };
}
const DigiCell: React.FC<{ value: number; label: string }> = ({ value, label }) => {
  const prev = useRef(value);
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    if (prev.current !== value) { setFlash(true); setTimeout(() => setFlash(false), 300); prev.current = value; }
  }, [value]);
  return (
    <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:6 }}>
      <div style={{ width:56,height:64,background:`linear-gradient(160deg,${hexToRgba(C.stone,.95)},${hexToRgba(C.darkJungle,.98)})`,border:`1.5px solid ${hexToRgba(C.amber,.3)}`,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 4px 14px rgba(0,0,0,.5),inset 0 1px 0 ${hexToRgba(C.amber,.12)}`,transform:flash?'scale(1.1)':'scale(1)',transition:'transform .14s' }}>
        <span style={{ fontFamily:display,fontSize:24,fontWeight:700,color:C.cream,textShadow:`0 0 10px ${hexToRgba(C.amber,.5)}` }}>{String(value).padStart(2,'0')}</span>
      </div>
      <span style={{ fontFamily:sans,fontSize:8,letterSpacing:'.3em',textTransform:'uppercase',color:hexToRgba(C.amber,.65),fontWeight:700 }}>{label}</span>
    </div>
  );
};
const JurassicCountdown: React.FC<{ targetDate: string|undefined }> = ({ targetDate }) => {
  const [tl, setTl] = useState<TimeLeft|null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
    if (!targetDate) return;
    setTl(calcTimeLeft(targetDate));
    const id = setInterval(() => setTl(calcTimeLeft(targetDate!)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  if (!ready || !targetDate) return null;
  if (tl?.total === 0) return <p style={{ fontFamily:display,fontSize:13,fontWeight:700,color:C.amber,textAlign:'center',margin:0 }}>🦕 Aventura a inceput!</p>;
  const vals = [tl?.days??0,tl?.hours??0,tl?.minutes??0,tl?.seconds??0];
  const labs = ['Zile','Ore','Min','Sec'];
  const sep = <div style={{ display:'flex',flexDirection:'column',gap:5,alignItems:'center',paddingBottom:20,flexShrink:0 }}><div style={{ width:4,height:4,borderRadius:'50%',background:hexToRgba(C.amber,.55) }}/><div style={{ width:4,height:4,borderRadius:'50%',background:hexToRgba(C.amber,.55) }}/></div>;
  return (
    <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'center',gap:6 }}>
      {vals.map((v,i) => (
        <React.Fragment key={i}><DigiCell value={v} label={labs[i]}/>{i<3&&sep}</React.Fragment>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CALENDAR
// ─────────────────────────────────────────────────────────────────────────────
const CalendarMonth: React.FC<{ date: string|undefined }> = ({ date }) => {
  if (!date) return null;
  const d = new Date(date), year=d.getFullYear(), month=d.getMonth(), day=d.getDate();
  const firstDay = new Date(year,month,1).getDay();
  const daysInMonth = new Date(year,month+1,0).getDate();
  const monthNames=['IANUARIE','FEBRUARIE','MARTIE','APRILIE','MAI','IUNIE','IULIE','AUGUST','SEPTEMBRIE','OCTOMBRIE','NOIEMBRIE','DECEMBRIE'];
  const dayLabs=['L','M','M','J','V','S','D'];
  const start = (firstDay+6)%7;
  const cells: (number|null)[] = [...Array(start).fill(null),...Array.from({length:daysInMonth},(_,i)=>i+1)];
  return (
    <div style={{ textAlign:'center' }}>
      <p style={{ fontFamily:display,fontSize:10,fontWeight:600,letterSpacing:'.25em',color:hexToRgba(C.amber,.9),marginBottom:14 }}>{monthNames[month]} {year}</p>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:5,marginBottom:5 }}>
        {dayLabs.map((l,i)=><div key={`${l}-${i}`} style={{ fontSize:9,fontWeight:700,color:hexToRgba(C.cream,.35),fontFamily:sans }}>{l}</div>)}
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:5 }}>
        {cells.map((cell,i)=>{
          const isDay=cell===day;
          return <div key={i} style={{ height:26,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:isDay?700:500,fontFamily:isDay?display:sans,color:isDay?C.darkJungle:cell?hexToRgba(C.cream,.7):'transparent',background:isDay?C.amber:'transparent',borderRadius:'50%' }}>{cell||''}</div>;
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// LOCATION CARD
// ─────────────────────────────────────────────────────────────────────────────
const LocCard: React.FC<{ block: InvitationBlock; editMode: boolean; onUpdate: (p: Partial<InvitationBlock>) => void; imgDeco?: string }> = ({ block, editMode, onUpdate, imgDeco }) => {
  const addr = block.locationAddress || block.locationName || '';
  return (
    <BlockCard accentIcon="📍" imgDeco={imgDeco ? { src: imgDeco, side: 'right' } : undefined}>
      <div style={{ display:'flex',alignItems:'center',gap:6,marginBottom:14 }}>
        <div style={{ width:36,height:36,borderRadius:10,background:`linear-gradient(145deg,${hexToRgba(C.amber,.2)},${hexToRgba(C.amber,.08)})`,border:`1.5px solid ${hexToRgba(C.amber,.3)}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
          <MapPin style={{ width:16,height:16,color:C.amber }}/>
        </div>
        <div>
          <InlineEdit editMode={editMode} value={block.label||'Locatie'} onChange={v=>onUpdate({label:v})}
            style={{ fontFamily:sans,fontSize:8,fontWeight:700,letterSpacing:'.42em',textTransform:'uppercase',color:hexToRgba(C.amber,.8),margin:0,display:'block' }}/>
          {block.time && (
            <InlineTime editMode={editMode} value={block.time} onChange={v=>onUpdate({time:v})}
              style={{ fontFamily:display,fontSize:13,fontWeight:700,color:C.cream,lineHeight:1.2,textShadow:`0 0 8px ${hexToRgba(C.amber,.4)}` }}/>
          )}
        </div>
      </div>
      <div style={{ height:1,background:`linear-gradient(to right,transparent,${hexToRgba(C.amber,.2)},transparent)`,marginBottom:14 }}/>
      <InlineEdit tag="h3" editMode={editMode} value={block.locationName||''} onChange={v=>onUpdate({locationName:v})}
        style={{ fontFamily:display,fontSize:17,fontWeight:700,color:C.cream,margin:'0 0 4px',lineHeight:1.2 }}/>
      <InlineEdit tag="p" editMode={editMode} value={block.locationAddress||''} onChange={v=>onUpdate({locationAddress:v})} multiline
        style={{ fontFamily:serif,fontSize:12,color:hexToRgba(C.cream,.6),margin:'0 0 14px',lineHeight:1.6 }}/>
      <div style={{ display:'flex',gap:8,justifyContent:'center' }}>
        <InlineWaze value={block.wazeLink||''} onChange={v=>onUpdate({wazeLink:v})} editMode={editMode}/>
        {addr && (
          <a href={`https://maps.google.com/?q=${encodeURIComponent(addr)}`} target="_blank" rel="noopener noreferrer" style={{ display:'flex',alignItems:'center',gap:4,padding:'5px 14px',borderRadius:99,fontSize:9,fontWeight:700,letterSpacing:'.18em',textTransform:'uppercase',textDecoration:'none',fontFamily:sans,background:hexToRgba(C.amber,.12),border:`1.5px solid ${hexToRgba(C.amber,.35)}`,color:hexToRgba(C.amber,.95) }}>
            📍 Maps
          </a>
        )}
      </div>
    </BlockCard>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PHOTO BLOCK
// ─────────────────────────────────────────────────────────────────────────────
type ClipShape='rect'|'rounded'|'rounded-lg'|'squircle'|'circle'|'arch'|'arch-b'|'hexagon'|'diamond'|'triangle'|'star'|'heart'|'diagonal'|'diagonal-r'|'wave-b'|'wave-t'|'wave-both'|'blob'|'blob2'|'blob3'|'blob4';
type MaskEffect='fade-b'|'fade-t'|'fade-l'|'fade-r'|'vignette';
function getClipStyle(clip: ClipShape): React.CSSProperties {
  const m: Record<ClipShape,React.CSSProperties> = {
    rect:{borderRadius:0},rounded:{borderRadius:16},'rounded-lg':{borderRadius:32},
    squircle:{borderRadius:'30% 30% 30% 30% / 30% 30% 30% 30%'},circle:{borderRadius:'50%'},
    arch:{borderRadius:'50% 50% 0 0 / 40% 40% 0 0'},'arch-b':{borderRadius:'0 0 50% 50% / 0 0 40% 40%'},
    hexagon:{clipPath:'polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%)'},
    diamond:{clipPath:'polygon(50% 0%,100% 50%,50% 100%,0% 50%)'},
    triangle:{clipPath:'polygon(50% 0%,100% 100%,0% 100%)'},
    star:{clipPath:'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)'},
    heart:{clipPath:'url(#jr-clip-heart)'},diagonal:{clipPath:'polygon(0 0,100% 0,100% 80%,0 100%)'},
    'diagonal-r':{clipPath:'polygon(0 0,100% 0,100% 100%,0 80%)'},
    'wave-b':{clipPath:'url(#jr-clip-wave-b)'},'wave-t':{clipPath:'url(#jr-clip-wave-t)'},
    'wave-both':{clipPath:'url(#jr-clip-wave-both)'},
    blob:{clipPath:'url(#jr-clip-blob)'},blob2:{clipPath:'url(#jr-clip-blob2)'},
    blob3:{clipPath:'url(#jr-clip-blob3)'},blob4:{clipPath:'url(#jr-clip-blob4)'},
  };
  return m[clip]||{};
}
function getMaskStyle(effects: MaskEffect[]): React.CSSProperties {
  if (!effects.length) return {};
  const layers = effects.map(e=>{
    switch(e){
      case 'fade-b':return 'linear-gradient(to bottom, black 40%, transparent 100%)';
      case 'fade-t':return 'linear-gradient(to top, black 40%, transparent 100%)';
      case 'fade-l':return 'linear-gradient(to left, black 40%, transparent 100%)';
      case 'fade-r':return 'linear-gradient(to right, black 40%, transparent 100%)';
      case 'vignette':return 'radial-gradient(ellipse 80% 80% at center, black 40%, transparent 100%)';
      default:return 'none';
    }
  });
  const mask=layers.join(', ');
  return {WebkitMaskImage:mask,maskImage:mask,WebkitMaskComposite:effects.length>1?'source-in':'unset',maskComposite:effects.length>1?'intersect':'unset'};
}
const PhotoClipDefs:React.FC=()=>(
  <svg width="0" height="0" style={{position:'absolute',overflow:'hidden',pointerEvents:'none'}}>
    <defs>
      <clipPath id="jr-clip-wave-b" clipPathUnits="objectBoundingBox"><path d="M0,0 L1,0 L1,0.78 Q0.875,0.65 0.75,0.78 Q0.625,0.91 0.5,0.78 Q0.375,0.65 0.25,0.78 Q0.125,0.91 0,0.78 Z"/></clipPath>
      <clipPath id="jr-clip-wave-t" clipPathUnits="objectBoundingBox"><path d="M0,0.22 Q0.125,0.09 0.25,0.22 Q0.375,0.35 0.5,0.22 Q0.625,0.09 0.75,0.22 Q0.875,0.35 1,0.22 L1,1 L0,1 Z"/></clipPath>
      <clipPath id="jr-clip-wave-both" clipPathUnits="objectBoundingBox"><path d="M0,0.22 Q0.125,0.09 0.25,0.22 Q0.375,0.35 0.5,0.22 Q0.625,0.09 0.75,0.22 Q0.875,0.35 1,0.22 L1,0.78 Q0.875,0.65 0.75,0.78 Q0.625,0.91 0.5,0.78 Q0.375,0.65 0.25,0.78 Q0.125,0.91 0,0.78 Z"/></clipPath>
      <clipPath id="jr-clip-heart" clipPathUnits="objectBoundingBox"><path d="M0.5,0.85 C0.5,0.85 0.05,0.55 0.05,0.3 C0.05,0.12 0.18,0.05 0.3,0.1 C0.4,0.14 0.5,0.25 0.5,0.25 C0.5,0.25 0.6,0.14 0.7,0.1 C0.82,0.05 0.95,0.12 0.95,0.3 C0.95,0.55 0.5,0.85 0.5,0.85Z"/></clipPath>
      <clipPath id="jr-clip-blob" clipPathUnits="objectBoundingBox"><path d="M0.5,0.03 C0.72,0.01 0.95,0.14 0.97,0.38 C0.99,0.58 0.88,0.78 0.72,0.88 C0.56,0.98 0.35,0.99 0.2,0.88 C0.05,0.77 -0.02,0.55 0.04,0.36 C0.1,0.17 0.28,0.05 0.5,0.03Z"/></clipPath>
      <clipPath id="jr-clip-blob2" clipPathUnits="objectBoundingBox"><path d="M0.75,0.224 C0.831,0.271 0.911,0.342 0.921,0.422 C0.93,0.502 0.869,0.59 0.808,0.661 C0.747,0.732 0.685,0.785 0.611,0.816 C0.538,0.847 0.453,0.856 0.389,0.824 C0.326,0.792 0.285,0.72 0.233,0.647 C0.181,0.573 0.119,0.497 0.113,0.414 C0.107,0.331 0.157,0.241 0.231,0.193 C0.305,0.145 0.402,0.138 0.493,0.147 C0.584,0.155 0.668,0.178 0.75,0.224Z"/></clipPath>
      <clipPath id="jr-clip-blob3" clipPathUnits="objectBoundingBox"><path d="M0.5,0.05 C0.65,0.02 0.85,0.1 0.92,0.28 C0.99,0.46 0.93,0.68 0.8,0.82 C0.67,0.96 0.46,1.0 0.3,0.93 C0.14,0.86 0.02,0.68 0.01,0.5 C0.0,0.32 0.1,0.14 0.25,0.07 C0.33,0.03 0.42,0.07 0.5,0.05Z"/></clipPath>
      <clipPath id="jr-clip-blob4" clipPathUnits="objectBoundingBox"><path d="M0.18,0.08 C0.32,0.01 0.54,0.0 0.68,0.08 C0.82,0.16 0.96,0.32 0.97,0.5 C0.98,0.68 0.86,0.86 0.7,0.93 C0.54,1.0 0.32,0.97 0.18,0.88 C0.04,0.79 -0.04,0.62 0.02,0.45 C0.07,0.28 0.04,0.15 0.18,0.08Z"/></clipPath>
    </defs>
  </svg>
);

const PhotoBlock: React.FC<{ block: InvitationBlock; editMode: boolean; onUpdate: (p: Partial<InvitationBlock>) => void; placeholderInitial?: string }> = ({ block, editMode, onUpdate, placeholderInitial = 'J' }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { imageData, altText, aspectRatio='free', photoClip='rect', photoMasks=[] } = block;
  const pt: Record<string,string> = {'1:1':'100%','4:3':'75%','3:4':'133%','16:9':'56.25%','free':'66.6%'};
  const combined = { ...getClipStyle(photoClip as ClipShape), ...getMaskStyle(photoMasks as MaskEffect[]) };
  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setUploading(true); deleteUploadedFile(imageData);
    try {
      const form = new FormData(); form.append('file', file);
      const _s = JSON.parse(localStorage.getItem('weddingPro_session')||'{}');
      const res = await fetch(`${API_URL}/upload`,{method:'POST',headers:{Authorization:`Bearer ${_s?.token||''}`},body:form});
      const {url} = await res.json(); onUpdate({imageData:url});
    } catch {} finally { setUploading(false); }
  };
  if (imageData) return (
    <div style={{position:'relative'}}>
      <PhotoClipDefs/>
      <div style={{position:'relative',paddingTop:pt[aspectRatio],overflow:'hidden',...combined}}>
        <img src={imageData} alt={altText||''} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}}/>
        {editMode && (
          <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0)',opacity:0,transition:'opacity .2s',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}
            onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.opacity='1'}
            onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.opacity='0'}>
            <div style={{background:'rgba(0,0,0,.55)',position:'absolute',inset:0}}/>
            <button onClick={()=>fileRef.current?.click()} style={{position:'relative',zIndex:1,padding:8,background:'white',borderRadius:'50%',border:'none',cursor:'pointer'}}><Camera style={{width:20,height:20,color:C.amber}}/></button>
            <button onClick={()=>{deleteUploadedFile(imageData);onUpdate({imageData:undefined});}} style={{position:'relative',zIndex:1,padding:8,background:'white',borderRadius:'50%',border:'none',cursor:'pointer'}}><Trash2 style={{width:20,height:20,color:'#dc2626'}}/></button>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={e=>e.target.files?.[0]&&handleFile(e.target.files[0])} style={{display:'none'}}/>
    </div>
  );
  return (
    <div style={{position:'relative'}}>
      <PhotoClipDefs/>
      <div style={{position:'relative',paddingTop:pt[aspectRatio],...combined,overflow:'hidden',cursor:editMode?'pointer':'default'}}
        onClick={editMode?()=>fileRef.current?.click():undefined}>
        <div style={{position:'absolute',inset:0,background:`linear-gradient(135deg,${C.midJungle},${C.stone})`,display:'flex',alignItems:'center',justifyContent:'center'}}>
          {uploading
            ?<div style={{width:32,height:32,border:'4px solid white',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
            :<div style={{textAlign:'center'}}>
               <span style={{fontFamily:display,fontSize:52,color:hexToRgba(C.amber,.45)}}>{(placeholderInitial||'J')[0].toUpperCase()}</span>
               {editMode&&<p style={{fontFamily:sans,fontSize:11,color:hexToRgba(C.cream,.35),margin:'4px 0 0'}}>Adauga fotografie</p>}
             </div>
          }
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={e=>e.target.files?.[0]&&handleFile(e.target.files[0])} style={{display:'none'}}/>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MUSIC BLOCK
// ─────────────────────────────────────────────────────────────────────────────
const MusicBlock: React.FC<{
  block: InvitationBlock; editMode: boolean;
  onUpdate: (p: Partial<InvitationBlock>) => void;
  imperativeRef?: React.MutableRefObject<{unlock:()=>void;play:()=>void;pause:()=>void}|null>;
}> = ({ block, editMode, onUpdate, imperativeRef }) => {
  const audioRef=useRef<HTMLAudioElement>(null);
  const mp3Ref=useRef<HTMLInputElement>(null);
  const [playing,setPlaying]=useState(false);
  const [progress,setProgress]=useState(0);
  const [duration,setDuration]=useState(0);
  const [showYt,setShowYt]=useState(false);
  const [ytUrl,setYtUrl]=useState('');
  const [ytDownloading,setYtDownloading]=useState(false);
  const [ytError,setYtError]=useState('');

  useEffect(()=>{
    const a=audioRef.current; if(!a) return;
    const onTime=()=>setProgress(a.currentTime);
    const onDur=()=>setDuration(a.duration);
    const onEnd=()=>{setPlaying(false);setProgress(0);};
    const onPlay=()=>setPlaying(true);
    const onPause=()=>setPlaying(false);
    a.addEventListener('timeupdate',onTime);a.addEventListener('loadedmetadata',onDur);
    a.addEventListener('ended',onEnd);a.addEventListener('play',onPlay);a.addEventListener('pause',onPause);
    return()=>{a.removeEventListener('timeupdate',onTime);a.removeEventListener('loadedmetadata',onDur);a.removeEventListener('ended',onEnd);a.removeEventListener('play',onPlay);a.removeEventListener('pause',onPause);};
  },[block.musicUrl,block.musicType]);

  useEffect(()=>{
    if(!imperativeRef) return;
    imperativeRef.current={
      unlock:()=>{if(block.musicType==='mp3'&&audioRef.current&&block.musicUrl){audioRef.current.play().then(()=>{audioRef.current!.pause();audioRef.current!.currentTime=0;}).catch(()=>{});}},
      play:()=>{if(audioRef.current&&block.musicUrl)audioRef.current.play().catch(()=>{});},
      pause:()=>{if(audioRef.current)audioRef.current.pause();},
    };
  });

  const fmt=(s:number)=>`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
  const pct=duration?`${(progress/duration)*100}%`:'0%';
  const toggle=()=>{const a=audioRef.current;if(!a)return;if(playing){a.pause();setPlaying(false);}else{a.play().then(()=>setPlaying(true)).catch(()=>{});}};
  const seek=(e:React.MouseEvent<HTMLDivElement>)=>{if(!audioRef.current||!duration)return;const r=e.currentTarget.getBoundingClientRect();audioRef.current.currentTime=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))*duration;};
  const handleMp3=async(file:File)=>{
    if(!file.type.startsWith('audio/'))return;
    const _s=JSON.parse(localStorage.getItem('weddingPro_session')||'{}');
    try{const form=new FormData();form.append('file',file);const res=await fetch(`${API_URL}/upload`,{method:'POST',headers:{Authorization:`Bearer ${_s?.token||''}`},body:form});if(!res.ok)throw new Error();const{url}=await res.json();onUpdate({musicUrl:url,musicType:'mp3'});}catch(e){console.error(e);}
  };
  const submitYt=async()=>{
    const t=ytUrl.trim();if(!t)return;
    const _s=JSON.parse(localStorage.getItem('weddingPro_session')||'{}');
    setYtDownloading(true);setYtError('');
    try{const res=await fetch(`${API_URL}/download-yt-audio`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${_s?.token||''}`},body:JSON.stringify({url:t})});const data=await res.json();if(!res.ok)throw new Error(data.error||'Eroare');onUpdate({musicUrl:data.url,musicType:'mp3',musicTitle:data.title||'',musicArtist:data.author||''});setShowYt(false);setYtUrl('');}
    catch(e:any){setYtError(e.message||'Nu s-a putut descarca.');}finally{setYtDownloading(false);}
  };
  const isActive=!!block.musicUrl;

  return (
    <div style={{background:hexToRgba(C.darkJungle,.9),border:`1.5px solid ${playing?C.amber:hexToRgba(C.amber,.22)}`,borderRadius:16,padding:'20px 24px',transition:'border-color .4s,box-shadow .4s',boxShadow:playing?`0 0 0 3px ${hexToRgba(C.amber,.18)}`:'none'}}>
      {block.musicType==='mp3'&&block.musicUrl&&<audio ref={audioRef} src={block.musicUrl} preload="metadata"/>}
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
        <div style={{width:32,height:32,borderRadius:'50%',background:playing?C.amber:hexToRgba(C.amber,.12),border:`1.5px solid ${playing?C.amber:hexToRgba(C.amber,.3)}`,display:'flex',alignItems:'center',justifyContent:'center',transition:'all .3s'}}>
          <Music style={{width:14,height:14,color:playing?C.darkJungle:C.amber}}/>
        </div>
        <span style={{fontFamily:sans,fontSize:10,fontWeight:700,letterSpacing:'.3em',textTransform:'uppercase',color:playing?C.amber:hexToRgba(C.cream,.45),transition:'color .3s'}}>
          {playing?'Se reda acum':'Melodia Zilei'}
        </span>
        {playing&&(
          <div style={{display:'flex',alignItems:'flex-end',gap:2,height:14,marginLeft:'auto'}}>
            {[0,.2,.1,.3].map((d,i)=><div key={i} style={{width:3,height:14,background:C.amber,borderRadius:2,transformOrigin:'bottom',animation:`jr-bar .7s ease-in-out ${d}s infinite`}}/>)}
          </div>
        )}
      </div>
      {!isActive&&editMode&&(
        !showYt?(
          <div style={{display:'flex',gap:8}}>
            <button type="button" onClick={()=>mp3Ref.current?.click()} style={{flex:1,background:hexToRgba(C.stone,.4),border:`1px dashed ${hexToRgba(C.amber,.3)}`,borderRadius:10,padding:'14px 0',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
              <Upload style={{width:20,height:20,color:C.amber,opacity:.7}}/><span style={{fontFamily:sans,fontSize:9,color:hexToRgba(C.cream,.45),fontWeight:700,letterSpacing:'.2em',textTransform:'uppercase'}}>MP3</span>
            </button>
            <button type="button" onClick={()=>setShowYt(true)} style={{flex:1,background:hexToRgba(C.stone,.4),border:`1px dashed ${hexToRgba(C.amber,.3)}`,borderRadius:10,padding:'14px 0',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" fill="red" opacity=".8"/><polygon points="9.75,15.02 15.5,12 9.75,8.98 9.75,15.02" fill="white"/></svg>
              <span style={{fontFamily:sans,fontSize:9,color:hexToRgba(C.cream,.45),fontWeight:700,letterSpacing:'.2em',textTransform:'uppercase'}}>YouTube</span>
            </button>
            <input ref={mp3Ref} type="file" accept="audio/*,.mp3" onChange={e=>{const f=e.target.files?.[0];if(f)handleMp3(f);}} style={{display:'none'}}/>
          </div>
        ):(
          <div style={{marginBottom:10}}>
            <div style={{display:'flex',gap:6,marginBottom:ytError?6:0}}>
              <input value={ytUrl} onChange={e=>{setYtUrl(e.target.value);setYtError('');}} onKeyDown={e=>e.key==='Enter'&&!ytDownloading&&submitYt()} placeholder="https://youtu.be/..." autoFocus disabled={ytDownloading}
                style={{flex:1,background:hexToRgba(C.stone,.5),border:`1px solid ${ytError?'#ef4444':hexToRgba(C.amber,.3)}`,borderRadius:8,padding:'9px 12px',fontFamily:sans,fontSize:11,color:C.cream,outline:'none'}}/>
              <button type="button" onClick={submitYt} disabled={ytDownloading} style={{background:C.amber,border:'none',borderRadius:8,padding:'0 14px',cursor:ytDownloading?'not-allowed':'pointer',color:C.darkJungle,fontWeight:700}}>
                {ytDownloading?<div style={{width:14,height:14,border:'2px solid white',borderTopColor:'transparent',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>:'✓'}
              </button>
              <button type="button" onClick={()=>{setShowYt(false);setYtUrl('');setYtError('');}} style={{background:hexToRgba(C.stone,.4),border:'none',borderRadius:8,padding:'0 10px',cursor:'pointer',color:C.cream}}>✕</button>
            </div>
            {ytDownloading&&<p style={{fontFamily:sans,fontSize:9,color:C.amber,margin:0,textAlign:'center'}}>⏳ Se descarca...</p>}
            {ytError&&<p style={{fontFamily:sans,fontSize:9,color:'#ef4444',margin:0}}>⚠ {ytError}</p>}
          </div>
        )
      )}
      {!isActive&&!editMode&&(
        <div style={{textAlign:'center',padding:'16px 0',opacity:.4}}>
          <Music style={{width:32,height:32,color:C.amber,display:'block',margin:'0 auto 6px'}}/>
          <p style={{fontFamily:serif,fontSize:12,fontStyle:'italic',color:hexToRgba(C.cream,.6),margin:0}}>Melodia va aparea aici</p>
        </div>
      )}
      {isActive&&(
        <div>
          <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:14}}>
            <div style={{width:52,height:52,borderRadius:10,background:hexToRgba(C.stone,.6),border:`1.5px solid ${hexToRgba(C.amber,.3)}`,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Music style={{width:20,height:20,color:C.amber,opacity:.7}}/>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <InlineEdit tag="p" editMode={editMode} value={block.musicTitle||''} onChange={v=>onUpdate({musicTitle:v})} placeholder="Titlul melodiei..." style={{fontFamily:serif,fontSize:14,fontStyle:'italic',color:C.cream,margin:0,lineHeight:1.3}}/>
              <InlineEdit tag="p" editMode={editMode} value={block.musicArtist||''} onChange={v=>onUpdate({musicArtist:v})} placeholder="Artist..." style={{fontFamily:sans,fontSize:10,color:hexToRgba(C.cream,.5),margin:'2px 0 0'}}/>
            </div>
          </div>
          <div onClick={seek} style={{height:4,background:hexToRgba(C.amber,.18),borderRadius:99,marginBottom:6,cursor:'pointer',position:'relative'}}>
            <div style={{height:'100%',borderRadius:99,background:C.amber,width:pct,transition:'width .3s linear'}}/>
            <div style={{position:'absolute',top:'50%',transform:'translateY(-50%)',left:pct,marginLeft:-5,width:10,height:10,borderRadius:'50%',background:C.amber,transition:'left .3s linear'}}/>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:14}}>
            <span style={{fontFamily:sans,fontSize:9,color:hexToRgba(C.cream,.4)}}>{fmt(progress)}</span>
            <span style={{fontFamily:sans,fontSize:9,color:hexToRgba(C.cream,.4)}}>{duration?fmt(duration):'--:--'}</span>
          </div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:20}}>
            <button type="button" onClick={()=>{const a=audioRef.current;if(a)a.currentTime=Math.max(0,a.currentTime-10);}} style={{background:'none',border:'none',cursor:'pointer',padding:4,opacity:.5}}><SkipBack style={{width:16,height:16,color:C.amber}}/></button>
            <button type="button" onClick={toggle} style={{width:44,height:44,borderRadius:'50%',background:C.amber,border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 4px 16px ${hexToRgba(C.amber,.5)}`}}>
              {playing?<Pause style={{width:16,height:16,color:C.darkJungle}}/>:<Play style={{width:16,height:16,color:C.darkJungle,marginLeft:2}}/>}
            </button>
            <button type="button" onClick={()=>{const a=audioRef.current;if(a)a.currentTime=Math.min(duration,a.currentTime+10);}} style={{background:'none',border:'none',cursor:'pointer',padding:4,opacity:.5}}><SkipForward style={{width:16,height:16,color:C.amber}}/></button>
          </div>
          {editMode&&<div style={{marginTop:12,textAlign:'center'}}><button type="button" onClick={()=>onUpdate({musicUrl:'',musicType:'none' as any})} style={{background:hexToRgba(C.stone,.4),border:`1px solid ${hexToRgba(C.amber,.2)}`,borderRadius:99,padding:'4px 14px',cursor:'pointer',fontFamily:sans,fontSize:9,color:hexToRgba(C.cream,.5),fontWeight:700}}>Schimba sursa</button></div>}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// BLOCK TOOLBAR
// ─────────────────────────────────────────────────────────────────────────────
const BlockToolbar = ({ onUp, onDown, onToggle, onDelete, visible, isFirst, isLast }: any) => {
  const btn: React.CSSProperties = { background:'none',border:'none',padding:5,borderRadius:99,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',lineHeight:1 };
  const stop = (e: React.MouseEvent) => e.stopPropagation();
  return (
    <div onClick={stop} style={{ position:'absolute',top:-18,right:6,zIndex:9999,display:'flex',alignItems:'center',gap:2,borderRadius:99,border:`1.5px solid ${hexToRgba(C.amber,.35)}`,backgroundColor:hexToRgba(C.darkJungle,.95),backdropFilter:'blur(8px)',padding:'3px 5px',pointerEvents:'auto',boxShadow:'0 4px 16px rgba(0,0,0,.6)' }}>
      <button type="button" onClick={e=>{stop(e);onUp();}} disabled={isFirst} style={{...btn,opacity:isFirst?.2:1}}><ChevronUp style={{width:13,height:13,color:hexToRgba(C.amber,.9)}}/></button>
      <button type="button" onClick={e=>{stop(e);onDown();}} disabled={isLast} style={{...btn,opacity:isLast?.2:1}}><ChevronDown style={{width:13,height:13,color:hexToRgba(C.amber,.9)}}/></button>
      <div style={{width:1,height:12,backgroundColor:hexToRgba(C.amber,.3),margin:'0 1px'}}/>
      <button type="button" onClick={e=>{stop(e);onToggle();}} style={btn}>
        {visible?<Eye style={{width:13,height:13,color:hexToRgba(C.amber,.9)}}/>:<EyeOff style={{width:13,height:13,color:hexToRgba(C.amber,.4)}}/>}
      </button>
      <button type="button" onClick={e=>{stop(e);onDelete();}} style={btn}><Trash2 style={{width:13,height:13,color:'rgba(252,165,165,.9)'}}/></button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// INSERT BLOCK BUTTON
// ─────────────────────────────────────────────────────────────────────────────
const BLOCK_TYPE_ICONS: Record<string,string> = { photo:'🖼',text:'✏',location:'📍',calendar:'📅',countdown:'⏱',music:'🎵',gift:'🎁',whatsapp:'💬',rsvp:'✉',divider:'—',family:'👨‍👩‍👧',date:'📆',description:'📝',timeline:'🗓' };
const InsertBlockButton: React.FC<{ insertIdx:number; openInsertAt:number|null; setOpenInsertAt:(v:number|null)=>void; BLOCK_TYPES:{type:string;label:string;def:any}[]; onInsert:(type:string,def:any)=>void }> = ({ insertIdx, openInsertAt, setOpenInsertAt, BLOCK_TYPES, onInsert }) => {
  const isOpen = openInsertAt===insertIdx;
  const [hov, setHov] = React.useState(false);
  return (
    <div style={{position:'relative',display:'flex',alignItems:'center',justifyContent:'center',height:32,zIndex:20}} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      <div style={{position:'absolute',left:0,right:0,height:1,background:`repeating-linear-gradient(to right,${hexToRgba(C.amber,.4)} 0,${hexToRgba(C.amber,.4)} 6px,transparent 6px,transparent 12px)`,zIndex:1}}/>
      <button type="button" onClick={()=>setOpenInsertAt(isOpen?null:insertIdx)} style={{width:26,height:26,borderRadius:'50%',background:isOpen?C.amber:'rgba(15,25,10,.92)',border:`1.5px solid ${hexToRgba(C.amber,.5)}`,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,color:isOpen?C.darkJungle:C.amber,boxShadow:`0 2px 10px ${hexToRgba(C.amber,.3)}`,opacity:1,transition:'opacity .15s,transform .15s,background .15s',transform:(hov||isOpen)?'scale(1)':'scale(.7)',zIndex:2,position:'relative',lineHeight:1,fontWeight:700}}>{isOpen?'×':'+'}</button>
      {isOpen&&(
        <div style={{position:'absolute',bottom:34,left:'50%',transform:'translateX(-50%)',background:hexToRgba(C.darkJungle,.97),borderRadius:16,border:`1px solid ${hexToRgba(C.amber,.35)}`,boxShadow:`0 16px 48px rgba(0,0,0,.5)`,padding:16,zIndex:100,width:260}} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
          <p style={{fontFamily:sans,fontSize:'.5rem',fontWeight:700,letterSpacing:'.3em',textTransform:'uppercase',color:hexToRgba(C.amber,.6),margin:'0 0 10px',textAlign:'center'}}>Adauga bloc</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
            {BLOCK_TYPES.map(bt=>(
              <button key={bt.type} type="button" onClick={()=>onInsert(bt.type,bt.def)}
                style={{background:hexToRgba(C.stone,.5),border:`1px solid ${hexToRgba(C.amber,.25)}`,borderRadius:10,padding:'8px 4px',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:4,transition:'background .15s,border-color .15s'}}
                onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background=hexToRgba(C.amber,.2);(e.currentTarget as HTMLButtonElement).style.borderColor=hexToRgba(C.amber,.6);}}
                onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background=hexToRgba(C.stone,.5);(e.currentTarget as HTMLButtonElement).style.borderColor=hexToRgba(C.amber,.25);}}>
                <span style={{fontSize:18,lineHeight:1}}>{BLOCK_TYPE_ICONS[bt.type]||'+'}</span>
                <span style={{fontFamily:sans,fontSize:'.5rem',fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:C.cream,lineHeight:1.2,textAlign:'center'}}>{bt.label.replace(/^[^\s]+\s/,'')}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULTS
// ─────────────────────────────────────────────────────────────────────────────
export const CASTLE_DEFAULTS = {
  partner1Name:         'Ariel',
  partner2Name:         '',
  eventType:            'baptism',
  welcomeText:          'Va invitam cu drag',
  celebrationText:      'la botezul ei',
  showWelcomeText:      true,
  showCelebrationText:  true,
  weddingDate:          '',
  rsvpButtonText:       'Confirma Prezenta',
  castleIntroSubtitle:  'te invita in lumea subacvatica',
  castleInviteTop:      'Cu multa bucurie va anuntam',
  castleInviteMiddle:   '',
  castleInviteBottom:   'va fi botezata',
  castleInviteTag:      'deschide valurile',
  colorTheme:           'default',
};

export const CASTLE_DEFAULT_BLOCKS: InvitationBlock[] = [
  {id:'def-music',    type:'music'    as const,show:true,musicTitle:'',musicArtist:'',musicUrl:'',musicType:'none' as const},
  {id:'def-photo-1',  type:'photo'    as const,show:true,imageData:'',altText:'Foto',aspectRatio:'3:4' as const,photoClip:'arch' as const,photoMasks:['fade-b'] as any},
  {id:'def-text-1',   type:'text'     as const,show:true,content:'Undeva sub valurile marii, incepe o zi de poveste. Va invitam sa fiti alaturi de noi!'},
  {id:'def-divider-1',type:'divider'  as const,show:true},
  {id:'def-family-1', type:'family'   as const,show:true,label:'Parintii',content:'Cu drag si bucurie',members:JSON.stringify([{name1:'Mama',name2:'Tata'}])},
  {id:'def-family-2', type:'family'   as const,show:true,label:'Nasii',content:'Cu drag si recunostinta',members:JSON.stringify([{name1:'Nasa',name2:'Nasul'}])},
  {id:'def-calendar', type:'calendar' as const,show:true},
  {id:'def-countdown',type:'countdown'as const,show:true,countdownTitle:'Timp ramas pana la eveniment'},
  {id:'def-divider-2',type:'divider'  as const,show:true},
  {id:'def-loc-1',    type:'location' as const,show:true,label:'Botezul',time:'11:00',locationName:'Paraclisul Sfanta Maria',locationAddress:'Strada Marii 1, Bucuresti',wazeLink:''},
  {id:'def-loc-2',    type:'location' as const,show:true,label:'Petrecerea',time:'15:00',locationName:'Salon Sub Valuri',locationAddress:'Aleea Coralilor 5, Bucuresti',wazeLink:''},
  {id:'def-divider-3',type:'divider'  as const,show:true},
  {id:'def-photo-2',  type:'photo'    as const,show:true,imageData:'',altText:'Foto',aspectRatio:'1:1' as const,photoClip:'circle' as const,photoMasks:['vignette'] as any},
  {id:'def-gift',     type:'gift'     as const,show:true,sectionTitle:'Sugestie de cadou',content:'Cel mai frumos cadou este prezenta voastra alaturi de noi.',iban:'',ibanName:''},
  {id:'def-rsvp',     type:'rsvp'     as const,show:true,label:'Confirma Prezenta'},
];

export const CASTLE_PREVIEW_DATA = {
  guest:{name:'Invitat Drag',status:'pending',type:'adult'},
  project:{selectedTemplate:'little-mermaid'},
  profile:{...CASTLE_DEFAULTS,weddingDate:new Date(Date.now()+60*24*60*60*1000).toISOString().split('T')[0],customSections:JSON.stringify(CASTLE_DEFAULT_BLOCKS)},
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN TEMPLATE
// ─────────────────────────────────────────────────────────────────────────────
const LittleMermaidTemplate: React.FC<InvitationTemplateProps & {
  editMode?: boolean; introPreview?: boolean;
  onProfileUpdate?: (patch: Record<string,any>) => void;
  onBlocksUpdate?: (blocks: InvitationBlock[]) => void;
  onBlockSelect?: (block: InvitationBlock|null, idx:number, textKey?:string, textLabel?:string) => void;
  selectedBlockId?: string; scrollContainer?: HTMLElement|null;
}> = ({ data, onOpenRSVP, editMode=false, introPreview=false, scrollContainer, onProfileUpdate, onBlocksUpdate, onBlockSelect, selectedBlockId }) => {
  const { profile, guest } = data;

  // Apply color theme each render
  const _t = getMermaidTheme((profile as any).colorTheme);
  C = {
    darkJungle: _t.ocean,
    midJungle: _t.deep,
    stone: _t.mid,
    amber: _t.teal,
    amberLight: _t.tealPale,
    cream: _t.pearl,
    muted: hexToRgba(_t.tealPale, 0.6),
    moss: _t.coral,
    text: _t.pearl,
  };

  // ── Config global template (imagini usi) — vin din admin ──────────────────
  const [globalConfig, setGlobalConfig] = useState<Record<string, any>>({});
  useEffect(() => {
    fetch(`${API_URL}/config/template-defaults/${meta.id}`)
      .then(r => r.ok ? r.json() : {})
      .then((cfg: any) => setGlobalConfig(cfg))
      .catch(() => {});
  }, []);
  const activeColorTheme = (profile as any).colorTheme || 'default';
  const themeImgs   = globalConfig.themeImages?.[activeColorTheme] || {};
  const defaultImgs = globalConfig.themeImages?.['default'] || {};
  const heroBgImage       = themeImgs.desktop || defaultImgs.desktop || globalConfig.heroBgImage;
  const heroBgImageMobile = themeImgs.mobile  || defaultImgs.mobile  || globalConfig.heroBgImageMobile;

  const i = {
    logo:      themeImgs.logo || defaultImgs.logo || globalConfig.logo || IMG_LOGO,
    raptor1:   themeImgs.raptor1 || themeImgs.ariel || defaultImgs.raptor1 || defaultImgs.ariel || globalConfig.raptor1 || globalConfig.ariel || IMG_RAPTOR1,
    raptor2:   themeImgs.raptor2 || themeImgs.baby || defaultImgs.raptor2 || defaultImgs.baby || globalConfig.raptor2 || globalConfig.baby || IMG_RAPTOR2,
    torch:     themeImgs.torch || themeImgs.shell || defaultImgs.torch || defaultImgs.shell || globalConfig.torch || globalConfig.shell || IMG_TORCH,
    leaf1:     themeImgs.leaf1 || themeImgs.coral || defaultImgs.leaf1 || defaultImgs.coral || globalConfig.leaf1 || globalConfig.coral || IMG_LEAF1,
    leaf2:     themeImgs.leaf2 || themeImgs.coral || defaultImgs.leaf2 || defaultImgs.coral || globalConfig.leaf2 || globalConfig.coral || IMG_LEAF2,
    footprint: themeImgs.footprint || themeImgs.pearl || defaultImgs.footprint || defaultImgs.pearl || globalConfig.footprint || globalConfig.pearl || IMG_FOOTPRINT,
    egg:       themeImgs.egg || themeImgs.pearl || defaultImgs.egg || defaultImgs.pearl || globalConfig.egg || globalConfig.pearl || IMG_EGG,
    fern:      themeImgs.fern || themeImgs.sebastian || defaultImgs.fern || defaultImgs.sebastian || globalConfig.fern || globalConfig.sebastian || IMG_FERN,
    trex:      themeImgs.trex || themeImgs.flounder || defaultImgs.trex || defaultImgs.flounder || globalConfig.trex || globalConfig.flounder || IMG_TREX,
    dino1:     themeImgs.dino1 || themeImgs.banner || defaultImgs.dino1 || defaultImgs.banner || globalConfig.dino1 || globalConfig.banner || IMG_DINO1,
    dino2:     themeImgs.dino2 || themeImgs.moonscene || defaultImgs.dino2 || defaultImgs.moonscene || globalConfig.dino2 || globalConfig.moonscene || IMG_DINO2,
    hero:      themeImgs.hero || themeImgs.banner || defaultImgs.hero || defaultImgs.banner || globalConfig.hero || globalConfig.banner || IMG_HERO,
  };

  const safeJSON = (s:string|undefined,fb:any)=>{try{return s?JSON.parse(s):fb;}catch{return fb;}};

  const pr = profile as any;
  const p = {
    partner1Name:        pr.partner1Name        ?? CASTLE_DEFAULTS.partner1Name,
    partner2Name:        pr.partner2Name        ?? '',
    eventType:           pr.eventType           ?? 'baptism',
    weddingDate:         pr.weddingDate          ?? '',
    welcomeText:         pr.welcomeText          ?? CASTLE_DEFAULTS.welcomeText,
    celebrationText:     pr.celebrationText      ?? CASTLE_DEFAULTS.celebrationText,
    showWelcomeText:     pr.showWelcomeText      ?? true,
    showCelebrationText: pr.showCelebrationText  ?? true,
    castleIntroSubtitle: pr.castleIntroSubtitle  ?? CASTLE_DEFAULTS.castleIntroSubtitle,
    castleInviteTop:     pr.castleInviteTop      ?? CASTLE_DEFAULTS.castleInviteTop,
    castleInviteMiddle:  pr.castleInviteMiddle   ?? CASTLE_DEFAULTS.castleInviteMiddle,
    castleInviteBottom:  pr.castleInviteBottom   ?? CASTLE_DEFAULTS.castleInviteBottom,
    castleInviteTag:     pr.castleInviteTag      ?? CASTLE_DEFAULTS.castleInviteTag,
  };

  const isWedding = ['wedding','anniversary'].includes(p.eventType.toLowerCase());
  const babyName  = p.partner1Name;
  const heroTitle = isWedding ? [p.partner1Name, p.partner2Name].filter(Boolean).join(' & ') : p.partner1Name;
  const dateStr   = p.weddingDate ? new Date(p.weddingDate).toLocaleDateString('ro-RO',{day:'numeric',month:'long',year:'numeric'}) : 'Data Evenimentului';
  const wd        = p.weddingDate ? new Date(p.weddingDate) : null;
  const pageBgColor = C.darkJungle;
  const heroTextStyles = pr.heroTextStyles || {};
  const introTextStyles = pr.introTextStyles || {};
  const heroBlock: InvitationBlock = { id:'__hero__', type:'__hero__' as any, show:true, textStyles: heroTextStyles } as any;
  const introBlock: InvitationBlock = { id:'__intro__', type:'intro' as any, show:true, textStyles: introTextStyles } as any;

  // ── Blocks ────────────────────────────────────────────────────────────────
  const blocksFromDB: InvitationBlock[]|null = safeJSON(pr.customSections, null);
  const hasDB = Array.isArray(blocksFromDB) && blocksFromDB.length > 0;
  const [blocks, setBlocks] = useState<InvitationBlock[]>(()=> hasDB ? blocksFromDB! : CASTLE_DEFAULT_BLOCKS as unknown as InvitationBlock[]);
  useEffect(()=>{
    const fresh: InvitationBlock[]|null = safeJSON(pr.customSections, null);
    if (Array.isArray(fresh) && fresh.length > 0) setBlocks(fresh);
    else if (fresh !== null && Array.isArray(fresh) && fresh.length === 0) setBlocks(CASTLE_DEFAULT_BLOCKS as unknown as InvitationBlock[]);
  }, [pr.customSections]);

  const [openInsertAt, setOpenInsertAt] = useState<number|null>(null);
  const musicPlayRef = useRef<{unlock:()=>void;play:()=>void;pause:()=>void}|null>(null);

  const updBlock = useCallback((idx:number,patch:Partial<InvitationBlock>)=>{setBlocks(prev=>{const nb=prev.map((b,i)=>i===idx?{...b,...patch}:b);onBlocksUpdate?.(nb);return nb;});},[onBlocksUpdate]);
  const movBlock = useCallback((idx:number,dir:-1|1)=>{setBlocks(prev=>{const nb=[...prev];const to=idx+dir;if(to<0||to>=nb.length)return prev;[nb[idx],nb[to]]=[nb[to],nb[idx]];onBlocksUpdate?.(nb);return nb;});},[onBlocksUpdate]);
  const delBlock = useCallback((idx:number)=>{setBlocks(prev=>{const nb=prev.filter((_,i)=>i!==idx);onBlocksUpdate?.(nb);return nb;});},[onBlocksUpdate]);
  const addBlockAt = useCallback((afterIdx:number,type:string,def:any)=>{setBlocks(prev=>{const nb=[...prev];nb.splice(afterIdx+1,0,{id:Date.now().toString(),type:type as InvitationBlockType,show:true,...def});onBlocksUpdate?.(nb);return nb;});},[onBlocksUpdate]);
  const handleInsertAt=(afterIdx:number,type:string,def:any)=>{addBlockAt(afterIdx,type,def);setOpenInsertAt(null);};

  // ── Profile update ────────────────────────────────────────────────────────
  const _pq = useRef<Record<string,any>>({});
  const _pt = useRef<ReturnType<typeof setTimeout>|null>(null);
  const upProfile = useCallback((field:string,value:any)=>{_pq.current={..._pq.current,[field]:value};if(_pt.current)clearTimeout(_pt.current);_pt.current=setTimeout(()=>{onProfileUpdate?.(_pq.current);_pq.current={};},400);},[onProfileUpdate]);

  // ── Timeline ──────────────────────────────────────────────────────────────
  const getTimelineItems=()=>safeJSON(pr.timeline,[]);
  const updateTimeline=(next:any[])=>onProfileUpdate?.({timeline:JSON.stringify(next),showTimeline:true});
  const addTimelineItem=(preset:{icon?:string;title?:string}|null)=>{const c=getTimelineItems();updateTimeline([...c,{id:Date.now().toString(),title:preset?.title||'',time:'',icon:preset?.icon||'party'}]);};
  const updateTimelineItem=(id:string,patch:any)=>updateTimeline(getTimelineItems().map((t:any)=>t.id===id?{...t,...patch}:t));
  const removeTimelineItem=(id:string)=>updateTimeline(getTimelineItems().filter((t:any)=>t.id!==id));

  // ── Intro + audio ─────────────────────────────────────────────────────────
  const hasMusicBlock = useCallback(()=>blocks.some(b=>b.type==='music'&&b.musicType!=='none'&&b.musicUrl),[blocks]);
  const [showAudioModal,setShowAudioModal]   = useState(false);
  const [audioAllowed,setAudioAllowed]       = useState(false);
  const audioAllowedRef                      = useRef(false);
  const [showIntro,setShowIntro]             = useState(!editMode);
  const contentRef                           = useRef<HTMLDivElement>(null);
  const [contentEl,setContentEl]             = useState<HTMLElement|null>(null);

  useEffect(()=>{if(!editMode)setShowAudioModal(hasMusicBlock());},[]);
  useEffect(()=>{setShowIntro(!editMode);},[editMode]);

  // Keep browser chrome / overscroll area aligned with template background on mobile.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById('root');

    const prevHtmlBg = html.style.backgroundColor;
    const prevHtmlBgRaw = html.style.background;
    const prevBodyBg = body.style.backgroundColor;
    const prevBodyBgRaw = body.style.background;
    const prevRootBg = root?.style.backgroundColor ?? '';
    const prevRootBgRaw = root?.style.background ?? '';
    const prevHtmlMinH = html.style.minHeight;
    const prevBodyMinH = body.style.minHeight;
    const prevRootMinH = root?.style.minHeight ?? '';
    const prevHtmlOverscroll = (html.style as any).overscrollBehaviorY ?? '';
    const prevBodyOverscroll = (body.style as any).overscrollBehaviorY ?? '';

    html.style.setProperty('background', pageBgColor, 'important');
    html.style.setProperty('background-color', pageBgColor, 'important');
    body.style.setProperty('background', pageBgColor, 'important');
    body.style.setProperty('background-color', pageBgColor, 'important');
    root?.style.setProperty('background', pageBgColor, 'important');
    root?.style.setProperty('background-color', pageBgColor, 'important');
    html.style.minHeight = '100%';
    body.style.minHeight = '100%';
    if (root) root.style.minHeight = '100%';
    (html.style as any).overscrollBehaviorY = 'none';
    (body.style as any).overscrollBehaviorY = 'none';

    let createdThemeMeta: HTMLMetaElement | null = null;
    let themeMetas = Array.from(document.querySelectorAll('meta[name="theme-color"]')) as HTMLMetaElement[];
    if (themeMetas.length === 0) {
      createdThemeMeta = document.createElement('meta');
      createdThemeMeta.setAttribute('name', 'theme-color');
      document.head.appendChild(createdThemeMeta);
      themeMetas = [createdThemeMeta];
    }
    const prevThemeColors = themeMetas.map(m => m.getAttribute('content'));
    themeMetas.forEach(m => m.setAttribute('content', pageBgColor));

    return () => {
      html.style.backgroundColor = prevHtmlBg;
      html.style.background = prevHtmlBgRaw;
      body.style.backgroundColor = prevBodyBg;
      body.style.background = prevBodyBgRaw;
      if (root) {
        root.style.backgroundColor = prevRootBg;
        root.style.background = prevRootBgRaw;
      }
      html.style.minHeight = prevHtmlMinH;
      body.style.minHeight = prevBodyMinH;
      if (root) root.style.minHeight = prevRootMinH;
      (html.style as any).overscrollBehaviorY = prevHtmlOverscroll;
      (body.style as any).overscrollBehaviorY = prevBodyOverscroll;

      themeMetas.forEach((m, idx) => {
        const prev = prevThemeColors[idx];
        if (prev == null) m.removeAttribute('content');
        else m.setAttribute('content', prev);
      });
      if (createdThemeMeta) {
        createdThemeMeta.remove();
      }
    };
  }, [pageBgColor]);

  // ── Reset ─────────────────────────────────────────────────────────────────
  const resetToDefaults = useCallback(()=>{
    if(!window.confirm('Resetezi templateul la valorile implicite? Toate modificarile vor fi pierdute.'))return;
    onProfileUpdate?.({...CASTLE_DEFAULTS,weddingDate:pr.weddingDate??''});
    const fb=CASTLE_DEFAULT_BLOCKS.map((b,i)=>({...b,id:`def-${Date.now()}-${i}`}));
    setBlocks(fb as unknown as InvitationBlock[]);
    onBlocksUpdate?.(fb as unknown as InvitationBlock[]);
  },[onProfileUpdate,onBlocksUpdate,pr.weddingDate]);

  const BLOCK_TYPES = [
    {type:'photo',      label:'📷 Foto',     def:{imageData:'',aspectRatio:'1:1',photoClip:'rect',photoMasks:[]}},
    {type:'text',       label:'Text',         def:{content:'O poveste subacvatica de neuitat...'}},
    {type:'location',   label:'Locatie',      def:{label:'Locatie',time:'11:00',locationName:'Locatie',locationAddress:'Adresa'}},
    {type:'calendar',   label:'📅 Calendar', def:{}},
    {type:'countdown',  label:'⏱ Countdown', def:{}},
    {type:'music',      label:'🎵 Muzica',   def:{musicTitle:'',musicArtist:'',musicType:'none'}},
    {type:'gift',       label:'🎁 Cadouri',  def:{sectionTitle:'Sugestie cadou',content:'',iban:'',ibanName:''}},
    {type:'whatsapp',   label:'WhatsApp',     def:{label:'Contact WhatsApp',content:'0700000000'}},
    {type:'rsvp',       label:'RSVP',         def:{label:'Confirma Prezenta'}},
    {type:'divider',    label:'Linie',        def:{}},
    {type:'family',     label:'👨‍👩‍👧 Familie',def:{label:'Parintii',content:'Cu drag',members:JSON.stringify([{name1:'Mama',name2:'Tata'}])}},
    {type:'date',       label:'📆 Data',      def:{}},
    {type:'description',label:'Descriere',    def:{content:'O scurta descriere...'}},
  ];

  const decoImages = [i.leaf1, i.fern, i.leaf2, i.dino1, i.dino2, i.egg];
  const dinoIcons  = ['🐚','🐠','🌊','🪸','🐟'];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: JR_CSS }}/>
      <div
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 'env(safe-area-inset-top)',
          background: pageBgColor,
          pointerEvents: 'none',
          zIndex: 2147483000,
        }}
      />

      {/* Audio modal */}
      {showAudioModal && !editMode && (
        <AudioPermissionModal childName={p.partner1Name||'Ariel'}
          onAllow={()=>{audioAllowedRef.current=true;setAudioAllowed(true);musicPlayRef.current?.unlock();setShowAudioModal(false);}}
          onDeny={()=>{audioAllowedRef.current=false;setShowAudioModal(false);}} i={i} />
      )}

      {/* Intro doors */}
      {showIntro && (
        <BlockStyleProvider value={{blockId:'__intro__',textStyles:introTextStyles}}>
          <JurassicDoorIntro
            contentEl={contentEl} scrollContainer={scrollContainer}
            childName={p.partner1Name||'Ariel'} partner2Name={p.partner2Name}
            isWedding={isWedding} subtitle={p.castleIntroSubtitle}
            inviteTop={p.castleInviteTop} inviteMiddle={p.castleInviteMiddle||dateStr}
            inviteBottom={p.castleInviteBottom} inviteTag={p.castleInviteTag} dateStr={dateStr}
            doorImg={heroBgImage} doorImgMobile={heroBgImageMobile}
            onDoorsOpen={()=>{if(audioAllowedRef.current&&musicPlayRef.current)musicPlayRef.current.play();}}
            i={i}
          />
        </BlockStyleProvider>
      )}

      {/* Intro preview panel in editMode */}
      {editMode && introPreview && (
        <div className="max-w-2xl mx-auto px-6 relative z-10">
          <div style={{marginBottom:32,padding:20,background:hexToRgba(C.midJungle,.5),borderRadius:20,border:`1px solid ${hexToRgba(C.amber,.2)}`}}>
            <p style={{fontFamily:sans,fontSize:10,letterSpacing:'.3em',fontWeight:700,color:hexToRgba(C.amber,.6),textTransform:'uppercase',marginBottom:12}}>Preview intro (editabil)</p>
            <div style={{borderRadius:14,overflow:'hidden',border:`1px solid ${hexToRgba(C.amber,.2)}`}}>
              <BlockStyleProvider value={{blockId:'__intro__',textStyles:introTextStyles,onTextSelect:(k,l)=>onBlockSelect?.(introBlock,-1,k,l)}}>
                <JurassicDoorIntro
                  editMode previewMode="static"
                  childName={p.partner1Name||'Ariel'} partner2Name={p.partner2Name}
                  isWedding={isWedding} subtitle={p.castleIntroSubtitle}
                  inviteTop={p.castleInviteTop} inviteMiddle={p.castleInviteMiddle||dateStr}
                  inviteBottom={p.castleInviteBottom} inviteTag={p.castleInviteTag} dateStr={dateStr}
                  doorImg={heroBgImage} doorImgMobile={heroBgImageMobile}
                  onChildNameChange={v=>upProfile('partner1Name',v)}
                  onSubtitleChange={v=>upProfile('castleIntroSubtitle',v)}
                  onInviteTopChange={v=>upProfile('castleInviteTop',v)}
                  onInviteMiddleChange={v=>upProfile('castleInviteMiddle',v)}
                  onInviteBottomChange={v=>upProfile('castleInviteBottom',v)}
                  onInviteTagChange={v=>upProfile('castleInviteTag',v)}
                  i={i}
                />
              </BlockStyleProvider>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div
        ref={el=>{ contentRef.current=el; setContentEl(el); }}
        style={{
          minHeight:'100dvh',
          background:`linear-gradient(180deg,${C.darkJungle} 0%,${hexToRgba(C.midJungle,.9)} 40%,${C.darkJungle} 100%)`,
          backgroundColor:C.darkJungle,
          fontFamily:sans,
          position:'relative',
          paddingBottom:'max(140px, calc(env(safe-area-inset-bottom) + 96px))',
          overflow:'hidden'
        }}>

        {/* Ambient glows */}
        <div style={{position:'fixed',top:'8%',left:'4%',width:300,height:300,borderRadius:'50%',pointerEvents:'none',zIndex:1,background:`radial-gradient(circle,${hexToRgba(C.amber,.06)} 0%,transparent 70%)`}}/>
        <div style={{position:'fixed',bottom:'12%',right:'4%',width:260,height:260,borderRadius:'50%',pointerEvents:'none',zIndex:1,background:`radial-gradient(circle,${hexToRgba(C.moss,.1)} 0%,transparent 70%)`}}/>
        <img src={IMG_LEAF1} alt="" style={{position:'fixed',bottom:'2%',left:0,width:90,opacity:.2,pointerEvents:'none',zIndex:1}}/>
        <img src={IMG_LEAF2} alt="" style={{position:'fixed',bottom:'2%',right:0,width:90,opacity:.2,transform:'scaleX(-1)',pointerEvents:'none',zIndex:1}}/>

        <div style={{ position:'relative', zIndex:1, maxWidth:440, margin:'0 auto', padding:'0 16px' }}>

          {/* ── HERO CARD ────────────────────────────────────────────────── */}
          <BlockStyleProvider value={{blockId:'__hero__',textStyles:heroTextStyles,onTextSelect:(k,l)=>onBlockSelect?.(heroBlock,-1,k,l)}}>
            <div style={{ background:`linear-gradient(160deg,${hexToRgba(C.midJungle,.94)} 0%,${C.darkJungle} 100%)`, borderRadius:22, border:`1.5px solid ${hexToRgba(C.amber,.2)}`, overflow:'hidden', position:'relative', boxShadow:`0 24px 80px rgba(0,0,0,.65)` }}>
              {/* Hero bg */}
              <div style={{position:'absolute',inset:0,pointerEvents:'none'}}>
                <img src={heroBgImage} alt="" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center 50px',opacity:.15}}/>
                <div style={{position:'absolute',inset:0,background:`linear-gradient(180deg,transparent 0%,${C.darkJungle} 72%)`}}/>
              </div>
              {/* Top accent line */}
              <div style={{height:3,background:`linear-gradient(to right,${hexToRgba(C.amber,.15)},${C.amber},${hexToRgba(C.amber,.15)})`,position:'relative',zIndex:1}}/>

              {/* Corner ferns — on card root so they show inside hero bg */}
              <img src={IMG_FERN} alt="" style={{position:'absolute',top:14,left:-4,width:70,opacity:.4,pointerEvents:'none',zIndex:2}}/>
              <img src={IMG_FERN} alt="" style={{position:'absolute',top:14,right:-4,width:70,opacity:.4,transform:'scaleX(-1)',pointerEvents:'none',zIndex:2}}/>
              <div style={{ position: 'relative', height: 185, overflow: 'hidden', borderRadius: '18px 18px 0 0', zIndex: 3 }}>
                <img
                  src={i.hero}
                  alt="Mica Sirena"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 25%', filter: 'brightness(0.75) saturate(1.3)' }}
                />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: `linear-gradient(to top, ${hexToRgba(C.darkJungle, 0.98)}, transparent)` }} />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: `linear-gradient(to right, transparent, ${hexToRgba(C.amber, 0.35)}, ${C.amber}, ${hexToRgba(C.amber, 0.35)}, transparent)`,
                    boxShadow: `0 0 10px ${hexToRgba(C.amber, 0.35)}`,
                  }}
                />
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                  {[
                    { left: '12%', top: '20%', size: 10, color: '#FF4D4D', glyph: '✦', delay: '0s', dur: '1.5s' },
                    { left: '24%', top: '27%', size: 13, color: '#FF9500', glyph: '⭐', delay: '0.15s', dur: '1.7s' },
                    { left: '36%', top: '34%', size: 16, color: '#FFE500', glyph: '✧', delay: '0.3s', dur: '1.9s' },
                    { left: '48%', top: '41%', size: 11, color: '#4DFF91', glyph: '★', delay: '0.45s', dur: '2.1s' },
                    { left: '60%', top: '48%', size: 14, color: '#00C8FF', glyph: '✨', delay: '0.6s', dur: '2.3s' },
                    { left: '72%', top: '55%', size: 17, color: '#7B4FBE', glyph: '✦', delay: '0.75s', dur: '2.5s' },
                    { left: '84%', top: '22%', size: 12, color: '#FF4DC8', glyph: '⭐', delay: '0.9s', dur: '2.7s' },
                  ].map((star, si) => (
                    <div
                      key={si}
                      style={{
                        position: 'absolute',
                        left: star.left,
                        top: star.top,
                        fontSize: star.size,
                        color: star.color,
                        animation: `ar-twinkle ${star.dur} ease-in-out ${star.delay} infinite`,
                        filter: `drop-shadow(0 0 4px ${star.color})`,
                      }}
                    >
                      {star.glyph}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ position:'relative', zIndex:1, textAlign:'center', padding:'20px 28px 36px' }}>
                <Reveal delay={0.15}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ flex: 1, height: 0.8, background: `linear-gradient(to right, transparent, ${C.amber})`, opacity: 0.45 }} />
                    <svg
                      width="34"
                      height="34"
                      viewBox="0 0 60 60"
                      fill="none"
                      style={{ animation: 'ar-starSpin 5s ease-in-out infinite', filter: `drop-shadow(0 0 10px ${C.amber})` }}
                    >
                      <path d="M30 4 L34.5 22 L52 16 L40 29 L56 36 L38 36 L36 56 L30 40 L24 56 L22 36 L4 36 L20 29 L8 16 L25.5 22 Z" fill={C.amber} opacity=".9" />
                      <path d="M30 10 L33 22 L44 18 L37 27 L48 32 L36 32 L34.5 50 L30 36 L25.5 50 L24 32 L12 32 L23 27 L16 18 L27 22 Z" fill="rgba(255,255,255,.25)" />
                    </svg>
                    <div style={{ flex: 1, height: 0.8, background: `linear-gradient(to left, transparent, ${C.amber})`, opacity: 0.45 }} />
                  </div>
                  <p style={{ fontFamily: display, fontSize: 8, letterSpacing: '0.65em', textTransform: 'uppercase', color: C.amber, margin: '0 0 12px', opacity: 0.9 }}>
                    Mica Sirena · Invitatie Magica
                  </p>
                </Reveal>

                {/* Welcome */}
                {p.showWelcomeText !== false && (
                  <Reveal delay={0.2}>
                    <InlineEdit tag="p" editMode={editMode} value={p.welcomeText} onChange={v=>upProfile('welcomeText',v)} textLabel="Hero · Welcome"
                      style={{fontFamily:serif,fontSize:13,fontStyle:'italic',color:hexToRgba(C.cream,.5),margin:'0 0 10px',lineHeight:1.7}}/>
                  </Reveal>
                )}

                {/* Name */}
                <Reveal delay={0.25}>
                  <InlineEdit tag="h1" editMode={editMode}
                    value={heroTitle}
                    onChange={v=>{if(!isWedding){upProfile('partner1Name',v);return;}const parts=v.split('&');upProfile('partner1Name',parts[0]?.trim()||'');upProfile('partner2Name',parts.slice(1).join('&').trim()||'');}}
                    textLabel="Hero · Name"
                    style={{fontFamily:display,fontSize:'clamp(34px,8vw,54px)',fontWeight:700,color:C.cream,margin:'0 0 4px',lineHeight:1.05,textShadow:`0 0 24px ${hexToRgba(C.amber,.5)}, 0 2px 0 rgba(0,0,0,.4)`,letterSpacing:'.02em'}}/>
                </Reveal>

                {/* Celebration */}
                {p.showCelebrationText !== false && (
                  <Reveal delay={0.3}>
                    <InlineEdit tag="p" editMode={editMode} value={p.celebrationText} onChange={v=>upProfile('celebrationText',v)} textLabel="Hero · Celebration"
                      style={{fontFamily:serif,fontSize:14,fontStyle:'italic',color:hexToRgba(C.amber,.7),margin:'8px 0 0'}}/>
                  </Reveal>
                )}

                <div style={{margin:'22px 0'}}><JungleDivider i={i} /></div>

                {/* Date card */}
                <Reveal delay={0.35}>
                  <div style={{display:'flex',alignItems:'center',gap:10,justifyContent:'center',margin:'0 0 20px'}}>
                    <div style={{flex:1,height:1,background:`linear-gradient(to right,transparent,${hexToRgba(C.amber,.3)})`}}/>
                    <div style={{background:hexToRgba(C.amber,.12),border:`1.5px solid ${hexToRgba(C.amber,.32)}`,borderRadius:14,padding:'10px 20px',textAlign:'center',minWidth:110}}>
                      {wd ? (
                        <>
                          <p style={{fontFamily:display,fontSize:34,fontWeight:700,color:C.cream,margin:0,lineHeight:1,textShadow:`0 0 12px ${hexToRgba(C.amber,.4)}`}}>{wd.getDate()}</p>
                          <p style={{fontFamily:serif,fontSize:12,fontStyle:'italic',color:hexToRgba(C.amber,.85),margin:'2px 0 0'}}>{wd.toLocaleDateString('ro-RO',{month:'long',year:'numeric'})}</p>
                          <p style={{fontFamily:sans,fontSize:9,color:hexToRgba(C.cream,.4),textTransform:'capitalize',margin:'1px 0 0',letterSpacing:'.05em'}}>{wd.toLocaleDateString('ro-RO',{weekday:'long'})}</p>
                        </>
                      ) : <p style={{color:hexToRgba(C.cream,.3),fontFamily:sans,fontSize:11,margin:0}}>Data neconfigurata</p>}
                    </div>
                    <div style={{flex:1,height:1,background:`linear-gradient(to left,transparent,${hexToRgba(C.amber,.3)})`}}/>
                  </div>
                </Reveal>

                {/* Countdown */}
                <Reveal delay={0.4}>
                  <div style={{margin:'0 0 24px'}}>
                    <JurassicCountdown targetDate={p.weddingDate}/>
                  </div>
                </Reveal>

                {/* Characters row */}
                <Reveal delay={0.44}>
                  <div style={{display:'flex',justifyContent:'center',gap:16,marginBottom:20}}>
                    {[{src:i.raptor1,d:0},{src:i.trex,d:.25},{src:i.raptor2,d:.5}].map((ch,i)=>(
                      <div key={i} style={{animation:`${i%2===0?'jr-float':'jr-floatR'} ${1.6+i*.35}s ${ch.d}s ease-in-out infinite`}}>
                        <img src={ch.src} alt="" style={{height:100,objectFit:'contain',filter:'drop-shadow(0 4px 10px rgba(0,0,0,.6))',transform:i===2?'scaleX(-1)':undefined}}/>
                      </div>
                    ))}
                  </div>
                </Reveal>

                <div style={{margin:'0 0 18px'}}><JungleDivider i={i} /></div>

                {/* Guest card */}
                <Reveal delay={0.48}>
                  <div style={{background:hexToRgba(C.amber,.08),border:`2px solid ${hexToRgba(C.amber,.22)}`,borderRadius:14,padding:'14px 20px',position:'relative'}}>
                    <img src={i.egg} alt="" style={{position:'absolute',bottom:-14,right:-6,width:52,objectFit:'contain',filter:'drop-shadow(0 4px 8px rgba(0,0,0,.5))',pointerEvents:'none'}}/>
                    <p style={{fontFamily:sans,fontSize:9,fontWeight:700,letterSpacing:'.38em',textTransform:'uppercase',color:hexToRgba(C.amber,.6),margin:'0 0 5px'}}>🎟 Invitat special</p>
                    <p style={{fontFamily:display,fontSize:20,color:C.cream,margin:0,letterSpacing:.5,textShadow:`0 0 10px ${hexToRgba(C.amber,.3)}`}}>{guest?.name||'Invitatul Special'}</p>
                  </div>
                </Reveal>
              </div>
            </div>
          </BlockStyleProvider>

          {/* ── BLOCKS ───────────────────────────────────────────────────── */}
          <div style={{display:'flex',flexDirection:'column',gap:0}}>
            {editMode && (
              <InsertBlockButton insertIdx={-1} openInsertAt={openInsertAt} setOpenInsertAt={setOpenInsertAt} BLOCK_TYPES={BLOCK_TYPES} onInsert={(t,d)=>handleInsertAt(-1,t,d)}/>
            )}

            {blocks.filter(b=>editMode||b.show!==false).map((block,idx)=>(
              <div key={block.id} style={{position:'relative'}}>
                {editMode && (
                  <BlockToolbar onUp={()=>movBlock(idx,-1)} onDown={()=>movBlock(idx,1)} onToggle={()=>updBlock(idx,{show:!block.show})} onDelete={()=>delBlock(idx)} visible={block.show!==false} isFirst={idx===0} isLast={idx===blocks.length-1}/>
                )}

                <div style={{position:'relative',padding:'10px 0',opacity:block.show===false?.4:1}} onClick={editMode?()=>onBlockSelect?.(block,idx):undefined}>
                  <BlockStyleProvider value={{blockId:block.id,textStyles:(block as any).textStyles,onTextSelect:(k,l)=>onBlockSelect?.(block,idx,k,l)}}>

                    {/* Hidden overlay */}
                    {editMode && block.show === false && (
                      <div style={{position:'absolute',inset:0,zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:16,pointerEvents:'none'}}>
                        <div style={{position:'absolute',inset:0,borderRadius:16,background:'rgba(0,0,0,.12)',backdropFilter:'blur(2px)'}}/>
                        <div style={{position:'relative',zIndex:10}}><EyeOff size={22} color={hexToRgba(C.amber,.6)}/></div>
                      </div>
                    )}

                    {/* ── divider ── */}
                    {block.type==='divider' && <JungleDivider i={i} />}

                    {/* ── rsvp ── */}
                    {block.type==='rsvp' && (
                      <div style={{textAlign:'center'}}>
                        <div style={{animation:'jr-float 3s ease-in-out infinite',display:'inline-block',marginBottom:10}}>
                          <img src={i.trex} alt="" style={{width:80,objectFit:'contain',filter:'drop-shadow(0 6px 14px rgba(0,0,0,.55))',display:'block',margin:'0 auto'}}/>
                        </div>
                        <button type="button" onClick={()=>!editMode&&onOpenRSVP?.()} style={{width:'100%',padding:'18px 24px',background:`linear-gradient(135deg,${C.amber} 0%,${C.amberLight} 50%,${C.amber} 100%)`,border:'none',borderRadius:18,cursor:'pointer',fontFamily:display,fontWeight:700,fontSize:12,letterSpacing:'.25em',textTransform:'uppercase',color:C.darkJungle,boxShadow:`0 8px 28px ${hexToRgba(C.amber,.55)},inset 0 1px 0 rgba(255,255,255,.2)`,animation:'jr-pulse 2.5s ease-in-out infinite',position:'relative',overflow:'hidden'}}>
                          <div style={{position:'absolute',inset:0,background:'linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent)',backgroundSize:'200% 100%',animation:'jr-shimmer 2s linear infinite',borderRadius:18}}/>
                          <span style={{position:'relative'}}>
                            <InlineEdit editMode={editMode} value={` ${block.label||'Confirma Prezenta'}`} onChange={v=>updBlock(idx,{label:v.replace(/🦖/g,'').trim()})}/>
                          </span>
                        </button>
                      </div>
                    )}

                    {/* ── photo ── */}
                    {block.type==='photo' && (
                      <Reveal>
                        <div onClick={editMode?()=>onBlockSelect?.(block,idx):undefined} style={editMode?{cursor:'pointer',outline:selectedBlockId===block.id?`2px solid ${C.amber}`:'none',outlineOffset:4,borderRadius:16}:undefined}>
                          <PhotoBlock block={block} editMode={editMode} onUpdate={p=>updBlock(idx,p)} placeholderInitial={babyName[0]}/>
                        </div>
                      </Reveal>
                    )}

                    {/* ── text ── */}
                    {block.type==='text' && (
                      <Reveal>
                        <BlockCard accentIcon="📜">
                          <InlineEdit editMode={editMode} value={block.content||''} onChange={v=>updBlock(idx,{content:v})} multiline
                            style={{fontFamily:serif,fontSize:15,fontStyle:'italic',color:hexToRgba(C.cream,.78),margin:0,lineHeight:1.8,textAlign:'center'}}/>
                        </BlockCard>
                      </Reveal>
                    )}

                    {/* ── location ── */}
                    {block.type==='location' && (
                      <Reveal>
                        <LocCard block={block} editMode={editMode} onUpdate={p=>updBlock(idx,p)} imgDeco={i.dino2}/>
                      </Reveal>
                    )}

                    {/* ── calendar ── */}
                    {block.type==='calendar' && (
                      <Reveal>
                        <BlockCard accentIcon="📅" imgDeco={{src:i.raptor1,side:'left',top:-18,size:68}}>
                          <CalendarMonth date={p.weddingDate}/>
                        </BlockCard>
                      </Reveal>
                    )}

                    {/* ── countdown ── */}
                    {block.type==='countdown' && (
                      <Reveal>
                        <BlockCard accentIcon="⏳" imgDeco={{src:i.raptor2,side:'right',top:-18,size:68}}>
                          <div style={{display:'flex',justifyContent:'center',marginBottom:14}}>
                            <span style={{fontFamily:sans,fontSize:9,fontWeight:700,letterSpacing:'.4em',textTransform:'uppercase',color:hexToRgba(C.amber,.75),padding:'4px 16px',borderRadius:50,background:hexToRgba(C.amber,.1),border:`1.5px solid ${hexToRgba(C.amber,.3)}`}}>
                              ⏳ Timp ramas
                            </span>
                          </div>
                          <JurassicCountdown targetDate={p.weddingDate}/>
                        </BlockCard>
                      </Reveal>
                    )}

                    {/* ── timeline ── */}
                    {block.type==='timeline' && (()=>{
                      const items=getTimelineItems();
                      if(!items.length&&!editMode)return null;
                      return (
                        <Reveal>
                          <BlockCard accentIcon="🗺" imgDeco={{src:i.dino1,side:'right',top:-18,size:68}}>
                            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:16}}>
                              <div style={{flex:1,height:1,background:`linear-gradient(to right,transparent,${hexToRgba(C.amber,.25)})`}}/>
                              <p style={{fontFamily:sans,fontSize:8,fontWeight:700,letterSpacing:'.42em',textTransform:'uppercase',color:hexToRgba(C.amber,.65),margin:0}}>Programul Zilei</p>
                              <div style={{flex:1,height:1,background:`linear-gradient(to left,transparent,${hexToRgba(C.amber,.25)})`}}/>
                            </div>
                            {!items.length&&editMode&&<p style={{fontFamily:serif,fontSize:12,fontStyle:'italic',color:hexToRgba(C.cream,.4),textAlign:'center',margin:'0 0 14px'}}>Adauga primul moment al zilei</p>}
                            <div style={{display:'flex',flexDirection:'column'}}>
                              {items.map((item:any,i:number)=>(
                                <div key={item.id} style={{display:'grid',gridTemplateColumns:'56px 20px 1fr auto',alignItems:'stretch',minHeight:44}}>
                                  <div style={{display:'flex',alignItems:'flex-start',justifyContent:'flex-end',paddingRight:8,paddingTop:4}}>
                                    <InlineEdit editMode={editMode} value={item.time||''} onChange={v=>updateTimelineItem(item.id,{time:v})} style={{fontFamily:display,fontSize:12,fontWeight:700,color:hexToRgba(C.amber,.9),textAlign:'right',lineHeight:1.2}}/>
                                  </div>
                                  <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                                    <div style={{width:10,height:10,borderRadius:'50%',background:C.amber,boxShadow:`0 0 6px ${hexToRgba(C.amber,.6)}`,flexShrink:0,marginTop:4}}/>
                                    {i<items.length-1&&<div style={{flex:1,width:'1.5px',background:`linear-gradient(to bottom,${hexToRgba(C.amber,.35)},transparent)`,marginTop:3,borderRadius:99}}/>}
                                  </div>
                                  <div style={{paddingLeft:10,paddingTop:2,paddingBottom:i<items.length-1?18:0}}>
                                    <InlineEdit editMode={editMode} value={item.title||''} onChange={v=>updateTimelineItem(item.id,{title:v})} placeholder="Moment..." style={{fontFamily:display,fontSize:13,fontWeight:600,color:hexToRgba(C.cream,.85),lineHeight:1.3}}/>
                                  </div>
                                  {editMode&&<button type="button" onClick={e=>{e.stopPropagation();removeTimelineItem(item.id);}} style={{background:'none',border:'none',cursor:'pointer',color:hexToRgba(C.amber,.4),fontSize:12,padding:'4px 2px',alignSelf:'flex-start',lineHeight:1}}>✕</button>}
                                </div>
                              ))}
                            </div>
                            {editMode&&<button type="button" onClick={e=>{e.stopPropagation();addTimelineItem(null);}} style={{marginTop:14,width:'100%',background:hexToRgba(C.amber,.08),border:`1px dashed ${hexToRgba(C.amber,.3)}`,borderRadius:10,padding:'8px 0',cursor:'pointer',fontFamily:sans,fontSize:9,fontWeight:700,letterSpacing:'.25em',textTransform:'uppercase',color:hexToRgba(C.amber,.65)}}>+ Adauga moment</button>}
                          </BlockCard>
                        </Reveal>
                      );
                    })()}

                    {/* ── music ── */}
                    {block.type==='music' && (
                      <Reveal>
                        <MusicBlock block={block} editMode={editMode} onUpdate={p=>updBlock(idx,p)} imperativeRef={musicPlayRef}/>
                      </Reveal>
                    )}

                    {/* ── gift ── */}
                    {block.type==='gift' && (
                      <Reveal>
                        <BlockCard accentIcon="🎁" imgDeco={{src:i.egg,side:'right',top:-18,size:68}}>
                          <div style={{textAlign:'center'}}>
                            <InlineEdit tag="h3" editMode={editMode} value={block.sectionTitle||'Sugestie de cadou'} onChange={v=>updBlock(idx,{sectionTitle:v})} style={{fontFamily:display,fontSize:18,color:C.cream,marginBottom:8,fontWeight:700}}/>
                            <InlineEdit tag="p" editMode={editMode} value={block.content||''} onChange={v=>updBlock(idx,{content:v})} multiline style={{fontFamily:serif,fontSize:12,color:hexToRgba(C.cream,.7),lineHeight:1.65}}/>
                            {(block.iban||editMode)&&(
                              <div style={{marginTop:12,padding:'8px 12px',background:'rgba(255,255,255,.05)',borderRadius:10,border:`1px solid ${hexToRgba(C.amber,.2)}`}}>
                                <InlineEdit tag="p" editMode={editMode} value={block.iban||''} onChange={v=>updBlock(idx,{iban:v})} placeholder="IBAN..." style={{fontFamily:sans,fontSize:10,fontWeight:700,color:C.amber}}/>
                              </div>
                            )}
                          </div>
                        </BlockCard>
                      </Reveal>
                    )}

                    {/* ── whatsapp ── */}
                    {block.type==='whatsapp' && (
                      <Reveal>
                        <div style={{textAlign:'center'}}>
                          <a href={`https://wa.me/${(block.content||'').replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" style={{display:'inline-flex',alignItems:'center',gap:12,padding:'12px 28px',borderRadius:18,background:`linear-gradient(160deg,${hexToRgba(C.midJungle,.9)},${hexToRgba(C.darkJungle,.95)})`,border:`1.5px solid ${hexToRgba(C.amber,.25)}`,textDecoration:'none',boxShadow:`0 6px 20px rgba(0,0,0,.45)`}}>
                            <div style={{width:40,height:40,borderRadius:12,background:'linear-gradient(135deg,#25D366,#128C7E)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 12px rgba(37,211,102,.35)'}}>
                              <MessageCircle style={{width:20,height:20,color:'white'}}/>
                            </div>
                            <div style={{textAlign:'left'}}>
                              <InlineEdit tag="p" editMode={editMode} value={block.label||'Contact WhatsApp'} onChange={v=>updBlock(idx,{label:v})} style={{fontFamily:display,fontWeight:700,fontSize:13,color:C.cream,margin:0}}/>
                              <p style={{fontFamily:sans,fontSize:10,color:hexToRgba(C.cream,.4),margin:0}}>Raspundem rapid</p>
                            </div>
                          </a>
                          {editMode&&(
                            <div style={{display:'flex',alignItems:'center',gap:8,background:hexToRgba(C.stone,.4),border:`1px solid ${hexToRgba(C.amber,.18)}`,borderRadius:12,padding:'8px 16px',marginTop:10,justifyContent:'center'}}>
                              <span style={{fontFamily:sans,fontSize:'.6rem',fontWeight:800,letterSpacing:'.1em',textTransform:'uppercase',color:hexToRgba(C.cream,.45)}}>Numar:</span>
                              <InlineEdit tag="span" editMode={editMode} value={block.content||'0700000000'} onChange={v=>updBlock(idx,{content:v})} style={{fontFamily:sans,fontSize:'.9rem',color:C.cream,fontWeight:700}}/>
                            </div>
                          )}
                        </div>
                      </Reveal>
                    )}

                    {/* ── family ── */}
                    {block.type==='family' && (()=>{
                      const members:{name1:string;name2:string}[]=safeJSON(block.members,[]);
                      const updateMembers=(nm:{name1:string;name2:string}[])=>updBlock(idx,{members:JSON.stringify(nm)} as any);
                      const dIcon=dinoIcons[idx%dinoIcons.length];
                      return (
                        <Reveal>
                          <BlockCard accentIcon={dIcon}>
                            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:10}}>
                              <div style={{flex:1,height:1,background:`linear-gradient(to right,transparent,${hexToRgba(C.amber,.28)})`}}/>
                              <InlineEdit editMode={editMode} value={block.label||'Parintii'} onChange={v=>updBlock(idx,{label:v})} style={{fontFamily:sans,fontSize:8,fontWeight:700,letterSpacing:'.42em',textTransform:'uppercase',color:hexToRgba(C.amber,.75),margin:0}}/>
                              <div style={{flex:1,height:1,background:`linear-gradient(to left,transparent,${hexToRgba(C.amber,.28)})`}}/>
                            </div>
                            <InlineEdit editMode={editMode} value={block.content||'Cu drag si recunostinta'} onChange={v=>updBlock(idx,{content:v})} style={{fontFamily:serif,fontSize:12,fontStyle:'italic',color:hexToRgba(C.cream,.45),margin:'0 0 16px',display:'block',textAlign:'center'}}/>
                            <div style={{display:'flex',flexDirection:'column',gap:8}}>
                              {members.map((m,mi)=>(
                                <div key={mi}>
                                  <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,flexWrap:'wrap',background:hexToRgba(C.amber,.06),border:`1px solid ${hexToRgba(C.amber,.14)}`,borderRadius:12,padding:'10px 14px'}}>
                                    <InlineEdit tag="span" editMode={editMode} value={m.name1} onChange={v=>{const nm=[...members];nm[mi]={...nm[mi],name1:v};updateMembers(nm);}} style={{fontFamily:display,fontSize:17,fontWeight:700,color:C.cream,letterSpacing:.5}}/>
                                    <span style={{fontSize:14,filter:`drop-shadow(0 0 4px ${hexToRgba(C.amber,.5)})`}}>{dIcon}</span>
                                    <InlineEdit tag="span" editMode={editMode} value={m.name2} onChange={v=>{const nm=[...members];nm[mi]={...nm[mi],name2:v};updateMembers(nm);}} style={{fontFamily:display,fontSize:17,fontWeight:700,color:C.cream,letterSpacing:.5}}/>
                                    {editMode&&members.length>1&&<button type="button" onClick={()=>updateMembers(members.filter((_,i)=>i!==mi))} style={{background:'none',border:'none',cursor:'pointer',color:hexToRgba(C.amber,.4),fontSize:13,padding:'0 2px',lineHeight:1}}>✕</button>}
                                  </div>
                                  {mi<members.length-1&&<div style={{height:1,margin:'2px 28px 0',background:`linear-gradient(to right,transparent,${hexToRgba(C.amber,.15)},transparent)`}}/>}
                                </div>
                              ))}
                            </div>
                            {editMode&&(
                              <button type="button" onClick={()=>updateMembers([...members,{name1:'Nume 1',name2:'Nume 2'}])} style={{marginTop:14,background:hexToRgba(C.amber,.1),border:`1px dashed ${hexToRgba(C.amber,.32)}`,borderRadius:99,padding:'5px 18px',cursor:'pointer',fontFamily:sans,fontSize:9,fontWeight:700,letterSpacing:'.25em',textTransform:'uppercase',color:hexToRgba(C.amber,.7),display:'block',margin:'14px auto 0'}}>
                                + Adauga
                              </button>
                            )}
                          </BlockCard>
                        </Reveal>
                      );
                    })()}

                    {/* ── date ── */}
                    {block.type==='date' && (
                      <Reveal>
                        <div style={{textAlign:'center',padding:'4px 0'}}>
                          <p style={{fontFamily:sans,fontWeight:700,letterSpacing:'.3em',fontSize:'.85rem',color:C.amber,margin:0,textShadow:`0 0 8px ${hexToRgba(C.amber,.4)}`}}>
                            {p.weddingDate ? new Date(p.weddingDate).toLocaleDateString('ro-RO',{day:'numeric',month:'long',year:'numeric'}) : 'Data Evenimentului'}
                          </p>
                        </div>
                      </Reveal>
                    )}

                    {/* ── description ── */}
                    {block.type==='description' && (
                      <Reveal>
                        <div style={{textAlign:'center',padding:'0 16px'}}>
                          <InlineEdit tag="p" editMode={editMode} value={block.content||''} onChange={v=>updBlock(idx,{content:v})} style={{fontFamily:serif,fontSize:'.9rem',fontStyle:'italic',color:hexToRgba(C.cream,.5),lineHeight:1.7,margin:0}}/>
                        </div>
                      </Reveal>
                    )}

                  </BlockStyleProvider>
                </div>

                {editMode && (
                  <InsertBlockButton insertIdx={idx} openInsertAt={openInsertAt} setOpenInsertAt={setOpenInsertAt} BLOCK_TYPES={BLOCK_TYPES} onInsert={(t,d)=>handleInsertAt(idx,t,d)}/>
                )}
              </div>
            ))}
          </div>

          {/* Reset button */}
          {editMode && (
            <div style={{marginTop:24,textAlign:'center'}}>
              <button onClick={resetToDefaults} style={{padding:'10px 24px',background:'transparent',border:`2px solid ${hexToRgba(C.amber,.3)}`,borderRadius:99,fontFamily:sans,fontSize:10,fontWeight:700,letterSpacing:'.2em',textTransform:'uppercase',color:hexToRgba(C.amber,.5),cursor:'pointer',display:'inline-flex',alignItems:'center',gap:8}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                Reseteaza la valorile implicite
              </button>
            </div>
          )}

          {/* Footer */}
          <div style={{marginTop:32,textAlign:'center',paddingBottom:'max(96px, calc(env(safe-area-inset-bottom) + 64px))'}}>
            <JungleDivider i={i} />
            <div style={{display:'flex',justifyContent:'center',alignItems:'flex-end',gap:16,margin:'16px 0 10px'}}>
              <div style={{animation:'jr-float 3.5s ease-in-out infinite'}}>
                <img src={IMG_RAPTOR1} alt="" style={{height:46,objectFit:'contain',filter:'drop-shadow(0 4px 8px rgba(0,0,0,.5))',opacity:.6}}/>
              </div>
              <img src={IMG_LOGO} alt="" style={{width:78,objectFit:'contain',filter:`drop-shadow(0 2px 8px ${hexToRgba(C.amber,.32)})`,opacity:.55}}/>
              <div style={{animation:'jr-floatR 4s ease-in-out infinite'}}>
                <img src={IMG_RAPTOR2} alt="" style={{height:46,objectFit:'contain',filter:'drop-shadow(0 4px 8px rgba(0,0,0,.5))',opacity:.6,transform:'scaleX(-1)'}}/>
              </div>
            </div>
            <p style={{fontFamily:serif,fontSize:11,fontStyle:'italic',color:hexToRgba(C.cream,.2),marginTop:8}}>cu drag · WeddingPro 🦕</p>
          </div>

        </div>
      </div>
    </>
  );
};

export default LittleMermaidTemplate;
