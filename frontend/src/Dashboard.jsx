import React, { useEffect, useState } from 'react';
import PickForm from './PickForm.jsx';
import LeagueStats from './LeagueStats.jsx';
import { getGames, getUserLeagues, createLeague, joinLeague, getStandings, joinGeneralLeague } from './api';

export default function Dashboard({ user, token }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [week, setWeek] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showInviteCode, setShowInviteCode] = useState(null);
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
      alert(res.message);
      if (res.league) {
        // Recargar ligas para mostrar la nueva
        const resLeagues = await getUserLeagues(token);
        setLeagues(resLeagues.leagues || []);
        // Retornar el código para mostrarlo en el formulario
        return res.league;
      }
    } catch (err) {
      alert('Error al crear liga');
      throw err;
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
        setShowJoinModal(false); // Cerrar modal
      }
    } catch (err) {
      alert('Error al unirse a liga');
    }
  };

  const handleJoinGeneralLeague = async () => {
    try {
      const res = await joinGeneralLeague(token);
      alert(res.message);
      if (res.message.includes('correctamente')) {
        // Recargar ligas
        const resLeagues = await getUserLeagues(token);
        setLeagues(resLeagues.leagues || []);
      }
    } catch (err) {
      console.error('Error joining general league:', err);
      alert('Error al unirse a Liga General.');
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
                  {league.isAdmin && (
                    <button 
                      onClick={() => setShowInviteCode(league)}
                      style={{ marginLeft: '5px', padding: '4px 8px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px' }}
                    >
                      Invitar
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
          <div style={{ marginTop: '20px' }}>
            <button onClick={() => setShowCreate(true)}>Crear Liga</button>
            <button onClick={() => setShowJoinModal(true)} style={{ marginLeft: '10px' }}>Unirse a Liga</button>
          </div>
          {showCreate && (
            <CreateLeagueForm onCreate={handleCreateLeague} onCancel={() => setShowCreate(false)} />
          )}
          {showInviteCode && (
            <InviteCodeModal 
              league={showInviteCode} 
              onClose={() => setShowInviteCode(null)} 
            />
          )}
          {showJoinModal && (
            <JoinLeagueModal 
              onJoin={handleJoinLeague} 
              onClose={() => setShowJoinModal(false)} 
            />
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
  const [description, setDescription] = useState('');
  const [createdCode, setCreatedCode] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await onCreate({ name, isPublic, description });
      if (result && result.inviteCode) {
        setCreatedCode(result.inviteCode);
      }
    } catch (error) {
      console.error('Error creating league:', error);
    }
  };

  if (createdCode) {
    return (
      <div>
        <h3>¡Liga Creada!</h3>
        <p>Tu liga "{name}" ha sido creada exitosamente.</p>
        <p><strong>Código de invitación:</strong> {createdCode}</p>
        <p>Comparte este código con tus amigos para que se unan a la liga.</p>
        <button onClick={() => { setCreatedCode(null); setName(''); setDescription(''); }}>Crear Otra Liga</button>
        <button onClick={onCancel}>Cerrar</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Crear Liga</h3>
      <input placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} required />
      <label>
        <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
        Pública
      </label>
      <textarea placeholder="Descripción" value={description} onChange={e => setDescription(e.target.value)} />
      <button type="submit">Crear</button>
      <button type="button" onClick={onCancel}>Cancelar</button>
    </form>
  );
}

// Componente modal para unirse a liga (responsive para móviles)
function JoinLeagueModal({ onJoin, onClose }) {
  const [inviteCode, setInviteCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onJoin({ inviteCode: inviteCode.toUpperCase() });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '24px',
        borderRadius: '12px',
        maxWidth: '400px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Unirse a Liga</h3>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
              padding: '0',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              color: '#333'
            }}>
              Código de invitación
            </label>
            <input
              type="text"
              placeholder="Ingresa el código de 8 caracteres"
              value={inviteCode}
              onChange={e => setInviteCode(e.target.value.toUpperCase())}
              required
              maxLength={8}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e1e5e9',
                borderRadius: '8px',
                fontSize: '16px',
                fontFamily: 'monospace',
                textTransform: 'uppercase',
                textAlign: 'center',
                letterSpacing: '2px',
                boxSizing: 'border-box'
              }}
              autoFocus
            />
            <p style={{
              margin: '8px 0 0 0',
              fontSize: '12px',
              color: '#666',
              textAlign: 'center'
            }}>
              El código tiene 8 caracteres alfanuméricos
            </p>
          </div>

          <div style={{
            display: 'flex',
            gap: '12px',
            flexDirection: window.innerWidth < 480 ? 'column' : 'row'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                background: '#6c757d',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '12px',
                background: '#0074D9',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Unirse a Liga
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Componente para mostrar código de invitación
function InviteCodeModal({ league, onClose }) {
  const handleCopyCode = () => {
    navigator.clipboard.writeText(league.inviteCode);
    alert('Código copiado al portapapeles!');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '400px',
        width: '90%'
      }}>
        <h3>Invitar a "{league.name}"</h3>
        <p>Comparte este código con tus amigos para que se unan a la liga:</p>
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '10px',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '18px',
          fontWeight: 'bold',
          textAlign: 'center',
          margin: '10px 0'
        }}>
          {league.inviteCode}
        </div>
        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
          <button 
            onClick={handleCopyCode}
            style={{
              padding: '8px 16px',
              background: '#0074D9',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Copiar Código
          </button>
        </div>
        <button 
          onClick={onClose}
          style={{
            width: '100%',
            padding: '8px',
            background: '#6c757d',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
