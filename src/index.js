require('dotenv').config();
const express = require('express');
const app = express();
const { sequelize } = require('./models');

const cors = require('cors');
app.use(cors({
  origin: ['http://localhost:4001', 'http://localhost:4002'],
  credentials: true
}));

app.use(express.json());


app.get('/', (req, res) => {
  res.send('CartelNFL Backend funcionando');
});


// Rutas de autenticación
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);


// Rutas de ligas
const leagueRoutes = require('./routes/league');
app.use('/leagues', leagueRoutes);


// Rutas de partidos NFL
const gameRoutes = require('./routes/game');
app.use('/nfl/games', gameRoutes);


// Rutas de picks
const pickRoutes = require('./routes/pick');
app.use('/picks', pickRoutes);

// Rutas de estadísticas
const statsRoutes = require('./routes/stats');
app.use('/stats', statsRoutes);

// Rutas de standings
const standingsRoutes = require('./routes/standings');
app.use('/nfl/standings', standingsRoutes);

const PORT = process.env.PORT || 5001;

const { syncGamesForCurrentWeek } = require('./services/espnService');
const Game = require('./models/Game');
const cron = require('node-cron');
const { Op } = require('sequelize');

const League = require('./models/League');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

sequelize.sync().then(async () => {
  // Crear usuario admin si no existe
  let adminUser = await User.findOne({ where: { email: 'admin@cartelnfl.com' } });
  if (!adminUser) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    adminUser = await User.create({
      username: 'admin',
      email: 'admin@cartelnfl.com',
      password: hashedPassword
    });
    console.log('Usuario admin creado.');
  }

  // Crear liga pública "Liga general" si no existe
  const generalLeague = await League.findOne({ where: { name: 'Liga general', isPublic: true } });
  if (!generalLeague) {
    await League.create({ name: 'Liga general', adminId: adminUser.id, isPublic: true, description: 'Liga pública general para todos los usuarios' });
    console.log('Liga general creada.');
  } else {
    console.log('Liga general ya existe.');
  }
  // Sincroniza partidos automáticamente al iniciar el backend
  try {
    await syncGamesForCurrentWeek();
    console.log('Partidos sincronizados automáticamente al iniciar.');
  } catch (err) {
    console.error('Error al sincronizar partidos automáticamente:', err.message);
  }

  // Servicio de actualización periódica
  cron.schedule('*/5 * * * *', async () => {
    try {
      // Determina el rango de actualización de la semana actual
      const now = new Date();
      const week = await Game.max('week', { where: { date: { [Op.lte]: now } } });
      const games = await Game.findAll({ where: { week } });
      if (games.length === 0) return;
      // Hora de inicio del primer partido y del último partido
      const start = new Date(Math.min(...games.map(g => new Date(g.date).getTime())));
      const end = new Date(Math.max(...games.map(g => new Date(g.date).getTime())));
      // Rango de actualización: desde start hasta end + 3 horas
      const endPlus3h = new Date(end.getTime() + 3 * 60 * 60 * 1000);
      if (now >= start && now <= endPlus3h) {
        await syncGamesForCurrentWeek();
        console.log(`[${now.toISOString()}] Actualización automática de partidos semana ${week}`);
      }
    } catch (err) {
      console.error('Error en actualización periódica:', err.message);
    }
  });

  app.listen(PORT, () => {
    console.log(`Servidor CartelNFL escuchando en puerto ${PORT}`);
  });
});
