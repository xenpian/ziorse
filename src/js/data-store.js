/**
 * Ziorse Desktop Social Network - Enhanced Store Engine v14
 * Features: editPost, togglePin, blockUser, setStatus, notifications
 */

window.DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%232b2d31'/%3E%3Ccircle cx='50' cy='38' r='18' fill='%2380848e'/%3E%3Cpath d='M22 84c0-15.5 12.5-28 28-28s28 12.5 28 28z' fill='%2380848e'/%3E%3C/svg%3E";
const DEFAULT_AVATAR = window.DEFAULT_AVATAR;

const _ziorseMemCache = new Map();
const _ziorseParsedCache = new Map(); // Parsed objects to avoid re-JSON.parse
let _memCacheLoaded = false;

// Keys that store large JSON arrays - we keep parsed versions to avoid re-parse costs
const _LARGE_JSON_KEYS = new Set([
  'ziorse_real_posts_v14',
  'ziorse_invite_registry',
  'ziorse_real_dms_v14',
]);

function _initMemCacheOnce() {
  if (_memCacheLoaded) return;
  _memCacheLoaded = true;
  if (window.electronAPI?.storeGetAllSync) {
    try {
      const all = window.electronAPI.storeGetAllSync();
      if (all && typeof all === 'object') {
        for (const [k, v] of Object.entries(all)) {
          if (typeof v === 'object' && v !== null) {
            // Store both stringified (for compat) and parsed
            _ziorseMemCache.set(k, JSON.stringify(v));
            _ziorseParsedCache.set(k, v);
          } else {
            _ziorseMemCache.set(k, typeof v === 'string' ? v : JSON.stringify(v));
          }
        }
      }
    } catch (e) { }
  }
}

function ziorseGetStorage(key) {
  _initMemCacheOnce();
  if (_ziorseMemCache.has(key)) {
    return _ziorseMemCache.get(key);
  }
  if (window.electronAPI?.storeGetSync) {
    try {
      const val = window.electronAPI.storeGetSync(key);
      if (val !== null && val !== undefined) {
        const str = typeof val === 'string' ? val : JSON.stringify(val);
        _ziorseMemCache.set(key, str);
        if (typeof val === 'object' && val !== null) {
          _ziorseParsedCache.set(key, val);
        }
        return str;
      }
    } catch (e) { }
  }
  try {
    const val = localStorage.getItem(key);
    _ziorseMemCache.set(key, val);
    return val;
  } catch (e) {
    return null;
  }
}

// Fast path: returns already-parsed object without JSON.parse if available
function ziorseGetStorageParsed(key) {
  _initMemCacheOnce();
  if (_ziorseParsedCache.has(key)) {
    return _ziorseParsedCache.get(key);
  }
  const raw = ziorseGetStorage(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    _ziorseParsedCache.set(key, parsed);
    return parsed;
  } catch (e) {
    return null;
  }
}

function ziorseRemoveStorage(key) {
  _memCacheLoaded = true;
  _ziorseMemCache.delete(key);
  _ziorseParsedCache.delete(key);
  try { localStorage.removeItem(key); } catch (e) { }
  if (window.electronAPI?.storeSetSync) {
    try { window.electronAPI.storeSetSync(key, null); } catch (e) { }
  } else if (window.electronAPI?.storeSet) {
    window.electronAPI.storeSet(key, null).catch(() => { });
  }
  if (window.parent && window.parent !== window) {
    try {
      if (typeof window.parent.ziorseRemoveStorage === 'function') {
        window.parent.ziorseRemoveStorage(key);
      }
    } catch (e) { }
  }
}

function ziorseSetStorage(key, val) {
  if (val === null || val === undefined) {
    return ziorseRemoveStorage(key);
  }
  const isObj = typeof val === 'object' && val !== null;
  const strVal = isObj ? JSON.stringify(val) : String(val);
  _ziorseMemCache.set(key, strVal);
  if (isObj) {
    _ziorseParsedCache.set(key, val); // Update parsed cache too
  } else {
    _ziorseParsedCache.delete(key);
  }
  try { localStorage.setItem(key, strVal); } catch (e) { }
  if (window.electronAPI?.storeSetSync) {
    try { window.electronAPI.storeSetSync(key, isObj ? val : strVal); } catch (e) { }
  } else if (window.electronAPI?.storeSet) {
    window.electronAPI.storeSet(key, isObj ? val : strVal).catch(() => { });
  }

  // Cross-frame sync: If inside an iframe/modal, sync directly to parent window's in-memory store
  if (window.parent && window.parent !== window) {
    try {
      if (typeof window.parent.ziorseSetStorage === 'function') {
        // Prevent infinite bounce by checking if value already matches
        const parentMem = window.parent._ziorseMemCache;
        if (!parentMem || parentMem.get(key) !== strVal) {
          window.parent.ziorseSetStorage(key, isObj ? JSON.parse(strVal) : val);
        }
      }
    } catch (e) { }
  }
}

// Storage event listener for cross-window / cross-process cache invalidation
try {
  window.addEventListener('storage', (e) => {
    if (e.key) {
      _ziorseMemCache.delete(e.key);
      _ziorseParsedCache.delete(e.key);
      if (window.dataStore && e.key === window.dataStore.storageKeyUser) {
        window.dataStore.currentUser = window.dataStore.loadUser();
        if (typeof window.syncUserDisplay === 'function') {
          window.syncUserDisplay();
        }
      }
    }
  });
} catch (e) { }

window._ziorseMemCache = _ziorseMemCache;
window._ziorseParsedCache = _ziorseParsedCache;
window.ziorseGetStorage = ziorseGetStorage;
window.ziorseGetStorageParsed = ziorseGetStorageParsed;
window.ziorseSetStorage = ziorseSetStorage;
window.ziorseRemoveStorage = ziorseRemoveStorage;

class DataStore {
  constructor() {
    this.storageKeyPosts = 'ziorse_real_posts_v14';
    this.storageKeyUser = 'ziorse_real_user_v14';
    this.storageKeyFollowed = 'ziorse_real_followed_v14';
    this.storageKeyDMs = 'ziorse_real_dms_v14';
    this.storageKeyVoice = 'ziorse_real_voice_v14';
    this.storageKeyTheme = 'ziorse_theme_v14';

    this.currentUser = this.loadUser();
    // Mevcut kullaniciyi global dizine kaydet
    if (this.currentUser && this.currentUser.loggedIn) {
      this._saveToGlobalDirectory(this.currentUser);
    }

    // Kullaniciya ozel key'ler
    const h = (this.currentUser && this.currentUser.handle) ? this.currentUser.handle : 'guest';
    this.storageKeyServers = 'ziorse_real_servers_v14_' + h;
    this.storageKeyFriends = 'ziorse_friends_v2_' + h;
    this.storageKeyFriendRequests = 'ziorse_friend_requests_v2_' + h;
    this.storageKeyBlocked = 'ziorse_blocked_v1_' + h;
    this.storageKeyNotifications = 'ziorse_notifications_v1_' + h;
    this.storageKeyStatus = 'ziorse_status_v1_' + h;

    this.posts = this.loadPosts();
    this.followedHandles = this.loadFollowed();
    this.dmThreads = this.loadDMs();
    this.voiceChannels = this.loadVoiceChannels();
    this.servers = this.loadServers();
    this.friends = this.loadFriends();
    this.friendRequests = this.loadFriendRequests();
    this.blockedList = this.loadBlocked();
    this.notifications = this.loadNotifications();
    this.userStatus = this.loadStatus();

    this.activeServerId = 'home';
    this.activeChannelId = 'genel';
    this.theme = ziorseGetStorage(this.storageKeyTheme) || 'light';

    this.activeFilter = 'for-you';
    this.listeners = [];
    this.userDirectory = {};
    this.onlineUsers = [];

    // Feed pagination state
    this.feedPage = 0;
    this.feedPageSize = 25;
  }

  loadUser() {
    const saved = ziorseGetStorage(this.storageKeyUser);
    if (saved) {
      try {
        const u = typeof saved === 'string' ? JSON.parse(saved) : saved;
        if (u && u.loggedIn === true && u.handle) {
          if (u.avatar && u.avatar.startsWith('/uploads/')) {
            u.avatar = 'http://localhost:3000' + u.avatar;
          }
          if (u.banner && u.banner.startsWith('/uploads/')) {
            u.banner = 'http://localhost:3000' + u.banner;
          }
          if (!u.avatar || u.avatar.includes('photo-1535713875002-d1d0cf377fde')) {
            u.avatar = DEFAULT_AVATAR;
          }
          return u;
        }
      } catch (e) { }
    }
    return null;
  }

  saveUser(userData, isHandleRename = false) {
    const oldHandle = this.currentUser ? this.currentUser.handle : null;
    let formattedHandle = userData.handle || (this.currentUser ? this.currentUser.handle : '');
    if (formattedHandle && !formattedHandle.startsWith('@')) {
      formattedHandle = '@' + formattedHandle;
    }

    const mergedData = { ...(this.currentUser || {}), ...userData };
    if (formattedHandle) mergedData.handle = formattedHandle;
    mergedData.loggedIn = true;

    this.currentUser = mergedData;
    ziorseSetStorage(this.storageKeyUser, this.currentUser);

    const h = this.currentUser.handle;
    this.storageKeyServers = 'ziorse_real_servers_v14_' + h;
    this.storageKeyFriends = 'ziorse_friends_v2_' + h;
    this.storageKeyFriendRequests = 'ziorse_friend_requests_v2_' + h;
    this.storageKeyBlocked = 'ziorse_blocked_v1_' + h;
    this.storageKeyNotifications = 'ziorse_notifications_v1_' + h;
    this.storageKeyStatus = 'ziorse_status_v1_' + h;

    // Yalnızca kullanıcı kendi profilini düzenlerken handle'ını bizzat değiştirdiğinde verileri yeni anahtara taşı
    const isExplicitRename = isHandleRename || (oldHandle && this.currentUser.handle && oldHandle.toLowerCase() !== this.currentUser.handle.toLowerCase() && this.currentUser.email && userData.email && this.currentUser.email.toLowerCase() === userData.email.toLowerCase());

    if (isExplicitRename && oldHandle && this.currentUser.handle && this.currentUser.handle !== oldHandle) {
      const oldServers = this.servers || [];
      const oldFriends = this.friends || [];
      const oldFriendRequests = this.friendRequests || [];
      const oldBlocked = this.blockedList || [];

      this.servers = oldServers;
      this.friends = oldFriends;
      this.friendRequests = oldFriendRequests;
      this.blockedList = oldBlocked;

      this.saveServers();
      this.saveFriends();
      this.saveFriendRequests();
      this.saveBlocked();

      // Kullanicinin gonderilerindeki eski handle'i yeni handle ile esitle
      if (Array.isArray(this.posts)) {
        let postsChanged = false;
        this.posts.forEach(p => {
          if (p.handle === oldHandle) {
            p.handle = this.currentUser.handle;
            p.author = this.currentUser.name || p.author;
            p.avatar = this.currentUser.avatar || p.avatar;
            postsChanged = true;
          }
        });
        if (postsChanged) this.savePosts();
      }
    } else {
      // Başka hesapla giriş veya yeni kayıt yapıldığında o hesabın kendi verilerini yükle
      this.servers = this.loadServers();
      this.friends = this.loadFriends();
      this.friendRequests = this.loadFriendRequests();
      this.blockedList = this.loadBlocked();
      this.notifications = this.loadNotifications();
      this.userStatus = this.loadStatus();
    }

    // ziorse_accounts listesindeki hesabi guncelle (boylece login/switch hesaplarinda eski veri donmez)
    try {
      const rawAccounts = ziorseGetStorage('ziorse_accounts');
      let accountsList = (typeof rawAccounts === 'string' ? JSON.parse(rawAccounts) : rawAccounts) || [];
      if (Array.isArray(accountsList)) {
        const cleanOld = oldHandle ? oldHandle.toLowerCase().replace('@', '') : null;
        const cleanNew = this.currentUser.handle ? this.currentUser.handle.toLowerCase().replace('@', '') : null;
        accountsList = accountsList.map(acc => {
          const accH = (acc.handle || '').toLowerCase().replace('@', '');
          if (accH === cleanOld || accH === cleanNew || (acc.email && this.currentUser.email && acc.email.toLowerCase() === this.currentUser.email.toLowerCase())) {
            return {
              ...acc,
              name: this.currentUser.name || acc.name,
              handle: this.currentUser.handle || acc.handle,
              avatar: this.currentUser.avatar !== undefined ? this.currentUser.avatar : acc.avatar,
              banner: this.currentUser.banner !== undefined ? this.currentUser.banner : acc.banner,
              bio: this.currentUser.bio !== undefined ? this.currentUser.bio : acc.bio
            };
          }
          return acc;
        });
        ziorseSetStorage('ziorse_accounts', accountsList);
      }
    } catch (e) { }

    // Global kullanici dizinine yaz (diger hesaplar gorsun)
    if (this.currentUser) {
      this._saveToGlobalDirectory(this.currentUser);
    }

    // Iframe icindeysek Parent pencerenin dataStore'unu da aninda guncelle
    if (window.parent && window.parent !== window && window.parent.dataStore) {
      try {
        window.parent.dataStore.currentUser = { ...window.parent.dataStore.currentUser, ...this.currentUser };
        if (typeof window.parent.syncUserDisplay === 'function') {
          window.parent.syncUserDisplay();
        }
      } catch (e) { }
    }

    // Sunuculardaki üye listesinde bu kullanıcının avatar ve ismini güncelle
    if (this.currentUser && Array.isArray(this.servers)) {
      const curH = (this.currentUser.handle || '').toLowerCase().replace('@', '');
      let serversChanged = false;
      this.servers.forEach(srv => {
        if (Array.isArray(srv.members)) {
          srv.members.forEach(m => {
            if ((m.handle || '').toLowerCase().replace('@', '') === curH) {
              if (this.currentUser.avatar) m.avatar = this.currentUser.avatar;
              if (this.currentUser.name) m.name = this.currentUser.name;
              serversChanged = true;
            }
          });
        }
      });
      if (serversChanged) this.saveServers();
    }

    this.notify({ type: 'user-updated', user: this.currentUser });
  }

