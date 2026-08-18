import React, { useRef, useState } from "react";
import { generateStudyKit } from "../../APIs/aiTools";
import { extractPdfText } from "../../lib/pdf";
import AiErrorNotice from "./AiErrorNotice";

const LANGS = ["English", "German", "Spanish", "French"];
const LEVELS = ["A1", "A2", "B1", "B2", "C1"];

// Upload a PDF (or paste text) → AI builds a full study kit → create the course.
const AiContentEngine = ({ onClose, context }) => {
  const fileRef = useRef(null);
  const [language, setLanguage] = useState("English");
  const [level, setLevel] = useState("A2");
  const [fileName, setFileName] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [kit, setKit] = useState(null);
  const [flipped, setFlipped] = useState({});
  const [picks, setPicks] = useState({});
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);

  const takeFile = async (file) => {
    if (!file) return;
    if (!/pdf$/i.test(file.type) && !/\.pdf$/i.test(file.name)) {
      setError("Please upload a PDF file."); return;
    }
    setError(""); setExtracting(true); setFileName(file.name); setKit(null);
    try {
      const text = await extractPdfText(file);
      if (!text || text.length < 40) setError("Couldn't read much text — is this a scanned/image PDF?");
      setSource(text || "");
    } catch {
      setError("Couldn't read that PDF. Try another file.");
    } finally {
      setExtracting(false);
    }
  };

  const onDrop = (e) => { e.preventDefault(); takeFile(e.dataTransfer.files?.[0]); };

  const generate = async () => {
    const text = source.trim();
    if (text.length < 40) { setError("Add a PDF, or paste at least a paragraph of source text."); return; }
    setLoading(true); setError(""); setKit(null); setPicks({}); setFlipped({});
    try { setKit(await generateStudyKit({ text, language, level })); }
    catch (e) { setError(e); }
    finally { setLoading(false); }
  };

  const create = async () => {
    if (!context?.onCreateCourse || !kit) return;
    setCreating(true); setError("");
    try {
      await context.onCreateCourse({
        title: kit.title, description: kit.description || kit.summary || "",
        language, level, tags: [],
        // Keep the AI-built structure AND the study material so it stays in the course.
        sections: (kit.sections || []).map((s) => ({ title: s.title, lectures: s.lectures || [] })),
        studyKit: {
          summary: kit.summary || "",
          keyTerms: kit.key_terms || [],
          flashcards: kit.flashcards || [],
          quiz: kit.quiz || [],
        },
      });
      setCreated(true);
    } catch (e) { setError(e.message); }
    finally { setCreating(false); }
  };

  return (
    <div className="spl-root">
      <div className="spl-overlay" onClick={onClose}>
        <div className="spl-panel" onClick={(e) => e.stopPropagation()}>
          <div className="spl-aura" />
          <div className="spl-head">
            <span className="spl-mic">⬆</span>
            <div><h3>AI Content Engine</h3><p>Upload a PDF — we build the study kit</p></div>
            <button className="spl-close" onClick={onClose} aria-label="Close">×</button>
          </div>

          <div className="spl-body">
            {/* ---- input ---- */}
            <input ref={fileRef} type="file" accept="application/pdf,.pdf" style={{ display: "none" }}
              onChange={(e) => takeFile(e.target.files?.[0])} />
            <div
              className="ddrop-lite"
              onClick={() => fileRef.current?.click()}
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <span style={{ fontSize: 28 }}>📄</span>
              <b>{extracting ? "Reading PDF…" : fileName ? fileName : "Drop a PDF or click to browse"}</b>
              <span className="spl-sub">{fileName && !extracting ? `${source.length.toLocaleString()} characters extracted` : "PDF · text-based"}</span>
            </div>

            <div className="spl-label" style={{ marginTop: 14 }}>Source text (from the PDF, or paste/edit)</div>
            <textarea className="spl-textarea" value={source} onChange={(e) => setSource(e.target.value)}
              placeholder="Extracted PDF text appears here — or paste your own material / a topic." style={{ minHeight: 90 }} />

            <div className="spl-row" style={{ margin: "10px 0" }}>
              <select className="spl-select" value={language} onChange={(e) => setLanguage(e.target.value)}>{LANGS.map((l) => <option key={l}>{l}</option>)}</select>
              <select className="spl-select" value={level} onChange={(e) => setLevel(e.target.value)}>{LEVELS.map((l) => <option key={l}>{l}</option>)}</select>
            </div>
            <button className="spl-rec" onClick={generate} disabled={loading || extracting}>
              {loading ? <><span className="spl-spin" />Building study kit…</> : "✦ Generate study kit"}
            </button>
            <AiErrorNotice error={error} />

            {/* ---- results ---- */}
            {kit && (
              <div style={{ marginTop: 20 }}>
                <div className="spl-report-h">{kit.title}</div>
                {kit.summary && <p className="spl-sub" style={{ marginBottom: 8 }}>{kit.summary}</p>}

                {Array.isArray(kit.key_terms) && kit.key_terms.length > 0 && (
                  <div className="spl-chips" style={{ marginBottom: 10 }}>
                    {kit.key_terms.map((t, i) => <span className="spl-chip" key={i}>{t}</span>)}
                  </div>
                )}

                {Array.isArray(kit.sections) && kit.sections.length > 0 && (
                  <>
                    <div className="spl-label" style={{ marginTop: 14 }}>📚 Course outline</div>
                    {kit.sections.map((s, i) => (
                      <div className="spl-sec" key={i}>
                        <b>{i + 1}. {s.title}</b>
                        <ul>{(s.lectures || []).map((l, li) => <li key={li}>{l}</li>)}</ul>
                      </div>
                    ))}
                  </>
                )}

                {Array.isArray(kit.flashcards) && kit.flashcards.length > 0 && (
                  <>
                    <div className="spl-label" style={{ marginTop: 16 }}>🃏 Flashcards (tap to flip)</div>
                    {kit.flashcards.map((f, i) => (
                      <div className="spl-fc" key={i} onClick={() => setFlipped((s) => ({ ...s, [i]: !s[i] }))}>
                        <small>{flipped[i] ? "Back" : "Front"}</small>
                        {flipped[i] ? <span>{f.back}</span> : <b>{f.front}</b>}
                      </div>
                    ))}
                  </>
                )}

                {Array.isArray(kit.quiz) && kit.quiz.length > 0 && (
                  <>
                    <div className="spl-label" style={{ marginTop: 16 }}>❓ Quiz</div>
                    {kit.quiz.map((q, qi) => {
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
                  </>
                )}

                {context?.onCreateCourse && (
                  created ? (
                    <p className="spl-report-h" style={{ color: "var(--spl-green)", fontSize: 14, marginTop: 16 }}>✓ Course created — the outline, flashcards, quiz &amp; summary are saved in it. Find it in “Your courses”.</p>
                  ) : (
                    <button className="spl-btn primary" style={{ width: "100%", marginTop: 16 }} onClick={create} disabled={creating}>
                      {creating ? <><span className="spl-spin" />Creating…</> : "Create course — keep the whole study kit"}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiContentEngine;
