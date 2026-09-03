import { motion, useReducedMotion } from "framer-motion";

const StoryHeader = ({ sessions }) => {
  const prefersReducedMotion = useReducedMotion();

  const tutoringCount = sessions.filter((s) => s.type === "tutoring").length;

  const psychologyCount = sessions.filter(
    (s) => s.type === "psychology",
  ).length;

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="text-center py-6 space-y-4"
    >
      <span
        className="inline-block text-xs font-semibold uppercase tracking-[0.2em]"
        style={{ color: "var(--sd-gold)" }}
      >
        Your Growth Path
      </span>

      <h2
        className="text-3xl sm:text-5xl font-semibold leading-tight"
        style={{ color: "var(--sd-ink)", fontFamily: "var(--sd-font-heading)" }}
      >
        Your{" "}
        <span
          style={{
            background: "linear-gradient(135deg, var(--sd-primary-light), var(--sd-gold))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          learning mix
        </span>
      </h2>

      <p className="text-base md:text-lg max-w-2xl mx-auto" style={{ color: "var(--sd-ink-muted)" }}>
        You currently have{" "}
        <span className="font-semibold" style={{ color: "var(--sd-gold)" }}>
          {tutoringCount}
        </span>{" "}
        tutoring session{tutoringCount !== 1 ? "s" : ""} and{" "}
        <span className="font-semibold" style={{ color: "var(--sd-gold)" }}>
          {psychologyCount}
        </span>{" "}
        psychology session{psychologyCount !== 1 ? "s" : ""}, shaping your personalized growth path.
      </p>
    </motion.div>
  );
};

export default StoryHeader;
