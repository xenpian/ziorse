/**
 * Ziorse — Features Module v2
 * Handles: Emoji Picker, Relative Timestamp, Edit/Delete, Keyboard Shortcuts,
 *          Infinite Scroll, User Status, Notifications, Link Preview, File Upload,
 *          Block System, Pin System, Quick Switcher
 */

// ── RELATIVE TIMESTAMP ────────────────────────────────────────
function formatRelativeTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp === 'Şimdi' || timestamp === 'Simdi' ? Date.now() : timestamp);
  if (isNaN(date.getTime())) return '';

  const now = Date.now();
  const diff = now - date.getTime();
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(diff / 60000);
  const hour = Math.floor(diff / 3600000);
  const day = Math.floor(diff / 86400000);

  if (sec < 30) return 'az önce';
  if (sec < 60) return `${sec} sn önce`;
  if (min < 60) return `${min} dk önce`;
  if (hour < 24) return `${hour} saat önce`;
  if (day === 1) return 'dün';
  if (day < 7) return `${day} gün önce`;

  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

// Override global formatDateTime
window.formatDateTime = formatRelativeTime;

// ── EMOJI DATA ─────────────────────────────────────────────────
const EMOJI_DATA = {
  smileys: ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🥴','😶','😑','😬','🙄','😯','😦','😧','😮','🥱','😴','🤤','😪','😵','🤯','🤠','🥳','🥸','😎','🤓','🧐','😕','😟','🙁','☹️','😮','😲','😳','🥺','😢','😭','😤','😠','😡','🤬','😈','💀','💩','🤡','👻','👽','🤖'],
  people: ['👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','💅','🤳','💪','🦵','🦶','👂','🦻','👃','🧠','🫀','🦷','👁️','👀','👤','🧑','👱','🧔','🧏','💆','💇','🚶','🏃','💃','🕺','🧖','🧗'],
  nature: ['🌱','🌿','☘️','🍀','🎍','🎋','🍃','🍂','🍁','🌾','🌺','🌸','🌼','🌻','🌹','🥀','🌷','🌱','🌲','🌳','🌴','🌵','🎄','🌾','🍄','🐚','🌊','🌐','🌍','🌎','🌏','⛰️','🏔️','🗻','🏕️','🌋','🗾','🏝️','🌅','🌄','🌠','🎇','🎆','🌃','🏙️','🌆','🌇','🌉','🌌','🌉','🌁','⛺','🌙','⭐','🌟','💫','✨','⚡','🌈','☀️','⛅','☁️','❄️','⛄','🌀','🌈'],
  food: ['🍕','🍔','🌮','🌯','🥙','🧆','🥚','🍳','🥘','🍲','🍜','🍝','🍛','🍣','🍱','🥟','🍤','🍙','🍚','🍘','🍥','🥮','🍢','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜','🍯','🧃','🥤','🧋','☕','🍵','🧊','🥛','🍼','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🧉','🍾','🍶','🥄','🍴','🥢','🧂'],
  activities: ['⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🎱','🏓','🏸','🏒','🥅','⛳','🏹','🎣','🤿','🎽','🎿','🛷','🤸','⛷️','🏂','🪂','🏋️','🤼','🤺','🤾','🏇','⛹️','🧘','🏄','🧗','🚵','🎯','🎲','♟️','🎮','🕹️','🎰','🎭','🎨','🖼️','🎷','🎸','🎹','🎺','🎻','🪕','🥁','🎤','🎧','📻','🎬','🎥'],
  travel: ['✈️','🚀','🛸','🚁','🛺','🚂','🚃','🚄','🚅','🚆','🚇','🚈','🚉','🚊','🚞','🚝','🚋','🚌','🚍','🚎','🚐','🚑','🚒','🚓','🚔','🚕','🚖','🚗','🚘','🚙','🚚','🚛','🚜','🏎️','🏍️','🛵','🛺','🚲','🛴','🛹','🛼','🚏','⛽','🛞','🚨','🚥','🚦','🗺️','🧭','🌐','🏔️','⛰️','🗻','🏕️','🏖️','🏜️','🏝️','🏛️','🏗️','🏘️','🏚️','🏠','🏡','🏢','🏣','🏤','🏥','🏦','🏧','🏨','🏩','🏪','🏫','🏬','🏭','🏯','🏰','🗼','🗽','⛪','🕌','🛕','⛩️'],
  objects: ['💡','🔦','🕯️','💰','💳','💸','📲','📱','💻','⌨️','🖥️','🖨️','🖱️','💾','💿','📀','📷','📸','📹','🎥','📺','📻','🎙️','🎚️','🎛️','📡','⏱️','⏲️','⏰','🕰️','⌛','📡','🔋','🔌','💡','🔦','🕯️','🔍','🔎','🔬','🔭','📡','💊','🩺','🩻','🔧','🔨','⚒️','🛠️','⛏️','🔩','🪛','🔗','⛓️','🪝','🧲','🔫','🪓','🛡️','🔑','🗝️','🪤','🪣','💈','🪒','🧴','🧷','🪡','🧹','🧺','🧻','🚽','🚿','🛁','🧼','🪥','🧽','🧯','🛒'],
  symbols: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','❤️‍🔥','❤️‍🩹','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☪️','🕉️','☸️','✡️','🔯','🕎','☯️','☦️','🛐','⛎','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','🔀','🔁','🔂','▶️','⏩','⏭️','⏯️','◀️','⏪','⏮️','🔼','⏫','🔽','⏬','⏸️','⏹️','⏺️','🎦','🔅','🔆','📶','📳','📴','📵','📳','🔇','🔈','🔉','🔊','📢','📣','🔔','🔕','💬','💭','🗯️','♻️','⚜️','🔱','📛','🔰','✅','❎','🆗','🆒','🆕','🆙','🆓','🆖','🆙','🆚','🈹','🈲']
};

