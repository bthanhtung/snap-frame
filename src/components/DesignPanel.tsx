'use client';

import { Palette, Square, Layout, Sun } from 'lucide-react';

export interface DesignState {
  bgColor: string;
  cornerRadius: number;
  shadowIntensity: number;
  borderWidth: number;
  noiseOpacity: number;
}

interface DesignPanelProps {
  design: DesignState;
  onChange: (key: keyof DesignState, value: any) => void;
}

const COLOR_PRESETS = [
  '#FFFFFF', '#F8F4EF', '#F5E6C8', '#E6E6E6', 
  '#222222', '#0D0D0D', '#1A1A1A', '#330000'
];

export default function DesignPanel({ design, onChange }: DesignPanelProps) {
  return (
    <div className="design-panel">
      <div className="panel-header">
        <h3 className="panel-title">Decor & Advanced</h3>
        <p className="panel-subtitle">Tùy biến chi tiết khung hình</p>
      </div>

      <div className="design-controls">
        {/* Color Picker */}
        <div className="design-group">
          <div className="group-title">
            <Palette size={14} />
            <span>Màu nền khung</span>
          </div>
          <div className="color-options">
            <div className="color-presets">
              {COLOR_PRESETS.map(c => (
                <button 
                  key={c}
                  className={`color-dot ${design.bgColor === c ? 'active' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => onChange('bgColor', c)}
                  title={c}
                />
              ))}
              <div className="custom-color-input">
                <input 
                  type="color" 
                  value={design.bgColor} 
                  onChange={(e) => onChange('bgColor', e.target.value)} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="sliders-grid">
          <div className="design-group">
            <div className="group-title">
              <Square size={14} />
              <span>Bo góc ảnh ({design.cornerRadius}px)</span>
            </div>
            <input 
              type="range" min="0" max="100" step="1" 
              value={design.cornerRadius} 
              onChange={(e) => onChange('cornerRadius', parseInt(e.target.value))}
            />
          </div>

          <div className="design-group">
            <div className="group-title">
              <Sun size={14} />
              <span>Đổ bóng ảnh ({design.shadowIntensity}%)</span>
            </div>
            <input 
              type="range" min="0" max="100" step="5" 
              value={design.shadowIntensity} 
              onChange={(e) => onChange('shadowIntensity', parseInt(e.target.value))}
            />
          </div>

          <div className="design-group">
            <div className="group-title">
              <Layout size={14} />
              <span>Độ dày viền ({design.borderWidth}px)</span>
            </div>
            <input 
              type="range" min="0" max="20" step="1" 
              value={design.borderWidth} 
              onChange={(e) => onChange('borderWidth', parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
