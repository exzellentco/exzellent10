// Learning-features API (spaced repetition, quizzes, certificates, assignments,
// student lesson booking). Uses RELATIVE /api paths so Vite's dev proxy routes
// them to the mock backend — the same pattern as calendar.js / messages.js.
// Unlike those, these endpoints identify the student from the auth token, so we
// attach the Authorization header explicitly.

const authToken = () => {
  const ls = localStorage.getItem("token");
  if (ls) return ls;
  const row = document.cookie.split("; ").find((r) => r.startsWith("token="));
  return row ? row.split("=")[1] : "";
};

const req = async (method, path, body) => {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  const t = authToken();
  if (t) headers["Authorization"] = `Bearer ${t}`;
  const res = await fetch(path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok && data.success === false) throw new Error(data.message || "Request failed");
  return data;
};

/* ---- spaced repetition + streak ---- */
// { data: [{cardId, courseId, courseTitle, front, back, due?, interval?}], dueCount, total, streak }
export const getDueCards = () => req("GET", "/api/review/due");
// grade: 0 Again · 1 Hard · 2 Good · 3 Easy
export const gradeCard = (cardId, grade) => req("POST", "/api/review/grade", { cardId, grade });
export const getStreak = () => req("GET", "/api/streak");

/* ---- study-kit quiz + certificate ---- */
export const submitQuiz = (enrollmentId, score, total) =>
  req("POST", `/api/enrollments/${enrollmentId}/quiz`, { score, total });
export const getCertificate = (enrollmentId) =>
  req("GET", `/api/enrollments/${enrollmentId}/certificate`);

/* ---- assignments & feedback ---- */
export const createAssignment = (payload) => req("POST", "/api/assignments", payload);
export const getAssignments = ({ studentId, teacherId } = {}) => {
  const q = new URLSearchParams();
  if (studentId) q.set("studentId", studentId);
  if (teacherId) q.set("teacherId", teacherId);
  return req("GET", `/api/assignments?${q.toString()}`);
};
export const submitAssignment = (assignmentId, { score, transcript }) =>
  req("POST", `/api/assignments/${assignmentId}/submit`, { score, transcript });
export const giveFeedback = (submissionId, feedback) =>
  req("POST", `/api/submissions/${submissionId}/feedback`, { feedback });

/* ---- student lesson booking (spends credits) ---- */
export const bookLesson = (payload) => req("POST", "/api/calendar/student-book", payload);

/* ---- live classes: single booking, attendance, Zoom SDK ---- */
export const getBooking = (id) => req("GET", `/api/calendar/bookings/${id}`);
export const markAttendance = (id) => req("POST", `/api/calendar/bookings/${id}/attend`);
export const getClassAttendance = (id) => req("GET", `/api/calendar/bookings/${id}/attendance`);
export const getMyAttendance = () => req("GET", "/api/calendar/my-attendance");
export const getZoomSignature = ({ meetingNumber, role = 0 }) => req("POST", "/api/zoom/signature", { meetingNumber, role });
// Pull the numeric meeting id out of a Zoom join URL (…/j/123456789?pwd=…).
export const zoomMeetingNumber = (url = "") => { const m = String(url).match(/\/j\/(\d+)/); return m ? m[1] : ""; };

/* ---- subscription plans + credits ---- */
export const getPlans = () => req("GET", "/api/plans"); // { data:[plans], signupBonus }
export const subscribe = (planId) => req("POST", "/api/subscribe", { planId }); // allocates plan credits

/* ---- invite gate + waitlist (BestSecret-style) ---- */
export const verifyInvite = (code) => req("POST", "/api/referrals/verify", { code }); // { valid, referral }
export const joinWaitlist = ({ email, name, note } = {}) => req("POST", "/api/waitlist", { email, name, note });

/* ---- referral / affiliate operability ---- */
export const getWaitlist = () => req("GET", "/api/waitlist");                        // admin
export const inviteFromWaitlist = (id) => req("POST", `/api/waitlist/${id}/invite`); // admin → returns { code }
export const getMyReferral = () => req("GET", "/api/referrals/mine");                // { data: { code, link, invitedCount, converted, earnings, invited[] } }

/* ---- community (Skool-style feed) ---- */
export const getSpaces = () => req("GET", "/api/community/spaces");
export const getPosts = (space) => req("GET", `/api/community/posts${space && space !== "All" ? `?space=${encodeURIComponent(space)}` : ""}`);
export const createPost = ({ text, space }) => req("POST", "/api/community/posts", { text, space });
export const likePost = (postId) => req("POST", `/api/community/posts/${postId}/like`);
export const commentPost = (postId, text) => req("POST", `/api/community/posts/${postId}/comment`, { text });
