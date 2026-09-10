// Multi-tier HEIC/HEIF Decoder Fallback System

export async function convertHeicToBlob(file) {
  // 1. Try libheif-js WASM/bundle if available
  try {
    const libheifObj = window.libheif || window.libheifBundle;
    if (libheifObj && libheifObj.HeifDecoder) {
      const arrayBuffer = await file.arrayBuffer();
      const decoder = new libheifObj.HeifDecoder();
      const data = decoder.decode(arrayBuffer);

      if (data && data.length > 0) {
        const image = data[0];
        const width = image.get_width();
        const height = image.get_height();

        const cvs = document.createElement('canvas');
        cvs.width = width;
        cvs.height = height;
        const ctx = cvs.getContext('2d');

        const imgData = ctx.createImageData(width, height);
        const displayData = await new Promise((resolve) => {
          image.display({ data: imgData.data, width, height }, (res) => resolve(res));
        });

        if (displayData) {
          ctx.putImageData(new ImageData(displayData.data, width, height), 0, 0);
          const blob = await new Promise((r) => cvs.toBlob(r, 'image/jpeg', 0.95));
          if (blob && blob.size > 0) return blob;
        }
      }
    }
  } catch (e) {
    console.warn('libheif decoding failed, trying next method:', e);
  }

  // 2. Try native browser support (Safari / iOS)
  try {
    const isNativeSupported = await new Promise((resolve) => {
      const testImg = new Image();
      const url = URL.createObjectURL(file);
      testImg.onload = () => { URL.revokeObjectURL(url); resolve(true); };
      testImg.onerror = () => { URL.revokeObjectURL(url); resolve(false); };
      testImg.src = url;
    });
    if (isNativeSupported) return file;
  } catch (e) {
    console.warn('Native check failed:', e);
  }

  // 3. Try heic2any
  if (typeof window.heic2any === 'function') {
    try {
      let result = await window.heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.9,
        multiple: false,
      });
      if (Array.isArray(result)) result = result[0];
      if (result && result.size > 0) return result;
    } catch (e) {
      console.warn('heic2any failed:', e);
    }
  }

  // 4. Try basic canvas/FileReader decode
  try {
    const blobUrl = URL.createObjectURL(file);
    const img = new Image();
    const loaded = await new Promise((resolve) => {
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = blobUrl;
    });

    if (loaded && img.width > 0) {
      const cvs = document.createElement('canvas');
      cvs.width = img.naturalWidth || img.width;
      cvs.height = img.naturalHeight || img.height;
      const ctx = cvs.getContext('2d');
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(blobUrl);

      const blob = await new Promise((r) => cvs.toBlob(r, 'image/jpeg', 0.92));
      if (blob) return blob;
    }
    URL.revokeObjectURL(blobUrl);
  } catch (e) {
    console.warn('Canvas fallback failed:', e);
  }

  throw new Error('ERR_HEIC_UNSUPPORTED');
}
