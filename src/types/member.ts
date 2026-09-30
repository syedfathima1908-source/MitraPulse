import type { TeamId } from './team';

export interface Member {
  uid: string;
  name: string;
  email: string;
  rollNumber: string;
  teamId: TeamId;
  isActive: boolean;
  joinedAt: string; // ISO Date YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}
