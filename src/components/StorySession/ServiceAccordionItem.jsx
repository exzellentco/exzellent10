import { useRef, useLayoutEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

const ServiceAccordionItem = ({ service, isOpen, onClick, index = 0 }) => {
  const prefersReducedMotion = useReducedMotion();
  const { title, flex, pic, desc, link, pageName, icon: Icon } = service;

  // The body stays permanently mounted (never removed from the DOM) and we
  // animate between two concrete pixel values (0 and its real measured
  // height) instead of animating to/from the string "auto". Animating to
  // "auto" is what caused the jerky, snap-at-the-end feel — framer-motion
  // has to approximate that target, whereas a real pixel value tweens
  // smoothly and consistently for the entire open AND close motion.
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);

  useLayoutEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [isOpen, desc, pic, pageName]);

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.24), ease: [0.16, 1, 0.3, 1] }}
      whileHover={prefersReducedMotion ? undefined : { y: -3 }}
      className="w-full rounded-2xl overflow-hidden cursor-pointer"
      style={{
        background: "var(--sd-card-bg)",
        border: isOpen ? "1px solid rgba(140,81,240,0.55)" : "1px solid var(--sd-border)",
        boxShadow: isOpen
          ? "0 0 0 1px rgba(140,81,240,0.15), 0 10px 30px rgba(140,81,240,0.16)"
          : "0 2px 10px rgba(0,0,0,0.2)",
        transition: "border-color 0.25s ease, box-shadow 0.25s ease",
      }}
    >
      {/* Header row — toggles the accordion */}
      <div
        className="flex items-center gap-4 p-4 md:p-5"
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick?.()}
        aria-expanded={isOpen}
      >
        <div
          className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(140,81,240,0.14)" }}
        >
          {Icon && <Icon className="w-5 h-5" style={{ color: "var(--sd-primary-light)" }} />}
        </div>

        <span
          className="flex-1 text-base md:text-lg font-semibold text-left"
          style={{ color: "var(--sd-ink)", fontFamily: "var(--sd-font-heading)" }}
        >
          {title}
        </span>

        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-5 h-5" style={{ color: "var(--sd-gold)" }} />
        </motion.span>
      </div>

      {/* Expandable body — always mounted, height tweened between 0 and its
          real measured pixel height for a genuinely smooth open/close. */}
      <motion.div
        initial={false}
        animate={{
          height: prefersReducedMotion ? (isOpen ? "auto" : 0) : isOpen ? contentHeight : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
        }
        style={{ overflow: "hidden" }}
        aria-hidden={!isOpen}
      >
        <div
          ref={contentRef}
          className={`flex ${flex} flex-col-reverse sm:gap-5 items-center px-4 md:px-5 pb-5 pt-5`}
          style={{ borderTop: "1px solid var(--sd-border)" }}
        >
          <div className="flex flex-col gap-3 items-center sm:items-start text-center sm:text-left">
            <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--sd-ink-muted)" }}>
              {desc}
            </p>

            <Link
              to={link}
              tabIndex={isOpen ? 0 : -1}
              onClick={(e) => e.stopPropagation()}
              className="text-sm font-medium hover:underline"
              style={{ color: "var(--sd-primary-light)" }}
            >
              To the {pageName} →
            </Link>
          </div>

          <img
            src={pic}
            alt={pageName}
            className="h-32 sm:h-40 md:h-44 w-full sm:w-56 rounded-xl object-cover flex-shrink-0"
            style={{ border: "1px solid var(--sd-border)" }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ServiceAccordionItem;
