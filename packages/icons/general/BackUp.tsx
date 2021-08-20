import { createIcon } from '../utils'

export const BackUpIcon = createIcon(
    'BackUpIcon',
    <g>
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M5.489 5.161a.3.3 0 01.3.3v2.106h2.106a.3.3 0 110 .601H5.489a.3.3 0 01-.3-.3V5.462a.3.3 0 01.3-.3zM11.804 9.548a.3.3 0 01.301-.301h2.406a.3.3 0 01.3.3v2.406a.3.3 0 11-.6 0V9.848h-2.106a.3.3 0 01-.3-.3z"
            fill="#1C68F3"
        />
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8.893 4.662a3.793 3.793 0 011.99-.062 3.923 3.923 0 011.772.96 4.23 4.23 0 011.111 1.743.329.329 0 01-.187.413.303.303 0 01-.392-.197 3.58 3.58 0 00-.94-1.475 3.32 3.32 0 00-1.5-.812 3.21 3.21 0 00-1.684.052 3.346 3.346 0 00-1.457.912l-1.9 1.883a.296.296 0 01-.434-.015.337.337 0 01.013-.457l1.897-1.88a3.955 3.955 0 011.71-1.065zm5.835 4.686c.116.13.11.336-.013.458l-1.897 1.88a3.954 3.954 0 01-1.711 1.065 3.792 3.792 0 01-1.99.062 3.923 3.923 0 01-1.772-.96 4.23 4.23 0 01-1.111-1.743.329.329 0 01.187-.413c.16-.06.335.028.392.197a3.58 3.58 0 00.94 1.475c.427.4.942.68 1.499.812a3.209 3.209 0 001.684-.053 3.346 3.346 0 001.458-.91l1.9-1.884a.296.296 0 01.434.014z"
            fill="#1C68F3"
            stroke="#1C68F3"
            strokeWidth=".2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <g filter="url(#backup_filter0_b)">
            <path
                d="M13.438 11.458a3.92 3.92 0 00-3.855-3.125c-1.51 0-2.812.833-3.437 2.085-1.615.207-2.813 1.508-2.813 3.125a3.134 3.134 0 003.125 3.123h6.771a2.58 2.58 0 002.604-2.554v-.05c0-1.354-1.093-2.5-2.396-2.605"
                fill="#1C68F3"
                fillOpacity=".1"
            />
        </g>
        <defs>
            <filter
                id="backup_filter0_b"
                x=".333"
                y="5.333"
                width="18.5"
                height="14.333"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feGaussianBlur in="BackgroundImage" stdDeviation="1.5" />
                <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur" />
                <feBlend in="SourceGraphic" in2="effect1_backgroundBlur" result="shape" />
            </filter>
        </defs>
    </g>,
    '0 0 20 20',
)
