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
    <div className="home-container">
      {/* Header / Navbar */}
      <header className="header">
        <div className="logo-container">
          <BarChart2 className="logo-icon" size={24} />
          <span className="logo-text">Punto Gestión</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Hero Section */}
        <section className="hero-section">
          <h1 className="hero-title">
            <span className="text-blue">Punto </span>
            <span className="text-white">Gestión</span>
          </h1>
          <p className="hero-subtitle">
            El gestor de stock simple y eficiente <br />
            para tu negocio.
          </p>
        </section>

        {/* Features Grid */}
        <section className="features-grid">
          {/* Feature 1 */}
          <div className="feature-card">
            <div className="icon-wrapper">
              <Box className="feature-icon" size={28} />
            </div>
            <h3 className="feature-title">Control de stock</h3>
            <p className="feature-description">
              Gestiona tus productos y controla tu inventario en tiempo real.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="feature-card">
            <div className="icon-wrapper">
              <TrendingUp className="feature-icon" size={28} />
            </div>
            <h3 className="feature-title">Reportes claros</h3>
            <p className="feature-description">
              Obtén reportes e información clave para tomar mejores decisiones.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="feature-card">
            <div className="icon-wrapper">
              <UserCheck className="feature-icon" size={28} />
            </div>
            <h3 className="feature-title">Fácil de usar</h3>
            <p className="feature-description">
              Interfaz intuitiva y simple para que te enfoques en lo que importa.
            </p>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="cta-section">
          <h2 className="cta-question">
            ¿Listo para empezar a gestionar tu negocio?
          </h2>
          <div className="buttons-container">
            <button onClick={loginRedirect} className="btn btn-outline">
              <User size={18} />
              <span>Iniciar sesión</span>
            </button>
            <button onClick={registerRedirect} className="btn btn-primary">
              <UserPlus size={18} />
              <span>Registrarse</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}