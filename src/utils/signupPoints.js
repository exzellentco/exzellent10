/**
 * Exzellent Points earned on the landing page before signing up.
 *
 * The landing page (public/learning-ecosystem.html) is plain HTML with no
 * account to write to, so it banks points in localStorage under `exz-points`.
 * Same origin as this app, so the keys are readable here — that is the whole
 * mechanism by which "sign up to bank them" actually banks them.
 *
 * These keys are duplicated from that page on purpose: it has no build step and
 * cannot import from src/. If they change there, change them here.
 */

const KEYS = { total: "exz-points", log: "exz-pts-log", day: "exz-pts-day" };

/** Points waiting to be claimed by a new account. Never throws. */
export const pendingPoints = () => {
  try {
    const n = Number(localStorage.getItem(KEYS.total) || 0);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  } catch {
    // Private mode, or storage blocked. No points is a fine answer.
    return 0;
  }
};

/**
 * Clear them once they have been granted, so a second account on the same
 * browser does not claim the same points again.
 */
export const clearPoints = () => {
  try {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  } catch {
    /* nothing to clear */
  }
};

export default pendingPoints;
