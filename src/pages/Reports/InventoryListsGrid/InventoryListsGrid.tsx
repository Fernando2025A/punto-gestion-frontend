import React from 'react';
import './InventoryListsGrid.css';

export const InventoryListsGrid: React.FC = () => {
  return (
    <div className="inventory-lists-quad-columns-wrapper-grid">
      {/* Columna 1 */}
      <div className="inventory-card-list-panel-container">
        <div className="inventory-card-list-header-flex">
          <span className="inventory-card-list-title-text">Stock bajo</span>
          <a href="#" className="inventory-card-list-view-all-link">Ver todos</a>
        </div>
        <div className="inventory-card-list-items-wrapper">
          <div className="inventory-item-single-row">
            <span className="inventory-item-icon-box box-amber">📦</span>
            <div className="inventory-item-text-details">
              <p className="inventory-item-product-title">Galletas Oreo 150g</p>
              <p className="inventory-item-sub-meta">Stock: <span className="highlight-val-yellow">2</span></p>
            </div>
          </div>
          <div className="inventory-item-single-row">
            <span className="inventory-item-icon-box box-amber">📦</span>
            <div className="inventory-item-text-details">
              <p className="inventory-item-product-title">Café La Virginia 250g</p>
              <p className="inventory-item-sub-meta">Stock: <span className="highlight-val-yellow">3</span></p>
            </div>
          </div>
          <div className="inventory-item-single-row">
            <span className="inventory-item-icon-box box-teal">🥛</span>
            <div className="inventory-item-text-details">
              <p className="inventory-item-product-title">Leche Entera 1L</p>
              <p className="inventory-item-sub-meta">Stock: <span className="highlight-val-yellow">4</span></p>
            </div>
          </div>
        </div>
        <a href="#" className="inventory-card-list-footer-link link-yellow">Ver reporte completo</a>
      </div>

      {/* Columna 2 */}
      <div className="inventory-card-list-panel-container">
        <div className="inventory-card-list-header-flex">
          <span className="inventory-card-list-title-text">Sin stock</span>
          <a href="#" className="inventory-card-list-view-all-link">Ver todos</a>
        </div>
        <div className="inventory-card-list-items-wrapper">
          <div className="inventory-item-single-row">
            <span className="inventory-item-icon-box box-red">🧀</span>
            <div className="inventory-item-text-details">
              <p className="inventory-item-product-title">Queso Muzzarella x Kilo</p>
              <p className="inventory-item-sub-meta">Stock: 0</p>
            </div>
          </div>
          <div className="inventory-item-single-row">
            <span className="inventory-item-icon-box box-red">🧉</span>
            <div className="inventory-item-text-details">
              <p className="inventory-item-product-title">Yerba Mate Taragüí 1kg</p>
              <p className="inventory-item-sub-meta">Stock: 0</p>
            </div>
          </div>
        </div>
        <a href="#" className="inventory-card-list-footer-link link-red">Ver reporte completo</a>
      </div>

      {/* Columna 3 */}
      <div className="inventory-card-list-panel-container">
        <div className="inventory-card-list-header-flex">
          <span className="inventory-card-list-title-text">Próximos a vencer</span>
          <a href="#" className="inventory-card-list-view-all-link">Ver todos</a>
        </div>
        <div className="inventory-card-list-items-wrapper">
          <div className="inventory-item-single-row">
            <div className="inventory-days-badge-container">
              <span className="badge-days-num">5</span>
              <span className="badge-days-lbl">días</span>
            </div>
            <div className="inventory-item-text-details">
              <p className="inventory-item-product-title">Yogur Serenito Frutilla</p>
              <p className="inventory-item-sub-meta">Vence: 05/08/2026</p>
            </div>
          </div>
          <div className="inventory-item-single-row">
            <div className="inventory-days-badge-container">
              <span className="badge-days-num">8</span>
              <span className="badge-days-lbl">días</span>
            </div>
            <div className="inventory-item-text-details">
              <p className="inventory-item-product-title">Queso Cremón La Serenísima</p>
              <p className="inventory-item-sub-meta">Vence: 08/08/2026</p>
            </div>
          </div>
        </div>
        <a href="#" className="inventory-card-list-footer-link link-purple">Ver reporte completo</a>
      </div>

      {/* Columna 4 */}
      <div className="inventory-card-list-panel-container">
        <div className="inventory-card-list-header-flex">
          <span className="inventory-card-list-title-text">Poca rotación</span>
          <a href="#" className="inventory-card-list-view-all-link">Ver todos</a>
        </div>
        <div className="inventory-card-list-items-wrapper">
          <div className="inventory-item-single-row">
            <span className="inventory-item-icon-box box-blue">🔊</span>
            <div className="inventory-item-text-details">
              <p className="inventory-item-product-title">Parlantes Noga Bluetooth</p>
              <p className="inventory-item-sub-meta text-blue-muted">Sin movimientos: 92 días</p>
            </div>
          </div>
          <div className="inventory-item-single-row">
            <span className="inventory-item-icon-box box-blue">🖱️</span>
            <div className="inventory-item-text-details">
              <p className="inventory-item-product-title">Mouse Gamer X7</p>
              <p className="inventory-item-sub-meta text-blue-muted">Sin movimientos: 75 días</p>
            </div>
          </div>
        </div>
        <a href="#" className="inventory-card-list-footer-link link-blue">Ver reporte completo</a>
      </div>
    </div>
  );
};