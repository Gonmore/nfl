import React, { useState, useEffect } from 'react';

export default function AdminPanel({ token, onClose }) {
  const [stats, setStats] = useState(null);
  const [tables, setTables] = useState({});
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [tableSchema, setTableSchema] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sqlQuery, setSqlQuery] = useState('');
  const [queryResults, setQueryResults] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setIsAdmin(true);
        loadDashboard();
      } else {
        setError('No tienes permisos de administrador');
      }
    } catch (err) {
      setError('Error al verificar permisos de administrador');
    }
  };

  const loadDashboard = async () => {
    await Promise.all([loadStats(), loadTables()]);
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError('Error al cargar estadísticas');
    }
  };

  const loadTables = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/tables`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setTables(data.tables);
    } catch (err) {
      setError('Error al cargar tablas');
    }
  };

  const loadTableData = async (tableName, page = 1) => {
    setLoading(true);
    try {
      // Cargar esquema
      const schemaResponse = await fetch(`${API_URL}/admin/tables/${tableName}/schema`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const schemaData = await schemaResponse.json();
      setTableSchema(schemaData.schema);

      // Cargar datos
      const response = await fetch(`${API_URL}/admin/tables/${tableName}?page=${page}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      setTableData(data.data);
      setCurrentPage(page);
      setTotalPages(data.totalPages);
      setSelectedTable(tableName);
    } catch (err) {
      setError('Error al cargar datos de la tabla');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingRecord(null);
    setFormData({});
    setShowModal(true);
  };

  const openEditModal = async (id) => {
    try {
      const response = await fetch(`${API_URL}/admin/tables/${selectedTable}/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setEditingRecord(data.record);
      setFormData(data.record);
      setShowModal(true);
    } catch (err) {
      setError('Error al cargar registro');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingRecord
        ? `${API_URL}/admin/tables/${selectedTable}/${editingRecord.id}`
        : `${API_URL}/admin/tables/${selectedTable}`;
      
      const method = editingRecord ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(editingRecord ? 'Registro actualizado' : 'Registro creado');
        setShowModal(false);
        loadTableData(selectedTable, currentPage);
      } else {
        setError(result.message || 'Error al guardar');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este registro?')) return;

    try {
      const response = await fetch(`${API_URL}/admin/tables/${selectedTable}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setSuccess('Registro eliminado');
        loadTableData(selectedTable, currentPage);
      } else {
        setError('Error al eliminar');
      }
    } catch (err) {
      setError('Error de conexión');
    }
  };

  const executeQuery = async () => {
    if (!sqlQuery.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query: sqlQuery })
      });

      const data = await response.json();

      if (response.ok) {
        setQueryResults(data.results);
        setSuccess(`${data.count} resultados`);
      } else {
        setError(data.message || 'Error al ejecutar consulta');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div style={styles.container}>
        <div style={styles.errorCard}>
          <h2>⚠️ Acceso Denegado</h2>
          <p>{error || 'Verificando permisos...'}</p>
          <button onClick={onClose} style={styles.btn}>Volver</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>🔧 Panel de Administración</h1>
        <button onClick={onClose} style={styles.closeBtn}>← Volver al Dashboard</button>
      </div>

      {/* Mensajes */}
      {error && (
        <div style={styles.error}>
          {error}
          <button onClick={() => setError('')} style={styles.closeMessage}>✕</button>
        </div>
      )}
      {success && (
        <div style={styles.success}>
          {success}
          <button onClick={() => setSuccess('')} style={styles.closeMessage}>✕</button>
        </div>
      )}

      {/* Estadísticas */}
      {stats && !selectedTable && (
        <div style={styles.statsGrid}>
          {Object.entries(stats.totalRecords).map(([key, value]) => (
            <div key={key} style={styles.statCard}>
              <h3>{formatTableName(key)}</h3>
              <div style={styles.statNumber}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Consulta SQL */}
      {!selectedTable && (
        <div style={styles.querySection}>
          <h2 style={styles.sectionTitle}>Consulta SQL (Solo SELECT)</h2>
          <textarea
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            placeholder="SELECT * FROM ..."
            style={styles.textarea}
          />
          <button onClick={executeQuery} style={styles.btn} disabled={loading}>
            {loading ? 'Ejecutando...' : 'Ejecutar Consulta'}
          </button>

          {queryResults && queryResults.length > 0 && (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {Object.keys(queryResults[0]).map(col => (
                      <th key={col} style={styles.th}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {queryResults.map((row, idx) => (
                    <tr key={idx} style={styles.tr}>
                      {Object.values(row).map((val, i) => (
                        <td key={i} style={styles.td}>{formatValue(val)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tablas */}
      {!selectedTable && (
        <div style={styles.tablesSection}>
          <h2 style={styles.sectionTitle}>Tablas de la Base de Datos</h2>
          <div style={styles.tablesGrid}>
            {Object.entries(tables).map(([key, value]) => (
              <button
                key={key}
                onClick={() => loadTableData(key)}
                style={styles.tableBtn}
              >
                {value.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Vista de Tabla */}
      {selectedTable && (
        <div style={styles.dataSection}>
          <div style={styles.dataHeader}>
            <h2>{tables[selectedTable]?.name}</h2>
            <div>
              <button onClick={() => setSelectedTable(null)} style={styles.btnSecondary}>
                ← Volver
              </button>
              <button onClick={openCreateModal} style={styles.btn}>
                + Crear
              </button>
            </div>
          </div>

          {tableData.length > 0 && (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {Object.keys(tableData[0]).map(col => (
                      <th key={col} style={styles.th}>{col}</th>
                    ))}
                    <th style={styles.th}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row) => (
                    <tr key={row.id} style={styles.tr}>
                      {Object.entries(row).map(([key, val]) => (
                        <td key={key} style={styles.td}>{formatValue(val)}</td>
                      ))}
                      <td style={styles.td}>
                        <button onClick={() => openEditModal(row.id)} style={styles.btnSmall}>
                          ✏️
                        </button>
                        <button onClick={() => handleDelete(row.id)} style={{...styles.btnSmall, ...styles.btnDanger}}>
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div style={styles.pagination}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => loadTableData(selectedTable, page)}
                  style={{
                    ...styles.pageBtn,
                    ...(page === currentPage ? styles.pageActive : {})
                  }}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Crear/Editar */}
      {showModal && (
        <div style={styles.modal} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>
              {editingRecord ? 'Editar Registro' : 'Crear Registro'}
            </h2>
            <form onSubmit={handleSubmit}>
              {tableSchema
                .filter(field => !field.autoIncrement && field.field !== 'createdAt' && field.field !== 'updatedAt')
                .map(field => (
                  <div key={field.field} style={styles.formGroup}>
                    <label style={styles.label}>
                      {field.field} {!field.allowNull && '*'}
                    </label>
                    <input
                      type="text"
                      value={formData[field.field] || ''}
                      onChange={(e) => setFormData({...formData, [field.field]: e.target.value})}
                      required={!field.allowNull}
                      style={styles.input}
                    />
                  </div>
                ))}
              <div style={styles.modalActions}>
                <button type="submit" style={styles.btn} disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} style={styles.btnSecondary}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function formatTableName(name) {
  const names = {
    users: 'Usuarios',
    leagues: 'Ligas',
    leagueMembers: 'Miembros de Liga',
    games: 'Partidos',
    picks: 'Picks',
    scores: 'Puntuaciones',
    invitationTokens: 'Tokens de Invitación',
    adminPicks: 'Picks de Admin'
  };
  return names[name] || name;
}

function formatValue(value) {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'boolean') return value ? '✓' : '✗';
  if (typeof value === 'string' && value.length > 50) return value.substring(0, 50) + '...';
  return String(value);
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    padding: '20px',
    color: '#fff'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    padding: '20px',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px'
  },
  title: {
    color: '#00d9ff',
    fontSize: '28px',
    margin: 0
  },
  closeBtn: {
    background: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  error: {
    background: '#dc3545',
    color: 'white',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  success: {
    background: '#28a745',
    color: 'white',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  closeMessage: {
    background: 'transparent',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontSize: '20px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    padding: '20px',
    borderRadius: '12px',
    textAlign: 'center'
  },
  statNumber: {
    color: '#00d9ff',
    fontSize: '32px',
    fontWeight: 'bold',
    marginTop: '10px'
  },
  querySection: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '30px'
  },
  sectionTitle: {
    color: '#00d9ff',
    marginBottom: '15px'
  },
  textarea: {
    width: '100%',
    minHeight: '100px',
    padding: '15px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    background: 'rgba(0, 0, 0, 0.3)',
    color: 'white',
    fontFamily: 'monospace',
    marginBottom: '15px',
    fontSize: '14px'
  },
  tablesSection: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    padding: '20px',
    borderRadius: '12px'
  },
  tablesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '15px'
  },
  tableBtn: {
    background: 'linear-gradient(135deg, #00d9ff 0%, #0099cc 100%)',
    color: 'white',
    border: 'none',
    padding: '20px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'transform 0.2s'
  },
  dataSection: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    padding: '20px',
    borderRadius: '12px'
  },
  dataHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  btn: {
    background: '#00d9ff',
    color: '#1a1a2e',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginLeft: '10px'
  },
  btnSecondary: {
    background: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginLeft: '10px'
  },
  btnSmall: {
    background: '#00d9ff',
    color: 'white',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
    marginRight: '5px',
    fontSize: '12px'
  },
  btnDanger: {
    background: '#dc3545'
  },
  tableWrapper: {
    overflowX: 'auto',
    marginTop: '20px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    background: 'rgba(0, 217, 255, 0.2)',
    padding: '12px',
    textAlign: 'left',
    borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
    color: '#00d9ff',
    fontWeight: 'bold'
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
  },
  td: {
    padding: '12px',
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '20px'
  },
  pageBtn: {
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  pageActive: {
    background: '#00d9ff',
    color: '#1a1a2e'
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modalContent: {
    background: '#1a1a2e',
    padding: '30px',
    borderRadius: '12px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto'
  },
  modalTitle: {
    color: '#00d9ff',
    marginBottom: '20px'
  },
  formGroup: {
    marginBottom: '15px'
  },
  label: {
    display: 'block',
    color: '#00d9ff',
    marginBottom: '5px',
    fontWeight: 'bold'
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '6px',
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'white'
  },
  modalActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px'
  },
  errorCard: {
    background: 'rgba(220, 53, 69, 0.2)',
    border: '2px solid #dc3545',
    padding: '40px',
    borderRadius: '12px',
    textAlign: 'center',
    maxWidth: '500px',
    margin: '100px auto'
  }
};
