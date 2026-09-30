import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Header } from '../../components/common/Header';
import { Sidebar } from '../../components/common/Sidebar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { getAllAttendanceDays, getAttendanceRecordsForMemberMap } from '../../services/attendanceService';
import { getRequestsForStudent } from '../../services/requestService';
import { calculateStudentAttendanceSummary, formatAttendancePercentage } from '../../utils/attendanceUtils';
import { formatReadableDate } from '../../utils/dateUtils';
import { getTeamName } from '../../types/team';
import type { AttendanceDay, AttendanceRecord } from '../../types/attendance';
import type { AttendanceCorrectionRequest } from '../../types/request';
import type { Member } from '../../types/member';
import { CheckSquare, Calendar, ArrowRight, UserCheck, UserX, Clock, Shield } from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [attendanceDays, setAttendanceDays] = useState<AttendanceDay[]>([]);
  const [recordsMap, setRecordsMap] = useState<Record<string, AttendanceRecord>>({});
  const [requests, setRequests] = useState<AttendanceCorrectionRequest[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        const days = await getAllAttendanceDays();
        setAttendanceDays(days);

        const recs = await getAttendanceRecordsForMemberMap(user.uid);
        setRecordsMap(recs);

        const reqs = await getRequestsForStudent(user.uid);
        setRequests(reqs);
      } catch {
        // error handled
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (!user) return null;

  const currentMember: Member = {
    uid: user.uid,
    name: user.name,
    email: user.email,
    rollNumber: user.rollNumber || 'N/A',
    teamId: (user.teamId as any) || 'vibe-coding',
    isActive: true,
    joinedAt: user.createdAt?.substring(0, 10) || '2026-01-15',
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  const summary = calculateStudentAttendanceSummary(currentMember, attendanceDays, recordsMap);
  const recentDays = attendanceDays.slice(0, 5);
  const pendingRequests = requests.filter((r) => r.status === 'pending');

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 lg:p-8 space-y-6 overflow-x-hidden">
          {/* Welcome Banner Card */}
          <div className="bg-[#111111] border border-[#262626] rounded-xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-blue-400 font-semibold uppercase tracking-wider">
                    Student Dashboard
                  </span>
                  <span className="px-2 py-0.5 bg-blue-950/80 text-blue-400 border border-blue-800/80 rounded font-mono text-[10px]">
                    {getTeamName(user.teamId)}
                  </span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Welcome back, {user.name}
                </h1>
                <p className="text-xs text-zinc-400 font-mono mt-1">
                  Roll Number: <span className="text-zinc-200">{user.rollNumber || 'N/A'}</span> • VIT Mitra Member
                </p>
              </div>

              <Link
                to="/student/attendance"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-semibold rounded-lg transition-colors shadow-lg shadow-blue-900/30 shrink-0"
              >
                <span>View Full Attendance</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Overall Attendance Metrics Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#111111] border border-[#262626] rounded-xl p-5 shadow-lg flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                  Overall Attendance Rate
                </span>
                <span className="text-2xl font-bold font-mono text-blue-400 mt-1 block">
                  {formatAttendancePercentage(summary.attendancePercentage)}
                </span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-950/60 border border-blue-800/60 flex items-center justify-center text-blue-400">
                <CheckSquare className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[#111111] border border-[#262626] rounded-xl p-5 shadow-lg flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                  Present Days
                </span>
                <span className="text-2xl font-bold font-mono text-green-400 mt-1 block">
                  {summary.presentDays}
                </span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-950/60 border border-green-800/60 flex items-center justify-center text-green-400">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[#111111] border border-[#262626] rounded-xl p-5 shadow-lg flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                  Absent Days
                </span>
                <span className="text-2xl font-bold font-mono text-red-400 mt-1 block">
                  {summary.absentDays}
                </span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-950/60 border border-red-800/60 flex items-center justify-center text-red-400">
                <UserX className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[#111111] border border-[#262626] rounded-xl p-5 shadow-lg flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                  Total Applicable Days
                </span>
                <span className="text-2xl font-bold font-mono text-zinc-200 mt-1 block">
                  {summary.applicableDays}
                </span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-400">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Dashboard Two-Column Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Attendance Preview (2 cols) */}
            <div className="lg:col-span-2 bg-[#111111] border border-[#262626] rounded-xl overflow-hidden shadow-xl">
              <div className="px-5 py-3.5 bg-[#181818] border-b border-[#262626] flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  Recent Attendance Entries
                </h3>
                <Link
                  to="/student/attendance"
                  className="text-[11px] font-mono text-blue-400 hover:text-blue-300 transition-colors"
                >
                  View All &rarr;
                </Link>
              </div>

              {loading ? (
                <div className="p-8 text-center text-xs font-mono text-zinc-400">Loading records...</div>
              ) : recentDays.length === 0 ? (
                <div className="p-8 text-center text-xs font-mono text-zinc-500">
                  No attendance session records published yet.
                </div>
              ) : (
                <div className="divide-y divide-[#262626]">
                  {recentDays.map((day) => {
                    const record = recordsMap[day.date];
                    const status = record?.status || 'absent';

                    return (
                      <div
                        key={day.date}
                        className="px-5 py-3 flex items-center justify-between hover:bg-[#181818]/50 transition-colors"
                      >
                        <div>
                          <span className="text-xs font-mono font-medium text-white block">
                            {formatReadableDate(day.date)}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500">
                            Session Date: {day.date}
                          </span>
                        </div>

                        <StatusBadge status={status} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Correction Requests Widget (1 col) */}
            <div className="bg-[#111111] border border-[#262626] rounded-xl overflow-hidden shadow-xl">
              <div className="px-5 py-3.5 bg-[#181818] border-b border-[#262626] flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-500" />
                  My Requests ({requests.length})
                </h3>
                <Link
                  to="/student/requests"
                  className="text-[11px] font-mono text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Manage &rarr;
                </Link>
              </div>

              <div className="p-4 space-y-3">
                {pendingRequests.length > 0 ? (
                  <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-lg text-xs font-mono text-amber-200">
                    You have <span className="font-bold text-amber-400">{pendingRequests.length}</span> pending correction request(s) under faculty review.
                  </div>
                ) : (
                  <p className="text-xs font-mono text-zinc-400">
                    No pending correction requests. If you miss a session, you can raise a request from eligible absent dates.
                  </p>
                )}

                <Link
                  to="/student/requests"
                  className="block text-center w-full py-2 bg-[#181818] hover:bg-[#262626] border border-[#262626] rounded-lg text-xs font-mono font-semibold text-zinc-300 transition-colors mt-2"
                >
                  View Request History
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
