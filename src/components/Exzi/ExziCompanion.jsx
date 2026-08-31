import React, { useCallback, useEffect, useRef, useState } from "react";
import { Send, X, Square, Sparkles } from "lucide-react";
import { streamExzi, sessionIdFor } from "../../APIs/exziChat";
import { plainText } from "../../utils/plainText";

/**
 * Exzi — the AI companion docked on the student and teacher dashboards.
 *
 * Unlike the public Exzi page (which is anonymous, one-shot and rate limited),
 * this one is authenticated: the backend keeps the conversation in Redis and
 * streams replies, so there is no prompt cap here. Being logged in IS the
 * entitlement, so no counting is needed on the client.
 *
 * Props:
 *   role     "student" | "teacher"  — drives accent colour and the prompt chips
 *   name     display name, required by the endpoint
 *   userId   used only to key the per-tab session id
 *   profile  optional extras; pass { mode:"tutor", nativeLanguage, targetLanguage, level }
 *            to get the CEFR-aware tutor instead of the general companion
 */
const ExziCompanion = ({ role = "student", name, userId, profile = {} }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const threadRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);
  const sessionId = useRef(sessionIdFor(userId)).current;

  // The dashboards already stack floating pills in this corner (.spl-fab:
  // "Speaking practice", "AI Tools", "Messages"). How many are present differs
  // by role and by which panels are open, so measure the stack instead of
  // hardcoding an offset - otherwise the orb lands on top of one of them and
  // steals its clicks.
  const [lift, setLift] = useState(22);
  useEffect(() => {
    const measure = () => {
      // NB: offsetParent is null for position:fixed elements, so it cannot be
      // used as the "is it visible" test here - measure the box instead.
      const fabs = [...document.querySelectorAll(".spl-fab")]
        .map((el) => el.getBoundingClientRect())
        .filter((r) => r.width > 0 && r.height > 0);
      if (!fabs.length) return setLift(22);
      const highest = Math.max(...fabs.map((r) => window.innerHeight - r.top));
      setLift(Math.round(highest) + 12);
    };
    measure();
    window.addEventListener("resize", measure);
    // Those pills mount and unmount as panels open, so watch for that too.
    let t;
    const obs = new MutationObserver(() => { clearTimeout(t); t = setTimeout(measure, 120); });
    obs.observe(document.body, { childList: true, subtree: true });
    return () => {
      window.removeEventListener("resize", measure);
      obs.disconnect();
      clearTimeout(t);
    };
  }, []);

  const accent = role === "teacher" ? "249,115,22" : "6,182,212";

  const chips =
    role === "teacher"
      ? ["Draft a lesson plan for A2 speaking", "Summarise my week", "Ideas to re-engage a quiet student"]
      : ["Explain the Dativ case simply", "Quiz me on 10 travel words", "How do I prepare for TestDaF?"];

  // Keep the newest message in view as the reply streams in.
  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Abort any in-flight stream if the component goes away mid-reply.
  useEffect(() => () => abortRef.current?.abort(), []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setBusy(false);
  }, []);

  const ask = useCallback(
    async (text) => {
      const question = String(text || "").trim();
      if (!question || busy) return;

      setError("");
      setDraft("");
      setMessages((m) => [...m, { role: "user", content: question }, { role: "assistant", content: "" }]);
      setBusy(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await streamExzi({
          sessionId,
          userMessage: question,
          profile: { name: name || "there", mode: "generic", ...profile },
          signal: controller.signal,
          // Replace the trailing assistant message as fragments arrive.
          onChunk: (_frag, full) =>
            setMessages((m) => {
              const next = [...m];
              next[next.length - 1] = { role: "assistant", content: full };
              return next;
            }),
        });
      } catch (err) {
        if (err.name === "AbortError") {
          setMessages((m) => {
            const next = [...m];
            const last = next[next.length - 1];
            if (last && !last.content) next.pop(); // drop an empty bubble
            return next;
          });
        } else {
          setError(err.message || "Something went wrong.");
          setMessages((m) => {
            const next = [...m];
            if (next[next.length - 1]?.role === "assistant" && !next[next.length - 1].content) next.pop();
            return next;
          });
        }
      } finally {
        setBusy(false);
        abortRef.current = null;
      }
    },
    [busy, name, profile, sessionId]
  );

  return (
    <>
      {/* launcher */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close Exzi" : "Ask Exzi"}
        aria-expanded={open}
        className="exzi-orb"
        style={{ "--exzi-accent": accent, "--exzi-lift": `${lift}px` }}
      >
        <Sparkles size={22} />
        <i aria-hidden="true" />
      </button>

      {open && (
        <section
          className="exzi-dock"
          style={{ "--exzi-accent": accent, "--exzi-lift": `${lift}px` }}
          aria-label="Exzi companion"
        >
          <header className="exzi-dock-head">
            <span className="exzi-dot" aria-hidden="true" />
            <div>
              <b>Exzi</b>
              <small>{role === "teacher" ? "your teaching companion" : "your AI companion"}</small>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close">
              <X size={16} />
            </button>
          </header>

          <div className="exzi-thread" ref={threadRef}>
            {messages.length === 0 && (
              <div className="exzi-welcome">
                <p>
                  Hi {name ? name.split(" ")[0] : "there"} — ask me anything. No limits here, you are signed in.
                </p>
                <div className="exzi-chips">
                  {chips.map((c) => (
                    <button key={c} type="button" onClick={() => ask(c)}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`exzi-msg ${m.role}`}>
                <div className="exzi-bubble">
                  {m.content
                    ? plainText(m.content)
                    : <span className="exzi-typing" aria-label="Exzi is typing"><i /><i /><i /></span>}
                </div>
              </div>
            ))}

            {error && <p className="exzi-error">{error}</p>}
          </div>

          <form
            className="exzi-composer"
            onSubmit={(e) => {
              e.preventDefault();
              ask(draft);
            }}
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={draft}
              placeholder="Ask Exzi anything…"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  ask(draft);
                }
              }}
            />
            {busy ? (
              <button type="button" onClick={stop} aria-label="Stop">
                <Square size={16} />
              </button>
            ) : (
              <button type="submit" disabled={!draft.trim()} aria-label="Send">
                <Send size={16} />
              </button>
            )}
          </form>
        </section>
      )}
    </>
  );
};

export default ExziCompanion;
