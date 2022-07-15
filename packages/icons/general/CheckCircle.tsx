import { createIcon } from '../utils'
import type { SvgIcon } from '@mui/material'

export const CheckCircleIcon: typeof SvgIcon = createIcon(
    'CheckCircleIcon',
    <g>
        <circle
            style={{ filter: 'drop-shadow(0px 2px 5px rgba(28, 104, 243, 0.2))' }}
            cx="10"
            cy="10"
            r="10"
            fill="#1C68F3"
        />
        <path
            d="M5.16602 10.6309L8.49935 14.1309L15.166 7.13086"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </g>,
    '0 0 20 20',
)
