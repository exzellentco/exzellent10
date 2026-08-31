/*
 * Local FAKE backend for developing the Exzellent frontend without real logins.
 *
 * It accepts ANY email + password and hands back a working session. The role you
 * get is chosen from the email address, so you can open every dashboard:
 *
 *     admin@test.com     -> Admin  dashboard
 *     teacher@test.com   -> Teacher dashboard
 *     anything@else.com  -> Student dashboard
 *
 * Password can be anything at all (e.g. "test"). Nothing here talks to the real
 * database - all data below is invented and lives only in memory.
 *
 * Start it with  start-mock-backend.bat  (or:  node mock-server.js).
 */

const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = process.env.PORT || 5000;

// Load mock-backend/.env (simple KEY=VALUE lines) into process.env if present.
// Keeps secrets out of the source file and out of git (.env is gitignored).
(function loadDotEnv() {
  try {
    const envPath = path.join(__dirname, ".env");
    if (!fs.existsSync(envPath)) return;
    fs.readFileSync(envPath, "utf8").split(/\r?\n/).forEach((line) => {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m && !line.trim().startsWith("#")) {
        const val = m[2].replace(/^["']|["']$/g, "");
        if (!(m[1] in process.env)) process.env[m[1]] = val;
      }
    });
  } catch { /* ignore */ }
})();

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
if (!GROQ_API_KEY) {
  console.log("WARNING: GROQ_API_KEY is not set. Add it to mock-backend/.env to enable Exzi chat.");
}

/* ------------------------------------------------------------------ helpers */

const roleFromEmail = (email = "") => {
  const e = String(email).toLowerCase();
  if (e.includes("admin")) return "Admin";
  if (e.includes("teacher")) return "Teacher";
  return "Student";
};

// token carries the role so /profile can answer after a page reload
const makeToken = (role, id) => `mock.${role}.${id}`;
const roleFromToken = (token = "") => {
  const parts = String(token).split(".");
  return parts[0] === "mock" ? parts[1] : null;
};

const userFor = (role, email = `${role.toLowerCase()}@test.com`) => {
  // Teacher logs in as the real named teacher so their name is consistent
  // across login, the teacher dashboard and the admin database.
  if (role === "Teacher") return { ...TEACHER, email: email || TEACHER.email };
  return {
    _id: `mock-${role.toLowerCase()}-001`,
    name: `Demo ${role}`,
    firstName: "Demo",
    lastName: role,
    email,
    userType: role,
    role,
    paid: true,
    credits: 5000,
    phone: "+49 000 000000",
    country: "Germany",
  };
};

/* -------------------------------------------------------------- sample data */

// The demo teacher every teacher@* login maps to. Their _id ties courses,
// enrollments and dashboard stats together so every number is a real
// computation over this one coherent dataset.
const TEACHER_ID = "mock-teacher-001";
const TEACHER = {
  _id: TEACHER_ID,
  userId: TEACHER_ID,
  name: "Lena Hoffmann",
  firstName: "Lena",
  lastName: "Hoffmann",
  email: "teacher@test.com",
  password: "Teacher123",
  userType: "Teacher",
  role: "Teacher",
  countryOfResidence: "Germany",
  city: "Cottbus",
  yearsExperience: 8,
  availableFrom: "2026-09-01",
  isApproved: true,
  profileImage: "https://res.cloudinary.com/dsgxyezcm/image/upload/v1767878441/Anonymous_b5hlab.jpg",
  subjects: ["German", "English"],
  taughtLanguages: ["German", "English"],
  academicDegrees: ["M.A. German Philology — Humboldt University", "B.A. English Studies"],
  teachingCertifications: ["Goethe-Institut C2", "TEFL Level 5"],
  examExpertise: ["TestDaF", "Goethe A1–C1", "IELTS"],
  teachingMethodologies: ["Communicative", "Task-based", "Immersion"],
  teachingFormat: ["1-on-1", "Group", "Online"],
  bio: "German & English tutor with 8 years of experience helping learners reach fluency for study and work in Germany.",
};

// The admin "teachers" database. Starts with Lena; admins can add/approve/delete.
const TEACHERS = [TEACHER];

// The instructor shown on a course's "Meet your Teacher" — the real teacher, not a placeholder.
const INSTRUCTOR_DETAILS = [{
  name: TEACHER.name,
  profileImage: TEACHER.profileImage,
  academicDegrees: (TEACHER.academicDegrees || [])[0] || "",
  yearsExperience: TEACHER.yearsExperience,
}];

// Pending email OTPs during signup (email -> { otp, userType }). In-memory only.
const PENDING_OTPS = {};

// Every AI study-kit generation produces this many format variants per lesson.
const FORMATS_PER_LESSON = 9;

// Safe, always-available placeholder lesson video (first-ever YouTube upload, SFW).
// Replace with real lesson URLs in production content.
const DEMO_VIDEO = "https://www.youtube.com/watch?v=jNQXAC9IVRw";

// Courses are a MUTABLE store: create/update/delete/section/publish routes
// mutate this array in place, so the dashboard reflects changes in real time.
const COURSES = [
  {
    _id: "course-001",
    title: "German A1 for Beginners",
    description: "Speak confidently in 30 days. Vocabulary, grammar and daily speaking practice.",
    language: "German",
    level: "A1",
    groupType: "regular",
    duration: "3 Months",
    price: 149,
    instructor: TEACHER_ID,
    thumbnail: "https://placehold.co/400x300?text=German+A1",
    tags: ["Speaking", "Grammar", "Listening"],
    isPublished: true,
    createdAt: "2026-02-10T09:00:00Z",
    instructorDetails: INSTRUCTOR_DETAILS,
    sections: [
      { _id: "sec-1", title: "Greetings & Introductions", sectionType: "language-training", lectures: [
        { _id: "lec-1", title: "Hallo! Saying hello & goodbye", youtubeUrl: DEMO_VIDEO, duration: "06:20", description: "Core greetings for everyday German." },
        { _id: "lec-2", title: "Introducing yourself", youtubeUrl: DEMO_VIDEO, duration: "07:45", description: "Name, origin and simple small talk." },
      ] },
      { _id: "sec-2", title: "Numbers, Dates & Time", sectionType: "language-training", lectures: [
        { _id: "lec-3", title: "Numbers 0–100", youtubeUrl: DEMO_VIDEO, duration: "08:10", description: "Counting and prices." },
        { _id: "lec-4", title: "Telling the time", youtubeUrl: DEMO_VIDEO, duration: "05:55", description: "Clock time and daily routine." },
      ] },
      { _id: "sec-3", title: "Everyday Vocabulary", sectionType: "language-training", lectures: [
        { _id: "lec-5", title: "Food & drink", youtubeUrl: DEMO_VIDEO, duration: "09:30", description: "Ordering in a café." },
      ] },
      { _id: "sec-4", title: "Present Tense Verbs", sectionType: "language-training", lectures: [
        { _id: "lec-6", title: "Regular verbs in the present", youtubeUrl: DEMO_VIDEO, duration: "10:15", description: "Conjugating -en verbs." },
      ] },
    ],
    studyKit: {
      summary: "The essentials of German A1: greetings, numbers, everyday vocabulary and present-tense verbs.",
      keyTerms: ["Hallo", "Danke", "Bitte", "Guten Morgen", "Tschüss", "Wie geht's?"],
      flashcards: [
        { front: "Hello", back: "Hallo" },
        { front: "Thank you", back: "Danke" },
        { front: "Please / You're welcome", back: "Bitte" },
        { front: "Good morning", back: "Guten Morgen" },
        { front: "Goodbye", back: "Tschüss" },
        { front: "How are you?", back: "Wie geht es dir?" },
      ],
      quiz: [
        { question: "How do you say “thank you” in German?", options: ["Bitte", "Danke", "Hallo", "Tschüss"], answer: 1, explanation: "“Danke” means thank you." },
        { question: "“Guten Morgen” means…", options: ["Good night", "Good morning", "Goodbye", "Welcome"], answer: 1, explanation: "It's the morning greeting." },
        { question: "Which word is a farewell?", options: ["Hallo", "Danke", "Tschüss", "Bitte"], answer: 2, explanation: "“Tschüss” = bye." },
        { question: "“Wie geht es dir?” asks…", options: ["Where are you?", "How are you?", "What's your name?", "How old are you?"], answer: 1, explanation: "It asks how someone is." },
      ],
    },
  },
  {
    _id: "course-002",
    title: "English B2 Intensive",
    description: "Advance to upper-intermediate English for work and study.",
    language: "English",
    level: "B2",
    groupType: "class",
    duration: "4 Months",
    price: 199,
    instructor: TEACHER_ID,
    thumbnail: "https://placehold.co/400x300?text=English+B2",
    tags: ["Business English", "Writing"],
    isPublished: true,
    createdAt: "2026-03-05T09:00:00Z",
    instructorDetails: INSTRUCTOR_DETAILS,
    sections: [
      { _id: "sec-5", title: "Business Writing", sectionType: "language-training", lectures: [
        { _id: "lec-7", title: "Professional emails", youtubeUrl: DEMO_VIDEO, duration: "11:00", description: "Tone and structure for work emails." },
        { _id: "lec-8", title: "Reports & summaries", youtubeUrl: DEMO_VIDEO, duration: "09:20", description: "Writing clear summaries." },
      ] },
      { _id: "sec-6", title: "Advanced Grammar", sectionType: "language-training", lectures: [
        { _id: "lec-9", title: "Conditionals", youtubeUrl: DEMO_VIDEO, duration: "12:40", description: "First, second and third conditionals." },
      ] },
      { _id: "sec-7", title: "Presentations & Public Speaking", sectionType: "language-training", lectures: [
        { _id: "lec-10", title: "Structuring a talk", youtubeUrl: DEMO_VIDEO, duration: "08:50", description: "Openings, signposting and closings." },
      ] },
    ],
    studyKit: {
      summary: "Upper-intermediate English for the workplace: emails, reports, advanced grammar and presentations.",
      keyTerms: ["Furthermore", "However", "In conclusion", "On the other hand", "To summarise"],
      flashcards: [
        { front: "A word to add information", back: "Furthermore / Moreover" },
        { front: "A word to show contrast", back: "However / On the other hand" },
        { front: "A phrase to close a talk", back: "In conclusion / To sum up" },
        { front: "Formal way to say 'get'", back: "Receive / Obtain" },
        { front: "Formal greeting in an email", back: "Dear Sir or Madam" },
      ],
      quiz: [
        { question: "Which word signals a contrast?", options: ["Furthermore", "However", "Moreover", "Also"], answer: 1, explanation: "“However” introduces a contrast." },
        { question: "A formal email greeting is…", options: ["Hey!", "Dear Sir or Madam", "What's up", "Yo"], answer: 1, explanation: "Use a formal salutation in business emails." },
        { question: "“To sum up” is used to…", options: ["Start a talk", "Add a point", "Conclude", "Ask a question"], answer: 2, explanation: "It signals a conclusion." },
      ],
    },
  },
  {
    _id: "course-003",
    title: "AI Fundamentals (Skills Lab)",
    description: "Hands-on introduction to modern AI tools and workflows.",
    language: "English",
    level: "Beginner",
    groupType: "one-to-one",
    duration: "6 Weeks",
    price: 99,
    instructor: TEACHER_ID,
    thumbnail: "https://placehold.co/400x300?text=AI+Fundamentals",
    tags: ["AI", "Automation", "No-Code"],
    isPublished: false,
    createdAt: "2026-07-20T09:00:00Z",
    instructorDetails: INSTRUCTOR_DETAILS,
    sections: [
      { _id: "sec-8", title: "What is AI?", sectionType: "language-training", lectures: [
        { _id: "lec-11", title: "AI in everyday life", youtubeUrl: DEMO_VIDEO, duration: "07:30", description: "Where AI already helps you." },
        { _id: "lec-12", title: "Prompting basics", youtubeUrl: DEMO_VIDEO, duration: "10:00", description: "How to ask AI for good results." },
      ] },
    ],
  },
];

// Snapshot the seed lectures NOW (before any data.json load mutates COURSES) so
// we can backfill the demo courses whose saved copy predates the lecture content.
const SEED_LECTURES = Object.fromEntries(COURSES.map((c) => [c._id, JSON.parse(JSON.stringify(c.sections))]));
const SEED_STUDYKITS = Object.fromEntries(COURSES.filter((c) => c.studyKit).map((c) => [c._id, JSON.parse(JSON.stringify(c.studyKit))]));

// The primary demo student is a REAL account tied to this email. Logging in with
// it returns this record (see findAccountByEmail), so profile edits persist and
// it appears in the admin students list like any other student.
const PRIMARY_STUDENT = { _id: "stu-kos", name: "Kos", firstName: "Kos", lastName: "", email: "koszoz99@gmail.com", password: "Kos12345", paid: true, country: "Germany", credits: 5000, phone: "", gender: "", dateOfBirth: null, referral: "Direct" };

const STUDENTS = [
  PRIMARY_STUDENT,
  { _id: "stu-1", name: "Anna Müller", firstName: "Anna", lastName: "Müller", email: "anna@test.com", paid: true, country: "Germany", credits: 1200, phone: "+49 151 2345678", gender: "Female", dateOfBirth: "1998-04-12", referral: "Instagram" },
  { _id: "stu-2", name: "Ben Okafor", firstName: "Ben", lastName: "Okafor", email: "ben@test.com", paid: true, country: "Nigeria", credits: 300, phone: "+234 803 1122334", gender: "Male", dateOfBirth: "2000-09-03", referral: "Friend" },
  { _id: "stu-3", name: "Chloé Martin", firstName: "Chloé", lastName: "Martin", email: "chloe@test.com", paid: true, country: "France", credits: 800, phone: "+33 6 12 34 56 78", gender: "Female", dateOfBirth: "1997-01-22", referral: "Google" },
  { _id: "stu-4", name: "Diego Alvarez", firstName: "Diego", lastName: "Alvarez", email: "diego@test.com", paid: true, country: "Spain", credits: 640, phone: "+34 611 223344", gender: "Male", dateOfBirth: "1999-11-30", referral: "YouTube" },
  { _id: "stu-5", name: "Emine Yıldız", firstName: "Emine", lastName: "Yıldız", email: "emine@test.com", paid: true, country: "Türkiye", credits: 980, phone: "+90 532 1234567", gender: "Female", dateOfBirth: "2001-06-15", referral: "Instagram" },
  { _id: "stu-6", name: "Farid Hassan", firstName: "Farid", lastName: "Hassan", email: "farid@test.com", paid: true, country: "Egypt", credits: 420, phone: "+20 100 1234567", gender: "Male", dateOfBirth: "1996-08-08", referral: "Friend" },
];
// Seeded students are existing, active members (already email-verified + approved).
// Demo password for every seed student except the primary one is "Student123".
STUDENTS.forEach((s) => { s.isApproved = true; s.status = "active"; s.userType = "Student"; s.password = s.password || "Student123"; });

// ---- a student's OWN enrollments + credit balance (student dashboard side) ----
const MY_ENROLLMENTS = []; // { _id, studentId, courseId, progress, completedPercentage, enrolledAt }
let MYENR_SEQ = 1;
const MY_CREDITS = {};     // studentId -> remaining credits (overrides the default)
const PROFILE_EDITS = {};  // userId -> saved profile-field overrides (name, phone, country, …)
const DEFAULT_CREDITS = 5000;

// ---- teaching features: spaced repetition, streaks, assignments, bookings ----
const REVIEW = {};         // studentId -> { cardId: { due(ISO date), interval(days), reps, ease } }
const STREAKS = {};        // studentId -> { count, lastDay(YYYY-MM-DD) }
const ASSIGNMENTS = [];    // { _id, teacherId, teacherName, studentId, courseId, title, prompt, targetText, createdAt }
let ASSIGNMENT_SEQ = 1;
const SUBMISSIONS = [];    // { _id, assignmentId, studentId, studentName, score, transcript, feedback, submittedAt }
let SUBMISSION_SEQ = 1;
const LESSON_COST = 500;   // credits a student spends to book a 1-to-1 lesson

// ---- subscription plans + credit allowances (edit prices/credits freely) -----
// paymentLink = the Stripe Payment Link for that tier (paste real links here).
const SIGNUP_BONUS = 200;  // free credits every new member gets on sign-up
const PLANS = [
  { id: "starter",  name: "Starter",  price: 8.99,   credits: 500,   popular: false, paymentLink: "",
    features: ["500 credits / month", "AI tutor & tools", "Community access", "Group classes"] },
  { id: "plus",     name: "Plus",     price: 14.99,  credits: 1200,  popular: true,  paymentLink: "",
    features: ["1,200 credits / month", "Everything in Starter", "Priority AI tools", "Webinars included"] },
  { id: "pro",      name: "Pro",      price: 29.99,  credits: 3000,  popular: false, paymentLink: "",
    features: ["3,000 credits / month", "Everything in Plus", "1-to-1 lesson credits", "Certificates"] },
  { id: "premium",  name: "Premium",  price: 99.99,  credits: 12000, popular: false, paymentLink: "",
    features: ["12,000 credits / month", "Everything in Pro", "Priority booking", "Dedicated support"] },
  { id: "ultimate", name: "Ultimate", price: 121.99, credits: 16000, popular: false, paymentLink: "",
    features: ["16,000 credits / month", "Everything in Premium", "Unlimited community", "Early access"] },
];
const planById = (id) => PLANS.find((p) => p.id === id);

// ---- AI credit costs (students spend credits per use; teachers/admins free) --
const AI_COSTS = { "study-kit": 30, "generate-exam": 20, "build-course": 30, "progress-report": 15, "analyze-speech": 10, "chat": 5 };
const aiCostFor = (path) => {
  const key = Object.keys(AI_COSTS).find((k) => path.includes("/ai/" + k) || path.endsWith("/" + k));
  return key ? AI_COSTS[key] : 10; // default 10 credits for any other AI call
};

// ---- invite-only waitlist (BestSecret-style "request an invite") -------------
const WAITLIST = []; // { _id, email, name, note, invited, inviteCode, createdAt }
let WAITLIST_SEQ = 1;
const INVITE_ONLY = true; // require a valid invite/referral code to register
const findReferral = (code) => REFERRALS.find((r) => (r.code || "").toLowerCase() === String(code || "").toLowerCase() && r.active !== false);
const AFFILIATE_COMMISSION = 5;    // € earned per converted referral — affiliates/ambassadors (real payout)
const CREDITS_PER_REFERRAL = 100;  // credits a STUDENT earns when someone they invited becomes paid
const slugCode = (s) => (String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6) || "MEMBER");
// Every member/ambassador has one personal invite code; created on demand.
const ensureReferralFor = (userId, name) => {
  let r = REFERRALS.find((x) => x.ownerId === userId);
  if (!r) {
    const base = slugCode(name || userId);
    let code = base, n = 1;
    while (REFERRALS.some((x) => (x.code || "").toLowerCase() === code.toLowerCase())) code = base + (++n);
    r = { _id: `ref-${REFERRAL_SEQ++}`, code, ownerId: userId, ownerName: name || "", description: "Personal invite code", uses: 0, active: true, reward: "", createdAt: new Date().toISOString() };
    REFERRALS.push(r);
  }
  return r;
};
const referralStats = (userId, name) => {
  const r = ensureReferralFor(userId, name);
  const invited = STUDENTS.filter((s) => s.invitedBy === userId || (s.invitedByCode || "").toLowerCase() === r.code.toLowerCase());
  const converted = invited.filter((s) => s.paid).length;
  return {
    code: r.code, link: `/signup?ref=${r.code}`,
    invitedCount: invited.length, converted, uses: r.uses || 0,
    // Students earn CREDITS; affiliates/ambassadors also get a € figure for payout.
    creditsEarned: converted * CREDITS_PER_REFERRAL, creditsPer: CREDITS_PER_REFERRAL,
    earnings: converted * AFFILIATE_COMMISSION, commissionPer: AFFILIATE_COMMISSION,
    invited: invited.map((s) => ({ _id: s._id, name: s.name, joinedAt: s.createdAt, paid: !!s.paid })),
  };
};

