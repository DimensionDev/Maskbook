import { createPaletteAwareIcon } from '../utils'
import type { SvgIcon } from '@mui/material'

export const SettingsEmailIcon: typeof SvgIcon = createPaletteAwareIcon(
    'SettingsEmailIcon',
    <g>
        <path
            d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2Z"
            stroke="#1C68F3"
            stroke-width="1.25"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
        <path d="m22 6-10 7L2 6" stroke="#1C68F3" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
    </g>,
    <g>
        <path
            d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2Z"
            stroke="#fff"
            stroke-width="1.25"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
        <path d="m22 6-10 7L2 6" stroke="#fff" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
    </g>,
    '0 0 24 24',
)
