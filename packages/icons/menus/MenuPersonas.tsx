import { createIcon } from '../utils'
import type { SvgIcon } from '@mui/material'

export const MenuPersonasIcon: typeof SvgIcon = createIcon(
    'MenuPersonasIcon',
    <g>
        <rect
            x="3.641"
            y="13.087"
            width="1.5"
            height="7.5"
            rx=".75"
            transform="rotate(-30 3.64 13.087)"
            fill="url(#personas_linear_0)"
        />
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M13.635 12.944c-.97.31-2.018.146-2.97-.445a.434.434 0 00-.37-.045.446.446 0 00-.282.263c-.427 1.021-1.196 1.765-2.166 2.075-1.55.495-3.312-.245-4.392-1.843a5.502 5.502 0 01-.684-1.409 6.763 6.763 0 01-.187-.744l-.165-.934.774.546a.574.574 0 00.505.084c.046-.015.09-.04.132-.063l.196-.215.013-.025.025-.048a4.253 4.253 0 012.259-1.718 4.244 4.244 0 012.687.037 4.244 4.244 0 012.168-1.587 4.274 4.274 0 012.837.091l.049.025c.036.02.082.035.128.051l.012.006c.1.03.211.024.322-.011a.56.56 0 00.363-.36l.305-.89.406.856c.117.238.203.475.28.715.161.507.246 1.03.258 1.544.065 1.923-.952 3.55-2.503 4.044zm-5.973-.585c-.129.042-.264.065-.402.078-.758.049-1.462-.47-1.786-.752.233-.258.698-.711 1.28-.897.138-.044.264-.064.402-.078.758-.048 1.462.47 1.786.752-.242.261-.707.715-1.28.897zm3.164-1.498c.34.075.991.172 1.563-.01.139-.045.262-.104.373-.17.637-.397.92-1.23 1.02-1.648-.339-.075-.99-.172-1.563.01a1.802 1.802 0 00-.373.17c-.636.397-.92 1.23-1.02 1.648z"
            fill="url(#personas_linear_1)"
        />
        <g filter="url(#personas_0)">
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14.03 8.621l.162-.27 7.659 2.527-.033.314a9.007 9.007 0 01-.434 2.04c-.531 1.594-1.443 2.96-2.56 3.85-.835.662-1.736 1.01-2.593 1.01-.336 0-.661-.044-.976-.153-1.128-.38-1.963-1.377-2.343-2.82-.369-1.378-.282-3.016.25-4.61.217-.673.51-1.302.867-1.888zm.976 4.48c.163.076.336.109.532.109.173 0 .368-.033.575-.087.221-.074.4-.166.477-.207.026-.013.04-.02.043-.02l.217-.13-.12-.229c-.01-.032-.357-.694-1.04-.998-.684-.303-1.41-.108-1.443-.097l-.25.065.055.25c.003.002.01.025.02.063.028.093.082.278.175.479.195.39.455.672.759.803zm3.374 1.15c.086.022.173.033.27.033.261 0 .543-.076.814-.217.282-.141.467-.304.478-.315l.195-.173-.152-.206c-.022-.033-.488-.63-1.215-.792-.673-.15-1.299.117-1.414.166-.01.004-.015.007-.018.007l-.228.109.098.239c0 .01.098.249.282.498.26.348.564.575.89.651z"
                fill="url(#personas_linear_2)"
                fillOpacity=".3"
            />
        </g>
        <defs>
            <linearGradient
                id="personas_linear_0"
                x1="3.641"
                y1="20.587"
                x2="5.141"
                y2="20.587"
                gradientUnits="userSpaceOnUse">
                <stop stopColor="#AFC3E1" />
                <stop offset="1" stopColor="#C3D7F5" />
            </linearGradient>
            <linearGradient
                id="personas_linear_1"
                x1="2.933"
                y1="15.329"
                x2="16.636"
                y2="14.039"
                gradientUnits="userSpaceOnUse">
                <stop stopColor="#AFC3E1" />
                <stop offset="1" stopColor="#C3D7F5" />
            </linearGradient>
            <linearGradient
                id="personas_linear_2"
                x1="12.688"
                y1="18.091"
                x2="21.851"
                y2="18.091"
                gradientUnits="userSpaceOnUse">
                <stop stopColor="#B0CFEB" />
                <stop offset="1" stopColor="#C4E1FB" />
            </linearGradient>
            <filter
                id="personas_0"
                x="8.688"
                y="4.35"
                width="17.163"
                height="17.741"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feGaussianBlur in="BackgroundImage" stdDeviation="2" />
                <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur" />
                <feBlend in="SourceGraphic" in2="effect1_backgroundBlur" result="shape" />
            </filter>
        </defs>
    </g>,
    '0 0 24 24',
)
