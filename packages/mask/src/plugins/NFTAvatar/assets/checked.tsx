import { createIcon } from '@masknet/icons'

export const CheckedIcon = createIcon(
    'CheckedIcon',
    <g>
        <g filter="url(#filter0_d_180_51329)">
            <circle cx="18.9998" cy="15" r="8.33333" fill="#3DC233" />
        </g>
        <path
            d="M14.8335 15.4167L17.6113 18.3333L23.1668 12.5"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <defs>
            <filter
                id="filter0_d_180_51329"
                x="0.666504"
                y="0.666626"
                width="36.6665"
                height="36.6666"
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
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_180_51329" />
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_180_51329" result="shape" />
            </filter>
        </defs>
    </g>,
    '0 0 38 38',
)

export const UncheckIcon = createIcon(
    'UncheckIcon',
    <g>
        <circle cx="9.99984" cy="9.99996" r="7.33333" stroke="#CFD9DE" strokeWidth="2" fill="none" />
    </g>,
    '0 0 20 20',
)
