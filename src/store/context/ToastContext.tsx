import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { ToastType } from '../../components/CustomToast';

export interface ShowToastParams {
  message: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

type ToastActions = {
  showToast: (params: ShowToastParams) => void;
  hideToast: () => void;
};

type ToastState = {
  toastVisible: boolean;
  toastMessage: string;
  toastDescription?: string;
  toastType: ToastType;
  toastDuration: number;
};

const ToastActionsContext = createContext<ToastActions | undefined>(undefined);
const ToastStateContext = createContext<ToastState | undefined>(undefined);

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastDescription, setToastDescription] = useState<
    string | undefined
  >();
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

  const actions = useMemo(
    () => ({
      showToast,
      hideToast,
    }),
    [hideToast, showToast],
  );

  const state = useMemo(
    () => ({
      toastVisible,
      toastMessage,
      toastDescription,
      toastType,
      toastDuration,
    }),
    [toastDescription, toastDuration, toastMessage, toastType, toastVisible],
  );

  return (
    <ToastActionsContext.Provider value={actions}>
      <ToastStateContext.Provider value={state}>
        {children}
      </ToastStateContext.Provider>
    </ToastActionsContext.Provider>
  );
};

/** Stable actions — safe for screens; does not re-render on toast show/hide. */
export const useToast = () => {
  const context = useContext(ToastActionsContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

/** Toast UI state — only App/CustomToast should subscribe. */
export const useToastState = () => {
  const context = useContext(ToastStateContext);
  if (!context) {
    throw new Error('useToastState must be used within ToastProvider');
  }
  return context;
};
