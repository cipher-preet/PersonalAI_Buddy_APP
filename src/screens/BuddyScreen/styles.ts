import { StyleSheet } from 'react-native';
import {
  colors,
  spacing,
  radii,
  fontSize,
  fontWeight,
  layout,
} from '../../theme';

/** Desktop Buddy chat tokens (BuddyDesktopApp) — tuned for mobile density. */
export const CHAT = {
  surface: '#FFFFFF',
  surfaceMuted: '#F6F8FC',
  primary: '#1355FF',
  primaryHover: '#0C46E8',
  primarySoft: '#EDF2FF',
  text: '#101828',
  textMuted: '#64748B',
  textSoft: '#94A3B8',
  border: '#E2E8F0',
  borderStrong: '#E2E8F0',
  black: '#0F172A',
  typingDot: '#98A2B3',
} as const;

/** @deprecated Prefer importing `colors` / `CHAT` directly. */
export const COLORS = {
  background: CHAT.surface,
  gradientStart: CHAT.surface,
  gradientMid: CHAT.surface,
  gradientEnd: CHAT.surface,
  white: CHAT.surface,
  primary: CHAT.primary,
  primaryPurple: colors.primaryPurple,
  primaryLight: CHAT.primarySoft,
  primarySoft: CHAT.primarySoft,
  text: CHAT.text,
  subText: CHAT.textMuted,
  muted: CHAT.textSoft,
  border: CHAT.border,
  userBubble: CHAT.surfaceMuted,
  aiBubble: CHAT.surface,
  inputBg: CHAT.surface,
  chipBg: CHAT.surface,
};

export const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    backgroundColor: CHAT.surface,
  },

  container: {
    flex: 1,
    backgroundColor: CHAT.surface,
  },

  chatArea: {
    flex: 1,
  },

  listWrap: {
    flex: 1,
    position: 'relative',
  },

  inputBar: {
    backgroundColor: CHAT.surface,
  },

  listContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    flexGrow: 1,
    gap: spacing.lg,
  },

  dateSeparator: {
    alignSelf: 'center',
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
    borderRadius: radii.pill,
    backgroundColor: CHAT.surfaceMuted,
  },

  dateSeparatorText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: CHAT.textMuted,
  },

  loadingFooter: {
    paddingTop: spacing.md,
    alignItems: 'center',
  },

  typingFooter: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
});
