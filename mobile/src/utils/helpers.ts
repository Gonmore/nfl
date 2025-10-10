import { NFLTeamCode } from '../types/api.types';
import { getTeamInfo } from '../constants/teams';

/**
 * Format date to readable string
 * @param dateString ISO date string
 * @returns Formatted date like "Dec 25, 2024 8:00 PM"
 */
export const formatGameDate = (dateString: string): string => {
  const date = new Date(dateString);
  
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };
  
  return date.toLocaleDateString('en-US', options);
};

/**
 * Format date to short format
 * @param dateString ISO date string
 * @returns Formatted date like "Dec 25"
 */
export const formatShortDate = (dateString: string): string => {
  const date = new Date(dateString);
  
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
  };
  
  return date.toLocaleDateString('en-US', options);
};

/**
 * Format time only
 * @param dateString ISO date string
 * @returns Formatted time like "8:00 PM"
 */
export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };
  
  return date.toLocaleDateString('en-US', options);
};

/**
 * Check if game is live
 * @param gameDate ISO date string
 * @param status Game status
 * @returns True if game is currently live
 */
export const isGameLive = (gameDate: string, status: string): boolean => {
  return status === 'in_progress';
};

/**
 * Check if game has started
 * @param gameDate ISO date string
 * @returns True if game has already started
 */
export const hasGameStarted = (gameDate: string): boolean => {
  return new Date(gameDate) < new Date();
};

/**
 * Get current NFL week (approximate)
 * Season starts around early September (week 1)
 * @returns Current week number (1-18 regular season)
 */
export const getCurrentNFLWeek = (): number => {
  const now = new Date();
  const year = now.getFullYear();
  
  // NFL season typically starts first week of September
  // This is an approximation - backend should provide actual week
  const seasonStart = new Date(year, 8, 1); // September 1st
  
  if (now < seasonStart) {
    // Before season starts, return week 1
    return 1;
  }
  
  const diffTime = Math.abs(now.getTime() - seasonStart.getTime());
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
  
  // Regular season is 18 weeks
  return Math.min(diffWeeks, 18);
};

/**
 * Get team display name
 * @param teamCode Team code like 'KC', 'SF'
 * @returns Full team name like "Kansas City Chiefs"
 */
export const getTeamDisplayName = (teamCode: NFLTeamCode): string => {
  const team = getTeamInfo(teamCode);
  return `${team.city} ${team.name}`;
};

/**
 * Get team short name
 * @param teamCode Team code like 'KC', 'SF'
 * @returns Team name like "Chiefs"
 */
export const getTeamShortName = (teamCode: NFLTeamCode): string => {
  const team = getTeamInfo(teamCode);
  return team.name;
};

/**
 * Calculate win percentage
 * @param wins Number of wins
 * @param losses Number of losses
 * @param ties Number of ties
 * @returns Win percentage as decimal (0-1)
 */
export const calculateWinPercentage = (
  wins: number,
  losses: number,
  ties: number
): number => {
  const totalGames = wins + losses + ties;
  if (totalGames === 0) return 0;
  
  // Ties count as half a win
  return (wins + ties * 0.5) / totalGames;
};

/**
 * Format win percentage for display
 * @param percentage Win percentage (0-1)
 * @returns Formatted string like ".750"
 */
export const formatWinPercentage = (percentage: number): string => {
  return percentage.toFixed(3);
};

/**
 * Validate email format
 * @param email Email string
 * @returns True if valid email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate username (alphanumeric, underscore, hyphen, 3-20 chars)
 * @param username Username string
 * @returns True if valid username
 */
export const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
};

/**
 * Validate password (minimum 6 characters)
 * @param password Password string
 * @returns True if valid password
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

/**
 * Truncate text with ellipsis
 * @param text Text to truncate
 * @param maxLength Maximum length
 * @returns Truncated text
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Get ordinal suffix for rank (1st, 2nd, 3rd, etc.)
 * @param rank Rank number
 * @returns Rank with ordinal suffix
 */
export const getRankWithOrdinal = (rank: number): string => {
  const j = rank % 10;
  const k = rank % 100;
  
  if (j === 1 && k !== 11) {
    return rank + 'st';
  }
  if (j === 2 && k !== 12) {
    return rank + 'nd';
  }
  if (j === 3 && k !== 13) {
    return rank + 'rd';
  }
  return rank + 'th';
};

/**
 * Calculate pick accuracy percentage
 * @param correctPicks Number of correct picks
 * @param totalPicks Total number of picks made
 * @returns Percentage as string like "75%"
 */
export const getPickAccuracy = (
  correctPicks: number,
  totalPicks: number
): string => {
  if (totalPicks === 0) return '0%';
  const percentage = (correctPicks / totalPicks) * 100;
  return `${percentage.toFixed(1)}%`;
};

/**
 * Sleep/delay function
 * @param ms Milliseconds to wait
 * @returns Promise that resolves after ms
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Debounce function
 * @param func Function to debounce
 * @param wait Wait time in ms
 * @returns Debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Get initials from username
 * @param username Username
 * @returns Initials (max 2 chars)
 */
export const getUserInitials = (username: string): string => {
  if (!username) return '??';
  
  const parts = username.split(/[\s_-]+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  
  return username.substring(0, 2).toUpperCase();
};

/**
 * Convert base64 to blob (for image upload)
 * @param base64 Base64 string
 * @returns Blob
 */
export const base64ToBlob = (base64: string): Blob => {
  const parts = base64.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);
  
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  
  return new Blob([uInt8Array], { type: contentType });
};

/**
 * Generate random invite code (for demo/testing)
 * @returns Random 6-char code
 */
export const generateRandomCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};
