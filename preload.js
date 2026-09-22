const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  onMaximizedChange: (callback) => ipcRenderer.on('window-maximized-state', (event, isMax) => callback(isMax)),

  // Quick thought creation from Orb
  sendQuickThought: (thoughtData) => ipcRenderer.send('quick-thought-created', thoughtData),
  onNodeAddExternal: (callback) => ipcRenderer.on('node-add-external', (event, value) => callback(value)),

  // Sync stats to Orb
  syncOrbStats: (stats) => ipcRenderer.send('sync-constellation-stats', stats),
  onUpdateOrbStats: (callback) => ipcRenderer.on('update-orb-stats', (event, value) => callback(value)),

  // Toggle Orb
  toggleOrb: (visible) => ipcRenderer.send('toggle-orb-visibility', visible),

  // Native OS Notifications
  sendNotification: (data) => ipcRenderer.send('show-notification', data),
  onNotificationClick: (callback) => ipcRenderer.on('notification-clicked', (event, data) => callback(data)),

  // Permanent Storage Bridge (Synchronous & Asynchronous)
  storeGetSync: (key) => ipcRenderer.sendSync('store-get-sync', key),
  storeSetSync: (key, val) => ipcRenderer.sendSync('store-set-sync', key, val),
  storeGetAllSync: () => ipcRenderer.sendSync('store-get-all-sync'),
  storeGet: (key) => ipcRenderer.invoke('store-get', key),
  storeSet: (key, val) => ipcRenderer.invoke('store-set', key, val),
  storeGetAll: () => ipcRenderer.invoke('store-get-all'),

  // Native C++/Rust Hardware Acceleration Bridge
  nativeComputePhysics: (nodes, config) => ipcRenderer.invoke('native-compute-physics', nodes, config),
  nativeFastJson: (jsonStr) => ipcRenderer.invoke('native-fast-json', jsonStr),
  nativeProcessAudio: (samples, threshold) => ipcRenderer.invoke('native-process-audio', samples, threshold),

  // Ses dosyaları için mutlak yol (Türkçe karakter encode desteğiyle)
  getSoundsPath: () => {
    const { pathToFileURL } = require('url');
    return pathToFileURL(path.join(__dirname, 'sounds')).href;
  },

  // Avatar Frames Folder Bridge
  getAvatarFrames: () => ipcRenderer.invoke('get-avatar-frames'),
  openAvatarFramesFolder: () => ipcRenderer.invoke('open-avatar-frames-folder'),
});
