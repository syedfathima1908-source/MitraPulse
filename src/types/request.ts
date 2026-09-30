import type { TeamId } from './team';
import type { AttendanceStatus } from './attendance';

export type CorrectionRequestStatus = 'pending' | 'approved' | 'rejected';

export interface AttendanceCorrectionRequest {
  id: string;
  studentUid: string;
  studentName: string;
  rollNumber: string;
  teamId: TeamId;
  attendanceDate: string; // YYYY-MM-DD
  currentStatus: AttendanceStatus; // Must be 'absent'
  reason: string;
  status: CorrectionRequestStatus;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
