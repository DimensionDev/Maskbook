import { createIcon } from '../utils'
import type { SvgIcon } from '@mui/material'

export const RestoreIcon: typeof SvgIcon = createIcon(
    'Restore',
    <g>
        <g filter="url(#filter0_b)">
            <path
                d="M7 25C7 23.8954 7.89543 23 9 23H39C40.1046 23 41 23.8954 41 25V35C41 35.5523 40.5523 36 40 36H8C7.44772 36 7 35.5523 7 35V25Z"
                fill="#FFD149"
                fillOpacity="0.1"
            />
        </g>
        <path
            d="M25.6245 36.13C25.2138 36.1818 25.0988 36.1714 24.8031 36.1714C24.1491 36.1714 23.5219 35.9094 23.0594 35.4431C22.5969 34.9767 22.3371 34.3442 22.3371 33.6847C22.3371 33.0252 22.5969 32.3927 23.0594 31.9264C23.5219 31.46 24.1491 31.198 24.8031 31.198C25.0988 31.198 25.2261 31.2105 25.6245 31.1214C30.2198 30.6928 33.8419 26.8355 33.8419 22.0836C33.8422 20.8867 33.6085 19.7015 33.1544 18.5957C32.7002 17.4899 32.0344 16.4851 31.195 15.6389C30.3556 14.7927 29.359 14.1215 28.2623 13.6638C27.1655 13.2061 25.9901 12.9708 24.8031 12.9713C20.0907 12.9713 16.2654 16.6216 15.8547 21.2554H20.6944L13.2983 29.5437L5.9043 21.2554H10.8734C11.0788 17.6706 12.636 14.3008 15.2259 11.8363C17.8157 9.3718 21.2422 7.9993 24.8031 8C26.6374 7.99973 28.4538 8.36381 30.1486 9.07146C31.8434 9.77911 33.3833 10.8165 34.6804 12.1243C35.9776 13.4321 37.0066 14.9847 37.7086 16.6936C38.4106 18.4024 38.7719 20.234 38.7719 22.0836C38.7662 25.6728 37.4026 29.1246 34.9595 31.7348C32.5163 34.345 29.1776 35.917 25.6245 36.13Z"
            fill="#FFC524"
        />
        <g filter="url(#filter1_b)">
            <path
                d="M6 29C6 27.8954 6.89543 27 8 27H40C41.1046 27 42 27.8954 42 29V39C42 39.5523 41.5523 40 41 40H7C6.44772 40 6 39.5523 6 39V29Z"
                fill="#FFD149"
                fillOpacity="0.2"
            />
        </g>
        <defs>
            <filter
                id="filter0_b"
                x="3"
                y="19"
                width="42"
                height="21"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feGaussianBlur in="BackgroundImage" stdDeviation="2" />
                <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur" />
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_backgroundBlur" result="shape" />
            </filter>
            <filter
                id="filter1_b"
                x="2"
                y="23"
                width="44"
                height="21"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feGaussianBlur in="BackgroundImage" stdDeviation="2" />
                <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur" />
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_backgroundBlur" result="shape" />
            </filter>
            <linearGradient
                id="paint0_linear"
                x1="5.9043"
                y1="36.1723"
                x2="38.7719"
                y2="36.1723"
                gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFB110" />
                <stop offset="1" stopColor="#FFC524" />
            </linearGradient>
        </defs>
    </g>,
    '0 0 48 48',
)
