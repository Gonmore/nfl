import { registerRootComponent } from 'expo';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';

// Services
import { initializeBackend } from './src/services/backendWakeup';

// Context
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// Components
import NFLSplashScreen from './src/components/NFLSplashScreen';
import { LoadingSpinner } from './src/components/common/LoadingSpinner';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import LeagueDetailScreen from './src/screens/LeagueDetailScreen';
import PicksScreen from './src/screens/PicksScreen';
import CreateLeagueScreen from './src/screens/CreateLeagueScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(false);
  const [backendReady, setBackendReady] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const needsWakeup = await initializeBackend();
      
      if (needsWakeup) {
        setShowSplash(true);
      } else {
        setBackendReady(true);
      }
    } catch (error) {
      console.error('Error al inicializar:', error);
      setBackendReady(true);
    }
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
    setBackendReady(true);
  };

  if (showSplash) {
    return <NFLSplashScreen onFinish={handleSplashFinish} />;
  }

  if (isLoading || !backendReady) {
    return <LoadingSpinner />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#002C5F' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      {!isAuthenticated ? (
        <>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen}
            options={{ title: 'Registro' }}
          />
        </>
      ) : (
        <>
          <Stack.Screen 
            name="Dashboard" 
            component={DashboardScreen}
            options={{ title: 'MVPicks' }}
          />
          <Stack.Screen 
            name="LeagueDetail" 
            component={LeagueDetailScreen}
            options={{ title: 'Liga' }}
          />
          <Stack.Screen 
            name="Picks" 
            component={PicksScreen}
            options={{ title: 'Hacer Picks' }}
          />
          <Stack.Screen 
            name="CreateLeague" 
            component={CreateLeagueScreen}
            options={{ title: 'Nueva Liga' }}
          />
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen}
            options={{ title: 'Mi Perfil' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

registerRootComponent(App);

export default App;
