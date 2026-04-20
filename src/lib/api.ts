'use client';

const API_URL = ''; // Relative path in Next.js (Production)

export const api = {
  async getTemplates() {
    const res = await fetch('/api/frame/templates');
    if (!res.ok) throw new Error('Failed to fetch templates');
    return res.json();
  },

  async extractExif(file: File): Promise<Record<string, any>> {
    try {
      const exifr = (await import('exifr')).default;
      const raw = await exifr.parse(file, {
        tiff: true, exif: true, gps: true, reviveValues: true, mergeOutput: true,
      });
      if (!raw) return {};
      
      // Helper functions to format values (similar to server-side)
      const formatFocalLength = (v: any) => v ? `${Math.round(v)}mm` : undefined;
      const formatAperture = (v: any) => v ? `f/${Math.round(v * 10) / 10}` : undefined;
      const formatDate = (v: any) => {
        if (!v) return undefined;
        const d = new Date(v);
        return isNaN(d.getTime()) ? undefined : `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
      };

      return {
        camera: raw.Model,
        lens: raw.LensModel || raw.Lens,
        focalLength: formatFocalLength(raw.FocalLength || raw.FocalLengthIn35mmFormat),
        aperture: formatAperture(raw.FNumber || raw.ApertureValue),
        shutterSpeed: raw.ExposureTime ? (raw.ExposureTime >= 1 ? `${Math.round(raw.ExposureTime)}s` : `1/${Math.round(1/raw.ExposureTime)}s`) : undefined,
        iso: raw.ISO,
        date: formatDate(raw.DateTimeOriginal || raw.DateTime),
      };
    } catch (err) {
      console.warn('Client-side EXIF failed:', err);
      return {};
    }
  },

  async processImage(file: File, options: Record<string, any>): Promise<Blob> {
    const fileToUpload = await compressImageIfNeeded(file);
    const form = new FormData();
    form.append('file', fileToUpload);
    form.append('options', JSON.stringify(options));
    const res = await fetch('/api/frame/process', { method: 'POST', body: form });
    if (!res.ok) throw new Error('Processing failed');
    return res.blob();
  }
};

// --- HELPER FUNCTIONS ---

export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function compressImageIfNeeded(file: File): Promise<File | Blob> {
  const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  const MAX_SIZE = 3 * 1024 * 1024; // 3MB
  
  if (isLocalhost || file.size <= MAX_SIZE) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_DIM = 2500;
        if (width > height && width > MAX_DIM) {
          height = (height * MAX_DIM) / width;
          width = MAX_DIM;
        } else if (height > MAX_DIM) {
          width = (width * MAX_DIM) / height;
          height = MAX_DIM;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          else resolve(file);
        }, 'image/jpeg', 0.8);
      };
    };
  });
}
