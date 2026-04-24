import React, { useEffect, useMemo, useState } from "react";
import { Play, CheckCircle2, Layers, Users, Zap } from "lucide-react";
import BlurText from "./effectText/BlurText/BlurText ";
import { API_URL } from "../../config/api";
import {
  GLOBAL_TUTORIAL_VIDEO_CONFIG_ID,
  getTutorialVideoUrlsFromConfig,
  resolveTutorialVideoMedia,
  type TutorialVideoStepId,
  type TutorialVideoUrls,
} from "../../lib/tutorial-video";

type TutorialStep = {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailText: string;
};

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "design",
    label: "Design & Configurare",
    icon: Layers,
    title: "Creeaza invitatia perfecta.",
    description:
      "Nu ai nevoie de experienta in design. Alege o tema, modifica fonturile si culorile, si vezi rezultatul in timp real. Totul este drag-and-drop.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailText: "Cum creezi o invitatie in 2 minute",
  },
  {
    id: "guests",
    label: "Guest Management",
    icon: Users,
    title: "Uita de Excel-uri.",
    description:
      "Centralizeaza lista de invitati. Trimite link-uri unice, vezi cine a deschis invitatia si primeste notificari instant la fiecare RSVP.",
    videoUrl: "https://www.youtube.com/watch?v=M7lc1UVf-VE",
    thumbnailText: "Gestionarea listei de invitati",
  },
  {
    id: "advanced",
    label: "Functii Avansate",
    icon: Zap,
    title: "Automatizare completa.",
    description:
      "De la remindere automate pe WhatsApp pana la harti interactive si sugestii de cazare pentru invitatii din alt oras.",
    videoUrl: "https://www.youtube.com/watch?v=LXb3EKWsInQ",
    thumbnailText: "Tips & Tricks pentru nunta ta",
  },
];

