export type TeamId = 'vibe-coding' | 'ai' | 'marketing' | 'industry-connect';

export interface Team {
  id: TeamId;
  name: string;
  description: string;
  createdAt: string;
}

export const PREDEFINED_TEAMS: Team[] = [
  {
    id: 'vibe-coding',
    name: 'Vibe Coding',
    description: 'Modern full-stack, rapid prototyping & engineering',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'ai',
    name: 'AI',
    description: 'Artificial intelligence, ML models & agentic systems',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Brand strategy, outreach, design & media production',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'industry-connect',
    name: 'Industry Connect',
    description: 'Corporate relations, sponsorships & industry partnerships',
    createdAt: '2026-01-01T00:00:00Z',
  },
];

export const getTeamName = (teamId: string | null | undefined): string => {
  if (!teamId) return 'N/A';
  const found = PREDEFINED_TEAMS.find((t) => t.id === teamId);
  return found ? found.name : teamId;
};
