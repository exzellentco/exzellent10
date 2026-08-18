import "../styles/calendar.css";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  currentUser,
  getBookings,
  createBooking,
  updateBooking,
  cancelBooking,
  getProviders,
  googleCalUrl,
} from "../APIs/calendar";
import { getClassAttendance } from "../APIs/learning";

/* ----------------------------- date helpers ----------------------------- */
const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// "YYYY-MM-DD" for a given y/m(0-based)/d.
const iso = (y, m, d) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const todayISO = () => {
  const n = new Date();
  return iso(n.getFullYear(), n.getMonth(), n.getDate());
};
// Pretty date from "YYYY-MM-DD" (parsed as local, not UTC).
const prettyDate = (ymd, opts) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, opts);
};

// Build a month grid: leading/trailing days from adjacent months flagged muted.
const buildMonth = (year, month) => {
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = 0; i < first; i++)
    cells.push({ day: prevDays - first + 1 + i, muted: true });
  for (let d = 1; d <= days; d++)
    cells.push({ day: d, muted: false, date: iso(year, month, d) });
  while (cells.length % 7 !== 0)
    cells.push({ day: cells.length - (first + days) + 1, muted: true });
  return cells;
};

const roleDashboard = (role) => {
  if (role === "Teacher") return "/teacher-dashboard";
  if (role === "Admin") return "/get-student";
  return "/student-dashboard";
};

const ALL = "__ALL__";
const emptyForm = { start: "", end: "", title: "", studentName: "" };

