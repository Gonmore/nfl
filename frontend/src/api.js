// API base URL (ajusta si usas otro puerto o dominio)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';  // Para desarrollo local

export async function registerUser({ username, email, password }) {
  console.log('Calling registerUser with:', { username, email, password: '***' });
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });
  const data = await res.json();
  console.log('registerUser response:', data);
  return data;
}

export async function loginUser({ email, password }) {
  console.log('Calling loginUser with:', { email, password: '***' });
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  console.log('loginUser response:', data);
  return data;
}

export async function getGames(token) {
  console.log('Calling getGames with token:', token ? 'present' : 'null');
  const res = await fetch(`${API_URL}/nfl/games/current`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await res.json();
  console.log('getGames response:', data);
  return data;
}

export async function getGamesByWeek(token, week) {
  console.log('Calling getGamesByWeek with token:', token ? 'present' : 'null', 'week:', week);
  const res = await fetch(`${API_URL}/nfl/games/week/${week}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await res.json();
  console.log('getGamesByWeek response:', data);
  return data;
}

export async function getStandings(token) {
  console.log('Calling getStandings with token:', token ? 'present' : 'null');
  const res = await fetch(`${API_URL}/nfl/standings`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await res.json();
  console.log('getStandings response:', data);
  return data;
}

export async function getUserLeagues(token) {
  console.log('Calling getUserLeagues with token:', token ? 'present' : 'null');
  const res = await fetch(`${API_URL}/leagues/user`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await res.json();
  console.log('getUserLeagues response:', data);
  return data;
}

export async function createLeague(token, { name, isPublic, description }) {
  const res = await fetch(`${API_URL}/leagues/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ name, isPublic, description })
  });
  return await res.json();
}

export async function joinLeague(token, { inviteCode }) {
  const res = await fetch(`${API_URL}/leagues/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ inviteCode })
  });
  return await res.json();
}

export async function makePicks(token, leagueId, picks) {
  const res = await fetch(`${API_URL}/picks/make`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ leagueId, picks })
  });
  return await res.json();
}

export async function getUserPicks(token, leagueId, week) {
  console.log('Calling getUserPicks with token:', token ? 'present' : 'null', 'leagueId:', leagueId, 'week:', week);
  const res = await fetch(`${API_URL}/picks/user?leagueId=${leagueId}&week=${week}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await res.json();
  console.log('getUserPicks response:', data);
  return data;
}

export async function getLeagueStats(token, leagueId, week) {
  console.log('Calling getLeagueStats with token:', token ? 'present' : 'null', 'leagueId:', leagueId, 'week:', week);
  const res = await fetch(`${API_URL}/stats/league?leagueId=${leagueId}&week=${week}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await res.json();
  console.log('getLeagueStats response:', data);
  return data;
}

export async function getUserPicksDetails(token, leagueId, week, userId) {
  console.log('Calling getUserPicksDetails with token:', token ? 'present' : 'null', 'leagueId:', leagueId, 'week:', week, 'userId:', userId);
  const params = new URLSearchParams({ leagueId: leagueId.toString(), week: week.toString() });
  if (userId) params.append('userId', userId.toString());
  const res = await fetch(`${API_URL}/stats/user-picks?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await res.json();
  console.log('getUserPicksDetails response:', data);
  return data;
}

export async function joinGeneralLeague(token) {
  const res = await fetch(`${API_URL}/leagues/join-general`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  return await res.json();
}