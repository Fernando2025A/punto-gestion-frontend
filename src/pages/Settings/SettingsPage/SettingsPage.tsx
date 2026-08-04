import React, { useState } from 'react';
import { 
  User, 
  Store, 
  Package, 
  Paintbrush, 
  ShieldCheck, 
  Lock, 
  Save 
} from 'lucide-react';
import './SettingsPage.css';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'business' | 'inventory' | 'appearance'>('profile');
  
  // Form states
  const [formData, setFormData] = useState({
    fullName: 'Ana García',
    email: 'ana.garcia@puntogestion.com',
    phone: '+52 1 222 3333',
    twoFactor: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggle2FA = () => {
    setFormData(prev => ({ ...prev, twoFactor: !prev.twoFactor }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Datos guardados:', formData);
  };

  return (
    <div className="settings-container">
      <h1 className="settings-title">Configuración del Sistema</h1>

      {/* Tabs Header */}
      <div className="settings-tabs">
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <User size={18} />
          <span>Mi Perfil</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'business' ? 'active' : ''}`}
          onClick={() => setActiveTab('business')}
        >
          <Store size={18} />
          <span>Mi Negocio</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          <Package size={18} />
          <span>Reglas de Inventario</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'appearance' ? 'active' : ''}`}
          onClick={() => setActiveTab('appearance')}
        >
          <Paintbrush size={18} />
          <span>Apariencia</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSubmit} className="settings-grid">
          {/* Left Column: Personal Information */}
          <div className="settings-card">
            <div className="card-header">
              <div className="icon-badge">
                <User size={20} />
              </div>
              <h2>Información Personal</h2>
            </div>

            <div className="form-group">
              <label htmlFor="fullName">Nombre Completo</label>
              <input 
                type="text" 
                id="fullName" 
                name="fullName"
                value={formData.fullName} 
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input 
                type="email" 
                id="email" 
                name="email"
                value={formData.email} 
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Teléfono de Contacto</label>
              <input 
                type="text" 
                id="phone" 
                name="phone"
                value={formData.phone} 
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn-primary">
              <Save size={18} />
              <span>Guardar Cambios</span>
            </button>
          </div>

          {/* Right Column: Account Security */}
          <div className="settings-card">
            <div className="card-header">
              <div className="icon-badge">
                <ShieldCheck size={20} />
              </div>
              <h2>Seguridad de la Cuenta</h2>
            </div>

            <button type="button" className="btn-outline">
              <Lock size={18} />
              <span>Cambiar Contraseña</span>
            </button>

            <div className="toggle-row">
              <div className="toggle-label">
                <ShieldCheck size={18} />
                <span>Autenticación de Dos Pasos (2FA)</span>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={formData.twoFactor} 
                  onChange={handleToggle2FA} 
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </form>
      )}

      {/* Placeholders para las otras pestañas */}
      {activeTab !== 'profile' && (
        <div className="settings-card placeholder-card">
          <p>Contenido de la sección en desarrollo...</p>
        </div>
      )}
    </div>
  );
};