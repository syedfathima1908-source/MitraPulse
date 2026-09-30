import React from 'react';
import type { AttendanceDay, AttendanceRecord } from '../../types/attendance';
import type { AttendanceCorrectionRequest } from '../../types/request';
import { formatReadableDate, getDayOfWeek } from '../../utils/dateUtils';
import { StatusBadge } from '../common/StatusBadge';
import { getTeamName } from '../../types/team';
import { AlertCircle, Calendar } from 'lucide-react';

interface DayWiseViewProps {
  attendanceDays: AttendanceDay[];
  recordsMap: Record<string, AttendanceRecord>;
  requestsMap: Record<string, AttendanceCorrectionRequest>; // Key: attendanceDate
  onOpenRaiseRequest: (dateStr: string) => void;
  joinedAt: string;
}

export const DayWiseView: React.FC<DayWiseViewProps> = ({
  attendanceDays,
  recordsMap,
  requestsMap,
  onOpenRaiseRequest,
  joinedAt,
}) => {
  // Filter days on or after member joinedAt
  const applicableDays = attendanceDays.filter((d) => d.date >= joinedAt);

  if (applicableDays.length === 0) {
    return (
      <div className="bg-[#111111] border border-[#262626] rounded-xl p-8 text-center text-zinc-400 font-mono text-xs">
        <Calendar className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
        No attendance records available for your active membership period.
      </div>
    );
  }

  return (
    <div className="bg-[#111111] border border-[#262626] rounded-xl overflow-hidden shadow-xl">
      <div className="px-4 py-3 bg-[#181818] border-b border-[#262626] flex items-center justify-between">
        <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
          Day-wise Attendance Detailed Log
        </h3>
        <span className="text-[10px] text-zinc-400 font-mono">
          Total Recorded Days: {applicableDays.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0c0c0c] text-zinc-400 uppercase text-[10px] font-mono border-b border-[#262626]">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Day</th>
              <th className="px-4 py-3">Team Snapshot</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action / Request Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#262626]">
            {applicableDays.map((day) => {
              const record = recordsMap[day.date];
              const status = record?.status || 'absent';
              const teamName = getTeamName(record?.teamId);
              const request = requestsMap[day.date];

              return (
                <tr key={day.date} className="hover:bg-[#181818]/60 transition-colors">
                  <td className="px-4 py-3 font-mono font-medium text-white">
                    {formatReadableDate(day.date)}
                  </td>
                  <td className="px-4 py-3 font-mono text-zinc-400">
                    {getDayOfWeek(day.date)}
                  </td>
                  <td className="px-4 py-3 font-mono text-zinc-300">
                    {teamName}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {status === 'absent' && (
                      <>
                        {request ? (
                          <div className="inline-flex items-center gap-1.5 font-mono text-[11px]">
                            <span className="text-zinc-400">Request:</span>
                            <StatusBadge status={request.status} />
                          </div>
                        ) : (
                          <button
                            onClick={() => onOpenRaiseRequest(day.date)}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-mono text-[11px] transition-colors shadow-sm"
                          >
                            RAISE REQUEST
                          </button>
                        )}
                      </>
                    )}

                    {status === 'present' && (
                      <span className="text-[11px] font-mono text-zinc-500">Verified Present</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
