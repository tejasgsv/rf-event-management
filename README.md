# RF Event Management

Event and session management platform with a public attendee site and an admin panel.

## Tech Stack
- Frontend: React (Vite)
- Admin: React (Vite)
- Backend: Node.js + Express
- Database: MySQL
- Auth: JWT (admin)

## Project Structure
- frontend/ — Public site
- admin-app/ — Admin panel
- backend/ — API server

## Local Setup
### 1) Database
- Create a MySQL database named `rf_event_management`.
- Run `backend/database.sql` or `backend/create-tables.js`.

### 2) Backend
- Copy `backend/.env.example` to `backend/.env` and update values.
- Start the server:
  - `npm install`
  - `npm run dev` (or `npm start`)

### 3) Frontend (Public)
- Copy `frontend/.env.example` to `frontend/.env.local`.
- Start:
  - `npm install`
  - `npm run dev`

### 4) Admin App
- Use `admin-app/.env.local` if needed.
- Start:
  - `npm install`
  - `npm run dev`

## Environment Variables
### Frontend
- `VITE_API_BASE_URL` (preferred)
- `VITE_API_URL` (fallback)

### Backend
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`, `PORT`, `HOST`, `NODE_ENV`
- `EMAIL_USER`, `EMAIL_PASS` (optional)

## Deployment
### Frontend (Vercel)
- Build command: `npm run build`
- Output: `dist`
- Set `VITE_API_BASE_URL` to the backend URL.

### Backend (Render/Railway)
- Start command: `npm start`
- Set environment variables from `backend/.env.example`.

## QA Checklist
- Admin creates event and sessions
- Public site shows event list and session list
- Registration confirms or waitlists based on capacity
- QR code visible for confirmed registration
- Admin cancellation promotes waitlist to confirmed
