import React, { useState } from "react";

const SectionForm = ({ onClose, onSubmit, initialData }) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [sectionType, setSectionType] = useState(initialData?.sectionType || ""); 
  const [lectures, setLectures] = useState(
    initialData?.lectures?.length
      ? initialData.lectures
      : [
          {
            title: "",
            youtubeUrl: "",
            description: "",
            duration: "",
            resources: [""],
            liveLink: "",
            liveAt: "",
          },
        ]
  );

  const handleLectureChange = (idx, field, value) => {
    setLectures((prev) =>
      prev.map((lec, i) => (i === idx ? { ...lec, [field]: value } : lec))
    );
  };

  const handleResourceChange = (lecIdx, resIdx, value) => {
    setLectures((prev) =>
      prev.map((lec, i) =>
        i === lecIdx
          ? {
              ...lec,
              resources: lec.resources.map((r, j) =>
                j === resIdx ? value : r
              ),
            }
          : lec
      )
    );
  };

  const addLecture = () => {
    setLectures((prev) => [
      ...prev,
      {
        title: "",
        youtubeUrl: "",
        description: "",
        duration: "",
        resources: [""],
        liveLink: "",
        liveAt: "",
      },
    ]);
  };

  const addResource = (lecIdx) => {
    setLectures((prev) =>
      prev.map((lec, i) =>
        i === lecIdx ? { ...lec, resources: [...lec.resources, ""] } : lec
      )
    );
  };

  const removeLecture = (idx) => {
    setLectures((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeResource = (lecIdx, resIdx) => {
    setLectures((prev) =>
      prev.map((lec, i) =>
        i === lecIdx
          ? { ...lec, resources: lec.resources.filter((_, j) => j !== resIdx) }
          : lec
      )
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter a section title");
      return;
    }

    if (!sectionType) {
      alert("Please select a section type (Language Training or Exam Preparation)");
      return;
    }

    if (lectures.length === 0) {
      alert("Please add at least one lecture");
      return;
    }

    const processedLectures = lectures.map((lec) => ({
      ...lec,
      liveAt: lec.liveAt ? new Date(lec.liveAt) : null,
      liveLink: lec.liveLink || null,
      youtubeUrl: lec.youtubeUrl || null,
      resources: lec.resources.filter(r => r.trim()), // Filter out empty resources
    }));

    console.log("Submitting section data:", {
      title,
      sectionType,
      lectures: processedLectures,
    });

    onSubmit({ title, sectionType, lectures: processedLectures });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-start justify-center z-50 overflow-y-auto min-h-screen py-4">
      <div className="bg-white rounded-xl  p-6 w-full max-w-4xl mx-4 my-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-1 right-2 text-2xl text-secondary hover:bg-slate-200 bg-slate-100 rounded-full py-1 px-3 cursor-pointer transition-all duration-500"
          aria-label="Close"
        >
          X
        </button>

        {/* Header */}
        <h2 className="text-3xl font-bold mb-8 text-primary text-center">
          {initialData ? "Edit Section" : "Add Section"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section Title */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <label className="block text-lg font-semibold mb-3 text-blue-800">
              Section Title *
            </label>
            <input
              className="w-full border-2 border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter section title"
            />
          </div>

          {/* Section Type Buttons */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <label className="block text-lg font-semibold mb-4 text-blue-800">
              Section Type *
            </label>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => setSectionType("language-training")}
                className={`flex-1 py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 border-2 ${
                  sectionType === "language-training"
                    ? "bg-primary text-white border-primary "
                    : "bg-white text-primary border-blue-200 hover:bg-blue-100"
                }`}
              >
                Language Training
              </button>

              <button
                type="button"
                onClick={() => setSectionType("exam-preparation")}
                className={`flex-1 py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 border-2 ${
                  sectionType === "exam-preparation"
                    ? "bg-primary text-white border-primary "
                    : "bg-white text-primary border-blue-200 hover:bg-blue-100"
                }`}
              >
                Exam Preparation
              </button>
            </div>
          </div>

          {/* Lectures */}
          <div className="space-y-6">
            <label className="block text-lg font-semibold text-blue-800">
              Lectures *
            </label>
            {lectures.map((lec, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg  relative border border-blue-200"
              >
                {/* Lecture Number and Delete Button */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-blue-800">Lecture {idx + 1}</h3>
                  {lectures.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLecture(idx)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-semibold transition"
                    >
                      Remove Lecture
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <input
                    className="w-full border-2 border-blue-200 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={lec.title}
                    onChange={(e) =>
                      handleLectureChange(idx, "title", e.target.value)
                    }
                    required
                    placeholder="Lecture Title *"
                  />
                  <input
                    className="w-full border-2 border-blue-200 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={lec.youtubeUrl}
                    onChange={(e) =>
                      handleLectureChange(idx, "youtubeUrl", e.target.value)
                    }
                    placeholder="YouTube URL"
                  />
                  <div className="lg:col-span-2">
                    <textarea
                      className="w-full border-2 border-blue-200 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                      rows="3"
                      value={lec.description}
                      onChange={(e) =>
                        handleLectureChange(idx, "description", e.target.value)
                      }
                      placeholder="Description"
                    />
                  </div>
                  <input
                    className="w-full border-2 border-blue-200 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={lec.duration}
                    onChange={(e) =>
                      handleLectureChange(idx, "duration", e.target.value)
                    }
                    placeholder="Duration (e.g. 05:00)"
                  />
                  <input
                    className="w-full border-2 border-blue-200 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={lec.liveLink}
                    onChange={(e) =>
                      handleLectureChange(idx, "liveLink", e.target.value)
                    }
                    placeholder="Live Link (optional)"
                  />
                  <input
                    type="datetime-local"
                    className="w-full border-2 border-blue-200 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={lec.liveAt}
                    onChange={(e) =>
                      handleLectureChange(idx, "liveAt", e.target.value)
                    }
                    placeholder="Live At (optional)"
                  />
                </div>

                {/* Resources */}
                <div className="mt-6 pt-6 border-t border-blue-200">
                  <label className="block font-semibold mb-3 text-blue-700">
                    Resources
                  </label>
                  <div className="space-y-3">
                    {lec.resources.map((res, resIdx) => (
                      <div key={resIdx} className="flex gap-2">
                        <input
                          className="flex-1 border-2 border-blue-200 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                          value={res}
                          onChange={(e) =>
                            handleResourceChange(idx, resIdx, e.target.value)
                          }
                          placeholder="Resource URL"
                        />
                        {lec.resources.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeResource(idx, resIdx)}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-semibold transition"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="mt-3 text-primary font-semibold hover:text-blue-700 flex items-center"
                    onClick={() => addResource(idx)}
                  >
                    <span className="mr-1">+</span> Add Resource
                  </button>
                </div>
              </div>
            ))}

            {/* Add Lecture Button */}
            <button
              type="button"
              className="w-full bg-blue-100 text-blue-700 py-4 rounded-lg font-semibold hover:bg-blue-200 transition-colors border-2 border-dashed border-blue-300"
              onClick={addLecture}
            >
              + Add New Lecture
            </button>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-slate-100 text-text-secondary rounded-lg font-semibold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              {initialData ? "Update Section" : "Create Section"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SectionForm;