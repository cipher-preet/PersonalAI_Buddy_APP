import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';

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
  onPress: () => void;
  bottom?: number;
};

const ChatPlusIcon = () => (
  <Svg width={ms(16)} height={ms(16)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
      stroke={colors.white}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 8v6M9 11h6"
      stroke={colors.white}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

const NewChatFab = ({ onPress, bottom = spacing['3xl'] }: Props) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.fab, { bottom }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="New chat"
    >
      <ChatPlusIcon />
      <Text style={styles.fabText}>New Chat</Text>
    </TouchableOpacity>
  );
};

export default NewChatFab;

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: layout.screenPadding,
    minHeight: ms(44),
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    zIndex: 20,
  },

  fabText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
});
