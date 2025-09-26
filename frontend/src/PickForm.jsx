import React, { useState, useEffect } from 'react';
import { makePicks, getGamesByWeek } from './api';

// Logos de equipos NFL (usando ESPN)
const teamLogos = {
  "Arizona Cardinals": "https://a.espncdn.com/i/teamlogos/nfl/500/ari.png",
  "Atlanta Falcons": "https://a.espncdn.com/i/teamlogos/nfl/500/atl.png",
  "Baltimore Ravens": "https://a.espncdn.com/i/teamlogos/nfl/500/bal.png",
  "Buffalo Bills": "https://a.espncdn.com/i/teamlogos/nfl/500/buf.png",
  "Carolina Panthers": "https://a.espncdn.com/i/teamlogos/nfl/500/car.png",
  "Chicago Bears": "https://a.espncdn.com/i/teamlogos/nfl/500/chi.png",
  "Cincinnati Bengals": "https://a.espncdn.com/i/teamlogos/nfl/500/cin.png",
  "Cleveland Browns": "https://a.espncdn.com/i/teamlogos/nfl/500/cle.png",
  "Dallas Cowboys": "https://a.espncdn.com/i/teamlogos/nfl/500/dal.png",
  "Denver Broncos": "https://a.espncdn.com/i/teamlogos/nfl/500/den.png",
  "Detroit Lions": "https://a.espncdn.com/i/teamlogos/nfl/500/det.png",
  "Green Bay Packers": "https://a.espncdn.com/i/teamlogos/nfl/500/gb.png",
  "Houston Texans": "https://a.espncdn.com/i/teamlogos/nfl/500/hou.png",
  "Indianapolis Colts": "https://a.espncdn.com/i/teamlogos/nfl/500/ind.png",
  "Jacksonville Jaguars": "https://a.espncdn.com/i/teamlogos/nfl/500/jax.png",
  "Kansas City Chiefs": "https://a.espncdn.com/i/teamlogos/nfl/500/kc.png",
  "Las Vegas Raiders": "https://a.espncdn.com/i/teamlogos/nfl/500/lv.png",
  "Los Angeles Chargers": "https://a.espncdn.com/i/teamlogos/nfl/500/lac.png",
  "Los Angeles Rams": "https://a.espncdn.com/i/teamlogos/nfl/500/lar.png",
  "Miami Dolphins": "https://a.espncdn.com/i/teamlogos/nfl/500/mia.png",
  "Minnesota Vikings": "https://a.espncdn.com/i/teamlogos/nfl/500/min.png",
  "New England Patriots": "https://a.espncdn.com/i/teamlogos/nfl/500/ne.png",
  "New Orleans Saints": "https://a.espncdn.com/i/teamlogos/nfl/500/no.png",
  "New York Giants": "https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png",
  "New York Jets": "https://a.espncdn.com/i/teamlogos/nfl/500/nyj.png",
  "Philadelphia Eagles": "https://a.espncdn.com/i/teamlogos/nfl/500/phi.png",
  "Pittsburgh Steelers": "https://a.espncdn.com/i/teamlogos/nfl/500/pit.png",
  "San Francisco 49ers": "https://a.espncdn.com/i/teamlogos/nfl/500/sf.png",
  "Seattle Seahawks": "https://a.espncdn.com/i/teamlogos/nfl/500/sea.png",
  "Tampa Bay Buccaneers": "https://a.espncdn.com/i/teamlogos/nfl/500/tb.png",
  "Tennessee Titans": "https://a.espncdn.com/i/teamlogos/nfl/500/ten.png",
  "Washington Commanders": "https://a.espncdn.com/i/teamlogos/nfl/500/wsh.png",
};

