/**
 * Ziorse Universal Image Cropper & Adjuster
 * Interactive zoom, pan, rotate, and aspect crop for Avatars, Banners, Server Icons, and Posts.
 */

(function () {
  let modalEl = null;
  let activeResolve = null;
  let activeReject = null;

  let currentImage = null;
  let currentFile = null;
  let currentOptions = {};

  // State
  let naturalW = 1;
  let naturalH = 1;
  let baseScale = 1;
  let zoom = 1;
  let minZoom = 0.5;
  let maxZoom = 4;
  let panX = 0;
  let panY = 0;
  let rotation = 0;

  let isDragging = false;
  let startPointerX = 0;
  let startPointerY = 0;
  let startPanX = 0;
  let startPanY = 0;

  function ensureModal() {
    if (modalEl) return modalEl;

    modalEl = document.createElement('div');
    modalEl.id = 'ziorse-cropper-modal';
    modalEl.className = 'cropper-modal-overlay';
    modalEl.style.display = 'none';

    modalEl.innerHTML = `
      <div class="cropper-modal-box">
        <div class="cropper-header">
          <div class="cropper-title-wrap">
            <svg class="cropper-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6.13 1L6 16a2 2 0 0 0 2 2h15"></path>
              <path d="M1 6.13L16 6a2 2 0 0 1 2 2v15"></path>
            </svg>
            <span id="cropper-modal-title" class="cropper-title">Görseli Ayarla ve Kırp</span>
          </div>
          <button type="button" id="cropper-btn-close" class="cropper-close-btn" title="Kapat">✕</button>
        </div>

        <div class="cropper-body">
          <div id="cropper-viewport-wrap" class="cropper-viewport-wrap">
            <div id="cropper-viewport" class="cropper-viewport">
              <img id="cropper-image" class="cropper-img" src="" alt="Crop preview" draggable="false">
              <div id="cropper-mask" class="cropper-mask mask-square"></div>
            </div>
          </div>

          <div class="cropper-controls">
            <div class="cropper-zoom-row">
              <button type="button" id="cropper-btn-zoom-out" class="cropper-tool-btn" title="Küçült">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
              </button>
              <input type="range" id="cropper-zoom-slider" class="cropper-slider" min="0.5" max="3" step="0.01" value="1">
              <button type="button" id="cropper-btn-zoom-in" class="cropper-tool-btn" title="Büyüt">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
              </button>
            </div>

            <div class="cropper-actions-row">
              <button type="button" id="cropper-btn-rotate" class="cropper-secondary-btn" title="90° Döndür">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                <span>Döndür</span>
              </button>
              <button type="button" id="cropper-btn-reset" class="cropper-secondary-btn" title="Konumu Sıfırla">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                <span>Sıfırla</span>
              </button>
            </div>
          </div>
        </div>

        <div class="cropper-footer">
          <button type="button" id="cropper-btn-cancel" class="cropper-footer-btn cropper-btn-cancel">Vazgeç</button>
          <button type="button" id="cropper-btn-apply" class="cropper-footer-btn cropper-btn-apply">Uygula ve Kaydet</button>
        </div>
      </div>
    `;

    document.body.appendChild(modalEl);
    bindModalEvents();
    return modalEl;
  }

  function bindModalEvents() {
    const btnClose = modalEl.querySelector('#cropper-btn-close');
    const btnCancel = modalEl.querySelector('#cropper-btn-cancel');
    const btnApply = modalEl.querySelector('#cropper-btn-apply');
    const btnZoomOut = modalEl.querySelector('#cropper-btn-zoom-out');
    const btnZoomIn = modalEl.querySelector('#cropper-btn-zoom-in');
    const zoomSlider = modalEl.querySelector('#cropper-zoom-slider');
    const btnRotate = modalEl.querySelector('#cropper-btn-rotate');
    const btnReset = modalEl.querySelector('#cropper-btn-reset');
    const viewport = modalEl.querySelector('#cropper-viewport');

    btnClose.addEventListener('click', closeModal);
    btnCancel.addEventListener('click', closeModal);

    modalEl.addEventListener('click', (e) => {
      if (e.target === modalEl) closeModal();
    });

    // Zoom controls
    zoomSlider.addEventListener('input', (e) => {
      zoom = Math.max(minZoom, parseFloat(e.target.value));
      clampPan();
      updateTransform();
    });

    btnZoomOut.addEventListener('click', () => {
      zoom = Math.max(minZoom, zoom - 0.15);
      zoomSlider.value = zoom;
      clampPan();
      updateTransform();
    });

    btnZoomIn.addEventListener('click', () => {
      zoom = Math.min(maxZoom, zoom + 0.15);
      zoomSlider.value = zoom;
      clampPan();
      updateTransform();
    });

    // Rotate
    btnRotate.addEventListener('click', () => {
      rotation = (rotation + 90) % 360;
      clampPan();
      updateTransform();
    });

    // Reset
    btnReset.addEventListener('click', () => {
      zoom = 1.0;
      panX = 0;
      panY = 0;
      rotation = 0;
      zoomSlider.value = 1.0;
      clampPan();
      updateTransform();
    });

    // Mouse Wheel Zoom
    viewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.08 : -0.08;
      zoom = Math.min(maxZoom, Math.max(minZoom, zoom + delta));
      zoomSlider.value = zoom;
      clampPan();
      updateTransform();
    }, { passive: false });

    // Pointer Drag & Pan (Constrained strictly to image bounds)
    viewport.addEventListener('pointerdown', (e) => {
      isDragging = true;
      startPointerX = e.clientX;
      startPointerY = e.clientY;
      startPanX = panX;
      startPanY = panY;
      viewport.setPointerCapture(e.pointerId);
      viewport.classList.add('grabbing');
    });

    viewport.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startPointerX;
      const dy = e.clientY - startPointerY;
      panX = startPanX + dx;
      panY = startPanY + dy;
      clampPan();
      updateTransform();
    });

    const stopDrag = (e) => {
      if (isDragging) {
        isDragging = false;
        try { viewport.releasePointerCapture(e.pointerId); } catch (_) {}
        viewport.classList.remove('grabbing');
      }
    };
    viewport.addEventListener('pointerup', stopDrag);
    viewport.addEventListener('pointercancel', stopDrag);

    // Apply & Crop
    btnApply.addEventListener('click', () => {
      const croppedDataUrl = generateCroppedResult();
      if (activeResolve) {
        activeResolve(croppedDataUrl);
      }
      if (typeof currentOptions.onCrop === 'function') {
        currentOptions.onCrop(croppedDataUrl);
      }
      closeModal(true);
    });

    // Esc key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalEl && modalEl.style.display !== 'none') {
        closeModal();
      }
    });
  }

  function getEffectiveDimensions() {
    const isRotated90 = (rotation % 180 !== 0);
    const effNaturalW = isRotated90 ? naturalH : naturalW;
    const effNaturalH = isRotated90 ? naturalW : naturalH;

    const mask = modalEl ? modalEl.querySelector('#cropper-mask') : null;
    const maskW = mask && mask.offsetWidth ? mask.offsetWidth : (currentOptions.shape === 'banner' ? 350 : 240);
    const maskH = mask && mask.offsetHeight ? mask.offsetHeight : (currentOptions.shape === 'banner' ? 130 : 240);

    const effBaseScale = Math.max(maskW / effNaturalW, maskH / effNaturalH);
    const displayW = naturalW * effBaseScale * zoom;
    const displayH = naturalH * effBaseScale * zoom;

    const effW = effNaturalW * effBaseScale * zoom;
    const effH = effNaturalH * effBaseScale * zoom;

    const maxPanX = Math.max(0, (effW - maskW) / 2);
    const maxPanY = Math.max(0, (effH - maskH) / 2);

    return {
      isRotated90,
      effNaturalW,
      effNaturalH,
      maskW,
      maskH,
      effBaseScale,
      displayW,
      displayH,
      effW,
      effH,
      maxPanX,
      maxPanY
    };
  }

  function clampPan() {
    const { maxPanX, maxPanY } = getEffectiveDimensions();
    panX = Math.max(-maxPanX, Math.min(maxPanX, panX));
    panY = Math.max(-maxPanY, Math.min(maxPanY, panY));
  }

  function updateTransform() {
    const img = modalEl.querySelector('#cropper-image');
    if (!img) return;

    clampPan();
    const { displayW, displayH } = getEffectiveDimensions();

    img.style.width = displayW + 'px';
    img.style.height = displayH + 'px';
    img.style.transform = `translate(calc(-50% + ${panX}px), calc(-50% + ${panY}px)) rotate(${rotation}deg)`;
  }

  function generateCroppedResult() {
    clampPan();
    const { effBaseScale, maskW, maskH } = getEffectiveDimensions();

    let targetW = 512;
    let targetH = 512;

    if (currentOptions.shape === 'banner') {
      targetW = 1200;
      targetH = Math.round(1200 * (maskH / maskW));
    } else if (currentOptions.aspectRatio && currentOptions.aspectRatio !== 1) {
      targetW = 800;
      targetH = Math.round(800 / currentOptions.aspectRatio);
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const multiplier = targetW / maskW;

    ctx.save();
    // Move to center of canvas + pan
    ctx.translate((targetW / 2) + (panX * multiplier), (targetH / 2) + (panY * multiplier));
    ctx.rotate((rotation * Math.PI) / 180);

    const drawW = naturalW * effBaseScale * zoom * multiplier;
    const drawH = naturalH * effBaseScale * zoom * multiplier;

    ctx.drawImage(
      currentImage,
      -drawW / 2,
      -drawH / 2,
      drawW,
      drawH
    );
    ctx.restore();

    return canvas.toDataURL('image/png', 0.94);
  }

  function closeModal(wasApplied = false) {
    if (!modalEl) return;
    modalEl.style.display = 'none';
    if (!wasApplied) {
      if (activeReject) activeReject(new Error('Cropper cancelled'));
      if (typeof currentOptions.onCancel === 'function') currentOptions.onCancel();
    }
    activeResolve = null;
    activeReject = null;
  }

  /**
   * Main open function
   * @param {Object} opts
   * @param {File|Blob|string} opts.file - File object or image src dataURL
   * @param {string} [opts.shape='circle'] - 'circle' | 'banner' | 'rect'
   * @param {number} [opts.aspectRatio] - aspect ratio (e.g. 2.8 for banner)
   * @param {string} [opts.title='Görseli Ayarla ve Kırp'] - Title
   * @param {Function} [opts.onCrop] - Callback with cropped dataURL
   * @param {Function} [opts.onCancel] - Callback on cancel
   * @returns {Promise<string>}
   */
  function openImageCropper(opts) {
    return new Promise((resolve, reject) => {
      activeResolve = resolve;
      activeReject = reject;
      currentOptions = opts || {};

      ensureModal();

      const titleEl = modalEl.querySelector('#cropper-modal-title');
      const maskEl = modalEl.querySelector('#cropper-mask');
      const imgEl = modalEl.querySelector('#cropper-image');
      const zoomSlider = modalEl.querySelector('#cropper-zoom-slider');

      // Title
      titleEl.textContent = opts.title || (opts.shape === 'banner' ? 'Başlığı (Banner) Ayarla' : 'Görseli Ayarla ve Kırp');

      // Shape classes
      maskEl.className = 'cropper-mask';
      if (opts.shape === 'banner') {
        maskEl.classList.add('mask-banner');
      } else if (opts.shape === 'rect') {
        maskEl.classList.add('mask-rect');
      } else {
        maskEl.classList.add('mask-square');
        maskEl.classList.add('mask-circle');
      }

      // Reset state
      minZoom = 1.0;
      maxZoom = 4.0;
      zoom = 1.0;
      panX = 0;
      panY = 0;
      rotation = 0;
      zoomSlider.min = 1.0;
      zoomSlider.max = maxZoom;
      zoomSlider.step = 0.01;
      zoomSlider.value = 1.0;

      function onImageLoaded(imgSrc) {
        currentImage = new Image();
        currentImage.onload = () => {
          naturalW = currentImage.naturalWidth || 1;
          naturalH = currentImage.naturalHeight || 1;

          imgEl.src = imgSrc;

          minZoom = 1.0;
          maxZoom = 4.0;
          zoomSlider.min = 1.0;
          zoomSlider.max = maxZoom;
          zoomSlider.step = 0.01;
          zoomSlider.value = 1.0;
          zoom = 1.0;
          panX = 0;
          panY = 0;
          rotation = 0;

          modalEl.style.display = 'flex';
          updateTransform();
        };
        currentImage.src = imgSrc;
      }

      if (opts.file instanceof File || opts.file instanceof Blob) {
        const reader = new FileReader();
        reader.onload = (e) => onImageLoaded(e.target.result);
        reader.readAsDataURL(opts.file);
      } else if (typeof opts.file === 'string' && opts.file.length > 0) {
        onImageLoaded(opts.file);
      } else if (typeof opts.imageSrc === 'string' && opts.imageSrc.length > 0) {
        onImageLoaded(opts.imageSrc);
      } else {
        reject(new Error('No image provided'));
        closeModal();
      }
    });
  }

  // Expose globally
  window.openImageCropper = openImageCropper;
})();
