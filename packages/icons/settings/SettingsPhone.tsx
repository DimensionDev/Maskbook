import { createPaletteAwareIcon } from '../utils'
import type { SvgIcon } from '@material-ui/core'

export const SettingsPhoneIcon: typeof SvgIcon = createPaletteAwareIcon(
    'SettingsPhoneIcon',
    <g>
        <path
            d="M17 2H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V4a2 2 0 00-2-2z"
            stroke="#1C68F3"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path d="M12 18h.01" stroke="#1C68F3" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </g>,
    <g>
        <path
            d="M17 2H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V4a2 2 0 00-2-2z"
            stroke="#fff"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path d="M12 18h.01" stroke="#fff" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </g>,
    '0 0 24 24',
)
