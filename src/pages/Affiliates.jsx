import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Link2,
  Share2,
  Wallet,
  LineChart,
  BadgeEuro,
  Rocket,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

/*
 * Public "Affiliate program" explainer / landing page.
 * Self-contained: it explains the program end-to-end so a visitor can convert
 * without a sales call. Uses the global "ex-" design system (scoped under
 * .ex-dash) plus Tailwind + lucide-react icons — same look as Pricing.jsx.
 * Route is wired externally in App.jsx (not edited here).
 */

const STEPS = [
  {
    icon: Link2,
    title: "Get your link",
    body:
      "Apply in a minute and we generate your personal referral link and invite code — no approval calls, no paperwork.",
  },
  {
    icon: Share2,
    title: "Share it",
    body:
      "Drop your link anywhere your audience already is: DMs, stories, a blog post, a newsletter or your community.",
  },
  {
    icon: Wallet,
    title: "Earn",
    body:
      "Every time someone signs up and pays through your link, commission lands in your dashboard automatically.",
  },
];

const BENEFITS = [
  {
    icon: BadgeEuro,
    title: "Commission per paid signup",
    body:
      "Get paid for every member who upgrades through your link. Clear, fixed commission — no guessing what you'll make.",
  },
  {
    icon: LineChart,
    title: "Real-time dashboard",
    body:
      "Track clicks, signups, conversions and euros earned live. See exactly what's working and double down on it.",
  },
  {
    icon: Link2,
    title: "Your own referral link",
    body:
      "A permanent link and personal invite code tied to your account — every signup is attributed to you forever.",
  },
  {
    icon: ShieldCheck,
    title: "Transparent tracking",
    body:
      "Cookie-backed attribution and an honest ledger. What you see in your dashboard is what you get paid.",
  },
];

const FAQ = [
  {
    q: "How much do I earn?",
    a:
      "You earn a fixed commission for every paid signup that comes through your link. Your exact rate and running total are always visible in your partner dashboard.",
  },
  {
    q: "When do I get paid?",
    a:
      "Commission is credited as your referrals convert to paid plans. You can watch it accrue in real time and cash out on the regular payout cycle.",
  },
  {
    q: "Do I need an audience?",
    a:
      "No. Whether you share one link with a few friends or promote to thousands, you earn on every paid signup — the program scales with you.",
  },
  {
    q: "Is there any cost to join?",
    a:
      "None. Applying is free and takes about a minute. Once you're in, your link and dashboard are ready immediately.",
  },
];

