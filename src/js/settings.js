document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') lucide.createIcons();

  const ds = (window.parent && window.parent !== window && window.parent.dataStore)
    ? window.parent.dataStore
    : window.dataStore;

  if (!ds || !ds.isLoggedIn()) {
    window.location.replace('login.html');
    return;
  }

  // Set theme on body if dark
  if (ds.theme === 'dark') {
    document.body.classList.add('dark-mode');
  }

  const cu = ds.currentUser || { handle: '@kullanici', name: 'Kullanıcı', avatar: '' };
  const prof = ds.getUserProfile(cu.handle) || {};
  const currentStatus = ds.userStatus || prof.status || { type: 'online', text: '' };

  // DOM Elements
  const btnClose = document.getElementById('btn-close-settings');
  const navItems = document.querySelectorAll('.ss-nav-item[data-section]');
  const sections = document.querySelectorAll('.ss-section');
  const saveBar = document.getElementById('settings-save-bar');
  const btnSave = document.getElementById('btn-settings-save');
  const btnDiscard = document.getElementById('btn-settings-discard');
  const btnLogout = document.getElementById('btn-settings-logout');

  // Sidebar User Info
  const sideName = document.getElementById('settings-user-name');
  const sideHandle = document.getElementById('settings-user-handle');
  const sideAvatarImg = document.getElementById('settings-avatar-img');
  const sideAvatarInitials = document.getElementById('settings-avatar-initials');

  // Account Tab
  const accBannerPreview = document.getElementById('acc-banner-preview');
  const accAvatarImg = document.getElementById('acc-avatar-img');
  const accAvatarInitials = document.getElementById('acc-avatar-initials');
  const accPreviewName = document.getElementById('acc-preview-name');
  const accPreviewHandle = document.getElementById('acc-preview-handle');
  const accInfoName = document.getElementById('acc-info-name');
  const accInfoHandle = document.getElementById('acc-info-handle');
  const accInfoEmail = document.getElementById('acc-info-email');
  const btnGoProfileTab = document.getElementById('btn-go-profile-tab');
  const btnEditBannerQuick = document.getElementById('btn-edit-banner-quick');

  // Profile Customize Tab (Form Inputs)
  const profAvatarImg = document.getElementById('prof-avatar-img');
  const profAvatarInitials = document.getElementById('prof-avatar-initials');
  const profAvatarPreview = document.getElementById('prof-avatar-preview');
  const btnProfPickAvatar = document.getElementById('btn-prof-pick-avatar');
  const btnProfRemoveAvatar = document.getElementById('btn-prof-remove-avatar');
  const profAvatarFile = document.getElementById('prof-avatar-file');

  const profBannerPreview = document.getElementById('prof-banner-preview');
  const profBannerPlaceholder = document.getElementById('prof-banner-placeholder');
  const btnProfPickBanner = document.getElementById('btn-prof-pick-banner');
  const btnProfRemoveBanner = document.getElementById('btn-prof-remove-banner');
  const profBannerFile = document.getElementById('prof-banner-file');

  const profInputName = document.getElementById('prof-input-name');
  const profInputHandle = document.getElementById('prof-input-handle');
  const profInputStatus = document.getElementById('prof-input-status');
  const profInputBio = document.getElementById('prof-input-bio');
  const profBioCharCount = document.getElementById('prof-bio-char-count');

  // Live Profile Card (Right Column)
  const liveCardBanner = document.getElementById('live-card-banner');
  const liveCardAvatar = document.getElementById('live-card-avatar');
  const liveCardInitials = document.getElementById('live-card-initials');
  const liveCardStatusDot = document.getElementById('live-card-status-dot');
  const liveCardName = document.getElementById('live-card-name');
  const liveCardHandle = document.getElementById('live-card-handle');
  const liveCardStatusContainer = document.getElementById('live-card-status-container');
  const liveCardStatusText = document.getElementById('live-card-status-text');
  const liveCardBio = document.getElementById('live-card-bio');

  // Appearance Tab
  const themeCards = document.querySelectorAll('.theme-card');
  const rangeFontSize = document.getElementById('range-font-size');
  const labelFontSize = document.getElementById('label-font-size');
  const chkCompactChat = document.getElementById('chk-compact-chat');

  // Voice Tab
  const btnTestMic = document.getElementById('btn-test-mic');
  const micTestBar = document.getElementById('mic-test-bar');
  let micTestInterval = null;

  function createProfileSnapshot(p, status) {
    const name = (p && p.name) ? String(p.name).trim() : 'Kullanıcı';
    let handle = (p && p.handle) ? String(p.handle).trim() : '@kullanici';
    if (!handle.startsWith('@')) handle = '@' + handle;
    const avatar = (p && p.avatar) ? String(p.avatar) : '';
    const banner = (p && p.banner) ? String(p.banner) : '';
    const bio = (p && p.bio) ? String(p.bio).trim() : '';
    const email = (p && p.email) ? String(p.email).trim() : `${handle.replace('@', '')}@ziorse.app`;
    const statusText = (status && status.text) ? String(status.text).trim() : '';
    const statusType = (status && status.type) ? String(status.type) : 'online';
    const fontStyle = (p && p.fontStyle) ? String(p.fontStyle) : 'outfit';
    const nameColor = (p && p.nameColor) ? String(p.nameColor) : '#ffffff';
    const nameEffects = (p && Array.isArray(p.nameEffects)) ? [...p.nameEffects] : [];
    const avatarFrame = (p && p.avatarFrame) ? String(p.avatarFrame) : 'none';

    return { name, handle, avatar, banner, bio, email, statusText, statusType, fontStyle, nameColor, nameEffects, avatarFrame };
  }

  // Local state drafts
  let originalProfile = createProfileSnapshot(prof.name ? prof : cu, currentStatus);
  let draftProfile = createProfileSnapshot(originalProfile, currentStatus);

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function showToast(msg) {
    const existing = document.getElementById('settings-toast');
    if (existing) existing.remove();
    const t = document.createElement('div');
    t.id = 'settings-toast';
    t.className = 'toast-notification show';
    t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1f1f23;color:#f3f4f6;border:1px solid #374151;padding:10px 18px;border-radius:10px;font-size:0.85rem;font-weight:600;z-index:99999;box-shadow:0 10px 25px rgba(0,0,0,0.5);display:flex;align-items:center;gap:8px;';
    t.innerHTML = `<i data-lucide="check-circle" style="width:16px;height:16px;color:#22c55e;"></i> <span>${escapeHtml(msg)}</span>`;
    document.body.appendChild(t);
    if (typeof lucide !== 'undefined') lucide.createIcons();
    setTimeout(() => { t.remove(); }, 3000);
  }

  function isVideoUrl(url) {
    if (!url || typeof url !== 'string') return false;
    return url.startsWith('data:video') || url.match(/\.(mp4|webm|mov|mkv)(\?.*)?$/i);
  }

  function setMediaAvatar(parent, imgEl, initialsEl, url, initials) {
    if (!parent) return;
    if (url && url.startsWith('/uploads/')) url = 'http://localhost:3000' + url;
    let vid = parent.querySelector('video.dynamic-media-avatar');
    if (url && isVideoUrl(url)) {
      if (imgEl) imgEl.style.display = 'none';
      if (initialsEl) initialsEl.style.display = 'none';
      if (!vid) {
        vid = document.createElement('video');
        vid.className = 'dynamic-media-avatar';
        vid.autoplay = true;
        vid.loop = true;
        vid.muted = true;
        vid.playsInline = true;
        vid.style.width = '100%';
        vid.style.height = '100%';
        vid.style.objectFit = 'cover';
        vid.style.borderRadius = 'inherit';
        vid.style.position = 'absolute';
        vid.style.top = '0';
        vid.style.left = '0';
        parent.style.position = 'relative';
        parent.appendChild(vid);
      }
      if (vid.src !== url) vid.src = url;
      vid.play().catch(() => {});
    } else {
      if (vid) vid.remove();
      if (url && url !== 'https://i.imgur.com/w3OhOmW.jpeg') {
        if (imgEl) { imgEl.src = url; imgEl.style.display = 'block'; }
        if (initialsEl) initialsEl.style.display = 'none';
      } else {
        if (imgEl) imgEl.style.display = 'none';
        if (initialsEl) { initialsEl.textContent = initials || 'U'; initialsEl.style.display = 'flex'; }
      }
    }
  }

  function setMediaBanner(bannerEl, url, placeholderEl) {
    if (!bannerEl) return;
    if (url && url.startsWith('/uploads/')) url = 'http://localhost:3000' + url;
    let vid = bannerEl.querySelector('video.dynamic-media-banner');
    if (url && isVideoUrl(url)) {
      bannerEl.style.backgroundImage = 'none';
      if (placeholderEl) placeholderEl.style.display = 'none';
      if (!vid) {
        vid = document.createElement('video');
        vid.className = 'dynamic-media-banner';
        vid.autoplay = true;
        vid.loop = true;
        vid.muted = true;
        vid.playsInline = true;
        vid.style.width = '100%';
        vid.style.height = '100%';
        vid.style.objectFit = 'cover';
        vid.style.position = 'absolute';
        vid.style.top = '0';
        vid.style.left = '0';
        vid.style.pointerEvents = 'none';
        bannerEl.style.position = 'relative';
        bannerEl.appendChild(vid);
      }
      if (vid.src !== url) vid.src = url;
      vid.play().catch(() => {});
    } else {
      if (vid) vid.remove();
      if (url) {
        bannerEl.style.backgroundImage = `url("${url}")`;
        bannerEl.style.backgroundSize = 'cover';
        bannerEl.style.backgroundPosition = 'center';
        if (placeholderEl) placeholderEl.style.display = 'none';
      } else {
        bannerEl.style.backgroundImage = 'none';
        if (placeholderEl) placeholderEl.style.display = 'block';
      }
    }
  }

  // 1. Render Current User Info Across All Tabs and Live Card
  function renderUserInfo() {
    const initials = draftProfile.name ? draftProfile.name.trim().substring(0, 2).toUpperCase() : 'U';

    // Sidebar
    if (sideName) sideName.textContent = draftProfile.name;
    if (sideHandle) sideHandle.textContent = draftProfile.handle;
    if (draftProfile.avatar) {
      if (sideAvatarImg) { sideAvatarImg.src = draftProfile.avatar; sideAvatarImg.style.display = 'block'; }
      if (sideAvatarInitials) sideAvatarInitials.style.display = 'none';
    } else {
      if (sideAvatarImg) sideAvatarImg.style.display = 'none';
      if (sideAvatarInitials) { sideAvatarInitials.textContent = initials; sideAvatarInitials.style.display = 'block'; }
    }
    setMediaAvatar(sideAvatarImg?.parentElement, sideAvatarImg, sideAvatarInitials, draftProfile.avatar, initials);

    // Account Tab
    if (accPreviewName) {
      accPreviewName.textContent = draftProfile.name;
      const fontFamilies = {
        'outfit': "'Outfit', sans-serif",
        'cyber': "'Russo One', sans-serif",
        'cursive': "'Caveat', cursive",
        'pixel': "'Press Start 2P', monospace",
        'serif': "'Cinzel', serif",
        'neon': "'Righteous', cursive",
        'terminal': "'JetBrains Mono', monospace",
        'inter': "'Inter', sans-serif"
      };
      accPreviewName.style.fontFamily = fontFamilies[draftProfile.fontStyle] || fontFamilies['outfit'];

      if (draftProfile.nameColor && draftProfile.nameColor.startsWith('linear-gradient')) {
        accPreviewName.style.background = draftProfile.nameColor;
        accPreviewName.style.webkitBackgroundClip = 'text';
        accPreviewName.style.webkitTextFillColor = 'transparent';
        accPreviewName.style.color = 'transparent';
      } else {
        accPreviewName.style.background = 'none';
        accPreviewName.style.webkitBackgroundClip = 'unset';
        accPreviewName.style.webkitTextFillColor = draftProfile.nameColor || 'var(--text-main)';
        accPreviewName.style.color = draftProfile.nameColor || 'var(--text-main)';
      }

      const effects = draftProfile.nameEffects || [];
      let textShadows = [];
      if (effects.includes('glow')) {
        const glowColor = (draftProfile.nameColor && draftProfile.nameColor.startsWith('#')) ? draftProfile.nameColor : '#00f2fe';
        textShadows.push(`0 0 12px ${glowColor}`);
      }
      if (effects.includes('shadow')) {
        textShadows.push('2px 3px 5px rgba(0, 0, 0, 0.8)');
      }
      accPreviewName.style.textShadow = textShadows.join(', ') || 'none';
      accPreviewName.style.letterSpacing = effects.includes('spaced') ? '2px' : 'normal';
    }

    if (accPreviewHandle) accPreviewHandle.textContent = draftProfile.handle;
    if (accInfoName) accInfoName.textContent = draftProfile.name;
    if (accInfoHandle) accInfoHandle.textContent = draftProfile.handle;
    if (accInfoEmail) accInfoEmail.textContent = draftProfile.email;

    setMediaBanner(accBannerPreview, draftProfile.banner);
    setMediaAvatar(accAvatarImg?.parentElement, accAvatarImg, accAvatarInitials, draftProfile.avatar, initials);

    // Dynamic Frame Overlay on Compact Preview
    const frameOverlay = document.getElementById('acc-avatar-frame-overlay');
    if (frameOverlay) {
      if (draftProfile.avatarFrame && draftProfile.avatarFrame !== 'none') {
        let frameSrc = draftProfile.avatarFrame;
        if (!frameSrc.includes('/') && !frameSrc.startsWith('data:')) {
          frameSrc = `assets/avatar-frames/${frameSrc}`;
        }
        const scale = getFrameScale(frameSrc);
        frameOverlay.src = frameSrc;
        frameOverlay.style.width = `${scale}%`;
        frameOverlay.style.height = `${scale}%`;
        frameOverlay.style.display = 'block';
      } else {
        frameOverlay.style.display = 'none';
      }
    }

    // Active state sync in Hesabım tab controls
    document.querySelectorAll('.hesabim-font-chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.font === draftProfile.fontStyle);
    });
    document.querySelectorAll('.hesabim-color-dot').forEach(dot => {
      dot.classList.toggle('active', dot.dataset.color === draftProfile.nameColor);
    });
    document.querySelectorAll('.hesabim-effect-toggle').forEach(tgl => {
      tgl.classList.toggle('active', (draftProfile.nameEffects || []).includes(tgl.dataset.effect));
    });
    document.querySelectorAll('.hesabim-frame-item').forEach(item => {
      const fId = item.dataset.frameId;
      const isAct = (!draftProfile.avatarFrame || draftProfile.avatarFrame === 'none')
        ? (fId === 'none')
        : (draftProfile.avatarFrame === fId || draftProfile.avatarFrame === item.dataset.frameUrl || (draftProfile.avatarFrame && draftProfile.avatarFrame.endsWith(fId)));
      item.classList.toggle('active', isAct);
    });

    // Profile Customize Tab Inputs
    if (profInputName && document.activeElement !== profInputName) profInputName.value = draftProfile.name;
    if (profInputHandle && document.activeElement !== profInputHandle) profInputHandle.value = draftProfile.handle;
    if (profInputStatus && document.activeElement !== profInputStatus) profInputStatus.value = draftProfile.statusText;
    if (profInputBio && document.activeElement !== profInputBio) profInputBio.value = draftProfile.bio;
    if (profBioCharCount) profBioCharCount.textContent = `${(draftProfile.bio || '').length} / 240`;

    setMediaAvatar(profAvatarPreview, profAvatarImg, profAvatarInitials, draftProfile.avatar, initials);
    if (btnProfRemoveAvatar) btnProfRemoveAvatar.style.display = draftProfile.avatar ? 'inline-flex' : 'none';

    setMediaBanner(profBannerPreview, draftProfile.banner, profBannerPlaceholder);
    if (btnProfRemoveBanner) btnProfRemoveBanner.style.display = draftProfile.banner ? 'inline-flex' : 'none';

    // LIVE PREVIEW CARD (Right column)
    setMediaBanner(liveCardBanner, draftProfile.banner);
    const liveCardAvatarWrap = liveCardAvatar?.parentElement;
    setMediaAvatar(liveCardAvatarWrap, liveCardAvatar, liveCardInitials, draftProfile.avatar, initials);

    if (liveCardName) liveCardName.textContent = draftProfile.name;
    if (liveCardHandle) liveCardHandle.textContent = draftProfile.handle;

    if (liveCardStatusContainer && liveCardStatusText) {
      if (draftProfile.statusText && draftProfile.statusText.trim()) {
        liveCardStatusText.textContent = draftProfile.statusText;
        liveCardStatusContainer.style.display = 'block';
      } else {
        liveCardStatusContainer.style.display = 'none';
      }
    }

    if (liveCardBio) {
      if (draftProfile.bio && draftProfile.bio.trim()) {
        liveCardBio.innerHTML = escapeHtml(draftProfile.bio);
      } else {
        liveCardBio.innerHTML = '<span class="settings-preview-bio-placeholder">Henüz bir biyografi eklenmedi.</span>';
      }
    }

    const statusColors = { online: '#22c55e', idle: '#eab308', dnd: '#ef4444', invisible: '#737373', offline: '#737373' };
    if (liveCardStatusDot) {
      liveCardStatusDot.style.background = statusColors[draftProfile.statusType] || '#22c55e';
    }
  }

  function checkChanges() {
    const curName = (profInputName ? profInputName.value.trim() : (draftProfile.name || '')) || (draftProfile.name || '');
    let curHandle = (profInputHandle ? profInputHandle.value.trim() : draftProfile.handle) || draftProfile.handle;
    if (!curHandle.startsWith('@')) curHandle = '@' + curHandle;
    const curBio = (profInputBio ? profInputBio.value.trim() : (draftProfile.bio || '')).trim();
    const curStatus = (profInputStatus ? profInputStatus.value.trim() : (draftProfile.statusText || '')).trim();

    const origName = (originalProfile.name || '').trim();
    const origHandle = (originalProfile.handle || '@kullanici').trim();
    const origBio = (originalProfile.bio || '').trim();
    const origStatus = (originalProfile.statusText || '').trim();
    const origAvatar = originalProfile.avatar || '';
    const origBanner = originalProfile.banner || '';

    const curAvatar = draftProfile.avatar || '';
    const curBanner = draftProfile.banner || '';

    const hasChanges =
      curName !== origName ||
      curHandle !== origHandle ||
      curBio !== origBio ||
      curStatus !== origStatus ||
      curAvatar !== origAvatar ||
      curBanner !== origBanner ||
      draftProfile.fontStyle !== originalProfile.fontStyle ||
      draftProfile.nameColor !== originalProfile.nameColor ||
      draftProfile.avatarFrame !== originalProfile.avatarFrame ||
      JSON.stringify(draftProfile.nameEffects || []) !== JSON.stringify(originalProfile.nameEffects || []);

    if (saveBar) {
      if (hasChanges) {
        saveBar.classList.add('visible');
      } else {
        saveBar.classList.remove('visible');
      }
    }
  }

  // 2. Tab Navigation
  navItems.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetSec = btn.dataset.section;
      switchSection(targetSec);
    });
  });

  function switchSection(secId) {
    navItems.forEach(b => b.classList.toggle('active', b.dataset.section === secId));
    sections.forEach(s => s.classList.toggle('active', s.id === 'sec-' + secId));
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  if (btnGoProfileTab) {
    btnGoProfileTab.addEventListener('click', () => {
      switchSection('profil');
    });
  }
  const accAvatarBox = document.getElementById('acc-avatar-box');
  if (accAvatarBox && profAvatarFile) {
    accAvatarBox.style.cursor = 'pointer';
    accAvatarBox.title = 'Profil Resmini Değiştir';
    accAvatarBox.addEventListener('click', () => {
      profAvatarFile.click();
    });
  }
  if (btnEditBannerQuick) {
    btnEditBannerQuick.addEventListener('click', () => {
      switchSection('profil');
      if (profBannerFile) profBannerFile.click();
    });
  }

  // 3. Avatar Upload & Remove
  if (profAvatarPreview && profAvatarFile) {
    profAvatarPreview.addEventListener('click', () => profAvatarFile.click());
  }
  if (btnProfPickAvatar && profAvatarFile) {
    btnProfPickAvatar.addEventListener('click', () => profAvatarFile.click());
    profAvatarFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (window.openImageCropper) {
        window.openImageCropper({
          file: file,
          shape: 'circle',
          title: 'Profil Fotoğrafını Ayarla',
          onCrop: (croppedDataUrl) => {
            draftProfile.avatar = croppedDataUrl;
            renderUserInfo();
            checkChanges();
          }
        });
      } else {
        const reader = new FileReader();
        reader.onload = (ev) => {
          draftProfile.avatar = ev.target.result;
          renderUserInfo();
          checkChanges();
        };
        reader.readAsDataURL(file);
      }
      profAvatarFile.value = '';
    });
  }

  if (btnProfRemoveAvatar) {
    btnProfRemoveAvatar.addEventListener('click', () => {
      draftProfile.avatar = '';
      renderUserInfo();
      checkChanges();
    });
  }

  // 4. Banner Upload & Remove
  if (btnProfPickBanner && profBannerFile) {
    btnProfPickBanner.addEventListener('click', () => profBannerFile.click());
    profBannerFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (window.openImageCropper) {
        window.openImageCropper({
          file: file,
          shape: 'banner',
          aspectRatio: 2.7,
          title: 'Profil Başlığını (Banner) Ayarla',
          onCrop: (croppedDataUrl) => {
            draftProfile.banner = croppedDataUrl;
            renderUserInfo();
            checkChanges();
          }
        });
      } else {
        const reader = new FileReader();
        reader.onload = (ev) => {
          draftProfile.banner = ev.target.result;
          renderUserInfo();
          checkChanges();
        };
        reader.readAsDataURL(file);
      }
      profBannerFile.value = '';
    });
  }

  if (btnProfRemoveBanner) {
    btnProfRemoveBanner.addEventListener('click', () => {
      draftProfile.banner = '';
      renderUserInfo();
      checkChanges();
    });
  }

  // 5. Name, Handle, Status & Bio Input Listeners
  if (profInputName) {
    profInputName.addEventListener('input', () => {
      draftProfile.name = profInputName.value.trim() || 'Kullanıcı';
      renderUserInfo();
      checkChanges();
    });
  }

  if (profInputHandle) {
    profInputHandle.addEventListener('input', () => {
      let h = profInputHandle.value.trim();
      if (h && !h.startsWith('@')) h = '@' + h;
      draftProfile.handle = h || '@kullanici';
      renderUserInfo();
      checkChanges();
    });
  }

  if (profInputStatus) {
    profInputStatus.addEventListener('input', () => {
      draftProfile.statusText = profInputStatus.value.trim();
      renderUserInfo();
      checkChanges();
    });
  }

  if (profInputBio) {
    profInputBio.addEventListener('input', () => {
      draftProfile.bio = profInputBio.value;
      renderUserInfo();
      checkChanges();
    });
  }

  // Quick edit buttons on account tab
  document.querySelectorAll('.btn-edit-account-field').forEach(btn => {
    btn.addEventListener('click', () => {
      const f = btn.dataset.field;
      if (f === 'name') {
        const newName = prompt('Yeni görünen isminizi girin:', draftProfile.name);
        if (newName && newName.trim()) {
          draftProfile.name = newName.trim();
          renderUserInfo();
          checkChanges();
        }
      } else if (f === 'handle') {
        let newHandle = prompt('Yeni kullanıcı adınızı girin:', draftProfile.handle);
        if (newHandle && newHandle.trim()) {
          if (!newHandle.startsWith('@')) newHandle = '@' + newHandle;
          draftProfile.handle = newHandle.trim();
          renderUserInfo();
          checkChanges();
        }
      } else if (f === 'email') {
        const newEmail = prompt('Yeni e-posta adresinizi girin:', draftProfile.email);
        if (newEmail && newEmail.includes('@')) {
          draftProfile.email = newEmail.trim();
          renderUserInfo();
          checkChanges();
        }
      }
    });
  });

  // 6. Save & Discard (Floating Save Bar)
  function saveProfileAndSettings(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const curName = (profInputName ? profInputName.value.trim() : draftProfile.name) || draftProfile.name || 'Kullanıcı';
    let curHandle = (profInputHandle ? profInputHandle.value.trim() : draftProfile.handle) || draftProfile.handle || '@kullanici';
    if (!curHandle.startsWith('@')) curHandle = '@' + curHandle;
    const curBio = profInputBio ? profInputBio.value.trim() : (draftProfile.bio || '');
    const curStatus = profInputStatus ? profInputStatus.value.trim() : (draftProfile.statusText || '');

    draftProfile.name = curName;
    draftProfile.handle = curHandle;
    draftProfile.bio = curBio;
    draftProfile.statusText = curStatus;

    const updateObj = {
      name: draftProfile.name,
      handle: draftProfile.handle,
      avatar: draftProfile.avatar || '',
      banner: draftProfile.banner || '',
      bio: draftProfile.bio || '',
      email: draftProfile.email || `${curHandle.replace('@', '')}@ziorse.app`,
      statusText: curStatus,
      statusType: draftProfile.statusType || 'online',
      fontStyle: draftProfile.fontStyle || 'outfit',
      nameColor: draftProfile.nameColor || '#ffffff',
      nameEffects: draftProfile.nameEffects || [],
      avatarFrame: draftProfile.avatarFrame || 'none'
    };

    // Save user to dataStore
    ds.saveUser(updateObj);
    if (window.dataStore && window.dataStore !== ds && typeof window.dataStore.saveUser === 'function') {
      try { window.dataStore.saveUser(updateObj); } catch (e) {}
    }

    // Instant In-Place Live Media & Display Update on Parent Window (Zero Reload!)
    const targetParent = (window.parent && window.parent !== window) ? window.parent : (window.opener || null);
    if (targetParent) {
      if (targetParent.dataStore && targetParent.dataStore !== ds && typeof targetParent.dataStore.saveUser === 'function') {
        try { targetParent.dataStore.saveUser(updateObj); } catch (e) {}
      }
      if (typeof targetParent.updateLiveUserMedia === 'function') {
        targetParent.updateLiveUserMedia(
          updateObj.handle,
          updateObj.avatar,
          updateObj.banner,
          updateObj.fontStyle,
          updateObj.nameColor,
          updateObj.nameEffects,
          updateObj.avatarFrame
        );
      }
      if (typeof targetParent.syncUserDisplay === 'function') {
        targetParent.syncUserDisplay();
      }
    }

    // Emit over socket if connected
    const activeSocket = window.socket || (targetParent && targetParent.socket);
    if (activeSocket) {
      activeSocket.emit('sync-user-profile', {
        name: updateObj.name,
        handle: updateObj.handle,
        avatar: updateObj.avatar,
        banner: updateObj.banner,
        bio: updateObj.bio,
        fontStyle: updateObj.fontStyle,
        nameColor: updateObj.nameColor,
        nameEffects: updateObj.nameEffects,
        avatarFrame: updateObj.avatarFrame,
        status: { type: updateObj.statusType, text: updateObj.statusText }
      });
    }

    // Sync originalProfile so checkChanges sees no diff
    originalProfile = JSON.parse(JSON.stringify(draftProfile));

    renderUserInfo();

    // Force-close save bar
    if (saveBar) {
      saveBar.classList.remove('visible');
    }

    showToast('Değişiklikler başarıyla kaydedildi');
  }

  if (btnSave) {
    btnSave.addEventListener('click', saveProfileAndSettings);
  }

  if (btnDiscard) {
    btnDiscard.addEventListener('click', (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      draftProfile = JSON.parse(JSON.stringify(originalProfile));
      if (profInputName) profInputName.value = draftProfile.name;
      if (profInputHandle) profInputHandle.value = draftProfile.handle;
      if (profInputStatus) profInputStatus.value = draftProfile.statusText;
      if (profInputBio) profInputBio.value = draftProfile.bio;
      renderUserInfo();
      // Force-close save bar
      if (saveBar) {
        saveBar.classList.remove('visible');
      }
      showToast('Değişiklikler geri alındı');
    });
  }

  // 7. Appearance Options
  const savedTheme = ds.theme || localStorage.getItem('ziorse_theme_preference') || 'light';
  themeCards.forEach(tc => {
    if (tc.dataset.theme === savedTheme) {
      tc.classList.add('active');
      tc.style.borderColor = '#dbdbdb';
    } else {
      tc.classList.remove('active');
    }
    tc.addEventListener('click', () => {
      themeCards.forEach(c => {
        c.classList.remove('active');
        c.style.borderColor = 'var(--border-color)';
      });
      tc.classList.add('active');
      tc.style.borderColor = '#dbdbdb';
      const th = tc.dataset.theme;
      ds.setTheme(th);
      localStorage.setItem('ziorse_theme_preference', th);
      document.body.classList.toggle('dark-mode', th === 'dark');

      const targetParent = (window.parent && window.parent !== window) ? window.parent : (window.opener || null);
      if (targetParent) {
        if (targetParent.dataStore) targetParent.dataStore.setTheme(th);
        if (targetParent.document && targetParent.document.body) {
          targetParent.document.body.classList.toggle('dark-mode', th === 'dark');
        }
      }
      showToast(`Tema ${tc.querySelector('span').textContent} olarak ayarlandı`);
    });
  });

  // Font size persistence
  const savedFontSize = ziorseGetStorage('ziorse_chat_font_size') || localStorage.getItem('ziorse_chat_font_size');
  if (savedFontSize && rangeFontSize && labelFontSize) {
    rangeFontSize.value = savedFontSize;
    labelFontSize.textContent = savedFontSize + 'px';
  }

  if (rangeFontSize && labelFontSize) {
    rangeFontSize.addEventListener('input', (e) => {
      labelFontSize.textContent = e.target.value + 'px';
      localStorage.setItem('ziorse_chat_font_size', e.target.value);
      ziorseSetStorage('ziorse_chat_font_size', e.target.value);
      const targetParent = (window.parent && window.parent !== window) ? window.parent : (window.opener || null);
      if (targetParent && targetParent.document) {
        targetParent.document.documentElement.style.setProperty('--chat-font-size', e.target.value + 'px');
      }
    });
  }

  // Voice volume persistence
  const rangeMicVol = document.getElementById('range-mic-vol');
  const labelMicVol = document.getElementById('label-mic-vol');
  const savedMicVol = ziorseGetStorage('ziorse_mic_volume') || localStorage.getItem('ziorse_mic_volume');
  if (savedMicVol && rangeMicVol && labelMicVol) {
    rangeMicVol.value = savedMicVol;
    labelMicVol.textContent = savedMicVol + '%';
  }
  if (rangeMicVol && labelMicVol) {
    rangeMicVol.addEventListener('input', (e) => {
      labelMicVol.textContent = e.target.value + '%';
      ziorseSetStorage('ziorse_mic_volume', e.target.value);
      localStorage.setItem('ziorse_mic_volume', e.target.value);
    });
  }

  const rangeOutputVol = document.getElementById('range-output-vol');
  const labelOutputVol = document.getElementById('label-output-vol');
  const savedOutputVol = ziorseGetStorage('ziorse_output_volume') || localStorage.getItem('ziorse_output_volume');
  if (savedOutputVol && rangeOutputVol && labelOutputVol) {
    rangeOutputVol.value = savedOutputVol;
    labelOutputVol.textContent = savedOutputVol + '%';
  }
  if (rangeOutputVol && labelOutputVol) {
    rangeOutputVol.addEventListener('input', (e) => {
      labelOutputVol.textContent = e.target.value + '%';
      ziorseSetStorage('ziorse_output_volume', e.target.value);
      localStorage.setItem('ziorse_output_volume', e.target.value);
    });
  }

  // Şifre Değiştirme Butonu
  const btnChangePassword = document.getElementById('btn-change-password');
  if (btnChangePassword) {
    btnChangePassword.addEventListener('click', () => {
      const oldPass = prompt('Mevcut şifrenizi girin:');
      if (oldPass === null) return;
      if (!oldPass.trim()) {
        showToast('Mevcut şifre boş bırakılamaz');
        return;
      }

      const rawAccounts = ziorseGetStorage('ziorse_accounts');
      let accountsList = (typeof rawAccounts === 'string' ? JSON.parse(rawAccounts) : rawAccounts) || [];
      const userHandleClean = (cu.handle || '').toLowerCase().replace('@', '');
      const accountIndex = accountsList.findIndex(a => (a.handle || '').toLowerCase().replace('@', '') === userHandleClean);

      if (accountIndex === -1) {
        showToast('Kullanıcı hesabı bulunamadı');
        return;
      }

      const acc = accountsList[accountIndex];
      const match = (acc.password === oldPass || acc.passwordHash === oldPass);
      if (!match) {
        showToast('Mevcut şifre hatalı!');
        return;
      }

      const newPass = prompt('Yeni şifrenizi girin (en az 4 karakter):');
      if (newPass === null) return;
      if (!newPass.trim() || newPass.trim().length < 4) {
        showToast('Yeni şifre en az 4 karakter olmalıdır');
        return;
      }

      const confirmPass = prompt('Yeni şifrenizi tekrar girin:');
      if (confirmPass !== newPass) {
        showToast('Şifreler eşleşmiyor!');
        return;
      }

      acc.password = newPass.trim();
      acc.passwordHash = newPass.trim();
      accountsList[accountIndex] = acc;
      ziorseSetStorage('ziorse_accounts', accountsList);
      showToast('Şifreniz başarıyla değiştirildi ✓');
    });
  }

  // 8. Mic Test Visualizer
  if (btnTestMic && micTestBar) {
    btnTestMic.addEventListener('click', () => {
      if (micTestInterval) {
        clearInterval(micTestInterval);
        micTestInterval = null;
        micTestBar.style.width = '0%';
        btnTestMic.innerHTML = `<i data-lucide="mic" style="width:14px;height:14px;"></i> Testi Başlat`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
      } else {
        btnTestMic.innerHTML = `<i data-lucide="mic-off" style="width:14px;height:14px;"></i> Testi Durdur`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        micTestInterval = setInterval(() => {
          const randLevel = Math.floor(Math.random() * 65) + 20;
          micTestBar.style.width = randLevel + '%';
        }, 120);
      }
    });
  }

  // 9. Logout
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      if (confirm('Oturumunuzu kapatmak istediğinize emin misiniz?')) {
        ds.logout();
      }
    });
  }

  // 10. Close / ESC Handlers
  function goBack() {
    const hasChanges = (saveBar && saveBar.classList.contains('visible'));
    if (hasChanges) {
      if (!confirm('Kaydedilmemiş değişiklikleriniz var. Çıkış yapmak istiyor musunuz?')) {
        return;
      }
    }
    if (window.parent && window.parent !== window && typeof window.parent.closeModalView === 'function') {
      window.parent.closeModalView({ type: 'user-updated', user: draftProfile });
    } else {
      window.location.href = 'index.html';
    }
  }

  if (btnClose) {
    btnClose.addEventListener('click', goBack);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      goBack();
    }
  });

  // =========================================================
  // HESABIM: DYNAMIC AVATAR FRAMES & FONT / COLOR HANDLERS
  // =========================================================
  let availableFrames = [];

  window.FRAME_SCALES = window.FRAME_SCALES || {
    'Lord.png': 156
  };

  function getFrameScale(frameSrc) {
    if (!frameSrc || frameSrc === 'none') return 118;
    const cleanName = String(frameSrc).split('/').pop().split('?')[0];
    return (window.FRAME_SCALES && window.FRAME_SCALES[cleanName]) || 118;
  }
  window.getFrameScale = getFrameScale;

  async function loadAvatarFrames() {
    try {
      if (window.electronAPI && typeof window.electronAPI.getAvatarFrames === 'function') {
        availableFrames = await window.electronAPI.getAvatarFrames();
        availableFrames.forEach(f => {
          if (f.scale) window.FRAME_SCALES[f.id] = f.scale;
        });
      } else {
        const res = await fetch('http://localhost:3000/api/avatar-frames');
        const data = await res.json();
        availableFrames = data.frames || [];
        availableFrames.forEach(f => {
          if (f.scale) window.FRAME_SCALES[f.id] = f.scale;
        });
      }
    } catch (err) {
      availableFrames = [
        { id: 'Lord.png', name: 'Lord', url: 'assets/avatar-frames/Lord.png', scale: 156 }
      ];
    }
    renderAvatarFramesGrid();
  }

  function renderAvatarFramesGrid() {
    const grid = document.getElementById('hesabim-frames-grid');
    if (!grid) return;
    grid.innerHTML = `
      <div class="hesabim-frame-item ${(!draftProfile.avatarFrame || draftProfile.avatarFrame === 'none') ? 'active' : ''}" data-frame-id="none">
        <div class="hesabim-frame-preview-box">
          <div class="hesabim-frame-none-icon">🚫</div>
        </div>
        <span class="hesabim-frame-name">Çerçevesiz</span>
      </div>
    `;

    availableFrames.forEach(f => {
      const isAct = draftProfile.avatarFrame === f.id || draftProfile.avatarFrame === f.url || (draftProfile.avatarFrame && draftProfile.avatarFrame.endsWith(f.id));
      const div = document.createElement('div');
      div.className = `hesabim-frame-item ${isAct ? 'active' : ''}`;
      div.dataset.frameId = f.id;
      div.dataset.frameUrl = f.url;
      div.innerHTML = `
        <div class="hesabim-frame-preview-box">
          <img src="${f.url}" alt="${f.name}">
        </div>
        <span class="hesabim-frame-name" title="${f.name}">${f.name}</span>
      `;
      grid.appendChild(div);
    });
  }

  // Open frames folder in Windows Explorer
  document.getElementById('btn-open-frames-folder')?.addEventListener('click', () => {
    if (window.electronAPI && typeof window.electronAPI.openAvatarFramesFolder === 'function') {
      window.electronAPI.openAvatarFramesFolder();
      showToast('Çerçeveler klasörü açıldı');
    } else {
      showToast('Klasör: src/assets/avatar-frames/');
    }
  });

  // Refresh frames list button
  document.getElementById('btn-refresh-frames')?.addEventListener('click', async () => {
    await loadAvatarFrames();
    showToast('Çerçeve listesi güncellendi');
  });

  // Debounced Broadcast: Runs once per animation frame (max 60fps) to eliminate UI freezing
  let broadcastRaf = null;
  function broadcastLiveStyleChanges() {
    if (broadcastRaf) cancelAnimationFrame(broadcastRaf);
    broadcastRaf = requestAnimationFrame(() => {
      broadcastRaf = null;
      const targetParent = (window.parent && window.parent !== window) ? window.parent : (window.opener || null);
      if (targetParent && typeof targetParent.updateLiveUserMedia === 'function') {
        targetParent.updateLiveUserMedia(
          draftProfile.handle,
          draftProfile.avatar,
          draftProfile.banner,
          draftProfile.fontStyle,
          draftProfile.nameColor,
          draftProfile.nameEffects,
          draftProfile.avatarFrame
        );
      }
    });
  }

  // Ultra-lightweight in-place style updater (no video reloads, zero lag)
  function updateLiveStyleControlsAndPreview() {
    if (accPreviewName) {
      const fontFamilies = {
        'outfit': "'Outfit', sans-serif",
        'cyber': "'Russo One', sans-serif",
        'cursive': "'Caveat', cursive",
        'pixel': "'Press Start 2P', monospace",
        'serif': "'Cinzel', serif",
        'neon': "'Righteous', cursive",
        'terminal': "'JetBrains Mono', monospace",
        'inter': "'Inter', sans-serif"
      };
      accPreviewName.style.fontFamily = fontFamilies[draftProfile.fontStyle] || fontFamilies['outfit'];

      if (draftProfile.nameColor && draftProfile.nameColor.startsWith('linear-gradient')) {
        accPreviewName.style.background = draftProfile.nameColor;
        accPreviewName.style.webkitBackgroundClip = 'text';
        accPreviewName.style.webkitTextFillColor = 'transparent';
        accPreviewName.style.color = 'transparent';
      } else {
        accPreviewName.style.background = 'none';
        accPreviewName.style.webkitBackgroundClip = 'unset';
        accPreviewName.style.webkitTextFillColor = draftProfile.nameColor || 'var(--text-main)';
        accPreviewName.style.color = draftProfile.nameColor || 'var(--text-main)';
      }

      const effects = draftProfile.nameEffects || [];
      let textShadows = [];
      if (effects.includes('glow')) {
        const glowColor = (draftProfile.nameColor && draftProfile.nameColor.startsWith('#')) ? draftProfile.nameColor : '#00f2fe';
        textShadows.push(`0 0 12px ${glowColor}`);
      }
      if (effects.includes('shadow')) {
        textShadows.push('2px 3px 5px rgba(0, 0, 0, 0.8)');
      }
      accPreviewName.style.textShadow = textShadows.length > 0 ? textShadows.join(', ') : 'none';
      accPreviewName.style.letterSpacing = effects.includes('spaced') ? '2px' : 'normal';
    }

    const frameOverlay = document.getElementById('acc-avatar-frame-overlay');
    if (frameOverlay) {
      if (draftProfile.avatarFrame && draftProfile.avatarFrame !== 'none') {
        let frameSrc = draftProfile.avatarFrame;
        if (!frameSrc.includes('/') && !frameSrc.startsWith('data:')) {
          frameSrc = `assets/avatar-frames/${frameSrc}`;
        }
        const scale = getFrameScale(frameSrc);
        frameOverlay.src = frameSrc;
        frameOverlay.style.width = `${scale}%`;
        frameOverlay.style.height = `${scale}%`;
        frameOverlay.style.display = 'block';
      } else {
        frameOverlay.style.display = 'none';
      }
    }

    document.querySelectorAll('.hesabim-font-chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.font === draftProfile.fontStyle);
    });
    document.querySelectorAll('.hesabim-color-dot').forEach(dot => {
      dot.classList.toggle('active', dot.dataset.color === draftProfile.nameColor);
    });
    document.querySelectorAll('.hesabim-effect-toggle').forEach(tgl => {
      tgl.classList.toggle('active', (draftProfile.nameEffects || []).includes(tgl.dataset.effect));
    });
    document.querySelectorAll('.hesabim-frame-item').forEach(item => {
      const fId = item.dataset.frameId;
      const isAct = (!draftProfile.avatarFrame || draftProfile.avatarFrame === 'none')
        ? (fId === 'none')
        : (draftProfile.avatarFrame === fId || draftProfile.avatarFrame === item.dataset.frameUrl || (draftProfile.avatarFrame && draftProfile.avatarFrame.endsWith(fId)));
      item.classList.toggle('active', isAct);
    });

    checkChanges();
    broadcastLiveStyleChanges();
  }

  // Frame item click
  document.getElementById('hesabim-frames-grid')?.addEventListener('click', (e) => {
    const item = e.target.closest('.hesabim-frame-item');
    if (!item) return;
    const fId = item.dataset.frameId;
    draftProfile.avatarFrame = fId === 'none' ? 'none' : (item.dataset.frameUrl || fId);
    updateLiveStyleControlsAndPreview();
  });

  // Font chips click in Hesabım
  document.getElementById('hesabim-font-grid')?.addEventListener('click', (e) => {
    const chip = e.target.closest('.hesabim-font-chip');
    if (!chip) return;
    draftProfile.fontStyle = chip.dataset.font;
    updateLiveStyleControlsAndPreview();
  });

  // Color dots click in Hesabım
  document.getElementById('hesabim-color-row')?.addEventListener('click', (e) => {
    const dot = e.target.closest('.hesabim-color-dot');
    if (!dot) return;
    draftProfile.nameColor = dot.dataset.color;
    updateLiveStyleControlsAndPreview();
  });

  // Custom color picker in Hesabım
  document.getElementById('hesabim-custom-color-input')?.addEventListener('input', (e) => {
    draftProfile.nameColor = e.target.value;
    updateLiveStyleControlsAndPreview();
  });

  // Effect toggles click in Hesabım
  document.querySelectorAll('.hesabim-effect-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const eff = btn.dataset.effect;
      if (!draftProfile.nameEffects) draftProfile.nameEffects = [];
      if (draftProfile.nameEffects.includes(eff)) {
        draftProfile.nameEffects = draftProfile.nameEffects.filter(x => x !== eff);
      } else {
        draftProfile.nameEffects.push(eff);
      }
      updateLiveStyleControlsAndPreview();
    });
  });

  // Initial frames load & render
  loadAvatarFrames();
  renderUserInfo();
  checkChanges();

  const urlParams = new URLSearchParams(window.location.search);
  const initialSection = urlParams.get('section');
  if (initialSection) {
    switchSection(initialSection);
  }
});
