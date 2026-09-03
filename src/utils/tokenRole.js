/**
 * The role carried by the access token itself.
 *
 * The route guard used to judge a page by App's `userRole` state. That state is
 * refreshed by an async check, so it can lag a fresh login — and when it did,
 * a student signing in after a teacher session was judged as a teacher,
 * rejected from their own dashboard, and redirected to the teacher one.
 *
 * The token in hand cannot lag: it was issued to this session, and the backend
 * puts userType in it (config/generateToken.js). Reading it makes the guard
 * agree with whoever is actually signed in, right now.
 *
 * This is for ROUTING ONLY. The payload is base64, not a proof of anything —
 * anyone can edit it. Every endpoint still verifies the signature server-side,
 * so a forged role here buys nothing but a broken-looking page for the forger.
 */

/** Every `token` cookie, most specific path first, as the browser orders them. */
const tokenCookies = () =>
  document.cookie
    .split("; ")
    .filter((row) => row.startsWith("token="))
    .map((row) => row.slice("token=".length))
    .filter(Boolean);

const decode = (jwt) => {
  try {
    const payload = String(jwt).split(".")[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
};

/**
 * "Student" | "Teacher" | "Admin", or null when there is no readable token.
 *
 * If more than one `token` cookie exists — which happens when one was written
 * at a different path and never cleared — the first unexpired one wins, and an
 * expired token is skipped rather than believed.
 */
export const roleFromToken = () => {
  const now = Date.now() / 1000;
  for (const jwt of tokenCookies()) {
    const claims = decode(jwt);
    if (!claims) continue;
    if (claims.exp && claims.exp < now) continue;
    if (claims.userType) return claims.userType;
  }
  return null;
};

export default roleFromToken;
