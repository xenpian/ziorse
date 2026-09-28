/**
 * Ziorse - profile-view.js
 * URL'den ?handle=@xxx alarak kullanicinin profilini gosterir.
 * Mesaj kutusu yoktur. X / ESC ile geri donar.
 */

document.addEventListener('DOMContentLoaded', () => {

  const ds = (window.parent && window.parent !== window && window.parent.dataStore)
    ? window.parent.dataStore
    : window.dataStore;

  // --- Tema ---
  const curTh = (ds && ds.theme) || localStorage.getItem('ziorse_theme') || localStorage.getItem('ziorse_theme_v14') || localStorage.getItem('ziorse_theme_preference') || 'light';
  const isDarkInitial = curTh === 'dark';
  document.documentElement.classList.toggle('dark-mode', isDarkInitial);
  document.body.classList.toggle('dark-mode', isDarkInitial);

  // --- Lucide ---
  function refreshIcons() {
    if (window.lucide) window.lucide.createIcons();
  }
  refreshIcons();

  // --- Toast ---
  const toastEl = document.getElementById('pv-toast');
  function showToast(msg) {
    if (!toastEl) return;
    const t = document.createElement('div');
    t.className = 'pv-toast-item';
    t.textContent = msg;
    toastEl.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 260); }, 2600);
  }

  function hexToHue(hex) {
    if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return 0;
    let c = hex.slice(1);
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    if (c.length !== 6) return 0;
    const r = parseInt(c.slice(0, 2), 16) / 255;
    const g = parseInt(c.slice(2, 4), 16) / 255;
    const b = parseInt(c.slice(4, 6), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0;
    if (max !== min) {
      const d = max - min;
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
    }
    return Math.round(h);
  }

  // --- URL'den handle al ---
  const params = new URLSearchParams(window.location.search);
  const handle = params.get('handle') || '';

  if (!handle) {
    window.location.href = 'index.html';
    return;
  }

  // --- Elemanlar ---
  const elBanner = document.getElementById('pv-banner');
  const elAvatar = document.getElementById('pv-avatar');
  const elName = document.getElementById('pv-name');
  const elHandle = document.getElementById('pv-handle');
  const elBio = document.getElementById('pv-bio');
  const elStatPosts = document.getElementById('pv-stat-posts');
  const elStatFollowers = document.getElementById('pv-stat-followers');
  const elStatFollowing = document.getElementById('pv-stat-following');
  const elActionBtn = document.getElementById('pv-action-btn');
  const elPostsList = document.getElementById('pv-posts-list');
  const elPostsTitle = document.getElementById('pv-posts-title');
  const btnClose = document.getElementById('btn-close-profile-view');

  // --- Profili yukle ---
  function loadProfile() {
    const profile = window.dataStore.getUserProfile(handle);
    const posts = window.dataStore.posts.filter(p => p.handle === handle);

    function isVideo(url) {
      if (!url || typeof url !== 'string') return false;
      return url.startsWith('data:video') || url.match(/\.(mp4|webm|mov|mkv)(\?.*)?$/i);
    }

    // Banner
    const existingBannerVid = elBanner.querySelector('video.pv-media-banner');
    if (existingBannerVid) existingBannerVid.remove();

    if (profile.banner) {
      if (isVideo(profile.banner)) {
        elBanner.style.backgroundImage = 'none';
        const v = document.createElement('video');
        v.className = 'pv-media-banner';
        v.src = profile.banner;
        v.autoplay = true;
        v.loop = true;
        v.muted = true;
        v.playsInline = true;
        v.style.position = 'absolute';
        v.style.top = '0';
        v.style.left = '0';
        v.style.width = '100%';
        v.style.height = '100%';
        v.style.objectFit = 'cover';
        v.style.pointerEvents = 'none';
        elBanner.style.position = 'relative';
        elBanner.appendChild(v);
      } else if (profile.banner.startsWith('#') || profile.banner.startsWith('rgb')) {
        elBanner.style.backgroundColor = profile.banner;
        elBanner.style.backgroundImage = 'none';
      } else if (profile.banner.startsWith('linear-gradient')) {
        elBanner.style.backgroundImage = profile.banner;
      } else {
        elBanner.style.backgroundImage = `url('${profile.banner}')`;
        elBanner.style.backgroundSize = 'cover';
        elBanner.style.backgroundPosition = 'center';
      }
    } else {
      elBanner.style.backgroundColor = '#404040';
      elBanner.style.backgroundImage = 'none';
    }

    // Avatar
    const avatarParent = elAvatar.parentElement;
    const existingAvatarVid = avatarParent?.querySelector('video.pv-media-avatar');
    if (existingAvatarVid) existingAvatarVid.remove();

    if (profile.avatar && isVideo(profile.avatar)) {
      elAvatar.style.display = 'none';
      const avVid = document.createElement('video');
      avVid.className = 'pv-media-avatar';
      avVid.src = profile.avatar;
      avVid.autoplay = true;
      avVid.loop = true;
      avVid.muted = true;
      avVid.playsInline = true;
      avVid.style.width = '100%';
      avVid.style.height = '100%';
      avVid.style.objectFit = 'cover';
      avVid.style.borderRadius = '50%';
      avatarParent.style.position = 'relative';
      avatarParent.appendChild(avVid);
    } else {
      elAvatar.style.display = 'block';
      let avUrl = profile.avatar;
      if (avUrl && avUrl.startsWith('/uploads/')) avUrl = 'http://localhost:3000' + avUrl;
      elAvatar.src = (avUrl && avUrl !== 'https://i.imgur.com/w3OhOmW.jpeg') ? avUrl : window.DEFAULT_AVATAR;
      elAvatar.onerror = () => { elAvatar.src = window.DEFAULT_AVATAR; };
    }

    // Avatar Frame Overlay
    const elFrameOverlay = document.getElementById('pv-avatar-frame-overlay');
    if (elFrameOverlay) {
      if (profile.avatarFrame && profile.avatarFrame !== 'none') {
        let frameSrc = profile.avatarFrame;
        if (!frameSrc.includes('/') && !frameSrc.startsWith('data:')) {
          frameSrc = `assets/avatar-frames/${frameSrc}`;
        }
        const frameScales = {
          'Lord.png': 128,
          'Liaz.png': 122
        };
        const cleanName = String(frameSrc).split('/').pop().split('?')[0];
        let scale = (window.parent && window.parent.getFrameScale)
          ? window.parent.getFrameScale(frameSrc)
          : (frameScales[cleanName] || 126);
        if (scale > 132) scale = 128;

        elFrameOverlay.src = frameSrc;
        elFrameOverlay.style.width = `${scale}%`;
        elFrameOverlay.style.height = `${scale}%`;
        elFrameOverlay.style.display = 'block';
      } else {
        elFrameOverlay.style.display = 'none';
      }
    }

    // Kimlik & Font / Renk / Efekt Stili
    elName.textContent = profile.name || handle;
    elHandle.textContent = profile.handle || handle;
    document.title = `Ziorse - ${profile.name || handle}`;

    const fontFamilies = {
      'righteous': "'Righteous', cursive",
      'outfit': "'Outfit', sans-serif"
    };

    if (profile.fontStyle && fontFamilies[profile.fontStyle]) {
      elName.style.fontFamily = fontFamilies[profile.fontStyle];
    } else {
      elName.style.fontFamily = fontFamilies['outfit'];
    }

    if (profile.fontWeight) {
      elName.style.fontWeight = profile.fontWeight;
    }

    elName.style.fontSize = ''; // CSS .pv-name: 1.35rem controls the prominent headline size
    elName.style.lineHeight = '1.25';
    elName.style.letterSpacing = 'normal'; // Always normal! Never distorted!
    elName.style.maxWidth = '100%';
    elName.style.overflow = 'visible';
    elName.style.textOverflow = 'clip';
    elName.style.whiteSpace = 'nowrap';
    elName.style.verticalAlign = 'middle';
    elName.style.position = 'relative';
    elName.style.zIndex = '2';

    elName.style.textShadow = 'none';
    elName.style.filter = '';
    elName.style.webkitTextStroke = '';

    const isGrad = profile.nameColor && typeof profile.nameColor === 'string' && profile.nameColor.startsWith('linear-gradient');

    if (isGrad) {
      elName.style.backgroundImage = profile.nameColor;
      elName.style.webkitBackgroundClip = 'text';
      elName.style.backgroundClip = 'text';
      elName.style.webkitTextFillColor = 'transparent';
      elName.style.color = 'transparent';
      elName.style.display = 'inline-block';
    } else if (profile.nameColor && profile.nameColor !== 'none') {
      elName.style.backgroundImage = 'none';
      elName.style.webkitBackgroundClip = 'unset';
      elName.style.backgroundClip = 'unset';
      elName.style.webkitTextFillColor = profile.nameColor;
      elName.style.color = profile.nameColor;
      elName.style.display = 'inline-block';
    } else {
      elName.style.backgroundImage = 'none';
      elName.style.webkitBackgroundClip = 'unset';
      elName.style.backgroundClip = 'unset';
      elName.style.webkitTextFillColor = '';
      elName.style.color = '';
      elName.style.display = 'inline-block';
    }

    const titleBreadcrumb = document.getElementById('pv-titlebar-breadcrumb');
    if (titleBreadcrumb) {
      titleBreadcrumb.innerHTML = `– Profil &rsaquo; <span style="color:var(--text-main); font-weight:700;">${profile.name || handle}</span>`;
    }

    // Status
    const st = profile.isSelf
      ? (window.dataStore.userStatus || { type: 'online', text: '' })
      : (profile.status || { type: 'online', text: '' });
    const statusColors = { online: '#22c55e', idle: '#eab308', dnd: '#ef4444', invisible: '#737373', offline: '#737373' };
    const elStatusDot = document.querySelector('.pv-status-dot');
    if (elStatusDot) {
      elStatusDot.style.background = statusColors[st.type] || '#22c55e';
    }
    const elCustomStatus = document.getElementById('pv-custom-status');
    if (elCustomStatus) {
      if (st.text) {
        elCustomStatus.textContent = ` ${st.text}`;
        elCustomStatus.style.display = 'inline-block';
      } else {
        elCustomStatus.style.display = 'none';
      }
    }

    // Bio
    elBio.textContent = profile.bio || 'Henüz açıklama eklenmedi.';

    // Istatistikler
    elStatPosts.textContent = posts.length;
    elStatFollowers.textContent = profile.followers || 0;
    elStatFollowing.textContent = profile.following || 0;

    // Baslik
    elPostsTitle.textContent = (profile.name || handle) + ' adlı kullanıcının gönderileri';

    // Aksiyon butonu
    if (profile.isSelf) {
      elActionBtn.textContent = 'Profili Düzenle';
      elActionBtn.className = 'pv-action-btn self';
      elActionBtn.onclick = () => {
        if (window.parent && window.parent !== window && typeof window.parent.openModalView === 'function') {
          window.parent.openModalView('settings.html?section=hesabim');
        } else {
          window.location.href = 'settings.html?section=hesabim';
        }
      };
    } else if (profile.isFollowing) {
      elActionBtn.textContent = 'Takipten Çık';
      elActionBtn.className = 'pv-action-btn following';
      elActionBtn.onclick = () => {
        ds.toggleFollowUser(handle);
        loadProfile();
        showToast('Takipten çıkıldı');
      };
    } else {
      elActionBtn.textContent = 'Takip Et';
      elActionBtn.className = 'pv-action-btn';
      elActionBtn.onclick = () => {
        ds.toggleFollowUser(handle);
        loadProfile();
        showToast('Takip edildi');
      };
    }
  }

  // --- Geri don ---
  function goBack() {
    if (window.parent && window.parent !== window && typeof window.parent.closeModalView === 'function') {
      window.parent.closeModalView();
    } else if (history.length > 1) {
      history.back();
    } else {
      window.location.href = 'index.html';
    }
  }

  btnClose.addEventListener('click', goBack);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') goBack();
  });

  // --- Baslat ---
  loadProfile();
});
