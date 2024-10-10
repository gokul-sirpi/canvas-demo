import React, { useEffect, useState } from 'react';
import styles from './styles.module.css';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  content: any;
}

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose, content }) => {
  const [properties, setProperties] = useState<any>(null);

  useEffect(() => {
    if (content) {
      const filteredProperties = content;

      delete filteredProperties.geometry;
      delete filteredProperties.fill;
      delete filteredProperties.stroke;
      delete filteredProperties['fill-opacity'];
      delete filteredProperties['stroke-width'];
      delete filteredProperties['stroke-opacity'];
      delete filteredProperties['marker-id'];
      delete filteredProperties.layerGeom;
      delete filteredProperties.layerId;

      setProperties(filteredProperties);
    }
  }, [content]);

  return (
    <div className={`${styles.sidebar} ${open ? styles.sidebarOpen : ''}`}>
      <div className={styles.sidebarHeader}>
        <button className={styles.closeButton} onClick={onClose}>
          Close
        </button>
      </div>
      <div className={styles.sidebarContent}>
        {properties && (
          <div>
            {Object.entries(properties).map(([key, value]) => (
              <div key={key} style={{ marginTop: '5px' }}>
                <b className={styles.key}>{key}</b>: {/* @ts-ignore */}
                <span className={styles.value}>{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
