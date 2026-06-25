import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
  type Target,
  type TargetAndTransition,
  type Transition,
  type VariantLabels,
} from "motion/react";

function cn(...classes: Array<string | undefined | null | boolean>) {
  return classes.filter(Boolean).join(" ");
}

export interface RotatingTextRef {
  next: () => void;
  previous: () => void;
  jumpTo: (index: number) => void;
  reset: () => void;
}

export interface RotatingTextProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof motion.span>,
    "children" | "transition" | "initial" | "animate" | "exit"
  > {
  texts: string[];
  textColors?: string[];
  transition?: Transition;
  initial?: boolean | Target | VariantLabels;
  animate?: boolean | VariantLabels | TargetAndTransition;
  exit?: Target | VariantLabels;
  animatePresenceMode?: "sync" | "wait";
  animatePresenceInitial?: boolean;
  rotationInterval?: number;
  staggerDuration?: number;
  staggerFrom?: "first" | "last" | "center" | "random" | number;
  loop?: boolean;
  auto?: boolean;
  splitBy?: string;
  onNext?: (index: number) => void;
  mainClassName?: string;
  splitLevelClassName?: string;
  elementLevelClassName?: string;
}

const RotatingText = forwardRef<RotatingTextRef, RotatingTextProps>(
  (
    {
      texts,
      textColors = [],
      transition = { type: "spring", damping: 25, stiffness: 300 },
      initial = { y: "100%", opacity: 0 },
      animate = { y: 0, opacity: 1 },
      exit = { y: "-120%", opacity: 0 },
      animatePresenceMode = "wait",
      animatePresenceInitial = false,
      rotationInterval = 2200,
      staggerDuration = 0,
      staggerFrom = "first",
      loop = true,
      auto = true,
      splitBy = "characters",
      onNext,
      mainClassName,
      splitLevelClassName,
      elementLevelClassName,
      ...rest
    },
    ref,
  ) => {
    const [currentTextIndex, setCurrentTextIndex] = useState(0);

    const splitIntoCharacters = (text: string) => {
      if (typeof Intl !== "undefined" && Intl.Segmenter) {
        const segmenter = new Intl.Segmenter("ro", { granularity: "grapheme" });
        return Array.from(segmenter.segment(text), (segment) => segment.segment);
      }

      return Array.from(text);
    };

    const elements = useMemo(() => {
      const currentText = texts[currentTextIndex] ?? "";

      if (splitBy === "characters") {
        return currentText.split(" ").map((word, index, words) => ({
          characters: splitIntoCharacters(word),
          needsSpace: index !== words.length - 1,
        }));
      }

      const separator = splitBy === "words" ? " " : splitBy === "lines" ? "\n" : splitBy;
      return currentText.split(separator).map((part, index, parts) => ({
        characters: [part],
        needsSpace: index !== parts.length - 1,
      }));
    }, [currentTextIndex, splitBy, texts]);

    const getStaggerDelay = useCallback(
      (index: number, totalCharacters: number) => {
        if (staggerFrom === "first") return index * staggerDuration;
        if (staggerFrom === "last") return (totalCharacters - 1 - index) * staggerDuration;
        if (staggerFrom === "center") {
          return Math.abs(Math.floor(totalCharacters / 2) - index) * staggerDuration;
        }
        if (staggerFrom === "random") {
          return Math.abs(Math.floor(Math.random() * totalCharacters) - index) * staggerDuration;
        }
        return Math.abs(staggerFrom - index) * staggerDuration;
      },
      [staggerDuration, staggerFrom],
    );

    const handleIndexChange = useCallback(
      (newIndex: number) => {
        setCurrentTextIndex(newIndex);
        onNext?.(newIndex);
      },
      [onNext],
    );

    const next = useCallback(() => {
      const nextIndex =
        currentTextIndex === texts.length - 1
          ? loop
            ? 0
            : currentTextIndex
          : currentTextIndex + 1;

      if (nextIndex !== currentTextIndex) handleIndexChange(nextIndex);
    }, [currentTextIndex, handleIndexChange, loop, texts.length]);

    const previous = useCallback(() => {
      const previousIndex =
        currentTextIndex === 0
          ? loop
            ? texts.length - 1
            : currentTextIndex
          : currentTextIndex - 1;

      if (previousIndex !== currentTextIndex) handleIndexChange(previousIndex);
    }, [currentTextIndex, handleIndexChange, loop, texts.length]);

    const jumpTo = useCallback(
      (index: number) => {
        const validIndex = Math.max(0, Math.min(index, texts.length - 1));
        if (validIndex !== currentTextIndex) handleIndexChange(validIndex);
      },
      [currentTextIndex, handleIndexChange, texts.length],
    );

    const reset = useCallback(() => {
      if (currentTextIndex !== 0) handleIndexChange(0);
    }, [currentTextIndex, handleIndexChange]);

    useImperativeHandle(ref, () => ({ next, previous, jumpTo, reset }), [
      jumpTo,
      next,
      previous,
      reset,
    ]);

    useEffect(() => {
      if (!auto || texts.length < 2) return;

      const intervalId = window.setInterval(next, rotationInterval);
      return () => window.clearInterval(intervalId);
    }, [auto, next, rotationInterval, texts.length]);

    const currentColor = textColors[currentTextIndex] ?? "currentColor";
    const totalCharacters = elements.reduce(
      (sum, word) => sum + word.characters.length,
      0,
    );

    return (
      <motion.span
        className={cn("relative inline-flex overflow-hidden align-bottom", mainClassName)}
        {...rest}
        layout
        transition={transition}
      >
        <span className="sr-only">{texts[currentTextIndex]}</span>
        <AnimatePresence mode={animatePresenceMode} initial={animatePresenceInitial}>
          <motion.span
            key={currentTextIndex}
            className={cn(
              splitBy === "lines"
                ? "flex w-full flex-col"
                : "relative inline-flex whitespace-pre-wrap",
            )}
            style={{
              color: currentColor,
              WebkitTextFillColor: currentColor,
            }}
            layout
            aria-hidden="true"
          >
            {elements.map((word, wordIndex, allWords) => {
              const previousCharacters = allWords
                .slice(0, wordIndex)
                .reduce((sum, item) => sum + item.characters.length, 0);

              return (
                <span key={`${wordIndex}-${word.characters.join("")}`} className={cn("inline-flex", splitLevelClassName)}>
                  {word.characters.map((character, characterIndex) => (
                    <motion.span
                      key={`${character}-${characterIndex}`}
                      initial={initial}
                      animate={animate}
                      exit={exit}
                      transition={{
                        ...transition,
                        delay: getStaggerDelay(
                          previousCharacters + characterIndex,
                          totalCharacters,
                        ),
                      }}
                      className={cn("inline-block", elementLevelClassName)}
                    >
                      {character}
                    </motion.span>
                  ))}
                  {word.needsSpace && <span className="whitespace-pre"> </span>}
                </span>
              );
            })}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    );
  },
);

RotatingText.displayName = "RotatingText";

export default RotatingText;
