// ============================
// MOBILE APP - API USAGE EXAMPLES
// ============================

// Este archivo muestra ejemplos prácticos de cómo usar las APIs
// en las pantallas de la aplicación móvil

import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loginUser,
  registerUser,
  updateProfile,
  getUserLeagues,
  getGames,
  makePicks,
  getLeagueStats,
} from './src/services/api';
import { initializeBackend } from './src/services/backendWakeup';

// ============================
// EJEMPLO 1: LOGIN SCREEN
// ============================

export const LoginScreenExample = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');

      // 1. Login
      const response = await loginUser(email, password);

      // 2. Guardar token
      await AsyncStorage.setItem('jwt', response.token);

      // 3. Guardar info del usuario (opcional)
      await AsyncStorage.setItem('user', JSON.stringify(response.user));

      // 4. Navegar a Dashboard
      // navigation.navigate('Dashboard');
      
      console.log('✅ Login exitoso:', response.user.username);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
      console.error('❌ Error en login:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    // UI aquí
    null
  );
};

// ============================
// EJEMPLO 2: REGISTER SCREEN
// ============================

export const RegisterScreenExample = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    try {
      setLoading(true);
      setError('');

      // 1. Register
      const response = await registerUser(username, email, password);

      // 2. Guardar token
      await AsyncStorage.setItem('jwt', response.token);

      // 3. Guardar info del usuario
      await AsyncStorage.setItem('user', JSON.stringify(response.user));

      // 4. Navegar a Dashboard
      // navigation.navigate('Dashboard');
      
      console.log('✅ Registro exitoso:', response.user.username);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrarse');
      console.error('❌ Error en registro:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    // UI aquí
    null
  );
};

// ============================
// EJEMPLO 3: APP INITIALIZATION
// ============================

export const AppInitializationExample = () => {
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        // 1. Despertar backend
        console.log('🚀 Despertando backend...');
        await initializeBackend();
        setIsBackendReady(true);

        // 2. Verificar si hay sesión guardada
        const token = await AsyncStorage.getItem('jwt');
        if (token) {
          setIsAuthenticated(true);
          console.log('✅ Sesión encontrada');
        } else {
          console.log('ℹ️ No hay sesión guardada');
        }
      } catch (error) {
        console.error('❌ Error inicializando app:', error);
      }
    };

    initialize();
  }, []);

  return (
    // UI aquí - mostrar splash screen mientras isBackendReady === false
    null
  );
};

// ============================
// EJEMPLO 4: DASHBOARD SCREEN (Cargar Ligas)
// ============================

export const DashboardScreenExample = () => {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLeagues();
  }, []);

  const loadLeagues = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await getUserLeagues();
      setLeagues(response.leagues);

      console.log('✅ Ligas cargadas:', response.leagues.length);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar ligas');
      console.error('❌ Error cargando ligas:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    // UI aquí - mostrar lista de ligas
    null
  );
};

// ============================
// EJEMPLO 5: PICK FORM SCREEN (Hacer Picks)
// ============================

