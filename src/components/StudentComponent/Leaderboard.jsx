import React from "react";
import { X, Trophy, Medal, Award, TrendingUp } from "lucide-react";

const Leaderboard = ({ isOpen, onClose, leaderboard, courseTitle, loading }) => {
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-tertiary" />;
      case 2:
        return <Medal className="w-6 h-6 text-zinc-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-900" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-text-secondary">#{rank}</span>;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return "border-tertiary";
      case 2:
        return "border-zinc-400";
      case 3:
        return "border-amber-900";
      default:
        return "border-slate-200";
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    if (percentage >= 40) return "text-orange-600";
    return "text-red-600";
  };

  if (!isOpen) return null;

  return (
<>
  <div className="fixed flex flex-col right-0 top-0 z-50 w-[300px] h-full bg-bg border border-border  transition-all duration-500 ease-in-out">
    
    <div className="flex items-center justify-between p-6 bg-gradient-to-tr from-tertiary to-amber-300 text-white">

      <div>
        <h2 className="text-xl font-bold">Leaderboard</h2>
        <p className="text-sm text-blue-100 mt-1">{courseTitle}</p>
      </div>

      <button onClick={onClose} className="p-2 cursor-pointer group">
        <X className="w-8 h-8 group-hover:text-text-secondary transition-all duration-700"/>
      </button>

    </div>

    <div className="flex-1 overflow-y-auto p-6">

      {loading ? (

        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"/>
        </div>

      ) : leaderboard.length === 0 ? (

        <div className="text-center py-8">
          <TrendingUp className="w-12 h-12 text-white mx-auto mb-4" />
          <p className="text-text-secondary">No leaderboard data available yet.</p>
          <p className="text-sm text-white mt-2">Start learning to see your ranking!</p>
        </div>

      ) : (

        <div className="space-y-3">
          {leaderboard.map((entry, index) => (

            <div key={entry._id || index}
             className={`flex items-center gap-4 p-4 rounded-xl bg-white border-2 ${getRankColor(index + 1)} transition-all duration-200`}>
              <div className="flex-shrink-0">{getRankIcon(index + 1)}</div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-text-secondary truncate">{entry.student?.name || "Anonymous"}</h3>

                <div className="flex items-center gap-2 mt-1">

                  <div className="flex-1 bg-slate-200 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all duration-300 ${ entry.completedPercentage >= 80 ? "bg-green-500" :
                        entry.completedPercentage >= 60 ? "bg-yellow-500" : entry.completedPercentage >= 40 ? "bg-orange-500" : "bg-red-500"}`}
                      style={{ width: `${entry.completedPercentage}%` }}/>
                  </div>

                  <span className={`text-sm font-bold ${getProgressColor(entry.completedPercentage)}`}>{entry.completedPercentage}%</span>
                </div>

              </div>

            </div>

          ))}
        </div>
      
      )}
    </div>
    
  </div>
</>
);};

export default Leaderboard;
