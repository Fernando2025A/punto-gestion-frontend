import { 
  BarChart2, 
  Box, 
  TrendingUp, 
  UserCheck, 
  User, 
  UserPlus 
} from 'lucide-react';
import './Start.css';
import { useNavigate } from 'react-router-dom';

export function Start() {
  const navigate = useNavigate();

  const registerRedirect = () => {
    navigate("/register");
  }
  const loginRedirect = () => {
    navigate("/login");
  }
  return (
    <div className="start-page-container">
      {/* Header / Navbar */}
      <header className="start-page-header">
        <div className="start-page-logo-container">
          <BarChart2 className="start-page-logo-icon" size={24} />
          <span className="start-page-logo-text">Punto Gestión</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="start-page-main-content">
        {/* Hero Section */}
        <section className="start-page-hero-section">
          <h1 className="start-page-hero-title">
            <span className="start-page-text-blue">Punto </span>
            <span className="start-page-text-white">Gestión</span>
          </h1>
          <p className="start-page-hero-subtitle">
            El gestor de stock simple y eficiente <br />
            para tu negocio.
          </p>
        </section>

        {/* Features Grid */}
        <section className="start-page-features-grid">
          {/* Feature 1 */}
          <div className="start-page-feature-card">
            <div className="start-page-icon-wrapper">
              <Box className="start-page-feature-icon" size={28} />
            </div>
            <h3 className="start-page-feature-title">Control de stock</h3>
            <p className="start-page-feature-description">
              Gestiona tus productos y controla tu inventario en tiempo real.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="start-page-feature-card">
            <div className="start-page-icon-wrapper">
              <TrendingUp className="start-page-feature-icon" size={28} />
            </div>
            <h3 className="start-page-feature-title">Reportes claros</h3>
            <p className="start-page-feature-description">
              Obtén reportes e información clave para tomar mejores decisiones.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="start-page-feature-card">
            <div className="start-page-icon-wrapper">
              <UserCheck className="start-page-feature-icon" size={28} />
            </div>
            <h3 className="start-page-feature-title">Fácil de usar</h3>
            <p className="start-page-feature-description">
              Interfaz intuitiva y simple para que te enfoques en lo que importa.
            </p>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="start-page-cta-section">
          <h2 className="start-page-cta-question">
            ¿Listo para empezar a gestionar tu negocio?
          </h2>
          <div className="start-page-buttons-container">
            <button onClick={loginRedirect} className="start-page-btn start-page-btn-outline">
              <User size={18} />
              <span>Iniciar sesión</span>
            </button>
            <button onClick={registerRedirect} className="start-page-btn start-page-btn-primary">
              <UserPlus size={18} />
              <span>Registrarse</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}