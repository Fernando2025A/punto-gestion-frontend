import React, { useState } from 'react';
import { 
  BarChart2, 
  UserPlus, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import './Register.css';
import { useNavigate } from 'react-router-dom';

export function Register() {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const redirect = (path: string) => {
    navigate(`/${path}`);
  }

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch(`${apiUrl}/auth/register`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: formData.fullName,
        password: formData.password,
      })
    })
    if (response.ok) {
      await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      redirect("home");
    } else {
      alert("Ha ocurrido un error");
    }
  };

  return (
    <div className="register-page-container">
      {/* Header / Navbar */}
      <header className="register-page-header">
        <div className="register-page-logo-container">
          <BarChart2 className="register-page-logo-icon" size={24} />
          <span className="register-page-logo-text">Punto Gestión</span>
        </div>
        <div className="register-page-header-right">
          <span className="register-page-header-text">¿Ya tienes cuenta?</span>
          <button onClick={() => redirect("login")} className="register-page-btn-header-login">Iniciar sesión</button>
        </div>
      </header>

      {/* Main Content / Register Form */}
      <main className="register-page-main-content">
        <div className="register-page-card">
          {/* Card Header */}
          <div className="register-page-card-header">
            <div className="register-page-icon-wrapper">
              <UserPlus size={32} className="register-page-card-icon" />
            </div>
            <h1 className="register-page-card-title">Crear cuenta</h1>
            <p className="register-page-card-subtitle">
              Únete a Punto Gestión y comienza a gestionar tu stock de forma eficiente.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="register-page-form">
            {/* Nombre completo */}
            <div className="register-page-form-group">
              <label htmlFor="fullName">Nombre completo</label>
              <div className="register-page-input-wrapper">
                <User size={18} className="register-page-input-icon" />
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="Ingresa tu nombre completo"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Correo electrónico */}
            <div className="register-page-form-group">
              <label htmlFor="email">Correo electrónico</label>
              <div className="register-page-input-wrapper">
                <Mail size={18} className="register-page-input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Ingresa tu correo electrónico"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="register-page-form-group">
              <label htmlFor="password">Contraseña</label>
              <div className="register-page-input-wrapper">
                <Lock size={18} className="register-page-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="Crea una contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="register-page-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirmar contraseña */}
            <div className="register-page-form-group">
              <label htmlFor="confirmPassword">Confirmar contraseña</label>
              <div className="register-page-input-wrapper">
                <Lock size={18} className="register-page-input-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirma tu contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="register-page-toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" className="register-page-btn-submit">
              Registrarse
            </button>
          </form>

          {/* Legal / Terms */}
          <p className="register-page-terms-text">
            Al registrarte, aceptas nuestros{' '}
            <a href="#terminos" className="register-page-terms-link">
              Términos de servicio
            </a>{' '}
            y{' '}
            <a href="#privacidad" className="register-page-terms-link">
              Política de privacidad
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
}