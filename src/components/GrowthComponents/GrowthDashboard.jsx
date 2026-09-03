import React, { useEffect, useState } from "react";
import { Flame, CalendarCheck, GraduationCap, Clock } from "lucide-react";
import { getStreak, getMyAttendance } from "../../APIs/learning";
import { useSessions } from "../../context/SessionsContext";

/**
 * The learner's momentum: streak, attendance, and their lessons.
 *
 * Every figure here comes from an endpoint that exists. An earlier version
 * showed referral tiles fed by /api/referrals/my-code, which the backend does
 * not have — the tiles just sat on zero, silently, on every account.
 *
 * Streak and attendance are fetched independently: one failing must not blank
 * the other. Colours are explicit rather than inherited, because this renders
 * inside a page whose body colour is dark, and inherited text vanished.
 */

const MUTED = "var(--sd-ink-muted, #a79cc7)";

const Tile = ({ icon, value, label, sub }) => (
  <div className="py-3 pr-4" style={{ borderTop: "1px solid var(--sd-border, rgba(255,255,255,.1))" }}>
    <span className="inline-flex mb-2" style={{ color: "var(--sd-primary-light, #B392F5)" }}>{icon}</span>
    <div className="text-2xl font-semibold leading-none tabular-nums" style={{ color: "var(--sd-ink, #fff)" }}>
      {value}
    </div>
    <div className="text-xs mt-1.5" style={{ color: MUTED }}>{label}</div>
    {sub && <div className="text-xs mt-0.5" style={{ color: MUTED, opacity: 0.7 }}>{sub}</div>}
  </div>
);

const GrowthDashboard = () => {
  const [streak, setStreak] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const { sessions } = useSessions();

  useEffect(() => {
    let alive = true;
    Promise.allSettled([getStreak(), getMyAttendance()]).then(([s, a]) => {
      if (!alive) return;
      if (s.status === "fulfilled") setStreak(s.value?.streak ?? s.value ?? null);
      if (a.status === "fulfilled") setAttendance(a.value?.data ?? a.value ?? null);
    });
    return () => { alive = false; };
  }, []);

  const attended = attendance?.attended ?? attendance?.present ?? 0;
  const booked = attendance?.booked ?? attendance?.total ?? 0;
  const rate = booked ? Math.round((attended / booked) * 100) : null;
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = (sessions || []).filter((b) => b?.date >= today).length;
  const next = (sessions || []).filter((b) => b?.date >= today).sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))[0];

  return (
    <div className="text-left">
      <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--sd-ink, #fff)" }}>
        Your momentum
      </h3>
      <div className="grid gap-x-6 grid-cols-2 lg:grid-cols-4">
        <Tile icon={<Flame size={18} />} value={streak?.count ?? 0} label="Day streak"
          sub={streak?.longest ? `best ${streak.longest}` : null} />
        <Tile icon={<CalendarCheck size={18} />} value={rate == null ? "—" : `${rate}%`} label="Attendance"
          sub={booked ? `${attended} of ${booked}` : null} />
        <Tile icon={<GraduationCap size={18} />} value={upcoming} label="Lessons ahead" />
        <Tile icon={<Clock size={18} />} value={next ? next.start : "—"} label="Next lesson"
          sub={next ? next.date : null} />
      </div>
    </div>
  );
};

export default GrowthDashboard;
