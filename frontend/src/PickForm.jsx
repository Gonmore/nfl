import React, { useState, useEffect } from 'react';
import { makePicks, getGamesByWeek, getUserPicks, getStandings } from './api';
import { teamLogos } from './teamLogos';

// Estilos responsivos para móviles
const mobileStyles = `
  @media (max-width: 359px) {
    .games-grid {
      grid-template-columns: 1fr !important;
    }
  }
  
  @media (max-width: 480px) {
    .pick-form-container {
      padding: 4px !important;
    }
    
    .games-grid {
      gap: 8px !important;
    }
    
    .game-card {
      padding: 4px 3px !important;
      gap: 4px !important;
    }
    
    .team-logos-container {
      gap: 3px !important;
      justifyContent: center !important;
    }
    
    .team-logo {
      width: 50px !important;
      height: 50px !important;
    }
    
    .team-logo img {
      width: 46px !important;
      height: 46px !important;
    }
    
    .vs-text {
      font-size: 14px !important;
    }
    
    .records-container {
      gap: 6px !important;
    }
    
    .record-text {
      font-size: 9px !important;
      min-width: 14px !important;
    }
    
    .submit-button {
      font-size: 14px !important;
      padding: 6px 10px !important;
    }
    
    .message-box {
      font-size: 14px !important;
      padding: 8px 10px !important;
    }
  }
  
  @media (max-width: 359px) {
    .pick-form-container {
      padding: 3px !important;
    }
    
    .games-grid {
      gap: 2px !important;
    }
    
    .game-card {
      padding: 3px 1px !important;
    }
    
    .team-logos-container {
      gap: 1px !important;
      justifyContent: center !important;
    }
    
    .team-logo {
      width: 50px !important;
      height: 50px !important;
    }
    
    .team-logo img {
      width: 46px !important;
      height: 46px !important;
    }
    
    .vs-text {
      font-size: 5px !important;
    }
    
    .records-container {
      gap: 1px !important;
    }
    
    .record-text {
      font-size: 4px !important;
      min-width: 12px !important;
    }
    
    .submit-button {
      font-size: 7px !important;
      padding: 5px 8px !important;
    }
    
    .message-box {
      font-size: 7px !important;
      padding: 5px 6px !important;
    }
  }
`;

// Inyectar estilos CSS
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = mobileStyles;
  document.head.appendChild(styleSheet);
}

