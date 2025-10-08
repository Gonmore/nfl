import React, { useState, useEffect } from 'react';
import { createInvitationWithPicks } from '../api';
import { teamLogos } from '../teamLogos';

/**
 * Wizard para invitar un usuario a una liga privada con sus picks pasados
 * Genera un link de invitación que el usuario usará para registrarse
 * Solo disponible para el creador de la liga
 */
export default function AddUserWizard({ league, onClose, token, currentWeek, showToast }) {
  const [step, setStep] = useState(1);
  const [userEmail, setUserEmail] = useState('');
  const [weekPicks, setWeekPicks] = useState({}); // { week: [{ gameId, pick }] }
  const [games, setGames] = useState([]); // Todos los juegos hasta la semana actual
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [invitationLink, setInvitationLink] = useState('');
  const [invitationToken, setInvitationToken] = useState('');

  // Cargar todos los juegos hasta la semana actual
  useEffect(() => {
    const fetchGames = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/nfl/games/all-until-week?week=${currentWeek}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setGames(data.games || []);
      } catch (error) {
        console.error('Error loading games:', error);
        showToast('Error al cargar los juegos', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    if (step === 2) {
      fetchGames();
    }
  }, [step, currentWeek, token]);

  // Validar formato de email y avanzar
  const handleEmailNext = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      showToast('Por favor ingresa un email válido', 'error');
      return;
    }
    setStep(2);
  };

  // Manejar selección de pick
  const handlePickSelect = (gameId, pick) => {
    setWeekPicks(prev => {
      const weekGames = prev[selectedWeek] || [];
      const existingPickIndex = weekGames.findIndex(p => p.gameId === gameId);
      
      let updatedWeekGames;
      if (existingPickIndex >= 0) {
        updatedWeekGames = [...weekGames];
        updatedWeekGames[existingPickIndex] = { gameId, pick };
      } else {
        updatedWeekGames = [...weekGames, { gameId, pick }];
      }
      
      return { ...prev, [selectedWeek]: updatedWeekGames };
    });
  };

  // Obtener pick actual para un juego
  const getCurrentPick = (gameId) => {
    const weekGames = weekPicks[selectedWeek] || [];
    const pick = weekGames.find(p => p.gameId === gameId);
    return pick?.pick;
  };

  // Generar invitación con picks
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await createInvitationWithPicks(token, {
        email: userEmail,
        leagueId: league.id,
        picks: weekPicks
      });

      if (response.token) {
        const baseUrl = window.location.origin;
        const link = `${baseUrl}?invitation=${response.token}`;
        setInvitationLink(link);
        setInvitationToken(response.token);
        setStep(4); // Mostrar el link generado
        showToast('Invitación generada exitosamente', 'success');
      }
    } catch (error) {
      console.error('Error creating invitation:', error);
      showToast('Error al generar invitación', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener juegos de la semana seleccionada
  const getGamesForWeek = (week) => {
    return games.filter(g => g.week === week);
  };

  // Verificar si hay picks para todas las semanas
  const allWeeksHavePicks = () => {
    for (let week = 1; week <= currentWeek; week++) {
      const weekGames = getGamesForWeek(week);
      const weekPicksData = weekPicks[week] || [];
      if (weekGames.length > 0 && weekPicksData.length !== weekGames.length) {
        return false;
      }
    }
    return true;
  };

  // Renderizar paso 1: Email del usuario a invitar
  const renderStep1 = () => (
    <div style={{ padding: '24px' }}>
      <h3 style={{
        margin: '0 0 24px 0',
        fontSize: '22px',
        fontWeight: '700',
        color: '#004B9B',
        textAlign: 'center'
      }}>
        📧 Paso 1: Email del Usuario a Invitar
      </h3>
      
      <p style={{
        marginBottom: '24px',
        color: '#4A5568',
        fontSize: '15px',
        lineHeight: '1.6',
        textAlign: 'center'
      }}>
        Ingresa el email de la persona que deseas invitar a <strong>{league.name}</strong>
      </p>

      <div style={{
        backgroundColor: '#EBF8FF',
        border: '1px solid #90CDF4',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '24px'
      }}>
        <p style={{
          margin: 0,
          fontSize: '14px',
          color: '#2C5282',
          lineHeight: '1.5'
        }}>
          💡 <strong>Nota:</strong> El usuario recibirá un link de invitación para registrarse en la plataforma con este email y sus picks ya estarán configurados.
        </p>
      </div>

      <input
        type="email"
        placeholder="usuario@ejemplo.com"
        value={userEmail}
        onChange={(e) => setUserEmail(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && userEmail && handleEmailNext()}
        style={{
          width: '100%',
          padding: '14px',
          fontSize: '16px',
          border: '2px solid #E2E8F0',
          borderRadius: '12px',
          marginBottom: '24px',
          boxSizing: 'border-box'
        }}
      />

      <div style={{
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end'
      }}>
        <button
          onClick={onClose}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '600',
            border: '2px solid #E2E8F0',
            borderRadius: '12px',
            backgroundColor: '#FFFFFF',
            color: '#4A5568',
            cursor: 'pointer'
          }}
        >
          Cancelar
        </button>
        <button
          onClick={handleEmailNext}
          disabled={!userEmail}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '600',
            border: 'none',
            borderRadius: '12px',
            backgroundColor: !userEmail ? '#CBD5E0' : '#004B9B',
            color: '#FFFFFF',
            cursor: !userEmail ? 'not-allowed' : 'pointer'
          }}
        >
          Siguiente
        </button>
      </div>
    </div>
  );

  // Renderizar paso 2: Seleccionar picks por semana
  const renderStep2 = () => {
    const weekGames = getGamesForWeek(selectedWeek);
    const weekPicksData = weekPicks[selectedWeek] || [];

    return (
      <div style={{ padding: '24px' }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '22px',
          fontWeight: '700',
          color: '#004B9B',
          textAlign: 'center'
        }}>
          🎯 Paso 2: Seleccionar Picks
        </h3>

        <p style={{
          marginBottom: '24px',
          color: '#4A5568',
          fontSize: '15px',
          textAlign: 'center'
        }}>
          Seleccionando picks para: <strong>{userEmail}</strong>
        </p>

        {/* Selector de semana */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px',
          justifyContent: 'center'
        }}>
          <label style={{ fontWeight: '600', color: '#004B9B' }}>Semana:</label>
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
            style={{
              padding: '8px 16px',
              fontSize: '16px',
              borderRadius: '8px',
              border: '2px solid #E2E8F0'
            }}
          >
            {Array.from({ length: currentWeek }, (_, i) => i + 1).map(w => (
              <option key={w} value={w}>
                Semana {w} {weekPicks[w] && weekPicks[w].length === getGamesForWeek(w).length ? '✓' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Lista de juegos */}
        <div style={{
          maxHeight: '400px',
          overflowY: 'auto',
          marginBottom: '24px'
        }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Cargando juegos...</div>
          ) : weekGames.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
              No hay juegos disponibles para esta semana
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {weekGames.map(game => {
                const currentPick = getCurrentPick(game.id);
                return (
                  <div key={game.id} style={{
                    border: '2px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '16px',
                    backgroundColor: '#FFFFFF'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-around',
                      alignItems: 'center',
                      gap: '16px'
                    }}>
                      {/* Away Team */}
                      <button
                        onClick={() => handlePickSelect(game.id, game.awayTeam)}
                        style={{
                          flex: 1,
                          padding: '12px',
                          border: currentPick === game.awayTeam ? '3px solid #004B9B' : '2px solid #E2E8F0',
                          borderRadius: '12px',
                          backgroundColor: currentPick === game.awayTeam ? 'rgba(0, 75, 155, 0.1)' : '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'all 0.2s'
                        }}
                      >
                        <img
                          src={teamLogos[game.awayTeam]}
                          alt={game.awayTeam}
                          style={{ width: '48px', height: '48px', objectFit: 'contain' }}
                        />
                        <span style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#002C5F',
                          textAlign: 'center'
                        }}>
                          {game.awayTeam}
                        </span>
                      </button>

                      <div style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#4A5568'
                      }}>
                        vs
                      </div>

                      {/* Home Team */}
                      <button
                        onClick={() => handlePickSelect(game.id, game.homeTeam)}
                        style={{
                          flex: 1,
                          padding: '12px',
                          border: currentPick === game.homeTeam ? '3px solid #004B9B' : '2px solid #E2E8F0',
                          borderRadius: '12px',
                          backgroundColor: currentPick === game.homeTeam ? 'rgba(0, 75, 155, 0.1)' : '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'all 0.2s'
                        }}
                      >
                        <img
                          src={teamLogos[game.homeTeam]}
                          alt={game.homeTeam}
                          style={{ width: '48px', height: '48px', objectFit: 'contain' }}
                        />
                        <span style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#002C5F',
                          textAlign: 'center'
                        }}>
                          {game.homeTeam}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'space-between'
        }}>
          <button
            onClick={() => setStep(1)}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              border: '2px solid #E2E8F0',
              borderRadius: '12px',
              backgroundColor: '#FFFFFF',
              color: '#4A5568',
              cursor: 'pointer'
            }}
          >
            Atrás
          </button>
          <button
            onClick={() => setStep(3)}
            disabled={weekPicksData.length !== weekGames.length}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              border: 'none',
              borderRadius: '12px',
              backgroundColor: weekPicksData.length !== weekGames.length ? '#CBD5E0' : '#004B9B',
              color: '#FFFFFF',
              cursor: weekPicksData.length !== weekGames.length ? 'not-allowed' : 'pointer'
            }}
          >
            Siguiente
          </button>
        </div>
      </div>
    );
  };

  // Renderizar paso 3: Confirmar
  const renderStep3 = () => {
    const totalPicks = Object.values(weekPicks).reduce((sum, picks) => sum + picks.length, 0);

    return (
      <div style={{ padding: '24px' }}>
        <h3 style={{
          margin: '0 0 24px 0',
          fontSize: '22px',
          fontWeight: '700',
          color: '#004B9B',
          textAlign: 'center'
        }}>
          ✅ Paso 3: Confirmar y Generar Invitación
        </h3>

        <div style={{
          backgroundColor: '#F7FAFC',
          border: '2px solid #E2E8F0',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h4 style={{
            margin: '0 0 16px 0',
            fontSize: '18px',
            fontWeight: '700',
            color: '#002C5F'
          }}>
            Resumen de Invitación
          </h4>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            fontSize: '15px',
            color: '#4A5568'
          }}>
            <div>
              <strong>Email a invitar:</strong> {userEmail}
            </div>
            <div>
              <strong>Liga:</strong> {league.name}
            </div>
            <div>
              <strong>Total de picks configurados:</strong> {totalPicks} picks en {Object.keys(weekPicks).length} semanas
            </div>
          </div>

          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#EBF8FF',
            border: '1px solid #90CDF4',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#2C5282'
          }}>
            ℹ️ <strong>Al confirmar:</strong> Se generará un link único que deberás compartir con el usuario. Cuando se registre usando ese link, sus picks quedarán automáticamente configurados.
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'space-between'
        }}>
          <button
            onClick={() => setStep(2)}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              border: '2px solid #E2E8F0',
              borderRadius: '12px',
              backgroundColor: '#FFFFFF',
              color: '#4A5568',
              cursor: 'pointer'
            }}
          >
            Atrás
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !allWeeksHavePicks()}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              border: 'none',
              borderRadius: '12px',
              backgroundColor: isLoading || !allWeeksHavePicks() ? '#CBD5E0' : '#12B900',
              color: '#FFFFFF',
              cursor: isLoading || !allWeeksHavePicks() ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Generando...' : 'Generar Invitación'}
          </button>
        </div>
      </div>
    );
  };

  // Renderizar paso 4: Mostrar link de invitación
  const renderStep4 = () => {
    const handleCopyLink = () => {
      navigator.clipboard.writeText(invitationLink);
      showToast('✅ Link copiado al portapapeles!', 'success');
    };

    const handleShareWhatsApp = () => {
      const message = `¡Hola! Te invito a unirte a la liga "${league.name}" en MVPicks.\n\n⚠️ IMPORTANTE: Debes registrarte usando el correo: ${userEmail}\n\nUsa este link para registrarte y tus picks ya estarán configurados:\n${invitationLink}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    };

    return (
      <div style={{ padding: '24px' }}>
        <h3 style={{
          margin: '0 0 24px 0',
          fontSize: '22px',
          fontWeight: '700',
          color: '#12B900',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '32px' }}>🎉</span>
          ¡Invitación Generada!
        </h3>

        <div style={{
          backgroundColor: '#F7FAFC',
          border: '2px solid #E2E8F0',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <p style={{
            margin: '0 0 16px 0',
            fontSize: '15px',
            color: '#4A5568',
            textAlign: 'center',
            lineHeight: '1.6'
          }}>
            Comparte este link con el usuario. 
          </p>
          
          <div style={{
            backgroundColor: '#FFF5E1',
            border: '2px solid #FFB020',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px'
          }}>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: '#8B5A00',
              textAlign: 'center',
              fontWeight: '600'
            }}>
              ⚠️ El usuario debe registrarse con el correo:<br/>
              <span style={{ color: '#004B9B', fontSize: '15px' }}>{userEmail}</span>
            </p>
          </div>

          <p style={{
            margin: '0 0 16px 0',
            fontSize: '14px',
            color: '#718096',
            textAlign: 'center',
            lineHeight: '1.5'
          }}>
            Cuando se registre, automáticamente tendrá acceso a la liga con todos sus picks configurados.
          </p>

          <div style={{
            backgroundColor: '#FFFFFF',
            border: '2px solid #004B9B',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            wordBreak: 'break-all',
            fontSize: '13px',
            fontFamily: 'monospace',
            color: '#002C5F',
            textAlign: 'center'
          }}>
            {invitationLink}
          </div>

          <div style={{
            display: 'flex',
            gap: '12px',
            flexDirection: 'column'
          }}>
            <button
              onClick={handleCopyLink}
              style={{
                padding: '14px 20px',
                fontSize: '16px',
                fontWeight: '600',
                border: 'none',
                borderRadius: '12px',
                backgroundColor: '#004B9B',
                color: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#003875';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#004B9B';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              📋 Copiar Link
            </button>

            <button
              onClick={handleShareWhatsApp}
              style={{
                padding: '14px 20px',
                fontSize: '16px',
                fontWeight: '600',
                border: 'none',
                borderRadius: '12px',
                backgroundColor: '#25D366',
                color: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#1EBE57';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#25D366';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <span style={{ fontSize: '20px' }}>💬</span>
              Compartir por WhatsApp
            </button>
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFF3CD',
          border: '1px solid #FFC107',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: '#856404',
            lineHeight: '1.5'
          }}>
            ⚠️ <strong>Importante:</strong> El link es de un solo uso y expira en 7 días. El usuario deberá usar el email <strong>{userEmail}</strong> para registrarse.
          </p>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 32px',
              fontSize: '16px',
              fontWeight: '600',
              border: 'none',
              borderRadius: '12px',
              backgroundColor: '#6C757D',
              color: '#FFFFFF',
              cursor: 'pointer'
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        maxWidth: '700px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #004B9B 0%, #0066CC 100%)',
          padding: '20px 24px',
          borderRadius: '20px 20px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            margin: 0,
            color: '#FFFFFF',
            fontSize: '20px',
            fontWeight: '700'
          }}>
            Agregar Usuario con Picks Pasados
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '28px',
              cursor: 'pointer',
              padding: '0',
              lineHeight: '1'
            }}
          >
            ×
          </button>
        </div>

        {/* Progress indicator */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '20px',
          gap: '8px'
        }}>
          {[1, 2, 3, 4].map(s => (
            <div key={s} style={{
              width: step === 4 ? '80px' : '32px',
              height: '4px',
              borderRadius: '2px',
              backgroundColor: s <= step ? (step === 4 && s === 4 ? '#12B900' : '#004B9B') : '#E2E8F0',
              transition: 'all 0.3s'
            }} />
          ))}
        </div>

        {/* Content */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </div>
    </div>
  );
}
