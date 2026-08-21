import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Sparkles, Zap, Clock, Users, ArrowRight } from "lucide-react";
import { getPlans, subscribe, getStats, heartbeat } from "../APIs/learning";

/*
 * Public pricing page for Exzellent — with growth/urgency mechanics:
 *  1. A visible evergreen countdown timer on the offer.
 *  2. Yearly billing presented first (preferred); a "pay monthly" decline path
 *     then nudges the cheapest plan (airline-style upsell → downsell).
 *  3. A live "online now" counter (session activity) + a gently-growing member
 *     social-proof number.
 * Uses the app's "ex-" design system (scoped under .ex-dash).
 */

const OFFER_WINDOW_MS = 20 * 60 * 1000; // 20-minute evergreen countdown
const YEARLY_FREE_MONTHS = 2;           // "2 months free" on annual billing

const isStudent = () => {
  try { return JSON.parse(localStorage.getItem("user"))?.userType === "Student"; } catch { return false; }
};
const splitPrice = (price) => Number(price).toFixed(2).split(".");
const fmtClock = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

// Read (or start) the per-visitor offer deadline; restart it once it elapses so
// the timer is always visibly running.
const offerDeadline = () => {
  const now = Date.now();
  let d = Number(localStorage.getItem("exz_offer_deadline") || 0);
  if (!d || d <= now) { d = now + OFFER_WINDOW_MS; localStorage.setItem("exz_offer_deadline", String(d)); }
  return d;
};

