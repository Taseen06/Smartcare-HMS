# 🏥 Smartcare HMS — Hospital Management System

A full-stack Hospital Management System built with React + Vite, Node.js/Express, MongoDB, and JWT authentication. Supports three roles: **Patient**, **Doctor**, and **Admin**.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm

### 1. Clone / Extract the project
```bash
cd smartcare-hms
```

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/smartcare_hms
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRE=7d
ADMIN_KEY=SMARTCARE_ADMIN_2024
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

```bash
npm install
npm run seed     # Seed database with sample data
npm run dev      # Start backend on port 5001
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev      # Start frontend on port 5173
```

Open **http://localhost:5173**

---

## 🔑 Default Credentials (after seeding)

| Role    | Email                   | Password    | Notes                    |
|---------|-------------------------|-------------|--------------------------|
| Admin   | admin@smartcare.com     | admin123    | Admin Key: `SMARTCARE_ADMIN_2024` |
| Doctor  | sarah@smartcare.com     | doctor123   | Cardiology               |
| Doctor  | rahim@smartcare.com     | doctor123   | Neurology                |
| Doctor  | fatima@smartcare.com    | doctor123   | Pediatrics               |
| Doctor  | arif@smartcare.com      | doctor123   | Orthopedics              |
| Patient | karim@gmail.com         | patient123  |                          |
| Patient | nasrin@gmail.com        | patient123  |                          |
| Patient | rafiq@gmail.com         | patient123  |                          |

---

## 📁 Project Structure

```
smartcare-hms/
├── backend/
│   ├── server.js
│   ├── .env.example
│   ├── package.json
│   ├── models/
│   │   ├── User.js          # Base model + Patient/Doctor/Admin discriminators
│   │   ├── Test.js
│   │   └── Appointment.js
│   ├── middleware/
│   │   └── auth.js          # JWT verify + RBAC
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── doctorController.js
│   │   ├── testController.js
│   │   ├── appointmentController.js
│   │   └── adminController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── doctors.js
│   │   ├── tests.js
│   │   ├── appointments.js
│   │   ├── slots.js
│   │   ├── admin.js
│   │   └── contact.js
│   └── utils/
│       └── seed.js
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── utils/
        │   └── api.js           # Axios instance with JWT interceptor
        ├── context/
        │   └── AuthContext.jsx  # Auth state management
        ├── components/
        │   ├── layout/
        │   │   └── Navbar.jsx
        │   └── common/
        │       └── BookingModal.jsx
        └── pages/
            ├── Home.jsx
            ├── Doctors.jsx
            ├── Tests.jsx
            ├── Contact.jsx
            ├── auth/
            │   └── AuthPage.jsx
            ├── patient/
            │   └── Dashboard.jsx
            ├── doctor/
            │   └── Dashboard.jsx
            └── admin/
                └── Dashboard.jsx
```

---

## 🌐 API Reference

### Auth
| Method | Endpoint                    | Auth   | Description               |
|--------|-----------------------------|--------|---------------------------|
| POST   | `/api/auth/register/:role`  | Public | Register (patient/doctor/admin) |
| POST   | `/api/auth/login`           | Public | Login                     |
| GET    | `/api/auth/me`              | JWT    | Get current user          |
| PUT    | `/api/auth/profile`         | JWT    | Update profile            |

### Doctors (Public)
| Method | Endpoint                 | Auth         | Description          |
|--------|--------------------------|--------------|----------------------|
| GET    | `/api/doctors`           | Public       | List all doctors     |
| GET    | `/api/doctors/:id`       | Public       | Get doctor by ID     |
| PUT    | `/api/doctors/:id`       | Doctor only  | Update profile       |

### Tests
| Method | Endpoint           | Auth        | Description        |
|--------|--------------------|-------------|---------------------|
| GET    | `/api/tests`       | Public      | List all tests      |
| GET    | `/api/tests/:id`   | Public      | Get test by ID      |
| POST   | `/api/tests`       | Admin only  | Create test         |
| PUT    | `/api/tests/:id`   | Admin only  | Update test         |
| DELETE | `/api/tests/:id`   | Admin only  | Deactivate test     |

