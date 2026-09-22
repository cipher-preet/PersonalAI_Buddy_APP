import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useListening } from '../../store/context/ListeningContext';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { formatClock } from '../../utils/planUsage';
import {
  colors,
  fontSize,
  fontWeight,
  listeningWaveCount,
  ms,
  radii,
  spacing,
} from '../../theme';

const WAVE_COUNT = listeningWaveCount;
const SLIDE_DISTANCE = ms(90);
const BANNER_VISIBLE_MS = 3200;
const BAR_ESTIMATED_HEIGHT = ms(60);
const EDGE_PAD = spacing.md;

const MicIcon = () => (
  <Svg width={ms(16)} height={ms(16)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z"
      stroke={colors.primary}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    <Path
      d="M5 11a7 7 0 0 0 14 0M12 18v3"
      stroke={colors.primary}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

const WaveBar = ({
  index,
  active,
}: {
  index: number;
  active: boolean;
}) => {
  const anim = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    if (!active) {
      anim.setValue(0.25);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 420 + (index % 5) * 70,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0.22,
          duration: 420 + ((index + 2) % 5) * 70,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    const delay = setTimeout(() => loop.start(), index * 40);
    return () => {
      clearTimeout(delay);
      loop.stop();
    };
  }, [active, anim, index]);

  const scaleY = anim.interpolate({
    inputRange: [0.22, 1],
    outputRange: [0.28, 1],
  });

  return (
    <Animated.View
      style={[
        styles.waveBar,
        {
          opacity: active ? 0.85 : 0.35,
          transform: [{ scaleY }],
        },
      ]}
    />
  );
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

/**
 * Full-width listening bar that can be dragged anywhere on screen.
 */
const GlobalListeningBar = () => {
  const { isActive, spaceName, startedAt, requestStop } = useListening();
  const { tabBarHeight, insets } = useResponsiveLayout();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [nowTs, setNowTs] = useState(Date.now());
  const [rendered, setRendered] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const bannerOpacity = useRef(new Animated.Value(0)).current;
  const bannerTranslate = useRef(new Animated.Value(8)).current;
  const dragX = useRef(new Animated.Value(0)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const wasActiveRef = useRef(false);

  const defaultBottom = tabBarHeight + Math.max(insets.bottom, spacing.sm);

  const dragBounds = useMemo(() => {
    const minY = -(
      screenHeight -
      defaultBottom -
      BAR_ESTIMATED_HEIGHT -
      insets.top -
      EDGE_PAD
    );
    const maxY = EDGE_PAD;
    const maxX = screenWidth * 0.35;
    const minX = -maxX;
    return { minX, maxX, minY, maxY };
  }, [defaultBottom, insets.top, screenHeight, screenWidth]);

  const resetDrag = () => {
    dragOffsetRef.current = { x: 0, y: 0 };
    dragX.setValue(0);
    dragY.setValue(0);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_evt, gesture) =>
          Math.abs(gesture.dx) > 6 || Math.abs(gesture.dy) > 6,
        onMoveShouldSetPanResponderCapture: (_evt, gesture) =>
          Math.abs(gesture.dx) > 6 || Math.abs(gesture.dy) > 6,
        onPanResponderGrant: () => {
          dragX.stopAnimation();
          dragY.stopAnimation();
          dragX.setOffset(dragOffsetRef.current.x);
          dragY.setOffset(dragOffsetRef.current.y);
          dragX.setValue(0);
          dragY.setValue(0);
        },
        onPanResponderMove: (_evt, gesture) => {
          const nextX = clamp(
            dragOffsetRef.current.x + gesture.dx,
            dragBounds.minX,
            dragBounds.maxX,
          );
          const nextY = clamp(
            dragOffsetRef.current.y + gesture.dy,
            dragBounds.minY,
            dragBounds.maxY,
          );
          dragX.setValue(nextX - dragOffsetRef.current.x);
          dragY.setValue(nextY - dragOffsetRef.current.y);
        },
        onPanResponderRelease: (_evt, gesture) => {
          const nextX = clamp(
            dragOffsetRef.current.x + gesture.dx,
            dragBounds.minX,
            dragBounds.maxX,
          );
          const nextY = clamp(
            dragOffsetRef.current.y + gesture.dy,
            dragBounds.minY,
            dragBounds.maxY,
          );
          dragOffsetRef.current = { x: nextX, y: nextY };
          dragX.setOffset(0);
          dragY.setOffset(0);
          dragX.setValue(nextX);
          dragY.setValue(nextY);
        },
        onPanResponderTerminate: (_evt, gesture) => {
          const nextX = clamp(
            dragOffsetRef.current.x + gesture.dx,
            dragBounds.minX,
            dragBounds.maxX,
          );
          const nextY = clamp(
            dragOffsetRef.current.y + gesture.dy,
            dragBounds.minY,
            dragBounds.maxY,
          );
          dragOffsetRef.current = { x: nextX, y: nextY };
          dragX.setOffset(0);
          dragY.setOffset(0);
          dragX.setValue(nextX);
          dragY.setValue(nextY);
        },
      }),
    [dragBounds, dragX, dragY],
  );

  useEffect(() => {
    if (isActive) {
      wasActiveRef.current = true;
      setRendered(true);
      setStopping(false);
      setShowBanner(true);
      resetDrag();
      Animated.spring(progress, {
        toValue: 1,
        useNativeDriver: true,
        tension: 120,
        friction: 14,
      }).start();

      bannerOpacity.setValue(0);
      bannerTranslate.setValue(8);
      Animated.parallel([
        Animated.timing(bannerOpacity, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(bannerTranslate, {
          toValue: 0,
          useNativeDriver: true,
          tension: 140,
          friction: 16,
        }),
      ]).start();

      const hideBanner = setTimeout(() => {
        Animated.parallel([
          Animated.timing(bannerOpacity, {
            toValue: 0,
            duration: 240,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(bannerTranslate, {
            toValue: -6,
            duration: 240,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start(({ finished }) => {
          if (finished) {
            setShowBanner(false);
          }
        });
      }, BANNER_VISIBLE_MS);

      return () => clearTimeout(hideBanner);
    }

    if (!wasActiveRef.current) {
      return;
    }

    wasActiveRef.current = false;
    Animated.timing(progress, {
      toValue: 0,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setRendered(false);
        setStopping(false);
        setShowBanner(false);
        resetDrag();
      }
    });
  }, [bannerOpacity, bannerTranslate, isActive, progress]);

  useEffect(() => {
    if (!isActive || !startedAt) {
      return;
    }

    setNowTs(Date.now());
    const id = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isActive, startedAt]);

  const elapsedMs = useMemo(() => {
    if (!startedAt) {
      return 0;
    }
    return Math.max(0, nowTs - startedAt);
  }, [nowTs, startedAt]);

  const handleStop = () => {
    if (stopping) {
      return;
    }
    setStopping(true);
    requestStop();
  };

  if (!rendered) {
    return null;
  }

  const enterTranslateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [SLIDE_DISTANCE, 0],
  });

  const opacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const combinedTranslateY = Animated.add(enterTranslateY, dragY);

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.layer,
        {
          bottom: defaultBottom,
          opacity,
          transform: [
            { translateX: dragX },
            { translateY: combinedTranslateY },
          ],
        },
      ]}
    >
      {showBanner ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.banner,
            {
              opacity: bannerOpacity,
              transform: [{ translateY: bannerTranslate }],
            },
          ]}
        >
          <View style={styles.bannerDot} />
          <Text style={styles.bannerText} numberOfLines={1}>
            Buddy is listening in {spaceName}
          </Text>
        </Animated.View>
      ) : null}

      <View style={styles.bar} accessibilityRole="summary">
        <View style={styles.dragHandle} {...panResponder.panHandlers}>
          <View style={styles.dragPill} />
        </View>

        <View style={styles.row} {...panResponder.panHandlers}>
          <View style={styles.micBadge}>
            <MicIcon />
          </View>

          <View style={styles.waveCluster}>
            {Array.from({ length: WAVE_COUNT }).map((_, index) => (
              <WaveBar key={`wave-${index}`} index={index} active={isActive} />
            ))}
          </View>

          <Text style={styles.spaceLabel} numberOfLines={1}>
            {spaceName}
          </Text>

          <Text style={styles.timer}>{formatClock(elapsedMs)}</Text>

          <TouchableOpacity
            style={[styles.stopButton, stopping && styles.stopButtonDisabled]}
            activeOpacity={0.85}
            onPress={handleStop}
            disabled={stopping}
            accessibilityRole="button"
            accessibilityLabel="Stop listening"
          >
            <Text style={styles.stopText}>
              {stopping ? 'Stopping…' : 'Stop'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

export default GlobalListeningBar;

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    zIndex: 40,
    gap: spacing.sm,
  },

  banner: {
    alignSelf: 'center',
    maxWidth: '92%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderWidth: 1,
    borderColor: colors.brandBorder,
  },

  bannerDot: {
    width: ms(8),
    height: ms(8),
    borderRadius: ms(4),
    backgroundColor: colors.accentCyan,
  },

  bannerText: {
    flexShrink: 1,
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  bar: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: radii['3xl'],
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    paddingTop: spacing.xs,
  },

  dragHandle: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },

  dragPill: {
    width: ms(36),
    height: ms(4),
    borderRadius: radii.pill,
    backgroundColor: colors.border,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: ms(44),
  },

  micBadge: {
    width: ms(32),
    height: ms(32),
    borderRadius: ms(16),
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  waveCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ms(22),
    gap: ms(2.5),
  },

  waveBar: {
    width: ms(2.5),
    height: ms(18),
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },

  spaceLabel: {
    flex: 1,
    minWidth: 0,
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  timer: {
    minWidth: ms(52),
    textAlign: 'right',
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    fontVariant: ['tabular-nums'],
  },

  stopButton: {
    minHeight: ms(34),
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    backgroundColor: '#FFF1F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  stopButtonDisabled: {
    opacity: 0.65,
  },

  stopText: {
    color: '#B42318',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
});
