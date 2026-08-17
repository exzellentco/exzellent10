import React, { useEffect, useState } from "react";
import { useRecorder } from "./useRecorder";
import ScoreResult from "./ScoreResult";
import { analyzeSpeech } from "../../APIs/speechAnalyzer";
import { PRACTICE_SETS, langCode } from "../../data/practiceSentences";

// Teacher speech lab — analytical. Tabs: Analyze (score any speech against a
// reference, with full metrics) + Assignments (set target sentences students see).
const TeacherSpeechLab = ({ onClose }) => {
  const [tab, setTab] = useState("analyze");

  // ---- Analyze ----
  const [language, setLanguage] = useState("English");
  const [reference, setReference] = useState(PRACTICE_SETS[0].sentences[0]);
  const { recording, seconds, error: recError, start, stop } = useRecorder();
  const [phase, setPhase] = useState("idle");
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");

  const onRecord = async () => {
    if (!reference.trim()) { setErr("Enter a reference sentence first."); return; }
    if (!recording) { setResult(null); setErr(""); await start(); return; }
    const blob = await stop();
    if (!blob) return;
    setPhase("analyzing");
    try {
      const r = await analyzeSpeech(blob, reference, langCode(language));
      setResult(r);
      setPhase("done");
    } catch (e) {
      setErr(e.message);
      setPhase("idle");
    }
  };

  // ---- Assignments (persisted; the student lab reads these) ----
  const [assignments, setAssignments] = useState([]);
  const [aTitle, setATitle] = useState("");
  const [aText, setAText] = useState("");
  useEffect(() => {
    try { setAssignments(JSON.parse(localStorage.getItem("spl-assignments") || "[]")); } catch { setAssignments([]); }
  }, []);
  const persist = (list) => {
    setAssignments(list);
    try { localStorage.setItem("spl-assignments", JSON.stringify(list)); } catch { /* ignore */ }
  };
  const addAssignment = () => {
    if (!aText.trim()) return;
    persist([{ id: `a-${Date.now()}`, title: aTitle.trim() || "Practice sentence", text: aText.trim(), language }, ...assignments]);
    setATitle(""); setAText("");
  };
  const removeAssignment = (id) => persist(assignments.filter((a) => a.id !== id));

  return (
    <div className="spl-root">
      <div className="spl-overlay" onClick={onClose}>
        <div className="spl-panel" onClick={(e) => e.stopPropagation()}>
          <div className="spl-aura" />
          <div className="spl-head">
            <span className="spl-mic">🎙️</span>
            <div>
              <h3>Speech Analyzer</h3>
              <p>Score pronunciation · set speaking assignments</p>
            </div>
            <button className="spl-close" onClick={onClose} aria-label="Close">×</button>
          </div>

          <div className="spl-tabs">
            <button className={`spl-tab ${tab === "analyze" ? "on" : ""}`} onClick={() => setTab("analyze")}>Analyze</button>
            <button className={`spl-tab ${tab === "assignments" ? "on" : ""}`} onClick={() => setTab("assignments")}>Assignments {assignments.length ? `(${assignments.length})` : ""}</button>
          </div>

          <div className="spl-body">
            {tab === "analyze" && (
              <>
                <div className="spl-label">Reference sentence</div>
                <div className="spl-row" style={{ marginBottom: 10 }}>
                  <select className="spl-select" style={{ maxWidth: 140 }} value={language} onChange={(e) => setLanguage(e.target.value)}>
                    {["English", "German", "Spanish", "French"].map((l) => <option key={l}>{l}</option>)}
                  </select>
                  <select className="spl-select" value="" onChange={(e) => e.target.value && setReference(e.target.value)}>
                    <option value="">Load an example…</option>
                    {PRACTICE_SETS.filter((s) => s.language === language).flatMap((s) => s.sentences).map((s, i) => (
                      <option key={i} value={s}>{s.slice(0, 40)}…</option>
                    ))}
                  </select>
                </div>
                <textarea className="spl-textarea" value={reference} onChange={(e) => { setReference(e.target.value); setResult(null); setPhase("idle"); }} placeholder="Type or paste the sentence the student should say…" />

                <button
                  className={`spl-rec ${recording ? "live" : ""}`}
                  style={{ marginTop: 14 }}
                  onClick={onRecord}
                  disabled={phase === "analyzing"}
                >
                  {phase === "analyzing"
                    ? "Analyzing…"
                    : recording
                    ? `⏹ Stop (${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")})`
                    : "● Record & analyze"}
                </button>
                {(err || recError) && <p className="spl-err">{err || recError}</p>}

                {phase === "done" && result && (
                  <div style={{ marginTop: 20 }}>
                    <ScoreResult result={result} detailed />
                    {result.duration_sec != null && (
                      <div className="spl-chips"><span className="spl-chip"><b>{result.duration_sec}s</b> spoken</span><span className="spl-chip"><b>{result.syllables_spoken}</b> syllables</span></div>
                    )}
                  </div>
                )}

                <p className="spl-note">
                  Whisper-based scoring compares the transcript to your reference word by word (WER). It hears <em>what</em>
                  was said, not which phoneme was off — good for triage. The full acoustic-confidence engine
                  (pitch/pauses) lives in the Python voice-analyzer service.
                </p>
              </>
            )}

            {tab === "assignments" && (
              <>
                <div className="spl-label">New speaking assignment</div>
                <input className="spl-input" style={{ marginBottom: 8 }} value={aTitle} onChange={(e) => setATitle(e.target.value)} placeholder="Title (e.g. Week 3 — introductions)" />
                <textarea className="spl-textarea" value={aText} onChange={(e) => setAText(e.target.value)} placeholder="The sentence students should practise saying…" />
                <button className="spl-btn primary" style={{ width: "100%", marginTop: 10 }} onClick={addAssignment}>+ Add assignment</button>

                <div className="spl-label" style={{ marginTop: 22 }}>Current assignments</div>
                {assignments.length === 0 ? (
                  <p className="spl-empty">No assignments yet. Add one above — students see it in their Speaking practice.</p>
                ) : (
                  assignments.map((a) => (
                    <div className="spl-hrow" key={a.id}>
                      <span className="spl-hinfo">
                        <b>{a.title}</b>
                        <span>“{a.text}” · {a.language}</span>
                      </span>
                      <button className="spl-btn" onClick={() => removeAssignment(a.id)}>Delete</button>
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

export default TeacherSpeechLab;
