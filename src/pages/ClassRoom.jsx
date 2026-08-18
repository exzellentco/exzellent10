import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardShell from "../components/DashboardShell";
import {
  getBooking,
  markAttendance,
  getZoomSignature,
  zoomMeetingNumber,
} from "../APIs/learning";

/* ------------------------------------------------------------------ *
 * Zoom Meeting SDK (Component View) — runtime loader.
 *
 * We DO NOT take an npm dependency on the Zoom SDK. Instead we inject
 * the Web SDK bundle from https://source.zoom.us at runtime and drive
 * window.ZoomMtgEmbedded. This whole path only runs when the backend
 * reports `configured === true` (real SDK creds present). In the mock
 * demo it never executes — but it must be written correctly and must
 * never throw in a way that breaks the page: every failure falls
 * through to the in-site fallback panel.
 * ------------------------------------------------------------------ */

const ZOOM_SDK_VERSION = "3.1.6";
const ZOOM_SDK_SRC = `https://source.zoom.us/${ZOOM_SDK_VERSION}/zoom-meeting-embedded-${ZOOM_SDK_VERSION}.umd.min.js`;

// Load an external script once; resolves when window.ZoomMtgEmbedded exists.
const loadZoomSdk = () =>
  new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("No window (SSR)"));
      return;
    }
    if (window.ZoomMtgEmbedded) {
      resolve(window.ZoomMtgEmbedded);
      return;
    }
    const existing = document.getElementById("zoom-embed-sdk");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.ZoomMtgEmbedded));
      existing.addEventListener("error", () =>
        reject(new Error("Zoom SDK failed to load")),
      );
      return;
    }
    const s = document.createElement("script");
    s.id = "zoom-embed-sdk";
    s.src = ZOOM_SDK_SRC;
    s.async = true;
    s.onload = () => {
      if (window.ZoomMtgEmbedded) resolve(window.ZoomMtgEmbedded);
      else reject(new Error("Zoom SDK loaded but ZoomMtgEmbedded missing"));
    };
    s.onerror = () => reject(new Error("Zoom SDK failed to load"));
    document.body.appendChild(s);
  });

// Pull the ?pwd= value out of a Zoom join URL, if present.
const zoomPassword = (url = "") => {
  try {
    const m = String(url).match(/[?&]pwd=([^&]+)/);
    return m ? decodeURIComponent(m[1]) : "";
  } catch {
    return "";
  }
};

/*
 * Attempt to embed the Zoom Component View into `container`.
 * Returns true on success, false on any failure (caller shows fallback).
 * NEVER throws.
 */
const embedZoomMeeting = async ({
  container,
  sdkKey,
  signature,
  meetingNumber,
  password,
  userName,
}) => {
  try {
    if (!container) return false;
    const ZoomMtgEmbedded = await loadZoomSdk();
    const client = ZoomMtgEmbedded.createClient();
    await client.init({
      zoomAppRoot: container,
      language: "en-US",
      patchJsMedia: true,
    });
    await client.join({
      sdkKey,
      signature,
      meetingNumber,
      userName: userName || "Student",
      password: password || "",
    });
    return true;
  } catch (err) {
    // Swallow — page degrades to the fallback panel.
    // eslint-disable-next-line no-console
    console.error("[ClassRoom] Zoom embed failed:", err);
    return false;
  }
};

/* ------------------------------------------------------------------ */

