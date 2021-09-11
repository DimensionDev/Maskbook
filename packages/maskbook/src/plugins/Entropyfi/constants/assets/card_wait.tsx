import { SvgIcon, SvgIconProps } from '@material-ui/core'
import type { FC } from 'react'

export const WaitIcon: FC<SvgIconProps> = (props) => (
    <SvgIcon {...props}>
        <svg viewBox="0 0 1024 1024">
            <path
                fill="#878fa5"
                d="M261.528 137.554h474.903l-139.698 216.07 88.01 51.857L872.4 114.055l-44.06-75.3H160.581l-42.705 77.785L438.79 538.795l286.004 359.27h-472.36l138.51-214.828-88.01-51.856-186.357 290.183 44.005 75.3h667.756l41.406-79.028-346.842-437.055z"
                className="selected"
                data-spm-anchor-id="a313x.7781069.0.i0"
            />
            <path
                fill="#878fa5"
                d="M512.734 208.222H399.022L512.734 321.2l112.244-112.978H512.734zm-36.83 620.757h-99.477l99.477-112.357 98.234 112.357h-98.234z"
                className="selected"
                data-spm-anchor-id="a313x.7781069.0.i2"
            />
        </svg>
    </SvgIcon>
)
