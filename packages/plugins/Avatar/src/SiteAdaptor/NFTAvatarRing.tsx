import { makeStyles } from '@masknet/theme'
import { Sniffings } from '@masknet/shared-base'
import { RainbowBox } from './RainbowBox.js'

const useStyles = makeStyles()((theme) => ({
    root: {
        overflow: 'unset',
    },
    container: {
        boxShadow: '0 5px 15px rgba(0, 248, 255, 0.4), 0 10px 30px rgba(37, 41, 46, 0.2)',
        transition: 'none',
        borderRadius: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        lineHeight: 0,
        border: '2px solid #00f8ff',
    },
}))

interface NFTAvatarRingProps {
    stroke: string
    strokeWidth: number
    fontSize: number
    text: string
    price: string
    width: number
    id: string
    hasRainbow?: boolean
    borderSize?: number
}

export function NFTAvatarRing(props: NFTAvatarRingProps) {
    const { classes } = useStyles()
    const { stroke, strokeWidth, fontSize, text, width, id, price, hasRainbow = true, borderSize = 2 } = props

    const avatarSize = hasRainbow ? width - borderSize : width + 1
    const R = avatarSize / 2
    const path_r = R - strokeWidth + fontSize / 2
    const x1 = R - path_r
    const y1 = R
    const x2 = R + path_r

    const svgNode = (
        <svg className={classes.root} width="100%" height="100%" viewBox={`0 0 ${avatarSize} ${avatarSize}`} id={id}>
            <defs>
                <path
                    id={`${id}-path-name`}
                    fill="none"
                    stroke="none"
                    strokeWidth="0"
                    d={`M${x1} ${y1} A${path_r} ${path_r} 0 1 1 ${x2} ${y1}`}
                />
                <path
                    id={`${id}-path-price`}
                    fill="none"
                    stroke="none"
                    strokeWidth="0"
                    d={`M${x1} ${y1} A${path_r} ${path_r} 0 1 0 ${x2} ${y1}`}
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
                <circle
                    cx={R}
                    cy={R}
                    r={R - strokeWidth / 2 + 1}
                    fill="none"
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                />
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
                <g>
                    <text x="0%" textAnchor="middle" fill={`url(#${id}-pattern)`} fontFamily="sans-serif">
                        <textPath xlinkHref={`#${id}-path-name`} startOffset="50%" rotate="auto">
                            <tspan fontWeight="bold" fontSize={fontSize}>
                                {text}
                            </tspan>
                        </textPath>
                    </text>
                </g>
                <text
                    x="0%"
                    textAnchor="middle"
                    fill={Sniffings.is_firefox ? 'currentColor' : `url(#${id}-pattern)`}
                    fontFamily="sans-serif">
                    <textPath xlinkHref={`#${id}-path-price`} startOffset="50%" rotate="auto">
                        <tspan fontWeight="bold" fontSize={fontSize} dy="0.5em">
                            {price}
                        </tspan>
                    </textPath>
                </text>
            </g>
        </svg>
    )

    return hasRainbow ?
            <RainbowBox borderSize={borderSize}>{svgNode}</RainbowBox>
        :   <div className={classes.container}>{svgNode}</div>
}
