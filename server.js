const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
  transports: ['websocket', 'polling'],
  maxHttpBufferSize: 50 * 1024 * 1024 // 50MB for image/voice data sync
});

const JWT_SECRET = 'ziorse_jwt_secret_2026_dev';
const SALT_ROUNDS = 10;

// ── UPLOAD SETUP ──────────────────────────────────────────────
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.bin';
    cb(null, `ziorse_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'src')));
app.use('/uploads', express.static(uploadsDir));
app.use('/sounds', express.static(path.join(__dirname, 'sounds')));

const framesDir = path.join(__dirname, 'src', 'assets', 'avatar-frames');
const rootFramesDir = path.join(__dirname, 'assets', 'avatar-frames');
if (!fs.existsSync(framesDir)) fs.mkdirSync(framesDir, { recursive: true });
if (!fs.existsSync(rootFramesDir)) fs.mkdirSync(rootFramesDir, { recursive: true });

function syncFramesDirs() {
  try {
    if (fs.existsSync(rootFramesDir)) {
      fs.readdirSync(rootFramesDir).filter(f => f.toLowerCase().endsWith('.png')).forEach(file => {
        const dest = path.join(framesDir, file);
        if (!fs.existsSync(dest)) fs.copyFileSync(path.join(rootFramesDir, file), dest);
      });
    }
    if (fs.existsSync(framesDir)) {
      fs.readdirSync(framesDir).filter(f => f.toLowerCase().endsWith('.png')).forEach(file => {
        const dest = path.join(rootFramesDir, file);
        if (!fs.existsSync(dest)) fs.copyFileSync(path.join(framesDir, file), dest);
      });
    }
  } catch (e) { }
}
syncFramesDirs();

const zlib = require('zlib');

function getFrameHoleScale(filePath) {
  try {
    const buf = fs.readFileSync(filePath);
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    let offset = 8;
    const idatChunks = [];
    while (offset < buf.length) {
      const length = buf.readUInt32BE(offset);
      const type = buf.toString('ascii', offset + 4, offset + 8);
      if (type === 'IDAT') idatChunks.push(buf.slice(offset + 8, offset + 8 + length));
      offset += 12 + length;
    }
    const decompressed = zlib.inflateSync(Buffer.concat(idatChunks));
    const stride = width * 4 + 1;
    const cx = Math.floor(width / 2);
    const cy = Math.floor(height / 2);
    const maxR = Math.min(cx, cy) - 2;
    let innerR = 30;

    for (let r = 20; r <= maxR; r += 2) {
      let opaqueCount = 0;
      const numSamples = 60;
      for (let i = 0; i < numSamples; i++) {
        const angle = (i * 2 * Math.PI) / numSamples;
        const x = Math.round(cx + r * Math.cos(angle));
        const y = Math.round(cy + r * Math.sin(angle));
        if (x >= 0 && x < width && y >= 0 && y < height) {
          const a = decompressed[y * stride + 1 + x * 4 + 3];
          if (a > 60) opaqueCount++;
        }
      }
      if (opaqueCount / numSamples >= 0.20) {
        innerR = r;
        break;
      }
    }

    const holeDiameter = innerR * 2;
    const avgDim = (width + height) / 2;
    if (holeDiameter > 20) {
      const scale = Math.round((avgDim / holeDiameter) * 80);
      return Math.min(Math.max(scale, 115), 132);
    }
  } catch (e) { }
  return 126;
}

app.use('/assets/avatar-frames', express.static(framesDir));
app.use('/assets/avatar-frames', express.static(rootFramesDir));

// API: Avatar Frames listing
app.get('/api/avatar-frames', (req, res) => {
  try {
    syncFramesDirs();
    const list = new Set();
    [framesDir, rootFramesDir].forEach(dir => {
      if (fs.existsSync(dir)) {
        fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith('.png')).forEach(f => list.add(f));
      }
    });
    const result = Array.from(list).map(file => {
      const fPath = fs.existsSync(path.join(framesDir, file)) ? path.join(framesDir, file) : path.join(rootFramesDir, file);
      const scale = getFrameHoleScale(fPath);
      return {
        id: file,
        name: path.parse(file).name.replace(/[-_]/g, ' '),
        url: `assets/avatar-frames/${file}`,
        filename: file,
        scale: scale
      };
    });
    res.json({ frames: result });
  } catch (e) {
    res.json({ frames: [] });
  }
});

// ── MEMBER ITEM THEMES (.user-member-item themes) ─────────────
const memberThemesDir = path.join(__dirname, 'src', 'assets', 'member-themes');
const rootMemberThemesDir = path.join(__dirname, 'assets', 'member-themes');

function syncMemberThemesDirs() {
  try {
    if (!fs.existsSync(memberThemesDir)) fs.mkdirSync(memberThemesDir, { recursive: true });
    if (!fs.existsSync(rootMemberThemesDir)) fs.mkdirSync(rootMemberThemesDir, { recursive: true });
    const allowed = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
    const isThemeFile = f => allowed.includes(path.extname(f).toLowerCase());
    if (fs.existsSync(rootMemberThemesDir)) {
      fs.readdirSync(rootMemberThemesDir).filter(isThemeFile).forEach(file => {
        const dest = path.join(memberThemesDir, file);
        if (!fs.existsSync(dest)) fs.copyFileSync(path.join(rootMemberThemesDir, file), dest);
      });
    }
    if (fs.existsSync(memberThemesDir)) {
      fs.readdirSync(memberThemesDir).filter(isThemeFile).forEach(file => {
        const dest = path.join(rootMemberThemesDir, file);
        if (!fs.existsSync(dest)) fs.copyFileSync(path.join(memberThemesDir, file), dest);
      });
    }
  } catch (e) { }
}
syncMemberThemesDirs();

app.use('/assets/member-themes', express.static(memberThemesDir));
app.use('/assets/member-themes', express.static(rootMemberThemesDir));

app.get('/api/member-themes', (req, res) => {
  try {
    syncMemberThemesDirs();
    const list = new Set();
    const allowed = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
    [memberThemesDir, rootMemberThemesDir].forEach(dir => {
      if (fs.existsSync(dir)) {
        fs.readdirSync(dir).filter(f => allowed.includes(path.extname(f).toLowerCase())).forEach(f => list.add(f));
      }
    });
    const result = Array.from(list).map(file => {
      const ext = path.extname(file).toLowerCase();
      return {
        id: file,
        name: path.parse(file).name.replace(/[-_]/g, ' '),
        url: `assets/member-themes/${file}`,
        filename: file,
        isGif: ext === '.gif'
      };
    });
    res.json({ themes: result });
  } catch (e) {
    res.json({ themes: [] });
  }
});

app.post('/api/open-member-themes-folder', (req, res) => {
  try {
    syncMemberThemesDirs();
    const { exec } = require('child_process');
    if (process.platform === 'win32') {
      exec(`start "" "${memberThemesDir}"`);
    } else if (process.platform === 'darwin') {
      exec(`open "${memberThemesDir}"`);
    } else {
      exec(`xdg-open "${memberThemesDir}"`);
    }
    res.json({ success: true, path: memberThemesDir });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Range header error protection (avoids console noise for media streams)
app.use((err, req, res, next) => {
  if (err && (err.name === 'RangeNotSatisfiableError' || err.status === 416)) {
    return res.status(416).end();
  }
  next(err);
});

// ── MYSQL DATABASE ENGINE & PERSISTENCE (gusgon) ─────────────
const mysqlDb = require('./mysql-db');

let serverPosts = [];
let globalInviteRegistry = {};
let globalFriendRequests = {}; // targetHandle -> array of requests
let globalServerMembers = {};  // inviteCode -> array of member objects
let globalVoiceRooms = {};     // channelId -> array of { socketId, handle, name, avatar, isSpeaking, isMuted, isDeafened }
let globalAccounts = [];
let globalUserDirectory = {};

function saveServerMembersTxt(code) {
  if (!code || !globalServerMembers[code]) return;
  try {
    if (Array.isArray(globalServerMembers[code])) {
      globalServerMembers[code].forEach(m => {
        mysqlDb.addServerMember(code, m).catch(() => {});
      });
    }
  } catch (e) {
    console.error('[Ziorse MySQL] Server members kaydetme hatasi:', e);
  }
}

function saveInviteRegistryTxt() {
  // Sunucular oluşturulduklarında veya güncellendiklerinde doğrudan MySQL'e yazılır.
  // Burada tüm kayıtların kör döngü ile yeniden yazılması MySQL'den silinen sunucuları diriltmemesi için engellenmiştir.
}

async function loadSyncDb() {
  try {
    // MySQL veritabanını başlat (gusgon) ve 15 saniyede bir ping at
    await mysqlDb.initDatabase();

    // Veritabanından silinmiş tüm kullanıcıları otomatik tespit edip diğer tablolardan temizle
    await mysqlDb.reconcileAndPruneDeletedAccounts();

    const accs = await mysqlDb.getAllAccounts();
    globalAccounts = Array.isArray(accs) ? accs : [];

    const uDir = await mysqlDb.getUserDirectory();
    globalUserDirectory = (uDir && typeof uDir === 'object') ? uDir : {};

    const srvs = await mysqlDb.getAllServers();
    globalInviteRegistry = (srvs && typeof srvs === 'object') ? srvs : {};

    const mems = await mysqlDb.getAllServerMembers();
    globalServerMembers = (mems && typeof mems === 'object') ? mems : {};

    // Yalnızca MySQL accounts tablosunda kayıtlı gerçek hesapları üye ve dizin listesinde tut
    const validHandles = new Set(globalAccounts.map(a => (a.handle || '').toLowerCase()));
    Object.keys(globalServerMembers).forEach(code => {
      globalServerMembers[code] = globalServerMembers[code].filter(m => m && m.handle && validHandles.has(m.handle.toLowerCase()));
    });
    Object.keys(globalUserDirectory).forEach(h => {
      if (!validHandles.has(h.toLowerCase())) {
        delete globalUserDirectory[h];
      }
    });

    const reqs = await mysqlDb.getAllFriendRequests();
    globalFriendRequests = (reqs && typeof reqs === 'object') ? reqs : {};

    const psts = await mysqlDb.getAllPosts();
    serverPosts = Array.isArray(psts) ? psts : [];

    ensureOfficialServerBackend();
    console.log(`[Ziorse Server MySQL (gusgon)] Başarıyla yüklendi: ${globalAccounts.length} hesap, ${Object.keys(globalUserDirectory).length} kullanıcı dizini, ${Object.keys(globalInviteRegistry).length} sunucu, ${serverPosts.length} gönderi.`);
  } catch (err) {
    console.error('[Ziorse Server MySQL] DB Yükleme Hatası:', err);
  }
}

function extractDataUrlToUpload(dataUrl, prefix = 'avatar') {
  // Veritabanında atılan tüm görseller, videolar ve mesajlar kod (base64 data URL) olarak tutulur
  return dataUrl;
}

let saveDbTimer = null;
function saveSyncDb() {
  if (saveDbTimer) clearTimeout(saveDbTimer);
  saveDbTimer = setTimeout(async () => {
    saveDbTimer = null;
    try {
      // 1. User Directory senkronizasyonu (sadece mevcut gerçek hesaplar)
      const validHandles = new Set(globalAccounts.map(a => (a.handle || '').toLowerCase()));
      for (const [h, prof] of Object.entries(globalUserDirectory)) {
        if (validHandles.has(h.toLowerCase())) {
          mysqlDb.upsertUserProfile(h, prof).catch(() => {});
        }
      }
      // 2. Arkadaşlık istekleri
      for (const [th, reqs] of Object.entries(globalFriendRequests)) {
        if (Array.isArray(reqs)) {
          reqs.forEach(r => mysqlDb.saveFriendRequest(th, r).catch(() => {}));
        }
      }
    } catch (err) {
      console.error('[Ziorse MySQL] DB Kayıt Hatası:', err);
    }
  }, 150);
}

loadSyncDb();

// ── OTOMATİK VERİTABANI İZLEYİCİ & CANLI SENKRONİZASYON (500ms) ────────
// Veritabanından (phpMyAdmin / MySQL CLI) bir hesap, sunucu veya gönderi silindiğinde tüm sistemden anında temizler
let isWatcherRunning = false;
setInterval(async () => {
  if (isWatcherRunning) return;
  isWatcherRunning = true;
  try {
    // 1. HESAP İZLEYİCİSİ
    const accs = await mysqlDb.getAllAccounts();
    const currentHandles = new Set(accs.map(a => (a.handle || '').toLowerCase()));
    const knownHandles = new Set(globalAccounts.map(a => (a.handle || '').toLowerCase()));

    let accountsChanged = false;
    if (currentHandles.size !== knownHandles.size) {
      accountsChanged = true;
    } else {
      for (const h of knownHandles) {
        if (!currentHandles.has(h)) { accountsChanged = true; break; }
      }
    }

    if (accountsChanged) {
      console.log('[Ziorse MySQL Watcher] Hesap silinmesi/eklenmesi algılandı. Otomatik arındırma ve senkronizasyon yapılıyor...');
      const deletedHandles = [...knownHandles].filter(h => !currentHandles.has(h));
      deletedHandles.forEach(dh => {
        const cleanDh = dh.replace('@', '');
        activeOnlineHandles.delete(cleanDh);
        io.to(cleanDh).emit('force-logout', { handle: dh, reason: 'account_deleted' });
        io.to(dh).emit('force-logout', { handle: dh, reason: 'account_deleted' });
        io.emit('account-deleted', { handle: dh });
      });

      await loadSyncDb();
      io.emit('accounts-updated', publicAccounts());
      io.emit('user-directory-updated', globalUserDirectory);
      io.emit('server-members-updated', globalServerMembers);
      io.emit('online-users-updated', Array.from(activeOnlineHandles));
      io.emit('invite-registry-updated', globalInviteRegistry);
      io.emit('public-servers-updated', globalInviteRegistry);
    }

    // 2. SUNUCU İZLEYİCİSİ (MySQL servers tablosundan doğrudan sunucu silinmesi/eklenmesi)
    const dbServers = await mysqlDb.getAllServers();
    const currentServerCodes = new Set(Object.keys(dbServers));
    const knownServerCodes = new Set(Object.keys(globalInviteRegistry));

    let serversChanged = false;
    const deletedServerCodes = [];
    for (const code of knownServerCodes) {
      if (code === 'ziorse' || code === 'srv-ziorse-official') continue;
      if (!currentServerCodes.has(code)) {
        serversChanged = true;
        deletedServerCodes.push(code);
      }
    }

    // MySQL'de yeni eklenen sunucuları da algıla
    for (const code of currentServerCodes) {
      if (!knownServerCodes.has(code)) {
        serversChanged = true;
      }
    }

    if (serversChanged) {
      console.log('[Ziorse MySQL Watcher] Sunucu değişikliği algılandı. Silinenler:', deletedServerCodes);
      for (const code of deletedServerCodes) {
        const srvId = globalInviteRegistry[code]?.serverId || code;
        delete globalInviteRegistry[code];
        if (srvId) delete globalInviteRegistry[srvId];
        delete globalServerMembers[code];
        if (srvId) delete globalServerMembers[srvId];

        io.emit('server-deleted', { inviteCode: code, serverId: srvId });
      }

      globalInviteRegistry = dbServers;
      ensureOfficialServerBackend();

      io.emit('invite-registry-updated', globalInviteRegistry);
      io.emit('public-servers-updated', globalInviteRegistry);
      io.emit('server-members-updated', globalServerMembers);
    }

    // 3. GÖNDERİ İZLEYİCİSİ (MySQL posts tablosundan doğrudan gönderi silinmesi)
    const [dbPostRows] = await mysqlDb.getPool().query('SELECT id FROM posts');
    const currentPostIds = new Set(dbPostRows.map(r => r.id));
    const deletedPostIds = [];
    serverPosts.forEach(p => {
      if (p && p.id && !currentPostIds.has(p.id)) {
        deletedPostIds.push(p.id);
      }
    });

    if (deletedPostIds.length > 0) {
      console.log('[Ziorse MySQL Watcher] Gönderi silinmesi algılandı:', deletedPostIds);
      serverPosts = serverPosts.filter(p => !deletedPostIds.includes(p.id));
      deletedPostIds.forEach(id => {
        io.emit('delete-post-event', { id });
      });
      io.emit('sync-all-posts', serverPosts);
    }
  } catch (e) {
  } finally {
    isWatcherRunning = false;
  }
}, 500);

function ensureOfficialServerBackend() {
  const officialCode = 'ziorse';
  const officialId = 'srv-ziorse-official';
  const primaryAdmin = (globalAccounts && globalAccounts.length > 0) ? globalAccounts[0] : { handle: '@justawp', name: 'justawp', avatar: '' };

  if (!globalInviteRegistry[officialCode]) {
    globalInviteRegistry[officialCode] = {
      serverName: 'ziorse.com',
      serverDescription: 'welcome.',
      description: 'welcome.',
      isPublic: true,
      isOfficial: true,
      serverType: 'community',
      serverIcon: '/uploads/srv_icon_1791843284247_wagh8.png',
      serverBanner: '/uploads/srv_banner_1791843284248_6kbj4.png',
      serverId: officialId,
      ownerHandle: primaryAdmin.handle,
      ownerName: primaryAdmin.name,
      ownerAvatar: primaryAdmin.avatar || '',
      memberCount: 1,
      categories: [
        {
          id: 'cat-ziorse-genel',
          name: 'METİN KANALLARI',
          collapsed: false,
          channels: [
            { id: 'chat', name: 'chat', type: 'text', topic: 'Ziorse Sohbet Kanalı' }
          ]
        }
      ]
    };
  } else {
    const validHandles = new Set(globalAccounts.map(a => (a.handle || '').toLowerCase()));
    if (!validHandles.has((globalInviteRegistry[officialCode].ownerHandle || '').toLowerCase())) {
      globalInviteRegistry[officialCode].ownerHandle = primaryAdmin.handle;
      globalInviteRegistry[officialCode].ownerName = primaryAdmin.name;
      globalInviteRegistry[officialCode].ownerAvatar = primaryAdmin.avatar || '';
    }
    globalInviteRegistry[officialCode].isOfficial = true;
    if (!globalInviteRegistry[officialCode].serverName) globalInviteRegistry[officialCode].serverName = 'ziorse.com';
    if (!globalInviteRegistry[officialCode].serverId) globalInviteRegistry[officialCode].serverId = officialId;
    if (!globalInviteRegistry[officialCode].serverIcon || globalInviteRegistry[officialCode].serverIcon === 'logo.png') {
      globalInviteRegistry[officialCode].serverIcon = '/uploads/srv_icon_1791843284247_wagh8.png';
    }
    if (!globalInviteRegistry[officialCode].serverBanner) {
      globalInviteRegistry[officialCode].serverBanner = '/uploads/srv_banner_1791843284248_6kbj4.png';
    }
    if (globalInviteRegistry[officialCode].serverDescription === 'Ziorse Resmi Topluluk Sunucusu. Hoş geldiniz!' || !globalInviteRegistry[officialCode].serverDescription) {
      globalInviteRegistry[officialCode].serverDescription = 'welcome.';
    }
    if (globalInviteRegistry[officialCode].description === 'Ziorse Resmi Topluluk Sunucusu. Hoş geldiniz!' || !globalInviteRegistry[officialCode].description) {
      globalInviteRegistry[officialCode].description = 'welcome.';
    }
    
    // Eski 4 kanallı yapı varsa tek 'chat' kanalına güncelle
    const cats = globalInviteRegistry[officialCode].categories;
    if (Array.isArray(cats) && cats.length > 0) {
      const allChs = cats.flatMap(c => c.channels || []);
      const hasOldDefaults = allChs.some(c => c.id === 'ch-ziorse-duyurular' || c.id === 'ch-ziorse-yardim' || c.id === 'ch-ziorse-ses');
      if (hasOldDefaults) {
        globalInviteRegistry[officialCode].categories = [
          {
            id: 'cat-ziorse-genel',
            name: 'METİN KANALLARI',
            collapsed: false,
            channels: [
              { id: 'chat', name: 'chat', type: 'text', topic: 'Ziorse Sohbet Kanalı' }
            ]
          }
        ];
      }
    } else {
      globalInviteRegistry[officialCode].categories = [
        {
          id: 'cat-ziorse-genel',
          name: 'METİN KANALLARI',
          collapsed: false,
          channels: [
            { id: 'chat', name: 'chat', type: 'text', topic: 'Ziorse Sohbet Kanalı' }
          ]
        }
      ];
    }
  }

  const validHandles = new Set(globalAccounts.map(a => (a.handle || '').toLowerCase()));
  if (!globalServerMembers[officialCode]) globalServerMembers[officialCode] = [];
  globalServerMembers[officialCode] = globalServerMembers[officialCode].filter(m => m && m.handle && validHandles.has(m.handle.toLowerCase()));
  globalServerMembers[officialId] = globalServerMembers[officialCode];

  // Mevcut tüm hesapları otomatik olarak ziorse.com sunucusuna üye yap
  if (Array.isArray(globalAccounts)) {
    globalAccounts.forEach(acc => {
      if (acc && acc.handle) {
        const cleanH = acc.handle.toLowerCase();
        if (!globalServerMembers[officialCode].some(m => m.handle.toLowerCase() === cleanH)) {
          globalServerMembers[officialCode].push({
            handle: acc.handle,
            name: acc.name || acc.handle.replace('@', ''),
            avatar: acc.avatar || ''
          });
        }
      }
    });
  }

  globalInviteRegistry[officialCode].memberCount = Math.max(globalServerMembers[officialCode].length, 1);
  saveInviteRegistryTxt();
  saveServerMembersTxt(officialCode);
  saveServerMembersTxt(officialId);
}
ensureOfficialServerBackend();

// ── AUTH & ACCOUNTS REST API ───────────────────────────────────
app.get('/api/accounts', async (req, res) => {
  try {
    const accs = await mysqlDb.getAllAccounts();
    res.json({ accounts: accs.map(({ password, ...rest }) => rest) });
  } catch (err) {
    res.json({ accounts: publicAccounts() });
  }
});

app.post(['/api/register', '/api/auth/register'], async (req, res) => {
  try {
    const { name, handle, email, password, avatar, banner, bio } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'E-posta ve şifre zorunludur.' });
    const cleanHandle = handle ? (handle.startsWith('@') ? handle : '@' + handle) : ('@' + email.split('@')[0]);
    const cleanEmail = email.toLowerCase().trim();
    const cleanPass = String(password).trim();

    // 1. MySQL'de e-posta veya kullanıcı adı var mı kontrol et
    const existingEmail = await mysqlDb.getAccountByLogin(cleanEmail).catch(() => null);
    const existingHandle = await mysqlDb.getAccountByLogin(cleanHandle).catch(() => null);
    if (existingEmail || existingHandle) {
      return res.status(400).json({ error: 'Bu kullanıcı adı veya e-posta adresi zaten kullanılıyor.' });
    }

    const newAcc = {
      name: name || cleanEmail.split('@')[0],
      handle: cleanHandle,
      email: cleanEmail,
      password: cleanPass,
      avatar: avatar || '',
      banner: banner || '#999999',
      bio: bio || ''
    };

    // 2. MySQL veritabanına doğrudan kaydet (accounts, user_directory ve resmi sunucu üyeliği)
    const created = await mysqlDb.createAccount(newAcc);
    const fullAcc = { ...newAcc, id: created?.id };

    // 3. Bellek listelerini güncelle
    globalAccounts = globalAccounts.filter(a => a.handle.toLowerCase() !== cleanHandle.toLowerCase() && a.email.toLowerCase() !== cleanEmail);
    globalAccounts.push(fullAcc);

    globalUserDirectory[cleanHandle] = {
      name: fullAcc.name,
      handle: cleanHandle,
      avatar: fullAcc.avatar || '',
      banner: fullAcc.banner || '#999999',
      bio: fullAcc.bio || '',
      followers: 0,
      following: 0,
      status: { type: 'online', text: '' }
    };

    // 4. Resmi sunucu üyelerine ekle
    if (!globalServerMembers['ziorse']) globalServerMembers['ziorse'] = [];
    if (!globalServerMembers['ziorse'].some(m => m.handle.toLowerCase() === cleanHandle.toLowerCase())) {
      globalServerMembers['ziorse'].push({
        handle: fullAcc.handle,
        name: fullAcc.name,
        avatar: fullAcc.avatar || ''
      });
      globalServerMembers['srv-ziorse-official'] = globalServerMembers['ziorse'];
      if (globalInviteRegistry['ziorse']) {
        globalInviteRegistry['ziorse'].memberCount = globalServerMembers['ziorse'].length;
      }
      saveServerMembersTxt('ziorse');
      saveServerMembersTxt('srv-ziorse-official');
      saveInviteRegistryTxt();
    }

    saveSyncDb();
    io.emit('accounts-updated', publicAccounts());
    io.emit('user-directory-updated', globalUserDirectory);
    io.emit('server-members-updated', globalServerMembers);

    const token = jwt.sign({ handle: fullAcc.handle, email: fullAcc.email }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ success: true, account: fullAcc, user: fullAcc, token });
  } catch (err) {
    console.error('[Register Error]:', err);
    return res.status(500).json({ error: 'Kayıt sırasında veritabanı hatası oluştu: ' + err.message });
  }
});

app.post(['/api/login', '/api/auth/login'], async (req, res) => {
  try {
    const { identifier, email, handle, password } = req.body;
    const loginId = (identifier || email || handle || '').trim().toLowerCase();
    const cleanId = loginId.replace('@', '');
    const pass = String(password || '').trim();
    if (!loginId || !pass) return res.status(400).json({ error: 'Giriş bilgileri eksik.' });

    // Doğrudan MySQL veritabanından sorgula
    let found = await mysqlDb.getAccountByLogin(loginId).catch(() => null);
    if (!found) {
      found = await mysqlDb.getAccountByLogin('@' + cleanId).catch(() => null);
    }
    if (!found) {
      found = globalAccounts.find(a =>
        (a.email && a.email.toLowerCase() === loginId) ||
        (a.handle && a.handle.toLowerCase() === loginId) ||
        (a.handle && a.handle.toLowerCase().replace('@', '') === cleanId)
      );
    }

    if (!found) {
      return res.status(404).json({ error: 'Bu kullanıcı adı veya e-posta ile kayıtlı hesap bulunamadı.' });
    }
    if (String(found.password) !== pass) {
      return res.status(401).json({ error: 'Şifre yanlış.' });
    }

    if (!globalAccounts.some(a => a.handle.toLowerCase() === found.handle.toLowerCase())) {
      globalAccounts.push(found);
    }

    if (!globalUserDirectory[found.handle]) {
      globalUserDirectory[found.handle] = {
        name: found.name,
        handle: found.handle,
        avatar: found.avatar || '',
        banner: found.banner || '#999999',
        bio: found.bio || '',
        followers: 0,
        following: 0,
        status: { type: 'online', text: '' }
      };
      saveSyncDb();
      io.emit('user-directory-updated', globalUserDirectory);
    }

    const token = jwt.sign({ handle: found.handle, email: found.email }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ success: true, account: found, user: found, token });
  } catch (err) {
    console.error('[Login Error]:', err);
    return res.status(500).json({ error: 'Giriş sırasında veritabanı hatası oluştu: ' + err.message });
  }
});

// ── JWT HELPERS ───────────────────────────────────────────────
function signToken(user) {
  return jwt.sign({ handle: user.handle, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Token gerekli.' });
  try {
    req.user = jwt.verify(auth.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Geçersiz token.' });
  }
}

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = globalAccounts.find(u => u.handle.toLowerCase() === req.user.handle.toLowerCase());
  if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser });
});

// ── REST USER DIRECTORY ENDPOINTS ─────────────────────────────
app.get('/api/users', (req, res) => {
  res.json({ users: globalUserDirectory });
});

app.post('/api/user/sync', (req, res) => {
  const user = req.body;
  if (!user || !user.handle) return res.status(400).json({ error: 'Kullanıcı bilgisi eksik.' });
  const h = user.handle.startsWith('@') ? user.handle : '@' + user.handle;
  globalUserDirectory[h] = {
    ...(globalUserDirectory[h] || {}),
    ...user,
    handle: h
  };
  io.emit('user-directory-updated', globalUserDirectory);
  res.json({ success: true, directory: globalUserDirectory });
});

// ── REST POSTS ENDPOINTS ──────────────────────────────────────
app.get('/api/posts', (req, res) => {
  res.json({ posts: serverPosts });
});

app.post('/api/posts', (req, res) => {
  const post = req.body;
  if (!post.timestamp) post.timestamp = new Date().toISOString();
  serverPosts.unshift(post);
  io.emit('new-post-event', post);
  res.json({ success: true, post });
});

// ── REST INVITE REGISTRY ENDPOINTS ────────────────────────────
app.get('/api/invites', (req, res) => {
  Object.keys(globalInviteRegistry).forEach(code => {
    if (globalServerMembers[code]) {
      globalInviteRegistry[code].memberCount = Math.max(globalServerMembers[code].length, globalInviteRegistry[code].memberCount || 1);
    }
  });
  res.json({ registry: globalInviteRegistry });
});

app.get('/api/invite/:code', (req, res) => {
  const info = globalInviteRegistry[req.params.code];
  if (!info) return res.status(404).json({ error: 'Davet bulunamadı.' });
  if (globalServerMembers[req.params.code]) {
    info.memberCount = Math.max(globalServerMembers[req.params.code].length, info.memberCount || 1);
  }
  res.json({ invite: info });
});

app.post('/api/invite/register', (req, res) => {
  const { code, info } = req.body;
  if (!code || !info) return res.status(400).json({ error: 'Geçersiz veri.' });
  if (globalServerMembers[code]) {
    info.memberCount = Math.max(globalServerMembers[code].length, info.memberCount || 1);
  }
  globalInviteRegistry[code] = info;
  io.emit('invite-registry-updated', globalInviteRegistry);
  io.emit('public-servers-updated', globalInviteRegistry);
  res.json({ success: true, registry: globalInviteRegistry });
});

// ── HERKESE AÇIK SUNUCULAR (PUBLIC SERVERS) API ───────────────
app.get('/api/public-servers', (req, res) => {
  const publicList = [];
  Object.keys(globalInviteRegistry).forEach(code => {
    const info = globalInviteRegistry[code];
    if (info && info.isPublic === true) {
      const members = globalServerMembers[code] || [];
      const memberCount = Math.max(members.length, info.memberCount || 1);

      let onlineCount = 0;
      members.forEach(m => {
        if (!m || !m.handle) return;
        const cleanH = m.handle.toLowerCase().replace('@', '');
        const fullH = '@' + cleanH;
        if (activeOnlineHandles.has(cleanH) || activeOnlineHandles.has(fullH)) {
          onlineCount++;
        }
      });
      const offlineCount = Math.max(0, memberCount - onlineCount);

      publicList.push({
        inviteCode: code,
        serverId: info.serverId || code,
        name: info.serverName || 'Sunucu',
        description: info.serverDescription || info.description || 'Topluluk ve sohbet sunucusu.',
        icon: info.serverIcon || 'Z',
        banner: info.serverBanner || '',
        memberCount: memberCount,
        onlineCount: onlineCount,
        offlineCount: offlineCount,
        ownerHandle: info.ownerHandle || '',
        ownerName: info.ownerName || '',
        ownerAvatar: info.ownerAvatar || '',
        categories: info.categories || [],
        isPublic: true
      });
    }
  });
  res.json({ servers: publicList });
});



let memorySystemStore = {};

async function readAllStoreData() {
  try {
    const dbStore = await mysqlDb.getAllStoreValues();
    if (dbStore && typeof dbStore === 'object') {
      memorySystemStore = { ...dbStore };
    }
  } catch (e) { }

  const store = {};
  for (const [k, v] of Object.entries(memorySystemStore)) {
    if (!k.startsWith('ziorse_real_servers_v14_') && k !== 'ziorse_accounts' && !k.startsWith('ziorse_srv_members_') && k !== 'ziorse_user_directory') {
      store[k] = v;
    }
  }
  if (serverPosts && serverPosts.length > 0) {
    store['ziorse_real_posts_v14'] = serverPosts;
  }
  store['ziorse_invite_registry'] = globalInviteRegistry;
  store['ziorse_user_directory'] = globalUserDirectory;
  store['ziorse_accounts'] = publicAccounts();
  Object.keys(globalServerMembers).forEach(code => {
    store['ziorse_srv_members_' + code] = globalServerMembers[code];
  });
  if (globalServerMembers['ziorse']) {
    store['ziorse_srv_members_srv-ziorse-official'] = globalServerMembers['ziorse'];
  }

  return store;
}

app.get('/api/store/all', async (req, res) => {
  const store = await readAllStoreData();
  res.json(store);
});

app.get('/api/store/get/:key', async (req, res) => {
  const key = req.params.key;
  if (key === 'ziorse_real_user_v14' || key === 'ziorse_jwt_token' || key === 'ziorse_user') {
    return res.json({ key, value: null });
  }

  if (key === 'ziorse_accounts') {
    return res.json({ key, value: publicAccounts() });
  }
  if (key === 'ziorse_user_directory') {
    return res.json({ key, value: globalUserDirectory });
  }
  if (key === 'ziorse_invite_registry') {
    return res.json({ key, value: globalInviteRegistry });
  }
  if (key.startsWith('ziorse_srv_members_')) {
    const code = key.replace('ziorse_srv_members_', '');
    const mems = globalServerMembers[code] || (code === 'srv-ziorse-official' ? globalServerMembers['ziorse'] : []) || [];
    return res.json({ key, value: mems });
  }

  let val = memorySystemStore[key];
  if (val === undefined) {
    try {
      val = await mysqlDb.getStoreValue(key);
      if (val !== null && val !== undefined) {
        memorySystemStore[key] = val;
      }
    } catch (e) { }
  }

  if (val === undefined) {
    const store = await readAllStoreData();
    val = store[key] !== undefined ? store[key] : null;
  }
  res.json({ key, value: val !== undefined ? val : null });
});

app.post('/api/store/set', async (req, res) => {
  const { key, val } = req.body;
  if (!key) return res.status(400).json({ error: 'Key zorunludur.' });
  if (key === 'ziorse_real_user_v14' || key === 'ziorse_jwt_token' || key === 'ziorse_user') {
    return res.json({ success: true, localOnly: true });
  }

  // Relational entities have their own MySQL tables; do NOT pollute system store with old client dumps
  if (
    key === 'ziorse_accounts' ||
    key === 'ziorse_invite_registry' ||
    key === 'ziorse_real_posts_v14' ||
    key.startsWith('ziorse_srv_members_') ||
    key.startsWith('ziorse_real_servers_')
  ) {
    return res.json({ success: true, ignored: true });
  }

  try {
    if (val === null || val === undefined) {
      delete memorySystemStore[key];
      await mysqlDb.deleteStoreValue(key).catch(() => {});
      io.emit('store-synced', { key, val: null });
      return res.json({ success: true });
    }

    memorySystemStore[key] = val;
    mysqlDb.setStoreValue(key, val).catch(() => {});

    if (key === 'ziorse_user_directory' && typeof val === 'object') {
      const validHandles = new Set(globalAccounts.map(a => (a.handle || '').toLowerCase()));
      const filteredDir = {};
      for (const [dh, du] of Object.entries(val)) {
        if (validHandles.has(dh.toLowerCase())) {
          filteredDir[dh] = du;
        }
      }
      globalUserDirectory = Object.assign(globalUserDirectory, filteredDir);
      io.emit('user-directory-updated', globalUserDirectory);
    }

    io.emit('store-synced', { key, val });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post(['/api/store/delete', '/api/store/remove'], async (req, res) => {
  const { key } = req.body;
  if (!key) return res.status(400).json({ error: 'Key zorunludur.' });
  if (key === 'ziorse_real_user_v14' || key === 'ziorse_jwt_token' || key === 'ziorse_user') {
    return res.json({ success: true, localOnly: true });
  }

  try {
    delete memorySystemStore[key];
    await mysqlDb.deleteStoreValue(key).catch(() => {});
    io.emit('store-synced', { key, val: null });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/store/:key', async (req, res) => {
  const key = req.params.key;
  if (!key) return res.status(400).json({ error: 'Key zorunludur.' });
  if (key === 'ziorse_real_user_v14' || key === 'ziorse_jwt_token' || key === 'ziorse_user') {
    return res.json({ success: true, localOnly: true });
  }

  try {
    delete memorySystemStore[key];
    await mysqlDb.deleteStoreValue(key).catch(() => {});
    io.emit('store-synced', { key, val: null });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── ADVANCED DATABASE ENGINE HEALTH & RECONCILIATION API ──
app.get('/api/db/stats', async (req, res) => {
  try {
    const [accCount] = await mysqlDb.getPool().query('SELECT COUNT(*) as cnt FROM accounts');
    const [srvCount] = await mysqlDb.getPool().query('SELECT COUNT(*) as cnt FROM servers');
    const [postCount] = await mysqlDb.getPool().query('SELECT COUNT(*) as cnt FROM posts');
    const [dmCount] = await mysqlDb.getPool().query('SELECT COUNT(*) as cnt FROM dms');
    const [storeCount] = await mysqlDb.getPool().query('SELECT COUNT(*) as cnt FROM system_store');
    const [userCount] = await mysqlDb.getPool().query('SELECT COUNT(*) as cnt FROM user_directory');

    res.json({
      status: 'healthy',
      engine: 'MySQL 8 (gusgon) + 15s Keep-Alive Ping',
      pingInterval: '15000ms',
      database: 'gusgon',
      collections: {
        accounts: accCount[0].cnt,
        servers: srvCount[0].cnt,
        posts: postCount[0].cnt,
        dms: dmCount[0].cnt,
        userProfiles: userCount[0].cnt,
        systemStore: storeCount[0].cnt
      },
      totalPosts: serverPosts ? serverPosts.length : 0
    });
  } catch (err) {
    res.json({
      status: 'healthy',
      engine: 'MySQL (gusgon)',
      collections: {
        accounts: globalAccounts ? globalAccounts.length : 0,
        servers: globalInviteRegistry ? Object.keys(globalInviteRegistry).length : 0,
        serverMemberTables: Object.keys(globalServerMembers).length,
        userProfiles: Object.keys(globalUserDirectory).length,
        systemStore: Object.keys(memorySystemStore).length
      },
      totalPosts: serverPosts ? serverPosts.length : 0
    });
  }
});

app.post('/api/db/reconcile', async (req, res) => {
  try {
    await loadSyncDb();
    io.emit('accounts-updated', publicAccounts());
    io.emit('user-directory-updated', globalUserDirectory);
    io.emit('server-members-updated', globalServerMembers);
    io.emit('invite-registry-updated', globalInviteRegistry);
    res.json({
      success: true,
      accounts: globalAccounts.length,
      members: globalServerMembers['ziorse'] ? globalServerMembers['ziorse'].length : 0,
      userDirectory: Object.keys(globalUserDirectory).length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/server/restart', (req, res) => {
  res.json({ success: true, restarting: true });
  setTimeout(() => {
    process.exit(0);
  }, 200);
});

// ── FILE UPLOAD ENDPOINT ──────────────────────────────────────
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Dosya yüklenemedi.' });
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    url: fileUrl,
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    size: req.file.size
  });
});

// ── DISCORD-GRADE OPENGRAPH LINK PREVIEW ──────────────────────
const ogCache = new Map();

app.get('/api/og-preview', async (req, res) => {
  const targetUrl = (req.query.url || '').trim();
  if (!targetUrl) return res.status(400).json({ error: 'URL parametresi gerekli.' });

  if (ogCache.has(targetUrl)) {
    return res.json(ogCache.get(targetUrl));
  }

  try {
    const parsedUrl = new URL(targetUrl);
    const domain = parsedUrl.hostname.replace(/^www\./, '');

    // Direct Image URL detection
    if (/\.(?:png|jpg|jpeg|gif|webp|svg)$/i.test(parsedUrl.pathname)) {
      const imgData = {
        url: targetUrl,
        siteName: domain,
        title: parsedUrl.pathname.split('/').pop() || 'Görsel',
        description: '',
        image: targetUrl,
        favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
        type: 'image'
      };
      ogCache.set(targetUrl, imgData);
      return res.json(imgData);
    }

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'tr,en-US;q=0.8,en;q=0.6'
      },
      signal: AbortSignal.timeout(6000),
      redirect: 'follow'
    });

    const html = await response.text();

    function getMeta(prop) {
      const match = html.match(new RegExp(`<meta[^>]+(?:property|name)=["'](?:og:|twitter:)?${prop}["'][^>]+content=["']([^"']+)["']`, 'i'))
        || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:|twitter:)?${prop}["']`, 'i'));
      return match ? match[1].trim() : null;
    }

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    let title = getMeta('title') || (titleMatch && titleMatch[1].trim()) || domain;
    let description = getMeta('description') || '';
    let image = getMeta('image') || '';
    let siteName = getMeta('site_name') || domain;

    // Resolve relative image URLs
    if (image && !image.startsWith('http')) {
      try { image = new URL(image, targetUrl).href; } catch { }
    }

    const previewData = {
      url: targetUrl,
      siteName: siteName,
      title: title,
      description: description,
      image: image,
      favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
      type: 'website'
    };

    ogCache.set(targetUrl, previewData);
    // Limit cache size to 1000 items
    if (ogCache.size > 1000) {
      const firstKey = ogCache.keys().next().value;
      ogCache.delete(firstKey);
    }

    return res.json(previewData);
  } catch (err) {
    // Fallback on timeout or CORS error
    const domain = (() => { try { return new URL(targetUrl).hostname.replace(/^www\./, ''); } catch { return 'Link'; } })();
    const fallbackData = {
      url: targetUrl,
      siteName: domain,
      title: domain,
      description: targetUrl,
      image: '',
      favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
      type: 'website'
    };
    return res.json(fallbackData);
  }
});


