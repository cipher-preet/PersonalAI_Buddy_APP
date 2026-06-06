import React, { createContext, useState, useCallback } from 'react';
import { ToastType } from '../../components/CustomToast';

export interface ShowToastParams {
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (params: ShowToastParams) => void;
  hideToast: () => void;
  toastVisible: boolean;
  toastMessage: string;
  toastType: ToastType;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<ToastType>('success');

  const showToast = useCallback(
    ({ message, type = 'success' }: ShowToastParams) => {
      setToastMessage(message);
      setToastType(type);
      setToastVisible(true);
    },
    [],
  );

  const hideToast = useCallback(() => {
    setToastVisible(false);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast, toastVisible, toastMessage, toastType }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
