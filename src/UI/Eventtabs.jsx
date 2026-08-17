import { useState, useEffect } from "react";
import axios from "axios";

// ─── API helpers ─────────────────────────────────────────────────────────────

const fetchWebinars = async () => {
  try {
    const res = await axios.get("/api/webinars");
    return res.data || [];
  } catch (error) {
    console.error("fetchWebinars error:", error);
    return [];
  }
};

const fetchRegisteredWebinars = async () => {
  try {
    const res = await axios.get("/api/webinars/my-webinars");
    return res.data || [];
  } catch (error) {
    console.error("fetchRegisteredWebinars error:", error);
    return [];
  }
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const isPast = (scheduledAt) => new Date(scheduledAt) < new Date();

const formatDate = (isoString) => {
  if (!isoString) return "—";
  try {
    return new Date(isoString).toLocaleString("default", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Invalid date";
  }
};

const formatTimeOnly = (isoString) => {
  if (!isoString) return "";
  try {
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};


const getDuration = (start, end) => {
  if (!start || !end) return null;
  try {
    const diffMs = new Date(end) - new Date(start);
    const diffMinutes = Math.round(diffMs / 60000);
    if (diffMinutes <= 0) return null;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  } catch {
    return null;
  }
};

/* Webinar Card */

const FALLBACK_IMG =
  "https://res.cloudinary.com/dsgxyezcm/image/upload/v1767878441/Anonymous_b5hlab.jpg";

export function WebinarCard({ webinar, past, onNavigate }) {
  const instructorName =
    webinar.instructors?.length > 0
      ? webinar.instructors[0].name || webinar.instructors[0].email || "Expert"
      : webinar.instructorName || "Expert";

  const duration = getDuration(webinar.scheduledAt, webinar.endsAt);

  return (
    <div
      className="group relative"
      style={{ opacity: past ? 0.75 : 1, transition: "opacity 0.2s" }}
      onMouseEnter={(e) => {
        if (past) e.currentTarget.style.opacity = "1";
      }}
      onMouseLeave={(e) => {
        if (past) e.currentTarget.style.opacity = "0.75";
      }}
    >
      <div className="event-card relative rounded-xl border p-5 sm:p-6 flex flex-col transition-all duration-300 group-hover:-translate-y-1 h-full">
        <div className="flex flex-col sm:flex-row gap-5 w-full flex-grow items-center sm:items-stretch">
          {/* Thumbnail */}
          <div className="w-[140px] h-[140px] sm:w-28 sm:h-28 shrink-0 overflow-hidden rounded-xl">
            <img
              src={webinar.thumbnail || webinar.img || FALLBACK_IMG}
              alt={webinar.title || "Webinar"}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Body */}
          <div className="flex flex-1 flex-col justify-between gap-3">
            {/* Title */}
            <h3
              className="font-bold text-lg sm:text-xl line-clamp-2 transition-all duration-300"
              style={{ color: "var(--color-text-primary)" }}
            >
              {webinar.title}
            </h3>

            {/* Description */}
            <p
              className="text-sm sm:text-base line-clamp-2 text-justify font-medium"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {webinar.description || "Join us for an insightful session!"}
            </p>

            {/* Language / Level */}
            {webinar.language && (
              <p
                className="text-sm font-medium"
                style={{ color: "var(--color-primary)" }}
              >
                {webinar.language}
                {webinar.level ? ` · ${webinar.level}` : ""}
              </p>
            )}

            {/* Instructor + Platform */}
            <div
              className="flex flex-wrap gap-4 text-sm"
              style={{ color: "var(--color-text-primary)" }}
            >
              <span>
                <span className="font-semibold">Instructor: </span>
                {instructorName}
              </span>
              <span>
                <span className="font-semibold">Platform: </span>
                {webinar.platform || "Online"}
              </span>
            </div>

            {/* Date & Time */}
            <div
              className="flex flex-col items-left gap-2 text-sm"
              style={{ color: "var(--color-primary)" }}
            >
              <span>
                Scheduled at:{" "}
                <span style={{ color: "var(--color-text-primary)" }}>
                  {formatDate(webinar.scheduledAt)}
                </span>
              </span>
              {webinar.endsAt && (
                <span
                  className="flex items-center gap-2"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Ends at:{" "}
                  <span style={{ color: "var(--color-text-primary)" }}>
                    {formatTimeOnly(webinar.endsAt)}
                  </span>
                  {duration && (
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor:
                          "color-mix(in srgb, var(--color-primary) 15%, transparent)",
                        color: "var(--color-primary)",
                      }}
                    >
                      {duration}
                    </span>
                  )}
                </span>
              )}
            </div>

            {/* CTA */}
            {past ? (
              <button
                disabled
                className="w-full py-3 rounded-2xl text-sm sm:text-base font-medium cursor-not-allowed"
              >
                Event Ended
              </button>
            ) : (
              <button
                onClick={() => onNavigate?.(webinar._id)}
                className="w-full py-3 rounded-xl font-semibold text-white  transition-all duration-500 hover:scale-105"
                style={{
                  background:
                    "linear-gradient(to right, #1e40af, var(--color-primary))",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--color-primary)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    "linear-gradient(to right, #1e40af, var(--color-primary))")
                }
              >
                View Details
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Skeleton loader */

function SkeletonCard() {
  return (
    <div
      className="flex gap-4 rounded-2xl border p-5"
      style={{
        borderColor: "var(--color-border)",
        backgroundColor: "var(--color-surface)",
      }}
    >
      <div
        className="h-16 w-16 shrink-0 animate-pulse rounded-xl"
        style={{ backgroundColor: "var(--color-bg)" }}
      />
      <div className="flex flex-1 flex-col gap-2 py-1">
        <div
          className="h-4 w-2/3 animate-pulse rounded"
          style={{ backgroundColor: "var(--color-bg)" }}
        />
        <div
          className="h-3 w-1/3 animate-pulse rounded"
          style={{ backgroundColor: "var(--color-bg)" }}
        />
        <div
          className="h-3 w-1/2 animate-pulse rounded"
          style={{ backgroundColor: "var(--color-bg)" }}
        />
      </div>
      <div
        className="h-16 w-12 shrink-0 animate-pulse rounded-xl"
        style={{ backgroundColor: "var(--color-bg)" }}
      />
    </div>
  );
}

/* Empty state */

function EmptyState({ message }) {
  return (
    <div
      className="rounded-2xl border border-dashed py-14 text-center text-sm"
      style={{
        borderColor: "var(--color-border)",
        color: "var(--color-text-secondary)",
      }}
    >
      {message}
    </div>
  );
}

/* All Webinars Tab (landing page) */

export function AllWebinarsTab({
  webinars: webinarsProp,
  loading: loadingProp,
  onNavigate,
}) {
  const [webinars, setWebinars] = useState(webinarsProp || []);
  const [loading, setLoading] = useState(loadingProp ?? !webinarsProp);
  const [tab, setTab] = useState("upcoming");

  // Only self-fetch if no props provided
  useEffect(() => {
    if (webinarsProp) {
      setWebinars(webinarsProp);
      return;
    }
    setLoading(true);
    fetchWebinars().then((data) => {
      setWebinars(data);
      setLoading(false);
    });
  }, [webinarsProp]);

  const upcoming = webinars.filter((w) => !isPast(w.scheduledAt));
  const past = webinars.filter((w) => isPast(w.scheduledAt));
  const displayed = tab === "upcoming" ? upcoming : past;

  const TABS = [
    { key: "upcoming", label: "Upcoming", count: upcoming.length },
    { key: "past", label: "Past", count: past.length },
  ];

  return (
    <WebinarTabShell
      tabs={TABS}
      active={tab}
      onTabChange={setTab}
      loading={loading}
    >
      {displayed.map((w) => (
        <WebinarCard
          key={w._id}
          webinar={w}
          past={tab === "past"}
          onNavigate={onNavigate}
        />
      ))}
      {!loading && displayed.length === 0 && (
        <EmptyState
          message={
            tab === "upcoming"
              ? "No upcoming webinars."
              : "No past webinars yet."
          }
        />
      )}
    </WebinarTabShell>
  );
}

/* My Webinars Tab (registered users) */

export function MyWebinarsTab({
  webinars: webinarsProp,
  loading: loadingProp,
  onNavigate,
}) {
  const [webinars, setWebinars] = useState(webinarsProp || []);
  const [loading, setLoading] = useState(loadingProp ?? !webinarsProp);
  const [tab, setTab] = useState("upcoming");

  useEffect(() => {
    if (webinarsProp) {
      setWebinars(webinarsProp);
      return;
    }
    setLoading(true);
    fetchRegisteredWebinars().then((data) => {
      setWebinars(data);
      setLoading(false);
    });
  }, [webinarsProp]);

  const upcoming = webinars.filter((w) => !isPast(w.scheduledAt));
  const past = webinars.filter((w) => isPast(w.scheduledAt));
  const displayed = tab === "upcoming" ? upcoming : past;

  const TABS = [
    { key: "upcoming", label: "Upcoming", count: upcoming.length },
    { key: "past", label: "Past", count: past.length },
  ];

  return (
    <WebinarTabShell
      tabs={TABS}
      active={tab}
      onTabChange={setTab}
      loading={loading}
    >
      {displayed.map((w) => (
        <WebinarCard
          key={w._id}
          webinar={w}
          past={tab === "past"}
          onNavigate={onNavigate}
        />
      ))}
      {!loading && displayed.length === 0 && (
        <EmptyState
          message={
            tab === "upcoming"
              ? "You have no upcoming webinars."
              : "You haven't attended any webinars yet."
          }
        />
      )}
    </WebinarTabShell>
  );
}

// ─── Shared tab shell ─────────────────────────────────────────────────────────

function WebinarTabShell({ tabs, active, onTabChange, loading, children }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Tab Bar */}
      <div
        className="flex gap-1 rounded-xl p-1"
        style={{ backgroundColor: "var(--color-bg2)" }}
      >
        {tabs.map((tab) => {
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: isActive
                  ? "var(--color-surface)"
                  : "transparent",
                color: isActive
                  ? "var(--color-text-primary)"
                  : "var(--color-text-secondary)",
                boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.4)" : "none",
                border: isActive
                  ? "1px solid var(--color-border)"
                  : "1px solid transparent",
              }}
            >
              {tab.label}
              <span
                className="rounded-full px-1.5 py-0.5 text-xs font-semibold transition-colors"
                style={{
                  backgroundColor: isActive
                    ? "var(--color-primary)"
                    : "var(--color-bg)",
                  color: isActive ? "#fff" : "var(--color-text-secondary)",
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