// ── EMOJI PICKER ───────────────────────────────────────────────
class EmojiPicker {
  constructor() {
    this.modal = document.getElementById('emoji-picker-modal');
    this.grid = document.getElementById('emoji-grid');
    this.searchInput = document.getElementById('emoji-search-input');
    this.closeBtn = document.getElementById('emoji-picker-close');
    this.currentCat = 'smileys';
    this.onSelect = null;
    this.anchorEl = null;

    if (!this.modal) return;
    this._bindEvents();
  }

  _bindEvents() {
    // Category buttons
    document.querySelectorAll('.emoji-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.emoji-cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentCat = btn.dataset.cat;
        this._renderGrid(this.currentCat);
      });
    });

    // Search
    this.searchInput.addEventListener('input', () => {
      const q = this.searchInput.value.trim().toLowerCase();
      if (!q) { this._renderGrid(this.currentCat); return; }
      const all = Object.values(EMOJI_DATA).flat();
      this._renderGridCustom(all.filter(e => e.includes(q)));
    });

    // Close button
    this.closeBtn?.addEventListener('click', () => this.hide());

    // Click outside
    document.addEventListener('click', (e) => {
      if (this.modal.style.display !== 'none' &&
          !this.modal.contains(e.target) &&
          e.target !== this.anchorEl &&
          !this.anchorEl?.contains(e.target)) {
        this.hide();
      }
    });
  }

  _renderGrid(cat) {
    const emojis = EMOJI_DATA[cat] || [];
    this._renderGridCustom(emojis);
  }

  _renderGridCustom(emojis) {
    this.grid.innerHTML = emojis.map(e =>
      `<button class="emoji-item" data-emoji="${e}">${e}</button>`
    ).join('');
    this.grid.querySelectorAll('.emoji-item').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.onSelect) this.onSelect(btn.dataset.emoji);
        this.hide();
      });
    });
  }

  show(anchorEl, onSelect) {
    this.anchorEl = anchorEl;
    this.onSelect = onSelect;
    this._renderGrid(this.currentCat);
    this.searchInput.value = '';
    this.modal.style.display = 'flex';

    // Position near anchor
    const rect = anchorEl.getBoundingClientRect();
    const modalW = 320;
    const modalH = 350;
    let left = rect.left;
    let top = rect.top - modalH - 8;
    if (left + modalW > window.innerWidth) left = window.innerWidth - modalW - 8;
    if (top < 8) top = rect.bottom + 8;
    this.modal.style.left = left + 'px';
    this.modal.style.top = top + 'px';
    this.searchInput.focus();
  }

  hide() {
    if (this.modal) this.modal.style.display = 'none';
  }
}

