import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBookings, currentUser } from "../../APIs/calendar";

const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const iso = (y, m, d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

// A real month calendar. `events` = [{ date:'YYYY-MM-DD', title, time }]; it also
// pulls the signed-in user's booked sessions from the calendar API.
const CalendarPopup = ({ onClose, events = [] }) => {
  const navigate = useNavigate();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState(iso(now.getFullYear(), now.getMonth(), now.getDate()));
  const [booked, setBooked] = useState([]);

  useEffect(() => {
    const u = currentUser();
    getBookings(u.userType, u._id)
      .then((list) => setBooked((list || []).map((b) => {
        const who = u.userType === "Teacher" ? b.studentName : b.teacherName;
        return {
          date: b.date,
          title: `${b.title || b.topic || "Lesson"}${who ? ` · ${who}` : ""}`,
          time: b.end ? `${b.start}–${b.end}` : b.start,
          meetingUrl: b.meetingUrl,
          _id: b._id,
        };
      })))
      .catch(() => setBooked([]));
  }, []);

  const byDate = {};
  [...events, ...booked].forEach((e) => { if (e.date) (byDate[e.date] = byDate[e.date] || []).push(e); });

  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = 0; i < first; i++) cells.push({ day: prevDays - first + 1 + i, muted: true });
  for (let d = 1; d <= days; d++) cells.push({ day: d, muted: false, date: iso(year, month, d) });
  while (cells.length % 7 !== 0) cells.push({ day: cells.length - (first + days) + 1, muted: true });

  const todayISO = iso(now.getFullYear(), now.getMonth(), now.getDate());
  const shift = (delta) => {
    let m = month + delta, y = year;
    if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; }
    setMonth(m); setYear(y);
  };
  const dayEvents = byDate[selected] || [];

  return (
    <div className="spl-root">
      <div className="spl-overlay" onClick={onClose}>
        <div className="spl-panel" onClick={(e) => e.stopPropagation()}>
          <div className="spl-aura" />
          <div className="spl-head">
            <span className="spl-mic">📅</span>
            <div><h3>Calendar</h3><p>Your lessons, webinars & deadlines</p></div>
            <button className="spl-close" onClick={onClose} aria-label="Close">×</button>
          </div>
          <div className="spl-body">
            <div className="spl-cal-head">
              <button className="spl-cal-nav" onClick={() => shift(-1)}>‹</button>
              <b>{MONTHS[month]} {year}</b>
              <button className="spl-cal-nav" onClick={() => shift(1)}>›</button>
            </div>
            <div className="spl-cal-grid">
              {DOW.map((d) => <div className="spl-cal-dow" key={d}>{d}</div>)}
              {cells.map((c, i) => {
                const has = !c.muted && byDate[c.date];
                let cls = "spl-cal-day";
                if (c.muted) cls += " muted";
                else {
                  if (c.date === todayISO) cls += " today";
                  else if (c.date === selected) cls += " sel";
                }
                if (has) cls += " has";
                return (
                  <div
                    key={i}
                    className={cls}
                    style={c.muted ? undefined : { cursor: "pointer" }}
                    onClick={() => !c.muted && setSelected(c.date)}
                  >
                    {c.day}
                    {has && <span className="ev" />}
                  </div>
                );
              })}
            </div>

            <div className="spl-label" style={{ marginTop: 20 }}>
              {selected === todayISO ? "Today" : new Date(selected).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            </div>
            {dayEvents.length === 0 ? (
              <p className="spl-empty">Nothing scheduled. Enjoy the free time — or book a session.</p>
            ) : (
              dayEvents.map((e, i) => (
                <div className="spl-list-row" key={i}>
                  <span className="ic">📌</span>
                  <span style={{ flex: 1, minWidth: 0 }}><b>{e.title}</b><span>{e.time || "All day"}</span></span>
                  {e.meetingUrl && e._id && (
                    <a
                      href={`/class/${e._id}`}
                      onClick={(ev) => { ev.preventDefault(); navigate(`/class/${e._id}`); onClose && onClose(); }}
                      title="Join the live class"
                      style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, color: "#a5b4fc", textDecoration: "none", border: "1px solid rgba(124,58,237,0.35)", borderRadius: 8, padding: "5px 9px", whiteSpace: "nowrap" }}
                    >
                      🎥 Join class
                    </a>
                  )}
                </div>
              ))
            )}

            <a className="spl-btn primary" href="/calendar" style={{ width: "100%", marginTop: 18, textDecoration: "none" }}>
              Open full calendar →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPopup;
