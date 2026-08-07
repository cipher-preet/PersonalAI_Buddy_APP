import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ChevronRightIcon from '../../../../styles/icons/GreatorThan';
import { AUTH_COLORS } from '../styles/colors';
import {
  fontSize,
  fontWeight,
  layout,
  ms,
  radii,
  spacing,
} from '../../../theme';

type Props = {
  title?: string;
  onBack: () => void;
};

const AuthHeaderBar = ({ title = 'Verification', onBack }: Props) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.side}
        onPress={onBack}
        activeOpacity={0.75}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <View style={styles.backIcon}>
          <ChevronRightIcon
            width={ms(18)}
            height={ms(18)}
            color={AUTH_COLORS.text}
          />
        </View>
      </TouchableOpacity>

      <View style={styles.center}>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.side} />
    </View>
  );
};

export default AuthHeaderBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    minHeight: layout.iconButton,
  },

  side: {
    width: layout.iconButton,
    height: layout.iconButton,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backIcon: {
    width: layout.iconButtonSm,
    height: layout.iconButtonSm,
    borderRadius: radii.sm,
    backgroundColor: AUTH_COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '180deg' }],
    borderWidth: 1,
    borderColor: AUTH_COLORS.border,
    shadowColor: AUTH_COLORS.shadow,
    shadowOffset: { width: 0, height: ms(2) },
    shadowOpacity: 0.06,
    shadowRadius: ms(6),
    elevation: 2,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: AUTH_COLORS.text,
    letterSpacing: -0.2,
  },
});
