// ============================
// USER & AUTH TYPES
// ============================

export interface User {
  id: number;
  username: string;
  email: string;
  profileImage?: string | null;
  favoriteTeam?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  token: string;
  user: User;
}

export interface UpdateProfileData {
  username?: string;
  password?: string;
  profileImage?: string; // base64 string
  favoriteTeam?: string; // team code like 'KC', 'SF', etc.
}

export interface UpdateProfileResponse {
  message: string;
  user: User;
}

// ============================
// LEAGUE TYPES
// ============================

export interface League {
  id: number;
  name: string;
  description?: string;
  isPublic: boolean;
  inviteCode: string;
  createdAt: string;
  updatedAt: string;
  role?: 'admin' | 'member'; // Added by backend based on user
}

export interface CreateLeagueResponse {
  message: string;
  league: League;
}

export interface JoinLeagueResponse {
  message: string;
  league: League;
}

export interface UserLeaguesResponse {
  leagues: League[];
}

// ============================
// GAME TYPES
// ============================

export type GameStatus = 'scheduled' | 'in_progress' | 'final' | 'postponed';

export interface Game {
  id: number;
  week: number;
  homeTeam: string; // Team code like 'KC', 'SF', etc.
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  gameDate: string; // ISO date string
  status: GameStatus;
  winner: string | null; // Team code of winner
  espnId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GamesResponse {
  games: Game[];
  currentWeek?: number;
  week?: number;
}

export interface AllGamesResponse {
  games: Game[];
  weeksIncluded: number[];
}

// ============================
// PICK TYPES
// ============================

export interface Pick {
  id: number;
  userId: number;
  leagueId: number;
  gameId: number;
  selectedTeam: string; // Team code
  week: number;
  isCorrect: boolean | null;
  points: number;
  createdAt: string;
  updatedAt: string;
}

export interface PickWithGame extends Pick {
  game: Game;
}

export interface UserPicksResponse {
  picks: PickWithGame[];
}

export interface UserPicksDetailsResponse {
  picks: PickWithGame[];
  user: {
    id: number;
    username: string;
    profileImage?: string | null;
    favoriteTeam?: string | null;
  };
}

export interface MakePicksData {
  [gameId: number]: number; // gameId: teamId mapping
}

export interface MakePicksResponse {
  message: string;
  picks: Pick[];
}

// ============================
// STATS TYPES
// ============================

export interface LeaderboardEntry {
  userId: number;
  username: string;
  profileImage?: string | null;
  favoriteTeam?: string | null;
  correctPicks: number;
  totalPicks: number;
  points: number;
  rank: number;
  superBowlBonus?: number; // Added for Super Bowl winners
}

export interface LeagueStatsResponse {
  leaderboard: LeaderboardEntry[];
  week: number;
  leagueId: number;
}

export interface TeamStanding {
  team: string;
  wins: number;
  losses: number;
  ties: number;
  division: string;
  conference: string;
  winPercentage: number;
}

export interface StandingsResponse {
  standings: TeamStanding[];
}

export interface RecalculateScoresData {
  leagueId?: number;
  week?: number;
  allLeagues?: boolean;
}

export interface RecalculateScoresResponse {
  message: string;
  updatedCount: number;
}

// ============================
// INVITATION TYPES
// ============================

export interface InvitationData {
  email: string;
  leagueId: number;
  picks: MakePicksData;
  week?: number;
}

export interface CreateInvitationResponse {
  message: string;
  invitationUrl: string;
}

export interface ValidateInvitationResponse {
  valid: boolean;
  email: string;
  leagueId: number;
  picks: MakePicksData;
  league?: League;
}

export interface RegisterWithInvitationResponse {
  token: string;
  user: User;
  message: string;
}

export interface AddUserWithPicksResponse {
  message: string;
}

// ============================
// TEAM CODES
// ============================

export type NFLTeamCode =
  // AFC East
  | 'BUF' | 'MIA' | 'NE' | 'NYJ'
  // AFC North
  | 'BAL' | 'CIN' | 'CLE' | 'PIT'
  // AFC South
  | 'HOU' | 'IND' | 'JAX' | 'TEN'
  // AFC West
  | 'DEN' | 'KC' | 'LV' | 'LAC'
  // NFC East
  | 'DAL' | 'NYG' | 'PHI' | 'WAS'
  // NFC North
  | 'CHI' | 'DET' | 'GB' | 'MIN'
  // NFC South
  | 'ATL' | 'CAR' | 'NO' | 'TB'
  // NFC West
  | 'ARI' | 'LAR' | 'SF' | 'SEA';

export interface TeamInfo {
  code: NFLTeamCode;
  name: string;
  city: string;
  conference: 'AFC' | 'NFC';
  division: 'East' | 'North' | 'South' | 'West';
  colors: {
    primary: string;
    secondary: string;
  };
}

// ============================
// API ERROR TYPES
// ============================

export interface APIError {
  message: string;
  error?: string;
  statusCode?: number;
}

// ============================
// UTILITY TYPES
// ============================

export interface CheckUserExistsResponse {
  exists: boolean;
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

export interface WakeupResponse {
  message: string;
}
