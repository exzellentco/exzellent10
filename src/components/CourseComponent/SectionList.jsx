import React from "react";
import { Edit2, Trash2, Play, FileText, Link2, Clock } from "lucide-react";

const SectionList = ({ sections, onEdit, onDelete }) => (
  <div className="space-y-6">
    {sections.length === 0 ? (
      <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50">
        <p className="text-text-secondary text-lg">No sections added yet</p>
      </div>
    ) : (
      sections.map((section) => (
        <div
          key={section._id}
          className="border-2 border-blue-200 rounded-lg p-6 bg-gradient-to-r from-blue-50 to-white  hover: transition-shadow"
        >
          {/* Section Header */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-blue-100">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-blue-900">{section.title}</h3>
              <p className="text-sm text-text-secondary mt-1">
                Section Type: <span className="font-semibold text-blue-800">
                  {section.sectionType === "language-training"
                    ? "Language Training"
                    : section.sectionType === "exam-preparation"
                    ? "Exam Preparation"
                    : "General"}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                className="p-2 bg-yellow-400 hover:bg-yellow-500 text-white rounded-lg transition font-semibold flex items-center gap-1"
                onClick={() => {
                  console.log("Edit section with ID:", section._id);
                  onEdit(section);
                }}
                title="Edit section"
              >
                <Edit2 size={18} />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-semibold flex items-center gap-1"
                onClick={() => {
                  console.log("Delete section with ID:", section._id);
                  onDelete(section);
                }}
                title="Delete section"
              >
                <Trash2 size={18} />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>

          {/* Lectures List */}
          <div className="space-y-4">
            {section.lectures.length === 0 ? (
              <div className="text-center py-8 bg-blue-50 rounded-lg">
                <p className="text-text-secondary italic">No lectures in this section</p>
              </div>
            ) : (
              section.lectures.map((lec, lecIdx) => (
                <div
                  key={lec._id || lecIdx}
                  className="bg-white border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition"
                >
                  {/* Lecture Title and Duration */}
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-lg font-bold text-blue-900">{lec.title}</h4>
                    {lec.duration && (
                      <span className="flex items-center gap-1 text-sm text-text-secondary bg-slate-100 px-3 py-1 rounded-full">
                        <Clock size={16} />
                        {lec.duration}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {lec.description && (
                    <p className="text-text-secondary text-sm mb-3">{lec.description}</p>
                  )}

                  {/* Links and Metadata */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    {/* YouTube Link */}
                    {lec.youtubeUrl && (
                      <a
                        href={lec.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-red-600 hover:text-red-800 font-semibold text-sm bg-red-50 p-2 rounded transition"
                      >
                        <Play size={16} />
                        Watch on YouTube
                      </a>
                    )}

                    {/* Live Link */}
                    {lec.liveLink && (
                      <a
                        href={lec.liveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-green-600 hover:text-green-800 font-semibold text-sm bg-green-50 p-2 rounded transition"
                      >
                        <Link2 size={16} />
                        Live Session
                      </a>
                    )}
                  </div>

                  {/* Live At */}
                  {lec.liveAt && (
                    <p className="text-sm text-text-secondary mb-3 flex items-center gap-2">
                      <Clock size={16} className="text-orange-500" />
                      <strong>Live at:</strong> {new Date(lec.liveAt).toLocaleString()}
                    </p>
                  )}

                  {/* Resources */}
                  {lec.resources && lec.resources.length > 0 && lec.resources.some(r => r) && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <p className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                        <FileText size={16} />
                        Resources
                      </p>
                      <ul className="space-y-2">
                        {lec.resources.map((res, rIdx) =>
                          res ? (
                            <li key={rIdx}>
                              <a
                                href={res}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline text-sm break-all hover:bg-blue-50 p-1 rounded transition"
                              >
                                📄 {res.length > 50 ? res.substring(0, 47) + "..." : res}
                              </a>
                            </li>
                          ) : null
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      ))
    )}
  </div>
);

export default SectionList;