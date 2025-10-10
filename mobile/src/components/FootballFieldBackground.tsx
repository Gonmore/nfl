import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function FootballFieldBackground() {
  // Crear líneas horizontales (yardas)
  const lines = [];
  const lineCount = 12; // 10 líneas de yarda + 2 de touchdown
  
  for (let i = 0; i <= lineCount; i++) {
    const position = (height / lineCount) * i;
    lines.push(
      <View
        key={`line-${i}`}
        style={[
          styles.yardLine,
          { top: position },
          i === 0 || i === lineCount ? styles.goalLine : {},
        ]}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Background azul base */}
      <View style={styles.field} />
      
      {/* Líneas horizontales */}
      {lines}
      
      {/* Líneas verticales (hash marks) */}
      <View style={styles.hashMarksLeft} />
      <View style={styles.hashMarksRight} />
      
      {/* Overlay semi-transparente */}
      <View style={styles.overlay} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  field: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0A4A2A', // Verde oscuro de campo de fútbol americano
  },
  yardLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  goalLine: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  hashMarksLeft: {
    position: 'absolute',
    left: width * 0.3,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  hashMarksRight: {
    position: 'absolute',
    right: width * 0.3,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 102, 204, 0.65)', // Azul MÁS CLARO con menos opacidad
  },
});
