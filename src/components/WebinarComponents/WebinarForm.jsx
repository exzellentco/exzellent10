import React from "react";

const WebinarForm = ({form, editId, onChange, onSubmit, onCancelEdit, onSyllabusChange, onAddSyllabusField, onRemoveSyllabusField, teachers}) => (

  <form onSubmit={onSubmit} className="space-y-5 mb-12">
    <div>
      <label className="block mb-1 font-semibold text-primary">Title</label>
      <input name="title" value={form.title} onChange={onChange} required placeholder="Enter webinar title"
        className="bg-white w-full border-slate-300 rounded-xl border-2 p-3 focus:border-primary focus:outline-none"/>
    </div>

    <div>
      <label className="block mb-1 font-semibold text-primary">Description</label>
      <textarea name="description" value={form.description} onChange={onChange} required placeholder="Enter webinar description" rows={6}
        className="bg-white w-full border-slate-300 rounded-xl border-2 p-3 focus:border-primary focus:outline-none"/>
    </div>

    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <label className="block mb-1 font-semibold text-primary">Scheduled At</label>
        <input type="datetime-local" name="scheduledAt" onChange={onChange} value={form.scheduledAt} required
          className="bg-white w-full border-slate-300 rounded-xl border-2 p-3 focus:border-primary focus:outline-none cursor-pointer"/>
      </div>

      <div className="flex-1">
        <label className="block mb-1 font-semibold text-primary">Ends At</label>
        <input type="datetime-local" name="endsAt" onChange={onChange} value={form.endsAt} required
          min={form.scheduledAt || undefined}
          className="bg-white w-full border-slate-300 rounded-xl border-2 p-3 focus:border-primary focus:outline-none cursor-pointer"/>
      </div>
    </div>
    <p className="text-xs text-text-secondary -mt-3">Set the start and end time of the webinar</p>

    <div>
      <label className="block mb-1 font-semibold text-primary">Platform</label>
      <select name="platform" value={form.platform} onChange={onChange} required
        className="bg-white w-full border-slate-300 rounded-xl border-2 p-3 focus:border-primary focus:outline-none cursor-pointer">

        <option value="">Select Platform</option>
        <option value="Zoom">Zoom</option>
        <option value="Google Meet">Google Meet</option>
        <option value="Microsoft Teams">Microsoft Teams</option>
        <option value="YouTube Live">YouTube Live</option>
        <option value="Other">Other</option>

      </select>
    </div>

    <div>
      <label className="block mb-1 font-semibold text-primary">Meeting Link</label>
      <input name="meetingLink" value={form.meetingLink} required onChange={onChange} placeholder="https://zoom.us/j/1234567890" type="url"
        className="bg-white w-full border-slate-300 rounded-xl border-2 p-3 focus:border-primary focus:outline-none" />
      <p className="text-xs text-text-secondary mt-1">Enter the full meeting URL including https://</p>
    </div>

    <div>
      <label className="block mb-1 font-semibold text-primary">Thumbnail URL</label>
      <input name="thumbnail" value={form.thumbnail} onChange={onChange} placeholder="https://example.com/thumbnail.jpg" type="url"
        className="bg-white w-full border-slate-300 rounded-xl border-2 p-3 focus:border-primary focus:outline-none"/>
      <p className="text-xs text-text-secondary mt-1">Optional: Enter image URL for webinar thumbnail</p>
    </div>

    <div>
      <label className="block mb-1 font-semibold text-primary">Instructor</label>
      <select name="instructorId" value={form.instructorId} onChange={onChange}
        className="bg-white w-full border-slate-300 rounded-xl border-2 p-3 focus:border-primary focus:outline-none cursor-pointer">

        <option value="">No specific instructor (optional)</option>

        {teachers.map((teacher) => (
          <option key={teacher._id} value={teacher.teacherId}>
            {teacher.email} {teacher.name ? `(${teacher.name})` : ""}
          </option>
        ))}

      </select>
      <p className="text-xs text-text-secondary mt-1">Select the teacher who will lead this webinar (optional)</p>
    </div>

    <div>
      <label className="block mb-1 font-semibold text-primary">Language</label>
      <select name="language" value={form.language} onChange={onChange}
        className="bg-white w-full border-slate-300 rounded-xl border-2 p-3 focus:border-primary focus:outline-none cursor-pointer">

        <option value="German">German</option>
        <option value="Spanish">Spanish</option>

      </select>
      <p className="text-xs text-text-secondary mt-1">Select the target language</p>
    </div>

    <div>
      <label className="block mb-1 font-semibold text-primary">Level</label>
      <select name="level" value={form.level} onChange={onChange}
        className="bg-white w-full border-slate-300 rounded-xl border-2 p-3 focus:border-primary focus:outline-none cursor-pointer">

        <option value="All levels">All levels</option>
        <option value="A1">A1</option>
        <option value="A2">A2</option>
        <option value="B1">B1</option>
        <option value="B2">B2</option>
        <option value="C1">C1</option>
        <option value="C2">C2</option>

      </select>
      <p className="text-xs text-text-secondary mt-1">Select the target language level</p>
    </div>

    {/* Syllabus Level .1 */}
    <div>
      <label className="block mb-1 font-semibold text-primary">Syllabus - Level .1</label>
      {form.syllabusLevel1?.map((item, idx) => (
        <div key={idx} className="flex flex-col sm:flex-row gap-2 mb-2">
          <input type="text" value={item.topic} onChange={(e) => onSyllabusChange("syllabusLevel1", idx, "topic", e.target.value)} placeholder={`Topic ${idx + 1} (e.g. Greetings & Basic Vocabulary)`}
            className="bg-white flex-1 border-slate-300 rounded-xl border-2 p-3 focus:border-primary focus:outline-none"/>

          <input type="datetime-local" value={item.date} onChange={(e) => onSyllabusChange("syllabusLevel1", idx, "date", e.target.value)}
            className="bg-white w-48 border-slate-300 rounded-xl border-2 p-3 focus:border-primary focus:outline-none cursor-pointer"/>

          <button type="button" onClick={() => onRemoveSyllabusField("syllabusLevel1", idx)} disabled={form.syllabusLevel1.length === 1}
            className="p-3 text-text-secondary hover:text-red-600 cursor-pointer transition-all duration-500">
            ✕
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onAddSyllabusField("syllabusLevel1")}
        className="text-primary hover:text-primary/80 transition-all duration-500 cursor-pointer text-sm font-medium mt-2 block">
        + Add Section to Level .1
      </button>
      <p className="text-xs text-text-secondary mt-1">Topics for the first part of the level (e.g. A1.1)</p>
    </div>

    {/* Syllabus Level .2 */}
    <div>
      <label className="block mb-1 font-semibold text-primary">Syllabus - Level .2</label>
      {form.syllabusLevel2?.map((item, idx) => (
        <div key={idx} className="flex flex-col sm:flex-row gap-2 mb-2">

          <input type="text" value={item.topic} onChange={(e) => onSyllabusChange("syllabusLevel2", idx, "topic", e.target.value)} placeholder={`Topic ${idx + 1} (e.g. Daily Routines & Shopping)`}
            className="bg-white flex-1 border-slate-300 rounded-xl border-2 p-3 focus:border-primary focus:outline-none"/>

          <input type="datetime-local" value={item.date} onChange={(e) => onSyllabusChange("syllabusLevel2", idx, "date", e.target.value)}
            className="bg-white w-48 border-slate-300 rounded-xl border-2 p-3 focus:border-primary focus:outline-none cursor-pointer"/>

          <button type="button" onClick={() => onRemoveSyllabusField("syllabusLevel2", idx)} disabled={form.syllabusLevel2.length === 1}
            className="p-3 text-text-secondary hover:text-red-600 cursor-pointer transition-all duration-500">
            ✕
          </button>

        </div>
      ))}
      <button type="button" onClick={() => onAddSyllabusField("syllabusLevel2")}
        className="text-primary hover:text-primary/80 transition-all duration-500 cursor-pointer text-sm font-medium mt-2 block">
        + Add Section to Level .2
      </button>
      <p className="text-xs text-text-secondary mt-1">Topics for the second part of the level (e.g. A1.2)</p>
    </div>

    {/* Has Exam */}
    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl border-2 border-slate-300">
      <input type="checkbox" name="hasExam" id="hasExam" checked={form.hasExam} onChange={onChange}
        className="w-4 h-4 text-primary border-slate-300 focus:ring-primary"/>
      <label htmlFor="hasExam" className="font-semibold text-primary">This webinar includes an exam / test</label>
    </div>

    <div className="flex gap-3">
      <button type="submit" className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/80 transition-all duration-500 cursor-pointer">
        {editId ? "Update Webinar" : "Create Webinar"}
      </button>

      {editId && (
        <button type="button" onClick={onCancelEdit}
          className="flex-1 bg-slate-300 text-text-secondary py-3 rounded-xl font-bold hover:bg-slate-400 transition-all duration-500 cursor-pointer">
          Cancel Edit
        </button>
      )}
    </div>

    {/* Form Tips */}
    <div className="bg-amber-50 border-amber-200 border-2 rounded-xl p-3 mt-4">
      <h4 className="font-semibold text-amber-800 mb-2">Tips:</h4>
      <ul className="text-sm text-amber-700 space-y-1">
        <li>• Make sure the meeting link is valid and accessible</li>
        <li>• Schedule the webinar at least 24 hours in advance</li>
        <li>• Use a descriptive title that clearly explains the topic</li>
        <li>• Thumbnail images should be 16:9 aspect ratio for best display</li>
        <li>• Choose the correct level to help students find relevant content</li>
        <li>• Fill both syllabus parts for clear progression (.1 and .2)</li>
      </ul>
    </div>
  </form>
);

export default WebinarForm;