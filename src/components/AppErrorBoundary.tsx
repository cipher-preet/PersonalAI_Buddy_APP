import React, { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, fontSize, fontWeight, ms, radii, spacing } from '../theme';
import { reportError } from '../utils/crashHandler';

type Props = {
  children: ReactNode;
  /** `screen` keeps the tab bar usable; `app` fills the whole window. */
  variant?: 'app' | 'screen';
};

type State = {
  error: Error | null;
};

/**
 * Catches render-time errors so a single broken component shows a recovery
 * card instead of closing the app. Fallback uses only plain RN primitives
 * because the failing subtree may include navigation or store providers.
 */
class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportError(error, {
      source: 'render',
      componentStack: info.componentStack ?? undefined,
    });
  }

  private handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    const { children, variant = 'screen' } = this.props;

    if (!error) {
      return children;
    }

    return (
      <View
        style={[styles.container, variant === 'app' && styles.containerApp]}
      >
        <View style={styles.iconWrap}>
          <Text style={styles.iconText}>!</Text>
        </View>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>
          This section hit an unexpected problem. Your data is safe — try
          again to reload it.
        </Text>
        {__DEV__ ? (
          <Text style={styles.devDetails} numberOfLines={6}>
            {error.message}
          </Text>
        ) : null}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.button}
          onPress={this.handleRetry}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

export default AppErrorBoundary;

/** Pass to a navigator's `screenLayout` so each screen fails in isolation. */
export const renderScreenWithBoundary = ({
  children,
}: {
  children: ReactNode;
}) => <AppErrorBoundary>{children}</AppErrorBoundary>;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['4xl'],
    paddingBottom: ms(80),
    backgroundColor: colors.background,
  },

  containerApp: {
    paddingBottom: 0,
  },

  iconWrap: {
    width: ms(56),
    height: ms(56),
    borderRadius: ms(28),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.errorSoft,
    borderWidth: 1,
    borderColor: colors.errorSoftBorder,
    marginBottom: spacing['2xl'],
  },

  iconText: {
    color: colors.error,
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.extrabold,
  },

  title: {
    color: colors.text,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },

  message: {
    marginTop: spacing.md,
    color: colors.subText,
    fontSize: fontSize.base,
    lineHeight: ms(20),
    textAlign: 'center',
  },

  devDetails: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radii.xs,
    backgroundColor: colors.lightGray,
    color: colors.errorDark,
    fontSize: fontSize.xs,
    alignSelf: 'stretch',
  },

  button: {
    marginTop: spacing['3xl'],
    minHeight: ms(46),
    paddingHorizontal: spacing['5xl'],
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },

  buttonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
});
