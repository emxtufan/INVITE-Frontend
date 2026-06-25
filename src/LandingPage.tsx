import React, { useEffect, useState } from "react";
import { AnimatedUnderlineText } from "@/components/ui/animated-underline-text-one";

import {
  AnimatePresence,
  motion,
  useSpring,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  Armchair,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Copy,
  CreditCard,
  ChevronLeft,
  Crown,
  ExternalLink,
  Globe,
  Gift,
  LayoutDashboard,
  LayoutTemplate,
  Link2,
  ListTodo,
  Lock,
  MapPin,
  Menu,
  MessageSquare,
  Phone,
  Search,
  Send,
  Sparkles,
  Star,
  User,
  Users,
  X,
} from "lucide-react";

import { VideoPlayer } from "@/components/ui/video-thumbnail-player";
import { StackedActivityCards } from "@/components/ui/stacked-activity-cards";
import { DisplayCards } from "@/components/ui/display-cards";
import Footer from "@/components/landing/Footer";
import ShinyText from "@/components/landing/effectText/ShinyText/ShinyText";
import RotatingText from "@/components/landing/effectText/RotatingText/RotatingText";
import SplitText from "@/components/landing/effectText/SplitText/SplitText";
import { API_URL } from "@/constants";
import { resolveMediaUrl } from "@/config/api";

const theme = {
  background: "#ffffff",
  soft: "#f8f6f1",
  text: "#101717",
  muted: "rgba(16, 23, 23, 0.62)",
  border: "rgba(16, 23, 23, 0.09)",
  accent: "#ff7633",
};

const titleGradientBase: React.CSSProperties = {
  fontWeight: 900,
  lineHeight: 1.1,
  letterSpacing: "0",
  color: "transparent",
  WebkitTextFillColor: "transparent",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
};

const sectionTitleStyle: React.CSSProperties = {
  ...titleGradientBase,
  fontSize: "clamp(28px, 4vw, 46px)",
  backgroundImage:
    "linear-gradient(180deg, #101717 0%, rgba(16, 23, 23, 0.58) 100%)",
};

const heroTitleStyle: React.CSSProperties = {
  ...titleGradientBase,
  fontSize: "clamp(42px, 6vw, 76px)",
  lineHeight: 1.02,
  backgroundImage:
    "linear-gradient(180deg, #101717 0%, rgba(16, 23, 23, 0.55) 100%)",
};

const darkTitleStyle: React.CSSProperties = {
  ...titleGradientBase,
  fontSize: "clamp(30px, 4vw, 52px)",
  backgroundImage:
    "linear-gradient(180deg, #fafafa 0%, rgba(250, 250, 250, 0.5) 100%)",
};

const cardTitleStyle: React.CSSProperties = {
  ...titleGradientBase,
  fontSize: "clamp(24px, 2.8vw, 34px)",
  lineHeight: 1.08,
  backgroundImage:
    "linear-gradient(180deg, #101717 0%, rgba(16, 23, 23, 0.6) 100%)",
};

const pricingTitleStyle: React.CSSProperties = {
  ...titleGradientBase,
  fontSize: "clamp(30px, 4vw, 48px)",
  lineHeight: 1.02,
  backgroundImage:
    "linear-gradient(180deg, #101717 0%, rgba(16, 23, 23, 0.56) 100%)",
};

const darkPricingTitleStyle: React.CSSProperties = {
  ...titleGradientBase,
  fontSize: "clamp(30px, 4vw, 48px)",
  lineHeight: 1.02,
  backgroundImage:
    "linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0.58) 100%)",
};

const processStepTitleStyle: React.CSSProperties = {
  ...titleGradientBase,
  fontSize: "clamp(28px, 3.7vw, 48px)",
  lineHeight: 1.08,
  backgroundImage:
    "linear-gradient(180deg, #101717 0%, rgba(16, 23, 23, 0.56) 100%)",
};

