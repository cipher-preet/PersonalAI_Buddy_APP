import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { MySpcaes } from '../../../../styles/icons';
import { COLORS } from './styles/color';

type Props = {
  name: string;
  notesCount: number;
};

const SpaceNotesCard = ({ name, notesCount }: Props) => {
  return (
    <TouchableOpacity activeOpacity={0.86} style={styles.card}>
      <View style={styles.iconBox}>
        <MySpcaes width={18} height={18} color={COLORS.primaryDark} />
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
    minHeight: 74,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#64748B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.purpleLight,
    marginRight: 12,
  },

  content: {
    flex: 1,
  },

  name: {
    color: COLORS.black,
    fontSize: 14,
    fontWeight: '800',
  },

  count: {
    marginTop: 4,
    color: COLORS.gray,
    fontSize: 12,
    fontWeight: '700',
  },
});
