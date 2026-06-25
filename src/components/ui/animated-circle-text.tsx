import * as React from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface AnimatedCircleTextProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  circleClassName?: string;
  textClassName?: string;
  textColor?: string;
  duration?: number;
  continuous?: boolean;
  repeatDelay?: number;
}

const AnimatedCircleText = React.forwardRef<
  HTMLSpanElement,
  AnimatedCircleTextProps
>(
  (
    {
      children,
      className,
      circleClassName,
      textClassName,
      textColor = "#101717",
      duration = 1.2,
      continuous = true,
      repeatDelay = 0.45,
      ...props
    },
    ref,
  ) => (
    <span
      ref={ref}
      className={cn(
        "relative inline-block whitespace-nowrap px-[0.12em]",
        className,
      )}
      {...props}
    >
      <span
        className={cn("relative z-10", textClassName)}
        style={{
          color: textColor,
          WebkitTextFillColor: textColor,
          backgroundImage: "none",
        }}
      >
        {children}
      </span>
      <motion.svg
        aria-hidden="true"
        viewBox="0 0 200 100"
        preserveAspectRatio="none"
        className={cn(
          "pointer-events-none absolute left-1/2 top-1/2 h-[1.5em] w-[calc(100%+0.55em)] -translate-x-1/2 -translate-y-1/2 overflow-visible text-[#ff7633]",
          circleClassName,
        )}
      >
        <motion.path
          d="M 7 52 C 10 10, 181 2, 193 45 C 202 85, 28 101, 7 58 C 5 55, 5 53, 7 52"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={
            continuous
              ? {
                  pathLength: [0, 1, 1, 0],
                  opacity: [0, 1, 1, 0],
                }
              : { pathLength: 1, opacity: 1 }
          }
          viewport={{ once: true, amount: 0.8 }}
          transition={
            continuous
              ? {
                  duration: duration + 0.8,
                  times: [0, 0.55, 0.82, 1],
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay,
                }
              : { duration, ease: "easeInOut" }
          }
        />
      </motion.svg>
    </span>
  ),
);

AnimatedCircleText.displayName = "AnimatedCircleText";

export { AnimatedCircleText };
