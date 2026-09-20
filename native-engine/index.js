/**
 * Ziorse Native Engine Bridge
 * 
 * Rust ile derlenmiş .node ikili dosyasını bağlar.
 * Eğer henüz derlenmemişse JS tabanlı optimize fallback'e geçer.
 */

let nativeModule = null;

try {
  // N-API derlenmiş native modülü yüklemeyi dene
  nativeModule = require('./index.node');
  console.log('⚡ [Ziorse Native Engine] Rust Donanım Hızlandırma Modülü Aktif!');
} catch (e) {
  // console.log('ℹ️ [Ziorse Native Engine] Rust derlemesi bulunamadı, JS fallback kullanılıyor.');
}

module.exports = {
  isNative: !!nativeModule,

  // 1. Spatial Physics (2D Uzamsal Simülasyon)
  computePhysics: (nodes, config) => {
    if (nativeModule?.compute_spatial_physics_step) {
      return nativeModule.compute_spatial_physics_step(nodes, config);
    }
    // JS Fallback
    return nodes;
  },

  // 2. Fast JSON Compact & Store
  fastJsonCompact: (jsonStr) => {
    if (nativeModule?.fast_json_compact) {
      return nativeModule.fast_json_compact(jsonStr);
    }
    try {
      return JSON.stringify(JSON.parse(jsonStr));
    } catch {
      return jsonStr;
    }
  },

  // 3. Audio Voice Activity Detection & RMS
  processAudio: (samples, threshold = 0.02) => {
    if (nativeModule?.process_audio_buffer) {
      return nativeModule.process_audio_buffer(samples, threshold);
    }
    // JS Fallback
    let sum = 0, peak = 0;
    for (let i = 0; i < samples.length; i++) {
      const v = Math.abs(samples[i]);
      if (v > peak) peak = v;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / (samples.length || 1));
    return { rms_volume: rms, peak_volume: peak, is_speaking: rms > threshold };
  }
};
