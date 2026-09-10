// MediaPipe Selfie Segmentation & Smart Color Removal

let selfieSegmentationModel = null;

export async function segmentPortraitAI(sourceSrc) {
  if (typeof window.SelfieSegmentation === 'undefined') {
    throw new Error('Pustaka MediaPipe AI sedang dimuat atau belum tersedia.');
  }

  const img = new Image();
  img.crossOrigin = 'anonymous';

  let finalSrc = sourceSrc;
  if (sourceSrc.startsWith('http') && !sourceSrc.startsWith(window.location.origin)) {
    try {
      const res = await fetch(sourceSrc, { mode: 'cors' });
      const blob = await res.blob();
      finalSrc = URL.createObjectURL(blob);
    } catch (e) {
      console.warn('CORS direct fetch fallback:', e);
    }
  }

  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = finalSrc;
  });

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width || 600;
  canvas.height = img.naturalHeight || img.height || 800;
  const ctx = canvas.getContext('2d');

  if (!selfieSegmentationModel) {
    selfieSegmentationModel = new window.SelfieSegmentation({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
    });
    selfieSegmentationModel.setOptions({
      modelSelection: 1, // High quality portrait segmentation
    });
  }

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Timeout memproses AI (25 detik)')), 25000);

    selfieSegmentationModel.onResults((results) => {
      clearTimeout(timeout);
      try {
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Gambar masker segmentasi
        ctx.drawImage(results.segmentationMask, 0, 0, canvas.width, canvas.height);

        // 2. Potong foto sesuai masker
        ctx.globalCompositeOperation = 'source-in';
        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

        ctx.restore();
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      } catch (err) {
        reject(err);
      }
    });

    selfieSegmentationModel.send({ image: img }).catch(reject);
  });
}

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
    targetR = 250;
    targetG = 250;
    targetB = 250;
  } else {
    // Ambil sampel rata-rata 4 sudut foto
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
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const dist = Math.sqrt(
      (r - targetR) ** 2 +
      (g - targetG) ** 2 +
      (b - targetB) ** 2
    );

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
