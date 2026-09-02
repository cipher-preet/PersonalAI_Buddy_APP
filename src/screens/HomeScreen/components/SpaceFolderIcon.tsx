import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { ms } from '../../../theme';

type Props = {
  size?: number;
  listening?: boolean;
};

const SpaceFolderIcon = ({ size = ms(80), listening = false }: Props) => {
  const tab = listening ? '#5EEAD4' : '#818CF8';
  const body = listening ? '#2DD4BF' : '#6366F1';
  const face = listening ? '#99F6E4' : '#A5B4FC';

  return (
    <View style={[styles.wrap, { width: size, height: size * 0.86 }]}>
      <Svg width={size} height={size * 0.86} viewBox="0 0 72 62" fill="none">
        <Path
          d="M8 16.5C8 14.6 9.6 13 11.5 13h14.4c.9 0 1.7.4 2.3 1.1l2.6 2.8c.6.7 1.4 1.1 2.3 1.1H60.5C62.4 18 64 19.6 64 21.5V24H8v-7.5Z"
          fill={tab}
        />
        <Rect x="8" y="22" width="56" height="32" rx="7" fill={body} />
        <Path
          d="M12.5 27h47c1.4 0 2.5 1.2 2.3 2.6l-3.4 19.2c-.3 1.5-1.6 2.7-3.2 2.7H16.8c-1.6 0-2.9-1.2-3.2-2.7L10.2 29.6C10 28.2 11.1 27 12.5 27Z"
          fill={face}
        />
      </Svg>
    </View>
  );
};

export default memo(SpaceFolderIcon);

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
