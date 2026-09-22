import React, { memo, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Animated,
  Text,
} from 'react-native';

import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';

import Home from '../screens/HomeScreen/Home';
import {
  HomeIcon,
  NotesIcon,
  ProfileIcon,
  TaskIcons,
  AIChatIcons,
} from '../../styles/icons';
import Notes from '../screens/NotesScreen/Note';
import TaskScreen from '../screens/TasksScreen/TaskScreen';
import ProfileScreen from '../screens/ProfileScreen/ProfileScreen';
import BuddyScreen from '../screens/BuddyScreen/BuddyScreen';
import PlansScreen from '../screens/PlansScreen/PlansScreen';
import RemindersScreen from '../screens/RemindersScreen/RemindersScreen';
import BriefingScreen from '../screens/BriefingScreen/BriefingScreen';
import ShareScreen from '../screens/ShareScreen/ShareScreen';
import CalendarScreen from '../screens/CalendarScreen/CalendarScreen';
import GoalMonitorScreen from '../screens/GoalMonitorScreen/GoalMonitorScreen';
import FeedbackScreen from '../screens/FeedbackScreen/FeedbackScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen/HelpSupportScreen';
import GlobalListeningBar from '../components/listening/GlobalListeningBar';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import {
  colors,
  fontSize,
  fontWeight,
  ms,
  spacing,
} from '../theme';

const Tab = createBottomTabNavigator();

const ACTIVE_COLOR = colors.text;
const INACTIVE_COLOR = colors.muted;

type TabItemProps = {
  isFocused: boolean;
  Icon: React.ElementType;
  label: string;
  onPress: () => void;
  onLongPress: () => void;
  accessibilityState: { selected: boolean };
};

const TabItem = memo(
  ({
    isFocused,
    Icon,
    label,
    onPress,
    onLongPress,
    accessibilityState,
  }: TabItemProps) => {
    const progress = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

    useEffect(() => {
      Animated.spring(progress, {
        toValue: isFocused ? 1 : 0,
        useNativeDriver: true,
        tension: 280,
        friction: 18,
      }).start();
    }, [isFocused, progress]);

    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.04],
    });

    const color = isFocused ? ACTIVE_COLOR : INACTIVE_COLOR;

    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={accessibilityState}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.75}
        style={styles.tabButton}
      >
        <Animated.View style={[styles.itemContainer, { transform: [{ scale }] }]}>
          <Icon width={ms(24)} height={ms(24)} color={color} />
          <Text
            style={[
              styles.label,
              {
                color,
                fontWeight: isFocused ? fontWeight.semibold : fontWeight.medium,
              },
            ]}
            numberOfLines={1}
          >
            {label}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    );
  },
);

const TAB_CONFIG = [
  {
    name: 'Home',
    Icon: HomeIcon,
    label: 'Home',
  },
  {
    name: 'Notes',
    Icon: NotesIcon,
    label: 'Notes',
  },
  {
    name: 'AI',
    Icon: AIChatIcons,
    label: 'Buddy',
  },
  {
    name: 'Tasks',
    Icon: TaskIcons,
    label: 'Tasks',
  },
  {
    name: 'Profile',
    Icon: ProfileIcon,
    label: 'Account',
  },
] as const;

const HIDDEN_TAB_ROUTES = new Set([
  'Plans',
  'Reminders',
  'Briefing',
  'Share',
  'Calendar',
  'GoalMonitor',
  'Feedback',
  'HelpSupport',
]);

const CustomTabBar = ({ state, navigation }: BottomTabBarProps) => {
  const { tabBarHeight, insets } = useResponsiveLayout();
  const currentRoute = state.routes[state.index];

  if (HIDDEN_TAB_ROUTES.has(currentRoute.name)) {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.tabBar,
        {
          paddingBottom: Math.max(insets.bottom, spacing.sm),
          minHeight: tabBarHeight + Math.max(insets.bottom, spacing.sm),
        },
      ]}
    >
      <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          const config = TAB_CONFIG.find(tab => tab.name === route.name);

          if (!config) {
            return null;
          }

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TabItem
              key={route.key}
              isFocused={isFocused}
              Icon={config.Icon}
              label={config.label}
              onPress={onPress}
              onLongPress={onLongPress}
              accessibilityState={{ selected: isFocused }}
            />
          );
        })}
      </View>
    </View>
  );
};

const MainTabs = () => {
  return (
    <View style={styles.shell}>
      <Tab.Navigator
        initialRouteName="Home"
        tabBar={props => <CustomTabBar {...props} />}
        detachInactiveScreens
        screenOptions={{
          headerShown: false,
          lazy: true,
          freezeOnBlur: true,
        }}
      >
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen name="Notes" component={Notes} />
        <Tab.Screen name="AI" component={BuddyScreen} />
        <Tab.Screen name="Tasks" component={TaskScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
        <Tab.Screen name="Plans" component={PlansScreen} />
        <Tab.Screen name="Reminders" component={RemindersScreen} />
        <Tab.Screen name="Briefing" component={BriefingScreen} />
        <Tab.Screen name="Share" component={ShareScreen} />
        <Tab.Screen name="Calendar" component={CalendarScreen} />
        <Tab.Screen name="GoalMonitor" component={GoalMonitorScreen} />
        <Tab.Screen name="Feedback" component={FeedbackScreen} />
        <Tab.Screen name="HelpSupport" component={HelpSupportScreen} />
      </Tab.Navigator>
      <GlobalListeningBar />
    </View>
  );
};

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: colors.background,
  },

  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },

  tabRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.md,
    minHeight: ms(64),
  },

  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.xs,
  },

  itemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },

  label: {
    fontSize: fontSize.xs,
    letterSpacing: 0.1,
    textAlign: 'center',
    includeFontPadding: false,
  },
});

export default MainTabs;
