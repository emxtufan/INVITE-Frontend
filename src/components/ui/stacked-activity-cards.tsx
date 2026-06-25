import * as React from "react";
import { LayoutGrid, Layers } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface StackedActivityCardItem {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface StackedActivityCardsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  items: StackedActivityCardItem[];
  accentColor?: string;
  mutedColor?: string;
  cardBackground?: string;
}

const cardTints = [
  "#fff8f3",
  "#f3f7ff",
  "#f6f9f1",
  "#fff9e9",
  "#f8f4fb",
  "#f3f8f7",
];

const StackedActivityCards = React.forwardRef<
  HTMLDivElement,
  StackedActivityCardsProps
>(
  (
    {
      items,
      className,
      accentColor = "#ff7633",
      mutedColor = "rgba(16, 23, 23, 0.62)",
      cardBackground = "#f8f6f1",
      ...props
    },
    ref,
  ) => {
    const [isExpanded, setIsExpanded] = React.useState(false);

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        <div className="mb-6 flex flex-wrap items-center justify-center gap-3 sm:justify-end">
          <button
            type="button"
            onClick={() => setIsExpanded((current) => !current)}
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-[#101717] shadow-[0_10px_30px_rgba(16,23,23,0.06)] transition-transform duration-200 hover:-translate-y-0.5"
            aria-expanded={isExpanded}
          >
            {isExpanded ? (
              <Layers className="h-4 w-4" />
            ) : (
              <LayoutGrid className="h-4 w-4" />
            )}
            {isExpanded ? "Strange cardurile" : "Vezi toate functionalitatile"}
          </button>
        </div>

        <motion.div
          layout
          className={cn(
            "relative grid",
            isExpanded
              ? "gap-5 md:grid-cols-2 xl:grid-cols-3"
              : "cursor-pointer grid-cols-1 pb-[74px]",
          )}
          onClick={() => {
            if (!isExpanded) setIsExpanded(true);
          }}
          transition={{
            layout: {
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            },
          }}
        >
          {items.map(({ title, description, icon: Icon }, index) => {
            const depth = Math.min(index, 5);
            const isTopCard = index === 0;

            return (
              <motion.article
                layout
                key={title}
                className={cn(
                  "relative min-h-[260px] overflow-hidden rounded-[28px] border p-7 shadow-[0_22px_55px_rgba(16,23,23,0.09)]",
                  !isExpanded && "col-start-1 row-start-1",
                )}
                initial={false}
                animate={{
                  y: isExpanded ? 0 : depth * 14,
                  scale: isExpanded ? 1 : 1 - depth * 0.018,
                  rotate: isExpanded
                    ? 0
                    : depth === 0
                      ? 0
                      : depth % 2 === 0
                        ? 0.55
                        : -0.55,
                  opacity: isExpanded ? 1 : Math.max(0.72, 1 - depth * 0.055),
                }}
                transition={{
                  duration: 0.7,
                  delay: isExpanded ? index * 0.045 : (items.length - index) * 0.025,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  zIndex: items.length - index,
                  pointerEvents: isExpanded || isTopCard ? "auto" : "none",
                  backgroundColor: isExpanded
                    ? cardTints[index % cardTints.length]
                    : index === 0
                      ? cardBackground
                      : cardTints[index % cardTints.length],
                  borderColor: "rgba(16, 23, 23, 0.09)",
                  transformOrigin: "center top",
                }}
              >
                <div
                  className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-60 blur-3xl"
                  style={{ backgroundColor: cardTints[index % cardTints.length] }}
                  aria-hidden="true"
                />
                <div
                  className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm"
                  style={{ color: accentColor }}
                >
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="relative mt-6 text-[clamp(24px,2.8vw,34px)] font-black leading-[1.08] tracking-[-0.03em] text-[#101717]">
                  {title}
                </h3>
                <p
                  className="relative mt-4 text-sm leading-7 md:text-base"
                  style={{ color: mutedColor }}
                >
                  {description}
                </p>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    );
  },
);

StackedActivityCards.displayName = "StackedActivityCards";

export { StackedActivityCards };
