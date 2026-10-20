/**
 * Ziorse - auth.js
 * Login ve Register sayfalarinin ortak mantigi.
 * initLogin()    → login.html tarafindan cagrilir
 * initRegister() → register.html tarafindan cagrilir
 */

// --- Ortak yardimcilar ---

function authTheme() {
  const curTh = (window.dataStore && window.dataStore.theme) || localStorage.getItem('ziorse_theme') || localStorage.getItem('ziorse_theme_v14') || localStorage.getItem('ziorse_theme_preference') || 'light';
  const isDarkInitial = curTh === 'dark';
  document.documentElement.classList.toggle('dark-mode', isDarkInitial);
  document.body.classList.toggle('dark-mode', isDarkInitial);
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

  return Array.isArray(accounts) ? accounts : [];
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

  // Zaten giris yapilmissa direkt ana sayfaya yonlendir (acik logout istegi yoksa)
  const isExplicitLogout = window.location.search.includes('logout');
  if (isExplicitLogout) {
    if (window.dataStore) {
      window.dataStore.currentUser = null;
    }
    if (typeof ziorseRemoveStorage === 'function') {
      ziorseRemoveStorage('ziorse_real_user_v14');
    }
    try { localStorage.removeItem('ziorse_real_user_v14'); } catch (e) { }
    try { localStorage.removeItem('ziorse_jwt_token'); } catch (e) { }
    try { localStorage.removeItem('ziorse_user'); } catch (e) { }
    try {
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (e) { }
  } else {
    if (window.dataStore && window.dataStore.isLoggedIn()) {
      window.location.replace('index.html');
      return;
    }
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

    // 1. Önce doğrudan MySQL Sunucu API'sine giriş isteği gönder
    try {
      const loginUrl = window.location.protocol.startsWith('http') ? '/api/login' : ((window.getZiorseServerUrl ? window.getZiorseServerUrl() : 'http://localhost:3001') + '/api/login');
      const resp = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: email, password }),
        signal: AbortSignal.timeout(5000)
      }).catch(() => null);

      if (resp) {
        const data = await resp.json().catch(() => null);
        if (resp.ok && data && data.success && data.account) {
          const found = data.account;
          if (data.token) localStorage.setItem('ziorse_jwt_token', data.token);
          const accounts = getAccounts();
          const cleanAccounts = accounts.filter(a => a.handle.toLowerCase() !== found.handle.toLowerCase());
          cleanAccounts.push(found);
          saveAccounts(cleanAccounts);

          const userToSave = {
            name: found.name || 'Kullanıcı',
            handle: found.handle,
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
          return;
        } else if (data && data.error) {
          btnSubmit.disabled = false;
          btnSubmit.textContent = 'Giriş Yap';
          showAuthError(data.error);
          return;
        }
      }
    } catch {}

    // 2. Çevrimdışı / Yerel önbellek sorgusu
    const accounts = getAccounts();
    const cleanId = email.toLowerCase().replace('@', '');
    let found = accounts.find(a => 
      (a.email && a.email.toLowerCase() === email.toLowerCase()) ||
      (a.handle && a.handle.toLowerCase() === email.toLowerCase()) ||
      (a.handle && a.handle.toLowerCase().replace('@', '') === cleanId)
    );

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

  const isExplicitLogout = window.location.search.includes('logout');
  if (isExplicitLogout) {
    if (window.dataStore) {
      window.dataStore.currentUser = null;
    }
    if (typeof ziorseRemoveStorage === 'function') {
      ziorseRemoveStorage('ziorse_real_user_v14');
    }
    try { localStorage.removeItem('ziorse_real_user_v14'); } catch (e) { }
    try { localStorage.removeItem('ziorse_jwt_token'); } catch (e) { }
    try { localStorage.removeItem('ziorse_user'); } catch (e) { }
    try {
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (e) { }
  } else {
    if (window.dataStore && window.dataStore.isLoggedIn()) {
      window.location.replace('index.html');
      return;
    }
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

    const newAccount = {
      name: name,
      handle: cleanHandle,
      email: email,
      password: password,
      avatar: window.DEFAULT_AVATAR || 'https://i.imgur.com/w3OhOmW.jpeg',
      banner: '#999999',
      bio: ''
    };

    // Doğrudan MySQL API'sine kayıt yap
    try {
      const regUrl = window.location.protocol.startsWith('http') ? '/api/register' : ((window.getZiorseServerUrl ? window.getZiorseServerUrl() : 'http://localhost:3001') + '/api/register');
      const resp = await fetch(regUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAccount),
        signal: AbortSignal.timeout(6000)
      }).catch(err => {
        return { ok: false, errorStr: 'Sunucuya bağlanılamadı: ' + err.message };
      });

      if (!resp || !resp.ok) {
        let errMsg = 'Kayıt oluşturulamadı.';
        if (resp && typeof resp.json === 'function') {
          const errData = await resp.json().catch(() => null);
          if (errData && errData.error) errMsg = errData.error;
        } else if (resp && resp.errorStr) {
          errMsg = resp.errorStr;
        }
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Kayıt Ol';
        showAuthError(errMsg);
        return;
      }

      const resData = await resp.json().catch(() => ({}));
      if (resData && resData.token) {
        localStorage.setItem('ziorse_jwt_token', resData.token);
      }
      const createdAcc = resData.account || resData.user || newAccount;

      // Yerel hesap önbelleğine de ekle
      const accounts = getAccounts();
      accounts.push(createdAcc);
      saveAccounts(accounts);

      // Otomatik giriş yap
      const userToSave = {
        name: createdAcc.name,
        handle: createdAcc.handle,
        avatar: createdAcc.avatar,
        banner: createdAcc.banner,
        bio: createdAcc.bio,
        email: createdAcc.email,
        loggedIn: true
      };
      window.dataStore.saveUser(userToSave);

      showAuthToast('Hesap başarıyla oluşturuldu, hoş geldin ' + name);
      setTimeout(() => {
        window.location.replace('index.html');
      }, 300);
    } catch (err) {
      btnSubmit.disabled = false;
      btnSubmit.textContent = 'Kayıt Ol';
      showAuthError('Kayıt sırasında beklenmeyen hata: ' + err.message);
    }
  });
}
