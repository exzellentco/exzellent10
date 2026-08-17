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

// Pending email OTPs during signup (email -> { otp, userType }). In-memory only.
const PENDING_OTPS = {};

// Every AI study-kit generation produces this many format variants per lesson.
const FORMATS_PER_LESSON = 9;

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
    thumbnail: "https://via.placeholder.com/400x300?text=German+A1",
    tags: ["Speaking", "Grammar", "Listening"],
    isPublished: true,
    createdAt: "2026-02-10T09:00:00Z",
    instructorDetails: [{ name: "Demo Teacher" }],
    sections: [
      { _id: "sec-1", title: "Greetings & Introductions", lectures: [] },
      { _id: "sec-2", title: "Numbers, Dates & Time", lectures: [] },
      { _id: "sec-3", title: "Everyday Vocabulary", lectures: [] },
      { _id: "sec-4", title: "Present Tense Verbs", lectures: [] },
    ],
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
    thumbnail: "https://via.placeholder.com/400x300?text=English+B2",
    tags: ["Business English", "Writing"],
    isPublished: true,
    createdAt: "2026-03-05T09:00:00Z",
    instructorDetails: [{ name: "Demo Teacher" }],
    sections: [
      { _id: "sec-5", title: "Business Writing", lectures: [] },
      { _id: "sec-6", title: "Advanced Grammar", lectures: [] },
      { _id: "sec-7", title: "Presentations & Public Speaking", lectures: [] },
    ],
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
    thumbnail: "https://via.placeholder.com/400x300?text=AI+Fundamentals",
    tags: ["AI", "Automation", "No-Code"],
    isPublished: false,
    createdAt: "2026-07-20T09:00:00Z",
    instructorDetails: [{ name: "Demo Teacher" }],
    sections: [
      { _id: "sec-8", title: "What is AI?", lectures: [] },
    ],
  },
];

const STUDENTS = [
  { _id: "stu-1", name: "Anna Müller", firstName: "Anna", lastName: "Müller", email: "anna@test.com", paid: true, country: "Germany", credits: 1200, phone: "+49 151 2345678", gender: "Female", dateOfBirth: "1998-04-12", referral: "Instagram" },
  { _id: "stu-2", name: "Ben Okafor", firstName: "Ben", lastName: "Okafor", email: "ben@test.com", paid: true, country: "Nigeria", credits: 300, phone: "+234 803 1122334", gender: "Male", dateOfBirth: "2000-09-03", referral: "Friend" },
  { _id: "stu-3", name: "Chloé Martin", firstName: "Chloé", lastName: "Martin", email: "chloe@test.com", paid: true, country: "France", credits: 800, phone: "+33 6 12 34 56 78", gender: "Female", dateOfBirth: "1997-01-22", referral: "Google" },
  { _id: "stu-4", name: "Diego Alvarez", firstName: "Diego", lastName: "Alvarez", email: "diego@test.com", paid: true, country: "Spain", credits: 640, phone: "+34 611 223344", gender: "Male", dateOfBirth: "1999-11-30", referral: "YouTube" },
  { _id: "stu-5", name: "Emine Yıldız", firstName: "Emine", lastName: "Yıldız", email: "emine@test.com", paid: true, country: "Türkiye", credits: 980, phone: "+90 532 1234567", gender: "Female", dateOfBirth: "2001-06-15", referral: "Instagram" },
  { _id: "stu-6", name: "Farid Hassan", firstName: "Farid", lastName: "Hassan", email: "farid@test.com", paid: true, country: "Egypt", credits: 420, phone: "+20 100 1234567", gender: "Male", dateOfBirth: "1996-08-08", referral: "Friend" },
];
// Seeded students are existing, active members (already email-verified + approved).
STUDENTS.forEach((s) => { s.isApproved = true; s.status = "active"; s.userType = "Student"; });

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
function groqChat({ system, user, json = false, maxTokens = 1400, temperature = 0.6 }, cb) {
  if (!GROQ_API_KEY) { cb(new Error("GROQ_API_KEY is not set on the mock backend.")); return; }
  const payload = JSON.stringify({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "system", content: system }, { role: "user", content: user }],
    max_tokens: maxTokens,
    temperature,
    ...(json ? { response_format: { type: "json_object" } } : {}),
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
          try { cb(null, JSON.parse(content)); }
          catch { cb(new Error("The model did not return valid JSON. Please try again.")); }
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

// Seed a couple of demo bookings on the next open days so calendars aren't empty.
function seedBookings() {
  if (BOOKINGS.length) return false;
  const slots = computeSlots(TEACHER_ID, dateStr(new Date()), dateStr(new Date(Date.now() + 12 * 864e5)));
  const picks = [slots[1], slots[6]].filter(Boolean);
  const students = [{ id: "stu-1", name: "Anna Müller" }, { id: "stu-3", name: "Chloé Martin" }];
  picks.forEach((s, i) => {
    BOOKINGS.push({
      _id: `bk-${BOOKING_SEQ++}`, teacherId: TEACHER_ID, teacherName: "Lena Hoffmann",
      studentId: students[i].id, studentName: students[i].name,
      date: s.date, start: s.start, end: s.end, topic: i === 0 ? "German A1 · speaking" : "English B2 · interview prep",
      status: "confirmed", createdAt: new Date().toISOString(),
    });
  });
  return picks.length > 0;
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
    fs.writeFileSync(DATA_FILE, JSON.stringify({ COURSES, ENROLLMENTS, TEACHERS, STUDENTS, AVAILABILITY, BOOKINGS, BOOKING_SEQ, PROVIDERS, SECTION_SEQ }, null, 2));
  } catch (e) {
    console.log("  ! could not save data.json:", e.message);
  }
}

