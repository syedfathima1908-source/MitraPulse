import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Header } from '../../components/common/Header';
import { Sidebar } from '../../components/common/Sidebar';
import { getMembers } from '../../services/memberService';
import { getAllAttendanceDays, getAttendanceRecordsForDate } from '../../services/attendanceService';
import { PREDEFINED_TEAMS, getTeamName } from '../../types/team';
import type { TeamId } from '../../types/team';
import type { Member } from '../../types/member';
import type { AttendanceDay, AttendanceRecord } from '../../types/attendance';
import { calculateStudentAttendanceSummary, formatAttendancePercentage, calculateAttendancePercentage } from '../../utils/attendanceUtils';
import { BookOpen, Filter, Users } from 'lucide-react';

export const TeamAttendancePage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initialTeam = (searchParams.get('team') as TeamId) || 'vibe-coding';
  const [selectedTeam, setSelectedTeam] = useState<TeamId>(initialTeam);

  const [members, setMembers] = useState<Member[]>([]);
  const [attendanceDays, setAttendanceDays] = useState<AttendanceDay[]>([]);
  const [memberRecordsMap, setMemberRecordsMap] = useState<Record<string, Record<string, AttendanceRecord>>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTeamData = async () => {
      setLoading(true);
      try {
        const mList = await getMembers();
        setMembers(mList);

        const days = await getAllAttendanceDays();
        setAttendanceDays(days);

        // Fetch records for all days to compute member-wise stats
        const recsMap: Record<string, Record<string, AttendanceRecord>> = {};
        for (const day of days) {
          const recs = await getAttendanceRecordsForDate(day.date);
          const mapForDay: Record<string, AttendanceRecord> = {};
          recs.forEach((r) => {
            mapForDay[r.memberUid] = r;
          });
          recsMap[day.date] = mapForDay;
        }
        setMemberRecordsMap(recsMap);
      } catch {}
      setLoading(false);
    };

    loadTeamData();
  }, []);

  if (!user) return null;

  const teamMembers = members.filter((m) => m.teamId === selectedTeam && m.isActive);

  // Compute team attendance statistics
  const teamMemberSummaries = teamMembers.map((member) => {
    const memberDayRecords: Record<string, AttendanceRecord> = {};
    attendanceDays.forEach((day) => {
      const rec = memberRecordsMap[day.date]?.[member.uid];
      if (rec) {
        memberDayRecords[day.date] = rec;
      }
    });

    return calculateStudentAttendanceSummary(member, attendanceDays, memberDayRecords);
  });

  let totalPresent = 0;
  let totalApplicable = 0;

  teamMemberSummaries.forEach((s) => {
    totalPresent += s.presentDays;
    totalApplicable += s.applicableDays;
  });

  const overallTeamPercentage = calculateAttendancePercentage(totalPresent, totalApplicable);

  const handleTeamChange = (teamId: TeamId) => {
    setSelectedTeam(teamId);
    setSearchParams({ team: teamId });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 lg:p-8 space-y-6 overflow-x-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold font-mono text-white tracking-tight flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-500" />
                Team Attendance Analysis
              </h1>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Teams serve as analytical filters across single daily attendance records
              </p>
            </div>
          </div>

          {/* Team Selector Tabs (Exactly 4 Teams) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PREDEFINED_TEAMS.map((team) => (
              <button
                key={team.id}
                onClick={() => handleTeamChange(team.id)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedTeam === team.id
                    ? 'bg-blue-950/40 border-blue-600 text-white shadow-lg'
                    : 'bg-[#111111] border-[#262626] text-zinc-400 hover:text-white hover:bg-[#181818]'
                }`}
              >
                <div className="text-xs font-mono font-bold">{team.name}</div>
                <div className="text-[10px] font-mono text-zinc-500 mt-1">
                  {members.filter((m) => m.teamId === team.id && m.isActive).length} Active Members
                </div>
              </button>
            ))}
          </div>

          {/* Selected Team Summary Strip */}
          <div className="bg-[#111111] border border-[#262626] rounded-xl p-4 shadow-xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="bg-[#181818] p-3 rounded-lg border border-[#262626]">
              <span className="text-[10px] text-zinc-400 block uppercase">Selected Team</span>
              <span className="text-sm font-bold text-white mt-0.5 block">{getTeamName(selectedTeam)}</span>
            </div>

            <div className="bg-[#181818] p-3 rounded-lg border border-[#262626]">
              <span className="text-[10px] text-zinc-400 block uppercase">Active Team Members</span>
              <span className="text-sm font-bold text-zinc-200 mt-0.5 block">{teamMembers.length}</span>
            </div>

            <div className="bg-[#181818] p-3 rounded-lg border border-[#262626]">
              <span className="text-[10px] text-zinc-400 block uppercase">Total Present Days</span>
              <span className="text-sm font-bold text-green-400 mt-0.5 block">{totalPresent}</span>
            </div>

            <div className="bg-[#181818] p-3 rounded-lg border border-[#262626]">
              <span className="text-[10px] text-zinc-400 block uppercase">Team Overall Rate</span>
              <span className="text-sm font-bold text-blue-400 mt-0.5 block">
                {formatAttendancePercentage(overallTeamPercentage)}
              </span>
            </div>
          </div>

          {/* Member List Table for Selected Team */}
          <div className="bg-[#111111] border border-[#262626] rounded-xl overflow-hidden shadow-xl">
            <div className="px-5 py-3.5 bg-[#181818] border-b border-[#262626] flex items-center justify-between">
              <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                {getTeamName(selectedTeam)} — Member Attendance Roster ({teamMemberSummaries.length})
              </h3>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs font-mono text-zinc-400">Loading team attendance...</div>
            ) : teamMemberSummaries.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-zinc-500">
                No active members currently assigned to {getTeamName(selectedTeam)}.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0c0c0c] text-zinc-400 uppercase text-[10px] font-mono border-b border-[#262626]">
                    <tr>
                      <th className="px-4 py-3">Member Name</th>
                      <th className="px-4 py-3">Roll Number</th>
                      <th className="px-4 py-3">Present Days</th>
                      <th className="px-4 py-3">Absent Days</th>
                      <th className="px-4 py-3">Total Applicable</th>
                      <th className="px-4 py-3 text-right">Attendance Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262626]">
                    {teamMemberSummaries.map((summary) => (
                      <tr key={summary.memberUid} className="hover:bg-[#181818]/60 transition-colors">
                        <td className="px-4 py-3 font-mono font-medium text-white">
                          {summary.memberName}
                        </td>
                        <td className="px-4 py-3 font-mono text-zinc-400">
                          {summary.rollNumber}
                        </td>
                        <td className="px-4 py-3 font-mono text-green-400 font-semibold">
                          {summary.presentDays}
                        </td>
                        <td className="px-4 py-3 font-mono text-red-400 font-semibold">
                          {summary.absentDays}
                        </td>
                        <td className="px-4 py-3 font-mono text-zinc-300">
                          {summary.applicableDays}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-blue-400 font-bold">
                          {formatAttendancePercentage(summary.attendancePercentage)}
                        </td>
                      </tr>
                    ))}
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
