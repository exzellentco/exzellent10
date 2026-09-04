// Calendar API. Uses RELATIVE /api paths (not the axios baseURL) so Vite's dev
// proxy routes them to the mock backend on :5000 — the same reliable path the
// speech/AI features use. (The axios baseURL points at the real Render backend,
// which has no calendar endpoints, so we deliberately avoid it here.)
import { apiUrl, authHeaders } from "./apiBase";

const req = async (method, path, body) => {
  const res = await fetch(apiUrl(path), {
    method,
    // The backend routes are protected; without the token every call was a 401 live.
    headers: { ...authHeaders(), ...(body ? { "Content-Type": "application/json" } : {}) },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok && data.success !== false) throw new Error(data.message || "Request failed");
  return data;
};

// The logged-in user (role, id, name) from localStorage.
export const currentUser = () => {
  try { return JSON.parse(localStorage.getItem("user")) || {}; } catch { return {}; }
};

// Teacher/provider weekly availability { slotMinutes, days: {0..6: [[start,end],...]} }
export const getAvailability = async (teacherId) =>
  (await req("GET", `/api/calendar/availability/${teacherId}`)).data;

export const setAvailability = async (teacherId, days, slotMinutes = 30) =>
  req("PUT", `/api/calendar/availability`, { teacherId, days, slotMinutes });

// Open slots [{date,start,end}] for a provider across a date range (YYYY-MM-DD).
export const getSlots = async (teacherId, from, to) =>
  (await req("GET", `/api/calendar/slots/${teacherId}?from=${from}&to=${to}`)).data;

// Bookings for a role/user (admin passes neither → all).
export const getBookings = async (role, userId) =>
  (await req("GET", `/api/calendar/bookings?role=${role || ""}&userId=${userId || ""}`)).data;

// Create a lesson: { teacherId, date, start, end|durationMin, title, studentName?, studentId? }
export const createBooking = async (payload) =>
  req("POST", `/api/calendar/bookings`, payload);

// Edit a lesson: { date?, start?, end?, title?, studentName?, studentId? }
export const updateBooking = async (id, data) =>
  req("PUT", `/api/calendar/bookings/${id}`, data);

export const cancelBooking = async (id) =>
  req("DELETE", `/api/calendar/bookings/${id}`);

/**
 * What a lesson is for, and what happened in it. Teacher-only, server-side.
 *
 * req() throws only when the response is not ok AND the body does not already
 * say success:false — so a refusal, which is exactly that shape, comes back as
 * an ordinary value. Trusting it showed "Saved" over a write the server had
 * rejected. This one checks.
 */
export const saveLessonNotes = async (id, { objective, notes }) => {
  const res = await req("PATCH", `/api/calendar/bookings/${id}/lesson`,
    { ...(objective !== undefined ? { objective } : {}), ...(notes !== undefined ? { notes } : {}) });
  if (!res || res.success === false) throw new Error(res?.message || "Could not save this lesson.");
  return res;
};

// Bookable people (tutors/mentors/coaches), optionally filtered by lab.
export const getProviders = async (lab) =>
  (await req("GET", `/api/calendar/providers${lab ? `?lab=${lab}` : ""}`)).data;

// An "Add to Google Calendar" link (opens Google with the event pre-filled).
export const googleCalUrl = (b) => {
  const pad = (n) => String(n).padStart(2, "0");
  const toG = (date, time) => {
    const d = new Date(`${date}T${time}:00`);
    return (
      d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) +
      "T" + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + "00Z"
    );
  };
  const who = b.providerName || b.teacherName || "your tutor";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${b.topic || "Session"} with ${who}`,
    dates: `${toG(b.date, b.start)}/${toG(b.date, b.end)}`,
    details: `Exzellent booking${b.providerRole ? ` · ${b.providerRole}` : ""}${who ? ` with ${who}` : ""}.`,
    location: b.location || "Online",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};
