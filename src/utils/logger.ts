/**
 * Dev-only logger — no-ops in production to keep the JS thread free on low-end devices.
 */
export const devLog = (...args: unknown[]) => {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
};

export const devWarn = (...args: unknown[]) => {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.warn(...args);
  }
};