const navLinks = [
  { label: "Invitatii", href: "#featured-works" },
  { label: "Proces", href: "#process" },
  { label: "Functionalitati", href: "#features" },
  { label: "Planuri", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export type FeaturedTemplateCategory =
  | "wedding"
  | "baptism"
  | "anniversary"
  | "other";

export const featuredTemplateCategories: Array<{
  id: FeaturedTemplateCategory;
  label: string;
}> = [
  { id: "wedding", label: "Nunti" },
  { id: "baptism", label: "Botez" },
  { id: "anniversary", label: "Aniversari" },
  { id: "other", label: "Altele" },
];

export interface FeaturedTemplateItem {
  id: string;
  collection: FeaturedTemplateCategory;
  title: string;
  category: string;
  year: string;
  previewSrc: string;
  posterSrc?: string;
  summary: string;
  badge?: string | null;
}

export const featuredTemplates: FeaturedTemplateItem[] = [
  {
    id: "maison-wedding",
    collection: "wedding" as FeaturedTemplateCategory,
    title: "Maison Wedding",
    category: "Template elegant",
    year: "2026",
    previewSrc: "/process-videos/preview/gif1.webm",
    posterSrc: "/process-videos/preview/gif1.png",
    summary: "Pentru cupluri care vor o invitatie calma, eleganta si usor de trimis.",
    badge: "Nou",
  },
  {
    id: "maison-editorial",
    collection: "wedding" as FeaturedTemplateCategory,
    title: "Maison Editorial",
    category: "Elegant modern",
    year: "2026",
    previewSrc: "/process-videos/preview/gif2.webm",
    posterSrc: "/process-videos/preview/gif2.png",
    summary: "O invitatie editoriala, aerisita, cu detalii elegante.",
    badge: null,
  },
  {
    id: "arch-rose",
    collection: "wedding" as FeaturedTemplateCategory,
    title: "Arch Rose",
    category: "Floral romantic",
    year: "2026",
    previewSrc: "/ArchRoseTemplate/roses-side.jpg",
    summary: "Accent floral si compozitie romantica pentru evenimente clasice.",
    badge: null,
  },
  {
    id: "botanical-vows",
    collection: "wedding" as FeaturedTemplateCategory,
    title: "Botanical Vows",
    category: "Botanic rafinat",
    year: "2026",
    previewSrc: "/maison/hero-bg-alt.jpg",
    summary: "Flori discrete si tonuri naturale pentru o nunta calma.",
    badge: null,
  },
  {
    id: "royal-blush",
    collection: "wedding" as FeaturedTemplateCategory,
    title: "Royal Blush",
    category: "Rose premium",
    year: "2026",
    previewSrc: "/ArchRoseTemplate/arch-pink.png",
    summary: "Un design luminos si romantic pentru evenimente clasice.",
    badge: null,
  },
  {
    id: "gabby-baptism",
    collection: "baptism" as FeaturedTemplateCategory,
    title: "Gabby's Dollhouse",
    category: "Botez vesel",
    year: "2026",
    previewSrc: "/gabbys-dollhouse/homepage-s13-hero6.png",
    summary: "O invitatie colorata pentru un botez plin de energie.",
    badge: "Popular",
  },
  {
    id: "frozen-baptism",
    collection: "baptism" as FeaturedTemplateCategory,
    title: "Frozen Story",
    category: "Botez fantasy",
    year: "2026",
    previewSrc: "/frozen/banner.jpg",
    summary: "Un univers de poveste pentru cei mici si familiile lor.",
    badge: null,
  },
  {
    id: "unicorn-baptism",
    collection: "baptism" as FeaturedTemplateCategory,
    title: "Unicorn Academy",
    category: "Magie pastel",
    year: "2026",
    previewSrc: "/unicornacademy/sophia.jpg",
    summary: "Culori pastel si o atmosfera magica pentru botez.",
    badge: null,
  },
  {
    id: "jurassic-baptism",
    collection: "baptism" as FeaturedTemplateCategory,
    title: "Jurassic Adventure",
    category: "Aventura copii",
    year: "2026",
    previewSrc: "/jurasik/hero.png",
    summary: "Pentru familiile care vor o invitatie memorabila si jucausa.",
    badge: null,
  },
  {
    id: "zootropolis-baptism",
    collection: "baptism" as FeaturedTemplateCategory,
    title: "Zootropolis",
    category: "Orasul animalelor",
    year: "2026",
    previewSrc: "/zootropolis/scene.png",
    summary: "O invitatie prietenoasa si dinamica pentru cei mici.",
    badge: null,
  },
  {
    id: "mickey-birthday",
    collection: "anniversary" as FeaturedTemplateCategory,
    title: "Mickey Birthday",
    category: "Petrecere copii",
    year: "2026",
    previewSrc: "/mickey-mouse/mickey-mouse-birthday.jpg",
    summary: "Un exemplu bun pentru aniversari de copii si teme jucause.",
    badge: null,
  },
  {
    id: "lilo-birthday",
    collection: "anniversary" as FeaturedTemplateCategory,
    title: "Lilo & Stitch",
    category: "Tropical fun",
    year: "2026",
    previewSrc: "/lilo-stitch/hero-bg.png",
    summary: "Culori vii, atmosfera relaxata si un vibe foarte prietenos.",
    badge: null,
  },
  {
    id: "spider-birthday",
    collection: "anniversary" as FeaturedTemplateCategory,
    title: "Spider Verse",
    category: "Superhero theme",
    year: "2026",
    previewSrc: "/spiderman/marvels-spider-man-3840x2160-11990.jpeg",
    summary: "Template energic pentru o aniversare care atrage atentia.",
    badge: null,
  },
  {
    id: "frozen-birthday",
    collection: "anniversary" as FeaturedTemplateCategory,
    title: "Frozen Story",
    category: "Aniversare fantasy",
    year: "2026",
    previewSrc: "/frozen/banner.jpg",
    summary: "Potrivit pentru petreceri de copii cu imagine mai spectaculoasa.",
    badge: null,
  },
  {
    id: "gabby-birthday",
    collection: "anniversary" as FeaturedTemplateCategory,
    title: "Gabby's Party",
    category: "Petrecere colorata",
    year: "2026",
    previewSrc: "/gabbys-dollhouse/BGIMAGES.png",
    summary: "Un template vesel pentru aniversari si petreceri tematice.",
    badge: null,
  },
  {
    id: "corporate-clean",
    collection: "other" as FeaturedTemplateCategory,
    title: "Corporate Clean",
    category: "Eveniment business",
    year: "2026",
    previewSrc: "/card_website/2.jpg",
    summary: "Design clar pentru conferinte si evenimente corporate.",
    badge: "Nou",
  },
  {
    id: "parallax-event",
    collection: "other" as FeaturedTemplateCategory,
    title: "Parallax Event",
    category: "Experienta vizuala",
    year: "2026",
    previewSrc: "/ParallaxTemplate/bg.jpg",
    summary: "O directie cinematica pentru evenimente tematice.",
    badge: null,
  },
  {
    id: "private-dinner",
    collection: "other" as FeaturedTemplateCategory,
    title: "Private Dinner",
    category: "Petrecere privata",
    year: "2026",
    previewSrc: "/maison/a5d51dd50cc3f51657a8ca13ad8c9b8e.jpg",
    summary: "Invitatie eleganta pentru seri private si evenimente restranse.",
    badge: null,
  },
  {
    id: "white-editorial",
    collection: "other" as FeaturedTemplateCategory,
    title: "White Editorial",
    category: "Editorial minimalist",
    year: "2026",
    previewSrc: "/ArchRoseTemplate/arch-white.png",
    summary: "Un design curat pentru orice eveniment modern.",
    badge: null,
  },
  {
    id: "adventure-event",
    collection: "other" as FeaturedTemplateCategory,
    title: "Adventure Event",
    category: "Eveniment tematic",
    year: "2026",
    previewSrc: "/jurasik/gate.png",
    summary: "O invitatie spectaculoasa pentru evenimente cu personalitate.",
    badge: null,
  },
];

const logoStrip = [
  { label: "Invitatii", icon: "/event-icons-outline/invitatii.svg" },
  { label: "RSVP", icon: "/event-icons-outline/rsvp.svg" },
  { label: "Lista Invitati", icon: "/event-icons-outline/lista-invitati.svg" },
  { label: "Calendar", icon: "/event-icons-outline/calendar.svg" },
  { label: "Task-uri", icon: "/event-icons-outline/task-uri.svg" },
  { label: "Buget", icon: "/event-icons-outline/buget.svg" },
  { label: "Link Public", icon: "/event-icons-outline/link-public.svg" },
];

export interface LandingProcessStep {
  id: string;
  number?: string;
  label: string;
  title: string;
  description: string;
  videoSrc: string;
  posterSrc?: string;
  mediaMode?: "loop" | "popup";
  background: string;
  status?: string;
  points: string[];
}

export interface LandingProcessConfig {
  eyebrow: string;
  introDescription: string;
  title: string;
  ctaLabel: string;
  steps: LandingProcessStep[];
}

export const processShowcase: LandingProcessStep[] = [
  {
    id: "create-account",
    number: "01",
    label: "Creezi contul",
    title: "Iti creezi contul si primul eveniment",
    description:
      "Completezi datele de baza si ai imediat spatiul in care vei organiza intregul eveniment.",
    videoSrc: "/process-videos/01-creeaza-cont.webm",
    posterSrc: "/process-videos/01-creeaza-cont.jpg",
    mediaMode: "loop",
    background: "#edf7fb",
    status: "Cont creat",
    points: ["Configurare rapida", "Toate evenimentele intr-un loc"],
  },
  {
    id: "choose-template",
    number: "02",
    label: "Alegi si personalizezi",
    title: "Alegi template-ul invitatiei si il customizezi singur",
    description:
      "Schimbi textele, imaginile, data, programul si locatia, iar preview-ul se actualizeaza pe loc.",
    videoSrc: "/process-videos/02-alege-template.webm",
    posterSrc: "/maison/hero-bg.jpg",
    mediaMode: "popup",
    background: "#fff1e9",
    status: "Invitatie salvata",
    points: ["Design ales de tine", "Editare fara ajutor"],
  },
  {
    id: "publish-invitation",
    number: "03",
    label: "Publici si trimiti",
    title: "Generezi linkul si il trimiti invitatilor",
    description:
      "Publici invitatia, copiezi linkul si il distribui rapid. Invitatii vad toate detaliile si confirma participarea online.",
    videoSrc: "/process-videos/03-trimite-invitatii.webm",
    posterSrc: "/maison/a5d51dd50cc3f51657a8ca13ad8c9b8e.jpg",
    mediaMode: "popup",
    background: "#eef6e8",
    status: "Link pregatit",
    points: ["Link public unic", "RSVP din acelasi link"],
  },
  {
    id: "manage-seating",
    number: "04",
    label: "Asezi invitatii",
    title: "Gestionezi mesele si locurile invitatilor",
    description:
      "Creezi mesele, alegi capacitatea lor si asezi fiecare invitat exact acolo unde iti doresti.",
    videoSrc: "/process-videos/04-gestioneaza-mese.webm",
    posterSrc: "/maison/175140437c82741b2167bfb8c40c098e.jpg",
    mediaMode: "popup",
    background: "#f4f0e8",
    status: "Mese actualizate",
    points: ["Asezare clara", "Modificari rapide"],
  },
  {
    id: "manage-budget",
    number: "05",
    label: "Controlezi cheltuielile",
    title: "Gestionezi bugetul evenimentului",
    description:
      "Adaugi costurile, avansurile si platile ramase ca sa stii permanent cat ai cheltuit si ce urmeaza sa platesti.",
    videoSrc: "/process-videos/05-gestioneaza-buget.webm",
    posterSrc: "/maison/hero-bg-alt.jpg",
    mediaMode: "popup",
    background: "#f1f4fb",
    status: "Buget la zi",
    points: ["Cheltuieli si plati", "Total mereu actualizat"],
  },
  {
    id: "manage-tasks",
    number: "06",
    label: "Planifici ce urmeaza",
    title: "Gestionezi task-urile si termenele",
    description:
      "Notezi fiecare lucru de facut, stabilesti prioritatea si termenul limita si urmaresti progresul pana la eveniment.",
    videoSrc: "/process-videos/06-gestioneaza-taskuri.webm",
    posterSrc: "/ArchRoseTemplate/roses-side.jpg",
    mediaMode: "popup",
    background: "#fff5ec",
    status: "Task-uri planificate",
    points: ["Termene si prioritati", "Stii mereu ce urmeaza"],
  },
  {
    id: "print-and-notify",
    number: "07",
    label: "Pregatesti ziua evenimentului",
    title: "Printezi listele si notifici invitatii unde sunt asezati",
    description:
      "Generezi listele finale pentru print si le trimiti invitatilor masa si locul atribuit, fara cautari si explicatii in ultima zi.",
    videoSrc: "/process-videos/07-liste-si-notificari.webm",
    posterSrc: "/maison/a5d51dd50cc3f51657a8ca13ad8c9b8e.jpg",
    mediaMode: "popup",
    background: "#eef7f4",
    status: "Invitati notificati",
    points: ["Liste gata de print", "Masa si locul ajung la invitat"],
  },
];

export const defaultLandingProcessConfig: LandingProcessConfig = {
  eyebrow: "Cum functioneaza",
  introDescription:
    "Fiecare pas continua firesc in acelasi cont, de la prima alegere pana la ziua evenimentului.",
  title: "Sapte pasi. Un singur loc pentru tot evenimentul.",
  ctaLabel: "Creeaza primul eveniment",
  steps: processShowcase,
};

export interface LandingSupplierShowcaseItem {
  id: string;
  title: string;
  category: string;
  note: string;
  image: string;
  accent: string;
}

export interface LandingSupplierShowcaseConfig {
  sectionEyebrow: string;
  sectionTitle: string;
  sectionDescription: string;
  eyebrow: string;
  title: string;
  description: string;
  tags: string[];
  items: LandingSupplierShowcaseItem[];
}

export const supplierShowcase: LandingSupplierShowcaseItem[] = [
  {
    id: "venue",
    title: "Locatie",
    category: "Restaurant & gradina",
    note: "Locul care da tonul intregului eveniment.",
    image: "/maison/hero-bg.jpg",
    accent: "#ffede3",
  },
  {
    id: "floral-decor",
    title: "Decor floral",
    category: "Aranjamente & buchete",
    note: "Detaliile care se vad peste tot, de la ceremonie pana la mese.",
    image: "/ArchRoseTemplate/roses-corner.jpg",
    accent: "#f5ebf1",
  },
  {
    id: "photo-video",
    title: "Foto & video",
    category: "Cadrele importante",
    note: "Echipa care surprinde momentele pe care vrei sa le retraiesti.",
    image: "/maison/175140437c82741b2167bfb8c40c098e.jpg",
    accent: "#edf4ff",
  },
  {
    id: "candy-bar",
    title: "Candy bar",
    category: "Sweet corner",
    note: "Un punct de atractie care aduce instant energie in sala.",
    image: "/maison/a5d51dd50cc3f51657a8ca13ad8c9b8e.jpg",
    accent: "#fff2e6",
  },
  {
    id: "music",
    title: "Muzica",
    category: "DJ / band / sonorizare",
    note: "Atmosfera serii depinde mult de ritm, timing si vibe.",
    image: "/ArchRoseTemplate/roses-side.jpg",
    accent: "#eef8f2",
  },
  {
    id: "stationery",
    title: "Papetarie",
    category: "Invitatii, meniuri, carduri",
    note: "Tot ce leaga vizual invitatia de ziua evenimentului.",
    image: "/maison/hero-bg-alt.jpg",
    accent: "#f7efe5",
  },
  {
    id: "seating-menus",
    title: "Seating & meniuri",
    category: "Mese si preferinte",
    note: "Zona unde organizarea buna se simte imediat pentru invitati.",
    image: "/maison/175140437c82741b2167bfb8c40c098e.jpg",
    accent: "#eef6eb",
  },
  {
    id: "coordination",
    title: "Coordonare",
    category: "Ziua evenimentului",
    note: "Micile detalii care fac totul sa curga mai lin si mai clar.",
    image: "/maison/hero-bg.jpg",
    accent: "#eef3ff",
  },
];

export const defaultLandingSupplierShowcaseConfig: LandingSupplierShowcaseConfig =
  {
    sectionEyebrow: "Furnizori",
    sectionTitle: "Tot ce conteaza in jurul unui eveniment reusit",
    sectionDescription:
      "Dincolo de invitatie si RSVP, utilizatorul se gandeste mereu si la locatie, decor, muzica, foto-video si toate detaliile care trebuie sa se potriveasca intre ele.",
    eyebrow: "Furnizori & inspiratie",
    title:
      "Tot ce conteaza in jurul evenimentului, intr-un showcase mai viu.",
    description:
      "Pastram imaginile, dar le transformam in carduri mai clare si mai utile: tipuri de furnizori pe care mirii le au mereu in minte cand isi construiesc evenimentul.",
    tags: [
      "Locatie",
      "Decor floral",
      "Foto & video",
      "Muzica",
      "Papetarie",
      "Candy bar",
    ],
    items: supplierShowcase,
  };

const featureCards = [
  {
    title: "Invitatie digitala completa",
    description:
      "Ai pagina evenimentului, design-ul invitatiei si toate informatiile importante in acelasi loc.",
    icon: LayoutTemplate,
  },
  {
    title: "Confirmari RSVP centralizate",
    description:
      "Nu mai aduni raspunsuri din mesaje. Vezi clar cine vine, cine nu vine si ce lipseste.",
    icon: Users,
  },
  {
    title: "Calendar si task-uri",
    description:
      "Poti urmari mai usor ce ai de facut, in ce ordine si cat timp mai ai pana la eveniment.",
    icon: CalendarDays,
  },
  {
    title: "Buget simplu de urmarit",
    description:
      "Cheltuielile sunt centralizate si devin mai usor de explicat si de controlat.",
    icon: CreditCard,
  },
  {
    title: "Locatii si linkuri utile",
    description:
      "Invitatii gasesc repede adresa, programul si traseul, fara telefoane inutile in ultima zi.",
    icon: MapPin,
  },
  {
    title: "Mai putin stres, mai multa claritate",
    description:
      "Avantajul real nu este doar designul, ci faptul ca procesul devine mai usor de inteles.",
    icon: CheckCircle2,
  },
];

const eventTypes = [
  {
    title: "Nunti",
    description:
      "Pentru evenimente cu multi invitati, plus-one, meniuri si mese, unde ai nevoie sa treci natural din invitatie in organizare.",
    tag: "Cel mai folosit",
    icon: Sparkles,
    accent: "#fff1e9",
    bullets: [
      "Invitatie digitala eleganta si usor de trimis",
      "RSVP clar pentru familii, insotitori si copii",
      "Plan de mese si meniuri gestionate din admin",
    ],
  },
  {
    title: "Botezuri",
    description:
      "Cand vrei sa trimiti rapid toate detaliile catre familie si apropiati, iar confirmarile sa se adune fara apeluri si mesaje pierdute.",
    tag: "Familie",
    icon: Users,
    accent: "#eef6ff",
    bullets: [
      "Programul si locatia raman intr-un singur link",
      "Vezi imediat cine confirma si cu cate persoane",
      "Asezi invitatii la mese fara liste separate",
    ],
  },
  {
    title: "Aniversari",
    description:
      "Potrivit pentru petreceri unde vrei un flux simplu: trimiti invitatia, aduni raspunsurile si comunici usor orice update.",
    tag: "Rapid",
    icon: Gift,
    accent: "#fff6df",
    bullets: [
      "Invitatie prietenoasa, trimisa pe orice canal",
      "Confirmari rapide, fara urmarit raspunsuri manual",
      "Locatie, ora si detalii disponibile mereu pentru invitati",
    ],
  },
  {
    title: "Evenimente corporate",
    description:
      "Pentru evenimente unde conteaza ordinea: participanti multi, comunicare clara si nevoie de o evidenta mai buna a prezentei.",
    tag: "Business",
    icon: LayoutDashboard,
    accent: "#edf4ff",
    bullets: [
      "Trimiti invitatiile pe email, WhatsApp sau chat intern",
      "Centralizezi confirmarile fara tabele paralele",
      "Ai un punct unic pentru acces, agenda si raspunsuri",
    ],
  },
  {
    title: "Conferinte",
    description:
      "Ideal pentru evenimente cu program, speakeri si informatii multe, care trebuie sa ramana simple si clare de pe telefon.",
    tag: "Agenda",
    icon: CalendarDays,
    accent: "#eef7f0",
    bullets: [
      "Agenda si detaliile logistice stau in acelasi loc",
      "Participantii confirma participarea fara frictiune",
      "Trimiti update-uri rapid, fara confuzie intre versiuni",
    ],
  },
  {
    title: "Petreceri private",
    description:
      "Pentru seri mai relaxate, unde ai nevoie de ceva usor de trimis, usor de inteles si simplu de urmarit pana in ziua evenimentului.",
    tag: "Casual",
    icon: Star,
    accent: "#f8efe8",
    bullets: [
      "Link unic pentru invitatie, locatie si confirmare",
      "Raspunsurile se aduna direct in admin",
      "Invitatii stiu exact unde, cand si cum ajung",
    ],
  },
];

type PricingConfig = {
  basicPrice: number;
  premiumPrice: number;
  oldPrice?: number;
  currency: string;
};

const defaultPricing: PricingConfig = {
  basicPrice: 1900,
  premiumPrice: 4900,
  oldPrice: 10000,
  currency: "ron",
};

const normalizePriceInCents = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed < 200 ? Math.round(parsed * 100) : Math.round(parsed);
};

const formatPrice = (cents: number, currency = "ron") => {
  const amount = Math.round(cents / 100);
  const currencyLabel = currency.toLowerCase() === "ron" ? "LEI" : currency.toUpperCase();
  return `${amount.toLocaleString("ro-RO")} ${currencyLabel}`;
};

const pricingPlanContent = [
  {
    id: "basic",
    name: "Basic",
    subtitle: "Pentru invitatie + RSVP",
    description:
      "Dedicat celor care vor invitatia digitala si centralizarea confirmarilor.",
    features: [
      "Invitatie digitala",
      "Link public",
      "RSVP si lista de invitati",
    ],
    featured: false,
  },
  {
    id: "premium",
    name: "Premium",
    subtitle: "Pentru organizare completa",
    description:
      "Include partea de invitatie si toate modulele de organizare necesare pana la ziua evenimentului.",
    features: [
      "Tot ce este in Basic",
      "Planificator mese",
      "Calendar, task-uri si buget",
      "Acces la contactele furnizorilor",
    ],
    featured: true,
  },
];

const testimonials = [
  {
    quote:
      "Mi-a placut ca intelegi imediat ce face platforma. Nu pare un demo generic, ci ceva gandit pentru oameni reali.",
    name: "Andreea",
    role: "viitoare mireasa",
  },
  {
    quote:
      "Partea buna este ca invitatia si organizarea nu mai sunt separate. Totul sta in acelasi loc si are sens.",
    name: "Radu",
    role: "organizator eveniment",
  },
  {
    quote:
      "RSVP-ul intr-un singur loc a fost cea mai utila parte. S-a redus mult haosul din mesaje.",
    name: "Bianca",
    role: "utilizator Basic",
  },
  {
    quote:
      "Pagina noua explica mult mai bine produsul. Acum stii exact la ce te ajuta si ce plan ti se potriveste.",
    name: "Mihai",
    role: "utilizator Premium",
  },
];

const faqItems = [
  {
    question: "Ce inseamna concret ca platforma e pentru invitatie si organizare?",
    answer:
      "Inseamna ca nu faci doar pagina invitatiei. Dupa ce trimiti linkul, poti continua in acelasi cont cu RSVP, lista de invitati, calendar, task-uri si buget.",
  },
  {
    question: "Daca vreau doar invitatie si RSVP, nu este prea mult pentru mine?",
    answer:
      "Nu. Tocmai de aceea exista logica planului Basic. Poti folosi exact partea de invitatie si confirmari, fara sa te complici cu tot restul.",
  },
  {
    question: "Pot trimite pagina usor de pe telefon?",
    answer:
      "Da. Invitatii deschid linkul usor de pe telefon, iar informatiile importante raman intr-un format simplu de parcurs.",
  },
  {
    question: "Ce aduce in plus varianta completa?",
    answer:
      "Partea de organizare: planificarea meselor, calendarul, task-urile si bugetul. E varianta potrivita cand vrei sa lucrezi cap-coada in acelasi loc.",
  },
];

function SectionIntro({
  eyebrow,
  title,
  description,
  center = true,
}: {
  eyebrow: string;
  title: string;
  description: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p
        className="text-xs font-semibold uppercase tracking-[0.24em]"
        style={{ color: theme.accent }}
      >
        {eyebrow}

      </p>
      <SplitText
        key={`section-intro-${title}`}
        text={title}
        tag="h2"
        splitType="words"
        delay={65}
        duration={1}
        className="mt-3"
        style={sectionTitleStyle}
        textAlign={center ? "center" : "left"}
        threshold={0.14}
        rootMargin="-50px"
        from={{ opacity: 0, y: 36, filter: "blur(7px)" }}
        to={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      />
      <p
        className="mt-4 text-base leading-7 md:text-lg"
        style={{ color: theme.muted }}
      >

          <ShinyText
                text={description}
                speed={3.4}
                delay={0.8}
                spread={115}
                color="#101717"
                shineColor="#ddd"
                pauseOnHover
              />
      </p>
    </div>
  );
}

function PrimaryButton({
  href,
  label,
  outline = false,
}: {
  href: string;
  label: string;
  outline?: boolean;
}) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-transform duration-200 hover:-translate-y-0.5"
      style={{
        backgroundColor: outline ? "transparent" : theme.accent,
        color: outline ? theme.text : "#fff",
        border: outline ? `1px solid ${theme.text}` : "1px solid transparent",
      }}
    >
      {label}
      {!outline ? <ArrowRight className="h-4 w-4" /> : null}
    </a>
  );
}

