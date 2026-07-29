import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { AUTH_COLORS } from '../styles/colors';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

const OptionChip = ({ label, selected, onPress }: Props) => {
  return (
    <Pressable
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
    </Pressable>
  );
};

export default OptionChip;

const styles = StyleSheet.create({
  chip: {
    backgroundColor: AUTH_COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: AUTH_COLORS.border,
    marginBottom: 10,
  },

  chipSelected: {
    borderColor: AUTH_COLORS.primary,
    backgroundColor: AUTH_COLORS.primaryLight,
  },

  text: {
    fontSize: 14,
    fontWeight: '600',
    color: AUTH_COLORS.text,
  },

  textSelected: {
    color: AUTH_COLORS.primary,
  },
});
