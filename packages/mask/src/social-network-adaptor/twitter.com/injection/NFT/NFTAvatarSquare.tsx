import { createReactRootShadowed, startWatch, useI18N } from '../../../../utils/index.js'
import {
    searchTwitterAvatarLinkSelector,
    searchTwitterAvatarNFTSelector,
    searchTwitterSquareAvatarSelector,
} from '../../utils/selector.js'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@masknet/theme'
import { useEffect, useMemo, useRef } from 'react'
import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI.js'
import { rainbowBorderKeyFrames } from '@masknet/plugin-avatar'
import { useLocation, useWindowSize } from 'react-use'
import { NFTAvatarClipOrSquareInTwitter } from './NFTAvatarClip.js'
import { getAvatarType } from '../../utils/useAvatarType.js'
import { AvatarType } from '../../constant.js'

export function injectNFTSquareAvatarInTwitter(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchTwitterSquareAvatarSelector()).useForeach((ele, _, proxy) => {
        const root = createReactRootShadowed(proxy.afterShadow, { untilVisible: true, signal })
        const avatarType = getAvatarType()
        if (avatarType === AvatarType.AVATAR_SQUARE) root.render(<NFTSquareAvatarInTwitter signal={signal} />)
        return () => root.destroy()
    })
    startWatch(watcher, signal)
}

const useStyles = makeStyles()(() => ({
    root: {
        transform: 'scale(1.022)',
        position: 'absolute',
        textAlign: 'center',
        color: 'white',
        zIndex: 2,
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    text: {
        fontSize: '20px !important',
        fontWeight: 700,
    },
    icon: {
        width: '19px !important',
        height: '19px !important',
    },
}))

interface NFTAvatarInTwitterProps {
    signal: AbortSignal
}

function NFTSquareAvatarInTwitter(props: NFTAvatarInTwitterProps) {
    const { t } = useI18N()
    const rainBowElement = useRef<Element | null>()
    const borderElement = useRef<Element | null>()
    const identity = useCurrentVisitingIdentity()

    const windowSize = useWindowSize()
    const _location = useLocation()

    const size = useMemo(() => {
        const ele = searchTwitterAvatarNFTSelector().evaluate()?.closest('a')?.querySelector('img')
        if (!ele) return 0
        const style = window.getComputedStyle(ele)
        return Number.parseInt(style.width.replace('px', '') ?? 0, 10)
    }, [windowSize, location])

    const { classes } = useStyles()

    useEffect(() => {
        const linkDom = searchTwitterAvatarLinkSelector().evaluate()

        if (linkDom?.firstElementChild && linkDom.childNodes.length === 4) {
            const linkParentDom = linkDom.closest('div')

            if (linkParentDom) linkParentDom.style.overflow = 'visible'

            // create rainbow shadow border
            if (linkDom.lastElementChild?.tagName !== 'STYLE') {
                borderElement.current = linkDom.firstElementChild
                // remove useless border
                linkDom.removeChild(linkDom.firstElementChild)
                const style = document.createElement('style')
                style.innerText = `
                ${rainbowBorderKeyFrames.styles}

                .rainbowBorder {
                    box-shadow: 0px 4px 6px rgba(0, 255, 41, 0.2);
                    border: 0 solid #00f8ff;
                }
            `
                rainBowElement.current = linkDom.firstElementChild.nextElementSibling
                linkDom.firstElementChild.nextElementSibling?.classList.add('rainbowBorder')
                linkDom.appendChild(style)
            }
        }

        return () => {
            if (linkDom?.lastElementChild?.tagName === 'STYLE') {
                linkDom.removeChild(linkDom.lastElementChild)
            }

            if (borderElement.current && linkDom?.firstElementChild !== borderElement.current) {
                linkDom?.insertBefore(borderElement.current, linkDom.firstChild)
            }
            if (rainBowElement.current) {
                rainBowElement.current.classList.remove('rainbowBorder')
            }
        }
    }, [location.pathname])

    if (!size || !identity.identifier?.userId) return null

    return (
        <NFTAvatarClipOrSquareInTwitter
            screenName={identity.identifier?.userId}
            size={size}
            avatarType={AvatarType.AVATAR_SQUARE}
        />
    )
}
