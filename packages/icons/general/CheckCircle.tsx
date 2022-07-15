import { createIcon } from '../utils'
import type { SvgIcon } from '@mui/material'

export const CheckCircleIcon: typeof SvgIcon = createIcon(
    'CheckCircleIcon',
    <g>
        <g filter="url(#a)">
            <circle cx="20.481" cy="16" r="10" fill="#1C68F3" />
            <path
                d="m15.647 16.63 3.333 3.5 6.667-7"
                stroke="#fff"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </g>
        <defs>
            <filter
                id="checkCircle-a"
                x=".481"
                y="0"
                width="40"
                height="40"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                <feOffset dy="4" />
                <feGaussianBlur stdDeviation="5" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix values="0 0 0 0 0.109804 0 0 0 0 0.407843 0 0 0 0 0.952941 0 0 0 0.2 0" />
                <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_10217_9474" />
                <feBlend in="SourceGraphic" in2="effect1_dropShadow_10217_9474" result="shape" />
            </filter>
        </defs>
    </g>,
    '0 0 20 20',
)
