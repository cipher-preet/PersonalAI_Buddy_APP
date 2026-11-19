import React, { useCallback, useRef, useState } from 'react';
import {
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

import Notes from '../screens/NotesScreen/Note';
import TaskScreen from '../screens/TasksScreen/TaskScreen';
import ProfileScreen from '../screens/ProfileScreen/ProfileScreen';
import ChatsPhoneScreen from '../screens/PhoneScreens/ChatsPhoneScreen';
import PlansScreen from '../screens/PlansScreen/PlansScreen';
import RemindersScreen from '../screens/RemindersScreen/RemindersScreen';
import BriefingScreen from '../screens/BriefingScreen/BriefingScreen';
import ShareScreen from '../screens/ShareScreen/ShareScreen';
import CalendarScreen from '../screens/CalendarScreen/CalendarScreen';
import GoalMonitorScreen from '../screens/GoalMonitorScreen/GoalMonitorScreen';
import FeedbackScreen from '../screens/FeedbackScreen/FeedbackScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen/HelpSupportScreen';
import GlobalListeningBar from '../components/listening/GlobalListeningBar';
import UpgradePlanPromptModal from '../components/UpgradePlanPromptModal';
import { renderScreenWithBoundary } from '../components/AppErrorBoundary';
import { useSpaceListening } from '../listening/useSpaceListening';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { useAppSelector } from '../store/hooks';
import type { Space } from '../store/api/home';
import EqualMark from './EqualMark';
import SpacesLauncherSheet from './SpacesLauncherSheet';
import {
  colors,
  fontSize,
  fontWeight,
  motion,
  ms,
  spacing,
} from '../theme';

const Tab = createBottomTabNavigator();

const VISIBLE_TABS = [
  { name: 'AI', label: 'Chats' },
  { name: 'Profile', label: 'You' },
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

const ChatTabIcon = ({
  color,
  filled,
}: {
  color: string;
  filled: boolean;
}) => (
  <Svg width={ms(24)} height={ms(24)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5.2 4.75h13.6A2.25 2.25 0 0 1 21.05 7v7.05a2.25 2.25 0 0 1-2.25 2.25H9.35L5.35 19.85a.85.85 0 0 1-1.35-.68V7A2.25 2.25 0 0 1 5.2 4.75Z"
      fill={filled ? color : 'none'}
      stroke={color}
      strokeWidth={filled ? 0 : 1.7}
      strokeLinejoin="round"
    />
  </Svg>
);

const YouAvatar = ({
  name,
  uri,
}: {
  name: string;
  uri: string;
}) => {
  const [failed, setFailed] = useState(false);
  const initial = (name.trim().charAt(0) || 'Y').toUpperCase();
  const showImage = Boolean(uri) && !failed;

  return showImage ? (
    <Image
      source={{ uri }}
      style={styles.avatar}
      onError={() => setFailed(true)}
    />
  ) : (
    <View style={styles.avatarFallback}>
      <Text style={styles.avatarInitial}>{initial}</Text>
    </View>
  );
};

const CustomTabBar = ({
  state,
  navigation,
  onToggleListening,
}: BottomTabBarProps & {
  onToggleListening: (space: Space) => void;
}) => {
  const { tabBarHeight, insets } = useResponsiveLayout();
  const avatar = useAppSelector(store => store.auth.avatar)?.trim() ?? '';
  const name = useAppSelector(store => store.auth.name)?.trim() ?? '';
  const sheetRef = useRef<BottomSheetModal>(null);
  const pendingActionRef = useRef<
    { space: Space; action: 'notes' | 'tasks' | 'listen' } | null
  >(null);
  const currentRoute = state.routes[state.index];
  const bottomInset = Math.max(insets.bottom, spacing.sm);

  const openSpaces = useCallback(() => {
    sheetRef.current?.present();
  }, []);

  const queueSheetAction = useCallback(
    (space: Space, action: 'notes' | 'tasks' | 'listen') => {
      if (action === 'listen') {
        sheetRef.current?.dismiss();
        void onToggleListening(space);
        return;
      }

      pendingActionRef.current = { space, action };
      sheetRef.current?.dismiss();
    },
    [onToggleListening],
  );

  const handleSheetClosed = useCallback(() => {
    const pending = pendingActionRef.current;

    if (!pending) {
      return;
    }

    pendingActionRef.current = null;

    if (pending.action === 'notes') {
      navigation.navigate('Notes', { spaceId: pending.space._id });
      return;
    }

    navigation.navigate('Tasks', { spaceId: pending.space._id });
  }, [navigation]);

  if (HIDDEN_TAB_ROUTES.has(currentRoute.name)) {
    return null;
  }

  return (
    <>
      <View
        pointerEvents="box-none"
        style={[
          styles.dock,
          {
            paddingBottom: bottomInset,
            minHeight: tabBarHeight + bottomInset,
          },
        ]}
      >
        <View style={styles.cluster}>
          <View style={styles.pill}>
            {VISIBLE_TABS.map(tab => {
              const index = state.routes.findIndex(
                route => route.name === tab.name,
              );
              const route = state.routes[index];

              if (!route) {
                return null;
              }

              const isFocused = state.index === index;
              const color = isFocused ? colors.primaryText : colors.equalInactive;

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

              return (
                <TouchableOpacity
                  key={route.key}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isFocused }}
                  accessibilityLabel={tab.label}
                  onPress={onPress}
                  activeOpacity={0.75}
                  style={[styles.tabButton, isFocused && styles.tabButtonActive]}
                >
                  {tab.name === 'AI' ? (
                    <View style={styles.chatIconWrap}>
                      <ChatTabIcon color={color} filled={isFocused} />
                      <View style={styles.chatBadge}>
                        <Text style={styles.chatBadgeText}>2</Text>
                      </View>
                    </View>
                  ) : (
                    <YouAvatar name={name} uri={avatar} />
                  )}
                  <Text style={[styles.label, { color }]} numberOfLines={1}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.greenShadow}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Open spaces"
              activeOpacity={0.88}
              onPress={openSpaces}
              style={styles.greenButton}
            >
              <View style={styles.greenFill}>
                <EqualMark />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <SpacesLauncherSheet
        ref={sheetRef}
        onOpenNotes={space => queueSheetAction(space, 'notes')}
        onOpenTasks={space => queueSheetAction(space, 'tasks')}
        onStartListening={space => queueSheetAction(space, 'listen')}
        onClosed={handleSheetClosed}
      />
    </>
  );
};

const MainTabs = () => {
  const { toggleSpaceListening, upgradePrompt } = useSpaceListening();
  const renderTabBar = useCallback(
    (props: BottomTabBarProps) => (
      <CustomTabBar {...props} onToggleListening={toggleSpaceListening} />
    ),
    [toggleSpaceListening],
  );

  return (
    <View style={styles.shell}>
      <Tab.Navigator
        initialRouteName="AI"
        tabBar={renderTabBar}
        screenLayout={renderScreenWithBoundary}
        backBehavior="history"
        detachInactiveScreens={false}
        screenOptions={{
          headerShown: false,
          lazy: true,
          freezeOnBlur: false,
          animation: 'fade',
          transitionSpec: {
            animation: 'timing',
            config: {
              duration: motion.fadeMs,
              easing: Easing.linear,
            },
          },
        }}
      >
        <Tab.Screen name="Notes" component={Notes} />
        <Tab.Screen name="AI" component={ChatsPhoneScreen} />
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
      <UpgradePlanPromptModal
        visible={upgradePrompt.visible}
        title={upgradePrompt.title}
        message={upgradePrompt.message}
        onClose={upgradePrompt.onClose}
        onUpgrade={upgradePrompt.onUpgrade}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: colors.background,
  },

  dock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },

  cluster: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.md,
    gap: spacing.lg,
  },

  pill: {
    flex: 1,
    height: ms(64),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: ms(32),
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.equalLine,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },

  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
    minHeight: ms(52),
    borderRadius: ms(26),
  },

  tabButtonActive: {
    backgroundColor: colors.primaryLight,
  },

  chatIconWrap: {
    width: ms(24),
    height: ms(24),
  },

  chatBadge: {
    position: 'absolute',
    top: -ms(5),
    right: -ms(8),
    minWidth: ms(16),
    height: ms(16),
    paddingHorizontal: ms(3),
    borderRadius: ms(8),
    backgroundColor: '#E53935',
    borderWidth: 1.5,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  chatBadgeText: {
    color: colors.white,
    fontSize: ms(9),
    fontWeight: fontWeight.bold,
    includeFontPadding: false,
  },

  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.1,
    textAlign: 'center',
    includeFontPadding: false,
  },

  avatar: {
    width: ms(28),
    height: ms(28),
    borderRadius: ms(14),
    backgroundColor: colors.equalGreenSoft,
  },

  avatarFallback: {
    width: ms(28),
    height: ms(28),
    borderRadius: ms(14),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.equalGreenSoft,
  },

  avatarInitial: {
    color: colors.primaryText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    includeFontPadding: false,
  },

  greenShadow: {
    width: ms(64),
    height: ms(64),
    borderRadius: ms(32),
    backgroundColor: colors.primary,
    shadowColor: colors.equalGreenDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 8,
  },

  greenButton: {
    width: ms(64),
    height: ms(64),
    borderRadius: ms(32),
    overflow: 'hidden',
  },

  greenFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
});

export default MainTabs;
