import React, { useEffect, useRef, useState } from "react";
import ExziCompanion from "../components/Exzi/ExziCompanion";
import { ArrowLeft, Plus, CheckCircle, Clock, Wallet, BookOpen, Users, Sparkles } from "lucide-react";
import {
  getMyTeacherProfile,
  getTeacherDashboard,
  getTeacherStudents,
  getTeacherEarnings,
  updateMyTeacherProfile,
} from "../APIs/teacherProfile";
import { createCourseByTeacher } from "../APIs/AdminCourses";
import {
  fetchCourses,
  createSection,
  updateSection,
  deleteSection,
  updateCourse,
  publishCourse,
  unpublishCourse,
  deleteCourse,
} from "../APIs/AdminCourses";
import axios from "../utils/axios";
import TeacherCourseForm from "../components/CourseComponent/TeacherCourseForm";
import SectionForm from "../components/CourseComponent/SectionForm";
import SectionList from "../components/CourseComponent/SectionList";
import TeacherSpeechLab from "../components/SpeechAnalyzer/TeacherSpeechLab";
import AiToolsHub from "../components/AiTools/AiToolsHub";
import AiContentEngine from "../components/AiTools/AiContentEngine";
import StudyKitView from "../components/AiTools/StudyKitView";
import TeacherAssignments from "../components/Assignments/TeacherAssignments";
import CalendarPopup from "../components/Tools/CalendarPopup";
import MessagesPanel from "../components/Messages/MessagesPanel";

const FORMATS = [
  { icon: "🃏", label: "Flashcards", c: "124,58,237" },
  { icon: "❓", label: "Quiz (MCQ)", c: "6,182,212" },
  { icon: "🎮", label: "Game", c: "236,72,153" },
  { icon: "🎧", label: "Audio narration", c: "16,185,129" },
  { icon: "🎬", label: "Video explainer", c: "249,115,22" },
  { icon: "📝", label: "Summary", c: "124,58,237" },
  { icon: "📄", label: "Worksheet", c: "6,182,212" },
  { icon: "📚", label: "Study guide", c: "16,185,129" },
  { icon: "🧠", label: "Mind map", c: "236,72,153" },
];

// Compact euro formatting: 2340 -> "€2.3k", 640 -> "€640".
const euro = (n) => {
  const v = Number(n) || 0;
  return v >= 1000 ? `€${(v / 1000).toFixed(1)}k` : `€${v}`;
};
const euroFull = (n) => `€${(Number(n) || 0).toLocaleString("en-US")}`;
const agoLabel = (n) => (n === 0 ? "this month" : n === 1 ? "1 month ago" : `${n} months ago`);

const VIEW_HEADER = {
  dashboard: ["", "Here's your teaching at a glance."],
  students: ["Students", "Everyone enrolled in your courses."],
  lessons: ["Lessons", "Every lesson across your courses."],
  earnings: ["Earnings", "Your revenue, course by course."],
  settings: ["Settings", "Manage your teacher profile."],
};

