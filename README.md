# Exzellent — Frontend

The web frontend for **Exzellent**, a language-learning + skills platform (courses, AI tutors,
speech practice, tutor/mentor booking). Built with **React + Vite**. It talks to a backend API,
and ships with a **local mock backend** so you can run and develop the whole app on your machine
with zero cloud setup.

---

## 1. TL;DR — run it locally

You need **Node.js 18+** installed. Then, from this folder:

```bash
npm install                         # 1. install dependencies (once)
node mock-backend/mock-server.cjs   # 2. start the local fake backend (leave running)
npm run dev                         # 3. in a SECOND terminal, start the app
```

Open **http://localhost:3000**. Log in with any password and one of:

| Email               | You get           |
| ------------------- | ----------------- |
| `admin@test.com`    | Admin dashboard   |
| `teacher@test.com`  | Teacher dashboard |
| `student@test.com`  | Student dashboard |

> The **email decides the role** (anything containing "admin"/"teacher" → that role, otherwise student).
> The password is ignored. Nothing here touches a real database.

On Windows you can double-click **`start-mock-backend.bat`** instead of step 2.

---

## 2. What this is (tech stack)

| Thing            | What we use                                             |
| ---------------- | ------------------------------------------------------ |
| Framework        | **React 19** + **React Router 7**                      |
| Build / dev tool | **Vite 6** (dev server on port **3000**)               |
| Styling          | **Tailwind CSS v4** + hand-written scoped CSS          |
| Icons            | `lucide-react`                                          |
| Local backend    | **`mock-backend/mock-server.cjs`** — plain Node, no deps |
| AI features      | **Groq** API (LLM + Whisper), proxied through the mock |
| Hosting          | **Vercel** (frontend) · **Render** (real backend)      |

There are two kinds of pages:

- **The React app** (`src/`) — dashboards, login, courses, calendar, etc. (a single-page app).
- **Static HTML pages** (`public/`) — the marketing site: the home "star" page, the learning
  ecosystem, the three labs, and the Exzi playground. These are plain HTML served as-is.

---

## 3. The two backends (read this — it explains most confusion)

The app can talk to **two** different backends:

1. **Real backend** — `https://exzellent-backend-1.onrender.com` (on Render). Has the real
   database, real accounts, real courses. Set in **`.env`**.
2. **Local mock backend** — `http://localhost:5000` (the file `mock-backend/mock-server.cjs`).
   Fake data, any-password login, no database. Set in **`.env.local`**.

**`.env.local` overrides `.env`**, so **by default local development uses the mock.** That's what
you want 99% of the time.

### How requests are routed (important gotcha)

Two mechanisms reach the backend, and some newer features deliberately use the second one:

- Most API files use the shared **axios** instance (`src/utils/axios.js`), whose base URL is
  `VITE_BACKEND_BASE_URL`.
- The **mock-only features** (Calendar/booking, Speech Analyzer, AI Tools) call the API with a
  **relative `/api/...` path**, which Vite's dev server **proxies to `localhost:5000`**
  (see `vite.config.js` → `server.proxy`). This is reliable in dev regardless of the env value,
  which is why those features always hit the mock.

👉 If you build a **new feature that needs the mock** and it "can't reach data", use a relative
`fetch("/api/...")` (like `src/APIs/calendar.js`) rather than the axios base URL.

> After changing **any** `.env*` file you **must restart** `npm run dev` — Vite only reads env at startup.

---

## 4. Project structure

