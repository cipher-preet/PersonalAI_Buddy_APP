import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { MySpcaes } from '../../../../styles/icons';
import { COLORS } from './styles/color';
import {
  fontSize,
  fontWeight,
  ms,
  mvs,
  shadows,
  spacing,
} from '../../../theme';

type Props = {
  name: string;
  notesCount: number;
};

const SpaceNotesCard = ({ name, notesCount }: Props) => {
  return (
    <TouchableOpacity activeOpacity={0.86} style={styles.card}>
      <View style={styles.iconBox}>
        <MySpcaes width={ms(18)} height={ms(18)} color={COLORS.primaryDark} />
      </View>

      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.name}>
          {name}
        </Text>
        <Text style={styles.count}>{notesCount} notes</Text>
      </View>
    </TouchableOpacity>
  );
};

export default SpaceNotesCard;

const styles = StyleSheet.create({
  card: {
    width: '100%',
    minHeight: mvs(74),
    marginTop: spacing.xl,
    paddingHorizontal: ms(14),
    paddingVertical: spacing.xl,
    borderRadius: ms(18),
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.soft,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  iconBox: {
    width: ms(42),
    height: ms(42),
    borderRadius: ms(14),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.purpleLight,
    marginRight: spacing.xl,
  },

  content: {
    flex: 1,
  },

  name: {
    color: COLORS.black,
    fontSize: fontSize.base,
    fontWeight: fontWeight.extrabold,
  },

  count: {
    marginTop: spacing.xs,
    color: COLORS.gray,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
});
