import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { AppStackParamList } from '../../navigation/types';
import {
  SNOOZE_MINUTES,
  snoozeReminderAlert,
  stopReminderAlert,
} from '../../services/buddyNotifications';
import { useToast } from '../../store/context/ToastContext';
import {
  colors,
  fontSize,
  fontWeight,
  layout,
  ms,
  mvs,
  radii,
  spacing,
} from '../../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'ReminderAlarm'>;

const formatClock = (date: Date) => {
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes} ${suffix}`;
};

const ReminderAlarmScreen = ({ navigation, route }: Props) => {
  const { reminderId, title, message } = route.params;
  const { showToast } = useToast();
  const [now, setNow] = useState(() => new Date());
  const [stopping, setStopping] = useState(false);
  const [snoozing, setSnoozing] = useState(false);
  const pulse = useRef(new Animated.Value(0)).current;
  const busy = stopping || snoozing;

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 650,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 650,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const clock = useMemo(() => formatClock(now), [now]);

  const close = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleStop = async () => {
    if (busy) {
      return;
    }
    setStopping(true);
    try {
      await stopReminderAlert(reminderId);
      close();
    } catch (error) {
      showToast({
        message: 'Could not stop the alarm. Try again.',
        type: 'error',
      });
    } finally {
      setStopping(false);
    }
  };

  const handleSnooze = async () => {
    if (busy) {
      return;
    }
    setSnoozing(true);
    try {
      await snoozeReminderAlert({
        reminderId,
        title,
        message,
        minutes: SNOOZE_MINUTES,
      });
      showToast({
        message: `Snoozed for ${SNOOZE_MINUTES} minutes`,
        type: 'success',
      });
      close();
    } catch (error) {
      showToast({
        message: 'Could not snooze this alarm. Please try again.',
        type: 'error',
      });
    } finally {
      setSnoozing(false);
    }
  };

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  return (
    <LinearGradient
      colors={['#431407', '#7F1D1D', '#9F1239']}
      style={styles.root}
    >
      <StatusBar barStyle="light-content" backgroundColor="#431407" />
      <SafeAreaView style={styles.safe}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Alarm</Text>
        </View>

        <View style={styles.hero}>
          <Animated.View style={{ transform: [{ scale }] }}>
            <Text style={styles.clock}>{clock}</Text>
          </Animated.View>
          <Text style={styles.title} numberOfLines={2}>
            {title || 'Reminder'}
          </Text>
          {message ? (
            <Text style={styles.message} numberOfLines={3}>
              {message}
            </Text>
          ) : null}
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={handleSnooze}
            disabled={busy}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.pressed,
              busy && styles.disabled,
            ]}
          >
            {snoozing ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.secondaryLabel}>
                Snooze {SNOOZE_MINUTES} min
              </Text>
            )}
          </Pressable>
          <Pressable
            onPress={handleStop}
            disabled={busy}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
              busy && styles.disabled,
            ]}
          >
            {stopping ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.primaryLabel}>Stop</Text>
            )}
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default ReminderAlarmScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safe: {
    flex: 1,
    paddingHorizontal: layout.screenPadding,
    justifyContent: 'space-between',
    paddingBottom: mvs(28),
  },
  badge: {
    alignSelf: 'center',
    marginTop: mvs(18),
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  badgeText: {
    color: '#FECACA',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  hero: {
    alignItems: 'center',
  },
  clock: {
    color: colors.white,
    fontSize: ms(56),
    fontWeight: fontWeight.extrabold,
    letterSpacing: -1,
  },
  title: {
    marginTop: spacing['4xl'],
    color: colors.white,
    fontSize: fontSize['5xl'],
    fontWeight: fontWeight.extrabold,
    textAlign: 'center',
  },
  message: {
    marginTop: spacing.xl,
    color: '#FECACA',
    fontSize: fontSize.lg,
    lineHeight: ms(22),
    textAlign: 'center',
    fontWeight: fontWeight.medium,
  },
  actions: {
    gap: spacing.xl,
  },
  secondaryButton: {
    height: layout.buttonHeight,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  secondaryLabel: {
    color: colors.white,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  primaryButton: {
    height: layout.buttonHeight,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: {
    color: '#9F1239',
    fontSize: fontSize.xl,
    fontWeight: fontWeight.extrabold,
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.62,
  },
});
