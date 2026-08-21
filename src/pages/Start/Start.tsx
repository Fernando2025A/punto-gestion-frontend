import { 
  BarChart2, 
  Box, 
  TrendingUp, 
  UserCheck, 
  User, 
  UserPlus,
  UserRoundArrowLeftIcon,
} from 'lucide-react';
import './Start.css';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import { DemoModal } from './DemoModal/DemoModal';
import { useState } from 'react';

export function Start() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  const { showToast } = useToast();
  const { login } = useAuth();
  const registerRedirect = () => {
    navigate("/register");
  }
  const loginRedirect = () => {
    navigate("/login");
  }

  const getDemo = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/auth/demo`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        showToast('Error al obtener la demo', 'error');
        return;
      }
      const data: Credentials = await response.json();
      console.log(data);
      const resLogin = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: data.username,
          password: data.password,
        }),
      });
      console.log(resLogin);
      if (!resLogin.ok) {
        showToast('Error al iniciar sesión', 'error');
        return;
      }

      const meResponse = await fetch(`${apiUrl}/auth/me`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!meResponse.ok) {
        showToast('No se pudo validar la sesión de la demo', 'error');
        return;
      }

      const meData = await meResponse.json();
      login({
        username: meData.username,
        email: meData?.email,
        businessId: meData.activeBusinessId,
        id: meData.id,
        planName: meData.ownedBusinesses[0].plan.name,
        isOwner: false,
      });

      navigate('/home', { replace: true });
      return;
    } catch (error) {
      console.error('Error al obtener la demo:', error);
      showToast('Error al obtener la demo', 'error');
    }
  };
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
            <button onClick={() => setIsModalOpen(true)} className="start-page-btn start-page-btn-outline">
              <UserRoundArrowLeftIcon size={18} />
              <span>Probar Demo</span>
            </button>
          </div>
        </section>
      </main>
      <DemoModal 
        onConfirm={getDemo}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isLoading={isLoading}
      />
    </div>
  );
}

type Credentials = {
  username: string;
  password: string;
}