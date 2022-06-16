import { createIcon } from '../../../../../../icons/utils'
import type { SvgIcon } from '@mui/material'

export const LiveIcon: typeof SvgIcon = createIcon(
    'Azuro',
    <g>
        <circle cx="8" cy="8" r="3" fill="#FE7C8C" />
        <circle cx="8" cy="8" r="4.5" stroke="#FE7C8C" strokeOpacity="0.1" strokeWidth="3" />
    </g>,
    '0 0 16 16',
)
