import axios from 'axios';

const ESPN_API_BASE = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl';

export interface NFLTeam {
  id: string;
  displayName: string;
  logo: string;
  abbreviation: string;
}

/**
 * Obtiene todos los equipos de la NFL con sus logos desde ESPN
 */
export const getNFLTeams = async (): Promise<NFLTeam[]> => {
  try {
    const response = await axios.get(`${ESPN_API_BASE}/teams`);
    
    if (response.data?.sports?.[0]?.leagues?.[0]?.teams) {
      const teams = response.data.sports[0].leagues[0].teams;
      
      return teams.map((teamObj: any) => {
        const team = teamObj.team;
        return {
          id: team.id,
          displayName: team.displayName,
          abbreviation: team.abbreviation,
          logo: team.logos?.[0]?.href || team.logo || '',
        };
      });
    }
    
    return [];
  } catch (error) {
    console.error('Error obteniendo equipos NFL:', error);
    return [];
  }
};

/**
 * Obtiene logos de equipos para mostrar en el splash screen
 * Devuelve un array de URLs de logos
 */
export const getTeamLogosForSplash = async (): Promise<string[]> => {
  const teams = await getNFLTeams();
  
  // Filtrar equipos con logos válidos y mezclar aleatoriamente
  const logosWithValid = teams
    .filter(team => team.logo && team.logo.startsWith('http'))
    .map(team => team.logo);
  
  // Mezclar array aleatoriamente
  return logosWithValid.sort(() => Math.random() - 0.5);
};
