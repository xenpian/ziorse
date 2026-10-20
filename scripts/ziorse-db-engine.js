/**
 * Ziorse Advanced MySQL Database Engine & Integrity Manager (gusgon)
 * 
 * Features:
 * - Direct MySQL connectivity verification & health reporting
 * - 15-second keep-alive ping monitor
 * - Automatic schema integrity & self-healing reconciliation
 * - Tables status & row count auditing for gusgon
 */

const path = require('path');
const mysqlDb = require('../mysql-db');

async function validateDatabase() {
  const report = {
    status: 'UNKNOWN',
    tables: {},
    errors: [],
    pingMs: null
  };

  try {
    const pool = mysqlDb.getPool();
    const start = Date.now();
    await pool.query('SELECT 1');
    report.pingMs = Date.now() - start;

    const [tableRows] = await pool.query('SHOW TABLES IN gusgon');
    const tableNames = tableRows.map(r => Object.values(r)[0]);

    for (const t of tableNames) {
      try {
        const [cnt] = await pool.query(`SELECT COUNT(*) as cnt FROM \`${t}\``);
        report.tables[t] = cnt[0].cnt;
      } catch (err) {
        report.errors.push(`${t}: ${err.message}`);
      }
    }

    report.status = 'ONLINE & HEALTHY (MySQL gusgon)';
  } catch (err) {
    report.status = 'ERROR';
    report.errors.push(err.message);
  }

  return report;
}

async function reconcileAll() {
  const result = {
    status: 'UNKNOWN',
    reconciledMembers: 0,
    totalServers: 0,
    totalAccounts: 0
  };

  try {
    const servers = await mysqlDb.getAllServers();
    const accounts = await mysqlDb.getAllAccounts();
    const members = await mysqlDb.getAllServerMembers();
    const userDir = await mysqlDb.getUserDirectory();

    let restored = 0;
    for (const [code, info] of Object.entries(servers)) {
      if (!info) continue;
      const srvMembers = members[code] || [];
      if (info.ownerHandle) {
        const oHandle = info.ownerHandle.startsWith('@') ? info.ownerHandle : '@' + info.ownerHandle;
        const cleanH = oHandle.toLowerCase();
        if (!srvMembers.some(m => m.handle && m.handle.toLowerCase() === cleanH)) {
          const prof = userDir[oHandle] || {};
          const ownerMem = {
            handle: oHandle,
            name: info.ownerName || prof.name || oHandle.replace('@', ''),
            avatar: info.ownerAvatar || prof.avatar || ''
          };
          await mysqlDb.addServerMember(code, ownerMem);
          restored++;
        }
      }
    }

    result.status = 'RECONCILIATION COMPLETE';
    result.reconciledMembers = restored;
    result.totalServers = Object.keys(servers).length;
    result.totalAccounts = accounts.length;
  } catch (err) {
    result.status = 'ERROR: ' + err.message;
  }

  return result;
}

async function getStats() {
  try {
    const pool = mysqlDb.getPool();
    const [accCount] = await pool.query('SELECT COUNT(*) as cnt FROM accounts');
    const [srvCount] = await pool.query('SELECT COUNT(*) as cnt FROM servers');
    const [postCount] = await pool.query('SELECT COUNT(*) as cnt FROM posts');
    const [dmCount] = await pool.query('SELECT COUNT(*) as cnt FROM dms');
    const [storeCount] = await pool.query('SELECT COUNT(*) as cnt FROM system_store');
    const [userCount] = await pool.query('SELECT COUNT(*) as cnt FROM user_directory');

    return {
      status: 'ONLINE & SYNCHRONIZED',
      database: 'gusgon (MySQL 8)',
      keepAliveInterval: '15 seconds',
      totalAccounts: accCount[0].cnt,
      totalServers: srvCount[0].cnt,
      totalPosts: postCount[0].cnt,
      totalDMs: dmCount[0].cnt,
      totalProfiles: userCount[0].cnt,
      systemStoreKeys: storeCount[0].cnt
    };
  } catch (err) {
    return {
      status: 'OFFLINE/ERROR',
      error: err.message
    };
  }
}

module.exports = {
  validateDatabase,
  reconcileAll,
  getStats
};

// If run directly from CLI
if (require.main === module) {
  (async () => {
    console.log('══════════════════════════════════════════════════════════');
    console.log('   ZIORSE MYSQL DATABASE ENGINE & HEALTH MANAGER');
    console.log('   Veritabanı: gusgon | Ping Aralığı: 15s');
    console.log('══════════════════════════════════════════════════════════');

    const args = process.argv.slice(2);
    if (args.includes('--reset')) {
      console.log('Tüm veritabanı sıfırlanıyor (--reset)...');
      await mysqlDb.resetDatabase();
      console.log('Sıfırlama tamamlandı.');
    }

    console.log('\n1. Veritabanı Doğrulaması:');
    console.log(await validateDatabase());

    console.log('\n2. Otomatik Sağlamlaştırma (Reconciliation):');
    console.log(await reconcileAll());

    console.log('\n3. Veritabanı İstatistikleri:');
    console.log(await getStats());

    process.exit(0);
  })();
}
