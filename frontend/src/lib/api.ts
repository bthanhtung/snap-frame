// Use relative path in production (same domain), and localhost for development
const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
  ? 'http://localhost:3000' 
  : '';

export const api = {
  baseUrl: API_URL,

  async getTemplates() {
    const res = await fetch(`${API_URL}/api/frame/templates`);
    if (!res.ok) throw new Error('Failed to fetch templates');
    return res.json();
  },

  async extractExif(file: File): Promise<Record<string, any>> {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${API_URL}/api/frame/extract-exif`, { method: 'POST', body: form });
    if (!res.ok) throw new Error('Failed to extract EXIF');
    return res.json();
  },

  async processImage(file: File, options: Record<string, any>): Promise<Blob> {
    const form = new FormData();
    form.append('file', file);
    form.append('options', JSON.stringify(options));
    const res = await fetch(`${API_URL}/api/frame/process`, { method: 'POST', body: form });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Processing failed' }));
      throw new Error(err.message ?? 'Processing failed');
    }
    return res.blob();
  },

  async batchProcess(files: File[], options: Record<string, any>): Promise<any> {
    const form = new FormData();
    files.forEach(f => form.append('files', f));
    form.append('options', JSON.stringify(options));
    const res = await fetch(`${API_URL}/api/batch/process`, { method: 'POST', body: form });
    if (!res.ok) throw new Error('Batch processing failed');
    return res.json();
  },
};

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

export function base64ToBlob(base64: string, mimeType = 'image/jpeg'): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mimeType });
}
