/**
 * Ziorse Desktop Social Network
 */

document.addEventListener('DOMContentLoaded', () => {
  // ── TEMEL ELEMANLAR ──────────────────────────────────────────
  const body = document.body;
  const appLayoutEl = document.querySelector('.app-layout');
  const btnToggleTheme = document.getElementById('btn-toggle-theme');
  const toastContainer = document.getElementById('toast-container');

  const feedPostsContainer = document.getElementById('feed-posts-container');
  const feedTitleText = document.getElementById('feed-title-text');
  const composerCard = document.getElementById('composer-card');
  const composerReplyBar = document.getElementById('composer-reply-bar');
  const composerReplyAvatar = document.getElementById('composer-reply-avatar');
  const composerReplyAuthor = document.getElementById('composer-reply-author');
  const composerReplyText = document.getElementById('composer-reply-text');
  const btnCancelReply = document.getElementById('btn-cancel-reply');
  const postComposerText = document.getElementById('composer-text');
  const codeAttachInput = document.getElementById('code-attach-input');
  const codeAttachWrapper = document.getElementById('code-attach-wrapper');
  const btnCloseCode = document.getElementById('btn-close-code');
  const pollAttachContainer = document.getElementById('poll-attach-container');
  const btnClosePoll = document.getElementById('btn-close-poll');
  const pollOpt1 = document.getElementById('poll-opt-1');
  const pollOpt2 = document.getElementById('poll-opt-2');
  const btnAttachCode = document.getElementById('btn-attach-code');
  const btnToggleExtraTools = document.getElementById('btn-toggle-extra-tools');
  const composerExtraDrawer = document.getElementById('composer-extra-drawer');
  const btnAttachImage = document.getElementById('btn-attach-image');
  const btnAttachVideo = document.getElementById('btn-attach-video');
  const btnAttachFile = document.getElementById('btn-attach-file');
  const btnRecordVoice = document.getElementById('btn-record-voice');
  const btnAttachPoll = document.getElementById('btn-attach-poll');
  const filePickerImage = document.getElementById('file-picker-image');
  const filePickerVideo = document.getElementById('file-picker-video');
  const filePickerFile = document.getElementById('file-picker-file');
  const imagePreviewBar = document.getElementById('image-preview-bar');
  const imagePreviewImg = document.getElementById('image-preview-img');
  const btnRemoveImage = document.getElementById('btn-remove-image');
  const filePreviewBar = document.getElementById('file-preview-bar');
  const filePreviewName = document.getElementById('file-preview-name');
  const btnRemoveFile = document.getElementById('btn-remove-file');
  const voiceRecordingBar = document.getElementById('voice-recording-bar');
  const btnSendPost = document.getElementById('btn-send-post');

  const modalLightbox = document.getElementById('modal-lightbox');
  const lightboxTargetImg = document.getElementById('lightbox-target-img');
  const btnCloseLightbox = document.getElementById('btn-close-lightbox');

  const modalCreateServer = document.getElementById('modal-create-server');
  const btnOpenCreateServer = document.getElementById('btn-open-create-server');
  const btnCloseModalServer = document.getElementById('btn-close-modal-server');
  const newServerNameInput = document.getElementById('new-server-name-input');
  const btnSubmitCreateServer = document.getElementById('btn-submit-create-server');

  const modalCreateVoice = document.getElementById('modal-create-voice');
  const btnOpenCreateVoice = document.getElementById('btn-open-create-voice');
  const btnCloseModalVoice = document.getElementById('btn-close-modal-voice');
  const newVoiceNameInput = document.getElementById('new-voice-name-input');
  const btnSubmitCreateVoice = document.getElementById('btn-submit-create-voice');

  const navRailIcons = document.querySelectorAll('.server-icon[data-nav]');
  const channelNavItems = document.querySelectorAll('.nav-item[data-channel]');
  const feedTabs = document.querySelectorAll('.tab-btn');

  const mainFeedView = document.getElementById('main-feed-view');
  const dmView = document.getElementById('dm-view');

  const modalPost = document.getElementById('modal-create-post');
  const btnOpenModalPost = document.getElementById('btn-open-post-modal');
  const btnCloseModalPost = document.getElementById('btn-close-modal-post');

  const btnOpenAuth = document.getElementById('btn-open-auth');
  const headerLocationBreadcrumb = document.getElementById('header-location-breadcrumb');
  const userProfileBar = document.getElementById('user-profile-bar');
  const btnUserMic = document.getElementById('btn-user-mic');
  const btnUserDeafen = document.getElementById('btn-user-deafen');
  const btnVoiceDisconnect = document.getElementById('btn-voice-disconnect');
  const btnUserSettings = document.getElementById('btn-user-settings');
  const userAvatarDisplay = document.getElementById('user-avatar-display');
  const userStatusDotMini = document.getElementById('user-status-dot-mini');
  const userNameDisplay = document.getElementById('user-name-display');
  const userHandleDisplay = document.getElementById('user-handle-display');
  const composerUserAvatar = document.getElementById('composer-user-avatar');

  const serversListContainer = document.getElementById('servers-list-container');
  const currentServerName = document.getElementById('current-server-name');
  const voiceChannelsContainer = document.getElementById('voice-channels-container');
  const onlineMembersContainer = document.getElementById('online-members-container');
  const voiceActiveBar = document.getElementById('voice-active-bar');
  const voiceActiveName = document.getElementById('voice-active-name');
  const btnShareScreen = document.getElementById('btn-share-screen');
  const btnMuteMic = document.getElementById('btn-mute-mic');
  const btnDeafenVoice = document.getElementById('btn-deafen-voice');
  const btnLeaveVoice = document.getElementById('btn-leave-voice');

  // ── DM ELEMANLAR ─────────────────────────────────────────────
  const dmTabFriends = document.getElementById('dm-tab-friends');
  const dmTabIncoming = document.getElementById('dm-tab-incoming');
  const dmTabOutgoing = document.getElementById('dm-tab-outgoing');
  const dmIncomingBadge = document.getElementById('dm-incoming-badge');
  const dmChatMessages = document.getElementById('dm-chat-messages');
  const dmChatUserTitle = document.getElementById('dm-chat-user-title');
  const dmInputBar = document.getElementById('dm-input-bar');
  const dmInputText = document.getElementById('dm-input-text');
  const dmSendBtn = document.getElementById('btn-dm-send') || document.getElementById('dm-send-btn');
  const btnDmAttachImage = document.getElementById('btn-dm-attach-image');
  const btnDmAttachVideo = document.getElementById('btn-dm-attach-video');
  const btnDmAttachFile = document.getElementById('btn-dm-attach-file');
  const dmFileImage = document.getElementById('dm-file-image');
  const dmFileVideo = document.getElementById('dm-file-video');
  const dmFileAny = document.getElementById('dm-file-any');
  const dmAttachPreviewBar = document.getElementById('dm-attach-preview-bar');
  const dmAttachPreviewContent = document.getElementById('dm-attach-preview-content');
  const btnDmRemoveAttach = document.getElementById('btn-dm-remove-attach');

  // ── STATE ─────────────────────────────────────────────────────
  let activeDmThreadId = null;
  let activeDmTab = 'friends';
  let attachedImageDataUrl = null;
  let attachedVideoDataUrl = null;
  let attachedFileData = null;
  let dmAttachedImage = null;
  let dmAttachedVideo = null;
  let dmAttachedFile = null;

  // ── RELIABLE DISCORD-GRADE AUTO-SCROLL HELPER ──────────────────
  function scrollContainerToBottom(container) {
    if (!container) return;
    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
      setTimeout(() => {
        if (container) container.scrollTop = container.scrollHeight;
      }, 30);
      setTimeout(() => {
        if (container) container.scrollTop = container.scrollHeight;
      }, 120);
    });
  }

  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
  let currentViewingProfileHandle = null;
  let activeReplyTarget = null;
  let expandedCommentsPosts = {};
  let activePopoverPostId = null;
  let attachedAudioData = null;
  let attachedPoll = null;
  let newAvatarDataUrl = null;
  let newBannerDataUrl = null;
  let mediaRecorder = null;
  let audioChunks = [];
  let isMicMuted = false;
  let isDeafened = false;
  let screenStream = null;
  let connectedVoiceChannelId = null;
  let connectedVoiceRoomKey = null;

  // ── SES ETKİNLİĞİ ALGILAMA (VAD - Voice Activity Detection) ──
  let voiceMicStream = null;
  let voiceAudioCtx = null;
  let voiceAnalyser = null;
  let voiceVadInterval = null;
  let isSpeakingNow = false;

  function updateVoiceSpeakingUI(speaking, force = false) {
    if (!force && isSpeakingNow === speaking) return;
    isSpeakingNow = speaking;
    if (window.socket && connectedVoiceRoomKey && window.dataStore.currentUser) {
      window.socket.emit('voice-vad-state', {
        roomKey: connectedVoiceRoomKey,
        channelId: connectedVoiceChannelId,
        handle: window.dataStore.currentUser.handle,
        isSpeaking: speaking && !isMicMuted && !isDeafened,
        isMuted: isMicMuted,
        isDeafened: isDeafened
      });
    }
    const myHandle = (window.dataStore.currentUser && window.dataStore.currentUser.handle || '').toLowerCase();
    const myVoiceItems = document.querySelectorAll(`.ch-voice-user-item[data-handle="${myHandle}"]`);
    myVoiceItems.forEach(item => {
      const wrap = item.querySelector('.ch-voice-avatar-wrap');
      if (wrap) {
        if (speaking && !isMicMuted && !isDeafened) {
          wrap.classList.add('speaking');
        } else {
          wrap.classList.remove('speaking');
        }
      }
    });
  }

  function startVoiceVAD() {
    stopVoiceVAD();
    if (isMicMuted || isDeafened) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      voiceMicStream = stream;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      voiceAudioCtx = new AudioCtx();
      if (voiceAudioCtx.state === 'suspended') {
        voiceAudioCtx.resume().catch(() => { });
      }
      const source = voiceAudioCtx.createMediaStreamSource(stream);
      voiceAnalyser = voiceAudioCtx.createAnalyser();
      voiceAnalyser.fftSize = 256;
      source.connect(voiceAnalyser);

      const buffer = new Uint8Array(voiceAnalyser.frequencyBinCount);
      let silenceTimer = null;

      voiceVadInterval = setInterval(() => {
        if (!connectedVoiceChannelId || isMicMuted || isDeafened) {
          updateVoiceSpeakingUI(false);
          return;
        }
        voiceAnalyser.getByteFrequencyData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
          sum += buffer[i];
        }
        const average = sum / buffer.length;
        // Mikrofon ses eşiği (konuşma tespiti)
        if (average > 15) {
          if (silenceTimer) { clearTimeout(silenceTimer); silenceTimer = null; }
          updateVoiceSpeakingUI(true);
        } else {
          if (!silenceTimer && isSpeakingNow) {
            silenceTimer = setTimeout(() => {
              updateVoiceSpeakingUI(false);
              silenceTimer = null;
            }, 180);
          }
        }
      }, 50);
    }).catch(err => {
      console.warn('[VAD] Mikrofon algilayici baslatilamadi:', err);
    });
  }

  function stopVoiceVAD() {
    if (voiceVadInterval) {
      clearInterval(voiceVadInterval);
      voiceVadInterval = null;
    }
    if (voiceMicStream) {
      voiceMicStream.getTracks().forEach(t => t.stop());
      voiceMicStream = null;
    }
    if (voiceAudioCtx) {
      voiceAudioCtx.close().catch(() => { });
      voiceAudioCtx = null;
    }
    updateVoiceSpeakingUI(false, true);
  }

  let socket = null;
  if (typeof io !== 'undefined') {
    socket = io('http://localhost:3000');
    window.socket = socket;

    socket.on('invite-registry-updated', (registry) => {
      window.__globalInviteRegistry = registry || {};
      if (registry && typeof registry === 'object') {
        ziorseSetStorage('ziorse_invite_registry', registry);
      }
      renderFeed();
      renderDMs();
    });

    socket.on('user-directory-updated', (dir) => {
      window.__globalUserDirectory = dir || {};
      if (dir && typeof dir === 'object') {
        ziorseSetStorage('ziorse_user_directory', dir);
        // Live in-place targeted update for any user whose media changed
        Object.keys(dir).forEach(h => {
          const uData = dir[h];
          if (uData && typeof window.updateLiveUserMedia === 'function') {
            window.updateLiveUserMedia(
              h,
              uData.avatar,
              uData.banner,
              uData.fontStyle,
              uData.nameColor,
              uData.nameEffects,
              uData.avatarFrame
            );
          }
        });
      }
      if (window.dataStore && window.dataStore.currentUser) {
        syncUserDisplay();
      }
      renderOnlineMembers();
      updateRightSidebar();
    });

    socket.on('user-status-updated', (data) => {
      if (data && data.handle) {
        const h = data.handle.startsWith('@') ? data.handle : '@' + data.handle;
        if (!window.__globalUserDirectory) window.__globalUserDirectory = {};
        if (window.__globalUserDirectory[h]) {
          window.__globalUserDirectory[h].status = { type: data.type || 'online', text: data.text || '' };
        }
        ziorseSetStorage('ziorse_user_directory', window.__globalUserDirectory);
        updateRightSidebar();
        renderOnlineMembers();
      }
    });

    socket.on('server-structure-updated', (data) => {
      if (data && data.inviteCode && window.dataStore && window.dataStore.servers) {
        const matched = window.dataStore.servers.find(s => s.inviteCode === data.inviteCode);
        if (matched) {
          if (data.categories) matched.categories = JSON.parse(JSON.stringify(data.categories));
          if (data.serverName) matched.name = data.serverName;
          if (data.serverIcon) matched.icon = data.serverIcon;
          if (data.serverBanner !== undefined) matched.banner = data.serverBanner;
          if (Array.isArray(data.roles)) matched.roles = JSON.parse(JSON.stringify(data.roles));
          if (data.memberRoles && typeof data.memberRoles === 'object') matched.memberRoles = JSON.parse(JSON.stringify(data.memberRoles));
          window.dataStore.saveServers();
          renderServers();
          if (window.dataStore.activeServerId === matched.id) {
            renderServerChannels(matched, window.dataStore.activeChannelId);
            updateRightSidebar();
          }
          updateActiveServerInRail(matched.id);
        }
      }
    });

    socket.on('server-roles-updated', (data) => {
      if (data && data.inviteCode && window.dataStore && window.dataStore.servers) {
        const matched = window.dataStore.servers.find(s => s.inviteCode === data.inviteCode || s.id === data.serverId);
        if (matched) {
          if (Array.isArray(data.roles)) matched.roles = JSON.parse(JSON.stringify(data.roles));
          if (data.memberRoles && typeof data.memberRoles === 'object') matched.memberRoles = JSON.parse(JSON.stringify(data.memberRoles));
          window.dataStore.saveServers();
          updateRightSidebar();
          renderFeed();
        }
      }
    });

    socket.on('invite-registry-updated', (registry) => {
      window.__globalInviteRegistry = registry || {};
      ziorseSetStorage('ziorse_invite_registry', window.__globalInviteRegistry);
      if (window.dataStore && Array.isArray(window.dataStore.servers) && registry) {
        let serversChanged = false;
        window.dataStore.servers.forEach(s => {
          if (s.inviteCode && registry[s.inviteCode]) {
            const reg = registry[s.inviteCode];
            if (reg.serverName && s.name !== reg.serverName) {
              s.name = reg.serverName;
              serversChanged = true;
            }
            if (reg.serverIcon && s.icon !== reg.serverIcon) {
              s.icon = reg.serverIcon;
              serversChanged = true;
            }
            if (reg.serverBanner !== undefined && s.banner !== reg.serverBanner) {
              s.banner = reg.serverBanner;
              serversChanged = true;
            }
            if (Array.isArray(reg.categories) && reg.categories.length > 0) {
              s.categories = JSON.parse(JSON.stringify(reg.categories));
              serversChanged = true;
            }
            if (Array.isArray(reg.roles)) {
              s.roles = JSON.parse(JSON.stringify(reg.roles));
              serversChanged = true;
            }
            if (reg.memberRoles && typeof reg.memberRoles === 'object') {
              s.memberRoles = JSON.parse(JSON.stringify(reg.memberRoles));
              serversChanged = true;
            }
          }
        });
        if (serversChanged) {
          window.dataStore.saveServers();
          renderServers();
          const activeSrv = window.dataStore.servers.find(s => s.id === window.dataStore.activeServerId);
          if (activeSrv) {
            renderServerChannels(activeSrv, window.dataStore.activeChannelId);
          }
          updateRightSidebar();
        }
      }
    });

    socket.on('server-members-updated', (membersMap) => {
      window.__globalServerMembers = membersMap || {};
      if (membersMap && typeof membersMap === 'object') {
        Object.keys(membersMap).forEach(code => {
          ziorseSetStorage('ziorse_srv_members_' + code, membersMap[code]);
          const mems = membersMap[code];
          const mLen = Array.isArray(mems) ? mems.length : 0;
          if (mLen > 0) {
            const s = (window.dataStore?.servers || []).find(srv => srv.inviteCode === code || srv.id === code);
            if (s) {
              s.members = mems;
              s.memberCount = mLen;
            }
            if (window.__globalInviteRegistry && window.__globalInviteRegistry[code]) {
              window.__globalInviteRegistry[code].memberCount = mLen;
            }
          }
        });
        if (window.dataStore) window.dataStore.saveServers();
      }
      updateRightSidebar();
      renderFeed();
      renderDMs();
    });

    socket.on('server-member-joined-event', (data) => {
      if (!window.__globalServerMembers) window.__globalServerMembers = {};
      window.__globalServerMembers[data.inviteCode] = data.members;
      if (data.inviteCode && data.members) {
        ziorseSetStorage('ziorse_srv_members_' + data.inviteCode, data.members);
        const mLen = Array.isArray(data.members) ? data.members.length : 0;
        const s = (window.dataStore?.servers || []).find(srv => srv.inviteCode === data.inviteCode || srv.id === data.inviteCode);
        if (s) {
          s.members = data.members;
          s.memberCount = mLen;
          if (window.dataStore) window.dataStore.saveServers();
        }
        if (window.__globalInviteRegistry && window.__globalInviteRegistry[data.inviteCode]) {
          window.__globalInviteRegistry[data.inviteCode].memberCount = mLen;
        }
      }
      updateRightSidebar();
      renderFeed();
      renderDMs();
      showToast(`🎉 ${data.member.name} (${data.member.handle}) sunucuya katıldı!`);
    });

    socket.on('online-users-updated', (handles) => {
      window.__globalOnlineHandles = handles || [];
      renderOnlineMembers();
      updateRightSidebar();
    });

    socket.on('voice-users-updated', (rooms) => {
      window.__globalVoiceRooms = rooms || {};
      const actSrvId = window.dataStore.activeServerId;
      if (actSrvId && actSrvId !== 'home') {
        const srvObj = window.dataStore.servers.find(s => s.id === actSrvId);
        if (srvObj) renderServerChannels(srvObj, window.dataStore.activeChannelId);
      }
    });

    socket.on('sync-all-posts', (serverPosts) => {
      if (Array.isArray(serverPosts) && serverPosts.length > 0) {
        const localPosts = window.dataStore.posts || [];
        const map = new Map();
        [...serverPosts, ...localPosts].forEach(p => {
          if (p && p.id) map.set(p.id, p);
        });
        window.dataStore.posts = Array.from(map.values()).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        window.dataStore.savePosts();
        renderFeed();
      }
    });

    function syncWithSocketServer() {
      if (!socket || !window.dataStore) return;
      if (window.dataStore.posts && window.dataStore.posts.length > 0) {
        socket.emit('sync-client-posts', window.dataStore.posts);
      }
      if (window.dataStore.currentUser) {
        const cu = window.dataStore.currentUser;
        socket.emit('sync-user-profile', {
          name: cu.name,
          handle: cu.handle,
          avatar: cu.avatar || '',
          banner: cu.banner || '',
          bio: cu.bio || '',
          followers: cu.followers || 0,
          following: cu.following || 0,
          status: window.dataStore.userStatus || { type: 'online', text: '' }
        });

        // Sunuculardaki üyeliklerimizi ve yerel üye listelerini backend'e bildir ve eşitle
        if (window.dataStore.servers && window.dataStore.servers.length > 0) {
          const myMemberships = window.dataStore.servers
            .filter(s => s.inviteCode)
            .map(s => {
              const sInfo = window.dataStore.getInviteInfo(s.inviteCode);
              const allLocalMembers = window.dataStore.getServerMembers(s.inviteCode);
              return {
                inviteCode: s.inviteCode,
                members: allLocalMembers,
                member: {
                  handle: cu.handle,
                  name: cu.name,
                  avatar: cu.avatar || ''
                },
                serverInfo: sInfo ? {
                  ...sInfo,
                  serverName: s.name,
                  serverIcon: s.icon,
                  serverBanner: s.banner || '',
                  categories: s.categories || sInfo.categories || [],
                  roles: s.roles || sInfo.roles || [],
                  memberRoles: s.memberRoles || sInfo.memberRoles || {}
                } : {
                  serverName: s.name,
                  serverIcon: s.icon,
                  serverBanner: s.banner || '',
                  ownerHandle: s.ownerHandle || cu.handle,
                  memberCount: allLocalMembers.length || 1,
                  categories: s.categories || [],
                  roles: s.roles || [],
                  memberRoles: s.memberRoles || {}
                }
              };
            });
          if (myMemberships.length > 0) {
            socket.emit('sync-my-server-memberships', myMemberships);
          }
        }
      }
    }

    socket.on('connect', () => {
      syncWithSocketServer();
      updateRightSidebar();
    });

    syncWithSocketServer();

    socket.on('new-post-event', (post) => {
      if (post && post.id) {
        const exists = (window.dataStore.posts || []).some(p => p.id === post.id);
        if (!exists) {
          window.dataStore.posts.unshift(post);
          window.dataStore.savePosts();
        }
      }
      renderFeed();
      renderRightSidebar();
    });

    socket.on('delete-post-event', (data) => {
      if (data && data.id) {
        window.dataStore.posts = (window.dataStore.posts || []).filter(p => p.id !== data.id);
        window.dataStore.savePosts();
        renderFeed();
      }
    });

    socket.on('receive-friend-request', (data) => {
      if (!data || !window.dataStore.currentUser) return;
      const myHandle = window.dataStore.currentUser.handle;
      const targetHandle = data.targetHandle.startsWith('@') ? data.targetHandle : '@' + data.targetHandle;
      if (myHandle.toLowerCase() === targetHandle.toLowerCase()) {
        const fromHandle = data.from.handle;
        if (!window.dataStore.friendRequests.incoming) window.dataStore.friendRequests.incoming = [];
        const exists = window.dataStore.friendRequests.incoming.some(r => r.handle === fromHandle);
        if (!exists) {
          window.dataStore.friendRequests.incoming.push({
            handle: data.from.handle,
            name: data.from.name,
            avatar: data.from.avatar,
            firstMessage: data.firstMessage || null,
            timestamp: data.timestamp || new Date().toISOString()
          });
          window.dataStore.saveFriendRequests();
          showToast(`${data.from.name} (${data.from.handle}) size arkadaşlık isteği gönderdi!`);
          renderDMs();
        }
      }
    });

    socket.on('friend-request-accepted', (data) => {
      if (!data || !window.dataStore.currentUser) return;
      const myHandle = window.dataStore.currentUser.handle;
      const targetHandle = data.targetHandle.startsWith('@') ? data.targetHandle : '@' + data.targetHandle;
      if (myHandle.toLowerCase() === targetHandle.toLowerCase()) {
        const fromHandle = data.from.handle;
        if (!window.dataStore.isFriend(fromHandle)) {
          window.dataStore.friends.push({
            handle: data.from.handle,
            name: data.from.name,
            avatar: data.from.avatar
          });
          window.dataStore.saveFriends();
        }
        window.dataStore.friendRequests.outgoing = (window.dataStore.friendRequests.outgoing || []).filter(r => r.handle !== fromHandle);
        window.dataStore.saveFriendRequests();
        window.dataStore.createDMThread(data.from.name, data.from.handle);
        showToast(`${data.from.name} arkadaşlık isteğinizi kabul etti!`);
        renderDMs();
      }
    });

    socket.on('receive-dm-live', (data) => {
      if (!data || !data.message || !data.fromHandle || !window.dataStore.currentUser) return;
      const myHandle = window.dataStore.currentUser.handle;
      const toHandle = data.toHandle ? (data.toHandle.startsWith('@') ? data.toHandle : '@' + data.toHandle) : '';
      const fromHandle = data.fromHandle.startsWith('@') ? data.fromHandle : '@' + data.fromHandle;

      if (toHandle.toLowerCase() === myHandle.toLowerCase()) {
        const msgs = window.dataStore.getThreadMessages(fromHandle);
        const exists = msgs.some(m => m.id === data.message.id);
        if (!exists) {
          const incomingMsg = {
            ...data.message,
            sender: 'other',
            senderHandle: fromHandle
          };
          msgs.push(incomingMsg);
          window.dataStore.saveThreadMessages(fromHandle, msgs);
        }

        // Alıcının DM listesinde bu arkadaş yoksa thread ekle
        let threads = window.dataStore.loadDMs();
        let thread = threads.find(t => t.user && t.user.handle.toLowerCase() === fromHandle.toLowerCase());
        if (!thread) {
          thread = window.dataStore.createDMThread(data.fromName || fromHandle.replace('@', ''), fromHandle);
          threads = window.dataStore.loadDMs();
        }
        window.dataStore.dmThreads = threads;
        window.dataStore.saveDMs();

        renderDMs();
        if (activeDmThreadId && thread && activeDmThreadId === thread.id) {
          const dmChatMessages = document.getElementById('dm-chat-messages');
          if (dmChatMessages) scrollContainerToBottom(dmChatMessages);
        } else {
          showToast(`💬 ${data.fromName || fromHandle}: ${data.message.text ? data.message.text.substring(0, 45) : 'Sunucu daveti'}`);
        }
      }
    });
  }

  // ── TEMA YÖNETİMİ (Koyu / Açık Mod Desteği) ───────────────────
  const savedTheme = localStorage.getItem('ziorse_theme') || (window.dataStore && window.dataStore.theme) || 'light';
  if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
  } else {
    body.classList.remove('dark-mode');
  }
  if (window.dataStore) {
    window.dataStore.theme = savedTheme;
  }

  if (btnToggleTheme) {
    const iconMoon = btnToggleTheme.querySelector('.theme-icon-moon');
    const iconSun = btnToggleTheme.querySelector('.theme-icon-sun');
    const updateThemeIconState = (isDark) => {
      if (iconMoon) iconMoon.style.display = isDark ? 'none' : 'inline-block';
      if (iconSun) iconSun.style.display = isDark ? 'inline-block' : 'none';
      btnToggleTheme.title = isDark ? 'Açık Temaya Geç' : 'Koyu Temaya Geç';
    };
    updateThemeIconState(body.classList.contains('dark-mode'));

    btnToggleTheme.addEventListener('click', () => {
      const isDark = body.classList.toggle('dark-mode');
      const nextTheme = isDark ? 'dark' : 'light';
      localStorage.setItem('ziorse_theme', nextTheme);
      if (window.dataStore) window.dataStore.theme = nextTheme;
      updateThemeIconState(isDark);
      showToast(isDark ? 'Karanlık tema aktif' : 'Aydınlık tema aktif');
    });
  }

  // ── RESPONSIVE & FULLSCREEN RESIZE ENGINE ────────────────────
  function updateScreenMode() {
    const w = window.innerWidth;
    const isLarge = w >= 1400 || (window.screen && w >= window.screen.availWidth - 40);
    const isUltra = w >= 1800;
    document.documentElement.classList.toggle('large-screen', isLarge);
    document.documentElement.classList.toggle('ultra-screen', isUltra);
  }
  window.addEventListener('resize', updateScreenMode);
  if (window.electronAPI?.onMaximizedChange) {
    window.electronAPI.onMaximizedChange((isMax) => {
      document.documentElement.classList.toggle('app-maximized', isMax);
      updateScreenMode();
    });
  }
  updateScreenMode();

  // ── YARDIMCI FONKSİYONLAR ────────────────────────────────────
  function showToast(message) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast-item';
    toast.innerHTML = `<i data-lucide="info" style="width:16px;height:16px;"></i><span>${escapeHtml(message)}</span>`;
    toastContainer.appendChild(toast);
    refreshIcons(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 250); }, 2800);
  }
  window.showGlobalToast = showToast;


  function refreshIcons(container) {
    if (window.lucide) {
      if (container && container.nodeType === 1) {
        window.lucide.createIcons({ root: container });
      } else {
        window.lucide.createIcons();
      }
    }
  }

  // ── Performance: debounce utility ──
  function debounce(fn, delay) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function normalizeMediaUrl(url) {
    if (!url || typeof url !== 'string') return '';
    if (url.startsWith('/uploads/')) return 'http://localhost:3000' + url;
    if (url.startsWith('uploads/')) return 'http://localhost:3000/' + url;
    return url;
  }
  window.normalizeMediaUrl = normalizeMediaUrl;

  function isVideoMedia(url) {
    if (!url || typeof url !== 'string') return false;
    return url.startsWith('data:video') || /\.(mp4|webm|mov|mkv)(\?.*)?$/i.test(url);
  }

  function renderMediaAvatarHtml(avatarUrl, className = 'user-avatar-sm', extraAttrs = '') {
    const rawUrl = normalizeMediaUrl(avatarUrl);
    const url = (rawUrl && rawUrl !== 'https://i.imgur.com/w3OhOmW.jpeg') ? rawUrl : window.DEFAULT_AVATAR;
    if (isVideoMedia(url)) {
      return `<video class="${className} media-avatar-video" src="${escapeHtml(url)}" autoplay loop muted playsinline onloadedmetadata="this.muted=true;this.play().catch(()=>{})" ${extraAttrs} style="object-fit:cover; border-radius:inherit; width:100%; height:100%; display:block; pointer-events:none;"></video>`;
    }
    return `<img class="${className}" src="${escapeHtml(url)}" alt="Avatar" onerror="this.onerror=null;this.src=window.DEFAULT_AVATAR;" ${extraAttrs} style="object-fit:cover; border-radius:inherit; width:100%; height:100%; display:block;">`;
  }

  window.FONT_FAMILIES = {
    'outfit': "'Outfit', sans-serif",
    'inter': "'Inter', sans-serif",
    'montserrat': "'Montserrat', sans-serif",
    'poppins': "'Poppins', sans-serif",
    'cinzel': "'Cinzel', serif",
    'playfair': "'Playfair Display', serif",
    'caveat': "'Caveat', cursive",
    'pacifico': "'Pacifico', cursive",
    'pixel': "'Press Start 2P', monospace",
    'cyber': "'Russo One', sans-serif",
    'orbitron': "'Orbitron', sans-serif",
    'neon': "'Righteous', cursive",
    'bebas': "'Bebas Neue', cursive",
    'terminal': "'JetBrains Mono', monospace",
    'fira': "'Fira Code', monospace",
    'architect': "'Architects Daughter', cursive",
    'cursive': "'Caveat', cursive",
    'serif': "'Cinzel', serif"
  };

  function applyUserNameStyling(element, fontStyle, nameColor, nameEffects, fallbackColor) {
    if (!element) return;
    const fontFamilies = window.FONT_FAMILIES || {};
    if (fontStyle && fontFamilies[fontStyle]) {
      element.style.fontFamily = fontFamilies[fontStyle];
    } else if (fontStyle === '' || fontStyle === 'none') {
      element.style.fontFamily = '';
    }

    const effects = Array.isArray(nameEffects) ? nameEffects : (nameEffects ? [nameEffects] : []);
    let textShadows = [];
    let extraLetterSpacing = '';
    const isGradient = nameColor && typeof nameColor === 'string' && nameColor.startsWith('linear-gradient');

    if (!isGradient) {
      if (effects.includes('neon')) {
        const glowColor = (nameColor && typeof nameColor === 'string' && nameColor.startsWith('#')) ? nameColor : '#8b5cf6';
        textShadows.push(`0 0 6px ${glowColor}99, 0 0 14px ${glowColor}4d`);
        extraLetterSpacing = '0.4px';
      }
      if (effects.includes('cartoon')) {
        textShadows.push('1.5px 1.5px 0 #0f172a');
        extraLetterSpacing = '0.5px';
      }
      if (effects.includes('pop')) {
        textShadows.push('2px 2px 0 #064e3b');
        extraLetterSpacing = '0.8px';
      }
      if (effects.includes('shadow')) {
        textShadows.push('0 2px 5px rgba(0, 0, 0, 0.3)');
        extraLetterSpacing = '0.4px';
      }
      if (effects.includes('glow')) {
        const glowColor = (nameColor && typeof nameColor === 'string' && nameColor.startsWith('#')) ? nameColor : '#00f2fe';
        textShadows.push(`0 0 10px ${glowColor}`);
      }
    }
    if (effects.includes('spaced')) {
      extraLetterSpacing = '1.5px';
    }
    element.style.textShadow = textShadows.join(', ') || 'none';
    element.style.letterSpacing = extraLetterSpacing || 'normal';

    if (isGradient) {
      element.style.backgroundImage = nameColor;
      element.style.webkitBackgroundClip = 'text';
      element.style.backgroundClip = 'text';
      element.style.webkitTextFillColor = 'transparent';
      element.style.color = 'transparent';
      element.style.display = 'inline-block';
    } else if (nameColor && nameColor !== 'none') {
      element.style.backgroundImage = 'none';
      element.style.webkitBackgroundClip = 'unset';
      element.style.backgroundClip = 'unset';
      element.style.webkitTextFillColor = nameColor;
      element.style.color = nameColor;
      element.style.display = 'inline-block';
    } else if (fallbackColor) {
      element.style.backgroundImage = 'none';
      element.style.webkitBackgroundClip = 'unset';
      element.style.backgroundClip = 'unset';
      element.style.webkitTextFillColor = fallbackColor;
      element.style.color = fallbackColor;
      element.style.display = '';
    } else {
      element.style.backgroundImage = 'none';
      element.style.webkitBackgroundClip = 'unset';
      element.style.backgroundClip = 'unset';
      element.style.webkitTextFillColor = '';
      element.style.color = '';
      element.style.display = '';
    }
  }
  window.applyUserNameStyling = applyUserNameStyling;

  window.FRAME_SCALES = window.FRAME_SCALES || {
    'Lord.png': 156,
    'Liaz.png': 139
  };

  async function initAppAvatarFrames() {
    try {
      if (window.electronAPI && typeof window.electronAPI.getAvatarFrames === 'function') {
        const frames = await window.electronAPI.getAvatarFrames();
        frames.forEach(f => {
          if (f.scale) window.FRAME_SCALES[f.id] = f.scale;
        });
      } else {
        const res = await fetch('http://localhost:3000/api/avatar-frames');
        const data = await res.json();
        (data.frames || []).forEach(f => {
          if (f.scale) window.FRAME_SCALES[f.id] = f.scale;
        });
      }
    } catch (e) { }
  }
  initAppAvatarFrames();

  function getFrameScale(frameSrc) {
    if (!frameSrc || frameSrc === 'none') return 140;
    const cleanName = String(frameSrc).split('/').pop().split('?')[0];
    return (window.FRAME_SCALES && window.FRAME_SCALES[cleanName]) || 140;
  }
  window.getFrameScale = getFrameScale;

  function renderAvatarFrameHtml(frameSrc) {
    if (!frameSrc || frameSrc === 'none') return '';
    let resolvedSrc = frameSrc;
    if (!resolvedSrc.includes('/') && !resolvedSrc.startsWith('data:')) {
      resolvedSrc = 'assets/avatar-frames/' + resolvedSrc;
    }
    const scale = getFrameScale(frameSrc);
    return `<img class="global-avatar-frame-overlay" src="${escapeHtml(resolvedSrc)}" alt="Frame" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); width:${scale}%; height:${scale}%; pointer-events:none; z-index:15; object-fit:contain; display:block;">`;
  }
  window.renderAvatarFrameHtml = renderAvatarFrameHtml;

  function applyAvatarFrameToContainer(container, frameSrc) {
    if (!container) return;
    const existingOverlay = container.querySelector('.global-avatar-frame-overlay');

    if (!frameSrc || frameSrc === 'none') {
      if (existingOverlay) existingOverlay.remove();
      return;
    }

    let resolvedSrc = frameSrc;
    if (!resolvedSrc.includes('/') && !resolvedSrc.startsWith('data:')) {
      resolvedSrc = `assets/avatar-frames/${resolvedSrc}`;
    }

    container.style.position = 'relative';
    container.style.overflow = 'visible';

    const innerMedia = container.querySelector('img:not(.global-avatar-frame-overlay), video');
    if (innerMedia) {
      innerMedia.style.borderRadius = '50%';
    }

    const scale = getFrameScale(frameSrc);

    if (existingOverlay) {
      if (existingOverlay.src !== resolvedSrc) existingOverlay.src = resolvedSrc;
      existingOverlay.style.width = `${scale}%`;
      existingOverlay.style.height = `${scale}%`;
      existingOverlay.style.display = 'block';
    } else {
      const frameImg = document.createElement('img');
      frameImg.className = 'global-avatar-frame-overlay';
      frameImg.src = resolvedSrc;
      frameImg.alt = 'Frame';
      frameImg.style.cssText = `position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); width:${scale}%; height:${scale}%; pointer-events:none; z-index:15; object-fit:contain; display:block;`;
      container.appendChild(frameImg);
    }
  }
  window.applyAvatarFrameToContainer = applyAvatarFrameToContainer;

  function getAuthorNameStyleAttr(prof, highestRole) {
    const fontFamilies = window.FONT_FAMILIES || {};
    let styles = [];
    if (prof?.fontStyle && fontFamilies[prof.fontStyle]) {
      styles.push(`font-family:${fontFamilies[prof.fontStyle]}`);
    }
    const eff = Array.isArray(prof?.nameEffects) ? prof.nameEffects : (prof?.nameEffects ? [prof.nameEffects] : []);
    let shadows = [];
    let extraLetterSpacing = '';
    const isGradient = prof?.nameColor && typeof prof.nameColor === 'string' && prof.nameColor.startsWith('linear-gradient');

    if (!isGradient) {
      if (eff.includes('neon')) {
        const gc = (prof?.nameColor && typeof prof.nameColor === 'string' && prof.nameColor.startsWith('#')) ? prof.nameColor : '#8b5cf6';
        shadows.push(`0 0 6px ${gc}99, 0 0 14px ${gc}4d`);
        extraLetterSpacing = '0.4px';
      }
      if (eff.includes('cartoon')) {
        shadows.push('1.5px 1.5px 0 #0f172a');
        extraLetterSpacing = '0.5px';
      }
      if (eff.includes('pop')) {
        shadows.push('2px 2px 0 #064e3b');
        extraLetterSpacing = '0.8px';
      }
      if (eff.includes('shadow')) {
        shadows.push('0 2px 5px rgba(0,0,0,0.3)');
        extraLetterSpacing = '0.4px';
      }
      if (eff.includes('glow')) {
        const gc = (prof?.nameColor && prof.nameColor.startsWith('#')) ? prof.nameColor : '#00f2fe';
        shadows.push(`0 0 10px ${gc}`);
      }
    }
    if (shadows.length) styles.push(`text-shadow:${shadows.join(', ')}`);
    if (eff.includes('spaced') || extraLetterSpacing) {
      styles.push(`letter-spacing:${extraLetterSpacing || '2px'}`);
    }

    if (isGradient) {
      styles.push(`background-image:${prof.nameColor}`);
      styles.push('-webkit-background-clip:text');
      styles.push('background-clip:text');
      styles.push('-webkit-text-fill-color:transparent');
      styles.push('color:transparent');
      styles.push('display:inline-block');
    } else if (prof?.nameColor && prof.nameColor !== 'none') {
      styles.push(`color:${prof.nameColor}`);
      styles.push(`-webkit-text-fill-color:${prof.nameColor}`);
      styles.push('display:inline-block');
    } else if (highestRole?.color) {
      styles.push(`color:${highestRole.color}`);
      styles.push('font-weight:600');
    }
    return styles.length ? `style="${styles.join('; ')}"` : '';
  }
  window.getAuthorNameStyleAttr = getAuthorNameStyleAttr;

  function applyAvatarToElement(imgOrContainer, avatarUrl) {
    if (!imgOrContainer) return;
    const rawUrl = normalizeMediaUrl(avatarUrl);
    const url = (rawUrl && rawUrl !== 'https://i.imgur.com/w3OhOmW.jpeg') ? rawUrl : window.DEFAULT_AVATAR;

    // Find the correct container
    let container = null;
    if (imgOrContainer.id === 'user-avatar-display' || imgOrContainer.id === 'user-avatar-wrap') {
      container = document.getElementById('user-avatar-wrap');
    } else if (imgOrContainer.id === 'composer-user-avatar' || imgOrContainer.id === 'composer-avatar-wrap') {
      container = document.getElementById('composer-avatar-wrap');
    } else if (imgOrContainer.id === 'popover-avatar' || imgOrContainer.id === 'popover-avatar-wrap') {
      container = document.getElementById('popover-avatar-wrap');
    } else if (imgOrContainer.tagName === 'DIV') {
      container = imgOrContainer;
    } else if (imgOrContainer.parentElement && (
      imgOrContainer.parentElement.id === 'user-avatar-wrap' ||
      imgOrContainer.parentElement.id === 'composer-avatar-wrap' ||
      imgOrContainer.parentElement.id === 'popover-avatar-wrap' ||
      imgOrContainer.parentElement.classList.contains('post-avatar-wrap') ||
      imgOrContainer.parentElement.classList.contains('dm-friend-avatar-wrap') ||
      imgOrContainer.parentElement.classList.contains('dm-msg-avatar-wrap') ||
      imgOrContainer.parentElement.classList.contains('comment-avatar-wrap')
    )) {
      container = imgOrContainer.parentElement;
    }

    if (!container) {
      // fallback: just update img src if not video
      if (imgOrContainer.tagName === 'IMG' && !isVideoMedia(url)) {
        if (imgOrContainer.src !== url) imgOrContainer.src = url;
      }
      return;
    }

    const isVid = isVideoMedia(url);
    const existingVid = container.querySelector('video.media-avatar-video');
    const existingImg = container.querySelector('img');

    if (isVid) {
      // Video avatar - reuse existing video element if possible
      if (existingVid) {
        if (existingVid.src !== url) existingVid.src = url;
        if (existingImg) existingImg.style.display = 'none';
      } else {
        // Only rebuild DOM if no video element exists
        if (existingImg) existingImg.style.display = 'none';
        const vid = document.createElement('video');
        vid.className = 'user-avatar-sm media-avatar-video';
        vid.src = url;
        vid.autoplay = true;
        vid.loop = true;
        vid.muted = true;
        vid.playsInline = true;
        vid.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;border-radius:inherit;pointer-events:none;display:block;';
        container.style.position = 'relative';
        container.appendChild(vid);
        vid.muted = true;
        vid.play().catch(() => { });
      }
    } else {
      // Image avatar - reuse existing img if possible
      if (existingVid) { existingVid.remove(); }
      if (existingImg) {
        if (existingImg.src !== url) existingImg.src = url;
        existingImg.style.display = 'block';
      } else {
        const img = document.createElement('img');
        img.className = 'user-avatar-sm';
        img.src = url;
        img.alt = 'Avatar';
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:inherit;display:block;';
        img.onerror = () => { img.src = 'https://i.imgur.com/w3OhOmW.jpeg'; };
        container.appendChild(img);
      }
    }
  }

  const statusDotColors = {
    online: '#22c55e',
    idle: '#eab308',
    dnd: '#ef4444',
    invisible: '#737373',
    offline: '#737373'
  };

  function syncUserDisplay() {
    const user = window.dataStore.currentUser;
    if (!user) return;
    if (userNameDisplay) {
      userNameDisplay.textContent = user.name || '';
      applyUserNameStyling(userNameDisplay, user.fontStyle, user.nameColor, user.nameEffects);
    }
    if (userHandleDisplay) userHandleDisplay.textContent = user.handle || '';
    if (userAvatarDisplay) applyAvatarToElement(userAvatarDisplay, user.avatar);
    if (composerUserAvatar) applyAvatarToElement(composerUserAvatar, user.avatar);

    const userAvatarWrap = document.getElementById('user-avatar-wrap');
    if (userAvatarWrap) {
      applyAvatarFrameToContainer(userAvatarWrap, user.avatarFrame);
    }
    const composerAvatarWrap = document.getElementById('composer-avatar-wrap');
    if (composerAvatarWrap) {
      applyAvatarFrameToContainer(composerAvatarWrap, user.avatarFrame);
    }

    // Status dot color update
    const userStatus = window.dataStore.userStatus || { type: 'online', text: '' };
    const stType = userStatus.type || 'online';
    const color = statusDotColors[stType] || '#22c55e';
    if (userStatusDotMini) {
      userStatusDotMini.style.backgroundColor = color;
      userStatusDotMini.style.setProperty('background-color', color, 'important');
      userStatusDotMini.title = `Durum: ${userStatus.text || stType}`;
    }

    const isLoggedIn = window.dataStore.isLoggedIn();
    if (btnOpenAuth) btnOpenAuth.style.display = isLoggedIn ? 'none' : '';
    if (userProfileBar) userProfileBar.style.display = isLoggedIn ? '' : 'none';
  }
  window.syncUserDisplay = syncUserDisplay;
  syncUserDisplay();

  // ── PROFILE BAR DROPDOWN ─────────────────────────────────────
  if (userProfileBar) {
    userProfileBar.addEventListener('click', (e) => {
      e.stopPropagation();
      const existing = document.getElementById('profile-bar-dropdown');
      if (existing) { existing.remove(); return; }

      const u = window.dataStore.currentUser || { name: 'Kullanıcı', handle: 'user', avatar: 'https://i.imgur.com/w3OhOmW.jpeg', banner: '', bio: '' };
      const isVidBanner = isVideoMedia(u.banner);
      const isImgBanner = u.banner && (u.banner.startsWith('http') || u.banner.startsWith('data:image'));
      const bannerStyle = isVidBanner
        ? `position:relative; overflow:hidden;`
        : (isImgBanner
          ? `background-image: url('${u.banner}'); background-size: cover; background-position: center;`
          : `background: ${u.banner || 'linear-gradient(135deg, #1e1e1e, #2d2d2d)'};`);

      const userStatus = window.dataStore.userStatus || { type: 'online', text: '' };
      const statusType = userStatus.type || 'online';
      const statusText = userStatus.text || '';

      const statusMap = {
        online: { label: 'Çevrimiçi', color: '#22c55e' },
        idle: { label: 'Boşta / Meşgul', color: '#eab308' },
        dnd: { label: 'Rahatsız Etmeyin', color: '#ef4444' },
        invisible: { label: 'Görünmez', color: '#737373' }
      };
      const curStatusInfo = statusMap[statusType] || statusMap.online;

      const dropdown = document.createElement('div');
      dropdown.id = 'profile-bar-dropdown';
      dropdown.className = 'profile-bar-dropdown';
      dropdown.innerHTML = `
        <div class="pbd-card-preview">
          <div class="pbd-banner" style="${bannerStyle}">
            ${isVidBanner ? `<video src="${escapeHtml(u.banner)}" autoplay loop muted playsinline style="position:absolute; top:0; left:0; width:100%; height:100%; object-fit:cover; pointer-events:none;"></video>` : ''}
          </div>
          <div class="pbd-header">
            <div class="avatar-wrapper-status pbd-avatar-wrap" style="width:50px; height:50px; border-radius:50%; overflow:visible; position:relative; flex-shrink:0;">
              ${renderMediaAvatarHtml(u.avatar, 'pbd-avatar')}
              <div class="discord-status-dot pbd-status-dot" style="background:${curStatusInfo.color}; z-index:2;"></div>
            </div>
            <div class="pbd-names">
              <span class="pbd-name">${escapeHtml(u.name)}</span>
              <span class="pbd-handle">@${escapeHtml((u.handle || '').replace('@', ''))}</span>
              ${statusText ? `<span class="pbd-custom-status-badge"> ${escapeHtml(statusText)}</span>` : ''}
            </div>
          </div>
          <div class="pbd-bio ${!u.bio ? 'pbd-bio--empty' : ''}">${escapeHtml(u.bio || 'Henüz biyografi eklenmedi.')}</div>
        </div>
        <div class="pbd-divider"></div>

        <!-- ANA MENÜ -->
        <div id="pbd-main-view" class="pbd-menu">
          <button id="pbd-btn-open-status" class="pbd-item pbd-item-status-trigger">
            <div class="pbd-trigger-left">
              <span class="status-dot-indicator" style="background:${curStatusInfo.color}; width:9px; height:9px; border-radius:50%; flex-shrink:0;"></span>
              <div class="pbd-trigger-texts">
                <span class="pbd-trigger-label">Durumu Değiştir</span>
                <span class="pbd-trigger-sub">${escapeHtml(statusText || curStatusInfo.label)}</span>
              </div>
            </div>
            <i data-lucide="chevron-right" style="width:14px;height:14px;color:var(--text-muted);margin-left:auto;"></i>
          </button>
          <button id="pbd-view" class="pbd-item">
            <i data-lucide="user" style="width:14px;height:14px;"></i> Profili Görüntüle
          </button>
          <button id="pbd-edit" class="pbd-item">
            <i data-lucide="settings" style="width:14px;height:14px;"></i> Profili Düzenle
          </button>
          <div class="pbd-divider" style="margin:2px 0;"></div>
          <button id="pbd-logout" class="pbd-item pbd-item--danger">
            <i data-lucide="log-out" style="width:14px;height:14px;"></i> Hesaptan Çık
          </button>
        </div>

        <!-- DURUM SEÇİM ALT MENÜSÜ -->
        <div id="pbd-status-view" class="pbd-status-view" style="display:none;">
          <div class="pbd-status-view-header">
            <button id="pbd-status-back-btn" class="pbd-back-btn" title="Geri">
              <i data-lucide="arrow-left" style="width:14px;height:14px;"></i>
            </button>
            <span class="pbd-view-title">Durumunu Seç</span>
          </div>

          <div class="pbd-status-menu">
            <div class="pbd-status-item ${statusType === 'online' ? 'active' : ''}" data-status="online">
              <span class="status-dot-indicator online"></span>
              <div class="pbd-status-info">
                <span class="pbd-status-title">Çevrimiçi</span>
              </div>
              ${statusType === 'online' ? '<i data-lucide="check" class="pbd-check-icon"></i>' : ''}
            </div>

            <div class="pbd-status-item ${statusType === 'idle' ? 'active' : ''}" data-status="idle">
              <span class="status-dot-indicator idle"></span>
              <div class="pbd-status-info">
                <span class="pbd-status-title">Boşta / Meşgul</span>
              </div>
              ${statusType === 'idle' ? '<i data-lucide="check" class="pbd-check-icon"></i>' : ''}
            </div>

            <div class="pbd-status-item ${statusType === 'dnd' ? 'active' : ''}" data-status="dnd">
              <span class="status-dot-indicator dnd"></span>
              <div class="pbd-status-info">
                <span class="pbd-status-title">Rahatsız Etmeyin</span>
              </div>
              ${statusType === 'dnd' ? '<i data-lucide="check" class="pbd-check-icon"></i>' : ''}
            </div>

            <div class="pbd-status-item ${statusType === 'invisible' ? 'active' : ''}" data-status="invisible">
              <span class="status-dot-indicator invisible"></span>
              <div class="pbd-status-info">
                <span class="pbd-status-title">Görünmez / Çevrimdışı</span>
              </div>
              ${statusType === 'invisible' ? '<i data-lucide="check" class="pbd-check-icon"></i>' : ''}
            </div>
          </div>

          <div class="pbd-custom-status-section">
            <div class="pbd-custom-status-row">
              <span class="pbd-custom-status-icon"></span>
              <input type="text" id="pbd-status-custom-input" class="pbd-custom-input" placeholder="Özel durum yaz..." maxlength="45" value="${escapeHtml(statusText)}">
              <button id="pbd-btn-set-status" class="pbd-status-save-btn" title="Kaydet">
                <i data-lucide="check" style="width:13px;height:13px;"></i>
              </button>
            </div>
          </div>
        </div>`;

      const rect = userProfileBar.getBoundingClientRect();
      const fitsBelow = (rect.bottom + 380) < window.innerHeight;
      if (fitsBelow) {
        dropdown.style.top = (rect.bottom + 8) + 'px';
        dropdown.style.bottom = 'auto';
      } else {
        dropdown.style.bottom = (window.innerHeight - rect.top + 8) + 'px';
        dropdown.style.top = 'auto';
      }
      dropdown.style.right = Math.max(10, window.innerWidth - rect.right) + 'px';
      document.body.appendChild(dropdown);
      refreshIcons(dropdown);

      const pbdName = dropdown.querySelector('.pbd-name');
      if (pbdName) applyUserNameStyling(pbdName, u.fontStyle, u.nameColor, u.nameEffects);
      const pbdAvWrap = dropdown.querySelector('.pbd-avatar-wrap');
      if (pbdAvWrap) applyAvatarFrameToContainer(pbdAvWrap, u.avatarFrame);

      const pbdMainView = dropdown.querySelector('#pbd-main-view');
      const pbdStatusView = dropdown.querySelector('#pbd-status-view');
      const btnOpenStatus = dropdown.querySelector('#pbd-btn-open-status');
      const btnBackStatus = dropdown.querySelector('#pbd-status-back-btn');

      btnOpenStatus?.addEventListener('click', (ev) => {
        ev.stopPropagation();
        pbdMainView.style.display = 'none';
        pbdStatusView.style.display = 'flex';
        refreshIcons(dropdown);
      });

      btnBackStatus?.addEventListener('click', (ev) => {
        ev.stopPropagation();
        pbdStatusView.style.display = 'none';
        pbdMainView.style.display = 'flex';
        refreshIcons(dropdown);
      });

      // Status seçim işlemleri
      dropdown.querySelectorAll('.pbd-status-item').forEach(btn => {
        btn.addEventListener('click', (ev) => {
          ev.stopPropagation();
          const status = btn.dataset.status;
          const customTxt = dropdown.querySelector('#pbd-status-custom-input')?.value.trim() || '';
          window.dataStore.setStatus(status, customTxt);
          if (window._statusSystem) window._statusSystem._applyCurrentStatus();
          syncUserDisplay();
          showToast(`Durum: ${btn.querySelector('.pbd-status-title')?.textContent || status}`);
          dropdown.remove();
          updateRightSidebar();
        });
      });

      dropdown.querySelector('#pbd-btn-set-status')?.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const customTxt = dropdown.querySelector('#pbd-status-custom-input')?.value.trim() || '';
        const currentSt = window.dataStore.userStatus?.type || 'online';
        window.dataStore.setStatus(currentSt, customTxt);
        if (window._statusSystem) window._statusSystem._applyCurrentStatus();
        syncUserDisplay();
        showToast(customTxt ? `Özel durum: "${customTxt}"` : 'Özel durum temizlendi');
        dropdown.remove();
        updateRightSidebar();
      });

      dropdown.querySelector('#pbd-status-custom-input')?.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') {
          ev.preventDefault();
          dropdown.querySelector('#pbd-btn-set-status')?.click();
        }
      });

      dropdown.querySelector('#pbd-view')?.addEventListener('click', () => {
        dropdown.remove();
        window.openModalView(`profile-view.html?handle=${encodeURIComponent(u.handle)}`);
      });
      dropdown.querySelector('#pbd-edit')?.addEventListener('click', () => {
        dropdown.remove();
        window.openModalView('settings.html');
      });
      dropdown.querySelector('#pbd-logout')?.addEventListener('click', () => {
        dropdown.remove();
        window.dataStore.logout();
      });

      setTimeout(() => {
        document.addEventListener('click', function h(evt) {
          if (!dropdown.contains(evt.target)) {
            dropdown.remove();
            document.removeEventListener('click', h);
          }
        });
      }, 0);
    });
  }

  // ── USER PROFILE BAR QUICK CONTROLS (MIC / DEAFEN / SETTINGS) ──
  if (btnUserMic) {
    btnUserMic.addEventListener('click', (e) => {
      e.stopPropagation();
      isMicMuted = !isMicMuted;
      btnUserMic.classList.toggle('muted', isMicMuted);
      if (btnMuteMic) {
        btnMuteMic.style.color = isMicMuted ? 'var(--accent-rose)' : 'var(--text-main)';
      }
      const actSrvId = window.dataStore.activeServerId;
      if (actSrvId && actSrvId !== 'home' && connectedVoiceChannelId) {
        const srvObj = window.dataStore.servers.find(s => s.id === actSrvId);
        if (srvObj) renderServerChannels(srvObj, window.dataStore.activeChannelId);
      }
      showToast(isMicMuted ? 'Mikrofon susturuldu' : 'Mikrofon açıldı');
    });
  }

  if (btnUserDeafen) {
    btnUserDeafen.addEventListener('click', (e) => {
      e.stopPropagation();
      isDeafened = !isDeafened;
      btnUserDeafen.classList.toggle('deafened', isDeafened);
      if (btnDeafenVoice) {
        btnDeafenVoice.style.color = isDeafened ? 'var(--accent-rose)' : 'var(--text-main)';
      }
      const actSrvId = window.dataStore.activeServerId;
      if (actSrvId && actSrvId !== 'home' && connectedVoiceChannelId) {
        const srvObj = window.dataStore.servers.find(s => s.id === actSrvId);
        if (srvObj) renderServerChannels(srvObj, window.dataStore.activeChannelId);
      }
      showToast(isDeafened ? 'Kulaklık kapatıldı (Sağırlaştırıldı)' : 'Kulaklık açıldı');
    });
  }

  function disconnectVoice() {
    if (connectedVoiceChannelId || connectedVoiceRoomKey) {
      const cu = window.dataStore.currentUser || { handle: '@kullanici' };
      if (window.socket) {
        window.socket.emit('leave-voice-channel', {
          roomKey: connectedVoiceRoomKey,
          channelId: connectedVoiceChannelId,
          handle: cu.handle
        });
      }
      connectedVoiceChannelId = null;
      connectedVoiceRoomKey = null;
      stopVoiceVAD();
      if (btnVoiceDisconnect) btnVoiceDisconnect.style.display = 'none';
      if (voiceActiveBar) voiceActiveBar.style.display = 'none';
      showToast('Ses kanalından ayrıldınız');
      const actSrvId = window.dataStore.activeServerId;
      if (actSrvId && actSrvId !== 'home') {
        const srvObj = window.dataStore.servers.find(s => s.id === actSrvId);
        if (srvObj) renderServerChannels(srvObj, window.dataStore.activeChannelId);
      }
    }
  }

  if (btnVoiceDisconnect) {
    btnVoiceDisconnect.addEventListener('click', (e) => {
      e.stopPropagation();
      disconnectVoice();
    });
  }

  if (btnLeaveVoice) {
    btnLeaveVoice.addEventListener('click', (e) => {
      e.stopPropagation();
      disconnectVoice();
    });
  }

  if (btnUserSettings) {
    btnUserSettings.addEventListener('click', (e) => {
      e.stopPropagation();
      window.openModalView('settings.html');
    });
  }

  // ── SUNUCU MODAL ──────────────────────────────────────────────
  if (btnOpenCreateServer) btnOpenCreateServer.addEventListener('click', () => modalCreateServer.classList.add('active'));
  if (btnCloseModalServer) btnCloseModalServer.addEventListener('click', () => modalCreateServer.classList.remove('active'));
  if (btnSubmitCreateServer) {
    btnSubmitCreateServer.addEventListener('click', () => {
      const name = newServerNameInput.value.trim();
      if (name) {
        const srv = window.dataStore.addServer(name);
        newServerNameInput.value = '';
        modalCreateServer.classList.remove('active');
        switchToServer(srv.id);
        showToast(srv.name + ' sunucusu oluşturuldu');
      }
    });
  }

  // ── SES KANALI MODAL ──────────────────────────────────────────
  if (btnOpenCreateVoice) btnOpenCreateVoice.addEventListener('click', () => modalCreateVoice && modalCreateVoice.classList.add('active'));
  if (btnCloseModalVoice) btnCloseModalVoice.addEventListener('click', () => modalCreateVoice && modalCreateVoice.classList.remove('active'));
  if (btnSubmitCreateVoice) {
    btnSubmitCreateVoice.addEventListener('click', () => {
      const name = newVoiceNameInput.value.trim();
      if (name) {
        window.dataStore.addVoiceChannel(name);
        newVoiceNameInput.value = '';
        modalCreateVoice.classList.remove('active');
        renderVoiceChannels();
        showToast(name + ' ses kanalı oluşturuldu');
      }
    });
  }

  // ── LİGHTBOX & IMAGE DRAWING EDITOR ──────────────────────────
  const btnDownloadLightbox = document.getElementById('btn-download-lightbox');
  const btnEditLightbox = document.getElementById('btn-edit-lightbox');
  const lightboxEditToolbar = document.getElementById('lightbox-edit-toolbar');
  const lightboxCanvas = document.getElementById('lightbox-canvas');
  const btnDrawBrush = document.getElementById('btn-draw-brush');
  const btnDrawEraser = document.getElementById('btn-draw-eraser');
  const btnDrawUndo = document.getElementById('btn-draw-undo');
  const btnDrawClear = document.getElementById('btn-draw-clear');
  const btnSaveDrawn = document.getElementById('btn-save-drawn-image');
  const btnCancelDrawn = document.getElementById('btn-cancel-drawn-image');

  let isDrawingMode = false;
  let isPainting = false;
  let drawTool = 'brush'; // 'brush' or 'eraser'
  let drawColor = '#ef4444';
  let drawSize = 7;
  let undoHistory = [];
  let currentImageUrl = '';

  function openLightbox(imgUrl) {
    currentImageUrl = imgUrl;
    lightboxTargetImg.src = imgUrl;
    closeDrawingMode();
    modalLightbox.classList.add('active');
    refreshIcons(modalLightbox);
  }

  function closeLightbox() {
    closeDrawingMode();
    modalLightbox.classList.remove('active');
  }

  if (btnCloseLightbox) btnCloseLightbox.addEventListener('click', closeLightbox);
  if (modalLightbox) {
    modalLightbox.addEventListener('click', (e) => {
      if (e.target === modalLightbox) closeLightbox();
    });
  }

  // 1. Görseli İndir
  if (btnDownloadLightbox) {
    btnDownloadLightbox.addEventListener('click', async () => {
      try {
        if (currentImageUrl.startsWith('data:image')) {
          const a = document.createElement('a');
          a.href = currentImageUrl;
          a.download = `ziorse-image-${Date.now()}.png`;
          a.click();
          showToast('Görsel indirildi');
        } else {
          const res = await fetch(currentImageUrl);
          const blob = await res.blob();
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = `ziorse-image-${Date.now()}.png`;
          a.click();
          URL.revokeObjectURL(blobUrl);
          showToast('Görsel indirildi');
        }
      } catch {
        window.open(currentImageUrl, '_blank');
        showToast('Görsel açıldı');
      }
    });
  }

  // 2. Çizim / Düzenleme Modu
  function startDrawingMode() {
    if (!lightboxTargetImg.complete || !lightboxTargetImg.naturalWidth) {
      lightboxTargetImg.onload = () => initCanvasDrawing();
    } else {
      initCanvasDrawing();
    }
  }

  function initCanvasDrawing() {
    isDrawingMode = true;
    if (lightboxEditToolbar) lightboxEditToolbar.style.display = 'flex';
    if (lightboxCanvas) {
      const rect = lightboxTargetImg.getBoundingClientRect();
      lightboxCanvas.width = lightboxTargetImg.naturalWidth || rect.width;
      lightboxCanvas.height = lightboxTargetImg.naturalHeight || rect.height;
      lightboxCanvas.style.width = rect.width + 'px';
      lightboxCanvas.style.height = rect.height + 'px';
      lightboxCanvas.style.display = 'block';

      const ctx = lightboxCanvas.getContext('2d');
      ctx.clearRect(0, 0, lightboxCanvas.width, lightboxCanvas.height);
      try {
        ctx.drawImage(lightboxTargetImg, 0, 0, lightboxCanvas.width, lightboxCanvas.height);
      } catch (err) {
        console.warn('Canvas drawImage error', err);
      }

      undoHistory = [];
      saveUndoState();
    }
    refreshIcons(lightboxEditToolbar);
  }

  function closeDrawingMode() {
    isDrawingMode = false;
    if (lightboxEditToolbar) lightboxEditToolbar.style.display = 'none';
    if (lightboxCanvas) lightboxCanvas.style.display = 'none';
  }

  if (btnEditLightbox) btnEditLightbox.addEventListener('click', startDrawingMode);
  if (btnCancelDrawn) btnCancelDrawn.addEventListener('click', closeDrawingMode);

  // Canvas Çizim Olayları
  function saveUndoState() {
    if (!lightboxCanvas) return;
    const ctx = lightboxCanvas.getContext('2d');
    undoHistory.push(ctx.getImageData(0, 0, lightboxCanvas.width, lightboxCanvas.height));
    if (undoHistory.length > 20) undoHistory.shift();
  }

  function getCanvasCoords(e) {
    const rect = lightboxCanvas.getBoundingClientRect();
    const scaleX = lightboxCanvas.width / rect.width;
    const scaleY = lightboxCanvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  if (lightboxCanvas) {
    const ctx = lightboxCanvas.getContext('2d');

    function startPaint(e) {
      if (!isDrawingMode) return;
      isPainting = true;
      const pos = getCanvasCoords(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      draw(e);
    }

    function draw(e) {
      if (!isPainting || !isDrawingMode) return;
      e.preventDefault();
      const pos = getCanvasCoords(e);

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = drawSize * (lightboxCanvas.width / 800);

      if (drawTool === 'eraser') {
        ctx.strokeStyle = '#ffffff';
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = drawColor;
      }

      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }

    function stopPaint() {
      if (!isPainting) return;
      isPainting = false;
      ctx.closePath();
      saveUndoState();
    }

    lightboxCanvas.addEventListener('mousedown', startPaint);
    lightboxCanvas.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', stopPaint);

    lightboxCanvas.addEventListener('touchstart', startPaint, { passive: false });
    lightboxCanvas.addEventListener('touchmove', draw, { passive: false });
    window.addEventListener('touchend', stopPaint);
  }

  // Araç Seçimleri (Fırça / Silgi)
  if (btnDrawBrush) {
    btnDrawBrush.addEventListener('click', () => {
      drawTool = 'brush';
      btnDrawBrush.classList.add('active');
      if (btnDrawEraser) btnDrawEraser.classList.remove('active');
    });
  }

  if (btnDrawEraser) {
    btnDrawEraser.addEventListener('click', () => {
      drawTool = 'eraser';
      btnDrawEraser.classList.add('active');
      if (btnDrawBrush) btnDrawBrush.classList.remove('active');
    });
  }

  // Renk Paleti (Tam Renk Seçici)
  const drawColorInput = document.getElementById('draw-color-input');
  const drawColorPreview = document.getElementById('draw-color-preview');
  const drawColorHex = document.getElementById('draw-color-hex');

  if (drawColorInput) {
    drawColorInput.addEventListener('input', (e) => {
      drawColor = e.target.value;
      if (drawColorPreview) drawColorPreview.style.background = drawColor;
      if (drawColorHex) drawColorHex.textContent = drawColor;
      if (drawTool === 'eraser' && btnDrawBrush) btnDrawBrush.click();
    });
  }

  // Fırça Boyutu
  document.querySelectorAll('.draw-size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.draw-size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      drawSize = parseInt(btn.dataset.size, 10) || 7;
    });
  });

  // Geri Al (Undo)
  if (btnDrawUndo) {
    btnDrawUndo.addEventListener('click', () => {
      if (undoHistory.length > 1) {
        undoHistory.pop();
        const prevState = undoHistory[undoHistory.length - 1];
        const ctx = lightboxCanvas.getContext('2d');
        ctx.putImageData(prevState, 0, 0);
        showToast('Geri alındı');
      } else {
        showToast('Geri alınacak işlem yok');
      }
    });
  }

  // Temizle (Clear)
  if (btnDrawClear) {
    btnDrawClear.addEventListener('click', () => {
      if (!lightboxCanvas) return;
      const ctx = lightboxCanvas.getContext('2d');
      ctx.clearRect(0, 0, lightboxCanvas.width, lightboxCanvas.height);
      try {
        ctx.drawImage(lightboxTargetImg, 0, 0, lightboxCanvas.width, lightboxCanvas.height);
      } catch (err) { }
      saveUndoState();
      showToast('Çizimler temizlendi');
    });
  }

  // Çizimi Kaydet & İndir
  if (btnSaveDrawn) {
    btnSaveDrawn.addEventListener('click', () => {
      if (!lightboxCanvas) return;
      const dataUrl = lightboxCanvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `ziorse-edited-${Date.now()}.png`;
      a.click();
      showToast('Düzenlenen görsel kaydedildi ve indirildi');
    });
  }

  // ── GÖNDERİ MODAL ─────────────────────────────────────────────
  if (btnOpenModalPost && modalPost) btnOpenModalPost.addEventListener('click', () => modalPost.classList.add('active'));
  if (btnCloseModalPost && modalPost) btnCloseModalPost.addEventListener('click', () => modalPost.classList.remove('active'));
  const modalPostText = document.getElementById('modal-post-text');
  if (modalPostText) {
    modalPostText.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const text = modalPostText.value.trim();
        if (text) { window.dataStore.addPost(text); modalPostText.value = ''; modalPost.classList.remove('active'); showToast('Gönderi yayınlandı'); }
      }
    });
  }

  // ── FEED TABS ─────────────────────────────────────────────────
  feedTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      feedTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      if (composerCard) composerCard.style.display = 'flex';
      if (feedTitleText) feedTitleText.textContent = '# genel-sohbet';
      window.dataStore.activeFilter = tab.dataset.filter;
      triggerFeedWithSkeleton(150);
    });
  });

  // ── MORPHING HUB NAVIGATION RAIL ─────────────────────────────
  const navHubMainBtn = document.getElementById('nav-hub-main-btn');
  const navHubMainIcon = document.getElementById('nav-hub-main-icon');
  const navHubFlyout = document.getElementById('nav-hub-flyout');
  const navHubWrapper = document.getElementById('nav-hub-wrapper');
  const hubMiniBtns = document.querySelectorAll('.hub-mini-btn');

  const navIconMap = {
    'for-you': 'home',
    'messages': 'message-square',
    'saved': 'bookmark'
  };

  function switchNavHubTo(navType, animate = true) {
    const iconName = navIconMap[navType] || 'home';

    // 1. Mini butonların aktifliğini güncelle
    hubMiniBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.nav === navType);
    });

    // 2. Sunucu butonlarından aktifi kaldır, Ana Hub'ı aktif yap
    document.querySelectorAll('.servers-rail .server-icon').forEach(i => i.classList.remove('active'));
    if (navHubMainBtn) navHubMainBtn.classList.add('active');

    // 3. Ana butondaki ikonu güncelle ve morfla
    const iconBox = navHubMainBtn?.querySelector('.nav-hub-icon-box');
    if (iconBox) {
      iconBox.innerHTML = `<i data-lucide="${iconName}" style="width:20px; height:20px;"></i>`;
      refreshIcons(iconBox);
      if (animate) {
        iconBox.classList.remove('morph-pop');
        void iconBox.offsetWidth; // Reflow tetikle
        iconBox.classList.add('morph-pop');
      }
    }

    // 4. Açılır menüyü kapat
    if (navHubFlyout) {
      navHubFlyout.classList.remove('open');
    }

    // 5. Sayfayı Değiştir
    window.dataStore.activeServerId = 'home';
    window.dataStore.activeChannelId = 'genel';
    if (appLayoutEl) appLayoutEl.classList.add('hide-channels-sidebar');
    if (currentServerName) currentServerName.textContent = 'Sunucular';
    const feedHeaderRight = document.querySelector('.feed-header-right');

    if (navType === 'messages') {
      if (mainFeedView) mainFeedView.style.display = 'none';
      if (dmView) dmView.style.display = 'grid';
      if (feedHeaderRight) feedHeaderRight.style.display = 'none';
      if (appLayoutEl) {
        appLayoutEl.classList.add('hide-channels-sidebar');
        appLayoutEl.classList.add('dm-active');
      }
      triggerDmWithSkeleton(150);
    } else {
      if (dmView) dmView.style.display = 'none';
      if (mainFeedView) mainFeedView.style.display = 'flex';
      if (composerCard) composerCard.style.display = navType === 'saved' ? 'none' : 'flex';
      if (feedPostsContainer) feedPostsContainer.style.display = '';
      const pageTitles = { 'for-you': '# Ana Akis', 'saved': '# Kaydedilenler' };
      if (feedTitleText) feedTitleText.textContent = pageTitles[navType] || '# Ana Akis';
      window.dataStore.activeFilter = navType;
      if (feedHeaderRight) feedHeaderRight.style.display = navType === 'saved' ? 'none' : '';
      if (appLayoutEl) {
        appLayoutEl.classList.remove('hide-right-sidebar');
        appLayoutEl.classList.remove('dm-active');
      }
      triggerFeedWithSkeleton(150);
    }
    updateRightSidebar();
  }

  window.switchNavHubTo = switchNavHubTo;

  // Mini simgelere tıklanınca o sayfaya git ve ikonu ana butona geçir
  hubMiniBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      switchNavHubTo(btn.dataset.nav, true);
    });
  });

  // Hover ve tık ile menüyü açık tutma (Erken kapanmayı önleyici gecikme)
  let flyoutCloseTimer = null;
  const navHubContainer = document.getElementById('nav-hub-container');

  if (navHubContainer && navHubFlyout) {
    navHubContainer.addEventListener('mouseenter', () => {
      if (flyoutCloseTimer) {
        clearTimeout(flyoutCloseTimer);
        flyoutCloseTimer = null;
      }
      navHubFlyout.classList.add('open');
    });

    navHubContainer.addEventListener('mouseleave', () => {
      flyoutCloseTimer = setTimeout(() => {
        navHubFlyout.classList.remove('open');
      }, 300);
    });
  }

  // Ana Hub butonuna tıklandığında menüyü aç / kapat
  if (navHubMainBtn) {
    navHubMainBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (flyoutCloseTimer) clearTimeout(flyoutCloseTimer);
      if (navHubFlyout) {
        navHubFlyout.classList.toggle('open');
      }
    });
  }

  // Dışarı tıklandığında menüyü kapat
  document.addEventListener('click', (e) => {
    if (navHubWrapper && !navHubWrapper.contains(e.target)) {
      if (flyoutCloseTimer) clearTimeout(flyoutCloseTimer);
      if (navHubFlyout) navHubFlyout.classList.remove('open');
    }
  });

  // ── KANAL NAV ─────────────────────────────────────────────────
  channelNavItems.forEach(ch => {
    ch.addEventListener('click', () => {
      channelNavItems.forEach(c => c.classList.remove('active'));
      ch.classList.add('active');
      window.dataStore.activeChannelId = ch.dataset.channel;
      if (feedPostsContainer) feedPostsContainer.style.display = '';
      if (composerCard) composerCard.style.display = 'flex';
      if (dmView) dmView.style.display = 'none';
      if (mainFeedView) mainFeedView.style.display = 'flex';
      if (feedTitleText) feedTitleText.textContent = '#' + (ch.dataset.channel === 'genel' ? 'genel-sohbet' : ch.dataset.channel);
      if (appLayoutEl) {
        appLayoutEl.classList.remove('hide-right-sidebar');
      }
      triggerFeedWithSkeleton(160);
      updateRightSidebar();
    });
  });

  // ── SES KONTROLLER ────────────────────────────────────────────
  if (btnShareScreen) {
    btnShareScreen.addEventListener('click', async () => {
      try {
        screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        showToast('Ekran paylaşımı başlatıldı');
        btnShareScreen.style.color = 'var(--accent-emerald)';
        screenStream.getVideoTracks()[0].onended = () => { showToast('Ekran paylaşımı bitti'); btnShareScreen.style.color = 'var(--text-main)'; };
      } catch { showToast('Ekran paylaşımı iptal edildi'); }
    });
  }
  if (btnMuteMic) btnMuteMic.addEventListener('click', () => {
    isMicMuted = !isMicMuted;
    btnMuteMic.style.color = isMicMuted ? 'var(--accent-rose)' : 'var(--text-main)';
    if (isMicMuted) stopVoiceVAD();
    else if (connectedVoiceChannelId && !isDeafened) startVoiceVAD();
    showToast(isMicMuted ? 'Mikrofon susturuldu' : 'Mikrofon açıldı');
  });
  if (btnDeafenVoice) btnDeafenVoice.addEventListener('click', () => {
    isDeafened = !isDeafened;
    btnDeafenVoice.style.color = isDeafened ? 'var(--accent-rose)' : 'var(--text-main)';
    if (isDeafened) stopVoiceVAD();
    else if (connectedVoiceChannelId && !isMicMuted) startVoiceVAD();
    showToast(isDeafened ? 'Ses kapatıldı' : 'Ses açıldı');
  });

  // ── POST EKLER (FOTOĞRAF, VİDEO, DOSYA, KOD, ANKET, SES) ────────
  // Ek Araçlar Menüsü Toggle
  if (btnToggleExtraTools && composerExtraDrawer) {
    btnToggleExtraTools.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = composerExtraDrawer.style.display === 'none' || !composerExtraDrawer.style.display;
      composerExtraDrawer.style.display = isHidden ? 'flex' : 'none';
      btnToggleExtraTools.classList.toggle('active', isHidden);
      refreshIcons(composerExtraDrawer);
    });
  }

  // Anket Aç/Kapa
  if (btnAttachPoll) {
    btnAttachPoll.addEventListener('click', () => {
      const isHidden = pollAttachContainer.style.display === 'none' || !pollAttachContainer.style.display;
      pollAttachContainer.style.display = isHidden ? 'flex' : 'none';
      btnAttachPoll.classList.toggle('active', isHidden);
      if (isHidden && pollOpt1) pollOpt1.focus();
    });
  }

  if (btnClosePoll) {
    btnClosePoll.addEventListener('click', () => {
      if (pollAttachContainer) pollAttachContainer.style.display = 'none';
      if (pollOpt1) pollOpt1.value = '';
      if (pollOpt2) pollOpt2.value = '';
      if (btnAttachPoll) btnAttachPoll.classList.remove('active');
    });
  }

  // Fotoğraf
  if (btnAttachImage) btnAttachImage.addEventListener('click', () => filePickerImage && filePickerImage.click());
  if (filePickerImage) filePickerImage.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      const resp = await fetch('http://localhost:3000/api/upload', { method: 'POST', body: formData, signal: AbortSignal.timeout(6000) });
      const data = await resp.json();
      if (data && data.success && data.url) {
        attachedImageDataUrl = 'http://localhost:3000' + data.url;
        imagePreviewImg.src = attachedImageDataUrl;
        imagePreviewBar.style.display = 'block';
        showToast('Fotoğraf eklendi');
        return;
      }
    } catch { }

    if (window.openImageCropper) {
      window.openImageCropper({
        file: file,
        shape: 'rect',
        title: 'Gönderi Fotoğrafını Ayarla',
        onCrop: (croppedDataUrl) => {
          attachedImageDataUrl = croppedDataUrl;
          imagePreviewImg.src = attachedImageDataUrl;
          imagePreviewBar.style.display = 'block';
          showToast('Fotoğraf hazırlandı');
        }
      });
    } else {
      const r = new FileReader();
      r.onload = (ev) => {
        attachedImageDataUrl = ev.target.result;
        imagePreviewImg.src = attachedImageDataUrl;
        imagePreviewBar.style.display = 'block';
        showToast('Fotoğraf eklendi');
      };
      r.readAsDataURL(file);
    }
    filePickerImage.value = '';
  });

  if (btnRemoveImage) btnRemoveImage.addEventListener('click', () => {
    attachedImageDataUrl = null;
    imagePreviewBar.style.display = 'none';
  });

  // Video
  if (btnAttachVideo) btnAttachVideo.addEventListener('click', () => filePickerVideo && filePickerVideo.click());
  if (filePickerVideo) filePickerVideo.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      const resp = await fetch('http://localhost:3000/api/upload', { method: 'POST', body: formData, signal: AbortSignal.timeout(10000) });
      const data = await resp.json();
      if (data && data.success && data.url) {
        attachedVideoDataUrl = 'http://localhost:3000' + data.url;
        if (filePreviewBar && filePreviewName) {
          filePreviewName.textContent = `🎬 Video: ${file.name} (${formatBytes(file.size)})`;
          filePreviewBar.style.display = 'flex';
        }
        showToast('Video eklendi');
        return;
      }
    } catch { }

    const r = new FileReader();
    r.onload = (ev) => {
      attachedVideoDataUrl = ev.target.result;
      if (filePreviewBar && filePreviewName) {
        filePreviewName.textContent = `🎬 Video: ${file.name} (${formatBytes(file.size)})`;
        filePreviewBar.style.display = 'flex';
      }
      showToast('Video eklendi');
    };
    r.readAsDataURL(file);
    filePickerVideo.value = '';
  });

  // Dosya
  if (btnAttachFile) btnAttachFile.addEventListener('click', () => filePickerFile && filePickerFile.click());
  if (filePickerFile) filePickerFile.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      const resp = await fetch('http://localhost:3000/api/upload', { method: 'POST', body: formData, signal: AbortSignal.timeout(10000) });
      const data = await resp.json();
      if (data && data.success && data.url) {
        attachedFileData = { name: file.name, size: file.size, url: 'http://localhost:3000' + data.url, mimetype: file.type };
        if (filePreviewBar && filePreviewName) {
          filePreviewName.textContent = `📎 Dosya: ${file.name} (${formatBytes(file.size)})`;
          filePreviewBar.style.display = 'flex';
        }
        showToast('Dosya eklendi');
        return;
      }
    } catch { }

    const r = new FileReader();
    r.onload = (ev) => {
      attachedFileData = { name: file.name, size: file.size, url: ev.target.result, mimetype: file.type };
      if (filePreviewBar && filePreviewName) {
        filePreviewName.textContent = `📎 Dosya: ${file.name} (${formatBytes(file.size)})`;
        filePreviewBar.style.display = 'flex';
      }
      showToast('Dosya eklendi');
    };
    r.readAsDataURL(file);
    filePickerFile.value = '';
  });

  if (btnRemoveFile) btnRemoveFile.addEventListener('click', () => {
    attachedVideoDataUrl = null;
    attachedFileData = null;
    if (filePreviewBar) filePreviewBar.style.display = 'none';
  });

  if (btnAttachCode) {
    btnAttachCode.addEventListener('click', () => {
      const isHidden = codeAttachInput.style.display === 'none' || !codeAttachInput.style.display;
      codeAttachInput.style.display = isHidden ? 'block' : 'none';
      if (codeAttachWrapper) codeAttachWrapper.style.display = isHidden ? 'flex' : 'none';
      btnAttachCode.classList.toggle('active', isHidden);
      if (isHidden && codeAttachInput) codeAttachInput.focus();
    });
  }

  if (btnCloseCode) {
    btnCloseCode.addEventListener('click', () => {
      if (codeAttachInput) {
        codeAttachInput.value = '';
        codeAttachInput.style.display = 'none';
      }
      if (codeAttachWrapper) codeAttachWrapper.style.display = 'none';
      if (btnAttachCode) btnAttachCode.classList.remove('active');
    });
  }

  if (btnRecordVoice) btnRecordVoice.addEventListener('click', async () => {
    if (!isRecordingVoice) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream); audioChunks = [];
        mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunks.push(e.data); };
        mediaRecorder.onstop = () => {
          const blob = new Blob(audioChunks, { type: 'audio/webm' });
          attachedAudioData = { url: URL.createObjectURL(blob), duration: '0:15', title: 'Sesli Not' };
          voiceRecordingBar.style.display = 'none'; showToast('Ses kaydı bitti');
        };
        mediaRecorder.start(); isRecordingVoice = true; voiceRecordingBar.style.display = 'flex';
      } catch { showToast('Mikrofon hatası'); }
    } else { if (mediaRecorder) mediaRecorder.stop(); isRecordingVoice = false; }
  });

  // ── REPLY CONTROLS ───────────────────────────────────────────
  function setReplyTarget(author, text, avatar, handle) {
    const resolvedAvatar = avatar || (handle ? window.dataStore.getUserProfile(handle)?.avatar : null) || 'https://i.imgur.com/w3OhOmW.jpeg';
    activeReplyTarget = { author, text, avatar: resolvedAvatar, handle: handle || null };
    if (composerReplyBar) {
      if (composerReplyAvatar) {
        composerReplyAvatar.src = resolvedAvatar;
        composerReplyAvatar.style.display = 'inline-block';
      }
      if (composerReplyAuthor) composerReplyAuthor.textContent = '@' + author;
      if (composerReplyText) composerReplyText.textContent = text;
      composerReplyBar.style.display = 'flex';
      refreshIcons(composerReplyBar);
    }
    if (postComposerText) {
      postComposerText.placeholder = `@${author} kullanıcısına yanıt yazın...`;
      postComposerText.focus();
    }
    showToast('@' + author + ' yanıtlanıyor');
  }

  function clearReplyTarget() {
    activeReplyTarget = null;
    if (composerReplyBar) composerReplyBar.style.display = 'none';
    if (composerReplyAvatar) composerReplyAvatar.style.display = 'none';
    if (postComposerText) postComposerText.placeholder = 'Mesajınızı yazın... (Enter ile Gönder, Shift+Enter ile yeni satır)';
  }

  if (btnCancelReply) {
    btnCancelReply.addEventListener('click', (e) => {
      e.stopPropagation();
      clearReplyTarget();
      showToast('Yanıt iptal edildi');
    });
  }

  // ── POST GÖNDER ───────────────────────────────────────────────
  function submitPost() {
    const text = postComposerText.value.trim();
    const code = codeAttachInput.style.display === 'block' ? codeAttachInput.value.trim() : null;
    if (pollAttachContainer.style.display === 'flex' && pollOpt1.value && pollOpt2.value) {
      attachedPoll = { options: [{ text: pollOpt1.value, votes: 0 }, { text: pollOpt2.value, votes: 0 }], totalVotes: 0 };
    }

    // ziorse/XXXX pattern'i — davet kartı olarak gönder
    const inviteMatch = text && !code && !attachedImageDataUrl && !attachedVideoDataUrl && !attachedFileData && !attachedAudioData && !attachedPoll
      ? text.match(/^ziorse\/([a-z0-9]+)$/i) : null;
    if (inviteMatch) {
      const icode = inviteMatch[1];
      const registryInfo = window.dataStore.getInviteInfo(icode);
      const matchedServer = window.dataStore.servers.find(s => s.inviteCode === icode);
      const liveMems = window.dataStore.getServerMembers ? window.dataStore.getServerMembers(icode) : [];
      const mCount = Math.max(
        liveMems.length,
        (matchedServer && Array.isArray(matchedServer.members)) ? matchedServer.members.length : 0,
        (registryInfo && registryInfo.memberCount) ? registryInfo.memberCount : 0,
        (matchedServer && matchedServer.memberCount) ? matchedServer.memberCount : 0,
        1
      );
      const inviteData = {
        url: text,
        serverName: (registryInfo && registryInfo.serverName) || (matchedServer && matchedServer.name) || 'Bilinmeyen Sunucu',
        serverIcon: (registryInfo && registryInfo.serverIcon) || (matchedServer && matchedServer.icon) || '?',
        serverBanner: (registryInfo && registryInfo.serverBanner) || (matchedServer && matchedServer.banner) || '',
        memberCount: mCount,
        code: icode
      };
      const invitePost = window.dataStore.addPost('', null, null, null, null);
      if (invitePost) {
        invitePost.type = 'server-invite';
        invitePost.invite = inviteData;
        invitePost.content = '';
        window.dataStore.savePosts();
        if (window.socket) window.socket.emit('new-post-broadcast', invitePost);
      }
      postComposerText.value = '';
      if (imagePreviewBar) imagePreviewBar.style.display = 'none';
      if (filePreviewBar) filePreviewBar.style.display = 'none';
      clearReplyTarget();
      showToast('Davet gönderildi');
      renderFeed();
      return;
    }

    if (text || code || attachedImageDataUrl || attachedVideoDataUrl || attachedFileData || attachedAudioData || attachedPoll) {
      // 0ms ANINDA TEMİZLE VE GÖNDER (Sıfır Gecikme)
      postComposerText.value = '';
      if (codeAttachInput) { codeAttachInput.value = ''; codeAttachInput.style.display = 'none'; }
      if (codeAttachWrapper) codeAttachWrapper.style.display = 'none';
      if (btnAttachCode) btnAttachCode.classList.remove('active');
      if (pollAttachContainer) pollAttachContainer.style.display = 'none';
      if (pollOpt1) pollOpt1.value = '';
      if (pollOpt2) pollOpt2.value = '';
      if (btnAttachPoll) btnAttachPoll.classList.remove('active');
      if (composerExtraDrawer) {
        composerExtraDrawer.style.display = 'none';
        if (btnToggleExtraTools) btnToggleExtraTools.classList.remove('active');
      }
      if (imagePreviewBar) imagePreviewBar.style.display = 'none';
      if (filePreviewBar) filePreviewBar.style.display = 'none';

      // Yanıtlanan mesaj hedefini sakla ve barı temizle
      const replyTarget = activeReplyTarget;
      clearReplyTarget();

      const imgData = attachedImageDataUrl;
      const vidData = attachedVideoDataUrl;
      const flData = attachedFileData;
      const audData = attachedAudioData;
      const pollData = attachedPoll;

      attachedImageDataUrl = null;
      attachedVideoDataUrl = null;
      attachedFileData = null;
      attachedAudioData = null;
      attachedPoll = null;

      const newPost = window.dataStore.addPost(text, code, imgData, audData, replyTarget, vidData, flData);
      if (pollData && newPost) newPost.poll = pollData;
      if (window.socket && newPost) window.socket.emit('new-post-broadcast', newPost);

      showToast(window.dataStore.activeServerId === 'home' ? 'Gönderi yayınlandı' : 'Mesaj gönderildi');
      renderFeed();
      if (window.dataStore.activeServerId !== 'home') {
        scrollContainerToBottom(feedPostsContainer);
      }
    }
  }
  if (postComposerText) postComposerText.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitPost(); } });
  if (btnSendPost) btnSendPost.addEventListener('click', submitPost);

  // ── COMPACT DISCORD-STYLE GIF PICKER (TENOR.COM & NSFWGIFY.COM) ────────
  const modalGifPicker = document.getElementById('gif-picker-modal');
  const btnOpenGifPicker = document.getElementById('btn-open-gif-picker');
  const btnDmOpenGifPicker = document.getElementById('btn-dm-open-gif-picker');
  const btnCloseGifPicker = document.getElementById('btn-close-gif-picker');
  const gifSearchInput = document.getElementById('gif-search-input');
  const btnClearGifSearch = document.getElementById('btn-clear-gif-search');
  const gifCategoriesBar = document.getElementById('gif-categories-bar');
  const gifResultsGrid = document.getElementById('gif-results-grid');
  const gifLoadingSpinner = document.getElementById('gif-loading-spinner');
  const gifActiveProviderLabel = document.getElementById('gif-active-provider-label');
  const gifTabButtons = document.querySelectorAll('.gif-tab-btn');

  let gifTargetContext = 'main'; // 'main' veya 'dm'
  let gifAnchorElement = null;
  let currentGifSource = 'tenor';
  let currentGifQuery = '';
  let gifSearchDebounceTimer = null;
  let gifFetchAbortController = null;

  const TENOR_CATEGORIES = ['Trend', 'Anime', 'Dans', 'Oyun', 'Memes', 'Kedi', 'Komik', 'Aşk', 'GG', 'Vay', 'Kutlama', 'Tepki'];
  const NSFWGIFY_CATEGORIES = ['Trend', 'Anime', 'Hentai', 'Ass', 'Boobs', 'Blowjob', 'Cosplay', 'Hardcore', 'Amateur', 'Milf', 'Yaoi', 'Solo'];

  function openGifPickerModal(context = 'main', anchorEl = null) {
    gifTargetContext = context;
    gifAnchorElement = anchorEl || (context === 'dm' ? btnDmOpenGifPicker : btnOpenGifPicker);

    if (modalGifPicker) {
      modalGifPicker.style.display = 'flex';

      // Emoji picker gibi butonun hemen üstünde konumlandır
      if (gifAnchorElement) {
        const rect = gifAnchorElement.getBoundingClientRect();
        const modalW = 340;
        const modalH = 380;
        let left = rect.left;
        let top = rect.top - modalH - 8;
        if (left + modalW > window.innerWidth) left = window.innerWidth - modalW - 8;
        if (left < 8) left = 8;
        if (top < 8) top = rect.bottom + 8;
        modalGifPicker.style.left = left + 'px';
        modalGifPicker.style.top = top + 'px';
      }
    }

    if (gifSearchInput) {
      gifSearchInput.value = '';
      currentGifQuery = '';
      if (btnClearGifSearch) btnClearGifSearch.style.display = 'none';
      setTimeout(() => gifSearchInput.focus(), 60);
    }
    renderGifCategories();
    loadGifs(currentGifSource, '');
  }

  function closeGifPickerModal() {
    if (modalGifPicker) {
      modalGifPicker.style.display = 'none';
    }
  }

  function renderGifCategories() {
    if (!gifCategoriesBar) return;
    const cats = currentGifSource === 'nsfwgify' ? NSFWGIFY_CATEGORIES : TENOR_CATEGORIES;
    gifCategoriesBar.innerHTML = cats.map(cat => `
      <button class="gif-cat-chip ${(!currentGifQuery && cat === 'Trend') || currentGifQuery.toLowerCase() === cat.toLowerCase() ? 'active' : ''}" data-cat="${escapeHtml(cat)}" type="button">
        ${escapeHtml(cat)}
      </button>
    `).join('');

    gifCategoriesBar.querySelectorAll('.gif-cat-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        const cat = chip.dataset.cat;
        if (cat === 'Trend') {
          currentGifQuery = '';
          if (gifSearchInput) gifSearchInput.value = '';
          if (btnClearGifSearch) btnClearGifSearch.style.display = 'none';
        } else {
          currentGifQuery = cat;
          if (gifSearchInput) gifSearchInput.value = cat;
          if (btnClearGifSearch) btnClearGifSearch.style.display = 'inline-block';
        }
        renderGifCategories();
        loadGifs(currentGifSource, currentGifQuery);
      });
    });
  }

  async function loadGifs(source = 'tenor', query = '') {
    if (!gifResultsGrid) return;
    if (gifLoadingSpinner) gifLoadingSpinner.style.display = 'flex';
    gifResultsGrid.innerHTML = '';

    if (gifActiveProviderLabel) {
      gifActiveProviderLabel.textContent = `Sağlayıcı: ${source === 'nsfwgify' ? 'NSFWGify.com' : 'Tenor.com'} (Tıklayarak gönderin)`;
    }

    if (gifFetchAbortController) {
      gifFetchAbortController.abort();
    }
    gifFetchAbortController = new AbortController();

    try {
      const resp = await fetch(`http://localhost:3000/api/gifs?source=${encodeURIComponent(source)}&q=${encodeURIComponent(query)}`, {
        signal: gifFetchAbortController.signal
      });
      const data = await resp.json();
      if (gifLoadingSpinner) gifLoadingSpinner.style.display = 'none';

      if (data && data.gifs && data.gifs.length > 0) {
        gifResultsGrid.innerHTML = data.gifs.map(g => `
          <div class="gif-card-item" data-url="${escapeHtml(g.url)}" data-preview="${escapeHtml(g.preview)}" title="${escapeHtml(g.title || 'GIF')}">
            <img src="${escapeHtml(g.preview)}" alt="${escapeHtml(g.title || 'GIF')}" loading="lazy">
            <span class="gif-card-title">${escapeHtml(g.title || 'GIF Gönder')}</span>
          </div>
        `).join('');

        gifResultsGrid.querySelectorAll('.gif-card-item').forEach(card => {
          card.addEventListener('click', (e) => {
            e.stopPropagation();
            const gifUrl = card.dataset.url;
            sendGifMessage(gifUrl);
          });
        });
      } else {
        gifResultsGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:30px 10px;color:var(--text-muted);font-size:0.8rem;">GIF bulunamadı.</div>';
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        if (gifLoadingSpinner) gifLoadingSpinner.style.display = 'none';
        gifResultsGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:30px 10px;color:var(--text-muted);font-size:0.8rem;">GIF yükleme hatası.</div>';
      }
    }
  }

  function sendGifMessage(gifUrl) {
    if (!gifUrl) return;
    closeGifPickerModal();

    if (gifTargetContext === 'dm') {
      if (!activeDmThreadId) {
        showToast('Lütfen önce bir DM sohbeti seçin');
        return;
      }
      const thread = window.dataStore.dmThreads.find(t => t.id === activeDmThreadId);
      if (!thread) return;

      const msgObj = {
        id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        text: '',
        image: gifUrl,
        sender: 'me',
        senderHandle: window.dataStore.currentUser.handle,
        timestamp: new Date().toISOString()
      };

      const msgs = window.dataStore.getThreadMessages(thread.user.handle);
      msgs.push(msgObj);
      window.dataStore.saveThreadMessages(thread.user.handle, msgs);
      window.dataStore.saveDMs();
      renderDMs();
      scrollContainerToBottom(dmChatMessages);

      if (window.socket && window.dataStore.currentUser) {
        window.socket.emit('send-dm-live', {
          fromHandle: window.dataStore.currentUser.handle,
          fromName: window.dataStore.currentUser.name,
          fromAvatar: window.dataStore.currentUser.avatar,
          toHandle: thread.user.handle,
          threadId: thread.id,
          message: msgObj
        });
      }
      showToast('GIF gönderildi');
    } else {
      // Sunucu kanalı veya ana akış gönderisi
      const newPost = window.dataStore.addPost('', null, gifUrl, null, activeReplyTarget, null, null);
      if (window.socket && newPost) {
        window.socket.emit('new-post-broadcast', newPost);
      }
      clearReplyTarget();
      showToast(window.dataStore.activeServerId === 'home' ? 'GIF yayınlandı' : 'GIF gönderildi');
      renderFeed();
      if (window.dataStore.activeServerId !== 'home') {
        scrollContainerToBottom(feedPostsContainer);
      }
    }
  }

  if (btnOpenGifPicker) {
    btnOpenGifPicker.addEventListener('click', (e) => {
      e.stopPropagation();
      if (modalGifPicker && modalGifPicker.style.display !== 'none' && gifTargetContext === 'main') {
        closeGifPickerModal();
      } else {
        openGifPickerModal('main', btnOpenGifPicker);
      }
    });
  }

  if (btnDmOpenGifPicker) {
    btnDmOpenGifPicker.addEventListener('click', (e) => {
      e.stopPropagation();
      if (modalGifPicker && modalGifPicker.style.display !== 'none' && gifTargetContext === 'dm') {
        closeGifPickerModal();
      } else {
        openGifPickerModal('dm', btnDmOpenGifPicker);
      }
    });
  }

  if (btnCloseGifPicker) {
    btnCloseGifPicker.addEventListener('click', (e) => {
      e.stopPropagation();
      closeGifPickerModal();
    });
  }

  // Dışarı tıklandığında popover'ı kapat
  document.addEventListener('click', (e) => {
    if (modalGifPicker && modalGifPicker.style.display !== 'none') {
      if (!modalGifPicker.contains(e.target) &&
        e.target !== btnOpenGifPicker && !btnOpenGifPicker?.contains(e.target) &&
        e.target !== btnDmOpenGifPicker && !btnDmOpenGifPicker?.contains(e.target)) {
        closeGifPickerModal();
      }
    }
  });

  gifTabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      gifTabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentGifSource = btn.dataset.source || 'tenor';
      currentGifQuery = '';
      if (gifSearchInput) gifSearchInput.value = '';
      if (btnClearGifSearch) btnClearGifSearch.style.display = 'none';
      renderGifCategories();
      loadGifs(currentGifSource, '');
    });
  });

  if (gifSearchInput) {
    gifSearchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim();
      currentGifQuery = q;
      if (btnClearGifSearch) btnClearGifSearch.style.display = q ? 'inline-block' : 'none';
      if (gifSearchDebounceTimer) clearTimeout(gifSearchDebounceTimer);
      gifSearchDebounceTimer = setTimeout(() => {
        renderGifCategories();
        loadGifs(currentGifSource, currentGifQuery);
      }, 250);
    });
  }

  if (btnClearGifSearch) {
    btnClearGifSearch.addEventListener('click', (e) => {
      e.stopPropagation();
      if (gifSearchInput) gifSearchInput.value = '';
      currentGifQuery = '';
      btnClearGifSearch.style.display = 'none';
      renderGifCategories();
      loadGifs(currentGifSource, '');
    });
  }

  // ── CREATE CATEGORY & CHANNEL MODALS ────────────────────────
  const modalCreateCategory = document.getElementById('modal-create-category');
  const btnCloseModalCategory = document.getElementById('btn-close-modal-category');
  const newCategoryNameInput = document.getElementById('new-category-name-input');
  const btnSubmitCreateCategory = document.getElementById('btn-submit-create-category');

  const modalCreateChannel = document.getElementById('modal-create-channel');
  const btnCloseModalChannel = document.getElementById('btn-close-modal-channel');
  const modalChannelCatInfo = document.getElementById('modal-channel-cat-info');
  const newChannelNameInput = document.getElementById('new-channel-name-input');
  const btnSubmitCreateChannel = document.getElementById('btn-submit-create-channel');
  const modalChannelTypeText = document.getElementById('modal-channel-type-text');
  const modalChannelTypeVoice = document.getElementById('modal-channel-type-voice');

  let targetCreateCategoryServerId = null;
  let targetCreateChannelServerId = null;
  let targetCreateChannelCatId = null;
  let newChannelSelectedType = 'text';

  function openCreateCategoryModal(serverId) {
    targetCreateCategoryServerId = serverId;
    if (newCategoryNameInput) newCategoryNameInput.value = '';
    if (modalCreateCategory) modalCreateCategory.classList.add('active');
    setTimeout(() => { if (newCategoryNameInput) newCategoryNameInput.focus(); }, 50);
  }

  function closeCreateCategoryModal() {
    if (modalCreateCategory) modalCreateCategory.classList.remove('active');
    targetCreateCategoryServerId = null;
  }

  function openCreateChannelModal(serverId, categoryId, categoryName) {
    targetCreateChannelServerId = serverId;
    targetCreateChannelCatId = categoryId;
    newChannelSelectedType = 'text';
    if (modalChannelCatInfo) modalChannelCatInfo.textContent = 'Kategori: ' + (categoryName || 'Genel');
    if (newChannelNameInput) newChannelNameInput.value = '';
    if (modalChannelTypeText) modalChannelTypeText.classList.add('selected');
    if (modalChannelTypeVoice) modalChannelTypeVoice.classList.remove('selected');
    if (modalCreateChannel) modalCreateChannel.classList.add('active');
    setTimeout(() => { if (newChannelNameInput) newChannelNameInput.focus(); }, 50);
  }

  function closeCreateChannelModal() {
    if (modalCreateChannel) modalCreateChannel.classList.remove('active');
    targetCreateChannelServerId = null;
    targetCreateChannelCatId = null;
  }

  if (btnCloseModalCategory) btnCloseModalCategory.addEventListener('click', closeCreateCategoryModal);
  if (modalCreateCategory) modalCreateCategory.addEventListener('click', (e) => { if (e.target === modalCreateCategory) closeCreateCategoryModal(); });
  if (btnSubmitCreateCategory) {
    btnSubmitCreateCategory.addEventListener('click', () => {
      const name = newCategoryNameInput ? newCategoryNameInput.value.trim() : '';
      if (!name) { showToast('Kategori adı boş olamaz'); return; }
      if (!targetCreateCategoryServerId) return;
      const newCat = window.dataStore.addCategory(targetCreateCategoryServerId, name);
      closeCreateCategoryModal();
      const srvObj = window.dataStore.servers.find(s => s.id === targetCreateCategoryServerId);
      if (srvObj) {
        renderServerChannels(srvObj, window.dataStore.activeChannelId || 'genel');
      }
      showToast('Kategori oluşturuldu: ' + name);
    });
  }
  if (newCategoryNameInput) {
    newCategoryNameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); if (btnSubmitCreateCategory) btnSubmitCreateCategory.click(); }
      if (e.key === 'Escape') { e.preventDefault(); closeCreateCategoryModal(); }
    });
  }

  if (btnCloseModalChannel) btnCloseModalChannel.addEventListener('click', closeCreateChannelModal);
  if (modalCreateChannel) modalCreateChannel.addEventListener('click', (e) => { if (e.target === modalCreateChannel) closeCreateChannelModal(); });
  if (modalChannelTypeText) {
    modalChannelTypeText.addEventListener('click', () => {
      newChannelSelectedType = 'text';
      modalChannelTypeText.classList.add('selected');
      if (modalChannelTypeVoice) modalChannelTypeVoice.classList.remove('selected');
    });
  }
  if (modalChannelTypeVoice) {
    modalChannelTypeVoice.addEventListener('click', () => {
      newChannelSelectedType = 'voice';
      modalChannelTypeVoice.classList.add('selected');
      if (modalChannelTypeText) modalChannelTypeText.classList.remove('selected');
    });
  }
  if (btnSubmitCreateChannel) {
    btnSubmitCreateChannel.addEventListener('click', () => {
      const name = newChannelNameInput ? newChannelNameInput.value.trim() : '';
      if (!name) { showToast('Kanal adı boş olamaz'); return; }
      if (!targetCreateChannelServerId || !targetCreateChannelCatId) return;
      const newCh = window.dataStore.addChannelToCategory(targetCreateChannelServerId, targetCreateChannelCatId, name, newChannelSelectedType);
      closeCreateChannelModal();
      const srvObj = window.dataStore.servers.find(s => s.id === targetCreateChannelServerId);
      if (srvObj && newCh) {
        renderServerChannels(srvObj, newCh.id);
        window.dataStore.activeChannelId = newCh.id;
        renderFeed();
      }
      showToast('Kanal oluşturuldu: #' + (newCh ? newCh.name : name));
    });
  }
  if (newChannelNameInput) {
    newChannelNameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); if (btnSubmitCreateChannel) btnSubmitCreateChannel.click(); }
      if (e.key === 'Escape') { e.preventDefault(); closeCreateChannelModal(); }
    });
  }

  function showServerInviteModal(srv) {
    const existing = document.getElementById('server-invite-modal');
    if (existing) existing.remove();

    const invite = window.dataStore.generateInvite(srv.id);
    const inviteUrl = 'ziorse/' + invite.code;
    const liveMems = window.dataStore.getServerMembers ? window.dataStore.getServerMembers(srv.inviteCode) : [];
    const actualMembers = Math.max(
      liveMems.length,
      (srv.members && Array.isArray(srv.members)) ? srv.members.length : 0,
      srv.memberCount || 1,
      invite.memberCount || 1
    );

    const modal = document.createElement('div');
    modal.id = 'server-invite-modal';
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
      <div class="modal-box" style="max-width:420px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3 style="font-size:1.1rem;font-weight:700;">Sunucuya Davet Et</h3>
          <button id="close-invite-modal" style="background:transparent;border:none;color:var(--text-muted);cursor:pointer;font-size:1.1rem;">x</button>
        </div>
        <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:12px;font-family:var(--font-montserrat);">${escapeHtml(srv.name)} sunucusuna davet bağlantısı</p>
        <div class="invite-url-box">
          <span id="invite-url-text">${inviteUrl}</span>
          <button id="btn-copy-invite" class="btn-copy-invite">
            <i data-lucide="copy" style="width:14px;height:14px;"></i> Kopyala
          </button>
        </div>
        <div style="margin-top:16px;border-top:1px solid var(--border-color);padding-top:14px;">
          <p style="font-size:0.8rem;font-weight:700;font-family:var(--font-montserrat);margin-bottom:10px;">DM ile Gönder</p>
          <div id="invite-friends-list" style="display:flex;flex-direction:column;gap:6px;max-height:160px;overflow-y:auto;"></div>
        </div>
      </div>`;
    document.body.appendChild(modal);
    refreshIcons();

    // Kopyala
    modal.querySelector('#btn-copy-invite').addEventListener('click', () => {
      navigator.clipboard.writeText(inviteUrl).then(() => showToast('Davet bağlantısı kopyalandı')).catch(() => showToast('Kopyalanamadı'));
    });

    // Kapat
    modal.querySelector('#close-invite-modal').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

    // Arkadaş listesi — DM ile gönder
    const friendsList = modal.querySelector('#invite-friends-list');
    const friends = window.dataStore.friends || [];
    if (friends.length === 0) {
      friendsList.innerHTML = `<div style="font-size:0.78rem;color:var(--text-muted);">Arkadaş listeniz boş.</div>`;
    } else {
      friendsList.innerHTML = friends.map(f => `
        <div class="invite-friend-row" data-handle="${f.handle}">
          <img class="dm-friend-avatar" src="${f.avatar || ''}" alt="${escapeHtml(f.name)}" style="width:30px;height:30px;">
          <span style="flex:1;font-size:0.84rem;font-weight:600;font-family:var(--font-montserrat);">${escapeHtml(f.name)}</span>
          <button class="btn-send-invite-dm" data-handle="${f.handle}" data-name="${escapeHtml(f.name)}" data-url="${inviteUrl}" data-srv="${escapeHtml(srv.name)}" data-icon="${escapeHtml(srv.icon)}" data-members="${actualMembers}">Gönder</button>
        </div>`).join('');

      friendsList.querySelectorAll('.btn-send-invite-dm').forEach(btn => {
        btn.addEventListener('click', () => {
          const handle = btn.dataset.handle;
          const name = btn.dataset.name;
          const url = btn.dataset.url;
          const srvName = btn.dataset.srv;
          const srvIcon = btn.dataset.icon;
          const members = btn.dataset.members;
          const friend = friends.find(f => f.handle === handle);
          let thread = window.dataStore.dmThreads.find(t => t.user.handle === handle);
          if (!thread && friend) thread = window.dataStore.createDMThread(friend.name, handle);
          if (thread) {
            const sharedMsgs = window.dataStore.getThreadMessages(handle);
            const inviteMsg = {
              text: '',
              type: 'server-invite',
              invite: { url, serverName: srvName, serverIcon: srvIcon, memberCount: parseInt(members, 10) || actualMembers, code: srv.inviteCode },
              sender: 'me',
              senderHandle: window.dataStore.currentUser.handle,
              timestamp: new Date().toISOString()
            };
            sharedMsgs.push(inviteMsg);
            window.dataStore.saveThreadMessages(handle, sharedMsgs);
            window.dataStore.saveDMs();
            btn.textContent = 'Gönderildi';
            btn.disabled = true;
            showToast(name + ' kullanıcısına davet gönderildi');
          }
        });
      });
    }
  }

  // ── KANALLAR VE ROLLER POPOVER TOOLTIP ───────────────────────
  function openChannelsAndRolesPopover(srvObj, btnEl) {
    const existing = document.getElementById('channels-roles-popover');
    if (existing) {
      existing.remove();
      btnEl.classList.remove('active');
      return;
    }
    btnEl.classList.add('active');

    const popover = document.createElement('div');
    popover.id = 'channels-roles-popover';
    popover.className = 'channels-roles-popover';

    const roles = (window.dataStore.getServerRoles && window.dataStore.getServerRoles(srvObj.id)) || [];
    const categories = srvObj.categories || [];
    let allChannels = [];
    categories.forEach(cat => {
      if (cat.channels) {
        cat.channels.forEach(ch => allChannels.push({ ...ch, categoryName: cat.name }));
      }
    });

    const allMembers = (window.dataStore.getServerMembers && window.dataStore.getServerMembers(srvObj.inviteCode || srvObj.id)) || [];

    let currentTab = 'channels'; // 'channels' | 'roles'
    let searchQuery = '';

    const cu = window.dataStore.currentUser || { handle: '@kullanici' };
    const canManageRoles = (window.dataStore.checkServerPermission && window.dataStore.checkServerPermission(srvObj.id, cu.handle, 'manage_roles')) ||
      (srvObj.ownerHandle && srvObj.ownerHandle.toLowerCase() === cu.handle.toLowerCase()) ||
      (!srvObj.joined && !srvObj.ownerHandle);

    function renderPopoverContent() {
      const q = searchQuery.toLowerCase().trim();
      const filteredChannels = allChannels.filter(ch => (ch.name || '').toLowerCase().includes(q) || (ch.categoryName && ch.categoryName.toLowerCase().includes(q)));
      const filteredRoles = roles.filter(r => (r.name || '').toLowerCase().includes(q));

      popover.innerHTML = `
        <div class="cr-popover-header">
          <div class="cr-header-left">
            <div class="cr-header-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="4" y1="5" x2="20" y2="5"></line>
                <line x1="4" y1="9" x2="20" y2="9"></line>
                <line x1="4" y1="13" x2="13" y2="13"></line>
                <line x1="4" y1="17" x2="10" y2="17"></line>
                <circle cx="16.5" cy="16.5" r="3"></circle>
                <line x1="18.7" y1="18.7" x2="21.5" y2="21.5"></line>
              </svg>
            </div>
            <div>
              <div class="cr-header-title">Kanallar ve Roller</div>
              <div class="cr-header-subtitle">${escapeHtml(srvObj.name)}</div>
            </div>
          </div>
          <button class="cr-close-btn" id="btn-close-cr-popover" title="Kapat">
            <i data-lucide="x" style="width:14px;height:14px;"></i>
          </button>
        </div>

        <div class="cr-tabs">
          <button class="cr-tab-btn ${currentTab === 'channels' ? 'active' : ''}" data-tab="channels">
            Kanallar <span class="cr-tab-count">${allChannels.length}</span>
          </button>
          <button class="cr-tab-btn ${currentTab === 'roles' ? 'active' : ''}" data-tab="roles">
            Roller <span class="cr-tab-count">${roles.length}</span>
          </button>
        </div>

        <div class="cr-search-box">
          <input type="text" class="cr-search-input" id="cr-search-input" placeholder="${currentTab === 'channels' ? 'Kanal ara...' : 'Rol ara...'}" value="${escapeHtml(searchQuery)}">
        </div>

        <div class="cr-body">
          ${currentTab === 'channels' ? renderChannelsList(filteredChannels) : renderRolesList(filteredRoles)}
        </div>

        ${currentTab === 'roles' && canManageRoles ? `
          <div class="cr-footer-bar">
            <button class="cr-manage-roles-btn" id="btn-cr-manage-roles">
              <i data-lucide="settings" style="width:13px;height:13px;"></i> Rolleri Yönet
            </button>
          </div>
        ` : ''}
      `;

      if (window.lucide) window.lucide.createIcons({ root: popover });

      // Tab switch
      popover.querySelectorAll('.cr-tab-btn').forEach(tb => {
        tb.addEventListener('click', (e) => {
          if (e) e.stopPropagation();
          currentTab = tb.dataset.tab;
          renderPopoverContent();
          const inp = popover.querySelector('#cr-search-input');
          if (inp) { inp.focus(); inp.selectionStart = inp.selectionEnd = inp.value.length; }
        });
      });

      // Search input
      const searchInput = popover.querySelector('#cr-search-input');
      if (searchInput) {
        searchInput.addEventListener('input', (ev) => {
          searchQuery = ev.target.value;
          const bodyEl = popover.querySelector('.cr-body');
          if (bodyEl) {
            const q2 = searchQuery.toLowerCase().trim();
            if (currentTab === 'channels') {
              const fCh = allChannels.filter(ch => (ch.name || '').toLowerCase().includes(q2) || (ch.categoryName && ch.categoryName.toLowerCase().includes(q2)));
              bodyEl.innerHTML = renderChannelsList(fCh);
              bindChannelClicks();
            } else {
              const fR = roles.filter(r => (r.name || '').toLowerCase().includes(q2));
              bodyEl.innerHTML = renderRolesList(fR);
            }
            if (window.lucide) window.lucide.createIcons({ root: bodyEl });
          }
        });
      }

      // Close button
      const closeBtn = popover.querySelector('#btn-close-cr-popover');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          popover.remove();
          btnEl.classList.remove('active');
        });
      }

      // Manage roles shortcut
      const manageBtn = popover.querySelector('#btn-cr-manage-roles');
      if (manageBtn) {
        manageBtn.addEventListener('click', () => {
          popover.remove();
          btnEl.classList.remove('active');
          window.openModalView(`server-settings.html?id=${srvObj.id}&section=roller`);
        });
      }

      bindChannelClicks();
    }

    function renderChannelsList(channels) {
      if (channels.length === 0) {
        return `<div style="padding:28px 10px; text-align:center; color:var(--text-muted); font-size:0.8rem;">Eşleşen kanal bulunamadı.</div>`;
      }
      return channels.map(ch => {
        const isVoice = ch.type === 'voice';
        const icon = isVoice ? 'volume-2' : 'hash';
        const isActive = window.dataStore.activeChannelId === ch.id;
        return `
          <button class="cr-channel-item ${isActive ? 'active' : ''}" data-channel-id="${ch.id}" data-type="${ch.type || 'text'}">
            <div class="cr-channel-left">
              <i data-lucide="${icon}" style="width:14px;height:14px; flex-shrink:0; opacity:0.75;"></i>
              <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:0.84rem;">${escapeHtml(ch.name)}</span>
            </div>
            ${ch.categoryName ? `<span class="cr-channel-cat-tag">${escapeHtml(ch.categoryName)}</span>` : ''}
          </button>
        `;
      }).join('');
    }

    function renderRolesList(roleList) {
      if (roleList.length === 0) {
        return `<div style="padding:28px 10px; text-align:center; color:var(--text-muted); font-size:0.8rem;">Bu sunucuda henüz rol oluşturulmamış.</div>`;
      }
      return roleList.map(r => {
        const roleColor = r.color || '#99aab5';
        const membersWithRole = allMembers.filter(m => {
          const rIds = (window.dataStore.getMemberRoles && window.dataStore.getMemberRoles(srvObj.id, m.handle || (m.user && m.user.handle) || '')) || [];
          return rIds.some(rObj => rObj.id === r.id);
        }).length;
        return `
          <div class="cr-role-item">
            <div class="cr-role-badge" style="color:${roleColor};">
              ${r.icon ? `<img src="${escapeHtml(r.icon)}" style="width:14px;height:14px;object-fit:cover;border-radius:3px;">` : `<span class="cr-role-dot" style="background:${roleColor};"></span>`}
              <span>${escapeHtml(r.name)}</span>
            </div>
            <span class="cr-role-members-count">${membersWithRole > 0 ? `${membersWithRole} üye` : 'Üye yok'}</span>
          </div>
        `;
      }).join('');
    }

    function bindChannelClicks() {
      popover.querySelectorAll('.cr-channel-item').forEach(item => {
        item.addEventListener('click', () => {
          const chId = item.dataset.channelId;
          const chType = item.dataset.type;
          popover.remove();
          btnEl.classList.remove('active');
          if (chType === 'voice') {
            joinVoiceChannel(srvObj.id, chId);
          } else {
            switchToServer(srvObj.id, chId);
          }
        });
      });
    }

    renderPopoverContent();

    // Position popover next to left sidebar button
    const rect = btnEl.getBoundingClientRect();
    const popoverWidth = 360;
    let left = rect.right + 10;
    if (left + popoverWidth > window.innerWidth - 10) {
      left = Math.max(10, rect.left - popoverWidth - 10);
    }
    let top = Math.max(10, Math.min(rect.top - 20, window.innerHeight - 520));
    popover.style.top = top + 'px';
    popover.style.left = left + 'px';

    document.body.appendChild(popover);

    // Stop propagation inside popover so body clicks don't close it
    popover.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    setTimeout(() => {
      function handleOutsideClick(e) {
        if (!popover.contains(e.target) && e.target !== btnEl && !btnEl.contains(e.target)) {
          popover.remove();
          btnEl.classList.remove('active');
          document.removeEventListener('click', handleOutsideClick);
          document.removeEventListener('keydown', handleEsc);
        }
      }
      function handleEsc(e) {
        if (e.key === 'Escape') {
          popover.remove();
          btnEl.classList.remove('active');
          document.removeEventListener('click', handleOutsideClick);
          document.removeEventListener('keydown', handleEsc);
        }
      }
      document.addEventListener('click', handleOutsideClick);
      document.addEventListener('keydown', handleEsc);
    }, 50);
  }

  function renderServerChannels(srvObj, activeChId) {
    const leftSidebar = document.querySelector('.left-sidebar');
    if (!leftSidebar) return;

    const cu = window.dataStore.currentUser || { name: 'Kullanıcı', handle: '@kullanici', avatar: window.DEFAULT_AVATAR };

    // Migrate and get categories
    window.dataStore._migrateServerCategories(srvObj);
    const categories = srvObj.categories || [];

    // Find active TEXT channel across all categories (voice channels are not text feeds)
    let currentCh = null;
    let currentCatId = null;
    for (const cat of categories) {
      const found = cat.channels.find(c => c.id === activeChId && c.type !== 'voice');
      if (found) { currentCh = found; currentCatId = cat.id; break; }
    }
    if (!currentCh) {
      for (const cat of categories) {
        const found = cat.channels.find(c => c.type !== 'voice');
        if (found) { currentCh = found; currentCatId = cat.id; break; }
      }
    }
    if (!currentCh && categories.length > 0 && categories[0].channels.length > 0) {
      currentCh = categories[0].channels[0];
      currentCatId = categories[0].id;
    }
    if (currentCh && currentCh.type !== 'voice') {
      window.dataStore.activeChannelId = currentCh.id;
    }

    // Build sidebar HTML
    const hasBanner = srvObj.banner && (srvObj.banner.startsWith('data:image') || srvObj.banner.startsWith('http'));
    let html = `<div class="server-header-banner ${hasBanner ? 'has-custom-banner' : ''}" style="${hasBanner ? `background-image: url('${escapeHtml(srvObj.banner)}');` : ''}">
      ${hasBanner ? '<div class="server-header-banner-overlay"></div>' : ''}
      <div class="server-header-banner-content">
        <span id="current-server-name" class="server-title-text">${escapeHtml(srvObj.name)}</span>
        <i data-lucide="chevron-down" style="width:16px;height:16px;color:var(--text-muted);cursor:pointer;"></i>
      </div>
    </div>
    <div class="server-channels-roles-wrap">
      <button class="ch-channel-item server-channels-roles-btn" id="btn-server-channels-roles" title="Kanallar ve Roller">
        <div style="display:flex; align-items:center; gap:8px; overflow:hidden; flex:1;">
          <svg class="ch-icon server-nav-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="4" y1="5" x2="20" y2="5"></line>
            <line x1="4" y1="9" x2="20" y2="9"></line>
            <line x1="4" y1="13" x2="13" y2="13"></line>
            <line x1="4" y1="17" x2="10" y2="17"></line>
            <circle cx="16.5" cy="16.5" r="3"></circle>
            <line x1="18.7" y1="18.7" x2="21.5" y2="21.5"></line>
          </svg>
          <span style="font-weight:600; font-size:0.84rem;">Kanallar ve Roller</span>
        </div>
      </button>
    </div>
    <div id="server-channel-list">`;

    const isOwner = window.dataStore.isServerOwner(srvObj.id, cu.handle);
    const canManageChannels = isOwner || (window.dataStore.checkServerPermission && window.dataStore.checkServerPermission(srvObj.id, cu.handle, 'manage_channels'));

    categories.forEach((cat, catIndex) => {
      const isCollapsed = cat.collapsed;
      html += `
      <div class="ch-category" data-cat-id="${cat.id}" data-cat-index="${catIndex}" draggable="true">
        <div class="ch-category-header" data-cat-id="${cat.id}">
          <div class="ch-cat-left">
            ${cat.icon ? `<img src="${escapeHtml(cat.icon)}" class="ch-cat-icon" alt="">` : ''}
            <i data-lucide="${isCollapsed ? 'chevron-right' : 'chevron-down'}" class="ch-cat-arrow" style="width:11px;height:11px;"></i>
            <span class="ch-cat-name">${escapeHtml(cat.name)}</span>
          </div>
          ${canManageChannels ? `
            <button class="ch-cat-add-btn" data-cat-id="${cat.id}" title="Kanal Ekle">
              <i data-lucide="plus" style="width:12px;height:12px;"></i>
            </button>
          ` : ''}
        </div>
        <div class="ch-channel-list ${isCollapsed ? 'ch-collapsed' : ''}" data-cat-id="${cat.id}">`;

      cat.channels.forEach(ch => {
        const isVoice = ch.type === 'voice';
        const isActiveText = !isVoice && currentCh && ch.id === currentCh.id;
        const icon = isVoice ? 'volume-2' : 'hash';
        const cu = window.dataStore.currentUser || { name: 'Kullanıcı', handle: '@kullanici', avatar: window.DEFAULT_AVATAR };

        let voiceLimitBadge = '';
        if (isVoice) {
          const roomKey = (srvObj.inviteCode || srvObj.id) + ':' + ch.id;
          const voiceUsers = (window.__globalVoiceRooms && window.__globalVoiceRooms[roomKey]) ? [...window.__globalVoiceRooms[roomKey]] : [];
          if (connectedVoiceRoomKey === roomKey && !voiceUsers.some(u => u.handle.toLowerCase() === cu.handle.toLowerCase())) {
            voiceUsers.push({ handle: cu.handle });
          }
          const userLimit = parseInt(ch.userLimit) || 0;
          if (userLimit > 0) {
            const isFull = voiceUsers.length >= userLimit;
            voiceLimitBadge = `<span class="ch-voice-limit-badge ${isFull ? 'full' : ''}" title="Kullanıcı Sınırı: ${voiceUsers.length}ㅤ/ㅤ${userLimit}">${voiceUsers.length}/${userLimit}</span>`;
          }
        }

        html += `
          <button class="ch-channel-item ${isActiveText ? 'active' : ''}"
            data-channel-id="${ch.id}"
            data-cat-id="${cat.id}"
            data-type="${isVoice ? 'voice' : 'text'}"
            data-server-id="${srvObj.id}"
            draggable="true">
            <div style="display:flex; align-items:center; gap:6px; overflow:hidden; flex:1;">
              <i data-lucide="${icon}" class="ch-icon" style="width:15px;height:15px; flex-shrink:0;"></i>
              <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(ch.name)}</span>
            </div>
            ${voiceLimitBadge}
          </button>`;

        // Ses kanalındaki TÜM bağlı kullanıcıları listele
        if (isVoice) {
          const roomKey = (srvObj.inviteCode || srvObj.id) + ':' + ch.id;
          const voiceUsers = (window.__globalVoiceRooms && window.__globalVoiceRooms[roomKey]) ? [...window.__globalVoiceRooms[roomKey]] : [];
          if (connectedVoiceRoomKey === roomKey && !voiceUsers.some(u => u.handle.toLowerCase() === cu.handle.toLowerCase())) {
            voiceUsers.push({
              handle: cu.handle,
              name: cu.name,
              avatar: cu.avatar || window.DEFAULT_AVATAR,
              isSpeaking: isSpeakingNow && !isMicMuted && !isDeafened,
              isMuted: isMicMuted,
              isDeafened: isDeafened
            });
          }

          if (voiceUsers.length > 0) {
            html += `<div class="ch-voice-users">`;
            voiceUsers.forEach(vu => {
              const uProfile = window.dataStore.getUserProfile(vu.handle);
              const uAvatar = vu.avatar || uProfile.avatar || window.DEFAULT_AVATAR;
              const uName = vu.name || uProfile.name || vu.handle;
              const isSpeaking = vu.isSpeaking;
              const isMuted = vu.isMuted;
              const isDeafened = vu.isDeafened;

              html += `
                <div class="ch-voice-user-item" data-handle="${escapeHtml(vu.handle)}">
                  <div class="ch-voice-avatar-wrap ${isSpeaking ? 'speaking' : ''}">
                    <img src="${escapeHtml(uAvatar)}" class="ch-voice-avatar" alt="">
                  </div>
                  <span class="ch-voice-username">${escapeHtml(uName)}</span>
                  <div class="ch-voice-user-icons">
                    ${isMuted ? `<span class="ch-voice-icon-muted" title="Mikrofon Kapalı"><i data-lucide="mic-off" style="width:13px;height:13px;"></i></span>` : ''}
                    ${isDeafened ? `<span class="ch-voice-icon-deafened" title="Ses Kapalı"><i data-lucide="volume-x" style="width:13px;height:13px;"></i></span>` : ''}
                  </div>
                </div>`;
            });
            html += `</div>`;
          }
        }
      });

      html += `</div></div>`;
    });

    html += `</div>`;
    leftSidebar.innerHTML = html;
    refreshIcons(leftSidebar);

    // Voice user click → popover
    leftSidebar.querySelectorAll('.ch-voice-user-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        if (item.dataset.handle) showUserProfilePopover(e, item.dataset.handle);
      });
    });

    // Channels & Roles button click → openChannelsAndRolesPopover
    const crBtn = leftSidebar.querySelector('#btn-server-channels-roles');
    if (crBtn) {
      crBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openChannelsAndRolesPopover(srvObj, crBtn);
      });
    }

    // Re-attach server header banner click
    const banner = leftSidebar.querySelector('.server-header-banner');
    if (banner) {
      banner.style.cursor = 'pointer';
      banner.addEventListener('click', (e) => {
        e.stopPropagation();
        const existing = document.getElementById('server-header-dropdown');
        if (existing) { existing.remove(); return; }
        const activeServerId = window.dataStore.activeServerId;
        if (activeServerId === 'home') return;
        const srv = window.dataStore.servers.find(s => s.id === activeServerId);
        if (!srv) return;

        const canManageChannels = window.dataStore.isServerOwner(activeServerId, cu.handle) || (window.dataStore.checkServerPermission && window.dataStore.checkServerPermission(activeServerId, cu.handle, 'manage_channels'));

        const dd = document.createElement('div');
        dd.id = 'server-header-dropdown';
        dd.className = 'server-header-dropdown';
        dd.innerHTML = `
          <button class="shd-item" id="shd-settings">
            <i data-lucide="settings" style="width:14px;height:14px;"></i> Sunucu Ayarları
          </button>
          ${canManageChannels ? `
            <button class="shd-item" id="shd-create-category">
              <i data-lucide="folder-plus" style="width:14px;height:14px;"></i> Kategori Oluştur
            </button>
          ` : ''}
          <div class="shd-divider"></div>
          <button class="shd-item" id="shd-invite">
            <i data-lucide="user-plus" style="width:14px;height:14px;"></i> Sunucuya Davet Et
          </button>`;
        const rect = banner.getBoundingClientRect();
        dd.style.top = (rect.bottom + 4) + 'px';
        dd.style.left = rect.left + 'px';
        dd.style.width = rect.width + 'px';
        document.body.appendChild(dd);
        refreshIcons();

        dd.querySelector('#shd-settings').addEventListener('click', () => {
          dd.remove();
          window.openModalView(`server-settings.html?id=${srv.id}&channel=${encodeURIComponent(window.dataStore.activeChannelId || 'genel')}`);
        });
        dd.querySelector('#shd-create-category').addEventListener('click', () => {
          dd.remove();
          openCreateCategoryModal(srv.id);
        });
        dd.querySelector('#shd-invite').addEventListener('click', () => {
          dd.remove();
          showServerInviteModal(srv);
        });

        setTimeout(() => {
          document.addEventListener('click', function h(ev) {
            if (!dd.contains(ev.target)) { dd.remove(); document.removeEventListener('click', h); }
          });
        }, 50);
      });
    }

    // Category header click → collapse/expand + hover + right-click
    leftSidebar.querySelectorAll('.ch-category-header').forEach(header => {
      header.addEventListener('click', (e) => {
        if (e.target.closest('.ch-cat-add-btn')) return;
        const catId = header.dataset.catId;
        const cat = categories.find(c => c.id === catId);
        if (!cat) return;
        cat.collapsed = !cat.collapsed;
        window.dataStore.saveServers();
        renderServerChannels(srvObj, window.dataStore.activeChannelId);
      });

      // Right-click → category edit
      header.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const catId = header.dataset.catId;
        showCategoryContextMenu(e, srvObj.id, catId);
      });
    });

    // + add channel button
    leftSidebar.querySelectorAll('.ch-cat-add-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const catId = btn.dataset.catId;
        const cat = categories.find(c => c.id === catId);
        openCreateChannelModal(srvObj.id, catId, cat ? cat.name : '');
      });
    });

    // Channel click → switch feed or join voice
    leftSidebar.querySelectorAll('.ch-channel-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (e.button !== 0) return;
        const chId = btn.dataset.channelId;
        const catId = btn.dataset.catId;
        const type = btn.dataset.type;
        const cat = categories.find(c => c.id === catId);
        const ch = cat ? cat.channels.find(c => c.id === chId) : null;
        if (!ch) return;

        if (type === 'voice') {
          const canConnect = window.dataStore.checkChannelPermission(srvObj.id, catId, chId, 'connect_voice');
          if (!canConnect) {
            showToast('Bu ses kanalına katılma izniniz bulunmuyor.');
            return;
          }
          const roomKey = (srvObj.inviteCode || srvObj.id) + ':' + chId;
          if (connectedVoiceRoomKey === roomKey) {
            return;
          }

          // Ses odası kullanıcı sınırı kontrolü (1-99)
          const userLimit = parseInt(ch.userLimit) || 0;
          if (userLimit > 0) {
            const currentVoiceUsers = (window.__globalVoiceRooms && window.__globalVoiceRooms[roomKey])
              ? window.__globalVoiceRooms[roomKey].filter(u => u.handle.toLowerCase() !== cu.handle.toLowerCase())
              : [];
            if (currentVoiceUsers.length >= userLimit) {
              showToast(`Bu ses kanalı dolu (${currentVoiceUsers.length}/${userLimit})`);
              return;
            }
          }

          // Önceki ses kanalından ayrıl
          const prevRoomKey = connectedVoiceRoomKey;
          const prevChannelId = connectedVoiceChannelId;
          if (prevRoomKey && window.socket) {
            window.socket.emit('leave-voice-channel', { roomKey: prevRoomKey, channelId: prevChannelId, handle: cu.handle });
          }

          // Yerel state'i güncelle
          if (!window.__globalVoiceRooms) window.__globalVoiceRooms = {};
          if (prevRoomKey && window.__globalVoiceRooms[prevRoomKey]) {
            window.__globalVoiceRooms[prevRoomKey] = window.__globalVoiceRooms[prevRoomKey].filter(u => u.handle.toLowerCase() !== cu.handle.toLowerCase());
          }
          if (!window.__globalVoiceRooms[roomKey]) window.__globalVoiceRooms[roomKey] = [];
          window.__globalVoiceRooms[roomKey] = window.__globalVoiceRooms[roomKey].filter(u => u.handle.toLowerCase() !== cu.handle.toLowerCase());
          window.__globalVoiceRooms[roomKey].push({
            handle: cu.handle,
            name: cu.name,
            avatar: cu.avatar || window.DEFAULT_AVATAR,
            isSpeaking: false,
            isMuted: isMicMuted,
            isDeafened: isDeafened,
            serverId: srvObj.id,
            channelId: chId,
            roomKey: roomKey
          });

          connectedVoiceChannelId = chId;
          connectedVoiceRoomKey = roomKey;
          if (window.audioSynth) window.audioSynth.playVoiceJoin();
          startVoiceVAD();
          if (btnVoiceDisconnect) btnVoiceDisconnect.style.display = 'inline-flex';
          if (voiceActiveBar) {
            voiceActiveBar.style.display = 'flex';
            if (voiceActiveName) voiceActiveName.textContent = ch.name;
          }

          if (window.socket && window.dataStore.currentUser) {
            window.socket.emit('join-voice-channel', {
              roomKey,
              serverId: srvObj.id,
              channelId: chId,
              user: {
                handle: window.dataStore.currentUser.handle,
                name: window.dataStore.currentUser.name,
                avatar: window.dataStore.currentUser.avatar || window.DEFAULT_AVATAR
              },
              isMuted: isMicMuted,
              isDeafened: isDeafened
            });
          }

          showToast('Ses kanalına bağlanıldı: ' + ch.name);
          renderServerChannels(srvObj, window.dataStore.activeChannelId);
          return;
        }

        // METİN KANALI:
        leftSidebar.querySelectorAll('.ch-channel-item[data-type="text"]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        window.dataStore.activeChannelId = chId;
        if (feedTitleText && ch) feedTitleText.textContent = '# ' + ch.name;
        updateHeaderLocation();
        triggerFeedWithSkeleton(160);
      });

      // Right-click → channel edit
      btn.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showChannelContextMenu(e, srvObj.id, btn.dataset.catId, btn.dataset.channelId);
      });
    });

    // ── DRAG & DROP ───────────────────────────────────────────
    let dragChannelId = null, dragChannelCatId = null;
    let dragCatId = null;
    let dragType = null; // 'channel' | 'category'

    leftSidebar.querySelectorAll('.ch-channel-item').forEach(btn => {
      btn.addEventListener('dragstart', (e) => {
        dragType = 'channel';
        dragChannelId = btn.dataset.channelId;
        dragChannelCatId = btn.dataset.catId;
        btn.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });
      btn.addEventListener('dragend', () => {
        btn.classList.remove('dragging');
        leftSidebar.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        dragType = null; dragChannelId = null; dragChannelCatId = null;
      });
    });

    leftSidebar.querySelectorAll('.ch-category').forEach(catEl => {
      catEl.addEventListener('dragstart', (e) => {
        if (dragType === 'channel') return; // channel has priority
        dragType = 'category';
        dragCatId = catEl.dataset.catId;
        catEl.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });
      catEl.addEventListener('dragend', () => {
        catEl.classList.remove('dragging');
        leftSidebar.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        if (dragType === 'category') { dragType = null; dragCatId = null; }
      });

      // Channel dragover → highlight category
      catEl.addEventListener('dragover', (e) => {
        if (dragType !== 'channel') return;
        e.preventDefault();
        leftSidebar.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        catEl.querySelector('.ch-category-header').classList.add('drag-over');
      });

      catEl.addEventListener('drop', (e) => {
        e.preventDefault();
        if (dragType === 'channel' && dragChannelId) {
          const toCatId = catEl.dataset.catId;
          if (dragChannelCatId !== toCatId) {
            window.dataStore.moveChannelToCategory(srvObj.id, dragChannelId, dragChannelCatId, toCatId);
            renderServerChannels(srvObj, dragChannelId);
            showToast('Kanal taşındı');
          }
        }
      });
    });

    // Category reorder via dragover on category headers
    leftSidebar.querySelectorAll('.ch-category').forEach(catEl => {
      catEl.addEventListener('dragover', (e) => {
        if (dragType !== 'category' || !dragCatId) return;
        e.preventDefault();
        catEl.classList.add('drag-over');
      });
      catEl.addEventListener('dragleave', () => {
        catEl.classList.remove('drag-over');
      });
      catEl.addEventListener('drop', (e) => {
        if (dragType !== 'category' || !dragCatId) return;
        e.preventDefault();
        catEl.classList.remove('drag-over');
        const toCatId = catEl.dataset.catId;
        if (dragCatId !== toCatId) {
          const cats = [...categories];
          const fromIdx = cats.findIndex(c => c.id === dragCatId);
          const toIdx = cats.findIndex(c => c.id === toCatId);
          const [moved] = cats.splice(fromIdx, 1);
          cats.splice(toIdx, 0, moved);
          window.dataStore.reorderCategories(srvObj.id, cats);
          renderServerChannels(srvObj, window.dataStore.activeChannelId);
        }
      });
    });

    if (feedTitleText && currentCh) feedTitleText.textContent = '# ' + currentCh.name;
    updateHeaderLocation();
  }

  function showChannelContextMenu(e, serverId, categoryId, channelId) {
    const cu = window.dataStore.currentUser || { handle: '' };
    const canManageChannels = window.dataStore.isServerOwner(serverId, cu.handle) || (window.dataStore.checkServerPermission && window.dataStore.checkServerPermission(serverId, cu.handle, 'manage_channels'));
    if (!canManageChannels) {
      showToast('Kanal izinlerini ve ayarlarını yönetme yetkiniz bulunmuyor.');
      return;
    }
    document.querySelectorAll('.ch-ctx-menu').forEach(m => m.remove());
    const menu = document.createElement('div');
    menu.className = 'ch-ctx-menu';
    menu.innerHTML = `
      <button class="ch-ctx-item" id="ctx-ch-edit">
        <i data-lucide="edit-2" style="width:13px;height:13px;"></i> Kanalı Düzenle
      </button>
      <button class="ch-ctx-item ch-ctx-item--danger" id="ctx-ch-delete">
        <i data-lucide="trash-2" style="width:13px;height:13px;"></i> Kanalı Sil
      </button>`;
    menu.style.top = e.clientY + 'px';
    menu.style.left = e.clientX + 'px';
    document.body.appendChild(menu);
    refreshIcons(menu);

    menu.querySelector('#ctx-ch-edit').addEventListener('click', () => {
      menu.remove();
      window.openModalView(`channel-edit.html?serverId=${encodeURIComponent(serverId)}&categoryId=${encodeURIComponent(categoryId)}&channelId=${encodeURIComponent(channelId)}`);
    });
    menu.querySelector('#ctx-ch-delete').addEventListener('click', () => {
      menu.remove();
      const srv = window.dataStore.servers.find(s => s.id === serverId);
      const cat = srv && srv.categories ? srv.categories.find(c => c.id === categoryId) : null;
      const ch = cat ? cat.channels.find(c => c.id === channelId) : null;
      if (ch && confirm(`"#${ch.name}" kanalını silmek istiyor musunuz?`)) {
        window.dataStore.removeChannel(serverId, categoryId, channelId);
        const srvObj = window.dataStore.servers.find(s => s.id === serverId);
        if (srvObj) renderServerChannels(srvObj, window.dataStore.activeChannelId);
        showToast('Kanal silindi');
      }
    });
    setTimeout(() => {
      document.addEventListener('click', function h() { menu.remove(); document.removeEventListener('click', h); });
    }, 50);
  }

  function showCategoryContextMenu(e, serverId, categoryId) {
    const cu = window.dataStore.currentUser || { handle: '' };
    const canManageChannels = window.dataStore.isServerOwner(serverId, cu.handle) || (window.dataStore.checkServerPermission && window.dataStore.checkServerPermission(serverId, cu.handle, 'manage_channels'));
    if (!canManageChannels) {
      showToast('Kategori izinlerini ve ayarlarını yönetme yetkiniz bulunmuyor.');
      return;
    }
    document.querySelectorAll('.ch-ctx-menu').forEach(m => m.remove());
    const menu = document.createElement('div');
    menu.className = 'ch-ctx-menu';
    menu.innerHTML = `
      <button class="ch-ctx-item" id="ctx-cat-edit">
        <i data-lucide="edit-2" style="width:13px;height:13px;"></i> Kategoriyi Düzenle
      </button>
      <button class="ch-ctx-item" id="ctx-cat-add-ch">
        <i data-lucide="plus" style="width:13px;height:13px;"></i> Kanal Ekle
      </button>
      <button class="ch-ctx-item ch-ctx-item--danger" id="ctx-cat-delete">
        <i data-lucide="trash-2" style="width:13px;height:13px;"></i> Kategoriyi Sil
      </button>`;
    menu.style.top = e.clientY + 'px';
    menu.style.left = e.clientX + 'px';
    document.body.appendChild(menu);
    refreshIcons(menu);

    menu.querySelector('#ctx-cat-edit').addEventListener('click', () => {
      menu.remove();
      window.openModalView(`category-edit.html?serverId=${encodeURIComponent(serverId)}&categoryId=${encodeURIComponent(categoryId)}`);
    });
    menu.querySelector('#ctx-cat-add-ch').addEventListener('click', () => {
      menu.remove();
      const srv = window.dataStore.servers.find(s => s.id === serverId);
      const cat = srv && srv.categories ? srv.categories.find(c => c.id === categoryId) : null;
      openCreateChannelModal(serverId, categoryId, cat ? cat.name : '');
    });
    menu.querySelector('#ctx-cat-delete').addEventListener('click', () => {
      menu.remove();
      const srv = window.dataStore.servers.find(s => s.id === serverId);
      const cat = srv && srv.categories ? srv.categories.find(c => c.id === categoryId) : null;
      if (cat && confirm(`"${cat.name}" kategorisini ve içindeki tüm kanalları silmek istiyor musunuz?`)) {
        window.dataStore.removeCategory(serverId, categoryId);
        const srvObj = window.dataStore.servers.find(s => s.id === serverId);
        if (srvObj) renderServerChannels(srvObj, 'genel');
        showToast('Kategori silindi');
      }
    });
    setTimeout(() => {
      document.addEventListener('click', function h() { menu.remove(); document.removeEventListener('click', h); });
    }, 50);
  }

  function updateActiveServerInRail(serverId) {
    if (!serversListContainer) return;
    const targetIcon = serversListContainer.querySelector(`.server-icon[data-id="${serverId}"]`);
    if (!targetIcon) {
      renderServers();
      return;
    }
    serversListContainer.querySelectorAll('.server-icon').forEach(el => {
      el.classList.toggle('active', el.dataset.id === serverId);
    });
    const folders = window.dataStore.loadServerFolders() || [];
    serversListContainer.querySelectorAll('.server-folder').forEach(fEl => {
      const fId = fEl.dataset.folderId;
      const f = folders.find(x => x.id === fId);
      const hasActive = f && f.serverIds && f.serverIds.includes(serverId);
      const icon = fEl.querySelector('.server-folder-icon');
      if (icon) icon.classList.toggle('active-contained', !!hasActive);
    });
  }

  function switchToServer(serverId, targetChannelId = 'genel') {
    navRailIcons.forEach(i => i.classList.remove('active'));
    window.dataStore.activeServerId = serverId;
    window.dataStore.activeFilter = 'for-you';
    if (appLayoutEl) {
      appLayoutEl.classList.remove('hide-channels-sidebar');
      appLayoutEl.classList.remove('hide-right-sidebar');
      appLayoutEl.classList.remove('dm-active');
    }
    const srvObj = window.dataStore.servers.find(s => s.id === serverId);
    if (srvObj) {
      renderServerChannels(srvObj, targetChannelId);
    }
    if (feedPostsContainer) feedPostsContainer.style.display = '';
    if (composerCard) composerCard.style.display = 'flex';
    if (dmView) dmView.style.display = 'none';
    if (mainFeedView) mainFeedView.style.display = 'flex';
    const feedHeaderRight = document.querySelector('.feed-header-right');
    if (feedHeaderRight) feedHeaderRight.style.display = 'none';
    updateActiveServerInRail(serverId);
    triggerFeedWithSkeleton(180);
    updateRightSidebar();
  }

  // ── SUNUCU LİSTESİ & HOVER TOOLTIP ─────────────────────────
  let serverTooltipHideTimer = null;
  let serverTooltipEl = null;

  function ensureServerTooltip() {
    if (!serverTooltipEl) {
      serverTooltipEl = document.getElementById('server-hover-tooltip');
      if (!serverTooltipEl) {
        serverTooltipEl = document.createElement('div');
        serverTooltipEl.id = 'server-hover-tooltip';
        serverTooltipEl.className = 'server-hover-tooltip';
        document.body.appendChild(serverTooltipEl);
      }
    }
    return serverTooltipEl;
  }

  function showServerTooltip(e, serverId) {
    if (serverTooltipHideTimer) {
      clearTimeout(serverTooltipHideTimer);
      serverTooltipHideTimer = null;
    }
    const srv = window.dataStore.servers.find(s => s.id === serverId);
    if (!srv) return;

    const el = ensureServerTooltip();
    const initials = srv.name ? srv.name.trim().substring(0, 2).toUpperCase() : 'SR';
    const isImg = srv.icon && (srv.icon.startsWith('data:image') || srv.icon.startsWith('http'));
    const iconHtml = isImg
      ? `<img src="${srv.icon}" class="stt-avatar-img">`
      : `<span class="stt-avatar-initials">${escapeHtml(srv.icon && srv.icon.length <= 4 ? srv.icon : initials)}</span>`;

    const hasBanner = srv.banner && (srv.banner.startsWith('data:image') || srv.banner.startsWith('http'));
    const bannerStyle = hasBanner
      ? `background-image: url('${escapeHtml(srv.banner)}');`
      : `background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%);`;

    const allMembers = window.dataStore.getServerMembers(srv.inviteCode || srv.id);
    const memberCount = (allMembers && allMembers.length > 0) ? allMembers.length : (srv.memberCount || 1);
    let chCount = 0;
    (srv.categories || []).forEach(c => chCount += (c.channels || []).length);

    el.innerHTML = `
      <div class="stt-card">
        <div class="stt-banner" style="${bannerStyle}">
          <div class="stt-banner-overlay"></div>
        </div>
        <div class="stt-body">
          <div class="stt-avatar">${iconHtml}</div>
          <div class="stt-title">${escapeHtml(srv.name)}</div>
          ${srv.description ? `<div class="stt-desc">${escapeHtml(srv.description)}</div>` : ''}
          <div class="stt-meta">
            <span class="stt-dot" style="background:var(--accent-primary, #dbdbdb);"></span>
            <span class="stt-members">${memberCount} Toplam Üye</span>
            ${chCount > 0 ? `<span class="stt-divider">•</span><span>${chCount} Kanal</span>` : ''}
          </div>
        </div>
      </div>
    `;

    const rect = e.currentTarget.getBoundingClientRect();
    let left = rect.left + (rect.width / 2);
    let bottom = (window.innerHeight - rect.top) + 12;

    if (left - 100 < 10) left = 110;
    if (left + 100 > window.innerWidth - 10) left = window.innerWidth - 110;

    el.style.bottom = bottom + 'px';
    el.style.top = 'auto';
    el.style.left = left + 'px';
    el.classList.add('visible');
  }

  function hideServerTooltip() {
    serverTooltipHideTimer = setTimeout(() => {
      if (serverTooltipEl) serverTooltipEl.classList.remove('visible');
    }, 80);
  }

  function showServerContextMenu(e, serverId) {
    document.querySelectorAll('.ch-ctx-menu').forEach(m => m.remove());
    const srv = window.dataStore.servers.find(s => s.id === serverId);
    if (!srv) return;

    const isOwner = window.dataStore.isServerOwner(serverId);
    const folders = window.dataStore.loadServerFolders() || [];
    const parentFolder = folders.find(f => f.serverIds.includes(serverId));

    const menu = document.createElement('div');
    menu.className = 'ch-ctx-menu';
    menu.innerHTML = `
      <button class="ch-ctx-item" id="ctx-srv-settings">
        <i data-lucide="settings" style="width:13px;height:13px;"></i> Sunucu Ayarları
      </button>
      <button class="ch-ctx-item" id="ctx-srv-invite">
        <i data-lucide="user-plus" style="width:13px;height:13px;"></i> İnsanları Davet Et
      </button>
      ${parentFolder ? `
        <button class="ch-ctx-item" id="ctx-srv-extract-folder">
          <i data-lucide="folder-minus" style="width:13px;height:13px;"></i> Klasörden Çıkar
        </button>
      ` : ''}
      <div style="height:1px; background:var(--border-color); margin:4px 0;"></div>
      <button class="ch-ctx-item ch-ctx-item--danger" id="ctx-srv-delete">
        <i data-lucide="${isOwner ? 'trash-2' : 'log-out'}" style="width:13px;height:13px;"></i> ${isOwner ? 'Sunucuyu Sil' : 'Sunucudan Ayrıl'}
      </button>
    `;

    let top = e.clientY;
    let left = e.clientX;
    if (left + 190 > window.innerWidth) left = window.innerWidth - 200;
    if (top + 150 > window.innerHeight) top = window.innerHeight - 160;

    menu.style.top = top + 'px';
    menu.style.left = left + 'px';
    document.body.appendChild(menu);
    refreshIcons(menu);

    menu.querySelector('#ctx-srv-settings').addEventListener('click', () => {
      menu.remove();
      window.openModalView(`server-settings.html?serverId=${encodeURIComponent(serverId)}`);
    });

    menu.querySelector('#ctx-srv-invite').addEventListener('click', () => {
      menu.remove();
      showServerInviteModal(srv);
    });

    const btnExtract = menu.querySelector('#ctx-srv-extract-folder');
    if (btnExtract && parentFolder) {
      btnExtract.addEventListener('click', () => {
        menu.remove();
        window.dataStore.removeServerFromFolder(parentFolder.id, serverId);
        renderServers();
        showToast('Sunucu klasörden çıkarıldı');
      });
    }

    menu.querySelector('#ctx-srv-delete').addEventListener('click', () => {
      menu.remove();
      if (isOwner) {
        if (confirm(`"${srv.name}" sunucusunu kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) {
          window.dataStore.deleteServer(serverId);
          showToast('Sunucu silindi');
          renderServers();
          if (window.dataStore.activeServerId === serverId) {
            window.dataStore.activeServerId = 'home';
            if (navHubMainBtn) navHubMainBtn.classList.add('active');
            switchNavHubTo('for-you');
          }
        }
      } else {
        if (confirm(`"${srv.name}" sunucusundan ayrılmak istediğinize emin misiniz?`)) {
          window.dataStore.leaveServer(serverId);
          showToast('Sunucudan ayrıldınız');
          renderServers();
          if (window.dataStore.activeServerId === serverId) {
            window.dataStore.activeServerId = 'home';
            if (navHubMainBtn) navHubMainBtn.classList.add('active');
            switchNavHubTo('for-you');
          }
        }
      }
    });

    setTimeout(() => {
      document.addEventListener('click', function h() { menu.remove(); document.removeEventListener('click', h); });
    }, 50);
  }

  let draggedServerId = null;
  let draggedFolderId = null;

  function moveServerBlock(serverIdsToMove, targetServerId, placeBefore) {
    const srvs = window.dataStore.servers;
    const moveSet = new Set(serverIdsToMove);
    const moving = [];
    const remaining = [];
    srvs.forEach(s => {
      if (moveSet.has(s.id)) moving.push(s);
      else remaining.push(s);
    });

    const targetIdx = remaining.findIndex(s => s.id === targetServerId);
    if (targetIdx === -1) {
      remaining.push(...moving);
    } else {
      const insertIdx = placeBefore ? targetIdx : targetIdx + 1;
      remaining.splice(insertIdx, 0, ...moving);
    }
    window.dataStore.servers = remaining;
    window.dataStore.saveServers();
  }

  let justExpandedFolderId = null;

  function renderServers() {
    if (!serversListContainer) return;
    const allServers = window.dataStore.servers || [];
    let folders = window.dataStore.loadServerFolders() || [];

    // Geçersiz sunucu ID'lerini temizle
    const validServerIds = new Set(allServers.map(s => s.id));
    let cleaned = false;
    folders.forEach(f => {
      const origLen = f.serverIds.length;
      f.serverIds = (f.serverIds || []).filter(id => validServerIds.has(id));
      if (f.serverIds.length !== origLen) cleaned = true;
    });
    const validFolders = folders.filter(f => f.serverIds.length >= 2);
    if (validFolders.length !== folders.length) cleaned = true;
    folders = validFolders;
    if (cleaned) {
      window.dataStore.saveServerFolders(folders, false);
    }

    const folderedServerIds = new Set();
    folders.forEach(f => f.serverIds.forEach(id => folderedServerIds.add(id)));

    let html = '';
    const renderedFolderIds = new Set();

    allServers.forEach(srv => {
      if (folderedServerIds.has(srv.id)) {
        const parentFolder = folders.find(f => f.serverIds.includes(srv.id));
        if (parentFolder && !renderedFolderIds.has(parentFolder.id)) {
          renderedFolderIds.add(parentFolder.id);
          const folderServers = parentFolder.serverIds.map(id => allServers.find(s => s.id === id)).filter(Boolean);
          const hasActiveServer = folderServers.some(s => s.id === window.dataStore.activeServerId);

          if (!parentFolder.isExpanded) {
            // Kapalı 4'lü Kutu / 2x2 Mini İkonlu Klasör
            const miniPreviews = folderServers.slice(0, 4).map(fs => {
              const fInitials = fs.name ? fs.name.trim().substring(0, 2).toUpperCase() : 'SR';
              const fIsImg = fs.icon && (fs.icon.startsWith('data:image') || fs.icon.startsWith('http'));
              return `
                <div class="mini-server-icon">
                  ${fIsImg ? `<img src="${fs.icon}">` : `<span>${escapeHtml(fs.icon && fs.icon.length <= 4 ? fs.icon : fInitials)}</span>`}
                </div>
              `;
            }).join('');

            html += `
              <div class="server-folder" data-folder-id="${parentFolder.id}">
                <div class="server-folder-icon ${hasActiveServer ? 'active-contained' : ''}" data-folder-id="${parentFolder.id}" draggable="true" title="${escapeHtml(parentFolder.name || 'Klasör')} (${folderServers.length} Sunucu)">
                  ${miniPreviews}
                </div>
              </div>
            `;
          } else {
            // Açılmış Klasör / Aşağı Doğru Açılan Paket (Animasyon Sadece İlk Açılışta Çalışır)
            const isJustOpened = parentFolder.id === justExpandedFolderId;
            const serverIconsHtml = folderServers.map(fs => {
              const initials = fs.name ? fs.name.trim().substring(0, 2).toUpperCase() : 'SR';
              const isImg = fs.icon && (fs.icon.startsWith('data:image') || fs.icon.startsWith('http'));
              const iconContent = isImg
                ? `<img src="${fs.icon}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;pointer-events:none;">`
                : `<span>${escapeHtml(fs.icon && fs.icon.length <= 4 ? fs.icon : initials)}</span>`;
              return `<div class="server-icon ${fs.id === window.dataStore.activeServerId ? 'active' : ''}" data-id="${fs.id}" data-parent-folder="${parentFolder.id}" draggable="true"><div class="server-icon-badge"></div>${iconContent}</div>`;
            }).join('');

            html += `
              <div class="server-folder-expanded-container ${isJustOpened ? 'folder-opening-anim' : ''}" data-folder-id="${parentFolder.id}">
                <button class="server-folder-toggle-btn" data-folder-id="${parentFolder.id}" draggable="true" title="Klasörü Kapat">
                  <i data-lucide="chevron-left" style="width:14px;height:14px;"></i>
                </button>
                ${serverIconsHtml}
              </div>
            `;
          }
        }
      } else {
        // Tekil Sunucu İkonu
        const initials = srv.name ? srv.name.trim().substring(0, 2).toUpperCase() : 'SR';
        const isImg = srv.icon && (srv.icon.startsWith('data:image') || srv.icon.startsWith('http'));
        const iconContent = isImg
          ? `<img src="${srv.icon}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;pointer-events:none;">`
          : `<span>${escapeHtml(srv.icon && srv.icon.length <= 4 ? srv.icon : initials)}</span>`;
        html += `<div class="server-icon ${srv.id === window.dataStore.activeServerId ? 'active' : ''}" data-id="${srv.id}" draggable="true"><div class="server-icon-badge"></div>${iconContent}</div>`;
      }
    });

    serversListContainer.innerHTML = html;
    justExpandedFolderId = null;
    refreshIcons(serversListContainer);

    // 1. Klasör Açma / Kapama Tıklama & Sağ Tık Menüsü
    document.querySelectorAll('.server-folder-icon, .server-folder-toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const folderId = btn.dataset.folderId;
        const curFolders = window.dataStore.loadServerFolders() || [];
        const f = curFolders.find(x => x.id === folderId);
        if (f && !f.isExpanded) {
          justExpandedFolderId = folderId;
        } else {
          justExpandedFolderId = null;
        }
        window.dataStore.toggleServerFolder(folderId);
        renderServers();
      });

      btn.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const folderId = btn.dataset.folderId;
        showFolderContextMenu(e, folderId);
      });
    });

    function showFolderContextMenu(e, folderId) {
      document.querySelectorAll('.ch-ctx-menu').forEach(m => m.remove());
      const menu = document.createElement('div');
      menu.className = 'ch-ctx-menu';
      menu.innerHTML = `
        <button class="ch-ctx-item" id="ctx-folder-dissolve">
          <i data-lucide="folder-x" style="width:13px;height:13px;"></i> Klasörü Dağıt (Tümünü Çıkar)
        </button>
      `;
      let top = e.clientY;
      let left = e.clientX;
      if (left + 190 > window.innerWidth) left = window.innerWidth - 200;
      if (top + 80 > window.innerHeight) top = window.innerHeight - 90;
      menu.style.top = top + 'px';
      menu.style.left = left + 'px';
      document.body.appendChild(menu);
      refreshIcons(menu);

      menu.querySelector('#ctx-folder-dissolve').addEventListener('click', () => {
        menu.remove();
        window.dataStore.deleteServerFolder(folderId);
        renderServers();
        showToast('Klasör dağıtıldı');
      });

      setTimeout(() => {
        document.addEventListener('click', function h() { menu.remove(); document.removeEventListener('click', h); });
      }, 50);
    }

    // 2. KLASÖR SÜRÜKLEME (DRAG & DROP)
    document.querySelectorAll('.server-folder, .server-folder-expanded-container').forEach(folderWrap => {
      const folderId = folderWrap.dataset.folderId;
      const dragHandle = folderWrap.querySelector('.server-folder-icon, .server-folder-toggle-btn') || folderWrap;

      dragHandle.addEventListener('dragstart', (e) => {
        draggedFolderId = folderId;
        draggedServerId = null;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', 'folder:' + folderId);
        folderWrap.classList.add('dragging');
        hideServerTooltip();
      });

      folderWrap.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (draggedFolderId === folderId) return;

        const rect = folderWrap.getBoundingClientRect();
        const width = rect.width;
        const offsetX = e.clientX - rect.left;

        if (draggedFolderId) {
          if (offsetX < width / 2) {
            dragHandle.classList.add('drag-over-left', 'drag-over-top');
            dragHandle.classList.remove('drag-over-right', 'drag-over-bottom');
          } else {
            dragHandle.classList.add('drag-over-right', 'drag-over-bottom');
            dragHandle.classList.remove('drag-over-left', 'drag-over-top');
          }
        } else if (draggedServerId) {
          if (offsetX < width * 0.25) {
            dragHandle.classList.add('drag-over-left', 'drag-over-top');
            dragHandle.classList.remove('drag-over-right', 'drag-over-bottom', 'drag-over-center');
          } else if (offsetX > width * 0.75) {
            dragHandle.classList.add('drag-over-right', 'drag-over-bottom');
            dragHandle.classList.remove('drag-over-left', 'drag-over-top', 'drag-over-center');
          } else {
            dragHandle.classList.add('drag-over-center');
            dragHandle.classList.remove('drag-over-left', 'drag-over-right', 'drag-over-top', 'drag-over-bottom');
          }
        }
      });

      folderWrap.addEventListener('dragleave', () => {
        dragHandle.classList.remove('drag-over-top', 'drag-over-bottom', 'drag-over-left', 'drag-over-right', 'drag-over-center');
      });

      folderWrap.addEventListener('drop', (e) => {
        e.preventDefault();
        const isTop = dragHandle.classList.contains('drag-over-top') || dragHandle.classList.contains('drag-over-left');
        const isBottom = dragHandle.classList.contains('drag-over-bottom') || dragHandle.classList.contains('drag-over-right');
        const isCenter = dragHandle.classList.contains('drag-over-center');
        dragHandle.classList.remove('drag-over-top', 'drag-over-bottom', 'drag-over-left', 'drag-over-right', 'drag-over-center');

        const curFolders = window.dataStore.loadServerFolders() || [];
        const targetFolder = curFolders.find(f => f.id === folderId);
        if (!targetFolder) return;

        if (draggedFolderId && draggedFolderId !== folderId) {
          const draggedFolder = curFolders.find(f => f.id === draggedFolderId);
          if (!draggedFolder) return;
          const refServerId = isTop ? targetFolder.serverIds[0] : targetFolder.serverIds[targetFolder.serverIds.length - 1];
          moveServerBlock(draggedFolder.serverIds, refServerId, isTop);
          renderServers();
          showToast('Klasör sıralandı');
          return;
        }

        if (draggedServerId) {
          const parentFolderOfDragged = document.querySelector(`.server-icon[data-id="${draggedServerId}"]`)?.dataset.parentFolder;

          if (isCenter) {
            if (parentFolderOfDragged && parentFolderOfDragged !== folderId) {
              window.dataStore.removeServerFromFolder(parentFolderOfDragged, draggedServerId);
            }
            window.dataStore.addServerToFolder(folderId, draggedServerId);
            renderServers();
            showToast('Sunucu klasöre eklendi');
            return;
          }

          if (parentFolderOfDragged) {
            window.dataStore.removeServerFromFolder(parentFolderOfDragged, draggedServerId);
          }
          const refServerId = isTop ? targetFolder.serverIds[0] : targetFolder.serverIds[targetFolder.serverIds.length - 1];
          moveServerBlock([draggedServerId], refServerId, isTop);
          renderServers();
        }
      });

      dragHandle.addEventListener('dragend', () => {
        draggedFolderId = null;
        draggedServerId = null;
        document.querySelectorAll('.servers-rail .server-icon, .servers-rail .server-folder, .servers-rail .server-folder-expanded-container').forEach(item => {
          item.classList.remove('dragging', 'drag-over-top', 'drag-over-bottom', 'drag-over-left', 'drag-over-right', 'drag-over-center');
        });
      });
    });

    // 3. TEKİL SUNUCU İKONLARI (Tıklama, Hover, ContextMenu, Drag & Drop)
    const serverEls = document.querySelectorAll('.servers-rail .server-icon[data-id]');

    serverEls.forEach(el => {
      el.addEventListener('click', () => {
        hideServerTooltip();
        if (navHubMainBtn) navHubMainBtn.classList.remove('active');
        if (navHubFlyout) navHubFlyout.classList.remove('open');
        switchToServer(el.dataset.id);
      });

      el.addEventListener('mouseenter', (e) => {
        if (!draggedServerId && !draggedFolderId) showServerTooltip(e, el.dataset.id);
      });

      el.addEventListener('mouseleave', () => {
        hideServerTooltip();
      });

      el.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        hideServerTooltip();
        showServerContextMenu(e, el.dataset.id);
      });

      // DRAG & DROP
      el.addEventListener('dragstart', (e) => {
        draggedServerId = el.dataset.id;
        draggedFolderId = null;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', 'server:' + el.dataset.id);
        el.classList.add('dragging');
        hideServerTooltip();
      });

      el.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (draggedServerId === el.dataset.id) return;

        const rect = el.getBoundingClientRect();
        const width = rect.width;
        const offsetX = e.clientX - rect.left;

        if (draggedFolderId) {
          if (offsetX < width / 2) {
            el.classList.add('drag-over-left', 'drag-over-top');
            el.classList.remove('drag-over-right', 'drag-over-bottom');
          } else {
            el.classList.add('drag-over-right', 'drag-over-bottom');
            el.classList.remove('drag-over-left', 'drag-over-top');
          }
        } else if (draggedServerId) {
          if (offsetX < width * 0.25) {
            el.classList.add('drag-over-left', 'drag-over-top');
            el.classList.remove('drag-over-right', 'drag-over-bottom', 'drag-over-center');
          } else if (offsetX > width * 0.75) {
            el.classList.add('drag-over-right', 'drag-over-bottom');
            el.classList.remove('drag-over-left', 'drag-over-top', 'drag-over-center');
          } else {
            el.classList.add('drag-over-center');
            el.classList.remove('drag-over-left', 'drag-over-right', 'drag-over-top', 'drag-over-bottom');
          }
        }
      });

      el.addEventListener('dragleave', () => {
        el.classList.remove('drag-over-top', 'drag-over-bottom', 'drag-over-left', 'drag-over-right', 'drag-over-center');
      });

      el.addEventListener('drop', (e) => {
        e.preventDefault();
        const isTop = el.classList.contains('drag-over-top') || el.classList.contains('drag-over-left');
        const isCenter = el.classList.contains('drag-over-center');
        el.classList.remove('drag-over-top', 'drag-over-bottom', 'drag-over-left', 'drag-over-right', 'drag-over-center');
        const targetId = el.dataset.id;

        // EĞER KLASÖR SÜRÜKLENDİYSE
        if (draggedFolderId) {
          const curFolders = window.dataStore.loadServerFolders() || [];
          const draggedFolder = curFolders.find(f => f.id === draggedFolderId);
          if (draggedFolder) {
            moveServerBlock(draggedFolder.serverIds, targetId, isTop);
            renderServers();
            showToast('Klasör taşındı');
          }
          return;
        }

        // EĞER SUNUCU SÜRÜKLENDİYSE
        if (!draggedServerId || draggedServerId === targetId) return;

        const parentFolderOfTarget = el.dataset.parentFolder;
        const parentFolderOfDragged = document.querySelector(`.server-icon[data-id="${draggedServerId}"]`)?.dataset.parentFolder;

        if (isCenter) {
          // ÜST ÜSTE BİNDİRİNCE 4'LÜ KUTU / KLASÖR HALİNE GETİR
          if (parentFolderOfTarget) {
            window.dataStore.addServerToFolder(parentFolderOfTarget, draggedServerId);
          } else {
            window.dataStore.createServerFolder([targetId, draggedServerId], 'Klasör');
          }
          if (parentFolderOfDragged && parentFolderOfDragged !== parentFolderOfTarget) {
            window.dataStore.removeServerFromFolder(parentFolderOfDragged, draggedServerId);
          }
          renderServers();
          showToast('Sunucular klasörlendi (4\'lü kutu)');
          return;
        }

        // YUKARI / AŞAĞI SIRALAMA VEYA KLASÖRDEN DIŞARI BIRAKMA
        if (parentFolderOfDragged && parentFolderOfDragged !== parentFolderOfTarget) {
          window.dataStore.removeServerFromFolder(parentFolderOfDragged, draggedServerId);
          showToast('Sunucu klasörden çıkarıldı');
        }

        moveServerBlock([draggedServerId], targetId, isTop);
        renderServers();
      });

      el.addEventListener('dragend', () => {
        draggedServerId = null;
        draggedFolderId = null;
        document.querySelectorAll('.servers-rail .server-icon, .servers-rail .server-folder, .servers-rail .server-folder-expanded-container').forEach(item => {
          item.classList.remove('dragging', 'drag-over-top', 'drag-over-bottom', 'drag-over-left', 'drag-over-right', 'drag-over-center');
        });
      });
    });

    // 4. Ray Boşluğuna / Dışarı Sürükleyip Bırakma (Klasörden Çıkarma)
    serversListContainer.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });

    serversListContainer.addEventListener('drop', (e) => {
      if (e.target.closest('.server-icon') || e.target.closest('.server-folder') || e.target.closest('.server-folder-expanded-container')) return;
      e.preventDefault();
      if (draggedServerId) {
        const parentFolderOfDragged = document.querySelector(`.server-icon[data-id="${draggedServerId}"]`)?.dataset.parentFolder;
        if (parentFolderOfDragged) {
          window.dataStore.removeServerFromFolder(parentFolderOfDragged, draggedServerId);
          renderServers();
          showToast('Sunucu klasörden çıkarıldı');
        }
      }
    });

    // Taskbar yatay mouse-wheel kaydırma desteği
    const serversScrollArea = document.getElementById('servers-scrollable-area');
    if (serversScrollArea && !serversScrollArea._wheelAttached) {
      serversScrollArea._wheelAttached = true;
      serversScrollArea.addEventListener('wheel', (e) => {
        if (e.deltaY !== 0) {
          e.preventDefault();
          serversScrollArea.scrollLeft += e.deltaY;
        }
      }, { passive: false });
    }
  }

  window.renderServers = renderServers;
  window.updateLiveServerMedia = function (serverId, icon, banner) {
    if (window.dataStore && window.dataStore.servers) {
      const s = window.dataStore.servers.find(srv => String(srv.id) === String(serverId));
      if (s) {
        if (icon !== undefined && icon !== null) s.icon = icon;
        if (banner !== undefined && banner !== null) s.banner = banner;
        window.dataStore.saveServers();
      }
    }
    renderServers();
    if (window.dataStore && window.dataStore.activeServerId === serverId) {
      const s = window.dataStore.servers.find(srv => String(srv.id) === String(serverId));
      if (s) renderServerChannels(s, window.dataStore.activeChannelId);
    }
  };

  function renderVoiceChannels() {
    if (!voiceChannelsContainer) return;
    if (window.dataStore.voiceChannels.length === 0) {
      voiceChannelsContainer.innerHTML = `<div style="font-size:0.78rem;color:var(--text-muted);padding:4px 0;">Henuz ses odasi yok.</div>`; return;
    }
    voiceChannelsContainer.innerHTML = window.dataStore.voiceChannels.map(vc => `
      <div class="voice-channel-item">
        <span class="voice-name"><i data-lucide="mic" style="width:14px;height:14px;"></i> ${escapeHtml(vc.name)}</span>
        <button class="btn-join-voice" data-name="${escapeHtml(vc.name)}">Katil (${vc.activeUsers})</button>
      </div>`).join('');
    document.querySelectorAll('.btn-join-voice').forEach(btn => {
      btn.addEventListener('click', () => {
        if (voiceActiveName) voiceActiveName.textContent = btn.dataset.name;
        if (voiceActiveBar) voiceActiveBar.style.display = 'flex';
        if (window.audioSynth) window.audioSynth.playVoiceJoin();
        showToast(btn.dataset.name + ' ses kanalina katildiniz');
      });
    });
    refreshIcons(voiceChannelsContainer);
  }

  function renderOnlineMembers() {
    if (!onlineMembersContainer) return;
    const dir = window.dataStore._loadGlobalDirectory();
    const cu = window.dataStore.currentUser || { handle: '@kullanici', name: 'Kullanıcı', avatar: window.DEFAULT_AVATAR };
    const myStatus = window.dataStore.userStatus || { type: 'online', text: '' };
    const isMeOnline = myStatus.type !== 'invisible';
    const onlineHandles = (window.__globalOnlineHandles || []).map(h => h.toLowerCase());

    const allUsersMap = new Map();
    // Kendimizi ekle
    allUsersMap.set(cu.handle.toLowerCase(), {
      handle: cu.handle,
      name: cu.name,
      avatar: cu.avatar || window.DEFAULT_AVATAR,
      status: myStatus,
      isOnline: isMeOnline,
      isSelf: true
    });

    // Global dizindeki diğer kullanıcıları ekle
    Object.keys(dir).forEach(k => {
      const u = dir[k];
      if (u && u.handle) {
        const cleanH = u.handle.toLowerCase();
        if (cleanH === cu.handle.toLowerCase()) return;
        const uStatus = u.status || { type: 'offline', text: '' };
        const isOnline = onlineHandles.includes(cleanH) && uStatus.type !== 'offline' && uStatus.type !== 'invisible';
        allUsersMap.set(cleanH, {
          handle: u.handle,
          name: u.name || u.handle.replace('@', ''),
          avatar: u.avatar || window.DEFAULT_AVATAR,
          status: uStatus,
          isOnline: isOnline,
          isSelf: false
        });
      }
    });

    const userList = Array.from(allUsersMap.values());
    const on = userList.filter(u => u.isOnline);
    const off = userList.filter(u => !u.isOnline);

    const statusColors = { online: '#22c55e', idle: '#eab308', dnd: '#ef4444', invisible: '#737373', offline: '#737373' };
    const statusLabels = { online: 'Çevrimiçi', idle: 'Boşta', dnd: 'Rahatsız Etmeyin', invisible: 'Çevrim dışı', offline: 'Çevrim dışı' };

    let html = `<div class="user-category-label">ÇEVRİMİÇİ — ${on.length}</div>`;
    html += on.map(u => {
      const stType = u.status?.type || 'online';
      const color = statusColors[stType] || '#22c55e';
      const customTxt = u.status?.text ? `"${u.status.text}"` : (statusLabels[stType] || 'Çevrimiçi');
      return `
        <div class="user-member-item" data-handle="${u.handle}">
          <div class="avatar-wrapper-status">
            <img class="user-avatar-sm" src="${u.avatar}" alt="${escapeHtml(u.name)}">
          </div>
          <div style="display:flex;flex-direction:column;gap:1px;min-width:0;">
            <span class="user-member-name">${escapeHtml(u.name)}${u.isSelf ? ' <span style="font-size:0.68rem;color:var(--text-muted)">(sen)</span>' : ''}</span>
            <span class="user-member-status" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:130px;" title="${escapeHtml(customTxt)}">${escapeHtml(customTxt)}</span>
          </div>
        </div>`;
    }).join('');

    if (off.length > 0) {
      html += `<div class="user-category-label" style="margin-top:10px;">ÇEVRİM DIŞI — ${off.length}</div>`;
      html += off.map(u => `
        <div class="user-member-item" style="opacity:0.55;" data-handle="${u.handle}">
          <div class="avatar-wrapper-status">
            <img class="user-avatar-sm" src="${u.avatar}" alt="${escapeHtml(u.name)}">
          </div>
          <div style="display:flex;flex-direction:column;gap:1px;min-width:0;">
            <span class="user-member-name">${escapeHtml(u.name)}</span>
            <span class="user-member-status">Çevrim dışı</span>
          </div>
        </div>`).join('');
    }

    onlineMembersContainer.innerHTML = html;
    onlineMembersContainer.querySelectorAll('.user-member-item').forEach(item => {
      item.addEventListener('click', (e) => { if (item.dataset.handle) showUserProfilePopover(e, item.dataset.handle); });
    });
  }

  // ── DM SİSTEMİ ───────────────────────────────────────────────
  document.querySelectorAll('.dm-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.dm-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeDmTab = tab.dataset.dmTab;
      activeDmThreadId = null;
      renderDMs();
    });
  });

  const btnOpenCreateDm = document.getElementById('btn-open-create-dm');
  if (btnOpenCreateDm) {
    btnOpenCreateDm.addEventListener('click', (e) => {
      e.stopPropagation();
      // Mevcut dropdown varsa kaldır
      const existing = document.getElementById('add-friend-dropdown');
      if (existing) { existing.remove(); return; }

      const dd = document.createElement('div');
      dd.id = 'add-friend-dropdown';
      dd.className = 'add-friend-dropdown';
      dd.innerHTML = `
        <div class="afd-title">Arkadas Ekle</div>
        <p class="afd-subtitle">Kullanici adini girerek arkadas istegi gonder.</p>
        <div class="afd-row">
          <input id="afd-input" class="afd-input" type="text" placeholder="@kullanici">
          <button id="afd-submit" class="afd-btn">Istek Gonder</button>
        </div>
        <div id="afd-msg" class="afd-msg"></div>`;

      const rect = btnOpenCreateDm.getBoundingClientRect();
      dd.style.top = (rect.bottom + 6) + 'px';
      dd.style.left = rect.left + 'px';
      document.body.appendChild(dd);

      const inp = dd.querySelector('#afd-input');
      const msg = dd.querySelector('#afd-msg');
      inp.focus();

      function trySubmit() {
        const val = inp.value.trim();
        if (!val) { msg.textContent = 'Kullanici adi giriniz.'; msg.className = 'afd-msg error'; return; }
        const h = val.startsWith('@') ? val : '@' + val;
        if (h === window.dataStore.currentUser.handle) { msg.textContent = 'Kendinize istek gonderemezsiniz.'; msg.className = 'afd-msg error'; return; }
        if (window.dataStore.isFriend(h)) { msg.textContent = 'Bu kisi zaten arkadasiniz.'; msg.className = 'afd-msg error'; return; }
        if (window.dataStore.hasPendingOutgoing(h)) { msg.textContent = 'Zaten istek gonderdiniz.'; msg.className = 'afd-msg error'; return; }
        window.dataStore.sendFriendRequest(h, h.replace('@', ''), '');
        msg.textContent = h + ' adresine istek gonderildi!';
        msg.className = 'afd-msg success';
        inp.value = '';
        setTimeout(() => { dd.remove(); activeDmTab = 'outgoing'; document.querySelectorAll('.dm-tab').forEach(t => t.classList.toggle('active', t.dataset.dmTab === 'outgoing')); renderDMs(); }, 1200);
      }

      dd.querySelector('#afd-submit').addEventListener('click', trySubmit);
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') trySubmit(); });

      setTimeout(() => {
        document.addEventListener('click', function h(ev) {
          if (!dd.contains(ev.target) && ev.target !== btnOpenCreateDm) { dd.remove(); document.removeEventListener('click', h); }
        });
      }, 0);
    });
  }

  function renderDMs() {
    if (!dmTabFriends) return;
    // Her render'da thread listesini taze oku
    window.dataStore.dmThreads = window.dataStore.loadDMs();
    const ds = window.dataStore;
    const threads = ds.dmThreads;
    const friends = ds.friends || [];
    const incoming = (ds.friendRequests && ds.friendRequests.incoming) || [];
    const outgoing = (ds.friendRequests && ds.friendRequests.outgoing) || [];

    // Önce tüm panelleri gizle
    if (dmTabFriends) dmTabFriends.style.display = 'none';
    if (dmTabIncoming) dmTabIncoming.style.display = 'none';
    if (dmTabOutgoing) dmTabOutgoing.style.display = 'none';

    if (dmIncomingBadge) { dmIncomingBadge.textContent = incoming.length; dmIncomingBadge.style.display = incoming.length > 0 ? '' : 'none'; }

    if (activeDmTab === 'friends') {
      if (dmTabFriends) dmTabFriends.style.display = '';
      if (friends.length === 0) {
        dmTabFriends.innerHTML = `<div class="dm-empty">Henuz arkadasiniz yok.<br>+ butonuna basarak istek gonderin.</div>`;
      } else {
        const onlineHandles = (window.__globalOnlineHandles || []).map(h => h.toLowerCase());
        const statusColors = { online: '#22c55e', idle: '#eab308', dnd: '#ef4444', invisible: '#737373', offline: '#737373' };

        dmTabFriends.innerHTML = friends.map(f => {
          const cleanH = f.handle.toLowerCase();
          const fProfile = ds.getUserProfile(f.handle);
          const fAvatar = fProfile.avatar || window.DEFAULT_AVATAR;
          const otherSt = fProfile.status || { type: 'offline', text: '' };
          const isOnline = onlineHandles.includes(cleanH) && otherSt.type !== 'offline' && otherSt.type !== 'invisible';
          const stType = isOnline ? (otherSt.type || 'online') : 'offline';
          const dotColor = statusColors[stType] || (isOnline ? '#22c55e' : '#737373');

          const msgs = ds.getThreadMessages(f.handle);
          const lastMsg = msgs.length > 0 ? (msgs[msgs.length - 1].text || 'Sunucu daveti') : 'Sohbet baslatmak icin tiklayin';
          const thread = threads.find(t => t.user && t.user.handle === f.handle);
          const isActive = thread && thread.id === activeDmThreadId;
          return `<div class="dm-friend-item ${isActive ? 'active' : ''}" data-handle="${f.handle}" style="${!isOnline ? 'opacity:0.65;' : ''}">
            <div class="dm-friend-avatar-wrap" style="position:relative; width:36px; height:36px; border-radius:50%; overflow:hidden; flex-shrink:0;">
              ${renderMediaAvatarHtml(fAvatar, 'dm-friend-avatar')}
            </div>
            <div class="dm-friend-info">
              <span class="dm-friend-name">${escapeHtml(fProfile.name)}</span>
              <span class="dm-friend-last">${escapeHtml(lastMsg.substring(0, 40))}${lastMsg.length > 40 ? '...' : ''}</span>
            </div>
          </div>`;
        }).join('');
        dmTabFriends.querySelectorAll('.dm-friend-item').forEach(item => {
          item.addEventListener('click', () => {
            const handle = item.dataset.handle;
            const friend = friends.find(f => f.handle === handle);
            if (!friend) return;
            let thread = threads.find(t => t.user && t.user.handle === handle);
            if (!thread) {
              const fp = ds.getUserProfile(handle);
              thread = { id: 'dm-' + Date.now(), user: { name: fp.name, handle: fp.handle, avatar: fp.avatar }, messages: [] };
              window.dataStore.dmThreads.unshift(thread);
              window.dataStore.saveDMs();
            }
            if (activeDmThreadId !== thread.id) {
              activeDmThreadId = thread.id;
              triggerDmWithSkeleton(160);
            } else {
              renderDMs();
            }
          });
        });
      }
    }

    if (activeDmTab === 'incoming') {
      if (dmTabIncoming) dmTabIncoming.style.display = '';
      if (incoming.length === 0) {
        dmTabIncoming.innerHTML = `<div class="dm-empty">Gelen arkadaşlık isteği yok.</div>`;
      } else {
        dmTabIncoming.innerHTML = incoming.map(req => {
          const reqProfile = ds.getUserProfile(req.handle);
          const reqAvatar = reqProfile.avatar || window.DEFAULT_AVATAR;
          return `
          <div class="dm-request-item" data-handle="${req.handle}">
            <div style="position:relative; width:36px; height:36px; border-radius:50%; overflow:hidden; flex-shrink:0;">
              ${renderMediaAvatarHtml(reqAvatar, 'dm-friend-avatar')}
            </div>
            <div class="dm-request-info"><span class="dm-friend-name">${escapeHtml(reqProfile.name)}</span><span class="dm-friend-last">${escapeHtml(req.handle)}</span>${req.firstMessage ? `<span class="dm-request-msg">"${escapeHtml(req.firstMessage)}"</span>` : ''}</div>
            <div class="dm-request-actions"><button class="dm-req-accept" data-handle="${req.handle}">Kabul</button><button class="dm-req-reject" data-handle="${req.handle}">Reddet</button></div>
          </div>`;
        }).join('');
        dmTabIncoming.querySelectorAll('.dm-req-accept').forEach(btn => {
          btn.addEventListener('click', () => {
            ds.acceptFriendRequest(btn.dataset.handle);
            showToast(btn.dataset.handle + ' arkadaşlığı kabul edildi');
            activeDmTab = 'friends';
            document.querySelectorAll('.dm-tab').forEach(t => t.classList.toggle('active', t.dataset.dmTab === 'friends'));
            renderDMs();
          });
        });
        dmTabIncoming.querySelectorAll('.dm-req-reject').forEach(btn => {
          btn.addEventListener('click', () => { ds.rejectFriendRequest(btn.dataset.handle); showToast('İstek reddedildi'); renderDMs(); });
        });
      }
    }

    if (activeDmTab === 'outgoing') {
      if (dmTabOutgoing) dmTabOutgoing.style.display = '';
      dmTabOutgoing.innerHTML = outgoing.length === 0
        ? `<div class="dm-empty">Gönderilen istek yok.</div>`
        : outgoing.map(req => {
          const reqProfile = ds.getUserProfile(req.handle);
          const reqAvatar = reqProfile.avatar || window.DEFAULT_AVATAR;
          return `
          <div class="dm-request-item">
            <div style="position:relative; width:36px; height:36px; border-radius:50%; overflow:hidden; flex-shrink:0;">
              ${renderMediaAvatarHtml(reqAvatar, 'dm-friend-avatar')}
            </div>
            <div class="dm-request-info"><span class="dm-friend-name">${escapeHtml(reqProfile.name)}</span><span class="dm-friend-last">${escapeHtml(req.handle)}</span>${req.firstMessage ? `<span class="dm-request-msg">"${escapeHtml(req.firstMessage)}"</span>` : ''}</div>
            <span class="dm-pending-label">Beklemede</span>
          </div>`;
        }).join('');
    }

    const activeThread = threads.find(t => t.id === activeDmThreadId);
    if (!activeThread) {
      const dmChatHeaderBar = document.getElementById('dm-chat-header-bar');
      if (dmChatHeaderBar) {
        dmChatHeaderBar.innerHTML = `<div id="dm-chat-header-info" class="dm-chat-header-info"><span id="dm-chat-user-title" class="dm-chat-title">Bir sohbet seçin</span></div>`;
      } else if (dmChatUserTitle) {
        dmChatUserTitle.textContent = 'Bir sohbet secin';
      }
      if (dmInputBar) dmInputBar.style.display = 'none';
      if (dmChatMessages) dmChatMessages.innerHTML = `<div class="dm-empty-chat"><i data-lucide="message-circle" style="width:40px;height:40px;color:var(--text-dim);margin-bottom:12px;"></i><p>Sol panelden bir arkadasinizi secin.</p></div>`;
      refreshIcons();
    } else {
      const opponentProfile = ds.getUserProfile(activeThread.user.handle);
      activeThread.user.name = opponentProfile.name || activeThread.user.name;
      activeThread.user.avatar = opponentProfile.avatar || window.DEFAULT_AVATAR;

      const dmChatHeaderBar = document.getElementById('dm-chat-header-bar');
      if (dmChatHeaderBar) {
        dmChatHeaderBar.innerHTML = `
          <div id="dm-chat-header-info" class="dm-chat-header-info" data-handle="${escapeHtml(opponentProfile.handle)}" style="cursor:pointer; display:flex; align-items:center; gap:10px;" title="${escapeHtml(opponentProfile.name)} - Profili gor">
            <div style="width:34px; height:34px; border-radius:50%; overflow:hidden; position:relative; flex-shrink:0;">
              ${renderMediaAvatarHtml(opponentProfile.avatar, 'dm-header-avatar')}
            </div>
            <div style="display:flex; flex-direction:column;">
              <span id="dm-chat-user-title" class="dm-chat-title">${escapeHtml(opponentProfile.name)}</span>
              <span style="font-size:0.82rem; color:var(--text-muted); font-family:var(--font-fraunces); font-weight:600; letter-spacing:0.1px;">${escapeHtml(opponentProfile.handle)}</span>
            </div>
          </div>`;
        const headerInfo = dmChatHeaderBar.querySelector('#dm-chat-header-info');
        if (headerInfo) {
          headerInfo.addEventListener('click', (e) => showUserProfilePopover(e, opponentProfile.handle));
        }
      } else if (dmChatUserTitle) {
        dmChatUserTitle.textContent = activeThread.user.name;
      }

      if (dmInputBar) dmInputBar.style.display = 'flex';
      if (dmChatMessages) {
        // Mesajlari paylasimli key'den oku
        const messages = window.dataStore.getThreadMessages(activeThread.user.handle);

        if (messages.length === 0) {
          dmChatMessages.innerHTML = `<div class="dm-empty-chat"><p>${escapeHtml(activeThread.user.name)} ile sohbet baslatildi. Ilk mesaji siz yazin!</p></div>`;
        } else {
          const me = ds.currentUser.handle;
          dmChatMessages.innerHTML = messages.map(m => {
            const mine = m.senderHandle === me;
            const senderHandle = mine ? me : activeThread.user.handle;
            const senderProfile = ds.getUserProfile(senderHandle);
            const authorAvatar = senderProfile.avatar || window.DEFAULT_AVATAR;
            const authorName = senderProfile.name || (mine ? ds.currentUser.name : activeThread.user.name);
            const authorFrame = senderProfile.avatarFrame;
            const authorNameStyle = getAuthorNameStyleAttr(senderProfile, null);

            if (m.type === 'server-invite') {
              return `
                <div class="dm-msg-row ${mine ? 'mine' : 'theirs'}">
                  <div class="dm-msg-avatar-wrap" data-handle="${escapeHtml(senderHandle)}" style="width:36px; height:36px; border-radius:50%; overflow:visible; position:relative; flex-shrink:0; cursor:pointer;" title="${escapeHtml(authorName)} - Profili gor">
                    ${renderMediaAvatarHtml(authorAvatar, 'dm-msg-avatar')}
                    ${renderAvatarFrameHtml(authorFrame)}
                  </div>
                  <div class="dm-msg-body">
                    <div class="dm-msg-meta">
                      <span class="dm-msg-name" style="cursor:pointer;" data-handle="${escapeHtml(senderHandle)}" ${authorNameStyle}>${escapeHtml(authorName)}</span>
                      <span class="dm-msg-time">${formatDateTime(m.timestamp)}</span>
                    </div>
                    ${renderInviteCardHtml(m.invite)}
                  </div>
                </div>`;
            }

            let mediaHtml = '';
            if (m.image) {
              mediaHtml += `<img class="dm-attach-media" src="${escapeHtml(m.image)}" alt="Görsel" style="max-width:320px;max-height:280px;border-radius:8px;margin-top:6px;display:block;cursor:pointer;" onclick="window.open('${escapeHtml(m.image)}')">`;
            }
            if (m.video) {
              mediaHtml += `<video class="dm-attach-media" controls playsinline src="${escapeHtml(m.video)}" style="max-width:320px;max-height:280px;border-radius:8px;margin-top:6px;display:block;background:#000;"></video>`;
            }
            if (m.file) {
              mediaHtml += `
                <a class="dm-attach-file-card" href="${escapeHtml(m.file.url)}" download="${escapeHtml(m.file.name)}" target="_blank" style="display:inline-flex;align-items:center;gap:8px;padding:8px 12px;background:var(--bg-card);border:1px solid var(--border-dark);border-radius:8px;margin-top:6px;text-decoration:none;color:var(--text-main);max-width:280px;">
                  <i data-lucide="file-text" style="width:18px;height:18px;flex-shrink:0;"></i>
                  <div style="display:flex;flex-direction:column;overflow:hidden;flex:1;">
                    <span style="font-size:0.8rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(m.file.name)}</span>
                    <span style="font-size:0.68rem;color:var(--text-muted);">${formatBytes(m.file.size || 0)}</span>
                  </div>
                  <i data-lucide="download" style="width:14px;height:14px;flex-shrink:0;color:var(--text-muted);"></i>
                </a>
              `;
            }

            // Tüm Linklerin Önizlemesi (YouTube, Görseller, Web Siteleri, GitHub, Spotify, vb.)
            if (m.text) {
              const urls = extractAllUrls(m.text);
              for (const u of urls) {
                mediaHtml += renderGenericLinkEmbedHtml(u);
              }
            }

            return `
              <div class="dm-msg-row ${mine ? 'mine' : 'theirs'}">
                <div class="dm-msg-avatar-wrap" data-handle="${escapeHtml(senderHandle)}" style="width:36px; height:36px; border-radius:50%; overflow:visible; position:relative; flex-shrink:0; cursor:pointer;" title="${escapeHtml(authorName)} - Profili gor">
                  ${renderMediaAvatarHtml(authorAvatar, 'dm-msg-avatar')}
                  ${renderAvatarFrameHtml(authorFrame)}
                </div>
                <div class="dm-msg-body">
                  <div class="dm-msg-meta">
                    <span class="dm-msg-name" style="cursor:pointer;" data-handle="${escapeHtml(senderHandle)}" ${authorNameStyle}>${escapeHtml(authorName)}</span>
                    <span class="dm-msg-time">${formatDateTime(m.timestamp)}</span>
                  </div>
                  ${m.text ? `<div class="dm-msg-text">${parseContentFormatting(m.text)}</div>` : ''}
                  ${mediaHtml}
                </div>
              </div>`;
          }).join('');
          scrollContainerToBottom(dmChatMessages);
          hydrateLinkPreviews(dmChatMessages);

          // Mesaj avatarlarına tıklayınca popover tooltip aç
          dmChatMessages.querySelectorAll('.dm-msg-avatar, .dm-msg-name').forEach(el => {
            el.addEventListener('click', (e) => {
              e.stopPropagation();
              if (el.dataset.handle) {
                showUserProfilePopover(e, el.dataset.handle);
              }
            });
          });

          // Davet kartı butonları
          dmChatMessages.querySelectorAll('.dm-invite-copy').forEach(btn => {
            btn.addEventListener('click', () => {
              navigator.clipboard.writeText(btn.dataset.url || '')
                .then(() => showToast('Kopyalandi'))
                .catch(() => showToast('Kopyalanamadi'));
            });
          });
          dmChatMessages.querySelectorAll('.dm-invite-join').forEach(btn => {
            btn.addEventListener('click', () => {
              const serverId = btn.dataset.serverId;
              if (serverId) {
                showToast('Sunucuya geçildi');
                renderServers();
                switchToServer(serverId);
                return;
              }
              const code = btn.dataset.code;
              if (!code) return;
              const existingSrv = window.dataStore.servers.find(s => s.inviteCode === code);
              if (existingSrv) {
                showToast('Sunucuya geçildi');
                renderServers();
                switchToServer(existingSrv.id);
                return;
              }
              const result = window.dataStore.joinByInviteCode(code);
              if (result && result.error) { showToast(result.error); return; }
              if (result && result.server) {
                showToast(result.server.name + ' sunucusuna katıldınız!');
                renderServers();
                switchToServer(result.server.id);
              }
            });
          });
        }
      }
    }
    updateRightSidebar();
    refreshIcons(dmView);
  }

  // DM EKLERİ (FOTOĞRAF, VİDEO, DOSYA)
  function clearDmAttachment() {
    dmAttachedImage = null;
    dmAttachedVideo = null;
    dmAttachedFile = null;
    if (dmAttachPreviewBar) dmAttachPreviewBar.style.display = 'none';
    if (dmAttachPreviewContent) dmAttachPreviewContent.innerHTML = '';
  }

  if (btnDmRemoveAttach) {
    btnDmRemoveAttach.addEventListener('click', clearDmAttachment);
  }

  if (btnDmAttachImage) btnDmAttachImage.addEventListener('click', () => dmFileImage && dmFileImage.click());
  if (dmFileImage) {
    dmFileImage.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const formData = new FormData();
        formData.append('file', file);
        const resp = await fetch('http://localhost:3000/api/upload', { method: 'POST', body: formData, signal: AbortSignal.timeout(6000) });
        const data = await resp.json();
        if (data && data.success && data.url) {
          clearDmAttachment();
          dmAttachedImage = 'http://localhost:3000' + data.url;
          if (dmAttachPreviewBar && dmAttachPreviewContent) {
            dmAttachPreviewContent.innerHTML = `🖼️ Fotoğraf: <strong>${escapeHtml(file.name)}</strong> (${formatBytes(file.size)})`;
            dmAttachPreviewBar.style.display = 'flex';
          }
          showToast('Fotoğraf seçildi');
          return;
        }
      } catch { }

      if (window.openImageCropper) {
        window.openImageCropper({
          file: file,
          shape: 'rect',
          title: 'Mesaj Fotoğrafını Ayarla',
          onCrop: (croppedDataUrl) => {
            clearDmAttachment();
            dmAttachedImage = croppedDataUrl;
            if (dmAttachPreviewBar && dmAttachPreviewContent) {
              dmAttachPreviewContent.innerHTML = `🖼️ Fotoğraf: <strong>${escapeHtml(file.name)}</strong> (${formatBytes(file.size)})`;
              dmAttachPreviewBar.style.display = 'flex';
            }
            showToast('Fotoğraf hazırlandı');
          }
        });
      } else {
        const r = new FileReader();
        r.onload = (ev) => {
          clearDmAttachment();
          dmAttachedImage = ev.target.result;
          if (dmAttachPreviewBar && dmAttachPreviewContent) {
            dmAttachPreviewContent.innerHTML = `🖼️ Fotoğraf: <strong>${escapeHtml(file.name)}</strong> (${formatBytes(file.size)})`;
            dmAttachPreviewBar.style.display = 'flex';
          }
          showToast('Fotoğraf seçildi');
        };
        r.readAsDataURL(file);
      }
      dmFileImage.value = '';
    });
  }

  if (btnDmAttachVideo) btnDmAttachVideo.addEventListener('click', () => dmFileVideo && dmFileVideo.click());
  if (dmFileVideo) {
    dmFileVideo.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const formData = new FormData();
        formData.append('file', file);
        const resp = await fetch('http://localhost:3000/api/upload', { method: 'POST', body: formData, signal: AbortSignal.timeout(10000) });
        const data = await resp.json();
        if (data && data.success && data.url) {
          clearDmAttachment();
          dmAttachedVideo = 'http://localhost:3000' + data.url;
          if (dmAttachPreviewBar && dmAttachPreviewContent) {
            dmAttachPreviewContent.innerHTML = `🎬 Video: <strong>${escapeHtml(file.name)}</strong> (${formatBytes(file.size)})`;
            dmAttachPreviewBar.style.display = 'flex';
          }
          showToast('Video seçildi');
          return;
        }
      } catch { }

      const r = new FileReader();
      r.onload = (ev) => {
        clearDmAttachment();
        dmAttachedVideo = ev.target.result;
        if (dmAttachPreviewBar && dmAttachPreviewContent) {
          dmAttachPreviewContent.innerHTML = `🎬 Video: <strong>${escapeHtml(file.name)}</strong> (${formatBytes(file.size)})`;
          dmAttachPreviewBar.style.display = 'flex';
        }
        showToast('Video seçildi');
      };
      r.readAsDataURL(file);
      dmFileVideo.value = '';
    });
  }

  if (btnDmAttachFile) btnDmAttachFile.addEventListener('click', () => dmFileAny && dmFileAny.click());
  if (dmFileAny) {
    dmFileAny.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const formData = new FormData();
        formData.append('file', file);
        const resp = await fetch('http://localhost:3000/api/upload', { method: 'POST', body: formData, signal: AbortSignal.timeout(10000) });
        const data = await resp.json();
        if (data && data.success && data.url) {
          clearDmAttachment();
          dmAttachedFile = { name: file.name, size: file.size, url: 'http://localhost:3000' + data.url };
          if (dmAttachPreviewBar && dmAttachPreviewContent) {
            dmAttachPreviewContent.innerHTML = `📎 Dosya: <strong>${escapeHtml(file.name)}</strong> (${formatBytes(file.size)})`;
            dmAttachPreviewBar.style.display = 'flex';
          }
          showToast('Dosya seçildi');
          return;
        }
      } catch { }

      const r = new FileReader();
      r.onload = (ev) => {
        clearDmAttachment();
        dmAttachedFile = { name: file.name, size: file.size, url: ev.target.result };
        if (dmAttachPreviewBar && dmAttachPreviewContent) {
          dmAttachPreviewContent.innerHTML = `📎 Dosya: <strong>${escapeHtml(file.name)}</strong> (${formatBytes(file.size)})`;
          dmAttachPreviewBar.style.display = 'flex';
        }
        showToast('Dosya seçildi');
      };
      r.readAsDataURL(file);
      dmFileAny.value = '';
    });
  }

  function sendDmMessage() {
    const text = dmInputText ? dmInputText.value.trim() : '';
    if (!text && !dmAttachedImage && !dmAttachedVideo && !dmAttachedFile) return;
    if (!activeDmThreadId) return;
    const thread = window.dataStore.dmThreads.find(t => t.id === activeDmThreadId);
    if (!thread) return;

    let msgObj = null;
    // ziorse/XXXX pattern'i → davet kartına çevir
    const inviteMatch = text && !dmAttachedImage && !dmAttachedVideo && !dmAttachedFile ? text.match(/^ziorse\/([a-z0-9]+)$/i) : null;
    if (inviteMatch) {
      const code = inviteMatch[1];
      const registryInfo = window.dataStore.getInviteInfo(code);
      const matchedServer = window.dataStore.servers.find(s => s.inviteCode === code);
      const liveMems = window.dataStore.getServerMembers ? window.dataStore.getServerMembers(code) : [];
      const mCount = Math.max(
        liveMems.length,
        (matchedServer && Array.isArray(matchedServer.members)) ? matchedServer.members.length : 0,
        (registryInfo && registryInfo.memberCount) ? registryInfo.memberCount : 0,
        (matchedServer && matchedServer.memberCount) ? matchedServer.memberCount : 0,
        1
      );
      const invite = {
        url: text,
        serverName: (registryInfo && registryInfo.serverName) || (matchedServer && matchedServer.name) || 'Bilinmeyen Sunucu',
        serverIcon: (registryInfo && registryInfo.serverIcon) || (matchedServer && matchedServer.icon) || '?',
        serverBanner: (registryInfo && registryInfo.serverBanner) || (matchedServer && matchedServer.banner) || '',
        memberCount: mCount,
        code
      };

      msgObj = {
        id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        text: '',
        type: 'server-invite',
        invite,
        sender: 'me',
        senderHandle: window.dataStore.currentUser.handle,
        timestamp: new Date().toISOString()
      };
    } else {
      msgObj = {
        id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        text,
        image: dmAttachedImage,
        video: dmAttachedVideo,
        file: dmAttachedFile,
        sender: 'me',
        senderHandle: window.dataStore.currentUser.handle,
        timestamp: new Date().toISOString()
      };
    }

    // Paylasimli key'e yaz
    const msgs = window.dataStore.getThreadMessages(thread.user.handle);
    msgs.push(msgObj);
    window.dataStore.saveThreadMessages(thread.user.handle, msgs);
    window.dataStore.saveDMs();
    if (dmInputText) dmInputText.value = '';
    clearDmAttachment();
    renderDMs();
    scrollContainerToBottom(dmChatMessages);

    // CANLI SOKET İLE KARŞI TARAFA ANINDA İLET
    if (window.socket && window.dataStore.currentUser) {
      window.socket.emit('send-dm-live', {
        fromHandle: window.dataStore.currentUser.handle,
        fromName: window.dataStore.currentUser.name,
        fromAvatar: window.dataStore.currentUser.avatar,
        toHandle: thread.user.handle,
        threadId: thread.id,
        message: msgObj
      });
    }

    // Notification for recipient
    const notifText = text ? text.substring(0, 60) : (msgObj.image ? 'Fotoğraf gönderdi' : (msgObj.video ? 'Video gönderdi' : 'Dosya gönderdi'));
    window.dataStore.addNotification('dm', 'Yeni Mesaj', `${window.dataStore.currentUser.name}: ${notifText}`, { handle: thread.user.handle });
  }
  if (dmSendBtn) dmSendBtn.addEventListener('click', sendDmMessage);
  if (dmInputText) dmInputText.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendDmMessage(); } });

  // ── POPOVER ───────────────────────────────────────────────────
  function showUserProfilePopover(e, handle) {
    if (e && e.stopPropagation) e.stopPropagation();
    window.__realShowUserProfilePopover = showUserProfilePopover;
    const userPopover = document.getElementById('user-profile-popover');
    if (!userPopover) return;

    // Zaten ayni kullanici icin aciksa tekrar basinca kapat (Toggle)
    if (userPopover.style.display === 'block' && userPopover.dataset.activeHandle === handle) {
      userPopover.style.display = 'none';
      delete userPopover.dataset.activeHandle;
      const existingDD = document.querySelector('.popover-role-dropdown');
      if (existingDD) existingDD.remove();
      return;
    }

    const profile = window.dataStore.getUserProfile(handle);
    const isVideoMedia = (url) => url && (url.startsWith('data:video') || url.match(/\.(mp4|webm|mov|mkv)(\?.*)?$/i));

    const popoverBannerEl = document.getElementById('popover-banner');
    if (popoverBannerEl) {
      const existingVid = popoverBannerEl.querySelector('video.popover-media-banner');
      if (existingVid) existingVid.remove();

      const rawBanner = normalizeMediaUrl(profile.banner);
      if (rawBanner && isVideoMedia(rawBanner)) {
        popoverBannerEl.style.backgroundImage = 'none';
        const v = document.createElement('video');
        v.className = 'popover-media-banner';
        v.src = rawBanner;
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
        popoverBannerEl.style.position = 'relative';
        popoverBannerEl.appendChild(v);
      } else if (rawBanner && (rawBanner.startsWith('#') || rawBanner.startsWith('rgb'))) {
        popoverBannerEl.style.backgroundImage = 'none';
        popoverBannerEl.style.backgroundColor = rawBanner;
      } else if (rawBanner && rawBanner.startsWith('linear-gradient')) {
        popoverBannerEl.style.backgroundImage = rawBanner;
        popoverBannerEl.style.backgroundSize = 'cover';
        popoverBannerEl.style.backgroundPosition = 'center';
      } else if (rawBanner && rawBanner !== 'none') {
        const bgUrl = rawBanner.startsWith('url(') ? rawBanner : `url('${rawBanner}')`;
        popoverBannerEl.style.backgroundImage = bgUrl;
        popoverBannerEl.style.backgroundSize = 'cover';
        popoverBannerEl.style.backgroundPosition = 'center';
        popoverBannerEl.style.backgroundColor = '#1e1e1e';
      } else {
        popoverBannerEl.style.backgroundImage = 'none';
        popoverBannerEl.style.backgroundColor = '#1e1e1e';
      }
    }

    const cu = window.dataStore.currentUser;
    const cleanReqH = (handle || '').toLowerCase().replace('@', '');
    const isSelf = cu && cu.handle && cu.handle.toLowerCase().replace('@', '') === cleanReqH;
    const resolvedAvatar = (isSelf && cu.avatar ? cu.avatar : null) || profile.avatar || window.DEFAULT_AVATAR;
    const resolvedName = (isSelf && cu.name ? cu.name : null) || profile.name || handle;
    const resolvedFrame = (isSelf && cu.avatarFrame ? cu.avatarFrame : null) || profile.avatarFrame;
    const resolvedFont = (isSelf && cu.fontStyle ? cu.fontStyle : null) || profile.fontStyle;
    const resolvedColor = (isSelf && cu.nameColor ? cu.nameColor : null) || profile.nameColor;
    const resolvedEffects = (isSelf && cu.nameEffects ? cu.nameEffects : null) || profile.nameEffects;

    const popAvatarWrap = document.getElementById('popover-avatar-wrap');
    const popAvatar = document.getElementById('popover-avatar');
    if (popAvatarWrap) {
      applyAvatarToElement(popAvatarWrap, resolvedAvatar);
      applyAvatarFrameToContainer(popAvatarWrap, resolvedFrame);
    } else if (popAvatar) {
      applyAvatarToElement(popAvatar, resolvedAvatar);
    }
    const popNameEl = document.getElementById('popover-name');
    if (popNameEl) {
      popNameEl.textContent = resolvedName;
      applyUserNameStyling(popNameEl, resolvedFont, resolvedColor, resolvedEffects);
    }
    document.getElementById('popover-handle').textContent = profile.handle || handle;
    document.getElementById('popover-bio').textContent = profile.bio || '';

    // ── ARKADAŞ SAYISI, ORTAK ARKADAŞLAR & ORTAK SUNUCULAR ──
    const friendCount = window.dataStore.getUserFriendCount(handle);
    const mutualFriends = window.dataStore.getMutualFriends(handle);
    const mutualServers = window.dataStore.getMutualServers(handle);

    const friendCountEl = document.getElementById('popover-friend-count');
    const mutualFriendsEl = document.getElementById('popover-mutual-friends');
    const mutualServersEl = document.getElementById('popover-mutual-servers');
    const mutualDetailsEl = document.getElementById('popover-mutual-details');
    const statMutualFriends = document.getElementById('popover-stat-mutual-friends');
    const statMutualServers = document.getElementById('popover-stat-mutual-servers');

    if (friendCountEl) friendCountEl.textContent = friendCount;
    if (mutualFriendsEl) mutualFriendsEl.textContent = mutualFriends.length;
    if (mutualServersEl) mutualServersEl.textContent = mutualServers.length;

    if (mutualDetailsEl) {
      mutualDetailsEl.style.display = 'none';
      mutualDetailsEl.innerHTML = '';
    }
    if (statMutualFriends) statMutualFriends.classList.remove('active');
    if (statMutualServers) statMutualServers.classList.remove('active');

    // Ortak Arkadaşlara Tıklama -> Listele
    if (statMutualFriends) {
      statMutualFriends.onclick = (ev) => {
        ev.stopPropagation();
        if (!mutualDetailsEl) return;
        const isShowing = mutualDetailsEl.style.display === 'block' && mutualDetailsEl.dataset.activeTab === 'friends';
        if (isShowing) {
          mutualDetailsEl.style.display = 'none';
          statMutualFriends.classList.remove('active');
          return;
        }
        statMutualFriends.classList.add('active');
        if (statMutualServers) statMutualServers.classList.remove('active');
        mutualDetailsEl.style.display = 'block';
        mutualDetailsEl.dataset.activeTab = 'friends';

        if (mutualFriends.length === 0) {
          mutualDetailsEl.innerHTML = `
            <div class="popover-mutual-header"><span>Ortak Arkadaşlar</span><span>(0)</span></div>
            <div class="popover-mutual-empty">Ortak arkadaş bulunmuyor.</div>
          `;
        } else {
          mutualDetailsEl.innerHTML = `
            <div class="popover-mutual-header"><span>Ortak Arkadaşlar</span><span>(${mutualFriends.length})</span></div>
            <div style="display:flex; flex-direction:column; gap:2px;">
              ${mutualFriends.map(f => {
            const prof = window.dataStore.getUserProfile(f.handle);
            const av = prof.avatar || f.avatar || window.DEFAULT_AVATAR;
            const nm = prof.name || f.name || f.handle;
            return `
                  <div class="popover-mutual-row" data-handle="${escapeHtml(f.handle)}">
                    <img class="popover-mutual-avatar" src="${escapeHtml(av)}" alt="">
                    <span style="font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(nm)}</span>
                  </div>
                `;
          }).join('')}
            </div>
          `;
          mutualDetailsEl.querySelectorAll('.popover-mutual-row').forEach(row => {
            row.onclick = (rev) => {
              rev.stopPropagation();
              showUserProfilePopover(rev, row.dataset.handle);
            };
          });
        }
        refreshIcons(mutualDetailsEl);
      };
    }

    // Ortak Sunuculara Tıklama -> Listele
    if (statMutualServers) {
      statMutualServers.onclick = (ev) => {
        ev.stopPropagation();
        if (!mutualDetailsEl) return;
        const isShowing = mutualDetailsEl.style.display === 'block' && mutualDetailsEl.dataset.activeTab === 'servers';
        if (isShowing) {
          mutualDetailsEl.style.display = 'none';
          statMutualServers.classList.remove('active');
          return;
        }
        statMutualServers.classList.add('active');
        if (statMutualFriends) statMutualFriends.classList.remove('active');
        mutualDetailsEl.style.display = 'block';
        mutualDetailsEl.dataset.activeTab = 'servers';

        if (mutualServers.length === 0) {
          mutualDetailsEl.innerHTML = `
            <div class="popover-mutual-header"><span>Ortak Sunucular</span><span>(0)</span></div>
            <div class="popover-mutual-empty">Ortak sunucu bulunmuyor.</div>
          `;
        } else {
          mutualDetailsEl.innerHTML = `
            <div class="popover-mutual-header"><span>Ortak Sunucular</span><span>(${mutualServers.length})</span></div>
            <div style="display:flex; flex-direction:column; gap:2px;">
              ${mutualServers.map(s => {
            const iconHtml = (s.icon && (s.icon.startsWith('data:image') || s.icon.startsWith('http')))
              ? `<img class="popover-mutual-avatar" src="${escapeHtml(s.icon)}" alt="">`
              : `<span class="popover-mutual-icon">${escapeHtml((s.icon || s.name.substring(0, 2)).toUpperCase())}</span>`;
            return `
                  <div class="popover-mutual-row" data-server-id="${escapeHtml(s.id)}">
                    ${iconHtml}
                    <span style="font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(s.name)}</span>
                  </div>
                `;
          }).join('')}
            </div>
          `;
          mutualDetailsEl.querySelectorAll('.popover-mutual-row').forEach(row => {
            row.onclick = (rev) => {
              rev.stopPropagation();
              const targetServerId = row.dataset.serverId;
              userPopover.style.display = 'none';
              delete userPopover.dataset.activeHandle;
              if (targetServerId) {
                switchToServer(targetServerId);
              }
            };
          });
        }
        refreshIcons(mutualDetailsEl);
      };
    }

    const popoverViewBtn = document.getElementById('popover-view-btn');
    const popoverActionBtn = document.getElementById('popover-action-btn');
    const popoverFriendBtn = document.getElementById('popover-friend-btn');

    if (popoverViewBtn) {
      popoverViewBtn.title = 'Profili Görüntüle';
      popoverViewBtn.innerHTML = '<i data-lucide="user" style="width:16px; height:16px;"></i>';
      popoverViewBtn.onclick = (ev) => {
        ev.stopPropagation();
        userPopover.style.display = 'none';
        delete userPopover.dataset.activeHandle;
        window.location.href = `profile-view.html?handle=${encodeURIComponent(profile.handle)}`;
      };
    }

    if (popoverActionBtn) {
      if (profile.isSelf) {
        popoverActionBtn.title = 'Profili Düzenle';
        popoverActionBtn.innerHTML = '<i data-lucide="edit-3" style="width:16px; height:16px;"></i>';
        popoverActionBtn.onclick = (ev) => {
          ev.stopPropagation();
          userPopover.style.display = 'none';
          delete userPopover.dataset.activeHandle;
          window.openModalView('settings.html');
        };
      } else {
        popoverActionBtn.title = 'Sohbet Başlat';
        popoverActionBtn.innerHTML = '<i data-lucide="message-square" style="width:16px; height:16px;"></i>';
        popoverActionBtn.onclick = (ev) => {
          ev.stopPropagation();
          userPopover.style.display = 'none';
          delete userPopover.dataset.activeHandle;
          let thread = window.dataStore.dmThreads.find(t => t.user && t.user.handle === profile.handle);
          if (!thread) {
            thread = window.dataStore.createDMThread(profile.name, profile.handle);
          }
          if (thread) {
            activeDmThreadId = thread.id;
            activeDmTab = 'friends';

            // DM görünümüne geç ve sol kanal sidebar'ını gizle (.left-sidebar kalmasın)
            if (mainFeedView) mainFeedView.style.display = 'none';
            if (dmView) dmView.style.display = 'grid';
            const feedHeaderRight = document.querySelector('.feed-header-right');
            if (feedHeaderRight) feedHeaderRight.style.display = 'none';

            if (appLayoutEl) {
              appLayoutEl.classList.add('hide-channels-sidebar');
              appLayoutEl.classList.add('dm-active');
              appLayoutEl.classList.remove('hide-right-sidebar');
            }

            // Sol nav rail ikonlarında DM ikonunu aktif yap
            switchNavHubTo('messages', true);

            renderDMs();
            updateRightSidebar();
          } else {
            showToast('Önce arkadaş olmanız gerekiyor');
          }
        };
      }
    }

    if (popoverFriendBtn) {
      if (profile.isSelf) {
        popoverFriendBtn.style.display = 'none';
      } else {
        popoverFriendBtn.style.display = 'inline-flex';
        const formattedHandle = profile.handle.startsWith('@') ? profile.handle : '@' + profile.handle;
        const isFriend = window.dataStore.isFriend && window.dataStore.isFriend(formattedHandle);
        const hasPending = window.dataStore.hasPendingOutgoing && window.dataStore.hasPendingOutgoing(formattedHandle);

        if (isFriend) {
          popoverFriendBtn.className = 'popover-icon-btn popover-friend-btn is-friend';
          popoverFriendBtn.title = 'Arkadaşsınız';
          popoverFriendBtn.innerHTML = '<i data-lucide="user-plus" style="width:15px; height:15px;"></i><i data-lucide="check" class="popover-friend-check-tick"></i>';
          popoverFriendBtn.onclick = null;
        } else if (hasPending) {
          popoverFriendBtn.className = 'popover-icon-btn popover-friend-btn is-pending';
          popoverFriendBtn.title = 'İstek Gönderildi';
          popoverFriendBtn.innerHTML = '<i data-lucide="user-check" style="width:15px; height:15px;"></i>';
          popoverFriendBtn.onclick = null;
        } else {
          popoverFriendBtn.className = 'popover-icon-btn popover-friend-btn';
          popoverFriendBtn.title = 'Arkadaş Ekle';
          popoverFriendBtn.innerHTML = '<i data-lucide="user-plus" style="width:16px; height:16px;"></i>';
          popoverFriendBtn.onclick = (ev) => {
            ev.stopPropagation();
            const res = window.dataStore.sendFriendRequest(formattedHandle, profile.name, profile.avatar);
            if (res !== false) {
              showToast('Arkadaşlık isteği gönderildi!');
              popoverFriendBtn.className = 'popover-icon-btn popover-friend-btn is-pending';
              popoverFriendBtn.title = 'İstek Gönderildi';
              popoverFriendBtn.innerHTML = '<i data-lucide="user-check" style="width:15px; height:15px;"></i>';
              refreshIcons(popoverFriendBtn);
            } else {
              showToast('İstek gönderilemedi veya zaten gönderildi');
            }
          };
        }
      }
    }

    // ── ROLLER BÖLÜMÜ RENDER (Sadece sunuculardayken görünür) ──
    const popoverRolesSection = document.getElementById('popover-roles-section');
    const popoverRolesContainer = document.getElementById('popover-roles-container');

    function renderPopoverRoles() {
      if (!popoverRolesSection || !popoverRolesContainer) return;
      const isServer = window.dataStore.activeServerId && window.dataStore.activeServerId !== 'home';
      const srv = isServer ? window.dataStore.servers.find(s => s.id === window.dataStore.activeServerId) : null;

      if (!srv) {
        popoverRolesSection.style.display = 'none';
        return;
      }

      popoverRolesSection.style.display = 'block';
      const cu = window.dataStore.currentUser || { handle: '@kullanici' };
      const canManageRoles = window.dataStore.checkServerPermission(srv.id, cu.handle, 'manage_roles') ||
        (srv.ownerHandle && srv.ownerHandle.toLowerCase() === cu.handle.toLowerCase()) ||
        (!srv.joined && !srv.ownerHandle);

      const memberRoles = window.dataStore.getMemberRoles(srv.id, handle);
      const serverRoles = window.dataStore.getServerRoles(srv.id);

      if (memberRoles.length === 0 && !canManageRoles) {
        popoverRolesContainer.innerHTML = `<span style="font-size:0.72rem; color:var(--text-muted);">Rolü yok</span>`;
        return;
      }

      popoverRolesContainer.innerHTML = `
        ${memberRoles.map(r => `
          <span class="popover-role-badge" style="border-color:${r.color}; color:${r.color}; display:inline-flex; align-items:center; gap:4px;">
            ${r.icon ? `<img src="${r.icon}" style="width:12px;height:12px;object-fit:cover;border-radius:2px;">` : `<span class="popover-role-dot" style="background:${r.color};"></span>`}
            <span>${escapeHtml(r.name)}</span>
            ${canManageRoles ? `<button type="button" class="popover-role-remove-btn" data-role-id="${r.id}" data-handle="${escapeHtml(handle)}" title="Rolü kaldır">&times;</button>` : ''}
          </span>
        `).join('')}
        ${canManageRoles ? `
          <button type="button" class="popover-add-role-btn" id="popover-add-role-btn" data-handle="${escapeHtml(handle)}" title="Rol Ata">+</button>
        ` : ''}
      `;

      // Rol çıkarma butonu
      popoverRolesContainer.querySelectorAll('.popover-role-remove-btn').forEach(btn => {
        btn.addEventListener('click', (ev) => {
          ev.stopPropagation();
          const rId = btn.dataset.roleId;
          const h = btn.dataset.handle;
          window.dataStore.removeMemberRole(srv.id, h, rId);
          renderPopoverRoles();
          const rightSidebar = document.getElementById('right-sidebar');
          if (rightSidebar && rightSidebar.style.display !== 'none') {
            renderServerMembersSidebar(rightSidebar);
          }
          if (feedContainer) renderPosts();
        });
      });

      // Rol ekleme butonu (+)
      const addBtn = document.getElementById('popover-add-role-btn');
      if (addBtn) {
        addBtn.addEventListener('click', (ev) => {
          ev.stopPropagation();
          const existingDD = document.querySelector('.popover-role-dropdown');
          if (existingDD) {
            existingDD.remove();
            return;
          }

          if (serverRoles.length === 0) {
            showToast('Sunucuda henüz rol oluşturulmamış');
            return;
          }

          const memberRoleIds = memberRoles.map(r => r.id);
          const dd = document.createElement('div');
          dd.className = 'popover-role-dropdown';
          dd.innerHTML = serverRoles.map(r => {
            const hasRole = memberRoleIds.includes(r.id);
            return `
              <button type="button" class="popover-role-dropdown-item ${hasRole ? 'has-role' : ''}" data-role-id="${r.id}">
                ${r.icon ? `<img src="${r.icon}" style="width:14px;height:14px;object-fit:cover;border-radius:3px;">` : `<span class="popover-role-dot" style="background:${r.color}; width:8px; height:8px;"></span>`}
                <span style="flex:1;">${escapeHtml(r.name)}</span>
                ${hasRole ? '<i data-lucide="check" style="width:12px;height:12px;"></i>' : ''}
              </button>
            `;
          }).join('');

          const rect = addBtn.getBoundingClientRect();
          dd.style.top = (rect.bottom + 4) + 'px';
          dd.style.left = Math.max(10, Math.min(rect.left, window.innerWidth - 180)) + 'px';
          document.body.appendChild(dd);
          if (typeof lucide !== 'undefined') lucide.createIcons();

          dd.querySelectorAll('.popover-role-dropdown-item').forEach(item => {
            item.addEventListener('click', (e2) => {
              e2.stopPropagation();
              const rId = item.dataset.roleId;
              if (memberRoleIds.includes(rId)) {
                window.dataStore.removeMemberRole(srv.id, handle, rId);
              } else {
                window.dataStore.assignMemberRole(srv.id, handle, rId);
              }
              dd.remove();
              renderPopoverRoles();
              const rightSidebar = document.getElementById('right-sidebar');
              if (rightSidebar && rightSidebar.style.display !== 'none') {
                renderServerMembersSidebar(rightSidebar);
              }
              if (feedContainer) renderPosts();
            });
          });

          setTimeout(() => {
            document.addEventListener('click', function closeRoleDD(e3) {
              if (!dd.contains(e3.target) && e3.target !== addBtn) {
                dd.remove();
                document.removeEventListener('click', closeRoleDD);
              }
            });
          }, 50);
        });
      }
    }

    renderPopoverRoles();

    const rect = e.currentTarget ? e.currentTarget.getBoundingClientRect() : { top: e.clientY, right: e.clientX, bottom: e.clientY, left: e.clientX };
    const popoverWidth = 260;
    let top = rect.top;
    // Sağa doğru açılması için sağ kenar + 12px uzaklık:
    let left = rect.right + 12;
    if (left + popoverWidth > window.innerWidth - 10) {
      left = rect.left - popoverWidth - 12;
    }
    if (left < 10) left = 10;
    if (top + 280 > window.innerHeight) top = window.innerHeight - 290;
    if (top < 10) top = 10;

    userPopover.style.top = top + 'px';
    userPopover.style.left = left + 'px';
    userPopover.style.display = 'block';
    userPopover.dataset.activeHandle = handle;
    refreshIcons(userPopover);
  }
  document.addEventListener('click', (e) => {
    const p = document.getElementById('user-profile-popover');
    if (p && !p.contains(e.target)) {
      p.style.display = 'none';
      delete p.dataset.activeHandle;
    }
  });

  // ── HEADER LOCATION BREADCRUMB & CENTER SERVER BADGE ──────────
  function updateHeaderLocation() {
    try {
      const brandContainer = document.getElementById('header-center-brand');
      const isDMView = dmView && dmView.style.display !== 'none';
      const activeServerId = window.dataStore?.activeServerId;

      if (brandContainer) {
        if (isDMView) {
          const threads = window.dataStore?.dmThreads || [];
          const activeThread = threads.find(t => t.id === activeDmThreadId);
          if (activeThread && activeThread.user) {
            brandContainer.innerHTML = `
              <div class="header-server-badge">
                <img class="header-server-icon" src="${escapeHtml(activeThread.user.avatar || 'logo.png')}" alt="" onerror="this.src='logo.png'">
                <span class="header-server-name">@${escapeHtml((activeThread.user.handle || '').replace('@', ''))}</span>
              </div>`;
          } else {
            brandContainer.innerHTML = `
              <div class="header-server-badge">
                <span class="header-server-icon-placeholder"><i data-lucide="message-square" style="width:13px;height:13px;"></i></span>
                <span class="header-server-name">Direkt Mesajlar</span>
              </div>`;
          }
        } else if (activeServerId && activeServerId !== 'home') {
          const servers = window.dataStore?.servers || [];
          const srv = servers.find(s => s.id === activeServerId);
          if (srv) {
            if (srv.icon) {
              brandContainer.innerHTML = `
                <div class="header-server-badge">
                  <img class="header-server-icon" src="${escapeHtml(srv.icon)}" alt="${escapeHtml(srv.name)}" onerror="this.style.display='none'">
                  <span class="header-server-name">${escapeHtml(srv.name)}</span>
                </div>`;
            } else {
              const initials = escapeHtml((srv.name || 'S').substring(0, 2).toUpperCase());
              brandContainer.innerHTML = `
                <div class="header-server-badge">
                  <span class="header-server-icon-placeholder">${initials}</span>
                  <span class="header-server-name">${escapeHtml(srv.name)}</span>
                </div>`;
            }
          }
        } else {
          // Ana Akış / Home
          brandContainer.innerHTML = `
            <div class="header-server-badge" style="background:transparent; border-color:transparent;">
              <span class="header-server-name" style="letter-spacing:1.2px; font-weight:800;">ZIORSE</span>
            </div>`;
        }
        refreshIcons(brandContainer);
      }

      if (!headerLocationBreadcrumb) return;

      // 1. DM Görünümü
      if (dmView && dmView.style.display !== 'none') {
        const threads = window.dataStore?.dmThreads || [];
        const activeThread = threads.find(t => t.id === activeDmThreadId);
        if (activeThread && activeThread.user) {
          const h = (activeThread.user.handle || '').replace('@', '');
          headerLocationBreadcrumb.innerHTML = `Direkt Mesajlar &rsaquo; <span style="color:var(--text-main); font-weight:700;">@${escapeHtml(h)}</span>`;
        } else {
          const tabNames = { friends: 'Arkadaşlar', incoming: 'Gelen İstekler', outgoing: 'Gönderilen İstekler' };
          const tabTitle = tabNames[activeDmTab] || 'Arkadaşlar';
          headerLocationBreadcrumb.innerHTML = `Direkt Mesajlar &rsaquo; <span style="color:var(--text-main); font-weight:700;">${tabTitle}</span>`;
        }
        return;
      }

      // 2. Sunucu Görünümü
      if (activeServerId && activeServerId !== 'home') {
        const servers = window.dataStore?.servers || [];
        const srv = servers.find(s => s.id === activeServerId);
        const srvName = srv ? srv.name : 'Sunucu';
        const chId = window.dataStore?.activeChannelId || 'genel';
        let chName = chId;
        if (srv && srv.categories) {
          for (const cat of srv.categories) {
            const found = cat.channels && cat.channels.find(c => c.id === chId || c.name === chId);
            if (found) { chName = found.name; break; }
          }
        }
        headerLocationBreadcrumb.innerHTML = `${escapeHtml(srvName)} &rsaquo; <span style="color:var(--text-main); font-weight:700;">#${escapeHtml(chName)}</span>`;
        return;
      }

      // 3. Ana Akış (Home)
      const filter = window.dataStore?.activeFilter || 'for-you';
      const filterTitles = {
        'for-you': 'Ana Akış',
        'trending': 'Gündem',
        'saved': 'Kaydedilenler'
      };
      const title = filterTitles[filter] || 'Ana Akış';
      headerLocationBreadcrumb.innerHTML = `<span style="color:var(--text-main); font-weight:700;"># ${title}</span>`;
    } catch (e) {
      console.error('Error updating header location:', e);
    }
  }

  // ── RIGHT SIDEBAR ─────────────────────────────────────────────
  function ensureSidebarStructure(rightSidebar) {
    if (!rightSidebar) return null;
    let contentEl = rightSidebar.querySelector('#sidebar-userlist-content');
    let searchCard = rightSidebar.querySelector('#sidebar-msg-search-card');

    if (!searchCard || !contentEl) {
      const voiceActiveBar = rightSidebar.querySelector('#voice-active-bar');
      const voiceActiveBarHtml = voiceActiveBar ? voiceActiveBar.outerHTML : `
        <div id="voice-active-bar" style="display:none; background:rgba(16,185,129,0.1); border:1px solid var(--accent-emerald); border-radius:var(--radius-md); padding:10px 14px; align-items:center; justify-content:space-between;">
          <div>
            <div style="font-size:0.72rem; color:var(--accent-emerald); font-weight:700; font-family:var(--font-montserrat);">SESLİ KANALDA AKTİF</div>
            <div id="voice-active-name" style="font-weight:700; font-size:0.85rem; color:var(--text-main); font-family:var(--font-montserrat);">Ses Odası</div>
          </div>
          <div style="display:flex; gap:6px;">
            <button id="btn-share-screen" class="tool-btn" style="padding:4px 8px;" title="Ekran Paylaş"><i data-lucide="monitor" style="width:14px; height:14px;"></i></button>
            <button id="btn-mute-mic" class="tool-btn" style="padding:4px 8px;" title="Mikrofonu Sustur"><i data-lucide="mic-off" style="width:14px; height:14px;"></i></button>
            <button id="btn-deafen-voice" class="tool-btn" style="padding:4px 8px;" title="Sesi Kapat"><i data-lucide="headphones" style="width:14px; height:14px;"></i></button>
            <button id="btn-leave-voice" style="background:var(--accent-rose); color:#fff; border:none; padding:5px 10px; border-radius:var(--radius-sm); font-weight:700; font-size:0.72rem; cursor:pointer; font-family:var(--font-montserrat);">Ayrıl</button>
          </div>
        </div>`;

      const voiceChannelsWidget = rightSidebar.querySelector('#voice-channels-widget-card');
      const voiceChannelsWidgetHtml = voiceChannelsWidget ? voiceChannelsWidget.outerHTML : `
        <div class="widget-card" id="voice-channels-widget-card">
          <div class="widget-title"><span>Canlı Ses Odaları</span></div>
          <div id="voice-channels-container" style="display:flex; flex-direction:column; gap:6px;"></div>
        </div>`;

      rightSidebar.innerHTML = `
        ${voiceActiveBarHtml}
        ${voiceChannelsWidgetHtml}
        <div class="widget-card sidebar-msg-search-card" id="sidebar-msg-search-card">
          <div class="sidebar-msg-search-box" id="sidebar-msg-search-box">
            <i data-lucide="search" class="sidebar-msg-search-icon"></i>
            <input type="text" id="sidebar-msg-search-input" class="sidebar-msg-search-input" placeholder="Mesajlarda ara..." autocomplete="off">
            <button type="button" id="btn-sidebar-msg-search-clear" class="sidebar-msg-search-clear" style="display:none;" title="Aramayı Kapat / Temizle">✕</button>
          </div>
          <div id="sidebar-msg-search-results" class="sidebar-msg-search-results" style="display:none;">
            <div class="sidebar-msg-search-header">
              <span class="sidebar-msg-search-title">Mesajlar</span>
              <span id="sidebar-msg-search-count" class="sidebar-msg-search-count"></span>
            </div>
            <div id="sidebar-msg-search-empty" class="sidebar-msg-search-empty">
              <i data-lucide="message-square" style="width:22px; height:22px; opacity:0.35; margin-bottom:4px;"></i>
              <span>Aramak istediğiniz mesajı yazın...</span>
            </div>
            <div id="sidebar-msg-search-list" class="sidebar-msg-search-list"></div>
          </div>
        </div>
        <div id="sidebar-userlist-content" class="sidebar-userlist-content">
          <div class="widget-card" id="members-widget-card">
            <div class="widget-title">Üyeler Listesi</div>
            <div id="online-members-container" style="display:flex; flex-direction:column; gap:4px;"></div>
          </div>
        </div>
      `;

      initSidebarMessageSearch();
      refreshIcons(rightSidebar);
      contentEl = rightSidebar.querySelector('#sidebar-userlist-content');
    }
    return contentEl;
  }

  function updateRightSidebar() {
    updateHeaderLocation();
    const rightSidebar = document.querySelector('.right-sidebar') || document.getElementById('right-sidebar');
    if (!rightSidebar) return;
    const contentEl = ensureSidebarStructure(rightSidebar);
    if (!contentEl) return;

    const isDMView = dmView && dmView.style.display !== 'none';
    const isServerView = window.dataStore.activeServerId !== 'home';
    if (isDMView) {
      rightSidebar.style.display = 'flex';
      if (activeDmThreadId) {
        // Aktif DM varsa karsi kisi profili
        const thread = window.dataStore.dmThreads.find(t => t.id === activeDmThreadId);
        if (thread) renderDMProfilePreview(contentEl, thread.user);
        else renderDMFriendsSidebar(contentEl);
      } else {
        // DM seçili değilse arkadaş listesi
        renderDMFriendsSidebar(contentEl);
      }
    } else if (isServerView) {
      rightSidebar.style.display = 'flex';
      renderServerMembersSidebar(contentEl);
    } else {
      rightSidebar.style.display = 'flex';
      renderHomeTrendingSidebar(contentEl);
    }
  }

  function renderDMFriendsSidebar(container) {
    if (!container) return;
    if (container.classList && container.classList.contains('right-sidebar')) {
      container = ensureSidebarStructure(container);
      if (!container) return;
    }

    const friends = window.dataStore.friends || [];
    const onlineHandles = (window.__globalOnlineHandles || []).map(h => h.toLowerCase());
    const statusColors = { online: '#22c55e', idle: '#eab308', dnd: '#ef4444', invisible: '#737373', offline: '#737373' };
    const statusLabels = { online: 'Çevrimiçi', idle: 'Boşta', dnd: 'Rahatsız Etmeyin', invisible: 'Çevrim dışı', offline: 'Çevrim dışı' };

    const onlineFriends = [];
    const offlineFriends = [];

    friends.forEach(f => {
      const cleanH = f.handle.toLowerCase();
      const prof = window.dataStore.getUserProfile(f.handle);
      const otherSt = prof.status || { type: 'offline', text: '' };
      const isOnline = onlineHandles.includes(cleanH) && otherSt.type !== 'offline' && otherSt.type !== 'invisible';
      if (isOnline) {
        onlineFriends.push({ ...f, prof, status: otherSt, isOnline: true });
      } else {
        offlineFriends.push({ ...f, prof, status: otherSt, isOnline: false });
      }
    });

    function friendItemHtml(item) {
      const prof = item.prof || window.dataStore.getUserProfile(item.handle);
      const avatar = prof.avatar || item.avatar || window.DEFAULT_AVATAR;
      const name = prof.name || item.name || item.handle;
      const stType = item.isOnline ? (item.status?.type || 'online') : 'offline';
      const color = statusColors[stType] || (item.isOnline ? '#22c55e' : '#737373');
      const customTxt = item.status?.text ? `"${item.status.text}"` : (statusLabels[stType] || (item.isOnline ? 'Çevrimiçi' : 'Çevrim dışı'));

      return `
        <div class="user-member-item" data-handle="${item.handle}"
          style="display:flex;align-items:center;justify-content:space-between;width:100%;cursor:pointer;${!item.isOnline ? 'opacity:0.55;' : ''}">
          <div style="display:flex;align-items:center;gap:8px;min-width:0;">
            <div class="avatar-wrapper-status" style="position:relative; width:32px; height:32px; border-radius:50%; overflow:hidden; flex-shrink:0;">
              ${renderMediaAvatarHtml(avatar, 'user-avatar-sm')}
            </div>
            <div style="display:flex;flex-direction:column;gap:1px;min-width:0;">
              <span class="user-member-name">${escapeHtml(name)}</span>
              <span class="user-member-status" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:130px;" title="${escapeHtml(customTxt)}">${escapeHtml(customTxt)}</span>
            </div>
          </div>
        </div>`;
    }

    let groupsHtml = '';
    if (onlineFriends.length > 0 || (friends.length === 0 && offlineFriends.length === 0)) {
      groupsHtml += `
        <div class="user-category-label">ÇEVRİMİÇİ</div>
        ${onlineFriends.map(f => friendItemHtml(f)).join('') || '<div style="font-size:0.75rem;color:var(--text-muted);padding:2px 0;">Yok</div>'}
      `;
    }

    if (offlineFriends.length > 0) {
      groupsHtml += `
        <div class="user-category-label" style="margin-top:10px;">ÇEVRİM DIŞI</div>
        ${offlineFriends.map(f => friendItemHtml(f)).join('')}
      `;
    }

    if (friends.length === 0) {
      groupsHtml = `<div style="font-size:0.78rem;color:var(--text-muted);padding:8px 0;">Henüz arkadaşınız yok.</div>`;
    }

    container.innerHTML = `
      <div class="widget-card">
        <div class="widget-title">Arkadaşlar — ${friends.length}</div>
        <div style="display:flex;flex-direction:column;gap:4px;">
          ${groupsHtml}
        </div>
      </div>`;

    container.querySelectorAll('.user-member-item').forEach(item => {
      item.addEventListener('click', (e) => { if (item.dataset.handle) showUserProfilePopover(e, item.dataset.handle); });
    });
    refreshIcons(container);
  }

  function renderDMProfilePreview(container, userObj) {
    if (!container) return;
    if (container.classList && container.classList.contains('right-sidebar')) {
      container = ensureSidebarStructure(container);
      if (!container) return;
    }

    const fp = window.dataStore.getUserProfile(userObj.handle);
    const isVidBanner = isVideoMedia(fp.banner);
    const bannerContent = isVidBanner
      ? `<video class="dm-profile-banner" src="${escapeHtml(fp.banner)}" autoplay loop muted playsinline style="object-fit:cover; width:100%; height:100%; display:block; pointer-events:none;"></video>`
      : '';
    const bannerStyle = isVidBanner
      ? 'position:relative; overflow:hidden; height:85px;'
      : (fp.banner && (fp.banner.startsWith('http') || fp.banner.startsWith('data:'))
        ? `background-image:url('${fp.banner}'); background-size:cover; background-position:center; background-color:#1e1e1e; height:85px;`
        : `background-color:${fp.banner || '#1e1e1e'}; height:85px;`);
    const friendsCount = (window.dataStore.friends || []).length;

    container.innerHTML = `
      <div class="widget-card dm-profile-card">
        <div class="dm-profile-banner" style="${bannerStyle}">${bannerContent}</div>
        <div class="dm-profile-header">
          <div class="avatar-wrapper-status dm-profile-avatar-wrap" style="width:62px; height:62px; border-radius:50%; overflow:hidden; position:relative; margin-top:-31px; flex-shrink:0; border:3px solid var(--bg-card); background:var(--bg-input);">
            ${renderMediaAvatarHtml(fp.avatar, 'dm-profile-avatar')}
          </div>
          <div class="dm-profile-names">
            <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
              <span class="dm-profile-name">${escapeHtml(fp.name)}</span>
              <span class="dm-profile-friend-badge" style="font-size:0.68rem; font-weight:700; background:var(--bg-app); border:1px solid var(--border-color); padding:1px 6px; border-radius:10px; color:var(--text-muted);">${friendsCount} Arkadaş</span>
            </div>
            <div class="dm-profile-handle">${escapeHtml(fp.handle)}</div>
          </div>
        </div>
        <div class="dm-profile-bio">${escapeHtml(fp.bio || '')}</div>
        <div class="dm-profile-actions">
          <button class="dm-btn-action btn-view-full-profile" data-handle="${escapeHtml(fp.handle)}"><i data-lucide="user" style="width:14px;height:14px;"></i> Profili İncele</button>
          <button class="dm-btn-action secondary btn-start-dm-voice" data-name="${escapeHtml(fp.name)}"><i data-lucide="phone-call" style="width:14px;height:14px;"></i> Sesli Arama</button>
        </div>
      </div>`;
    container.querySelector('.btn-view-full-profile')?.addEventListener('click', (e) => { window.location.href = `profile-view.html?handle=${encodeURIComponent(e.currentTarget.dataset.handle)}`; });
    container.querySelector('.btn-start-dm-voice')?.addEventListener('click', (e) => { showToast(e.currentTarget.dataset.name + ' ile sesli arama başlatılıyor...'); });
    refreshIcons(container);
  }

  function renderHomeTrendingSidebar(container) {
    if (!container) return;
    if (container.classList && container.classList.contains('right-sidebar')) {
      container = ensureSidebarStructure(container);
      if (!container) return;
    }

    const stats = {};
    window.dataStore.posts.forEach(post => {
      if (post.content) { const tags = post.content.match(/#(\w+)/g); if (tags) tags.forEach(t => { const l = t.toLowerCase(); if (!stats[l]) stats[l] = { tag: t, likes: 0, count: 0 }; stats[l].likes += (post.likes || 0) + 1; stats[l].count++; }); }
    });
    const sorted = Object.values(stats).sort((a, b) => b.likes - a.likes).slice(0, 6);
    container.innerHTML = `
      <div class="widget-card"><div class="widget-title"><span>En Çok Beğenilen Etiketler</span></div>
      <div class="trending-tags-list">${sorted.length === 0 ? `<div style="font-size:0.78rem;color:var(--text-muted);padding:4px 0;">Henüz etiketli gönderi yok.</div>` : sorted.map(item => `<div class="trending-tag-item" data-tag="${escapeHtml(item.tag.replace('#', ''))}"><div style="display:flex;flex-direction:column;"><span class="trending-tag-name">${escapeHtml(item.tag)}</span><span class="trending-tag-sub">${item.count} gönderi</span></div><span class="trending-tag-likes">${item.likes} beğeni</span></div>`).join('')}
      </div></div>`;
    container.querySelectorAll('.trending-tag-item').forEach(item => {
      item.addEventListener('click', () => { const tag = item.dataset.tag; window.dataStore.activeFilter = 'hashtag:' + tag; if (feedTitleText) feedTitleText.textContent = '#' + tag; renderFeed(); });
    });
    refreshIcons(container);
  }

  function renderServerMembersSidebar(container) {
    if (!container) return;
    if (container.classList && container.classList.contains('right-sidebar')) {
      container = ensureSidebarStructure(container);
      if (!container) return;
    }

    const cu = window.dataStore.currentUser || { handle: '@kullanici', name: 'Kullanıcı', avatar: window.DEFAULT_AVATAR };
    const srv = window.dataStore.servers.find(s => s.id === window.dataStore.activeServerId);
    if (!srv) return;

    const members = (typeof window.dataStore.getServerMembers === 'function' && srv.inviteCode)
      ? window.dataStore.getServerMembers(srv.inviteCode)
      : (srv.members || []);
    // En üstteki rol (küçük position / 0) en başta olacak şekilde hiyerarşik sırala
    const serverRoles = (window.dataStore.getServerRoles
      ? window.dataStore.getServerRoles(srv.id)
      : (srv.roles || []).slice().sort((a, b) => (a.position ?? 0) - (b.position ?? 0)));

    const onlineHandles = (window.__globalOnlineHandles || []).map(h => (h || '').toLowerCase().replace('@', ''));

    const statusColors = { online: '#22c55e', idle: '#eab308', dnd: '#ef4444', invisible: '#737373', offline: '#737373' };
    const statusLabels = { online: 'Çevrimiçi', idle: 'Boşta', dnd: 'Rahatsız Etmeyin', invisible: 'Çevrim dışı', offline: 'Çevrim dışı' };

    function getMemberRoleIds(handle) {
      if (!handle) return [];
      const cleanH = handle.toLowerCase();
      const withAt = cleanH.startsWith('@') ? cleanH : '@' + cleanH;
      const withoutAt = cleanH.replace('@', '');
      if (window.dataStore.getMemberRoles) {
        return window.dataStore.getMemberRoles(srv.id, handle).map(r => r.id);
      }
      return (srv.memberRoles && (srv.memberRoles[withAt] || srv.memberRoles[withoutAt] || srv.memberRoles[cleanH])) || [];
    }

    const roleGroups = [];
    const usedHandles = new Set();

    serverRoles.forEach(r => {
      const roleMembers = [];
      members.forEach(m => {
        const cleanH = (m.handle || '').toLowerCase().replace('@', '');
        const userRoles = getMemberRoleIds(m.handle);
        if (userRoles.includes(r.id) && !usedHandles.has(cleanH)) {
          const prof = window.dataStore.getUserProfile(m.handle);
          const isSelf = cu.handle && cu.handle.toLowerCase().replace('@', '') === cleanH;
          const myStatus = window.dataStore.userStatus || { type: 'online', text: '' };
          const otherSt = prof.status || { type: 'offline', text: '' };
          const isOnline = isSelf
            ? (myStatus.type !== 'invisible' && myStatus.type !== 'offline')
            : (onlineHandles.includes(cleanH) && otherSt.type !== 'offline' && otherSt.type !== 'invisible');

          if (isOnline) {
            roleMembers.push({ ...m, prof, isOnline: true });
            usedHandles.add(cleanH);
          }
        }
      });

      if (roleMembers.length > 0) {
        roleGroups.push({ role: r, members: roleMembers });
      }
    });

    const onlineMembers = [];
    const offlineMembers = [];

    members.forEach(m => {
      const cleanH = (m.handle || '').toLowerCase().replace('@', '');
      const prof = window.dataStore.getUserProfile(m.handle);
      const isSelf = cu.handle && cu.handle.toLowerCase().replace('@', '') === cleanH;
      const myStatus = window.dataStore.userStatus || { type: 'online', text: '' };
      const otherSt = prof.status || { type: 'offline', text: '' };

      const isOnline = isSelf
        ? (myStatus.type !== 'invisible' && myStatus.type !== 'offline')
        : (onlineHandles.includes(cleanH) && otherSt.type !== 'offline' && otherSt.type !== 'invisible');

      if (isOnline) {
        onlineMembers.push({ ...m, prof, isOnline: true });
      } else {
        offlineMembers.push({ ...m, prof, isOnline: false });
      }
    });

    const unassignedOnline = onlineMembers.filter(m => !usedHandles.has((m.handle || '').toLowerCase().replace('@', '')));

    function memberHtml(m, isOnline) {
      const cleanH = (m.handle || '').toLowerCase().replace('@', '');
      const isSelf = cu.handle && cu.handle.toLowerCase().replace('@', '') === cleanH;
      const myStatus = window.dataStore.userStatus || { type: 'online', text: '' };
      const prof = m.prof || window.dataStore.getUserProfile(m.handle) || {};
      const st = isSelf ? myStatus : (prof.status || { type: 'offline', text: '' });
      const stType = isOnline ? (st.type || 'online') : 'offline';
      const color = statusColors[stType] || (isOnline ? '#22c55e' : '#737373');
      const customTxt = st.text ? `"${st.text}"` : (statusLabels[stType] || (isOnline ? 'Çevrimiçi' : 'Çevrim dışı'));

      const userRoleIds = getMemberRoleIds(m.handle);
      // En üstteki rol hiyerarşideki en küçük position değerine sahip roldür
      const highestRole = serverRoles.find(r => userRoleIds.includes(r.id)) || null;
      const roleIconHtml = (highestRole && highestRole.icon)
        ? `<img src="${highestRole.icon}" style="width:12px;height:12px;object-fit:cover;border-radius:2px;margin-right:4px;flex-shrink:0;">`
        : '';

      const avatar = (isSelf && cu.avatar ? cu.avatar : null) || prof.avatar || m.avatar || window.DEFAULT_AVATAR;
      const name = (isSelf && cu.name ? cu.name : null) || prof.name || m.name || m.handle;
      const mFrame = (isSelf && cu.avatarFrame ? cu.avatarFrame : null) || prof.avatarFrame || m.avatarFrame;
      const mFont = (isSelf && cu.fontStyle ? cu.fontStyle : null) || prof.fontStyle || m.fontStyle;
      const mColor = (isSelf && cu.nameColor ? cu.nameColor : null) || prof.nameColor || m.nameColor;
      const mEffects = (isSelf && cu.nameEffects ? cu.nameEffects : null) || prof.nameEffects || m.nameEffects;
      const memberStyleAttr = getAuthorNameStyleAttr({ fontStyle: mFont, nameColor: mColor, nameEffects: mEffects }, highestRole);

      return `
        <div class="user-member-item" data-handle="${m.handle}"
          style="display:flex;align-items:center;justify-content:space-between;width:100%;cursor:pointer;${!isOnline ? 'opacity:0.55;' : ''}">
          <div style="display:flex;align-items:center;gap:8px;min-width:0;">
            <div class="avatar-wrapper-status" style="position:relative; width:32px; height:32px; border-radius:50%; overflow:visible; flex-shrink:0;">
              ${renderMediaAvatarHtml(avatar, 'user-avatar-sm')}
              ${renderAvatarFrameHtml(mFrame)}
            </div>
            <div style="display:flex;flex-direction:column;gap:1px;min-width:0;">
              <div style="display:flex;align-items:center;gap:2px;">
                ${roleIconHtml}
                <span class="user-member-name" ${memberStyleAttr}>${escapeHtml(name)}</span>
              </div>
              <span class="user-member-status" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:130px;" title="${escapeHtml(customTxt)}">${escapeHtml(customTxt)}</span>
            </div>
          </div>
        </div>`;
    }

    let groupsHtml = '';

    roleGroups.forEach(rg => {
      const roleIconHtml = rg.role.icon ? `<img src="${rg.role.icon}" style="width:14px;height:14px;object-fit:cover;border-radius:3px;margin-right:6px;flex-shrink:0;">` : '';
      groupsHtml += `
        <div class="user-category-label" style="color:${rg.role.color}; font-weight:600; display:flex; align-items:center;">
          ${roleIconHtml}<span>${escapeHtml(rg.role.name).toUpperCase()}</span>
        </div>
        ${rg.members.map(m => memberHtml(m, true)).join('')}
      `;
    });

    if (unassignedOnline.length > 0 || (roleGroups.length === 0 && onlineMembers.length === 0)) {
      groupsHtml += `
        <div class="user-category-label">ÇEVRİMİÇİ</div>
        ${unassignedOnline.map(m => memberHtml(m, true)).join('') || '<div style="font-size:0.75rem;color:var(--text-muted);padding:2px 0;">Yok</div>'}
      `;
    }

    if (offlineMembers.length > 0) {
      groupsHtml += `
        <div class="user-category-label" style="margin-top:10px;">ÇEVRİM DIŞI</div>
        ${offlineMembers.map(m => memberHtml(m, false)).join('')}
      `;
    }

    container.innerHTML = `
      <div class="widget-card">
        <div class="widget-title">Sunucu Üyeleri — ${members.length}</div>
        <div style="display:flex;flex-direction:column;gap:4px;">
          ${groupsHtml}
        </div>
      </div>`;

    container.querySelectorAll('.user-member-item').forEach(item => {
      item.addEventListener('click', (e) => { if (item.dataset.handle) showUserProfilePopover(e, item.dataset.handle); });
    });
    refreshIcons(container);
  }

  // ── UNIVERSAL LINK & YOUTUBE EMBED EXTRACTOR ─────────────────
  function extractAllUrls(text) {
    if (!text) return [];
    const urlRegex = /https?:\/\/[^\s"'<>]+/gi;
    const urls = [];
    let match;
    while ((match = urlRegex.exec(text)) !== null) {
      const u = match[0].replace(/[.,;:!?)]+$/, '');
      if (u && !urls.includes(u)) {
        urls.push(u);
      }
    }
    return urls;
  }

  function renderYouTubeEmbedHtml(videoId) {
    if (!videoId) return '';
    return `
      <div class="youtube-embed-card" data-video-id="${escapeHtml(videoId)}">
        <div class="youtube-embed-header">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="#ff0000" style="flex-shrink:0;"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          <span>YouTube</span>
        </div>
        <div class="youtube-embed-player-wrap" onclick="playYouTubeInline(this, '${escapeHtml(videoId)}')">
          <img class="youtube-embed-thumb" src="https://img.youtube.com/vi/${escapeHtml(videoId)}/hqdefault.jpg" alt="YouTube Video" loading="lazy">
          <div class="youtube-play-btn" title="Videoyu Oynat">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="#ffffff"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
      </div>
    `;
  }

  function renderGenericLinkEmbedHtml(url) {
    if (!url) return '';
    // 1. YouTube video linki ise
    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?(?:[^&\s]+&)*v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
    if (ytMatch && ytMatch[1]) {
      return renderYouTubeEmbedHtml(ytMatch[1]);
    }
    // 2. Doğrudan görsel linki ise
    if (/\.(?:png|jpg|jpeg|gif|webp)$/i.test(url)) {
      return `
        <div class="rich-link-image-direct" style="margin-top:8px;">
          <img src="${escapeHtml(url)}" alt="Medya" loading="lazy" style="max-width:380px; max-height:280px; border-radius:8px; display:block; cursor:pointer;" onclick="openLightbox('${escapeHtml(url)}')">
        </div>
      `;
    }
    // 3. Doğrudan video linki ise
    if (/\.(?:mp4|webm|mov)$/i.test(url)) {
      return `
        <div class="rich-link-video-direct" style="margin-top:8px;">
          <video src="${escapeHtml(url)}" controls playsinline style="max-width:380px; max-height:280px; border-radius:8px; display:block; background:#000;"></video>
        </div>
      `;
    }
    // 4. Genel web sayfası (GitHub, Twitter, Spotify, Reddit, vs.) için OpenGraph kartı
    return `<div class="rich-link-embed-wrap" data-og-url="${escapeHtml(url)}"></div>`;
  }

  const linkPreviewMemoryCache = new Map();

  function hydrateLinkPreviews(container) {
    if (!container) return;
    const placeholders = container.querySelectorAll('.rich-link-embed-wrap[data-og-url]');
    if (placeholders.length === 0) return;

    placeholders.forEach(async (wrap) => {
      const targetUrl = wrap.dataset.ogUrl;
      if (!targetUrl || wrap.dataset.hydrated === 'true') return;
      wrap.dataset.hydrated = 'true';

      let data = linkPreviewMemoryCache.get(targetUrl);
      if (!data) {
        try {
          const res = await fetch(`http://localhost:3000/api/og-preview?url=${encodeURIComponent(targetUrl)}`, {
            signal: AbortSignal.timeout(6000)
          });
          data = await res.json();
          if (data) linkPreviewMemoryCache.set(targetUrl, data);
        } catch { }
      }

      if (!data || !data.title) {
        wrap.remove();
        return;
      }

      const domain = (() => { try { return new URL(targetUrl).hostname.replace(/^www\./, ''); } catch { return 'Link'; } })();

      wrap.innerHTML = `
        <div class="rich-link-embed-card">
          <div class="rich-link-embed-header">
            ${data.favicon ? `<img src="${escapeHtml(data.favicon)}" class="rich-link-favicon" onerror="this.style.display='none'">` : ''}
            <span class="rich-link-sitename">${escapeHtml(data.siteName || domain)}</span>
          </div>
          <a class="rich-link-title" href="${escapeHtml(data.url || targetUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(data.title)}</a>
          ${data.description ? `<p class="rich-link-desc">${escapeHtml(data.description)}</p>` : ''}
          ${data.image ? `
            <div class="rich-link-image-wrap">
              <img class="rich-link-image" src="${escapeHtml(data.image)}" alt="Önizleme" loading="lazy" onerror="this.parentElement.remove()">
            </div>
          ` : ''}
        </div>
      `;
    });
  }

  window.playYouTubeInline = function (wrapEl, videoId) {
    if (!wrapEl || !videoId) return;
    wrapEl.innerHTML = `
      <iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
              style="width:100%; height:100%; min-height:220px; border:none; border-radius:6px; display:block;">
      </iframe>
    `;
  };

  // ── FEED RENDER ───────────────────────────────────────────────
  function parseContentFormatting(str) {
    if (!str) return '';
    let p = escapeHtml(str);
    p = p.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    p = p.replace(/\*(.*?)\*/g, '<em>$1</em>');
    p = p.replace(/`(.*?)`/g, `<code style="background:var(--bg-app);padding:2px 6px;border-radius:4px;font-family:var(--font-mono);">$1</code>`);
    p = p.replace(/(https?:\/\/[^\s]+)/g, '<a class="post-link" href="$1" target="_blank">$1</a>');
    p = p.replace(/#([a-zA-Z0-9_ğüşıöçĞÜŞİÖÇ]+)/g, '<span class="hashtag" data-tag="$1">#$1</span>');

    // Kabarık Mention Etiketi (@kullanici / @everyone)
    const myHandle = (window.dataStore?.currentUser?.handle || '').toLowerCase().replace('@', '');
    p = p.replace(/@([a-zA-Z0-9_ğüşıöçĞÜŞİÖÇ]+)/g, (match, username) => {
      const isMe = username.toLowerCase() === myHandle;
      const isEveryone = username.toLowerCase() === 'everyone';
      return `<span class="mention chat-mention-badge ${isMe ? 'mention-me' : ''} ${isEveryone ? 'mention-everyone' : ''}" data-handle="@${username}" data-user="@${username}">@${username}</span>`;
    });
    return p;
  }

  function renderInviteIconHtml(iconVal, nameVal) {
    if (iconVal && (iconVal.startsWith('data:image') || iconVal.startsWith('http'))) {
      return `<img src="${escapeHtml(iconVal)}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`;
    }
    let initials = 'SR';
    if (iconVal && iconVal.length <= 4) {
      initials = iconVal;
    } else if (nameVal) {
      initials = nameVal.trim().substring(0, 2).toUpperCase();
    }
    return `<span>${escapeHtml(initials)}</span>`;
  }

  function renderInviteCardHtml(invite) {
    if (!invite) return '';
    const code = invite.code || (invite.url || '').replace('ziorse/', '');
    const srv = window.dataStore.servers.find(s => s.inviteCode === code || (invite.serverId && s.id === invite.serverId) || s.name === invite.serverName);
    const info = window.dataStore.getInviteInfo ? window.dataStore.getInviteInfo(code) : null;

    // Canlı güncel sunucu verilerini önceliklendir (böylece icon ve banner ayarları değiştiğinde anında yansır)
    const banner = (srv && srv.banner) || (info && info.serverBanner) || invite.serverBanner || '';
    const icon = (srv && srv.icon) || (info && info.serverIcon) || invite.serverIcon || '';
    const name = (srv && srv.name) || (info && info.serverName) || invite.serverName || 'Sunucu';

    // Gerçek canlı üye sayısını dinamik hesapla
    const liveMembers = (window.dataStore.getServerMembers ? window.dataStore.getServerMembers(code || (srv && srv.inviteCode)) : []) || [];
    const memberCount = Math.max(
      liveMembers.length,
      (srv && Array.isArray(srv.members) ? srv.members.length : 0),
      (info && info.memberCount ? info.memberCount : 0),
      (srv && srv.memberCount ? srv.memberCount : 0),
      (invite && invite.memberCount ? invite.memberCount : 0),
      1
    );

    // Sunucuda zaten var mıyız?
    const isMember = !!srv;

    const bannerStyle = banner
      ? `background-image: url('${escapeHtml(banner)}');`
      : `background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%);`;

    return `
      <div class="dm-invite-card">
        <div class="dm-invite-banner" style="${bannerStyle}">
          <div class="dm-invite-banner-overlay"></div>
          <div class="dm-invite-label">SUNUCU DAVETİ</div>
          <div class="dm-invite-icon-wrap">
            <div class="dm-invite-icon">${renderInviteIconHtml(icon, name)}</div>
          </div>
        </div>
        <div class="dm-invite-content">
          <div class="dm-invite-info">
            <div class="dm-invite-name">${escapeHtml(name)}</div>
            <div class="dm-invite-members"><span class="dm-invite-dot"></span> ${memberCount} üye</div>
          </div>
          <div class="dm-invite-url">${escapeHtml(invite.url || ('ziorse/' + code))}</div>
          <div class="dm-invite-actions">
            <button class="dm-invite-copy" data-url="${escapeHtml(invite.url || ('ziorse/' + code))}">
              <i data-lucide="copy" style="width:13px;height:13px;"></i> Kopyala
            </button>
            <button class="dm-invite-join ${isMember ? 'is-member' : ''}" data-code="${escapeHtml(code)}" data-server-id="${srv ? escapeHtml(srv.id) : ''}">
              ${isMember ? 'Sunucuya Git' : 'Sunucuya Katıl'}
            </button>
          </div>
        </div>
      </div>`;
  }

  function renderHoverPanelHtml(postId, author, text, avatar, handle) {
    const open = activePopoverPostId === postId;
    const isMine = handle === window.dataStore.currentUser.handle;
    const post = window.dataStore.posts.find(p => p.id === postId);
    const isPinned = post && post.isPinned;
    const isBlocked = window.dataStore.isBlocked ? window.dataStore.isBlocked(handle) : false;

    return `<div class="message-hover-panel">
      <button class="hover-panel-btn btn-open-emoji-popover" data-id="${postId}"><i data-lucide="smile" style="width:14px;height:14px;"></i> İfade</button>
      <button class="hover-panel-btn btn-quote-reply" data-id="${postId}" data-author="${escapeHtml(author)}" data-text="${escapeHtml(text)}" data-avatar="${escapeHtml(avatar || '')}" data-handle="${escapeHtml(handle || '')}"><i data-lucide="reply" style="width:14px;height:14px;"></i> Yanıtla</button>
      <button class="hover-panel-btn btn-pin-post" data-id="${postId}" title="${isPinned ? 'Sabitlemeyi Kaldır' : 'Sabitle'}"><i data-lucide="${isPinned ? 'pin-off' : 'pin'}" style="width:14px;height:14px;"></i> ${isPinned ? 'Kaldır' : 'Sabitle'}</button>
      ${isMine ? `
        <button class="hover-panel-btn btn-edit-post" data-id="${postId}"><i data-lucide="pencil" style="width:14px;height:14px;"></i> Düzenle</button>
        <button class="hover-panel-btn btn-delete-post danger" data-id="${postId}"><i data-lucide="trash-2" style="width:14px;height:14px;"></i> Sil</button>
      ` : `
        <button class="hover-panel-btn btn-block-user ${isBlocked ? 'danger' : ''}" data-handle="${escapeHtml(handle)}"><i data-lucide="${isBlocked ? 'user-check' : 'user-x'}" style="width:14px;height:14px;"></i> ${isBlocked ? 'Engeli Kaldır' : 'Engelle'}</button>
      `}
      ${open ? `<div class="emoji-popover">${['👍', '❤️', '🔥', '😂', '🎉', '🚀', '👏', '💯', '😍', '🙏', '😎', '🫡', '💀', '🤣', '✨'].map(e => `<button class="emoji-popover-item btn-select-emoji" data-id="${postId}" data-emoji="${e}">${e}</button>`).join('')}</div>` : ''}
    </div>`;
  }

  function getReplyingAvatar(replyingTo) {
    if (!replyingTo) return 'https://i.imgur.com/w3OhOmW.jpeg';
    if (replyingTo.avatar) return replyingTo.avatar;
    if (replyingTo.handle) {
      const p = window.dataStore.getUserProfile(replyingTo.handle);
      if (p && p.avatar) return p.avatar;
    }
    const foundUser = (window.dataStore.users || []).find(u => u.name === replyingTo.author || u.handle === replyingTo.author || '@' + u.handle === replyingTo.author);
    if (foundUser && foundUser.avatar) return foundUser.avatar;
    return 'https://i.imgur.com/w3OhOmW.jpeg';
  }

  function renderUnifiedReactionHtml(post) {
    const r = post.reactions || {};
    const total = Object.values(r).reduce((a, b) => a + b, 0);
    if (total === 0) return '';
    return `<div class="unified-reaction-pill btn-open-emoji-popover" data-id="${post.id}"><span>${Object.keys(r).slice(0, 3).join('')}</span><span>${total} Ifade</span></div>`;
  }

  function renderDiscordReactionsHtml(post) {
    const r = post.reactions || {};
    const keys = Object.keys(r);
    if (keys.length === 0) return '';
    return '<div class="reactions-row">' + keys.filter(e => r[e] > 0).map(e => `<button class="reaction-pill active" data-id="${post.id}" data-emoji="${e}"><span>${e}</span><span>${r[e]}</span></button>`).join('') + '</div>';
  }

  function renderCommentsTreeHtml(comments = [], postId) {
    if (!comments || comments.length === 0) {
      return '<div class="comments-empty-notice"><i data-lucide="message-square" style="width:13px;height:13px;"></i> Henüz yorum yok. İlk yorumu sen yap!</div>';
    }
    const roots = comments.filter(c => !c.parentCommentId);
    function renderItem(cmt, nested = false) {
      const children = comments.filter(c => c.parentCommentId === cmt.id);
      return `
        <div class="comment-item ${nested ? 'nested' : ''}">
          <div class="comment-avatar-wrap" style="width:28px; height:28px; border-radius:50%; overflow:hidden; position:relative; flex-shrink:0;">
            ${renderMediaAvatarHtml(cmt.avatar, 'comment-avatar', `data-handle="${escapeHtml(cmt.handle)}"`)}
          </div>
          <div class="comment-body">
            <div class="comment-header">
              <span class="comment-author-name" data-handle="${escapeHtml(cmt.handle)}">${escapeHtml(cmt.author)}</span>
              <span class="comment-author-handle">${escapeHtml(cmt.handle)}</span>
              <span class="comment-time">${formatDateTime(cmt.timestamp)}</span>
            </div>
            <div class="comment-text">${parseContentFormatting(cmt.text)}</div>
            <div class="comment-footer">
              <button class="comment-reply-btn btn-reply-comment" data-postid="${postId}" data-cmtid="${cmt.id}" data-author="${escapeHtml(cmt.author)}">
                <i data-lucide="corner-down-right" style="width:12px;height:12px;"></i> Yanıtla
              </button>
            </div>
          </div>
        </div>
        ${children.map(ch => renderItem(ch, true)).join('')}`;
    }
    return `<div class="comments-list">${roots.map(r => renderItem(r)).join('')}</div>`;
  }

  function renderPostMediaHtml(post) {
    if (!post) return '';
    let html = '';
    const rawMedia = post.image || post.media || post.video;
    const mediaSrc = normalizeMediaUrl(rawMedia);
    if (mediaSrc) {
      const isVideo = (typeof mediaSrc === 'string') && (
        mediaSrc.startsWith('data:video') ||
        mediaSrc.endsWith('.mp4') ||
        mediaSrc.endsWith('.webm') ||
        mediaSrc.endsWith('.mov') ||
        !!post.video
      );
      if (isVideo) {
        html += `<video class="post-media-video" controls playsinline src="${escapeHtml(mediaSrc)}" style="max-width:100%;max-height:420px;border-radius:10px;margin-top:8px;display:block;background:#000;"></video>`;
      } else {
        html += `<img class="post-media-image" src="${escapeHtml(mediaSrc)}" alt="Görsel" style="max-width:100%;max-height:420px;object-fit:cover;border-radius:10px;margin-top:8px;display:block;cursor:pointer;">`;
      }
    }
    if (post.file) {
      html += `
        <a class="post-file-card" href="${escapeHtml(post.file.url)}" download="${escapeHtml(post.file.name)}" target="_blank" style="display:inline-flex;align-items:center;gap:10px;padding:10px 14px;background:var(--bg-input);border:1px solid var(--border-dark);border-radius:10px;margin-top:8px;text-decoration:none;color:var(--text-main);max-width:320px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
          <i data-lucide="file-text" style="width:20px;height:20px;flex-shrink:0;color:var(--text-main);"></i>
          <div style="display:flex;flex-direction:column;overflow:hidden;flex:1;">
            <span style="font-size:0.84rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(post.file.name)}</span>
            <span style="font-size:0.72rem;color:var(--text-muted);">${formatBytes(post.file.size || 0)}</span>
          </div>
          <i data-lucide="download" style="width:16px;height:16px;flex-shrink:0;color:var(--text-muted);"></i>
        </a>
      `;
    }

    // Tüm Linklerin Önizlemesi (YouTube, Görseller, Web Siteleri, GitHub, Spotify, vb.)
    if (post.content) {
      const urls = extractAllUrls(post.content);
      for (const u of urls) {
        html += renderGenericLinkEmbedHtml(u);
      }
    }

    return html;
  }

  // ── SKELETON LOADERS (MESSAGES / FEED / DM) ───────────────────
  function getSkeletonMessagesHtml(count = 6) {
    const configs = [
      { nameW: '110px', lines: ['85%', '65%'], hasMedia: false },
      { nameW: '140px', lines: ['92%', '78%', '50%'], hasMedia: true, mediaH: '180px' },
      { nameW: '100px', lines: ['72%'], hasMedia: false },
      { nameW: '135px', lines: ['88%', '55%'], hasMedia: true, mediaH: '130px' },
      { nameW: '120px', lines: ['94%', '76%'], hasMedia: false },
      { nameW: '105px', lines: ['62%'], hasMedia: false }
    ];

    return Array.from({ length: count }).map((_, i) => {
      const cfg = configs[i % configs.length];
      return `
        <div class="skeleton-chat-item">
          <div class="skeleton-avatar skeleton-shimmer"></div>
          <div class="skeleton-body">
            <div class="skeleton-header">
              <div class="skeleton-line skeleton-name skeleton-shimmer" style="width:${cfg.nameW};"></div>
              <div class="skeleton-line skeleton-time skeleton-shimmer" style="width:48px;"></div>
            </div>
            ${cfg.lines.map(w => `<div class="skeleton-line skeleton-text skeleton-shimmer" style="width:${w};"></div>`).join('')}
            ${cfg.hasMedia ? `<div class="skeleton-media skeleton-shimmer" style="height:${cfg.mediaH}; width:75%; max-width:340px;"></div>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  function showFeedSkeleton(count = 6) {
    if (!feedPostsContainer) return;
    feedPostsContainer.innerHTML = getSkeletonMessagesHtml(count);
  }

  function showDmSkeleton(count = 5) {
    if (!dmChatMessages) return;
    dmChatMessages.innerHTML = getSkeletonMessagesHtml(count);
  }

  let _feedSkeletonTimer = null;
  function triggerFeedWithSkeleton(delay = 170) {
    if (_feedSkeletonTimer) {
      clearTimeout(_feedSkeletonTimer);
      _feedSkeletonTimer = null;
    }
    showFeedSkeleton();
    _feedSkeletonTimer = setTimeout(() => {
      _feedSkeletonTimer = null;
      renderFeed(true);
    }, delay);
  }

  let _dmSkeletonTimer = null;
  function triggerDmWithSkeleton(delay = 170) {
    if (_dmSkeletonTimer) {
      clearTimeout(_dmSkeletonTimer);
      _dmSkeletonTimer = null;
    }
    showDmSkeleton();
    _dmSkeletonTimer = setTimeout(() => {
      _dmSkeletonTimer = null;
      renderDMs();
    }, delay);
  }

  var _renderFeedRaf = null;
  function renderFeed(immediate = false) {
    if (immediate) {
      if (_renderFeedRaf) { cancelAnimationFrame(_renderFeedRaf); _renderFeedRaf = null; }
      _renderFeedActual();
      return;
    }
    if (_renderFeedRaf) return;
    _renderFeedRaf = requestAnimationFrame(() => {
      _renderFeedRaf = null;
      _renderFeedActual();
    });
  }

  function _renderFeedActual() {
    if (!feedPostsContainer) return;
    feedPostsContainer.style.display = '';
    const isServer = window.dataStore.activeServerId !== 'home';
    if (composerCard) {
      if (window.dataStore.activeFilter === 'saved') {
        composerCard.style.display = 'none';
      } else {
        composerCard.style.display = 'flex';
        if (isServer) {
          const canSend = window.dataStore.checkChannelPermission(window.dataStore.activeServerId, null, window.dataStore.activeChannelId, 'send_messages');
          const canAttach = window.dataStore.checkChannelPermission(window.dataStore.activeServerId, null, window.dataStore.activeChannelId, 'attach_files');

          if (!canSend) {
            if (postComposerText) {
              postComposerText.disabled = true;
              postComposerText.placeholder = '🔒 Bu kanalda mesaj gönderme izniniz bulunmuyor.';
            }
            if (btnSendPost) btnSendPost.disabled = true;
          } else {
            if (postComposerText) {
              postComposerText.disabled = false;
              postComposerText.placeholder = 'Neler oluyor?';
            }
            if (btnSendPost) btnSendPost.disabled = false;
          }

          if (btnAttachImage) btnAttachImage.style.display = canAttach ? '' : 'none';
          if (btnRecordVoice) btnRecordVoice.style.display = canAttach ? '' : 'none';
        } else {
          if (postComposerText) {
            postComposerText.disabled = false;
            postComposerText.placeholder = 'Neler oluyor?';
          }
          if (btnSendPost) btnSendPost.disabled = false;
          if (btnAttachImage) btnAttachImage.style.display = '';
          if (btnRecordVoice) btnRecordVoice.style.display = '';
        }
      }
    }
    const posts = window.dataStore.getFilteredPosts();
    if (posts.length === 0) {
      const msgs = { 'following': 'Takip ettiklerinizin gönderisi yok.', 'saved': 'Kaydedilmiş gönderi yok.', 'for-you': 'Henüz gönderi yok. İlk gönderiyi paylaşın!' };
      feedPostsContainer.innerHTML = `<div style="padding:50px;text-align:center;color:var(--text-muted);font-size:0.9rem;">${msgs[window.dataStore.activeFilter] || 'Gönderi yok.'}</div>`;
      return;
    }

    if (isServer) {
      const activeServerId = window.dataStore.activeServerId;
      const reversedPosts = [...posts].reverse();
      const displayPosts = reversedPosts.length > 80 ? reversedPosts.slice(-80) : reversedPosts;
      feedPostsContainer.innerHTML = displayPosts.map(post => {
        const authorProf = window.dataStore.getUserProfile(post.handle);
        const authorAvatar = authorProf.avatar || post.avatar || window.DEFAULT_AVATAR;
        const authorName = authorProf.name || post.author || post.handle;

        const highestRole = (activeServerId && activeServerId !== 'home')
          ? window.dataStore.getMemberHighestRole(activeServerId, post.handle)
          : null;
        const authorFrame = authorProf.avatarFrame || post.avatarFrame;
        const authorNameStyle = getAuthorNameStyleAttr(authorProf, highestRole);
        const roleIconHtml = highestRole?.icon
          ? `<img src="${highestRole.icon}" class="chat-role-icon" style="width:20px;height:20px;object-fit:cover;border-radius:3px;vertical-align:middle;display:inline-block;" title="${escapeHtml(highestRole.name)}">`
          : '';

        return `
        <div class="channel-chat-item" data-id="${post.id}">
          ${renderHoverPanelHtml(post.id, authorName, post.content, authorAvatar, post.handle)}
          <div class="post-avatar-wrap" style="width:38px; height:38px; border-radius:50%; overflow:visible; position:relative; flex-shrink:0; cursor:pointer;" data-handle="${post.handle}">
            ${renderMediaAvatarHtml(authorAvatar, 'post-avatar')}
            ${renderAvatarFrameHtml(authorFrame)}
          </div>
          <div class="channel-chat-body">
            <div class="channel-chat-header">
              <span class="post-author-name" data-handle="${post.handle}" ${authorNameStyle}>${escapeHtml(authorName)}</span>
              ${roleIconHtml}
              <span class="post-time">${formatDateTime(post.timestamp)}</span>
            </div>
            ${post.replyingTo ? `<div class="quote-reply-box" title="Yanıtlanan mesaj"><svg class="quote-reply-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7a3 3 0 0 0 3 3h7"/></svg><div style="width:16px;height:16px;border-radius:50%;overflow:hidden;position:relative;display:inline-block;vertical-align:middle;margin-right:4px;">${renderMediaAvatarHtml(getReplyingAvatar(post.replyingTo), 'quote-reply-avatar')}</div><span class="quote-reply-author">@${escapeHtml(post.replyingTo.author)}:</span><span class="quote-reply-text">${escapeHtml(post.replyingTo.text)}</span></div>` : ''}
            <div class="post-body-text">${parseContentFormatting(post.content)}</div>
            ${renderPostMediaHtml(post)}
            ${post.type === 'server-invite' && post.invite ? renderInviteCardHtml(post.invite) : ''}
            ${renderDiscordReactionsHtml(post)}
          </div>
        </div>`;
      }).join('');
      scrollContainerToBottom(feedPostsContainer);
    } else {
      const myAvatar = window.dataStore.currentUser?.avatar || window.DEFAULT_AVATAR;
      const myName = window.dataStore.currentUser?.name || 'Kullanıcı';
      const displayPosts = posts.length > 60 ? posts.slice(0, 60) : posts;
      feedPostsContainer.innerHTML = displayPosts.map(post => {
        const authorProf = window.dataStore.getUserProfile(post.handle);
        const authorAvatar = authorProf.avatar || post.avatar || window.DEFAULT_AVATAR;
        const authorName = authorProf.name || post.author || post.handle;
        const authorFrame = authorProf.avatarFrame || post.avatarFrame;
        const authorNameStyle = getAuthorNameStyleAttr(authorProf, null);
        const open = !!expandedCommentsPosts[post.id];
        return `<div class="post-card" data-id="${post.id}">
          ${renderHoverPanelHtml(post.id, authorName, post.content, authorAvatar, post.handle)}
          <div class="post-avatar-wrap" style="width:42px; height:42px; border-radius:50%; overflow:visible; position:relative; flex-shrink:0; cursor:pointer;" data-handle="${post.handle}">
            ${renderMediaAvatarHtml(authorAvatar, 'post-avatar')}
            ${renderAvatarFrameHtml(authorFrame)}
          </div>
          <div class="post-content-area">
            <div class="post-header-line">
              <div class="post-author-info" data-handle="${post.handle}"><span class="post-author-name" ${authorNameStyle}>${escapeHtml(authorName)}</span><span class="post-author-handle">${escapeHtml(post.handle)}</span></div>
              <div style="display:flex;align-items:center;gap:6px;">
                ${post.isPinned ? '<span class="pin-badge">📌 Sabitlendi</span>' : ''}
                <span class="post-time" title="${post.timestamp}">${formatDateTime(post.timestamp)}</span>
                ${post.editedAt ? `<span class="edited-badge">düzenlendi</span>` : ''}
              </div>
            </div>
            ${post.replyingTo ? `<div class="quote-reply-box" title="Yanıtlanan mesaj"><svg class="quote-reply-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7a3 3 0 0 0 3 3h7"/></svg><div style="width:16px;height:16px;border-radius:50%;overflow:hidden;position:relative;display:inline-block;vertical-align:middle;margin-right:4px;">${renderMediaAvatarHtml(getReplyingAvatar(post.replyingTo), 'quote-reply-avatar')}</div><span class="quote-reply-author">@${escapeHtml(post.replyingTo.author)}:</span><span class="quote-reply-text">${escapeHtml(post.replyingTo.text)}</span></div>` : ''}
            <div class="post-body-text">${parseContentFormatting(post.content)}</div>
            ${renderPostMediaHtml(post)}
            ${renderUnifiedReactionHtml(post)}
            <div class="post-actions-bar">
              <button class="action-item btn-toggle-comments" data-id="${post.id}"><i data-lucide="message-circle" style="width:16px;height:16px;"></i> ${post.repliesCount || 0} Yorum</button>
              <button class="action-item btn-like ${post.isLiked ? 'liked' : ''}" data-id="${post.id}"><i data-lucide="heart" style="width:16px;height:16px;"></i> ${post.likes}</button>
              <button class="action-item btn-repost ${post.isReposted ? 'reposted' : ''}" data-id="${post.id}"><i data-lucide="repeat-2" style="width:16px;height:16px;"></i> ${post.reposts}</button>
              <button class="action-item btn-save ${post.isSaved ? 'saved' : ''}" data-id="${post.id}"><i data-lucide="bookmark" style="width:16px;height:16px;"></i></button>
            </div>
            ${open ? `
              <div class="comments-container">
                <div class="comment-composer-row">
                  <div class="comment-composer-avatar-wrap" style="width:32px; height:32px; border-radius:50%; overflow:hidden; position:relative; flex-shrink:0;">
                    ${renderMediaAvatarHtml(myAvatar, 'comment-composer-avatar')}
                  </div>
                  <div class="comment-input-wrapper">
                    <input type="text" class="input-post-comment" data-postid="${post.id}" placeholder="Bir yanıt yazın... (Enter)">
                  </div>
                </div>
                ${renderCommentsTreeHtml(post.comments, post.id)}
              </div>` : ''}
          </div>
        </div>`;
      }).join('');
    }
    attachFeedEventListeners();
    refreshIcons(feedPostsContainer);
    updateRightSidebar();
  }

  function attachFeedEventListeners() {
    document.querySelectorAll('.btn-like').forEach(btn => btn.addEventListener('click', () => {
      const post = window.dataStore.posts.find(p => p.id === btn.dataset.id);
      const wasLiked = post && post.isLiked;
      window.dataStore.toggleLike(btn.dataset.id);
      if (!wasLiked && post && post.handle !== window.dataStore.currentUser.handle) {
        window.dataStore.addNotification('like', 'Yeni Beğeni', `${window.dataStore.currentUser.name} gönderinizi beğendi.`, { postId: btn.dataset.id });
        if (window.audioSynth) window.audioSynth.playNotification();
      }
      // Light update: update like button in-place without full re-render
      const likeBtn = document.querySelector(`.btn-like[data-id="${btn.dataset.id}"]`);
      const postAfter = window.dataStore.posts.find(p => p.id === btn.dataset.id);
      if (likeBtn && postAfter) {
        likeBtn.classList.toggle('liked', !!postAfter.isLiked);
        likeBtn.innerHTML = `<i data-lucide="heart" style="width:16px;height:16px;"></i> ${postAfter.likes}`;
        refreshIcons();
      }
    }));
    document.querySelectorAll('.btn-repost').forEach(btn => btn.addEventListener('click', () => {
      window.dataStore.toggleRepost(btn.dataset.id);
      const postR = window.dataStore.posts.find(p => p.id === btn.dataset.id);
      if (postR) { btn.classList.toggle('reposted', !!postR.isReposted); btn.innerHTML = `<i data-lucide="repeat-2" style="width:16px;height:16px;"></i> ${postR.reposts}`; refreshIcons(); }
    }));
    document.querySelectorAll('.btn-save').forEach(btn => btn.addEventListener('click', () => {
      window.dataStore.toggleSave(btn.dataset.id);
      const postS = window.dataStore.posts.find(p => p.id === btn.dataset.id);
      if (postS) btn.classList.toggle('saved', !!postS.isSaved);
    }));
    // ── DISCORD-GRADE FINE-GRAINED REACTION PATCHING ──
    function patchPostReactions(postId) {
      const card = document.querySelector(`.channel-chat-item[data-id="${postId}"], .post-card[data-id="${postId}"]`);
      if (!card) return false;
      const post = window.dataStore.posts.find(p => p.id === postId);
      if (!post) return false;

      // Channel chat ise
      const channelChatBody = card.querySelector('.channel-chat-body');
      if (channelChatBody) {
        let rxRow = channelChatBody.querySelector('.reactions-row');
        const newHtml = renderDiscordReactionsHtml(post);
        if (rxRow) {
          if (newHtml) {
            rxRow.outerHTML = newHtml;
          } else {
            rxRow.remove();
          }
        } else if (newHtml) {
          channelChatBody.insertAdjacentHTML('beforeend', newHtml);
        }
      } else {
        // Feed post card ise
        const contentArea = card.querySelector('.post-content-area');
        if (contentArea) {
          let uniRx = contentArea.querySelector('.unified-reaction-pill');
          const newUniHtml = renderUnifiedReactionHtml(post);
          if (uniRx) {
            if (newUniHtml) uniRx.outerHTML = newUniHtml;
            else uniRx.remove();
          } else if (newUniHtml) {
            const actBar = contentArea.querySelector('.post-actions-bar');
            if (actBar) actBar.insertAdjacentHTML('beforebegin', newUniHtml);
          }
        }
      }

      // Sadece bu kartın reaction pill'lerini yeniden bağla
      card.querySelectorAll('.reaction-pill').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          window.dataStore.toggleReaction(btn.dataset.id, btn.dataset.emoji);
          patchPostReactions(btn.dataset.id);
        };
      });
      return true;
    }

    // ── TARGETED FINE-GRAINED POST DOM PATCHERS ──
    function patchPostContent(postId, newContent) {
      const card = document.querySelector(`.post-card[data-id="${postId}"], .channel-chat-item[data-id="${postId}"]`);
      if (!card) return false;
      const textEl = card.querySelector('.post-body-text');
      if (textEl) {
        textEl.innerHTML = parseContentFormatting(newContent);
      }
      const headerLine = card.querySelector('.post-header-line > div:last-child') || card.querySelector('.channel-chat-header');
      if (headerLine && !card.querySelector('.edited-badge')) {
        const span = document.createElement('span');
        span.className = 'edited-badge';
        span.textContent = 'düzenlendi';
        headerLine.appendChild(span);
      }
      return true;
    }

    function patchPostPin(postId, isPinned) {
      const card = document.querySelector(`.post-card[data-id="${postId}"], .channel-chat-item[data-id="${postId}"]`);
      if (!card) return false;
      const headerLine = card.querySelector('.post-header-line > div:last-child');
      const existingBadge = card.querySelector('.pin-badge');
      if (isPinned && !existingBadge && headerLine) {
        const span = document.createElement('span');
        span.className = 'pin-badge';
        span.textContent = '📌 Sabitlendi';
        headerLine.insertBefore(span, headerLine.firstChild);
      } else if (!isPinned && existingBadge) {
        existingBadge.remove();
      }
      const pinBtn = card.querySelector('.btn-pin-post');
      if (pinBtn) {
        pinBtn.title = isPinned ? 'Sabitlemeyi Kaldır' : 'Sabitle';
        pinBtn.innerHTML = `<i data-lucide="${isPinned ? 'pin-off' : 'pin'}" style="width:14px;height:14px;"></i> ${isPinned ? 'Kaldır' : 'Sabitle'}`;
        refreshIcons(pinBtn);
      }
      return true;
    }

    function patchPostDelete(postId) {
      const card = document.querySelector(`.post-card[data-id="${postId}"], .channel-chat-item[data-id="${postId}"]`);
      if (card) {
        card.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
          card.remove();
          const remaining = document.querySelectorAll('.post-card, .channel-chat-item');
          if (remaining.length === 0 && feedPostsContainer) {
            feedPostsContainer.innerHTML = '<div style="padding:50px;text-align:center;color:var(--text-muted);font-size:0.9rem;">Gönderi yok.</div>';
          }
        }, 200);
        return true;
      }
      return false;
    }

    function patchPostComment(postId, comment) {
      const card = document.querySelector(`.post-card[data-id="${postId}"]`);
      if (!card) return false;
      const post = window.dataStore.posts.find(p => p.id === postId);
      if (!post) return false;

      const commentBtn = card.querySelector('.btn-toggle-comments');
      if (commentBtn) {
        commentBtn.innerHTML = `<i data-lucide="message-circle" style="width:16px;height:16px;"></i> ${post.repliesCount || 0} Yorum`;
        refreshIcons(commentBtn);
      }

      const container = card.querySelector('.comments-container');
      if (container) {
        let treeContainer = container.querySelector('.comments-list') || container.querySelector('.comments-empty-notice');
        const newTreeHtml = renderCommentsTreeHtml(post.comments, post.id);
        if (treeContainer) {
          treeContainer.outerHTML = newTreeHtml;
        } else {
          container.insertAdjacentHTML('beforeend', newTreeHtml);
        }
        const newlyAddedTree = container.querySelector('.comments-list');
        if (newlyAddedTree) {
          refreshIcons(newlyAddedTree);
          bindCommentItemEvents(newlyAddedTree, postId);
        }
      }
      return true;
    }

    function togglePostComments(postId) {
      const card = document.querySelector(`.post-card[data-id="${postId}"]`);
      if (!card) return;
      const contentArea = card.querySelector('.post-content-area');
      if (!contentArea) return;

      let commentsContainer = contentArea.querySelector('.comments-container');
      expandedCommentsPosts[postId] = !expandedCommentsPosts[postId];

      if (!expandedCommentsPosts[postId]) {
        if (commentsContainer) commentsContainer.remove();
        return;
      }

      const post = window.dataStore.posts.find(p => p.id === postId);
      if (!post) return;

      const myAvatar = window.dataStore.currentUser?.avatar || window.DEFAULT_AVATAR;
      const newContainerHtml = `
        <div class="comments-container">
          <div class="comment-composer-row">
            <div class="comment-composer-avatar-wrap" style="width:32px; height:32px; border-radius:50%; overflow:hidden; position:relative; flex-shrink:0;">
              ${renderMediaAvatarHtml(myAvatar, 'comment-composer-avatar')}
            </div>
            <div class="comment-input-wrapper">
              <input type="text" class="input-post-comment" data-postid="${post.id}" placeholder="Bir yanıt yazın... (Enter)">
            </div>
          </div>
          ${renderCommentsTreeHtml(post.comments, post.id)}
        </div>`;

      if (commentsContainer) {
        commentsContainer.outerHTML = newContainerHtml;
      } else {
        contentArea.insertAdjacentHTML('beforeend', newContainerHtml);
      }

      const newlyAdded = contentArea.querySelector('.comments-container');
      if (newlyAdded) {
        refreshIcons(newlyAdded);
        bindCommentComposerEvents(newlyAdded, postId);
        const inp = newlyAdded.querySelector('.input-post-comment');
        if (inp) inp.focus();
      }
    }

    function bindCommentComposerEvents(container, postId) {
      const inp = container.querySelector('.input-post-comment');
      if (inp) {
        inp.onkeydown = (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            submitComment(inp);
          }
        };
      }
      bindCommentItemEvents(container, postId);
    }

    function bindCommentItemEvents(container, postId) {
      container.querySelectorAll('.btn-reply-comment').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const postCard = container.closest('.post-card');
          const inp = postCard ? postCard.querySelector('.input-post-comment') : null;
          if (inp) {
            inp.dataset.parentid = btn.dataset.cmtid;
            inp.placeholder = `@${btn.dataset.author} kullanıcısına yanıt ver...`;
            inp.focus();
          }
        };
      });
    }

    const _debouncedRF = debounce(renderFeed, 80);
    document.querySelectorAll('.btn-open-emoji-popover').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        activePopoverPostId = activePopoverPostId === btn.dataset.id ? null : btn.dataset.id;
        _debouncedRF();
      });
    });
    document.querySelectorAll('.btn-select-emoji').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const res = window.dataStore.toggleReaction(btn.dataset.id, btn.dataset.emoji);
        activePopoverPostId = null;
        if (res && res.error) {
          showToast(res.error);
        } else {
          if (!patchPostReactions(btn.dataset.id)) _debouncedRF();
          else {
            const popover = btn.closest('.emoji-popover');
            if (popover) popover.remove();
          }
        }
      });
    });
    document.querySelectorAll('.reaction-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.dataStore.toggleReaction(btn.dataset.id, btn.dataset.emoji);
        if (!patchPostReactions(btn.dataset.id)) _debouncedRF();
      });
    });
    document.querySelectorAll('.btn-quote-reply').forEach(btn => { btn.addEventListener('click', (e) => { e.stopPropagation(); setReplyTarget(btn.dataset.author, btn.dataset.text, btn.dataset.avatar, btn.dataset.handle); }); });
    document.querySelectorAll('.btn-toggle-comments').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        togglePostComments(btn.dataset.id);
      };
    });

    // Yorum Gönder Fonksiyonu (Enter ve Buton için ortak)
    function submitComment(inp) {
      if (!inp || !inp.dataset.postid) return;
      const text = inp.value.trim();
      if (!text) return;
      const postId = inp.dataset.postid;
      const parentId = inp.dataset.parentid || null;
      window.dataStore.addComment(postId, text, parentId);
      inp.value = '';
      delete inp.dataset.parentid;
      showToast('Yorum eklendi');
      window.dataStore.addNotification('comment', 'Yeni Yorum', `${window.dataStore.currentUser.name} gönderinize yorum yaptı.`, { postId });
    }

    document.querySelectorAll('.input-post-comment').forEach(inp => {
      inp.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          submitComment(inp);
        }
      };
    });

    document.querySelectorAll('.btn-send-comment').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const inp = document.querySelector(`.input-post-comment[data-postid="${btn.dataset.postid}"]`);
        if (inp) submitComment(inp);
      };
    });

    document.querySelectorAll('.btn-reply-comment').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const inp = document.querySelector(`.input-post-comment[data-postid="${btn.dataset.postid}"]`);
        if (inp) {
          inp.dataset.parentid = btn.dataset.cmtid;
          inp.placeholder = `@${btn.dataset.author} kullanıcısına yanıt ver...`;
          inp.focus();
        }
      };
    });
    document.querySelectorAll('.post-media-image').forEach(img => { img.addEventListener('click', (e) => { e.stopPropagation(); openLightbox(img.src); }); });
    document.querySelectorAll('.post-avatar-wrap[data-handle], .post-avatar[data-handle]').forEach(el => { el.addEventListener('click', (e) => { e.stopPropagation(); const handle = el.dataset.handle || el.closest('[data-handle]')?.dataset.handle; if (handle) showUserProfilePopover(e, handle); }); });
    document.querySelectorAll('.post-author-name, .mention').forEach(el => { el.addEventListener('click', (e) => { e.stopPropagation(); const h = el.dataset.handle || el.dataset.user; if (h) window.openModalView(`profile-view.html?handle=${encodeURIComponent(h)}`); }); });
    document.querySelectorAll('.dm-invite-copy').forEach(btn => {
      btn.addEventListener('click', () => { navigator.clipboard.writeText(btn.dataset.url || '').then(() => showToast('Kopyalandı')).catch(() => showToast('Kopyalanamadı')); });
    });
    document.querySelectorAll('.dm-invite-join').forEach(btn => {
      btn.addEventListener('click', () => {
        const serverId = btn.dataset.serverId;
        if (serverId) {
          showToast('Sunucuya geçildi');
          renderServers();
          switchToServer(serverId);
          return;
        }
        const code = btn.dataset.code;
        if (!code) return;
        const existingSrv = window.dataStore.servers.find(s => s.inviteCode === code);
        if (existingSrv) {
          showToast('Sunucuya geçildi');
          renderServers();
          switchToServer(existingSrv.id);
          return;
        }
        const result = window.dataStore.joinByInviteCode(code);
        if (result && result.error) { showToast(result.error); return; }
        if (result && result.server) { showToast(result.server.name + ' sunucusuna katıldınız!'); renderServers(); switchToServer(result.server.id); }
      });
    });

    // Link önizlemelerini hidrat et
    hydrateLinkPreviews(feedPostsContainer);

    // ── NEW: Edit / Delete / Pin / Block ─────────────────────
    document.querySelectorAll('.btn-edit-post').forEach(btn => {
      btn.addEventListener('click', (e) => { e.stopPropagation(); window.handleEditPost && window.handleEditPost(btn.dataset.id); });
    });
    document.querySelectorAll('.btn-delete-post').forEach(btn => {
      btn.addEventListener('click', (e) => { e.stopPropagation(); window.handleDeletePost && window.handleDeletePost(btn.dataset.id); });
    });
    document.querySelectorAll('.btn-pin-post').forEach(btn => {
      btn.addEventListener('click', (e) => { e.stopPropagation(); window.handlePinPost && window.handlePinPost(btn.dataset.id); });
    });
    document.querySelectorAll('.btn-block-user').forEach(btn => {
      btn.addEventListener('click', (e) => { e.stopPropagation(); window.handleBlockUser && window.handleBlockUser(btn.dataset.handle); });
    });
  }


  // ── IN-APP MODAL VIEW SYSTEM (Seamless, targeted, zero page refresh) ──
  window.openModalView = function (url) {
    const modalLayer = document.getElementById('ziorse-modal-layer');
    const iframe = document.getElementById('ziorse-modal-iframe');
    if (!modalLayer || !iframe) {
      window.location.href = url;
      return;
    }
    iframe.src = url;
    modalLayer.style.display = 'block';
    requestAnimationFrame(() => {
      modalLayer.style.opacity = '1';
    });
  };

  window.closeModalView = function (result) {
    const modalLayer = document.getElementById('ziorse-modal-layer');
    const iframe = document.getElementById('ziorse-modal-iframe');
    if (!modalLayer) return;

    modalLayer.style.opacity = '0';
    setTimeout(() => {
      modalLayer.style.display = 'none';
      if (iframe) iframe.src = 'about:blank';
    }, 200);

    if (result && result.type) {
      handleTargetedUpdate(result);
    } else {
      syncUserDisplay();
      if (window.dataStore.activeServerId && window.dataStore.activeServerId !== 'home') {
        const srv = window.dataStore.servers.find(s => s.id === window.dataStore.activeServerId);
        if (srv) {
          renderServerChannels(srv, window.dataStore.activeChannelId);
          renderOnlineMembers();
        }
      }
    }
  };

  // ── INSTANT IN-PLACE LIVE MEDIA & STYLING UPDATER (Zero App Reload) ──
  window.updateLiveUserMedia = function (handle, newAvatar, newBanner, newFontStyle, newNameColor, newNameEffects, newAvatarFrame) {
    if (!handle) return;
    const cleanH = handle.toLowerCase().replace('@', '');
    const fullH = '@' + cleanH;

    // 1. Update dataStore in-memory
    if (window.dataStore) {
      if (window.dataStore.currentUser && (window.dataStore.currentUser.handle || '').toLowerCase().replace('@', '') === cleanH) {
        if (newAvatar !== undefined) window.dataStore.currentUser.avatar = newAvatar;
        if (newBanner !== undefined) window.dataStore.currentUser.banner = newBanner;
        if (newFontStyle !== undefined) window.dataStore.currentUser.fontStyle = newFontStyle;
        if (newNameColor !== undefined) window.dataStore.currentUser.nameColor = newNameColor;
        if (newNameEffects !== undefined) window.dataStore.currentUser.nameEffects = newNameEffects;
        if (newAvatarFrame !== undefined) window.dataStore.currentUser.avatarFrame = newAvatarFrame;
      }
      if (window.dataStore.userDirectory) {
        const dir = window.dataStore.userDirectory;
        const entry = dir[fullH] || dir[cleanH];
        if (entry) {
          if (newAvatar !== undefined) entry.avatar = newAvatar;
          if (newBanner !== undefined) entry.banner = newBanner;
          if (newFontStyle !== undefined) entry.fontStyle = newFontStyle;
          if (newNameColor !== undefined) entry.nameColor = newNameColor;
          if (newNameEffects !== undefined) entry.nameEffects = newNameEffects;
          if (newAvatarFrame !== undefined) entry.avatarFrame = newAvatarFrame;
        }
      }
    }

    const isSelf = window.dataStore.currentUser && (window.dataStore.currentUser.handle || '').toLowerCase().replace('@', '') === cleanH;

    // 2. Targeted In-Place Image DOM Updates (NO PAGE REFRESH!)
    if (newAvatar) {
      const resolvedAvatar = normalizeMediaUrl(newAvatar) || window.DEFAULT_AVATAR;

      if (userAvatarDisplay && isSelf) applyAvatarToElement(userAvatarDisplay, resolvedAvatar);
      if (composerUserAvatar && isSelf) applyAvatarToElement(composerUserAvatar, resolvedAvatar);

      // All post cards and chat items by this user across the screen
      document.querySelectorAll(`.post-avatar-wrap[data-handle="${fullH}"], .post-avatar-wrap[data-handle="${cleanH}"], .post-avatar-wrap[data-handle="@${cleanH}"]`).forEach(wrap => {
        applyAvatarToElement(wrap, resolvedAvatar);
      });

      // DM messages
      if (isSelf) {
        document.querySelectorAll('.dm-msg-row.mine .dm-msg-avatar-wrap, .dm-msg-row.mine .dm-msg-avatar').forEach(el => {
          applyAvatarToElement(el, resolvedAvatar);
        });
      }

      // Member list in right sidebar
      document.querySelectorAll(`.user-member-item[data-handle="${fullH}"], .user-member-item[data-handle="${cleanH}"], .user-member-item[data-handle="@${cleanH}"]`).forEach(item => {
        const wrap = item.querySelector('.avatar-wrapper-status');
        if (wrap) applyAvatarToElement(wrap, resolvedAvatar);
        const img = item.querySelector('img.user-avatar-sm');
        if (img) img.src = resolvedAvatar;
      });

      // Profile popover if currently open
      const popover = document.getElementById('user-profile-popover');
      if (popover && popover.style.display !== 'none' && popover.dataset.activeHandle && popover.dataset.activeHandle.toLowerCase().replace('@', '') === cleanH) {
        const popoverAvatar = document.getElementById('popover-avatar-wrap') || document.getElementById('popover-avatar');
        if (popoverAvatar) applyAvatarToElement(popoverAvatar, resolvedAvatar);
      }
    }

    // 3. Targeted In-Place Avatar Frame DOM Updates
    if (newAvatarFrame !== undefined) {
      if (isSelf) {
        const myAvWrap = document.getElementById('user-avatar-wrap');
        if (myAvWrap) applyAvatarFrameToContainer(myAvWrap, newAvatarFrame);
        const compAvWrap = document.getElementById('composer-avatar-wrap');
        if (compAvWrap) applyAvatarFrameToContainer(compAvWrap, newAvatarFrame);
      }

      // Chat feed post avatar wraps
      document.querySelectorAll(`.post-avatar-wrap[data-handle="${fullH}"], .post-avatar-wrap[data-handle="${cleanH}"], .post-avatar-wrap[data-handle="@${cleanH}"]`).forEach(wrap => {
        applyAvatarFrameToContainer(wrap, newAvatarFrame);
      });

      // DM messages
      if (isSelf) {
        document.querySelectorAll('.dm-msg-row.mine .dm-msg-avatar-wrap').forEach(wrap => {
          applyAvatarFrameToContainer(wrap, newAvatarFrame);
        });
      }

      // Right sidebar member avatars
      document.querySelectorAll(`.user-member-item[data-handle="${fullH}"], .user-member-item[data-handle="${cleanH}"], .user-member-item[data-handle="@${cleanH}"]`).forEach(item => {
        const wrap = item.querySelector('.avatar-wrapper-status');
        if (wrap) applyAvatarFrameToContainer(wrap, newAvatarFrame);
      });

      // Profile popover if open
      const popover = document.getElementById('user-profile-popover');
      if (popover && popover.style.display !== 'none' && popover.dataset.activeHandle && popover.dataset.activeHandle.toLowerCase().replace('@', '') === cleanH) {
        const popAvatarWrap = document.getElementById('popover-avatar-wrap');
        if (popAvatarWrap) applyAvatarFrameToContainer(popAvatarWrap, newAvatarFrame);
      }

      // Profile bar dropdown if open
      const pbd = document.getElementById('profile-bar-dropdown');
      if (pbd && isSelf) {
        const pbdWrap = pbd.querySelector('.pbd-avatar-wrap');
        if (pbdWrap) applyAvatarFrameToContainer(pbdWrap, newAvatarFrame);
      }
    }

    // 4. Targeted In-Place Font Style, Color & Effect Updates
    if (newFontStyle !== undefined || newNameColor !== undefined || newNameEffects !== undefined) {
      if (isSelf && userNameDisplay) {
        applyUserNameStyling(userNameDisplay, newFontStyle, newNameColor, newNameEffects);
      }

      // Chat feed author names
      document.querySelectorAll(`.post-author-name[data-handle="${fullH}"], .post-author-name[data-handle="${cleanH}"], .post-author-name[data-handle="@${cleanH}"]`).forEach(el => {
        applyUserNameStyling(el, newFontStyle, newNameColor, newNameEffects);
      });

      // Right sidebar member names
      document.querySelectorAll(`.user-member-item[data-handle="${fullH}"], .user-member-item[data-handle="${cleanH}"], .user-member-item[data-handle="@${cleanH}"]`).forEach(item => {
        const nameEl = item.querySelector('.user-member-name');
        if (nameEl) applyUserNameStyling(nameEl, newFontStyle, newNameColor, newNameEffects);
      });

      // Popover if open
      const popover = document.getElementById('user-profile-popover');
      if (popover && popover.style.display !== 'none' && popover.dataset.activeHandle && popover.dataset.activeHandle.toLowerCase().replace('@', '') === cleanH) {
        const popName = document.getElementById('popover-name');
        if (popName) applyUserNameStyling(popName, newFontStyle, newNameColor, newNameEffects);
      }

      // Profile bar dropdown if open
      const pbd = document.getElementById('profile-bar-dropdown');
      if (pbd && isSelf) {
        const pbdName = pbd.querySelector('.pbd-name');
        if (pbdName) applyUserNameStyling(pbdName, newFontStyle, newNameColor, newNameEffects);
      }
    }

    // 3. Targeted Banner DOM Update
    if (newBanner !== undefined) {
      const resolvedBanner = normalizeMediaUrl(newBanner);
      const liveBannerEl = document.querySelector('.pbd-banner, #profile-drawer-banner');
      if (liveBannerEl) {
        if (resolvedBanner && (resolvedBanner.startsWith('http') || resolvedBanner.startsWith('data:image'))) {
          liveBannerEl.style.backgroundImage = `url('${resolvedBanner}')`;
        } else if (resolvedBanner) {
          liveBannerEl.style.background = resolvedBanner;
        }
      }

      const popBanner = document.getElementById('popover-banner');
      const popover = document.getElementById('user-profile-popover');
      if (popBanner && popover && popover.style.display !== 'none' && popover.dataset.activeHandle && popover.dataset.activeHandle.toLowerCase().replace('@', '') === cleanH) {
        if (resolvedBanner && (resolvedBanner.startsWith('http') || resolvedBanner.startsWith('data:image') || resolvedBanner.startsWith('data:video') || resolvedBanner.match(/\.(mp4|webm|mov|mkv)(\?.*)?$/i))) {
          if (resolvedBanner.startsWith('data:video') || resolvedBanner.match(/\.(mp4|webm|mov|mkv)(\?.*)?$/i)) {
            popBanner.style.backgroundImage = 'none';
            let v = popBanner.querySelector('video.popover-media-banner');
            if (!v) {
              v = document.createElement('video');
              v.className = 'popover-media-banner';
              v.autoplay = true; v.loop = true; v.muted = true; v.playsInline = true;
              v.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;pointer-events:none;';
              popBanner.style.position = 'relative';
              popBanner.appendChild(v);
            }
            v.src = resolvedBanner;
          } else {
            popBanner.style.backgroundImage = `url('${resolvedBanner}')`;
            popBanner.style.backgroundSize = 'cover';
            popBanner.style.backgroundPosition = 'center';
          }
        } else if (resolvedBanner) {
          popBanner.style.background = resolvedBanner;
        }
      }
    }

    // Right sidebar member avatars and names are already updated in-place above without heavy re-renders
  };

  window.updateLiveServerMedia = function (serverId, newIcon, newBanner) {
    if (!serverId) return;
    if (window.dataStore && window.dataStore.servers) {
      const srv = window.dataStore.servers.find(s => s.id === serverId);
      if (srv) {
        if (newIcon !== undefined) srv.icon = newIcon;
        if (newBanner !== undefined) srv.banner = newBanner;
      }
    }

    // Targeted update of left rail server icon button
    const srvBtn = document.querySelector(`.server-icon[data-id="${serverId}"]`);
    if (srvBtn && newIcon) {
      const resolvedIcon = normalizeMediaUrl(newIcon);
      const isImg = resolvedIcon.startsWith('data:image') || resolvedIcon.startsWith('http');
      const existingImg = srvBtn.querySelector('img');
      const existingSpan = srvBtn.querySelector('span');

      if (isImg) {
        if (existingImg) {
          existingImg.src = resolvedIcon;
        } else {
          if (existingSpan) existingSpan.remove();
          const img = document.createElement('img');
          img.src = resolvedIcon;
          img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:inherit;pointer-events:none;';
          srvBtn.appendChild(img);
        }
      } else {
        if (existingImg) existingImg.remove();
        if (existingSpan) {
          existingSpan.textContent = newIcon;
        } else {
          const span = document.createElement('span');
          span.textContent = newIcon;
          srvBtn.appendChild(span);
        }
      }
    }

    // If currently on this server, update server banner
    if (window.dataStore && window.dataStore.activeServerId === serverId) {
      if (newBanner !== undefined) {
        const resolvedBanner = normalizeMediaUrl(newBanner);
        const bannerContainer = document.querySelector('.srv-banner-bg, #server-banner-container');
        if (bannerContainer && resolvedBanner) {
          bannerContainer.style.backgroundImage = `url('${resolvedBanner}')`;
        }
      }
    }
  };

  function handleTargetedUpdate(result) {
    if (!result || !result.type) return;

    if (result.type === 'channel-updated') {
      const activeServerId = window.dataStore.activeServerId;
      if (activeServerId === result.serverId) {
        const chBtn = document.querySelector(`.ch-channel-item[data-channel-id="${result.channelId}"]`);
        if (chBtn) {
          const span = chBtn.querySelector('span');
          if (span) span.textContent = result.newName;
        }
        if (window.dataStore.activeChannelId === result.channelId) {
          if (feedTitleText) feedTitleText.textContent = '# ' + result.newName;
          updateHeaderLocation();
        }
      }
      return;
    }

    if (result.type === 'channel-removed') {
      const activeServerId = window.dataStore.activeServerId;
      if (activeServerId === result.serverId) {
        const chBtn = document.querySelector(`.ch-channel-item[data-channel-id="${result.channelId}"]`);
        if (chBtn) chBtn.remove();
        if (window.dataStore.activeChannelId === result.channelId) {
          const srv = window.dataStore.servers.find(s => s.id === result.serverId);
          if (srv) renderServerChannels(srv);
        }
      }
      return;
    }

    if (result.type === 'category-updated') {
      const activeServerId = window.dataStore.activeServerId;
      if (String(activeServerId) === String(result.serverId)) {
        const catHead = document.querySelector(`.ch-category[data-cat-id="${result.categoryId}"] .ch-cat-left`);
        if (catHead) {
          const catNameEl = catHead.querySelector('.ch-cat-name');
          if (catNameEl && result.newName) catNameEl.textContent = result.newName;
          let iconEl = catHead.querySelector('.ch-cat-icon');
          if (result.icon) {
            if (!iconEl) {
              iconEl = document.createElement('img');
              iconEl.className = 'ch-cat-icon';
              catHead.insertBefore(iconEl, catHead.firstChild);
            }
            iconEl.src = result.icon;
          } else if (iconEl) {
            iconEl.remove();
          }
        } else {
          const srv = window.dataStore.servers.find(s => String(s.id) === String(result.serverId));
          if (srv) renderServerChannels(srv, window.dataStore.activeChannelId);
        }
      }
      return;
    }

    if (result.type === 'category-removed') {
      const activeServerId = window.dataStore.activeServerId;
      if (String(activeServerId) === String(result.serverId)) {
        const catEl = document.querySelector(`.ch-category[data-cat-id="${result.categoryId}"]`);
        if (catEl) catEl.remove();
        else {
          const srv = window.dataStore.servers.find(s => String(s.id) === String(result.serverId));
          if (srv) renderServerChannels(srv, window.dataStore.activeChannelId);
        }
      }
      return;
    }

    if (result.type === 'user-updated') {
      if (result.user && window.dataStore) {
        window.dataStore.currentUser = { ...window.dataStore.currentUser, ...result.user };
        if (typeof window.dataStore.saveUser === 'function') {
          window.dataStore.saveUser(result.user);
        }
      }
      const cu = window.dataStore.currentUser;
      if (cu && cu.handle) {
        window.updateLiveUserMedia(
          cu.handle,
          cu.avatar,
          cu.banner,
          cu.fontStyle,
          cu.nameColor,
          cu.nameEffects,
          cu.avatarFrame
        );
      }
      syncUserDisplay();
      return;
    }

    if (result.type === 'server-updated') {
      const srv = window.dataStore.servers.find(s => s.id === result.serverId);
      if (srv) {
        const titleEl = document.getElementById('current-server-name');
        if (titleEl && window.dataStore.activeServerId === srv.id) {
          titleEl.textContent = srv.name;
        }
        const railIcon = document.querySelector(`.server-icon[data-server-id="${srv.id}"]`);
        if (railIcon) {
          if (srv.icon && (srv.icon.startsWith('http') || srv.icon.startsWith('data:image'))) {
            railIcon.innerHTML = `<img src="${srv.icon}" class="server-img" alt="${srv.name}">`;
          } else {
            railIcon.innerHTML = srv.name.substring(0, 2).toUpperCase();
          }
        }
      }
      return;
    }

    if (result.type === 'server-deleted') {
      renderServers();
      switchToServer('home');
      return;
    }
  }

  // ── SUBSCRIBE & TARGETED RENDER ───────────────────────────
  let renderDebounceTimer = null;
  function scheduleAppRender() {
    if (renderDebounceTimer) return;
    renderDebounceTimer = requestAnimationFrame(() => {
      renderDebounceTimer = null;
      if (dmView && dmView.style.display === 'grid') {
        renderDMs();
      } else {
        renderFeed();
      }
    });
  }

  window.dataStore.subscribe((event) => {
    if (!event || event.type === 'all') {
      return;
    }

    if (event.type === 'post-edited') {
      if (!patchPostContent(event.postId, event.newContent)) scheduleAppRender();
      return;
    }

    if (event.type === 'post-pinned') {
      if (!patchPostPin(event.postId, event.isPinned)) scheduleAppRender();
      return;
    }

    if (event.type === 'comment-added') {
      if (!patchPostComment(event.postId, event.comment)) scheduleAppRender();
      return;
    }

    if (event.type === 'post-deleted') {
      if (!patchPostDelete(event.postId)) scheduleAppRender();
      return;
    }

    if (event.type === 'user-updated' || event.type === 'status-updated') {
      syncUserDisplay();
      return;
    }

    if (event.type === 'channel-updated' || event.type === 'channel-removed' || event.type === 'category-updated' || event.type === 'category-removed' || event.type === 'server-updated' || event.type === 'server-deleted') {
      handleTargetedUpdate(event);
      return;
    }

    if (event.type === 'channel-added' || event.type === 'category-added' || event.type === 'channels-reordered' || event.type === 'categories-reordered' || event.type === 'channel-moved') {
      if (window.dataStore.activeServerId === event.serverId) {
        const srv = window.dataStore.servers.find(s => s.id === event.serverId);
        if (srv) renderServerChannels(srv, window.dataStore.activeChannelId);
      }
      return;
    }

    if (event.type === 'server-roles-updated') {
      renderServers();
      updateRightSidebar();
      renderOnlineMembers();
      renderFeed();
      return;
    }

    if (event.type === 'post-liked' || event.type === 'post-reposted' || event.type === 'post-saved' || event.type === 'post-reaction') {
      return;
    }
  });

  // ── BAŞLANGIÇ DURUMU (INIT) ───────────────────────────────────
  syncUserDisplay();
  const initUrlParams = new URLSearchParams(window.location.search);
  const initServerId = initUrlParams.get('serverId') || initUrlParams.get('server') || initUrlParams.get('id');
  const initChannelId = initUrlParams.get('channelId') || initUrlParams.get('channel') || 'genel';

  if (initServerId && initServerId !== 'home' && window.dataStore.servers.some(s => s.id === initServerId)) {
    switchToServer(initServerId, initChannelId);
  } else {
    window.dataStore.activeServerId = 'home';
    window.dataStore.activeFilter = 'for-you';
    if (composerCard) composerCard.style.display = 'flex';
    if (feedPostsContainer) feedPostsContainer.style.display = '';
    if (mainFeedView) mainFeedView.style.display = 'flex';
    if (dmView) dmView.style.display = 'none';
    if (appLayoutEl) {
      appLayoutEl.classList.add('hide-channels-sidebar');
      appLayoutEl.classList.remove('hide-right-sidebar');
      appLayoutEl.classList.remove('dm-active');
    }
    renderServers();
    renderOnlineMembers();
    renderVoiceChannels();
    renderFeed(true);
    updateRightSidebar();
  }
  refreshIcons();

  // Splash ekranı uygulama hazır olur olmaz anında kapanır (Gecikmesiz hızlı açılış)
  function dismissSplashWhenAppReady() {
    let dismissed = false;
    function doDismiss() {
      if (dismissed) return;
      dismissed = true;
      if (typeof window.dismissSplash === 'function') {
        window.dismissSplash();
      }
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(doDismiss);
    });

    setTimeout(doDismiss, 300);
  }

  dismissSplashWhenAppReady();

  // ── DISCORD-GRADE MULTI-THREAD SEARCH WORKER ──
  let searchWorker = null;
  let searchRequestId = 0;
  try {
    searchWorker = new Worker('js/workers/search-worker.js');
    searchWorker.onmessage = function (e) {
      const { id, results } = e.data;
      if (id === searchRequestId && feedPostsContainer) {
        if (!results || results.length === 0) {
          feedPostsContainer.innerHTML = '<div style="padding:50px;text-align:center;color:var(--text-muted);font-size:0.9rem;">Eşleşen sonuç bulunamadı.</div>';
        } else {
          feedPostsContainer.innerHTML = results.map(post => {
            const authorProf = window.dataStore.getUserProfile(post.handle);
            const authorAvatar = authorProf.avatar || post.avatar || window.DEFAULT_AVATAR;
            const authorName = authorProf.name || post.author || post.handle;
            return `
            <div class="post-card" data-id="${post.id}">
              <div class="post-avatar-wrap" style="width:42px; height:42px; border-radius:50%; overflow:hidden; position:relative; flex-shrink:0;">
                ${renderMediaAvatarHtml(authorAvatar, 'post-avatar')}
              </div>
              <div class="post-content-area">
                <div class="post-header-line">
                  <div class="post-author-info"><span class="post-author-name">${escapeHtml(authorName)}</span><span class="post-author-handle">${escapeHtml(post.handle)}</span></div>
                  <span class="post-time">${formatDateTime(post.timestamp)}</span>
                </div>
                <div class="post-body-text">${parseContentFormatting(post.content)}</div>
                ${renderPostMediaHtml(post)}
              </div>
            </div>`;
          }).join('');
          refreshIcons();
        }
      }
    };
  } catch (err) {
    console.log('Search Worker fallback:', err.message);
  }

  const searchInputWidget = document.getElementById('search-input-widget');
  if (searchInputWidget) {
    searchInputWidget.addEventListener('input', (e) => {
      const query = (e.target.value || '').trim();
      if (!query) {
        renderFeed();
        return;
      }
      if (searchWorker) {
        searchRequestId++;
        searchWorker.postMessage({
          id: searchRequestId,
          type: query.startsWith('#') ? 'FILTER_TAGS' : 'SEARCH_POSTS',
          query: query,
          data: window.dataStore.posts
        });
      } else {
        const q = query.toLowerCase();
        const filtered = window.dataStore.posts.filter(p => (p.content || '').toLowerCase().includes(q) || (p.author || '').toLowerCase().includes(q));
        if (filtered.length === 0) {
          feedPostsContainer.innerHTML = '<div style="padding:50px;text-align:center;color:var(--text-muted);font-size:0.9rem;">Eşleşen sonuç bulunamadı.</div>';
        } else {
          feedPostsContainer.innerHTML = filtered.map(post => `
            <div class="post-card" data-id="${post.id}">
              <div class="post-content-area">
                <div class="post-body-text">${parseContentFormatting(post.content)}</div>
              </div>
            </div>
          `).join('');
        }
      }
    });
  }
  window.switchToServerGlobal = switchToServer;
  window.openDMWithHandle = function (handle) {
    const ds = window.dataStore;
    let thread = ds.dmThreads.find(t => t.user && t.user.handle === handle);
    if (!thread) {
      const fp = ds.getUserProfile(handle);
      thread = ds.createDMThread(fp.name, handle);
    }
    if (thread) {
      activeDmThreadId = thread.id;
      activeDmTab = 'friends';
      if (mainFeedView) mainFeedView.style.display = 'none';
      if (dmView) dmView.style.display = 'grid';
      if (appLayoutEl) { appLayoutEl.classList.add('hide-channels-sidebar'); appLayoutEl.classList.add('dm-active'); }
      switchNavHubTo('messages', true);
      triggerDmWithSkeleton(160);
      updateRightSidebar();
    }
  };

  // ── 1. MENTION AUTOCOMPLETE SİSTEMİ (@etiketleme) ─────────────
  function initMentionAutocomplete() {
    function setupMentionInput(inputEl, popupEl) {
      if (!inputEl || !popupEl) return;

      let candidates = [];
      let selectedIndex = 0;

      function getAllMentionableUsers() {
        const ds = window.dataStore;
        if (!ds) return [];

        const isDmInput = (inputEl.id === 'dm-input-text');

        // ── DM GİRİŞ ALANI MENTION KURALI ─────────────────────────────
        // DM'de herkesi etiketleme olmayacak; sadece:
        // 1. Konuştuğun kişi (aktif DM partneri)
        // 2. Kendin (mevcut kullanıcı)
        // 3. @everyone (herkesten bahsetme)
        if (isDmInput) {
          const dmMentions = [];

          // 1. Konuştuğun kişi (aktif DM partneri)
          let partnerUser = null;
          if (activeDmThreadId) {
            const thread = (ds.dmThreads || []).find(t => t.id === activeDmThreadId);
            if (thread && thread.user) {
              partnerUser = thread.user;
            }
          }
          if (!partnerUser) {
            const dmTitleEl = document.getElementById('dm-chat-user-title');
            const fallbackHandle = dmTitleEl ? dmTitleEl.textContent.trim() : '';
            if (fallbackHandle) {
              const cleanH = fallbackHandle.startsWith('@') ? fallbackHandle : '@' + fallbackHandle;
              partnerUser = { name: cleanH.replace('@', ''), handle: cleanH, avatar: window.DEFAULT_AVATAR };
            }
          }

          if (partnerUser && partnerUser.handle) {
            const cleanH = partnerUser.handle.startsWith('@') ? partnerUser.handle : '@' + partnerUser.handle;
            dmMentions.push({
              name: partnerUser.name || cleanH.replace('@', ''),
              handle: cleanH,
              avatar: partnerUser.avatar || window.DEFAULT_AVATAR,
              desc: 'Sohbet edilen kişi'
            });
          }

          // 2. Kendin (mevcut kullanıcı)
          if (ds.currentUser && ds.currentUser.handle) {
            const cu = ds.currentUser;
            const cleanH = cu.handle.startsWith('@') ? cu.handle : '@' + cu.handle;
            if (!partnerUser || partnerUser.handle.toLowerCase() !== cleanH.toLowerCase()) {
              dmMentions.push({
                name: cu.name || cleanH.replace('@', ''),
                handle: cleanH,
                avatar: cu.avatar || window.DEFAULT_AVATAR,
                desc: 'Sen'
              });
            }
          }

          // 3. @everyone (Herkesten bahsetme)
          dmMentions.push({
            name: 'everyone',
            handle: '@everyone',
            avatar: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23646464\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\'/%3E%3Ccircle cx=\'9\' cy=\'7\' r=\'4\'/%3E%3Cpath d=\'M22 21v-2a4 4 0 0 0-3-3.87\'/%3E%3Cpath d=\'M16 3.13a4 4 0 0 1 0 7.75\'/%3E%3C/svg%3E',
            isEveryone: true,
            desc: 'Herkesten bahset'
          });

          return dmMentions;
        }

        // ── KANAL VE GENEL AKIŞ MENTION KURALI ────────────────────────
        const map = new Map();

        // Herkesten bahsetme (@everyone)
        map.set('everyone', {
          name: 'everyone',
          handle: '@everyone',
          avatar: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23646464\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\'/%3E%3Ccircle cx=\'9\' cy=\'7\' r=\'4\'/%3E%3Cpath d=\'M22 21v-2a4 4 0 0 0-3-3.87\'/%3E%3Cpath d=\'M16 3.13a4 4 0 0 1 0 7.75\'/%3E%3C/svg%3E',
          isEveryone: true,
          desc: 'Herkesten bahset'
        });

        // 1. Aktif sunucu üyeleri
        if (ds.activeServerId && ds.activeServerId !== 'home') {
          const srv = (ds.servers || []).find(s => s.id === ds.activeServerId);
          if (srv) {
            const mems = (srv.inviteCode && typeof ds.getServerMembers === 'function')
              ? ds.getServerMembers(srv.inviteCode)
              : (srv.members || []);
            mems.forEach(m => {
              if (m && m.handle) {
                const clean = m.handle.toLowerCase().replace('@', '');
                map.set(clean, {
                  name: m.name || m.handle,
                  handle: m.handle.startsWith('@') ? m.handle : '@' + m.handle,
                  avatar: m.avatar || window.DEFAULT_AVATAR
                });
              }
            });
          }
        }

        // 2. Arkadaşlar
        (ds.friends || []).forEach(f => {
          if (f && f.handle) {
            const clean = f.handle.toLowerCase().replace('@', '');
            if (!map.has(clean)) {
              map.set(clean, {
                name: f.name || f.handle,
                handle: f.handle.startsWith('@') ? f.handle : '@' + f.handle,
                avatar: f.avatar || window.DEFAULT_AVATAR
              });
            }
          }
        });

        // 3. Global kullanıcı dizini
        try {
          const dir = ds._loadGlobalDirectory ? ds._loadGlobalDirectory() : (ds.userDirectory || {});
          Object.values(dir).forEach(u => {
            if (u && u.handle) {
              const clean = u.handle.toLowerCase().replace('@', '');
              if (!map.has(clean)) {
                map.set(clean, {
                  name: u.name || u.handle,
                  handle: u.handle.startsWith('@') ? u.handle : '@' + u.handle,
                  avatar: u.avatar || window.DEFAULT_AVATAR
                });
              }
            }
          });
        } catch (e) { }

        // 4. Mevcut kullanıcı
        if (ds.currentUser && ds.currentUser.handle) {
          const cu = ds.currentUser;
          const clean = cu.handle.toLowerCase().replace('@', '');
          if (!map.has(clean)) {
            map.set(clean, {
              name: cu.name || cu.handle,
              handle: cu.handle.startsWith('@') ? cu.handle : '@' + cu.handle,
              avatar: cu.avatar || window.DEFAULT_AVATAR
            });
          }
        }

        return Array.from(map.values());
      }

      function highlightSelected() {
        const items = popupEl.querySelectorAll('.mention-popup-item');
        items.forEach((item, idx) => {
          if (idx === selectedIndex) {
            item.classList.add('selected');
            item.scrollIntoView({ block: 'nearest' });
          } else {
            item.classList.remove('selected');
          }
        });
      }

      function applyMention(user) {
        if (!user) return;
        const val = inputEl.value;
        const cursorPos = inputEl.selectionStart || val.length;
        const textBefore = val.slice(0, cursorPos);
        const textAfter = val.slice(cursorPos);

        const match = textBefore.match(/(?:^|\s)@([a-zA-Z0-9_ğüşıöçĞÜŞİÖÇ]*)$/);
        if (match) {
          const atIndex = match.index + match[0].indexOf('@');
          const cleanHandle = user.handle.replace('@', '');
          const newTextBefore = textBefore.slice(0, atIndex) + `@${cleanHandle} `;
          inputEl.value = newTextBefore + textAfter;
          const newCursorPos = newTextBefore.length;
          inputEl.setSelectionRange(newCursorPos, newCursorPos);
        }
        popupEl.style.display = 'none';
        inputEl.focus();
      }

      function checkMentionTrigger() {
        const val = inputEl.value;
        const cursorPos = inputEl.selectionStart || 0;
        const textBefore = val.slice(0, cursorPos);
        const match = textBefore.match(/(?:^|\s)@([a-zA-Z0-9_ğüşıöçĞÜŞİÖÇ]*)$/);

        if (!match) {
          popupEl.style.display = 'none';
          return;
        }

        const query = match[1].toLowerCase();
        const allUsers = getAllMentionableUsers();

        if (query === '') {
          candidates = allUsers.slice(0, 10);
        } else {
          // Arama harfiyle başlayanlar en başta, içerenler arkada
          const startsWithName = [];
          const startsWithHandle = [];
          const containsOther = [];

          allUsers.forEach(u => {
            const nameLower = (u.name || '').toLowerCase();
            const handleLower = (u.handle || '').toLowerCase().replace('@', '');
            if (nameLower.startsWith(query)) {
              startsWithName.push(u);
            } else if (handleLower.startsWith(query)) {
              startsWithHandle.push(u);
            } else if (nameLower.includes(query) || handleLower.includes(query)) {
              containsOther.push(u);
            }
          });

          candidates = [...startsWithName, ...startsWithHandle, ...containsOther].slice(0, 10);
        }

        if (candidates.length === 0) {
          popupEl.style.display = 'none';
          return;
        }

        const isDmInput = (inputEl.id === 'dm-input-text');
        selectedIndex = 0;
        popupEl.innerHTML = `
          <div class="mention-popup-header">
            <span>${isDmInput ? 'DM Bahsetme (@etiketle)' : 'Üyeler (@etiketle)'}</span>
            <span style="font-size:0.65rem;opacity:0.7;">↑↓ gezin, Enter seç</span>
          </div>
          <div class="mention-popup-list">
            ${candidates.map((u, idx) => `
              <div class="mention-popup-item ${idx === 0 ? 'selected' : ''}" data-index="${idx}">
                <div class="mention-popup-avatar-wrap">
                  <img src="${u.avatar || window.DEFAULT_AVATAR}" class="mention-popup-avatar" alt="" onerror="this.src=window.DEFAULT_AVATAR">
                </div>
                <div class="mention-popup-info">
                  <div style="display:flex; align-items:center; gap:6px;">
                    <span class="mention-popup-name">${escapeHtml(u.name)}</span>
                    ${u.desc ? `<span style="font-size:0.65rem; color:var(--text-muted); font-family:var(--font-nunito);">(${escapeHtml(u.desc)})</span>` : ''}
                  </div>
                  <span class="mention-popup-handle">${escapeHtml(u.handle)}</span>
                </div>
              </div>
            `).join('')}
          </div>
        `;

        popupEl.style.display = 'flex';

        popupEl.querySelectorAll('.mention-popup-item').forEach(item => {
          item.addEventListener('mousedown', (e) => {
            e.preventDefault();
            const idx = parseInt(item.dataset.index, 10);
            if (!isNaN(idx) && candidates[idx]) {
              applyMention(candidates[idx]);
            }
          });
        });
      }

      inputEl.addEventListener('input', checkMentionTrigger);
      inputEl.addEventListener('click', checkMentionTrigger);
      inputEl.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter' || e.key === 'Tab' || e.key === 'Escape') {
          return;
        }
        checkMentionTrigger();
      });

      inputEl.addEventListener('keydown', (e) => {
        if (popupEl.style.display === 'none') return;

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (candidates.length > 0) {
            selectedIndex = (selectedIndex + 1) % candidates.length;
            highlightSelected();
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (candidates.length > 0) {
            selectedIndex = (selectedIndex - 1 + candidates.length) % candidates.length;
            highlightSelected();
          }
        } else if (e.key === 'Enter' || e.key === 'Tab') {
          if (candidates.length > 0 && candidates[selectedIndex]) {
            e.preventDefault();
            applyMention(candidates[selectedIndex]);
          }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          popupEl.style.display = 'none';
        }
      });

      document.addEventListener('pointerdown', (e) => {
        if (!e.target.closest('.composer-text-wrapper') && !e.target.closest('.dm-input-text-wrapper') && !e.target.closest('.mention-autocomplete-popup')) {
          popupEl.style.display = 'none';
        }
      });
    }

    const composerText = document.getElementById('composer-text');
    const composerPopup = document.getElementById('mention-autocomplete-popup');
    setupMentionInput(composerText, composerPopup);

    const dmText = document.getElementById('dm-input-text');
    const dmPopup = document.getElementById('dm-mention-autocomplete-popup');
    setupMentionInput(dmText, dmPopup);
  }

  // ── 2. RIGHT SIDEBAR MESAJ ARAMA SİSTEMİ ─────────────────────
  function initSidebarMessageSearch() {
    const searchInput = document.getElementById('sidebar-msg-search-input');
    const btnClear = document.getElementById('btn-sidebar-msg-search-clear');
    const resultsContainer = document.getElementById('sidebar-msg-search-results');
    const emptyState = document.getElementById('sidebar-msg-search-empty');
    const resultsList = document.getElementById('sidebar-msg-search-list');
    const resultsCount = document.getElementById('sidebar-msg-search-count');

    if (!searchInput || !resultsContainer) return;
    if (searchInput.dataset.boundSearch) return;
    searchInput.dataset.boundSearch = 'true';

    function getUserlistContainer() {
      return document.getElementById('sidebar-userlist-content') || document.getElementById('members-widget-card');
    }

    function openSearchPanel() {
      const userlist = getUserlistContainer();
      if (userlist) userlist.style.display = 'none';
      resultsContainer.style.display = 'flex';
      if (window.lucide) window.lucide.createIcons();
    }

    function closeSearchPanel() {
      resultsContainer.style.display = 'none';
      const userlist = getUserlistContainer();
      if (userlist) userlist.style.display = '';
      searchInput.value = '';
      resultsList.innerHTML = '';
      if (resultsCount) resultsCount.textContent = '';
      if (emptyState) emptyState.style.display = 'flex';
      if (btnClear) btnClear.style.display = 'none';
    }

    function jumpToMessage(post) {
      if (!post || !post.id) return;

      function locateAndHighlight() {
        const targetEl = document.querySelector(`.channel-chat-item[data-id="${post.id}"], .post-card[data-id="${post.id}"], .dm-msg-row[data-id="${post.id}"]`);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetEl.classList.remove('message-scroll-highlight');
          void targetEl.offsetWidth; // reflow
          targetEl.classList.add('message-scroll-highlight');
          setTimeout(() => {
            targetEl.classList.remove('message-scroll-highlight');
          }, 2500);
          return true;
        }
        return false;
      }

      // 1. Önce mevcut ekranda dene
      if (locateAndHighlight()) return;

      // 2. Farklı sunucu/kanal veya DM ise geçiş yap
      const ds = window.dataStore;
      if (post.isDm && post.handle) {
        if (typeof window.openDMWithHandle === 'function') {
          window.openDMWithHandle(post.handle);
        }
      } else {
        if (post.serverId && post.serverId !== ds.activeServerId) {
          if (typeof switchToServer === 'function') {
            switchToServer(post.serverId);
          }
        }
        if (post.channelId && post.channelId !== ds.activeChannelId) {
          if (typeof renderServerChannels === 'function') {
            const srv = (ds.servers || []).find(s => s.id === (post.serverId || ds.activeServerId));
            if (srv) renderServerChannels(srv, post.channelId);
          }
        }
      }

      // Render sonrasını bekle ve scroll et
      setTimeout(() => {
        if (!locateAndHighlight()) {
          setTimeout(locateAndHighlight, 300);
        }
      }, 150);
    }

    function highlightSnippet(text, query) {
      if (!text) return '';
      const escapedText = escapeHtml(text);
      if (!query) return escapedText;

      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedQuery})`, 'gi');
      return escapedText.replace(regex, '<mark>$1</mark>');
    }

    function performSearch() {
      const query = searchInput.value.trim().toLowerCase();
      if (btnClear) btnClear.style.display = query ? 'block' : 'none';

      // "o inputa bişey yazmadan hiç sonuç çıkmasın"
      if (!query) {
        resultsList.innerHTML = '';
        if (emptyState) emptyState.style.display = 'flex';
        if (resultsCount) resultsCount.textContent = '';
        return;
      }

      if (emptyState) emptyState.style.display = 'none';

      // Tüm aranabilir mesajlar havuzu
      const ds = window.dataStore;
      let pool = [];

      if (ds && Array.isArray(ds.posts)) {
        pool = [...ds.posts];
      }

      // DM mesajlarını da ekle
      if (ds && ds.dmThreads) {
        ds.dmThreads.forEach(t => {
          const msgs = ds.getThreadMessages ? ds.getThreadMessages(t.user?.handle) : (t.messages || []);
          msgs.forEach(m => {
            pool.push({
              id: m.id || `dm-${m.timestamp}`,
              content: m.text || m.content || '',
              author: m.author || (m.isMine ? ds.currentUser?.name : t.user?.name),
              handle: m.handle || (m.isMine ? ds.currentUser?.handle : t.user?.handle),
              avatar: m.avatar || (m.isMine ? ds.currentUser?.avatar : t.user?.avatar),
              timestamp: m.timestamp || m.time,
              channelName: `DM: ${t.user?.name || t.user?.handle || 'Kullanıcı'}`,
              isDm: true
            });
          });
        });
      }

      const matches = pool.filter(p => {
        const contentMatch = p.content && p.content.toLowerCase().includes(query);
        const authorMatch = p.author && p.author.toLowerCase().includes(query);
        return contentMatch || authorMatch;
      });

      if (resultsCount) {
        resultsCount.textContent = `${matches.length} sonuç`;
      }

      if (matches.length === 0) {
        resultsList.innerHTML = `
          <div style="padding: 24px 12px; text-align: center; color: var(--text-muted); font-size: 0.8rem;">
            "${escapeHtml(searchInput.value)}" ile eşleşen mesaj bulunamadı.
          </div>
        `;
        return;
      }

      // En yeni mesajlar en başta
      matches.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

      const displayMatches = matches.slice(0, 35);
      resultsList.innerHTML = displayMatches.map(post => {
        const authorProf = ds ? ds.getUserProfile(post.handle) : {};
        const authorName = authorProf.name || post.author || post.handle || 'Kullanıcı';
        const authorAvatar = authorProf.avatar || post.avatar || window.DEFAULT_AVATAR;
        const channelTag = post.channelName ? post.channelName : (post.channelId ? `#${post.channelId}` : '#genel');

        return `
          <div class="sidebar-msg-result-card" data-post-id="${post.id}">
            <div class="sidebar-msg-result-header">
              <img src="${authorAvatar}" class="sidebar-msg-result-avatar" onerror="this.src=window.DEFAULT_AVATAR">
              <span class="sidebar-msg-result-author">${escapeHtml(authorName)}</span>
              <span class="sidebar-msg-result-time">${formatDateTime(post.timestamp)}</span>
            </div>
            <div class="sidebar-msg-result-snippet">${highlightSnippet(post.content, query)}</div>
            <div class="sidebar-msg-result-footer">
              <span class="sidebar-msg-result-channel">${escapeHtml(channelTag)}</span>
              <span class="sidebar-msg-result-jump">Git →</span>
            </div>
          </div>
        `;
      }).join('');

      resultsList.querySelectorAll('.sidebar-msg-result-card').forEach(card => {
        card.addEventListener('click', () => {
          const postId = card.dataset.postId;
          const matchedPost = matches.find(p => String(p.id) === String(postId));
          if (matchedPost) {
            jumpToMessage(matchedPost);
          }
        });
      });
    }

    searchInput.addEventListener('focus', openSearchPanel);
    searchInput.addEventListener('click', openSearchPanel);
    searchInput.addEventListener('input', performSearch);
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeSearchPanel();
        searchInput.blur();
      }
    });

    if (btnClear) {
      btnClear.addEventListener('click', (e) => {
        e.stopPropagation();
        closeSearchPanel();
      });
    }

    // "inputu kapatınca yani herhangi başka bir alana basınca userlist geri gelsin"
    document.addEventListener('pointerdown', (e) => {
      if (!e.target.closest('#sidebar-msg-search-card')) {
        if (resultsContainer.style.display !== 'none') {
          closeSearchPanel();
        }
      }
    });

    window.closeSidebarSearch = closeSearchPanel;
  }

  window.initSidebarMessageSearch = initSidebarMessageSearch;
  initMentionAutocomplete();
  initSidebarMessageSearch();
});

// ── GLOBAL HELPERS ────────────────────────────────────────────
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function formatDateTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp === 'Şimdi' || timestamp === 'Simdi' ? Date.now() : timestamp);
  if (isNaN(date.getTime())) return '';
  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} • ${date.getDate().toString().padStart(2, '0')} ${months[date.getMonth()]}`;
}

function showUserProfilePopover(e, handle) {
  if (window.__realShowUserProfilePopover) {
    return window.__realShowUserProfilePopover(e, handle);
  }
  if (e && e.stopPropagation) e.stopPropagation();
  if (!handle) return;
  window.location.href = `profile-view.html?handle=${encodeURIComponent(handle)}`;
}
window.showUserProfilePopover = showUserProfilePopover;