/* ------------------------------- component ------------------------------ */
const CalendarPage = () => {
  const navigate = useNavigate();
  const user = useMemo(() => currentUser(), []);
  const role = user?.userType;
  const userId = user?._id;

  const isStudent = role === "Student";
  const isTeacher = role === "Teacher";
  const isAdmin = role === "Admin";
  const canManage = isTeacher || isAdmin;

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // month calendar state
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState(todayISO());

  // admin teacher picker
  const [providers, setProviders] = useState([]);
  const [teacherFilter, setTeacherFilter] = useState("");

  // add-lesson form (teacher / admin)
  const [form, setForm] = useState(emptyForm);
  const [addMsg, setAddMsg] = useState(null); // {type,text}

  // inline edit state
  const [editId, setEditId] = useState("");
  const [editForm, setEditForm] = useState(emptyForm);

  // teacher/admin attendance view: which lesson is expanded + lazily-loaded data
  const [attOpen, setAttOpen] = useState("");
  const [attData, setAttData] = useState({}); // { [bookingId]: { loading, list, title, error } }

  const toggleAttendance = useCallback(async (id) => {
    setAttOpen((cur) => (cur === id ? "" : id));
    setAttData((prev) => {
      if (prev[id]) return prev; // already loaded/loading
      // kick off the lazy fetch
      getClassAttendance(id)
        .then((res) =>
          setAttData((p) => ({
            ...p,
            [id]: { loading: false, list: Array.isArray(res?.data) ? res.data : [], title: res?.title },
          }))
        )
        .catch(() =>
          setAttData((p) => ({ ...p, [id]: { loading: false, list: [], error: true } }))
        );
      return { ...prev, [id]: { loading: true, list: [] } };
    });
  }, []);

  /* -------- data loaders -------- */
  const loadBookings = useCallback(() => {
    if (isAdmin) return getBookings("", "");
    return getBookings(role, userId);
  }, [isAdmin, role, userId]);

  const refreshBookings = useCallback(async () => {
    try {
      const b = await loadBookings();
      setBookings(Array.isArray(b) ? b : []);
    } catch {
      setError("Could not load the lessons schedule. Please try again.");
    }
  }, [loadBookings]);

  // initial mount
  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const tasks = [loadBookings()];
        if (isAdmin) tasks.push(getProviders());
        const results = await Promise.allSettled(tasks);
        if (!alive) return;

        const bRes = results[0];
        if (bRes.status === "fulfilled" && Array.isArray(bRes.value)) {
          setBookings(bRes.value);
        } else {
          setError("Could not load the lessons schedule. Please try again.");
        }

        if (isAdmin) {
          const pRes = results[1];
          const list = pRes.status === "fulfilled" && Array.isArray(pRes.value) ? pRes.value : [];
          setProviders(list);
          if (list.length) setTeacherFilter(String(list[0]._id));
        }
      } catch {
        if (alive) setError("Something went wrong loading the calendar.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------- filtering + month marks -------- */
  // Which lessons drive the calendar + day list (admin can narrow to one teacher).
  const displayBookings = useMemo(() => {
    if (isAdmin && teacherFilter && teacherFilter !== ALL) {
      return bookings.filter(
        (b) => String(b.teacherId || b.providerId) === String(teacherFilter)
      );
    }
    return bookings;
  }, [bookings, isAdmin, teacherFilter]);

  const bookingsByDate = useMemo(() => {
    const map = {};
    displayBookings.forEach((b) => { (map[b.date] = map[b.date] || []).push(b); });
    return map;
  }, [displayBookings]);

  const monthCells = useMemo(() => buildMonth(year, month), [year, month]);
  const shiftMonth = (delta) => {
    let m = month + delta, y = year;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setMonth(m); setYear(y);
  };

  const selectedDayBookings = useMemo(() => (
    selectedDay
      ? (bookingsByDate[selectedDay] || []).slice().sort((a, b) => a.start.localeCompare(b.start))
      : []
  ), [bookingsByDate, selectedDay]);

  /* -------- add target (who a new lesson is created for) -------- */
  const addTarget = useMemo(() => {
    if (isTeacher) return { id: userId, name: user?.name || "" };
    if (isAdmin && teacherFilter && teacherFilter !== ALL) {
      const p = providers.find((x) => String(x._id) === String(teacherFilter));
      return p ? { id: p._id, name: p.name } : null;
    }
    return null;
  }, [isTeacher, isAdmin, teacherFilter, providers, userId, user]);

  const canAdd = !!addTarget;

  /* -------- mutations -------- */
  const onAdd = async () => {
    if (!addTarget) return;
    const { start, end, title, studentName } = form;
    if (!start || !end || start >= end) {
      setAddMsg({ type: "err", text: "Pick a start time earlier than the end time." });
      return;
    }
    if (!title.trim()) {
      setAddMsg({ type: "err", text: "Give the lesson a title." });
      return;
    }
    setAddMsg(null);
    try {
      const res = await createBooking({
        teacherId: addTarget.id,
        teacherName: addTarget.name,
        date: selectedDay,
        start,
        end,
        title: title.trim(),
        studentName: studentName.trim(),
      });
      if (res && res.success === false) {
        setAddMsg({ type: "err", text: res.message || "Could not add that lesson." });
        return;
      }
      setForm(emptyForm);
      setAddMsg({ type: "ok", text: "Lesson added." });
      await refreshBookings();
    } catch {
      setAddMsg({ type: "err", text: "Could not add that lesson. Please try again." });
    }
  };

  const startEdit = (l) => {
    setEditId(l._id);
    setEditForm({
      start: l.start || "",
      end: l.end || "",
      title: l.title || "",
      studentName: l.studentName || "",
    });
  };
  const cancelEdit = () => { setEditId(""); setEditForm(emptyForm); };

  const saveEdit = async () => {
    const { start, end, title, studentName } = editForm;
    if (!start || !end || start >= end) {
      setError("Pick a start time earlier than the end time.");
      return;
    }
    if (!title.trim()) {
      setError("Give the lesson a title.");
      return;
    }
    setError("");
    try {
      await updateBooking(editId, {
        start,
        end,
        title: title.trim(),
        studentName: studentName.trim(),
      });
      cancelEdit();
      await refreshBookings();
    } catch {
      setError("Could not save changes to that lesson.");
    }
  };

  const onDelete = async (id) => {
    try {
      await cancelBooking(id);
      if (editId === id) cancelEdit();
      await refreshBookings();
    } catch {
      setError("Could not delete that lesson.");
    }
  };

  /* -------- lesson subtitle line -------- */
  const subtitle = (l) => {
    const loc = l.location ? ` · 📍 ${l.location}` : "";
    if (isStudent) return `${l.teacherName || "Teacher"}${loc}`;
    if (isAdmin) return `${l.teacherName || "Teacher"} · ${l.studentName || "No student"}${loc}`;
    return `${l.studentName || "No student assigned"}${loc}`;
  };

  /* ------------------------------- guards ------------------------------- */
  if (!userId) {
    return (
      <div className="cal-page spl-root">
        <div className="cal-center">
          <div>
            <h2 style={{ marginBottom: 10 }}>You are not signed in</h2>
            <p className="spl-empty" style={{ padding: 0, marginBottom: 16 }}>
              Please log in to view the lessons schedule.
            </p>
            <a href="/login">Go to login →</a>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------- render ------------------------------- */
  return (
    <div className="cal-page spl-root">
      <header className="cal-header">
        <div className="cal-title">
          <span className="cal-dot">📅</span> Lessons Schedule
        </div>
        <div className="cal-whoami">
          <b>{user.name || "Member"}</b>
          <span>{role}</span>
        </div>
      </header>
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "14px 28px 0" }}>
          <button className="cal-back" onClick={() => navigate(roleDashboard(role))}>
            ← Dashboard
          </button>
        </div>
      </div>

      {loading ? (
        <div className="cal-center"><p className="spl-empty">Loading the lessons schedule…</p></div>
      ) : (
        <div className="cal-body">
          {/* ---------------- LEFT: month calendar + selected day ---------------- */}
          <section className="cal-card cal-month">
            {error && <div className="cal-msg err">{error}</div>}
            <div className="spl-cal-head">
              <button className="spl-cal-nav" onClick={() => shiftMonth(-1)} aria-label="Previous month">‹</button>
              <b>{MONTHS[month]} {year}</b>
              <button className="spl-cal-nav" onClick={() => shiftMonth(1)} aria-label="Next month">›</button>
            </div>
            <div className="spl-cal-grid">
              {DOW.map((d) => <div className="spl-cal-dow" key={d}>{d}</div>)}
              {monthCells.map((c, i) => {
                const has = !c.muted && !!bookingsByDate[c.date];
                let cls = "spl-cal-day";
                if (c.muted) cls += " muted";
                else {
                  if (c.date === todayISO()) cls += " today";
                  if (c.date === selectedDay) cls += " sel";
                  if (has) cls += " has";
                }
                return (
                  <div
                    key={i}
                    className={cls}
                    onClick={() => !c.muted && setSelectedDay(c.date)}
                  >
                    {c.day}
                    {has && <span className="ev" />}
                  </div>
                );
              })}
            </div>

            {selectedDay && (
              <>
                <div className="spl-label" style={{ marginTop: 20, display: "flex", alignItems: "center" }}>
                  {prettyDate(selectedDay, { weekday: "long", month: "long", day: "numeric" })}
                  <span className="cal-count" style={{ marginLeft: "auto" }}>{selectedDayBookings.length}</span>
                </div>
                {selectedDayBookings.length === 0 ? (
                  <p className="spl-empty">No lessons on this day.</p>
                ) : (
                  selectedDayBookings.map((l) => (
                    editId === l._id ? (
                      <div className="spl-list-row cal-edit-row" key={l._id}>
                        <div className="cal-form" style={{ width: "100%" }}>
                          <div className="cal-form-row">
                            <input type="time" className="spl-input" value={editForm.start}
                              onChange={(e) => setEditForm((p) => ({ ...p, start: e.target.value }))} />
                            <input type="time" className="spl-input" value={editForm.end}
                              onChange={(e) => setEditForm((p) => ({ ...p, end: e.target.value }))} />
                          </div>
                          <input className="spl-input" placeholder="Lesson title" value={editForm.title}
                            onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))} />
                          <input className="spl-input" placeholder="Student name" value={editForm.studentName}
                            onChange={(e) => setEditForm((p) => ({ ...p, studentName: e.target.value }))} />
                          <div className="cal-form-row">
                            <button className="spl-btn primary" onClick={saveEdit}>Save</button>
                            <button className="spl-btn" onClick={cancelEdit}>Cancel</button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <React.Fragment key={l._id}>
                      <div className="spl-list-row">
                        <span className="ic">🎓</span>
                        <span style={{ flex: 1, minWidth: 0 }}>
                          <b>{l.start}–{l.end} · {l.title}</b>
                          <span>{subtitle(l)}</span>
                        </span>
                        <span className="cal-row-actions" style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                          {l.meetingUrl && <a className="cal-gcal" href={`/class/${l._id}`} onClick={(e) => { e.preventDefault(); navigate(`/class/${l._id}`); }} title="Join the live class">🎥 Join class</a>}
                          {canManage && (
                            <span className="cal-chip" title="View who attended">
                              👥 {(l.attendance?.length ?? attData[l._id]?.list?.length ?? 0)} attended
                              <button onClick={() => toggleAttendance(l._id)} aria-expanded={attOpen === l._id}>
                                {attOpen === l._id ? "▴" : "▾"}
                              </button>
                            </span>
                          )}
                          <a className="cal-gcal" href={googleCalUrl(l)} target="_blank" rel="noreferrer" title="Add to Google Calendar">📆 Google</a>
                          {canManage && <button className="spl-btn" onClick={() => startEdit(l)}>Edit</button>}
                          {canManage && <button className="cal-danger" onClick={() => onDelete(l._id)}>Delete</button>}
                        </span>
                      </div>
                      {canManage && attOpen === l._id && (
                        <div className="spl-list-row" style={{ flexDirection: "column", alignItems: "stretch", gap: 6 }}>
                          {attData[l._id]?.loading ? (
                            <p className="spl-empty" style={{ padding: 0 }}>Loading attendance…</p>
                          ) : attData[l._id]?.error ? (
                            <p className="spl-empty" style={{ padding: 0 }}>Could not load attendance.</p>
                          ) : (attData[l._id]?.list?.length ? (
                            attData[l._id].list.map((a, ai) => (
                              <span key={a.studentId || ai} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 12.5 }}>
                                <b style={{ fontWeight: 600 }}>{a.name || "Student"}</b>
                                <span style={{ color: "#9aa3c2" }}>
                                  {a.joinedAt ? new Date(a.joinedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                                </span>
                              </span>
                            ))
                          ) : (
                            <span className="cal-chip-none">No one has joined yet.</span>
                          ))}
                        </div>
                      )}
                      </React.Fragment>
                    )
                  ))
                )}
              </>
            )}
          </section>

          {/* ---------------- RIGHT: role panel ---------------- */}
          <aside>
            {isStudent && (
              <div className="cal-card">
                <div className="cal-card-title">🎓 Your lessons</div>
                <p className="spl-empty" style={{ padding: 0 }}>
                  This is a read-only schedule. Pick any day on the calendar to see the
                  lessons assigned to you — each with its time, teacher, location and an
                  “Add to Google Calendar” link.
                </p>
              </div>
            )}

            {isAdmin && (
              <div className="cal-card">
                <div className="cal-card-title">🛡 Teacher</div>
                <div className="spl-label">Show lessons for</div>
                <select
                  className="spl-select"
                  value={teacherFilter}
                  onChange={(e) => { setTeacherFilter(e.target.value); cancelEdit(); setAddMsg(null); }}
                >
                  <option value={ALL}>All teachers</option>
                  {providers.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}{p.subject ? ` · ${p.subject}` : ""}{p.location ? ` · ${p.location}` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {canManage && (
              <div className="cal-card">
                <div className="cal-card-title">➕ Add lesson</div>
                <div className="spl-label">
                  {prettyDate(selectedDay, { weekday: "long", month: "long", day: "numeric" })}
                  {addTarget ? ` · ${addTarget.name}` : ""}
                </div>

                {isAdmin && !canAdd && (
                  <p className="spl-empty" style={{ padding: 0, marginTop: 8 }}>
                    Choose a specific teacher above to add a lesson.
                  </p>
                )}

                {addMsg && (
                  <div className={`cal-msg ${addMsg.type}`} style={{ marginTop: 12 }}>{addMsg.text}</div>
                )}

                <div className="cal-form" style={{ marginTop: 12 }}>
                  <div className="cal-form-row">
                    <input type="time" className="spl-input" aria-label="Start time"
                      disabled={!canAdd} value={form.start}
                      onChange={(e) => setForm((p) => ({ ...p, start: e.target.value }))} />
                    <input type="time" className="spl-input" aria-label="End time"
                      disabled={!canAdd} value={form.end}
                      onChange={(e) => setForm((p) => ({ ...p, end: e.target.value }))} />
                  </div>
                  <input className="spl-input" placeholder="Lesson title" disabled={!canAdd} value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
                  <input className="spl-input" placeholder="Student name (optional)" disabled={!canAdd} value={form.studentName}
                    onChange={(e) => setForm((p) => ({ ...p, studentName: e.target.value }))} />
                  <button className="spl-btn primary" disabled={!canAdd} onClick={onAdd}>
                    Add lesson
                  </button>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
