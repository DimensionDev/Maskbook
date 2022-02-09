import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { searchFacebookAvatarOnMobileSelector, searchFacebookAvatarSelector } from '../../utils/selector'
import { createReactRootShadowed, MaskMessages, startWatch } from '../../../../utils'
import { useEffect, useMemo, useState } from 'react'
import type { NFTAvatarEvent } from '@masknet/shared-base'
import { pickBy } from 'lodash-unified'
import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI'
import { useAsync, useLocation, useWindowSize } from 'react-use'
import { useWallet } from '@masknet/plugin-infra'
import type { AvatarMetaDB } from '../../../../plugins/Avatar/types'
import { PluginNFTAvatarRPC } from '../../../../plugins/Avatar/messages'
import { getAvatarId } from '../../utils/user'
import { useNFTAvatar } from '../../../../plugins/Avatar/hooks'
import { NFTBadge } from '../../../../plugins/Avatar/SNSAdaptor/NFTBadge'
import { makeStyles } from '@masknet/theme'
import { isMobileFacebook } from '../../utils/isMobile'

export function injectNFTAvatarInFacebook(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchFacebookAvatarSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<NFTAvatarInFacebook />)

    // mobile
    const mobileWatcher = new MutationObserverWatcher(searchFacebookAvatarOnMobileSelector())
    startWatch(mobileWatcher, signal)
    createReactRootShadowed(mobileWatcher.firstDOMProxy.afterShadow, { signal }).render(<NFTAvatarInFacebook />)
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

function NFTAvatarInFacebook() {
    const { classes } = useStyles()
    const wallet = useWallet()
    const [avatar, setAvatar] = useState<AvatarMetaDB>()
    const identity = useCurrentVisitingIdentity()
    const location = useLocation()
    const { value: _avatar } = useNFTAvatar(identity.identifier.userId)

    const [NFTEvent, setNFTEvent] = useState<NFTAvatarEvent>()

    const windowSize = useWindowSize()
    const showAvatar = useMemo(() => {
        if (isMobileFacebook) {
            const node = searchFacebookAvatarOnMobileSelector().closest<HTMLDivElement>(1).evaluate()

            if (node) {
                node.style.position = 'relative'
            }
        }
        return getAvatarId(identity.avatar ?? '') === avatar?.avatarId
    }, [avatar?.avatarId, identity.avatar, isMobileFacebook])

    const size = useMemo(() => {
        const ele = isMobileFacebook
            ? searchFacebookAvatarOnMobileSelector().evaluate()
            : searchFacebookAvatarSelector().evaluate()
        if (ele) {
            const style = window.getComputedStyle(ele)
            return Number.parseInt(style.width.replace('px', '') ?? 0, 10)
        }
        return 0
    }, [windowSize, isMobileFacebook])

    useEffect(() => {
        return MaskMessages.events.NFTAvatarUpdated.on((data) =>
            setNFTEvent((prev) => {
                if (!prev) return data
                return { ...prev, ...pickBy<NFTAvatarEvent>(data, (item) => !!item) }
            }),
        )
    }, [])

    useAsync(async () => {
        if (!wallet) return
        if (_avatar) return
        if (!NFTEvent?.address || !NFTEvent?.tokenId) {
            setAvatar(undefined)
            return
        }

        try {
            const avatarInfo = await PluginNFTAvatarRPC.saveNFTAvatar(
                wallet.address,
                { ...NFTEvent, avatarId: getAvatarId(identity.avatar ?? '') } as AvatarMetaDB,
                identity.identifier.network,
            )
            if (!avatarInfo) {
                setNFTEvent(undefined)
                setAvatar(undefined)
                window.alert('Sorry, failed to save NFT Avatar. Please set again.')
                return
            }

            setAvatar(avatarInfo)

            setNFTEvent(undefined)
        } catch (error: any) {
            setNFTEvent(undefined)
            setAvatar(undefined)
            window.alert(error.message)
            return
        }
    }, [identity.avatar])

    useEffect(() => setAvatar(_avatar), [_avatar, location])

    if (!avatar || !size || !showAvatar) return null

    return (
        <NFTBadge
            avatar={avatar}
            size={size}
            classes={{ root: classes.root, text: classes.text, icon: classes.icon }}
        />
    )
}
