import { makeStyles } from '@masknet/theme'
import { rainbowBorderKeyFrames, RainbowBox } from './RainbowBox'
import { useMount } from 'react-use'
import { searchTwitterAvatarLinkSelector } from '../../../social-network-adaptor/twitter.com/utils/selector'

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

    useMount(() => {
        const linkDom = searchTwitterAvatarLinkSelector().evaluate()

        if (linkDom?.firstElementChild && linkDom.childNodes.length === 4) {
            const linkParentDom = linkDom.closest('div')

            if (linkParentDom) linkParentDom.style.overflow = 'visible'

            // remove useless border
            linkDom.removeChild(linkDom.firstElementChild)

            // create rainbow shadow border
            if (linkDom.firstElementChild.tagName !== 'style') {
                const style = document.createElement('style')
                style.innerText = `
                ${rainbowBorderKeyFrames.styles}

                .rainbowBorder {
                    animation: ${rainbowBorderKeyFrames.name} 6s linear infinite;
                    box-shadow: 0 5px 15px rgba(0, 248, 255, 0.4), 0 10px 30px rgba(37, 41, 46, 0.2);
                    transition: .125s ease;
                    border: 2px solid #00f8ff;
                }
            `
                linkDom.firstElementChild.classList.add('rainbowBorder')
                linkDom.insertBefore(style, linkDom.firstChild)
            }
        }
    })

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
