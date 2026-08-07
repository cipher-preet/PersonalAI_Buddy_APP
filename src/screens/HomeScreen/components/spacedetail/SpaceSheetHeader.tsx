import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MySpcaes } from '../../../../../styles/icons';
import {
  colors,
  fontSize,
  fontWeight,
  layout,
  ms,
  radii,
  spacing,
} from '../../../../theme';

type Props = {
  title: string;
  description?: string;
  createdAt: string;
  isListening: boolean;
  accentColor: string;
  onClose: () => void;
};

const SpaceSheetHeader = ({
  title,
  description,
  createdAt,
  isListening,
  accentColor,
  onClose,
}: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={[styles.icon, { backgroundColor: accentColor }]}>
          <MySpcaes width={ms(16)} height={ms(16)} color={colors.black} />
        </View>

        <View style={styles.textWrap}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {description || `Created ${createdAt}`}
          </Text>
        </View>
      </View>

      <View style={styles.right}>
        <View style={[styles.statusPill, isListening && styles.statusLive]}>
          {isListening ? <View style={styles.liveDot} /> : null}
          <Text style={[styles.statusText, isListening && styles.statusLiveText]}>
            {isListening ? 'Live' : 'Idle'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          activeOpacity={0.75}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.closeIcon}>×</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SpaceSheetHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: ms(14),
    gap: spacing.lg,
  },

  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },

  icon: {
    width: layout.iconButtonSm,
    height: layout.iconButtonSm,
    borderRadius: ms(14),
    alignItems: 'center',
    justifyContent: 'center',
  },

  textWrap: {
    flex: 1,
  },

  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.black,
    letterSpacing: -0.3,
  },

  meta: {
    marginTop: spacing.xxs,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.subText,
  },

  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  statusPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.lightGray,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  statusLive: {
    backgroundColor: colors.inputBg,
  },

  liveDot: {
    width: ms(5),
    height: ms(5),
    borderRadius: ms(3),
    backgroundColor: colors.successBright,
  },

  statusText: {
    fontSize: ms(10),
    fontWeight: fontWeight.bold,
    color: colors.subText,
  },

  statusLiveText: {
    color: colors.success,
  },

  closeButton: {
    width: ms(30),
    height: ms(30),
    borderRadius: ms(15),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGray,
  },

  closeIcon: {
    fontSize: fontSize['2xl'],
    lineHeight: ms(20),
    color: colors.subText,
    marginTop: -ms(1),
  },
});
