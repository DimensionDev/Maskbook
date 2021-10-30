import { makeStyles } from '@masknet/theme'
import { RainbowBox } from './RainbowBox'

const useStyles = makeStyles()((theme) => ({
    root: {
        overflow: 'unset',
    },
}))
interface NFTAvatarRingProps {
    stroke: string
    strokeWidth: number
    fontSize: number
    text: string
    width: number
}

export function NFTAvatarRing(props: NFTAvatarRingProps) {
    const { classes } = useStyles()
    const { stroke, strokeWidth, fontSize, text, width } = props

    const R = width + 2 * strokeWidth - 4
    const r = R / 2 - strokeWidth
    const path_r = R / 2 - strokeWidth + fontSize / 2
    const x1 = R / 2 - path_r / 2
    const y1 = R / 2 + Math.sqrt(Math.pow(path_r, 2) - Math.pow(path_r / 2, 2))
    const x2 = R / 2 + path_r / 2
    const y2 = y1

    return (
        <RainbowBox width={R} height={R}>
            <svg className={classes.root} width={R} height={R} viewBox={`0 0 ${R} ${R}`} id="NFTAvatarRingIcon">
                <defs>
                    <path
                        id="path"
                        fill="none"
                        stroke="none"
                        strokeWidth="0"
                        d={`M${x1} ${y1} A${path_r} ${path_r} 0 1 1 ${x2} ${y2}`}
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

                <circle
                    cx={R / 2}
                    cy={R / 2}
                    r={r + strokeWidth / 2}
                    fill="none"
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                />
                <pattern id="pattern" x="0" y="0" width="300%" height="100%" patternUnits="userSpaceOnUse">
                    <circle cx={R / 2} cy={R / 2} r={R / 2} fill="url(#gradient)">
                        <animateTransform
                            attributeName="transform"
                            type="rotate"
                            dur="10s"
                            repeatCount="indefinite"
                            from={`0 ${R / 2} ${R / 2}`}
                            to={`360 ${R / 2} ${R / 2}`}
                        />
                    </circle>
                </pattern>

                <text x="0%" textAnchor="middle" fill="url(#pattern)">
                    <textPath xlinkHref="#path" startOffset="50%" rotate="auto">
                        <tspan fontWeight="bold" fontSize={fontSize}>
                            {text}
                        </tspan>
                    </textPath>
                </text>
            </svg>
        </RainbowBox>
    )
}
