import React, { useMemo, useState } from "react";
import { generateProgressReport } from "../../APIs/aiTools";

// Student: an AI report on their own metrics (speech history + courses).
// Teacher: pick a student → an AI report from that student's available data.
const ProgressReport = ({ role, context }) => {
  const isTeacher = role === "teacher";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState(null);
  const [studentId, setStudentId] = useState(context?.students?.[0]?._id || "");

  const selfMetrics = useMemo(() => {
    if (isTeacher) return null;
    let hist = [];
    try { hist = JSON.parse(localStorage.getItem(`spl-history-${context?.studentId || "me"}`) || "[]"); } catch { hist = []; }
    const avg = hist.length ? Math.round(hist.reduce((s, h) => s + h.score, 0) / hist.length) : null;
    const trend = hist.length >= 2 ? (hist[0].score >= hist[hist.length - 1].score ? "improving" : "needs focus") : "just starting";
    return { avgPronunciation: avg, speakingAttempts: hist.length, coursesEnrolled: context?.coursesCount || 0, recentTrend: trend };
  }, [isTeacher, context]);

  const gen = async () => {
    setLoading(true); setError(""); setReport(null);
    try {
      let name, metrics, audience;
      if (isTeacher) {
        const st = (context?.students || []).find((s) => s._id === studentId);
        name = st?.name || "the student";
        metrics = { coursesEnrolled: st?.courseCount || 0, lastActive: st?.recentDate || "unknown", totalPaid: st?.totalPaid };
        audience = "teacher";
      } else {
        name = context?.name || "You";
        metrics = selfMetrics;
        audience = "student";
      }
      setReport(await generateProgressReport({ name, metrics, audience }));
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <>
      {isTeacher ? (
        <>
          <div className="spl-label">Report for a student</div>
          <select className="spl-select" style={{ marginBottom: 10 }} value={studentId} onChange={(e) => setStudentId(e.target.value)}>
            {(context?.students || []).length === 0 && <option value="">No students yet</option>}
            {(context?.students || []).map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </>
      ) : (
        <div className="spl-card" style={{ marginBottom: 12 }}>
          <div className="spl-label" style={{ marginBottom: 6 }}>Your metrics</div>
          <div className="spl-chips">
            <span className="spl-chip"><b>{selfMetrics?.avgPronunciation ?? "—"}</b> avg speech</span>
            <span className="spl-chip"><b>{selfMetrics?.speakingAttempts || 0}</b> attempts</span>
            <span className="spl-chip"><b>{selfMetrics?.coursesEnrolled || 0}</b> courses</span>
          </div>
        </div>
      )}

      <button className="spl-rec" onClick={gen} disabled={loading || (isTeacher && !studentId)}>
        {loading ? <><span className="spl-spin" />Writing report…</> : "✦ Generate progress report"}
      </button>
      {error && <p className="spl-err">{error}</p>}

      {report && (
        <div style={{ marginTop: 18 }}>
          <div className="spl-report-h">{report.headline}</div>
          <span className="spl-pill">CEFR estimate: {report.cefr_estimate}</span>
          <p className="spl-sub" style={{ margin: "12px 0" }}>{report.narrative}</p>
          <div className="spl-label">Strengths</div>
          <ul style={{ margin: "4px 0 12px", paddingLeft: 18 }}>
            {(report.strengths || []).map((s, i) => <li key={i} style={{ color: "var(--spl-green)", fontSize: 13, margin: "3px 0" }}>{s}</li>)}
          </ul>
          <div className="spl-label">Focus next</div>
          <ul style={{ margin: "4px 0", paddingLeft: 18 }}>
            {(report.focus || []).map((s, i) => <li key={i} style={{ color: "var(--spl-amber)", fontSize: 13, margin: "3px 0" }}>{s}</li>)}
          </ul>
        </div>
      )}
    </>
  );
};

export default ProgressReport;
