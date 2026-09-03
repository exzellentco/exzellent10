import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  Users, CalendarCheck, BookOpen, Video, Sparkles, Mic, MessageSquare,
  Crown, ChevronRight, RefreshCw, LogOut, GraduationCap, Clock, Coins,
} from "lucide-react";
import axios from "../utils/axios";
import { signOut as endSession } from "../utils/signOut";
import GlassCard from "../components/UI/GlassCard";
import CountUp from "../components/StudentComponent/CountUp";
import MessagesPanel from "../components/Messages/MessagesPanel";
import AiToolsHub from "../components/AiTools/AiToolsHub";
import StudentSpeechLab from "../components/SpeechAnalyzer/StudentSpeechLab";
import ExziChatWidget from "../components/shared/ExziChatWidget";
import UpgradeBanner from "../components/UI/UpgradeBanner";
import { isLocked, LOCK_NOTE, PLAN_ROUTE } from "../config/plan";

/**
 * THE FREE TEACHER DASHBOARD.
 *
 * What a teacher sees before they are on the paid plan. The paid plan opens the
 * full console (sidebar, payroll, reports, attendance, calendar); this is the
 * teaching day and nothing else.
 *
 * It is built to sit beside the free student dashboard — same dark base, same
 * page-scoped custom properties, same card language — but keyed to amber rather
 * than violet, so a teacher and a student sharing a screen can tell at a glance
 * whose account is open.
 *
 * The tools that already exist are reused, not rebuilt: Messages, AI Tools and
 * the Speech Lab are the same components the previous teacher dashboard opened.
 */

// Page-scoped tokens. Inline custom properties so nothing global is touched and
// this page cannot restyle the rest of the site.
const tdVars = {
  "--td-bg": "#050508",
  "--td-surface": "#141019",
  "--td-accent": "#F0B23C",
  "--td-accent-deep": "#A9760F",
  "--td-accent-light": "#F7D488",
  "--td-ink": "#F7F1E8",
  "--td-ink-muted": "#b6a894",
  "--td-border": "rgba(240,178,60,0.22)",
  "--td-font-heading": "'Fraunces', 'Georgia', serif",
  "--td-font-body": "'Inter', system-ui, sans-serif",
  fontFamily: "var(--td-font-body)",
};

const pageBg = {
  ...tdVars,
  minHeight: "100vh",
  backgroundColor: "var(--td-bg)",
  backgroundImage:
    "linear-gradient(to right, rgba(240,178,60,0.06) 1px, transparent 1px)," +
    "linear-gradient(to bottom, rgba(240,178,60,0.06) 1px, transparent 1px)",
  backgroundSize: "40px 40px",
  color: "var(--td-ink)",
};

const Stat = ({ icon, value, label, suffix }) => (
  <div className="rounded-xl p-5" style={{ border: "1px solid var(--td-border)", background: "rgba(255,255,255,.02)" }}>
    <span className="inline-flex opacity-80 mb-3" style={{ color: "var(--td-accent)" }}>{icon}</span>
    <div className="text-3xl font-semibold leading-none tabular-nums" style={{ fontFamily: "var(--td-font-heading)" }}>
      <CountUp value={value} suffix={suffix} />
    </div>
    <div className="text-xs mt-2" style={{ color: "var(--td-ink-muted)" }}>{label}</div>
  </div>
);

const Section = ({ title, sub, children, action }) => (
  <section className="mb-10">
    <div className="flex items-end gap-4 mb-4">
      <div className="flex-1">
        <h2 className="text-xl font-semibold m-0" style={{ fontFamily: "var(--td-font-heading)" }}>{title}</h2>
        {sub && <p className="text-sm mt-1 mb-0" style={{ color: "var(--td-ink-muted)" }}>{sub}</p>}
      </div>
      {action}
    </div>
    {children}
  </section>
);

