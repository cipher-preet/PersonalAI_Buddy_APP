import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, ms } from '../theme';

type Props = {
  large?: boolean;
  color?: string;
  size?: number;
};

const DOTS = [0, 1, 2, 3];

const EqualMark = ({ large = false, color = colors.white, size }: Props) => {
  if (size) {
    const dot = Math.min(Math.round(size * 0.4), Math.floor((size - 2) / 2));
    const radius = Math.max(1, Math.round(dot * 0.3));
    return (
      <View
        style={{
          width: size,
          height: size,
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignContent: 'space-between',
          justifyContent: 'space-between',
        }}
      >
        {DOTS.map(index => (
          <View
            key={index}
            style={{
              width: dot,
              height: dot,
              borderRadius: radius,
              backgroundColor: color,
            }}
          />
        ))}
      </View>
    );
  }

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
