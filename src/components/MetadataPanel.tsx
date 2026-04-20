'use client';

import { ChangeEvent } from 'react';
import { 
  Eye,
  EyeOff,
  MoveHorizontal,
  MoveVertical
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

      <div className="position-dropdown-container">
        <div className="dropdown-group">
          <label>
            <MoveHorizontal size={14} />
            Căn lề ngang
          </label>
          <select 
            value={metadata.position} 
            onChange={(e) => onChange('position', e.target.value)}
            className="modern-select"
          >
            <option value="left">Căn trái</option>
            <option value="center">Căn giữa</option>
            <option value="right">Căn phải</option>
            <option value="between">Đều 2 bên</option>
          </select>
        </div>

        <div className="dropdown-group">
          <label>
            <MoveVertical size={14} />
            Vị trí dọc
          </label>
          <select 
            value={metadata.vPosition} 
            onChange={(e) => onChange('vPosition', e.target.value)}
            className="modern-select"
          >
            <option value="top">Phía trên ảnh</option>
            <option value="bottom">Phía dưới ảnh</option>
          </select>
        </div>
      </div>
      
      <div className="metadata-grid">
        {FIELDS.map(({ key, label }) => {
          const isShown = metadata.showFields.includes(key);
          const val = metadata[key as keyof MetadataState] as string;
          
          return (
            <div key={key} className={`metadata-field ${!isShown ? 'hidden-field' : ''}`}>
              <div className="field-header">
                <label>{label}</label>
                <button 
                  className={`visibility-toggle ${isShown ? 'visible' : ''}`}
                  onClick={() => handleToggleField(key)}
                >
                  {isShown ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              </div>
              <input 
                type="text" 
                value={val || ''} 
                onChange={handleInputChange(key as keyof MetadataState)}
                placeholder={label}
                disabled={!isShown}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
