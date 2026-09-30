import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Header } from '../../components/common/Header';
import { Sidebar } from '../../components/common/Sidebar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { getMembers, subscribeToMembers } from '../../services/memberService';
import { getAllAttendanceDays, getAttendanceRecordsForDate, subscribeToAttendanceDays } from '../../services/attendanceService';
import { getAllRequests, subscribeToAllRequests } from '../../services/requestService';
import { calculateAttendancePercentage, formatAttendancePercentage } from '../../utils/attendanceUtils';
import { formatReadableDate, getTodayDateString } from '../../utils/dateUtils';
import type { TeamId } from '../../types/team';
import { PREDEFINED_TEAMS } from '../../types/team';
import type { Member } from '../../types/member';
import type { AttendanceDay, AttendanceRecord } from '../../types/attendance';
import type { AttendanceCorrectionRequest } from '../../types/request';
import { 
  Users, 
  Calendar, 
  CheckSquare, 
  GitPullRequest, 
  ArrowRight, 
  Edit3, 
  Clock, 
  PlusCircle, 
  Layers 
} from 'lucide-react';

export const FacultyDashboard: React.FC = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [members, setMembers] = useState<Member[]>([]);
  const [attendanceDays, setAttendanceDays] = useState<AttendanceDay[]>([]);
  const [requests, setRequests] = useState<AttendanceCorrectionRequest[]>([]);
  const [todayDay, setTodayDay] = useState<AttendanceDay | null>(null);

  const todayStr = getTodayDateString();

  const loadData = async () => {
    try {
      const mList = await getMembers();
      setMembers(mList);

      const days = await getAllAttendanceDays();
      setAttendanceDays(days);

      const foundToday = days.find((d) => d.date === todayStr);
      setTodayDay(foundToday || null);

      const reqs = await getAllRequests();
      setRequests(reqs);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    const unsubMembers = subscribeToMembers(setMembers);
    const unsubDays = subscribeToAttendanceDays((days) => {
      setAttendanceDays(days);
      const found = days.find((d) => d.date === todayStr);
      setTodayDay(found || null);
    });
    const unsubReqs = subscribeToAllRequests(setRequests);

    return () => {
      unsubMembers();
      unsubDays();
      unsubReqs();
    };
  }, []);

  if (!user) return null;

  const activeMembers = members.filter((m) => m.isActive);
  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const recentRecords = attendanceDays.slice(0, 5);

  // Calculate team metrics for the 4 predefined teams
  const teamMetrics: Record<TeamId, { memberCount: number; presentTotal: number; applicableTotal: number }> = {
    'vibe-coding': { memberCount: 0, presentTotal: 0, applicableTotal: 0 },
    'ai': { memberCount: 0, presentTotal: 0, applicableTotal: 0 },
    'marketing': { memberCount: 0, presentTotal: 0, applicableTotal: 0 },
    'industry-connect': { memberCount: 0, presentTotal: 0, applicableTotal: 0 },
  };

  activeMembers.forEach((m) => {
    if (teamMetrics[m.teamId]) {
      teamMetrics[m.teamId].memberCount++;
    }
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 lg:p-8 space-y-6 overflow-x-hidden">
          {/* Header Banner */}
          <div className="bg-[#111111] border border-[#262626] rounded-xl p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-blue-400 font-semibold uppercase tracking-wider">
                  Faculty Administration Portal
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Faculty Dashboard
              </h1>
              <p className="text-xs text-zinc-400 font-mono mt-1">
                Coordinator: <span className="text-zinc-200">{user.name}</span> • VIT Mitra Daily Operations
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {todayDay ? (
                <Link
                  to={`/faculty/attendance/edit/${todayStr}`}
                  className="px-4 py-2.5 bg-[#181818] hover:bg-[#262626] border border-[#262626] text-blue-400 text-xs font-mono font-semibold rounded-lg transition-colors flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Today's Attendance
                </Link>
              ) : (
                <Link
                  to="/faculty/attendance/mark"
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-blue-900/30"
                >
                  <PlusCircle className="w-4 h-4" />
                  Mark Today's Attendance
                </Link>
              )}
            </div>
          </div>

          {/* Four Primary Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#111111] border border-[#262626] rounded-xl p-5 shadow-lg flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                  Total Active Members
                </span>
                <span className="text-2xl font-bold font-mono text-white mt-1 block">
                  {activeMembers.length}
                </span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-950/60 border border-blue-800/60 flex items-center justify-center text-blue-400">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[#111111] border border-[#262626] rounded-xl p-5 shadow-lg flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                  Recorded Attendance Days
                </span>
                <span className="text-2xl font-bold font-mono text-white mt-1 block">
                  {attendanceDays.length}
                </span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-950/60 border border-purple-800/60 flex items-center justify-center text-purple-400">
                <Calendar className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[#111111] border border-[#262626] rounded-xl p-5 shadow-lg flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                  Today's Session Status
                </span>
                <span className="text-sm font-bold font-mono text-white mt-1.5 block">
                  {todayDay ? (
                    <StatusBadge status="present" label={`MARKED (${formatAttendancePercentage(calculateAttendancePercentage(todayDay.presentCount, todayDay.totalMembers))})`} />
                  ) : (
                    <StatusBadge status="pending" label="NOT MARKED YET" />
                  )}
                </span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-950/60 border border-green-800/60 flex items-center justify-center text-green-400">
                <CheckSquare className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[#111111] border border-[#262626] rounded-xl p-5 shadow-lg flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                  Pending Correction Requests
                </span>
                <span className="text-2xl font-bold font-mono text-amber-400 mt-1 block">
                  {pendingRequests.length}
                </span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400">
                <GitPullRequest className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Team Overview Grid (Strictly all 4 teams) */}
          <div className="space-y-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-500" />
              Team Overview Breakdown (4 Predefined Teams)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PREDEFINED_TEAMS.map((team) => {
                const metrics = teamMetrics[team.id];
                return (
                  <div
                    key={team.id}
                    className="bg-[#111111] border border-[#262626] rounded-xl p-4 shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white font-mono">{team.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-[#181818] border border-[#262626] rounded text-zinc-400">
                          {metrics.memberCount} Members
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 font-mono mt-1 line-clamp-1">
                        {team.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#262626] flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-400 text-[11px]">Reporting filter</span>
                      <Link
                        to={`/faculty/team-attendance?team=${team.id}`}
                        className="text-blue-400 hover:text-blue-300 text-[11px] flex items-center gap-1"
                      >
                        View Team &rarr;
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Two-Column Lower Content Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Attendance Records (2 cols) */}
            <div className="lg:col-span-2 bg-[#111111] border border-[#262626] rounded-xl overflow-hidden shadow-xl">
              <div className="px-5 py-3.5 bg-[#181818] border-b border-[#262626] flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  Recent Daily Attendance Log
                </h3>
                <Link
                  to="/faculty/attendance"
                  className="text-[11px] font-mono text-blue-400 hover:text-blue-300 transition-colors"
                >
                  View All Records &rarr;
                </Link>
              </div>

              {recentRecords.length === 0 ? (
                <div className="p-8 text-center text-xs font-mono text-zinc-500">
                  No attendance records exist yet. Click "Mark Today's Attendance" to start.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0c0c0c] text-zinc-400 uppercase text-[10px] font-mono border-b border-[#262626]">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Total Active</th>
                        <th className="px-4 py-3">Present</th>
                        <th className="px-4 py-3">Absent</th>
                        <th className="px-4 py-3">Rate</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#262626]">
                      {recentRecords.map((day) => {
                        const pct = calculateAttendancePercentage(day.presentCount, day.totalMembers);
                        return (
                          <tr key={day.date} className="hover:bg-[#181818]/60 transition-colors">
                            <td className="px-4 py-3 font-mono font-medium text-white">
                              {formatReadableDate(day.date)}
                            </td>
                            <td className="px-4 py-3 font-mono text-zinc-300">{day.totalMembers}</td>
                            <td className="px-4 py-3 font-mono text-green-400 font-semibold">{day.presentCount}</td>
                            <td className="px-4 py-3 font-mono text-red-400 font-semibold">{day.absentCount}</td>
                            <td className="px-4 py-3 font-mono text-blue-400 font-bold">
                              {formatAttendancePercentage(pct)}
                            </td>
                            <td className="px-4 py-3 text-right font-mono">
                              <Link
                                to={`/faculty/attendance/edit/${day.date}`}
                                className="px-2.5 py-1 bg-[#181818] hover:bg-[#262626] border border-[#262626] text-zinc-300 hover:text-white rounded text-[11px] transition-colors"
                              >
                                Edit
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pending Requests Preview (1 col) */}
            <div className="bg-[#111111] border border-[#262626] rounded-xl overflow-hidden shadow-xl flex flex-col justify-between">
              <div>
                <div className="px-5 py-3.5 bg-[#181818] border-b border-[#262626] flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <GitPullRequest className="w-4 h-4 text-amber-500" />
                    Pending Requests ({pendingRequests.length})
                  </h3>
                </div>

                {pendingRequests.length === 0 ? (
                  <div className="p-6 text-center text-xs font-mono text-zinc-500">
                    No pending attendance correction requests.
                  </div>
                ) : (
                  <div className="divide-y divide-[#262626] max-h-80 overflow-y-auto">
                    {pendingRequests.slice(0, 4).map((req) => (
                      <div key={req.id} className="p-3.5 space-y-1.5 hover:bg-[#181818]/40 transition-colors">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="font-bold text-white">{req.studentName}</span>
                          <span className="text-zinc-400 text-[10px]">{formatReadableDate(req.attendanceDate)}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 font-mono line-clamp-2">
                          "{req.reason}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-[#262626]">
                <Link
                  to="/faculty/attendance-requests"
                  className="block text-center w-full py-2 bg-amber-600 hover:bg-amber-500 text-black font-mono font-semibold text-xs rounded-lg transition-colors shadow-md"
                >
                  Review Pending Requests ({pendingRequests.length})
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
