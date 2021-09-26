import { createIcon } from '../utils'
import type { SvgIcon } from '@mui/material'

export const ArrowUpRound: typeof SvgIcon = createIcon(
    'ArrowUp',
    <g>
        <path d="M18 15.6l-4-4-4 4" stroke="#1C68F3" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </g>,
    '0 0 28 28',
)