```
.
├─ index.html                 # Vite entry (mounts the React app)
├─ package.json               # scripts + dependencies
├─ vite.config.js             # dev server :3000, /api proxy → :5000, clean-URL rewrites
├─ tailwind.config.js
├─ vercel.json                # production rewrites (SPA fallback, /exzi)
├─ .env / .env.local / .env.example   # config (see §7)
│
├─ mock-backend/              # THE LOCAL FAKE BACKEND
│  ├─ mock-server.cjs         #   one file, plain Node http server (all fake data + logic)
│  └─ README-FAKE-LOGIN.md    #   notes on the fake-login system
│
├─ public/                    # STATIC assets + marketing HTML (served as-is)
│  ├─ home.html               #   the nine-point "star" landing page
│  ├─ learning-ecosystem.html #   student/teacher personas, labs, dashboard previews
│  ├─ exzi.html               #   the Exzi AI-companion playground  (route: /exzi)
│  ├─ labs/                   #   language / skill / growth lab pages
│  ├─ previews/               #   dashboard screenshots shown in the learning ecosystem
│  └─ logo.png, partners/, …
│
└─ src/                       # THE REACT APP
   ├─ main.jsx                #   app bootstrap + global CSS imports
   ├─ App.jsx                 #   routes + top navigation + auth gating
   ├─ pages/                  #   one folder/file per screen
   │  ├─ StudentDashboard.jsx
   │  ├─ TeacherDashboard.jsx
   │  ├─ CalendarPage.jsx     #   /calendar — the booking calendar
   │  ├─ Admin/               #   GetStudent, Teachers, TeacherDetail, AddTeachers, AdminCourses…
   │  ├─ Login&Signup/        #   Login, Signup (email OTP), TeacherForm
   │  ├─ Courses.jsx, Webinars.jsx, Payment/, Legal/, Errors/ …
   ├─ components/
   │  ├─ AiTools/             #   AI Tools hub: Exam Generator, Course Builder, Progress Report
   │  ├─ SpeechAnalyzer/      #   record → Whisper → pronunciation scoring (student + teacher)
   │  ├─ Tools/               #   Student "Tools" panel, Calendar popup
   │  ├─ CourseComponent/, StudentComponent/, TeacherComponent/, WebinarComponents/ …
   │  └─ DashboardShell.jsx, Navbar.jsx, Footer.jsx …
   ├─ APIs/                   #   one module per backend area (see §6)
   ├─ data/                   #   static data (e.g. practice sentences)
   ├─ styles/                 #   scoped CSS (dashboard, auth, teacher-dash, speech, calendar)
   ├─ hooks/, lib/, utils/, UI/, assets/
```

---

## 5. Features (what's built, and where)

| Feature | What it does | Lives in |
| --- | --- | --- |
| **Auth + signup** | **Real email/password login** (wrong password rejected, passwords never leave the server) + Google, 3-step signup with **email OTP**, admin approval | `pages/Login&Signup/`, `APIs/Signup/` |
| **Pricing & credits** | Subscription tiers + a **credit wallet** (per-plan allowances, sign-up bonus, per-use AI cost), and growth mechanics: **countdown timer, yearly-first upsell + monthly downsell, live online/member counters** | `pages/Pricing.jsx`, `pages/Payment/Offer.jsx`, stats in mock |
| **Invite-only + waitlist** | BestSecret-style registration gate, personal **referral codes**, admin **waitlist → invite**, referral rewards paid in **credits** | `pages/Login&Signup/Signup.jsx`, `pages/Waitlist.jsx`, `pages/Admin/WaitlistAdmin.jsx` |
| **Community** | Skool-style feed — posts, likes, comments, spaces | `pages/Community.jsx` |
| **Affiliate / Ambassador** | Self-selling explainer pages + a partner dashboard (referral stats & earnings) | `pages/Affiliates.jsx`, `pages/Ambassadors.jsx`, `pages/PartnerDashboard.jsx` |
| **Live classes** | Preply-style booking, an **in-site Zoom classroom** (`/class/:id`, SDK-ready) and **attendance tracking** | `pages/BookClass.jsx`, `pages/ClassRoom.jsx` |
| **Learning tools** | **Spaced-repetition** flashcards + streaks, **quizzes + certificates**, teacher↔student **speaking assignments** | `components/Review/`, `components/Assignments/`, `AiTools/StudyKitView.jsx` |
| **Student dashboard** | Profile, enrolled courses, progress, a **Tools** panel (Calendar, AI, Teachers, Test Creator, Top tests, Resources) | `pages/StudentDashboard.jsx`, `components/Tools/` |
| **Teacher dashboard** | Live stats (earnings, students, courses), **AI Content Engine**, course/section management, earnings chart | `pages/TeacherDashboard.jsx` |
| **Admin** | Manage **teachers** (approve/edit/delete) and **students** (approve/edit/delete), courses, webinars, jobs | `pages/Admin/` |
| **AI Tools** (both dashboards) | **Exam Generator**, **Course Builder / Study Plan**, **Progress Report** — all real, via Groq | `components/AiTools/`, `APIs/aiTools.js` |
| **Speech Analyzer** (both dashboards) | Record speech → Whisper transcribes → pronunciation score + per-word feedback | `components/SpeechAnalyzer/`, `APIs/speechAnalyzer.js` |
| **Calendar + booking** | A small Cal.com: providers (tutors/mentors/coaches) publish availability, students book slots, everyone sees bookings, **"Add to Google Calendar"** links | `pages/CalendarPage.jsx`, `APIs/calendar.js` |
| **Exzi playground** | AI companion chat (+ voice) — static page at **/exzi** | `public/exzi.html` |
| **Marketing site** | Home star page, learning ecosystem, three labs | `public/*.html`, `public/labs/` |

