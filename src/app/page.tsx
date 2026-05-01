'use client';

import { useState, useEffect, useRef } from 'react';
import { api, downloadBlob } from '@/lib/api';
import DropZone from '@/components/DropZone';
import StylePicker from '@/components/StylePicker';
import MetadataPanel, { MetadataState } from '@/components/MetadataPanel';
import WatermarkPanel, { WatermarkState } from '@/components/WatermarkPanel';
import DesignPanel, { DesignState } from '@/components/DesignPanel';
import PreviewCanvas from '@/components/PreviewCanvas';

export default function EditorPage() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [styleId, setStyleId] = useState('white-minimal');
  const [isProcessing, setIsProcessing] = useState(false);
  const [exifLoading, setExifLoading] = useState(false);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  const [metadata, setMetadata] = useState<MetadataState>({
    camera: '', lens: '', focalLength: '', aperture: '',
    shutterSpeed: '', iso: '', date: '', location: '', author: '',
    showFields: ['camera', 'author', 'focalLength', 'aperture', 'shutterSpeed', 'iso'],
    position: 'between', vPosition: 'bottom',
  });

  const [watermark, setWatermark] = useState<WatermarkState>({
    imageBase64: '', position: 'bottom-right', opacity: 0.7, scale: 0.15,
  });

  const [design, setDesign] = useState<DesignState>({
    bgColor: '#FFFFFF', cornerRadius: 0, shadowIntensity: 0, borderWidth: 0, noiseOpacity: 0,
  });

  // Open sheet when file is first selected
  useEffect(() => {
    if (sourceFile) setSheetExpanded(true);
  }, [sourceFile]);

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

  const buildOptions = () => ({
    frame: { enabled: true, style: styleId, size: 'md' },
    output: { format: 'jpeg', quality: 92 },
    metadata: { ...metadata },
    watermark: watermark.imageBase64 ? watermark : undefined,
    design: design,
  });

  useEffect(() => {
    if (!sourceFile) return;
    const timer = setTimeout(async () => {
      setIsProcessing(true);
      try {
        const blob = await api.processImage(sourceFile, buildOptions());
        const url = URL.createObjectURL(blob);
        setPreviewBlobUrl(prev => { if (prev) URL.revokeObjectURL(prev); return url; });
      } catch (err) {
        console.error('Process error:', err);
      } finally {
        setIsProcessing(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [sourceFile, styleId, metadata, watermark, design]);

  const handleDownload = async () => {
    if (!previewBlobUrl || !sourceFile) return;
    const parts = sourceFile.name.split('.');
    if (parts.length > 1) parts.pop();
    const ts = new Date().getTime().toString().slice(-6);
    const fileName = `${parts.join('.')}-framed-${ts}.jpg`;
    downloadBlob(await fetch(previewBlobUrl).then(r => r.blob()), fileName);
  };

  const resetFile = () => {
    setSourceFile(null);
    setPreviewBlobUrl(null);
    setSheetExpanded(false);
  };

  // Drag-to-dismiss sheet
  const touchStartY = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => { touchStartY.current = e.touches[0].clientY; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientY - touchStartY.current;
    if (delta > 60 && sheetExpanded) setSheetExpanded(false);
    if (delta < -60 && !sheetExpanded) setSheetExpanded(true);
  };

  const controls = (
    <div className="controls-stack">
      {sourceFile && (
        <div className="header-actions">
          <button className="btn-secondary" onClick={resetFile}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4l16 16M4 20L20 4" />
            </svg>
            New photo
          </button>
        </div>
      )}

      {!sourceFile ? (
        <DropZone onFileSelect={handleFileSelect} />
      ) : (
        <>
          <section className="control-section">
            <div className="section-header"><h2>1 · Style</h2></div>
            <StylePicker selectedStyle={styleId} onStyleSelect={setStyleId} />
          </section>

          <section className="control-section">
            <div className="section-header"><h2>2 · Metadata</h2></div>
            <MetadataPanel
              metadata={metadata}
              onChange={(k, v) => setMetadata(p => ({ ...p, [k]: v }))}
              loading={exifLoading}
            />
          </section>

          <section className="control-section">
            <div className="section-header"><h2>3 · Frame & Design</h2></div>
            <DesignPanel design={design} onChange={(k, v) => setDesign(p => ({ ...p, [k]: v }))} />
          </section>

          <section className="control-section">
            <div className="section-header"><h2>4 · Watermark</h2></div>
            <WatermarkPanel watermark={watermark} onChange={(k, v) => setWatermark(p => ({ ...p, [k]: v }))} />
          </section>
        </>
      )}
    </div>
  );

  return (
    <div className="editor-grid">
      {/* ── Preview (always on top on mobile) ── */}
      <div className="preview-pane">
        <div className="preview-header">
          <h2>Live Preview</h2>
          <button
            className="btn-primary"
            disabled={!previewBlobUrl || isProcessing}
            onClick={handleDownload}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Download
          </button>
        </div>
        <div className="preview-container">
          <PreviewCanvas previewUrl={previewBlobUrl} isLoading={isProcessing || exifLoading} />
        </div>
      </div>

      {/* ── Sidebar / Bottom Sheet ── */}
      <div
        ref={sheetRef}
        className={`sidebar${sheetExpanded ? ' expanded' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Mobile sheet toggle */}
        <div
          className="sheet-handle"
          onClick={() => setSheetExpanded(x => !x)}
          role="button"
          aria-label={sheetExpanded ? 'Collapse panel' : 'Expand panel'}
        />
        <div className="sheet-scroll">
          {controls}
        </div>
      </div>

      {/* ── Floating Action Button (mobile download) ── */}
      <button
        className="fab-download"
        disabled={!previewBlobUrl || isProcessing}
        onClick={handleDownload}
        aria-label="Download"
      >
        {isProcessing ? (
          <div className="loading-spinner anim-spin" style={{ width: 22, height: 22, borderWidth: 2 }} />
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>
    </div>
  );
}
