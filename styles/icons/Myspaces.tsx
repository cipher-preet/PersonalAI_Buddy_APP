import * as React from 'react';

import Svg, {
  SvgProps,
  Path,
} from 'react-native-svg';

const NotesIcon = (props: SvgProps) => (
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
      d="M2.999 3v13.2c0 1.68 0 2.52.327 3.162a3 3 0 0 0 1.311 1.311C5.28 21 6.12 21 7.8 21h13.2m-1-6h-4m-3-8H7m11 4H9"
    />
  </Svg>
);

export default NotesIcon;