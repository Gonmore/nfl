import React, { useState, useEffect } from 'react';
import { checkAdminPickEligibility, makePicksForUser, getLeagueMembers } from '../api';
import { teamLogos } from '../teamLogos';

export default function AdminPickManager({ token, league, week, onClose, onSuccess }) {
  const [members, setMembers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [eligibilityData, setEligibilityData] = useState(null);
  const [picks, setPicks] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadMembers();
  }, [league.id]);

  const loadMembers = async () => {
    try {
      const response = await getLeagueMembers(token, league.id);
      if (response.members) {
        setMembers(response.members);
      }
    } catch (err) {
      setError('Error al cargar miembros de la liga');
      console.error(err);
    }
  };

  const handleUserSelect = async (userId) => {
    setError('');
    setSuccess('');
    setLoading(true);
    setSelectedUser(userId);
    setPicks({});

    try {
      const response = await checkAdminPickEligibility(token, userId, league.id, week);
      
      if (response.eligible) {
        setEligibilityData(response);
      } else {
        setError(response.message);
        setEligibilityData(null);
        setSelectedUser(null);
      }
    } catch (err) {
      setError(err.message || 'Error al verificar elegibilidad');
      setEligibilityData(null);
      setSelectedUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePickSelect = (gameId, team) => {
    setPicks(prev => ({
      ...prev,
      [gameId]: team
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(picks).length === 0) {
      setError('Debes seleccionar al menos un pick');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const picksArray = Object.entries(picks).map(([gameId, pick]) => ({
        gameId: parseInt(gameId),
        pick,
        week: parseInt(week)
      }));

      const response = await makePicksForUser(token, selectedUser, league.id, week, picksArray);

      if (response.message) {
        setSuccess(response.message);
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Error al guardar picks');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>Hacer Picks por Usuario</h2>
          <button onClick={onClose} style={styles.closeButton}>✕</button>
        </div>

        <div style={styles.content}>
          {error && (
            <div style={styles.error}>{error}</div>
          )}

          {success && (
            <div style={styles.success}>{success}</div>
          )}

          {!selectedUser && (
            <div>
              <p style={styles.instruction}>
                Selecciona un usuario que no haya hecho picks esta semana:
              </p>
              <div style={styles.membersList}>
                {members.map(member => (
                  <button
                    key={member.userId}
                    onClick={() => handleUserSelect(member.userId)}
                    style={styles.memberButton}
                    disabled={loading}
                  >
                    <div style={styles.memberInfo}>
                      <span style={styles.memberName}>{member.User.username}</span>
                      <span style={styles.memberEmail}>{member.User.email}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedUser && eligibilityData && (
            <div>
              <div style={styles.userInfo}>
                <h3 style={styles.subtitle}>Usuario seleccionado:</h3>
                <p style={styles.userName}>{eligibilityData.targetUser.username}</p>
                
                <div style={styles.statsContainer}>
                  <div style={styles.statBox}>
                    <span style={styles.statLabel}>Usos previos:</span>
                    <span style={styles.statValue}>{eligibilityData.usedCount}/3</span>
                  </div>
                  <div style={styles.statBox}>
                    <span style={styles.statLabel}>Este será uso:</span>
                    <span style={styles.statValue}>{eligibilityData.nextPickCount}/3</span>
                  </div>
                  <div style={{
                    ...styles.statBox,
                    backgroundColor: eligibilityData.penalty === 0 ? '#d4edda' : '#fff3cd'
                  }}>
                    <span style={styles.statLabel}>Penalización:</span>
                    <span style={{
                      ...styles.statValue,
                      color: eligibilityData.penalty === 0 ? '#155724' : '#856404'
                    }}>
                      {eligibilityData.penalty === 0 ? 'Gratis' : '-3 puntos'}
                    </span>
                  </div>
                </div>

                {eligibilityData.penalty !== 0 && (
                  <div style={styles.warning}>
                    ⚠️ Esta es la {eligibilityData.nextPickCount === 2 ? 'segunda' : 'tercera'} vez. 
                    Se aplicará una penalización de -3 puntos a los puntos totales de esta semana.
                  </div>
                )}
              </div>

              <div style={styles.gamesSection}>
                <h3 style={styles.subtitle}>Selecciona los picks (partidos no iniciados):</h3>
                <div style={styles.gamesGrid}>
                  {eligibilityData.availableGames.map(game => (
                    <div key={game.id} style={styles.gameCard}>
                      <div style={styles.gameDate}>
                        {new Date(game.date).toLocaleString('es-ES', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      
                      <div style={styles.teamsContainer}>
                        <button
                          onClick={() => handlePickSelect(game.id, game.awayTeam)}
                          style={{
                            ...styles.teamButton,
                            ...(picks[game.id] === game.awayTeam ? styles.teamButtonSelected : {})
                          }}
                        >
                          <img 
                            src={teamLogos[game.awayTeam]} 
                            alt={game.awayTeam}
                            style={styles.teamLogo}
                          />
                          <span style={styles.teamName}>{game.awayTeam}</span>
                        </button>

                        <div style={styles.vsText}>@</div>

                        <button
                          onClick={() => handlePickSelect(game.id, game.homeTeam)}
                          style={{
                            ...styles.teamButton,
                            ...(picks[game.id] === game.homeTeam ? styles.teamButtonSelected : {})
                          }}
                        >
                          <img 
                            src={teamLogos[game.homeTeam]} 
                            alt={game.homeTeam}
                            style={styles.teamLogo}
                          />
                          <span style={styles.teamName}>{game.homeTeam}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.actions}>
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setEligibilityData(null);
                    setPicks({});
                    setError('');
                  }}
                  style={styles.backButton}
                  disabled={loading}
                >
                  ← Volver a selección
                </button>
                <button
                  onClick={handleSubmit}
                  style={styles.submitButton}
                  disabled={loading || Object.keys(picks).length === 0}
                >
                  {loading ? 'Guardando...' : `Guardar ${Object.keys(picks).length} picks`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px',
    overflowY: 'auto'
  },
  modal: {
    backgroundColor: '#1a1a2e',
    borderRadius: '12px',
    maxWidth: '900px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #2a2a3e',
    backgroundColor: '#16162a'
  },
  title: {
    margin: 0,
    color: '#00d9ff',
    fontSize: '24px',
    fontWeight: 'bold'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '28px',
    cursor: 'pointer',
    padding: '0',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    transition: 'background-color 0.2s'
  },
  content: {
    padding: '20px',
    overflowY: 'auto',
    flex: 1
  },
  error: {
    backgroundColor: '#dc3545',
    color: '#fff',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center'
  },
  success: {
    backgroundColor: '#28a745',
    color: '#fff',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center'
  },
  instruction: {
    color: '#ccc',
    fontSize: '16px',
    marginBottom: '15px'
  },
  membersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  memberButton: {
    backgroundColor: '#2a2a3e',
    border: '2px solid #3a3a4e',
    borderRadius: '8px',
    padding: '15px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left'
  },
  memberInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  memberName: {
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  memberEmail: {
    color: '#888',
    fontSize: '14px'
  },
  userInfo: {
    backgroundColor: '#2a2a3e',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px'
  },
  subtitle: {
    color: '#00d9ff',
    fontSize: '18px',
    marginBottom: '10px'
  },
  userName: {
    color: '#fff',
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '15px'
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '10px',
    marginBottom: '15px'
  },
  statBox: {
    backgroundColor: '#1a1a2e',
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  statLabel: {
    color: '#888',
    fontSize: '12px'
  },
  statValue: {
    color: '#fff',
    fontSize: '18px',
    fontWeight: 'bold'
  },
  warning: {
    backgroundColor: '#fff3cd',
    color: '#856404',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  gamesSection: {
    marginTop: '20px'
  },
  gamesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '15px'
  },
  gameCard: {
    backgroundColor: '#2a2a3e',
    borderRadius: '8px',
    padding: '15px',
    border: '2px solid #3a3a4e'
  },
  gameDate: {
    color: '#888',
    fontSize: '12px',
    marginBottom: '10px',
    textAlign: 'center'
  },
  teamsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    alignItems: 'center'
  },
  teamButton: {
    backgroundColor: '#1a1a2e',
    border: '2px solid #3a3a4e',
    borderRadius: '8px',
    padding: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    transition: 'all 0.2s'
  },
  teamButtonSelected: {
    backgroundColor: '#00d9ff',
    borderColor: '#00d9ff',
    transform: 'scale(1.05)'
  },
  teamLogo: {
    width: '40px',
    height: '40px',
    objectFit: 'contain'
  },
  teamName: {
    color: '#fff',
    fontSize: '14px',
    fontWeight: 'bold',
    flex: 1
  },
  vsText: {
    color: '#888',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  actions: {
    display: 'flex',
    gap: '15px',
    marginTop: '20px',
    justifyContent: 'space-between'
  },
  backButton: {
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  submitButton: {
    backgroundColor: '#00d9ff',
    color: '#1a1a2e',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    flex: 1
  }
};