function AdminPanelGifPreview() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative mt-5 aspect-[16/10] overflow-hidden rounded-[20px] border border-white/12 bg-black/20">
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
          isLoaded ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden={isLoaded}
      >
        <div className="flex flex-col items-center gap-3 px-6 text-center text-white/55">
          <Sparkles className="h-6 w-6 text-[#ff9a68]" />
          <p className="text-xs uppercase tracking-[0.16em]">
            Preview panou invitati
          </p>
        </div>
      </div>
      <video
        src="/landing-gifs/panou-invitati.webm"
        className={`relative z-10 h-full w-full object-cover transition-opacity duration-500 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        muted
        loop
        autoPlay
        playsInline
        preload="metadata"
        aria-label="Lista invitatilor si asezarea lor la mese in panoul de administrare"
        onCanPlay={() => setIsLoaded(true)}
        onError={() => setIsLoaded(false)}
      />
    </div>
  );
}

function ScrollBlurCard({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const cardRef = React.useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start 96%", "start 68%"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.75, 1], [0, 1, 1]);
  const blur = useTransform(
    scrollYProgress,
    [0, 1],
    ["blur(12px)", "blur(0px)"],
  );
  const y = useTransform(scrollYProgress, [0, 1], [18, 0]);

  return (
    <motion.div
      ref={cardRef}
      className={className}
      style={{
        ...style,
        opacity,
        filter: blur,
        y,
        willChange: "opacity, filter, transform",
      }}
    >
      {children}
    </motion.div>
  );
}

const planningBenefitItems = [
  "Vezi imediat cine vine si cu cate persoane.",
  "Separi usor adultii, copiii si mesajele primite.",
  "Continui direct cu asezarea la mese in planificator.",
];

function CascadingBenefits() {
  return (
    <motion.div
      className="mt-5 space-y-3"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.35 }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.24,
            delayChildren: 0.14,
          },
        },
      }}
    >
      {planningBenefitItems.map((item) => (
        <motion.div
          key={item}
          className="flex items-start gap-3 rounded-[22px] bg-[#faf9f6] px-4 py-3"
          variants={{
            hidden: {
              opacity: 0,
              y: -30,
              scale: 0.98,
              filter: "blur(7px)",
            },
            visible: {
              opacity: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
              transition: {
                type: "spring",
                stiffness: 115,
                damping: 18,
                mass: 0.95,
              },
            },
          }}
        >
          <CheckCircle2
            className="mt-0.5 h-4 w-4 shrink-0"
            style={{ color: theme.accent }}
          />
          <p className="text-sm leading-6">{item}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}

function PlanningBenefitsShowcase() {
  const invitationFeed = [
    {
      guest: "Ana & Paul",
      detail: "Au confirmat direct din linkul primit",
      extra: "2 adulti â€¢ mesaj lasat in RSVP",
      tone: "success",
      badge: "Confirmat",
    },
    {
      guest: "Familia Ionescu",
      detail: "Au deschis invitatia publica",
      extra: "1 adult + 1 copil",
      tone: "default",
      badge: "Deschis",
    },
    {
      guest: "Mihai Pavel",
      detail: "Nu poate ajunge",
      extra: "Raspunsul a fost salvat in lista",
      tone: "muted",
      badge: "Refuzat",
    },
  ];

  const guestAdminRows = [
    {
      name: "Ana & Paul",
      status: "Confirmat",
      people: "2 adulti",
      table: "Masa 3",
      note: "Mesaj: Venim cu drag.",
    },
    {
      name: "Familia Ionescu",
      status: "Confirmat",
      people: "1 adult + 1 copil",
      table: "Masa 5",
      note: "Invitatia a fost deschisa si confirmata.",
    },
    {
      name: "Mihai Pavel",
      status: "Deschis",
      people: "Asteapta raspuns final",
      table: "Fara masa",
      note: "Invitatia a fost vazuta, dar nu are confirmare finala.",
    },
  ];

  return (
    <section id="benefits" className="px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-[1280px]">
        <SectionIntro
          eyebrow="Invitatii, RSVP si administrare"
          title="Mai putine foi. Mai mult timp pentru eveniment."
          description="Creezi linkul invitatiei si il trimiti unde vrei, iar raspunsurile se centralizeaza in admin. De acolo vezi cine vine, cate persoane confirma si cum continui mai departe cu asezarea la mese."
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-[1.02fr_0.98fr]">
          <article
            className="relative overflow-hidden rounded-[34px] p-6 sm:p-8 md:p-10"
            style={{ backgroundColor: theme.soft }}
          >
            <div
              className="absolute -right-24 top-10 h-44 w-44 rounded-full blur-3xl"
              style={{ backgroundColor: "rgba(255, 118, 51, 0.12)" }}
            />
            <div
              className="absolute -left-16 bottom-6 h-36 w-36 rounded-full blur-3xl"
              style={{ backgroundColor: "rgba(255, 208, 176, 0.22)" }}
            />

            <div className="relative">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-2xl">
                  <h3 style={cardTitleStyle}>
                    Distribuire & acces
                  </h3>
                  <p
                    className="mt-4 max-w-xl text-sm leading-7 md:text-base"
                    style={{ color: theme.muted }}
                  >
                    Trimiti invitatia pe canalul pe care deja vorbesti cu invitatii, iar platforma aduna confirmarile direct in admin. Asa vezi rapid cine a raspuns, cate persoane vin si cum continui mai departe cu organizarea.
                  </p>
                </div>
                <span
                  className="rounded-full border bg-white/82 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]"
                  style={{ borderColor: theme.border, color: theme.accent }}
                >
                  Link public + RSVP
                </span>
              </div>

              <div className="mt-8 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-[28px] bg-[#17261b] p-5 text-white shadow-[0_24px_60px_rgba(23,38,27,0.18)] sm:p-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12">
                      <Send className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm text-white/62">Invitatie gata de trimis</p>
                      <p className="mt-1 text-lg font-semibold">Ai link public si linkuri individuale</p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    {[
                      ["Public", "link"],
                      ["Individual", "invitat"],
                      ["Live", "rsvp"],
                    ].map(([value, label]) => (
                      <div key={label} className="rounded-2xl bg-white/8 px-3 py-3 text-center">
                        <p className="text-base font-semibold sm:text-lg">{value}</p>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/50">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 space-y-2.5">
                    {[
                      "Copiaza linkul in 1 click",
                      "Il trimiti pe orice platforma",
                      "Raspunsurile se salveaza automat in admin",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/8 px-3 py-3">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#c8ed64]" />
                        <p className="text-sm text-white/82">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[28px] border bg-white p-5 shadow-[0_20px_45px_rgba(16,23,23,0.06)] sm:p-6" style={{ borderColor: theme.border }}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff4ee] text-[#ff7633]">
                        <Link2 className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold">Raspunsurile apar in admin</p>
                        <p className="mt-0.5 text-xs" style={{ color: theme.muted }}>
                          Status, persoane si mesaj in acelasi loc
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-[#edf7e9] px-3 py-1 text-xs font-semibold text-[#315c2b]">
                      Actualizat live
                    </span>
                  </div>

                  <div className="mt-5 space-y-3">
                    {invitationFeed.map((item) => (
                      <div
                        key={item.guest}
                        className="flex items-start gap-3 rounded-[22px] border px-4 py-3"
                        style={{
                          borderColor:
                            item.tone === "success"
                              ? "rgba(79, 139, 72, 0.2)"
                              : item.tone === "muted"
                                ? "rgba(16, 23, 23, 0.08)"
                                : "rgba(255, 118, 51, 0.16)",
                          backgroundColor:
                            item.tone === "success"
                              ? "#f5fbf3"
                              : item.tone === "muted"
                                ? "#fbfaf7"
                                : "#fff8f4",
                        }}
                      >
                        <span
                          className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor:
                              item.tone === "success"
                                ? "#dff2db"
                                : item.tone === "muted"
                                  ? "#ece9e2"
                                  : "#ffe2d1",
                            color: theme.text,
                          }}
                        >
                          {item.guest.slice(0, 1)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold">{item.guest}</p>
                            <span
                              className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]"
                              style={{
                                backgroundColor: item.tone === "muted" ? "#f0ede7" : "#ffffff",
                                color:
                                  item.tone === "success"
                                    ? "#315c2b"
                                    : item.tone === "muted"
                                      ? theme.muted
                                      : theme.accent,
                              }}
                            >
                              {item.badge}
                            </span>
                          </div>
                          <p className="mt-1 text-sm" style={{ color: theme.text }}>
                            {item.detail}
                          </p>
                          <p className="mt-1 text-xs" style={{ color: theme.muted }}>
                            {item.extra}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  "Vezi instant cine a raspuns",
                  "Trimiti acelasi link pe orice canal",
                  "Confirmarile nu se pierd in conversatii",
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border bg-white px-3 py-2 text-xs font-medium"
                    style={{ borderColor: theme.border }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </article>

          <article
            className="relative overflow-hidden rounded-[34px] p-6 sm:p-8 md:p-10"
            style={{ backgroundColor: theme.soft }}
          >
            <div
              className="absolute right-6 top-0 h-40 w-40 rounded-full blur-3xl"
              style={{ backgroundColor: "rgba(200, 237, 100, 0.15)" }}
            />
            <div
              className="absolute -left-20 bottom-4 h-40 w-40 rounded-full blur-3xl"
              style={{ backgroundColor: "rgba(123, 176, 255, 0.12)" }}
            />

            <div className="relative">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-2xl">
                  <h3 className="max-w-2xl" style={cardTitleStyle}>
                    Din RSVP mergi direct spre lista de invitati si planul meselor.
                  </h3>
                  <p
                    className="mt-4 max-w-2xl text-sm leading-7 md:text-base"
                    style={{ color: theme.muted }}
                  >
                    In admin vezi cine a confirmat, cate persoane vin, daca sunt si copii si ce mesaj au lasat. De aici continui simplu cu asezarea lor la mese, fara liste paralele si fara haos de ultim moment.
                  </p>
                </div>
                <span
                  className="rounded-full border bg-white/82 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]"
                  style={{ borderColor: theme.border, color: theme.accent }}
                >
                  Admin + mese
                </span>
              </div>

              <div className="mt-8 grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
                <div className="rounded-[28px] border bg-white p-5 shadow-[0_20px_45px_rgba(16,23,23,0.06)] sm:p-6" style={{ borderColor: theme.border }}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#3f71d1]">
                        <LayoutDashboard className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold">Lista invitati in admin</p>
                        <p className="mt-0.5 text-xs" style={{ color: theme.muted }}>
                          Status, persoane si mesaje in acelasi loc
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full border px-3 py-1 text-xs font-semibold" style={{ borderColor: theme.border, color: theme.muted }}>
                      84 raspunsuri
                    </span>
                  </div>

                  <div className="mt-5 space-y-3">
                    {guestAdminRows.map((guest) => (
                      <ScrollBlurCard
                        key={guest.name}
                        className="rounded-[22px] border bg-[#fcfbf8] px-4 py-3"
                        style={{ borderColor: theme.border }}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold">{guest.name}</p>
                            <p className="mt-1 text-xs" style={{ color: theme.muted }}>
                              {guest.status === "Confirmat"
                                ? "Raspuns validat si gata de organizare"
                                : "Asteapta inca un raspuns final"}
                            </p>
                          </div>
                          <span
                            className="rounded-full px-3 py-1 text-[11px] font-semibold"
                            style={{
                              backgroundColor: guest.status === "Confirmat" ? "#edf7e9" : "#f2efe9",
                              color: guest.status === "Confirmat" ? "#315c2b" : theme.muted,
                            }}
                          >
                            {guest.status}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium" style={{ border: `1px solid ${theme.border}` }}>
                            <Users className="h-3.5 w-3.5" style={{ color: theme.accent }} />
                            {guest.people}
                          </span>
                          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium" style={{ border: `1px solid ${theme.border}` }}>
                            <Armchair className="h-3.5 w-3.5" style={{ color: "#3f71d1" }} />
                            {guest.table}
                          </span>
                        </div>

                        <div className="mt-3 flex items-start gap-2 rounded-2xl bg-white px-3 py-2.5" style={{ border: `1px solid ${theme.border}` }}>
                          <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: theme.muted }} />
                          <p className="text-xs leading-5" style={{ color: theme.muted }}>
                            {guest.note}
                          </p>
                        </div>
                      </ScrollBlurCard>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[28px] bg-[#17261b] p-5 text-white shadow-[0_24px_60px_rgba(23,38,27,0.18)] sm:p-6">
                    <p className="text-sm text-white/62">Panou de control clar</p>
                    <h4 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                      Vezi rapid cum arata lista inainte sa asezi invitatii
                    </h4>
                    <AdminPanelGifPreview />
                  </div>

                  <div className="rounded-[28px] border bg-white p-5 shadow-[0_20px_45px_rgba(16,23,23,0.06)] sm:p-6" style={{ borderColor: theme.border }}>
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff4ee] text-[#ff7633]">
                        <Users className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold">Ce castiga utilizatorul</p>
                        <p className="mt-0.5 text-xs" style={{ color: theme.muted }}>
                          Mai putine decizii luate in graba
                        </p>
                      </div>
                    </div>

                    <CascadingBenefits />
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function PlanningAdminShowcase() {
  const guestAdminRows = [
    {
      name: "Ana & Paul",
      status: "Confirmat",
      people: "2 adulti",
      table: "Masa 3",
      note: "Mesaj: Venim cu drag.",
    },
    {
      name: "Familia Ionescu",
      status: "Confirmat",
      people: "1 adult + 1 copil",
      table: "Masa 5",
      note: "Invitatia a fost deschisa si confirmata.",
    },
    {
      name: "Mihai Pavel",
      status: "Deschis",
      people: "Asteapta raspuns final",
      table: "Fara masa",
      note: "Invitatia a fost vazuta, dar nu are confirmare finala.",
    },
  ];

  return (
    <section id="benefits" className="px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-[1280px]">
        <SectionIntro
          eyebrow="Confirmari in admin"
          title="Toate confirmările sunt centralizate în panoul de administrare pentru o gestionare simplă."
          description="Dupa ce invitatii confirma, vezi imediat cine vine, cate persoane sunt si cum continui mai departe cu lista de invitati si planul meselor."
        />

        <article
          className="relative mt-12 overflow-hidden rounded-[34px] p-6 sm:p-8 md:p-10"
          style={{ backgroundColor: theme.soft }}
        >
          <div
            className="absolute right-6 top-0 h-40 w-40 rounded-full blur-3xl"
            style={{ backgroundColor: "rgba(200, 237, 100, 0.15)" }}
          />
          <div
            className="absolute -left-20 bottom-4 h-40 w-40 rounded-full blur-3xl"
            style={{ backgroundColor: "rgba(123, 176, 255, 0.12)" }}
          />

          <div className="relative">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-2xl">
                  <h3 className="max-w-2xl" style={cardTitleStyle}>
                    Din RSVP mergi direct spre lista de invitati si planul meselor.
                  </h3>
                <p
                  className="mt-4 max-w-2xl text-sm leading-7 md:text-base"
                  style={{ color: theme.muted }}
                >
                  In admin vezi cine a confirmat, cate persoane vin, daca sunt si copii si ce mesaj au lasat. De aici continui simplu cu asezarea lor la mese, fara liste paralele si fara haos de ultim moment.
                </p>
              </div>
              <span
                className="rounded-full border bg-white/82 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]"
                style={{ borderColor: theme.border, color: theme.accent }}
              >
                Admin + mese
              </span>
            </div>

            <div className="mt-8 grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
              <div className="rounded-[28px] border bg-white p-5 shadow-[0_20px_45px_rgba(16,23,23,0.06)] sm:p-6" style={{ borderColor: theme.border }}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#3f71d1]">
                      <LayoutDashboard className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">Lista invitati in admin</p>
                      <p className="mt-0.5 text-xs" style={{ color: theme.muted }}>
                        Status, persoane si mesaje in acelasi loc
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full border px-3 py-1 text-xs font-semibold" style={{ borderColor: theme.border, color: theme.muted }}>
                    84 raspunsuri
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {guestAdminRows.map((guest) => (
                    <ScrollBlurCard
                      key={guest.name}
                      className="rounded-[22px] border bg-[#fcfbf8] px-4 py-3"
                      style={{ borderColor: theme.border }}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">{guest.name}</p>
                          <p className="mt-1 text-xs" style={{ color: theme.muted }}>
                            {guest.status === "Confirmat"
                              ? "Raspuns validat si gata de organizare"
                              : "Asteapta inca un raspuns final"}
                          </p>
                        </div>
                        <span
                          className="rounded-full px-3 py-1 text-[11px] font-semibold"
                          style={{
                            backgroundColor: guest.status === "Confirmat" ? "#edf7e9" : "#f2efe9",
                            color: guest.status === "Confirmat" ? "#315c2b" : theme.muted,
                          }}
                        >
                          {guest.status}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium" style={{ border: `1px solid ${theme.border}` }}>
                          <Users className="h-3.5 w-3.5" style={{ color: theme.accent }} />
                          {guest.people}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium" style={{ border: `1px solid ${theme.border}` }}>
                          <Armchair className="h-3.5 w-3.5" style={{ color: "#3f71d1" }} />
                          {guest.table}
                        </span>
                      </div>

                      <div className="mt-3 flex items-start gap-2 rounded-2xl bg-white px-3 py-2.5" style={{ border: `1px solid ${theme.border}` }}>
                        <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: theme.muted }} />
                        <p className="text-xs leading-5" style={{ color: theme.muted }}>
                          {guest.note}
                        </p>
                      </div>
                    </ScrollBlurCard>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[28px] bg-[#17261b] p-5 text-white shadow-[0_24px_60px_rgba(23,38,27,0.18)] sm:p-6">
                  <p className="text-sm text-white/62">Panou de control clar</p>
                  <h4 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                    Vezi rapid cum arata lista inainte sa asezi invitatii
                  </h4>
                  <AdminPanelGifPreview />
                </div>

                <div className="rounded-[28px] border bg-white p-5 shadow-[0_20px_45px_rgba(16,23,23,0.06)] sm:p-6" style={{ borderColor: theme.border }}>
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff4ee] text-[#ff7633]">
                      <Users className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">Ce castiga utilizatorul</p>
                      <p className="mt-0.5 text-xs" style={{ color: theme.muted }}>
                        Mai putine decizii luate in graba
                      </p>
                    </div>
                  </div>

                  <CascadingBenefits />
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

function SupplierShowcase() {
  const [showcaseConfig, setShowcaseConfig] =
    useState<LandingSupplierShowcaseConfig>(
      defaultLandingSupplierShowcaseConfig,
    );
  const supplierColumns = [
    showcaseConfig.items.filter((_, index) => index % 2 === 0),
    showcaseConfig.items.filter((_, index) => index % 2 === 1),
  ];

  useEffect(() => {
    let isActive = true;

    fetch(`${API_URL}/config/landing-supplier-showcase`)
      .then((response) => {
        if (!response.ok) throw new Error("Supplier showcase unavailable");
        return response.json();
      })
      .then((data) => {
        if (
          !isActive ||
          !data?.sectionEyebrow ||
          !data?.sectionTitle ||
          !data?.sectionDescription ||
          !data?.eyebrow ||
          !data?.title ||
          !data?.description ||
          !Array.isArray(data?.items) ||
          data.items.length < 2
        ) {
          return;
        }

        setShowcaseConfig(data);
      })
      .catch(() => undefined);

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <section className="px-4 py-10 md:px-8 md:py-16">
      <style>{`
        @keyframes wpSupplierColumnUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }

        @keyframes wpSupplierColumnDown {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
      `}</style>

      <div className="mx-auto max-w-[1280px]">
        <SectionIntro
          eyebrow={showcaseConfig.sectionEyebrow}
          title={showcaseConfig.sectionTitle}
          description={showcaseConfig.sectionDescription}
        />

        <div
          className="mt-12 overflow-hidden rounded-[38px] border px-5 py-6 sm:px-7 sm:py-8 lg:px-10 lg:py-10"
          style={{
            borderColor: theme.border,
            background:
              "radial-gradient(circle at top left, rgba(255, 118, 51, 0.12), transparent 28%), radial-gradient(circle at bottom right, rgba(120, 168, 255, 0.14), transparent 26%), #f8f6f1",
          }}
        >
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-[0.24em]"
                style={{ color: theme.accent }}
              >
                {showcaseConfig.eyebrow}
              </p>
              <h2
                className="mt-3 max-w-xl"
                style={sectionTitleStyle}
              >
                {showcaseConfig.title}
              </h2>
              <p
                className="mt-5 max-w-lg text-base leading-7 md:text-lg"
                style={{ color: theme.muted }}
              >
                {showcaseConfig.description}
              </p>

              <div className="mt-8 flex flex-wrap gap-2.5">
                {showcaseConfig.tags.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border bg-white/80 px-4 py-2 text-xs font-medium"
                    style={{ borderColor: theme.border, color: theme.text }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-16 bg-gradient-to-b from-[#f8f6f1] to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-16 bg-gradient-to-t from-[#f8f6f1] to-transparent" />

              <div className="grid h-[460px] grid-cols-2 gap-3 overflow-hidden sm:h-[580px] sm:gap-4 lg:h-[720px]">
                {supplierColumns.map((column, columnIndex) => {
                  const loopItems = [...column, ...column];

                  return (
                    <div
                      key={`supplier-column-${columnIndex}`}
                      className="overflow-hidden rounded-[28px] border bg-white/58 p-2 sm:p-3"
                      style={{ borderColor: theme.border }}
                    >
                      <div
                        className="flex flex-col gap-3 sm:gap-4"
                        style={{
                          animation: `${columnIndex === 0 ? "wpSupplierColumnUp" : "wpSupplierColumnDown"} ${columnIndex === 0 ? 30 : 34}s linear infinite`,
                        }}
                      >
                        {loopItems.map((item, itemIndex) => (
                          <article
                            key={`${item.title}-${itemIndex}`}
                            className="overflow-hidden rounded-[24px] border bg-white shadow-[0_18px_40px_rgba(16,23,23,0.08)]"
                            style={{ borderColor: theme.border }}
                          >
                            <div className="aspect-[0.92/1] overflow-hidden">
                              <img
                                src={resolveMediaUrl(item.image)}
                                alt={item.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="p-4 sm:p-5">
                              <span
                                className="inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
                                style={{
                                  backgroundColor: item.accent,
                                  color: theme.text,
                                }}
                              >
                                {item.category}
                              </span>
                              <h3 className="mt-3 text-lg font-semibold tracking-[-0.03em] sm:text-[22px]">
                                {item.title}
                              </h3>
                              <p
                                className="mt-2 text-xs leading-5 sm:text-sm sm:leading-6"
                                style={{ color: theme.muted }}
                              >
                                {item.note}
                              </p>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProcessStepCard({
  step,
  index,
  totalSteps,
  progress,
}: {
  step: LandingProcessStep;
  index: number;
  totalSteps: number;
  progress: MotionValue<number>;
}) {
  const cardContainerRef = React.useRef<HTMLDivElement | null>(null);
  const mediaFirst = index % 2 === 1;
  const mediaMode = step.mediaMode || (index === 0 ? "loop" : "popup");
  const targetScale = Math.max(
    0.82,
    1 - (totalSteps - index) * 0.028
  );
  const rangeStart = index / totalSteps;
  const cardScale = useTransform(progress, [rangeStart, 1], [1, targetScale]);
  const { scrollYProgress } = useScroll({
    target: cardContainerRef,
    offset: ["start end", "start start"],
  });
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1.12, 1]);

  return (
    <div
      ref={cardContainerRef}
      className="sticky top-0 flex h-screen items-center justify-center"
      style={{ zIndex: index + 1 }}
    >
      <motion.article
        className="relative grid h-[68vh] max-h-[620px] min-h-[500px] w-full min-w-0 origin-top overflow-hidden rounded-[30px] shadow-[0_22px_46px_-12px_rgba(16,23,23,0.18)] will-change-transform lg:h-[64vh] lg:max-h-[580px] lg:min-h-[450px] lg:grid-cols-[0.9fr_1.1fr]"
        style={{
          backgroundColor: step.background,
          scale: cardScale,
          top: `calc(-4vh + ${index * 14}px)`,
        }}
      >
        <div
          className={`flex min-w-0 flex-col justify-between p-6 sm:p-8 lg:p-9 ${mediaFirst ? "lg:order-2" : ""}`}
        >
          <div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: theme.muted }}>
                Pasul {String(index + 1).padStart(2, "0")}
              </span>
              <span className="h-px flex-1" style={{ backgroundColor: theme.border }} />
              <span className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: theme.accent }}>
                {step.label}
              </span>
            </div>

            <h3 className="mt-5 max-w-xl" style={processStepTitleStyle}>
              {step.title}
            </h3>
            <p className="mt-3 max-w-xl text-sm leading-6 md:text-[15px] md:leading-7" style={{ color: theme.muted }}>
              {step.description}
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {step.points.map((point) => (
              <span
                key={point}
                className="rounded-full border bg-white/60 px-3.5 py-1.5 text-xs font-medium"
                style={{ borderColor: theme.border }}
              >
                {point}
              </span>
            ))}
          </div>
        </div>

        <div
          className={`relative flex items-center justify-center overflow-hidden p-3 sm:p-5 lg:p-6 ${mediaFirst ? "lg:order-1" : ""}`}
          style={{
            background:
              "radial-gradient(circle at 50% 36%, rgba(255,255,255,0.95), rgba(255,255,255,0.2) 45%, transparent 70%)",
          }}
        >
          <div className="pointer-events-none absolute left-[12%] top-[14%] h-24 w-24 rounded-full border border-white/70" />
          <div className="pointer-events-none absolute bottom-[12%] right-[10%] h-40 w-40 rounded-full border border-white/60" />

          <motion.div
            className="w-full max-w-[700px]"
            style={{ scale: mediaScale }}
          >
            <VideoPlayer
              thumbnailUrl={resolveMediaUrl(step.posterSrc || step.videoSrc)}
              videoUrl={resolveMediaUrl(step.videoSrc)}
              title={step.title}
              aspectRatio="16/9"
              showDetails={false}
              previewAsVideo={mediaMode === "loop"}
              openInModal={mediaMode === "popup"}
              showPlayButton={mediaMode === "popup"}
              className="w-full rounded-[26px]"
            />
          </motion.div>

        </div>
      </motion.article>
    </div>
  );
}

function ProcessVideoShowcase() {
  const [processConfig, setProcessConfig] =
    useState<LandingProcessConfig>(defaultLandingProcessConfig);
  const processCardsRef = React.useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: processCardsRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    let isActive = true;

    fetch(`${API_URL}/config/landing-process`)
      .then((response) => {
        if (!response.ok) throw new Error("Process config unavailable");
        return response.json();
      })
      .then((data) => {
        if (
          !isActive ||
          !data?.eyebrow ||
          !data?.introDescription ||
          !data?.title ||
          !data?.ctaLabel ||
          !Array.isArray(data?.steps) ||
          data.steps.length === 0
        ) {
          return;
        }

        setProcessConfig(data);
      })
      .catch(() => undefined);

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <section id="process" className="px-4 py-10 md:px-8 md:py-28">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: theme.accent }}>
              {processConfig.eyebrow}
            </p>
            <p className="mt-4 max-w-sm text-sm leading-7 md:text-base" style={{ color: theme.muted }}>
              {processConfig.introDescription}
            </p>
          </div>
          <SplitText
            key={`landing-process-title-${processConfig.title}`}
            text={processConfig.title}
            tag="h2"
            splitType="words"
            delay={95}
            duration={1.15}
            className="max-w-4xl"
            style={heroTitleStyle}
            from={{ opacity: 0, y: 54, filter: "blur(9px)" }}
            to={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          />
        </div>

        <div ref={processCardsRef} className="mt-10 md:mt-14">
          {processConfig.steps.map((step, index) => (
            <ProcessStepCard
              key={step.id}
              step={step}
              index={index}
              totalSteps={processConfig.steps.length}
              progress={scrollYProgress}
            />
          ))}
        </div>

        <div className="mt-8 flex justify-center md:mt-12">
          <PrimaryButton href="/register" label={processConfig.ctaLabel} />
        </div>
      </div>
    </section>
  );
}

function ScrollFadeCard({
  children,
  className,
  style,
  direction = "left",
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  direction?: "left" | "right";
}) {
  const cardRef = React.useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start 94%", "start 52%"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.68, 1], [0, 1, 1]);
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    [direction === "left" ? -38 : 38, 0],
  );
  const y = useTransform(scrollYProgress, [0, 1], [28, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.975, 1]);

  return (
    <motion.div
      ref={cardRef}
      className={className}
      style={{
        ...style,
        opacity,
        x,
        y,
        scale,
        willChange: "transform, opacity",
      }}
    >
      {children}
    </motion.div>
  );
}

function LinkAccessShowcase() {

  const options = [
    {
      title: "Link public (slug)",
      description:
        "Setezi un link usor de retinut si il poti trimite oriunde: WhatsApp, Messenger, email sau social media.",
      icon: Globe,
      tint: "#eef5ff",
      color: "#3f71d1",
    },
    {
      title: "Link-uri individuale",
      description:
        "Pentru invitatii din lista, platforma poate genera link-uri separate, ca sa vezi mai clar cine a deschis invitatia si cine a raspuns.",
      icon: Lock,
      tint: "#fff1e9",
      color: theme.accent,
    },
  ];

  const guestRows = [
    {
      name: "Alexandru P.",
      code: "txaohya13",
      source: "Link individual",
      status: "Vazut",
      statusTone: "#eef5ff",
      statusColor: "#3f71d1",
    },
    {
      name: "Familia Ionescu",
      code: "nunta-noastra/public",
      source: "Link public",
      status: "Confirmat",
      statusTone: "#edf7e9",
      statusColor: "#315c2b",
    },
  ];

  return (
    <section className="px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-[1280px]">
        <div
          className="relative overflow-hidden rounded-[38px] border p-6 sm:p-8 lg:p-10"
          style={{
            borderColor: theme.border,
            background:
              "radial-gradient(circle at top right, rgba(120, 168, 255, 0.15), transparent 24%), radial-gradient(circle at left bottom, rgba(255, 118, 51, 0.12), transparent 22%), #f8f6f1",
          }}
        >
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="relative">
              <p
                className="text-xs font-semibold uppercase tracking-[0.24em]"
                style={{ color: "#3f71d1" }}
              >
                Distribuire & acces
              </p>
              <h2 className="mt-4" style={sectionTitleStyle}>
                <AnimatedUnderlineText
                  underlineClassName="text-[#4f80a8]"
                  underlineDuration={0}
                >
                  Un link.
                </AnimatedUnderlineText>
                <br />
                <span
                  style={{
                    ...titleGradientBase,
                    backgroundImage:
                      "linear-gradient(180deg, rgba(16, 23, 23, 0.64) 0%, rgba(16, 23, 23, 0.36) 100%)",
                  }}
                >
                  Sau <AnimatedUnderlineText
                  underlineClassName="text-[#4f80a8]"
                  underlineDuration={0}
                >
                 sute
                </AnimatedUnderlineText> de link-uri.
                </span>
              </h2>
              <p
                className="mt-6 max-w-xl text-sm leading-7 md:text-base"
                style={{ color: theme.muted }}
              >
                Alege cum vrei sa distribui invitatia. Daca ai nevoie de ceva
                simplu, mergi pe link public. Daca vrei mai mult control, lucrezi
                cu link-uri individuale si vezi mai clar cine a intrat si cine a
                raspuns.
              </p>

              <div className="mt-8 space-y-4">
                {options.map((item) => (
                  <ScrollFadeCard
                    key={item.title}
                    className="flex gap-4 rounded-[24px] border bg-white p-4 sm:p-5"
                    style={{ borderColor: theme.border }}
                  >
                    <span
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: item.tint, color: item.color }}
                    >
                      <item.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold tracking-[-0.03em]">
                        {item.title}
                      </h3>
                      <p
                        className="mt-2 text-sm leading-6"
                        style={{ color: theme.muted }}
                      >
                        {item.description}
                      </p>
                    </div>
                  </ScrollFadeCard>
                ))}
              </div>
            </div>

            <ScrollFadeCard
              direction="right"
              className="overflow-hidden rounded-[30px] border bg-white shadow-[0_24px_60px_rgba(16,23,23,0.08)]"
              style={{ borderColor: theme.border }}
            >
              <div
                className="flex items-center justify-between border-b px-4 py-3 sm:px-5"
                style={{ borderColor: theme.border, backgroundColor: "#fbfaf7" }}
              >
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#f2d8cc]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#f1e5b8]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#d9ecd2]" />
                </div>
                <div
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-medium"
                  style={{ borderColor: theme.border, color: theme.muted }}
                >
                  <Lock className="h-3.5 w-3.5" />
                  yes.events/guests
                </div>
              </div>

              <div className="p-4 sm:p-5 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold tracking-[-0.03em]">
                      Lista invitati & RSVP
                    </p>
                    <p className="mt-1 text-sm" style={{ color: theme.muted }}>
                      Gestioneaza link-urile si confirmarile din acelasi loc.
                    </p>
                  </div>
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold"
                    style={{ backgroundColor: "#edf7e9", color: "#315c2b" }}
                  >
                    Actualizat live
                  </span>
                </div>

                <div
                  className="mt-5 rounded-[24px] border px-4 py-4 sm:px-5"
                  style={{
                    borderColor: "rgba(63, 113, 209, 0.16)",
                    backgroundColor: "#eff5ff",
                  }}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#3f71d1]">
                        <Link2 className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold">
                          Configureaza link-ul public
                        </p>
                        <p className="mt-1 text-xs leading-5" style={{ color: theme.muted }}>
                          Alege slug-ul evenimentului si copiaza linkul imediat
                          din setari.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-full border px-4 py-2 text-xs font-semibold"
                      style={{ borderColor: "rgba(63, 113, 209, 0.25)", color: "#3f71d1" }}
                    >
                      Configurare
                    </button>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <div
                    className="flex flex-1 items-center gap-2 rounded-[18px] border px-3 py-3"
                    style={{ borderColor: theme.border, backgroundColor: "#fbfaf7", color: theme.muted }}
                  >
                    <Search className="h-4 w-4" />
                    <span className="text-xs sm:text-sm">Cauta invitat...</span>
                  </div>

                  <div className="flex gap-3 sm:w-auto">
                    <div
                      className="inline-flex items-center gap-2 rounded-[18px] border px-3 py-3"
                      style={{ borderColor: theme.border, backgroundColor: "#fbfaf7" }}
                    >
                      <Crown className="h-4 w-4" style={{ color: theme.accent }} />
                      <span className="text-xs font-medium" style={{ color: theme.muted }}>
                        Limita (1/50)
                      </span>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-[18px] border px-4 py-3 text-xs font-semibold"
                      style={{ borderColor: theme.border, color: theme.muted }}
                    >
                      + Adauga
                    </button>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {guestRows.map((row) => (
                    <div
                      key={row.name}
                      className="rounded-[22px] border p-3 sm:p-4"
                      style={{ borderColor: theme.border, backgroundColor: "#fcfbf8" }}
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                        <div className="flex min-w-0 items-center gap-3 lg:w-[200px]">
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                            style={{ backgroundColor: "#efece6", color: theme.muted }}
                          >
                            <User className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                              {row.name}
                            </p>
                            <p className="text-xs" style={{ color: theme.muted }}>
                              {row.source}
                            </p>
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div
                            className="flex items-center gap-2 rounded-[16px] border bg-white px-3 py-2"
                            style={{ borderColor: theme.border }}
                          >
                            <Link2 className="h-3.5 w-3.5 shrink-0" style={{ color: theme.muted }} />
                            <span
                              className="min-w-0 flex-1 truncate text-xs font-mono"
                              style={{ color: theme.muted }}
                            >
                              {row.code}
                            </span>
                            <Copy className="h-3.5 w-3.5 shrink-0" style={{ color: theme.muted }} />
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 lg:w-[170px] lg:justify-end">
                          <span
                            className="rounded-full px-3 py-1 text-[11px] font-semibold"
                            style={{ backgroundColor: row.statusTone, color: row.statusColor }}
                          >
                            {row.status}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              className="flex h-9 w-9 items-center justify-center rounded-full border bg-white"
                              style={{ borderColor: theme.border, color: theme.muted }}
                            >
                              <Send className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              className="flex h-9 w-9 items-center justify-center rounded-full border bg-white"
                              style={{ borderColor: theme.border, color: theme.muted }}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollFadeCard>
          </div>
        </div>
      </div>
    </section>
  );
}

function GuestAnswersShowcase() {
  const answerCards = [
    {
      title: "Unde este evenimentul",
      description:
        "Invitatul vede locatia, adresa si deschide rapid traseul fara sa mai ceara pin pe chat.",
      icon: MapPin,
      accent: "#3f71d1",
      tone: "#eef5ff",
      tags: ["Locatie", "Adresa", "Waze"],
    },
    {
      title: "La ce ora incepe",
      description:
        "Programul zilei si orele importante stau direct in invitatie, usor de verificat de pe telefon.",
      icon: CalendarDays,
      accent: "#4f8b48",
      tone: "#eef7ea",
      tags: ["Program", "Calendar", "Timeline"],
    },
    {
      title: "Cum confirm prezenta",
      description:
        "RSVP-ul se face din acelasi link, iar raspunsul ajunge imediat in contul vostru.",
      icon: CheckCircle2,
      accent: theme.accent,
      tone: "#fff1e9",
      tags: ["RSVP", "Status", "Mesaj"],
    },
    {
      title: "Cum va contactez rapid",
      description:
        "Daca aveti activ butonul de contact, invitatul gaseste imediat canalul potrivit pentru un raspuns rapid.",
      icon: Phone,
      accent: "#2f8572",
      tone: "#eaf7f3",
      tags: ["Telefon", "WhatsApp", "Contact"],
    },
    {
      title: "Ce fac cu lista de cadouri",
      description:
        "Cand folositi blocul dedicat, informatia despre cadouri sau wishlist ramane clara si la vedere.",
      icon: Gift,
      accent: "#b85b8d",
      tone: "#fbecf4",
      tags: ["Cadouri", "Wishlist", "Detalii"],
    },
    {
      title: "Totul intr-un singur loc",
      description:
        "Invitatia devine punctul central pentru intrebari uzuale, fara mesaje repetate si fara explicatii trimise separat.",
      icon: Link2,
      accent: "#101717",
      tone: "#f1efea",
      tags: ["Un singur link", "Mai putin haos", "Mai putine intrebari"],
    },
  ];

  return (
    <section className="px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-[1280px]">
        <div className="mx-auto max-w-4xl text-center">
          <p
            className="text-xs font-semibold uppercase tracking-[0.24em]"
            style={{ color: theme.accent }}
          >
            Informatii clare pentru invitati
          </p>
          <h2 className="mt-4" style={sectionTitleStyle}>
            Invitatii tai au{" "}
            <AnimatedUnderlineText
              textColor="#ff7633"
              underlineClassName="text-[#4f80a8]"
              underlineDuration={1.35}
            >
              intrebari
            </AnimatedUnderlineText>
            ?
            <br />
            Platforma Esa are raspunsurile.
          </h2>
          <p
            className="mx-auto mt-6 max-w-2xl text-sm leading-7 md:text-base"
            style={{ color: theme.muted }}
          >
            Nu mai raspunzi manual la aceleasi mesaje. Invitatia poate sa
            explice singura ce conteaza: locatie, program, confirmare si
            informatiile utile pentru ziua evenimentului.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {answerCards.map((card) => (
            <article
              key={card.title}
              className="rounded-[30px] border bg-white p-6 sm:p-7"
              style={{ borderColor: theme.border, boxShadow: "0 22px 55px rgba(16, 23, 23, 0.05)" }}
            >
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ backgroundColor: card.tone, color: card.accent }}
              >
                <card.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-6" style={cardTitleStyle}>
                {card.title}
              </h3>
              <p
                className="mt-4 text-sm leading-7 md:text-base"
                style={{ color: theme.muted }}
              >
                {card.description}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {card.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border px-3 py-1.5 text-xs font-medium"
                    style={{ borderColor: theme.border, backgroundColor: "#faf9f6" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClosingCtaShowcase() {
  return (
    <section className="px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-[1280px]">
        <div
          className="relative overflow-hidden rounded-[38px] border px-6 py-12 sm:px-8 md:px-10 md:py-16"
          style={{
            borderColor: theme.border,
            background:
              "radial-gradient(circle at top right, rgba(255, 118, 51, 0.12), transparent 25%), radial-gradient(circle at bottom left, rgba(132, 186, 221, 0.14), transparent 22%), linear-gradient(135deg, #f8f6f1 0%, #ffffff 54%, #f3f8fb 100%)",
          }}
        >
          <div className="mx-auto max-w-[860px] text-center">
            <div
              className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
              style={{ borderColor: theme.border, color: theme.accent }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Disponibil acum
            </div>

            <h2 className="mt-6" style={sectionTitleStyle}>
              Esti gata sa trimiti invitatia si sa organizezi totul mai simplu?
            </h2>

            <p
              className="mx-auto mt-5 max-w-[620px] text-sm leading-7 md:text-base"
              style={{ color: theme.muted }}
            >
              Landing page-ul nou explica mai clar produsul, iar platforma face
              mai usor exact ce promite: invitatie, RSVP si organizare intr-un
              singur loc.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <PrimaryButton href="/register" label="Creeaza cont" />
              <a
                href="/login"
                className="inline-flex items-center gap-2 rounded-full border bg-white px-6 py-3 text-sm font-medium transition-transform duration-200 hover:-translate-y-0.5"
                style={{ borderColor: theme.border, color: theme.text }}
              >
                Intra in platforma
              </a>
            </div>

            <div
              className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium"
              style={{ color: theme.muted }}
            >
              {["Invitatie digitala", "RSVP centralizat", "Planificare completa"].map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5" style={{ color: theme.accent }} />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function getWrappedIndex(index: number, total: number) {
  return ((index % total) + total) % total;
}

function getFanCardStyle(
  offset: number,
  compactLayout: boolean,
): React.CSSProperties {
  const desktopPreset: Record<number, React.CSSProperties> = {
    0: {
      transform: "translateX(-50%) translateY(0px) rotate(0deg) scale(1)",
      opacity: 1,
      filter: "blur(0px) brightness(1)",
      zIndex: 40,
      boxShadow: "0 30px 90px rgba(0, 0, 0, 0.45)",
    },
    1: {
      transform:
        "translateX(calc(-50% + 250px)) translateY(86px) rotate(12deg) scale(0.86)",
      opacity: 0.96,
      filter: "blur(3px) brightness(0.78)",
      zIndex: 30,
      boxShadow: "0 22px 56px rgba(0, 0, 0, 0.34)",
    },
    [-1]: {
      transform:
        "translateX(calc(-50% - 250px)) translateY(86px) rotate(-12deg) scale(0.86)",
      opacity: 0.96,
      filter: "blur(3px) brightness(0.78)",
      zIndex: 30,
      boxShadow: "0 22px 56px rgba(0, 0, 0, 0.34)",
    },
    2: {
      transform:
        "translateX(calc(-50% + 445px)) translateY(128px) rotate(18deg) scale(0.72)",
      opacity: 0.68,
      filter: "blur(7px) brightness(0.58)",
      zIndex: 20,
      boxShadow: "0 14px 36px rgba(0, 0, 0, 0.22)",
    },
    3: {
      transform:
        "translateX(calc(-50% + 590px)) translateY(148px) rotate(24deg) scale(0.6)",
      opacity: 0.08,
      filter: "blur(10px) brightness(0.45)",
      zIndex: 10,
      pointerEvents: "none",
      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
    },
    [-2]: {
      transform:
        "translateX(calc(-50% - 445px)) translateY(128px) rotate(-18deg) scale(0.72)",
      opacity: 0.68,
      filter: "blur(7px) brightness(0.58)",
      zIndex: 20,
      boxShadow: "0 14px 36px rgba(0, 0, 0, 0.22)",
    },
    [-3]: {
      transform:
        "translateX(calc(-50% - 590px)) translateY(148px) rotate(-24deg) scale(0.6)",
      opacity: 0.08,
      filter: "blur(10px) brightness(0.45)",
      zIndex: 10,
      pointerEvents: "none",
      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
    },
  };

  const compactPreset: Record<number, React.CSSProperties> = {
    0: {
      transform: "translateX(-50%) translateY(0px) rotate(0deg) scale(1)",
      opacity: 1,
      filter: "blur(0px) brightness(1)",
      zIndex: 40,
      boxShadow: "0 28px 72px rgba(0, 0, 0, 0.42)",
    },
    1: {
      transform:
        "translateX(calc(-50% + 120px)) translateY(14px) rotate(11deg) scale(0.8)",
      opacity: 0.82,
      filter: "blur(3px) brightness(0.72)",
      zIndex: 30,
      boxShadow: "0 18px 40px rgba(0, 0, 0, 0.28)",
    },
    [-1]: {
      transform:
        "translateX(calc(-50% - 120px)) translateY(14px) rotate(-11deg) scale(0.8)",
      opacity: 0.82,
      filter: "blur(3px) brightness(0.72)",
      zIndex: 30,
      boxShadow: "0 18px 40px rgba(0, 0, 0, 0.28)",
    },
    2: {
      transform:
        "translateX(calc(-50% + 185px)) translateY(44px) rotate(17deg) scale(0.66)",
      opacity: 0.12,
      filter: "blur(8px) brightness(0.5)",
      zIndex: 16,
      pointerEvents: "none",
      boxShadow: "0 8px 22px rgba(0, 0, 0, 0.16)",
    },
    [-2]: {
      transform:
        "translateX(calc(-50% - 185px)) translateY(44px) rotate(-17deg) scale(0.66)",
      opacity: 0.12,
      filter: "blur(8px) brightness(0.5)",
      zIndex: 16,
      pointerEvents: "none",
      boxShadow: "0 8px 22px rgba(0, 0, 0, 0.16)",
    },
  };

  const preset = compactLayout ? compactPreset : desktopPreset;
  const hiddenDirection = offset >= 0 ? 1 : -1;

  return (
    preset[offset] ?? {
      transform: `translateX(calc(-50% + ${hiddenDirection * 660}px)) translateY(166px) rotate(${hiddenDirection * 26}deg) scale(0.54)`,
      opacity: 0,
      filter: "blur(12px) brightness(0.4)",
      zIndex: 0,
      pointerEvents: "none",
      boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
    }
  );
}

function FeaturedAnimatedMedia({
  src,
  title,
  type,
}: {
  src: string;
  title: string;
  type: "video" | "gif";
}) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [activationId] = useState(
    () => `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );

  useEffect(() => {
    if (type !== "video" || !videoRef.current) return;

    const video = videoRef.current;
    video.pause();
    video.currentTime = 0;
    video.load();

    const playFromStart = () => {
      video.currentTime = 0;
      void video.play().catch(() => undefined);
    };

    if (video.readyState >= 1) {
      playFromStart();
    } else {
      video.addEventListener("loadedmetadata", playFromStart, { once: true });
    }

    return () => {
      video.removeEventListener("loadedmetadata", playFromStart);
    };
  }, [src, type]);

  if (type === "gif") {
    const separator = src.includes("?") ? "&" : "?";

    return (
      <img
        src={`${src}${separator}play=${activationId}`}
        alt={title}
        className="h-full w-full object-contain"
      />
    );
  }

  return (
    <video
      ref={videoRef}
      src={src}
      className="h-full w-full object-contain"
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      onLoadedMetadata={(event) => {
        event.currentTarget.currentTime = 0;
        void event.currentTarget.play().catch(() => undefined);
      }}
    />
  );
}

