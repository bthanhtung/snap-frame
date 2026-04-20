'use client';

import { ChangeEvent } from 'react';

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
        <div className="skeleton" style={{ height: '120px' }} />
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
        <span className="panel-subtitle">Tùy chỉnh thông số hiển thị</span>
      </div>

      {/* Position Selectors */}
      <div className="position-controls">
        <div className="control-group">
          <label className="group-label">Vị trí ngang</label>
          <div className="btn-group">
            {[
              { id: 'left', label: 'Trái' },
              { id: 'center', label: 'Giữa' },
              { id: 'right', label: 'Phải' },
              { id: 'between', label: 'Đều 2 bên' }
            ].map(pos => (
              <button 
                key={pos.id}
                className={`group-btn ${metadata.position === pos.id ? 'active' : ''}`}
                onClick={() => onChange('position', pos.id)}
              >
                {pos.label}
              </button>
            ))}
          </div>
        </div>

        <div className="control-group">
          <label className="group-label">Vị trí dọc</label>
          <div className="btn-group">
            {[
              { id: 'top', label: 'Trên' },
              { id: 'bottom', label: 'Dưới' }
            ].map(vpos => (
              <button 
                key={vpos.id}
                className={`group-btn ${metadata.vPosition === vpos.id ? 'active' : ''}`}
                onClick={() => onChange('vPosition', vpos.id)}
              >
                {vpos.label}
              </button>
            ))}
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
                  className={`toggle-btn ${isShown ? 'active' : ''}`}
                  onClick={() => handleToggleField(key)}
                  title={isShown ? 'Hide on element' : 'Show on element'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {isShown ? (
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 1 0 0-6z" />
                    ) : (
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" />
                    )}
                  </svg>
                </button>
              </div>
              <input 
                type="text" 
                value={val || ''} 
                onChange={handleInputChange(key as keyof MetadataState)}
                placeholder={`Empty ${label}`}
                disabled={!isShown}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
