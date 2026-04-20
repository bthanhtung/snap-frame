'use client';

import { ChangeEvent } from 'react';
import { 
  Eye,
  EyeOff,
  MoveHorizontal,
  MoveVertical,
  Settings2,
  User
} from 'lucide-react';

export interface MetadataState {
  camera: string;
  lens: string;
  focalLength: string;
  aperture: string;
  shutterSpeed: string;
  iso: string;
  date: string;
  location: string;
  author: string;
  showFields: string[];
  position: 'left' | 'center' | 'right' | 'between';
  vPosition: 'top' | 'bottom';
}

interface MetadataPanelProps {
  metadata: MetadataState;
  onChange: (key: keyof MetadataState, value: any) => void;
  loading?: boolean;
}

const FIELDS = [
  { key: 'camera', label: 'Camera' },
  { key: 'author', label: 'Author / Shot on' },
  { key: 'lens', label: 'Lens' },
  { key: 'focalLength', label: 'Focal Length' },
  { key: 'aperture', label: 'Aperture' },
  { key: 'shutterSpeed', label: 'Shutter' },
  { key: 'iso', label: 'ISO' },
  { key: 'date', label: 'Date' },
  { key: 'location', label: 'Location' },
];

export default function MetadataPanel({ metadata, onChange, loading }: MetadataPanelProps) {
  if (loading) {
    return (
      <div className="metadata-panel">
        <div className="skeleton" style={{ height: '32px', marginBottom: '1rem' }} />
        <div className="skeleton" style={{ height: '200px' }} />
      </div>
    );
  }

  const handleToggleField = (field: string) => {
    const isShown = metadata.showFields.includes(field);
    const newFields = isShown 
      ? metadata.showFields.filter(f => f !== field)
      : [...metadata.showFields, field];
    onChange('showFields', newFields);
  };

  const handleInputChange = (key: keyof MetadataState) => (e: ChangeEvent<HTMLInputElement>) => {
    onChange(key, e.target.value);
  };

  return (
    <div className="metadata-panel">
      <div className="panel-header">
        <h3 className="panel-title">Metadata Config</h3>
        <p className="panel-subtitle">Tùy chỉnh thông số và vị trí hiển thị</p>
      </div>

      {/* Layout Controls Row */}
      <div className="metadata-layout-row">
        <div className="metadata-field layout-field">
          <div className="field-header">
            <label>Căn lề ngang</label>
            <div className="field-icon"><MoveHorizontal size={12} /></div>
          </div>
          <select 
            value={metadata.position} 
            onChange={(e) => onChange('position', e.target.value)}
            className="field-select"
          >
            <option value="left">Căn trái</option>
            <option value="center">Căn giữa</option>
            <option value="right">Căn phải</option>
            <option value="between">Đều 2 bên</option>
          </select>
        </div>

        <div className="metadata-field layout-field">
          <div className="field-header">
            <label>Vị trí dọc</label>
            <div className="field-icon"><MoveVertical size={12} /></div>
          </div>
          <select 
            value={metadata.vPosition} 
            onChange={(e) => onChange('vPosition', e.target.value)}
            className="field-select"
          >
            <option value="top">Trên</option>
            <option value="bottom">Dưới</option>
          </select>
        </div>
      </div>

      <div className="section-divider">
        <Settings2 size={12} style={{ marginRight: '8px', opacity: 0.5 }} />
        <span>Thông số chi tiết</span>
      </div>
      
      <div className="metadata-grid">
        {FIELDS.map(({ key, label }) => {
          const isShown = metadata.showFields.includes(key);
          const val = metadata[key as keyof MetadataState] as string;
          
          return (
            <div key={key} className={`metadata-field ${!isShown ? 'hidden-field' : ''}`}>
              <div className="field-header">
                <label>{label}</label>
                <div className="field-actions">
                  <button 
                    className={`visibility-toggle ${isShown ? 'visible' : ''}`}
                    onClick={() => handleToggleField(key)}
                  >
                    {isShown ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                </div>
              </div>
              <input 
                type="text" 
                value={val || ''} 
                onChange={handleInputChange(key as keyof MetadataState)}
                placeholder={key === 'author' ? 'Shot on...' : label}
                disabled={!isShown}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
