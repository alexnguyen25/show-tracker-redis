const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

/**
 * Returns the showtracker database.
 * TODO: call once at startup or guard connect() as needed for your deployment.
 */
async function getDb() {
  await client.connect();
  return client.db('showtracker');
}

module.exports = { getDb };
