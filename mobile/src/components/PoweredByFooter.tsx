import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function PoweredByFooter() {
  return (
    <View style={styles.container}>
      <Text style={styles.poweredText}>Powered </Text>
      <View style={styles.byCircle}>
        <Text style={styles.byText}>by</Text>
      </View>
      <Image
        source={require('../public/img/Logo_SNT_Azul.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  poweredText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginRight: 4,
  },
  byCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#002C5F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    marginLeft: 2,
  },
  byText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  logo: {
    width: 100,
    height: 24,
    marginLeft: 4,
  },
});
