import React, { useState } from 'react';
import { registerUser, loginUser } from './api';

export default function LoginRegister({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
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
        } else {
          setError(res.message || 'Error al registrarse');
        }
      }
    } catch (err) {
      setError('Error de conexión');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px #ccc', background: '#fff' }}>
      <h2 style={{ textAlign: 'center' }}>CartelNFL</h2>
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <input
            type="text"
            name="username"
            placeholder="Usuario"
            value={form.username}
            onChange={handleChange}
            required
            style={{ width: '100%', marginBottom: 12, padding: 8 }}
          />
        )}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          style={{ width: '100%', marginBottom: 12, padding: 8 }}
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          required
          style={{ width: '100%', marginBottom: 12, padding: 8 }}
        />
        <button type="submit" style={{ width: '100%', padding: 10, background: '#002244', color: '#fff', border: 'none', borderRadius: 4 }}>
          {isLogin ? 'Iniciar sesión' : 'Registrarse'}
        </button>
        {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
      </form>
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: '#0074D9', cursor: 'pointer' }}>
          {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      </div>
    </div>
  );
}
