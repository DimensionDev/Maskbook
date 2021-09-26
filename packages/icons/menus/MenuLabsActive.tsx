import { createIcon } from '../utils'
import type { SvgIcon } from '@mui/material'

export const MenuLabsActiveIcon: typeof SvgIcon = createIcon(
    'MenuLabsActiveIcon',
    <g>
        <circle cx="11" cy="12" r="6" fill="url(#labs_active_linear)" />
        <g filter="url(#labs_active)">
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.143 14.676c-.091-.4-.567-.61-.873-.335-.937.838-1.408 1.66-1.234 2.333.425 1.648 4.56 1.778 9.235.29 4.675-1.489 8.12-4.031 7.693-5.68-.142-.55-.697-.93-1.548-1.138-.404-.1-.723.31-.617.714a.644.644 0 00.459.454c.137.036.258.077.363.121a.326.326 0 01.143.496l-.01.017c-.237.346-.666.78-1.311 1.255-1.279.945-3.202 1.908-5.464 2.629-2.263.72-4.354 1.034-5.889.986-.774-.024-1.345-.14-1.71-.294a.326.326 0 01-.133-.513c.154-.226.39-.489.714-.776a.575.575 0 00.182-.559zm13.795-3.11v0z"
                fill="#1C68F3"
                fillOpacity=".1"
            />
        </g>
        <circle cx="17.309" cy="6.656" fill="#1C68F3" r="1.156" />
        <defs>
            <linearGradient
                id="labs_active_linear"
                x1="5.073"
                y1="11.579"
                x2="17.244"
                y2="9.945"
                gradientUnits="userSpaceOnUse">
                <stop stopColor="#1C68F3" />
                <stop offset="1" stopColor="#6CB8FF" />
            </linearGradient>
            <filter
                id="labs_active"
                x="-1"
                y="6.131"
                width="25"
                height="15.869"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feGaussianBlur in="BackgroundImage" stdDeviation="2" />
                <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur" />
                <feBlend in="SourceGraphic" in2="effect1_backgroundBlur" result="shape" />
            </filter>
        </defs>
    </g>,
    '0 0 24 24',
)
