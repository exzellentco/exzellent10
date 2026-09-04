import { useCallback, useEffect, useState } from "react";
import { Coins, Check, Sparkles } from "lucide-react";
import { apiUrl, authHeaders } from "../../APIs/apiBase";

/**
 * Missions: small things worth doing, each paying credits once.
 *
 * They double as a tour of the platform — someone finds out what is here by
 * being paid a little to try it. Shared by the free student and teacher
 * dashboards, which pass their own palette in, because the two lists behave
 * identically and only the colours differ.
 *
 * Completion is decided by the SERVER, from the same records the rest of the
 * platform reads. This component only ever asks to be paid; it cannot assert
 * that something was done, and a claim for work that is not there comes back
 * refused. That is deliberate — anything else would be a credit printer for
 * anyone with the network tab open.
 */

const call = async (path, options = {}) => {
  const res = await fetch(apiUrl(path), {
    ...options,
    headers: { "Content-Type": "application/json", ...authHeaders(), ...(options.headers || {}) },
  });
  let body = null;
  try { body = await res.json(); } catch { /* some errors have no body */ }
  if (!res.ok || body?.success === false) {
    throw new Error(body?.message || `Could not load your missions (${res.status}).`);
  }
  return body;
};

const Missions = ({ theme, onCreditsChange }) => {
  const [missions, setMissions] = useState([]);
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [claiming, setClaiming] = useState("");

  const t = {
    card: theme?.card || "var(--sd-card-bg)",
    border: theme?.border || "var(--sd-border)",
    ink: theme?.ink || "var(--sd-ink)",
    muted: theme?.muted || "var(--sd-ink-muted)",
    accent: theme?.accent || "var(--sd-primary)",
    gold: theme?.gold || theme?.accent || "var(--sd-gold)",
    heading: theme?.heading || "var(--sd-font-heading)",
  };

  const load = useCallback(async () => {
    try {
      setError("");
      const body = await call("/api/missions");
      setMissions(Array.isArray(body?.data) ? body.data : []);
      setCredits(body?.credits ?? null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const claim = async (mission) => {
    if (claiming) return;
    setClaiming(mission.id);
    try {
      const body = await call("/api/missions/claim", {
        method: "POST",
        body: JSON.stringify({ id: mission.id }),
      });
      setMissions((prev) => prev.map((m) => (m.id === mission.id ? { ...m, claimed: true, done: true } : m)));
      if (typeof body?.credits === "number") {
        setCredits(body.credits);
        onCreditsChange?.(body.credits);
      }
      setError("");
    } catch (err) {
      // The server refused — most likely the work is not actually there, or it
      // was already claimed in another tab. Re-read rather than guess.
      setError(err.message);
      load();
    } finally {
      setClaiming("");
    }
  };

  const claimed = missions.filter((m) => m.claimed).length;
  const ready = missions.filter((m) => m.done && !m.claimed);
  const pct = missions.length ? Math.round((claimed / missions.length) * 100) : 0;

  return (
    <div className="mb-8 rounded-2xl p-6" style={{ background: t.card, border: `1px solid ${t.border}` }}>
      <div className="flex items-baseline justify-between gap-3 flex-wrap mb-1">
        <h2 className="text-2xl font-semibold m-0" style={{ color: t.ink, fontFamily: t.heading }}>
          Missions
        </h2>
        {credits !== null && (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: t.gold }}>
            <Coins className="w-4 h-4" /> {credits} credits
          </span>
        )}
      </div>
      <p className="mt-1 mb-4 text-sm" style={{ color: t.muted }}>
        Small things worth doing. Each one pays credits, once.
      </p>

      {!loading && missions.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between text-xs mb-1.5" style={{ color: t.muted }}>
            <span>{claimed} of {missions.length} done</span>
            {ready.length > 0 && (
              <span style={{ color: t.gold }}>
                {ready.length} ready to claim
              </span>
            )}
          </div>
          <div className="rounded-full overflow-hidden" style={{ height: 6, background: t.border }}>
            <div
              style={{
                width: `${pct}%`, height: "100%", background: t.accent,
                transition: "width .4s cubic-bezier(.16,1,.3,1)",
              }}
            />
          </div>
        </div>
      )}

      {error && <p className="text-sm mb-3" style={{ color: "#f0a09b" }}>{error}</p>}

      {loading ? (
        <p className="text-sm m-0" style={{ color: t.muted }}>Loading your missions…</p>
      ) : !missions.length ? (
        <p className="text-sm m-0" style={{ color: t.muted }}>No missions right now.</p>
      ) : (
        <ul className="list-none p-0 m-0 flex flex-col gap-2">
          {missions.map((m) => {
            const isReady = m.done && !m.claimed;
            return (
              <li
                key={m.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl p-3.5"
                style={{
                  border: `1px solid ${isReady ? t.gold : t.border}`,
                  background: isReady ? "rgba(255,255,255,0.02)" : "transparent",
                  opacity: m.claimed ? 0.65 : 1,
                }}
              >
                <span
                  className="flex-none grid place-items-center rounded-lg"
                  style={{
                    width: 30, height: 30,
                    border: `1px solid ${m.claimed ? t.accent : t.border}`,
                    background: m.claimed ? t.accent : "transparent",
                    color: m.claimed ? "#fff" : t.muted,
                  }}
                >
                  {m.claimed ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </span>

                <span className="flex-1 min-w-[12rem]">
                  <b
                    className="block text-sm"
                    style={{ color: t.ink, textDecoration: m.claimed ? "line-through" : "none" }}
                  >
                    {m.title}
                  </b>
                  <span className="block text-xs mt-0.5" style={{ color: t.muted }}>{m.blurb}</span>
                </span>

                {m.claimed ? (
                  <span className="flex-none text-xs font-semibold" style={{ color: t.muted }}>
                    +{m.credits} earned
                  </span>
                ) : isReady ? (
                  <button
                    type="button"
                    onClick={() => claim(m)}
                    disabled={!!claiming}
                    className="flex-none inline-flex items-center gap-1.5 px-3 rounded-full text-sm font-semibold"
                    style={{
                      minHeight: 36, border: `1px solid ${t.gold}`, color: t.gold,
                      background: "transparent",
                      cursor: claiming ? "wait" : "pointer",
                      opacity: claiming && claiming !== m.id ? 0.5 : 1,
                    }}
                  >
                    <Coins className="w-4 h-4" />
                    {claiming === m.id ? "Claiming…" : `Claim +${m.credits}`}
                  </button>
                ) : (
                  <span className="flex-none text-xs" style={{ color: t.muted }}>+{m.credits}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Missions;
