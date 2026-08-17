import React from "react";
import { BookOpen, TrendingUp, Trophy, Play } from "lucide-react";

const EnrolledCourseCard = ({course, onGoToCourse, onCheckProgress, onShowLeaderboard }) => {
  const getProgressColor = (percentage) => {
    if (percentage >= 66) return "text-secondary";
    if (percentage >= 33) return "text-tertiary";
    if (percentage >= 1) return "text-primary/80";
    return "text-white";
  };

  const getProgressBgColor = (percentage) => {
    if (percentage >= 66) return "bg-secondary";
    if (percentage >= 33) return "bg-tertiary";
    if (percentage >= 1) return "bg-primary/80";
    return "bg-white";
  };

return (
<>
  <div className="bg-gradient-to-tr from-bg to-bg2 rounded-xl border border-border  p-6 ">

      <div className="flex flex-col items-center justify-between mb-4 gap-2">
        <h3 className="font-semibold text-primary mb-2">{course.course?.title || course.title}</h3>

        <div className="flex gap-4 text-sm flex-wrap">
          <span className="flex items-center gap-1 text-text-secondary">
            <BookOpen className="w-4 h-4 text-tertiary" />{course.course?.language || course.language || "Language"}</span>
          <span className={`p-2 rounded-xl  
            ${course.course?.level == "Advanced" ? "bg-tertiary text-white" : course.course?.level == "Intermediate" ? "bg-primary text-white" : "bg-bg text-white"}`}>
            {course.course?.level || course.level}
          </span>
        </div>

      </div>

    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-white">Progress</span>
        <span className={`text-sm font-bold ${getProgressColor(course.completedPercentage || 0)}`}>{(course.completedPercentage || 0).toFixed(2)}%</span>
      </div>
      <div className="bg-white rounded-full h-2">
        <div className={`h-2 rounded-full transition-all duration-300 ${getProgressBgColor(course.completedPercentage || 0)}`} style={{ width: `${course.completedPercentage || 0}%` }}/>
      </div>
    </div>
    
    <div className="grid mt-6 gap-2">
      <button onClick={() => onGoToCourse(course)}
        className="flex items-center justify-center gap-2 p-3 w-full bg-gradient-to-r from-blue-800 to-primary text-white rounded-xl transition-all duration-700 cursor-pointer hover:gap-10">
        <span className=" font-medium">Go to Course</span><Play size={25} />
      </button>

      <button onClick={() => onCheckProgress(course)}
        className="flex items-center justify-center gap-2 p-3 w-full bg-gradient-to-r from-teal-600 to-secondary text-white rounded-xl transition-all duration-700 cursor-pointer hover:gap-10">
        <span className=" font-medium">Check Progress</span><TrendingUp size={25} />
      </button>

      <button onClick={() => onShowLeaderboard(course)}
        className="flex items-center justify-center gap-2 p-3 w-full bg-gradient-to-r from-tertiary to-amber-400 text-white rounded-xl transition-all duration-700 cursor-pointer hover:gap-10">
        <span className=" font-medium">Leaderboard</span><Trophy size={25} />
      </button>
    </div>
  


  </div>
</>
);};

export default EnrolledCourseCard;
