/**
 * Ziorse - profile-edit.js
 * Discord-Style Rich Profile Editor with Live Interactive Preview,
 * Custom Display Name Fonts, Colors, Avatar Frames, Atmosphere Effects, and Widgets.
 */

document.addEventListener('DOMContentLoaded', () => {

  const ds = (window.parent && window.parent !== window && window.parent.dataStore)
    ? window.parent.dataStore
    : window.dataStore;

  // Initialize Lucide icons
  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }
  refreshIcons();

  // Toast notifications
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
    }, 2400);
  }

  // DOM Elements
  const backdrop        = document.getElementById('pe-backdrop');
  const modalContainer  = document.getElementById('pe-modal-container');
  const btnClose        = document.getElementById('btn-close-profile-edit');
  const changeBar       = document.getElementById('pe-change-bar');
  const btnSave         = document.getElementById('btn-pe-save');
  const btnDiscard      = document.getElementById('btn-pe-discard');

  // Input Fields
  const inputName       = document.getElementById('pe-input-name');
  const inputHandle     = document.getElementById('pe-input-handle');
  const inputPronouns   = document.getElementById('pe-input-pronouns');
  const inputBio        = document.getElementById('pe-input-bio');
  const selectStatusEmoji = document.getElementById('pe-select-status-emoji');
  const inputStatusText = document.getElementById('pe-input-status-text');

  // Avatar & Banner
  const avatarPreview   = document.getElementById('pe-avatar-preview');
  const bannerPreview   = document.getElementById('pe-banner-preview');
  const btnPickAvatar   = document.getElementById('btn-pe-pick-avatar');
  const fileAvatar      = document.getElementById('pe-file-avatar');
  const btnPickBanner   = document.getElementById('btn-pe-pick-banner');
  const fileBanner      = document.getElementById('pe-file-banner');
  const pickerCustomColor = document.getElementById('pe-picker-custom-color');

  // Live Card Elements
  const liveCard        = document.getElementById('pe-live-card');
  const liveBanner      = document.getElementById('pe-live-banner');
  const liveAvatarImg   = document.getElementById('pe-live-avatar-img');
  const liveAvatarFrame = document.getElementById('pe-live-avatar-frame');
  const liveEffectLayer = document.getElementById('pe-live-effect-layer');
  const liveStatusDot   = document.getElementById('pe-live-status-dot');
  const liveStatusPill  = document.getElementById('pe-live-status-pill');
  const liveStatusEmoji = document.getElementById('pe-live-status-emoji');
  const liveStatusText  = document.getElementById('pe-live-status-text');
  const liveName        = document.getElementById('pe-live-name');
  const liveHandle      = document.getElementById('pe-live-handle');
  const livePronouns    = document.getElementById('pe-live-pronouns');
  const liveBio         = document.getElementById('pe-live-bio');
  const liveJoinedDate  = document.getElementById('pe-live-joined-date');
  const liveWidgetsStack= document.getElementById('pe-live-widgets-stack');

  // Fonts Map
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

  // Load Current Profile
  const profile = (ds && ds.currentUser) ? ds.currentUser : (window.dataStore?.currentUser || {});

  // Original Values (for Dirty Check & Discard)
  let original = {
    name: profile.name || '',
    handle: profile.handle || '',
    pronouns: profile.pronouns || '',
    bio: profile.bio || '',
    avatar: profile.avatar || window.DEFAULT_AVATAR || 'assets/default-avatar.png',
    banner: profile.banner || '#2b2d31',
    fontStyle: profile.fontStyle || 'outfit',
    nameColor: profile.nameColor || '#ffffff',
    nameEffects: Array.isArray(profile.nameEffects) ? [...profile.nameEffects] : [],
    avatarFrame: profile.avatarFrame || 'none',
    profileEffect: profile.profileEffect || 'none',
    customStatus: profile.customStatus || { emoji: '💭', text: '' },
    widgets: Array.isArray(profile.widgets) ? JSON.parse(JSON.stringify(profile.widgets)) : [
      { id: 'favorite_game', title: 'Favori Oyun', value: 'League of Legends', icon: '🏆' },
      { id: 'spotify', title: 'Sevdiğim Şarkı', value: 'Synthwave Dreams - Retro Knight', icon: '🎵' }
    ]
  };

  // Working state copy
  let current = JSON.parse(JSON.stringify(original));

  // --- Populate UI from Data ---
  function populateUI(data) {
    inputName.value = data.name;
    inputHandle.value = data.handle;
    inputPronouns.value = data.pronouns;
    inputBio.value = data.bio;
    selectStatusEmoji.value = data.customStatus?.emoji || '💭';
    inputStatusText.value = data.customStatus?.text || '';

    // Avatar preview
    avatarPreview.src = data.avatar || window.DEFAULT_AVATAR || 'assets/default-avatar.png';

    // Banner preview
    if (data.banner && (data.banner.startsWith('data:image/') || data.banner.startsWith('http') || data.banner.startsWith('/uploads/'))) {
      bannerPreview.style.backgroundImage = `url('${data.banner}')`;
      bannerPreview.style.backgroundColor = 'transparent';
    } else {
      bannerPreview.style.backgroundImage = 'none';
      bannerPreview.style.background = data.banner || '#2b2d31';
    }

    // Font tile selection
    document.querySelectorAll('.pe-font-tile').forEach(tile => {
      tile.classList.toggle('active', tile.dataset.font === data.fontStyle);
    });

    // Name color selection
    let matchedColor = false;
    document.querySelectorAll('.pe-color-pill[data-color]').forEach(pill => {
      const isMatch = pill.dataset.color === data.nameColor;
      pill.classList.toggle('active', isMatch);
      if (isMatch) matchedColor = true;
    });
    if (!matchedColor && data.nameColor && data.nameColor.startsWith('#')) {
      pickerCustomColor.value = data.nameColor;
    }

    // Effect chips
    document.querySelectorAll('.pe-toggle-chip').forEach(chip => {
      chip.classList.toggle('active', (data.nameEffects || []).includes(chip.dataset.effect));
    });

    // Avatar frames
    document.querySelectorAll('.pe-frame-tile').forEach(tile => {
      tile.classList.toggle('active', tile.dataset.frame === data.avatarFrame);
    });

    // Banner preset pills
    document.querySelectorAll('.pe-color-pill[data-banner]').forEach(pill => {
      pill.classList.toggle('active', pill.dataset.banner === data.banner);
    });

    // Atmosphere effects
    document.querySelectorAll('.pe-effect-tile').forEach(tile => {
      tile.classList.toggle('active', tile.dataset.effect === data.profileEffect);
    });

    // Widget grid active states
    document.querySelectorAll('.pe-widget-card').forEach(card => {
      const wid = card.dataset.widgetId;
      const isAdded = (data.widgets || []).some(w => w.id === wid);
      card.classList.toggle('added', isAdded);
    });

    updateLivePreview();
  }

  // --- Real-time Live Preview Card Updater ---
  function updateLivePreview() {
    // 1. Name & Font & Color & Effects
    const displayName = inputName.value.trim() || current.handle || 'Kullanıcı';
    liveName.textContent = displayName;

    // Apply Font
    const chosenFont = fontFamilies[current.fontStyle] || fontFamilies['outfit'];
    liveName.style.fontFamily = chosenFont;

    // Apply Color & Gradient
    if (current.nameColor && current.nameColor.startsWith('linear-gradient')) {
      liveName.style.background = current.nameColor;
      liveName.style.webkitBackgroundClip = 'text';
      liveName.style.webkitTextFillColor = 'transparent';
      liveName.style.color = 'transparent';
    } else {
      liveName.style.background = 'none';
      liveName.style.webkitBackgroundClip = 'unset';
      liveName.style.webkitTextFillColor = current.nameColor || '#ffffff';
      liveName.style.color = current.nameColor || '#ffffff';
    }

    // Apply Text Effects (Glow / Depth Shadow / Spacing)
    const effects = current.nameEffects || [];
    let textShadows = [];
    if (effects.includes('glow')) {
      const glowColor = (current.nameColor && current.nameColor.startsWith('#')) ? current.nameColor : '#00f2fe';
      textShadows.push(`0 0 14px ${glowColor}`, `0 0 24px rgba(88, 101, 242, 0.6)`);
    }
    if (effects.includes('shadow')) {
      textShadows.push('2px 3px 6px rgba(0, 0, 0, 0.9)');
    }
    liveName.style.textShadow = textShadows.join(', ') || 'none';
    liveName.style.letterSpacing = effects.includes('spaced') ? '2.5px' : 'normal';

    // 2. Handle & Pronouns
    let handleText = inputHandle.value.trim() || current.handle || '@kullanici';
    if (!handleText.startsWith('@')) handleText = '@' + handleText;
    liveHandle.textContent = handleText;

    const pronounsText = inputPronouns.value.trim();
    if (pronounsText) {
      livePronouns.textContent = pronounsText;
      livePronouns.style.display = 'inline-block';
    } else {
      livePronouns.style.display = 'none';
    }

    // 3. Avatar & Frame
    liveAvatarImg.src = current.avatar || window.DEFAULT_AVATAR || 'assets/default-avatar.png';
    liveAvatarImg.onerror = () => { liveAvatarImg.src = window.DEFAULT_AVATAR || 'assets/default-avatar.png'; };

    // Reset frame classes
    liveAvatarFrame.className = 'pe-avatar-frame-element';
    if (current.avatarFrame && current.avatarFrame !== 'none') {
      liveAvatarFrame.classList.add(`avatar-frame-${current.avatarFrame}`);
    }

    // 4. Banner (Image or Gradient/Color)
    if (current.banner && (current.banner.startsWith('data:image/') || current.banner.startsWith('http') || current.banner.startsWith('/uploads/'))) {
      liveBanner.style.backgroundImage = `url('${current.banner}')`;
      liveBanner.style.backgroundColor = 'transparent';
    } else {
      liveBanner.style.backgroundImage = 'none';
      liveBanner.style.background = current.banner || '#2b2d31';
    }

    // 5. Atmosphere Effects Overlay
    liveEffectLayer.className = 'pe-live-effect-layer';
    if (current.profileEffect && current.profileEffect !== 'none') {
      liveEffectLayer.classList.add(`pe-effect-${current.profileEffect}-active`);
    }

    // 6. Custom Status Pill
    const stEmoji = selectStatusEmoji.value || '💭';
    const stText = inputStatusText.value.trim();
    if (stText) {
      liveStatusEmoji.textContent = stEmoji;
      liveStatusText.textContent = stText;
      liveStatusPill.style.display = 'inline-flex';
    } else {
      liveStatusPill.style.display = 'none';
    }

    // 7. Bio
    const bioText = inputBio.value.trim();
    liveBio.textContent = bioText || 'Henüz bir biyografi eklenmedi.';

    // 8. Widgets Stack
    renderLiveWidgetsStack();
  }

  // Render widgets on preview card
  function renderLiveWidgetsStack() {
    liveWidgetsStack.innerHTML = '';
    const widgets = current.widgets || [];
    if (widgets.length === 0) {
      liveWidgetsStack.innerHTML = '<span style="font-size:0.7rem; color:#80848e;">Ekli widget bulunmuyor.</span>';
      return;
    }

    widgets.forEach(w => {
      const chip = document.createElement('div');
      chip.className = 'pe-live-widget-chip';
      chip.innerHTML = `
        <span class="pe-live-widget-icon">${w.icon || '📌'}</span>
        <div class="pe-live-widget-texts">
          <span class="pe-live-widget-title">${escapeHtml(w.title || '')}</span>
          <span class="pe-live-widget-sub">${escapeHtml(w.value || '')}</span>
        </div>
      `;
      liveWidgetsStack.appendChild(chip);
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // --- Dirty Check ---
  let isDirty = false;
  function checkDirty() {
    current.name = inputName.value;
    current.handle = inputHandle.value;
    current.pronouns = inputPronouns.value;
    current.bio = inputBio.value;
    current.customStatus = {
      emoji: selectStatusEmoji.value,
      text: inputStatusText.value
    };

    const hasChanged =
      current.name !== original.name ||
      current.handle !== original.handle ||
      current.pronouns !== original.pronouns ||
      current.bio !== original.bio ||
      current.avatar !== original.avatar ||
      current.banner !== original.banner ||
      current.fontStyle !== original.fontStyle ||
      current.nameColor !== original.nameColor ||
      JSON.stringify(current.nameEffects.sort()) !== JSON.stringify(original.nameEffects.sort()) ||
      current.avatarFrame !== original.avatarFrame ||
      current.profileEffect !== original.profileEffect ||
      current.customStatus.text !== original.customStatus.text ||
      current.customStatus.emoji !== original.customStatus.emoji ||
      JSON.stringify(current.widgets) !== JSON.stringify(original.widgets);

    if (hasChanged !== isDirty) {
      isDirty = hasChanged;
      if (isDirty) {
        changeBar.classList.remove('pe-change-bar--hidden');
      } else {
        changeBar.classList.add('pe-change-bar--hidden');
      }
    }
    updateLivePreview();
  }

  // Event Listeners for text inputs
  [inputName, inputHandle, inputPronouns, inputBio, inputStatusText, selectStatusEmoji].forEach(el => {
    el.addEventListener('input', checkDirty);
    el.addEventListener('change', checkDirty);
  });

  // --- Font Selection ---
  document.getElementById('pe-font-grid')?.addEventListener('click', (e) => {
    const tile = e.target.closest('.pe-font-tile');
    if (!tile) return;
    document.querySelectorAll('.pe-font-tile').forEach(t => t.classList.remove('active'));
    tile.classList.add('active');
    current.fontStyle = tile.dataset.font;
    checkDirty();
  });

  // --- Color Selection ---
  document.getElementById('pe-color-grid')?.addEventListener('click', (e) => {
    const pill = e.target.closest('.pe-color-pill');
    if (!pill) return;
    document.querySelectorAll('.pe-color-pill[data-color]').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    current.nameColor = pill.dataset.color;
    checkDirty();
  });

  // Custom Color Picker
  pickerCustomColor?.addEventListener('input', (e) => {
    document.querySelectorAll('.pe-color-pill[data-color]').forEach(p => p.classList.remove('active'));
    current.nameColor = e.target.value;
    checkDirty();
  });

  // --- Name Effect Toggles ---
  document.querySelectorAll('.pe-toggle-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
      const eff = chip.dataset.effect;
      if (chip.classList.contains('active')) {
        if (!current.nameEffects.includes(eff)) current.nameEffects.push(eff);
      } else {
        current.nameEffects = current.nameEffects.filter(x => x !== eff);
      }
      checkDirty();
    });
  });

  // --- Avatar Frame Selection ---
  document.getElementById('pe-frame-grid')?.addEventListener('click', (e) => {
    const tile = e.target.closest('.pe-frame-tile');
    if (!tile) return;
    document.querySelectorAll('.pe-frame-tile').forEach(t => t.classList.remove('active'));
    tile.classList.add('active');
    current.avatarFrame = tile.dataset.frame;
    checkDirty();
  });

  // --- Banner Presets Selection ---
  document.getElementById('pe-banner-presets')?.addEventListener('click', (e) => {
    const pill = e.target.closest('.pe-color-pill');
    if (!pill) return;
    document.querySelectorAll('.pe-color-pill[data-banner]').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    current.banner = pill.dataset.banner;
    bannerPreview.style.backgroundImage = 'none';
    bannerPreview.style.background = current.banner;
    checkDirty();
  });

  // --- Profile Atmosphere Effects ---
  document.getElementById('pe-effects-grid')?.addEventListener('click', (e) => {
    const tile = e.target.closest('.pe-effect-tile');
    if (!tile) return;
    document.querySelectorAll('.pe-effect-tile').forEach(t => t.classList.remove('active'));
    tile.classList.add('active');
    current.profileEffect = tile.dataset.effect;
    checkDirty();
  });

  // --- Avatar Pick / Crop ---
  btnPickAvatar?.addEventListener('click', () => fileAvatar.click());
  fileAvatar?.addEventListener('change', (e) => {
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

  // --- Banner Pick / Crop ---
  btnPickBanner?.addEventListener('click', () => fileBanner.click());
  fileBanner?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (window.openImageCropper) {
      window.openImageCropper({
        file: file,
        shape: 'banner',
        aspectRatio: 2.7,
        title: 'Afiş (Banner) Görselini Ayarla',
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

  // --- Widgets Grid Interactions ---
  const defaultWidgetInfo = {
    custom: { title: 'Özel Not', value: 'Discord & Ziorse profili harika!', icon: '📌' },
    marvel_rivals: { title: 'Marvel Rivals', value: 'Venom & Scarlet Witch (Elmas II)', icon: '⚡' },
    wuthering_waves: { title: 'Wuthering Waves', value: 'Jiyan / Rover (Seviye 70)', icon: '🌊' },
    arknights: { title: 'Arknights Endfield', value: 'Endministrator (Global)', icon: '⚔️' },
    favorite_game: { title: 'Favori Oyun', value: 'League of Legends & Valorant', icon: '🏆' },
    loved_games: { title: 'Sevdiğim Oyunlar', value: 'Elden Ring, CS2, Cyberpunk 2077', icon: '❤️' },
    spotify: { title: 'Sevdiğim Şarkı', value: 'Starboy - The Weeknd', icon: '🎵' },
    socials: { title: 'Sosyal Medya', value: 'github.com/xenpian | x.com/ziorse', icon: '🌐' },
    rotating_games: { title: 'Dönüşümlü Oyunlar', value: 'Apex Legends, Minecraft', icon: '🔄' },
    wishlist_games: { title: 'Oynamak İstediklerim', value: 'GTA VI, Monster Hunter Wilds', icon: '🎯' }
  };

  document.getElementById('pe-widget-grid')?.addEventListener('click', (e) => {
    const card = e.target.closest('.pe-widget-card');
    if (!card) return;
    const wid = card.dataset.widgetId;
    if (!wid) return;

    if (!current.widgets) current.widgets = [];
    const existingIndex = current.widgets.findIndex(w => w.id === wid);

    if (existingIndex !== -1) {
      // Toggle off
      current.widgets.splice(existingIndex, 1);
      card.classList.remove('added');
      showToast('Widget profilden kaldırıldı');
    } else {
      // Toggle on or prompt custom value
      const def = defaultWidgetInfo[wid] || { title: 'Widget', value: 'Aktif', icon: '✨' };
      const customVal = prompt(`${def.title} widget içeriğini belirleyin:`, def.value);
      if (customVal === null) return; // user cancelled

      current.widgets.push({
        id: wid,
        title: def.title,
        value: customVal.trim() || def.value,
        icon: def.icon
      });
      card.classList.add('added');
      showToast(`${def.title} profiline eklendi`);
    }

    checkDirty();
  });

  // --- Save Changes ---
  function saveChanges() {
    let newHandle = inputHandle.value.trim() || original.handle;
    if (newHandle && !newHandle.startsWith('@')) {
      newHandle = '@' + newHandle;
    }

    const updateObj = {
      name: inputName.value.trim() || original.name,
      handle: newHandle,
      pronouns: inputPronouns.value.trim(),
      bio: inputBio.value.trim(),
      avatar: current.avatar,
      banner: current.banner,
      fontStyle: current.fontStyle,
      nameColor: current.nameColor,
      nameEffects: current.nameEffects,
      avatarFrame: current.avatarFrame,
      profileEffect: current.profileEffect,
      customStatus: {
        emoji: selectStatusEmoji.value || '💭',
        text: inputStatusText.value.trim()
      },
      widgets: current.widgets
    };

    // 1. DataStore local save
    if (window.dataStore && typeof window.dataStore.saveUser === 'function') {
      window.dataStore.saveUser(updateObj);
    }

    const targetParent = (window.parent && window.parent !== window) ? window.parent : (window.opener || null);
    if (targetParent && targetParent.dataStore && typeof targetParent.dataStore.saveUser === 'function') {
      try {
        targetParent.dataStore.saveUser(updateObj);
      } catch (err) { }
    }

    // 2. Instant Live Media & User Display Update on Parent Window
    if (targetParent && typeof targetParent.updateLiveUserMedia === 'function') {
      targetParent.updateLiveUserMedia(updateObj.handle, updateObj.avatar, updateObj.banner);
    }
    if (targetParent && typeof targetParent.syncUserDisplay === 'function') {
      targetParent.syncUserDisplay();
    }

    // 3. Socket broadcast
    const activeSocket = window.socket || (targetParent && targetParent.socket);
    if (activeSocket) {
      activeSocket.emit('sync-user-profile', {
        name: updateObj.name,
        handle: updateObj.handle,
        avatar: updateObj.avatar,
        banner: updateObj.banner,
        bio: updateObj.bio,
        pronouns: updateObj.pronouns,
        fontStyle: updateObj.fontStyle,
        nameColor: updateObj.nameColor,
        nameEffects: updateObj.nameEffects,
        avatarFrame: updateObj.avatarFrame,
        profileEffect: updateObj.profileEffect,
        widgets: updateObj.widgets,
        status: {
          type: (ds && ds.userStatus && ds.userStatus.type) || 'online',
          text: updateObj.customStatus.text
        }
      });
    }

    // Update originals
    original = JSON.parse(JSON.stringify(updateObj));
    current = JSON.parse(JSON.stringify(original));

    isDirty = false;
    changeBar.classList.add('pe-change-bar--hidden');
    showToast('Değişiklikler başarıyla kaydedildi!');

    // Smoothly close modal
    if (targetParent && typeof targetParent.closeModalView === 'function') {
      setTimeout(() => {
        targetParent.closeModalView({ type: 'user-updated', user: updateObj });
      }, 350);
    } else {
      setTimeout(() => {
        if (window.history.length > 1) window.history.back();
        else window.location.href = 'index.html';
      }, 500);
    }
  }

  // --- Discard Changes ---
  function discardChanges() {
    current = JSON.parse(JSON.stringify(original));
    populateUI(original);
    isDirty = false;
    changeBar.classList.add('pe-change-bar--hidden');
    showToast('Değişiklikler geri alındı');
  }

  btnSave?.addEventListener('click', saveChanges);
  btnDiscard?.addEventListener('click', discardChanges);

  // --- Close Modal / Go Back ---
  function goBack() {
    if (isDirty) {
      if (!confirm('Kaydedilmemiş değişiklikleriniz var. Çıkış yapılsın mı?')) {
        return;
      }
    }
    const targetParent = (window.parent && window.parent !== window) ? window.parent : null;
    if (targetParent && typeof targetParent.closeModalView === 'function') {
      targetParent.closeModalView();
    } else if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = 'index.html';
    }
  }

  btnClose?.addEventListener('click', goBack);

  // Close when clicking outside modal container on the translucent backdrop
  backdrop?.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      goBack();
    }
  });

  // ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      goBack();
    }
  });

  // Populate initially
  populateUI(original);
});
