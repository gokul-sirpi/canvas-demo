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
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginTop: '10px',
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    borderBottom: '2px solid #ddd',
                    borderRight: '1px solid #ddd',
                    padding: '8px',
                    textAlign: 'left',
                  }}
                >
                  Property
                </th>
                <th
                  style={{
                    borderBottom: '2px solid #ddd',
                    padding: '8px',
                    textAlign: 'left',
                  }}
                >
                  Value
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(properties).map(([key, value]) => (
                <tr key={key}>
                  <td
                    style={{
                      borderBottom: '1px solid #ddd',
                      borderRight: '1px solid #ddd',
                      padding: '8px',
                    }}
                  >
                    {key}
                  </td>
                  <td
                    style={{ borderBottom: '1px solid #ddd', padding: '8px' }}
                  >
                    {/* @ts-ignore */}
                    {value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
