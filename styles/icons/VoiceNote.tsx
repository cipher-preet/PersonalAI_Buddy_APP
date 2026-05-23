import * as React from 'react';
import Svg, {
  SvgProps,
  Circle,
  Path,
} from 'react-native-svg';

const AnalyticsIcon = ({
  width = 24,
  height = 24,
  color = '#FFFFFF',
  ...props
}: SvgProps) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 48 48"
    fill="none"
    {...props}
  >
    <Circle
      cx={14.355}
      cy={19.496}
      r={4.934}
      stroke={color}
      strokeWidth={2}
    />

    <Path
      d="M24.734 33.276v1.69a1.641 1.641 0 0 1-1.645 1.645H6.145A1.641 1.641 0 0 1 4.5 34.966v-1.69c2.159-7.02 18.973-5.817 20.234 0ZM25.258 20.877v5.032M29.819 16.212v14.363M34.38 11.39v24.007M43.5 20.877v5.032M38.94 16.212v14.363"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default AnalyticsIcon;