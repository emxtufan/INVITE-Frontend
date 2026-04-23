
import React, { useState, useEffect, useRef, useCallback } from "react";
import { BlockStyleProvider } from "../BlockStyleContext";
import { InvitationTemplateProps, TemplateMeta } from "../invitations/types";
import { InvitationBlock, InvitationBlockType } from "../../types";
import { InlineEdit, InlineTime, InlineWaze } from "../invitations/InlineEdit";
import { API_URL } from "../../config/api";
import {
  ChevronUp, ChevronDown, Eye, EyeOff, Trash2, Upload, Camera,
  Play, Pause, SkipForward, SkipBack, Music, MapPin, Briefcase,
} from "lucide-react";

// 
// META
// 
export const meta: TemplateMeta = {
  id: 'office-simple',
  name: 'Office Meeting',
  category: 'all',
  description: 'Invitatie profesionala pentru intalniri de lucru, conferinte si evenimente corporate.',
  colors: ['#0e1825', '#c87820', '#1a2535', '#f0e8d0'],
  previewClass: "bg-slate-900 border-amber-600",
  elementsClass: "bg-amber-600",
};

// 
// API
// 
function deleteUploadedFile(url: string | undefined) {
  if (!url || !url.startsWith('/uploads/')) return;
  const _s = JSON.parse(localStorage.getItem('weddingPro_session') || '{}');
  fetch(`${API_URL}/upload`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${_s?.token || ''}` },
    body: JSON.stringify({ url }),
  }).catch(() => {});
}

// 
// HELPERS
// 
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// 
// COLORS  applied per render from colorTheme
// 
type OfficeColorSet = { dark:string; mid:string; stone:string; amber:string; amberL:string; cream:string; muted:string; steel:string; text:string };

export function getOfficeTheme(id?: string): OfficeColorSet {
  switch (id) {
    case 'office-dark-steel':
      return { dark:'#0e1a2a', mid:'#162235', stone:'#243048', amber:'#6a98c0', amberL:'#8ab8e0', cream:'#e8f0f8', muted:'rgba(150,180,210,0.6)', steel:'#4a6888', text:'#d0e0f0' };
    case 'office-dark-emerald':
      return { dark:'#0a180e', mid:'#122018', stone:'#1e3025', amber:'#4a9060', amberL:'#6ab880', cream:'#d8f0e0', muted:'rgba(120,180,140,0.6)', steel:'#3a7050', text:'#c8e8d0' };
    case 'office-slate-gold':
      return { dark:'#181a22', mid:'#22253a', stone:'#2c2f48', amber:'#d4a830', amberL:'#f0c840', cream:'#f8f0d8', muted:'rgba(210,168,48,0.6)', steel:'#5060a0', text:'#e8dfc0' };
    case 'office-bw':
      return { dark:'#080808', mid:'#111111', stone:'#1e1e1e', amber:'#d8d8d8', amberL:'#ffffff', cream:'#f4f4f4', muted:'rgba(200,200,200,0.6)', steel:'#666666', text:'#cccccc' };
    case 'office-charcoal':
      return { dark:'#1a1a1a', mid:'#242424', stone:'#303030', amber:'#aaaaaa', amberL:'#cccccc', cream:'#f0f0f0', muted:'rgba(180,180,180,0.6)', steel:'#606060', text:'#d8d8d8' };
    case 'office-light-gray':
      return { dark:'#f2f2f4', mid:'#e8e8ec', stone:'#d8d8de', amber:'#2c2c2c', amberL:'#444444', cream:'#0a0a0a', muted:'rgba(60,60,60,0.6)', steel:'#666666', text:'#1a1a1a' };
    case 'office-light-navy':
      return { dark:'#f0f4f8', mid:'#e2eaf2', stone:'#ccd8e8', amber:'#1a3a5c', amberL:'#2a5a8c', cream:'#0a1828', muted:'rgba(26,58,92,0.6)', steel:'#3a6888', text:'#0e2038' };
    case 'office-light-warm':
      return { dark:'#f8f4ee', mid:'#f0ebe2', stone:'#e4ddd0', amber:'#8b5e3c', amberL:'#a87050', cream:'#1a0e06', muted:'rgba(100,60,30,0.6)', steel:'#7a6050', text:'#2a1808' };
    case 'office-charcoal-red':
      return { dark:'#1a1010', mid:'#251515', stone:'#322020', amber:'#c04040', amberL:'#e05050', cream:'#f8e8e8', muted:'rgba(200,80,80,0.6)', steel:'#884040', text:'#f0d8d8' };
    default: // office-dark-amber
      return { dark:'#0e1825', mid:'#192436', stone:'#283548', amber:'#c87820', amberL:'#e09830', cream:'#f0e8d0', muted:'rgba(200,175,130,0.6)', steel:'#4a6888', text:'#ddd5b8' };
  }
}

let C: OfficeColorSet = getOfficeTheme();

// 
// FONTS
// 
const display = "'Cinzel','Georgia',serif";
const serif   = "'Lora','Georgia',serif";
const sans    = "'Oswald','system-ui',sans-serif";

// 
// CSS GLOBAL
// 
const OFF_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Lora:ital,wght@0,400;0,600;1,400&family=Oswald:wght@400;500;600;700&display=swap');
  @keyframes off-float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  @keyframes off-pulse  { 0%,100%{opacity:.7;transform:scale(1)} 50%{opacity:1;transform:scale(1.03)} }
  @keyframes off-shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  @keyframes off-bar    { 0%,100%{transform:scaleY(.3)} 50%{transform:scaleY(1)} }
  @keyframes off-spin   { to{transform:rotate(360deg)} }
  @keyframes off-grid   { 0%{opacity:.04} 100%{opacity:.08} }
`;

// 
// SCROLL REVEAL
// 
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
      transform: vis ? 'translateY(0)' : 'translateY(18px)',
      transition: `opacity .55s ${delay}s cubic-bezier(.22,1,.36,1), transform .55s ${delay}s cubic-bezier(.22,1,.36,1)`,
      ...style,
    }}>{children}</div>
  );
};

// 
// DIVIDER  clean corporate line
// 
const OfficeDivider: React.FC = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${hexToRgba(C.amber, .4)})`, borderRadius: 99 }}/>
    <Briefcase style={{ width: 14, height: 14, color: hexToRgba(C.amber, .55) }}/>
    <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${hexToRgba(C.amber, .4)})`, borderRadius: 99 }}/>
  </div>
);

// 
// ACCENT STRIP  top bar on cards
// 
const AccentStrip: React.FC<{ icon?: string }> = ({ icon }) => (
  <div style={{
    height: 3,
    background: `linear-gradient(to right, ${hexToRgba(C.amber, .15)}, ${C.amber}, ${hexToRgba(C.amber, .15)})`,
    position: 'relative',
  }}>
    {icon && (
      <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', fontSize: 10, lineHeight: 1, zIndex: 2 }}>{icon}</span>
    )}
  </div>
);

// 
// BLOCK CARD  dark card wrapper
// 
const BlockCard: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; accentIcon?: string }> = ({ children, style, accentIcon }) => (
  <div style={{
    background: `linear-gradient(160deg,${hexToRgba(C.mid, .94)} 0%,${hexToRgba(C.dark, .97)} 100%)`,
    borderRadius: 20,
    border: `1px solid ${hexToRgba(C.amber, .2)}`,
    boxShadow: `0 4px 20px rgba(0,0,0,.4), inset 0 1px 0 ${hexToRgba(C.amber, .07)}`,
    position: 'relative',
    ...style,
  }}>
    <AccentStrip icon={accentIcon}/>
    {/* Subtle dot texture */}
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 20, backgroundImage: `radial-gradient(circle at 2px 2px,${hexToRgba(C.steel, .04)} 1px,transparent 0)`, backgroundSize: '20px 20px' }}/>
    <div style={{ position: 'relative', padding: '20px 24px 22px' }}>
      {children}
    </div>
  </div>
);

// 
// COUNTDOWN
// 
interface TimeLeft { days: number; hours: number; minutes: number; seconds: number; total: number }
function calcTimeLeft(date: string): TimeLeft {
  const diff = new Date(date).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  return { days: Math.floor(diff / 86400000), hours: Math.floor((diff / 3600000) % 24), minutes: Math.floor((diff / 60000) % 60), seconds: Math.floor((diff / 1000) % 60), total: diff };
}

