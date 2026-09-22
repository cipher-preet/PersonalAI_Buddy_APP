import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import {
  colors,
  fontSize,
  fontWeight,
  layout,
  ms,
  mvs,
  radii,
  spacing,
} from '../../../theme';

export type BriefingEmptyVariant =
  | 'loading'
  | 'signedOut'
  | 'error'
  | 'missing'
  | 'preparing'
  | 'skipped'
  | 'failed';

type Props = {
  variant: BriefingEmptyVariant;
  onRetry?: () => void;
  onStartChat?: () => void;
  /** TEMPORARY test hook */
  onForceGenerate?: () => void;
  forceGenerating?: boolean;
};

const SparkleIcon = ({
  color = colors.primary,
  size = 22,
}: {
  color?: string;
  size?: number;
}) => (
  <Svg width={ms(size)} height={ms(size)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3.8c.7 4.1 2.4 5.8 6.5 6.5-4.1.7-5.8 2.4-6.5 6.5-.7-4.1-2.4-5.8-6.5-6.5C9.6 9.6 11.3 7.9 12 3.8Z"
      stroke={color}
      strokeWidth={1.7}
      strokeLinejoin="round"
    />
  </Svg>
);

const copy: Record<
  Exclude<BriefingEmptyVariant, 'loading'>,
  { title: string; body: string; retry?: string; chat?: string }
> = {
  signedOut: {
    title: 'Sign in to see your briefing',
    body: 'Buddy prepares a private daily briefing from your conversations, tasks, notes, and meetings.',
  },
  error: {
    title: 'Couldn’t load your briefing',
    body: 'Check your connection, then try again.',
    retry: 'Retry',
  },
  missing: {
    title: 'No briefing yet',
    body: 'Buddy prepares your daily briefing after your local day ends — from conversations, tasks, notes, and meetings.',
    retry: 'Refresh',
    chat: 'Start a chat',
  },
  preparing: {
    title: 'Buddy is preparing your briefing',
    body: 'This usually finishes a few minutes after midnight. You can wait here or pull to refresh.',
    retry: 'Refresh',
  },
  skipped: {
    title: 'A quiet day',
    body: 'Buddy didn’t find conversations, tasks, or meetings to brief you on. Capture something today and tomorrow’s briefing will be ready.',
    chat: 'Start a chat',
  },
  failed: {
    title: 'Briefing isn’t ready',
    body: 'Buddy couldn’t finish this briefing. Try again in a bit, or capture a bit more context today.',
    retry: 'Try again',
    chat: 'Start a chat',
  },
};

const BriefingEmptyState = ({
  variant,
  onRetry,
  onStartChat,
  onForceGenerate,
  forceGenerating,
}: Props) => {
  if (variant === 'loading') {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.loadingText}>Loading your briefing…</Text>
      </View>
    );
  }

  const content = copy[variant];

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <SparkleIcon size={22} />
      </View>
      <Text style={styles.title}>{content.title}</Text>
      <Text style={styles.body}>{content.body}</Text>

      <View style={styles.actions}>
        {content.retry && onRetry ? (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.primaryButton}
            onPress={onRetry}
          >
            <Text style={styles.primaryButtonText}>{content.retry}</Text>
          </TouchableOpacity>
        ) : null}
        {content.chat && onStartChat ? (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.secondaryButton}
            onPress={onStartChat}
          >
            <Text style={styles.secondaryButtonText}>{content.chat}</Text>
          </TouchableOpacity>
        ) : null}
        {onForceGenerate ? (
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.tertiaryButton,
              forceGenerating && styles.buttonDisabled,
            ]}
            onPress={onForceGenerate}
            disabled={forceGenerating}
          >
            {forceGenerating ? (
              <ActivityIndicator color={colors.subText} />
            ) : (
              <Text style={styles.tertiaryButtonText}>
                Generate now
              </Text>
            )}
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

export default BriefingEmptyState;

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xl,
    paddingVertical: spacing['5xl'],
    paddingHorizontal: spacing['3xl'],
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii['2xl'],
    borderWidth: layout.hairline,
    borderColor: colors.border,
  },
  iconWrap: {
    width: ms(56),
    height: ms(56),
    borderRadius: radii.lg,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: mvs(20),
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.text,
    letterSpacing: -0.35,
    lineHeight: ms(26),
    textAlign: 'center',
  },
  body: {
    marginTop: spacing.md,
    fontSize: fontSize.base,
    lineHeight: ms(22),
    fontWeight: fontWeight.medium,
    color: colors.subText,
    textAlign: 'center',
    maxWidth: ms(300),
  },
  loadingText: {
    marginTop: spacing.xl,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.subText,
  },
  actions: {
    marginTop: spacing['3xl'],
    width: '100%',
    gap: spacing.md,
    alignItems: 'center',
  },
  primaryButton: {
    minHeight: ms(48),
    minWidth: ms(160),
    paddingHorizontal: spacing['4xl'],
    borderRadius: radii.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  secondaryButton: {
    minHeight: ms(48),
    minWidth: ms(160),
    paddingHorizontal: spacing['4xl'],
    borderRadius: radii.xl,
    backgroundColor: colors.primarySoft,
    borderWidth: layout.hairline,
    borderColor: colors.brandBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: colors.primaryDark,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  tertiaryButton: {
    minHeight: ms(44),
    minWidth: ms(160),
    paddingHorizontal: spacing['3xl'],
    borderRadius: radii.xl,
    borderWidth: layout.hairline,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tertiaryButtonText: {
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
