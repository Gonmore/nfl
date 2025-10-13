import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Modal } from 'react-native';

interface NFLLoadingSequenceProps {
  visible: boolean;
}

export const NFLLoadingSequence: React.FC<NFLLoadingSequenceProps> = ({ visible }) => {
  const [currentImage, setCurrentImage] = useState(1);

  // Array de imágenes de la secuencia (1 a 15)
  const images = [
    require('../public/img/carga/1.png'),
    require('../public/img/carga/2.png'),
    require('../public/img/carga/3.png'),
    require('../public/img/carga/4.png'),
    require('../public/img/carga/5.png'),
    require('../public/img/carga/6.png'),
    require('../public/img/carga/7.png'),
    require('../public/img/carga/8.png'),
    require('../public/img/carga/9.png'),
    require('../public/img/carga/10.png'),
    require('../public/img/carga/11.png'),
    require('../public/img/carga/12.png'),
    require('../public/img/carga/13.png'),
    require('../public/img/carga/14.png'),
    require('../public/img/carga/15.png'),
  ];

  useEffect(() => {
    if (!visible) return;

    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev >= 15 ? 1 : prev + 1));
    }, 100); // Cambiar imagen cada 100ms

    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image
            source={images[currentImage - 1]}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  imageContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
