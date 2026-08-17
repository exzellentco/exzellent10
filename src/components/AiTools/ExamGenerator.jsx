import React, { useState } from "react";
import { generateExam } from "../../APIs/aiTools";

const LANGS = ["English", "German", "Spanish", "French"];
const LEVELS = ["A1", "A2", "B1", "B2", "C1"];

// Students self-test (pick an option → reveal); teachers see the answer key.
const ExamGenerator = ({ role, initial }) => {
  const [topic, setTopic] = useState(initial?.topic || "");
  const [language, setLanguage] = useState(initial?.language || "English");
  const [level, setLevel] = useState(initial?.level || "A2");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exam, setExam] = useState(null);
  const [picks, setPicks] = useState({});
  const [flipped, setFlipped] = useState({});

  const gen = async () => {
    if (!topic.trim()) { setError("Enter a topic to practise."); return; }
    setLoading(true); setError(""); setExam(null); setPicks({}); setFlipped({});
    try { setExam(await generateExam({ topic, language, level, count })); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <>
      <div className="spl-label">{role === "teacher" ? "Create an assessment for your class" : "Generate a quiz to study"}</div>
      <input className="spl-input" style={{ marginBottom: 8 }} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic — e.g. ordering food, past tense, job interviews" />
      <div className="spl-row" style={{ marginBottom: 10 }}>
        <select className="spl-select" value={language} onChange={(e) => setLanguage(e.target.value)}>{LANGS.map((l) => <option key={l}>{l}</option>)}</select>
        <select className="spl-select" value={level} onChange={(e) => setLevel(e.target.value)}>{LEVELS.map((l) => <option key={l}>{l}</option>)}</select>
        <select className="spl-select" value={count} onChange={(e) => setCount(Number(e.target.value))}>{[3, 5, 8, 10].map((n) => <option key={n} value={n}>{n} Qs</option>)}</select>
      </div>
      <button className="spl-rec" onClick={gen} disabled={loading}>
        {loading ? <><span className="spl-spin" />Generating…</> : "✦ Generate exam"}
      </button>
      {error && <p className="spl-err">{error}</p>}

      {exam && (
        <div style={{ marginTop: 18 }}>
          <div className="spl-report-h">{exam.title}</div>
          {(exam.mcqs || []).map((q, qi) => {
            const chosen = picks[qi];
            const reveal = role === "teacher" || chosen != null;
            return (
              <div className="spl-q" key={qi}>
                <b>{qi + 1}. {q.question}</b>
                {(q.options || []).map((opt, oi) => {
                  let cls = "spl-opt";
                  if (reveal && oi === q.answer) cls += " correct";
                  else if (reveal && chosen === oi && oi !== q.answer) cls += " wrong";
                  return (
                    <button
                      key={oi}
                      className={cls}
                      disabled={role !== "teacher" && chosen != null}
                      onClick={() => role !== "teacher" && chosen == null && setPicks((p) => ({ ...p, [qi]: oi }))}
                    >
                      {String.fromCharCode(65 + oi)}. {opt}
                    </button>
                  );
                })}
                {reveal && q.explanation && <div className="spl-explain">💡 {q.explanation}</div>}
              </div>
            );
          })}

          {(exam.flashcards || []).length > 0 && (
            <>
              <div className="spl-label" style={{ marginTop: 18 }}>Flashcards (tap to flip)</div>
              {exam.flashcards.map((f, i) => (
                <div className="spl-fc" key={i} onClick={() => setFlipped((s) => ({ ...s, [i]: !s[i] }))}>
                  <small>{flipped[i] ? "Back" : "Front"}</small>
                  {flipped[i] ? <span>{f.back}</span> : <b>{f.front}</b>}
                </div>
              ))}
            </>
          )}

          {(exam.oral_prompts || []).length > 0 && (
            <>
              <div className="spl-label" style={{ marginTop: 18 }}>Speaking prompts</div>
              <div className="spl-card">
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {exam.oral_prompts.map((p, i) => <li key={i} style={{ margin: "4px 0", fontSize: 13.5 }}>{p}</li>)}
                </ul>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ExamGenerator;
