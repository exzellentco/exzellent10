import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Video, Clock, User } from "lucide-react";

/**
 * Month calendar for the prototype console. LOCAL PROTOTYPE.
 *
 * The console already had a "weekly timetable", but that is a repeating shape —
 * Mon/Tue/Wed with slots on them — and it cannot answer the question people
 * actually ask a calendar: what is happening on the 14th. This is dated.
 *
 * It reads the booking shape the live backend returns from
 * /api/calendar/bookings ({ date, start, end, title, teacherName, studentName,
 * status, meetingUrl }), and the mock produces the same shape, so there is one
 * code path whether the console is live or on demo data.
 *
 * Weeks start on Monday: this is a German school, and a grid starting on Sunday
 * would read wrong to everyone using it.
 */

const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const pad = (n) => String(n).padStart(2, "0");
const key = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const todayKey = () => {
  const t = new Date();
  return key(t.getFullYear(), t.getMonth(), t.getDate());
};

/** Monday-first weekday index for a given date. */
const mondayIndex = (date) => (date.getDay() + 6) % 7;

/**
 * The 6x7 block of days covering a month, including the leading and trailing
 * days from the neighbouring months so the grid is never ragged.
 */
const monthGrid = (year, month) => {
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - mondayIndex(first));
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    return {
      date: d,
      k: key(d.getFullYear(), d.getMonth(), d.getDate()),
      day: d.getDate(),
      outside: d.getMonth() !== month,
    };
  });
};

const Calendar = ({ bookings = [], role = "admin", onJoin }) => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [picked, setPicked] = useState(todayKey());

  // date -> lessons on that date, each sorted by start time.
  const byDate = useMemo(() => {
    const m = new Map();
    for (const b of bookings) {
      if (!b || !b.date) continue;
      const d = String(b.date).slice(0, 10);
      if (!m.has(d)) m.set(d, []);
      m.get(d).push(b);
    }
    for (const list of m.values()) list.sort((a, c) => String(a.start).localeCompare(String(c.start)));
    return m;
  }, [bookings]);

  const cells = useMemo(() => monthGrid(year, month), [year, month]);
  const today = todayKey();

  const inMonth = useMemo(
    () => cells.filter((c) => !c.outside).reduce((n, c) => n + (byDate.get(c.k) || []).length, 0),
    [cells, byDate]
  );

  const step = (by) => {
    const d = new Date(year, month + by, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };
  const goToday = () => {
    const t = new Date();
    setYear(t.getFullYear());
    setMonth(t.getMonth());
    setPicked(todayKey());
  };

  const dayList = byDate.get(picked) || [];
  const pickedDate = useMemo(() => {
    const [y, m, d] = picked.split("-").map(Number);
    return new Date(y, m - 1, d);
  }, [picked]);

  // Whose name to show against a lesson: a student cares which teacher, a
  // teacher cares which student, and an admin needs both.
  const counterpart = (b) => {
    if (role === "student") return b.teacherName || "—";
    if (role === "teacher") return b.studentName || "—";
    return [b.teacherName, b.studentName].filter(Boolean).join(" · ") || "—";
  };

  return (
    <section className="alh-card alh-cal">
      <header>
        <h3>Calendar</h3>
        <span className="alh-tag">{inMonth}</span>
        <div className="alh-cal-nav">
          <button type="button" onClick={() => step(-1)} aria-label="Previous month">
            <ChevronLeft size={15} />
          </button>
          <strong>{MONTHS[month]} {year}</strong>
          <button type="button" onClick={() => step(1)} aria-label="Next month">
            <ChevronRight size={15} />
          </button>
          <button type="button" className="alh-mini" onClick={goToday}>Today</button>
        </div>
      </header>

      <div className="alh-cal-body">
        <div className="alh-cal-grid">
          {DOW.map((d) => <div key={d} className="alh-cal-dow">{d}</div>)}

          {cells.map((c) => {
            const items = byDate.get(c.k) || [];
            return (
              <button
                type="button"
                key={c.k}
                className="alh-cal-day"
                data-outside={c.outside || undefined}
                data-today={c.k === today || undefined}
                data-on={c.k === picked || undefined}
                onClick={() => setPicked(c.k)}
              >
                <b>{c.day}</b>
                <span className="alh-cal-pips">
                  {items.slice(0, 3).map((b) => (
                    <i key={b._id} data-status={b.status} title={`${b.start} ${b.title}`} />
                  ))}
                </span>
                {/* The dots already carry the count up to three; a number on
                    every cell only competes with the date next to it. */}
                {items.length > 3 && <em>+{items.length - 3}</em>}
              </button>
            );
          })}
        </div>

        <aside className="alh-cal-day-panel">
          <h4>
            {DOW[mondayIndex(pickedDate)]} {pickedDate.getDate()} {MONTHS[pickedDate.getMonth()]}
            {picked === today && <span className="alh-cal-istoday">Today</span>}
          </h4>

          {dayList.length === 0 && <p className="alh-muted">Nothing booked on this day.</p>}

          <ul className="alh-cal-list">
            {dayList.map((b) => (
              <li key={b._id}>
                <span className="alh-cal-time">
                  <b>{b.start}</b>
                  <i>{b.end}</i>
                </span>
                <span className="alh-grow">
                  <b>{b.title}</b>
                  <i><User size={11} /> {counterpart(b)}</i>
                  {b.durationMin && <i><Clock size={11} /> {b.durationMin} min</i>}
                </span>
                <span className="alh-pill" data-status={b.status}>{b.status}</span>
                {b.meetingUrl && (
                  <button type="button" className="alh-mini" onClick={() => onJoin && onJoin(b)}>
                    <Video size={13} /> Join
                  </button>
                )}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
};

export default Calendar;