  _saveToGlobalDirectory(user) {
    const key = 'ziorse_user_directory';
    let dir = {};
    try { dir = JSON.parse(ziorseGetStorage(key) || '{}'); } catch { }
    const userObj = {
      name: user.name,
      handle: user.handle,
      avatar: user.avatar || '',
      banner: user.banner || '',
      bio: user.bio || '',
      followers: user.followers || 0,
      following: user.following || 0,
      status: user.status || this.userStatus || { type: 'online', text: '' }
    };
    dir[user.handle] = userObj;
    ziorseSetStorage(key, dir);

    if (window.socket) {
      window.socket.emit('sync-user-profile', userObj);
    }
  }

  _loadGlobalDirectory() {
    let local = {};
    try {
      const saved = ziorseGetStorage('ziorse_user_directory');
      local = (typeof saved === 'string' ? JSON.parse(saved) : saved) || {};
    } catch { local = {}; }

    const combined = Object.assign({}, local, window.__globalUserDirectory || {});

    // Also merge all registered accounts from ziorse_accounts
    try {
      const rawAccounts = ziorseGetStorage('ziorse_accounts');
      const accountsList = (typeof rawAccounts === 'string' ? JSON.parse(rawAccounts) : rawAccounts) || [];
      if (Array.isArray(accountsList)) {
        accountsList.forEach(acc => {
          if (acc && acc.handle) {
            const h = acc.handle.startsWith('@') ? acc.handle : '@' + acc.handle;
            const existing = combined[h] || {};
            combined[h] = {
              name: acc.name || existing.name || h.replace('@', ''),
              handle: h,
              avatar: acc.avatar || existing.avatar || DEFAULT_AVATAR,
              banner: acc.banner || existing.banner || '#999999',
              bio: acc.bio || existing.bio || '',
              followers: existing.followers || 0,
              following: existing.following || 0,
              status: existing.status || { type: 'offline', text: '' },
              ...existing
            };
            if (acc.avatar && (!existing.avatar || existing.avatar === DEFAULT_AVATAR)) {
              combined[h].avatar = acc.avatar;
            }
            if (acc.banner && (!existing.banner || existing.banner === '#999999')) {
              combined[h].banner = acc.banner;
            }
          }
        });
      }
    } catch { }

    return combined;
  }

  // -------------------------------------------------------
  // FRIENDS & FRIEND REQUESTS
  // -------------------------------------------------------

  loadFriends() {
    try {
      const saved = ziorseGetStorage(this.storageKeyFriends);
      return (typeof saved === 'string' ? JSON.parse(saved) : saved) || [];
    } catch { return []; }
  }

  saveFriends() {
    ziorseSetStorage(this.storageKeyFriends, this.friends);
  }

  loadFriendRequests() {
    try {
      const raw = ziorseGetStorage(this.storageKeyFriendRequests);
      const saved = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (saved && saved.incoming && saved.outgoing) return saved;
    } catch { }
    return { incoming: [], outgoing: [] };
  }

  saveFriendRequests() {
    ziorseSetStorage(this.storageKeyFriendRequests, this.friendRequests);
  }

  isFriend(handle) {
    const h = handle.startsWith('@') ? handle : '@' + handle;
    return this.friends.some(f => f.handle === h);
  }