// ── NOTIFICATION SYSTEM ────────────────────────────────────────
class NotificationSystem {
  constructor() {
    this.bell = document.getElementById('btn-notification-bell');
    this.badge = document.getElementById('notif-bell-badge');
    this.dropdown = document.getElementById('notification-dropdown');
    this.notifList = document.getElementById('notif-list');
    this.markReadBtn = document.getElementById('btn-mark-notifs-read');

    if (!this.bell) return;
    this._bindEvents();
    this.updateMuteState();
    this.refresh();
  }

  _bindEvents() {
    // Sol tık -> Bildirimler menüsünü aç / kapat
    this.bell.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = this.dropdown.style.display !== 'none';
      if (open) {
        this.dropdown.style.display = 'none';
      } else {
        this.render();
        this.dropdown.style.display = 'flex';
        const rect = this.bell.getBoundingClientRect();
        this.dropdown.style.top = (rect.bottom + 6) + 'px';
        this.dropdown.style.right = Math.max(8, window.innerWidth - rect.right) + 'px';
      }
    });

    // Sağ tık -> Bildirimleri sessize al / aç (Üstüne çizgi çeker)
    this.bell.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isMuted = window.dataStore.toggleNotificationsMuted();
      this.updateMuteState();
      window.showGlobalToast && window.showGlobalToast(isMuted ? 'Bildirimler sessize alındı' : 'Bildirimlerin sesi açıldı');
    });

    this.markReadBtn?.addEventListener('click', () => {
      window.dataStore.markNotificationsRead();
      this.render();
      this.refresh();
    });

    document.addEventListener('click', (e) => {
      if (!this.dropdown.contains(e.target) && e.target !== this.bell) {
        this.dropdown.style.display = 'none';
      }
    });
  }

  updateMuteState() {
    const isMuted = window.dataStore.isNotificationsMuted();
    this.bell.classList.toggle('muted', isMuted);
    this.bell.title = isMuted ? 'Bildirimler (Sessizde — Sağ tık: Sesi aç)' : 'Bildirimler (Sağ tık: Sessize al)';
  }

  refresh() {
    this.updateMuteState();
    const count = window.dataStore.unreadNotificationCount;
    if (this.badge) {
      this.badge.textContent = count > 9 ? '9+' : count;
      this.badge.style.display = count > 0 ? 'flex' : 'none';
    }
  }

  render() {
    const notifs = window.dataStore.notifications;
    if (!this.notifList) return;

    if (notifs.length === 0) {
      this.notifList.innerHTML = `<div class="notif-empty">Henüz bildirim yok.</div>`;
      return;
    }

    const icons = { dm: '💬', friend_request: '👋', like: '❤️', comment: '💬', mention: '@', system: '🔔' };
    this.notifList.innerHTML = notifs.map(n => `
      <div class="notif-item ${n.read ? 'read' : 'unread'}" data-id="${n.id}">
        <span class="notif-icon">${icons[n.type] || '🔔'}</span>
        <div class="notif-content">
          <div class="notif-title">${escapeHtml(n.title)}</div>
          <div class="notif-body">${escapeHtml(n.body)}</div>
          <div class="notif-time">${window.formatDateTime(n.timestamp)}</div>
        </div>
        ${!n.read ? '<span class="notif-unread-dot"></span>' : ''}
      </div>
    `).join('');
    this.refresh();
  }
}

// ── STATUS SYSTEM ──────────────────────────────────────────────
class StatusSystem {
  constructor() {
    this.dot = document.getElementById('user-status-dot');
    this._applyCurrentStatus();
  }

  _applyCurrentStatus() {
    const { type } = window.dataStore.userStatus || { type: 'online' };
    this._updateDotColor(type);
  }

  _updateDotColor(type) {
    const colors = { online: '#22c55e', idle: '#eab308', dnd: '#ef4444', invisible: '#737373' };
    if (this.dot) this.dot.style.background = colors[type] || '#22c55e';
    // Update all status dots across app
    document.querySelectorAll('.discord-status-dot').forEach(d => {
      d.style.background = colors[type] || '#22c55e';
    });
  }
}

