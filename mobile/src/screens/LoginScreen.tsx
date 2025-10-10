import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/common/Button';
import { InputField } from '../components/common/InputField';
import { isValidEmail } from '../utils/helpers';

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: any = {};
    
    if (!email) {
      newErrors.email = 'Email es requerido';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!password) {
      newErrors.password = 'Password es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'Password debe tener al menos 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      await login(email, password);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Error al iniciar sesión'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../public/img/logo_MVPicks.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.subtitle}>NFL Pick'em League</Text>
          </View>

          <View style={styles.form}>
            <InputField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="tu@email.com"
              autoCapitalize="none"
              keyboardType="email-address"
              error={errors.email}
            />

            <InputField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              error={errors.password}
            />

            <Button
              title="Iniciar Sesión"
              onPress={handleLogin}
              loading={loading}
              style={styles.button}
            />

            <Button
              title="¿No tienes cuenta? Regístrate"
              onPress={() => navigation.navigate('Register')}
              variant="secondary"
              style={styles.registerButton}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 240,
    height: 80,
    marginBottom: 12,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#1a73e8',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  button: {
    marginTop: 8,
  },
  registerButton: {
    marginTop: 16,
  },
});
