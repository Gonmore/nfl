import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';

interface BackgroundImageProps {
  children: React.ReactNode;
}

export default function BackgroundImage({ children }: BackgroundImageProps) {
  return (
    <ImageBackground
      source={require('../assets/campfut_background.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>{children}</View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 27, 58, 0.85)', // Dark blue overlay
  },
});