const FreeTeacherDashboard = () => {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const [d, setD] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [panel, setPanel] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const { data } = await axios.get("/api/dashboard");
      setD(data?.data || {});
    } catch (e) {
      setError(e?.response?.data?.message || "Could not load your dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const me = d.me || {};
  const bookings = d.bookings || [];
  const today = new Date().toISOString().slice(0, 10);

  const classesToday = me.classesToday || [];
  const roster = me.roster || [];
  const upcoming = useMemo(
    () => bookings.filter((b) => b.date >= today).slice(0, 6),
    [bookings, today]
  );
  // Lessons already taught. Counting every booking here would repeat the
  // "Lessons booked" figure beside it, which tells a teacher nothing.
  const delivered = useMemo(
    () => bookings.filter((b) => b.date < today).length,
    [bookings, today]
  );

  // The last few you actually taught, newest first — the other half of
  // "my lessons", and what you need when following a student up.
  const recent = useMemo(
    () => bookings.filter((b) => b.date < today).sort((a, b) => (b.date + b.start).localeCompare(a.date + a.start)).slice(0, 5),
    [bookings, today]
  );

  const signOut = () => endSession(navigate);

  const join = (b) => {
    if (b.meetingUrl) window.open(b.meetingUrl, "_blank", "noopener");
    else if (b._id) navigate(`/class/${b._id}`);
  };

  // Same split as the learner side: generating costs a model call per press and
  // is paid; practice and talking to your students are not.
  const locked = (f) => isLocked(f, !!me.paid);

  const TOOLS = [
    { key: "aitools", feature: "aiExam", label: "AI Tools", note: "Build an exam, a course, a report", icon: <Sparkles size={18} />, tint: "#F0B23C" },
    { key: "speech", feature: "speechLab", label: "Speech Lab", note: "Model pronunciation for a lesson", icon: <Mic size={18} />, tint: "#B392F5" },
    { key: "messages", feature: "messages", label: "Messages", note: "Your students' questions", icon: <MessageSquare size={18} />, tint: "#5AE287" },
  ];

  const fade = reduced ? {} : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

  return (
    <div style={pageBg}>
      <div className="max-w-6xl mx-auto px-5 py-10">

        {/* ── header ── */}
        <header className="flex flex-wrap items-center gap-4 mb-10">
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-[0.2em] mb-2" style={{ color: "var(--td-accent)" }}>
              Teaching
            </p>
            <h1 className="text-3xl font-semibold m-0 truncate" style={{ fontFamily: "var(--td-font-heading)" }}>
              {me.name ? `Hello, ${me.name.split(" ")[0]}` : "Hello"}
            </h1>
            <p className="text-sm mt-2 mb-0" style={{ color: "var(--td-ink-muted)" }}>
              {classesToday.length
                ? `${classesToday.length} class${classesToday.length === 1 ? "" : "es"} to teach today.`
                : "Nothing scheduled for today."}
            </p>
          </div>

          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
            style={{ border: "1px solid var(--td-border)", color: "var(--td-accent-light)" }}
            title="Credits, including any Exzellent Points you banked at signup"
          >
            <Coins size={13} /> {me.credits ?? 0} credits
          </span>

          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
            style={{ border: "1px solid var(--td-border)", color: "var(--td-accent-light)" }}
          >
            <Crown size={13} /> {me.paid ? "Full Access" : "Free plan"}
          </span>

          <button
            type="button" onClick={load}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm"
            style={{ border: "1px solid var(--td-border)" }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            type="button" onClick={signOut}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm"
            style={{ border: "1px solid var(--td-border)" }}
          >
            <LogOut size={14} /> Sign out
          </button>
        </header>

        {loading && <p style={{ color: "var(--td-ink-muted)" }}>Loading…</p>}
        {!loading && error && (
          <p className="rounded-xl p-4 mb-8" style={{ border: "1px solid rgba(232,117,111,.4)", color: "#f0a09b" }}>
            {error}
          </p>
        )}

        {!loading && !error && (
          <>
            <motion.div {...fade} transition={{ duration: 0.35 }}
              className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-10">
              <Stat icon={<CalendarCheck size={20} />} value={classesToday.length} label="Classes today" />
              <Stat icon={<Users size={20} />} value={roster.length} label="Students you teach" />
              <Stat icon={<GraduationCap size={20} />} value={bookings.length} label="Lessons booked" />
              <Stat icon={<BookOpen size={20} />} value={delivered} label="Lessons taught" />
            </motion.div>

            {/* ── today ── */}
            <Section title="Today" sub="What you are teaching, in order.">
              {!classesToday.length && (
                <p className="rounded-xl p-6 text-sm" style={{ border: "1px solid var(--td-border)", color: "var(--td-ink-muted)" }}>
                  No classes today. Your next ones are below.
                </p>
              )}
              <ul className="list-none p-0 m-0">
                {classesToday.map((c) => (
                  <li key={c._id} className="flex items-center gap-4 py-4" style={{ borderBottom: "1px solid var(--td-border)" }}>
                    <span className="flex-none w-14 tabular-nums text-sm font-medium">{c.start}</span>
                    <span className="flex-1 min-w-0">
                      <b className="block truncate">{c.title}</b>
                      <span className="text-xs" style={{ color: "var(--td-ink-muted)" }}>{c.student}</span>
                    </span>
                    <button
                      type="button" onClick={() => join(c)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm"
                      style={{ background: "var(--td-accent)", color: "#1a1408" }}
                    >
                      <Video size={14} /> Start
                    </button>
                  </li>
                ))}
              </ul>
            </Section>

            {/* ── tools ── */}
            <Section title="Your tools" sub="Practice and messaging are free. Generating exams and courses is part of the full plan.">
              <div className="grid gap-4 sm:grid-cols-3">
                {TOOLS.map((t, i) => (
                  <motion.button
                    key={t.key}
                    type="button"
                    onClick={() => (locked(t.feature) ? navigate(PLAN_ROUTE) : setPanel(t.key))}
                    {...fade}
                    transition={{ duration: 0.3, delay: reduced ? 0 : i * 0.06 }}
                    className="text-left"
                  >
                    {/* No halo: three glowing tinted cards in a row is the
                        single most recognisable generated-dashboard look. */}
                    <GlassCard glowColor={t.tint} intensity={0}>
                      <span className="inline-flex mb-3" style={{ color: t.tint }}>{t.icon}</span>
                      <b className="block mb-1">{t.label}</b>
                      <span className="text-xs" style={{ color: "var(--td-ink-muted)" }}>{t.note}</span>
                      {locked(t.feature) && (
                        <span className="block mt-2 text-xs" style={{ color: "var(--td-accent-light)" }}>{LOCK_NOTE}</span>
                      )}
                    </GlassCard>
                  </motion.button>
                ))}
              </div>
            </Section>

            {/* ── students ── */}
            <Section
              title="Your students"
              sub={roster.length ? `${roster.length} in total.` : "Students appear here once they book with you."}
            >
              {!!roster.length && (
                <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--td-border)" }}>
                  {roster.map((r, i) => (
                    <div
                      key={r._id}
                      className="flex items-center gap-4 px-5 py-3.5"
                      style={{ borderTop: i ? "1px solid var(--td-border)" : "none" }}
                    >
                      <span className="flex-1 min-w-0"><b className="block truncate">{r.student}</b></span>
                      <span className="text-xs" style={{ color: "var(--td-ink-muted)" }}>{r.level}</span>
                      <span className="text-xs tabular-nums" style={{ color: "var(--td-ink-muted)" }}>
                        attended {r.attended}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* ── my lessons ── */}
            <Section title="My lessons" sub="What you teach next, and what you just taught.">
              <p className="text-xs uppercase tracking-wider m-0 mb-1" style={{ color: "var(--td-ink-muted)" }}>Upcoming</p>
              {upcoming.length ? (
                <ul className="list-none p-0 m-0">
                  {upcoming.map((b) => (
                    <li key={b._id} className="flex items-center gap-4 py-3" style={{ borderBottom: "1px solid var(--td-border)" }}>
                      <span className="flex-none w-24 text-xs tabular-nums" style={{ color: "var(--td-ink-muted)" }}>
                        {b.date}
                      </span>
                      <span className="flex-none w-14 text-sm tabular-nums">{b.start}</span>
                      <span className="flex-1 min-w-0"><b className="block truncate">{b.title}</b></span>
                      <span className="text-xs inline-flex items-center gap-1" style={{ color: "var(--td-ink-muted)" }}>
                        <Clock size={11} /> {b.who || b.studentName || "—"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm m-0 py-2" style={{ color: "var(--td-ink-muted)" }}>
                  Nothing booked yet. Students find you through the tutor directory.
                </p>
              )}

              {!!recent.length && (
                <>
                  <p className="text-xs uppercase tracking-wider m-0 mt-5 mb-1" style={{ color: "var(--td-ink-muted)" }}>Recently taught</p>
                  <ul className="list-none p-0 m-0">
                    {recent.map((b) => (
                      <li key={b._id} className="flex items-center gap-4 py-3" style={{ borderBottom: "1px solid var(--td-border)", opacity: .75 }}>
                        <span className="flex-none w-24 text-xs tabular-nums" style={{ color: "var(--td-ink-muted)" }}>
                          {b.date}
                        </span>
                        <span className="flex-none w-14 text-sm tabular-nums">{b.start}</span>
                        <span className="flex-1 min-w-0"><b className="block truncate">{b.title}</b></span>
                        <span className="text-xs inline-flex items-center gap-1" style={{ color: "var(--td-ink-muted)" }}>
                          <Clock size={11} /> {b.who || b.studentName || "—"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Section>

            {/* ── the paid plan ── */}
            {!me.paid && (
              <UpgradeBanner
                eyebrow="Full plan"
                title="The full teaching console"
                lines={[
                  "A month calendar of every lesson",
                  "Attendance and the class roster",
                  "Earnings and payroll",
                  "AI exam and course builder",
                ]}
                cta="See the plans"
                accent="var(--td-accent)"
                border="var(--td-border)"
                ink="var(--td-ink)"
                muted="var(--td-ink-muted)"
              />
            )}
          </>
        )}
      </div>

      {panel === "messages" && <MessagesPanel onClose={() => setPanel(null)} />}
      {panel === "aitools" && <AiToolsHub role="teacher" onClose={() => setPanel(null)} />}
      {panel === "speech" && <StudentSpeechLab onClose={() => setPanel(null)} student={me} />}

      <ExziChatWidget />
    </div>
  );
};

export default FreeTeacherDashboard;
