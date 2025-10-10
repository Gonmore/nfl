import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  ImageBackground,
} from 'react-native';
import { getGamesByWeek, getUserPicks, makePicks, getStandings } from '../services/api';
import TeamLogo from '../components/TeamLogo';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import PoweredByFooter from '../components/PoweredByFooter';

export default function PicksScreen({ route, navigation }: any) {
  const { leagueId, week, currentWeek } = route.params;
  const [games, setGames] = useState<any[]>([]);
  const [picks, setPicks] = useState<{ [gameId: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [nextWeekGames, setNextWeekGames] = useState<any[]>([]);
  const [nextWeek, setNextWeek] = useState<number | null>(null);
  const [teamRecords, setTeamRecords] = useState<{ [team: string]: string }>({});
  const [recordsLoading, setRecordsLoading] = useState(true);

  // Calcular fecha límite: inicio del primer partido de la semana
  const deadline = games.length > 0 ? new Date(Math.min(...games.map((g: any) => new Date(g.date).getTime()))) : null;
  const now = new Date();
  const isDeadlinePassed = deadline && now > deadline;

  console.log('[DEBUG] PicksScreen - Current state:');
  console.log('[DEBUG] PicksScreen - week:', week);
  console.log('[DEBUG] PicksScreen - currentWeek:', currentWeek);
  console.log('[DEBUG] PicksScreen - games.length:', games.length);
  console.log('[DEBUG] PicksScreen - deadline:', deadline);
  console.log('[DEBUG] PicksScreen - now:', now);
  console.log('[DEBUG] PicksScreen - isDeadlinePassed:', isDeadlinePassed);

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

  console.log('[DEBUG] PicksScreen - duringGameWeek:', duringGameWeek);

  useEffect(() => {
    loadGamesAndPicks();
  }, [week]);

  useEffect(() => {
    if (isDeadlinePassed) {
      // Buscar partidos de la siguiente semana
      const fetchNextWeekGames = async () => {
        const nextWeekNum = week + 1;
        setNextWeek(nextWeekNum);
        console.log('[DEBUG] PicksScreen - Fetching games for week:', nextWeekNum);
        try {
          const data = await getGamesByWeek(nextWeekNum);
          console.log('[DEBUG] PicksScreen - Games received:', data);
          setNextWeekGames(data || []);
        } catch (err) {
          console.error('[DEBUG] PicksScreen - Error fetching games:', err);
          setNextWeekGames([]);
        }
      };
      fetchNextWeekGames();
    }
  }, [isDeadlinePassed, games, week]);

  const loadGamesAndPicks = async () => {
    setLoading(true);
    try {
      // Cargar juegos
      const gamesData = await getGamesByWeek(week);
      setGames(gamesData || []);

      // Cargar picks existentes
      try {
        const picksData = await getUserPicks(leagueId, week);
        const existingPicks: { [gameId: string]: string } = {};
        if (picksData && picksData.length > 0) {
          picksData.forEach((pick: any) => {
            existingPicks[pick.gameId] = pick.pick;
          });
        }
        setPicks(existingPicks);
      } catch (error) {
        console.error('Error loading picks:', error);
      }

      // Cargar records de equipos
      try {
        const standingsRes = await getStandings();
        const records: { [team: string]: string } = {};
        if (standingsRes && standingsRes.standings) {
          standingsRes.standings.forEach((team: any) => {
            records[team.name] = team.winPercentage;
          });
        }
        setTeamRecords(records);
        setRecordsLoading(false);
      } catch (error) {
        console.error('Error loading standings:', error);
        setRecordsLoading(false);
      }
    } catch (error) {
      console.error('Error loading games:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handlePick = (gameId: string, team: string) => {
    setPicks({ ...picks, [gameId]: team });
    // Limpiar mensaje de error cuando el usuario hace un pick
    if (message) setMessage('');
  };

  // Verificar si todos los picks están completos
  const areAllPicksComplete = () => {
    const currentGames = isDeadlinePassed ? nextWeekGames : games;
    return currentGames.length > 0 && currentGames.every((game: any) => picks[game.id]);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setMessage('');

    // Obtener los partidos actuales
    const currentGames = isDeadlinePassed ? nextWeekGames : games;

    // Verificar que se hayan hecho picks para todos los partidos
    const missingPicks = currentGames.filter((game: any) => !picks[game.id]);
    if (missingPicks.length > 0) {
      setMessage(`Debes seleccionar un equipo para todos los partidos. Faltan ${missingPicks.length} pick(s).`);
      setSubmitting(false);
      return;
    }

    const picksArr = currentGames
      .filter((g: any) => picks[g.id])
      .map((g: any) => ({ 
        gameId: g.id, 
        pick: picks[g.id], 
        week: isDeadlinePassed ? nextWeek : week 
      }));

    try {
      const res = await makePicks(leagueId, picksArr);
      setMessage(res.message || 'Picks enviados');
      Alert.alert('Éxito', res.message || 'Picks guardados correctamente');
    } catch (error: any) {
      console.error('Error submitting picks:', error);
      setMessage(error.response?.data?.message || 'Error al guardar picks');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Si estamos en horario de jornada y no hemos pasado la fecha límite y estamos en la semana actual
  if (duringGameWeek && !isDeadlinePassed && week === currentWeek) {
    return (
      <ImageBackground
        source={require('../assets/campfut_background.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            <View style={styles.warningCard}>
              <Text style={styles.warningTitle}>⏰ Jornada en Juego</Text>
              <Text style={styles.warningText}>
                La semana {week} está en curso. Las opciones de visualización están disponibles desde el menú principal de ligas.
              </Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    );
  }

  // Si ya pasó el deadline de la semana actual
  if (isDeadlinePassed && week === currentWeek) {
    return (
      <ImageBackground
        source={require('../assets/campfut_background.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            {/* Header con logo */}
            <View style={styles.header}>
              <Image 
                source={require('../public/img/logo_MVPicks.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.title}>Haz tus picks</Text>
            </View>

        <ScrollView style={styles.scrollContent}>
          <View style={styles.deadlineCard}>
            <Text style={styles.deadlineTitle}>⏰ Fecha límite pasada</Text>
            <Text style={styles.deadlineText}>
              La fecha límite para elegir picks de esta semana ya pasó.{'\n'}
              Puedes hacer tus picks para la siguiente semana.
            </Text>
          </View>

          {nextWeekGames.length > 0 ? (
            <View style={styles.content}>
              <View style={styles.weekHeader}>
                <Text style={styles.weekTitle}>🎯 Haz tus picks para la semana {nextWeek}</Text>
              </View>

              <View style={styles.gamesGrid}>
                {nextWeekGames.map((game: any) => (
                  <View key={game.id} style={styles.gameCard}>
                    <View style={styles.teamLogosContainer}>
                      {/* Away Team */}
                      <TouchableOpacity
                        style={styles.teamColumn}
                        onPress={() => handlePick(game.id, game.awayTeam)}
                        disabled={submitting}
                      >
                        <View style={styles.logoContainer}>
                          <TeamLogo
                            teamName={game.awayTeam}
                            size={50}
                            isPicked={picks[game.id] === game.awayTeam}
                          />
                        </View>
                        <View style={styles.recordText}>
                          {recordsLoading ? (
                            <Text style={styles.recordLoading}>...</Text>
                          ) : (
                            <Text style={styles.recordTextContent}>
                              <Text style={styles.recordWins}>
                                {(teamRecords[game.awayTeam] || '0-0-0').split('-')[0]}
                              </Text>
                              <Text> / </Text>
                              <Text style={styles.recordLosses}>
                                {(teamRecords[game.awayTeam] || '0-0-0').split('-')[1]}
                              </Text>
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>

                      {/* VS */}
                      <Text style={styles.vsText}>-</Text>

                      {/* Home Team */}
                      <TouchableOpacity
                        style={styles.teamColumn}
                        onPress={() => handlePick(game.id, game.homeTeam)}
                        disabled={submitting}
                      >
                        <View style={styles.logoContainer}>
                          <TeamLogo
                            teamName={game.homeTeam}
                            size={50}
                            isPicked={picks[game.id] === game.homeTeam}
                          />
                        </View>
                        <View style={styles.recordText}>
                          {recordsLoading ? (
                            <Text style={styles.recordLoading}>...</Text>
                          ) : (
                            <Text style={styles.recordTextContent}>
                              <Text style={styles.recordWins}>
                                {(teamRecords[game.homeTeam] || '0-0-0').split('-')[0]}
                              </Text>
                              <Text> / </Text>
                              <Text style={styles.recordLosses}>
                                {(teamRecords[game.homeTeam] || '0-0-0').split('-')[1]}
                              </Text>
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.footer}>
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    !areAllPicksComplete() && styles.submitButtonIncomplete,
                    submitting && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.submitButtonIcon}>
                        {!areAllPicksComplete() ? '🚨' : '⚡'}
                      </Text>
                      <Text style={styles.submitButtonText}>
                        {submitting ? 'Enviando...' : !areAllPicksComplete() ? 'FALTAN PICKS' : 'Enviar Picks'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {message ? (
                  <View style={[
                    styles.messageBox,
                    message.includes('correctamente') && styles.messageBoxSuccess
                  ]}>
                    <Text style={[
                      styles.messageText,
                      message.includes('correctamente') && styles.messageTextSuccess
                    ]}>
                      {message.includes('correctamente') ? '✅ ' : '🚨 '}{message}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          ) : (
            <View style={styles.noGamesContainer}>
              <Text style={styles.noGamesEmoji}>📅</Text>
              <Text style={styles.noGamesText}>
                No hay partidos disponibles para la siguiente semana.
              </Text>
              <Text style={styles.noGamesSubtext}>
                Vuelve pronto para hacer tus picks.
              </Text>
            </View>
          )}
          
          {/* Footer - Powered by Supernovatel */}
          <PoweredByFooter />
        </ScrollView>
          </View>
        </View>
      </ImageBackground>
    );
  }

  // Vista normal de picks
  return (
    <ImageBackground
      source={require('../assets/campfut_background.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header con logo */}
          <View style={styles.header}>
            <Image 
              source={require('../public/img/logo_MVPicks.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Haz tus picks - Semana {week}</Text>
          </View>

      <ScrollView style={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.gamesGrid}>
            {games.map((game: any) => (
              <View key={game.id} style={styles.gameCard}>
                <View style={styles.teamLogosContainer}>
                  {/* Away Team */}
                  <TouchableOpacity
                    style={styles.teamColumn}
                    onPress={() => handlePick(game.id, game.awayTeam)}
                    disabled={submitting}
                  >
                    <View style={styles.logoContainer}>
                      <TeamLogo
                        teamName={game.awayTeam}
                        size={50}
                        isPicked={picks[game.id] === game.awayTeam}
                      />
                    </View>
                    <View style={styles.recordText}>
                      {recordsLoading ? (
                        <Text style={styles.recordLoading}>...</Text>
                      ) : (
                        <Text style={styles.recordTextContent}>
                          <Text style={styles.recordWins}>
                            {(teamRecords[game.awayTeam] || '0-0-0').split('-')[0]}
                          </Text>
                          <Text> / </Text>
                          <Text style={styles.recordLosses}>
                            {(teamRecords[game.awayTeam] || '0-0-0').split('-')[1]}
                          </Text>
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* VS */}
                  <Text style={styles.vsText}>-</Text>

                  {/* Home Team */}
                  <TouchableOpacity
                    style={styles.teamColumn}
                    onPress={() => handlePick(game.id, game.homeTeam)}
                    disabled={submitting}
                  >
                    <View style={styles.logoContainer}>
                      <TeamLogo
                        teamName={game.homeTeam}
                        size={50}
                        isPicked={picks[game.id] === game.homeTeam}
                      />
                    </View>
                    <View style={styles.recordText}>
                      {recordsLoading ? (
                        <Text style={styles.recordLoading}>...</Text>
                      ) : (
                        <Text style={styles.recordTextContent}>
                          <Text style={styles.recordWins}>
                            {(teamRecords[game.homeTeam] || '0-0-0').split('-')[0]}
                          </Text>
                          <Text> / </Text>
                          <Text style={styles.recordLosses}>
                            {(teamRecords[game.homeTeam] || '0-0-0').split('-')[1]}
                          </Text>
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                !areAllPicksComplete() && styles.submitButtonIncomplete,
                submitting && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.submitButtonIcon}>
                    {!areAllPicksComplete() ? '🚨' : '⚡'}
                  </Text>
                  <Text style={styles.submitButtonText}>
                    {submitting ? 'Enviando...' : !areAllPicksComplete() ? 'FALTAN PICKS' : 'Enviar Picks'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {message ? (
              <View style={[
                styles.messageBox,
                message.includes('correctamente') && styles.messageBoxSuccess
              ]}>
                <Text style={[
                  styles.messageText,
                  message.includes('correctamente') && styles.messageTextSuccess
                ]}>
                  {message.includes('correctamente') ? '✅ ' : '🚨 '}{message}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
        
        {/* Footer - Powered by Supernovatel */}
        <PoweredByFooter />
      </ScrollView>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent', // SIN overlay
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'transparent', // Transparente para ver el background
    alignItems: 'center',
  },
  logo: {
    width: 240,
    height: 80,
    marginBottom: 12,
  },
  scrollContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#002C5F', // AZUL (era blanco)
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 4,
    opacity: 0.9,
  },
  content: {
    padding: 16,
  },
  warningCard: {
    margin: 20,
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#004B9B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 8,
  },
  warningTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#E53E3E',
    marginBottom: 8,
    textAlign: 'center',
  },
  warningText: {
    color: '#4A5568',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
  },
  deadlineCard: {
    margin: 20,
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#004B9B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 8,
  },
  deadlineTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E53E3E',
    marginBottom: 8,
    textAlign: 'center',
  },
  deadlineText: {
    color: '#4A5568',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
  },
  weekHeader: {
    backgroundColor: '#004B9B',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  weekTitle: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
  },
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gameCard: {
    width: '48%',
    padding: 8,
    marginBottom: 12,
    backgroundColor: 'rgba(0, 44, 95, 0.15)', // Azul oscuro con 15% opacidad (era gris #E8E8E8)
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(0, 44, 95, 0.25)', // Borde sutil azul oscuro
  },
  teamLogosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  teamColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  logoContainer: {
    width: 50,
    height: 50,
  },
  recordText: {
    minWidth: 35,
    alignItems: 'center',
  },
  recordLoading: {
    color: 'gray',
    fontSize: 10,
  },
  recordTextContent: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  recordWins: {
    color: 'green',
  },
  recordLosses: {
    color: 'red',
  },
  vsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#002C5F',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#004B9B',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 200,
    gap: 8,
  },
  submitButtonIncomplete: {
    backgroundColor: '#FFD700',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonIcon: {
    fontSize: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  messageBox: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  messageBoxSuccess: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  messageText: {
    color: '#004B9B',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  messageTextSuccess: {
    color: '#fff',
  },
  noGamesContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noGamesEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  noGamesText: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
    marginBottom: 8,
  },
  noGamesSubtext: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
  },
});
