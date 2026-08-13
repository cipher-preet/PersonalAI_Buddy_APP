/**
 * App-wide color palette.
 * Use these tokens everywhere — do not hardcode hex in screens.
 */
export const colors = {
  // Surfaces
  background: '#F7F7FB',
  gradientStart: '#F9F7FF',
  gradientMid: '#EFF3FF',
  gradientEnd: '#FFFFFF',
  white: '#FFFFFF',
  inputBg: '#F8FAFC',
  cardBg: '#FFFFFF',
  overlay: 'rgba(99, 102, 241, 0.08)',
  backdrop: 'rgba(15, 23, 42, 0.45)',

  // Brand
  primary: '#4338CA',
  primaryDark: '#3730A3',
  primaryPurple: '#8B5CF6',
  primaryPurpleDark: '#6D28D9',
  primaryLight: '#EEF2FF',
  primarySoft: '#F5F3FF',
  primaryMid: '#7C3AED',
  accent: '#5B5FF8',
  accentCyan: '#15C7E8',
  accentIndigo: '#6366F1',
  brandBorder: '#C7D2FE',
  tabActive: '#4338CA',
  tabInactive: '#7E8795',
  tabPill: '#EEF2FF',

  // Gradients (upgrade CTA, etc.)
  upgradeGradientStart: '#7C3AED',
  upgradeGradientMid: '#6366F1',
  upgradeGradientEnd: '#22D3EE',

  // Text
  text: '#0F172A',
  textSecondary: '#334155',
  subText: '#64748B',
  muted: '#94A3B8',
  black: '#111827',

  // Borders & dividers
  border: '#E2E8F0',
  borderLight: '#E5E7EB',
  borderFocus: '#A5B4FC',
  googleBorder: '#E2E8F0',

  // Status
  error: '#DC2626',
  errorDark: '#B91C1C',
  errorSoft: '#FEF2F2',
  errorSoftBorder: '#FEE2E2',
  success: '#059669',
  successBright: '#22C55E',
  info: '#0992F2',
  infoBright: '#3B82F6',
  online: '#08C7FA',
  warningSoft: '#FEF3C7',
  warningText: '#92400E',
  successSoft: '#DCFCE7',
  successText: '#166534',

  // Shadows
  shadow: '#64748B',
  shadowDeep: '#162B75',
  shadowInk: '#0F172A',

  // Feature aliases (Notes/Tasks legacy keys)
  gray: '#8B8B8B',
  lightGray: '#F3F4F6',
  purpleLight: '#F3E8FF',
  lightPurple: '#EEF2FF',
  icon: '#111827',

  // Chat
  userBubble: '#4338CA',
  aiBubble: '#FFFFFF',
  chipBg: '#FFFFFF',
  chatSeparator: '#ECEFF5',
} as const;

export type AppColors = typeof colors;
