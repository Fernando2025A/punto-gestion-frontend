import { createContext } from 'react';
import { Socket } from 'socket.io-client';

export interface AlertsContextType {
  socket: Socket | null;
  isConnected: boolean;
}

// Inicialmente es undefined para forzar el chequeo en el Hook
export const AlertsContext = createContext<AlertsContextType | undefined>(undefined);