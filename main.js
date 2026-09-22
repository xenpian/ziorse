const { app, BrowserWindow, Tray, Menu, ipcMain, Notification, shell } = require('electron');
const path = require('path');
const { fork } = require('child_process');
const fs = require('fs');

let mainWindow = null;
let tray = null;
let serverProcess = null;

// Start Server Child Process
let isAppQuitting = false;
let syncProcess = null;

function startBackendServer() {
  const serverPath = path.join(__dirname, 'server.js');
  serverProcess = fork(serverPath);
  serverProcess.on('message', (msg) => {
    console.log('[Server Process Msg]:', msg);
  });
  serverProcess.on('exit', (code) => {
    console.log(`[Server Process] Çıkış yaptı (kod: ${code})`);
    if (!isAppQuitting) {
      console.log('[Server Process] Yeniden başlatılıyor...');
      setTimeout(startBackendServer, 1000);
    }
  });
}

function startGitHubAutoSync() {
  const syncScript = path.join(__dirname, 'scripts/github-auto-sync.js');
  if (fs.existsSync(syncScript)) {
    syncProcess = fork(syncScript);
    syncProcess.on('exit', (code) => {
      if (!isAppQuitting) {
        setTimeout(startGitHubAutoSync, 3000);
      }
    });
  }
}

// ══════════════════════════════════════════════════════════════════
// 1000-MESSAGE CHUNKED TXT DATABASE ENGINE
// ══════════════════════════════════════════════════════════════════
const CHUNK_SIZE = 1000;
const DB_DIR = path.join(__dirname, 'database_txt');
const POSTS_DIR = path.join(DB_DIR, 'posts');
const DMS_DIR = path.join(DB_DIR, 'dms');
const SYSTEM_DIR = path.join(DB_DIR, 'system');

function ensureDbDirs() {
  [DB_DIR, POSTS_DIR, DMS_DIR, SYSTEM_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

let memoryStore = null;
let saveDebounceTimer = null;

// Read & assemble from 1000-message .txt chunk files
function readPersistentStore() {
  if (memoryStore !== null) return memoryStore;
  ensureDbDirs();
  memoryStore = {};

  // Check legacy migration first
  const legacyPath1 = path.join(app.getPath('userData'), 'ziorse-persistent-store.json');
  const legacyPath2 = path.join(__dirname, 'ziorse-data.json');

  let legacyData = null;
  try {
    if (fs.existsSync(legacyPath1)) {
      legacyData = JSON.parse(fs.readFileSync(legacyPath1, 'utf8'));
    } else if (fs.existsSync(legacyPath2)) {
      legacyData = JSON.parse(fs.readFileSync(legacyPath2, 'utf8'));
    }
  } catch (e) { }

  if (legacyData) {
    console.log('[TxtDatabase] Eski veritabanı bulundu, 1000 mesajlık TXT dosyalarına aktarılıyor...');
    memoryStore = legacyData;
    flushPersistentStore(); // Immediately writes to chunked txt files

    // Delete legacy files to free space and finalize transition
    try { if (fs.existsSync(legacyPath1)) fs.unlinkSync(legacyPath1); } catch { }
    try { if (fs.existsSync(legacyPath2)) fs.unlinkSync(legacyPath2); } catch { }
    console.log('[TxtDatabase] Eski JSON dosyaları silindi, TXT parçalı veritabanı aktif!');
    return memoryStore;
  }

  // 1. Read Posts from posts_chunk_*.txt
  try {
    const postFiles = fs.readdirSync(POSTS_DIR)
      .filter(f => f.startsWith('posts_chunk_') && f.endsWith('.txt'))
      .sort();

    let allPosts = [];
    for (const file of postFiles) {
      const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8').trim();
      if (!content) continue;
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          allPosts.push(JSON.parse(trimmed));
        } catch { }
      }
    }
    if (allPosts.length > 0) {
      memoryStore['ziorse_real_posts_v14'] = allPosts;
    }
  } catch (err) {
    console.error('[TxtDatabase] Error reading posts chunks:', err.message);
  }

  // 2. Read DMs from dms_chunk_*.txt
  try {
    const dmFiles = fs.readdirSync(DMS_DIR)
      .filter(f => f.startsWith('dms_chunk_') && f.endsWith('.txt'))
      .sort();

    let allThreads = [];
    for (const file of dmFiles) {
      const content = fs.readFileSync(path.join(DMS_DIR, file), 'utf8').trim();
      if (!content) continue;
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          allThreads.push(JSON.parse(trimmed));
        } catch { }
      }
    }
    if (allThreads.length > 0) {
      memoryStore['ziorse_real_dms_v14'] = allThreads;
    }
  } catch (err) {
    console.error('[TxtDatabase] Error reading DM chunks:', err.message);
  }

  // 3. Read System metadata files
  try {
    const sysFiles = fs.readdirSync(SYSTEM_DIR).filter(f => f.endsWith('.txt'));
    for (const file of sysFiles) {
      const key = decodeURIComponent(file.replace(/\.txt$/, ''));
      const content = fs.readFileSync(path.join(SYSTEM_DIR, file), 'utf8');
      try {
        memoryStore[key] = JSON.parse(content);
      } catch {
        memoryStore[key] = content;
      }
    }
  } catch (err) {
    console.error('[TxtDatabase] Error reading system txt files:', err.message);
  }

  return memoryStore;
}

