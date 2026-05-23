import * as React from 'react';

import Svg, {
  SvgProps,
  G,
  Path,
  Circle,
} from 'react-native-svg';

const FilterIcon = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    {...props}>
    
    <G fill="none" fillRule="evenodd">
      <Path d="M0 0h24v24H0z" />

      <Path
        stroke={props.color || '#111827'}
        strokeLinecap="round"
        strokeWidth={2}
        d="M4 5h12M4 12h6M14 12h6M8 19h12"
      />

      <Circle
        cx={18}
        cy={5}
        r={2}
        stroke={props.color || '#111827'}
        strokeLinecap="round"
        strokeWidth={2}
      />

      <Circle
        cx={12}
        cy={12}
        r={2}
        stroke={props.color || '#111827'}
        strokeLinecap="round"
        strokeWidth={2}
      />

      <Circle
        cx={6}
        cy={19}
        r={2}
        stroke={props.color || '#111827'}
        strokeLinecap="round"
        strokeWidth={2}
      />
    </G>
  </Svg>
);

export default FilterIcon;