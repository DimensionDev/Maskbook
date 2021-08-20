import { createIcon } from '../utils'
import type { SvgIcon } from '@material-ui/core'

export const MenuLabsIcon: typeof SvgIcon = createIcon(
    'MenuLabsIcon',
    <g>
        <circle cx="11" cy="12" r="6" fill="url(#labs_linear)" />
        <g filter="url(#labs)">
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.143 14.676c-.091-.4-.567-.61-.873-.335-.937.838-1.408 1.66-1.234 2.333.425 1.648 4.56 1.778 9.235.29 4.675-1.489 8.12-4.031 7.693-5.68-.142-.55-.697-.93-1.548-1.138-.404-.1-.723.31-.617.714a.644.644 0 00.459.454c.137.036.258.077.363.121a.326.326 0 01.143.496l-.01.017c-.237.346-.666.78-1.311 1.255-1.279.945-3.202 1.908-5.464 2.629-2.263.72-4.354 1.034-5.889.986-.774-.024-1.345-.14-1.71-.294a.326.326 0 01-.133-.513c.154-.226.39-.489.714-.776a.575.575 0 00.182-.559zm13.795-3.11v0z"
                fill="url(#paint1_linear)"
                fillOpacity=".3"
            />
        </g>
        <circle cx="17.309" cy="6.656" fill="#B0CFEB" fillOpacity=".8" r="1.156" />
        <defs>
            <linearGradient id="labs_linear" x1="5" y1="18" x2="17" y2="18" gradientUnits="userSpaceOnUse">
                <stop stopColor="#AFC3E1" />
                <stop offset="1" stopColor="#C3D7F5" />
            </linearGradient>
            <linearGradient id="paint1_linear" x1="3" y1="18" x2="20" y2="18" gradientUnits="userSpaceOnUse">
                <stop stopColor="#B0CFEB" />
                <stop offset="1" stopColor="#C4E1FB" />
            </linearGradient>
            <filter
                id="labs"
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
