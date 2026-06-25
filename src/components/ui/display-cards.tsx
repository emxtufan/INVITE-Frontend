import * as React from "react";
import { MessageSquare, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface DisplayCardItem {
  quote: string;
  name: string;
  role: string;
}

interface DisplayCardsProps extends React.HTMLAttributes<HTMLDivElement> {
  items: DisplayCardItem[];
  accentColor?: string;
  mutedColor?: string;
  cardBackground?: string;
}

function useDesktopLayout() {
  const [isDesktop, setIsDesktop] = React.useState(
    typeof window !== "undefined" && window.innerWidth >= 768,
  );

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const updateLayout = () => setIsDesktop(mediaQuery.matches);

    updateLayout();
    mediaQuery.addEventListener("change", updateLayout);
    return () => mediaQuery.removeEventListener("change", updateLayout);
  }, []);

  return isDesktop;
}

const DisplayCards = React.forwardRef<HTMLDivElement, DisplayCardsProps>(
  (
    {
      items,
      className,
      style,
      accentColor = "#ff7633",
      mutedColor = "rgba(16, 23, 23, 0.62)",
      cardBackground = "#f8f6f1",
      ...props
    },
    ref,
  ) => {
    const [activeIndex, setActiveIndex] = React.useState<number | null>(
      items.length ? 0 : null,
    );
    const isDesktop = useDesktopLayout();
    const activeItem =
      activeIndex === null ? null : items[activeIndex] ?? null;

    return (
      <div
        ref={ref}
        className={cn(
          "relative mx-auto w-full max-w-[1120px] transition-[height] duration-500 ease-out",
          className,
        )}
        style={{
          ...style,
          height: isDesktop ? 390 : activeItem ? 590 : 325,
        }}
        {...props}
      >
        {items.map((item, index) => {
          const isActive = activeIndex === index;
          const position = isDesktop
            ? {
                left: `${2 + index * 6}%`,
                top: 20 + index * 48,
                width: "45%",
                height: 190,
                rotate: -4 + index * 1.7,
                scale: 1 - index * 0.012,
              }
            : {
                left: `${index * 1.3}%`,
                top: index * 48,
                width: `${100 - index * 2.6}%`,
                height: 150,
                rotate: -2.4 + index * 1.25,
                scale: 1,
              };

          return (
            <motion.article
              key={`${item.name}-${item.role}`}
              className="pointer-events-none absolute overflow-hidden rounded-[24px] border p-4 text-left shadow-[0_20px_55px_rgba(16,23,23,0.12)] md:p-5"
              initial={false}
              animate={{
                ...position,
                opacity: 1,
              }}
              transition={{
                duration: 0.62,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                zIndex: index + 1,
                borderColor: isActive
                  ? "rgba(255, 118, 51, 0.34)"
                  : "rgba(16, 23, 23, 0.1)",
                backgroundColor: cardBackground,
                transformOrigin: "center center",
              }}
            >
              <button
                type="button"
                aria-label={`Citeste recenzia lasata de ${item.name}`}
                aria-expanded={isActive}
                onClick={() => setActiveIndex(index)}
                className="pointer-events-auto absolute inset-x-0 top-0 z-10 h-12 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#ff7633]"
              />

              <div className="pointer-events-none flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-sm"
                    style={{ color: accentColor }}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#101717]">
                      {item.name}
                    </p>
                    <p className="truncate text-xs" style={{ color: mutedColor }}>
                      {item.role}
                    </p>
                  </div>
                </div>
                <span
                  className="shrink-0 rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em]"
                  style={{
                    backgroundColor: isActive ? "#fff1e9" : "#fff",
                    color: isActive ? accentColor : mutedColor,
                  }}
                >
                  {isActive ? "Selectata" : "Recenzie"}
                </span>
              </div>

              <p className="pointer-events-none mt-3 line-clamp-2 text-sm leading-6 text-[#101717]">
                “{item.quote}”
              </p>
            </motion.article>
          );
        })}

        <AnimatePresence mode="wait">
          {activeItem ? (
            <motion.article
              key={`active-${activeItem.name}-${activeItem.role}`}
              className="absolute z-30 overflow-hidden rounded-[28px] border bg-white p-6 text-left shadow-[0_32px_90px_rgba(16,23,23,0.2)] md:p-8"
              initial={
                isDesktop
                  ? { opacity: 0, x: -45, scale: 0.94 }
                  : { opacity: 0, y: -24, scale: 0.96 }
              }
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={
                isDesktop
                  ? { opacity: 0, x: -35, scale: 0.96 }
                  : { opacity: 0, y: -18, scale: 0.97 }
              }
              transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
              style={{
                left: isDesktop ? "48%" : "0%",
                top: isDesktop ? 24 : 300,
                width: isDesktop ? "50%" : "100%",
                height: isDesktop ? 330 : 270,
                borderColor: "rgba(255, 118, 51, 0.3)",
                background:
                  "radial-gradient(circle at top right, rgba(255,118,51,0.13), transparent 34%), #ffffff",
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fff4ee]"
                    style={{ color: accentColor }}
                  >
                    <MessageSquare className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-[#101717]">
                      {activeItem.name}
                    </p>
                    <p className="text-sm" style={{ color: mutedColor }}>
                      {activeItem.role}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveIndex(0)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f5f2ec] text-[#101717] transition hover:bg-[#ece7df]"
                  aria-label="Inchide recenzia"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="mt-6 text-lg leading-8 text-[#101717] md:text-xl md:leading-9">
                “{activeItem.quote}”
              </p>

              <div className="absolute inset-x-6 bottom-5 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] md:inset-x-8">
                <span className="h-px flex-1 bg-black/10" />
                <span style={{ color: mutedColor }}>Experienta reala</span>
              </div>
            </motion.article>
          ) : null}
        </AnimatePresence>
      </div>
    );
  },
);

DisplayCards.displayName = "DisplayCards";

export { DisplayCards };
