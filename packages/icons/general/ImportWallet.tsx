import { createIcon } from '../utils'
import type { SvgIcon } from '@material-ui/core'

export const ImportWalletIcon: typeof SvgIcon = createIcon(
    'Index',
    <g>
        <g filter="url(#filter0_b)">
            <path
                d="M8 22.19C8 19.877 9.976 18 12.414 18h23.172C38.024 18 40 19.876 40 22.19v13.62c0 2.314-1.976 4.19-4.414 4.19H12.414C9.976 40 8 38.124 8 35.81V22.19z"
                fill="#1C68F3"
                fillOpacity=".1"
            />
        </g>
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M33.129 20.012a1.5 1.5 0 01-.141 2.117l-8 7a1.5 1.5 0 01-1.976 0l-8-7a1.5 1.5 0 011.976-2.258l5.512 4.823V8a1.5 1.5 0 013 0v16.694l5.512-4.823a1.5 1.5 0 012.117.141z"
            fill="#1C68F3"
        />
        <g filter="url(#filter1_b)">
            <path
                d="M8 25.79C8 23.697 9.976 22 12.414 22h23.172C38.024 22 40 23.697 40 25.79v10.42c0 2.093-1.976 3.79-4.414 3.79H12.414C9.976 40 8 38.303 8 36.21V25.79z"
                fill="#1C68F3"
                fillOpacity=".05"
            />
        </g>
        <defs>
            <filter
                id="filter0_b"
                x="4"
                y="14"
                width="40"
                height="30"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feGaussianBlur in="BackgroundImage" stdDeviation="2" />
                <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur" />
                <feBlend in="SourceGraphic" in2="effect1_backgroundBlur" result="shape" />
            </filter>
            <filter
                id="filter1_b"
                x="5"
                y="19"
                width="38"
                height="24"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feGaussianBlur in="BackgroundImage" stdDeviation="1.5" />
                <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur" />
                <feBlend in="SourceGraphic" in2="effect1_backgroundBlur" result="shape" />
            </filter>
        </defs>
    </g>,
    '0 0 48 48',
)