function FeaturedTemplatesCarousel() {
  const [carouselTemplates, setCarouselTemplates] =
    useState<FeaturedTemplateItem[]>(featuredTemplates);
  const [enabledCategories, setEnabledCategories] = useState<
    FeaturedTemplateCategory[]
  >(["wedding", "baptism", "anniversary"]);
  const [selectedCategory, setSelectedCategory] =
    useState<FeaturedTemplateCategory>("wedding");
  const [renderedCategory, setRenderedCategory] =
    useState<FeaturedTemplateCategory>("wedding");
  const [activeIndex, setActiveIndex] = useState(0);
  const [compactLayout, setCompactLayout] = useState(false);
  const [shufflePhase, setShufflePhase] = useState<
    "closing" | "opening" | "expanding" | null
  >(null);
  const [animation, setAnimation] = useState<{
    direction: "next" | "prev";
    phase: "prepare" | "running";
  } | null>(null);
  const shuffleTimeoutRef = React.useRef<number | null>(null);
  const shuffleFrameRef = React.useRef<number | null>(null);
  const visibleCategories = featuredTemplateCategories.filter((category) =>
    enabledCategories.includes(category.id),
  );
  const configuredCategoryTemplates = carouselTemplates.filter(
    (template) => template.collection === renderedCategory,
  );
  const categoryTemplates =
    configuredCategoryTemplates.length > 0
      ? configuredCategoryTemplates
      : featuredTemplates.filter(
          (template) => template.collection === renderedCategory,
        );
  const totalCards = categoryTemplates.length;
  const transitionDurationMs = 950;

  useEffect(() => {
    let isActive = true;

    fetch(`${API_URL}/config/landing-featured-carousel`)
      .then((response) => {
        if (!response.ok) throw new Error("Carousel config unavailable");
        return response.json();
      })
      .then((data) => {
        if (!isActive) return;

        const configuredEnabledCategories = Array.isArray(
          data?.enabledCollections,
        )
          ? data.enabledCollections.filter(
              (collection: FeaturedTemplateCategory) =>
                featuredTemplateCategories.some(
                  (category) => category.id === collection,
                ),
            )
          : [];

        if (configuredEnabledCategories.length > 0) {
          setEnabledCategories(configuredEnabledCategories);
        }

        if (!Array.isArray(data?.items) || data.items.length === 0) return;

        const configuredItems = data.items.filter(
          (item: FeaturedTemplateItem) =>
            item?.id &&
            item?.title &&
            item?.previewSrc &&
            featuredTemplateCategories.some(
              (category) => category.id === item.collection,
            ),
        );

        const categoriesToValidate =
          configuredEnabledCategories.length > 0
            ? configuredEnabledCategories
            : enabledCategories;
        const hasEveryEnabledCategory = categoriesToValidate.every(
          (collection: FeaturedTemplateCategory) =>
            configuredItems.some(
              (item: FeaturedTemplateItem) =>
                item.collection === collection,
            ),
        );

        if (hasEveryEnabledCategory) {
          setCarouselTemplates(configuredItems);
        }
      })
      .catch(() => undefined);

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (enabledCategories.includes(selectedCategory)) return;

    const firstEnabledCategory = enabledCategories[0];
    if (!firstEnabledCategory) return;

    setSelectedCategory(firstEnabledCategory);
    setRenderedCategory(firstEnabledCategory);
    setActiveIndex(0);
    setAnimation(null);
    setShufflePhase(null);
  }, [enabledCategories, selectedCategory]);

  useEffect(() => {
    const syncLayout = () => {
      setCompactLayout(window.innerWidth < 900);
    };

    syncLayout();
    window.addEventListener("resize", syncLayout);

    return () => window.removeEventListener("resize", syncLayout);
  }, []);

  useEffect(
    () => () => {
      if (shuffleTimeoutRef.current !== null) {
        window.clearTimeout(shuffleTimeoutRef.current);
      }
      if (shuffleFrameRef.current !== null) {
        window.cancelAnimationFrame(shuffleFrameRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (!animation) return;

    if (animation.phase === "prepare") {
      const frameId = window.requestAnimationFrame(() => {
        setAnimation((current) =>
          current ? { ...current, phase: "running" } : null,
        );
      });

      return () => window.cancelAnimationFrame(frameId);
    }

    const timeoutId = window.setTimeout(() => {
      setActiveIndex((current) =>
        getWrappedIndex(
          current + (animation.direction === "next" ? 1 : -1),
          totalCards,
        ),
      );
      setAnimation(null);
    }, transitionDurationMs);

    return () => window.clearTimeout(timeoutId);
  }, [animation, totalCards]);

  const startAnimation = (direction: "next" | "prev") => {
    if (animation || shufflePhase) return;
    setAnimation({ direction, phase: "prepare" });
  };

  const goToPrevious = () => {
    startAnimation("prev");
  };

  const goToNext = () => {
    startAnimation("next");
  };

  const changeCategory = (category: FeaturedTemplateCategory) => {
    if (
      category === selectedCategory ||
      animation ||
      shufflePhase
    ) {
      return;
    }

    setSelectedCategory(category);
    setShufflePhase("closing");

    shuffleTimeoutRef.current = window.setTimeout(() => {
      setRenderedCategory(category);
      setActiveIndex(0);
      setAnimation(null);
      setShufflePhase("opening");

      shuffleFrameRef.current = window.requestAnimationFrame(() => {
        shuffleFrameRef.current = window.requestAnimationFrame(() => {
          setShufflePhase("expanding");
          shuffleTimeoutRef.current = window.setTimeout(() => {
            setShufflePhase(null);
          }, 520);
        });
      });
    }, 420);
  };

  const visibleOffsets = compactLayout ? [-1, 0, 1] : [-2, -1, 0, 1, 2];
  const minOffset = visibleOffsets[0];
  const maxOffset = visibleOffsets[visibleOffsets.length - 1];

  const renderOffsets = animation
    ? animation.direction === "next"
      ? Array.from({ length: maxOffset - minOffset + 2 }, (_, index) => minOffset + index)
      : Array.from({ length: maxOffset - minOffset + 2 }, (_, index) => minOffset - 1 + index)
    : visibleOffsets;

  return (
    <div
      className="relative overflow-hidden rounded-[38px] px-4 py-12 text-white md:px-8 md:py-16"
      style={{ backgroundColor: "#050505" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at top, rgba(255,255,255,0.12), transparent 34%), radial-gradient(circle at center bottom, rgba(255,118,51,0.18), transparent 32%)",
        }}
      />

      <div className="relative mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d4cb7a]">
          Colectie de invitatii
        </p>
        <h3 className="mt-4" style={darkTitleStyle}>
          <ShinyText
                text="Descoperă invitații digitale premium pentru evenimentul tau."
                speed={3.4}
                delay={0.8}
                spread={115}
                shineColor="#fff"
                pauseOnHover
              />

        </h3>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-5 text-white/65 md:text-base">
          Explorează colecția noastră de template-uri,fiecare card se deschide elegant, cu detalii despre locație, program și confirmare.
        </p>

        <div
          className="mt-7 flex flex-wrap items-center justify-center gap-2"
          role="tablist"
          aria-label="Filtreaza invitatiile dupa tipul evenimentului"
        >
          {visibleCategories.map((category) => {
            const isSelected = selectedCategory === category.id;

            return (
              <button
                key={category.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                disabled={Boolean(animation) || Boolean(shufflePhase)}
                onClick={() => changeCategory(category.id)}
                className="relative overflow-hidden rounded-full border px-4 py-2 text-xs font-semibold transition-colors disabled:cursor-wait sm:px-5 sm:text-sm"
                style={{
                  borderColor: isSelected
                    ? "rgba(255,255,255,0.58)"
                    : "rgba(255,255,255,0.14)",
                  color: isSelected ? "#101717" : "rgba(255,255,255,0.68)",
                }}
              >
                {isSelected ? (
                  <motion.span
                    layoutId="featured-category-pill"
                    className="absolute inset-0 rounded-full bg-white"
                    transition={{
                      type: "spring",
                      stiffness: 310,
                      damping: 28,
                    }}
                  />
                ) : null}
                <span className="relative z-10">{category.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative mt-8 h-[430px] sm:h-[500px] md:mt-10 md:h-[620px]">
        {renderOffsets.map((logicalOffset) => {
          const virtualCardIndex = activeIndex + logicalOffset;
          const cardIndex = getWrappedIndex(virtualCardIndex, totalCards);
          const card = categoryTemplates[cardIndex];
          const displayOffset =
            animation?.phase === "running"
              ? logicalOffset + (animation.direction === "next" ? -1 : 1)
              : logicalOffset;
          const previewSrc = resolveMediaUrl(card.previewSrc);
          const posterSrc = card.posterSrc
            ? resolveMediaUrl(card.posterSrc)
            : undefined;
          const mediaSrc = String(previewSrc).toLowerCase();
          const isVideo =
            mediaSrc.endsWith(".webm") || mediaSrc.endsWith(".mp4");
          const isGif = mediaSrc.endsWith(".gif");
          const isAnimatedMedia = isVideo || isGif;
          const isCentered = displayOffset === 0;
          const shouldPlayAnimatedMedia = isAnimatedMedia && isCentered;
          const fanStyle = getFanCardStyle(displayOffset, compactLayout);
          const isCollapsedShuffle =
            shufflePhase === "closing" || shufflePhase === "opening";
          const style = isCollapsedShuffle
            ? {
                ...fanStyle,
                transform: `translateX(-50%) translateY(${52 + Math.abs(logicalOffset) * 7}px) rotate(${logicalOffset * 3}deg) scale(0.76)`,
                opacity: 0,
                filter: "blur(12px) brightness(0.55)",
                zIndex: 40 - Math.abs(logicalOffset),
                pointerEvents: "none" as const,
                boxShadow: "0 12px 30px rgba(0, 0, 0, 0.2)",
              }
            : fanStyle;

          const handleCardClick = () => {
            if (animation || logicalOffset === 0) return;

            if (logicalOffset === 1) {
              startAnimation("next");
              return;
            }

            if (logicalOffset === -1) {
              startAnimation("prev");
              return;
            }

            setActiveIndex(cardIndex);
          };

          return (
            <button
              key={`featured-card-${renderedCategory}-${virtualCardIndex}`}
              type="button"
              aria-label={`Arata template-ul ${card.title}`}
              onClick={handleCardClick}
              className="absolute bottom-0 left-1/2 w-[220px] overflow-hidden rounded-[30px] border border-white/10 bg-white/5 text-left sm:w-[250px] md:w-[290px] lg:w-[330px]"
              style={{
                ...style,
                transformOrigin: "center bottom",
                willChange:
                  animation?.phase === "running" && Math.abs(displayOffset) <= 1
                    ? "transform, opacity"
                    : "auto",
                transitionProperty: "transform, opacity, filter, box-shadow",
                transitionDuration:
                  shufflePhase
                    ? "420ms"
                    : animation?.phase === "running"
                    ? `${transitionDurationMs}ms`
                    : "0ms",
                transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              <div className="relative aspect-[360/640] overflow-hidden bg-black">
                {shouldPlayAnimatedMedia ? (
                  <FeaturedAnimatedMedia
                    key={`featured-animated-${cardIndex}`}
                    src={previewSrc}
                    title={card.title}
                    type={isGif ? "gif" : "video"}
                  />
                ) : (
                  <img
                    src={
                      isAnimatedMedia && posterSrc
                        ? posterSrc
                        : previewSrc
                    }
                    alt={card.title}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="relative mt-4 flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={goToPrevious}
          disabled={Boolean(animation) || Boolean(shufflePhase)}
          aria-label="Template anterior"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/8 text-white transition hover:bg-white/14"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2">
          {categoryTemplates.map((card, dotIndex) => (
            <button
              key={`featured-dot-${renderedCategory}-${card.id}`}
              type="button"
              aria-label={`Mergi la template-ul ${card.title}`}
              disabled={Boolean(animation) || Boolean(shufflePhase)}
              onClick={() => setActiveIndex(dotIndex)}
              className="h-2 rounded-full"
              style={{
                width: dotIndex === activeIndex ? 20 : 8,
                backgroundColor:
                  dotIndex === activeIndex ? "#ffffff" : "rgba(255,255,255,0.28)",
                transition: "width 420ms cubic-bezier(0.22, 1, 0.36, 1), background-color 420ms ease",
              }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={goToNext}
          disabled={Boolean(animation) || Boolean(shufflePhase)}
          aria-label="Template urmator"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/8 text-white transition hover:bg-white/14"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

type EventType = (typeof eventTypes)[number];

function EventTypeCard({
  eventType,
  className,
  mobile = false,
}: {
  eventType: EventType;
  className?: string;
  mobile?: boolean;
}) {
  return (
    <article
      className={`relative overflow-hidden rounded-[30px] border ${
        mobile ? "min-h-[360px] p-4" : "p-7 md:p-8"
      } ${className ?? ""}`}
      style={{ backgroundColor: theme.soft, borderColor: theme.border }}
    >
      <div
        className="absolute -right-6 top-4 h-28 w-28 rounded-full blur-3xl"
        style={{ backgroundColor: eventType.accent }}
      />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <span
            className="flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ backgroundColor: eventType.accent, color: theme.text }}
          >
            <eventType.icon className="h-6 w-6" />
          </span>
          <span
            className="rounded-full border bg-white/84 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
            style={{ borderColor: theme.border, color: theme.muted }}
          >
            {eventType.tag}
          </span>
        </div>
        <h3 className={mobile ? "mt-4" : "mt-6"} style={cardTitleStyle}>
          {eventType.title}
        </h3>
        <p
          className={`${mobile ? "mt-3 leading-6" : "mt-4 leading-7"} text-sm md:text-base`}
          style={{ color: theme.muted }}
        >
          {eventType.description}
        </p>
        <ul className={mobile ? "mt-4 space-y-2" : "mt-6 space-y-3"}>
          {eventType.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-3 text-sm leading-6">
              <CheckCircle2
                className="mt-0.5 h-4 w-4 shrink-0"
                style={{ color: theme.accent }}
              />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function MobileEventTypesScroller() {
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const [scrollDistance, setScrollDistance] = useState(0);
  const [sectionHeight, setSectionHeight] = useState("180vh");
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 58,
    damping: 21,
    mass: 0.72,
  });
  const x = useTransform(
    smoothProgress,
    [0, 1],
    [0, -scrollDistance],
  );
  const progressScale = useTransform(smoothProgress, [0, 1], [0.08, 1]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const updateMeasurements = () => {
      const distance = Math.max(0, track.scrollWidth - window.innerWidth);
      setScrollDistance(distance);
      setSectionHeight(
        `${Math.max(
          window.innerHeight * 1.8,
          window.innerHeight + distance * 0.38,
        )}px`,
      );
    };

    updateMeasurements();
    const resizeObserver = new ResizeObserver(updateMeasurements);
    resizeObserver.observe(track);
    window.addEventListener("resize", updateMeasurements);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateMeasurements);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative mt-3 md:hidden"
      style={{ height: sectionHeight }}
    >
      <div className="sticky top-[8svh] flex h-[84svh] flex-col justify-center overflow-hidden py-2">
        <div className="mb-3 flex items-center justify-between px-4">
          <p
            className="text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: theme.muted }}
          >
            Deruleaza pentru a explora
          </p>
          <span className="text-xs font-semibold" style={{ color: theme.accent }}>
            01 / 06
          </span>
        </div>

        <motion.div
          ref={trackRef}
          className="flex w-max gap-3 px-4"
          style={{ x }}
        >
          {eventTypes.map((eventType) => (
            <EventTypeCard
              key={eventType.title}
              eventType={eventType}
              mobile
              className="w-[calc(100vw-32px)] max-w-[350px] shrink-0"
            />
          ))}
        </motion.div>

        <div className="mx-4 mt-4 h-1 overflow-hidden rounded-full bg-[#ece8e0]">
          <motion.div
            className="h-full origin-left rounded-full"
            style={{
              backgroundColor: theme.accent,
              scaleX: progressScale,
            }}
          />
        </div>
      </div>
    </section>
  );
}

function PricingShowcase() {
  const [pricing, setPricing] = useState<PricingConfig>(defaultPricing);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const loadPricing = async () => {
      const endpoints = [
        `${API_URL}/config/pricing`,
        `${API_URL}/config/public`,
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            signal: controller.signal,
          });
          if (!response.ok) continue;

          const data = await response.json();
          const source = data?.pricing ?? data;
          const oldPriceValue = Number(source?.oldPrice);

          setPricing({
            basicPrice: normalizePriceInCents(
              source?.basicPrice,
              defaultPricing.basicPrice,
            ),
            premiumPrice: normalizePriceInCents(
              source?.premiumPrice,
              defaultPricing.premiumPrice,
            ),
            oldPrice:
              Number.isFinite(oldPriceValue) && oldPriceValue > 0
                ? normalizePriceInCents(
                    oldPriceValue,
                    defaultPricing.oldPrice ?? 10000,
                  )
                : undefined,
            currency: String(source?.currency || "ron").toLowerCase(),
          });
          setIsLoading(false);
          return;
        } catch (error) {
          if (controller.signal.aborted) return;
        }
      }

      setIsLoading(false);
    };

    loadPricing();
    return () => controller.abort();
  }, []);

  const plans = pricingPlanContent.map((plan) => {
    const price =
      plan.id === "basic"
        ? formatPrice(pricing.basicPrice, pricing.currency)
        : formatPrice(pricing.premiumPrice, pricing.currency);
    const originalPrice =
      plan.id === "premium" &&
      pricing.oldPrice &&
      pricing.oldPrice > pricing.premiumPrice
        ? formatPrice(pricing.oldPrice, pricing.currency)
        : undefined;

    return { ...plan, price, originalPrice };
  });

  return (
    <section id="pricing" className="px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-[1280px]">
        <SectionIntro
          eyebrow="Planuri"
          title="Alege varianta care se potriveste felului tau de organizare"
          description="Alege Basic pentru invitatie si RSVP sau Premium pentru organizarea completa a evenimentului."
        />

        <div
          className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-2"
          aria-busy={isLoading}
          aria-live="polite"
        >
          {plans.map((plan) => (
            <article
              key={plan.id}
              className="rounded-[30px] p-8"
              style={{
                backgroundColor: plan.featured ? theme.text : theme.soft,
                color: plan.featured ? "#fff" : theme.text,
              }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-[0.22em]"
                style={{
                  color: plan.featured
                    ? "rgba(255,255,255,0.65)"
                    : theme.accent,
                }}
              >
                {plan.subtitle}
              </p>
              <h3
                className="mt-4"
                style={
                  plan.featured ? darkPricingTitleStyle : pricingTitleStyle
                }
              >
                {plan.name}
              </h3>

              <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p
                  className={`text-2xl font-semibold transition-opacity ${
                    isLoading ? "opacity-45" : "opacity-100"
                  }`}
                >
                  {plan.price}
                </p>
                {plan.originalPrice ? (
                  <span
                    className="text-sm line-through"
                    style={{
                      color: plan.featured
                        ? "rgba(255,255,255,0.48)"
                        : theme.muted,
                    }}
                  >
                    {plan.originalPrice}
                  </span>
                ) : null}
              </div>
              <p
                className="mt-1 text-xs font-medium uppercase tracking-[0.16em]"
                style={{
                  color: plan.featured
                    ? "rgba(255,255,255,0.52)"
                    : theme.muted,
                }}
              >
                Plata unica
              </p>

              <p
                className="mt-5 text-sm leading-7 md:text-base"
                style={{
                  color: plan.featured
                    ? "rgba(255,255,255,0.76)"
                    : theme.muted,
                }}
              >
                {plan.description}
              </p>
              <ul className="mt-7 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm leading-6"
                  >
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0"
                      style={{
                        color: plan.featured ? "#fff" : theme.accent,
                      }}
                    />
                    {feature === "Acces la contactele furnizorilor" ? (
                      <AnimatedUnderlineText
                        underlineClassName="text-[#ff9a68]"
                        underlineDuration={1.2}
                        textColor="#ffffff"
                      >
                        {feature}
                      </AnimatedUnderlineText>
                    ) : (
                      <span>{feature}</span>
                    )}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <a
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium"
                  style={{
                    backgroundColor: plan.featured ? "#fff" : theme.accent,
                    color: plan.featured ? theme.text : "#fff",
                  }}
                >
                  Alege {plan.name}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNavbarCompact, setIsNavbarCompact] = useState(false);

  useEffect(() => {
    const sectionId = window.location.hash.slice(1);
    if (!sectionId) return;

    const timeoutId = window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView();
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const updateNavbar = () => {
      setIsNavbarCompact(window.scrollY > 24);
    };

    updateNavbar();
    window.addEventListener("scroll", updateNavbar, { passive: true });
    return () => window.removeEventListener("scroll", updateNavbar);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const closeMenu = () => setIsMobileMenuOpen(false);
    window.addEventListener("resize", closeMenu);
    return () => window.removeEventListener("resize", closeMenu);
  }, [isMobileMenuOpen]);

  return (
    <div
      className="landing-shell min-h-screen"
      style={{
        backgroundColor: theme.background,
        color: theme.text,
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-[99] h-[112px] bg-white/20 backdrop-blur-[14px] md:h-[122px]"
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 70%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, black 0%, black 70%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      <header className="pointer-events-none fixed inset-x-0 top-0 z-[100] px-3 pt-3 md:px-6">
        <motion.div
          className="pointer-events-auto relative mx-auto max-w-[1280px] rounded-[26px] border bg-white shadow-[0_18px_60px_rgba(16,23,23,0.12)]"
          animate={{
            maxWidth: isNavbarCompact ? 1120 : 1280,
            boxShadow: isNavbarCompact
              ? "0 20px 70px rgba(16,23,23,0.16)"
              : "0 14px 48px rgba(16,23,23,0.10)",
          }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          style={{ borderColor: theme.border }}
        >
          <div className="flex h-[68px] items-center justify-between gap-4 px-5 sm:px-6 md:h-[72px] md:px-8">
            <a
              href="/"
              className="flex shrink-0 items-center"
              aria-label="Event Smart Assistant - Acasa"
            >
              <img
                src="/brand/logo-esa-smart.svg"
                alt="Event Smart Assistant"
                className="h-auto w-[132px] object-contain sm:w-[166px]"
              />
            </a>

            <nav className="hidden items-center gap-1 rounded-full border bg-[#f8f6f1]/88 p-1 lg:flex" style={{ borderColor: theme.border }}>
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-full px-3.5 py-2 text-xs font-semibold transition-colors hover:bg-white hover:text-[#101717]"
                  style={{ color: theme.muted }}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <a
                href="/register"
                className="hidden items-center gap-2 rounded-full bg-[#ff7633] px-5 py-2.5 text-xs font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 md:inline-flex"
              >
                Creeaza cont
                <ArrowRight className="h-4 w-4" />
              </a>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((current) => !current)}
                className="flex h-10 w-10 items-center justify-center rounded-full border bg-white text-[#101717] transition-colors hover:bg-[#f8f6f1] lg:hidden"
                style={{ borderColor: theme.border }}
                aria-label={isMobileMenuOpen ? "Inchide meniul" : "Deschide meniul"}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isMobileMenuOpen ? (
              <motion.div
                className="absolute inset-x-0 top-[calc(100%+8px)] overflow-hidden rounded-[24px] border bg-white/96 p-3 shadow-[0_22px_70px_rgba(16,23,23,0.16)] backdrop-blur-xl lg:hidden"
                style={{ borderColor: theme.border }}
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              >
                <nav className="grid gap-1">
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-[#101717] transition-colors hover:bg-[#f8f6f1]"
                    >
                      {link.label}
                      <ChevronRight className="h-4 w-4 text-[#ff7633]" />
                    </a>
                  ))}
                  <a
                    href="/register"
                    className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-[#ff7633] px-4 py-3 text-sm font-semibold text-white"
                  >
                    Creeaza cont
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </nav>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </header>

      <main className="pt-[88px] md:pt-[94px]">
        <section
          id="hero"
          className="relative isolate min-h-[720px] overflow-hidden px-4 md:min-h-[calc(100vh-88px)] md:px-8"
        >
          <div className="wp-serviq-hero-sky pointer-events-none absolute inset-0 -z-20" />
          <div className="wp-serviq-cloud wp-serviq-cloud-left pointer-events-none absolute -z-10" />
          <div className="wp-serviq-cloud wp-serviq-cloud-right pointer-events-none absolute -z-10" />

          <div className="mx-auto flex min-h-[720px] max-w-[1280px] flex-col items-center justify-center pb-20 pt-16 text-center md:min-h-[calc(100vh-88px)] md:pb-24 md:pt-20">
            <div className="flex flex-col items-center">
              <div className="relative flex -space-x-2.5">
                <Sparkles className="absolute -left-7 -top-4 h-6 w-6 -rotate-12 text-[#101717]" />
                {[
                  "/maison/hero-bg.jpg",
                  "/maison/175140437c82741b2167bfb8c40c098e.jpg",
                  "/maison/a5d51dd50cc3f51657a8ca13ad8c9b8e.jpg",
                ].map((avatar) => (
                  <img
                    key={avatar}
                    src={avatar}
                    alt=""
                    className="h-11 w-11 rounded-full border-2 border-white object-cover shadow-sm sm:h-12 sm:w-12"
                  />
                ))}
              </div>

              <div
                className="mt-3 flex items-center gap-2 rounded-full border-2 bg-white/80 px-4 py-2.5 shadow-[0_10px_30px_rgba(73,134,164,0.08)] sm:gap-3 sm:px-7"
                style={{ borderColor: theme.text }}
                aria-label="Evaluat 4.9 din 5 de peste 2700 de clienti"
              >
                <span className="whitespace-nowrap text-[11px] font-medium sm:text-base">
                  Evaluat 4.9/5 de peste 2700 de clienti
                </span>
                <span className="flex gap-0.5" aria-hidden="true">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star
                      key={index}
                      className="h-3.5 w-3.5 fill-[#e98443] text-[#e98443] sm:h-5 sm:w-5"
                    />
                  ))}
                </span>
              </div>
            </div>

            <h1
              className="mt-6 flex max-w-[900px] flex-wrap items-baseline justify-center gap-x-[0.22em]"
              style={heroTitleStyle}
            >
              <ShinyText
                text="Organizează evenimente fără"
                speed={3.4}
                delay={0.8}
                spread={115}
                color="#101717"
                shineColor="#ddd"
                pauseOnHover
              />
              <RotatingText
                texts={["telefoane.", "mesaje.", "liste in excel."]}
                textColors={["#e36f3d", "#4f80a8", "#6f8f56", "#b06b86"]}
                rotationInterval={2300}
                staggerDuration={0.025}
                staggerFrom="last"
                transition={{ type: "spring", damping: 25, stiffness: 260 }}
                mainClassName="min-w-[4.8em] justify-start pb-[0.06em]"
              />
            </h1>
            <p className="mt-6 max-w-[650px] text-base leading-7 md:text-lg" style={{ color: theme.muted }}>
              Creezi pagina, trimiti linkul, primesti confirmarile RSVP si continui cu invitatii, task-urile, mesele si bugetul.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <PrimaryButton href="/register" label="Creeaza evenimentul" />
              <a
                href="#process"
                className="inline-flex items-center gap-2 rounded-full border bg-white/60 px-6 py-3 text-sm font-medium transition-transform duration-200 hover:-translate-y-0.5"
                style={{ borderColor: theme.border }}
              >
                Vezi cum functioneaza
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium" style={{ color: theme.muted }}>
              {["Invitatie digitala", "RSVP centralizat", "Planificare completa"].map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#4f8b48]" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section id="featured-works" className="px-4 pb-12 md:px-8 md:pb-16">
          <div className="mx-auto max-w-[1280px]">
            <FeaturedTemplatesCarousel />
          </div>
        </section>

        <section className="px-4 md:px-8 md:py-12">
          <div
            className="wp-logo-marquee mx-auto max-w-[1280px] border-y py-5"
            style={{ borderColor: theme.border }}
          >
            <div className="wp-logo-marquee__track">
              {[0, 1].map((copyIndex) => (
                <div
                  key={`logo-strip-${copyIndex}`}
                  className="wp-logo-marquee__group"
                  aria-hidden={copyIndex === 1}
                >
                  {logoStrip.map((item) => (
                    <div
                      key={`${copyIndex}-${item.label}`}
                      className="inline-flex shrink-0 items-center gap-2.5 rounded-full px-3 py-2 text-sm font-semibold"
                      style={{ color: theme.muted }}
                    >
                      <span
                        aria-hidden="true"
                        className="h-5 w-5 shrink-0"
                        style={{
                          backgroundColor: theme.accent,
                          WebkitMaskImage: `url(${item.icon})`,
                          WebkitMaskPosition: "center",
                          WebkitMaskRepeat: "no-repeat",
                          WebkitMaskSize: "contain",
                          maskImage: `url(${item.icon})`,
                          maskPosition: "center",
                          maskRepeat: "no-repeat",
                          maskSize: "contain",
                        }}
                      />
                      {item.label}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        <LinkAccessShowcase />

        <PlanningAdminShowcase />

        <ProcessVideoShowcase />

        <SupplierShowcase />

        <section id="features" className="px-4 py-16 md:px-8 md:py-24">
          <div className="mx-auto max-w-[1280px]">
            <SectionIntro
              eyebrow="Functionalitati"
              title="Tot ce trebuie sa inteleaga un utilizator nou"
              description="Aici transformam sectiunea de key features din exemplu intr-o prezentare mai explicativa a modulelor voastre reale."
            />

            <StackedActivityCards
              items={featureCards}
              className="mt-12"
              accentColor={theme.accent}
              mutedColor={theme.muted}
              cardBackground={theme.soft}
            />
          </div>
        </section>

        <section className="px-4 pb-6 pt-10 md:px-8 md:py-24">
          <div className="mx-auto max-w-[1280px]">
            <SectionIntro
              eyebrow="Pentru cine este"
              title="Perfect pentru orice tip de eveniment"
              description="De la nunti si botezuri pana la conferinte sau evenimente corporate, platforma ramane simpla: trimiti invitatia, primesti raspunsurile si continui organizarea din acelasi loc."
            />

            <MobileEventTypesScroller />

            <div className="mt-12 hidden gap-5 md:grid md:grid-cols-2 xl:grid-cols-3">
              {eventTypes.map((eventType) => (
                <EventTypeCard
                  key={eventType.title}
                  eventType={eventType}
                />
              ))}
            </div>
          </div>
        </section>

        <PricingShowcase />

        <section className="px-4 py-16 md:px-8 md:py-24">
          <div className="mx-auto max-w-[1280px]">
            <SectionIntro
              eyebrow="Pareri"
              title="Perspectiva noastra este una singura. A lor conteaza mai mult."
              description="Pastrez ideea de testimonial section din referinta, dar mesajele sunt mutate spre claritate, utilitate si experienta reala a produsului."
            />

            <DisplayCards
              items={testimonials}
              className="mt-10 md:mt-12"
              accentColor={theme.accent}
              mutedColor={theme.muted}
              cardBackground={theme.soft}
            />
          </div>
        </section>

        <GuestAnswersShowcase />

        <section id="faq" className="px-4 py-16 md:px-8 md:py-24">
          <div className="mx-auto max-w-[1040px]">
            <SectionIntro
              eyebrow="Intrebari frecvente"
              title="Raspunsuri esentiale, fara ocolisuri"
              description="Si sectiunea de FAQ ramane, pentru ca ajuta mult cand un utilizator vrea sa inteleaga repede daca produsul i se potriveste."
            />

            <div className="mt-12 space-y-4">
              {faqItems.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-[24px] px-6 py-5"
                  style={{ backgroundColor: theme.soft }}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-left text-lg font-medium tracking-[-0.03em]">
                    <span>{item.question}</span>
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl transition group-open:rotate-45"
                      style={{ backgroundColor: "#fff", color: theme.accent }}
                    >
                      +
                    </span>
                  </summary>
                  <p className="pt-4 text-sm leading-7 md:text-base" style={{ color: theme.muted }}>
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <ClosingCtaShowcase />

        <Footer />
      </main>
    </div>
  );
}
