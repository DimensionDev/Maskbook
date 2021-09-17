import { createIcon } from '../utils'
import type { SvgIcon } from '@mui/material'

export const TransakIcon: typeof SvgIcon = createIcon(
    'Transak',
    <g>
        <rect x="4.167" y="3.5" width="21" height="21" rx="2" fill="url(#paint0_linear)" />
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M11.04 9.105c.508 0 .92.411.92.918v5.4l5.683-5.735a.919.919 0 011.302-.003l3.916 3.916a.919.919 0 01-1.3 1.299l-2.383-2.383v5.3a.919.919 0 01-1.838 0v-5.213l-5.643 5.695a.919.919 0 01-1.302.003L6.473 14.38a.919.919 0 011.3-1.3l2.349 2.35v-5.408c0-.507.411-.918.919-.918z"
            fill="#fff"
        />
        <defs>
            <linearGradient
                id="paint0_linear"
                x1="4.472"
                y1="4.532"
                x2="25.593"
                y2="23.877"
                gradientUnits="userSpaceOnUse">
                <stop stopColor="#0098FF" />
                <stop offset=".761" stopColor="#005BED" />
                <stop offset=".766" stopColor="#006AEC" />
                <stop offset="1" stopColor="#0064EA" />
            </linearGradient>
        </defs>
    </g>,
    '0 0 28 28',
)