  getUserFriends(targetHandle) {
    if (!targetHandle) return [];
    const h = targetHandle.startsWith('@') ? targetHandle : '@' + targetHandle;
    const clean = h.toLowerCase().replace('@', '');
    if (this.currentUser && this.currentUser.handle && this.currentUser.handle.toLowerCase() === h.toLowerCase()) {
      return Array.isArray(this.friends) ? this.friends : [];
    }
    // Başka kullanıcı için kaydedilmiş arkadaş listesini yükle
    try {
      const raw = ziorseGetStorage('ziorse_friends_v2_' + h) || ziorseGetStorage('ziorse_friends_v2_' + clean);
      if (raw) {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { }

    // Eğer arkadaşımızsa en azından arkadaş listesinde görünecektir
    const areFriends = this.friends && this.friends.some(f => f.handle.toLowerCase() === h.toLowerCase());
    if (areFriends && this.currentUser) {
      return [{ handle: this.currentUser.handle, name: this.currentUser.name, avatar: this.currentUser.avatar }];
    }
    return [];
  }

  getMutualFriends(targetHandle) {
    if (!this.currentUser || !targetHandle) return [];
    const myHandle = this.currentUser.handle.toLowerCase();
    const tHandle = (targetHandle.startsWith('@') ? targetHandle : '@' + targetHandle).toLowerCase();

    const myFriends = Array.isArray(this.friends) ? this.friends : [];
    if (myHandle === tHandle) {
      return myFriends; // Kendi profilinde tüm arkadaşları ortak göster
    }

    const theirFriends = this.getUserFriends(tHandle);
    const theirHandles = new Set(theirFriends.map(f => (f.handle || '').toLowerCase()));

    return myFriends.filter(f => f.handle && f.handle.toLowerCase() !== tHandle && theirHandles.has(f.handle.toLowerCase()));
  }

  getMutualServers(targetHandle) {
    if (!this.currentUser || !targetHandle) return [];
    const tHandle = (targetHandle.startsWith('@') ? targetHandle : '@' + targetHandle).toLowerCase();
    const myHandle = this.currentUser.handle.toLowerCase();

    const mutual = [];
    const servers = Array.isArray(this.servers) ? this.servers : [];

    for (const srv of servers) {
      if (myHandle === tHandle) {
        mutual.push(srv);
        continue;
      }
      // Target user is owner?
      if (srv.ownerHandle && srv.ownerHandle.toLowerCase() === tHandle) {
        mutual.push(srv);
        continue;
      }
      // Target user is in members list?
      const members = this.getServerMembers(srv.inviteCode || srv.id);
      if (members.some(m => m.handle && m.handle.toLowerCase() === tHandle)) {
        mutual.push(srv);
      }
    }
    return mutual;
  }

  getUserFriendCount(targetHandle) {
    return this.getUserFriends(targetHandle).length;
  }

  hasPendingOutgoing(handle) {
    const h = handle.startsWith('@') ? handle : '@' + handle;
    return this.friendRequests.outgoing.some(r => r.handle === h);
  }

  hasPendingIncoming(handle) {
    const h = handle.startsWith('@') ? handle : '@' + handle;
    return this.friendRequests.incoming.some(r => r.handle === h);
  }

  // Karsi tarafa istek gonder
  sendFriendRequest(targetHandle, targetName, targetAvatar) {
    const h = targetHandle.startsWith('@') ? targetHandle : '@' + targetHandle;
    if (this.isFriend(h) || this.hasPendingOutgoing(h)) return false;

    const req = {
      handle: h,
      name: targetName || h.replace('@', ''),
      avatar: targetAvatar || '',
      timestamp: new Date().toISOString(),
      firstMessage: null
    };

    this.friendRequests.outgoing.push(req);
    this.saveFriendRequests();

    if (window.socket && this.currentUser) {
      window.socket.emit('send-friend-request', {
        from: {
          handle: this.currentUser.handle,
          name: this.currentUser.name,
          avatar: this.currentUser.avatar
        },
        targetHandle: h,
        firstMessage: null,
        timestamp: req.timestamp
      });
    }

    // Karsi tarafin incoming listesine de yaz
    const otherIncomingKey = 'ziorse_friend_requests_v2_' + h;
    let otherData = { incoming: [], outgoing: [] };
    try {
      const raw = ziorseGetStorage(otherIncomingKey);
      otherData = (typeof raw === 'string' ? JSON.parse(raw) : raw) || otherData;
    } catch { }
    if (!otherData.incoming) otherData.incoming = [];
    const alreadyIn = otherData.incoming.some(r => r.handle === this.currentUser.handle);
    if (!alreadyIn) {
      otherData.incoming.push({
        handle: this.currentUser.handle,
        name: this.currentUser.name,
        avatar: this.currentUser.avatar,
        timestamp: req.timestamp,
        firstMessage: null
      });
      ziorseSetStorage(otherIncomingKey, otherData);
    }

    this.notify();
    return true;
  }

  // Istek gonderirken ilk mesaji ekle
  sendFriendRequestWithMessage(targetHandle, targetName, targetAvatar, message) {
    const h = targetHandle.startsWith('@') ? targetHandle : '@' + targetHandle;
    const sent = this.sendFriendRequest(h, targetName, targetAvatar);

    const myReq = this.friendRequests.outgoing.find(r => r.handle === h);
    if (myReq) { myReq.firstMessage = message; this.saveFriendRequests(); }

    const otherIncomingKey = 'ziorse_friend_requests_v2_' + h;
    let otherData = { incoming: [], outgoing: [] };
    try {
      const raw = ziorseGetStorage(otherIncomingKey);
      otherData = (typeof raw === 'string' ? JSON.parse(raw) : raw) || otherData;
    } catch { }
    const otherReq = (otherData.incoming || []).find(r => r.handle === this.currentUser.handle);
    if (otherReq) {
      otherReq.firstMessage = message;
      ziorseSetStorage(otherIncomingKey, otherData);
    }

    this.notify();
    return sent;
  }

  acceptFriendRequest(fromHandle) {
    const h = fromHandle.startsWith('@') ? fromHandle : '@' + fromHandle;
    const req = this.friendRequests.incoming.find(r => r.handle === h);
    if (!req) return;

    // Arkadas listesine ekle
    if (!this.isFriend(h)) {
      this.friends.push({ handle: req.handle, name: req.name, avatar: req.avatar });
      this.saveFriends();
    }

    if (window.socket && this.currentUser) {
      window.socket.emit('accept-friend-request', {
        from: {
          handle: this.currentUser.handle,
          name: this.currentUser.name,
          avatar: this.currentUser.avatar
        },
        targetHandle: h
      });
    }

    // incoming'den cikar
    this.friendRequests.incoming = this.friendRequests.incoming.filter(r => r.handle !== h);
    this.saveFriendRequests();

    // Karsi tarafin outgoing listesinden de cikar, friends'e ekle
    const otherFriendsKey = 'ziorse_friends_v2_' + h;
    const otherRequestsKey = 'ziorse_friend_requests_v2_' + h;
    let otherFriends = [];
    try {
      const rawF = ziorseGetStorage(otherFriendsKey);
      otherFriends = (typeof rawF === 'string' ? JSON.parse(rawF) : rawF) || [];
    } catch { }
    if (!otherFriends.some(f => f.handle === this.currentUser.handle)) {
      otherFriends.push({ handle: this.currentUser.handle, name: this.currentUser.name, avatar: this.currentUser.avatar });
      ziorseSetStorage(otherFriendsKey, otherFriends);
    }
    let otherReqs = { incoming: [], outgoing: [] };
    try {
      const rawR = ziorseGetStorage(otherRequestsKey);
      otherReqs = (typeof rawR === 'string' ? JSON.parse(rawR) : rawR) || otherReqs;
    } catch { }
    otherReqs.outgoing = (otherReqs.outgoing || []).filter(r => r.handle !== this.currentUser.handle);
    ziorseSetStorage(otherRequestsKey, otherReqs);

    // DM thread ac
    this.createDMThread(req.name, req.handle);

    // Karsi tarafin DM thread meta listesine de ekle
    const otherDmKey = this.storageKeyDMs + '_' + h;
    let otherThreads = [];
    try {
      const rawD = ziorseGetStorage(otherDmKey);
      otherThreads = (typeof rawD === 'string' ? JSON.parse(rawD) : rawD) || [];
    } catch { }
    const alreadyInOther = otherThreads.some(t => t.user && t.user.handle === this.currentUser.handle);
    if (!alreadyInOther) {
      otherThreads.unshift({
        id: 'dm-' + (Date.now() + 1),
        user: { name: this.currentUser.name, handle: this.currentUser.handle, avatar: this.currentUser.avatar }
      });
      ziorseSetStorage(otherDmKey, otherThreads);
    }

    this.notify();
  }

  rejectFriendRequest(fromHandle) {
    const h = fromHandle.startsWith('@') ? fromHandle : '@' + fromHandle;
    this.friendRequests.incoming = this.friendRequests.incoming.filter(r => r.handle !== h);
    this.saveFriendRequests();

    const otherRequestsKey = 'ziorse_friend_requests_v2_' + h;
    let otherReqs = { incoming: [], outgoing: [] };
    try {
      const rawR = ziorseGetStorage(otherRequestsKey);
      otherReqs = (typeof rawR === 'string' ? JSON.parse(rawR) : rawR) || otherReqs;
    } catch { }
    otherReqs.outgoing = (otherReqs.outgoing || []).filter(r => r.handle !== this.currentUser.handle);
    ziorseSetStorage(otherRequestsKey, otherReqs);

    this.notify();
  }

  isLoggedIn() {
    return !!(this.currentUser && this.currentUser.loggedIn === true && this.currentUser.handle);
  }

  logout() {
    const userKey = this.storageKeyUser;
    this.currentUser = null;
    ziorseRemoveStorage(userKey);
    try { localStorage.removeItem(userKey); } catch (e) { }
    try { localStorage.removeItem('ziorse_jwt_token'); } catch (e) { }
    this.servers = [];
    this.friends = [];
    this.friendRequests = { incoming: [], outgoing: [] };
    this.dmThreads = [];
    this.activeServerId = 'home';
    this.activeChannelId = 'genel';
    this.activeFilter = 'for-you';
    this.notify({ type: 'logout' });

    // Hedef pencere: iframe içindeyse en üst pencereyi (window.top) yönlendir
    const targetWin = (window.top && window.top.location) ? window.top : window;
    targetWin.location.replace('login.html');
  }

  loadFollowed() {
    try {
      const saved = ziorseGetStorage(this.storageKeyFollowed);
      return (typeof saved === 'string' ? JSON.parse(saved) : saved) || [];
    } catch { return []; }
  }

  saveFollowed() {
    ziorseSetStorage(this.storageKeyFollowed, this.followedHandles);
  }

  toggleFollowUser(handle) {
    if (this.followedHandles.includes(handle)) {
      this.followedHandles = this.followedHandles.filter(h => h !== handle);
    } else {
      this.followedHandles.push(handle);
    }
    this.saveFollowed();
    this.notify();
  }

  getUserProfile(handle) {
    if (!handle) {
      return {
        name: 'Kullanıcı',
        handle: '@kullanici',
        avatar: DEFAULT_AVATAR,
        banner: '#999999',
        bio: '',
        status: { type: 'offline', text: '' },
        isSelf: false
      };
    }
    const cleanRaw = handle.replace('@', '').toLowerCase();
    const targetH = '@' + cleanRaw;
    let res = null;

    if (this.currentUser && (this.currentUser.handle || '').toLowerCase().replace('@', '') === cleanRaw) {
      res = {
        ...this.currentUser,
        status: this.userStatus || this.currentUser.status || { type: 'online', text: '' },
        isSelf: true
      };
    } else {
      const dir = this._loadGlobalDirectory();
      const matchKey = Object.keys(dir).find(k => k.toLowerCase().replace('@', '') === cleanRaw);
      if (matchKey && dir[matchKey]) {
        res = { ...dir[matchKey], isFollowing: this.followedHandles.includes(handle), isSelf: false };
      } else {
        const foundKey = Object.keys(this.userDirectory).find(k => k.toLowerCase().replace('@', '') === cleanRaw);
        if (foundKey && this.userDirectory[foundKey]) {
          res = { ...this.userDirectory[foundKey], isFollowing: this.followedHandles.includes(handle), isSelf: false };
        }
      }
    }

    if (!res) {
      res = {
        name: handle.replace('@', ''),
        handle: targetH,
        avatar: '',
        banner: '',
        bio: '',
        followers: 0,
        following: 0,
        status: { type: 'offline', text: '' },
        isFollowing: this.followedHandles.includes(handle),
        isSelf: false
      };
    }

    // Comprehensive Fallbacks for Avatar and Banner
    const isDefaultOrMissingAvatar = !res.avatar || res.avatar === DEFAULT_AVATAR || res.avatar.includes('photo-1535713875002-d1d0cf377fde') || res.avatar.length < 10;
    const isDefaultOrMissingBanner = !res.banner || res.banner === '#999999' || res.banner === 'none' || res.banner === '';

    if (isDefaultOrMissingAvatar || isDefaultOrMissingBanner) {
      // 1. Check local accounts
      try {
        const rawAccounts = ziorseGetStorage('ziorse_accounts');
        const accs = (typeof rawAccounts === 'string' ? JSON.parse(rawAccounts) : rawAccounts) || [];
        const matchAcc = accs.find(a => (a.handle || '').toLowerCase().replace('@', '') === cleanRaw);
        if (matchAcc) {
          if (isDefaultOrMissingAvatar && matchAcc.avatar && matchAcc.avatar.length > 20) res.avatar = matchAcc.avatar;
          if (isDefaultOrMissingBanner && matchAcc.banner && matchAcc.banner !== '#999999') res.banner = matchAcc.banner;
          if (matchAcc.name && (!res.name || res.name === cleanRaw)) res.name = matchAcc.name;
          if (matchAcc.bio && !res.bio) res.bio = matchAcc.bio;
        }
      } catch { }

      // 2. Check server members
      if ((!res.avatar || res.avatar === DEFAULT_AVATAR) && Array.isArray(this.servers)) {
        for (const s of this.servers) {
          const mems = s.members || [];
          const mMatch = mems.find(m => (m.handle || '').toLowerCase().replace('@', '') === cleanRaw);
          if (mMatch && mMatch.avatar && mMatch.avatar !== DEFAULT_AVATAR && mMatch.avatar.length > 20) {
            res.avatar = mMatch.avatar;
            if (mMatch.name && (!res.name || res.name === cleanRaw)) res.name = mMatch.name;
            break;
          }
        }
      }

      // 3. Check global server members
      if ((!res.avatar || res.avatar === DEFAULT_AVATAR) && window.__globalServerMembers) {
        Object.keys(window.__globalServerMembers).forEach(code => {
          const mList = window.__globalServerMembers[code] || [];
          const mMatch = mList.find(m => (m.handle || '').toLowerCase().replace('@', '') === cleanRaw);
          if (mMatch && mMatch.avatar && mMatch.avatar !== DEFAULT_AVATAR && mMatch.avatar.length > 20) {
            res.avatar = mMatch.avatar;
            if (mMatch.name && (!res.name || res.name === cleanRaw)) res.name = mMatch.name;
          }
        });
      }

      // 4. Check posts
      if ((!res.avatar || res.avatar === DEFAULT_AVATAR) && Array.isArray(this.posts)) {
        const pMatch = this.posts.find(p => (p.handle || '').toLowerCase().replace('@', '') === cleanRaw && p.avatar && p.avatar !== DEFAULT_AVATAR);
        if (pMatch) {
          res.avatar = pMatch.avatar;
          if (pMatch.name && (!res.name || res.name === cleanRaw)) res.name = pMatch.name;
        }
      }

      // 5. Check friends
      if ((!res.avatar || res.avatar === DEFAULT_AVATAR) && Array.isArray(this.friends)) {
        const fMatch = this.friends.find(f => (f.handle || '').toLowerCase().replace('@', '') === cleanRaw && f.avatar);
        if (fMatch) {
          res.avatar = fMatch.avatar;
          if (fMatch.banner && isDefaultOrMissingBanner) res.banner = fMatch.banner;
          if (fMatch.name && (!res.name || res.name === cleanRaw)) res.name = fMatch.name;
        }
      }
    }

    if (!res.avatar || res.avatar.includes('photo-1535713875002-d1d0cf377fde') || res.avatar.length < 10) {
      res.avatar = DEFAULT_AVATAR;
    }
    if (res.avatar && res.avatar.startsWith('/uploads/')) {
      res.avatar = 'http://localhost:3000' + res.avatar;
    }
    if (!res.banner || res.banner.includes('photo-1618005182384-a83a8bd57fbe') || res.banner === 'none' || res.banner === '') {
      res.banner = '#999999';
    }
    if (res.banner && res.banner.startsWith('/uploads/')) {
      res.banner = 'http://localhost:3000' + res.banner;
    }
    return res;
  }

  loadPosts() {
    // Use parsed cache for performance - avoids re-JSON.parse on the large posts array
    const posts = ziorseGetStorageParsed(this.storageKeyPosts);
    if (Array.isArray(posts)) {
      let modified = false;
      posts.forEach(p => {
        if (!p.timestamp || p.timestamp === 'Şimdi') {
          p.timestamp = new Date().toISOString();
          modified = true;
        }
        if (p.codeSnippet && typeof p.codeSnippet === 'string' && p.codeSnippet.length > 8000) {
          p.codeSnippet = p.codeSnippet.substring(0, 8000) + '\n// ... (kod boyutu optimize edildi)';
          modified = true;
        }
        if (p.avatar && typeof p.avatar === 'string') {
          if (p.avatar.startsWith('/uploads/')) {
            p.avatar = 'http://localhost:3000' + p.avatar;
            modified = true;
          } else if (p.avatar === 'https://i.imgur.com/w3OhOmW.jpeg' || (p.avatar.startsWith('data:image/') && p.avatar.length > 20000)) {
            p.avatar = DEFAULT_AVATAR;
            modified = true;
          }
        }
        if (p.image && typeof p.image === 'string' && p.image.startsWith('/uploads/')) {
          p.image = 'http://localhost:3000' + p.image;
          modified = true;
        }
        if (p.comments && Array.isArray(p.comments)) {
          p.comments.forEach(c => {
            if (!c.timestamp || c.timestamp === 'Şimdi') {
              c.timestamp = new Date().toISOString();
              modified = true;
            }
            if (c.avatar && typeof c.avatar === 'string') {
              if (c.avatar.startsWith('/uploads/')) {
                c.avatar = 'http://localhost:3000' + c.avatar;
                modified = true;
              } else if (c.avatar === 'https://i.imgur.com/w3OhOmW.jpeg' || (c.avatar.startsWith('data:image/') && c.avatar.length > 20000)) {
                c.avatar = DEFAULT_AVATAR;
                modified = true;
              }
            }
          });
        }
      });
      if (modified) {
        ziorseSetStorage(this.storageKeyPosts, posts);
      }
      return posts;
    }
    return [];
  }

  savePosts() {
    if (this._savePostsTimer) clearTimeout(this._savePostsTimer);
    this._savePostsTimer = setTimeout(() => {
      try {
        ziorseSetStorage(this.storageKeyPosts, this.posts);
      } catch (e) { }
    }, 50);
  }

  // Iki kullanici arasindaki paylasimli konusma key'i olustur
  _convKey(handleA, handleB) {
    const sorted = [handleA, handleB].sort();
    return 'ziorse_dm_conv_' + sorted[0] + '_' + sorted[1];
  }

  loadDMs() {
    const h = (this.currentUser && this.currentUser.handle) ? this.currentUser.handle : 'guest';
    const raw = ziorseGetStorage(this.storageKeyDMs + '_' + h);
    if (raw) {
      try { return typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { }
    }
    return [];
  }

  saveDMs() {
    if (!this.currentUser || !this.currentUser.handle) return;
    const meta = this.dmThreads.map(t => ({
      id: t.id,
      user: t.user
    }));
    ziorseSetStorage(this.storageKeyDMs + '_' + this.currentUser.handle, meta);
  }

  // Belirli bir thread'in mesajlarini paylasimli key'den oku
  getThreadMessages(otherHandle) {
    const h = (this.currentUser && this.currentUser.handle) ? this.currentUser.handle : 'guest';
    const key = this._convKey(h, otherHandle);
    try {
      const raw = ziorseGetStorage(key);
      return (typeof raw === 'string' ? JSON.parse(raw) : raw) || [];
    } catch { return []; }
  }

  // Mesajlari paylasimli key'e yaz
  saveThreadMessages(otherHandle, messages) {
    const h = (this.currentUser && this.currentUser.handle) ? this.currentUser.handle : 'guest';
    const key = this._convKey(h, otherHandle);
    ziorseSetStorage(key, messages);
  }

  createDMThread(name, handle) {
    if (!handle.trim()) return null;
    const formattedHandle = handle.startsWith('@') ? handle : '@' + handle;

    // Sadece arkadas listesindeki kisilerle DM acilabilir
    if (!this.isFriend(formattedHandle)) return null;

    const existing = this.dmThreads.find(t => t.user.handle === formattedHandle);
    if (existing) return existing;

    const friendObj = this.friends.find(f => f.handle === formattedHandle);
    const newThread = {
      id: 'dm-' + Date.now(),
      user: {
        name: friendObj ? friendObj.name : (name.trim() || formattedHandle.replace('@', '')),
        handle: formattedHandle,
        avatar: friendObj ? (friendObj.avatar || DEFAULT_AVATAR) : DEFAULT_AVATAR
      },
      messages: []
    };

    this.dmThreads.unshift(newThread);
    this.saveDMs();
    this.notify();
    return newThread;
  }

  loadVoiceChannels() {
    const raw = ziorseGetStorage(this.storageKeyVoice);
    if (raw) {
      try { return typeof raw === 'string' ? JSON.parse(raw) : raw; } catch (e) { }
    }
    return [];
  }

  saveVoiceChannels() {
    ziorseSetStorage(this.storageKeyVoice, this.voiceChannels);
  }

  addVoiceChannel(name) {
    if (!name.trim()) return;
    const newChannel = {
      id: 'vc-' + Date.now(),
      name: name.trim(),
      activeUsers: 1
    };
    this.voiceChannels.push(newChannel);
    this.saveVoiceChannels();
    this.notify();
    return newChannel;
  }

  loadServers() {
    // Use parsed cache fast path to avoid re-JSON.parse
    const cached = ziorseGetStorageParsed(this.storageKeyServers);
    const list = Array.isArray(cached) ? cached : [];
    list.forEach(s => {
      if (Array.isArray(s.members) && s.members.length > 0) {
        if (!s.memberCount || s.memberCount < s.members.length) {
          s.memberCount = s.members.length;
        }
      }
    });
    return list;
  }

  saveServers() {
    ziorseSetStorage(this.storageKeyServers, this.servers);
  }

  // -------------------------------------------------------
  // SERVER FOLDERS MANAGEMENT
  // -------------------------------------------------------

  loadServerFolders() {
    try {
      const handle = this.currentUser ? this.currentUser.handle : 'guest';
      const raw = ziorseGetStorage('ziorse_server_folders_' + handle);
      if (raw) {
        return typeof raw === 'string' ? JSON.parse(raw) : raw;
      }
    } catch (e) { }
    return [];
  }

  saveServerFolders(folders, notifySubscribers = false) {
    const handle = this.currentUser ? this.currentUser.handle : 'guest';
    ziorseSetStorage('ziorse_server_folders_' + handle, folders || []);
    if (notifySubscribers) {
      this.notify({ type: 'server-folders-updated', folders });
    }
  }

  createServerFolder(serverIds, name = 'Klasör') {
    const folders = this.loadServerFolders();
    const newFolder = {
      id: 'folder_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: name,
      isExpanded: false,
      serverIds: Array.from(new Set(serverIds))
    };
    folders.push(newFolder);
    this.saveServerFolders(folders);
    return newFolder;
  }

  toggleServerFolder(folderId) {
    const folders = this.loadServerFolders();
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
      folder.isExpanded = !folder.isExpanded;
      this.saveServerFolders(folders);
    }
  }

  addServerToFolder(folderId, serverId) {
    const folders = this.loadServerFolders();
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
      if (!folder.serverIds.includes(serverId)) {
        folder.serverIds.push(serverId);
        this.saveServerFolders(folders);
      }
    }
  }

  removeServerFromFolder(folderId, serverId) {
    let folders = this.loadServerFolders();
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
      folder.serverIds = folder.serverIds.filter(id => id !== serverId);
      if (folder.serverIds.length < 2) {
        // 2'den az kalınca klasörü dağıt
        folders = folders.filter(f => f.id !== folderId);
      }
      this.saveServerFolders(folders);
    }
  }

