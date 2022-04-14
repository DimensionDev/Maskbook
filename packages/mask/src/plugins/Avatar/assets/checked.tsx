import { createIcon } from '@masknet/icons'

export const CheckedIcon = createIcon(
    'CheckedIcon',
    <g>
        <g filter="url(#filter0_d_1838_8775)">
            <circle cx="20" cy="16" r="10" fill="#3DC233" />
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
                id="filter0_d_1838_8775"
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
                <feColorMatrix type="matrix" values="0 0 0 0 0.239216 0 0 0 0 0.760784 0 0 0 0 0.2 0 0 0 0.2 0" />
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1838_8775" />
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1838_8775" result="shape" />
            </filter>
        </defs>
    </g>,
    '0 0 40 40',
)

export const UncheckIcon = createIcon(
    'UncheckIcon',
    <g>
        <circle cx="20" cy="16" r="10" fill="none" stroke="#CFD9DE" strokeWidth="2" />
    </g>,
    '0 0 40 40',
)
