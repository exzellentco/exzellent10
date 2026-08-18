import { useState, useEffect, useCallback } from "react";
import { getDueCards, gradeCard } from "../../APIs/learning";

/*
 * Spaced-repetition flashcard review. Pulls the student's due cards (from their
 * enrolled courses' study kits), shows one at a time (tap to flip), and grades
 * each — Again / Hard / Good / Easy — which reschedules it on the backend.
 * Styled with the shared .spl-* popup classes (speech.css), like MessagesPanel.
 *
 *   <ReviewPanel onClose={...} onStreak={(n) => ...} />
 */
const GRADES = [
  { g: 0, label: "Again", cls: "again" },
  { g: 1, label: "Hard", cls: "hard" },
  { g: 2, label: "Good", cls: "good" },
  { g: 3, label: "Easy", cls: "easy" },
];

const ReviewPanel = ({ onClose, onStreak }) => {
  const [cards, setCards] = useState([]);
  const [idx, setIdx] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewed, setReviewed] = useState(0);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDueCards();
      setCards(Array.isArray(res.data) ? res.data : []);
      setStreak(res.streak?.count || 0);
      setIdx(0); setShowBack(false); setReviewed(0);
      setError("");
    } catch (e) {
      setError(e.message || "Couldn't load your review.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const current = cards[idx];
  const done = !loading && (!cards.length || idx >= cards.length);

  const grade = async (g) => {
    if (!current || busy) return;
    setBusy(true);
    try {
      const res = await gradeCard(current.cardId, g);
      if (res.streak?.count != null) { setStreak(res.streak.count); onStreak?.(res.streak.count); }
      setReviewed((n) => n + 1);
      setShowBack(false);
      setIdx((i) => i + 1);
    } catch (e) {
      setError(e.message || "Couldn't save that.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="spl-root">
      <div className="spl-overlay" onClick={onClose}>
        <div className="spl-panel" onClick={(e) => e.stopPropagation()}>
          <div className="spl-aura" />
          <div className="spl-head">
            <span className="spl-mic">🔁</span>
            <div>
              <h3>Daily review</h3>
              <p>{loading ? "Loading…" : done ? "All caught up" : `${cards.length - idx} card${cards.length - idx === 1 ? "" : "s"} to go`}</p>
            </div>
            <button className="spl-close" onClick={onClose} aria-label="Close">×</button>
          </div>

          <div className="spl-body">
            <div className="rvw-streak">🔥 {streak}-day streak</div>
            {error && <p className="spl-err">{error}</p>}

            {loading && <p className="spl-sub">Loading your cards…</p>}

            {!loading && done && (
              <div className="rvw-done">
                <div style={{ fontSize: 40 }}>{reviewed > 0 ? "🎉" : "✅"}</div>
                <div className="spl-report-h" style={{ marginTop: 8 }}>
                  {reviewed > 0 ? `Reviewed ${reviewed} card${reviewed === 1 ? "" : "s"}!` : "Nothing due right now"}
                </div>
                <p className="spl-sub" style={{ marginTop: 6 }}>
                  {cards.length ? "Come back tomorrow to keep your streak going." : "Enroll in a course with a study kit to start reviewing flashcards."}
                </p>
                <button className="spl-btn primary" style={{ marginTop: 14 }} onClick={onClose}>Done</button>
              </div>
            )}

            {!loading && !done && current && (
              <>
                <div className="spl-label" style={{ marginTop: 4 }}>{current.courseTitle}</div>
                <div className="spl-fc rvw-card" onClick={() => setShowBack((s) => !s)}>
                  <small>{showBack ? "Answer" : "Prompt — tap to flip"}</small>
                  {showBack ? <span>{current.back}</span> : <b>{current.front}</b>}
                </div>

                {!showBack ? (
                  <button className="spl-btn primary" style={{ width: "100%", marginTop: 12 }} onClick={() => setShowBack(true)}>
                    Show answer
                  </button>
                ) : (
                  <div className="rvw-grades">
                    {GRADES.map((gr) => (
                      <button key={gr.g} className={`rvw-grade ${gr.cls}`} disabled={busy} onClick={() => grade(gr.g)}>
                        {gr.label}
                      </button>
                    ))}
                  </div>
                )}
                <p className="spl-sub" style={{ textAlign: "center", marginTop: 10, fontSize: 12 }}>
                  {idx + 1} / {cards.length}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewPanel;
