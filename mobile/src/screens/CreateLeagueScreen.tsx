import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Button } from '../components/common/Button';
import { InputField } from '../components/common/InputField';

export default function CreateLeagueScreen({ navigation }: any) {
  const { user } = useAuth();
  const [leagueName, setLeagueName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'create' | 'join'>('create');

  const handleCreateLeague = async () => {
    if (!leagueName.trim()) {
      Alert.alert('Error', 'Ingresa un nombre para la liga');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/leagues', { name: leagueName.trim() });
      Alert.alert(
        'Liga Creada',
        `Liga "${response.data.name}" creada exitosamente`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      console.error('Error creating league:', error);
      Alert.alert('Error', error.response?.data?.message || 'No se pudo crear la liga');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLeague = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Error', 'Ingresa el código de invitación');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/leagues/join/${inviteCode.trim()}`);
      Alert.alert(
        'Unido a Liga',
        'Te has unido exitosamente a la liga',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      console.error('Error joining league:', error);
      Alert.alert('Error', error.response?.data?.message || 'No se pudo unir a la liga');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Mode Selector */}
        <View style={styles.modeSelector}>
          <Button
            title="Crear Liga"
            onPress={() => setMode('create')}
            variant={mode === 'create' ? 'primary' : 'secondary'}
            style={styles.modeButton}
          />
          <Button
            title="Unirse a Liga"
            onPress={() => setMode('join')}
            variant={mode === 'join' ? 'primary' : 'secondary'}
            style={styles.modeButton}
          />
        </View>

        {/* Create League Form */}
        {mode === 'create' && (
          <View style={styles.form}>
            <Text style={styles.title}>Crear Nueva Liga</Text>
            <Text style={styles.description}>
              Crea tu propia liga y compite con tus amigos
            </Text>

            <InputField
              label="Nombre de la Liga"
              value={leagueName}
              onChangeText={setLeagueName}
              placeholder="Ej: Liga de Amigos 2025"
              maxLength={50}
            />

            <Button
              title="Crear Liga"
              onPress={handleCreateLeague}
              loading={loading}
              disabled={loading}
              variant="primary"
            />

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>ℹ️ Información</Text>
              <Text style={styles.infoText}>
                • Serás el administrador de la liga{'\n'}
                • Recibirás un código para invitar a otros{'\n'}
                • Puedes modificar configuraciones después
              </Text>
            </View>
          </View>
        )}

        {/* Join League Form */}
        {mode === 'join' && (
          <View style={styles.form}>
            <Text style={styles.title}>Unirse a una Liga</Text>
            <Text style={styles.description}>
              Ingresa el código de invitación que te compartieron
            </Text>

            <InputField
              label="Código de Invitación"
              value={inviteCode}
              onChangeText={setInviteCode}
              placeholder="Ej: ABC123"
              autoCapitalize="characters"
              maxLength={10}
            />

            <Button
              title="Unirse"
              onPress={handleJoinLeague}
              loading={loading}
              disabled={loading}
              variant="primary"
            />

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>ℹ️ Información</Text>
              <Text style={styles.infoText}>
                • Solicita el código al administrador de la liga{'\n'}
                • Una vez unido, podrás hacer picks{'\n'}
                • Competirás por puntos con otros miembros
              </Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    padding: 16,
  },
  modeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  modeButton: {
    flex: 1,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#002C5F',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  infoBox: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#002C5F',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#002C5F',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
});
