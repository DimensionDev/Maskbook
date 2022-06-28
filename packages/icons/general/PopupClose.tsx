import { createIcon } from '../utils'
import type { SvgIcon } from '@mui/material'

export const PopupCloseIcon: typeof SvgIcon = createIcon(
    'PopupClose',
    <g>
        <path
            d="m6 6 12 12M6 18 18 6"
            stroke="#111432"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </g>,
    '0 0 24 24',
)
