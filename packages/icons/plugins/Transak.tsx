import { createIcon } from '../utils'
import type { SvgIcon } from '@mui/material'

export const TransakIcon: typeof SvgIcon = createIcon(
    'Transak',
    <g>
        <path
            opacity=".6"
            d="M7.363 22.32a1.75 1.75 0 0 1-1.75-1.75v-9.718c0-.966.784-1.75 1.75-1.75h16.57c.967 0 1.75.784 1.75 1.75v9.717a1.75 1.75 0 0 1-1.75 1.75H7.363Z"
            fill="#FF7C0E"
        />
        <path
            opacity=".6"
            d="M20.637 5.68c.966 0 1.75.784 1.75 1.75v9.718a1.75 1.75 0 0 1-1.75 1.75H4.067a1.75 1.75 0 0 1-1.75-1.75V7.43c0-.967.783-1.75 1.75-1.75h16.57Z"
            fill="#FF7C0E"
        />
        <path d="M2.317 8.133h20.07v2.654H2.317V8.133Z" fill="#fff" />
        <circle cx="18.425" cy="16.095" r="1.3" fill="#FF601C" />
        <circle cx="19.724" cy="16.095" r="1.3" fill="#FF7C0E" />
    </g>,
    '0 0 28 28',
)
