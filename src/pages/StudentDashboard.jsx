import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  User,
  Calendar,
  Phone,
  Mail,
  BookOpen,
  AlertTriangle,
} from "lucide-react";
import EditProfileForm from "../components/StudentComponent/EditProfileForm";
import EnrolledCourseCard from "../components/StudentComponent/EnrolledCourseCard";
import Leaderboard from "../components/StudentComponent/Leaderboard";
import ProgressModal from "../components/StudentComponent/ProgressModal";
import {
  fetchStudentProfile,
  updateStudentProfile,
  fetchEnrolledCourses,
  fetchCourseLeaderboard,
  getCourseProgress,
} from "../APIs/StudentApi/StudentDetails";
import Swal from "sweetalert2";
import axios from "../utils/axios";
import DashboardShell from "../components/DashboardShell";
import StudentSpeechLab from "../components/SpeechAnalyzer/StudentSpeechLab";
import AiToolsHub from "../components/AiTools/AiToolsHub";
import StudentTools from "../components/Tools/StudentTools";

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showSpeech, setShowSpeech] = useState(false);
  const [showAiTools, setShowAiTools] = useState(false);
  const [aiToolsInit, setAiToolsInit] = useState(null);
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [progressData, setProgressData] = useState(null);
  const [progressLoading, setProgressLoading] = useState(false);
  const [registeredWebinars, setRegisteredWebinars] = useState([]);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // One-time guard for auto-enroll
  const hasProcessedPayment = useRef(false);

  // Memoized fetchData to prevent unnecessary re-renders
  const fetchData = useCallback(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s max

    try {
      setLoading(true);
      setError(null);

      const userStr = localStorage.getItem("user");
      if (!userStr) {
        throw new Error("User not found in localStorage");
      }

      const user = JSON.parse(userStr);

      // Use allSettled so one failure doesn't block everything
      const [profileResult, coursesResult, webinarsResult] =
        await Promise.allSettled([
          fetchStudentProfile(user._id, user.email, {
            signal: controller.signal,
          }),
          fetchEnrolledCourses({ signal: controller.signal }),
          axios.get("/api/webinars/my-webinars", { signal: controller.signal }),
        ]);

      if (profileResult.status === "fulfilled") {
        const profileData = profileResult.value;
        console.log("[PROFILE DATA]", profileData);

        let localUser = {};
        try {
          localUser = JSON.parse(localStorage.getItem("user") || "{}");
        } catch {
          console.warn("Invalid user in localStorage");
        }

        const email = profileData.email || localUser.email;

        setStudentData({
          ...profileData,
          email,
        });

        setFormData({
          name: profileData.name || "",
          phone: profileData.phone || "",
        });
        localStorage.setItem("studentData", JSON.stringify(profileData));
      } else {
        console.warn("Profile fetch failed:", profileResult.reason);
      }

      if (
        webinarsResult.status === "fulfilled" &&
        profileResult.status === "fulfilled"
      ) {
        const webinars = webinarsResult.value?.data || [];

        const studentId = profileResult.value?._id;
        const authUserId = user._id;

        console.log("studentId:", studentId, "authUserId:", authUserId);

        const enrolled = webinars.filter((w) => {
          const isEnrolled = w.registeredStudents?.some(
            (r) =>
              r.student === studentId ||
              r.userId === authUserId ||
              r.student === authUserId,
          );
          const isUpcoming = new Date(w.scheduledAt) > new Date(); // checks if the webinar's date is still in the future in order to return or remove it from the dashboard
          return isEnrolled && isUpcoming;
        });

        setRegisteredWebinars(enrolled);
      } else {
        console.warn("Webinars fetch failed:", webinarsResult.reason);
      }

      if (coursesResult.status === "fulfilled") {
        setEnrolledCourses(coursesResult.value || []);
      } else {
        console.warn("Enrolled courses fetch failed:", coursesResult.reason);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);

      if (err.name === "AbortError") {
        setError(
          "Dashboard data load timed out. Please check your connection or backend server.",
        );
      } else if (err.message.includes("Authentication failed")) {
        localStorage.removeItem("user");
        document.cookie =
          "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        setTimeout(() => navigate("/login"), 2000);
        return;
      } else {
        setError(err.message || "Failed to load dashboard data");
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();

    // Auto-enroll after successful payment – only once
    const paymentStatus = searchParams.get("payment");
    const courseId = searchParams.get("courseId");

    if (
      paymentStatus === "success" &&
      courseId &&
      !hasProcessedPayment.current
    ) {
      hasProcessedPayment.current = true;

      const autoEnroll = async () => {
        // Immediately remove query params to prevent re-trigger
        window.history.replaceState({}, document.title, "/student-dashboard");

        try {
          // Quick local check: already enrolled?
          const alreadyEnrolled = enrolledCourses.some(
            (c) =>
              c.course?._id?.toString() === courseId ||
              c.course?.toString() === courseId,
          );

          if (alreadyEnrolled) {
            const existing = enrolledCourses.find(
              (c) =>
                c.course?._id?.toString() === courseId ||
                c.course?.toString() === courseId,
            );
            const enrollmentId = existing._id;
            const title = existing.course?.title || "Course";
            const level = existing.course?.level || "";

            Swal.fire({
              icon: "info",
              title: "Already Enrolled",
              theme: 'dark',
              text: "You're already enrolled in this course.",
              timer: 2500,
              showConfirmButton: false,
            });

            navigate(
              `/course/${encodeURIComponent(title)}-${encodeURIComponent(level)}`,
              { state: { enrollmentId } },
            );
            return;
          }

          // Enroll with timeout
          const res = await axios.post(
            `/api/enrollments/${courseId}/enroll`,
            {},
            { timeout: 10000 },
          );

          if (res.data?.success) {
            const enrollment = res.data.enrollment;
            const enrollmentId = enrollment._id;

            let title = "Course";
            let level = "";
            try {
              const courseRes = await axios.get(`/api/courses/${courseId}`, {
                timeout: 5000,
              });
              title = courseRes.data?.title || "Course";
              level = courseRes.data?.level || "";
            } catch (fetchErr) {
              console.warn("Couldn't fetch course details", fetchErr);
            }

            Swal.fire({
              icon: "success",
              title: "Enrollment Complete!",
              theme: 'dark',
              text: "You're now enrolled and can start learning.",
              timer: 3000,
              showConfirmButton: false,
            });

            navigate(
              `/course/${encodeURIComponent(title)}-${encodeURIComponent(level)}`,
              { state: { enrollmentId } },
            );

            // Refresh background
            fetchData();
          } else {
            throw new Error(res.data?.message || "Enrollment failed");
          }
        } catch (err) {
          console.error("Auto-enroll failed:", err);

          let message =
            "Payment was successful, but enrollment failed. Please try enrolling manually.";
          if (
            err.response?.status === 409 ||
            err.response?.data?.message?.toLowerCase().includes("already")
          ) {
            message = "You are already enrolled in this course.";
          } else if (err.code === "ECONNABORTED") {
            message = "Enrollment timed out. Please check your connection.";
          }

          Swal.fire({
            icon: "warning",
            title: "Enrollment Issue",
            theme: 'dark',
            text: message,
            confirmButtonText: "OK",
          });
        }
      };

      autoEnroll();
    }
  }, [searchParams, navigate, fetchData]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdateSuccess(false);

    try {
      setLoading(true);

      const userStr = localStorage.getItem("user");
      if (!userStr) throw new Error("User not found in localStorage");

      const user = JSON.parse(userStr);
      const updatedData = await updateStudentProfile(user._id, formData);

      setStudentData({ ...studentData, ...updatedData });
      setIsEditing(false);
      setUpdateSuccess(true);

      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      setError(error.message);

      if (error.message.includes("Authentication failed")) {
        localStorage.removeItem("user");
        document.cookie =
          "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        setTimeout(() => navigate("/login"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoToCourse = (course) => {
    const courseTitle = course.course?.title || course.title;
    const courseLevel = course.course?.level || course.level;
    navigate(
      `/course/${encodeURIComponent(courseTitle)}-${encodeURIComponent(courseLevel)}`,
      { state: { enrollmentId: course._id } },
    );
  };

  const handleCheckProgress = async (course) => {
    try {
      setProgressLoading(true);
      setSelectedCourse(course);
      setProgressModalOpen(true);

      const progress = await getCourseProgress(course._id);
      setProgressData(progress);
    } catch (error) {
      console.error("Failed to fetch progress:", error);
      setProgressModalOpen(false);
      Swal.fire({
        title: "Error",
        theme: 'dark',
        text: "Failed to load progress data",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setProgressLoading(false);
    }
  };

  const handleShowLeaderboard = async (course) => {
    try {
      setLeaderboardLoading(true);
      setSelectedCourse(course);
      setLeaderboardOpen(true);

      const courseId = course.course?._id || course._id;
      const leaderboard = await fetchCourseLeaderboard(courseId);
      setLeaderboardData(leaderboard);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
      Swal.fire({
        title: "Error",
        theme: 'dark',
        text: "Failed to load leaderboard data",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <DashboardShell role="student" eyebrow="Student" title={<>Your <span className="ex-g">dashboard</span></>}>
        <div className="flex justify-center items-center py-20 gap-4">
          <span className="ex-spinner" />
          <span className="ex-lead">Loading dashboard…</span>
        </div>
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell role="student" eyebrow="Student" title={<>Your <span className="ex-g">dashboard</span></>}>
        <div className="ex-card" style={{ textAlign: "center", borderColor: "rgba(239,68,68,.35)" }}>
          <div className="flex items-center justify-center gap-2" style={{ color: "#fca5a5", marginBottom: 16 }}>
            <AlertTriangle size={20} /> <p>{error}</p>
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => fetchData()} className="ex-btn ex-btn-primary">Try again</button>
            <button onClick={() => navigate("/login")} className="ex-btn ex-btn-ghost">Back to login</button>
          </div>
        </div>
      </DashboardShell>
    );
  }

  const avgProgress = enrolledCourses.length > 0
    ? Math.round(enrolledCourses.reduce((acc, course) => acc + (course.completedPercentage || 0), 0) / enrolledCourses.length)
    : 0;

  return (
    <DashboardShell
      role="student"
      eyebrow="Student"
      title={<>Welcome back, <span className="ex-g">{studentData?.name || "Anon"}</span></>}
      lead="Track your progress and manage your learning journey."
      actions={updateSuccess && <span className="ex-badge ex-badge-ok">Profile updated successfully!</span>}
    >
      <StudentTools
        onOpenAiTools={(init) => { setAiToolsInit(init || null); setShowAiTools(true); }}
        events={(registeredWebinars || []).map((w) => ({
          date: (w.scheduledAt || "").slice(0, 10),
          title: w.title || "Webinar",
          time: w.scheduledAt ? new Date(w.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
        })).filter((e) => e.date)}
      />
      <div className="grid lg:grid-cols-[minmax(0,360px)_1fr] gap-6 items-start">
        {/* Left column: profile, stats, webinars */}
        <div className="grid gap-6">
          <div className="ex-card ex-reveal">
            <div className="flex items-center justify-between mb-6">
              <h2 style={{ fontFamily: "var(--ex-font)", fontWeight: 700, fontSize: "1.3rem" }}>Profile</h2>
              <button onClick={() => setIsEditing(!isEditing)} className="ex-btn ex-btn-ghost" style={{ padding: "8px 16px" }}>
                {isEditing ? "Cancel" : "Edit"}
              </button>
            </div>

            {isEditing ? (
              <EditProfileForm formData={formData} setFormData={setFormData} onSubmit={handleUpdate} />
            ) : (
              <div className="grid gap-3">
                {[
                  [<User size={18} />, "Name", studentData?.name],
                  [<Mail size={18} />, "Email", studentData?.email || "No email"],
                  [<Phone size={18} />, "Phone", studentData?.phone || "Not provided"],
                  [<Calendar size={18} />, "Member since", studentData?.createdAt ? formatDate(studentData.createdAt) : "Recent"],
                ].map(([icon, label, value], i) => (
                  <div key={i} className="flex items-center gap-3" style={{ border: "1px solid var(--ex-line)", borderRadius: 12, padding: 12 }}>
                    <span style={{ color: "var(--pL)" }}>{icon}</span>
                    <div>
                      <p className="ex-label" style={{ margin: 0 }}>{label}</p>
                      <p style={{ fontWeight: 600, color: "var(--ex-text)" }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick stats */}
            <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--ex-line)" }}>
              <div className="ex-eyebrow">Quick stats</div>
              <div className="grid gap-3">
                <div className="flex items-center justify-between" style={{ border: "1px solid var(--ex-line)", borderRadius: 12, padding: "12px 14px" }}>
                  <span>Courses enrolled</span>
                  <span style={{ fontWeight: 700, color: "var(--pL)" }}>{enrolledCourses.length}</span>
                </div>
                <div className="flex items-center justify-between" style={{ border: "1px solid var(--ex-line)", borderRadius: 12, padding: "12px 14px" }}>
                  <span>Average progress</span>
                  <span style={{ fontWeight: 700, color: "var(--pL)" }}>{avgProgress}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Webinars */}
          {registeredWebinars.length > 0 && (
            <div className="ex-card ex-reveal">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-5">
                <div>
                  <h2 style={{ fontFamily: "var(--ex-font)", fontWeight: 700, fontSize: "1.25rem" }}>My webinars</h2>
                  <p className="ex-lead" style={{ fontSize: ".85rem" }}>Registered upcoming sessions</p>
                </div>
                <button onClick={() => navigate("/webinars")} className="ex-btn ex-btn-ghost" style={{ padding: "8px 14px", fontSize: ".85rem" }}>Browse</button>
              </div>
              <div className="grid gap-3">
                {registeredWebinars.map((webinar) => {
                  const instructorName = webinar.instructors?.length > 0
                    ? webinar.instructors[0].name || webinar.instructors[0].email || "Expert"
                    : "Expert";
                  return (
                    <div key={webinar._id} className="flex items-center gap-3" style={{ border: "1px solid var(--ex-line)", borderRadius: 12, padding: 12 }}>
                      <img src={webinar.thumbnail || "https://res.cloudinary.com/dsgxyezcm/image/upload/v1767878441/Anonymous_b5hlab.jpg"} style={{ width: 56, height: 56, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                      <div className="flex-1 min-w-0">
                        <p style={{ fontWeight: 600 }} className="truncate">{webinar.title}</p>
                        <p className="ex-lead" style={{ fontSize: ".8rem" }}>{instructorName}</p>
                        <p style={{ color: "var(--pL)", fontSize: ".75rem", marginTop: 2 }}>
                          {webinar.scheduledAt ? new Date(webinar.scheduledAt).toLocaleString("en-US", { timeZone: "Europe/Berlin", dateStyle: "medium", timeStyle: "short" }) : "Date TBD"}
                        </p>
                      </div>
                      <button onClick={() => navigate(`/webinars/${webinar._id}`)} className="ex-btn ex-btn-ghost" style={{ padding: "6px 12px", fontSize: ".8rem" }}>View →</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right column: courses */}
        <div className="ex-card ex-reveal">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-5">
            <div className="text-center sm:text-left">
              <h2 style={{ fontFamily: "var(--ex-font)", fontWeight: 700, fontSize: "1.5rem" }}>My courses</h2>
              <p className="ex-lead" style={{ fontSize: ".9rem" }}>Continue your learning journey</p>
            </div>
            <button onClick={() => navigate("/courses")} className="ex-btn ex-btn-primary"><BookOpen size={16} /> Browse more</button>
          </div>

          {enrolledCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-14" style={{ border: "2px dashed var(--ex-line)", borderRadius: 14 }}>
              <BookOpen size={44} style={{ color: "var(--pL)" }} />
              <p style={{ fontWeight: 600, fontSize: "1.1rem" }}>No courses enrolled yet</p>
              <p className="ex-lead">Start your learning journey by enrolling in courses</p>
              <button onClick={() => navigate("/courses")} className="ex-btn ex-btn-primary" style={{ marginTop: 8 }}>Explore courses</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {enrolledCourses.map((course, index) => (
                <EnrolledCourseCard
                  key={course._id || index}
                  course={course}
                  onGoToCourse={handleGoToCourse}
                  onCheckProgress={handleCheckProgress}
                  onShowLeaderboard={handleShowLeaderboard}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Leaderboard
        isOpen={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        leaderboard={leaderboardData}
        courseTitle={selectedCourse?.course?.title || selectedCourse?.title}
        loading={leaderboardLoading}
      />

      <ProgressModal
        isOpen={progressModalOpen}
        onClose={() => setProgressModalOpen(false)}
        course={selectedCourse}
        progress={progressData}
        loading={progressLoading}
      />

      <button className="spl-fab" style={{ bottom: 78 }} onClick={() => setShowAiTools(true)}>✦ AI Tools</button>
      <button className="spl-fab" onClick={() => setShowSpeech(true)}>🎤 Speaking practice</button>
      {showSpeech && <StudentSpeechLab onClose={() => setShowSpeech(false)} student={studentData} />}
      {showAiTools && (
        <AiToolsHub
          role="student"
          initialTab={aiToolsInit?.tab}
          onClose={() => { setShowAiTools(false); setAiToolsInit(null); }}
          context={{
            name: studentData?.name,
            studentId: studentData?._id || studentData?.id,
            coursesCount: enrolledCourses.length,
            initialExam: aiToolsInit?.topic ? { topic: aiToolsInit.topic, language: aiToolsInit.language, level: aiToolsInit.level } : undefined,
          }}
        />
      )}
    </DashboardShell>
  );
};

export default StudentDashboard;
