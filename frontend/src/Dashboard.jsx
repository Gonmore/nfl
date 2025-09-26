import React, { useEffect, useState } from 'react';
import PickForm from './PickForm.jsx';
import LeagueStats from './LeagueStats.jsx';
import { getGames, getUserLeagues, createLeague, joinLeague, getStandings } from './api';

export default function Dashboard({ user, token }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [week, setWeek] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [standings, setStandings] = useState([]);
  const [previousPositions, setPreviousPositions] = useState({});

  // Obtiene ligas del usuario
  useEffect(() => {
    async function fetchLeagues() {
      try {
        const res = await getUserLeagues(token);
        console.log('Ligas obtenidas:', res);
        setLeagues(res.leagues || []);
      } catch (err) {
        console.error('Error al cargar ligas:', err);
        setError('Error al cargar ligas');
      }
    }
    fetchLeagues();
  }, [token]);

  // Obtiene standings de la NFL
  useEffect(() => {
    async function fetchStandings() {
      try {
        const res = await getStandings(token);
        const newStandings = res.standings || [];
        
        // Calcular cambios de posición
        const newPositions = {};
        newStandings.forEach((team, index) => {
          newPositions[team.id] = index + 1;
        });
        
        // Comparar con posiciones anteriores
        const standingsWithChanges = newStandings.map((team, index) => {
          const currentPos = index + 1;
          const previousPos = previousPositions[team.id];
          let change = 0;
          if (previousPos !== undefined) {
            change = previousPos - currentPos; // Positivo = subió, negativo = bajó
          }
          return { ...team, position: currentPos, change };
        });
        
        setStandings(standingsWithChanges);
        setPreviousPositions(newPositions);
      } catch (err) {
        console.error('Error al cargar standings:', err);
      }
    }
    
    fetchStandings();
    // Actualizar cada 10 minutos
    const interval = setInterval(fetchStandings, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [token]); // Removida la dependencia previousPositions para evitar loop infinito

  // Obtiene partidos
  useEffect(() => {
    async function fetchGames() {
      setLoading(true);
      setError('');
      try {
        const res = await getGames(token);
        setGames(res.games || []);
        const now = new Date();
        let currentWeek = null;
        if (res.games && res.games.length > 0) {
          const nextGame = res.games.find(g => new Date(g.date) >= now);
          if (nextGame) {
            currentWeek = nextGame.week;
          } else {
            currentWeek = Math.max(...res.games.map(g => g.week));
          }
        }
        setWeek(currentWeek);
      } catch (err) {
        setError('Error al cargar juegos');
      }
      setLoading(false);
    }
    fetchGames();
  }, [token]);

  const handleCreateLeague = async (leagueData) => {
    try {
      const res = await createLeague(token, leagueData);
      if (res.league) {
        setLeagues([...leagues, res.league]);
        setShowCreate(false);
      } else {
        alert(res.message);
      }
    } catch (err) {
      alert('Error al crear liga');
    }
  };

  const handleJoinLeague = async (joinData) => {
    try {
      const res = await joinLeague(token, joinData);
      alert(res.message);
      if (res.message.includes('correctamente')) {
        // Recargar ligas
        const resLeagues = await getUserLeagues(token);
        setLeagues(resLeagues.leagues || []);
        setShowJoin(false);
      }
    } catch (err) {
      alert('Error al unirse a liga');
    }
  };

  const handleJoinGeneralLeague = async () => {
    try {
      // Buscar todas las ligas del usuario para ver si ya está en la general
      const userLeaguesRes = await getUserLeagues(token);
      const userLeagues = userLeaguesRes.leagues || [];
      
      // Verificar si ya está en la liga general
      const alreadyInGeneral = userLeagues.some(l => l.name === 'Liga general');
      if (alreadyInGeneral) {
        alert('Ya eres miembro de la Liga General.');
        return;
      }
      
      // Intentar unirse con ID 1 (la liga general se crea primero)
      const res = await joinLeague(token, { leagueId: 1 });
      alert(res.message);
      if (res.message.includes('correctamente')) {
        // Recargar ligas
        const resLeagues = await getUserLeagues(token);
        setLeagues(resLeagues.leagues || []);
      }
    } catch (err) {
      console.error('Error joining general league:', err);
      alert('Error al unirse a Liga General. La liga puede no existir aún.');
    }
  };

  const filteredGames = games.filter(g => g.week === week);

  if (!selectedLeague) {
    return (
      <div style={{ display: 'flex', gap: '32px', padding: '20px' }}>
        {/* Sección de Ligas */}
        <div style={{ flex: 1 }}>
          <h2>Bienvenido, {user?.username || user?.email || 'Usuario'}!</h2>
          <h3>Tus Ligas</h3>
          {leagues.length === 0 ? (
            <div style={{ color: '#666', fontStyle: 'italic', marginBottom: '16px' }}>
              No tienes ligas. Únete a la "Liga general" o crea una nueva.
              <button 
                onClick={handleJoinGeneralLeague}
                style={{ marginLeft: '10px', padding: '4px 8px', background: '#0074D9', color: '#fff', border: 'none', borderRadius: '4px' }}
              >
                Unirse a Liga General
              </button>
            </div>
          ) : (
            <ul>
              {leagues.map(league => (
                <li key={league.id} style={{ marginBottom: '8px' }}>
                  {league.name} ({league.isPublic ? 'Pública' : 'Privada'})
                  <button 
                    onClick={() => setSelectedLeague(league)}
                    style={{ marginLeft: '10px', padding: '4px 8px' }}
                  >
                    Seleccionar
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div style={{ marginTop: '20px' }}>
            <button onClick={() => setShowCreate(true)}>Crear Liga</button>
            <button onClick={() => setShowJoin(true)} style={{ marginLeft: '10px' }}>Unirse a Liga</button>
          </div>
          {showCreate && (
            <CreateLeagueForm onCreate={handleCreateLeague} onCancel={() => setShowCreate(false)} />
          )}
          {showJoin && (
            <JoinLeagueForm onJoin={handleJoinLeague} onCancel={() => setShowJoin(false)} />
          )}
        </div>

        {/* Sección de Standings NFL */}
        <div style={{ flex: 1 }}>
          <h3>Standings NFL</h3>
          <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #ccc', borderRadius: '4px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f5f5f5' }}>
                <tr>
                  <th style={{ borderBottom: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>Pos</th>
                  <th style={{ borderBottom: '1px solid #ccc', padding: '8px' }}>Equipo</th>
                  <th style={{ borderBottom: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>Récord</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((team) => (
                  <tr key={team.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                      {team.position}
                      {team.change !== 0 && (
                        <span style={{ marginLeft: '4px', color: team.change > 0 ? '#28a745' : '#dc3545' }}>
                          {team.change > 0 ? '↑' : '↓'}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '8px', display: 'flex', alignItems: 'center' }}>
                      <img 
                        src={team.logo} 
                        alt={team.abbreviation} 
                        style={{ 
                          width: '24px', 
                          height: '24px', 
                          borderRadius: '50%', 
                          marginRight: '8px',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          // Fallback si la imagen no carga
                          e.target.src = `https://a.espncdn.com/i/teamlogos/nfl/500/${team.abbreviation.toLowerCase()}.png`;
                        }}
                      />
                      <span style={{ fontSize: '14px' }}>{team.abbreviation}</span>
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center', fontSize: '14px' }}>
                      {team.winPercentage}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
            ↑ Subió de posición • ↓ Bajó de posición • Actualización automática cada 10 min
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2>Liga: {selectedLeague.name}</h2>
      <button onClick={() => setSelectedLeague(null)}>Cambiar Liga</button>
      {loading ? (
        <div>Cargando juegos...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : (
        <PickForm games={filteredGames} token={token} leagueId={selectedLeague.id} week={week} />
      )}
      {selectedLeague && week ? (
        <LeagueStats token={token} leagueId={selectedLeague.id} week={week} />
      ) : (
        <div style={{ color: 'gray' }}>Cargando estadísticas...</div>
      )}
    </div>
  );
}

// Componente para crear liga
function CreateLeagueForm({ onCreate, onCancel }) {
  const [name, setName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate({ name, isPublic, inviteCode: isPublic ? null : inviteCode, description });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Crear Liga</h3>
      <input placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} required />
      <label>
        <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
        Pública
      </label>
      {!isPublic && <input placeholder="Código de invitación" value={inviteCode} onChange={e => setInviteCode(e.target.value)} required />}
      <textarea placeholder="Descripción" value={description} onChange={e => setDescription(e.target.value)} />
      <button type="submit">Crear</button>
      <button type="button" onClick={onCancel}>Cancelar</button>
    </form>
  );
}

// Componente para unirse a liga
function JoinLeagueForm({ onJoin, onCancel }) {
  const [leagueId, setLeagueId] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onJoin({ leagueId: parseInt(leagueId), inviteCode });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Unirse a Liga</h3>
      <input placeholder="ID de Liga" value={leagueId} onChange={e => setLeagueId(e.target.value)} required />
      <input placeholder="Código de invitación (si privada)" value={inviteCode} onChange={e => setInviteCode(e.target.value)} />
      <button type="submit">Unirse</button>
      <button type="button" onClick={onCancel}>Cancelar</button>
    </form>
  );
}
