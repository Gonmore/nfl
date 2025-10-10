import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ImageBackground } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/common/Button';
import { InputField } from '../components/common/InputField';
import NavigationHeader from '../components/NavigationHeader';
import PoweredByFooter from '../components/PoweredByFooter';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

export default function ProfileScreen({ navigation }: any) {
  const { user, updateUserProfile, logout } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const handleUpdateProfile = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'El nombre de usuario no puede estar vacío');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const updates: any = { username: username.trim() };
      
      if (newPassword) {
        if (!currentPassword) {
          Alert.alert('Error', 'Ingresa tu contraseña actual para cambiarla');
          setLoading(false);
          return;
        }
        updates.currentPassword = currentPassword;
        updates.newPassword = newPassword;
      }

      await updateUserProfile(updates);
      
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
      setEditMode(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.response?.data?.message || 'No se pudo actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Salir', onPress: logout, style: 'destructive' },
      ]
    );
  };

  return (
    <ImageBackground
      source={require('../assets/campfut_background.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <NavigationHeader
            userAvatar={user?.profileImage || undefined}
            userName={user?.username || ''}
            favoriteTeam={user?.favoriteTeam || undefined}
            onAvatarPress={() => {}}
            showBackButton={false}
            title="Mi Perfil"
          />
          
          <ScrollView 
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollContentContainer}
          >
            {/* Profile Header */}
            <View style={styles.header}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              <Text style={styles.headerTitle}>{user?.username}</Text>
              <Text style={styles.headerSubtitle}>{user?.email}</Text>
            </View>

        {/* Profile Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Información Personal</Text>
            {!editMode && (
              <TouchableOpacity onPress={() => setEditMode(true)}>
                <Text style={styles.editButton}>Editar</Text>
              </TouchableOpacity>
            )}
          </View>

          {editMode ? (
            <>
              <InputField
                label="Nombre de Usuario"
                value={username}
                onChangeText={setUsername}
                placeholder="Tu nombre de usuario"
              />

              <InputField
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="tu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={false}
              />

              <Text style={styles.subsectionTitle}>Cambiar Contraseña</Text>

              <InputField
                label="Contraseña Actual"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Tu contraseña actual"
                secureTextEntry
              />

              <InputField
                label="Nueva Contraseña"
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Nueva contraseña (opcional)"
                secureTextEntry
              />

              <InputField
                label="Confirmar Contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirma tu nueva contraseña"
                secureTextEntry
              />

              <View style={styles.buttonGroup}>
                <Button
                  title="Cancelar"
                  onPress={() => {
                    setEditMode(false);
                    setUsername(user?.username || '');
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  variant="secondary"
                  style={{ flex: 1 }}
                />
                <Button
                  title="Guardar"
                  onPress={handleUpdateProfile}
                  loading={loading}
                  disabled={loading}
                  variant="primary"
                  style={{ flex: 1 }}
                />
              </View>
            </>
          ) : (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Usuario:</Text>
                <Text style={styles.infoValue}>{user?.username}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{user?.email}</Text>
              </View>
            </>
          )}
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estadísticas</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Ligas</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Picks</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Puntos</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Button
            title="Cerrar Sesión"
            onPress={handleLogout}
            variant="danger"
          />
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
    backgroundColor: 'transparent', // SIN overlay, fondo completamente visible
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    padding: SIZES.lg,
    paddingBottom: SIZES.xl,
  },
  header: {
    alignItems: 'center',
    padding: SIZES.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: SIZES.radiusLG,
    marginBottom: SIZES.lg,
    ...SHADOWS.medium,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.md,
    borderWidth: 3,
    borderColor: COLORS.accent,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  headerTitle: {
    fontSize: SIZES.fontXL,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: SIZES.fontMD,
    color: '#666',
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: SIZES.radiusLG,
    padding: SIZES.lg,
    marginBottom: SIZES.lg,
    ...SHADOWS.medium,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  sectionTitle: {
    fontSize: SIZES.fontLG,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  subsectionTitle: {
    fontSize: SIZES.fontLG,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: SIZES.lg,
    marginBottom: SIZES.sm,
  },
  editButton: {
    fontSize: SIZES.fontLG,
    color: COLORS.primary,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#002C5F',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
