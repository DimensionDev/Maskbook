import { createIcon } from '../utils'
import type { SvgIcon } from '@mui/material'

export const ArrowDownwardIcon: typeof SvgIcon = createIcon(
    'ArrowDownwardIcon',
    <g>
        <path fillRule="evenodd" clipRule="evenodd" d="M12 4.135a1 1 0 0 1 1 1v14a1 1 0 1 1-2 0v-14a1 1 0 0 1 1-1Z" />
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M4.293 11.428a1 1 0 0 1 1.414 0L12 17.72l6.293-6.293a1 1 0 1 1 1.414 1.414l-7 7a1 1 0 0 1-1.414 0l-7-7a1 1 0 0 1 0-1.414Z"
        />
    </g>,
    '0 0 24 24',
)
