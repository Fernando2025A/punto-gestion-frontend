import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { AlertsContext } from "../context/AlertsContext";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../hooks/useAuth";

export const AlertsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { showToast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  // 1. Guardamos el socket en un useState para exponerlo al Context de forma reactiva
  const [socket, setSocket] = useState<Socket | null>(null);

  // Mantenemos el ref solo internamente para limpiezas y callbacks dentro del efecto
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Si el usuario no está autenticado o no tiene negocio activo, cerramos conexión
    if (!isAuthenticated || !user?.businessId) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL;

    // Inicializamos la conexión con withCredentials: true
    const socketInstance = io(`${apiUrl}/alerts`, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance); // 👈 Seteamos el estado

    socketInstance.on("connect", () => {
      setIsConnected(true);
      console.log("🟢 Socket conectado con ID:", socketInstance.id);
      console.log(
        "🏢 Intentando unirme a sala con businessId:",
        user?.businessId,
      );

      socketInstance.emit(
        "joinCompanyRoom",
        user?.businessId,
        (response: any) => {
          console.log(
            "📩 Respuesta del Backend al unirse a la sala:",
            response,
          );
        },
      );
    });

    socketInstance.on("notification", (payload: any) => {
      console.log("⚡ ALERTA RECIBIDA EN FRONTEND:", payload); // 👈 Revisa si este log aparece
      showToast(
        payload.message,
        payload.type === "LOW_STOCK" ? "error" : "success",
      );
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
    });

    return () => {
      socketInstance.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [isAuthenticated, user?.businessId, showToast]);

  return (
    // 2. Pasamos el valor del 'socket' desde el estado en lugar de 'socketRef.current'
    <AlertsContext.Provider value={{ socket, isConnected }}>
      {children}
    </AlertsContext.Provider>
  );
};
