import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  BackHandler,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MicIcon } from '../../../../styles/icons';
import {
  colors,
  fontSize,
  fontWeight,
  ms,
  radii,
  spacing,
} from '../../../theme';

type OverlayPhase =
  | 'idle'
  | 'speaking'
  | 'listening'
  | 'thinking'
  | 'saving'
  | 'error';

type Props = {
  visible: boolean;
  phase?: OverlayPhase;
  statusText?: string;
  hintText?: string;
  errorText?: string;
  onStop: () => void;
  onRetry?: () => void;
};

const WAVE_BARS = [12, 22, 34, 18, 40, 24, 30, 16];

const CheckIcon = ({ color = colors.white }: { color?: string }) => (
  <Svg width={ms(22)} height={ms(22)} viewBox="0 0 24 24" fill="none">
    <Path
      d="m5 12 5 5L19 7"
      stroke={color}
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const WaveBar = ({
  baseHeight,
  delay,
  active,
}: {
  baseHeight: number;
  delay: number;
  active: boolean;
}) => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) {
      progress.stopAnimation();
      progress.setValue(0);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: 420 + delay,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 420 + delay,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();

    return () => loop.stop();
  }, [active, delay, progress]);

  const scaleY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 1],
  });

  return (
    <Animated.View
      style={[
        styles.waveBar,
        {
          height: ms(baseHeight),
          transform: [{ scaleY }],
        },
      ]}
    />
  );
};

const ReminderListeningOverlay = ({
  visible,
  phase = 'listening',
  statusText = 'Listening…',
  hintText = 'Speak your reminder. Tap cut to stop.',
  errorText = '',
  onStop,
  onRetry,
}: Props) => {
  const insets = useSafeAreaInsets();
  const overlay = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const content = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      overlay.setValue(0);
      content.setValue(0);
      glow.setValue(0);

      Animated.parallel([
        Animated.timing(overlay, {
          toValue: 1,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(content, {
          toValue: 1,
          damping: 18,
          stiffness: 180,
          mass: 0.85,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(glow, {
              toValue: 1,
              duration: 1600,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(glow, {
              toValue: 0,
              duration: 1600,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
        ),
      ]).start();

      return;
    }

    if (!mounted) {
      return;
    }

    Animated.parallel([
      Animated.timing(overlay, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(content, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        glow.stopAnimation();
        setMounted(false);
      }
    });
  }, [content, glow, mounted, overlay, visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (phase === 'saving') {
          return true;
        }
        onStop();
        return true;
      },
    );

    return () => subscription.remove();
  }, [onStop, phase, visible]);

  const glowScale = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  const glowOpacity = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.55, 0.9],
  });

  const contentTranslate = content.interpolate({
    inputRange: [0, 1],
    outputRange: [ms(28), 0],
  });

  const contentScale = content.interpolate({
    inputRange: [0, 1],
    outputRange: [0.94, 1],
  });

  const waveBars = useMemo(() => WAVE_BARS, []);
  const isBusy = phase === 'thinking' || phase === 'saving';
  const canDismiss = phase !== 'saving';
  const label =
    statusText ||
    (phase === 'speaking'
      ? 'Buddy is speaking'
      : phase === 'thinking'
        ? 'Understanding…'
        : phase === 'saving'
          ? 'Saving reminder…'
          : phase === 'error'
            ? 'Something went wrong'
            : 'Listening…');

  if (!mounted) {
    return null;
  }

  return (
    <View style={styles.root} pointerEvents="box-none">
        <Animated.View style={[styles.blurLayer, { opacity: overlay }]}>
          <LinearGradient
            colors={[
              'rgba(255,248,240,0.35)',
              'rgba(236,245,255,0.4)',
              'rgba(243,238,255,0.45)',
            ]}
            locations={[0, 0.55, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.frost} />
        </Animated.View>

        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={canDismiss ? onStop : undefined}
        />

        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.content,
            {
              opacity: content,
              paddingBottom: insets.bottom + spacing['4xl'],
              transform: [
                { translateY: contentTranslate },
                { scale: contentScale },
              ],
            },
          ]}
        >
          <View style={styles.centerStage}>
            <Animated.View
              style={[
                styles.glowOuter,
                {
                  opacity: glowOpacity,
                  transform: [{ scale: glowScale }],
                },
              ]}
            />
            <View style={styles.glowInner} />
            <View style={styles.micWrap}>
              {isBusy ? (
                <ActivityIndicator size="small" color={colors.text} />
              ) : (
                <MicIcon width={ms(28)} height={ms(28)} color={colors.text} />
              )}
            </View>
          </View>

          <Text style={styles.listeningLabel}>{label}</Text>
          <Text style={styles.listeningHint}>{hintText}</Text>
          {phase === 'error' && errorText ? (
            <Text style={styles.errorText}>{errorText}</Text>
          ) : null}
          {phase === 'error' && onRetry ? (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.retryButton}
              onPress={onRetry}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          ) : null}

          <View style={styles.bottomControls}>
            <View style={styles.sideSpacer} />

            <View style={styles.waveWrap}>
              {waveBars.map((height, index) => (
                <WaveBar
                  key={`wave-${index}`}
                  baseHeight={height}
                  delay={index * 35}
                  active={visible && phase === 'listening'}
                />
              ))}
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.stopButton,
                phase === 'saving' && styles.stopButtonDisabled,
              ]}
              onPress={canDismiss ? onStop : undefined}
              disabled={!canDismiss}
              accessibilityRole="button"
              accessibilityLabel="Done"
            >
              <CheckIcon />
            </TouchableOpacity>
          </View>
        </Animated.View>
    </View>
  );
};

export default ReminderListeningOverlay;

const styles = StyleSheet.create({
  root: {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },

  blurLayer: {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },

  frost: {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  content: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: spacing['3xl'],
  },

  centerStage: {
    width: ms(220),
    height: ms(220),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['3xl'],
  },

  glowOuter: {
    position: 'absolute',
    width: ms(210),
    height: ms(210),
    borderRadius: ms(105),
    backgroundColor: 'rgba(255,255,255,0.72)',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: ms(36),
    elevation: 0,
  },

  glowInner: {
    position: 'absolute',
    width: ms(132),
    height: ms(132),
    borderRadius: ms(66),
    backgroundColor: 'rgba(255,255,255,0.92)',
  },

  micWrap: {
    width: ms(64),
    height: ms(64),
    borderRadius: ms(32),
    alignItems: 'center',
    justifyContent: 'center',
  },

  listeningLabel: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.3,
    marginBottom: spacing.sm,
  },

  listeningHint: {
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
  },

  errorText: {
    color: colors.errorDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xl,
  },

  retryButton: {
    marginBottom: spacing['4xl'],
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },

  retryText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },

  bottomControls: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },

  sideSpacer: {
    width: ms(52),
    height: ms(52),
  },

  waveWrap: {
    flex: 1,
    height: ms(48),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ms(4),
    paddingHorizontal: spacing.xl,
  },

  waveBar: {
    width: ms(3.5),
    borderRadius: ms(2),
    backgroundColor: colors.text,
  },

  stopButton: {
    width: ms(52),
    height: ms(52),
    borderRadius: ms(26),
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },

  stopButtonDisabled: {
    opacity: 0.4,
  },
});
