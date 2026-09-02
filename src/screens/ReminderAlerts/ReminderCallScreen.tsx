import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
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
import { stopReminderAlert } from '../../services/buddyNotifications';
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

type Props = NativeStackScreenProps<AppStackParamList, 'ReminderCall'>;
type CallStatus = 'incoming' | 'connecting' | 'connected' | 'ending';

const APP_ICON = require('../../assets/images/app-icon.png');

const formatElapsed = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const ReminderCallScreen = ({ navigation, route }: Props) => {
  const { reminderId, title, message, autoAnswer } = route.params;
  const { showToast } = useToast();
  const [status, setStatus] = useState<CallStatus>(
    autoAnswer ? 'connecting' : 'incoming',
  );
  const [elapsed, setElapsed] = useState(0);
  const [busy, setBusy] = useState(false);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1400,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  useEffect(() => {
    if (status !== 'connected') {
      return;
    }
    const timer = setInterval(() => {
      setElapsed(value => value + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [status]);

  useEffect(() => {
    if (!autoAnswer) {
      return;
    }

    let cancelled = false;
    const connect = async () => {
      try {
        await stopReminderAlert(reminderId);
      } catch (error) {
        console.warn('Failed to stop incoming ringtone', error);
      }
      if (cancelled) {
        return;
      }
      setTimeout(() => {
        if (!cancelled) {
          setStatus('connected');
        }
      }, 700);
    };
    void connect();
    return () => {
      cancelled = true;
    };
  }, [autoAnswer]);

  const statusLabel = useMemo(() => {
    if (status === 'connecting') {
      return 'Connecting to Buddy…';
    }
    if (status === 'connected') {
      return 'Connected';
    }
    if (status === 'ending') {
      return 'Ending call…';
    }
    return 'Incoming reminder call';
  }, [status]);

  const closeScreen = async () => {
    if (busy) {
      return;
    }
    setBusy(true);
    setStatus('ending');
    try {
      await stopReminderAlert(reminderId);
    } catch (error) {
      showToast({
        message: 'Call closed, but the ringtone may still be stopping.',
        type: 'error',
      });
    } finally {
      setBusy(false);
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    }
  };

  const handleAnswer = async () => {
    if (busy) {
      return;
    }
    setBusy(true);
    setStatus('connecting');
    try {
      await stopReminderAlert(reminderId);
      setStatus('connected');
    } catch (error) {
      showToast({
        message: 'Could not start the call. Please try again.',
        type: 'error',
      });
      setStatus('incoming');
    } finally {
      setBusy(false);
    }
  };

  const ringScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.18],
  });
  const ringOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0],
  });

  return (
    <LinearGradient
      colors={['#1E1B4B', '#312E81', '#4338CA']}
      style={styles.root}
    >
      <StatusBar barStyle="light-content" backgroundColor="#1E1B4B" />
      <SafeAreaView style={styles.safe}>
        <Text style={styles.kicker}>{statusLabel}</Text>

        <View style={styles.hero}>
          <Animated.View
            style={[
              styles.pulse,
              { opacity: ringOpacity, transform: [{ scale: ringScale }] },
            ]}
          />
          <View style={styles.avatarWrap}>
            <Image source={APP_ICON} style={styles.avatar} />
          </View>
          <Text style={styles.title} numberOfLines={2}>
            {title || 'Buddy'}
          </Text>
          {message ? (
            <Text style={styles.message} numberOfLines={3}>
              {message}
            </Text>
          ) : null}
          {status === 'connected' ? (
            <Text style={styles.timer}>{formatElapsed(elapsed)}</Text>
          ) : null}
          {(status === 'connecting' || status === 'ending') && (
            <ActivityIndicator
              color={colors.white}
              style={styles.loader}
            />
          )}
        </View>

        {status === 'incoming' ? (
          <View style={styles.actions}>
            <Pressable
              onPress={closeScreen}
              disabled={busy}
              style={({ pressed }) => [
                styles.roundButton,
                styles.rejectButton,
                pressed && styles.pressed,
                busy && styles.disabled,
              ]}
            >
              <Text style={styles.roundLabel}>Reject</Text>
            </Pressable>
            <Pressable
              onPress={handleAnswer}
              disabled={busy}
              style={({ pressed }) => [
                styles.roundButton,
                styles.answerButton,
                pressed && styles.pressed,
                busy && styles.disabled,
              ]}
            >
              <Text style={styles.roundLabel}>Answer</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={closeScreen}
            disabled={busy}
            style={({ pressed }) => [
              styles.endButton,
              pressed && styles.pressed,
              busy && styles.disabled,
            ]}
          >
            {busy && status === 'ending' ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.endLabel}>End call</Text>
            )}
          </Pressable>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

export default ReminderCallScreen;

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
  kicker: {
    marginTop: mvs(18),
    textAlign: 'center',
    color: '#C7D2FE',
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  hero: {
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  pulse: {
    position: 'absolute',
    width: ms(220),
    height: ms(220),
    borderRadius: ms(110),
    backgroundColor: '#A5B4FC',
  },
  avatarWrap: {
    width: ms(108),
    height: ms(108),
    borderRadius: ms(36),
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#C7D2FE',
    marginBottom: spacing['4xl'],
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  title: {
    color: colors.white,
    fontSize: fontSize['5xl'],
    fontWeight: fontWeight.extrabold,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  message: {
    marginTop: spacing.xl,
    color: '#E0E7FF',
    fontSize: fontSize.lg,
    lineHeight: ms(22),
    textAlign: 'center',
    fontWeight: fontWeight.medium,
  },
  timer: {
    marginTop: spacing['3xl'],
    color: colors.white,
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
    letterSpacing: 1.4,
  },
  loader: {
    marginTop: spacing['3xl'],
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingBottom: mvs(12),
  },
  roundButton: {
    width: ms(92),
    height: ms(92),
    borderRadius: ms(46),
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButton: {
    backgroundColor: '#DC2626',
  },
  answerButton: {
    backgroundColor: '#059669',
  },
  roundLabel: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  endButton: {
    height: layout.buttonHeight,
    borderRadius: radii.lg,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  endLabel: {
    color: colors.white,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  pressed: {
    opacity: 0.86,
  },
  disabled: {
    opacity: 0.6,
  },
});
