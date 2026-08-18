import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Play,
  ChevronRight,
  PlayCircle,
  Video,
  FileText,
  Globe,
  ExternalLink,
  Paperclip,
  Calendar,
  Lock,
} from "lucide-react";
import axios from "../../utils/axios";
import StudyKitView from "../AiTools/StudyKitView";
import { getCertificate } from "../../APIs/learning";

const getTotalDuration = (sections) => {
  let totalSeconds = 0;
  sections?.forEach((section) => {
    section.lectures?.forEach((lecture) => {
      if (lecture.duration) {
        const parts = lecture.duration.split(":").map(Number);
        if (parts.length === 2) totalSeconds += parts[0] * 60 + parts[1];
        if (parts.length === 3) totalSeconds += parts[0] * 3600 + parts[1] * 60 + parts[2];
      }
    });
  });
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
};

const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  let videoId = null;
  if (url.includes("youtube.com/watch?v=")) {
    videoId = url.split("v=")[1]?.split("&")[0];
  } else if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1]?.split("?")[0];
  } else if (url.includes("youtube.com/embed/")) {
    return url.trim();
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};

const CourseDetails = ({ course, onBack }) => {
  const location = useLocation();
  const { enrollmentId } = location.state || {};
  const [expandedSections, setExpandedSections] = useState(new Set([0]));
  const [coverError, setCoverError] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [checkedLectures, setCheckedLectures] = useState({});
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [certificate, setCertificate] = useState(null);
  const [certOpen, setCertOpen] = useState(false);
  const [certLoading, setCertLoading] = useState(false);
  const [certError, setCertError] = useState("");
  const navigate = useNavigate();
  const now = new Date();

  const visibleSections = course.sections || [];
  const totalVideos = visibleSections.reduce((t, s) => t + (s.lectures?.length || 0), 0);
  const completedCount = Object.values(checkedLectures).filter(Boolean).length;
  const allComplete = totalVideos > 0 && completedCount === totalVideos;
  const totalSections = visibleSections.length;
  const totalDuration = getTotalDuration(visibleSections);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!enrollmentId) {
        setLoadingProgress(false);
        return;
      }
      try {
        const res = await axios.get(`/api/enrollments/${enrollmentId}`);
        const progressArr = res.data?.enrollment?.progress || [];
        const checked = {};
        course.sections?.forEach((section, sIdx) => {
          section.lectures?.forEach((lecture, lIdx) => {
            const completed = progressArr.some(
              (p) =>
                p.sectionId?.toString() === section._id?.toString() &&
                p.lectureId?.toString() === lecture._id?.toString()
            );
            checked[`${sIdx}-${lIdx}`] = completed;
          });
        });
        setCheckedLectures(checked);
      } catch (err) {
        console.error("Failed to fetch progress", err);
      } finally {
        setLoadingProgress(false);
      }
    };
    fetchProgress();
  }, [enrollmentId]);

  const handleLectureClick = (sectionIndex, lectureIndex, lecture) => {
    setActiveVideo(`${sectionIndex}-${lectureIndex}`);
    setSelectedLecture({ ...lecture, sectionIndex, lectureIndex });
  };

  const handleLectureCheckbox = async (sectionIndex, lectureIndex) => {
    const sectionObj = visibleSections?.[sectionIndex];
    const lectureObj = sectionObj?.lectures?.[lectureIndex];
    const checked = !checkedLectures[`${sectionIndex}-${lectureIndex}`];

    setCheckedLectures((prev) => ({
      ...prev,
      [`${sectionIndex}-${lectureIndex}`]: checked,
    }));

    if (!enrollmentId || !lectureObj?._id) return;

    try {
      const token = localStorage.getItem("token");
      if (checked) {
        await axios.post(
          `/api/enrollments/${enrollmentId}/complete-lecture`,
          { sectionId: sectionObj._id, lectureId: lectureObj._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `/api/enrollments/${enrollmentId}/uncomplete-lecture`,
          { lectureId: lectureObj._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (err) {
      console.error("Error updating lecture progress", err);
    }
  };

  const toggleSection = (sectionIndex) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionIndex)) next.delete(sectionIndex);
      else next.add(sectionIndex);
      return next;
    });
  };

  const getSectionDuration = (section) => {
    let totalSeconds = 0;
    section.lectures?.forEach((lecture) => {
      if (lecture.duration) {
        const parts = lecture.duration.split(":").map(Number);
        if (parts.length === 2) totalSeconds += parts[0] * 60 + parts[1];
        if (parts.length === 3) totalSeconds += parts[0] * 3600 + parts[1] * 60 + parts[2];
      }
    });
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const handleGetCertificate = async () => {
    if (!enrollmentId || certLoading) return;
    setCertLoading(true);
    setCertError("");
    try {
      const res = await getCertificate(enrollmentId);
      if (res?.eligible && res?.certificate) {
        setCertificate(res.certificate);
        setCertOpen(true);
      } else {
        setCertError("You are not eligible for a certificate yet.");
      }
    } catch (err) {
      setCertError(err.message || "Could not load your certificate.");
    } finally {
      setCertLoading(false);
    }
  };

  const formatCertDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  };

  if (loadingProgress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white">Loading your course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex md:flex-row flex-col justify-between items-between pt-28 pb-6 px-12">
        <div className="flex flex-col gap-3 justify-center items-center">
          <button onClick={() => (onBack ? onBack() : navigate("/"))}
            className="gap-1 transition-all duration-700 hover:scale-98 flex items-center bg-gradient-to-r from-blue-800 to-primary text-white p-3 rounded-xl cursor-pointer">
            <ArrowLeft /> {onBack ? "Back to Courses" : "Back to Dashboard"}
          </button>

          <div className="flex flex-wrap items-center justify-center text-white gap-3">
            {course.category && (
              <div className="bg-bg2 p-3 rounded-xl">
                <span className="font-medium">{course.category}</span>
              </div>
            )}
            <div className="bg-bg2 p-3 rounded-xl">
              <span className="font-medium">{course.level}</span>
            </div>
            <div className="flex items-center gap-2 bg-bg2 p-3 rounded-xl">
              <Globe /><span className="font-medium">{course.language}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-5 text-white text-sm justify-center">
            <div className="flex items-center gap-2 bg-bg2 p-3 rounded-xl">
              <Clock /><span className="font-medium">{totalDuration} total</span>
            </div>
            <div className="flex items-center gap-2 bg-bg2 p-3 rounded-xl">
              <Video /><span className="font-medium">{totalVideos} lessons</span>
            </div>
          </div>
        </div>

        <div className="gap-4 grow flex flex-col items-center mt-10 sm:mt-0">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl text-primary font-bold">{course.title}</h1>
          {course.subtitle && (
            <p className=" lg:text-lg text-white font-medium">{course.subtitle}</p>
          )}

          {/* Cover image */}
          <div className="w-full max-w-xl h-48 sm:h-56 rounded-xl overflow-hidden border border-border mt-4">
            {course.thumbnail && !coverError ? (
              <img
                src={course.thumbnail}
                alt={course.title}
                onError={() => setCoverError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-primary/40 via-bg2 to-secondary/30" />
            )}
          </div>
        </div>
      </div>

      {/* Instructor Section */}
      <div className="bg-bg2 bg-[linear-gradient(to_right,#6185b815_1px,transparent_1px),linear-gradient(to_bottom,#6185b815_1px,transparent_1px)] bg-[size:40px_40px]">
        <div className="py-8 max-w-7xl mx-auto px-5 border-b-2 border-border">
          <p className="text-primary text-center text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
           <span className="text-white">Meet</span> your Teacher{course.instructorDetails?.length > 1 ? "s." : "."}
          </p>
          <div className="border-2 border-dashed border-border bg-bg rounded-xl p-7">
            <div
              className={`grid gap-6 ${course.instructorDetails?.length === 1 ? "grid-cols-1 justify-center" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
              {course.instructorDetails?.length > 0 ? (
                course.instructorDetails.map((inst, idx) => (
                  <div key={idx}
                    className="relative gap-5 flex bg-bg2 text-white rounded-xl p-5 items-center transition-all duration-700 group hover:-translate-y-1 mx-auto overflow-hidden">
                    <div className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full bg-primary group-hover:bg-secondary transition-all duration-700" />
                    <div className="w-22 h-22 rounded-xl overflow-hidden flex-shrink-0">
                      {inst.profileImage && (
                        <img src={inst.profileImage} className="w-full h-full object-cover" alt={inst.name} />
                      )}
                    </div>
                    <div className="flex-1 ml-4 sm:ml-6">
                      <p className="font-bold text-lg sm:text-xl mb-1">{inst.name}</p>
                      <p>{inst.academicDegrees}</p>
                      <p className="text-xs font-medium">
                        {inst.yearsExperience
                          ? `${inst.yearsExperience} + Years of Experience`
                          : "Experience: N/A"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="relative gap-5 flex bg-bg rounded-xl p-5 items-center transition-all duration-700 group hover:-translate-y-1 mx-auto overflow-hidden">
                  <div className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full bg-primary group-hover:bg-secondary transition-all duration-700" />
                  <div className="w-22 h-22 rounded-full bg-slate-400" />
                  
                    <p className="font-bold text-lg sm:text-xl mb-1">Neth German</p>
                    <p className="text-xs sm:text-sm line-clamp-2 mb-2">Expert Instructor</p>
                    <p className="text-xs font-medium">5+ Years of Experience</p>
                  
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="bg-bg bg-[linear-gradient(to_right,#6185b815_1px,transparent_1px),linear-gradient(to_bottom,#6185b815_1px,transparent_1px)] bg-[size:40px_40px]">
        <div className="flex sm:flex-row flex-col py-10">

          {/* LEFT - Sections List */}
          <div className="sm:max-w-sm sm:w-full m-6 bg-bg border border-border rounded-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border">
              <h2 className="text-xl font-semibold text-primary mb-2 text-center">Course Content</h2>
              <div className="text-white text-center">{totalSections} sections • {totalVideos} lectures • {totalDuration} total length</div>
            </div>

            <div className="overflow-y-auto">
              {visibleSections.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  <button onClick={() => toggleSection(sectionIndex)}
                    className={`w-full p-5 text-left hover:bg-primary/20 transition-all duration-500 cursor-pointer `}>
                    <div className="flex items-center gap-3">
                      <ChevronRight className={`transition-all duration-300 ${expandedSections.has(sectionIndex) ? "rotate-90 text-tertiary" : "text-text-secondary"}`}/>
                      <div>
                        <h3 className="font-medium text-primary ">{section.title}</h3>
                        <p className="text-sm text-white">{section.lectures?.length || 0} lectures •{" "} {getSectionDuration(section)}</p>
                      </div>
                    </div>
                  </button>

                  {expandedSections.has(sectionIndex) && (
                    <div>
                      {section.lectures?.map((lecture, lectureIndex) => {
                        const isActive = activeVideo === `${sectionIndex}-${lectureIndex}`;
                        const embedUrl = getYouTubeEmbedUrl(lecture.youtubeUrl);
                        const liveDate = lecture.liveAt ? new Date(lecture.liveAt) : null;
                        const isLiveUpcoming = liveDate && liveDate > now;

                        return (
                          <div key={lectureIndex} className="flex items-center justify-between">
                            <button onClick={() => handleLectureClick(sectionIndex, lectureIndex, lecture)}
                              className="w-full group cursor-pointer flex items-center gap-3 px-4 py-2 text-left transition-all">
                              <div className="flex-shrink-0">
                                {embedUrl ? (
                                  <div className={`w-9 h-9 group-hover:bg-primary transition-all duration-500 rounded-full flex items-center justify-center ${
                                      isActive ? "bg-primary" : "bg-bg"}`}>
                                    <Play className={`group-hover:text-white transition-all duration-500 ${isActive ? "text-white" : "text-text-secondary"}`}/>
                                  </div>
                                ) : isLiveUpcoming ? (
                                  <div className={`w-9 h-9 group-hover:bg-primary transition-all duration-500 rounded-full flex items-center justify-center ${
                                      isActive ? "bg-primary" : "bg-bg"}`}>
                                    <Calendar className={`group-hover:text-white transition-all duration-500 ${isActive ? "text-white" : "text-text-secondary"}`}/>
                                  </div>
                                ) : (
                                  <div className={`w-9 h-9 group-hover:bg-primary transition-all duration-500 rounded-full flex items-center justify-center ${
                                      isActive ? "bg-primary" : "bg-bg"}`}>
                                    <Lock className={`group-hover:text-white transition-all duration-500 ${isActive ? "text-white" : "text-text-secondary"}`}/>
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className={` font-medium hover:text-primary transition-all duration-300 ${isActive ? "text-primary" : "text-text-secondary"}`}>
                                  {lecture.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  {embedUrl && (
                                    <span className="text-sm text-text-secondary">{lecture.duration}</span>
                                  )}
                                </div>
                              </div>
                            </button>

                            <div className="flex items-center justify-center gap-2">
                              <p className="font-bold text-primary">Completed</p>
                              <input type="checkbox" className="mx-3 h-7 w-7 accent-primary cursor-pointer" checked={!!checkedLectures[`${sectionIndex}-${lectureIndex}`]}
                                onChange={() => handleLectureCheckbox(sectionIndex, lectureIndex)} title="Mark as completed"/>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT - Video Player */}
          <div className="w-full">
            {selectedLecture ? (
              <div className="flex flex-col">
                {(() => {
                  const embedUrl = getYouTubeEmbedUrl(selectedLecture.youtubeUrl);
                  if (embedUrl) {
                    return (
                      <div className="xl:w-215 xl:h-125 h-75 mx-8 xl:mx-auto rounded-xl overflow-hidden">
                        <iframe src={embedUrl} className="h-full w-full" allowFullScreen />
                      </div>
                    );
                  }
                  return null;
                })()}

                <div className="bg-bg border border-border m-6 p-6 rounded-xl text-center">
                  <div className="border-b-2 border-border pb-4">
                    <h2 className="text-4xl font-semibold text-primary mb-2">{selectedLecture?.title}</h2>
                    <p className="text-white mb-4 text-justify">
                      {selectedLecture?.description || "Comprehensive video lecture covering essential concepts and practical examples"}
                    </p>
                  </div>

                  {selectedLecture?.resources && selectedLecture.resources.length > 0 && selectedLecture.resources[0]?.trim() !== "" && (
                      <div>
                        <h3 className="text-xl font-medium text-white flex items-center justify-center gap-2 p-6">
                          <Paperclip className="text-secondary" /> Resources
                        </h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 pt-2 px-8">
                          {selectedLecture.resources.map((resource, resIdx) => {
                            const isString = typeof resource === "string";
                            const url = isString ? resource : resource?.url;
                            const title = isString ? `Resource ${resIdx + 1}` : resource?.title || `Resource ${resIdx + 1}`;
                            if (!url || url.trim() === "") return null;
                            return (
                              <div key={resIdx} className="flex items-center justify-between p-3 rounded-xl border-2 border-border">
                                <div className="flex items-center gap-3">
                                  <FileText className="text-secondary" size={25}/> <span className="text-white font-medium truncate" title={title}>{title}</span>
                                </div>
                                <a href={url} target="_blank"
                                 className="inline-flex items-center gap-5 px-3 py-2 bg-primary text-white text-sm rounded-xl hover:bg-primary/80 transition-all duration-700 hover:scale-105">
                                  <ExternalLink size={25} /> Open
                                </a>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center gap-4 bg-bg rounded-xl mx-8 h-full border-2 border-dashed border-border text-white p-6">
                <PlayCircle style={{ width: "120px", height: "120px" }} />
                <h2 className="text-2xl font-semibold">Welcome to {course.title}!</h2>
                <p>Select a lecture from the course content on the left to start watching.</p>
                <div className="flex items-center justify-center gap-6">
                  <span className="flex items-center gap-2">
                    <Video /> {totalVideos} lectures
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock /> {totalDuration} total
                  </span>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Study kit — flashcards, quiz & summary saved with the course */}
        {course.studyKit && (
          <div className="max-w-4xl mx-auto px-6 pb-12">
            <h2 className="text-2xl font-semibold text-primary mb-2 flex items-center gap-2">✦ Study kit</h2>
            <p className="text-white/70 text-sm mb-4">Practice these flashcards and quiz, and review the summary to master this course.</p>
            <StudyKitView kit={course.studyKit} enrollmentId={enrollmentId} />
          </div>
        )}

        {/* Certificate — unlocked once every lecture is completed */}
        {enrollmentId && allComplete && (
          <div className="max-w-4xl mx-auto px-6 pb-16 text-center">
            <div className="bg-bg2 border-2 border-dashed border-border rounded-xl p-8">
              <p className="text-white text-lg mb-4">
                You have completed every lecture in this course.
              </p>
              <button
                onClick={handleGetCertificate}
                disabled={certLoading}
                className="inline-flex items-center gap-2 bg-primary text-white text-lg font-semibold px-6 py-3 rounded-xl cursor-pointer transition-all duration-700 hover:scale-105 hover:bg-primary/80 disabled:opacity-60"
              >
                🎓 {certLoading ? "Loading…" : "Get your certificate"}
              </button>
              {certError && <p className="text-red-400 text-sm mt-3">{certError}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Certificate modal */}
      {certOpen && certificate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 print:bg-white print:p-0"
          onClick={() => setCertOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-gradient-to-br from-bg2 to-bg border-4 border-primary rounded-2xl p-10 text-center shadow-2xl print:border-primary print:shadow-none"
          >
            <button
              onClick={() => setCertOpen(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl leading-none cursor-pointer print:hidden"
              title="Close"
            >
              ✕
            </button>

            <div className="text-5xl mb-4">🎓</div>
            <p className="text-primary text-sm tracking-[0.3em] uppercase font-semibold mb-2">
              Certificate of Completion
            </p>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full mb-6" />

            <p className="text-white/70 text-sm mb-1">This certifies that</p>
            <h2 className="text-4xl font-bold text-white mb-4">{certificate.studentName}</h2>
            <p className="text-white/70 text-sm mb-1">has successfully completed</p>
            <h3 className="text-2xl font-semibold text-primary mb-2">{certificate.courseTitle}</h3>

            <p className="text-white/80 text-sm mb-6">
              {[certificate.level, certificate.language].filter(Boolean).join(" • ")}
            </p>

            {certificate.quizBestPct != null && (
              <p className="text-white text-sm mb-4">
                Quiz score: <span className="font-semibold text-secondary">{certificate.quizBestPct}%</span>
              </p>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-6 text-white">
              <div className="text-center">
                <p className="text-lg font-semibold">{certificate.instructor}</p>
                <p className="text-xs text-white/60">Instructor</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">{formatCertDate(certificate.issuedAt)}</p>
                <p className="text-xs text-white/60">Date issued</p>
              </div>
            </div>

            <p className="mt-6 text-[10px] text-white/40 font-mono break-all">
              Certificate ID: {certificate.id}
            </p>

            <div className="mt-8 flex items-center justify-center gap-4 print:hidden">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl cursor-pointer transition-all duration-700 hover:scale-105 hover:bg-primary/80"
              >
                Print / Save as PDF
              </button>
              <button
                onClick={() => setCertOpen(false)}
                className="inline-flex items-center gap-2 bg-bg2 border border-border text-white px-5 py-2.5 rounded-xl cursor-pointer transition-all duration-700 hover:scale-105"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetails;