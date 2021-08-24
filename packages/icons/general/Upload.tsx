import { createIcon } from '../utils'
import type { SvgIcon } from '@material-ui/core'

export const UploadIcon: typeof SvgIcon = createIcon(
    'UploadIcon',
    <g>
        <path
            d="M25.5 20.5v3.333a1.666 1.666 0 01-1.667 1.667H12.167a1.666 1.666 0 01-1.667-1.667V20.5M22.168 14.668L18 10.501l-4.167 4.167M18.001 10.5v10"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </g>,
    '0 0 20 20',
)
