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
// MYSQL DATABASE ENGINE (gusgon) & LIVE RAM PARITY (0ms Latency)
// ══════════════════════════════════════════════════════════════════
const mysqlDb = require('./mysql-db');

let memoryStore = null;
let saveDebounceTimer = null;
const dirtyKeys = new Set();

function readPersistentStore(forceRefresh = false) {
  if (memoryStore === null || forceRefresh) {
    if (!memoryStore) memoryStore = {};
    // Asynchronous background hydration from MySQL
    mysqlDb.getAllStoreValues().then(storeVals => {
      if (storeVals && typeof storeVals === 'object') {
        memoryStore = Object.assign({}, storeVals, memoryStore);
      }
    }).catch(() => {});
  }
  return memoryStore;
}

// Initial hydration from MySQL
(async () => {
  try {
    await mysqlDb.initDatabase();
    const [storeVals, posts, servers, uDir, accs] = await Promise.all([
      mysqlDb.getAllStoreValues().catch(() => ({})),
      mysqlDb.getAllPosts().catch(() => []),
      mysqlDb.getAllServers().catch(() => ({})),
      mysqlDb.getUserDirectory().catch(() => ({})),
      mysqlDb.getAllAccounts().catch(() => [])
    ]);
    memoryStore = { ...storeVals };
    if (posts && posts.length > 0) memoryStore['ziorse_real_posts_v14'] = posts;
    if (servers && Object.keys(servers).length > 0) memoryStore['ziorse_invite_registry'] = servers;
    if (uDir && Object.keys(uDir).length > 0) memoryStore['ziorse_user_directory'] = uDir;
    if (accs && accs.length > 0) memoryStore['ziorse_accounts'] = accs;
    console.log('[Main Process MySQL (gusgon)] RAM önbellek başarıyla yüklendi.');
  } catch (err) {
    console.warn('[Main Process MySQL] Başlatma uyarısı:', err.message);
  }
})();

async function flushPersistentStoreAsync() {
  if (!memoryStore) return;
  const keysToSave = new Set(dirtyKeys);
  dirtyKeys.clear();
  if (keysToSave.size === 0) return;

  for (const key of keysToSave) {
    if (key === 'ziorse_real_user_v14' || key === 'ziorse_jwt_token' || key === 'ziorse_user' || key === 'ziorse_accounts' || key.startsWith('ziorse_real_servers_v14_')) continue;
    const val = memoryStore[key];
    if (val === undefined || val === null) {
      mysqlDb.deleteStoreValue(key).catch(() => {});
    } else {
      mysqlDb.setStoreValue(key, val).catch(() => {});
    }
  }
}

function flushPersistentStore() {
  if (saveDebounceTimer) {
    clearTimeout(saveDebounceTimer);
    saveDebounceTimer = null;
  }
  flushPersistentStoreAsync();
}

function schedulePersistentStoreSave(key) {
  if (key) dirtyKeys.add(key);
  if (saveDebounceTimer) clearTimeout(saveDebounceTimer);
  saveDebounceTimer = setTimeout(() => {
    saveDebounceTimer = null;
    flushPersistentStoreAsync();
  }, 200);
}

// Electron-Private User Session File (Isolated from browser ports and shared db)
const ELECTRON_USER_SESSION_FILE = path.join(app.getPath('userData'), 'electron_user_session.json');

