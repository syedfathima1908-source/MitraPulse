import React, { useState } from 'react';
import type { AttendanceDay, AttendanceRecord } from '../../types/attendance';
import type { AttendanceCorrectionRequest } from '../../types/request';
import { formatMonthYear } from '../../utils/dateUtils';
import { calculateAttendancePercentage, formatAttendancePercentage } from '../../utils/attendanceUtils';
import { StatusBadge } from '../common/StatusBadge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface MonthWiseViewProps {
  attendanceDays: AttendanceDay[];
  recordsMap: Record<string, AttendanceRecord>;
  requestsMap: Record<string, AttendanceCorrectionRequest>;
  onOpenRaiseRequest: (dateStr: string) => void;
  joinedAt: string;
}

export const MonthWiseView: React.FC<MonthWiseViewProps> = ({
  attendanceDays,
  recordsMap,
  requestsMap,
  onOpenRaiseRequest,
  joinedAt,
}) => {
  const latestDate = attendanceDays[0]?.date || new Date().toISOString().substring(0, 10);
  const [currentYearMonth, setCurrentYearMonth] = useState<string>(latestDate.substring(0, 7)); // YYYY-MM

  const recordedDatesMap = new Map(attendanceDays.map((d) => [d.date, d]));

  // Build array of dates in the selected month
  const [yearStr, monthStr] = currentYearMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10); // 1-indexed

  const daysInMonthCount = new Date(year, month, 0).getDate();
  const monthDates: string[] = [];

  for (let i = 1; i <= daysInMonthCount; i++) {
    const dayPadded = String(i).padStart(2, '0');
    monthDates.push(`${currentYearMonth}-${dayPadded}`);
  }

  // Calculate monthly stats
  let presentCount = 0;
  let absentCount = 0;
  let applicableCount = 0;

  monthDates.forEach((dateStr) => {
    if (recordedDatesMap.has(dateStr) && dateStr >= joinedAt) {
      applicableCount++;
      const rec = recordsMap[dateStr];
      if (rec?.status === 'present') {
        presentCount++;
      } else if (rec?.status === 'absent') {
        absentCount++;
      }
    }
  });

  const monthPercentage = calculateAttendancePercentage(presentCount, applicableCount);

  const navigateMonth = (direction: 'prev' | 'next') => {
    let newYear = year;
    let newMonth = direction === 'prev' ? month - 1 : month + 1;

    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    } else if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }

    const monthPadded = String(newMonth).padStart(2, '0');
    setCurrentYearMonth(`${newYear}-${monthPadded}`);
  };

  return (
    <div className="space-y-6">
      {/* Month Navigation & Summary Strip */}
      <div className="bg-[#111111] border border-[#262626] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-1.5 bg-[#181818] hover:bg-[#262626] border border-[#262626] rounded-lg text-zinc-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 px-3.5 py-1 bg-[#181818] border border-[#262626] rounded-lg">
            <CalendarIcon className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-mono font-bold text-white">
              {formatMonthYear(currentYearMonth)}
            </span>
          </div>
          <button
            onClick={() => navigateMonth('next')}
            className="p-1.5 bg-[#181818] hover:bg-[#262626] border border-[#262626] rounded-lg text-zinc-300 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Monthly Summary Cards */}
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
            <span className="text-zinc-500 text-[10px] block">Applicable Days</span>
            <span className="text-zinc-200 font-bold">{applicableCount}</span>
          </div>
          <div className="bg-[#181818] px-3 py-1.5 rounded-lg border border-[#262626]">
            <span className="text-zinc-500 text-[10px] block">Monthly Rate</span>
            <span className="text-blue-400 font-bold">
              {formatAttendancePercentage(monthPercentage)}
            </span>
          </div>
        </div>
      </div>

      {/* Compact Calendar Heatmap Grid */}
      <div className="bg-[#111111] border border-[#262626] rounded-xl p-5 shadow-xl">
        <h4 className="text-xs font-mono font-bold text-zinc-300 mb-4 uppercase tracking-wider">
          Monthly Attendance Calendar Matrix
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {monthDates.map((dateStr) => {
            const dayNum = dateStr.substring(8);
            const isRecorded = recordedDatesMap.has(dateStr);
            const isApplicable = isRecorded && dateStr >= joinedAt;
            const record = recordsMap[dateStr];
            const status = record?.status;
            const request = requestsMap[dateStr];

            return (
              <div
                key={dateStr}
                className={`p-2.5 rounded-lg border flex flex-col justify-between h-24 transition-all ${
                  isApplicable
                    ? status === 'present'
                      ? 'bg-green-950/20 border-green-800/40 text-green-300'
                      : 'bg-red-950/20 border-red-800/40 text-red-300'
                    : 'bg-[#181818]/40 border-[#262626] text-zinc-600'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="font-bold">{dayNum}</span>
                  {isApplicable && (
                    <span className="text-[10px] font-bold uppercase">
                      {status === 'present' ? 'P' : 'A'}
                    </span>
                  )}
                </div>

                {isApplicable && status === 'absent' && (
                  <div className="mt-1">
                    {request ? (
                      <StatusBadge status={request.status} size="sm" />
                    ) : (
                      <button
                        onClick={() => onOpenRaiseRequest(dateStr)}
                        className="w-full py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-mono text-[9px] font-semibold transition-colors"
                      >
                        Request
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
