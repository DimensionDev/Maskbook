import { createIcon } from '../utils'

export const MaskWalletIcon = createIcon(
    'Wallet',
    <>
        <path d="M38 27.006v-.363h.819a.181.181 0 110 .363H38z" fill="#1C68F3" />
        <g filter="url(#filter0_b)">
            <path
                d="M12 19.81c0-2.104 1.606-3.81 3.586-3.81h18.828C36.394 16 38 17.706 38 19.81v12.38c0 2.104-1.606 3.81-3.586 3.81H15.586C13.606 36 12 34.294 12 32.19V19.81z"
                fill="#1C68F3"
                fillOpacity=".4"
            />
        </g>
        <path d="M28.87 25.142a8 8 0 11-8-13.856 8 8 0 018 13.856z" fill="url(#mask_wallet_paint0_linear)" />
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M19.878 18.982l1.307 2.264 6.792-3.921.292-.17a3.557 3.557 0 01-5.375 4.01l-1.317.76 1.098 1.902c.26.45.835.604 1.286.345l6.52-3.765a.941.941 0 00.345-1.286l-2.797-4.845-8.151 4.706zm3.797 1.732a2.769 2.769 0 002.587-.098 2.768 2.768 0 001.378-2.191l-3.965 2.289zm2.335-4.548a1.465 1.465 0 011.883.362l-.695.401a.68.68 0 00-1.12.647l-.695.401a1.465 1.465 0 01.627-1.811zm-3.487 2.013a1.464 1.464 0 011.883.362l-.695.401a.68.68 0 00-1.12.647l-.695.401a1.464 1.464 0 01.627-1.811zm-3.268-2.158a.941.941 0 00-.345 1.285l.575.997 8.151-4.706-.575-.996a.941.941 0 00-1.285-.345l-6.521 3.765z"
            fill="#fff"
        />
        <g filter="url(#filter1_b)">
            <path
                d="M12 23.79c0-2.093 1.606-3.79 3.586-3.79h18.828C36.394 20 38 21.697 38 23.79v10.42c0 2.093-1.606 3.79-3.586 3.79H15.586C13.606 38 12 36.303 12 34.21V23.79z"
                fill="#1C68F3"
                fillOpacity=".05"
            />
        </g>
        <path opacity=".8" d="M39 26.824V30.5a.5.5 0 01-.5.5H35a2 2 0 010-4h3.5c.5 0 .5-.176.5-.176z" fill="#1C68F3" />
        <circle cx="35" cy="29" r="1" fill="#fff" />
        <defs>
            <filter
                id="filter0_b"
                x="8"
                y="12"
                width="34"
                height="28"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feGaussianBlur in="BackgroundImage" stdDeviation="2" />
                <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur" />
                <feBlend in="SourceGraphic" in2="effect1_backgroundBlur" result="shape" />
            </filter>
            <filter
                id="filter1_b"
                x="8"
                y="16"
                width="34"
                height="26"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feGaussianBlur in="BackgroundImage" stdDeviation="2" />
                <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur" />
                <feBlend in="SourceGraphic" in2="effect1_backgroundBlur" result="shape" />
            </filter>
            <linearGradient
                id="mask_wallet_paint0_linear"
                x1="31.433"
                y1="13.777"
                x2="16.29"
                y2="20.004"
                gradientUnits="userSpaceOnUse">
                <stop stopColor="#1C68F3" />
                <stop offset="1" stopColor="#6CB8FF" />
            </linearGradient>
        </defs>
    </>,
    '0 0 48 48',
)
