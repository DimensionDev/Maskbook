import { SvgIcon, SvgIconProps } from '@mui/material'
import type { FC } from 'react'

export const UnknownIcon: FC<SvgIconProps> = (props) => (
    <SvgIcon
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        xmlSpace="preserve"
        version="1.1"
        viewBox="0 0 500 500"
        xmlnsXlink="http://www.w3.org/1999/xlink">
        <g id="unknown_icon">
            <path d="M20 250c0,127 103,230 230,230 127,0 230,-103 230,-230 0,-127 -103,-230 -230,-230 -127,0 -230,103 -230,230zm184 71c0,-20 3,-36 11,-46 7,-10 20,-22 39,-35 10,-7 18,-14 23,-23 6,-9 9,-20 9,-32 0,-12 -4,-22 -10,-29 -7,-8 -16,-11 -28,-11 -10,0 -18,3 -25,9 -7,6 -10,15 -10,27l-73 0 0 -2c-1,-30 9,-53 29,-69 20,-15 46,-23 79,-23 35,0 62,9 82,27 20,17 30,41 30,71 0,19 -5,35 -16,51 -11,15 -25,27 -42,36 -9,6 -16,13 -19,20 -3,7 -5,17 -5,29l-74 0zm74 92l-74 0 0 -60 74 0 0 60z" />
        </g>
    </SvgIcon>
)
