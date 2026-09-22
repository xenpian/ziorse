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

// ── PERSISTENT GLOBAL SYNC STORES & DB ───────────────────────
const dbFilePath = path.join(__dirname, 'server-sync-db.json');

let serverPosts = [];
let globalInviteRegistry = {};
let globalFriendRequests = {}; // targetHandle -> array of requests
let globalServerMembers = {};  // inviteCode -> array of member objects
let globalVoiceRooms = {};     // channelId -> array of { socketId, handle, name, avatar, isSpeaking, isMuted, isDeafened }
let globalAccounts = [
  {
    name: 'Kurtv',
    handle: '@kurtv_dev',
    email: 'kurtv@ziorse.dev',
    password: '123',
    avatar: 'https://i.imgur.com/w3OhOmW.jpeg',
    banner: '#999999',
    bio: 'Ziorse Creator'
  }
];
let globalUserDirectory = {
  '@kurtv_dev': {
    name: 'Kurtv',
    handle: '@kurtv_dev',
    avatar: 'https://i.imgur.com/w3OhOmW.jpeg',
    banner: '#999999',
    bio: 'Ziorse Developer',
    followers: 128,
    following: 42,
    status: { type: 'online', text: 'Kod yazıyor...' }
  }
};

function loadSyncDb() {
  try {
    if (fs.existsSync(dbFilePath)) {
      const content = fs.readFileSync(dbFilePath, 'utf8');
      const data = JSON.parse(content);
      if (Array.isArray(data.accounts) && data.accounts.length > 0) {
        globalAccounts = data.accounts;
      }
      if (data.userDirectory && typeof data.userDirectory === 'object') {
        globalUserDirectory = Object.assign({}, globalUserDirectory, data.userDirectory);
      }
      if (data.inviteRegistry && typeof data.inviteRegistry === 'object') {
        globalInviteRegistry = data.inviteRegistry;
      }
      if (data.serverMembers && typeof data.serverMembers === 'object') {
        globalServerMembers = data.serverMembers;
      }
      if (data.friendRequests && typeof data.friendRequests === 'object') {
        globalFriendRequests = data.friendRequests;
      }
      if (Array.isArray(data.posts) && data.posts.length > 0) {
        serverPosts = data.posts;
      }

    // Merge accounts from txt database
    const txtAccPath = path.join(__dirname, 'database_txt', 'system', 'ziorse_accounts.txt');
    if (fs.existsSync(txtAccPath)) {
      try {
        const raw = JSON.parse(fs.readFileSync(txtAccPath, 'utf8'));
        if (Array.isArray(raw)) {
          raw.forEach(acc => {
            if (acc && acc.handle && !globalAccounts.some(a => (a.handle && a.handle.toLowerCase() === acc.handle.toLowerCase()) || (a.email && acc.email && a.email.toLowerCase() === acc.email.toLowerCase()))) {
              globalAccounts.push(acc);
            }
          });
        }
      } catch (e) { }
    }

      // Reconcile and ensure all server members (owners, past posters, registry members) are preserved in globalServerMembers
      Object.keys(globalInviteRegistry).forEach(code => {
        if (!globalServerMembers[code]) globalServerMembers[code] = [];
        const info = globalInviteRegistry[code];
        if (info.ownerHandle) {
          const oHandle = info.ownerHandle.startsWith('@') ? info.ownerHandle : '@' + info.ownerHandle;
          const cleanH = oHandle.toLowerCase();
          if (!globalServerMembers[code].some(m => m.handle.toLowerCase() === cleanH)) {
            const userProf = globalUserDirectory[oHandle] || globalUserDirectory['@' + oHandle.replace('@', '')] || {};
            globalServerMembers[code].unshift({
              handle: oHandle,
              name: userProf.name || info.ownerName || oHandle.replace('@', ''),
              avatar: userProf.avatar || info.ownerAvatar || ''
            });
          }
        }
        if (Array.isArray(info.members)) {
          info.members.forEach(im => {
            if (im && im.handle) {
              const imHandle = im.handle.startsWith('@') ? im.handle : '@' + im.handle;
              const cleanH = imHandle.toLowerCase();
              if (!globalServerMembers[code].some(m => m.handle.toLowerCase() === cleanH)) {
                const userProf = globalUserDirectory[imHandle] || globalUserDirectory['@' + imHandle.replace('@', '')] || {};
                globalServerMembers[code].push({
                  handle: imHandle,
                  name: userProf.name || im.name || imHandle.replace('@', ''),
                  avatar: userProf.avatar || im.avatar || ''
                });
              }
            }
          });
        }
      });

      // Extract server members from posts with serverChannelKey
      serverPosts.forEach(p => {
        if (p && p.handle && p.serverChannelKey) {
          const parts = p.serverChannelKey.split(':');
          const serverCode = parts[0];
          if (serverCode && globalInviteRegistry[serverCode]) {
            if (!globalServerMembers[serverCode]) globalServerMembers[serverCode] = [];
            const pHandle = p.handle.startsWith('@') ? p.handle : '@' + p.handle;
            const cleanH = pHandle.toLowerCase();
            if (!globalServerMembers[serverCode].some(m => m.handle.toLowerCase() === cleanH)) {
              const userProf = globalUserDirectory[pHandle] || globalUserDirectory['@' + pHandle.replace('@', '')] || {};
              globalServerMembers[serverCode].push({
                handle: pHandle,
                name: userProf.name || p.name || pHandle.replace('@', ''),
                avatar: userProf.avatar || p.avatar || ''
              });
            }
          }
        }
      });

      // Ensure latest names & avatars from userDirectory
      Object.keys(globalServerMembers).forEach(code => {
        globalServerMembers[code].forEach(m => {
          if (m && m.handle) {
            const h = m.handle.startsWith('@') ? m.handle : '@' + m.handle;
            const prof = globalUserDirectory[h] || globalUserDirectory['@' + h.replace('@', '')];
            if (prof) {
              if (prof.name) m.name = prof.name;
              if (prof.avatar) m.avatar = prof.avatar;
            }
          }
        });
        if (globalInviteRegistry[code]) {
          globalInviteRegistry[code].memberCount = Math.max(globalServerMembers[code].length, globalInviteRegistry[code].memberCount || 1);
        }
      });

      // Ensure all accounts from globalAccounts are in globalUserDirectory with their latest avatar and banner
      globalAccounts.forEach(acc => {
        if (acc && acc.handle) {
          const h = acc.handle.startsWith('@') ? acc.handle : '@' + acc.handle;
          if (!globalUserDirectory[h]) {
            globalUserDirectory[h] = {
              name: acc.name || h.replace('@', ''),
              handle: h,
              avatar: acc.avatar || '',
              banner: acc.banner || '#999999',
              bio: acc.bio || '',
              followers: 0,
              following: 0,
              status: { type: 'offline', text: '' }
            };
          } else {
            if (acc.avatar && (!globalUserDirectory[h].avatar || globalUserDirectory[h].avatar.length < 50)) {
              globalUserDirectory[h].avatar = acc.avatar;
            }
            if (acc.banner && (!globalUserDirectory[h].banner || globalUserDirectory[h].banner === '#999999')) {
              globalUserDirectory[h].banner = acc.banner;
            }
            if (acc.name && !globalUserDirectory[h].name) {
              globalUserDirectory[h].name = acc.name;
            }
            if (acc.bio && !globalUserDirectory[h].bio) {
              globalUserDirectory[h].bio = acc.bio;
            }
          }
        }
      });

      console.log(`[Ziorse Server DB] Yüklendi: ${globalAccounts.length} hesap, ${Object.keys(globalUserDirectory).length} kullanıcı dizini, ${Object.keys(globalServerMembers).length} sunucu üye havuzu.`);
    }
  } catch (err) {
    console.error('[Ziorse Server DB] DB Okuma Hatası:', err);
  }
}

