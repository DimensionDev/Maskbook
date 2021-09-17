import { createIcon } from '../utils'
import type { SvgIcon } from '@mui/material'

export const FileMessageIcon: typeof SvgIcon = createIcon(
    'FileMessageIcon',
    <g>
        <path
            d="M3 7C3 6.44772 3.44772 6 4 6H10C10.3148 6 10.6111 6.14819 10.8 6.4L13.8 10.4C14.2944 11.0592 13.824 12 13 12H4C3.44772 12 3 11.5523 3 11V7Z"
            fill="#F7931E"
        />
        <rect opacity="0.8" x="4.5" y="7.33594" width="15" height="10.5" rx="1" fill="#AFC3E1" />
        <rect opacity="0.8" x="4.5" y="8.08594" width="15" height="10.5" rx="1" fill="#AFC3E1" />
        <rect x="3" y="9" width="18" height="10.5" rx="1" fill="#FFB915" />
    </g>,
    '0 0 24 24',
)
