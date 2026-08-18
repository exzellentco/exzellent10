import { useState, useEffect, useCallback } from "react";
import {
  createAssignment,
  getAssignments,
  giveFeedback,
} from "../../APIs/learning";

// "Mar 3, 14:30" — short, forgiving of bad dates.
const shortWhen = (date) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export default function TeacherAssignments({ onClose, students = [], me }) {
  const teacherId = me?._id;

  // ---- create form state ----
  const [studentId, setStudentId] = useState(""); // "" = all students
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [targetText, setTargetText] = useState("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  // ---- list state ----
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ---- per-submission feedback drafts ----
  const [drafts, setDrafts] = useState({}); // { [submissionId]: text }
  const [sendingId, setSendingId] = useState(null);

  const stop = (e) => e.stopPropagation();

  const nameOf = (id) => {
    const s = students.find((x) => x._id === id);
    return s ? s.name : "All students";
  };

  const load = useCallback(async () => {
    if (!teacherId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await getAssignments({ teacherId });
      setAssignments(Array.isArray(res?.data) ? res.data : []);
      setError("");
    } catch {
      setError("Couldn't load assignments. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    load();
  }, [load]);

  const onAssign = useCallback(async () => {
    const t = title.trim();
    if (!t) {
      setFormError("Please enter a title.");
      return;
    }
    if (creating) return;
    setCreating(true);
    try {
      await createAssignment({
        studentId: studentId || "",
        title: t,
        prompt: prompt.trim(),
        targetText: targetText.trim(),
      });
      setTitle("");
      setPrompt("");
      setTargetText("");
      setStudentId("");
      setFormError("");
      await load();
    } catch {
      setFormError("Couldn't create the assignment. Please try again.");
    } finally {
      setCreating(false);
    }
  }, [title, prompt, targetText, studentId, creating, load]);

  const onSendFeedback = useCallback(
    async (submissionId) => {
      const text = (drafts[submissionId] || "").trim();
      if (!text || sendingId) return;
      setSendingId(submissionId);
      try {
        await giveFeedback(submissionId, text);
        setDrafts((d) => ({ ...d, [submissionId]: "" }));
        setError("");
        await load();
      } catch {
        setError("Couldn't send feedback. Please try again.");
      } finally {
        setSendingId(null);
      }
    },
    [drafts, sendingId, load]
  );

  return (
    <div className="spl-root">
      <div className="spl-overlay" onClick={onClose}>
        <div className="spl-panel" onClick={stop}>
          <div className="spl-aura" />

          <div className="spl-head">
            <span className="spl-mic">🎙️</span>
            <div>
              <h3>Speaking assignments</h3>
              <p>Create tasks and give feedback</p>
            </div>
            <button className="spl-close" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>

          <div className="spl-body">
            {/* ---- create form ---- */}
            <div className="spl-label">New assignment</div>
            <div className="spl-card" style={{ marginBottom: 22 }}>
              <select
                className="spl-select"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                style={{ marginBottom: 10 }}
              >
                <option value="">All students</option>
                {students.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <input
                className="spl-input"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ marginBottom: 10 }}
              />

              <textarea
                className="spl-textarea"
                placeholder="Prompt / instructions"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                style={{ marginBottom: 10 }}
              />

              <textarea
                className="spl-textarea"
                placeholder="Target text (what to read aloud)"
                value={targetText}
                onChange={(e) => setTargetText(e.target.value)}
                style={{ marginBottom: 12 }}
              />

              <button
                className="spl-btn primary"
                onClick={onAssign}
                disabled={creating || !title.trim()}
              >
                {creating ? "Assigning…" : "Assign"}
              </button>

              {formError && <div className="spl-err">{formError}</div>}
            </div>

            {/* ---- list ---- */}
            <div className="spl-label">Assignments</div>

            {loading ? (
              <div className="spl-empty">Loading assignments…</div>
            ) : error ? (
              <div className="spl-empty">{error}</div>
            ) : assignments.length === 0 ? (
              <div className="spl-empty">No assignments yet.</div>
            ) : (
              assignments.map((a) => (
                <div
                  key={a._id}
                  className="spl-card"
                  style={{ marginBottom: 14 }}
                >
                  <div className="spl-target">{a.title}</div>
                  <div className="spl-sub" style={{ marginTop: 4 }}>
                    For: {nameOf(a.studentId)}
                    {a.createdAt ? ` · ${shortWhen(a.createdAt)}` : ""}
                  </div>

                  {a.targetText && (
                    <div className="spl-sub" style={{ marginTop: 8 }}>
                      <b style={{ color: "var(--spl-ink)" }}>Target:</b>{" "}
                      {a.targetText}
                    </div>
                  )}

                  <div
                    className="spl-label"
                    style={{ marginTop: 14, marginBottom: 8 }}
                  >
                    Submissions
                  </div>

                  {!Array.isArray(a.submissions) ||
                  a.submissions.length === 0 ? (
                    <div className="spl-sub">No submissions yet</div>
                  ) : (
                    a.submissions.map((sub) => (
                      <div
                        key={sub._id}
                        style={{
                          borderTop: "1px solid var(--spl-line2)",
                          paddingTop: 12,
                          marginTop: 12,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 10,
                          }}
                        >
                          <b style={{ fontSize: 14 }}>{sub.studentName}</b>
                          {sub.score != null && (
                            <span className="spl-hscore">
                              {sub.score}/100
                            </span>
                          )}
                        </div>

                        {sub.submittedAt && (
                          <div className="spl-sub" style={{ fontSize: 11 }}>
                            {shortWhen(sub.submittedAt)}
                          </div>
                        )}

                        {sub.transcript && (
                          <div
                            className="spl-sub"
                            style={{ marginTop: 6, fontStyle: "italic" }}
                          >
                            “{sub.transcript}”
                          </div>
                        )}

                        {sub.feedback && (
                          <div
                            className="spl-note"
                            style={{ marginTop: 8 }}
                          >
                            <b>Your feedback:</b> {sub.feedback}
                          </div>
                        )}

                        <textarea
                          className="spl-textarea"
                          placeholder={
                            sub.feedback
                              ? "Update feedback…"
                              : "Write feedback…"
                          }
                          value={drafts[sub._id] || ""}
                          onChange={(e) =>
                            setDrafts((d) => ({
                              ...d,
                              [sub._id]: e.target.value,
                            }))
                          }
                          style={{ marginTop: 10, minHeight: 56 }}
                        />
                        <button
                          className="spl-btn primary"
                          onClick={() => onSendFeedback(sub._id)}
                          disabled={
                            sendingId === sub._id ||
                            !(drafts[sub._id] || "").trim()
                          }
                          style={{ marginTop: 8 }}
                        >
                          {sendingId === sub._id
                            ? "Sending…"
                            : "Send feedback"}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