function extractDataUrlToUpload(dataUrl, prefix = 'avatar') {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) return dataUrl;
  try {
    const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches) return dataUrl;
    const ext = matches[1] === 'jpeg' ? 'jpg' : (matches[1] || 'png');
    const base64Data = matches[2];
    if (base64Data.length < 5000) return dataUrl;
    const filename = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
    return `http://localhost:3000/uploads/${filename}`;
  } catch (err) {
    console.error('[Upload] Failed to extract dataUrl to upload:', err);
    return dataUrl;
  }
}

let saveDbTimer = null;
function saveSyncDb() {
  if (saveDbTimer) clearTimeout(saveDbTimer);
  saveDbTimer = setTimeout(() => {
    saveDbTimer = null;
    try {
      const data = {
        accounts: globalAccounts,
        userDirectory: globalUserDirectory,
        inviteRegistry: globalInviteRegistry,
        serverMembers: globalServerMembers,
        friendRequests: globalFriendRequests,
        posts: serverPosts
      };
      fs.writeFile(dbFilePath, JSON.stringify(data, null, 2), 'utf8', () => { });
    } catch (err) {
      console.error('[Ziorse Server DB] DB Yazma Hatası:', err);
    }
  }, 150);
}

loadSyncDb();

// ── AUTH & ACCOUNTS REST API ───────────────────────────────────
app.get('/api/accounts', (req, res) => {
  res.json({ accounts: globalAccounts });
});