export default function PickForm({ games, token, leagueId, week, currentWeek }) {
  const [picks, setPicks] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [nextWeekGames, setNextWeekGames] = useState([]);
  const [nextWeek, setNextWeek] = useState(null);
  const [teamRecords, setTeamRecords] = useState({});
  const [recordsLoading, setRecordsLoading] = useState(true);

  // Calcular fecha límite: inicio del primer partido de la semana
  const deadline = games.length > 0 ? new Date(Math.min(...games.map(g => new Date(g.date).getTime()))) : null;
  const now = new Date();
  const isDeadlinePassed = deadline && now > deadline;

  console.log('[DEBUG] PickForm - Current state:');
  console.log('[DEBUG] PickForm - week:', week);
  console.log('[DEBUG] PickForm - currentWeek:', currentWeek);
  console.log('[DEBUG] PickForm - games.length:', games.length);
  console.log('[DEBUG] PickForm - deadline:', deadline);
  console.log('[DEBUG] PickForm - now:', now);
  console.log('[DEBUG] PickForm - isDeadlinePassed:', isDeadlinePassed);

  // Detectar si estamos en horario de jornada en juego (jueves 20:00 a lunes 23:59)
  const isDuringGameWeek = () => {
    if (!deadline) return false;
    
    const dayOfWeek = now.getDay(); // 0=domingo, 4=jueves, 1=lunes
    const hour = now.getHours();
    
    // Jueves después de las 20:00
    if (dayOfWeek === 4 && hour >= 20) return true;
    // Viernes, sábado, domingo
    if (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) return true;
    // Lunes antes de las 24:00
    if (dayOfWeek === 1) return true;
    
    return false;
  };

  const duringGameWeek = isDuringGameWeek();

  console.log('[DEBUG] PickForm - duringGameWeek:', duringGameWeek);

  // Si estamos en horario de jornada y no hemos pasado la fecha límite y estamos en la semana actual, mostrar mensaje
  if (duringGameWeek && !isDeadlinePassed && week === currentWeek) {
    return (
      <div className="card" style={{
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        border: '3px solid #004B9B',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
        backdropFilter: 'blur(10px)'
      }}>
        <div className="card-body">
          <div style={{
            textAlign: 'center',
            marginBottom: '24px'
          }}>
            <div style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#E53E3E',
              marginBottom: '8px'
            }}>
              ⏰ Jornada en Juego
            </div>
            <p style={{
              color: '#4A5568',
              margin: '0'
            }}>
              La semana {week} está en curso. Las opciones de visualización están disponibles desde el menú principal de ligas.
            </p>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (isDeadlinePassed) {
      // Buscar partidos de la siguiente semana
      const fetchNextWeekGames = async () => {
        const nextWeekNum = week + 1;
        setNextWeek(nextWeekNum);
        console.log('[DEBUG] PickForm - Fetching games for week:', nextWeekNum);
        try {
          const data = await getGamesByWeek(token, nextWeekNum);
          console.log('[DEBUG] PickForm - Games received:', data.games);
          setNextWeekGames(data.games || []);
        } catch (err) {
          console.error('[DEBUG] PickForm - Error fetching games:', err);
          setNextWeekGames([]);
        }
      };
      fetchNextWeekGames();
    }
  }, [isDeadlinePassed, games, week, token]);

  // Cargar picks existentes del usuario
  useEffect(() => {
    const loadExistingPicks = async () => {
      try {
        const currentWeek = isDeadlinePassed ? nextWeek : week;
        if (currentWeek && token && leagueId) {
          const data = await getUserPicks(token, leagueId, currentWeek);
          if (data.picks && data.picks.length > 0) {
            const existingPicks = {};
            data.picks.forEach(pick => {
              existingPicks[pick.gameId] = pick.pick;
            });
            setPicks(existingPicks);
          }
        }
      } catch (error) {
        console.error('Error loading existing picks:', error);
      }
    };

    loadExistingPicks();

    // Load team records
    const loadStandings = async () => {
      try {
        const standingsRes = await getStandings(token);
        const records = {};
        standingsRes.standings.forEach(team => {
          records[team.name] = team.winPercentage;
        });
        setTeamRecords(records);
        setRecordsLoading(false);
      } catch (error) {
        console.error('Error loading standings:', error);
        setRecordsLoading(false);
      }
    };
    loadStandings();
  }, [token, leagueId, week, isDeadlinePassed, nextWeek]);

  const handlePick = (gameId, team) => {
    setPicks({ ...picks, [gameId]: team });
    // Limpiar mensaje de error cuando el usuario hace un pick
    if (message) setMessage('');
  };

  // Verificar si todos los picks están completos
  const areAllPicksComplete = () => {
    const currentGames = isDeadlinePassed ? nextWeekGames : games;
    return currentGames.length > 0 && currentGames.every(game => picks[game.id]);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Obtener los partidos actuales
    const currentGames = isDeadlinePassed ? nextWeekGames : games;

    // Verificar que se hayan hecho picks para todos los partidos
    const missingPicks = currentGames.filter(game => !picks[game.id]);
    if (missingPicks.length > 0) {
      setMessage(`Debes seleccionar un equipo para todos los partidos. Faltan ${missingPicks.length} pick(s).`);
      setLoading(false);
      return;
    }

    const picksArr = currentGames.filter(g => picks[g.id]).map(g => ({ gameId: g.id, pick: picks[g.id], week: isDeadlinePassed ? nextWeek : week }));
    const res = await makePicks(token, leagueId, picksArr);
    setMessage(res.message || 'Picks enviados');
    setLoading(false);
  };

  if (isDeadlinePassed && week === currentWeek) {
    return (
      <div className="card" style={{
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        border: '3px solid #004B9B',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
        backdropFilter: 'blur(10px)'
      }}>
        <div className="card-body">
          <div style={{
            textAlign: 'center',
            marginBottom: '24px'
          }}>
            <div style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#E53E3E',
              marginBottom: '8px'
            }}>
              ⏰ Fecha límite pasada
            </div>
            <p style={{
              color: '#4A5568',
              margin: '0'
            }}>
              La fecha límite para elegir picks de esta semana ya pasó.<br />
              Puedes hacer tus picks para la siguiente semana.
            </p>
          </div>

          {nextWeekGames.length > 0 ? (
            <form onSubmit={handleSubmit}>
              <h3 style={{
                color: 'white',
                textAlign: 'center',
                marginBottom: '20px',
                background: 'linear-gradient(135deg, #004B9B 0%, #0066CC 100%)',
                padding: '12px 20px',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: '700'
              }}>
                🎯 Haz tus picks para la semana {nextWeek}
              </h3>

              <div className="games-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px',
                marginBottom: '20px'
              }}>
                {nextWeekGames.map(game => (
                  <div key={game.id} className="game-card" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '6px 5px',
                    backgroundColor: 'rgba(0, 44, 95, 0.05)',
                    borderRadius: '12px',
                    border: '2px solid rgba(0, 75, 155, 0.2)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    gap: '4px',
                    minHeight: '80px'
                  }}>
                    <div className="team-logos-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                        <div className="team-logo" style={{
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          width: '50px',
                          height: '50px',
                          margin: 0
                        }}>
                          <input
                            type="radio"
                            name={`game-${game.id}`}
                            checked={picks[game.id] === game.awayTeam}
                            onChange={() => handlePick(game.id, game.awayTeam)}
                            disabled={loading}
                            style={{
                              position: 'absolute',
                              opacity: 0,
                              width: '100%',
                              height: '100%',
                              margin: 0,
                              cursor: 'pointer'
                            }}
                          />
                          <img
                            src={teamLogos[game.awayTeam]}
                            alt={game.awayTeam}
                            style={{
                              width: '46px',
                              height: '46px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              cursor: 'pointer',
                              border: picks[game.id] === game.awayTeam ? '3px solid #004B9B' : '3px solid transparent',
                              boxShadow: picks[game.id] === game.awayTeam ? '0 0 0 2px rgba(0, 75, 155, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.15)',
                              transition: 'all 0.2s ease',
                              margin: 0
                            }}
                          />
                        </div>
                        <div className="record-text" style={{ fontSize: '10px', fontWeight: '600', minWidth: '35px', textAlign: 'center' }}>
                          {recordsLoading ? (
                            <span style={{ color: 'gray' }}>...</span>
                          ) : (
                            <>
                              <span style={{ color: 'green' }}>{(teamRecords[game.awayTeam] || '0-0-0').split('-')[0]}</span> / <span style={{ color: 'red' }}>{(teamRecords[game.awayTeam] || '0-0-0').split('-')[1]}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="vs-text" style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: 'white'
                      }}>
                        -
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                        <div className="team-logo" style={{
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          width: '50px',
                          height: '50px',
                          margin: 0
                        }}>
                          <input
                            type="radio"
                            name={`game-${game.id}`}
                            checked={picks[game.id] === game.homeTeam}
                            onChange={() => handlePick(game.id, game.homeTeam)}
                            disabled={loading}
                            style={{
                              position: 'absolute',
                              opacity: 0,
                              width: '100%',
                              height: '100%',
                              margin: 0,
                              cursor: 'pointer'
                            }}
                          />
                          <img
                            src={teamLogos[game.homeTeam]}
                            alt={game.homeTeam}
                            style={{
                              width: '46px',
                              height: '46px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              cursor: 'pointer',
                              border: picks[game.id] === game.homeTeam ? '3px solid #004B9B' : '3px solid transparent',
                              boxShadow: picks[game.id] === game.homeTeam ? '0 0 0 2px rgba(0, 75, 155, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.15)',
                              transition: 'all 0.2s ease',
                              margin: 0
                            }}
                          />
                        </div>
                        <div className="record-text" style={{ fontSize: '10px', fontWeight: '600', minWidth: '35px', textAlign: 'center' }}>
                          {recordsLoading ? (
                            <span style={{ color: 'gray' }}>...</span>
                          ) : (
                            <>
                              <span style={{ color: 'green' }}>{(teamRecords[game.homeTeam] || '0-0-0').split('-')[0]}</span> / <span style={{ color: 'red' }}>{(teamRecords[game.homeTeam] || '0-0-0').split('-')[1]}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>              <div style={{ textAlign: 'center' }}>
                <button
                  type="submit"
                  disabled={loading}
                  className={`smart-submit-btn submit-button ${!areAllPicksComplete() ? 'incomplete-picks' : ''}`}
                >
                  {loading ? (
                    <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '3px' }}></div>
                  ) : !areAllPicksComplete() ? (
                    '🚨'
                  ) : (
                    '⚡'
                  )}
                  {loading ? 'Enviando...' : !areAllPicksComplete() ? 'FALTAN PICKS' : 'Enviar Picks'}
                </button>

                {message && (
                  <div className="message-box" style={{
                    marginTop: '20px',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    backgroundColor: message.includes('correctamente') ? 'var(--success-color)' : 'white',
                    color: message.includes('correctamente') ? 'white' : '#004B9B',
                    fontWeight: '600',
                    fontSize: '16px',
                    textAlign: 'center',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                    border: message.includes('correctamente') ? 'none' : '2px solid #FFD700',
                    animation: message.includes('correctamente') ? 'none' : 'shake 0.5s ease-in-out'
                  }}>
                    {message.includes('correctamente') ? '✅ ' : '🚨 '}{message}
                  </div>
                )}
              </div>
            </form>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '24px',
              color: 'var(--text-secondary)'
            }}>
              <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                📅 No hay partidos disponibles para la siguiente semana.
              </div>
              <div style={{ fontSize: '14px' }}>
                Vuelve pronto para hacer tus picks.
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="card pick-form-container">
      <div className="card-header">
        <h2 style={{ margin: 0, fontSize: '20px', color: 'white' }}>🎯 Haz tus picks - Semana {week}</h2>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="games-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            marginBottom: '20px'
          }}>
            {games.map(game => {
              return (
              <div key={game.id} className="game-card" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 5px',
                backgroundColor: 'rgba(0, 44, 95, 0.05)',
                borderRadius: '12px',
                border: '2px solid rgba(0, 75, 155, 0.2)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                gap: '4px',
                minHeight: '80px'
              }}>
                <div className="team-logos-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                    <div className="team-logo" style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      width: '50px',
                      height: '50px',
                      margin: 0
                    }}>
                      <input
                        type="radio"
                        name={`game-${game.id}`}
                        checked={picks[game.id] === game.awayTeam}
                        onChange={() => handlePick(game.id, game.awayTeam)}
                        disabled={loading}
                        style={{
                          position: 'absolute',
                          opacity: 0,
                          width: '100%',
                          height: '100%',
                          margin: 0,
                          cursor: 'pointer'
                        }}
                      />
                      <img
                        src={teamLogos[game.awayTeam]}
                        alt={game.awayTeam}
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          cursor: 'pointer',
                          border: picks[game.id] === game.awayTeam ? '3px solid #004B9B' : '3px solid transparent',
                          boxShadow: picks[game.id] === game.awayTeam ? '0 0 0 2px rgba(0, 75, 155, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.15)',
                          transition: 'all 0.2s ease',
                          margin: 0
                        }}
                      />
                    </div>
                    <div className="record-text" style={{ fontSize: '10px', fontWeight: '600', minWidth: '35px', textAlign: 'center' }}>
                      {recordsLoading ? (
                        <span style={{ color: 'gray' }}>...</span>
                      ) : (
                        <>
                          <span style={{ color: 'green' }}>{(teamRecords[game.awayTeam] || '0-0-0').split('-')[0]}</span> / <span style={{ color: 'red' }}>{(teamRecords[game.awayTeam] || '0-0-0').split('-')[1]}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="vs-text" style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: 'white'
                  }}>
                    -
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                    <div className="team-logo" style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      width: '50px',
                      height: '50px',
                      margin: 0
                    }}>
                      <input
                        type="radio"
                        name={`game-${game.id}`}
                        checked={picks[game.id] === game.homeTeam}
                        onChange={() => handlePick(game.id, game.homeTeam)}
                        disabled={loading}
                        style={{
                          position: 'absolute',
                          opacity: 0,
                          width: '100%',
                          height: '100%',
                          margin: 0,
                          cursor: 'pointer'
                        }}
                      />
                      <img
                        src={teamLogos[game.homeTeam]}
                        alt={game.homeTeam}
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          cursor: 'pointer',
                          border: picks[game.id] === game.homeTeam ? '3px solid #004B9B' : '3px solid transparent',
                          boxShadow: picks[game.id] === game.homeTeam ? '0 0 0 2px rgba(0, 75, 155, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.15)',
                          transition: 'all 0.2s ease',
                          margin: 0
                        }}
                      />
                    </div>
                    <div className="record-text" style={{ fontSize: '10px', fontWeight: '600', minWidth: '35px', textAlign: 'center' }}>
                      {recordsLoading ? (
                        <span style={{ color: 'gray' }}>...</span>
                      ) : (
                        <>
                          <span style={{ color: 'green' }}>{(teamRecords[game.homeTeam] || '0-0-0').split('-')[0]}</span> / <span style={{ color: 'red' }}>{(teamRecords[game.homeTeam] || '0-0-0').split('-')[1]}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
            })}
          </div>

              <div style={{ textAlign: 'center' }}>
                <button
                  type="submit"
                  disabled={loading}
                  className={`smart-submit-btn submit-button ${!areAllPicksComplete() ? 'incomplete-picks' : ''}`}
                >
                  {loading ? (
                    <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '3px' }}></div>
                  ) : !areAllPicksComplete() ? (
                    '🚨'
                  ) : (
                    '⚡'
                  )}
                  {loading ? 'Enviando...' : !areAllPicksComplete() ? 'FALTAN PICKS' : 'Enviar Picks'}
                </button>

            {message && (
              <div className="message-box" style={{
                marginTop: '20px',
                padding: '16px 20px',
                borderRadius: '12px',
                backgroundColor: message.includes('correctamente') ? 'var(--success-color)' : 'white',
                color: message.includes('correctamente') ? 'white' : '#004B9B',
                fontWeight: '600',
                fontSize: '16px',
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                border: message.includes('correctamente') ? 'none' : '2px solid #FFD700',
                animation: message.includes('correctamente') ? 'none' : 'shake 0.5s ease-in-out'
              }}>
                {message.includes('correctamente') ? '✅ ' : '🚨 '}{message}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
