import React from 'react';
import {
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

const WorkspaceIcon = ({
  color = colors.white,
  size = ICON_SIZE,
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x={3.4}
      y={4.4}
      width={17.2}
      height={15.2}
      rx={3}
      stroke={color}
      strokeWidth={STROKE}
    />
    <Path
      d="M3.4 9.2h17.2M9.4 9.2v10.4"
      stroke={color}
      strokeWidth={STROKE}
      strokeLinecap="round"
    />
    <Path
      d="M12.6 13h5M12.6 16h3"
      stroke={color}
      strokeWidth={STROKE}
      strokeLinecap="round"
    />
  </Svg>
);

const TILE_SIZE = ms(78);
const TILE_GAP = spacing.xl;

const QuickActionsStrip = () => {
  const navigation =
    useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const { showToast } = useToast();

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
      id: 'share-space',
      title: 'Share',
      accent: '#0D9488',
      Icon: ShareSpaceIcon,
      onPress: () => navigation.navigate('Share'),
    },
    {
      id: 'ai-calendar',
      title: 'Calendar',
      accent: '#EA580C',
      Icon: AICalendarIcon,
      onPress: () => showComingSoon('AI Calendar'),
    },
    {
      id: 'team-workspace',
      title: 'Team',
      accent: '#DB2777',
      Icon: TeamWorkspaceIcon,
      onPress: () => showComingSoon('Team Workspace'),
    },
    {
      id: 'workspace',
      title: 'Workspace',
      accent: '#4338CA',
      Icon: WorkspaceIcon,
      onPress: () => navigation.navigate('Notes'),
    },
  ];

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled
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
});
