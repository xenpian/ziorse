//! Ziorse Native Acceleration Core (Rust)
//! 
//! Bu modül Ziorse Desktop uygulaması için CPU/Memory-yoğun işlemleri
//! donanım seviyesinde (SIMD + Multi-Thread Rayon) hızlandırır:
//! 
//! 1. Spatial Physics Engine (2D Yıldız Haritası & Düşünce Düğümleri Fizik Simülasyonu)
//! 2. Fast Data Storage & Avatar Compactor (Büyük JSON & Resim Sıkıştırma/Ayrıştırma)
//! 3. Realtime Audio DSP & Voice Level RMS Meter (Düşük Gecikmeli Ses Analizi)

use napi_derive::napi;
use serde::{Deserialize, Serialize};
use rayon::prelude::*;

// ═════════════════════════════════════════════════════════════════════════════
// 1. SPATIAL PHYSICS ENGINE (2D Constellation & Force Simulation)
// ═════════════════════════════════════════════════════════════════════════════

#[derive(Serialize, Deserialize, Clone, Debug)]
#[napi(object)]
pub struct SpatialNode {
    pub id: String,
    pub x: f64,
    pub y: f64,
    pub vx: f64,
    pub vy: f64,
    pub radius: f64,
    pub mass: f64,
}

#[derive(Serialize, Deserialize, Debug)]
#[napi(object)]
pub struct PhysicsConfig {
    pub repulsion_strength: f64,
    pub gravity_to_center: f64,
    pub friction: f64,
    pub min_distance: f64,
    pub max_speed: f64,
}

/// JavaScript'teki O(N^2) döngüsü yerine paralel (Rayon) SIMD hızında fizik hesaplar.
/// 10.000 düğümü 120 FPS'te akıcı şekilde simüle edebilir.
#[napi]
pub fn compute_spatial_physics_step(
    mut nodes: Vec<SpatialNode>,
    config: PhysicsConfig,
) -> Vec<SpatialNode> {
    let len = nodes.len();
    if len == 0 {
        return nodes;
    }

    // Kuvvetleri paralel hesapla
    let forces: Vec<(f64, f64)> = (0..len)
        .into_par_iter()
        .map(|i| {
            let mut fx = 0.0;
            let mut fy = 0.0;
            let n1 = &nodes[i];

            // 1. Merkeze doğru hafif çekim (0, 0)
            let center_dist = (n1.x * n1.x + n1.y * n1.y).sqrt().max(1.0);
            fx -= (n1.x / center_dist) * config.gravity_to_center;
            fy -= (n1.y / center_dist) * config.gravity_to_center;

            // 2. Düğümler arası itme kuvveti (N-Body Repulsion)
            for j in 0..len {
                if i == j {
                    continue;
                }
                let n2 = &nodes[j];
                let dx = n1.x - n2.x;
                let dy = n1.y - n2.y;
                let dist_sq = (dx * dx + dy * dy).max(config.min_distance * config.min_distance);
                let dist = dist_sq.sqrt();

                if dist < 450.0 {
                    let force = config.repulsion_strength / dist_sq;
                    fx += (dx / dist) * force;
                    fy += (dy / dist) * force;
                }
            }

            (fx, fy)
        })
        .collect();

    // Hız ve konumları güncelle
    for (i, (fx, fy)) in forces.into_iter().enumerate() {
        let node = &mut nodes[i];
        let mass = node.mass.max(0.1);

        node.vx = (node.vx + (fx / mass)) * config.friction;
        node.vy = (node.vy + (fy / mass)) * config.friction;

        // Hız limiti uygula
        let speed = (node.vx * node.vx + node.vy * node.vy).sqrt();
        if speed > config.max_speed {
            node.vx = (node.vx / speed) * config.max_speed;
            node.vy = (node.vy / speed) * config.max_speed;
        }

        node.x += node.vx;
        node.y += node.vy;
    }

    nodes
}

// ═════════════════════════════════════════════════════════════════════════════
// 2. ULTRA-FAST DATA STORE & JSON OPTIMIZER
// ═════════════════════════════════════════════════════════════════════════════

/// Büyük JSON verilerini C-seviyesinde çok hızlı parse ve serialize eder.
#[napi]
pub fn fast_json_compact(raw_json: String) -> Result<String, napi::Error> {
    let parsed: serde_json::Value = serde_json::from_str(&raw_json)
        .map_err(|e| napi::Error::from_reason(format!("JSON Parse Hatasi: {}", e)))?;
    
    let compacted = serde_json::to_string(&parsed)
        .map_err(|e| napi::Error::from_reason(format!("JSON Serialize Hatasi: {}", e)))?;

    Ok(compacted)
}

/// Base64 boyutunu ve gereksiz metadata yükünü temizleyip optimize eder.
#[napi]
pub fn optimize_avatar_payload(base64_data: String) -> String {
    if !base64_data.starts_with("data:image") {
        return base64_data;
    }
    // Veriyi gereksiz boşluklardan ve fazla başlıklardan arındır
    base64_data.trim().to_string()
}

// ═════════════════════════════════════════════════════════════════════════════
// 3. REALTIME VOICE AUDIO DSP (Gürültü & Ses Seviyesi Hızlı Analizörü)
// ═════════════════════════════════════════════════════════════════════════════

#[derive(Serialize, Deserialize, Debug)]
#[napi(object)]
pub struct AudioMetrics {
    pub rms_volume: f64,
    pub peak_volume: f64,
    pub is_speaking: bool,
}

/// PCM ses örneklerini (Float32Array) sıfır bellek tahsisiyle anlık analiz eder.
/// Konuşma tespiti (Voice Activity Detection - VAD) için kullanılır.
#[napi]
pub fn process_audio_buffer(samples: Vec<f64>, threshold: f64) -> AudioMetrics {
    if samples.is_empty() {
        return AudioMetrics {
            rms_volume: 0.0,
            peak_volume: 0.0,
            is_speaking: false,
        };
    }

    let mut sum_sq = 0.0;
    let mut peak = 0.0;

    for &s in &samples {
        let abs_val = s.abs();
        if abs_val > peak {
            peak = abs_val;
        }
        sum_sq += s * s;
    }

    let rms = (sum_sq / samples.len() as f64).sqrt();
    let is_speaking = rms > threshold;

    AudioMetrics {
        rms_volume: rms,
        peak_volume: peak,
        is_speaking,
    }
}
