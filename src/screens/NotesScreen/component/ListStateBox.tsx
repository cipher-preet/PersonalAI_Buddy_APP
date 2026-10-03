import React, { memo } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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

type Props =
  | { variant: 'loading'; message: string }
  | { variant: 'error'; message: string; onRetry: () => void }
  | { variant: 'empty'; title: string; message?: string };

const ListStateBox = (props: Props) => (
  <View style={styles.box}>
    {props.variant === 'loading' ? (
      <>
        <ActivityIndicator size="small" color={colors.primaryDark} />
        <Text style={styles.text}>{props.message}</Text>
      </>
    ) : props.variant === 'error' ? (
      <>
        <Text style={styles.errorText}>{props.message}</Text>
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.retryButton}
          onPress={props.onRetry}
          accessibilityRole="button"
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </>
    ) : (
      <>
        <Text style={styles.emptyTitle}>{props.title}</Text>
        {props.message ? <Text style={styles.text}>{props.message}</Text> : null}
      </>
    )}
  </View>
);

export default memo(ListStateBox);

type LoadMoreProps = {
  summary: string;
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMoreError?: boolean;
  onLoadMore: () => void;
};

export const LoadMoreFooter = memo(
  ({ summary, hasMore, isLoadingMore, loadMoreError, onLoadMore }: LoadMoreProps) => (
    <View style={styles.footer}>
      <Text style={styles.footerText}>{summary}</Text>
      {loadMoreError ? (
        <Text style={styles.footerError}>Couldn't load more. Tap to retry.</Text>
      ) : null}
      {hasMore ? (
        <View style={styles.loadMoreWrap}>
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={isLoadingMore}
            style={[styles.loadMoreButton, isLoadingMore && styles.loadMoreDisabled]}
            onPress={onLoadMore}
            accessibilityRole="button"
          >
            {isLoadingMore ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={styles.loadMoreText}>
                {loadMoreError ? 'Retry' : 'Load more'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  ),
);

LoadMoreFooter.displayName = 'LoadMoreFooter';

const styles = StyleSheet.create({
  box: {
    minHeight: mvs(120),
    marginBottom: spacing.lg,
    paddingHorizontal: spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },

  text: {
    marginTop: spacing.sm,
    color: colors.gray,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },

  emptyTitle: {
    color: colors.black,
    fontSize: fontSize.base,
    fontWeight: fontWeight.extrabold,
  },

  errorText: {
    color: colors.errorDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },

  retryButton: {
    marginTop: spacing.lg,
    paddingHorizontal: ms(14),
    paddingVertical: ms(7),
    borderRadius: radii.pill,
    backgroundColor: colors.purpleLight,
  },

  retryText: {
    color: colors.primaryDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.extrabold,
  },

  footer: {
    marginTop: spacing.lg,
    marginBottom: mvs(24),
  },

  footerText: {
    marginBottom: spacing.sm,
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },

  footerError: {
    marginBottom: spacing.sm,
    color: colors.errorDark,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },

  loadMoreWrap: {
    alignItems: 'center',
  },

  loadMoreButton: {
    minHeight: ms(36),
    paddingHorizontal: layout.screenPadding,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },

  loadMoreDisabled: {
    opacity: 0.7,
  },

  loadMoreText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
});
