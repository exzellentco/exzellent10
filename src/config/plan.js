/**
 * What the free plan includes, in one place.
 *
 * The rule of thumb behind the split: PRACTICE is free, GENERATION is paid.
 * Speaking practice, the daily review and Exzi are what make someone come back,
 * so they stay open. Generating an exam, a study plan or a written progress
 * report each costs a model call per press, which is the part that has to be
 * paid for.
 *
 * Change a value here and the dashboards follow — the lock badges, the wording
 * and what a click does are all driven off this. Nothing else hard-codes it.
 */

export const PAID_ONLY = {
  aiExam: true,        // AI exam / placement test generator
  aiCourse: true,      // AI study-plan and course builder
  aiReport: true,      // AI written progress report
  speechLab: false,    // free — the core practice loop
  dailyReview: false,  // free — flashcards keep people coming back
  messages: false,     // free — talking to your teacher is not a premium feature
  exzi: false,         // free — already rate-limited for anonymous visitors
};

/** True when this feature needs the paid plan and the account does not have it. */
export const isLocked = (feature, paid) => !paid && PAID_ONLY[feature] === true;

/** What to tell someone who taps a locked feature. */
export const LOCK_NOTE = "Included in the full plan";

/** Where the plans live. */
export const PLAN_ROUTE = "/payment";

export default PAID_ONLY;
