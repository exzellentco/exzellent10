import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, LogOut, Plus, ExternalLink, Video, Flame, Coins } from "lucide-react";
import axios from "../../utils/axios";
import Calendar from "./Calendar";
import { NAV, COPY } from "./nav";

import ExziCompanion from "../../components/Exzi/ExziCompanion";
import MessagesPanel from "../../components/Messages/MessagesPanel";
import AiToolsHub from "../../components/AiTools/AiToolsHub";
import StudentSpeechLab from "../../components/SpeechAnalyzer/StudentSpeechLab";
import ReviewPanel from "../../components/Review/ReviewPanel";
import StudentAssignments from "../../components/Assignments/StudentAssignments";
import ReferralPanel from "../../components/Referral/ReferralPanel";
import BookLessonModal from "../../components/Calendar/BookLessonModal";

/**
 * THE CONSOLE — the student, teacher and admin dashboard.
 *
 * This replaces the three older dashboards. The shell (sidebar, header, the
 * figures panel, the section list) is shared; only the sections differ by role,
 * and the role comes from the signed-in user via the route guard — there is no
 * role switcher here, unlike the prototype this grew out of.
 *
 * Data: one call to GET /api/dashboard returns the whole role-shaped payload,
 * composed server-side. Sections that need more (courses, webinars, messages)
 * fetch their own, each tolerating failure so one dead endpoint cannot blank
 * the page.
 *
 * Deep features are NOT reimplemented here. Speech Lab, AI Tools, Daily Review,
 * Assignments, Referrals and Messages are the same components the old
 * dashboards used, mounted inside the new shell; the admin tools that already
 * exist as their own pages are linked. Rebuilding any of them would have meant
 * losing working behaviour for the sake of a consistent frame.
 */

const money = (n, cur = "EUR") =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: cur, maximumFractionDigits: 0 })
    .format(Number(n || 0));

const Stat = ({ label, value, sub }) => (
  <div className="alh-stat">
    <div><b>{value}</b><span>{label}</span>{sub && <i>{sub}</i>}</div>
  </div>
);

const Card = ({ title, tag, children, action }) => (
  <section className="alh-card">
    <header>
      <h3>{title}</h3>
      {tag != null && <span className="alh-tag">{tag}</span>}
      {action}
    </header>
    {children}
  </section>
);

const Bar = ({ pct }) => (
  <div className="alh-bar"><span style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} /></div>
);

const Empty = ({ what }) => <p className="alh-muted">{what}</p>;

/** A section that is really an existing page: send them there rather than fake it. */
const GoTo = ({ label, to, nav }) => (
  <li>
    <span className="alh-grow"><b>{label}</b></span>
    <button className="alh-mini" onClick={() => nav(to)}><ExternalLink size={13} /> Open</button>
  </li>
);

