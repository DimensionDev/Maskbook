import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@masknet/theme'
import { isZero } from '@masknet/web3-shared-base'
import { useEffect, useMemo, useRef } from 'react'
import { useLocation, useWindowSize } from 'react-use'
import { NFTAvatarClip } from '../../../../plugins/Avatar/SNSAdaptor/NFTAvatarClip'
import { createReactRootShadowed, startWatch } from '../../../../utils'
import { searchTwitterAvatarNFTLinkSelector, searchTwitterAvatarNFTSelector } from '../../utils/selector'

export function injectNFTAvatarClipInTwitter(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchTwitterAvatarNFTSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<NFTAvatarClipInTwitter />)
}

const useStyles = makeStyles()(() => ({
    root: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    text: {},
    icon: {},
}))

function NFTAvatarClipInTwitter() {
    const { classes } = useStyles()
    const windowSize = useWindowSize()
    const location = useLocation()
    const borderElement = useRef<Element | null>()

    const size = useMemo(() => {
        const ele = searchTwitterAvatarNFTSelector().evaluate()?.querySelector('img')
        if (!ele) return 0
        const style = window.getComputedStyle(ele)
        return Number.parseInt(style.width.replace('px', '') ?? 0, 10)
    }, [windowSize])

    const twitterId = useMemo(() => {
        const ele = searchTwitterAvatarNFTSelector().evaluate()?.closest('a') as HTMLElement
        if (!ele) return
        const path = ele.getAttribute('href')
        if (!path) return
        const [, userId] = path.match(/^\/(\w+)\/nft$/) ?? []
        return userId
    }, [location])

    useEffect(() => {
        const linkDom = searchTwitterAvatarNFTLinkSelector().evaluate()
        if (linkDom?.firstElementChild && linkDom.childNodes.length === 4) {
            borderElement.current = linkDom.firstElementChild
            // remove useless border
            linkDom.removeChild(linkDom.firstElementChild)
        }

        const first = linkDom?.firstElementChild as HTMLDivElement
        if (first?.style) {
            first.style.width = ''
            first.style.height = ''
        }

        return () => {
            if (borderElement.current && borderElement.current !== linkDom?.firstElementChild) {
                linkDom?.insertBefore(borderElement.current, linkDom.firstChild)
            }
        }
    }, [location])

    if (isZero(size) || !twitterId) return null
    return (
        <NFTAvatarClip
            screenName={twitterId}
            width={size}
            height={size}
            classes={{ root: classes.root, text: classes.text, icon: classes.icon }}
        />
    )
}
