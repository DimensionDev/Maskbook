import { createIcon } from '../utils'
import type { SvgIcon } from '@mui/material'

export const ETHIcon: typeof SvgIcon = createIcon(
    'ETH',
    <g>
        <circle cx="10" cy="10" r="10" fill="#AFC3E1" />
        <path d="M13.75 10.854L10 4.167l-3.75 6.687 3.75 2.48 3.75-2.48z" fill="#fff" />
        <path d="M6.25 11.667l3.75 5 3.75-5-3.75 2.08-3.75-2.08z" fill="#fff" />
    </g>,
    '0 0 20 20',
)