Dashboards each surface the tools via **floating buttons** (bottom-right) and/or sidebar items.

---

## 6. The `src/APIs/` modules

Each file wraps one area of the backend. Signatures are small and self-documenting.

| File | Area |
| --- | --- |
| `teacherProfile.js` | teacher profile + **live dashboard stats** (`/api/teachers/dashboard`, `/students`, `/earnings`) |
| `AdminCourses.js` | courses + sections (create/update/delete/publish) |
| `AdminAddTechers.js` | admin: list / approve / edit / delete teachers |
| `AdminStudents.js` | admin: approve / edit / delete students |
| `Signup/SignupApis.js` | signup: OTP send/verify, complete signup |
| `StudentApi/StudentDetails.js` | student profile, enrollments, leaderboard |
| `aiTools.js` | Exam Generator, Course Builder, Progress Report (Groq) |
| `speechAnalyzer.js` | pronunciation analysis (Whisper + scoring) |
| `calendar.js` | providers, availability, slots, bookings, Google-Calendar link |
| `contactApi.js`, `AdminWebinar.js`, `AdminAddJobs.js`, `AdminReferral.js` | contact form, webinars, jobs, referrals |

---

## 7. The mock backend (`mock-backend/mock-server.cjs`)

A single, dependency-free Node HTTP server on **port 5000**. It fakes the whole API so you can
run everything locally. Highlights:

- **Fake login** — any password; the email picks the role (see §1).
- **Coherent demo data** — one teacher (**Lena Hoffmann**), students, courses, enrollments,
  earnings, bookings — all internally consistent, so every dashboard number is computed from the
  same source (not random).
- **Real AI** — `/api/ai/chat`, `/api/ai/transcribe`, `/api/ai/analyze-speech`,
  `/api/ai/generate-exam`, `/api/ai/build-course`, `/api/ai/progress-report` proxy to **Groq**.
  These need a Groq API key (below); everything else works without it.
- **Persistence** — course/booking/account edits are saved to `mock-backend/data.json`
  (git-ignored). **Delete that file to reset to the seed data.**
- **Signup + approval** — email OTP is printed to the mock's terminal (no real email is sent).

### Enabling the AI features (optional)

The AI tools, Exzi chat, and speech analyzer call **Groq**. To turn them on, create
`mock-backend/.env` with:

```
GROQ_API_KEY=your_groq_key_here
```

Get a free key at https://console.groq.com. Without it, the AI buttons return a friendly error but
the rest of the app works fine.

---

## 8. Environment variables

Vite exposes only vars prefixed `VITE_`. Files (later overrides earlier): `.env` → `.env.local`.

| Variable | Purpose |
| --- | --- |
| `VITE_BACKEND_BASE_URL` | backend API. `.env` = Render (real); `.env.local` = `http://localhost:5000` (mock) |
| `VITE_GOOGLE_CLIENT_ID` | Google sign-in on Login/Signup |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe checkout on Payment pages |
| `VITE_CLOUDINARY_CLOUD_NAME` / `_UPLOAD_PRESET` | image uploads |

