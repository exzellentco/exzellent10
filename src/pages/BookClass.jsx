import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getSlots } from "../APIs/calendar";
import { bookLesson } from "../APIs/learning";
import DashboardShell from "../components/DashboardShell";

/*
 * Preply-style class booking — three clear steps:
 *   1. Pick a teacher   (cards, selecting loads their open slots)
 *   2. Pick a time      (slots grouped by day, start-times as chips)
 *   3. Confirm          (summary + focus/topic + book → spends 500 credits)
 *
 * Wrapped in the shared "ex-" dashboard look via DashboardShell (student role).
 */

const LESSON_COST = 500;
const DURATION_MIN = 60;
const DAYS_AHEAD = 14;
const FALLBACK_AVATAR =
  "https://res.cloudinary.com/dsgxyezcm/image/upload/v1767878441/Anonymous_b5hlab.jpg";

// Local YYYY-MM-DD (avoids the UTC shift of toISOString()).
const isoDate = (d) => {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

const teacherName = (t) =>
  t?.name ||
  `${t?.firstName || ""} ${t?.lastName || ""}`.trim() ||
  "Teacher";

const teacherSubtitle = (t) => {
  const subjects = t?.subjects || t?.taughtLanguages;
  if (Array.isArray(subjects) && subjects.length) return subjects.join(" · ");
  if (typeof subjects === "string" && subjects) return subjects;
  if (t?.bio) return t.bio;
  return "1-to-1 language coaching";
};

const teacherMeta = (t) => {
  const bits = [];
  if (t?.yearsExperience) bits.push(`${t.yearsExperience} yrs experience`);
  const place = t?.city || t?.countryOfResidence;
  if (place) bits.push(place);
  return bits.join(" · ");
};

// Group flat [{date,start,end}] slots into [{date, label, times:[{start,end}]}].
const groupByDay = (slots) => {
  const map = new Map();
  for (const s of slots) {
    if (!map.has(s.date)) map.set(s.date, []);
    map.get(s.date).push(s);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, times]) => {
      const d = new Date(`${date}T00:00:00`);
      return {
        date,
        label: d.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        times: times.sort((x, y) => x.start.localeCompare(y.start)),
      };
    });
};

const prettyDate = (date) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

