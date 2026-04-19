const express = require('express');

const router = express.Router();

/**
 * GET /leaderboard
 * TODO: Read sorted set leaderboard:artists (e.g. ZREVRANGE WITHSCORES)
 *       and build rows for the view: { rank, artistName, followCount }.
 * TODO: Optionally sync scores from MongoDB users.followed_artists when appropriate.
 */
router.get('/', (req, res) => {
  // Placeholder: pass empty rows until Redis query is implemented
  res.render('leaderboard', {
    rows: [],
  });
});

module.exports = router;
