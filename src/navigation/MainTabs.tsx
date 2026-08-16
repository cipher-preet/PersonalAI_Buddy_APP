import React, { useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Animated,
  Platform,
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
import {
  colors,
  fontSize,
  fontWeight,
  layout,
  ms,
  mvs,
  radii,
  shadows,
  spacing,
} from '../theme';

const Tab = createBottomTabNavigator();

type TabItemProps = {
  isFocused: boolean;
  Icon: React.ElementType;
  label: string;
  onPress: () => void;
  onLongPress: () => void;
  accessibilityState: { selected: boolean };
};

const TabItem = ({
  isFocused,
  Icon,
  label,
  onPress,
  onLongPress,
  accessibilityState,
}: TabItemProps) => {
  const progress = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  const prevFocused = useRef(isFocused);

  if (prevFocused.current !== isFocused) {
    prevFocused.current = isFocused;

    Animated.spring(progress, {
      toValue: isFocused ? 1 : 0,
      useNativeDriver: true,
      tension: 260,
      friction: 16,
    }).start();
  }

  const animScale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.88, 1],
  });

  const pillOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const pillScale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.75, 1],
  });

  const labelOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.75, 1],
  });

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 0],
  });

  const activeColor = colors.tabActive;
  const inactiveColor = colors.tabInactive;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={accessibilityState}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.85}
      style={styles.tabButton}
    >
      <Animated.View
        style={[
          styles.itemContainer,
          {
            transform: [{ scale: animScale }, { translateY }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.pill,
            {
              opacity: pillOpacity,
              transform: [{ scaleX: pillScale }],
            },
          ]}
        />

        <View style={styles.iconArea}>
          <Icon
            width={ms(26)}
            height={ms(26)}
            color={isFocused ? activeColor : inactiveColor}
          />
        </View>

        <Animated.Text
          style={[
            styles.label,
            {
              opacity: labelOpacity,
              color: isFocused ? activeColor : inactiveColor,
              fontWeight: isFocused ? fontWeight.bold : fontWeight.semibold,
            },
          ]}
        >
          {label}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

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
    name: 'Tasks',
    Icon: TaskIcons,
    label: 'Tasks',
  },
  {
    name: 'AI',
    Icon: AIChatIcons,
    label: 'Buddy',
  },
  {
    name: 'Profile',
    Icon: ProfileIcon,
    label: 'Profile',
  },
];

const CustomTabBar = ({ state, navigation }: BottomTabBarProps) => {
  const currentRoute = state.routes[state.index];

  if (
    currentRoute.name === 'AI' ||
    currentRoute.name === 'Plans' ||
    currentRoute.name === 'Reminders' ||
    currentRoute.name === 'Briefing' ||
    currentRoute.name === 'Share' ||
    currentRoute.name === 'Calendar' ||
    currentRoute.name === 'GoalMonitor'
  ) {
    return null;
  }

  return (
    <View style={styles.tabBar}>
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
            accessibilityState={{
              selected: isFocused,
            }}
          />
        );
      })}
    </View>
  );
};

const MainTabs = () => {
  return (
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
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: spacing['2xl'],
    right: spacing['2xl'],
    bottom: Platform.OS === 'ios' ? mvs(24) : mvs(16),
    height: layout.tabBarHeight,
    backgroundColor: colors.white,
    borderRadius: radii.tabBar,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    borderWidth: layout.hairline,
    borderColor: colors.border,
    ...shadows.soft,
  },

  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  itemContainer: {
    width: ms(68),
    height: ms(64),
    alignItems: 'center',
    justifyContent: 'center',
  },

  pill: {
    position: 'absolute',
    top: ms(2),
    width: ms(58),
    height: ms(42),
    borderRadius: radii.lg,
    backgroundColor: colors.tabPill,
  },

  iconArea: {
    width: ms(58),
    height: ms(40),
    alignItems: 'center',
    justifyContent: 'center',
  },

  label: {
    fontSize: fontSize.sm,
    letterSpacing: 0.2,
    marginTop: ms(3),
    textAlign: 'center',
    includeFontPadding: false,
    color: colors.text,
    fontWeight: fontWeight.semibold,
  },
});

export default MainTabs;
