import React from "react";

/**
 * A frosted panel with a coloured glow behind it.
 *
 * Used by the free student dashboard for its quick-action cards. `glowColor`
 * tints the halo so each card reads as its own thing, and `intensity` scales
 * that halo rather than the card, so the text contrast never moves with it.
 *
 * The glow is a sibling element rather than a box-shadow on the card: a shadow
 * that large bleeds over neighbouring cards in a grid, and cannot be blurred
 * independently of the border.
 */
const GlassCard = ({
  children,
  glowColor = "#8C51F0",
  intensity = 1,
  className = "",
  style,
  ...rest
}) => {
  const glow = Math.max(0, Math.min(2, Number(intensity) || 0));

  return (
    <div
      className={`relative h-full ${className}`}
      style={{ isolation: "isolate", ...style }}
      {...rest}
    >
      {/* The halo. Non-interactive so it can never eat a click meant for the
          card, which is easy to get wrong with an absolutely-positioned layer. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px rounded-2xl"
        style={{
          background: `radial-gradient(120% 120% at 50% 0%, ${glowColor}33, transparent 70%)`,
          filter: `blur(${8 * glow}px)`,
          opacity: 0.9 * glow,
          zIndex: -1,
        }}
      />
      <div
        className="h-full rounded-2xl p-5"
        style={{
          background: "rgba(255,255,255,.04)",
          border: `1px solid ${glowColor}40`,
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          boxShadow: "0 10px 30px rgba(0,0,0,.25)",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default GlassCard;
