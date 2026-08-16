import React, { useMemo, useRef, useState } from 'react';
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { useToast } from '../../../store/context/ToastContext';
import type { MainTabParamList } from '../../../navigation/types';
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

type IconProps = {
  color?: string;
  size?: number;
};

type QuickAction = {
  id: string;
  title: string;
  accent: string;
  Icon: React.FC<IconProps>;
  onPress: () => void;
};

const ICON_SIZE = ms(24);
const STROKE = 1.7;

const SmartReminderIcon = ({
  color = colors.white,
  size = ICON_SIZE,
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 4a5.5 5.5 0 0 1 5.5 5.5v3l1.2 2.2a.9.9 0 0 1-.8 1.3H6.1a.9.9 0 0 1-.8-1.3l1.2-2.2v-3A5.5 5.5 0 0 1 12 4Z"
      stroke={color}
      strokeWidth={STROKE}
      strokeLinejoin="round"
    />
    <Path
      d="M10.1 19a2 2 0 0 0 3.8 0"
      stroke={color}
      strokeWidth={STROKE}
      strokeLinecap="round"
    />
    <Path
      d="M12 8.5v2l1.5 1"
      stroke={color}
      strokeWidth={STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const DailyBriefingIcon = ({
  color = colors.white,
  size = ICON_SIZE,
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7.2 14.5a4.8 4.8 0 0 1 9.6 0"
      stroke={color}
      strokeWidth={STROKE}
      strokeLinecap="round"
    />
    <Path
      d="M3.5 14.5h17M6.5 18h11M12 4.5v1.8M5.6 7.2l1.3 1.3M18.4 7.2l-1.3 1.3"
      stroke={color}
      strokeWidth={STROKE}
      strokeLinecap="round"
    />
  </Svg>
);

const ShareSpaceIcon = ({
  color = colors.white,
  size = ICON_SIZE,
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={17.5} cy={5.8} r={2.6} stroke={color} strokeWidth={STROKE} />
    <Circle cx={6.2} cy={12} r={2.6} stroke={color} strokeWidth={STROKE} />
    <Circle cx={17.5} cy={18.2} r={2.6} stroke={color} strokeWidth={STROKE} />
    <Path
      d="M8.6 10.7 15.1 7.1M8.6 13.3l6.5 3.6"
      stroke={color}
      strokeWidth={STROKE}
      strokeLinecap="round"
    />
  </Svg>
);

const AICalendarIcon = ({
  color = colors.white,
  size = ICON_SIZE,
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x={3.4}
      y={5.4}
      width={17.2}
      height={15.2}
      rx={3}
      stroke={color}
      strokeWidth={STROKE}
    />
    <Path
      d="M8 3.4v3.2M16 3.4v3.2M3.4 10.2h17.2"
      stroke={color}
      strokeWidth={STROKE}
      strokeLinecap="round"
    />
    <Path
      d="m9.4 15.6 1.4 1.4 3.8-3.8"
      stroke={color}
      strokeWidth={STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const TeamWorkspaceIcon = ({
  color = colors.white,
  size = ICON_SIZE,
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={9.5} cy={8.4} r={3} stroke={color} strokeWidth={STROKE} />
    <Path
      d="M4 19.2c0-3.03 2.46-5.2 5.5-5.2s5.5 2.17 5.5 5.2"
      stroke={color}
      strokeWidth={STROKE}
      strokeLinecap="round"
    />
    <Path
      d="M16.2 5.9a2.6 2.6 0 0 1 0 5.2"
      stroke={color}
      strokeWidth={STROKE}
      strokeLinecap="round"
    />
    <Path
      d="M17.2 14.3c1.7.5 2.9 1.9 2.9 3.9"
      stroke={color}
      strokeWidth={STROKE}
      strokeLinecap="round"
    />
  </Svg>
);

const GoalMonitorIcon = ({
  color = colors.white,
  size = ICON_SIZE,
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={8.2} stroke={color} strokeWidth={STROKE} />
    <Circle cx={12} cy={12} r={4.8} stroke={color} strokeWidth={STROKE} />
    <Circle cx={12} cy={12} r={1.5} fill={color} />
    <Path
      d="M12 3.8v2.2M20.2 12h-2.2M12 20.2v-2.2M3.8 12h2.2"
      stroke={color}
      strokeWidth={STROKE}
      strokeLinecap="round"
    />
  </Svg>
);

const TILE_SIZE = ms(78);
const TILE_GAP = spacing.xl;
const DOT_SIZE = ms(6);
const DOT_ACTIVE_WIDTH = ms(18);

const QuickActionsStrip = () => {
  const navigation =
    useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const { showToast } = useToast();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [viewportWidth, setViewportWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);

  const showComingSoon = (feature: string) => {
    showToast({
      message: `${feature} is coming soon.`,
      type: 'success',
    });
  };

  const actions: QuickAction[] = [
    {
      id: 'smart-reminder',
      title: 'Reminder',
      accent: '#7C3AED',
      Icon: SmartReminderIcon,
      onPress: () => navigation.navigate('Reminders'),
    },
    {
      id: 'daily-briefing',
      title: 'Briefing',
      accent: '#2563EB',
      Icon: DailyBriefingIcon,
      onPress: () => navigation.navigate('Briefing'),
    },
    {
      id: 'ai-calendar',
      title: 'Calendar',
      accent: '#EA580C',
      Icon: AICalendarIcon,
      onPress: () => navigation.navigate('Calendar'),
    },
    {
      id: 'goal-monitor',
      title: 'Goal Monitor',
      accent: '#4338CA',
      Icon: GoalMonitorIcon,
      onPress: () => navigation.navigate('GoalMonitor'),
    },
    {
      id: 'share-space',
      title: 'Share',
      accent: '#0D9488',
      Icon: ShareSpaceIcon,
      onPress: () => navigation.navigate('Share'),
    },
    {
      id: 'team-workspace',
      title: 'Team',
      accent: '#DB2777',
      Icon: TeamWorkspaceIcon,
      onPress: () => showComingSoon('Team Workspace'),
    },
  ];

  const pageCount = useMemo(() => {
    if (!viewportWidth || !contentWidth) {
      return 0;
    }
    const scrollable = Math.max(contentWidth - viewportWidth, 0);
    if (scrollable <= ms(8)) {
      return 0;
    }
    return Math.min(4, Math.max(2, Math.ceil(contentWidth / viewportWidth)));
  }, [contentWidth, viewportWidth]);

  const pageWidth = useMemo(() => {
    if (!viewportWidth || pageCount <= 1) {
      return viewportWidth || 1;
    }
    const scrollable = Math.max(contentWidth - viewportWidth, 1);
    return scrollable / (pageCount - 1);
  }, [contentWidth, pageCount, viewportWidth]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollX.setValue(event.nativeEvent.contentOffset.x);
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled
        scrollEventThrottle={16}
        onLayout={event => setViewportWidth(event.nativeEvent.layout.width)}
        onContentSizeChange={width => setContentWidth(width)}
        onScroll={handleScroll}
      >
        {actions.map(item => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.85}
            style={styles.tile}
            onPress={item.onPress}
            accessibilityRole="button"
            accessibilityLabel={item.title}
          >
            <item.Icon color={item.accent} />

            <Text numberOfLines={1} style={styles.tileLabel}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {pageCount > 1 ? (
        <View style={styles.dotsRow} accessibilityRole="progressbar">
          {Array.from({ length: pageCount }).map((_, index) => {
            const inputRange = [
              (index - 1) * pageWidth,
              index * pageWidth,
              (index + 1) * pageWidth,
            ];

            const width = scrollX.interpolate({
              inputRange,
              outputRange: [DOT_SIZE, DOT_ACTIVE_WIDTH, DOT_SIZE],
              extrapolate: 'clamp',
            });

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.28, 1, 0.28],
              extrapolate: 'clamp',
            });

            const backgroundColor = scrollX.interpolate({
              inputRange,
              outputRange: [colors.borderFocus, colors.primary, colors.borderFocus],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={`quick-dot-${index}`}
                style={[
                  styles.dot,
                  {
                    width,
                    opacity,
                    backgroundColor,
                  },
                ]}
              />
            );
          })}
        </View>
      ) : null}
    </View>
  );
};

export default QuickActionsStrip;

const styles = StyleSheet.create({
  wrapper: {
    marginTop: mvs(14),
    marginHorizontal: -layout.screenPadding,
  },

  scrollContent: {
    paddingHorizontal: layout.screenPadding,
    gap: TILE_GAP,
    paddingVertical: spacing.xs,
  },

  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },

  tileLabel: {
    textAlign: 'center',
    color: colors.text,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: -0.1,
  },

  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    minHeight: ms(10),
  },

  dot: {
    height: DOT_SIZE,
    borderRadius: radii.pill,
  },
});
