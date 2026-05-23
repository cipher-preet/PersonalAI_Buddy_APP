import * as React from 'react';

import Svg, {
  SvgProps,
  Circle,
} from 'react-native-svg';

const MoreIcon = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 48 48"
    fill="none"
    {...props}>
    
    <Circle
      cx={23.896}
      cy={24}
      r={2.562}
      fill={props.color || '#111827'}
    />

    <Circle
      cx={23.896}
      cy={16.031}
      r={2.562}
      fill={props.color || '#111827'}
    />

    <Circle
      cx={23.896}
      cy={8.062}
      r={2.562}
      fill={props.color || '#111827'}
    />

    <Circle
      cx={23.896}
      cy={31.969}
      r={2.562}
      fill={props.color || '#111827'}
    />

    <Circle
      cx={23.896}
      cy={39.938}
      r={2.562}
      fill={props.color || '#111827'}
    />

    <Circle
      cx={15.927}
      cy={24}
      r={2.135}
      fill={props.color || '#111827'}
    />

    <Circle
      cx={15.927}
      cy={16.031}
      r={2.135}
      fill={props.color || '#111827'}
    />

    <Circle
      cx={15.927}
      cy={31.969}
      r={2.135}
      fill={props.color || '#111827'}
    />

    <Circle
      cx={31.865}
      cy={24}
      r={2.989}
      fill={props.color || '#111827'}
    />

    <Circle
      cx={31.865}
      cy={16.031}
      r={2.989}
      fill={props.color || '#111827'}
    />

    <Circle
      cx={31.865}
      cy={31.969}
      r={2.989}
      fill={props.color || '#111827'}
    />

    <Circle
      cx={7.958}
      cy={24}
      r={1.708}
      fill={props.color || '#111827'}
    />

    <Circle
      cx={39.835}
      cy={24}
      r={3.415}
      fill={props.color || '#111827'}
    />
  </Svg>
);

export default MoreIcon;