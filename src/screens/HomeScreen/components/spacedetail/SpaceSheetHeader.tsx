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

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View
          style={[
            styles.folderWrap,
            isListening && styles.folderWrapListening,
          ]}
        >
          <SpaceFolderIcon size={ms(34)} listening={isListening} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.kicker}>Workspace</Text>
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

      <Text style={styles.description} numberOfLines={2}>
        {trimmedDescription ||
          'Use this workspace to capture notes, track tasks, and chat with Buddy.'}
      </Text>

      {isListening ? (
        <View style={styles.listeningPill}>
          <View style={styles.liveDot} />
          <Text style={styles.listeningText}>
            Buddy is listening in this space
          </Text>
        </View>
      ) : null}
    </View>
  );
};

export default SpaceSheetHeader;

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xs,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  folderWrap: {
    width: ms(52),
    height: ms(52),
    borderRadius: ms(16),
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
  },

  kicker: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },

  title: {
    marginTop: spacing.xxs,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.extrabold,
    color: colors.text,
    letterSpacing: -0.4,
  },

  created: {
    marginTop: spacing.xxs,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.muted,
  },

  description: {
    marginTop: spacing.lg,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.subText,
    lineHeight: ms(18),
  },

  listeningPill: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.successSoft,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },

  liveDot: {
    width: ms(7),
    height: ms(7),
    borderRadius: ms(4),
    backgroundColor: colors.success,
  },

  listeningText: {
    color: colors.successText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },

  closeButton: {
    width: ms(32),
    height: ms(32),
    borderRadius: ms(16),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
});
