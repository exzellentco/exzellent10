# What's New — Exzellent Platform

Everything added since the initial handoff commit (`6e241ea`), across the two feature pushes
(`86d219c` → `1d88308` → current). Written to explain the new features to the team.

> All of this runs on the **frontend + local mock backend** and is ready to drop onto the real
> backend. For live money and real students, the backend team must implement the same endpoints
> in production (subscriptions, Stripe, referral-gated signup, attendance).

---

## 1. Pricing & credit system

A full **credit wallet** model (like ChatGPT/Claude usage) on top of subscription tiers.

- **5 plans** (Starter → Ultimate) each with a monthly **credit allowance**, shown on `/pricing`.
- **Sign-up bonus:** every new member gets **200 free credits**.
- **Credits are spent** on AI tools, live classes, webinars and materials.
- **Stripe checkout** on `/offer` (Payment Links ready — paste your real links into `PLANS`).
- Everything (prices, credit amounts, sign-up bonus, AI costs) is configurable at the top of
  `mock-backend/mock-server.cjs`.

### Pricing-page growth mechanics *(airline/BestSecret-style conversion)*
- **Countdown timer** — an always-running "launch offer ends in mm:ss" that restarts when it hits 0.
- **Yearly billing shown first** with a "save 2 months" badge; declining it drops to a **monthly
  "start small" nudge** for the cheapest plan (upsell → downsell).
- **Live social proof** — a "🟢 X learning right now · N members and growing" bar.

---

## 2. Real accounts & authentication

- **Real email + password login** — the correct password is required; wrong passwords are rejected,
  and passwords never leave the server.
- **Every student is their own account** with an editable, persistent profile (no more shared
  "Demo Student"). Edits stick across reload and restart.
- **Demo logins:** `admin@test.com` / `Admin123`, `teacher@test.com` / `Teacher123`,
  `koszoz99@gmail.com` / `Kos12345`, seed students `Student123`.

---

## 3. Invite-only registration + waitlist + referrals *(BestSecret model)*

- **Registration is invite-only** — signup requires a valid invite/referral code.
- **Public waitlist** (`/waitlist`) fallback for non-invited visitors ("request an invite").
- **Admin issues codes** from the waitlist at `/invite-requests`.
- **Personal referral codes** for every member, with a shareable `/signup?ref=CODE` link.
- **Referral rewards paid in credits** — when someone you invited upgrades, you earn credits.
- **Tracking of who invited whom** (powers affiliate payouts later).

---

## 4. Community *(Skool-style)*

`/community` — a members' feed with **posts, likes, threaded comments, and spaces**
(General / Wins / Questions / Study buddies / Germany life). The "culture layer."

---

## 5. Affiliate & Ambassador program

- **Self-selling explainer pages** — `/affiliates` (commission-focused) and `/ambassadors`
  (creator/influencer-focused): hero, how-it-works, benefits, FAQ, CTAs.
- **Partner dashboard** (`/partner`) — personal code, shareable link, invited people, and earnings.

---

## 6. Live classes — booking, Zoom & attendance

- **Preply-style booking** (`/book`) — pick a teacher, see their availability slots, confirm.
- **In-site Zoom classroom** (`/class/:id`) — students join their class *inside the site*. The Zoom
  Meeting SDK integration is wired and **activates the moment you add `ZOOM_SDK_KEY` /
  `ZOOM_SDK_SECRET`**; until then it shows a clean "open in Zoom" panel.
- **Live-class attendance tracking** — joining records attendance; students see a "classes attended"
  stat, teachers see the attendee list per lesson.

---

## 7. AI tools + credit caps

- **AI Content Engine** — upload a PDF → full study kit (outline, flashcards, quiz, summary) saved
  onto the course.
- **AI tools** — exam generator, course/study-plan builder, progress report, speech analyzer.
- **Credit metering** — students spend credits per AI use (small free cap); when out, they see a
  friendly "upgrade your plan" prompt instead of a failure. Teachers/admins are free.

---

## 8. Learning tools *(retention & mastery)*

- **Spaced-repetition flashcards** — study-kit cards resurface on a schedule (SM-2-style) with a
  **🔥 daily streak**.
- **Quizzes + certificates** — quizzes score and record; completing a course unlocks a printable
  **Certificate of Completion**.
- **Teacher ↔ student speaking assignments** — a teacher assigns a speaking task, the student
  records via the Speech Analyzer, the score returns to the teacher, who leaves feedback.

---

## 9. Dashboard upgrades

- **Student** — a visual "Your progress" block: a circular **progress ring**, a **🔥 streak**, and
  icon **stat tiles** (courses, classes attended, credits with a Top-up button).
- **Teacher** — **iconed stat tiles** (earnings, courses, students, AI) + the earnings chart.
- **Admin** — **summary stat rows** on the Students (Total / Active / Pending / Paid) and Teachers
  (Total / Approved / Pending / Languages) pages.
- Real-time data throughout (earnings, students, progress, attendance).

---

## 10. Marketing site — Learning Ecosystem page

`public/learning-ecosystem.html` got several premium touches:
- **3D rotating teacher ring** — a coverflow gallery of teacher photos (drag to spin, click to enlarge).
- **Live social-proof bar** in the hero (online-now + growing member count).
- **Tutor cards** — a clean row of individual tutors (photo, language, rating, lessons, price, Book).
- **Product-preview mockups** — CSS mockups of the real dashboard UI in the preview section.
- **Fixed CTAs** — "Start free" / "Apply to teach" pointed at dead `mailto:` links; now they go to
  real `/signup` and `/teacher-form`, plus a "See plans" → `/pricing` entry.

---

## 11. Fixes & housekeeping

- **Course browsing** — real search, CEFR level filter, thumbnails, always-visible enroll button,
  progress that persists, and a real course player.
- **Webinars** — fixed two crash pages (detail + participants) and wired real registration.
- **Navigation** — the new pages are reachable from the navbar; fixed the admin-nav clipping.
- **Networking safety** — in dev, all `/api` calls go through the Vite proxy to the mock, so a
  missing env var can never point admin writes at production.
- **Clean build & lint** — `npm run build` and `npm run lint` pass with no errors.

---

## New pages / routes at a glance

| Route | What |
| --- | --- |
| `/pricing` | Plans + credits + growth mechanics |
| `/offer` | Stripe checkout (buy credits) |
| `/waitlist` | Request-an-invite page |
| `/community` | Members' community feed |
| `/book` | Book a live class |
| `/class/:id` | In-site Zoom classroom |
| `/affiliates`, `/ambassadors` | Program explainer pages |
| `/partner` | Partner (referral) dashboard |
| `/invite-requests` | Admin: turn waitlist requests into codes |

---

## Still on the owner/backend side
- Rotate the **Stripe key** committed in `.env`.
- **Deploy** to the domain (HTTPS via Vercel).
- Backend team implements these endpoints on the **real backend**.
- Add **Zoom SDK credentials** to enable in-site video embedding.
- Add a **Groq API key** (`mock-backend/.env`) for the AI features.
