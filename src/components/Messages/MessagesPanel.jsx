import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  currentUser,
  getContacts,
  getMessages,
  sendMessage,
  markRead,
} from "../../APIs/messages";

// Role → avatar icon + avatar class suffix.
const ROLE_ICON = { Admin: "🛡️", Teacher: "👩‍🏫", Student: "🎓" };
const ROLE_CLASS = { Admin: "admin", Teacher: "teacher", Student: "student" };
const avClass = (role) => `av ${ROLE_CLASS[role] || "student"}`;
const avIcon = (role) => ROLE_ICON[role] || "🎓";

// "14:30" for today, otherwise "Mar 3".
const shortTime = (date) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

const MessagesPanel = ({ onClose, openWithId }) => {
  const me = useMemo(() => currentUser(), []);
  const myId = me?._id;
  const myName = me?.name;
  const myRole = me?.userType;

  const [contacts, setContacts] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [active, setActive] = useState(null); // selected contact, null = list
  const [thread, setThread] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const activeRef = useRef(active);
  useEffect(() => { activeRef.current = active; }, [active]);

  const threadEndRef = useRef(null);
  const scrollToBottom = useCallback(() => {
    const el = threadEndRef.current;
    if (el) el.scrollIntoView({ block: "end" });
  }, []);

  // Load contacts + all my messages (drives the list view previews).
  const loadList = useCallback(async () => {
    if (!myId) return;
    try {
      const [cts, msgs] = await Promise.all([
        getContacts(myRole, myId),
        getMessages(myId),
      ]);
      setContacts(Array.isArray(cts) ? cts : []);
      setAllMessages(Array.isArray(msgs) ? msgs : []);
      setError("");
    } catch {
      setError("Couldn't load your messages. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [myId, myRole]);

  // Load a single thread and mark the other person's messages read.
  const loadThread = useCallback(async (contactId) => {
    if (!myId || !contactId) return;
    try {
      const msgs = await getMessages(myId, contactId);
      setThread(Array.isArray(msgs) ? msgs : []);
      setError("");
      try { await markRead(myId, contactId); } catch { /* non-critical */ }
    } catch {
      setError("Couldn't load this conversation.");
    }
  }, [myId]);

  // Initial load.
  useEffect(() => {
    if (!myId) { setLoading(false); return; }
    loadList();
  }, [myId, loadList]);

  // If opened with a specific contact (e.g. teacher clicks "Message ✉" on a
  // student), jump straight into that thread once contacts have loaded.
  useEffect(() => {
    if (!openWithId || active || !contacts.length) return;
    const c = contacts.find((x) => x.id === openWithId);
    if (c) setActive(c);
  }, [openWithId, active, contacts]);

  // Open a thread when a contact is selected.
  useEffect(() => {
    if (active) loadThread(active.id);
  }, [active, loadThread]);

  // Auto-scroll to the newest message.
  useEffect(() => {
    if (active) scrollToBottom();
  }, [thread, active, scrollToBottom]);

  // Poll every 5s: refresh the open thread (and re-mark read) or the contact list.
  useEffect(() => {
    if (!myId) return;
    const id = setInterval(() => {
      const cur = activeRef.current;
      if (cur) loadThread(cur.id);
      else loadList();
    }, 5000);
    return () => clearInterval(id);
  }, [myId, loadList, loadThread]);

  // Per-contact preview (last message) + unread count, sorted by recency.
  const contactRows = useMemo(() => {
    const rows = contacts.map((c) => {
      let last = null;
      let unread = 0;
      for (const m of allMessages) {
        const involves =
          (m.fromId === c.id && m.toId === myId) ||
          (m.toId === c.id && m.fromId === myId);
        if (!involves) continue;
        if (!last || new Date(m.date) > new Date(last.date)) last = m;
        if (m.toId === myId && m.fromId === c.id && !m.read) unread += 1;
      }
      return { ...c, last, unread };
    });
    rows.sort((a, b) => {
      const ta = a.last ? new Date(a.last.date).getTime() : 0;
      const tb = b.last ? new Date(b.last.date).getTime() : 0;
      return tb - ta;
    });
    return rows;
  }, [contacts, allMessages, myId]);

  const onSend = useCallback(async () => {
    const body = text.trim();
    if (!body || !active || sending) return;
    setSending(true);
    try {
      await sendMessage({
        fromId: myId,
        fromName: myName,
        fromRole: myRole,
        toId: active.id,
        toName: active.name,
        toRole: active.role,
        text: body,
      });
      setText("");
      setError("");
      await loadThread(active.id);
      scrollToBottom();
    } catch {
      setError("Message not sent. Please try again.");
    } finally {
      setSending(false);
    }
  }, [text, active, sending, myId, myName, myRole, loadThread, scrollToBottom]);

  const onComposerKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const stop = (e) => e.stopPropagation();

  // ---- Header content depends on the view ----
  let title = "Messages";
  let subtitle = "Your conversations";
  let micIcon = "💬";
  if (active) {
    title = active.name;
    subtitle = active.role;
    micIcon = avIcon(active.role);
  }

  return (
    <div className="spl-root">
      <div className="spl-overlay" onClick={onClose}>
        <div className="spl-panel" onClick={stop}>
          <div className="spl-aura" />

          <div className="spl-head">
            <span className="spl-mic">{micIcon}</span>
            <div>
              <h3>{title}</h3>
              <p>{subtitle}</p>
            </div>
            <button className="spl-close" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>

          <div className="spl-body">
            {!myId ? (
              <div className="spl-empty">Please log in to view your messages.</div>
            ) : active ? (
              // ---- Thread view ----
              <>
                <button className="spl-msgback" onClick={() => setActive(null)}>
                  ← All conversations
                </button>

                {error && <div className="spl-empty">{error}</div>}

                <div className="spl-thread">
                  {thread.length === 0 && !error ? (
                    <div className="spl-empty">
                      No messages yet. Say hello to start the conversation.
                    </div>
                  ) : (
                    thread.map((m) => (
                      <div
                        key={m._id}
                        className={`spl-bubble ${m.fromId === myId ? "me" : "them"}`}
                      >
                        {m.text}
                        <span className="t">{shortTime(m.date)}</span>
                      </div>
                    ))
                  )}
                  <div ref={threadEndRef} />
                </div>

                <div className="spl-composer">
                  <textarea
                    className="spl-input"
                    placeholder="Write a message…"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={onComposerKey}
                  />
                  <button
                    className="spl-btn primary"
                    onClick={onSend}
                    disabled={sending || !text.trim()}
                  >
                    Send
                  </button>
                </div>
              </>
            ) : (
              // ---- List view ----
              <>
                <div className="spl-label">Conversations</div>

                {loading ? (
                  <div className="spl-empty">Loading your messages…</div>
                ) : error ? (
                  <div className="spl-empty">{error}</div>
                ) : contactRows.length === 0 ? (
                  <div className="spl-empty">No one to message yet.</div>
                ) : (
                  contactRows.map((c) => (
                    <div
                      key={c.id}
                      className="spl-contact"
                      onClick={() => setActive(c)}
                    >
                      <span className={avClass(c.role)}>{avIcon(c.role)}</span>
                      <span className="info">
                        <b>
                          {c.name} <span className="role">{c.role}</span>
                        </b>
                        <span>
                          {c.last ? c.last.text : "Start a conversation"}
                        </span>
                      </span>
                      {c.unread > 0 && <span className="unread" />}
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPanel;
