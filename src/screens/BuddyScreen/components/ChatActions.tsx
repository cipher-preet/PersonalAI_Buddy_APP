import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

import ActionButton from '../components/ActionButton';
import {
  colors,
  fontSize,
  ms,
  radii,
  spacing,
} from '../../../theme';

const ChatActions = () => {
  return (
    <>
      <TouchableOpacity style={styles.moreButton}>
        <Text style={styles.moreText}>•••</Text>
      </TouchableOpacity>

      <View style={styles.row}>
        <ActionButton title="Tell me more" />

        <ActionButton title="Create a task from this" />
      </View>
    </>
  );
};

export default ChatActions;

const styles = StyleSheet.create({
  moreButton: {
    width: ms(52),
    height: ms(38),
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing['2xl'],
  },

  moreText: {
    fontSize: fontSize['2xl'],
    color: colors.subText,
  },

  row: {
    marginTop: spacing['2xl'],
    flexDirection: 'row',
    gap: spacing.xl,
  },
});
