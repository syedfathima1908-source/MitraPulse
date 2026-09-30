import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Header } from '../../components/common/Header';
import { Sidebar } from '../../components/common/Sidebar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { getMembers } from '../../services/memberService';
import { saveAttendanceDay, getAttendanceDay } from '../../services/attendanceService';
import { getTodayDateString, formatReadableDate } from '../../utils/dateUtils';
import { calculateAttendancePercentage, formatAttendancePercentage } from '../../utils/attendanceUtils';
import { PREDEFINED_TEAMS, getTeamName } from '../../types/team';
import type { TeamId } from '../../types/team';
import type { Member } from '../../types/member';
import type { AttendanceStatus, AttendanceRecord } from '../../types/attendance';
import { CheckSquare, Search, Filter, Save, CheckCircle, AlertCircle } from 'lucide-react';

export const MarkAttendancePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [activeMembers, setActiveMembers] = useState<Member[]>([]);
  const [statusState, setStatusState] = useState<Record<string, AttendanceStatus>>({});

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('all');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState(false);

  useEffect(() => {
    const loadMembersAndCheckDate = async () => {
      setLoading(true);
      setError(null);
      setDuplicateWarning(false);

      try {
        const membersList = await getMembers();
        const activeOnly = membersList.filter((m) => m.isActive);
        setActiveMembers(activeOnly);

        // Initialize status map for active members (default to 'present')
        const initialMap: Record<string, AttendanceStatus> = {};
        activeOnly.forEach((m) => {
          initialMap[m.uid] = 'present';
        });
        setStatusState(initialMap);

        // Check if attendance for selectedDate already exists
        const existingDay = await getAttendanceDay(selectedDate);
        if (existingDay) {
          setDuplicateWarning(true);
        }
      } catch (err: any) {
        setError('Failed to load active members list.');
      } finally {
        setLoading(false);
      }
    };

    loadMembersAndCheckDate();
  }, [selectedDate]);

  if (!user) return null;

  const handleStatusChange = (memberUid: string, newStatus: AttendanceStatus) => {
    setStatusState((prev) => ({ ...prev, [memberUid]: newStatus }));
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, AttendanceStatus> = {};
    activeMembers.forEach((m) => {
      updated[m.uid] = 'present';
    });
    setStatusState(updated);
  };

  // Filter members by search and team
  const filteredMembers = activeMembers.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTeam = selectedTeamFilter === 'all' || m.teamId === selectedTeamFilter;
    return matchesSearch && matchesTeam;
  });

  // Calculate live metrics
  const totalCount = activeMembers.length;
  const presentCount = Object.values(statusState).filter((s) => s === 'present').length;
  const absentCount = Object.values(statusState).filter((s) => s === 'absent').length;
  const livePercentage = calculateAttendancePercentage(presentCount, totalCount);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (duplicateWarning) {
      setError(`Attendance for ${selectedDate} has already been saved. Please edit existing record.`);
      return;
    }

    if (Object.keys(statusState).length !== activeMembers.length) {
      setError('Please select Present or Absent for all active members before saving.');
      return;
    }

    const now = new Date().toISOString();
    const recordsToSave: AttendanceRecord[] = activeMembers.map((m) => ({
      memberUid: m.uid,
      memberName: m.name,
      rollNumber: m.rollNumber,
      teamId: m.teamId, // Historical snapshot at marking time
      status: statusState[m.uid] || 'absent',
      markedAt: now,
      updatedAt: now,
    }));

    setSaving(true);
    try {
      await saveAttendanceDay(selectedDate, user.uid, recordsToSave);
      navigate('/faculty/attendance');
    } catch (err: any) {
      setError(err?.message || 'Failed to save attendance record.');
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
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold font-mono text-white tracking-tight flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-blue-500" />
                Mark Daily Attendance
              </h1>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Record official daily attendance for all active VIT Mitra members together
              </p>
            </div>
          </div>

          {/* Controls Bar: Date Selector & Quick Actions */}
          <div className="bg-[#111111] border border-[#262626] rounded-xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="text-xs font-mono font-medium text-zinc-300 shrink-0">
                Attendance Date:
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-[#181818] border border-[#262626] rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
              />
              <span className="text-xs font-mono text-zinc-400 hidden md:inline">
                ({formatReadableDate(selectedDate)})
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleMarkAllPresent}
                className="px-3 py-1.5 bg-[#181818] hover:bg-[#262626] border border-[#262626] text-blue-400 rounded-lg text-xs font-mono font-semibold transition-colors flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Mark All Present
              </button>
            </div>
          </div>

          {/* Duplicate Date Warning Alert */}
          {duplicateWarning && (
            <div className="p-4 bg-amber-950/60 border border-amber-800 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-200 font-mono">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Attendance for date {selectedDate} has already been saved.</span>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/faculty/attendance/edit/${selectedDate}`)}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded text-xs transition-colors shrink-0"
              >
                Edit Saved Attendance &rarr;
              </button>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg flex items-center gap-2 text-xs text-red-200 font-mono">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Live Metrics Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-[#111111] p-3 rounded-xl border border-[#262626]">
              <span className="text-[10px] text-zinc-400 block uppercase">Total Active Members</span>
              <span className="text-lg font-bold text-white mt-0.5 block">{totalCount}</span>
            </div>
            <div className="bg-[#111111] p-3 rounded-xl border border-[#262626]">
              <span className="text-[10px] text-zinc-400 block uppercase">Live Present</span>
              <span className="text-lg font-bold text-green-400 mt-0.5 block">{presentCount}</span>
            </div>
            <div className="bg-[#111111] p-3 rounded-xl border border-[#262626]">
              <span className="text-[10px] text-zinc-400 block uppercase">Live Absent</span>
              <span className="text-lg font-bold text-red-400 mt-0.5 block">{absentCount}</span>
            </div>
            <div className="bg-[#111111] p-3 rounded-xl border border-[#262626]">
              <span className="text-[10px] text-zinc-400 block uppercase">Live Rate</span>
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
                placeholder="Search member by name or roll..."
                className="w-full bg-[#181818] border border-[#262626] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-zinc-400" />
              <select
                value={selectedTeamFilter}
                onChange={(e) => setSelectedTeamFilter(e.target.value)}
                className="bg-[#181818] border border-[#262626] rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none"
              >
                <option value="all">All Predefined Teams</option>
                {PREDEFINED_TEAMS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Attendance Marking Table */}
          <div className="bg-[#111111] border border-[#262626] rounded-xl overflow-hidden shadow-xl">
            {loading ? (
              <div className="p-12 text-center text-xs font-mono text-zinc-400">Loading active members...</div>
            ) : filteredMembers.length === 0 ? (
              <div className="p-12 text-center text-xs font-mono text-zinc-500">
                No active members match the selected search or team filter.
              </div>
            ) : (
              <form onSubmit={handleSave}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0c0c0c] text-zinc-400 uppercase text-[10px] font-mono border-b border-[#262626]">
                      <tr>
                        <th className="px-4 py-3">Member Name</th>
                        <th className="px-4 py-3">Roll Number</th>
                        <th className="px-4 py-3">Current Team</th>
                        <th className="px-4 py-3 text-center">Status Toggle</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#262626]">
                      {filteredMembers.map((member) => {
                        const status = statusState[member.uid] || 'present';
                        return (
                          <tr key={member.uid} className="hover:bg-[#181818]/60 transition-colors">
                            <td className="px-4 py-3 font-mono font-medium text-white">
                              {member.name}
                            </td>
                            <td className="px-4 py-3 font-mono text-zinc-400">
                              {member.rollNumber}
                            </td>
                            <td className="px-4 py-3 font-mono text-zinc-300">
                              {getTeamName(member.teamId)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="inline-flex bg-[#181818] p-1 rounded-lg border border-[#262626]">
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(member.uid, 'present')}
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
                                  onClick={() => handleStatusChange(member.uid, 'absent')}
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
                    Review live counts above before saving.
                  </span>
                  <button
                    type="submit"
                    disabled={saving || duplicateWarning}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-900/30"
                  >
                    {saving ? (
                      'Saving Attendance...'
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Attendance Record
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
