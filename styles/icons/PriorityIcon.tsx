import * as React from 'react';

import Svg, {
  SvgProps,
  Path,
} from 'react-native-svg';

const FlashIcon = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 24 24"
    {...props}>
    
    <Path
      stroke={props.color || '#292D32'}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={1.5}
      d="M9.32 13.28h3.09v7.2c0 1.06 1.32 1.56 2.02.76l7.57-8.6c.66-.75.13-1.92-.87-1.92h-3.09v-7.2c0-1.06-1.32-1.56-2.02-.76l-7.57 8.6c-.65.75-.12 1.92.87 1.92ZM8.5 4h-7M7.5 20h-6M4.5 12h-3"
    />
  </Svg>
);

export default FlashIcon;