/**
 * Ziorse - Category Edit & Permissions Logic
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
  const serverId   = params.get('serverId');
  const categoryId = params.get('categoryId');

  // Find server and category
  const srv = ds.servers.find(s => String(s.id) === String(serverId));
  if (!srv) {
    console.error('Server not found:', serverId);
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
    console.error('Category not found:', categoryId, 'in server categories:', srv.categories);
    if (window.parent && window.parent !== window && typeof window.parent.closeModalView === 'function') {
      window.parent.closeModalView();
    } else if (window.history.length > 1) {
      window.history.back();
    }
    return;
  }

  if (!cat.permissions) cat.permissions = {};

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
  const catTitleBar       = document.getElementById('cat-title-bar');
  const catSidebarName    = document.getElementById('cat-sidebar-name');
  const catSidebarSrv     = document.getElementById('cat-sidebar-srv');
  const nameInput         = document.getElementById('cat-name-input');
  const btnSaveGenel      = document.getElementById('btn-save-genel');
  const btnSavePerms      = document.getElementById('btn-save-perms');
  const btnCloseArea      = document.getElementById('btn-close-area');
  const btnSidebarDelete  = document.getElementById('btn-sidebar-delete');
  const chCountInfo       = document.getElementById('ch-count-info');
  const toast             = document.getElementById('ch-toast');
  const navItems          = document.querySelectorAll('.ss-nav-item[data-section]');
  const sections          = document.querySelectorAll('.ss-section');

  const fileInput         = document.getElementById('cat-icon-file-input');
  const btnPickIcon       = document.getElementById('btn-pick-cat-icon');
  const btnRemoveIcon     = document.getElementById('btn-remove-cat-icon');
  const previewImg        = document.getElementById('cat-icon-preview-img');
  const previewPlaceholder= document.getElementById('cat-icon-preview-placeholder');

  const targetsContainer  = document.getElementById('perm-targets-container');
  const btnAddTarget      = document.getElementById('btn-add-perm-target');
  const membersDropdown   = document.getElementById('perm-members-dropdown');
  const permListContainer = document.getElementById('perm-list-container');

  const warningGenel      = document.getElementById('owner-warning-genel');
  const warningPerm       = document.getElementById('owner-warning-perm');

  let currentIconDataUrl = cat.icon || null;
  let activeTarget = '@everyone';
  let pendingPermissions = JSON.parse(JSON.stringify(cat.permissions || {}));

  // Non-owner lock
  if (!isOwner) {
    if (warningGenel) warningGenel.style.display = 'flex';
    if (warningPerm) warningPerm.style.display = 'flex';
    if (nameInput) nameInput.disabled = true;
    if (btnPickIcon) btnPickIcon.style.display = 'none';
    if (btnRemoveIcon) btnRemoveIcon.style.display = 'none';
    if (btnSaveGenel) btnSaveGenel.style.display = 'none';
    if (btnSavePerms) btnSavePerms.style.display = 'none';
    if (btnAddTarget) btnAddTarget.style.display = 'none';
    if (btnSidebarDelete) btnSidebarDelete.style.display = 'none';
  }

  // Populate header & sidebar
  if (catTitleBar) catTitleBar.textContent = `– ${cat.name} (Kategori Ayarları)`;
  if (catSidebarName) catSidebarName.textContent = cat.name || 'Kategori';
  if (catSidebarSrv) catSidebarSrv.textContent = srv.name || 'Sunucu';
  if (nameInput) nameInput.value = cat.name || '';

  const chCount = (cat.channels || []).length;
  if (chCountInfo) {
    chCountInfo.textContent = chCount === 0
      ? 'Bu kategoride henüz kanal yok.'
      : `Bu kategoride ${chCount} kanal var: ` + cat.channels.map(c => '#' + c.name).join(', ');
  }

  function updateIconPreview(url) {
    if (url) {
      if (previewImg) { previewImg.src = url; previewImg.style.display = 'block'; }
      if (previewPlaceholder) previewPlaceholder.style.display = 'none';
      if (btnRemoveIcon && isOwner) btnRemoveIcon.style.display = 'inline-flex';
    } else {
      if (previewImg) { previewImg.src = ''; previewImg.style.display = 'none'; }
      if (previewPlaceholder) previewPlaceholder.style.display = 'block';
      if (btnRemoveIcon) btnRemoveIcon.style.display = 'none';
    }
  }

  updateIconPreview(currentIconDataUrl);

  function compressIcon(file, cb) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 48;
        let w = img.width, h = img.height;
        if (w > h) {
          if (w > size) { h = Math.round((h * size) / w); w = size; }
        } else {
          if (h > size) { w = Math.round((w * size) / h); h = size; }
        }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        cb(canvas.toDataURL('image/png'));
      };
      img.onerror = () => cb(ev.target.result);
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  // File pick
  if (btnPickIcon && fileInput) {
    btnPickIcon.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (typeof window.openImageCropper === 'function') {
        window.openImageCropper({
          file: file,
          aspectRatio: 1,
          shape: 'square',
          title: 'Kategori İkonunu Kırp',
          onCrop: (dataUrl) => {
            currentIconDataUrl = dataUrl;
            updateIconPreview(currentIconDataUrl);
          }
        });
      } else {
        compressIcon(file, (dataUrl) => {
          currentIconDataUrl = dataUrl;
          updateIconPreview(currentIconDataUrl);
        });
      }
    });
  }

  if (btnRemoveIcon) {
    btnRemoveIcon.addEventListener('click', () => {
      currentIconDataUrl = null;
      if (fileInput) fileInput.value = '';
      updateIconPreview(null);
    });
  }

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
      window.location.href = `index.html?serverId=${encodeURIComponent(serverId)}`;
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
      const newName = nameInput.value.trim().toUpperCase();
      if (!newName) { showToast('Kategori adı boş olamaz'); return; }

      const targetServerId = srv.id || serverId;
      const targetCategoryId = cat.id || categoryId;

      cat.name = newName;
      cat.icon = currentIconDataUrl;

      const ok = ds.updateCategory(targetServerId, targetCategoryId, { name: newName, icon: currentIconDataUrl });
      ds.saveServers();
      ds.notify({ type: 'category-updated', serverId: targetServerId, categoryId: targetCategoryId, newName, icon: currentIconDataUrl });

      showToast('Kategori güncellendi ✓');
      if (catSidebarName) catSidebarName.textContent = newName;
      setTimeout(() => {
        goBack({ type: 'category-updated', serverId: targetServerId, categoryId: targetCategoryId, newName, icon: currentIconDataUrl });
      }, 350);
    });
  }

  // Delete Category
  if (btnSidebarDelete) {
    btnSidebarDelete.addEventListener('click', () => {
      if (!isOwner) return;
      if (!confirm(`"${cat.name}" kategorisini ve içindeki TÜM kanalları silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) return;

      const targetServerId = srv.id || serverId;
      const targetCategoryId = cat.id || categoryId;

      ds.removeCategory(targetServerId, targetCategoryId);
      ds.saveServers();
      showToast('Kategori silindi');
      setTimeout(() => {
        goBack({ type: 'category-removed', serverId: targetServerId, categoryId: targetCategoryId });
      }, 350);
    });
  }

  // ── PERMISSIONS DEFINITIONS ──────────────────────────────
  const PERMISSION_GROUPS = [
    {
      group: 'Genel İzinler',
      items: [
        { key: 'view_channel', name: 'Kanalları Görüntüle', desc: 'Üyelerin bu kategorideki kanalları görmesine ve mesaj geçmişini okumasına izin verir.' },
        { key: 'manage_messages', name: 'Mesajları Yönet', desc: 'Üyelerin diğer kullanıcıların mesajlarını silmesine olanak tanır.' }
      ]
    },
    {
      group: 'Metin Kanalı İzinleri',
      items: [
        { key: 'send_messages', name: 'Mesaj Gönder', desc: 'Üyelerin bu kategorideki metin kanallarına mesaj ve gönderi yazmasına izin verir.' },
        { key: 'attach_files', name: 'Dosya ve Medya Ekle', desc: 'Üyelerin görseller ve ek dosyalar yüklemesine izin verir.' },
        { key: 'pin_messages', name: 'Mesajları Sabitle', desc: 'Üyelerin önemli mesajları sabitlemesine olanak tanır.' },
        { key: 'mention_everyone', name: 'Herkesi Etiketle', desc: 'Üyelerin @everyone etiketi kullanmasına izin verir.' }
      ]
    },
    {
      group: 'Ses Kanalı İzinleri',
      items: [
        { key: 'connect_voice', name: 'Ses Kanallarına Bağlan', desc: 'Üyelerin bu kategorideki ses kanallarına katılmasına izin verir.' },
        { key: 'speak_voice', name: 'Konuş / Mikrofon Aç', desc: 'Üyelerin ses kanallarında mikrofonunu kullanarak konuşmasına izin verir.' }
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
          const val = currentTargetPerms[item.key]; // true, false, or undefined (neutral)
          const isAllow = val === true;
          const isDeny = val === false;
          const isNeutral = val === undefined || val === null;

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
                <button type="button" class="perm-switch-btn btn-inherit ${isNeutral ? 'active' : ''}" data-key="${item.key}" data-val="neutral" title="Nötr / Standart">
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
      cat.permissions = pendingPermissions;
      ds.saveServers();
      ds.notify();
      showToast('Kategori izinleri kaydedildi (tüm kanallara uygulandı) ✓');
    });
  }

  if (typeof lucide !== 'undefined') lucide.createIcons();
});
