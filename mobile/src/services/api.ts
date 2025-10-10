import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// API base URL - Backend público en Render
const API_URL = 'https://nfl-backend-invn.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================
// AUTH APIs
// ============================

export const loginUser = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const registerUser = async (username: string, email: string, password: string) => {
  const response = await api.post('/auth/register', { username, email, password });
  return response.data;
};

export const updateProfile = async (data: {
  username?: string;
  password?: string;
  profileImage?: string; // base64 string
  favoriteTeam?: string; // team code like 'KC', 'SF', etc.
}) => {
  const response = await api.put('/auth/profile', data);
  return response.data;
};

export const checkUserExists = async (email: string) => {
  const response = await api.get(`/auth/check-user?email=${encodeURIComponent(email)}`);
  return response.data;
};

export const wakeup = async () => {
  const response = await api.get('/auth/wakeup');
  return response.data;
};

// ============================
// INVITATION APIs
// ============================

export const validateInvitationToken = async (token: string) => {
  const response = await api.get(`/auth/validate-invitation/${token}`);
  return response.data;
};

export const registerWithInvitation = async (invitationToken: string, username: string, password: string) => {
  const response = await api.post('/auth/register-with-invitation', {
    invitationToken,
    username,
    password,
  });
  return response.data;
};

export const createInvitationWithPicks = async (email: string, leagueId: number, picks: any) => {
  const response = await api.post('/leagues/create-invitation-with-picks', {
    email,
    leagueId,
    picks,
  });
  return response.data;
};

export const addUserWithPicks = async (email: string, leagueId: number, picks: any) => {
  const response = await api.post('/leagues/add-user-with-picks', {
    email,
    leagueId,
    picks,
  });
  return response.data;
};

// ============================
// LEAGUE APIs
// ============================

export const getUserLeagues = async () => {
  const response = await api.get('/leagues/user');
  return response.data;
};

export const createLeague = async (name: string, description: string, isPublic: boolean) => {
  const response = await api.post('/leagues/create', { name, description, isPublic });
  return response.data;
};

export const joinLeague = async (inviteCode: string) => {
  const response = await api.post('/leagues/join', { inviteCode });
  return response.data;
};

export const joinGeneralLeague = async () => {
  const response = await api.post('/leagues/join-general');
  return response.data;
};

// ============================
// GAME APIs
// ============================

export const getGames = async () => {
  const response = await api.get('/nfl/games/current');
  return response.data;
};

export const getGamesByWeek = async (week: number) => {
  const response = await api.get(`/nfl/games/week/${week}`);
  return response.data.games || []; // Extraer array de games
};

export const getAllGamesUntilWeek = async (week: number) => {
  const response = await api.get(`/nfl/games/all-until-week?week=${week}`);
  return response.data;
};

// ============================
// PICK APIs
// ============================

export const getUserPicks = async (leagueId: number, week: number) => {
  const response = await api.get(`/picks/user?leagueId=${leagueId}&week=${week}`);
  return response.data.picks || []; // Extraer array de picks
};

export const getUserPicksDetails = async (leagueId: number, week: number, userId?: number) => {
  const params = new URLSearchParams({
    leagueId: leagueId.toString(),
    week: week.toString(),
  });
  if (userId) {
    params.append('userId', userId.toString());
  }
  const response = await api.get(`/stats/user-picks?${params.toString()}`);
  return response.data;
};

export const makePicks = async (leagueId: number, picks: any) => {
  const response = await api.post('/picks/make', { leagueId, picks });
  return response.data;
};

// ============================
// STATS APIs
// ============================

export const getLeagueStats = async (leagueId: number, week: number) => {
  const response = await api.get(`/stats/league?leagueId=${leagueId}&week=${week}`);
  return response.data;
};

export const getStandings = async () => {
  const response = await api.get('/nfl/standings');
  return response.data; // Ya retorna { standings: [...] }
};

export const recalculateScores = async (data: {
  leagueId?: number;
  week?: number;
  allLeagues?: boolean;
}) => {
  const response = await api.post('/stats/recalculate-scores', data);
  return response.data;
};

export default api;
