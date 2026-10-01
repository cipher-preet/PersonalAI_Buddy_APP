import { devWarn } from './logger';

export type ErrorSource = 'render' | 'global' | 'promise';

export type ErrorContext = {
  source: ErrorSource;
  isFatal?: boolean;
  componentStack?: string;
};

type ErrorListener = (error: Error, context: ErrorContext) => void;

const listeners = new Set<ErrorListener>();

const toError = (value: unknown): Error => {
  if (value instanceof Error) {
    return value;
  }
  if (typeof value === 'string') {
    return new Error(value);
  }
  try {
    return new Error(JSON.stringify(value));
  } catch {
    return new Error('Unknown error');
  }
};

/**
 * Single funnel for every caught error. Hook a crash-reporting SDK
 * (Crashlytics, Sentry) in here via `onErrorReported`.
 */
export const reportError = (value: unknown, context: ErrorContext) => {
  const error = toError(value);
  devWarn(`[${context.source}] ${error.message}`, context.componentStack ?? '');

  listeners.forEach(listener => {
    try {
      listener(error, context);
    } catch {
      // A broken listener must never trigger another error cycle.
    }
  });
};

export const onErrorReported = (listener: ErrorListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

type HermesRejectionTracker = {
  enablePromiseRejectionTracker?: (options: {
    allRejections: boolean;
    onUnhandled: (id: number, rejection: unknown) => void;
    onHandled: (id: number) => void;
  }) => void;
};

let installed = false;

/**
 * In release builds an uncaught JS error (e.g. inside an onPress or a timer)
 * makes React Native kill the app. We log it and keep the app alive instead.
 * Dev builds still get the red box via the default handler.
 */
export const installGlobalErrorHandler = () => {
  if (installed || typeof ErrorUtils === 'undefined') {
    return;
  }
  installed = true;

  const defaultHandler = ErrorUtils.getGlobalHandler();

  ErrorUtils.setGlobalHandler((error: unknown, isFatal?: boolean) => {
    reportError(error, { source: 'global', isFatal });

    if (__DEV__) {
      defaultHandler(error, isFatal);
    }
  });

  if (!__DEV__) {
    const hermes = (globalThis as { HermesInternal?: HermesRejectionTracker })
      .HermesInternal;
    hermes?.enablePromiseRejectionTracker?.({
      allRejections: true,
      onUnhandled: (_id, rejection) => {
        reportError(rejection, { source: 'promise' });
      },
      onHandled: () => undefined,
    });
  }
};