function getElectronUserSession() {
  try {
    if (fs.existsSync(ELECTRON_USER_SESSION_FILE)) {
      const raw = fs.readFileSync(ELECTRON_USER_SESSION_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch { }
  return null;
}

function setElectronUserSession(val) {
  try {
    if (val === null || val === undefined) {
      if (fs.existsSync(ELECTRON_USER_SESSION_FILE)) fs.unlinkSync(ELECTRON_USER_SESSION_FILE);
    } else {
      fs.writeFileSync(ELECTRON_USER_SESSION_FILE, JSON.stringify(val, null, 2), 'utf8');
    }
  } catch { }
}

// Synchronous Store Bridge (0ms Instant RAM IPC with live MySQL parity)
ipcMain.on('store-get-sync', (event, key) => {
  if (key === 'ziorse_real_user_v14') {
    event.returnValue = getElectronUserSession();
    return;
  }
  const store = readPersistentStore();
  event.returnValue = (store && store[key] !== undefined) ? store[key] : null;
});

ipcMain.on('store-set-sync', (event, key, val) => {
  if (key === 'ziorse_real_user_v14') {
    setElectronUserSession(val);
    event.returnValue = true;
    return;
  }
  const store = readPersistentStore();
  if (val === null || val === undefined) {
    delete store[key];
    dirtyKeys.delete(key);
    if (!key.startsWith('ziorse_real_servers_v14_') && key !== 'ziorse_accounts') {
      mysqlDb.deleteStoreValue(key).catch(() => {});
    }
  } else {
    store[key] = val;
    if (!key.startsWith('ziorse_real_servers_v14_') && key !== 'ziorse_accounts') {
      schedulePersistentStoreSave(key);
    }
  }
  event.returnValue = true;
});

ipcMain.on('store-get-all-sync', (event) => {
  const store = { ...readPersistentStore(true) };
  const u = getElectronUserSession();
  if (u) {
    store['ziorse_real_user_v14'] = u;
  } else {
    delete store['ziorse_real_user_v14'];
  }
  event.returnValue = store;
});

ipcMain.on('store-reload-sync', (event) => {
  readPersistentStore(true);
  event.returnValue = true;
});

// Async Store Bridge
ipcMain.handle('store-get', async (event, key) => {
  if (key === 'ziorse_real_user_v14') {
    return getElectronUserSession();
  }
  const store = readPersistentStore();
  if (store && store[key] !== undefined) return store[key];
  try {
    return await mysqlDb.getStoreValue(key);
  } catch (e) {
    return null;
  }
});

ipcMain.handle('store-set', async (event, key, val) => {
  if (key === 'ziorse_real_user_v14') {
    setElectronUserSession(val);
    return true;
  }
  const store = readPersistentStore();
  if (val === null || val === undefined) {
    delete store[key];
    dirtyKeys.delete(key);
    if (!key.startsWith('ziorse_real_servers_v14_') && key !== 'ziorse_accounts') {
      await mysqlDb.deleteStoreValue(key).catch(() => {});
    }
  } else {
    store[key] = val;
    if (!key.startsWith('ziorse_real_servers_v14_') && key !== 'ziorse_accounts') {
      await mysqlDb.setStoreValue(key, val).catch(() => {});
    }
  }
  return true;
});

ipcMain.handle('store-get-all', async () => {
  const store = { ...readPersistentStore() };
  try {
    const dbVals = await mysqlDb.getAllStoreValues();
    Object.assign(store, dbVals);
  } catch (e) {}
  const u = getElectronUserSession();
  if (u) {
    store['ziorse_real_user_v14'] = u;
  } else {
    delete store['ziorse_real_user_v14'];
  }
  return store;
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
      const scale = Math.round((avgDim / holeDiameter) * 96);
      return Math.min(Math.max(scale, 115), 180);
    }
  } catch (e) { }
  return 140;
}

ipcMain.handle('get-avatar-frames', () => {
  syncFramesDirs();
  try {
    if (!fs.existsSync(AVATAR_FRAMES_DIR)) return [];
    const files = fs.readdirSync(AVATAR_FRAMES_DIR).filter(f => f.toLowerCase().endsWith('.png'));
    return files.map(file => {
      const scale = getFrameHoleScale(path.join(AVATAR_FRAMES_DIR, file));
      return {
        id: file,
        name: path.parse(file).name.replace(/[-_]/g, ' '),
        url: `assets/avatar-frames/${file}`,
        filename: file,
        scale: scale
      };
    });
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

// Member Themes Folder Bridge
const MEMBER_THEMES_DIR = path.join(__dirname, 'src', 'assets', 'member-themes');
const ROOT_THEMES_DIR = path.join(__dirname, 'assets', 'member-themes');

function syncMemberThemesDirsMain() {
  try {
    if (!fs.existsSync(MEMBER_THEMES_DIR)) fs.mkdirSync(MEMBER_THEMES_DIR, { recursive: true });
    if (!fs.existsSync(ROOT_THEMES_DIR)) fs.mkdirSync(ROOT_THEMES_DIR, { recursive: true });
    const allowed = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
    const isThemeFile = f => allowed.includes(path.extname(f).toLowerCase());
    if (fs.existsSync(ROOT_THEMES_DIR)) {
      fs.readdirSync(ROOT_THEMES_DIR).filter(isThemeFile).forEach(file => {
        const dest = path.join(MEMBER_THEMES_DIR, file);
        if (!fs.existsSync(dest)) fs.copyFileSync(path.join(ROOT_THEMES_DIR, file), dest);
      });
    }
    if (fs.existsSync(MEMBER_THEMES_DIR)) {
      fs.readdirSync(MEMBER_THEMES_DIR).filter(isThemeFile).forEach(file => {
        const dest = path.join(ROOT_THEMES_DIR, file);
        if (!fs.existsSync(dest)) fs.copyFileSync(path.join(MEMBER_THEMES_DIR, file), dest);
      });
    }
  } catch (e) { }
}
syncMemberThemesDirsMain();

ipcMain.handle('get-member-themes', () => {
  syncMemberThemesDirsMain();
  try {
    const list = new Set();
    const allowed = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
    [MEMBER_THEMES_DIR, ROOT_THEMES_DIR].forEach(dir => {
      if (fs.existsSync(dir)) {
        fs.readdirSync(dir).filter(f => allowed.includes(path.extname(f).toLowerCase())).forEach(f => list.add(f));
      }
    });
    return Array.from(list).map(file => {
      const ext = path.extname(file).toLowerCase();
      return {
        id: file,
        name: path.parse(file).name.replace(/[-_]/g, ' '),
        url: `assets/member-themes/${file}`,
        filename: file,
        isGif: ext === '.gif'
      };
    });
  } catch (e) {
    return [];
  }
});

ipcMain.handle('open-member-themes-folder', () => {
  syncMemberThemesDirsMain();
  if (fs.existsSync(ROOT_THEMES_DIR)) {
    shell.openPath(ROOT_THEMES_DIR);
  } else if (fs.existsSync(MEMBER_THEMES_DIR)) {
    shell.openPath(MEMBER_THEMES_DIR);
  }
  return true;
});

const configPath = path.join(app.getPath('userData'), 'window-bounds.json');

function loadWindowBounds() {
  try {
    if (fs.existsSync(configPath)) {
      const b = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (b && b.width && b.height && b.width <= 1600 && b.height <= 900 && b.width >= 1000 && b.height >= 680) {
        return b;
      }
    }
  } catch (e) { }
  return { width: 1320, height: 760, x: undefined, y: undefined };
}

function saveWindowBounds(bounds) {
  try {
    if (mainWindow && !mainWindow.isMaximized() && !mainWindow.isFullScreen()) {
      if (bounds && bounds.width <= 1600 && bounds.height <= 900 && bounds.width >= 1000 && bounds.height >= 680) {
        fs.writeFileSync(configPath, JSON.stringify(bounds));
      }
    }
  } catch (e) { }
}

function createMainWindow() {
  const bounds = loadWindowBounds();
  let isDark = false;
  try {
    const store = readPersistentStore();
    const initialTheme = store['ziorse_theme_v14'] || store['ziorse_theme'] || store['ziorse_theme_preference'] || 'light';
    isDark = initialTheme === 'dark';
  } catch (e) { }

  mainWindow = new BrowserWindow({
    width: bounds.width || 1320,
    height: bounds.height || 760,
    x: bounds.x,
    y: bounds.y,
    minWidth: 1000,
    minHeight: 680,
    center: bounds.x === undefined,
    frame: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#ffffff00',
      symbolColor: isDark ? '#ffffff' : '#0f172a',
      height: 40
    },
    backgroundColor: isDark ? '#000000' : '#fafafa',
    title: 'Ziorse Social',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webAudio: true
    }
  });

  if (bounds.x === undefined) {
    mainWindow.setSize(1320, 760);
    mainWindow.center();
  }

  mainWindow.loadFile(path.join(__dirname, 'src/index.html'));
  mainWindow.webContents.openDevTools();
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Renderer Console L${level}] ${sourceId}:${line} -> ${message}`);
  });
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

// IPC listener to dynamically sync native title bar overlay and background with app theme
ipcMain.on('theme-changed', (event, theme) => {
  const isDark = theme === 'dark';
  if (mainWindow && !mainWindow.isDestroyed()) {
    try {
      mainWindow.setTitleBarOverlay({
        color: '#ffffff00',
        symbolColor: isDark ? '#ffffff' : '#0f172a',
        height: 40
      });
      mainWindow.setBackgroundColor(isDark ? '#000000' : '#fafafa');
    } catch (e) { }
  }
});

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