// ---- community (Skool-style feed) -------------------------------------------
const POSTS = []; // { _id, authorId, authorName, authorRole, space, text, likes:[ids], comments:[{_id,authorId,authorName,text,createdAt}], createdAt }
let POST_SEQ = 1;
const COMMUNITY_SPACES = ["General", "Wins", "Questions", "Study buddies", "Germany life"];
const userDisplay = (role, id) => {
  if (role === "Teacher") return { name: TEACHER.name, role: "Teacher" };
  if (role === "Admin") return { name: "Admin", role: "Admin" };
  const s = STUDENTS.find((x) => x._id === id);
  return { name: (s && s.name) || "Member", role: "Student" };
};
// Seed a little life into the community.
POSTS.push(
  { _id: `post-${POST_SEQ++}`, authorId: TEACHER_ID, authorName: TEACHER.name, authorRole: "Teacher", space: "General",
    text: "Willkommen! 👋 Drop an intro — where are you learning from and what's your goal (job, telc exam, study)?",
    likes: ["stu-1", "stu-3"], comments: [{ _id: "c1", authorId: "stu-1", authorName: "Anna Müller", text: "Hallo from Berlin — going for telc B2!", createdAt: "2026-08-10T10:00:00Z" }], createdAt: "2026-08-10T09:00:00Z" },
  { _id: `post-${POST_SEQ++}`, authorId: "stu-3", authorName: "Chloé Martin", authorRole: "Student", space: "Wins",
    text: "Passed my A2 mock quiz at 92% today 🎉 The flashcards really work.", likes: ["stu-4", "stu-5", TEACHER_ID], comments: [], createdAt: "2026-08-12T14:20:00Z" },
);

// A Zoom meeting link for a lesson (placeholder; swap for real Zoom API links).
const zoomUrl = () => `https://zoom.us/j/${Math.floor(1000000000 + Math.random() * 8999999999)}?pwd=exzellent`;

// ---- live stats: "online now" counter + gently-growing member social proof --
const ACTIVE = {};                       // userId -> lastSeen (ms)
const ACTIVE_WINDOW_MS = 5 * 60 * 1000;  // "active" = seen in the last 5 minutes
const STATS_EPOCH = Date.parse("2026-08-01T00:00:00Z");
const MEMBERS_BASE = 20000;              // social-proof starting number
const markActive = (id) => { if (id) ACTIVE[id] = Date.now(); };
// Real active sessions in the window + a gentle, slowly-varying base so the
// number reads as "alive" even in a quiet demo.
const onlineCount = () => {
  const now = Date.now();
  const real = Object.values(ACTIVE).filter((t) => now - t < ACTIVE_WINDOW_MS).length;
  const base = 26 + Math.round((Math.sin(now / 700000) + 1) * 9); // ~26–44, drifts slowly
  return base + real;
};
// Grows ~1 every 6 minutes of real elapsed time — monotonic, no storage needed.
const memberCount = () => MEMBERS_BASE + Math.max(0, Math.floor((Date.now() - STATS_EPOCH) / (6 * 60 * 1000)));
const myCredits = (id) => {
  if (id in MY_CREDITS) return MY_CREDITS[id];
  const s = STUDENTS.find((x) => x._id === id);
  return s ? (s.credits ?? 0) : DEFAULT_CREDITS;
};
const creditCostFor = (groupType) => (groupType === "one-to-one" ? 1000 : groupType === "class" ? 250 : 50);
// The demo login token is "mock.<Role>.<id>" — pull the user id out of it.
const userIdFromToken = (t = "") => { const p = String(t).split("."); return p[0] === "mock" ? p[2] : null; };

// Resolve a student's live profile: prefer the real STUDENTS record (persisted,
// shown in the admin list); fall back to the synthetic demo student + saved edits.
const studentById = (id) => STUDENTS.find((s) => s._id === id);
const studentProfile = (id, role) => {
  const s = studentById(id);
  if (s) { const { password, ...rest } = s; return { ...rest, userType: "Student", role: "Student", credits: myCredits(id) }; }
  const u = userFor(role || "Student");
  u._id = id;
  u.credits = myCredits(id);
  Object.assign(u, PROFILE_EDITS[id] || {});
  return u;
};

// ---- student lecture-progress helpers --------------------------------------
const countLectures = (course) => (course.sections || []).reduce((t, s) => t + (s.lectures?.length || 0), 0);
// Recompute an enrollment's percentage from its completed-lecture list.
const recalcEnrollment = (e) => {
  const c = COURSES.find((x) => x._id === e.courseId) || {};
  const total = countLectures(c);
  const done = (e.completed || []).length;
  e.completedPercentage = total ? Math.round((done / total) * 100) : 0;
  e.progress = e.completedPercentage;
  return e;
};
// Shape a full progress payload for GET /api/enrollments/:id (feeds ProgressModal + CourseDetails).
const enrollmentDetail = (e) => {
  const c = COURSES.find((x) => x._id === e.courseId) || {};
  const total = countLectures(c);
  const done = (e.completed || []).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  return {
    success: true,
    completedPercentage: pct,
    completedLectures: done,
    totalLectures: total,
    course: c,
    enrollment: { _id: e._id, courseId: e.courseId, course: c, progress: e.completed || [], completedPercentage: pct },
    // A certificate is earned once every lecture is complete.
    certificateEligible: total > 0 && done >= total,
    quiz: e.quiz || null,
  };
};

// ---- spaced repetition (a light SM-2 / Leitner scheduler) -------------------
const todayStr = (d = new Date()) => new Date(d).toISOString().slice(0, 10);
const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
// Grade a card: 0 = Again, 1 = Hard, 2 = Good, 3 = Easy. Returns the new schedule.
const scheduleCard = (prev, grade) => {
  let { interval = 0, reps = 0, ease = 2.5 } = prev || {};
  if (grade <= 0) { reps = 0; interval = 0; ease = Math.max(1.3, ease - 0.2); }
  else {
    reps += 1;
    ease = Math.max(1.3, ease + (grade === 3 ? 0.15 : grade === 2 ? 0 : -0.15));
    interval = reps === 1 ? 1 : reps === 2 ? 3 : Math.round(interval * ease) || 1;
    if (grade === 1) interval = Math.max(1, Math.round(interval / 2));
  }
  return { interval, reps, ease, due: addDays(interval) };
};
// All flashcards from a student's enrolled courses, tagged with a stable cardId.
const reviewCardsFor = (studentId) => {
  const cards = [];
  MY_ENROLLMENTS.filter((e) => e.studentId === studentId).forEach((e) => {
    const c = COURSES.find((x) => x._id === e.courseId);
    const fcs = c?.studyKit?.flashcards || [];
    fcs.forEach((f, i) => cards.push({ cardId: `${e.courseId}::${i}`, courseId: e.courseId, courseTitle: c.title, front: f.front, back: f.back }));
  });
  return cards;
};
const bumpStreak = (studentId) => {
  const t = todayStr();
  const s = STREAKS[studentId] || { count: 0, lastDay: "" };
  if (s.lastDay === t) return s;                       // already counted today
  const yesterday = addDays(-1);
  s.count = s.lastDay === yesterday ? s.count + 1 : 1; // consecutive day or reset
  s.lastDay = t;
  STREAKS[studentId] = s;
  return s;
};

// Enrollments are the SINGLE source of truth for earnings + active students +
// the monthly chart. `monthsAgo` is resolved to a real date at request time so
// the last-6-months window always contains data. amount = what the student paid.
const ENROLLMENTS = [
  { _id: "enr-01", student: "stu-1", courseId: "course-001", amount: 149, monthsAgo: 5 },
  { _id: "enr-02", student: "stu-3", courseId: "course-001", amount: 149, monthsAgo: 5 },
  { _id: "enr-03", student: "stu-4", courseId: "course-002", amount: 199, monthsAgo: 4 },
  { _id: "enr-04", student: "stu-1", courseId: "course-002", amount: 199, monthsAgo: 4 },
  { _id: "enr-05", student: "stu-5", courseId: "course-001", amount: 149, monthsAgo: 3 },
  { _id: "enr-06", student: "stu-6", courseId: "course-002", amount: 199, monthsAgo: 3 },
  { _id: "enr-07", student: "stu-3", courseId: "course-002", amount: 199, monthsAgo: 2 },
  { _id: "enr-08", student: "stu-4", courseId: "course-001", amount: 149, monthsAgo: 2 },
  { _id: "enr-09", student: "stu-5", courseId: "course-002", amount: 199, monthsAgo: 1 },
  { _id: "enr-10", student: "stu-6", courseId: "course-001", amount: 149, monthsAgo: 1 },
  { _id: "enr-11", student: "stu-1", courseId: "course-002", amount: 199, monthsAgo: 1 },
  { _id: "enr-12", student: "stu-3", courseId: "course-001", amount: 149, monthsAgo: 0 },
  { _id: "enr-13", student: "stu-4", courseId: "course-002", amount: 199, monthsAgo: 0 },
  { _id: "enr-14", student: "stu-5", courseId: "course-001", amount: 149, monthsAgo: 0 },
  { _id: "enr-15", student: "stu-6", courseId: "course-002", amount: 199, monthsAgo: 0 },
  { _id: "enr-16", student: "stu-2", courseId: "course-001", amount: 149, monthsAgo: 0 },
  { _id: "enr-17", student: "stu-2", courseId: "course-002", amount: 199, monthsAgo: 4 },
  { _id: "enr-18", student: "stu-5", courseId: "course-002", amount: 199, monthsAgo: 3 },
];

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Each enrollment carries a REAL stored `date` (YYYY-MM-DD). The seed rows use
// a `monthsAgo` offset only as a generator: on first run we stamp a concrete,
// distinct date on every row (see ensureEnrollmentDates) and persist it, after
// which the date is the source of truth and never recomputed.
function ensureEnrollmentDates() {
  const now = new Date();
  let changed = false;
  ENROLLMENTS.forEach((e, i) => {
    if (!e.date) {
      const day = ((i * 7 + 5) % 27) + 1; // distinct day within the month
      let d = new Date(now.getFullYear(), now.getMonth() - (e.monthsAgo || 0), day);
      // Never stamp a future date: clamp current-month rows to on/before today.
      if (d > now) d = new Date(now.getFullYear(), now.getMonth(), Math.max(1, now.getDate() - (i % 6)));
      e.date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      changed = true;
    }
  });
  return changed;
}
// [year, month(1-12)] parsed straight from the stored string (no timezone math).
const ymOf = (dateStr) => { const [y, m] = String(dateStr).split("-").map(Number); return [y, m]; };
const monthsAgoOf = (dateStr) => {
  const now = new Date();
  const [y, m] = ymOf(dateStr);
  return (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m);
};

// Compute the whole teacher dashboard live from COURSES + ENROLLMENTS.
// Nothing here is hardcoded — add a course, a section, or an enrollment and
// the returned numbers change accordingly.
function computeTeacherDashboard() {
  const mine = COURSES.filter((c) => !c.instructor || c.instructor === TEACHER_ID);
  const myIds = new Set(mine.map((c) => c._id));
  const myEnr = ENROLLMENTS.filter((e) => myIds.has(e.courseId));

  // last 6 months (oldest -> newest); bucket index 5 = current month
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ y: d.getFullYear(), m: d.getMonth() + 1, label: MONTH_LABELS[d.getMonth()], value: 0 });
  }
  myEnr.forEach((e) => {
    const [y, m] = ymOf(e.date);
    const bucket = months.find((b) => b.y === y && b.m === m);
    if (bucket) bucket.value += e.amount;
  });

  const curY = now.getFullYear(), curM = now.getMonth() + 1;
  const inThisMonth = (e) => { const [y, m] = ymOf(e.date); return y === curY && m === curM; };

  const total = myEnr.reduce((s, e) => s + e.amount, 0);
  const thisMonth = months[5].value;
  const lastMonth = months[4].value;
  const deltaPct = lastMonth ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : 0;

  const activeStudents = new Set(myEnr.map((e) => e.student)).size;
  const newStudentsThisMonth = new Set(myEnr.filter(inThisMonth).map((e) => e.student)).size;
  const lessons = mine.reduce((s, c) => s + (Array.isArray(c.sections) ? c.sections.length : 0), 0);
  const published = mine.filter((c) => c.isPublished).length;

  return {
    success: true,
    earnings: {
      currency: "€",
      total,
      thisMonth,
      lastMonth,
      deltaPct,
      monthly: months.map((m) => ({ label: m.label, value: m.value })),
    },
    students: { active: activeStudents, newThisMonth: newStudentsThisMonth },
    courses: { total: mine.length, published },
    lessons,
    aiGenerations: lessons * FORMATS_PER_LESSON,
  };
}

