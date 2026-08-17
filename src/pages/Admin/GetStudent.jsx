import axios from "../../utils/axios";
import React, { useEffect, useState } from "react";
import { Mail, Trash2, ChevronDown, Users, Check, Pencil, X } from "lucide-react";
import DashboardShell from "../../components/DashboardShell";
import { approveStudent, updateStudent } from "../../APIs/AdminStudents";

const toDateInputValue = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

const isPending = (s) => s?.isApproved === false || s?.status === "pending";

const fetchStudents = async () => {
  try {
    const response = await axios.get("/api/users/admin/students");
    return response.data.data || [];
  } catch (error) {
    console.error("Failed to fetch students:", error);
    alert("Failed to fetch students");
    return [];
  }
};

const defaultEmailForm = {
  subject: "",
  content: "",
  ctaText: "",
  ctaLink: "",
  bannerUrl: "",
};

const GetStudent = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailResult, setEmailResult] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailForm, setEmailForm] = useState(defaultEmailForm);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStudents()
      .then((data) => {
        setStudents(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load students.");
        setLoading(false);
      });
  }, []);

  // Stats
  const totalCount = students.length;
  const paidCount = students.filter((s) => s.paid).length;
  const unpaidCount = totalCount - paidCount;
  const totalEnrollments = students.reduce((sum, s) => sum + (s.enrolledCount || 0), 0);

  const handleSendBulkEmail = async (e) => {
    e.preventDefault();
    setEmailResult("");
    setEmailLoading(true);
    try {
      const res = await axios.post("/api/emails/marketing", emailForm);
      setEmailResult(res.data.message || "Emails sent successfully!");
      setShowEmailForm(false);
      setEmailForm(defaultEmailForm);
    } catch (err) {
      setEmailResult(
        err?.response?.data?.message || "Failed to send emails. Please try again."
      );
    } finally {
      setEmailLoading(false);
    }
  };

  const handleEmailInputChange = (e) => {
    const { name, value } = e.target;
    setEmailForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeleteStudent = async (student) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${student.name}?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setDeleteLoading(student._id);

    try {
      const response = await axios.delete(
        `/api/users/students/${student.student_Userid._id}`
      );

      if (response.data.success) {
        setStudents((prev) => prev.filter((s) => s._id !== student._id));
        alert(response.data.message || "Student deleted successfully!");
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.message || "Failed to delete student. Please try again.";
      alert(errorMessage);
      console.error("Delete error:", err);
    } finally {
      setDeleteLoading(null);
    }
  };

  const toggleExpandStudent = (studentId) => {
    setExpandedStudent(expandedStudent === studentId ? null : studentId);
  };

  const handleApproveStudent = async (student) => {
    setApprovingId(student._id);
    try {
      await approveStudent(student._id);
      setStudents((prev) =>
        prev.map((s) =>
          s._id === student._id ? { ...s, isApproved: true, status: "active" } : s
        )
      );
    } catch (err) {
      const errorMessage = err?.response?.data?.message || "Failed to approve student. Please try again.";
      alert(errorMessage);
      console.error("Approve error:", err);
    } finally {
      setApprovingId(null);
    }
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setEditForm({
      name: student.name || "",
      email: student.student_Userid?.email || "",
      phone: student.phone || "",
      gender: student.gender || "",
      country: student.country || "",
      dateOfBirth: toDateInputValue(student.dateOfBirth),
      referral: student.referral || "",
      paid: !!student.paid,
    });
  };

  const closeEditModal = () => {
    if (saving) return;
    setEditingStudent(null);
    setEditForm(null);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingStudent || !editForm) return;
    setSaving(true);
    try {
      const payload = {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        gender: editForm.gender,
        country: editForm.country,
        dateOfBirth: editForm.dateOfBirth,
        referral: editForm.referral,
        paid: editForm.paid,
      };
      await updateStudent(editingStudent._id, payload);
      setStudents((prev) =>
        prev.map((s) =>
          s._id === editingStudent._id
            ? {
                ...s,
                ...payload,
                student_Userid: { ...s.student_Userid, email: editForm.email },
              }
            : s
        )
      );
      setEditingStudent(null);
      setEditForm(null);
    } catch (err) {
      const errorMessage = err?.response?.data?.message || "Failed to update student. Please try again.";
      alert(errorMessage);
      console.error("Update error:", err);
    } finally {
      setSaving(false);
    }
  };

  const stats = [
    { value: totalCount, label: "Total students" },
    { value: paidCount, label: "Paid" },
    { value: unpaidCount, label: "Unpaid" },
    { value: totalEnrollments, label: "Total enrollments" },
  ];

  return (
    <DashboardShell
      role="admin"
      eyebrow="Admin · Students"
      title={<>All <span className="ex-g">students</span></>}
      lead="Everyone enrolled across Exzellent, with their status and courses — in one place."
      actions={
        <button onClick={() => setShowEmailForm((v) => !v)} className="ex-btn ex-btn-primary">
          <Mail size={16} />
          {showEmailForm ? "Close campaign" : "Email all students"}
        </button>
      }
    >
      {/* Stats */}
      <div className="ex-stats ex-reveal">
        {stats.map((s) => (
          <div key={s.label} className="ex-stat">
            <b>{s.value}</b>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Bulk email form */}
      {showEmailForm && (
        <form onSubmit={handleSendBulkEmail} className="ex-card ex-reveal" style={{ marginBottom: 28 }}>
          <div className="grid gap-4">
            <div>
              <label className="ex-label">Subject</label>
              <input type="text" name="subject" value={emailForm.subject} onChange={handleEmailInputChange} required className="ex-input" placeholder="Email subject" />
            </div>
            <div>
              <label className="ex-label">Content (HTML allowed)</label>
              <textarea name="content" value={emailForm.content} onChange={handleEmailInputChange} required rows={4} className="ex-input" placeholder="Email content" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="ex-label">CTA button text</label>
                <input type="text" name="ctaText" value={emailForm.ctaText} onChange={handleEmailInputChange} className="ex-input" />
              </div>
              <div>
                <label className="ex-label">CTA button link</label>
                <input type="url" name="ctaLink" value={emailForm.ctaLink} onChange={handleEmailInputChange} className="ex-input" />
              </div>
            </div>
            <div>
              <label className="ex-label">Banner image URL</label>
              <input type="url" name="bannerUrl" value={emailForm.bannerUrl} onChange={handleEmailInputChange} className="ex-input" />
            </div>
            <button type="submit" disabled={emailLoading} className="ex-btn ex-btn-primary w-full">
              {emailLoading ? <><span className="ex-spinner" /> Sending…</> : "Send email campaign"}
            </button>
          </div>
        </form>
      )}

      {emailResult && (
        <div style={{ marginBottom: 24 }}>
          <span className={`ex-badge ${emailResult.toLowerCase().includes("fail") ? "ex-badge-warn" : "ex-badge-ok"}`}>
            {emailResult}
          </span>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center items-center py-20 gap-4">
          <span className="ex-spinner" />
          <span className="ex-lead">Loading students…</span>
        </div>
      ) : error ? (
        <p className="ex-lead" style={{ textAlign: "center", color: "#fca5a5" }}>{error}</p>
      ) : students.length === 0 ? (
        <div className="ex-card" style={{ textAlign: "center" }}>
          <Users size={28} style={{ margin: "0 auto 10px", opacity: .5 }} />
          <p className="ex-lead" style={{ margin: "0 auto" }}>No students found.</p>
        </div>
      ) : (
        <>
          {/* Card view (small screens) */}
          <div className="block lg:hidden space-y-4">
            {students.map((student) => (
              <div key={student._id} className="ex-card ex-card-hover ex-reveal">
                <div className="flex justify-between items-start gap-3 mb-4">
                  <div>
                    <h3 style={{ fontFamily: "var(--ex-font)", fontWeight: 700, fontSize: "1.05rem" }}>{student.name || "-"}</h3>
                    <p className="ex-lead" style={{ fontSize: ".85rem", wordBreak: "break-all" }}>{student.student_Userid?.email || "-"}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`ex-badge ${student.paid ? "ex-badge-ok" : "ex-badge-warn"}`}>{student.paid ? "Paid" : "Unpaid"}</span>
                    {isPending(student) && <span className="ex-badge ex-badge-warn">Pending</span>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3" style={{ fontSize: ".85rem" }}>
                  {[["Phone", student.phone], ["Gender", student.gender],
                    ["DOB", student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : "-"],
                    ["Referral", student.referral]].map(([k, v]) => (
                    <div key={k}>
                      <span className="ex-label" style={{ marginBottom: 2 }}>{k}</span>
                      <p style={{ color: "var(--ex-text)" }}>{v || "-"}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <span className="ex-label" style={{ margin: 0 }}>User type:</span>
                  <span className="ex-badge ex-badge-accent">{student.student_Userid?.userType || "Student"}</span>
                </div>

                {student.enrolledCourses && student.enrolledCourses.length > 0 ? (
                  <div className="mt-3">
                    <button type="button" onClick={() => toggleExpandStudent(student._id)} className="flex items-center gap-1" style={{ color: "var(--pL)", fontWeight: 600, fontSize: ".85rem" }}>
                      <span>Enrolled courses ({student.enrolledCount})</span>
                      <ChevronDown size={16} style={{ transition: "transform .3s", transform: expandedStudent === student._id ? "rotate(180deg)" : "none" }} />
                    </button>
                    {expandedStudent === student._id && (
                      <div className="mt-2 space-y-2">
                        {student.enrolledCourses.map((course, idx) => (
                          <div key={idx} className="flex items-center justify-between" style={{ fontSize: ".78rem", background: "rgba(var(--pRGB),.12)", border: "1px solid var(--ex-line)", padding: "8px 12px", borderRadius: 10 }}>
                            <span className="truncate flex-1">{course.title}</span>
                            {course.progress === 100 && <span style={{ color: "#6ee7b7", fontWeight: 700, marginLeft: 8, whiteSpace: "nowrap" }}>✓ Done</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="ex-lead" style={{ fontStyle: "italic", fontSize: ".82rem", marginTop: 12 }}>Not enrolled in any course</p>
                )}

                <div className="flex flex-wrap gap-2 mt-4">
                  {isPending(student) && (
                    <button onClick={() => handleApproveStudent(student)} disabled={approvingId === student._id} className="ex-btn ex-btn-primary flex-1">
                      {approvingId === student._id ? <><span className="ex-spinner" /> Approving…</> : <><Check size={15} /> Approve</>}
                    </button>
                  )}
                  <button onClick={() => openEditModal(student)} className="ex-btn ex-btn-ghost flex-1">
                    <Pencil size={15} /> Edit
                  </button>
                  <button onClick={() => handleDeleteStudent(student)} disabled={deleteLoading === student._id} className="ex-btn ex-btn-danger flex-1">
                    {deleteLoading === student._id ? <><span className="ex-spinner" /> Deleting…</> : <><Trash2 size={15} /> Delete</>}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Table view (large screens) */}
          <div className="hidden lg:block ex-table-wrap ex-reveal">
            <div className="overflow-x-auto">
              <table className="ex-table">
                <thead>
                  <tr>
                    {["Name", "Email", "Phone", "Gender", "Status", "DOB", "Referral", "Courses", ""].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id}>
                      <td style={{ fontWeight: 600 }}>{student.name || "-"}</td>
                      <td className="max-w-[200px] truncate" title={student.student_Userid?.email}>{student.student_Userid?.email || "-"}</td>
                      <td>{student.phone || "-"}</td>
                      <td>{student.gender || "-"}</td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          <span className={`ex-badge ${student.paid ? "ex-badge-ok" : "ex-badge-warn"}`}>{student.paid ? "Paid" : "Unpaid"}</span>
                          {isPending(student) && <span className="ex-badge ex-badge-warn">Pending</span>}
                        </div>
                      </td>
                      <td>{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : "-"}</td>
                      <td>{student.referral || "-"}</td>
                      <td>
                        {student.enrolledCourses && student.enrolledCourses.length > 0 ? (
                          <div className="max-w-[200px]">
                            <button type="button" onClick={() => toggleExpandStudent(student._id)} className="flex items-center gap-1" style={{ color: "var(--pL)", fontWeight: 600 }}>
                              <span>{student.enrolledCount} course{student.enrolledCount > 1 ? "s" : ""}</span>
                              <ChevronDown size={14} style={{ transition: "transform .3s", transform: expandedStudent === student._id ? "rotate(180deg)" : "none" }} />
                            </button>
                            {expandedStudent === student._id && (
                              <div className="mt-2 space-y-1">
                                {student.enrolledCourses.map((course, idx) => (
                                  <div key={idx} className="truncate" title={course.title} style={{ fontSize: ".76rem", background: "rgba(var(--pRGB),.12)", border: "1px solid var(--ex-line)", padding: "4px 8px", borderRadius: 8 }}>{course.title}</div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="ex-lead" style={{ fontStyle: "italic", fontSize: ".82rem" }}>None</span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {isPending(student) && (
                            <button onClick={() => handleApproveStudent(student)} disabled={approvingId === student._id} className="ex-btn ex-btn-primary" style={{ padding: "8px 12px", fontSize: ".8rem" }} title="Approve student">
                              {approvingId === student._id ? <span className="ex-spinner" /> : <><Check size={14} /> Approve</>}
                            </button>
                          )}
                          <button onClick={() => openEditModal(student)} className="ex-btn ex-btn-ghost" style={{ padding: "8px 12px", fontSize: ".8rem" }} title="Edit student">
                            <Pencil size={14} /> Edit
                          </button>
                          <button onClick={() => handleDeleteStudent(student)} disabled={deleteLoading === student._id} className="ex-btn ex-btn-danger" style={{ padding: "8px 12px", fontSize: ".8rem" }}>
                            {deleteLoading === student._id ? <span className="ex-spinner" /> : <><Trash2 size={14} /> Delete</>}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Edit student modal */}
      {editingStudent && editForm && (
        <div
          onClick={closeEditModal}
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
            style={{ width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", position: "relative" }}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 style={{ fontFamily: "var(--ex-font)", fontWeight: 700, fontSize: "1.15rem" }}>Edit student</h3>
              <button type="button" onClick={closeEditModal} aria-label="Close" style={{ color: "var(--ex-muted)", lineHeight: 0 }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="grid gap-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="ex-label">Name</label>
                  <input type="text" name="name" value={editForm.name} onChange={handleEditChange} className="ex-input" placeholder="Full name" />
                </div>
                <div>
                  <label className="ex-label">Email</label>
                  <input type="text" name="email" value={editForm.email} onChange={handleEditChange} className="ex-input" placeholder="student@example.com" />
                </div>
                <div>
                  <label className="ex-label">Phone</label>
                  <input type="text" name="phone" value={editForm.phone} onChange={handleEditChange} className="ex-input" placeholder="Phone number" />
                </div>
                <div>
                  <label className="ex-label">Gender</label>
                  <select name="gender" value={editForm.gender} onChange={handleEditChange} className="ex-input">
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="ex-label">Country</label>
                  <input type="text" name="country" value={editForm.country} onChange={handleEditChange} className="ex-input" placeholder="Country" />
                </div>
                <div>
                  <label className="ex-label">Date of birth</label>
                  <input type="date" name="dateOfBirth" value={editForm.dateOfBirth} onChange={handleEditChange} className="ex-input" />
                </div>
                <div>
                  <label className="ex-label">Referral</label>
                  <input type="text" name="referral" value={editForm.referral} onChange={handleEditChange} className="ex-input" placeholder="Referral" />
                </div>
              </div>

              <label className="flex items-center gap-3" style={{ cursor: "pointer" }}>
                <input type="checkbox" name="paid" checked={editForm.paid} onChange={handleEditChange} className="h-5 w-5 accent-secondary" />
                <span className="ex-label" style={{ margin: 0 }}>Paid</span>
              </label>

              <div className="flex gap-3 mt-2">
                <button type="button" onClick={closeEditModal} disabled={saving} className="ex-btn ex-btn-ghost flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="ex-btn ex-btn-primary flex-1">
                  {saving ? <><span className="ex-spinner" /> Saving…</> : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
};

export default GetStudent;