const Pricing = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [signupBonus, setSignupBonus] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activating, setActivating] = useState(null);

  const [billing, setBilling] = useState("yearly"); // yearly presented first
  const [declined, setDeclined] = useState(false);   // switched to monthly

  const [remaining, setRemaining] = useState(OFFER_WINDOW_MS);
  const [stats, setStats] = useState({ online: 0, members: 0 });
  const serverStats = useRef({ online: 0, members: 0 });

  /* ---- plans ---- */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true); setError(null);
        const res = await getPlans();
        if (!alive) return;
        setPlans(Array.isArray(res?.data) ? res.data : []);
        setSignupBonus(res?.signupBonus || 0);
      } catch (err) {
        if (alive) setError(err.message || "Could not load pricing plans.");
      } finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);

  /* ---- countdown ---- */
  useEffect(() => {
    const tick = () => setRemaining(offerDeadline() - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  /* ---- live stats: poll + heartbeat + gentle local drift ---- */
  useEffect(() => {
    let alive = true;
    const pull = async () => {
      try {
        const s = await getStats();
        if (!alive) return;
        serverStats.current = { online: s.online || 0, members: s.members || 0 };
        setStats(serverStats.current);
      } catch { /* keep last value */ }
    };
    pull();
    const pollId = setInterval(pull, 25000);
    const beatId = setInterval(() => { heartbeat().catch(() => {}); }, 45000);
    // Between polls, gently flicker "online" ±1 so it reads as live. The big
    // members number only moves with the server (which ticks up every ~6 min),
    // so it climbs slowly rather than obviously fast.
    const driftId = setInterval(() => {
      setStats((prev) => {
        const base = serverStats.current;
        const jitter = Math.random() < 0.6 ? 0 : Math.random() < 0.5 ? 1 : -1;
        return { online: Math.max(1, base.online + jitter), members: Math.max(prev.members, base.members) };
      });
    }, 6000);
    return () => { alive = false; clearInterval(pollId); clearInterval(beatId); clearInterval(driftId); };
  }, []);

  const cheapest = plans.length ? plans.reduce((a, b) => (Number(a.price) <= Number(b.price) ? a : b)) : null;

  // Price shown per billing period.
  const priceFor = (plan) => {
    const monthly = Number(plan.price);
    if (billing === "yearly") {
      const yearlyTotal = monthly * (12 - YEARLY_FREE_MONTHS); // 2 months free
      return { big: splitPrice(yearlyTotal), suffix: "/yr", sub: `≈ €${(yearlyTotal / 12).toFixed(2)}/mo · billed yearly`, was: (monthly * 12).toFixed(0) };
    }
    return { big: splitPrice(monthly), suffix: "/mo", sub: `${Number(plan.credits).toLocaleString()} credits / month`, was: null };
  };

  const handleChoose = async (plan) => {
    if (typeof plan.paymentLink === "string" && plan.paymentLink.trim()) {
      window.location.href = plan.paymentLink; return;
    }
    if (isStudent()) {
      try { setActivating(plan.id); await subscribe(plan.id); navigate("/student-dashboard"); }
      catch (err) { setError(err.message || "Could not activate your plan. Please try again."); }
      finally { setActivating(null); }
      return;
    }
    navigate(`/signup?plan=${plan.id}&billing=${billing}`);
  };

  return (
    <div className="ex-dash" data-role="student">
      <div className="ex-shell">
        <div className="ex-wrap">
          {/* live social proof bar */}
          <div className="prc-live">
            <span className="prc-live-dot" />
            <Users size={15} style={{ opacity: 0.85 }} />
            <b>{(stats.online || 0).toLocaleString()}</b>&nbsp;learning right now
            <span className="prc-live-sep">·</span>
            <b>{(stats.members || 0).toLocaleString()}+</b>&nbsp;members and growing
          </div>

          {/* header */}
          <header className="text-center" style={{ marginBottom: 8 }}>
            <span className="ex-eyebrow" style={{ justifyContent: "center" }}>Pricing</span>
            <h1 className="ex-title">Learn faster with <span className="ex-g">Exzellent credits</span></h1>
            <p className="ex-lead" style={{ marginInline: "auto" }}>
              One simple subscription. Spend credits on AI tools, live classes, webinars and course
              materials — scale up whenever you need more.
            </p>
          </header>

          {/* countdown offer banner */}
          <div className="prc-timer">
            <Clock size={17} />
            <span>Launch offer ends in</span>
            <b className="prc-clock">{fmtClock(remaining)}</b>
            <span className="prc-timer-note">— lock in {YEARLY_FREE_MONTHS} months free with yearly billing</span>
          </div>

          {/* billing toggle — yearly presented first */}
          <div className="prc-toggle-wrap">
            <div className="prc-toggle">
              <button
                type="button"
                className={`prc-toggle-btn ${billing === "yearly" ? "on" : ""}`}
                onClick={() => { setBilling("yearly"); setDeclined(false); }}
              >
                Yearly <span className="prc-save">save {YEARLY_FREE_MONTHS} months</span>
              </button>
              <button
                type="button"
                className={`prc-toggle-btn ${billing === "monthly" ? "on" : ""}`}
                onClick={() => { setBilling("monthly"); setDeclined(true); }}
              >
                Monthly
              </button>
            </div>
            {billing === "yearly" && (
              <button type="button" className="prc-decline" onClick={() => { setBilling("monthly"); setDeclined(true); }}>
                Not ready for a year? Pay monthly →
              </button>
            )}
          </div>

          {/* downsell nudge after declining yearly */}
          {declined && billing === "monthly" && cheapest && (
            <div className="prc-downsell">
              <div>
                <b>No pressure — start small.</b>{" "}
                Get going on <b>{cheapest.name}</b> for just €{splitPrice(cheapest.price)[0]}.{splitPrice(cheapest.price)[1]}/mo and upgrade anytime.
              </div>
              <button type="button" className="ex-btn ex-btn-primary" style={{ whiteSpace: "nowrap" }} onClick={() => handleChoose(cheapest)}>
                Start with {cheapest.name} <ArrowRight size={15} />
              </button>
            </div>
          )}

          {/* signup bonus */}
          {signupBonus > 0 && (
            <div className="ex-badge ex-badge-accent" style={{ margin: "22px auto 0", display: "flex", width: "fit-content", padding: "9px 18px", fontSize: ".9rem" }}>
              <Sparkles size={16} /> Every new member gets {signupBonus.toLocaleString()} free credits
            </div>
          )}

          {error && (
            <div className="ex-badge ex-badge-warn" style={{ margin: "22px auto 0", display: "flex", width: "fit-content", padding: "10px 18px" }}>{error}</div>
          )}

          {loading && (
            <div style={{ display: "flex", justifyContent: "center", padding: "72px 0" }}>
              <span className="ex-spinner" style={{ width: 34, height: 34 }} />
            </div>
          )}

          {/* plan grid */}
          {!loading && !error && plans.length > 0 && (
            <div className="grid gap-5" style={{ marginTop: 34, gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" }}>
              {plans.map((plan) => {
                const p = priceFor(plan);
                const busy = activating === plan.id;
                const highlight = plan.popular;
                return (
                  <div key={plan.id} className="ex-card ex-card-hover" style={{
                    display: "flex", flexDirection: "column", position: "relative",
                    borderColor: highlight ? "rgba(var(--pRGB), .55)" : undefined,
                    boxShadow: highlight ? "0 20px 52px rgba(var(--pRGB), .18)" : undefined,
                  }}>
                    {highlight && (
                      <span className="ex-badge ex-badge-accent" style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: "var(--ex-grad)", color: "#06121c", borderColor: "transparent" }}>
                        <Zap size={13} /> Most popular
                      </span>
                    )}

                    <h3 style={{ fontFamily: "var(--ex-font)", fontWeight: 700, fontSize: "1.15rem", marginTop: highlight ? 6 : 0 }}>{plan.name}</h3>

                    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, margin: "12px 0 2px" }}>
                      <span style={{ fontSize: "1.4rem", color: "var(--ex-muted)", lineHeight: 1.6 }}>€</span>
                      <span style={{ fontFamily: "var(--ex-font)", fontWeight: 700, fontSize: "2.6rem", lineHeight: 1 }}>{p.big[0]}</span>
                      <span style={{ fontSize: "1.1rem", color: "var(--ex-muted)" }}>.{p.big[1]}</span>
                      <span style={{ fontSize: ".9rem", color: "var(--ex-muted)", marginBottom: 4, marginLeft: 3 }}>{p.suffix}</span>
                    </div>

                    {billing === "yearly" && p.was && (
                      <div style={{ fontSize: ".82rem", marginBottom: 2 }}>
                        <span style={{ textDecoration: "line-through", color: "var(--ex-muted)" }}>€{p.was}/yr</span>{" "}
                        <span style={{ color: "var(--pL)", fontWeight: 700 }}>· {YEARLY_FREE_MONTHS} months free</span>
                      </div>
                    )}
                    <p style={{ color: "var(--ex-muted)", fontWeight: 600, fontSize: ".85rem", marginBottom: 16 }}>{p.sub}</p>

                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10, flex: 1 }}>
                      {(plan.features || []).map((feature, i) => (
                        <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: ".9rem" }}>
                          <Check size={17} style={{ color: "var(--pL)", flexShrink: 0, marginTop: 1 }} />
                          <span style={{ color: "var(--ex-text)" }}>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button type="button" onClick={() => handleChoose(plan)} disabled={busy}
                      className={`ex-btn ${highlight ? "ex-btn-primary" : "ex-btn-ghost"}`} style={{ width: "100%", marginTop: 20 }}>
                      {busy ? (<><span className="ex-spinner" /> Activating…</>) : `Choose ${plan.name}`}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && !error && plans.length > 0 && (
            <div className="text-center" style={{ marginTop: 34 }}>
              <p style={{ color: "var(--ex-muted)", fontSize: ".9rem", maxWidth: "62ch", marginInline: "auto" }}>
                Credits power AI tools, classes, webinars and materials — like ChatGPT/Claude usage.
              </p>
              <p style={{ color: "var(--ex-muted)", fontSize: ".82rem", marginTop: 8 }}>Prices in EUR. Cancel anytime.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
