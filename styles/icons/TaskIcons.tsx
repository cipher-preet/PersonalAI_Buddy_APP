import * as React from "react"
import Svg, { SvgProps, Path } from "react-native-svg"
const SvgComponent = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    {...props}
  >
    <Path
      fill="#000"
      fillRule="evenodd"
      d="M9 13h10a1 1 0 0 1 0 2H9a1 1 0 0 1 0-2Zm0 4h10a1 1 0 0 1 0 2H9a1 1 0 0 1 0-2Zm6-8h4a1 1 0 0 1 0 2h-4a1 1 0 0 1 0-2Zm-7.257 1.914L4 7.172l1.414-1.415 2.329 2.329L12.828 3l1.415 1.414-6.5 6.5Z"
    />
  </Svg>
)
export default SvgComponent
