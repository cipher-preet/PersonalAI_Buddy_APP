import * as React from 'react';

import Svg, {
  SvgProps,
  Path,
} from 'react-native-svg';

const CheckIcon = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    viewBox="0 -0.5 25 25"
    {...props}>
    
    <Path
      fill={props.color || '#111827'}
      d="M5.03 11.47a.75.75 0 0 0-1.06 1.06l1.06-1.06ZM8.5 16l-.53.53a.75.75 0 0 0 1.06 0L8.5 16Zm8.53-7.47a.75.75 0 0 0-1.06-1.06l1.06 1.06Zm-8 2.94a.75.75 0 0 0-1.06 1.06l1.06-1.06ZM12.5 16l-.53.53a.75.75 0 0 0 1.06 0L12.5 16Zm8.53-7.47a.75.75 0 0 0-1.06-1.06l1.06 1.06Zm-17.06 4 4 4 1.06-1.06-4-4-1.06 1.06Zm5.06 4 8-8-1.06-1.06-8 8 1.06 1.06Zm-1.06-4 4 4 1.06-1.06-4-4-1.06 1.06Zm5.06 4 8-8-1.06-1.06-8 8 1.06 1.06Z"
    />
  </Svg>
);

export default CheckIcon;