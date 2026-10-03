import { configureStore } from '@reduxjs/toolkit';
import { baseApi, chatApi } from './api';
import authReducer, {
  restoreSession,
  selectPersistableSession,
} from './slices/authSlice';
import {
  loadAuthSession,
  saveAuthSession,
} from '../services/authSessionStorage';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(baseApi.middleware, chatApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

let hydration: Promise<boolean> | null = null;

/**
 * Restores the last saved session into the store, then keeps the saved copy in
 * sync with the auth slice. Resolves to whether a session was restored.
 * Persistence starts only after the read, so the initial (signed-out) state
 * can never overwrite a saved session.
 */
export const hydrateAuthSession = () => {
  if (!hydration) {
    hydration = (async () => {
      const saved = await loadAuthSession();
      if (saved) {
        store.dispatch(restoreSession(saved));
      }

      let lastAuth = store.getState().auth;
      let lastSerialized = JSON.stringify(selectPersistableSession(lastAuth));
      store.subscribe(() => {
        const auth = store.getState().auth;
        if (auth === lastAuth) {
          return;
        }
        lastAuth = auth;
        const session = selectPersistableSession(auth);
        const serialized = JSON.stringify(session);
        if (serialized !== lastSerialized) {
          lastSerialized = serialized;
          void saveAuthSession(session);
        }
      });

      return Boolean(saved);
    })();
  }
  return hydration;
};