// Enrolled students across the teacher's courses, grouped per student with the
// courses they took and how much they've paid. Real data from ENROLLMENTS.
function teacherStudents() {
  const mine = COURSES.filter((c) => !c.instructor || c.instructor === TEACHER_ID);
  const titleById = Object.fromEntries(mine.map((c) => [c._id, c.title]));
  const myIds = new Set(mine.map((c) => c._id));
  const info = Object.fromEntries(STUDENTS.map((s) => [s._id, s]));
  const grouped = {};
  ENROLLMENTS.filter((e) => myIds.has(e.courseId)).forEach((e) => {
    const g = grouped[e.student] || (grouped[e.student] = { courseIds: new Set(), totalPaid: 0, recentDate: "" });
    g.courseIds.add(e.courseId);
    g.totalPaid += e.amount;
    if (!g.recentDate || e.date > g.recentDate) g.recentDate = e.date;
  });
  return Object.entries(grouped)
    .map(([id, g]) => {
      const s = info[id] || {};
      const courses = [...g.courseIds].map((cid) => titleById[cid] || cid);
      return {
        _id: id,
        name: s.name || id,
        email: s.email || "",
        country: s.country || "",
        paid: s.paid !== false,
        courses,
        courseCount: courses.length,
        totalPaid: g.totalPaid,
        recentDate: g.recentDate,
        recentMonthsAgo: monthsAgoOf(g.recentDate),
      };
    })
    .sort((a, b) => b.totalPaid - a.totalPaid);
}

// Earnings breakdown: headline figures + chart + per-course revenue + recent
// transactions. All derived from ENROLLMENTS.
function teacherEarnings() {
  const base = computeTeacherDashboard().earnings;
  const mine = COURSES.filter((c) => !c.instructor || c.instructor === TEACHER_ID);
  const titleById = Object.fromEntries(mine.map((c) => [c._id, c.title]));
  const myIds = new Set(mine.map((c) => c._id));
  const info = Object.fromEntries(STUDENTS.map((s) => [s._id, s]));
  const myEnr = ENROLLMENTS.filter((e) => myIds.has(e.courseId));

  const byCourse = mine
    .map((c) => {
      const es = myEnr.filter((e) => e.courseId === c._id);
      return {
        _id: c._id,
        title: c.title,
        students: new Set(es.map((e) => e.student)).size,
        revenue: es.reduce((s, e) => s + e.amount, 0),
      };
    })
    .sort((a, b) => b.revenue - a.revenue);

  const recent = [...myEnr]
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)) // newest first
    .slice(0, 8)
    .map((e) => ({
      student: (info[e.student] || {}).name || e.student,
      course: titleById[e.courseId] || e.courseId,
      amount: e.amount,
      date: e.date,
    }));

  return { success: true, ...base, byCourse, recent };
}

// Admin students list: each student shaped the way the admin page expects
// (student_Userid, enrolledCourses, enrolledCount) with their REAL enrollments.
function adminStudents() {
  const titleById = Object.fromEntries(COURSES.map((c) => [c._id, c.title]));
  return STUDENTS.map((s) => {
    const courseIds = [...new Set(ENROLLMENTS.filter((e) => e.student === s._id).map((e) => e.courseId))];
    const enrolledCourses = courseIds.map((cid) => ({ title: titleById[cid] || cid, progress: 0 }));
    return {
      _id: s._id,
      name: s.name,
      paid: s.paid,
      phone: s.phone || "-",
      gender: s.gender || "-",
      dateOfBirth: s.dateOfBirth || null,
      referral: s.referral || "-",
      country: s.country,
      credits: s.credits,
      isApproved: s.isApproved !== false,
      status: s.status || "active",
      student_Userid: { _id: s._id, email: s.email, userType: "Student" },
      enrolledCount: enrolledCourses.length,
      enrolledCourses,
    };
  });
}

// Admin teacher-card: the teacher profile plus their live stats (students,
// courses, earnings) so the admin database shows real numbers. The main teacher
// gets real figures from the dataset; admin-added teachers start at zero.
function teacherCard(t) {
  const d = t._id === TEACHER_ID ? computeTeacherDashboard() : null;
  return {
    ...t,
    userId: t._id,
    students: d ? d.students.active : 0,
    courseCount: d ? d.courses.total : 0,
    publishedCourses: d ? d.courses.published : 0,
    earningsTotal: d ? d.earnings.total : 0,
    earningsMonthly: d ? d.earnings.monthly : [],
  };
}

/* ------------------------------------------------------- speech analysis port
 * Pronunciation scoring ported from the voice-analyzer project
 * (analyzer/pronunciation.py). The transcript comes from Whisper; we compare it
 * to a target sentence with word-level Levenshtein alignment. Same result
 * contract: transcript, reference, word_error_rate, pronunciation_score (0-100),
 * per_word [{word,status,matched,heard?}], summary, syllables_spoken.
 */
