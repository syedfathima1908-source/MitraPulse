import type { TeamId } from './team';

export type AttendanceStatus = 'present' | 'absent';

export interface AttendanceRecord {
  memberUid: string;
  memberName: string;
  rollNumber: string;
  teamId: TeamId; // Historical snapshot at marking time
  status: AttendanceStatus;
  markedAt: string;
  updatedAt: string;
}

export interface AttendanceDay {
  date: string; // YYYY-MM-DD
  markedBy: string; // Faculty UID
  totalMembers: number;
  presentCount: number;
  absentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MemberAttendanceSummary {
  memberUid: string;
  memberName: string;
  rollNumber: string;
  teamId: TeamId;
  presentDays: number;
  absentDays: number;
  applicableDays: number;
  attendancePercentage: number;
}