// ── QUICK SWITCHER (Ctrl+K) ────────────────────────────────────
class QuickSwitcher {
  constructor() {
    this.modal = document.getElementById('quick-switcher-modal');
    this.input = document.getElementById('qs-input');
    this.results = document.getElementById('qs-results');

    if (!this.modal) return;
    this._bindEvents();
  }

  _bindEvents() {
    this.input?.addEventListener('input', () => this._search(this.input.value.trim()));

    this.input?.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.hide();
      if (e.key === 'ArrowDown') {
        const first = this.results?.querySelector('.qs-item');
        first?.focus();
      }
    });

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.hide();
    });
  }

  show() {
    if (!this.modal) return;
    this.modal.style.display = 'flex';
    this.input.value = '';
    this._search('');
    this.input.focus();
  }

  hide() {
    if (this.modal) this.modal.style.display = 'none';
  }

  _search(q) {
    const ds = window.dataStore;
    const lower = q.toLowerCase();

    const items = [];

    // Servers
    ds.servers.forEach(srv => {
      if (!q || srv.name.toLowerCase().includes(lower)) {
        items.push({
          icon: '🖥️', label: srv.name, sub: 'Sunucu',
          action: () => { this.hide(); window.switchToServerGlobal && window.switchToServerGlobal(srv.id); }
        });
      }
    });

    // Friends
    (ds.friends || []).forEach(f => {
      if (!q || f.name.toLowerCase().includes(lower) || f.handle.toLowerCase().includes(lower)) {
        items.push({
          icon: '💬', label: f.name, sub: f.handle,
          action: () => {
            this.hide();
            // Open DM with friend
            window.openDMWithHandle && window.openDMWithHandle(f.handle);
          }
        });
      }
    });

    // Navigation shortcuts
    const navItems = [
      { icon: '🏠', label: 'Ana Akış', sub: 'Sayfa', action: () => { this.hide(); document.querySelector('.server-icon[data-nav="for-you"]')?.click(); } },
      { icon: '🔖', label: 'Kaydedilenler', sub: 'Sayfa', action: () => { this.hide(); document.querySelector('.server-icon[data-nav="saved"]')?.click(); } },
      { icon: '⚙️', label: 'Ayarlar', sub: 'Sayfa', action: () => { this.hide(); if (window.openModalView) window.openModalView('settings.html'); else window.location.href = 'settings.html'; } }
    ].filter(item => !q || item.label.toLowerCase().includes(lower));

    items.push(...navItems);

    if (!this.results) return;
    if (items.length === 0) {
      this.results.innerHTML = `<div class="qs-empty">Sonuç bulunamadı.</div>`;
      return;
    }

    this.results.innerHTML = items.slice(0, 10).map((item, i) => `
      <button class="qs-item" data-idx="${i}">
        <span class="qs-item-icon">${item.icon}</span>
        <div class="qs-item-info">
          <span class="qs-item-label">${escapeHtml(item.label)}</span>
          <span class="qs-item-sub">${escapeHtml(item.sub)}</span>
        </div>
      </button>
    `).join('');

    this.results.querySelectorAll('.qs-item').forEach((btn, i) => {
      btn.addEventListener('click', () => items[i].action());
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') items[i].action();
        if (e.key === 'Escape') { this.hide(); this.input.focus(); }
        if (e.key === 'ArrowDown') btn.nextElementSibling?.focus();
        if (e.key === 'ArrowUp') { btn.previousElementSibling ? btn.previousElementSibling.focus() : this.input.focus(); }
      });
    });
  }
}

// ── LINK PREVIEW SYSTEM ────────────────────────────────────────
class LinkPreviewSystem {
  constructor() {
    this._cache = {};
    this._debounceTimer = null;
  }

