import Navigation from "./components/Navbar";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback} from "react";
import Login from "./pages/Login&Signup/Login";
import Signup from "./pages/Login&Signup/Signup";
import Payment from "./pages/Payment/Payment";
import ProtectedRouter from "./components/ProtectedRouter";
import StudentDashboard from "./pages/StudentDashboard";
import GetStudent from "./pages/Admin/GetStudent";
import Referrals from "./pages/Admin/Referrals";
import Courses from "./pages/Courses";
import AddJobs from "./pages/Admin/AddJobs";
import JobApplicants from "./pages/Admin/JobApplicants";
import AddTeachers from "./pages/Admin/AddTeachers";
import Teachers from "./pages/Admin/Teachers";
import TeacherDetail from "./pages/Admin/TeacherDetail";
import AdminCourses from "./pages/Admin/AdminCourses";
import Webinars from "./pages/Webinars";
import AddWebinar from "./pages/Admin/AddWebinar";
import WebinarParticipants from "./components/WebinarComponents/WebinarParticipants";
import ForgotPassword from "./pages/Login&Signup/ForgotPassword";
import Footer from "./components/Footer";
import NotFound from "./pages/Errors/NotFound";
import axios from "./utils/axios";
import applyPageMeta from "./utils/pageMeta";
import PaymentSuccess from "./pages/Payment/PaymentSuccess";
import PaymentFailure from "./pages/Payment/PaymentFailure";
import TermsAndConditions from "./pages/Legal/t&c";
import Privacy from "./pages/Legal/Privacy";
import DataPolicy from "./pages/Legal/DataPolicy";
import Impressum from "./pages/Legal/Impressum";
import CourseWrapper from "./components/CourseComponent/CourseWrapper";
import Careers from "./pages/Careers";
import CareerApplication from "./pages/CareerApplication";
import JobDetail from "./components/CareerComponents/JobDetail";
import QuestionAnswers from "./pages/QuestionAnswers";
import TeacherDashboard from "./pages/TeacherDashboard";
import CalendarPage from "./pages/CalendarPage";
import TeacherTC from "./pages/Legal/TeacherTC";
import TeacherForm from "./pages/Login&Signup/TeacherForm";
import WebinarDetails from "./pages/WebinarDetails";
import ObjectDetection from './pages/ObjectDetection';
import Contact from "./pages/Contact";
import ComingSoon from "./pages/Errors/ComingSoon";
import CookieBanner from "./components/CookieBanner";
import Offer from "./pages/Payment/Offer";
import Waitlist from "./pages/Waitlist";
import Community from "./pages/Community";
import BookClass from "./pages/BookClass";
import Affiliates from "./pages/Affiliates";
import Ambassadors from "./pages/Ambassadors";
import PartnerDashboard from "./pages/PartnerDashboard";
import WaitlistAdmin from "./pages/Admin/WaitlistAdmin";
import ClassRoom from "./pages/ClassRoom";
import MergedDashboard from "./pages/Lab/MergedDashboard"; // LOCAL PROTOTYPE
import Console from "./pages/Console/Console";

