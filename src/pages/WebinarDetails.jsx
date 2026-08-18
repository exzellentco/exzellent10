import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../utils/axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const WebinarDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [webinar, setWebinar] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [showSyllabus, setShowSyllabus] = useState(false);
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState("");

  const FALLBACK_IMG =
    "https://res.cloudinary.com/dsgxyezcm/image/upload/v1767878441/Anonymous_b5hlab.jpg";

  const isLoggedIn = () => document.cookie.includes("token=");
  const handleLoginRedirect = () => navigate("/login");

  const berlinTimeZone = "Europe/Berlin";

  const formatDateFull = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      timeZone: berlinTimeZone,
      dateStyle: "medium",
      timeStyle: "medium",
    });
  };

  const formatTimeOnly = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      timeZone: berlinTimeZone,
      timeStyle: "short",
    });
  };

  const getDuration = (start, end) => {
    if (!start || !end) return null;
    const diffMs = new Date(end) - new Date(start);
    if (diffMs <= 0) return null;
    const totalMinutes = Math.round(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  const getRelativeTime = (isoString) => {
    if (!isoString) return "";
    const eventDate = new Date(isoString);
    const now = new Date();
    const eventDay = new Date(
      eventDate.getFullYear(),
      eventDate.getMonth(),
      eventDate.getDate(),
    );
    const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffInMs = eventDay - nowDay;
    const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));
    if (diffInDays < 0) return "Past event";
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Tomorrow";
    if (diffInDays < 7) return `In ${Math.round(diffInDays)} days`;
    return `In ${Math.ceil(diffInDays / 7)} weeks`;
  };

  useEffect(() => {
    const fetchWebinar = async () => {
      try {
        setLoadError(false);
        const res = await axios.get(`/api/webinars/${id}`);
        // API shape: { success, data: <webinar> }
        const data = res.data?.data ?? res.data;
        if (res.data?.success === false || !data) {
          setLoadError(true);
          return;
        }
        setWebinar(data);

        if (isLoggedIn()) {
          try {
            const statusRes = await axios.get(
              `/api/webinars/${id}/is-registered`,
            );
            setIsUserRegistered(statusRes.data?.isRegistered || false);
          } catch (err) {
            console.error("Could not fetch registration status:", err);
          }
        }
      } catch (err) {
        console.error("Failed to load webinar:", err);
        setLoadError(true);
      }
    };
    fetchWebinar();
  }, [id]);

  const instructorName =
    webinar?.instructors?.length > 0
      ? webinar.instructors[0].name || webinar.instructors[0].email || "Expert"
      : "Expert";

  const hasSyllabus =
    (webinar?.syllabusLevel1?.length ?? 0) > 0 ||
    (webinar?.syllabusLevel2?.length ?? 0) > 0;

  const handleRegisterWebinar = async () => {
    if (!isLoggedIn()) {
      handleLoginRedirect();
      return;
    }

    setIsRegistering(true);
    try {
      const res = await axios.post(`/api/webinars/${webinar._id}/register`);
      // API shape: { success, message, data: <updated webinar> }
      const updated = res.data?.data;
      if (updated) setWebinar(updated);
      setIsUserRegistered(true);
      setRegistrationMessage(
        res.data?.message || "You're registered! You can now join the webinar.",
      );
    } catch (err) {
      if (err?.response?.status === 400) {
        // Already registered — just update the UI
        setIsUserRegistered(true);
        setRegistrationMessage("You're already registered for this webinar.");
      } else {
        console.error("Registration failed:", err);
        alert("Failed to register. Please try again.");
      }
    } finally {
      setIsRegistering(false);
    }
    // No auto-redirect — user clicks "Join Webinar →" themselves
  };

  const handleJoinWebinar = () => {
    if (!webinar?.meetingLink) {
      alert("The meeting link isn't available yet. Please check back later.");
      return;
    }
    window.open(webinar.meetingLink, "_blank", "noopener,noreferrer");
  };

  const handleDownloadSyllabus = () => {
    if (!webinar || !hasSyllabus) return;

    const doc = new jsPDF();

    doc.setProperties({
      title: `${webinar.title} - Syllabus`,
      subject: "Webinar Syllabus",
      author: instructorName,
    });

    doc.setFontSize(20);
    doc.setTextColor(30, 64, 175);
    doc.text(webinar.title, 20, 20);

    doc.setFontSize(14);
    doc.setTextColor(80);
    doc.text(`Level: ${webinar.level || "N/A"}`, 20, 40);

    let y = 55;

    doc.setFontSize(16);
    doc.setTextColor(30, 64, 175);
    doc.text(`${webinar.level || "Level"} 1`, 20, y);
    y += 10;

    autoTable(doc, {
      startY: y,
      head: [["Session", "Topic"]],
      body:
        webinar.syllabusLevel1?.map((item, i) => [i + 1, item.topic || ""]) ||
        [],
      theme: "grid",
      headStyles: {
        fillColor: [30, 64, 175],
        textColor: 255,
        fontSize: 12,
        fontStyle: "bold",
      },
      styles: {
        fontSize: 11,
        cellPadding: 6,
        textColor: [50, 50, 50],
        lineColor: [200, 200, 200],
        lineWidth: 0.3,
      },
      alternateRowStyles: { fillColor: [245, 247, 255] },
      columnStyles: {
        0: { cellWidth: 30, halign: "center" },
        1: { cellWidth: 50 },
        2: { cellWidth: "auto" },
      },
      margin: { left: 20, right: 20 },
    });

    y = doc.lastAutoTable.finalY + 25;

    doc.setFontSize(16);
    doc.setTextColor(30, 64, 175);
    doc.text(`${webinar.level || "Level"} 2`, 20, y);
    y += 10;

    autoTable(doc, {
      startY: y,
      head: [["Session", "Topic"]],
      body:
        webinar.syllabusLevel2?.map((item, i) => [i + 1, item.topic || ""]) ||
        [],
      theme: "grid",
      headStyles: {
        fillColor: [30, 64, 175],
        textColor: 255,
        fontSize: 12,
        fontStyle: "bold",
      },
      styles: {
        fontSize: 11,
        cellPadding: 6,
        textColor: [50, 50, 50],
        lineColor: [200, 200, 200],
        lineWidth: 0.3,
      },
      alternateRowStyles: { fillColor: [245, 247, 255] },
      columnStyles: {
        0: { cellWidth: 30, halign: "center" },
        1: { cellWidth: 50 },
        2: { cellWidth: "auto" },
      },
      margin: { left: 20, right: 20 },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(140);
      doc.text(`Page ${i} of ${pageCount}`, 190, 290, { align: "right" });
    }

    const fileName = `${webinar.title.replace(/[^a-z0-9]/gi, "_")}_Syllabus.pdf`;
    doc.save(fileName);
  };

  if (loadError) {
    return (
      <div className="min-h-screen bg-bg bg-[linear-gradient(to_right,#6185b815_1px,transparent_1px),linear-gradient(to_bottom,#6185b815_1px,transparent_1px)] bg-[size:40px_40px] flex flex-col justify-center items-center text-center px-4">
        <div className="bg-bg2 border border-border rounded-xl p-8 max-w-md flex flex-col items-center gap-4">
          <div className="text-5xl">⚠️</div>
          <h2 className="text-2xl font-bold text-primary">
            Couldn't load this webinar
          </h2>
          <p className="text-text-secondary">
            The webinar may have been removed or is temporarily unavailable.
          </p>
          <button
            onClick={() => navigate("/webinars")}
            className="mt-2 text-lg text-white bg-gradient-to-r from-blue-800 to-primary hover:opacity-80 px-6 py-3 rounded-xl transition-all duration-500 cursor-pointer"
          >
            ← Back to webinars
          </button>
        </div>
      </div>
    );
  }

  if (!webinar) {
    return (
      <div className="min-h-screen bg-slate-50 bg-[linear-gradient(to_right,#6185b815_1px,transparent_1px),linear-gradient(to_bottom,#6185b815_1px,transparent_1px)] bg-[size:40px_40px]  flex flex-col justify-center items-center text-center text-3xl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-text-secondary">Loading Webinar Details...</p>
      </div>
    );
  }

  const duration = getDuration(webinar.scheduledAt, webinar.endsAt);

  return (
    <>
      <div className="pt-28 pb-10 text-center flex flex-col gap-6">
        <h1 className="text-3xl md:text-6xl font-extrabold text-primary">
          {webinar.title}
        </h1>
        <p className="text-text-secondary text-lg sm:text-xl">Webinar details</p>
      </div>

      <div className="min-h-screen bg-bg bg-[linear-gradient(to_right,#6185b815_1px,transparent_1px),linear-gradient(to_bottom,#6185b815_1px,transparent_1px)] bg-[size:40px_40px]  flex flex-col items-center">
        <div className="py-6 max-w-6xl flex justify-start w-full px-4">
          <p
            onClick={() => navigate("/webinars")}
            className="cursor-pointer text-primary hover:text-primary/80 transition-all duration-700 hover:scale-105 text-lg font-medium"
          >
            ← Go back to all Webinars
          </p>
        </div>

        <div className="flex md:flex-row flex-col mx-4 bg-bg2 border border-border max-w-6xl  rounded-xl p-6 gap-6 md:gap-8 text-white justify-center items-center">
          <div className="w-[280px] h-[280px] overflow-hidden rounded-xl aspect-square flex-shrink-0 ">
            <img
              className="w-full h-full object-cover"
              src={webinar.thumbnail || FALLBACK_IMG}
              alt={webinar.title}
              onError={(e) => {
                if (e.target.src !== FALLBACK_IMG) e.target.src = FALLBACK_IMG;
              }}
            />
          </div>

          <div className="flex flex-col justify-between gap-6 flex-1">
            <p className="text-2xl font-medium text-center md:text-left">
              Instructor: {instructorName}
            </p>

            <p className="text-justify">{webinar.description}</p>

            {/* Date & Time Block */}
            <div className="flex justify-between items-center md:flex-row flex-col text-center gap-4">
              <div className="flex flex-col gap-1">
                <p className="text-lg">{formatDateFull(webinar.scheduledAt)}</p>
                {webinar.endsAt && (
                  <p className="text-white text-sm">
                    Ends at {formatTimeOnly(webinar.endsAt)}
                    {duration && (
                      <span className="ml-2 bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
                        {duration}
                      </span>
                    )}
                  </p>
                )}
              </div>
              <p className="text-3xl font-medium">
                {getRelativeTime(webinar.scheduledAt)}
              </p>
            </div>

            <div className="flex md:flex-row flex-col justify-between items-center gap-4 mt-4">
              <p className="text-lg font-medium">
                {(webinar.registeredStudents?.length ?? 0) === 0
                  ? "Be the first one to join!"
                  : webinar.registeredStudents.length === 1
                    ? "1 Student has joined the webinar!"
                    : `${webinar.registeredStudents.length} Students have joined the webinar!`}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                {/* Syllabus toggle */}
                <button
                  onClick={() => setShowSyllabus((prev) => !prev)}
                  disabled={!hasSyllabus}
                  className={`text-lg text-white px-6 py-3 rounded-xl transition-all duration-500 flex-1 md:flex-none
                    ${
                      hasSyllabus
                        ? "bg-gradient-to-r from-blue-800 to-primary hover:opacity-80 cursor-pointer"
                        : "bg-slate-300 cursor-not-allowed opacity-60"
                    }`}
                >
                  {showSyllabus ? "Hide Content" : "View Content"}
                </button>

                {/* Enroll / Join / Login button */}
                {!isLoggedIn() ? (
                  <button
                    onClick={handleLoginRedirect}
                    className="text-lg text-white bg-gradient-to-r from-teal-600 to-secondary hover:opacity-80 px-6 py-3 rounded-xl transition-all duration-500 cursor-pointer flex-1 md:flex-none"
                  >
                    Login to Enroll!
                  </button>
                ) : isUserRegistered ? (
                  <button
                    onClick={handleJoinWebinar}
                    className="text-lg text-white bg-gradient-to-r from-teal-600 to-secondary hover:opacity-80 px-6 py-3 rounded-xl transition-all duration-500 cursor-pointer flex-1 md:flex-none"
                  >
                    Join Webinar →
                  </button>
                ) : (
                  <button
                    onClick={handleRegisterWebinar}
                    disabled={isRegistering}
                    className="text-lg text-white bg-gradient-to-r from-teal-600 to-secondary hover:opacity-80 px-6 py-3 rounded-xl transition-all duration-500 cursor-pointer flex-1 md:flex-none disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isRegistering ? "Enrolling..." : "Enroll →"}
                  </button>
                )}
              </div>
            </div>

            {registrationMessage && (
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-secondary/40 bg-secondary/10 px-4 py-3 text-secondary">
                <span className="text-lg">✓</span>
                <span className="text-sm font-medium">{registrationMessage}</span>
              </div>
            )}
          </div>
        </div>

        {showSyllabus && hasSyllabus && (
          <>
            <div className="grid md:grid-cols-2 gap-6 mt-8 w-full max-w-6xl px-4">
              {[webinar.syllabusLevel1, webinar.syllabusLevel2].map(
                (level, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl  p-6 flex flex-col"
                  >
                    <h2 className="text-center text-primary text-5xl md:text-6xl font-bold mb-6">
                      {webinar.level}.{i + 1}
                    </h2>
                    <table className="w-full h-full table-fixed border-collapse rounded-xl overflow-hidden ">
                      <thead>
                        <tr className="bg-primary text-white  text-center md:text-2xl">
                          <th className="w-1/4 py-4 font-semibold border-r border-white">
                            Session
                          </th>
                          <th className="w-1/2 py-4 font-semibold">Topic</th>
                        </tr>
                      </thead>
                      <tbody>
                        {level?.map(({ topic }, idx) => (
                          <tr
                            key={idx}
                            className="border-b border-slate-300 last:border-b-0 hover:bg-slate-50 transition-all  text-center md:text-lg"
                          >
                            <td className="w-1/4 py-4 font-medium">
                              {i === 0
                                ? idx + 1
                                : idx + (webinar.syllabusLevel1?.length ?? 0) + 1}
                            </td>
                            <td className="w-1/2 py-4 border-l border-slate-300">
                              {topic}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ),
              )}
            </div>
            <div className="pt-10 flex justify-center items-center">
              <button
                onClick={handleDownloadSyllabus}
                disabled={!hasSyllabus}
                className={`bg-primary hover:bg-primary/80 px-8 py-5 rounded-xl text-white text-xl md:text-3xl transition-all duration-500 cursor-pointer hover:scale-105  font-medium ${
                  !hasSyllabus ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Download the Syllabus! ⬇
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default WebinarDetails;
