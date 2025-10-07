import React, { useState, useEffect } from 'react';
import { validateInvitationToken, registerWithInvitation } from './api';

function RegisterWithInvitation({ invitationToken, onRegisterSuccess, onCancel }) {
  const [validating, setValidating] = useState(true);
  const [invitationData, setInvitationData] = useState(null);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      try {
        setValidating(true);
        const response = await validateInvitationToken(invitationToken);
        
        if (response.valid) {
          setInvitationData(response);
        } else {
          setError(response.message || 'Token de invitación inválido.');
        }
      } catch (err) {
        console.error('Error validating token:', err);
        setError(err.message || 'No se pudo validar la invitación. El link puede haber expirado o ser inválido.');
      } finally {
        setValidating(false);
      }
    };

    if (invitationToken) {
      validateToken();
    } else {
      setError('Token de invitación no encontrado.');
      setValidating(false);
    }
  }, [invitationToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!username || !password || !confirmPassword) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    if (username.length < 3) {
      setError('El nombre de usuario debe tener al menos 3 caracteres.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      setLoading(true);
      const response = await registerWithInvitation({
        invitationToken,
        username,
        password
      });

      if (response.token) {
        // Llamar al callback con los datos del usuario
        onRegisterSuccess(response.token, response.user, invitationData);
      } else {
        setError(response.message || 'Error en el registro.');
      }
    } catch (err) {
      console.error('Error registering:', err);
      setError(err.message || 'Error al registrar. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a0e27',
        color: 'white',
        padding: '20px'
      }}>
        <h2>Validando invitación...</h2>
        <p>Por favor espera un momento</p>
      </div>
    );
  }

  if (error && !invitationData) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a0e27',
        color: 'white',
        padding: '20px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '30px',
          borderRadius: '15px',
          maxWidth: '500px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#ff4444', marginBottom: '20px' }}>❌ Invitación Inválida</h2>
          <p style={{ marginBottom: '20px' }}>{error}</p>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 30px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0a0e27',
      color: 'white',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '30px',
        borderRadius: '15px',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>🏈 Invitación a Liga NFL</h2>
        
        {invitationData && (
          <div style={{
            background: 'rgba(0, 123, 255, 0.2)',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid rgba(0, 123, 255, 0.5)'
          }}>
            <p style={{ margin: '5px 0' }}>
              <strong>Liga:</strong> {invitationData.leagueName}
            </p>
            <p style={{ margin: '5px 0' }}>
              <strong>Email:</strong> {invitationData.email}
            </p>
            <p style={{ margin: '5px 0' }}>
              <strong>Picks pre-configurados:</strong> {invitationData.picksCount}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Nombre de Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Elige tu nombre de usuario"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Confirmar Contraseña
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite tu contraseña"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(255, 68, 68, 0.2)',
              padding: '10px',
              borderRadius: '8px',
              marginBottom: '15px',
              border: '1px solid rgba(255, 68, 68, 0.5)',
              color: '#ff4444'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#555' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '18px',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Registrando...' : '✓ Completar Registro'}
          </button>
        </form>

        <button
          onClick={onCancel}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: 'transparent',
            color: '#aaa',
            border: '1px solid #555',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            marginTop: '10px'
          }}
        >
          Cancelar
        </button>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#aaa' }}>
          Al registrarte, serás agregado automáticamente a la liga con tus picks pre-configurados.
        </p>
      </div>
    </div>
  );
}

export default RegisterWithInvitation;
