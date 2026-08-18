import React, { useEffect, useMemo, useState } from "react";
import { useRecorder } from "./useRecorder";
import ScoreResult from "./ScoreResult";
import { analyzeSpeech } from "../../APIs/speechAnalyzer";
import { PRACTICE_SETS, langCode } from "../../data/practiceSentences";

// Student speech lab — warm, low-pressure practice. Tabs: Practise + My progress.
const StudentSpeechLab = ({ onClose, student, assignment, onSubmitScore }) => {
  const [tab, setTab] = useState("practise");
  const [submitting, setSubmitting] = useState(false);

  // teacher-set assignments (saved by the teacher popup) appear alongside the built-ins
  const assignments = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("spl-assignments") || "[]"); } catch { return []; }
  }, []);
  const sets = useMemo(() => {
    const custom = assignments.length
      ? [{ id: "assigned", language: "English", level: "From your teacher", sentences: assignments.map((a) => a.text) }]
      : [];
    return [...custom, ...PRACTICE_SETS];
  }, [assignments]);

  const [setId, setSetId] = useState(sets[0].id);
  const currentSet = sets.find((s) => s.id === setId) || sets[0];
  // When an assignment is provided, compare against its target text by default.
  const [sentence, setSentence] = useState(assignment?.targetText || currentSet.sentences[0]);

  const { recording, seconds, error: recError, start, stop } = useRecorder();
  const [phase, setPhase] = useState("idle"); // idle | analyzing | done
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");

  const HKEY = `spl-history-${student?.id || student?._id || "me"}`;
  const [history, setHistory] = useState([]);
  useEffect(() => {
    try { setHistory(JSON.parse(localStorage.getItem(HKEY) || "[]")); } catch { setHistory([]); }
  }, [HKEY]);

  const chooseSet = (id) => {
    const s = sets.find((x) => x.id === id) || sets[0];
    setSetId(id);
    setSentence(s.sentences[0]);
    setResult(null);
    setPhase("idle");
  };

  const saveAttempt = (r) => {
    const entry = {
      score: r.pronunciation_score, sentence: r.reference,
      matched: r.summary.matched, total: r.summary.reference_words,
      date: new Date().toISOString(),
    };
    const next = [entry, ...history].slice(0, 50);
    setHistory(next);
    try { localStorage.setItem(HKEY, JSON.stringify(next)); } catch { /* ignore quota */ }
  };

  const onRecord = async () => {
    if (!recording) { setResult(null); setErr(""); await start(); return; }
    const blob = await stop();
    if (!blob) return;
    setPhase("analyzing");
    try {
      const r = await analyzeSpeech(blob, sentence, langCode(currentSet.language));
      setResult(r);
      setPhase("done");
      saveAttempt(r);
    } catch (e) {
      setErr(e.message);
      setPhase("idle");
    }
  };

  const avg = history.length ? Math.round(history.reduce((s, h) => s + h.score, 0) / history.length) : null;

  return (
    <div className="spl-root">
      <div className="spl-overlay" onClick={onClose}>
        <div className="spl-panel" onClick={(e) => e.stopPropagation()}>
          <div className="spl-aura" />
          <div className="spl-head">
            <span className="spl-mic">🎤</span>
            <div>
              <h3>Speaking practice</h3>
              <p>Read out loud — nothing here is a test.</p>
            </div>
            <button className="spl-close" onClick={onClose} aria-label="Close">×</button>
          </div>

          <div className="spl-tabs">
            <button className={`spl-tab ${tab === "practise" ? "on" : ""}`} onClick={() => setTab("practise")}>Practise</button>
            <button className={`spl-tab ${tab === "progress" ? "on" : ""}`} onClick={() => setTab("progress")}>My progress</button>
          </div>

          <div className="spl-body">
            {tab === "practise" && (
              <>
                <div className="spl-label">Choose a set</div>
                <div className="spl-row" style={{ marginBottom: 12 }}>
                  <select className="spl-select" value={setId} onChange={(e) => chooseSet(e.target.value)}>
                    {sets.map((s) => (
                      <option key={s.id} value={s.id}>{s.language} · {s.level}</option>
                    ))}
                  </select>
                  <select className="spl-select" value={sentence} onChange={(e) => { setSentence(e.target.value); setResult(null); setPhase("idle"); }}>
                    {currentSet.sentences.map((s, i) => <option key={i} value={s}>Sentence {i + 1}</option>)}
                  </select>
                </div>

                <div className="spl-label">Say this out loud</div>
                <div className="spl-card"><p className="spl-target">“{sentence}”</p></div>

                <button
                  className={`spl-rec ${recording ? "live" : ""}`}
                  style={{ marginTop: 16 }}
                  onClick={onRecord}
                  disabled={phase === "analyzing"}
                >
                  {phase === "analyzing"
                    ? "Analyzing…"
                    : recording
                    ? `⏹ Stop (${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")})`
                    : "● Record your voice"}
                </button>
                {(err || recError) && <p className="spl-err">{err || recError}</p>}

                {phase === "done" && result && (
                  <div style={{ marginTop: 20 }}>
                    <ScoreResult result={result} />
                    {assignment && onSubmitScore && (
                      <button
                        className="spl-btn primary"
                        style={{ width: "100%", marginTop: 16 }}
                        disabled={submitting}
                        onClick={async () => {
                          if (submitting) return;
                          setSubmitting(true);
                          try {
                            await onSubmitScore(result.pronunciation_score, result.transcript);
                          } catch (e) {
                            setErr(e.message || "Couldn't submit. Please try again.");
                            setSubmitting(false);
                          }
                        }}
                      >
                        {submitting ? "Submitting…" : "Submit to teacher"}
                      </button>
                    )}
                    <button className="spl-btn primary" style={{ width: "100%", marginTop: 16 }} onClick={() => { setResult(null); setPhase("idle"); }}>
                      Try again
                    </button>
                  </div>
                )}

                <p className="spl-note">
                  Your score compares what Whisper heard to the target sentence, word by word. It reflects clarity and
                  accuracy — not a final grade.
                </p>
              </>
            )}

            {tab === "progress" && (
              <>
                {avg != null && (
                  <div className="spl-scorewrap" style={{ marginBottom: 8 }}>
                    <div className="spl-ring" style={{ "--v": avg, "--spl-ringc": "var(--spl-violetL)" }}>
                      <b>{avg}</b><span>avg</span>
                    </div>
                    <div className="spl-scoremeta">
                      <b>{history.length} attempt{history.length === 1 ? "" : "s"}</b>
                      <span>Keep it up — practice makes progress.</span>
                    </div>
                  </div>
                )}
                {history.length === 0 ? (
                  <p className="spl-empty">No attempts yet. Record your first one on the Practise tab.</p>
                ) : (
                  history.map((h, i) => (
                    <div className="spl-hrow" key={i}>
                      <span className="spl-hscore" style={{ color: h.score >= 75 ? "var(--spl-green)" : h.score >= 55 ? "var(--spl-amber)" : "var(--spl-red)" }}>{Math.round(h.score)}</span>
                      <span className="spl-hinfo">
                        <b>“{h.sentence}”</b>
                        <span>{h.matched}/{h.total} words · {new Date(h.date).toLocaleDateString()}</span>
                      </span>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSpeechLab;
