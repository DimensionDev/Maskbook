import { createPaletteAwareIcon } from '../utils'
import type { SvgIcon } from '@mui/material'

export const SettingsRestoreIcon: typeof SvgIcon = createPaletteAwareIcon(
    'SettingsRestoreIcon',
    <g>
        <path
            d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"
            stroke="#1C68F3"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </g>,
    <g>
        <path
            d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"
            stroke="#fff"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </g>,
    '0 0 24 24',
)
