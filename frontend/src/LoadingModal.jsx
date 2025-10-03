import React from 'react';
import './LoadingModal.css';

const LoadingModal = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="loading-modal-overlay">
      <div className="loading-modal-content">
        <div className="loading-text">cargando</div>
      </div>
    </div>
  );
};

export default LoadingModal;