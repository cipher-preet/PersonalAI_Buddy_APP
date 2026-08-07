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
import { AUTH_COLORS } from '../styles/colors';
import { layout, ms, mvs } from '../../../theme';

type Props = {
  children: React.ReactNode;
  contentStyle?: ViewStyle;
  scrollable?: boolean;
};

const AuthLayout = ({ children, contentStyle, scrollable = false }: Props) => {
  const body = scrollable ? (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[styles.scrollContent, contentStyle]}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, contentStyle]}>{children}</View>
  );

  return (
    <LinearGradient
      colors={[
        AUTH_COLORS.gradientStart,
        AUTH_COLORS.gradientMid,
        AUTH_COLORS.gradientEnd,
      ]}
      locations={[0, 0.4, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.orbTop} />
      <View style={styles.orbBottom} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {body}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default AuthLayout;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
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

  orbTop: {
    position: 'absolute',
    top: mvs(-60),
    right: ms(-40),
    width: ms(220),
    height: ms(220),
    borderRadius: ms(110),
    backgroundColor: AUTH_COLORS.overlay,
  },

  orbBottom: {
    position: 'absolute',
    bottom: mvs(80),
    left: ms(-80),
    width: ms(200),
    height: ms(200),
    borderRadius: ms(100),
    backgroundColor: 'rgba(139, 92, 246, 0.06)',
  },
});
