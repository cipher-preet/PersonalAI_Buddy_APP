import * as React from 'react';

import Svg, {
  SvgProps,
  G,
  Path,
  Rect,
} from 'react-native-svg';

const MicIcon = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    {...props}>
    
    <G fill="none" fillRule="evenodd">
      <Path d="M0 0h24v24H0z" />

      <Rect
        width={6}
        height={11}
        x={9}
        y={3}
        rx={3}
        stroke={props.color || '#FFFFFF'}
        strokeLinecap="round"
        strokeWidth={2}
      />

      <Path
        stroke={props.color || '#FFFFFF'}
        strokeLinecap="round"
        strokeWidth={2}
        d="M12 18v3M8 21h8M19 11a7 7 0 1 1-14 0"
      />
    </G>
  </Svg>
);

export default MicIcon;