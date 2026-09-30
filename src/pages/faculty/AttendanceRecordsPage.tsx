import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Header } from '../../components/common/Header';
import { Sidebar } from '../../components/common/Sidebar';
import { getAllAttendanceDays, subscribeToAttendanceDays } from '../../services/attendanceService';
import { calculateAttendancePercentage, formatAttendancePercentage } from '../../utils/attendanceUtils';
import { formatReadableDate } from '../../utils/dateUtils';
import type { AttendanceDay } from '../../types/attendance';
import { FileText, Edit3, PlusCircle } from 'lucide-react';

export const AttendanceRecordsPage: React.FC = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [attendanceDays, setAttendanceDays] = useState<AttendanceDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllAttendanceDays().then((days) => {
      setAttendanceDays(days);
      setLoading(false);
    });

    const unsub = subscribeToAttendanceDays((days) => {
      setAttendanceDays(days);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 lg:p-8 space-y-6 overflow-x-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold font-mono text-white tracking-tight flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                Attendance Session Records History
              </h1>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                List of all recorded daily attendance sessions (Newest First)
              </p>
            </div>

            <Link
              to="/faculty/attendance/mark"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-semibold rounded-lg transition-colors flex items-center gap-2 shrink-0 shadow-lg shadow-blue-900/30"
            >
              <PlusCircle className="w-4 h-4" />
              Mark New Session
            </Link>
          </div>

          <div className="bg-[#111111] border border-[#262626] rounded-xl overflow-hidden shadow-xl">
            <div className="px-5 py-3.5 bg-[#181818] border-b border-[#262626] flex items-center justify-between">
              <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Recorded Attendance Sessions ({attendanceDays.length})
              </h3>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs font-mono text-zinc-400">Loading records...</div>
            ) : attendanceDays.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-zinc-500">
                No attendance sessions recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0c0c0c] text-zinc-400 uppercase text-[10px] font-mono border-b border-[#262626]">
                    <tr>
                      <th className="px-4 py-3">Attendance Date</th>
                      <th className="px-4 py-3">Total Active Members</th>
                      <th className="px-4 py-3">Present Count</th>
                      <th className="px-4 py-3">Absent Count</th>
                      <th className="px-4 py-3">Overall Rate</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262626]">
                    {attendanceDays.map((day) => {
                      const rate = calculateAttendancePercentage(day.presentCount, day.totalMembers);
                      return (
                        <tr key={day.date} className="hover:bg-[#181818]/60 transition-colors">
                          <td className="px-4 py-3 font-mono font-medium text-white">
                            {formatReadableDate(day.date)} ({day.date})
                          </td>
                          <td className="px-4 py-3 font-mono text-zinc-300">{day.totalMembers}</td>
                          <td className="px-4 py-3 font-mono text-green-400 font-semibold">{day.presentCount}</td>
                          <td className="px-4 py-3 font-mono text-red-400 font-semibold">{day.absentCount}</td>
                          <td className="px-4 py-3 font-mono text-blue-400 font-bold">
                            {formatAttendancePercentage(rate)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono">
                            <Link
                              to={`/faculty/attendance/edit/${day.date}`}
                              className="px-3 py-1 bg-[#181818] hover:bg-[#262626] border border-[#262626] text-blue-400 hover:text-blue-300 rounded text-xs transition-colors inline-flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3" /> Edit Session
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
        </main>
      </div>
    </div>
  );
};
