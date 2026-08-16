import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
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

      <TouchableOpacity
        activeOpacity={0.88}
        style={styles.upgradeButton}
        accessibilityRole="button"
        accessibilityLabel="Upgrade plan"
        onPress={() => navigation.navigate('Plans')}
      >
        <LinearGradient
          colors={[
            colors.upgradeGradientStart,
            colors.upgradeGradientMid,
            colors.upgradeGradientEnd,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.upgradeGradient}
        >
          <Text style={styles.upgradeText}>Upgrade</Text>
        </LinearGradient>
      </TouchableOpacity>
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
    paddingRight: spacing.xl,
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

  upgradeButton: {
    borderRadius: radii.pill,
    overflow: 'hidden',
  },

  upgradeGradient: {
    minHeight: layout.chipHeight,
    paddingHorizontal: spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
  },

  upgradeText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.2,
  },
});
