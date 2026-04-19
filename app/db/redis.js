const { createClient } = require('redis');

/**
 * Redis client (v4+). Sorted set leaderboard key: leaderboard:artists
 * (member: artist name, score: follow count).
 */
const client = createClient({
  url: 'redis://localhost:6379',
});

client.on('error', (err) => {
  console.error('Redis Client Error', err);
});

module.exports = client;
