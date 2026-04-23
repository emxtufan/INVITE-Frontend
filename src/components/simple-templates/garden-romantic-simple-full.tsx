import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronUp, ChevronDown, Eye, EyeOff, Trash2, Plus, Camera, Upload, Music, Play, Pause, SkipForward, SkipBack, Gift, MessageCircle } from "lucide-react";
import { InvitationTemplateProps, TemplateMeta } from "../invitations/types";
import { cn } from "../../lib/utils";
import { InvitationBlock } from "../../types";
import { InlineEdit, InlineTime, InlineWaze } from "../invitations/InlineEdit";
import { BlockStyleProvider, BlockStyle } from "../BlockStyleContext";
import FlipClock from "../invitations/FlipClock";
import { getSharedDefaultBlocks } from "./shared-default-blocks";
import { API_URL } from "../../config/api";
import { WeddingIcon } from "../TimelineIcons";
import { TimelineInsertButton } from "../invitations/TimelineInsertButton";

export const meta: TemplateMeta = {
  id: 'garden-romantic',
  name: 'Garden Romantic',
  category: 'wedding',
  description: 'Nunta in gradina  arcade florale, fairy lights, pasteluri si petale in vant.',
  colors: ['#1a0e2e', '#d4a0b0', '#6b8f5e'],
  previewClass: "bg-purple-950 border-rose-300",
  elementsClass: "bg-rose-400",
};

const SERIF   = "'Cormorant Garamond','Playfair Display',Georgia,serif";
const SANS    = "'DM Sans','Helvetica Neue',system-ui,sans-serif";
let BLUSH = "#d4a0b0";
let BLUSH_D = "#a0526a";
let BLUSH_L = "#efcfda";
let BLUSH_XL = "#fff5f8";
let PLUM = "#24192d";
let MUTED = "#6e5463";
let BG_0 = "#1a0e2e";
let BG_1 = "#2d1b3d";
let BG_2 = "#3d2952";
let BG_3 = "#1e1628";
let LEAF = "#6b8f5e";
let LEAF_SOFT = "#7aaa6e";
let ACCENT_TEXT = "#f0d6de";

const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const raw = String(hex || "").replace("#", "").trim();
  const normalized = raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw;
  const safe = normalized.padEnd(6, "0").slice(0, 6);
  const n = parseInt(safe, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};

const rgba = (hex: string, a: number): string => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
};

const mixHex = (aHex: string, bHex: string, t: number): string => {
  const a = hexToRgb(aHex);
  const b = hexToRgb(bHex);
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  const lerp = (x: number, y: number) => x + (y - x) * t;
  return `#${clamp(lerp(a.r, b.r)).toString(16).padStart(2, "0")}${clamp(lerp(a.g, b.g)).toString(16).padStart(2, "0")}${clamp(lerp(a.b, b.b)).toString(16).padStart(2, "0")}`;
};

const relativeLuminance = (hex: string): number => {
  const { r, g, b } = hexToRgb(hex);
  const toLinear = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
};

const contrastRatio = (a: string, b: string): number => {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
};

const pickReadableColor = (seed: string, bg: string): string => {
  const candidates = [
    seed,
    mixHex(seed, "#ffffff", 0.2),
    mixHex(seed, "#ffffff", 0.4),
    mixHex(seed, "#ffffff", 0.6),
    mixHex(seed, "#ffffff", 0.8),
    mixHex(seed, "#000000", 0.2),
    mixHex(seed, "#000000", 0.4),
    "#ffffff",
    "#111111",
  ];
  let best = candidates[0];
  let bestScore = 0;
  for (const c of candidates) {
    const score = contrastRatio(c, bg);
    if (score > bestScore) {
      best = c;
      bestScore = score;
    }
  }
  return best;
};

type GardenTheme = {
  id: string;
  primary: string;
  secondary: string;
  accent: string;
  surface: string;
  text: string;
  muted?: string;
};

const GARDEN_THEMES: GardenTheme[] = [
  { id: "garden-default", primary: "#d4a0b0", secondary: "#6b8f5e", accent: "#f4d06f", surface: "#f8f2fb", text: "#2b1b35", muted: "#6e5463" },
  { id: "mono-elegance", primary: "#1f1f1f", secondary: "#f3f3f3", accent: "#9ca3af", surface: "#ffffff", text: "#111111", muted: "#525252" },
  { id: "ivory-gold", primary: "#d4b16a", secondary: "#efe3cf", accent: "#b8892f", surface: "#fffaf0", text: "#2f2618", muted: "#7a6748" },
  { id: "champagne-taupe", primary: "#8c7a6b", secondary: "#d8cec3", accent: "#b79f8b", surface: "#f5f2ee", text: "#2c2722", muted: "#6e645d" },
  { id: "charcoal-gold", primary: "#2b2b2b", secondary: "#bfa46a", accent: "#e2cf9a", surface: "#f7f4ef", text: "#131313", muted: "#5d5649" },
  { id: "slate-ivory", primary: "#5f6772", secondary: "#d9ddd8", accent: "#9ca38f", surface: "#f6f7f5", text: "#23262b", muted: "#5e646d" },
];

const getGardenTheme = (id?: string): GardenTheme => {
  const key = String(id || "").trim().toLowerCase();
  return (
    GARDEN_THEMES.find((t) => t.id === key) ||
    (key === "default" ? GARDEN_THEMES[0] : null) ||
    GARDEN_THEMES[0]
  );
};

export const CASTLE_DEFAULT_BLOCKS: InvitationBlock[] = getSharedDefaultBlocks("garden-romantic-simple");

