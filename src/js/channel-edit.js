/**
 * Ziorse - Channel Edit & Permissions Logic
 */
document.addEventListener('DOMContentLoaded', () => {
  const ds = (window.parent && window.parent !== window && window.parent.dataStore)
    ? window.parent.dataStore
    : window.dataStore;
  if (typeof lucide !== 'undefined') lucide.createIcons();

  // Dark mode
  if (ds.theme === 'dark') document.body.classList.add('dark-mode');

  // URL params
  const params = new URLSearchParams(window.location.search);
  const serverId = params.get('serverId');
  const categoryId = params.get('categoryId');
  const channelId = params.get('channelId');

  // Find server, category, channel
  const srv = ds.servers.find(s => String(s.id) === String(serverId));
  if (!srv) {
    if (window.parent && window.parent !== window && typeof window.parent.closeModalView === 'function') {
      window.parent.closeModalView();
    } else if (window.history.length > 1) {
      window.history.back();
    }
    return;
  }
  if (typeof ds._migrateServerCategories === 'function') {
    ds._migrateServerCategories(srv);
  }

  let cat = (srv.categories || []).find(c => String(c.id) === String(categoryId));
  if (!cat) {
    if (window.parent && window.parent !== window && typeof window.parent.closeModalView === 'function') {
      window.parent.closeModalView();
    } else if (window.history.length > 1) {
      window.history.back();
    }
    return;
  }

  let ch = (cat.channels || []).find(c => String(c.id) === String(channelId));
  if (!ch && srv.categories) {
    for (const otherCat of srv.categories) {
      ch = (otherCat.channels || []).find(c => String(c.id) === String(channelId));
      if (ch) { cat = otherCat; break; }
    }
  }
  if (!ch) {
    if (window.parent && window.parent !== window && typeof window.parent.closeModalView === 'function') {
      window.parent.closeModalView();
    } else if (window.history.length > 1) {
      window.history.back();
    }
    return;
  }

  if (!ch.permissions) ch.permissions = {};

  const cu = ds.currentUser || { handle: '' };
  const isOwner = ds.isServerOwner(srv.id, cu.handle);
  const canManageChannels = isOwner || (ds.checkServerPermission && ds.checkServerPermission(srv.id, cu.handle, 'manage_channels'));
  if (!canManageChannels) {
    if (window.parent && window.parent !== window && typeof window.parent.closeModalView === 'function') {
      window.parent.closeModalView();
    } else {
      window.location.href = 'index.html';
    }
    return;
  }

  // DOM refs
  const chTitleBar = document.getElementById('ch-title-bar');
  const chSidebarName = document.getElementById('ch-sidebar-name');
  const chSidebarCat = document.getElementById('ch-sidebar-cat');
  const chSidebarIcon = document.getElementById('ch-sidebar-icon');
  const nameInput = document.getElementById('ch-name-input');
  const typeBtns = document.querySelectorAll('.ch-edit-type-btn');
  const btnSaveGenel = document.getElementById('btn-save-genel');
  const btnSavePerms = document.getElementById('btn-save-perms');
  const btnCloseArea = document.getElementById('btn-close-area');
  const btnSidebarDelete = document.getElementById('btn-sidebar-delete');
  const toast = document.getElementById('ch-toast');
  const navItems = document.querySelectorAll('.ss-nav-item[data-section]');
  const sections = document.querySelectorAll('.ss-section');

  const targetsContainer = document.getElementById('perm-targets-container');
  const btnAddTarget = document.getElementById('btn-add-perm-target');
  const membersDropdown = document.getElementById('perm-members-dropdown');
  const permListContainer = document.getElementById('perm-list-container');

  const warningGenel = document.getElementById('owner-warning-genel');
  const warningPerm = document.getElementById('owner-warning-perm');

  const voiceLimitCard = document.getElementById('voice-limit-card');
  const userLimitRange = document.getElementById('ch-user-limit-range');
  const userLimitDisplay = document.getElementById('ch-user-limit-display');

  let selectedType = ch.type || 'text';
  let activeTarget = '@everyone'; // '@everyone' or '@handle'
  let pendingPermissions = JSON.parse(JSON.stringify(ch.permissions || {}));

  // Non-owner lock
  if (!isOwner) {
    if (warningGenel) warningGenel.style.display = 'flex';
    if (warningPerm) warningPerm.style.display = 'flex';
    if (nameInput) nameInput.disabled = true;
    if (userLimitRange) userLimitRange.disabled = true;
    typeBtns.forEach(b => b.style.pointerEvents = 'none');
    if (btnSaveGenel) btnSaveGenel.style.display = 'none';
    if (btnSavePerms) btnSavePerms.style.display = 'none';
    if (btnAddTarget) btnAddTarget.style.display = 'none';
    if (btnSidebarDelete) btnSidebarDelete.style.display = 'none';
  }

  // Populate header & sidebar
  if (chTitleBar) chTitleBar.textContent = `– #${ch.name} (Kanal Ayarları)`;
  if (chSidebarName) chSidebarName.textContent = '#' + (ch.name || 'kanal');
  if (chSidebarCat) chSidebarCat.textContent = cat.name || 'Kategori';
  if (nameInput) nameInput.value = ch.name || '';

  // Populate User Limit Slider
  function updateUserLimitDisplay(val) {
    if (!userLimitDisplay) return;
    const num = parseInt(val) || 0;
    if (num <= 0) {
      userLimitDisplay.textContent = 'Sınırsız';
      userLimitDisplay.style.color = 'var(--text-muted)';
    } else {
      userLimitDisplay.textContent = `${num} Kullanıcı`;
      userLimitDisplay.style.color = 'gray';
    }
  }

  const initialLimit = parseInt(ch.userLimit) || 0;
  if (userLimitRange) {
    userLimitRange.value = initialLimit;
    updateUserLimitDisplay(initialLimit);
    userLimitRange.addEventListener('input', (e) => {
      updateUserLimitDisplay(e.target.value);
    });
  }

  if (voiceLimitCard) {
    voiceLimitCard.style.display = selectedType === 'voice' ? 'block' : 'none';
  }

  if (chSidebarIcon) {
    chSidebarIcon.innerHTML = selectedType === 'voice'
      ? '<i data-lucide="volume-2" style="width:18px;height:18px;"></i>'
      : '<i data-lucide="hash" style="width:18px;height:18px;"></i>';
  }

  // Type switcher
  typeBtns.forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.type === selectedType);
    btn.addEventListener('click', () => {
      if (!isOwner) return;
      selectedType = btn.dataset.type;
      typeBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      if (voiceLimitCard) {
        voiceLimitCard.style.display = selectedType === 'voice' ? 'block' : 'none';
      }
      if (chSidebarIcon) {
        chSidebarIcon.innerHTML = selectedType === 'voice'
          ? '<i data-lucide="volume-2" style="width:18px;height:18px;"></i>'
          : '<i data-lucide="hash" style="width:18px;height:18px;"></i>';
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    });
  });

  // Section tabs
  navItems.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetSec = btn.dataset.section;
      navItems.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      sections.forEach(s => s.classList.remove('active'));
      const activeEl = document.getElementById('section-genel');
      const permEl = document.getElementById('section-izinler');
      if (targetSec === 'genel' && activeEl) activeEl.classList.add('active');
      if (targetSec === 'izinler' && permEl) {
        permEl.classList.add('active');
        renderPermissionTargets();
        renderPermissionsList();
      }
      if (typeof lucide !== 'undefined') lucide.createIcons();
    });
  });

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2200);
  }

  function goBack(result) {
    if (window.parent && window.parent !== window && typeof window.parent.closeModalView === 'function') {
      window.parent.closeModalView(result || null);
    } else {
      window.location.href = `index.html?serverId=${encodeURIComponent(serverId)}&channelId=${encodeURIComponent(channelId)}`;
    }
  }

  if (btnCloseArea) btnCloseArea.addEventListener('click', () => goBack());
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') goBack();
  });

  // Save Genel
  if (btnSaveGenel) {
    btnSaveGenel.addEventListener('click', () => {
      if (!isOwner) return;
      const newName = nameInput.value.trim().toLowerCase().replace(/\s+/g, '-');
      if (!newName) { showToast('Kanal adı boş olamaz'); return; }
      const userLimit = selectedType === 'voice' ? (parseInt(userLimitRange?.value) || 0) : 0;
      const ok = ds.updateChannel(serverId, categoryId, channelId, { name: newName, type: selectedType, userLimit });
      if (ok) {
        showToast('Kanal güncellendi ✓');
        if (chSidebarName) chSidebarName.textContent = '#' + newName;
        setTimeout(() => {
          goBack({ type: 'channel-updated', serverId, categoryId, channelId, newName, channelType: selectedType });
        }, 350);
      } else {
        showToast('Güncelleme başarısız');
      }
    });
  }

  // Delete Channel
  if (btnSidebarDelete) {
    btnSidebarDelete.addEventListener('click', () => {
      if (!isOwner) return;
      if (!confirm(`"#${ch.name}" kanalını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) return;
      ds.removeChannel(serverId, categoryId, channelId);
      showToast('Kanal silindi');
      setTimeout(() => {
        goBack({ type: 'channel-removed', serverId, categoryId, channelId });
      }, 350);
    });
  }

  // ── PERMISSIONS DEFINITIONS ──────────────────────────────
  const PERMISSION_GROUPS = [
    {
      group: 'Genel İzinler',
      items: [
        { key: 'view_channel', name: 'Kanalı Görüntüle', desc: 'Üyelerin bu kanalı görmesine ve mesaj geçmişini okumasına izin verir.' },
        { key: 'manage_messages', name: 'Mesajları Yönet', desc: 'Üyelerin diğer kullanıcıların mesajlarını silmesine olanak tanır.' }
      ]
    },
    {
      group: 'Metin Kanalı İzinleri',
      items: [
        { key: 'send_messages', name: 'Mesaj Gönder', desc: 'Üyelerin kanala yeni mesaj ve gönderi yazmasına izin verir.' },
        { key: 'attach_files', name: 'Dosya ve Medya Ekle', desc: 'Üyelerin görseller ve ek dosyalar yüklemesine izin verir.' },
        { key: 'pin_messages', name: 'Mesajları Sabitle', desc: 'Üyelerin önemli mesajları sabitlemesine olanak tanır.' },
        { key: 'mention_everyone', name: 'Herkesi Etiketle', desc: 'Üyelerin @everyone etiketi kullanmasına izin verir.' }
      ]
    },
    {
      group: 'Ses Kanalı İzinleri',
      items: [
        { key: 'connect_voice', name: 'Ses Kanalına Bağlan', desc: 'Üyelerin bu ses kanalına katılmasına izin verir.' },
        { key: 'speak_voice', name: 'Konuş / Mikrofon Aç', desc: 'Üyelerin ses kanalında mikrofonunu kullanarak konuşmasına izin verir.' }
      ]
    }
  ];

  function renderPermissionTargets() {
    if (!targetsContainer) return;
    const targetKeys = Object.keys(pendingPermissions);
    const targets = ['@everyone', ...targetKeys.filter(k => k !== '@everyone')];

    targetsContainer.innerHTML = targets.map(t => {
      const isEv = t === '@everyone';
      const isActive = t === activeTarget;
      let label = '@everyone (Tüm Üyeler)';
      let avatarHtml = '<i data-lucide="users" style="width:14px;height:14px;"></i>';

      if (!isEv) {
        const prof = ds.getUserProfile ? ds.getUserProfile(t) : null;
        label = prof && prof.name ? `${prof.name} (${t})` : t;
        avatarHtml = prof && prof.avatar
          ? `<img src="${prof.avatar}" class="perm-target-chip-avatar">`
          : '<i data-lucide="user" style="width:14px;height:14px;"></i>';
      }

      return `
        <div class="perm-target-chip ${isActive ? 'active' : ''}" data-target="${t}">
          ${avatarHtml}
          <span>${label}</span>
          ${!isEv && isOwner ? `<button type="button" class="perm-target-remove" data-remove="${t}" title="Özel izni kaldır">×</button>` : ''}
        </div>
      `;
    }).join('');

    targetsContainer.querySelectorAll('.perm-target-chip').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('.perm-target-remove')) return;
        activeTarget = el.dataset.target;
        renderPermissionTargets();
        renderPermissionsList();
      });
    });

    targetsContainer.querySelectorAll('.perm-target-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const rmTarget = btn.dataset.remove;
        delete pendingPermissions[rmTarget];
        if (activeTarget === rmTarget) activeTarget = '@everyone';
        renderPermissionTargets();
        renderPermissionsList();
      });
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  // Members dropdown for adding overrides
  if (btnAddTarget && membersDropdown) {
    btnAddTarget.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = membersDropdown.classList.contains('show');
      if (isOpen) {
        membersDropdown.classList.remove('show');
      } else {
        renderMembersDropdown();
        membersDropdown.classList.add('show');
      }
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#btn-add-perm-target') && !e.target.closest('#perm-members-dropdown')) {
        membersDropdown.classList.remove('show');
      }
    });
  }

  function renderMembersDropdown() {
    if (!membersDropdown) return;
    const members = srv.inviteCode ? ds.getServerMembers(srv.inviteCode) : [];
    const available = members.filter(m => m.handle !== ds.currentUser.handle && !pendingPermissions[m.handle]);

    if (available.length === 0) {
      membersDropdown.innerHTML = `<div style="padding:10px; font-size:0.78rem; color:var(--text-muted); text-align:center;">Eklenebilecek başka üye bulunamadı.</div>`;
      return;
    }

    membersDropdown.innerHTML = available.map(m => `
      <button type="button" class="perm-member-option" data-handle="${m.handle}">
        <img src="${m.avatar || window.DEFAULT_AVATAR}" class="perm-target-chip-avatar">
        <span>${m.name || m.handle}</span>
        <span style="font-size:0.72rem; color:var(--text-muted); margin-left:auto;">${m.handle}</span>
      </button>
    `).join('');

    membersDropdown.querySelectorAll('.perm-member-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const handle = btn.dataset.handle;
        if (!pendingPermissions[handle]) pendingPermissions[handle] = {};
        activeTarget = handle;
        membersDropdown.classList.remove('show');
        renderPermissionTargets();
        renderPermissionsList();
      });
    });
  }

  function renderPermissionsList() {
    if (!permListContainer) return;
    const currentTargetPerms = pendingPermissions[activeTarget] || {};

    permListContainer.innerHTML = PERMISSION_GROUPS.map(g => `
      <div class="perm-group-card">
        <div class="perm-group-title">${g.group}</div>
        ${g.items.map(item => {
      const val = currentTargetPerms[item.key]; // true, false, or undefined (null = inherit)
      const isAllow = val === true;
      const isDeny = val === false;
      const isInherit = val === undefined || val === null;

      return `
            <div class="perm-row">
              <div class="perm-info">
                <span class="perm-name">${item.name}</span>
                <span class="perm-desc">${item.desc}</span>
              </div>
              <div class="perm-tri-switch">
                <button type="button" class="perm-switch-btn btn-deny ${isDeny ? 'active' : ''}" data-key="${item.key}" data-val="deny" title="Yasakla">
                  <i data-lucide="x" style="width:14px;height:14px;"></i>
                </button>
                <button type="button" class="perm-switch-btn btn-inherit ${isInherit ? 'active' : ''}" data-key="${item.key}" data-val="inherit" title="Kategoriden Miras Al / Varsayılan">
                  <i data-lucide="minus" style="width:14px;height:14px;"></i>
                </button>
                <button type="button" class="perm-switch-btn btn-allow ${isAllow ? 'active' : ''}" data-key="${item.key}" data-val="allow" title="İzin Ver">
                  <i data-lucide="check" style="width:14px;height:14px;"></i>
                </button>
              </div>
            </div>
          `;
    }).join('')}
      </div>
    `).join('');

    if (isOwner) {
      permListContainer.querySelectorAll('.perm-switch-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const key = btn.dataset.key;
          const action = btn.dataset.val;
          if (!pendingPermissions[activeTarget]) pendingPermissions[activeTarget] = {};

          if (action === 'allow') pendingPermissions[activeTarget][key] = true;
          else if (action === 'deny') pendingPermissions[activeTarget][key] = false;
          else delete pendingPermissions[activeTarget][key];

          renderPermissionsList();
        });
      });
    } else {
      permListContainer.querySelectorAll('.perm-switch-btn').forEach(btn => {
        btn.style.pointerEvents = 'none';
        btn.style.opacity = '0.6';
      });
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  // Save Permissions
  if (btnSavePerms) {
    btnSavePerms.addEventListener('click', () => {
      if (!isOwner) return;
      ch.permissions = pendingPermissions;
      ds.saveServers();
      ds.notify();
      showToast('Kanal izinleri başarıyla kaydedildi ✓');
    });
  }

  if (typeof lucide !== 'undefined') lucide.createIcons();
});