// ── DISCORD-GRADE GIF PROXY (TENOR.COM & NSFWGIFY.COM) ────────
app.get('/api/gifs', async (req, res) => {
  const source = (req.query.source || 'tenor').toLowerCase();
  const q = (req.query.q || '').trim();

  try {
    if (source === 'nsfwgify') {
      let targetUrl = 'https://nsfwgify.com/';
      if (q) {
        targetUrl = `https://nsfwgify.com/search/${encodeURIComponent(q)}`;
      }
      const response = await fetch(targetUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(8000)
      });
      const html = await response.text();
      const matches = html.match(/https:\/\/cdn\.nsfwgify\.com\/[0-9]+\/[^"'<>\s]+\.(?:webp|gif|mp4)/gi) || [];
      const unique = Array.from(new Set(matches));

      const gifs = unique.map((u, i) => {
        const fullUrl = u.replace('-thumbnail.webp', '.gif').replace('-thumbnail.mp4', '.gif');
        const filename = u.split('/').pop().replace(/-thumbnail\.(webp|mp4|gif)$/, '').replace(/[-_]/g, ' ');
        return {
          id: 'nsfw-' + i + '-' + Date.now(),
          title: filename || 'NSFW GIF',
          url: fullUrl,
          preview: u,
          source: 'nsfwgify'
        };
      });

      return res.json({ success: true, source: 'nsfwgify', gifs: gifs.slice(0, 48) });
    }

    // TENOR ENGINE (Discord-Grade Search & Trending)
    let tenorUrl = 'https://tenor.com/trending-gifs';
    if (q) {
      tenorUrl = `https://tenor.com/search/${encodeURIComponent(q)}-gifs`;
    }
    const response = await fetch(tenorUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
      signal: AbortSignal.timeout(8000)
    });
    const html = await response.text();

    const matches = html.match(/https:\/\/media\.tenor\.com\/[a-zA-Z0-9_\-\/]+AAAAM\/[a-zA-Z0-9_\-]+\.gif/gi) ||
      html.match(/https:\/\/media\.tenor\.com\/[a-zA-Z0-9_\-\/]+AAAAC\/[a-zA-Z0-9_\-]+\.gif/gi) ||
      html.match(/https:\/\/media\.tenor\.com\/[a-zA-Z0-9_\-\/]+\.gif/gi) || [];

    const unique = Array.from(new Set(matches));

    let gifs = unique.map((u, i) => {
      const parts = u.split('/');
      const filename = (parts.pop() || '').replace('.gif', '').replace(/[-_]/g, ' ');
      return {
        id: 'tenor-' + i + '-' + Date.now(),
        title: filename || (q ? `${q} GIF` : 'GIF'),
        url: u,
        preview: u,
        source: 'tenor'
      };
    });

    return res.json({ success: true, source: 'tenor', gifs: gifs.slice(0, 48) });
  } catch (err) {
    console.error('[GIF API Error]', err.message);
    res.status(500).json({ error: 'GIFler getirilemedi.', detail: err.message, gifs: [] });
  }
});

