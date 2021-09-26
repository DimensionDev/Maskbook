import { createIcon } from '../utils'
import type { SvgIcon } from '@mui/material'

export const MenuWalletsActiveIcon: typeof SvgIcon = createIcon(
    'MenuWalletsActiveIcon',
    <g>
        <path d="M19 13.503v-.182h.41a.09.09 0 110 .182H19z" fill="#1C68F3" />
        <g filter="url(#wallet_active_0)">
            <path
                d="M6 9.905C6 8.853 6.803 8 7.793 8h9.414C18.197 8 19 8.853 19 9.905v6.19C19 17.147 18.197 18 17.207 18H7.793C6.803 18 6 17.147 6 16.095v-6.19z"
                fill="#1C68F3"
                fillOpacity=".4"
            />
        </g>
        <path d="M14.434 12.571a4 4 0 11-4-6.928 4 4 0 014 6.928z" fill="url(#wallet_active_linear)" />
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M9.938 9.491l.654 1.132 3.396-1.96.146-.085a1.778 1.778 0 01-2.688 2.005l-.658.38.55.95a.47.47 0 00.642.173l3.26-1.883a.47.47 0 00.173-.642l-1.4-2.423-4.075 2.353zm1.9.866a1.384 1.384 0 001.982-1.144l-1.983 1.144zm1.167-2.274c.32-.184.72-.1.941.181l-.347.2a.34.34 0 00-.56.324l-.348.2a.732.732 0 01.314-.905zM11.26 9.09c.32-.185.72-.101.942.18l-.348.201a.34.34 0 00-.56.324l-.348.2a.732.732 0 01.314-.905zM9.627 8.01a.47.47 0 00-.172.643l.287.498 4.076-2.353-.288-.498a.47.47 0 00-.643-.172L9.627 8.01z"
            fill="#fff"
        />
        <g filter="url(#wallet_active_1)">
            <path
                d="M6 11.895C6 10.848 6.803 10 7.793 10h9.414c.99 0 1.793.848 1.793 1.895v5.21C19 18.152 18.197 19 17.207 19H7.793C6.803 19 6 18.152 6 17.105v-5.21z"
                fill="#1C68F3"
                fillOpacity=".05"
            />
        </g>
        <path
            opacity=".8"
            d="M19.5 13.412V15a.5.5 0 01-.5.5h-1.5a1 1 0 010-2h1.75c.25 0 .25-.088.25-.088z"
            fill="#1C68F3"
        />
        <circle cx="17.5" cy="14.5" r=".5" fill="#fff" />
        <defs>
            <filter
                id="wallet_active_0"
                x="2"
                y="4"
                width="21"
                height="18"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feGaussianBlur in="BackgroundImage" stdDeviation="2" />
                <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur" />
                <feBlend in="SourceGraphic" in2="effect1_backgroundBlur" result="shape" />
            </filter>
            <filter
                id="wallet_active_1"
                x="2"
                y="6"
                width="21"
                height="17"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feGaussianBlur in="BackgroundImage" stdDeviation="2" />
                <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur" />
                <feBlend in="SourceGraphic" in2="effect1_backgroundBlur" result="shape" />
            </filter>
            <linearGradient
                id="wallet_active_linear"
                x1="15.716"
                y1="6.889"
                x2="8.144"
                y2="10.002"
                gradientUnits="userSpaceOnUse">
                <stop stopColor="#1C68F3" />
                <stop offset="1" stopColor="#6CB8FF" />
            </linearGradient>
        </defs>
    </g>,
    '0 0 24 24',
)
