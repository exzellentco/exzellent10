import React from "react";
import { useNavigate } from "react-router-dom";

const WebinarList = ({ webinars, loading, onEdit, onDelete, formatDate, handleSendInvites }) => {
  const navigate = useNavigate();

  return (
    <div className="mt-12">
      <h3 className="text-4xl font-bold mb-6 text-primary pb-2">
        All Webinars ({webinars.length})
      </h3>

      {loading ? (
        <div className="min-h-screen bg-bg bg-[linear-gradient(to_right,#6185b815_1px,transparent_1px),linear-gradient(to_bottom,#6185b815_1px,transparent_1px)] bg-[size:40px_40px] flex flex-col justify-center items-center text-center text-3xl">      
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"/>
            <p className="text-white">Loading Webinars...</p>
        </div>
      ) : webinars.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-white text-lg mb-2">No webinars found</div>
          <p className="text-text-secondary">Create your first webinar using the form above.</p>
        </div>
      ) : (
        <div className="flex flex-col-reverse gap-6 pb-12">
          {webinars.map((webinar) => {
            const isPastEvent = new Date(webinar.scheduledAt) < new Date();

            // Instructor name (safe check)
            const instructorName = webinar.instructors?.length > 0
              ? webinar.instructors[0].name || webinar.instructors[0].email || "Expert"
              : "Expert";

            // Level badge color
            const levelColor = {
              "A1": "bg-green-100 text-green-700",
              "A2": "bg-green-100 text-green-700",
              "B1": "bg-blue-100 text-blue-700",
              "B2": "bg-blue-100 text-blue-700",
              "C1": "bg-purple-100 text-purple-700",
              "C2": "bg-purple-100 text-purple-700",
              "All levels": "bg-gray-100 text-text-secondary",
            }[webinar.level] || "bg-gray-100 text-text-secondary";

            return (
              <div key={webinar._id} className="rounded-xl p-6 bg-bg2 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* Left: Thumbnail + Content */}
                <div className="flex-1 flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {webinar.thumbnail ? (
                      <img
                        src={webinar.thumbnail}
                        alt={webinar.title}
                        className="w-20 h-20 object-cover rounded-xl"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-20 h-20 bg-blue-200 rounded-lg border-2 border-blue-300 flex items-center justify-center text-2xl font-bold text-blue-700 ${
                        webinar.thumbnail ? "hidden" : "flex"
                      }`}
                    >
                      {webinar.title?.charAt(0) || "W"}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <h4 className="text-lg font-bold text-primary/80">{webinar.title}</h4>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          isPastEvent ? "bg-slate-100 text-text-secondary" : "bg-green-100 text-green-700"
                        }`}
                      >
                        {isPastEvent ? "Past" : "Upcoming"}
                      </span>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          webinar.isPublic ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {webinar.isPublic ? "Public" : "Private"}
                      </span>

                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${levelColor}`}>
                        {webinar.level || "Not specified"}
                      </span>
                    </div>

                    <p className="text-text-secondary text-sm mb-3 line-clamp-2">{webinar.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="text-white">
                        <span className="font-semibold">Platform:</span> {webinar.platform}
                      </div>
                      <div className="text-white">
                        <span className="font-semibold">Instructor:</span> {instructorName}
                      </div>
                      <div className="text-white md:col-span-2">
                        <span className="font-semibold">Scheduled:</span> {formatDate(webinar.scheduledAt)}
                      </div>
                    </div>

                    {webinar.meetingLink && (
                      <div className="mt-2">
                        <a
                          href={webinar.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 text-sm underline"
                        >
                          View Meeting Link
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Action Buttons */}
                <div className="flex flex-wrap gap-2 lg:flex-col lg:w-32">
                  <button
                    className="flex-1 lg:flex-none bg-secondary hover:bg-tertiary text-white p-3 rounded-xl font-semibold transition-all duration-500 cursor-pointer"
                    onClick={() => onEdit(webinar)}
                  >
                    Edit
                  </button>
                  <button
                    className="flex-1 lg:flex-none bg-red-700 hover:bg-red-800 text-white p-3 rounded-xl font-semibold transition-all duration-500 cursor-pointer"
                    onClick={() => onDelete(webinar._id)}
                  >
                    Delete
                  </button>
                  <button
                    className="flex-1 lg:flex-none bg-primary hover:bg-primary/80 text-white p-3 rounded-xl font-semibold transition-all duration-500 cursor-pointer"
                    onClick={() => handleSendInvites(webinar._id)}
                  >
                    Send Invites
                  </button>

                  {/* View Participants button */}
                  <button
                    className="flex-1 lg:flex-none bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl font-semibold transition-all duration-500 cursor-pointer"
                    onClick={() => navigate(`/webinar/${webinar._id}/participants`)}
                  >
                    Participants
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WebinarList;