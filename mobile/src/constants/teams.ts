import { NFLTeamCode, TeamInfo } from '../types/api.types';

// NFL Team Information
export const NFL_TEAMS: Record<NFLTeamCode, TeamInfo> = {
  // AFC East
  BUF: {
    code: 'BUF',
    name: 'Bills',
    city: 'Buffalo',
    conference: 'AFC',
    division: 'East',
    colors: { primary: '#00338D', secondary: '#C60C30' },
  },
  MIA: {
    code: 'MIA',
    name: 'Dolphins',
    city: 'Miami',
    conference: 'AFC',
    division: 'East',
    colors: { primary: '#008E97', secondary: '#FC4C02' },
  },
  NE: {
    code: 'NE',
    name: 'Patriots',
    city: 'New England',
    conference: 'AFC',
    division: 'East',
    colors: { primary: '#002244', secondary: '#C60C30' },
  },
  NYJ: {
    code: 'NYJ',
    name: 'Jets',
    city: 'New York',
    conference: 'AFC',
    division: 'East',
    colors: { primary: '#125740', secondary: '#FFFFFF' },
  },

  // AFC North
  BAL: {
    code: 'BAL',
    name: 'Ravens',
    city: 'Baltimore',
    conference: 'AFC',
    division: 'North',
    colors: { primary: '#241773', secondary: '#000000' },
  },
  CIN: {
    code: 'CIN',
    name: 'Bengals',
    city: 'Cincinnati',
    conference: 'AFC',
    division: 'North',
    colors: { primary: '#FB4F14', secondary: '#000000' },
  },
  CLE: {
    code: 'CLE',
    name: 'Browns',
    city: 'Cleveland',
    conference: 'AFC',
    division: 'North',
    colors: { primary: '#311D00', secondary: '#FF3C00' },
  },
  PIT: {
    code: 'PIT',
    name: 'Steelers',
    city: 'Pittsburgh',
    conference: 'AFC',
    division: 'North',
    colors: { primary: '#FFB612', secondary: '#000000' },
  },

  // AFC South
  HOU: {
    code: 'HOU',
    name: 'Texans',
    city: 'Houston',
    conference: 'AFC',
    division: 'South',
    colors: { primary: '#03202F', secondary: '#A71930' },
  },
  IND: {
    code: 'IND',
    name: 'Colts',
    city: 'Indianapolis',
    conference: 'AFC',
    division: 'South',
    colors: { primary: '#002C5F', secondary: '#A2AAAD' },
  },
  JAX: {
    code: 'JAX',
    name: 'Jaguars',
    city: 'Jacksonville',
    conference: 'AFC',
    division: 'South',
    colors: { primary: '#006778', secondary: '#D7A22A' },
  },
  TEN: {
    code: 'TEN',
    name: 'Titans',
    city: 'Tennessee',
    conference: 'AFC',
    division: 'South',
    colors: { primary: '#0C2340', secondary: '#4B92DB' },
  },

  // AFC West
  DEN: {
    code: 'DEN',
    name: 'Broncos',
    city: 'Denver',
    conference: 'AFC',
    division: 'West',
    colors: { primary: '#FB4F14', secondary: '#002244' },
  },
  KC: {
    code: 'KC',
    name: 'Chiefs',
    city: 'Kansas City',
    conference: 'AFC',
    division: 'West',
    colors: { primary: '#E31837', secondary: '#FFB81C' },
  },
  LV: {
    code: 'LV',
    name: 'Raiders',
    city: 'Las Vegas',
    conference: 'AFC',
    division: 'West',
    colors: { primary: '#000000', secondary: '#A5ACAF' },
  },
  LAC: {
    code: 'LAC',
    name: 'Chargers',
    city: 'Los Angeles',
    conference: 'AFC',
    division: 'West',
    colors: { primary: '#0080C6', secondary: '#FFC20E' },
  },

  // NFC East
  DAL: {
    code: 'DAL',
    name: 'Cowboys',
    city: 'Dallas',
    conference: 'NFC',
    division: 'East',
    colors: { primary: '#041E42', secondary: '#869397' },
  },
  NYG: {
    code: 'NYG',
    name: 'Giants',
    city: 'New York',
    conference: 'NFC',
    division: 'East',
    colors: { primary: '#0B2265', secondary: '#A71930' },
  },
  PHI: {
    code: 'PHI',
    name: 'Eagles',
    city: 'Philadelphia',
    conference: 'NFC',
    division: 'East',
    colors: { primary: '#004C54', secondary: '#A5ACAF' },
  },
  WAS: {
    code: 'WAS',
    name: 'Commanders',
    city: 'Washington',
    conference: 'NFC',
    division: 'East',
    colors: { primary: '#5A1414', secondary: '#FFB612' },
  },

  // NFC North
  CHI: {
    code: 'CHI',
    name: 'Bears',
    city: 'Chicago',
    conference: 'NFC',
    division: 'North',
    colors: { primary: '#0B162A', secondary: '#C83803' },
  },
  DET: {
    code: 'DET',
    name: 'Lions',
    city: 'Detroit',
    conference: 'NFC',
    division: 'North',
    colors: { primary: '#0076B6', secondary: '#B0B7BC' },
  },
  GB: {
    code: 'GB',
    name: 'Packers',
    city: 'Green Bay',
    conference: 'NFC',
    division: 'North',
    colors: { primary: '#203731', secondary: '#FFB612' },
  },
  MIN: {
    code: 'MIN',
    name: 'Vikings',
    city: 'Minnesota',
    conference: 'NFC',
    division: 'North',
    colors: { primary: '#4F2683', secondary: '#FFC62F' },
  },

  // NFC South
  ATL: {
    code: 'ATL',
    name: 'Falcons',
    city: 'Atlanta',
    conference: 'NFC',
    division: 'South',
    colors: { primary: '#A71930', secondary: '#000000' },
  },
  CAR: {
    code: 'CAR',
    name: 'Panthers',
    city: 'Carolina',
    conference: 'NFC',
    division: 'South',
    colors: { primary: '#0085CA', secondary: '#101820' },
  },
  NO: {
    code: 'NO',
    name: 'Saints',
    city: 'New Orleans',
    conference: 'NFC',
    division: 'South',
    colors: { primary: '#D3BC8D', secondary: '#101820' },
  },
  TB: {
    code: 'TB',
    name: 'Buccaneers',
    city: 'Tampa Bay',
    conference: 'NFC',
    division: 'South',
    colors: { primary: '#D50A0A', secondary: '#34302B' },
  },

  // NFC West
  ARI: {
    code: 'ARI',
    name: 'Cardinals',
    city: 'Arizona',
    conference: 'NFC',
    division: 'West',
    colors: { primary: '#97233F', secondary: '#000000' },
  },
  LAR: {
    code: 'LAR',
    name: 'Rams',
    city: 'Los Angeles',
    conference: 'NFC',
    division: 'West',
    colors: { primary: '#003594', secondary: '#FFA300' },
  },
  SF: {
    code: 'SF',
    name: '49ers',
    city: 'San Francisco',
    conference: 'NFC',
    division: 'West',
    colors: { primary: '#AA0000', secondary: '#B3995D' },
  },
  SEA: {
    code: 'SEA',
    name: 'Seahawks',
    city: 'Seattle',
    conference: 'NFC',
    division: 'West',
    colors: { primary: '#002244', secondary: '#69BE28' },
  },
};

