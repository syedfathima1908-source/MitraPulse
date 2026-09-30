# MitraPulse

> VIT Mitra Daily Attendance Management Portal

MitraPulse is a web-based attendance management system designed for **VIT Mitra** to simplify daily attendance tracking, student attendance viewing, attendance correction requests, and faculty-side attendance management.

The system is built with **React, TypeScript, Vite, Tailwind CSS, Firebase Authentication, and Cloud Firestore**.

---

## 📌 Overview

MitraPulse replaces manual attendance tracking with a centralized digital platform.

The system supports two roles:

- **Student**
- **Faculty**

Students can securely log in, view their attendance records, and raise attendance correction requests.

Faculty members can manage members, mark daily attendance, edit attendance, review correction requests, and view attendance summaries.

Firebase acts as the backend platform, providing:

- Authentication
- Cloud Firestore database
- Security Rules
- Real-time data access

---

## ✨ Key Features

### 🔐 Authentication

- Firebase Email/Password Authentication
- Student and Faculty login
- Secure session persistence
- Forgot Password functionality
- Protected application routes
- Role-based access control
- No public signup or registration

---

### 👨‍🎓 Student Features

Students can:

- Login securely using their registered email
- View their attendance
- View day-wise attendance records
- View attendance by:
  - Day
  - Week
  - Month
- View present and absent records
- View attendance percentage
- Raise attendance correction requests
- Track correction request status
- Logout securely

Students cannot directly modify attendance records.

---

### 👩‍🏫 Faculty Features

Faculty members can:

- Login securely
- Access the faculty dashboard
- Mark daily attendance
- Mark attendance for all applicable members
- Edit attendance records
- View attendance records
- Filter members by team
- Search members
- Manage club members
- View attendance summaries
- Review attendance correction requests
- Approve correction requests
- Reject correction requests
- Logout securely

---

## 🏢 Club Teams

MitraPulse supports exactly four VIT Mitra teams:

| Team | Team ID |
|---|---|
| Vibe Coding | `vibe-coding` |
| AI | `ai` |
| Marketing | `marketing` |
| Industry Connect | `industry-connect` |

Teams are used for member organization and filtering.

They do **not** represent separate attendance sessions.

---

## 📊 Attendance System

MitraPulse follows a centralized daily attendance model.

There is:

> **One attendance record set per day for all applicable active members.**

Attendance statuses are:

```text
present
absent
