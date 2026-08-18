import React, { useState } from "react";
import { submitQuiz } from "../../APIs/learning";

/*
 * Renders an AI-generated study kit — summary, key terms, flip flashcards and
 * an interactive quiz. Self-scoped under `.spl-root` so it looks the same in a
 * popup, the teacher course view, or a student's course page.
 *
 *   <StudyKitView kit={course.studyKit} />
 *
 * Accepts { summary, keyTerms | key_terms, flashcards:[{front,back}],
 *           quiz:[{question, options[], answer, explanation}] }.
 */
const StudyKitView = ({ kit, title, enrollmentId, onQuizScored }) => {
  const [flipped, setFlipped] = useState({});
  const [picks, setPicks] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [submitError, setSubmitError] = useState("");
  if (!kit) return null;

  const terms = kit.keyTerms || kit.key_terms || [];
  const flashcards = kit.flashcards || [];
  const quiz = kit.quiz || [];
  const hasAny = kit.summary || terms.length || flashcards.length || quiz.length;
  if (!hasAny) return null;

  const answeredCount = quiz.filter((_, qi) => picks[qi] != null).length;
  const allAnswered = quiz.length > 0 && answeredCount === quiz.length;
  const correctCount = quiz.filter((q, qi) => picks[qi] === q.answer).length;
  const scorePct = quiz.length ? Math.round((correctCount / quiz.length) * 100) : 0;
  const showSubmit = enrollmentId != null && quiz.length > 0;

  const handleSubmitScore = async () => {
    if (submitting || submitted) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await submitQuiz(enrollmentId, correctCount, quiz.length);
      setQuizResult(res);
      setSubmitted(true);
      if (onQuizScored) onQuizScored(res);
    } catch (err) {
      setSubmitError(err.message || "Could not submit score.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="spl-root">
      <div className="spl-kit">
        {title && <div className="spl-report-h" style={{ marginBottom: 6 }}>{title}</div>}
        {kit.summary && <p className="spl-sub" style={{ marginBottom: 8 }}>{kit.summary}</p>}

        {terms.length > 0 && (
          <div className="spl-chips" style={{ marginBottom: 10 }}>
            {terms.map((t, i) => <span className="spl-chip" key={i}>{typeof t === "string" ? t : t.term || t.title}</span>)}
          </div>
        )}

        {flashcards.length > 0 && (
          <>
            <div className="spl-label" style={{ marginTop: 12 }}>🃏 Flashcards (tap to flip)</div>
            {flashcards.map((f, i) => (
              <div className="spl-fc" key={i} onClick={() => setFlipped((s) => ({ ...s, [i]: !s[i] }))}>
                <small>{flipped[i] ? "Back" : "Front"}</small>
                {flipped[i] ? <span>{f.back}</span> : <b>{f.front}</b>}
              </div>
            ))}
          </>
        )}

        {quiz.length > 0 && (
          <>
            <div className="spl-label" style={{ marginTop: 16 }}>❓ Quiz</div>
            {quiz.map((q, qi) => {
              const chosen = picks[qi];
              const reveal = chosen != null;
              return (
                <div className="spl-q" key={qi}>
                  <b>{qi + 1}. {q.question}</b>
                  {(q.options || []).map((opt, oi) => {
                    let cls = "spl-opt";
                    if (reveal && oi === q.answer) cls += " correct";
                    else if (reveal && chosen === oi && oi !== q.answer) cls += " wrong";
                    return (
                      <button key={oi} className={cls} disabled={chosen != null}
                        onClick={() => chosen == null && setPicks((p) => ({ ...p, [qi]: oi }))}>
                        {String.fromCharCode(65 + oi)}. {opt}
                      </button>
                    );
                  })}
                  {reveal && q.explanation && <div className="spl-explain">💡 {q.explanation}</div>}
                </div>
              );
            })}

            {showSubmit && allAnswered && (
              <div className="spl-q" style={{ marginTop: 12 }}>
                <div className="spl-label" style={{ marginTop: 0 }}>
                  Your score: {correctCount} / {quiz.length} ({scorePct}%)
                </div>
                {!submitted ? (
                  <button
                    className="spl-btn"
                    style={{ marginTop: 8 }}
                    disabled={submitting}
                    onClick={handleSubmitScore}
                  >
                    {submitting ? "Submitting…" : "Submit score"}
                  </button>
                ) : (
                  quizResult && (
                    <div className="spl-explain" style={{ marginTop: 8 }}>
                      Best: {quizResult.quiz?.bestPct ?? scorePct}%
                      {quizResult.passed ? " ✓ passed" : ""}
                    </div>
                  )
                )}
                {submitError && (
                  <div className="spl-explain" style={{ marginTop: 8 }}>⚠️ {submitError}</div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StudyKitView;
