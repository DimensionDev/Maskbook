import { makeStyles } from '@masknet/theme'
import { useMemo } from 'react'
import { v4 as uuid } from 'uuid'

const useStyles = makeStyles()((theme) => ({
    root: {
        overflow: 'unset',
    },
    name: {
        transform: 'translate(0px, 3px)',
        background: 'linear-gradient(270deg, #24FF00 0%, #00E4C9 102.63%)',
    },
    price: {
        transform: 'translate(0px, -1px)',
        background: 'linear-gradient(270deg, #24FF00 0%, #00E4C9 102.63%)',
    },
}))
interface NFTAvatarSquareProps {
    stroke: string
    strokeWidth: number
    fontSize: number
    name: string
    price: string
    width: number
    borderSize?: number
    id?: string
}

export function NFTAvatarSquare(props: NFTAvatarSquareProps) {
    const { classes } = useStyles()
    const { stroke, strokeWidth, fontSize, name, width, price, borderSize = 2 } = props
    const id = useMemo(() => props.id ?? uuid(), [props.id])

    const avatarSize = width - borderSize
    const R = avatarSize / 2

    return (
        <svg className={classes.root} width="100%" height="100%" viewBox={`0 0 ${avatarSize} ${avatarSize}`} id={id}>
            <defs>
                <path
                    id={`${id}-path-name`}
                    fill="none"
                    stroke="none"
                    strokeWidth="0"
                    d={`M${0} ${R} L0 0 L${avatarSize} 0 L${avatarSize} ${R}`}
                />
                <path
                    id={`${id}-path-price`}
                    fill="none"
                    stroke="none"
                    strokeWidth="0"
                    d={`M 0 ${R} L0 ${avatarSize} L${avatarSize} ${avatarSize} L${avatarSize} ${R} `}
                />
                <linearGradient id={`${id}-gradient`} x1="100%" y1="0%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#24FF00" />
                    <stop offset="100%" stopColor="#00E4C9 " />
                </linearGradient>
            </defs>

            <g>
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
                <g className={classes.name}>
                    <text x="0%" textAnchor="middle" fontFamily="sans-serif" fill={`url(#${id}-gradient)`}>
                        <textPath xlinkHref={`#${id}-path-name`} startOffset="50%" rotate="auto">
                            <tspan fontWeight="bold" fontSize={fontSize}>
                                {name}
                            </tspan>
                        </textPath>
                    </text>
                </g>
                <g className={classes.price}>
                    <text x="0%" textAnchor="middle" fontFamily="sans-serif" fill={`url(#${id}-gradient)`}>
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
}
