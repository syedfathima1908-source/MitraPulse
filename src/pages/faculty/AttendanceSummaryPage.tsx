import React, { useEffect, useState } from 'react';
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
import { PieChart, Layers, Users } from 'lucide-react';

export const AttendanceSummaryPage: React.FC = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [attendanceDays, setAttendanceDays] = useState<AttendanceDay[]>([]);
  const [memberRecordsMap, setMemberRecordsMap] = useState<Record<string, Record<string, AttendanceRecord>>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSummaryData = async () => {
      setLoading(true);
      try {
        const mList = await getMembers();
        setMembers(mList);

        const days = await getAllAttendanceDays();
        setAttendanceDays(days);

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

    loadSummaryData();
  }, []);

  if (!user) return null;

  const activeMembers = members.filter((m) => m.isActive);

  // Compute Overall Stats
  let totalPresentCount = 0;
  let totalApplicableCount = 0;

  attendanceDays.forEach((d) => {
    totalPresentCount += d.presentCount;
    totalApplicableCount += d.totalMembers;
  });

  const overallRate = calculateAttendancePercentage(totalPresentCount, totalApplicableCount);

  // Compute Member-level Summaries
  const allMemberSummaries = activeMembers.map((member) => {
    const memberDayRecords: Record<string, AttendanceRecord> = {};
    attendanceDays.forEach((day) => {
      const rec = memberRecordsMap[day.date]?.[member.uid];
      if (rec) {
        memberDayRecords[day.date] = rec;
      }
    });

    return calculateStudentAttendanceSummary(member, attendanceDays, memberDayRecords);
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 lg:p-8 space-y-6 overflow-x-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold font-mono text-white tracking-tight flex items-center gap-2">
                <PieChart className="w-5 h-5 text-blue-500" />
                Comprehensive Attendance Summary Report
              </h1>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Centralized overall, team-wise, and individual attendance reporting
              </p>
            </div>
          </div>

          {/* Overall Stats Strip */}
          <div className="bg-[#111111] border border-[#262626] rounded-xl p-5 shadow-xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="bg-[#181818] p-3.5 rounded-lg border border-[#262626]">
              <span className="text-[10px] text-zinc-400 block uppercase">Overall Cumulative Rate</span>
              <span className="text-2xl font-bold text-blue-400 mt-1 block">
                {formatAttendancePercentage(overallRate)}
              </span>
            </div>

            <div className="bg-[#181818] p-3.5 rounded-lg border border-[#262626]">
              <span className="text-[10px] text-zinc-400 block uppercase">Total Recorded Sessions</span>
              <span className="text-2xl font-bold text-purple-400 mt-1 block">
                {attendanceDays.length}
              </span>
            </div>

            <div className="bg-[#181818] p-3.5 rounded-lg border border-[#262626]">
              <span className="text-[10px] text-zinc-400 block uppercase">Active Members</span>
              <span className="text-2xl font-bold text-zinc-200 mt-1 block">
                {activeMembers.length}
              </span>
            </div>

            <div className="bg-[#181818] p-3.5 rounded-lg border border-[#262626]">
              <span className="text-[10px] text-zinc-400 block uppercase">Total Marked Attendance Records</span>
              <span className="text-2xl font-bold text-green-400 mt-1 block">
                {totalApplicableCount}
              </span>
            </div>
          </div>

          {/* Team-wise Summary Matrix */}
          <div className="space-y-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-500" />
              Team-wise Summary Breakdown
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PREDEFINED_TEAMS.map((team) => {
                const teamMems = activeMembers.filter((m) => m.teamId === team.id);
                let teamPresent = 0;
                let teamApplicable = 0;

                teamMems.forEach((m) => {
                  const sum = allMemberSummaries.find((s) => s.memberUid === m.uid);
                  if (sum) {
                    teamPresent += sum.presentDays;
                    teamApplicable += sum.applicableDays;
                  }
                });

                const teamRate = calculateAttendancePercentage(teamPresent, teamApplicable);

                return (
                  <div key={team.id} className="bg-[#111111] border border-[#262626] rounded-xl p-4 shadow-lg">
                    <span className="text-xs font-bold font-mono text-white block">{team.name}</span>
                    <div className="mt-3 flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-400">Members:</span>
                      <span className="text-white font-bold">{teamMems.length}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-400">Attendance Rate:</span>
                      <span className="text-blue-400 font-bold">{formatAttendancePercentage(teamRate)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Individual Member Summary Roster */}
          <div className="bg-[#111111] border border-[#262626] rounded-xl overflow-hidden shadow-xl">
            <div className="px-5 py-3.5 bg-[#181818] border-b border-[#262626] flex items-center justify-between">
              <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Individual Member Attendance Report ({allMemberSummaries.length})
              </h3>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs font-mono text-zinc-400">Loading summary report...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0c0c0c] text-zinc-400 uppercase text-[10px] font-mono border-b border-[#262626]">
                    <tr>
                      <th className="px-4 py-3">Member Name</th>
                      <th className="px-4 py-3">Roll Number</th>
                      <th className="px-4 py-3">Team</th>
                      <th className="px-4 py-3">Present Days</th>
                      <th className="px-4 py-3">Absent Days</th>
                      <th className="px-4 py-3">Applicable Days</th>
                      <th className="px-4 py-3 text-right">Attendance Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262626]">
                    {allMemberSummaries.map((sum) => (
                      <tr key={sum.memberUid} className="hover:bg-[#181818]/60 transition-colors">
                        <td className="px-4 py-3 font-mono font-medium text-white">{sum.memberName}</td>
                        <td className="px-4 py-3 font-mono text-zinc-400">{sum.rollNumber}</td>
                        <td className="px-4 py-3 font-mono text-zinc-300">{getTeamName(sum.teamId)}</td>
                        <td className="px-4 py-3 font-mono text-green-400 font-semibold">{sum.presentDays}</td>
                        <td className="px-4 py-3 font-mono text-red-400 font-semibold">{sum.absentDays}</td>
                        <td className="px-4 py-3 font-mono text-zinc-300">{sum.applicableDays}</td>
                        <td className="px-4 py-3 text-right font-mono text-blue-400 font-bold">
                          {formatAttendancePercentage(sum.attendancePercentage)}
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
