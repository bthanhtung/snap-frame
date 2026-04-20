const API_URL = ''; // Relative path in Next.js

export const api = {
  baseUrl: API_URL,

  async getTemplates() {
    const res = await fetch(`${API_URL}/api/frame/templates`);
    if (!res.ok) throw new Error('Failed to fetch templates');
    return res.json();
  },

  async extractExif(file: File): Promise<Record<string, any>> {
    const fileToUpload = await compressImageIfNeeded(file);
    const form = new FormData();
    form.append('file', fileToUpload);
    const res = await fetch(`${API_URL}/api/frame/extract-exif`, { method: 'POST', body: form });
    if (!res.ok) throw new Error('Failed to extract EXIF');
    return res.json();
  },
 
  async processImage(file: File, options: Record<string, any>): Promise<Blob> {
    const fileToUpload = await compressImageIfNeeded(file);
    const form = new FormData();
    form.append('file', fileToUpload);
    form.append('options', JSON.stringify(options));
    const res = await fetch(`${API_URL}/api/frame/process`, { method: 'POST', body: form });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Processing failed' }));
      throw new Error(err.message ?? 'Processing failed');
    }
    return res.blob();
  },
 
  async batchProcess(files: File[], options: Record<string, any>): Promise<any> {
    const processedFiles = await Promise.all(files.map(f => compressImageIfNeeded(f)));
    const form = new FormData();
    processedFiles.forEach(f => form.append('files', f));
    form.append('options', JSON.stringify(options));
    const res = await fetch(`${API_URL}/api/batch/process`, { method: 'POST', body: form });
    if (!res.ok) throw new Error('Batch processing failed');
    return res.json();
  },
};

async function compressImageIfNeeded(file: File): Promise<File | Blob> {
  const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  const MAX_SIZE = 3 * 1024 * 1024; // 3MB
  
  // Nếu là localhost hoặc ảnh nhỏ hơn 3MB thì không cần nén
  if (isLocalhost || file.size <= MAX_SIZE) {
    return file;
  }

  console.log(`Compressing ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) for Vercel...`);

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

        // Giới hạn kích thước tối đa khoảng 2500px để giảm dung lượng
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

        canvas.toBlob(
          (blob) => {
            if (blob) {
              console.log(`Compressed size: ${(blob.size / 1024 / 1024).toFixed(2)}MB`);
              resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.8 // Chất lượng 80% thường giảm dung lượng rất nhiều mà vẫn đẹp
        );
      };
    };
  });
}

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
