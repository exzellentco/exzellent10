import React, { useState } from "react";
import ExamGenerator from "./ExamGenerator";
import CourseBuilder from "./CourseBuilder";
import ProgressReport from "./ProgressReport";

// AI Tools hub popup (Exzi-style overlay), mounted in both dashboards.
// role: "student" | "teacher" changes each tool's behaviour and copy.
const AiToolsHub = ({ role = "student", onClose, context = {}, initialTab }) => {
  const [tab, setTab] = useState(initialTab || "exam");
  const courseLabel = role === "teacher" ? "Course Builder" : "Study Plan";

  return (
    <div className="spl-root">
      <div className="spl-overlay" onClick={onClose}>
        <div className="spl-panel" onClick={(e) => e.stopPropagation()}>
          <div className="spl-aura" />
          <div className="spl-head">
            <span className="spl-mic">✦</span>
            <div>
              <h3>AI Tools</h3>
              <p>{role === "teacher" ? "Generate exams, courses & reports" : "Study smarter with AI"}</p>
            </div>
            <button className="spl-close" onClick={onClose} aria-label="Close">×</button>
          </div>

          <div className="spl-tabs">
            <button className={`spl-tab ${tab === "exam" ? "on" : ""}`} onClick={() => setTab("exam")}>Exam</button>
            <button className={`spl-tab ${tab === "course" ? "on" : ""}`} onClick={() => setTab("course")}>{courseLabel}</button>
            <button className={`spl-tab ${tab === "report" ? "on" : ""}`} onClick={() => setTab("report")}>Progress</button>
          </div>

          <div className="spl-body">
            {tab === "exam" && <ExamGenerator role={role} initial={context.initialExam} />}
            {tab === "course" && <CourseBuilder role={role} context={context} />}
            {tab === "report" && <ProgressReport role={role} context={context} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiToolsHub;