- **`.env.example`** lists every variable — copy it to `.env` and fill in values.
- **`.env` and `.env.local` are git-ignored** (they hold keys). They are included in this folder so
  the app runs out of the box locally.
- ⚠️ The `.env` here contains a **LIVE Stripe publishable key** — Payment pages would take **real
  money**. For testing, swap in your `pk_test_...` key.
- Helper scripts: **`use-mock-backend.bat`** / **`use-real-backend.bat`** flip which backend the
  app points at (they edit the env), then restart `npm run dev`.

---

## 9. Scripts

| Command | What |
| --- | --- |
| `npm run dev` | start the Vite dev server on **:3000** |
| `npm run build` | production build → `dist/` |
| `npm run preview` | preview the production build locally |
| `npm run lint` | run ESLint over `src/` |
| `node mock-backend/mock-server.cjs` | start the local fake backend on **:5000** |

---

## 10. Deployment

- **Frontend** deploys to **Vercel** (`vercel.json` handles SPA fallback + the `/exzi` rewrite).
  Set the `VITE_*` env vars in the Vercel dashboard (point `VITE_BACKEND_BASE_URL` at the real
  backend).
- **The mock backend is dev-only** — it is **not** deployed. Features that only exist in the mock
  (calendar/booking, live teacher stats, AI generators, speech analyzer, signup approval) will not
  work in production until the **real backend** implements the same endpoints. The mock's route
  shapes in `mock-server.cjs` are the contract to build against.

---

## 11. Known limitations / mock-only

These work locally (mock) but need real-backend endpoints to work in production:

- Calendar & booking (`/api/calendar/*`)
- Teacher live stats: earnings/students/dashboard (`/api/teachers/dashboard`, `/students`, `/earnings`)
- AI generators (exam / course / progress report) and Speech Analyzer (need Groq server-side)
- Signup email OTP + admin approval flow
- "Add to Google Calendar" is a **pre-filled link** (no two-way OAuth sync)

---

## 12. Troubleshooting

| Symptom | Fix |
| --- | --- |
| Blank page / "Failed to fetch" | The mock backend isn't running — start `node mock-backend/mock-server.cjs`. |
| A new feature can't reach data | It's probably calling the axios base URL (Render). Use a relative `fetch("/api/...")` so Vite proxies it to the mock (see §3). |
| Env change had no effect | Restart `npm run dev` — Vite reads env only at startup. |
| AI buttons error | Add `GROQ_API_KEY` to `mock-backend/.env` (see §7). |
| Want fresh demo data | Delete `mock-backend/data.json` and restart the mock. |
| Port 3000 or 5000 in use | Stop the other process, or change the port in `vite.config.js` / the mock's `PORT`. |

---

## 13. Contributing & conventions (onboarding)

New here? This is how the codebase is meant to grow.

### Git
There is **no autosave / auto-commit** anymore — use normal git. Branch off, commit, open a PR:

```bash
git checkout -b feature/my-thing
# ...work...
npm run lint          # keep it clean before pushing
git add -A && git commit -m "feat: my thing"
```

### Where things go

| You want to add… | Put it in… | Also do… |
| --- | --- | --- |
| A new **screen/page** | `src/pages/MyPage.jsx` | register a `<Route>` in `src/App.jsx` |
| A reusable **component** | `src/components/<Area>/MyThing.jsx` | group by area (AiTools, Tools, CourseComponent…) |
| A **backend call** | `src/APIs/myArea.js` | one function per endpoint, small + named |
| A **mock endpoint** | `mock-backend/mock-server.cjs` | add to the `routes` array (§ below) |
| **Styling** | Tailwind classes, or a scoped file in `src/styles/` | keep new CSS scoped under a root class |
| **Static/marketing HTML** | `public/…` | plain HTML, no build step |

### The one golden rule (data fetching)