// Optimized Persistent Store Engine with Dirty Key Tracking & Async Non-blocking I/O
const dirtyKeys = new Set();

async function flushPersistentStoreAsync() {
  if (!memoryStore) return;
  ensureDbDirs();

  const keysToSave = new Set(dirtyKeys);
  dirtyKeys.clear();
  if (keysToSave.size === 0) return;

  const writePromises = [];

  // 1. Save Posts if dirty
  if (keysToSave.has('ziorse_real_posts_v14')) {
    const posts = Array.isArray(memoryStore['ziorse_real_posts_v14'])
      ? memoryStore['ziorse_real_posts_v14']
      : (typeof memoryStore['ziorse_real_posts_v14'] === 'string'
        ? (() => { try { return JSON.parse(memoryStore['ziorse_real_posts_v14']); } catch { return []; } })()
        : []);

    if (posts.length > 0) {
      const totalChunks = Math.ceil(posts.length / CHUNK_SIZE);
      for (let c = 0; c < totalChunks; c++) {
        const chunkPosts = posts.slice(c * CHUNK_SIZE, (c + 1) * CHUNK_SIZE);
        const chunkNum = String(c + 1).padStart(4, '0');
        const filename = `posts_chunk_${chunkNum}.txt`;
        const fileContent = chunkPosts.map(p => JSON.stringify(p)).join('\n');
        writePromises.push(fs.promises.writeFile(path.join(POSTS_DIR, filename), fileContent, 'utf8').catch(() => {}));
      }
    }
  }

  // 2. Save DMs if dirty
  if (keysToSave.has('ziorse_real_dms_v14')) {
    const dms = memoryStore['ziorse_real_dms_v14'];
    if (dms) {
      const dmList = Array.isArray(dms) ? dms : (typeof dms === 'string' ? (() => { try { return JSON.parse(dms); } catch { return []; } })() : []);
      if (dmList.length > 0) {
        const dmChunks = Math.ceil(dmList.length / CHUNK_SIZE);
        for (let c = 0; c < dmChunks; c++) {
          const chunkDms = dmList.slice(c * CHUNK_SIZE, (c + 1) * CHUNK_SIZE);
          const chunkNum = String(c + 1).padStart(4, '0');
          const filename = `dms_chunk_${chunkNum}.txt`;
          const fileContent = chunkDms.map(d => JSON.stringify(d)).join('\n');
          writePromises.push(fs.promises.writeFile(path.join(DMS_DIR, filename), fileContent, 'utf8').catch(() => {}));
        }
      }
    }
  }

  // 3. Save only modified system metadata keys
  for (const key of keysToSave) {
    if (key === 'ziorse_real_posts_v14' || key === 'ziorse_real_dms_v14') continue;
    const val = memoryStore[key];
    if (val === undefined) continue;
    const safeKey = encodeURIComponent(key);
    const filename = `${safeKey}.txt`;
    const strVal = typeof val === 'object' && val !== null ? JSON.stringify(val, null, 2) : String(val);
    writePromises.push(fs.promises.writeFile(path.join(SYSTEM_DIR, filename), strVal, 'utf8').catch(() => {}));
  }

  await Promise.all(writePromises).catch(() => {});
}

