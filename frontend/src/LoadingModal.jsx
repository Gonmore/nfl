import React, { useState, useEffect, useRef } from 'react';
import './LoadingModal.css';

const LoadingModal = ({ isVisible }) => {
  const [currentImage, setCurrentImage] = useState(2);
  const [loopCount, setLoopCount] = useState(0);
  const totalImages = 15;
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!isVisible) {
      setCurrentImage(2);
      setLoopCount(0);
      return;
    }

    const showNextImage = () => {
      timeoutRef.current = null; // Clear the timeout ref when it executes
      setCurrentImage(prev => {
        const next = prev + 1;
        if (next > totalImages) {
          setLoopCount(currentLoop => currentLoop + 1);
          return 2; // Reset to second image (skip image 1) and continue looping
        }
        return next;
      });
    };

    const scheduleNextImage = () => {
      // Image 2 and last image (15) get 500ms, all others get 250ms
      const delay = (currentImage === 2 || currentImage === 15) ? 500 : 250;
      timeoutRef.current = setTimeout(showNextImage, delay);
    };

    scheduleNextImage();

    // Cleanup function to clear timeout on unmount or dependency change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

  }, [isVisible, currentImage]);

  if (!isVisible) return null;

  return (
    <div className="loading-modal-overlay">
      <div className="loading-modal-content">
        <img
          src={`/img/carga/${currentImage}.png`}
          alt={`Loading ${currentImage}`}
          style={{
            maxWidth: '70%',
            maxHeight: '60vh',
            objectFit: 'contain',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            marginBottom: '20px'
          }}
          onError={(e) => {
            console.error(`Failed to load image ${currentImage}.png`);
          }}
        />
        <div className="loading-text">cargando</div>
      </div>
    </div>
  );
};

export default LoadingModal;