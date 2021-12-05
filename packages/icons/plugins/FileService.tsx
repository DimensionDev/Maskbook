import { createIcon } from '../utils'
import type { SvgIcon } from '@mui/material'

export const FileServiceIcon: typeof SvgIcon = createIcon(
    'FileService',
    <g>
        <path
            d="M3.5 8a1 1 0 0 1 1-1h7.25a1 1 0 0 1 .8.4l3.75 5a1 1 0 0 1-.8 1.6h-11a1 1 0 0 1-1-1V8Z"
            fill="#F7931E"
        />
        <rect opacity=".8" x="5.25" y="8.559" width="17.5" height="12.25" rx="1" fill="url(#a)" />
        <rect opacity=".8" x="5.25" y="9.434" width="17.5" height="12.25" rx="1" fill="url(#b)" />
        <rect x="3.5" y="10.5" width="21" height="12.25" rx="1" fill="#FFB110" />
        <defs>
            <linearGradient id="a" x1="5.25" y1="20.809" x2="22.75" y2="20.809" gradientUnits="userSpaceOnUse">
                <stop stopColor="#B0CFEB" />
                <stop offset="1" stopColor="#C4E1FB" />
            </linearGradient>
            <linearGradient id="b" x1="5.25" y1="21.684" x2="22.75" y2="21.684" gradientUnits="userSpaceOnUse">
                <stop stopColor="#B0CFEB" />
                <stop offset="1" stopColor="#C4E1FB" />
            </linearGradient>
        </defs>
    </g>,
    '0 0 28 28',
)
