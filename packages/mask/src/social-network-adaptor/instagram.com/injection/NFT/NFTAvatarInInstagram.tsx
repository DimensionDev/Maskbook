import { LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { searchInstagramAvatarSelector, searchInstagramAvatarUploadLoadingSelector } from '../../utils/selector'
import { createReactRootShadowed, startWatch } from '../../../../utils'
import { makeStyles } from '@masknet/theme'
import { useWallet } from '@masknet/plugin-infra'
import { useEffect, useMemo, useState } from 'react'
import type { AvatarMetaDB } from '../../../../plugins/Avatar/types'
import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI'
import { useNFTAvatar } from '../../../../plugins/Avatar/hooks'
import { RSS3_KEY_SNS } from '../../../../plugins/Avatar/constants'
import { InMemoryStorages } from '../../../../../shared'
import { clearStorages, getAvatarId } from '../../utils/user'
import { PluginNFTAvatarRPC } from '../../../../plugins/Avatar/messages'
import { useLocation, useWindowSize } from 'react-use'
import { NFTBadge } from '../../../../plugins/Avatar/SNSAdaptor/NFTBadge'
import { activatedSocialNetworkUI } from '../../../../social-network'
import { max } from 'lodash-unified'
import { rainbowBorderKeyFrames } from '../../../../plugins/Avatar/SNSAdaptor/RainbowBox'
import { delay } from '@dimensiondev/kit'

export function injectNFTAvatarInInstagram(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchInstagramAvatarSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<NFTAvatarInInstagram />)
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
    const wallet = useWallet()
    const [avatar, setAvatar] = useState<AvatarMetaDB>()

    const identity = useCurrentVisitingIdentity()
    const location = useLocation()
    const { value: _avatar } = useNFTAvatar(identity.identifier.userId, RSS3_KEY_SNS.INSTAGRAM)
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
        const watcher = new MutationObserverWatcher(searchInstagramAvatarUploadLoadingSelector())
            .addListener('onRemove', async () => {
                const storages = InMemoryStorages.InstagramNFTEvent.storage

                if (!wallet) return

                if (storages.address.value && storages.userId.value && storages.tokenId.value) {
                    try {
                        await delay(1000)

                        const url = `${location.protocol}//${location.host}/${identity.identifier.userId}`

                        const response = await fetch(url)
                        const htmlString = await response.text()

                        const html = document.createElement('html')
                        html.innerHTML = htmlString

                        const metaTag = html.querySelector<HTMLMetaElement>('meta[property="og:image"]')

                        if (!metaTag?.content) return

                        const avatarInfo = await PluginNFTAvatarRPC.saveNFTAvatar(
                            wallet.address,
                            {
                                userId: storages.userId.value,
                                tokenId: storages.tokenId.value,
                                address: storages.address.value,
                                avatarId: getAvatarId(metaTag.content),
                            } as AvatarMetaDB,
                            identity.identifier.network,
                            RSS3_KEY_SNS.INSTAGRAM,
                        )

                        if (!avatarInfo) {
                            clearStorages()
                            setAvatar(undefined)
                            window.alert('Sorry, failed to save NFT Avatar. Please set again.')
                            return
                        }

                        setAvatar(avatarInfo)
                        clearStorages()
                        await PluginNFTAvatarRPC.clearCache(
                            identity.identifier.userId,
                            activatedSocialNetworkUI.networkIdentifier,
                            RSS3_KEY_SNS.INSTAGRAM,
                        )
                        // If the avatar is set successfully, reload the page
                        window.location.reload()
                    } catch (error: any) {
                        clearStorages()
                        setAvatar(undefined)
                        window.alert(error.message)
                        return
                    }
                }
            })
            .startWatch({
                childList: true,
                subtree: true,
                attributes: true,
            })

        return () => {
            watcher.stopWatch()
        }
    }, [identity, wallet])

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

    useEffect(() => setAvatar(_avatar), [_avatar, location])

    if (!avatar || !size || !showAvatar) return null

    return (
        <NFTBadge
            hasRainbow={false}
            avatar={avatar}
            size={size}
            classes={{ root: classes.root, text: classes.text, icon: classes.icon }}
        />
    )
}
