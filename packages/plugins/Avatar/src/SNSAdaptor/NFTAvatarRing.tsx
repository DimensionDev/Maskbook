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
    id: string
}

export function NFTAvatarRing(props: NFTAvatarRingProps) {
    const { classes } = useStyles()
    const { stroke, strokeWidth, fontSize, text, width, id } = props

    const avatarSize = width + 3
    const R = avatarSize / 2
    const path_r = R - strokeWidth + fontSize / 2
    const x1 = R - path_r / 2
    const y1 = R + Math.sqrt(Math.pow(path_r, 2) - Math.pow(path_r / 2, 2))
    const x2 = R + path_r / 2

    return (
        <RainbowBox>
            <svg
                className={classes.root}
                width="100%"
                height="100%"
                viewBox={`0 0 ${avatarSize} ${avatarSize}`}
                id={id}>
                <defs>
                    <path
                        id={`${id}-path`}
                        fill="none"
                        stroke="none"
                        strokeWidth="0"
                        d={`M${x1} ${y1} A${path_r} ${path_r} 0 1 1 ${x2} ${y1}`}
                    />
                    <linearGradient id={`${id}-gradient`} x1="0%" y1="0%" x2="100%" y2="0">
                        <stop offset="0%" stopColor="#00f8ff" />
                        <stop offset="20%" stopColor="#a4ff00" />
                        <stop offset="40%" stopColor="#f7275e" />
                        <stop offset="60%" stopColor="#ffd300" />
                        <stop offset="80%" stopColor="#ff8a00" />
                        <stop offset="100%" stopColor="#00f8ff" />
                    </linearGradient>
                </defs>

                <circle cx={R} cy={R} r={R - strokeWidth / 2} fill="none" stroke={stroke} strokeWidth={strokeWidth} />
                <pattern id={`${id}-pattern`} x="0" y="0" width="300%" height="100%" patternUnits="userSpaceOnUse">
                    <circle cx={R} cy={R} r={R} fill={`url(#${id}-gradient)`}>
                        <animateTransform
                            attributeName="transform"
                            type="rotate"
                            dur="10s"
                            repeatCount="indefinite"
                            from={`0 ${R} ${R}`}
                            to={`360 ${R} ${R}`}
                        />
                    </circle>
                </pattern>

                <text x="0%" textAnchor="middle" fill={`url(#${id}-pattern)`} fontFamily="sans-serif">
                    <textPath xlinkHref={`#${id}-path`} startOffset="50%" rotate="auto">
                        <tspan fontWeight="bold" fontSize={fontSize}>
                            {text}
                        </tspan>
                    </textPath>
                </text>
            </svg>
        </RainbowBox>
    )
}
