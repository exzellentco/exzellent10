import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Added
import { Plus, X, RefreshCw, Pencil, Trash2, Users } from "lucide-react";
import {
  createJob,
  getAllcareers,
  updateJob,
  deleteJob,
} from "../../APIs/AdminAddJobs";
import DashboardShell from "../../components/DashboardShell";

const initialState = {
  jobTitle: "",
  department: "",
  location: "",
  jobType: "Full-time",
  salary: "",
  jobDescription: "",
  keyResponsibilities: [""],
  requirements: [""],
  isActive: true,
};

const jobTypes = ["Full-time", "Part-time", "Internship", "Contract"];

const AddJobs = () => {
  const navigate = useNavigate(); // ✅ Added
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [fetchingJobs, setFetchingJobs] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [jobs, setJobs] = useState([]);
  const [editId, setEditId] = useState(null);

  // Fetch all jobs on mount
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setFetchingJobs(true);
    try {
      const response = await getAllcareers();
      console.log("API Response:", response);

      let jobsData = [];
      if (Array.isArray(response)) {
        jobsData = response;
      } else if (response && Array.isArray(response.data)) {
        jobsData = response.data;
      } else if (response && Array.isArray(response.careers)) {
        jobsData = response.careers;
      } else if (response && Array.isArray(response.jobs)) {
        jobsData = response.jobs;
      }

      setJobs(jobsData);
      setErrorMsg("");
    } catch (err) {
      console.error("Fetch jobs error:", err);
      setErrorMsg(
        `Failed to fetch jobs: ${err.response?.data?.message || err.message}`
      );
      setJobs([]);
    } finally {
      setFetchingJobs(false);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle array fields (Key Responsibilities & Requirements)
  const handleArrayChange = (field, idx, value) => {
    setForm((prev) => {
      const arr = [...prev[field]];
      arr[idx] = value;
      return { ...prev, [field]: arr };
    });
  };

  const addArrayField = (field) => {
    setForm((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeArrayField = (field, idx) => {
    setForm((prev) => {
      const arr = [...prev[field]];
      arr.splice(idx, 1);
      return { ...prev, [field]: arr.length ? arr : [""] };
    });
  };

  // Handle form submit (add or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    // Filter out empty strings from arrays
    const cleanForm = {
      ...form,
      keyResponsibilities: form.keyResponsibilities.filter(
        (item) => item.trim() !== ""
      ),
      requirements: form.requirements.filter((item) => item.trim() !== ""),
    };

    try {
      if (editId) {
        await updateJob(editId, cleanForm);
        setSuccessMsg("Job updated successfully!");
      } else {
        await createJob(cleanForm);
        setSuccessMsg("Job added successfully!");
      }
      setForm(initialState);
      setEditId(null);
      fetchJobs(); // Refresh the list
    } catch (err) {
      console.error("Submit error:", err);
      setErrorMsg(
        err?.response?.data?.message ||
          `Failed to ${editId ? "update" : "create"} job. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (job) => {
    setForm({
      jobTitle: job.jobTitle || "",
      department: job.department || "",
      location: job.location || "",
      jobType: job.jobType || "Full-time",
      salary: job.salary || "",
      jobDescription: job.jobDescription || "",
      keyResponsibilities: job.keyResponsibilities?.length
        ? job.keyResponsibilities
        : [""],
      requirements: job.requirements?.length ? job.requirements : [""],
      isActive: job.isActive !== undefined ? job.isActive : true,
    });
    setEditId(job._id);
    setSuccessMsg("");
    setErrorMsg("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;

    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      await deleteJob(id);
      setSuccessMsg("Job deleted successfully!");
      fetchJobs();

      if (editId === id) {
        setForm(initialState);
        setEditId(null);
      }
    } catch (err) {
      console.error("Delete error:", err);
      setErrorMsg(
        err?.response?.data?.message || "Failed to delete job. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setForm(initialState);
    setEditId(null);
    setSuccessMsg("");
    setErrorMsg("");
  };

  const handleViewApplicants = (jobId) => {
    navigate(`/admin/jobs/${jobId}/applicants`);
  };

  return (
    <DashboardShell
      role="admin"
      eyebrow="Admin · Jobs"
      title={editId ? <>Edit <span className="ex-g">job</span></> : <>Add a <span className="ex-g">job listing</span></>}
      lead="Post open roles and manage applicants."
    >
      {/* Form */}
      <form onSubmit={handleSubmit} className="ex-card ex-reveal grid gap-5" style={{ marginBottom: 32 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="ex-label">Job title *</label>
            <input type="text" name="jobTitle" value={form.jobTitle} onChange={handleChange} required placeholder="e.g. Software Developer" className="ex-input" />
          </div>
          <div>
            <label className="ex-label">Department *</label>
            <input type="text" name="department" value={form.department} onChange={handleChange} required placeholder="e.g. Engineering" className="ex-input" />
          </div>
          <div>
            <label className="ex-label">Location *</label>
            <input type="text" name="location" value={form.location} onChange={handleChange} required placeholder="e.g. Remote, Berlin, Germany" className="ex-input" />
          </div>
          <div>
            <label className="ex-label">Job type *</label>
            <select name="jobType" value={form.jobType} onChange={handleChange} required className="ex-input">
              {jobTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div>
            <label className="ex-label">Salary *</label>
            <input type="text" name="salary" value={form.salary} onChange={handleChange} required placeholder="e.g. €50,000 - €70,000 per year" className="ex-input" />
          </div>
        </div>

        <div>
          <label className="ex-label">Job description *</label>
          <textarea name="jobDescription" value={form.jobDescription} onChange={handleChange} required rows={4} placeholder="Describe the job role…" className="ex-input" />
        </div>

        {/* Key Responsibilities */}
        <div>
          <label className="ex-label">Key responsibilities *</label>
          {form.keyResponsibilities.map((item, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input type="text" value={item} onChange={(e) => handleArrayChange("keyResponsibilities", idx, e.target.value)} required placeholder={`Responsibility ${idx + 1}`} className="ex-input flex-1" />
              <button type="button" onClick={() => removeArrayField("keyResponsibilities", idx)} disabled={form.keyResponsibilities.length === 1} className="ex-btn ex-btn-ghost" style={{ padding: "0 14px" }}><X size={16} /></button>
            </div>
          ))}
          <button type="button" onClick={() => addArrayField("keyResponsibilities")} className="ex-btn ex-btn-ghost" style={{ padding: "8px 14px", fontSize: ".85rem" }}><Plus size={14} /> Add responsibility</button>
        </div>

        {/* Requirements */}
        <div>
          <label className="ex-label">Requirements *</label>
          {form.requirements.map((item, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input type="text" value={item} onChange={(e) => handleArrayChange("requirements", idx, e.target.value)} required placeholder={`Requirement ${idx + 1}`} className="ex-input flex-1" />
              <button type="button" onClick={() => removeArrayField("requirements", idx)} disabled={form.requirements.length === 1} className="ex-btn ex-btn-ghost" style={{ padding: "0 14px" }}><X size={16} /></button>
            </div>
          ))}
          <button type="button" onClick={() => addArrayField("requirements")} className="ex-btn ex-btn-ghost" style={{ padding: "8px 14px", fontSize: ".85rem" }}><Plus size={14} /> Add requirement</button>
        </div>

        <label className="flex items-center gap-3" style={{ cursor: "pointer" }}>
          <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} style={{ width: 20, height: 20, accentColor: "var(--pL)" }} />
          <span style={{ fontWeight: 600 }}>Job is active</span>
        </label>

        {successMsg && <span className="ex-badge ex-badge-ok">{successMsg}</span>}
        {errorMsg && <span className="ex-badge ex-badge-warn">{errorMsg}</span>}

        <div className="flex gap-3">
          <button type="submit" className="ex-btn ex-btn-primary flex-1" disabled={loading}>
            {loading ? <><span className="ex-spinner" /> {editId ? "Updating…" : "Adding…"}</> : editId ? "Update job" : "Add job"}
          </button>
          {editId && (
            <button type="button" onClick={handleCancelEdit} disabled={loading} className="ex-btn ex-btn-ghost flex-1">Cancel</button>
          )}
        </div>
      </form>

      {/* Jobs list */}
      <div className="flex justify-between items-center mb-4">
        <h2 style={{ fontFamily: "var(--ex-font)", fontWeight: 700, fontSize: "1.5rem" }}>All jobs ({jobs.length})</h2>
        <button onClick={fetchJobs} className="ex-btn ex-btn-ghost" disabled={fetchingJobs}>
          <RefreshCw size={15} /> {fetchingJobs ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {fetchingJobs ? (
        <div className="flex justify-center items-center py-12 gap-4"><span className="ex-spinner" /><span className="ex-lead">Loading jobs…</span></div>
      ) : jobs.length === 0 ? (
        <div className="ex-card" style={{ textAlign: "center", padding: 40 }}>
          <p className="ex-lead" style={{ margin: "0 auto" }}>No jobs found.</p>
          <p className="ex-lead" style={{ margin: "6px auto 0", fontSize: ".85rem" }}>Add your first job using the form above.</p>
        </div>
      ) : (
        <div className="ex-table-wrap ex-reveal">
          <div className="overflow-x-auto">
            <table className="ex-table">
              <thead>
                <tr>{["Job title", "Department", "Location", "Type", "Status", ""].map((h) => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {jobs.map((job, index) => (
                  <tr key={job._id || index}>
                    <td style={{ fontWeight: 600 }}>{job.jobTitle}</td>
                    <td>{job.department}</td>
                    <td>{job.location}</td>
                    <td><span className="ex-badge ex-badge-accent">{job.jobType}</span></td>
                    <td><span className={`ex-badge ${job.isActive ? "ex-badge-ok" : "ex-badge-warn"}`}>{job.isActive ? "Active" : "Inactive"}</span></td>
                    <td>
                      <div className="flex gap-2">
                        <button className="ex-btn ex-btn-ghost" style={{ padding: "7px 12px", fontSize: ".8rem" }} onClick={() => handleEdit(job)} disabled={loading}><Pencil size={14} /> Edit</button>
                        <button className="ex-btn ex-btn-danger" style={{ padding: "7px 12px", fontSize: ".8rem" }} onClick={() => handleDelete(job._id)} disabled={loading}><Trash2 size={14} /></button>
                        <button className="ex-btn ex-btn-primary" style={{ padding: "7px 12px", fontSize: ".8rem" }} onClick={() => handleViewApplicants(job._id)}><Users size={14} /> Applicants</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardShell>
  );
};

export default AddJobs;