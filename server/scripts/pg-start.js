import EmbeddedPostgres from 'embedded-postgres';
import path from 'path';
import net from 'net';

function isPortOpen(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      resolve(false);
    });
    socket.connect(port, host);
  });
}

export async function ensurePostgresRunning() {
  const port = 5432;
  const running = await isPortOpen(port);
  if (running) {
    console.log(`[PostgreSQL] Active database detected on port ${port}.`);
    return null;
  }

  console.log(`[PostgreSQL] Starting embedded PostgreSQL server on port ${port}...`);
  const pg = new EmbeddedPostgres({
    databaseDir: path.resolve('./.pgdata'),
    port,
    user: 'postgres',
    password: 'postgres'
  });

  try {
    await pg.initialise();
  } catch (err) {
    // Already initialised
  }

  await pg.start();
  try {
    await pg.createDatabase('student_portfolio');
  } catch (e) {
    // Database may already exist
  }
  console.log(`[PostgreSQL] Embedded PostgreSQL server started successfully.`);
  return pg;
}

if (process.argv[1] && process.argv[1].endsWith('pg-start.js')) {
  ensurePostgresRunning().then(() => {
    console.log('[PostgreSQL] Server running. Press Ctrl+C to terminate.');
  }).catch(err => {
    console.error('[PostgreSQL] Failed to start:', err);
  });
}
