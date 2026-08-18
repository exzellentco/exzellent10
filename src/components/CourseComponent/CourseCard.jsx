import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import { Clock, CheckCircle, StarIcon, ChevronDown } from "lucide-react";
import Swal from "sweetalert2";
import axios from "../../utils/axios";

const getCreditCost = (groupType) => {
  switch (groupType) {
    case "one-to-one": return 1000;
    case "class": return 250;
    default: return 50; // regular
  }
};

const CourseCard = ({
  course,
  onSelect,
  isAdmin = false,
  onEdit,
  isEnrolled = false,
  enrollmentId,
  handleDelete,
  onPublish,
  onUnpublish,
  isPaid = false,
  studentCredits = null,
}) => {
  const navigate = useNavigate();
  const creditCost = getCreditCost(course.groupType);
  const [open, setOpen] = useState(false)
  const [imgError, setImgError] = useState(false)

  // Affordability against the real per-course cost. When we know the learner's
  // credit balance, compare directly; otherwise fall back to the passed isPaid.
  const canAfford = studentCredits != null ? studentCredits >= creditCost : isPaid;

  const checkAuth = () => document.cookie.includes("token=");

  const handleEnroll = async () => {
    if (!checkAuth()) {
      Swal.fire({
        icon: "warning",
        title: "Unauthorized",
        theme: 'dark',
        text: "You must be logged in to enroll.",
      });
      navigate("/login");
      return;
    }

    if (!canAfford) {
      Swal.fire({
        icon: "warning",
        title: "Insufficient Credits",
        theme: 'dark',
        text: `You need at least ${creditCost} credits to enroll in this course.`,
        confirmButtonText: "Get Credits",
        showCancelButton: true,
      }).then((result) => {
        if (result.isConfirmed) navigate("/offer");
      });
      return;
    }

    if (!isEnrolled) {
      try {
        const res = await axios.post(`/api/enrollments/${course._id}/enroll`);
        if (res.data?.success) {
          Swal.fire({
            icon: "success",
            title: "Enrolled!",
            theme: 'dark',
            text: "You have been successfully enrolled in this course.",
          });
          navigate(`/course/${encodeURIComponent(course.title)}-${encodeURIComponent(course.level)}`, { state: { enrollmentId: res.data.enrollment?._id } });
        } else {
          Swal.fire({
            icon: "error",
            title: "Enrollment Failed",
            theme: 'dark',
            text: "Could not enroll. Please try again.",
          });
        }
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Enrollment Failed",
          theme: 'dark',
          text: err?.response?.data?.message || "Could not enroll. Please try again.",
        });
      }
    } else {
      handleGoToCourse();
    }
  };

  const handleCardClick = () => {
    if (onSelect) onSelect(course);
  };

  const handleGoToCourse = () => {
    navigate(`/course/${encodeURIComponent(course.title)}-${encodeURIComponent(course.level)}`, { state: { enrollmentId } });
  };

  const getInstructorName = () => {
    if (Array.isArray(course.instructorDetails) && course.instructorDetails.length > 0) {
      return course.instructorDetails
        .map((inst) => inst.name || "Expert Instructor")
        .join(", ");
    }
    return "Expert Instructor";
  };

  const instructorName = getInstructorName();

  return (
    <div className="group relative bg-gradient-to-tr from-bg to-bg2 rounded-xl flex flex-col w-70 lg:w-100
    overflow-hidden hover:scale-98  transition-all duration-500">

{/* Thumbnail header */}
      <div className="relative h-40 w-full overflow-hidden">
        {course.thumbnail && !imgError ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-tr from-primary/40 via-bg2 to-secondary/30 flex items-center justify-center">
            <span className="text-white/80 font-bold text-lg px-4 text-center">{course.title}</span>
          </div>
        )}

