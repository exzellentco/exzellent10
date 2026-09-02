import { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";

/**
 * Route guard for the signed-in areas.
 *
 * The subtlety here is that `userRole === null` means two different things, and
 * treating them the same left the dashboard spinning forever:
 *
 *   - auth is still resolving  -> wait
 *   - auth resolved to nobody  -> send them to sign in
 *
 * The second case happens on a stale session: localStorage still says a user is
 * signed in, but the token cookie has expired or been cleared. The guard then
 * waited for a role that was never going to arrive, so the page showed a
 * spinner indefinitely — no error, no redirect, nothing to act on.
 *
 * The token cookie tells the two apart. No token means the check is already
 * over. If there is a token, a re-check may genuinely be in flight, so we wait
 * — but only for a bounded time, because a re-check that keeps failing should
 * still end at the login page rather than spinning for ever.
 */

const WAIT_MS = 8000;

const hasToken = () =>
  document.cookie.split("; ").some((row) => row.startsWith("token="));

const Spinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary" />
  </div>
);

const ProtectedRouter = ({ userRole, allowedRoles }) => {
  const [waitedTooLong, setWaitedTooLong] = useState(false);
  const stillResolving = userRole === null;

  useEffect(() => {
    if (!stillResolving) { setWaitedTooLong(false); return undefined; }
    const t = setTimeout(() => setWaitedTooLong(true), WAIT_MS);
    return () => clearTimeout(t);
  }, [stillResolving]);

  // Never signed in on this device.
  if (!localStorage.getItem("user")) return <Navigate to="/login" replace />;

  if (stillResolving) {
    // No token, or we have waited long enough: the session is over. Clear the
    // stale marker so the app stops believing someone is signed in.
    if (!hasToken() || waitedTooLong) {
      localStorage.removeItem("user");
      return <Navigate to="/login" replace />;
    }
    return <Spinner />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/404" replace />;
  }

  return <Outlet />;
};

export default ProtectedRouter;
