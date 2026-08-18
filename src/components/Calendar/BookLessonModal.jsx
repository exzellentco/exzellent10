import { useState, useEffect } from "react";
import { bookLesson } from "../../APIs/learning";

/*
 * Student self-booking: pick a teacher, a date and a time, and book a 1-to-1
 * lesson. The backend deducts credits (500) and creates the calendar booking.
 * Styled with the shared .spl-* popup classes.
 *
 *   <BookLessonModal onClose={...} onBooked={(creditsRemaining) => ...} />
 */
const LESSON_COST = 500;
const HOURS = Array.from({ length: 12 }, (_, i) => `${String(9 + i).padStart(2, "0")}:00`); // 09:00–20:00

const BookLessonModal = ({ onClose, onBooked }) => {
  const [teachers, setTeachers] = useState([]);
  const [teacherId, setTeacherId] = useState("");
  const [date, setDate] = useState("");
  const [start, setStart] = useState("10:00");
  const [title, setTitle] = useState("1-to-1 lesson");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null); // {creditsRemaining}

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/teachers");
        const data = await res.json().catch(() => ({}));
        const list = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
        setTeachers(list);
        if (list[0]) setTeacherId(list[0]._id || list[0].userId);
      } catch { /* leave empty */ }
    })();
    // Default the date to tomorrow.
    const d = new Date(); d.setDate(d.getDate() + 1);
    setDate(d.toISOString().slice(0, 10));
  }, []);

  const submit = async () => {
    setError("");
    if (!teacherId || !date || !start) { setError("Pick a teacher, date and time."); return; }
    setBusy(true);
    try {
      const res = await bookLesson({ teacherId, date, start, title, durationMin: 60 });
      if (res.success === false) { setError(res.message || "Couldn't book that."); return; }
      setDone({ creditsRemaining: res.creditsRemaining });
      onBooked?.(res.creditsRemaining);
    } catch (e) {
      setError(e.message || "Couldn't book that lesson.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="spl-root">
      <div className="spl-overlay" onClick={onClose}>
        <div className="spl-panel" onClick={(e) => e.stopPropagation()}>
          <div className="spl-aura" />
          <div className="spl-head">
            <span className="spl-mic">📅</span>
            <div><h3>Book a lesson</h3><p>1-to-1 with a teacher · {LESSON_COST} credits</p></div>
            <button className="spl-close" onClick={onClose} aria-label="Close">×</button>
          </div>

          <div className="spl-body">
            {done ? (
              <div style={{ textAlign: "center", padding: "20px 8px" }}>
                <div style={{ fontSize: 42 }}>✅</div>
                <div className="spl-report-h" style={{ marginTop: 8 }}>Lesson booked!</div>
                <p className="spl-sub" style={{ marginTop: 6 }}>
                  It's on your calendar. {done.creditsRemaining != null && <>Credits left: <b>{done.creditsRemaining.toLocaleString()}</b>.</>}
                </p>
                <button className="spl-btn primary" style={{ marginTop: 14 }} onClick={onClose}>Done</button>
              </div>
            ) : (
              <>
                <div className="spl-label">Teacher</div>
                <select className="spl-select" value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
                  {teachers.length === 0 && <option value="">No teachers available</option>}
                  {teachers.map((t) => {
                    const id = t._id || t.userId;
                    return <option key={id} value={id}>{t.name || `${t.firstName || ""} ${t.lastName || ""}`.trim() || "Teacher"}</option>;
                  })}
                </select>

                <div className="spl-row" style={{ marginTop: 12 }}>
                  <div>
                    <div className="spl-label">Date</div>
                    <input className="spl-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                  </div>
                  <div>
                    <div className="spl-label">Time</div>
                    <select className="spl-select" value={start} onChange={(e) => setStart(e.target.value)}>
                      {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                </div>

                <div className="spl-label" style={{ marginTop: 12 }}>Focus / topic</div>
                <input className="spl-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Speaking practice" />

                {error && <p className="spl-err">{error}</p>}
                <button className="spl-rec" style={{ marginTop: 16 }} onClick={submit} disabled={busy}>
                  {busy ? <><span className="spl-spin" />Booking…</> : `Book lesson · ${LESSON_COST} credits`}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookLessonModal;
