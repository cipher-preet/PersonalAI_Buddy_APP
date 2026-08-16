import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { MicIcon } from '../../../../styles/icons';
import {
  colors,
  fontSize,
  fontWeight,
  ms,
  spacing,
} from '../../../theme';

type Props = {
  bottomInset: number;
  onPress: () => void;
};

const ReminderMicButton = ({ bottomInset, onPress }: Props) => {
  return (
    <View style={[styles.wrapper, { paddingBottom: bottomInset + spacing['2xl'] }]}>
      <Text style={styles.hint}>Tap to add a voice reminder</Text>

      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Start voice reminder"
        style={({ pressed }) => [
          styles.micPressable,
          pressed && styles.micPressableActive,
        ]}
      >
        <LinearGradient
          colors={['#6366F1', '#8B5CF6', '#EC4899']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.micButton}
        >
          <MicIcon width={ms(28)} height={ms(28)} color={colors.white} />
        </LinearGradient>
      </Pressable>
    </View>
  );
};

export default ReminderMicButton;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    paddingTop: spacing.md,
  },

  hint: {
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xl,
  },

  micPressable: {
    borderRadius: ms(36),
  },

  micPressableActive: {
    transform: [{ scale: 0.96 }],
  },

  micButton: {
    width: ms(72),
    height: ms(72),
    borderRadius: ms(36),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: ms(4) },
    shadowOpacity: 0.22,
    shadowRadius: ms(8),
    elevation: 4,
  },
});
