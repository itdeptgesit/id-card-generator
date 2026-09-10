import QRCode from 'qrcode';

export async function generateQrCodeUrl(text, options = {}) {
  if (!text || !text.trim()) return null;
  try {
    const dataUrl = await QRCode.toDataURL(text.trim(), {
      width: options.width || 200,
      margin: options.margin || 1,
      color: {
        dark: options.darkColor || '#000000',
        light: options.lightColor || '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
    return dataUrl;
  } catch (err) {
    console.error('Gagal membuat QR code:', err);
    return null;
  }
}
