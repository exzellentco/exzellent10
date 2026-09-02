/**
 * LIVE backend connection for the prototype console. LOCAL ONLY.
 *
 * ⚠ This talks to PRODUCTION. Reads return real students, teachers, bookings
 * and messages; writes create real records. Nothing here is a simulation.
 *
 * The base URL is stated explicitly instead of setting VITE_BACKEND_BASE_URL,
 * on purpose: that env var would point every other page of the local app at
 * production too, including admin destructive actions. Keeping the live wiring
 * inside this one module means only the prototype is affected.
 *
 * Auth: the production API issues a JWT from /api/users/login. It is held in
 * sessionStorage so it dies with the tab, and is never written to disk.
 */

export const LIVE_BASE = "https://exzellent-backend-1.onrender.com";
const TOKEN_KEY = "exz-live-token";
const USER_KEY = "exz-live-user";

export const liveToken = () => sessionStorage.getItem(TOKEN_KEY) || "";
export const liveUser = () => {
  try { return JSON.parse(sessionStorage.getItem(USER_KEY) || "null"); } catch { return null; }
};
export const isLive = () => !!liveToken();

export const liveLogout = () => {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
};

/** Sign in against the real backend and keep the token for this tab. */
export const liveLogin = async (email, password) => {
  const res = await fetch(`${LIVE_BASE}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false || !data.accessToken) {
    throw new Error(data.message || `Sign in failed (${res.status}).`);
  }
  sessionStorage.setItem(TOKEN_KEY, data.accessToken);
  sessionStorage.setItem(USER_KEY, JSON.stringify({
    _id: data._id, email: data.email, userType: data.userType,
  }));
  return data;
};

const headers = (json = false) => {
  const h = {};
  if (json) h["Content-Type"] = "application/json";
  const t = liveToken();
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
};

const handle = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) { liveLogout(); throw new Error("Session expired — sign in again."); }
  if (!res.ok || data.success === false) throw new Error(data.message || `Request failed (${res.status}).`);
  return data;
};

export const liveGet = async (path) =>
  handle(await fetch(`${LIVE_BASE}${path}`, { headers: headers(), credentials: "include" }));

export const livePost = async (path, body) =>
  handle(await fetch(`${LIVE_BASE}${path}`, {
    method: "POST", headers: headers(true), credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  }));

export const livePut = async (path, body) =>
  handle(await fetch(`${LIVE_BASE}${path}`, {
    method: "PUT", headers: headers(true), credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  }));

export const liveDelete = async (path) =>
  handle(await fetch(`${LIVE_BASE}${path}`, {
    method: "DELETE", headers: headers(), credentials: "include",
  }));

/**
 * Which sections can be live at all.
 *
 * The operations half of this console (payroll, complaints, tasks, supervisors,
 * departments, platforms, reports, lectures, certificates, leaderboard) has no
 * endpoint on the backend — it was modelled, never built. Those stay on the
 * mock until the routes exist, and the UI says so rather than pretending.
 */
export const LIVE_SECTIONS = new Set([
  "dashboard", "students", "courses", "webinars", "community", "messages",
  "calendar",
  "attendance", "lessons", "classes", "roster", "credits",
  "referrals", "jobs", "online",
  // Built on the backend since: payroll, complaints, tasks, departments,
  // supervisors, platforms, lectures, certificates, leaderboard, reports.
  "payroll", "complaints", "tasks", "departments", "supervisors",
  "platforms", "lectures", "certificates", "leaderboard", "reports",
]);

/** Still modelled only — no endpoint exists for these yet. */
export const MOCK_ONLY = new Set([
  "homework", "availability", "earnings", "aitools", "speech", "review", "settings",
]);

/** Turn any report into a CSV the browser downloads. */
export const downloadCsv = (rows, filename) => {
  if (!rows || !rows.length) return false;
  const cols = [...new Set(rows.flatMap((r) => Object.keys(r)))];
  const esc = (v) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
};