const TeacherDashboard = () => {
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [editSection, setEditSection] = useState(null);
  const [editCourse, setEditCourse] = useState(null);
  const [stats, setStats] = useState(null);
  const [showSpeech, setShowSpeech] = useState(false);
  const [showAiTools, setShowAiTools] = useState(false);
  const [aiToolsTab, setAiToolsTab] = useState("exam");
  const [showCalendar, setShowCalendar] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [messageWith, setMessageWith] = useState(null); // student id to open a thread with
  const [showEngine, setShowEngine] = useState(false);
  const [showAssignments, setShowAssignments] = useState(false);
  const [busyCourse, setBusyCourse] = useState(null); // course id being published/deleted

  const [view, setView] = useState("dashboard");
  const [query, setQuery] = useState("");
  const [students, setStudents] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "", countryOfResidence: "", bio: "", subjects: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  const aiPanelRef = useRef(null);

  useEffect(() => { fetchData(); }, []);

  const loadStats = async () => {
    const res = await getTeacherDashboard();
    setStats(res && res.success ? res : null);
  };
  const loadStudents = async () => setStudents(await getTeacherStudents());
  const loadEarnings = async () => setEarnings(await getTeacherEarnings());

  const filterMine = (arr, teacherId) => (Array.isArray(arr) ? arr : []).filter((course) => {
    const ci = typeof course.instructor === "string" ? course.instructor : course.instructor?._id;
    return !ci || ci === teacherId;
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMyTeacherProfile();
      const data = res.data;
      setTeacherData(data);
      const allCourses = await fetchCourses();
      setCourses(filterMine(allCourses, data?._id));
      await Promise.all([loadStats(), loadStudents(), loadEarnings()]);
    } catch (err) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  // Seed the settings form once the profile arrives.
  useEffect(() => {
    if (!teacherData) return;
    setProfileForm({
      firstName: teacherData.firstName || "",
      lastName: teacherData.lastName || "",
      countryOfResidence: teacherData.countryOfResidence || teacherData.country || "",
      bio: teacherData.bio || "",
      subjects: Array.isArray(teacherData.subjects) ? teacherData.subjects.join(", ") : (teacherData.subjects || ""),
    });
  }, [teacherData]);

  useEffect(() => { if (selectedCourse) window.scrollTo(0, 0); }, [selectedCourse]);
  useEffect(() => { setQuery(""); window.scrollTo(0, 0); }, [view]);

  const refreshSelectedCourse = async (courseId) => {
    try {
      const response = await axios.get(`/api/courses/${courseId}`);
      const updated = response.data;
      setSelectedCourse(updated);
      setCourses((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
      await Promise.all([loadStats(), loadEarnings()]);
    } catch {
      alert("Failed to refresh course data. Please try again.");
    }
  };

  const reloadCourses = async () => {
    const updated = await fetchCourses();
    setCourses(filterMine(updated, teacherData?._id));
    await Promise.all([loadStats(), loadEarnings(), loadStudents()]);
  };

  const handleCreateCourse = async (courseData) => {
    try { await createCourseByTeacher(courseData); setShowCourseForm(false); await reloadCourses(); }
    catch (err) { alert("Failed to create course: " + err.message); }
  };
  const handleUpdateCourse = async (courseData) => {
    try { await updateCourse(editCourse._id, courseData); setEditCourse(null); await reloadCourses(); }
    catch (err) { alert("Failed to update course: " + err.message); }
  };

  // AI-generated course: the whole kit (sections + lectures + flashcards/quiz/
  // summary) is stored on the course in one call, so it stays with the course.
  const createCourseFromAI = async (d) => {
    await createCourseByTeacher(d);
    await reloadCourses();
  };

  const openAiTools = (tab) => { setAiToolsTab(tab || "exam"); setShowAiTools(true); };
  const openEditCourse = (course) => setEditCourse(course);

  const handleTogglePublish = async (course) => {
    setBusyCourse(course._id);
    try {
      if (course.isPublished) await unpublishCourse(course._id);
      else await publishCourse(course._id);
      await reloadCourses();
    } catch (err) { alert("Couldn't change publish state: " + err.message); }
    finally { setBusyCourse(null); }
  };

  const handleDeleteCourse = async (course) => {
    if (!window.confirm(`Delete “${course.title}”? This can't be undone.`)) return;
    setBusyCourse(course._id);
    try { await deleteCourse(course._id); await reloadCourses(); }
    catch (err) { alert("Couldn't delete course: " + err.message); }
    finally { setBusyCourse(null); }
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    setProfileMsg("");
    try {
      const payload = { ...profileForm, subjects: profileForm.subjects.split(",").map((s) => s.trim()).filter(Boolean) };
      await updateMyTeacherProfile(payload);
      setTeacherData((prev) => ({ ...prev, ...payload }));
      setProfileMsg("ok");
    } catch {
      setProfileMsg("err");
    } finally {
      setSavingProfile(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login";
  };

  const goAiEngine = () => {
    setView("dashboard");
    setTimeout(() => aiPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };

  const firstName = teacherData?.firstName || "Teacher";
  const initials = ((teacherData?.firstName?.[0] || "T") + (teacherData?.lastName?.[0] || "")).toUpperCase();

  // Live stats from the backend; fall back to whatever we can derive from the
  // course list so the real backend (no /dashboard endpoint yet) never shows fakes.
  const live = !!stats;
  const totalCourses = stats?.courses?.total ?? courses.length;
  const publishedCount = stats?.courses?.published ?? courses.filter((c) => c.isPublished).length;
  const lessonCount = stats?.lessons ?? courses.reduce((s, c) => s + (Array.isArray(c.sections) ? c.sections.length : 0), 0);
  const activeStudents = stats?.students?.active;
  const newStudents = stats?.students?.newThisMonth ?? 0;
  const aiGenerations = stats?.aiGenerations ?? lessonCount * 9;
  const earnMonth = stats?.earnings?.thisMonth;
  const earnDelta = stats?.earnings?.deltaPct ?? 0;
  const monthly = stats?.earnings?.monthly || [];
  const chartMax = Math.max(1, ...monthly.map((m) => m.value));

  // Search filtering.
  const q = query.trim().toLowerCase();
  const matches = (...vals) => !q || vals.some((v) => String(v || "").toLowerCase().includes(q));
  const filteredCourses = courses.filter((c) => matches(c.title, c.language, c.level));
  const allLessons = courses.flatMap((c) => (Array.isArray(c.sections) ? c.sections : []).map((s) => ({ ...s, courseTitle: c.title, course: c })));
  const filteredLessons = allLessons.filter((l) => matches(l.title, l.courseTitle));
  const filteredStudents = students.filter((s) => matches(s.name, s.email, s.country, (s.courses || []).join(" ")));

  const Frame = ({ children }) => (
    <div className="tdash">
      <div className="bg"><b className="a" /><b className="b2" /><b className="c" /></div>
      <div className="vignette" />
      {children}
    </div>
  );

  if (loading) {
    return <Frame><div style={{ display: "grid", placeItems: "center", minHeight: "100vh", color: "var(--muted)" }}>Loading dashboard…</div></Frame>;
  }
  if (error) {
    return (
      <Frame>
        <div style={{ display: "grid", placeItems: "center", minHeight: "100vh", textAlign: "center", color: "var(--muted)" }}>
          <div>
            <p style={{ color: "#fca5a5", marginBottom: 14 }}>{error}</p>
            <button className="btn" onClick={fetchData}>Retry</button>
          </div>
        </div>
      </Frame>
    );
  }

  // ── Course detail (section management) ──────────────────────────────────────
  if (selectedCourse) {
    return (
      <Frame>
        <div className="dmain" style={{ maxWidth: 820, margin: "0 auto" }}>
          <button className="btn ghost" style={{ marginBottom: 18 }} onClick={() => setSelectedCourse(null)}>
            <ArrowLeft size={16} /> Back to dashboard
          </button>
          <div className="dcard" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
              <div>
                <h3 style={{ fontSize: 20, marginBottom: 6 }}>{selectedCourse.title}</h3>
                <p style={{ color: "var(--muted)", fontSize: 13 }}>{selectedCourse.description}</p>
              </div>
              <span className="dstat" style={{ padding: "6px 12px", fontSize: 12, color: selectedCourse.isPublished ? "var(--greenL)" : "var(--orangeL)" }}>
                {selectedCourse.isPublished ? "Published" : "Pending"}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ fontFamily: "var(--display)", fontSize: 16 }}>Sections</h3>
            <button className="btn" onClick={() => setShowSectionForm(true)}><Plus size={16} /> Create section</button>
          </div>
          {showSectionForm && (
            <SectionForm onClose={() => setShowSectionForm(false)} onSubmit={async (d) => {
              try { await createSection(selectedCourse._id, d); setShowSectionForm(false); await refreshSelectedCourse(selectedCourse._id); }
              catch (err) { alert("Failed to create section: " + err.message); }
            }} />
          )}
          {editSection && (
            <SectionForm initialData={editSection} onClose={() => setEditSection(null)} onSubmit={async (d) => {
              try { await updateSection(selectedCourse._id, editSection._id, d); setEditSection(null); await refreshSelectedCourse(selectedCourse._id); }
              catch (err) { alert("Failed to update section: " + err.message); }
            }} />
          )}
          <SectionList sections={selectedCourse.sections} onEdit={setEditSection} onDelete={async (section) => {
            if (!window.confirm("Delete this section?")) return;
            try { await deleteSection(selectedCourse._id, section._id); await refreshSelectedCourse(selectedCourse._id); }
            catch (err) { alert("Failed to delete section: " + err.message); }
          }} />

          {selectedCourse.studyKit && (
            <div style={{ marginTop: 22 }}>
              <h3 style={{ fontFamily: "var(--display)", fontSize: 16, marginBottom: 10 }}>✦ AI study kit</h3>
              <p style={{ color: "var(--muted)", fontSize: 12, marginBottom: 10 }}>
                Generated from your PDF and saved with the course — your students study these.
              </p>
              <StudyKitView kit={selectedCourse.studyKit} />
            </div>
          )}
        </div>
      </Frame>
    );
  }

  const navItem = (key, label, extra = null) => (
    <a className={view === key ? "on" : ""} onClick={() => setView(key)}>{label} {extra}</a>
  );
  const showSearch = ["dashboard", "students", "lessons"].includes(view);
  const showUpload = ["dashboard", "lessons"].includes(view);
  const [headTitle, headSub] = VIEW_HEADER[view];

  // ── Main dashboard shell ────────────────────────────────────────────────────
  return (
    <Frame>
      <div className="dash">
        <aside className="dside">
          <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
            <defs>
              <linearGradient id="tdBrandGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#a78bfa" />
                <stop offset="1" stopColor="#67e8f9" />
              </linearGradient>
            </defs>
          </svg>
          <span className="dbrand">
            <svg className="mk" viewBox="-7 -5 14 11" aria-hidden="true">
              <g fill="url(#tdBrandGrad)">
                <path fillRule="evenodd" d="M-3.474 -1.935L-2.903 -4.312L-0.864 -2.883L-2.695 -3.727L-3.071 -2.039L-1.591 -2.221L-5.682 -1.169L0.019 2.805L5.643 -1.156L1.591 -2.221L3.123 -2.039L2.721 -3.779L0.812 -3L2.994 -4.312L3.552 -1.935L6.5 -1.429L4.448 0.195L6.123 1.662L3.097 2.169L2.513 4.273L-0.006 2.922L-2.422 4.312L-3.071 2.195L-6.123 1.714L-4.435 0.169L-6.5 -1.403Z M-2.877 1.948L-2.422 3.532L-1.539 2.208L-4.058 0.403L-5.435 1.532Z M3.968 0.39L1.734 2L1.539 2.208L2.357 3.532L2.799 1.987L5.357 1.416Z" />
                <path d="M1.136 -1.935L2.695 -0.74L0.864 1.779L0.032 -1.416L-0.799 1.766L-2.786 -0.597L-1.071 -2.065L-0.019 -3.286Z" />
              </g>
            </svg>
            EXZELLENT <small>Teacher</small>
          </span>
          <nav className="dnav">
            {navItem("dashboard", "📊 Dashboard")}
            {navItem("students", "👥 Students", activeStudents != null && <span className="badge">{activeStudents}</span>)}
            {navItem("lessons", "📚 Lessons", lessonCount ? <span className="badge">{lessonCount}</span> : null)}
            <a onClick={() => setShowCalendar(true)}>📅 Calendar</a>
            <a onClick={() => { setMessageWith(null); setShowMessages(true); }}>💬 Messages</a>
            <a onClick={() => setShowAssignments(true)}>🎤 Assignments</a>
            <a onClick={goAiEngine}>✦ AI Engine</a>
            <a onClick={() => openAiTools("exam")}>🧰 AI Tools</a>
            <a onClick={() => setShowSpeech(true)}>🎙️ Speech Analyzer</a>
            {navItem("earnings", "💶 Earnings")}
            {navItem("settings", "⚙️ Settings")}
          </nav>
          <div className="duser">
            <span className="av">{initials}</span>
            <div><b>{firstName} {teacherData?.lastName || ""}</b><span>Tutor{teacherData?.countryOfResidence ? " · " + teacherData.countryOfResidence : ""}</span></div>
            <button className="logout" onClick={logout} title="Log out">⎋</button>
          </div>
        </aside>

        <main className="dmain">
          <div className="dtop">
            <div>
              <h1>{view === "dashboard" ? <>Welcome back, {firstName} 👋</> : headTitle}</h1>
              <p>{headSub}</p>
            </div>
            <div className="dtop-r">
              {showSearch && (
                <input
                  className="dsearch"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={view === "students" ? "🔍 Search students…" : "🔍 Search courses, lessons…"}
                />
              )}
              {showUpload && <button className="btn" onClick={() => setShowEngine(true)}>⬆ Upload PDF</button>}
            </div>
          </div>

          {/* ── DASHBOARD ────────────────────────────────────────────── */}
          {view === "dashboard" && (
            <>
              <div className="dstats">
                <div className="dstat" style={{ cursor: "pointer" }} onClick={() => setView("earnings")} title="View earnings">
                  <span className="di"><Wallet size={18} /></span>
                  <span>Earnings · this month</span>
                  <b>{earnMonth != null ? euroFull(earnMonth) : "—"}</b>
                  {earnMonth != null && earnDelta !== 0 && (
                    <i className="up" style={earnDelta < 0 ? { color: "var(--orangeL)" } : undefined}>
                      {earnDelta > 0 ? "▲" : "▼"} {Math.abs(earnDelta)}%
                    </i>
                  )}
                </div>
                <div className="dstat">
                  <span className="di"><BookOpen size={18} /></span>
                  <span>Published courses</span><b>{publishedCount} <small>/{totalCourses}</small></b>
                </div>
                <div className="dstat" style={{ cursor: "pointer" }} onClick={() => setView("students")} title="View students">
                  <span className="di"><Users size={18} /></span>
                  <span>Active students</span>
                  <b>{activeStudents != null ? activeStudents : "—"}</b>
                  {activeStudents != null && newStudents > 0 && <i className="up">▲ {newStudents} new</i>}
                </div>
                <div className="dstat" style={{ cursor: "pointer" }} onClick={() => openAiTools("exam")} title="Open AI Tools">
                  <span className="di"><Sparkles size={18} /></span>
                  <span>AI generations</span><b>{aiGenerations.toLocaleString("en-US")}</b>
                </div>
              </div>

              <div className="dpanel" ref={aiPanelRef}>
                <div className="dph">
                  <span className="tag2">AI Content Engine</span>
                  <h2>Upload once. We make 9 formats.</h2>
                  <p>Drop a PDF — instantly get a full study kit: course outline, flashcards, a quiz and a summary.</p>
                </div>
                <div className="dengine">
                  <div className="ddrop" onClick={() => setShowEngine(true)} style={{ cursor: "pointer" }}>
                    <span className="big">⬆</span><b>Drop your PDF</b><span>PDF · text-based · click to browse</span>
                    <button className="btn ghost" style={{ marginTop: 8 }} onClick={(e) => { e.stopPropagation(); setShowEngine(true); }}>Browse files</button>
                  </div>
                  <div className="dformats">
                    {FORMATS.map((f) => (
                      <div className="fmt" key={f.label} onClick={() => setShowEngine(true)} title="Open the AI Content Engine">
                        <span className="fi" style={{ background: `rgba(${f.c},.16)` }}>{f.icon}</span>{f.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="dbottom">
                <div className="dcard">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <h3 style={{ margin: 0 }}>Your courses</h3>
                    <button className="btn" style={{ padding: "7px 14px", fontSize: 12.5 }} onClick={() => setShowCourseForm(true)}><Plus size={14} /> New</button>
                  </div>
                  {courses.length === 0 ? (
                    <p className="empty">No courses yet — upload your first to get started.</p>
                  ) : filteredCourses.length === 0 ? (
                    <p className="empty">No courses match “{query}”.</p>
                  ) : (
                    filteredCourses.slice(0, 6).map((c) => (
                      <div className="les" key={c._id}>
                        <span className="t">{c.isPublished ? <CheckCircle size={16} /> : <Clock size={16} />}</span>
                        <span className="info"><b>{c.title}</b><span>{c.language || "Course"} · {c.level || "—"} · {c.isPublished ? "Published" : "Pending"}</span></span>
                        <span className="cactions">
                          <button className="prep" onClick={() => setSelectedCourse(c)} title="Manage sections">Manage</button>
                          <button className="cicon" onClick={() => openEditCourse(c)} title="Edit course details">✎</button>
                          <button className="cicon" onClick={() => handleTogglePublish(c)} disabled={busyCourse === c._id} title={c.isPublished ? "Unpublish" : "Publish"}>{c.isPublished ? "⏸" : "▲"}</button>
                          <button className="cicon danger" onClick={() => handleDeleteCourse(c)} disabled={busyCourse === c._id} title="Delete course">🗑</button>
                        </span>
                      </div>
                    ))
                  )}
                </div>
                <div className="dcard">
                  <h3>Earnings · last 6 months</h3>
                  {monthly.length ? (
                    <div className="dchart">
                      {monthly.map((m, i) => (
                        <div className="col" key={m.label + i}>
                          <span className="vl">{euro(m.value)}</span>
                          <div className="bar" style={{ height: Math.round((m.value / chartMax) * 100) + "%" }} />
                          <span className="lb">{m.label}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="empty">No earnings data yet.</p>
                  )}
                </div>
              </div>

              <p className="note">
                {live
                  ? `✅ Live data · ${lessonCount} lessons across ${totalCourses} courses. Earnings, students and the chart update as you publish, add lessons and enroll students.`
                  : "📊 Earnings and students appear once the platform reports them — course counts and lessons above are live."}
              </p>
            </>
          )}

          {/* ── STUDENTS ─────────────────────────────────────────────── */}
          {view === "students" && (
            <div className="dcard">
              {students.length === 0 ? (
                <p className="empty">No students enrolled yet.</p>
              ) : filteredStudents.length === 0 ? (
                <p className="empty">No students match “{query}”.</p>
              ) : (
                filteredStudents.map((s) => (
                  <div className="les" key={s._id}>
                    <span className="av" style={{ width: 34, height: 34 }}>{(s.name || "?").slice(0, 1).toUpperCase()}</span>
                    <span className="info">
                      <b>{s.name}</b>
                      <span>{[s.country, (s.courses || []).join(", ") || `${s.courseCount} courses`, agoLabel(s.recentMonthsAgo)].filter(Boolean).join(" · ")}</span>
                    </span>
                    <span className="cactions">
                      <span className="amt">{euroFull(s.totalPaid)}</span>
                      <button className="cicon" onClick={() => { setMessageWith(s._id); setShowMessages(true); }} title={`Message ${s.name}`}>✉</button>
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── LESSONS ──────────────────────────────────────────────── */}
          {view === "lessons" && (
            <div className="dcard">
              {allLessons.length === 0 ? (
                <p className="empty">No lessons yet — open a course and add sections.</p>
              ) : filteredLessons.length === 0 ? (
                <p className="empty">No lessons match “{query}”.</p>
              ) : (
                filteredLessons.map((l, i) => (
                  <div className="les" key={l._id || i}>
                    <span className="t">📖</span>
                    <span className="info"><b>{l.title}</b><span>{l.courseTitle}</span></span>
                    <button className="prep" onClick={() => setSelectedCourse(l.course)}>Manage</button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── EARNINGS ─────────────────────────────────────────────── */}
          {view === "earnings" && (
            <>
              <div className="dstats">
                <div className="dstat"><span>Total earned</span><b>{earnings ? euroFull(earnings.total) : "—"}</b></div>
                <div className="dstat">
                  <span>This month</span>
                  <b>{earnings ? euroFull(earnings.thisMonth) : "—"}</b>
                  {earnings && earnings.deltaPct !== 0 && (
                    <i className="up" style={earnings.deltaPct < 0 ? { color: "var(--orangeL)" } : undefined}>
                      {earnings.deltaPct > 0 ? "▲" : "▼"} {Math.abs(earnings.deltaPct)}%
                    </i>
                  )}
                </div>
                <div className="dstat"><span>Last month</span><b>{earnings ? euroFull(earnings.lastMonth) : "—"}</b></div>
                <div className="dstat"><span>Paying students</span><b>{activeStudents != null ? activeStudents : "—"}</b></div>
              </div>

              <div className="dbottom">
                <div className="dcard">
                  <h3>Revenue by course</h3>
                  {earnings?.byCourse?.length ? (
                    earnings.byCourse.map((c) => (
                      <div className="les" key={c._id}>
                        <span className="info"><b>{c.title}</b><span>{c.students} student{c.students === 1 ? "" : "s"}</span></span>
                        <span className="amt">{euroFull(c.revenue)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="empty">No revenue yet.</p>
                  )}
                </div>
                <div className="dcard">
                  <h3>Earnings · last 6 months</h3>
                  {earnings?.monthly?.length ? (
                    <div className="dchart">
                      {earnings.monthly.map((m, i) => {
                        const max = Math.max(1, ...earnings.monthly.map((x) => x.value));
                        return (
                          <div className="col" key={m.label + i}>
                            <span className="vl">{euro(m.value)}</span>
                            <div className="bar" style={{ height: Math.round((m.value / max) * 100) + "%" }} />
                            <span className="lb">{m.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="empty">No earnings data yet.</p>
                  )}
                </div>
              </div>

              <div className="dcard" style={{ marginTop: 16 }}>
                <h3>Recent transactions</h3>
                {earnings?.recent?.length ? (
                  earnings.recent.map((t, i) => (
                    <div className="les" key={i}>
                      <span className="t" style={{ width: 90 }}>{t.date}</span>
                      <span className="info"><b>{t.student}</b><span>{t.course}</span></span>
                      <span className="amt" style={{ color: "var(--greenL)" }}>+{euroFull(t.amount)}</span>
                    </div>
                  ))
                ) : (
                  <p className="empty">No transactions yet.</p>
                )}
              </div>
            </>
          )}

          {/* ── SETTINGS ─────────────────────────────────────────────── */}
          {view === "settings" && (
            <div className="dcard" style={{ maxWidth: 600 }}>
              <h3>Teacher profile</h3>
              <div className="dform">
                <div className="drow2">
                  <div className="dfield">
                    <label>First name</label>
                    <input value={profileForm.firstName} onChange={(e) => setProfileForm((p) => ({ ...p, firstName: e.target.value }))} />
                  </div>
                  <div className="dfield">
                    <label>Last name</label>
                    <input value={profileForm.lastName} onChange={(e) => setProfileForm((p) => ({ ...p, lastName: e.target.value }))} />
                  </div>
                </div>
                <div className="dfield">
                  <label>Country</label>
                  <input value={profileForm.countryOfResidence} onChange={(e) => setProfileForm((p) => ({ ...p, countryOfResidence: e.target.value }))} />
                </div>
                <div className="dfield">
                  <label>Subjects (comma separated)</label>
                  <input value={profileForm.subjects} onChange={(e) => setProfileForm((p) => ({ ...p, subjects: e.target.value }))} placeholder="German, English" />
                </div>
                <div className="dfield">
                  <label>Bio</label>
                  <textarea value={profileForm.bio} onChange={(e) => setProfileForm((p) => ({ ...p, bio: e.target.value }))} placeholder="Tell students about yourself…" />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <button className="btn" onClick={saveProfile} disabled={savingProfile}>
                    {savingProfile ? "Saving…" : "Save changes"}
                  </button>
                  {profileMsg === "ok" && <span className="dmsg ok">Saved ✓</span>}
                  {profileMsg === "err" && <span className="dmsg err">Couldn't save. Try again.</span>}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {showCourseForm && <TeacherCourseForm onClose={() => setShowCourseForm(false)} onSubmit={handleCreateCourse} isEdit={false} />}
      {editCourse && <TeacherCourseForm initialData={editCourse} onClose={() => setEditCourse(null)} onSubmit={handleUpdateCourse} isEdit={true} />}

      {showSpeech && <TeacherSpeechLab onClose={() => setShowSpeech(false)} />}
      {showCalendar && <CalendarPopup onClose={() => setShowCalendar(false)} />}
      {showMessages && <MessagesPanel openWithId={messageWith} onClose={() => { setShowMessages(false); setMessageWith(null); }} />}
      {showAssignments && <TeacherAssignments onClose={() => setShowAssignments(false)} students={students} me={{ _id: teacherData?._id, name: teacherData?.name }} />}
      {showEngine && <AiContentEngine onClose={() => setShowEngine(false)} context={{ onCreateCourse: createCourseFromAI }} />}
      {showAiTools && (
        <AiToolsHub
          role="teacher"
          initialTab={aiToolsTab}
          onClose={() => setShowAiTools(false)}
          context={{
            students,
            onCreateCourse: createCourseFromAI,
          }}
        />
      )}
      {/* Exzi companion - authenticated, so no prompt cap applies here. */}
      <ExziCompanion
        role="teacher"
        name={[teacherData?.firstName, teacherData?.lastName].filter(Boolean).join(" ") || teacherData?.name}
        userId={teacherData?._id}
      />
    </Frame>
  );
};

export default TeacherDashboard;
