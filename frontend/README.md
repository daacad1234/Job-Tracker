# The Board — Frontend

React 18 (Vite) + Tailwind CSS v4 + Axios + React Router v6

## Setup
```bash
npm install
npm run dev
```
Runs on **http://localhost:5173** and expects the backend on **http://localhost:8080**
(see `src/services/api.js` for the base URL).

## What's here
```
src/
  components/   Navbar, JobCard, StatusBadge, PrivateRoute, LoadingSpinner, EmptyState
  pages/        JobBoard, JobDetail, Login, Register, MyApplications, SavedJobs,
                EmployerDashboard, ApplicantsReview, AdminCategories
  services/     api.js — axios instance with JWT interceptor + error helper
  context/      AuthContext.jsx — login/register/logout, persists to localStorage
```

## Roles reflected in the UI
- **Public** — browse/search jobs, view job detail
- **APPLICANT** — apply, track applications, save/unsave jobs
- **EMPLOYER** — create company profile(s), post/close jobs, review applicants and
  move them through PENDING → REVIEWED → SHORTLISTED → ACCEPTED/REJECTED
- **ADMIN** — manage job categories (register via the API/Postman with
  `"role": "ADMIN"` — there's intentionally no admin option in the sign-up UI)

`PrivateRoute` redirects unauthenticated users to `/login`, and redirects users
whose role doesn't match a route's `roles` prop back to `/`.

## Build
```bash
npm run build   # outputs to dist/
npm run preview # serve the production build locally
```
