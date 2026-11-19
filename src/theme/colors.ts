/**
 * KukuNotes logo palette.
 * The mark is navy, violet, and blue. Fills use #7C3AED so white labels
 * clear 4.5:1. Small violet text uses #5B21B6.
 */
export const colors = {
  // Surfaces
  background: '#F7F7F7',
  gradientStart: '#F7F7F7',
  gradientMid: '#FFFFFF',
  gradientEnd: '#F7F7F7',
  white: '#FFFFFF',
  inputBg: '#F5F5F5',
  cardBg: '#FFFFFF',
  sheet: '#F7F7F7',
  searchField: '#F0F0F0',
  overlay: 'rgba(124, 58, 237, 0.10)',
  backdrop: 'rgba(0, 0, 0, 0.45)',

  // Logo colors
  brandNavy: '#0F1D62',
  brandBlue: '#1D6DFD',
  brandViolet: '#AD57FE',
  brandPink: '#F386C5',
  brandYellow: '#FEE5A0',

  // Brand
  primary: '#7C3AED',
  primaryDark: '#0F1D62',
  primaryText: '#5B21B6',
  onPrimary: '#FFFFFF',
  primaryPurple: '#7C3AED',
  primaryPurpleDark: '#0F1D62',
  primaryLight: '#F4EEFF',
  primarySoft: '#F8F5FF',
  primaryMid: '#AD57FE',
  accent: '#5B21B6',
  accentCyan: '#1D6DFD',
  accentIndigo: '#5B21B6',
  brandBorder: '#E4D8FF',
  tabActive: '#111111',
  tabInactive: '#5C5C5C',
  tabPill: '#F4EEFF',

  // Older names now point at the logo violet
  equalGreen: '#7C3AED',
  equalGreenBright: '#AD57FE',
  equalGreenMid: '#7C3AED',
  equalGreenDark: '#0F1D62',
  equalGreenSoft: '#F4EEFF',
  equalInk: '#111111',
  equalMuted: '#5C5C5C',
  equalInactive: '#5C5C5C',
  equalLine: '#E6E6E6',
  mint: '#DDD0FF',
  cream: '#FFF2D4',
  lime: '#AD57FE',

  upgradeGradientStart: '#0F1D62',
  upgradeGradientMid: '#7C3AED',
  upgradeGradientEnd: '#AD57FE',

  planProStart: '#0F1D62',
  planProMid: '#4C1D95',
  planProEnd: '#7C3AED',
  planBusinessStart: '#111111',
  planBusinessMid: '#1E1E1E',
  planBusinessEnd: '#242424',
  planGold: '#AD57FE',
  planGoldSoft: 'rgba(173, 87, 254, 0.16)',
  planGoldBorder: 'rgba(173, 87, 254, 0.28)',
  planGoldBorderStrong: 'rgba(173, 87, 254, 0.40)',
  planInk: '#111111',
  planMutedOnDark: 'rgba(255, 255, 255, 0.72)',
  planChipOnDark: 'rgba(255, 255, 255, 0.08)',
  planSaveOnDark: '#E4D4FF',
  planSaveOnDarkSoft: '#F4EEFF',
  planSavePillActive: 'rgba(173, 87, 254, 0.18)',
  planChipOnLight: 'rgba(255, 255, 255, 0.16)',

  // Text
  text: '#111111',
  textSecondary: '#242424',
  subText: '#5C5C5C',
  muted: '#5C5C5C',
  black: '#111111',

  // Borders & dividers
  border: '#E6E6E6',
  borderLight: '#F0F0F0',
  borderFocus: '#7C3AED',
  googleBorder: '#E6E6E6',

  // Status
  error: '#C50000',
  errorDark: '#8E0000',
  errorSoft: '#FFF1F1',
  errorSoftBorder: '#F5C2C2',
  success: '#5B21B6',
  successBright: '#7C3AED',
  info: '#1D6DFD',
  infoBright: '#1E4ED8',
  online: '#7C3AED',
  warningSoft: '#FFF2D4',
  warningText: '#6A4B00',
  successSoft: '#F4EEFF',
  successText: '#3B1578',

  // Shadows
  shadow: '#000000',
  shadowDeep: '#0F1D62',
  shadowInk: '#111111',

  // Feature aliases
  gray: '#5C5C5C',
  lightGray: '#F0F0F0',
  purpleLight: '#F4EEFF',
  lightPurple: '#F4EEFF',
  icon: '#111111',

  // Chat
  userBubble: '#F4EEFF',
  aiBubble: '#FFFFFF',
  chipBg: '#FFFFFF',
  chatSeparator: '#E6E6E6',
} as const;

export type AppColors = typeof colors;
