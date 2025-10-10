import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { AvatarWithTeamLogo } from './common/AvatarWithTeamLogo';

interface NavigationHeaderProps {
  userAvatar?: string;
  userName?: string;
  favoriteTeam?: string;
  onAvatarPress?: () => void;
  showBackButton?: boolean;
  onBackPress?: () => void;
  title?: string;
}

export default function NavigationHeader({
  userAvatar,
  userName,
  favoriteTeam,
  onAvatarPress,
  showBackButton = false,
  onBackPress,
  title,
}: NavigationHeaderProps) {
  return (
    <View style={styles.container}>
      {/* Gradient background overlay */}
      <View style={styles.gradientOverlay} />
      
      <View style={styles.content}>
        {/* Left side - Back button or Logo CON FONDO BLANCO */}
        <View style={styles.leftSection}>
          {showBackButton && onBackPress ? (
            <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
          ) : null}
          <View style={styles.logoContainer}>
            <Image
              source={require('../public/img/logo_MVPicks.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Center - Title (optional) */}
        {title && (
          <View style={styles.centerSection}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          </View>
        )}

        {/* Right side - Avatar con logo del equipo favorito */}
        <TouchableOpacity 
          onPress={onAvatarPress}
          style={styles.avatarContainer}
          activeOpacity={0.7}
        >
          <AvatarWithTeamLogo
            profileImage={userAvatar}
            favoriteTeam={favoriteTeam}
            username={userName || ''}
            size={40}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 100,
    paddingTop: 40,
    position: 'relative',
    overflow: 'hidden',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#001B3A', // Darker blue
    opacity: 0.95,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  backText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  logoContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logo: {
    width: 100,
    height: 32,
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  avatarContainer: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
});
