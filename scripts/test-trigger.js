const mysql = require('mysql2/promise');

async function testTrigger() {
  const p = mysql.createPool({ host: 'localhost', user: 'root', password: '', database: 'gusgon' });
  try {
    await p.query('DROP TRIGGER IF EXISTS trg_accounts_cascade_members');
    await p.query(`
      CREATE TRIGGER trg_accounts_cascade_members
      AFTER DELETE ON accounts
      FOR EACH ROW
      DELETE FROM server_members WHERE LOWER(handle) = LOWER(OLD.handle)
    `);
    console.log('Trigger 1 created');

    await p.query('DROP TRIGGER IF EXISTS trg_accounts_cascade_directory');
    await p.query(`
      CREATE TRIGGER trg_accounts_cascade_directory
      AFTER DELETE ON accounts
      FOR EACH ROW
      DELETE FROM user_directory WHERE LOWER(handle) = LOWER(OLD.handle)
    `);
    console.log('Trigger 2 created');

    await p.query('DROP TRIGGER IF EXISTS trg_accounts_cascade_friendreqs');
    await p.query(`
      CREATE TRIGGER trg_accounts_cascade_friendreqs
      AFTER DELETE ON accounts
      FOR EACH ROW
      DELETE FROM friend_requests WHERE LOWER(target_handle) = LOWER(OLD.handle) OR LOWER(from_handle) = LOWER(OLD.handle)
    `);
    console.log('Trigger 3 created');
  } catch (err) {
    console.error('Trigger error:', err.message);
  } finally {
    await p.end();
  }
}

testTrigger();
