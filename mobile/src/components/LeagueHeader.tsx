import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AvatarWithTeamLogo } from './common/AvatarWithTeamLogo';

interface LeagueHeaderProps {
  userAvatar?: string;
  userName?: string;
  favoriteTeam?: string;
  onAvatarPress?: () => void;
  onBackPress: () => void;
  leagueName?: string;
}

export default function LeagueHeader({
  userAvatar,
  userName,
  favoriteTeam,
  onAvatarPress,
  onBackPress,
  leagueName,
}: LeagueHeaderProps) {
  return (
    <View style={styles.container}>
      {/* Botón de volver */}
      <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      {/* Título de liga */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{leagueName || 'Liga'}</Text>
      </View>

      {/* Avatar grande */}
      <TouchableOpacity 
        onPress={onAvatarPress}
        style={styles.avatarContainer}
        activeOpacity={0.7}
      >
        <AvatarWithTeamLogo
          profileImage={userAvatar}
          favoriteTeam={favoriteTeam}
          username={userName || ''}
          size={60}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  backText: {
    fontSize: 28,
    color: '#002C5F',
    fontWeight: 'bold',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
  },
});