- Talking to a **real-backend** area (courses, users, teachers)? Use the shared axios instance:
  `import axios from "../utils/axios"`.
- Talking to a **mock-only** area (calendar, AI tools, speech)? Use a **relative fetch** so Vite's
  proxy routes it to the mock in dev:

  ```js
  const res = await fetch("/api/my/endpoint", { method: "POST", headers: {...}, body: ... });
  ```

  (This is why `src/APIs/calendar.js`, `aiTools.js`, `speechAnalyzer.js` use `fetch`, not axios —
  the axios base URL points at the real Render backend, which doesn't have these endpoints.)

### Adding a mock endpoint

`mock-backend/mock-server.cjs` is one file. Most endpoints are entries in the `routes` array:

```js
["GET", /^\/api\/my\/thing$/, (body, path, role) => ({ success: true, data: [...] })],
```

- Regex matches the path; the handler returns the JSON body.
- Mutating routes (`POST/PUT/DELETE`) should push/edit the in-memory arrays and are auto-saved to
  `data.json` if the path matches the save filter (search `saveData()` to extend it).
- To reset demo data: delete `mock-backend/data.json` and restart the mock.

### Definition of done for a feature
1. Works locally against the mock (both roles if relevant).
2. `npm run lint` is clean and `npm run build` passes.
3. If it's a mock-only feature, note the **real endpoint contract** it needs (so the backend team
   can implement it) — the mock route is that contract.

---

## 14. Before sharing this folder publicly

This folder ships with working `.env` values so it runs out of the box. If you're sending it
**outside your team**, sanitize first:

- Replace the **live Stripe key** in `.env`:
  `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key` (get a `pk_test_...` from the Stripe dashboard).
- Remove `mock-backend/.env` if it contains your **`GROQ_API_KEY`** (each dev adds their own).
- Optional: delete `.env` / `.env.local` entirely and let people copy `.env.example` → `.env`.
- `node_modules/`, `dist/`, and `mock-backend/data.json` should **not** be shared — they regenerate.

> Note: `VITE_*` values are **compiled into the browser bundle** and are public by design
> (Stripe *publishable* key, Google client ID, Cloudinary preset). The only true secret is the
> server-side `GROQ_API_KEY` in `mock-backend/.env`, which never reaches the browser.

---

## 15. Changelog

### Unreleased — dashboards, pricing mechanics & landing polish *(since the last push `86d219c`)*
- **Pricing page growth mechanics** — an evergreen **countdown timer**, **yearly billing presented first** with a monthly *downsell* nudge (airline-style upsell→downsell), and a live **"X online now · N members and growing"** social-proof bar.
- **Live-stats backend** — `GET /api/stats` (active users in a 5-minute window + a gently-growing member count) and `POST /api/stats/heartbeat`; login marks a user active.
- **Dashboard visual upgrades** — student: a circular **progress ring**, a **🔥 streak** and icon **stat tiles**; teacher: iconed stat tiles; admin (students & teachers): **summary stat rows**.
- **Learning-ecosystem page** (`public/learning-ecosystem.html`) — a **3D rotating teacher ring**, a live social-proof hero bar, individual **tutor cards**, CSS **product-preview mockups**, and fixed the **"Start free" / "Apply to teach"** CTAs (were dead `mailto:` links) to real `/signup` and `/teacher-form`, plus a **"See plans" → `/pricing`** entry.
- **Housekeeping** — fixed all ESLint errors (config-file Node env + stray directives); `npm run build` and `npm run lint` are clean.

### `86d219c` — Launch feature set
Credits & pricing, real email+password auth, invite-only registration + waitlist + referral tracking, community feed, affiliate/ambassador pages + partner dashboard, Preply-style booking + in-site Zoom classroom + attendance, AI tools with credit caps, spaced repetition, quizzes + certificates, teacher↔student assignments, plus course-browsing and webinar fixes.

---

Questions? Start from **`App.jsx`** (routes) and **`mock-backend/mock-server.cjs`** (all the fake
data + endpoints) — between those two files you can trace almost anything end to end.
