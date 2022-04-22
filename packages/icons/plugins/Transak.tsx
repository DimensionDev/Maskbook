import { createIcon } from '../utils'
import type { SvgIcon } from '@mui/material'

export const TransakIcon: typeof SvgIcon = createIcon(
    'Transak',
    <g>
        <path
            opacity="0.6"
            d="M7.3634 22.3193C6.39691 22.3193 5.6134 21.5358 5.6134 20.5693L5.6134 10.8521C5.6134 9.88564 6.39691 9.10214 7.36341 9.10214L23.9337 9.10214C24.9002 9.10214 25.6837 9.88564 25.6837 10.8521L25.6837 20.5693C25.6837 21.5358 24.9002 22.3193 23.9337 22.3193L7.3634 22.3193Z"
            fill="url(#paint0_linear_1060_927)"
        />
        <g filter="url(#filter0_b_1060_927)">
            <path
                d="M20.6366 5.68066C21.6031 5.68066 22.3866 6.46417 22.3866 7.43066L22.3866 17.1479C22.3866 18.1144 21.6031 18.8979 20.6366 18.8979L4.06628 18.8979C3.09979 18.8979 2.31628 18.1144 2.31628 17.1479L2.31628 7.43066C2.31628 6.46416 3.09979 5.68066 4.06628 5.68066L20.6366 5.68066Z"
                fill="url(#paint1_linear_1060_927)"
                fillOpacity="0.9"
            />
        </g>
        <path opacity="0.3" d="M2.31628 8.13251H22.3866V10.7864H2.31628V8.13251Z" fill="white" />
        <ellipse opacity="0.8" cx="18.4249" cy="16.095" rx="1.2998" ry="1.2998" fill="#FF601C" />
        <ellipse opacity="0.8" cx="19.7237" cy="16.095" rx="1.2998" ry="1.2998" fill="#FFD977" />
        <defs>
            <filter
                id="filter0_b_1060_927"
                x="-0.683716"
                y="2.68066"
                width="26.0703"
                height="19.2172"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feGaussianBlur in="BackgroundImage" stdDeviation="1.5" />
                <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_1060_927" />
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_backgroundBlur_1060_927" result="shape" />
            </filter>
            <linearGradient
                id="paint0_linear_1060_927"
                x1="6.7459"
                y1="22.3193"
                x2="25.6837"
                y2="10.0639"
                gradientUnits="userSpaceOnUse">
                <stop stopColor="#85C1FF" />
                <stop offset="1" stopColor="#2353FF" />
            </linearGradient>
            <linearGradient
                id="paint1_linear_1060_927"
                x1="22.3866"
                y1="6.56093"
                x2="2.31628"
                y2="18.8968"
                gradientUnits="userSpaceOnUse">
                <stop stopColor="#C9A8FF" />
                <stop offset="0.465773" stopColor="#5C70FF" />
                <stop offset="1" stopColor="#0B53FF" />
            </linearGradient>
        </defs>
    </g>,
    '0 0 28 28',
)
