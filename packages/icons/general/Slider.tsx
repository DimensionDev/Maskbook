import { createIcon } from '../utils'
import type { SvgIcon } from '@mui/material'

export const SliderIcon: typeof SvgIcon = createIcon(
    'SliderIcon',
    <g>
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M11 3.5A2.25 2.25 0 1011 8a2.25 2.25 0 000-4.5zM7.25 5.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM9 16.094a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zm3.75-2.25a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
            fill="#111432"
        />
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M1 4.977h7v1.5H1v-1.5zM19 14.617h-7v-1.5h7v1.5zM16 4.977h3v1.5h-3v-1.5zM4 14.617H1v-1.5h3v1.5z"
            fill="#111432"
        />
    </g>,
    '0 0 20 20',
)
