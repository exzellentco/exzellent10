import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, User, FileText } from "lucide-react";
import axios from "../../utils/axios";
import DashboardShell from "../../components/DashboardShell";

const JobApplicants = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [applicants, setApplicants] = useState([]);
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`/api/careers/${jobId}/applicants`);

      setApplicants(res.data.applicants || []);
      setJobTitle(res.data.jobTitle || "Job");
    } catch (err) {
      console.error("Failed to fetch applicants:", err);
      setError(err.response?.data?.message || "Failed to load applicants");
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCV = (cvUrl) => {
    window.open(cvUrl, "_blank");
  };

  const handleViewDocument = (docUrl) => {
    window.open(docUrl, "_blank");
  };

  if (loading) {
    return (
      <DashboardShell role="admin" eyebrow="Admin · Applicants" title={<span className="ex-g">Applicants</span>}>
        <div className="flex justify-center items-center py-20 gap-4"><span className="ex-spinner" /><span className="ex-lead">Loading…</span></div>
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell role="admin" eyebrow="Admin · Applicants" title={<span className="ex-g">Applicants</span>}>
        <div className="ex-card" style={{ textAlign: "center", borderColor: "rgba(239,68,68,.35)" }}>
          <p style={{ color: "#fca5a5", marginBottom: 16 }}>{error}</p>
          <button onClick={() => navigate("/add-job")} className="ex-btn ex-btn-primary">Back to jobs</button>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      role="admin"
      eyebrow="Admin · Applicants"
      title={<>Applicants for <span className="ex-g">{jobTitle}</span></>}
      lead={`${applicants.length} total application${applicants.length === 1 ? "" : "s"}.`}
      actions={
        <button onClick={() => navigate("/add-job")} className="ex-btn ex-btn-ghost"><ArrowLeft size={16} /> All jobs</button>
      }
    >
      {applicants.length === 0 ? (
        <div className="ex-card" style={{ textAlign: "center", padding: 48 }}>
          <User size={56} style={{ margin: "0 auto 14px", opacity: .4 }} />
          <h3 style={{ fontFamily: "var(--ex-font)", fontWeight: 700, fontSize: "1.4rem", marginBottom: 6 }}>No applications yet</h3>
          <p className="ex-lead" style={{ margin: "0 auto" }}>No one has applied for this position yet.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {applicants.map((app) => (
            <div key={app._id} className="ex-card ex-card-hover ex-reveal">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div style={{ width: 54, height: 54, borderRadius: 14, background: "rgba(var(--pRGB),.14)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <User style={{ color: "var(--pL)" }} />
                    </div>
                    <div>
                      <h3 style={{ fontFamily: "var(--ex-font)", fontWeight: 700, fontSize: "1.3rem" }}>{app.applicant.fullName}</h3>
                      <p className="ex-lead" style={{ fontSize: ".9rem" }}>{app.applicant.email}</p>
                      <p className="ex-lead" style={{ fontSize: ".82rem" }}>{app.applicant.phone}</p>
                    </div>
                  </div>

                  {app.coverLetter && (
                    <div className="mb-2">
                      <p className="ex-label">Cover letter</p>
                      <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid var(--ex-line)", borderRadius: 14, padding: 18, color: "var(--ex-text)", lineHeight: 1.6 }}>
                        {app.coverLetter}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3" style={{ minWidth: 190 }}>
                  <button onClick={() => handleViewCV(app.cvUrl)} className="ex-btn ex-btn-primary">
                    <Download size={16} /> View CV
                  </button>

                  {app.otherDocs && app.otherDocs.length > 0 && (
                    <div className="space-y-2">
                      {app.otherDocs.map((docUrl, index) => (
                        <button key={index} onClick={() => handleViewDocument(docUrl)} className="ex-btn ex-btn-ghost w-full" style={{ fontSize: ".85rem" }}>
                          <FileText size={16} /> Document {index + 1}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="ex-lead" style={{ fontSize: ".78rem", textAlign: "center" }}>
                    Applied {new Date(app.appliedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
};

export default JobApplicants;
