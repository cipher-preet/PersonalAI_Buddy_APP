import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { colors, fontSize, fontWeight, ms, radii, spacing } from '../../../theme';

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
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
      <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
    </Pressable>
  );
};

export default OptionChip;

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    gap: spacing.lg,
  },

  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },

  radio: {
    width: ms(20),
    height: ms(20),
    borderRadius: ms(10),
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },

  radioSelected: {
    borderColor: colors.primary,
  },

  radioDot: {
    width: ms(10),
    height: ms(10),
    borderRadius: ms(5),
    backgroundColor: colors.primary,
  },

  text: {
    flex: 1,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },

  textSelected: {
    color: colors.primary,
  },
});
