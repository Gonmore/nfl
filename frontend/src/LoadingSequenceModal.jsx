import React, { useState, useEffect, useRef } from 'react';

export default function LoadingSequenceModal({ isVisible, onComplete }) {
  const [currentImage, setCurrentImage] = useState(2);
  const [loopCount, setLoopCount] = useState(0);
  const totalImages = 15;
  const totalLoops = 3;
  const onCompleteRef = useRef(onComplete);
  const timeoutRef = useRef(null);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

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
          setLoopCount(currentLoop => {
            const newLoop = currentLoop + 1;
            if (newLoop >= totalLoops) {
              // Completed all loops
              setTimeout(() => {
                onCompleteRef.current();
              }, 400); // Use 400ms for the final delay
              return newLoop;
            }
            return newLoop;
          });
          return 2; // Reset to second image (skip image 1)
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
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(180deg, rgba(0, 83, 220, 0.8) 0%, rgba(0, 20, 80, 0.95) 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(2px)'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '4px',
        display: 'inline-block'
      }}>
        <img
          src={`/img/carga/${currentImage}.png`}
          alt={`Loading ${currentImage}`}
          style={{
            maxWidth: '80%',
            maxHeight: '25vh',
            objectFit: 'contain',
            borderRadius: '8px',
            display: 'block'
          }}
          onError={(e) => {
            console.error(`Failed to load image ${currentImage}.png`);
          }}
        />
      </div>
      <div style={{
        marginTop: '12px',
        color: 'white',
        fontSize: '16px',
        fontWeight: 'bold',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: '1px'
      }}>
        CARGANDO...
      </div>
    </div>
  );
}