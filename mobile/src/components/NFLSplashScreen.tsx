import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { getTeamLogosForSplash } from '../services/espnService';

const { width, height } = Dimensions.get('window');

interface NFLSplashScreenProps {
  onFinish: () => void;
}

// Imágenes de respaldo locales por si falla la API
const fallbackImages = [
  require('../../assets/carga/1.png'),
  require('../../assets/carga/2.png'),
  require('../../assets/carga/3.png'),
  require('../../assets/carga/4.png'),
  require('../../assets/carga/5.png'),
  require('../../assets/carga/6.png'),
  require('../../assets/carga/7.png'),
  require('../../assets/carga/8.png'),
  require('../../assets/carga/9.png'),
  require('../../assets/carga/10.png'),
  require('../../assets/carga/11.png'),
  require('../../assets/carga/12.png'),
  require('../../assets/carga/13.png'),
  require('../../assets/carga/14.png'),
  require('../../assets/carga/15.png'),
];

export default function NFLSplashScreen({ onFinish }: NFLSplashScreenProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loops, setLoops] = useState(0);
  const [teamLogos, setTeamLogos] = useState<string[]>([]);
  const [useFallback, setUseFallback] = useState(false);
  const [isLoadingLogos, setIsLoadingLogos] = useState(true);
  const progressAnim = new Animated.Value(0);

  useEffect(() => {
    loadTeamLogos();
  }, []);

  const loadTeamLogos = async () => {
    try {
      const logos = await getTeamLogosForSplash();
      
      if (logos.length > 0) {
        setTeamLogos(logos);
        setUseFallback(false);
      } else {
        // Si no hay logos, usar fallback
        setUseFallback(true);
      }
    } catch (error) {
      console.error('Error cargando logos NFL:', error);
      setUseFallback(true);
    } finally {
      setIsLoadingLogos(false);
    }
  };

  useEffect(() => {
    if (isLoadingLogos) return;

    const totalLogos = useFallback ? fallbackImages.length : Math.min(teamLogos.length, 32);
    
    // Iniciar animación de progreso (40 segundos)
    Animated.timing(progressAnim, {
      toValue: 100,
      duration: 40000,
      useNativeDriver: false,
    }).start();

    // Actualizar valor de progreso
    const progressListener = progressAnim.addListener(({ value }) => {
      setProgress(Math.round(value));
    });

    // Secuencia de imágenes (250ms por imagen)
    const imageInterval = setInterval(() => {
      setCurrentImage((prev) => {
        const nextImage = (prev + 1) % totalLogos;
        
        // Si completamos un ciclo (volvemos a 0)
        if (nextImage === 0) {
          setLoops((prevLoops) => {
            const newLoops = prevLoops + 1;
            
            // Después de 2 loops completos, terminar
            if (newLoops >= 2) {
              clearInterval(imageInterval);
              setTimeout(() => onFinish(), 300);
            }
            
            return newLoops;
          });
        }
        
        return nextImage;
      });
    }, 250);

    return () => {
      clearInterval(imageInterval);
      progressAnim.removeListener(progressListener);
    };
  }, [isLoadingLogos, teamLogos, useFallback]);

  const getCurrentLogo = () => {
    if (useFallback) {
      return fallbackImages[currentImage % fallbackImages.length];
    } else if (teamLogos.length > 0) {
      return { uri: teamLogos[currentImage % teamLogos.length] };
    }
    return fallbackImages[0];
  };

  return (
    <View style={styles.container}>
      {/* Logo animado */}
      <View style={styles.logoContainer}>
        {isLoadingLogos ? (
          <ActivityIndicator size="large" color="#FFFFFF" />
        ) : (
          <Image
            source={getCurrentLogo()}
            style={styles.logo}
            resizeMode="contain"
          />
        )}
      </View>

      {/* Mensaje */}
      <Text style={styles.message}>
        {isLoadingLogos 
          ? 'Cargando equipos NFL...'
          : 'Conectando con servidores NFL...'}
      </Text>

      {/* Barra de progreso */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{progress}%</Text>
      </View>

      {/* Logo MVPicks (pequeño, abajo) */}
      <Image
        source={require('../../assets/logo.png')}
        style={styles.mvpicksLogo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#002C5F',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    width: width * 0.6,
    height: width * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  message: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 30,
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '80%',
    alignItems: 'center',
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
  mvpicksLogo: {
    position: 'absolute',
    bottom: 40,
    width: 100,
    height: 100,
  },
});