function loadData() {
  try {
    if (!fs.existsSync(DATA_FILE)) return false;
    const d = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    if (Array.isArray(d.COURSES)) { COURSES.length = 0; COURSES.push(...d.COURSES); }
    if (Array.isArray(d.ENROLLMENTS)) { ENROLLMENTS.length = 0; ENROLLMENTS.push(...d.ENROLLMENTS); }
    if (Array.isArray(d.STUDENTS)) { STUDENTS.length = 0; STUDENTS.push(...d.STUDENTS); }
    if (d.AVAILABILITY && typeof d.AVAILABILITY === "object") { Object.keys(AVAILABILITY).forEach((k) => delete AVAILABILITY[k]); Object.assign(AVAILABILITY, d.AVAILABILITY); }
    if (Array.isArray(d.BOOKINGS)) { BOOKINGS.length = 0; BOOKINGS.push(...d.BOOKINGS); }
    if (typeof d.BOOKING_SEQ === "number") BOOKING_SEQ = d.BOOKING_SEQ;
    if (Array.isArray(d.PROVIDERS)) { PROVIDERS.length = 0; PROVIDERS.push(...d.PROVIDERS); }
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
  { _id: "web-1", title: "A1 Level Kickoff Webinar", date: "2026-09-01", description: "Free intro session.", participants: [] },
  { _id: "web-2", title: "Career Growth in Germany", date: "2026-09-15", description: "Positioning and CV mastery.", participants: [] },
];

const CAREERS = [
  { _id: "job-1", title: "Language Tutor (German)", location: "Remote", type: "Part-time", description: "Teach A1–B2 German online." },
  { _id: "job-2", title: "Frontend Developer", location: "Cottbus / Remote", type: "Full-time", description: "React + Tailwind." },
];

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
    thumbnail: body.thumbnail || "https://via.placeholder.com/400x300?text=New+Course",
    tags: Array.isArray(body.tags) ? body.tags : [],
    isPublished: false,
    createdAt: new Date().toISOString(),
    instructorDetails: [{ name: "Demo Teacher" }],
    sections: [],
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
const findAccountByEmail = (email = "") => {
  const e = String(email).toLowerCase();
  return TEACHERS.find((t) => (t.email || "").toLowerCase() === e)
      || STUDENTS.find((s) => (s.email || "").toLowerCase() === e)
      || null;
};
const createStudentAccount = (email, body = {}) => {
  const name = body.name || email;
  const [firstName, ...rest] = String(name).split(" ");
  const s = {
    _id: genId("stu"), name, firstName: firstName || name, lastName: rest.join(" "),
    email, userType: "Student", role: "Student", paid: false, credits: 0,
    country: body.country || "", phone: body.phone || "", gender: body.gender || "",
    dateOfBirth: body.dateOfBirth || null, referral: body.referral || "-",
    isApproved: false, status: "pending", emailVerified: true, createdAt: new Date().toISOString(),
  };
  STUDENTS.push(s);
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
    // A real signed-up account takes priority over the demo convenience login,
    // and is gated on admin approval.
    const acct = findAccountByEmail(body.email);
    if (acct) {
      if (acct.isApproved === false) {
        return { success: false, message: "Your account is pending admin approval. Please check back once an admin has reviewed it." };
      }
      const role = acct.userType || roleFromEmail(body.email);
      return { success: true, accessToken: makeToken(role, acct._id), ...acct };
    }
    const role = roleFromEmail(body.email);
    const u = userFor(role, body.email || undefined);
    return { success: true, accessToken: makeToken(role, u._id), ...u };
  }],
  ["POST", /^\/api\/users\/(google-auth|google-signup)$/, (body) => {
    const role = roleFromEmail(body.email);
    const u = userFor(role, body.email || undefined);
    return { success: true, accessToken: makeToken(role, u._id), ...u };
  }],

  // ---- signup: email OTP -> verify -> create account (pending approval)
  ["POST", /^\/api\/users\/pre-signup$/, (body) => {
    const email = (body && body.email) || "";
    if (findAccountByEmail(email)) return { success: false, message: "An account with this email already exists." };
    const otp = genOtp();
    PENDING_OTPS[email.toLowerCase()] = { otp, userType: (body && body.userType) || "Student" };
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
    const s = createStudentAccount(email, body || {});
    delete PENDING_OTPS[email.toLowerCase()];
    return { success: true, message: "Account created — pending admin approval.", data: s };
  }],
  ["POST", /^\/api\/users\/complete-teacher-signup$/, (body, _p, _r, token) => {
    const parsed = parseSignupToken(token) || {};
    const email = parsed.email || (body && body.email);
    if (!email) return { success: false, message: "Missing or invalid verification token." };
    const t = createTeacherAccount(email, body || {});
    delete PENDING_OTPS[email.toLowerCase()];
    return { success: true, message: "Teacher application submitted — pending admin approval.", data: t };
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
  ["GET", /^\/api\/users\/profile$/, (_b, _p, role) => ({
    success: true, data: userFor(role || "Student"),
  })],
  ["GET", /^\/api\/users\/getprofile\/[^/]+$/, (_b, _p, role) => ({
    success: true, data: userFor(role || "Student"),
  })],
  ["PUT", /^\/api\/users\/updateprofile\/[^/]+$/, (body, _p, role) => ({
    success: true, data: { ...userFor(role || "Student"), ...body },
  })],
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
  ["GET", /^\/api\/courses\/[^/]+$/, (_b, path) => findCourse(path) || COURSES[0]],

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
  ["POST", /^\/api\/calendar\/bookings$/, (body) => {
    const providerId = (body && (body.providerId || body.teacherId)) || "";
    const { date, start, studentId, studentName, topic } = body || {};
    if (!providerId || !date || !start) return { success: false, message: "Missing booking details." };
    const provider = providerById(providerId);
    const av = AVAILABILITY[providerId];
    const end = minToHhmm(hhmmToMin(start) + (av?.slotMinutes || 30));
    const clash = BOOKINGS.find((b) => (b.providerId || b.teacherId) === providerId && b.date === date && b.start === start && b.status !== "cancelled");
    if (clash) return { success: false, message: "That slot was just taken — please pick another." };
    const name = provider?.name || body.providerName || body.teacherName || "Provider";
    const bk = {
      _id: `bk-${BOOKING_SEQ++}`,
      providerId, teacherId: providerId, // teacherId kept as an alias for existing filters
      providerName: name, teacherName: name,
      providerRole: provider?.role || "tutor",
      location: provider?.location || body.location || "Online",
      lab: provider?.lab || null,
      studentId: studentId || "", studentName: studentName || "Student",
      date, start, end, topic: topic || "Session",
      status: "confirmed", createdAt: new Date().toISOString(),
    };
    BOOKINGS.push(bk);
    return { success: true, data: bk };
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
    const b = BOOKINGS.find((x) => x._id === id);
    if (b) b.status = "cancelled";
    return { success: true, message: "Booking cancelled" };
  }],

  // ---- enrollments
  ["GET", /^\/api\/enrollments\/my$/, () => ({ success: true, enrollments: [] })],
  ["GET", /^\/api\/enrollments\/course\/[^/]+\/leaderboard$/, (_b, path) => {
    const cid = path.split("/")[4];
    const ids = new Set(ENROLLMENTS.filter((e) => e.courseId === cid).map((e) => e.student));
    const leaderboard = STUDENTS.filter((s) => ids.has(s._id)).map((s, i) => ({ ...s, rank: i + 1, points: s.credits }));
    return { success: true, leaderboard };
  }],
  ["GET", /^\/api\/enrollments\/[^/]+$/, () => ({ success: true, data: {}, progress: 0 })],

  // ---- webinars / careers / referrals
  ["GET", /^\/api\/webinars\/my-webinars$/, () => WEBINARS],
  ["GET", /^\/api\/webinars$/, () => WEBINARS],
  ["GET", /^\/api\/careers$/, () => CAREERS],
  ["GET", /^\/api\/referrals$/, () => ({ success: true, data: [] })],
];

/* ------------------------------------------------------------------- server */

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

      const payload = JSON.stringify({
        // llama-3.1-70b-versatile was decommissioned by Groq; use its successor.
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: systemPrompt }, ...convo],
        max_tokens: 512,
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
            const reply = parsed.choices?.[0]?.message?.content;
            if (reply) {
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

    for (const [method, pattern, handler] of routes) {
      if (req.method === method && pattern.test(path)) {
        try {
          const out = handler(body, path, role, bearer);
          // Persist after anything that could have mutated the store.
          if (req.method !== "GET" && /^\/api\/(courses|teachers|calendar|users\/(approve|complete|students|pre-signup|verify-email))/.test(path)) saveData();
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
