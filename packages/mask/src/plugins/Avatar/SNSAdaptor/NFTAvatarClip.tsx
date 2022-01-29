import type { Keyframes } from '@emotion/serialize'
import { keyframes, makeStyles, useStylesExtends } from '@masknet/theme'
import classNames from 'classnames'
import { useLastRecognizedIdentity } from '../../../components/DataSource/useActivatedUI'
import { useNFT } from '../hooks'
import { useNFTContainerAtTwitter } from '../hooks/userNFTContainerAtTwitter'
import { formatPrice, formatText } from '../utils'
import { v4 as uuid } from 'uuid'

// from twitter page
const ViewBoxWidth = 200
const ViewBoxHeight = 188

interface NFTAvatarClipProps extends withClasses<'root' | 'text' | 'icon'> {
    id?: string
    width: number
    height: number
    screenName?: string
    viewBoxHeight?: number
    viewBoxWidth?: number
}

const rainbowBorderKeyFrames: Keyframes = keyframes`
    0%, to {
        stroke: #00f8ff;
    }
    20% {
        stroke: #a4ff00;
    }
    40% {
        stroke: #f7275e;
    }
    60% {
        stroke: #ffd300;
    }
    80% {
        stroke: #ff8a00;
    }
`

const useStyles = makeStyles()((theme) => ({
    root: {},
    miniBorder: {
        transform: 'scale(0.9) translate(10px, 10px)',
        strokeWidth: 12,
    },
    borderPath: {
        transform: 'scaleY(1.05) translate(0px, -5px)',
        strokeWidth: 4,
    },
    rainbowBorder: {
        animation: `${rainbowBorderKeyFrames} 6s linear infinite`,
        transition: '1s ease',
    },
    text: {
        transform: 'translate(1px, -5px) ',
    },
    price: {
        transform: 'translate(0px, 1px) ',
    },
    namePath: {
        transform: 'scale(0.9) translate(10px, 10px)',
    },
}))

export function NFTAvatarClip(props: NFTAvatarClipProps) {
    const { id = uuid(), width, height, viewBoxHeight = ViewBoxHeight, viewBoxWidth = ViewBoxWidth, screenName } = props
    const classes = useStylesExtends(useStyles(), props)

    const { loading, value: avatarMetadata } = useNFTContainerAtTwitter(screenName ?? '')

    const { value = { amount: '0', symbol: 'ETH', name: '', slug: '' }, loading: loadingNFT } = useNFT(
        avatarMetadata?.data.user.result.nft_avatar_metadata.smart_contract.address ?? '',
        avatarMetadata?.data.user.result.nft_avatar_metadata.token_id ?? '',
    )

    const { amount, name, symbol, slug } = value
    if (!avatarMetadata?.data.user.result.has_nft_avatar) return null

    return (
        <svg
            className={classes.root}
            width={width}
            height={height}
            id={id}
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}>
            <defs>
                <path
                    d="M6.74789 118.43C14.0458 133.777 22.5561 148.517 32.1979 162.51L35.3079 167.02C39.1367 172.575 44.155 177.208 49.9981 180.581C55.8413 183.954 62.3625 185.983 69.0879 186.52L74.5479 186.96C91.4873 188.32 108.508 188.32 125.448 186.96L130.908 186.52C137.638 185.976 144.163 183.938 150.006 180.554C155.85 177.17 160.865 172.526 164.688 166.96L167.798 162.45C177.44 148.457 185.95 133.717 193.248 118.37"
                    id={`${id}-price-path`}
                />
                <path
                    className={classes.namePath}
                    d="M6.74789,69.55C14.0458,54.2034 22.5561,39.4634 32.1979,25.47L35.3079,20.96C39.1367,15.4049 44.155,10.7724 49.9981,7.3994C55.8413,4.02636 62.3625,1.99743 69.0879,1.46004L74.5479,1.02004C91.4873,-0.340012 108.508,-0.340012 125.448,1.02004L130.908,1.46004C137.633,1.99743 144.155,4.02636 149.998,7.3994C155.841,10.7724 160.859,15.4049 164.688,20.96L167.798,25.43C177.44,39.4234 185.95,54.1634 193.248,69.51"
                    id={`${id}-name-path`}
                />
                <path
                    id={`${id}-border-path`}
                    d="M193.248 69.51C185.95 54.1634 177.44 39.4234 167.798 25.43L164.688 20.96C160.859 15.4049 155.841 10.7724 149.998 7.3994C144.155 4.02636 137.633 1.99743 130.908 1.46004L125.448 1.02004C108.508 -0.340012 91.4873 -0.340012 74.5479 1.02004L69.0879 1.46004C62.3625 1.99743 55.8413 4.02636 49.9981 7.3994C44.155 10.7724 39.1367 15.4049 35.3079 20.96L32.1979 25.47C22.5561 39.4634 14.0458 54.2034 6.74789 69.55L4.39789 74.49C1.50233 80.5829 0 87.2441 0 93.99C0 100.736 1.50233 107.397 4.39789 113.49L6.74789 118.43C14.0458 133.777 22.5561 148.517 32.1979 162.51L35.3079 167.02C39.1367 172.575 44.155 177.208 49.9981 180.581C55.8413 183.954 62.3625 185.983 69.0879 186.52L74.5479 186.96C91.4873 188.32 108.508 188.32 125.448 186.96L130.908 186.52C137.638 185.976 144.163 183.938 150.006 180.554C155.85 177.17 160.865 172.526 164.688 166.96L167.798 162.45C177.44 148.457 185.95 133.717 193.248 118.37L195.598 113.43C198.493 107.337 199.996 100.676 199.996 93.93C199.996 87.1841 198.493 80.5229 195.598 74.43L193.248 69.51Z"
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

            <g>
                <pattern id={`${id}-pattern`} x="0" y="0" width="300%" height="100%" patternUnits="userSpaceOnUse">
                    <circle
                        cx={viewBoxWidth / 2}
                        cy={viewBoxHeight / 2}
                        r={Math.max(viewBoxWidth, viewBoxHeight) + 1}
                        fill={`url(#${id}-gradient)`}>
                        <animateTransform
                            attributeName="transform"
                            type="rotate"
                            dur="10s"
                            repeatCount="indefinite"
                            from={`0 ${viewBoxWidth / 2} ${viewBoxHeight / 2}`}
                            to={`360 ${viewBoxWidth / 2} ${viewBoxHeight / 2}`}
                        />
                    </circle>
                </pattern>

                <use
                    xlinkHref={`#${id}-border-path`}
                    fill="none"
                    strokeWidth="30"
                    stroke="black"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    x={0}
                    y={0}
                    width={width}
                    height={height}
                />

                <use
                    xlinkHref={`#${id}-border-path`}
                    fill="none"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    x={0}
                    y={0}
                    width={width}
                    height={height}
                    className={classNames(classes.rainbowBorder, classes.borderPath)}
                />

                <text
                    x="0%"
                    textAnchor="middle"
                    fill={`url(#${id}-pattern)`}
                    fontFamily="sans-serif"
                    className={classes.text}>
                    <textPath
                        xlinkHref={`#${id}-name-path`}
                        startOffset="50%"
                        rotate="auto"
                        dominantBaseline="mathematical">
                        <tspan fontWeight="bold" fontSize="12">
                            {loading || loadingNFT
                                ? 'loading...'
                                : `${formatText(
                                      name,
                                      avatarMetadata?.data.user.result.nft_avatar_metadata.token_id ?? '',
                                  )} ${slug.toLowerCase() === 'ens' ? 'ENS' : ''}`}
                        </tspan>
                    </textPath>
                </text>
                <text
                    x="0%"
                    textAnchor="middle"
                    fill={`url(#${id}-pattern)`}
                    fontFamily="sans-serif"
                    className={classes.price}>
                    <textPath xlinkHref={`#${id}-price-path`} startOffset="50%" rotate="auto" dominantBaseline="auto">
                        <tspan fontWeight="bold" fontSize="12">
                            {loading || loadingNFT ? '' : formatPrice(amount, symbol)}
                        </tspan>
                    </textPath>
                </text>
            </g>
        </svg>
    )
}

