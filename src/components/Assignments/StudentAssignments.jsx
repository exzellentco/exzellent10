import React, { useCallback, useEffect, useState } from "react";
import { getAssignments, submitAssignment } from "../../APIs/learning";
import StudentSpeechLab from "../SpeechAnalyzer/StudentSpeechLab";

// Student view of speaking assignments set by their teacher. Lists each
// assignment with its submission status; "Practice & submit" opens the speech
// lab pre-loaded with the assignment's target text, and the resulting score +
// transcript are submitted straight back to the teacher.
export default function StudentAssignments({ onClose, me }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState(null); // assignment._id whose lab is open

  const reloadList = useCallback(async () => {
    if (!me?._id) { setLoading(false); return; }
    try {
      const res = await getAssignments({ studentId: me._id });
      setItems(Array.isArray(res?.data) ? res.data : []);
      setError("");
    } catch (e) {
      setError(e.message || "Couldn't load your assignments. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [me]);

  useEffect(() => { reloadList(); }, [reloadList]);

  // The student's own submission for an assignment, if any.
  const mySubmission = (a) =>
    (a.submissions || []).find((s) => s.studentId === me?._id);

  const openLab = items.find((a) => a._id === openId) || null;

  const stop = (e) => e.stopPropagation();

  return (
    <div className="spl-root">
      <div className="spl-overlay" onClick={onClose}>
        <div className="spl-panel" onClick={stop}>
          <div className="spl-aura" />

          <div className="spl-head">
            <span className="spl-mic">📝</span>
            <div>
              <h3>My speaking assignments</h3>
              <p>Practise aloud, then send your best take to your teacher.</p>
            </div>
            <button className="spl-close" onClick={onClose} aria-label="Close">×</button>
          </div>

          <div className="spl-body">
            {loading ? (
              <div className="spl-empty">Loading your assignments…</div>
            ) : error ? (
              <div className="spl-empty">{error}</div>
            ) : items.length === 0 ? (
              <div className="spl-empty">No assignments yet.</div>
            ) : (
              items.map((a) => {
                const sub = mySubmission(a);
                return (
                  <div className="spl-card" key={a._id} style={{ marginBottom: 12 }}>
                    <div className="spl-label" style={{ marginBottom: 4 }}>{a.title}</div>
                    {a.teacherName && (
                      <p className="spl-note" style={{ marginTop: 0 }}>From {a.teacherName}</p>
                    )}
                    {a.prompt && <p className="spl-target" style={{ fontSize: 15 }}>{a.prompt}</p>}
                    {a.targetText && (
                      <p className="spl-sub" style={{ marginTop: 8 }}>“{a.targetText}”</p>
                    )}

                    {sub ? (
                      <div style={{ marginTop: 12 }}>
                        <b style={{ color: "var(--spl-green)" }}>
                          Submitted · score {Math.round(sub.score)}
                        </b>
                        {sub.feedback && (
                          <p className="spl-note" style={{ marginTop: 6 }}>
                            <b>Teacher feedback:</b> {sub.feedback}
                          </p>
                        )}
                      </div>
                    ) : (
                      <button
                        className="spl-btn primary"
                        style={{ marginTop: 12 }}
                        onClick={() => setOpenId(a._id)}
                      >
                        Practice &amp; submit
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {openLab && (
        <StudentSpeechLab
          student={me}
          assignment={openLab}
          onClose={() => setOpenId(null)}
          onSubmitScore={async (score, transcript) => {
            await submitAssignment(openLab._id, { score, transcript });
            await reloadList();
            setOpenId(null);
          }}
        />
      )}
    </div>
  );
}
