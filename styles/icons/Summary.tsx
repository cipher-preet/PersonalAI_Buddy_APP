import * as React from 'react';

import Svg, {
  SvgProps,
  Path,
} from 'react-native-svg';

const LayoutIcon = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 32 32"
    fill="none"
    {...props}>
    
    <Path
      fill={props.color || '#111827'}
      d="M19 10h7v2h-7zM19 15h7v2h-7zM19 20h7v2h-7zM6 10h7v2H6zM6 15h7v2H6zM6 20h7v2H6z"
    />

    <Path
      fill={props.color || '#111827'}
      d="M28 5H4a2.002 2.002 0 0 0-2 2v18a2.002 2.002 0 0 0 2 2h24a2.002 2.002 0 0 0 2-2V7a2.002 2.002 0 0 0-2-2ZM4 7h11v18H4Zm13 18V7h11v18Z"
    />

    <Path
      d="M0 0h32v32H0z"
      fill="none"
    />
  </Svg>
);

export default LayoutIcon;