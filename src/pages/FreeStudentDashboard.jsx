import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import GlassCard from "../components/UI/GlassCard";
import AriaChatWidget from "../components/shared/AriaChatWidget";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  Calendar,
  Phone,
  Mail,
  BookOpen,
  BookOpenText,
  AlertTriangle,
  Group,
  PersonStanding,
  Blocks,
  TestTubeDiagonal,
  ChartLine,
  GraduationCap,
  Repeat2,
  Mic,
  Check,
  Pencil,
  X as XIcon,
  Crown,
  ChevronDown,
  ChevronRight,
  Bell,
  LogOut,
  Coins,
  Users,
  Library,
  UserPlus,
  ArrowRight,
} from "lucide-react";
import SpacedRepetitionSession from "../components/AI/SpacedRepetitionSession";
import EditProfileForm from "../components/StudentComponent/EditProfileForm";
import { signOut as endSession } from "../utils/signOut";
import AiToolsHub from "../components/AiTools/AiToolsHub";
import UpgradeBanner from "../components/UI/UpgradeBanner";
import { isLocked, LOCK_NOTE, PLAN_ROUTE } from "../config/plan";
import StudentSpeechLab from "../components/SpeechAnalyzer/StudentSpeechLab";
import EnrolledCourseCard from "../components/StudentComponent/EnrolledCourseCard";
import CountUp from "../components/StudentComponent/CountUp";
import Leaderboard from "../components/StudentComponent/Leaderboard";
import ProgressModal from "../components/StudentComponent/ProgressModal";
import ProgressReport from "../components/StudentComponent/ProgressReport";
import {
  fetchStudentProfile,
  updateStudentProfile,
  fetchEnrolledCourses,
  fetchCourseLeaderboard,
  getCourseProgress,
} from "../APIs/StudentApi/StudentDetails";
import { getMessages } from "../APIs/messages";
import MyBookings from "../components/StudentComponent/MyBookings";
import Swal from "sweetalert2";
import axios from "../utils/axios";
import GrowthDashboard from "../components/GrowthComponents/GrowthDashboard";

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [progressData, setProgressData] = useState(null);
  const [progressLoading, setProgressLoading] = useState(false);
  const [aiTab, setAiTab] = useState(null);          // "exam" | "course" -> AI Tools overlay
  const [speechOpen, setSpeechOpen] = useState(false);

  /* This component only ever renders for a FREE account — the gate sends paid
     learners to the console — so anything the plan config marks paid-only is
     locked here. Routed through isLocked() rather than hard-coded so the split
     lives in one file. */
  const locked = (feature) => isLocked(feature, false);
  const openOrUpgrade = (feature, open) => () => {
    if (locked(feature)) { navigate(PLAN_ROUTE); return; }
    open();
  };
  const [_registeredWebinarsCount, setRegisteredWebinarsCount] = useState(0);
  const [registeredWebinars, setRegisteredWebinars] = useState([]);
  const [quizProgress, setQuizProgress] = useState(null);
  const [quizProgressLoading, setQuizProgressLoading] = useState(false);
  const [reviewDue, setReviewDue] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [topDeckId, setTopDeckId] = useState(null);
  const [reviewOpen, setReviewOpen] = useState(false);

  // Profile dropdown — collapsed by default, expands to reveal contact
  // details + the Edit action (previously a separate always-visible button).
  const [profileOpen, setProfileOpen] = useState(false);
  const profilePanelRef = useRef(null);
  const [profilePanelHeight, setProfilePanelHeight] = useState(0);

  const [notifOpen, setNotifOpen] = useState(false);

  const prefersReducedMotion = useReducedMotion();

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

      // TEMP: auth bypass for design review — REVERT BEFORE ANY REAL USE
      // If no real session exists, skip the API calls entirely and render
      // the dashboard with placeholder data (incl. a placeholder avatar
      // and tier badge) so the redesign can be reviewed without logging in.
      if (!localStorage.getItem("user")) {
        const mockUser = {
          _id: "mock-student-id",
          name: "Alex Müller",
          email: "alex.mueller@example.com",
          phone: "+49 151 2345678",
          userType: "Student",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 47).toISOString(),
          proficiencyLevel: "A2",
          paid: true,
          credits: 12,
          avatar:
            "https://res.cloudinary.com/dsgxyezcm/image/upload/v1767878441/Anonymous_b5hlab.jpg",
        };
        // Intentionally NOT persisted to localStorage, so this stays a
        // pure render-time mock and doesn't leak a fake session into
        // Navbar/App auth state or other pages.
        setStudentData(mockUser);
        setFormData({ name: mockUser.name, phone: mockUser.phone });
        setEnrolledCourses([
          {
            _id: "mock-enroll-1",
            completedPercentage: 42,
            course: {
              _id: "mock-course-1",
              title: "German A2 — Complete Course",
              language: "German",
              level: "Intermediate",
            },
          },
          {
            _id: "mock-enroll-2",
            completedPercentage: 78,
            course: {
              _id: "mock-course-2",
              title: "Conversational German — Speaking Practice",
              language: "German",
              level: "Beginner",
            },
          },
          {
            _id: "mock-enroll-3",
            completedPercentage: 15,
            course: {
              _id: "mock-course-3",
              title: "telc A2 Exam Preparation",
              language: "German",
              level: "Advanced",
            },
          },
        ]);
        setRegisteredWebinars([]);
        setRegisteredWebinarsCount(0);
        setLoading(false);
        clearTimeout(timeoutId);
        return;
      }

      const userStr = localStorage.getItem("user");
      if (!userStr) {
        throw new Error("User not found in localStorage");
      }

      let user = {};
      try {
        user = JSON.parse(userStr);
      } catch {
        throw new Error("Invalid user data in localStorage");
      }

      // Use allSettled so one failure doesn't block everything
      const [profileResult, coursesResult, webinarsResult] =
        await Promise.allSettled([
          fetchStudentProfile(user._id, {
            signal: controller.signal,
          }),
          fetchEnrolledCourses({ signal: controller.signal }),
          axios.get("/api/webinars/my-webinars", { signal: controller.signal }),
        ]);

      if (profileResult.status === "fulfilled") {
        const profileData = profileResult.value;

        let localUser = {};
        try {
          localUser = JSON.parse(localStorage.getItem("user") || "{}");
        } catch {
          // corrupted localStorage — ignore
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
      }

      if (
        webinarsResult.status === "fulfilled" &&
        profileResult.status === "fulfilled"
      ) {
        const webinars = webinarsResult.value?.data || [];

        const studentId = profileResult.value?._id;
        const authUserId = user._id;

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
        setRegisteredWebinarsCount(enrolled.length);
      }

      if (coursesResult.status === "fulfilled") {
        setEnrolledCourses(coursesResult.value || []);
      }
    } catch (err) {

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

  // Load the premium type pairing for this page only (Fraunces for
  // headings, Inter for body/UI). Injected at runtime so no other
  // page's <head> or global stylesheet is touched.
  useEffect(() => {
    if (document.getElementById("sd-google-fonts")) return;
    const link = document.createElement("link");
    link.id = "sd-google-fonts";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700;800&display=swap";
    document.head.appendChild(link);
  }, []);

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
              theme: "dark",
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
            } catch {
              // non-critical — title defaults to "Course"
            }

            Swal.fire({
              icon: "success",
              title: "Enrollment Complete!",
              theme: "dark",
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
            theme: "dark",
            text: message,
            confirmButtonText: "OK",
          });
        }
      };

      autoEnroll();
    }
  }, [searchParams, navigate, fetchData]);

  useEffect(() => {
    const fetchQuizProgress = async () => {
      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) return;
        let user = {};
        try {
          user = JSON.parse(userStr);
        } catch {
          return;
        }
        setQuizProgressLoading(true);
        const res = await axios.get(`/api/quizzes/progress/${user._id}`);
        if (res.data.success) setQuizProgress(res.data.data);
      } catch {
        // non-fatal — quiz progress panel stays hidden
      } finally {
        setQuizProgressLoading(false);
      }
    };
    fetchQuizProgress();
  }, []);

  useEffect(() => {
    if (!enrolledCourses.length) return;

    const fetchReviewStats = async () => {
      setReviewLoading(true);
      try {
        const courseIds = enrolledCourses
          .slice(0, 6)
          .map((c) => c.course?._id || c._id)
          .filter(Boolean);

        const deckResults = await Promise.allSettled(
          courseIds.map((id) => axios.get(`/api/flashcards/course/${id}`))
        );

        const deckIds = [];
        deckResults.forEach((r) => {
          if (r.status !== "fulfilled") return;
          const payload = r.value.data?.data ?? r.value.data;
          if (!payload) return;
          const list = Array.isArray(payload) ? payload : [payload];
          list.forEach((d) => { if (d?._id) deckIds.push(d._id); });
        });

        if (!deckIds.length) return;

        const statsResults = await Promise.allSettled(
          deckIds.map((id) =>
            axios
              .get(`/api/spaced-repetition/stats/${id}`)
              .then((r) => ({ deckId: id, ...(r.data ?? {}) }))
          )
        );

        let total = 0;
        let maxDue = 0;
        let bestDeck = null;

        statsResults.forEach((r) => {
          if (r.status !== "fulfilled") return;
          const due = r.value.due ?? 0;
          total += due;
          if (due > maxDue) { maxDue = due; bestDeck = r.value.deckId; }
        });

        setReviewDue(total);
        setTopDeckId(bestDeck);
      } catch {
        // non-fatal — widget stays hidden
      } finally {
        setReviewLoading(false);
      }
    };

    fetchReviewStats();
  }, [enrolledCourses]);

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
    } catch {
      setProgressModalOpen(false);
      Swal.fire({
        title: "Error",
        theme: "dark",
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
    } catch {
      Swal.fire({
        title: "Error",
        theme: "dark",
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

  // ── Page-scoped brand tokens ────────────────────────────────────────
  // Applied via inline CSS custom properties so the palette only affects
  // this page and its sub-components — no global stylesheet is touched.
  // Dark premium base (matches the app's original near-black aesthetic)
  // with the brand's violet/gold accents layered on top, rather than a
  // light lavender surface.
  const sdVars = {
    "--sd-bg": "#050508",
    "--sd-surface": "#100e1c",
    "--sd-card-bg": "rgba(24,20,40,0.6)",
    "--sd-primary": "#8C51F0",
    "--sd-primary-deep": "#5B21B6",
    "--sd-primary-light": "#B392F5",
    "--sd-gold": "#C9A227",
    "--sd-ink": "#F3EEFB",
    "--sd-ink-muted": "#a79cc7",
    "--sd-border": "rgba(140,81,240,0.22)",
    "--sd-font-heading": "'Fraunces', 'Georgia', serif",
    "--sd-font-body": "'Inter', system-ui, sans-serif",
    fontFamily: "var(--sd-font-body)",
  };

  // Restores the original decorative background: a faint violet-tinted
  // grid watermark over the near-black base, the same treatment the app
  // used before this redesign — now tuned to sit under the brand accents.
  const pageBgStyle = {
    ...sdVars,
    backgroundColor: "var(--sd-bg)",
    backgroundImage:
      "linear-gradient(to right, rgba(140,81,240,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(140,81,240,0.08) 1px, transparent 1px)",
    backgroundSize: "40px 40px",
  };

  // ── Avatar ───────────────────────────────────────────────────────────
  // Displays the student's own picture if the profile carries one under
  // any of the field names the backend might use; falls back to a quiet
  // initials mark (not a generic silhouette icon) if no photo exists.
  // Purely a display concern — how/where the picture is stored or
  // uploaded is unchanged.
  const avatarUrl =
    studentData?.avatar ||
    studentData?.profilePicture ||
    studentData?.photoURL ||
    studentData?.picture ||
    studentData?.image ||
    null;

  const initials = (studentData?.name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "S";

  // ── Membership tier badge ───────────────────────────────────────────
  // No dedicated "tier" field exists in the current data model, so this
  // is derived from the closest real signals already on the student
  // record (paid / credits). If a real `tier` field is ever added,
  // it takes priority automatically.
  // The plan, plainly. This used to read "Classroom" or "Webinars" for anyone
  // holding credits, which named a tier the platform does not sell and told a
  // free learner nothing about what they were actually on.
  const tierBadge = studentData?.paid ? "Full Access" : "Free plan";

  // Measure the profile dropdown's real content height (same reliable
  // technique used for the "Your learning mix" accordion) so it expands
  // and collapses smoothly instead of animating to "auto".
  useLayoutEffect(() => {
    if (profilePanelRef.current) {
      setProfilePanelHeight(profilePanelRef.current.scrollHeight);
    }
  }, [profileOpen, isEditing, studentData, formData]);

  // ── Notifications ────────────────────────────────────────────────────
  // Real: the learner's unread incoming messages. This used to be three
  // hard-coded placeholder items ("New message from your teacher"), which a
  // real user would reasonably take as true. An empty bell is honest; a fake
  // full one is not.
  const [notifs, setNotifs] = useState([]);
  useEffect(() => {
    let alive = true;
    const me = (() => { try { return JSON.parse(localStorage.getItem("user"))?._id; } catch { return null; } })();
    if (!me) return undefined;
    const ago = (d) => {
      const m = Math.max(1, Math.round((Date.now() - new Date(d).getTime()) / 60000));
      if (m < 60) return `${m} min ago`;
      const h = Math.round(m / 60); if (h < 24) return `${h}h ago`;
      return `${Math.round(h / 24)}d ago`;
    };
    getMessages(me).then((res) => {
      if (!alive) return;
      const rows = Array.isArray(res) ? res : res?.data || [];
      setNotifs(rows
        .filter((m) => String(m.toId) === String(me) && !m.read)
        .sort((x, y) => new Date(y.date) - new Date(x.date))
        .slice(0, 8)
        .map((m) => ({ id: m._id, title: `Message from ${m.fromName || "your teacher"}`, sub: String(m.text || "").slice(0, 70), time: ago(m.date), unread: true })));
    }).catch(() => { /* the bell simply stays empty */ });
    return () => { alive = false; };
  }, []);
  const unreadNotifCount = notifs.length;

  // ── Quick Links — sidebar shortcut list ─────────────────────────────
  // Routes are cross-checked against App.jsx where a matching page exists;
  // anything without a confirmed destination is clearly marked below.
  /* Sign out. The global Navbar is hidden on /student-dashboard so the paid
     console can draw its own chrome — which left the FREE dashboard with no way
     out at all. Mirrors the console and the teacher page. */
  const signOut = () => endSession(navigate);

  const FUNCTION_LINKS = [
    {
      label: "Calendar",
      icon: Calendar,
      to: "/calendar",
    },
    {
      label: "Additional Resources",
      icon: Library,
      to: "/courses", // there is no /study-materials route; course pages carry the materials
    },
  ];

  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col justify-center items-center text-center"
        style={pageBgStyle}
      >
        <div
          className="animate-spin rounded-full h-10 w-10 mb-4"
          style={{ border: "2.5px solid rgba(255,255,255,0.12)", borderBottomColor: "var(--sd-primary)" }}
        />
        <p style={{ color: "var(--sd-ink-muted)" }}>Loading your dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen py-40 text-center px-6"
        style={pageBgStyle}
      >
        <div
          className="p-4 rounded-xl mb-6 flex items-center justify-center gap-2 max-w-md mx-auto"
          style={{ background: "rgba(239,68,68,0.1)", color: "#ff9b9b", border: "1px solid rgba(239,68,68,0.25)" }}
        >
          <AlertTriangle className="w-5 h-5 flex-shrink-0" /> <p>{error}</p>
        </div>
        <button
          onClick={() => fetchData()}
          className="px-6 py-3 rounded-xl mr-4 cursor-pointer transition-colors font-medium"
          style={{ background: "var(--sd-primary)", color: "#fff", boxShadow: "0 4px 14px rgba(140,81,240,0.35)" }}
        >
          Try Again
        </button>
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-3 rounded-xl cursor-pointer font-medium border-[1.5px] border-[var(--sd-primary)] text-[var(--sd-primary-light)] bg-transparent hover:bg-[var(--sd-primary)] hover:text-white transition-colors duration-300"
        >
          Back to Login
        </button>
      </div>
    );
  }

  /* growth dashboard */



  return (
    <div className="w-full" style={pageBgStyle}>
      {/* Header Section — the hero: strongest, most polished part of the page */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 16, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative pt-28 pb-16 text-center mb-6 md:mb-0 px-4 overflow-hidden"
      >
        {/* Ambient glow — the restored decorative background element,
            reimagined as soft violet/gold light behind the hero instead
            of a flat pattern. Purely decorative; skipped entirely when
            the user prefers reduced motion. */}

        <div className="relative">
          <motion.span
            initial={prefersReducedMotion ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="inline-block text-xs font-semibold uppercase tracking-[0.2em] mb-4"
            style={{ color: "var(--sd-gold)" }}
          >
            Student Dashboard
          </motion.span>

          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-semibold mb-4 leading-[1.05] tracking-tight"
            style={{ color: "var(--sd-ink)", fontFamily: "var(--sd-font-heading)" }}
          >
            Welcome back,
            <br className="sm:hidden" />{" "}
            <span style={{ color: "var(--sd-primary-light)" }}>{studentData?.name || "there"}</span>
          </h1>
          <p className="font-normal text-base md:text-lg max-w-md mx-auto" style={{ color: "var(--sd-ink-muted)" }}>
            Where you are, and what is next.
          </p>

          <AnimatePresence>
            {updateSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="mt-5 p-3 rounded-xl inline-flex items-center text-sm font-medium"
                style={{ background: "rgba(140,81,240,0.14)", color: "var(--sd-primary-light)", border: "1px solid rgba(140,81,240,0.3)" }}
              >
                <svg
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Profile updated successfully!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Main Content */}
      <section className="py-8">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row gap-8">
          {/* Profile Section */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl p-6 max-w-sm w-full h-fit"
            style={{ background: "var(--sd-card-bg)", border: "1px solid var(--sd-border)", boxShadow: "0 2px 16px rgba(91,33,182,0.06)" }}
          >
            {/* Avatar + name + tier badge — collapsed trigger row. Clicking
                anywhere on the row expands the panel below to reveal contact
                details and the Edit action (previously a separate
                always-visible button). */}
            <div
              className="flex items-center gap-4 cursor-pointer select-none"
              onClick={() => setProfileOpen((o) => !o)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setProfileOpen((o) => !o);
                }
              }}
              aria-expanded={profileOpen}
            >
              <div
                className="relative w-16 h-16 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center"
                style={{
                  background: avatarUrl
                    ? "transparent"
                    : "linear-gradient(135deg, var(--sd-primary-deep), var(--sd-primary))",
                  boxShadow: "0 0 0 2.5px var(--sd-gold), 0 0 16px rgba(140,81,240,0.35)",
                }}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={studentData?.name ? `${studentData.name}'s profile picture` : "Profile picture"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span
                    className="font-semibold text-lg"
                    style={{ color: "#fff", fontFamily: "var(--sd-font-heading)" }}
                  >
                    {initials}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <h2
                  className="font-semibold text-lg truncate"
                  style={{ color: "var(--sd-ink)", fontFamily: "var(--sd-font-heading)" }}
                >
                  {studentData?.name || "Student"}
                </h2>

                {/* Tier badge — gradient-bordered pill with a quiet shimmer
                    sweep, reads as a badge of distinction rather than a
                    flat label. Shimmer loops with a long pause so it never
                    feels busy, and is skipped entirely under
                    prefers-reduced-motion. */}
                <span
                  className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{ border: "1px solid var(--sd-border)", color: "var(--sd-gold)" }}
                >
                  <Crown className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{tierBadge}</span>
                </span>
              </div>

              <motion.span
                animate={{ rotate: profileOpen ? 180 : 0 }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                className="ml-auto flex-shrink-0"
              >
                <ChevronDown className="w-5 h-5" style={{ color: "var(--sd-ink-muted)" }} />
              </motion.span>
            </div>

            {/* Expandable panel — always mounted, height tweened between 0
                and its real measured pixel height (same reliable pattern
                used for the "Your learning mix" accordion). Holds the
                contact info rows / edit form, plus the Edit action that
                previously lived as a standalone always-visible button. */}
            <motion.div
              initial={false}
              animate={{
                height: prefersReducedMotion ? (profileOpen ? "auto" : 0) : profileOpen ? profilePanelHeight : 0,
                opacity: profileOpen ? 1 : 0,
              }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              /* overflow:hidden here is required for the height animation
                 (see note below on the panel div). The negative margin +
                 matching padding widens the clipping box by 6px on each
                 side — without shifting the content's visual position at
                 all — so the whileHover scale on the Edit/Cancel/Save
                 buttons inside has room to zoom without being clipped. */
              style={{ overflow: "hidden", marginLeft: "-6px", marginRight: "-6px", paddingLeft: "6px", paddingRight: "6px" }}
              aria-hidden={!profileOpen}
            >
              {/* NOTE: spacing above the divider is done with padding-top
                  only (never margin-top) — an element's own margin isn't
                  counted in its scrollHeight, so a margin here would make
                  the measured height undershoot the real rendered height
                  and clip the bottom of the panel (Edit button/etc).
                  pb-2 below is the same idea applied to the bottom edge:
                  the whileHover scale on the last button (Edit/Cancel/Save)
                  visually grows a couple px past the panel's natural
                  bottom, and since padding (unlike margin) IS included in
                  scrollHeight, this reserves that room in the actual
                  measurement so the animated height — and the outer
                  overflow:hidden box — grow to cover it instead of
                  clipping it. */}
              <div ref={profilePanelRef} className="pt-6 pb-2" style={{ borderTop: "1px solid var(--sd-border)" }}>
                {isEditing ? (
                  <>
                    <EditProfileForm
                      formData={formData}
                      setFormData={setFormData}
                      onSubmit={handleUpdate}
                    />
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditing(false);
                      }}
                      whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
                      whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-center gap-1.5 w-full mt-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer border-[1.5px] border-[var(--sd-border)] text-[var(--sd-ink-muted)] bg-transparent hover:bg-[rgba(255,255,255,0.06)] transition-colors duration-300"
                    >
                      <XIcon className="w-3.5 h-3.5" /> Cancel
                    </motion.button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl" style={{ border: "1px solid var(--sd-border)" }}>
                      <Mail className="w-4.5 h-4.5" style={{ color: "var(--sd-gold)" }} />
                      <div className="min-w-0">
                        <p className="text-xs font-medium" style={{ color: "var(--sd-ink-muted)" }}>Email</p>
                        <p className="text-sm truncate" style={{ color: "var(--sd-ink)" }}>
                          {studentData?.email || "No email"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl" style={{ border: "1px solid var(--sd-border)" }}>
                      <Phone className="w-4.5 h-4.5" style={{ color: "var(--sd-gold)" }} />
                      <div>
                        <p className="text-xs font-medium" style={{ color: "var(--sd-ink-muted)" }}>Phone</p>
                        <p className="text-sm" style={{ color: "var(--sd-ink)" }}>
                          {studentData?.phone || "Not provided"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl" style={{ border: "1px solid var(--sd-border)" }}>
                      <Calendar className="w-4.5 h-4.5" style={{ color: "var(--sd-gold)" }} />
                      <div>
                        <p className="text-xs font-medium" style={{ color: "var(--sd-ink-muted)" }}>Member Since</p>
                        <p className="text-sm" style={{ color: "var(--sd-ink)" }}>
                          {studentData?.createdAt
                            ? formatDate(studentData.createdAt)
                            : "Recent"}
                        </p>
                      </div>
                    </div>

                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditing(true);
                      }}
                      whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
                      whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-center gap-1.5 w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer border-[1.5px] border-[rgba(140,81,240,0.45)] text-[var(--sd-primary-light)] bg-[rgba(140,81,240,0.1)] hover:bg-[var(--sd-primary)] hover:text-white hover:border-[var(--sd-primary)] transition-colors duration-300"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit Profile
                    </motion.button>

                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick Stats */}
            <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--sd-border)" }}>
              <p
                className="text-sm font-semibold mb-4 uppercase tracking-wide"
                style={{ color: "var(--sd-ink-muted)" }}
              >
                Quick Stats
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl" style={{ border: "1px solid var(--sd-border)" }}>
                  <span className="text-sm inline-flex items-center gap-1.5" style={{ color: "var(--sd-ink)" }}>
                    <Coins className="w-4 h-4" style={{ color: "var(--sd-gold)" }} /> Credits
                  </span>
                  <span className="font-semibold" style={{ color: "var(--sd-gold)" }}>
                    <CountUp value={studentData?.credits || 0} />
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl" style={{ border: "1px solid var(--sd-border)" }}>
                  <span className="text-sm" style={{ color: "var(--sd-ink)" }}>Plan</span>
                  <span className="font-semibold" style={{ color: studentData?.paid ? "var(--sd-gold)" : "var(--sd-ink-muted)" }}>
                    {tierBadge}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl" style={{ border: "1px solid var(--sd-border)" }}>
                  <span className="text-sm" style={{ color: "var(--sd-ink)" }}>Courses Enrolled</span>
                  <span className="font-semibold" style={{ color: "var(--sd-primary-light)" }}>
                    <CountUp value={enrolledCourses.length} />
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl" style={{ border: "1px solid var(--sd-border)" }}>
                  <span className="text-sm" style={{ color: "var(--sd-ink)" }}>Average Progress</span>
                  <span className="font-semibold" style={{ color: "var(--sd-primary-light)" }}>
                    <CountUp
                      value={
                        enrolledCourses.length > 0
                          ? Math.round(
                              enrolledCourses.reduce(
                                (acc, course) =>
                                  acc + (course.completedPercentage || 0),
                                0,
                              ) / enrolledCourses.length,
                            )
                          : 0
                      }
                      suffix="%"
                    />
                  </span>
                </div>
                {/* Enrolled Webinars Section */}
                {registeredWebinars.length > 0 && (
                  <div className="mb-2 rounded-xl p-5" style={{ background: "var(--sd-surface)", border: "1px solid var(--sd-border)" }}>
                    <div className="flex flex-col items-center justify-between gap-3 mb-3">
                      <button
                        onClick={() => navigate("/webinars")}
                        className="px-4 py-2 rounded-xl cursor-pointer transition-all duration-300 font-medium text-sm hover:-translate-y-0.5"
                        style={{ background: "var(--sd-primary)", color: "#fff" }}
                      >
                        Browse Webinars
                      </button>
                      <div className="text-center mb-2 sm:mb-0">
                        <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--sd-ink)", fontFamily: "var(--sd-font-heading)" }}>
                          My Webinars
                        </h2>
                        <p className="text-sm" style={{ color: "var(--sd-ink-muted)" }}>
                          Registered upcoming sessions
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {registeredWebinars.map((webinar) => {
                        const instructorName =
                          webinar.instructors?.length > 0
                            ? webinar.instructors[0].name ||
                              webinar.instructors[0].email ||
                              "Expert"
                            : "Expert";

                        return (
                          <div
                            key={webinar._id}
                            className="flex flex-col md:flex-row md:items-center gap-4 rounded-xl p-4 transition-all duration-300"
                            style={{ background: "var(--sd-card-bg)", border: "1px solid var(--sd-border)" }}
                          >
                            <div className="flex flex-row gap-4 items-center flex-1 min-w-0">
                              <img
                                src={
                                  webinar.thumbnail ||
                                  "https://res.cloudinary.com/dsgxyezcm/image/upload/v1767878441/Anonymous_b5hlab.jpg"
                                }
                                alt={webinar.title || "Webinar thumbnail"}
                                className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate" style={{ color: "var(--sd-ink)" }}>
                                  {webinar.title}
                                </p>
                                <p className="text-xs" style={{ color: "var(--sd-ink-muted)" }}>
                                  {instructorName}
                                </p>
                                <p className="text-xs mt-1" style={{ color: "var(--sd-primary)" }}>
                                  {webinar.scheduledAt
                                    ? new Date(
                                        webinar.scheduledAt,
                                      ).toLocaleString("en-US", {
                                        timeZone: "Europe/Berlin",
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                      })
                                    : "Date TBD"}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                navigate(`/webinars/${webinar._id}`)
                              }
                              className="group text-xs font-medium px-3 py-2 rounded-lg flex-shrink-0 w-full sm:w-auto text-center bg-[rgba(140,81,240,0.1)] text-[var(--sd-primary-light)] hover:bg-[var(--sd-primary)] hover:text-white transition-colors duration-300"
                            >
                              View{" "}
                              <span className="inline-block group-hover:translate-x-0.5 transition-transform duration-300">→</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Functions / Quick Links */}
            <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--sd-border)" }}>
              <p
                className="text-sm font-semibold mb-4 uppercase tracking-wide"
                style={{ color: "var(--sd-ink-muted)" }}
              >
                Functions
              </p>
              <div className="space-y-2">
                {FUNCTION_LINKS.map(({ label, icon: Icon, to }) => (
                  <motion.button
                    key={label}
                    onClick={() => navigate(to)}
                    whileHover={prefersReducedMotion ? undefined : { x: 3 }}
                    transition={{ duration: 0.2 }}
                    className="group flex items-center gap-3 w-full p-3 rounded-xl cursor-pointer text-left border-[1.5px] border-[var(--sd-border)] bg-transparent hover:bg-[rgba(140,81,240,0.1)] hover:border-[rgba(140,81,240,0.45)] transition-colors duration-300"
                  >
                    <span
                      className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(140,81,240,0.14)" }}
                    >
                      <Icon className="w-4.5 h-4.5" style={{ color: "var(--sd-primary-light)" }} />
                    </span>
                    <span className="flex-1 text-sm font-medium" style={{ color: "var(--sd-ink)" }}>
                      {label}
                    </span>
                    <ChevronRight
                      className="w-4 h-4 flex-shrink-0 transition-transform duration-300 group-hover:translate-x-0.5"
                      style={{ color: "var(--sd-ink-muted)" }}
                    />
                  </motion.button>
                ))}
              </div>

              {/* Divider — same "mt-6 pt-6 + border-top" treatment used
                  above the Functions heading, now separating Book a Tutor
                  from the Functions list above it. */}
              <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--sd-border)" }}>
                {/* Book a Tutor — more visually weighted than the Function
                    rows above (larger icon tile, soft violet-tinted resting
                    background, heading-font label), but built from the same
                    brand language rather than a gold accent: violet border,
                    icon tile matching the Functions-row / accordion tile
                    treatment, and the exact translucent glass hover used by
                    "Check Progress" elsewhere on this page, layered with a
                    soft outward glow on hover matching "Go to Course".
                    Links to the "Find Your Teacher" browse page (App.jsx
                    `/teachers`), since the dynamic `/teachers/:teacherId/book`
                    route requires a specific teacher to already be selected. */}
                <motion.button
                  onClick={() => navigate("/book")}
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="group flex items-center gap-3.5 w-full p-4 rounded-xl cursor-pointer text-left border-[1.5px] border-[var(--sd-primary)] bg-[rgba(140,81,240,0.1)] shadow-[0_4px_16px_rgba(140,81,240,0.18)] hover:bg-[rgba(140,81,240,0.16)] hover:backdrop-blur-md hover:border-[var(--sd-primary-light)] hover:shadow-[0_0_24px_rgba(140,81,240,0.55)] transition-all duration-300"
                >
                <span
                  className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, var(--sd-primary-deep), var(--sd-primary))",
                    boxShadow: "0 0 12px rgba(140,81,240,0.4)",
                  }}
                >
                  <UserPlus className="w-5 h-5" style={{ color: "#fff" }} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold" style={{ color: "var(--sd-ink)", fontFamily: "var(--sd-font-heading)" }}>
                    Book a Tutor
                  </span>
                  <span className="block text-xs mt-0.5" style={{ color: "var(--sd-ink-muted)" }}>
                    Find and schedule a 1-to-1 session
                  </span>
                </span>
                <ArrowRight
                  className="w-4.5 h-4.5 flex-shrink-0 transition-transform duration-300 group-hover:translate-x-0.5"
                  style={{ color: "var(--sd-primary-light)" }}
                />
                </motion.button>
              </div>

              {/* Always visible: it used to sit inside the collapsed profile
                  panel, which meant a student had no way out that they could
                  see. The global navbar is hidden on this route. */}
              <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--sd-border)" }}>
                <button
                  type="button"
                  onClick={signOut}
                  className="flex items-center justify-center gap-2 w-full px-3.5 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
                  style={{ border: "1px solid var(--sd-border)", color: "var(--sd-ink-muted)" }}
                >
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            </div>
          </motion.div>

          {/* Enrolled Courses Section */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="flex-grow mb-8 rounded-2xl p-6"
            style={{ background: "var(--sd-card-bg)", border: "1px solid var(--sd-border)", boxShadow: "0 2px 16px rgba(91,33,182,0.06)" }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-3">
              <div className="text-center sm:text-left">
                <h2
                  className="text-2xl font-semibold mb-1"
                  style={{ color: "var(--sd-ink)", fontFamily: "var(--sd-font-heading)" }}
                >
                  My Courses
                </h2>
                <p style={{ color: "var(--sd-ink-muted)" }}>
                  Pick up where you left off
                </p>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                {/* Notification bell — lives in this page's own header area,
                    not the global Navbar (out of scope).
                    `relative` here is the positioning context the dropdown
                    panel below anchors to. */}
                <div className="relative flex-shrink-0">
                  <motion.button
                    onClick={() => setNotifOpen((o) => !o)}
                    whileHover={prefersReducedMotion ? undefined : { scale: 1.06 }}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
                    transition={{ duration: 0.2 }}
                    className="group relative p-2.5 rounded-full cursor-pointer bg-[rgba(255,255,255,0.06)] border border-[var(--sd-border)] hover:bg-[rgba(140,81,240,0.14)] hover:border-[rgba(140,81,240,0.5)] hover:shadow-[0_0_16px_rgba(140,81,240,0.4)] transition-all duration-300"
                    aria-label="Notifications"
                    aria-expanded={notifOpen}
                  >
                    <Bell className="w-5 h-5 text-[var(--sd-ink-muted)] group-hover:text-[var(--sd-primary-light)] transition-colors duration-300" />
                    {unreadNotifCount > 0 && (
                      <motion.span
                        initial={prefersReducedMotion ? false : { scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ background: "var(--sd-gold)", boxShadow: "0 0 0 2px var(--sd-bg)" }}
                      >
                        {unreadNotifCount}
                      </motion.span>
                    )}
                  </motion.button>

                  <AnimatePresence>
                    {notifOpen && (
                      <>
                        <motion.div
                          key="notif-backdrop"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => setNotifOpen(false)}
                          className="fixed inset-0 z-10"
                        />
                        <motion.div
                          key="notif-panel"
                          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.96 }}
                          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl overflow-hidden text-left z-20"
                          style={{ background: "var(--sd-card-bg)", border: "1px solid var(--sd-border)", boxShadow: "0 16px 48px rgba(0,0,0,0.5)", backdropFilter: "blur(20px)" }}
                        >
                          <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--sd-border)", background: "var(--sd-surface)" }}>
                            <h3 className="text-sm font-semibold" style={{ color: "var(--sd-ink)", fontFamily: "var(--sd-font-heading)" }}>
                              Notifications
                            </h3>
                          </div>
                          <div className="max-h-72 overflow-y-auto">
                            {notifs.length === 0 && (
                              <p className="px-4 py-5 text-sm" style={{ color: "var(--sd-ink-muted)" }}>Nothing new.</p>
                            )}
                            {notifs.map((n) => (
                              <div
                                key={n.id}
                                className="flex items-start gap-3 px-4 py-3"
                                style={{ borderBottom: "1px solid var(--sd-border)" }}
                              >
                                <span
                                  className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                                  style={{ background: n.unread ? "var(--sd-gold)" : "transparent" }}
                                />
                                <div className="min-w-0">
                                  <p className="text-sm" style={{ color: "var(--sd-ink)" }}>{n.title}</p>
                                  {n.sub && <p className="text-xs mt-0.5 truncate" style={{ color: "var(--sd-ink-muted)" }}>{n.sub}</p>}
                                  <p className="text-xs mt-0.5" style={{ color: "var(--sd-ink-muted)", opacity: 0.7 }}>{n.time}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* Pattern A: solid fill recedes to a bright glowing outline on hover + zoom */}
                <motion.button
                  onClick={() => navigate("/courses")}
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.04, y: -1 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  className="px-5 py-2.5 rounded-xl cursor-pointer font-medium flex items-center gap-2 text-sm flex-shrink-0 border-[1.5px] border-[var(--sd-primary)] bg-[var(--sd-primary)] text-white shadow-[0_4px_14px_rgba(140,81,240,0.35)] hover:bg-transparent hover:text-[var(--sd-primary-light)] hover:border-[var(--sd-primary-light)] hover:shadow-[0_0_22px_rgba(140,81,240,0.55)] transition-all duration-300"
                >
                  <BookOpen className="w-4 h-4" /> Browse More
                </motion.button>
              </div>
            </div>

            {enrolledCourses.length === 0 ? (
              <div className="text-center py-16 rounded-xl" style={{ border: "1.5px dashed var(--sd-border)" }}>
                <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--sd-primary-light)" }} />
                <p className="text-lg font-semibold mb-2" style={{ color: "var(--sd-ink)" }}>
                  No courses enrolled yet
                </p>
                <p className="mb-6" style={{ color: "var(--sd-ink-muted)" }}>
                  Enrol in a course and it appears here
                </p>
                <motion.button
                  onClick={() => navigate("/courses")}
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.03, y: -1 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  className="px-6 py-3 rounded-xl cursor-pointer font-medium"
                  style={{ background: "var(--sd-primary)", color: "#fff", boxShadow: "0 4px 14px rgba(140,81,240,0.35)" }}
                >
                  Explore Courses
                </motion.button>
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
                initial={prefersReducedMotion ? false : "hidden"}
                animate="visible"
              >
                {enrolledCourses.map((course, index) => (
                  <motion.div
                    key={course._id || index}
                    variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <EnrolledCourseCard
                      course={course}
                      onGoToCourse={handleGoToCourse}
                      onCheckProgress={handleCheckProgress}
                      onShowLeaderboard={handleShowLeaderboard}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Quick Action Cards — staggered entrance, restyled via props only (GlassCard.jsx itself is shared and untouched) */}
            <motion.div
              className="mt-8 flex flex-col gap-4"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
              initial={prefersReducedMotion ? false : "hidden"}
              animate="visible"
            >
              {/* Placement Exam Card */}
              <motion.div
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                whileHover={prefersReducedMotion ? undefined : { y: -3 }}
              >
                <GlassCard glowColor="#8C51F0" intensity={0}>
                  <button
                    type="button"
                    onClick={openOrUpgrade("aiExam", () => setAiTab("exam"))}
                    className="w-full text-left flex items-center gap-5 p-5 group"
                  >
                    <div
                      className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors"
                      style={{ background: "rgba(91,33,182,0.1)" }}
                    >
                      <GraduationCap className="w-6 h-6" style={{ color: "var(--sd-primary)" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold" style={{ color: "var(--sd-ink)", fontFamily: "var(--sd-font-heading)" }}>Placement Exam</p>
                      <p className="text-sm mt-0.5" style={{ color: "var(--sd-ink-muted)" }}>
                        Test your level with our AI-powered CEFR placement exam
                      </p>
                    </div>
                    <span className="flex-shrink-0 text-xs px-2 py-1 rounded-full" style={{ border: "1px solid var(--sd-border)", color: "var(--sd-ink-muted)" }}>{LOCK_NOTE}</span>
                  </button>
                </GlassCard>
              </motion.div>

              {/* Study Materials Card */}
              <motion.div
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                whileHover={prefersReducedMotion ? undefined : { y: -3 }}
              >
                <GlassCard glowColor="#B392F5" intensity={0}>
                  <div
                    onClick={openOrUpgrade("aiCourse", () => setAiTab("course"))}
                    className="flex items-center gap-5 p-5 cursor-pointer group"
                  >
                    <div
                      className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors"
                      style={{ background: "rgba(140,81,240,0.12)" }}
                    >
                      <BookOpenText className="w-6 h-6" style={{ color: "var(--sd-primary-light)" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold" style={{ color: "var(--sd-ink)", fontFamily: "var(--sd-font-heading)" }}>Study Materials</p>
                      <p className="text-sm mt-0.5" style={{ color: "var(--sd-ink-muted)" }}>
                        Build a study plan around your goal
                      </p>
                    </div>
                    <span className="flex-shrink-0 text-xs px-2 py-1 rounded-full" style={{ border: "1px solid var(--sd-border)", color: "var(--sd-ink-muted)" }}>{LOCK_NOTE}</span>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Oral Practice Card */}
              <motion.div
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                whileHover={prefersReducedMotion ? undefined : { y: -3 }}
              >
                <GlassCard glowColor="#C9A227" intensity={0}>
                  <div
                    onClick={openOrUpgrade("speechLab", () => setSpeechOpen(true))}
                    className="flex items-center gap-5 p-5 cursor-pointer group"
                  >
                    <div
                      className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors"
                      style={{ background: "rgba(201,162,39,0.14)" }}
                    >
                      <Mic className="w-6 h-6" style={{ color: "#8a6a12" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold" style={{ color: "var(--sd-ink)", fontFamily: "var(--sd-font-heading)" }}>Oral Practice</p>
                      <p className="text-sm mt-0.5" style={{ color: "var(--sd-ink-muted)" }}>
                        Record speech, get instant confidence and pronunciation feedback
                      </p>
                    </div>
                    <span className="text-lg flex-shrink-0 group-hover:translate-x-1 transition-transform" style={{ color: "#8a6a12" }}>&rarr;</span>
                  </div>
                </GlassCard>
              </motion.div>
            </motion.div>

            {/* Quiz progress */}
            <div className="mt-8">
              <h2
                className="text-xl font-semibold mb-4 flex items-center gap-2"
                style={{ color: "var(--sd-ink)", fontFamily: "var(--sd-font-heading)" }}
              >
                <ChartLine className="w-5 h-5" style={{ color: "var(--sd-primary)" }} /> Quiz progress
              </h2>

              {quizProgressLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div
                    className="animate-spin rounded-full h-8 w-8"
                    style={{ border: "2.5px solid rgba(91,33,182,0.15)", borderBottomColor: "var(--sd-primary)" }}
                  />
                </div>
              ) : quizProgress && quizProgress.totalAttempts > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Overall Score */}
                  <div className="rounded-xl p-5 flex flex-col gap-2" style={{ border: "1px solid var(--sd-border)" }}>
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--sd-ink-muted)" }}>
                      Overall Average
                    </p>
                    <p className="text-3xl font-semibold" style={{ color: "var(--sd-primary-light)", fontFamily: "var(--sd-font-heading)" }}>
                      <CountUp value={quizProgress.overallAverageScore} suffix="%" />
                    </p>
                    <p className="text-sm" style={{ color: "var(--sd-ink-muted)" }}>
                      {quizProgress.totalAttempts} attempts
                    </p>
                  </div>

                  {/* CEFR Level */}
                  {quizProgress.latestCefrEstimate && (
                    <div className="rounded-xl p-5 flex flex-col gap-2" style={{ border: "1px solid var(--sd-border)" }}>
                      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--sd-ink-muted)" }}>
                        CEFR Level
                      </p>
                      <p className="text-3xl font-semibold" style={{ color: "var(--sd-primary)", fontFamily: "var(--sd-font-heading)" }}>
                        {quizProgress.latestCefrEstimate}
                      </p>
                      <p className="text-sm" style={{ color: "var(--sd-ink-muted)" }}>
                        Latest estimate
                      </p>
                    </div>
                  )}

                  {/* Score by Difficulty */}
                  <div className="rounded-xl p-5 flex flex-col gap-3" style={{ border: "1px solid var(--sd-border)" }}>
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--sd-ink-muted)" }}>
                      By Difficulty
                    </p>
                    {["easy", "medium", "hard"].map((d) => (
                      <div
                        key={d}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm capitalize" style={{ color: "var(--sd-ink-muted)" }}>
                          {d}
                        </span>
                        <span className="text-sm font-semibold" style={{ color: "var(--sd-primary)" }}>
                          {quizProgress.averageScoreByDifficulty[d] !== null
                            ? `${quizProgress.averageScoreByDifficulty[d]}%`
                            : "-"}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Struggle Topics */}
                  {quizProgress.struggleTopics?.length > 0 && (
                    <div className="rounded-xl p-5 flex flex-col gap-3 md:col-span-2 lg:col-span-1" style={{ border: "1px solid var(--sd-border)" }}>
                      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--sd-ink-muted)" }}>
                        Areas to Improve
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {quizProgress.struggleTopics.slice(0, 5).map((t, i) => (
                          <span
                            key={i}
                            className="text-xs font-medium px-3 py-1 rounded-full capitalize"
                            style={{ background: "rgba(159,29,29,0.06)", color: "#9f1d1d", border: "1px solid rgba(159,29,29,0.15)" }}
                          >
                            {t.topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Strength Topics */}
                  {quizProgress.strengthTopics?.length > 0 && (
                    <div className="rounded-xl p-5 flex flex-col gap-3 md:col-span-2 lg:col-span-1" style={{ border: "1px solid var(--sd-border)" }}>
                      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--sd-ink-muted)" }}>
                        Strengths
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {quizProgress.strengthTopics.slice(0, 5).map((t, i) => (
                          <span
                            key={i}
                            className="text-xs font-medium px-3 py-1 rounded-full capitalize"
                            style={{ background: "rgba(201,162,39,0.12)", color: "#8a6a12", border: "1px solid rgba(201,162,39,0.25)" }}
                          >
                            {t.topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl p-8 text-center" style={{ border: "1px solid var(--sd-border)" }}>
                  <ChartLine className="w-9 h-9 mx-auto mb-3" style={{ color: "var(--sd-ink-muted)" }} />
                  <p style={{ color: "var(--sd-ink-muted)" }}>
                    No quiz attempts yet. Take a quiz in any course to see your
                    progress here.
                  </p>
                </div>
              )}
            </div>

            {/* Daily Flashcard Review */}
            <div className="mt-8 rounded-xl p-6" style={{ border: "1px solid var(--sd-border)" }}>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: "var(--sd-ink)", fontFamily: "var(--sd-font-heading)" }}>
                  <Repeat2 className="w-5 h-5" style={{ color: "var(--sd-gold)" }} /> Daily Flashcard Review
                </h2>
                {reviewDue > 0 && (
                  <span
                    className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ background: "rgba(201,162,39,0.14)", color: "#8a6a12", border: "1px solid rgba(201,162,39,0.3)" }}
                  >
                    {reviewDue} card{reviewDue !== 1 ? "s" : ""} due
                  </span>
                )}
              </div>

              {reviewLoading ? (
                <div className="flex items-center gap-2 py-1">
                  <div
                    className="w-4 h-4 rounded-full animate-spin"
                    style={{ border: "2px solid rgba(91,33,182,0.15)", borderTopColor: "var(--sd-primary)" }}
                  />
                  <p className="text-sm" style={{ color: "var(--sd-ink-muted)" }}>Checking cards...</p>
                </div>
              ) : reviewDue > 0 ? (
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <p className="text-sm" style={{ color: "var(--sd-ink-muted)" }}>
                    You have{" "}
                    <span className="font-semibold" style={{ color: "var(--sd-ink)" }}>{reviewDue}</span>{" "}
                    card{reviewDue !== 1 ? "s" : ""} due for review today.
                  </p>
                  <motion.button
                    type="button"
                    onClick={() => setReviewOpen(true)}
                    disabled={!topDeckId}
                    whileHover={prefersReducedMotion || !topDeckId ? undefined : { scale: 1.03 }}
                    whileTap={prefersReducedMotion || !topDeckId ? undefined : { scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                    style={{ background: "var(--sd-primary)", color: "#fff", boxShadow: "0 4px 14px rgba(140,81,240,0.35)" }}
                  >
                    Start Review
                  </motion.button>
                </div>
              ) : (
                <p className="text-sm font-medium flex items-center gap-1.5" style={{ color: "var(--sd-gold)" }}>
                  <Check className="w-4 h-4" /> All caught up for today
                </p>
              )}
            </div>

        <ProgressReport
          studentId={JSON.parse(localStorage.getItem("user"))?._id}
          courseId={enrolledCourses?.[0]?.course?._id || null}
          studentName={studentData?.name || "Student"}
          proficiencyLevel={studentData?.proficiencyLevel || "B1"}
          locked={locked("aiReport")}
        />

        <div className="rounded-xl p-6 mt-4" style={{ border: "1px solid var(--sd-border)" }}>
              <GrowthDashboard />
            </div>

            <UpgradeBanner
              title="More of Exzellent, when you are ready"
              lines={[
                "AI placement exams",
                "AI study plans",
                "Written progress reports",
                "1-to-1 lessons with a tutor",
              ]}
            />
          </motion.div>
        </div>
      </section>

      {/* My Sessions Section */}
      <section className="py-8">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8 rounded-2xl p-6"
            style={{ background: "var(--sd-card-bg)", border: "1px solid var(--sd-border)", boxShadow: "0 2px 16px rgba(91,33,182,0.06)" }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
              <div className="text-center sm:text-left mb-4 sm:mb-0">
                <h2 className="text-2xl font-semibold mb-1" style={{ color: "var(--sd-ink)", fontFamily: "var(--sd-font-heading)" }}>My Sessions</h2>
                <p style={{ color: "var(--sd-ink-muted)" }}>Your upcoming and past 1-on-1 sessions</p>
              </div>
            </div>
            <MyBookings />
          </motion.div>
        </div>
      </section>

      <Leaderboard
        isOpen={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        leaderboard={leaderboardData}
        loading={leaderboardLoading}
        courseTitle={selectedCourse?.course?.title || selectedCourse?.title}
      />

      <ProgressModal
        isOpen={progressModalOpen}
        onClose={() => setProgressModalOpen(false)}
        course={selectedCourse}
        progress={progressData}
        loading={progressLoading}
      />

      {/* Floating "Aria" AI assistant — shared component, also used on the
          Course Details page, so both stay visually/behaviorally in sync
          instead of maintaining two copies. */}
      {aiTab && <AiToolsHub role="student" initialTab={aiTab} onClose={() => setAiTab(null)} />}
      {speechOpen && <StudentSpeechLab onClose={() => setSpeechOpen(false)} student={studentData} />}

      <AriaChatWidget />

      {reviewOpen && topDeckId && (
        <SpacedRepetitionSession
          deckId={topDeckId}
          onClose={() => setReviewOpen(false)}
        />
      )}
    </div>
  );
};

export default StudentDashboard;