  deleteServerFolder(folderId) {
    let folders = this.loadServerFolders();
    folders = folders.filter(f => f.id !== folderId);
    this.saveServerFolders(folders);
  }

  _makeDefaultCategories() {
    return [
      {
        id: 'cat-' + Date.now(),
        name: 'METİN KANALLARI',
        collapsed: false,
        channels: [
          { id: 'genel', name: 'genel-sohbet', type: 'text' },
          { id: 'duyurular', name: 'duyurular', type: 'text' },
          { id: 'kod-paylasim', name: 'kod-paylasimi', type: 'text' }
        ]
      }
    ];
  }

  _migrateServerCategories(server) {
    if (!server) return;
    if (server.inviteCode) {
      const info = this.getInviteInfo(server.inviteCode);
      if (info && info.ownerHandle) {
        server.ownerHandle = info.ownerHandle;
        if (info.ownerName) server.ownerName = info.ownerName;
        if (info.ownerAvatar) server.ownerAvatar = info.ownerAvatar;
      }
    }
    // Eski sunucular düz channels listesine sahipse categories'e dönüştür
    if (!server.categories || server.categories.length === 0) {
      const channels = server.channels || [
        { id: 'genel', name: 'genel-sohbet', type: 'text' },
        { id: 'duyurular', name: 'duyurular', type: 'text' },
        { id: 'kod-paylasim', name: 'kod-paylasimi', type: 'text' }
      ];
      server.categories = [
        {
          id: 'cat-default-' + (server.id || 'main'),
          name: 'METİN KANALLARI',
          collapsed: false,
          channels: channels.map(c => ({ ...c, type: c.type || 'text' }))
        }
      ];
      delete server.channels;
      this.saveServers();
    } else {
      let modified = false;
      server.categories.forEach((cat, idx) => {
        if (!cat.id) {
          cat.id = 'cat-' + (server.id || 'srv') + '-' + idx;
          modified = true;
        }
      });
      if (modified) {
        this.saveServers();
      }
    }
    return server;
  }

  addServer(name) {
    if (!name.trim() || !this.currentUser) return;
    const initials = name.trim().substring(0, 2).toUpperCase();
    const inviteCode = Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 6);
    const newServer = {
      id: 'srv-' + Date.now(),
      name: name.trim(),
      icon: initials,
      inviteCode: inviteCode,
      ownerHandle: this.currentUser.handle,
      memberCount: 1,
      categories: this._makeDefaultCategories()
    };
    this.servers.push(newServer);
    this.saveServers();

    // Invite registry'e kaydet
    const registry = this._loadInviteRegistry();
    registry[inviteCode] = {
      serverName: newServer.name,
      serverIcon: newServer.icon,
      memberCount: 1,
      serverId: newServer.id,
      ownerHandle: this.currentUser.handle,
      ownerName: this.currentUser.name,
      ownerAvatar: this.currentUser.avatar,
      categories: JSON.parse(JSON.stringify(newServer.categories || []))
    };
    ziorseSetStorage('ziorse_invite_registry', registry);

    if (window.socket) {
      window.socket.emit('register-server-invite', { code: inviteCode, info: registry[inviteCode] });
    }

    // Sahibi üye listesine ekle
    this._addServerMember(inviteCode, {
      handle: this.currentUser.handle,
      name: this.currentUser.name,
      avatar: this.currentUser.avatar
    });

