import React, { useState, useRef, useEffect } from "react";
import CourseCard from "./CourseCard";
import CourseSidebarFilter from "./CourseSidebarFilter";
import FilterPopup from "./FilterPopup";
import Pagination from "./Pagination";
import Loader from "../Loader";
import AnimatedBackground from "../AnimatedBackground";

const CourseList = ({
  groupedCourses,
  onSelect,
  onSearch,
  onLanguageFilter,
  onLevelFilter,
  languages,
  loading,
  selectedLanguages,
  selectedLevel,
  hasMore,
  onLoadMore,
  comingSoonCourses,
  comingSoonLoading,
  comingSoonPage,
  comingSoonTotal,
  comingSoonPageSize,
  onComingSoonPageChange,
  isPaid,
  enrolledCourseIds = [],
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const scrollRefs = useRef({});
  const loadMoreRef = useRef(null);
  const allLanguages = Object.keys(groupedCourses);
  const prioritizedLanguages = ["German", "Spanish"].filter((lang) =>
    allLanguages.includes(lang),
  );
  const otherLanguages = allLanguages
    .filter((lang) => !prioritizedLanguages.includes(lang))
    .sort();

  const sortedLanguages = [...prioritizedLanguages, ...otherLanguages];

  const publishedComingSoonCourses = comingSoonCourses.filter(
    (course) => course.isPublished !== false,
  );

  const groupedComingSoonCourses = publishedComingSoonCourses
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .reduce((acc, course) => {
      const language = course.language || "Other";
      if (!acc[language]) acc[language] = [];
      acc[language].push(course);
      return acc;
    }, {});
  const comingSoonLanguages = Object.keys(groupedComingSoonCourses).sort();

  const comingSoonIds = new Set(publishedComingSoonCourses.map((c) => c._id));
  const filteredGroupedCourses = Object.fromEntries(
    Object.entries(groupedCourses).map(([lang, courses]) => [
      lang,
      courses
        .filter(
          (course) => !comingSoonIds.has(course._id) && course.isPublished !== false,
        )
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
    ]),
  );

  const scrollRight = (language) => {
    if (scrollRefs.current[language]) {
      scrollRefs.current[language].scrollBy({ left: 350, behavior: "smooth" });
    }
  };
  const scrollLeft = (language) => {
    if (scrollRefs.current[language]) {
      scrollRefs.current[language].scrollBy({ left: -350, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  return (
    <>
      <AnimatedBackground />
      <div className="relative">
        {loading && sortedLanguages.length === 0 ? (
          <div className="min-h-screen bg-bg flex flex-col justify-center items-center text-center text-3xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-white">Loading Courses...</p>
          </div>
        ) : (
          <div className="max-w-full flex flex-col lg:flex-row gap-8 lg:pr-8">
            <div className="hidden lg:block pl-8 pt-8">
              <CourseSidebarFilter
                onSearch={onSearch}
                onLanguageFilter={onLanguageFilter}
                onLevelFilter={onLevelFilter}
                languages={languages}
                selectedLanguages={selectedLanguages}
                selectedLevel={selectedLevel}
              />
            </div>

            <section className="overflow-x-auto">
              <div className="lg:hidden flex justify-center my-8">
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="p-4 rounded-full bg-primary text-white"
                >
                  <svg
                    className="h-10 w-10"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                </button>
              </div>

              {isFilterOpen && (
                <FilterPopup
                  onSearch={onSearch}
                  onLanguageFilter={onLanguageFilter}
                  onLevelFilter={onLevelFilter}
                  languages={languages}
                  selectedLanguages={selectedLanguages}
                  selectedLevel={selectedLevel}
                  onClose={() => setIsFilterOpen(false)}
                />
              )}

              {!loading && sortedLanguages.length === 0 && (
                <p className="text-center text-text-secondary text-xl">
                  No courses found match your criteria.
                </p>
              )}

              {sortedLanguages.length > 0 && (
                <div>
                  {prioritizedLanguages.length > 0 &&
                    prioritizedLanguages.map((language) => (
                      <CourseGroup
                        key={language}
                        language={language}
                        courses={filteredGroupedCourses[language] || []}
                        scrollRefs={scrollRefs}
                        scrollLeft={scrollLeft}
                        scrollRight={scrollRight}
                        onSelect={onSelect}
                        isPaid={isPaid}
                        enrolledCourseIds={enrolledCourseIds}
                      />
                    ))}

                  {otherLanguages.length > 0 &&
                    otherLanguages.map((language) => (
                      <CourseGroup
                        key={language}
                        language={language}
                        courses={filteredGroupedCourses[language] || []}
                        scrollRefs={scrollRefs}
                        scrollLeft={scrollLeft}
                        scrollRight={scrollRight}
                        onSelect={onSelect}
                        isPaid={isPaid}
                        enrolledCourseIds={enrolledCourseIds}
                      />
                    ))}

                  {(publishedComingSoonCourses.length > 0 ||
                    comingSoonLoading) && (
                    <div>
                      <p className="text-6xl font-bold text-primary text-center my-4">
                        Coming Soon
                      </p>

                      {comingSoonLoading ? (
                        <div className="flex justify-center items-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B4A73]" />
                        </div>
                      ) : publishedComingSoonCourses.length > 0 ? (
                        <>
                          {comingSoonLanguages.map((language) => (
                            <CourseGroup
                              key={`coming-soon-${language}`}
                              language={language}
                              courses={groupedComingSoonCourses[language]}
                              scrollRefs={scrollRefs}
                              scrollLeft={scrollLeft}
                              scrollRight={scrollRight}
                              onSelect={onSelect}
                              isPaid={isPaid}
                              enrolledCourseIds={enrolledCourseIds}
                            />
                          ))}

                          <Pagination
                            currentPage={comingSoonPage}
                            totalPages={Math.ceil(
                              comingSoonTotal / comingSoonPageSize,
                            )}
                            onPageChange={onComingSoonPageChange}
                            totalItems={comingSoonTotal}
                            itemsPerPage={comingSoonPageSize}
                            className="mt-8"
                          />
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-text-secondary">
                            No coming soon courses available.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div ref={loadMoreRef} className="h-1"></div>
            </section>
          </div>
        )}
      </div>
    </>
  );
};

const CourseGroup = ({
  language,
  courses,
  scrollRefs,
  scrollLeft,
  scrollRight,
  onSelect,
  isPaid,
  enrolledCourseIds = [],
}) => {
  if (!courses || courses.length === 0) return null;

  return (
    <>
      <div className="flex items-center justify-between mb-4 mt-4 lg:pr-8 sm:mx-8">
        <div className="flex items-center gap-3 ml-0">
          <div className="w-1 h-8 rounded-full bg-primary shadow-[0_0_10px_rgba(142,123,252,0.5)] flex-shrink-0" />
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-text-secondary uppercase">Language</span>
            <p className="text-2xl font-bold text-white leading-none" >{language}</p>
          </div>
        </div>

        {courses.length > 1 && (
          <div className="sticky z-10 space-x-4">
            <button onClick={() => scrollLeft(language)}
              className="p-1 bg-bg2/50 transition-all duration-700 rounded-md cursor-pointer" >
              <svg className="h-10 w-10 hover:h-12 hover:w-12 text-white hover:text-tertiary transition-all duration-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
            </button>

            <button onClick={() => scrollRight(language)} className="p-1 bg-bg2/50 transition-all duration-700 rounded-md cursor-pointer">
              <svg className="h-10 w-10 hover:h-12 hover:w-12 text-white hover:text-tertiary transition-all duration-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        )}
      </div>

      <div ref={(el) => (scrollRefs.current[language] = el)} className="flex gap-8 m-8 pb-4 ">
        {courses.map((course) => (
          <div key={course._id} className="flex-none">
            <CourseCard course={course} onSelect={onSelect} isPaid={isPaid} isEnrolled={enrolledCourseIds.some((id) => id?.toString() === course._id?.toString(),)} />
          </div>
        ))}
      </div>
    </>
  );
};

export default CourseList;
