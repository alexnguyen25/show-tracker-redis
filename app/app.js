const path = require('path');
const express = require('express');

const leaderboardRoutes = require('./routes/leaderboard');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));

/**
 * GET /
 * TODO: Optional home-page data from MongoDB (getDb() from ./db/mongo).
 */
app.get('/', (req, res) => {
  res.render('index');
});

app.use('/leaderboard', leaderboardRoutes);

async function start() {
  // TODO: const redis = require('./db/redis'); await redis.connect();

  app.listen(PORT, () => {
    console.log(`ShowTracker Redis listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
