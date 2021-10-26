export const NFTAvatarRingIcon = ({ size = 24, text = '' }: { size?: number; text: string }) => (
    <svg width="200" height="200">
        <defs>
            <path
                id="myPath"
                fill="none"
                stroke="#000000"
                strokeMiterlimit="10"
                d="M10 90 a40 40 0 1 0 160 0 a40 40 0 1 0 -160 0 Z">
                <animateTransform
                    attributeName="transform"
                    begin="0s"
                    dur="30s"
                    type="rotate"
                    from="0 90 90"
                    to="360 90 90"
                    repeatCount="indefinite"
                />
            </path>

            <linearGradient id="gradient-horizontal">
                <stop offset="5%" stopColor="#FF0000" />
                <stop offset="20%" stopColor="#FF8A00" />
                <stop offset="40%" stopColor="#FFC700" />
                <stop offset="60%" stopColor="#52FF00" />
                <stop offset="80%" stopColor="#00FFFF" />
                <stop offset="90%" stopColor="#0038FF" />
                <stop offset="100%" stopColor="#00FF00" />
            </linearGradient>
        </defs>
        <circle cx="90" cy="90" r="75" stroke="black" strokeWidth="15" fill="none" />
        <text>
            <textPath xlinkHref="#myPath">
                <tspan fontWeight="bold" fill="url(#gradient-horizontal)">
                    {text}
                </tspan>
            </textPath>
        </text>
    </svg>
)