function deleteUploadedFile(url: string | undefined) {
  if (!url || !url.startsWith("/uploads/")) return;
  const _s = JSON.parse(localStorage.getItem("weddingPro_session") || "{}");
  fetch(`${API_URL}/upload`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${_s?.token || ""}` },
    body: JSON.stringify({ url }),
  }).catch(() => {});
}

//  Petal particles 
interface Petal { id:number; x:number; size:number; dur:number; delay:number; color:string; rot:number }
function makeParticles(n: number): Petal[] {
  const colors = ["#f9b8c4","#fde68a","#c4b5fd","#bbf7d0","#fbcfe8","#fca5a5","#d9f99d"];
  return Array.from({length:n}, (_,i) => ({
    id:i, x:Math.random()*100, size:6+Math.random()*10,
    dur:3+Math.random()*3, delay:Math.random()*3,
    color:colors[Math.floor(Math.random()*colors.length)], rot:Math.random()*360,
  }));
}

//  INTRO 
const GardenIntro: React.FC<{ l1:string; l2:string; name1:string; name2:string; onDone:()=>void }> =
  ({ l1, l2, name1, name2, onDone }) => {
  const showSecond = !!l2 && l2 !== l1;
  const [phase, setPhase] = useState(0);
  const [petals]  = useState(() => makeParticles(22));
  const [lights]  = useState(() => Array.from({length:28}, (_,i) => ({
    id:i, x:8+(i%14)*6.5+(Math.floor(i/14)*3),
    y:20+Math.sin(i*0.8)*8+(Math.floor(i/14)*18),
    size:3+Math.random()*3, delay:Math.random()*0.6,
    color:["#fde68a","#fef3c7","#fff7ed","#fffbeb"][i%4],
  })));

  useEffect(() => {
    const ts = [
      setTimeout(() => setPhase(1), 80),
      setTimeout(() => setPhase(2), 500),
      setTimeout(() => setPhase(3), 1000),
      setTimeout(() => setPhase(4), 1500),
      setTimeout(() => setPhase(5), 2000),
      setTimeout(() => setPhase(6), 2400),
      setTimeout(() => setPhase(7), 3200),
      setTimeout(() => setPhase(8), 3900),
      setTimeout(onDone, 4600),
    ];
    return () => ts.forEach(clearTimeout);
  }, []);

  const archLen = 2 * Math.PI * 110;

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9999, overflow:"hidden",
      background: phase>=1
        ? `linear-gradient(180deg,${BG_0} 0%,${BG_1} 35%,${BG_2} 70%,${BG_3} 100%)`
        : mixHex(BG_0, "#040408", 0.65),
      transition:"background 1.2s",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      opacity: phase===8 ? 0 : 1,
      transition2: phase===8 ? "opacity 0.8s ease-in-out" : undefined,
      pointerEvents: phase===8 ? "none" : "auto",
    } as any}>

      {/* Starfield */}
      <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }}
        viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        {Array.from({length:70}, (_,i) => (
          <circle key={i}
            cx={Math.sin(i*37.3)*50+50} cy={Math.cos(i*22.7)*50+50}
            r={i%7===0?0.55:i%4===0?0.4:0.25} fill="white"
            opacity={phase>=1 ? (0.15+Math.sin(i)*0.12) : 0}
            style={{ transition:`opacity 0.5s ${i*0.01}s`,
              animation:phase>=1 ? `gr-star ${2+i%4}s ease-in-out infinite ${i*0.15}s` : "none" }}/>
        ))}
      </svg>

      {/* Moon */}
      <div style={{ position:"absolute", top:"6%", right:"8%",
        opacity: phase>=1 ? 1 : 0, transition:"opacity 1.5s" }}>
        <div style={{ position:"relative", width:50, height:50 }}>
          <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:"#fef9c3", opacity:0.88 }}/>
          <div style={{ position:"absolute", top:-4, right:-4, width:36, height:36, borderRadius:"50%",
            background:BG_1, opacity:0.92 }}/>
          <div style={{ position:"absolute", inset:-10, borderRadius:"50%",
            background:"radial-gradient(circle,rgba(253,230,138,0.15) 0%,transparent 70%)" }}/>
        </div>
      </div>

      {/* Fairy lights string 1 */}
      <svg style={{ position:"absolute", top:"6%", left:0, width:"100%", height:90, pointerEvents:"none" }}
        viewBox="0 0 100 18" preserveAspectRatio="xMidYMin slice">
        <path d="M0,8 Q25,4 50,8 Q75,12 100,6" stroke="rgba(255,255,255,0.1)" strokeWidth="0.3" fill="none"/>
        {lights.slice(0,14).map(l => (
          <g key={l.id} opacity={phase>=3?1:0} style={{ transition:`opacity 0.3s ${l.delay}s` }}>
            <circle cx={l.x} cy={l.y} r={l.size*1.8} fill={l.color} opacity="0.07"/>
            <circle cx={l.x} cy={l.y} r={l.size*1.2} fill={l.color} opacity="0.14"/>
            <ellipse cx={l.x} cy={l.y} rx={l.size*0.55} ry={l.size*0.7} fill={l.color} opacity="0.92"/>
            <rect x={l.x-0.8} y={l.y-l.size*0.7-1.2} width="1.6" height="1.5" rx="0.4" fill="rgba(255,255,255,0.3)"/>
          </g>
        ))}
      </svg>

      {/* Fairy lights string 2 */}
      <svg style={{ position:"absolute", top:"18%", left:0, width:"100%", height:60, pointerEvents:"none" }}
        viewBox="0 0 100 12" preserveAspectRatio="xMidYMin slice">
        <path d="M0,6 Q25,2 50,6 Q75,10 100,6" stroke="rgba(255,255,255,0.07)" strokeWidth="0.3" fill="none"/>
        {[8,18,29,40,51,62,72,82,92].map((lx,i) => {
          const ly=6+Math.sin(i)*2; const c=["#fde68a","#fef3c7","#fff7ed"][i%3];
          return (
            <g key={i} opacity={phase>=3?1:0} style={{ transition:`opacity 0.3s ${i*0.08+0.3}s` }}>
              <circle cx={lx} cy={ly} r="2.2" fill={c} opacity="0.12"/>
              <ellipse cx={lx} cy={ly} rx="1.1" ry="1.4" fill={c} opacity="0.88"/>
            </g>
          );
        })}
      </svg>

      {/* Floral arch */}
      <svg width="320" height="340" viewBox="0 0 320 340" fill="none"
        style={{ position:"absolute", bottom:"6%", left:"50%", transform:"translateX(-50%)", pointerEvents:"none" }}>
        {phase>=2 && <>
          <path d="M50 340 C50 280 60 220 80 170 C90 150 100 130 110 115"
            stroke={LEAF} strokeWidth="2.5" fill="none" strokeLinecap="round"
            strokeDasharray="220" strokeDashoffset="0"
            style={{ animation:"gr-draw 0.9s ease-out forwards" }}/>
          <path d="M270 340 C270 280 260 220 240 170 C230 150 220 130 210 115"
            stroke={LEAF} strokeWidth="2.5" fill="none" strokeLinecap="round"
            strokeDasharray="220" strokeDashoffset="0"
            style={{ animation:"gr-draw 0.9s 0.1s ease-out forwards" }}/>
          <path d="M108 115 Q135 88 160 82 Q185 76 212 115"
            stroke={LEAF} strokeWidth="2" fill="none" strokeLinecap="round"
            style={{ animation:"gr-draw 0.7s 0.3s ease-out forwards" }}/>
        </>}

        {/* Foliage */}
        {phase>=2 && [
          [62,310,1.0],[70,280,0.85],[82,250,0.9],[95,222,0.8],[108,195,0.85],[118,168,0.8],[112,140,0.75],
          [258,310,1.0],[250,280,0.85],[238,250,0.9],[225,222,0.8],[212,195,0.85],[202,168,0.8],[208,140,0.75],
          [138,100,0.8],[155,88,0.85],[170,84,0.85],[185,88,0.8],[200,98,0.75],
        ].map(([lx,ly,ls],i) => (
          <g key={i} opacity={phase>=2?(ls as number):0} style={{ transition:`opacity 0.3s ${i*0.04}s` }}>
            <ellipse cx={lx} cy={ly} rx={10*(ls as number)} ry={8*(ls as number)}
              fill={LEAF} opacity="0.7" transform={`rotate(${(i%3-1)*20} ${lx} ${ly})`}/>
            <ellipse cx={lx-4} cy={ly-4} rx={7*(ls as number)} ry={6*(ls as number)}
              fill={LEAF_SOFT} opacity="0.55" transform={`rotate(${(i%2)*15} ${lx-4} ${ly-4})`}/>
          </g>
        ))}

        {/* Flowers */}
        {[
          [72,295,"#f9b8c4","#fde68a",0],[88,262,"#c4b5fd","#fde68a",0.1],
          [104,230,"#fca5a5","#fbbf24",0.05],[116,200,"#f9b8c4","#fde68a",0.15],
          [112,168,"#c4b5fd","#fbbf24",0.08],[118,140,"#fbcfe8","#fde68a",0.2],
          [248,295,"#f9b8c4","#fde68a",0.03],[232,262,"#a7f3d0","#fde68a",0.12],
          [216,230,"#fca5a5","#fbbf24",0.08],[204,200,"#f9b8c4","#fde68a",0.18],
          [208,168,"#c4b5fd","#fbbf24",0.04],[202,140,"#fbcfe8","#fde68a",0.22],
          [140,102,"#f9b8c4","#fde68a",0.18],[157,88,"#fca5a5","#fbbf24",0.22],
          [173,84,"#c4b5fd","#fde68a",0.25],[190,90,"#f9b8c4","#fbbf24",0.2],
        ].map(([fx,fy,pc,cc,fd],i) => (
          <g key={i} opacity={phase>=2?1:0} style={{ transition:`opacity 0.4s ${(fd as number)+0.3}s` }}>
            {[0,72,144,216,288].map((a,pi) => {
              const rad=((a-90)*Math.PI)/180;
              const px=(fx as number)+Math.cos(rad)*7, py=(fy as number)+Math.sin(rad)*7;
              return <ellipse key={pi} cx={px} cy={py} rx="4.5" ry="7"
                fill={pc as string} opacity="0.82" transform={`rotate(${a},${px},${py})`}/>;
            })}
            <circle cx={fx as number} cy={fy as number} r="4.5" fill={cc as string} opacity="0.95"/>
            <circle cx={fx as number} cy={fy as number} r="2.5" fill="white" opacity="0.4"/>
          </g>
        ))}
      </svg>

      {/* Falling petals */}
      {phase>=6 && petals.map(p => (
        <div key={p.id} style={{
          position:"absolute", left:`${p.x}%`, top:"-5%",
          width:p.size, height:p.size, borderRadius:"50% 0 50% 0",
          background:p.color, opacity:0.7,
          animation:`gr-petal ${p.dur}s ${p.delay}s ease-in infinite`,
          transform:`rotate(${p.rot}deg)`, pointerEvents:"none",
        }}/>
      ))}

      {/* Ground glow */}
      <div style={{
        position:"absolute", bottom:"6%", left:"50%", transform:"translateX(-50%)",
        width:200, height:60,
        background:`radial-gradient(ellipse,${rgba(BLUSH,0.2)} 0%,transparent 70%)`,
        opacity:phase>=3?1:0, transition:"opacity 1s", pointerEvents:"none",
      }}/>

      {/* Initials */}
      <div style={{
        position:"relative", zIndex:10, textAlign:"center", marginBottom:14,
        opacity:phase>=4?1:0, transform:phase>=4?"translateY(0) scale(1)":"translateY(20px) scale(0.85)",
        transition:"opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1)",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, justifyContent:"center" }}>
          <span style={{ fontFamily:SERIF, fontSize:102, fontWeight:300, lineHeight:1,
            color:"white", letterSpacing:-4,
            textShadow:`0 0 60px ${rgba(BLUSH,0.5)}, 0 2px 0 rgba(0,0,0,0.15)` }}>{l1}</span>
          {showSecond && <>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4,
              opacity:phase>=4?1:0, transform:phase>=4?"scale(1)":"scale(0)",
              transition:"opacity 0.35s 0.25s, transform 0.35s 0.25s cubic-bezier(0.34,1.6,0.64,1)" }}>
              <div style={{ width:4, height:4, borderRadius:"50%", background:"rgba(253,230,138,0.6)" }}/>
              <span style={{ fontFamily:SERIF, fontSize:30, fontStyle:"italic",
                color:"rgba(253,230,138,0.8)", lineHeight:1 }}>&</span>
              <div style={{ width:4, height:4, borderRadius:"50%", background:"rgba(253,230,138,0.6)" }}/>
            </div>
            <span style={{ fontFamily:SERIF, fontSize:102, fontWeight:300, lineHeight:1,
              color:"white", letterSpacing:-4,
              textShadow:`0 0 60px ${rgba(BLUSH,0.5)}, 0 2px 0 rgba(0,0,0,0.15)` }}>{l2}</span>
          </>}
        </div>
      </div>

      {/* Names */}
      <div style={{ textAlign:"center", position:"relative", zIndex:10,
        opacity:phase>=5?1:0, transform:phase>=5?"translateY(0)":"translateY(10px)",
        transition:"opacity 0.5s, transform 0.5s" }}>
        <p style={{ fontFamily:SERIF, fontSize:19, fontWeight:300, fontStyle:"italic",
          color:"rgba(255,255,255,0.65)", letterSpacing:3, margin:0 }}>
          {name1}{showSecond?` & ${name2}`:''}
        </p>
        <p style={{ fontFamily:SANS, fontSize:11, fontWeight:700, letterSpacing:"0.5em",
          textTransform:"uppercase", color:"rgba(253,230,138,0.4)", marginTop:8 }}>
          va invita{showSecond?' la nunta lor':''}
        </p>
      </div>

      <style>{`
        @keyframes gr-star  { 0%,100%{opacity:.15} 50%{opacity:.45} }
        @keyframes gr-petal { 0%{transform:translateY(0) rotate(0deg) translateX(0);opacity:.7}
                              100%{transform:translateY(110vh) rotate(540deg) translateX(40px);opacity:0} }
        @keyframes gr-draw  { from{stroke-dashoffset:220} to{stroke-dashoffset:0} }
      `}</style>
    </div>
  );
};

//  Countdown 
function useCountdown(target: string) {
  const calc = () => {
    const diff = new Date(target).getTime() - Date.now();
    if (diff <= 0) return { days:0, hours:0, minutes:0, seconds:0, expired:true };
    return { days:Math.floor(diff/86400000), hours:Math.floor((diff%86400000)/3600000),
      minutes:Math.floor((diff%3600000)/60000), seconds:Math.floor((diff%60000)/1000), expired:false };
  };
  const [t, setT] = useState(calc);
  useEffect(() => { if (!target) return; const id = setInterval(() => setT(calc()), 1000); return () => clearInterval(id); }, [target]);
  return t;
}

const FlipDigit: React.FC<{ value:number }> = ({ value }) => {
  const prev = useRef(value);
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    if (prev.current !== value) { setFlash(true); const t = setTimeout(() => setFlash(false), 320); prev.current = value; return () => clearTimeout(t); }
  }, [value]);
  return (
    <div style={{ width:54, height:64, background:"rgba(255,255,255,0.1)", border:`1.5px solid ${rgba(BLUSH,0.35)}`,
      borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center",
      position:"relative", overflow:"hidden", boxShadow:"0 4px 18px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)" }}>
      <div style={{ position:"absolute", left:0, right:0, top:"50%", height:1, background:rgba(BLUSH,0.2), zIndex:2 }}/>
      <span style={{ fontFamily:SERIF, fontSize:34, fontWeight:400, color:"white", lineHeight:1, zIndex:1,
        transform:flash?"translateY(-3px)":"translateY(0)", transition:"transform 0.16s cubic-bezier(0.4,0,0.2,1)", display:"block" }}>
        {String(value).padStart(2,'0')}
      </span>
      <div style={{ position:"absolute", inset:0, background:BLUSH,
        opacity:flash?0.1:0, transition:"opacity 0.32s", pointerEvents:"none" }}/>
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
  const monthNames = ["IANUARIE", "FEBRUARIE", "MARTIE", "APRILIE", "MAI", "IUNIE", "IULIE", "AUGUST", "SEPTEMBRIE", "OCTOMBRIE", "NOIEMBRIE", "DECEMBRIE"];
  const dayLabels = ["L", "M", "M", "J", "V", "S", "D"];
  const startOffset = (firstDay + 6) % 7;
  const cells: (number | null)[] = [...Array(startOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  return (
    <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: 14, textAlign: "center", border: `1.5px solid ${rgba(BLUSH,0.25)}` }}>
      <p style={{ fontFamily: SANS, fontSize:12, fontWeight: 700, letterSpacing: "0.2em", color:rgba(ACCENT_TEXT,0.75), marginBottom: 10 }}>{monthNames[month]} {year}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 6 }}>
        {dayLabels.map((l, i) => <div key={`${l}-${i}`} style={{ fontSize:11, fontWeight: 700, color:rgba(ACCENT_TEXT,0.5) }}>{l}</div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
        {cells.map((cell, i) => {
          const isToday = cell === day;
          return (
            <div key={i} style={{ height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize:14, fontWeight: isToday ? 700 : 400, color: isToday ? PLUM : cell ? "rgba(255,255,255,0.82)" : "transparent", background: isToday ? BLUSH_D : "transparent", borderRadius: "50%" }}>
              {cell || ""}
            </div>
          );
        })}
      </div>
    </div>
  );
};

//  Decorative components 
const FloralDivider = () => (
  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
    <div style={{ flex:1, height:"0.7px", background:`linear-gradient(to right,transparent,${rgba(BLUSH,0.35)})` }}/>
    <svg width="64" height="22" viewBox="0 0 64 22" fill="none">
      <path d="M2,11 Q8,6 14,9 Q8,10 2,11Z" fill={LEAF} opacity="0.55"/>
      <path d="M2,11 Q8,16 14,13 Q8,12 2,11Z" fill={LEAF} opacity="0.45"/>
      {[0,72,144,216,288].map((a,i) => {
        const r=((a-90)*Math.PI)/180;
        return <ellipse key={i} cx={32+Math.cos(r)*7} cy={11+Math.sin(r)*7}
          rx="3.5" ry="6" fill={BLUSH} opacity="0.8"
          transform={`rotate(${a},${32+Math.cos(r)*7},${11+Math.sin(r)*7})`}/>;
      })}
      <circle cx="32" cy="11" r="4.5" fill={BLUSH_D} opacity="0.9"/>
      <circle cx="32" cy="11" r="2.5" fill="white" opacity="0.45"/>
      <path d="M62,11 Q56,6 50,9 Q56,10 62,11Z" fill={LEAF} opacity="0.55"/>
      <path d="M62,11 Q56,16 50,13 Q56,12 62,11Z" fill={LEAF} opacity="0.45"/>
    </svg>
    <div style={{ flex:1, height:"0.7px", background:`linear-gradient(to left,transparent,${rgba(BLUSH,0.35)})` }}/>
  </div>
);

const LightString = () => (
  <div style={{ display:"flex", justifyContent:"center", padding:"4px 0", overflow:"hidden" }}>
    <svg viewBox="0 0 300 28" style={{ width:"100%", maxWidth:360, height:28 }} fill="none">
      <path d="M0,10 Q38,4 75,10 Q113,16 150,8 Q188,0 225,10 Q263,18 300,10"
        stroke="rgba(255,255,255,0.1)" strokeWidth="0.6" fill="none"/>
      {[18,46,75,104,130,156,182,210,240,268].map((lx,i) => {
        const ly=10+Math.sin(i*0.9)*4;
        const c=["#fde68a","#fef3c7","#fca5a5","#fbcfe8","#c4b5fd"][i%5];
        return (
          <g key={i} style={{ animation:`gr-flicker2 ${1.8+i%3*0.5}s ease-in-out infinite ${i*0.18}s` }}>
            <circle cx={lx} cy={ly} r="4.5" fill={c} opacity="0.08"/>
            <ellipse cx={lx} cy={ly} rx="1.4" ry="1.9" fill={c} opacity="0.85"/>
            <rect x={lx-0.9} y={ly-2.9} width="1.8" height="1.4" rx="0.4" fill={rgba(BLUSH,0.3)}/>
          </g>
        );
      })}
    </svg>
    <style>{`@keyframes gr-flicker2{0%,100%{opacity:1}50%{opacity:0.55}}`}</style>
  </div>
);

//  Hero arch illustration (static, used in content) 
const GardenHero = () => {
  const [lights] = useState(() => Array.from({length:32}, (_,i) => ({
    x:2+(i%16)*6.4, y:i<16?8+Math.sin(i*0.7)*5:22+Math.sin(i*0.9)*4,
    r:1.8+Math.sin(i)*0.8, c:["#fde68a","#fef3c7","#fff7ed","#fffbeb"][i%4], d:i*0.1,
  })));
  return (
    <svg viewBox="0 0 420 300" fill="none"
      style={{ position:"absolute", top:0, left:0, width:"100%", height:300, pointerEvents:"none" }}>
      <defs>
        <linearGradient id="gr-bg2" x1="0" y1="0" x2="0" y2="300" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={BG_0}/><stop offset="55%" stopColor={BG_1}/><stop offset="100%" stopColor={BG_2}/>
        </linearGradient>
        <radialGradient id="gr-glow2" cx="50%" cy="80%" r="40%">
          <stop offset="0%" stopColor={BLUSH} stopOpacity="0.15"/><stop offset="100%" stopColor={BLUSH} stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width="420" height="300" fill="url(#gr-bg2)"/>
      <rect width="420" height="300" fill="url(#gr-glow2)"/>
      {Array.from({length:55},(_,i)=>(
        <circle key={i} cx={(Math.sin(i*41.3)*210)+210} cy={(Math.cos(i*23.7)*150)+75}
          r={i%9===0?1.1:i%5===0?0.75:0.45} fill="white" opacity={0.12+Math.sin(i)*0.1}/>
      ))}
      {/* Moon */}
      <circle cx="345" cy="42" r="22" fill="#fef9c3" opacity="0.88"/>
      <circle cx="356" cy="34" r="17" fill={BG_1} opacity="0.92"/>
      <circle cx="345" cy="42" r="30" fill="#fde68a" opacity="0.06"/>
      {/* Light strings */}
      <path d="M0,28 Q105,18 210,26 Q315,34 420,22" stroke="rgba(255,255,255,0.08)" strokeWidth="0.4" fill="none"/>
      <path d="M0,42 Q105,50 210,40 Q315,30 420,45" stroke="rgba(255,255,255,0.07)" strokeWidth="0.35" fill="none"/>
      {lights.map((l,i)=>(
        <g key={i} style={{ animation:`gr-flicker ${1.5+i%4*0.4}s ease-in-out infinite ${l.d}s` }}>
          <circle cx={l.x*4.2} cy={l.y} r={l.r*2.5} fill={l.c} opacity="0.06"/>
          <ellipse cx={l.x*4.2} cy={l.y} rx={l.r*0.7} ry={l.r} fill={l.c} opacity="0.9"/>
        </g>
      ))}
      {/* Arch pillars */}
      <path d="M88 300 C88 240 96 180 108 130 C116 105 124 88 132 75" stroke={LEAF} strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      <path d="M332 300 C332 240 324 180 312 130 C304 105 296 88 288 75" stroke={LEAF} strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      <path d="M130 77 Q175 50 210 44 Q245 38 290 73" stroke={LEAF} strokeWidth="2.8" fill="none" strokeLinecap="round"/>
      {/* Foliage */}
      {[[96,285],[100,260],[106,235],[112,210],[120,185],[126,160],[128,135],
        [324,285],[320,260],[314,235],[308,210],[300,185],[294,160],[292,135],
        [140,80],[158,60],[178,50],[198,46],[218,52],[238,68]
      ].map(([gx,gy],i)=>(
        <g key={i}>
          <ellipse cx={gx} cy={gy} rx={13} ry={9} fill={LEAF} opacity="0.65" transform={`rotate(${(i%3-1)*22} ${gx} ${gy})`}/>
          <ellipse cx={gx+4} cy={gy-5} rx={8} ry={6} fill={LEAF_SOFT} opacity="0.5" transform={`rotate(${(i%2)*18} ${gx+4} ${gy-5})`}/>
        </g>
      ))}
      {/* Flowers */}
      {[[98,270,"#f9b8c4","#fde68a"],[104,242,"#c4b5fd","#fde68a"],[112,214,"#fca5a5","#fbbf24"],
        [118,185,"#fbcfe8","#fde68a"],[124,158,"#f9b8c4","#fde68a"],[128,132,"#c4b5fd","#fde68a"],
        [322,270,"#fca5a5","#fbbf24"],[316,242,"#f9b8c4","#fde68a"],[308,214,"#c4b5fd","#fde68a"],
        [302,185,"#fbcfe8","#fde68a"],[296,158,"#fca5a5","#fbbf24"],[292,132,"#f9b8c4","#fde68a"],
        [142,82,"#fbcfe8","#fde68a"],[158,64,"#fca5a5","#fbbf24"],[178,52,"#f9b8c4","#fde68a"],
        [198,47,"#c4b5fd","#fde68a"],[218,53,"#fbcfe8","#fde68a"],[236,68,"#fca5a5","#fbbf24"],
      ].map(([fx,fy,pc,cc],i)=>(
        <g key={i}>
          {[0,72,144,216,288].map((a,pi)=>{
            const r=((a-90)*Math.PI)/180;
            return <ellipse key={pi} cx={(fx as number)+Math.cos(r)*7} cy={(fy as number)+Math.sin(r)*7}
              rx="4" ry="6.5" fill={pc as string} opacity="0.8"
              transform={`rotate(${a},${(fx as number)+Math.cos(r)*7},${(fy as number)+Math.sin(r)*7})`}/>;
          })}
          <circle cx={fx as number} cy={fy as number} r="4.5" fill={cc as string} opacity="0.92"/>
          <circle cx={fx as number} cy={fy as number} r="2.2" fill="white" opacity="0.45"/>
        </g>
      ))}
      <ellipse cx="210" cy="295" rx="120" ry="20" fill={BLUSH} opacity="0.07"/>
      <style>{`@keyframes gr-flicker{0%,100%{opacity:1}50%{opacity:0.6}}`}</style>
    </svg>
  );
};

//  Scroll reveal 
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold:0.1 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

//  Block toolbar 
const BlockToolbar = ({ onUp, onDown, onToggle, onDelete, visible, isFirst, isLast }: any) => (
  <div className="absolute -top-3.5 right-2 flex items-center gap-0.5 rounded-full border px-1.5 py-1 opacity-0 group-hover/block:opacity-100 transition-all z-30 pointer-events-none group-hover/block:pointer-events-auto shadow-lg"
    style={{ background:rgba(BG_1,0.95), borderColor:rgba(BLUSH,0.3) }}>
    <button type="button" onClick={e=>{e.stopPropagation();onUp();}} disabled={isFirst} className="p-0.5 rounded-full disabled:opacity-20" style={{ color:ACCENT_TEXT }} ><ChevronUp className="w-3 h-3"/></button>
    <button type="button" onClick={e=>{e.stopPropagation();onDown();}} disabled={isLast} className="p-0.5 rounded-full disabled:opacity-20" style={{ color:ACCENT_TEXT }}><ChevronDown className="w-3 h-3"/></button>
    <div className="w-px h-3 mx-0.5" style={{ background:rgba(BLUSH,0.3) }}/>
    <button type="button" onClick={e=>{e.stopPropagation();onToggle();}} className="p-0.5 rounded-full" style={{ color:ACCENT_TEXT }}>
      {visible ? <Eye className="w-3 h-3"/> : <EyeOff className="w-3 h-3 opacity-50"/>}
    </button>
    <button type="button" onClick={e=>{e.stopPropagation();onDelete();}} className="p-0.5 rounded-full hover:bg-red-900/30"><Trash2 className="w-3 h-3 text-red-400"/></button>
  </div>
);

const BLOCK_TYPE_ICONS: Record<string, string> = {
  photo: "",
  location: "",
  calendar: "",
  countdown: "",
  timeline: "",
  music: "",
  gift: "",
  whatsapp: "",
  rsvp: "",
  divider: "",
  family: "",
  date: "",
  description: "",
  title: "",
  godparents: "",
  parents: "",
  spacer: "",
  text: "",
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
      style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", height: 30, zIndex: 40 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        position: "absolute",
        left: 0,
        right: 0,
        height: 1,
        background: `repeating-linear-gradient(to right, ${BLUSH_L} 0, ${BLUSH_L} 6px, transparent 6px, transparent 12px)`,
      }} />
      <button
        type="button"
        onClick={() => setOpenInsertAt(isOpen ? null : insertIdx)}
        style={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          border: `1.5px solid ${BLUSH_L}`,
          background: isOpen ? BLUSH_D : "white",
          color: isOpen ? "white" : BLUSH_D,
          fontWeight: 700,
          lineHeight: 1,
          cursor: "pointer",
          boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
          transform: visible ? "scale(1)" : "scale(0.7)",
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
            bottom: 34,
            left: "50%",
            transform: "translateX(-50%)",
            width: 280,
            background: "white",
            border: `1px solid ${BLUSH_L}`,
            borderRadius: 16,
            boxShadow: "0 16px 48px rgba(0,0,0,0.16), 0 4px 16px rgba(0,0,0,0.08)",
            padding: 14,
            zIndex: 200,
          }}
        >
          <p style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: PLUM, margin: "0 0 10px", textAlign: "center" }}>
            Adauga bloc
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
            {blockTypes.map(bt => (
              <button
                key={bt.type}
                type="button"
                onClick={() => onInsert(bt.type, bt.def)}
                style={{
                  border: `1px solid ${BLUSH_L}`,
                  borderRadius: 10,
                  background: BLUSH_XL,
                  color: PLUM,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  padding: "8px 4px",
                }}
              >
                <span style={{ fontSize:18, lineHeight: 1 }}>{BLOCK_TYPE_ICONS[bt.type] || "+"}</span>
                <span style={{ fontSize: "0.56rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", lineHeight: 1.15, textAlign: "center" }}>
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

//  Location card (with scroll reveal + inline edit) 
const LocCard: React.FC<{ block:InvitationBlock; editMode:boolean; onUpdate:(p:Partial<InvitationBlock>)=>void }> =
  ({ block, editMode, onUpdate }) => {
  const { ref, visible } = useReveal();
  const hasWaze = !!String(block.wazeLink || '').trim();
  const mapsUrl = String(block.locationAddress || '').trim()
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(String(block.locationAddress || '').trim())}`
    : '';
  return (
    <div ref={ref} style={{
      background:"rgba(255,255,255,0.07)", backdropFilter:"blur(10px)",
      borderRadius:16, border:`1.5px solid ${rgba(BLUSH,0.25)}`, padding:"20px 26px",
      boxShadow:"0 4px 28px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)",
      position:"relative", overflow:"hidden",
      opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(18px)",
      transition:"opacity 0.6s cubic-bezier(0.4,0,0.2,1), transform 0.6s cubic-bezier(0.4,0,0.2,1)",
    }}>
      {/* Shimmer top */}
      <div style={{ position:"absolute", top:0, left:"20%", right:"20%", height:"1.5px",
        background:`linear-gradient(to right,transparent,${rgba(BLUSH,0.3)},transparent)`, pointerEvents:"none" }}/>
      <InlineEdit tag="p" editMode={editMode} value={block.label||''} onChange={v=>onUpdate({label:v})} placeholder="Eveniment..."
        style={{ fontFamily:SANS, fontSize:10, fontWeight:700, letterSpacing:"0.45em", textTransform:"uppercase",
          color:rgba(ACCENT_TEXT,0.6), margin:"0 0 12px", display:"block" }}/>
      <div style={{ display:"grid", gridTemplateColumns:"auto 1.5px 1fr", gap:"0 18px", alignItems:"start" }}>
        <div>
          <InlineTime value={block.time||''} onChange={v=>onUpdate({time:v})} editMode={editMode}
            className="text-white font-light" style={{ fontFamily:SERIF, fontSize:34, fontWeight:300, color:"white", display:"block" }}/>
          <p style={{ fontFamily:SANS, fontSize:10, color:rgba(ACCENT_TEXT,0.4), margin:"2px 0 0" }}>ora</p>
        </div>
        <div style={{ background:rgba(BLUSH,0.2), alignSelf:"stretch" }}/>
        <div>
          <InlineEdit tag="p" editMode={editMode} value={block.locationName||''} onChange={v=>onUpdate({locationName:v})} placeholder="Locatie..."
            style={{ fontFamily:SANS, fontSize:15, fontWeight:600, color:"white", margin:"0 0 3px", lineHeight:1.35 }}/>
          <InlineEdit tag="p" editMode={editMode} value={block.locationAddress||''} onChange={v=>onUpdate({locationAddress:v})} placeholder="Adresa..."
            style={{ fontFamily:SANS, fontSize:13, color:rgba(ACCENT_TEXT,0.5), margin:0, lineHeight:1.5, fontStyle:"italic" }} multiline/>
        </div>
      </div>
      {(block.wazeLink || block.locationAddress || editMode) && (
        <div style={{ marginTop:10, display:"grid", gap:8 }}>
          <InlineWaze value={block.wazeLink||''} onChange={v=>onUpdate({wazeLink:v})} editMode={editMode}/>
          <div style={{ display:"flex", justifyContent:"center", flexWrap:"wrap", gap:8 }}>
            <a
              href={hasWaze ? String(block.wazeLink) : "#"}
              target={hasWaze ? "_blank" : undefined}
              rel={hasWaze ? "noopener noreferrer" : undefined}
              onClick={(e) => { if (!hasWaze) e.preventDefault(); }}
              style={{
                display:"inline-flex",
                alignItems:"center",
                gap:6,
                padding:"7px 12px",
                borderRadius:999,
                fontFamily:SANS,
                fontSize:12,
                fontWeight:800,
                letterSpacing:"0.16em",
                textTransform:"uppercase",
                textDecoration:"none",
                background: hasWaze ? `linear-gradient(135deg,${mixHex(LEAF, "#ffffff", 0.15)},${mixHex(LEAF, BG_0, 0.28)})` : "rgba(255,255,255,0.08)",
                color: hasWaze ? "white" : rgba(BLUSH,0.45),
                border: hasWaze ? `1px solid ${rgba(LEAF,0.65)}` : `1px solid ${rgba(BLUSH,0.2)}`,
                boxShadow: hasWaze ? `0 6px 18px ${rgba(LEAF,0.3)}` : "none",
                cursor: hasWaze ? "pointer" : "not-allowed",
              }}
            >
              Waze
            </a>
            <a
              href={mapsUrl || "#"}
              target={mapsUrl ? "_blank" : undefined}
              rel={mapsUrl ? "noopener noreferrer" : undefined}
              onClick={(e) => { if (!mapsUrl) e.preventDefault(); }}
              style={{
                display:"inline-flex",
                alignItems:"center",
                gap:6,
                padding:"7px 12px",
                borderRadius:999,
                fontFamily:SANS,
                fontSize:12,
                fontWeight:800,
                letterSpacing:"0.16em",
                textTransform:"uppercase",
                textDecoration:"none",
                background: mapsUrl ? `linear-gradient(135deg,${mixHex(BLUSH, "#ffffff", 0.1)},${mixHex(BLUSH_D, BG_0, 0.25)})` : "rgba(255,255,255,0.08)",
                color: mapsUrl ? "white" : rgba(BLUSH,0.45),
                border: mapsUrl ? `1px solid ${rgba(BLUSH_D,0.62)}` : `1px solid ${rgba(BLUSH,0.2)}`,
                boxShadow: mapsUrl ? `0 6px 18px ${rgba(BLUSH_D,0.3)}` : "none",
                cursor: mapsUrl ? "pointer" : "not-allowed",
              }}
            >
              Maps
            </a>
          </div>
        </div>
      )}
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
    const onEnd = () => { setPlaying(false); setProgress(0); };
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
  }, [block.musicUrl, block.musicType]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const pct = duration ? `${(progress / duration) * 100}%` : "0%";

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    audioRef.current.currentTime = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * duration;
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
      if (!res.ok) throw new Error("Audio upload failed");
      const { url } = await res.json();
      onUpdate({ musicUrl: url, musicType: "mp3" });
    } finally {
      setUploading(false);
    }
  };

  const isActive = !!block.musicUrl;

  return (
    <div style={{ background: "rgba(255,255,255,0.86)", border: `1px solid ${playing ? BLUSH_D : BLUSH_L}`, borderRadius: 6, padding: "16px 18px" }}>
      {block.musicType === "mp3" && block.musicUrl && <audio ref={audioRef} src={block.musicUrl} preload="metadata" />}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: playing ? BLUSH_D : BLUSH_XL, border: `1px solid ${playing ? BLUSH_D : BLUSH_L}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Music className="w-4 h-4" style={{ color: playing ? "white" : BLUSH_D }} />
        </div>
        <span style={{ fontFamily: SANS, fontSize:11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: playing ? BLUSH_D : MUTED }}>
          {playing ? "Se reda acum" : "Muzica"}
        </span>
      </div>

      {!isActive && editMode && (
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={() => mp3Ref.current?.click()} disabled={uploading}
            style={{ flex: 1, background: BLUSH_XL, border: `1px dashed ${BLUSH_L}`, borderRadius: 8, padding: "12px 0", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            {uploading ? <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: BLUSH_D }} /> : <Upload className="w-5 h-5" style={{ color: BLUSH_D }} />}
            <span style={{ fontFamily: SANS, fontSize:11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: MUTED }}>MP3</span>
          </button>
          <input ref={mp3Ref} type="file" accept="audio/*,.mp3" onChange={e => { const f = e.target.files?.[0]; if (f) handleMp3(f); }} style={{ display: "none" }} />
        </div>
      )}

      {!isActive && !editMode && (
        <div style={{ textAlign: "center", opacity: 0.45, padding: "8px 0" }}>
          <Music className="w-8 h-8" style={{ color: BLUSH_D, display: "block", margin: "0 auto 6px" }} />
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize:14, color: MUTED, margin: 0 }}>Melodia va aparea aici</p>
        </div>
      )}

      {isActive && (
        <div>
          <InlineEdit tag="p" editMode={editMode} value={block.musicTitle || ""} onChange={v => onUpdate({ musicTitle: v })} placeholder="Titlul melodiei..."
            style={{ fontFamily: SERIF, fontSize:16, fontStyle: "italic", color: PLUM, margin: "0 0 2px" }} />
          <InlineEdit tag="p" editMode={editMode} value={block.musicArtist || ""} onChange={v => onUpdate({ musicArtist: v })} placeholder="Artist..."
            style={{ fontFamily: SANS, fontSize:12, color: MUTED, margin: "0 0 10px" }} />

          <div onClick={seek} style={{ height: 4, background: BLUSH_L, borderRadius: 99, marginBottom: 6, cursor: "pointer", position: "relative" }}>
            <div style={{ height: "100%", borderRadius: 99, background: BLUSH_D, width: pct }} />
            <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", left: pct, marginLeft: -5, width: 10, height: 10, borderRadius: "50%", background: BLUSH_D }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontFamily: SANS, fontSize:11, color: MUTED }}>{fmt(progress)}</span>
            <span style={{ fontFamily: SANS, fontSize:11, color: MUTED }}>{duration ? fmt(duration) : "--:--"}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <button type="button" onClick={() => { const a = audioRef.current; if (a) a.currentTime = Math.max(0, a.currentTime - 10); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, opacity: 0.55 }}>
              <SkipBack className="w-4 h-4" style={{ color: BLUSH_D }} />
            </button>
            <button type="button" onClick={toggle} style={{ width: 40, height: 40, borderRadius: "50%", background: BLUSH_D, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {playing ? <Pause className="w-4 h-4" style={{ color: "white" }} /> : <Play className="w-4 h-4" style={{ color: "white", marginLeft: 2 }} />}
            </button>
            <button type="button" onClick={() => { const a = audioRef.current; if (a) a.currentTime = Math.min(duration || a.currentTime + 10, a.currentTime + 10); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, opacity: 0.55 }}>
              <SkipForward className="w-4 h-4" style={{ color: BLUSH_D }} />
            </button>
          </div>

          {editMode && (
            <div style={{ marginTop: 8, display: "flex", justifyContent: "center", gap: 8 }}>
              <button type="button" onClick={() => mp3Ref.current?.click()} style={{ background: BLUSH_XL, border: `1px solid ${BLUSH_L}`, borderRadius: 99, padding: "4px 12px", cursor: "pointer", fontFamily: SANS, fontSize:11, color: MUTED, fontWeight: 700 }}>
                Schimba sursa
              </button>
              <button type="button" onClick={() => { deleteUploadedFile(block.musicUrl); onUpdate({ musicUrl: "", musicType: "none" as any }); setPlaying(false); setProgress(0); setDuration(0); }} style={{ background: "transparent", border: `1px dashed ${BLUSH_L}`, borderRadius: 99, padding: "4px 12px", cursor: "pointer", fontFamily: SANS, fontSize:11, color: MUTED, fontWeight: 700 }}>
                Sterge
              </button>
              <input ref={mp3Ref} type="file" accept="audio/*,.mp3" onChange={e => { const f = e.target.files?.[0]; if (f) handleMp3(f); }} style={{ display: "none" }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

//  Card wrapper (glassmorphism dark) 
const GlassCard: React.FC<{ children:React.ReactNode; style?:React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background:"rgba(255,255,255,0.06)", backdropFilter:"blur(10px)", borderRadius:16,
    border:`1.5px solid ${rgba(BLUSH,0.22)}`, padding:"20px 26px",
    boxShadow:"0 4px 28px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)", ...style }}>
    {children}
  </div>
);

type ClipShape = 'rect'|'rounded'|'rounded-lg'|'squircle'|'circle'|'arch'|'arch-b'|'hexagon'|'diamond'|'triangle'|'star'|'heart'|'diagonal'|'diagonal-r'|'wave-b'|'wave-t'|'wave-both'|'blob'|'blob2'|'blob3'|'blob4';
type MaskEffect = 'fade-b'|'fade-t'|'fade-l'|'fade-r'|'vignette';

function getClipStyle(clip: ClipShape): React.CSSProperties {
  const c: Record<ClipShape, React.CSSProperties> = {
    rect:{borderRadius:0}, rounded:{borderRadius:16}, 'rounded-lg':{borderRadius:32}, squircle:{borderRadius:'30% 30% 30% 30% / 30% 30% 30% 30%'},
    circle:{borderRadius:'50%'}, arch:{borderRadius:'50% 50% 0 0 / 40% 40% 0 0'}, 'arch-b':{borderRadius:'0 0 50% 50% / 0 0 40% 40%'},
    hexagon:{clipPath:'polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%)'}, diamond:{clipPath:'polygon(50% 0%,100% 50%,50% 100%,0% 50%)'},
    triangle:{clipPath:'polygon(50% 0%,100% 100%,0% 100%)'}, star:{clipPath:'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)'},
    heart:{clipPath:'url(#clip-heart)'}, diagonal:{clipPath:'polygon(0 0,100% 0,100% 80%,0 100%)'}, 'diagonal-r':{clipPath:'polygon(0 0,100% 0,100% 100%,0 80%)'},
    'wave-b':{clipPath:'url(#clip-wave-b)'}, 'wave-t':{clipPath:'url(#clip-wave-t)'}, 'wave-both':{clipPath:'url(#clip-wave-both)'},
    blob:{clipPath:'url(#clip-blob)'}, blob2:{clipPath:'url(#clip-blob2)'}, blob3:{clipPath:'url(#clip-blob3)'}, blob4:{clipPath:'url(#clip-blob4)'},
  };
  return c[clip] || {};
}
function getMaskStyle(effects: MaskEffect[]): React.CSSProperties {
  if (!effects.length) return {};
  const layers = effects.map(e => ({'fade-b':'linear-gradient(to bottom,black 40%,transparent 100%)','fade-t':'linear-gradient(to top,black 40%,transparent 100%)','fade-l':'linear-gradient(to left,black 40%,transparent 100%)','fade-r':'linear-gradient(to right,black 40%,transparent 100%)','vignette':'radial-gradient(ellipse 80% 80% at center,black 40%,transparent 100%)'}[e] || 'none'));
  const mask = layers.join(', ');
  return { WebkitMaskImage:mask, maskImage:mask, WebkitMaskComposite:effects.length>1?'source-in':'unset', maskComposite:effects.length>1?'intersect':'unset' };
}
const PhotoClipDefs: React.FC = () => (
  <svg width="0" height="0" style={{position:'absolute',overflow:'hidden',pointerEvents:'none'}}>
    <defs>
      <clipPath id="clip-wave-b" clipPathUnits="objectBoundingBox"><path d="M0,0 L1,0 L1,0.78 Q0.875,0.65 0.75,0.78 Q0.625,0.91 0.5,0.78 Q0.375,0.65 0.25,0.78 Q0.125,0.91 0,0.78 Z"/></clipPath>
      <clipPath id="clip-wave-t" clipPathUnits="objectBoundingBox"><path d="M0,0.22 Q0.125,0.09 0.25,0.22 Q0.375,0.35 0.5,0.22 Q0.625,0.09 0.75,0.22 Q0.875,0.35 1,0.22 L1,1 L0,1 Z"/></clipPath>
      <clipPath id="clip-wave-both" clipPathUnits="objectBoundingBox"><path d="M0,0.22 Q0.125,0.09 0.25,0.22 Q0.375,0.35 0.5,0.22 Q0.625,0.09 0.75,0.22 Q0.875,0.35 1,0.22 L1,0.78 Q0.875,0.65 0.75,0.78 Q0.625,0.91 0.5,0.78 Q0.375,0.65 0.25,0.78 Q0.125,0.91 0,0.78 Z"/></clipPath>
      <clipPath id="clip-heart" clipPathUnits="objectBoundingBox"><path d="M0.5,0.85 C0.5,0.85 0.05,0.55 0.05,0.3 C0.05,0.12 0.18,0.05 0.3,0.1 C0.4,0.14 0.5,0.25 0.5,0.25 C0.5,0.25 0.6,0.14 0.7,0.1 C0.82,0.05 0.95,0.12 0.95,0.3 C0.95,0.55 0.5,0.85 0.5,0.85Z"/></clipPath>
      <clipPath id="clip-blob" clipPathUnits="objectBoundingBox"><path d="M0.5,0.03 C0.72,0.01 0.95,0.14 0.97,0.38 C0.99,0.58 0.88,0.78 0.72,0.88 C0.56,0.98 0.35,0.99 0.2,0.88 C0.05,0.77 -0.02,0.55 0.04,0.36 C0.1,0.17 0.28,0.05 0.5,0.03Z"/></clipPath>
      <clipPath id="clip-blob2" clipPathUnits="objectBoundingBox"><path d="M0.75,-0.276 C0.831,-0.229 0.911,-0.158 0.921,-0.078 C0.93,0.002 0.869,0.09 0.808,0.161 C0.747,0.232 0.685,0.285 0.611,0.316 C0.538,0.347 0.453,0.356 0.389,0.324 C0.326,0.292 0.285,0.22 0.233,0.147 C0.181,0.073 0.119,-0.003 0.113,-0.086 C0.107,-0.169 0.157,-0.259 0.231,-0.307 C0.305,-0.355 0.402,-0.362 0.493,-0.353 C0.584,-0.345 0.668,-0.322 0.75,-0.276Z" transform="translate(0.5,0.5) scale(0.9)"/></clipPath>
      <clipPath id="clip-blob3" clipPathUnits="objectBoundingBox"><path d="M0.5,0.05 C0.65,0.02 0.85,0.1 0.92,0.28 C0.99,0.46 0.93,0.68 0.8,0.82 C0.67,0.96 0.46,1.0 0.3,0.93 C0.14,0.86 0.02,0.68 0.01,0.5 C0.0,0.32 0.1,0.14 0.25,0.07 C0.33,0.03 0.42,0.07 0.5,0.05Z"/></clipPath>
      <clipPath id="clip-blob4" clipPathUnits="objectBoundingBox"><path d="M0.18,0.08 C0.32,0.01 0.54,0.0 0.68,0.08 C0.82,0.16 0.96,0.32 0.97,0.5 C0.98,0.68 0.86,0.86 0.7,0.93 C0.54,1.0 0.32,0.97 0.18,0.88 C0.04,0.79 -0.04,0.62 0.02,0.45 C0.07,0.28 0.04,0.15 0.18,0.08Z"/></clipPath>
    </defs>
  </svg>
);

interface PhotoPlaceholderProps {
  aspectRatio: string; photoClip: ClipShape; photoMasks: MaskEffect[];
  initial1?: string; initial2?: string; variant?: number; editMode: boolean; onClick: () => void;
}
const PhotoPlaceholder: React.FC<PhotoPlaceholderProps> = ({aspectRatio,photoClip,photoMasks,initial1='S',initial2='A',variant=0,editMode,onClick}) => {
  const pads: Record<string,string> = {'1:1':'100%','4:3':'75%','3:4':'133%','16:9':'56.25%','free':'75%'};
  const pt = pads[aspectRatio] || '75%';
  const g = [[BLUSH_L, BLUSH], [BLUSH_XL, BLUSH_L], [BLUSH, BLUSH_D], [BLUSH_XL, BLUSH]][variant%4];
  const gId = `bb-ph-${variant}`;
  return (
    <div style={{position:'relative',paddingTop:pt,cursor:editMode?'pointer':'default',...getClipStyle(photoClip),...getMaskStyle(photoMasks),overflow:'hidden'}} onClick={editMode?onClick:undefined}>
      <div style={{position:'absolute',inset:0}}>
        <svg width="100%" height="100%" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id={gId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={g[0]}/><stop offset="100%" stopColor={g[1]}/>
            </linearGradient>
          </defs>
          <rect width="400" height="500" fill={`url(#${gId})`}/>
          <rect x="18" y="18" width="364" height="464" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1"/>
          {[0,72,144,216,288].map((a,i)=>{const r=Math.PI*a/180;const cx=200+Math.cos(r)*110;const cy=250+Math.sin(r)*110;return <ellipse key={i} cx={cx} cy={cy} rx="14" ry="22" fill="rgba(255,255,255,0.18)" transform={`rotate(${a},${cx},${cy})`}/>;})}
          <text x="200" y="215" fontFamily="Bodoni Moda,Didot,Playfair Display,Georgia,serif" fontSize="100" fill="rgba(255,255,255,0.9)" textAnchor="middle" fontStyle="italic">{(initial1||'S')[0].toUpperCase()}</text>
          <text x="200" y="268" fontFamily="Cormorant Garamond,Georgia,serif" fontSize="36" fill="rgba(255,255,255,0.6)" textAnchor="middle" fontStyle="italic">&amp;</text>
          <text x="200" y="330" fontFamily="Bodoni Moda,Didot,Playfair Display,Georgia,serif" fontSize="100" fill="rgba(255,255,255,0.9)" textAnchor="middle" fontStyle="italic">{(initial2||'A')[0].toUpperCase()}</text>
          <line x1="150" y1="345" x2="250" y2="345" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8"/>
          {editMode && <><rect x="130" y="390" width="140" height="36" rx="18" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/><text x="200" y="413" fontFamily="DM Sans,sans-serif" fontSize="12" fill="white" textAnchor="middle" fontWeight="600" opacity="0.9">+ Adauga fotografie</text></>}
        </svg>
      </div>
    </div>
  );
};

