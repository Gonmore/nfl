import React, { useState, useEffect, useRef } from 'react';

export default function LoadingSequenceModal({ isVisible, onComplete }) {
  const [currentImage, setCurrentImage] = useState(2);
  const [loopCount, setLoopCount] = useState(0);
  const totalImages = 15;
  const totalLoops = 2;
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
      backgroundColor: 'rgba(0, 75, 155, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(2px)'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '32px',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 75, 155, 0.4)',
        border: '2px solid rgba(0, 75, 155, 0.3)',
        minWidth: '180px',
        minHeight: '120px'
      }}>
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
      </div>
    </div>
  );
}