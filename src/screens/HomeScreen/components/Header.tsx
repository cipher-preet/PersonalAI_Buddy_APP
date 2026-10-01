import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useAppSelector } from '../../../store/hooks';
import BrandLogo from '../../../components/BrandLogo';
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

const GREETING_LINE = ms(16);
const NAME_LINE = ms(20);
const BLOCK_HEIGHT = ms(38);

const Header = () => {
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const name = useAppSelector(state => state.auth.name);
  const displayName = name?.trim() || 'Buddy User';
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <View style={styles.container}>
      <View style={styles.identity}>
        <BrandLogo size={BLOCK_HEIGHT} style={styles.logo} />
        <View style={styles.textBlock}>
          <View style={styles.greetingRow}>
            <Text numberOfLines={1} style={styles.greetingText}>
              {greeting}
            </Text>
            <View style={styles.onlineDot} />
          </View>

          <Text numberOfLines={1} style={styles.userName}>
            {displayName}
          </Text>
        </View>
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

  identity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: BLOCK_HEIGHT,
    paddingRight: spacing.xl,
  },

  logo: {
    marginRight: spacing.md,
  },

  textBlock: {
    flex: 1,
    height: BLOCK_HEIGHT,
    justifyContent: 'space-between',
  },

  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: GREETING_LINE,
  },

  greetingText: {
    fontSize: fontSize.sm,
    lineHeight: GREETING_LINE,
    color: colors.subText,
    fontWeight: fontWeight.medium,
    letterSpacing: 0.2,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },

  onlineDot: {
    width: ms(6),
    height: ms(6),
    borderRadius: radii.pill,
    backgroundColor: colors.online,
    marginLeft: spacing.sm,
  },

  userName: {
    height: NAME_LINE,
    lineHeight: NAME_LINE,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    letterSpacing: -0.2,
    includeFontPadding: false,
    textAlignVertical: 'center',
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
