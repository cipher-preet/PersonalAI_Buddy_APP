import { StyleSheet } from 'react-native';
import {
  colors,
  ms,
  spacing,
  radii,
  fontSize,
  fontWeight,
  shadows,
} from '../../theme';

export const COLORS = {
  background: colors.background,
  gradientStart: colors.gradientStart,
  gradientMid: colors.gradientMid,
  gradientEnd: colors.gradientEnd,
  white: colors.white,
  primary: colors.primary,
  primaryPurple: colors.primaryPurple,
  primaryLight: colors.primaryLight,
  primarySoft: colors.primaryPurple,
  text: colors.text,
  subText: colors.subText,
  muted: colors.muted,
  border: colors.borderLight,
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
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },

  heroCard: {
    marginBottom: spacing['3xl'],
    backgroundColor: COLORS.white,
    borderRadius: radii['2xl'],
    padding: spacing['3xl'],
    borderWidth: 1,
    borderColor: colors.primaryLight,
    ...shadows.card,
  },

  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    marginBottom: spacing.xl,
  },

  heroBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: COLORS.primary,
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: spacing.md,
  },

  emptyTitle: {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.extrabold,
    color: COLORS.text,
    lineHeight: ms(32),
    letterSpacing: -0.4,
  },

  emptySubtitle: {
    marginTop: spacing.md,
    fontSize: fontSize.base,
    lineHeight: ms(22),
    color: COLORS.subText,
  },

  suggestionsTitle: {
    marginTop: ms(22),
    marginBottom: spacing.xl,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: COLORS.text,
  },

  suggestionsWrap: {
    gap: spacing.lg,
  },

  suggestionChip: {
    backgroundColor: COLORS.chipBg,
    borderRadius: radii.lg,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
  },

  suggestionDot: {
    width: ms(8),
    height: ms(8),
    borderRadius: ms(4),
    backgroundColor: COLORS.primaryPurple,
    marginRight: spacing.lg,
  },

  suggestionText: {
    flex: 1,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: COLORS.text,
  },

  dateSeparator: {
    alignSelf: 'center',
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: '#ECEFF5',
  },

  dateSeparatorText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: COLORS.subText,
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

  suggestionChipDisabled: {
    opacity: 0.55,
  },
});
