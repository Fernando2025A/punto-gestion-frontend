import React, { useState, useEffect } from "react";
import { AuthContext, type User } from "../context/AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const refreshSession = async () => {
      try {
        const response = await fetch(`${apiUrl}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });

        return response.ok;
      } catch (error) {
        console.error("Error al refrescar la sesión:", error);
        return false;
      }
    };

    const checkAuthStatus = async () => {
      try {
        let response = await fetch(`${apiUrl}/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok && response.status === 401) {
          const refreshed = await refreshSession();

          if (refreshed) {
            response = await fetch(`${apiUrl}/auth/me`, {
              method: "GET",
              credentials: "include",
            });
          }
        }

        if (response.ok) {
          const data = await response.json(); // Se espera que la API devuelva p.ej. { username: "admin" }
          setUser({ username: data.username, id: data.id, email: data?.email, businessId: data.ownedBusinesses[0].id });
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error al obtener la sesión:", error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
    void refreshSession();

    const intervalId = window.setInterval(() => {
      void refreshSession();
    }, 10 * 60 * 1000);

    return () => window.clearInterval(intervalId);
  }, [apiUrl]);

  const login = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}