{/* Admin badges */}
        {isAdmin && (
          <div className="absolute top-2 left-3 z-10">
            {!course.isPublished ? (
              <div className="bg-secondary text-white px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1"><Clock size={14} /> Pending</div>
            ) : (
              <div className="bg-primary text-white px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1"><CheckCircle size={14} /> Live</div>
            )}
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-lg font-bold text-white">{course.title}</p>
          <span className="text-xs font-semibold text-white bg-bg/70 p-2 rounded-xl flex items-center gap-1"><StarIcon className="text-tertiary" size={16}/> {creditCost} Credits</span>
        </div>
        <p className="text-sm text-text-secondary mb-2">{course.language || "Course"} - {course.level || "No Level"}</p>
        <p className="text-sm text-text-secondary">{instructorName}</p>
      </div>

{/* Group Type Badge */}
      {course.groupType && (
        <span className={`text-xs p-1 font-semibold text-center ${ course.groupType === "one-to-one" ? "bg-purple-600 text-white" : course.groupType === "class" ?
          "bg-blue-600 text-white" : "bg-slate-200 text-text-secondary"}`}>
          {course.groupType === "one-to-one" ? "One to One • 1 Student" : course.groupType === "class" ? "Class • 15-20 Students" : "Regular • 25-30 Students"}
        </span>
      )}

{/* Always-visible primary CTA (students) */}
      {!isAdmin && (
        <div className="px-5 pt-4">
          {isEnrolled ? (
            <button onClick={handleGoToCourse}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-800 to-primary text-white font-semibold cursor-pointer transition-all duration-500 hover:scale-105">
              Continue
            </button>
          ) : (
            <button onClick={handleEnroll}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-800 to-primary text-white font-semibold cursor-pointer transition-all duration-500 hover:scale-105">
              {canAfford ? `Enroll Now • ${creditCost} Credits` : "Get Access"}
            </button>
          )}
        </div>
      )}

{/* Details toggle affordance */}
      <button onClick={() => setOpen(prev => !prev)}
        className="flex items-center justify-center gap-1 px-5 py-3 text-sm font-medium text-text-secondary hover:text-white cursor-pointer transition-all duration-300">
        {open ? "Hide details" : "Details"}
        <ChevronDown className={`transition-transform duration-500 ${open ? "rotate-180" : ""}`} size={16} />
      </button>

{/* Collapsible content */}
      <div className={`${open===true ? "max-h-[1000px]":"max-h-0"} transition-all duration-1000 ease-in-out overflow-hidden`}>
        <div className={`${open===true ? "translate-y-0 opacity-100":"translate-y-[-20px] opacity-0"} p-5 flex flex-col transform transition-all duration-1000 ease-out`}>

          {course.description && (
            <p className="my-2 text-xs text-white line-clamp-3 text-center">{course.description}</p>
          )}

          <div className="flex items-center gap-2 text-xs text-white font-medium py-3">
            <Clock className="text-secondary" size={16} /><span>{course.duration || "Duration: 3 Months"}</span>
          </div>

          {Array.isArray(course.tags) && course.tags.length > 0 && (
            <div className="overflow-hidden h-20">
              <p className=" font-semibold text-white">Skills:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {course.tags.map((tag, index) => (
                  <span key={index} className="text-xs bg-bg text-white px-2 py-1 rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          )}

{/* Admin actions */}
          {isAdmin && (
            <div className="p-4 mt-auto">
              <div className="space-y-3">
                {!course.isPublished ? (
                  <button onClick={() => onPublish?.(course._id)}
                    className="cursor-pointer w-full bg-primary hover:bg-primary/50 text-white  font-semibold p-2 rounded-xl transition-all duration-500 hover:scale-105 flex items-center justify-center gap-2">
                    <CheckCircle size={16} /> Publish Course
                  </button>
                ) : (
                  <button onClick={() => onUnpublish?.(course._id)}
                    className="cursor-pointer w-full bg-slate-100 hover:bg-slate-200 text-text-secondary  font-semibold p-2 rounded-xl transition-all duration-500 hover:scale-105">
                    Unpublish
                  </button>
                )}

                <button onClick={handleCardClick}
                  className="cursor-pointer w-full hover:bg-slate-100  text-primary  font-semibold p-2 rounded-xl transition-all duration-500 hover:scale-105">
                  View Details
                </button>

                <button onClick={() => onEdit?.(course)}
                  className="cursor-pointer w-full bg-primary hover:bg-primary/50 text-white  font-semibold p-2 rounded-xl transition-all duration-500 hover:scale-105">
                  Update
                </button>

                <button onClick={() => handleDelete?.(course)}
                  className="cursor-pointer w-full bg-secondary hover:bg-amber-600 text-white  font-semibold p-2 rounded-xl transition-all duration-500 hover:scale-105">
                  Delete Course
                </button>
              </div>
            </div>
          )}
        </div>
      </div>


    </div>
  );
};

export default CourseCard;