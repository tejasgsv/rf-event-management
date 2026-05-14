# Local Setup Guide - RF Event Management

## Prerequisites
- **Node.js** v16+ (download from https://nodejs.org/)
- **MySQL** v5.7+ (download from https://www.mysql.com/downloads/mysql/)
- **Git** (optional, for version control)

## Step 1: Set Up MySQL Database

### Option A: Using MySQL Workbench or Command Line
1. Start MySQL service (should auto-start on Windows)
2. Connect to MySQL:
   ```
   mysql -u root -p
   ```
   (Enter password when prompted, default is `root`)

3. Create the database:
   ```sql
   CREATE DATABASE rf_event_management;
   USE rf_event_management;
   ```

4. Import the schema. Choose one:
   - **Option 1**: Run SQL file
     ```
     source backend/database.sql;
     ```
   - **Option 2**: Run Node script (after installing backend dependencies)
     ```
     node backend/create-tables.js
     ```

### Verify Database
```
mysql -u root -p -e "USE rf_event_management; SHOW TABLES;"
```

## Step 2: Configure Environment Variables

### Backend (.env)
Create `backend/.env` (copy from `.env.example`):
```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=rf_event_management
PORT=5000
HOST=127.0.0.1
NODE_ENV=development
JWT_SECRET=rf-event-management-secret-key-2024
```

### Frontend (.env.local)
Create `frontend/.env.local`:
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_API_URL=http://localhost:5000/api
VITE_APP_TITLE=RF Event Management
VITE_ENVIRONMENT=development
```

### Admin App (.env.local)
Create `admin-app/.env.local`:
```
VITE_ADMIN_API_URL=http://localhost:5000/api/admin
VITE_APP_TITLE=RF Event Management - Admin
VITE_ENVIRONMENT=development
VITE_SESSION_TIMEOUT=1800000
```

## Step 3: Install Dependencies

Run from the project root:
```
npm run install-all
```

Or manually in each directory:
```
# Backend
cd backend && npm install && cd ..

# Frontend
cd frontend && npm install && cd ..

# Admin App
cd admin-app && npm install && cd ..
```

## Step 4: Run Development Servers

Open **3 separate terminals** and run:

### Terminal 1 - Backend
```
cd backend
npm run dev
# Runs on http://localhost:5000
```

### Terminal 2 - Frontend
```
cd frontend
npm run dev
# Runs on http://localhost:5173
```

### Terminal 3 - Admin App
```
cd admin-app
npm run dev
# Runs on http://localhost:5174
```

### OR: Run All at Once
From project root (requires `concurrently` package):
```
npm run start:all
```

## URLs
- **Frontend (Public)**: http://localhost:5173
- **Admin Panel**: http://localhost:5174
- **Backend API**: http://localhost:5000/api
- **Admin API**: http://localhost:5000/api/admin

## Troubleshooting

### MySQL Connection Error
- Ensure MySQL is running
- Check DB credentials in `backend/.env`
- Verify database exists: `SHOW DATABASES;`

### Port Already in Use
- Change port in `backend/.env` (e.g., `PORT=5001`)
- Update `VITE_API_BASE_URL` in frontend/admin `.env.local` to match

### Dependencies Won't Install
- Delete `node_modules` and `package-lock.json` in each folder
- Run `npm install` again with `--legacy-peer-deps` if needed

### API Not Responding
- Check backend terminal for errors
- Verify backend is running on correct port
- Check network/firewall settings

## Useful Commands

```bash
# From project root
npm run install-all    # Install all dependencies
npm run build:all      # Build frontend and admin
npm run frontend       # Run frontend only
npm run admin          # Run admin app only
npm run backend        # Run backend only (dev mode)
```

## Next Steps
1. Create admin user: `node backend/create-admin.js`
2. Seed sample data: `node backend/seed-mysql.js`
3. Access admin panel at http://localhost:5174
4. Start creating events!
