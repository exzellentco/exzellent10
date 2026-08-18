import React, { useState } from "react";
import { buildCourse } from "../../APIs/aiTools";
import AiErrorNotice from "./AiErrorNotice";

const LANGS = ["English", "German", "Spanish", "French"];
const LEVELS = ["A1", "A2", "B1", "B2", "C1"];

// Teacher: describe → course outline → optionally create the real course.
// Student: describe a goal → a 4-week personal study plan.
const CourseBuilder = ({ role, context }) => {
  const isTeacher = role === "teacher";
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("English");
  const [level, setLevel] = useState(isTeacher ? "A1" : "A2");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [out, setOut] = useState(null);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);

  const gen = async () => {
    if (!description.trim()) { setError(isTeacher ? "Describe the course to build." : "Describe your goal."); return; }
    setLoading(true); setError(""); setOut(null); setCreated(false);
    try { setOut(await buildCourse({ description, language, level, audience: isTeacher ? "teacher" : "student" })); }
    catch (e) { setError(e); }
    finally { setLoading(false); }
  };

  const create = async () => {
    if (!context?.onCreateCourse || !out) return;
    setCreating(true); setError("");
    try {
      await context.onCreateCourse({ title: out.title, description: out.description || "", language, level, tags: [], sections: out.sections || [] });
      setCreated(true);
    } catch (e) { setError(e.message); }
    finally { setCreating(false); }
  };

  return (
    <>
      <div className="spl-label">{isTeacher ? "Describe the course to build" : "What do you want to achieve?"}</div>
      <textarea
        className="spl-textarea"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={isTeacher ? "e.g. Business English for job interviews, 4 weeks" : "e.g. Pass my German A2 exam in a month"}
      />
      <div className="spl-row" style={{ margin: "10px 0" }}>
        <select className="spl-select" value={language} onChange={(e) => setLanguage(e.target.value)}>{LANGS.map((l) => <option key={l}>{l}</option>)}</select>
        <select className="spl-select" value={level} onChange={(e) => setLevel(e.target.value)}>{LEVELS.map((l) => <option key={l}>{l}</option>)}</select>
      </div>
      <button className="spl-rec" onClick={gen} disabled={loading}>
        {loading ? <><span className="spl-spin" />Generating…</> : isTeacher ? "✦ Build course outline" : "✦ Build my study plan"}
      </button>
      <AiErrorNotice error={error} />

      {out && isTeacher && (
        <div style={{ marginTop: 18 }}>
          <div className="spl-report-h">{out.title}</div>
          <p className="spl-sub" style={{ marginBottom: 8 }}>{out.description}</p>
          {(out.sections || []).map((s, i) => (
            <div className="spl-sec" key={i}>
              <b>{i + 1}. {s.title}</b> <span className="spl-pill">{s.quizCount || 0} quiz · {s.flashcardCount || 0} cards</span>
              <ul>{(s.lectures || []).map((l, li) => <li key={li}>{l}</li>)}</ul>
            </div>
          ))}
          {context?.onCreateCourse && (
            created ? (
              <p className="spl-report-h" style={{ color: "var(--spl-green)", fontSize: 14, marginTop: 12 }}>✓ Course created — find it in “Your courses”.</p>
            ) : (
              <button className="spl-btn primary" style={{ width: "100%", marginTop: 14 }} onClick={create} disabled={creating}>
                {creating ? <><span className="spl-spin" />Creating…</> : "Create this course"}
              </button>
            )
          )}
        </div>
      )}

      {out && !isTeacher && (
        <div style={{ marginTop: 18 }}>
          <div className="spl-report-h">{out.title}</div>
          <p className="spl-sub" style={{ marginBottom: 8 }}>{out.summary}</p>
          {(out.weeks || []).map((w, i) => (
            <div className="spl-sec" key={i}>
              <b>Week {w.week}: {w.focus}</b>
              <ul>{(w.activities || []).map((a, ai) => <li key={ai}>{a}</li>)}</ul>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default CourseBuilder;