interface PhotoBlockProps {
  imageData: string|undefined; altText?: string; editMode: boolean;
  onUpload:(data:string)=>void; onRemove:()=>void;
  onClipChange:(c:ClipShape)=>void; onMasksChange:(m:MaskEffect[])=>void; onRatioChange:(r:'1:1'|'4:3'|'3:4'|'16:9'|'free')=>void;
  aspectRatio?:'1:1'|'4:3'|'3:4'|'16:9'|'free'; photoClip?:ClipShape; photoMasks?:MaskEffect[];
  placeholder?:string; placeholderInitial1?:string; placeholderInitial2?:string; placeholderVariant?:number;
}
const PhotoBlock: React.FC<PhotoBlockProps> = ({imageData,altText,editMode,onUpload,onRemove,onClipChange,onMasksChange,onRatioChange,aspectRatio='free',photoClip='rect',photoMasks=[],placeholder='Adauga fotografie',placeholderInitial1,placeholderInitial2,placeholderVariant=0}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging,setDragging] = useState(false);
  const [uploading,setUploading] = useState(false);
  const [uploadErr,setUploadErr] = useState('');
  const pads:Record<string,string> = {'1:1':'100%','4:3':'75%','3:4':'133%','16:9':'56.25%','free':'66.6%'};
  const pt = pads[aspectRatio];
  const combined:React.CSSProperties = {...getClipStyle(photoClip),...getMaskStyle(photoMasks)};

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { setUploadErr('Doar imagini sunt acceptate.'); return; }
    if (file.size > 12*1024*1024) { setUploadErr('Fisierul depaseste 12 MB.'); return; }
    setUploadErr(''); setUploading(true);
    deleteUploadedFile(imageData);
    try {
      const form = new FormData(); form.append('file', file);
      const _s = JSON.parse(localStorage.getItem('weddingPro_session')||'{}');
      const res = await fetch(`${API_URL}/upload`,{method:'POST',headers:{Authorization:`Bearer ${_s?.token||''}`},body:form});
      if (!res.ok) { const e=await res.json(); throw new Error(e.error||'Upload esuat.'); }
      const {url} = await res.json(); onUpload(url);
    } catch(e:any) { setUploadErr(e.message||'Eroare upload.'); }
    finally { setUploading(false); }
  };

  const imgSrc = imageData||undefined;
  const isDemoPhoto = !!imageData && imageData.includes('picsum.photos');
  const handleRemove = () => { deleteUploadedFile(imageData); onRemove(); };

  if (imgSrc) {
    return (
      <div>
        <PhotoClipDefs/>
        {uploading && <div style={{position:'relative',paddingTop:pt,background:BLUSH_XL,...combined}}><div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:10}}><div style={{width:32,height:32,border:`3px solid ${BLUSH_L}`,borderTop:`3px solid ${BLUSH_D}`,borderRadius:'50%',animation:'bb-spin 0.8s linear infinite'}}/><span style={{fontFamily:SANS,fontSize:13,fontWeight:700,color:BLUSH_D}}>Se incarca...</span></div></div>}
        {!uploading && (
          <div style={{position:'relative'}}>
            <div style={{position:'relative',paddingTop:pt,overflow:'hidden',...combined}}>
              <img src={imgSrc} alt={altText||''} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
            </div>
            {editMode && (
              <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',gap:8,opacity:0,transition:'opacity 0.2s',...combined}} onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.opacity='1'} onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.opacity='0'}>
                <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.42)'}}/>
                <button type="button" onClick={()=>fileRef.current?.click()} style={{position:'relative',zIndex:1,display:'flex',alignItems:'center',gap:5,padding:'7px 14px',borderRadius:99,background:'white',border:'none',cursor:'pointer',fontFamily:SANS,fontSize:13,fontWeight:700,color:PLUM}}><Camera className="w-3.5 h-3.5"/> Schimba</button>
                <button type="button" onClick={handleRemove} style={{position:'relative',zIndex:1,display:'flex',alignItems:'center',gap:5,padding:'7px 14px',borderRadius:99,background:'rgba(220,40,40,0.88)',border:'none',cursor:'pointer',fontFamily:SANS,fontSize:13,fontWeight:700,color:'white'}}><Trash2 className="w-3.5 h-3.5"/> Sterge</button>
                {isDemoPhoto && <div style={{position:'absolute',bottom:10,left:'50%',transform:'translateX(-50%)',background:'rgba(0,0,0,0.7)',color:'white',borderRadius:99,padding:'4px 14px',fontFamily:SANS,fontSize:11,fontWeight:700,whiteSpace:'nowrap',zIndex:2}}> Fotografie demo</div>}
              </div>
            )}
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0];if(f)handleFile(f);e.target.value='';}} style={{display:'none'}}/>
      </div>
    );
  }

  return (
    <div style={{position:'relative'}}>
      <PhotoClipDefs/>
      <PhotoPlaceholder aspectRatio={aspectRatio} photoClip={photoClip} photoMasks={photoMasks} initial1={placeholderInitial1} initial2={placeholderInitial2} variant={placeholderVariant} editMode={editMode} onClick={()=>fileRef.current?.click()}/>
      {editMode && (
        <div style={{position:'absolute',inset:0,opacity:0,transition:'opacity 0.2s',display:'flex',alignItems:'center',justifyContent:'center'}} onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.opacity='1'} onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.opacity='0'} onClick={()=>fileRef.current?.click()} onDragOver={e=>{e.preventDefault();setDragging(true);(e.currentTarget as HTMLDivElement).style.opacity='1';}} onDragLeave={e=>{setDragging(false);(e.currentTarget as HTMLDivElement).style.opacity='0';}} onDrop={e=>{e.preventDefault();setDragging(false);(e.currentTarget as HTMLDivElement).style.opacity='0';const f=e.dataTransfer.files?.[0];if(f)handleFile(f);}}>
          <div style={{position:'absolute',inset:0,background:dragging?'rgba(201,112,144,0.5)':'rgba(0,0,0,0.35)',transition:'background 0.2s',...getClipStyle(photoClip)}}/>
          <div style={{position:'relative',zIndex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
            <div style={{width:48,height:48,borderRadius:'50%',background:'rgba(255,255,255,0.2)',border:'2px solid rgba(255,255,255,0.6)',display:'flex',alignItems:'center',justifyContent:'center'}}><Upload className="w-5 h-5" style={{color:'white'}}/></div>
            <span style={{fontFamily:SANS,fontSize:13,fontWeight:700,color:'white',textShadow:'0 1px 4px rgba(0,0,0,0.5)'}}>{dragging?'Elibereaza':'Inlocuieste fotografia'}</span>
          </div>
        </div>
      )}
      {uploading && <div style={{position:'absolute',inset:0,background:'rgba(253,240,242,0.88)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:10,...getClipStyle(photoClip)}}><div style={{width:32,height:32,border:`3px solid ${BLUSH_L}`,borderTop:`3px solid ${BLUSH_D}`,borderRadius:'50%',animation:'bb-spin 0.8s linear infinite'}}/><span style={{fontFamily:SANS,fontSize:13,fontWeight:700,color:BLUSH_D}}>Se incarca...</span></div>}
      {uploadErr && <div style={{position:'absolute',bottom:8,left:'50%',transform:'translateX(-50%)',background:'rgba(200,40,40,0.9)',color:'white',borderRadius:99,padding:'4px 14px',fontFamily:SANS,fontSize:12,fontWeight:700,whiteSpace:'nowrap'}}>{uploadErr}</div>}
      <input ref={fileRef} type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0];if(f)handleFile(f);}} style={{display:'none'}}/>
    </div>
  );
};

