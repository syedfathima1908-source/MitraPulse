import type { AttendanceDay, AttendanceRecord, MemberAttendanceSummary } from '../types/attendance';
import type { Member } from '../types/member';

/**
 * Calculates attendance percentage safely.
 * Formula: (Present Days / Total Applicable Days) * 100
 * Handles zero division gracefully to avoid NaN, Infinity or undefined.
 */
export const calculateAttendancePercentage = (
  presentDays: number,
  applicableDays: number
): number => {
  if (!applicableDays || applicableDays <= 0 || isNaN(applicableDays)) {
    return 0;
  }
  if (!presentDays || presentDays < 0 || isNaN(presentDays)) {
    return 0;
  }
  const percentage = (presentDays / applicableDays) * 100;
  if (isNaN(percentage) || !isFinite(percentage)) {
    return 0;
  }
  return Math.min(100, Math.max(0, percentage));
};

/**
 * Formats an attendance percentage for display cleanly (e.g. "90.6%" or "100%").
 * Ensures NaN/Infinity are never displayed.
 */
export const formatAttendancePercentage = (percentage: number): string => {
  if (isNaN(percentage) || !isFinite(percentage)) {
    return '0%';
  }
  const rounded = Math.round(percentage * 10) / 10;
  return `${rounded}%`;
};

/**
 * Checks if an attendance date falls within a member's active period.
 * Dates before member.joinedAt do NOT count.
 */
export const isDateApplicableForMember = (
  dateStr: string,
  joinedAtStr: string
): boolean => {
  if (!dateStr || !joinedAtStr) return true;
  // Compare YYYY-MM-DD directly
  return dateStr >= joinedAtStr;
};

/**
 * Calculates student attendance summary from daily attendance records.
 */
export const calculateStudentAttendanceSummary = (
  member: Member,
  allAttendanceDays: AttendanceDay[],
  memberRecordsMap: Record<string, AttendanceRecord> // Key: date YYYY-MM-DD
): MemberAttendanceSummary => {
  let presentDays = 0;
  let absentDays = 0;
  let applicableDays = 0;

  for (const day of allAttendanceDays) {
    // Only count dates on or after member joinedAt
    if (!isDateApplicableForMember(day.date, member.joinedAt)) {
      continue;
    }

    const record = memberRecordsMap[day.date];
    if (record) {
      applicableDays++;
      if (record.status === 'present') {
        presentDays++;
      } else if (record.status === 'absent') {
        absentDays++;
      }
    }
  }

  const attendancePercentage = calculateAttendancePercentage(presentDays, applicableDays);

  return {
    memberUid: member.uid,
    memberName: member.name,
    rollNumber: member.rollNumber,
    teamId: member.teamId,
    presentDays,
    absentDays,
    applicableDays,
    attendancePercentage,
  };
};
