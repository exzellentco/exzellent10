import React, { useMemo } from "react";
import { Video, Clock, User, CalendarX } from "lucide-react";
import { useSessions } from "../../context/SessionsContext";

/**
 * The learner's one-to-one sessions, split into what is still to come and what
 * has already happened.
 *
 * Upcoming is sorted soonest-first and past most-recent-first: in both cases
 * the row nearest to now is the one you came to look at.
 */

const dt = (b) => new Date(`${b.date}T${b.start || "00:00"}:00`);

const Row = ({ b, past }) => (
  <li
    className="flex items-center gap-3 py-3"
    style={{ borderBottom: "1px solid var(--sd-border, rgba(255,255,255,.08))" }}
  >
    <span className="flex-none w-14 tabular-nums">
      <b className="block text-sm" style={{ color: "var(--sd-ink, #fff)" }}>{b.start || "—"}</b>
      <i className="block not-italic text-xs opacity-60">{b.end || ""}</i>
    </span>
    <span className="flex-1 min-w-0">
      <b className="block text-sm truncate" style={{ color: "var(--sd-ink, #fff)" }}>
        {b.title || "1-to-1 lesson"}
      </b>
      <span className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs opacity-60">
        <span className="inline-flex items-center gap-1">
          <User size={11} /> {b.teacherName || b.providerName || b.who || "—"}
        </span>
        {b.durationMin ? (
          <span className="inline-flex items-center gap-1"><Clock size={11} /> {b.durationMin} min</span>
        ) : null}
        <span>{b.date}</span>
      </span>
    </span>
    {!past && b.meetingUrl && (
      <a
        href={b.meetingUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-none inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
        style={{ border: "1px solid var(--sd-border, rgba(255,255,255,.15))", color: "var(--sd-ink, #fff)" }}
      >
        <Video size={13} /> Join
      </a>
    )}
  </li>
);

const MyBookings = () => {
  const { sessions, loading, error } = useSessions();

  const { upcoming, past } = useMemo(() => {
    const now = new Date();
    const rows = (sessions || []).filter((b) => b && b.date);
    return {
      upcoming: rows.filter((b) => dt(b) >= now).sort((a, b) => dt(a) - dt(b)),
      past: rows.filter((b) => dt(b) < now).sort((a, b) => dt(b) - dt(a)).slice(0, 10),
    };
  }, [sessions]);

  if (loading) return <p className="opacity-60 text-sm">Loading your sessions…</p>;
  if (error) return <p className="text-sm" style={{ color: "#f0a09b" }}>{error}</p>;

  if (!upcoming.length && !past.length) {
    return (
      <div className="text-center py-10 opacity-70">
        <CalendarX size={26} className="mx-auto mb-3 opacity-50" />
        <p className="text-sm">No sessions booked yet.</p>
      </div>
    );
  }

  return (
    <div className="text-left">
      {!!upcoming.length && (
        <>
          <h4 className="text-xs uppercase tracking-widest opacity-50 mb-1">Upcoming</h4>
          <ul className="list-none p-0 m-0 mb-6">
            {upcoming.map((b) => <Row key={b._id} b={b} />)}
          </ul>
        </>
      )}
      {!!past.length && (
        <>
          <h4 className="text-xs uppercase tracking-widest opacity-50 mb-1">Past</h4>
          <ul className="list-none p-0 m-0 opacity-70">
            {past.map((b) => <Row key={b._id} b={b} past />)}
          </ul>
        </>
      )}
    </div>
  );
};

export default MyBookings;
