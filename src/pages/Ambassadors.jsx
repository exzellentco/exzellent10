import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Link2,
  Megaphone,
  Wallet,
  LayoutTemplate,
  Gauge,
  Headphones,
  Handshake,
  Star,
  Sparkles,
  ArrowRight,
} from "lucide-react";

/*
 * Public "Ambassador program" explainer / landing page — for creators and
 * influencers. Self-contained so a visitor understands and converts without a
 * sales call. Uses the global "ex-" design system (scoped under .ex-dash) plus
 * Tailwind + lucide-react icons — same look as Pricing.jsx / Affiliates.jsx.
 * Route is wired externally in App.jsx (not edited here).
 */

const STEPS = [
  {
    icon: Link2,
    title: "Get your link & page",
    body:
      "Become an ambassador and we set you up with your own branded explainer page and a personal referral link.",
  },
  {
    icon: Megaphone,
    title: "Share it with your audience",
    body:
      "Feature Exzellent in your content — videos, posts, stories, newsletters. Your page does the selling for you.",
  },
  {
    icon: Wallet,
    title: "Earn & grow together",
    body:
      "Earn on every paid signup and unlock co-marketing as your community grows. Track it all in your creator dashboard.",
  },
];

const BENEFITS = [
  {
    icon: LayoutTemplate,
    title: "Your own explainer page",
    body:
      "A branded landing page built to convert your audience — so you can just share a link instead of pitching on every call.",
  },
  {
    icon: Gauge,
    title: "Creator dashboard",
    body:
      "See referrals, conversions and earnings in real time, plus the numbers you need to plan your next collab.",
  },
  {
    icon: Headphones,
    title: "Priority support",
    body:
      "A direct line to our team. Questions, assets, campaign ideas — you get answered first, not left in a queue.",
  },
  {
    icon: Handshake,
    title: "Co-marketing",
    body:
      "Get featured across Exzellent channels, run joint campaigns and unlock creative assets to amplify your reach.",
  },
];

const FAQ = [
  {
    q: "Who is the ambassador program for?",
    a:
      "Creators, educators and influencers whose audience wants to learn. If you make content and have people who trust your recommendations, you're a fit.",
  },
  {
    q: "How is it different from the affiliate program?",
    a:
      "Ambassadors get everything affiliates get — link, commission, dashboard — plus their own explainer page, priority support and co-marketing collaboration.",
  },
  {
    q: "How do I earn?",
    a:
      "You earn commission on every paid signup that comes through your referral link, tracked live in your creator dashboard.",
  },
  {
    q: "What do I need to apply?",
    a:
      "Just your audience and your enthusiasm. Apply in a minute — no minimum follower count, no long approval process.",
  },
];

const Ambassadors = () => {
  const navigate = useNavigate();

  return (
    <div className="ex-dash" data-role="teacher">
      <div className="ex-shell">
        <div className="ex-wrap">
          {/* hero ---------------------------------------------------------- */}
          <header className="text-center" style={{ marginBottom: 8 }}>
            <span className="ex-eyebrow" style={{ justifyContent: "center" }}>
              Ambassador program
            </span>
            <h1 className="ex-title">
              Become the face of <span className="ex-g">Exzellent</span>
            </h1>
            <p className="ex-lead" style={{ marginInline: "auto" }}>
              For creators and influencers. Get your own explainer page, a
              creator dashboard and priority support — then earn on every paid
              signup while we amplify you with co-marketing.
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
                From creator to <span className="ex-g">partner</span>
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
                Everything a creator <span className="ex-g">needs</span>
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
                Questions, <span className="ex-g">answered</span>
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
                <Star size={14} /> Limited ambassador spots
              </span>
              <h2 className="ex-title" style={{ fontSize: "2rem" }}>
                Ready to <span className="ex-g">go pro</span> with your audience?
              </h2>
              <p className="ex-lead" style={{ marginInline: "auto" }}>
                Apply now to claim your explainer page, creator dashboard and
                co-marketing support.
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
                  Apply now <Sparkles size={16} />
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

export default Ambassadors;
