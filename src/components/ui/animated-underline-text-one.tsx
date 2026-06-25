import * as React from "react";
import { motion, type Variants } from "framer-motion";

import { cn } from "@/lib/utils";

interface AnimatedUnderlineTextProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  text?: string;
  children?: React.ReactNode;
  textClassName?: string;
  underlineClassName?: string;
  underlinePath?: string;
  underlineHoverPath?: string;
  underlineDuration?: number;
  textColor?: string;
}

const AnimatedUnderlineText = React.forwardRef<
  HTMLSpanElement,
  AnimatedUnderlineTextProps
>(
  (
    {
      text = "Animated underline",
      children,
      className,
      textClassName,
      underlineClassName,
      underlinePath = "M 0,10 Q 75,0 150,10 Q 225,20 300,10",
      underlineHoverPath = "M 0,10 Q 75,20 150,10 Q 225,0 300,10",
      underlineDuration = 1.5,
      textColor = "#101717",
      ...props
    },
    ref,
  ) => {
    const pathVariants: Variants = {
      hidden: { pathLength: 0, opacity: 0 },
      visible: {
        pathLength: 1,
        opacity: 1,
        transition: {
          duration: underlineDuration,
          ease: "easeInOut",
        },
      },
    };

    return (
      <span
        ref={ref}
        className={cn(
          "group relative inline-block whitespace-nowrap pb-[0.24em]",
          className,
        )}
        {...props}
      >
        <motion.span
          className="relative inline-block"
          initial={{ y: -12, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          whileHover={{ scale: 1.02 }}
        >
          <span
            className={cn("relative z-10", textClassName)}
            style={{
              color: textColor,
              WebkitTextFillColor: textColor,
              backgroundImage: "none",
            }}
          >
            {children ?? text}
          </span>

          <motion.svg
            width="100%"
            height="20"
            viewBox="0 0 300 20"
            preserveAspectRatio="none"
            className={cn(
              "pointer-events-none absolute -bottom-[0.2em] left-0 h-[0.28em] w-full overflow-visible text-[#4f80a8]",
              underlineClassName,
            )}
            aria-hidden="true"
          >
            <motion.path
              d={underlinePath}
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              variants={pathVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.8 }}
              whileHover={{
                d: underlineHoverPath,
                transition: { duration: 0.8 },
              }}
            />
          </motion.svg>
        </motion.span>
      </span>
    );
  },
);

AnimatedUnderlineText.displayName = "AnimatedUnderlineText";

export { AnimatedUnderlineText };
