export type UserRole = 'admin' | 'user';
export type UserStatus = 'vert' | 'orange' | 'rouge';
export type UserGender = 'Masculin' | 'Féminin';

export interface User {
  id: string;
  name: string;
  email: string;
  country: string;
  countryCode?: string;
  gender: UserGender;
  role: UserRole;
  status: UserStatus;
  score: number;
  evaluationNote?: string;
  createdAt: string;
  lastActive?: string;
}

export interface ChatMessage {
  id: string;
  userId: string; // The normal user's conversation ID
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  imageUrl?: string;
  createdAt: string;
  markedStatus?: 'vrai' | 'faux' | 'en_attente';
}

export interface CountryStat {
  country: string;
  flag: string;
  count: number;
  percentage: number;
  avgScore: number;
  topScore: number;
}

export interface GenderStat {
  gender: UserGender;
  count: number;
  percentage: number;
  avgScore: number;
}

export interface StatsOverview {
  totalUsers: number;
  totalMessages: number;
  greenCount: number;
  orangeCount: number;
  redCount: number;
  avgScore: number;
  countryStats: CountryStat[];
  genderStats: GenderStat[];
}

export interface RankingsData {
  users: User[];
  stats: StatsOverview;
}
