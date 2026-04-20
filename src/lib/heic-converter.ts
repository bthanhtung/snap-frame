/**
 * Client-side HEIC → JPEG conversion using heic2any
 * Only runs in browser (no SSR)
 */
export async function convertHeicToJpeg(file: File): Promise<File> {
  if (!file.name.toLowerCase().match(/\.(heic|heif)$/) && file.type !== 'image/heic' && file.type !== 'image/heif') {
    return file;
  }

  // Dynamic import — avoid SSR issues
  const heic2any = (await import('heic2any')).default;

  const converted = await heic2any({
    blob: file,
    toType: 'image/jpeg',
    quality: 0.95,
  }) as Blob;

  const name = file.name.replace(/\.(heic|heif)$/i, '.jpg');
  return new File([converted], name, { type: 'image/jpeg' });
}

export function isHeicFile(file: File): boolean {
  return file.name.toLowerCase().match(/\.(heic|heif)$/) !== null || file.type === 'image/heic' || file.type === 'image/heif';
}
