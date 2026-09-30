import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';

// Student Pages
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { StudentAttendancePage } from '../pages/student/StudentAttendancePage';
import { StudentRequestsPage } from '../pages/student/StudentRequestsPage';
import { StudentProfilePage } from '../pages/student/StudentProfilePage';

// Faculty Pages
import { FacultyDashboard } from '../pages/faculty/FacultyDashboard';
import { MarkAttendancePage } from '../pages/faculty/MarkAttendancePage';
import { EditAttendancePage } from '../pages/faculty/EditAttendancePage';
import { AttendanceRecordsPage } from '../pages/faculty/AttendanceRecordsPage';
import { AttendanceRequestsPage } from '../pages/faculty/AttendanceRequestsPage';
import { TeamAttendancePage } from '../pages/faculty/TeamAttendancePage';
import { MembersPage } from '../pages/faculty/MembersPage';
import { AttendanceSummaryPage } from '../pages/faculty/AttendanceSummaryPage';
import { FacultyProfilePage } from '../pages/faculty/FacultyProfilePage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Generic Dashboard Redirect */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Navigate to="/student/dashboard" replace />
          </ProtectedRoute>
        }
      />

      {/* Protected Student Routes */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/attendance"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentAttendancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/requests"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentRequestsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/profile"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Protected Faculty Routes */}
      <Route
        path="/faculty/dashboard"
        element={
          <ProtectedRoute allowedRole="faculty">
            <FacultyDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/attendance/mark"
        element={
          <ProtectedRoute allowedRole="faculty">
            <MarkAttendancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/attendance"
        element={
          <ProtectedRoute allowedRole="faculty">
            <AttendanceRecordsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/attendance/edit/:date"
        element={
          <ProtectedRoute allowedRole="faculty">
            <EditAttendancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/attendance-requests"
        element={
          <ProtectedRoute allowedRole="faculty">
            <AttendanceRequestsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/team-attendance"
        element={
          <ProtectedRoute allowedRole="faculty">
            <TeamAttendancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/members"
        element={
          <ProtectedRoute allowedRole="faculty">
            <MembersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/attendance-summary"
        element={
          <ProtectedRoute allowedRole="faculty">
            <AttendanceSummaryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/profile"
        element={
          <ProtectedRoute allowedRole="faculty">
            <FacultyProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Default Catch-all redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
