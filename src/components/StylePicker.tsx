'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export interface FrameTemplate {
  id: string;
  name: string;
  description: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontStyle: string;
}

interface StylePickerProps {
  selectedStyle: string;
  onStyleSelect: (styleId: string) => void;
}

export default function StylePicker({ selectedStyle, onStyleSelect }: StylePickerProps) {
  const [templates, setTemplates] = useState<FrameTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTemplates()
      .then(setTemplates)
      .catch(err => console.error('Failed to load templates:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="style-grid">
        {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: '100px' }} />)}
      </div>
    );
  }

  return (
    <div className="style-grid">
      {templates.map(tmpl => {
        const isActive = selectedStyle === tmpl.id;
        return (
          <button
            key={tmpl.id}
            className={`style-card ${isActive ? 'active' : ''}`}
            onClick={() => onStyleSelect(tmpl.id)}
            style={{
              background: tmpl.backgroundColor,
              color: tmpl.textColor,
              fontFamily: tmpl.fontStyle
            }}
          >
            <div className="style-preview">
              <div className="style-image-placeholder"></div>
              <div className="style-meta" style={{ borderColor: tmpl.accentColor }}>
                <span className="style-name">{tmpl.name}</span>
                <span className="style-dots" style={{ color: tmpl.accentColor }}>•••</span>
              </div>
            </div>
            {isActive && <div className="style-ring"></div>}
          </button>
        );
      })}
    </div>
  );
}
