'use client';

import { ChangeEvent } from 'react';
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  ChevronUp, 
  ChevronDown,
  Eye,
  EyeOff
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

      <div className="position-section">
        <div className="position-group">
          <label>Căn lề ngang</label>
          <div className="segmented-control">
            {[
              { id: 'left', icon: <AlignLeft size={16} />, label: 'Trái' },
              { id: 'center', icon: <AlignCenter size={16} />, label: 'Giữa' },
              { id: 'right', icon: <AlignRight size={16} />, label: 'Phải' },
              { id: 'between', icon: <AlignJustify size={16} />, label: 'Đều' }
            ].map(pos => (
              <button 
                key={pos.id}
                className={`segment-btn ${metadata.position === pos.id ? 'active' : ''}`}
                onClick={() => onChange('position', pos.id)}
                title={pos.label}
              >
                {pos.icon}
              </button>
            ))}
            <div className={`selection-slider pos-${metadata.position}`} />
          </div>
        </div>

        <div className="position-group">
          <label>Vị trí dọc</label>
          <div className="segmented-control v-control">
            {[
              { id: 'top', icon: <ChevronUp size={16} />, label: 'Trên' },
              { id: 'bottom', icon: <ChevronDown size={16} />, label: 'Dưới' }
            ].map(vpos => (
              <button 
                key={vpos.id}
                className={`segment-btn ${metadata.vPosition === vpos.id ? 'active' : ''}`}
                onClick={() => onChange('vPosition', vpos.id)}
                title={vpos.label}
              >
                {vpos.icon}
              </button>
            ))}
            <div className={`selection-slider vpos-${metadata.vPosition}`} />
          </div>
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
