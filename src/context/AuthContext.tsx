import { createContext } from "react";

export interface User {
  username: string;
  id: string;
  email?: string;
  businessId: number;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null; // <-- Agregamos el objeto user
  login: (userData: User) => void; // <-- Ahora puede recibir los datos del usuario
  logout: () => void;
}

// Exportamos solo el Contexto (para el hook) y el Provider (Componente)
export const AuthContext = createContext<AuthContextType | undefined>(undefined);