import RNFS from 'react-native-fs';

/**
 * Last known signed-in session, kept on device so the app can open straight
 * into the home screen while `auth/checkauth` re-validates in the background.
 * Stored in the app's private documents directory.
 */
export type PersistedAuthSession = {
  userId: string;
  token: string | null;
  isNewUser: boolean;
  hasCompletedOnboarding: boolean;
  phone: string | number | null;
  email: string | null;
  name: string | null;
  avatar: string | null;
};

const SESSION_FILE = `${RNFS.DocumentDirectoryPath}/auth-session.json`;

const isValidSession = (value: unknown): value is PersistedAuthSession =>
  Boolean(
    value &&
      typeof value === 'object' &&
      typeof (value as PersistedAuthSession).userId === 'string' &&
      (value as PersistedAuthSession).userId.length > 0,
  );

export const loadAuthSession = async (): Promise<PersistedAuthSession | null> => {
  try {
    if (!(await RNFS.exists(SESSION_FILE))) {
      return null;
    }
    const parsed = JSON.parse(await RNFS.readFile(SESSION_FILE, 'utf8'));
    return isValidSession(parsed) ? parsed : null;
  } catch (error) {
    console.warn('Failed to read saved session', error);
    await clearAuthSession();
    return null;
  }
};

let pendingWrite: Promise<void> = Promise.resolve();

/** Writes are serialized so a slow write can never overwrite a newer one. */
export const saveAuthSession = (session: PersistedAuthSession | null) => {
  pendingWrite = pendingWrite
    .catch(() => undefined)
    .then(async () => {
      if (!session) {
        await clearAuthSession();
        return;
      }
      await RNFS.writeFile(SESSION_FILE, JSON.stringify(session), 'utf8');
    })
    .catch(error => {
      console.warn('Failed to save session', error);
    });
  return pendingWrite;
};

export const clearAuthSession = async () => {
  try {
    if (await RNFS.exists(SESSION_FILE)) {
      await RNFS.unlink(SESSION_FILE);
    }
  } catch (error) {
    console.warn('Failed to clear saved session', error);
  }
};