const Stepper = ({ step }) => {
  const steps = ["Teacher", "Time", "Confirm"];
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      {steps.map((label, i) => {
        const n = i + 1;
        const active = step === n;
        const done = step > n;
        return (
          <React.Fragment key={label}>
            <div className="flex items-center gap-2">
              <span
                aria-current={active ? "step" : undefined}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 26,
                  height: 26,
                  borderRadius: 999,
                  fontSize: ".8rem",
                  fontWeight: 700,
                  border: "1px solid var(--ex-line)",
                  background:
                    active || done ? "var(--ex-grad)" : "rgba(255,255,255,.03)",
                  color: active || done ? "#06121c" : "var(--ex-muted)",
                }}
              >
                {done ? "✓" : n}
              </span>
              <span
                style={{
                  fontSize: ".85rem",
                  fontWeight: 600,
                  color: active
                    ? "var(--pL)"
                    : done
                    ? "var(--ex-text)"
                    : "var(--ex-muted)",
                }}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <span
                aria-hidden="true"
                style={{
                  flex: "0 0 24px",
                  height: 1,
                  background: "var(--ex-line)",
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const BookClass = () => {
  const [teachers, setTeachers] = useState([]);
  const [teachersLoading, setTeachersLoading] = useState(true);
  const [teachersError, setTeachersError] = useState("");

  const [selected, setSelected] = useState(null); // teacher object
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");

  const [pick, setPick] = useState(null); // { date, start, end }
  const [topic, setTopic] = useState("");

  const [booking, setBooking] = useState(false);
  const [bookError, setBookError] = useState("");
  const [result, setResult] = useState(null); // { meetingUrl, creditsRemaining, ... }

  const step = result ? 3 : pick ? 3 : selected ? 2 : 1;

  // ---- Step 1: load teachers -------------------------------------------------
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setTeachersLoading(true);
        setTeachersError("");
        const res = await fetch("/api/teachers");
        const data = await res.json();
        const list = data.data || data;
        if (!alive) return;
        setTeachers(Array.isArray(list) ? list : []);
      } catch {
        if (alive) setTeachersError("Couldn't load teachers. Please try again.");
      } finally {
        if (alive) setTeachersLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // ---- Step 2: load slots for the selected teacher ---------------------------
  const chooseTeacher = async (t) => {
    setSelected(t);
    setPick(null);
    setResult(null);
    setBookError("");
    setSlots([]);
    setSlotsError("");
    setSlotsLoading(true);
    try {
      const today = new Date();
      const to = new Date();
      to.setDate(today.getDate() + DAYS_AHEAD);
      const id = t._id || t.userId;
      const list = await getSlots(id, isoDate(today), isoDate(to));
      setSlots(Array.isArray(list) ? list : []);
    } catch {
      setSlotsError("Couldn't load open times. Please try again.");
    } finally {
      setSlotsLoading(false);
    }
  };

  // ---- Step 3: confirm booking -----------------------------------------------
  const confirm = async () => {
    if (!selected || !pick) return;
    setBooking(true);
    setBookError("");
    try {
      const res = await bookLesson({
        teacherId: selected._id || selected.userId,
        date: pick.date,
        start: pick.start,
        title: topic.trim() || "1-to-1 lesson",
        durationMin: DURATION_MIN,
      });
      if (res && res.success === false) {
        setBookError(res.message || "Couldn't book that class.");
        return;
      }
      setResult({
        meetingUrl: res?.data?.meetingUrl,
        creditsRemaining: res?.creditsRemaining,
      });
    } catch (e) {
      setBookError(e.message || "Something went wrong. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  const resetAll = () => {
    setSelected(null);
    setSlots([]);
    setPick(null);
    setTopic("");
    setResult(null);
    setBookError("");
    setSlotsError("");
  };

  const grouped = groupByDay(slots);
  const notEnoughCredits =
    !!bookError && /credit/i.test(bookError);

  return (
    <DashboardShell
      role="student"
      eyebrow="Book a class"
      title={
        <>
          Book a <span className="ex-g">1-to-1 class</span>
        </>
      }
      lead="Pick a teacher, choose an open time, and confirm — your Zoom link is generated instantly."
    >
      <Stepper step={step} />

      <div className="grid lg:grid-cols-[1fr_minmax(0,340px)] gap-6 items-start">
        {/* -------- LEFT: teacher + time selection -------- */}
        <div className="grid gap-6">
          {/* STEP 1 — Pick a teacher */}
          <div className="ex-card ex-reveal">
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <div>
                <div className="ex-eyebrow" style={{ marginBottom: 6 }}>
                  Step 1
                </div>
                <h2
                  style={{
                    fontFamily: "var(--ex-font)",
                    fontWeight: 700,
                    fontSize: "1.25rem",
                  }}
                >
                  Pick a teacher
                </h2>
              </div>
              {selected && (
                <span className="ex-badge ex-badge-accent">
                  {teacherName(selected)}
                </span>
              )}
            </div>

            {teachersLoading ? (
              <div className="flex items-center gap-3 py-8 justify-center">
                <span className="ex-spinner" />
                <span className="ex-lead">Loading teachers…</span>
              </div>
            ) : teachersError ? (
              <div
                className="flex flex-col items-center gap-3 py-8"
                style={{ textAlign: "center" }}
              >
                <p style={{ color: "#fca5a5" }}>{teachersError}</p>
                <button
                  className="ex-btn ex-btn-ghost"
                  onClick={() => window.location.reload()}
                >
                  Try again
                </button>
              </div>
            ) : teachers.length === 0 ? (
              <p className="ex-lead">No teachers are available right now.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {teachers.map((t) => {
                  const id = t._id || t.userId;
                  const isActive =
                    selected && (selected._id || selected.userId) === id;
                  return (
                    <button
                      key={id}
                      onClick={() => chooseTeacher(t)}
                      className="ex-card-hover"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        textAlign: "left",
                        cursor: "pointer",
                        border: `1px solid ${
                          isActive ? "rgba(var(--pRGB),.6)" : "var(--ex-line)"
                        }`,
                        borderRadius: 14,
                        padding: 14,
                        background: isActive
                          ? "rgba(var(--pRGB),.08)"
                          : "rgba(255,255,255,.02)",
                        color: "var(--ex-text)",
                      }}
                    >
                      <img
                        src={t.profileImage || FALLBACK_AVATAR}
                        alt=""
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 12,
                          objectFit: "cover",
                          flexShrink: 0,
                        }}
                      />
                      <div className="min-w-0">
                        <p
                          style={{ fontWeight: 700 }}
                          className="truncate"
                        >
                          {teacherName(t)}
                        </p>
                        <p
                          className="ex-lead truncate"
                          style={{ fontSize: ".82rem" }}
                        >
                          {teacherSubtitle(t)}
                        </p>
                        {teacherMeta(t) && (
                          <p
                            style={{
                              fontSize: ".72rem",
                              color: "var(--pL)",
                              marginTop: 2,
                            }}
                            className="truncate"
                          >
                            {teacherMeta(t)}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* STEP 2 — Pick a time */}
          {selected && (
            <div className="ex-card ex-reveal">
              <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                <div>
                  <div className="ex-eyebrow" style={{ marginBottom: 6 }}>
                    Step 2
                  </div>
                  <h2
                    style={{
                      fontFamily: "var(--ex-font)",
                      fontWeight: 700,
                      fontSize: "1.25rem",
                    }}
                  >
                    Pick a time
                  </h2>
                </div>
                <span className="ex-badge ex-badge-accent">
                  {LESSON_COST} credits · 1-to-1 · Zoom
                </span>
              </div>

              {slotsLoading ? (
                <div className="flex items-center gap-3 py-8 justify-center">
                  <span className="ex-spinner" />
                  <span className="ex-lead">Loading open times…</span>
                </div>
              ) : slotsError ? (
                <div
                  className="flex flex-col items-center gap-3 py-8"
                  style={{ textAlign: "center" }}
                >
                  <p style={{ color: "#fca5a5" }}>{slotsError}</p>
                  <button
                    className="ex-btn ex-btn-ghost"
                    onClick={() => chooseTeacher(selected)}
                  >
                    Try again
                  </button>
                </div>
              ) : grouped.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center gap-2 py-12"
                  style={{
                    border: "2px dashed var(--ex-line)",
                    borderRadius: 14,
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 30 }}>🗓️</div>
                  <p style={{ fontWeight: 600 }}>
                    No open slots in the next 2 weeks
                  </p>
                  <p className="ex-lead" style={{ fontSize: ".85rem" }}>
                    Try another teacher — their availability may differ.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {grouped.map((day) => (
                    <div key={day.date}>
                      <div
                        className="ex-label"
                        style={{ marginBottom: 8 }}
                      >
                        {day.label}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {day.times.map((s) => {
                          const isPicked =
                            pick &&
                            pick.date === s.date &&
                            pick.start === s.start;
                          return (
                            <button
                              key={`${s.date}-${s.start}`}
                              onClick={() =>
                                setPick({
                                  date: s.date,
                                  start: s.start,
                                  end: s.end,
                                })
                              }
                              className="ex-btn"
                              style={{
                                padding: "8px 16px",
                                fontSize: ".85rem",
                                border: `1px solid ${
                                  isPicked
                                    ? "transparent"
                                    : "var(--ex-line)"
                                }`,
                                background: isPicked
                                  ? "var(--ex-grad)"
                                  : "rgba(255,255,255,.03)",
                                color: isPicked
                                  ? "#06121c"
                                  : "var(--ex-text)",
                              }}
                            >
                              {s.start}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* -------- RIGHT: confirm / summary -------- */}
        <div className="ex-card ex-reveal" style={{ position: "sticky", top: 100 }}>
          <div className="ex-eyebrow" style={{ marginBottom: 6 }}>
            Step 3
          </div>
          <h2
            style={{
              fontFamily: "var(--ex-font)",
              fontWeight: 700,
              fontSize: "1.25rem",
              marginBottom: 14,
            }}
          >
            Confirm
          </h2>

          {result ? (
            /* ---- Success ---- */
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 42 }}>✅</div>
              <p
                style={{
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  marginTop: 6,
                }}
              >
                Class booked!
              </p>
              <p className="ex-lead" style={{ fontSize: ".85rem", marginTop: 6 }}>
                {teacherName(selected)} · {prettyDate(pick.date)} at{" "}
                {pick.start}
              </p>
              {result.meetingUrl && (
                <a
                  href={result.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ex-btn ex-btn-primary"
                  style={{ width: "100%", marginTop: 16 }}
                >
                  🎥 Join class
                </a>
              )}
              {result.creditsRemaining != null && (
                <p
                  className="ex-lead"
                  style={{ fontSize: ".82rem", marginTop: 12 }}
                >
                  Credits remaining:{" "}
                  <b style={{ color: "var(--pL)" }}>
                    {Number(result.creditsRemaining).toLocaleString()}
                  </b>
                </p>
              )}
              <button
                className="ex-btn ex-btn-ghost"
                style={{ width: "100%", marginTop: 12 }}
                onClick={resetAll}
              >
                Book another class
              </button>
            </div>
          ) : !selected ? (
            <p className="ex-lead" style={{ fontSize: ".9rem" }}>
              Pick a teacher to get started.
            </p>
          ) : !pick ? (
            <p className="ex-lead" style={{ fontSize: ".9rem" }}>
              Choose an open time to continue.
            </p>
          ) : (
            /* ---- Ready to confirm ---- */
            <>
              <div className="grid gap-3" style={{ marginBottom: 14 }}>
                {[
                  ["Teacher", teacherName(selected)],
                  ["Date", prettyDate(pick.date)],
                  ["Time", `${pick.start} – ${pick.end}`],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-3"
                    style={{
                      border: "1px solid var(--ex-line)",
                      borderRadius: 12,
                      padding: "10px 14px",
                    }}
                  >
                    <span className="ex-label" style={{ margin: 0 }}>
                      {label}
                    </span>
                    <span
                      style={{ fontWeight: 600, textAlign: "right" }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <label className="ex-label" htmlFor="bc-topic">
                Focus / topic (optional)
              </label>
              <input
                id="bc-topic"
                className="ex-input"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Speaking practice, interview prep"
              />

              <div
                className="flex items-center justify-between"
                style={{ margin: "14px 0", fontSize: ".85rem" }}
              >
                <span className="ex-lead" style={{ fontSize: ".85rem" }}>
                  Cost
                </span>
                <span style={{ fontWeight: 700, color: "var(--pL)" }}>
                  {LESSON_COST} credits
                </span>
              </div>

              {bookError && (
                <div
                  style={{
                    color: "#fca5a5",
                    fontSize: ".85rem",
                    marginBottom: 12,
                  }}
                >
                  <p>{bookError}</p>
                  {notEnoughCredits && (
                    <Link
                      to="/offer"
                      className="ex-btn ex-btn-ghost"
                      style={{ marginTop: 8, width: "100%" }}
                    >
                      Top up credits
                    </Link>
                  )}
                </div>
              )}

              <button
                className="ex-btn ex-btn-primary"
                style={{ width: "100%" }}
                onClick={confirm}
                disabled={booking}
              >
                {booking ? (
                  <>
                    <span className="ex-spinner" /> Booking…
                  </>
                ) : (
                  "Confirm booking"
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </DashboardShell>
  );
};

export default BookClass;
