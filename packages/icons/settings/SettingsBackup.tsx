import { createPaletteAwareIcon } from '../utils'
import type { SvgIcon } from '@mui/material'

export const SettingsBackupIcon: typeof SvgIcon = createPaletteAwareIcon(
    'SettingsBackupIcon',
    <g>
        <path
            d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
            stroke="#1C68F3"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M17 21v-8H7v8M7 3v5h8"
            stroke="#1C68F3"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </g>,
    <g>
        <path
            d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path d="M17 21v-8H7v8M7 3v5h8" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>,
    '0 0 24 24',
)
