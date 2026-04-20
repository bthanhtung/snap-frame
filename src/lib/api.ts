'use client';

const API_URL = ''; // Always relative in Next.js

export const api = {
  async getTemplates() {
    const res = await fetch('/api/frame/templates');
    if (!res.ok) throw new Error('Failed to fetch templates');
    return res.json();
  },

  async extractExif(file: File): Promise<Record<string, any>> {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/frame/extract-exif', { method: 'POST', body: form });
    if (!res.ok) throw new Error('Failed to extract EXIF');
    return res.json();
  },

  async processImage(file: File, options: Record<string, any>): Promise<Blob> {
    const form = new FormData();
    form.append('file', file);
    form.append('options', JSON.stringify(options));
    const res = await fetch('/api/frame/process', { method: 'POST', body: form });
    if (!res.ok) throw new Error('Processing failed');
    return res.blob();
  }
};

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
