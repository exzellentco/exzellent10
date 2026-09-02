import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard, Building2, Users, CalendarDays, CalendarCheck, Presentation,
  Video, ClipboardList, MessageSquare, FileBarChart, AlertTriangle, Wallet,
  BookOpen, Settings, Sparkles, Coins, Flame, GraduationCap, PenLine, Clock,
  RefreshCw, UserCheck, TrendingUp, ShieldCheck, Mic, Award, Trophy, Gift,
  UserPlus, Briefcase, Plug, Repeat,
} from "lucide-react";
import ExziCompanion from "../../components/Exzi/ExziCompanion";
import { apiUrl } from "../../APIs/apiBase";
import Sections from "./Sections";
import Calendar from "../Console/Calendar";
import LiveGate from "./LiveGate";
import { liveGet, livePost, isLive, MOCK_ONLY, downloadCsv } from "./liveApi";

/**
 * MERGED DASHBOARD — local prototype, not part of the shipped app.
 *
 * Al Huda LMS is the base here: its green palette (forest sidebar, #13ec37
 * accent, sage page), its 1rem radius, and its sidebar navigation — Dashboard,
 * Departments, Students, Time Table, Attendance, Lectures, Online Class, Tasks,
 * Messages, Reports, Complaints, Payroll, Homework, Settings.
 *
 * What Exzellent adds is layered on and marked with a small "EXZ" badge in the
 * sidebar so it stays obvious which side each feature came from: the Exzi AI
 * companion, the credit wallet, course progress, and live class joining.
 *
 * Data is from the mock backend. The role switcher is a prototype affordance;
 * in a real build the role comes from the signed-in user.
 */

