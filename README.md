# Student Management System

A full-stack CRUD application for managing student records.

- **Backend:** Django + Django REST Framework
- **Database:** SQLite
- **Frontend:** Plain HTML, CSS, JavaScript (`fetch`)
- **API testing:** Postman

## Features

- Add a student (CREATE)
- View all students, with live search by name / email / department (READ)
- Edit a student's details (UPDATE)
- Delete a student, with a confirmation dialog (DELETE)
- Client-side **and** server-side validation
- Success / error messages for every action

## Project structure

```
StudentManagementSystem
├── backend
│   ├── manage.py
│   ├── db.sqlite3          (created after migrate)
│   ├── backend/             settings, urls
│   └── students/            models, serializers, views, urls, admin
├── frontend
│   ├── index.html
│   ├── style.css
│   └── script.js
└── README.md
```

## 1. Backend setup

```bash
cd StudentManagementSystem
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux

pip install django djangorestframework django-cors-headers

cd backend
python manage.py migrate
python manage.py runserver
```

The API will be live at `http://127.0.0.1:8000/api/students/`.

(Optional) Create an admin user to browse data in Django admin:

```bash
python manage.py createsuperuser
```

## 2. Frontend setup

No build step needed. Just open `frontend/index.html` in a browser
(or serve it with VS Code's "Live Server" extension). It talks to the
API at `http://127.0.0.1:8000/api/students/` — edit the `API_BASE`
constant at the top of `script.js` if your backend runs elsewhere.

Keep the Django server (`python manage.py runserver`) running while
you use the frontend.

## API reference

| Operation      | Method | URL                          |
|----------------|--------|-------------------------------|
| List / search  | GET    | `/api/students/?search=term` |
| Create         | POST   | `/api/students/`             |
| Retrieve one   | GET    | `/api/students/<id>/`        |
| Update         | PUT    | `/api/students/<id>/`        |
| Delete         | DELETE | `/api/students/<id>/`        |

### Student fields

| Field       | Type    | Notes                                   |
|-------------|---------|------------------------------------------|
| id          | integer | auto-generated primary key               |
| name        | string  | required                                 |
| email       | string  | required, unique, valid email format     |
| phone       | string  | required, exactly 10 digits              |
| department  | string  | one of CSE, ECE, EEE, MECH, CIVIL, IT     |
| year        | integer | 1–5                                       |
| gender      | string  | Male / Female / Other                    |
| address     | string  | optional                                  |

### Example: create a student

```
POST /api/students/
Content-Type: application/json

{
  "name": "Supriya",
  "email": "supriya@gmail.com",
  "phone": "9876543210",
  "department": "CSE",
  "year": 2,
  "gender": "Female",
  "address": "Madurai"
}
```

Validation errors return `400` with a JSON object of field → message,
e.g. `{"phone": ["Phone number must be exactly 10 digits."]}`.

## Testing with Postman

Import the four requests above (GET, POST, PUT, DELETE) against
`http://127.0.0.1:8000/api/students/` to exercise full CRUD, exactly
as described in the project SOP.

## Pushing to GitHub

```bash
git init
git add .
git commit -m "Student Management System completed"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

`.gitignore` already excludes `venv/`, `__pycache__/`, `.env`, and
`db.sqlite3` so no secrets or build artifacts get committed.
