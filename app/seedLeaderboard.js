const { getDb } = require('./db/mongo');

const LEADERBOARD_KEY = 'leaderboard:artists';

/**
 * Seed Redis sorted set from MongoDB users.followed_artists → artists.name counts.
 * Skips entirely if LEADERBOARD_KEY already exists (use after DEL to re-seed).
 */
async function seedLeaderboard(redis) {
  const exists = await redis.exists(LEADERBOARD_KEY);
  if (exists) return;

  const db = await getDb();
  const users = await db.collection('users').find({}).toArray();

  const countsByArtistId = new Map();
  for (const user of users) {
    for (const artistId of user.followed_artists || []) {
      countsByArtistId.set(artistId, (countsByArtistId.get(artistId) || 0) + 1);
    }
  }

  if (countsByArtistId.size === 0) return;

  const artistIds = [...countsByArtistId.keys()];
  const artistDocs = await db
    .collection('artists')
    .find({ artist_id: { $in: artistIds } })
    .toArray();

  const idToName = new Map(artistDocs.map((a) => [a.artist_id, a.name]));

  const countsByName = new Map();
  for (const [artistId, count] of countsByArtistId) {
    const name = idToName.get(artistId);
    if (name == null || name === '') continue;
    countsByName.set(name, (countsByName.get(name) || 0) + count);
  }

  const members = [...countsByName.entries()].map(([value, score]) => ({
    score,
    value,
  }));

  if (members.length === 0) return;

  await redis.zAdd(LEADERBOARD_KEY, members);
}

module.exports = { seedLeaderboard, LEADERBOARD_KEY };