function flushPersistentStore() {
  if (saveDebounceTimer) {
    clearTimeout(saveDebounceTimer);
    saveDebounceTimer = null;
  }
  if (!memoryStore) return;
  ensureDbDirs();

  // Full flush for shutdown
  const posts = Array.isArray(memoryStore['ziorse_real_posts_v14'])
    ? memoryStore['ziorse_real_posts_v14']
    : [];
  if (posts.length > 0) {
    const totalChunks = Math.ceil(posts.length / CHUNK_SIZE);
    for (let c = 0; c < totalChunks; c++) {
      const chunkPosts = posts.slice(c * CHUNK_SIZE, (c + 1) * CHUNK_SIZE);
      const chunkNum = String(c + 1).padStart(4, '0');
      try {
        fs.writeFileSync(path.join(POSTS_DIR, `posts_chunk_${chunkNum}.txt`), chunkPosts.map(p => JSON.stringify(p)).join('\n'), 'utf8');
      } catch { }
    }
  }

  const dms = memoryStore['ziorse_real_dms_v14'];
  if (dms && Array.isArray(dms) && dms.length > 0) {
    const dmChunks = Math.ceil(dms.length / CHUNK_SIZE);
    for (let c = 0; c < dmChunks; c++) {
      const chunkDms = dms.slice(c * CHUNK_SIZE, (c + 1) * CHUNK_SIZE);
      const chunkNum = String(c + 1).padStart(4, '0');
      try {
        fs.writeFileSync(path.join(DMS_DIR, `dms_chunk_${chunkNum}.txt`), chunkDms.map(d => JSON.stringify(d)).join('\n'), 'utf8');
      } catch { }
    }
  }

  for (const [key, val] of Object.entries(memoryStore)) {
    if (key === 'ziorse_real_posts_v14' || key === 'ziorse_real_dms_v14') continue;
    try {
      const strVal = typeof val === 'object' && val !== null ? JSON.stringify(val, null, 2) : String(val);
      fs.writeFileSync(path.join(SYSTEM_DIR, `${encodeURIComponent(key)}.txt`), strVal, 'utf8');
    } catch { }
  }
  dirtyKeys.clear();
}

function schedulePersistentStoreSave(key) {
  if (key) dirtyKeys.add(key);
  if (saveDebounceTimer) clearTimeout(saveDebounceTimer);
  saveDebounceTimer = setTimeout(() => {
    saveDebounceTimer = null;
    flushPersistentStoreAsync();
  }, 400);
}

// Synchronous Store Bridge (0ms Instant RAM IPC)
ipcMain.on('store-get-sync', (event, key) => {
  const store = readPersistentStore();
  event.returnValue = store[key] !== undefined ? store[key] : null;
});

ipcMain.on('store-set-sync', (event, key, val) => {
  const store = readPersistentStore();
  if (val === null || val === undefined) {
    delete store[key];
    const safeKey = encodeURIComponent(key);
    const filename = `${safeKey}.txt`;
    const filePath = path.join(SYSTEM_DIR, filename);
    try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (e) { }
    dirtyKeys.delete(key);
  } else {
    store[key] = val;
    schedulePersistentStoreSave(key);
  }
  event.returnValue = true;
});

ipcMain.on('store-get-all-sync', (event) => {
  event.returnValue = readPersistentStore();
});

// Async Store Bridge
ipcMain.handle('store-get', (event, key) => {
  const store = readPersistentStore();
  return store[key] !== undefined ? store[key] : null;
});

