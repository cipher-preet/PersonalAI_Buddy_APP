import * as React from 'react';

import Svg, {
  SvgProps,
  Path,
} from 'react-native-svg';

const ArrowUpIcon = (props: SvgProps) => (
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
      d="M12 5v14m0-14-6 6m6-6 6 6"
    />
  </Svg>
);

export default ArrowUpIcon;