const axios = require('axios');
const { Op, fn } = require('sequelize');
const Game = require('../models/Game');
const League = require('../models/League');
const { calculateScores } = require('../controllers/statsController');

// Obtiene y guarda todos los partidos de todas las semanas en la BD
async function syncGamesForCurrentWeek() {
  // Guardar partidos de todas las semanas (1-18)
  for (let week = 1; week <= 18; week++) {
    const url = `${process.env.ESPN_API_URL}?week=${week}`;
    try {
      const response = await axios.get(url);
      const events = response.data.events || [];
      const games = [];
      for (const event of events) {
        const { id, name, competitions, date, status } = event;
        if (!competitions || competitions.length === 0) continue;
        const comp = competitions[0];
        const home = comp.competitors.find(t => t.homeAway === 'home');
        const away = comp.competitors.find(t => t.homeAway === 'away');
        const homeTeam = home.team.displayName;
        const awayTeam = away.team.displayName;
        let winner = null;
        // Si el partido está finalizado, compara los scores
        if (status.type.name === 'STATUS_FINAL') {
          const homeScore = parseInt(home.score, 10);
          const awayScore = parseInt(away.score, 10);
          if (!isNaN(homeScore) && !isNaN(awayScore)) {
            if (homeScore > awayScore) winner = homeTeam;
            else if (awayScore > homeScore) winner = awayTeam;
            // Si empate, winner queda null
          }
        }
        games.push({
          espnId: id,
          homeTeam,
          awayTeam,
          date,
          week,
          status: status.type.name,
          winner
        });
      }
      for (const g of games) {
        await Game.upsert(g, { where: { espnId: g.espnId } });
      }
    } catch (err) {
      console.error(`Error al sincronizar semana ${week}:`, err.message);
    }
  }

  // Recalcular scores para todas las ligas y semanas donde haya partidos finalizados
  await recalculateAllPendingScores();
}

// Obtiene standings de la NFL desde ESPN
async function getNFLStandings() {
  try {
    const url = `${process.env.ESPN_STANDINGS_URL}`;
    const response = await axios.get(url);
    const children = response.data.children || [];
    
    const standings = [];
    for (const conference of children) {
      const entries = conference.standings?.entries || [];
      for (const entry of entries) {
        const teamData = entry.team || {};
        const stats = entry.stats || [];
        
        // Buscar wins, losses, ties y playoffSeed en stats
        let wins = 0, losses = 0, ties = 0, playoffSeed = 999;
        for (const stat of stats) {
          if (stat.name === 'wins') wins = stat.value || 0;
          if (stat.name === 'losses') losses = stat.value || 0;
          if (stat.name === 'ties') ties = stat.value || 0;
          if (stat.name === 'playoffSeed') playoffSeed = stat.value || 999;
        }
        
        standings.push({
          id: teamData.id,
          name: teamData.displayName,
          abbreviation: teamData.abbreviation,
          logo: teamData.logos?.[0]?.href || `https://a.espncdn.com/i/teamlogos/nfl/500/${teamData.abbreviation?.toLowerCase()}.png`,
          conference: conference.name,
          wins,
          losses,
          ties,
          playoffSeed,
          winPercentage: `${wins}-${losses}-${ties}`
        });
      }
    }
    
    // Ordenar por playoff seed, luego por porcentaje de victorias
    standings.sort((a, b) => {
      // Primero por playoff seed (menor número = mejor posición)
      if (a.playoffSeed !== b.playoffSeed) {
        return a.playoffSeed - b.playoffSeed;
      }
      // Si tienen el mismo seed, por porcentaje de victorias
      const aPct = a.wins / (a.wins + a.losses + a.ties);
      const bPct = b.wins / (b.wins + b.losses + b.ties);
      return bPct - aPct;
    });
    
    return standings;
  } catch (error) {
    console.error('Error obteniendo standings:', error);
    throw error;
  }
}

// Obtiene partidos de la semana actual desde la BD
async function getGamesForCurrentWeek() {
  const now = new Date();
  // Buscar el partido más próximo y tomar su semana
  const nextGame = await Game.findOne({ where: { date: { [Op.gte]: now } }, order: [['date', 'ASC']] });
  let week;
  if (nextGame) {
    week = nextGame.week;
  } else {
    // Si no hay próximos, toma la última semana jugada
    week = await Game.max('week');
  }
  return await Game.findAll({ where: { week } });
}

// Recalcula scores para todas las ligas donde haya partidos finalizados recientemente
async function recalculateAllPendingScores() {
  try {
    // Obtener todas las ligas
    const leagues = await League.findAll();

    for (const league of leagues) {
      // Obtener todas las semanas que tienen partidos
      const weeksWithGames = await Game.findAll({
        attributes: [[fn('DISTINCT', Game.sequelize.col('week')), 'week']],
        raw: true
      });

      for (const weekObj of weeksWithGames) {
        const week = weekObj.week;
        // Verificar si hay partidos finalizados en esta semana
        const finishedGames = await Game.findAll({
          where: { week, status: 'STATUS_FINAL' }
        });

        if (finishedGames.length > 0) {
          // Recalcular scores para esta liga y semana
          await calculateScores(league.id, week);
          console.log(`Scores recalculados para liga ${league.id}, semana ${week}`);
        }
      }
    }
  } catch (error) {
    console.error('Error recalculando scores:', error);
  }
}

module.exports = { syncGamesForCurrentWeek, getGamesForCurrentWeek, getNFLStandings, recalculateAllPendingScores };
