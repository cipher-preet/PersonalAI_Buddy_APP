import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';

import {
  colors,
  fontSize,
  fontWeight,
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
        <Text style={styles.body}>Loading your briefing…</Text>
      </View>
    );
  }

  const content = copy[variant];

  return (
    <View style={styles.container}>
      <View style={styles.iconRing}>
        <View style={styles.iconInner}>
          <SparkleIcon size={22} />
        </View>
      </View>
      <Text style={styles.title}>{content.title}</Text>
      <Text style={styles.body}>{content.body}</Text>
      {content.retry && onRetry ? (
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.retryButton}
          onPress={onRetry}
        >
          <Text style={styles.retryText}>{content.retry}</Text>
        </TouchableOpacity>
      ) : null}
      {content.chat && onStartChat ? (
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.chatWrap}
          onPress={onStartChat}
        >
          <LinearGradient
            colors={[colors.primaryPurple, colors.primaryPurpleDark, colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.chatButton}
          >
            <Text style={styles.chatText}>{content.chat}</Text>
          </LinearGradient>
        </TouchableOpacity>
      ) : null}
      {onForceGenerate ? (
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.forceButton, forceGenerating && styles.forceButtonDisabled]}
          onPress={onForceGenerate}
          disabled={forceGenerating}
        >
          {forceGenerating ? (
            <ActivityIndicator color={colors.primaryDark} />
          ) : (
            <Text style={styles.forceText}>Generate now (test)</Text>
          )}
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default BriefingEmptyState;

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
    paddingVertical: spacing['4xl'],
    paddingHorizontal: spacing['3xl'],
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii['3xl'],
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.primaryLight,
    borderStyle: 'dashed',
  },
  iconRing: {
    width: ms(72),
    height: ms(72),
    borderRadius: ms(36),
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: mvs(18),
  },
  iconInner: {
    width: ms(52),
    height: ms(52),
    borderRadius: ms(18),
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.extrabold,
    color: colors.text,
    letterSpacing: -0.3,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  body: {
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
    lineHeight: ms(20),
    fontWeight: fontWeight.medium,
    color: colors.subText,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
  retryButton: {
    marginTop: spacing['2xl'],
    minHeight: ms(44),
    paddingHorizontal: spacing['3xl'],
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  chatWrap: {
    marginTop: spacing.md,
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  chatButton: {
    minHeight: ms(44),
    paddingHorizontal: spacing['3xl'],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
  },
  chatText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  forceButton: {
    marginTop: spacing.xl,
    minHeight: ms(44),
    paddingHorizontal: spacing['3xl'],
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.brandBorder,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  forceButtonDisabled: {
    opacity: 0.7,
  },
  forceText: {
    color: colors.primaryDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
});
