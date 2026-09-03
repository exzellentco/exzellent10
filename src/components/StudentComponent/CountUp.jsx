import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * A number that counts up to its value when it first appears.
 *
 * Two things it deliberately gets right:
 *
 *  - It respects prefers-reduced-motion. Counting digits is exactly the kind of
 *    movement that triggers discomfort for some people, and a dashboard figure
 *    is information first and decoration second.
 *  - It animates on real elapsed time via requestAnimationFrame rather than a
 *    fixed step per frame, so the duration is the same on a 60Hz and a 144Hz
 *    screen instead of running twice as fast on the latter.
 */
const CountUp = ({ value = 0, suffix = "", duration = 900, decimals = 0 }) => {
  const target = Number(value) || 0;
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(reduced ? target : 0);
  const frame = useRef(0);

  useEffect(() => {
    if (reduced) { setShown(target); return undefined; }

    const from = 0;
    const start = performance.now();
    // Ease-out: fast at first, settling at the end, which reads as arriving at
    // a figure rather than ticking mechanically toward it.
    const ease = (t) => 1 - (1 - t) ** 3;

    const step = (now) => {
      const t = Math.min(1, (now - start) / Math.max(1, duration));
      setShown(from + (target - from) * ease(t));
      if (t < 1) frame.current = requestAnimationFrame(step);
    };

    frame.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration, reduced]);

  const text = decimals > 0
    ? shown.toFixed(decimals)
    : Math.round(shown).toLocaleString();

  return <>{text}{suffix}</>;
};

export default CountUp;
