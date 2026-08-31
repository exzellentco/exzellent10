// Per-route <title> and meta description for the single-page app.
//
// Every SPA route is served the same index.html, so without this each page
// shares one title and one description. Search engines render the JS and read
// what the document ends up with, so sitelinks for /login, /pricing and the
// rest were all showing the homepage's text.
//
// This is not a substitute for server-rendered meta — a crawler that does not
// execute JavaScript still sees index.html's defaults — but it fixes the
// duplicate-snippet problem for Google, which does render.

const SITE = "Exzellent";
const DEFAULT_TITLE = "Exzellent — Learn German with real tutors and AI";
const DEFAULT_DESC =
  "Learn German with real tutors and AI practice — plus the skills and career " +
  "support for life in Germany. Live 1-to-1 lessons, exam prep and Exzi, your AI companion.";

// Longest matching prefix wins, so "/courses/123" picks up the /courses entry.
const ROUTES = [
  ["/login", "Log in", "Sign in to continue your German lessons, tutors and AI practice on Exzellent."],
  ["/signup", "Create your account", "Join Exzellent — German lessons with real tutors, AI practice and career support for life in Germany."],
  ["/forgot-password", "Reset your password", "Reset the password for your Exzellent account."],
  ["/courses", "Courses", "German courses from A1 to C2, plus skills and career tracks. Learn with real tutors and AI practice."],
  ["/offer", "Plans and pricing", "Choose a plan for German lessons, AI practice and exam prep. Start free, upgrade when you are ready."],
  ["/webinars", "Free webinars", "Live sessions on learning German, studying and working in Germany. Free to join."],
  ["/careers", "Careers at Exzellent", "Open roles at Exzellent. Help build the platform for learning German and building a life in Germany."],
  ["/community", "Community", "Meet other learners, join events and practise together in the Exzellent community."],
  ["/contact", "Contact us", "Questions about lessons, plans or teaching with Exzellent? Get in touch."],
  ["/book", "Book a class", "Book a 1-to-1 German lesson with a real tutor. Pick a time that suits you."],
  ["/waitlist", "Join the waitlist", "Request an invite to Exzellent and be first in when a place opens."],
  ["/affiliates", "Affiliate programme", "Earn by introducing learners to Exzellent."],
  ["/ambassadors", "Ambassador programme", "Represent Exzellent on your campus or in your community."],
  ["/privacy", "Privacy policy", "How Exzellent collects, uses and protects your data."],
  ["/data-policy", "Data policy", "How Exzellent handles and stores your data."],
  ["/impressum", "Impressum", "Legal information for Exzellent."],
  ["/terms", "Terms and conditions", "The terms that apply to using Exzellent."],
];

// Dashboards and admin screens must never be indexed.
const PRIVATE = ["/student-dashboard", "/teacher-dashboard", "/calendar", "/class/", "/get-student",
                 "/add-", "/invite-requests", "/partner", "/payment", "/success", "/cancel"];

const setMeta = (name, content) => {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

/** Apply the title and description for a pathname. */
export const applyPageMeta = (pathname = "/") => {
  const path = String(pathname || "/");

  const match = ROUTES
    .filter(([p]) => path === p || path.startsWith(p + "/"))
    .sort((a, b) => b[0].length - a[0].length)[0];

  if (match) {
    document.title = `${match[1]} | ${SITE}`;
    setMeta("description", match[2]);
  } else {
    document.title = DEFAULT_TITLE;
    setMeta("description", DEFAULT_DESC);
  }

  // Keep private areas out of the index regardless of what they are titled.
  const isPrivate = PRIVATE.some((p) => path.startsWith(p));
  setMeta("robots", isPrivate ? "noindex, nofollow" : "index, follow");
};

export default applyPageMeta;
