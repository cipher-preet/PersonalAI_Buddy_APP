import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';

import { HistoryIcon } from '../../../../styles/icons';
import { COLORS } from '../styles';
import {
  colors,
  fontSize,
  fontWeight,
  layout,
  ms,
  spacing,
} from '../../../theme';

type Props = {
  onHistoryPress?: () => void;
  showTitle?: boolean;
};

const CloseIcon = ({ color = colors.text }: { color?: string }) => (
  <Svg width={ms(18)} height={ms(18)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6 6 18M6 6l12 12"
      stroke={color}
      strokeWidth={2.1}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Header = ({ onHistoryPress, showTitle = false }: Props) => {
  const navigation = useNavigation();

  const handleClose = () => {
    navigation.navigate('Home' as never);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.iconButton}
        activeOpacity={0.75}
        onPress={onHistoryPress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel="Chat history"
      >
        <HistoryIcon width={ms(20)} height={ms(20)} color={colors.primary} />
      </TouchableOpacity>

      {showTitle ? (
        <View style={styles.center}>
          <Text style={styles.title}>Buddy</Text>
        </View>
      ) : (
        <View style={styles.center} />
      )}

      <TouchableOpacity
        style={styles.iconButton}
        onPress={handleClose}
        activeOpacity={0.75}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel="Close"
      >
        <CloseIcon color={colors.text} />
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
    paddingBottom: spacing.lg,
    backgroundColor: 'transparent',
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },

  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: COLORS.text,
  },

  iconButton: {
    width: layout.iconButtonSm,
    height: layout.iconButtonSm,
    borderRadius: layout.iconButtonSm / 2,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
});