const DigiCell: React.FC<{ value: number; label: string }> = ({ value, label }) => {
  const prev = useRef(value);
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    if (prev.current !== value) { setFlash(true); setTimeout(() => setFlash(false), 280); prev.current = value; }
  }, [value]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 56, height: 64, background: `linear-gradient(160deg,${hexToRgba(C.stone, .95)},${hexToRgba(C.dark, .98)})`, border: `1.5px solid ${hexToRgba(C.amber, .3)}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px rgba(0,0,0,.45),inset 0 1px 0 ${hexToRgba(C.amber, .1)}`, transform: flash ? 'scale(1.08)' : 'scale(1)', transition: 'transform .14s' }}>
        <span style={{ fontFamily: display, fontSize: 24, fontWeight: 700, color: C.cream, textShadow: `0 0 10px ${hexToRgba(C.amber, .45)}` }}>{String(value).padStart(2, '0')}</span>
      </div>
      <span style={{ fontFamily: sans, fontSize: 8, letterSpacing: '.3em', textTransform: 'uppercase', color: hexToRgba(C.amber, .6), fontWeight: 700 }}>{label}</span>
    </div>
  );
};

const OfficeCountdown: React.FC<{ targetDate: string | undefined }> = ({ targetDate }) => {
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
  if (tl?.total === 0) return <p style={{ fontFamily: display, fontSize: 13, fontWeight: 700, color: C.amber, textAlign: 'center', margin: 0 }}>Intalnirea a inceput!</p>;
  const vals = [tl?.days ?? 0, tl?.hours ?? 0, tl?.minutes ?? 0, tl?.seconds ?? 0];
  const labs = ['Zile', 'Ore', 'Min', 'Sec'];
  const sep = <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'center', paddingBottom: 20, flexShrink: 0 }}><div style={{ width: 4, height: 4, borderRadius: '50%', background: hexToRgba(C.amber, .5) }}/><div style={{ width: 4, height: 4, borderRadius: '50%', background: hexToRgba(C.amber, .5) }}/></div>;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 6 }}>
      {vals.map((v, i) => (
        <React.Fragment key={i}><DigiCell value={v} label={labs[i]}/>{i < 3 && sep}</React.Fragment>
      ))}
    </div>
  );
};

// 
// CALENDAR
// 
const CalendarMonth: React.FC<{ date: string | undefined }> = ({ date }) => {
  if (!date) return null;
  const d = new Date(date), year = d.getFullYear(), month = d.getMonth(), day = d.getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNames = ['IANUARIE','FEBRUARIE','MARTIE','APRILIE','MAI','IUNIE','IULIE','AUGUST','SEPTEMBRIE','OCTOMBRIE','NOIEMBRIE','DECEMBRIE'];
  const dayLabs = ['L','M','M','J','V','S','D'];
  const start = (firstDay + 6) % 7;
  const cells: (number | null)[] = [...Array(start).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontFamily: display, fontSize: 10, fontWeight: 600, letterSpacing: '.25em', color: hexToRgba(C.amber, .9), marginBottom: 14 }}>{monthNames[month]} {year}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 5, marginBottom: 5 }}>
        {dayLabs.map((l, i) => <div key={`${l}-${i}`} style={{ fontSize: 9, fontWeight: 700, color: hexToRgba(C.cream, .3), fontFamily: sans }}>{l}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 5 }}>
        {cells.map((cell, i) => {
          const isDay = cell === day;
          return <div key={i} style={{ height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: isDay ? 700 : 500, fontFamily: isDay ? display : sans, color: isDay ? C.dark : cell ? hexToRgba(C.cream, .7) : 'transparent', background: isDay ? C.amber : 'transparent', borderRadius: '50%' }}>{cell || ''}</div>;
        })}
      </div>
    </div>
  );
};

// 
// LOCATION CARD
// 
const LocCard: React.FC<{ block: InvitationBlock; editMode: boolean; onUpdate: (p: Partial<InvitationBlock>) => void }> = ({ block, editMode, onUpdate }) => (
  <BlockCard accentIcon="">
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(145deg,${hexToRgba(C.amber, .2)},${hexToRgba(C.amber, .08)})`, border: `1.5px solid ${hexToRgba(C.amber, .3)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <MapPin style={{ width: 16, height: 16, color: C.amber }}/>
      </div>
      <div>
        <InlineEdit editMode={editMode} value={block.label || 'Locatie'} onChange={v => onUpdate({ label: v })}
          style={{ fontFamily: sans, fontSize: 8, fontWeight: 700, letterSpacing: '.42em', textTransform: 'uppercase', color: hexToRgba(C.amber, .8), margin: 0, display: 'block' }}/>
        {block.time && (
          <InlineTime editMode={editMode} value={block.time} onChange={v => onUpdate({ time: v })}
            style={{ fontFamily: display, fontSize: 13, fontWeight: 700, color: C.cream, margin: '2px 0 0', display: 'block' }}/>
        )}
      </div>
    </div>
    <OfficeDivider/>
    <div style={{ marginTop: 14 }}>
      <InlineEdit editMode={editMode} value={block.locationName || ''} onChange={v => onUpdate({ locationName: v })}
        style={{ fontFamily: display, fontSize: 16, fontWeight: 600, color: C.cream, margin: '0 0 4px', display: 'block' }}/>
      <InlineEdit editMode={editMode} value={block.locationAddress || ''} onChange={v => onUpdate({ locationAddress: v })}
        style={{ fontFamily: serif, fontSize: 12, fontStyle: 'italic', color: hexToRgba(C.text, .6), margin: '0 0 12px', display: 'block' }}/>
      {(block.wazeLink || editMode) && (
        <InlineWaze editMode={editMode} value={block.wazeLink || ''} onChange={v => onUpdate({ wazeLink: v })}/>
      )}
    </div>
  </BlockCard>
);

// 
// PHOTO BLOCK
// 
const PhotoBlock: React.FC<{ block: InvitationBlock; editMode: boolean; onUpdate: (p: Partial<InvitationBlock>) => void; placeholderInitial?: string }> = ({ block, editMode, onUpdate, placeholderInitial = 'O' }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { imageData, aspectRatio = 'free' } = block;
  const pt: Record<string, string> = { '1:1': '100%', '4:3': '75%', '3:4': '133%', '16:9': '56.25%', 'free': '60%' };
  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setUploading(true); deleteUploadedFile(imageData);
    try {
      const form = new FormData(); form.append('file', file);
      const _s = JSON.parse(localStorage.getItem('weddingPro_session') || '{}');
      const res = await fetch(`${API_URL}/upload`, { method: 'POST', headers: { Authorization: `Bearer ${_s?.token || ''}` }, body: form });
      const { url } = await res.json(); onUpdate({ imageData: url });
    } catch {} finally { setUploading(false); }
  };
  if (imageData) return (
    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: `1px solid ${hexToRgba(C.amber, .15)}` }}>
      <div style={{ position: 'relative', paddingTop: pt[aspectRatio] }}>
        <img src={imageData} alt={block.altText || ''} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}/>
        {editMode && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', opacity: 0, transition: 'opacity .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.opacity = '1'}
            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.opacity = '0'}>
            <div style={{ background: 'rgba(0,0,0,.55)', position: 'absolute', inset: 0 }}/>
            <button onClick={() => fileRef.current?.click()} style={{ position: 'relative', zIndex: 1, padding: 8, background: 'white', borderRadius: '50%', border: 'none', cursor: 'pointer' }}><Camera style={{ width: 20, height: 20, color: C.amber }}/></button>
            <button onClick={() => { deleteUploadedFile(imageData); onUpdate({ imageData: undefined }); }} style={{ position: 'relative', zIndex: 1, padding: 8, background: 'white', borderRadius: '50%', border: 'none', cursor: 'pointer' }}><Trash2 style={{ width: 20, height: 20, color: '#dc2626' }}/></button>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} style={{ display: 'none' }}/>
    </div>
  );
  return (
    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: `1px solid ${hexToRgba(C.amber, .15)}`, paddingTop: pt[aspectRatio], background: `linear-gradient(135deg,${C.mid},${C.stone})`, cursor: editMode ? 'pointer' : 'default' }}
      onClick={editMode ? () => fileRef.current?.click() : undefined}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {uploading
          ? <div style={{ width: 32, height: 32, border: '4px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'off-spin 1s linear infinite' }}/>
          : <div style={{ textAlign: 'center' }}>
              <span style={{ fontFamily: display, fontSize: 52, color: hexToRgba(C.amber, .35) }}>{(placeholderInitial || 'O')[0].toUpperCase()}</span>
              {editMode && <p style={{ fontFamily: sans, fontSize: 11, color: hexToRgba(C.cream, .3), margin: '4px 0 0' }}>Adauga fotografie</p>}
            </div>
        }
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} style={{ display: 'none' }}/>
    </div>
  );
};

