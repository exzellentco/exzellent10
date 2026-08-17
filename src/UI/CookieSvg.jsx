import React from "react";

function CookieSvg() {
  return (
    <>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle
          cx="10"
          cy="10"
          r="9"
          stroke="var(--color-primary)"
          strokeWidth="1.5"
        />
        <circle cx="7" cy="8" r="1.2" fill="var(--color-primary)" />
        <circle cx="12" cy="7" r="1" fill="var(--color-secondary)" />
        <circle cx="11" cy="12" r="1.2" fill="var(--color-primary)" />
        <circle cx="7" cy="13" r="0.9" fill="var(--color-secondary)" />
        <circle cx="14" cy="11" r="0.8" fill="var(--color-tertiary)" />
      </svg>
    </>
  );
}

export default CookieSvg;
