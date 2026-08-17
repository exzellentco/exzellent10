import React from "react";
import { BookOpen, TrendingUp, Trophy, Play } from "lucide-react";

const TaughtCourseCard = ({
  course,
  onGoToCourse,
  onCheckProgress,
  onShowLeaderboard,
}) => {
  const getProgressColor = (percentage) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    if (percentage >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getProgressBgColor = (percentage) => {
    if (percentage >= 80) return "bg-green-100";
    if (percentage >= 60) return "bg-yellow-100";
    if (percentage >= 40) return "bg-orange-100";
    return "bg-red-100";
  };

  return (
    <div className="bg-white rounded-xl  border border-slate-200 p-6 hover: transition-all duration-300 w-full max-w-md mx-auto">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-[#1B4A73] mb-2 line-clamp-2">
            {course.course?.title || course.title}
          </h3>
          <div className="flex items-center gap-4 text-sm text-text-secondary">
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {course.course?.language || course.language}
            </span>
            <span className="px-2 py-1 bg-slate-100 rounded-full text-xs">
              {course.course?.level || course.level}
            </span>
          </div>
        </div>
      </div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-text-secondary">Progress</span>
          <span
            className={`text-sm font-bold ${getProgressColor(
              course.completedPercentage || 0
            )}`}
          >
            {(course.completedPercentage || 0).toFixed(2)}%
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressBgColor(
              course.completedPercentage || 0
            )}`}
            style={{ width: `${course.completedPercentage || 0}%` }}
          ></div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-2">
        <button
          onClick={() => onGoToCourse(course)}
          className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 p-3 bg-[#1B4A73] text-white rounded-lg hover:bg-[#144060] transition-colors"
        >
          <Play className="w-5 h-5" />
          <span className="text-xs font-medium">Go to Course</span>
        </button>

        <button
          onClick={() => onCheckProgress(course)}
          className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 p-3 bg-blue-50 text-[#1B4A73] border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-xs font-medium">Check Progress</span>
        </button>

        <button
          onClick={() => onShowLeaderboard(course)}
          className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 p-3 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
        >
          <Trophy className="w-5 h-5" />
          <span className="text-xs font-medium">Leaderboard</span>
        </button>
      </div>
    </div>
  );
};

export default TaughtCourseCard;
