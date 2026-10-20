const mysql = require('mysql2/promise');

async function main() {
  const p = mysql.createPool({ host: 'localhost', user: 'root', password: '', database: 'gusgon' });

  // 1. system_store içindeki relational dump kalıntılarını tamamen temizle
  const [d1] = await p.query("DELETE FROM system_store WHERE store_key LIKE 'ziorse_srv_members%' OR store_key = 'ziorse_user_directory' OR store_key = 'ziorse_accounts'");
  console.log('Deleted from system_store:', d1.affectedRows);

  // 2. server_members içindeki hesapları temizle (accounts tablosunda olmayan her şey)
  const [d2] = await p.query("DELETE FROM server_members WHERE LOWER(handle) NOT IN (SELECT LOWER(handle) FROM accounts)");
  console.log('Deleted from server_members:', d2.affectedRows);

  // 3. user_directory içindeki hesapları temizle (accounts tablosunda olmayan her şey)
  const [d3] = await p.query("DELETE FROM user_directory WHERE LOWER(handle) NOT IN (SELECT LOWER(handle) FROM accounts)");
  console.log('Deleted from user_directory:', d3.affectedRows);

  // 4. friend_requests içindeki geçersiz hesapları temizle
  const [d4] = await p.query("DELETE FROM friend_requests WHERE LOWER(target_handle) NOT IN (SELECT LOWER(handle) FROM accounts) OR LOWER(from_handle) NOT IN (SELECT LOWER(handle) FROM accounts)");
  console.log('Deleted from friend_requests:', d4.affectedRows);

  // 5. Sunucu sahibini geçerli ilk hesaba (@justawp) güncelle
  const [accs] = await p.query('SELECT handle, name, avatar FROM accounts ORDER BY id ASC LIMIT 1');
  if (accs.length > 0) {
    const admin = accs[0];
    await p.query('UPDATE servers SET owner_handle = ?, owner_name = ?, owner_avatar = ? WHERE LOWER(owner_handle) NOT IN (SELECT LOWER(handle) FROM accounts)', [
      admin.handle, admin.name, admin.avatar || ''
    ]);
    console.log('Updated server owner to:', admin.handle);
  }

  // Son durum:
  const [remAccs] = await p.query('SELECT id, handle, name FROM accounts');
  console.log('Remaining accounts:', remAccs);
  const [remMems] = await p.query('SELECT server_code, handle, name FROM server_members');
  console.log('Remaining members:', remMems);
  const [remDir] = await p.query('SELECT handle, name FROM user_directory');
  console.log('Remaining directory:', remDir);

  await p.end();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
