import { createReactRootShadowed, MaskMessages, NFTAvatarEvent, startWatch } from '../../../../utils'
import { searchTwitterAvatarLinkSelector, searchTwitterAvatarSelector } from '../../utils/selector'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@masknet/theme'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI'
import { resolveOpenSeaLink, useWallet } from '@masknet/web3-shared-evm'
import type { AvatarMetaDB } from '../../../../plugins/Avatar/types'
import { getAvatarId } from '../../utils/user'
import { PluginNFTAvatarRPC } from '../../../../plugins/Avatar/messages'
import { NFTBadge } from '../../../../plugins/Avatar/SNSAdaptor/NFTBadge'
import { NFTAvatar } from '../../../../plugins/Avatar/SNSAdaptor/NFTAvatar'
import { useAsync, useLocation, useUpdateEffect, useWindowSize } from 'react-use'
import { rainbowBorderKeyFrames } from '../../../../plugins/Avatar/SNSAdaptor/RainbowBox'
import { trim } from 'lodash-unified'
import { RSS3_KEY_SNS } from '../../../../plugins/Avatar/constants'
import { openWindow } from '@masknet/shared-base-ui'
import { usePersonaNFTAvatar } from '../../../../plugins/Avatar/hooks/usePersonaNFTAvatar'

export function injectNFTAvatarInTwitter(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchTwitterAvatarSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<NFTAvatarInTwitter />)
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

function NFTAvatarInTwitter() {
    const rainBowElement = useRef<Element | null>()
    const borderElement = useRef<Element | null>()
    const identity = useCurrentVisitingIdentity()
    const wallet = useWallet()
    const { value: _avatar } = usePersonaNFTAvatar(
        identity.identifier?.userId ?? '',
        getAvatarId(identity.avatar ?? ''),
        RSS3_KEY_SNS.TWITTER,
    )
    const [avatar, setAvatar] = useState<AvatarMetaDB | undefined>()
    const windowSize = useWindowSize()
    const location = useLocation()

    const showAvatar = useMemo(
        () => getAvatarId(identity.avatar ?? '') === avatar?.avatarId && avatar.avatarId,
        [avatar?.avatarId, identity.avatar],
    )

    const size = useMemo(() => {
        const ele = searchTwitterAvatarSelector().evaluate()?.querySelector('img')
        if (ele) {
            const style = window.getComputedStyle(ele)
            return Number.parseInt(style.width.replace('px', '') ?? 0, 10)
        }
        return 0
    }, [windowSize, location])

    const { classes } = useStyles()

    const [NFTEvent, setNFTEvent] = useState<NFTAvatarEvent>()
    const onUpdate = (data: NFTAvatarEvent) => {
        setNFTEvent(data)
    }

    // After the avatar is set, it cannot be saved immediately, and must wait until the avatar of twitter is updated
    useAsync(async () => {
        if (!wallet || !NFTAvatar) return
        if (!identity.identifier) return

        if (!NFTEvent?.address || !NFTEvent?.tokenId) {
            setAvatar(undefined)
            MaskMessages.events.NFTAvatarTimelineUpdated.sendToAll({
                userId: identity.identifier.userId,
                avatarId: getAvatarId(identity.avatar ?? ''),
                address: '',
                tokenId: '',
            })
            return
        }

        const avatar = await PluginNFTAvatarRPC.saveNFTAvatar(
            wallet.address,
            {
                ...NFTEvent,
                avatarId: getAvatarId(identity.avatar ?? ''),
            } as AvatarMetaDB,
            identity.identifier.network,
            RSS3_KEY_SNS.TWITTER,
        ).catch((error) => {
            setNFTEvent(undefined)
            setAvatar(undefined)
            window.alert(error.message)
            return
        })
        if (!avatar) {
            setNFTEvent(undefined)
            setAvatar(undefined)
            window.alert('Sorry, failed to save NFT Avatar. Please set again.')
            return
        }

        setAvatar(avatar)
        MaskMessages.events.NFTAvatarTimelineUpdated.sendToAll(
            avatar ?? {
                userId: identity.identifier.userId,
                avatarId: getAvatarId(identity.avatar ?? ''),
                address: '',
                tokenId: '',
            },
        )

        setNFTEvent(undefined)
    }, [identity.avatar])

    useEffect(() => {
        setAvatar(_avatar)
    }, [_avatar])

    useEffect(() => {
        return MaskMessages.events.NFTAvatarUpdated.on((data) => onUpdate(data))
    }, [onUpdate])

    useEffect(() => {
        if (!showAvatar) return
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
                    animation: ${rainbowBorderKeyFrames.name} 6s linear infinite;
                    box-shadow: 0 5px 15px rgba(0, 248, 255, 0.4), 0 10px 30px rgba(37, 41, 46, 0.2);
                    transition: none;
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
                rainBowElement.current?.classList.remove('rainbowBorder')
            }
        }
    }, [location.pathname, showAvatar])

    useUpdateEffect(() => {
        if (
            location.pathname &&
            location.pathname.split('/').length === 2 &&
            trim(location.pathname, '/') !== identity.identifier?.userId
        ) {
            setAvatar(undefined)
        }
    }, [location, identity])

    useUpdateEffect(() => {
        const linkParentDom = searchTwitterAvatarLinkSelector().evaluate()?.closest('div')
        if (!avatar || !linkParentDom || !showAvatar) return

        const handler = () => {
            openWindow(resolveOpenSeaLink(avatar.address, avatar.tokenId, avatar.chainId))
        }

        linkParentDom.addEventListener('click', handler)

        return () => {
            linkParentDom.removeEventListener('click', handler)
        }
    }, [avatar])

    if (!avatar || !size) return null

    return (
        <>
            {showAvatar ? (
                <NFTBadge
                    borderSize={5}
                    hasRainbow
                    avatar={avatar}
                    size={size}
                    width={15}
                    classes={{ root: classes.root, text: classes.text, icon: classes.icon }}
                />
            ) : null}
        </>
    )
}
