import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, Image, Modal, ImageBackground } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import api, { getGames } from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AvatarWithTeamLogo } from '../components/common/AvatarWithTeamLogo';
import DashboardHeader from '../components/DashboardHeader';
import PoweredByFooter from '../components/PoweredByFooter';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

interface League {
  id: number;
  name: string;
  isAdmin: boolean;
  isPublic: boolean;
  description?: string;
  inviteCode?: string;
  adminId?: number;
  members_count?: number;
  current_rank?: number;
  total_points?: number;
}

interface NFLTeam {
  id: string;
  name: string;
  abbreviation: string;
  wins: number;
  losses: number;
  ties: number;
  winPercentage: number;
  conference: string;
  division: string;
  logo?: string;
}

export default function DashboardScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [standings, setStandings] = useState<NFLTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStandings, setLoadingStandings] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showStandings, setShowStandings] = useState(false);
  const [showLeagueOptionsModal, setShowLeagueOptionsModal] = useState(false);
  const [selectedLeagueForOptions, setSelectedLeagueForOptions] = useState<League | null>(null);
  const [currentWeek, setCurrentWeek] = useState<number | null>(null);
  const [isDuringGameWeek, setIsDuringGameWeek] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedLeagueForInvite, setSelectedLeagueForInvite] = useState<League | null>(null);

  useEffect(() => {
    loadLeagues();
    loadStandings();
  }, []);

  const loadLeagues = async () => {
    try {
      const response = await api.get('/leagues/user');
      const leaguesData = response.data;
      
      // La respuesta viene como { leagues: [...] }
      if (leaguesData.leagues && Array.isArray(leaguesData.leagues)) {
        setLeagues(leaguesData.leagues);
      } else if (Array.isArray(leaguesData)) {
        // Fallback por si acaso venga como array directo
        setLeagues(leaguesData);
      } else {
        console.log('Formato de respuesta inesperado:', leaguesData);
        setLeagues([]);
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudieron cargar las ligas');
      setLeagues([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadStandings = async () => {
    try {
      setLoadingStandings(true);
      // Usar el endpoint correcto de ESPN
      const response = await api.get('/nfl/standings');
      const standingsData = response.data.standings || [];
      setStandings(standingsData);
      
      // También cargar información de juegos para determinar semana actual
      try {
        const gamesResponse = await getGames();
        const gamesData = gamesResponse.games || [];
        
        // Determinar semana actual
        const now = new Date();
        let currentWeekNum = null;
        if (gamesData.length > 0) {
          const nextGame = gamesData.find((g: any) => new Date(g.date) >= now);
          if (nextGame) {
            currentWeekNum = nextGame.week;
          } else {
            // Si no hay juegos futuros, usar la semana más alta disponible
            currentWeekNum = Math.max(...gamesData.map((g: any) => g.week));
          }
        }
        
        // Si no hay juegos disponibles, estimar semana actual
        if (!currentWeekNum) {
          const startOfSeason = new Date('2024-09-05');
          const diffTime = Math.abs(now.getTime() - startOfSeason.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          currentWeekNum = Math.ceil(diffDays / 7);
        }
        
        setCurrentWeek(currentWeekNum);
        
        // Determinar si estamos en horario de jornada
        const dayOfWeek = now.getDay(); // 0=domingo, 4=jueves, 1=lunes
        const hour = now.getHours();
        
        // Jueves después de las 20:00 o viernes, sábado, domingo, lunes
        const duringGameWeek = (dayOfWeek === 4 && hour >= 20) ||
                               (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) ||
                               (dayOfWeek === 1);
        
        setIsDuringGameWeek(duringGameWeek);
        
      } catch (gamesError) {
        console.error('Error cargando juegos:', gamesError);
        // No fallar completamente si no se pueden cargar juegos
      }
    } catch (error) {
      console.error('Error cargando standings:', error);
    } finally {
      setLoadingStandings(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    Promise.all([loadLeagues(), loadStandings()]).finally(() => {
      setRefreshing(false);
    });
  };

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', onPress: logout, style: 'destructive' },
    ]);
  };

  const handleLeagueSelect = (league: League) => {
    setSelectedLeagueForOptions(league);
    setShowLeagueOptionsModal(true);
  };

  const handleViewLeagueStats = () => {
    setShowLeagueOptionsModal(false);
    navigation.navigate('LeagueDetail', { leagueId: selectedLeagueForOptions?.id });
  };

  const handleMakePicks = () => {
    setShowLeagueOptionsModal(false);
    const nextWeek = isDuringGameWeek && currentWeek ? currentWeek + 1 : currentWeek;
    navigation.navigate('Picks', { 
      leagueId: selectedLeagueForOptions?.id,
      week: nextWeek,
      currentWeek: currentWeek 
    });
  };

  const handleViewScore = () => {
    setShowLeagueOptionsModal(false);
    // Por ahora navegar a LeagueDetail, pero eventualmente podríamos tener una pantalla específica de score
    navigation.navigate('LeagueDetail', { leagueId: selectedLeagueForOptions?.id });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ImageBackground
      source={require('../assets/campfut_background.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Dashboard Header - Blanco con líneas tipo cuaderno */}
          <DashboardHeader
            userAvatar={user?.profileImage || undefined}
            userName={user?.username}
            favoriteTeam={user?.favoriteTeam || undefined}
            onAvatarPress={() => navigation.navigate('Profile')}
          />

          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={handleRefresh}
                tintColor={COLORS.accent}
              />
            }
          >
            {/* Ya no necesitamos Welcome Card porque está en el header */}
        {/* Standings NFL Section */}
        <View style={styles.standingsCard}>
          <TouchableOpacity 
            style={styles.standingsHeader} 
            onPress={() => setShowStandings(!showStandings)}
          >
            <Text style={styles.standingsTitle}>📊 Standings NFL</Text>
            <Text style={styles.standingsToggle}>{showStandings ? '▼' : '▶'}</Text>
          </TouchableOpacity>
          
          {showStandings && (
            <ScrollView style={styles.standingsTable} nestedScrollEnabled={true}>
              {loadingStandings ? (
                <Text style={styles.loadingText}>Cargando standings...</Text>
              ) : standings.length === 0 ? (
                <Text style={styles.emptyStandingsText}>No hay standings disponibles</Text>
              ) : (
                <>
                  {/* Headers */}
                  <View style={styles.tableHeader}>
                    <View style={styles.headerRankContainer}>
                      <Text style={styles.headerText}>#</Text>
                    </View>
                    <View style={styles.headerLogoContainer}>
                      <Text style={styles.headerText}>Equipo</Text>
                    </View>
                    <View style={styles.headerRecordContainer}>
                      <Text style={[styles.headerText, { color: '#12B900' }]}>V</Text>
                      <Text style={[styles.headerText, { color: '#E53E3E' }]}>D</Text>
                      <Text style={[styles.headerText, { color: '#718096' }]}>E</Text>
                    </View>
                  </View>
                  
                  {/* Teams */}
                  {standings.map((team, index) => (
                  <View key={team.id} style={[
                    styles.teamRow,
                    index % 2 === 0 ? styles.teamRowEven : styles.teamRowOdd
                  ]}>
                    <View style={styles.teamRankContainer}>
                      <Text style={styles.teamRank}>#{index + 1}</Text>
                    </View>
                    {team.logo ? (
                      <Image 
                        source={{ uri: team.logo }} 
                        style={styles.teamLogo}
                        resizeMode="contain"
                      />
                    ) : null}
                    <View style={styles.teamRecordContainer}>
                      <View style={styles.winsBox}>
                        <Text style={styles.winsText}>{team.wins}</Text>
                      </View>
                      <View style={styles.lossesBox}>
                        <Text style={styles.lossesText}>{team.losses}</Text>
                      </View>
                      <View style={styles.tiesBox}>
                        <Text style={styles.tiesText}>{team.ties}</Text>
                      </View>
                    </View>
                  </View>
                  ))}
                </>
              )}
            </ScrollView>
          )}
        </View>

        {/* Create/Join League Button */}
        <TouchableOpacity 
          style={styles.createLeagueButton}
          onPress={() => navigation.navigate('CreateLeague')}
        >
          <Text style={styles.createLeagueIcon}>➕</Text>
          <View style={styles.createLeagueTextContainer}>
            <Text style={styles.createLeagueTitle}>Crear o Unirse a Liga</Text>
            <Text style={styles.createLeagueSubtitle}>Comienza a competir</Text>
          </View>
        </TouchableOpacity>

        {leagues.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No tienes ligas aún</Text>
          </View>
        ) : (
          leagues.map((league) => (
            <View key={league.id} style={styles.leagueCard}>
              <TouchableOpacity 
                style={styles.leagueMainButton}
                onPress={() => handleLeagueSelect(league)}
              >
                <View style={styles.leagueIconContainer}>
                  <Text style={styles.leagueIcon}>🏈</Text>
                </View>
                <View style={styles.leagueTextContainer}>
                  <Text style={styles.leagueName}>{league.name}</Text>
                  {league.isAdmin && (
                    <View style={styles.adminBadge}>
                      <Text style={styles.adminText}>Admin</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
              
              {/* Botón de invitar solo para admins */}
              {league.isAdmin && league.inviteCode && (
                <TouchableOpacity 
                  style={styles.inviteButton}
                  onPress={() => {
                    setSelectedLeagueForInvite(league);
                    setShowInviteModal(true);
                  }}
                >
                  <Text style={styles.inviteButtonText}>📤 Invitar</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
        
        {/* Footer - Powered by Supernovatel */}
        <PoweredByFooter />
      </ScrollView>

      {/* Modal de invitación */}
      <Modal
        visible={showInviteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowInviteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Código de Invitación</Text>
            <Text style={styles.modalSubtitle}>{selectedLeagueForInvite?.name}</Text>
            
            <View style={styles.inviteCodeContainer}>
              <Text style={styles.inviteCodeText}>{selectedLeagueForInvite?.inviteCode}</Text>
            </View>
            
            <Text style={styles.modalInstructions}>
              Comparte este código con tus amigos para que se unan a la liga
            </Text>
            
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowInviteModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de opciones de liga */}
      <Modal
        visible={showLeagueOptionsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLeagueOptionsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.leagueOptionsModalContent}>
            <View style={styles.leagueOptionsHeader}>
              <Text style={styles.leagueOptionsTitle}>
                {isDuringGameWeek ? 'Jornada en Juego' : 'Menú de Liga'}
              </Text>
              <Text style={styles.leagueOptionsSubtitle}>
                {isDuringGameWeek 
                  ? `La semana ${currentWeek} está en curso. ¿Qué deseas hacer en ${selectedLeagueForOptions?.name}?`
                  : `Explora las opciones disponibles en ${selectedLeagueForOptions?.name}`
                }
              </Text>
            </View>

            <View style={styles.leagueOptionsButtons}>
              {/* Botón de Score o Estadísticas según el estado */}
              {isDuringGameWeek ? (
                <TouchableOpacity
                  style={styles.leagueOptionButton}
                  onPress={handleViewScore}
                >
                  <Text style={styles.leagueOptionEmoji}>📊</Text>
                  <Text style={styles.leagueOptionText}>Ver mi Score - Semana {currentWeek}</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.leagueOptionButton}
                  onPress={handleViewLeagueStats}
                >
                  <Text style={styles.leagueOptionEmoji}>📈</Text>
                  <Text style={styles.leagueOptionText}>Ver Estadísticas de Liga</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.leagueOptionButton, styles.leagueOptionButtonSecondary]}
                onPress={handleMakePicks}
              >
                <Text style={styles.leagueOptionEmoji}>🎯</Text>
                <Text style={styles.leagueOptionText}>
                  Hacer Picks - Semana {isDuringGameWeek ? (currentWeek ? currentWeek + 1 : 'Siguiente') : currentWeek}
                </Text>
              </TouchableOpacity>

              {isDuringGameWeek && (
                <TouchableOpacity
                  style={[styles.leagueOptionButton, styles.leagueOptionButtonTertiary]}
                  onPress={handleViewLeagueStats}
                >
                  <Text style={styles.leagueOptionEmoji}>🏆</Text>
                  <Text style={styles.leagueOptionText}>Ver Liga en Vivo</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={styles.leagueOptionsCloseButton}
              onPress={() => setShowLeagueOptionsModal(false)}
            >
              <Text style={styles.leagueOptionsCloseButtonText}>Cambiar Liga</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    backgroundColor: 'transparent', // SIN overlay, fondo completamente visible
  },
  container: { 
    flex: 1,
  },
  content: { 
    flex: 1, 
    padding: SIZES.lg,
  },
  
  // Standings styles
  standingsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: SIZES.radiusLG,
    marginBottom: SIZES.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  standingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.lg,
    backgroundColor: COLORS.gradientStart,
  },
  standingsTitle: {
    fontSize: SIZES.fontXL,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  standingsToggle: {
    fontSize: SIZES.fontLG,
    color: COLORS.textLight,
    fontWeight: 'bold',
  },
  standingsTable: {
    maxHeight: 400,
  },
  loadingText: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
    fontSize: 14,
  },
  emptyStandingsText: {
    textAlign: 'center',
    padding: 20,
    color: '#999',
    fontSize: 14,
  },
  // Table headers
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#E2E8F0',
    borderBottomWidth: 2,
    borderBottomColor: '#CBD5E0',
    gap: 8,
  },
  headerRankContainer: {
    width: 35,
    alignItems: 'center',
  },
  headerLogoContainer: {
    width: 36,
    alignItems: 'center',
  },
  headerRecordContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 4,
  },
  headerText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#002C5F',
  },
  // Team rows
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    gap: 8,
  },
  teamRowEven: {
    backgroundColor: '#F8F9FA',
  },
  teamRowOdd: {
    backgroundColor: '#fff',
  },
  teamRankContainer: {
    width: 35,
    alignItems: 'center',
  },
  teamRank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#002C5F',
  },
  teamLogo: {
    width: 36,
    height: 36,
  },
  teamRecordContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 4,
  },
  winsBox: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 36,
    alignItems: 'center',
  },
  winsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#12B900',
  },
  lossesBox: {
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 36,
    alignItems: 'center',
  },
  lossesText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E53E3E',
  },
  tiesBox: {
    backgroundColor: '#F7FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 36,
    alignItems: 'center',
  },
  tiesText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#718096',
  },
  
  createLeagueButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#002C5F', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createLeagueIcon: { fontSize: 32, marginRight: 16 },
  createLeagueTextContainer: { flex: 1 },
  createLeagueTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  createLeagueSubtitle: { fontSize: 14, color: '#fff', opacity: 0.8, marginTop: 2 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#666' },
  
  // League Card styles
  leagueCard: { 
    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
    borderRadius: SIZES.radiusLG, 
    marginBottom: SIZES.md, 
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  leagueMainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.lg,
    gap: SIZES.md,
  },
  leagueIconContainer: {
    backgroundColor: COLORS.primary,
    width: 48,
    height: 48,
    borderRadius: SIZES.radiusMD,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leagueIcon: {
    fontSize: 24,
  },
  leagueTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  leagueName: { 
    fontSize: SIZES.fontXL, 
    fontWeight: 'bold', 
    color: COLORS.primary,
    flex: 1,
  },
  adminBadge: { 
    backgroundColor: COLORS.accent, 
    paddingHorizontal: SIZES.sm, 
    paddingVertical: 4, 
    borderRadius: SIZES.radiusSM,
  },
  adminText: { 
    color: COLORS.primary, 
    fontSize: 11, 
    fontWeight: '600' 
  },
  chevron: {
    fontSize: 28,
    color: '#002C5F',
    fontWeight: 'bold',
  },
  inviteButton: {
    backgroundColor: '#12B900',
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  inviteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#002C5F',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  inviteCodeContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#002C5F',
    borderStyle: 'dashed',
  },
  inviteCodeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#002C5F',
    textAlign: 'center',
    letterSpacing: 4,
  },
  modalInstructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalCloseButton: {
    backgroundColor: '#002C5F',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // League Options Modal styles
  leagueOptionsModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  leagueOptionsHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  leagueOptionsTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#004B9B',
    textAlign: 'center',
    marginBottom: 8,
  },
  leagueOptionsSubtitle: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 22,
  },
  leagueOptionsButtons: {
    gap: 12,
    marginBottom: 24,
  },
  leagueOptionButton: {
    backgroundColor: '#38A169',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  leagueOptionButtonSecondary: {
    backgroundColor: '#4F46E5',
  },
  leagueOptionButtonTertiary: {
    backgroundColor: '#059669',
  },
  leagueOptionEmoji: {
    fontSize: 24,
  },
  leagueOptionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  leagueOptionsCloseButton: {
    backgroundColor: '#6C757D',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  leagueOptionsCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
