/**
 * Ziorse - auth.js
 * Login ve Register sayfalarinin ortak mantigi.
 * initLogin()    → login.html tarafindan cagrilir
 * initRegister() → register.html tarafindan cagrilir
 */

// --- Ortak yardimcilar ---

function authTheme() {
  if (window.dataStore && window.dataStore.theme === 'dark') {
    document.body.classList.add('dark-mode');
  }
  if (window.lucide) window.lucide.createIcons();
}

function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('visible');
}

function hideAuthError() {
  const el = document.getElementById('auth-error');
  if (el) el.classList.remove('visible');
}

function showAuthToast(msg) {
  const container = document.getElementById('auth-toast');
  if (!container) return;
  const t = document.createElement('div');
  t.className = 'auth-toast-item';
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    setTimeout(() => t.remove(), 260);
  }, 2200);
}

function goBack() {
  if (history.length > 1) {
    history.back();
  } else {
    window.location.href = 'index.html';
  }
}

function setupCloseBtn() {
  // Auth sayfalarinda giris yapilmadan ana uygulamaya gecilmez
}

// Enter tusuyla submit tetikle
function setupEnterKey(inputIds, submitId) {
  inputIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          document.getElementById(submitId)?.click();
        }
      });
    }
  });
}

// --- HESAP YÖNETİMİ & PERSISTENCE ---

function getAccounts() {
  const key = 'ziorse_accounts';
  let accounts = [];
  try {
    const raw = (typeof window.ziorseGetStorage === 'function')
      ? window.ziorseGetStorage(key)
      : (window.electronAPI?.storeGetSync ? window.electronAPI.storeGetSync(key) : localStorage.getItem(key));
    accounts = typeof raw === 'string' ? JSON.parse(raw || '[]') : (raw || []);
  } catch { accounts = []; }

  // Varsayılan Geliştirici Hesabı (kurtv@ziorse.dev / 123) her zaman mevcut olsun
  if (!accounts.find(a => a.email.toLowerCase() === 'kurtv@ziorse.dev')) {
    accounts.unshift({
      name: 'Kurtv',
      handle: '@kurtv_dev',
      avatar: 'https://i.imgur.com/w3OhOmW.jpeg',
      banner: '',
      bio: 'Fullstack Developer & Ziorse Creator',
      email: 'kurtv@ziorse.dev',
      password: '123'
    });
    saveAccounts(accounts);
  }
  return accounts;
}

function saveAccounts(accounts) {
  const key = 'ziorse_accounts';
  try {
    if (typeof window.ziorseSetStorage === 'function') {
      window.ziorseSetStorage(key, accounts);
    } else {
      localStorage.setItem(key, JSON.stringify(accounts));
      if (window.electronAPI?.storeSetSync) window.electronAPI.storeSetSync(key, accounts);
    }
  } catch {}
}

// --- LOGIN ---

function initLogin() {
  authTheme();
  setupCloseBtn();
  setupEnterKey(['login-email', 'login-password'], 'btn-login-submit');

  // Zaten giris yapilmissa direkt ana sayfaya yonlendir
  if (window.dataStore && window.dataStore.isLoggedIn()) {
    window.location.replace('index.html');
    return;
  }

  const btnSubmit = document.getElementById('btn-login-submit');
  const emailInput = document.getElementById('login-email');
  const passInput = document.getElementById('login-password');

  btnSubmit?.addEventListener('click', async () => {
    hideAuthError();

    const email = (emailInput?.value || '').trim();
    const password = (passInput?.value || '').trim();

    if (!email) { showAuthError('E-posta veya kullanıcı adı boş bırakılamaz.'); return; }
    if (!password) { showAuthError('Şifre boş bırakılamaz.'); return; }

    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Giriş yapılıyor...';

    const accounts = getAccounts();
    const cleanId = email.toLowerCase().replace('@', '');
    let found = accounts.find(a => 
      (a.email && a.email.toLowerCase() === email.toLowerCase()) ||
      (a.handle && a.handle.toLowerCase() === email.toLowerCase()) ||
      (a.handle && a.handle.toLowerCase().replace('@', '') === cleanId)
    );

    // Yerelde bulunamadıysa sunucu API'sine sorgu at (farklı tarayıcı/istemci desteği)
    if (!found) {
      try {
        const loginUrl = window.location.protocol.startsWith('http') ? '/api/login' : 'http://localhost:3000/api/login';
        const resp = await fetch(loginUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: email, password }),
          signal: AbortSignal.timeout(4000)
        });
        const data = await resp.json();
        if (data && data.success && data.account) {
          found = data.account;
          accounts.push(found);
          saveAccounts(accounts);
          if (data.token) localStorage.setItem('ziorse_jwt_token', data.token);
        }
      } catch {}
    }

    if (!found) {
      btnSubmit.disabled = false;
      btnSubmit.textContent = 'Giriş Yap';
      showAuthError('Bu kullanıcı adı veya e-posta ile kayıtlı hesap bulunamadı.');
      return;
    }
    if (found.password !== password) {
      btnSubmit.disabled = false;
      btnSubmit.textContent = 'Giriş Yap';
      showAuthError('Şifre yanlış.');
      return;
    }

    // Giriş başarılı - Kullanıcıyı dataStore'a kaydet
    const userToSave = {
      name: found.name || 'Kullanıcı',
      handle: found.handle || ('@' + email.split('@')[0]),
      avatar: found.avatar || window.DEFAULT_AVATAR,
      banner: found.banner || '#999999',
      bio: found.bio || '',
      email: found.email || email,
      loggedIn: true
    };
    window.dataStore.saveUser(userToSave);

    showAuthToast('Hoş geldin, ' + userToSave.name);
    setTimeout(() => {
      window.location.replace('index.html');
    }, 200);
  });
}

