import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import CourseList from "../components/CourseComponent/CourseList";
import CourseCard from "../components/CourseComponent/CourseCard";
import Loader from "../components/Loader";
import axios from "../utils/axios";
import { fetchEnrolledCourses, fetchStudentProfile } from "../APIs/StudentApi/StudentDetails";
import Swal from "sweetalert2";
import { ArrowRight } from "lucide-react";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [groupedCourses, setGroupedCourses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [languageFilter, setLanguageFilter] = useState([]);
  const [levelFilter, setLevelFilter] = useState("");
  const [languages, setLanguages] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [comingSoonPage, setComingSoonPage] = useState(1);
  const [comingSoonCourses, setComingSoonCourses] = useState([]);
  const [filteredComingSoonCourses, setFilteredComingSoonCourses] = useState([]);
  const [comingSoonLoading, setComingSoonLoading] = useState(false);
  const [comingSoonTotal, setComingSoonTotal] = useState(0);
  const [activeTab] = useState("allCourses");
  const [, setMyCourses] = useState([]);
  const [, setMyCoursesLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [studentCredits, setStudentCredits] = useState(null);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [enrollmentMap, setEnrollmentMap] = useState({});

  const navigate = useNavigate();
  const PAGE_SIZE = 20;
  const COMING_SOON_PAGE_SIZE = 20;

  const checkAuthAndPaidStatus = useCallback(async () => {
    const userStr = localStorage.getItem("user");
    const token = document.cookie.includes("token=");
    const loggedIn = Boolean(userStr) && token;
    setIsLoggedIn(loggedIn);

    if (loggedIn) {
      try {
        const user = JSON.parse(userStr);
        const userId = user._id;
        const studentData = await fetchStudentProfile(userId);
        setIsPaid((studentData.credits ?? 0) >= 50);
        setStudentCredits(studentData.credits ?? 0);

        // Fetch enrolled courses
        const enrolled = await fetchEnrolledCourses();
        setEnrolledCourseIds(enrolled.map(e => e.course?._id || e.courseId || e.course));

        // Build a courseId -> enrollmentId map so already-enrolled cards can
        // thread the correct enrollmentId (keeps progress + certificate).
        const map = {};
        enrolled.forEach((e) => {
          const courseId = e.course?._id || e.courseId || e.course;
          const enrollmentId = e._id || e.enrollmentId;
          if (courseId && enrollmentId) map[courseId.toString()] = enrollmentId;
        });
        setEnrollmentMap(map);
      } catch (err) {
        console.error("Error fetching student profile:", err);
        setIsPaid(false);
      }
    } else {
      setIsPaid(false);
    }
  }, []);

  useEffect(() => {
    checkAuthAndPaidStatus();
    fetchCourses(0);
    fetchComingSoonCourses(1);
  }, [checkAuthAndPaidStatus]);

  useEffect(() => {
    if (isLoggedIn && isPaid && activeTab === "myCourses") {
      const getMyCourses = async () => {
        setMyCoursesLoading(true);
        try {
          const enrolled = await fetchEnrolledCourses();
          const detailedCourses = await Promise.all(
            enrolled.map(async (enrollment) => {
              const courseDetails = await axios.get(
                `/api/courses/${enrollment.course._id}`
              );
              return {
                ...enrollment,
                course: courseDetails.data,
              };
            })
          );
          setMyCourses(detailedCourses);
        } catch (err) {
          console.error("Error fetching my courses:", err);
          Swal.fire({
            icon: "error",
            title: "Error",
            theme: 'dark',
            text: err.message || "Failed to fetch your enrolled courses.",
          });
          setMyCourses([]);
        } finally {
          setMyCoursesLoading(false);
        }
      };
      getMyCourses();
    }
  }, [activeTab, isLoggedIn, isPaid]);

  useEffect(() => {
    let currentCourses = [...courses];

    if (searchTerm) {
      currentCourses = currentCourses.filter((course) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (languageFilter.length > 0) {
      currentCourses = currentCourses.filter((course) =>
        languageFilter.includes(course.language)
      );
    }

    if (levelFilter) {
      currentCourses = currentCourses.filter(
        (course) => course.level === levelFilter
      );
    }

    setFilteredCourses(currentCourses);

    const grouped = currentCourses.reduce((acc, course) => {
      if (!course) return acc;
      const language = (course.language || "Other").trim();
      if (!acc[language]) acc[language] = [];
      acc[language].push(course);
      return acc;
    }, {});
    setGroupedCourses(grouped);

    let currentComingSoonCourses = [...comingSoonCourses];

    if (searchTerm) {
      currentComingSoonCourses = currentComingSoonCourses.filter((course) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (languageFilter.length > 0) {
      currentComingSoonCourses = currentComingSoonCourses.filter((course) =>
        languageFilter.includes(course.language)
      );
    }

    if (levelFilter) {
      currentComingSoonCourses = currentComingSoonCourses.filter(
        (course) => course.level === levelFilter
      );
    }

    setFilteredComingSoonCourses(currentComingSoonCourses);
  }, [searchTerm, languageFilter, levelFilter, courses, comingSoonCourses]);

  const fetchCourses = async (pageNumber) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/courses?skip=${pageNumber * PAGE_SIZE}&limit=${PAGE_SIZE}`
      );
      const batch = Array.isArray(response.data) ? response.data : [];

      setCourses((prev) => {
        const existingIds = new Set(prev.map((c) => c._id));
        const newCourses = batch.filter((c) => !existingIds.has(c._id));
        return [...prev, ...newCourses];
      });

      if (batch.length < PAGE_SIZE) setHasMore(false);

      const allLanguages = batch.map((course) => course.language);
      setLanguages((prev) => Array.from(new Set([...prev, ...allLanguages])));
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError(err.response?.data?.message || "Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  const loadMoreCourses = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchCourses(nextPage);
  };

  const fetchComingSoonCourses = async (pageNumber) => {
    try {
      setComingSoonLoading(true);
      const response = await axios.get(
        `/api/courses/coming-soon?page=${pageNumber}&limit=${COMING_SOON_PAGE_SIZE}`
      );

      if (response.data && response.data.courses) {
        setComingSoonCourses(response.data.courses);
        setComingSoonTotal(response.data.total || 0);
      } else {
        const allCourses = await axios.get(`/api/courses?skip=0&limit=1000`);
        const comingSoon = allCourses.data.filter(
          (course) => !["German", "Spanish"].includes(course.language)
        );
        const startIndex = (pageNumber - 1) * COMING_SOON_PAGE_SIZE;
        const paginatedCourses = comingSoon.slice(
          startIndex,
          startIndex + COMING_SOON_PAGE_SIZE
        );
        setComingSoonCourses(paginatedCourses);
        setComingSoonTotal(comingSoon.length);
      }
    } catch (err) {
      console.error("Error fetching coming soon courses:", err);
      try {
        const allCourses = await axios.get(`/api/courses?skip=0&limit=1000`);
        const comingSoon = allCourses.data.filter(
          (course) => !["German", "Spanish"].includes(course.language)
        );
        const startIndex = (pageNumber - 1) * COMING_SOON_PAGE_SIZE;
        const paginatedCourses = comingSoon.slice(
          startIndex,
          startIndex + COMING_SOON_PAGE_SIZE
        );
        setComingSoonCourses(paginatedCourses);
        setComingSoonTotal(comingSoon.length);
      } catch (fallbackErr) {
        console.error("Fallback error:", fallbackErr);
      }
    } finally {
      setComingSoonLoading(false);
    }
  };

  const handleComingSoonPageChange = (newPage) => {
    setComingSoonPage(newPage);
    fetchComingSoonCourses(newPage);
  };

  if (error)
    return (
      <div className="min-h-screen py-40 bg-bg bg-[linear-gradient(to_right,#6185b815_1px,transparent_1px),linear-gradient(to_bottom,#6185b815_1px,transparent_1px)] bg-[size:40px_40px]  flex flex-col items-center text-center text-red-500">
        Error: {error}
      </div>
    );

  return (
    <>
      <div className="relative z-1 mx-auto px-6 sm:px-8 lg:px-10 pt-28 pb-5 text-center space-y-6 bg-bg2 border-b border-border/30">
        <h1 className="text-3xl md:text-6xl font-bold text-white">Language <span className="text-primary">Courses.</span></h1>
        <p className="text-white font-bold text-lg sm:text-xl">Explore our wide range of courses and find the perfect one for you!</p>

       {/* Credits Badge */}
        {isLoggedIn && studentCredits !== null && (
          <div className="flex items-center flex-col sm:flex-row justify-center gap-1 sm:gap-4 text-white px-8 text-lg font-semibold">
            You have <span className="text-tertiary">{studentCredits}</span> credits
            <button onClick={() => navigate("/offer")}
              className="bg-gradient-to-r from-blue-800 to-primary  text-white text-sm font-semibold px-5 py-2 rounded-xl transition-all duration-500 hover:scale-105 cursor-pointer">
              + Get More Credits
            </button>
          </div>
        )}
      </div>

      <div
        onClick={() => navigate("/webinars")}
        className="ml-auto max-w-xl relative z-1 p-5 cursor-pointer flex justify-end items-center transition-all duration-500 hover:scale-98 hover:translate-x-3 text-2xl lg:text-5xl font-bold"
      >
        <p className="text-white">
          Language <span className="text-primary">Webinars</span>
        </p>
        <ArrowRight className="text-primary" />
      </div>

      <CourseList
        courses={filteredCourses}
        groupedCourses={groupedCourses}
        onSearch={setSearchTerm}
        onLanguageFilter={setLanguageFilter}
        onLevelFilter={setLevelFilter}
        languages={languages}
        loading={loading}
        selectedLanguages={languageFilter}
        selectedLevel={levelFilter}
        hasMore={hasMore}
        onLoadMore={loadMoreCourses}
        comingSoonCourses={filteredComingSoonCourses}
        comingSoonLoading={comingSoonLoading}
        comingSoonPage={comingSoonPage}
        comingSoonTotal={comingSoonTotal}
        comingSoonPageSize={COMING_SOON_PAGE_SIZE}
        onComingSoonPageChange={handleComingSoonPageChange}
        isPaid={isPaid}
        studentCredits={studentCredits}
        enrolledCourseIds={enrolledCourseIds}
        enrollmentMap={enrollmentMap}
      />
    </>
  );
};

export default Courses;