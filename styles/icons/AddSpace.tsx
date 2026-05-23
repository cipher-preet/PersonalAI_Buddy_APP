import * as React from 'react';

import Svg, {
  SvgProps,
  Path,
} from 'react-native-svg';

const AddIcon = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 24 24"
    {...props}>
    
    <Path
      stroke={props.color || '#FFFFFF'}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 12h6m0 0h6m-6 0v6m0-6V6"
    />
  </Svg>
);

export default AddIcon;