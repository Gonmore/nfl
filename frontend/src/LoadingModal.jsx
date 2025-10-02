import React from 'react';
import './LoadingModal.css';

const LoadingModal = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="loading-modal-overlay">
      <div className="loading-modal-content">
        <div className="loading-spinner">
          <img
            src="/img/logo_MVPicks.png"
            alt="MVPicks Logo"
            className="loading-logo"
          />
        </div>
        <div className="loading-text">cargando</div>
      </div>
    </div>
  );
};

export default LoadingModal;