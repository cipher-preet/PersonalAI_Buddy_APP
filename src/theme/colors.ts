/**
 * App-wide color palette.
 * Use these tokens everywhere — do not hardcode hex in screens.
 */
export const colors = {
  // Surfaces
  background: '#FFFFFF',
  gradientStart: '#F4F0FF',
  gradientMid: '#FBFAFF',
  gradientEnd: '#FFF8F1',
  white: '#FFFFFF',
  inputBg: '#F8F7FD',
  cardBg: '#FFFFFF',
  overlay: 'rgba(91, 61, 245, 0.08)',
  backdrop: 'rgba(11, 21, 70, 0.45)',

  // KukuNotes logo palette
  brandNavy: '#0B1546',
  brandBlue: '#2F80FF',
  brandViolet: '#9B5CF6',
  brandPink: '#F472B6',
  brandYellow: '#FBBF24',

  // Brand
  primary: '#5B3DF5',
  primaryDark: '#4527D9',
  primaryPurple: '#9B5CF6',
  primaryPurpleDark: '#7C3AED',
  primaryLight: '#F0EDFF',
  primarySoft: '#F7F4FF',
  primaryMid: '#8B5CF6',
  accent: '#2F80FF',
  accentCyan: '#22C3F0',
  accentIndigo: '#6A5CFF',
  brandBorder: '#D9D0FF',
  tabActive: '#5B3DF5',
  tabInactive: '#475569',
  tabPill: '#F0EDFF',

  // Gradients (upgrade CTA, etc.)
  upgradeGradientStart: '#2F80FF',
  upgradeGradientMid: '#9B5CF6',
  upgradeGradientEnd: '#F472B6',

  // Plans
  planProStart: '#0B1546',
  planProMid: '#1E2380',
  planProEnd: '#5B3DF5',
  planBusinessStart: '#0B1220',
  planBusinessMid: '#111827',
  planBusinessEnd: '#1E293B',
  planGold: '#E8C36A',
  planGoldSoft: 'rgba(232, 195, 106, 0.16)',
  planGoldBorder: 'rgba(232, 195, 106, 0.28)',
  planGoldBorderStrong: 'rgba(232, 195, 106, 0.35)',
  planInk: '#0B1220',
  planMutedOnDark: 'rgba(226, 232, 240, 0.72)',
  planChipOnDark: 'rgba(255, 255, 255, 0.08)',
  planSaveOnDark: '#86EFAC',
  planSaveOnDarkSoft: '#BBF7D0',
  planSavePillActive: 'rgba(134, 239, 172, 0.18)',
  planChipOnLight: 'rgba(255, 255, 255, 0.16)',

  // Text
  text: '#0F172A',
  textSecondary: '#334155',
  subText: '#64748B',
  muted: '#94A3B8',
  black: '#111827',

  // Borders & dividers
  border: '#E2E8F0',
  borderLight: '#E5E7EB',
  borderFocus: '#B9A8FF',
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
  shadowDeep: '#1B1A6E',
  shadowInk: '#0F172A',

  // Feature aliases (Notes/Tasks legacy keys)
  gray: '#8B8B8B',
  lightGray: '#F3F4F6',
  purpleLight: '#F3E8FF',
  lightPurple: '#F0EDFF',
  icon: '#111827',

  // Chat
  userBubble: '#5B3DF5',
  aiBubble: '#FFFFFF',
  chipBg: '#FFFFFF',
  chatSeparator: '#ECEFF5',
} as const;

export type AppColors = typeof colors;
