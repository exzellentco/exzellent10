import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Mail, MapPin, Award, BookOpen, Calendar, Briefcase, FileText, ArrowLeft } from "lucide-react";
import axios from "../../utils/axios";
import DashboardShell from "../../components/DashboardShell";

const TeacherDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/teachers`);
        const teachers = response.data.data;
        const found = teachers.find((t) => t.userId === userId);

        if (!found) {
          setError("Teacher not found");
          return;
        }

        console.log("Teacher data received:", found);
        setTeacher(found);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load teacher details");
        console.error("Error fetching teacher:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchTeacher();
    }
  }, [userId]);

  if (loading) {
    return (
      <DashboardShell role="admin" eyebrow="Admin · Teacher" title={<span className="ex-g">Teacher</span>}>
        <div className="flex justify-center items-center py-20 gap-4"><span className="ex-spinner" /><span className="ex-lead">Loading teacher details…</span></div>
      </DashboardShell>
    );
  }

  if (error || !teacher) {
    return (
      <DashboardShell role="admin" eyebrow="Admin · Teacher" title={<span className="ex-g">Teacher</span>}>
        <div className="ex-card" style={{ textAlign: "center", borderColor: "rgba(239,68,68,.35)" }}>
          <p style={{ color: "#fca5a5", marginBottom: 16 }}>{error || "Teacher not found"}</p>
          <button onClick={() => navigate("/teachers")} className="ex-btn ex-btn-primary">Back to teachers</button>
        </div>
      </DashboardShell>
    );
  }

  const Chip = ({ children, tone = "accent" }) => (
    <span className={`ex-badge ${tone === "accent" ? "ex-badge-accent" : tone === "ok" ? "ex-badge-ok" : "ex-badge-warn"}`}>{children}</span>
  );

  return (
    <DashboardShell
      role="admin"
      eyebrow="Admin · Teacher"
      title={<span className="ex-g">{teacher.name || "Unnamed"}</span>}
      actions={<button onClick={() => navigate("/teachers")} className="ex-btn ex-btn-ghost"><ArrowLeft size={16} /> All teachers</button>}
    >
      {/* Identity card */}
      <div className="ex-card ex-reveal" style={{ marginBottom: 24 }}>
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <img
            src={teacher.profileImage || "https://res.cloudinary.com/dsgxyezcm/image/upload/v1767878441/Anonymous_b5hlab.jpg"}
            alt={teacher.name || "Teacher"}
            style={{ width: 150, height: 150, borderRadius: "50%", objectFit: "cover", border: "3px solid rgba(var(--pRGB),.5)", flexShrink: 0 }}
          />
          <div className="flex-1 grid gap-2">
            {[
              [<Mail size={18} />, teacher.email || "No email"],
              [<MapPin size={18} />, teacher.countryOfResidence || "Location not specified"],
              [<Briefcase size={18} />, `${teacher.yearsExperience || 0}+ years of experience`],
              [<Calendar size={18} />, `Available from ${teacher.availableFrom ? new Date(teacher.availableFrom).toLocaleDateString() : "Not specified"}`],
            ].map(([icon, text], i) => (
              <div key={i} className="flex items-center gap-2" style={{ color: "var(--ex-text)" }}>
                <span style={{ color: "var(--pL)" }}>{icon}</span><span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 grid gap-6">
          <div className="ex-card ex-reveal">
            <h2 className="flex items-center gap-2" style={{ fontFamily: "var(--ex-font)", fontWeight: 700, fontSize: "1.3rem", marginBottom: 16 }}><BookOpen size={20} style={{ color: "var(--pL)" }} /> Languages taught</h2>
            {teacher.taughtLanguages && teacher.taughtLanguages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teacher.taughtLanguages.map((lang, index) => (
                  <div key={index} style={{ border: "1px solid var(--ex-line)", borderRadius: 14, padding: 16 }}>
                    <h3 style={{ fontWeight: 700, fontSize: "1.05rem" }}>{lang.language || "Unknown"}</h3>
                    <p className="ex-lead" style={{ fontSize: ".85rem", marginBottom: 6 }}>Level: <span style={{ fontWeight: 600, color: "var(--ex-text)" }}>{lang.cefr_level || "Not specified"}</span></p>
                    {lang.isNative && <p style={{ color: "var(--pL)", fontWeight: 600, fontSize: ".85rem" }}>🌟 Native speaker</p>}
                    {lang.certifications && lang.certifications.length > 0 && (
                      <div className="mt-2">
                        <p className="ex-label">Certifications:</p>
                        <ul className="ex-lead" style={{ fontSize: ".82rem" }}>
                          {lang.certifications.map((cert, i) => <li key={i}>• {cert}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : <p className="ex-lead">No languages added yet</p>}
          </div>

          <div className="ex-card ex-reveal">
            <h2 className="flex items-center gap-2" style={{ fontFamily: "var(--ex-font)", fontWeight: 700, fontSize: "1.3rem", marginBottom: 16 }}><Award size={20} style={{ color: "var(--pL)" }} /> Academic degrees</h2>
            {teacher.academicDegrees && teacher.academicDegrees.length > 0 ? (
              <div className="grid gap-3">
                {teacher.academicDegrees.map((degree, index) => (
                  <div key={index} style={{ borderLeft: "3px solid var(--pL)", paddingLeft: 14, paddingTop: 6, paddingBottom: 6 }}>
                    <h3 style={{ fontWeight: 700 }}>{degree || "Degree"}</h3>
                  </div>
                ))}
              </div>
            ) : <p className="ex-lead">No academic degrees added</p>}
          </div>

          {teacher.teachingCertifications && teacher.teachingCertifications.length > 0 && (
            <div className="ex-card ex-reveal">
              <h2 className="flex items-center gap-2" style={{ fontFamily: "var(--ex-font)", fontWeight: 700, fontSize: "1.3rem", marginBottom: 16 }}><FileText size={20} style={{ color: "var(--pL)" }} /> Teaching certifications</h2>
              <div className="grid gap-3">
                {teacher.teachingCertifications.map((cert, index) => (
                  <div key={index} style={{ borderLeft: "3px solid #fb923c", paddingLeft: 14, paddingTop: 6, paddingBottom: 6 }}>
                    <h3 style={{ fontWeight: 700 }}>{cert || "Certification"}</h3>
                  </div>
                ))}
              </div>
            </div>
          )}

          {teacher.examExpertise && teacher.examExpertise.length > 0 && (
            <div className="ex-card ex-reveal">
              <h2 className="flex items-center gap-2" style={{ fontFamily: "var(--ex-font)", fontWeight: 700, fontSize: "1.3rem", marginBottom: 16 }}><Award size={20} style={{ color: "var(--pL)" }} /> Exam expertise</h2>
              <div className="flex flex-wrap gap-2">
                {teacher.examExpertise.map((exam, index) => <Chip key={index} tone="warn">{exam}</Chip>)}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="grid gap-6" style={{ alignContent: "start" }}>
          <div className="ex-card ex-reveal">
            <p className="ex-label">First name</p>
            <p style={{ fontSize: "1.1rem", fontWeight: 700 }}>{teacher.firstName || "Not specified"}</p>
          </div>
          <div className="ex-card ex-reveal">
            <p className="ex-label">Last name</p>
            <p style={{ fontSize: "1.1rem", fontWeight: 700 }}>{teacher.lastName || "Not specified"}</p>
          </div>
          {teacher.teachingMethodologies && teacher.teachingMethodologies.length > 0 && (
            <div className="ex-card ex-reveal">
              <h3 style={{ fontFamily: "var(--ex-font)", fontWeight: 700, fontSize: "1.1rem", marginBottom: 12 }}>Teaching methodologies</h3>
              <div className="flex flex-wrap gap-2">{teacher.teachingMethodologies.map((m, i) => <Chip key={i}>{m}</Chip>)}</div>
            </div>
          )}
          {teacher.teachingFormat && teacher.teachingFormat.length > 0 && (
            <div className="ex-card ex-reveal">
              <h3 style={{ fontFamily: "var(--ex-font)", fontWeight: 700, fontSize: "1.1rem", marginBottom: 12 }}>Teaching format</h3>
              <div className="flex flex-wrap gap-2">{teacher.teachingFormat.map((f, i) => <Chip key={i} tone="ok">{f}</Chip>)}</div>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
};

export default TeacherDetail;
