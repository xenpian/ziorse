// Google Fonts -> yerel self-host. Kullanim: node scripts/localize-fonts.js
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const FONT_DIR = path.join(SRC, 'fonts');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const settingsHtml = fs.readFileSync(path.join(SRC, 'settings.html'), 'utf8');
const m = settingsHtml.match(/https:\/\/fonts\.googleapis\.com\/css2\?[^"']+/);
if (!m) throw new Error('Google Fonts URL bulunamadi');
const CSS_URL = m[0].replace(/&amp;/g, '&');

(async () => {
  fs.mkdirSync(FONT_DIR, { recursive: true });
  let css = await (await fetch(CSS_URL, { headers: { 'User-Agent': UA } })).text();
  const urls = [...new Set([...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)].map(x => x[1]))];
  console.log('Indirilecek font dosyasi:', urls.length);
  let i = 0;
  for (const u of urls) {
    const name = path.basename(new URL(u).pathname);
    const dest = path.join(FONT_DIR, name);
    if (!fs.existsSync(dest)) {
      const buf = Buffer.from(await (await fetch(u, { headers: { 'User-Agent': UA } })).arrayBuffer());
      fs.writeFileSync(dest, buf);
    }
    css = css.split(u).join('../fonts/' + name);
    if (++i % 20 === 0) console.log(i + '/' + urls.length);
  }
  fs.writeFileSync(path.join(SRC, 'css', 'fonts.css'), '/* Otomatik uretildi: scripts/localize-fonts.js (yerel Google Fonts) */\n' + css);
  console.log('css/fonts.css yazildi');
})();
