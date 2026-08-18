// AI tool generators — all call Groq-backed mock endpoints and return structured
// JSON. Used by the AI Tools hub in the student & teacher dashboards.
async function postJSON(path, body) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  // Out-of-credits: backend returns HTTP 402 { success:false, needCredits:true,
  // cost, credits, message }. Surface a specific error callers can detect so the
  // UI can show an "upgrade your plan" call-to-action instead of a generic fail.
  if (res.status === 402 || data.needCredits) {
    const e = new Error(data.message || "You're out of credits — upgrade your plan to keep using AI tools.");
    e.needCredits = true;
    e.cost = data.cost;
    e.credits = data.credits;
    throw e;
  }
  if (!res.ok || data.success === false) {
    throw new Error(data.message || "Generation failed. Please try again.");
  }
  return data;
}

// { topic, language, level, count } -> { title, mcqs[], flashcards[], oral_prompts[] }
export const generateExam = (opts) => postJSON("/api/ai/generate-exam", opts);

// teacher: { description, language, level, audience:"teacher" } -> { title, description, sections[] }
// student: { description, language, level, audience:"student" } -> { title, summary, weeks[] }
export const buildCourse = (opts) => postJSON("/api/ai/build-course", opts);

// { name, audience, metrics } -> { headline, narrative, strengths[], focus[], cefr_estimate }
export const generateProgressReport = (opts) => postJSON("/api/ai/progress-report", opts);

// { text, language, level } -> { title, description, sections[], flashcards[], quiz[], summary, key_terms[] }
export const generateStudyKit = (opts) => postJSON("/api/ai/study-kit", opts);
