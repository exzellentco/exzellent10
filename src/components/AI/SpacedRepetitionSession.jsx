import React, { useCallback, useEffect, useState } from "react";
import { X, RotateCcw, Flame } from "lucide-react";
import { getDueCards, gradeCard } from "../../APIs/learning";

/**
 * A flashcard review, one card at a time: tap to flip, then grade it.
 *
 * The grades map to the backend's SM-2 scheduling — "Again" brings the card
 * back today, the rest push it further out the better you knew it. The
 * scheduling lives on the server, so this deliberately holds no opinion about
 * when a card returns; it reports how it went and moves on.
 *
 * `deckId` narrows the session to one deck when the caller has one in mind.
 * Without it, everything due across the learner's courses is reviewed.
 */

const GRADES = [
  { g: 0, label: "Again", tint: "#e8756f" },
  { g: 1, label: "Hard", tint: "#f0b23c" },
  { g: 2, label: "Good", tint: "#5ae287" },
  { g: 3, label: "Easy", tint: "#7fb2f0" },
];

const SpacedRepetitionSession = ({ deckId, onClose }) => {
  const [cards, setCards] = useState([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [streak, setStreak] = useState(0);
  const [reviewed, setReviewed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDueCards();
      const all = Array.isArray(res?.data) ? res.data : [];
      // A deck id narrows the session; cardId is "<deckId>:<order>".
      const mine = deckId ? all.filter((c) => String(c.cardId).startsWith(`${deckId}:`)) : all;
      setCards(mine);
      setStreak(res?.streak?.count || 0);
      setIdx(0); setFlipped(false); setReviewed(0); setError("");
    } catch (e) {
      setError(e?.message || "Could not load your review.");
    } finally {
      setLoading(false);
    }
  }, [deckId]);

  useEffect(() => { load(); }, [load]);

  const current = cards[idx];
  const done = !loading && (!cards.length || idx >= cards.length);

  const grade = async (g) => {
    if (!current || busy) return;
    setBusy(true);
    try {
      const res = await gradeCard(current.cardId, g);
      if (res?.streak?.count != null) setStreak(res.streak.count);
      setReviewed((n) => n + 1);
      setFlipped(false);
      setIdx((i) => i + 1);
    } catch (e) {
      setError(e?.message || "Could not save that.");
    } finally {
      setBusy(false);
    }
  };

  // Keyboard: space flips, 1-4 grade. Reviewing a deck is repetitive enough
  // that reaching for the mouse each time is the slow part.
  useEffect(() => {
    const onKey = (e) => {
      if (done || !current) return;
      if (e.code === "Space") { e.preventDefault(); setFlipped((f) => !f); return; }
      if (!flipped) return;
      const n = Number(e.key);
      if (n >= 1 && n <= 4) grade(n - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="spl-overlay" role="dialog" aria-modal="true" aria-label="Daily review">
      <div className="spl-panel" style={{ maxWidth: 560 }}>
        <header className="flex items-center gap-3 mb-4">
          <h3 className="text-lg font-semibold m-0 flex-1">Daily review</h3>
          <span className="inline-flex items-center gap-1.5 text-sm opacity-80">
            <Flame size={15} /> {streak}
          </span>
          <button type="button" onClick={onClose} aria-label="Close" className="opacity-70">
            <X size={18} />
          </button>
        </header>

        {loading && <p className="opacity-70">Loading your cards…</p>}
        {error && <p style={{ color: "#f0a09b" }}>{error}</p>}

        {!loading && done && (
          <div className="text-center py-10">
            <p className="text-lg mb-1">
              {reviewed ? `${reviewed} card${reviewed === 1 ? "" : "s"} reviewed.` : "All caught up."}
            </p>
            <p className="opacity-60 text-sm mb-5">
              {reviewed ? "That is today's batch done." : "Nothing is due right now — come back tomorrow."}
            </p>
            <button
              type="button"
              onClick={load}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm"
              style={{ border: "1px solid rgba(255,255,255,.15)" }}
            >
              <RotateCcw size={14} /> Check again
            </button>
          </div>
        )}

        {!loading && !done && current && (
          <>
            <p className="text-xs uppercase tracking-widest opacity-50 mb-2">
              {current.courseTitle} · {idx + 1} of {cards.length}
            </p>

            <button
              type="button"
              onClick={() => setFlipped((f) => !f)}
              className="w-full text-center rounded-2xl px-6 py-12 mb-5"
              style={{ border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.03)" }}
            >
              <span className="block text-xl font-medium">{flipped ? current.back : current.front}</span>
              {!flipped && (
                <span className="block mt-4 text-xs opacity-50">Tap, or press space, to flip</span>
              )}
            </button>

            {flipped ? (
              <div className="grid grid-cols-4 gap-2">
                {GRADES.map((g) => (
                  <button
                    key={g.g}
                    type="button"
                    disabled={busy}
                    onClick={() => grade(g.g)}
                    className="py-2.5 rounded-full text-sm disabled:opacity-40"
                    style={{ border: `1px solid ${g.tint}66`, color: g.tint }}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-center text-xs opacity-40">
                Answer it in your head first — grading a card you did not try teaches nothing.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SpacedRepetitionSession;
