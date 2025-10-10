import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { AvatarWithTeamLogo } from './common/AvatarWithTeamLogo';

interface DashboardHeaderProps {
  userAvatar?: string;
  userName?: string;
  favoriteTeam?: string;
  onAvatarPress?: () => void;
}

export default function DashboardHeader({
  userAvatar,
  userName,
  favoriteTeam,
  onAvatarPress,
}: DashboardHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo más grande */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../public/img/logo_MVPicks.png')}
            style={[styles.logo, { transform: [{ scale: 1.8 }] }]}
            resizeMode="contain"
          />
        </View>

        {/* Saludo */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>Hola, {userName}! 👋</Text>
          <Text style={styles.subtitle}>Tus ligas NFL</Text>
        </View>

        {/* Avatar más grande */}
        <TouchableOpacity 
          onPress={onAvatarPress}
          style={styles.avatarContainer}
          activeOpacity={0.7}
        >
          <AvatarWithTeamLogo
            profileImage={userAvatar}
            favoriteTeam={favoriteTeam}
            username={userName || ''}
            size={65} // MÁS GRANDE (era 55)
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 8, // Menos padding para pegar logo a la izquierda
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  logoContainer: {
    width: 140, // Tamaño base para el contenedor
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,  // Tamaño base de la imagen
    height: 40,  // Tamaño base de la imagen
    // El scale de 1.8 lo hace 216x72 visualmente
  },
  greetingContainer: {
    flex: 1,
    paddingHorizontal: 8,
    minWidth: 0,
  },
  greeting: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#002C5F',  // AZUL (era blanco)
    marginBottom: 2,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#004B9B',  // AZUL más claro (era blanco)
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  avatarContainer: {
    flex: 0,
  },
});
