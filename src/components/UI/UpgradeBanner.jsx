import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Sparkles } from "lucide-react";
import { PLAN_ROUTE } from "../../config/plan";

/**
 * The "what the full plan adds" banner, shared by both free dashboards.
 *
 * Deliberately plain: it states what you get and links to the plans. No
 * countdown, no pulsing border, no "unlock your potential" — a person deciding
 * whether to pay is better served by a list than by pressure.
 *
 * `accent` keeps it in the host page's palette (violet for a learner, amber for
 * a teacher) so it reads as part of the dashboard rather than an advert
 * dropped on top of it.
 */
const UpgradeBanner = ({
  eyebrow = "Full plan",
  title,
  lines = [],
  cta = "See the plans",
  accent = "var(--sd-primary, #8C51F0)",
  border = "var(--sd-border, rgba(140,81,240,0.22))",
  ink = "var(--sd-ink, #F3EEFB)",
  muted = "var(--sd-ink-muted, #a79cc7)",
}) => {
  const navigate = useNavigate();

  return (
    <section
      className="rounded-2xl p-6 mt-8"
      style={{ border: `1px solid ${border}`, background: "rgba(255,255,255,.02)" }}
    >
      <div className="flex flex-wrap items-center gap-5">
        <div className="flex-1" style={{ minWidth: 260 }}>
          <p
            className="text-xs uppercase tracking-[0.2em] mb-2 inline-flex items-center gap-1.5"
            style={{ color: accent }}
          >
            <Sparkles size={13} /> {eyebrow}
          </p>
          <h3 className="text-xl font-semibold m-0 mb-2" style={{ color: ink }}>{title}</h3>
          {!!lines.length && (
            <ul className="m-0 p-0 list-none flex flex-wrap gap-x-5 gap-y-1">
              {lines.map((l) => (
                <li key={l} className="text-sm" style={{ color: muted }}>· {l}</li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="button"
          onClick={() => navigate(PLAN_ROUTE)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium"
          style={{ background: accent, color: "#14101d" }}
        >
          {cta} <ChevronRight size={15} />
        </button>
      </div>
    </section>
  );
};

export default UpgradeBanner;
