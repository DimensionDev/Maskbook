import { createIcon } from '../utils'

export const GrayMasks = createIcon(
    'GrayMasks',
    <g fill="none">
        <path d="M0 10C0 4.477 4.477 0 10 0s10 4.477 10 10-4.477 10-10 10S0 15.523 0 10Z" fill="#F7F9FA" />
        <rect
            x="3.033"
            y="10.905"
            width="1.25"
            height="6.25"
            rx=".625"
            transform="rotate(-30 3.033 10.905)"
            fill="url(#a)"
        />
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M11.362 10.787c-.808.258-1.682.122-2.475-.371a.361.361 0 0 0-.309-.037.371.371 0 0 0-.235.219c-.355.85-.997 1.47-1.804 1.729-1.293.412-2.76-.204-3.66-1.536a4.585 4.585 0 0 1-.57-1.174 5.638 5.638 0 0 1-.156-.62l-.138-.778.645.455a.478.478 0 0 0 .42.07.623.623 0 0 0 .111-.053l.163-.18.01-.02.022-.04a3.537 3.537 0 0 1 4.122-1.4 3.537 3.537 0 0 1 1.807-1.323 3.561 3.561 0 0 1 2.363.076l.04.02c.031.016.07.03.108.043l.01.005a.46.46 0 0 0 .268-.01.467.467 0 0 0 .303-.3l.254-.742.338.714c.098.198.17.396.233.596.135.423.206.858.216 1.287.053 1.602-.794 2.957-2.086 3.37ZM6.385 10.3c-.108.034-.22.053-.336.064-.631.04-1.218-.39-1.488-.626.194-.215.582-.593 1.066-.748a1.56 1.56 0 0 1 .336-.065c.631-.04 1.218.391 1.488.627-.202.217-.59.595-1.066.748ZM9.02 9.05c.283.063.826.144 1.303-.009a1.5 1.5 0 0 0 .31-.141c.53-.33.767-1.025.85-1.374-.282-.062-.825-.143-1.302.01a1.501 1.501 0 0 0-.31.141c-.531.33-.767 1.024-.85 1.373Z"
            fill="url(#b)"
        />
        <g filter="url(#c)">
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="m11.691 7.184.136-.226 6.382 2.107-.027.262a7.5 7.5 0 0 1-.362 1.7c-.443 1.328-1.202 2.467-2.133 3.208-.696.552-1.447.841-2.16.841-.281 0-.552-.036-.814-.127-.94-.316-1.637-1.147-1.953-2.35-.307-1.148-.235-2.513.208-3.842.18-.56.425-1.084.723-1.573Zm.814 3.734c.135.063.28.09.443.09.144 0 .307-.027.479-.072.185-.062.333-.139.398-.172l.036-.018.18-.108-.099-.19c-.009-.027-.298-.579-.868-.832-.57-.253-1.175-.09-1.202-.081l-.208.054.045.208c.003.003.008.022.018.053.023.078.068.232.145.4.163.325.38.56.633.668Zm2.811.958a.91.91 0 0 0 .226.027c.217 0 .452-.063.678-.18.235-.118.389-.254.398-.263l.163-.144-.127-.172c-.018-.027-.407-.524-1.012-.66-.561-.125-1.083.098-1.179.139a.356.356 0 0 1-.015.006l-.19.09.082.199c0 .009.081.208.235.416.217.29.47.479.741.542Z"
                fill="url(#d)"
                fillOpacity=".3"
            />
        </g>
        <defs>
            <linearGradient id="a" x1="3.033" y1="17.155" x2="4.283" y2="17.155" gradientUnits="userSpaceOnUse">
                <stop stopColor="#AFC3E1" />
                <stop offset="1" stopColor="#C3D7F5" />
            </linearGradient>
            <linearGradient id="b" x1="2.444" y1="12.774" x2="13.862" y2="11.699" gradientUnits="userSpaceOnUse">
                <stop stopColor="#AFC3E1" />
                <stop offset="1" stopColor="#C3D7F5" />
            </linearGradient>
            <linearGradient id="d" x1="10.573" y1="15.076" x2="18.209" y2="15.076" gradientUnits="userSpaceOnUse">
                <stop stopColor="#B0CFEB" />
                <stop offset="1" stopColor="#C4E1FB" />
            </linearGradient>
            <filter
                id="c"
                x="6.573"
                y="2.958"
                width="15.636"
                height="16.118"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feGaussianBlur in="BackgroundImage" stdDeviation="2" />
                <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur" />
                <feBlend in="SourceGraphic" in2="effect1_backgroundBlur" result="shape" />
            </filter>
        </defs>
    </g>,
    '0 0 20 20',
)
