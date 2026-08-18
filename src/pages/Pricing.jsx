import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Sparkles, Zap } from "lucide-react";
import { getPlans, subscribe } from "../APIs/learning";

/*
 * Public pricing page for Exzellent.
 * Uses the app's global "ex-" design system (scoped under .ex-dash) plus
 * Tailwind utilities — the same look as the logged-in dashboards / DashboardShell.
 * Route is wired externally in App.jsx (not edited here).
 */

// A student is logged in when localStorage `user` has userType === "Student".
const isStudent = () => {
  try {
    return JSON.parse(localStorage.getItem("user"))?.userType === "Student";
  } catch {
    return false;
  }
};

// 8.99 -> ["8", "99"] so we can style the euros / cents separately.
const splitPrice = (price) => {
  const [euros, cents = "00"] = Number(price).toFixed(2).split(".");
  return [euros, cents];
};

const Pricing = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [signupBonus, setSignupBonus] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activating, setActivating] = useState(null); // planId currently subscribing

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getPlans();
        if (!alive) return;
        setPlans(Array.isArray(res?.data) ? res.data : []);
        setSignupBonus(res?.signupBonus || 0);
      } catch (err) {
        if (alive) setError(err.message || "Could not load pricing plans.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const handleChoose = async (plan) => {
    // 1) Real Stripe checkout link takes priority.
    if (typeof plan.paymentLink === "string" && plan.paymentLink.trim()) {
      window.location.href = plan.paymentLink;
      return;
    }
    // 2) Logged-in student → subscribe directly, then go to their dashboard.
    if (isStudent()) {
      try {
        setActivating(plan.id);
        await subscribe(plan.id);
        navigate("/student-dashboard");
      } catch (err) {
        setError(err.message || "Could not activate your plan. Please try again.");
      } finally {
        setActivating(null);
      }
      return;
    }
    // 3) Everyone else → sign up with the chosen plan pre-selected.
    navigate(`/signup?plan=${plan.id}`);
  };

  return (
    <div className="ex-dash" data-role="student">
      <div className="ex-shell">
        <div className="ex-wrap">
          {/* header ------------------------------------------------------- */}
          <header className="text-center" style={{ marginBottom: 8 }}>
            <span className="ex-eyebrow" style={{ justifyContent: "center" }}>
              Pricing
            </span>
            <h1 className="ex-title">
              Learn faster with <span className="ex-g">Exzellent credits</span>
            </h1>
            <p className="ex-lead" style={{ marginInline: "auto" }}>
              One simple subscription. Spend credits on AI tools, live classes,
              webinars and course materials — scale up whenever you need more.
            </p>
          </header>

          {/* signup bonus banner ----------------------------------------- */}
          {signupBonus > 0 && (
            <div
              className="ex-badge ex-badge-accent"
              style={{
                margin: "26px auto 0",
                display: "flex",
                width: "fit-content",
                padding: "9px 18px",
                fontSize: ".9rem",
              }}
            >
              <Sparkles size={16} />
              Every new member gets {signupBonus.toLocaleString()} free credits
            </div>
          )}

          {/* error ------------------------------------------------------- */}
          {error && (
            <div
              className="ex-badge ex-badge-warn"
              style={{ margin: "26px auto 0", display: "flex", width: "fit-content", padding: "10px 18px" }}
            >
              {error}
            </div>
          )}

          {/* loading ----------------------------------------------------- */}
          {loading && (
            <div style={{ display: "flex", justifyContent: "center", padding: "72px 0" }}>
              <span className="ex-spinner" style={{ width: 34, height: 34 }} />
            </div>
          )}

          {/* plan grid --------------------------------------------------- */}
          {!loading && !error && plans.length > 0 && (
            <div
              className="grid gap-5"
              style={{
                marginTop: 40,
                gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              }}
            >
              {plans.map((plan) => {
                const [euros, cents] = splitPrice(plan.price);
                const busy = activating === plan.id;
                return (
                  <div
                    key={plan.id}
                    className="ex-card ex-card-hover"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      borderColor: plan.popular ? "rgba(var(--pRGB), .55)" : undefined,
                      boxShadow: plan.popular ? "0 20px 52px rgba(var(--pRGB), .18)" : undefined,
                    }}
                  >
                    {plan.popular && (
                      <span
                        className="ex-badge ex-badge-accent"
                        style={{
                          position: "absolute",
                          top: -13,
                          left: "50%",
                          transform: "translateX(-50%)",
                          background: "var(--ex-grad)",
                          color: "#06121c",
                          borderColor: "transparent",
                        }}
                      >
                        <Zap size={13} /> Most popular
                      </span>
                    )}

                    <h3
                      style={{
                        fontFamily: "var(--ex-font)",
                        fontWeight: 700,
                        fontSize: "1.15rem",
                        marginTop: plan.popular ? 6 : 0,
                      }}
                    >
                      {plan.name}
                    </h3>

                    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, margin: "12px 0 4px" }}>
                      <span style={{ fontSize: "1.4rem", color: "var(--ex-muted)", lineHeight: 1.6 }}>€</span>
                      <span style={{ fontFamily: "var(--ex-font)", fontWeight: 700, fontSize: "2.6rem", lineHeight: 1 }}>
                        {euros}
                      </span>
                      <span style={{ fontSize: "1.1rem", color: "var(--ex-muted)" }}>.{cents}</span>
                      <span style={{ fontSize: ".9rem", color: "var(--ex-muted)", marginBottom: 4, marginLeft: 3 }}>
                        /mo
                      </span>
                    </div>

                    <p style={{ color: "var(--pL)", fontWeight: 600, fontSize: ".92rem", marginBottom: 18 }}>
                      {Number(plan.credits).toLocaleString()} credits / month
                    </p>

                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10, flex: 1 }}>
                      {(plan.features || []).map((feature, i) => (
                        <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: ".9rem" }}>
                          <Check size={17} style={{ color: "var(--pL)", flexShrink: 0, marginTop: 1 }} />
                          <span style={{ color: "var(--ex-text)" }}>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      onClick={() => handleChoose(plan)}
                      disabled={busy}
                      className={`ex-btn ${plan.popular ? "ex-btn-primary" : "ex-btn-ghost"}`}
                      style={{ width: "100%", marginTop: 22 }}
                    >
                      {busy ? (
                        <>
                          <span className="ex-spinner" /> Activating…
                        </>
                      ) : (
                        `Choose ${plan.name}`
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* footnotes --------------------------------------------------- */}
          {!loading && !error && plans.length > 0 && (
            <div className="text-center" style={{ marginTop: 34 }}>
              <p style={{ color: "var(--ex-muted)", fontSize: ".9rem", maxWidth: "62ch", marginInline: "auto" }}>
                Credits power AI tools, classes, webinars and materials — like
                ChatGPT/Claude usage.
              </p>
              <p style={{ color: "var(--ex-muted)", fontSize: ".82rem", marginTop: 8 }}>
                Prices in EUR. Cancel anytime.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
