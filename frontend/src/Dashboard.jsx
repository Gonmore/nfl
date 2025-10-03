import React, { useEffect, useState, useRef, lazy, Suspense } from 'react';
import { getGames, getUserLeagues, createLeague, joinLeague, getStandings, joinGeneralLeague, getUserPicksDetails, getLeagueStats, updateProfile } from './api';
import { teamLogos } from './teamLogos.js';

// Lazy load componentes pesados
const PickForm = lazy(() => import('./PickForm.jsx'));
const LeagueStats = lazy(() => import('./LeagueStats.jsx'));

export default function Dashboard({ user, token, onLogout }) {
  // Estados optimizados para móvil
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [week, setWeek] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showInviteCode, setShowInviteCode] = useState(null);
  const [standings, setStandings] = useState([]);
  const [previousPositions, setPreviousPositions] = useState({});

  // Estados optimizados para carga progresiva
  const [loadingStates, setLoadingStates] = useState({
    leagues: true,
    standings: false,
    games: false,
    picks: false
  });

  // Estados para notificaciones toast
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Función para mostrar notificaciones toast
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Función para ocultar toast manualmente
  const hideToast = () => {
    setToast({ show: false, message: '', type: 'success' });
  };

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setWindowWidth(width);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [showGameWeekOptions, setShowGameWeekOptions] = useState(false);
  const [isDuringGameWeek, setIsDuringGameWeek] = useState(false);
  const [showScoreView, setShowScoreView] = useState(false);
  const [currentWeekGames, setCurrentWeekGames] = useState([]);
  const [userPicksWithResults, setUserPicksWithResults] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);

  // Estados para la vista de liga en vivo
  const [showLiveLeagueView, setShowLiveLeagueView] = useState(false);
  const [selectedUserForScore, setSelectedUserForScore] = useState(null);
  const [leagueWeeklyStats, setLeagueWeeklyStats] = useState([]);

  // Estados para foto de perfil
  const [profileImage, setProfileImage] = useState(user?.profileImage || null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Obtiene ligas del usuario (carga inicial prioritaria)
  useEffect(() => {
    async function fetchLeagues() {
      try {
        setLoadingStates(prev => ({ ...prev, leagues: true }));
        const res = await getUserLeagues(token);
        setLeagues(res.leagues || []);
        setLoadingStates(prev => ({ ...prev, leagues: false }));
      } catch (err) {
        console.error('Error al cargar ligas:', err);
        setError('Error al cargar ligas');
        showToast('Error al cargar ligas', 'error');
        setLoadingStates(prev => ({ ...prev, leagues: false }));
      }
    }
    fetchLeagues();
  }, [token]);

  // Obtiene standings inmediatamente al cargar el dashboard
  useEffect(() => {
    async function fetchStandings() {
      try {
        setLoadingStates(prev => ({ ...prev, standings: true }));
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
        setLoadingStates(prev => ({ ...prev, standings: false }));
      } catch (err) {
        console.error('Error al cargar standings:', err);
        setLoadingStates(prev => ({ ...prev, standings: false }));
      }
    }

    // Cargar standings inmediatamente al entrar al dashboard
    fetchStandings();
    // Actualizar cada 15 minutos en lugar de 10 para ahorrar batería
    const interval = setInterval(fetchStandings, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [token]);

  // Obtiene partidos (carga diferida para móviles)
  useEffect(() => {
    async function fetchGames() {
      setLoading(true);
      setError('');
      setLoadingStates(prev => ({ ...prev, games: true }));

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
            // Si no hay juegos futuros, usar la semana más alta disponible
            currentWeek = Math.max(...res.games.map(g => g.week));
          }
        }

        // Si no hay juegos disponibles, intentar determinar la semana actual
        // basándonos en la fecha límite típica (jueves 20:00)
        if (!currentWeek) {
          const dayOfWeek = now.getDay(); // 0=domingo, 4=jueves, 1=lunes
          const hour = now.getHours();

          // Si estamos en jueves después de las 20:00, o viernes, sábado, domingo, lunes
          // entonces estamos en jornada de la semana actual
          if ((dayOfWeek === 4 && hour >= 20) ||
              dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0 || dayOfWeek === 1) {
            // Estimar la semana actual basándonos en la fecha
            // Esto es una aproximación - en producción debería venir del backend
            const startOfSeason = new Date('2024-09-05'); // Aproximado
            const diffTime = Math.abs(now - startOfSeason);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            currentWeek = Math.ceil(diffDays / 7);
          }
        }

        setWeek(currentWeek);
        setCurrentWeek(currentWeek);

        // Detectar si estamos en horario de jornada
        if (res.games && res.games.length > 0) {
          const currentWeekGames = res.games.filter(g => g.week === currentWeek);
          const deadline = currentWeekGames.length > 0 ? new Date(Math.min(...currentWeekGames.map(g => new Date(g.date).getTime()))) : null;

          if (deadline) {
            const dayOfWeek = now.getDay(); // 0=domingo, 4=jueves, 1=lunes
            const hour = now.getHours();

            // Jueves después de las 20:00
            const duringGameWeek = (dayOfWeek === 4 && hour >= 20) ||
                                   (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) ||
                                   (dayOfWeek === 1);

            const isDeadlinePassed = deadline && now > deadline;

            setIsDuringGameWeek(duringGameWeek);
          }
        }
      } catch (err) {
        setError('Error al cargar juegos');
        showToast('Error al cargar juegos', 'error');
      }

      setLoading(false);
      setLoadingStates(prev => ({ ...prev, games: false }));
    }

    // En móviles, solo cargar juegos cuando se selecciona una liga
    if (!isMobile || selectedLeague) {
      fetchGames();
    }
  }, [token, isMobile, selectedLeague]);

  // Función para recargar juegos para una semana específica
  async function loadGamesForWeek(targetWeek) {
    try {
      const res = await getGames(token);
      setGames(res.games || []);
    } catch (err) {
      console.error('Error al recargar juegos:', err);
      showToast('Error al recargar juegos', 'error');
    }
  }

  const handleCreateLeague = async (leagueData) => {
    try {
      const res = await createLeague(token, leagueData);
      showToast(res.message, 'success');
      if (res.league) {
        // Recargar ligas para mostrar la nueva
        const resLeagues = await getUserLeagues(token);
        setLeagues(resLeagues.leagues || []);
        // Retornar el código para mostrarlo en el formulario
        return res.league;
      }
    } catch (err) {
      showToast('Error al crear liga', 'error');
      throw err;
    }
  };

  const handleJoinLeague = async (joinData) => {
    try {
      const res = await joinLeague(token, joinData);
      showToast(res.message, 'success');
      if (res.message.includes('correctamente')) {
        // Recargar ligas
        const resLeagues = await getUserLeagues(token);
        setLeagues(resLeagues.leagues || []);
        setShowJoinModal(false); // Cerrar modal
      }
    } catch (err) {
      showToast('Error al unirse a liga', 'error');
    }
  };

  const handleJoinGeneralLeague = async () => {
    try {
      const res = await joinGeneralLeague(token);
      showToast(res.message, 'success');
      if (res.message.includes('correctamente')) {
        // Recargar ligas
        const resLeagues = await getUserLeagues(token);
        setLeagues(resLeagues.leagues || []);
      }
    } catch (err) {
      console.error('Error joining general league:', err);
      showToast('Error al unirse a Liga General.', 'error');
    }
  };

  const handleLeagueSelect = (league) => {
    setSelectedLeague(league);

    // Calcular si estamos en horario de jornada directamente (sin depender de juegos cargados)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=domingo, 4=jueves, 1=lunes
    const hour = now.getHours();

    // Jueves después de las 20:00
    const duringGameWeek = (dayOfWeek === 4 && hour >= 20) ||
                           (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) ||
                           (dayOfWeek === 1);

    // Mostrar opciones de jornada si estamos en horario de jornada
    if (duringGameWeek) {
      setShowGameWeekOptions(true);
    }
  };

  const filteredGames = games.filter(g => g.week === week);

  // Funciones para manejar foto de perfil
  const handleImageUpload = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileClick = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleEditProfile = () => {
    setShowProfileDropdown(false);
    setShowProfileModal(true);
  };

  const handleLogout = () => {
    setShowProfileDropdown(false);
    onLogout();
  };

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.profile-container')) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown]);

  // Función para manejar actualización del perfil
  const handleProfileUpdate = (updatedUser) => {
    // Aquí podrías actualizar el estado del usuario si es necesario
    // Por ahora, solo aseguramos que la imagen se actualice correctamente
    if (updatedUser.profileImage !== undefined) {
      setProfileImage(updatedUser.profileImage);
    }
  };

  // Modal de opciones de jornada
  if (showGameWeekOptions && selectedLeague && week === currentWeek) {
    return (
      <div style={{
        minHeight: '100vh',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          border: '3px solid #004B9B',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          backdropFilter: 'blur(10px)',
          maxWidth: '500px',
          width: '100%',
          padding: '32px'
        }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '32px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                fontSize: '24px',
                fontWeight: '700',
                color: '#004B9B',
                marginBottom: '16px'
              }}>
                <img
                  src='/img/logo_MVPicks.png'
                  alt='CartelNFL Logo'
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '4px'
                  }}
                />
                Jornada en Juego
              </div>
              <p style={{
                color: '#4A5568',
                fontSize: '16px',
                margin: '0'
              }}>
                La semana {week} está en curso. ¿Qué deseas hacer en <strong>{selectedLeague.name}</strong>?
              </p>
            </div>          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            <button
              onClick={async () => {
                setLoading(true);
                try {
                  // Cargar juegos de la semana actual
                  const gamesResponse = await getGames(token);
                  const weekGames = gamesResponse.games.filter(g => g.week === week);
                  setCurrentWeekGames(weekGames);

                  // Cargar picks del usuario para esta semana con resultados
                  const picksResponse = await getUserPicksDetails(token, selectedLeague.id, week);
                  setUserPicksWithResults(picksResponse.details || []);

                  // Obtener el total de puntos de la semana desde las estadísticas
                  const statsResponse = await getLeagueStats(token, selectedLeague.id, week);
                  const userWeeklyStats = statsResponse.weekly.find(u => u.userId === user.id);
                  const totalPoints = userWeeklyStats ? userWeeklyStats.points : 0;
                  setTotalPoints(totalPoints);

                  setShowGameWeekOptions(false);
                  setShowScoreView(true);
                } catch (error) {
                  console.error('Error loading score data:', error);
                  showToast('Error al cargar los datos del score. Inténtalo de nuevo.', 'error');
                } finally {
                  setLoading(false);
                }
              }}
              style={{
                background: 'linear-gradient(135deg, #38A169 0%, #2F855A 100%)',
                color: 'white',
                border: 'none',
                padding: '20px',
                borderRadius: '16px',
                fontSize: '18px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                boxShadow: '0 6px 20px rgba(56, 161, 105, 0.4)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 10px 30px rgba(56, 161, 105, 0.6)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 6px 20px rgba(56, 161, 105, 0.4)';
              }}
            >
              <span style={{ fontSize: '24px' }}>📊</span>
              Ver mi Score - Semana {week}
            </button>

            <button
              onClick={() => {
                setShowGameWeekOptions(false);
                // Cuando se elige hacer picks de la siguiente semana, incrementar la semana y recargar juegos
                const nextWeek = week + 1;
                setWeek(nextWeek);
                // Recargar juegos para incluir la nueva semana
                loadGamesForWeek(nextWeek);
              }}
              style={{
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                color: 'white',
                border: 'none',
                padding: '20px',
                borderRadius: '16px',
                fontSize: '18px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                boxShadow: '0 6px 20px rgba(79, 70, 229, 0.4)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 10px 30px rgba(79, 70, 229, 0.6)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 6px 20px rgba(79, 70, 229, 0.4)';
              }}
            >
              <span style={{ fontSize: '24px' }}>🎯</span>
              Hacer Picks - Semana {week + 1}
            </button>

            <button
              onClick={async () => {
                setLoading(true);
                try {
                  // Cargar estadísticas semanales de la liga
                  const statsResponse = await getLeagueStats(token, selectedLeague.id, week);
                  setLeagueWeeklyStats(statsResponse.weekly || []);
                  
                  setShowGameWeekOptions(false);
                  setShowLiveLeagueView(true);
                } catch (error) {
                  console.error('Error loading league stats:', error);
                  showToast('Error al cargar estadísticas de la liga. Inténtalo de nuevo.', 'error');
                } finally {
                  setLoading(false);
                }
              }}
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: 'white',
                border: 'none',
                padding: '20px',
                borderRadius: '16px',
                fontSize: '18px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                boxShadow: '0 6px 20px rgba(5, 150, 105, 0.4)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 10px 30px rgba(5, 150, 105, 0.6)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 6px 20px rgba(5, 150, 105, 0.4)';
              }}
            >
              <span style={{ fontSize: '24px' }}>🏆</span>
              Ver Liga en Vivo
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <button
              onClick={() => {
                setShowGameWeekOptions(false);
                setSelectedLeague(null);
              }}
              style={{
                background: 'linear-gradient(135deg, #6C757D 0%, #5A6268 100%)',
                color: '#FFFFFF',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(108, 117, 125, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(108, 117, 125, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(108, 117, 125, 0.3)';
              }}
            >
              <span style={{ fontSize: '16px' }}>←</span>
              Cambiar Liga
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vista de score durante jornada en juego
  if (showScoreView && selectedLeague) {
    return (
      <div style={{
        minHeight: '100vh',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          border: '3px solid #004B9B',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          backdropFilter: 'blur(10px)',
          maxWidth: '800px',
          width: '100%',
          padding: windowWidth <= 480 ? '16px' : '32px'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: windowWidth <= 480 ? '12px' : '24px'
          }}>
            <h2 style={{
              margin: 0,
              fontSize: windowWidth <= 480 ? '18px' : '24px',
              fontWeight: '800',
              color: '#004B9B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}>
              <img
                src='/img/logo_MVPicks.png'
                alt='CartelNFL Logo'
                style={{
                  width: windowWidth <= 480 ? '48px' : '64px',
                  height: windowWidth <= 480 ? '48px' : '64px',
                  borderRadius: '4px'
                }}
              />
              {selectedUserForScore ? `Score de ${selectedUserForScore.username}` : 'Mi Score'} - Semana {week}
            </h2>
            <p style={{ color: '#4A5568', margin: '8px 0 0 0' }}>
              Liga: {selectedLeague.name}
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: windowWidth <= 359 ? '1fr' : windowWidth <= 480 ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: windowWidth <= 480 ? '6px' : '8px',
            marginBottom: windowWidth <= 480 ? '12px' : '16px'
          }}>
            {currentWeekGames.map(game => {
              const userPick = userPicksWithResults.find(p => p.gameId === game.id);
              const isCorrect = userPick && userPick.correct;
              const isFinished = game.winner !== null || game.status === 'STATUS_FINAL';
              const isTie = game.status === 'STATUS_FINAL' && game.winner === null;
              
              return (
                <div key={game.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: windowWidth <= 480 ? '6px' : '12px',
                  backgroundColor: isFinished 
                    ? (isTie ? 'rgba(99, 102, 241, 0.1)' : (isCorrect ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'))
                    : 'rgba(240, 240, 240, 0.9)',
                  borderRadius: '12px',
                  border: `2px solid ${isFinished 
                    ? (isTie ? '#6366F1' : (isCorrect ? '#22C55E' : '#EF4444'))
                    : 'rgba(0, 44, 95, 0.2)'}`,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  gap: '8px',
                  position: 'relative'
                }}>
                  {/* Indicador de puntos */}
                  {isFinished && userPick && (
                    <div style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      backgroundColor: isTie ? '#6366F1' : (isCorrect ? '#22C55E' : '#EF4444'),
                      color: 'white',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                    }}>
                      {userPick.points}
                    </div>
                  )}

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: windowWidth <= 480 ? '4px' : '8px'
                }}>
                  <div style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    width: windowWidth <= 480 ? '34px' : '40px',
                    height: windowWidth <= 480 ? '34px' : '40px',
                    border: userPick && userPick.pick === game.awayTeam ? '3px solid #002C5F' : '3px solid transparent',
                    boxShadow: userPick && userPick.pick === game.awayTeam ? '0 0 0 2px rgba(0, 44, 95, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.15)',
                    opacity: userPick && userPick.pick === game.awayTeam ? 1 : 0.6
                  }}>
                    <img
                      src={teamLogos[game.awayTeam]}
                      alt={game.awayTeam}
                      style={{
                        width: windowWidth <= 480 ? '30px' : '36px',
                        height: windowWidth <= 480 ? '30px' : '36px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.src = `https://a.espncdn.com/i/teamlogos/nfl/500/${game.awayTeam.toLowerCase()}.png`;
                      }}
                    />
                  </div>

                  <div style={{
                    fontSize: windowWidth <= 480 ? '12px' : '16px',
                    fontWeight: '600',
                    color: '#002C5F'
                  }}>
                    vs
                  </div>

                  <div style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    width: windowWidth <= 480 ? '34px' : '40px',
                    height: windowWidth <= 480 ? '34px' : '40px',
                    border: userPick && userPick.pick === game.homeTeam ? '3px solid #002C5F' : '3px solid transparent',
                    boxShadow: userPick && userPick.pick === game.homeTeam ? '0 0 0 2px rgba(0, 44, 95, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.15)',
                    opacity: userPick && userPick.pick === game.homeTeam ? 1 : 0.6
                  }}>
                    <img
                      src={teamLogos[game.homeTeam]}
                      alt={game.homeTeam}
                      style={{
                        width: windowWidth <= 480 ? '30px' : '36px',
                        height: windowWidth <= 480 ? '30px' : '36px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.src = `https://a.espncdn.com/i/teamlogos/nfl/500/${game.homeTeam.toLowerCase()}.png`;
                      }}
                    />
                  </div>
                </div>
                </div>
              );
            })}
          </div>

          <div style={{
            textAlign: 'center',
            padding: windowWidth <= 480 ? '16px' : '24px',
            background: 'linear-gradient(135deg, #004B9B 0%, #0066CC 100%)',
            borderRadius: '16px',
            color: 'white'
          }}>
            <div style={{ fontSize: '18px', marginBottom: '8px', opacity: 0.9 }}>
              Puntos Totales - Semana {week}
            </div>
            <div style={{ fontSize: windowWidth <= 480 ? '36px' : '48px', fontWeight: '900', textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
              {totalPoints}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: windowWidth <= 480 ? '16px' : '20px' }}>
            <button
              onClick={() => {
                setShowScoreView(false);
                setSelectedUserForScore(null);
                if (selectedUserForScore) {
                  // Si vino desde la liga en vivo, volver ahí
                  setShowLiveLeagueView(true);
                } else {
                  // Si vino desde las opciones, volver ahí
                  setShowGameWeekOptions(true);
                }
              }}
              style={{
                background: 'linear-gradient(135deg, #6C757D 0%, #5A6268 100%)',
                color: '#FFFFFF',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(108, 117, 125, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(108, 117, 125, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(108, 117, 125, 0.3)';
              }}
            >
              <span style={{ fontSize: '16px' }}>←</span>
              Volver
            </button>
            <button
              onClick={() => {
                setShowScoreView(false);
                setSelectedLeague(null);
              }}
              style={{
                background: 'linear-gradient(135deg, #004B9B 0%, #0066CC 100%)',
                color: '#FFFFFF',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(0, 75, 155, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(0, 75, 155, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(0, 75, 155, 0.3)';
              }}
            >
              Cambiar Liga
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vista de liga en vivo durante jornada en juego
  if (showLiveLeagueView && selectedLeague) {
    return (
      <div style={{
        minHeight: '100vh',
        padding: windowWidth <= 400 ? '8px' : '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          border: '3px solid #004B9B',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          backdropFilter: 'blur(10px)',
          maxWidth: '900px',
          width: '100%',
          padding: windowWidth <= 400 ? '12px' : windowWidth <= 480 ? '16px' : '32px'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: windowWidth <= 480 ? '12px' : '24px'
          }}>
            <h2 style={{
              margin: 0,
              fontSize: windowWidth <= 400 ? '16px' : windowWidth <= 480 ? '18px' : '24px',
              fontWeight: '800',
              color: '#004B9B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}>
              <img
                src='/img/logo_MVPicks.png'
                alt='CartelNFL Logo'
                style={{
                  width: windowWidth <= 400 ? '40px' : windowWidth <= 480 ? '48px' : '64px',
                  height: windowWidth <= 400 ? '40px' : windowWidth <= 480 ? '48px' : '64px',
                  borderRadius: '4px'
                }}
              />
              Liga en Vivo - Semana {week}
            </h2>
            <p style={{ color: '#4A5568', margin: windowWidth <= 400 ? '4px 0 0 0' : '8px 0 0 0' }}>
              Liga: {selectedLeague.name}
            </p>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: windowWidth <= 400 ? '10px' : '16px',
            marginBottom: windowWidth <= 400 ? '12px' : windowWidth <= 480 ? '16px' : '24px'
          }}>
            {leagueWeeklyStats
              .sort((a, b) => b.points - a.points)
              .map((user, index) => (
                <div
                  key={user.userId}
                  onClick={async () => {
                    setLoading(true);
                    try {
                      // Cargar juegos de la semana actual
                      const gamesResponse = await getGames(token);
                      const weekGames = gamesResponse.games.filter(g => g.week === week);
                      setCurrentWeekGames(weekGames);

                      // Cargar picks del usuario seleccionado para esta semana con resultados
                      const picksResponse = await getUserPicksDetails(token, selectedLeague.id, week, user.userId);
                      setUserPicksWithResults(picksResponse.details || []);

                      // Obtener el total de puntos del usuario seleccionado
                      const userWeeklyStats = leagueWeeklyStats.find(u => u.userId === user.userId);
                      const totalPoints = userWeeklyStats ? userWeeklyStats.points : 0;
                      setTotalPoints(totalPoints);

                      // Establecer el usuario seleccionado
                      setSelectedUserForScore({
                        userId: user.userId,
                        username: user.user,
                        profileImage: user.profileImage
                      });

                      setShowLiveLeagueView(false);
                      setShowScoreView(true);
                    } catch (error) {
                      console.error('Error loading user score data:', error);
                      showToast('Error al cargar los datos del score. Inténtalo de nuevo.', 'error');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  style={{
                    background: index === 0
                      ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                      : index === 1
                      ? 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)'
                      : index === 2
                      ? 'linear-gradient(135deg, #CD7F32 0%, #A0522D 100%)'
                      : 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
                    borderRadius: '12px',
                    border: '2px solid #E2E8F0',
                    padding: windowWidth <= 400 ? '8px' : windowWidth <= 480 ? '12px' : '20px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: windowWidth <= 400 ? '8px' : '16px'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-4px)';
                    e.target.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
                    e.target.style.borderColor = '#004B9B';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.08)';
                    e.target.style.borderColor = '#E2E8F0';
                  }}
                >
                  {/* Posición y medalla */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    minWidth: windowWidth <= 400 ? '60px' : '80px'
                  }}>
                    <div style={{
                      width: windowWidth <= 400 ? '32px' : '40px',
                      height: windowWidth <= 400 ? '32px' : '40px',
                      borderRadius: '50%',
                      backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#004B9B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: windowWidth <= 400 ? '14px' : '18px',
                      fontWeight: 'bold',
                      color: index <= 2 ? '#000' : '#FFF',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                    }}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </div>
                  </div>

                  {/* Información del usuario */}
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: windowWidth <= 400 ? '4px' : '8px'
                  }}>
                    {/* Foto de perfil */}
                    <div style={{
                      width: windowWidth <= 400 ? '36px' : '50px',
                      height: windowWidth <= 400 ? '36px' : '50px',
                      borderRadius: '50%',
                      backgroundColor: user.profileImage ? 'transparent' : '#004B9B',
                      border: '2px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={user.user}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: windowWidth <= 400 ? '16px' : '20px', color: '#FFFFFF' }}>👤</span>
                      )}
                    </div>

                    {/* Nombre de usuario y score */}
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px'
                    }}>
                      {/* Nombre de usuario */}
                      <div style={{
                        fontSize: user.profileImage 
                          ? (windowWidth <= 400 ? '14px' : windowWidth <= 480 ? '16px' : '18px')
                          : (windowWidth <= 400 ? '16px' : windowWidth <= 480 ? '18px' : '20px'),
                        fontWeight: user.profileImage ? '700' : '900',
                        color: index <= 2 ? '#000' : '#004B9B',
                        textShadow: user.profileImage ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.1)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: '1.2',
                        textAlign: 'center'
                      }}>
                        {user.user}
                      </div>

                      {/* Score/Puntos */}
                      <div style={{
                        fontSize: windowWidth <= 400 ? '11px' : windowWidth <= 480 ? '13px' : '14px',
                        fontWeight: '800',
                        color: index <= 2 ? '#000' : '#12B900',
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                        backgroundColor: index <= 2 ? 'rgba(255, 255, 255, 0.8)' : 'rgba(18, 185, 0, 0.1)',
                        padding: '0px 2px',
                        borderRadius: '3px',
                        display: 'inline-block',
                        textAlign: 'center',
                        border: index <= 2 ? '1px solid rgba(0, 0, 0, 0.2)' : '1px solid rgba(18, 185, 0, 0.3)',
                        width: '60%',
                        margin: '0 auto'
                      }}>
                        {user.points || 0} pts
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: windowWidth <= 400 ? '8px' : windowWidth <= 480 ? '16px' : '20px' }}>
            <button
              onClick={() => {
                setShowLiveLeagueView(false);
                setShowGameWeekOptions(true);
              }}
              style={{
                background: 'linear-gradient(135deg, #6C757D 0%, #5A6268 100%)',
                color: '#FFFFFF',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(108, 117, 125, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(108, 117, 125, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(108, 117, 125, 0.3)';
              }}
            >
              <span style={{ fontSize: '16px' }}>←</span>
              Volver
            </button>
            <button
              onClick={() => {
                setShowLiveLeagueView(false);
                setSelectedLeague(null);
              }}
              style={{
                background: 'linear-gradient(135deg, #004B9B 0%, #0066CC 100%)',
                color: '#FFFFFF',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(0, 75, 155, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(0, 75, 155, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(0, 75, 155, 0.3)';
              }}
            >
              Cambiar Liga
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedLeague) {
    return (
      <div style={{
        minHeight: '100vh',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {/* Header principal */}
          <div style={{
            gridColumn: '1 / -1',
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(0, 44, 95, 0.1) 20px, rgba(0, 44, 95, 0.1) 21px)',
            borderRadius: '20px',
            padding: '12px 16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            border: '3px solid #004B9B',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <img
                  src='/img/logo_MVPicks.png'
                  alt='CartelNFL Logo'
                  style={{
                    width: '86px',
                    height: '86px',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
                  }}
                  onClick={() => setSelectedLeague(null)}
                />
                <div>
                  <p style={{
                    color: '#4A5568',
                    margin: '4px 0 0 0',
                    fontSize: '16px',
                    fontWeight: '900'
                  }}>
                    Bienvenido, {user?.username || 'Usuario'}
                  </p>
                </div>
              </div>
              {/* Foto de perfil con dropdown */}
              <div className="profile-container" style={{ position: 'relative' }}>
                <div
                  onClick={handleProfileClick}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: profileImage ? 'transparent' : '#004B9B',
                    border: '2px solid #004B9B',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0, 75, 155, 0.3)',
                    transition: 'all 0.3s ease',
                    overflow: 'hidden'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 6px 16px rgba(0, 75, 155, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 4px 12px rgba(26, 54, 93, 0.3)';
                  }}
                  title="Perfil"
                >
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Foto de perfil"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: '18px', color: '#FFFFFF' }}>👤</span>
                  )}
                </div>

                {/* Dropdown del perfil */}
                {showProfileDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '50px',
                    right: '0',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                    border: '2px solid #E2E8F0',
                    zIndex: 1000,
                    minWidth: '180px',
                    overflow: 'hidden'
                  }}>
                    <button
                      onClick={handleEditProfile}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#004B9B',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = '#F8FAFC';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>⚙️</span>
                      Editar Perfil
                    </button>
                    <div style={{
                      height: '1px',
                      backgroundColor: '#E2E8F0',
                      margin: '0 8px'
                    }}></div>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#E53E3E',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = '#FFF5F5';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>⏻</span>
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Panel de Ligas - Arriba */}
          <div style={{
            backgroundColor: 'transparent',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            border: '3px solid #004B9B',
            overflow: 'hidden',
            maxWidth: '800px',
            margin: '0 auto',
            width: '100%'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #004B9B 0%, #0066CC 100%)',
              color: '#FFFFFF',
              padding: '12px 20px',
              borderBottom: '2px solid #4A5568'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h2 style={{
                  margin: 0,
                  fontSize: '20px',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  letterSpacing: '-0.3px',
                  color: 'white'
                }}>
                  <span style={{ fontSize: '24px' }}>🏆</span>
                  Mis Ligas
                </h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setShowCreate(true)}
                    style={{
                      backgroundColor: '#12B900',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '6px',
                      borderRadius: '12px',
                      fontSize: '16px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '36px',
                      height: '36px',
                      boxShadow: '0 4px 12px rgba(18, 185, 0, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = '#0F9900';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 16px rgba(18, 185, 0, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = '#12B900';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(18, 185, 0, 0.3)';
                    }}
                    title="Crear Liga"
                  >
                    <span style={{ fontSize: '16px', color: '#FFFFFF' }}>➕</span>
                  </button>
                  <button
                    onClick={() => setShowJoinModal(true)}
                    style={{
                      backgroundColor: '#3182CE',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '6px',
                      borderRadius: '12px',
                      fontSize: '16px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '36px',
                      height: '36px',
                      boxShadow: '0 4px 12px rgba(49, 130, 206, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = '#2C5282';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 16px rgba(49, 130, 206, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = '#3182CE';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(49, 130, 206, 0.3)';
                    }}
                    title="Unirse a Liga"
                  >
                    <span style={{ fontSize: '16px' }}>🔗</span>
                  </button>
                </div>
              </div>
            </div>
            <div style={{ padding: '20px' }}>
              {leagues.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '32px 20px',
                  background: 'linear-gradient(135deg, #F7FAFC 0%, #EDF2F7 100%)',
                  borderRadius: '16px',
                  border: '2px solid #E2E8F0'
                }}>
                  <div style={{
                    fontSize: '48px',
                    marginBottom: '16px',
                    opacity: 0.7
                  }}>
                    ⚽
                  </div>
                  <h3 style={{
                    margin: '0 0 12px 0',
                    fontSize: '16px',
                    color: '#2D3748',
                    fontWeight: '700'
                  }}>
                    ¡Comienza tu aventura NFL!
                  </h3>
                  <p style={{
                    margin: '0 0 20px 0',
                    fontSize: '14px',
                    color: '#718096',
                    lineHeight: '1.5'
                  }}>
                    Únete a la "Liga General" o crea tu propia liga para competir con amigos.
                  </p>
                  <button
                    onClick={handleJoinGeneralLeague}
                    style={{
                      background: 'linear-gradient(135deg, #1A365D 0%, #2D3748 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '14px 24px',
                      borderRadius: '16px',
                      fontSize: '15px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      margin: '0 auto',
                      boxShadow: '0 4px 16px rgba(26, 54, 93, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(0, 75, 155, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 16px rgba(0, 75, 155, 0.3)';
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>🚀</span>
                    Unirse a Liga General
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {leagues.map(league => (
                    <div
                      key={league.id}
                      style={{
                        background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
                        borderRadius: '16px',
                        border: '2px solid #E2E8F0',
                        overflow: 'hidden',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.transform = 'translateY(-4px)';
                        e.target.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
                        e.target.style.borderColor = '#004B9B';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.08)';
                        e.target.style.borderColor = '#E2E8F0';
                      }}
                    >
                      <button
                        onClick={() => handleLeagueSelect(league)}
                        style={{
                          width: '100%',
                          background: 'none',
                          border: 'none',
                          padding: '16px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}
                      >
                        <div style={{
                          background: 'linear-gradient(135deg, #004B9B 0%, #0066CC 100%)',
                          color: '#FFFFFF',
                          width: '40px',
                          height: '40px',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                          flexShrink: 0
                        }}>
                          🏈
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: '15px',
                            fontWeight: '700',
                            color: '#004B9B',
                            marginBottom: '4px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {league.name}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#718096',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <span style={{ fontSize: '14px' }}>
                              {league.isPublic ? '🌐' : '🔒'}
                            </span>
                            {league.isPublic ? 'Pública' : 'Privada'}
                          </div>
                        </div>
                      </button>
                      {(() => {
                        // La liga general nunca debe mostrar botón de invitar
                        if (league.name === 'Liga general') {
                          return null;
                        }

                        const shouldShowButton = (league.isPublic && league.name !== 'Liga general') || league.isAdmin;
                        return shouldShowButton ? (
                          <div style={{
                            padding: '0 16px 16px 16px',
                            borderTop: '1px solid #E2E8F0'
                          }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowInviteCode(league);
                              }}
                              style={{
                                backgroundColor: '#12B900',
                                color: '#FFFFFF',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '12px',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                width: '100%',
                                justifyContent: 'center',
                                boxShadow: '0 2px 8px rgba(18, 185, 0, 0.2)',
                                transition: 'all 0.3s ease'
                              }}
                              onMouseOver={(e) => {
                                e.target.style.backgroundColor = '#0F9900';
                                e.target.style.transform = 'translateY(-1px)';
                                e.target.style.boxShadow = '0 4px 12px rgba(18, 185, 0, 0.3)';
                              }}
                              onMouseOut={(e) => {
                                e.target.style.backgroundColor = '#12B900';
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 2px 8px rgba(18, 185, 0, 0.2)';
                              }}
                              title="Invitar miembros"
                            >
                              <span style={{ fontSize: '14px' }}>📤</span>
                              Invitar
                            </button>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Panel de Standings NFL - Abajo */}
          <div style={{
            backgroundColor: 'transparent',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            border: '3px solid #004B9B',
            overflow: 'hidden',
            maxWidth: '1200px',
            margin: '0 auto',
            width: '100%'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #004B9B 0%, #0066CC 100%)',
              color: '#FFFFFF',
              padding: '16px 20px',
              borderBottom: '2px solid #4A5568'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '22px',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                letterSpacing: '-0.3px',
                color: 'white'
              }}>
                <span style={{ fontSize: '26px' }}>📊</span>
                Standings NFL
              </h2>
            </div>
            <div style={{ padding: '20px' }}>
              {loadingStates.standings ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '40px 20px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '16px',
                  border: '2px solid #E2E8F0'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #E2E8F0',
                    borderTop: '4px solid #004B9B',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginBottom: '16px'
                  }}></div>
                  <p style={{
                    margin: 0,
                    color: '#4A5568',
                    fontSize: '16px',
                    fontWeight: '600',
                    textAlign: 'center'
                  }}>
                    Cargando standings de la NFL...
                  </p>
                  <p style={{
                    margin: '8px 0 0 0',
                    color: '#718096',
                    fontSize: '14px',
                    textAlign: 'center'
                  }}>
                    🔄 Se actualizan automáticamente cada 10 minutos
                  </p>
                </div>
              ) : (
                <div style={{
                  maxHeight: '400px',
                  overflowY: 'auto',
                  overflowX: 'auto',
                  borderRadius: '16px',
                  border: '2px solid #E2E8F0',
                  backgroundColor: '#FFFFFF'
                }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    margin: 0,
                    fontSize: '14px',
                    minWidth: '100%'
                  }}>
                    <thead>
                      <tr style={{
                        background: 'linear-gradient(135deg, #004B9B 0%, #0066CC 100%)',
                        borderBottom: '3px solid #4A5568',
                        position: 'sticky',
                        top: 0,
                        zIndex: 1
                      }}>
                        <th style={{
                          padding: '8px 2px',
                          textAlign: 'center',
                          fontWeight: '800',
                          color: '#FFFFFF',
                          width: '15%',
                          fontSize: '12px',
                          letterSpacing: '0.5px'
                        }}>
                          POS
                        </th>
                        <th style={{
                          padding: '8px 2px',
                          textAlign: 'center',
                          fontWeight: '800',
                          color: '#FFFFFF',
                          width: '25%',
                          fontSize: '12px',
                          letterSpacing: '0.5px'
                        }}>
                          TEAM
                        </th>
                        <th style={{
                          padding: '8px 2px',
                          textAlign: 'center',
                          fontWeight: '800',
                          color: '#FFFFFF',
                          width: '20%',
                          fontSize: '12px',
                          letterSpacing: '0.5px'
                        }}>
                          W
                        </th>
                        <th style={{
                          padding: '8px 2px',
                          textAlign: 'center',
                          fontWeight: '800',
                          color: '#FFFFFF',
                          width: '20%',
                          fontSize: '12px',
                          letterSpacing: '0.5px'
                        }}>
                          L
                        </th>
                        <th style={{
                          padding: '8px 2px',
                          textAlign: 'center',
                          fontWeight: '800',
                          color: '#FFFFFF',
                          width: '20%',
                          fontSize: '12px',
                          letterSpacing: '0.5px'
                        }}>
                          T
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((team, index) => (
                        <tr key={team.id} style={{
                          borderBottom: index < standings.length - 1 ? '1px solid #E2E8F0' : 'none',
                          transition: 'all 0.2s ease',
                          backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F8FAFC'
                        }}
                        onMouseOver={(e) => {
                          e.target.closest('tr').style.backgroundColor = '#EDF2F7';
                          e.target.closest('tr').style.transform = 'scale(1.01)';
                        }}
                        onMouseOut={(e) => {
                          e.target.closest('tr').style.backgroundColor = index % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
                          e.target.closest('tr').style.transform = 'scale(1)';
                        }}
                        >
                          <td style={{
                            padding: '8px 2px',
                            textAlign: 'center',
                            fontWeight: '700',
                            color: '#004B9B',
                            fontSize: '13px'
                          }}>
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '1px'
                            }}>
                              <span style={{ fontSize: '14px', fontWeight: '800' }}>
                                {team.position}
                              </span>
                              {team.change !== 0 && (
                                <span style={{
                                  fontSize: '10px',
                                  color: team.change > 0 ? '#38A169' : '#E53E3E',
                                  fontWeight: '700',
                                  backgroundColor: team.change > 0 ? '#C6F6D5' : '#FED7D7',
                                  padding: '1px 4px',
                                  borderRadius: '6px',
                                  minWidth: '16px',
                                  textAlign: 'center'
                                }}>
                                  {team.change > 0 ? '↑' : '↓'}
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '8px 2px' }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <div style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                border: '1px solid #E2E8F0',
                                flexShrink: 0
                              }}>
                                <img
                                  src={team.logo}
                                  alt={team.abbreviation}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain'
                                  }}
                                  onError={(e) => {
                                    e.target.src = `https://a.espncdn.com/i/teamlogos/nfl/500/${team.abbreviation.toLowerCase()}.png`;
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                          <td style={{
                            padding: '8px 2px',
                            textAlign: 'center',
                            fontSize: '13px',
                            fontWeight: '700',
                            color: '#12B900',
                            backgroundColor: '#E8F5E8',
                            borderRadius: '6px',
                            margin: '0 2px'
                          }}>
                            {team.wins}
                          </td>
                          <td style={{
                            padding: '8px 2px',
                            textAlign: 'center',
                            fontSize: '13px',
                            fontWeight: '700',
                            color: '#E53E3E',
                            backgroundColor: '#FFF5F5',
                            borderRadius: '6px',
                            margin: '0 2px'
                          }}>
                            {team.losses}
                          </td>
                          <td style={{
                            padding: '8px 2px',
                            textAlign: 'center',
                            fontSize: '13px',
                            fontWeight: '700',
                            color: '#718096',
                            backgroundColor: '#F7FAFC',
                            borderRadius: '6px',
                            margin: '0 2px'
                          }}>
                            {team.ties}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div style={{
                marginTop: '16px',
                fontSize: '12px',
                color: '#718096',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                flexWrap: 'wrap'
              }}>
                <span style={{
                  color: '#12B900',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#C8E6C9',
                  padding: '4px 8px',
                  borderRadius: '12px'
                }}>
                  <span>↑</span> Subió
                </span>
                <span style={{
                  color: '#E53E3E',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#FED7D7',
                  padding: '4px 8px',
                  borderRadius: '12px'
                }}>
                  <span>↓</span> Bajó
                </span>
                <span style={{
                  color: '#4A5568',
                  fontSize: '11px',
                  backgroundColor: '#EDF2F7',
                  padding: '4px 8px',
                  borderRadius: '12px'
                }}>
                  🔄 Auto cada 10 min
                </span>
              </div>
            </div>
          </div>

          {/* Modales */}
          {showCreate && (
            <CreateLeagueModal
              onCreate={handleCreateLeague}
              onClose={() => setShowCreate(false)}
            />
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

          {showProfileModal && (
            <ProfileModal
              onClose={() => setShowProfileModal(false)}
              profileImage={profileImage}
              onImageUpload={handleImageUpload}
              user={user}
              token={token}
              onProfileUpdate={handleProfileUpdate}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: '16px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(0, 44, 95, 0.1) 20px, rgba(0, 44, 95, 0.1) 21px)',
            padding: '12px 16px',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            border: '2px solid #002C5F'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <img
                src='/img/logo_MVPicks.png'
                alt='CartelNFL Logo'
                style={{
                  width: '64px',
                  height: '64px',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
                }}
                onClick={() => setSelectedLeague(null)}
              />
              <h1 style={{
                color: '#002C5F',
                margin: 0,
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                Liga: {selectedLeague.name}
              </h1>
            </div>
            <button
              onClick={() => setSelectedLeague(null)}
              style={{
                background: 'linear-gradient(135deg, #004B9B 0%, #0066CC 100%)',
                color: '#FFFFFF',
                border: 'none',
                padding: '4px 4px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                width: 'fit-content',
                minWidth: 'auto',
                boxShadow: '0 4px 12px rgba(0, 75, 155, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(0, 75, 155, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(0, 75, 155, 0.3)';
              }}
            >
              Cambiar Liga
              <span style={{ fontSize: '14px' }}>←</span>
            </button>
          </div>        {loading ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner"></div>
            <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>
              Cargando juegos...
            </p>
          </div>
        ) : error ? (
          <div className="card" style={{
            backgroundColor: '#f8d7da',
            borderColor: '#f5c6cb'
          }}>
            <div className="card-body" style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--error-color)', fontSize: '16px' }}>
                ⚠️ {error}
              </div>
            </div>
          </div>
        ) : (
          <PickForm games={filteredGames} token={token} leagueId={selectedLeague.id} week={week} currentWeek={currentWeek} />
        )}

        {selectedLeague && week ? (
          <LeagueStats token={token} leagueId={selectedLeague.id} week={week} />
        ) : (
          <div className="card" style={{
            backgroundColor: 'var(--background-secondary)',
            textAlign: 'center',
            padding: '24px'
          }}>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              Cargando estadísticas...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente modal para crear liga
function CreateLeagueModal({ onCreate, onClose }) {
  const [name, setName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [description, setDescription] = useState('');
  const [createdCode, setCreatedCode] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await onCreate({ name, isPublic, description });
      if (result && result.inviteCode) {
        setCreatedCode(result.inviteCode);
      }
    } catch (error) {
      console.error('Error creating league:', error);
    } finally {
      setLoading(false);
    }
  };

  if (createdCode) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          border: '2px solid #002C5F'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <h2 style={{ margin: 0, color: '#002C5F' }}>🎉 ¡Liga Creada!</h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666666',
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

          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              fontSize: '18px',
              marginBottom: '8px',
              color: '#002C5F'
            }}>
              Tu liga "<strong>{name}</strong>" ha sido creada exitosamente.
            </div>
            <p style={{
              color: '#666666',
              marginBottom: '16px'
            }}>
              Comparte este código con tus amigos para que se unan a la liga:
            </p>
            <div style={{
              backgroundColor: '#F8F9FA',
              padding: '16px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#002C5F',
              letterSpacing: '2px',
              marginBottom: '20px',
              border: '2px solid #002C5F'
            }}>
              {createdCode}
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center'
          }}>
            <button
              onClick={() => {
                setCreatedCode(null);
                setName('');
                setDescription('');
              }}
              style={{
                backgroundColor: '#6C757D',
                color: '#FFFFFF',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Crear Otra Liga
            </button>
            <button
              onClick={onClose}
              style={{
                backgroundColor: '#002C5F',
                color: '#FFFFFF',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '500px',
        width: '100%',
        border: '2px solid #002C5F'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{ margin: 0, color: '#002C5F' }}>➕ Crear Liga</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666666',
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
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#002C5F'
            }}>
              Nombre de la Liga *
            </label>
            <input
              type="text"
              placeholder="Ej: Liga de Amigos NFL"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #DEE2E6',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={e => setIsPublic(e.target.checked)}
                disabled={loading}
                style={{ width: '16px', height: '16px' }}
              />
              <span style={{
                fontWeight: '600',
                color: '#002C5F'
              }}>
                Liga Pública
              </span>
            </label>
            <small style={{
              color: '#666666',
              fontSize: '12px',
              display: 'block',
              marginTop: '4px'
            }}>
              Las ligas públicas pueden ser encontradas por cualquier usuario
            </small>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#002C5F'
            }}>
              Descripción (opcional)
            </label>
            <textarea
              placeholder="Describe tu liga..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #DEE2E6',
                borderRadius: '6px',
                fontSize: '14px',
                resize: 'vertical',
                minHeight: '80px',
                boxSizing: 'border-box'
              }}
              rows="3"
              disabled={loading}
            />
          </div>

          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: '#6C757D',
                color: '#FFFFFF',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                backgroundColor: '#002C5F',
                color: '#FFFFFF',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
              disabled={loading || !name.trim()}
            >
              {loading ? 'Creando...' : 'Crear Liga'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Componente modal para unirse a liga
// Componente modal para unirse a liga
function JoinLeagueModal({ onJoin, onClose }) {
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onJoin({ inviteCode: inviteCode.toUpperCase() });
    } catch (err) {
      // Error ya manejado en onJoin
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '500px',
        width: '100%',
        border: '2px solid #002C5F'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: 0, color: '#002C5F' }}>🔗 Unirse a Liga</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666666',
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
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#002C5F'
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
                border: '1px solid #DEE2E6',
                borderRadius: '6px',
                fontSize: '18px',
                textAlign: 'center',
                letterSpacing: '2px',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                boxSizing: 'border-box'
              }}
              disabled={loading}
              autoFocus
            />
            <small style={{
              color: '#666666',
              fontSize: '12px',
              textAlign: 'center',
              display: 'block',
              marginTop: '8px'
            }}>
              El código tiene 8 caracteres alfanuméricos
            </small>
          </div>

          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            marginTop: '24px'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: '#6C757D',
                color: '#FFFFFF',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                flex: 1
              }}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                backgroundColor: '#002C5F',
                color: '#FFFFFF',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                flex: 1
              }}
              disabled={loading || inviteCode.length !== 8}
            >
              {loading ? 'Uniéndose...' : 'Unirse a Liga'}
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
    showToast('✅ Código copiado al portapapeles!', 'success');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '500px',
        width: '100%',
        border: '2px solid #002C5F'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: 0, color: '#002C5F' }}>📤 Invitar a "{league.name}"</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666666',
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

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <p style={{
            color: '#666666',
            marginBottom: '16px',
            fontSize: '16px'
          }}>
            Comparte este código con tus amigos para que se unan a la liga:
          </p>
          <div style={{
            backgroundColor: '#F8F9FA',
            padding: '20px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#002C5F',
            letterSpacing: '3px',
            marginBottom: '20px',
            border: '2px solid #002C5F'
          }}>
            {league.inviteCode}
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleCopyCode}
            style={{
              backgroundColor: '#002C5F',
              color: '#FFFFFF',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            📋 Copiar Código
          </button>
        </div>

        <div style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: '#F8F9FA',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#666666'
        }}>
          <strong style={{ color: '#002C5F' }}>💡 Consejos:</strong>
          <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
            <li>Comparte el código por WhatsApp, email o redes sociales</li>
            <li>El código es único para esta liga</li>
            <li>Cualquier persona con el código puede unirse</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Componente modal para editar perfil