export default function TutorialSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [globalTutorialVideos, setGlobalTutorialVideos] =
    useState<TutorialVideoUrls>({});

  useEffect(() => {
    let cancelled = false;

    const loadGlobalTutorialVideo = async () => {
      try {
        const res = await fetch(
          `${API_URL}/config/template-defaults/${GLOBAL_TUTORIAL_VIDEO_CONFIG_ID}`,
        );
        if (!res.ok) return;
        const cfg = await res.json().catch(() => null);
        if (cancelled) return;
        setGlobalTutorialVideos(getTutorialVideoUrlsFromConfig(cfg));
      } catch {
        if (!cancelled) setGlobalTutorialVideos({});
      }
    };

    loadGlobalTutorialVideo();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeContent = useMemo(() => {
    const base = TUTORIAL_STEPS[activeStep];
    if (!base) return TUTORIAL_STEPS[0];
    const configuredVideoUrl = globalTutorialVideos[base.id as TutorialVideoStepId];
    if (!configuredVideoUrl) return base;
    return {
      ...base,
      videoUrl: configuredVideoUrl,
    };
  }, [activeStep, globalTutorialVideos]);

  const activeVideoMedia = useMemo(
    () => resolveTutorialVideoMedia(activeContent?.videoUrl),
    [activeContent],
  );

  const handleStepClick = (index: number) => {
    setActiveStep(index);
    setIsPlaying(false);
  };

  return (
    <section
      className="py-24 relative overflow-hidden border-t border-white/5"
      id="process"
    >
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "radial-gradient(#333 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="wp-container relative z-10">
        <div className="text-center mb-16">
          <span className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest mb-2 block">
            Tutorial
          </span>
          <h2 className="wp-section-title2 text-[64px] md:text-[80px] font-black text-white leading-tight">
            <BlurText
              text="Invata in"
              delay={20}
              animateBy="letters"
              direction="bottom"
              className="wp-section-titleX"
            />{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, var(--primary) 0%, var(--primary-dark) 100%)",
              }}
            >
              cateva minute.
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-4 flex flex-col gap-8">
            {TUTORIAL_STEPS.map((step, index) => {
              const isActive = activeStep === index;
              return (
                <div
                  key={step.id}
                  onClick={() => handleStepClick(index)}
                  className={`group cursor-pointer transition-all duration-300 ${
                    isActive ? "opacity-100" : "opacity-40 hover:opacity-70"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`text-sm font-bold uppercase tracking-widest transition-colors ${
                        isActive ? "text-[var(--primary)]" : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </span>
                    {isActive && (
                      <div className="h-[1px] flex-1 bg-[var(--primary)]/50" />
                    )}
                  </div>

                  <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
                    {step.title}
                  </h3>

                  <p
                    className={`text-sm md:text-base leading-relaxed transition-colors ${
                      isActive ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-8">
            <div className="relative w-full h-[250px] md:h-auto md:aspect-video rounded-2xl overflow-hidden bg-[#111] border border-white/10 shadow-[0_0_50px_-12px_rgba(232,121,249,0.2)] group">
              {isPlaying && activeVideoMedia ? (
                activeVideoMedia.type === "video" ? (
                  <video
                    src={activeVideoMedia.src}
                    controls
                    autoPlay
                    playsInline
                    className="absolute inset-0 w-full h-full bg-black object-cover"
                  />
                ) : (
                  <iframe
                    width="100%"
                    height="100%"
                    src={activeVideoMedia.src}
                    title="Video tutorial"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                )
              ) : (
                <div
                  className="absolute inset-0 bg-[#0c0c0e] cursor-pointer"
                  onClick={() => setIsPlaying(true)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-dark)]/20 via-[#0c0c0e] to-[#0c0c0e] z-0" />
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1629904853716-f004c64c703f?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />

                  <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16 z-10">
                    <div className="flex items-start justify-between">
                      <div className="max-w-lg relative z-20">
                        <div className="inline-flex items-center gap-2 px-2 py-1 md:px-3 rounded-full bg-white/5 border border-white/10 text-[var(--primary)] text-[8px] md:text-[10px] font-bold uppercase tracking-widest mb-3 md:mb-6 backdrop-blur-sm">
                          <CheckCircle2 size={10} className="md:w-3 md:h-3" />
                          <span>Video Tutorial</span>
                        </div>

                        <h2 className="text-3xl md:text-6xl font-black text-white mb-2 md:mb-4 uppercase tracking-tighter leading-none">
                          YES<span className="text-[var(--primary)]">.EVENTS</span>
                        </h2>

                        <p className="text-sm md:text-2xl text-gray-300 font-medium leading-snug max-w-[85%] md:max-w-full">
                          <span className="text-[var(--primary)] font-bold">
                            How To:
                          </span>{" "}
                          {activeContent.thumbnailText}
                        </p>
                      </div>

                      <div className="hidden md:flex w-20 h-20 rounded-full bg-white/10 border border-white/20 backdrop-blur-md items-center justify-center text-white group-hover:scale-110 group-hover:bg-[var(--primary)] group-hover:border-[var(--primary)] transition-all duration-300 shadow-2xl">
                        <Play size={32} fill="currentColor" className="ml-1" />
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:hidden z-10 pointer-events-none">
                    <div className="w-12 h-12 rounded-full bg-[var(--primary)]/90 backdrop-blur-sm flex items-center justify-center text-white shadow-lg">
                      <Play size={20} fill="currentColor" className="ml-1" />
                    </div>
                  </div>

                  <div className="absolute bottom-4 md:bottom-6 left-6 md:left-16 right-6 md:right-8 flex items-center justify-between border-t border-white/10 pt-3 md:pt-4">
                    <div className="flex items-center gap-4 text-[10px] md:text-xs font-mono text-gray-500">
                      <span>00:00</span>
                      <div className="w-16 md:w-24 h-[2px] bg-white/10 rounded-full overflow-hidden">
                        <div className="w-1/3 h-full bg-[var(--primary)]" />
                      </div>
                      <span>04:20</span>
                    </div>
                    <div className="text-white/40 text-[10px] md:text-xs font-bold uppercase tracking-widest">
                      Watch Now
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
