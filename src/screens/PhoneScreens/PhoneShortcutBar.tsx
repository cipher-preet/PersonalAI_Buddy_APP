import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '../../theme';

type Props = {
  bottom: number;
  right?: number;
  active?: 'history' | 'contacts';
  onHistory: () => void;
  onContacts: () => void;
  onDialer: () => void;
};

const HistoryIcon = ({ color }: { color: string }) => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="7.25" stroke={color} strokeWidth={1.7} />
    <Path
      d="M12 8.4V12l2.4 1.6"
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ContactsIcon = ({ color }: { color: string }) => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="9.1" r="2.7" stroke={color} strokeWidth={1.7} />
    <Path
      d="M6.8 17.7c.7-2.7 2.5-4.1 5.2-4.1s4.5 1.4 5.2 4.1"
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
    />
  </Svg>
);

const DialPadIcon = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    {[4.2, 10.2, 16.2].map(x =>
      [4.2, 10.2, 16.2].map(y => (
        <Circle key={`${x}-${y}`} cx={x + 1.8} cy={y + 1.8} r={1.55} fill={colors.white} />
      )),
    )}
  </Svg>
);

const PhoneShortcutBar = ({
  bottom,
  right = 88,
  active,
  onHistory,
  onContacts,
  onDialer,
}: Props) => (
  <View pointerEvents="box-none" style={[styles.dock, { bottom, right }]}>
    <View style={styles.pill}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="History"
        accessibilityState={{ selected: active === 'history' }}
        hitSlop={4}
        onPress={onHistory}
        style={({ pressed }) => [
          styles.icon,
          active === 'history' && styles.iconActive,
          pressed && styles.pressed,
        ]}
      >
        <HistoryIcon color={active === 'history' ? colors.equalInk : colors.equalMuted} />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Contacts"
        accessibilityState={{ selected: active === 'contacts' }}
        hitSlop={4}
        onPress={onContacts}
        style={({ pressed }) => [
          styles.icon,
          active === 'contacts' && styles.iconActive,
          pressed && styles.pressed,
        ]}
      >
        <ContactsIcon color={active === 'contacts' ? colors.equalInk : colors.equalMuted} />
      </Pressable>
    </View>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Dial pad"
      hitSlop={4}
      onPress={onDialer}
      style={({ pressed }) => [styles.dialKey, pressed && styles.pressed]}
    >
      <DialPadIcon />
    </Pressable>
  </View>
);

const shadow = {
  shadowColor: '#101828',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.12,
  shadowRadius: 16,
  elevation: 8,
} as const;

const styles = StyleSheet.create({
  dock: {
    position: 'absolute',
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pill: {
    height: 68,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 4,
    borderRadius: 34,
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.equalLine,
    ...shadow,
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActive: {
    backgroundColor: '#F0F0F0',
  },
  dialKey: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
  pressed: {
    opacity: 0.72,
  },
});

export default memo(PhoneShortcutBar);