### Appointments
| Method | Endpoint                              | Auth          | Description              |
|--------|---------------------------------------|---------------|--------------------------|
| POST   | `/api/appointments/doctor`            | Patient only  | Book doctor appointment  |
| POST   | `/api/appointments/test`              | Patient only  | Book test appointment    |
| GET    | `/api/appointments/patient`           | Patient only  | Patient's appointments   |
| GET    | `/api/appointments/doctor`            | Doctor only   | Doctor's appointments    |
| GET    | `/api/appointments/test/:testId`      | Admin only    | Test appointments        |
| PUT    | `/api/appointments/:id/status`        | JWT           | Update status            |
| DELETE | `/api/appointments/:id`               | JWT           | Cancel appointment       |
| GET    | `/api/appointments/available-slots`   | Public        | Get available time slots |

**Available slots query params:** `?date=2024-12-20&type=doctor&id=DOCTOR_ID`

### Admin
| Method | Endpoint                             | Auth       | Description               |
|--------|--------------------------------------|------------|---------------------------|
| GET    | `/api/admin/stats`                   | Admin only | Dashboard stats           |
| GET    | `/api/admin/doctors`                 | Admin only | All doctors               |
| PUT    | `/api/admin/doctors/:id/verify`      | Admin only | Verify/unverify doctor    |
| DELETE | `/api/admin/doctors/:id`             | Admin only | Remove doctor             |
| GET    | `/api/admin/tests`                   | Admin only | All tests with counts     |
| GET    | `/api/admin/tests/:testId/requests`  | Admin only | Appointments for a test   |
| PUT    | `/api/admin/appointments/:id`        | Admin only | Update any appointment    |

---

## 🏗️ Key Features

### Booking Rules
- **Slots**: Every 15 minutes, 8:00 AM – 10:00 PM
- **Working days**: Saturday – Thursday (Friday is off)
- **Double booking**: Prevented — each slot handles one patient
- **Daily limit**: One booking per patient per doctor/test per day

### Role-Based Access
- **Patient**: Book appointments, view/cancel their own appointments, manage profile
- **Doctor**: View & manage their appointments (confirm/reject/complete), update profile
- **Admin**: Full control over tests, test bookings, doctor management, stats

### Security
- Passwords hashed with bcrypt (salt rounds: 12)
- JWT tokens expire in 7 days
- Rate limiting: 100 requests per 15 minutes per IP
- CORS restricted to frontend origin
- Helmet.js security headers

---

## 🚢 Deployment

### Backend (e.g. Railway / Render)
1. Set environment variables from `.env.example`
2. Set `MONGODB_URI` to your MongoDB Atlas URI
3. Set `CLIENT_URL` to your deployed frontend URL
4. Deploy the `backend/` folder

### Frontend (e.g. Vercel / Netlify)
1. Update `vite.config.js` proxy OR set `VITE_API_URL` env variable
2. In `src/utils/api.js`, change `baseURL` to your backend URL for production
3. Deploy the `frontend/` folder

### MongoDB Atlas
1. Create free cluster at mongodb.com/atlas
2. Whitelist all IPs (`0.0.0.0/0`) for cloud deployment
3. Copy connection string to `MONGODB_URI`

---

## 📧 Email Notifications (Optional)

Install nodemailer and configure in `.env`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
```

Then add email sending in `appointmentController.js` after creating appointments.

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| `MongoServerError: connect ECONNREFUSED` | Start MongoDB locally or use Atlas URI |
| `Invalid admin key` | Check `ADMIN_KEY` in `.env` matches what you enter in signup |
| CORS errors | Ensure `CLIENT_URL` in backend `.env` matches your frontend port |
| Slots not loading | Make sure you're passing `date`, `type`, and `id` as query params |
| 401 on dashboard | Token may have expired — log out and log in again |

---

## 📄 License
MIT © Smartcare HMS
# Smartcare-HMS