  async fetchPreview(url) {
    if (this._cache[url]) return this._cache[url];
    try {
      const res = await fetch(`http://localhost:3000/api/og-preview?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data && data.title) {
        this._cache[url] = data;
        return data;
      }
    } catch { }
    return null;
  }

  async attachToComposer(textarea, previewContainer) {
    if (!textarea || !previewContainer) return;

    const checkUrl = async () => {
      const text = textarea.value;
      const urlMatch = text.match(/https?:\/\/[^\s]+/);
      if (!urlMatch) {
        previewContainer.style.display = 'none';
        previewContainer.innerHTML = '';
        return;
      }
      const url = urlMatch[0];
      const preview = await this.fetchPreview(url);
      if (!preview) { previewContainer.style.display = 'none'; return; }

      previewContainer.style.display = 'block';
      previewContainer.innerHTML = `
        <div class="link-preview-card">
          ${preview.image ? `<img class="lp-image" src="${escapeHtml(preview.image)}" alt="">` : ''}
          <div class="lp-content">
            <div class="lp-site">${escapeHtml(preview.siteName || '')}</div>
            <div class="lp-title">${escapeHtml(preview.title || '')}</div>
            <div class="lp-desc">${escapeHtml((preview.description || '').substring(0, 100))}${(preview.description || '').length > 100 ? '...' : ''}</div>
          </div>
          <button class="lp-close-btn" onclick="this.closest('.link-preview-card').parentElement.style.display='none'">✕</button>
        </div>
      `;
    };

    textarea.addEventListener('input', () => {
      clearTimeout(this._debounceTimer);
      this._debounceTimer = setTimeout(checkUrl, 600);
    });
  }

  renderCardHtml(preview) {
    if (!preview || !preview.title) return '';
    return `
      <div class="link-preview-card post-link-preview">
        ${preview.image ? `<img class="lp-image" src="${escapeHtml(preview.image)}" alt="">` : ''}
        <div class="lp-content">
          <div class="lp-site">${escapeHtml(preview.siteName || '')}</div>
          <div class="lp-title">${escapeHtml(preview.title || '')}</div>
          <div class="lp-desc">${escapeHtml((preview.description || '').substring(0, 120))}${(preview.description || '').length > 120 ? '...' : ''}</div>
        </div>
      </div>
    `;
  }
}

// ── FILE UPLOAD SYSTEM ─────────────────────────────────────────
class FileUploadSystem {
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        return `http://localhost:3000${data.url}`;
      }
    } catch (err) {
      console.error('Upload error:', err);
    }
    return null;
  }
}

// ── INFINITE SCROLL ────────────────────────────────────────────
class InfiniteScrollManager {
  constructor() {
    this.currentPage = 0;
    this.pageSize = 25;
    this.isLoading = false;
    this.observer = null;
    this.sentinel = null;
  }

  init(container, loadMoreCallback) {
    if (this.observer) this.observer.disconnect();

    this.sentinel = document.createElement('div');
    this.sentinel.className = 'scroll-sentinel';
    this.sentinel.style.cssText = 'height:1px;width:100%;';
    container.appendChild(this.sentinel);

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isLoading) {
          this.isLoading = true;
          loadMoreCallback(() => { this.isLoading = false; });
        }
      });
    }, { rootMargin: '200px' });

    this.observer.observe(this.sentinel);
  }

  reset() {
    this.currentPage = 0;
    this.isLoading = false;
    if (this.observer) this.observer.disconnect();
    this.observer = null;
    this.sentinel = null;
  }
}

