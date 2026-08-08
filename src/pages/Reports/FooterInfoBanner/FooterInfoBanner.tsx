import React from 'react';
import './FooterInfoBanner.css';

export const FooterInfoBanner: React.FC = () => {
  return (
    <footer className="footer-system-info-notice-bar-container">
      <span className="footer-info-icon-badge">ⓘ</span>
      <span className="footer-info-realtime-message-text">
        Los reportes se actualizan en tiempo real con la información de tu inventario.
      </span>
    </footer>
  );
};