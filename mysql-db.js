/**
 * Ziorse Social Platform - MySQL Database Engine (gusgon)
 * 
 * Features:
 * - High-performance MySQL connection pool with automatic recovery
 * - 15-second keep-alive ping for 24/7 connection persistence
 * - Full relational + JSON persistence for Accounts, Directory, Servers, Members, Posts, DMs, Friend Requests, System Store
 * - Seamless drop-in replacement for legacy file-based databases
 */

const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gusgon',
  waitForConnections: true,
  connectionLimit: 25,
  queueLimit: 0,
  charset: 'utf8mb4'
};

let pool = null;
let pingIntervalTimer = null;
let isInitialized = false;

function getPool() {
  if (!pool) {
    pool = mysql.createPool(DB_CONFIG);
  }
  return pool;
}

/**
 * 15 Saniyede bir MySQL'e ping atarak bağlantıyı sürekli aktif tutar
 */
function startKeepAlivePing() {
  if (pingIntervalTimer) {
    clearInterval(pingIntervalTimer);
  }

  pingIntervalTimer = setInterval(async () => {
    try {
      const p = getPool();
      const startTime = Date.now();
      await p.query('SELECT 1 AS ping');
      const duration = Date.now() - startTime;
      console.log(`[MySQL Keep-Alive] [${new Date().toLocaleTimeString()}] Ping basarili (${duration}ms) - Veritabani: gusgon aktif.`);
    } catch (err) {
      console.error(`[MySQL Keep-Alive Hata] [${new Date().toLocaleTimeString()}]:`, err.message);
      // Havuzda sorun olusmussa havuzu yenile
      try {
        if (pool) {
          await pool.end().catch(() => {});
          pool = null;
        }
        getPool();
      } catch (e) {}
    }
  }, 15000); // 15 saniyede bir

  // İlk pingi hemen gönder
  (async () => {
    try {
      await getPool().query('SELECT 1');
      console.log('[MySQL Keep-Alive] Ilk ping basarili, 15 saniyelik periyodik dongu baslatildi.');
    } catch (e) {
      console.warn('[MySQL Keep-Alive] Ilk ping uyarisi:', e.message);
    }
  })();
}

/**
 * Veritabanı tablolarını oluşturur
 */
