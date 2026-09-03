import React, { useEffect, useState } from "react";
import { Flame, Gift, CalendarCheck, TrendingUp } from "lucide-react";
import { getStreak, getMyAttendance } from "../../APIs/learning";
import axios from "../../utils/axios";

/**
 * The learner's momentum: study streak, attendance, and how their referrals are
 * doing.
 *
 * Each figure is fetched independently and any one may fail without taking the
 * panel down — referrals in particular is not something every account has, and
 * a missing referral code should not hide the streak beside it.
 */

const Tile = ({ icon, value, label, sub }) => (
  <div className="rounded-xl p-4" style={{ border: "1px solid var(--sd-border, rgba(255,255,255,.1))" }}>
    <span className="inline-flex opacity-70 mb-2" style={{ color: "var(--sd-accent, #8C51F0)" }}>{icon}</span>
    <div className="text-2xl font-semibold leading-none tabular-nums" style={{ color: "var(--sd-ink, #fff)" }}>
      {value}
    </div>
    <div className="text-xs opacity-60 mt-1.5">{label}</div>
    {sub && <div className="text-xs opacity-40 mt-0.5">{sub}</div>}
  </div>
);

const GrowthDashboard = () => {
  const [streak, setStreak] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [referral, setReferral] = useState(null);

  useEffect(() => {
    let alive = true;
    // Settled, not all: one failure here must not blank the other two.
    Promise.allSettled([
      getStreak(),
      getMyAttendance(),
      axios.get("/api/referrals/my-code").then((r) => r.data),
    ]).then(([s, a, r]) => {
      if (!alive) return;
      if (s.status === "fulfilled") setStreak(s.value?.streak ?? s.value ?? null);
      if (a.status === "fulfilled") setAttendance(a.value?.data ?? a.value ?? null);
      if (r.status === "fulfilled") setReferral(r.value?.data ?? r.value ?? null);
    });
    return () => { alive = false; };
  }, []);

  const attended = attendance?.attended ?? attendance?.present ?? 0;
  const booked = attendance?.booked ?? attendance?.total ?? 0;
  const rate = booked ? Math.round((attended / booked) * 100) : null;

  return (
    <div className="text-left">
      <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--sd-ink, #fff)" }}>
        Your momentum
      </h3>
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Tile
          icon={<Flame size={18} />}
          value={streak?.count ?? 0}
          label="Day streak"
          sub={streak?.longest ? `best ${streak.longest}` : null}
        />
        <Tile
          icon={<CalendarCheck size={18} />}
          value={rate == null ? "—" : `${rate}%`}
          label="Attendance"
          sub={booked ? `${attended} of ${booked}` : null}
        />
        <Tile
          icon={<Gift size={18} />}
          value={referral?.invitedCount ?? 0}
          label="Friends invited"
          sub={referral?.code ? `code ${referral.code}` : null}
        />
        <Tile
          icon={<TrendingUp size={18} />}
          value={referral?.creditsEarned ?? 0}
          label="Credits earned"
          sub="from referrals"
        />
      </div>
    </div>
  );
};

export default GrowthDashboard;
