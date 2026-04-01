import fp from 'fastify-plugin';
import { MongoClient } from 'mongodb';

function isLocalSingleHost(uri) {
  const match = uri.match(/^mongodb:\/\/([^/?]+)/i);
  if (!match) return false;
  const hosts = match[1].split(',').map((s) => s.trim().split(':')[0]);
  return hosts.length === 1 && hosts.some((h) => ['127.0.0.1', 'localhost', '::1'].includes(h));
}

function shouldUseDirectConnection(uri, config) {
  if (config.MONGO_DIRECT_CONNECTION === 'true') return true;
  if (config.MONGO_DIRECT_CONNECTION === 'false') return false;
  return isLocalSingleHost(uri);
}

const mongoPlugin = async (fastify) => {
  const uri = fastify.config.DATABASE_URL;

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10_000,
    ...(shouldUseDirectConnection(uri, fastify.config) && {
      directConnection: true,
    }),
  });

  await client.connect();

  const db = client.db('ev_charging');

  await db.collection('sessions').createIndex({ sessionId: 1 }, { unique: true });

  await db.collection('idempotency').createIndex({ idempotencyKey: 1, type: 1 }, { unique: true });

  await db.collection('idempotency').createIndex(
    { createdAt: 1 },
    { expireAfterSeconds: 86400 }, // 1 day
  );

  fastify.decorate('mongo', {
    client,
    db,
    sessions: db.collection('sessions'),
    idempotency: db.collection('idempotency'),
  });

  fastify.addHook('onClose', async () => {
    await client.close();
  });
};

export default fp(mongoPlugin, { name: 'mongo' });
