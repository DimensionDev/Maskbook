import { createIcon } from '../utils'
import type { SvgIcon } from '@mui/material'

export const CloudLinkIcon: typeof SvgIcon = createIcon(
    'CloudLink',
    <g>
        <path
            d="M30.798 17.565c.796.33 1.503.841 2.066 1.492a5.497 5.497 0 01.106 7.081l-3.144 3.86a5.57 5.57 0 01-7.769.77 5.503 5.503 0 01-.858-7.721l3.007-3.694.096.908c.067.638.287 1.223.62 1.723l-1.999 2.454a3.309 3.309 0 00-.724 2.432 3.303 3.303 0 001.216 2.23 3.337 3.337 0 002.445.72 3.343 3.343 0 002.24-1.21l3.145-3.864a3.306 3.306 0 00-1.947-5.337l1.502-1.844h-.002zm-1.671 6.962a5.548 5.548 0 01-2.066-1.492 5.511 5.511 0 01-1.214-4.793 5.511 5.511 0 011.108-2.288l3.144-3.86a5.542 5.542 0 013.741-2.06 5.576 5.576 0 014.103 1.197 5.53 5.53 0 012.03 3.744 5.499 5.499 0 01-1.248 4.07L35.72 22.74l-.095-.907a3.838 3.838 0 00-.62-1.725l1.998-2.452a3.303 3.303 0 00-.492-4.662 3.343 3.343 0 00-4.686.49l-3.144 3.862a3.307 3.307 0 00-.543 3.217c.196.537.528 1.015.964 1.387.437.372.962.625 1.526.735l-1.502 1.843h.002z"
            fill="#1C68F3"
        />
        <g filter="url(#filter0_b)">
            <path
                d="M32.25 27.5A9.409 9.409 0 0023 20c-3.625 0-6.75 2-8.25 5.004C10.875 25.5 8 28.622 8 32.503 8 36.625 11.375 40 15.5 40h16.25A6.19 6.19 0 0038 33.868v-.12c0-3.25-2.625-5.998-5.75-6.251"
                fill="#1C68F3"
                fillOpacity=".1"
            />
        </g>
        <defs>
            <filter
                id="filter0_b"
                x="5"
                y="17"
                width="36"
                height="26"
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
