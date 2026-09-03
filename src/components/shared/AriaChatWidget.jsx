import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { BrainCircuit } from "lucide-react";

/**
 * Floating "Aria" AI assistant — button + slide-up chat panel.
 *
 * Originally built inline on the Student Dashboard; extracted here so the
 * Student Dashboard and the Course Details page (and any future page) can
 * share one implementation instead of maintaining duplicate copies. Reads
 * its colors entirely from the `--sd-*` CSS custom properties, so it stays
 * on-brand wherever it's rendered as long as the host page defines those
 * tokens on an ancestor (both StudentDashboard.jsx and CourseDetails.jsx
 * define the same token set).
 *
 * @param {object} [profile] - Extra fields merged into the chat request's
 *   `profile` payload (e.g. `{ mode: "tutor", courseTitle, targetLanguage }`
 *   for course-specific context). Defaults to the original generic-mode
 *   behavior used on the dashboard.
 * @param {string} [label] - Header label, defaults to "Aria".
 * @param {string} [greeting] - Empty-state greeting text.
 * @param {string} [sessionKey] - Prefix for the chat session id, so two
 *   widgets on different pages don't collide if both happen to mount in
 *   the same browser session.
 */
const AriaChatWidget = ({
  profile,
  label = "Aria",
  greeting = "Hi! I'm Aria. Ask me anything.",
  sessionKey = "session",
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatStreaming, setChatStreaming] = useState(false);
  const chatSessionId = useRef(`${sessionKey}_${Date.now()}`);
  const chatEndRef = useRef(null);

  const sendChatMessage = async () => {
    const text = chatInput.trim();
    if (!text || chatStreaming) return;

    const userStr = localStorage.getItem("user");
    let user = {};
    try {
      user = userStr ? JSON.parse(userStr) : {};
    } catch {
      user = {};
    }

    setChatMessages((prev) => [...prev, { role: "user", content: text }]);
    setChatInput("");
    setChatStreaming(true);

    const ariaMsg = { role: "aria", content: "" };
    setChatMessages((prev) => [...prev, ariaMsg]);

    try {
      const tokenFromCookie = document.cookie
        .split("; ")
        .find((r) => r.startsWith("token="))
        ?.split("=")[1];
      const token = localStorage.getItem("token") || tokenFromCookie;

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/chat/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            sessionId: chatSessionId.current,
            userMessage: text,
            profile: {
              name: user.name || "Student",
              mode: "generic",
              ...profile,
            },
          }),
        },
      );

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }
      if (!res.body) {
        throw new Error("No response body received");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullReply = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              fullReply += parsed.text;
              setChatMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "aria",
                  content: fullReply,
                };
                return updated;
              });
              chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }
          } catch {
            /* noop */
          }
        }
      }
    } catch {
      setChatMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "aria",
          content: "Sorry, something went wrong. Please try again.",
        };
        return updated;
      });
    } finally {
      setChatStreaming(false);
    }
  };

  return (
    <>
      {/* Floating AI Tutor Button */}
      <motion.button
        onClick={() => setChatOpen((o) => !o)}
        whileHover={prefersReducedMotion ? undefined : { scale: 1.06 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
        animate={
          prefersReducedMotion || chatOpen
            ? undefined
            : { boxShadow: ["0 6px 24px rgba(140,81,240,0.35)", "0 6px 32px rgba(140,81,240,0.6)", "0 6px 24px rgba(140,81,240,0.35)"] }
        }
        transition={
          prefersReducedMotion || chatOpen
            ? { duration: 0.2 }
            : { boxShadow: { duration: 2.5, repeat: Infinity, ease: "easeInOut" } }
        }
        className="fixed bottom-6 right-6 z-50 text-white p-3.5 rounded-full cursor-pointer"
        style={{ background: "var(--sd-primary)" }}
        aria-label={chatOpen ? `Close ${label} chat` : `Open ${label} chat`}
      >
        <BrainCircuit className="w-7 h-7" />
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 right-4 left-4 sm:left-auto sm:right-6 z-50 sm:w-80 h-[70vh] max-h-[480px] rounded-2xl flex flex-col overflow-hidden"
            style={{ background: "var(--sd-card-bg)", border: "1px solid var(--sd-border)", boxShadow: "0 16px 48px rgba(0,0,0,0.5)", backdropFilter: "blur(20px)" }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: "1px solid var(--sd-border)", background: "var(--sd-surface)" }}
            >
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5" style={{ color: "var(--sd-primary)" }} />
                <span className="font-semibold" style={{ color: "var(--sd-ink)", fontFamily: "var(--sd-font-heading)" }}>
                  {label}
                </span>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="text-lg leading-none hover:opacity-60 transition-all duration-300 cursor-pointer"
                style={{ color: "var(--sd-ink-muted)" }}
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
              {chatMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-center px-4">
                  <BrainCircuit className="w-8 h-8" style={{ color: "var(--sd-gold)" }} />
                  <p className="text-sm" style={{ color: "var(--sd-ink-muted)" }}>
                    {greeting}
                  </p>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className="max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed"
                    style={
                      msg.role === "user"
                        ? { background: "var(--sd-primary)", color: "#fff", borderBottomRightRadius: "4px" }
                        : { background: "var(--sd-surface)", border: "1px solid var(--sd-border)", color: "var(--sd-ink)", borderBottomLeftRadius: "4px" }
                    }
                  >
                    {msg.content || <span className="animate-pulse">...</span>}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 flex gap-2" style={{ borderTop: "1px solid var(--sd-border)" }}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !e.shiftKey && sendChatMessage()
                }
                placeholder={`Ask ${label}...`}
                disabled={chatStreaming}
                className="flex-1 rounded-lg px-3 py-2 text-sm outline-none transition-all disabled:opacity-50"
                style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)", color: "var(--sd-ink)" }}
              />
              <button
                onClick={sendChatMessage}
                disabled={chatStreaming || !chatInput.trim()}
                className="px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 cursor-pointer"
                style={{ background: "var(--sd-primary)", color: "#fff" }}
              >
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AriaChatWidget;