ipcMain.handle('store-set', (event, key, val) => {
  const store = readPersistentStore();
  if (val === null || val === undefined) {
    delete store[key];
    const safeKey = encodeURIComponent(key);
    const filename = `${safeKey}.txt`;
    const filePath = path.join(SYSTEM_DIR, filename);
    try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (e) { }
    dirtyKeys.delete(key);
  } else {
    store[key] = val;
    schedulePersistentStoreSave(key);
  }
  return true;
});

ipcMain.handle('store-get-all', () => {
  return readPersistentStore();
});

// Avatar Frames Discovery & Management
const AVATAR_FRAMES_DIR = path.join(__dirname, 'src', 'assets', 'avatar-frames');
const ROOT_FRAMES_DIR = path.join(__dirname, 'assets', 'avatar-frames');
if (!fs.existsSync(AVATAR_FRAMES_DIR)) fs.mkdirSync(AVATAR_FRAMES_DIR, { recursive: true });
if (!fs.existsSync(ROOT_FRAMES_DIR)) fs.mkdirSync(ROOT_FRAMES_DIR, { recursive: true });

function syncFramesDirs() {
  try {
    if (fs.existsSync(ROOT_FRAMES_DIR)) {
      const rf = fs.readdirSync(ROOT_FRAMES_DIR).filter(f => f.toLowerCase().endsWith('.png'));
      rf.forEach(file => {
        const dest = path.join(AVATAR_FRAMES_DIR, file);
        if (!fs.existsSync(dest)) fs.copyFileSync(path.join(ROOT_FRAMES_DIR, file), dest);
      });
    }
    if (fs.existsSync(AVATAR_FRAMES_DIR)) {
      const af = fs.readdirSync(AVATAR_FRAMES_DIR).filter(f => f.toLowerCase().endsWith('.png'));
      af.forEach(file => {
        const dest = path.join(ROOT_FRAMES_DIR, file);
        if (!fs.existsSync(dest)) fs.copyFileSync(path.join(AVATAR_FRAMES_DIR, file), dest);
      });
    }
  } catch (e) { }
}

ipcMain.handle('get-avatar-frames', () => {
  syncFramesDirs();
  try {
    if (!fs.existsSync(AVATAR_FRAMES_DIR)) return [];
    const files = fs.readdirSync(AVATAR_FRAMES_DIR).filter(f => f.toLowerCase().endsWith('.png'));
    return files.map(file => ({
      id: file,
      name: path.parse(file).name.replace(/[-_]/g, ' '),
      url: `assets/avatar-frames/${file}`,
      filename: file
    }));
  } catch (e) {
    return [];
  }
});

ipcMain.handle('open-avatar-frames-folder', () => {
  syncFramesDirs();
  if (fs.existsSync(ROOT_FRAMES_DIR)) {
    shell.openPath(ROOT_FRAMES_DIR);
  } else if (fs.existsSync(AVATAR_FRAMES_DIR)) {
    shell.openPath(AVATAR_FRAMES_DIR);
  }
  return true;
});

const configPath = path.join(app.getPath('userData'), 'window-bounds.json');

function loadWindowBounds() {
  try {
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
  } catch (e) { }
  return { width: 1360, height: 760, x: undefined, y: undefined };
}

function saveWindowBounds(bounds) {
  try {
    fs.writeFileSync(configPath, JSON.stringify(bounds));
  } catch (e) { }
}

function createMainWindow() {
  const bounds = loadWindowBounds();

  mainWindow = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    minWidth: 1000,
    minHeight: 680,
    frame: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#ffffff00',
      symbolColor: '#0f172a',
      height: 58
    },
    backgroundColor: '#ffffff',
    title: 'Ziorse Social',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webAudio: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'src/index.html'));
  mainWindow.webContents.openDevTools();
  mainWindow.on('resize', () => saveWindowBounds(mainWindow.getBounds()));
  mainWindow.on('move', () => saveWindowBounds(mainWindow.getBounds()));
  mainWindow.on('maximize', () => mainWindow.webContents.send('window-maximized-state', true));
  mainWindow.on('unmaximize', () => mainWindow.webContents.send('window-maximized-state', false));

  mainWindow.on('close', (e) => {
    if (!app.isQuitting && tray) {
      e.preventDefault();
      mainWindow.hide();
    } else if (!app.isQuitting && !tray) {
      app.isQuitting = true;
      if (serverProcess) serverProcess.kill();
      app.quit();
    }
    return false;
  });
}

