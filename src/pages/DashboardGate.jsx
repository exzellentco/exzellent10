import React, { useCallback, useEffect, useState } from "react";
import axios from "../utils/axios";
import Console from "./Console/Console";
import FreeStudentDashboard from "./FreeStudentDashboard";
import FreeTeacherDashboard from "./FreeTeacherDashboard";
import { SessionsProvider } from "../context/SessionsContext";

/**
 * Decides which dashboard a student or teacher gets.
 *
 *   paid  -> the full console
 *   free  -> the free dashboard for their role
 *
 * The decision is made from ONE call to /api/dashboard, and the payload is
 * handed to the console as `initialData` so it does not immediately fetch the
 * same thing again. Two round trips to Render on every dashboard load is a
 * visible pause on a cold instance, not a rounding error.
 *
 * `paid` is read from the server payload rather than from localStorage: the
 * copy of the user saved at login is a snapshot, so someone who upgraded in
 * another tab — or whose plan was revoked — would otherwise keep whatever they
 * had when they signed in.
 */

const Spinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary" />
  </div>
);

const DashboardGate = ({ role }) => {
  const [state, setState] = useState({ status: "loading", data: null, error: "" });

  const load = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/dashboard");
      setState({ status: "ready", data: data?.data || {}, error: "" });
    } catch (e) {
      // If we cannot tell, show the FREE dashboard rather than the paid console.
      // Failing open would hand out the paid product on any backend hiccup;
      // failing closed shows a working page that simply has less in it.
      setState({
        status: "error",
        data: null,
        error: e?.response?.data?.message || "Could not load your dashboard.",
      });
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (state.status === "loading") return <Spinner />;

  const paid = !!state.data?.me?.paid;

  if (state.status === "ready" && paid) {
    return <Console role={role} initialData={state.data} />;
  }

  if (role === "teacher") return <FreeTeacherDashboard />;

  // The free student dashboard reads the learner's sessions from context.
  return (
    <SessionsProvider role="student">
      <FreeStudentDashboard />
    </SessionsProvider>
  );
};

export default DashboardGate;
