import { createIcon } from '../utils'
import type { SvgIcon } from '@mui/material'

export const MenuSettingsIcon: typeof SvgIcon = createIcon(
    'MenuSettingsIcon',
    <g>
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M6 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8zm9.5 1.5H10a.5.5 0 000 1h5.5a.5.5 0 000-1zm-1.5 4H8.5a.5.5 0 000 1H14a.5.5 0 000-1z"
            fill="url(#settings_linear)"
        />
        <g filter="url(#settings_circle_0)">
            <circle cx="9.5" cy="10" r="1.5" fill="#fff" fillOpacity=".1" />
        </g>
        <g filter="url(#settings_circle_1)">
            <circle cx="14.5" cy="14" r="1.5" fill="#fff" fillOpacity=".1" />
        </g>
        <defs>
            <filter
                id="settings_circle_0"
                x="4"
                y="4.5"
                width="11"
                height="11"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feGaussianBlur in="BackgroundImage" stdDeviation="2" />
                <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur" />
                <feBlend in="SourceGraphic" in2="effect1_backgroundBlur" result="shape" />
            </filter>
            <filter
                id="settings_circle_1"
                x="9"
                y="8.5"
                width="11"
                height="11"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feGaussianBlur in="BackgroundImage" stdDeviation="2" />
                <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur" />
                <feBlend in="SourceGraphic" in2="effect1_backgroundBlur" result="shape" />
            </filter>
            <linearGradient id="settings_linear" x1="6" y1="18" x2="18" y2="18" gradientUnits="userSpaceOnUse">
                <stop stopColor="#AFC3E1" />
                <stop offset="1" stopColor="#C3D7F5" />
            </linearGradient>
        </defs>
    </g>,
    '0 0 24 24',
)
