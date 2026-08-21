import React, { useState } from "react";
import { BarChart2, User, Lock, Eye, EyeOff } from "lucide-react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";

export function Login() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();

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

    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      if (response.ok) {
        const meResponse = await fetch(`${apiUrl}/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (!meResponse.ok) {
          showToast("No se pudo completar el inicio de sesión", "error");
          return;
        }
        showToast("Inicio de sesión exitoso", "success");
        const meData = await meResponse.json();

        const isAdmin = await fetch(`${apiUrl}/admin`, {
          credentials: "include",
        });

        let isOwner: boolean;
        if (isAdmin.ok) {
          isOwner = true;
        } else {
          isOwner = false;
        }

        // Guardamos los datos del usuario en el contexto
        login({ username: meData.username, email: meData?.email, id: meData.id, businessId: meData.activeBusinessId, isOwner: isOwner, planName: meData.ownedBusinesses[0].plan.name });

        navigate("/home", { replace: true });
        return;
      }
      showToast("No se ha podido iniciar sesión. Verifique usuario y contraseña", "error");
    } catch(error: unknown) {
      console.log(error);
      showToast("Error al intentar conectar con el servidor", "error");
    }
  };

  const handleGoogleLogin = () => {
    console.log("Iniciar sesión con Google");
  };

  return (
    <div className="login-page-container">
      {/* Header / Navbar */}
      <header className="login-page-header">
        <div className="login-page-logo-container">
          <BarChart2 className="login-page-logo-icon" size={24} />
          <span className="login-page-logo-text">Punto Gestión</span>
        </div>
        <div className="login-page-header-right">
          <span className="login-page-header-text">¿No tienes cuenta?</span>
          <button
            onClick={() => redirect("register")}
            className="login-page-btn-header-register"
          >
            Registrarse
          </button>
        </div>
      </header>

      {/* Main Content / Login Form */}
      <main className="login-page-main-content">
        <div className="login-page-card">
          {/* Card Header */}
          <div className="login-page-card-header">
            <div className="login-page-icon-wrapper">
              <User size={36} className="login-page-card-icon" />
            </div>
            <h1 className="login-page-card-title">Iniciar sesión</h1>
            <p className="login-page-card-subtitle">
              Bienvenido de nuevo. Inicia sesión para continuar gestionando tu
              negocio.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-page-form">
            {/* Username / Email */}
            <div className="login-page-form-group">
              <label htmlFor="username">Usuario o correo electrónico</label>
              <div className="login-page-input-wrapper">
                <User size={18} className="login-page-input-icon" />
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Ingresa tu usuario o correo"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="login-page-form-group">
              <label htmlFor="password">Contraseña</label>
              <div className="login-page-input-wrapper">
                <Lock size={18} className="login-page-input-icon" />
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
                  className="login-page-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="login-page-form-options">
              <label className="login-page-checkbox-container">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="login-page-checkmark"></span>
                <span className="login-page-checkbox-label">Recordarme</span>
              </label>
              <a href="#forgot-password" className="login-page-forgot-password-link">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Submit Button */}
            <button type="submit" className="login-page-btn-submit">
              Iniciar sesión
            </button>
          </form>

          {/* Divider */}
          <div className="login-page-divider">
            <span>o continúa con</span>
          </div>

          {/* Google Login Button */}
          <button
            type="button"
            className="login-page-btn-google"
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
