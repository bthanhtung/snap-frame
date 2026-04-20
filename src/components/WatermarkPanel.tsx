'use client';

import { ChangeEvent } from 'react';
import { blobToDataURL } from '@/lib/api';

export interface WatermarkState {
  imageBase64: string;
  position: 'top-left'|'top-right'|'bottom-left'|'bottom-right'|'center';
  opacity: number;
  scale: number;
}

interface WatermarkPanelProps {
  watermark: WatermarkState;
  onChange: (key: keyof WatermarkState, value: any) => void;
}

export default function WatermarkPanel({ watermark, onChange }: WatermarkPanelProps) {
  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const b64 = await blobToDataURL(file);
      onChange('imageBase64', b64);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="watermark-panel">
       <div className="panel-header">
        <h3 className="panel-title">Watermark / Logo</h3>
      </div>

      <div className="watermark-controls">
        <div className="wm-upload">
          <label className="btn-upload">
            {watermark.imageBase64 ? 'Change Logo' : 'Upload Logo (PNG/SVG)'}
            <input type="file" accept="image/png, image/svg+xml" onChange={handleLogoUpload} hidden />
          </label>
          {watermark.imageBase64 && (
            <button className="btn-remove" onClick={() => onChange('imageBase64', '')}>Remove</button>
          )}
        </div>

        {watermark.imageBase64 && (
          <div className="wm-settings">
            <div className="setting-group">
              <label>Position</label>
              <select 
                value={watermark.position}
                onChange={e => onChange('position', e.target.value)}
              >
                <option value="top-left">Top Left</option>
                <option value="top-right">Top Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-right">Bottom Right</option>
                <option value="center">Center</option>
              </select>
            </div>

            <div className="setting-group">
              <label>Opacity ({Math.round(watermark.opacity * 100)}%)</label>
              <input 
                type="range" min="5" max="100" 
                value={watermark.opacity * 100}
                onChange={e => onChange('opacity', parseInt(e.target.value) / 100)}
              />
            </div>

            <div className="setting-group">
              <label>Size ({Math.round(watermark.scale * 100)}%)</label>
              <input 
                type="range" min="5" max="40" 
                value={watermark.scale * 100}
                onChange={e => onChange('scale', parseInt(e.target.value) / 100)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
