import React, { useEffect, useState } from "react";
import { Gift, Copy, Check, Users, AlertTriangle } from "lucide-react";
import { getMyReferral } from "../../APIs/learning";

const formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

const ReferralPanel = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    getMyReferral()
      .then((res) => {
        if (!alive) return;
        setData(res?.data || null);
        setLoading(false);
      })
      .catch((err) => {
        if (!alive) return;
        console.error("Failed to fetch referral:", err);
        setError("Couldn't load your referral details.");
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const shareLink = data?.link ? `${window.location.origin}${data.link}` : "";

  const handleCopy = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  if (loading) {
    return (
      <div className="ex-card ex-reveal">
        <div className="flex justify-center items-center py-10 gap-3">
          <span className="ex-spinner" />
          <span className="ex-lead">Loading referrals…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ex-card ex-reveal" style={{ borderColor: "rgba(239,68,68,.35)" }}>
        <div className="flex items-center gap-2" style={{ color: "#fca5a5" }}>
          <AlertTriangle size={18} /> <p>{error}</p>
        </div>
      </div>
    );
  }

  const invited = Array.isArray(data?.invited) ? data.invited : [];
  const invitedCount = data?.invitedCount ?? invited.length;
  const converted = data?.converted ?? invited.filter((i) => i.paid).length;
  const creditsEarned = data?.creditsEarned ?? converted * (data?.creditsPer ?? 0);
  const creditsPer = data?.creditsPer ?? 0;

  const stats = [
    { value: invitedCount, label: "Invited" },
    { value: converted, label: "Paid" },
    { value: creditsEarned, label: "Credits" },
  ];

  return (
    <div className="ex-card ex-reveal">
      <div className="flex items-center gap-3 mb-5">
        <span style={{ color: "var(--pL)" }}><Gift size={22} /></span>
        <div>
          <h2 style={{ fontFamily: "var(--ex-font)", fontWeight: 700, fontSize: "1.25rem" }}>
            Invite friends, earn <span className="ex-g">rewards</span>
          </h2>
          <p className="ex-lead" style={{ fontSize: ".85rem" }}>Share your link — earn credits when friends upgrade.</p>
        </div>
      </div>

      {/* Code + share link */}
      <div style={{ border: "1px solid var(--ex-line)", borderRadius: 14, padding: 16 }}>
        <span className="ex-label" style={{ marginBottom: 6 }}>Your invite code</span>
        <p style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "1.7rem", letterSpacing: "1px", color: "var(--pL)" }}>
          {data?.code || "—"}
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-4">
          <input
            type="text"
            readOnly
            value={shareLink}
            onFocus={(e) => e.target.select()}
            className="ex-input"
            style={{ flex: 1, fontSize: ".85rem" }}
          />
          <button onClick={handleCopy} className="ex-btn ex-btn-primary" style={{ whiteSpace: "nowrap" }} disabled={!shareLink}>
            {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy link</>}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3" style={{ marginTop: 20 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ border: "1px solid var(--ex-line)", borderRadius: 12, padding: "14px 6px", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--ex-font)", fontWeight: 700, fontSize: "1.5rem", lineHeight: 1.1, color: "var(--ex-text)" }}>{s.value}</div>
            <div style={{ color: "var(--ex-muted)", fontSize: ".8rem", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <p style={{ color: "var(--ex-muted)", fontSize: ".75rem", marginTop: 8, textAlign: "center" }}>
        +{creditsPer} credits for every friend who upgrades
      </p>

      {/* Invited list */}
      <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--ex-line)" }}>
        <div className="ex-eyebrow">People you invited</div>
        {invited.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8" style={{ border: "2px dashed var(--ex-line)", borderRadius: 14 }}>
            <Users size={30} style={{ color: "var(--pL)" }} />
            <p className="ex-lead">Share your link to start inviting.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {invited.map((person) => (
              <div
                key={person._id}
                className="flex items-center justify-between gap-3"
                style={{ border: "1px solid var(--ex-line)", borderRadius: 12, padding: "12px 14px" }}
              >
                <div className="min-w-0">
                  <p style={{ fontWeight: 600 }} className="truncate">{person.name || "New member"}</p>
                  {person.joinedAt && (
                    <p className="ex-lead" style={{ fontSize: ".78rem" }}>Joined {formatDate(person.joinedAt)}</p>
                  )}
                </div>
                <span className={`ex-badge ${person.paid ? "ex-badge-ok" : "ex-badge-accent"}`}>
                  {person.paid ? "paid" : "joined"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralPanel;
