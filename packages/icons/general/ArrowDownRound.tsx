import { createIcon } from '../utils'
import type { SvgIcon } from '@mui/material'

export const ArrowDownRound: typeof SvgIcon = createIcon(
    'ArrowDown',
    <g>
        <path d="M10 11.6l4 4 4-4" stroke="inherit" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </g>,
    '0 0 28 28',
)
