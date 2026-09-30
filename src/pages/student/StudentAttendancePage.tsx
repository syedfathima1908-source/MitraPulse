import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Header } from '../../components/common/Header';
import { Sidebar } from '../../components/common/Sidebar';
import { DayWiseView } from '../../components/student/DayWiseView';
import { WeekWiseView } from '../../components/student/WeekWiseView';
import { MonthWiseView } from '../../components/student/MonthWiseView';
import { RaiseRequestModal } from '../../components/student/RaiseRequestModal';
import { getAllAttendanceDays, getAttendanceRecordsForMemberMap, subscribeToAttendanceDays } from '../../services/attendanceService';
import { getRequestsForStudent, subscribeToStudentRequests } from '../../services/requestService';
import { calculateStudentAttendanceSummary, formatAttendancePercentage } from '../../utils/attendanceUtils';
import type { AttendanceDay, AttendanceRecord } from '../../types/attendance';
import type { AttendanceCorrectionRequest } from '../../types/request';
import type { Member } from '../../types/member';
import { CheckSquare, Calendar, Layers, Clock } from 'lucide-react';

type ViewTab = 'day' | 'week' | 'month';

export const StudentAttendancePage: React.FC = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ViewTab>('day');

  const [attendanceDays, setAttendanceDays] = useState<AttendanceDay[]>([]);
  const [recordsMap, setRecordsMap] = useState<Record<string, AttendanceRecord>>({});
  const [requests, setRequests] = useState<AttendanceCorrectionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // State for Raise Request Modal
  const [raiseModalDate, setRaiseModalDate] = useState<string | null>(null);

  const refreshData = async () => {
    if (!user) return;
    try {
      const days = await getAllAttendanceDays();
      setAttendanceDays(days);

      const recs = await getAttendanceRecordsForMemberMap(user.uid);
      setRecordsMap(recs);

      const reqs = await getRequestsForStudent(user.uid);
      setRequests(reqs);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    refreshData();

    if (!user) return;

    // Realtime listeners
    const unsubDays = subscribeToAttendanceDays((days) => {
      setAttendanceDays(days);
      getAttendanceRecordsForMemberMap(user.uid).then(setRecordsMap);
    });

    const unsubReqs = subscribeToStudentRequests(user.uid, (reqs) => {
      setRequests(reqs);
    });

    return () => {
      unsubDays();
      unsubReqs();
    };
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

  // Map requests by date for O(1) lookup
  const requestsMap: Record<string, AttendanceCorrectionRequest> = {};
  requests.forEach((r) => {
    requestsMap[r.attendanceDate] = r;
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 lg:p-8 space-y-6 overflow-x-hidden">
          {/* Page Title Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold font-mono text-white tracking-tight">
                My Attendance History & Analytics
              </h1>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Centralized record tracking for {user.name} ({user.rollNumber})
              </p>
            </div>
          </div>

          {/* Overall Attendance Summary Strip */}
          <div className="bg-[#111111] border border-[#262626] rounded-xl p-4 shadow-xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="bg-[#181818] p-3 rounded-lg border border-[#262626]">
              <span className="text-[10px] text-zinc-400 block uppercase">Overall Rate</span>
              <span className="text-xl font-bold text-blue-400 mt-0.5 block">
                {formatAttendancePercentage(summary.attendancePercentage)}
              </span>
            </div>

            <div className="bg-[#181818] p-3 rounded-lg border border-[#262626]">
              <span className="text-[10px] text-zinc-400 block uppercase">Present Days</span>
              <span className="text-xl font-bold text-green-400 mt-0.5 block">
                {summary.presentDays}
              </span>
            </div>

            <div className="bg-[#181818] p-3 rounded-lg border border-[#262626]">
              <span className="text-[10px] text-zinc-400 block uppercase">Absent Days</span>
              <span className="text-xl font-bold text-red-400 mt-0.5 block">
                {summary.absentDays}
              </span>
            </div>

            <div className="bg-[#181818] p-3 rounded-lg border border-[#262626]">
              <span className="text-[10px] text-zinc-400 block uppercase">Total Applicable</span>
              <span className="text-xl font-bold text-zinc-200 mt-0.5 block">
                {summary.applicableDays}
              </span>
            </div>
          </div>

          {/* MUTUALLY EXCLUSIVE VIEW SELECTION TABS */}
          <div className="flex bg-[#111111] p-1 rounded-xl border border-[#262626] max-w-md">
            <button
              onClick={() => setActiveTab('day')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-mono font-semibold rounded-lg transition-all ${
                activeTab === 'day'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Day-wise
            </button>

            <button
              onClick={() => setActiveTab('week')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-mono font-semibold rounded-lg transition-all ${
                activeTab === 'week'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Week-wise
            </button>

            <button
              onClick={() => setActiveTab('month')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-mono font-semibold rounded-lg transition-all ${
                activeTab === 'month'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Month-wise
            </button>
          </div>

          {/* MUTUALLY EXCLUSIVE CONTENT RENDERING */}
          {loading ? (
            <div className="p-12 text-center text-xs font-mono text-zinc-400 bg-[#111111] rounded-xl border border-[#262626]">
              Loading attendance data...
            </div>
          ) : (
            <>
              {activeTab === 'day' && (
                <DayWiseView
                  attendanceDays={attendanceDays}
                  recordsMap={recordsMap}
                  requestsMap={requestsMap}
                  onOpenRaiseRequest={(d) => setRaiseModalDate(d)}
                  joinedAt={currentMember.joinedAt}
                />
              )}

              {activeTab === 'week' && (
                <WeekWiseView
                  attendanceDays={attendanceDays}
                  recordsMap={recordsMap}
                  requestsMap={requestsMap}
                  onOpenRaiseRequest={(d) => setRaiseModalDate(d)}
                  joinedAt={currentMember.joinedAt}
                />
              )}

              {activeTab === 'month' && (
                <MonthWiseView
                  attendanceDays={attendanceDays}
                  recordsMap={recordsMap}
                  requestsMap={requestsMap}
                  onOpenRaiseRequest={(d) => setRaiseModalDate(d)}
                  joinedAt={currentMember.joinedAt}
                />
              )}
            </>
          )}

          {/* Raise Request Modal Dialog */}
          {raiseModalDate && (
            <RaiseRequestModal
              dateStr={raiseModalDate}
              onClose={() => setRaiseModalDate(null)}
              onSuccess={refreshData}
            />
          )}
        </main>
      </div>
    </div>
  );
};
