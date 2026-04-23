import React, { useCallback, useEffect, useState } from "react";

interface ScrollDownHintProps {
  label?: string;
  autoHideAfter?: number;
  onDismiss?: () => void;
  dismissOnInteraction?: boolean;
  mode?: "inline" | "fixed";
  fixedBottom?: number;
}

const SCROLL_DOWN_HINT_CSS = `
  @keyframes sdh-wheel {
    0% { transform: translateY(0); opacity: 0; }
    20% { opacity: 1; }
    60% { transform: translateY(7px); opacity: 1; }
    100% { transform: translateY(9px); opacity: 0; }
  }
  @keyframes sdh-labelGlow {
    0%, 100% { opacity: 0.74; }
    50% { opacity: 1; }
  }
  @keyframes sdh-fadeInUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes sdh-fadeOut {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(8px); }
  }
`;

const ScrollDownHint: React.FC<ScrollDownHintProps> = ({
  label = "Scroll down",
  autoHideAfter = 0,
  onDismiss,
  dismissOnInteraction = false,
  mode = "inline",
  fixedBottom = 32,
}) => {
  const [visible, setVisible] = useState(true);
  const [hiding, setHiding] = useState(false);

  const dismiss = useCallback(() => {
    if (!visible || hiding) return;
    setHiding(true);
    window.setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, 320);
  }, [hiding, onDismiss, visible]);

  useEffect(() => {
    if (!autoHideAfter) return;
    const timer = window.setTimeout(dismiss, autoHideAfter);
    return () => window.clearTimeout(timer);
  }, [autoHideAfter, dismiss]);

  useEffect(() => {
    if (!dismissOnInteraction) return;
    const handler = () => dismiss();
    window.addEventListener("scroll", handler, { once: true, passive: true });
    document.addEventListener("pointerdown", handler, { once: true });
    document.addEventListener("touchstart", handler, { once: true, passive: true });
    return () => {
      window.removeEventListener("scroll", handler);
      document.removeEventListener("pointerdown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [dismiss, dismissOnInteraction]);

  if (!visible) return null;

  return (
    <>
      <style>{SCROLL_DOWN_HINT_CSS}</style>
      <div
        style={{
          position: mode === "fixed" ? "fixed" : "relative",
          left: mode === "fixed" ? "50%" : undefined,
          bottom: mode === "fixed" ? fixedBottom : undefined,
          transform: mode === "fixed" ? "translateX(-50%)" : undefined,
          zIndex: 9000,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          padding: "8px 14px",
          borderRadius: 999,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.08) 100%), rgba(12,16,25,0.56)",
          backdropFilter: "blur(12px) saturate(135%)",
          WebkitBackdropFilter: "blur(12px) saturate(135%)",
          border: "1px solid rgba(255,255,255,0.26)",
          boxShadow: "0 8px 28px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.24)",
          animation: hiding ? "sdh-fadeOut .32s ease forwards" : "sdh-fadeInUp .4s ease both",
          pointerEvents: "auto",
          userSelect: "none",
          minWidth: 118,
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: 18,
            height: 28,
            borderRadius: 12,
            border: "1.4px solid rgba(255,255,255,0.9)",
            position: "relative",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              marginTop: 4,
              width: 2.6,
              height: 5.5,
              borderRadius: 8,
              background: "rgba(255,255,255,0.96)",
              animation: "sdh-wheel 1.5s ease-in-out infinite",
            }}
          />
        </div>
        <span
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: 10,
            fontWeight: 700,
            color: "rgba(255,255,255,0.96)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            textShadow: "0 1px 10px rgba(0,0,0,0.55)",
            animation: "sdh-labelGlow 1.25s ease-in-out infinite",
          }}
        >
          {label}
        </span>
      </div>
    </>
  );
};

export default ScrollDownHint;
