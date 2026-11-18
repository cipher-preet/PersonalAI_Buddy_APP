import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, ms } from '../theme';

type Props = {
  large?: boolean;
  color?: string;
};

const DOTS = [0, 1, 2, 3];

const EqualMark = ({ large = false, color = colors.white }: Props) => {
  const styles = large ? largeStyles : smallStyles;

  return (
    <View style={styles.grid}>
      {DOTS.map(dot => (
        <View key={dot} style={[styles.dot, { backgroundColor: color }]} />
      ))}
    </View>
  );
};

const smallStyles = StyleSheet.create({
  grid: {
    width: ms(18),
    height: ms(18),
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'space-between',
    justifyContent: 'space-between',
  },
  dot: {
    width: ms(7),
    height: ms(7),
    borderRadius: ms(2),
  },
});

const largeStyles = StyleSheet.create({
  grid: {
    width: ms(26),
    height: ms(26),
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'space-between',
    justifyContent: 'space-between',
  },
  dot: {
    width: ms(10),
    height: ms(10),
    borderRadius: ms(3),
  },
});

export default memo(EqualMark);
