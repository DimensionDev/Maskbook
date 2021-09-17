import { createIcon } from '../utils'
import type { SvgIcon } from '@mui/material'

export const SuccessIcon: typeof SvgIcon = createIcon(
    'Success',
    <g>
        <path
            opacity=".2"
            d="M32 58.667c14.727 0 26.667-11.94 26.667-26.667 0-14.728-11.94-26.667-26.667-26.667C17.272 5.333 5.333 17.273 5.333 32c0 14.728 11.94 26.667 26.667 26.667z"
            fill="#77E0B5"
        />
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M44.46 22.027c1.09.99 1.17 2.677.18 3.767L31.306 40.46a2.667 2.667 0 01-3.708.23l-9.333-8a2.667 2.667 0 113.47-4.049l7.367 6.314 11.591-12.75a2.667 2.667 0 013.767-.18z"
            fill="#77E0B5"
        />
    </g>,
    '0 0 64 64',
)
