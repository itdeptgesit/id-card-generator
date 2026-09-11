// Multi-tier HEIC/HEIF Decoder Fallback System
import libheifModule from 'libheif-js/wasm-bundle';

function getLibheif() {
  const candidate = libheifModule || window.libheif || window.libheifBundle;
  if (candidate && candidate.HeifDecoder) return candidate;
  if (candidate && candidate.default && candidate.default.HeifDecoder) return candidate.default;
  return null;
}

async function decodeWithLibheif(file) {
  const libheif = getLibheif();
  if (!libheif) throw new Error('libheif not available');

  const arrayBuffer = await file.arrayBuffer();
  const decoder = new libheif.HeifDecoder();
  const data = decoder.decode(arrayBuffer);

  if (!data || data.length === 0) throw new Error('No image data in HEIC file');

  const image = data[0];
  const width = image.get_width();
  const height = image.get_height();

  const cvs = document.createElement('canvas');
  cvs.width = width;
  cvs.height = height;
  const ctx = cvs.getContext('2d');

  const imageData = ctx.createImageData(width, height);
  const displayResult = await new Promise((resolve, reject) => {
    try {
      image.display(imageData, (displayData) => {
        if (!displayData) return reject(new Error('HEIF processing error'));
        resolve(displayData);
      });
    } catch (e) {
      reject(e);
    }
  });

  const dataOut = displayResult.data || imageData.data;
  const outW = displayResult.width || width;
  const outH = displayResult.height || height;
  ctx.putImageData(new ImageData(dataOut, outW, outH), 0, 0);

  const blob = await new Promise((r) => cvs.toBlob(r, 'image/png'));
  if (blob && blob.size > 0) return blob;
  throw new Error('Canvas conversion produced empty output');
}

function decodeWithHeic2any(file) {
  if (typeof window.heic2any !== 'function') return Promise.reject(new Error('heic2any not available'));
  return window
    .heic2any({ blob: file, toType: 'image/png', quality: 0.92 })
    .then((result) => {
      let out = result;
      if (Array.isArray(out)) out = out[0];
      if (!out || out.size === 0) throw new Error('heic2any empty result');
      return out;
    });
}

function decodeNativeCanvas(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const cvs = document.createElement('canvas');
      cvs.width = img.naturalWidth || img.width;
      cvs.height = img.naturalHeight || img.height;
      const ctx = cvs.getContext('2d');
      ctx.drawImage(img, 0, 0);
      cvs.toBlob((blob) => {
        if (blob && blob.size > 0) resolve(blob);
        else reject(new Error('Canvas export failed'));
      }, 'image/png');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Native decode not supported'));
    };
    img.src = url;
  });
}

export async function convertHeicToBlob(file) {
  // 1. libheif-js (bundled / window global) — primary
  try {
    return await decodeWithLibheif(file);
  } catch (e) {
    console.warn('[HEIC] libheif-js failed:', e);
  }

  // 2. heic2any (CDN global, fallback)
  try {
    return await decodeWithHeic2any(file);
  } catch (e) {
    console.warn('[HEIC] heic2any failed:', e);
  }

  // 3. Native browser support (Safari / iOS) via canvas
  try {
    return await decodeNativeCanvas(file);
  } catch (e) {
    console.warn('[HEIC] native decode failed:', e);
  }

  throw new Error('ERR_HEIC_UNSUPPORTED');
}