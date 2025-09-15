

export type FirestoreTimestamp = {
  seconds: number;
  nanoseconds: number;
};

export type Candidate = {
  id: string;
  name: string;
  slogan: string;
  platform: string;
  imageUrl: string;
  votes: number;
  vision?: string;
  mission?: string;
};

export type AdminUser = {
  username: string;
  password?: string;
  name: string;
  role: string;
  status: string;
  lastLogin?: string;
};

export type Voter = {
  nis: string;
  name: string;
  class: string;
  password?: string;
  hasVoted: boolean;
  voteTime: string | null;
  votedFor: string | null;
};

export type VoteCount = {
    name: string;
    votes: number;
};

export type DisplaySettings = {
    chartTitle: string;
    chartType: 'bar' | 'pie' | 'doughnut';
    colorPalette: string;
};

export type SystemSettings = {
  startDate: Date;
  endDate: Date;
  isVotingActive: boolean;
};


export type AppsScriptResponse = {
  status: 'success' | 'error';
  message: string;
  data?: any;
};