// ── KEYBOARD SHORTCUTS ─────────────────────────────────────────
function initKeyboardShortcuts(quickSwitcher) {
  document.addEventListener('keydown', (e) => {
    const tag = document.activeElement?.tagName;
    const isTyping = ['INPUT', 'TEXTAREA'].includes(tag);

    // Ctrl+K — Quick Switcher
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      quickSwitcher.show();
      return;
    }

    // Ctrl+/ — Shortcuts modal
    if (e.ctrlKey && e.key === '/') {
      e.preventDefault();
      const m = document.getElementById('shortcuts-modal');
      if (m) m.style.display = m.style.display === 'none' ? 'flex' : 'none';
      return;
    }

    // Ctrl+Shift+M — Go to DMs
    if (e.ctrlKey && e.shiftKey && e.key === 'M') {
      e.preventDefault();
      document.querySelector('.server-icon[data-nav="messages"]')?.click();
      return;
    }

    // Ctrl+, — Settings
    if (e.ctrlKey && e.key === ',') {
      e.preventDefault();
      if (window.openModalView) window.openModalView('settings.html');
      else window.location.href = 'settings.html';
      return;
    }

    // Escape — close all modals
    if (e.key === 'Escape') {
      quickSwitcher.hide();
      document.getElementById('shortcuts-modal').style.display = 'none';
      document.getElementById('notification-dropdown').style.display = 'none';
      document.getElementById('status-picker').style.display = 'none';
      document.getElementById('emoji-picker-modal').style.display = 'none';
      document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
      return;
    }

    if (isTyping) return;

    // Alt+ArrowDown/Up — navigate channels
    if (e.altKey && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault();
      const navItems = [...document.querySelectorAll('.nav-menu .nav-item')];
      const activeIdx = navItems.findIndex(n => n.classList.contains('active'));
      let nextIdx = e.key === 'ArrowDown' ? activeIdx + 1 : activeIdx - 1;
      if (nextIdx >= 0 && nextIdx < navItems.length) navItems[nextIdx].click();
    }
  });

  // Close shortcuts modal button
  document.getElementById('btn-close-shortcuts')?.addEventListener('click', () => {
    document.getElementById('shortcuts-modal').style.display = 'none';
  });
}