function ProfileModal({ onClose, profileImage, onImageUpload, user, token, onProfileUpdate }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(profileImage);
  const [username, setUsername] = useState(user?.username || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');

    // Validaciones
    if (newPassword && newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden');
      setLoading(false);
      return;
    }

    if (newPassword && !currentPassword) {
      setError('Debes ingresar tu contraseña actual para cambiarla');
      setLoading(false);
      return;
    }

    try {
      const updateData = {};

      // Solo incluir campos que han cambiado
      if (username !== user.username) {
        updateData.username = username;
      }

      if (newPassword) {
        updateData.password = newPassword;
      }

      // Manejar imagen de perfil
      if (selectedFile) {
        updateData.profileImage = previewImage;
      } else if (previewImage === null) {
        updateData.profileImage = null;
      }

      // Solo hacer la llamada si hay algo que actualizar
      if (Object.keys(updateData).length > 0) {
        const result = await updateProfile(token, updateData);
        if (result.message) {
          // Actualizar la imagen localmente si se cambió
          if (selectedFile) {
            onImageUpload(selectedFile);
          } else if (previewImage === null) {
            setProfileImage(null);
          }

          // Notificar al componente padre sobre la actualización
          if (onProfileUpdate) {
            onProfileUpdate(result.user);
          }

          showToast('Perfil actualizado correctamente', 'success');
        } else {
          setError(result.message || 'Error al actualizar el perfil');
          setLoading(false);
          return;
        }
      }

      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Error al actualizar el perfil');
    }
    setLoading(false);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewImage(null);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        padding: '32px',
        width: '90%',
        maxWidth: '400px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        border: '2px solid #E2E8F0',
        position: 'relative'
      }}>
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#666666',
            padding: '4px',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#F1F5F9';
            e.target.style.color = '#1A365D';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#666666';
          }}
        >
          ×
        </button>

        {/* Título */}
        <h2 style={{
          margin: '0 0 24px 0',
          color: '#004B9B',
          fontSize: '24px',
          fontWeight: '700',
          textAlign: 'center'
        }}>
          Editar Perfil
        </h2>

        {error && (
          <div style={{
            backgroundColor: '#FED7D7',
            color: '#C53030',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Vista previa de imagen */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            border: '4px solid #E2E8F0',
            overflow: 'hidden',
            marginBottom: '16px',
            backgroundColor: previewImage ? 'transparent' : '#F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
          }}>
            {previewImage ? (
              <img
                src={previewImage}
                alt="Vista previa"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <span style={{ fontSize: '48px', color: '#CBD5E1' }}>👤</span>
            )}
          </div>

          {/* Botones de acción para imagen */}
          <div style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <button
              onClick={() => fileInputRef.current.click()}
              style={{
                backgroundColor: '#004B9B',
                color: '#FFFFFF',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#2D3748';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#1A365D';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              📷 Cambiar Foto
            </button>

            {previewImage && (
              <button
                onClick={handleRemoveImage}
                style={{
                  backgroundColor: '#E53E3E',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#C53030';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#E53E3E';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                🗑️ Quitar Foto
              </button>
            )}
          </div>

          {/* Input de archivo oculto */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>

        {/* Campos de formulario */}
        <div style={{ marginBottom: '24px' }}>
          {/* Username */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#004B9B',
              fontSize: '14px'
            }}>
              Nombre de Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1A365D'}
              onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
              placeholder="Ingresa tu nombre de usuario"
            />
          </div>

          {/* Contraseña actual */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#1A365D',
              fontSize: '14px'
            }}>
              Contraseña Actual (requerida para cambiar contraseña)
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1A365D'}
              onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
              placeholder="Ingresa tu contraseña actual"
            />
          </div>

          {/* Nueva contraseña */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#1A365D',
              fontSize: '14px'
            }}>
              Nueva Contraseña (opcional)
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1A365D'}
              onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
              placeholder="Deja vacío si no quieres cambiar"
            />
          </div>

          {/* Confirmar nueva contraseña */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#1A365D',
              fontSize: '14px'
            }}>
              Confirmar Nueva Contraseña
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1A365D'}
              onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
              placeholder="Confirma tu nueva contraseña"
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center'
        }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              backgroundColor: '#F1F5F9',
              color: '#64748B',
              border: '2px solid #E2E8F0',
              padding: '12px 24px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.6 : 1
            }}
            onMouseOver={(e) => {
              if (!loading) e.target.style.backgroundColor = '#E2E8F0';
            }}
            onMouseOut={(e) => {
              if (!loading) e.target.style.backgroundColor = '#F1F5F9';
            }}
          >
            Cancelar
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              background: loading ? '#CBD5E1' : 'linear-gradient(135deg, #004B9B 0%, #0066CC 100%)',
              color: '#FFFFFF',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: loading ? 'none' : '0 4px 12px rgba(0, 75, 155, 0.3)',
              opacity: loading ? 0.8 : 1
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.background = 'linear-gradient(135deg, #2D3748 0%, #4A5568 100%)';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 6px 16px rgba(0, 75, 155, 0.4)';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.background = 'linear-gradient(135deg, #004B9B 0%, #0066CC 100%)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(26, 54, 93, 0.3)';
              }
            }}
          >
            {loading ? '💾 Guardando...' : '💾 Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
