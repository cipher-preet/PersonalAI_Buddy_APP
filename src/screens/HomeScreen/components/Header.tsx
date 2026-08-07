import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useAppSelector } from '../../../store/hooks';
import {
  colors,
  fontSize,
  fontWeight,
  layout,
  ms,
  radii,
  shadows,
  spacing,
} from '../../../theme';

type TabParamList = {
  Home: undefined;
  Notes: undefined;
  Tasks: undefined;
  AI: undefined;
  Profile: undefined;
  Plans: undefined;
};

const PlanPurchaseIcon = () => (
  <Svg width={ms(20)} height={ms(20)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8 7.5 10.2 4l2.2 3.5L16 5.8l-1.2 5.7H5.2L4 5.8l3.6 1.7Z"
      stroke={colors.primary}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Rect
      x={4}
      y={13}
      width={16}
      height={7}
      rx={2}
      stroke={colors.primary}
      strokeWidth={1.8}
    />
    <Path d="M4 16h16" stroke={colors.primary} strokeWidth={1.8} />
  </Svg>
);

const Header = () => {
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const name = useAppSelector(state => state.auth.name);
  const displayName = name?.trim() || 'Buddy User';
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        <View style={styles.greetingWrapper}>
          <Text style={styles.greetingText}>{greeting}</Text>

          <Text style={styles.wave}>👋</Text>

          <View style={styles.onlineDot} />
        </View>

        <Text numberOfLines={1} style={styles.userName}>
          {displayName}
        </Text>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.notificationButton}
          accessibilityRole="button"
          accessibilityLabel="Open plans and payment"
          onPress={() => navigation.navigate('Plans')}
        >
          <PlanPurchaseIcon />
        </TouchableOpacity>

        {/* <TouchableOpacity activeOpacity={0.85} style={styles.settingsButton}>
          <PlanPurchaseIcon />
        </TouchableOpacity> */}
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  leftContainer: {
    flex: 1,
  },

  greetingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  greetingText: {
    fontSize: fontSize.md,
    color: colors.subText,
    fontWeight: fontWeight.medium,
    letterSpacing: 0.3,
  },

  wave: {
    marginLeft: ms(5),
    fontSize: fontSize.md,
  },

  onlineDot: {
    width: ms(6),
    height: ms(6),
    borderRadius: radii.pill,
    backgroundColor: colors.online,
    marginLeft: spacing.md,
  },

  userName: {
    marginTop: ms(7),
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.text,
    letterSpacing: -0.6,
  },

  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  notificationButton: {
    width: layout.iconButton,
    height: layout.iconButton,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },

  settingsButton: {
    width: layout.iconButton,
    height: layout.iconButton,
    borderRadius: radii.pill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    ...shadows.primary,
  },
});