app.post(['/api/register', '/api/auth/register'], (req, res) => {
  const { name, handle, email, password, avatar, banner, bio } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'E-posta ve şifre zorunludur.' });
  const cleanHandle = handle ? (handle.startsWith('@') ? handle : '@' + handle) : ('@' + email.split('@')[0]);
  const cleanEmail = email.toLowerCase().trim();
  const cleanPass = String(password).trim();

  let acc = globalAccounts.find(a => a.email.toLowerCase() === cleanEmail || a.handle.toLowerCase() === cleanHandle.toLowerCase());
  if (acc) {
    return res.status(400).json({ error: 'Bu kullanıcı adı veya e-posta adresi zaten kullanılıyor.' });
  }

  acc = {
    name: name || cleanEmail.split('@')[0],
    handle: cleanHandle,
    email: cleanEmail,
    password: cleanPass,
    avatar: avatar || '',
    banner: banner || '#999999',
    bio: bio || ''
  };
  globalAccounts.push(acc);

  globalUserDirectory[cleanHandle] = {
    name: acc.name,
    handle: cleanHandle,
    avatar: acc.avatar || '',
    banner: acc.banner || '#999999',
    bio: acc.bio || '',
    followers: 0,
    following: 0,
    status: { type: 'online', text: '' }
  };

  saveSyncDb();
  io.emit('accounts-updated', globalAccounts);
  io.emit('user-directory-updated', globalUserDirectory);
  const token = jwt.sign({ handle: acc.handle, email: acc.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, account: acc, user: acc, token });
});

