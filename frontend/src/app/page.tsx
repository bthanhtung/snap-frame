'use client';

import { useState, useEffect } from 'react';
import { api, downloadBlob } from '@/lib/api';
import DropZone from '@/components/DropZone';
import StylePicker from '@/components/StylePicker';
import MetadataPanel, { MetadataState } from '@/components/MetadataPanel';
import WatermarkPanel, { WatermarkState } from '@/components/WatermarkPanel';
import PreviewCanvas from '@/components/PreviewCanvas';

export default function EditorPage() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  
  // State for config
  const [styleId, setStyleId] = useState('white-minimal');
  const [isProcessing, setIsProcessing] = useState(false);
  const [exifLoading, setExifLoading] = useState(false);

  const [metadata, setMetadata] = useState<MetadataState>({
    camera: '', lens: '', focalLength: '', aperture: '', shutterSpeed: '', iso: '', date: '', location: '',
    showFields: ['camera', 'focalLength', 'aperture', 'shutterSpeed', 'iso']
  });

  const [watermark, setWatermark] = useState<WatermarkState>({
    imageBase64: '', position: 'bottom-right', opacity: 0.7, scale: 0.15
  });

  // Handle new file upload
  const handleFileSelect = async (file: File) => {
    setSourceFile(file);
    setExifLoading(true);
    try {
      const exif = await api.extractExif(file);
      setMetadata(prev => ({
        ...prev,
        camera: exif.camera || '',
        lens: exif.lens || '',
        focalLength: exif.focalLength || '',
        aperture: exif.aperture || '',
        shutterSpeed: exif.shutterSpeed || '',
        iso: exif.iso ? String(exif.iso) : '',
        date: exif.date || '',
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setExifLoading(false);
    }
  };

  // Build the options JSON
  const buildOptions = () => ({
    frame: { enabled: true, style: styleId, size: 'md' },
    output: { format: 'jpeg', quality: 92 },
    metadata: {
      camera: metadata.camera,
      lens: metadata.lens,
      focalLength: metadata.focalLength,
      aperture: metadata.aperture,
      shutterSpeed: metadata.shutterSpeed,
      iso: metadata.iso,
      date: metadata.date,
      location: metadata.location,
      showFields: metadata.showFields,
    },
    watermark: watermark.imageBase64 ? watermark : undefined,
  });

  // Effect: Process image when config changes (Debounced)
  useEffect(() => {
    if (!sourceFile) return;
    
    // Debounce processing to avoid spamming the backend
    const timer = setTimeout(async () => {
      setIsProcessing(true);
      try {
        const resultBlob = await api.processImage(sourceFile, buildOptions());
        const url = URL.createObjectURL(resultBlob);
        setPreviewBlobUrl(prev => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
      } catch (err) {
        console.error('Process error:', err);
      } finally {
        setIsProcessing(false);
      }
    }, 800); // 800ms debounce

    return () => clearTimeout(timer);
  }, [sourceFile, styleId, metadata, watermark]);

  const handleDownload = async () => {
    if (!previewBlobUrl || !sourceFile) return;
    const originalName = sourceFile.name.split('.')[0];
    downloadBlob(await fetch(previewBlobUrl).then(r => r.blob()), `${originalName}-framed.jpg`);
  };

  return (
    <div className="editor-grid">
      {/* LEFT COLUMN: Editor Controls */}
      <div className="sidebar">
        {!sourceFile ? (
          <DropZone onFileSelect={handleFileSelect} />
        ) : (
          <div className="controls-stack">
            <div className="header-actions">
              <button className="btn-secondary" onClick={() => {
                setSourceFile(null);
                setPreviewBlobUrl(null);
              }}>Tải ảnh mới</button>
            </div>
            
            <section className="control-section">
              <div className="section-header">
                <h2>1. Chọn Style</h2>
              </div>
              <StylePicker selectedStyle={styleId} onStyleSelect={setStyleId} />
            </section>

            <section className="control-section">
              <div className="section-header">
                <h2>2. Tùy chỉnh Thông số</h2>
              </div>
              <MetadataPanel 
                metadata={metadata} 
                onChange={(k, v) => setMetadata(p => ({ ...p, [k]: v }))} 
                loading={exifLoading} 
              />
            </section>

            <section className="control-section">
              <div className="section-header">
                <h2>3. Watermark/Logo (Optional)</h2>
              </div>
              <WatermarkPanel 
                watermark={watermark} 
                onChange={(k, v) => setWatermark(p => ({ ...p, [k]: v }))} 
              />
            </section>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Live Preview */}
      <div className="preview-pane">
        <div className="preview-header">
          <h2>Live Preview</h2>
          <button 
            className="btn-primary" 
            disabled={!previewBlobUrl || isProcessing}
            onClick={handleDownload}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Tải ảnh về
          </button>
        </div>
        
        <div className="preview-container">
          <PreviewCanvas previewUrl={previewBlobUrl} isLoading={isProcessing || exifLoading} />
        </div>
      </div>
    </div>
  );
}