const Affiliates = () => {
  const navigate = useNavigate();

  return (
    <div className="ex-dash" data-role="student">
      <div className="ex-shell">
        <div className="ex-wrap">
          {/* hero ---------------------------------------------------------- */}
          <header className="text-center" style={{ marginBottom: 8 }}>
            <span className="ex-eyebrow" style={{ justifyContent: "center" }}>
              Affiliate program
            </span>
            <h1 className="ex-title">
              Turn your link into <span className="ex-g">income</span>
            </h1>
            <p className="ex-lead" style={{ marginInline: "auto" }}>
              Refer people to Exzellent and earn a commission on every paid
              signup. Grab your personal link, share it anywhere, and watch your
              earnings climb in a real-time dashboard.
            </p>
            <div
              className="flex flex-wrap items-center justify-center gap-3"
              style={{ marginTop: 26 }}
            >
              <button
                type="button"
                onClick={() => navigate("/waitlist")}
                className="ex-btn ex-btn-primary"
              >
                Apply now <ArrowRight size={17} />
              </button>
              <button
                type="button"
                onClick={() => navigate("/partner")}
                className="ex-btn ex-btn-ghost"
              >
                See your dashboard
              </button>
            </div>
          </header>

          {/* how it works -------------------------------------------------- */}
          <section style={{ marginTop: 64 }}>
            <div className="text-center" style={{ marginBottom: 8 }}>
              <span className="ex-eyebrow" style={{ justifyContent: "center" }}>
                How it works
              </span>
              <h2 className="ex-title" style={{ fontSize: "1.9rem" }}>
                Three steps to your first <span className="ex-g">payout</span>
              </h2>
            </div>
            <div
              className="grid gap-5"
              style={{
                marginTop: 34,
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              }}
            >
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="ex-card ex-card-hover">
                    <div
                      className="flex items-center gap-3"
                      style={{ marginBottom: 12 }}
                    >
                      <span
                        className="ex-badge ex-badge-accent"
                        style={{ width: 34, height: 34, padding: 0, justifyContent: "center" }}
                      >
                        <Icon size={17} />
                      </span>
                      <span style={{ color: "var(--ex-muted)", fontWeight: 700, fontSize: ".82rem" }}>
                        Step {i + 1}
                      </span>
                    </div>
                    <h3 style={{ fontFamily: "var(--ex-font)", fontWeight: 700, fontSize: "1.15rem", marginBottom: 8 }}>
                      {step.title}
                    </h3>
                    <p style={{ color: "var(--ex-muted)", fontSize: ".92rem", lineHeight: 1.55 }}>
                      {step.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* what you get -------------------------------------------------- */}
          <section style={{ marginTop: 64 }}>
            <div className="text-center" style={{ marginBottom: 8 }}>
              <span className="ex-eyebrow" style={{ justifyContent: "center" }}>
                What you get
              </span>
              <h2 className="ex-title" style={{ fontSize: "1.9rem" }}>
                Built to <span className="ex-g">pay you</span>
              </h2>
            </div>
            <div
              className="grid gap-5"
              style={{
                marginTop: 34,
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              }}
            >
              {BENEFITS.map((b) => {
                const Icon = b.icon;
                return (
                  <div key={b.title} className="ex-card ex-card-hover">
                    <span
                      className="ex-badge ex-badge-accent"
                      style={{ width: 38, height: 38, padding: 0, justifyContent: "center", marginBottom: 14 }}
                    >
                      <Icon size={19} />
                    </span>
                    <h3 style={{ fontFamily: "var(--ex-font)", fontWeight: 700, fontSize: "1.08rem", marginBottom: 8 }}>
                      {b.title}
                    </h3>
                    <p style={{ color: "var(--ex-muted)", fontSize: ".9rem", lineHeight: 1.55 }}>
                      {b.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* faq ----------------------------------------------------------- */}
          <section style={{ marginTop: 64 }}>
            <div className="text-center" style={{ marginBottom: 8 }}>
              <span className="ex-eyebrow" style={{ justifyContent: "center" }}>
                FAQ
              </span>
              <h2 className="ex-title" style={{ fontSize: "1.9rem" }}>
                Good to <span className="ex-g">know</span>
              </h2>
            </div>
            <div
              className="grid gap-4"
              style={{
                marginTop: 34,
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              }}
            >
              {FAQ.map((item) => (
                <div key={item.q} className="ex-card">
                  <h3 style={{ fontFamily: "var(--ex-font)", fontWeight: 700, fontSize: "1rem", marginBottom: 8 }}>
                    {item.q}
                  </h3>
                  <p style={{ color: "var(--ex-muted)", fontSize: ".9rem", lineHeight: 1.55 }}>
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* final CTA band ------------------------------------------------ */}
          <section style={{ marginTop: 64, marginBottom: 24 }}>
            <div
              className="ex-card text-center"
              style={{
                padding: "44px 28px",
                borderColor: "rgba(var(--pRGB), .5)",
                boxShadow: "0 20px 52px rgba(var(--pRGB), .18)",
              }}
            >
              <span
                className="ex-badge ex-badge-accent"
                style={{ marginInline: "auto", marginBottom: 14, display: "inline-flex" }}
              >
                <Rocket size={14} /> Start earning today
              </span>
              <h2 className="ex-title" style={{ fontSize: "2rem" }}>
                Ready to <span className="ex-g">get paid</span> for sharing?
              </h2>
              <p className="ex-lead" style={{ marginInline: "auto" }}>
                Apply in a minute, get your link, and start earning commission on
                every paid signup.
              </p>
              <div
                className="flex flex-wrap items-center justify-center gap-3"
                style={{ marginTop: 24 }}
              >
                <button
                  type="button"
                  onClick={() => navigate("/waitlist")}
                  className="ex-btn ex-btn-primary"
                >
                  Apply now <ArrowRight size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/partner")}
                  className="ex-btn ex-btn-ghost"
                >
                  See your dashboard
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Affiliates;