app.post(['/api/login', '/api/auth/login'], (req, res) => {
  const { identifier, email, handle, password } = req.body;
  const loginId = (identifier || email || handle || '').trim().toLowerCase();
  const cleanId = loginId.replace('@', '');
  const pass = String(password || '').trim();
  if (!loginId || !pass) return res.status(400).json({ error: 'Giriş bilgileri eksik.' });

  const found = globalAccounts.find(a =>
    (a.email && a.email.toLowerCase() === loginId) ||
    (a.handle && a.handle.toLowerCase() === loginId) ||
    (a.handle && a.handle.toLowerCase().replace('@', '') === cleanId)
  );

  if (!found) {
    return res.status(404).json({ error: 'Bu kullanıcı adı veya e-posta ile kayıtlı hesap bulunamadı.' });
  }
  if (found.password !== pass) {
    return res.status(401).json({ error: 'Şifre yanlış.' });
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
  res.json({ success: true, account: found, user: found, token });
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
  res.json({ success: true, registry: globalInviteRegistry });
});

// ── FILE UPLOAD ENDPOINT ──────────────────────────────────────
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Dosya yüklenemedi.' });
  const fileUrl = `http://localhost:3000/uploads/${req.file.filename}`;
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

// ── SOCKET.IO & WEBRTC SIGNALING ─────────────────────────────
io.on('connection', (socket) => {
  console.log(`[Socket] Bağlandı: ${socket.id}`);

  // Yeni bağlanan istemciye güncel verileri ilet
  socket.emit('invite-registry-updated', globalInviteRegistry);
  socket.emit('user-directory-updated', globalUserDirectory);
  socket.emit('server-members-updated', globalServerMembers);
  socket.emit('voice-users-updated', globalVoiceRooms);
  socket.emit('sync-all-posts', serverPosts);
  socket.emit('online-users-updated', Array.from(activeOnlineHandles));

  socket.on('sync-user-profile', (data) => {
    if (data && data.handle) {
      const h = data.handle.startsWith('@') ? data.handle : '@' + data.handle;
      const cleanH = h.toLowerCase();
      socketHandleMap.set(socket.id, cleanH);
      activeOnlineHandles.add(cleanH);
      socket.join(cleanH);
      socket.join(cleanH.replace('@', ''));

      if (data.avatar) data.avatar = extractDataUrlToUpload(data.avatar, 'avatar');
      if (data.banner && data.banner.startsWith('data:image/')) data.banner = extractDataUrlToUpload(data.banner, 'banner');

      globalUserDirectory[h] = {
        ...(globalUserDirectory[h] || {}),
        ...data,
        handle: h
      };

      // Also update account in globalAccounts
      const acc = globalAccounts.find(a => a.handle.toLowerCase() === cleanH);
      if (acc) {
        if (data.avatar) acc.avatar = data.avatar;
        if (data.banner) acc.banner = data.banner;
        if (data.name) acc.name = data.name;
        if (data.bio) acc.bio = data.bio;
        if (data.pronouns !== undefined) acc.pronouns = data.pronouns;
        if (data.fontStyle !== undefined) acc.fontStyle = data.fontStyle;
        if (data.nameColor !== undefined) acc.nameColor = data.nameColor;
        if (data.nameEffects !== undefined) acc.nameEffects = data.nameEffects;
        if (data.avatarFrame !== undefined) acc.avatarFrame = data.avatarFrame;
        if (data.profileEffect !== undefined) acc.profileEffect = data.profileEffect;
        if (data.widgets !== undefined) acc.widgets = data.widgets;
      }

      // Üyenin profil fotoğrafı/adı değiştiğinde tüm sunucu üye listelerini güncelle
      Object.keys(globalServerMembers).forEach(invCode => {
        const mIdx = globalServerMembers[invCode].findIndex(m => m.handle.toLowerCase() === cleanH);
        if (mIdx !== -1) {
          if (data.avatar) globalServerMembers[invCode][mIdx].avatar = data.avatar;
          if (data.name) globalServerMembers[invCode][mIdx].name = data.name;
        }
      });
      saveSyncDb();
      io.emit('user-directory-updated', globalUserDirectory);
      io.emit('server-members-updated', globalServerMembers);
      io.emit('online-users-updated', Array.from(activeOnlineHandles));
    }
  });

  // Sunucu Üyeleri Canlı Senkronizasyonu
  socket.on('server-member-joined', (data) => {
    if (data && data.inviteCode && data.member) {
      if (!globalServerMembers[data.inviteCode]) globalServerMembers[data.inviteCode] = [];
      const mHandle = data.member.handle.toLowerCase();
      const idx = globalServerMembers[data.inviteCode].findIndex(m => m.handle.toLowerCase() === mHandle);
      if (idx === -1) {
        globalServerMembers[data.inviteCode].push(data.member);
      } else {
        globalServerMembers[data.inviteCode][idx] = {
          ...globalServerMembers[data.inviteCode][idx],
          ...data.member
        };
      }
      if (globalInviteRegistry[data.inviteCode]) {
        globalInviteRegistry[data.inviteCode].memberCount = globalServerMembers[data.inviteCode].length;
      }
      saveSyncDb();
      io.emit('server-members-updated', globalServerMembers);
      io.emit('invite-registry-updated', globalInviteRegistry);
      io.emit('server-member-joined-event', {
        inviteCode: data.inviteCode,
        member: data.member,
        members: globalServerMembers[data.inviteCode]
      });
    }
  });

  socket.on('sync-my-server-memberships', (items) => {
    if (Array.isArray(items) && items.length > 0) {
      let changed = false;
      items.forEach(it => {
        if (it && it.inviteCode) {
          if (!globalServerMembers[it.inviteCode]) globalServerMembers[it.inviteCode] = [];

          if (it.member && it.member.handle) {
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
              if (mem && mem.handle) {
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

    if (cleanTo) {
      io.to(toH).to(cleanTo).emit('receive-dm-live', data);
    }
    if (cleanFrom && cleanFrom !== cleanTo) {
      io.to(fromH).to(cleanFrom).emit('receive-dm-live', data);
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
      saveSyncDb();
      io.emit('invite-registry-updated', globalInviteRegistry);
      io.emit('server-members-updated', globalServerMembers);
    }
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
      globalFriendRequests[th].push({
        handle: data.from.handle,
        name: data.from.name,
        avatar: data.from.avatar,
        firstMessage: data.firstMessage || null,
        timestamp: data.timestamp || new Date().toISOString()
      });
      saveSyncDb();
      io.emit('receive-friend-request', { ...data, targetHandle: th });
    }
  });

  socket.on('accept-friend-request', (data) => {
    if (data) {
      io.emit('friend-request-accepted', data);
    }
  });

  socket.on('reject-friend-request', (data) => {
    if (data) {
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
      if (post.codeSnippet && typeof post.codeSnippet === 'string' && post.codeSnippet.length > 8000) {
        post.codeSnippet = post.codeSnippet.substring(0, 8000) + '\n// ... (kod boyutu optimize edildi)';
      }
      if (post.avatar && post.avatar.startsWith('data:image/')) {
        post.avatar = extractDataUrlToUpload(post.avatar, 'avatar');
      }
      if (post.image && post.image.startsWith('data:image/')) {
        post.image = extractDataUrlToUpload(post.image, 'post');
      }
      serverPosts = serverPosts.filter(p => p.id !== post.id);
      serverPosts.unshift(post);
      saveSyncDb();
      io.emit('new-post-event', post);
    }
  });

  socket.on('delete-post-broadcast', (data) => {
    if (data && data.id) {
      serverPosts = serverPosts.filter(p => p.id !== data.id);
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
      if (data.memberRoles && typeof data.memberRoles === 'object') {
        globalInviteRegistry[data.inviteCode].memberRoles = data.memberRoles;
      }
      saveSyncDb();
      io.emit('server-structure-updated', data);
      io.emit('invite-registry-updated', globalInviteRegistry);
    }
  });

  // Sunucu Rolleri & Üye Rol Atamaları Canlı Senkronizasyonu
  socket.on('sync-server-roles', (data) => {
    if (data && data.inviteCode) {
      if (!globalInviteRegistry[data.inviteCode]) {
        globalInviteRegistry[data.inviteCode] = {};
      }
      if (Array.isArray(data.roles)) {
        globalInviteRegistry[data.inviteCode].roles = data.roles;
      }
      if (data.memberRoles && typeof data.memberRoles === 'object') {
        globalInviteRegistry[data.inviteCode].memberRoles = data.memberRoles;
      }
      saveSyncDb();
      io.emit('server-roles-updated', data);
      io.emit('invite-registry-updated', globalInviteRegistry);
    }
  });

  socket.on('user-status-changed', (data) => {
    if (data && data.handle) {
      const h = data.handle.startsWith('@') ? data.handle : '@' + data.handle;
      const cleanH = h.toLowerCase();
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
    const handle = socketHandleMap.get(socket.id);
    socketHandleMap.delete(socket.id);
    if (handle) {
      const stillConnected = Array.from(socketHandleMap.values()).includes(handle);
      if (!stillConnected) {
        activeOnlineHandles.delete(handle);
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

const PORT = process.env.PORT || 3000;

function startServer(port) {
  server.listen(port, () => {
    console.log(`[Ziorse Server] Backend & Socket.io http://localhost:${port} üzerinde çalışıyor.`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`[Ziorse Server] Port ${port} meşgul, ${port + 1} deneniyor...`);
      startServer(port + 1);
    } else {
      console.error('[Ziorse Server] Hata:', err);
    }
  });
}

startServer(PORT);
