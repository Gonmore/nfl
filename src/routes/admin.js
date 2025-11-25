const express = require('express');
const router = express.Router();
const authMiddleware = require('../services/authMiddleware');
const {
  isGlobalAdmin,
  getTables,
  getTableData,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
  executeQuery,
  getDatabaseStats,
  getTableSchema
} = require('../controllers/adminController');

// Todas las rutas requieren autenticación y permisos de admin
router.use(authMiddleware);
router.use(isGlobalAdmin);

// Estadísticas generales
router.get('/stats', getDatabaseStats);

// Listar tablas disponibles
router.get('/tables', getTables);

// Obtener esquema de una tabla
router.get('/tables/:table/schema', getTableSchema);

// CRUD de registros
router.get('/tables/:table', getTableData);
router.get('/tables/:table/:id', getRecord);
router.post('/tables/:table', createRecord);
router.put('/tables/:table/:id', updateRecord);
router.delete('/tables/:table/:id', deleteRecord);

// Ejecutar consulta SQL personalizada (solo SELECT)
router.post('/query', executeQuery);

module.exports = router;
