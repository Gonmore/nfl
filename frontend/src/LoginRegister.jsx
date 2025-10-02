import React, { useState } from 'react';
import { registerUser, loginUser } from './api';

export default function LoginRegister({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await loginUser({ email: form.email, password: form.password });
        if (res.token) {
          onLogin(res.token, res.user);
        } else {
          setError(res.message || 'Error al iniciar sesión');
        }
      } else {
        const res = await registerUser(form);
        if (res.message === 'Usuario registrado correctamente.') {
          setIsLogin(true);
          setForm({ username: '', email: '', password: '' });
        } else {
          setError(res.message || 'Error al registrarse');
        }
      }
    } catch (err) {
      setError('Error de conexión. Verifica tu conexión a internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        border: '2px solid #004B9B',
        maxWidth: '450px',
        width: '100%',
        textAlign: 'center'
      }}>
        {/* Logo y título */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <img
              src='/img/logo_MVPicks.png'
              alt='CartelNFL Logo'
              style={{
                width: '128px',
                height: '128px',
                borderRadius: '12px'
              }}
            />
          </div>
          <h1 style={{
            color: '#004B9B',
            fontSize: '32px',
            fontWeight: '700',
            margin: '0 0 8px 0',
            textAlign: 'center'
          }}>
            CartelNFL
          </h1>
          <p style={{
            color: '#666666',
            fontSize: '16px',
            margin: 0,
            textAlign: 'center'
          }}>
            {isLogin ? 'Inicia sesión en tu cuenta' : 'Crea tu cuenta'}
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
          {!isLogin && (
            <div style={{ marginBottom: '20px', textAlign: 'left' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#004B9B',
                fontSize: '14px'
              }}>
                Usuario
              </label>
              <input
                type="text"
                name="username"
                placeholder="Tu nombre de usuario"
                value={form.username}
                onChange={handleChange}
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid #DEE2E6',
                  borderRadius: '8px',
                  fontSize: '16px',
                  backgroundColor: '#FFFFFF',
                  color: '#004B9B',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#004B9B'}
                onBlur={(e) => e.target.style.borderColor = '#DEE2E6'}
              />
            </div>
          )}

          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#004B9B',
              fontSize: '14px'
            }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="tu@email.com"
              value={form.email}
              onChange={handleChange}
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid #DEE2E6',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: '#FFFFFF',
                color: '#004B9B',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#004B9B'}
              onBlur={(e) => e.target.style.borderColor = '#DEE2E6'}
            />
          </div>

          <div style={{ marginBottom: '24px', textAlign: 'left' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#004B9B',
              fontSize: '14px'
            }}>
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              placeholder="Tu contraseña"
              value={form.password}
              onChange={handleChange}
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid #DEE2E6',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: '#FFFFFF',
                color: '#004B9B',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#004B9B'}
              onBlur={(e) => e.target.style.borderColor = '#DEE2E6'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: '#004B9B',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              marginBottom: '16px'
            }}
            onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#00346C')}
            onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#004B9B')}
          >
            {loading ? (
              <div style={{
                border: '2px solid #DEE2E6',
                borderTop: '2px solid #004B9B',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                animation: 'spin 1s linear infinite',
                display: 'inline-block',
                marginRight: '8px'
              }}></div>
            ) : null}
            {loading ? 'Cargando...' : (isLogin ? 'Iniciar sesión' : 'Registrarse')}
          </button>

          {error && (
            <div style={{
              color: '#DC3545',
              backgroundColor: '#f8d7da',
              border: '1px solid #f5c6cb',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}
        </form>

        {/* Toggle entre login y registro */}
        <div style={{
          borderTop: '1px solid #DEE2E6',
          paddingTop: '20px'
        }}>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setForm({ username: '', email: '', password: '' });
            }}
            disabled={loading}
            style={{
              background: 'none',
              border: '2px solid #004B9B',
              color: '#004B9B',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              width: '100%'
            }}
            onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#004B9B') && (e.target.style.color = '#FFFFFF')}
            onMouseOut={(e) => !loading && (e.target.style.backgroundColor = 'transparent') && (e.target.style.color = '#004B9B')}
          >
            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}
