import { StyleSheet } from 'react-native';
import {
  colors,
  ms,
  spacing,
  radii,
  fontSize,
  fontWeight,
  layout,
} from '../../theme';

/** @deprecated Prefer importing `colors` from `src/theme` directly. */
export const COLORS = {
  background: colors.background,
  gradientStart: colors.gradientStart,
  gradientMid: colors.gradientMid,
  gradientEnd: colors.gradientEnd,
  white: colors.white,
  primary: colors.primary,
  primaryPurple: colors.primaryPurple,
  primaryLight: colors.primaryLight,
  primarySoft: colors.primarySoft,
  text: colors.text,
  subText: colors.subText,
  muted: colors.muted,
  border: colors.border,
  userBubble: colors.userBubble,
  aiBubble: colors.aiBubble,
  inputBg: colors.white,
  chipBg: colors.chipBg,
};

export const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },

  container: {
    flex: 1,
  },

  chatArea: {
    flex: 1,
  },

  listWrap: {
    flex: 1,
    position: 'relative',
  },

  inputBar: {
    backgroundColor: 'transparent',
  },

  listContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },

  dateSeparator: {
    alignSelf: 'center',
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.chatSeparator,
  },

  dateSeparatorText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.subText,
    letterSpacing: 0.2,
  },

  loadingFooter: {
    paddingTop: spacing.xl,
    alignItems: 'center',
  },

  typingFooter: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
});