const get = async (p) => {
  const r = await fetch(apiUrl(p));
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.success === false) throw new Error(j.message || "Request failed");
  return j.data;
};
const post = async (p, body) => {
  const r = await fetch(apiUrl(p), {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  return (await r.json().catch(() => ({}))).data;
};
const money = (n) => "€" + Number(n || 0).toLocaleString("de-DE");

/* Al Huda's own sidebar order, filtered per role. `exz` marks a section that
   comes from Exzellent rather than the LMS. */
const NAV = {
  admin: [
    { k: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { head: "Academy" },
    { k: "departments", label: "Departments", icon: Building2 },
    { k: "students", label: "Students", icon: Users },
    { k: "supervisors", label: "Supervisors", icon: ShieldCheck },
    { k: "calendar", label: "Calendar", icon: CalendarDays },
    { k: "attendance", label: "Attendance", icon: CalendarCheck },
    { k: "lectures", label: "Lectures", icon: Presentation },
    { k: "online", label: "Online Class", icon: Video, exz: true },
    { head: "Learning" },
    { k: "courses", label: "Courses", icon: BookOpen, exz: true },
    { k: "webinars", label: "Webinars", icon: Presentation, exz: true },
    { k: "community", label: "Community", icon: MessageSquare, exz: true },
    { k: "aitools", label: "AI Tools", icon: Sparkles, exz: true },
    { k: "speech", label: "Speech Lab", icon: Mic, exz: true },
    { k: "certificates", label: "Certificates", icon: Award, exz: true },
    { head: "Operations" },
    { k: "tasks", label: "Tasks", icon: ClipboardList },
    { k: "complaints", label: "Complaints", icon: AlertTriangle },
    { k: "payroll", label: "Payroll", icon: Wallet },
    { k: "reports", label: "Reports", icon: FileBarChart },
    { k: "platforms", label: "Platforms", icon: Plug },
    { head: "Growth" },
    { k: "credits", label: "Credits & plans", icon: Coins, exz: true },
    { k: "referrals", label: "Referrals", icon: Gift, exz: true },
    { k: "affiliates", label: "Affiliates", icon: TrendingUp, exz: true },
    { k: "waitlist", label: "Waitlist", icon: UserPlus, exz: true },
    { k: "jobs", label: "Jobs", icon: Briefcase, exz: true },
    { head: "System" },
    { k: "messages", label: "Messages", icon: MessageSquare },
    { k: "settings", label: "Settings", icon: Settings },
  ],
  teacher: [
    { k: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { head: "Teaching" },
    { k: "classes", label: "Today's classes", icon: CalendarCheck },
    { k: "roster", label: "My students", icon: Users },
    { k: "homework", label: "Homework", icon: BookOpen },
    { k: "lectures", label: "My lectures", icon: Presentation },
    { k: "online", label: "Online Class", icon: Video, exz: true },
    { k: "calendar", label: "Calendar", icon: CalendarDays },
    { k: "availability", label: "Availability", icon: Clock },
    { head: "Tools" },
    { k: "aitools", label: "AI Tools", icon: Sparkles, exz: true },
    { k: "speech", label: "Speech Lab", icon: Mic, exz: true },
    { k: "courses", label: "My courses", icon: BookOpen, exz: true },
    { head: "Mine" },
    { k: "earnings", label: "Earnings", icon: Wallet },
    { k: "messages", label: "Messages", icon: MessageSquare },
    { k: "settings", label: "Settings", icon: Settings },
  ],
  student: [
    { k: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { head: "Learning" },
    { k: "courses", label: "My courses", icon: BookOpen, exz: true },
    { k: "calendar", label: "Calendar", icon: CalendarDays },
    { k: "lessons", label: "My lessons", icon: CalendarDays },
    { k: "homework", label: "Homework", icon: PenLine },
    { k: "attendance", label: "My attendance", icon: CalendarCheck },
    { k: "online", label: "Online Class", icon: Video, exz: true },
    { head: "Practice" },
    { k: "speech", label: "Speech Lab", icon: Mic, exz: true },
    { k: "review", label: "Daily review", icon: Repeat, exz: true },
    { k: "aitools", label: "AI Tools", icon: Sparkles, exz: true },
    { k: "webinars", label: "Webinars", icon: Presentation, exz: true },
    { k: "community", label: "Community", icon: MessageSquare, exz: true },
    { head: "Progress" },
    { k: "certificates", label: "Certificates", icon: Award, exz: true },
    { k: "leaderboard", label: "Leaderboard", icon: Trophy, exz: true },
    { k: "credits", label: "Credits", icon: Coins, exz: true },
    { k: "referrals", label: "Refer a friend", icon: Gift, exz: true },
    { head: "System" },
    { k: "messages", label: "Messages", icon: MessageSquare },
    { k: "settings", label: "Settings", icon: Settings },
  ],
};

const Stat = ({ icon, label, value, sub, tone }) => (
  <div className="alh-stat" data-tone={tone}>
    <span className="alh-stat-ico">{icon}</span>
    <div><b>{value}</b><span>{label}</span>{sub && <i>{sub}</i>}</div>
  </div>
);

const Card = ({ title, tag, from, children }) => (
  <section className="alh-card">
    <header>
      <h3>{title}</h3>
      {tag != null && <span className="alh-tag">{tag}</span>}
      {from && <span className="alh-from">{from}</span>}
    </header>
    {children}
  </section>
);

const Bar = ({ pct }) => <div className="alh-bar"><span style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} /></div>;
const Soon = ({ what }) => <p className="alh-muted">{what} — not built in this prototype.</p>;

const MergedDashboard = () => {
  const [role, setRole] = useState("admin");
  const [live, setLive] = useState(isLive());
  const [view, setView] = useState("dashboard");
  const [d, setD] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // When live, the real backend supplies everything it actually has and the
  // demo data fills only the sections that were never built server-side.
  const loadLive = useCallback(async (base) => {
    const pick = (r) => (r.status === "fulfilled" ? r.value : null);
    const [providers, courses, webinars, community, bookings, messages, streak] = await Promise.all([
      liveGet("/api/calendar/providers").catch(() => null),
      liveGet("/api/courses").catch(() => null),
      liveGet("/api/webinars").catch(() => null),
      liveGet("/api/community/posts").catch(() => null),
      liveGet("/api/calendar/bookings?role=" + role).catch(() => null),
      liveGet("/api/messages").catch(() => null),
      liveGet("/api/streak").catch(() => null),
    ].map((pr) => pr.then((v) => ({ status: "fulfilled", value: v })).catch(() => ({ status: "rejected" }))))
      .then((rs) => rs.map(pick));

    const list = (r) => (Array.isArray(r) ? r : r?.data) || [];
    const teachers = list(providers);
    const bk = list(bookings);

    // The operations half now exists on the backend, so it loads live as well.
    // Each is optional: a 403 for this role should not blank the whole page.
    const [payroll, complaints, tasks, supervisors, platforms, lectures, certificates, leaderboard, reports] =
      await Promise.all([
        liveGet("/api/payroll"), liveGet("/api/complaints"), liveGet("/api/tasks"),
        liveGet("/api/supervisors"), liveGet("/api/platforms"), liveGet("/api/lectures"),
        liveGet("/api/certificates"), liveGet("/api/leaderboard"), liveGet("/api/reports"),
      ].map((pr) => pr.then((v) => v?.data ?? v).catch(() => null)));

    const x = {
      ...base.x,
      supervisors: supervisors || base.x.supervisors,
      platforms: platforms || base.x.platforms,
      lectures: lectures || base.x.lectures,
      certificates: certificates || base.x.certificates,
      leaderboard: leaderboard || base.x.leaderboard,
      reports: reports || base.x.reports,
      courses: list(courses).map((c) => ({
        _id: String(c._id), title: c.title, level: c.level || "—",
        students: c.enrolledCount || 0, lessons: (c.sections || []).length, published: c.isPublished !== false,
      })),
      webinars: list(webinars).map((w) => ({
        _id: String(w._id), title: w.title, when: w.date || w.startTime || "—",
        signups: (w.participants || []).length, free: true,
      })),
      community: list(community).map((c) => ({
        _id: c._id, author: c.authorName, space: c.space,
        text: c.text, likes: (c.likes || []).length, comments: (c.comments || []).length,
      })),
      messages: list(messages).map((m) => ({
        _id: m._id, who: m.fromName || m.toName, role: m.fromRole || "", text: m.text,
        when: new Date(m.date).toLocaleString(), unread: !m.read,
      })),
    };

    const attendance = bk.map((b) => ({
      _id: b._id, student: b.studentName || "—", cls: b.title, time: b.start,
      teacher: b.teacherName, status: (b.attendance || []).length ? "present" : "absent",
    }));

    return {
      ...base,
      x,
      // The calendar needs the dated rows themselves, not just the derived
      // attendance list, so keep them.
      bookings: bk,
      payroll: payroll || base.payroll,
      complaints: complaints || base.complaints,
      tasks: tasks || base.tasks,
      staff: teachers.map((t) => ({ _id: t._id, name: t.name, role: "Teacher", dept: t.location || "—", email: "" })),
      attendance: attendance.length ? attendance : base.attendance,
      summary: {
        ...base.summary,
        students: base.summary?.students ?? 0,
        teachers: teachers.length,
        lessonsBooked: bk.length,
        attendanceRate: attendance.length
          ? Math.round((attendance.filter((a) => a.status === "present").length / attendance.length) * 100) : 0,
      },
      me: { ...base.me, streak: streak?.streak?.count ?? base.me?.streak },
      liveNote: `${teachers.length} teachers · ${bk.length} bookings · ${list(community).length} posts from production`,
    };
  }, [role]);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const extra = await get("/api/ops/extra");
      if (role === "admin") {
        const [summary, payroll, complaints, tasks, attendance, staff] = await Promise.all([
          get("/api/ops/summary"), get("/api/ops/payroll"), get("/api/ops/complaints"),
          get("/api/ops/tasks"), get("/api/ops/attendance"), get("/api/ops/staff"),
        ]);
        const base = { summary, payroll, complaints, tasks, attendance, staff, x: extra };
        setD(live ? await loadLive(base) : base);
      } else {
        const base = { me: await get(`/api/ops/me/${role}`), x: extra };
        setD(live ? await loadLive(base) : base);
      }
    } catch (e) { setError(e.message || "Could not load."); }
    finally { setLoading(false); }
  }, [role, live, loadLive]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setView("dashboard"); }, [role]);

  const me = d.me || {};
  const s = d.summary || {};
  const open = useMemo(() => (d.complaints || []).filter((c) => c.status !== "resolved"), [d.complaints]);
  const dueHw = (me.homework || []).filter((h) => h.status !== "done").length;

  /* Which lessons this role should see. Live is already scoped by the backend
     query; on demo data this filter stands in for that, using the same two
     identities the mock's per-role views use. */
  const bookings = useMemo(() => {
    const all = d.bookings || d.x?.calendar || [];
    if (live || role === "admin") return all;
    if (role === "teacher") return all.filter((b) => b.teacherName === "Lena Hoffmann");
    return all.filter((b) => b.studentName === "Anna Muller");
  }, [d.bookings, d.x, role, live]);

  const joinLesson = (b) => {
    if (b.meetingUrl) window.open(b.meetingUrl, "_blank", "noopener");
  };

  const resolve = async (id) => {
    if (live) {
      try { await livePost(`/api/complaints/${id}/resolve`); await load(); return; }
      catch (e) { setError(e.message); return; }
    }
    await post("/api/ops/complaints/resolve", { id });
    setD((x) => ({ ...x, complaints: x.complaints.map((c) => (c._id === id ? { ...c, status: "resolved" } : c)) })); };
  const toggle = async (id) => {
    if (live) {
      try { await livePost(`/api/tasks/${id}/toggle`); await load(); return; }
      catch (e) { setError(e.message); return; }
    }
    const t = await post("/api/ops/tasks/toggle", { id });
    if (t) setD((x) => ({ ...x, tasks: x.tasks.map((y) => (y._id === id ? t : y)) })); };
  const mark = async (id, status) => {
    // Live: recording attendance is a real write against the booking.
    if (live && status === "present") {
      try {
        await livePost(`/api/calendar/bookings/${id}/attend`);
        setD((x) => ({ ...x, attendance: x.attendance.map((y) => (y._id === id ? { ...y, status: "present" } : y)) }));
        return;
      } catch (e) { setError(e.message); return; }
    }
    const a = await post("/api/ops/attendance/mark", { id, status });
    if (a) setD((x) => ({ ...x, attendance: x.attendance.map((y) => (y._id === id ? a : y)) }));
  };

  /** Post to the real community feed. */
  const createPost = async (text, space = "lounge") => {
    if (!text.trim()) return;
    if (!live) { setError("Connect to production to post for real."); return; }
    try {
      await livePost("/api/community/posts", { text, space });
      await load();
    } catch (e) { setError(e.message); }
  };
  /** Like a real post; the endpoint toggles. */
  const likePost = async (id) => {
    if (!live) { setError("Connect to production to react for real."); return; }
    try { await livePost(`/api/community/posts/${id}/like`); await load(); }
    catch (e) { setError(e.message); }
  };
  /** Send a real direct message. */
  const sendMessage = async (toId, text) => {
    if (!text.trim()) return;
    if (!live) { setError("Connect to production to send for real."); return; }
    try { await livePost("/api/messages", { toId, text }); await load(); }
    catch (e) { setError(e.message); }
  };

  /** Mark a payslip paid — real when connected. */
  const payStaff = async (id) => {
    if (!live) { setError("Connect to production to mark payroll paid."); return; }
    try { await livePost(`/api/payroll/${id}/pay`); await load(); }
    catch (e) { setError(e.message); }
  };

  /** Run a report and hand the rows back as a CSV file. */
  const runReport = async (reportId) => {
    if (!live) { setError("Connect to production to export real data."); return; }
    try {
      const r = await liveGet(`/api/reports/${reportId}`);
      const rows = r.rows || r.byDepartment || [];
      if (!downloadCsv(rows, `exzellent-${reportId}-${new Date().toISOString().slice(0, 10)}.csv`)) {
        setError("That report has no rows yet.");
      }
    } catch (e) { setError(e.message); }
  };

  const badge = (k) => {
    if (role === "admin" && k === "complaints" && open.length) return open.length;
    if (role === "teacher" && k === "homework" && (me.toGrade || []).length) return me.toGrade.length;
    if (role === "student" && k === "homework" && dueHw) return dueHw;
    return null;
  };

  const heading = {
    dashboard: ["Dashboard", { admin: "The whole academy at a glance.", teacher: "Your classes, students and pay.", student: "Your progress, lessons and homework." }[role]],
    departments: ["Departments", "Teams and who sits in them."],
    students: ["Students", "Everyone enrolled."],
    calendar: ["Calendar", "Every lesson, by date. Pick a day to see what is on."],
    attendance: [role === "student" ? "My attendance" : "Attendance", "Who turned up."],
    lectures: ["Lectures", "Delivered sessions and rates."],
    online: ["Online Class", "Live classes run inside the site."],
    tasks: ["Tasks", "Internal work and who owns it."],
    complaints: ["Complaints", "Raised by students and staff."],
    payroll: ["Payroll", "Monthly salaries across the academy."],
    reports: ["Reports", "Attendance, payroll and revenue exports."],
    credits: ["Credits & plans", "The Exzellent credit wallet."],
    messages: ["Messages", "Direct messages across roles."],
    settings: ["Settings", "Academy configuration."],
    courses: ["My courses", "Progress across everything you are taking."],
    lessons: ["My lessons", "Upcoming one-to-one classes."],
    homework: [role === "teacher" ? "Homework" : "Homework", role === "teacher" ? "Submissions waiting for you." : "What is due."],
    classes: ["Today's classes", "Your schedule for today."],
    roster: ["My students", "Everyone you teach."],
    availability: ["Availability", "When you can be booked."],
    earnings: ["Earnings", "What you have earned."],
  }[view] || ["Dashboard", ""];

  const initials = { admin: "AD", teacher: "LH", student: "AM" }[role];

  return (
    <>
      <div className="alh" data-role={role}>
        {/* ─── sidebar ─── */}
        <aside className="alh-side">
          <div className="alh-brand">
            <span><GraduationCap size={17} /></span>
            <div>Exzellent<small>{role === "admin" ? "Academy console" : role === "teacher" ? "Teaching" : "Learning"}</small></div>
          </div>

          <nav className="alh-nav">
            {NAV[role].map((item, i) =>
              item.head ? (
                <div key={"h" + i} className="alh-navhead">{item.head}</div>
              ) : (
                <button key={item.k} className={view === item.k ? "on" : ""} onClick={() => setView(item.k)}>
                  <item.icon size={16} />
                  <span>{item.label}</span>
                  {badge(item.k) && <em>{badge(item.k)}</em>}
                </button>
              )
            )}
          </nav>

          <div className="alh-side-foot">
            <div className="alh-role" role="tablist" aria-label="Preview a role">
              {["student", "teacher", "admin"].map((r) => (
                <button key={r} className={role === r ? "on" : ""} onClick={() => setRole(r)}>
                  {r[0].toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ─── main ─── */}
        <div className="alh-main">
          <header className="alh-top">
            <div>
              <span className="alh-eyebrow">
                {role === "admin" ? "Academy" : role === "teacher" ? "Teaching" : "Learning"}
              </span>
              <h1>{heading[0]}</h1>
              <p>{heading[1]}</p>
            </div>
            <div className="alh-top-actions">
              <LiveGate live={live} setLive={setLive} onChange={load} />
              <button className="alh-btn" onClick={load} disabled={loading}>
                <RefreshCw size={14} /> {loading ? "Loading…" : "Refresh"}
              </button>
              <div className="alh-who"><i>{initials}</i>{me.name || "Administrator"}</div>
            </div>
          </header>

          <div className="alh-body">
            {error && <div className="alh-error">{error}</div>}
            {live && d.liveNote && view === "dashboard" && (
              <p className="alh-livenote">Live from production — {d.liveNote}</p>
            )}
            {live && MOCK_ONLY.has(view) && (
              <p className="alh-livenote demo">
                This section has no endpoint on the backend yet, so it is still showing demo data.
              </p>
            )}
            {loading && <p className="alh-muted">Loading…</p>}

            {/* ══════════ ADMIN ══════════ */}
            {/* One calendar for all three roles: the rows differ, the view does not. */}
            {!loading && view === "calendar" && (
              <Calendar bookings={bookings} role={role} onJoin={joinLesson} />
            )}

            {!loading && role === "admin" && (
              <>
                {view === "dashboard" && (
                  <>
                    <div className="alh-stats">
                      <Stat icon={<Users size={19} />} label="Students enrolled" value={s.students ?? "—"} />
                      <Stat icon={<Presentation size={19} />} label="Teachers" value={s.teachers ?? "—"} tone="violet" />
                      <Stat icon={<CalendarCheck size={19} />} label="Attendance today" value={`${s.attendanceRate ?? 0}%`} tone="green" />
                      <Stat icon={<Wallet size={19} />} label="Payroll this month" value={money(s.payrollThisMonth)} tone="warn" />
                      <Stat icon={<AlertTriangle size={19} />} label="Complaints open" value={s.openComplaints ?? "—"} tone="danger" />
                      <Stat icon={<CalendarDays size={19} />} label="Lessons booked" value={s.lessonsBooked ?? "—"} tone="cyan" />
                    </div>
                    <div className="alh-grid2">
                      <Card title="Needs a decision" tag={open.length}>
                        {open.length === 0 && <p className="alh-muted">Nothing open.</p>}
                        <ul className="alh-list">
                          {open.slice(0, 4).map((c) => (
                            <li key={c._id}>
                              <span className={`alh-pri alh-pri-${c.priority}`}>{c.priority}</span>
                              <span className="alh-grow">{c.subject}<i>{c.from} · {c.role}</i></span>
                              <button className="alh-mini" onClick={() => resolve(c._id)}>Resolve</button>
                            </li>
                          ))}
                        </ul>
                      </Card>
                      <Card title="Today's classes" tag={(d.attendance || []).length}>
                        <ul className="alh-list">
                          {(d.attendance || []).map((a) => (
                            <li key={a._id}>
                              <span className="alh-time"><Clock size={13} /> {a.time}</span>
                              <span className="alh-grow">{a.cls}<i>{a.student} · {a.teacher}</i></span>
                              <span className={`alh-pill alh-${a.status}`}>{a.status}</span>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    </div>
                  </>
                )}

                {view === "departments" && (
                  <Card title="Departments" tag={[...new Set((d.staff || []).map((m) => m.dept))].length}>
                    <ul className="alh-list">
                      {[...new Set((d.staff || []).map((m) => m.dept))].map((dept) => (
                        <li key={dept}>
                          <span className="alh-stat-ico" style={{ width: 32, height: 32 }}><Building2 size={15} /></span>
                          <span className="alh-grow">{dept}
                            <i>{(d.staff || []).filter((m) => m.dept === dept).map((m) => m.name).join(", ")}</i></span>
                          <span className="alh-tag">{(d.staff || []).filter((m) => m.dept === dept).length}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {view === "students" && (
                  <Card title="Staff and people" tag={(d.staff || []).length}>
                    <table className="alh-table">
                      <thead><tr><th>Name</th><th>Role</th><th>Department</th><th>Email</th></tr></thead>
                      <tbody>{(d.staff || []).map((m) => (
                        <tr key={m._id}><td><b>{m.name}</b></td><td><span className="alh-chip">{m.role}</span></td>
                          <td>{m.dept}</td><td className="alh-muted">{m.email}</td></tr>
                      ))}</tbody>
                    </table>
                  </Card>
                )}

                {view === "payroll" && (
                  <Card title="Payroll" tag={money((d.payroll || []).reduce((t, p) => t + p.net, 0))}>
                    <table className="alh-table">
                      <thead><tr><th>Staff</th><th>Role</th><th>Base</th><th>Bonus</th><th>Deductions</th><th>Net</th><th>Status</th></tr></thead>
                      <tbody>{(d.payroll || []).map((p) => (
                        <tr key={p._id}>
                          <td><b>{p.staffName}</b><i className="alh-sub">{p.dept}</i></td>
                          <td><span className="alh-chip">{p.role}</span></td>
                          <td>{money(p.base)}</td>
                          <td className="alh-pos">{p.bonus ? "+" + money(p.bonus) : "—"}</td>
                          <td className="alh-neg">{p.deductions ? "−" + money(p.deductions) : "—"}</td>
                          <td><b>{money(p.net)}</b></td>
                          <td>
                            <span className={`alh-pill alh-${p.status}`}>{p.status}</span>
                            {p.status !== "paid" && (
                              <button className="alh-mini" onClick={() => payStaff(p._id)}>Mark paid</button>
                            )}
                          </td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </Card>
                )}

                {view === "complaints" && (
                  <Card title="Complaints" tag={`${open.length} open`}>
                    <ul className="alh-list">
                      {(d.complaints || []).map((c) => (
                        <li key={c._id}>
                          <span className={`alh-pri alh-pri-${c.priority}`}>{c.priority}</span>
                          <span className="alh-grow">{c.subject}<i>{c.from} · {c.role} · {c.createdAt}</i></span>
                          <span className={`alh-pill alh-${c.status}`}>{c.status}</span>
                          {c.status !== "resolved" && <button className="alh-mini" onClick={() => resolve(c._id)}>Resolve</button>}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {view === "tasks" && (
                  <Card title="Tasks" tag={`${(d.tasks || []).filter((t) => t.status === "done").length}/${(d.tasks || []).length}`}>
                    <ul className="alh-list">
                      {(d.tasks || []).map((t) => (
                        <li key={t._id}>
                          <input type="checkbox" className="alh-check" checked={t.status === "done"}
                                 onChange={() => toggle(t._id)} aria-label={`Mark "${t.title}" done`} />
                          <span className={`alh-grow ${t.status === "done" ? "alh-done" : ""}`}>
                            {t.title}<i>{t.owner} · due {t.due}{t.comments ? ` · ${t.comments} comments` : ""}</i></span>
                          <span className={`alh-pill alh-${t.status === "done" ? "done-p" : t.status}`}>{t.status}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {view === "attendance" && (
                  <Card title="Attendance today" tag={`${s.attendanceRate ?? 0}%`}>
                    <ul className="alh-list">
                      {(d.attendance || []).map((a) => (
                        <li key={a._id}>
                          <span className="alh-time"><Clock size={13} /> {a.time}</span>
                          <span className="alh-grow">{a.student}<i>{a.cls} · {a.teacher}</i></span>
                          <div className="alh-seg">
                            <button className={a.status === "present" ? "on" : ""} onClick={() => mark(a._id, "present")}>Present</button>
                            <button className={a.status === "absent" ? "on" : ""} onClick={() => mark(a._id, "absent")}>Absent</button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {view === "reports" && (
                  <Card title="Reports">
                    <ul className="alh-list">
                      <li><span className="alh-grow">Attendance report<i>per class and per student</i></span><button className="alh-mini">Export</button></li>
                      <li><span className="alh-grow">Payroll report<i>monthly, by department</i></span><button className="alh-mini">Export</button></li>
                      <li><span className="alh-grow">Revenue and credits<i>from Exzellent billing</i></span><button className="alh-mini">Export</button></li>
                    </ul>
                  </Card>
                )}

                {view === "credits" && (
                  <Card title="Credits & plans">
                    <div className="alh-stats">
                      <Stat icon={<Coins size={19} />} label="Credits issued" value={(s.creditsIssued ?? 0).toLocaleString()} tone="warn" />
                      <Stat icon={<CalendarDays size={19} />} label="Lessons booked" value={s.lessonsBooked ?? "—"} />
                    </div>
                    <ul className="alh-list">
                      <li><span className="alh-grow">Adjust a learner's credits<i>issue or revoke</i></span><button className="alh-mini">Open</button></li>
                      <li><span className="alh-grow">Teacher approvals<i>gates login and public listing</i></span>
                          <button className="alh-mini"><ShieldCheck size={13} /> Review</button></li>
                    </ul>
                  </Card>
                )}

                <Sections view={view} x={d.x} live={live} onPost={createPost} onLike={likePost}
                  onSend={sendMessage} onReport={runReport} />
              </>
            )}

            {/* ══════════ TEACHER ══════════ */}
            {!loading && role === "teacher" && (
              <>
                {view === "dashboard" && (
                  <>
                    <div className="alh-stats">
                      <Stat icon={<Wallet size={19} />} label="Earnings this month" value={money(me.earnings?.thisMonth)}
                            sub={`last month ${money(me.earnings?.lastMonth)}`} tone="warn" />
                      <Stat icon={<Presentation size={19} />} label="Lectures given" value={me.earnings?.lectures ?? "—"} tone="forest" />
                      <Stat icon={<Coins size={19} />} label="Rate per lecture" value={money(me.earnings?.rate)} />
                      <Stat icon={<Users size={19} />} label="My students" value={(me.roster || []).length} tone="forest" />
                      <Stat icon={<PenLine size={19} />} label="To grade" value={(me.toGrade || []).length} tone="danger" />
                      <Stat icon={<Clock size={19} />} label="Classes today" value={(me.classesToday || []).length} />
                    </div>
                    <div className="alh-grid2">
                      <Card title="Today's classes" tag={(me.classesToday || []).length}>
                        <ul className="alh-list">
                          {(me.classesToday || []).map((c) => (
                            <li key={c._id}>
                              <span className="alh-time"><Clock size={13} /> {c.time}</span>
                              <span className="alh-grow">{c.cls}<i>{c.student}</i></span>
                              <button className="alh-mini">Start</button>
                            </li>
                          ))}
                        </ul>
                      </Card>
                      <Card title="Waiting to be graded" tag={(me.toGrade || []).length}>
                        <ul className="alh-list">
                          {(me.toGrade || []).map((g) => (
                            <li key={g._id}>
                              <span className="alh-grow">{g.item}<i>{g.student} · {g.submitted}</i></span>
                              <button className="alh-mini">Grade</button>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    </div>
                  </>
                )}
                {view === "classes" && (
                  <Card title="Today's classes"><ul className="alh-list">
                    {(me.classesToday || []).map((c) => (
                      <li key={c._id}>
                        <span className="alh-time"><Clock size={13} /> {c.time}</span>
                        <span className="alh-grow">{c.cls}<i>{c.student}</i></span>
                        <span className={`alh-pill alh-${c.status}`}>{c.status}</span>
                        <button className="alh-mini">Start class</button>
                      </li>
                    ))}
                  </ul></Card>
                )}
                {view === "roster" && (
                  <Card title="My students" tag={(me.roster || []).length}>
                    <table className="alh-table">
                      <thead><tr><th>Student</th><th>Level</th><th>Attendance</th><th>Note</th></tr></thead>
                      <tbody>{(me.roster || []).map((r) => (
                        <tr key={r._id}><td><b>{r.student}</b></td><td><span className="alh-chip">{r.level}</span></td>
                          <td>{r.attended}</td><td className="alh-muted">{r.note}</td></tr>
                      ))}</tbody>
                    </table>
                  </Card>
                )}
                {view === "homework" && (
                  <Card title="Submissions to grade" tag={(me.toGrade || []).length}>
                    <ul className="alh-list">
                      {(me.toGrade || []).map((g) => (
                        <li key={g._id}>
                          <span className="alh-grow">{g.item}<i>{g.student} · submitted {g.submitted}</i></span>
                          <button className="alh-mini">Grade</button>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
                {view === "earnings" && (
                  <Card title="Earnings">
                    <div className="alh-stats">
                      <Stat icon={<Wallet size={19} />} label="This month" value={money(me.earnings?.thisMonth)} tone="warn" />
                      <Stat icon={<Wallet size={19} />} label="Last month" value={money(me.earnings?.lastMonth)} tone="forest" />
                      <Stat icon={<Presentation size={19} />} label="Lectures" value={me.earnings?.lectures ?? "—"} />
                      <Stat icon={<Coins size={19} />} label="Per lecture" value={money(me.earnings?.rate)} />
                    </div>
                  </Card>
                )}
                {view === "availability" && (
                  <Card title="My availability"><ul className="alh-list">
                    {(me.availability || []).map((a) => (
                      <li key={a.day}><span className="alh-grow"><b>{a.day}</b><i>{a.hours}</i></span>
                        <button className="alh-mini">Edit</button></li>
                    ))}
                  </ul></Card>
                )}
                <Sections view={view} x={d.x} live={live} onPost={createPost} onLike={likePost}
                  onSend={sendMessage} onReport={runReport} />
              </>
            )}

            {/* ══════════ STUDENT ══════════ */}
            {!loading && role === "student" && (
              <>
                {view === "dashboard" && (
                  <>
                    <div className="alh-stats">
                      <Stat icon={<Flame size={19} />} label="Day streak" value={me.streak ?? "—"} tone="warn" />
                      <Stat icon={<GraduationCap size={19} />} label="Current level" value={me.level ?? "—"} tone="forest" />
                      <Stat icon={<Coins size={19} />} label="Credits" value={(me.credits ?? 0).toLocaleString()} />
                      <Stat icon={<CalendarDays size={19} />} label="Upcoming lessons" value={(me.lessons || []).length} tone="forest" />
                      <Stat icon={<PenLine size={19} />} label="Homework due" value={dueHw} tone="danger" />
                      <Stat icon={<UserCheck size={19} />} label="Attendance"
                            value={`${me.attendance?.attended ?? 0}/${me.attendance?.booked ?? 0}`} />
                    </div>
                    <div className="alh-grid2">
                      <Card title="Next lessons" tag={(me.lessons || []).length}>
                        <ul className="alh-list">
                          {(me.lessons || []).map((l) => (
                            <li key={l._id}>
                              <span className="alh-grow">{l.cls}<i>{l.when} · {l.teacher}</i></span>
                              <span className={`alh-pill alh-${l.status}`}>{l.status}</span>
                            </li>
                          ))}
                        </ul>
                      </Card>
                      <Card title="Course progress">
                        <ul className="alh-list">
                          {(me.progress || []).map((c) => (
                            <li key={c.course} className="alh-block">
                              <div className="alh-rowtop"><b>{c.course}</b><span className="alh-muted">{c.lessons} · {c.pct}%</span></div>
                              <Bar pct={c.pct} />
                            </li>
                          ))}
                        </ul>
                      </Card>
                    </div>
                  </>
                )}
                {view === "courses" && (
                  <Card title="My courses" tag={(me.progress || []).length}>
                    <ul className="alh-list">
                      {(me.progress || []).map((c) => (
                        <li key={c.course} className="alh-block">
                          <div className="alh-rowtop"><b>{c.course}</b><span className="alh-muted">{c.lessons} · {c.pct}%</span></div>
                          <Bar pct={c.pct} />
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
                {view === "lessons" && (
                  <Card title="My lessons"><ul className="alh-list">
                    {(me.lessons || []).map((l) => (
                      <li key={l._id}>
                        <span className="alh-grow">{l.cls}<i>{l.when} · {l.teacher}</i></span>
                        <span className={`alh-pill alh-${l.status}`}>{l.status}</span>
                        <button className="alh-mini"><Video size={13} /> Join</button>
                      </li>
                    ))}
                  </ul></Card>
                )}
                {view === "homework" && (
                  <Card title="Homework" tag={`${dueHw} due`}><ul className="alh-list">
                    {(me.homework || []).map((h) => (
                      <li key={h._id}>
                        <span className={`alh-grow ${h.status === "done" ? "alh-done" : ""}`}>{h.title}<i>due {h.due}</i></span>
                        <span className={`alh-pill alh-${h.status === "done" ? "done-p" : h.status}`}>{h.status}</span>
                      </li>
                    ))}
                  </ul></Card>
                )}
                {view === "attendance" && (
                  <Card title="My attendance">
                    <div className="alh-stats">
                      <Stat icon={<UserCheck size={19} />} label="Attended" value={me.attendance?.attended ?? 0} />
                      <Stat icon={<CalendarDays size={19} />} label="Booked" value={me.attendance?.booked ?? 0} tone="forest" />
                      <Stat icon={<AlertTriangle size={19} />} label="Missed" value={me.attendance?.missed ?? 0} tone="danger" />
                    </div>
                  </Card>
                )}
                {view === "credits" && (
                  <Card title="Credits">
                    <div className="alh-stats">
                      <Stat icon={<Coins size={19} />} label="Balance" value={(me.credits ?? 0).toLocaleString()} tone="warn" />
                      <Stat icon={<TrendingUp size={19} />} label="Day streak" value={me.streak ?? "—"} />
                    </div>
                    <ul className="alh-list"><li><span className="alh-grow">Top up credits<i>card or plan</i></span>
                      <button className="alh-mini">Buy</button></li></ul>
                  </Card>
                )}
                <Sections view={view} x={d.x} live={live} onPost={createPost} onLike={likePost}
                  onSend={sendMessage} onReport={runReport} />
              </>
            )}

          </div>
        </div>
      </div>

      <ExziCompanion role={role === "teacher" ? "teacher" : "student"} name={me.name || "Admin"} userId={`lab-${role}`} />
    </>
  );
};

export default MergedDashboard;