// --- REGISTER ---

function initRegister() {
  authTheme();
  setupCloseBtn();
  setupEnterKey(['reg-name', 'reg-handle', 'reg-email', 'reg-password'], 'btn-register-submit');

  // Zaten giris yapilmissa direkt ana sayfaya yonlendir
  if (window.dataStore && window.dataStore.isLoggedIn()) {
    window.location.replace('index.html');
    return;
  }

  const btnSubmit = document.getElementById('btn-register-submit');
  const nameInput = document.getElementById('reg-name');
  const handleInput = document.getElementById('reg-handle');
  const emailInput = document.getElementById('reg-email');
  const passInput = document.getElementById('reg-password');

  btnSubmit?.addEventListener('click', async () => {
    hideAuthError();

    const name = (nameInput?.value || '').trim();
    const handle = (handleInput?.value || '').trim();
    const email = (emailInput?.value || '').trim();
    const password = (passInput?.value || '').trim();

    if (!name) { showAuthError('İsim soyisim boş bırakılamaz.'); return; }
    if (!handle) { showAuthError('Kullanıcı adı boş bırakılamaz.'); return; }
    if (!email) { showAuthError('E-posta adresi boş bırakılamaz.'); return; }
    if (!password) { showAuthError('Şifre boş bırakılamaz.'); return; }
    if (password.length < 3) { showAuthError('Şifre en az 3 karakter olmalı.'); return; }

    const cleanHandle = handle.startsWith('@') ? handle : '@' + handle;

    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Kayıt yapılıyor...';

    const accounts = getAccounts();

    if (accounts.find(a => a.email.toLowerCase() === email.toLowerCase())) {
      btnSubmit.disabled = false;
      btnSubmit.textContent = 'Kayıt Ol';
      showAuthError('Bu e-posta adresi zaten kullanılıyor.');
      return;
    }
    if (accounts.find(a => a.handle.toLowerCase() === cleanHandle.toLowerCase())) {
      btnSubmit.disabled = false;
      btnSubmit.textContent = 'Kayıt Ol';
      showAuthError('Bu kullanıcı adı zaten alınmış.');
      return;
    }

    const newAccount = {
      name: name,
      handle: cleanHandle,
      email: email,
      password: password,
      avatar: window.DEFAULT_AVATAR || 'https://i.imgur.com/w3OhOmW.jpeg',
      banner: '#999999',
      bio: ''
    };
    accounts.push(newAccount);
    saveAccounts(accounts);

    // Sunucuya bildir
    try {
      const regUrl = window.location.protocol.startsWith('http') ? '/api/register' : 'http://localhost:3000/api/register';
      const resp = await fetch(regUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAccount),
        signal: AbortSignal.timeout(4000)
      }).catch(() => null);

      if (resp && !resp.ok) {
        const errData = await resp.json().catch(() => null);
        if (errData && errData.error) {
          btnSubmit.disabled = false;
          btnSubmit.textContent = 'Kayıt Ol';
          showAuthError(errData.error);
          return;
        }
      }
    } catch {}

    // Otomatik giriş yap
    const userToSave = {
      name: newAccount.name,
      handle: newAccount.handle,
      avatar: newAccount.avatar,
      banner: newAccount.banner,
      bio: newAccount.bio,
      email: newAccount.email,
      loggedIn: true
    };
    window.dataStore.saveUser(userToSave);

    showAuthToast('Hesap oluşturuldu, hoş geldin ' + name);
    setTimeout(() => {
      window.location.replace('index.html');
    }, 250);
  });
}
