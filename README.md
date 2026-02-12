# HR Portal

Employee Hub is a React + Vite app backed by a JSON Server mock API. It includes login/signup, an employee dashboard, HR-only user management, and time-off request workflows.

**Quick Start**
1. Install dependencies: `npm install`
2. Start mock API: `npm run server`
3. Start the app: `npm run dev`
4. Open the app: `http://localhost:5173`

The mock API runs at `http://localhost:3001` and uses `db.json`.

**Scripts**
- `npm run dev` — run the Vite dev server
- `npm run build` — create a production build
- `npm run preview` — preview the production build
- `npm run lint` — run ESLint
- `npm run server` — start JSON Server on port 3001

**Tools**
- React + Vite for the UI
- React Router for routing
- Redux Toolkit for auth state
- Tailwind CSS for styling
- JSON Server as a lightweight API

**Repo Structure**
- `src/pages/`
  - Route-level screens such as `Login`, `Signup`, `EmployeeDashboard`, `UserManagement`, `UserProfile`, `AddUser`, and `TimeOffRequests`.
  - Pages are responsible for fetching data and composing components.
- `src/components/`
  - Reusable UI blocks like `AuthCard`, `Container`, `Navbar`, and `UserAvatar`.
  - If multiple pages share a layout or UI pattern, it should live here.
- `src/services/`
  - API helpers for JSON Server (users, leave requests, roles, departments).
  - Keep fetch calls centralized so pages stay clean.
- `src/store/`
  - Redux store and slices (auth state, current user).
  - `store.js` wires up the reducers and persists auth in localStorage.
- `src/utils/`
  - Utility functions such as date helpers and className composition.
- `src/styles/`
  - Shared Tailwind class strings (e.g., navbar menu item styles).
- `src/constants/`
  - Shared app constants like the user field definitions.
- `db.json`
  - Mock database for JSON Server (users, roles, departments, leave requests).

**Roles & Access**
- HR-only pages: `/user-management`, `/user-management/:userId`, `/user-management/new`, `/time-off-requests`
- General employee page: `/employee-dashboard`

**Notes**
- Photos are expected in `public/photos/` and referenced by filename in `db.json`.
- If you update `db.json`, restart the JSON Server to refresh data.
