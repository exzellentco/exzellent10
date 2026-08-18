import React, { useEffect, useMemo, useState } from "react";
import { Heart, MessageCircle, Send, Users, AlertTriangle } from "lucide-react";
import DashboardShell from "../components/DashboardShell";
import {
  getSpaces,
  getPosts,
  createPost,
  likePost,
  commentPost,
} from "../APIs/learning";

/* -------------------------------------------------------------- helpers */

// Current logged-in member (from auth), used for optimistic like state.
const readMe = () => {
  try {
    return JSON.parse(localStorage.getItem("user")) || {};
  } catch {
    return {};
  }
};

// Compact relative time, e.g. "just now", "5m ago", "2d ago".
const timeAgo = (iso) => {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const secs = Math.round((Date.now() - then) / 1000);
  if (secs < 45) return "just now";
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.round(days / 365)}y ago`;
};

// First-letter avatar seed.
const initial = (name) => (name || "?").trim().charAt(0).toUpperCase();

// Role → badge accent. Teacher=orange, Admin=violet, Student=cyan.
const roleBadge = (role) => {
  const r = (role || "Student").toLowerCase();
  if (r.includes("teacher") || r.includes("instructor"))
    return { label: "Teacher", cls: "ex-badge-warn" };
  if (r.includes("admin")) return { label: "Admin", cls: "ex-badge-accent" };
  return { label: "Student", cls: "ex-badge-ok" };
};

/* -------------------------------------------------------------- post card */

const PostCard = ({ post, me, onLike, onComment }) => {
  const [showComments, setShowComments] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const likes = post.likes || [];
  const comments = post.comments || [];
  const likedByMe = me?._id ? likes.includes(me._id) : false;
  const badge = roleBadge(post.authorRole);

  const submitComment = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      await onComment(post._id, text);
      setDraft("");
      setShowComments(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <article className="ex-card ex-reveal">
      {/* header: avatar + author + role + time */}
      <div className="flex items-center gap-3" style={{ marginBottom: 12 }}>
        <span
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
            fontWeight: 700,
            color: "#06121c",
            background: "var(--ex-grad)",
          }}
        >
          {initial(post.authorName)}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span style={{ fontWeight: 700, color: "var(--ex-text)" }}>
              {post.authorName || "Member"}
            </span>
            <span className={`ex-badge ${badge.cls}`}>{badge.label}</span>
          </div>
          <div
            className="flex items-center gap-2"
            style={{ fontSize: ".8rem", color: "var(--ex-muted)" }}
          >
            <span>{timeAgo(post.createdAt)}</span>
            <span aria-hidden>·</span>
            <span style={{ color: "var(--pL)" }}>{post.space}</span>
          </div>
        </div>
      </div>

      {/* body */}
      <p
        style={{
          whiteSpace: "pre-wrap",
          color: "var(--ex-text)",
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        {post.text}
      </p>

      {/* actions */}
      <div
        className="flex items-center gap-3"
        style={{
          marginTop: 16,
          paddingTop: 14,
          borderTop: "1px solid var(--ex-line)",
        }}
      >
        <button
          type="button"
          onClick={() => onLike(post._id)}
          className={`ex-btn ${likedByMe ? "ex-btn-primary" : "ex-btn-ghost"}`}
          style={{ padding: "8px 14px", fontSize: ".85rem" }}
          aria-pressed={likedByMe}
        >
          <Heart size={16} fill={likedByMe ? "currentColor" : "none"} />
          {likes.length}
        </button>
        <button
          type="button"
          onClick={() => setShowComments((v) => !v)}
          className="ex-btn ex-btn-ghost"
          style={{ padding: "8px 14px", fontSize: ".85rem" }}
          aria-expanded={showComments}
        >
          <MessageCircle size={16} />
          {comments.length}
        </button>
      </div>

      {/* comments */}
      {showComments && (
        <div style={{ marginTop: 14 }} className="grid gap-3">
          {comments.length === 0 ? (
            <p className="ex-lead" style={{ fontSize: ".85rem" }}>
              No comments yet — start the conversation.
            </p>
          ) : (
            comments.map((c) => (
              <div
                key={c._id}
                className="flex items-start gap-3"
                style={{
                  border: "1px solid var(--ex-line)",
                  borderRadius: 12,
                  padding: "10px 12px",
                }}
              >
                <span
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                    fontWeight: 700,
                    fontSize: ".8rem",
                    color: "var(--pL)",
                    border: "1px solid var(--ex-line)",
                    background: "rgba(255,255,255,.02)",
                  }}
                >
                  {initial(c.authorName)}
                </span>
                <div className="min-w-0">
                  <div
                    className="flex items-center gap-2"
                    style={{ fontSize: ".82rem", marginBottom: 2 }}
                  >
                    <span style={{ fontWeight: 600, color: "var(--ex-text)" }}>
                      {c.authorName || "Member"}
                    </span>
                    <span style={{ color: "var(--ex-muted)" }}>
                      {timeAgo(c.createdAt)}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      color: "var(--ex-text)",
                      lineHeight: 1.5,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {c.text}
                  </p>
                </div>
              </div>
            ))
          )}

          {/* add comment */}
          <div className="flex items-center gap-2">
            <input
              className="ex-input"
              style={{ flex: 1 }}
              placeholder="Add a comment…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitComment();
              }}
            />
            <button
              type="button"
              className="ex-btn ex-btn-primary"
              style={{ padding: "10px 14px" }}
              onClick={submitComment}
              disabled={!draft.trim() || sending}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </article>
  );
};

/* -------------------------------------------------------------- page */

const Community = () => {
  const me = useMemo(readMe, []);

  const [spaces, setSpaces] = useState([]);
  const [activeSpace, setActiveSpace] = useState("All");

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // composer
  const [draft, setDraft] = useState("");
  const [composerSpace, setComposerSpace] = useState("General");
  const [posting, setPosting] = useState(false);

  // filter chips = All + spaces from the API
  const chips = useMemo(() => ["All", ...spaces], [spaces]);

  // load the space list once
  useEffect(() => {
    let alive = true;
    getSpaces()
      .then((res) => {
        if (!alive) return;
        const list = res?.data || [];
        setSpaces(list);
        if (list.length && !list.includes("General")) setComposerSpace(list[0]);
      })
      .catch(() => {
        /* spaces are non-critical; feed still works */
      });
    return () => {
      alive = false;
    };
  }, []);

  // (re)load the feed whenever the active space changes
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    getPosts(activeSpace)
      .then((res) => {
        if (!alive) return;
        setPosts(res?.data || []);
      })
      .catch((err) => {
        if (!alive) return;
        setError(err?.message || "Couldn't load the community feed.");
        setPosts([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [activeSpace]);

  const handlePost = async () => {
    const text = draft.trim();
    if (!text || posting) return;
    setPosting(true);
    setError(null);
    try {
      const res = await createPost({ text, space: composerSpace });
      const newPost = res?.data;
      if (newPost) {
        // prepend only if it belongs to the current view
        if (activeSpace === "All" || newPost.space === activeSpace) {
          setPosts((prev) => [newPost, ...prev]);
        }
        setDraft("");
      }
    } catch (err) {
      setError(err?.message || "Couldn't publish your post.");
    } finally {
      setPosting(false);
    }
  };

  // optimistic like — replace the post with the authoritative one returned
  const handleLike = async (postId) => {
    try {
      const res = await likePost(postId);
      const updated = res?.data;
      if (updated) {
        setPosts((prev) => prev.map((p) => (p._id === postId ? updated : p)));
      }
    } catch {
      /* ignore — server state is unchanged */
    }
  };

  const handleComment = async (postId, text) => {
    const res = await commentPost(postId, text);
    const updated = res?.data;
    if (updated) {
      setPosts((prev) => prev.map((p) => (p._id === postId ? updated : p)));
    }
  };

  return (
    <DashboardShell
      role="student"
      eyebrow="Community"
      title={
        <>
          The <span className="ex-g">community</span>
        </>
      }
      lead="Share wins, ask questions, and learn together with the Exzellent community."
    >
      {/* space filter chips */}
      <div
        className="flex flex-wrap gap-2 ex-reveal"
        style={{ marginBottom: 20 }}
      >
        {chips.map((space) => {
          const active = space === activeSpace;
          return (
            <button
              key={space}
              type="button"
              onClick={() => setActiveSpace(space)}
              className={`ex-btn ${active ? "ex-btn-primary" : "ex-btn-ghost"}`}
              style={{ padding: "8px 16px", fontSize: ".85rem" }}
              aria-pressed={active}
            >
              {space}
            </button>
          );
        })}
      </div>

      {/* composer */}
      <div className="ex-card ex-reveal" style={{ marginBottom: 24 }}>
        <textarea
          className="ex-input"
          rows={3}
          style={{ width: "100%", resize: "vertical", fontFamily: "inherit" }}
          placeholder="Share something with the community…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <div
          className="flex flex-col sm:flex-row sm:items-center gap-3"
          style={{ marginTop: 12 }}
        >
          <div className="flex items-center gap-2" style={{ flex: 1 }}>
            <span className="ex-label" style={{ margin: 0 }}>
              Post to
            </span>
            <select
              className="ex-input"
              style={{ padding: "8px 12px", maxWidth: 220 }}
              value={composerSpace}
              onChange={(e) => setComposerSpace(e.target.value)}
            >
              {(spaces.length ? spaces : ["General"]).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="ex-btn ex-btn-primary"
            onClick={handlePost}
            disabled={!draft.trim() || posting}
          >
            {posting ? <span className="ex-spinner" /> : <Send size={16} />}
            {posting ? "Posting…" : "Post"}
          </button>
        </div>
      </div>

      {/* error banner (non-blocking) */}
      {error && (
        <div
          className="ex-card ex-reveal flex items-center gap-2"
          style={{
            marginBottom: 24,
            borderColor: "rgba(239,68,68,.35)",
            color: "#fca5a5",
          }}
        >
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* feed */}
      {loading ? (
        <div className="flex justify-center items-center gap-4 py-16">
          <span className="ex-spinner" />
          <span className="ex-lead">Loading the feed…</span>
        </div>
      ) : posts.length === 0 ? (
        <div
          className="ex-card flex flex-col items-center justify-center gap-3 py-14 text-center ex-reveal"
          style={{ border: "2px dashed var(--ex-line)" }}
        >
          <Users size={44} style={{ color: "var(--pL)" }} />
          <p style={{ fontWeight: 600, fontSize: "1.1rem" }}>
            Be the first to post in {activeSpace}
          </p>
          <p className="ex-lead">
            Say hello, share a win, or ask the community a question.
          </p>
        </div>
      ) : (
        <div className="grid gap-5">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              me={me}
              onLike={handleLike}
              onComment={handleComment}
            />
          ))}
        </div>
      )}
    </DashboardShell>
  );
};

export default Community;
