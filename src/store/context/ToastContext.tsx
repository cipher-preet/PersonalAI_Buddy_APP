import React, { createContext, useState, useCallback } from 'react';
import { ToastType } from '../../components/CustomToast';

export interface ShowToastParams {
  message: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (params: ShowToastParams) => void;
  hideToast: () => void;
  toastVisible: boolean;
  toastMessage: string;
  toastDescription?: string;
  toastType: ToastType;
  toastDuration: number;
}

export const ToastContext = createContext<ToastContextType | undefined>(
  undefined,
);

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastDescription, setToastDescription] = useState<string | undefined>();
  const [toastType, setToastType] = useState<ToastType>('success');
  const [toastDuration, setToastDuration] = useState(3000);

  const showToast = useCallback(
    ({
      message,
      description,
      type = 'success',
      duration = 3000,
    }: ShowToastParams) => {
      setToastMessage(message);
      setToastDescription(description);
      setToastType(type);
      setToastDuration(duration);
      setToastVisible(true);
    },
    [],
  );

  const hideToast = useCallback(() => {
    setToastVisible(false);
  }, []);

  return (
    <ToastContext.Provider
      value={{
        showToast,
        hideToast,
        toastVisible,
        toastMessage,
        toastDescription,
        toastType,
        toastDuration,
      }}
    >
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
