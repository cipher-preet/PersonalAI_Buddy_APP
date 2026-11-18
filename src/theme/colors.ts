/**
 * Equal AI light-app palette.
 * Fills use brand green #00B140. Small text and icons use #0A7A34 so they
 * clear 4.5:1 on white. Labels on a green fill use #111111 (6.6:1).
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
  overlay: 'rgba(0, 177, 64, 0.10)',
  backdrop: 'rgba(0, 0, 0, 0.45)',

  // Brand aliases kept so older call sites resolve to Equal green
  brandNavy: '#111111',
  brandBlue: '#00B140',
  brandViolet: '#00B140',
  brandPink: '#BAFF29',
  brandYellow: '#CDF146',

  // Brand
  primary: '#00B140',
  primaryDark: '#072A16',
  primaryText: '#0A7A34',
  onPrimary: '#111111',
  primaryPurple: '#00B140',
  primaryPurpleDark: '#072A16',
  primaryLight: '#E8F8EE',
  primarySoft: '#F3FBF5',
  primaryMid: '#00B140',
  accent: '#0A7A34',
  accentCyan: '#00B140',
  accentIndigo: '#0A7A34',
  brandBorder: '#D7F5E1',
  tabActive: '#111111',
  tabInactive: '#5C5C5C',
  tabPill: '#E8F8EE',

  // Equal tokens
  equalGreen: '#00B140',
  equalGreenBright: '#BAFF29',
  equalGreenMid: '#00B140',
  equalGreenDark: '#072A16',
  equalGreenSoft: '#E8F8EE',
  equalInk: '#111111',
  equalMuted: '#5C5C5C',
  equalInactive: '#5C5C5C',
  equalLine: '#E6E6E6',
  mint: '#C3FDDC',
  cream: '#FFF2D4',
  lime: '#BAFF29',

  // Gradients collapse to the one green
  upgradeGradientStart: '#00B140',
  upgradeGradientMid: '#00B140',
  upgradeGradientEnd: '#00B140',

  // Plans — one dark green surface, not a purple stack
  planProStart: '#072A16',
  planProMid: '#0B3D1E',
  planProEnd: '#00B140',
  planBusinessStart: '#111111',
  planBusinessMid: '#1E1E1E',
  planBusinessEnd: '#242424',
  planGold: '#CDF146',
  planGoldSoft: 'rgba(186, 255, 41, 0.16)',
  planGoldBorder: 'rgba(186, 255, 41, 0.28)',
  planGoldBorderStrong: 'rgba(186, 255, 41, 0.40)',
  planInk: '#111111',
  planMutedOnDark: 'rgba(255, 255, 255, 0.72)',
  planChipOnDark: 'rgba(255, 255, 255, 0.08)',
  planSaveOnDark: '#BAFF29',
  planSaveOnDarkSoft: '#E6FF94',
  planSavePillActive: 'rgba(186, 255, 41, 0.18)',
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
  borderFocus: '#00B140',
  googleBorder: '#E6E6E6',

  // Status
  error: '#C50000',
  errorDark: '#8E0000',
  errorSoft: '#FFF1F1',
  errorSoftBorder: '#F5C2C2',
  success: '#0A7A34',
  successBright: '#00B140',
  info: '#111111',
  infoBright: '#242424',
  online: '#00B140',
  warningSoft: '#FFF2D4',
  warningText: '#6A4B00',
  successSoft: '#E8F8EE',
  successText: '#072A16',

  // Shadows
  shadow: '#000000',
  shadowDeep: '#072A16',
  shadowInk: '#111111',

  // Feature aliases
  gray: '#5C5C5C',
  lightGray: '#F0F0F0',
  purpleLight: '#E8F8EE',
  lightPurple: '#E8F8EE',
  icon: '#111111',

  // Chat
  userBubble: '#E8F8EE',
  aiBubble: '#FFFFFF',
  chipBg: '#FFFFFF',
  chatSeparator: '#E6E6E6',
} as const;

export type AppColors = typeof colors;
