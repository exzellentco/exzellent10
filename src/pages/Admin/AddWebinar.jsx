import React, { useState, useEffect } from "react";
import { DateTime } from "luxon";
import Swal from "sweetalert2";
import WebinarForm from "../../components/WebinarComponents/WebinarForm";
import WebinarList from "../../components/WebinarComponents/WebinarList";
import {
  fetchWebinars,
  createWebinar,
  updateWebinar,
  deleteWebinar,
  sendWebinarInvites,
} from "../../APIs/AdminWebinar";
import { fetchTeacherProfile } from "../../APIs/AdminAddTechers";
import DashboardShell from "../../components/DashboardShell";

const initialForm = {
  title: "",
  description: "",
  scheduledAt: "",
  endsAt: "",
  platform: "",
  meetingLink: "",
  thumbnail: "",
  instructorId: "",
  isPublic: true,
  language: "German",
  level: "All levels",
  hasExam: false,
  syllabusLevel1: [],
  syllabusLevel2: [],
};

const AddWebinar = () => {
  const [webinars, setWebinars] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    loadWebinars();
    loadTeachers();
  }, []);

  const loadWebinars = async () => {
    try {
      setLoading(true);
      const data = await fetchWebinars();
      setWebinars(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load webinars");
    } finally {
      setLoading(false);
    }
  };

  const loadTeachers = async () => {
    try {
      const teachersList = await fetchTeacherProfile();
      setTeachers(Array.isArray(teachersList) ? teachersList : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load teachers list");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (error) setError("");
  };

  const handleSyllabusChange = (level, index, field, value) => {
    setForm((prev) => {
      const newArray = [...prev[level]];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [level]: newArray };
    });
  };

  const addSyllabusField = (level) => {
    setForm((prev) => ({
      ...prev,
      [level]: [...prev[level], { topic: "", date: "" }],
    }));
  };

  const removeSyllabusField = (level, index) => {
    setForm((prev) => ({
      ...prev,
      [level]: prev[level].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !form.title ||
      !form.description ||
      !form.scheduledAt ||
      !form.endsAt ||
      !form.platform ||
      !form.meetingLink
    ) {
      setError("Please fill in all required fields");
      return;
    }

    if (DateTime.fromISO(form.endsAt) <= DateTime.fromISO(form.scheduledAt)) {
      setError("End time must be after the start time");
      return;
    }

    const cleanSyllabus = (arr) =>
      arr
        .filter((item) => item.topic?.trim())
        .map((item) => ({
          topic: item.topic.trim(),
          date: item.date
            ? DateTime.fromISO(item.date, { zone: "Europe/Berlin" })
                .toUTC()
                .toISO()
            : null,
        }));

    const formDataToSend = {
      ...form,
      instructors: form.instructorId ? [form.instructorId] : [],
      thumbnail: form.thumbnail || null,
      scheduledAt: DateTime.fromISO(form.scheduledAt, { zone: "Europe/Berlin" })
        .toUTC()
        .toISO(),
      endsAt: DateTime.fromISO(form.endsAt, { zone: "Europe/Berlin" })
        .toUTC()
        .toISO(),
      syllabusLevel1: cleanSyllabus(form.syllabusLevel1),
      syllabusLevel2: cleanSyllabus(form.syllabusLevel2),
      hasExam: !!form.hasExam,
    };
    delete formDataToSend.instructorId;

    try {
      if (editId) {
        await updateWebinar(editId, formDataToSend);
        setEditId(null);
        Swal.fire({
          icon: "success",
          title: "Webinar Updated!",
          theme: 'dark',
          text: "The webinar has been updated successfully.",
          timer: 2500,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
      } else {
        await createWebinar(formDataToSend);
        Swal.fire({
          icon: "success",
          title: "Webinar Created!",
          theme: 'dark',
          text: "The new webinar is now live.",
          timer: 2500,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
      }
      setForm(initialForm);
      loadWebinars();
    } catch (err) {
      setError(err.message || "Failed to save webinar");
    }
  };

  const handleEdit = (webinar) => {
    setEditId(webinar._id);
    const selectedInstructorId = webinar.instructors?.[0]?._id || "";

    const formatForInput = (iso) =>
      iso
        ? DateTime.fromISO(iso, { zone: "Europe/Berlin" })
            .toISO({ suppressMilliseconds: true, includeOffset: false })
            .slice(0, 16)
        : "";

    setForm({
      title: webinar.title || "",
      description: webinar.description || "",
      scheduledAt: formatForInput(webinar.scheduledAt),
      endsAt: formatForInput(webinar.endsAt),
      platform: webinar.platform || "",
      meetingLink: webinar.meetingLink || "",
      thumbnail: webinar.thumbnail || "",
      instructorId: selectedInstructorId,
      isPublic: webinar.isPublic !== undefined ? webinar.isPublic : true,
      language: webinar.language || "German",
      level: webinar.level || "All levels",
      hasExam: !!webinar.hasExam,
      syllabusLevel1:
        webinar.syllabusLevel1?.map((item) => ({
          topic: item.topic || "",
          date: formatForInput(item.date),
        })) || [],
      syllabusLevel2:
        webinar.syllabusLevel2?.map((item) => ({
          topic: item.topic || "",
          date: formatForInput(item.date),
        })) || [],
    });

    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setForm(initialForm);
    setError("");
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Delete Webinar?",
      theme: 'dark',
      text: "This action cannot be undone.",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#e53e3e",
    });

    if (!confirm.isConfirmed) return;

    setError("");
    try {
      await deleteWebinar(id);
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        theme: 'dark',
        text: "The webinar has been removed.",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
      loadWebinars();
    } catch (err) {
      setError(err.message || "Failed to delete webinar");
    }
  };

  const handleSendInvites = async (id) => {
    setError("");
    try {
      const res = await sendWebinarInvites(id);
      Swal.fire({
        icon: "success",
        title: "Invites Sent!",
        theme: 'dark',
        text: res.message || "Invites sent successfully!",
        timer: 2500,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
    } catch (err) {
      setError(err.message || "Failed to send webinar invites");
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "Not scheduled";
    try {
      return DateTime.fromISO(isoString, {
        zone: "Europe/Berlin",
      }).toLocaleString(DateTime.DATETIME_MED);
    } catch {
      return "Invalid date";
    }
  };

  return (
    <DashboardShell
      role="admin"
      eyebrow="Admin · Webinars"
      title={editId ? <>Edit <span className="ex-g">webinar</span></> : <>Add a <span className="ex-g">webinar</span></>}
      lead="Schedule webinars, assign instructors and send invites."
    >
      {error && (
        <div style={{ marginBottom: 20 }}>
          <span className="ex-badge ex-badge-warn"><strong>Error:</strong>&nbsp;{error}</span>
        </div>
      )}

      <WebinarForm
        form={form}
        editId={editId}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancelEdit={handleCancelEdit}
        onSyllabusChange={handleSyllabusChange}
        onAddSyllabusField={addSyllabusField}
        onRemoveSyllabusField={removeSyllabusField}
        teachers={teachers}
      />

      <WebinarList
        webinars={webinars}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        formatDate={formatDate}
        handleSendInvites={handleSendInvites}
      />
    </DashboardShell>
  );
};

export default AddWebinar;
