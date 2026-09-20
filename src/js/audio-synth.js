/**
 * Subtle Audio Engine for Ziorse
 * Web Audio API — synth tabanlı, harici dosya yok.
 *
 * Electron'da autoplay-policy=no-user-gesture-required ile çalışır.
 * AudioContext constructor'da direkt açılır, unlock beklenmez.
 */

class AudioSynthEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this._init();
  }

  _init() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        if (this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => { });
        }
      }
    } catch (e) {
      console.warn('[AudioSynth] init failed:', e);
    }

    // Ses dosyalarını önceden belleğe yükle (Anında / 0ms gecikmesiz çalma)
    this.soundCache = {};
    ['katil.mp3', 'ayril.mp3'].forEach(file => {
      try {
        const audio = new Audio('sounds/' + file);
        audio.preload = 'auto';
        audio.volume = 0.8;
        audio.load();
        this.soundCache[file] = audio;
      } catch (e) { }
    });
  }

  // Geriye dönük uyumluluk — artık gerek yok ama çağrılırsa zarar vermez
  unlock() {
    if (!this.ctx) {
      this._init();
      return;
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => { });
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  // ctx hazır mı kontrol et (suspended olabilir, yenile)
  _ready() {
    if (!this.ctx) this._init();
    if (!this.ctx) return false;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => { });
    }
    return !this.isMuted;
  }

  // ─── Mevcut sesler ────────────────────────────────────────

  playNodeHover() {
    if (!this._ready()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1000, now + 0.04);
    gain.gain.setValueAtTime(0.015, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  playNodeSelect() {
    if (!this._ready()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);
    gain.gain.setValueAtTime(0.03, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  playResonanceChime() {
    if (!this._ready()) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);
      gain.gain.setValueAtTime(0.03, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.2);
    });
  }

  playThoughtCreation() {
    if (!this._ready()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.12);
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  // ─── Yeni sesler ──────────────────────────────────────────

  // Ses dosyası çalma (Önbellekten anında 0ms çalma)
  _playSoundFile(filename, startTime = 0) {
    if (this.isMuted) return;
    try {
      let cached = this.soundCache && this.soundCache[filename];
      if (cached) {
        cached.currentTime = startTime;
        cached.play().catch(() => {
          // Yedek oluşturup çal
          const fallback = new Audio('sounds/' + filename);
          fallback.volume = 0.8;
          fallback.currentTime = startTime;
          fallback.play().catch(() => { });
        });
      } else {
        const audio = new Audio('sounds/' + filename);
        audio.volume = 0.8;
        audio.currentTime = startTime;
        audio.play().catch(() => { });
      }
    } catch (e) {
      console.warn('[AudioSynth] playSoundFile error:', e);
    }
  }

  // Ses kanalına katılma — katil.mp3 (0.4 saniye ileriden başlar)
  playVoiceJoin() {
    this._playSoundFile('katil.mp3', 0.4);
  }

  // Ses kanalından ayrılma — ayril.mp3
  playVoiceLeave() {
    this._playSoundFile('ayril.mp3', 0);
  }

  // Bildirim (beğeni / yorum) — nazik iki notlu çan
  playNotification() {
    if (!this._ready()) return;
    const now = this.ctx.currentTime;
    [880, 1108.73].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      gain.gain.setValueAtTime(0.03, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.1 + 0.28);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.3);
    });
  }
}

window.audioSynth = new AudioSynthEngine();

// Geriye dönük uyumluluk — eski unlock listener'ları zarar vermez
(function () {
  const unlock = () => {
    if (window.audioSynth) window.audioSynth.unlock();
    document.removeEventListener('mousedown', unlock, true);
    document.removeEventListener('keydown', unlock, true);
    document.removeEventListener('touchstart', unlock, true);
  };
  document.addEventListener('mousedown', unlock, true);
  document.addEventListener('keydown', unlock, true);
  document.addEventListener('touchstart', unlock, true);
})();