const App = () => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTeachersPageLoading, setTeachersPageLoading] = useState(true);
  const [isCoursesPageLoading, setCoursesPageLoading] = useState(true);
  const [isCareersPageLoading, setCareersPageLoading] = useState(true);
  const location = useLocation();
  const appContainerRef = useRef(null);

  useEffect(() => {
    if (appContainerRef.current) appContainerRef.current.scrollTo({top: 0, behavior: "smooth"});
    window.scrollTo({top: 0, behavior: "smooth"});
    // Every route is served the same index.html, so without this each page
    // would share one title and description and the search sitelinks all show
    // the same snippet.
    applyPageMeta(location.pathname);
  }, [location.pathname]);

  const getToken = () => {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
  };

  // useCallback so child components like Login can call it without recreating
  const checkAuth = useCallback(async () => {
    setLoading(true);
    const token = getToken();

    if (!token) {
      setUserRole(null);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get("/api/users/profile");
      setUserRole(response.data.data?.userType || null);
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          const refreshResponse = await axios.post("/api/users/refresh-token");
          if (refreshResponse.data.success) {
            const newResponse = await axios.get("/api/users/profile");
            setUserRole(newResponse.data.data?.userType || null);
          } else {
            setUserRole(null);
            document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          }
        } catch {
          setUserRole(null);
          document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }
      } else {
        setUserRole(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Run once on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Re-check auth if a token exists but no role was resolved. Bounded: if the
  // profile call keeps returning without a userType, this effect's own result
  // re-triggers it, and an unbounded version spins the app and hammers the
  // backend for as long as the tab is open.
  const recheckedRef = useRef(0);
  useEffect(() => {
    const tokenExists = getToken();
    if (tokenExists && userRole === null && !loading && recheckedRef.current < 2) {
      recheckedRef.current += 1;
      checkAuth();
    }
    if (userRole) recheckedRef.current = 0;
  }, [location.pathname, userRole, loading, checkAuth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const HomeRedirect = () => {
    if (userRole === "Student") return <Navigate to="/student-dashboard" replace />;
    if (userRole === "Admin") return <Navigate to="/admin-dashboard" replace />;
    if (userRole === "Teacher") return <Navigate to="/teacher-dashboard" replace />;
    window.location.replace("/exzellent-index.html");
    return null;
  };

  return (
    <div className="app-container" ref={appContainerRef} style={{ overflowY: "auto", overflowX: "hidden" }}>
      {!["/login", "/signup", "/forgot-password", "/waitlist", "/student-dashboard", "/teacher-dashboard", "/admin-dashboard", "/calendar", "/lab/dashboard"].includes(location.pathname) && <Navigation userRole={userRole} />}
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login checkAuth={checkAuth} />} />
        <Route path="/signup" element={<Signup checkAuth={checkAuth} />} />
        <Route path="/waitlist" element={<Waitlist />} />
        <Route path="/community" element={<Community />} />
        <Route path="/book" element={<BookClass />} />
        <Route path="/class/:bookingId" element={<ClassRoom />} />
        {/* LOCAL PROTOTYPE — dev builds only; see note in Lab/MergedDashboard. */}
        {import.meta.env.DEV && <Route path="/lab/dashboard" element={<MergedDashboard />} />}
        <Route path="/affiliates" element={<Affiliates />} />
        <Route path="/ambassadors" element={<Ambassadors />} />
        <Route path="/partner" element={<PartnerDashboard />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/success" element={<PaymentSuccess />} />
        <Route path="/cancel" element={<PaymentFailure />} />
        <Route path="/courses" element={<Courses isCoursesPageLoading={isCoursesPageLoading} setCoursesPageLoading={setCoursesPageLoading} />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/webinars" element={<Webinars />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/data-policy" element={<DataPolicy />} />
        <Route path="/impressum" element={<Impressum />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/careers" element={<Careers isCareersPageLoading={isCareersPageLoading} setCareersPageLoading={setCareersPageLoading} />} />
        <Route path="/careers/:jobId/apply" element={<CareerApplication />} />
        <Route path="/jobs/:jobId" element={<JobDetail />} />
        <Route path="/QuestionAnswers" element={<QuestionAnswers />} />
        <Route path="/teacher-form" element={<TeacherForm />} />
        <Route path="/teacher-tc" element={<TeacherTC />} />
        <Route path="/webinars/:id" element={<WebinarDetails />} />
        <Route path="/offer" element={<Offer />} />
        <Route path="/object-detection" element={<ObjectDetection />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/coming-soon" element={<ComingSoon />} />



        {/* Student-only protected routes */}
        <Route element={<ProtectedRouter userRole={userRole} allowedRoles={["Student"]} />}>
          <Route path="/student-dashboard" element={<Console role="student" />} />
          {/* The previous dashboard, kept reachable while the console beds in. */}
          <Route path="/student-dashboard/classic" element={<StudentDashboard />} />
          <Route path="/course/:courseNameAndLevel" element={<CourseWrapper />} />
        </Route>

        {/* Teacher-only protected routes */}
        <Route element={<ProtectedRouter userRole={userRole} allowedRoles={["Teacher"]} />}>
          <Route path="/teacher-dashboard" element={<Console role="teacher" />} />
          <Route path="/teacher-dashboard/classic" element={<TeacherDashboard />} />
          <Route path="/course/:courseNameAndLevel" element={<CourseWrapper />} />
        </Route>

        {/* Admin-only protected routes */}
        <Route element={<ProtectedRouter userRole={userRole} allowedRoles={["Admin"]} />}>
          <Route path="/admin-dashboard" element={<Console role="admin" />} />
          <Route path="/get-student" element={<GetStudent />} />
          <Route path="/add-course" element={<AdminCourses />} />
          <Route path="/add-referral" element={<Referrals />} />
          <Route path="/invite-requests" element={<WaitlistAdmin />} />
          <Route path="/add-teacher" element={<AddTeachers />} />
          <Route path="/teachers" element={<Teachers isTeachersPageLoading={isTeachersPageLoading} setTeachersPageLoading={setTeachersPageLoading} />} />
          <Route path="/teacher/:userId" element={<TeacherDetail />} />
          <Route path="/add-webinar" element={<AddWebinar />} />
          <Route path="/webinar/:id/participants" element={<WebinarParticipants />} />
          <Route path="/add-job" element={<AddJobs />} />
          <Route path="/admin/jobs/:jobId/applicants" element={<JobApplicants />} />
        </Route>

        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
      {!["/login", "/signup", "/forgot-password", "/waitlist"].includes(location.pathname) && (
        <>
          <CookieBanner />
          <Footer />
        </>
      )}
    </div>
  );
};

export default App;
