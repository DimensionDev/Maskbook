import { createIcon } from '../utils'
import type { SvgIcon } from '@mui/material'

export const ArrowDownRound: typeof SvgIcon = createIcon(
    'ArrowDown',
    <g fill="none">
        <path d="m4 5.6 4 4 4-4" stroke="inherit" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </g>,
    '0 0 16 16',
)
