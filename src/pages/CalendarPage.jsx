import "../styles/calendar.css";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  currentUser,
  getAvailability,
  setAvailability,
  getSlots,
  getBookings,
  createBooking,
  cancelBooking,
  getProviders,
  googleCalUrl,
} from "../APIs/calendar";

const LAB_LABELS = { language: "Language Lab · tutors", skill: "Skill Lab · mentors", growth: "Growth Lab · coaches" };

/* ----------------------------- date helpers ----------------------------- */
const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
// Weekday labels for the availability editor, Mon..Sun, mapped to keys "0".."6" (0=Sun).
const WEEK_EDIT = [
  { key: "1", label: "Monday" },
  { key: "2", label: "Tuesday" },
  { key: "3", label: "Wednesday" },
  { key: "4", label: "Thursday" },
  { key: "5", label: "Friday" },
  { key: "6", label: "Saturday" },
  { key: "0", label: "Sunday" },
];

// "YYYY-MM-DD" for a given y/m(0-based)/d.
const iso = (y, m, d) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const todayISO = () => {
  const n = new Date();
  return iso(n.getFullYear(), n.getMonth(), n.getDate());
};
// today + n days as "YYYY-MM-DD".
const addDaysISO = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return iso(d.getFullYear(), d.getMonth(), d.getDate());
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

