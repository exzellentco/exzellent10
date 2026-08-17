import React from "react";
import {
  X,
  BookOpen,
  Clock,
  CheckCircle,
  PlayCircle,
  TrendingUp,
  Award,
} from "lucide-react";

const ProgressModal = ({
  isOpen,
  onClose,
  course,
  progress,
  loading = false,
}) => {
  if (!isOpen) return null;



  // Fallback to course data if progress data is incomplete
  const courseData = progress?.course || course;

  // Try different possible data structures for progress percentage
  const completedPercentage =
    Math.round(
      (progress?.completedPercentage ||
        progress?.progress?.completedPercentage ||
        course?.completedPercentage ||
        0) * 100
    ) / 100;

  // Calculate total lectures from course sections
  const totalLectures =
    courseData?.sections?.reduce(
      (total, section) => total + (section.lectures?.length || 0),
      0
    ) ||
    progress?.enrollment?.course?.sections?.reduce(
      (total, section) => total + (section.lectures?.length || 0),
      0
    ) ||
    0;

  // Calculate completed lectures
  const completedLectures =
    progress?.completedLectures ||
    Math.round((completedPercentage / 100) * totalLectures);
  const remainingLectures = totalLectures - completedLectures;

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    if (percentage >= 40) return "text-orange-600";
    return "text-tertiary";
  };

  const getProgressBgColor = (percentage) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    if (percentage >= 40) return "bg-orange-500";
    return "bg-tertiary";
  };

  const getProgressRingColor = (percentage) => {
    if (percentage >= 80) return "stroke-green-500";
    if (percentage >= 60) return "stroke-yellow-500";
    if (percentage >= 40) return "stroke-orange-500";
    return "stroke-tertiary";
  };

  const getProgressRingBgColor = (percentage) => {
    if (percentage >= 80) return "stroke-green-100";
    if (percentage >= 60) return "stroke-yellow-100";
    if (percentage >= 40) return "stroke-orange-100";
    return "stroke-tertiary";
  };

  const circumference = 2 * Math.PI * 90; // radius = 90
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (completedPercentage / 100) * circumference;

return (
<>
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">

    <div className="bg-gradient-to-tr from-bg to-bg2 border border-border rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
{/* Header */}

      <div className="flex flex-col items-end p-4 border-b border-border">

        <button onClick={onClose} className="p-2 group cursor-pointer">
          <X className="w-8 h-8 text-text-secondary group-hover:text-secondary transition-all duration-500" />
        </button>

        <div className="text-center w-full">
          <h2 className="text-3xl font-bold text-primary">Course Progress</h2>
          <p className="text-xl text-text-secondary my-2">{courseData?.title || course?.course?.title || course?.title || "Course Progress"}</p>
        </div>

      </div>

      

        {loading ? (

          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#1B4A73] mb-4"/>
            <p className="text-[#1B4A73] text-lg">Loading progress data...</p>
          </div>

        ) : progress && Object.keys(progress).length > 0 ? (

          <>
{/* Progress Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 p-6">
{/* Circular Progress Chart */}
              <div className="flex flex-col items-center">

                <div className="relative">

                  <svg className="w-48 h-48 transform -rotate-90">
{/* Background circle */}
                    <circle cx="96" cy="96" r="90" stroke={getProgressRingBgColor(completedPercentage)} strokeWidth="12" fill="transparent" className=""/>
{/* Progress circle */}
                    <circle cx="96" cy="96" r="90" stroke={getProgressRingColor(completedPercentage)} strokeWidth="12" fill="transparent" strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-1000 ease-out"/>
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-4xl font-bold ${getProgressColor(completedPercentage)}`}>{completedPercentage.toFixed(2)}%</span>
                    <span className=" text-text-secondary">Complete</span>
                  </div>

                </div>

                <div className="mt-4 text-center">
                  <p className="text-lg font-semibold text-secondary">{completedLectures} of {totalLectures} lectures completed</p>
                  <p className="text-sm text-text-secondary">{remainingLectures} lectures remaining</p>
                </div>

              </div>

{/* Progress Statistics */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-primary mb-4">Progress Breakdown</h3>

                <div className="space-y-4">

                  <div className="flex items-center justify-between p-4 rounded-xl border-2 border-border">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-secondary"/><span className="text-text-secondary">Total Lectures</span>
                    </div>
                    <span className="text-xl font-bold text-secondary">{totalLectures}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border-2 border-border">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-secondary"/><span className="text-text-secondary">Completed</span>
                    </div>
                    <span className="text-xl font-bold text-secondary">{completedLectures}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border-2 border-border">
                    <div className="flex items-center gap-3">
                      <PlayCircle className="w-5 h-5 text-secondary"/><span className="text-text-secondary">Remaining</span>
                    </div>
                    <span className="text-xl font-bold text-secondary">{remainingLectures}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border-2 border-border">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-secondary"/><span className="text-text-secondary">Progress Rate</span>
                    </div>
                    <span className={`text-xl font-bold ${getProgressColor(completedPercentage)}`}>{completedPercentage.toFixed(2)}%</span>
                  </div>

                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4 px-6">

              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-primary">Overall Progress</h3>
                <span className={`text-lg font-bold ${getProgressColor(completedPercentage)}`}>{completedPercentage.toFixed(2)}%</span>
              </div>

              <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                <div className={`h-4 rounded-full transition-all duration-1000 ease-out ${getProgressBgColor(completedPercentage)}`} style={{ width: `${completedPercentage}%` }}/>
              </div>

              <div className="flex justify-between text-sm text-text-secondary mt-2">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>

            </div>

            {/* Progress Insights */}
            <div className="rounded-xl p-6 m-6">
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-6 h-6 text-tertiary" />
                <h3 className="text-lg font-semibold text-white">Progress Insights</h3>
              </div>

              {completedPercentage === 0 && (
                <p className="text-text-secondary">You're just getting started! Begin your learning journey by watching the first lecture.</p>
              )}

              {completedPercentage > 0 && completedPercentage < 25 && (
                <p className="text-text-secondary">Great start! You're building a solid foundation. Keep going to unlock more content.</p>
              )}

              {completedPercentage >= 25 && completedPercentage < 50 && (
                <p className="text-text-secondary">You're making excellent progress! You're about halfway through the course.</p>
              )}

              {completedPercentage >= 50 && completedPercentage < 75 && (
                <p className="text-text-secondary">You're in the home stretch! You've completed more than half of the course.</p>
              )}

              {completedPercentage >= 75 && completedPercentage < 100 && (
                <p className="text-text-secondary">Almost there! You're very close to completing this course. Keep up the great work!</p>
              )}

              {completedPercentage === 100 && (
                <p className="text-text-secondary">Congratulations! You've completed the entire course. You're ready for the next challenge!</p>
              )}
            </div>

          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <TrendingUp className="w-16 h-16 text-white mb-4" />
            <h3 className="text-xl font-semibold text-text-secondary mb-2">No Progress Data Available</h3>
            <p className="text-text-secondary text-center">Progress data for this course is not available yet. <br /> Start learning to see your progress!</p>
          </div>
        )}
      
    </div>
  </div>
</>
);};

export default ProgressModal;
