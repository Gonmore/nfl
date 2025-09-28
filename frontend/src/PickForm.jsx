import React, { useState, useEffect } from 'react';
import { makePicks, getGamesByWeek, getUserPicks } from './api';
import { teamLogos } from './teamLogos';

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

  // Si estamos en horario de jornada y no hemos pasado la fecha límite, mostrar mensaje
  if (duringGameWeek && !isDeadlinePassed) {
    return (
      <div className="card" style={{
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        border: '3px solid #1A365D',
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
  }, [token, leagueId, week, isDeadlinePassed, nextWeek]);

  const handlePick = (gameId, team) => {
    setPicks({ ...picks, [gameId]: team });
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
      setMessage(`Debes hacer picks para todos los partidos. Faltan ${missingPicks.length} pick(s).`);
      setLoading(false);
      return;
    }

    const picksArr = currentGames.filter(g => picks[g.id]).map(g => ({ gameId: g.id, pick: picks[g.id], week: isDeadlinePassed ? nextWeek : week }));
    const res = await makePicks(token, leagueId, picksArr);
    setMessage(res.message || 'Picks enviados');
    setLoading(false);
  };

  if (isDeadlinePassed) {
    return (
      <div className="card" style={{
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        border: '3px solid #1A365D',
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
                color: 'var(--primary-color)',
                textAlign: 'center',
                marginBottom: '20px'
              }}>
                🎯 Haz tus picks para la semana {nextWeek}
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px',
                marginBottom: '20px'
              }}>
                {nextWeekGames.map(game => (
                  <div key={game.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px 12px',
                    backgroundColor: 'rgba(240, 240, 240, 0.9)',
                    borderRadius: '12px',
                    border: '2px solid rgba(0, 44, 95, 0.2)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    gap: '6px'
                  }}>
                    <div style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      width: '44px',
                      height: '44px'
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
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          cursor: 'pointer',
                          border: picks[game.id] === game.awayTeam ? '3px solid #002C5F' : '3px solid transparent',
                          boxShadow: picks[game.id] === game.awayTeam ? '0 0 0 2px rgba(0, 44, 95, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.15)',
                          transition: 'all 0.2s ease'
                        }}
                      />
                    </div>

                    <div style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#002C5F',
                      margin: '0 2px'
                    }}>
                      -
                    </div>

                    <div style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      width: '44px',
                      height: '44px'
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
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          cursor: 'pointer',
                          border: picks[game.id] === game.homeTeam ? '3px solid #002C5F' : '3px solid transparent',
                          boxShadow: picks[game.id] === game.homeTeam ? '0 0 0 2px rgba(0, 44, 95, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.15)',
                          transition: 'all 0.2s ease'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'center' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '16px 36px',
                    borderRadius: '20px',
                    fontSize: '18px',
                    fontWeight: '700',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 6px 20px rgba(79, 70, 229, 0.4)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    margin: '0 auto',
                    opacity: loading ? 0.7 : 1,
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}
                  onMouseOver={(e) => {
                    if (!loading) {
                      e.target.style.transform = 'translateY(-3px) scale(1.05)';
                      e.target.style.boxShadow = '0 10px 30px rgba(79, 70, 229, 0.6)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!loading) {
                      e.target.style.transform = 'translateY(0) scale(1)';
                      e.target.style.boxShadow = '0 6px 20px rgba(79, 70, 229, 0.4)';
                    }
                  }}
                >
                  {loading ? (
                    <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '3px' }}></div>
                  ) : (
                    '⚡'
                  )}
                  {loading ? 'Enviando...' : 'Enviar Picks'}
                </button>

                {message && (
                  <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: message.includes('correctamente') ? 'var(--success-color)' : 'var(--error-color)',
                    color: 'white',
                    fontWeight: '500'
                  }}>
                    {message.includes('correctamente') ? '✅ ' : '❌ '}{message}
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
    <div className="card">
      <div className="card-header">
        <h2 style={{ margin: 0, fontSize: '20px' }}>🎯 Haz tus picks - Semana {week}</h2>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            marginBottom: '20px'
          }}>
            {games.map(game => (
              <div key={game.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 12px',
                backgroundColor: 'rgba(240, 240, 240, 0.9)',
                borderRadius: '12px',
                border: '2px solid rgba(0, 44, 95, 0.2)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                gap: '6px'
              }}>
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  width: '44px',
                  height: '44px'
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
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      cursor: 'pointer',
                      border: picks[game.id] === game.awayTeam ? '3px solid #002C5F' : '3px solid transparent',
                      boxShadow: picks[game.id] === game.awayTeam ? '0 0 0 2px rgba(0, 44, 95, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.15)',
                      transition: 'all 0.2s ease'
                    }}
                  />
                </div>

                <div style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#002C5F',
                  margin: '0 2px'
                }}>
                  -
                </div>

                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  width: '44px',
                  height: '44px'
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
                      height: '100% ',
                      margin: 0,
                      cursor: 'pointer'
                    }}
                  />
                  <img
                    src={teamLogos[game.homeTeam]}
                    alt={game.homeTeam}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      cursor: 'pointer',
                      border: picks[game.id] === game.homeTeam ? '3px solid #002C5F' : '3px solid transparent',
                      boxShadow: picks[game.id] === game.homeTeam ? '0 0 0 2px rgba(0, 44, 95, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.15)',
                      transition: 'all 0.2s ease'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

              <div style={{ textAlign: 'center' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '16px 36px',
                    borderRadius: '20px',
                    fontSize: '18px',
                    fontWeight: '700',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 6px 20px rgba(79, 70, 229, 0.4)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    margin: '0 auto',
                    opacity: loading ? 0.7 : 1,
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}
                  onMouseOver={(e) => {
                    if (!loading) {
                      e.target.style.transform = 'translateY(-3px) scale(1.05)';
                      e.target.style.boxShadow = '0 10px 30px rgba(79, 70, 229, 0.6)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!loading) {
                      e.target.style.transform = 'translateY(0) scale(1)';
                      e.target.style.boxShadow = '0 6px 20px rgba(79, 70, 229, 0.4)';
                    }
                  }}
                >
                  {loading ? (
                    <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '3px' }}></div>
                  ) : (
                    '⚡'
                  )}
                  {loading ? 'Enviando...' : 'Enviar Picks'}
                </button>

            {message && (
              <div style={{
                marginTop: '16px',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: message.includes('correctamente') ? 'var(--success-color)' : 'var(--error-color)',
                color: 'white',
                fontWeight: '500'
              }}>
                {message.includes('correctamente') ? '✅ ' : '❌ '}{message}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
