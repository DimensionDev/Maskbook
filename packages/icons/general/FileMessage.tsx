import { createIcon } from '../utils'
import type { SvgIcon } from '@material-ui/core'

export const FileMessageIcon: typeof SvgIcon = createIcon(
    'FileMessageIcon',
    <g>
        <rect opacity="0.1" width="48" height="48" rx="24" fill="#1C68F3" />
        <path
            d="M15 19C15 18.4477 15.4477 18 16 18H22C22.3148 18 22.6111 18.1482 22.8 18.4L25.8 22.4C26.2944 23.0592 25.824 24 25 24H16C15.4477 24 15 23.5523 15 23V19Z"
            fill="#F7931E"
        />
        <rect opacity="0.8" x="16.5" y="19.3359" width="15" height="10.5" rx="1" fill="#AFC3E1" />
        <rect opacity="0.8" x="16.5" y="20.0859" width="15" height="10.5" rx="1" fill="#AFC3E1" />
        <rect x="15" y="21" width="18" height="10.5" rx="1" fill="#FFB915" />
    </g>,
    '0 0 48 48',
)
