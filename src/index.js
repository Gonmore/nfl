require('dotenv').config();
const express = require('express');
const app = express();
const { sequelize } = require('./models');

const cors = require('cors');
app.use(cors({
  origin: ['https://nfl-frontend.onrender.com', 'http://localhost:4001'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


app.get('/', (req, res) => {
  res.send('MVPicks Backend funcionando');
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

sequelize.sync({ alter: true }).then(async () => {
  // Crear usuario admin si no existe
  let adminUser = await User.findOne({ where: { email: 'admin@mvpicks.com' } });
  if (!adminUser) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    adminUser = await User.create({
      username: 'admin',
      email: 'admin@mvpicks.com',
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

  // Servicio de actualización periódica durante la semana de NFL
  cron.schedule('*/5 * * * *', async () => {
    try {
      const now = new Date();
      const currentDay = now.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
      const currentHour = now.getHours();

      // Solo sincronizar durante días de partidos: Jueves (4), Domingo (0), Lunes (1)
      // Jueves: desde las 18:00 hasta las 23:59
      // Domingo: desde las 13:00 hasta las 23:59
      // Lunes: desde las 19:00 hasta las 23:59
      let shouldSync = false;

      if (currentDay === 4 && currentHour >= 18) { // Thursday after 6 PM
        shouldSync = true;
      } else if (currentDay === 0 && currentHour >= 13) { // Sunday after 1 PM
        shouldSync = true;
      } else if (currentDay === 1 && currentHour >= 19) { // Monday after 7 PM
        shouldSync = true;
      }

      if (shouldSync) {
        await syncGamesForCurrentWeek();
        console.log(`[${now.toISOString()}] Actualización automática de partidos - Día: ${currentDay}, Hora: ${currentHour}`);
      }
    } catch (err) {
      console.error('Error en actualización periódica:', err.message);
    }
  });

  app.listen(PORT, () => {
    console.log(`Servidor MVPicks escuchando en puerto ${PORT}`);
  });
});
