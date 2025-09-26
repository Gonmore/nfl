import React, { useEffect, useState } from 'react';
import { getLeagueStats, getUserPicksDetails } from './api';

export default function LeagueStats({ token, leagueId, week: initialWeek }) {
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [totalStats, setTotalStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedWeek, setSelectedWeek] = useState(initialWeek);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalWeek, setModalWeek] = useState(initialWeek);
  const [modalUser, setModalUser] = useState(null);
  const [modalDetails, setModalDetails] = useState([]);
  const [modalTotalPoints, setModalTotalPoints] = useState(0);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError('');
      try {
        const res = await getLeagueStats(token, leagueId, selectedWeek);
        setWeeklyStats(res.weekly || []);
        setTotalStats(res.total || []);
      } catch (err) {
        setError('Error al cargar estadísticas');
      }
      setLoading(false);
    }
    fetchStats();
  }, [token, leagueId, selectedWeek]);

  const handleUserClick = async (userId, userName) => {
    setModalUser(userName);
    setModalWeek(selectedWeek);
    setModalOpen(true);
    await loadModalDetails(userId, selectedWeek);
  };

  const loadModalDetails = async (userId, week) => {
    setDetailsLoading(true);
    try {
      const res = await getUserPicksDetails(token, leagueId, week, userId);
      setModalDetails(res.details || []);
      const totalPoints = res.details.reduce((sum, detail) => sum + detail.points, 0);
      setModalTotalPoints(totalPoints);
    } catch (err) {
      setError('Error al cargar detalles');
    }
    setDetailsLoading(false);
  };

  const handleModalWeekChange = async (newWeek) => {
    setModalWeek(newWeek);
    if (modalUser) {
      // Find userId from either weekly or total stats
      const userFromWeekly = weeklyStats.find(s => s.user === modalUser);
      const userFromTotal = totalStats.find(s => s.user === modalUser);
      const userId = userFromWeekly?.userId || userFromTotal?.userId;
      if (userId) {
        await loadModalDetails(userId, newWeek);
      }
    }
  };

  return (
    <div style={{ marginTop: 32 }}>
      <h3>Ranking Semanal</h3>
      <div style={{ marginBottom: 16 }}>
        <label>Semana: </label>
        <select value={selectedWeek} onChange={e => setSelectedWeek(parseInt(e.target.value))}>
          {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18].map(w => (
            <option key={w} value={w}>GW {w}</option>
          ))}
        </select>
      </div>
      <h4>GW {selectedWeek}</h4>
      {loading && <div>Cargando...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 32 }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ccc' }}>Posición</th>
            <th style={{ borderBottom: '1px solid #ccc' }}>Usuario</th>
            <th style={{ borderBottom: '1px solid #ccc' }}>Puntos</th>
          </tr>
        </thead>
        <tbody>
          {weeklyStats.map((s, index) => (
            <tr key={s.userId}>
              <td>{index + 1}</td>
              <td style={{ cursor: 'pointer', color: 'blue' }} onClick={() => handleUserClick(s.userId, s.user)}>{s.user}</td>
              <td>{s.points}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Ranking Total</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ccc' }}>Posición</th>
            <th style={{ borderBottom: '1px solid #ccc' }}>Usuario</th>
            <th style={{ borderBottom: '1px solid #ccc' }}>Puntos Totales</th>
          </tr>
        </thead>
        <tbody>
          {totalStats.map((s, index) => (
            <tr key={s.userId}>
              <td>{index + 1}</td>
              <td style={{ cursor: 'pointer', color: 'blue' }} onClick={() => handleUserClick(s.userId, s.user)}>{s.user}</td>
              <td>{s.points}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: 24,
            borderRadius: 8,
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'auto',
            width: '90%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3>Detalles de picks de {modalUser}</h3>
              <button onClick={() => setModalOpen(false)} style={{ fontSize: '20px', border: 'none', background: 'none', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>Semana: </label>
              <select value={modalWeek} onChange={e => handleModalWeekChange(parseInt(e.target.value))}>
                {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18].map(w => (
                  <option key={w} value={w}>GW {w}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 16, fontSize: '18px', fontWeight: 'bold' }}>
              Puntos en GW {modalWeek}: {modalTotalPoints}
            </div>

            {detailsLoading && <div>Cargando detalles...</div>}
            {!detailsLoading && modalDetails.length === 0 && <div>No hay picks para esta semana.</div>}
            {!detailsLoading && modalDetails.map(detail => (
              <div key={detail.gameId} style={{ marginBottom: 8, padding: 8, background: detail.correct ? '#d4edda' : '#f8d7da', borderRadius: 4 }}>
                <strong>{detail.awayTeam} vs {detail.homeTeam}</strong><br />
                Pick: {detail.pick} | Ganador: {detail.winner || 'Pendiente'} | Correcto: {detail.correct ? 'Sí' : 'No'} | Puntos: {detail.points}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
