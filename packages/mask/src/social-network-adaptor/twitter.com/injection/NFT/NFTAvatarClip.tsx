import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@masknet/theme'
import { isZero } from '@masknet/web3-shared-base'
import { useEffect, useMemo } from 'react'
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

    const size = useMemo(() => {
        const ele = searchTwitterAvatarNFTSelector().evaluate()
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
        const link = searchTwitterAvatarNFTLinkSelector().evaluate()?.firstChild as HTMLElement
        if (!link) return
        link.style.width = ''
        link.style.height = ''
        return () => {
            link.style.height = 'calc(100% - 4px)'
            link.style.width = 'calc(100% - 4px)'
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
