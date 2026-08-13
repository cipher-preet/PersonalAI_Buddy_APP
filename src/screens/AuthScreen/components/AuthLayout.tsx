import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, layout, mvs } from '../../../theme';

type Props = {
  children: React.ReactNode;
  contentStyle?: ViewStyle;
  scrollable?: boolean;
  /** Pure white auth background (login-style). */
  variant?: 'gradient' | 'white';
};

const AuthLayout = ({
  children,
  contentStyle,
  scrollable = false,
  variant = 'gradient',
}: Props) => {
  const body = scrollable ? (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      nestedScrollEnabled
      contentContainerStyle={[styles.scrollContent, contentStyle]}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, contentStyle]}>{children}</View>
  );

  const content = (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {body}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  if (variant === 'white') {
    return <View style={styles.whiteRoot}>{content}</View>;
  }

  return (
    <LinearGradient
      colors={[
        colors.gradientStart,
        colors.gradientMid,
        colors.gradientEnd,
      ]}
      locations={[0, 0.4, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      {content}
    </LinearGradient>
  );
};

export default AuthLayout;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },

  whiteRoot: {
    flex: 1,
    backgroundColor: colors.white,
  },

  flex: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  content: {
    flex: 1,
    paddingHorizontal: layout.screenPadding,
    paddingTop: mvs(8),
    paddingBottom: mvs(24),
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: layout.screenPadding,
    paddingTop: mvs(8),
    paddingBottom: mvs(32),
  },
});
