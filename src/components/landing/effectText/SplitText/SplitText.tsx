import React, { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText as GSAPSplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, GSAPSplitText, useGSAP);

interface SplitTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: "chars" | "words" | "lines" | "words, chars";
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  threshold?: number;
  rootMargin?: string;
  tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
  textAlign?: React.CSSProperties["textAlign"];
  onLetterAnimationComplete?: () => void;
}

const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = "",
  style,
  delay = 80,
  duration = 1.1,
  ease = "power3.out",
  splitType = "words",
  from = { opacity: 0, y: 48, filter: "blur(8px)" },
  to = { opacity: 1, y: 0, filter: "blur(0px)" },
  threshold = 0.15,
  rootMargin = "-60px",
  tag = "h2",
  textAlign = "left",
  onLetterAnimationComplete,
}) => {
  const textRef = useRef<HTMLElement | null>(null);
  const animationCompletedRef = useRef(false);
  const onCompleteRef = useRef(onLetterAnimationComplete);
  const [fontsLoaded, setFontsLoaded] = useState(
    typeof document !== "undefined" && document.fonts.status === "loaded",
  );

  useEffect(() => {
    onCompleteRef.current = onLetterAnimationComplete;
  }, [onLetterAnimationComplete]);

  useEffect(() => {
    animationCompletedRef.current = false;
  }, [text]);

  useEffect(() => {
    if (fontsLoaded) return;

    let active = true;
    document.fonts.ready.then(() => {
      if (active) setFontsLoaded(true);
    });

    return () => {
      active = false;
    };
  }, [fontsLoaded]);

  useGSAP(
    () => {
      const element = textRef.current;
      if (!element || !text || !fontsLoaded) return;
      if (animationCompletedRef.current) return;

      const split = new GSAPSplitText(element, {
        type: splitType,
        smartWrap: true,
        wordsClass: "split-word",
        charsClass: "split-char",
        linesClass: "split-line",
      });

      const targets =
        splitType.includes("chars") && split.chars.length
          ? split.chars
          : splitType.includes("words") && split.words.length
            ? split.words
            : split.lines;

      if (style?.backgroundImage) {
        gsap.set(targets, {
          backgroundImage: style.backgroundImage,
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent",
          WebkitTextFillColor: "transparent",
        });
      } else {
        gsap.set(targets, {
          color: style?.color ?? "#101717",
          WebkitTextFillColor: style?.color ?? "#101717",
        });
      }

      const startPercentage = (1 - threshold) * 100;
      const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
      const marginValue = marginMatch ? Number.parseFloat(marginMatch[1]) : 0;
      const marginUnit = marginMatch?.[2] || "px";
      const marginOffset =
        marginValue < 0
          ? `-=${Math.abs(marginValue)}${marginUnit}`
          : marginValue > 0
            ? `+=${marginValue}${marginUnit}`
            : "";

      const animation = gsap.fromTo(targets, from, {
        ...to,
        duration,
        ease,
        stagger: delay / 1000,
        force3D: true,
        scrollTrigger: {
          trigger: element,
          start: `top ${startPercentage}%${marginOffset}`,
          once: true,
          fastScrollEnd: true,
          anticipatePin: 0.4,
        },
        onComplete: () => {
          animationCompletedRef.current = true;
          onCompleteRef.current?.();
        },
      });

      return () => {
        animation.scrollTrigger?.kill();
        animation.kill();
        split.revert();
      };
    },
    {
      dependencies: [
        text,
        delay,
        duration,
        ease,
        splitType,
        threshold,
        rootMargin,
        fontsLoaded,
        style?.backgroundImage,
        style?.color,
      ],
      scope: textRef,
      revertOnUpdate: true,
    },
  );

  const Tag = tag as React.ElementType;

  return (
    <Tag
      ref={textRef}
      className={`split-parent whitespace-normal ${className}`}
      style={{
        ...style,
        textAlign,
        overflowWrap: "break-word",
      }}
    >
      {text}
    </Tag>
  );
};

export default SplitText;