let socketHandleMap = new Map(); // socket.id -> handle
let activeOnlineHandles = new Set();

// İstemcilere gönderilen hesap listesi asla şifre içermez
function publicAccounts() {
  return (globalAccounts || []).map(a => {
    const { password, ...rest } = a || {};
    return rest;
  });
}

// ── SOCKET.IO & WEBRTC SIGNALING ─────────────────────────────
io.on('connection', (socket) => {
  console.log(`[Socket] Bağlandı: ${socket.id}`);

  // Yeni bağlanan istemciye güncel verileri ilet (önce hesaplar: istemci filtrelemesi buna dayanır)
  socket.emit('accounts-updated', publicAccounts());
  socket.emit('invite-registry-updated', globalInviteRegistry);
  socket.emit('public-servers-updated', globalInviteRegistry);
  socket.emit('user-directory-updated', globalUserDirectory);
  socket.emit('server-members-updated', globalServerMembers);
  socket.emit('voice-users-updated', globalVoiceRooms);
  socket.emit('sync-all-posts', serverPosts);
  socket.emit('online-users-updated', Array.from(activeOnlineHandles));

  socket.on('get-online-users', () => {
    socket.emit('online-users-updated', Array.from(activeOnlineHandles));
  });

  // İstemci periyodik aktiflik / varlık pingi
  socket.on('client-presence-ping', async (data) => {
    if (data && data.handle) {
      const h = data.handle.startsWith('@') ? data.handle : '@' + data.handle;
      const cleanH = h.toLowerCase().replace('@', '');
      let validCleanHandles = new Set(globalAccounts.map(a => (a.handle || '').toLowerCase().replace('@', '')));
      if (!validCleanHandles.has(cleanH)) {
        try {
          const acc = await mysqlDb.getAccountByLogin(cleanH);
          if (acc) {
            globalAccounts.push(acc);
            validCleanHandles.add(cleanH);
          }
        } catch (e) {}
      }
      if (!validCleanHandles.has(cleanH)) return;

      socketHandleMap.set(socket.id, cleanH);
      socket.join(cleanH);
      socket.join(h.toLowerCase());
      socket.join('@' + cleanH);
      activeOnlineHandles.add(cleanH);
      io.emit('online-users-updated', Array.from(activeOnlineHandles));
    }
  });

  socket.on('sync-user-profile', async (data) => {
    if (data && data.handle) {
      const h = data.handle.startsWith('@') ? data.handle : '@' + data.handle;
      const cleanH = h.toLowerCase().replace('@', '');
      let validHandles = new Set(globalAccounts.map(a => (a.handle || '').toLowerCase()));
      if (!validHandles.has(h.toLowerCase())) {
        try {
          const acc = await mysqlDb.getAccountByLogin(cleanH);
          if (acc) {
            globalAccounts.push(acc);
            validHandles.add((acc.handle || '').toLowerCase());
          }
        } catch (e) {}
      }
      if (!validHandles.has(h.toLowerCase())) return;

      socketHandleMap.set(socket.id, cleanH);
      activeOnlineHandles.add(cleanH);
      socket.join(cleanH);
      socket.join(h.toLowerCase());
      socket.join('@' + cleanH);

      // Veritabanında ve dizinde görsel ve videoları doğrudan kod/data URL olarak tut
      globalUserDirectory[h] = {
        ...(globalUserDirectory[h] || {}),
        ...data,
        handle: h
      };

      // Also update account in globalAccounts
      const acc = globalAccounts.find(a => (a.handle || '').toLowerCase().replace('@', '') === cleanH);
      if (acc) {
        if (data.avatar) acc.avatar = data.avatar;
        if (data.banner) acc.banner = data.banner;
        if (data.name) acc.name = data.name;
        if (data.bio) acc.bio = data.bio;
        if (data.fontStyle) acc.fontStyle = data.fontStyle;
        if (data.fontWeight) acc.fontWeight = data.fontWeight;
        if (data.nameColor) acc.nameColor = data.nameColor;
        if (data.nameEffects) acc.nameEffects = data.nameEffects;
        if (data.avatarFrame) acc.avatarFrame = data.avatarFrame;
        if (data.memberTheme) acc.memberTheme = data.memberTheme;
      }

      // Üyenin profil fotoğrafı/adı değiştiğinde tüm sunucu üye listelerini güncelle
      Object.keys(globalServerMembers).forEach(invCode => {
        const mIdx = globalServerMembers[invCode].findIndex(m => (m.handle || '').toLowerCase().replace('@', '') === cleanH);
        if (mIdx !== -1) {
          if (data.avatar) globalServerMembers[invCode][mIdx].avatar = data.avatar;
          if (data.name) globalServerMembers[invCode][mIdx].name = data.name;
          if (data.fontStyle) globalServerMembers[invCode][mIdx].fontStyle = data.fontStyle;
          if (data.fontWeight) globalServerMembers[invCode][mIdx].fontWeight = data.fontWeight;
          if (data.nameColor) globalServerMembers[invCode][mIdx].nameColor = data.nameColor;
          if (data.nameEffects) globalServerMembers[invCode][mIdx].nameEffects = data.nameEffects;
          if (data.avatarFrame) globalServerMembers[invCode][mIdx].avatarFrame = data.avatarFrame;
          if (data.memberTheme) globalServerMembers[invCode][mIdx].memberTheme = data.memberTheme;
        }
      });

      // Resmi sunucuya (ziorse) otomatik üyelik kaydını garantile
      const officialCode = 'ziorse';
      if (!globalServerMembers[officialCode]) globalServerMembers[officialCode] = [];
      if (!globalServerMembers[officialCode].some(m => (m.handle || '').toLowerCase().replace('@', '') === cleanH)) {
        globalServerMembers[officialCode].push({
          handle: h,
          name: data.name || cleanH,
          avatar: data.avatar || ''
        });
      }

      // Sunucu davet listesindeki sahip bilgilerini güncelle
      Object.keys(globalInviteRegistry).forEach(code => {
        const reg = globalInviteRegistry[code];
        if (reg && (reg.ownerHandle || '').toLowerCase().replace('@', '') === cleanH.replace('@', '')) {
          if (data.avatar) reg.ownerAvatar = data.avatar;
          if (data.name) reg.ownerName = data.name;
        }
      });

      // serverPosts içindeki gönderi ve yorumların yazar ve avatar bilgilerini güncelle
      if (Array.isArray(serverPosts)) {
        serverPosts.forEach(p => {
          if (p && (p.handle || '').toLowerCase().replace('@', '') === cleanH.replace('@', '')) {
            if (data.avatar) p.avatar = data.avatar;
            if (data.name) p.author = data.name;
          }
          if (Array.isArray(p.comments)) {
            p.comments.forEach(c => {
              if (c && (c.handle || '').toLowerCase().replace('@', '') === cleanH.replace('@', '')) {
                if (data.avatar) c.avatar = data.avatar;
                if (data.name) c.author = data.name;
              }
            });
          }
        });
      }

      saveSyncDb();
      io.emit('user-directory-updated', globalUserDirectory);
      io.emit('server-members-updated', globalServerMembers);
      io.emit('online-users-updated', Array.from(activeOnlineHandles));
      io.emit('profile-updated', {
        handle: h,
        ...globalUserDirectory[h]
      });
      io.emit('public-servers-updated', globalInviteRegistry);
    }
  });

  // Sunucu Üyeleri Canlı Senkronizasyonu
  socket.on('server-member-joined', (data) => {
    if (data && data.inviteCode && data.member && data.member.handle) {
      const validHandles = new Set(globalAccounts.map(a => (a.handle || '').toLowerCase()));
      if (!validHandles.has(data.member.handle.toLowerCase())) return;

      if (!globalServerMembers[data.inviteCode]) globalServerMembers[data.inviteCode] = [];
      const mHandle = (data.member.handle || '').toLowerCase();
      const cleanH = mHandle.replace('@', '');
      const idx = globalServerMembers[data.inviteCode].findIndex(m => m.handle.toLowerCase() === mHandle);
      if (idx === -1) {
        globalServerMembers[data.inviteCode].push(data.member);
      } else {
        globalServerMembers[data.inviteCode][idx] = {
          ...globalServerMembers[data.inviteCode][idx],
          ...data.member
        };
      }

      // serverId eşleşmesi varsa senkronize tut
      const reg = globalInviteRegistry[data.inviteCode];
      const srvId = (reg && reg.serverId) || data.serverId;
      if (srvId && srvId !== data.inviteCode) {
        globalServerMembers[srvId] = globalServerMembers[data.inviteCode];
        saveServerMembersTxt(srvId);
      }

      if (globalInviteRegistry[data.inviteCode]) {
        globalInviteRegistry[data.inviteCode].memberCount = globalServerMembers[data.inviteCode].length;
      }

      // Kullanıcı dizinini güncelle
      const fullH = mHandle.startsWith('@') ? mHandle : '@' + mHandle;
      globalUserDirectory[fullH] = {
        ...(globalUserDirectory[fullH] || {}),
        ...data.member,
        handle: fullH
      };

      // Katılan üyeyi anında online listesine de ekle
      activeOnlineHandles.add(cleanH);

      saveSyncDb();
      saveServerMembersTxt(data.inviteCode);
      saveInviteRegistryTxt();

      io.emit('server-members-updated', globalServerMembers);
      io.emit('invite-registry-updated', globalInviteRegistry);
      io.emit('user-directory-updated', globalUserDirectory);
      io.emit('online-users-updated', Array.from(activeOnlineHandles));
      io.emit('server-member-joined-event', {
        inviteCode: data.inviteCode,
        serverId: srvId,
        member: data.member,
        members: globalServerMembers[data.inviteCode]
      });
    }
  });

  socket.on('sync-my-server-memberships', (items) => {
    if (Array.isArray(items) && items.length > 0) {
      const validHandles = new Set(globalAccounts.map(a => (a.handle || '').toLowerCase()));
      const validCleanHandles = new Set(globalAccounts.map(a => (a.handle || '').toLowerCase().replace('@', '')));

      if (items[0]?.member?.handle) {
        const cleanH = items[0].member.handle.toLowerCase().replace('@', '');
        if (validCleanHandles.has(cleanH)) {
          socketHandleMap.set(socket.id, cleanH);
          activeOnlineHandles.add(cleanH);
          io.emit('online-users-updated', Array.from(activeOnlineHandles));
        }
      }
      let changed = false;
      items.forEach(it => {
        if (it && it.inviteCode) {
          // Sunucu registry'de yoksa kesinlikle diriltme; client'a anında silindiğini bildir ve temizlet
          if (!globalInviteRegistry[it.inviteCode]) {
            socket.emit('server-deleted', { inviteCode: it.inviteCode, serverId: it.serverId || it.inviteCode });
            return;
          }

          if (!globalServerMembers[it.inviteCode]) globalServerMembers[it.inviteCode] = [];

          if (it.member && it.member.handle && validHandles.has(it.member.handle.toLowerCase())) {
            const mHandle = it.member.handle.toLowerCase();
            const idx = globalServerMembers[it.inviteCode].findIndex(m => m.handle.toLowerCase() === mHandle);
            if (idx === -1) {
              globalServerMembers[it.inviteCode].push(it.member);
              changed = true;
            } else {
              const cur = globalServerMembers[it.inviteCode][idx];
              if (it.member.name !== cur.name || it.member.avatar !== cur.avatar) {
                globalServerMembers[it.inviteCode][idx] = { ...cur, ...it.member };
                changed = true;
              }
            }
          }

          if (Array.isArray(it.members)) {
            it.members.forEach(mem => {
              if (mem && mem.handle && validHandles.has(mem.handle.toLowerCase())) {
                const memHandle = mem.handle.toLowerCase();
                const mIdx = globalServerMembers[it.inviteCode].findIndex(m => m.handle.toLowerCase() === memHandle);
                if (mIdx === -1) {
                  globalServerMembers[it.inviteCode].push(mem);
                  changed = true;
                } else {
                  const cur = globalServerMembers[it.inviteCode][mIdx];
                  if (mem.name !== cur.name || mem.avatar !== cur.avatar) {
                    globalServerMembers[it.inviteCode][mIdx] = { ...cur, ...mem };
                    changed = true;
                  }
                }
              }
            });
          }

          // Her zaman geçerli hesaplara göre filtrele
          globalServerMembers[it.inviteCode] = globalServerMembers[it.inviteCode].filter(m => m && m.handle && validHandles.has(m.handle.toLowerCase()));

          if (it.serverInfo) {
            if (!globalInviteRegistry[it.inviteCode]) {
              globalInviteRegistry[it.inviteCode] = it.serverInfo;
              changed = true;
            } else {
              const reg = globalInviteRegistry[it.inviteCode];
              if (it.serverInfo.serverName && it.serverInfo.serverName !== reg.serverName) {
                reg.serverName = it.serverInfo.serverName;
                changed = true;
              }
              if (it.serverInfo.serverIcon && it.serverInfo.serverIcon !== reg.serverIcon) {
                reg.serverIcon = it.serverInfo.serverIcon;
                changed = true;
              }
              if (it.serverInfo.serverBanner !== undefined && it.serverInfo.serverBanner !== reg.serverBanner) {
                reg.serverBanner = it.serverInfo.serverBanner;
                changed = true;
              }
              if (Array.isArray(it.serverInfo.categories) && it.serverInfo.categories.length > 0) {
                reg.categories = it.serverInfo.categories;
                changed = true;
              }
              if (Array.isArray(it.serverInfo.roles) && it.serverInfo.roles.length > 0) {
                reg.roles = it.serverInfo.roles;
                changed = true;
              }
              if (it.serverInfo.memberRoles && typeof it.serverInfo.memberRoles === 'object') {
                reg.memberRoles = { ...(reg.memberRoles || {}), ...it.serverInfo.memberRoles };
                changed = true;
              }
            }
            if (globalInviteRegistry[it.inviteCode]) {
              globalInviteRegistry[it.inviteCode].memberCount = Math.max(
                globalServerMembers[it.inviteCode].length,
                (it.serverInfo && it.serverInfo.memberCount) || 0,
                1
              );
            }
          }
        }
      });
      if (changed) {
        saveSyncDb();
        items.forEach(it => {
          if (it && it.inviteCode) saveServerMembersTxt(it.inviteCode);
        });
        saveInviteRegistryTxt();
        io.emit('server-members-updated', globalServerMembers);
        io.emit('invite-registry-updated', globalInviteRegistry);
      }
    }
  });

  // Ses Odası Canlı Katılımcı Senkronizasyonu
  socket.on('join-voice-channel', (data) => {
    if (data && (data.roomKey || data.channelId) && data.user) {
      const rKey = data.roomKey || data.channelId;
      if (!globalVoiceRooms[rKey]) globalVoiceRooms[rKey] = [];
      // Kullanıcıyı diğer tüm odalardan temizle
      Object.keys(globalVoiceRooms).forEach(k => {
        globalVoiceRooms[k] = globalVoiceRooms[k].filter(u => u.handle.toLowerCase() !== data.user.handle.toLowerCase() && u.socketId !== socket.id);
      });
      globalVoiceRooms[rKey].push({
        socketId: socket.id,
        handle: data.user.handle,
        name: data.user.name,
        avatar: data.user.avatar || '',
        isSpeaking: false,
        isMuted: !!data.isMuted,
        isDeafened: !!data.isDeafened,
        serverId: data.serverId,
        channelId: data.channelId,
        roomKey: rKey
      });
      io.emit('voice-users-updated', globalVoiceRooms);
    }
  });

  socket.on('leave-voice-channel', (data) => {
    let changed = false;
    Object.keys(globalVoiceRooms).forEach(k => {
      const before = globalVoiceRooms[k].length;
      globalVoiceRooms[k] = globalVoiceRooms[k].filter(u => {
        if (data && data.handle && u.handle.toLowerCase() === data.handle.toLowerCase()) return false;
        if (u.socketId === socket.id) return false;
        return true;
      });
      if (globalVoiceRooms[k].length !== before) changed = true;
    });
    if (changed) {
      io.emit('voice-users-updated', globalVoiceRooms);
    }
  });

  socket.on('voice-vad-state', (data) => {
    if (data && (data.roomKey || data.channelId) && data.handle) {
      const rKey = data.roomKey || data.channelId;
      if (globalVoiceRooms[rKey]) {
        const user = globalVoiceRooms[rKey].find(u => u.handle.toLowerCase() === data.handle.toLowerCase());
        if (user) {
          user.isSpeaking = !!data.isSpeaking;
          if (data.isMuted !== undefined) user.isMuted = !!data.isMuted;
          if (data.isDeafened !== undefined) user.isDeafened = !!data.isDeafened;
        }
      }
      io.emit('voice-users-updated', globalVoiceRooms);
    }
  });

  socket.on('join-voice-room', (roomName) => {
    socket.join(roomName);
    socket.to(roomName).emit('peer-joined', socket.id);
  });

  socket.on('leave-voice-room', (roomName) => {
    socket.leave(roomName);
    socket.to(roomName).emit('peer-left', socket.id);
  });

  socket.on('webrtc-offer', (data) => socket.to(data.target).emit('webrtc-offer', { offer: data.offer, sender: socket.id }));
  socket.on('webrtc-answer', (data) => socket.to(data.target).emit('webrtc-answer', { answer: data.answer, sender: socket.id }));
  socket.on('webrtc-ice-candidate', (data) => socket.to(data.target).emit('webrtc-ice-candidate', { candidate: data.candidate, sender: socket.id }));

  // DM Canlı Mesajlaşma (Hedefe ve Gönderene Özel Güvenli İletim)
  socket.on('send-dm-live', (data) => {
    if (!data) return;
    if (!data.timestamp) data.timestamp = new Date().toISOString();

    const toH = data.toHandle ? data.toHandle.toLowerCase() : '';
    const fromH = data.fromHandle ? data.fromHandle.toLowerCase() : '';
    const cleanTo = toH.replace('@', '');
    const cleanFrom = fromH.replace('@', '');

    mysqlDb.saveDM({
      id: data.message?.id || ('dm-' + Date.now()),
      fromHandle: data.fromHandle || fromH,
      toHandle: data.toHandle || toH,
      content: data.message?.text || data.content || '',
      media: data.message?.image || data.message?.video || data.message?.media || data.media || null,
      timestamp: data.message?.timestamp || data.timestamp,
      raw_data: JSON.stringify(data)
    }).catch(err => {
      console.error('[MySQL Error] DM kaydedilemedi:', err.message);
    });

    if (cleanTo) {
      io.to(toH).to(cleanTo).to('@' + cleanTo).emit('receive-dm-live', data);
    }
    if (cleanFrom && cleanFrom !== cleanTo) {
      io.to(fromH).to(cleanFrom).to('@' + cleanFrom).emit('receive-dm-live', data);
    }

    // Doğrudan bağlı soketleri de kontrol ederek garantili iletim yap
    for (const [sId, handle] of socketHandleMap.entries()) {
      if (handle === cleanTo || handle === toH) {
        io.to(sId).emit('receive-dm-live', data);
      }
    }
  });

  socket.on('user-typing', (data) => {
    if (data && data.toHandle) {
      const toH = data.toHandle.toLowerCase();
      io.to(toH).to(toH.replace('@', '')).emit('user-typing-event', data);
    } else {
      socket.broadcast.emit('user-typing-event', data);
    }
  });

  // Sunucu Davet Kaydı Senkronizasyonu
  socket.on('register-server-invite', (data) => {
    if (data && data.code && data.info) {
      globalInviteRegistry[data.code] = data.info;
      if (!globalServerMembers[data.code]) globalServerMembers[data.code] = [];
      if (data.info.ownerHandle) {
        const oHandle = data.info.ownerHandle.startsWith('@') ? data.info.ownerHandle : '@' + data.info.ownerHandle;
        const cleanH = oHandle.toLowerCase();
        if (!globalServerMembers[data.code].some(m => m.handle.toLowerCase() === cleanH)) {
          const userProf = globalUserDirectory[oHandle] || globalUserDirectory['@' + oHandle.replace('@', '')] || {};
          globalServerMembers[data.code].unshift({
            handle: oHandle,
            name: userProf.name || data.info.ownerName || oHandle.replace('@', ''),
            avatar: userProf.avatar || data.info.ownerAvatar || ''
          });
        }
      }
      if (Array.isArray(data.info.members)) {
        data.info.members.forEach(mem => {
          if (mem && mem.handle) {
            const mClean = mem.handle.toLowerCase();
            if (!globalServerMembers[data.code].some(m => m.handle.toLowerCase() === mClean)) {
              globalServerMembers[data.code].push(mem);
            }
          }
        });
      }
      globalInviteRegistry[data.code].memberCount = Math.max(
        globalServerMembers[data.code].length,
        (data.info && data.info.memberCount) || 0,
        1
      );
      mysqlDb.upsertServer(data.code, data.info).catch(() => {});
      saveSyncDb();
      if (data.code) saveServerMembersTxt(data.code);
      io.emit('invite-registry-updated', globalInviteRegistry);
      io.emit('public-servers-updated', globalInviteRegistry);
      io.emit('server-members-updated', globalServerMembers);
    }
  });

  // Sunucu Silme Senkronizasyonu
  socket.on('delete-server', async (data) => {
    if (!data) return;
    const code = data.inviteCode || data.serverId;
    if (!code || code === 'ziorse' || code === 'srv-ziorse-official') return;
    console.log('[Ziorse Socket] Sunucu silme talebi alındı:', code);
    await mysqlDb.deleteServer(code).catch(() => {});
    const srvId = globalInviteRegistry[code]?.serverId || code;
    delete globalInviteRegistry[code];
    if (srvId) delete globalInviteRegistry[srvId];
    delete globalServerMembers[code];
    if (srvId) delete globalServerMembers[srvId];

    io.emit('server-deleted', { inviteCode: code, serverId: srvId });
    io.emit('invite-registry-updated', globalInviteRegistry);
    io.emit('public-servers-updated', globalInviteRegistry);
    io.emit('server-members-updated', globalServerMembers);
  });

  socket.on('get-invites', () => {
    socket.emit('invite-registry-updated', globalInviteRegistry);
  });

  // Arkadaşlık İstekleri Senkronizasyonu
  socket.on('send-friend-request', (data) => {
    if (data && data.targetHandle) {
      const th = data.targetHandle.startsWith('@') ? data.targetHandle : '@' + data.targetHandle;
      if (!globalFriendRequests[th]) globalFriendRequests[th] = [];
      globalFriendRequests[th] = globalFriendRequests[th].filter(r => r.handle !== data.from.handle);
      const reqObj = {
        handle: data.from.handle,
        name: data.from.name,
        avatar: data.from.avatar,
        firstMessage: data.firstMessage || null,
        timestamp: data.timestamp || new Date().toISOString()
      };
      globalFriendRequests[th].push(reqObj);
      mysqlDb.saveFriendRequest(th, reqObj).catch(() => {});
      saveSyncDb();
      io.emit('receive-friend-request', { ...data, targetHandle: th });
    }
  });

  socket.on('accept-friend-request', (data) => {
    if (data) {
      const th = data.targetHandle || (data.target ? data.target.handle : null);
      const fh = data.fromHandle || (data.from ? data.from.handle : null);
      if (th && fh) {
        mysqlDb.deleteFriendRequest(th, fh).catch(() => {});
      }
      io.emit('friend-request-accepted', data);
    }
  });

  socket.on('reject-friend-request', (data) => {
    if (data) {
      const th = data.targetHandle || (data.target ? data.target.handle : null);
      const fh = data.fromHandle || (data.from ? data.from.handle : null);
      if (th && fh) {
        mysqlDb.deleteFriendRequest(th, fh).catch(() => {});
      }
      io.emit('friend-request-rejected', data);
    }
  });

  // Canlı Gönderiler
  socket.on('sync-client-posts', (posts) => {
    if (Array.isArray(posts) && posts.length > 0) {
      posts.forEach(p => {
        if (!p || !p.id) return;
        if (p.codeSnippet && typeof p.codeSnippet === 'string' && p.codeSnippet.length > 8000) {
          p.codeSnippet = p.codeSnippet.substring(0, 8000) + '\n// ... (kod boyutu optimize edildi)';
        }
        if (p.avatar && p.avatar.startsWith('data:image/')) {
          p.avatar = extractDataUrlToUpload(p.avatar, 'avatar');
        }
        if (p.image && p.image.startsWith('data:image/')) {
          p.image = extractDataUrlToUpload(p.image, 'post');
        }
      });
      const map = new Map();
      [...posts, ...serverPosts].forEach(p => {
        if (p && p.id) map.set(p.id, p);
      });
      serverPosts = Array.from(map.values()).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      saveSyncDb();
      io.emit('sync-all-posts', serverPosts);
    }
  });

  socket.on('new-post-broadcast', (post) => {
    if (post) {
      if (!post.timestamp) post.timestamp = new Date().toISOString();
      // Tüm görseller, videolar ve kodlar doğrudan string/kod olarak MySQL'de saklanır
      io.emit('new-post-event', post);

      serverPosts = serverPosts.filter(p => p.id !== post.id);
      serverPosts.unshift(post);
      mysqlDb.savePost(post).catch(err => {
        console.error('[MySQL Error] Post kaydedilemedi:', err.message);
      });
      saveSyncDb();
    }
  });

  socket.on('delete-post-broadcast', (data) => {
    if (data && data.id) {
      serverPosts = serverPosts.filter(p => p.id !== data.id);
      mysqlDb.deletePost(data.id).catch(() => {});
      saveSyncDb();
      io.emit('delete-post-event', data);
    }
  });

  socket.on('reaction-broadcast', (data) => {
    io.emit('reaction-event', data);
  });

  // Sunucu Kategori/Kanal Yapısı Canlı Senkronizasyonu
  socket.on('server-structure-update', (data) => {
    if (data && data.inviteCode) {
      if (!globalInviteRegistry[data.inviteCode]) {
        globalInviteRegistry[data.inviteCode] = {};
      }
      if (data.categories) globalInviteRegistry[data.inviteCode].categories = data.categories;
      if (data.serverName) globalInviteRegistry[data.inviteCode].serverName = data.serverName;
      if (data.serverIcon) {
        let icon = data.serverIcon;
        if (icon && icon.startsWith('data:image/')) {
          icon = extractDataUrlToUpload(icon, 'server_icon');
          data.serverIcon = icon;
        }
        globalInviteRegistry[data.inviteCode].serverIcon = icon;
      }
      if (data.serverBanner !== undefined) {
        let banner = data.serverBanner;
        if (banner && banner.startsWith('data:image/')) {
          banner = extractDataUrlToUpload(banner, 'server_banner');
          data.serverBanner = banner;
        }
        globalInviteRegistry[data.inviteCode].serverBanner = banner;
      }
      if (Array.isArray(data.roles)) {
        globalInviteRegistry[data.inviteCode].roles = data.roles;
      }
      if (data.isPublic !== undefined) {
        globalInviteRegistry[data.inviteCode].isPublic = data.isPublic === true;
      }
      if (data.description !== undefined) {
        globalInviteRegistry[data.inviteCode].description = data.description;
        globalInviteRegistry[data.inviteCode].serverDescription = data.description;
      }
      saveSyncDb();
      saveInviteRegistryTxt();
      io.emit('server-structure-updated', data);
      io.emit('invite-registry-updated', globalInviteRegistry);
      io.emit('public-servers-updated', globalInviteRegistry);
    }
  });

  // Sunucu Rolleri & Üye Rol Atamaları Canlı Senkronizasyonu
  socket.on('sync-server-roles', (data) => {
    if (data) {
      const code = data.inviteCode || Object.keys(globalInviteRegistry).find(k => globalInviteRegistry[k].serverId === data.serverId) || data.serverId;
      if (code) {
        if (!globalInviteRegistry[code]) {
          globalInviteRegistry[code] = {};
        }
        if (Array.isArray(data.roles)) {
          data.roles.forEach(r => {
            if (r.icon && r.icon.startsWith('data:image/')) {
              r.icon = extractDataUrlToUpload(r.icon, 'role_icon');
            }
          });
          globalInviteRegistry[code].roles = data.roles;
        }
        if (data.memberRoles && typeof data.memberRoles === 'object') {
          globalInviteRegistry[code].memberRoles = data.memberRoles;
        }
        if (data.serverId && !globalInviteRegistry[code].serverId) {
          globalInviteRegistry[code].serverId = data.serverId;
        }
        saveSyncDb();
        saveInviteRegistryTxt();
        const broadcastData = {
          serverId: data.serverId || globalInviteRegistry[code].serverId || code,
          inviteCode: code,
          roles: globalInviteRegistry[code].roles,
          memberRoles: globalInviteRegistry[code].memberRoles
        };
        io.emit('server-roles-updated', broadcastData);
        io.emit('invite-registry-updated', globalInviteRegistry);
      }
    }
  });

  socket.on('user-status-changed', (data) => {
    if (data && data.handle) {
      const h = data.handle.startsWith('@') ? data.handle : '@' + data.handle;
      const cleanH = h.toLowerCase().replace('@', '');
      if (!globalUserDirectory[h]) {
        globalUserDirectory[h] = {
          name: h.replace('@', ''),
          handle: h,
          avatar: '',
          banner: '#999999',
          bio: '',
          followers: 0,
          following: 0,
          status: { type: data.type || 'online', text: data.text || '' }
        };
      } else {
        globalUserDirectory[h].status = { type: data.type || 'online', text: data.text || '' };
      }

      if (data.type === 'invisible' || data.type === 'offline') {
        activeOnlineHandles.delete(cleanH);
      } else {
        activeOnlineHandles.add(cleanH);
      }

      saveSyncDb();
      io.emit('user-directory-updated', globalUserDirectory);
      io.emit('online-users-updated', Array.from(activeOnlineHandles));
      socket.broadcast.emit('user-status-updated', { handle: h, ...data });
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Ayrıldı: ${socket.id}`);
    const cleanH = socketHandleMap.get(socket.id);
    socketHandleMap.delete(socket.id);
    if (cleanH) {
      const stillConnected = Array.from(socketHandleMap.values()).includes(cleanH);
      if (!stillConnected) {
        activeOnlineHandles.delete(cleanH);
      }
      io.emit('online-users-updated', Array.from(activeOnlineHandles));
    }
    let changed = false;
    Object.keys(globalVoiceRooms).forEach(chId => {
      const before = globalVoiceRooms[chId].length;
      globalVoiceRooms[chId] = globalVoiceRooms[chId].filter(u => u.socketId !== socket.id);
      if (globalVoiceRooms[chId].length !== before) changed = true;
    });
    if (changed) {
      io.emit('voice-users-updated', globalVoiceRooms);
    }
  });
});

// ── MULTI-PORT SERVER ENGINE (3000: Tarayıcı, 3001: Uygulama, 3002-3005: Farklı Tarayıcılar) ──
const PORTS = [3000, 3001, 3002, 3003, 3004, 3005];
const serverInstances = [server];

for (let i = 1; i < PORTS.length; i++) {
  const s = http.createServer(app);
  io.attach(s);
  serverInstances.push(s);
}

PORTS.forEach((port, idx) => {
  const srv = serverInstances[idx];
  srv.listen(port, () => {
    console.log(`[Ziorse Server] Port ${port} hazır -> http://localhost:${port}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`[Ziorse Server] Port ${port} meşgul, diğer portlar çalışmaya devam ediyor.`);
    } else {
      console.error(`[Ziorse Server] Port ${port} hatası:`, err.message);
    }
  });
});
