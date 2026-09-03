// Where the fetch-based API modules should send their requests.
//
// These modules (calendar, messages, learning, speechAnalyzer, exziChat) call
// fetch() directly rather than going through utils/axios, because they need
// streaming, raw blobs or plain query strings. They used bare relative paths,
// which works in dev — Vite proxies /api to the local mock — but in production
// a relative path resolves to the site's own origin (Vercel), which has no /api
// routes. Every one of those calls returned 404 from the frontend host and
// never reached the backend at all.
//
// Rule matches utils/axios.js on purpose:
//   dev  -> "" (relative) so Vite proxies to the mock backend. This is a safety
//           property: a missing or wrong env var can never point local traffic,
//           including writes, at the production database.
//   prod -> VITE_BACKEND_BASE_URL, the real backend.
const BASE = import.meta.env.DEV ? "" : (import.meta.env.VITE_BACKEND_BASE_URL || "");

/** Resolve an /api/... path against the correct host for this environment. */
export const apiUrl = (path) => `${BASE}${path}`;

/**
 * The Authorization header the backend expects, read from the same `token`
 * cookie utils/axios.js uses.
 *
 * The fetch-based modules (calendar, messages, speech, AI tools) sent NO auth
 * at all. In dev that never showed, because the mock accepts anonymous calls;
 * live, every protected route answered 401 and the calendar page reported
 * "Could not load the lessons schedule". This is the one place that knows how
 * the token is stored, so each module merges it in rather than re-deriving it.
 */
export const authHeaders = () => {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default apiUrl;
