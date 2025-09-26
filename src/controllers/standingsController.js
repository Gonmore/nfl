const { getNFLStandings } = require('../services/espnService');

// Obtiene standings de la NFL
const getStandings = async (req, res) => {
  try {
    const standings = await getNFLStandings();
    return res.json({ standings });
  } catch (error) {
    console.error('Error en getStandings:', error);
    return res.status(500).json({ message: 'Error al obtener standings.', error: error.message });
  }
};

module.exports = { getStandings };