import { createReactRootShadowed, MaskMessages, NFTAvatarEvent, startWatch } from '../../../../utils'
import { searchTwitterAvatarLinkSelector, searchTwitterAvatarSelector } from '../../utils/selector'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@masknet/theme'
import { useState, useEffect } from 'react'

import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI'
import { useWallet } from '@masknet/web3-shared-evm'
import type { AvatarMetaDB } from '../../../../plugins/Avatar/types'
import { useNFTAvatar } from '../../../../plugins/Avatar/hooks'
import { getAvatarId } from '../../utils/user'
import { PluginNFTAvatarRPC } from '../../../../plugins/Avatar/messages'
import { NFTBadge } from '../../../../plugins/Avatar/SNSAdaptor/NFTBadge'
import { NFTAvatar } from '../../../../plugins/Avatar/SNSAdaptor/NFTAvatar'

const offset = 10
export function injectNFTAvatarInTwitter(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchTwitterAvatarSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<NFTAvatarInTwitter />)
}

interface StyleProps {
    width: number
    size: number
}

const useStyles = makeStyles<StyleProps>()((theme, props) => ({
    root: {
        position: 'absolute',
        bottom: '-10px !important',
        textAlign: 'center',
        color: 'white',
        minWidth: 134,
        zIndex: 2,

        left: -1 * props.width + offset / 2,
        top: -1 * props.width + offset / 2,
        width: props.size,
        height: props.size,

        [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
            left: -27,
            top: -1 * props.width,
        },
    },
    update: {
        position: 'absolute',
        bottom: '-10px !important',
        left: 55,
        textAlign: 'center',
        color: 'white',
        minWidth: 134,
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
    const identity = useCurrentVisitingIdentity()
    const wallet = useWallet()
    const { value: _avatar } = useNFTAvatar(identity.identifier.userId)
    const [avatar, setAvatar] = useState<AvatarMetaDB | undefined>()
    const ele = searchTwitterAvatarLinkSelector().evaluate()
    let size = 170
    const width = 15
    if (ele) {
        const style = window.getComputedStyle(ele)
        size = Number(style.width.replace('px', '') ?? 0) - Number(style.borderWidth.replace('px', '') ?? 0) - offset
    }
    const { classes } = useStyles({ size: size + width * 2, width })

    const [NFTEvent, setNFTEvent] = useState<NFTAvatarEvent>()
    const onUpdate = (data: NFTAvatarEvent) => {
        setNFTEvent(data)
    }

    useEffect(() => {
        if (!wallet || !NFTAvatar) return

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

        PluginNFTAvatarRPC.saveNFTAvatar(wallet.address, {
            ...NFTEvent,
            avatarId: getAvatarId(identity.avatar ?? ''),
        } as AvatarMetaDB).then((avatar: AvatarMetaDB | undefined) => {
            setAvatar(avatar)
            MaskMessages.events.NFTAvatarTimelineUpdated.sendToAll(
                avatar ?? {
                    userId: identity.identifier.userId,
                    avatarId: getAvatarId(identity.avatar ?? ''),
                    address: '',
                    tokenId: '',
                },
            )
        })
        setNFTEvent(undefined)
    }, [identity.avatar])

    useEffect(() => {
        setAvatar(_avatar)
    }, [_avatar])

    useEffect(() => {
        return MaskMessages.events.NFTAvatarUpdated.on((data) => onUpdate(data))
    }, [onUpdate])

    useEffect(() => {
        if (!avatar || !avatar.avatarId) return
        if (getAvatarId(identity.avatar ?? '') !== avatar.avatarId) return
        const avatarDom = searchTwitterAvatarSelector().evaluate()?.parentElement
        if (avatarDom) {
            avatarDom.style.marginBottom = '10px'
            avatarDom.style.overflow = 'unset'
        }

        const backgroundImgDom = searchTwitterAvatarSelector().evaluate()?.firstChild?.nextSibling?.firstChild
            ?.firstChild as HTMLElement
        if (backgroundImgDom) {
            backgroundImgDom.style.borderRadius = '100%'
        }
    }, [identity, avatar, searchTwitterAvatarSelector, searchTwitterAvatarSelector])

    if (!avatar) return null

    const avatarParent = searchTwitterAvatarSelector().closest(2).evaluate() as HTMLElement
    if (avatarParent) avatarParent.style.clipPath = 'unset'

    return (
        <>
            {getAvatarId(identity.avatar ?? '') === avatar.avatarId && avatar.avatarId ? (
                <NFTBadge
                    avatar={avatar}
                    size={size}
                    width={15}
                    classes={{ root: classes.root, text: classes.text, icon: classes.icon }}
                />
            ) : null}
        </>
    )
}
