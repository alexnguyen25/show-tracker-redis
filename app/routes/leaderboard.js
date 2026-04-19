const express = require('express');

const redis = require('../db/redis');
const { seedLeaderboard, LEADERBOARD_KEY } = require('../seedLeaderboard');

const router = express.Router();

async function ensureRedis() {
  if (!redis.isOpen) {
    await redis.connect();
  }
}

/**
 * ZREVRANGE leaderboard:artists 0 -1 WITHSCORES — node-redis v4: zRangeWithScores + REV.
 */
router.get('/', async (req, res) => {
  try {
    await ensureRedis();
    const entries = await redis.zRangeWithScores(LEADERBOARD_KEY, 0, -1, {
      REV: true,
    });

    const rows = entries.map((entry, i) => ({
      rank: i + 1,
      artistName: entry.value,
      followCount: Number(entry.score),
    }));

    res.render('leaderboard', {
      rows,
      error: req.query.error || null,
    });
  } catch (err) {
    console.error('GET /leaderboard', err);
    res.status(500).send(err.message || 'Server error');
  }
});

router.post('/increment/:artistName', async (req, res) => {
  try {
    await ensureRedis();
    const name = req.params.artistName;
    await redis.zIncrBy(LEADERBOARD_KEY, 1, name);
    res.redirect('/leaderboard');
  } catch (err) {
    console.error('POST /leaderboard/increment', err);
    res.redirect(
      `/leaderboard?error=${encodeURIComponent(err.message || 'Increment failed')}`,
    );
  }
});

router.post('/decrement/:artistName', async (req, res) => {
  try {
    await ensureRedis();
    const name = req.params.artistName;
    await redis.zIncrBy(LEADERBOARD_KEY, -1, name);
    res.redirect('/leaderboard');
  } catch (err) {
    console.error('POST /leaderboard/decrement', err);
    res.redirect(
      `/leaderboard?error=${encodeURIComponent(err.message || 'Decrement failed')}`,
    );
  }
});

router.post('/reset', async (req, res) => {
  try {
    await ensureRedis();
    await redis.del(LEADERBOARD_KEY);
    await seedLeaderboard(redis);
    res.redirect('/leaderboard');
  } catch (err) {
    console.error('POST /leaderboard/reset', err);
    res.redirect(
      `/leaderboard?error=${encodeURIComponent(err.message || 'Reset failed')}`,
    );
  }
});

router.post('/add', async (req, res) => {
  try {
    await ensureRedis();
    const artistName = (req.body.artistName || '').trim();
    if (!artistName) {
      return res.redirect(
        `/leaderboard?error=${encodeURIComponent('Artist name is required')}`,
      );
    }
    await redis.zAdd(LEADERBOARD_KEY, { score: 0, value: artistName });
    res.redirect('/leaderboard');
  } catch (err) {
    console.error('POST /leaderboard/add', err);
    res.redirect(
      `/leaderboard?error=${encodeURIComponent(err.message || 'Add failed')}`,
    );
  }
});

router.post('/remove/:artistName', async (req, res) => {
  try {
    await ensureRedis();
    const name = req.params.artistName;
    await redis.zRem(LEADERBOARD_KEY, name);
    res.redirect('/leaderboard');
  } catch (err) {
    console.error('POST /leaderboard/remove', err);
    res.redirect(
      `/leaderboard?error=${encodeURIComponent(err.message || 'Remove failed')}`,
    );
  }
});

module.exports = router;