const Console = ({ role = "student" }) => {
  const navigate = useNavigate();
  const [view, setView] = useState("dashboard");
  const [d, setD] = useState({});
  const [side, setSide] = useState({});          // extra per-section data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState(false);
  // Speech Lab, AI Tools, Messages, Daily Review and Assignments were all built
  // as full-screen overlays (.spl-overlay, position:fixed). Rendering them as a
  // section does not work — a fixed element escapes its wrapper, so the panel
  // covered the console's own sidebar and swallowed every click. They open over
  // the console instead, which is how the previous dashboards used them too.
  const [panel, setPanel] = useState(null);

  const nav = NAV[role] || NAV.student;

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const { data } = await axios.get("/api/dashboard");
      setD(data?.data || {});
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Could not load your dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* Section-specific data, fetched the first time a section is opened. Each is
     optional: a failure leaves that one section empty, not the whole page. */
  useEffect(() => {
    const want = { courses: "/api/courses", webinars: "/api/webinars", reports: "/api/reports" };
    const url = want[view];
    if (!url || side[view] !== undefined) return;
    let alive = true;
    axios.get(url)
      .then((r) => alive && setSide((s) => ({ ...s, [view]: r.data?.data ?? r.data ?? [] })))
      .catch(() => alive && setSide((s) => ({ ...s, [view]: [] })));
    return () => { alive = false; };
  }, [view, side]);

  const me = d.me || {};
  const s = d.summary || {};
  const bookings = d.bookings || [];

  const PANELS = new Set(["messages", "aitools", "speech", "review", "homework"]);

  const openSection = (item) => {
    if (item.to) { navigate(item.to); return; }
    if (PANELS.has(item.k)) { setPanel(item.k); return; }
    setView(item.k);
  };

  const signOut = async () => {
    try { await axios.post("/api/users/logout"); } catch { /* the cookie is cleared regardless */ }
    localStorage.removeItem("user");
    navigate("/login");
  };

  const joinLesson = (b) => {
    if (b.meetingUrl) window.open(b.meetingUrl, "_blank", "noopener");
    else if (b._id) navigate(`/class/${b._id}`);
  };

  const [title, blurb] = COPY[view] || [view, ""];
  const initials = (me.name || (role === "admin" ? "Admin" : "You"))
    .split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  /* ─── sections ─────────────────────────────────────────────────────────── */
  const section = () => {
    // Referrals is an ordinary in-page card, so it renders as a section.
    if (view === "referrals") return <div className="alh-mount"><ReferralPanel /></div>;

    if (view === "calendar") {
      return <Calendar bookings={bookings} role={role} onJoin={joinLesson} />;
    }

    if (view === "courses") {
      const list = side.courses || [];
      return (
        <Card title={role === "admin" ? "Courses" : "My courses"} tag={list.length}
          action={role === "admin" ? <button className="alh-mini" onClick={() => navigate("/add-course")}><Plus size={13} /> New</button> : null}>
          {!list.length && <Empty what="No courses yet." />}
          <ul className="alh-list">
            {list.map((c) => (
              <li key={c._id}>
                <span className="alh-grow"><b>{c.title}</b><i>{c.level || "—"}</i></span>
                <button className="alh-mini" onClick={() => navigate(`/course/${encodeURIComponent(c.title)}`)}>Open</button>
              </li>
            ))}
          </ul>
        </Card>
      );
    }

    if (view === "webinars") {
      const list = side.webinars || [];
      return (
        <Card title="Webinars" tag={list.length}
          action={role === "admin" ? <button className="alh-mini" onClick={() => navigate("/add-webinar")}><Plus size={13} /> New</button> : null}>
          {!list.length && <Empty what="Nothing scheduled." />}
          <ul className="alh-list">
            {list.map((w) => (
              <li key={w._id}>
                <span className="alh-grow"><b>{w.title}</b><i>{w.date || w.startTime || "—"}</i></span>
                <button className="alh-mini" onClick={() => navigate(`/webinars/${w._id}`)}>Open</button>
              </li>
            ))}
          </ul>
        </Card>
      );
    }

    /* ── student ── */
    if (view === "lessons") {
      return (
        <Card title="My lessons" tag={(me.lessons || []).length}
          action={<button className="alh-mini" onClick={() => setBooking(true)}><Plus size={13} /> Book</button>}>
          {!(me.lessons || []).length && <Empty what="No lessons booked yet." />}
          <ul className="alh-list">
            {(me.lessons || []).map((l) => (
              <li key={l._id}>
                <span className="alh-grow"><b>{l.title}</b><i>{l.date} {l.start} · {l.who}</i></span>
                <span className="alh-pill" data-status={l.status}>{l.status}</span>
                <button className="alh-mini" onClick={() => joinLesson(l)}><Video size={13} /> Join</button>
              </li>
            ))}
          </ul>
        </Card>
      );
    }

    if (view === "attendance" && role === "student") {
      const a = me.attendance || {};
      return (
        <Card title="My attendance">
          <div className="alh-stats">
            <Stat label="Attended" value={a.attended ?? 0} />
            <Stat label="Booked" value={a.booked ?? 0} />
            <Stat label="Missed" value={a.missed ?? 0} />
          </div>
        </Card>
      );
    }

    if (view === "credits") {
      return (
        <Card title="Credits">
          <div className="alh-stats"><Stat label="Balance" value={me.credits ?? 0} sub="1 lesson = 500 credits" /></div>
          <ul className="alh-list">
            <li><span className="alh-grow"><b>Top up</b><i>card or plan</i></span>
              <button className="alh-mini" onClick={() => navigate("/payment")}>Buy</button></li>
          </ul>
        </Card>
      );
    }

    if (view === "leaderboard") {
      return (
        <Card title="Leaderboard">
          <Empty what="Your ranking appears once you finish a course module." />
        </Card>
      );
    }

    /* ── teacher ── */
    if (view === "classes") {
      const list = me.classesToday || [];
      return (
        <Card title="Today's classes" tag={list.length}>
          {!list.length && <Empty what="Nothing scheduled for today." />}
          <ul className="alh-list">
            {list.map((c) => (
              <li key={c._id}>
                <span className="alh-grow"><b>{c.title}</b><i>{c.start} · {c.student}</i></span>
                <button className="alh-mini" onClick={() => joinLesson(c)}><Video size={13} /> Start</button>
              </li>
            ))}
          </ul>
        </Card>
      );
    }

    if (view === "roster") {
      const list = me.roster || [];
      return (
        <Card title="My students" tag={list.length}>
          {!list.length && <Empty what="No students yet." />}
          <table className="alh-table">
            <thead><tr><th>Student</th><th>Level</th><th>Attended</th></tr></thead>
            <tbody>{list.map((r) => (
              <tr key={r._id}><td><b>{r.student}</b></td><td>{r.level}</td><td>{r.attended}</td></tr>
            ))}</tbody>
          </table>
        </Card>
      );
    }

    if (view === "earnings") {
      const e = me.earnings || {};
      return (
        <Card title="Earnings">
          <div className="alh-stats">
            <Stat label="This month" value={money(e.thisMonth, me.currency)} />
            <Stat label="Last month" value={money(e.lastMonth, me.currency)} />
            <Stat label="Lessons" value={e.lessons ?? 0} sub={`${money(e.rate, me.currency)} per lesson`} />
          </div>
          {!!(d.payroll || []).length && (
            <table className="alh-table">
              <thead><tr><th>Month</th><th>Base</th><th>Bonus</th><th>Net</th><th>Status</th></tr></thead>
              <tbody>{d.payroll.map((p) => (
                <tr key={p._id}>
                  <td>{p.month}</td><td>{money(p.base)}</td><td>{money(p.bonus)}</td>
                  <td><b>{money(p.net)}</b></td>
                  <td><span className="alh-pill" data-status={p.status}>{p.status}</span></td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </Card>
      );
    }

    if (view === "online") {
      return (
        <Card title="Online class">
          <Empty what="Open a lesson from Today's classes or the Calendar to start its room." />
        </Card>
      );
    }

    /* ── admin ── */
    if (view === "staff") {
      const list = d.staff || [];
      return (
        <Card title="Teachers" tag={list.length}
          action={<button className="alh-mini" onClick={() => navigate("/add-teacher")}><Plus size={13} /> Add</button>}>
          {!list.length && <Empty what="No approved teachers." />}
          <table className="alh-table">
            <thead><tr><th>Name</th><th>Based</th><th>Email</th><th /></tr></thead>
            <tbody>{list.map((t) => (
              <tr key={t._id}>
                <td><b>{t.name}</b></td><td>{t.dept}</td><td>{t.email}</td>
                <td><button className="alh-mini" onClick={() => navigate("/teachers")}>Manage</button></td>
              </tr>
            ))}</tbody>
          </table>
        </Card>
      );
    }

    if (view === "attendance") {
      const list = d.attendance || [];
      return (
        <Card title="Attendance today" tag={list.length}>
          {!list.length && <Empty what="No lessons scheduled today." />}
          <ul className="alh-list">
            {list.map((a) => (
              <li key={a._id}>
                <span className="alh-grow"><b>{a.student}</b><i>{a.cls} · {a.time} · {a.teacher}</i></span>
                <span className="alh-pill" data-status={a.status}>{a.status}</span>
              </li>
            ))}
          </ul>
        </Card>
      );
    }

    if (view === "tasks") {
      const list = d.tasks || [];
      return (
        <Card title="Tasks" tag={list.length}>
          {!list.length && <Empty what="Nothing open." />}
          <ul className="alh-list">
            {list.map((t) => (
              <li key={t._id}>
                <span className="alh-grow"><b>{t.title}</b><i>{t.owner} · due {t.due || "—"}</i></span>
                <span className="alh-pill" data-status={t.status}>{t.status}</span>
              </li>
            ))}
          </ul>
        </Card>
      );
    }

    if (view === "complaints") {
      const list = d.complaints || [];
      return (
        <Card title="Complaints" tag={list.length}>
          {!list.length && <Empty what="Nothing raised." />}
          <ul className="alh-list">
            {list.map((c) => (
              <li key={c._id}>
                <span className="alh-grow"><b>{c.title}</b><i>{c.by} · {c.role}</i></span>
                <span className="alh-pill" data-status={c.status}>{c.status}</span>
              </li>
            ))}
          </ul>
        </Card>
      );
    }

    if (view === "payroll") {
      const list = d.payroll || [];
      return (
        <Card title="Payroll this month" tag={list.length}>
          {!list.length && <Empty what="Nothing recorded for this month." />}
          <table className="alh-table">
            <thead><tr><th>Name</th><th>Role</th><th>Base</th><th>Bonus</th><th>Net</th><th>Status</th></tr></thead>
            <tbody>{list.map((p) => (
              <tr key={p._id}>
                <td><b>{p.name}</b></td><td>{p.role}</td><td>{money(p.base)}</td>
                <td>{money(p.bonus)}</td><td><b>{money(p.net)}</b></td>
                <td><span className="alh-pill" data-status={p.status}>{p.status}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </Card>
      );
    }

    if (view === "reports") {
      const list = side.reports || [];
      return (
        <Card title="Reports" tag={list.length}>
          {!list.length && <Empty what="No reports available." />}
          <ul className="alh-list">
            {list.map((r) => (
              <li key={r._id}><span className="alh-grow"><b>{r.name}</b><i>{r.period}</i></span></li>
            ))}
          </ul>
        </Card>
      );
    }

    if (view === "manage") {
      return (
        <Card title="Add & manage">
          <ul className="alh-list">
            <GoTo label="Students" to="/get-student" nav={navigate} />
            <GoTo label="Teachers" to="/teachers" nav={navigate} />
            <GoTo label="Add a teacher" to="/add-teacher" nav={navigate} />
            <GoTo label="Courses" to="/add-course" nav={navigate} />
            <GoTo label="Webinars" to="/add-webinar" nav={navigate} />
            <GoTo label="Jobs" to="/add-job" nav={navigate} />
            <GoTo label="Referrals" to="/add-referral" nav={navigate} />
            <GoTo label="Invite requests" to="/invite-requests" nav={navigate} />
          </ul>
        </Card>
      );
    }

    if (view === "settings") {
      return (
        <Card title="Settings">
          <ul className="alh-list">
            <li><span className="alh-grow"><b>Signed in as</b><i>{me.name || "—"}</i></span></li>
            <li><span className="alh-grow"><b>Sign out</b><i>End this session</i></span>
              <button className="alh-mini" onClick={signOut}><LogOut size={13} /> Sign out</button></li>
          </ul>
        </Card>
      );
    }

    /* ── the dashboard itself ── */
    if (role === "admin") {
      return (
        <>
          <div className="alh-stats">
            <Stat label="Students enrolled" value={s.students ?? 0} />
            <Stat label="Teachers" value={s.teachers ?? 0} />
            <Stat label="Attendance today" value={`${s.attendanceRate ?? 0}%`} />
            <Stat label="Payroll this month" value={money(s.payrollMonth)} />
            <Stat label="Complaints open" value={s.complaintsOpen ?? 0} />
            <Stat label="Lessons booked" value={s.lessonsBooked ?? 0} />
          </div>
          <Card title="Needs a decision" tag={(d.complaints || []).filter((c) => c.status !== "resolved").length}>
            {!(d.complaints || []).length && <Empty what="Nothing waiting on you." />}
            <ul className="alh-list">
              {(d.complaints || []).filter((c) => c.status !== "resolved").slice(0, 6).map((c) => (
                <li key={c._id}>
                  <span className="alh-grow"><b>{c.title}</b><i>{c.by} · {c.role}</i></span>
                  <span className="alh-pill" data-status={c.priority}>{c.priority}</span>
                </li>
              ))}
            </ul>
          </Card>
        </>
      );
    }

    if (role === "teacher") {
      return (
        <>
          <div className="alh-stats">
            <Stat label="Classes today" value={(me.classesToday || []).length} />
            <Stat label="Students" value={(me.roster || []).length} />
            <Stat label="This month" value={money(me.earnings?.thisMonth, me.currency)} />
          </div>
          <Card title="Today" tag={(me.classesToday || []).length}>
            {!(me.classesToday || []).length && <Empty what="Nothing scheduled for today." />}
            <ul className="alh-list">
              {(me.classesToday || []).map((c) => (
                <li key={c._id}>
                  <span className="alh-grow"><b>{c.title}</b><i>{c.start} · {c.student}</i></span>
                  <button className="alh-mini" onClick={() => joinLesson(c)}><Video size={13} /> Start</button>
                </li>
              ))}
            </ul>
          </Card>
        </>
      );
    }

    return (
      <>
        <div className="alh-stats">
          <Stat label="Day streak" value={me.streak ?? 0} />
          <Stat label="Credits" value={me.credits ?? 0} />
          <Stat label="Level" value={me.level || "—"} sub={me.targetLanguage || ""} />
          <Stat label="Upcoming lessons" value={(me.lessons || []).length} />
        </div>

        <Card title="Course progress" tag={(me.progress || []).length}>
          {!(me.progress || []).length && <Empty what="You are not enrolled in a course yet." />}
          <ul className="alh-list">
            {(me.progress || []).map((p) => (
              <li key={p._id}>
                <span className="alh-grow"><b>{p.course}</b><i>{p.lessons} lessons</i><Bar pct={p.pct} /></span>
                <span className="alh-pill">{p.pct}%</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Next up" tag={(me.lessons || []).length}
          action={<button className="alh-mini" onClick={() => setBooking(true)}><Plus size={13} /> Book</button>}>
          {!(me.lessons || []).length && <Empty what="Nothing booked. Book a lesson to get started." />}
          <ul className="alh-list">
            {(me.lessons || []).slice(0, 5).map((l) => (
              <li key={l._id}>
                <span className="alh-grow"><b>{l.title}</b><i>{l.date} {l.start} · {l.who}</i></span>
                <button className="alh-mini" onClick={() => joinLesson(l)}><Video size={13} /> Join</button>
              </li>
            ))}
          </ul>
        </Card>
      </>
    );
  };

  return (
    <div className="alh" data-role={role}>
      <aside className="alh-side">
        <div className="alh-brand">
          <span><Flame size={17} /></span>
          <div>Exzellent<small>{role === "admin" ? "Academy console" : role === "teacher" ? "Teaching" : "Learning"}</small></div>
        </div>

        <nav className="alh-nav">
          {nav.map((item, i) => (
            item.head
              ? <div key={`h${i}`} className="alh-navhead">{item.head}</div>
              : (
                <button key={item.k} className={view === item.k || panel === item.k ? "on" : ""} onClick={() => openSection(item)}>
                  <item.icon size={16} />
                  {item.label}
                  {item.k === "messages" && me.unread > 0 && <em>{me.unread}</em>}
                </button>
              )
          ))}
        </nav>

        <div className="alh-side-foot">
          <button className="alh-btn" style={{ width: "100%", justifyContent: "center" }} onClick={signOut}>
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      <div className="alh-main">
        <header className="alh-top">
          <div>
            <span className="alh-eyebrow">
              {role === "admin" ? "Academy" : role === "teacher" ? "Teaching" : "Learning"}
            </span>
            <h1>{view === "dashboard"
              ? (me.name ? `Hello, ${me.name.split(" ")[0]}` : "Dashboard")
              : title}</h1>
            {view === "dashboard"
              ? <p>{role === "admin" ? "Everything across the academy." : role === "teacher" ? "Your classes and your students." : "Where you are, and what is next."}</p>
              : blurb && <p>{blurb}</p>}
          </div>
          <div className="alh-top-actions">
            {role === "student" && (
              <span className="alh-who"><Coins size={15} /> {me.credits ?? 0}</span>
            )}
            <button className="alh-btn" onClick={load}><RefreshCw size={14} /> Refresh</button>
            <span className="alh-who"><i>{initials}</i> {me.name || (role === "admin" ? "Administrator" : "")}</span>
          </div>
        </header>

        <div className="alh-body">
          {loading && <p className="alh-muted">Loading…</p>}
          {!loading && error && <p className="alh-error">{error}</p>}
          {!loading && !error && d.notice && <p className="alh-muted">{d.notice}</p>}
          {!loading && !error && section()}
        </div>
      </div>

      {booking && <BookLessonModal onClose={() => setBooking(false)} onBooked={() => { setBooking(false); load(); }} />}

      {panel === "messages" && <MessagesPanel onClose={() => setPanel(null)} />}
      {panel === "aitools" && <AiToolsHub role={role} onClose={() => setPanel(null)} />}
      {panel === "speech" && <StudentSpeechLab onClose={() => setPanel(null)} student={me} />}
      {panel === "review" && <ReviewPanel onClose={() => setPanel(null)} onStreak={load} />}
      {panel === "homework" && <StudentAssignments onClose={() => setPanel(null)} me={me} />}

      <ExziCompanion
        role={role === "teacher" ? "teacher" : "student"}
        name={me.name || "there"}
        userId={me._id || "console"}
      />
    </div>
  );
};

export default Console;
