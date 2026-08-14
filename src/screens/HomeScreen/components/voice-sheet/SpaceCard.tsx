import React from 'react';

import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import {
  colors,
  fontSize,
  fontWeight,
  ms,
  radii,
  spacing,
} from '../../../../theme';

const SpaceCard = ({ item, selected, onPress }: any) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.card, selected && styles.selectedCard]}
    >
      <View style={[styles.circle, selected && styles.selectedCircle]} />

      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.title}>
          {item.spacename}
        </Text>

        <Text numberOfLines={2} style={styles.description}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default SpaceCard;

const styles = StyleSheet.create({
  card: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
    borderRadius: ms(16),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },

  selectedCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },

  circle: {
    width: ms(18),
    height: ms(18),
    borderRadius: radii.pill,
    borderWidth: ms(1.8),
    borderColor: colors.muted,
    marginTop: spacing.xxs,
  },

  selectedCircle: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  content: {
    flex: 1,
    marginLeft: spacing.xl,
  },

  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.black,
  },

  description: {
    marginTop: spacing.xs,
    fontSize: fontSize.md,
    lineHeight: ms(18),
    color: colors.subText,
  },
});
