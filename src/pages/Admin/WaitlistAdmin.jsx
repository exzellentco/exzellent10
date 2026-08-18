import React, { useEffect, useState } from "react";
import { Mail, Check, Copy, Inbox, AlertTriangle } from "lucide-react";
import DashboardShell from "../../components/DashboardShell";
import { getWaitlist, inviteFromWaitlist } from "../../APIs/learning";

const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

const CodeChip = ({ code, invited }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="ex-badge ex-badge-accent"
      title="Copy invite code"
      style={{ fontFamily: "monospace", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
    >
      <span>{code}</span>
      {copied ? <Check size={13} /> : invited ? <Check size={13} /> : <Copy size={13} />}
      {copied ? " copied" : invited ? " invited" : ""}
    </button>
  );
};

const WaitlistAdmin = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [invitingId, setInvitingId] = useState(null);

  useEffect(() => {
    let alive = true;
    getWaitlist()
      .then((res) => {
        if (!alive) return;
        setRequests(Array.isArray(res?.data) ? res.data : []);
        setLoading(false);
      })
      .catch((err) => {
        if (!alive) return;
        console.error("Failed to fetch waitlist:", err);
        setError("Failed to load invite requests.");
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const handleInvite = async (entry) => {
    setInvitingId(entry._id);
    try {
      const res = await inviteFromWaitlist(entry._id);
      if (res?.success === false) {
        throw new Error(res?.message || "Invite failed");
      }
      const code = res?.code || entry.inviteCode;
      setRequests((prev) =>
        prev.map((r) => (r._id === entry._id ? { ...r, invited: true, inviteCode: code } : r))
      );
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Failed to send invite. Please try again.";
      alert(message);
      console.error("Invite error:", err);
    } finally {
      setInvitingId(null);
    }
  };

  const totalCount = requests.length;
  const invitedCount = requests.filter((r) => r.invited).length;
  const pendingCount = totalCount - invitedCount;

  const stats = [
    { value: totalCount, label: "Total requests" },
    { value: pendingCount, label: "Awaiting invite" },
    { value: invitedCount, label: "Invited" },
  ];

  const renderStatus = (entry) =>
    entry.invited ? (
      entry.inviteCode ? (
        <CodeChip code={entry.inviteCode} invited />
      ) : (
        <span className="ex-badge ex-badge-ok">Invited</span>
      )
    ) : (
      <button
        onClick={() => handleInvite(entry)}
        disabled={invitingId === entry._id}
        className="ex-btn ex-btn-primary"
        style={{ padding: "8px 14px", fontSize: ".8rem" }}
      >
        {invitingId === entry._id ? (
          <>
            <span className="ex-spinner" /> Inviting…
          </>
        ) : (
          <>
            <Mail size={14} /> Invite
          </>
        )}
      </button>
    );

  return (
    <DashboardShell
      role="admin"
      eyebrow="Admin · Waitlist"
      title={<>Invite <span className="ex-g">requests</span></>}
      lead="People waiting for an invite to Exzellent. Send them a code to unlock signup."
    >
      {/* Stats */}
      {!loading && !error && requests.length > 0 && (
        <div className="ex-stats ex-reveal">
          {stats.map((s) => (
            <div key={s.label} className="ex-stat">
              <b>{s.value}</b>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20 gap-4">
          <span className="ex-spinner" />
          <span className="ex-lead">Loading invite requests…</span>
        </div>
      ) : error ? (
        <div className="ex-card" style={{ textAlign: "center", borderColor: "rgba(239,68,68,.35)" }}>
          <div className="flex items-center justify-center gap-2" style={{ color: "#fca5a5" }}>
            <AlertTriangle size={20} /> <p>{error}</p>
          </div>
        </div>
      ) : requests.length === 0 ? (
        <div className="ex-card" style={{ textAlign: "center" }}>
          <Inbox size={28} style={{ margin: "0 auto 10px", opacity: 0.5 }} />
          <p className="ex-lead" style={{ margin: "0 auto" }}>No invite requests yet.</p>
        </div>
      ) : (
        <>
          {/* Card view (small screens) */}
          <div className="block lg:hidden space-y-4">
            {requests.map((entry) => (
              <div key={entry._id} className="ex-card ex-card-hover ex-reveal">
                <div className="flex justify-between items-start gap-3 mb-4">
                  <div>
                    <h3 style={{ fontFamily: "var(--ex-font)", fontWeight: 700, fontSize: "1.05rem" }}>{entry.name || "-"}</h3>
                    <p className="ex-lead" style={{ fontSize: ".85rem", wordBreak: "break-all" }}>{entry.email || "-"}</p>
                  </div>
                  <span className={`ex-badge ${entry.invited ? "ex-badge-ok" : "ex-badge-warn"}`}>
                    {entry.invited ? "Invited" : "Pending"}
                  </span>
                </div>

                {entry.note && (
                  <div className="mb-3">
                    <span className="ex-label" style={{ marginBottom: 2 }}>Note</span>
                    <p style={{ color: "var(--ex-text)", fontSize: ".85rem" }}>{entry.note}</p>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 mt-3">
                  <span className="ex-lead" style={{ fontSize: ".8rem" }}>Joined {formatDate(entry.createdAt)}</span>
                  {renderStatus(entry)}
                </div>
              </div>
            ))}
          </div>

          {/* Table view (large screens) */}
          <div className="hidden lg:block ex-table-wrap ex-reveal">
            <div className="overflow-x-auto">
              <table className="ex-table">
                <thead>
                  <tr>
                    {["Name", "Email", "Note", "Joined", "Status"].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {requests.map((entry) => (
                    <tr key={entry._id}>
                      <td style={{ fontWeight: 600 }}>{entry.name || "-"}</td>
                      <td className="max-w-[220px] truncate" title={entry.email}>{entry.email || "-"}</td>
                      <td className="max-w-[280px] truncate" title={entry.note}>{entry.note || "-"}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{formatDate(entry.createdAt)}</td>
                      <td>{renderStatus(entry)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </DashboardShell>
  );
};

export default WaitlistAdmin;