export function NFTAvatarMiniClip(props: NFTAvatarClipProps) {
    const { id = uuid(), width, height, viewBoxHeight = ViewBoxHeight, viewBoxWidth = ViewBoxWidth, screenName } = props
    const classes = useStylesExtends(useStyles(), props)
    const identity = useLastRecognizedIdentity()
    const { loading, value: avatarMetadata } = useNFTContainerAtTwitter(screenName ?? identity.identifier.userId)

    if (loading || !avatarMetadata?.data.user.result.has_nft_avatar) return null

    return (
        <svg
            className={classes.root}
            width={width}
            height={height}
            id={id}
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}>
            <defs>
                <path
                    id={`${id}-border-path`}
                    d="M193.248 69.51C185.95 54.1634 177.44 39.4234 167.798 25.43L164.688 20.96C160.859 15.4049 155.841 10.7724 149.998 7.3994C144.155 4.02636 137.633 1.99743 130.908 1.46004L125.448 1.02004C108.508 -0.340012 91.4873 -0.340012 74.5479 1.02004L69.0879 1.46004C62.3625 1.99743 55.8413 4.02636 49.9981 7.3994C44.155 10.7724 39.1367 15.4049 35.3079 20.96L32.1979 25.47C22.5561 39.4634 14.0458 54.2034 6.74789 69.55L4.39789 74.49C1.50233 80.5829 0 87.2441 0 93.99C0 100.736 1.50233 107.397 4.39789 113.49L6.74789 118.43C14.0458 133.777 22.5561 148.517 32.1979 162.51L35.3079 167.02C39.1367 172.575 44.155 177.208 49.9981 180.581C55.8413 183.954 62.3625 185.983 69.0879 186.52L74.5479 186.96C91.4873 188.32 108.508 188.32 125.448 186.96L130.908 186.52C137.638 185.976 144.163 183.938 150.006 180.554C155.85 177.17 160.865 172.526 164.688 166.96L167.798 162.45C177.44 148.457 185.95 133.717 193.248 118.37L195.598 113.43C198.493 107.337 199.996 100.676 199.996 93.93C199.996 87.1841 198.493 80.5229 195.598 74.43L193.248 69.51Z"
                />
            </defs>

            <use
                xlinkHref={`#${id}-border-path`}
                fill="none"
                strokeLinejoin="round"
                strokeLinecap="round"
                x={0}
                y={0}
                width={width}
                height={height}
                className={classNames(classes.rainbowBorder, classes.miniBorder)}
            />
        </svg>
    )
}
