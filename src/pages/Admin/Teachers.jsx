import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Info, Trash2, Check, Pencil, X } from "lucide-react";
import { fetchTeacherProfile, approveTeacher, deleteTeacher, updateTeacherProfile } from "../../APIs/AdminAddTechers";
import DashboardShell from "../../components/DashboardShell";

const Teachers = ({ isTeachersPageLoading, setTeachersPageLoading }) => {
  const [teachers, setTeachers] = useState([]);
  const [loadingApprove, setLoadingApprove] = useState({});
  const [loadingDelete, setLoadingDelete] = useState({});
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    countryOfResidence: "",
    yearsExperience: "",
    taughtLanguages: "",
    bio: "",
    isApproved: false,
  });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const languagesToText = (langs) =>
    Array.isArray(langs)
      ? langs
          .map((l) => (typeof l === "string" ? l : l?.language || l?.name || ""))
          .filter(Boolean)
          .join(", ")
      : "";

  const openEdit = (teacher) => {
    setEditing(teacher);
    setForm({
      name: teacher.name || "",
      email: teacher.email || "",
      countryOfResidence: teacher.countryOfResidence || "",
      yearsExperience: teacher.yearsExperience ?? "",
      taughtLanguages: languagesToText(teacher.taughtLanguages),
      bio: teacher.bio || "",
      isApproved: teacher.isApproved || false,
    });
  };

  const closeEdit = () => {
    if (saving) return;
    setEditing(null);
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!editing) return;

    const payload = {
      name: form.name,
      email: form.email,
      countryOfResidence: form.countryOfResidence,
      yearsExperience: Number(form.yearsExperience) || 0,
      taughtLanguages: form.taughtLanguages
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      bio: form.bio,
      isApproved: form.isApproved,
    };

    setSaving(true);

    try {
      await updateTeacherProfile(editing.userId, payload);

      setTeachers((prev) =>
        prev.map((t) => (t.userId === editing.userId ? { ...t, ...payload } : t))
      );

      setEditing(null);
    } catch (error) {
      alert(error.response?.data?.message || error.message || "Failed to update teacher");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const data = await fetchTeacherProfile();
        setTeachers(data || []);
      } catch (error) {
        console.error("Failed to fetch teachers:", error);
      } finally {
        setTeachersPageLoading(false);
      }
    };

    loadTeachers();
  }, []);

  const handleApprove = async (userId) => {
    const teacher = teachers.find((t) => t.userId === userId);
    if (!teacher) {
      alert("Teacher not found in list");
      return;
    }

    if (!userId) {
      alert("Error: User ID not found");
      return;
    }

    setLoadingApprove((prev) => ({ ...prev, [userId]: true }));

    try {
      await approveTeacher(userId);

      setTeachers((prev) =>
        prev.map((t) =>
          t.userId === userId
            ? { ...t, isApproved: true }
            : t
        )
      );

      alert("Teacher approved successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to approve teacher");
    } finally {
      setLoadingApprove((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleDelete = async (userId) => {
    if (!userId) {
      alert("Cannot delete: User ID is missing");
      return;
    }

    const teacher = teachers.find((t) => t.userId === userId);
    if (!teacher) {
      alert("Teacher not found");
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${teacher.name || "this teacher"}? This will also delete their login account and cannot be undone.`
    );

    if (!confirmDelete) return;

    setLoadingDelete((prev) => ({ ...prev, [userId]: true }));

    try {
      await deleteTeacher(userId);

      setTeachers((prev) => prev.filter((t) => t.userId !== userId));

      alert("Teacher deleted successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete teacher");
    } finally {
      setLoadingDelete((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleMoreInfo = (userId) => {
    navigate(`/teacher/${userId}`);
  };

  if (isTeachersPageLoading) {
    return (
      <DashboardShell role="admin" eyebrow="Admin · Teachers" title={<>All <span className="ex-g">teachers</span></>}>
        <div className="flex justify-center items-center py-20 gap-4">
          <span className="ex-spinner" />
          <span className="ex-lead">Loading teachers…</span>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      role="admin"
      eyebrow="Admin · Teachers"
      title={<>All <span className="ex-g">teachers</span></>}
      lead="Review, admit and manage the people teaching on Exzellent."
      actions={
        <button onClick={() => navigate("/add-teacher", { state: { mode: "admin" } })} className="ex-btn ex-btn-primary">
          <UserPlus size={16} /> Create teacher
        </button>
      }
    >
      {teachers.length === 0 ? (
        <div className="ex-card" style={{ textAlign: "center" }}>
          <p className="ex-lead" style={{ margin: "0 auto" }}>No teachers found.</p>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher, index) => {
            const isApproved = teacher.isApproved || false;
            const displayId = teacher.userId || `teacher-${index}`;

            return (
              <div key={displayId} className="ex-card ex-card-hover ex-reveal" style={{ position: "relative", overflow: "hidden" }}>
                <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "var(--ex-grad)" }} />

                <div className="flex flex-col items-center text-center">
                  <div style={{ width: 104, height: 104, borderRadius: "50%", overflow: "hidden", border: "2px solid var(--ex-line)", marginBottom: 14 }}>
                    <img
                      src={teacher.profileImage || "https://res.cloudinary.com/dsgxyezcm/image/upload/v1767878441/Anonymous_b5hlab.jpg"}
                      className="w-full h-full object-cover"
                      alt={teacher.name || "Teacher"}
                    />
                  </div>
                  <h3 style={{ fontFamily: "var(--ex-font)", fontWeight: 700, fontSize: "1.25rem" }}>{teacher.name || "Unnamed"}</h3>
                  <p className="ex-lead" style={{ fontSize: ".88rem", marginTop: 2 }}>
                    {teacher.countryOfResidence || "Remote"} • {teacher.yearsExperience || "N/A"}+ years
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {teacher.taughtLanguages?.map((lang, i) => (
                      <span key={i} className="ex-badge ex-badge-accent">
                        {lang.language} ({lang.cefr_level || "N/A"})
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  {isApproved ? (
                    <div className="ex-badge ex-badge-ok" style={{ flex: 1, justifyContent: "center", padding: "10px" }}>
                      <Check size={15} /> Approved
                    </div>
                  ) : (
                    <button onClick={() => handleApprove(teacher.userId)} disabled={loadingApprove[teacher.userId]} className="ex-btn ex-btn-primary" style={{ flex: 1 }}>
                      {loadingApprove[teacher.userId] ? <span className="ex-spinner" /> : "Admit"}
                    </button>
                  )}

                  <button onClick={() => handleMoreInfo(teacher.userId)} className="ex-btn ex-btn-ghost" style={{ flex: 1 }}>
                    <Info size={15} /> Info
                  </button>

                  <button onClick={() => openEdit(teacher)} className="ex-btn ex-btn-ghost" title="Edit teacher">
                    <Pencil size={15} />
                  </button>

                  <button onClick={() => handleDelete(teacher.userId)} disabled={loadingDelete[teacher.userId]} className="ex-btn ex-btn-danger">
                    {loadingDelete[teacher.userId] ? <span className="ex-spinner" /> : <Trash2 size={15} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <div
          onClick={closeEdit}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.65)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            overflowY: "auto",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="ex-card"
            style={{ position: "relative", width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}
          >
            <button
              onClick={closeEdit}
              className="ex-btn ex-btn-ghost"
              title="Close"
              style={{ position: "absolute", top: 12, right: 12, padding: 8 }}
            >
              <X size={16} />
            </button>

            <h3 style={{ fontFamily: "var(--ex-font)", fontWeight: 700, fontSize: "1.25rem", marginBottom: 18, paddingRight: 32 }}>
              Edit <span className="ex-g">teacher</span>
            </h3>

            <div className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="edit-name" className="block text-sm font-medium text-text-secondary">Name</label>
                <input
                  id="edit-name"
                  type="text"
                  className="ex-input"
                  value={form.name}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="edit-email" className="block text-sm font-medium text-text-secondary">Email</label>
                <input
                  id="edit-email"
                  type="text"
                  className="ex-input"
                  value={form.email}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="edit-country" className="block text-sm font-medium text-text-secondary">Country of residence</label>
                <input
                  id="edit-country"
                  type="text"
                  className="ex-input"
                  value={form.countryOfResidence}
                  onChange={(e) => handleFormChange("countryOfResidence", e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="edit-years" className="block text-sm font-medium text-text-secondary">Years experience</label>
                <input
                  id="edit-years"
                  type="number"
                  className="ex-input"
                  value={form.yearsExperience}
                  onChange={(e) => handleFormChange("yearsExperience", e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="edit-languages" className="block text-sm font-medium text-text-secondary">Taught languages (comma separated)</label>
                <input
                  id="edit-languages"
                  type="text"
                  className="ex-input"
                  placeholder="German, Spanish"
                  value={form.taughtLanguages}
                  onChange={(e) => handleFormChange("taughtLanguages", e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="edit-bio" className="block text-sm font-medium text-text-secondary">Bio</label>
                <textarea
                  id="edit-bio"
                  className="ex-input"
                  rows={4}
                  value={form.bio}
                  onChange={(e) => handleFormChange("bio", e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl" style={{ border: "1px solid var(--ex-line)", background: "rgba(255,255,255,.03)" }}>
                <label htmlFor="edit-approved" className="text-sm font-medium cursor-pointer" style={{ color: "var(--ex-muted)" }}>Approved</label>
                <input
                  id="edit-approved"
                  type="checkbox"
                  checked={form.isApproved}
                  onChange={(e) => handleFormChange("isApproved", e.target.checked)}
                  style={{ width: 18, height: 18, cursor: "pointer" }}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={handleSave} disabled={saving} className="ex-btn ex-btn-primary" style={{ flex: 1 }}>
                {saving ? <span className="ex-spinner" /> : "Save changes"}
              </button>
              <button onClick={closeEdit} disabled={saving} className="ex-btn ex-btn-ghost" style={{ flex: 1 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
};

export default Teachers;
