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
  if (ds && ds.theme === 'dark') {
    document.body.classList.add('dark-mode');
  }

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
          'Lord.png': 178,
          'altin-tac.png': 134,
          'ates-cemberi.png': 133,
          'galaksi-mor.png': 133,
          'sakura-cicegi.png': 131,
          'siber-neon.png': 133
        };
        const cleanName = String(frameSrc).split('/').pop().split('?')[0];
        const scale = (window.parent && window.parent.getFrameScale)
          ? window.parent.getFrameScale(frameSrc)
          : (frameScales[cleanName] || 132);

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
      'outfit': "'Outfit', sans-serif",
      'cyber': "'Russo One', sans-serif",
      'cursive': "'Caveat', cursive",
      'pixel': "'Press Start 2P', monospace",
      'serif': "'Cinzel', serif",
      'neon': "'Righteous', cursive",
      'terminal': "'JetBrains Mono', monospace",
      'inter': "'Inter', sans-serif"
    };
    if (profile.fontStyle && fontFamilies[profile.fontStyle]) {
      elName.style.fontFamily = fontFamilies[profile.fontStyle];
    } else {
      elName.style.fontFamily = '';
    }

    const effects = Array.isArray(profile.nameEffects) ? profile.nameEffects : [];
    let textShadows = [];
    if (effects.includes('glow')) {
      const glowColor = (profile.nameColor && profile.nameColor.startsWith('#')) ? profile.nameColor : '#00f2fe';
      textShadows.push(`0 0 12px ${glowColor}`);
    }
    if (effects.includes('shadow')) {
      textShadows.push('2px 3px 5px rgba(0, 0, 0, 0.8)');
    }
    elName.style.textShadow = textShadows.join(', ') || '';
    elName.style.letterSpacing = effects.includes('spaced') ? '2px' : '';

    if (profile.nameColor && profile.nameColor.startsWith('linear-gradient')) {
      elName.style.backgroundImage = profile.nameColor;
      elName.style.webkitBackgroundClip = 'text';
      elName.style.webkitTextFillColor = 'transparent';
      elName.style.color = 'transparent';
    } else if (profile.nameColor && profile.nameColor !== 'none') {
      elName.style.backgroundImage = 'none';
      elName.style.webkitBackgroundClip = 'unset';
      elName.style.webkitTextFillColor = profile.nameColor;
      elName.style.color = profile.nameColor;
    } else {
      elName.style.backgroundImage = 'none';
      elName.style.webkitBackgroundClip = 'unset';
      elName.style.webkitTextFillColor = '';
      elName.style.color = '';
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

    // Gonderileri render et
    renderPosts(posts);
  }

  // --- Gonderileri render et ---
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatDate(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    if (isNaN(d)) return '';
    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    return `${d.getDate().toString().padStart(2, '0')} ${months[d.getMonth()]} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }

  function parseText(str) {
    if (!str) return '';
    let s = escapeHtml(str);
    s = s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\*(.*?)\*/g, '<em>$1</em>');
    s = s.replace(/`(.*?)`/g, `<code style="background:var(--bg-app);padding:2px 6px;border-radius:4px;font-family:var(--font-mono)">$1</code>`);
    s = s.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color:var(--accent-primary)">$1</a>');
    s = s.replace(/#(\w+)/g, '<span style="color:var(--accent-primary);font-weight:700">#$1</span>');
    s = s.replace(/@(\w+)/g, '<span style="color:var(--accent-primary)">@$1</span>');
    return s;
  }

  function renderPosts(posts) {
    if (!posts || posts.length === 0) {
      elPostsList.innerHTML = '<div class="pv-empty">Henuz gonderi yok.</div>';
      return;
    }

    elPostsList.innerHTML = posts.map(post => `
      <div class="pv-post-card">
        <div class="pv-post-meta">
          <span style="font-size:0.8rem; font-weight:700; font-family:var(--font-montserrat); color:var(--text-main);">${escapeHtml(post.author)}</span>
          <span style="font-size:0.78rem; color:var(--text-muted); font-family:var(--font-mono);">${escapeHtml(post.handle)}</span>
          <span class="pv-post-time">${formatDate(post.timestamp)}</span>
        </div>

        ${post.content ? `<div class="pv-post-text">${parseText(post.content)}</div>` : ''}
        ${post.image ? `<img class="pv-post-image" src="${escapeHtml(post.image)}" alt="Gonderi gorseli" style="max-width:100%;max-height:400px;object-fit:cover;border-radius:10px;margin-top:8px;display:block;">` : ''}
        ${post.video ? `<video class="pv-post-video" controls playsinline src="${escapeHtml(post.video)}" style="max-width:100%;max-height:400px;border-radius:10px;margin-top:8px;display:block;background:#000;"></video>` : ''}
        ${post.file ? `<a class="post-file-card" href="${escapeHtml(post.file.url)}" download="${escapeHtml(post.file.name)}" target="_blank" style="display:inline-flex;align-items:center;gap:10px;padding:8px 12px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:8px;margin-top:8px;text-decoration:none;color:var(--text-main);"><i data-lucide="file-text" style="width:16px;height:16px;"></i><span>${escapeHtml(post.file.name)}</span></a>` : ''}
        ${post.codeSnippet ? `<pre class="pv-post-code">${escapeHtml(post.codeSnippet)}</pre>` : ''}

        <div class="pv-post-stats">
          <span class="pv-post-stat">
            <i data-lucide="heart" style="width:13px;height:13px;"></i>
            ${post.likes || 0}
          </span>
          <span class="pv-post-stat">
            <i data-lucide="repeat-2" style="width:13px;height:13px;"></i>
            ${post.reposts || 0}
          </span>
          <span class="pv-post-stat">
            <i data-lucide="message-circle" style="width:13px;height:13px;"></i>
            ${post.repliesCount || 0}
          </span>
        </div>
      </div>
    `).join('');

    refreshIcons();
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
