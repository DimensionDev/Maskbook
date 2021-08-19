import { createPaletteAwareIcon } from '../utils'
import type { SvgIcon } from '@material-ui/core'

export const SettingsEmailIcon: typeof SvgIcon = createPaletteAwareIcon(
    'SettingsEmailIcon',
    <g>
        <path
            d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"
            stroke="#1C68F3"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </g>,
    <g>
        <path
            d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"
            stroke="#fff"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </g>,
    '0 0 24 24',
)