const fmtDateTime = (booking) => {
  if (!booking) return "";
  const parts = [];
  if (booking.date) {
    try {
      parts.push(
        new Date(booking.date).toLocaleDateString("en-US", {
          weekday: "short",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      );
    } catch {
      parts.push(String(booking.date));
    }
  }
  const window = [booking.start, booking.end].filter(Boolean).join(" – ");
  if (window) parts.push(window);
  return parts.join(" · ");
};

const ClassRoom = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const embedRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(null);
  const [attended, setAttended] = useState(false);
  const [embedded, setEmbedded] = useState(false); // true once Zoom is live in-page

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);

      // 1. Load the booking.
      let bk;
      try {
        const res = await getBooking(bookingId);
        if (!res || res.success === false || !res.data) {
          throw new Error(res?.message || "Class not found");
        }
        bk = res.data;
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "We couldn't load this class.");
          setLoading(false);
        }
        return;
      }
      if (cancelled) return;
      setBooking(bk);

      // 2. Record attendance (best-effort — never blocks entry).
      try {
        const att = await markAttendance(bookingId);
        if (!cancelled && att && att.success !== false) setAttended(true);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("[ClassRoom] attendance not recorded:", err);
      }
      if (cancelled) return;

      // 3. Ask the backend whether the Zoom SDK is configured.
      try {
        const meetingNumber = zoomMeetingNumber(bk.meetingUrl);
        const sig = await getZoomSignature({ meetingNumber, role: 0 });
        if (!cancelled && sig && sig.configured === true) {
          const ok = await embedZoomMeeting({
            container: embedRef.current,
            sdkKey: sig.sdkKey,
            signature: sig.signature,
            meetingNumber,
            password: zoomPassword(bk.meetingUrl),
            userName: bk.studentName || "Student",
          });
          if (!cancelled && ok) setEmbedded(true);
        }
        // configured === false → fall through to the in-site panel.
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("[ClassRoom] Zoom signature/embed skipped:", err);
      }

      if (!cancelled) setLoading(false);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  /* ---------- loading ---------- */
  if (loading) {
    return (
      <DashboardShell
        role="student"
        eyebrow="Live class"
        title={<>Joining your <span className="ex-g">classroom</span></>}
      >
        <div className="flex justify-center items-center py-20 gap-4">
          <span className="ex-spinner" />
          <span className="ex-lead">Preparing your class…</span>
        </div>
      </DashboardShell>
    );
  }

  /* ---------- error ---------- */
  if (error) {
    return (
      <DashboardShell
        role="student"
        eyebrow="Live class"
        title={<>Class <span className="ex-g">unavailable</span></>}
      >
        <div
          className="ex-card"
          style={{ textAlign: "center", borderColor: "rgba(239,68,68,.35)" }}
        >
          <p style={{ color: "#fca5a5", marginBottom: 16 }}>{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate("/calendar")}
              className="ex-btn ex-btn-primary"
            >
              Back to calendar
            </button>
            <button
              onClick={() => navigate(-1)}
              className="ex-btn ex-btn-ghost"
            >
              Back
            </button>
          </div>
        </div>
      </DashboardShell>
    );
  }

  /* ---------- loaded ---------- */
  const meetingNumber = zoomMeetingNumber(booking?.meetingUrl);
  const lead = [booking?.teacherName && `with ${booking.teacherName}`, fmtDateTime(booking)]
    .filter(Boolean)
    .join(" · ");

  return (
    <DashboardShell
      role="student"
      eyebrow="Live class"
      title={booking?.title || "Your live class"}
      lead={lead}
      actions={
        attended && (
          <span
            className="ex-badge ex-badge-ok"
            style={{ whiteSpace: "nowrap" }}
          >
            ✓ Attendance recorded
          </span>
        )
      }
    >
      <div className="ex-card ex-reveal">
        {/* Zoom Component View mounts here when SDK creds are configured. */}
        <div
          id="zoom-embed"
          ref={embedRef}
          style={{
            display: embedded ? "block" : "none",
            width: "100%",
            minHeight: 520,
            borderRadius: 16,
            overflow: "hidden",
          }}
        />

        {/* In-site fallback classroom (the demo path). */}
        {!embedded && (
          <div>
            <div
              style={{
                position: "relative",
                aspectRatio: "16 / 9",
                width: "100%",
                borderRadius: 18,
                overflow: "hidden",
                background:
                  "radial-gradient(120% 120% at 50% 0%, #0d1424 0%, #060912 70%)",
                border: "1px solid var(--ex-line)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "32px 24px",
              }}
            >
              <div style={{ fontSize: "clamp(40px, 8vw, 72px)", lineHeight: 1 }}>
                🎥
              </div>
              <h2
                style={{
                  fontFamily: "var(--ex-font)",
                  fontWeight: 700,
                  fontSize: "clamp(1.3rem, 3.5vw, 2rem)",
                  margin: "16px 0 6px",
                  color: "var(--ex-text)",
                }}
              >
                Your live class is ready
              </h2>
              <p
                className="ex-lead"
                style={{ maxWidth: 460, margin: "0 auto 4px" }}
              >
                {booking?.title}
              </p>
              {booking?.teacherName && (
                <p
                  style={{
                    color: "var(--pL)",
                    fontWeight: 600,
                    margin: "2px 0",
                  }}
                >
                  {booking.teacherName}
                </p>
              )}
              {fmtDateTime(booking) && (
                <p
                  className="ex-lead"
                  style={{ fontSize: ".85rem", margin: "2px 0 0" }}
                >
                  {fmtDateTime(booking)}
                </p>
              )}
              {meetingNumber && (
                <p
                  className="ex-lead"
                  style={{
                    fontSize: ".8rem",
                    marginTop: 10,
                    letterSpacing: ".04em",
                  }}
                >
                  Meeting ID:{" "}
                  <span style={{ fontWeight: 700, color: "var(--ex-text)" }}>
                    {meetingNumber}
                  </span>
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 mt-6">
              {booking?.meetingUrl && (
                <a
                  href={booking.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ex-btn ex-btn-primary"
                  style={{ textDecoration: "none" }}
                >
                  🎦 Open class in Zoom
                </a>
              )}
              <button
                onClick={() => navigate("/calendar")}
                className="ex-btn ex-btn-ghost"
              >
                ← Back to calendar
              </button>
            </div>

            {/* SDK note */}
            <p
              className="ex-lead"
              style={{
                fontSize: ".78rem",
                marginTop: 16,
                opacity: 0.75,
                borderTop: "1px solid var(--ex-line)",
                paddingTop: 14,
              }}
            >
              In-site video embedding activates once Zoom SDK credentials
              (ZOOM_SDK_KEY / ZOOM_SDK_SECRET) are added.
            </p>
          </div>
        )}
      </div>
    </DashboardShell>
  );
};

export default ClassRoom;
