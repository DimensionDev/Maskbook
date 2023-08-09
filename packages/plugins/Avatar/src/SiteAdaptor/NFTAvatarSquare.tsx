import { makeStyles } from '@masknet/theme'
import { useMemo } from 'react'
import { v4 as uuid } from 'uuid'
import { RainbowBox } from '../index.js'

const useStyles = makeStyles()((theme) => ({
    root: {
        borderRadius: 5,
    },
    name: {
        transform: 'translate(0px, 8px)',
        background: 'linear-gradient(270deg, #24FF00 0%, #00E4C9 102.63%)',
    },
    price: {
        transform: 'translate(0px, -5px)',
        background: 'linear-gradient(270deg, #24FF00 0%, #00E4C9 102.63%)',
    },
    border: {
        transform: 'translate(1px, 1px)',
    },
}))
interface NFTAvatarSquareProps {
    stroke: string
    strokeWidth: number
    fontSize: number
    name: string
    price: string
    size: number
    borderSize?: number
    id?: string
}

export function NFTAvatarSquare(props: NFTAvatarSquareProps) {
    const { classes } = useStyles()
    const { stroke, strokeWidth, fontSize, name, size, price, borderSize = 2 } = props
    const id = useMemo(() => props.id ?? uuid(), [props.id])

    const avatarSize = size - borderSize
    const R = avatarSize * Math.sqrt(2)

    if (size <= borderSize) return null

    const svg = (
        <svg className={classes.root} width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} id={id}>
            <defs>
                <path
                    id={`${id}-path-name`}
                    fill="none"
                    stroke="none"
                    strokeWidth="0"
                    d={`M${0} ${avatarSize / 2} L0 0 L${avatarSize} 0 L${avatarSize} ${avatarSize / 2}`}
                />
                <path
                    id={`${id}-path-price`}
                    fill="none"
                    stroke="none"
                    strokeWidth="0"
                    d={`M 0 ${avatarSize / 2} L0 ${avatarSize} L${avatarSize} ${avatarSize} L${avatarSize} ${
                        avatarSize / 2
                    } `}
                />
                <linearGradient id={`${id}-gradient`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00f8ff" />
                    <stop offset="20%" stopColor="#a4ff00" />
                    <stop offset="40%" stopColor="#f7275e" />
                    <stop offset="60%" stopColor="#ffd300" />
                    <stop offset="80%" stopColor="#ff8a00" />
                    <stop offset="100%" stopColor="#00f8ff" />
                </linearGradient>
            </defs>

            <g>
                <pattern
                    id={`${id}-pattern`}
                    x="0"
                    y="0"
                    width="300%"
                    height="100%"
                    patternUnits={navigator.userAgent.includes('Firefox') ? '' : 'userSpaceOnUse'}>
                    <circle cx={R} cy={R} r={R} fill={`url(#${id}-gradient)`}>
                        <animateTransform
                            attributeName="transform"
                            type="rotate"
                            attributeType="XML"
                            dur="10s"
                            repeatCount="indefinite"
                            from={`0 ${R} ${R}`}
                            to={`360 ${R} ${R}`}
                        />
                    </circle>
                </pattern>
                <rect
                    x={0}
                    y={0}
                    rx={5}
                    width={avatarSize}
                    height={avatarSize}
                    fill="none"
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                />
                <g className={classes.border}>
                    <rect
                        x={0}
                        y={0}
                        rx={5}
                        width={avatarSize}
                        height={avatarSize}
                        fill="none"
                        stroke="none"
                        strokeWidth={2}
                    />
                </g>
                <g className={classes.name}>
                    <text x="0%" textAnchor="middle" fontFamily="sans-serif" fill={`url(#${id}-pattern)`}>
                        <textPath xlinkHref={`#${id}-path-name`} startOffset="50%" rotate="auto">
                            <tspan fontWeight="bold" fontSize={fontSize}>
                                {name}
                            </tspan>
                        </textPath>
                    </text>
                </g>
                <g className={classes.price}>
                    <text x="0%" textAnchor="middle" fontFamily="sans-serif" fill={`url(#${id}-pattern)`}>
                        <textPath xlinkHref={`#${id}-path-price`} startOffset="50%" rotate="auto">
                            <tspan fontWeight="bold" fontSize={fontSize} dy="0.5em">
                                {price}
                            </tspan>
                        </textPath>
                    </text>
                </g>
            </g>
        </svg>
    )
    return (
        <RainbowBox borderSize={borderSize} radius="5px">
            {svg}
        </RainbowBox>
    )
}
