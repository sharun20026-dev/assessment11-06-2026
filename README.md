# To-Do List App — MERN Stack

A mobile-first To-Do app with weekly task grouping, priorities, and search.

## Stack
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB + Mongoose

## Quick Start

### Backend
```bash
cd backend
cp .env.example .env        # set your MONGO_URI
npm install
npm run dev                 # runs on :5000
```

### Frontend
```bash
cd client
npm install
npm run dev                 # runs on :3000, proxies /api → :5000
```

## Project Structure

```
├── client/                 # React frontend
│   └── src/
│       ├── api/            # Axios API calls
│       ├── components/     # Reusable UI components
│       └── pages/          # Route-level screens
│
└── backend/                # Express backend
    └── src/
        ├── config/         # DB connection
        ├── controllers/    # Route handlers
        ├── middleware/      # Error handler
        ├── models/         # Mongoose schemas
        └── routes/         # Express routers
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tasks/weekly | All tasks grouped by week |
| GET | /api/tasks/week/:weekId | Tasks for a specific week |
| GET | /api/tasks/search?q= | Search tasks |
| GET | /api/tasks/:id | Get single task |
| POST | /api/tasks | Create task |
| PUT | /api/tasks/:id | Update task |
| PATCH | /api/tasks/:id/status | Update status only |
| DELETE | /api/tasks/:id | Delete task |
