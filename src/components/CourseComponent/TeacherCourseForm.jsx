import React, { useEffect, useState } from "react";

const initialCourseForm = {
  title: "",
  subtitle: "",
  description: "",
  thumbnail: "",
  category: "",
  price: "",
  duration: "",
  level: "A1",
  language: "German",
  groupType: "regular",
  tags: [],
};

const LANGUAGE_TAGS = [
  "A1", "A2", "B1", "B2", "C1", "C2",
  "Grammar", "Vocabulary", "Conversation", "Pronunciation",
  "Listening", "Speaking", "Reading", "Writing",
  "Business", "Travel", "Exam Preparation", "DELE", "SIELE",
  "Beginner Friendly", "Advanced Topics", "Cultural Insights"
];

const TeacherCourseForm = ({ onClose, onSubmit, initialData, isEdit }) => {
  const [form, setForm] = useState(initialData || initialCourseForm);

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        groupType: initialData.groupType || "regular",
        tags: Array.isArray(initialData.tags) ? initialData.tags : [],
      });
      setThumbnailPreview(initialData.thumbnail || "");
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleTag = (tag) => {
    setForm((prev) => {
      const current = prev.tags || [];
      if (current.includes(tag)) {
        return { ...prev, tags: current.filter(t => t !== tag) };
      }
      return { ...prev, tags: [...current, tag] };
    });
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadToCloudinary = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "unsigned_preset");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );

      if (response.ok) {
        const data = await response.json();
        setUploading(false);
        return data.secure_url;
      } else {
        throw new Error("Failed to upload image");
      }
    } catch {
      setUploading(false);
      alert("Failed to upload thumbnail. Please try again.");
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let thumbnailUrl = form.thumbnail;

    if (thumbnailFile) {
      thumbnailUrl = await uploadToCloudinary(thumbnailFile);
      if (!thumbnailUrl) return;
    }

    const data = {
      ...form,
      thumbnail: thumbnailUrl,
      price: Number(form.price),
      duration: form.duration,
      tags: form.tags,
    };

    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-bg text-white rounded-md max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:mx-0 mx-8">
        <div className="border-b border-border pb-4">
          <p onClick={onClose} className="text-end text-2xl text-text-secondary hover:text-tertiary transition-all duration-700 cursor-pointer">X</p>
          <h2 className="text-xl sm:text-2xl font-bold text-primary text-center">
            {isEdit ? "Edit Course" : "Create Course"}
          </h2>
          {!isEdit && (
            <p className="text-sm text-text-secondary text-center mt-2">
              Course will be submitted for admin review before publishing.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="md:col-span-2 sm:md:col-span-1">
              <label className="block text-sm font-medium text-primary mb-1">Title</label>
              <input
                className="border border-border rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="Course Title"
              />
            </div>

            <div className="md:col-span-2 sm:md:col-span-1">
              <label className="block text-sm font-medium text-primary mb-1">Subtitle</label>
              <input
                className="border border-border rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                name="subtitle"
                value={form.subtitle}
                onChange={handleChange}
                required
                placeholder="Course Subtitle"
              />
            </div>

            {/* Thumbnail */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-primary mb-2">Thumbnail</label>
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="border border-border rounded-md px-3 py-2 w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-bg file:text-primary cursor-pointer file:cursor-pointer"
                />
                <div className="flex items-center">
                  <hr className="flex-1 border-primary" />
                  <span className="px-3 text-white text-xs">Or</span>
                  <hr className="flex-1 border-primary" />
                </div>
                <input
                  className="outline-none border border-border rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-primary focus:border-transparent"
                  name="thumbnail"
                  value={form.thumbnail}
                  onChange={handleChange}
                  placeholder="Thumbnail URL"
                />
                {(thumbnailPreview || form.thumbnail) && (
                  <div className="flex justify-center mt-2">
                    <img
                      src={thumbnailPreview || form.thumbnail}
                      alt="Preview"
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-md object-cover border-2 border-border"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-1">Category</label>
              <input
                className="outline-none border border-border rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-primary focus:border-transparent"
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                placeholder="Category"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Price (€)</label>
              <input
                type="number"
                min="0"
                className="outline-none border border-border rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-primary focus:border-transparent"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
                placeholder="Price (€)"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Duration</label>
              <input
                className="outline-none border border-border rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-primary focus:border-transparent"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                required
                placeholder="8 Weeks"
              />
            </div>

            {/* Level Dropdown */}
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Level</label>
              <select
                name="level"
                value={form.level}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-bg text-text-secondary"
              >
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="B1">B1</option>
                <option value="B2">B2</option>
                <option value="C1">C1</option>
              </select>
            </div>

            {/* Language Dropdown */}
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Language</label>
              <select
                name="language"
                value={form.language}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-bg text-text-secondary"
              >
                <option value="English">English</option>
                <option value="German">German</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
              </select>
            </div>

            {/* Group Type Dropdown */}
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Group Type</label>
              <select
                name="groupType"
                value={form.groupType}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-bg text-text-secondary"
              >
                <option value="regular">Regular (25-30 Students • 50 Credits)</option>
                <option value="class">Class (15-20 Students • 250 Credits)</option>
                <option value="one-to-one">One to One (1 Student • 1000 Credits)</option>
              </select>
            </div>

            {/* Tags - Bubble Style */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-primary mb-2">Tags</label>

              <div className="flex flex-wrap gap-2 mb-4">
                {form.tags.length > 0 ? (
                  form.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-bg border border-primary text-primary px-4 py-2 rounded-full text-sm flex items-center gap-2 cursor-pointer font-bold transition"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                      <span className="text-tertiary font-bold">X</span>
                    </span>
                  ))
                ) : (
                  <p className="text-text-secondary text-sm italic">No tags selected yet</p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {LANGUAGE_TAGS.filter(tag => !form.tags.includes(tag)).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className="bg-bg border border-border text-text-secondary px-4 py-2 rounded-full text-sm hover:scale-102 transition "
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-1">Description</label>
            <textarea
              className="outline-none w-full border border-border rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              placeholder="Course Description"
              rows={3}
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-primary text-white py-2 px-3 rounded-md font-bold hover:bg-primary/80 transition-all duration-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {uploading ? "Uploading..." : isEdit ? "Update Course" : "Create Course"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeacherCourseForm;