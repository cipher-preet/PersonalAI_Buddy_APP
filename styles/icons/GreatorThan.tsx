import * as React from 'react';

import Svg, {
  SvgProps,
  Path,
} from 'react-native-svg';

const ChevronRightIcon = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 24 24"
    {...props}>
    
    <Path
      fill={props.color || '#111827'}
      d="M9.71 18.293a1 1 0 0 0 1.415 0l4.887-4.892a2 2 0 0 0 0-2.828l-4.89-4.89a1 1 0 0 0-1.415 1.414l4.186 4.185a1 1 0 0 1 0 1.415L9.71 16.879a1 1 0 0 0 0 1.414Z"
    />
  </Svg>
);

export default ChevronRightIcon;