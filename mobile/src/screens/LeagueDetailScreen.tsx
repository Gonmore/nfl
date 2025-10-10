import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { getLeagueStats, getUserPicksDetails } from '../services/api';
import { AvatarWithTeamLogo } from '../components/common/AvatarWithTeamLogo';
import TeamLogo from '../components/TeamLogo';
import PoweredByFooter from '../components/PoweredByFooter';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

export default function LeagueDetailScreen({ route, navigation }: any) {
  const { user } = useAuth();
  const { leagueId } = route.params;
  const [weeklyStats, setWeeklyStats] = useState<any[]>([]);
  const [totalStats, setTotalStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalUser, setModalUser] = useState('');
  const [modalWeek, setModalWeek] = useState(5); // Start with week 5 (last completed)
  const [modalDetails, setModalDetails] = useState<any[]>([]);
  const [modalTotalPoints, setModalTotalPoints] = useState(0);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, [leagueId]);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Obtener estadísticas hasta la semana 5 (última jugada)
      const res = await getLeagueStats(leagueId, 5);
      setWeeklyStats(res.weekly || []);
      setTotalStats(res.total || []);
    } catch (error) {
      console.error('Error loading league stats:', error);
      Alert.alert('Error', 'No se pudieron cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const getRankBadgeStyle = (index: number) => {
    if (index === 0) return styles.goldBadge;
    if (index === 1) return styles.silverBadge;
    if (index === 2) return styles.bronzeBadge;
    return styles.rankBadge;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const handleUserClick = async (userId: number, userName: string) => {
    setModalUser(userName);
    setModalWeek(5); // Reset to week 5 when opening modal
    setModalOpen(true);
    await loadModalDetails(userId, 5);
  };

  const loadModalDetails = async (userId: number, week: number) => {
    setDetailsLoading(true);
    try {
      const res = await getUserPicksDetails(leagueId, week, userId);
      setModalDetails(res.details || []);
      const totalPoints = res.details.reduce((sum: number, detail: any) => sum + detail.points, 0);
      setModalTotalPoints(totalPoints);
    } catch (error) {
      console.error('Error loading modal details:', error);
      Alert.alert('Error', 'No se pudieron cargar los detalles');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleModalWeekChange = async (newWeek: number) => {
    setModalWeek(newWeek);
    if (modalUser) {
      // Find userId from the current standings
      const user = [...weeklyStats, ...totalStats].find(s => s.user === modalUser);
      if (user) {
        await loadModalDetails(user.userId, newWeek);
      }
    }
  };

  return (
    <ImageBackground
      source={require('../assets/campfut_background.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header simple - solo título y avatar, SIN botón volver */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>🏆 Ranking de la Liga</Text>
            </View>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Profile')}
              style={styles.avatarContainer}
            >
              <AvatarWithTeamLogo
                profileImage={user?.profileImage || undefined}
                favoriteTeam={user?.favoriteTeam || undefined}
                username={user?.username || ''}
                size={60} // MÁS GRANDE (era 50)
              />
            </TouchableOpacity>
          </View>
          
          <ScrollView
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollContentContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {/* Standings */}
            <View style={styles.section}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Cargando estadísticas...</Text>
            </View>
          ) : (
            (() => {
              // Combinar usuarios de weekly y total stats
              const allUsers = new Map();
              weeklyStats.forEach(s => allUsers.set(s.userId, { 
                user: s.user, 
                userId: s.userId, 
                profileImage: s.profileImage,
                favoriteTeam: s.favoriteTeam,
                weekly: s.points, 
                total: 0 
              }));
              totalStats.forEach(s => {
                if (allUsers.has(s.userId)) {
                  allUsers.get(s.userId).total = s.points;
                } else {
                  allUsers.set(s.userId, { 
                    user: s.user, 
                    userId: s.userId, 
                    profileImage: s.profileImage,
                    favoriteTeam: s.favoriteTeam,
                    weekly: 0, 
                    total: s.points 
                  });
                }
              });
              const sortedUsers = Array.from(allUsers.values()).sort((a, b) => b.total - a.total);
              
              return (
                <View style={styles.tableContainer}>
                  {/* Table Header */}
                  <View style={styles.tableHeader}>
                    <Text style={[styles.headerCell, styles.posCell]}>POS</Text>
                    <Text style={[styles.headerCell, styles.userCell]}>Usuario</Text>
                    <Text style={[styles.headerCell, styles.pointsCell]}>GW 5</Text>
                    <Text style={[styles.headerCell, styles.pointsCell]}>Total</Text>
                  </View>
                  
                  {/* Table Rows */}
                  {sortedUsers.map((user, index) => (
                    <TouchableOpacity 
                      key={user.userId} 
                      style={styles.tableRow}
                      onPress={() => handleUserClick(user.userId, user.user)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.rankBadge, getRankBadgeStyle(index)]}>
                        <Text style={index < 3 ? styles.podiumRankText : styles.rankText}>{index + 1}</Text>
                      </View>
                      <View style={styles.userInfoCell}>
                        <AvatarWithTeamLogo
                          profileImage={user.profileImage}
                          favoriteTeam={user.favoriteTeam}
                          username={user.user}
                          size={32}
                        />
                        <Text style={styles.playerName}>{user.user}</Text>
                      </View>
                      <Text style={styles.pointsText}>{user.weekly} pts</Text>
                      <Text style={styles.pointsText}>{user.total} pts</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              );
            })()
          )}
        </View>
        
        {/* Footer - Powered by Supernovatel */}
        <PoweredByFooter />
      </ScrollView>

      {/* Modal de detalles */}
      <Modal
        visible={modalOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.headerTopRow}>
                <View style={styles.logoContainer}>
                  <Image
                    source={require('../public/img/logo_MVPicks.png')}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </View>
                <TouchableOpacity
                  onPress={() => setModalOpen(false)}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.modalTitle}>📊 Detalles de {modalUser}</Text>
            </View>

            {/* Week Selector */}
            <View style={styles.weekSelectorContainer}>
              <Text style={styles.weekSelectorLabel}>Semana:</Text>
              <View style={styles.pickerContainer}>
                <TouchableOpacity
                  onPress={() => handleModalWeekChange(Math.max(1, modalWeek - 1))}
                  disabled={modalWeek === 1}
                  style={[styles.weekButton, modalWeek === 1 && styles.weekButtonDisabled]}
                >
                  <Text style={styles.weekButtonText}>←</Text>
                </TouchableOpacity>
                
                <Text style={styles.weekText}>GW {modalWeek}</Text>
                
                <TouchableOpacity
                  onPress={() => handleModalWeekChange(Math.min(18, modalWeek + 1))}
                  disabled={modalWeek === 18}
                  style={[styles.weekButton, modalWeek === 18 && styles.weekButtonDisabled]}
                >
                  <Text style={styles.weekButtonText}>→</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Total Points Display */}
            <View style={styles.totalPointsContainer}>
              <Text style={styles.totalPointsLabel}>Puntos en GW {modalWeek}</Text>
              <Text style={styles.totalPointsValue}>{modalTotalPoints}</Text>
            </View>

            {/* Details List */}
            <ScrollView 
              style={styles.modalScrollView}
              contentContainerStyle={styles.gamesContainer}
              showsVerticalScrollIndicator={true}
            >
              {detailsLoading ? (
                <View style={styles.modalLoadingContainer}>
                  <ActivityIndicator size="large" color="#4F46E5" />
                  <Text style={styles.loadingText}>Cargando detalles...</Text>
                </View>
              ) : modalDetails.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>📭 No hay picks para esta semana.</Text>
                </View>
              ) : (
                <View style={styles.gamesGrid}>
                  {modalDetails.map((detail: any, index: number) => {
                    // Determinar el estilo según el resultado
                    let cardStyle = styles.incorrectCard; // Por defecto rojo (perdió)
                    if (detail.winner === null && detail.status === 'STATUS_FINAL') {
                      // Empate - azul
                      cardStyle = styles.tieCard;
                    } else if (detail.points > 0) {
                      // Acertó - verde
                      cardStyle = styles.correctCard;
                    }
                    
                    return (
                      <View 
                        key={detail.gameId}
                        style={[styles.detailCard, cardStyle]}
                      >
                      {/* Teams Display - Compact version like web */}
                      <View style={styles.teamsContainer}>
                        {detail.winner === detail.homeTeam ? (
                          <>
                            <TeamLogo 
                              teamName={detail.homeTeam} 
                              size={42} 
                              isPicked={detail.pick === detail.homeTeam} 
                            />
                            <Text style={styles.vsText}>vs</Text>
                            <TeamLogo 
                              teamName={detail.awayTeam} 
                              size={42} 
                              isPicked={detail.pick === detail.awayTeam} 
                            />
                          </>
                        ) : (
                          <>
                            <TeamLogo 
                              teamName={detail.awayTeam} 
                              size={42} 
                              isPicked={detail.pick === detail.awayTeam} 
                            />
                            <Text style={styles.vsText}>vs</Text>
                            <TeamLogo 
                              teamName={detail.homeTeam} 
                              size={42} 
                              isPicked={detail.pick === detail.homeTeam} 
                            />
                          </>
                        )}
                      </View>

                      {/* Points Badge - Only for correct picks */}
                      {detail.points > 0 && (
                        <View style={styles.pointsBadge}>
                          <Text style={styles.pointsBadgeText}>+{detail.points}</Text>
                        </View>
                      )}
                    </View>
                  );
                  })}
                </View>
              )}
            </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: SIZES.lg,
    paddingBottom: SIZES.md,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: SIZES.fontXXL,
    fontWeight: 'bold',
    color: '#002C5F', // AZUL (era blanco)
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  avatarContainer: {
    marginLeft: SIZES.md,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: SIZES.xl,
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: SIZES.md,
    marginTop: SIZES.md,
    borderRadius: SIZES.radiusLG,
    padding: SIZES.md,
    ...SHADOWS.medium,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  tableContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#002C5F',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  headerCell: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  posCell: {
    width: 50,
  },
  userCell: {
    flex: 1,
    textAlign: 'left',
    paddingLeft: 8,
  },
  pointsCell: {
    width: 60,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#002C5F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  goldBadge: {
    backgroundColor: '#FFD700',
  },
  silverBadge: {
    backgroundColor: '#C0C0C0',
  },
  bronzeBadge: {
    backgroundColor: '#CD7F32',
  },
  rankText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  podiumRankText: {
    color: '#002C5F',
    fontWeight: 'bold',
    fontSize: 14,
  },
  userInfoCell: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  playerName: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  pointsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#002C5F',
    width: 60,
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 28,
    width: '90%',
    maxWidth: 400,
    maxHeight: '90%',
    padding: 0,
  },
  modalHeader: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  logoContainer: {
    alignItems: 'center',
    flex: 1,
  },
  logoImage: {
    width: 150,  // MÁS GRANDE (era 100)
    height: 75,  // MÁS GRANDE (era 50)
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#4F46E5',
    textAlign: 'center',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  weekSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: 'rgba(79, 70, 229, 0.3)',
  },
  weekSelectorLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4F46E5',
    marginRight: 16,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  weekButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  weekButtonDisabled: {
    backgroundColor: '#CCC',
  },
  weekButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  weekText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4F46E5',
    minWidth: 80,
    textAlign: 'center',
  },
  totalPointsContainer: {
    backgroundColor: '#4F46E5',
    margin: 20,
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  totalPointsLabel: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    opacity: 0.9,
    marginBottom: 8,
  },
  totalPointsValue: {
    fontSize: 36,
    color: 'white',
    fontWeight: '900',
  },
  modalScrollView: {
    maxHeight: 400,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  modalLoadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
    borderRadius: 16,
    marginHorizontal: 16,
    borderWidth: 2,
    borderColor: 'rgba(156, 163, 175, 0.2)',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
    textAlign: 'center',
  },
  detailCard: {
    width: '48%',
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    position: 'relative',
    alignItems: 'center',
    minHeight: 80,
  },
  correctCard: {
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
    borderColor: '#22C55E',
  },
  incorrectCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderColor: '#EF4444',
  },
  tieCard: {
    backgroundColor: 'rgba(79, 70, 229, 0.05)',
    borderColor: '#4F46E5',
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vsText: {
    marginHorizontal: 6,
    fontSize: 12,
    fontWeight: '800',
    color: '#002C5F',
  },
  pointsBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#22C55E',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  pointsBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  gamesRow: {
    justifyContent: 'space-between',
  },
  gamesContainer: {
    paddingVertical: 10,
  },
  flatListStyle: {
    maxHeight: 300,
  },
});
