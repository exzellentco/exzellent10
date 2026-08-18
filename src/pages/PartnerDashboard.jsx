import React, { useEffect, useState } from "react";
import { Users, BadgeCheck, Wallet, Copy, Check, Ticket } from "lucide-react";
import DashboardShell from "../components/DashboardShell";
import { getMyReferral } from "../APIs/learning";

/*
 * Logged-in partner (affiliate / ambassador) dashboard.
 * Shows the member's referral performance from getMyReferral():
 *   { data: { code, link, invitedCount, converted, uses, earnings,
 *             commissionPer, invited:[{ _id, name, joinedAt, paid }] } }
 * Wrapped in DashboardShell (role="teacher" accent). Route wired in App.jsx.
 */

const fmtDate = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
};

const PartnerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getMyReferral();
        if (!alive) return;
        setData(res?.data || null);
      } catch (err) {
        if (alive) setError(err.message || "Could not load your referral data.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Full shareable URL: origin + the relative signup link from the API.
  const shareLink =
    data?.link
      ? `${typeof window !== "undefined" ? window.location.origin : ""}${data.link}`
      : "";

  const handleCopy = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Couldn't copy the link — please copy it manually.");
    }
  };

  return (
    <DashboardShell
      role="teacher"
      eyebrow="Partner"
      title={
        <>
          Your <span className="ex-g">referrals</span>
        </>
      }
      lead="Track who you've invited, how many converted, and what you've earned."
    >
      {/* loading -------------------------------------------------------- */}
      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: "72px 0" }}>
          <span className="ex-spinner" style={{ width: 34, height: 34 }} />
        </div>
      )}

      {/* error ---------------------------------------------------------- */}
      {!loading && error && (
        <div
          className="ex-badge ex-badge-warn"
          style={{ margin: "26px auto 0", display: "flex", width: "fit-content", padding: "10px 18px" }}
        >
          {error}
        </div>
      )}

      {/* content -------------------------------------------------------- */}
      {!loading && !error && data && (
        <>
          {/* stat cards */}
          <div className="ex-stats ex-reveal">
            <div className="ex-stat">
              <span className="flex items-center gap-2" style={{ color: "var(--ex-muted)" }}>
                <Users size={15} /> Invited
              </span>
              <b>{Number(data.invitedCount || 0).toLocaleString()}</b>
            </div>
            <div className="ex-stat">
              <span className="flex items-center gap-2" style={{ color: "var(--ex-muted)" }}>
                <BadgeCheck size={15} /> Converted
              </span>
              <b>{Number(data.converted || 0).toLocaleString()}</b>
            </div>
            <div className="ex-stat">
              <span className="flex items-center gap-2" style={{ color: "var(--ex-muted)" }}>
                <Wallet size={15} /> Earnings
              </span>
              <b>€{Number(data.earnings || 0).toLocaleString()}</b>
            </div>
            <div className="ex-stat">
              <span className="flex items-center gap-2" style={{ color: "var(--ex-muted)" }}>
                <Ticket size={15} /> Per signup
              </span>
              <b>€{Number(data.commissionPer || 0).toLocaleString()}</b>
            </div>
          </div>

          {/* invite code + shareable link */}
          <div className="ex-card ex-reveal" style={{ marginBottom: 26 }}>
            <h3 style={{ fontFamily: "var(--ex-font)", fontWeight: 700, fontSize: "1.1rem", marginBottom: 6 }}>
              Your referral link
            </h3>
            <p style={{ color: "var(--ex-muted)", fontSize: ".9rem", marginBottom: 16 }}>
              Share this link (or your code) — every paid signup through it earns
              you €{Number(data.commissionPer || 0).toLocaleString()}.
            </p>

            <div className="flex flex-wrap items-center gap-3" style={{ marginBottom: 14 }}>
              <span style={{ color: "var(--ex-muted)", fontSize: ".82rem", fontWeight: 700 }}>
                Invite code
              </span>
              <span
                className="ex-badge ex-badge-accent"
                style={{ fontFamily: "var(--ex-font)", letterSpacing: ".08em", fontSize: ".95rem" }}
              >
                {data.code || "—"}
              </span>
              {data.uses > 0 && (
                <span style={{ color: "var(--ex-muted)", fontSize: ".8rem" }}>
                  used {Number(data.uses).toLocaleString()} times
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                readOnly
                value={shareLink}
                onFocus={(e) => e.target.select()}
                className="ex-input"
                style={{
                  flex: "1 1 260px",
                  minWidth: 0,
                  padding: "11px 14px",
                  borderRadius: 12,
                  border: "1px solid var(--ex-line)",
                  background: "rgba(255,255,255,.02)",
                  color: "var(--ex-text)",
                  fontSize: ".9rem",
                }}
              />
              <button
                type="button"
                onClick={handleCopy}
                className={`ex-btn ${copied ? "ex-btn-ghost" : "ex-btn-primary"}`}
                disabled={!shareLink}
              >
                {copied ? (
                  <>
                    <Check size={16} /> Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} /> Copy link
                  </>
                )}
              </button>
            </div>
          </div>

          {/* invited people table */}
          <div className="ex-reveal">
            <h3 style={{ fontFamily: "var(--ex-font)", fontWeight: 700, fontSize: "1.1rem", marginBottom: 14 }}>
              People you've invited
            </h3>

            {Array.isArray(data.invited) && data.invited.length > 0 ? (
              <div className="ex-table-wrap">
                <table className="ex-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Joined</th>
                      <th style={{ textAlign: "right" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.invited.map((p) => (
                      <tr key={p._id}>
                        <td style={{ fontWeight: 600 }}>{p.name || "—"}</td>
                        <td style={{ color: "var(--ex-muted)" }}>{fmtDate(p.joinedAt)}</td>
                        <td style={{ textAlign: "right" }}>
                          <span className={`ex-badge ${p.paid ? "ex-badge-ok" : "ex-badge-accent"}`}>
                            {p.paid ? (
                              <>
                                <BadgeCheck size={13} /> Paid
                              </>
                            ) : (
                              "Joined"
                            )}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="ex-card text-center" style={{ padding: "36px 24px" }}>
                <p style={{ color: "var(--ex-muted)", fontSize: ".92rem" }}>
                  No referrals yet — share your link above to get your first
                  signup.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </DashboardShell>
  );
};

export default PartnerDashboard;
