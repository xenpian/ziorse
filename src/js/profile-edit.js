/**
 * Ziorse - profile-edit.js
 * Profil düzenleme sayfası mantığı:
 *  - Mevcut profili yükle
 *  - Değişiklik algıla → altta kaydet/geri al çubuğunu göster
 *  - Kaydet → dataStore'a yaz, ana sayfaya dön
 *  - Geri Al → formu sıfırla, çubuğu gizle
 *  - X butonu veya ESC → değişiklik yoksa direkt dön, varsa sor
 */

document.addEventListener('DOMContentLoaded', () => {

  const ds = (window.parent && window.parent !== window && window.parent.dataStore)
    ? window.parent.dataStore
    : window.dataStore;

  // --- Tema ---
  const body = document.body;
  if (ds && ds.theme === 'dark') {
    body.classList.add('dark-mode');
  }

  // --- Lucide ikonlari ---
  function refreshIcons() {
    if (window.lucide) window.lucide.createIcons();
  }
  refreshIcons();

  // --- Toast ---
  const toastContainer = document.getElementById('pe-toast-container');
  function showToast(msg) {
    if (!toastContainer) return;
    const t = document.createElement('div');
    t.className = 'pe-toast-item';
    t.textContent = msg;
    toastContainer.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0';
      setTimeout(() => t.remove(), 260);
    }, 2600);
  }

  // --- Eleman referanslari ---
  const btnClose = document.getElementById('btn-close-profile-edit');
  const changeBar = document.getElementById('pe-change-bar');
  const btnSave = document.getElementById('btn-pe-save');
  const btnDiscard = document.getElementById('btn-pe-discard');

  const inputName = document.getElementById('pe-input-name');
  const inputHandle = document.getElementById('pe-input-handle');
  const inputBio = document.getElementById('pe-input-bio');
  const avatarPreview = document.getElementById('pe-avatar-preview');
  const bannerPreview = document.getElementById('pe-banner-preview');

  const btnPickAvatar = document.getElementById('btn-pe-pick-avatar');
  const fileAvatar = document.getElementById('pe-file-avatar');
  const btnPickBanner = document.getElementById('btn-pe-pick-banner');
  const fileBanner = document.getElementById('pe-file-banner');

  // --- Mevcut profil verisini yukle ---
  const profile = (ds && ds.currentUser) ? ds.currentUser : (window.dataStore?.currentUser || {});

  // Orijinal degerler (geri al icin)
  let original = {
    name: profile.name || '',
    handle: profile.handle || '',
    bio: profile.bio || '',
    avatar: profile.avatar || '',
    banner: profile.banner || ''
  };

  // Calisma degerleri (kaydet icin)
  let current = { ...original };

  // Formu orijinal degerlerle doldur
  function fillForm(data) {
    inputName.value = data.name;
    inputHandle.value = data.handle;
    inputBio.value = data.bio;
    avatarPreview.src = data.avatar || window.DEFAULT_AVATAR || '';
    if (data.banner) {
      bannerPreview.style.backgroundImage = `url('${data.banner}')`;
    } else {
      bannerPreview.style.backgroundImage = 'none';
    }
  }

  fillForm(original);

  // --- Degisiklik algılama ---
  let isDirty = false;

  function checkDirty() {
    const nowDirty =
      inputName.value !== original.name ||
      inputHandle.value !== original.handle ||
      inputBio.value !== original.bio ||
      current.avatar !== original.avatar ||
      current.banner !== original.banner;

    if (nowDirty !== isDirty) {
      isDirty = nowDirty;
      if (isDirty) {
        changeBar.classList.remove('pe-change-bar--hidden');
      } else {
        changeBar.classList.add('pe-change-bar--hidden');
      }
    }
  }

  // Metin alanlarini izle
  [inputName, inputHandle, inputBio].forEach(el => {
    el.addEventListener('input', checkDirty);
  });

  // --- Avatar yukle ---
  btnPickAvatar.addEventListener('click', () => fileAvatar.click());
  fileAvatar.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (window.openImageCropper) {
      window.openImageCropper({
        file: file,
        shape: 'circle',
        title: 'Profil Fotoğrafını Ayarla',
        onCrop: (croppedDataUrl) => {
          current.avatar = croppedDataUrl;
          avatarPreview.src = current.avatar;
          checkDirty();
        }
      });
    } else {
      const reader = new FileReader();
      reader.onload = (evt) => {
        current.avatar = evt.target.result;
        avatarPreview.src = current.avatar;
        checkDirty();
      };
      reader.readAsDataURL(file);
    }
    fileAvatar.value = '';
  });

  // --- Banner yukle ---
  btnPickBanner.addEventListener('click', () => fileBanner.click());
  fileBanner.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (window.openImageCropper) {
      window.openImageCropper({
        file: file,
        shape: 'banner',
        aspectRatio: 2.7,
        title: 'Profil Başlığını (Banner) Ayarla',
        onCrop: (croppedDataUrl) => {
          current.banner = croppedDataUrl;
          bannerPreview.style.backgroundImage = `url('${current.banner}')`;
          checkDirty();
        }
      });
    } else {
      const reader = new FileReader();
      reader.onload = (evt) => {
        current.banner = evt.target.result;
        bannerPreview.style.backgroundImage = `url('${current.banner}')`;
        checkDirty();
      };
      reader.readAsDataURL(file);
    }
    fileBanner.value = '';
  });

  // --- Kaydet ---
  function saveChanges() {
    let newHandle = inputHandle.value.trim() || original.handle;
    if (newHandle && !newHandle.startsWith('@')) {
      newHandle = '@' + newHandle;
    }

    const updateObj = {
      name: inputName.value.trim() || original.name,
      handle: newHandle,
      bio: inputBio.value.trim(),
      avatar: current.avatar,
      banner: current.banner
    };

    // 1. DataStore kaydet
    if (window.dataStore && typeof window.dataStore.saveUser === 'function') {
      window.dataStore.saveUser(updateObj);
    }

    const targetParent = (window.parent && window.parent !== window) ? window.parent : (window.opener || null);
    if (targetParent && targetParent.dataStore && typeof targetParent.dataStore.saveUser === 'function') {
      try {
        targetParent.dataStore.saveUser(updateObj);
      } catch (e) { }
    }

    // 2. Instant Live Media & User Display Update on Parent Window
    if (targetParent && typeof targetParent.updateLiveUserMedia === 'function') {
      targetParent.updateLiveUserMedia(updateObj.handle, updateObj.avatar, updateObj.banner);
    }
    if (targetParent && typeof targetParent.syncUserDisplay === 'function') {
      targetParent.syncUserDisplay();
    }

    // 3. Soket üzerinden anında sunucuya ve diğer tüm istemcilere bildir
    const activeSocket = window.socket || (targetParent && targetParent.socket);
    if (activeSocket) {
      activeSocket.emit('sync-user-profile', {
        name: updateObj.name,
        handle: updateObj.handle,
        avatar: updateObj.avatar,
        banner: updateObj.banner,
        bio: updateObj.bio,
        status: (ds && ds.userStatus) || { type: 'online', text: '' }
      });
    }

    // Orijinali guncelle (tekrar geri al basilirsa yeni deger baz olur)
    original = { ...updateObj };
    current = { ...original };

    isDirty = false;
    changeBar.classList.add('pe-change-bar--hidden');
    showToast('Değişiklikler başarıyla kaydedildi');

    if (targetParent && typeof targetParent.closeModalView === 'function') {
      setTimeout(() => {
        targetParent.closeModalView({ type: 'user-updated', user: updateObj });
      }, 350);
    } else {
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 600);
    }
  }

  // --- Geri Al ---
  function discardChanges() {
    current = { ...original };
    fillForm(original);
    isDirty = false;
    changeBar.classList.add('pe-change-bar--hidden');
    showToast('Değişiklikler geri alındı');
  }

  btnSave.addEventListener('click', saveChanges);
  btnDiscard.addEventListener('click', discardChanges);

  // --- Ana sayfaya don (X butonu) ---
  function goBack() {
    if (isDirty) {
      // Kaydedilmemis degisiklik varsa kullaniciya sor
      if (!confirm('Kaydedilmemiş değişiklikleriniz var. Çıkış yapılsın mı?')) {
        return;
      }
    }
    if (window.parent && window.parent !== window && typeof window.parent.closeModalView === 'function') {
      window.parent.closeModalView();
    } else {
      window.location.href = 'index.html';
    }
  }

  btnClose.addEventListener('click', goBack);

  // --- ESC tus destegi ---
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      goBack();
    }
  });

});
