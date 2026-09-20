/**
 * Ziorse - Server Settings Page Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
  }

  const ds = (window.parent && window.parent !== window && window.parent.dataStore)
    ? window.parent.dataStore
    : (window.dataStore = new DataStore());
  if (typeof lucide !== 'undefined') lucide.createIcons();

  // Dark mode
  if (ds.theme === 'dark') {
    document.body.classList.add('dark-mode');
  }

  // URL'den serverId ve channelId parametrelerini al
  const urlParams = new URLSearchParams(window.location.search);
  const serverId = urlParams.get('id');
  const channelId = urlParams.get('channel') || 'genel';

  let server = ds.servers.find(s => s.id === serverId);

  // Eğer geçerli bir sunucu bulunamazsa ana sayfaya yönlendir
  if (!server) {
    if (ds.servers.length > 0) {
      server = ds.servers[0];
    } else {
      window.location.href = 'index.html';
      return;
    }
  }

  // Orijinal verileri sakla (değişiklikleri karşılaştırmak için)
  let originalName = server.name || '';
  let originalDesc = server.description || '';
  let originalIcon = server.icon || '';
  let originalBanner = server.banner || '';
  let newIconDataUrl = null;
  let newBannerDataUrl = null;
  let editingChannelId = null;

  // İzinler & Rol Yetkileri Kontrolü
  const cu = ds.currentUser || { handle: '' };
  const currentHandle = cu.handle || '';

  const isOwner = ds.isServerOwner ? ds.isServerOwner(server.id, currentHandle) : (server.ownerHandle && currentHandle && (server.ownerHandle.toLowerCase() === currentHandle.toLowerCase() || server.ownerHandle.toLowerCase().replace('@', '') === currentHandle.toLowerCase().replace('@', '')));

  const canManageServer = isOwner || (ds.checkServerPermission && ds.checkServerPermission(server.id, currentHandle, 'manage_server'));
  const canManageRoles = isOwner || canManageServer || (ds.checkServerPermission && ds.checkServerPermission(server.id, currentHandle, 'manage_roles'));
  const canManageChannels = isOwner || canManageServer || (ds.checkServerPermission && ds.checkServerPermission(server.id, currentHandle, 'manage_channels'));
  const canManageMembers = isOwner || canManageServer || canManageRoles || (ds.checkServerPermission && ds.checkServerPermission(server.id, currentHandle, 'kick_ban_members'));

  // DOM Elemanları
  const ssTitleBar = document.getElementById('ss-server-title-bar');
  const ssSidebarIcon = document.getElementById('ss-sidebar-icon');
  const ssSidebarName = document.getElementById('ss-sidebar-name');
  const ssInputName = document.getElementById('ss-input-name');
  const ssInputDesc = document.getElementById('ss-input-desc');
  const ssIconInitials = document.getElementById('ss-icon-initials');
  const ssIconImg = document.getElementById('ss-icon-img');
  const ssFileIcon = document.getElementById('ss-file-icon');
  const btnPickIcon = document.getElementById('btn-ss-pick-icon');
  const btnResetIcon = document.getElementById('btn-ss-reset-icon');

  // Banner DOM Elemanları
  const ssBannerPlaceholder = document.getElementById('ss-banner-placeholder');
  const ssBannerImg = document.getElementById('ss-banner-img');
  const ssFileBanner = document.getElementById('ss-file-banner');
  const btnPickBanner = document.getElementById('btn-ss-pick-banner');
  const btnResetBanner = document.getElementById('btn-ss-reset-banner');

  const ssSaveBar = document.getElementById('ss-save-bar');
  const btnSave = document.getElementById('btn-ss-save');
  const btnDiscard = document.getElementById('btn-ss-discard');
  const btnClose = document.getElementById('btn-ss-close');
  const ssToast = document.getElementById('ss-toast');

  // Silme & Ayrılma Modal elemanları
  const confirmOverlay = document.getElementById('ss-confirm-overlay');
  const confirmTitle = document.getElementById('ss-confirm-title');
  const confirmText = document.getElementById('ss-confirm-text');
  const confirmNameHint = document.getElementById('ss-confirm-name-hint');
  const confirmInput = document.getElementById('ss-confirm-input');
  const btnConfirmCancel = document.getElementById('btn-ss-confirm-cancel');
  const btnConfirmDelete = document.getElementById('btn-ss-confirm-delete');
  const btnDeleteServer = document.getElementById('btn-ss-delete-server');

  // Kanal Düzenleme Modal elemanları
  const editChannelOverlay = document.getElementById('ss-channel-edit-overlay');
  const editChannelInput = document.getElementById('ss-edit-channel-input');
  const btnEditChannelCancel = document.getElementById('btn-ss-edit-channel-cancel');
  const btnEditChannelSave = document.getElementById('btn-ss-edit-channel-save');

  // Navigation
  const navItems = document.querySelectorAll('.ss-nav-item[data-section]');
  const sections = document.querySelectorAll('.ss-section');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetSec = item.dataset.section;
      if (targetSec === 'roller' && !canManageRoles) {
        showToast('Rolleri yönetme yetkiniz bulunmuyor.');
        return;
      }
      if (targetSec === 'kanallar' && !canManageChannels) {
        showToast('Kanalları yönetme yetkiniz bulunmuyor.');
        return;
      }
      if (targetSec === 'uyeler' && !canManageMembers) {
        showToast('Üyeleri yönetme yetkiniz bulunmuyor.');
        return;
      }
      if (targetSec === 'tehlike' && !isOwner) {
        showToast('Bu alanı yalnızca sunucu sahibi görüntüleyebilir.');
        return;
      }

      navItems.forEach(n => n.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));
      item.classList.add('active');
      const targetEl = document.getElementById('section-' + targetSec);
      if (targetEl) targetEl.classList.add('active');
    });
  });

  // Sayfayı Yükle
  function loadServerDetails() {
    if (ssTitleBar) ssTitleBar.textContent = `– ${server.name} Ayarları`;
    if (ssSidebarName) ssSidebarName.textContent = server.name;
    if (ssInputName) ssInputName.value = server.name;
    if (ssInputDesc) ssInputDesc.value = server.description || '';

    updateIconPreview(originalIcon || (server.name ? server.name.substring(0, 2).toUpperCase() : 'SR'));
    updateBannerPreview(originalBanner);
    applyPermissionRestrictions();
    renderChannels();
    renderRoles();
    renderMembers();
    renderInvite();
    renderDangerZone();
  }

  function applyPermissionRestrictions() {
    // 1. Sidebar Nav Görünürlüğü
    const navRoller = document.querySelector('.ss-nav-item[data-section="roller"]');
    const navKanallar = document.querySelector('.ss-nav-item[data-section="kanallar"]');
    const navUyeler = document.querySelector('.ss-nav-item[data-section="uyeler"]');
    const navTehlike = document.querySelector('.ss-nav-item[data-section="tehlike"]');

    if (navRoller) navRoller.style.display = canManageRoles ? 'flex' : 'none';
    if (navKanallar) navKanallar.style.display = canManageChannels ? 'flex' : 'none';
    if (navUyeler) navUyeler.style.display = canManageMembers ? 'flex' : 'none';
    if (navTehlike) navTehlike.style.display = isOwner ? 'flex' : 'none';

    // 2. Genel Bilgiler Salt Okunur / Opacity Modu
    const sectionGenel = document.getElementById('section-genel');
    if (!canManageServer) {
      if (sectionGenel) {
        sectionGenel.classList.add('ss-readonly-mode');
        if (!document.getElementById('ss-readonly-banner')) {
          const bannerEl = document.createElement('div');
          bannerEl.id = 'ss-readonly-banner';
          bannerEl.className = 'ss-readonly-banner';
          bannerEl.innerHTML = `
            <i data-lucide="lock" style="width:16px;height:16px;color:var(--text-muted);flex-shrink:0;"></i>
            <span>Bu sunucuyu düzenleme yetkiniz bulunmuyor. Genel bilgileri salt okunur olarak görüntülüyorsunuz.</span>
          `;
          const titleEl = sectionGenel.querySelector('.ss-section-title');
          if (titleEl && titleEl.nextSibling) {
            sectionGenel.insertBefore(bannerEl, titleEl.nextSibling);
          } else if (titleEl) {
            sectionGenel.appendChild(bannerEl);
          }
        }
      }
      if (ssInputName) {
        ssInputName.disabled = true;
        ssInputName.readOnly = true;
        ssInputName.style.cursor = 'not-allowed';
      }
      if (ssInputDesc) {
        ssInputDesc.disabled = true;
        ssInputDesc.readOnly = true;
        ssInputDesc.style.cursor = 'not-allowed';
      }
      if (btnPickIcon) btnPickIcon.style.display = 'none';
      if (btnResetIcon) btnResetIcon.style.display = 'none';
      if (btnPickBanner) btnPickBanner.style.display = 'none';
      if (btnResetBanner) btnResetBanner.style.display = 'none';
      const btnRegen = document.getElementById('btn-ss-regen-invite');
      if (btnRegen) btnRegen.style.display = 'none';
    } else {
      if (sectionGenel) {
        sectionGenel.classList.remove('ss-readonly-mode');
        const existingBanner = document.getElementById('ss-readonly-banner');
        if (existingBanner) existingBanner.remove();
      }
      if (ssInputName) {
        ssInputName.disabled = false;
        ssInputName.readOnly = false;
        ssInputName.style.cursor = '';
      }
      if (ssInputDesc) {
        ssInputDesc.disabled = false;
        ssInputDesc.readOnly = false;
        ssInputDesc.style.cursor = '';
      }
      if (btnPickIcon) btnPickIcon.style.display = '';
      if (btnResetIcon) btnResetIcon.style.display = '';
      if (btnPickBanner) btnPickBanner.style.display = '';
      if (btnResetBanner) btnResetBanner.style.display = '';
      const btnRegen = document.getElementById('btn-ss-regen-invite');
      if (btnRegen) btnRegen.style.display = '';
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  function updateIconPreview(val) {
    if (val && (val.startsWith('data:image') || val.startsWith('http'))) {
      if (ssIconImg) {
        ssIconImg.src = val;
        ssIconImg.classList.add('loaded');
        ssIconImg.style.display = 'block';
      }
      if (ssIconInitials) ssIconInitials.style.display = 'none';
      if (ssSidebarIcon) {
        ssSidebarIcon.innerHTML = `<img src="${val}" style="width:100%;height:100%;object-fit:cover;display:block;border-radius:inherit;">`;
      }
    } else {
      const initials = val || (server.name ? server.name.substring(0, 2).toUpperCase() : 'SR');
      if (ssIconImg) {
        ssIconImg.classList.remove('loaded');
        ssIconImg.style.display = 'none';
      }
      if (ssIconInitials) {
        ssIconInitials.style.display = 'block';
        ssIconInitials.textContent = initials;
      }
      if (ssSidebarIcon) {
        ssSidebarIcon.innerHTML = `<span>${escapeHtml(initials)}</span>`;
      }
    }
  }

  function updateBannerPreview(val) {
    if (val && (val.startsWith('data:image') || val.startsWith('http'))) {
      if (ssBannerImg) {
        ssBannerImg.src = val;
        ssBannerImg.classList.add('loaded');
        ssBannerImg.style.display = 'block';
      }
      if (ssBannerPlaceholder) ssBannerPlaceholder.style.display = 'none';
    } else {
      if (ssBannerImg) {
        ssBannerImg.classList.remove('loaded');
        ssBannerImg.style.display = 'none';
      }
      if (ssBannerPlaceholder) ssBannerPlaceholder.style.display = 'block';
    }
  }

  // Değişiklik kontrolü
  function checkChanges() {
    if (!canManageServer && !canManageRoles) {
      ssSaveBar.classList.remove('visible');
      return;
    }

    const nameChanged = ssInputName.value.trim() !== originalName;
    const descChanged = (ssInputDesc ? ssInputDesc.value.trim() : '') !== originalDesc;
    const iconChanged = newIconDataUrl !== null;
    const bannerChanged = newBannerDataUrl !== null;
    const generalChanged = canManageServer && (nameChanged || descChanged || iconChanged || bannerChanged);

    let roleChanged = false;
    let roleNameEmpty = false;
    if (currentRoleOriginal && currentRoleDraft && selectedRoleId) {
      if (JSON.stringify(currentRoleOriginal) !== JSON.stringify(currentRoleDraft)) {
        roleChanged = true;
      }
      if (!currentRoleDraft.name || currentRoleDraft.name.trim() === '') {
        roleNameEmpty = true;
      }
    }

    if (generalChanged || roleChanged) {
      ssSaveBar.classList.add('visible');
      if (roleNameEmpty) {
        btnSave.disabled = true;
        btnSave.style.opacity = '0.5';
        btnSave.style.cursor = 'not-allowed';
      } else {
        btnSave.disabled = false;
        btnSave.style.opacity = '1';
        btnSave.style.cursor = 'pointer';
      }
    } else {
      ssSaveBar.classList.remove('visible');
      btnSave.disabled = false;
      btnSave.style.opacity = '1';
      btnSave.style.cursor = 'pointer';
    }
  }

  if (ssInputName) ssInputName.addEventListener('input', checkChanges);
  if (ssInputDesc) ssInputDesc.addEventListener('input', checkChanges);

  // İkon Değiştirme
  if (btnPickIcon) btnPickIcon.addEventListener('click', () => ssFileIcon.click());
  if (ssFileIcon) {
    ssFileIcon.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        if (window.openImageCropper) {
          window.openImageCropper({
            file: file,
            shape: 'circle',
            title: 'Sunucu İkonunu Ayarla',
            onCrop: (croppedDataUrl) => {
              newIconDataUrl = croppedDataUrl;
              updateIconPreview(newIconDataUrl);
              checkChanges();
            }
          });
        } else {
          const reader = new FileReader();
          reader.onload = (ev) => {
            newIconDataUrl = ev.target.result;
            updateIconPreview(newIconDataUrl);
            checkChanges();
          };
          reader.readAsDataURL(file);
        }
        ssFileIcon.value = '';
      }
    });
  }

  if (btnResetIcon) {
    btnResetIcon.addEventListener('click', () => {
      newIconDataUrl = '';
      updateIconPreview(server.name ? server.name.substring(0, 2).toUpperCase() : 'SR');
      checkChanges();
    });
  }

  // Banner Değiştirme
  if (btnPickBanner) btnPickBanner.addEventListener('click', () => ssFileBanner.click());
  if (ssFileBanner) {
    ssFileBanner.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        if (window.openImageCropper) {
          window.openImageCropper({
            file: file,
            shape: 'banner',
            aspectRatio: 2.7,
            title: 'Sunucu Başlığını (Banner) Ayarla',
            onCrop: (croppedDataUrl) => {
              newBannerDataUrl = croppedDataUrl;
              updateBannerPreview(newBannerDataUrl);
              checkChanges();
            }
          });
        } else {
          const reader = new FileReader();
          reader.onload = (ev) => {
            newBannerDataUrl = ev.target.result;
            updateBannerPreview(newBannerDataUrl);
            checkChanges();
          };
          reader.readAsDataURL(file);
        }
        ssFileBanner.value = '';
      }
    });
  }

  if (btnResetBanner) {
    btnResetBanner.addEventListener('click', () => {
      newBannerDataUrl = '';
      updateBannerPreview('');
      checkChanges();
    });
  }

  // Değişiklikleri Kaydet
  if (btnSave) {
    btnSave.addEventListener('click', () => {
      if (!canManageServer && !canManageRoles) {
        showToast('Değişiklik yapma yetkiniz bulunmuyor');
        return;
      }

      let anySaved = false;

      // 1. Rol değişiklikleri kaydet
      if (currentRoleOriginal && currentRoleDraft && selectedRoleId && canManageRoles) {
        const roleChanged = JSON.stringify(currentRoleOriginal) !== JSON.stringify(currentRoleDraft);
        if (roleChanged) {
          if (!currentRoleDraft.name || !currentRoleDraft.name.trim()) {
            showToast('Rol adı boş olamaz');
            return;
          }
          currentRoleDraft.name = currentRoleDraft.name.trim();
          ds.saveServerRole(server.id, currentRoleDraft);
          currentRoleOriginal = JSON.parse(JSON.stringify(currentRoleDraft));
          renderRoles();
          renderMembers();
          anySaved = true;
        }
      }

      // 2. Genel sunucu bilgileri kaydet
      const nameChanged = ssInputName.value.trim() !== originalName;
      const descChanged = (ssInputDesc ? ssInputDesc.value.trim() : '') !== originalDesc;
      const iconChanged = newIconDataUrl !== null;
      const bannerChanged = newBannerDataUrl !== null;

      if ((nameChanged || descChanged || iconChanged || bannerChanged) && canManageServer) {
        const newName = ssInputName.value.trim();
        if (!newName) {
          showToast('Sunucu adı boş olamaz');
          return;
        }

        server.name = newName;
        server.description = ssInputDesc ? ssInputDesc.value.trim() : '';
        if (newIconDataUrl !== null) {
          server.icon = newIconDataUrl || newName.substring(0, 2).toUpperCase();
        }
        if (newBannerDataUrl !== null) {
          server.banner = newBannerDataUrl;
        }

        ds.saveServers();

        // Instant In-Place Live Server Media Update on Parent Window (Zero Reload!)
        const targetParent = (window.parent && window.parent !== window) ? window.parent : (window.opener || null);
        if (targetParent && typeof targetParent.updateLiveServerMedia === 'function') {
          targetParent.updateLiveServerMedia(server.id, server.icon, server.banner);
        }

        if (server.inviteCode) {
          ds._syncServerStructure(server);
        }

        originalName = server.name;
        originalDesc = server.description;
        originalIcon = server.icon;
        originalBanner = server.banner || '';
        newIconDataUrl = null;
        newBannerDataUrl = null;
        anySaved = true;
      }

      ssSaveBar.classList.remove('visible');
      if (anySaved) {
        showToast('Değişiklikler kaydedildi');
      }
    });
  }

  // Değişiklikleri Geri Al
  if (btnDiscard) {
    btnDiscard.addEventListener('click', () => {
      // 1. Rol değişikliklerini geri al
      if (currentRoleOriginal && selectedRoleId) {
        currentRoleDraft = JSON.parse(JSON.stringify(currentRoleOriginal));
        showRoleEditor(currentRoleDraft);
      }

      // 2. Genel değişiklikleri geri al
      newIconDataUrl = null;
      newBannerDataUrl = null;
      if (ssInputName) ssInputName.value = originalName;
      if (ssInputDesc) ssInputDesc.value = originalDesc;
      updateIconPreview(originalIcon);
      updateBannerPreview(originalBanner);

      checkChanges();
      showToast('Değişiklikler geri alındı');
    });
  }

  // Türkçe Karakter Destekli Slugify
  function slugifyChannelName(str) {
    const trMap = { 'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ı': 'i', 'I': 'i', 'İ': 'i', 'ö': 'o', 'Ö': 'o', 'ş': 's', 'Ş': 's', 'ü': 'u', 'Ü': 'u' };
    let val = str.split('').map(c => trMap[c] || c).join('');
    let slug = val.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    return slug || ('kanal-' + Date.now().toString(36).substring(4));
  }

  function renderChannels() {
    const listContainer = document.getElementById('ss-channels-list');
    if (!listContainer) return;

    const addRow = document.querySelector('.ss-add-row');
    if (addRow) addRow.style.display = canManageChannels ? 'flex' : 'none';

    // Migrate to categories if needed
    ds._migrateServerCategories(server);

    const categories = server.categories || [];

    if (categories.length === 0) {
      listContainer.innerHTML = `<div style="color:var(--text-muted);font-size:0.84rem;font-family:var(--font-nunito);">Henüz kategori yok. Ana ekrandan sunucu adına tıklayarak kategori oluşturabilirsiniz.</div>`;
      return;
    }

    let html = '';
    categories.forEach((cat, catIdx) => {
      html += `<div style="margin-bottom:18px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
          <span style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-muted);font-family:var(--font-montserrat);">${escapeHtml(cat.name)}</span>
        </div>`;

      if (cat.channels.length === 0) {
        html += `<div style="font-size:0.8rem;color:var(--text-dim);padding:4px 0;font-family:var(--font-nunito);">Bu kategoride kanal yok.</div>`;
      } else {
        cat.channels.forEach(ch => {
          const icon = ch.type === 'voice' ? 'volume-2' : 'hash';
          html += `<div class="ss-channel-row" style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border-color);" data-cat-id="${cat.id}" data-ch-id="${ch.id}">
            <i data-lucide="${icon}" style="width:15px;height:15px;color:var(--text-muted);"></i>
            <span style="flex:1;font-size:0.85rem;font-family:var(--font-nunito);font-weight:500;">${escapeHtml(ch.name)}</span>
            <span style="font-size:0.75rem;color:var(--text-dim);margin-right:8px;">${ch.type === 'voice' ? 'Ses' : 'Metin'}</span>
            ${canManageChannels ? `
              <div style="display:flex;gap:6px;">
                <button class="ss-btn btn-ss-edit-ch" data-cat-id="${cat.id}" data-ch-id="${ch.id}" style="padding:4px 10px;font-size:0.78rem;">
                  <i data-lucide="pencil" style="width:12px;height:12px;"></i> Düzenle
                </button>
                <button class="ss-btn ss-btn-danger btn-ss-delete-ch" data-cat-id="${cat.id}" data-ch-id="${ch.id}" style="padding:4px 10px;font-size:0.78rem;">
                  <i data-lucide="trash-2" style="width:12px;height:12px;"></i> Sil
                </button>
              </div>
            ` : ''}
          </div>`;
        });
      }
      html += `</div>`;
    });

    listContainer.innerHTML = html;
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Delete handlers
    listContainer.querySelectorAll('.btn-ss-delete-ch').forEach(btn => {
      btn.addEventListener('click', () => {
        const catId = btn.dataset.catId;
        const chId = btn.dataset.chId;
        const cat = server.categories.find(c => c.id === catId);
        if (!cat) return;
        if (cat.channels.length <= 1 && server.categories.reduce((sum, c) => sum + c.channels.length, 0) <= 1) {
          showToast('En az bir kanal bulunmalıdır!');
          return;
        }
        cat.channels = cat.channels.filter(c => c.id !== chId);
        ds.saveServers();
        renderChannels();
        showToast('Kanal silindi');
      });
    });

    // Edit handlers → navigate to channel-edit.html
    listContainer.querySelectorAll('.btn-ss-edit-ch').forEach(btn => {
      btn.addEventListener('click', () => {
        const catId = btn.dataset.catId;
        const chId = btn.dataset.chId;
        window.location.href = `channel-edit.html?serverId=${encodeURIComponent(server.id)}&categoryId=${encodeURIComponent(catId)}&channelId=${encodeURIComponent(chId)}`;
      });
    });
  }

  // Kanal Ekleme (first category)
  const btnAddChannel = document.getElementById('btn-ss-add-channel');
  const inputNewChannel = document.getElementById('ss-new-channel-input');
  if (btnAddChannel && inputNewChannel) {
    btnAddChannel.addEventListener('click', () => {
      if (!canManageChannels) {
        showToast('Kanal ekleme yetkiniz bulunmuyor');
        return;
      }
      const name = inputNewChannel.value.trim();
      if (!name) return;

      ds._migrateServerCategories(server);
      const cats = server.categories;
      if (!cats || cats.length === 0) {
        showToast('Önce bir kategori oluşturun');
        return;
      }
      const targetCat = cats[0];
      const slug = slugifyChannelName(name);
      const allChannels = cats.flatMap(c => c.channels);
      if (allChannels.some(c => c.id === slug || c.name === name)) {
        showToast('Bu isimde bir kanal zaten var');
        return;
      }
      ds.addChannelToCategory(server.id, targetCat.id, name);
      inputNewChannel.value = '';
      renderChannels();
      showToast('Kanal eklendi: #' + slug);
    });
  }

  // Kanal Düzenleme Modal İşlemleri
  if (btnEditChannelCancel) {
    btnEditChannelCancel.addEventListener('click', () => {
      if (editChannelOverlay) editChannelOverlay.classList.remove('active');
      editingChannelId = null;
    });
  }

  if (btnEditChannelSave) {
    btnEditChannelSave.addEventListener('click', () => {
      if (!editingChannelId || !editChannelInput) return;
      const newName = editChannelInput.value.trim();
      if (!newName) {
        showToast('Kanal adı boş olamaz');
        return;
      }
      // Kategori yapısında kanalı bul ve güncelle
      let found = false;
      for (const cat of (server.categories || [])) {
        const ch = cat.channels.find(c => c.id === editingChannelId);
        if (ch) {
          ch.name = newName;
          found = true;
          break;
        }
      }
      if (found) {
        ds.saveServers();
        renderChannels();
        showToast('Kanal güncellendi');
      }
      if (editChannelOverlay) editChannelOverlay.classList.remove('active');
      editingChannelId = null;
    });
  }

  // Üyeleri Listele ve Yönet
  function renderMembers() {
    const listContainer = document.getElementById('ss-members-list');
    const memberCountLabel = document.getElementById('ss-member-count-label');
    if (!listContainer) return;

    // Canlı üye listesini al
    let members = server.inviteCode ? ds.getServerMembers(server.inviteCode) : [];

    const currentOwnerHandle = server.ownerHandle || ds.currentUser.handle;
    const isOwnerMe = currentOwnerHandle === ds.currentUser.handle;

    if (members.length === 0) {
      const cu = ds.currentUser;
      members = [{
        handle: currentOwnerHandle,
        name: isOwnerMe ? cu.name : currentOwnerHandle.replace('@', ''),
        avatar: isOwnerMe ? cu.avatar : window.DEFAULT_AVATAR
      }];
    }

    if (memberCountLabel) {
      memberCountLabel.textContent = `Üye Listesi (${members.length})`;
    }

    const allRoles = ds.getServerRoles(server.id);

    const canKickMembers = isOwnerMe || canManageServer || (ds.checkServerPermission && ds.checkServerPermission(server.id, currentHandle, 'kick_ban_members'));

    listContainer.innerHTML = members.map(m => {
      const isOwner = m.handle === currentOwnerHandle;
      const isSelf = m.handle === ds.currentUser.handle;
      const profile = ds.getUserProfile(m.handle);
      const name = profile.name || m.name || m.handle;
      let avatar = profile.avatar || m.avatar || window.DEFAULT_AVATAR;
      if (avatar && avatar.startsWith('/uploads/')) avatar = 'http://localhost:3000' + avatar;
      const memberRoles = ds.getServerRoles ? ds.getMemberRoles(server.id, m.handle) : [];
      const highestRole = ds.getMemberHighestRole ? ds.getMemberHighestRole(server.id, m.handle) : null;
      const nameColorStyle = highestRole ? `style="color:${highestRole.color}; font-weight:700;"` : '';

      return `
        <div class="ss-member-row">
          <img class="ss-member-avatar" src="${avatar}" alt="${escapeHtml(name)}" onerror="this.onerror=null;this.src=window.DEFAULT_AVATAR;">
          <div class="ss-member-info">
            <span class="ss-member-name" ${nameColorStyle}>${escapeHtml(name)}${isSelf ? ' (Sen)' : ''}</span>
            <span class="ss-member-handle">${escapeHtml(m.handle)}</span>
            <div class="ss-member-roles-row">
              ${memberRoles.map(r => `
                <span class="ss-member-role-badge" style="border-color:${r.color}; color:${r.color};">
                  <span class="ss-role-color-dot" style="background:${r.color}; width:8px; height:8px;"></span>
                  ${escapeHtml(r.name)}
                  ${canManageRoles ? `<span class="ss-remove-role-btn" data-handle="${escapeHtml(m.handle)}" data-role-id="${r.id}" title="Rolü kaldır">&times;</span>` : ''}
                </span>
              `).join('')}
              ${canManageRoles ? `<button class="ss-add-member-role-btn btn-add-role-to-member" data-handle="${escapeHtml(m.handle)}" title="Rol Ata">+</button>` : ''}
            </div>
          </div>
          ${isOwner ? '<span class="ss-member-badge owner">Sahip</span>' : ''}
          ${(!isOwner && (isOwnerMe || canKickMembers)) ? `
            <div style="display:flex; gap:6px;">
              ${isOwnerMe ? `<button class="ss-member-kick btn-ss-transfer" data-handle="${escapeHtml(m.handle)}" data-name="${escapeHtml(name)}" style="color:var(--accent-emerald); border-color:rgba(16, 185, 129, 0.3);">Sahipliği Devret</button>` : ''}
              ${canKickMembers ? `<button class="ss-member-kick btn-ss-kick" data-handle="${escapeHtml(m.handle)}">Sunucudan Çıkar</button>` : ''}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    // Rol Silme (Badge üzerindeki X butonu)
    listContainer.querySelectorAll('.ss-remove-role-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const handle = btn.dataset.handle;
        const roleId = btn.dataset.roleId;
        ds.removeMemberRole(server.id, handle, roleId);
        renderMembers();
        showToast('Rol üyenin üzerinden kaldırıldı');
      });
    });

    // Rol Atama Dropdown Menüsü (+)
    listContainer.querySelectorAll('.btn-add-role-to-member').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const handle = btn.dataset.handle;
        const existingDropdown = document.querySelector('.member-role-dropdown');
        if (existingDropdown) existingDropdown.remove();

        const roles = ds.getServerRoles(server.id);
        if (roles.length === 0) {
          showToast('Önce "Roller" sekmesinden bir rol oluşturmalısınız');
          return;
        }

        const memberRoles = ds.getMemberRoles(server.id, handle);
        const memberRoleIds = memberRoles.map(r => r.id);

        const dd = document.createElement('div');
        dd.className = 'member-role-dropdown';
        dd.innerHTML = roles.map(r => {
          const hasRole = memberRoleIds.includes(r.id);
          return `
            <button class="mrd-item ${hasRole ? 'has-role' : ''}" data-role-id="${r.id}">
              <span class="ss-role-color-dot" style="background:${r.color};"></span>
              <span style="flex:1;">${escapeHtml(r.name)}</span>
              ${hasRole ? '<i data-lucide="check" style="width:13px;height:13px;"></i>' : ''}
            </button>
          `;
        }).join('');

        const rect = btn.getBoundingClientRect();
        dd.style.top = (rect.bottom + 4) + 'px';
        dd.style.left = rect.left + 'px';
        document.body.appendChild(dd);
        if (typeof lucide !== 'undefined') lucide.createIcons();

        dd.querySelectorAll('.mrd-item').forEach(item => {
          item.addEventListener('click', (ev) => {
            ev.stopPropagation();
            const rId = item.dataset.roleId;
            if (memberRoleIds.includes(rId)) {
              ds.removeMemberRole(server.id, handle, rId);
              showToast('Rol kaldırıldı');
            } else {
              ds.assignMemberRole(server.id, handle, rId);
              showToast('Rol atandı');
            }
            dd.remove();
            renderMembers();
          });
        });

        setTimeout(() => {
          document.addEventListener('click', function closeDD(ev) {
            if (!dd.contains(ev.target)) {
              dd.remove();
              document.removeEventListener('click', closeDD);
            }
          });
        }, 50);
      });
    });

    // Üye çıkarma işlemi
    listContainer.querySelectorAll('.btn-ss-kick').forEach(btn => {
      btn.addEventListener('click', () => {
        const handle = btn.dataset.handle;
        if (server.inviteCode) {
          const inviteRegistry = ds._loadInviteRegistry();
          if (inviteRegistry[server.inviteCode] && inviteRegistry[server.inviteCode].members) {
            inviteRegistry[server.inviteCode].members = inviteRegistry[server.inviteCode].members.filter(mem => mem.handle !== handle);
            ziorseSetStorage('ziorse_invite_registry', inviteRegistry);
          }
        }
        if (server.memberCount > 1) server.memberCount--;
        ds.saveServers();
        renderMembers();
        showToast('Üye çıkarıldı');
      });
    });

    // Sahipliği Devretme işlemi
    listContainer.querySelectorAll('.btn-ss-transfer').forEach(btn => {
      btn.addEventListener('click', () => {
        const handle = btn.dataset.handle;
        const name = btn.dataset.name;
        server.ownerHandle = handle;
        ds.saveServers();

        // Registry güncelle
        if (server.inviteCode) {
          const registry = ds._loadInviteRegistry();
          if (registry[server.inviteCode]) {
            registry[server.inviteCode].ownerHandle = handle;
            registry[server.inviteCode].ownerName = name;
            ziorseSetStorage('ziorse_invite_registry', registry);
          }
        }
        renderMembers();
        renderDangerZone();
        showToast('Sunucu sahipliği ' + name + ' kullanıcısına devredildi');
      });
    });
  }

  // ── ROLLER & İZİNLER YÖNETİMİ ─────────────────────────────────
  const ROLE_PERMS = [
    { key: 'send_messages', title: 'Mesaj Gönderme', desc: 'Üyeler metin kanallarına mesaj yazabilir ve yanıt verebilir.' },
    { key: 'connect_voice', title: 'Sese Katılma', desc: 'Üyeler ses kanallarına bağlanabilir ve diğerlerini dinleyebilir.' },
    { key: 'speak_voice', title: 'Sesli Konuşma', desc: 'Üyeler ses kanallarında mikrofonunu kullanarak konuşabilir.' },
    { key: 'manage_channels', title: 'Kanalları Yönet', desc: 'Kanal ve kategori oluşturabilir, silebilir ve düzenleyebilir.' },
    { key: 'kick_ban_members', title: 'Üyeleri At ve Engelle', desc: 'Sunucudan istenmeyen üyeleri çıkarabilir ve yasaklayabilir.' },
    { key: 'manage_server', title: 'Sunucuyu Yönet', desc: 'Sunucu adını, ikonunu, bannerını ve ayarlarını düzenleyebilir.' },
    { key: 'manage_roles', title: 'Rolleri Yönet', desc: 'Yeni roller oluşturabilir, hiyerarşiyi düzenleyebilir ve üyelere rol atayabilir.' }
  ];

  const PRESET_COLORS = [
    '#dbdbdb', '#8b5cf6', '#a855f7', '#ec4899', '#ef4444',
    '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4',
    '#3b82f6', '#9ca3af'
  ];

  let selectedRoleId = null;

  function renderRoles() {
    const rolesListEl = document.getElementById('ss-roles-list');
    const rolesCountEl = document.getElementById('ss-roles-count');
    if (!rolesListEl) return;

    const roles = ds.getServerRoles(server.id);
    if (rolesCountEl) rolesCountEl.textContent = roles.length;

    if (roles.length === 0) {
      rolesListEl.innerHTML = `<div style="font-size:0.78rem; color:var(--text-muted); padding:10px 4px; text-align:center;">Henüz rol oluşturulmadı.</div>`;
      showRoleEditor(null);
      return;
    }

    rolesListEl.innerHTML = roles.map((r, index) => {
      const isActive = r.id === selectedRoleId;
      const isFirst = index === 0;
      const isLast = index === roles.length - 1;

      return `
        <div class="ss-role-item ${isActive ? 'active' : ''}" data-role-id="${r.id}">
          ${r.icon ? `<img src="${r.icon}" style="width:16px;height:16px;object-fit:cover;border-radius:4px;flex-shrink:0;">` : `<span class="ss-role-color-dot" style="background:${r.color};"></span>`}
          <span class="ss-role-item-name">${escapeHtml(r.name)}</span>
          <div class="ss-role-item-actions">
            <button class="ss-role-btn-arrow btn-role-up" data-role-id="${r.id}" ${isFirst ? 'disabled' : ''} title="Yukarı Taşı (Daha Yüksek Öncelik)">
              <i data-lucide="chevron-up" style="width:14px;height:14px;"></i>
            </button>
            <button class="ss-role-btn-arrow btn-role-down" data-role-id="${r.id}" ${isLast ? 'disabled' : ''} title="Aşağı Taşı (Daha Düşük Öncelik)">
              <i data-lucide="chevron-down" style="width:14px;height:14px;"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Rol Seçme
    rolesListEl.querySelectorAll('.ss-role-item').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('.ss-role-btn-arrow')) return;
        selectRole(el.dataset.roleId);
      });
    });

    // Hiyerarşi Yukarı Taşı
    rolesListEl.querySelectorAll('.btn-role-up').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const roleId = btn.dataset.roleId;
        const curIdx = roles.findIndex(r => r.id === roleId);
        if (curIdx > 0) {
          const newRoles = [...roles];
          const temp = newRoles[curIdx];
          newRoles[curIdx] = newRoles[curIdx - 1];
          newRoles[curIdx - 1] = temp;
          ds.reorderServerRoles(server.id, newRoles.map(r => r.id));
          renderRoles();
          showToast('Rol hiyerarşisi güncellendi');
        }
      });
    });

    // Hiyerarşi Aşağı Taşı
    rolesListEl.querySelectorAll('.btn-role-down').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const roleId = btn.dataset.roleId;
        const curIdx = roles.findIndex(r => r.id === roleId);
        if (curIdx < roles.length - 1) {
          const newRoles = [...roles];
          const temp = newRoles[curIdx];
          newRoles[curIdx] = newRoles[curIdx + 1];
          newRoles[curIdx + 1] = temp;
          ds.reorderServerRoles(server.id, newRoles.map(r => r.id));
          renderRoles();
          showToast('Rol hiyerarşisi güncellendi');
        }
      });
    });

    // Eğer seçili rol yoksa veya silinmişse ilk rolü seç
    if (!selectedRoleId || !roles.some(r => r.id === selectedRoleId)) {
      selectRole(roles[0].id);
    } else {
      showRoleEditor(roles.find(r => r.id === selectedRoleId));
    }
  }

  let currentRoleOriginal = null;
  let currentRoleDraft = null;

  function selectRole(roleId) {
    selectedRoleId = roleId;
    const roles = ds.getServerRoles(server.id);
    const role = roles.find(r => r.id === roleId);

    if (role) {
      currentRoleOriginal = JSON.parse(JSON.stringify(role));
      currentRoleDraft = JSON.parse(JSON.stringify(role));
    } else {
      currentRoleOriginal = null;
      currentRoleDraft = null;
    }

    document.querySelectorAll('.ss-role-item').forEach(el => {
      el.classList.toggle('active', el.dataset.roleId === roleId);
    });

    showRoleEditor(currentRoleDraft);
    checkChanges();
  }

  function showRoleEditor(role) {
    const editorEl = document.getElementById('ss-role-editor');
    const emptyEl = document.getElementById('ss-role-editor-empty');
    if (!editorEl || !emptyEl) return;

    if (!role) {
      editorEl.style.display = 'none';
      emptyEl.style.display = 'flex';
      return;
    }

    editorEl.style.display = 'flex';
    emptyEl.style.display = 'none';

    // Populate Fields
    const titleEl = document.getElementById('ss-role-editor-title');
    const badgeEl = document.getElementById('ss-role-preview-badge');
    const nameInput = document.getElementById('ss-role-name-input');
    const colorPicker = document.getElementById('ss-role-color-picker');
    const colorHex = document.getElementById('ss-role-color-hex');
    const hoistCheckbox = document.getElementById('ss-role-hoist');
    const swatchesContainer = document.getElementById('ss-color-swatches');
    const permsGrid = document.getElementById('ss-perms-grid');

    if (titleEl) titleEl.textContent = role.name && role.name.trim() ? role.name : 'Rol Düzenle';
    if (badgeEl) badgeEl.style.backgroundColor = role.color || '#dbdbdb';
    if (nameInput) nameInput.value = role.name !== undefined ? role.name : '';
    if (colorPicker) colorPicker.value = role.color || '#dbdbdb';
    if (colorHex) colorHex.value = (role.color || '#dbdbdb').toUpperCase();
    if (hoistCheckbox) hoistCheckbox.checked = role.hoist !== undefined ? role.hoist : true;

    // Role Icon Preview
    const iconPreview = document.getElementById('ss-role-icon-preview');
    const btnRemoveIcon = document.getElementById('btn-ss-role-remove-icon');
    if (iconPreview) {
      if (role.icon) {
        iconPreview.innerHTML = `<img src="${role.icon}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`;
        if (btnRemoveIcon) btnRemoveIcon.style.display = 'inline-flex';
      } else {
        iconPreview.innerHTML = `<i data-lucide="image" style="width:20px;height:20px;color:var(--text-muted);"></i>`;
        if (btnRemoveIcon) btnRemoveIcon.style.display = 'none';
      }
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    // Color Swatches
    if (swatchesContainer) {
      swatchesContainer.innerHTML = PRESET_COLORS.map(c => `
        <div class="ss-color-swatch ${(role.color || '').toLowerCase() === c.toLowerCase() ? 'active' : ''}"
          style="background-color:${c};" data-color="${c}"></div>
      `).join('');

      swatchesContainer.querySelectorAll('.ss-color-swatch').forEach(swatch => {
        swatch.addEventListener('click', () => {
          const col = swatch.dataset.color;
          updateRoleColor(col);
        });
      });
    }

    // Permissions List (Kanal izinlerindeki tri-switch / deny & allow buton tasarımı)
    if (permsGrid) {
      const perms = role.permissions || {};
      permsGrid.innerHTML = ROLE_PERMS.map(p => {
        const isGranted = Boolean(perms[p.key]);
        return `
          <div class="perm-row">
            <div class="perm-info">
              <span class="perm-name">${escapeHtml(p.title)}</span>
              <span class="perm-desc">${escapeHtml(p.desc)}</span>
            </div>
            <div class="perm-tri-switch">
              <button type="button" class="perm-switch-btn btn-deny ${!isGranted ? 'active' : ''}" data-perm-key="${p.key}" data-val="deny" title="Yasakla / Kapalı">
                <i data-lucide="x" style="width:14px;height:14px;"></i>
              </button>
              <button type="button" class="perm-switch-btn btn-allow ${isGranted ? 'active' : ''}" data-perm-key="${p.key}" data-val="allow" title="İzin Ver / Açık">
                <i data-lucide="check" style="width:14px;height:14px;"></i>
              </button>
            </div>
          </div>
        `;
      }).join('');

      if (typeof lucide !== 'undefined') lucide.createIcons();

      permsGrid.querySelectorAll('.perm-switch-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (!currentRoleDraft) return;
          const key = btn.dataset.permKey;
          const val = btn.dataset.val;
          if (!currentRoleDraft.permissions) currentRoleDraft.permissions = {};
          currentRoleDraft.permissions[key] = (val === 'allow');

          const parentSwitch = btn.closest('.perm-tri-switch');
          if (parentSwitch) {
            parentSwitch.querySelectorAll('.perm-switch-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
          }

          checkChanges();
        });
      });
    }
  }

  function updateRoleColor(color) {
    if (!currentRoleDraft) return;
    currentRoleDraft.color = color;

    const badgeEl = document.getElementById('ss-role-preview-badge');
    const colorPicker = document.getElementById('ss-role-color-picker');
    const colorHex = document.getElementById('ss-role-color-hex');
    if (badgeEl) badgeEl.style.backgroundColor = color;
    if (colorPicker) colorPicker.value = color;
    if (colorHex) colorHex.value = color.toUpperCase();

    document.querySelectorAll('.ss-color-swatch').forEach(sw => {
      sw.classList.toggle('active', sw.dataset.color.toLowerCase() === color.toLowerCase());
    });

    checkChanges();
  }

  // Rol Adı Değişimi
  const ssRoleNameInput = document.getElementById('ss-role-name-input');
  if (ssRoleNameInput) {
    ssRoleNameInput.addEventListener('input', () => {
      if (!currentRoleDraft) return;
      currentRoleDraft.name = ssRoleNameInput.value;

      const titleEl = document.getElementById('ss-role-editor-title');
      if (titleEl) {
        titleEl.textContent = currentRoleDraft.name && currentRoleDraft.name.trim() ? currentRoleDraft.name : 'Rol Düzenle';
      }

      checkChanges();
    });
  }

  // Renk Seçiciler
  const ssRoleColorPicker = document.getElementById('ss-role-color-picker');
  const ssRoleColorHex = document.getElementById('ss-role-color-hex');
  if (ssRoleColorPicker) {
    ssRoleColorPicker.addEventListener('input', (e) => {
      updateRoleColor(e.target.value);
    });
  }
  if (ssRoleColorHex) {
    ssRoleColorHex.addEventListener('change', (e) => {
      let val = e.target.value.trim();
      if (!val.startsWith('#')) val = '#' + val;
      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
        updateRoleColor(val);
      }
    });
  }

  // Rol Hoist Değişimi
  const ssRoleHoist = document.getElementById('ss-role-hoist');
  if (ssRoleHoist) {
    ssRoleHoist.addEventListener('change', () => {
      if (!currentRoleDraft) return;
      currentRoleDraft.hoist = ssRoleHoist.checked;
      checkChanges();
    });
  }

  // Rol Simgesi / Görseli Seçme & Kaldırma
  const btnPickRoleIcon = document.getElementById('btn-ss-role-pick-icon');
  const ssRoleIconPreview = document.getElementById('ss-role-icon-preview');
  const ssRoleIconFile = document.getElementById('ss-role-icon-file');
  const btnRemoveRoleIcon = document.getElementById('btn-ss-role-remove-icon');

  if (ssRoleIconPreview && ssRoleIconFile) {
    ssRoleIconPreview.addEventListener('click', () => ssRoleIconFile.click());
  }

  if (btnPickRoleIcon && ssRoleIconFile) {
    btnPickRoleIcon.addEventListener('click', () => ssRoleIconFile.click());
    ssRoleIconFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file || !currentRoleDraft) return;

      if (window.openImageCropper) {
        window.openImageCropper({
          file: file,
          shape: 'circle',
          title: 'Rol İkonunu Ayarla',
          onCrop: (croppedDataUrl) => {
            currentRoleDraft.icon = croppedDataUrl;
            const iconPreview = document.getElementById('ss-role-icon-preview');
            if (iconPreview) {
              iconPreview.innerHTML = `<img src="${croppedDataUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`;
            }
            if (btnRemoveRoleIcon) btnRemoveRoleIcon.style.display = 'inline-flex';
            checkChanges();
          }
        });
      } else {
        const reader = new FileReader();
        reader.onload = (ev) => {
          currentRoleDraft.icon = ev.target.result;
          const iconPreview = document.getElementById('ss-role-icon-preview');
          if (iconPreview) {
            iconPreview.innerHTML = `<img src="${ev.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`;
          }
          if (btnRemoveRoleIcon) btnRemoveRoleIcon.style.display = 'inline-flex';
          checkChanges();
        };
        reader.readAsDataURL(file);
      }
      ssRoleIconFile.value = '';
    });
  }

  if (btnRemoveRoleIcon) {
    btnRemoveRoleIcon.addEventListener('click', () => {
      if (!currentRoleDraft) return;
      currentRoleDraft.icon = '';
      const iconPreview = document.getElementById('ss-role-icon-preview');
      if (iconPreview) {
        iconPreview.innerHTML = `<i data-lucide="image" style="width:20px;height:20px;color:var(--text-muted);"></i>`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
      btnRemoveRoleIcon.style.display = 'none';
      checkChanges();
    });
  }

  // Rol Oluştur Butonu
  const btnCreateRole = document.getElementById('btn-ss-create-role');
  if (btnCreateRole) {
    btnCreateRole.style.display = canManageRoles ? 'inline-flex' : 'none';
    btnCreateRole.addEventListener('click', () => {
      if (!canManageRoles) {
        showToast('Rol oluşturma yetkiniz bulunmuyor');
        return;
      }
      const newRole = ds.saveServerRole(server.id, {
        name: 'Yeni Rol',
        color: PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)],
        hoist: true,
        permissions: {
          send_messages: true,
          connect_voice: true,
          speak_voice: true,
          manage_channels: false,
          kick_ban_members: false,
          manage_server: false,
          manage_roles: false
        }
      });
      renderRoles();
      if (newRole) selectRole(newRole.id);
      showToast('Yeni rol oluşturuldu');
    });
  }

  // Rol Sil Butonu
  const btnDeleteRole = document.getElementById('btn-ss-delete-role');
  if (btnDeleteRole) {
    btnDeleteRole.addEventListener('click', () => {
      if (!canManageRoles) {
        showToast('Rol silme yetkiniz bulunmuyor');
        return;
      }
      if (!selectedRoleId) return;
      ds.deleteServerRole(server.id, selectedRoleId);
      selectedRoleId = null;
      renderRoles();
      renderMembers();
      showToast('Rol silindi');
    });
  }

  // Davet Bağlantısı
  function renderInvite() {
    const inviteUrlEl = document.getElementById('ss-invite-url');
    if (!inviteUrlEl) return;

    if (!server.inviteCode) {
      ds.generateInvite(server.id);
    }

    inviteUrlEl.textContent = 'ziorse/' + server.inviteCode;
  }

  const btnCopyInvite = document.getElementById('btn-ss-copy-invite');
  if (btnCopyInvite) {
    btnCopyInvite.addEventListener('click', () => {
      const inviteUrl = 'ziorse/' + server.inviteCode;
      navigator.clipboard.writeText(inviteUrl).then(() => {
        showToast('Davet bağlantısı kopyalandı');
      }).catch(() => {
        showToast('Kopyalandı: ' + inviteUrl);
      });
    });
  }

  const btnRegenInvite = document.getElementById('btn-ss-regen-invite');
  if (btnRegenInvite) {
    btnRegenInvite.addEventListener('click', () => {
      server.inviteCode = null;
      ds.generateInvite(server.id);
      renderInvite();
      showToast('Yeni davet bağlantısı oluşturuldu');
    });
  }

  // Tehlike Bölgesi Görünümü (Sahip / Üye Ayrımı)
  function renderDangerZone() {
    const currentOwnerHandle = server.ownerHandle || ds.currentUser.handle;
    const isOwnerMe = currentOwnerHandle === ds.currentUser.handle;
    const dangerTitle = document.querySelector('#section-tehlike .ss-danger-text h4');
    const dangerText = document.querySelector('#section-tehlike .ss-danger-text p');

    if (isOwnerMe) {
      if (dangerTitle) dangerTitle.textContent = 'Sunucuyu Sil';
      if (dangerText) dangerText.textContent = 'Bu işlem geri alınamaz. Sunucudaki tüm kanallar ve mesajlar kalıcı olarak silinir.';
      if (btnDeleteServer) btnDeleteServer.innerHTML = `<i data-lucide="trash-2" style="width:14px;height:14px;"></i> Sunucuyu Sil`;
      if (confirmTitle) confirmTitle.textContent = 'Sunucuyu Sil';
      if (confirmText) confirmText.textContent = 'Bu işlem geri alınamaz. Onaylamak için aşağıya sunucu adını yazın:';
    } else {
      if (dangerTitle) dangerTitle.textContent = 'Sunucudan Ayrıl';
      if (dangerText) dangerText.textContent = 'Bu sunucudan ayrılmak üzeresiniz. Sunucu listenizden kaldırılacaktır.';
      if (btnDeleteServer) btnDeleteServer.innerHTML = `<i data-lucide="log-out" style="width:14px;height:14px;"></i> Sunucudan Ayrıl`;
      if (confirmTitle) confirmTitle.textContent = 'Sunucudan Ayrıl';
      if (confirmText) confirmText.textContent = 'Sunucudan ayrılmayı onaylamak için aşağıya sunucu adını yazın:';
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  // Sunucu Silme veya Sunucudan Ayrılma Modal İşlemleri
  if (btnDeleteServer) {
    btnDeleteServer.addEventListener('click', () => {
      if (confirmNameHint) confirmNameHint.textContent = server.name;
      if (confirmInput) confirmInput.value = '';
      if (btnConfirmDelete) btnConfirmDelete.disabled = true;
      if (confirmOverlay) confirmOverlay.classList.add('active');
    });
  }

  if (confirmInput) {
    confirmInput.addEventListener('input', () => {
      btnConfirmDelete.disabled = confirmInput.value.trim() !== server.name;
    });
  }

  if (btnConfirmCancel) {
    btnConfirmCancel.addEventListener('click', () => {
      if (confirmOverlay) confirmOverlay.classList.remove('active');
    });
  }

  if (btnConfirmDelete) {
    btnConfirmDelete.addEventListener('click', () => {
      const isOwnerMe = (server.ownerHandle || ds.currentUser.handle) === ds.currentUser.handle;
      if (isOwnerMe) {
        ds.servers = ds.servers.filter(s => s.id !== server.id);
        ds.saveServers();
        showToast('Sunucu silindi');
      } else {
        // Üye ayrılıyor
        ds.servers = ds.servers.filter(s => s.id !== server.id);
        ds.saveServers();
        if (server.inviteCode) {
          const inviteRegistry = ds._loadInviteRegistry();
          if (inviteRegistry[server.inviteCode] && inviteRegistry[server.inviteCode].members) {
            inviteRegistry[server.inviteCode].members = inviteRegistry[server.inviteCode].members.filter(m => m.handle !== ds.currentUser.handle);
            ziorseSetStorage('ziorse_invite_registry', inviteRegistry);
          }
        }
        showToast('Sunucudan ayrıldınız');
      }
      setTimeout(() => {
        if (window.parent && window.parent !== window && typeof window.parent.closeModalView === 'function') {
          window.parent.closeModalView({ type: 'server-deleted', serverId: server.id });
        } else {
          window.location.href = 'index.html';
        }
      }, 500);
    });
  }

  // Kapat / Geri Dön (Bulunulan Sunucu ve Kanala)
  function goBack() {
    const isStillExists = ds.servers.some(s => s.id === server.id);
    if (window.parent && window.parent !== window && typeof window.parent.closeModalView === 'function') {
      window.parent.closeModalView({
        type: 'server-updated',
        serverId: server.id,
        stillExists: isStillExists
      });
    } else {
      if (isStillExists) {
        window.location.href = `index.html?server=${encodeURIComponent(server.id)}&channel=${encodeURIComponent(channelId)}`;
      } else {
        window.location.href = 'index.html';
      }
    }
  }

  if (btnClose) {
    btnClose.addEventListener('click', goBack);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (editChannelOverlay && editChannelOverlay.classList.contains('active')) {
        editChannelOverlay.classList.remove('active');
        editingChannelId = null;
      } else if (confirmOverlay && confirmOverlay.classList.contains('active')) {
        confirmOverlay.classList.remove('active');
      } else {
        goBack();
      }
    }
  });

  // Toast gösterme
  function showToast(msg) {
    if (!ssToast) return;
    ssToast.textContent = msg;
    ssToast.classList.add('show');
    setTimeout(() => {
      ssToast.classList.remove('show');
    }, 2500);
  }



  // Başlangıçta yükle
  loadServerDetails();
});

