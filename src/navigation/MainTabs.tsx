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
  ReminderIcon,
  ProfileIcon,
  TaskIcons,
  AIChatIcons,
} from '../../styles/icons';
import Notes from '../screens/NotesScreen/Note';
import TaskScreen from '../screens/TasksScreen/TaskScreen';
import ProfileScreen from '../screens/ProfileScreen/ProfileScreen';
import BuddyScreen from '../screens/BuddyScreen/BuddyScreen';

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

  const scale = progress.interpolate({
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
            transform: [{ scale }, { translateY }],
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
            width={26}
            height={26}
            color={isFocused ? '#3563FF' : '#7E8795'}
          />
        </View>

        <Animated.Text
          style={[
            styles.label,
            {
              opacity: labelOpacity,
              color: isFocused ? '#3563FF' : '#7E8795',
              fontWeight: isFocused ? '700' : '600',
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

  if (currentRoute.name === 'AI') {
    return null;
  }

  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;

        const config =
          TAB_CONFIG.find(tab => tab.name === route.name) || TAB_CONFIG[0];

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
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Notes" component={Notes} />
      <Tab.Screen name="AI" component={BuddyScreen} />
      <Tab.Screen name="Tasks" component={TaskScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />

    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: Platform.OS === 'ios' ? 24 : 16,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    shadowColor: '#162B75',
    shadowOffset: {
      width: 0,
      height: 10,
    },

    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 24,
  },

  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  itemContainer: {
    width: 68,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },

  pill: {
    position: 'absolute',
    top: 2,
    width: 58,
    height: 42,
    borderRadius: 16,
    backgroundColor: '#EEF3FF',
  },

  iconArea: {
    width: 58,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  label: {
    fontSize: 12,
    letterSpacing: 0.2,
    marginTop: 3,
    textAlign: 'center',
    includeFontPadding: false,
    color: '#1E293B',
    fontWeight: '600',
  },
});

export default MainTabs;