/* ------------------------------- component ------------------------------ */
const CalendarPage = () => {
  const navigate = useNavigate();
  const user = useMemo(() => currentUser(), []);
  const role = user?.userType;
  const userId = user?._id;

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // month calendar state
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState("");

  // student state (providers = tutors/mentors/coaches, optionally lab-filtered)
  const lab = (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("lab") : "") || "";
  const [teachers, setTeachers] = useState([]);
  const [teacherId, setTeacherId] = useState("");
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [chosenSlot, setChosenSlot] = useState(null); // {date,start,end}
  const [topic, setTopic] = useState("");
  const [bookingMsg, setBookingMsg] = useState(null); // {type,text}

  // teacher availability editor state
  const [days, setDays] = useState({ 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] });
  const [slotMinutes, setSlotMinutes] = useState(30);
  const [addStart, setAddStart] = useState({});
  const [addEnd, setAddEnd] = useState({});
  const [availMsg, setAvailMsg] = useState(null);

  const isStudent = role === "Student";
  const isTeacher = role === "Teacher";
  const isAdmin = role === "Admin";

  /* -------- data loaders -------- */
  const loadBookings = useCallback(async () => {
    if (isAdmin) return getBookings("", "");
    return getBookings(role, userId);
  }, [isAdmin, role, userId]);

  const refreshBookings = useCallback(async () => {
    try {
      const b = await loadBookings();
      setBookings(Array.isArray(b) ? b : []);
    } catch {
      setError("Could not load your bookings. Please try again.");
    }
  }, [loadBookings]);

  const loadTeacherSlots = useCallback(async (tid) => {
    if (!tid) { setSlots([]); return; }
    setSlotsLoading(true);
    try {
      const s = await getSlots(tid, todayISO(), addDaysISO(14));
      setSlots(Array.isArray(s) ? s : []);
    } catch {
      setSlots([]);
      setBookingMsg({ type: "err", text: "Could not load open slots for this teacher." });
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  // initial mount
  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const tasks = [loadBookings()];
        if (isStudent) tasks.push(getProviders(lab));
        if (isTeacher) tasks.push(getAvailability(userId));
        const results = await Promise.allSettled(tasks);

        if (!alive) return;

        const bRes = results[0];
        if (bRes.status === "fulfilled" && Array.isArray(bRes.value)) {
          setBookings(bRes.value);
        } else {
          setError("Could not load your bookings. Please try again.");
        }

        if (isStudent) {
          const tRes = results[1];
          const list = tRes.status === "fulfilled" && Array.isArray(tRes.value) ? tRes.value : [];
          setTeachers(list);
        }
        if (isTeacher) {
          const aRes = results[1];
          if (aRes.status === "fulfilled" && aRes.value) {
            const av = aRes.value;
            const seeded = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
            if (av.days) {
              Object.keys(seeded).forEach((k) => {
                if (Array.isArray(av.days[k])) seeded[k] = av.days[k].map((w) => [...w]);
              });
            }
            setDays(seeded);
            if (av.slotMinutes) setSlotMinutes(Number(av.slotMinutes));
          }
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

  /* -------- month grid + my-booking marks -------- */
  const bookingsByDate = useMemo(() => {
    const map = {};
    bookings.forEach((b) => { (map[b.date] = map[b.date] || []).push(b); });
    return map;
  }, [bookings]);

  const monthCells = useMemo(() => buildMonth(year, month), [year, month]);
  const shiftMonth = (delta) => {
    let m = month + delta, y = year;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setMonth(m); setYear(y);
  };
  const selectedDayBookings = selectedDay
    ? (bookingsByDate[selectedDay] || []).slice().sort((a, b) => a.start.localeCompare(b.start))
    : [];

  /* -------- student: book -------- */
  const onTeacherChange = (e) => {
    const tid = e.target.value;
    setTeacherId(tid);
    setChosenSlot(null);
    setBookingMsg(null);
    loadTeacherSlots(tid);
  };

  const slotsByDate = useMemo(() => {
    const map = {};
    slots.forEach((s) => { (map[s.date] = map[s.date] || []).push(s); });
    Object.keys(map).forEach((d) => map[d].sort((a, b) => a.start.localeCompare(b.start)));
    return map;
  }, [slots]);

  const confirmBooking = async () => {
    if (!chosenSlot) return;
    const provider = teachers.find((t) => String(t._id) === String(teacherId));
    setBookingMsg(null);
    try {
      const res = await createBooking({
        providerId: teacherId,
        providerName: provider ? provider.name : "",
        studentId: user._id,
        studentName: user.name,
        date: chosenSlot.date,
        start: chosenSlot.start,
        topic: topic.trim(),
      });
      if (res && res.success === false) {
        setBookingMsg({ type: "err", text: res.message || "That slot is no longer available." });
        await loadTeacherSlots(teacherId);
        return;
      }
      setBookingMsg({ type: "ok", text: "Session booked!" });
      setChosenSlot(null);
      setTopic("");
      await Promise.all([refreshBookings(), loadTeacherSlots(teacherId)]);
    } catch {
      setBookingMsg({ type: "err", text: "Booking failed. Please try again." });
    }
  };

  const onCancel = async (id) => {
    try {
      await cancelBooking(id);
      await refreshBookings();
      if (isStudent && teacherId) loadTeacherSlots(teacherId);
    } catch {
      setError("Could not cancel that booking.");
    }
  };

  /* -------- teacher: availability editor -------- */
  const addWindow = (key) => {
    const s = addStart[key];
    const en = addEnd[key];
    if (!s || !en || s >= en) {
      setAvailMsg({ type: "err", text: "Pick a start time earlier than the end time." });
      return;
    }
    setAvailMsg(null);
    setDays((prev) => {
      const next = { ...prev };
      const list = [...(next[key] || []), [s, en]].sort((a, b) => a[0].localeCompare(b[0]));
      next[key] = list;
      return next;
    });
    setAddStart((p) => ({ ...p, [key]: "" }));
    setAddEnd((p) => ({ ...p, [key]: "" }));
  };
  const removeWindow = (key, idx) => {
    setDays((prev) => {
      const next = { ...prev };
      next[key] = (next[key] || []).filter((_, i) => i !== idx);
      return next;
    });
  };
  const saveAvailability = async () => {
    setAvailMsg(null);
    try {
      await setAvailability(userId, days, slotMinutes);
      setAvailMsg({ type: "ok", text: "Availability saved." });
    } catch {
      setAvailMsg({ type: "err", text: "Could not save availability." });
    }
  };

  /* ------------------------------- guards ------------------------------- */
  if (!userId) {
    return (
      <div className="cal-page spl-root">
        <div className="cal-center">
          <div>
            <h2 style={{ marginBottom: 10 }}>You are not signed in</h2>
            <p className="spl-empty" style={{ padding: 0, marginBottom: 16 }}>
              Please log in to view your calendar and bookings.
            </p>
            <a href="/login">Go to login →</a>
          </div>
        </div>
      </div>
    );
  }

  const upcomingBookings = bookings
    .slice()
    .sort((a, b) =>
      (a.date + a.start).localeCompare(b.date + b.start))
    .filter((b) => b.date + b.start >= todayISO() + "00:00" || b.date >= todayISO());

  /* -------------------------------- render ------------------------------- */
  return (
    <div className="cal-page spl-root">
      <header className="cal-header">
        <div className="cal-title">
          <span className="cal-dot">📅</span> Calendar
        </div>
        <div className="cal-whoami">
          <b>{user.name || "Member"}</b>
          <span>{role}</span>
        </div>
      </header>
      {/* keep back button in the flow of the header on wide, but place after name */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "14px 28px 0" }}>
          <button className="cal-back" onClick={() => navigate(roleDashboard(role))}>
            ← Dashboard
          </button>
        </div>
      </div>

      {loading ? (
        <div className="cal-center"><p className="spl-empty">Loading your calendar…</p></div>
      ) : (
        <div className="cal-body">
          {/* ---------------- LEFT: month calendar ---------------- */}
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
                const has = !c.muted && bookingsByDate[c.date];
                let cls = "spl-cal-day";
                if (c.muted) cls += " muted";
                else if (c.date === todayISO()) cls += " today";
                if (has) cls += " has";
                if (!c.muted && c.date === selectedDay) cls += " has";
                return (
                  <div
                    key={i}
                    className={cls}
                    onClick={() => !c.muted && has && setSelectedDay(c.date)}
                  >
                    {c.day}
                    {has && <span className="ev" />}
                  </div>
                );
              })}
            </div>

            {selectedDay && (
              <>
                <div className="spl-label" style={{ marginTop: 20 }}>
                  {prettyDate(selectedDay, { weekday: "long", month: "long", day: "numeric" })}
                </div>
                {selectedDayBookings.length === 0 ? (
                  <p className="spl-empty">No sessions on this day.</p>
                ) : (
                  selectedDayBookings.map((b) => (
                    <div className="spl-list-row" key={b._id}>
                      <span className="ic">🎓</span>
                      <span>
                        <b>{b.start}–{b.end} · {isStudent ? b.teacherName : b.studentName}</b>
                        <span>{b.topic || "No topic"}</span>
                      </span>
                    </div>
                  ))
                )}
              </>
            )}
          </section>

          {/* ---------------- RIGHT: role panel ---------------- */}
          <aside>
            {isStudent && (
              <>
                <div className="cal-card">
                  <div className="cal-card-title">📖 Book a session</div>
                  <div className="spl-label">{lab && LAB_LABELS[lab] ? LAB_LABELS[lab] : "Tutor · mentor · coach"}</div>
                  <select className="spl-select" value={teacherId} onChange={onTeacherChange}>
                    <option value="">Select someone to book…</option>
                    {teachers.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}{t.role ? ` · ${t.role}` : ""}{t.location ? ` · ${t.location}` : ""}
                      </option>
                    ))}
                  </select>
                  {(() => {
                    const p = teachers.find((t) => String(t._id) === String(teacherId));
                    return p ? (
                      <p className="spl-sub" style={{ marginTop: 8 }}>
                        {p.subject ? `${p.subject} · ` : ""}📍 {p.location || "Online"}
                      </p>
                    ) : null;
                  })()}

                  {bookingMsg && (
                    <div className={`cal-msg ${bookingMsg.type}`} style={{ marginTop: 12 }}>
                      {bookingMsg.text}
                    </div>
                  )}

                  {teacherId && (
                    <div style={{ marginTop: 16 }}>
                      {slotsLoading ? (
                        <p className="spl-empty">Loading open slots…</p>
                      ) : slots.length === 0 ? (
                        <p className="spl-empty">No open slots in the next 14 days.</p>
                      ) : (
                        Object.keys(slotsByDate).sort().map((d) => (
                          <div className="cal-slotgroup" key={d}>
                            <div className="cal-slotgroup-date">
                              {prettyDate(d, { weekday: "short", month: "short", day: "numeric" })}
                            </div>
                            <div className="cal-slots">
                              {slotsByDate[d].map((s) => {
                                const on = chosenSlot && chosenSlot.date === s.date && chosenSlot.start === s.start;
                                return (
                                  <button
                                    key={s.start}
                                    className={`cal-slot${on ? " on" : ""}`}
                                    onClick={() => { setChosenSlot(s); setBookingMsg(null); }}
                                  >
                                    {s.start}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))
                      )}

                      {chosenSlot && (
                        <div className="cal-confirm">
                          <div className="cal-confirm-when">
                            {prettyDate(chosenSlot.date, { weekday: "long", month: "short", day: "numeric" })} · {chosenSlot.start}–{chosenSlot.end}
                          </div>
                          <input
                            className="spl-input"
                            placeholder="Topic (optional)"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                          />
                          <button className="spl-btn primary" onClick={confirmBooking}>
                            Confirm booking
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="cal-card">
                  <div className="cal-card-title">
                    🗓 My upcoming sessions
                    <span className="cal-count">{upcomingBookings.length}</span>
                  </div>
                  {upcomingBookings.length === 0 ? (
                    <p className="spl-empty">No upcoming sessions yet.</p>
                  ) : (
                    upcomingBookings.map((b) => (
                      <div className="spl-list-row" key={b._id}>
                        <span className="ic">🎓</span>
                        <span style={{ flex: 1, minWidth: 0 }}>
                          <b>{prettyDate(b.date, { month: "short", day: "numeric" })} · {b.start}–{b.end}</b>
                          <span>{b.providerName || b.teacherName}{b.location ? ` · 📍 ${b.location}` : ""}{b.topic ? ` · ${b.topic}` : ""}</span>
                        </span>
                        <span className="cal-row-actions" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <a className="cal-gcal" href={googleCalUrl(b)} target="_blank" rel="noreferrer" title="Add to Google Calendar">📆 Google</a>
                          <button className="cal-danger" onClick={() => onCancel(b._id)}>Cancel</button>
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {isTeacher && (
              <>
                <div className="cal-card">
                  <div className="cal-card-title">🕑 My availability</div>
                  {availMsg && <div className={`cal-msg ${availMsg.type}`}>{availMsg.text}</div>}
                  {WEEK_EDIT.map(({ key, label }) => (
                    <div className="cal-day-row" key={key}>
                      <div className="cal-day-name">{label}</div>
                      <div className="cal-chips">
                        {(days[key] || []).length === 0 ? (
                          <span className="cal-chip-none">No windows</span>
                        ) : (
                          days[key].map((w, i) => (
                            <span className="cal-chip" key={`${w[0]}-${w[1]}-${i}`}>
                              {w[0]}–{w[1]}
                              <button onClick={() => removeWindow(key, i)} aria-label="Remove">✕</button>
                            </span>
                          ))
                        )}
                      </div>
                      <div className="cal-addrow">
                        <input
                          type="time"
                          value={addStart[key] || ""}
                          onChange={(e) => setAddStart((p) => ({ ...p, [key]: e.target.value }))}
                        />
                        <span className="cal-sep">to</span>
                        <input
                          type="time"
                          value={addEnd[key] || ""}
                          onChange={(e) => setAddEnd((p) => ({ ...p, [key]: e.target.value }))}
                        />
                        <button className="cal-add-btn" onClick={() => addWindow(key)}>Add</button>
                      </div>
                    </div>
                  ))}
                  <div className="cal-avail-foot">
                    <div>
                      <div className="spl-label">Slot length</div>
                      <select
                        className="spl-select"
                        value={slotMinutes}
                        onChange={(e) => setSlotMinutes(Number(e.target.value))}
                      >
                        {[15, 30, 45, 60].map((m) => (
                          <option key={m} value={m}>{m} min</option>
                        ))}
                      </select>
                    </div>
                    <button className="spl-btn primary" onClick={saveAvailability}>
                      Save availability
                    </button>
                  </div>
                </div>

                <div className="cal-card">
                  <div className="cal-card-title">
                    📥 Upcoming bookings
                    <span className="cal-count">{upcomingBookings.length}</span>
                  </div>
                  {upcomingBookings.length === 0 ? (
                    <p className="spl-empty">No bookings yet.</p>
                  ) : (
                    upcomingBookings.map((b) => (
                      <div className="spl-list-row" key={b._id}>
                        <span className="ic">🧑‍🎓</span>
                        <span style={{ flex: 1, minWidth: 0 }}>
                          <b>{prettyDate(b.date, { month: "short", day: "numeric" })} · {b.start}–{b.end}</b>
                          <span>{b.studentName}{b.topic ? ` · ${b.topic}` : ""}</span>
                        </span>
                        <span className="cal-row-actions" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <a className="cal-gcal" href={googleCalUrl(b)} target="_blank" rel="noreferrer" title="Add to Google Calendar">📆 Google</a>
                          <button className="cal-danger" onClick={() => onCancel(b._id)}>Cancel</button>
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {isAdmin && (
              <div className="cal-card">
                <div className="cal-card-title">
                  🛡 All bookings
                  <span className="cal-count">{bookings.length}</span>
                </div>
                {bookings.length === 0 ? (
                  <p className="spl-empty">No bookings in the system.</p>
                ) : (
                  bookings
                    .slice()
                    .sort((a, b) => (b.date + b.start).localeCompare(a.date + a.start))
                    .map((b) => (
                      <div className="spl-list-row" key={b._id}>
                        <span className="ic">🎓</span>
                        <span style={{ flex: 1, minWidth: 0 }}>
                          <b>{b.studentName} ↔ {b.providerName || b.teacherName}</b>
                          <span>
                            {prettyDate(b.date, { month: "short", day: "numeric" })} · {b.start}–{b.end}
                            {b.location ? ` · 📍 ${b.location}` : ""}{b.topic ? ` · ${b.topic}` : ""}
                          </span>
                        </span>
                        <span className="cal-row-actions">
                          <button className="cal-danger" onClick={() => onCancel(b._id)}>Cancel</button>
                        </span>
                      </div>
                    ))
                )}
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
