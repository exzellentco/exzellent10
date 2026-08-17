# Developing without a real login (fake backend)

You don't have credentials for the real system, and you don't need them to build
and preview the app. This gives you a **fake backend** that accepts any login and
serves invented sample data, so every dashboard opens. Nothing here touches the real
database or the live site.

## One-time picture

Two things must run at the same time:

1. **The website** — `npm run dev` (what you already use), at http://localhost:3000
2. **The fake backend** — `start-mock-backend.bat`, at http://localhost:5000

Then you tell the website to talk to the fake one instead of the real one.

## Steps

1. Double-click **`start-mock-backend.bat`** (in the project's main folder).
   A window opens and stays open — that's the fake backend. Leave it open.

2. Double-click **`use-mock-backend.bat`**. This flips the website over to the fake
   backend.

3. **Restart the website** so it notices the change:
   - close the window running `npm run dev`
   - start it again (`npm run dev`)

4. Go to **http://localhost:3000/login** and log in. **The password can be anything.**
   The email you type decides which dashboard you get:

   | Email | You become |
   |---|---|
   | `admin@test.com` | Admin |
   | `teacher@test.com` | Teacher |
   | `student@test.com` (or any other) | Student |

## Going back to the real site

1. Double-click **`use-real-backend.bat`**.
2. Restart the website (close and re-run `npm run dev`).

The website is back on the real backend. You can close the fake-backend window.
The real backend still needs a real account to log in.

## How it works (for later)

- `mock-backend/mock-server.cjs` is a tiny Node server. It answers the same API
  paths the app calls (`/api/users/login`, `/api/courses`, and so on) with made-up
  data. Any path it doesn't specifically handle gets a harmless empty-but-successful
  reply, so the UI never hard-crashes.
- The switch is a file called `.env.local`. When it exists it points the app at
  `http://localhost:5000`; the two `.bat` files just create or delete it. It is
  git-ignored, so it never gets committed and never reaches the real site.
- The real setting in `.env` is left untouched the whole time.

## If a screen looks empty or odd

The sample data is deliberately small (three courses, three students, two webinars).
Some admin/teacher screens may show little because there's not much fake data behind
them — that's expected, not a bug. If you need a specific screen populated to work on
it, the data lives near the top of `mock-server.cjs` and is easy to extend.
