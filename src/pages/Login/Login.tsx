import React, { useState } from "react";
import { BarChart2, User, Lock, Eye, EyeOff } from "lucide-react";
import "./Login.css";
import { useNavigate } from "react-router-dom";

export function Login() {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();

  const redirect = (path: string) => {
    navigate(`/${path}`);
  };

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Datos de inicio de sesión:", { ...formData, rememberMe });

    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json", // <-- Importante para enviar JSON correctamente
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      if (response.ok) {
        redirect("home");
      } else {
        alert("Credenciales inválidas");
      }
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
      alert("Error al intentar conectar con el servidor");
    }
  };

  const handleGoogleLogin = () => {
    console.log("Iniciar sesión con Google");
  };

  return (
    <div className="login-container">
      {/* Header / Navbar */}
      <header className="header">
        <div className="logo-container">
          <BarChart2 className="logo-icon" size={24} />
          <span className="logo-text">Punto Gestión</span>
        </div>
        <div className="header-right">
          <span className="header-text">¿No tienes cuenta?</span>
          <button onClick={() => redirect("register")} className="btn-header-register">
            Registrarse
          </button>
        </div>
      </header>

      {/* Main Content / Login Form */}
      <main className="main-content">
        <div className="login-card">
          {/* Card Header */}
          <div className="card-header">
            <div className="icon-wrapper">
              <User size={36} className="card-icon" />
            </div>
            <h1 className="card-title">Iniciar sesión</h1>
            <p className="card-subtitle">
              Bienvenido de nuevo. Inicia sesión para continuar gestionando tu negocio.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Username / Email */}
            <div className="form-group">
              <label htmlFor="username">Usuario o correo electrónico</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  id="username"
                  name="username" /* <-- Corregido: coincide con la clave en formData */
                  placeholder="Ingresa tu usuario o correo"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Ingresa tu contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="form-options">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="checkmark"></span>
                <span className="checkbox-label">Recordarme</span>
              </label>
              <a href="#forgot-password" className="forgot-password-link">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn-submit">
              Iniciar sesión
            </button>
          </form>

          {/* Divider */}
          <div className="divider">
            <span>o continúa con</span>
          </div>

          {/* Google Login Button */}
          <button
            type="button"
            className="btn-google"
            onClick={handleGoogleLogin}
          >
            <svg
              className="google-icon"
              viewBox="0 0 24 24"
              width="18"
              height="18"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continuar con Google</span>
          </button>
        </div>
      </main>
    </div>
  );
}