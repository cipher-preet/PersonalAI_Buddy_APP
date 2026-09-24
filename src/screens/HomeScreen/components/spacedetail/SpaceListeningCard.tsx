import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { MicIcon } from '../../../../../styles/icons';
import {
  colors,
  fontSize,
  fontWeight,
  ms,
  radii,
  spacing,
} from '../../../../theme';

type Props = {
  isListeningHere: boolean;
  isListeningElsewhere: boolean;
  elsewhereSpaceName?: string;
  isBusy?: boolean;
  onPress: () => void;
};

const SpaceListeningCard = ({
  isListeningHere,
  isListeningElsewhere,
  elsewhereSpaceName,
  isBusy = false,
  onPress,
}: Props) => {
  const title = isListeningHere ? 'Stop Listening' : 'Start Listening';

  const subtitle = isBusy
    ? isListeningHere
      ? 'Stopping session...'
      : 'Starting session...'
    : isListeningHere
      ? 'Buddy is capturing this space now'
      : isListeningElsewhere
        ? `Listening in ${elsewhereSpaceName || 'another space'}`
        : 'Capture notes and tasks with your voice';

  const disabled = isBusy || (isListeningElsewhere && !isListeningHere);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isListeningHere && styles.cardListening,
        disabled && styles.cardDisabled,
      ]}
      onPress={onPress}
      activeOpacity={0.78}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View
        style={[styles.iconBox, isListeningHere && styles.iconBoxListening]}
      >
        {isBusy ? (
          <ActivityIndicator
            size="small"
            color={isListeningHere ? colors.success : colors.primary}
          />
        ) : (
          <MicIcon
            width={ms(18)}
            height={ms(18)}
            color={isListeningHere ? colors.success : colors.primary}
          />
        )}
      </View>

      <View style={styles.copy}>
        <View style={styles.titleRow}>
          {isListeningHere ? <View style={styles.liveDot} /> : null}
          <Text
            style={[styles.title, isListeningHere && styles.titleListening]}
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>
        <Text style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default SpaceListeningCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.xl,
  },

  cardListening: {
    borderColor: colors.success,
    backgroundColor: colors.successSoft,
  },

  cardDisabled: {
    opacity: 0.62,
  },

  iconBox: {
    width: ms(40),
    height: ms(40),
    borderRadius: radii.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconBoxListening: {
    backgroundColor: colors.white,
  },

  copy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  liveDot: {
    width: ms(6),
    height: ms(6),
    borderRadius: ms(3),
    backgroundColor: colors.success,
  },

  title: {
    flexShrink: 1,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },

  titleListening: {
    color: colors.successText,
  },

  subtitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.muted,
    lineHeight: ms(16),
  },
});
