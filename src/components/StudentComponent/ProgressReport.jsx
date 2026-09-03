import React, { useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import axios from "../../utils/axios";
import { useNavigate } from "react-router-dom";
import { LOCK_NOTE, PLAN_ROUTE } from "../../config/plan";

/**
 * An AI-written progress report for the learner.
 *
 * Generated on demand rather than on mount: it costs a model call, and a
 * dashboard that spends one every time the page loads is a dashboard that
 * spends one every time somebody refreshes.
 *
 * The metrics come from what the account already has. Nothing is invented — if
 * a figure is missing it is left out of the prompt rather than filled with a
 * plausible number, because the report is meant to be about this learner.
 */
const ProgressReport = ({ studentId, courseId, studentName = "Student", proficiencyLevel = "B1", locked = false }) => {
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    setLoading(true); setError("");
    try {
      const { data } = await axios.post("/api/ai/progress-report", {
        name: studentName,
        audience: "student",
        metrics: {
          level: proficiencyLevel,
          studentId: studentId || undefined,
          courseId: courseId || undefined,
        },
      });
      if (data?.success === false) throw new Error(data.message);
      setReport(data);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Could not write your report just now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl p-6 mt-4" style={{ border: "1px solid var(--sd-border, rgba(255,255,255,.1))" }}>
      <div className="flex items-center gap-3 mb-2">
        <Sparkles size={18} style={{ color: "var(--sd-accent, #8C51F0)" }} />
        <h3 className="text-lg font-semibold m-0" style={{ color: "var(--sd-ink, #fff)" }}>
          Your progress, in words
        </h3>
      </div>

      {!report && !loading && (
        <p className="text-sm mb-4" style={{ color: "var(--sd-ink-muted, #a79cc7)" }}>
          A short read on where you are and what to work on next.
        </p>
      )}

      {error && <p className="text-sm mb-3" style={{ color: "#f0a09b" }}>{error}</p>}

      {report && (
        <div className="text-left">
          <p className="text-base font-medium mb-2" style={{ color: "var(--sd-ink, #fff)" }}>
            {report.headline}
          </p>
          <p className="text-sm mb-4" style={{ color: "var(--sd-ink, #F3EEFB)" }}>{report.narrative}</p>

          <div className="grid gap-4 sm:grid-cols-2">
            {!!(report.strengths || []).length && (
              <div>
                <h4 className="text-xs uppercase tracking-widest opacity-50 mb-2">Going well</h4>
                <ul className="list-disc pl-4 text-sm opacity-80 space-y-1">
                  {report.strengths.map((x, i) => <li key={i}>{x}</li>)}
                </ul>
              </div>
            )}
            {!!(report.focus || []).length && (
              <div>
                <h4 className="text-xs uppercase tracking-widest opacity-50 mb-2">Worth your time</h4>
                <ul className="list-disc pl-4 text-sm opacity-80 space-y-1">
                  {report.focus.map((x, i) => <li key={i}>{x}</li>)}
                </ul>
              </div>
            )}
          </div>

          {report.cefr_estimate && (
            <p className="text-xs opacity-60 mt-4">
              Estimated level: <b>{report.cefr_estimate}</b> — an estimate, not a placement test.
            </p>
          )}
        </div>
      )}

      {locked && (
        <p className="text-sm mb-3" style={{ color: "var(--sd-ink-muted, #a79cc7)" }}>
          {LOCK_NOTE}.
        </p>
      )}

      <button
        type="button"
        onClick={locked ? () => navigate(PLAN_ROUTE) : generate}
        disabled={loading}
        className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm disabled:opacity-50"
        style={{ border: "1px solid var(--sd-border, rgba(255,255,255,.15))", color: "var(--sd-ink, #fff)" }}
      >
        {loading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
        {locked ? "See the plans" : loading ? "Writing…" : report ? "Write it again" : "Write my report"}
      </button>
    </div>
  );
};

export default ProgressReport;
