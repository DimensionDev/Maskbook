import { createIcon } from '../utils'
import type { SvgIcon } from '@material-ui/core'

export const EmptyIcon: typeof SvgIcon = createIcon(
    'EmptyIcon',
    <g>
        <g clipPath="url(#empty_clip0)">
            <path
                d="M94 77c0 8.284-20.147 15-45 15S4 85.284 4 77c0-4.353 5.564-8.274 14.45-11.014v.608L47.906 78.5 77.35 66.578v-1.227C87.51 68.1 94 72.298 94 77z"
                fill="url(#empty_paint0_linear)"
            />
            <path d="M77.36 36.64L47.894 48.649v-22L77.36 36.64z" fill="#699EFF" />
            <path d="M47.895 26.648v21.93L18.43 36.64l29.466-9.992z" fill="#82AEFF" />
            <g filter="url(#empty_filter0_b)">
                <path d="M18.43 66.615l29.465 11.931V48.572l-29.466-11.93v29.973z" fill="#7DABFF" fillOpacity=".5" />
            </g>
            <g filter="url(#empty_filter1_b)">
                <path d="M47.895 48.572v29.974l29.466-11.931V36.64L47.895 48.57z" fill="#7AA9FF" fillOpacity=".32" />
            </g>
            <g filter="url(#empty_filter2_b)">
                <path
                    d="M0 43.95l29.466 11.995 18.43-7.31-29.468-11.994L0 43.951zm47.896 4.685l18.429 7.31L95.79 43.95l-18.429-7.31-29.465 11.994z"
                    fill="#6CA0FF"
                    fillOpacity=".2"
                />
            </g>
            <g filter="url(#empty_filter3_b)">
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M33.864 21.624a4 4 0 00-2.829 4.899l1.553 5.795a4 4 0 004.9 2.829l3.863-1.035 1.138.657a.1.1 0 00.137-.037l.657-1.138.286-.077.86-.23 2.717-.728a4 4 0 002.829-4.9l-1.553-5.795a4 4 0 00-4.899-2.828l-9.66 2.588zm3.037 7.469a1 1 0 10-.518-1.933 1 1 0 00.518 1.933zm4.57-2.26a1 1 0 11-1.932.517 1 1 0 011.932-.518zm3.157.189a1 1 0 10-.518-1.932 1 1 0 00.518 1.932z"
                    fill="#1C68F3"
                    fillOpacity=".2"
                />
            </g>
        </g>
        <defs>
            <filter
                id="empty_filter0_b"
                x="14.429"
                y="32.642"
                width="37.466"
                height="49.905"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feGaussianBlur in="BackgroundImage" stdDeviation="2" />
                <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur" />
                <feBlend in="SourceGraphic" in2="effect1_backgroundBlur" result="shape" />
            </filter>
            <filter
                id="empty_filter1_b"
                x="43.895"
                y="32.641"
                width="37.466"
                height="49.905"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feGaussianBlur in="BackgroundImage" stdDeviation="2" />
                <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur" />
                <feBlend in="SourceGraphic" in2="effect1_backgroundBlur" result="shape" />
            </filter>
            <filter
                id="empty_filter2_b"
                x="-4"
                y="32.641"
                width="103.79"
                height="27.304"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feGaussianBlur in="BackgroundImage" stdDeviation="2" />
                <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur" />
                <feBlend in="SourceGraphic" in2="effect1_backgroundBlur" result="shape" />
            </filter>
            <filter
                id="empty_filter3_b"
                x="26.898"
                y="14.898"
                width="27.214"
                height="24.386"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feGaussianBlur in="BackgroundImage" stdDeviation="2" />
                <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur" />
                <feBlend in="SourceGraphic" in2="effect1_backgroundBlur" result="shape" />
            </filter>
            <linearGradient id="empty_paint0_linear" x1="49" y1="62" x2="49" y2="80.158" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3E7DEF" stopOpacity=".29" />
                <stop offset="1" stopColor="#8DB3F9" stopOpacity="0" />
            </linearGradient>
            <clipPath id="empty_clip0">
                <path fill="#fff" d="M0 0h96v96H0z" />
            </clipPath>
        </defs>
    </g>,
    '0 0 96 96',
)
