// Runs real HTTP/database tests in a fresh, disposable PostgreSQL schema.
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { spawnSync } = require('node:child_process');
const { randomBytes } = require('node:crypto');
const Redis = require('ioredis');
(async () => {
  const schema = `agrotrack_test_${randomBytes(8).toString('hex')}`;
  const url = new URL(process.env.DATABASE_URL);
  const admin = new PrismaClient();
  url.searchParams.set('schema', schema);
  const testEnv = { ...process.env, DATABASE_URL: url.toString(), REDIS_KEY_PREFIX: schema + ':', NODE_ENV: 'test', AGROTRACK_INTEGRATION: '1' };
  let exitCode = 1;
  try {
    await admin.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`);
    const migration = spawnSync(process.execPath, ['node_modules/prisma/build/index.js', 'migrate', 'deploy'], { env: testEnv, stdio: 'inherit' });
    if (migration.status !== 0) throw new Error('Test migration failed');
    const result = spawnSync(process.execPath, ['node_modules/jest/bin/jest.js', '--runInBand'], { env: testEnv, stdio: 'inherit' });
    exitCode = result.status ?? 1;
  } finally {
    const cache = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: 1 });
    try {
      let cursor = '0';
      do {
        const [next, keys] = await cache.scan(cursor, 'MATCH', schema + ':*', 'COUNT', 100);
        if (keys.length) await cache.del(...keys);
        cursor = next;
      } while (cursor !== '0');
    } finally { cache.disconnect(); }
    await admin.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
    await admin.$disconnect();
  }
  process.exitCode = exitCode;
})().catch(error => { console.error(error.message); process.exitCode = 1; });
