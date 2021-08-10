import { createIcon } from '../utils'
import type { SvgIcon } from '@material-ui/core'

export const CloseIcon: typeof SvgIcon = createIcon(
    'CloseIcon',
    <g>
        <path d="M15 5L5 15M5 5l10 10" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </g>,
    '0 0 20 20',
)
