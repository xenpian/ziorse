/**
 * Ziorse - GitHub Instant Auto-Sync Engine
 * Dosyalarda veya tasarımda bir değişiklik yapıldığında anında GitHub'a otomatik push yapar.
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const DEBOUNCE_MS = 2500; // 2.5 saniye debounce süresi

const IGNORED_PATHS = [
  '.git',
  'node_modules',
  'uploads',
  'scratch',
  '.system_generated',
  'window-bounds.json',
  '.DS_Store',
  'Thumbs.db'
];

let syncTimeout = null;
let isSyncing = false;
let pendingSync = false;
let changedFilesSet = new Set();

function shouldIgnore(relPath) {
  if (!relPath) return true;
  const normalized = relPath.replace(/\\/g, '/');
  for (const ign of IGNORED_PATHS) {
    if (normalized === ign || normalized.startsWith(ign + '/') || normalized.includes('/' + ign + '/')) {
      return true;
    }
  }
  if (normalized.endsWith('.log') || normalized.endsWith('.tmp') || normalized.endsWith('.crswap')) {
    return true;
  }
  return false;
}

function runCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd: ROOT_DIR }, (err, stdout, stderr) => {
      if (err) return reject({ err, stdout, stderr });
      resolve({ stdout, stderr });
    });
  });
}

async function performSync() {
  if (isSyncing) {
    pendingSync = true;
    return;
  }
  isSyncing = true;
  pendingSync = false;

  try {
    // 1. Değişiklik var mı kontrol et
    const statusRes = await runCommand('git status --porcelain');
    const statusOutput = (statusRes.stdout || '').trim();
    if (!statusOutput) {
      isSyncing = false;
      changedFilesSet.clear();
      return;
    }

    const changedFiles = Array.from(changedFilesSet).slice(0, 3).join(', ');
    changedFilesSet.clear();

    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const commitMsg = changedFiles 
      ? `update: ${changedFiles} [${timeStr}]`
      : `update: auto-sync changes [${timeStr}]`;

    console.log(`\n[GitHub Auto-Sync] 🔄 Değişiklikler algılandı, GitHub'a aktarılıyor...`);

    // 2. Stage & Commit & Push
    await runCommand('git add -A');
    await runCommand(`git commit -m "${commitMsg}"`);
    await runCommand('git push origin main');

    console.log(`[GitHub Auto-Sync] 🚀 Başarıyla GitHub'a gönderildi! (${timeStr})`);
  } catch (error) {
    console.error('[GitHub Auto-Sync] Senkronizasyon uyarısı:', error.stderr || error.err?.message || error);
  } finally {
    isSyncing = false;
    if (pendingSync) {
      pendingSync = false;
      setTimeout(performSync, 1000);
    }
  }
}

function onFileEvent(eventType, filename) {
  if (!filename || shouldIgnore(filename)) return;

  changedFilesSet.add(filename);
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }
  syncTimeout = setTimeout(performSync, DEBOUNCE_MS);
}

// Watcher başlat
console.log(`[GitHub Auto-Sync] 🛰️ Ziorse GitHub anlık senkronizasyon izleyicisi aktif!`);
console.log(`[GitHub Auto-Sync] Hedef Depo: https://github.com/xenpian/ziorse`);
console.log(`[GitHub Auto-Sync] Tasarım veya kod değiştiğinde anında GitHub'a push yapılacak.\n`);

try {
  fs.watch(ROOT_DIR, { recursive: true }, onFileEvent);
} catch (e) {
  console.error('[GitHub Auto-Sync] Watcher başlatma hatası:', e.message);
}

// İlk açılışta bekleyen commit var mı kontrol et
performSync();