// 
// MUSIC BLOCK
// 
const MusicBlock: React.FC<{
  block: InvitationBlock; editMode: boolean;
  onUpdate: (p: Partial<InvitationBlock>) => void;
  imperativeRef?: React.MutableRefObject<{ play: () => void; pause: () => void; unlock: () => void } | null>;
}> = ({ block, editMode, onUpdate, imperativeRef }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const mp3Ref = useRef<HTMLInputElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showYt, setShowYt] = useState(false);
  const [ytUrl, setYtUrl] = useState('');
  const [ytDownloading, setYtDownloading] = useState(false);
  const [ytError, setYtError] = useState('');

  useEffect(() => {
    const a = audioRef.current; if (!a) return;
    const onTime = () => setProgress(a.currentTime);
    const onDur = () => setDuration(a.duration);
    const onEnd = () => { setPlaying(false); setProgress(0); };
    a.addEventListener('timeupdate', onTime); a.addEventListener('loadedmetadata', onDur);
    a.addEventListener('ended', onEnd); a.addEventListener('play', () => setPlaying(true)); a.addEventListener('pause', () => setPlaying(false));
    return () => { a.removeEventListener('timeupdate', onTime); a.removeEventListener('loadedmetadata', onDur); a.removeEventListener('ended', onEnd); };
  }, [block.musicUrl]);

  useEffect(() => {
    if (!imperativeRef) return;
    imperativeRef.current = {
      unlock: () => { if (block.musicType === 'mp3' && audioRef.current && block.musicUrl) { audioRef.current.play().then(() => { audioRef.current!.pause(); audioRef.current!.currentTime = 0; }).catch(() => {}); } },
      play: () => { if (audioRef.current && block.musicUrl) audioRef.current.play().catch(() => {}); },
      pause: () => { if (audioRef.current) audioRef.current.pause(); },
    };
  });

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const pct = duration ? `${(progress / duration) * 100}%` : '0%';
  const toggle = () => { const a = audioRef.current; if (!a) return; if (playing) { a.pause(); } else { a.play().catch(() => {}); } };
  const seek = (e: React.MouseEvent<HTMLDivElement>) => { if (!audioRef.current || !duration) return; const r = e.currentTarget.getBoundingClientRect(); audioRef.current.currentTime = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * duration; };
  const handleMp3 = async (file: File) => {
    const _s = JSON.parse(localStorage.getItem('weddingPro_session') || '{}');
    try { const form = new FormData(); form.append('file', file); const res = await fetch(`${API_URL}/upload`, { method: 'POST', headers: { Authorization: `Bearer ${_s?.token || ''}` }, body: form }); if (!res.ok) throw new Error(); const { url } = await res.json(); onUpdate({ musicUrl: url, musicType: 'mp3' }); } catch {}
  };
  const submitYt = async () => {
    const t = ytUrl.trim(); if (!t) return;
    const _s = JSON.parse(localStorage.getItem('weddingPro_session') || '{}');
    setYtDownloading(true); setYtError('');
    try { const res = await fetch(`${API_URL}/download-yt-audio`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${_s?.token || ''}` }, body: JSON.stringify({ url: t }) }); const data = await res.json(); if (!res.ok) throw new Error(data.error || 'Eroare'); onUpdate({ musicUrl: data.url, musicType: 'mp3', musicTitle: data.title || '', musicArtist: data.author || '' }); setShowYt(false); setYtUrl(''); }
    catch (e: any) { setYtError(e.message || 'Nu s-a putut descarca.'); } finally { setYtDownloading(false); }
  };
  const isActive = !!block.musicUrl;

  return (
    <div style={{ background: hexToRgba(C.dark, .9), border: `1.5px solid ${playing ? C.amber : hexToRgba(C.amber, .2)}`, borderRadius: 16, padding: '20px 24px', transition: 'border-color .4s,box-shadow .4s', boxShadow: playing ? `0 0 0 3px ${hexToRgba(C.amber, .15)}` : 'none' }}>
      {block.musicType === 'mp3' && block.musicUrl && <audio ref={audioRef} src={block.musicUrl} preload="metadata"/>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: playing ? C.amber : hexToRgba(C.amber, .1), border: `1.5px solid ${playing ? C.amber : hexToRgba(C.amber, .3)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .3s' }}>
          <Music style={{ width: 14, height: 14, color: playing ? C.dark : C.amber }}/>
        </div>
        <span style={{ fontFamily: sans, fontSize: 10, fontWeight: 700, letterSpacing: '.3em', textTransform: 'uppercase', color: playing ? C.amber : hexToRgba(C.cream, .4) }}>
          {playing ? 'Se reda acum' : 'Muzica Evenimentului'}
        </span>
        {playing && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 14, marginLeft: 'auto' }}>
            {[0, .2, .1, .3].map((d, i) => <div key={i} style={{ width: 3, height: 14, background: C.amber, borderRadius: 2, transformOrigin: 'bottom', animation: `off-bar .7s ease-in-out ${d}s infinite` }}/>)}
          </div>
        )}
      </div>
      {!isActive && editMode && (
        !showYt ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={() => mp3Ref.current?.click()} style={{ flex: 1, background: hexToRgba(C.stone, .4), border: `1px dashed ${hexToRgba(C.amber, .3)}`, borderRadius: 10, padding: '14px 0', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <Upload style={{ width: 20, height: 20, color: C.amber, opacity: .7 }}/><span style={{ fontFamily: sans, fontSize: 9, color: hexToRgba(C.cream, .4), fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase' }}>MP3</span>
            </button>
            <button type="button" onClick={() => setShowYt(true)} style={{ flex: 1, background: hexToRgba(C.stone, .4), border: `1px dashed ${hexToRgba(C.amber, .3)}`, borderRadius: 10, padding: '14px 0', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" fill="red" opacity=".8"/><polygon points="9.75,15.02 15.5,12 9.75,8.98 9.75,15.02" fill="white"/></svg>
              <span style={{ fontFamily: sans, fontSize: 9, color: hexToRgba(C.cream, .4), fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase' }}>YouTube</span>
            </button>
            <input ref={mp3Ref} type="file" accept="audio/*,.mp3" onChange={e => { const f = e.target.files?.[0]; if (f) handleMp3(f); }} style={{ display: 'none' }}/>
          </div>
        ) : (
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: ytError ? 6 : 0 }}>
              <input value={ytUrl} onChange={e => { setYtUrl(e.target.value); setYtError(''); }} onKeyDown={e => e.key === 'Enter' && !ytDownloading && submitYt()} placeholder="https://youtu.be/..." autoFocus disabled={ytDownloading}
                style={{ flex: 1, background: hexToRgba(C.stone, .5), border: `1px solid ${ytError ? '#ef4444' : hexToRgba(C.amber, .3)}`, borderRadius: 8, padding: '9px 12px', fontFamily: sans, fontSize: 11, color: C.cream, outline: 'none' }}/>
              <button type="button" onClick={submitYt} disabled={ytDownloading} style={{ background: C.amber, border: 'none', borderRadius: 8, padding: '0 14px', cursor: ytDownloading ? 'not-allowed' : 'pointer', color: C.dark, fontWeight: 700 }}>
                {ytDownloading ? <div style={{ width: 14, height: 14, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'off-spin .7s linear infinite' }}/> : ''}
              </button>
              <button type="button" onClick={() => { setShowYt(false); setYtUrl(''); setYtError(''); }} style={{ background: hexToRgba(C.stone, .4), border: 'none', borderRadius: 8, padding: '0 10px', cursor: 'pointer', color: C.cream }}></button>
            </div>
            {ytDownloading && <p style={{ fontFamily: sans, fontSize: 9, color: C.amber, margin: 0, textAlign: 'center' }}> Se descarca...</p>}
            {ytError && <p style={{ fontFamily: sans, fontSize: 9, color: '#ef4444', margin: 0 }}> {ytError}</p>}
          </div>
        )
      )}
      {!isActive && !editMode && (
        <div style={{ textAlign: 'center', padding: '16px 0', opacity: .4 }}>
          <Music style={{ width: 32, height: 32, color: C.amber, display: 'block', margin: '0 auto 6px' }}/>
          <p style={{ fontFamily: serif, fontSize: 12, fontStyle: 'italic', color: hexToRgba(C.cream, .6), margin: 0 }}>Melodia va aparea aici</p>
        </div>
      )}
      {isActive && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 10, background: hexToRgba(C.stone, .6), border: `1.5px solid ${hexToRgba(C.amber, .25)}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Music style={{ width: 20, height: 20, color: C.amber, opacity: .7 }}/>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <InlineEdit tag="p" editMode={editMode} value={block.musicTitle || ''} onChange={v => onUpdate({ musicTitle: v })} placeholder="Titlul melodiei..." style={{ fontFamily: serif, fontSize: 14, fontStyle: 'italic', color: C.cream, margin: 0, lineHeight: 1.3 }}/>
              <InlineEdit tag="p" editMode={editMode} value={block.musicArtist || ''} onChange={v => onUpdate({ musicArtist: v })} placeholder="Artist..." style={{ fontFamily: sans, fontSize: 10, color: hexToRgba(C.cream, .45), margin: '2px 0 0' }}/>
            </div>
          </div>
          <div onClick={seek} style={{ height: 4, background: hexToRgba(C.amber, .15), borderRadius: 99, marginBottom: 6, cursor: 'pointer', position: 'relative' }}>
            <div style={{ height: '100%', borderRadius: 99, background: C.amber, width: pct, transition: 'width .3s linear' }}/>
            <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: pct, marginLeft: -5, width: 10, height: 10, borderRadius: '50%', background: C.amber, transition: 'left .3s linear' }}/>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontFamily: sans, fontSize: 9, color: hexToRgba(C.cream, .35) }}>{fmt(progress)}</span>
            <span style={{ fontFamily: sans, fontSize: 9, color: hexToRgba(C.cream, .35) }}>{duration ? fmt(duration) : '--:--'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
            <button type="button" onClick={() => { const a = audioRef.current; if (a) a.currentTime = Math.max(0, a.currentTime - 10); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, opacity: .5 }}><SkipBack style={{ width: 16, height: 16, color: C.amber }}/></button>
            <button type="button" onClick={toggle} style={{ width: 44, height: 44, borderRadius: '50%', background: C.amber, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 16px ${hexToRgba(C.amber, .45)}` }}>
              {playing ? <Pause style={{ width: 16, height: 16, color: C.dark }}/> : <Play style={{ width: 16, height: 16, color: C.dark, marginLeft: 2 }}/>}
            </button>
            <button type="button" onClick={() => { const a = audioRef.current; if (a) a.currentTime = Math.min(duration, a.currentTime + 10); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, opacity: .5 }}><SkipForward style={{ width: 16, height: 16, color: C.amber }}/></button>
          </div>
          {editMode && <div style={{ marginTop: 12, textAlign: 'center' }}><button type="button" onClick={() => onUpdate({ musicUrl: '', musicType: 'none' as any })} style={{ background: hexToRgba(C.stone, .4), border: `1px solid ${hexToRgba(C.amber, .2)}`, borderRadius: 99, padding: '4px 14px', cursor: 'pointer', fontFamily: sans, fontSize: 9, color: hexToRgba(C.cream, .45), fontWeight: 700 }}>Schimba sursa</button></div>}
        </div>
      )}
    </div>
  );
};

// 
// BLOCK TOOLBAR
// 
const BlockToolbar = ({ onUp, onDown, onToggle, onDelete, visible, isFirst, isLast }: any) => {
  const btn: React.CSSProperties = { background: 'none', border: 'none', padding: 5, borderRadius: 99, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 };
  const stop = (e: React.MouseEvent) => e.stopPropagation();
  return (
    <div onClick={stop} style={{ position: 'absolute', top: -18, right: 6, zIndex: 9999, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 99, border: `1.5px solid ${hexToRgba(C.amber, .35)}`, backgroundColor: hexToRgba(C.dark, .95), backdropFilter: 'blur(8px)', padding: '3px 5px', pointerEvents: 'auto', boxShadow: '0 4px 16px rgba(0,0,0,.55)' }}>
      <button type="button" onClick={e => { stop(e); onUp(); }} disabled={isFirst} style={{ ...btn, opacity: isFirst ? .2 : 1 }}><ChevronUp style={{ width: 13, height: 13, color: hexToRgba(C.amber, .9) }}/></button>
      <button type="button" onClick={e => { stop(e); onDown(); }} disabled={isLast} style={{ ...btn, opacity: isLast ? .2 : 1 }}><ChevronDown style={{ width: 13, height: 13, color: hexToRgba(C.amber, .9) }}/></button>
      <div style={{ width: 1, height: 12, backgroundColor: hexToRgba(C.amber, .3), margin: '0 1px' }}/>
      <button type="button" onClick={e => { stop(e); onToggle(); }} style={btn}>
        {visible ? <Eye style={{ width: 13, height: 13, color: hexToRgba(C.amber, .9) }}/> : <EyeOff style={{ width: 13, height: 13, color: hexToRgba(C.amber, .4) }}/>}
      </button>
      <button type="button" onClick={e => { stop(e); onDelete(); }} style={btn}><Trash2 style={{ width: 13, height: 13, color: 'rgba(252,165,165,.9)' }}/></button>
    </div>
  );
};

// 
// INSERT BLOCK BUTTON  identical style to other templates (opens upward)
// 
const BLOCK_ICONS: Record<string, string> = {
  photo:'', text:'', location:'', calendar:'', countdown:'',
  timeline:'', music:'', gift:'', whatsapp:'', rsvp:'', divider:'',
  family:'', date:'', description:'',
};

const InsertBlockButton: React.FC<{
  insertIdx: number; openInsertAt: number | null;
  setOpenInsertAt: (v: number | null) => void;
  BLOCK_TYPES: any[]; onInsert: (type: string, def: any) => void;
}> = ({ insertIdx, openInsertAt, setOpenInsertAt, BLOCK_TYPES, onInsert }) => {
  const isOpen = openInsertAt === insertIdx;
  const [hov, setHov] = React.useState(false);
  return (
    <div style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'center', height:32, zIndex:20 }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div style={{ position:'absolute', left:0, right:0, height:1, background:`repeating-linear-gradient(to right,${hexToRgba(C.amber,.4)} 0,${hexToRgba(C.amber,.4)} 6px,transparent 6px,transparent 12px)`, zIndex:1 }}/>
      <button type="button" onClick={() => setOpenInsertAt(isOpen ? null : insertIdx)}
        style={{ width:26, height:26, borderRadius:'50%', background:isOpen ? C.amber : hexToRgba(C.dark,.92), border:`1.5px solid ${hexToRgba(C.amber,.5)}`, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, color:isOpen ? C.dark : C.amber, boxShadow:`0 2px 10px ${hexToRgba(C.amber,.3)}`, transition:'opacity .15s,transform .15s,background .15s', transform:(hov||isOpen)?'scale(1)':'scale(.7)', zIndex:2, position:'relative', lineHeight:1, fontWeight:700 }}>
        {isOpen ? '' : '+'}
      </button>
      {isOpen && (
        <div style={{ position:'absolute', bottom:34, left:'50%', transform:'translateX(-50%)', background:hexToRgba(C.mid,.97), borderRadius:16, border:`1px solid ${hexToRgba(C.amber,.35)}`, boxShadow:`0 16px 48px rgba(0,0,0,.5)`, padding:16, zIndex:100, width:260 }}
          onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
          <p style={{ fontFamily:sans, fontSize:'.5rem', fontWeight:700, letterSpacing:'.3em', textTransform:'uppercase', color:hexToRgba(C.amber,.6), margin:'0 0 10px', textAlign:'center' }}>Adauga bloc</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
            {BLOCK_TYPES.map(bt => (
              <button key={bt.type} type="button" onClick={() => onInsert(bt.type, bt.def)}
                style={{ background:hexToRgba(C.stone,.5), border:`1px solid ${hexToRgba(C.amber,.25)}`, borderRadius:10, padding:'8px 4px', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:4, transition:'background .15s,border-color .15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = hexToRgba(C.amber,.2); (e.currentTarget as HTMLButtonElement).style.borderColor = hexToRgba(C.amber,.6); }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = hexToRgba(C.stone,.5); (e.currentTarget as HTMLButtonElement).style.borderColor = hexToRgba(C.amber,.25); }}>
                <span style={{ fontSize:18, lineHeight:1 }}>{BLOCK_ICONS[bt.type] || '+'}</span>
                <span style={{ fontFamily:sans, fontSize:'.5rem', fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:C.cream, lineHeight:1.2, textAlign:'center' }}>{bt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// 
// DEFAULTS
// 
export const CASTLE_DEFAULTS = {
  partner1Name:        'Intalnire de Lucru',
  partner2Name:        '',
  eventType:           'office',
  welcomeText:         'Esti invitat la',
  celebrationText:     'o intalnire importanta',
  showWelcomeText:     true,
  showCelebrationText: true,
  castleIntroSubtitle: 'Sedinta / Conferinta',
  castleInviteTop:     'Va invitam la',
  castleInviteMiddle:  '',
  castleInviteBottom:  'Confirmati prezenta',
  castleInviteTag:     ' va asteptam ',
  colorTheme:          'default',
};

export const CASTLE_DEFAULT_BLOCKS: InvitationBlock[] = [
  {
    id: "off-text-intro",
    type: "text",
    show: true,
    content: "Suntem incantati sa va invitam la aceasta intalnire importanta. Va rugam sa confirmati prezenta si sa va rezervati timp pentru o sesiune productiva.",
  } as any,
  { id: "off-div-1", type: "divider", show: true } as any,
  {
    id: "off-photo-1",
    type: "photo",
    show: true,
    imageData: "",
    altText: "Fotografie eveniment",
    aspectRatio: "16:9",
    photoClip: "rect",
    photoMasks: [],
  } as any,
  { id: "off-div-2", type: "divider", show: true } as any,
  {
    id: "off-location-1",
    type: "location",
    show: true,
    label: "Sala de Conferinte",
    time: "10:00",
    locationName: "Sala A  Etaj 2",
    locationAddress: "Str. Exemplu nr. 1, Bucuresti",
    wazeLink: "",
  } as any,
  { id: "off-div-3", type: "divider", show: true } as any,
  {
    id: "off-description-1",
    type: "description",
    show: true,
    content: "Va invitam sa participati la sedinta trimestriala in care vom discuta rezultatele obtinute, obiectivele urmatoarei perioade si strategia de dezvoltare a echipei.",
  } as any,
  { id: "off-div-4", type: "divider", show: true } as any,
  {
    id: "off-timeline-1",
    type: "timeline",
    show: true,
  } as any,
  { id: "off-div-5", type: "divider", show: true } as any,
  {
    id: "off-photo-2",
    type: "photo",
    show: true,
    imageData: "",
    altText: "Fotografie echipa",
    aspectRatio: "4:3",
    photoClip: "rect",
    photoMasks: [],
  } as any,
  { id: "off-div-6", type: "divider", show: true } as any,
  { id: "off-calendar-1", type: "calendar", show: true } as any,
  { id: "off-div-7", type: "divider", show: true } as any,
  { id: "off-countdown-1", type: "countdown", show: true } as any,
  { id: "off-div-8", type: "divider", show: true } as any,
  {
    id: "off-rsvp-1",
    type: "rsvp",
    show: true,
    label: "Confirma Participarea",
  } as any,
];

export const CASTLE_PREVIEW_DATA = {
  guest: { name: 'Coleg Drag', status: 'pending', type: 'adult' },
  project: { selectedTemplate: 'office-simple' },
  profile: { ...CASTLE_DEFAULTS, weddingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], customSections: JSON.stringify(CASTLE_DEFAULT_BLOCKS) },
};

// 
// MAIN TEMPLATE
// 
const OfficeTemplate: React.FC<InvitationTemplateProps & {
  editMode?: boolean;
  onProfileUpdate?: (patch: Record<string, any>) => void;
  onBlocksUpdate?: (blocks: InvitationBlock[]) => void;
  onBlockSelect?: (block: InvitationBlock | null, idx: number, textKey?: string, textLabel?: string) => void;
  selectedBlockId?: string;
  scrollContainer?: HTMLElement | null;
}> = ({ data, onOpenRSVP, editMode = false, onProfileUpdate, onBlocksUpdate, onBlockSelect }) => {
  const { profile, guest } = data;
  const pr = profile as any;

  // Apply color theme each render
  C = getOfficeTheme((pr as any).colorTheme);

  const p = {
    partner1Name:        pr.partner1Name        ?? CASTLE_DEFAULTS.partner1Name,
    eventType:           pr.eventType           ?? 'office',
    weddingDate:         pr.weddingDate         ?? '',
    welcomeText:         pr.welcomeText         ?? CASTLE_DEFAULTS.welcomeText,
    celebrationText:     pr.celebrationText     ?? CASTLE_DEFAULTS.celebrationText,
    showWelcomeText:     pr.showWelcomeText      ?? true,
    showCelebrationText: pr.showCelebrationText  ?? true,
    castleIntroSubtitle: pr.castleIntroSubtitle ?? CASTLE_DEFAULTS.castleIntroSubtitle,
  };

  const dateStr = p.weddingDate ? new Date(p.weddingDate).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Data Evenimentului';
  const wd = p.weddingDate ? new Date(p.weddingDate) : null;
  const heroTextStyles = pr.heroTextStyles || {};
  const heroBlock: InvitationBlock = { id: '__hero__', type: '__hero__' as any, show: true, textStyles: heroTextStyles } as any;

  const safeJSON = (s: string | undefined, fb: any) => { try { return s ? JSON.parse(s) : fb; } catch { return fb; } };

  //  Blocks 
  const blocksFromDB: InvitationBlock[] | null = safeJSON(pr.customSections, null);
  const hasDB = Array.isArray(blocksFromDB) && blocksFromDB.length > 0;
  const [blocks, setBlocks] = useState<InvitationBlock[]>(() => hasDB ? blocksFromDB! : CASTLE_DEFAULT_BLOCKS as unknown as InvitationBlock[]);
  useEffect(() => {
    const fresh: InvitationBlock[] | null = safeJSON(pr.customSections, null);
    if (Array.isArray(fresh) && fresh.length > 0) setBlocks(fresh);
    else if (fresh !== null && Array.isArray(fresh) && fresh.length === 0) setBlocks(CASTLE_DEFAULT_BLOCKS as unknown as InvitationBlock[]);
  }, [pr.customSections]);

  const [openInsertAt, setOpenInsertAt] = useState<number | null>(null);
  const musicPlayRef = useRef<{ play: () => void; pause: () => void; unlock: () => void } | null>(null);

  const updBlock = useCallback((idx: number, patch: Partial<InvitationBlock>) => { setBlocks(prev => { const nb = prev.map((b, i) => i === idx ? { ...b, ...patch } : b); onBlocksUpdate?.(nb); return nb; }); }, [onBlocksUpdate]);
  const movBlock = useCallback((idx: number, dir: -1 | 1) => { setBlocks(prev => { const nb = [...prev]; const to = idx + dir; if (to < 0 || to >= nb.length) return prev; [nb[idx], nb[to]] = [nb[to], nb[idx]]; onBlocksUpdate?.(nb); return nb; }); }, [onBlocksUpdate]);
  const delBlock = useCallback((idx: number) => { setBlocks(prev => { const nb = prev.filter((_, i) => i !== idx); onBlocksUpdate?.(nb); return nb; }); }, [onBlocksUpdate]);
  const addBlockAt = useCallback((afterIdx: number, type: string, def: any) => { setBlocks(prev => { const nb = [...prev]; nb.splice(afterIdx + 1, 0, { id: Date.now().toString(), type: type as InvitationBlockType, show: true, ...def }); onBlocksUpdate?.(nb); return nb; }); }, [onBlocksUpdate]);
  const handleInsertAt = (afterIdx: number, type: string, def: any) => { addBlockAt(afterIdx, type, def); setOpenInsertAt(null); };

  const _pq = useRef<Record<string, any>>({});
  const _pt = useRef<ReturnType<typeof setTimeout> | null>(null);
  const upProfile = useCallback((field: string, value: any) => { _pq.current = { ..._pq.current, [field]: value }; if (_pt.current) clearTimeout(_pt.current); _pt.current = setTimeout(() => { onProfileUpdate?.(_pq.current); _pq.current = {}; }, 400); }, [onProfileUpdate]);

  const getTimelineItems = () => safeJSON(pr.timeline, []);
  const updateTimeline = (next: any[]) => onProfileUpdate?.({ timeline: JSON.stringify(next), showTimeline: true });
  const addTimelineItem = () => { const c = getTimelineItems(); updateTimeline([...c, { id: Date.now().toString(), title: '', time: '', icon: 'meeting' }]); };
  const updateTimelineItem = (id: string, patch: any) => updateTimeline(getTimelineItems().map((t: any) => t.id === id ? { ...t, ...patch } : t));
  const removeTimelineItem = (id: string) => updateTimeline(getTimelineItems().filter((t: any) => t.id !== id));

  const BLOCK_TYPES = [
    { type: 'photo',       label: 'Foto',       def: { imageData: '', aspectRatio: '16:9', photoClip: 'rect', photoMasks: [] } },
    { type: 'text',        label: 'Text',        def: { content: 'O intalnire importanta...' } },
    { type: 'location',    label: 'Locatie',     def: { label: 'Sala de Conferinte', time: '10:00', locationName: 'Sala A', locationAddress: 'Adresa companiei' } },
    { type: 'calendar',    label: 'Calendar',    def: {} },
    { type: 'countdown',   label: 'Countdown',   def: {} },
    { type: 'timeline',    label: 'Agenda',      def: {} },
    { type: 'music',       label: 'Muzica',      def: { musicTitle: '', musicArtist: '', musicType: 'none' } },
    { type: 'gift',        label: 'Info extra',  def: { sectionTitle: 'Informatii', content: '', iban: '', ibanName: '' } },
    { type: 'whatsapp',    label: 'Contact',     def: { label: 'Contact', content: '0700000000' } },
    { type: 'rsvp',        label: 'RSVP',        def: { label: 'Confirma Participarea' } },
    { type: 'divider',     label: 'Linie',       def: {} },
    { type: 'family',      label: 'Participanti', def: { label: 'Organizatori', content: '', members: JSON.stringify([{ name1: 'Organizator', name2: '' }]) } },
    { type: 'date',        label: 'Data',        def: {} },
    { type: 'description', label: 'Descriere',   def: { content: 'Detalii suplimentare...' } },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: OFF_CSS }}/>
      <div style={{
        background: `linear-gradient(180deg,${C.dark} 0%,${hexToRgba(C.mid, .9)} 40%,${C.dark} 100%)`,
        backgroundColor: C.dark,
        fontFamily: sans,
        minHeight: '100dvh',
        position: 'relative',
        paddingBottom: 'max(60px, env(safe-area-inset-bottom))',
        overflow: 'hidden',
      }}>
        {/* Grid pattern  pe tot bg-ul invitaiei */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: `linear-gradient(${hexToRgba(C.amber, .05)} 1px, transparent 1px), linear-gradient(90deg, ${hexToRgba(C.amber, .05)} 1px, transparent 1px)`, backgroundSize: '40px 40px' }}/>

        {/* Ambient glow left */}
        <div style={{ position: 'fixed', top: '10%', left: '-5%', width: 280, height: 280, borderRadius: '50%', pointerEvents: 'none', zIndex: 1, background: `radial-gradient(circle,${hexToRgba(C.amber, .06)} 0%,transparent 70%)` }}/>
        {/* Ambient glow right */}
        <div style={{ position: 'fixed', bottom: '15%', right: '-5%', width: 240, height: 240, borderRadius: '50%', pointerEvents: 'none', zIndex: 1, background: `radial-gradient(circle,${hexToRgba(C.steel, .08)} 0%,transparent 70%)` }}/>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 440, margin: '0 auto', padding: '0 16px' }}>

          {/*  HERO CARD  */}
          <BlockStyleProvider value={{ blockId: '__hero__', textStyles: heroTextStyles, onTextSelect: (k, l) => onBlockSelect?.(heroBlock, -1, k, l) }}>
            <div style={{ background: `linear-gradient(160deg,${hexToRgba(C.mid, .96)} 0%,${C.dark} 100%)`, borderRadius: 22, border: `1.5px solid ${hexToRgba(C.amber, .22)}`, overflow: 'hidden', position: 'relative', boxShadow: `0 24px 80px rgba(0,0,0,.6)` }}>
              {/* Top amber line */}
              <div style={{ height: 3, background: `linear-gradient(to right,${hexToRgba(C.amber, .1)},${C.amber},${hexToRgba(C.amber, .1)})` }}/>

              {/* Corner decorations  thin lines */}
              <div style={{ position: 'absolute', top: 12, left: 12, width: 32, height: 32, borderTop: `1.5px solid ${hexToRgba(C.amber, .35)}`, borderLeft: `1.5px solid ${hexToRgba(C.amber, .35)}`, borderRadius: '4px 0 0 0', pointerEvents: 'none' }}/>
              <div style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderTop: `1.5px solid ${hexToRgba(C.amber, .35)}`, borderRight: `1.5px solid ${hexToRgba(C.amber, .35)}`, borderRadius: '0 4px 0 0', pointerEvents: 'none' }}/>
              <div style={{ position: 'absolute', bottom: 12, left: 12, width: 32, height: 32, borderBottom: `1.5px solid ${hexToRgba(C.amber, .35)}`, borderLeft: `1.5px solid ${hexToRgba(C.amber, .35)}`, borderRadius: '0 0 0 4px', pointerEvents: 'none' }}/>
              <div style={{ position: 'absolute', bottom: 12, right: 12, width: 32, height: 32, borderBottom: `1.5px solid ${hexToRgba(C.amber, .35)}`, borderRight: `1.5px solid ${hexToRgba(C.amber, .35)}`, borderRadius: '0 0 4px 0', pointerEvents: 'none' }}/>

              <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '32px 28px 36px' }}>

                {/* Badge */}
                <Reveal delay={0.1}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `linear-gradient(135deg,${hexToRgba(C.amber, .15)},${hexToRgba(C.amber, .08)})`, border: `1px solid ${hexToRgba(C.amber, .3)}`, borderRadius: 50, padding: '6px 20px', marginBottom: 20 }}>
                    <Briefcase style={{ width: 12, height: 12, color: C.amber }}/>
                    <span style={{ fontFamily: display, fontSize: 8, fontWeight: 700, letterSpacing: '.3em', color: C.amber, textTransform: 'uppercase' }}>Invitatie Profesionala</span>
                  </div>
                </Reveal>

                {/* Welcome text */}
                {p.showWelcomeText !== false && (
                  <Reveal delay={0.15}>
                    <InlineEdit tag="p" editMode={editMode} value={p.welcomeText} onChange={v => upProfile('welcomeText', v)} textLabel="Hero  Welcome"
                      style={{ fontFamily: serif, fontSize: 13, fontStyle: 'italic', color: hexToRgba(C.cream, .45), margin: '0 0 10px', lineHeight: 1.7 }}/>
                  </Reveal>
                )}

                {/* Meeting / Event name */}
                <Reveal delay={0.2}>
                  <InlineEdit tag="h1" editMode={editMode} value={p.partner1Name} onChange={v => upProfile('partner1Name', v)} textLabel="Hero  Titlu"
                    style={{ fontFamily: display, fontSize: 'clamp(28px,7vw,48px)', fontWeight: 700, color: C.cream, margin: '0 0 6px', lineHeight: 1.1, textShadow: `0 0 20px ${hexToRgba(C.amber, .4)}, 0 2px 0 rgba(0,0,0,.4)`, letterSpacing: '.02em' }}/>
                </Reveal>

                {/* Subtitle */}
                {p.showCelebrationText !== false && (
                  <Reveal delay={0.25}>
                    <InlineEdit tag="p" editMode={editMode} value={p.castleIntroSubtitle} onChange={v => upProfile('castleIntroSubtitle', v)} textLabel="Hero  Subtitlu"
                      style={{ fontFamily: serif, fontSize: 13, fontStyle: 'italic', color: hexToRgba(C.amber, .65), margin: '0 0 6px' }}/>
                  </Reveal>
                )}

                <div style={{ margin: '20px 0' }}><OfficeDivider/></div>

                {/* Date card */}
                <Reveal delay={0.3}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', margin: '0 0 20px' }}>
                    <div style={{ flex: 1, height: 1, background: `linear-gradient(to right,transparent,${hexToRgba(C.amber, .25)})` }}/>
                    <div style={{ background: hexToRgba(C.amber, .1), border: `1.5px solid ${hexToRgba(C.amber, .3)}`, borderRadius: 14, padding: '10px 20px', textAlign: 'center', minWidth: 110 }}>
                      {wd ? (
                        <>
                          <p style={{ fontFamily: display, fontSize: 34, fontWeight: 700, color: C.cream, margin: 0, lineHeight: 1, textShadow: `0 0 12px ${hexToRgba(C.amber, .35)}` }}>{wd.getDate()}</p>
                          <p style={{ fontFamily: serif, fontSize: 12, fontStyle: 'italic', color: hexToRgba(C.amber, .85), margin: '2px 0 0' }}>{wd.toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' })}</p>
                          <p style={{ fontFamily: sans, fontSize: 9, color: hexToRgba(C.cream, .35), textTransform: 'capitalize', margin: '1px 0 0', letterSpacing: '.05em' }}>{wd.toLocaleDateString('ro-RO', { weekday: 'long' })}</p>
                        </>
                      ) : <p style={{ color: hexToRgba(C.cream, .3), fontFamily: sans, fontSize: 11, margin: 0 }}>Data neconfigurata</p>}
                    </div>
                    <div style={{ flex: 1, height: 1, background: `linear-gradient(to left,transparent,${hexToRgba(C.amber, .25)})` }}/>
                  </div>
                </Reveal>

                {/* Countdown */}
                <Reveal delay={0.35}>
                  <div style={{ margin: '0 0 24px' }}>
                    <OfficeCountdown targetDate={p.weddingDate}/>
                  </div>
                </Reveal>

                <div style={{ margin: '0 0 18px' }}><OfficeDivider/></div>

                {/* Guest name card */}
                <Reveal delay={0.4}>
                  <div style={{ background: hexToRgba(C.amber, .07), border: `1.5px solid ${hexToRgba(C.amber, .2)}`, borderRadius: 14, padding: '14px 20px' }}>
                    <p style={{ fontFamily: sans, fontSize: 9, fontWeight: 700, letterSpacing: '.38em', textTransform: 'uppercase', color: hexToRgba(C.amber, .55), margin: '0 0 5px' }}> Participant</p>
                    <p style={{ fontFamily: display, fontSize: 20, color: C.cream, margin: 0, letterSpacing: .5, textShadow: `0 0 10px ${hexToRgba(C.amber, .25)}` }}>{guest?.name || 'Coleg Drag'}</p>
                  </div>
                </Reveal>
              </div>
            </div>
          </BlockStyleProvider>

          {/*  BLOCKS  */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {editMode && (
              <InsertBlockButton insertIdx={-1} openInsertAt={openInsertAt} setOpenInsertAt={setOpenInsertAt} BLOCK_TYPES={BLOCK_TYPES} onInsert={(t, d) => handleInsertAt(-1, t, d)}/>
            )}

            {blocks.filter(b => editMode || b.show !== false).map((block, idx) => (
              <div key={block.id} style={{ position: 'relative' }}>
                {editMode && (
                  <BlockToolbar onUp={() => movBlock(idx, -1)} onDown={() => movBlock(idx, 1)} onToggle={() => updBlock(idx, { show: !block.show })} onDelete={() => delBlock(idx)} visible={block.show !== false} isFirst={idx === 0} isLast={idx === blocks.length - 1}/>
                )}

                <div style={{ position: 'relative', padding: '10px 0', opacity: block.show === false ? .4 : 1 }} onClick={editMode ? () => onBlockSelect?.(block, idx) : undefined}>
                  <BlockStyleProvider value={{ blockId: block.id, textStyles: (block as any).textStyles, onTextSelect: (k, l) => onBlockSelect?.(block, idx, k, l) }}>

                    {editMode && block.show === false && (
                      <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 16, pointerEvents: 'none' }}>
                        <div style={{ position: 'absolute', inset: 0, borderRadius: 16, background: 'rgba(0,0,0,.12)', backdropFilter: 'blur(2px)' }}/>
                        <div style={{ position: 'relative', zIndex: 10 }}><EyeOff size={22} color={hexToRgba(C.amber, .6)}/></div>
                      </div>
                    )}

                    {block.type === 'divider' && <OfficeDivider/>}

                    {block.type === 'rsvp' && (
                      <div style={{ textAlign: 'center' }}>
                        <button type="button" onClick={() => !editMode && onOpenRSVP?.()} style={{ width: '100%', padding: '18px 24px', background: `linear-gradient(135deg,${C.amber} 0%,${C.amberL} 50%,${C.amber} 100%)`, border: 'none', borderRadius: 18, cursor: 'pointer', fontFamily: display, fontWeight: 700, fontSize: 12, letterSpacing: '.25em', textTransform: 'uppercase', color: C.dark, boxShadow: `0 8px 28px ${hexToRgba(C.amber, .45)},inset 0 1px 0 rgba(255,255,255,.15)`, animation: 'off-pulse 2.5s ease-in-out infinite', position: 'relative', overflow: 'hidden' }}>
                          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent)', backgroundSize: '200% 100%', animation: 'off-shimmer 2s linear infinite', borderRadius: 18 }}/>
                          <span style={{ position: 'relative' }}>
                            <InlineEdit editMode={editMode} value={block.label || 'Confirma Participarea'} onChange={v => updBlock(idx, { label: v })}/>
                          </span>
                        </button>
                      </div>
                    )}

                    {block.type === 'photo' && (
                      <Reveal>
                        <PhotoBlock block={block} editMode={editMode} onUpdate={p => updBlock(idx, p)} placeholderInitial={p.partner1Name[0]}/>
                      </Reveal>
                    )}

                    {block.type === 'text' && (
                      <Reveal>
                        <BlockCard accentIcon="">
                          <InlineEdit editMode={editMode} value={block.content || ''} onChange={v => updBlock(idx, { content: v })} multiline
                            style={{ fontFamily: serif, fontSize: 15, fontStyle: 'italic', color: hexToRgba(C.cream, .75), margin: 0, lineHeight: 1.8, textAlign: 'center' }}/>
                        </BlockCard>
                      </Reveal>
                    )}

                    {block.type === 'location' && (
                      <Reveal>
                        <LocCard block={block} editMode={editMode} onUpdate={p => updBlock(idx, p)}/>
                      </Reveal>
                    )}

                    {block.type === 'calendar' && (
                      <Reveal>
                        <BlockCard accentIcon="">
                          <CalendarMonth date={p.weddingDate}/>
                        </BlockCard>
                      </Reveal>
                    )}

                    {block.type === 'countdown' && (
                      <Reveal>
                        <BlockCard accentIcon="">
                          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                            <span style={{ fontFamily: sans, fontSize: 9, fontWeight: 700, letterSpacing: '.4em', textTransform: 'uppercase', color: hexToRgba(C.amber, .7), padding: '4px 16px', borderRadius: 50, background: hexToRgba(C.amber, .08), border: `1.5px solid ${hexToRgba(C.amber, .25)}` }}>
                              Timp ramas
                            </span>
                          </div>
                          <OfficeCountdown targetDate={p.weddingDate}/>
                        </BlockCard>
                      </Reveal>
                    )}

                    {block.type === 'timeline' && (() => {
                      const items = getTimelineItems();
                      if (!items.length && !editMode) return null;
                      return (
                        <Reveal>
                          <BlockCard accentIcon="">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
                              <div style={{ flex: 1, height: 1, background: `linear-gradient(to right,transparent,${hexToRgba(C.amber, .2)})` }}/>
                              <p style={{ fontFamily: sans, fontSize: 8, fontWeight: 700, letterSpacing: '.42em', textTransform: 'uppercase', color: hexToRgba(C.amber, .6), margin: 0 }}>Agenda</p>
                              <div style={{ flex: 1, height: 1, background: `linear-gradient(to left,transparent,${hexToRgba(C.amber, .2)})` }}/>
                            </div>
                            {!items.length && editMode && <p style={{ fontFamily: serif, fontSize: 12, fontStyle: 'italic', color: hexToRgba(C.cream, .35), textAlign: 'center', margin: '0 0 14px' }}>Adauga primul punct din agenda</p>}
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              {items.map((item: any, i: number) => (
                                <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '56px 20px 1fr auto', alignItems: 'stretch', minHeight: 44 }}>
                                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', paddingRight: 8, paddingTop: 4 }}>
                                    <InlineEdit editMode={editMode} value={item.time || ''} onChange={v => updateTimelineItem(item.id, { time: v })} style={{ fontFamily: display, fontSize: 12, fontWeight: 700, color: hexToRgba(C.amber, .85), textAlign: 'right', lineHeight: 1.2 }}/>
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: C.amber, boxShadow: `0 0 6px ${hexToRgba(C.amber, .5)}`, flexShrink: 0, marginTop: 4 }}/>
                                    {i < items.length - 1 && <div style={{ flex: 1, width: '1.5px', background: `linear-gradient(to bottom,${hexToRgba(C.amber, .3)},transparent)`, marginTop: 3, borderRadius: 99 }}/>}
                                  </div>
                                  <div style={{ paddingLeft: 10, paddingTop: 2, paddingBottom: i < items.length - 1 ? 18 : 0 }}>
                                    <InlineEdit editMode={editMode} value={item.title || ''} onChange={v => updateTimelineItem(item.id, { title: v })} placeholder="Punct agenda..." style={{ fontFamily: display, fontSize: 13, fontWeight: 600, color: hexToRgba(C.cream, .82), lineHeight: 1.3 }}/>
                                  </div>
                                  {editMode && <button type="button" onClick={e => { e.stopPropagation(); removeTimelineItem(item.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: hexToRgba(C.amber, .35), fontSize: 12, padding: '4px 2px', alignSelf: 'flex-start', lineHeight: 1 }}></button>}
                                </div>
                              ))}
                            </div>
                            {editMode && <button type="button" onClick={e => { e.stopPropagation(); addTimelineItem(); }} style={{ marginTop: 14, width: '100%', background: hexToRgba(C.amber, .07), border: `1px dashed ${hexToRgba(C.amber, .25)}`, borderRadius: 10, padding: '8px 0', cursor: 'pointer', fontFamily: sans, fontSize: 9, fontWeight: 700, letterSpacing: '.25em', textTransform: 'uppercase', color: hexToRgba(C.amber, .6) }}>+ Adauga punct agenda</button>}
                          </BlockCard>
                        </Reveal>
                      );
                    })()}

                    {block.type === 'music' && (
                      <Reveal>
                        <MusicBlock block={block} editMode={editMode} onUpdate={p => updBlock(idx, p)} imperativeRef={musicPlayRef}/>
                      </Reveal>
                    )}

                    {block.type === 'gift' && (
                      <Reveal>
                        <BlockCard accentIcon="">
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 14 }}>
                            <div style={{ flex: 1, height: 1, background: `linear-gradient(to right,transparent,${hexToRgba(C.amber, .2)})` }}/>
                            <InlineEdit editMode={editMode} value={block.sectionTitle || 'Informatii'} onChange={v => updBlock(idx, { sectionTitle: v })}
                              style={{ fontFamily: sans, fontSize: 8, fontWeight: 700, letterSpacing: '.42em', textTransform: 'uppercase', color: hexToRgba(C.amber, .65), margin: 0 }}/>
                            <div style={{ flex: 1, height: 1, background: `linear-gradient(to left,transparent,${hexToRgba(C.amber, .2)})` }}/>
                          </div>
                          <InlineEdit editMode={editMode} value={block.content || ''} onChange={v => updBlock(idx, { content: v })} multiline
                            style={{ fontFamily: serif, fontSize: 13, fontStyle: 'italic', color: hexToRgba(C.cream, .65), margin: '0 0 12px', lineHeight: 1.75, textAlign: 'center' }}/>
                        </BlockCard>
                      </Reveal>
                    )}

                    {block.type === 'whatsapp' && (
                      <Reveal>
                        <div style={{ textAlign: 'center' }}>
                          <a href={`https://wa.me/${(block.content || '').replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: `linear-gradient(135deg,#25d366,#128c7e)`, borderRadius: 50, padding: '12px 24px', textDecoration: 'none', fontFamily: sans, fontSize: 11, fontWeight: 700, color: 'white', letterSpacing: '.1em', boxShadow: '0 6px 20px rgba(37,211,102,.35)' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                            <InlineEdit editMode={editMode} value={block.label || 'Contact WhatsApp'} onChange={v => updBlock(idx, { label: v })} style={{ color: 'white' }}/>
                          </a>
                        </div>
                      </Reveal>
                    )}

                    {block.type === 'family' && (() => {
                      const members = safeJSON(block.members, [{ name1: 'Organizator', name2: '' }]);
                      return (
                        <Reveal>
                          <BlockCard accentIcon="">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
                              <div style={{ flex: 1, height: 1, background: `linear-gradient(to right,transparent,${hexToRgba(C.amber, .2)})` }}/>
                              <InlineEdit editMode={editMode} value={block.label || 'Organizatori'} onChange={v => updBlock(idx, { label: v })}
                                style={{ fontFamily: sans, fontSize: 8, fontWeight: 700, letterSpacing: '.42em', textTransform: 'uppercase', color: hexToRgba(C.amber, .65), margin: 0 }}/>
                              <div style={{ flex: 1, height: 1, background: `linear-gradient(to left,transparent,${hexToRgba(C.amber, .2)})` }}/>
                            </div>
                            <InlineEdit editMode={editMode} value={block.content || ''} onChange={v => updBlock(idx, { content: v })} multiline
                              style={{ fontFamily: serif, fontSize: 13, fontStyle: 'italic', color: hexToRgba(C.cream, .55), textAlign: 'center', margin: '0 0 14px', lineHeight: 1.7 }}/>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                              {members.map((m: any, i: number) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                  <span style={{ fontFamily: display, fontSize: 15, color: C.cream }}>{m.name1}</span>
                                  {m.name2 && <>
                                    <span style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 12, color: hexToRgba(C.amber, .6) }}>&amp;</span>
                                    <span style={{ fontFamily: display, fontSize: 15, color: C.cream }}>{m.name2}</span>
                                  </>}
                                </div>
                              ))}
                            </div>
                          </BlockCard>
                        </Reveal>
                      );
                    })()}

                    {block.type === 'date' && (
                      <Reveal>
                        <BlockCard accentIcon="">
                          <div style={{ textAlign: 'center' }}>
                            <p style={{ fontFamily: sans, fontSize: 9, fontWeight: 700, letterSpacing: '.4em', textTransform: 'uppercase', color: hexToRgba(C.amber, .65), margin: '0 0 8px' }}>Data evenimentului</p>
                            <p style={{ fontFamily: display, fontSize: 22, fontWeight: 700, color: C.cream, margin: 0, textShadow: `0 0 12px ${hexToRgba(C.amber, .35)}` }}>{dateStr}</p>
                          </div>
                        </BlockCard>
                      </Reveal>
                    )}

                    {block.type === 'description' && (
                      <Reveal>
                        <BlockCard>
                          <InlineEdit editMode={editMode} value={block.content || ''} onChange={v => updBlock(idx, { content: v })} multiline
                            style={{ fontFamily: serif, fontSize: 14, color: hexToRgba(C.cream, .7), margin: 0, lineHeight: 1.8, textAlign: 'center', fontStyle: 'italic' }}/>
                        </BlockCard>
                      </Reveal>
                    )}

                  </BlockStyleProvider>
                </div>

                {editMode && (
                  <InsertBlockButton insertIdx={idx} openInsertAt={openInsertAt} setOpenInsertAt={setOpenInsertAt} BLOCK_TYPES={BLOCK_TYPES} onInsert={(t, d) => handleInsertAt(idx, t, d)}/>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', padding: '32px 0 16px' }}>
            <OfficeDivider/>
            <p style={{ fontFamily: serif, fontSize: 11, fontStyle: 'italic', color: hexToRgba(C.cream, .25), margin: '16px 0 0' }}>Va multumim pentru prezenta</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default OfficeTemplate;