    this.notify();
    return newServer;
  }

  getServerMemberCount(inviteCode) {
    if (!inviteCode) return 1;
    const srv = this.servers.find(s => s.inviteCode === inviteCode || s.id === inviteCode);
    const registry = this._loadInviteRegistry();
    const regInfo = registry[inviteCode] || (srv && srv.inviteCode ? registry[srv.inviteCode] : null);

    let storageMembers = 0;
    try {
      const raw = ziorseGetStorage(this._serverMembersKey(inviteCode));
      const parsed = (typeof raw === 'string' ? JSON.parse(raw) : raw) || [];
      if (Array.isArray(parsed)) storageMembers = parsed.length;
    } catch { }

    const srvMembersCount = (srv && Array.isArray(srv.members)) ? srv.members.length : 0;
    const regMembersCount = (regInfo && Array.isArray(regInfo.members)) ? regInfo.members.length : 0;
    const regCount = (regInfo && typeof regInfo.memberCount === 'number') ? regInfo.memberCount : 0;
    const srvCount = (srv && typeof srv.memberCount === 'number') ? srv.memberCount : 0;

    const count = Math.max(srvMembersCount, regMembersCount, regCount, srvCount, storageMembers, 1);
    if (srv && srv.memberCount !== count) {
      srv.memberCount = count;
    }
    return count;
  }

  generateInvite(serverId) {
    if (!this.currentUser) return null;
    const srv = this.servers.find(s => s.id === serverId);
    if (!srv) return null;
    if (!srv.inviteCode) {
      srv.inviteCode = Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 6);
      this.saveServers();
    }
    const actualMemberCount = this.getServerMemberCount(srv.inviteCode || srv.id);
    srv.memberCount = actualMemberCount;

    // Daveti global registry'e kaydet (herkes okuyabilsin)
    const registry = this._loadInviteRegistry();
    registry[srv.inviteCode] = {
      serverName: srv.name,
      serverIcon: srv.icon,
      serverBanner: srv.banner || '',
      memberCount: actualMemberCount,
      serverId: srv.id,
      ownerHandle: this.currentUser.handle,
      ownerName: this.currentUser.name,
      ownerAvatar: this.currentUser.avatar,
      storageKey: this.storageKeyServers,
      categories: JSON.parse(JSON.stringify(srv.categories || [])),
      roles: JSON.parse(JSON.stringify(srv.roles || [])),
      memberRoles: JSON.parse(JSON.stringify(srv.memberRoles || {}))
    };
    ziorseSetStorage('ziorse_invite_registry', registry);

    if (window.socket) {
      window.socket.emit('register-server-invite', { code: srv.inviteCode, info: registry[srv.inviteCode] });
    }

    // Sunucu sahibini üye listesine ekle (isim/avatar ile)
    this._addServerMember(srv.inviteCode, {
      handle: this.currentUser.handle,
      name: this.currentUser.name,
      avatar: this.currentUser.avatar
    });

    return { code: srv.inviteCode, serverName: srv.name, serverIcon: srv.icon, serverBanner: srv.banner || '', memberCount: actualMemberCount };
  }

  _loadInviteRegistry() {
    let local = {};
    try {
      const raw = ziorseGetStorage('ziorse_invite_registry');
      local = (typeof raw === 'string' ? JSON.parse(raw) : raw) || {};
    } catch { local = {}; }
    return Object.assign({}, local, window.__globalInviteRegistry || {});
  }

  getInviteInfo(code) {
    if (!code) return null;
    const registry = this._loadInviteRegistry();
    let info = registry[code] || (window.__globalInviteRegistry && window.__globalInviteRegistry[code]) || null;
    if (info) {
      const liveCount = this.getServerMemberCount(code);
      if (liveCount > (info.memberCount || 0)) {
        info.memberCount = liveCount;
      }
      return info;
    }
    return null;
  }

  joinByInviteCode(code) {
    const info = this.getInviteInfo(code);
    if (!info) return { error: 'Gecersiz davet kodu.' };

    // Zaten bu sunucuda uye mi?
    const alreadyMember = this.servers.some(s => s.inviteCode === code);
    if (alreadyMember) return { error: 'Zaten bu sunucunun uyesisin.' };

    // Yeni sunucu kaydı oluştur
    const ownerCategories = info.categories || null;
    const newServer = {
      id: 'srv-' + Date.now(),
      name: info.serverName,
      icon: info.serverIcon,
      banner: info.serverBanner || '',
      inviteCode: code,
      memberCount: info.memberCount || 1,
      ownerHandle: info.ownerHandle,
      ownerName: info.ownerName || '',
      ownerAvatar: info.ownerAvatar || '',
      joined: true,
      categories: ownerCategories ? JSON.parse(JSON.stringify(ownerCategories)) : this._makeDefaultCategories(),
      roles: Array.isArray(info.roles) ? JSON.parse(JSON.stringify(info.roles)) : [],
      memberRoles: (info.memberRoles && typeof info.memberRoles === 'object') ? JSON.parse(JSON.stringify(info.memberRoles)) : {}
    };
    this.servers.push(newServer);
    this.saveServers();

    // Uye listesine ekle (global key)
    this._addServerMember(code, {
      handle: this.currentUser.handle,
      name: this.currentUser.name,
      avatar: this.currentUser.avatar
    });

    this.notify();
    return { success: true, server: newServer };
  }

  // ── KATEGORİ & KANAL YÖNETİMİ ──────────────────────────────

  getServerCategories(serverId) {
    const srv = this.servers.find(s => s.id === serverId);
    if (!srv) return [];
    this._migrateServerCategories(srv);
    return srv.categories || [];
  }

  _syncServerStructure(srv) {
    if (!srv) return;
    if (srv.inviteCode) {
      const registry = this._loadInviteRegistry();
      if (!registry[srv.inviteCode]) {
        registry[srv.inviteCode] = {
          serverName: srv.name,
          serverIcon: srv.icon,
          serverBanner: srv.banner || '',
          memberCount: srv.memberCount || 1,
          serverId: srv.id,
          ownerHandle: srv.ownerHandle || (this.currentUser && this.currentUser.handle),
          ownerName: srv.ownerName || (this.currentUser && this.currentUser.name),
          ownerAvatar: srv.ownerAvatar || (this.currentUser && this.currentUser.avatar),
          categories: JSON.parse(JSON.stringify(srv.categories || [])),
          roles: JSON.parse(JSON.stringify(srv.roles || [])),
          memberRoles: JSON.parse(JSON.stringify(srv.memberRoles || {}))
        };
      } else {
        registry[srv.inviteCode].categories = JSON.parse(JSON.stringify(srv.categories || []));
        registry[srv.inviteCode].serverName = srv.name;
        registry[srv.inviteCode].serverIcon = srv.icon;
        registry[srv.inviteCode].serverBanner = srv.banner || '';
        registry[srv.inviteCode].roles = JSON.parse(JSON.stringify(srv.roles || []));
        registry[srv.inviteCode].memberRoles = JSON.parse(JSON.stringify(srv.memberRoles || {}));
      }
      ziorseSetStorage('ziorse_invite_registry', registry);

      if (window.socket) {
        window.socket.emit('server-structure-update', {
          inviteCode: srv.inviteCode,
          serverId: srv.id,
          categories: srv.categories,
          serverName: srv.name,
          serverIcon: srv.icon,
          serverBanner: srv.banner || '',
          roles: srv.roles || [],
          memberRoles: srv.memberRoles || {}
        });
      }
    }
  }

  addCategory(serverId, categoryName) {
    const srv = this.servers.find(s => String(s.id) === String(serverId));
    if (!srv || !categoryName.trim()) return null;
    this._migrateServerCategories(srv);
    const newCat = {
      id: 'cat-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: categoryName.trim().toUpperCase(),
      collapsed: false,
      channels: []
    };
    if (!srv.categories) srv.categories = [];
    srv.categories.push(newCat);
    this.saveServers();
    this._syncServerStructure(srv);
    this.notify({ type: 'category-added', serverId, category: newCat });
    return newCat;
  }

  addChannelToCategory(serverId, categoryId, channelName, type = 'text') {
    const srv = this.servers.find(s => String(s.id) === String(serverId));
    if (!srv || !channelName.trim()) return null;
    this._migrateServerCategories(srv);
    const cat = (srv.categories || []).find(c => String(c.id) === String(categoryId));
    if (!cat) return null;
    cat.collapsed = false;
    const newCh = {
      id: 'ch-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: channelName.trim().toLowerCase().replace(/\s+/g, '-'),
      type
    };
    if (!cat.channels) cat.channels = [];
    cat.channels.push(newCh);
    this.saveServers();
    this._syncServerStructure(srv);
    this.notify({ type: 'channel-added', serverId, categoryId, channel: newCh });
    return newCh;
  }

  updateCategory(serverId, categoryId, updates) {
    const srv = this.servers.find(s => String(s.id) === String(serverId));
    if (!srv) return false;
    this._migrateServerCategories(srv);
    let cat = (srv.categories || []).find(c => String(c.id) === String(categoryId));
    if (!cat) return false;
    Object.assign(cat, updates);
    this.saveServers();
    this._syncServerStructure(srv);
    this.notify({ type: 'category-updated', serverId: srv.id, categoryId: cat.id, updates });
    return true;
  }

  removeCategory(serverId, categoryId) {
    const srv = this.servers.find(s => String(s.id) === String(serverId));
    if (!srv) return false;
    this._migrateServerCategories(srv);
    srv.categories = (srv.categories || []).filter(c => String(c.id) !== String(categoryId));
    this.saveServers();
    this._syncServerStructure(srv);
    this.notify({ type: 'category-removed', serverId: srv.id, categoryId });
    return true;
  }

  updateChannel(serverId, categoryId, channelId, updates) {
    const srv = this.servers.find(s => String(s.id) === String(serverId));
    if (!srv) return false;
    this._migrateServerCategories(srv);
    let cat = (srv.categories || []).find(c => String(c.id) === String(categoryId));
    let ch = null;
    if (cat) {
      ch = (cat.channels || []).find(c => String(c.id) === String(channelId));
    }
    if (!ch) {
      for (const otherCat of (srv.categories || [])) {
        ch = (otherCat.channels || []).find(c => String(c.id) === String(channelId));
        if (ch) { cat = otherCat; break; }
      }
    }
    if (!ch) return false;
    Object.assign(ch, updates);
    this.saveServers();
    this._syncServerStructure(srv);
    this.notify({ type: 'channel-updated', serverId: srv.id, categoryId: cat.id, channelId: ch.id, updates });
    return true;
  }

  removeChannel(serverId, categoryId, channelId) {
    const srv = this.servers.find(s => String(s.id) === String(serverId));
    if (!srv) return false;
    this._migrateServerCategories(srv);
    for (const cat of (srv.categories || [])) {
      const idx = (cat.channels || []).findIndex(c => String(c.id) === String(channelId));
      if (idx !== -1) {
        cat.channels.splice(idx, 1);
        this.saveServers();
        this._syncServerStructure(srv);
        this.notify({ type: 'channel-removed', serverId: srv.id, categoryId: cat.id, channelId });
        return true;
      }
    }
    return false;
  }

  moveChannelToCategory(serverId, channelId, fromCategoryId, toCategoryId, insertIndex = -1) {
    const srv = this.servers.find(s => s.id === serverId);
    if (!srv) return false;
    this._migrateServerCategories(srv);
    const fromCat = srv.categories.find(c => c.id === fromCategoryId);
    const toCat = srv.categories.find(c => c.id === toCategoryId);
    if (!fromCat || !toCat) return false;
    const chIdx = fromCat.channels.findIndex(c => c.id === channelId);
    if (chIdx === -1) return false;
    const [ch] = fromCat.channels.splice(chIdx, 1);
    if (insertIndex >= 0 && insertIndex <= toCat.channels.length) {
      toCat.channels.splice(insertIndex, 0, ch);
    } else {
      toCat.channels.push(ch);
    }
    this.saveServers();
    this._syncServerStructure(srv);
    this.notify({ type: 'channel-moved', serverId, channelId, fromCategoryId, toCategoryId });
    return true;
  }

  reorderCategories(serverId, newOrder) {
    const srv = this.servers.find(s => s.id === serverId);
    if (!srv) return false;
    this._migrateServerCategories(srv);
    srv.categories = newOrder;
    this.saveServers();
    this._syncServerStructure(srv);
    this.notify({ type: 'categories-reordered', serverId });
    return true;
  }

  reorderChannelInCategory(serverId, categoryId, channelId, newIndex) {
    const srv = this.servers.find(s => s.id === serverId);
    if (!srv) return false;
    this._migrateServerCategories(srv);
    const cat = srv.categories.find(c => c.id === categoryId);
    if (!cat) return false;
    const chIdx = cat.channels.findIndex(c => c.id === channelId);
    if (chIdx === -1) return false;
    const [ch] = cat.channels.splice(chIdx, 1);
    cat.channels.splice(newIndex, 0, ch);
    this.saveServers();
    this._syncServerStructure(srv);
    this.notify({ type: 'channels-reordered', serverId, categoryId });
    return true;
  }

  isServerOwner(serverId, userHandle) {
    const cu = userHandle ? (typeof userHandle === 'string' ? { handle: userHandle } : userHandle) : this.currentUser;
    if (!cu || !cu.handle) return false;
    const srv = this.servers.find(s => s.id === serverId || s.inviteCode === serverId);
    if (!srv) return false;
    const cleanUser = cu.handle.toLowerCase().replace('@', '');
    if (srv.ownerHandle) {
      const cleanOwner = srv.ownerHandle.toLowerCase().replace('@', '');
      if (cleanOwner === cleanUser) return true;
    }
    if (srv.inviteCode) {
      const info = this.getInviteInfo(srv.inviteCode);
      if (info && info.ownerHandle) {
        const cleanInfoOwner = info.ownerHandle.toLowerCase().replace('@', '');
        if (cleanInfoOwner === cleanUser) return true;
      }
    }
    if (srv.joined !== true) return true;
    return false;
  }

  deleteServer(serverId) {
    const srv = this.servers.find(s => s.id === serverId);
    if (!srv) return false;
    this.servers = this.servers.filter(s => s.id !== serverId);
    this.saveServers();
    if (srv.inviteCode) {
      const registry = this._loadInviteRegistry();
      delete registry[srv.inviteCode];
      ziorseSetStorage('ziorse_invite_registry', registry);
    }
    this.notify();
    return true;
  }

  leaveServer(serverId) {
    const srv = this.servers.find(s => s.id === serverId);
    if (!srv) return false;
    this.servers = this.servers.filter(s => s.id !== serverId);
    this.saveServers();
    if (srv.inviteCode && this.currentUser) {
      const key = this._serverMembersKey(srv.inviteCode);
      const members = this.getServerMembers(srv.inviteCode).filter(m => m.handle !== this.currentUser.handle);
      ziorseSetStorage(key, members);
    }
    this.notify();
    return true;
  }

  checkChannelPermission(serverId, categoryId, channelId, permissionKey, userHandle) {
    const cu = userHandle ? { handle: userHandle } : this.currentUser;
    if (!cu) return false;
    const srv = this.servers.find(s => s.id === serverId);
    if (!srv) return false;

    // Sunucu sahibi her zaman tam yetkiye sahiptir
    if (this.isServerOwner(serverId, cu.handle)) return true;

    let cat = null;
    if (categoryId) {
      cat = (srv.categories || []).find(c => c.id === categoryId);
    } else if (channelId) {
      for (const c of (srv.categories || [])) {
        if ((c.channels || []).some(ch => ch.id === channelId)) {
          cat = c;
          break;
        }
      }
    }

    const ch = cat && channelId ? (cat.channels || []).find(c => c.id === channelId) : null;

    // 1. Kanal kişiye özel izin
    if (ch && ch.permissions && ch.permissions[cu.handle] && ch.permissions[cu.handle][permissionKey] !== undefined && ch.permissions[cu.handle][permissionKey] !== null) {
      return Boolean(ch.permissions[cu.handle][permissionKey]);
    }

    // 2. Kanal @everyone izni
    if (ch && ch.permissions && ch.permissions['@everyone'] && ch.permissions['@everyone'][permissionKey] !== undefined && ch.permissions['@everyone'][permissionKey] !== null) {
      return Boolean(ch.permissions['@everyone'][permissionKey]);
    }

    // 3. Kategori kişiye özel izin
    if (cat && cat.permissions && cat.permissions[cu.handle] && cat.permissions[cu.handle][permissionKey] !== undefined && cat.permissions[cu.handle][permissionKey] !== null) {
      return Boolean(cat.permissions[cu.handle][permissionKey]);
    }

    // 4. Kategori @everyone izni (tüm kanallar miras alır)
    if (cat && cat.permissions && cat.permissions['@everyone'] && cat.permissions['@everyone'][permissionKey] !== undefined && cat.permissions['@everyone'][permissionKey] !== null) {
      return Boolean(cat.permissions['@everyone'][permissionKey]);
    }

    // Varsayılan roller
    if (permissionKey === 'manage_messages' || permissionKey === 'pin_messages') {
      return false;
    }
    return true;
  }

  updateChannelPermissionOverride(serverId, categoryId, channelId, targetId, permKey, value) {
    const srv = this.servers.find(s => s.id === serverId);
    if (!srv) return false;
    this._migrateServerCategories(srv);
    const cat = srv.categories.find(c => c.id === categoryId);
    if (!cat) return false;
    const ch = cat.channels.find(c => c.id === channelId);
    if (!ch) return false;

    if (!ch.permissions) ch.permissions = {};
    if (!ch.permissions[targetId]) ch.permissions[targetId] = {};

    if (value === null || value === undefined) {
      delete ch.permissions[targetId][permKey];
      if (Object.keys(ch.permissions[targetId]).length === 0) {
        delete ch.permissions[targetId];
      }
    } else {
      ch.permissions[targetId][permKey] = value;
    }

    this.saveServers();
    this.notify();
    return true;
  }

  deleteChannelPermissionTarget(serverId, categoryId, channelId, targetId) {
    const srv = this.servers.find(s => s.id === serverId);
    if (!srv) return false;
    this._migrateServerCategories(srv);
    const cat = srv.categories.find(c => c.id === categoryId);
    if (!cat) return false;
    const ch = cat.channels.find(c => c.id === channelId);
    if (!ch || !ch.permissions) return false;

    delete ch.permissions[targetId];
    this.saveServers();
    this.notify();
    return true;
  }

  updateCategoryPermissionOverride(serverId, categoryId, targetId, permKey, value) {
    const srv = this.servers.find(s => s.id === serverId);
    if (!srv) return false;
    this._migrateServerCategories(srv);
    const cat = srv.categories.find(c => c.id === categoryId);
    if (!cat) return false;

    if (!cat.permissions) cat.permissions = {};
    if (!cat.permissions[targetId]) cat.permissions[targetId] = {};

    if (value === null || value === undefined) {
      delete cat.permissions[targetId][permKey];
      if (Object.keys(cat.permissions[targetId]).length === 0) {
        delete cat.permissions[targetId];
      }
    } else {
      cat.permissions[targetId][permKey] = value;
    }

    this.saveServers();
    this.notify();
    return true;
  }

  deleteCategoryPermissionTarget(serverId, categoryId, targetId) {
    const srv = this.servers.find(s => s.id === serverId);
    if (!srv) return false;
    this._migrateServerCategories(srv);
    const cat = srv.categories.find(c => c.id === categoryId);
    if (!cat || !cat.permissions) return false;

    delete cat.permissions[targetId];
    this.saveServers();
    this.notify();
    return true;
  }

  // Sunucu üye listesi (global, kod bazlı)
  _serverMembersKey(inviteCode) {
    return 'ziorse_srv_members_' + inviteCode;
  }

  _addServerMember(inviteCode, user) {
    if (!inviteCode || !user || !user.handle) return;
    const key = this._serverMembersKey(inviteCode);
    const members = this.getServerMembers(inviteCode);
    const memberObj = {
      handle: user.handle.startsWith('@') ? user.handle : '@' + user.handle,
      name: user.name || user.handle.replace('@', ''),
      avatar: user.avatar || ''
    };
    const existing = members.find(m => m.handle.toLowerCase() === memberObj.handle.toLowerCase());
    if (existing && existing.name === memberObj.name && existing.avatar === memberObj.avatar) {
      return; // Değişiklik yoksa döngüye girmemek için dur
    }
    const idx = members.findIndex(m => m.handle.toLowerCase() === memberObj.handle.toLowerCase());
    if (idx === -1) {
      members.push(memberObj);
    } else {
      members[idx] = memberObj;
    }
    ziorseSetStorage(key, members);

    const srv = this.servers.find(s => s.inviteCode === inviteCode || s.id === inviteCode);
    if (srv) {
      srv.members = members;
      srv.memberCount = members.length;
      this.saveServers();
    }

    try {
      const registry = this._loadInviteRegistry();
      if (registry[inviteCode]) {
        registry[inviteCode].memberCount = members.length;
        ziorseSetStorage('ziorse_invite_registry', registry);
      }
    } catch (e) { }

    if (window.socket) {
      window.socket.emit('server-member-joined', {
        inviteCode,
        member: memberObj
      });
    }
  }

  getServerMembers(inviteCode) {
    if (!inviteCode) return [];
    let local = [];
    try {
      const raw = ziorseGetStorage(this._serverMembersKey(inviteCode));
      local = (typeof raw === 'string' ? JSON.parse(raw) : raw) || [];
    } catch { local = []; }

    const srv = this.servers.find(s => s.inviteCode === inviteCode || s.id === inviteCode);
    const srvMembers = (srv && Array.isArray(srv.members)) ? srv.members : [];

    const globalList = (window.__globalServerMembers && (window.__globalServerMembers[inviteCode] || (srv && window.__globalServerMembers[srv.inviteCode]))) || [];

    const registry = this._loadInviteRegistry();
    const inviteInfo = registry[inviteCode] || (srv && srv.inviteCode ? registry[srv.inviteCode] : null);
    const inviteMembers = (inviteInfo && Array.isArray(inviteInfo.members)) ? inviteInfo.members : [];

    const map = new Map();

    // 1. Storage & Global List & Server Object & Invite Registry
    [...local, ...srvMembers, ...globalList, ...inviteMembers].forEach(m => {
      if (m && m.handle) {
        const cleanH = m.handle.toLowerCase();
        const prof = this.getUserProfile(m.handle);
        map.set(cleanH, {
          handle: m.handle.startsWith('@') ? m.handle : '@' + m.handle,
          name: prof.name || m.name || m.handle.replace('@', ''),
          avatar: prof.avatar || m.avatar || DEFAULT_AVATAR
        });
      }
    });

    // 2. Server Owner
    const ownerHandle = (inviteInfo && inviteInfo.ownerHandle) || (srv && srv.ownerHandle);
    if (ownerHandle) {
      const cleanH = ownerHandle.toLowerCase();
      if (!map.has(cleanH)) {
        const prof = this.getUserProfile(ownerHandle);
        map.set(cleanH, {
          handle: ownerHandle.startsWith('@') ? ownerHandle : '@' + ownerHandle,
          name: prof.name || (inviteInfo && inviteInfo.ownerName) || (srv && srv.ownerName) || ownerHandle.replace('@', ''),
          avatar: prof.avatar || (inviteInfo && inviteInfo.ownerAvatar) || (srv && srv.ownerAvatar) || DEFAULT_AVATAR
        });
      }
    }

    // 3. Scan posts in this server to discover members who posted in channels
    if (Array.isArray(this.posts) && (inviteCode || (srv && srv.id))) {
      const sCode = inviteCode;
      const sId = srv ? srv.id : null;
      this.posts.forEach(p => {
        if (p && p.handle && p.serverChannelKey) {
          const parts = p.serverChannelKey.split(':');
          const pServer = parts[0];
          if (pServer === sCode || pServer === sId) {
            const cleanH = p.handle.toLowerCase();
            if (!map.has(cleanH)) {
              const prof = this.getUserProfile(p.handle);
              map.set(cleanH, {
                handle: p.handle.startsWith('@') ? p.handle : '@' + p.handle,
                name: prof.name || p.name || p.handle.replace('@', ''),
                avatar: prof.avatar || p.avatar || DEFAULT_AVATAR
              });
            }
          }
        }
      });
    }

    // 4. Scan channel / category permissions for added members
    if (srv && Array.isArray(srv.categories)) {
      srv.categories.forEach(cat => {
        if (cat && cat.permissions) {
          Object.keys(cat.permissions).forEach(target => {
            if (target.startsWith('@')) {
              const cleanH = target.toLowerCase();
              if (!map.has(cleanH)) {
                const prof = this.getUserProfile(target);
                map.set(cleanH, {
                  handle: target,
                  name: prof.name || target.replace('@', ''),
                  avatar: prof.avatar || DEFAULT_AVATAR
                });
              }
            }
          });
        }
        if (cat && Array.isArray(cat.channels)) {
          cat.channels.forEach(ch => {
            if (ch && ch.permissions) {
              Object.keys(ch.permissions).forEach(target => {
                if (target.startsWith('@')) {
                  const cleanH = target.toLowerCase();
                  if (!map.has(cleanH)) {
                    const prof = this.getUserProfile(target);
                    map.set(cleanH, {
                      handle: target,
                      name: prof.name || target.replace('@', ''),
                      avatar: prof.avatar || DEFAULT_AVATAR
                    });
                  }
                }
              });
            }
          });
        }
      });
    }

    const result = Array.from(map.values());

    // Sync back to local storage cache and server object
    if (result.length > 0) {
      ziorseSetStorage(this._serverMembersKey(inviteCode), result);
      if (srv && (!srv.members || srv.members.length !== result.length)) {
        srv.members = result;
      }
    }

    return result;
  }

  // -------------------------------------------------------
  // SERVER ROLES & PERMISSIONS MANAGEMENT
  // -------------------------------------------------------

  getServerRoles(serverId) {
    if (!serverId) return [];
    const srv = this.servers.find(s => s.id === serverId || s.inviteCode === serverId);
    if (!srv) return [];
    if (!Array.isArray(srv.roles)) {
      srv.roles = [];
    }
    // Return sorted by position (0 is highest ranking)
    return [...srv.roles].sort((a, b) => (a.position ?? 999) - (b.position ?? 999));
  }

  saveServerRole(serverId, roleData) {
    const srv = this.servers.find(s => s.id === serverId || s.inviteCode === serverId);
    if (!srv) return null;
    if (!Array.isArray(srv.roles)) srv.roles = [];

    let role = null;
    if (roleData.id) {
      const idx = srv.roles.findIndex(r => r.id === roleData.id);
      if (idx !== -1) {
        srv.roles[idx] = {
          ...srv.roles[idx],
          ...roleData,
          permissions: { ...(srv.roles[idx].permissions || {}), ...(roleData.permissions || {}) }
        };
        role = srv.roles[idx];
      }
    }

    if (!role) {
      const newPos = srv.roles.length;
      role = {
        id: roleData.id || ('role_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4)),
        name: roleData.name || 'Yeni Rol',
        color: roleData.color || '#dbdbdb',
        icon: roleData.icon || '',
        position: roleData.position !== undefined ? roleData.position : newPos,
        hoist: roleData.hoist !== undefined ? Boolean(roleData.hoist) : true,
        permissions: {
          send_messages: true,
          connect_voice: true,
          speak_voice: true,
          manage_channels: false,
          kick_ban_members: false,
          manage_server: false,
          manage_roles: false,
          ...(roleData.permissions || {})
        }
      };
      srv.roles.push(role);
    }

    this.saveServers();
    this._syncServerRoles(srv);
    this.notify({ type: 'server-roles-updated', serverId });
    return role;
  }

  deleteServerRole(serverId, roleId) {
    const srv = this.servers.find(s => s.id === serverId || s.inviteCode === serverId);
    if (!srv || !Array.isArray(srv.roles)) return false;

    srv.roles = srv.roles.filter(r => r.id !== roleId);
    // Re-index positions
    srv.roles.sort((a, b) => (a.position ?? 0) - (b.position ?? 0)).forEach((r, idx) => {
      r.position = idx;
    });

    // Clean up member role mappings
    if (srv.memberRoles && typeof srv.memberRoles === 'object') {
      Object.keys(srv.memberRoles).forEach(handle => {
        if (Array.isArray(srv.memberRoles[handle])) {
          srv.memberRoles[handle] = srv.memberRoles[handle].filter(id => id !== roleId);
          if (srv.memberRoles[handle].length === 0) delete srv.memberRoles[handle];
        }
      });
    }

    this.saveServers();
    this._syncServerRoles(srv);
    this.notify({ type: 'server-roles-updated', serverId, roleId });
    return true;
  }

  reorderServerRoles(serverId, orderedRoleIds) {
    const srv = this.servers.find(s => s.id === serverId || s.inviteCode === serverId);
    if (!srv || !Array.isArray(srv.roles)) return false;

    orderedRoleIds.forEach((id, index) => {
      const r = srv.roles.find(role => role.id === id);
      if (r) r.position = index;
    });

    this.saveServers();
    this._syncServerRoles(srv);
    this.notify({ type: 'server-roles-updated', serverId });
    return true;
  }

  getMemberRoles(serverId, handle) {
    if (!serverId || !handle) return [];
    const srv = this.servers.find(s => s.id === serverId || s.inviteCode === serverId);
    if (!srv || !srv.memberRoles) return [];
    const cleanH = handle.toLowerCase();
    const roleIds = srv.memberRoles[cleanH] || srv.memberRoles['@' + cleanH.replace('@', '')] || [];
    const allRoles = this.getServerRoles(serverId);
    return allRoles.filter(r => roleIds.includes(r.id));
  }

  getMemberHighestRole(serverId, handle) {
    if (!serverId || !handle) return null;
    const srv = this.servers.find(s => s.id === serverId || s.inviteCode === serverId);
    if (!srv) return null;

    const roles = this.getMemberRoles(serverId, handle);
    if (roles.length > 0) {
      // Return highest role (smallest position number)
      return roles[0];
    }
    return null;
  }

  assignMemberRole(serverId, handle, roleId) {
    const srv = this.servers.find(s => s.id === serverId || s.inviteCode === serverId);
    if (!srv || !handle || !roleId) return false;

    if (!srv.memberRoles || typeof srv.memberRoles !== 'object') {
      srv.memberRoles = {};
    }

    const cleanH = handle.startsWith('@') ? handle.toLowerCase() : '@' + handle.toLowerCase();
    if (!Array.isArray(srv.memberRoles[cleanH])) {
      srv.memberRoles[cleanH] = [];
    }

    if (!srv.memberRoles[cleanH].includes(roleId)) {
      srv.memberRoles[cleanH].push(roleId);
      this.saveServers();
      this._syncServerRoles(srv);
      this.notify();
    }
    return true;
  }

  removeMemberRole(serverId, handle, roleId) {
    const srv = this.servers.find(s => s.id === serverId || s.inviteCode === serverId);
    if (!srv || !srv.memberRoles || !handle || !roleId) return false;

    const cleanH = handle.startsWith('@') ? handle.toLowerCase() : '@' + handle.toLowerCase();
    if (Array.isArray(srv.memberRoles[cleanH])) {
      srv.memberRoles[cleanH] = srv.memberRoles[cleanH].filter(id => id !== roleId);
      if (srv.memberRoles[cleanH].length === 0) {
        delete srv.memberRoles[cleanH];
      }
      this.saveServers();
      this._syncServerRoles(srv);
      this.notify();
    }
    return true;
  }

  checkServerPermission(serverId, handle, permKey) {
    if (!serverId) return true;
    const srv = this.servers.find(s => s.id === serverId || s.inviteCode === serverId);
    if (!srv) return true;

    const targetH = handle ? (handle.startsWith('@') ? handle.toLowerCase() : '@' + handle.toLowerCase()) : (this.currentUser ? this.currentUser.handle.toLowerCase() : '');
    const cleanTarget = targetH.replace('@', '');

    // Sunucu sahibi her zaman tam yetkilidir
    if (this.isServerOwner(srv.id, targetH)) return true;

    const roles = this.getMemberRoles(srv.id, targetH);
    for (const r of roles) {
      if (r.permissions) {
        if (r.permissions.manage_server === true) return true;
        if (r.permissions[permKey] === true) {
          return true;
        }
      }
    }

    // Default permissions
    if (permKey === 'send_messages' || permKey === 'connect_voice' || permKey === 'speak_voice') {
      return true;
    }
    return false;
  }

  _syncServerRoles(srv) {
    if (!srv) return;
    if (srv.inviteCode) {
      const registry = this._loadInviteRegistry();
      if (registry[srv.inviteCode]) {
        registry[srv.inviteCode].roles = JSON.parse(JSON.stringify(srv.roles || []));
        registry[srv.inviteCode].memberRoles = JSON.parse(JSON.stringify(srv.memberRoles || {}));
        ziorseSetStorage('ziorse_invite_registry', registry);
      }
    }
    if (window.socket) {
      window.socket.emit('sync-server-roles', {
        serverId: srv.id,
        inviteCode: srv.inviteCode,
        roles: srv.roles || [],
        memberRoles: srv.memberRoles || {}
      });
    }
  }

  getFilteredPosts(page = 0, pageSize = 0) {
    let list = this.posts;

    // Filter out blocked users
    if (this.blockedList && this.blockedList.length > 0) {
      list = list.filter(p => !this.blockedList.includes(p.handle));
    }

    if (this.activeServerId !== 'home') {
      const srv = this.servers.find(s => s.id === this.activeServerId);
      const serverScopeId = (srv && (srv.inviteCode || srv.id)) || this.activeServerId;
      const targetScopeKey = serverScopeId + ':' + (this.activeChannelId || 'genel');
      return list.filter(p => {
        if (!p.serverChannelKey) return false;
        if (p.serverChannelKey === targetScopeKey) return true;
        // Eski kayıtlı mesajlar için geriye dönük uyumluluk
        if (srv && p.serverChannelKey === (srv.id + ':' + (this.activeChannelId || 'genel'))) return true;
        return false;
      });
    }

    if (this.activeFilter === 'following') {
      list = list.filter(p => this.followedHandles.includes(p.handle) || p.handle === this.currentUser.handle);
    } else if (this.activeFilter === 'saved') {
      list = list.filter(p => p.isSaved);
    } else if (this.activeFilter.startsWith('profile:')) {
      const handle = this.activeFilter.replace('profile:', '');
      list = list.filter(p => p.handle === handle);
    } else if (this.activeFilter.startsWith('hashtag:')) {
      const tag = this.activeFilter.replace('hashtag:', '').toLowerCase();
      list = list.filter(p => p.content && p.content.toLowerCase().includes('#' + tag));
    } else if (this.activeFilter === 'for-you') {
      list = list.filter(p => !p.serverChannelKey);
    }

    // Pinned posts bubble to top
    list = [...list.filter(p => p.isPinned), ...list.filter(p => !p.isPinned)];

    // Pagination
    if (pageSize > 0) {
      return list.slice(page * pageSize, (page + 1) * pageSize);
    }

    return list;
  }

  addPost(content, codeSnippet = null, image = null, audio = null, replyingTo = null, video = null, file = null) {
    if (!this.currentUser) return null;
    let scopeKey = null;
    if (this.activeServerId !== 'home') {
      const srv = this.servers.find(s => s.id === this.activeServerId);
      const serverScopeId = (srv && (srv.inviteCode || srv.id)) || this.activeServerId;
      scopeKey = serverScopeId + ':' + (this.activeChannelId || 'genel');
    }
    const safeCodeSnippet = (codeSnippet && typeof codeSnippet === 'string' && codeSnippet.length > 8000)
      ? codeSnippet.substring(0, 8000) + '\n// ... (kod boyutu optimize edildi)'
      : codeSnippet;

    const newPost = {
      id: 'post-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      author: this.currentUser.name || 'Kullanıcı',
      handle: this.currentUser.handle || '@kullanici',
      avatar: this.currentUser.avatar || DEFAULT_AVATAR,
      content: content,
      timestamp: new Date().toISOString(),
      likes: 0,
      reposts: 0,
      repliesCount: 0,
      isLiked: false,
      isReposted: false,
      isSaved: false,
      category: this.activeFilter,
      serverChannelKey: scopeKey,
      image: image,
      video: video,
      file: file,
      codeSnippet: safeCodeSnippet,
      audio: audio,
      replyingTo: replyingTo,
      reactions: {},
      userReactions: [],
      comments: []
    };

    this.posts.unshift(newPost);
    this.currentUser.postCount = (this.currentUser.postCount || 0) + 1;
    ziorseSetStorage(this.storageKeyUser, this.currentUser);
    this.savePosts();
    this.notify();
    return newPost;
  }

  toggleReaction(postId, emoji) {
    const post = this.posts.find(p => p.id === postId);
    if (post) {
      if (!post.reactions) post.reactions = {};
      if (!post.userReactions) post.userReactions = [];

      // Calculate total reaction count
      const totalCount = Object.values(post.reactions).reduce((a, b) => a + b, 0);

      if (post.userReactions.includes(emoji)) {
        post.userReactions = post.userReactions.filter(e => e !== emoji);
        post.reactions[emoji] = Math.max(0, (post.reactions[emoji] || 1) - 1);
        if (post.reactions[emoji] === 0) delete post.reactions[emoji];
      } else {
        // ENFORCE MAXIMUM 15 EMOJI REACTIONS PER MESSAGE
        if (totalCount >= 15) {
          return { error: 'Maksimum 15 emoji sınırına ulaşıldı!' };
        }
        post.userReactions.push(emoji);
        post.reactions[emoji] = (post.reactions[emoji] || 0) + 1;
      }
      this.savePosts();
      this.notify({ type: 'post-reaction', postId, emoji });
      return { success: true };
    }
  }

  addComment(postId, text, parentCommentId = null) {
    const post = this.posts.find(p => p.id === postId);
    if (post && text.trim()) {
      if (!post.comments) post.comments = [];
      const newComment = {
        id: 'cmt-' + Date.now(),
        author: this.currentUser.name,
        handle: this.currentUser.handle,
        avatar: this.currentUser.avatar,
        text: text.trim(),
        timestamp: new Date().toISOString(),
        parentCommentId: parentCommentId
      };
      post.comments.push(newComment);
      post.repliesCount += 1;
      this.savePosts();
      this.notify({ type: 'comment-added', postId, comment: newComment });
    }
  }

  deletePost(postId) {
    this.posts = this.posts.filter(p => p.id !== postId);
    this.savePosts();
    this.notify({ type: 'post-deleted', postId });
  }

  editPost(postId, newContent) {
    const post = this.posts.find(p => p.id === postId);
    if (post && post.handle === this.currentUser.handle) {
      if (!post.editHistory) post.editHistory = [];
      post.editHistory.push({ content: post.content, editedAt: new Date().toISOString() });
      post.content = newContent;
      post.editedAt = new Date().toISOString();
      this.savePosts();
      this.notify({ type: 'post-edited', postId, newContent });
      return true;
    }
    return false;
  }

  togglePin(postId) {
    const post = this.posts.find(p => p.id === postId);
    if (post) {
      post.isPinned = !post.isPinned;
      this.savePosts();
      this.notify({ type: 'post-pinned', postId, isPinned: post.isPinned });
      return post.isPinned;
    }
    return false;
  }

  // ── BLOCK SYSTEM ──────────────────────────────────────────
  loadBlocked() {
    try {
      const raw = ziorseGetStorage(this.storageKeyBlocked);
      return (typeof raw === 'string' ? JSON.parse(raw) : raw) || [];
    } catch { return []; }
  }

  saveBlocked() {
    ziorseSetStorage(this.storageKeyBlocked, this.blockedList);
  }

  blockUser(handle) {
    const h = handle.startsWith('@') ? handle : '@' + handle;
    if (!this.blockedList.includes(h)) {
      this.blockedList.push(h);
      this.saveBlocked();
      this.notify();
    }
  }

  unblockUser(handle) {
    const h = handle.startsWith('@') ? handle : '@' + handle;
    this.blockedList = this.blockedList.filter(b => b !== h);
    this.saveBlocked();
    this.notify();
  }

  isBlocked(handle) {
    const h = handle.startsWith('@') ? handle : '@' + handle;
    return this.blockedList.includes(h);
  }

  // ── USER STATUS ────────────────────────────────────────────
  loadStatus() {
    try {
      const saved = ziorseGetStorage(this.storageKeyStatus);
      return (typeof saved === 'string' ? JSON.parse(saved) : saved) || { type: 'online', text: '' };
    } catch { return { type: 'online', text: '' }; }
  }

  setStatus(type, text = '') {
    this.userStatus = { type, text };
    ziorseSetStorage(this.storageKeyStatus, this.userStatus);

    if (this.currentUser) {
      this.currentUser.status = this.userStatus;
      this._saveToGlobalDirectory(this.currentUser);
    }

    try {
      if (window.socket) {
        window.socket.emit('user-status-changed', {
          handle: this.currentUser?.handle,
          type,
          text
        });
      }
    } catch (e) { }

    this.notify({ type: 'status-updated', status: this.userStatus });
  }

  // ── NOTIFICATIONS ─────────────────────────────────────────
  isNotificationsMuted() {
    return ziorseGetStorage('ziorse_notifs_muted') === 'true';
  }

  toggleNotificationsMuted() {
    const current = this.isNotificationsMuted();
    const next = !current;
    ziorseSetStorage('ziorse_notifs_muted', next ? 'true' : 'false');
    this.notify({ type: 'notifications-muted-changed', muted: next });
    return next;
  }

  loadNotifications() {
    try {
      const raw = ziorseGetStorage(this.storageKeyNotifications);
      return (typeof raw === 'string' ? JSON.parse(raw) : raw) || [];
    } catch { return []; }
  }

  saveNotifications() {
    if (this.notifications.length > 50) this.notifications = this.notifications.slice(0, 50);
    ziorseSetStorage(this.storageKeyNotifications, this.notifications);
  }

  addNotification(type, title, body, meta = {}) {
    const notif = {
      id: 'notif-' + Date.now(),
      type, // 'dm', 'friend_request', 'like', 'comment', 'mention'
      title,
      body,
      meta,
      timestamp: new Date().toISOString(),
      read: false
    };
    this.notifications.unshift(notif);
    this.saveNotifications();
    this.notify({ type: 'notification-added', notif });
    // Fire Electron native notification if available and not muted
    if (!this.isNotificationsMuted() && window.electronAPI && window.electronAPI.sendNotification) {
      window.electronAPI.sendNotification({ title, body });
    }
    return notif;
  }

  markNotificationsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
    this.notify({ type: 'notifications-read' });
  }

  get unreadNotificationCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  toggleLike(postId) {
    const post = this.posts.find(p => p.id === postId);
    if (post) {
      post.isLiked = !post.isLiked;
      post.likes += post.isLiked ? 1 : -1;
      this.savePosts();
      this.notify({ type: 'post-liked', postId, post });
    }
  }

  toggleRepost(postId) {
    const post = this.posts.find(p => p.id === postId);
    if (post) {
      post.isReposted = !post.isReposted;
      post.reposts += post.isReposted ? 1 : -1;
      this.savePosts();
      this.notify({ type: 'post-reposted', postId, post });
    }
  }

  toggleSave(postId) {
    const post = this.posts.find(p => p.id === postId);
    if (post) {
      post.isSaved = !post.isSaved;
      this.savePosts();
      this.notify({ type: 'post-saved', postId, post });
    }
  }

  sendDM(threadId, text) {
    const thread = this.dmThreads.find(t => t.id === threadId);
    if (thread && text.trim()) {
      const messages = this.getThreadMessages(thread.user.handle);
      messages.push({
        sender: 'me',
        senderHandle: this.currentUser.handle,
        text: text.trim(),
        timestamp: new Date().toISOString()
      });
      this.saveThreadMessages(thread.user.handle, messages);
      this.saveDMs();
      this.notify();
    }
  }

  setTheme(themeName) {
    this.theme = themeName;
    ziorseSetStorage(this.storageKeyTheme, themeName);
    this.notify();
  }

  subscribe(cb) {
    this.listeners.push(cb);
  }

  notify(event = { type: 'all' }) {
    if (!this._pendingEvents) this._pendingEvents = [];
    this._pendingEvents.push(event);
    if (this._notifyPending) return;
    this._notifyPending = true;
    queueMicrotask(() => {
      this._notifyPending = false;
      const events = this._pendingEvents || [{ type: 'all' }];
      this._pendingEvents = [];
      for (const ev of events) {
        for (let i = 0; i < this.listeners.length; i++) {
          try {
            this.listeners[i](ev);
          } catch (err) {
            console.error('[DataStore Notify Error]', err);
          }
        }
      }
    });
  }
}

window.DataStore = DataStore;
if (!window.dataStore) {
  window.dataStore = new DataStore();
}

// 🖥️ Global Screen Size & Fullscreen/Maximized Engine for all HTML pages
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  function ziorseUpdateScreenClasses() {
    const isLarge = window.innerWidth >= 1400;
    const isUltra = window.innerWidth >= 1800;
    if (document.documentElement) {
      document.documentElement.classList.toggle('large-screen', isLarge);
      document.documentElement.classList.toggle('ultra-screen', isUltra);
    }
  }
  if (window.addEventListener) window.addEventListener('resize', ziorseUpdateScreenClasses);
  if (document.readyState === 'loading') {
    if (document.addEventListener) document.addEventListener('DOMContentLoaded', ziorseUpdateScreenClasses);
  } else {
    ziorseUpdateScreenClasses();
  }
  if (window.electronAPI && window.electronAPI.onWindowMaximizedState) {
    window.electronAPI.onWindowMaximizedState((isMax) => {
      if (document.documentElement) document.documentElement.classList.toggle('app-maximized', isMax);
    });
  }
}