export const PickFormScreenExample = () => {
  const [games, setGames] = useState([]);
  const [picks, setPicks] = useState<{ [gameId: number]: number }>({});
  const [loading, setLoading] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(1);

  useEffect(() => {
    loadGames();
  }, [currentWeek]);

  const loadGames = async () => {
    try {
      setLoading(true);

      const response = await getGames();
      setGames(response.games);
      setCurrentWeek(response.currentWeek || 1);

      console.log('✅ Juegos cargados:', response.games.length);
    } catch (err) {
      console.error('❌ Error cargando juegos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePickTeam = (gameId: number, teamId: number) => {
    setPicks((prev) => ({
      ...prev,
      [gameId]: teamId,
    }));
  };

  const handleSubmitPicks = async (leagueId: number) => {
    try {
      setLoading(true);

      const response = await makePicks(leagueId, picks);

      console.log('✅ Picks guardados:', response.picks.length);
      alert('Picks guardados exitosamente!');
    } catch (err: any) {
      console.error('❌ Error guardando picks:', err);
      alert(err.response?.data?.message || 'Error al guardar picks');
    } finally {
      setLoading(false);
    }
  };

  return (
    // UI aquí - mostrar juegos y permitir seleccionar ganador
    null
  );
};

// ============================
// EJEMPLO 6: LEADERBOARD SCREEN
// ============================

export const LeaderboardScreenExample = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(1);

  useEffect(() => {
    loadLeaderboard(1); // Usar leagueId de ejemplo
  }, [currentWeek]);

  const loadLeaderboard = async (leagueId: number) => {
    try {
      setLoading(true);

      const response = await getLeagueStats(leagueId, currentWeek);
      setLeaderboard(response.leaderboard);

      console.log('✅ Leaderboard cargado:', response.leaderboard.length);
    } catch (err) {
      console.error('❌ Error cargando leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    // UI aquí - mostrar tabla de posiciones
    null
  );
};

// ============================
// EJEMPLO 7: PROFILE SCREEN (Editar Perfil)
// ============================

// import * as ImagePicker from 'expo-image-picker'; // Comentado - instalar si se necesita

export const ProfileScreenExample = () => {
  const [username, setUsername] = useState('');
  const [favoriteTeam, setFavoriteTeam] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePickImage = async () => {
    try {
      // 1. Pedir permisos
      // const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      // if (status !== 'granted') {
      //   alert('Se necesitan permisos para acceder a la galería');
      //   return;
      // }

      // 2. Abrir galería
      // const result = await ImagePicker.launchImageLibraryAsync({
      //   mediaTypes: ImagePicker.MediaTypeOptions.Images,
      //   allowsEditing: true,
      //   aspect: [1, 1],
      //   quality: 0.5,
      //   base64: true,
      // });

      // if (!result.canceled) {
      //   const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      //   setProfileImage(base64Image);
      // }

      // Simulación - en una app real usarías ImagePicker
      alert('Funcionalidad de selección de imagen - instalar expo-image-picker para usar');
    } catch (err) {
      console.error('❌ Error seleccionando imagen:', err);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);

      const response = await updateProfile({
        username: username || undefined,
        profileImage: profileImage || undefined,
        favoriteTeam: favoriteTeam || undefined,
      });

      // Actualizar usuario en AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(response.user));

      console.log('✅ Perfil actualizado');
      alert('Perfil actualizado exitosamente!');
    } catch (err: any) {
      console.error('❌ Error actualizando perfil:', err);
      alert(err.response?.data?.message || 'Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    // UI aquí - formulario de edición de perfil
    null
  );
};

// ============================
// EJEMPLO 8: LOGOUT
// ============================

export const LogoutExample = async (navigation: any) => {
  try {
    // 1. Eliminar token
    await AsyncStorage.removeItem('jwt');

    // 2. Eliminar usuario
    await AsyncStorage.removeItem('user');

    // 3. Navegar a Login
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });

    console.log('✅ Logout exitoso');
  } catch (err) {
    console.error('❌ Error en logout:', err);
  }
};

// ============================
// EJEMPLO 9: CONTEXT DE AUTENTICACIÓN
// ============================

import { createContext, useContext } from 'react';
import { User } from './src/types/api.types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Cargar usuario guardado al iniciar
    const loadUser = async () => {
      const token = await AsyncStorage.getItem('jwt');
      const userJson = await AsyncStorage.getItem('user');
      
      if (token && userJson) {
        setUser(JSON.parse(userJson));
        setIsAuthenticated(true);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await loginUser(email, password);
    await AsyncStorage.setItem('jwt', response.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user);
    setIsAuthenticated(true);
  };

  const register = async (username: string, email: string, password: string) => {
    const response = await registerUser(username, email, password);
    await AsyncStorage.setItem('jwt', response.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('jwt');
    await AsyncStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUserProfile = async (data: any) => {
    const response = await updateProfile(data);
    await AsyncStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, register, logout, updateUserProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

// ============================
// EJEMPLO 10: USO DEL CONTEXT EN SCREENS
// ============================

export const LoginWithContextExample = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await login(email, password);
      // El AuthContext maneja la navegación automáticamente
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return null;
};

export const ProfileWithContextExample = () => {
  const { user, updateUserProfile } = useAuth();

  const handleUpdate = async () => {
    try {
      await updateUserProfile({
        username: 'nuevo_nombre',
        favoriteTeam: 'KC',
      });
      alert('Perfil actualizado!');
    } catch (err) {
      alert('Error al actualizar perfil');
    }
  };

  return (
    // Mostrar user.username, user.profileImage, user.favoriteTeam
    null
  );
};

// ============================
// EJEMPLO 11: ERROR HANDLING GLOBAL
// ============================

import axios from 'axios';

export const setupAxiosInterceptors = (navigation: any) => {
  // Response interceptor para manejar errores 401 (token expirado)
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        // Token expirado o inválido
        await AsyncStorage.removeItem('jwt');
        await AsyncStorage.removeItem('user');
        
        // Navegar a Login
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
        
        alert('Sesión expirada. Por favor inicia sesión nuevamente.');
      }
      
      return Promise.reject(error);
    }
  );
};

// ============================
// NOTAS FINALES
// ============================

/*
TIPS IMPORTANTES:

1. SIEMPRE usar try/catch al llamar APIs
2. SIEMPRE guardar el token JWT después del login/register
3. SIEMPRE llamar initializeBackend() al inicio de la app
4. Usar loading states para mejor UX
5. Manejar errores y mostrar mensajes al usuario
6. Usar TypeScript types para type safety
7. Usar AsyncStorage para persistir datos
8. Implementar AuthContext para manejar autenticación globalmente
9. Configurar interceptor de axios para manejar errores 401
10. Usar helpers de utils/helpers.ts para funciones comunes

PRÓXIMOS PASOS:

1. Instalar dependencias de navegación
2. Crear estructura de navegación (Stack + Tabs)
3. Implementar AuthContext
4. Crear pantallas (Login, Register, Dashboard, etc.)
5. Crear componentes UI (Button, Input, GameCard, etc.)
6. Integrar las APIs en las pantallas usando estos ejemplos
7. Testing
8. Deploy

¡Buena suerte! 🚀
*/
