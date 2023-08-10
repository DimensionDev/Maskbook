import { max } from 'lodash-es'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useWindowSize } from 'react-use'
import { type LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { useChainContext } from '@masknet/web3-hooks-base'
import { makeStyles } from '@masknet/theme'
import type { AvatarMetaDB } from '@masknet/plugin-avatar'
import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI.js'
import {
    RSS3_KEY_SITE,
    useNFT,
    useNFTAvatar,
    useWallet,
    NFTBadge,
    rainbowBorderKeyFrames,
} from '@masknet/plugin-avatar'
import { startWatch } from '../../../../utils/startWatch.js'
import { attachReactTreeWithContainer } from '../../../../utils/shadow-root/renderInShadowRoot.js'
import { searchInstagramAvatarSelector } from '../../utils/selector.js'
import { getAvatarId } from '../../utils/user.js'

export function injectNFTAvatarInInstagram(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchInstagramAvatarSelector())
    startWatch(watcher, signal)
    attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, { signal }).render(<NFTAvatarInInstagram />)
}

const useStyles = makeStyles()(() => ({
    root: {
        position: 'absolute',
        textAlign: 'center',
        color: 'white',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
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

function NFTAvatarInInstagram() {
    const { classes } = useStyles()
    const [avatar, setAvatar] = useState<AvatarMetaDB>()

    const identity = useCurrentVisitingIdentity()
    const location = useLocation()
    const { value: nftAvatar } = useNFTAvatar(identity.identifier?.userId, RSS3_KEY_SITE.INSTAGRAM)

    const { account } = useChainContext()
    const { loading: loadingWallet, value: storage } = useWallet(nftAvatar?.userId)
    const { value: nftInfo, loading: loadingNFTInfo } = useNFT(
        storage?.address ?? account,
        nftAvatar?.address,
        nftAvatar?.tokenId,
        nftAvatar?.pluginId,
        nftAvatar?.chainId,
    )

    const windowSize = useWindowSize()
    const showAvatar = useMemo(() => {
        if (location.pathname?.includes('/edit')) return false
        return getAvatarId(identity.avatar ?? '') === avatar?.avatarId
    }, [avatar?.avatarId, identity.avatar, location.pathname])

    const size = useMemo(() => {
        const ele = searchInstagramAvatarSelector().evaluate()

        if (!ele) return 0

        const style = window.getComputedStyle(ele)
        return max([146, Number.parseInt(style.width.replace('px', '') ?? 0, 10)])
    }, [windowSize])

    useEffect(() => {
        if (!showAvatar) return

        let containerDom: LiveSelector<HTMLSpanElement | HTMLDivElement, true>

        if (searchInstagramAvatarSelector().evaluate()?.parentElement?.tagName === 'SPAN') {
            containerDom = searchInstagramAvatarSelector().closest<HTMLSpanElement>(1)
        } else {
            containerDom = searchInstagramAvatarSelector().closest<HTMLDivElement>(2)
        }

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

        const parentDom = searchInstagramAvatarSelector().closest<HTMLDivElement>(2).evaluate()

        parentDom?.appendChild(style)

        containerDom.evaluate()?.classList.add('rainbowBorder')
        return () => {
            if (parentDom?.lastElementChild?.tagName === 'STYLE') {
                parentDom.removeChild(parentDom.lastElementChild)
            }
            containerDom.evaluate()?.classList.remove('rainbowBorder')
        }
    }, [location.pathname, showAvatar])

    useEffect(() => setAvatar(nftAvatar), [nftAvatar, location])

    if (!avatar || !size || !showAvatar || loadingWallet || loadingNFTInfo) return null

    return (
        <NFTBadge
            nftInfo={nftInfo}
            hasRainbow={false}
            size={size}
            classes={{ root: classes.root, text: classes.text, icon: classes.icon }}
        />
    )
}
