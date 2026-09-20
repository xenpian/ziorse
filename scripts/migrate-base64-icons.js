const fs = require('fs');
const path = require('path');
const SYSTEM_DIR = path.join(__dirname, 'database_txt', 'system');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
let totalSavedBytes = 0; let totalConverted = 0;
function saveBase64ToFile(dataUrl, prefix) {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/') || dataUrl.length < 5000) return dataUrl;
  try {
    const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches) return dataUrl;
    const ext = matches[1] === 'jpeg' ? 'jpg' : (matches[1] === 'svg+xml' ? 'svg' : (matches[1] || 'png'));
    const filename = `migrated_${Date.now()}_${Math.random().toString(36).substring(2,7)}.${ext}`;
    fs.writeFileSync(path.join(UPLOADS_DIR, filename), Buffer.from(matches[2], 'base64'));
    totalSavedBytes += (dataUrl.length - 40);
    totalConverted++;
    process.stdout.write('.');
    return `http://localhost:3000/uploads/${filename}`;
  } catch(e) { return dataUrl; }
}
function processObj(obj) {
  if (!obj || typeof obj !== 'object') return false;
  let m = false;
  const fields = ['icon','banner','avatar','bannerImg','ownerAvatar','serverIcon','image'];
  for (const f of fields) {
    if (obj[f] && typeof obj[f] === 'string' && obj[f].startsWith('data:image/') && obj[f].length > 5000) {
      obj[f] = saveBase64ToFile(obj[f], f); m = true;
    }
  }
  if (Array.isArray(obj.channels)) obj.channels.forEach(ch => { if(processObj(ch)) m = true; });
  if (Array.isArray(obj.categories)) obj.categories.forEach(cat => { if(processObj(cat)) m = true; if(Array.isArray(cat.channels)) cat.channels.forEach(ch => { if(processObj(ch)) m = true; }); });
  return m;
}
console.log('Migrating base64 icons to files...');
const files = fs.readdirSync(SYSTEM_DIR).filter(f => f.endsWith('.txt'));
for (const file of files) {
  const fp = path.join(SYSTEM_DIR, file);
  if (fs.statSync(fp).size < 10000) continue;
  try {
    const content = fs.readFileSync(fp, 'utf8').trim();
    let data = JSON.parse(content);
    let m = false;
    if (Array.isArray(data)) { data.forEach(item => { if(processObj(item)) m = true; }); }
    else if (data && typeof data === 'object') m = processObj(data);
    if (m) {
      const oldSz = content.length;
      const newContent = JSON.stringify(data, null, 2);
      fs.writeFileSync(fp, newContent, 'utf8');
      console.log(`\n  ${file}: ${(oldSz/1024/1024).toFixed(2)}MB -> ${(newContent.length/1024/1024).toFixed(2)}MB`);
    }
  } catch(e) {}
}
const postsDir = path.join(__dirname, 'database_txt', 'posts');
const postFiles = fs.existsSync(postsDir) ? fs.readdirSync(postsDir).filter(f => f.endsWith('.txt')) : [];
for (const file of postFiles) {
  const fp = path.join(postsDir, file);
  const content = fs.readFileSync(fp, 'utf8').trim();
  const lines = content.split('\n'); let m = false;
  const newLines = lines.map(line => { try { const p = JSON.parse(line); if(processObj(p)) m = true; return JSON.stringify(p); } catch { return line; } });
  if (m) { const oldSz = content.length; const newContent = newLines.join('\n'); fs.writeFileSync(fp, newContent, 'utf8'); console.log(`\n  ${file}: ${(oldSz/1024/1024).toFixed(2)}MB -> ${(newContent.length/1024/1024).toFixed(2)}MB`); }
}
console.log(`\nDone! Converted ${totalConverted} images, freed ~${(totalSavedBytes/1024/1024).toFixed(2)}MB`);
