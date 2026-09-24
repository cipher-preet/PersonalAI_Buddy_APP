import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import SpaceFolderIcon from '../SpaceFolderIcon';
import {
  colors,
  fontSize,
  fontWeight,
  ms,
  radii,
  spacing,
} from '../../../../theme';

type Props = {
  title: string;
  description?: string;
  createdAt: string;
  isListening: boolean;
  onClose: () => void;
};

const CloseIcon = () => (
  <Svg width={ms(14)} height={ms(14)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6 6 18M6 6l12 12"
      stroke={colors.subText}
      strokeWidth={2.2}
      strokeLinecap="round"
    />
  </Svg>
);

const SpaceSheetHeader = ({
  title,
  description,
  createdAt,
  isListening,
  onClose,
}: Props) => {
  const trimmedDescription = description?.trim();
  const showDescription =
    Boolean(trimmedDescription) &&
    trimmedDescription!.toLowerCase() !== 'new';

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View
          style={[
            styles.folderWrap,
            isListening && styles.folderWrapListening,
          ]}
        >
          <SpaceFolderIcon size={ms(32)} listening={isListening} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.created} numberOfLines={1}>
            Created {createdAt}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          activeOpacity={0.75}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <CloseIcon />
        </TouchableOpacity>
      </View>

      {showDescription ? (
        <Text style={styles.description} numberOfLines={2}>
          {trimmedDescription}
        </Text>
      ) : null}

      {isListening ? (
        <View style={styles.listeningPill}>
          <View style={styles.liveDot} />
          <Text style={styles.listeningText}>Listening</Text>
        </View>
      ) : null}
    </View>
  );
};

export default SpaceSheetHeader;

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },

  folderWrap: {
    width: ms(48),
    height: ms(48),
    borderRadius: radii.lg,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  folderWrapListening: {
    backgroundColor: colors.successSoft,
  },

  copy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },

  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.text,
    letterSpacing: -0.3,
  },

  created: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.muted,
  },

  description: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.subText,
    lineHeight: ms(20),
  },

  listeningPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.successSoft,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },

  liveDot: {
    width: ms(6),
    height: ms(6),
    borderRadius: ms(3),
    backgroundColor: colors.success,
  },

  listeningText: {
    color: colors.successText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },

  closeButton: {
    width: ms(32),
    height: ms(32),
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
