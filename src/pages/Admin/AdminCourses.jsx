import React, { useState, useEffect } from "react";
import SectionForm from "../../components/CourseComponent/SectionForm";
import SectionList from "../../components/CourseComponent/SectionList";
import CourseForm from "../../components/CourseComponent/CourseForm";
import CourseCard from "../../components/CourseComponent/CourseCard";
import { fetchCourses, createSection, updateSection, deleteSection, createCourse, updateCourse, deleteCourse, publishCourse, unpublishCourse } from "../../APIs/AdminCourses";
import axios from "../../utils/axios";
import { CheckCircle, Clock, AlertCircle, ArrowLeft, Plus } from "lucide-react";
import DashboardShell from "../../components/DashboardShell";

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [editSection, setEditSection] = useState(null);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    fetchCourses().then((data) => {
      const coursesArray = Array.isArray(data) ? data : [];
      setCourses(coursesArray);
    });
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      window.scrollTo(0, 0);
    }
  }, [selectedCourse]);

  const pendingCourses = courses
    .filter(course => !course.isPublished)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  const publishedCourses = courses
    .filter(course => course.isPublished)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  const displayedCourses = (activeTab === "pending" ? pendingCourses : publishedCourses)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  const refreshSelectedCourse = async (courseId) => {
    try {
      const response = await axios.get(`/api/courses/${courseId}`);
      const updated = response.data;
      setSelectedCourse(updated);
      setCourses((prev) =>
        prev.map((c) => (c._id === updated._id ? updated : c))
      );
    } catch {
      alert("Failed to refresh course data. Please try again.");
    }
  };

  const handleCreateCourse = async (courseData) => {
    try {
      await createCourse(courseData);
      setShowCourseForm(false);
      const updated = await fetchCourses();
      setCourses(Array.isArray(updated) ? updated : []);
    } catch (err) {
      alert("Failed to create course: " + err.message);
    }
  };

  const handleUpdateCourse = async (courseData) => {
    try {
      await updateCourse(editCourse._id, courseData);
      setEditCourse(null);
      const updated = await fetchCourses();
      setCourses(Array.isArray(updated) ? updated : []);
    } catch (err) {
      alert("Failed to update course: " + err.message);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await deleteCourse(courseId);
        setCourses((prev) => prev.filter((c) => c._id !== courseId));
        if (selectedCourse && selectedCourse._id === courseId) {
          setSelectedCourse(null);
        }
      } catch (err) {
        alert("Failed to delete course: " + err.message);
      }
    }
  };

  const handlePublishCourse = async (courseId) => {
    if (window.confirm("Are you sure you want to publish this course? It will become visible to all students.")) {
      try {
        await publishCourse(courseId);
        const updated = await fetchCourses();
        setCourses(Array.isArray(updated) ? updated : []);
      } catch (err) {
        alert("Failed to publish course: " + err.message);
      }
    }
  };

  const handleUnpublishCourse = async (courseId) => {
    if (window.confirm("Are you sure you want to unpublish this course? It will no longer be visible to students.")) {
      try {
        await unpublishCourse(courseId);
        const updated = await fetchCourses();
        setCourses(Array.isArray(updated) ? updated : []);
      } catch (err) {
        alert("Failed to unpublish course: " + err.message);
      }
    }
  };

  if (selectedCourse) {
    return (
      <DashboardShell role="admin" eyebrow="Admin · Course" title={<span className="ex-g">{selectedCourse.title}</span>}>
        <button onClick={() => setSelectedCourse(null)} className="ex-btn ex-btn-ghost" style={{ marginBottom: 22 }}>
          <ArrowLeft size={16} /> Back to courses
        </button>

        <div className="ex-card" style={{ marginBottom: 24 }}>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              {selectedCourse.subtitle && <div style={{ color: "var(--pL)", fontWeight: 600, marginBottom: 8 }}>{selectedCourse.subtitle}</div>}
              <p className="ex-lead">{selectedCourse.description}</p>
            </div>
            <span className={`ex-badge ${selectedCourse.isPublished ? "ex-badge-accent" : "ex-badge-warn"}`}>
              {selectedCourse.isPublished ? <><CheckCircle size={14} /> Published</> : <><Clock size={14} /> Pending</>}
            </span>
          </div>

          {selectedCourse.isPublished ? (
            <button onClick={() => handleUnpublishCourse(selectedCourse._id)} className="ex-btn ex-btn-ghost w-full">Unpublish course</button>
          ) : (
            <button onClick={() => handlePublishCourse(selectedCourse._id)} className="ex-btn ex-btn-primary w-full"><CheckCircle size={16} /> Publish course</button>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <h3 style={{ fontFamily: "var(--ex-font)", fontWeight: 700, fontSize: "1.2rem" }}>Sections</h3>
          <button className="ex-btn ex-btn-primary" onClick={() => setShowSectionForm(true)}><Plus size={16} /> Create section</button>
        </div>

        {showSectionForm && (
          <SectionForm
            onClose={() => setShowSectionForm(false)}
            onSubmit={async (sectionData) => {
              try {
                await createSection(selectedCourse._id, sectionData);
                setShowSectionForm(false);
                await refreshSelectedCourse(selectedCourse._id);
              } catch (err) {
                alert("Failed to create section: " + err.message);
              }
            }}
          />
        )}

        {editSection && (
          <SectionForm
            initialData={editSection}
            onClose={() => setEditSection(null)}
            onSubmit={async (sectionData) => {
              try {
                await updateSection(selectedCourse._id, editSection._id, sectionData);
                setEditSection(null);
                await refreshSelectedCourse(selectedCourse._id);
              } catch (err) {
                alert("Failed to update section: " + err.message);
              }
            }}
          />
        )}

        <SectionList
          sections={selectedCourse.sections}
          onEdit={(section) => setEditSection(section)}
          onDelete={async (section) => {
            if (window.confirm("Are you sure you want to delete this section?")) {
              try {
                await deleteSection(selectedCourse._id, section._id);
                await refreshSelectedCourse(selectedCourse._id);
              } catch (err) {
                alert("Failed to delete section: " + err.message);
              }
            }
          }}
        />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      role="admin"
      eyebrow="Admin · Courses"
      title={<>Manage <span className="ex-g">courses</span></>}
      lead="Review teacher submissions and publish courses to the platform."
      actions={<button onClick={() => setShowCourseForm(true)} className="ex-btn ex-btn-primary"><Plus size={16} /> Create course</button>}
    >
      {/* Tabs */}
      <div className="flex gap-2 mb-4" style={{ borderBottom: "1px solid var(--ex-line)" }}>
        <button onClick={() => setActiveTab("pending")} className="flex items-center gap-2" style={{ padding: "10px 6px", fontWeight: 600, color: activeTab === "pending" ? "var(--pL)" : "var(--ex-muted)", borderBottom: activeTab === "pending" ? "2px solid var(--pL)" : "2px solid transparent" }}>
          <Clock size={18} /> Pending review
          {pendingCourses.length > 0 && <span className="ex-badge ex-badge-warn" style={{ padding: "2px 8px" }}>{pendingCourses.length}</span>}
        </button>
        <button onClick={() => setActiveTab("published")} className="flex items-center gap-2" style={{ padding: "10px 6px", fontWeight: 600, color: activeTab === "published" ? "var(--pL)" : "var(--ex-muted)", borderBottom: activeTab === "published" ? "2px solid var(--pL)" : "2px solid transparent" }}>
          <CheckCircle size={18} /> Published
          {publishedCourses.length > 0 && <span className="ex-badge ex-badge-accent" style={{ padding: "2px 8px" }}>{publishedCourses.length}</span>}
        </button>
      </div>

      <div className="ex-card ex-reveal" style={{ marginBottom: 24 }}>
        <div className="flex items-start gap-3">
          {activeTab === "pending" ? <AlertCircle size={28} style={{ color: "#fb923c", flexShrink: 0 }} /> : <CheckCircle size={28} style={{ color: "var(--pL)", flexShrink: 0 }} />}
          <div>
            <h4 style={{ fontWeight: 700 }}>{activeTab === "pending" ? "Courses awaiting review" : "Published courses"}</h4>
            <p className="ex-lead" style={{ fontSize: ".9rem", marginTop: 4 }}>
              {activeTab === "pending"
                ? "Created by teachers but not yet visible to students. Review and publish them to go live."
                : "These courses are live and visible to all students on the platform."}
            </p>
          </div>
        </div>
      </div>

      {showCourseForm && <CourseForm onClose={() => setShowCourseForm(false)} onSubmit={handleCreateCourse} mode="admin" />}
      {editCourse && <CourseForm initialData={editCourse} onClose={() => setEditCourse(null)} onSubmit={handleUpdateCourse} isEdit={true} mode="admin" />}

      {displayedCourses.length === 0 ? (
        <div className="ex-card" style={{ textAlign: "center", padding: 48 }}>
          {activeTab === "pending" ? <Clock size={48} style={{ margin: "0 auto 12px", opacity: .5 }} /> : <CheckCircle size={48} style={{ margin: "0 auto 12px", opacity: .5 }} />}
          <p className="ex-lead" style={{ margin: "0 auto" }}>{activeTab === "pending" ? "No courses pending review." : "No published courses yet."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 justify-items-center">
          {displayedCourses.map((course) => (
            <CourseCard key={course._id} course={course} onSelect={setSelectedCourse} isAdmin={true} onEdit={() => setEditCourse(course)} handleDelete={() => handleDeleteCourse(course._id)}
              onPublish={handlePublishCourse} onUnpublish={handleUnpublishCourse} />
          ))}
        </div>
      )}
    </DashboardShell>
  );
};

export default AdminCourses;
