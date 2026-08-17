import React, { useState } from "react";
import { Calendar, BrainCircuit, PersonStanding, Group, TestTubeDiagonal, Blocks } from "lucide-react";
import CalendarPopup from "./CalendarPopup";
import ToolModal from "./ToolModal";

// Popular practice-test topics → open the AI exam generator pre-filled.
const TOP_TESTS = [
  { topic: "Present & past tenses", language: "English", level: "A2" },
  { topic: "Ordering food & drinks", language: "English", level: "A1" },
  { topic: "Job interview questions", language: "English", level: "B1" },
  { topic: "German articles (der/die/das)", language: "German", level: "A1" },
  { topic: "Travel & directions", language: "German", level: "A2" },
];

const RESOURCES = [
  { icon: "🗣️", label: "Language Lab", desc: "Speak from day one", href: "/labs/language.html" },
  { icon: "🛠️", label: "Skill Lab", desc: "Learn by building", href: "/labs/skill-lab.html" },
  { icon: "🌱", label: "Growth Lab", desc: "Habits behind results", href: "/labs/growth-lab.html" },
  { icon: "🪻", label: "Exzi Playground", desc: "Your AI companion", href: "/exzi" },
  { icon: "🌐", label: "Learning Ecosystem", desc: "Explore everything", href: "/learning-ecosystem.html" },
];

const TILES = [
  { key: "calendar", Icon: Calendar, label: "Calendar", desc: "Lessons & deadlines", c: "124,58,237" },
  { key: "ai", Icon: BrainCircuit, label: "AI", desc: "Exam, plan & report", c: "6,182,212" },
  { key: "teachers", Icon: PersonStanding, label: "Teachers", desc: "Browse tutors", c: "236,72,153" },
  { key: "testcreator", Icon: Group, label: "Test Creator", desc: "Make a practice test", c: "16,185,129" },
  { key: "toptests", Icon: TestTubeDiagonal, label: "Top tests", desc: "Popular quizzes", c: "249,115,22" },
  { key: "resources", Icon: Blocks, label: "Additional Resources", desc: "Guides & labs", c: "56,189,248" },
];

// `onOpenAiTools({ tab, topic })` opens the shared AI Tools hub in the parent.
const StudentTools = ({ onOpenAiTools, events = [] }) => {
  const [open, setOpen] = useState(null); // 'calendar' | 'toptests' | 'resources'

  const click = (key) => {
    if (key === "ai") return onOpenAiTools?.({ tab: "exam" });
    if (key === "testcreator") return onOpenAiTools?.({ tab: "exam" });
    if (key === "teachers") { window.location.href = "/learning-ecosystem.html#tutors"; return; }
    setOpen(key);
  };

  return (
    <>
      <div className="ex-card ex-reveal" style={{ marginBottom: 24 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
          <h2 style={{ fontFamily: "var(--ex-font)", fontWeight: 700, fontSize: "1.3rem" }}>Tools</h2>
          <span className="ex-badge ex-badge-accent">6 functions</span>
        </div>
        <div className="stools-grid">
          {TILES.map((t) => (
            <button className="stool" key={t.key} onClick={() => click(t.key)}>
              <span className="ic" style={{ background: `rgba(${t.c},.16)`, color: `rgb(${t.c})` }}>
                <t.Icon size={20} strokeWidth={1.8} />
              </span>
              <b>{t.label}</b>
              <small>{t.desc}</small>
            </button>
          ))}
        </div>
      </div>

      {open === "calendar" && <CalendarPopup onClose={() => setOpen(null)} events={events} />}

      {open === "toptests" && (
        <ToolModal icon="🏆" title="Top tests" subtitle="Most-practised quizzes — tap to generate" onClose={() => setOpen(null)}>
          {TOP_TESTS.map((t, i) => (
            <div className="spl-list-row" key={i}>
              <span className="ic">📝</span>
              <span style={{ flex: 1 }}><b>{t.topic}</b><span>{t.language} · {t.level}</span></span>
              <button className="spl-btn primary" onClick={() => { setOpen(null); onOpenAiTools?.({ tab: "exam", topic: t.topic, language: t.language, level: t.level }); }}>
                Take it
              </button>
            </div>
          ))}
        </ToolModal>
      )}

      {open === "resources" && (
        <ToolModal icon="📚" title="Additional resources" subtitle="Guides, labs and tools to keep you moving" onClose={() => setOpen(null)}>
          {RESOURCES.map((r, i) => (
            <a className="spl-list-row" key={i} href={r.href} style={{ textDecoration: "none", color: "inherit" }}>
              <span className="ic">{r.icon}</span>
              <span style={{ flex: 1 }}><b>{r.label}</b><span>{r.desc}</span></span>
              <span style={{ color: "var(--spl-cyanL)" }}>→</span>
            </a>
          ))}
        </ToolModal>
      )}
    </>
  );
};

export default StudentTools;
