import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getBookings, currentUser } from "../APIs/calendar";

/**
 * The signed-in learner's booked sessions, shared by the parts of the dashboard
 * that need them (the story timeline, the bookings list) so they do not each
 * fetch the same thing on mount.
 *
 * useSessions() works whether or not a provider is above it. A context that
 * throws when unwrapped is a common choice, but here the consumer is a
 * dashboard panel that is also rendered in isolation, and crashing the page
 * over a missing provider is a worse outcome than an empty list.
 */

const SessionsContext = createContext(null);

const EMPTY = { sessions: [], loading: false, error: "", refresh: () => {} };

export const SessionsProvider = ({ children, role = "student" }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const me = currentUser?.();
      const res = await getBookings(role, me?._id);
      const rows = Array.isArray(res) ? res : res?.data || [];
      setSessions(rows);
      setError("");
    } catch (e) {
      // A dashboard that renders without its sessions is far better than one
      // that shows nothing at all, so this is recorded and not thrown.
      setError(e?.message || "Could not load your sessions.");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => { refresh(); }, [refresh]);

  const value = useMemo(
    () => ({ sessions, loading, error, refresh }),
    [sessions, loading, error, refresh]
  );

  return <SessionsContext.Provider value={value}>{children}</SessionsContext.Provider>;
};

export const useSessions = () => useContext(SessionsContext) || EMPTY;

export default SessionsContext;
