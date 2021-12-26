import { createIcon } from '../utils'
import type { SvgIcon } from '@mui/material'

export const SwapServiceIcon: typeof SvgIcon = createIcon(
    'SwapService',
    <g>
        <circle cx="14" cy="14" r="14" fill="#FFB915" fillOpacity=".15" />
        <g clipPath="url(#clip0)" stroke="#FFB915" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.241 6.87l2.593 2.593-2.593 2.592" />
            <path d="M8.167 13.351v-1.296a2.593 2.593 0 012.592-2.592h9.075M10.76 21.13l-2.593-2.593 2.592-2.593" />
            <path d="M19.834 14.648v1.296a2.593 2.593 0 01-2.593 2.593H8.167" />
        </g>
        <defs>
            <clipPath id="clip0">
                <path fill="#fff" transform="translate(6.222 6.222)" d="M0 0h15.556v15.556H0z" />
            </clipPath>
        </defs>
    </g>,
    '0 0 28 28',
)
