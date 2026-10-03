import React, { memo } from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

import { colors, ms } from '../../../theme';

type Props = {
  size?: number;
  listening?: boolean;
  color?: string;
};

const SpaceFolderIcon = ({ size = ms(52), listening = false, color }: Props) => {
  const front = color ?? (listening ? colors.accentCyan : colors.primary);
  const back = color ?? (listening ? colors.info : colors.primaryDark);

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2.5 7A2.5 2.5 0 0 1 5 4.5h3.9c.6 0 1.1.2 1.5.6l1.5 1.4h7.1A2.5 2.5 0 0 1 21.5 9v8.5A2.5 2.5 0 0 1 19 20H5a2.5 2.5 0 0 1-2.5-2.5V7Z"
        fill={back}
      />
      <Path
        d="M2.5 10.2c0-1.2 1-2.2 2.2-2.2h14.6c1.2 0 2.2 1 2.2 2.2v7.3A2.5 2.5 0 0 1 19 20H5a2.5 2.5 0 0 1-2.5-2.5v-7.3Z"
        fill={front}
      />
      <Rect x="8.6" y="12.9" width="6.8" height="1.9" rx="0.95" fill={colors.white} />
    </Svg>
  );
};

export default memo(SpaceFolderIcon);
