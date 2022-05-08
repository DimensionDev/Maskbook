import { createIcon } from '@masknet/icons'

export const CheckedIcon = createIcon(
    'CheckedIcon',
    <g>
        <g filter="url(#filter0_d_180_51329)">
            <circle cx="20" cy="16" r="10" fill="#1C68F3" />
        </g>
        <path
            d="M15.166 16.6309L18.4993 20.1309L25.166 13.1309"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <defs>
            <filter
                id="filter0_d_180_51329"
                x="0"
                y="0"
                width="40"
                height="40"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                />
                <feOffset dy="4" />
                <feGaussianBlur stdDeviation="5" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values="0 0 0 0 0.109804 0 0 0 0 0.407843 0 0 0 0 0.952941 0 0 0 0.2 0" />
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_180_51329" />
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_180_51329" result="shape" />
            </filter>
        </defs>
    </g>,
    '0 0 40 40',
)

export const UncheckIcon = createIcon(
    'UncheckIcon',
    <g>
        <circle cx="10.166" cy="10.1309" r="9" stroke="#CFD9DE" strokeWidth="2" fill="none" />
    </g>,
    '0 0 21 21',
)