//  Main Template 
export type GardenRomanticProps = InvitationTemplateProps & {
  editMode?: boolean;
  onProfileUpdate?: (patch: Record<string, any>) => void;
  onBlocksUpdate?: (blocks: InvitationBlock[]) => void;
  onBlockSelect?: (block: InvitationBlock | null, idx: number, textKey?: string, textLabel?: string) => void;
  selectedBlockId?: string;
};

const GardenRomanticTemplate: React.FC<GardenRomanticProps> = ({
  data, onOpenRSVP, editMode = false, introPreview = false, onProfileUpdate, onBlocksUpdate,
  onBlockSelect, selectedBlockId,
}) => {
  const { profile, guest } = data;
  const activeTheme = getGardenTheme((profile as any).colorTheme);
  BLUSH = activeTheme.primary;
  BLUSH_D = activeTheme.accent;
  BLUSH_L = activeTheme.secondary;
  BLUSH_XL = activeTheme.surface;
  PLUM = activeTheme.text;
  MUTED = activeTheme.muted || activeTheme.text;
  BG_0 = mixHex(activeTheme.text, "#07080d", 0.78);
  BG_1 = mixHex(activeTheme.primary, BG_0, 0.45);
  BG_2 = mixHex(activeTheme.secondary, BG_0, 0.52);
  BG_3 = mixHex(activeTheme.accent, BG_0, 0.6);
  LEAF = mixHex(activeTheme.secondary, "#4d6a4d", 0.55);
  LEAF_SOFT = mixHex(activeTheme.secondary, "#7fa37a", 0.45);
  ACCENT_TEXT = pickReadableColor(mixHex(activeTheme.primary, activeTheme.accent, 0.35), BG_0);
  const isPublicInvite = !!data.isPublic;
  const guestDisplayName = isPublicInvite ? "Drag invitat" : (guest?.name || "Nume Invitat");

  const [showIntro, setShowIntro]           = useState(!editMode || introPreview);
  const [contentVisible, setContentVisible] = useState(editMode && !introPreview);

  useEffect(() => {
    if (introPreview) {
      setShowIntro(false);
      setContentVisible(true);
      return;
    }
    if (editMode) {
      setShowIntro(false);
      setContentVisible(true);
      return;
    }
    setShowIntro(true);
    setContentVisible(false);
  }, [editMode, introPreview]);

  useEffect(() => {
    if (editMode) {
      ['overflow','position','top','left','right'].forEach(p => (document.body.style as any)[p] = '');
      return;
    }
    if (showIntro) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.inset    = '0';
    } else {
      ['overflow','position','top','left','right'].forEach(p => (document.body.style as any)[p] = '');
    }
    return () => { ['overflow','position','top','left','right'].forEach(p => (document.body.style as any)[p] = ''); };
  }, [showIntro, editMode]);

  const safeJSON = (s:string|undefined, fb:any) => { try { return s ? JSON.parse(s) : fb; } catch { return fb; } };
  const cloneDefaultBlocks = (): InvitationBlock[] => JSON.parse(JSON.stringify(CASTLE_DEFAULT_BLOCKS));
  const withDefaultStructure = (raw: InvitationBlock[] | null): InvitationBlock[] => {
    if (!Array.isArray(raw) || raw.length === 0) return cloneDefaultBlocks();
    return raw;
  };

  const [blocks, setBlocks]         = useState<InvitationBlock[]>(() => withDefaultStructure(safeJSON(profile.customSections, null)));
  const [godparents, setGodparents] = useState<any[]>(() => safeJSON(profile.godparents, []));
  const [parentsData, setParentsData] = useState<any>(() => safeJSON(profile.parents, {}));
  const [openInsertAt, setOpenInsertAt] = useState<number | null>(null);

  useEffect(() => {
    const parsed = safeJSON(profile.customSections, null) as InvitationBlock[] | null;
    setBlocks(withDefaultStructure(parsed));
  }, [profile.customSections]);
  useEffect(() => { setGodparents(safeJSON(profile.godparents, [])); }, [profile.godparents]);
  useEffect(() => { setParentsData(safeJSON(profile.parents, {})); }, [profile.parents]);

  const countdown = useCountdown(profile.weddingDate || '');

  // Debounced updates
  const _pq = useRef<Record<string,any>>({});
  const _pt = useRef<ReturnType<typeof setTimeout>|null>(null);
  const _bt = useRef<ReturnType<typeof setTimeout>|null>(null);

  const upProfile = useCallback((field:string, value:any) => {
    _pq.current = { ..._pq.current, [field]:value };
    if (_pt.current) clearTimeout(_pt.current);
    _pt.current = setTimeout(() => { onProfileUpdate?.(_pq.current); _pq.current = {}; }, 500);
  }, [onProfileUpdate]);

  const debBlocks = useCallback((nb:InvitationBlock[]) => {
    if (_bt.current) clearTimeout(_bt.current);
    _bt.current = setTimeout(() => onBlocksUpdate?.(nb), 500);
  }, [onBlocksUpdate]);

  const updBlock = useCallback((idx:number, patch:Partial<InvitationBlock>) => {
    setBlocks(prev => { const nb=prev.map((b,i)=>i===idx?{...b,...patch}:b); debBlocks(nb); return nb; });
  }, [debBlocks]);

  const movBlock = useCallback((idx:number, dir:-1|1) => {
    setBlocks(prev => { const nb=[...prev]; const to=idx+dir; if(to<0||to>=nb.length) return prev; [nb[idx],nb[to]]=[nb[to],nb[idx]]; onBlocksUpdate?.(nb); return nb; });
  }, [onBlocksUpdate]);

  const delBlock = useCallback((idx:number) => {
    setBlocks(prev => { const nb=prev.filter((_,i)=>i!==idx); onBlocksUpdate?.(nb); return nb; });
  }, [onBlocksUpdate]);

  const addBlock = useCallback((type:string, def:any) => {
    setBlocks(prev => { const nb=[...prev,{id:Date.now().toString(),type:type as any,show:true,...def}]; onBlocksUpdate?.(nb); return nb; });
  }, [onBlocksUpdate]);

  const addBlockAt = useCallback((afterIdx:number, type:string, def:any) => {
    setBlocks(prev => {
      const at = Math.max(-1, Math.min(afterIdx, prev.length - 1));
      const item = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, type: type as any, show: true, ...def } as InvitationBlock;
      const nb = [...prev.slice(0, at + 1), item, ...prev.slice(at + 1)];
      onBlocksUpdate?.(nb);
      return nb;
    });
  }, [onBlocksUpdate]);

  const updGodparent = (i:number, f:'godfather'|'godmother', v:string) => {
    setGodparents(prev => { const ng=prev.map((g,j)=>j===i?{...g,[f]:v}:g); upProfile('godparents',JSON.stringify(ng)); return ng; });
  };
  const addGodparent = () => setGodparents(prev => { const ng=[...prev,{godfather:'',godmother:''}]; upProfile('godparents',JSON.stringify(ng)); return ng; });
  const delGodparent = (i:number) => setGodparents(prev => { const ng=prev.filter((_,j)=>j!==i); upProfile('godparents',JSON.stringify(ng)); return ng; });
  const updParent = (field:string, val:string) => setParentsData((prev:any) => { const np={...prev,[field]:val}; upProfile('parents',JSON.stringify(np)); return np; });

  const welcomeText     = profile.welcomeText?.trim()     || 'va invita la nunta lor';
  const legacyInvitationText = `${String(profile.celebrationText || '').trim()}`.trim();
  const invitationText = (String((profile as any).invitationText || legacyInvitationText || 'Va invita cu drag la nuntii noastre')).trim() || 'Va invita cu drag la nuntii noastre';
  const rsvpText        = profile.rsvpButtonText?.trim()  || 'Confirma Prezenta';
  const showRsvp        = profile.showRsvpButton !== false;
  const isBaptism       = profile.eventType === 'baptism' || profile.eventType === 'kids';
  const displayBlocks   = editMode ? blocks : blocks.filter(b => b.show !== false);
  const hasRsvpBlock    = blocks.some(b => b.type === 'rsvp' && (editMode || b.show !== false));
  const getTimelineItems = () => safeJSON(profile.timeline, []);
  const updateTimeline = (next: any[]) => {
    upProfile("timeline", JSON.stringify(next));
    upProfile("showTimeline", true);
  };
  const addTimelineItem = (preset: { icon?: string; title?: string } | null) => {
    const next = [
      ...getTimelineItems(),
      {
        id: Date.now().toString(),
        title: preset?.title || "",
        time: "",
        location: "",
        icon: preset?.icon || "party",
        notice: "",
      },
    ];
    updateTimeline(next);
  };
  const updateTimelineItem = (id: string, patch: any) => {
    updateTimeline(getTimelineItems().map((t: any) => (t.id === id ? { ...t, ...patch } : t)));
  };
  const removeTimelineItem = (id: string) => {
    updateTimeline(getTimelineItems().filter((t: any) => t.id !== id));
  };
  const BLOCK_TYPES: { type: string; label: string; def: any }[] = [
    { type: 'photo', label: 'Foto', def: { imageData: undefined, altText: '', aspectRatio: '3:4', photoClip: 'arch', photoMasks: ['fade-b'] } },
    { type: 'text', label: 'Text', def: { content: 'O poveste frumoasa incepe...' } },
    { type: 'location', label: 'Locatie', def: { label: 'Locatie', time: '17:00', locationName: 'Nume locatie', locationAddress: 'Adresa', wazeLink: '' } },
    { type: 'calendar', label: 'Calendar', def: {} },
    { type: 'countdown', label: 'Countdown', def: { countdownTitle: 'Timp ramas pana la marele eveniment' } },
    { type: 'timeline', label: 'Cronologie', def: {} },
    { type: 'music', label: 'Muzica', def: { musicTitle: '', musicArtist: '', musicType: 'none' } },
    { type: 'gift', label: 'Cadouri', def: { sectionTitle: 'Sugestie cadou', content: '', iban: '', ibanName: '' } },
    { type: 'whatsapp', label: 'WhatsApp', def: { label: 'WhatsApp', content: '0700000000' } },
    { type: 'rsvp', label: 'RSVP', def: { label: 'Confirma Prezenta' } },
    { type: 'divider', label: 'Linie', def: {} },
    { type: 'family', label: 'Familie', def: { label: 'Familie', content: 'Cu drag si recunostinta', members: JSON.stringify([{ name1: 'Mama', name2: 'Tata' }]) } },
    { type: 'date', label: 'Data', def: { content: '' } },
    { type: 'description', label: 'Descriere', def: { content: 'O scurta descriere...' } },
    { type: 'title', label: 'Titlu', def: { content: 'Titlu sectiune' } },
    { type: 'godparents', label: 'Nasi', def: { sectionTitle: 'Nasii Nostri', content: '' } },
    { type: 'parents', label: 'Parinti', def: { sectionTitle: 'Parintii Nostri', content: '' } },
    { type: 'spacer', label: 'Spatiu', def: {} },
  ];

  const handleInsertAt = useCallback((afterIdx:number, type:string, def:any) => {
    if (type === "timeline") {
      if (getTimelineItems().length === 0) addTimelineItem(null);
      addBlockAt(afterIdx, type, def);
      setOpenInsertAt(null);
      return;
    }
    addBlockAt(afterIdx, type, def);
    setOpenInsertAt(null);
  }, [addBlockAt]);

  const l1    = (profile.partner1Name || 'A').charAt(0).toUpperCase();
  const l2    = isBaptism ? '' : (profile.partner2Name || 'M').charAt(0).toUpperCase();
  const name1 = profile.partner1Name || 'Alina';
  const name2 = profile.partner2Name || 'Mihai';

  const formattedDate = profile.weddingDate
    ? new Date(profile.weddingDate).toLocaleDateString('ro-RO', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
    : 'Data Evenimentului';
  const dateStr = formattedDate;

  const sep = (
    <div style={{ display:"flex", flexDirection:"column", gap:7, alignItems:"center", paddingBottom:22, flexShrink:0 }}>
      <div style={{ width:3.5, height:3.5, borderRadius:"50%", background:rgba(BLUSH,0.45) }}/>
      <div style={{ width:3.5, height:3.5, borderRadius:"50%", background:rgba(BLUSH,0.45) }}/>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes gr-star   {0%,100%{opacity:.15}50%{opacity:.45}}
        @keyframes gr-petal  {0%{transform:translateY(0) rotate(0deg) translateX(0);opacity:.7}100%{transform:translateY(110vh) rotate(540deg) translateX(40px);opacity:0}}
        @keyframes gr-draw   {from{stroke-dashoffset:220}to{stroke-dashoffset:0}}
        @keyframes gr-flicker{0%,100%{opacity:1}50%{opacity:0.6}}
        @keyframes gr-cd-pulse{0%,100%{transform:scale(1);opacity:.75}50%{transform:scale(1.7);opacity:1}}
        @keyframes bb-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
      `}</style>

      {showIntro && (
        <GardenIntro l1={l1} l2={l2} name1={name1} name2={name2}
          onDone={() => { window.scrollTo(0,0); setShowIntro(false); setTimeout(()=>{ window.scrollTo(0,0); setContentVisible(true); },60); }}/>
      )}

      {editMode && (
        <div className="sticky top-2 z-20 mx-auto mb-2 flex w-fit max-w-full items-center gap-2 rounded-full px-4 py-1.5 shadow-xl text-[10px] font-bold pointer-events-none select-none"
          style={{ background:rgba(BG_1,0.92), border:`1px solid ${rgba(BLUSH,0.3)}`, color:ACCENT_TEXT, backdropFilter:"blur(8px)" }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background:BLUSH }}/>
          <span className="uppercase tracking-widest">Editare Directa</span>
          <span className="font-normal" style={{ color:rgba(ACCENT_TEXT,0.5) }}>click pe orice text</span>
        </div>
      )}

      <div style={{
        minHeight:"100vh",
        background:`linear-gradient(180deg,${BG_0} 0%,${BG_1} 30%,${BG_2} 65%,${BG_3} 100%)`,
        display:"flex", alignItems:"flex-start", justifyContent:"center",
        padding:`${editMode?16:0}px 16px 48px`, fontFamily:SANS,
        position:"relative", overflow:"hidden",
        opacity:contentVisible?1:0, transform:contentVisible?"translateY(0)":"translateY(14px)",
        transition:"opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s",
      }}>

        {/* Ambient glows */}
        <div style={{ position:"fixed", top:"8%", left:"5%", width:360, height:360, borderRadius:"50%",
          background:`radial-gradient(circle,${rgba(BLUSH,0.12)} 0%,transparent 70%)`, pointerEvents:"none", zIndex:0 }}/>
        <div style={{ position:"fixed", bottom:"12%", right:"5%", width:300, height:300, borderRadius:"50%",
          background:`radial-gradient(circle,${rgba(LEAF,0.1)} 0%,transparent 70%)`, pointerEvents:"none", zIndex:0 }}/>

        <div style={{ width:"100%", maxWidth:440, position:"relative", zIndex:1 }}>

          {/*  HERO CARD  */}
          <div style={{
            background:"rgba(255,255,255,0.04)", backdropFilter:"blur(16px)", borderRadius:24,
            border:`1.5px solid ${rgba(BLUSH,0.15)}`, overflow:"hidden", position:"relative",
            boxShadow:"0 24px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}>
            <GardenHero/>
            <div style={{ position:"relative", zIndex:1, textAlign:"center", padding:"306px 32px 40px" }}>

              {profile.showWelcomeText && (
                <InlineEdit tag="p" editMode={editMode} value={welcomeText} onChange={v=>upProfile('welcomeText',v)}
                  placeholder="Text intro..." multiline
                  style={{ fontFamily:SERIF, fontSize:16, fontStyle:"italic", color:"rgba(255,255,255,0.45)",
                    margin:"0 0 18px", lineHeight:1.7, display:"block" }}/>
              )}

              {isBaptism ? (
                <InlineEdit tag="h1" editMode={editMode} value={profile.partner1Name||''} onChange={v=>upProfile('partner1Name',v)}
                  placeholder="Prenume"
                  style={{ fontFamily:SERIF, fontSize:62, fontWeight:300, lineHeight:1, color:"white",
                    display:"block", margin:"0 0 6px", letterSpacing:1,
                    textShadow:`0 0 50px ${rgba(BLUSH,0.4)}` }}/>
              ) : (
                <div style={{ margin:"0 0 6px" }}>
                  <InlineEdit tag="h1" editMode={editMode} value={profile.partner1Name||''} onChange={v=>upProfile('partner1Name',v)}
                    placeholder="Alina"
                    style={{ fontFamily:SERIF, fontSize:54, fontWeight:300, lineHeight:1.05, color:"white",
                      display:"block", margin:0, letterSpacing:2,
                      textShadow:`0 0 50px ${rgba(BLUSH,0.35)}` }}/>
                  <div style={{ display:"flex", alignItems:"center", gap:18, margin:"10px 0" }}>
                    <div style={{ flex:1, height:"0.5px", background:rgba(BLUSH,0.2) }}/>
                    <span style={{ fontFamily:SERIF, fontSize:32, fontStyle:"italic", color:rgba(BLUSH_D,0.7), lineHeight:1 }}>&</span>
                    <div style={{ flex:1, height:"0.5px", background:rgba(BLUSH,0.2) }}/>
                  </div>
                  <InlineEdit tag="h1" editMode={editMode} value={profile.partner2Name||''} onChange={v=>upProfile('partner2Name',v)}
                    placeholder="Mihai"
                    style={{ fontFamily:SERIF, fontSize:54, fontWeight:300, lineHeight:1.05, color:"white",
                      display:"block", margin:0, letterSpacing:2,
                      textShadow:`0 0 50px ${rgba(BLUSH,0.35)}` }}/>
                </div>
              )}

              {profile.showCelebrationText && (
                <InlineEdit tag="p" editMode={editMode} value={invitationText} onChange={v=>upProfile('invitationText',v)}
                  placeholder="Text invitatie..."
                  style={{ fontFamily:SERIF, fontSize:16, fontStyle:"italic", color:rgba(ACCENT_TEXT,0.55),
                    margin:"12px 0 0", display:"block" }}/>
              )}

              <div style={{ margin:"24px 0" }}><FloralDivider/></div>

              <p style={{ fontFamily:SERIF, fontSize:17, color:"rgba(255,255,255,0.6)",
                letterSpacing:"0.06em", textTransform:"capitalize", margin:"0 0 20px" }}>{formattedDate}</p>

              {/* Countdown */}
              {profile.showCountdown && profile.weddingDate && !countdown.expired && (
                <div style={{ margin:"0 0 24px" }}>
                  <div style={{ display:"flex", justifyContent:"center", marginBottom:14 }}>
                    <span style={{ fontFamily:SANS, fontSize:10, fontWeight:700, letterSpacing:"0.42em",
                      textTransform:"uppercase", color:rgba(ACCENT_TEXT,0.65),
                      padding:"5px 16px", borderRadius:99,
                      background:rgba(BLUSH,0.08), border:`1.5px solid ${rgba(BLUSH,0.3)}` }}>
                       Timp ramas
                    </span>
                  </div>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"center", gap:6 }}>
                    {[countdown.days, countdown.hours, countdown.minutes, countdown.seconds].map((v,i) => (
                      <React.Fragment key={i}>
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:7 }}>
                          <FlipDigit value={v}/>
                          <span style={{ fontFamily:SERIF, fontSize:13, fontStyle:"italic", color:rgba(ACCENT_TEXT,0.55) }}>
                            {['Zile','Ore','Min','Sec'][i]}
                          </span>
                        </div>
                        {i < 3 && sep}
                      </React.Fragment>
                    ))}
                  </div>
                  <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:5, marginTop:11 }}>
                    <div style={{ width:5, height:5, borderRadius:"50%", background:BLUSH,
                      animation:"gr-cd-pulse 2s ease-in-out infinite", opacity:0.75 }}/>
                    <span style={{ fontFamily:SANS, fontSize:10, fontWeight:700, letterSpacing:"0.3em",
                      textTransform:"uppercase", color:rgba(ACCENT_TEXT,0.35) }}>live</span>
                  </div>
                </div>
              )}

              <div style={{ margin:"0 0 20px" }}><FloralDivider/></div>

              {/* Guest badge */}
              <div style={{ background:rgba(BLUSH,0.08), border:`1.5px solid ${rgba(BLUSH,0.25)}`,
                borderRadius:12, padding:"14px 20px" }}>
                <p style={{ fontFamily:SANS, fontSize:11, fontWeight:700, letterSpacing:"0.4em",
                  textTransform:"uppercase", color:rgba(ACCENT_TEXT,0.5), margin:"0 0 6px" }}>Draga</p>
                <p style={{ fontFamily:SERIF, fontSize:24, fontWeight:300, color:"white", margin:0, letterSpacing:1 }}>
                  {guestDisplayName}
                </p>
              </div>
            </div>
          </div>

          <LightString/>

          {/*  BLOCURI  */}
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
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
              const realIdx   = blocks.indexOf(block);

              return (
                <div key={block.id} className="group/insert">
                  <div
                    className={cn("relative group/block", !isVisible && editMode && "opacity-30")}
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

                    <BlockStyleProvider
                      value={{
                        blockId: block.id,
                        textStyles: block.textStyles,
                        onTextSelect: (textKey, textLabel) => onBlockSelect?.(block, realIdx, textKey, textLabel),
                        fontFamily: block.blockFontFamily,
                        fontSize: block.blockFontSize,
                        fontWeight: block.blockFontWeight,
                        fontStyle: block.blockFontStyle,
                        letterSpacing: block.blockLetterSpacing,
                        lineHeight: block.blockLineHeight,
                        textColor: block.textColor && block.textColor !== 'transparent' ? block.textColor : undefined,
                        textAlign: block.blockAlign,
                      } as BlockStyle}
                    >
                      {block.type === 'location' && (
                        <LocCard block={block} editMode={editMode} onUpdate={p => updBlock(realIdx, p)} />
                      )}

                      {block.type === 'photo' && (
                        <PhotoBlock
                          imageData={block.imageData}
                          altText={block.altText}
                          editMode={editMode}
                          onUpload={data => updBlock(realIdx, { imageData: data })}
                          onRemove={() => updBlock(realIdx, { imageData: undefined })}
                          onRatioChange={r => updBlock(realIdx, { aspectRatio: r })}
                          onClipChange={cl => updBlock(realIdx, { photoClip: cl as any })}
                          onMasksChange={ms => updBlock(realIdx, { photoMasks: ms as any })}
                          aspectRatio={(block.aspectRatio as any) || 'free'}
                          photoClip={((block as any).photoClip as ClipShape) || 'rect'}
                          photoMasks={((block as any).photoMasks as MaskEffect[]) || []}
                          placeholderInitial1={(profile.partner1Name || 'A')[0]}
                          placeholderInitial2={(profile.partner2Name || 'M')[0]}
                          placeholderVariant={realIdx % 4}
                        />
                      )}

                      {block.type === 'godparents' && (
                        <GlassCard>
                          <InlineEdit tag="p" editMode={editMode} value={block.sectionTitle || 'Nasii Nostri'} onChange={v => updBlock(realIdx, { sectionTitle: v })} placeholder="Titlu..."
                            style={{ fontFamily: SANS, fontSize:10, fontWeight: 700, letterSpacing: "0.45em", textTransform: "uppercase",
                              color:rgba(ACCENT_TEXT,0.55), margin: "0 0 10px", display: "block", textAlign: "center" }} />
                          <InlineEdit tag="p" editMode={editMode} value={block.content || ''} onChange={v => updBlock(realIdx, { content: v })} placeholder="Text introductiv..." multiline
                            style={{ fontFamily: SERIF, fontSize:15, fontStyle: "italic", color:rgba(ACCENT_TEXT,0.45),
                              margin: "0 0 14px", display: "block", textAlign: "center" }} />
                          <div style={{ display: "flex", flexDirection: "column", gap: 8, textAlign: "center" }}>
                            {godparents.map((g: any, i: number) => (
                              <div key={i} className={cn("flex items-center justify-center gap-2", editMode && "group/gp")}>
                                <InlineEdit tag="span" editMode={editMode} value={g.godfather || ''} onChange={v => updGodparent(i, 'godfather', v)} placeholder="Nas"
                                  style={{ fontFamily: SERIF, fontSize:20, fontWeight: 300, color: "rgba(255,255,255,0.82)", letterSpacing: 1 }} />
                                <span style={{ color: BLUSH_D, margin: "0 8px", fontStyle: "italic", fontFamily: SERIF }}>& </span>
                                <InlineEdit tag="span" editMode={editMode} value={g.godmother || ''} onChange={v => updGodparent(i, 'godmother', v)} placeholder="Nasa"
                                  style={{ fontFamily: SERIF, fontSize:20, fontWeight: 300, color: "rgba(255,255,255,0.82)", letterSpacing: 1 }} />
                                {editMode && <button type="button" onClick={() => delGodparent(i)} className="opacity-0 group-hover/gp:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-900/30"><Trash2 className="w-3 h-3 text-red-400" /></button>}
                              </div>
                            ))}
                            {editMode && <button type="button" onClick={addGodparent}
                              className="text-[10px] font-bold border border-dashed rounded-full px-2 py-0.5 flex items-center gap-1 mx-auto transition-colors"
                              style={{ color:ACCENT_TEXT, borderColor: rgba(BLUSH,0.35) }}>
                              <Plus className="w-2.5 h-2.5" /> adauga
                            </button>}
                          </div>
                        </GlassCard>
                      )}

                      {block.type === 'parents' && (
                        <GlassCard>
                          <InlineEdit tag="p" editMode={editMode} value={block.sectionTitle || 'Parintii Nostri'} onChange={v => updBlock(realIdx, { sectionTitle: v })} placeholder="Titlu..."
                            style={{ fontFamily: SANS, fontSize:10, fontWeight: 700, letterSpacing: "0.45em", textTransform: "uppercase",
                              color:rgba(ACCENT_TEXT,0.55), margin: "0 0 10px", display: "block", textAlign: "center" }} />
                          <InlineEdit tag="p" editMode={editMode} value={block.content || ''} onChange={v => updBlock(realIdx, { content: v })} placeholder="Text introductiv..." multiline
                            style={{ fontFamily: SERIF, fontSize:15, fontStyle: "italic", color:rgba(ACCENT_TEXT,0.45),
                              margin: "0 0 12px", display: "block", textAlign: "center" }} />
                          <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
                            {([
                              { key: 'p1_father', ph: 'Tatal Miresei' }, { key: 'p1_mother', ph: 'Mama Miresei' },
                              { key: 'p2_father', ph: 'Tatal Mirelui' }, { key: 'p2_mother', ph: 'Mama Mirelui' },
                            ] as const).map(({ key, ph }) => {
                              const val = parentsData?.[key];
                              if (!val && !editMode) return null;
                              return <InlineEdit key={key} tag="p" editMode={editMode} value={val || ''} onChange={v => updParent(key, v)} placeholder={ph}
                                style={{ fontFamily: SERIF, fontSize:18, fontWeight: 300, color: "rgba(255,255,255,0.7)", margin: 0, letterSpacing: 0.5 }} />;
                            })}
                          </div>
                        </GlassCard>
                      )}

                      {block.type === 'text' && (
                        <div style={{ textAlign: "center", padding: "8px 4px" }}>
                          <InlineEdit tag="p" editMode={editMode} value={block.content || ''} onChange={v => updBlock(realIdx, { content: v })} placeholder="Scrieti un mesaj..." multiline
                            style={{ fontFamily: SERIF, fontSize:16, fontStyle: "italic", color: "rgba(255,255,255,0.45)", lineHeight: 1.8 }} />
                        </div>
                      )}

                      {block.type === 'title' && (
                        <div style={{ textAlign: "center", padding: "4px 0" }}>
                          <InlineEdit tag="p" editMode={editMode} value={block.content || ''} onChange={v => updBlock(realIdx, { content: v })} placeholder="Titlu sectiune..."
                            style={{ fontFamily: SANS, fontSize:10, fontWeight: 700, letterSpacing: "0.45em", textTransform: "uppercase", color:rgba(ACCENT_TEXT,0.55) }} />
                        </div>
                      )}

                      {block.type === 'description' && (
                        <div style={{ textAlign: "center", padding: "6px 4px" }}>
                          <InlineEdit tag="p" editMode={editMode} value={block.content || ''} onChange={v => updBlock(realIdx, { content: v })} placeholder="Descriere..." multiline
                            style={{ fontFamily: SERIF, fontSize:15, fontStyle: "italic", color:rgba(ACCENT_TEXT,0.58), lineHeight: 1.7 }} />
                        </div>
                      )}

                      {block.type === 'date' && (
                        <div style={{ textAlign: "center", padding: "4px 0" }}>
                          <p style={{ fontFamily: SANS, fontSize:12, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.76)" }}>
                            {dateStr}
                          </p>
                        </div>
                      )}

                      {block.type === 'calendar' && (
                        <GlassCard style={{ padding: "14px 16px" }}>
                          <CalendarMonth date={profile.weddingDate} />
                        </GlassCard>
                      )}

                      {block.type === 'countdown' && (
                        <GlassCard style={{ padding: "14px 16px" }}>
                          <FlipClock
                            targetDate={profile.weddingDate}
                            bgColor={mixHex(BLUSH_D, BG_0, 0.35)}
                            textColor="white"
                            accentColor={BLUSH}
                            labelColor="rgba(255,255,255,0.72)"
                            editMode={editMode}
                            titleText={block.countdownTitle || "Timp ramas pana la marele eveniment"}
                            onTitleChange={text => updBlock(realIdx, { countdownTitle: text })}
                            titleTextKey={`${block.id}:countdown-title`}
                            titleTextLabel="Countdown  Titlu"
                          />
                        </GlassCard>
                      )}

                      {block.type === "timeline" && (() => {
                        const timelineItems = getTimelineItems();
                        if (!editMode && timelineItems.length === 0) return null;
                        return (
                          <div style={{ background: "rgba(255,255,255,0.9)", borderRadius: 6, padding: 18, border: `1px solid ${BLUSH_L}` }}>
                            <p style={{ fontFamily: SANS, fontSize:10, fontWeight: 700, letterSpacing: "0.42em", textTransform: "uppercase", color: BLUSH_D, textAlign: "center", margin: "0 0 14px" }}>
                              Programul Zilei
                            </p>
                            {timelineItems.length === 0 && editMode && (
                              <p style={{ fontFamily: SERIF, fontSize:14, fontStyle: "italic", color: MUTED, textAlign: "center", margin: "0 0 8px" }}>
                                Adauga primul moment al zilei.
                              </p>
                            )}
                            {timelineItems.map((item: any, i: number) => (
                              <div key={item.id} style={{ display: "grid", gridTemplateColumns: "58px 44px 1fr", alignItems: "stretch", minHeight: 64 }}>
                                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 10 }}>
                                  <InlineTime
                                    editMode={editMode}
                                    value={item.time || ""}
                                    onChange={v => updateTimelineItem(item.id, { time: v })}
                                    textKey={`timeline:${item.id}:time`}
                                    textLabel={`Ora ${i + 1}`}
                                    style={{ fontFamily: SERIF, fontSize:17, fontWeight: 600, color: BLUSH_D, lineHeight: 1.2, textAlign: "center", width: "100%" }}
                                  />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: BLUSH_XL, border: `1.5px solid ${BLUSH_L}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <WeddingIcon iconKey={item.icon || "party"} size={20} color={BLUSH_D} />
                                  </div>
                                  {i < timelineItems.length - 1 && (
                                    <div style={{ flex: 1, width: 1, background: `linear-gradient(to bottom, ${BLUSH_L}, transparent)`, marginTop: 4 }} />
                                  )}
                                </div>
                                <div style={{ paddingLeft: 12, paddingTop: 10, paddingBottom: i < timelineItems.length - 1 ? 20 : 0 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <InlineEdit
                                      tag="span"
                                      editMode={editMode}
                                      value={item.title || ""}
                                      onChange={v => updateTimelineItem(item.id, { title: v })}
                                      placeholder="Moment..."
                                      textKey={`timeline:${item.id}:title`}
                                      textLabel={`Titlu ${i + 1}`}
                                      style={{ fontFamily: SANS, fontSize:17, fontWeight: 600, color: PLUM, display: "block", lineHeight: 1.3 }}
                                    />
                                    {editMode && (
                                      <button
                                        type="button"
                                        onClick={() => removeTimelineItem(item.id)}
                                        style={{ background: "none", border: "none", cursor: "pointer", color: MUTED, fontSize:16, padding: "0 4px", opacity: 0.6, lineHeight: 1 }}
                                      >
                                        
                                      </button>
                                    )}
                                  </div>
                                  {(editMode || item.notice) && (
                                    <InlineEdit
                                      tag="span"
                                      editMode={editMode}
                                      value={item.notice || ""}
                                      onChange={v => updateTimelineItem(item.id, { notice: v })}
                                      placeholder="Nota..."
                                      textKey={`timeline:${item.id}:notice`}
                                      textLabel={`Nota ${i + 1}`}
                                      style={{ fontFamily: SERIF, fontSize:15, fontStyle: "italic", color: MUTED, display: "block", marginTop: 4, lineHeight: 1.5 }}
                                    />
                                  )}
                                </div>
                              </div>
                            ))}
                            <TimelineInsertButton
                              editMode={editMode}
                              colors={{ dark: BLUSH_D, light: BLUSH_L, xl: BLUSH_XL, muted: MUTED }}
                              onAdd={(preset) => addTimelineItem(preset)}
                            />
                          </div>
                        );
                      })()}

                      {block.type === 'music' && (
                        <MusicBlock block={block} editMode={editMode} onUpdate={patch => updBlock(realIdx, patch)} />
                      )}

                      {block.type === 'gift' && (
                        <GlassCard style={{ textAlign: "center" }}>
                          <Gift className="w-7 h-7 mx-auto mb-3" style={{ color:ACCENT_TEXT, opacity: 0.85 }} />
                          <InlineEdit tag="h3" editMode={editMode} value={block.sectionTitle || "Sugestie cadou"} onChange={v => updBlock(realIdx, { sectionTitle: v })}
                            style={{ fontFamily: SERIF, fontSize:26, color: "white", margin: "0 0 8px" }} />
                          <InlineEdit tag="p" editMode={editMode} value={block.content || ""} onChange={v => updBlock(realIdx, { content: v })} multiline
                            style={{ fontFamily: SERIF, fontSize:15, fontStyle: "italic", color:rgba(ACCENT_TEXT,0.62), margin: "0 0 8px" }} />
                          {(block.iban || editMode) && (
                            <InlineEdit tag="p" editMode={editMode} value={block.iban || ""} onChange={v => updBlock(realIdx, { iban: v })} placeholder="IBAN..."
                              style={{ fontFamily: SANS, fontSize:13, fontWeight: 700, color: "white", margin: "0 0 3px" }} />
                          )}
                          {(block.ibanName || editMode) && (
                            <InlineEdit tag="p" editMode={editMode} value={block.ibanName || ""} onChange={v => updBlock(realIdx, { ibanName: v })} placeholder="Beneficiar..."
                              style={{ fontFamily: SANS, fontSize:12, color:rgba(ACCENT_TEXT,0.62), margin: 0 }} />
                          )}
                        </GlassCard>
                      )}

                      {block.type === 'whatsapp' && (
                        <GlassCard style={{ textAlign: "center" }}>
                          <a
                            href={`https://wa.me/${(block.content || "").replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 999,
                              background: `linear-gradient(135deg,${BLUSH_D},${mixHex(BLUSH_D, BG_0, 0.3)})`, color: "white", textDecoration: "none",
                              fontFamily: SANS, fontSize:12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}
                          >
                            <MessageCircle className="w-4 h-4" />
                            <InlineEdit tag="span" editMode={editMode} value={block.label || "Contact WhatsApp"} onChange={v => updBlock(realIdx, { label: v })} />
                          </a>
                          {editMode && (
                            <div style={{ marginTop: 8 }}>
                              <InlineEdit tag="p" editMode={editMode} value={block.content || ""} onChange={v => updBlock(realIdx, { content: v })} placeholder="Numar..."
                                style={{ fontFamily: SANS, fontSize:13, color:rgba(ACCENT_TEXT,0.62), margin: 0 }} />
                            </div>
                          )}
                        </GlassCard>
                      )}

                      {block.type === 'rsvp' && (
                        <div style={{ display: "flex", justifyContent: "center" }}>
                          <button
                            onClick={() => { if (!editMode) onOpenRSVP?.(); }}
                            style={{ padding: "14px 24px", borderRadius: 12, border: `1px solid ${rgba(BLUSH,0.35)}`, cursor: "pointer",
                              background: `linear-gradient(135deg,${BLUSH_D} 0%,${mixHex(BLUSH_D, BG_0, 0.3)} 50%,${mixHex(BLUSH_D, BG_0, 0.55)} 100%)`,
                              fontFamily: SANS, fontWeight: 700, fontSize:12, letterSpacing: "0.3em", textTransform: "uppercase", color: "white" }}
                          >
                            <InlineEdit tag="span" editMode={editMode} value={block.label || "Confirma Prezenta"} onChange={v => updBlock(realIdx, { label: v })} />
                          </button>
                        </div>
                      )}

                      {block.type === 'family' && (() => {
                        const members: { name1: string; name2: string }[] = (() => {
                          try { return JSON.parse(block.members || "[]"); } catch { return []; }
                        })();
                        const updateMembers = (newMembers: { name1: string; name2: string }[]) => {
                          updBlock(realIdx, { members: JSON.stringify(newMembers) } as any);
                        };
                        return (
                          <GlassCard style={{ textAlign: "center" }}>
                            <InlineEdit tag="p" editMode={editMode} value={block.label || "Familie"} onChange={v => updBlock(realIdx, { label: v })}
                              style={{ fontFamily: SANS, fontSize:11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color:rgba(ACCENT_TEXT,0.62), margin: "0 0 8px" }} />
                            <InlineEdit tag="p" editMode={editMode} value={block.content || ""} onChange={v => updBlock(realIdx, { content: v })} multiline
                              style={{ fontFamily: SERIF, fontSize:15, fontStyle: "italic", color:rgba(ACCENT_TEXT,0.62), margin: "0 0 10px" }} />
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {members.map((m, mi) => (
                                <div key={mi} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
                                  <InlineEdit tag="span" editMode={editMode} value={m.name1} onChange={v => { const nm=[...members]; nm[mi] = { ...nm[mi], name1: v }; updateMembers(nm); }}
                                    style={{ fontFamily: SERIF, fontSize:20, color: "white" }} />
                                  <span style={{ color:ACCENT_TEXT }}>&amp;</span>
                                  <InlineEdit tag="span" editMode={editMode} value={m.name2} onChange={v => { const nm=[...members]; nm[mi] = { ...nm[mi], name2: v }; updateMembers(nm); }}
                                    style={{ fontFamily: SERIF, fontSize:20, color: "white" }} />
                                  {editMode && members.length > 1 && (
                                    <button type="button" onClick={() => updateMembers(members.filter((_, i) => i !== mi))} style={{ border: "none", background: "none", color: "#f87171", cursor: "pointer" }}>x</button>
                                  )}
                                </div>
                              ))}
                            </div>
                            {editMode && (
                              <button type="button" onClick={() => updateMembers([...members, { name1: "Nume 1", name2: "Nume 2" }])}
                                style={{ marginTop: 10, border: `1px dashed ${rgba(BLUSH,0.35)}`, background: "transparent", borderRadius: 999, padding: "4px 12px", fontFamily: SANS, fontSize:11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color:ACCENT_TEXT, cursor: "pointer" }}>
                                + Adauga
                              </button>
                            )}
                          </GlassCard>
                        );
                      })()}

                      {block.type === 'divider' && <FloralDivider />}
                      {block.type === 'spacer'  && <div style={{ height:16 }} />}

                      {block.type === 'location' && realIdx < blocks.length - 1 && blocks[realIdx + 1]?.type === 'location' && (
                        <div style={{ marginTop: 0 }}><LightString /></div>
                      )}
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
          </div>

          {/* Add block strip */}
          {false && editMode && (
            <div className="text-center mt-4 py-4 border-2 border-dashed rounded-2xl transition-colors"
              style={{ borderColor:rgba(BLUSH,0.2) }}>
              <p className="text-[9px] uppercase tracking-widest mb-2.5 font-bold" style={{ color:rgba(ACCENT_TEXT,0.4), fontFamily:SANS }}>Adauga bloc</p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  {type:'location',   label: 'Locatie', def:{label:'',time:'',locationName:'',locationAddress:'',wazeLink:''}},
                  {type:'godparents', label: 'Nasi',    def:{sectionTitle:'Nasii Nostri',content:''}},
                  {type:'parents',    label: 'Parinti', def:{sectionTitle:'Parintii Nostri',content:''}},
                  {type:'text',       label: 'Text',    def:{content:''}},
                  {type:'title',      label: 'Titlu',   def:{content:''}},
                  {type:'divider',    label: 'Linie',   def:{}},
                ].map(({type,label,def})=>(
                  <button key={type} type="button" onClick={()=>addBlock(type,def)}
                    className="px-3 py-1 text-[10px] font-bold border rounded-full transition-all"
                    style={{ color:ACCENT_TEXT, borderColor:rgba(BLUSH,0.3), fontFamily:SANS }}>
                    + {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* RSVP */}
          <LightString/>
          {showRsvp && !hasRsvpBlock && (
            editMode ? (
              <div style={{ width:"100%", padding:"18px 24px", borderRadius:16, textAlign:"center",
                background:`linear-gradient(135deg,${BLUSH_D} 0%,${mixHex(BLUSH_D, BG_0, 0.3)} 50%,${mixHex(BLUSH_D, BG_0, 0.55)} 100%)`,
                border:`1.5px solid ${rgba(BLUSH,0.3)}` }}>
                <InlineEdit tag="span" editMode={editMode} value={rsvpText} onChange={v=>upProfile('rsvpButtonText',v)}
                  style={{ fontFamily:SANS, fontWeight:700, fontSize:13, letterSpacing:"0.35em",
                    textTransform:"uppercase", color:"white", cursor:"text" }}/>
              </div>
            ) : (
              <button onClick={()=>onOpenRSVP&&onOpenRSVP()} style={{
                width:"100%", padding:"18px 24px",
                background:`linear-gradient(135deg,${BLUSH_D} 0%,${mixHex(BLUSH_D, BG_0, 0.3)} 50%,${mixHex(BLUSH_D, BG_0, 0.55)} 100%)`,
                border:`1.5px solid ${rgba(BLUSH,0.35)}`, borderRadius:16, cursor:"pointer",
                fontFamily:SANS, fontWeight:700, fontSize:13, letterSpacing:"0.35em",
                textTransform:"uppercase", color:"white",
                boxShadow:`0 8px 28px ${rgba(BLUSH_D,0.4)}, inset 0 1px 0 rgba(255,255,255,0.18)`,
                transition:"all 0.25s",
              }}>
                 {rsvpText} 
              </button>
            )
          )}

          {/* Footer */}
          <div style={{ marginTop:24, textAlign:"center" }}>
            <FloralDivider/>
            <p style={{ fontFamily:SERIF, fontSize:13, fontStyle:"italic", color:"rgba(255,255,255,0.18)", marginTop:12 }}>
              cu drag  WeddingPro 
            </p>
          </div>

        </div>
      </div>
    </>
  );
};

export default GardenRomanticTemplate;


