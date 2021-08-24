import { createIcon } from '../utils'
import type { SvgIcon } from '@material-ui/core'

export const CloudBackupIcon: typeof SvgIcon = createIcon(
    'CloudBackupIcon',
    <g>
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M17.566 16.516c.531 0 .962.43.962.962v6.736h6.737a.962.962 0 010 1.925h-7.7a.962.962 0 01-.962-.962v-7.699c0-.532.431-.962.963-.962zM37.775 30.552c0-.531.431-.962.963-.962h7.698c.532 0 .963.43.963.962v7.699a.962.962 0 11-1.925 0v-6.736h-6.736a.962.962 0 01-.963-.963z"
            fill="#1C68F3"
            stroke="#1C68F3"
            strokeWidth=".2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M28.458 14.919c2.073-.633 4.265-.701 6.37-.199a12.554 12.554 0 015.668 3.071 13.538 13.538 0 013.556 5.577c.182.54-.086 1.132-.598 1.323-.512.191-1.073-.091-1.255-.631a11.456 11.456 0 00-3.009-4.719 10.622 10.622 0 00-4.796-2.599 10.27 10.27 0 00-5.39.168 10.709 10.709 0 00-4.664 2.916l-6.08 6.026a.947.947 0 01-1.39-.046 1.077 1.077 0 01.043-1.465l6.07-6.015a12.653 12.653 0 015.475-3.407zM47.13 29.915a1.077 1.077 0 01-.043 1.465l-6.07 6.015a12.655 12.655 0 01-5.474 3.407c-2.074.633-4.265.701-6.37.199a12.554 12.554 0 01-5.668-3.071 13.538 13.538 0 01-3.557-5.577c-.181-.54.087-1.132.599-1.323.511-.191 1.073.091 1.254.631a11.455 11.455 0 003.01 4.72 10.622 10.622 0 004.796 2.598 10.27 10.27 0 005.39-.168 10.71 10.71 0 004.664-2.915l6.08-6.027a.947.947 0 011.39.046z"
            fill="#1C68F3"
            stroke="#1C68F3"
            strokeWidth=".2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <g filter="url(#filter0_b)">
            <path
                d="M43 36.666a12.545 12.545 0 00-12.334-10c-4.833 0-9 2.667-11 6.672-5.166.662-9 4.824-9 10 0 5.495 4.5 9.995 10 9.995h21.667a8.253 8.253 0 008.334-8.175v-.16c0-4.333-3.5-7.998-7.667-8.336"
                fill="#1C68F3"
                fillOpacity=".1"
            />
        </g>
        <defs>
            <filter
                id="filter0_b"
                x="7.667"
                y="23.667"
                width="46"
                height="32.667"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feGaussianBlur in="BackgroundImage" stdDeviation="1.5" />
                <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur" />
                <feBlend in="SourceGraphic" in2="effect1_backgroundBlur" result="shape" />
            </filter>
        </defs>
    </g>,
    '0 0 60 60',
)