async function createTables() {
  const p = getPool();

  // 1. ACCOUNTS TABLOSU
  await p.query(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      handle VARCHAR(100) NOT NULL UNIQUE,
      name VARCHAR(150) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      avatar LONGTEXT,
      banner LONGTEXT,
      bio TEXT,
      font_style VARCHAR(50) DEFAULT NULL,
      font_weight VARCHAR(50) DEFAULT NULL,
      name_color VARCHAR(50) DEFAULT NULL,
      name_effects VARCHAR(100) DEFAULT NULL,
      avatar_frame VARCHAR(255) DEFAULT NULL,
      member_theme VARCHAR(255) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_handle (handle),
      INDEX idx_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 2. USER DIRECTORY TABLOSU
  await p.query(`
    CREATE TABLE IF NOT EXISTS user_directory (
      handle VARCHAR(100) NOT NULL PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      avatar LONGTEXT,
      banner LONGTEXT,
      bio TEXT,
      followers INT DEFAULT 0,
      following INT DEFAULT 0,
      status_type VARCHAR(50) DEFAULT 'offline',
      status_text VARCHAR(255) DEFAULT '',
      data JSON DEFAULT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_handle (handle)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 3. SERVERS (INVITE REGISTRY) TABLOSU
  await p.query(`
    CREATE TABLE IF NOT EXISTS servers (
      invite_code VARCHAR(100) NOT NULL PRIMARY KEY,
      server_id VARCHAR(100) NOT NULL UNIQUE,
      server_name VARCHAR(150) NOT NULL,
      server_description TEXT,
      server_icon LONGTEXT,
      server_banner LONGTEXT,
      owner_handle VARCHAR(100) NOT NULL,
      owner_name VARCHAR(150),
      owner_avatar LONGTEXT,
      is_public TINYINT(1) DEFAULT 1,
      is_official TINYINT(1) DEFAULT 0,
      server_type VARCHAR(50) DEFAULT 'community',
      member_count INT DEFAULT 1,
      categories JSON DEFAULT NULL,
      roles JSON DEFAULT NULL,
      member_roles JSON DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_server_id (server_id),
      INDEX idx_is_public (is_public)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 4. SERVER MEMBERS TABLOSU
  await p.query(`
    CREATE TABLE IF NOT EXISTS server_members (
      id INT AUTO_INCREMENT PRIMARY KEY,
      server_code VARCHAR(100) NOT NULL,
      handle VARCHAR(100) NOT NULL,
      name VARCHAR(150),
      avatar LONGTEXT,
      font_style VARCHAR(50) DEFAULT NULL,
      font_weight VARCHAR(50) DEFAULT NULL,
      name_color VARCHAR(50) DEFAULT NULL,
      name_effects VARCHAR(100) DEFAULT NULL,
      avatar_frame VARCHAR(255) DEFAULT NULL,
      member_theme VARCHAR(255) DEFAULT NULL,
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uk_srv_member (server_code, handle),
      INDEX idx_server_code (server_code),
      INDEX idx_handle (handle)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 5. POSTS TABLOSU
  await p.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id VARCHAR(100) NOT NULL PRIMARY KEY,
      handle VARCHAR(100) NOT NULL,
      author VARCHAR(150) NOT NULL,
      avatar LONGTEXT,
      content LONGTEXT,
      timestamp VARCHAR(50) NOT NULL,
      server_channel_key VARCHAR(100) DEFAULT NULL,
      image LONGTEXT,
      code_snippet LONGTEXT,
      code_language VARCHAR(50) DEFAULT NULL,
      likes INT DEFAULT 0,
      liked_by JSON DEFAULT NULL,
      reactions JSON DEFAULT NULL,
      comments JSON DEFAULT NULL,
      invite JSON DEFAULT NULL,
      raw_data LONGTEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_timestamp (timestamp),
      INDEX idx_server_channel (server_channel_key),
      INDEX idx_handle (handle)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 6. DMS TABLOSU
  await p.query(`
    CREATE TABLE IF NOT EXISTS dms (
      id INT AUTO_INCREMENT PRIMARY KEY,
      dm_id VARCHAR(100) DEFAULT NULL,
      from_handle VARCHAR(100) NOT NULL,
      to_handle VARCHAR(100) NOT NULL,
      content LONGTEXT,
      media LONGTEXT,
      timestamp VARCHAR(50) NOT NULL,
      raw_data LONGTEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_from_to (from_handle, to_handle),
      INDEX idx_to_from (to_handle, from_handle),
      INDEX idx_timestamp (timestamp)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 7. FRIEND REQUESTS TABLOSU
  await p.query(`
    CREATE TABLE IF NOT EXISTS friend_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      target_handle VARCHAR(100) NOT NULL,
      from_handle VARCHAR(100) NOT NULL,
      from_name VARCHAR(150),
      from_avatar LONGTEXT,
      first_message TEXT,
      timestamp VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uk_friend_req (target_handle, from_handle),
      INDEX idx_target (target_handle)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 8. SYSTEM STORE (KEY-VALUE) TABLOSU
  await p.query(`
    CREATE TABLE IF NOT EXISTS system_store (
      store_key VARCHAR(255) NOT NULL PRIMARY KEY,
      store_value LONGTEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_store_key (store_key)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}

/**
 * Resmi ziorse.com topluluk sunucusunu ve varsayılan resmi hesabı garantiler
 */
async function ensureOfficialServerAndDefaults() {
  const p = getPool();

  const officialCode = 'ziorse';
  const officialId = 'srv-ziorse-official';

  // 1. Resmi sunucunun varlığını kontrol et
  const [existingServers] = await p.query('SELECT * FROM servers WHERE invite_code = ? OR server_id = ?', [officialCode, officialId]);

  const defaultCategories = [
    {
      id: 'cat-ziorse-genel',
      name: 'METİN KANALLARI',
      collapsed: false,
      channels: [
        { id: 'chat', name: 'chat', type: 'text', topic: 'Ziorse Sohbet Kanalı' }
      ]
    }
  ];

  if (existingServers.length === 0) {
    await p.query(`
      INSERT INTO servers (
        invite_code, server_id, server_name, server_description,
        server_icon, server_banner, owner_handle, owner_name,
        owner_avatar, is_public, is_official, server_type,
        member_count, categories, roles, member_roles
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 'community', 1, ?, '[]', '{}')
    `, [
      officialCode,
      officialId,
      'ziorse.com',
      'welcome.',
      '/uploads/srv_icon_1791843284247_wagh8.png',
      '/uploads/srv_banner_1791843284248_6kbj4.png',
      '@sa',
      'sa',
      'logo.png',
      JSON.stringify(defaultCategories)
    ]);
    console.log('[MySQL] Resmi ziorse.com sunucusu oluşturuldu.');
  }

  // 2. Resmi geliştirici/kurucu hesabı kontrol et
  const [existingAcc] = await p.query('SELECT * FROM accounts WHERE handle = ?', ['@sa']);
  if (existingAcc.length === 0) {
    await p.query(`
      INSERT INTO accounts (handle, name, email, password, avatar, banner, bio)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      '@sa',
      'sa',
      'sa@ziorse.com',
      '123456',
      'logo.png',
      '/uploads/srv_banner_1791843284248_6kbj4.png',
      'Ziorse Creator'
    ]);

    await p.query(`
      INSERT INTO user_directory (handle, name, avatar, banner, bio, followers, following, status_type, status_text)
      VALUES (?, ?, ?, ?, ?, 1, 0, 'online', 'welcome.')
      ON DUPLICATE KEY UPDATE name=VALUES(name), avatar=VALUES(avatar)
    `, [
      '@sa',
      'sa',
      'logo.png',
      '/uploads/srv_banner_1791843284248_6kbj4.png',
      'Ziorse Creator'
    ]);

    await p.query(`
      INSERT IGNORE INTO server_members (server_code, handle, name, avatar)
      VALUES (?, ?, ?, ?)
    `, [officialCode, '@sa', 'sa', 'logo.png']);
  }
}

/**
 * Veritabanını sıfırlar: Tüm tabloları temizler ve temiz şema ile başlatır
 */
async function resetDatabase() {
  const p = getPool();
  console.log('[MySQL] gusgon veritabanı sıfırlanıyor...');

  const tables = ['accounts', 'user_directory', 'servers', 'server_members', 'posts', 'dms', 'friend_requests', 'system_store'];
  await p.query('SET FOREIGN_KEY_CHECKS = 0');
  for (const table of tables) {
    await p.query(`DROP TABLE IF EXISTS ${table}`);
  }
  await p.query('SET FOREIGN_KEY_CHECKS = 1');

  await createTables();
  await ensureOfficialServerAndDefaults();
  console.log('[MySQL] gusgon veritabanı başarıyla sıfırlandı ve resmi yapılar kuruldu!');
}

/**
 * Veritabanını başlatır ve keep-alive ping'i açar
 */
async function initDatabase(options = {}) {
  if (options.reset) {
    await resetDatabase();
  } else {
    await createTables();
    await ensureOfficialServerAndDefaults();
  }

  startKeepAlivePing();
  isInitialized = true;
  console.log('[MySQL] gusgon veritabanı motoru hazır ve çalışıyor.');
  return pool;
}

// ─────────────────────────────────────────────────────────────
// ACCOUNTS CRUD
// ─────────────────────────────────────────────────────────────
async function getAllAccounts() {
  const [rows] = await getPool().query('SELECT * FROM accounts ORDER BY id ASC');
  return rows.map(r => ({
    id: r.id,
    handle: r.handle,
    name: r.name,
    email: r.email,
    password: r.password,
    avatar: r.avatar || '',
    banner: r.banner || '#999999',
    bio: r.bio || '',
    fontStyle: r.font_style,
    fontWeight: r.font_weight,
    nameColor: r.name_color,
    nameEffects: r.name_effects,
    avatarFrame: r.avatar_frame,
    memberTheme: r.member_theme
  }));
}

async function getAccountByLogin(identifier) {
  if (!identifier) return null;
  const clean = identifier.trim().toLowerCase();
  const withAt = clean.startsWith('@') ? clean : '@' + clean;
  const withoutAt = clean.replace('@', '');

  const [rows] = await getPool().query(
    'SELECT * FROM accounts WHERE LOWER(email) = ? OR LOWER(handle) = ? OR LOWER(handle) = ? LIMIT 1',
    [clean, withAt, withoutAt]
  );
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    handle: r.handle,
    name: r.name,
    email: r.email,
    password: r.password,
    avatar: r.avatar || '',
    banner: r.banner || '#999999',
    bio: r.bio || '',
    fontStyle: r.font_style,
    fontWeight: r.font_weight,
    nameColor: r.name_color,
    nameEffects: r.name_effects,
    avatarFrame: r.avatar_frame,
    memberTheme: r.member_theme
  };
}

async function createAccount(acc) {
  const p = getPool();
  const handle = acc.handle.startsWith('@') ? acc.handle : '@' + acc.handle;
  const email = acc.email.toLowerCase().trim();

  const [res] = await p.query(`
    INSERT INTO accounts (
      handle, name, email, password, avatar, banner, bio,
      font_style, font_weight, name_color, name_effects, avatar_frame, member_theme
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    handle,
    acc.name || handle.replace('@', ''),
    email,
    String(acc.password),
    acc.avatar || '',
    acc.banner || '#999999',
    acc.bio || '',
    acc.fontStyle || null,
    acc.fontWeight || null,
    acc.nameColor || null,
    acc.nameEffects || null,
    acc.avatarFrame || null,
    acc.memberTheme || null
  ]);

  // user_directory tablosuna da ekle
  await upsertUserProfile(handle, {
    name: acc.name || handle.replace('@', ''),
    handle,
    avatar: acc.avatar || '',
    banner: acc.banner || '#999999',
    bio: acc.bio || '',
    followers: 0,
    following: 0,
    status: { type: 'online', text: '' },
    fontStyle: acc.fontStyle,
    fontWeight: acc.fontWeight,
    nameColor: acc.nameColor,
    nameEffects: acc.nameEffects,
    avatarFrame: acc.avatarFrame,
    memberTheme: acc.memberTheme
  });

  // Resmi sunucuya otomatik üye yap
  await addServerMember('ziorse', {
    handle,
    name: acc.name || handle.replace('@', ''),
    avatar: acc.avatar || ''
  });

  return { id: res.insertId, ...acc, handle, email };
}

async function updateAccount(handle, data) {
  const p = getPool();
  const cleanH = handle.startsWith('@') ? handle : '@' + handle;

  const fields = [];
  const params = [];

  if (data.name !== undefined) { fields.push('name = ?'); params.push(data.name); }
  if (data.email !== undefined) { fields.push('email = ?'); params.push(data.email.toLowerCase().trim()); }
  if (data.password !== undefined) { fields.push('password = ?'); params.push(String(data.password)); }
  if (data.avatar !== undefined) { fields.push('avatar = ?'); params.push(data.avatar); }
  if (data.banner !== undefined) { fields.push('banner = ?'); params.push(data.banner); }
  if (data.bio !== undefined) { fields.push('bio = ?'); params.push(data.bio); }
  if (data.fontStyle !== undefined) { fields.push('font_style = ?'); params.push(data.fontStyle); }
  if (data.fontWeight !== undefined) { fields.push('font_weight = ?'); params.push(data.fontWeight); }
  if (data.nameColor !== undefined) { fields.push('name_color = ?'); params.push(data.nameColor); }
  if (data.nameEffects !== undefined) { fields.push('name_effects = ?'); params.push(data.nameEffects); }
  if (data.avatarFrame !== undefined) { fields.push('avatar_frame = ?'); params.push(data.avatarFrame); }
  if (data.memberTheme !== undefined) { fields.push('member_theme = ?'); params.push(data.memberTheme); }

  if (fields.length > 0) {
    params.push(cleanH);
    await p.query(`UPDATE accounts SET ${fields.join(', ')} WHERE LOWER(handle) = LOWER(?)`, params);
  }
}

// ─────────────────────────────────────────────────────────────
// USER DIRECTORY CRUD
// ─────────────────────────────────────────────────────────────
async function getUserDirectory() {
  const [rows] = await getPool().query('SELECT * FROM user_directory');
  const dir = {};
  rows.forEach(r => {
    let parsedData = {};
    if (r.data) {
      try {
        parsedData = typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
      } catch (e) {}
    }
    dir[r.handle] = {
      name: r.name,
      handle: r.handle,
      avatar: r.avatar || '',
      banner: r.banner || '#999999',
      bio: r.bio || '',
      followers: r.followers || 0,
      following: r.following || 0,
      status: {
        type: r.status_type || 'offline',
        text: r.status_text || ''
      },
      ...parsedData
    };
  });
  return dir;
}

async function upsertUserProfile(handle, data) {
  const p = getPool();
  const h = handle.startsWith('@') ? handle : '@' + handle;
  const name = data.name || h.replace('@', '');
  const avatar = data.avatar || '';
  const banner = data.banner || '#999999';
  const bio = data.bio || '';
  const followers = typeof data.followers === 'number' ? data.followers : 0;
  const following = typeof data.following === 'number' ? data.following : 0;
  const statusType = (data.status && data.status.type) || data.statusType || 'offline';
  const statusText = (data.status && data.status.text) || data.statusText || '';

  // Ekstra alanları data JSON'ında sakla
  const extra = { ...data };
  delete extra.name;
  delete extra.handle;
  delete extra.avatar;
  delete extra.banner;
  delete extra.bio;
  delete extra.followers;
  delete extra.following;
  delete extra.status;

  await p.query(`
    INSERT INTO user_directory (
      handle, name, avatar, banner, bio, followers, following, status_type, status_text, data
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      avatar = VALUES(avatar),
      banner = VALUES(banner),
      bio = VALUES(bio),
      followers = VALUES(followers),
      following = VALUES(following),
      status_type = VALUES(status_type),
      status_text = VALUES(status_text),
      data = VALUES(data)
  `, [
    h, name, avatar, banner, bio, followers, following, statusType, statusText,
    JSON.stringify(extra)
  ]);
}

// ─────────────────────────────────────────────────────────────
// SERVERS (INVITE REGISTRY) CRUD
// ─────────────────────────────────────────────────────────────
async function getAllServers() {
  const [rows] = await getPool().query('SELECT * FROM servers');
  const registry = {};
  rows.forEach(r => {
    let cats = [];
    let roles = [];
    let memberRoles = {};
    try { cats = typeof r.categories === 'string' ? JSON.parse(r.categories) : (r.categories || []); } catch (e) {}
    try { roles = typeof r.roles === 'string' ? JSON.parse(r.roles) : (r.roles || []); } catch (e) {}
    try { memberRoles = typeof r.member_roles === 'string' ? JSON.parse(r.member_roles) : (r.member_roles || {}); } catch (e) {}

    registry[r.invite_code] = {
      inviteCode: r.invite_code,
      serverId: r.server_id,
      serverName: r.server_name,
      serverDescription: r.server_description || '',
      description: r.server_description || '',
      serverIcon: r.server_icon || '',
      serverBanner: r.server_banner || '',
      ownerHandle: r.owner_handle,
      ownerName: r.owner_name,
      ownerAvatar: r.owner_avatar,
      isPublic: r.is_public === 1,
      isOfficial: r.is_official === 1,
      serverType: r.server_type || 'community',
      memberCount: r.member_count || 1,
      categories: cats,
      roles: roles,
      memberRoles: memberRoles
    };
  });
  return registry;
}

async function upsertServer(code, info) {
  const p = getPool();
  const inviteCode = code || info.inviteCode || info.serverId;
  const serverId = info.serverId || inviteCode;
  const serverName = info.serverName || info.name || 'Sunucu';
  const desc = info.serverDescription || info.description || '';
  const icon = info.serverIcon || info.icon || '';
  const banner = info.serverBanner || info.banner || '';
  const ownerH = info.ownerHandle || '';
  const ownerN = info.ownerName || '';
  const ownerA = info.ownerAvatar || '';
  const isPublic = info.isPublic !== false ? 1 : 0;
  const isOfficial = info.isOfficial === true ? 1 : 0;
  const type = info.serverType || 'community';
  const count = info.memberCount || 1;
  const cats = JSON.stringify(info.categories || []);
  const roles = JSON.stringify(info.roles || []);
  const mRoles = JSON.stringify(info.memberRoles || {});

  await p.query(`
    INSERT INTO servers (
      invite_code, server_id, server_name, server_description, server_icon, server_banner,
      owner_handle, owner_name, owner_avatar, is_public, is_official, server_type,
      member_count, categories, roles, member_roles
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      server_name = VALUES(server_name),
      server_description = VALUES(server_description),
      server_icon = VALUES(server_icon),
      server_banner = VALUES(server_banner),
      owner_handle = VALUES(owner_handle),
      owner_name = VALUES(owner_name),
      owner_avatar = VALUES(owner_avatar),
      is_public = VALUES(is_public),
      is_official = VALUES(is_official),
      server_type = VALUES(server_type),
      member_count = VALUES(member_count),
      categories = VALUES(categories),
      roles = VALUES(roles),
      member_roles = VALUES(member_roles)
  `, [
    inviteCode, serverId, serverName, desc, icon, banner,
    ownerH, ownerN, ownerA, isPublic, isOfficial, type,
    count, cats, roles, mRoles
  ]);
}

// ─────────────────────────────────────────────────────────────
// SERVER MEMBERS CRUD
// ─────────────────────────────────────────────────────────────
async function getAllServerMembers() {
  const [rows] = await getPool().query('SELECT * FROM server_members ORDER BY id ASC');
  const map = {};
  rows.forEach(r => {
    if (!map[r.server_code]) map[r.server_code] = [];
    map[r.server_code].push({
      handle: r.handle,
      name: r.name || r.handle.replace('@', ''),
      avatar: r.avatar || '',
      fontStyle: r.font_style,
      fontWeight: r.font_weight,
      nameColor: r.name_color,
      nameEffects: r.name_effects,
      avatarFrame: r.avatar_frame,
      memberTheme: r.member_theme
    });
  });
  return map;
}

async function addServerMember(serverCode, member) {
  if (!serverCode || !member || !member.handle) return;
  const p = getPool();
  const handle = member.handle.startsWith('@') ? member.handle : '@' + member.handle;
  const name = member.name || handle.replace('@', '');
  const avatar = member.avatar || '';

  await p.query(`
    INSERT INTO server_members (
      server_code, handle, name, avatar, font_style, font_weight, name_color, name_effects, avatar_frame, member_theme
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      avatar = VALUES(avatar),
      font_style = VALUES(font_style),
      font_weight = VALUES(font_weight),
      name_color = VALUES(name_color),
      name_effects = VALUES(name_effects),
      avatar_frame = VALUES(avatar_frame),
      member_theme = VALUES(member_theme)
  `, [
    serverCode, handle, name, avatar,
    member.fontStyle || null,
    member.fontWeight || null,
    member.nameColor || null,
    member.nameEffects || null,
    member.avatarFrame || null,
    member.memberTheme || null
  ]);

  // Üye sayısını güncelle
  await p.query(`
    UPDATE servers SET member_count = (
      SELECT COUNT(*) FROM server_members WHERE server_code = ?
    ) WHERE invite_code = ? OR server_id = ?
  `, [serverCode, serverCode, serverCode]);
}

async function removeServerMember(serverCode, handle) {
  const p = getPool();
  const cleanH = handle.startsWith('@') ? handle : '@' + handle;
  await p.query('DELETE FROM server_members WHERE server_code = ? AND LOWER(handle) = LOWER(?)', [serverCode, cleanH]);
  await p.query(`
    UPDATE servers SET member_count = (
      SELECT COUNT(*) FROM server_members WHERE server_code = ?
    ) WHERE invite_code = ? OR server_id = ?
  `, [serverCode, serverCode, serverCode]);
}

// ─────────────────────────────────────────────────────────────
// POSTS CRUD
// ─────────────────────────────────────────────────────────────
async function getAllPosts() {
  const [rows] = await getPool().query('SELECT * FROM posts ORDER BY timestamp DESC LIMIT 500');
  return rows.map(r => {
    if (r.raw_data) {
      try {
        return JSON.parse(r.raw_data);
      } catch (e) {}
    }
    let likedBy = [];
    let reactions = {};
    let comments = [];
    let invite = null;
    try { likedBy = typeof r.liked_by === 'string' ? JSON.parse(r.liked_by) : (r.liked_by || []); } catch (e) {}
    try { reactions = typeof r.reactions === 'string' ? JSON.parse(r.reactions) : (r.reactions || {}); } catch (e) {}
    try { comments = typeof r.comments === 'string' ? JSON.parse(r.comments) : (r.comments || []); } catch (e) {}
    try { invite = typeof r.invite === 'string' ? JSON.parse(r.invite) : (r.invite || null); } catch (e) {}

    return {
      id: r.id,
      handle: r.handle,
      author: r.author,
      avatar: r.avatar,
      content: r.content,
      timestamp: r.timestamp,
      serverChannelKey: r.server_channel_key,
      image: r.image,
      codeSnippet: r.code_snippet,
      codeLanguage: r.code_language,
      likes: r.likes || 0,
      likedBy: likedBy,
      reactions: reactions,
      comments: comments,
      invite: invite
    };
  });
}

async function savePost(post) {
  if (!post || !post.id) return;
  const p = getPool();
  const raw = JSON.stringify(post);

  await p.query(`
    INSERT INTO posts (
      id, handle, author, avatar, content, timestamp,
      server_channel_key, image, code_snippet, code_language,
      likes, liked_by, reactions, comments, invite, raw_data
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      handle = VALUES(handle),
      author = VALUES(author),
      avatar = VALUES(avatar),
      content = VALUES(content),
      timestamp = VALUES(timestamp),
      server_channel_key = VALUES(server_channel_key),
      image = VALUES(image),
      code_snippet = VALUES(code_snippet),
      code_language = VALUES(code_language),
      likes = VALUES(likes),
      liked_by = VALUES(liked_by),
      reactions = VALUES(reactions),
      comments = VALUES(comments),
      invite = VALUES(invite),
      raw_data = VALUES(raw_data)
  `, [
    String(post.id),
    post.handle || '',
    post.author || post.name || '',
    post.avatar || '',
    post.content || '',
    post.timestamp || new Date().toISOString(),
    post.serverChannelKey || null,
    post.image || null,
    post.codeSnippet || null,
    post.codeLanguage || null,
    post.likes || 0,
    JSON.stringify(post.likedBy || []),
    JSON.stringify(post.reactions || {}),
    JSON.stringify(post.comments || []),
    post.invite ? JSON.stringify(post.invite) : null,
    raw
  ]);
}

async function deletePost(postId) {
  if (!postId) return;
  await getPool().query('DELETE FROM posts WHERE id = ?', [String(postId)]);
}

// ─────────────────────────────────────────────────────────────
// DMS CRUD
// ─────────────────────────────────────────────────────────────
async function saveDM(dm) {
  if (!dm) return;
  const p = getPool();
  const raw = JSON.stringify(dm);
  await p.query(`
    INSERT INTO dms (dm_id, from_handle, to_handle, content, media, timestamp, raw_data)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    dm.id || dm.dmId || null,
    dm.fromHandle || dm.from || '',
    dm.toHandle || dm.to || '',
    dm.content || dm.text || '',
    dm.media || dm.image || null,
    dm.timestamp || new Date().toISOString(),
    raw
  ]);
}

async function getDMsBetween(h1, h2) {
  const p = getPool();
  const clean1 = (h1 || '').toLowerCase().replace('@', '');
  const clean2 = (h2 || '').toLowerCase().replace('@', '');

  const [rows] = await p.query(`
    SELECT * FROM dms
    WHERE (LOWER(REPLACE(from_handle, '@', '')) = ? AND LOWER(REPLACE(to_handle, '@', '')) = ?)
       OR (LOWER(REPLACE(from_handle, '@', '')) = ? AND LOWER(REPLACE(to_handle, '@', '')) = ?)
    ORDER BY timestamp ASC
  `, [clean1, clean2, clean2, clean1]);

  return rows.map(r => {
    if (r.raw_data) {
      try { return JSON.parse(r.raw_data); } catch (e) {}
    }
    return {
      id: r.id,
      fromHandle: r.from_handle,
      toHandle: r.to_handle,
      content: r.content,
      media: r.media,
      timestamp: r.timestamp
    };
  });
}

// ─────────────────────────────────────────────────────────────
// FRIEND REQUESTS CRUD
// ─────────────────────────────────────────────────────────────
async function getAllFriendRequests() {
  const [rows] = await getPool().query('SELECT * FROM friend_requests ORDER BY id DESC');
  const map = {};
  rows.forEach(r => {
    if (!map[r.target_handle]) map[r.target_handle] = [];
    map[r.target_handle].push({
      handle: r.from_handle,
      name: r.from_name,
      avatar: r.from_avatar,
      firstMessage: r.first_message,
      timestamp: r.timestamp
    });
  });
  return map;
}

async function saveFriendRequest(targetHandle, fromUser) {
  const p = getPool();
  const target = targetHandle.startsWith('@') ? targetHandle : '@' + targetHandle;
  const from = fromUser.handle.startsWith('@') ? fromUser.handle : '@' + fromUser.handle;

  await p.query(`
    INSERT INTO friend_requests (target_handle, from_handle, from_name, from_avatar, first_message, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      from_name = VALUES(from_name),
      from_avatar = VALUES(from_avatar),
      first_message = VALUES(first_message),
      timestamp = VALUES(timestamp)
  `, [
    target, from, fromUser.name || '', fromUser.avatar || '',
    fromUser.firstMessage || null,
    fromUser.timestamp || new Date().toISOString()
  ]);
}

async function deleteFriendRequest(targetHandle, fromHandle) {
  const p = getPool();
  const target = targetHandle.startsWith('@') ? targetHandle : '@' + targetHandle;
  const from = fromHandle.startsWith('@') ? fromHandle : '@' + fromHandle;
  await p.query('DELETE FROM friend_requests WHERE LOWER(target_handle) = LOWER(?) AND LOWER(from_handle) = LOWER(?)', [target, from]);
}

// ─────────────────────────────────────────────────────────────
// SYSTEM STORE (KEY-VALUE) CRUD
// ─────────────────────────────────────────────────────────────
async function getStoreValue(key) {
  const [rows] = await getPool().query('SELECT store_value FROM system_store WHERE store_key = ?', [key]);
  if (rows.length === 0) return null;
  const val = rows[0].store_value;
  try {
    return JSON.parse(val);
  } catch (e) {
    return val;
  }
}

async function setStoreValue(key, val) {
  const p = getPool();
  if (val === null || val === undefined) {
    return deleteStoreValue(key);
  }
  const strVal = typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val);
  await p.query(`
    INSERT INTO system_store (store_key, store_value)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE store_value = VALUES(store_value)
  `, [key, strVal]);
}

async function deleteStoreValue(key) {
  await getPool().query('DELETE FROM system_store WHERE store_key = ?', [key]);
}

async function getAllStoreValues() {
  const [rows] = await getPool().query('SELECT * FROM system_store');
  const store = {};
  rows.forEach(r => {
    try {
      store[r.store_key] = JSON.parse(r.store_value);
    } catch (e) {
      store[r.store_key] = r.store_value;
    }
  });
  return store;
}

module.exports = {
  getPool,
  initDatabase,
  resetDatabase,
  startKeepAlivePing,

  // Accounts
  getAllAccounts,
  getAccountByLogin,
  createAccount,
  updateAccount,

  // User Directory
  getUserDirectory,
  upsertUserProfile,

  // Servers
  getAllServers,
  upsertServer,

  // Members
  getAllServerMembers,
  addServerMember,
  removeServerMember,

  // Posts
  getAllPosts,
  savePost,
  deletePost,

  // DMs
  saveDM,
  getDMsBetween,

  // Friend Requests
  getAllFriendRequests,
  saveFriendRequest,
  deleteFriendRequest,

  // System Store
  getStoreValue,
  setStoreValue,
  deleteStoreValue,
  getAllStoreValues
};
