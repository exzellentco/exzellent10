import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Trash2, Check } from "lucide-react";
import { apiUrl, authHeaders } from "../../APIs/apiBase";

/**
 * A person's own to-do list, shared by the free student and teacher dashboards.
 *
 * One component rather than two, because the two lists behave identically and
 * the only real difference is the palette. The dashboards use different CSS
 * variables (--sd-* against --td-*), so those come in as a `theme` prop instead
 * of being hard-coded here.
 *
 * Talks to /api/my-tasks, which is per-account. NOT /api/tasks — that is the
 * internal staff backlog and is closed to learners and teachers by design.
 */

const call = async (path, options = {}) => {
  const res = await fetch(apiUrl(path), {
    ...options,
    headers: { "Content-Type": "application/json", ...authHeaders(), ...(options.headers || {}) },
  });
  let body = null;
  try { body = await res.json(); } catch { /* empty body on some errors */ }
  if (!res.ok || body?.success === false) {
    throw new Error(body?.message || `Could not reach your tasks (${res.status}).`);
  }
  return body;
};

const TaskList = ({ theme, title = "My tasks", subtitle = "Small things worth not forgetting." }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  const t = {
    card: theme?.card || "var(--sd-card-bg)",
    border: theme?.border || "var(--sd-border)",
    ink: theme?.ink || "var(--sd-ink)",
    muted: theme?.muted || "var(--sd-ink-muted)",
    accent: theme?.accent || "var(--sd-primary)",
    heading: theme?.heading || "var(--sd-font-heading)",
  };

  const load = useCallback(async () => {
    try {
      setError("");
      const body = await call("/api/my-tasks");
      setTasks(Array.isArray(body?.data) ? body.data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = async (e) => {
    e.preventDefault();
    const title2 = draft.trim();
    if (!title2 || busy) return;
    setBusy(true);
    // Clear the box straight away so it feels immediate; put the text back if
    // the write fails, rather than losing what they typed.
    setDraft("");
    try {
      const body = await call("/api/my-tasks", { method: "POST", body: JSON.stringify({ title: title2 }) });
      if (body?.data) setTasks((prev) => [body.data, ...prev]);
      setError("");
    } catch (err) {
      setDraft(title2);
      setError(err.message);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  };

  const toggle = async (task) => {
    const next = !task.done;
    setTasks((prev) => prev.map((x) => (x._id === task._id ? { ...x, done: next } : x)));
    try {
      await call(`/api/my-tasks/${task._id}`, { method: "PATCH", body: JSON.stringify({ done: next }) });
      setError("");
    } catch (err) {
      // Put the tick back where it was, so the screen never claims something
      // was saved that was not.
      setTasks((prev) => prev.map((x) => (x._id === task._id ? { ...x, done: !next } : x)));
      setError(err.message);
    }
  };

  const remove = async (task) => {
    const before = tasks;
    setTasks((prev) => prev.filter((x) => x._id !== task._id));
    try {
      await call(`/api/my-tasks/${task._id}`, { method: "DELETE" });
      setError("");
    } catch (err) {
      setTasks(before);
      setError(err.message);
    }
  };

  const open = tasks.filter((x) => !x.done).length;

  return (
    <div
      className="mb-8 rounded-2xl p-6"
      style={{ background: t.card, border: `1px solid ${t.border}` }}
    >
      <div className="flex items-baseline justify-between gap-3 mb-1 flex-wrap">
        <h2 className="text-2xl font-semibold m-0" style={{ color: t.ink, fontFamily: t.heading }}>
          {title}
        </h2>
        <span className="text-xs tabular-nums" style={{ color: t.muted }}>
          {loading ? "" : open ? `${open} open` : "all clear"}
        </span>
      </div>
      <p className="mb-4 mt-1 text-sm" style={{ color: t.muted }}>{subtitle}</p>

      <form onSubmit={add} className="flex gap-2 mb-4">
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={160}
          placeholder="Add a task…"
          aria-label="Add a task"
          className="flex-1 min-w-0 px-3 py-2 rounded-xl text-sm"
          style={{ background: "transparent", border: `1px solid ${t.border}`, color: t.ink }}
        />
        <button
          type="submit"
          disabled={!draft.trim() || busy}
          className="inline-flex items-center gap-1.5 px-3 rounded-xl text-sm font-semibold"
          style={{
            border: `1px solid ${t.border}`, color: t.accent,
            opacity: !draft.trim() || busy ? 0.5 : 1,
            cursor: !draft.trim() || busy ? "not-allowed" : "pointer",
            minHeight: 40,
          }}
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </form>

      {error && (
        <p className="text-sm mb-3" style={{ color: "#f0a09b" }}>{error}</p>
      )}

      {loading ? (
        <p className="text-sm m-0" style={{ color: t.muted }}>Loading your tasks…</p>
      ) : !tasks.length ? (
        <p className="text-sm m-0" style={{ color: t.muted }}>
          Nothing here yet. Add the first thing you want to get done.
        </p>
      ) : (
        <ul className="list-none p-0 m-0">
          {tasks.map((task) => (
            <li
              key={task._id}
              className="flex items-center gap-3 py-2.5"
              style={{ borderBottom: `1px solid ${t.border}` }}
            >
              <button
                type="button"
                onClick={() => toggle(task)}
                aria-pressed={task.done}
                aria-label={task.done ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
                className="flex-none grid place-items-center rounded-md"
                style={{
                  width: 22, height: 22, cursor: "pointer",
                  border: `1px solid ${task.done ? t.accent : t.border}`,
                  background: task.done ? t.accent : "transparent",
                }}
              >
                {task.done && <Check className="w-3.5 h-3.5" style={{ color: "#fff" }} />}
              </button>

              <span
                className="flex-1 min-w-0 text-sm"
                style={{
                  color: task.done ? t.muted : t.ink,
                  textDecoration: task.done ? "line-through" : "none",
                  overflowWrap: "anywhere",
                }}
              >
                {task.title}
              </span>

              {task.due && (
                <span className="flex-none text-xs tabular-nums" style={{ color: t.muted }}>{task.due}</span>
              )}

              <button
                type="button"
                onClick={() => remove(task)}
                aria-label={`Delete "${task.title}"`}
                className="flex-none grid place-items-center rounded-md"
                style={{ width: 30, height: 30, color: t.muted, background: "none", border: 0, cursor: "pointer" }}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskList;
