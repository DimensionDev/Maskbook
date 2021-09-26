import { createIcon } from '../utils'

export const WalletIcon = createIcon(
    'WalletIcon',
    <g>
        <path
            d="M.423 12c0-6.627 5.373-12 12-12 6.628 0 12 5.373 12 12s-5.372 12-12 12c-6.627 0-12-5.373-12-12Z"
            fill="#fff"
        />
        <path d="M19.423 11.662v-.5h.25a.25.25 0 1 1 0 .5h-.25Z" fill="#FF5F5F" />
        <g filter="url(#a)">
            <path
                d="M6.423 7.905C6.423 6.853 7.226 6 8.216 6h9.414c.99 0 1.793.853 1.793 1.905v6.19c0 1.052-.802 1.905-1.793 1.905H8.216c-.99 0-1.793-.853-1.793-1.905v-6.19Z"
                fill="#1C68F3"
                fillOpacity=".8"
            />
        </g>
        <g filter="url(#b)">
            <path
                d="M6.423 9.895C6.423 8.848 7.226 8 8.216 8h9.414c.99 0 1.793.848 1.793 1.895v5.21c0 1.047-.802 1.895-1.793 1.895H8.216c-.99 0-1.793-.848-1.793-1.895v-5.21Z"
                fill="#fff"
                fillOpacity=".2"
            />
        </g>
        <path d="M19.923 11.412V13a.5.5 0 0 1-.5.5h-1.5a1 1 0 0 1 0-2h1.75c.25 0 .25-.088.25-.088Z" fill="#FF5F5F" />
        <circle cx="17.923" cy="12.5" r=".5" fill="#fff" />
        <path
            opacity=".21"
            d="M9.103 18.64c-1.904-.817-1.856-3.44-.973-5.494.882-2.054 1.858-2.48 3.763-1.662 1.343 1.125 1.561 3.383 1.561 5.508-.906 1.188-2.257 1.649-4.351 1.649Z"
            fill="#135CE2"
        />
        <path
            d="M7.77 18.354c-1.904-.818-2.733-3.146-1.85-5.2.882-2.054 3.14-3.056 5.045-2.238 1.905.818 2.733 3.146 1.85 5.2-.881 2.054-3.14 3.056-5.045 2.238Z"
            fill="#135CE2"
        />
        <path
            d="M7.366 18.044c-1.881-.808-2.7-3.109-1.828-5.139.872-2.03 3.104-3.02 4.986-2.211 1.882.808 2.7 3.109 1.828 5.139-.872 2.03-3.104 3.02-4.986 2.211Z"
            fill="url(#c)"
        />
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="m7.38 12.733-.515 1.201 3.34 1.435.144.062c-.465.664-1.303.949-2.025.639-.596-.257-.952-.85-.967-1.497l-.647-.278-.434 1.009c-.102.238-.006.51.216.604l3.206 1.378c.222.095.484-.022.587-.26l1.104-2.57-4.009-1.723Zm.362 2.005c.068.427.331.8.736.974a1.26 1.26 0 0 0 1.213-.136l-1.95-.838Zm2.376-.487c.314.135.467.497.37.841l-.342-.146a.319.319 0 0 0-.182-.335.319.319 0 0 0-.369.098l-.342-.147c.184-.307.551-.446.865-.311Zm-1.714-.737c.314.135.466.497.37.842l-.343-.147a.319.319 0 0 0-.182-.335.319.319 0 0 0-.369.098l-.341-.146c.183-.308.55-.447.865-.312Zm-.055-1.93c-.222-.095-.484.022-.587.26l-.227.529 4.009 1.722.227-.529c.102-.238.006-.51-.215-.604l-3.207-1.378Z"
            fill="#fff"
        />
        <defs>
            <filter
                id="a"
                x="2.423"
                y="2"
                width="21"
                height="18"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feGaussianBlur in="BackgroundImage" stdDeviation="2" />
                <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur" />
                <feBlend in="SourceGraphic" in2="effect1_backgroundBlur" result="shape" />
            </filter>
            <filter
                id="b"
                x="2.423"
                y="4"
                width="21"
                height="17"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feGaussianBlur in="BackgroundImage" stdDeviation="2" />
                <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur" />
                <feBlend in="SourceGraphic" in2="effect1_backgroundBlur" result="shape" />
            </filter>
            <linearGradient id="c" x1="5.798" y1="12.375" x2="11.798" y2="16.734" gradientUnits="userSpaceOnUse">
                <stop stopColor="#1C68F3" />
                <stop offset="1" stopColor="#307CFF" />
            </linearGradient>
        </defs>
    </g>,
    '0 0 24 24',
)
