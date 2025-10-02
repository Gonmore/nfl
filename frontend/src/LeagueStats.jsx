import React, { useEffect, useState } from 'react';
import { getLeagueStats, getUserPicksDetails } from './api';
import { teamLogos } from './teamLogos';

export default function LeagueStats({ token, leagueId, week: initialWeek }) {
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [totalStats, setTotalStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedWeek, setSelectedWeek] = useState(initialWeek);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalWeek, setModalWeek] = useState(initialWeek);
  const [modalUser, setModalUser] = useState(null);
  const [modalDetails, setModalDetails] = useState([]);
  const [modalTotalPoints, setModalTotalPoints] = useState(0);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError('');
      try {
        const res = await getLeagueStats(token, leagueId, selectedWeek);
        setWeeklyStats(res.weekly || []);
        setTotalStats(res.total || []);
      } catch (err) {
        setError('Error al cargar estadísticas');
      }
      setLoading(false);
    }
    fetchStats();
  }, [token, leagueId, selectedWeek]);

  const handleUserClick = async (userId, userName) => {
    setModalUser(userName);
    setModalWeek(selectedWeek);
    setModalOpen(true);
    await loadModalDetails(userId, selectedWeek);
  };

  const loadModalDetails = async (userId, week) => {
    setDetailsLoading(true);
    try {
      const res = await getUserPicksDetails(token, leagueId, week, userId);
      console.log('Modal details response:', res);
      setModalDetails(res.details || []);
      const totalPoints = res.details.reduce((sum, detail) => sum + detail.points, 0);
      setModalTotalPoints(totalPoints);
    } catch (err) {
      setError('Error al cargar detalles');
    }
    setDetailsLoading(false);
  };

  const handleModalWeekChange = async (newWeek) => {
    setModalWeek(newWeek);
    if (modalUser) {
      // Find userId from either weekly or total stats
      const userFromWeekly = weeklyStats.find(s => s.user === modalUser);
      const userFromTotal = totalStats.find(s => s.user === modalUser);
      const userId = userFromWeekly?.userId || userFromTotal?.userId;
      if (userId) {
        await loadModalDetails(userId, newWeek);
      }
    }
  };

  return (
    <div style={{ marginTop: '32px' }}>
      {/* Ranking Semanal */}
      <div className="card" style={{
        marginBottom: '24px',
        backgroundColor: 'transparent',
        border: '3px solid #002C5F',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
      }}>
        <div className="card-header" style={{
          background: 'linear-gradient(135deg, #002C5F 0%, #1A365D 100%)',
          color: 'white',
          borderRadius: '17px 17px 0 0',
          padding: '20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <h2 style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              🏆 Ranking de la Liga
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{
                fontSize: '16px',
                fontWeight: '600',
                color: 'white'
              }}>
                Semana:
              </label>
              <select
                value={selectedWeek}
                onChange={e => {
                  setSelectedWeek(parseInt(e.target.value));
                }}
                className="form-control"
                style={{
                  padding: '8px 16px',
                  fontSize: '16px',
                  minHeight: '40px',
                  width: 'auto',
                  borderRadius: '12px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontWeight: '600'
                }}
              >
                {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18].map(w => (
                  <option key={w} value={w} style={{ backgroundColor: '#002C5F', color: 'white' }}>GW {w}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="card-body" style={{ padding: '24px' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></div>
              <p style={{
                marginTop: '16px',
                color: '#4A5568',
                fontSize: '16px',
                fontWeight: '500'
              }}>
                Cargando estadísticas...
              </p>
            </div>
          )}

          {error && (
            <div style={{
              backgroundColor: 'rgba(229, 62, 62, 0.1)',
              border: '2px solid #E53E3E',
              borderRadius: '16px',
              padding: '20px',
              color: '#E53E3E',
              textAlign: 'center',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              ⚠️ {error}
            </div>
          )}

          {!loading && !error && (
            <div style={{
              maxHeight: '280px',
              overflowY: 'auto',
              borderRadius: '12px'
            }}>
              {(() => {
                const allUsers = new Map();
                weeklyStats.forEach(s => allUsers.set(s.userId, { user: s.user, userId: s.userId, profileImage: s.profileImage, weekly: s.points, total: 0 }));
                totalStats.forEach(s => {
                  if (allUsers.has(s.userId)) {
                    allUsers.get(s.userId).total = s.points;
                  } else {
                    allUsers.set(s.userId, { user: s.user, userId: s.userId, profileImage: s.profileImage, weekly: 0, total: s.points });
                  }
                });
                const sortedUsers = Array.from(allUsers.values()).sort((a, b) => b.total - a.total);
                return (
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
                  }}>
                    <thead style={{
                      position: 'sticky',
                      top: 0,
                      background: 'linear-gradient(135deg, #002C5F 0%, #1A365D 100%)',
                      color: 'white',
                      zIndex: 1
                    }}>
                      <tr>
                        <th style={{
                          padding: '12px 8px',
                          textAlign: 'center',
                          fontSize: '16px',
                          fontWeight: '700',
                          borderBottom: '2px solid rgba(255, 255, 255, 0.3)',
                          width: '40px'
                        }}>
                          POS
                        </th>
                        <th style={{
                          padding: '12px 8px',
                          textAlign: 'left',
                          fontSize: '16px',
                          fontWeight: '700',
                          borderBottom: '2px solid rgba(255, 255, 255, 0.3)',
                          width: '120px'
                        }}>
                          Usuario
                        </th>
                        <th style={{
                          padding: '12px 8px',
                          textAlign: 'center',
                          fontSize: '16px',
                          fontWeight: '700',
                          borderBottom: '2px solid rgba(255, 255, 255, 0.3)',
                          width: '80px'
                        }}>
                          GW {selectedWeek}
                        </th>
                        <th style={{
                          padding: '12px 8px',
                          textAlign: 'center',
                          fontSize: '16px',
                          fontWeight: '700',
                          borderBottom: '2px solid rgba(255, 255, 255, 0.3)',
                          width: '80px'
                        }}>
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedUsers.map((user, index) => (
                        <tr key={user.userId} style={{
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          backgroundColor: index < 3 ? 'rgba(0, 44, 95, 0.05)' : 'transparent',
                          borderBottom: '1px solid rgba(0, 44, 95, 0.1)'
                        }}
                        onMouseOver={(e) => {
                          e.target.closest('tr').style.backgroundColor = 'rgba(0, 44, 95, 0.1)';
                          e.target.closest('tr').style.transform = 'scale(1.01)';
                        }}
                        onMouseOut={(e) => {
                          e.target.closest('tr').style.backgroundColor = index < 3 ? 'rgba(0, 44, 95, 0.05)' : 'transparent';
                          e.target.closest('tr').style.transform = 'scale(1)';
                        }}
                        onClick={() => handleUserClick(user.userId, user.user)}
                        >
                          <td style={{
                            padding: '12px 8px',
                            textAlign: 'center',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#002C5F'
                          }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#002C5F',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              color: index < 3 ? '#002C5F' : 'white',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                              margin: '0 auto'
                            }}>
                              {index + 1}
                            </div>
                          </td>
                          <td style={{
                            padding: '12px 8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#002C5F'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              <img
                                src={user.profileImage || '/default-avatar.svg'}
                                alt={user.user}
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  objectFit: 'cover',
                                  border: '2px solid #002C5F',
                                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                                }}
                              />
                              <span>{user.user}</span>
                            </div>
                          </td>
                          <td style={{
                            padding: '12px 8px',
                            textAlign: 'center',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#002C5F'
                          }}>
                            {user.weekly} pts
                          </td>
                          <td style={{
                            padding: '12px 8px',
                            textAlign: 'center',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#002C5F'
                          }}>
                            {user.total} pts
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalles */}
      {modalOpen && (
        <div className="modal-overlay" style={{
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(12px)',
          transition: 'all 0.3s ease-out'
        }}>
          <div className="modal-content" style={{
            maxWidth: '750px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
            border: '4px solid #4F46E5',
            borderRadius: '28px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 40px rgba(79, 70, 229, 0.2)',
            backdropFilter: 'blur(15px)',
            transition: 'all 0.4s ease-out',
            transform: 'scale(1) translateY(0)',
            opacity: 1
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              padding: '28px 28px 0 28px'
            }}>
              <h2 style={{
                margin: 0,
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: '28px',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                📊 Detalles de {modalUser}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: 'white',
                  padding: '8px',
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'scale(1.1) rotate(90deg)';
                  e.target.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'scale(1) rotate(0deg)';
                  e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                }}
              >
                ×
              </button>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '28px',
              padding: '0 28px'
            }}>
              <label style={{
                fontSize: '18px',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Semana:
              </label>
              <select
                value={modalWeek}
                onChange={e => handleModalWeekChange(parseInt(e.target.value))}
                className="form-control"
                style={{
                  padding: '12px 20px',
                  fontSize: '16px',
                  minHeight: '48px',
                  flex: 1,
                  borderRadius: '16px',
                  border: '3px solid rgba(79, 70, 229, 0.3)',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: '#4F46E5',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.borderColor = 'rgba(79, 70, 229, 0.5)';
                  e.target.style.boxShadow = '0 6px 16px rgba(79, 70, 229, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.target.style.borderColor = 'rgba(79, 70, 229, 0.3)';
                  e.target.style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.2)';
                }}
              >
                {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18].map(w => (
                  <option key={w} value={w} style={{ backgroundColor: '#4F46E5', color: 'white' }}>GW {w}</option>
                ))}
              </select>
            </div>

            <div style={{
              marginBottom: '28px',
              padding: '24px',
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              color: 'white',
              borderRadius: '20px',
              textAlign: 'center',
              margin: '0 28px 28px 28px',
              boxShadow: '0 8px 24px rgba(79, 70, 229, 0.3)'
            }}>
              <div style={{ fontSize: '20px', marginBottom: '12px', fontWeight: '600', opacity: 0.9 }}>
                Puntos en GW {modalWeek}
              </div>
              <div style={{ fontSize: '40px', fontWeight: '900', textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
                {modalTotalPoints}
              </div>
            </div>

            {detailsLoading && (
              <div style={{ textAlign: 'center', padding: '48px' }}>
                <div className="spinner" style={{ width: '48px', height: '48px', borderWidth: '5px' }}></div>
                <p style={{
                  marginTop: '20px',
                  color: '#6B7280',
                  fontSize: '18px',
                  fontWeight: '600'
                }}>
                  Cargando detalles...
                </p>
              </div>
            )}

            {!detailsLoading && modalDetails.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '48px',
                color: '#6B7280',
                background: 'linear-gradient(135deg, rgba(156, 163, 175, 0.1) 0%, rgba(156, 163, 175, 0.05) 100%)',
                borderRadius: '20px',
                margin: '0 28px 28px 28px',
                border: '2px solid rgba(156, 163, 175, 0.2)',
                fontSize: '18px',
                fontWeight: '600',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
              }}>
                📭 No hay picks para esta semana.
              </div>
            )}

            <div style={{
              maxHeight: '450px',
              overflowY: 'auto',
              padding: '0 28px 28px 28px'
            }}>
              {!detailsLoading && modalDetails.map(detail => { return (
                <div key={detail.gameId} style={{
                  marginBottom: '20px',
                  padding: '20px',
                  background: detail.points > 0 ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)' : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
                  border: `3px solid ${detail.points > 0 ? '#22C55E' : '#EF4444'}`,
                  borderRadius: '20px',
                  boxShadow: detail.points > 0 ? '0 6px 20px rgba(34, 197, 94, 0.2)' : '0 6px 20px rgba(239, 68, 68, 0.2)',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(5px)'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-4px)';
                  e.target.style.boxShadow = detail.points > 0 ? '0 12px 32px rgba(34, 197, 94, 0.3)' : '0 12px 32px rgba(239, 68, 68, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = detail.points > 0 ? '0 6px 20px rgba(34, 197, 94, 0.2)' : '0 6px 20px rgba(239, 68, 68, 0.2)';
                }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '16px',
                      fontWeight: '800',
                      color: '#002C5F',
                      fontSize: '18px',
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                    }}>
                      {detail.winner === detail.homeTeam ? (
                        <>
                          <img
                            src={teamLogos[detail.homeTeam]}
                            alt={detail.homeTeam}
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '50%',
                              objectFit: 'cover'
                            }}
                          />
                          <span>vs</span>
                          <img
                            src={teamLogos[detail.awayTeam]}
                            alt={detail.awayTeam}
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '50%',
                              objectFit: 'cover'
                            }}
                          />
                        </>
                      ) : (
                        <>
                          <img
                            src={teamLogos[detail.awayTeam]}
                            alt={detail.awayTeam}
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '50%',
                              objectFit: 'cover'
                            }}
                          />
                          <span>vs</span>
                          <img
                            src={teamLogos[detail.homeTeam]}
                            alt={detail.homeTeam}
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '50%',
                              objectFit: 'cover'
                            }}
                          />
                        </>
                      )}
                    </div>
                  </div>

                  <div style={{
                    fontSize: '16px',
                    color: '#4A5568',
                    lineHeight: '1.6',
                    fontWeight: '500'
                  }}>
                    <strong style={{ color: '#4F46E5', fontWeight: '700' }}>Pick:</strong> {detail.pick} |
                    <strong style={{ color: '#4F46E5', fontWeight: '700' }}> Ganador:</strong> {detail.winner || 'Pendiente'} |
                    <strong style={{ color: '#4F46E5', fontWeight: '700' }}> Puntos:</strong> {detail.points}
                  </div>
                </div>
              ) } ) }
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
