import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { HistoryIcon } from '../../../../styles/icons';
import ChevronRightIcon from '../../../../styles/icons/GreatorThan';
import { COLORS } from '../styles';
import {
  colors,
  fontSize,
  fontWeight,
  layout,
  ms,
  radii,
  spacing,
} from '../../../theme';

type Props = {
  onHistoryPress?: () => void;
};

const Header = ({ onHistoryPress }: Props) => {
  const navigation = useNavigation();

  const handleBack = () => {
    navigation.navigate('Home' as never);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleBack}
        activeOpacity={0.75}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <View style={styles.backIcon}>
          <ChevronRightIcon width={ms(18)} height={ms(18)} color={colors.text} />
        </View>
      </TouchableOpacity>

      <View style={styles.center}>
        <Text style={styles.title}>Buddy AI</Text>
        <Text style={styles.subtitle}>Your personal assistant</Text>
      </View>

      <TouchableOpacity
        style={styles.iconButton}
        activeOpacity={0.75}
        onPress={onHistoryPress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <HistoryIcon width={ms(18)} height={ms(18)} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.9)',
  },

  backButton: {
    width: layout.iconButtonSm,
    height: layout.iconButtonSm,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backIcon: {
    width: ms(36),
    height: ms(36),
    borderRadius: radii.md,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '180deg' }],
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },

  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: COLORS.text,
  },

  subtitle: {
    marginTop: spacing.xxs,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: COLORS.subText,
  },

  iconButton: {
    width: layout.iconButtonSm,
    height: layout.iconButtonSm,
    borderRadius: radii.md,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
