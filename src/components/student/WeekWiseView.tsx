import React, { useState } from 'react';
import type { AttendanceDay, AttendanceRecord } from '../../types/attendance';
import type { AttendanceCorrectionRequest } from '../../types/request';
import { getDaysInWeek, formatWeekRange, formatShortDate } from '../../utils/dateUtils';
import { calculateAttendancePercentage, formatAttendancePercentage } from '../../utils/attendanceUtils';
import { StatusBadge } from '../common/StatusBadge';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface WeekWiseViewProps {
  attendanceDays: AttendanceDay[];
  recordsMap: Record<string, AttendanceRecord>;
  requestsMap: Record<string, AttendanceCorrectionRequest>;
  onOpenRaiseRequest: (dateStr: string) => void;
  joinedAt: string;
}

export const WeekWiseView: React.FC<WeekWiseViewProps> = ({
  attendanceDays,
  recordsMap,
  requestsMap,
  onOpenRaiseRequest,
  joinedAt,
}) => {
  // Current anchor date for week navigation (defaults to latest recorded date or today)
  const latestDate = attendanceDays[0]?.date || new Date().toISOString().substring(0, 10);
  const [anchorDate, setAnchorDate] = useState<string>(latestDate);

  const daysInWeek = getDaysInWeek(anchorDate);
  const recordedDatesSet = new Set(attendanceDays.map((d) => d.date));

  // Compute metrics for selected week
  let presentCount = 0;
  let absentCount = 0;
  let applicableCount = 0;

  daysInWeek.forEach((day) => {
    // Only dates that have been recorded in system and are on/after joinedAt count
    if (recordedDatesSet.has(day.dateStr) && day.dateStr >= joinedAt) {
      applicableCount++;
      const rec = recordsMap[day.dateStr];
      if (rec?.status === 'present') {
        presentCount++;
      } else if (rec?.status === 'absent') {
        absentCount++;
      }
    }
  });

  const weekPercentage = calculateAttendancePercentage(presentCount, applicableCount);

  const navigateWeek = (direction: 'prev' | 'next') => {
    const current = new Date(anchorDate);
    const diff = direction === 'prev' ? -7 : 7;
    current.setDate(current.getDate() + diff);
    setAnchorDate(current.toISOString().substring(0, 10));
  };

  return (
    <div className="space-y-6">
      {/* Week Header & Navigation */}
      <div className="bg-[#111111] border border-[#262626] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateWeek('prev')}
            className="p-1.5 bg-[#181818] hover:bg-[#262626] border border-[#262626] rounded-lg text-zinc-300 transition-colors"
            title="Previous Week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 px-3 py-1 bg-[#181818] border border-[#262626] rounded-lg">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-mono font-semibold text-white">
              {formatWeekRange(anchorDate)}
            </span>
          </div>
          <button
            onClick={() => navigateWeek('next')}
            className="p-1.5 bg-[#181818] hover:bg-[#262626] border border-[#262626] rounded-lg text-zinc-300 transition-colors"
            title="Next Week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Week Summary Stats Strip */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-[#181818] px-3 py-1.5 rounded-lg border border-[#262626]">
            <span className="text-zinc-500 text-[10px] block">Present</span>
            <span className="text-green-400 font-bold">{presentCount}</span>
          </div>
          <div className="bg-[#181818] px-3 py-1.5 rounded-lg border border-[#262626]">
            <span className="text-zinc-500 text-[10px] block">Absent</span>
            <span className="text-red-400 font-bold">{absentCount}</span>
          </div>
          <div className="bg-[#181818] px-3 py-1.5 rounded-lg border border-[#262626]">
            <span className="text-zinc-500 text-[10px] block">Week Attendance</span>
            <span className="text-blue-400 font-bold">
              {formatAttendancePercentage(weekPercentage)}
            </span>
          </div>
        </div>
      </div>

      {/* Week Daily Status Tiles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {daysInWeek.map((day) => {
          const isRecorded = recordedDatesSet.has(day.dateStr);
          const isApplicable = isRecorded && day.dateStr >= joinedAt;
          const record = recordsMap[day.dateStr];
          const status = record?.status;
          const request = requestsMap[day.dateStr];

          return (
            <div
              key={day.dateStr}
              className={`bg-[#111111] border rounded-xl p-3 flex flex-col justify-between min-h-[140px] transition-all ${
                isApplicable
                  ? status === 'present'
                    ? 'border-green-900/40 bg-green-950/10'
                    : 'border-red-900/40 bg-red-950/10'
                  : 'border-[#262626] opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                  <span className="font-bold text-zinc-300">{day.dayName}</span>
                  <span className="text-zinc-500 text-[10px]">{formatShortDate(day.dateStr)}</span>
                </div>

                <div className="mt-2">
                  {isApplicable ? (
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-6 h-6 rounded flex items-center justify-center font-mono text-xs font-bold ${
                          status === 'present'
                            ? 'bg-green-600 text-white'
                            : 'bg-red-600 text-white'
                        }`}
                      >
                        {status === 'present' ? 'P' : 'A'}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-300 capitalize">
                        {status}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] font-mono text-zinc-500 italic">
                      No Session
                    </span>
                  )}
                </div>
              </div>

              {/* Raise Request Action Button */}
              {isApplicable && status === 'absent' && (
                <div className="mt-3 pt-2 border-t border-red-900/40">
                  {request ? (
                    <div className="text-center">
                      <StatusBadge status={request.status} size="sm" />
                    </div>
                  ) : (
                    <button
                      onClick={() => onOpenRaiseRequest(day.dateStr)}
                      className="w-full py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-mono text-[10px] font-semibold transition-colors shadow"
                    >
                      RAISE REQUEST
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
