# Task Manager — Full Stack Application

A scalable REST API with JWT authentication, role-based access control, and a React frontend.

Built with **Django REST Framework** (backend) and **React + Vite** (frontend).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, Django 4.2, Django REST Framework |
| Auth | JWT (djangorestframework-simplejwt) |
| Database | PostgreSQL |
| API Docs | drf-spectacular (Swagger UI) |
| Frontend | React.js + Vite |
| HTTP Client | Axios |

---

## Project Structure

```
task-api-project/
├── backend/
│   ├── apps/
│   │   ├── users/        # Auth, JWT, roles
│   │   ├── tasks/        # CRUD entity
│   │   └── utils/        # Shared helpers
│   ├── config/           # Django settings, URLs
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── api/          # Axios instance
│       ├── pages/        # Login, Register, Dashboard
│       └── components/   # Navbar, TaskForm
└── SCALABILITY_NOTE.md
```

---

## Backend Setup

### Prerequisites
- Python 3.10+
- PostgreSQL

### Steps

```bash
# 1. Navigate to backend
cd backend

# 2. Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create .env file
cp .env.example .env
# Fill in your values in .env
```

### .env file
```
SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=taskdb
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

```bash
# 5. Run migrations
python manage.py migrate

# 6. Create superuser (admin)
python manage.py createsuperuser

# 7. Start server
python manage.py runserver
```

Backend runs at: `http://127.0.0.1:8000`
Swagger docs at: `http://127.0.0.1:8000/api/docs/`

---

## Frontend Setup

### Prerequisites
- Node.js 18+

### Steps

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## API Endpoints

### Auth — `/api/v1/auth/`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register/` | Register new user | No |
| POST | `/login/` | Login and get JWT tokens | No |
| POST | `/token/refresh/` | Refresh access token | No |
| GET | `/profile/` | Get logged-in user profile | Yes |

### Tasks — `/api/v1/tasks/`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | List tasks (own / all for admin) | Yes |
| POST | `/` | Create new task | Yes |
| GET | `/<id>/` | Get task detail | Yes (owner/admin) |
| PUT | `/<id>/` | Update task | Yes (owner/admin) |
| DELETE | `/<id>/` | Delete task | Yes (admin only) |

---

## Roles

| Role | Permissions |
|------|-------------|
| `user` | Create, view, edit own tasks |
| `admin` | Full access — view all tasks, delete any task |

---

## Test Credentials

Create a superuser via:
```bash
python manage.py createsuperuser
```
This user will have `admin` role by default.

---

## Requirements

```
Django>=4.2
djangorestframework
djangorestframework-simplejwt
drf-spectacular
django-cors-headers
psycopg2-binary
python-decouple
```