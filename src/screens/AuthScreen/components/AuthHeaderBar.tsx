import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ChevronRightIcon from '../../../../styles/icons/GreatorThan';
import { AUTH_COLORS } from '../styles/colors';

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
          <ChevronRightIcon width={18} height={18} color={AUTH_COLORS.text} />
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
    marginBottom: 12,
    minHeight: 44,
  },

  side: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: AUTH_COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '180deg' }],
    borderWidth: 1,
    borderColor: AUTH_COLORS.border,
    shadowColor: AUTH_COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
    color: AUTH_COLORS.text,
    letterSpacing: -0.2,
  },
});