// Helper function to get team info
export const getTeamInfo = (teamCode: NFLTeamCode): TeamInfo => {
  return NFL_TEAMS[teamCode];
};

// Helper function to get team full name
export const getTeamFullName = (teamCode: NFLTeamCode): string => {
  const team = NFL_TEAMS[teamCode];
  return `${team.city} ${team.name}`;
};

// Helper function to get all teams by conference
export const getTeamsByConference = (conference: 'AFC' | 'NFC'): TeamInfo[] => {
  return Object.values(NFL_TEAMS).filter(team => team.conference === conference);
};

// Helper function to get all teams by division
export const getTeamsByDivision = (
  conference: 'AFC' | 'NFC',
  division: 'East' | 'North' | 'South' | 'West'
): TeamInfo[] => {
  return Object.values(NFL_TEAMS).filter(
    team => team.conference === conference && team.division === division
  );
};

// All team codes as array
export const ALL_TEAM_CODES: NFLTeamCode[] = Object.keys(NFL_TEAMS) as NFLTeamCode[];

// Teams organized by division for UI selection
export const TEAMS_BY_DIVISION = {
  AFC: {
    East: getTeamsByDivision('AFC', 'East'),
    North: getTeamsByDivision('AFC', 'North'),
    South: getTeamsByDivision('AFC', 'South'),
    West: getTeamsByDivision('AFC', 'West'),
  },
  NFC: {
    East: getTeamsByDivision('NFC', 'East'),
    North: getTeamsByDivision('NFC', 'North'),
    South: getTeamsByDivision('NFC', 'South'),
    West: getTeamsByDivision('NFC', 'West'),
  },
};
