const path = require('path');
const express = require('express');

const redis = require('./db/redis');
const { seedLeaderboard } = require('./seedLeaderboard');
const leaderboardRoutes = require('./routes/leaderboard');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('index');
});

app.use('/leaderboard', leaderboardRoutes);

async function start() {
  if (!redis.isOpen) {
    await redis.connect();
  }

  await seedLeaderboard(redis);

  app.listen(PORT, () => {
    console.log(`ShowTracker Redis listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
