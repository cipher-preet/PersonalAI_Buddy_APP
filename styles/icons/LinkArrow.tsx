import * as React from 'react';

import Svg, {
  SvgProps,
  Path,
} from 'react-native-svg';

const ArrowUpRightIcon = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 24 24"
    {...props}>
    
    <Path
      stroke={props.color || '#111827'}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 17 17 7m0 0H8m9 0v9"
    />
  </Svg>
);

export default ArrowUpRightIcon;