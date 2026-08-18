import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../utils/axios";
import Swal from "sweetalert2";

const WebinarParticipants = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [participants, setParticipants] = useState([]);
  const [webinarTitle, setWebinarTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch webinar title — API shape: { success, data: <webinar> }
        const webinarRes = await axios.get(`/api/webinars/${id}`);
        const webinarData = webinarRes.data?.data ?? webinarRes.data;
        setWebinarTitle(webinarData?.title || "Webinar");

        // Fetch participants — API shape: { success, data: [...], webinarTitle }
        const res = await axios.get(`/api/webinars/${id}/participants`);
        const rows = res.data?.data;
        setParticipants(Array.isArray(rows) ? rows : []);
        if (res.data?.webinarTitle) setWebinarTitle(res.data.webinarTitle);
      } catch (err) {
        const errorMsg = err.response?.data?.message || "Failed to load participants";
        setError(errorMsg);
        Swal.fire({
          icon: "error",
          title: "Error",
          theme: 'dark',
          text: errorMsg,
          confirmButtonColor: "#3085d6",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [id]);

  // Format date safely (handles invalid/missing values)
  const formatRegisteredDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "—";
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "—";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading participants...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg px-4">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-6xl mb-4">!</div>
          <h2 className="text-xl font-bold text-text-secondary mb-2">Something went wrong</h2>
          <p className="text-text-secondary mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-secondary truncate">
            Participants for:{" "}
            <span className="text-primary">{webinarTitle || "Loading..."}</span>
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 bg-gray-700 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition "
          >
            ← Back
          </button>
        </div>

        {/* No participants */}
        {participants.length === 0 ? (
          <div className="bg-bg2 border border-border rounded-xl  p-8 text-center">
            <div className="text-text-secondary text-lg mb-2">
              No students have registered for this webinar yet.
            </div>
            <p className="text-gray-400 text-sm">
              Check back later or send more invites!
            </p>
          </div>
        ) : (
          /* Participants Table */
          <div className="bg-bg2 rounded-xl  overflow-hidden border border-border">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-bg">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider hidden sm:table-cell"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider"
                    >
                      Registered On
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-bg2 divide-y divide-border">
                  {participants.map((student) => (
                    <tr key={student._id} className="hover:bg-bg transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-text-secondary">
                        {student.name || "Unnamed"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary hidden sm:table-cell">
                        {student.email || "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text-secondary">
                        {formatRegisteredDate(student.registeredAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Total count */}
        {participants.length > 0 && (
          <div className="mt-6 text-center text-sm text-text-secondary">
            Total participants:{" "}
            <span className="font-semibold text-text-secondary">{participants.length}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebinarParticipants;