import { createIcon } from '../utils'
import type { SvgIcon } from '@material-ui/core'

export const DownloadIcon: typeof SvgIcon = createIcon(
    'DownloadIcon',
    <g>
        <path
            d="M14 10v2.667A1.334 1.334 0 0112.667 14H3.333A1.334 1.334 0 012 12.667V10M4.667 6.667L8 10l3.333-3.333M8 10V2"
            stroke="inherit"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </g>,
    '0 0 16 16',
)
