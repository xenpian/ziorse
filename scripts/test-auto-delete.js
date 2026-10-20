const io = require('socket.io-client');
const mysql = require('mysql2/promise');

async function testAutoDelete() {
  const socket = io('http://127.0.0.1:3000', { reconnection: false });

  let serverDeletedEventReceived = false;

  socket.on('connect', () => {
    console.log('[Socket] Connected to server.');
  });

  socket.on('server-deleted', (data) => {
    console.log('[Socket] RECEIVED server-deleted:', data);
    if (data.inviteCode === 'testdel123') {
      serverDeletedEventReceived = true;
    }
  });

  socket.on('invite-registry-updated', (reg) => {
    console.log('[Socket] invite-registry-updated, servers count:', Object.keys(reg).length, Object.keys(reg));
  });

  // Wait 1s for initial connection
  await new Promise(r => setTimeout(r, 1000));

  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'gusgon'
  });

  console.log('[DB Test] 1. Adding temporary test server directly to MySQL...');
  await conn.query(`
    INSERT INTO servers (invite_code, server_id, server_name, is_public, member_count)
    VALUES ('testdel123', 'srv-testdel123', 'Test Deletion Server', 1, 1)
    ON DUPLICATE KEY UPDATE server_name = VALUES(server_name)
  `);

  console.log('[DB Test] Waiting 1.5s for watcher to detect addition...');
  await new Promise(r => setTimeout(r, 1500));

  console.log('[DB Test] 2. Deleting temporary test server directly from MySQL...');
  await conn.query("DELETE FROM servers WHERE invite_code = 'testdel123'");

  console.log('[DB Test] Waiting 1.5s for watcher to detect deletion...');
  await new Promise(r => setTimeout(r, 1500));

  await conn.end();
  socket.disconnect();

  if (serverDeletedEventReceived) {
    console.log('>>> SUCCESS: MySQL deletion was automatically and instantly detected and broadcasted to clients!');
    process.exit(0);
  } else {
    console.error('>>> FAILURE: server-deleted event was NOT received.');
    process.exit(1);
  }
}

testAutoDelete().catch(err => {
  console.error('Error during test:', err);
  process.exit(1);
});
