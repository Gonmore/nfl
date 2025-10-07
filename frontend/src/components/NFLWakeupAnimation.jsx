import React, { useEffect, useState } from 'react';

/**
 * Componente de animación de wakeup que muestra logos de equipos NFL desde ESPN
 * Se muestra mientras el backend está despertando
 */
export default function NFLWakeupAnimation({ isVisible, onBackendReady }) {
  const [currentLogoIndex, setCurrentLogoIndex] = useState(0);
  const [nflTeams, setNflTeams] = useState([]);
  const [isLoadingLogos, setIsLoadingLogos] = useState(true);

  // Lista de equipos NFL con sus abreviaciones para ESPN
  const teams = [
    { name: 'Arizona Cardinals', abbr: 'ari' },
    { name: 'Atlanta Falcons', abbr: 'atl' },
    { name: 'Baltimore Ravens', abbr: 'bal' },
    { name: 'Buffalo Bills', abbr: 'buf' },
    { name: 'Carolina Panthers', abbr: 'car' },
    { name: 'Chicago Bears', abbr: 'chi' },
    { name: 'Cincinnati Bengals', abbr: 'cin' },
    { name: 'Cleveland Browns', abbr: 'cle' },
    { name: 'Dallas Cowboys', abbr: 'dal' },
    { name: 'Denver Broncos', abbr: 'den' },
    { name: 'Detroit Lions', abbr: 'det' },
    { name: 'Green Bay Packers', abbr: 'gb' },
    { name: 'Houston Texans', abbr: 'hou' },
    { name: 'Indianapolis Colts', abbr: 'ind' },
    { name: 'Jacksonville Jaguars', abbr: 'jax' },
    { name: 'Kansas City Chiefs', abbr: 'kc' },
    { name: 'Las Vegas Raiders', abbr: 'lv' },
    { name: 'Los Angeles Chargers', abbr: 'lac' },
    { name: 'Los Angeles Rams', abbr: 'lar' },
    { name: 'Miami Dolphins', abbr: 'mia' },
    { name: 'Minnesota Vikings', abbr: 'min' },
    { name: 'New England Patriots', abbr: 'ne' },
    { name: 'New Orleans Saints', abbr: 'no' },
    { name: 'New York Giants', abbr: 'nyg' },
    { name: 'New York Jets', abbr: 'nyj' },
    { name: 'Philadelphia Eagles', abbr: 'phi' },
    { name: 'Pittsburgh Steelers', abbr: 'pit' },
    { name: 'San Francisco 49ers', abbr: 'sf' },
    { name: 'Seattle Seahawks', abbr: 'sea' },
    { name: 'Tampa Bay Buccaneers', abbr: 'tb' },
    { name: 'Tennessee Titans', abbr: 'ten' },
    { name: 'Washington Commanders', abbr: 'wsh' }
  ];

  useEffect(() => {
    if (isVisible) {
      // Generar URLs de logos desde ESPN
      const logosWithUrls = teams.map(team => ({
        ...team,
        logo: `https://a.espncdn.com/i/teamlogos/nfl/500/${team.abbr}.png`
      }));
      setNflTeams(logosWithUrls);
      setIsLoadingLogos(false);

      // Rotar logos cada 500ms
      const interval = setInterval(() => {
        setCurrentLogoIndex((prev) => (prev + 1) % logosWithUrls.length);
      }, 500);

      return () => clearInterval(interval);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 44, 95, 0.98)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '32px',
        animation: 'fadeIn 0.5s ease-in-out'
      }}>
        {/* Logo animado */}
        <div style={{
          position: 'relative',
          width: '200px',
          height: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {!isLoadingLogos && nflTeams.length > 0 && (
            <img
              key={currentLogoIndex}
              src={nflTeams[currentLogoIndex].logo}
              alt={nflTeams[currentLogoIndex].name}
              style={{
                width: '180px',
                height: '180px',
                objectFit: 'contain',
                animation: 'scaleIn 0.5s ease-in-out',
                filter: 'drop-shadow(0 8px 32px rgba(255, 255, 255, 0.3))'
              }}
              onError={(e) => {
                // Fallback si falla la carga
                console.error(`Error loading logo for ${nflTeams[currentLogoIndex].name}`);
              }}
            />
          )}
          
          {/* Anillo giratorio */}
          <div style={{
            position: 'absolute',
            width: '220px',
            height: '220px',
            border: '4px solid rgba(255, 255, 255, 0.2)',
            borderTop: '4px solid #FFFFFF',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>

        {/* Texto */}
        <div style={{
          textAlign: 'center',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '28px',
            fontWeight: '800',
            letterSpacing: '1px',
            textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            CONECTANDO CON SERVIDORES NFL
          </h2>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <div className="dot-flashing" style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              animation: 'dotFlashing 1s infinite linear alternate'
            }}></div>
            <div className="dot-flashing" style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              animation: 'dotFlashing 1s infinite linear alternate 0.2s'
            }}></div>
            <div className="dot-flashing" style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              animation: 'dotFlashing 1s infinite linear alternate 0.4s'
            }}></div>
          </div>

          <p style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: '500',
            opacity: 0.8,
            letterSpacing: '0.5px'
          }}>
            {!isLoadingLogos && nflTeams.length > 0 && nflTeams[currentLogoIndex].name}
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        @keyframes dotFlashing {
          0% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
}