function speechNormalise(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[’‘“”]/g, "")
    .replace(/[^a-z\s']/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}
function _editMatrix(ref, hyp) {
  const n = ref.length, m = hyp.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 0; i <= n; i++) dp[i][0] = i;
  for (let j = 0; j <= m; j++) dp[0][j] = j;
  for (let i = 1; i <= n; i++)
    for (let j = 1; j <= m; j++) {
      const cost = ref[i - 1] === hyp[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  return dp;
}
function speechWER(ref, hyp) {
  if (ref.length === 0 && hyp.length === 0) return 0;
  return _editMatrix(ref, hyp)[ref.length][hyp.length] / Math.max(ref.length, 1);
}
function speechAlign(ref, hyp) {
  const dp = _editMatrix(ref, hyp);
  const out = [];
  let i = ref.length, j = hyp.length;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + (ref[i - 1] === hyp[j - 1] ? 0 : 1)) {
      if (ref[i - 1] === hyp[j - 1]) out.push({ word: ref[i - 1], status: "matched", matched: true });
      else out.push({ word: ref[i - 1], status: "substituted", matched: false, heard: hyp[j - 1] });
      i--; j--;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      out.push({ word: ref[i - 1], status: "missing", matched: false });
      i--;
    } else {
      out.push({ word: null, status: "extra", matched: false, heard: hyp[j - 1] });
      j--;
    }
  }
  return out.reverse();
}
function speechSyllables(text) {
  let total = 0;
  for (const word of speechNormalise(text)) {
    let groups = (word.match(/[aeiouy]+/g) || []).length;
    if (word.endsWith("e") && groups > 1) groups -= 1;
    total += Math.max(groups, 1);
  }
  return total;
}
function scoreSpeech(transcript, referenceText, language) {
  const ref = speechNormalise(referenceText);
  const hyp = speechNormalise(transcript);
  const wer = speechWER(ref, hyp);
  const pron = Math.max(0, Math.min(100, Math.round((1 - wer) * 1000) / 10));
  const perWord = speechAlign(ref, hyp);
  return {
    transcript: String(transcript || "").trim(),
    reference: String(referenceText || "").trim(),
    word_error_rate: Math.round(wer * 1000) / 1000,
    pronunciation_score: pron,
    per_word: perWord,
    summary: {
      matched: perWord.filter((w) => w.status === "matched").length,
      substituted: perWord.filter((w) => w.status === "substituted").length,
      missing: perWord.filter((w) => w.status === "missing").length,
      extra: perWord.filter((w) => w.status === "extra").length,
      reference_words: ref.length,
    },
    syllables_spoken: speechSyllables(transcript),
    language: language || null,
    model: "whisper-large-v3-turbo",
  };
}

// Call Groq chat completions. cb(err, result): result is text, or a parsed
// object when { json:true }. Powers the AI generators (exam / course / report).
// Pull a JSON object out of model text (handles reasoning/prose around it).
function extractJson(content) {
  const cleaned = String(content).replace(/<think>[\s\S]*?<\/think>/gi, "").replace(/```(?:json)?/gi, "");
  try { return JSON.parse(cleaned.trim()); } catch { /* fall through */ }
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first >= 0 && last > first) { try { return JSON.parse(cleaned.slice(first, last + 1)); } catch { /* nope */ } }
  return null;
}

function groqChat({ system, user, json = false, maxTokens = 1400, temperature = 0.6 }, cb) {
  if (!GROQ_API_KEY) { cb(new Error("GROQ_API_KEY is not set on the mock backend.")); return; }
  const sys = json ? system + " Output ONLY the JSON object — no markdown fences." : system;
  const payload = JSON.stringify({
    model: "qwen/qwen3.6-27b",
    // qwen3.6 is a reasoning model; reasoning_effort:"none" (+ /no_think) turns off
    // the <think> block so the answer fits the budget and doesn't burn tokens.
    reasoning_effort: "none",
    messages: [{ role: "system", content: sys }, { role: "user", content: "/no_think\n" + user }],
    max_tokens: json ? Math.max(maxTokens, 2048) : maxTokens,
    temperature,
  });
  const gReq = https.request({
    hostname: "api.groq.com", port: 443, path: "/openai/v1/chat/completions", method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + GROQ_API_KEY, "Content-Length": Buffer.byteLength(payload) },
  }, (gRes) => {
    let data = "";
    gRes.on("data", (c) => (data += c));
    gRes.on("end", () => {
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.message?.content;
        if (!content) { cb(new Error(parsed.error?.message || "No response from the model.")); return; }
        if (json) {
          const obj = extractJson(content);
          if (obj) cb(null, obj);
          else cb(new Error("The model did not return valid JSON. Please try again."));
        } else cb(null, content);
      } catch (e) { cb(new Error("Model response was invalid: " + e.message)); }
    });
  });
  gReq.on("error", (e) => cb(e));
  gReq.write(payload);
  gReq.end();
}

/* ---------------------------------------------------------------- calendar
 * A small Cal.com-style scheduler: teachers publish weekly availability,
 * students book open slots, bookings show on everyone's calendar, admin sees all.
 * Days are 0=Sun..6=Sat; times are "HH:MM" (24h).
 */
const AVAILABILITY = {
  [TEACHER_ID]: {
    slotMinutes: 30,
    days: {
      1: [["09:00", "12:00"], ["14:00", "17:00"]],
      2: [["09:00", "12:00"], ["14:00", "17:00"]],
      3: [["09:00", "12:00"]],
      4: [["14:00", "18:00"]],
      5: [["09:00", "13:00"]],
    },
  },
};
const BOOKINGS = [];
let BOOKING_SEQ = 1;

// ---- messaging (students ↔ teachers ↔ admin) ----
const ADMIN_CONTACT = { id: "mock-admin-001", name: "Admin", role: "Admin" };
const MESSAGES = [];
let MESSAGE_SEQ = 1;

// Who a given user may message.
function messageContacts(role, userId) {
  if (role === "Admin") {
    return [
      ...TEACHERS.map((t) => ({ id: t._id, name: t.name, role: "Teacher" })),
      ...STUDENTS.map((s) => ({ id: s._id, name: s.name, role: "Student" })),
    ];
  }
  if (role === "Teacher") {
    return [ADMIN_CONTACT, ...teacherStudents().map((s) => ({ id: s._id, name: s.name, role: "Student" }))];
  }
  // Student → all teachers + admin
  return [ADMIN_CONTACT, ...TEACHERS.map((t) => ({ id: t._id, name: t.name, role: "Teacher" }))];
}

function seedMessages() {
  if (MESSAGES.length) return false;
  const now = new Date();
  const at = (minsAgo) => new Date(now.getTime() - minsAgo * 60000).toISOString();
  const push = (fromId, fromName, fromRole, toId, toName, toRole, text, minsAgo, read) =>
    MESSAGES.push({ _id: `msg-${MESSAGE_SEQ++}`, fromId, fromName, fromRole, toId, toName, toRole, text, date: at(minsAgo), read: !!read });
  push("mock-admin-001", "Admin", "Admin", TEACHER_ID, "Lena Hoffmann", "Teacher", "Welcome aboard, Lena! Let us know if you need anything.", 2880, true);
  push(TEACHER_ID, "Lena Hoffmann", "Teacher", "mock-admin-001", "Admin", "Admin", "Thanks! All set up and loving it.", 2820, true);
  push("stu-1", "Anna Müller", "Student", TEACHER_ID, "Lena Hoffmann", "Teacher", "Hi Lena, could we reschedule Thursday's lesson?", 120, false);
  return true;
}

// Bookable people across the three labs. Lena is also the demo teacher.
// role: tutor (language) | mentor (skill) | coach (growth). location = where.
const PROVIDERS = [
  { _id: TEACHER_ID, name: "Lena Hoffmann", role: "tutor", lab: "language", subject: "German & English", location: "Online" },
  { _id: "tutor-2", name: "Aylin Kaya", role: "tutor", lab: "language", subject: "German A1–B2", location: "Cottbus, DE" },
  { _id: "tutor-3", name: "Marco Rossi", role: "tutor", lab: "language", subject: "Italian & Spanish", location: "Online" },
  { _id: "mentor-1", name: "David Chen", role: "mentor", lab: "skill", subject: "Full-stack / React", location: "Online" },
  { _id: "mentor-2", name: "Sara Novak", role: "mentor", lab: "skill", subject: "AI & Python", location: "Berlin, DE" },
  { _id: "coach-1", name: "Jonas Weber", role: "coach", lab: "growth", subject: "Focus & habits", location: "Online" },
  { _id: "coach-2", name: "Priya Nair", role: "coach", lab: "growth", subject: "Career direction", location: "Online" },
];

// Give every provider a weekly availability if they don't already have one.
function ensureProviderAvailability() {
  const patterns = [
    { 1: [["10:00", "13:00"]], 3: [["10:00", "13:00"]], 5: [["10:00", "13:00"]] },
    { 2: [["15:00", "18:00"]], 4: [["15:00", "18:00"]] },
    { 1: [["09:00", "12:00"]], 2: [["09:00", "12:00"]], 4: [["14:00", "17:00"]] },
  ];
  let changed = false;
  PROVIDERS.forEach((p, i) => {
    if (!AVAILABILITY[p._id]) { AVAILABILITY[p._id] = { slotMinutes: 30, days: patterns[i % patterns.length] }; changed = true; }
  });
  return changed;
}
const providerById = (id) => PROVIDERS.find((p) => p._id === id);

const hhmmToMin = (t) => { const [h, m] = String(t).split(":").map(Number); return h * 60 + m; };
const minToHhmm = (x) => `${String(Math.floor(x / 60)).padStart(2, "0")}:${String(x % 60).padStart(2, "0")}`;
const dateStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// Open slots for a teacher across [fromISO, toISO], minus booked ones and past times.
function computeSlots(teacherId, fromISO, toISO) {
  const av = AVAILABILITY[teacherId];
  if (!av || !fromISO || !toISO) return [];
  const from = new Date(fromISO + "T00:00:00");
  const to = new Date(toISO + "T00:00:00");
  const now = new Date();
  const booked = new Set(
    BOOKINGS.filter((b) => b.teacherId === teacherId && b.status !== "cancelled").map((b) => b.date + " " + b.start)
  );
  const out = [];
  for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    const windows = av.days[d.getDay()] || [];
    const ds = dateStr(d);
    windows.forEach(([s, e]) => {
      for (let t = hhmmToMin(s); t + av.slotMinutes <= hhmmToMin(e); t += av.slotMinutes) {
        const start = minToHhmm(t);
        const slotDate = new Date(ds + "T" + start + ":00");
        if (slotDate < now) continue; // no past slots
        if (!booked.has(ds + " " + start)) out.push({ date: ds, start, end: minToHhmm(t + av.slotMinutes) });
      }
    });
  }
  return out;
}

// Seed a few demo LESSONS across the coming days so calendars aren't empty.
function seedBookings() {
  if (BOOKINGS.length) return false;
  const now = new Date();
  const mk = (daysAhead, start, end, title, studentId, studentName) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysAhead);
    BOOKINGS.push({
      _id: `bk-${BOOKING_SEQ++}`, teacherId: TEACHER_ID, providerId: TEACHER_ID,
      teacherName: "Lena Hoffmann", providerName: "Lena Hoffmann", providerRole: "tutor",
      location: "Online", lab: "language",
      studentId: studentId || "", studentName: studentName || "",
      date: dateStr(d), start, end, title, topic: title,
      status: "confirmed", meetingUrl: zoomUrl(), createdAt: now.toISOString(),
    });
  };
  mk(1, "10:00", "11:00", "German A1 · speaking", "stu-1", "Anna Müller");
  mk(1, "14:00", "15:00", "English B2 · interview prep", "stu-3", "Chloé Martin");
  mk(3, "09:30", "10:30", "German A1 · grammar", "stu-4", "Diego Alvarez");
  mk(4, "16:00", "17:00", "English B2 · writing", "stu-5", "Emine Yıldız");
  mk(7, "11:00", "12:00", "German A1 · vocabulary", "stu-1", "Anna Müller");
  return true;
}

let SECTION_SEQ = 100;

/* ---------------------------------------------------------- disk persistence */
// The teacher's live data (courses, sections, enrollments) is saved to
// mock-backend/data.json so it survives a server restart. Delete that file to
// reset back to the seed data above. (It's gitignored so demo edits don't spam
// the autosave git watcher.)
const DATA_FILE = path.join(__dirname, "data.json");

function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ COURSES, ENROLLMENTS, TEACHERS, STUDENTS, AVAILABILITY, BOOKINGS, BOOKING_SEQ, PROVIDERS, MESSAGES, MESSAGE_SEQ, MY_ENROLLMENTS, MYENR_SEQ, MY_CREDITS, PROFILE_EDITS, WEBINARS, WEBINAR_SEQ, CAREERS, CAREER_SEQ, REFERRALS, REFERRAL_SEQ, JOB_APPLICANTS, REVIEW, STREAKS, ASSIGNMENTS, ASSIGNMENT_SEQ, SUBMISSIONS, SUBMISSION_SEQ, WAITLIST, WAITLIST_SEQ, POSTS, POST_SEQ, SECTION_SEQ }, null, 2));
  } catch (e) {
    console.log("  ! could not save data.json:", e.message);
  }
}

function loadData() {
  try {
    if (!fs.existsSync(DATA_FILE)) return false;
    const d = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    if (Array.isArray(d.COURSES)) {
      COURSES.length = 0;
      COURSES.push(...d.COURSES);
      // Backfill demo-course lectures for saves made before lecture content existed
      // (only when the saved course has zero lectures, so teacher edits are kept).
      COURSES.forEach((c) => {
        const seed = SEED_LECTURES[c._id];
        const lectureCount = (c.sections || []).reduce((t, s) => t + (s.lectures?.length || 0), 0);
        if (seed && lectureCount === 0) c.sections = JSON.parse(JSON.stringify(seed));
        // Backfill the demo study kit (flashcards/quiz) for saves that predate it.
        if (SEED_STUDYKITS[c._id] && !c.studyKit) c.studyKit = JSON.parse(JSON.stringify(SEED_STUDYKITS[c._id]));
      });
    }
    if (Array.isArray(d.ENROLLMENTS)) { ENROLLMENTS.length = 0; ENROLLMENTS.push(...d.ENROLLMENTS); }
    if (Array.isArray(d.STUDENTS)) {
      STUDENTS.length = 0;
      STUDENTS.push(...d.STUDENTS);
      // Make sure the primary demo student exists even in an older save.
      if (!STUDENTS.some((s) => (s.email || "").toLowerCase() === PRIMARY_STUDENT.email)) STUDENTS.unshift(PRIMARY_STUDENT);
      // Backfill demo passwords for accounts saved before passwords existed.
      STUDENTS.forEach((s) => {
        if (!s.password) s.password = (s.email || "").toLowerCase() === PRIMARY_STUDENT.email ? "Kos12345" : "Student123";
        if (s.isApproved === undefined) s.isApproved = true;
        if (!s.status) s.status = "active";
      });
    }
    if (d.AVAILABILITY && typeof d.AVAILABILITY === "object") { Object.keys(AVAILABILITY).forEach((k) => delete AVAILABILITY[k]); Object.assign(AVAILABILITY, d.AVAILABILITY); }
    if (Array.isArray(d.BOOKINGS)) { BOOKINGS.length = 0; BOOKINGS.push(...d.BOOKINGS); }
    if (typeof d.BOOKING_SEQ === "number") BOOKING_SEQ = d.BOOKING_SEQ;
    if (Array.isArray(d.PROVIDERS)) { PROVIDERS.length = 0; PROVIDERS.push(...d.PROVIDERS); }
    if (Array.isArray(d.MESSAGES)) { MESSAGES.length = 0; MESSAGES.push(...d.MESSAGES); }
    if (typeof d.MESSAGE_SEQ === "number") MESSAGE_SEQ = d.MESSAGE_SEQ;
    if (Array.isArray(d.MY_ENROLLMENTS)) { MY_ENROLLMENTS.length = 0; MY_ENROLLMENTS.push(...d.MY_ENROLLMENTS); }
    if (typeof d.MYENR_SEQ === "number") MYENR_SEQ = d.MYENR_SEQ;
    if (d.MY_CREDITS && typeof d.MY_CREDITS === "object") { Object.keys(MY_CREDITS).forEach((k) => delete MY_CREDITS[k]); Object.assign(MY_CREDITS, d.MY_CREDITS); }
    if (d.PROFILE_EDITS && typeof d.PROFILE_EDITS === "object") { Object.keys(PROFILE_EDITS).forEach((k) => delete PROFILE_EDITS[k]); Object.assign(PROFILE_EDITS, d.PROFILE_EDITS); }
    if (Array.isArray(d.WEBINARS)) { WEBINARS.length = 0; WEBINARS.push(...d.WEBINARS); }
    if (typeof d.WEBINAR_SEQ === "number") WEBINAR_SEQ = d.WEBINAR_SEQ;
    if (Array.isArray(d.CAREERS)) { CAREERS.length = 0; CAREERS.push(...d.CAREERS); }
    if (typeof d.CAREER_SEQ === "number") CAREER_SEQ = d.CAREER_SEQ;
    if (Array.isArray(d.REFERRALS)) { REFERRALS.length = 0; REFERRALS.push(...d.REFERRALS); }
    if (typeof d.REFERRAL_SEQ === "number") REFERRAL_SEQ = d.REFERRAL_SEQ;
    if (d.JOB_APPLICANTS && typeof d.JOB_APPLICANTS === "object") { Object.keys(JOB_APPLICANTS).forEach((k) => delete JOB_APPLICANTS[k]); Object.assign(JOB_APPLICANTS, d.JOB_APPLICANTS); }
    if (d.REVIEW && typeof d.REVIEW === "object") { Object.keys(REVIEW).forEach((k) => delete REVIEW[k]); Object.assign(REVIEW, d.REVIEW); }
    if (d.STREAKS && typeof d.STREAKS === "object") { Object.keys(STREAKS).forEach((k) => delete STREAKS[k]); Object.assign(STREAKS, d.STREAKS); }
    if (Array.isArray(d.ASSIGNMENTS)) { ASSIGNMENTS.length = 0; ASSIGNMENTS.push(...d.ASSIGNMENTS); }
    if (typeof d.ASSIGNMENT_SEQ === "number") ASSIGNMENT_SEQ = d.ASSIGNMENT_SEQ;
    if (Array.isArray(d.SUBMISSIONS)) { SUBMISSIONS.length = 0; SUBMISSIONS.push(...d.SUBMISSIONS); }
    if (typeof d.SUBMISSION_SEQ === "number") SUBMISSION_SEQ = d.SUBMISSION_SEQ;
    if (Array.isArray(d.WAITLIST)) { WAITLIST.length = 0; WAITLIST.push(...d.WAITLIST); }
    if (typeof d.WAITLIST_SEQ === "number") WAITLIST_SEQ = d.WAITLIST_SEQ;
    if (Array.isArray(d.POSTS)) { POSTS.length = 0; POSTS.push(...d.POSTS); }
    if (typeof d.POST_SEQ === "number") POST_SEQ = d.POST_SEQ;
    if (Array.isArray(d.TEACHERS)) {
      // Reuse the TEACHER reference for the main teacher so /me and the admin
      // list never diverge; keep any admin-added teachers as-is.
      TEACHERS.length = 0;
      d.TEACHERS.forEach((t) => {
        if (t._id === TEACHER_ID) { Object.assign(TEACHER, t); TEACHERS.push(TEACHER); }
        else TEACHERS.push(t);
      });
    }
    if (typeof d.SECTION_SEQ === "number") SECTION_SEQ = d.SECTION_SEQ;
    return true;
  } catch (e) {
    console.log("  ! could not load data.json (using seed):", e.message);
    return false;
  }
}

const WEBINARS = [
  {
    _id: "web-1", title: "A1 Level Kickoff Webinar",
    date: "2026-09-01", scheduledAt: "2026-09-01T17:00:00Z", endsAt: "2026-09-01T18:00:00Z",
    description: "Free intro session for new A1 learners.",
    language: "German", level: "A1", isPublic: true,
    thumbnail: "https://placehold.co/400x225?text=A1+Kickoff",
    meetingLink: "https://zoom.us/j/9001112223?pwd=exzellent", platform: "Zoom",
    instructors: [{ name: "Lena Hoffmann" }],
    // A generic logged-in student (mock-student-001) is pre-registered so the
    // "My webinars" card and calendar have something to show out of the box.
    registeredStudents: ["mock-student-001", "stu-1"],
    participants: ["mock-student-001", "stu-1"],
  },
  {
    _id: "web-2", title: "Career Growth in Germany",
    date: "2026-09-15", scheduledAt: "2026-09-15T16:00:00Z", endsAt: "2026-09-15T17:00:00Z",
    description: "Positioning, CV mastery and interview prep.",
    language: "English", level: "B2", isPublic: true,
    thumbnail: "https://placehold.co/400x225?text=Career+Growth",
    meetingLink: "https://zoom.us/j/9004445556?pwd=exzellent", platform: "Zoom",
    instructors: [{ name: "Lena Hoffmann" }],
    registeredStudents: ["stu-3"],
    participants: ["stu-3"],
  },
];
let WEBINAR_SEQ = 3;

const CAREERS = [
  { _id: "job-1", jobTitle: "Language Tutor (German)", department: "Teaching", location: "Remote", jobType: "Part-time", isActive: true, salary: "€18–28 / hr", description: "Teach A1–B2 German online.", keyResponsibilities: ["Run live lessons", "Give feedback"], requirements: ["C2 German", "Teaching experience"] },
  { _id: "job-2", jobTitle: "Frontend Developer", department: "Engineering", location: "Cottbus / Remote", jobType: "Full-time", isActive: true, salary: "€48k–62k", description: "Build the Exzellent learning platform.", keyResponsibilities: ["Ship React features", "Own UI quality"], requirements: ["React + Tailwind", "3+ years"] },
];
let CAREER_SEQ = 3;

// Referral codes (admin-managed)
const REFERRALS = [
  { _id: "ref-1", code: "WELCOME10", description: "10% off first course", uses: 12, reward: "10% discount", active: true, createdAt: "2026-06-01T09:00:00Z" },
];
let REFERRAL_SEQ = 2;
// Job applications + webinar registrations (per id)
const JOB_APPLICANTS = {}; // jobId -> [{ name, email, appliedAt }]

/* ------------------------------------------------------------------- router */

// ---- course/section mutation helpers (all mutate COURSES in place) ----------
const genId = (prefix) => `${prefix}-${++SECTION_SEQ}`;
const courseIdFrom = (path) => path.split("?")[0].split("/")[3];
const sectionIdFrom = (path) => path.split("?")[0].split("/")[5];
const findCourse = (path) => COURSES.find((c) => c._id === courseIdFrom(path));

const createCourseFrom = (body = {}) => {
  const c = {
    _id: genId("course"),
    title: body.title || "Untitled course",
    description: body.description || "",
    language: body.language || "",
    level: body.level || "",
    groupType: body.groupType || "regular",
    duration: body.duration || "",
    price: Number(body.price) || 0,
    instructor: TEACHER_ID,
    thumbnail: body.thumbnail || "https://placehold.co/400x300?text=New+Course",
    tags: Array.isArray(body.tags) ? body.tags : [],
    isPublished: false,
    createdAt: new Date().toISOString(),
    instructorDetails: INSTRUCTOR_DETAILS,
    // Keep AI-generated structure: sections with their lectures.
    sections: Array.isArray(body.sections)
      ? body.sections.map((s, i) => ({
          _id: genId("sec"),
          title: (s && s.title) || `Section ${i + 1}`,
          lectures: Array.isArray(s && s.lectures)
            ? s.lectures.map((l, li) => ({ _id: genId("lec"), title: typeof l === "string" ? l : (l && l.title) || `Lecture ${li + 1}`, duration: 0 }))
            : [],
        }))
      : [],
    // Keep the AI study kit (flashcards / quiz / summary / key terms) on the course.
    studyKit: body.studyKit && typeof body.studyKit === "object" ? body.studyKit : null,
  };
  COURSES.push(c);
  return c;
};

// ---- signup / account helpers ---------------------------------------------
const genOtp = () => String(Math.floor(100000 + Math.random() * 900000));
const makeSignupToken = (email, role) => "signup." + Buffer.from(String(email)).toString("base64") + "." + role;
const parseSignupToken = (t = "") => {
  const p = String(t).split(".");
  if (p[0] !== "signup") return null;
  try { return { email: Buffer.from(p[1], "base64").toString("utf8"), role: p[2] }; } catch { return null; }
};
// Demo admin account (real login: admin@test.com / Admin123).
const ADMIN_ACCOUNT = { _id: "admin-001", name: "Admin", firstName: "Admin", lastName: "", email: "admin@test.com", password: "Admin123", userType: "Admin", role: "Admin", isApproved: true, status: "active" };
const findAccountByEmail = (email = "") => {
  const e = String(email).toLowerCase();
  if (ADMIN_ACCOUNT.email.toLowerCase() === e) return ADMIN_ACCOUNT;
  return TEACHERS.find((t) => (t.email || "").toLowerCase() === e)
      || STUDENTS.find((s) => (s.email || "").toLowerCase() === e)
      || null;
};
// Strip the password before returning an account to the client.
const pub = (o) => { if (!o || typeof o !== "object") return o; const { password, ...rest } = o; return rest; };
const createStudentAccount = (email, body = {}) => {
  const name = body.name || email;
  const [firstName, ...rest] = String(name).split(" ");
  // Attribute the sign-up to whoever's invite code was used (powers affiliate payouts).
  const ref = findReferral(body.inviteCode || body.referralCode);
  if (ref) ref.uses = (ref.uses || 0) + 1;
  const s = {
    _id: genId("stu"), name, firstName: firstName || name, lastName: rest.join(" "),
    email, password: body.password || "", userType: "Student", role: "Student", paid: false,
    credits: SIGNUP_BONUS,                       // welcome credits for every new member
    country: body.country || "", phone: body.phone || "", gender: body.gender || "",
    dateOfBirth: body.dateOfBirth || null,
    referral: (body.inviteCode || body.referralCode || body.referral || "-"),
    invitedByCode: ref ? ref.code : (body.inviteCode || body.referralCode || null),
    invitedBy: ref ? (ref.ownerId || null) : null,
    // Active immediately so you can sign up and log in right away (demo).
    isApproved: true, status: "active", emailVerified: true, createdAt: new Date().toISOString(),
  };
  STUDENTS.push(s);
  return s;
};
// Turn an email into a readable name: "john.doe@x.com" -> "John Doe".
const prettyNameFromEmail = (email = "") => {
  const local = String(email).split("@")[0] || "Member";
  const name = local.split(/[._\-+]+/).filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  return name || "Member";
};
// Fetch the STUDENTS record for an email, creating an active one on first login
// so every demo student has their own persistent, editable identity.
const ensureStudentByEmail = (email) => {
  let s = STUDENTS.find((x) => (x.email || "").toLowerCase() === String(email).toLowerCase());
  if (!s) {
    const name = prettyNameFromEmail(email);
    const [firstName, ...rest] = name.split(" ");
    s = {
      _id: genId("stu"), name, firstName: firstName || name, lastName: rest.join(" "),
      email, userType: "Student", role: "Student", paid: false, credits: DEFAULT_CREDITS,
      country: "", phone: "", gender: "", dateOfBirth: null, referral: "-",
      isApproved: true, status: "active", emailVerified: true, createdAt: new Date().toISOString(),
    };
    STUDENTS.push(s);
  }
  return s;
};
const createTeacherAccount = (email, body = {}) => {
  const nm = body.name || `${body.firstName || ""} ${body.lastName || ""}`.trim() || email;
  const [firstName, ...rest] = String(nm).split(" ");
  const id = genId("teacher");
  const t = {
    profileImage: "https://res.cloudinary.com/dsgxyezcm/image/upload/v1767878441/Anonymous_b5hlab.jpg",
    academicDegrees: [], teachingCertifications: [], examExpertise: [],
    teachingMethodologies: [], teachingFormat: [], bio: "",
    ...body,
    _id: id, userId: id, name: nm,
    firstName: body.firstName || firstName || nm, lastName: body.lastName || rest.join(" "),
    email, userType: "Teacher", role: "Teacher",
    countryOfResidence: body.countryOfResidence || body.country || "",
    taughtLanguages: body.taughtLanguages || body.subjects || [],
    subjects: body.subjects || body.taughtLanguages || [],
    isApproved: false, status: "pending", emailVerified: true, createdAt: new Date().toISOString(),
  };
  TEACHERS.push(t);
  return t;
};

const routes = [
  // ---- auth
  ["POST", /^\/api\/users\/login$/, (body) => {
    // Real email + password auth. The account must exist (seeded or signed up).
    const acct = findAccountByEmail(body.email);
    if (!acct) {
      return { success: false, message: "No account found with that email. Please sign up first." };
    }
    if (acct.isApproved === false) {
      return { success: false, message: "Your account is pending admin approval. Please check back once an admin has reviewed it." };
    }
    // Validate the password when the account has one (Google/OAuth accounts don't).
    if (acct.password && String(body.password || "") !== acct.password) {
      return { success: false, message: "Incorrect password. Please try again." };
    }
    const role = acct.userType || roleFromEmail(body.email);
    markActive(acct._id); // counts toward the "online now" number
    return { success: true, accessToken: makeToken(role, acct._id), ...pub(acct) };
  }],
  // Google/OAuth: no password — fetch-or-create the account for that email.
  ["POST", /^\/api\/users\/(google-auth|google-signup)$/, (body) => {
    const existing = findAccountByEmail(body.email);
    if (existing) {
      const role = existing.userType || roleFromEmail(body.email);
      return { success: true, accessToken: makeToken(role, existing._id), ...pub(existing) };
    }
    const role = roleFromEmail(body.email);
    if (role === "Student" && body.email) {
      const s = ensureStudentByEmail(body.email);
      return { success: true, accessToken: makeToken("Student", s._id), ...pub(s) };
    }
    const u = userFor(role, body.email || undefined);
    return { success: true, accessToken: makeToken(role, u._id), ...u };
  }],

  // ---- signup: email OTP -> verify -> create account (pending approval)
  ["POST", /^\/api\/users\/pre-signup$/, (body) => {
    const email = (body && body.email) || "";
    if (findAccountByEmail(email)) return { success: false, message: "An account with this email already exists." };
    // Invite-only gate: registration requires a valid invite/referral code.
    // Visitors without one are pointed to the waitlist instead.
    if (INVITE_ONLY && (body && body.userType) !== "Teacher") {
      if (!findReferral(body && (body.inviteCode || body.referralCode))) {
        return { success: false, needInvite: true, message: "Exzellent is invite-only. Enter a valid invite code, or request an invite." };
      }
    }
    const otp = genOtp();
    PENDING_OTPS[email.toLowerCase()] = { otp, userType: (body && body.userType) || "Student", inviteCode: (body && (body.inviteCode || body.referralCode)) || "" };
    console.log(`\n  ✉️   Signup code for ${email}:  ${otp}\n       (dev only — no real email is sent from the mock)\n`);
    return { success: true, message: "Verification code sent to your email.", devOtp: otp };
  }],
  ["POST", /^\/api\/users\/verify-email$/, (body) => {
    const email = ((body && body.email) || "").toLowerCase();
    const rec = PENDING_OTPS[email];
    if (!rec || String((body && body.otp) || "") !== rec.otp) {
      return { success: false, message: "Invalid or expired verification code." };
    }
    const role = (body && body.role) || rec.userType || "Student";
    return { success: true, token: makeSignupToken(email, role) };
  }],
  ["POST", /^\/api\/users\/complete-signup$/, (body, _p, _r, token) => {
    const parsed = parseSignupToken(token) || {};
    const email = parsed.email || (body && body.email);
    if (!email) return { success: false, message: "Missing or invalid verification token." };
    const rec = PENDING_OTPS[email.toLowerCase()];
    const payload = { ...(body || {}) };
    if (!payload.inviteCode && rec && rec.inviteCode) payload.inviteCode = rec.inviteCode; // carry code from pre-signup
    const s = createStudentAccount(email, payload);
    delete PENDING_OTPS[email.toLowerCase()];
    return { success: true, message: "Account created — you can log in now.", data: pub(s) };
  }],
  ["POST", /^\/api\/users\/complete-teacher-signup$/, (body, _p, _r, token) => {
    const parsed = parseSignupToken(token) || {};
    const email = parsed.email || (body && body.email);
    if (!email) return { success: false, message: "Missing or invalid verification token." };
    const t = createTeacherAccount(email, body || {});
    delete PENDING_OTPS[email.toLowerCase()];
    return { success: true, message: "Teacher application submitted — pending admin approval.", data: pub(t) };
  }],
  ["PUT", /^\/api\/users\/approve-student\/[^/]+$/, (_b, path) => {
    const id = path.split("/").pop();
    const s = STUDENTS.find((x) => x._id === id);
    if (s) { s.isApproved = true; s.status = "active"; }
    return { success: true, data: s };
  }],
  ["PUT", /^\/api\/users\/students\/[^/]+$/, (body, path) => {
    const id = path.split("/").pop();
    const s = STUDENTS.find((x) => x._id === id);
    if (s) Object.assign(s, body || {});
    return { success: true, data: s };
  }],
  ["DELETE", /^\/api\/users\/students\/[^/]+$/, (_b, path) => {
    const id = path.split("/").pop();
    const i = STUDENTS.findIndex((x) => x._id === id);
    if (i >= 0) STUDENTS.splice(i, 1);
    return { success: true, message: "Student deleted" };
  }],
  ["POST", /^\/api\/users\/refresh-token$/, (_b, _p, role) => ({
    success: true, accessToken: makeToken(role || "Student", "mock-refresh"),
  })],
  ["POST", /^\/api\/users\/logout$/, () => ({ success: true })],
  ["GET", /^\/api\/users\/profile$/, (_b, _p, role, token) => {
    if ((role || "Student") !== "Student") return { success: true, data: userFor(role || "Student") };
    const id = userIdFromToken(token) || "mock-student-001";
    return { success: true, data: studentProfile(id, role) };
  }],
  ["GET", /^\/api\/users\/getprofile\/[^/]+$/, (_b, path, role) => {
    const id = path.split("?")[0].split("/").pop();
    if ((role || "Student") !== "Student") { const u = userFor(role || "Student"); u._id = id; return { success: true, data: u }; }
    return { success: true, data: studentProfile(id, role) };
  }],
  ["PUT", /^\/api\/users\/updateprofile\/[^/]+$/, (body, path, role) => {
    const id = path.split("?")[0].split("/").pop();
    // Prefer mutating the real STUDENTS record (persists + shows in admin list).
    const s = studentById(id);
    if (s) {
      Object.assign(s, body || {});
      if (body && (body.firstName || body.lastName) && !body.name) s.name = `${s.firstName || ""} ${s.lastName || ""}`.trim();
      return { success: true, data: { ...s, credits: myCredits(id) } };
    }
    // Legacy synthetic demo student — keep saving edits to PROFILE_EDITS.
    PROFILE_EDITS[id] = { ...(PROFILE_EDITS[id] || {}), ...(body || {}) };
    return { success: true, data: studentProfile(id, role) };
  }],
  ["GET", /^\/api\/users\/admin\/students$/, () => ({ success: true, data: adminStudents() })],

  // ---- admin teachers database (list / create / approve / edit / delete)
  ["GET", /^\/api\/teachers$/, () => ({ success: true, data: TEACHERS.map(teacherCard) })],
  ["POST", /^\/api\/teachers$/, (body) => {
    const t = { isApproved: false, ...(body || {}), _id: genId("teacher") };
    t.userId = t._id;
    if (!t.name) t.name = `${t.firstName || ""} ${t.lastName || ""}`.trim() || "New Teacher";
    TEACHERS.push(t);
    return { success: true, data: t };
  }],
  ["PUT", /^\/api\/users\/approve-teacher\/[^/]+$/, (_b, path) => {
    const id = path.split("/").pop();
    const t = TEACHERS.find((x) => x._id === id);
    if (t) t.isApproved = true;
    return { success: true, data: t };
  }],

  // ---- teacher profile + live dashboard stats
  ["GET", /^\/api\/teachers\/me$/, () => ({ success: true, data: TEACHER })],
  ["PUT", /^\/api\/teachers\/profile$/, (body) => {
    Object.assign(TEACHER, body || {});
    return { success: true, data: TEACHER };
  }],
  ["GET", /^\/api\/teachers\/dashboard$/, () => computeTeacherDashboard()],
  ["GET", /^\/api\/teachers\/students$/, () => ({ success: true, data: teacherStudents() })],
  ["GET", /^\/api\/teachers\/earnings$/, () => teacherEarnings()],
  // generic teacher edit/delete by id (admin) — keep AFTER the specific routes above
  ["PUT", /^\/api\/teachers\/[^/]+$/, (body, path) => {
    const id = path.split("/").pop();
    const t = TEACHERS.find((x) => x._id === id);
    if (t) Object.assign(t, body || {});
    return { success: true, data: t };
  }],
  ["DELETE", /^\/api\/teachers\/[^/]+$/, (_b, path) => {
    const id = path.split("/").pop();
    const i = TEACHERS.findIndex((x) => x._id === id);
    if (i >= 0) TEACHERS.splice(i, 1);
    return { success: true, message: "Teacher deleted" };
  }],

  // ---- courses (Courses.jsx reads the array directly). Mutations persist in
  // COURSES so the dashboard reflects them in real time.
  ["POST", /^\/api\/courses\/teacher$/, (body) => createCourseFrom(body)],
  ["GET", /^\/api\/courses\/teacher$/, () => COURSES],
  ["GET", /^\/api\/courses\/coming-soon(\?.*)?$/, () => {
    const comingSoon = COURSES.filter((c) => !["German", "Spanish"].includes(c.language) && c.isPublished !== false);
    return { success: true, courses: comingSoon, total: comingSoon.length };
  }],
  ["POST", /^\/api\/courses$/, (body) => createCourseFrom(body)],
  ["GET", /^\/api\/courses(\?.*)?$/, () => COURSES],

  // ---- sections (nested under a course)
  ["POST", /^\/api\/courses\/[^/]+\/sections$/, (body, path) => {
    const course = findCourse(path);
    if (!course) return { success: false, message: "Course not found" };
    const section = { _id: genId("sec"), title: (body && body.title) || "New section", lectures: [], ...(body || {}) };
    course.sections = course.sections || [];
    course.sections.push(section);
    return { success: true, data: course };
  }],
  ["PUT", /^\/api\/courses\/[^/]+\/sections\/[^/]+$/, (body, path) => {
    const course = findCourse(path);
    if (!course) return { success: false, message: "Course not found" };
    const sid = sectionIdFrom(path);
    course.sections = (course.sections || []).map((s) => (s._id === sid ? { ...s, ...(body || {}) } : s));
    return { success: true, data: course };
  }],
  ["DELETE", /^\/api\/courses\/[^/]+\/sections\/[^/]+$/, (_b, path) => {
    const course = findCourse(path);
    if (!course) return { success: false, message: "Course not found" };
    const sid = sectionIdFrom(path);
    course.sections = (course.sections || []).filter((s) => s._id !== sid);
    return { success: true, data: course };
  }],

  // ---- publish / unpublish / approve
  ["POST", /^\/api\/courses\/[^/]+\/publish$/, (_b, path) => {
    const c = findCourse(path); if (c) c.isPublished = true;
    return { success: true, data: c };
  }],
  ["POST", /^\/api\/courses\/[^/]+\/unpublish$/, (_b, path) => {
    const c = findCourse(path); if (c) c.isPublished = false;
    return { success: true, data: c };
  }],
  ["PUT", /^\/api\/courses\/[^/]+\/approve$/, (_b, path) => {
    const c = findCourse(path); if (c) c.isPublished = true;
    return { success: true, data: c };
  }],

  // ---- single course: update / delete / read (generic, keep LAST)
  ["PUT", /^\/api\/courses\/[^/]+$/, (body, path) => {
    const c = findCourse(path);
    if (!c) return { success: false, message: "Course not found" };
    Object.assign(c, body || {});
    return { success: true, data: c };
  }],
  ["DELETE", /^\/api\/courses\/[^/]+$/, (_b, path) => {
    const id = courseIdFrom(path);
    const i = COURSES.findIndex((c) => c._id === id);
    if (i >= 0) COURSES.splice(i, 1);
    return { success: true, message: "Course deleted" };
  }],
  ["GET", /^\/api\/courses\/[^/]+$/, (_b, path) => {
    const c = findCourse(path);
    // Don't substitute a different real course for an unknown/deleted id —
    // return a safe empty shell so the UI degrades instead of showing the wrong course.
    return c || { _id: path.split("?")[0].split("/").pop(), title: "", sections: [], notFound: true };
  }],

  // ---- messaging (students ↔ teachers ↔ admin)
  ["GET", /^\/api\/messages\/contacts(\?.*)?$/, (_b, path) => {
    const u = new URL(path, "http://localhost");
    return { success: true, data: messageContacts(u.searchParams.get("role"), u.searchParams.get("userId")) };
  }],
  ["PUT", /^\/api\/messages\/read(\?.*)?$/, (_b, path) => {
    const u = new URL(path, "http://localhost");
    const userId = u.searchParams.get("userId");
    const withId = u.searchParams.get("with");
    MESSAGES.forEach((m) => { if (m.toId === userId && m.fromId === withId) m.read = true; });
    return { success: true };
  }],
  ["GET", /^\/api\/messages(\?.*)?$/, (_b, path) => {
    const u = new URL(path, "http://localhost");
    const userId = u.searchParams.get("userId");
    const withId = u.searchParams.get("with");
    let list = MESSAGES.filter((m) => m.fromId === userId || m.toId === userId);
    if (withId) list = list.filter((m) => m.fromId === withId || m.toId === withId);
    list = [...list].sort((a, b) => (a.date < b.date ? -1 : 1));
    return { success: true, data: list };
  }],
  ["POST", /^\/api\/messages$/, (body) => {
    const { fromId, fromName, fromRole, toId, toName, toRole, text } = body || {};
    if (!fromId || !toId || !String(text || "").trim()) return { success: false, message: "Missing message details." };
    const m = {
      _id: `msg-${MESSAGE_SEQ++}`, fromId, fromName: fromName || "", fromRole: fromRole || "",
      toId, toName: toName || "", toRole: toRole || "",
      text: String(text).trim().slice(0, 2000), date: new Date().toISOString(), read: false,
    };
    MESSAGES.push(m);
    return { success: true, data: m };
  }],

  // ---- calendar / scheduling (Cal.com-style)
  ["GET", /^\/api\/calendar\/providers(\?.*)?$/, (_b, path) => {
    const u = new URL(path, "http://localhost");
    const lab = u.searchParams.get("lab");
    const list = lab ? PROVIDERS.filter((p) => p.lab === lab) : PROVIDERS;
    return { success: true, data: list };
  }],
  ["GET", /^\/api\/calendar\/availability\/[^/]+$/, (_b, path) => {
    const id = path.split("?")[0].split("/").pop();
    return { success: true, data: AVAILABILITY[id] || { slotMinutes: 30, days: {} } };
  }],
  ["PUT", /^\/api\/calendar\/availability$/, (body) => {
    if (body && body.teacherId) AVAILABILITY[body.teacherId] = { slotMinutes: Number(body.slotMinutes) || 30, days: body.days || {} };
    return { success: true, data: AVAILABILITY[body && body.teacherId] };
  }],
  ["GET", /^\/api\/calendar\/slots\/[^/]+(\?.*)?$/, (_b, path) => {
    const u = new URL(path, "http://localhost");
    const id = u.pathname.split("/").pop();
    return { success: true, data: computeSlots(id, u.searchParams.get("from"), u.searchParams.get("to")) };
  }],
  // Create a LESSON. A teacher (or admin, on a teacher's behalf) places a lesson
  // on any day + hour; free-form duration/title; optionally assign a student.
  ["POST", /^\/api\/calendar\/bookings$/, (body) => {
    const teacherId = (body && (body.teacherId || body.providerId)) || "";
    const { date, start } = body || {};
    if (!teacherId || !date || !start) return { success: false, message: "Missing lesson details (teacher, date, time)." };
    const title = (body && (body.title || body.topic)) || "Lesson";
    let end = body && body.end;
    if (!end) { const dur = Number(body && body.durationMin) || 60; end = minToHhmm(hhmmToMin(start) + dur); }
    const provider = providerById(teacherId);
    const name = provider?.name || body.teacherName || "Teacher";
    const bk = {
      _id: `bk-${BOOKING_SEQ++}`,
      teacherId, providerId: teacherId,
      teacherName: name, providerName: name,
      providerRole: provider?.role || "tutor",
      location: provider?.location || body.location || "Online",
      lab: provider?.lab || null,
      studentId: body.studentId || "", studentName: body.studentName || "",
      date, start, end, title, topic: title,
      status: "confirmed", meetingUrl: zoomUrl(), createdAt: new Date().toISOString(),
    };
    BOOKINGS.push(bk);
    return { success: true, data: bk };
  }],
  // Edit a lesson (teacher edits own; admin edits any — enforced in the UI).
  ["PUT", /^\/api\/calendar\/bookings\/[^/]+$/, (body, path) => {
    const id = path.split("/").pop();
    const b = BOOKINGS.find((x) => x._id === id);
    if (!b) return { success: false, message: "Lesson not found." };
    ["date", "start", "end", "title", "studentId", "studentName", "location"].forEach((k) => {
      if (body && body[k] !== undefined) b[k] = body[k];
    });
    if (body && body.title !== undefined) b.topic = body.title;
    return { success: true, data: b };
  }],
  ["GET", /^\/api\/calendar\/bookings(\?.*)?$/, (_b, path) => {
    const u = new URL(path, "http://localhost");
    const role = u.searchParams.get("role");
    const userId = u.searchParams.get("userId");
    let list = BOOKINGS.filter((b) => b.status !== "cancelled");
    if (role === "Teacher" && userId) list = list.filter((b) => (b.providerId || b.teacherId) === userId);
    else if (role === "Student" && userId) list = list.filter((b) => b.studentId === userId);
    list = [...list].sort((a, b) => (a.date + a.start < b.date + b.start ? -1 : 1));
    return { success: true, data: list };
  }],
  ["DELETE", /^\/api\/calendar\/bookings\/[^/]+$/, (_b, path) => {
    const id = path.split("/").pop();
    const i = BOOKINGS.findIndex((x) => x._id === id);
    if (i >= 0) BOOKINGS.splice(i, 1);
    return { success: true, message: "Lesson deleted" };
  }],
  // Attendance: a student joining the class marks themselves present (once).
  ["POST", /^\/api\/calendar\/bookings\/[^/]+\/attend$/, (_b, path, role, token) => {
    const id = path.split("?")[0].split("/")[4];
    const b = BOOKINGS.find((x) => x._id === id);
    if (!b) return { success: false, message: "Class not found." };
    const sid = userIdFromToken(token) || "mock-student-001";
    b.attendance = b.attendance || [];
    if (!b.attendance.some((a) => a.studentId === sid)) {
      const s = studentById(sid);
      b.attendance.push({ studentId: sid, name: (s && s.name) || "Student", joinedAt: new Date().toISOString() });
    }
    return { success: true, data: b };
  }],
  // Who attended a given class (teacher/admin view).
  ["GET", /^\/api\/calendar\/bookings\/[^/]+\/attendance$/, (_b, path) => {
    const id = path.split("?")[0].split("/")[4];
    const b = BOOKINGS.find((x) => x._id === id);
    return { success: true, data: (b && b.attendance) || [], title: (b && b.title) || "" };
  }],
  // A student's own attendance summary (classes attended vs. booked).
  ["GET", /^\/api\/calendar\/my-attendance$/, (_b, _p, _r, token) => {
    const sid = userIdFromToken(token) || "mock-student-001";
    const mine = BOOKINGS.filter((b) => b.studentId === sid && b.status !== "cancelled");
    const attended = mine.filter((b) => (b.attendance || []).some((a) => a.studentId === sid));
    return { success: true, attendedCount: attended.length, bookedCount: mine.length,
      classes: mine.map((b) => ({ _id: b._id, title: b.title, date: b.date, start: b.start, teacherName: b.teacherName || b.providerName, attended: (b.attendance || []).some((a) => a.studentId === sid) })) };
  }],
  // Single class/booking (for the in-site classroom page).
  ["GET", /^\/api\/calendar\/bookings\/[^/]+$/, (_b, path) => {
    const id = path.split("?")[0].split("/").pop();
    const b = BOOKINGS.find((x) => x._id === id);
    if (!b) return { success: false, message: "Class not found." };
    return { success: true, data: b };
  }],
  // Zoom Meeting SDK signature — generated only when ZOOM_SDK_KEY/SECRET are set;
  // otherwise the classroom page falls back to a "join in Zoom" panel.
  ["POST", /^\/api\/zoom\/signature$/, (body) => {
    const key = process.env.ZOOM_SDK_KEY, secret = process.env.ZOOM_SDK_SECRET;
    if (!key || !secret) {
      return { success: true, configured: false, message: "Zoom SDK not configured. Set ZOOM_SDK_KEY and ZOOM_SDK_SECRET in mock-backend/.env to enable in-site embedding." };
    }
    const mn = String((body && body.meetingNumber) || "");
    const role = Number((body && body.role) || 0); // 0 = attendant, 1 = host
    const iat = Math.floor(Date.now() / 1000) - 30;
    const exp = iat + 60 * 60 * 2;
    const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
    const header = b64({ alg: "HS256", typ: "JWT" });
    const payload = b64({ appKey: key, sdkKey: key, mn, role, iat, exp, tokenExp: exp });
    const sig = crypto.createHmac("sha256", secret).update(`${header}.${payload}`).digest("base64url");
    return { success: true, configured: true, sdkKey: key, signature: `${header}.${payload}.${sig}` };
  }],
  // A STUDENT books a 1-to-1 lesson with a teacher and spends credits for it.
  ["POST", /^\/api\/calendar\/student-book$/, (body, _p, _r, token) => {
    const studentId = userIdFromToken(token) || "mock-student-001";
    const { teacherId, date, start } = body || {};
    if (!teacherId || !date || !start) return { success: false, message: "Pick a teacher, date and time." };
    const have = myCredits(studentId);
    if (have < LESSON_COST) return { success: false, message: `Not enough credits — a lesson costs ${LESSON_COST}, you have ${have}.` };
    // Prevent double-booking the same teacher/time.
    if (BOOKINGS.some((b) => b.status !== "cancelled" && (b.providerId || b.teacherId) === teacherId && b.date === date && b.start === start)) {
      return { success: false, message: "That slot is already taken — pick another time." };
    }
    let end = body.end;
    if (!end) { const dur = Number(body.durationMin) || 60; end = minToHhmm(hhmmToMin(start) + dur); }
    const provider = providerById(teacherId);
    const name = provider?.name || body.teacherName || "Teacher";
    const student = studentById(studentId);
    MY_CREDITS[studentId] = have - LESSON_COST;
    const bk = {
      _id: `bk-${BOOKING_SEQ++}`, teacherId, providerId: teacherId, teacherName: name, providerName: name,
      providerRole: provider?.role || "tutor", location: provider?.location || "Online", lab: provider?.lab || null,
      studentId, studentName: student?.name || body.studentName || "Student",
      date, start, end, title: body.title || "1-to-1 lesson", topic: body.title || "1-to-1 lesson",
      status: "confirmed", bookedByStudent: true, meetingUrl: zoomUrl(), createdAt: new Date().toISOString(),
    };
    BOOKINGS.push(bk);
    return { success: true, data: bk, creditsRemaining: MY_CREDITS[studentId] };
  }],

  // ---- enrollments (student side: real records + credit deduction)
  ["POST", /^\/api\/enrollments\/[^/]+\/enroll$/, (_b, path, _r, token) => {
    const courseId = path.split("?")[0].split("/")[3];
    const studentId = userIdFromToken(token) || "mock-student-001";
    const course = COURSES.find((c) => c._id === courseId);
    if (!course) return { success: false, message: "Course not found." };
    const existing = MY_ENROLLMENTS.find((e) => e.studentId === studentId && e.courseId === courseId);
    if (existing) return { success: false, message: "You are already enrolled in this course." };
    const cost = creditCostFor(course.groupType);
    const have = myCredits(studentId);
    if (have < cost) return { success: false, message: `Not enough credits — you need ${cost} but have ${have}.` };
    MY_CREDITS[studentId] = have - cost;
    const enr = { _id: `myenr-${MYENR_SEQ++}`, studentId, courseId, progress: 0, completedPercentage: 0, completed: [], enrolledAt: new Date().toISOString() };
    MY_ENROLLMENTS.push(enr);
    return { success: true, enrollment: enr, creditsRemaining: MY_CREDITS[studentId] };
  }],
  // Mark a lecture complete / incomplete — persists real progress on the enrollment.
  ["POST", /^\/api\/enrollments\/[^/]+\/complete-lecture$/, (body, path) => {
    const id = path.split("?")[0].split("/")[3];
    const e = MY_ENROLLMENTS.find((x) => x._id === id);
    if (!e) return { success: false, message: "Enrollment not found." };
    e.completed = e.completed || [];
    const { sectionId, lectureId } = body || {};
    if (lectureId && !e.completed.some((p) => p.lectureId === lectureId)) e.completed.push({ sectionId: sectionId || "", lectureId });
    recalcEnrollment(e);
    return enrollmentDetail(e);
  }],
  ["POST", /^\/api\/enrollments\/[^/]+\/uncomplete-lecture$/, (body, path) => {
    const id = path.split("?")[0].split("/")[3];
    const e = MY_ENROLLMENTS.find((x) => x._id === id);
    if (!e) return { success: false, message: "Enrollment not found." };
    const { lectureId } = body || {};
    e.completed = (e.completed || []).filter((p) => p.lectureId !== lectureId);
    recalcEnrollment(e);
    return enrollmentDetail(e);
  }],
  // Record a study-kit quiz attempt; keep the best score on the enrollment.
  ["POST", /^\/api\/enrollments\/[^/]+\/quiz$/, (body, path, _r, token) => {
    const id = path.split("?")[0].split("/")[3];
    const e = MY_ENROLLMENTS.find((x) => x._id === id);
    if (!e) return { success: false, message: "Enrollment not found." };
    const score = Number(body?.score) || 0;
    const total = Number(body?.total) || 0;
    const pct = total ? Math.round((score / total) * 100) : 0;
    const prevBest = e.quiz?.bestPct || 0;
    e.quiz = { bestScore: pct >= prevBest ? score : e.quiz.bestScore, total, bestPct: Math.max(prevBest, pct), attempts: (e.quiz?.attempts || 0) + 1, lastPct: pct, lastAt: new Date().toISOString() };
    bumpStreak(userIdFromToken(token) || e.studentId);
    return { success: true, quiz: e.quiz, passed: pct >= 70 };
  }],
  // Certificate data (only meaningful once the course is 100% complete).
  ["GET", /^\/api\/enrollments\/[^/]+\/certificate$/, (_b, path, _r, token) => {
    const id = path.split("?")[0].split("/")[3];
    const e = MY_ENROLLMENTS.find((x) => x._id === id);
    if (!e) return { success: false, message: "Enrollment not found." };
    const c = COURSES.find((x) => x._id === e.courseId) || {};
    const total = countLectures(c);
    const done = (e.completed || []).length;
    const eligible = total > 0 && done >= total;
    const student = studentProfile(userIdFromToken(token) || e.studentId);
    return {
      success: true, eligible,
      certificate: {
        studentName: student?.name || "Student",
        courseTitle: c.title || "Course", language: c.language || "", level: c.level || "",
        instructor: (c.instructorDetails && c.instructorDetails[0]?.name) || "Exzellent",
        issuedAt: eligible ? todayStr() : null,
        quizBestPct: e.quiz?.bestPct ?? null,
        id: `EXZ-${(e._id || "").toUpperCase()}`,
      },
    };
  }],
  ["GET", /^\/api\/enrollments\/my$/, (_b, _p, _r, token) => {
    const studentId = userIdFromToken(token) || "mock-student-001";
    const enrollments = MY_ENROLLMENTS
      .filter((e) => e.studentId === studentId)
      .map((e) => {
        const c = COURSES.find((x) => x._id === e.courseId) || {};
        recalcEnrollment(e);
        // Spread the course first, THEN _id — so the enrollment id (needed as
        // enrollmentId for progress/complete-lecture) isn't overwritten by course._id.
        return { courseId: e.courseId, course: c, ...c, _id: e._id, enrollmentId: e._id, completedPercentage: e.completedPercentage || 0, progress: e.progress || 0 };
      });
    return { success: true, enrollments };
  }],
  ["GET", /^\/api\/enrollments\/course\/[^/]+\/leaderboard$/, (_b, path) => {
    const cid = path.split("/")[4];
    // Rank enrolled students by their real course progress (falls back to a
    // deterministic score so the board isn't empty for demo courses).
    const ids = new Set(ENROLLMENTS.filter((e) => e.courseId === cid).map((e) => e.student));
    const rows = STUDENTS.filter((s) => ids.has(s._id)).map((s) => {
      const mine = MY_ENROLLMENTS.find((e) => e.studentId === s._id && e.courseId === cid);
      const pct = mine ? (recalcEnrollment(mine), mine.completedPercentage) : Math.min(95, (s.credits || 0) % 100);
      return { student: { _id: s._id, name: s.name }, name: s.name, completedPercentage: pct, points: pct };
    });
    rows.sort((a, b) => b.completedPercentage - a.completedPercentage);
    const leaderboard = rows.map((r, i) => ({ ...r, rank: i + 1 }));
    return { success: true, leaderboard };
  }],
  ["GET", /^\/api\/enrollments\/[^/]+$/, (_b, path) => {
    const id = path.split("?")[0].split("/").pop();
    const e = MY_ENROLLMENTS.find((x) => x._id === id);
    if (!e) return { success: true, completedPercentage: 0, completedLectures: 0, totalLectures: 0, course: {}, enrollment: { progress: [] } };
    return enrollmentDetail(e);
  }],

  // ---- spaced-repetition review + streak (student study side)
  ["GET", /^\/api\/review\/due(\?.*)?$/, (_b, path, _r, token) => {
    const studentId = userIdFromToken(token) || "mock-student-001";
    const state = REVIEW[studentId] || {};
    const t = todayStr();
    const all = reviewCardsFor(studentId);
    // A card is "due" if never reviewed, or its due date is today/past.
    const due = all.filter((c) => { const st = state[c.cardId]; return !st || !st.due || st.due <= t; })
      .map((c) => ({ ...c, ...(state[c.cardId] || {}) }));
    const streak = STREAKS[studentId] || { count: 0, lastDay: "" };
    return { success: true, data: due, total: all.length, dueCount: due.length, streak };
  }],
  ["POST", /^\/api\/review\/grade$/, (body, _p, _r, token) => {
    const studentId = userIdFromToken(token) || "mock-student-001";
    const { cardId, grade } = body || {};
    if (!cardId) return { success: false, message: "Missing card." };
    REVIEW[studentId] = REVIEW[studentId] || {};
    REVIEW[studentId][cardId] = scheduleCard(REVIEW[studentId][cardId], Number(grade));
    const streak = bumpStreak(studentId);
    return { success: true, card: REVIEW[studentId][cardId], streak };
  }],
  ["GET", /^\/api\/streak$/, (_b, _p, _r, token) => {
    const studentId = userIdFromToken(token) || "mock-student-001";
    return { success: true, streak: STREAKS[studentId] || { count: 0, lastDay: "" } };
  }],

  // ---- assignments & feedback (teacher ⇄ student speaking practice loop)
  ["POST", /^\/api\/assignments$/, (body, _p, _r, token) => {
    const teacherId = userIdFromToken(token) || TEACHER_ID;
    const a = {
      _id: `asg-${ASSIGNMENT_SEQ++}`, teacherId,
      teacherName: (providerById(teacherId)?.name) || TEACHER.name,
      studentId: body?.studentId || "", courseId: body?.courseId || "",
      title: body?.title || "Speaking practice", prompt: body?.prompt || "",
      targetText: body?.targetText || "", createdAt: new Date().toISOString(),
    };
    ASSIGNMENTS.push(a);
    return { success: true, data: a };
  }],
  ["GET", /^\/api\/assignments(\?.*)?$/, (_b, path) => {
    const u = new URL(path, "http://localhost");
    const studentId = u.searchParams.get("studentId");
    const teacherId = u.searchParams.get("teacherId");
    let list = ASSIGNMENTS.slice();
    if (studentId) list = list.filter((a) => !a.studentId || a.studentId === studentId);
    if (teacherId) list = list.filter((a) => a.teacherId === teacherId);
    // Attach each assignment's submissions.
    const data = list.map((a) => ({ ...a, submissions: SUBMISSIONS.filter((s) => s.assignmentId === a._id) }));
    return { success: true, data };
  }],
  ["POST", /^\/api\/assignments\/[^/]+\/submit$/, (body, path, _r, token) => {
    const assignmentId = path.split("?")[0].split("/")[3];
    const a = ASSIGNMENTS.find((x) => x._id === assignmentId);
    if (!a) return { success: false, message: "Assignment not found." };
    const studentId = userIdFromToken(token) || body?.studentId || "mock-student-001";
    const sub = {
      _id: `sub-${SUBMISSION_SEQ++}`, assignmentId, studentId,
      studentName: studentById(studentId)?.name || body?.studentName || "Student",
      score: Number(body?.score) || 0, transcript: body?.transcript || "",
      feedback: "", submittedAt: new Date().toISOString(),
    };
    SUBMISSIONS.push(sub);
    bumpStreak(studentId);
    return { success: true, data: sub };
  }],
  ["POST", /^\/api\/submissions\/[^/]+\/feedback$/, (body, path) => {
    const id = path.split("?")[0].split("/")[3];
    const s = SUBMISSIONS.find((x) => x._id === id);
    if (!s) return { success: false, message: "Submission not found." };
    s.feedback = String(body?.feedback || "").slice(0, 2000);
    return { success: true, data: s };
  }],

  // ---- webinars (admin CRUD + student "my webinars")
  // Each webinar is tagged with `registered` for the requesting student so the
  // "Your registered webinars" section can filter on it.
  ["GET", /^\/api\/webinars\/my-webinars$/, (_b, _p, _r, token) => {
    const sid = userIdFromToken(token) || "mock-student-001";
    return WEBINARS.map((w) => ({ ...w, registered: (w.registeredStudents || []).includes(sid) }));
  }],
  ["GET", /^\/api\/webinars\/[^/]+\/registrations$/, (_b, path) => {
    const id = path.split("?")[0].split("/")[3];
    const w = WEBINARS.find((x) => x._id === id);
    const regs = (w?.registeredStudents || []).map((sid) => {
      const s = STUDENTS.find((x) => x._id === sid);
      return { _id: sid, name: s?.name || sid, email: s?.email || "", registeredAt: w?.createdAt || w?.scheduledAt || "" };
    });
    return { success: true, data: regs, webinarTitle: w?.title || "" };
  }],
  // Same list under /participants (some admin views call this path).
  ["GET", /^\/api\/webinars\/[^/]+\/participants$/, (_b, path) => {
    const id = path.split("?")[0].split("/")[3];
    const w = WEBINARS.find((x) => x._id === id);
    const regs = (w?.registeredStudents || []).map((sid) => {
      const s = STUDENTS.find((x) => x._id === sid);
      return { _id: sid, name: s?.name || sid, email: s?.email || "", registeredAt: w?.createdAt || w?.scheduledAt || "" };
    });
    return { success: true, data: regs, webinarTitle: w?.title || "" };
  }],
  // Is the current student registered for this webinar?
  ["GET", /^\/api\/webinars\/[^/]+\/is-registered$/, (_b, path, _r, token) => {
    const id = path.split("?")[0].split("/")[3];
    const sid = userIdFromToken(token) || "mock-student-001";
    const w = WEBINARS.find((x) => x._id === id);
    return { success: true, isRegistered: !!w && (w.registeredStudents || []).includes(sid) };
  }],
  // Register the current student for a webinar.
  ["POST", /^\/api\/webinars\/[^/]+\/register$/, (_b, path, _r, token) => {
    const id = path.split("?")[0].split("/")[3];
    const sid = userIdFromToken(token) || "mock-student-001";
    const w = WEBINARS.find((x) => x._id === id);
    if (!w) return { success: false, message: "Webinar not found." };
    w.registeredStudents = w.registeredStudents || [];
    w.participants = w.participants || [];
    if (!w.registeredStudents.includes(sid)) { w.registeredStudents.push(sid); w.participants.push(sid); }
    return { success: true, message: "You're registered — see you there!", data: { ...w, registered: true } };
  }],
  // Single webinar (detail page).
  ["GET", /^\/api\/webinars\/[^/]+$/, (_b, path, _r, token) => {
    const id = path.split("?")[0].split("/").pop();
    const sid = userIdFromToken(token) || "mock-student-001";
    const w = WEBINARS.find((x) => x._id === id);
    if (!w) return { success: false, message: "Webinar not found." };
    return { success: true, data: { ...w, registered: (w.registeredStudents || []).includes(sid) } };
  }],
  ["GET", /^\/api\/webinars$/, () => WEBINARS],
  ["POST", /^\/api\/webinars$/, (body) => {
    const w = { _id: `web-${WEBINAR_SEQ++}`, registeredStudents: [], participants: [], instructors: [], isPublic: true, ...(body || {}) };
    if (body && body.scheduledAt && !body.date) w.date = String(body.scheduledAt).slice(0, 10);
    WEBINARS.push(w);
    return { success: true, data: w };
  }],
  ["PUT", /^\/api\/webinars\/[^/]+$/, (body, path) => {
    const id = path.split("?")[0].split("/").pop();
    const w = WEBINARS.find((x) => x._id === id);
    if (!w) return { success: false, message: "Webinar not found." };
    Object.assign(w, body || {});
    return { success: true, data: w };
  }],
  ["DELETE", /^\/api\/webinars\/[^/]+$/, (_b, path) => {
    const id = path.split("?")[0].split("/").pop();
    const i = WEBINARS.findIndex((x) => x._id === id);
    if (i >= 0) WEBINARS.splice(i, 1);
    return { success: true, message: "Webinar deleted" };
  }],
  ["POST", /^\/api\/webinars\/[^/]+\/send-invites$/, () => ({ success: true, message: "Invites sent (mock)." })],

  // ---- careers / jobs (admin CRUD + applicants)
  ["GET", /^\/api\/careers\/[^/]+\/applicants$/, (_b, path) => {
    const id = path.split("?")[0].split("/")[3];
    const job = CAREERS.find((x) => x._id === id);
    return { success: true, data: JOB_APPLICANTS[id] || [], applicants: JOB_APPLICANTS[id] || [], jobTitle: job?.jobTitle || "" };
  }],
  ["GET", /^\/api\/careers\/[^/]+$/, (_b, path) => {
    const id = path.split("?")[0].split("/").pop();
    return CAREERS.find((x) => x._id === id) || {};
  }],
  ["GET", /^\/api\/careers$/, () => CAREERS],
  ["POST", /^\/api\/careers$/, (body) => {
    const j = { _id: `job-${CAREER_SEQ++}`, isActive: true, ...(body || {}) };
    CAREERS.push(j);
    return { success: true, data: j };
  }],
  ["PUT", /^\/api\/careers\/[^/]+$/, (body, path) => {
    const id = path.split("?")[0].split("/").pop();
    const j = CAREERS.find((x) => x._id === id);
    if (!j) return { success: false, message: "Job not found." };
    Object.assign(j, body || {});
    return { success: true, data: j };
  }],
  ["DELETE", /^\/api\/careers\/[^/]+$/, (_b, path) => {
    const id = path.split("?")[0].split("/").pop();
    const i = CAREERS.findIndex((x) => x._id === id);
    if (i >= 0) CAREERS.splice(i, 1);
    return { success: true, message: "Job deleted" };
  }],

  // ---- referrals (admin CRUD)
  ["GET", /^\/api\/referrals$/, () => ({ success: true, data: REFERRALS })],
  ["POST", /^\/api\/referrals$/, (body) => {
    const r = { _id: `ref-${REFERRAL_SEQ++}`, uses: 0, active: true, createdAt: new Date().toISOString(), ...(body || {}) };
    REFERRALS.push(r);
    return { success: true, data: r };
  }],
  ["PUT", /^\/api\/referrals\/[^/]+$/, (body, path) => {
    const id = path.split("?")[0].split("/").pop();
    const r = REFERRALS.find((x) => x._id === id);
    if (!r) return { success: false, message: "Referral not found." };
    Object.assign(r, body || {});
    return { success: true, data: r };
  }],
  ["DELETE", /^\/api\/referrals\/[^/]+$/, (_b, path) => {
    const id = path.split("?")[0].split("/").pop();
    const i = REFERRALS.findIndex((x) => x._id === id);
    if (i >= 0) REFERRALS.splice(i, 1);
    return { success: true, message: "Referral deleted" };
  }],

  // ---- image uploads (mock: return a placeholder URL so file flows don't stall)
  ["POST", /^\/api\/upload\/[^/]+$/, () => {
    const url = "https://placehold.co/400x400?text=Uploaded";
    return { success: true, url, imageUrl: url, secure_url: url, data: { url } };
  }],
  // ---- marketing email blast (mock)
  ["POST", /^\/api\/emails\/marketing$/, () => ({ success: true, message: `Queued to ${STUDENTS.length} students (mock).` })],

  // ---- live stats (online-now counter + gently-growing member social proof)
  ["GET", /^\/api\/stats$/, () => ({ success: true, online: onlineCount(), members: memberCount(), activeWindowMin: 5 })],
  ["POST", /^\/api\/stats\/heartbeat$/, (_b, _p, _r, token) => { markActive(userIdFromToken(token)); return { success: true, online: onlineCount(), members: memberCount() }; }],

  // ---- subscription plans + credits
  ["GET", /^\/api\/plans$/, () => ({ success: true, data: PLANS, signupBonus: SIGNUP_BONUS })],
  // Confirm a subscription (after Stripe payment) → allocate the plan's credits.
  ["POST", /^\/api\/subscribe$/, (body, _p, _r, token) => {
    const studentId = userIdFromToken(token) || "mock-student-001";
    const plan = planById(body && body.planId);
    if (!plan) return { success: false, message: "Unknown plan." };
    const s = studentById(studentId);
    const have = myCredits(studentId);
    MY_CREDITS[studentId] = have + plan.credits;
    const wasPaid = s && s.paid;
    if (s) { s.plan = plan.id; s.planName = plan.name; s.paid = true; s.credits = MY_CREDITS[studentId]; }
    // Reward the inviter with credits the first time this member converts to paid.
    if (s && !s.referralRewarded && !wasPaid) {
      const inviterId = s.invitedBy || (findReferral(s.invitedByCode)?.ownerId);
      if (inviterId && inviterId !== studentId) {
        MY_CREDITS[inviterId] = myCredits(inviterId) + CREDITS_PER_REFERRAL;
        const inv = studentById(inviterId);
        if (inv) inv.credits = MY_CREDITS[inviterId];
        s.referralRewarded = true;
      }
    }
    return { success: true, plan: plan.id, creditsAdded: plan.credits, credits: MY_CREDITS[studentId] };
  }],

  // ---- invite / referral verification + waitlist (BestSecret-style gate)
  ["POST", /^\/api\/referrals\/verify$/, (body) => {
    const r = findReferral(body && body.code);
    return r
      ? { success: true, valid: true, referral: { code: r.code, reward: r.reward || "", ownerId: r.ownerId || null } }
      : { success: true, valid: false, message: "That invite code isn't valid." };
  }],
  ["POST", /^\/api\/waitlist$/, (body) => {
    const email = ((body && body.email) || "").trim();
    if (!email) return { success: false, message: "Please enter your email." };
    if (!WAITLIST.some((w) => w.email.toLowerCase() === email.toLowerCase()))
      WAITLIST.push({ _id: `wl-${WAITLIST_SEQ++}`, email, name: (body && body.name) || "", note: (body && body.note) || "", createdAt: new Date().toISOString() });
    return { success: true, message: "You're on the list — we'll email you an invite soon." };
  }],
  ["GET", /^\/api\/waitlist$/, () => ({ success: true, data: WAITLIST })],
  // Admin turns a waitlist request into a real invite code.
  ["POST", /^\/api\/waitlist\/[^/]+\/invite$/, (_b, path) => {
    const id = path.split("?")[0].split("/")[3];
    const w = WAITLIST.find((x) => x._id === id);
    if (!w) return { success: false, message: "Waitlist entry not found." };
    const code = "INV" + genOtp().slice(0, 5);
    REFERRALS.push({ _id: `ref-${REFERRAL_SEQ++}`, code, description: `Invite for ${w.email}`, uses: 0, active: true, createdAt: new Date().toISOString() });
    w.invited = true; w.inviteCode = code;
    return { success: true, code, message: `Invite code ${code} created for ${w.email}.` };
  }],

  // ---- personal referral / affiliate stats (any logged-in member)
  ["GET", /^\/api\/referrals\/mine$/, (_b, _p, role, token) => {
    const id = userIdFromToken(token) || "mock-student-001";
    const nm = userDisplay(role || "Student", id).name;
    return { success: true, data: referralStats(id, nm) };
  }],

  // ---- community (Skool-style feed)
  ["GET", /^\/api\/community\/spaces$/, () => ({ success: true, data: COMMUNITY_SPACES })],
  ["GET", /^\/api\/community\/posts(\?.*)?$/, (_b, path) => {
    const u = new URL(path, "http://localhost");
    const space = u.searchParams.get("space");
    let list = POSTS.slice();
    if (space && space !== "All") list = list.filter((p) => p.space === space);
    list = list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return { success: true, data: list };
  }],
  ["POST", /^\/api\/community\/posts$/, (body, _p, role, token) => {
    const id = userIdFromToken(token) || "mock-student-001";
    const who = userDisplay(role || "Student", id);
    const text = String((body && body.text) || "").trim();
    if (!text) return { success: false, message: "Write something first." };
    const post = { _id: `post-${POST_SEQ++}`, authorId: id, authorName: who.name, authorRole: who.role,
      space: (body && body.space) || "General", text: text.slice(0, 3000), likes: [], comments: [], createdAt: new Date().toISOString() };
    POSTS.unshift(post);
    return { success: true, data: post };
  }],
  ["POST", /^\/api\/community\/posts\/[^/]+\/like$/, (_b, path, _r, token) => {
    const pid = path.split("?")[0].split("/")[4];
    const id = userIdFromToken(token) || "mock-student-001";
    const post = POSTS.find((p) => p._id === pid);
    if (!post) return { success: false, message: "Post not found." };
    post.likes = post.likes || [];
    const i = post.likes.indexOf(id);
    if (i >= 0) post.likes.splice(i, 1); else post.likes.push(id);
    return { success: true, data: post };
  }],
  ["POST", /^\/api\/community\/posts\/[^/]+\/comment$/, (body, path, role, token) => {
    const pid = path.split("?")[0].split("/")[4];
    const id = userIdFromToken(token) || "mock-student-001";
    const who = userDisplay(role || "Student", id);
    const post = POSTS.find((p) => p._id === pid);
    if (!post) return { success: false, message: "Post not found." };
    const text = String((body && body.text) || "").trim();
    if (!text) return { success: false, message: "Write a comment first." };
    post.comments = post.comments || [];
    post.comments.push({ _id: `cm-${POST_SEQ++}`, authorId: id, authorName: who.name, text: text.slice(0, 1000), createdAt: new Date().toISOString() });
    return { success: true, data: post };
  }],
];

/* ------------------------------------------------------------------- server */

// Rolling per-session chat history for /api/chat/message (Redis upstream).
const CHAT_SESSIONS = {};

const send = (res, status, payload) => {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
};

const server = http.createServer((req, res) => {
  // CORS: reflect the caller's origin and allow credentials
  const origin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }

  const bearer = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const role = roleFromToken(bearer);
  const path = req.url;

  // ---- Speech-to-text (works in EVERY browser): the client records mic audio
  // with MediaRecorder and posts the raw bytes here; we forward to Groq Whisper.
  // Handled before the JSON body reader because the body is binary.
  if (req.method === "POST" && path === "/api/ai/transcribe") {
    const parts = [];
    req.on("data", (c) => parts.push(c));
    req.on("end", () => {
      const audio = Buffer.concat(parts);
      if (!audio.length) { send(res, 400, { success: false, message: "No audio received" }); return; }
      const boundary = "----exziAudio" + Date.now().toString(16);
      const head = Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="model"\r\n\r\nwhisper-large-v3-turbo\r\n` +
        `--${boundary}\r\nContent-Disposition: form-data; name="response_format"\r\n\r\njson\r\n` +
        `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="audio.webm"\r\nContent-Type: audio/webm\r\n\r\n`
      );
      const tail = Buffer.from(`\r\n--${boundary}--\r\n`);
      const multipart = Buffer.concat([head, audio, tail]);
      const gReq = https.request({
        hostname: "api.groq.com", port: 443,
        path: "/openai/v1/audio/transcriptions", method: "POST",
        headers: {
          "Authorization": "Bearer " + GROQ_API_KEY,
          "Content-Type": "multipart/form-data; boundary=" + boundary,
          "Content-Length": multipart.length
        }
      }, (gRes) => {
        let data = "";
        gRes.on("data", (c) => (data += c));
        gRes.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.text != null) {
              send(res, 200, { success: true, text: String(parsed.text).trim() });
            } else {
              const gErr = parsed.error?.message || ("Unexpected transcription response: " + data.slice(0, 200));
              console.log("  Whisper error:", gErr);
              send(res, 502, { success: false, message: gErr });
            }
          } catch (err) {
            send(res, 502, { success: false, message: "Transcription response invalid: " + err.message });
          }
        });
      });
      gReq.on("error", (err) => send(res, 502, { success: false, message: "Transcription request failed: " + err.message }));
      gReq.write(multipart);
      gReq.end();
    });
    return;
  }

  // ---- Speech analyzer: record mic audio, POST the bytes here with the target
  // sentence in ?ref=... — we transcribe via Whisper then score pronunciation
  // (algorithm ported from the voice-analyzer project). Binary body, so handled
  // before the JSON reader.
  if (req.method === "POST" && path.startsWith("/api/ai/analyze-speech")) {
    const qs = new URL(path, "http://localhost").searchParams;
    const reference = qs.get("ref") || "";
    const language = qs.get("lang") || null;
    const parts = [];
    req.on("data", (c) => parts.push(c));
    req.on("end", () => {
      const audio = Buffer.concat(parts);
      if (!audio.length) { send(res, 400, { success: false, message: "No audio received" }); return; }
      const boundary = "----exziAudio" + Date.now().toString(16);
      const head = Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="model"\r\n\r\nwhisper-large-v3-turbo\r\n` +
        `--${boundary}\r\nContent-Disposition: form-data; name="response_format"\r\n\r\nverbose_json\r\n` +
        `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="audio.webm"\r\nContent-Type: audio/webm\r\n\r\n`
      );
      const tail = Buffer.from(`\r\n--${boundary}--\r\n`);
      const multipart = Buffer.concat([head, audio, tail]);
      const gReq = https.request({
        hostname: "api.groq.com", port: 443,
        path: "/openai/v1/audio/transcriptions", method: "POST",
        headers: {
          "Authorization": "Bearer " + GROQ_API_KEY,
          "Content-Type": "multipart/form-data; boundary=" + boundary,
          "Content-Length": multipart.length
        }
      }, (gRes) => {
        let data = "";
        gRes.on("data", (c) => (data += c));
        gRes.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.text != null) {
              const result = scoreSpeech(parsed.text, reference, parsed.language || language);
              if (typeof parsed.duration === "number") result.duration_sec = Math.round(parsed.duration * 10) / 10;
              send(res, 200, { success: true, ...result });
            } else {
              const gErr = parsed.error?.message || ("Unexpected transcription response: " + data.slice(0, 200));
              console.log("  Analyzer/Whisper error:", gErr);
              send(res, 502, { success: false, message: gErr });
            }
          } catch (err) {
            send(res, 502, { success: false, message: "Analysis response invalid: " + err.message });
          }
        });
      });
      gReq.on("error", (err) => send(res, 502, { success: false, message: "Analysis request failed: " + err.message }));
      gReq.write(multipart);
      gReq.end();
    });
    return;
  }

  let raw = "";
  req.on("data", (c) => (raw += c));
  req.on("end", () => {
    let body = {};
    try { body = raw ? JSON.parse(raw) : {}; } catch { body = {}; }

    // AI credit metering: a logged-in STUDENT spends credits per generative AI
    // use; teachers/admins (and anonymous demo users) are not charged. Speech /
    // transcribe are handled earlier (binary body) and stay free.
    if (req.method === "POST" && path.startsWith("/api/ai/") && role === "Student") {
      const sid = userIdFromToken(bearer) || "mock-student-001";
      const cost = aiCostFor(path);
      const have = myCredits(sid);
      if (have < cost) {
        return send(res, 402, { success: false, needCredits: true, cost, credits: have,
          message: `Not enough credits — this AI tool costs ${cost} and you have ${have}. Upgrade your plan to keep going.` });
      }
      MY_CREDITS[sid] = have - cost;
      const st = studentById(sid); if (st) st.credits = MY_CREDITS[sid];
      saveData();
    }

    // ─── AUTHENTICATED EXZI COMPANION (dashboards) ──────────────────────────
    // Mirrors the real backend's POST /api/chat/message: same request shape and
    // the same SSE wire format (data: {"text":...} chunks then data: [DONE]),
    // so the dashboard component can be built and tested locally instead of
    // pointing dev at production.
    //   body: { sessionId, userMessage, profile:{ name, mode, ... } }
    if (req.method === "POST" && path === "/api/chat/message") {
      const sessionId = String(body.sessionId || "");
      const userMessage = String(body.userMessage || "").trim();
      const profile = body.profile || {};
      if (!sessionId || !userMessage || !profile.name) {
        send(res, 400, { success: false, message: "sessionId, userMessage, and profile are required" });
        return;
      }
      const mode = profile.mode || "generic";
      if (mode === "tutor" && (!profile.nativeLanguage || !profile.targetLanguage || !profile.level)) {
        send(res, 400, { success: false, message: "Tutor mode requires profile.nativeLanguage, targetLanguage, and level" });
        return;
      }

      // Short rolling history per session, like Redis holds upstream.
      CHAT_SESSIONS[sessionId] = (CHAT_SESSIONS[sessionId] || []).slice(-38);
      CHAT_SESSIONS[sessionId].push({ role: "user", content: userMessage });

      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      });

      const system = mode === "tutor"
        ? "You are Exzi, an expert " + (profile.targetLanguage || "German") + " tutor for " + profile.name + ". "
          + "Their native language is " + profile.nativeLanguage + " and their level is " + profile.level + ". "
          + "Adapt to that level, correct gently, and keep replies short."
        : "You are Exzi, the EXZELLENT AI companion, talking with " + profile.name + ". "
          + "Help with learning, studying in Germany, careers and the platform itself. Be concise and practical.";

      // Emit the reply in small chunks so the UI renders progressively, the same
      // way the real streaming endpoint does.
      const streamOut = (text) => {
        const words = String(text).split(/(\s+)/);
        let i = 0;
        const tick = () => {
          if (i >= words.length) {
            CHAT_SESSIONS[sessionId].push({ role: "assistant", content: text });
            saveData();
            res.write("data: [DONE]\n\n");
            res.end();
            return;
          }
          res.write("data: " + JSON.stringify({ text: words.slice(i, i + 3).join("") }) + "\n\n");
          i += 3;
          setTimeout(tick, 28);
        };
        tick();
      };

      groqChat({ system, user: userMessage, maxTokens: 700 }, (err, out) => {
        if (err) { streamOut("I can't reach my AI service right now. (" + err.message + ")"); return; }
        streamOut(typeof out === "string" ? out : JSON.stringify(out));
      });
      return;
    }

    if (req.method === "POST" && path === "/api/ai/chat") {
      const systemPrompt = "You are Exzi, the EXZELLENT AI companion. Help users with language learning, studying in Germany, career advice, and general questions. Be concise, friendly, and practical.";

      // Accept either a single { message } or a full { messages: [{role,content}] }
      // conversation so the Playground can keep multi-turn context.
      let convo = [];
      if (Array.isArray(body.messages)) {
        convo = body.messages
          .filter((m) => m && (m.role === "user" || m.role === "assistant") && m.content)
          .map((m) => ({ role: m.role, content: String(m.content) }))
          .slice(-20); // keep the last 20 turns
      }
      if (convo.length === 0) {
        const userMessage = String(body.message || body.prompt || "").trim();
        convo = [{ role: "user", content: userMessage }];
      }
      // qwen3.6 is a reasoning model — prefix "/no_think" on the latest user turn
      // so the reply doesn't contain a <think> block.
      for (let i = convo.length - 1; i >= 0; i--) {
        if (convo[i].role === "user") { convo[i] = { role: "user", content: "/no_think\n" + convo[i].content }; break; }
      }

      const payload = JSON.stringify({
        model: "qwen/qwen3.6-27b",
        reasoning_effort: "none",
        messages: [{ role: "system", content: systemPrompt }, ...convo],
        max_tokens: 700,
        temperature: 0.7
      });

      const options = {
        hostname: "api.groq.com",
        port: 443,
        path: "/openai/v1/chat/completions",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + GROQ_API_KEY,
          "Content-Length": Buffer.byteLength(payload)
        }
      };

      const proxyReq = https.request(options, (proxyRes) => {
        let data = "";
        proxyRes.on("data", (chunk) => (data += chunk));
        proxyRes.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            let reply = parsed.choices?.[0]?.message?.content;
            if (reply) {
              reply = reply.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
              send(res, 200, { success: true, reply });
            } else {
              // Groq returned no reply — surface the real reason instead of hiding it.
              const gErr = parsed.error?.message || ("Unexpected Groq response: " + data.slice(0, 200));
              console.log("  Groq error:", gErr);
              send(res, 502, { success: false, message: gErr, reply: "I couldn't generate a reply just now. Please try again." });
            }
          } catch (err) {
            send(res, 500, { success: false, message: "Groq response was invalid: " + data.slice(0, 200), error: err.message });
          }
        });
      });

      proxyReq.on("error", (err) => {
        send(res, 500, { success: false, message: "Groq request failed: " + err.message, error: err.message });
      });

      proxyReq.write(payload);
      proxyReq.end();
      return;
    }

    // ---- AI Exam Generator: topic -> MCQs + flashcards + oral prompts
    if (req.method === "POST" && path === "/api/ai/generate-exam") {
      const topic = String(body.topic || "").trim();
      if (!topic) { send(res, 400, { success: false, message: "Please provide a topic." }); return; }
      const language = body.language || "English";
      const level = body.level || "A2";
      const count = Math.max(3, Math.min(10, Number(body.count) || 5));
      const system = "You are an expert language-exam writer. Reply with ONLY a JSON object, no prose.";
      const user = `Create a ${language} practice assessment at CEFR level ${level} on the topic "${topic}".
Return JSON exactly shaped as:
{"title": string,
 "mcqs": [{"question": string, "options": [4 strings], "answer": integer 0-3, "explanation": string}],  // ${count} items
 "flashcards": [{"front": string, "back": string}],  // 5 items
 "oral_prompts": [string, string, string]}
Write the questions and options in ${language}. Keep difficulty at ${level}.`;
      groqChat({ system, user, json: true, maxTokens: 2000 }, (err, out) => {
        if (err) { send(res, 502, { success: false, message: err.message }); return; }
        send(res, 200, { success: true, ...out });
      });
      return;
    }

    // ---- AI Course Builder: brief -> course outline (teacher) or study plan (student)
    if (req.method === "POST" && path === "/api/ai/build-course") {
      const description = String(body.description || "").trim();
      if (!description) { send(res, 400, { success: false, message: "Describe what you want to build." }); return; }
      const language = body.language || "English";
      const level = body.level || "A1";
      const audience = body.audience === "student" ? "student" : "teacher";
      const system = "You are an expert language-curriculum designer. Reply with ONLY a JSON object, no prose.";
      const user = audience === "student"
        ? `A learner wants a personal ${language} study plan (level ${level}) for: "${description}".
Return JSON: {"title": string, "summary": string, "weeks": [{"week": integer, "focus": string, "activities": [3 strings]}]}  // 4 weeks`
        : `Design a ${language} course at CEFR ${level} from this brief: "${description}".
Return JSON: {"title": string, "description": string, "sections": [{"title": string, "lectures": [3 strings], "quizCount": integer, "flashcardCount": integer}]}  // 4 sections`;
      groqChat({ system, user, json: true, maxTokens: 1800 }, (err, out) => {
        if (err) { send(res, 502, { success: false, message: err.message }); return; }
        send(res, 200, { success: true, audience, language, level, ...out });
      });
      return;
    }

    // ---- AI Progress Report: metrics -> narrative report (own / per-student)
    if (req.method === "POST" && path === "/api/ai/progress-report") {
      const name = String(body.name || "the learner").trim();
      const metrics = body.metrics || {};
      const audience = body.audience === "teacher" ? "teacher" : "student";
      const system = "You are a supportive, honest language-learning coach. Reply with ONLY a JSON object, no prose.";
      const user = `Write a short progress report for ${name}.
Metrics (JSON): ${JSON.stringify(metrics)}.
Audience: ${audience === "teacher" ? "their teacher — professional and actionable, third person" : "the learner themselves — warm and encouraging, second person"}.
Return JSON: {"headline": string, "narrative": string (2-3 sentences), "strengths": [2-3 strings], "focus": [2-3 strings], "cefr_estimate": string}.`;
      groqChat({ system, user, json: true, maxTokens: 900 }, (err, out) => {
        if (err) { send(res, 502, { success: false, message: err.message }); return; }
        send(res, 200, { success: true, ...out });
      });
      return;
    }

    // ---- AI Content Engine: source text (e.g. from a PDF) -> a full study kit
    if (req.method === "POST" && path === "/api/ai/study-kit") {
      const source = String(body.text || "").trim().slice(0, 12000); // cap for the model
      if (source.length < 40) { send(res, 400, { success: false, message: "Not enough text to work with — try a text-based PDF or add a topic." }); return; }
      const language = body.language || "English";
      const level = body.level || "A2";
      const system = "You are an expert course designer. Turn source material into a study kit. Reply with ONLY a JSON object, no prose.";
      const user = `From the SOURCE below, build a ${language} study kit at CEFR level ${level}.
Return JSON shaped exactly as (keep every string concise):
{"title": string,
 "description": string,
 "sections": [{"title": string, "lectures": [3 short strings]}],   // exactly 3 sections
 "flashcards": [{"front": string, "back": string}],                // 5 items
 "quiz": [{"question": string, "options": [4 strings], "answer": integer 0-3, "explanation": string}],  // 4 items
 "summary": string,                                                // 2-3 sentence summary
 "key_terms": [string]}                                            // 6 key terms
Base everything on the SOURCE. Write in ${language} at ${level}.
SOURCE:
"""${source}"""`;
      groqChat({ system, user, json: true, maxTokens: 4096 }, (err, out) => {
        if (err) { send(res, 502, { success: false, message: err.message }); return; }
        send(res, 200, { success: true, ...out });
      });
      return;
    }

    for (const [method, pattern, handler] of routes) {
      if (req.method === method && pattern.test(path)) {
        try {
          const out = handler(body, path, role, bearer);
          // Persist after anything that could have mutated the store.
          if (req.method !== "GET" && /^\/api\/(courses|teachers|calendar|messages|enrollments|webinars|careers|referrals|review|assignments|submissions|subscribe|waitlist|community|users\/(login|google-|approve|complete|students|updateprofile|pre-signup|verify-email))/.test(path)) saveData();
          console.log(`  ${req.method} ${path}  ->  200`);
          return send(res, 200, out);
        } catch (err) {
          console.log(`  ${req.method} ${path}  ->  500  ${err.message}`);
          return send(res, 500, { success: false, message: err.message });
        }
      }
    }

    // Fallback so nothing in the UI hard-crashes on an unmocked call.
    console.log(`  ${req.method} ${path}  ->  200 (generic fallback)`);
    if (req.method === "GET") return send(res, 200, { success: true, data: [] });
    return send(res, 200, { success: true, message: "OK (mock)" });
  });
});

const restored = loadData();
// Stamp concrete dates on any enrollment that doesn't have one yet, then persist
// so the dates become fixed, real records (not recomputed on every restart).
let seeded = ensureEnrollmentDates();
seeded = ensureProviderAvailability() || seeded;
seeded = seedBookings() || seeded;
seeded = seedMessages() || seeded;
if (seeded) saveData();

server.listen(PORT, () => {
  console.log("========================================================");
  console.log("  MOCK BACKEND running at http://localhost:" + PORT);
  console.log(restored ? "  Data restored from data.json (delete it to reset)." : "  Fresh seed data (saved to data.json on first change).");
  console.log("  Log in with ANY password. The email picks your role:");
  console.log("    admin@test.com    -> Admin dashboard");
  console.log("    teacher@test.com  -> Teacher dashboard");
  console.log("    student@test.com  -> Student dashboard");
  console.log("  Nothing here touches the real database.");
  console.log("  Leave this window OPEN while developing. Ctrl+C to stop.");
  console.log("========================================================");
});
