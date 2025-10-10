import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, Image } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';
import { InputField } from '../../components/common/InputField';
import { isValidEmail, isValidUsername, isValidPassword } from '../../utils/helpers';

export default function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const validate = () => {
    const newErrors: any = {};
    
    if (!username) {
      newErrors.username = 'Username es requerido';
    } else if (!isValidUsername(username)) {
      newErrors.username = 'Username inválido (3-20 caracteres, solo letras, números, - y _)';
    }
    
    if (!email) {
      newErrors.email = 'Email es requerido';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!password) {
      newErrors.password = 'Password es requerida';
    } else if (!isValidPassword(password)) {
      newErrors.password = 'Password debe tener al menos 6 caracteres';
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las passwords no coinciden';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      await register(username, email, password);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Error al registrarse'
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
          <View style={styles.header}>
            <Image
              source={require('../../public/img/logo_MVPicks.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>Únete a MVPicks</Text>
          </View>

          <View style={styles.form}>
            <InputField
              label="Username"
              value={username}
              onChangeText={setUsername}
              placeholder="tu_usuario"
              autoCapitalize="none"
              error={errors.username}
            />

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

            <InputField
              label="Confirmar Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              secureTextEntry
              error={errors.confirmPassword}
            />

            <Button
              title="Registrarse"
              onPress={handleRegister}
              loading={loading}
              style={styles.button}
            />

            <Button
              title="¿Ya tienes cuenta? Inicia Sesión"
              onPress={() => navigation.navigate('Login')}
              variant="secondary"
              style={styles.loginButton}
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
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 240,
    height: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a73e8',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    width: '100%',
  },
  button: {
    marginTop: 8,
  },
  loginButton: {
    marginTop: 16,
  },
});