// ── EDIT/DELETE MESSAGES ───────────────────────────────────────
function initMessageEditDelete() {
  // We hook into renderFeed by extending the hover panel
  window.handleEditPost = function(postId) {
    const post = window.dataStore.posts.find(p => p.id === postId);
    if (!post) return;

    const existing = document.getElementById(`edit-modal-${postId}`);
    if (existing) { existing.remove(); return; }

    const modal = document.createElement('div');
    modal.id = `edit-modal-${postId}`;
    modal.className = 'edit-post-modal';
    modal.innerHTML = `
      <div class="edit-post-box">
        <div class="edit-post-header">
          <span>Gönderiyi Düzenle</span>
          <button class="edit-post-close modal-close-btn" onclick="document.getElementById('edit-modal-${postId}').remove()">
            <i data-lucide="x" style="width:14px;height:14px;"></i>
          </button>
        </div>
        <textarea class="edit-post-textarea" id="edit-ta-${postId}">${escapeHtml(post.content)}</textarea>
        <div class="edit-post-actions">
          <button class="edit-post-cancel" onclick="document.getElementById('edit-modal-${postId}').remove()">İptal</button>
          <button class="edit-post-save btn-send-post">Kaydet</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    if (window.lucide) window.lucide.createIcons({ root: modal });

    const ta = document.getElementById(`edit-ta-${postId}`);
    ta.focus();
    ta.setSelectionRange(ta.value.length, ta.value.length);

    modal.querySelector('.edit-post-save').addEventListener('click', () => {
      const newContent = ta.value.trim();
      if (!newContent) return;
      window.dataStore.editPost(postId, newContent);
      modal.remove();
      if (window.showGlobalToast) window.showGlobalToast('Gönderi düzenlendi');
    });

    ta.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') modal.remove();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  };

  window.handleDeletePost = function(postId) {
    if (!confirm('Bu gönderiyi silmek istediğinize emin misiniz?')) return;
    window.dataStore.deletePost(postId);
    if (window.showGlobalToast) window.showGlobalToast('Gönderi silindi');
  };

  window.handlePinPost = function(postId) {
    const pinned = window.dataStore.togglePin(postId);
    if (window.showGlobalToast) window.showGlobalToast(pinned ? '📌 Mesaj sabitlendi' : 'Mesaj sabitlemesi kaldırıldı');
  };

  window.handleBlockUser = function(handle) {
    if (window.dataStore.isBlocked(handle)) {
      window.dataStore.unblockUser(handle);
      if (window.showGlobalToast) window.showGlobalToast(`${handle} engeli kaldırıldı`);
    } else {
      if (!confirm(`${handle} kullanıcısını engellemek istediğinize emin misiniz?`)) return;
      window.dataStore.blockUser(handle);
      if (window.showGlobalToast) window.showGlobalToast(`${handle} engellendi`);
    }
  };
}

// ── INIT ALL FEATURES ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Wait for dataStore to be ready
  const init = () => {
    if (!window.dataStore) { setTimeout(init, 50); return; }

    const emojiPicker = new EmojiPicker();
    window._emojiPicker = emojiPicker;

    const notifSystem = new NotificationSystem();
    window._notifSystem = notifSystem;

    const statusSystem = new StatusSystem();
    window._statusSystem = statusSystem;

    const quickSwitcher = new QuickSwitcher();
    window._quickSwitcher = quickSwitcher;

    const linkPreviews = new LinkPreviewSystem();
    window._linkPreviews = linkPreviews;

    const fileUpload = new FileUploadSystem();
    window._fileUpload = fileUpload;

    window._infiniteScroll = new InfiniteScrollManager();

    initKeyboardShortcuts(quickSwitcher);
    initMessageEditDelete();

    // Emoji in composer
    const composerBtn = document.getElementById('btn-open-emoji-composer');
    const composerTextarea = document.getElementById('composer-text');
    if (composerBtn && composerTextarea) {
      composerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        emojiPicker.show(composerBtn, (emoji) => {
          const pos = composerTextarea.selectionStart;
          const val = composerTextarea.value;
          composerTextarea.value = val.slice(0, pos) + emoji + val.slice(pos);
          composerTextarea.selectionStart = composerTextarea.selectionEnd = pos + emoji.length;
          composerTextarea.focus();
        });
      });
    }

    // Emoji in DM bar
    const dmEmojiBtn = document.getElementById('btn-dm-open-emoji');
    const dmInputText = document.getElementById('dm-input-text');
    if (dmEmojiBtn && dmInputText) {
      dmEmojiBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        emojiPicker.show(dmEmojiBtn, (emoji) => {
          const pos = dmInputText.selectionStart || dmInputText.value.length;
          const val = dmInputText.value;
          dmInputText.value = val.slice(0, pos) + emoji + val.slice(pos);
          dmInputText.selectionStart = dmInputText.selectionEnd = pos + emoji.length;
          dmInputText.focus();
        });
      });
    }

    // Link preview in composer
    const linkPreviewBar = document.createElement('div');
    linkPreviewBar.id = 'link-preview-bar';
    linkPreviewBar.style.cssText = 'display:none;';
    composerTextarea?.parentNode?.insertBefore(linkPreviewBar, composerTextarea.nextSibling);
    if (composerTextarea) linkPreviews.attachToComposer(composerTextarea, linkPreviewBar);

    // File upload: replace base64 for image attach
    const filePickerImage = document.getElementById('file-picker-image');
    const imagePreviewImg = document.getElementById('image-preview-img');
    const imagePreviewBar = document.getElementById('image-preview-bar');
    if (filePickerImage) {
      filePickerImage.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Try server upload first, fallback to base64
        if (window.showGlobalToast) window.showGlobalToast('Dosya yükleniyor...');
        const serverUrl = await fileUpload.uploadFile(file);
        if (serverUrl) {
          window._attachedImageUrl = serverUrl;
          if (imagePreviewImg) imagePreviewImg.src = serverUrl;
          if (imagePreviewBar) imagePreviewBar.style.display = 'block';
          if (window.showGlobalToast) window.showGlobalToast('Görsel yüklendi');
        } else {
          // Fallback to base64
          const r = new FileReader();
          r.onload = (ev) => {
            window._attachedImageUrl = ev.target.result;
            if (imagePreviewImg) imagePreviewImg.src = ev.target.result;
            if (imagePreviewBar) imagePreviewBar.style.display = 'block';
            if (window.showGlobalToast) window.showGlobalToast('Görsel eklendi (yerel)');
          };
          r.readAsDataURL(file);
        }
      });
    }

    // Notification refresh on store change
    window.dataStore.subscribe(() => {
      if (notifSystem) notifSystem.refresh();
    });

    // Electron notification click handler
    if (window.electronAPI?.onNotificationClick) {
      window.electronAPI.onNotificationClick((data) => {
        if (data.type === 'dm') document.querySelector('.server-icon[data-nav="messages"]')?.click();
      });
    }

    console.log('[Ziorse Features] All v2 features initialized.');
  };

  init();
});
