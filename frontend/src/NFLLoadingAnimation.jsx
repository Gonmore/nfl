import React, { useState, useEffect } from 'react';

// Equipos NFL con sus abreviaciones para obtener logos de ESPN
const nflTeams = [
  'ARI', 'ATL', 'BAL', 'BUF', 'CAR', 'CHI', 'CIN', 'CLE',
  'DAL', 'DEN', 'DET', 'GB', 'HOU', 'IND', 'JAX', 'KC',
  'LAC', 'LAR', 'LV', 'MIA', 'MIN', 'NE', 'NO', 'NYG',
  'NYJ', 'PHI', 'PIT', 'SEA', 'SF', 'TB', 'TEN', 'WAS'
];

export default function NFLLoadingAnimation({ isVisible }) {
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setFadeIn(false);
      
      setTimeout(() => {
        setCurrentTeamIndex((prev) => (prev + 1) % nflTeams.length);
        setFadeIn(true);
      }, 300);
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  const currentTeam = nflTeams[currentTeamIndex];

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
      zIndex: 10000,
      backdropFilter: 'blur(4px)'
    }}>
      {/* Logo animado */}
      <div style={{
        width: '200px',
        height: '200px',
        marginBottom: '32px',
        opacity: fadeIn ? 1 : 0,
        transform: fadeIn ? 'scale(1)' : 'scale(0.8)',
        transition: 'all 0.3s ease-in-out'
      }}>
        <img
          src={`https://a.espncdn.com/i/teamlogos/nfl/500/${currentTeam.toLowerCase()}.png`}
          alt={currentTeam}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))'
          }}
          onError={(e) => {
            e.target.src = 'https://a.espncdn.com/i/teamlogos/nfl/500/nfl.png';
          }}
        />
      </div>

      {/* Mensaje */}
      <div style={{
        textAlign: 'center',
        color: 'white',
        marginBottom: '24px'
      }}>
        <h2 style={{
          margin: '0 0 8px 0',
          fontSize: '24px',
          fontWeight: '800',
          letterSpacing: '1px',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
        }}>
          CONECTANDO CON SERVIDORES NFL
        </h2>
        <p style={{
          margin: 0,
          fontSize: '14px',
          opacity: 0.9,
          fontWeight: '600'
        }}>
          Preparando tu experiencia de picks...
        </p>
      </div>

      {/* Barra de progreso animada */}
      <div style={{
        width: '300px',
        height: '4px',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '2px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: '50%',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)',
          animation: 'shimmer 1.5s infinite'
        }}></div>
      </div>

      {/* Animación CSS inline */}
      <style>
        {`
          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(300%);
            }
          }
        `}
      </style>
    </div>
  );
}
