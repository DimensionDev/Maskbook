import { createIcon } from '../utils'
import type { SvgIcon } from '@mui/material'

export const SignInAccountIcon: typeof SvgIcon = createIcon(
    'SignInAccount',
    <g>
        <path
            d="M15.7858 23.4263C15.71 23.4481 15.63 23.4508 15.553 23.4341C15.2905 23.3779 15.1211 23.1172 15.1746 22.8518C15.6532 20.4796 17.2368 18.4785 19.4107 17.4989C19.7327 17.354 20.0646 17.2322 20.4038 17.1344C20.6608 17.0603 20.9303 17.2117 21.0055 17.4725C21.0807 17.7334 20.9333 18.005 20.6762 18.0791C20.3805 18.1644 20.0894 18.2712 19.8109 18.3967C17.9195 19.249 16.5417 20.9906 16.1251 23.0556C16.108 23.1426 16.0673 23.2232 16.0074 23.2886C15.9476 23.3539 15.8709 23.4016 15.7858 23.4263Z"
            fill="white"
        />
        <path
            d="M24 24C27.8675 24 31 20.8675 31 17C31 13.1325 27.8675 10 24 10C20.1325 10 17 13.1325 17 17C17 20.8675 20.1325 24 24 24ZM24 27.5C19.3275 27.5 10 29.845 10 34.5V37C10 37.5523 10.4477 38 11 38H37C37.5523 38 38 37.5523 38 37V34.5C38 29.845 28.6725 27.5 24 27.5Z"
            fill="url(#paint0_linear)"
        />
        <g filter="url(#filter0_b)">
            <rect x="27" y="26" width="12" height="10" rx="1" fill="#1C68F3" fillOpacity="0.1" />
        </g>
        <rect x="30" y="29" width="7" height="1" rx="0.5" fill="white" />
        <rect x="30" y="32" width="7" height="1" rx="0.5" fill="white" />
        <defs>
            <filter
                id="filter0_b"
                x="23"
                y="22"
                width="20"
                height="18"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feGaussianBlur in="BackgroundImage" stdDeviation="2" />
                <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur" />
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_backgroundBlur" result="shape" />
            </filter>
            <linearGradient
                id="paint0_linear"
                x1="10.1712"
                y1="23.0188"
                x2="38.5701"
                y2="19.2058"
                gradientUnits="userSpaceOnUse">
                <stop stopColor="#1C68F3" />
                <stop offset="1" stopColor="#6CB8FF" />
            </linearGradient>
        </defs>
    </g>,
    '0 0 48 48',
)