// System Tray Configuration
function createSystemTray() {
  try {
    let iconPath = path.join(__dirname, 'src/assets/icon.png');
    if (!fs.existsSync(iconPath)) {
      iconPath = path.join(__dirname, 'src/logo.png');
    }
    if (!fs.existsSync(iconPath)) {
      iconPath = path.join(__dirname, 'logo.png');
    }
    if (fs.existsSync(iconPath)) {
      tray = new Tray(iconPath);

      const contextMenu = Menu.buildFromTemplate([
        { label: 'Ziorse\'u Göster', click: () => { if (mainWindow) { mainWindow.show(); mainWindow.focus(); } } },
        { label: 'Gizle', click: () => { if (mainWindow) mainWindow.hide(); } },
        { type: 'separator' },
        {
          label: 'Çıkış', click: () => {
            isAppQuitting = true;
            app.isQuitting = true;
            if (serverProcess) serverProcess.kill();
            app.quit();
          }
        }
      ]);

      tray.setToolTip('Ziorse Desktop Social Network');
      tray.setContextMenu(contextMenu);
      tray.on('double-click', () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      });
    }
  } catch (err) {
    console.log('Tray init notice:', err.message);
  }
}

// Electron Donanım Hızlandırması & Web Audio Ayarları
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('ignore-gpu-blocklist');

// Native Engine Bridge
let nativeEngine = null;
try {
  nativeEngine = require('./native-engine');
  console.log('⚡ [Main] Native Engine Bridge aktif. isNative:', nativeEngine.isNative);
} catch (e) {
  console.log('ℹ️ [Main] Native Engine yüklenemedi:', e.message);
}

app.whenReady().then(() => {
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.ziorse.desktop');
  }
  startBackendServer();
  startGitHubAutoSync();
  createMainWindow();
  createSystemTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

// ── IPC HANDLERS ─────────────────────────────────────────────
// Native Engine IPC Bridge
ipcMain.handle('native-compute-physics', (event, nodes, config) => {
  if (nativeEngine?.computePhysics) {
    return nativeEngine.computePhysics(nodes, config);
  }
  return nodes;
});

ipcMain.handle('native-fast-json', (event, jsonStr) => {
  if (nativeEngine?.fastJsonCompact) {
    return nativeEngine.fastJsonCompact(jsonStr);
  }
  return jsonStr;
});

ipcMain.handle('native-process-audio', (event, samples, threshold) => {
  if (nativeEngine?.processAudio) {
    return nativeEngine.processAudio(samples, threshold);
  }
  return null;
});
// Native Notifications
ipcMain.on('show-notification', (event, data) => {
  if (Notification.isSupported()) {
    const notif = new Notification({
      title: data.title || 'Ziorse',
      body: data.body || '',
      silent: false
    });
    notif.on('click', () => {
      if (mainWindow) { mainWindow.show(); mainWindow.focus(); }
      if (mainWindow) mainWindow.webContents.send('notification-clicked', data);
    });
    notif.show();
  }
});

// Window Controls
ipcMain.on('window-minimize', () => mainWindow && mainWindow.minimize());
ipcMain.on('window-maximize', () => {
  if (!mainWindow) return;
  mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
});
ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.hide();
});

app.on('before-quit', () => {
  isAppQuitting = true;
  app.isQuitting = true;
  flushPersistentStore();
  if (serverProcess) serverProcess.kill();
  if (syncProcess) syncProcess.kill();
});

app.on('window-all-closed', () => {
  flushPersistentStore();
  if (process.platform !== 'darwin') {
    if (serverProcess) serverProcess.kill();
    if (syncProcess) syncProcess.kill();
    app.quit();
  }
});
