'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { convertHeicToJpeg, isHeicFile } from '@/lib/heic-converter';

interface DropZoneProps {
  onFileSelect: (file: File, previewUrl: string) => void;
}

export default function DropZone({ onFileSelect }: DropZoneProps) {
  const [isConverting, setIsConverting] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    try {
      setIsConverting(true);
      let file = acceptedFiles[0];
      
      // Auto-convert HEIC
      if (isHeicFile(file)) {
        file = await convertHeicToJpeg(file);
      }
      
      const previewUrl = URL.createObjectURL(file);
      onFileSelect(file, previewUrl);
    } catch (err) {
      console.error('Error handling file:', err);
      alert('Không thể xử lý file này.');
    } finally {
      setIsConverting(false);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/heic': ['.heic'],
      'image/heif': ['.heif']
    },
    maxFiles: 1
  });

  return (
    <div 
      {...getRootProps()} 
      className={`dropzone ${isDragActive ? 'active' : ''} ${isConverting ? 'converting' : ''}`}
    >
      <input {...getInputProps()} />
      <div className="dropzone-content">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
        {isConverting ? (
          <>
            <h3>Đang chuyển đổi HEIC...</h3>
            <p>Vui lòng đợi giây lát</p>
          </>
        ) : isDragActive ? (
          <h3>Thả ảnh vào đây...</h3>
        ) : (
          <>
            <h3>Kéo thả ảnh hoặc click để chọn</h3>
            <p>Hỗ trợ JPG, PNG, WebP, HEIC (iPhone)</p>
          </>
        )}
      </div>
    </div>
  );
}
