import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Header } from '../../components/common/Header';
import { Sidebar } from '../../components/common/Sidebar';
import { getAttendanceDay, getAttendanceRecordsForDate, updateAttendanceDay } from '../../services/attendanceService';
import { formatReadableDate } from '../../utils/dateUtils';
import { calculateAttendancePercentage, formatAttendancePercentage } from '../../utils/attendanceUtils';
import { getTeamName } from '../../types/team';
import type { AttendanceDay, AttendanceRecord, AttendanceStatus } from '../../types/attendance';
import { Edit3, Save, ArrowLeft, AlertCircle, Search, Filter } from 'lucide-react';

export const EditAttendancePage: React.FC = () => {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [attendanceDay, setAttendanceDay] = useState<AttendanceDay | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [statusMap, setStatusMap] = useState<Record<string, AttendanceStatus>>({});

  const [searchQuery, setSearchQuery] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date) return;
    const loadDayData = async () => {
      setLoading(true);
      try {
        const day = await getAttendanceDay(date);
        setAttendanceDay(day);

        const recs = await getAttendanceRecordsForDate(date);
        setRecords(recs);

        const map: Record<string, AttendanceStatus> = {};
        recs.forEach((r) => {
          map[r.memberUid] = r.status;
        });
        setStatusMap(map);
      } catch (err: any) {
        setError('Failed to load attendance record for date.');
      } finally {
        setLoading(false);
      }
    };

    loadDayData();
  }, [date]);

  if (!user || !date) return null;

  const handleStatusChange = (memberUid: string, newStatus: AttendanceStatus) => {
    setStatusMap((prev) => ({ ...prev, [memberUid]: newStatus }));
  };

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTeam = teamFilter === 'all' || r.teamId === teamFilter;
    return matchesSearch && matchesTeam;
  });

  const totalCount = records.length;
  const presentCount = Object.values(statusMap).filter((s) => s === 'present').length;
  const absentCount = Object.values(statusMap).filter((s) => s === 'absent').length;
  const livePercentage = calculateAttendancePercentage(presentCount, totalCount);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const now = new Date().toISOString();
    const updatedRecords: AttendanceRecord[] = records.map((r) => ({
      ...r,
      status: statusMap[r.memberUid] || 'absent',
      updatedAt: now,
    }));

    setSaving(true);
    try {
      await updateAttendanceDay(date, updatedRecords);
      navigate('/faculty/attendance');
    } catch (err: any) {
      setError(err?.message || 'Failed to update attendance records.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 lg:p-8 space-y-6 overflow-x-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/faculty/attendance')}
                className="p-2 bg-[#111111] hover:bg-[#181818] border border-[#262626] rounded-lg text-zinc-300"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-xl font-bold font-mono text-white tracking-tight flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-blue-500" />
                  Edit Attendance for {formatReadableDate(date)}
                </h1>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  Update statuses and recalculate summary counts for session {date}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg flex items-center gap-2 text-xs text-red-200 font-mono">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Live Metrics Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-[#111111] p-3 rounded-xl border border-[#262626]">
              <span className="text-[10px] text-zinc-400 block uppercase">Total Members</span>
              <span className="text-lg font-bold text-white mt-0.5 block">{totalCount}</span>
            </div>
            <div className="bg-[#111111] p-3 rounded-xl border border-[#262626]">
              <span className="text-[10px] text-zinc-400 block uppercase">Updated Present</span>
              <span className="text-lg font-bold text-green-400 mt-0.5 block">{presentCount}</span>
            </div>
            <div className="bg-[#111111] p-3 rounded-xl border border-[#262626]">
              <span className="text-[10px] text-zinc-400 block uppercase">Updated Absent</span>
              <span className="text-lg font-bold text-red-400 mt-0.5 block">{absentCount}</span>
            </div>
            <div className="bg-[#111111] p-3 rounded-xl border border-[#262626]">
              <span className="text-[10px] text-zinc-400 block uppercase">Updated Rate</span>
              <span className="text-lg font-bold text-blue-400 mt-0.5 block">
                {formatAttendancePercentage(livePercentage)}
              </span>
            </div>
          </div>

          {/* Search & Team Filter Bar */}
          <div className="bg-[#111111] border border-[#262626] rounded-xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or roll..."
                className="w-full bg-[#181818] border border-[#262626] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-zinc-400" />
              <select
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                className="bg-[#181818] border border-[#262626] rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none"
              >
                <option value="all">All Teams</option>
                <option value="vibe-coding">Vibe Coding</option>
                <option value="ai">AI</option>
                <option value="marketing">Marketing</option>
                <option value="industry-connect">Industry Connect</option>
              </select>
            </div>
          </div>

          {/* Edit Table */}
          <div className="bg-[#111111] border border-[#262626] rounded-xl overflow-hidden shadow-xl">
            {loading ? (
              <div className="p-12 text-center text-xs font-mono text-zinc-400">Loading session records...</div>
            ) : filteredRecords.length === 0 ? (
              <div className="p-12 text-center text-xs font-mono text-zinc-500">
                No member records match the filter.
              </div>
            ) : (
              <form onSubmit={handleSave}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0c0c0c] text-zinc-400 uppercase text-[10px] font-mono border-b border-[#262626]">
                      <tr>
                        <th className="px-4 py-3">Member Name</th>
                        <th className="px-4 py-3">Roll Number</th>
                        <th className="px-4 py-3">Team Snapshot</th>
                        <th className="px-4 py-3 text-center">Status Toggle</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#262626]">
                      {filteredRecords.map((r) => {
                        const status = statusMap[r.memberUid] || 'absent';
                        return (
                          <tr key={r.memberUid} className="hover:bg-[#181818]/60 transition-colors">
                            <td className="px-4 py-3 font-mono font-medium text-white">
                              {r.memberName}
                            </td>
                            <td className="px-4 py-3 font-mono text-zinc-400">
                              {r.rollNumber}
                            </td>
                            <td className="px-4 py-3 font-mono text-zinc-300">
                              {getTeamName(r.teamId)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="inline-flex bg-[#181818] p-1 rounded-lg border border-[#262626]">
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(r.memberUid, 'present')}
                                  className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all ${
                                    status === 'present'
                                      ? 'bg-green-600 text-white shadow-sm'
                                      : 'text-zinc-400 hover:text-white'
                                  }`}
                                >
                                  PRESENT
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(r.memberUid, 'absent')}
                                  className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all ${
                                    status === 'absent'
                                      ? 'bg-red-600 text-white shadow-sm'
                                      : 'text-zinc-400 hover:text-white'
                                  }`}
                                >
                                  ABSENT
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-[#181818] border-t border-[#262626] flex items-center justify-between">
                  <span className="text-xs font-mono text-zinc-400">
                    Saving updates will recalculate all student summaries automatically.
                  </span>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-900/30"
                  >
                    {saving ? (
                      'Updating...'
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Updated Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
