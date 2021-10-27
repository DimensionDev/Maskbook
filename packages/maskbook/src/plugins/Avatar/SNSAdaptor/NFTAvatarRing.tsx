export const NFTAvatarRingIcon = ({
    width = 15,
    size = 24,
    text = '',
}: {
    width?: number
    size?: number
    text: string
}) => {
    const r = size / 2 - width
    const x1 = size / 2 - r / 2
    const y1 = size / 2 + Math.sqrt(Math.pow(r, 2) - Math.pow(r / 2, 2))
    const x2 = size / 2 + r / 2
    const y2 = y1

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <defs>
                <path
                    id="path"
                    fill="none"
                    stroke="none"
                    strokeMiterlimit="10"
                    strokeWidth="0"
                    //d="M55 150 A70 70 0 1 1 125 150"
                    d={`M${x1} ${y1} A${r} ${r} 0 1 1 ${x2} ${y2}`}
                />
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0">
                    <stop offset="0%" stopColor="#EDE604" />
                    <stop offset="10%" stopColor="#FFCC00" />
                    <stop offset="20%" stopColor="#FEAC00" />
                    <stop offset="30%" stopColor="#FF8100" />
                    <stop offset="40%" stopColor="#FF5800" />
                    <stop offset="50%" stopColor="#FF3BA7" />
                    <stop offset="60%" stopColor="#CC42A2" />
                    <stop offset="70%" stopColor="#9ED110" />
                    <stop offset="80%" stopColor="#50B517" />
                    <stop offset="90%" stopColor="#179067" />
                </linearGradient>
            </defs>

            <circle cx={size / 2} cy={size / 2} r={r + width / 2 - 2} fill="none" stroke="black" strokeWidth={width} />
            <pattern id="pattern" x="0" y="0" width="300%" height="100%" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="150%" height="100%" fill="url(#gradient)">
                    <animate
                        attributeType="XML"
                        attributeName="x"
                        from="0"
                        to="150%"
                        dur="7s"
                        repeatCount="indefinite"
                    />
                </rect>
                <rect x="-150%" y="0" width="150%" height="100%" fill="url(#gradient)">
                    <animate
                        attributeType="XML"
                        attributeName="x"
                        from="-150%"
                        to="0"
                        dur="7s"
                        repeatCount="indefinite"
                    />
                </rect>
            </pattern>

            <text x="0%" textAnchor="middle" fill="url(#pattern)">
                <textPath xlinkHref="#path" startOffset="50%" rotate="auto">
                    <tspan fontWeight="bold">{text}</tspan>
                </textPath>
            </text>
        </svg>
    )
}
