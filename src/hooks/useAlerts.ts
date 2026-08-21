import { useContext } from 'react';
import { AlertsContext, type AlertsContextType } from '../context/AlertsContext';

export const useAlerts = (): AlertsContextType => {
  const context = useContext(AlertsContext);

  if (!context) {
    throw new Error('useAlerts debe ser utilizado dentro de un <AlertsProvider />');
  }

  return context;
};