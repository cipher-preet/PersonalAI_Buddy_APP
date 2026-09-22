import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

type ListeningSession = {
  spaceName: string;
  startedAt: number;
  onStop: () => void | Promise<void>;
};

type ListeningContextValue = {
  isActive: boolean;
  spaceName: string;
  startedAt: number | null;
  startListeningSession: (session: ListeningSession) => void;
  updateListeningSession: (
    patch: Partial<Pick<ListeningSession, 'spaceName' | 'startedAt'>>,
  ) => void;
  clearListeningSession: () => void;
  requestStop: () => void;
};

const ListeningContext = createContext<ListeningContextValue | null>(null);

export const ListeningProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [session, setSession] = useState<Omit<
    ListeningSession,
    'onStop'
  > | null>(null);
  const onStopRef = useRef<ListeningSession['onStop'] | null>(null);

  const startListeningSession = useCallback((next: ListeningSession) => {
    onStopRef.current = next.onStop;
    setSession({
      spaceName: next.spaceName,
      startedAt: next.startedAt,
    });
  }, []);

  const updateListeningSession = useCallback(
    (patch: Partial<Pick<ListeningSession, 'spaceName' | 'startedAt'>>) => {
      setSession(prev => (prev ? { ...prev, ...patch } : prev));
    },
    [],
  );

  const clearListeningSession = useCallback(() => {
    onStopRef.current = null;
    setSession(null);
  }, []);

  const requestStop = useCallback(() => {
    const stop = onStopRef.current;
    if (stop) {
      void stop();
    }
  }, []);

  const value = useMemo<ListeningContextValue>(
    () => ({
      isActive: Boolean(session),
      spaceName: session?.spaceName || 'Space',
      startedAt: session?.startedAt ?? null,
      startListeningSession,
      updateListeningSession,
      clearListeningSession,
      requestStop,
    }),
    [
      clearListeningSession,
      session,
      startListeningSession,
      updateListeningSession,
      requestStop,
    ],
  );

  return (
    <ListeningContext.Provider value={value}>
      {children}
    </ListeningContext.Provider>
  );
};

export const useListening = () => {
  const context = useContext(ListeningContext);
  if (!context) {
    throw new Error('useListening must be used within ListeningProvider');
  }
  return context;
};
