export type UserRole = 'student' | 'faculty';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  teamId: string | null; // null for faculty
  rollNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
