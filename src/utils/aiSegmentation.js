/**
 * AI Background Removal menggunakan @imgly/background-removal
 * ─ 100% gratis, tidak perlu API key
 * ─ AI model ONNX berjalan langsung di browser (WebAssembly)
 * ─ Tidak ada limit penggunaan
 */

let removeBackgroundFn = null;

async function getRemoveBackground() {
  if (removeBackgroundFn) return removeBackgroundFn;
  // Lazy-load agar tidak memperlambat inisialisasi app
  const mod = await import('@imgly/background-removal');
  removeBackgroundFn = mod.removeBackground;
  return removeBackgroundFn;
}

/**
 * Hapus background foto menggunakan AI ONNX (imgly)
 * @param {string} imgSrc  - URL atau data URL foto
 * @param {function} onProgress - callback progress (0-1)
 * @returns {Promise<string>} - data URL PNG transparan
 */
export async function segmentPortraitAI(imgSrc, onProgress) {
  const removeBackground = await getRemoveBackground();

  // Konversi data URL / URL ke Blob
  let blob;
  if (imgSrc.startsWith('data:')) {
    const res = await fetch(imgSrc);
    blob = await res.blob();
  } else {
    const res = await fetch(imgSrc, { mode: 'cors' });
    blob = await res.blob();
  }

  const resultBlob = await removeBackground(blob, {
    publicPath: 'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.4.5/dist/',
    // Model medium: keseimbangan kecepatan & kualitas
    model: 'medium',
    // Output format PNG dengan alpha channel
    output: {
      format: 'image/png',
      quality: 1.0,
    },
    progress: (key, current, total) => {
      if (onProgress && total > 0) {
        onProgress(current / total);
      }
    },
  });

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(resultBlob);
  });
}

/**
 * Hapus background berdasarkan warna (flood-fill color matching)
 * Untuk foto dengan latar solid (putih/biru/merah)
 */
export async function removeColorBackground(imgSrc, mode = 'auto', tolerance = 40) {
  const img = new Image();
  img.crossOrigin = 'anonymous';

  let finalSrc = imgSrc;
  if (imgSrc.startsWith('http') && !imgSrc.startsWith(window.location.origin)) {
    try {
      const res = await fetch(imgSrc, { mode: 'cors' });
      const blob = await res.blob();
      finalSrc = URL.createObjectURL(blob);
    } catch (e) {
      console.warn('CORS fallback:', e);
    }
  }

  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = finalSrc;
  });

  const canvas = document.createElement('canvas');
  const w = img.naturalWidth || img.width || 500;
  const h = img.naturalHeight || img.height || 600;
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, w, h);
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  let targetR, targetG, targetB;

  if (mode === 'white') {
    targetR = 250; targetG = 250; targetB = 250;
  } else {
    const sampleCorner = (x, y) => {
      const idx = (y * w + x) * 4;
      return { r: data[idx], g: data[idx + 1], b: data[idx + 2] };
    };
    const c1 = sampleCorner(Math.min(8, w - 1), Math.min(8, h - 1));
    const c2 = sampleCorner(Math.max(0, w - 8), Math.min(8, h - 1));
    const c3 = sampleCorner(Math.min(8, w - 1), Math.max(0, h - 8));
    const c4 = sampleCorner(Math.max(0, w - 8), Math.max(0, h - 8));

    targetR = Math.round((c1.r + c2.r + c3.r + c4.r) / 4);
    targetG = Math.round((c1.g + c2.g + c3.g + c4.g) / 4);
    targetB = Math.round((c1.b + c2.b + c3.b + c4.b) / 4);
  }

  const maxDist = tolerance * 2.2;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const dist = Math.sqrt((r - targetR) ** 2 + (g - targetG) ** 2 + (b - targetB) ** 2);

    if (mode === 'white') {
      if (r > (255 - tolerance) && g > (255 - tolerance) && b > (255 - tolerance)) {
        data[i + 3] = 0;
      } else if (dist < maxDist) {
        const alpha = Math.max(0, Math.min(255, (dist / maxDist) * 255));
        data[i + 3] = Math.min(data[i + 3], alpha);
      }
    } else {
      if (dist < maxDist) {
        if (dist < maxDist * 0.5) {
          data[i + 3] = 0;
        } else {
          const alpha = ((dist - maxDist * 0.5) / (maxDist * 0.5)) * 255;
          data[i + 3] = Math.min(data[i + 3], Math.round(alpha));
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL('image/png');
}
