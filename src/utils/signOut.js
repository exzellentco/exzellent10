import axios from "./axios";

/**
 * End the session properly, everywhere.
 *
 * Three things have to happen, and missing any one of them leaves the user
 * looking signed out while still holding a credential:
 *
 *  1. tell the backend, so the refresh token is revoked server-side;
 *  2. drop the `user` marker the route guard reads;
 *  3. delete the `token` cookie.
 *
 * (3) is the one that was missing. Login sets that cookie from JavaScript, so
 * it is a plain client-side cookie — the server's own clear does not
 * necessarily match its path, and the JWT was surviving an explicit sign-out.
 *
 * The backend call is best-effort: if it fails, the local credential still goes.
 * A sign-out that refuses to sign you out because the network is down is worse
 * than one that cleans up locally and moves on.
 */
export const signOut = async (navigate) => {
  try {
    await axios.post("/api/users/logout");
  } catch {
    /* revoked or unreachable — either way, clear locally */
  }

  try {
    localStorage.removeItem("user");
  } catch {
    /* storage blocked */
  }

  // Expire it on the paths it could have been written to.
  ["/", window.location.pathname].forEach((path) => {
    document.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
  });

  if (typeof navigate === "function") navigate("/login");
  return true;
};

export default signOut;