export default function PickForm({ games, token, leagueId, week }) {
  const [picks, setPicks] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [nextWeekGames, setNextWeekGames] = useState([]);
  const [nextWeek, setNextWeek] = useState(null);

  // Calcular fecha límite: inicio del primer partido de la semana
  const deadline = games.length > 0 ? new Date(Math.min(...games.map(g => new Date(g.date).getTime()))) : null;
  const now = new Date();
  const isDeadlinePassed = deadline && now > deadline;

  useEffect(() => {
    if (isDeadlinePassed && games.length > 0) {
      // Buscar partidos de la siguiente semana
      const fetchNextWeekGames = async () => {
        const nextWeekNum = week + 1;
        setNextWeek(nextWeekNum);
        try {
          const data = await getGamesByWeek(token, nextWeekNum);
          setNextWeekGames(data.games || []);
        } catch (err) {
          setNextWeekGames([]);
        }
      };
      fetchNextWeekGames();
    }
  }, [isDeadlinePassed, games, week, token]);

  const handlePick = (gameId, team) => {
    setPicks({ ...picks, [gameId]: team });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const picksArr = (isDeadlinePassed ? nextWeekGames : games).filter(g => picks[g.id]).map(g => ({ gameId: g.id, pick: picks[g.id], week: isDeadlinePassed ? nextWeek : week }));
    const res = await makePicks(token, leagueId, picksArr);
    setMessage(res.message || 'Picks enviados');
    setLoading(false);
  };

  if (isDeadlinePassed) {
    return (
      <div style={{ marginTop: 24, color: 'red', fontWeight: 'bold' }}>
        La fecha límite para elegir picks de esta semana ya pasó.<br />
        Puedes hacer tus picks para la siguiente semana.<br />
        {nextWeekGames.length > 0 ? (
          <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
            <h3>Haz tus picks para la semana {nextWeek}</h3>
            {nextWeekGames.map(game => (
              <div key={game.id} style={{ marginBottom: 12, display: 'flex', alignItems: 'center' }}>
                <img src={teamLogos[game.awayTeam]} alt={game.awayTeam} style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: 8 }} />
                <label style={{ marginRight: 16 }}>
                  <input
                    type="checkbox"
                    checked={picks[game.id] === game.awayTeam}
                    onChange={() => handlePick(game.id, game.awayTeam)}
                    disabled={loading}
                  />
                  {game.awayTeam}
                </label>
                <span style={{ margin: '0 8px' }}>vs</span>
                <label style={{ marginRight: 16 }}>
                  <input
                    type="checkbox"
                    checked={picks[game.id] === game.homeTeam}
                    onChange={() => handlePick(game.id, game.homeTeam)}
                    disabled={loading}
                  />
                  {game.homeTeam}
                </label>
                <img src={teamLogos[game.homeTeam]} alt={game.homeTeam} style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
              </div>
            ))}
            <button type="submit" disabled={loading}>Enviar picks</button>
            {message && <div style={{ marginTop: 12, color: 'green' }}>{message}</div>}
          </form>
        ) : (
          <div style={{ marginTop: 12 }}>No hay partidos disponibles para la siguiente semana.</div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
      <h3>Haz tus picks</h3>
      {games.map(game => (
        <div key={game.id} style={{ marginBottom: 12, display: 'flex', alignItems: 'center' }}>
          <img src={teamLogos[game.awayTeam]} alt={game.awayTeam} style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: 8 }} />
          <label style={{ marginRight: 16 }}>
            <input
              type="checkbox"
              checked={picks[game.id] === game.awayTeam}
              onChange={() => handlePick(game.id, game.awayTeam)}
              disabled={loading}
            />
            {game.awayTeam}
          </label>
          <span style={{ margin: '0 8px' }}>vs</span>
          <label style={{ marginRight: 16 }}>
            <input
              type="checkbox"
              checked={picks[game.id] === game.homeTeam}
              onChange={() => handlePick(game.id, game.homeTeam)}
              disabled={loading}
            />
            {game.homeTeam}
          </label>
          <img src={teamLogos[game.homeTeam]} alt={game.homeTeam} style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
        </div>
      ))}
      <button type="submit" disabled={loading} style={{ marginTop: 16, padding: 8, background: '#0074D9', color: '#fff', border: 'none', borderRadius: 4 }}>
        Enviar picks
      </button>
      {message && <div style={{ marginTop: 10, color: 'green' }}>{message}</div>}
    </form>
  );
}
